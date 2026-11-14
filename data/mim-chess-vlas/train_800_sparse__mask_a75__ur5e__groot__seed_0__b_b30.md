# mim-chess-vlas/train_800_sparse__mask_a75__ur5e__groot__seed_0__b_b30

## Resumen

Este repositorio contiene una política de imitación robótica entrenada con LeRobot sobre el modelo fundacional GR00T N1.7 de NVIDIA. No se trata de un modelo de lenguaje generalista, sino de un checkpoint especializado en una tarea concreta de manipulación (recoger un objeto y depositarlo en una caja) para un brazo robótico UR5e con tres cámaras. El modelo combina un backbone visión-lenguaje Cosmos-Reason2/Qwen3-VL con un transformer de acciones basado en flow matching, y predice acciones de 7 dimensiones condicionadas por visión, lenguaje y propiocepción.

El checkpoint tiene 3.144.016.000 parámetros (aproximadamente 3,14 mil millones) y un tamaño de repositorio de 50,3 GB, lo que sugiere pesos en precisión alta (probablemente bfloat16 o fp32) junto con el backbone completo. Se entrenó durante 60.000 pasos con batch de 16, learning rate 7e-05 y optimizador AdamW sobre un dataset de 739 episodios y 182.078 frames a 20 FPS, con 40 tareas distintas de pick-and-place sobre objetos cotidianos.

Su relevancia es acotada pero clara: sirve como ejemplo reproducible de fine-tuning de un modelo fundacional cross-embodiment para una tarea específica, y como referencia para quien quiera evaluar el pipeline GR00T + LeRobot en un UR5e simulado o real. La licencia Apache 2.0 facilita su reutilización, aunque el rendimiento real depende fuertemente del entorno de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GR00T N1.7: backbone visión-lenguaje Cosmos-Reason2/Qwen3-VL + transformer de acciones con flow matching |
| Parametros totales | 3.144.016.000 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (las instrucciones de tarea están en inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería lerobot) |

Otros datos relevantes: robot UR5e, cámaras `agentview`, `robot0_eye_in_hand` y `robot0_eye_in_hand_2`; entrada `observation.state` de forma `(9,)` y tres imágenes de `(3, 224, 224)`; salida `action` de forma `(7,)`; 739 episodios, 182.078 frames, 20 FPS; 60.000 pasos de entrenamiento, batch 16, AdamW, LR 7e-05, semilla 0; LeRobot 0.6.0.

## Arquitectura y entrenamiento

El modelo sigue la arquitectura GR00T N1.7 de NVIDIA: un backbone visión-lenguaje (Cosmos-Reason2/Qwen3-VL) que procesa las observaciones visuales y la instrucción en lenguaje natural, acoplado a un transformer de acciones entrenado con flow matching que genera trayectorias de acción continuas condicionadas por visión, lenguaje y propiocepción. Es un enfoque de política visuomotora, no un LLM generativo de texto: la salida es un vector de acción de 7 dimensiones por paso.

El entrenamiento se realizó con LeRobot 0.6.0 sobre un dataset de imitación de 739 episodios (182.078 frames a 20 FPS) que cubre 40 tareas de pick-and-place con objetos variados (jam, cereal, pera, patata dulce, scone, lata, hamburguesa, limón, calabaza, queso, huevo, manzana, pan, etc.). Se usaron 60.000 pasos, batch 16, AdamW y LR 7e-05 con semilla 0. No se documenta en la información disponible el número de tokens de entrenamiento del backbone, la composición del dataset de preentrenamiento de GR00T, ni si hubo RLHF/DPO (poco probable en este tipo de políticas). El nombre del checkpoint sugiere variantes de enmascarado espacial (`mask_a75`), overlay y simulación con todas las cámaras.

## Capacidades

- Control visuomotor de un brazo UR5e para tareas de pick-and-place: recoger un objeto y colocarlo en una caja.
- Condicionamiento por instrucción en lenguaje natural (40 tareas distintas descritas en inglés, p. ej. "Pick the jam and place it into the box").
- Fusión de tres vistas de cámara (vista del agente y dos cámaras en la muñeca) con estado propioceptivo de 9 dimensiones.
- Generación de acciones continuas de 7 dimensiones mediante flow matching.
- Generalización cross-embodiment heredada del backbone GR00T N1.7 (no verificada en este checkpoint concreto).
- No se documenta soporte de tool calling, agentes multi-paso, visión general, audio ni modo de razonamiento explícito; sus capacidades son específicas de robótica.

