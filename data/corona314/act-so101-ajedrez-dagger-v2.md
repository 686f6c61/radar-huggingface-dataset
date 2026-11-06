# corona314/act-so101-ajedrez-dagger-v2

## Resumen

`corona314/act-so101-ajedrez-dagger-v2` es una política de imitación para robótica basada en Action Chunking with Transformers (ACT), publicada por el usuario corona314 en Hugging Face Hub y entrenada con la librería LeRobot. El modelo resuelve una tarea concreta de manipulación robótica: jugar al ajedrez con un brazo `so_follower` (SO-101), tomando como entrada el estado articular de 6 dimensiones y dos cámaras (`ojos` y `cenital`) y emitiendo comandos de acción de 6 dimensiones.

La relevancia de esta ficha no está en el rendimiento generalista (no es un LLM), sino en ser un ejemplo práctico de política ACT entrenada mediante DAgger sobre un dataset propio de 147 episodios y 114.204 frames a 30 FPS. Con 51,7 millones de parámetros y un repo de 0,2 GB, es un modelo pequeño, desplegable en hardware modesto, pero de alcance muy restringido: una única tarea ("chess") en un único tipo de robot.

La información disponible es la model card oficial y los metadatos del Hub. No hay benchmarks, resultados de evaluación en robot real ni datos de éxito publicados, por lo que todas las estimaciones de rendimiento deben tratarse como no verificadas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con encoder visual y decoder de acciones |
| Parámetros totales | 51.668.614 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; política de imitación por frame) |
| Tipos de cuantización | no disponible (pesos safetensors en precisión de entrenamiento) |
| Idiomas soportados | no disponible (modelo no lingüístico) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (repo de 0,2 GB) |

## Arquitectura y entrenamiento

ACT es un método de imitation learning que predice chunks de acciones (secuencias cortas de comandos) en lugar de un único paso, lo que reduce el error de compounding y suele mejorar la tasa de éxito en tareas de manipulación. La política consume `observation.state` de forma `(6,)` y dos flujos visuales: `observation.images.ojos` a `(3, 240, 320)` y `observation.images.cenital` a `(3, 480, 640)`. La salida es un tensor `action` de forma `(6,)`.

El entrenamiento se realizó sobre el dataset `corona314/chess_mezcla_v2` (147 episodios, 114.204 frames, 30 FPS, tarea "chess") durante 40.000 pasos con batch size 8, optimizador AdamW, learning rate 1e-05 y semilla 1000, usando LeRobot 0.6.0. El sufijo "dagger" del nombre sugiere entrenamiento con DAgger (Dataset Aggregation), aunque la model card no detalla el procedimiento de agregación ni la proporción de datos de política frente a datos de teleoperación. No se especifica número de tokens, composición del dataset ni uso de RLHF/DPO, que no aplican a este tipo de modelo.

## Capacidades

- Control robótico de manipulación para la tarea "chess" con un brazo `so_follower`.
- Predicción de chunks de acción de 6 dimensiones a partir de estado articular y dos cámaras.
- Fusión de dos vistas visuales (cámara de ojos y cámara cenital) para localizar piezas y el tablero.
- Ejecución de políticas en bucle cerrado mediante `lerobot-rollout` con `--strategy.type=base`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües.
- No dispone de modo thinking, visión general, audio ni generación de texto.

## Casos de uso

- Demostración de ajedrez robótico: el modelo mueve piezas en un tablero físico con el brazo SO-101, usando la cámara cenital para localizar el tablero y la cámara de ojos para el agarre fino.
- Reproducción de experimentos de imitation learning: sirve como referencia para comparar ACT frente a otras políticas (Diffusion Policy, VQ-BeT) sobre el mismo dataset `chess_mezcla_v2`.
- Base para fine-tuning con DAgger: al estar entrenado con datos agregados, puede refinarse con correcciones humanas para mejorar la tasa de éxito en posiciones específicas.
- Docencia y prototipado en robótica de bajo coste: con 51,7 M de parámetros y 0,2 GB, se puede ejecutar en una GPU consumer o incluso en CPU para pruebas de latencia.
- Investigación en manipulación de precisión: el caso del ajedrez exige agarre de piezas pequeñas y colocación en casillas, un escenario útil para estudiar errores de percepción y control.
- Integración en pipelines LeRobot: se puede encadenar con `lerobot-record` y `lerobot-train` para generar nuevos datasets y reentrenar políticas en el mismo formato.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet." No hay tabla de éxito en robot real, ni comparación con otras políticas sobre el mismo dataset.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 para 51,7 M de parámetros; en la práctica, el cuello de botella son las dos cámaras (240x320 y 480x640) y el preprocesado, no el modelo.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente; RTX 3060, RTX 4090, A100 o H100 funcionan sin problema. También es viable en CPU para pruebas de baja frecuencia.
- Cabe en GPU consumer: sí, en cualquier GPU consumer moderna, incluidas las integradas con soporte CUDA.
- Opciones de despliegue: `lerobot-rollout` (CLI oficial), scripts de LeRobot en PyTorch; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a políticas robóticas.
- Latencia y throughput: no disponibles. La model card no publica frecuencia de inferencia ni latencia por chunk.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `corona314/act-so101-ajedrez-dagger-v2` | 51,7 M | no aplica | Ajedrez con SO-101 | apache-2.0 | Hugging Face Hub |
| ACT original (paper 2304.13705) | no disponible | no aplica | Manipulación general | no disponible | Paper + código de referencia |
| Diffusion Policy | no disponible | no aplica | Manipulación general | no disponible | Repos públicos |
| VQ-BeT | no disponible | no aplica | Manipulación general | no disponible | Repos públicos |

No se dispone de datos de rendimiento comparables entre estas políticas en la información proporcionada. La comparación se limita a categoría (imitation learning para manipulación) y licencia.

## Limitaciones y advertencias

- Entrenado para una única tarea ("chess") y un único tipo de robot (`so_follower`); no generaliza a otras tareas ni a otros brazos sin reentrenamiento.
- Sin resultados de evaluación publicados: se desconoce la tasa de éxito real en robot físico.
- Depende de la configuración exacta de cámaras (`ojos`, `cenital`) y de sus resoluciones; cambiar la disposición o los índices invalida la política.
- El dataset de entrenamiento es pequeño (147 episodios); el riesgo de sobreajuste y de fallo ante posiciones de tablero no vistas es alto.
- No hay información sobre sesgos, alucinación (no aplica en el sentido lingüístico) ni limitaciones idiomáticas.
- Licencia apache-2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte; verificar la licencia del dataset `chess_mezcla_v2` antes de uso comercial.
- El sufijo "dagger" no está documentado en la model card; no se detalla el procedimiento de agregación ni la composición final del dataset.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/corona314/act-so101-ajedrez-dagger-v2
- Dataset de entrenamiento: https://huggingface.co/datasets/corona314/chess_mezcla_v2
- Paper ACT: https://huggingface.co/papers/2304.13705
- Guía ACT de LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia: https://huggingface.co/docs/lerobot/main/en/inference
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=corona314/chess_mezcla_v2
