# dongchan01/act_pick_cube_chunk10

## Resumen

`dongchan01/act_pick_cube_chunk10` es una política de imitación robótica entrenada con el método Action Chunking with Transformers (ACT), publicado en el paper arXiv 2304.13705. El modelo aprende a predecir secuencias cortas de acciones (chunks) en lugar de pasos individuales, una estrategia que reduce el error de composición acumulado en tareas de manipulación y que suele traducirse en tasas de éxito más altas que el aprendizaje por imitación paso a paso. Lo desarrolla el usuario dongchan01 y está empaquetado con LeRobot 0.6.0, la librería de Hugging Face para robótica en PyTorch.

Se trata de un modelo específico para un robot `so_follower` (una variante del SO-100/SO-101 de bajo coste) con dos cámaras: una cenital (`overhead`) y otra en la muñeca (`wrist`). La tarea concreta es "Grab the black cube": coger un cubo negro. El modelo consume el estado de las articulaciones (vector de 6 dimensiones) y dos imágenes de 480x640 píxeles, y produce un vector de acción de 6 dimensiones. Con 51,5 millones de parámetros y un tamaño de repo de 0,2 GB, es un modelo ligero pensado para inferencia en tiempo real a 30 FPS.

Su relevancia es la de un ejemplo canónico de política de imitación entrenada con LeRobot: sirve como referencia reproducible para quien quiera entender el flujo completo de grabación de datos, entrenamiento y despliegue en un robot real. No es un modelo de propósito general ni un LLM; es una política visuomotora de una sola tarea, con licencia Apache 2.0 y sin resultados de evaluación publicados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer ACT (Action Chunking with Transformers), aprendizaje por imitación |
| Parámetros totales | 51.576.454 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; ventana de observación definida por la configuración ACT) |
| Tipos de cuantización | no disponible (pesos en safetensors; no se documentan cuantizaciones) |
| Idiomas soportados | no disponible (modelo visuomotor, sin capacidades lingüísticas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería LeRobot) |

Parámetros adicionales relevantes:

| Parámetro | Valor |
|---|---|
| Tipo de robot | `so_follower` |
| Cámaras | `overhead`, `wrist` |
| Entrada de estado | `observation.state`, shape (6,) |
| Entrada visual | `observation.images.overhead` (3, 480, 640) y `observation.images.wrist` (3, 480, 640) |
| Salida | `action`, shape (6,) |
| Chunk de acciones | 10 (según el nombre del modelo) |
| Frecuencia de datos | 30 FPS |
| Pasos de entrenamiento | 100.000 |
| Batch size | 8 |
| Optimizador | AdamW |
| Learning rate | 1e-5 |
| Semilla | 1000 |
| Versión de LeRobot | 0.6.0 |
| Dataset de entrenamiento | `dongchan01/pick-cube_20261008_100853` (50 episodios, 28.273 frames) |
| Tarea | "Grab the black cube" |

## Arquitectura y entrenamiento

ACT es un transformer encoder-decoder que procesa observaciones multimodales (imágenes de las cámaras y estado de las articulaciones) y genera un chunk de acciones futuras de una sola pasada. La innovación principal del método es precisamente esa predicción por chunks: en lugar de predecir una acción por paso de control, el modelo predice una secuencia de acciones, lo que mitiga el problema de composición de errores típico del comportamiento clonado y permite un control más suave y estable. La arquitectura incorpora un mecanismo de atención sobre las observaciones visuales y el estado, y en la variante original se usa una CVAE (conditional VAE) para modelar la variabilidad de las demostraciones humanas.

El entrenamiento se realizó sobre 50 episodios teleoperados (28.273 frames a 30 FPS) de la tarea "Grab the black cube", con 100.000 pasos, batch de 8, AdamW y learning rate 1e-5. No se documenta en la model card el uso de RLHF, DPO ni ningún refinamiento por preferencias; es aprendizaje por imitación supervisado puro. Tampoco se especifican el número total de tokens (no aplica) ni la composición detallada del dataset más allá de los episodios y frames indicados. El modelo se entrenó y publicó con LeRobot 0.6.0.

## Capacidades

- Control visuomotor de un robot `so_follower` para la tarea específica de coger un cubo negro.
- Predicción de chunks de acciones de 10 pasos, lo que reduce el error acumulado y suaviza la trayectoria.
- Fusión de dos vistas de cámara (cenital y muñeca) con el estado de las articulaciones.
- Inferencia en tiempo real a 30 FPS sobre hardware de consumo.
- Ejecución mediante el comando `lerobot-rollout` con estrategia base (sin grabación de episodios).
- Reentrenamiento posible con `lerobot-train` sobre nuevos datasets de LeRobot.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, ni capacidades multilingües: es una política robótica de una sola tarea, no un modelo de lenguaje.

## Casos de uso

