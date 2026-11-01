# mim-chess-vlas/train_800_dense__mask__overlay_a75__sim__agentview_camera__live__groot__seed_0

## Resumen

`train_800_dense__mask__overlay_a75__sim__agentview_camera__live__groot__seed_0` es una política de robótica entrenada con LeRobot sobre la arquitectura GR00T N1.7 de NVIDIA, un modelo fundacional abierto y cross-embodiment orientado a razonamiento y habilidades en robots humanoides. El modelo combina un backbone de visión-lenguaje Cosmos-Reason2/Qwen3-VL con un transformer de acciones basado en flow matching, y predice acciones condicionadas por visión, lenguaje y propiocepción.

Este checkpoint concreto es un ajuste fino (fine-tuning) para una tarea de manipulación de picking-and-placing sobre un robot Franka Panda simulado. Se ha entrenado sobre un dataset de 776 episodios y 207.203 frames a 20 FPS, con tres cámaras (`agentview`, `robot0_eye_in_hand`, `robot0_eye_in_hand_2`) y un vector de estado de 9 dimensiones, produciendo acciones de 7 dimensiones.

Su relevancia es doble: por un lado, demuestra el flujo completo de entrenamiento de políticas robóticas con LeRobot 0.6.0 sobre un modelo fundacional abierto; por otro, sirve como referencia reproducible (seed 0) para experimentos de manipulación con instrucciones en lenguaje natural. El repositorio ocupa 50,3 GB y acumula 16 descargas desde su publicación el 29 de octubre de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GR00T N1.7: backbone Cosmos-Reason2/Qwen3-VL + transformer de acciones con flow matching |
| Parametros totales | 3.144.016.000 (3,14 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (las instrucciones de tarea estan en ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria lerobot) |

## Arquitectura y entrenamiento

La arquitectura sigue el diseno de GR00T N1.7: un backbone de visión-lenguaje Cosmos-Reason2/Qwen3-VL que procesa las observaciones visuales (tres cámaras a 224x224) y las instrucciones de tarea en lenguaje natural, acoplado a un transformer de acciones entrenado con flow matching que genera las acciones de 7 dimensiones del efector final. La entrada de propiocepción es un vector de estado de 9 dimensiones. El modelo es cross-embodiment en su concepcion, aunque este checkpoint está especializado en un robot Panda con una configuración de cámaras concreta.

El entrenamiento se realizó con LeRobot 0.6.0 durante 60.000 pasos, con batch size 16, optimizador AdamW, learning rate 7e-5 y seed 0. El dataset contiene 776 episodios (207.203 frames a 20 FPS) con 40 instrucciones de tarea distintas del tipo "Pick the X and place it into the box", cubriendo objetos variados (jam, cereal, pear, sweet potato, scone, can, hamburger, lemon, squash, cheese, cup, egg, ham, hot dog, apple, bread, candle, chicken breast, jar, knife block, kettle, potato, basket, cake, orange, spice, spray, alcohol, blender jug, mushroom, salt and pepper shaker, tiered shelf, condiment, mango, pitcher, plant, stool, soap dispenser, entre otros). No se especifica en la información disponible el número de tokens de entrenamiento del backbone ni si hubo RLHF/DPO en esta fase de ajuste.

## Capacidades

- Manipulación robótica pick-and-place condicionada por instrucciones en lenguaje natural, con 40 tareas distintas de recogida y depósito en caja.
- Percepción multi-cámara: procesa simultáneamente vista de agente y dos vistas de ojo en mano del robot.
- Predicción de acciones de efector final de 7 dimensiones a partir de visión, lenguaje y propiocepción.
- Generalización cross-embodiment heredada del backbone GR00T N1.7 (conceptualmente, aunque este checkpoint está especializado en Panda).
- Razonamiento viso-lingüístico a través del backbone Qwen3-VL.
- Generación de trayectorias de acción mediante flow matching.
- No se dispone de información sobre soporte de tool calling, agentes multi-paso, capacidades multilingües ni modos de "thinking" en esta ficha.

## Casos de uso

- Automatización de picking-and-placing en almacén simulado: el modelo puede ejecutar las 40 tareas de recogida y depósito para las que fue entrenado sobre un Panda en entorno simulado, sirviendo como base para evaluación de políticas antes del despliegue real.
- Benchmark reproducible de imitación: al estar entrenado con seed 0 y configuración documentada, permite reproducir experimentos y comparar variantes de arquitectura o datasets bajo condiciones controladas.
- Generación de datos sintéticos de manipulación: la política puede utilizarse para generar rollouts adicionales en simulación que alimenten posteriores ciclos de entrenamiento.
- Investigación en generalización viso-lingüística: permite estudiar cómo el backbone Qwen3-VL transfiere instrucciones de objeto a acciones motoras concretas.
- Base para fine-tuning en dominios específicos: al ser un checkpoint LeRobot con licencia Apache 2.0, puede reentrenarse sobre datasets propios de manipulación con otras configuraciones de cámara u objetos.
- Evaluación de robustez ante variaciones de cámara: las tres vistas (`agentview`, `robot0_eye_in_hand`, `robot0_eye_in_hand_2`) permiten analizar la contribución de cada cámara a la precisión de la política.
- Docencia y divulgación: ejemplo completo y abierto del pipeline LeRobot para entrenar políticas robóticas con modelos fundacionales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Con 3,14 mil millones de parámetros en safetensors, una estimación orientativa en FP16 rondaría los 6-7 GB de pesos, más el coste de activaciones y buffers de las tres cámaras; en FP32 se duplicaría. Estas cifras son estimaciones, no datos del autor.
- GPU recomendadas: no especificadas por el autor. Por tamaño, cabría en GPUs consumer tipo RTX 3090/4090 (24 GB) en FP16, y potencialmente en GPUs de 8-12 GB con cuantización, aunque no se documentan cuantizaciones.
- Cabe en GPU consumer: previsiblemente sí en RTX 3090/4090 y GPUs de gama alta con 24 GB o más; no confirmado por el autor.
- Opciones de despliegue: LeRobot 0.6.0 mediante `lerobot-rollout` con `--policy.path=<repo>` y robot tipo `Panda`. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplicables a una política robótica de este tipo).
- Latencia y throughput: no disponibles. El dataset se grabó a 20 FPS, lo que sugiere que la política está pensada para operar a esa frecuencia, pero no se aportan mediciones de latencia real.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (GR00T N1.7 fine-tuned, Panda) | 3,14 mil millones | no disponible | Pick-and-place simulado, 40 tareas | Apache 2.0 | HuggingFace, 16 descargas |
| GR00T N1.7 base (NVIDIA) | no disponible | no disponible | Modelo fundacional cross-embodiment | no disponible en la información | GitHub NVIDIA/Isaac-GR00T |
| Otras políticas LeRobot (p. ej. ACT, Diffusion Policy) | no disponible | no disponible | Manipulación por imitación | variable | HuggingFace / LeRobot |

