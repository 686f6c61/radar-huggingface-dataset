# bamboo51/act_crane_topwrist

## Resumen

`bamboo51/act_crane_topwrist` es una política de control robótico basada en ACT (Action Chunking with Transformers) que opera un brazo simulado CRANE+ en Gazebo. El modelo aprende por imitación una tarea concreta de pick-and-place: coger una caja de 5 cm y colocarla sobre el techo de un coche de juguete. Lo desarrolla el usuario bamboo51 como trabajo final del curso Physical AI del Matsuo Lab de la Universidad de Tokio, entrenado con la librería LeRobot de Hugging Face.

A diferencia de los modelos de lenguaje, este artefacto no genera texto: es un policy de robótica que consume dos flujos de imagen (cámara cenital fija y cámara de muñeca) más cinco ángulos articulares, y emite cinco objetivos articulares con un horizonte de 0,5 s. Su relevancia es fundamentalmente didáctica y de referencia: ilustra el flujo completo de entrenamiento por imitación con ACT en LeRobot, desde la recogida de demostraciones con un experto scriptado en MoveIt hasta el despliegue vía servidor de políticas y nodo ROS.

El modelo tiene 51.615.365 parámetros (backbone ResNet-18 más transformer ACT), un repositorio de 0,2 GB y licencia Apache 2.0. No es un modelo de propósito general: está especializado en una única tarea, un único layout de escena y un único simulador, y no se ha validado en hardware real.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers): ResNet-18 (init ImageNet) + VAE (latente 32) + transformer encoder-decoder |
| Parámetros totales | 51.615.365 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; ventana de observación por chunk de 50 acciones a 10 Hz) |
| Tipos de cuantización | no disponible (pesos safetensors en precisión de entrenamiento) |
| Idiomas soportados | no aplica (modelo de robótica, sin entrada/salida de texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería lerobot) |

Detalles de arquitectura declarados en la model card: transformer de dimensión 512, 8 cabezas, 4 capas de encoder, 1 capa de decoder y FFN de 3200. Chunk size de 50 con `n_action_steps = 1` en inferencia. Entrada: `observation.images.top` (3×240×320), `observation.images.wrist` (3×240×320) y `observation.state` (5 articulaciones en radianes). Salida: `action` (5 objetivos articulares 0,5 s por delante, K=5 frames a 10 Hz).

## Arquitectura y entrenamiento

ACT es un transformer encoder-decoder que predice secuencias de acciones (chunks) en lugar de acciones individuales, lo que reduce el error de acumulación en tareas de manipulación de precisión. En esta implementación el backbone visual es un ResNet-18 inicializado con ImageNet, combinado con un VAE de latente 32 que modela la variabilidad de las demostraciones humanas/scriptadas, y un transformer de 512 dimensiones con 4 capas de encoder y 1 de decoder. El chunk size es de 50 acciones, aunque en inferencia se ejecuta una acción por paso (`n_action_steps = 1`), con opción de ensamblado temporal (TE=0.01).

El entrenamiento se realizó con LeRobot sobre aproximadamente 70 episodios exitosos del dataset `Phongwit/crane_pick_place_topwrist`, generados por un experto scriptado en MoveIt en escenas aleatorias (posición de la caja muestreada dentro del alcance del brazo; el coche permanece fijo). Se descartaron los frames sin movimiento en los siguientes 0,5 s. Configuración: 20.000 pasos, batch 64, AdamW con lr 1e-5 (backbone 1e-5), weight decay 1e-4, grad clip 10, peso KL 10, sin aumento de imagen, semilla 1000. Las escenas de validación y test están separadas (episodios NPZ en `Phongwit/crane_pick_place_episodes`).

## Capacidades

- Control robótico de pick-and-place en simulación: coger una caja de 5 cm y depositarla sobre el techo de un coche de juguete.
- Fusión multimodal de dos cámaras RGB (cenital y de muñeca) con el estado articular (5 ángulos en radianes).
- Predicción de chunks de acciones con horizonte de 0,5 s a 10 Hz, con soporte de ensamblado temporal para suavizar la ejecución.
- Generalización limitada a la posición de la caja dentro del alcance del brazo; el resto de la escena es fijo.
- Integración con el ecosistema LeRobot y ROS: servidor de políticas (`policy_server.py`) y nodo de inferencia (`infer_node.py`).
- Evaluación automatizada por escena de test mediante `eval_gazebo.py`.
- No soporta tool calling, agentes multi-paso, generación de texto, visión general, audio ni capacidades multilingües.

## Casos de uso

