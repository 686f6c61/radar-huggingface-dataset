# mim-chess-vlas/train_800_sparse__no_mask__ur5e__groot__seed_0__b_b30

## Resumen

Este repositorio contiene una política de robótica entrenada con LeRobot sobre el modelo fundacional GR00T N1.7 de NVIDIA. No se trata de un modelo de lenguaje generalista, sino de un checkpoint de imitación específico para un brazo robótico UR5e que ejecuta tareas de recogida y colocación (pick-and-place) de objetos domésticos en una caja. El modelo se distribuye en formato safetensors con 3.144.016.000 parámetros (aproximadamente 3.140 millones) y un tamaño de repositorio de 50,3 GB.

El interés de esta ficha es doble: por un lado, documenta un caso concreto de adaptación de un modelo fundacional de robótica (GR00T N1.7) a un robot y un conjunto de tareas muy acotados; por otro, sirve como referencia de cómo LeRobot empaqueta y publica políticas de imitación listas para desplegar mediante su CLI. El entrenamiento se realizó sobre 739 episodios y 182.078 fotogramas a 20 FPS, con 60.000 pasos de optimización, batch de 16 y tasa de aprendizaje 7e-05.

La relevancia actual radica en que GR00T N1.7 es un modelo abierto de NVIDIA para razonamiento y habilidades humanoides cruzando morfologías (cross-embodiment), y este checkpoint muestra su uso práctico con un UR5e y tres cámaras. La licencia Apache 2.0 facilita su reutilización, aunque el alcance funcional está limitado a las tareas del dataset de entrenamiento.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | GR00T N1.7: backbone Cosmos-Reason2/Qwen3-VL + transformer de acciones con flow matching |
| Parámetros totales | 3.144.016.000 |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Librería | lerobot (versión 0.6.0) |
| Tipo de robot | UR5e |
| Cámaras | agentview, robot0_eye_in_hand, robot0_eye_in_hand_2 |
| Entrada de estado | observation.state, shape (9,) |
| Entradas visuales | 3 imágenes RGB de (3, 224, 224) |
| Salida de acción | action, shape (7,) |
| Dataset de entrenamiento | mim-chess-vlas/train_800_sparse__no_mask__ur5e |
| Episodios / fotogramas | 739 / 182.078 a 20 FPS |
| Pasos de entrenamiento | 60.000 |
| Batch size | 16 |
| Optimizador | AdamW |
| Learning rate | 7e-05 |
| Semilla | 0 |
| Tamaño del repositorio | 50,3 GB |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura de GR00T N1.7, un modelo fundacional de NVIDIA para robótica humanoides y manipulación general. Combina un backbone de visión-lenguaje basado en Cosmos-Reason2/Qwen3-VL, que procesa las observaciones visuales y las instrucciones en lenguaje natural, con un transformer de acciones entrenado mediante flow matching. La política predice acciones condicionadas por visión, lenguaje y propiocepción: en este caso, un vector de estado de 9 dimensiones y tres vistas RGB de 224x224, produciendo un vector de acción de 7 dimensiones.

El entrenamiento se realizó por imitación supervisada sobre el dataset indicado, compuesto por 739 episodios y 182.078 fotogramas a 20 FPS. Las tareas cubren 40 instrucciones distintas del tipo "Pick the [objeto] and place it into the box", con objetos domésticos variados (mermelada, cereal, pera, patata dulce, scone, lata, hamburguesa, limón, calabaza, queso, huevo, etc.). La configuración reportada incluye 60.000 pasos, batch de 16, optimizador AdamW y learning rate 7e-05 con semilla 0. No se documentan en la información disponible detalles sobre RLHF, DPO ni composición adicional del dataset más allá de las tareas listadas.

## Capacidades

- Control robótico de manipulación pick-and-place sobre un brazo UR5e, con salida de acción de 7 dimensiones.
- Percepción visual multi-cámara: procesa tres vistas simultáneas (vista del agente y dos cámaras en la muñeca).
- Condicionamiento por instrucción en lenguaje natural: acepta tareas como "Pick the jam and place it into the box".
- Fusión de propiocepción (estado del robot de 9 dimensiones) con visión y lenguaje.
- Política de imitación entrenada para un conjunto acotado de 40 tareas de recogida y colocación.
- Integración con el ecosistema LeRobot: ejecución mediante `lerobot-rollout` y entrenamiento mediante los flujos documentados.
- No se documentan en la información disponible capacidades de tool calling, agentes multi-paso, razonamiento general, matemáticas, código ni multilingüismo.

## Casos de uso

