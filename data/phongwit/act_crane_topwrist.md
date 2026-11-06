# Phongwit/act_crane_topwrist

## Resumen
ACT para CRANE+ es una política de imitación basada en Action Chunking with Transformers (ACT) que controla un brazo robótico simulado CRANE+ en Gazebo. La tarea es concreta: recoger una caja de 5 cm y colocarla sobre el techo de un coche de juguete. El modelo recibe dos cámaras (vista cenital fija y cámara de muñeca) más los cinco ángulos articulares, y emite cinco objetivos articulares 0,5 s en el futuro. Lo desarrolla Phongwit como trabajo final del curso Physical AI del Matsuo Lab (Universidad de Tokio) y se entrenó con LeRobot sobre unas 70 demostraciones de un experto scriptado con MoveIt.

Técnicamente es un transformer compacto (51,6 M de parámetros) con backbone ResNet-18 y un VAE de latente 32, entrenado con chunking de acciones de tamaño 50. No es un modelo de lenguaje: es un controlador visomotor de robótica, por lo que sus "capacidades" se limitan a la manipulación pick-and-place en el entorno simulado descrito.

Su relevancia es la de un artefacto reproducible y didáctico: código abierto, licencia Apache 2.0, integración completa con LeRobot y ROS, y un pipeline de evaluación en Gazebo. Sirve como referencia para quien quiera replicar un flujo ACT de extremo a extremo, no como componente listo para producción real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers): backbone ResNet-18 (init ImageNet) + VAE (latente 32) + transformer encoder-decoder |
| Parametros totales | 51.615.365 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible; chunk de 50 acciones a 10 Hz (horizonte de predicción de 5 s, ejecución de 1 paso por defecto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería LeRobot) |

## Arquitectura y entrenamiento
ACT combina un codificador visual ResNet-18 preentrenado en ImageNet con un VAE (latente de 32 dimensiones) que modela la variabilidad de las demostraciones, y un transformer con dimensión 512, 8 cabezas, 4 capas de encoder, 1 capa de decoder y FFN de 3200. El modelo predice chunks de 50 acciones (a 10 Hz), aunque en inferencia se ejecuta `n_action_steps = 1` por defecto, con opción de ensamblado temporal (TE=0.01). La entrada son dos imágenes de 3×240×320 (`observation.images.top` y `observation.images.wrist`) y el estado de 5 articulaciones; la salida son 5 objetivos articulares 0,5 s por delante.

El entrenamiento usó 20.000 pasos con batch 64, optimizador AdamW con lr 1e-5 (también en el backbone), weight decay 1e-4, grad clip 10 y peso KL de 10, sin augmentación de imagen y con semilla 1000. Los datos provienen del dataset `Phongwit/crane_pick_place_topwrist`: unas 70 episodios exitosos de un experto MoveIt scriptado en escenas aleatorias (posición de la caja muestreada dentro del alcance del brazo; el coche fijo). Se descartaron los frames sin movimiento en los siguientes 0,5 s y se reservaron escenas de validación y test en episodios NPZ separados.

## Capacidades
- Control visomotor de manipulación pick-and-place en simulación Gazebo con el brazo CRANE+.
- Percepción multi-cámara: vista cenital fija y cámara de muñeca, ambas a 320×240 RGB.
- Predicción de trayectorias articulares en chunks de 50 acciones con horizonte de 0,5 s por objetivo.
- Generalización limitada a la posición de la caja dentro del alcance del brazo.
- Integración con LeRobot para carga de políticas y pre/postprocesado de normalización.
- Servidor de política (`policy_server.py`) y nodo ROS (`infer_node.py`) para despliegue en el lazo de control.
- Evaluación automática en todas las escenas de test (`eval_gazebo.py`).
- No soporta tool calling, agentes, razonamiento multi-paso, visión general, audio ni capacidades multilingües.

