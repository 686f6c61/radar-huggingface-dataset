# mim-chess-vlas/train_800_sparse__mask_a75__ur5e__groot__seed_0__b_b5

## Resumen

`train_800_sparse__mask_a75__ur5e__groot__seed_0__b_b5` es una política robótica de imitación entrenada con LeRobot sobre la arquitectura GR00T N1.7 de NVIDIA, un modelo fundacional abierto y cross-embodiment para razonamiento y habilidades en robots humanoides. El modelo combina un backbone visual-lenguaje Cosmos-Reason2/Qwen3-VL con un transformer de acciones basado en flow matching, y predice secuencias de acción condicionadas por visión, lenguaje y propiocepción.

El checkpoint está especializado en una única plataforma: un brazo UR5e con tres cámaras (`agentview`, `robot0_eye_in_hand`, `robot0_eye_in_hand_2`), y se ha entrenado sobre 739 episodios (182.078 frames a 20 FPS) de tareas de pick-and-place de objetos cotidianos en un entorno de simulación. El espacio de observación incluye un vector de estado de 9 dimensiones y tres imágenes RGB de 224x224, mientras que la salida es un vector de acción de 7 dimensiones.

Es relevante como ejemplo reproducible de fine-tuning de un VLA (vision-language-action) sobre un dataset LeRobot concreto, y como referencia de cómo se publican políticas robóticas entrenadas con licencia Apache 2.0 en el Hub. No es un modelo de lenguaje generalista ni un chatbot: es una política de control motor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GR00T N1.7 (backbone VLM Cosmos-Reason2/Qwen3-VL + transformer de acciones con flow matching) |
| Parametros totales | 3.144.016.000 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors) |
| Idiomas soportados | no disponible (condicionamiento por instrucciones en inglés según las tareas del dataset) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería `lerobot`) |

## Arquitectura y entrenamiento

La política sigue la arquitectura GR00T N1.7: un backbone visual-lenguaje basado en Cosmos-Reason2/Qwen3-VL que procesa las imágenes de las tres cámaras junto con la instrucción de tarea en lenguaje natural, y un transformer de acciones entrenado con flow matching que genera trayectorias de acción continuas condicionadas también por el estado propioceptivo del robot. El vector de estado tiene 9 dimensiones y la acción producida es de 7 dimensiones, lo que corresponde a una pinza paralela sobre un UR5e (6 DOF de brazo más 1 DOF de pinza).

El fine-tuning se realizó con LeRobot 0.6.0 sobre el dataset `mim-chess-vlas/train_800_sparse__mask__overlay_a75__sim__all_cameras__live__ur5e` (739 episodios, 182.078 frames, 20 FPS, 40 tareas de pick-and-place en simulación). La configuración de entrenamiento fue de 60.000 pasos con batch size 16, optimizador AdamW y learning rate 7e-05, semilla 0. No se indica en la información disponible si hubo RLHF, DPO ni qué proporción del backbone se congeló durante el fine-tuning.

## Capacidades

- Control robótico de pick-and-place: dado un estado de 9 dims, tres vistas de 224x224 y una instrucción de tarea, predice una acción de 7 dims por paso.
- Condicionamiento por lenguaje natural: soporta 40 instrucciones distintas del tipo "Pick the <objeto> and place it into the box" sobre objetos cotidianos (frutas, envases, utensilios, electrodomésticos pequeños).
- Percepción multi-cámara: integra una vista de agente y dos vistas de la pinza (`eye_in_hand` y `eye_in_hand_2`).
- Generalización cross-embodiment heredada del backbone GR00T: la arquitectura base está diseñada para transferir entre morfologías, aunque este checkpoint está especializado en UR5e.
- No soporta tool calling, function calling, agentes multi-paso ni diálogo general: es una política de imitación, no un LLM conversacional.
- No se han documentado capacidades de visión general, audio, thinking mode ni matemáticas.

## Casos de uso

