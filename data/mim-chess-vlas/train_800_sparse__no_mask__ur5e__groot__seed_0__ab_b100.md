# mim-chess-vlas/train_800_sparse__no_mask__ur5e__groot__seed_0__ab_b100

## Resumen

El modelo `train_800_sparse__no_mask__ur5e__groot__seed_0__ab_b100` es una política robótica de imitación (vision-language-action, VLA) publicada por el usuario `mim-chess-vlas` en Hugging Face. Se trata de un fine-tuning del modelo fundacional abierto GR00T N1.7 de NVIDIA, orientado a tareas de manipulación pick-and-place sobre una plataforma robótica compuesta por un brazo Franka Panda y un UR5e, con tres cámaras (una vista de agente y dos cámaras en el efector). El modelo consume estado propioceptivo de 9 dimensiones e imágenes RGB de 224x224 y produce acciones de 7 dimensiones.

La relevancia de esta ficha es doble: por un lado, documenta un caso concreto de aplicación de GR00T en un dominio de manipulación de objetos cotidianos (alimentos, utensilios, menaje) sobre una mesa; por otro, sirve como ejemplo práctico de cómo LeRobot 0.6.0 permite entrenar y desplegar políticas VLA con flujo de acciones. El modelo tiene 3.144.016.000 parámetros y un repositorio de 50,3 GB, lo que refleja el peso del backbone Cosmos-Reason2/Qwen3-VL junto con el transformador de acciones.

El entrenamiento se realizó sobre 1.526 episodios y 377.262 fotogramas a 20 FPS, con 40 tareas distintas de tipo "Pick the X and place it into the box". La licencia es Apache 2.0, lo que facilita su reutilización comercial, aunque el modelo está altamente especializado en el entorno y la morfología concretos para los que fue entrenado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GR00T N1.7 (backbone Cosmos-Reason2/Qwen3-VL + transformador de acciones con flow matching) |
| Parametros totales | 3.144.016.000 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería LeRobot) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura GR00T N1.7 de NVIDIA, un modelo fundacional cross-embodiment para razonamiento y habilidades de robots humanoides. Combina un backbone vision-language Cosmos-Reason2/Qwen3-VL que procesa las observaciones visuales y las instrucciones de lenguaje, con un transformador de acciones basado en flow matching que predice las acciones condicionadas por visión, lenguaje y propiocepción. La entrada de estado es un vector de 9 dimensiones, y las tres cámaras aportan tensores de (3, 224, 224). La salida es un vector de acción de 7 dimensiones.

El entrenamiento se realizó con LeRobot 0.6.0 durante 60.000 pasos, con batch size 16, optimizador AdamW y learning rate 7e-05, semilla 0. El dataset contiene 1.526 episodios y 377.262 fotogramas a 20 FPS, con 40 tareas distintas de pick-and-place sobre objetos cotidianos (jam, cereal, pear, sweet potato, scone, boxed food, can, hamburger, lemon, squash, cheese, cup, egg, ham, hot dog, apple, boxed drink, bread, candle, chicken breast, soap dispenser, jar, knife block, kettle, potato, basket, cake, orange, spice, spray, alcohol, blender jug, mushroom, salt and pepper shaker, tiered shelf, condiment, mango, pitcher, plant, stool). No se documenta en la información disponible si hubo RLHF, DPO ni técnicas de decodificación especulativa.

## Capacidades

- Generación de acciones de manipulación pick-and-place condicionadas por visión, lenguaje y propiocepción.
- Procesamiento multimodal: tres cámaras RGB (agentview, eye_in_hand, eye_in_hand_2) más estado propioceptivo de 9 dimensiones.
- Ejecución de 40 tareas distintas de recogida y colocación de objetos en una caja.
- Control de una plataforma robótica compuesta Panda + UR5e.
- Integración con el ecosistema LeRobot para rollout y entrenamiento.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, capacidades multilingües ni modos de razonamiento explícito (thinking mode) en la información disponible.

## Casos de uso

