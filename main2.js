import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const blenderSceneElement = document.getElementById('blenderScene');

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.setClearColor(0x000000);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

// Set renderer size to match the blenderScene div's size
renderer.setSize(blenderSceneElement.clientWidth, blenderSceneElement.clientHeight);
blenderSceneElement.appendChild(renderer.domElement);

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(45, blenderSceneElement.clientWidth / blenderSceneElement.clientHeight, 1, 1000);
camera.position.set(4, 5, 11);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.enablePan = false;
controls.minDistance = 250;
controls.maxDistance = 20;
controls.minPolarAngle = 0.5;
controls.maxPolarAngle = 1.5;
controls.autoRotate = false;
controls.target = new THREE.Vector3(0, 1, 0);
controls.update();

// Create ground
const groundGeometry = new THREE.PlaneGeometry(20000, 200000, 32, 32);
groundGeometry.rotateX(-Math.PI / 2);
const groundMaterial = new THREE.MeshStandardMaterial({
    color: 0x555555,
    side: THREE.DoubleSide
});
const groundMesh = new THREE.Mesh(groundGeometry, groundMaterial);
groundMesh.castShadow = true;
groundMesh.receiveShadow = false;
groundMesh.position.y = 0;
scene.add(groundMesh);

// Create hemisphere light
const hemiLight = new THREE.HemisphereLight(0xffffff, 0x000000, 1);
hemiLight.position.set(0, 50, 0); // Position is not important for HemisphereLight
scene.add(hemiLight);

// Create directional light
const dirLight = new THREE.DirectionalLight(0xffffff, 3);
dirLight.position.set(5, 10, 7.5); // Adjust the position as needed
dirLight.castShadow = false;
dirLight.shadow.mapSize.width = 2048;  // Adjust for your needs
dirLight.shadow.mapSize.height = 2048; // Adjust for your needs
dirLight.shadow.camera.near = 0.5;     // Adjust for your needs
dirLight.shadow.camera.far = 500;      // Adjust for your needs

// Set up shadow properties for the directional light
dirLight.shadow.camera.left = -50;
dirLight.shadow.camera.right = 50;
dirLight.shadow.camera.top = 50;
dirLight.shadow.camera.bottom = -50;

hemiLight.visible = false;
dirLight.visible = true;


scene.add(dirLight);

// GLTF Loader
const loader = new GLTFLoader().setPath('spider/');
let mixer; // Animation mixer
const animations = {}; // Store animations

loader.load('spiderr.gltf', (gltf) => {
    const mesh = gltf.scene;
    mesh.traverse((child) => {
        if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
        }
    });

    mesh.position.set(0, 1.05, -1);
    scene.add(mesh);

    // Initialize the mixer
    mixer = new THREE.AnimationMixer(mesh);

    // Store animations in the dictionary
    gltf.animations.forEach((clip) => {
        animations[clip.name] = mixer.clipAction(clip);
    });

    // Play a specific animation
    animations['ArmatureAction'].play();
    animations['Armature.001Action'].play();
    animations['Armature.002Action'].play();
    animations['Armature.003Action'].play();
    animations['Armature.004Action'].play();
    animations['Armature.005Action'].play();

    document.getElementById('progress-container').style.display = 'none';
}, (xhr) => {
    document.getElementById('progress').innerHTML = `LOADING ${Math.max(xhr.loaded / xhr.total, 1) * 100}/100`;
}, (error) => {
    console.error('An error happened', error);
});

// Clock for animation updates
const clock = new THREE.Clock();

function animate() {
    requestAnimationFrame(animate);

    // Update the mixer
    const delta = clock.getDelta();
    if (mixer) mixer.update(delta);

    // Update controls
    controls.update();

    // Render the scene
    renderer.render(scene, camera);
}

animate();

// Handle window resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
