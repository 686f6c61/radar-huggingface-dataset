# SebRivGar/train_act_policy2

## Resumen

`SebRivGar/train_act_policy2` es una política de imitación basada en ACT (Action Chunking with Transformers) entrenada con LeRobot para el robot `so_follower`. No es un modelo de lenguaje: es un modelo de robótica que mapea observaciones multimodales (estado articular de 6 dimensiones y dos cámaras RGB de 480x640) a comandos de acción de 6 dimensiones. Resuelve una tarea concreta de manipulación: "Grasp green cube" (agarrar un cubo verde).

El modelo tiene 51.668.614 parámetros y se distribuye en formato safetensors dentro de un repositorio de 0,2 GB. Fue entrenado durante 25.000 pasos con batch size 8, optimizador AdamW y learning rate 1e-05 sobre el dataset `SebRivGar/training-record2`, que contiene 100 episodios y 58.863 frames a 30 FPS. La relevancia es acotada: se trata de una política de imitación de propósito específico, útil como referencia para reproducir el flujo de entrenamiento de ACT en LeRobot o como base para tareas de pick-and-place con el SO-100/SO-101.

No hay información publicada sobre licencia, idiomas ni resultados de evaluación en robot real. La model card indica explícitamente que no se han proporcionado resultados de evaluación, por lo que cualquier uso en producción requeriría validación propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con encoder visual y decoder de acciones |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; política de imitación por chunk de acciones) |
| Tipos de cuantizacion | no disponible (pesos safetensors en precisión de entrenamiento) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT es un método de imitation learning que predice chunks de acciones cortos en lugar de pasos individuales, lo que reduce el error de compounding y suele lograr tasas de éxito altas en tareas de manipulación. La política consume `observation.state` con shape `(6,)` y dos imágenes RGB (`wrist` y `top`) de `(3, 480, 640)`, y produce una acción de `(6,)`. El modelo emplea un transformer con encoder visual y un decoder que genera secuencias de acciones; el repositorio no detalla la configuración interna de capas, dimensiones ocultas ni número de heads.

El entrenamiento se realizó con LeRobot 0.6.2 durante 25.000 pasos, batch size 8, optimizador AdamW, learning rate 1e-05 y semilla 1000, sobre el dataset `SebRivGar/training-record2` (100 episodios, 58.863 frames a 30 FPS, tarea "Grasp green cube"). No se especifica si hubo aumentos de datos, normalización de acciones ni composición exacta del dataset más allá de la tarea única. No se documentan innovaciones adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Control robótico de manipulación: genera comandos de acción de 6 dimensiones para el robot `so_follower` a partir de estado articular y dos vistas de cámara.
- Percepción visual multimodal: procesa simultáneamente las cámaras `wrist` y `top` a 480x640 y 30 FPS.
- Ejecución de una tarea específica de pick-and-place: "Grasp green cube".
- Predicción de chunks de acciones (ACT), lo que permite ejecutar secuencias cortas de movimiento de forma más estable que políticas paso a paso.
- Integración con el ecosistema LeRobot: compatible con `lerobot-rollout` y `lerobot-train`.
- No soporta tool calling, function calling, agentes multi-paso, razonamiento textual, código, matemáticas, visión general, audio ni capacidades multilingües.

## Casos de uso

- Reproducción del pipeline de imitation learning con ACT: sirve como ejemplo completo de entrenamiento y despliegue en LeRobot para validar la instalación, el formateo de datos y el rollout en un SO-100/SO-101.
- Automatización de pick-and-place de objetos verdes en entornos controlados: el modelo puede ejecutar la tarea "Grasp green cube" sobre un `so_follower` con cámara de muñeca y cámara cenital, siempre que las condiciones de iluminación y posiciones se parezcan a las del dataset.
- Base para fine-tuning en tareas de agarre similares: al ser una política ACT de 51,7 M de parámetros, se puede reentrenar con un dataset propio de pocos centenares de episodios para nuevas geometrías de objeto.
- Benchmark interno de políticas de imitación: útil como línea base para comparar variantes de ACT (por ejemplo, con o sin cámara cenital) en el mismo robot y tarea.
- Docencia y prototipado en robótica de bajo coste: el tamaño del repositorio (0,2 GB) y el número de parámetros permiten iterar en una sola GPU consumer.
- Validación de infraestructura de teleoperación: el modelo permite comprobar que la calibración del robot, los índices de cámara y el frame rate de 30 FPS coinciden con los esperados antes de grabar un dataset nuevo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet."

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 51,7 M de parámetros en fp32 el peso ronda los 0,2 GB, por lo que la VRAM dominante la marcan las dos cámaras de 480x640 y los buffers de inferencia, no el modelo.
- GPU recomendadas: cualquier GPU con soporte CUDA es suficiente; una RTX 3060 o superior permite ejecutar el rollout a 30 FPS sin problemas.
- Cabe en GPU consumer: sí, en cualquier GPU consumer moderna (RTX 20xx en adelante) e incluso en CPU para inferencia a baja frecuencia.
- Opciones de despliegue: `lerobot-rollout` con `--strategy.type=base` (comando documentado en la model card); el entrenamiento se realiza con `lerobot-train` y `--policy.type=act`.
- Latencia y throughput estimados: no disponibles; el sistema debe sostener 30 FPS para coincidir con la frecuencia de entrenamiento, pero no se publican mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `SebRivGar/train_act_policy2` | 51,7 M | no aplica | Grasp green cube (SO follower) | no disponible | HuggingFace, 0 descargas |
| Políticas ACT de referencia en LeRobot | no disponible | no aplica | Tareas de manipulación diversas | generalmente Apache-2.0 (LeRobot) | HuggingFace Hub |
| Políticas Diffusion Policy | no disponible | no aplica | Manipulación visomotora | según repositorio | HuggingFace Hub / repos de investigación |
| Políticas VLA tipo OpenVLA | ~7 B | variable | Manipulación generalista | según modelo | HuggingFace Hub |

La comparación cuantitativa con alternativas no está disponible en la información proporcionada; los modelos citados son referencias de categoría, no resultados medidos frente a esta política.

## Limitaciones y advertencias

- No hay resultados de evaluación en robot real: la model card declara que no se han proporcionado, por lo que la tasa de éxito es desconocida.
- Entrenada para una única tarea ("Grasp green cube") y un único tipo de robot (`so_follower`); no generaliza a otras tareas ni a otros robots sin reentrenamiento.
- Depende de la configuración exacta de cámaras: los nombres `wrist` y `top`, la resolución 480x640 y los 30 FPS deben coincidir con los del entrenamiento.
- Sensible a cambios de iluminación, posición de objetos, distractores y calibración del robot, como es habitual en imitation learning.
- Licencia no disponible: no se puede asumir uso comercial sin consultar al autor.
- Sin información sobre sesgos, alucinación (no aplica en el sentido de LLM) ni limitaciones idiomáticas, al no ser un modelo de lenguaje.
- El repositorio tiene 0 descargas y 0 likes, y fue creado/actualizado en noviembre de 2026 según los metadatos, lo que sugiere que es un artefacto de entrenamiento personal sin validación comunitaria.
- No se documenta la composición del dataset más allá de la tarea, ni procesos de RLHF/DPO (no aplicables a este tipo de política).

## Enlaces

- HuggingFace del modelo: https://huggingface.co/SebRivGar/train_act_policy2
- Dataset de entrenamiento: https://huggingface.co/datasets/SebRivGar/training-record2
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=SebRivGar/training-record2
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de instalación: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guía de grabación y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