## Casos de uso
- Replicación didáctica de un pipeline ACT completo: sirve para estudiar el flujo LeRobot + ROS + Gazebo desde la descarga del checkpoint hasta la evaluación, con código y datos públicos.
- Benchmark interno de manipulación pick-and-place: al tener escenas de test reservadas y un script de evaluación, permite comparar variantes de política sobre la misma tarea y layout.
- Prueba de integración de servidores de política: `policy_server.py` expone el modelo por red y el nodo ROS consume las acciones, útil para validar arquitecturas de inferencia desacoplada.
- Estudio de ensamblado temporal en ACT: el parámetro TE=0.01 permite experimentar con temporal ensembling sobre chunks de 50 acciones sin reentrenar.
- Base para fine-tuning con nuevas demostraciones: el checkpoint y la receta de entrenamiento (20k pasos, batch 64, lr 1e-5) son un punto de partida para tareas de pick-and-place similares.
- Docencia en robótica de imitación: el modelo y sus limitaciones documentadas ilustran de forma concreta los problemas de distribución, formato estricto de entrada y escasez de datos.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tasas de éxito numéricas sobre las escenas de test, solo la mención de que existe un script de evaluación (`eval_gazebo.py`) y episodios NPZ reservados.

## Requisitos de hardware
- VRAM estimada para inferencia: no disponible en la información proporcionada; con 51,6 M de parámetros y entradas de 3×240×320, el modelo es muy ligero y cabe holgadamente en GPUs de consumo.
- GPU recomendadas: no especificadas por el autor; el uso documentado asume una GPU en el servidor de política (entorno `/opt/lerobot-venv` con Python 3.13).
- GPU de consumo: por tamaño (51,6 M de parámetros, repo de 0,2 GB), es esperable que quepa en cualquier GPU consumer moderna, aunque el autor no lo confirma.
- Despliegue: servidor de política propio (`policy_server.py`) más nodo ROS (`infer_node.py`) dentro del contenedor Docker del proyecto con Gazebo activo.
- Latencia y throughput: no disponibles; el lazo de control opera a 10 Hz y cada objetivo debe alcanzarse en 0,5 s.

## Comparativa con modelos similares
No disponible. La información proporcionada no incluye otros checkpoints ACT comparables ni resultados que permitan una comparación cuantitativa. Como referencia cualitativa, el propio modelo se apoya en la implementación ACT de LeRobot y en la receta de `matsuolab/pai_training`, pero no se aportan métricas frente a ellos.

## Limitaciones y advertencias
- Solo simulación: entrenado y evaluado en Gazebo con iluminación y texturas fijas; no probado en un brazo real.
- Una sola tarea y un solo layout: el coche está siempre en la misma posición y solo varía la posición de la caja; otros objetos, posiciones del coche o poses de cámara quedan fuera de distribución.
- Dataset pequeño (unas 70 episodios) de un único experto determinista, lo que limita la recuperación ante errores.
- Formato de entrada estricto: cámaras 320×240 RGB con nombres exactos (`observation.images.top`, `observation.images.wrist`) y acciones enviadas como objetivos a 0,5 s; en caso contrario el brazo se mueve a velocidad incorrecta.
- La acción del gripper es el ángulo comandado (cerrar = +10°), no el ángulo donde se detienen los dedos sobre la caja.
- Requiere la carpeta `meta/` del dataset en `lerobot_data/crane_pick_place/meta/` para que el servidor de política funcione.
- Sesgos y alucinaciones: no aplica en el sentido de modelos de lenguaje; el riesgo equivalente es la extrapolación incorrecta fuera de la distribución de demostraciones.
- Licencia Apache 2.0: permite uso comercial, pero la ausencia de validación en hardware real desaconseja su uso en producción sin reentrenamiento y evaluación adicionales.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/Phongwit/act_crane_topwrist
- Dataset de entrenamiento: https://huggingface.co/datasets/Phongwit/crane_pick_place_topwrist
- Episodios NPZ de validación/test: https://huggingface.co/datasets/Phongwit/crane_pick_place_episodes
- Código del proyecto: https://github.com/bamboo51/Arm-Robot-Picking
- Paper ACT (Zhao et al., RSS 2023): https://arxiv.org/abs/2304.13705
- LeRobot: https://github.com/huggingface/lerobot
- Receta de entrenamiento del Matsuo Lab: https://github.com/matsuolab/pai_training