- Docencia y formación en robótica de imitación: sirve como ejemplo completo y reproducible de un pipeline ACT con LeRobot, desde el dataset hasta el despliegue en Gazebo, para cursos de Physical AI.
- Prototipado de políticas de manipulación en simulación: permite validar la integración de cámaras, estado articular y servidor de políticas antes de invertir en hardware real.
- Benchmark interno de infraestructura de inferencia robótica: al tener un formato de entrada/salida estricto y conocido, es útil para medir latencia y estabilidad de servidores de políticas ROS.
- Reproducción de experimentos académicos: base para comparar variantes de ACT (distinto chunk size, ensamblado temporal, aumento de imagen) sobre el mismo dataset y escenas de test.
- Generación de datos sintéticos y aumento de datasets: el experto scriptado y las escenas aleatorias pueden reutilizarse para ampliar demostraciones de pick-and-place.
- Pruebas de regresión en pipelines de CI para robótica: `eval_gazebo.py` permite puntuar automáticamente el modelo en todas las escenas de test, útil como test de no regresión tras cambios en el entorno.
- Referencia para transferencia sim-to-real: aunque no validado en hardware real, documenta decisiones de normalización, tasa de control y formato de acciones que son relevantes al portar políticas ACT a un brazo físico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye tasas de éxito numéricas, métricas de error articular ni comparaciones cuantitativas con otras políticas; solo menciona que existe un script de evaluación (`eval_gazebo.py`) sobre escenas de test reservadas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 51,6 M de parámetros y dos flujos de imagen de 240×320, la huella es reducida y cabe holgadamente en GPUs de consumo (estimación orientativa, no confirmada por el autor).
- GPU recomendadas: cualquier GPU con soporte CUDA suficiente para ResNet-18 y un transformer pequeño; el autor indica que el servidor de políticas se ejecuta en una venv de Python 3.13 con GPU. No se especifican modelos concretos (A100, H100, RTX 4090, etc.).
- Cabe en GPU de consumo: sí, por tamaño de parámetros, aunque el dato no está confirmado explícitamente en la model card.
- Opciones de despliegue: servidor de políticas de LeRobot (`policy_server.py`) y nodo ROS (`infer_node.py`) dentro del contenedor Docker del proyecto con Gazebo en ejecución. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput: tasa de control de 10 Hz; cada objetivo debe alcanzarse en 0,5 s (`time_from_start = 0.5 s`). No se publican cifras de latencia por inferencia ni throughput.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto / horizonte | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `bamboo51/act_crane_topwrist` | ACT (ResNet-18 + transformer) | 51,6 M | chunk de 50 acciones a 10 Hz | Pick-and-place CRANE+ en Gazebo | Apache 2.0 | Hugging Face (lerobot) |
| ACT original (Zhao et al., RSS 2023) | ACT | no disponible en la información | no disponible | Manipulación bimanual de bajo coste | no disponible en la información | Paper y código de referencia |
| Otras políticas LeRobot del mismo ecosistema | diversas (ACT, Diffusion Policy, etc.) | no disponible | no disponible | Tareas de manipulación simuladas y reales | variable | Hugging Face (lerobot) |

No se dispone de datos cuantitativos para comparar rendimiento con alternativas; la comparación anterior es únicamente cualitativa y basada en la información proporcionada.

## Limitaciones y advertencias

- Solo simulación: entrenado y evaluado en Gazebo con iluminación y texturas fijas; no se ha probado en un brazo real.
- Una única tarea y un único layout: el coche siempre está en la misma posición y solo varía la posición de la caja; otros objetos, posiciones del coche o poses de cámara quedan fuera de distribución.
- Dataset pequeño (unas 70 épocas) generado por un único experto determinista, por lo que la recuperación ante errores es limitada.
- Formato de entrada estricto: las cámaras deben ser RGB de 320×240 con los nombres exactos y las acciones deben enviarse como objetivos a 0,5 s; de lo contrario el brazo se mueve a velocidad incorrecta.
- La acción del gripper es el ángulo comandado (cerrar = +10°), no el ángulo donde se detuvieron los dedos, lo que puede confundir en integraciones.
- Riesgo de sobreajuste al entorno simulado y a la distribución de escenas de entrenamiento; no hay evidencia de robustez ante cambios de iluminación, texturas u oclusiones.
- No se documentan sesgos sociales (no procesa lenguaje ni datos personales), pero sí un sesgo de dominio claro hacia la simulación y la tarea concreta.
- Licencia Apache 2.0: permite uso comercial y modificación, pero el modelo depende de un dataset y un experto scriptado concretos; verificar la licencia del dataset (`Phongwit/crane_pick_place_topwrist`) antes de reutilizarlo en producción.
- El servidor de políticas requiere la carpeta `meta/` del dataset en `lerobot_data/crane_pick_place/meta/`, un requisito de despliegue fácil de pasar por alto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/bamboo51/act_crane_topwrist
- Dataset de entrenamiento: https://huggingface.co/datasets/Phongwit/crane_pick_place_topwrist
- Episodios de validación y test (NPZ): https://huggingface.co/datasets/Phongwit/crane_pick_place_episodes
- Código del proyecto: https://github.com/bamboo51/Arm-Robot-Picking
- Paper de ACT (Zhao et al., RSS 2023): https://arxiv.org/abs/2304.13705
- LeRobot (Hugging Face): https://github.com/huggingface/lerobot
- Curso Physical AI del Matsuo Lab (material de entrenamiento): https://github.com/matsuolab/pai_training
