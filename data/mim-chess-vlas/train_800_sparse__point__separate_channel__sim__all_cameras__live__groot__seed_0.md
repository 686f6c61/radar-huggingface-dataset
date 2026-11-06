# mim-chess-vlas/train_800_sparse__point__separate_channel__sim__all_cameras__live__groot__seed_0

## Resumen

El modelo `train_800_sparse__point__separate_channel__sim__all_cameras__live__groot__seed_0` es una política de imitación robótica (visuomotor policy) entrenada con LeRobot sobre la arquitectura GR00T N1.7 de NVIDIA. No es un modelo de lenguaje generalista: es un checkpoint especializado en una tarea concreta de manipulación (recoger objetos y depositarlos en una caja) para un robot Franka Panda en simulación, con cuatro cámaras de entrada (vista del agente, dos cámaras en la muñeca y una máscara) y una salida de acción de 7 dimensiones.

El modelo se apoya en el backbone Cosmos-Reason2/Qwen3-VL de GR00T N1.7, que combina razonamiento visión-lenguaje con un transformer de acciones basado en flow matching. El checkpoint contiene aproximadamente 3.144 millones de parámetros en formato safetensors (12,6 GB de repositorio) y fue entrenado durante 60.000 pasos con un batch size de 16, learning rate 7e-5 y semilla 0, usando el dataset `mim-chess-vlas/train_800_sparse__point__separate_channel__sim__all_cameras__live` (787 episodios, 195.184 frames a 20 FPS).

Su relevancia es acotada pero clara: sirve como referencia reproducible de un pipeline completo LeRobot + GR00T para investigación en imitación robótica, y como ejemplo de adaptación de un modelo fundacional cross-embodiment a una tarea específica de pick-and-place. La licencia Apache 2.0 facilita su reutilización y estudio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GR00T N1.7: backbone Cosmos-Reason2/Qwen3-VL + transformer de acciones con flow matching |
| Parametros totales | 3.144.016.000 (3,14 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (checkpoint publicado en safetensors sin cuantizar) |
| Idiomas soportados | no disponible (las instrucciones de tarea están en inglés en el dataset) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería LeRobot) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura GR00T N1.7 de NVIDIA: un backbone visión-lenguaje Cosmos-Reason2/Qwen3-VL que procesa observaciones visuales e instrucciones en lenguaje natural, acoplado a un transformer de acciones entrenado con flow matching que predice la acción condicionada por visión, lenguaje y propriocepción. La entrada incluye el estado del robot (`observation.state`, shape `(9,)`) y cuatro imágenes de 3×224×224 (`agentview`, `robot0_eye_in_hand`, `robot0_eye_in_hand_2`, `mask`); la salida es un vector de acción de shape `(7,)`.

El entrenamiento se realizó con LeRobot 0.6.0 sobre 787 episodios y 195.184 frames a 20 FPS, con 60.000 pasos, batch size 16, optimizador AdamW y learning rate 7e-5. El dataset cubre 40 instrucciones de tipo "Pick the X and place it into the box" con objetos domésticos variados (jamón, cereal, pera, patata, queso, huevo, etc.). No se documenta en la información disponible si hubo RLHF, DPO ni detalles sobre la composición exacta del dataset más allá de las tareas enumeradas.

## Capacidades

- Generación de acciones de manipulación robótica (7 dimensiones) condicionadas por observaciones visuales y estado proprioceptivo.
- Comprensión de instrucciones en lenguaje natural para seleccionar el objeto objetivo entre 40 clases de objetos domésticos.
- Fusión de múltiples vistas de cámara, incluyendo una máscara de segmentación como canal separado.
- Control visuomotor de un robot Franka Panda en simulación.
- Política de imitación entrenada end-to-end (no requiere planificación explícita).
- Soporte de tool calling / function calling: no disponible (no es un modelo de lenguaje conversacional).
- Soporte de agentes y multi-step reasoning: no disponible en el sentido de agentes LLM; la política ejecuta una secuencia de acciones por episodio.
- Capacidades multilingües: no disponible; las instrucciones del dataset están en inglés.
- Capacidades especiales: no disponible (sin thinking mode, visión general, audio ni otras modalidades fuera de las cámaras del robot).

## Casos de uso