- **Automatización de una celda de pick-and-place de laboratorio**: el modelo ejecuta la secuencia de aproximación, agarre y elevación del cubo negro sobre un robot SO follower, con las dos cámaras como única entrada. Es adecuado porque ha sido entrenado exactamente sobre esa tarea y ese hardware.
- **Banco de pruebas para docencia e investigación en imitación**: sirve como referencia reproducible del flujo LeRobot (grabación, entrenamiento, rollout) para cursos de robótica o trabajos fin de máster, dado su tamaño reducido (0,2 GB) y su licencia permisiva.
- **Prototipado rápido de políticas visuomotoras**: un equipo puede clonar el repo, adaptar el dataset y reentrenar con `lerobot-train` para validar una nueva tarea de manipulación en horas, no semanas.
- **Validación de hardware SO follower**: el modelo permite comprobar la calibración de cámaras y articulaciones de un robot SO-100/SO-101 recién montado, ya que la tarea es simple y el fallo es fácilmente observable.
- **Generación de datos sintéticos o aumentados**: al ser una política ligera, se puede ejecutar en paralelo en simulación o en varios robots para recoger trayectorias adicionales que alimenten un dataset mayor.
- **Demostración de inferencia en tiempo real en GPU de consumo**: con 51,5 M de parámetros, cabe en GPUs modestas y permite medir latencia y throughput en un robot real a 30 FPS.
- **Base para comparativas de métodos de imitación**: sirve como línea base ACT frente a otros métodos (Diffusion Policy, VQ-BeT, etc.) en la misma tarea y hardware.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet." No se dispone de tasas de éxito, número de ensayos ni comparativas con otras políticas.

## Requisitos de hardware

- **VRAM estimada para inferencia**: al tratarse de un modelo de 51,5 M de parámetros (≈0,2 GB en safetensors), la inferencia cabe holgadamente en GPUs con 4-8 GB de VRAM, incluyendo GPUs de consumo.
- **GPU recomendadas**: cualquier GPU NVIDIA con soporte CUDA (RTX 3060, RTX 4060, RTX 4090, A100, H100). Para entrenamiento, se recomienda al menos una RTX 3090/4090 o superior por el batch y los 100.000 pasos.
- **¿Cabe en consumer GPU?**: sí, en cualquier GPU de consumo con al menos 4 GB de VRAM; el cuello de botella real es la captura de dos cámaras a 30 FPS y la latencia del bus del robot.
- **Opciones de despliegue**: LeRobot (`lerobot-rollout`, `lerobot-train`), con soporte de PyTorch y CUDA. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- **Latencia y throughput estimados**: no disponibles en la información proporcionada. El sistema está diseñado para operar a 30 FPS, que es la frecuencia de los datos de entrenamiento.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de este modelo ni de alternativas comparables en la información proporcionada, por lo que la comparación se limita a características estructurales.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| `dongchan01/act_pick_cube_chunk10` | 51,5 M | no aplica (política visuomotora) | Apache 2.0 | Hugging Face |
| ACT original (paper 2304.13705) | no disponible en la info | no aplica | no disponible en la info | Paper y código de referencia |
| Otras políticas LeRobot (p. ej. Diffusion Policy, VQ-BeT) | no disponible en la info | no aplica | no disponible en la info | Hugging Face / LeRobot |

No se dispone de datos de benchmarks que permitan comparar tasas de éxito, latencia o robustez frente a estas alternativas.

## Limitaciones y advertencias

- **Sesgos conocidos**: no documentados. Al ser un modelo entrenado sobre 50 episodios de una sola tarea, hereda los sesgos de las demostraciones (posiciones, iluminación, disposición de la mesa) y probablemente generaliza mal fuera de esa distribución.
- **Riesgo de alucinación**: no aplica en el sentido lingüístico, pero sí existe riesgo de comportamiento errático o de fallo de agarre fuera de las condiciones de entrenamiento.
- **Limitaciones de contexto o idioma**: no es un modelo de lenguaje; no procesa texto ni instrucciones en lenguaje natural. La tarea está fijada en el prompt "Grab the black cube".
- **Restricciones de licencia**: Apache 2.0 permite uso comercial, modificación y redistribución, con atribución y sin garantías. Verificar el cumplimiento de las licencias de las dependencias (LeRobot, PyTorch).
- **Caveats para producción**: no hay evaluación publicada; no se conoce la tasa de éxito real. El modelo está atado a un robot `so_follower` con dos cámaras concretas y a una tarea muy específica. Cualquier cambio de hardware, cámara, iluminación o posición de objetos requiere reentrenamiento. El repo tiene 0 descargas y 0 likes, lo que sugiere que no ha sido validado por la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dongchan01/act_pick_cube_chunk10
- Dataset de entrenamiento: https://huggingface.co/datasets/dongchan01/pick-cube_20261008_100853
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=dongchan01/pick-cube_20261008_100853
- Paper ACT (arXiv 2304.13705): https://huggingface.co/papers/2304.13705
- Guía ACT de LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference
