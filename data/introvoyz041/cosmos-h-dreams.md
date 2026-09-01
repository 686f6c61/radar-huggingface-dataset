# introvoyz041/Cosmos-H-Dreams

## Resumen

Cosmos-H-Dreams es un modelo de mundo quirurgico generativo y condicionado por acciones, desarrollado por NVIDIA dentro de la iniciativa Isaac for Healthcare. Permite que un operador humano o una politica de robotica quirurgica actue dentro de una escena quirurgica sintetizada y observe las interacciones en tiempo real. Dado un frame de contexto quirurgico y un flujo de acciones cinematicas del robot, el modelo genera autoregresivamente el video futuro resultante en bloques cortos, transmitiendo de forma interactiva en una unica GPU.

A diferencia del modelo bidireccional y offline Cosmos-H-Surgical-Simulator, Cosmos-H-Dreams es un estudiante causal destilado con auto-forzado de pocos pasos: se destila de un profesor bidireccional para convertirse en un modelo de streaming que responde inmediatamente a las acciones, transformando un generador de video pasivo en un simulador quirurgico controlable. El checkpoint publicado esta especializado en sutura de mesa da Vinci Research Kit (dVRK).

El modelo deriva del modelo fundacional de mundo Cosmos-Predict2.5-2B de NVIDIA para IA fisica, y su profesor se inicializa en caliente desde Cosmos-H-Surgical-Simulator (checkpoint condicionado por acciones Open-H 44D). Esta listo para uso comercial o no comercial bajo la NVIDIA Open Model License. El checkpoint disponible en este repositorio es una publicacion de terceros (introvoyz041) que replica el modelo oficial de NVIDIA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Transformer (DiT) con cross-attention, destilado en estudiante causal autoregresivo con cache KV de streaming |
| Parametros totales | 2 mil millones (2B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | Modelo de video: procesa frames latentes; entrenamiento progresivo hasta 73 frames por rollout |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo puramente visual, sin soporte textual explicito) |
| Licencia | NVIDIA Open Model License |
| Formato de pesos | no disponible (repositorio de 4,4 GB, libreria nv-medtech) |

## Arquitectura y entrenamiento

Cosmos-H-Dreams se basa en Cosmos-Predict2.5-2B-Video2World, un transformer de difusion de 2B parametros para generacion de video en espacio latente. Utiliza el tokenizador de video Wan2.1 con compresion espacial 8x, compresion temporal 4x y 16 canales latentes. La red tiene ancho oculto de 2048, 28 bloques, 16 cabezas, parcheado espacial 2x2, embeddings posicionales rotatorios, modulacion AdaLN-LoRA y cross-attention con el codificador de texto Cosmos-Reason. Dos pequenos MLP condicionan el modelo sobre acciones cinematicas a traves de la via de modulacion timestep/AdaLN.

El modelo consume un vector de accion unificado de 44 dimensiones; cada frame latente pliega las 4 acciones que le corresponden en una entrada de 4 x 44 = 176 dimensiones. El espacio de acciones unificado permite que un subconjunto de las 44 dimensiones transporte el contenido nativo de un embodiment mientras el resto se rellena con ceros, manteniendo los pesos invariantes al embodiment y al horizonte. El checkpoint dVRK publicado usa un vector de contenido de doble brazo de 20 dimensiones (por manipulador: delta de traslacion 3D, rotacion continua 6D y valor de pinza) rellenado con ceros hasta 44D.

El entrenamiento se realiza en dos etapas sobre el mismo backbone: un profesor bidireccional que aprende la dinamica quirurgica condicionada por acciones (inicializado en caliente desde el checkpoint Open-H 44D de Cosmos-H-Surgical-Simulator y ajustado en los datos objetivo, opcionalmente con horizontes temporales progresivamente mas largos: 13, 25, 49 y 73 frames) y un estudiante causal destilado con auto-forzado de pocos pasos. El dataset utilizado es nvidia/PhysicalAI-Robotics-Open-H-Embodiment.

## Capacidades

- Generacion de video condicionada por acciones en tiempo real (pipeline image-to-video).
- Simulacion quirurgica interactiva: un operador humano o una politica aprendida puede actuar dentro de la escena sintetizada y observar las consecuencias al instante.
- Generacion autoregresiva en bloques cortos con cache KV de streaming, lo que permite latencia baja frente a modelos bidireccionales offline.
- Control por teclado de navegador o Meta Quest headset, segun la capa de servidor de streaming.
- Evaluacion en bucle cerrado de politicas de robotica quirurgica (VLA) en un entorno simulado.
- Generacion de datos sinteticos de video quirurgico condicionados por acciones.
- Especializacion en sutura de mesa da Vinci Research Kit (dVRK) con espacio de acciones de doble brazo de 20 dimensiones.
- Inferencia en una unica GPU con despliegue via WebRTC sobre la libreria FlashDreams de NVIDIA.

## Casos de uso