- Investigación en imitación visual-motora: punto de partida reproducible para estudiar cómo se comporta un VLA de 3.100 M de parámetros al hacer fine-tuning sobre un dataset LeRobot de 739 episodios, comparando configuraciones de entrenamiento.
- Automatización de pick-and-place en laboratorio: el checkpoint puede ejecutarse sobre un UR5e real o simulado con `lerobot-rollout`, sirviendo como baseline para tareas de recogida y depósito de objetos.
- Benchmark de políticas robóticas: sirve para comparar el rendimiento de GR00T N1.7 frente a otras arquitecturas (ACT, Diffusion Policy, π0) sobre el mismo dataset y misma morfología.
- Prototipado de pipelines de datos: el dataset asociado permite validar herramientas de visualización, conversión y aumento de datos antes de entrenar políticas propias.
- Docencia y divulgación: ejemplo completo y abierto (licencia Apache 2.0) del flujo LeRobot: grabar datos, entrenar, publicar en el Hub y desplegar en robot.
- Base para fine-tuning adicional: al estar publicado en safetensors y con licencia permisiva, puede reentrenarse sobre nuevos objetos o escenas sin restricciones comerciales.
- Validación de infraestructura de inferencia robótica: útil para medir latencia y throughput de un VLA de este tamaño en GPUs concretas antes de invertir en despliegue.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 3.144 M de parámetros, en FP16 los pesos ocupan aproximadamente 6,3 GB; en BF16, lo mismo; en cuantización de 8 bits, unos 3,1 GB; en 4 bits, unos 1,6 GB (estimación a partir del recuento de parámetros, no confirmada por el autor).
- GPU recomendadas: no disponibles en la información. Por tamaño, una GPU con al menos 16 GB de VRAM (RTX 4090, A100 40 GB, H100) debería poder cargar el modelo en FP16, aunque no se confirma en la model card.
- ¿Cabe en GPU de consumo? Probablemente sí en FP16 en una RTX 4090 (24 GB) o RTX 3090 (24 GB) según el recuento de parámetros, pero no está confirmado por el autor.
- Opciones de despliegue: LeRobot (`lerobot-rollout`) es el método documentado. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que además no aplican a políticas de acción.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (GR00T N1.7 fine-tuned) | 3.144 M | no disponible | Pick-and-place UR5e | Apache 2.0 | Hugging Face |
| GR00T N1.7 base (NVIDIA) | no disponible | no disponible | VLA cross-embodiment | no disponible | GitHub NVIDIA/Isaac-GR00T |
| Políticas LeRobot (ACT, Diffusion Policy) | no disponible | no aplica | Imitación robótica | no disponible | Hugging Face / LeRobot |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Especialización estrecha: el checkpoint está entrenado únicamente para un UR5e con tres cámaras concretas y 40 tareas de pick-and-place; no se espera que funcione en otras morfologías, configuraciones de cámara ni dominios visuales sin reentrenamiento.
- Entrenamiento en simulación: el dataset indica entorno simulado (`sim`), por lo que puede existir una brecha sim-to-real no cuantificada.
- Idiomas: las instrucciones del dataset están en inglés; no hay evidencia de soporte multilingüe.
- Riesgo de fallo silencioso: como política de imitación, puede ejecutar acciones plausibles pero incorrectas ante objetos o disposiciones no vistas; no hay mecanismo de abstención documentado.
- Sesgos: no documentados por el autor; el dataset está limitado a un conjunto de objetos de cocina y hogar.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre seguridad física del robot ni sobre el comportamiento en producción.
- No hay información sobre cuantizaciones soportadas ni sobre el rendimiento en tiempo real en hardware concreto.
- El repositorio ocupa 50,3 GB, lo que implica costes de almacenamiento y descarga considerables.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mim-chess-vlas/train_800_sparse__mask_a75__ur5e__groot__seed_0__b_b5
- Dataset de entrenamiento: https://huggingface.co/datasets/mim-chess-vlas/train_800_sparse__mask__overlay_a75__sim__all_cameras__live__ur5e
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=mim-chess-vlas/train_800_sparse__mask__overlay_a75__sim__all_cameras__live__ur5e
- Repositorio GR00T de NVIDIA: https://github.com/NVIDIA/Isaac-GR00T
- Guía LeRobot para GR00T: https://huggingface.co/docs/lerobot/main/en/groot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Repositorio LeRobot: https://github.com/huggingface/lerobot