- Automatización de pick-and-place en laboratorio: el modelo puede ejecutar las 40 tareas de recogida y colocación para las que fue entrenado sobre un UR5e, usando las tres cámaras configuradas y la instrucción textual como condicionamiento.
- Investigación en imitación robótica: sirve como checkpoint de referencia para comparar variantes de entrenamiento (sparse, sin máscara, distintas semillas) dentro del mismo entorno y dataset.
- Reproducción de experimentos: al fijar semilla 0 y documentar hiperparámetros, permite reproducir el entrenamiento con LeRobot 0.6.0 y validar resultados.
- Prototipado de pipelines de evaluación: útil para montar un banco de pruebas de políticas GR00T sobre un robot concreto antes de escalar a otras morfologías.
- Docencia y formación: ejemplo completo de política publicada en el Hub con instrucciones de ejecución, dataset visualizable y configuración de entrenamiento, adecuado para enseñar el flujo de LeRobot.
- Base para fine-tuning en dominios similares: punto de partida para adaptar GR00T N1.7 a nuevas tareas de manipulación con objetos y configuraciones de cámara parecidas.
- Validación de infraestructura de despliegue: permite probar la CLI `lerobot-rollout`, la conexión del UR5e y la calibración de cámaras antes de invertir en datasets propios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Con 3.144 millones de parámetros, una estimación orientativa en FP16 rondaría los 6-7 GB solo para pesos, más overhead de activaciones y del backbone visual; sin datos oficiales no se puede confirmar.
- GPU recomendadas: no disponible. Por tamaño, cabría esperar que una GPU con 16 GB o más pudiera alojar los pesos en precisión reducida, pero no hay confirmación del autor.
- ¿Cabe en GPU de consumo? No confirmado. El tamaño de pesos en FP16 es compatible con GPUs de consumo de gama alta, pero el requisito real depende del backbone Qwen3-VL y de las tres cámaras a 224x224.
- Opciones de despliegue: LeRobot mediante `lerobot-rollout` con `--policy.path` apuntando al repositorio. No se documentan opciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política robótica.
- Latencia y throughput: no disponible. El dataset se grabó a 20 FPS, pero no se especifica la frecuencia de inferencia alcanzable en hardware concreto.
- Almacenamiento: el repositorio ocupa 50,3 GB, por lo que se necesita espacio en disco suficiente para descargar los pesos completos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (GR00T N1.7 sobre UR5e) | 3.144.016.000 | no disponible | Pick-and-place UR5e, 40 tareas | Apache 2.0 | Hugging Face, LeRobot |
| GR00T N1.7 base (NVIDIA) | no disponible | no disponible | Modelo fundacional cross-embodiment | no disponible en la información | GitHub NVIDIA/Isaac-GR00T |
| Otras políticas LeRobot del mismo autor | no disponible | no disponible | Variantes del mismo dataset | Apache 2.0 (presumible) | Hugging Face |

No se dispone de datos de benchmarks ni de especificaciones completas de las alternativas en la información proporcionada, por lo que la comparación cuantitativa de rendimiento no está disponible.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente para las 40 tareas de pick-and-place del dataset; no generaliza a otras instrucciones ni a otros objetos fuera de esa distribución.
- Depende de la configuración exacta de hardware: UR5e y tres cámaras con nombres y calibración concretos (agentview, robot0_eye_in_hand, robot0_eye_in_hand_2). Cambiar la disposición o el número de cámaras degradará el rendimiento.
- Riesgo de alucinación en el sentido de acciones incorrectas o inseguras: como toda política de imitación, puede producir trayectorias no válidas ante situaciones no vistas.
- No hay información publicada sobre sesgos, evaluación de seguridad ni robustez ante perturbaciones.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte; el despliegue en producción requiere validación propia.
- El tamaño del repositorio (50,3 GB) y los 3.144 millones de parámetros implican requisitos de almacenamiento y cómputo considerables.
- No se documentan idiomas soportados ni capacidades de lenguaje general; el uso de instrucciones en inglés está ligado a las tareas del dataset.
- La fecha de creación indicada (2026-11-12) y la versión de LeRobot 0.6.0 deben verificarse contra el repositorio antes de reproducir el entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mim-chess-vlas/train_800_sparse__no_mask__ur5e__groot__seed_0__b_b30
- Dataset de entrenamiento: https://huggingface.co/datasets/mim-chess-vlas/train_800_sparse__no_mask__ur5e
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=mim-chess-vlas/train_800_sparse__no_mask__ur5e
- Repositorio GR00T de NVIDIA: https://github.com/NVIDIA/Isaac-GR00T
- LeRobot (GitHub): https://github.com/huggingface/lerobot
- Guía de GR00T en LeRobot: https://huggingface.co/docs/lerobot/main/en/groot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rápida de comandos: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