No se dispone de datos de benchmarks ni de parámetros comparables de alternativas en la información proporcionada, por lo que la comparación cuantitativa de rendimiento no está disponible.

## Limitaciones y advertencias

- Modelo entrenado exclusivamente en simulación sobre un robot Panda con una configuración concreta de tres cámaras; el transfer a robot real no está validado en la información disponible.
- El espacio de tareas está acotado a 40 instrucciones de pick-and-place sobre objetos concretos; fuera de ese vocabulario y distribución la política puede degradarse.
- No se documentan sesgos específicos, pero al ser un modelo viso-lingüístico hereda los sesgos del backbone Qwen3-VL en la interpretación de instrucciones e imágenes.
- Riesgo de alucinación de acciones: como política de imitación, puede generar trayectorias plausibles pero incorrectas ante observaciones fuera de distribución.
- El dataset de entrenamiento está en inglés; no se garantiza el comportamiento ante instrucciones en castellano u otros idiomas.
- Licencia Apache 2.0 permite uso comercial, pero el autor no aporta garantías ni documentación sobre seguridad física en despliegues reales.
- El repositorio ocupa 50,3 GB, lo que implica requisitos de almacenamiento y ancho de banda considerables para su descarga y despliegue.
- No se documentan cuantizaciones ni optimizaciones de inferencia, lo que limita el despliegue en hardware de gama baja.

## Enlaces

- HuggingFace: https://huggingface.co/mim-chess-vlas/train_800_dense__mask__overlay_a75__sim__agentview_camera__live__groot__seed_0
- Dataset: https://huggingface.co/datasets/mim-chess-vlas/train_800_dense__mask__overlay_a75__sim__agentview_camera__live
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=mim-chess-vlas/train_800_dense__mask__overlay_a75__sim__agentview_camera__live
- Repositorio GR00T de NVIDIA: https://github.com/NVIDIA/Isaac-GR00T
- Guía LeRobot para GR00T: https://huggingface.co/docs/lerobot/main/en/groot
- Documentación LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación y entrenamiento de políticas: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