- Ensayo de habilidades quirurgicas en tiempo real: un cirujano o residente puede practicar sutura en un entorno sintetico interactivo, observando las consecuencias de sus acciones al instante gracias a la generacion autoregresiva en streaming.
- Demostracion interactiva: el modelo puede ser conducido en vivo por un humano mediante teclado de navegador o Meta Quest, permitiendo demostraciones de procedimientos quirurgicos sin necesidad de un robot fisico.
- Evaluacion en bucle cerrado de politicas de robotica: las politicas de robotica quirurgica pueden ser evaluadas en un entorno simulado cerrado, donde el modelo genera el video resultante de las acciones de la politica en tiempo real, sin riesgo para pacientes ni equipamiento.
- Generacion de datos sinteticos: el modelo puede producir secuencias de video quirurgico sintetico condicionadas por acciones, utiles para aumentar datasets de entrenamiento de modelos de robotica y reducir la dependencia de datos clinicos reales.
- Formacion de cirujanos: permite a los trainees experimentar con escenarios quirurgicos variados sin riesgo para pacientes ni necesidad de equipamiento fisico, con realimentacion visual inmediata.
- Investigacion en modelos de mundo fisico: sirve como plataforma para estudiar la dinamica quirurgica y la interaccion tejido-herramienta en entornos simulados, asi como para validar tecnicas de destilacion profesor-estudiante en dominios de alta precision.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Inferencia en una unica GPU, segun la model card oficial.
- VRAM estimada: no disponible.
- GPU recomendadas: no especificadas en la documentacion; al tratarse de un modelo de 2B parametros, es plausible su ejecucion en GPUs consumer de gama alta (RTX 4090 con 24 GB) o profesionales (A100, L40S), aunque no se confirma oficialmente.
- Despliegue: servidor de streaming basado en la libreria NVIDIA FlashDreams, con transmision via WebRTC.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Contexto | Licencia |
|---|---|---|---|---|
| Cosmos-H-Dreams | 2B | DiT causal destilado, streaming en tiempo real | Hasta 73 frames por rollout | NVIDIA Open Model License |
| Cosmos-H-Surgical-Simulator | 2B (base) | DiT bidireccional, offline | no disponible | NVIDIA Open Model License |
| Cosmos-Predict2.5-2B | 2B | DiT de video, modelo de mundo generalista | no disponible | NVIDIA Open Model License |

Cosmos-H-Dreams se diferencia de su profesor Cosmos-H-Surgical-Simulator en que es causal y de streaming, respondiendo inmediatamente a las acciones, mientras que el profesor es bidireccional y opera offline. Frente a Cosmos-Predict2.5-2B, el modelo base, anade el condicionamiento por acciones cinematicas de 44D y la especializacion en el dominio quirurgico dVRK.

## Limitaciones y advertencias

- Especializado exclusivamente en sutura de mesa dVRK; no es un modelo generalista de video, robotica ni simulacion fisica.
- El espacio de acciones unificado de 44D requiere relleno con ceros para embodiments con menos dimensiones, lo que puede limitar la expresividad en tareas fuera del dominio entrenado.
- No se han publicado datos sobre sesgos, alucinaciones visuales o robustez ante distribuciones fuera del dominio quirurgico.
- La NVIDIA Open Model License puede imponer restricciones especificas de uso comercial; se recomienda revisar el texto completo de la licencia antes de su despliegue en produccion.
- Este repositorio es una publicacion de terceros (introvoyz041) que replica el modelo oficial de NVIDIA; se recomienda verificar la integridad de los pesos y contrastar con el repositorio oficial antes de su uso.
- No se especifican idiomas soportados ni capacidades de texto; es un modelo puramente visual sin interfaz de lenguaje natural.
- La generacion de video en streaming puede presentar inestabilidades en rollouts largos, aunque el entrenamiento progresivo hasta 73 frames busca mitigar este riesgo.

## Enlaces

- Repositorio HuggingFace (publicacion de terceros): https://huggingface.co/introvoyz041/Cosmos-H-Dreams
- Repositorio HuggingFace oficial: https://huggingface.co/nvidia/Cosmos-H-Dreams
- GitHub: https://github.com/isaac-for-healthcare/Cosmos-H-Dreams
- Paper arXiv (2608.24199): https://arxiv.org/abs/2608.24199
- Referencia Cosmos (arXiv:2511.00062): https://doi.org/10.48550/arXiv.2511.00062
- Modelo profesor Cosmos-H-Surgical-Simulator: https://huggingface.co/nvidia/Cosmos-H-Surgical-Simulator
- Modelo base Cosmos-Predict2.5-2B: https://huggingface.co/nvidia/Cosmos-Predict2.5-2B
- Dataset Open-H Embodiment: https://huggingface.co/datasets/nvidia/PhysicalAI-Robotics-Open-H-Embodiment
- Pagina Isaac for Healthcare: https://isaac-for-healthcare.github.io/medical-physics-simulation/cosmos_h_dreams/
- Licencia NVIDIA Open Model: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-open-model-license/