## Casos de uso

- Automatización de pick-and-place en laboratorio: usar el checkpoint como política base para un UR5e que recoja objetos cotidianos y los deposite en una caja, aprovechando las 40 tareas del dataset para cubrir una amplia variedad de formas y tamaños.
- Punto de partida para fine-tuning: reentrenar con LeRobot sobre un dataset propio de pocos cientos de episodios para adaptar la política a una nueva tarea de manipulación, dado que el pipeline y los hiperparámetros están documentados.
- Evaluación de GR00T N1.7 en simulación: reproducir el entrenamiento y comparar variantes (por ejemplo, con y sin enmascarado `mask_a75`) para estudiar el efecto del preprocesado en el éxito de la tarea.
- Benchmark de políticas de imitación: servir como referencia cuantitativa para comparar LeRobot frente a otros frameworks (ACT, Diffusion Policy) en la misma tarea y robot.
- Docencia y formación en robótica: ejemplo completo y reproducible de entrenamiento de una política visuomotora con tres cámaras y estado propioceptivo, con comandos `lerobot-rollout` listos para usar.
- Pruebas de integración hardware-software: validar la cadena de comunicación con un UR5e real (puerto, cámaras OpenCV a 640x480 y 30 FPS) antes de desplegar políticas más complejas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; con 3,14 mil millones de parámetros, una estimación orientativa en bfloat16 rondaría los 6-7 GB solo para pesos, más memoria para el backbone visión-lenguaje y los buffers de activaciones, aunque no se confirma.
- GPU recomendadas: no disponible. Por tamaño, cabría en GPUs consumer de gama alta (RTX 4090, 24 GB) en precisión reducida, pero no se documenta.
- Despliegue: LeRobot 0.6.0 mediante el comando `lerobot-rollout` con `--policy.path` apuntando al repositorio; requiere robot UR5e y cámaras OpenCV.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (GR00T N1.7 fine-tuned) | 3,14 B | no disponible | Pick-and-place UR5e | Apache 2.0 | Hugging Face |
| GR00T N1.7 base (NVIDIA) | no disponible en la información | no disponible | Modelo fundacional cross-embodiment | no disponible en la información | GitHub NVIDIA/Isaac-GR00T |
| Políticas LeRobot (ACT, Diffusion Policy) | no disponible | no disponible | Imitación robótica genérica | no disponible | LeRobot / Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Especialización estrecha: la política solo se ha entrenado para las 40 tareas de pick-and-place del dataset; no se espera que generalice a otras tareas de manipulación sin fine-tuning.
- Dependencia del entorno: entrenada sobre un dataset concreto (simulación con overlay y enmascarado), por lo que el rendimiento en un UR5e real puede degradarse por diferencias de iluminación, calibración o disposición de cámaras.
- Sesgos: el dataset cubre objetos cotidianos de cocina y hogar; el modelo puede fallar con objetos, texturas o configuraciones no representadas.
- Riesgo de alucinación de acciones: como toda política de imitación, puede producir trayectorias plausibles pero incorrectas ante distribuciones fuera de entrenamiento.
- Idiomas: las instrucciones de tarea están en inglés; no hay evidencia de soporte multilingüe.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las condiciones del backbone GR00T N1.7 y del dataset original.
- Sin benchmarks publicados: no hay métricas de tasa de éxito que permitan evaluar su calidad en producción.
- Requiere hardware específico (UR5e y tres cámaras) y la versión 0.6.0 de LeRobot para reproducir el pipeline.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mim-chess-vlas/train_800_sparse__mask_a75__ur5e__groot__seed_0__b_b30
- Dataset de entrenamiento: https://huggingface.co/datasets/mim-chess-vlas/train_800_sparse__mask__overlay_a75__sim__all_cameras__live__ur5e
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=mim-chess-vlas/train_800_sparse__mask__overlay_a75__sim__all_cameras__live__ur5e
- Repositorio GR00T de NVIDIA: https://github.com/NVIDIA/Isaac-GR00T
- LeRobot en GitHub: https://github.com/huggingface/lerobot
- Guía de LeRobot para GR00T: https://huggingface.co/docs/lerobot/main/en/groot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Chuleta de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