- Automatización de picking en almacén: el modelo puede recoger objetos cotidianos de una mesa y depositarlos en una caja, adecuado para entornos logísticos con objetos variados gracias a sus 40 tareas entrenadas.
- Clasificación y manipulación de alimentos en cocina robotizada: las tareas incluyen jam, cereal, pear, sweet potato, scone, hamburger, lemon, cheese, egg, ham, hot dog, apple, bread, chicken breast, potato, cake, orange, mushroom, mango, lo que permite su uso en líneas de preparación de alimentos.
- Manipulación de menaje y utensilios de cocina: cubre cup, jar, kettle, pitcher, blender jug, knife block, salt and pepper shaker, condiment, tiered shelf, stool.
- Recogida de productos de limpieza y droguería: soap dispenser, spray, alcohol, basket, plant.
- Investigación en imitación robótica: sirve como baseline reproducible para comparar políticas VLA en un benchmark de pick-and-place con semilla fija (seed 0) y configuración de entrenamiento documentada.
- Prototipado de sistemas bimanuales o multi-brazo: la plataforma Panda + UR5e con tres cámaras permite evaluar coordinación entre efectores en tareas de recogida y colocación.
- Evaluación de generalización cross-embodiment: al estar basado en GR00T N1.7, permite estudiar cómo se transfiere un modelo fundacional a una morfología concreta con fine-tuning supervisado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Con 3.144.016.000 parámetros, una estimación orientativa en fp16 sería de aproximadamente 6,3 GB solo para pesos, más overhead de activaciones y del backbone visual; en fp32 ascendería a unos 12,6 GB solo en pesos.
- GPU recomendadas: no disponible. Por tamaño, cabría esperar que modelos de 24 GB (RTX 4090, A10G, L4) o superiores (A100 40/80 GB, H100) pudieran alojarlo, pero no se confirma en la documentación.
- ¿Cabe en consumer GPU? No confirmado. El tamaño de pesos en fp16 (≈6,3 GB) sugiere que sí en GPUs de 12-24 GB, pero no hay datos oficiales.
- Opciones de despliegue: LeRobot 0.6.0 mediante `lerobot-rollout` con `--policy.path` apuntando al repositorio. No se documentan vLLM, llama.cpp, Ollama ni TGI para este modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (GR00T N1.7 fine-tuned) | 3.144.016.000 | no disponible | VLA robótico | Apache 2.0 | Hugging Face (17 descargas) |
| GR00T N1.7 base (NVIDIA) | no disponible | no disponible | VLA fundacional | no disponible en la información | GitHub NVIDIA/Isaac-GR00T |
| Otras políticas LeRobot del mismo autor | no disponible | no disponible | VLA robótico | Apache 2.0 | Hugging Face (mim-chess-vlas) |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Modelo altamente especializado: entrenado exclusivamente para la plataforma Panda + UR5e con tres cámaras concretas y un conjunto cerrado de 40 tareas de pick-and-place; no se espera generalización fuera de ese dominio sin reentrenamiento.
- Dependencia de la morfología y calibración del robot: cambios en la cinemática, en la disposición de cámaras o en la resolución de entrada pueden degradar el rendimiento.
- Sesgos conocidos: no documentados en la información disponible; al entrenarse sobre un dataset concreto de objetos cotidianos, puede presentar sesgo hacia esas categorías y disposiciones.
- Riesgo de alucinación: no aplica en el sentido de generación de texto, pero sí existe riesgo de acciones incorrectas o inseguras en entornos no vistos.
- Limitaciones de contexto e idioma: no se documentan longitudes de contexto ni idiomas soportados; las instrucciones de tarea son en inglés y con plantillas fijas ("Pick the X and place it into the box").
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo base GR00T N1.7 de NVIDIA puede tener condiciones adicionales que no se detallan en la información disponible; conviene verificar la licencia del modelo fundacional.
- Caveat para producción: solo 17 descargas y 0 likes, sin benchmarks publicados; no hay evidencia de robustez en producción ni de evaluación en entornos reales.
- El repositorio ocupa 50,3 GB, lo que implica requisitos de almacenamiento y ancho de banda considerables para su despliegue.
- No se documentan técnicas de seguridad, parada de emergencia ni límites de fuerza; en aplicaciones reales debe integrarse con capas de seguridad externas.

## Enlaces

- Hugging Face: https://huggingface.co/mim-chess-vlas/train_800_sparse__no_mask__ur5e__groot__seed_0__ab_b100
- Dataset de entrenamiento: https://huggingface.co/datasets/lets-merged/mim-chess-vlas-train_800_sparse__no_mask_mim-chess-vlas-train_800_sparse__no_mask__ur5e
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=lets-merged/mim-chess-vlas-train_800_sparse__no_mask_mim-chess-vlas-train_800_sparse__no_mask__ur5e
- GR00T N1.7 (NVIDIA): https://github.com/NVIDIA/Isaac-GR00T
- Guía LeRobot GR00T: https://huggingface.co/docs/lerobot/main/en/groot
- Documentación LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Instalación LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Chuleta de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