- Investigación en imitación robótica: sirve como checkpoint de referencia reproducible (semilla 0, hiperparámetros documentados) para comparar variantes de GR00T y LeRobot en tareas de pick-and-place.
- Benchmark de políticas visuomotoras: al estar entrenado sobre un dataset público concreto, permite evaluar métricas de éxito en simulación y comparar con otros checkpoints del mismo autor o de la comunidad.
- Estudio de fusión multisensorial: las cuatro cámaras (incluida una máscara) permiten analizar cómo influye cada canal visual en la predicción de acciones y en la robustez ante oclusiones.
- Prototipado de pipelines LeRobot: el modelo se puede cargar con `lerobot-rollout` sobre un Panda y sirve para validar la integración de GR00T en flujos de entrenamiento y despliegue de LeRobot 0.6.0.
- Transferencia a tareas de recogida y colocación: el checkpoint puede servir como inicialización o fine-tuning para tareas similares con otros objetos o contenedores en simulación.
- Docencia y divulgación: ejemplo completo de entrenamiento de una política fundacional cross-embodiment con dataset, hiperparámetros y comandos de ejecución documentados.
- Evaluación de robustez ante cambios de objeto: al cubrir 40 clases de objetos, permite medir la generalización dentro de la misma tarea y detectar sesgos hacia objetos sobrerrepresentados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 3,14 B parámetros en safetensors (12,6 GB de repo), una carga en fp16 requeriría aproximadamente 6,3 GB de pesos, más overhead del backbone visión-lenguaje y del transformer de acciones.
- GPU recomendadas: no disponible en la información proporcionada; por tamaño, una GPU con 16-24 GB de VRAM (RTX 4090, A100 40 GB, H100) sería razonable para inferencia en fp16, pero no está confirmado por el autor.
- ¿Cabe en consumer GPU?: probablemente sí en GPUs de 24 GB (RTX 3090/4090) en fp16, aunque no está documentado.
- Opciones de despliegue: LeRobot (`lerobot-rollout`) con la CLI documentada; no se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a una política robótica).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (GR00T N1.7, seed 0) | 3,14 B | no disponible | Pick-and-place Panda en simulación | Apache 2.0 | Hugging Face (24 descargas) |
| GR00T N1.7 base (NVIDIA) | no disponible | no disponible | Modelo fundacional cross-embodiment | no disponible | GitHub NVIDIA/Isaac-GR00T |
| Otras políticas LeRobot del mismo autor | no disponible | no disponible | Variantes de la misma tarea | Apache 2.0 | Hugging Face (mim-chess-vlas) |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Es una política específica de tarea: no es un modelo de lenguaje ni un agente general; solo predice acciones de 7 dimensiones para un Panda en el entorno de simulación del dataset.
- Entrenado exclusivamente en simulación: el rendimiento en un robot físico no está validado y puede degradarse por diferencias de dominio (gap sim-to-real).
- Dependencia de cuatro cámaras concretas y de una máscara de segmentación: cambiar la configuración de sensores invalida la política.
- Sesgo hacia las 40 clases de objetos del dataset: objetos no vistos pueden provocar fallos de agarre o colocación.
- Riesgo de sobreajuste al entorno y a las posiciones de cámara del dataset; no hay evidencia de generalización a otras disposiciones.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base GR00T N1.7 y sus dependencias (Cosmos-Reason2/Qwen3-VL) pueden tener condiciones adicionales que deben verificarse por separado.
- Sin benchmarks publicados: no hay métricas de tasa de éxito ni comparaciones objetivas con otras políticas.
- Solo 24 descargas y 0 likes: comunidad mínima, sin validación externa documentada.
- Idiomas: las instrucciones están en inglés; no se documenta soporte multilingüe.

## Enlaces

- Hugging Face: https://huggingface.co/mim-chess-vlas/train_800_sparse__point__separate_channel__sim__all_cameras__live__groot__seed_0
- Dataset: https://huggingface.co/datasets/mim-chess-vlas/train_800_sparse__point__separate_channel__sim__all_cameras__live
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=mim-chess-vlas/train_800_sparse__point__separate_channel__sim__all_cameras__live
- Repositorio GR00T de NVIDIA: https://github.com/NVIDIA/Isaac-GR00T
- Guía LeRobot GR00T: https://huggingface.co/docs/lerobot/main/en/groot
- Documentación LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Repositorio LeRobot: https://github.com/huggingface/lerobot
