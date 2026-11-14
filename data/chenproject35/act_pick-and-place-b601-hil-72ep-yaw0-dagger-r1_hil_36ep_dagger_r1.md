# chenproject35/act_pick-and-place-b601-hil-72ep-yaw0-dagger-r1_hil_36ep_dagger_r1

## Resumen

El modelo `act_pick-and-place-b601-hil-72ep-yaw0-dagger-r1_hil_36ep_dagger_r1` es una política de imitación (imitation learning) entrenada con el método Action Chunking with Transformers (ACT), publicado en el paper arXiv:2304.13705. Lo desarrolla el usuario chenproject35 y está pensado para controlar un robot manipulador de tipo `rebot_b601_follower` en una tarea concreta de pick-and-place: recoger un objeto denominado "inreach2" y colocarlo en un utillaje (jig). No es un modelo de lenguaje: es una política visuomotora que consume estado de las articulaciones e imágenes de dos cámaras y emite comandos de acción de 7 dimensiones.

El modelo tiene 51.670.663 parámetros y se distribuye en formato safetensors dentro del ecosistema LeRobot (versión 0.6.2), con licencia Apache 2.0. El repositorio ocupa 5,0 GB, en gran parte por los checkpoints y artefactos de entrenamiento. La política se ha entrenado sobre un dataset propio de 85 episodios y 82.067 fotogramas a 30 FPS, e incorpora datos de intervención humana (HIL) y DAgger, lo que indica un proceso de corrección iterativa de errores típico en robótica de imitación.

Su relevancia es acotada pero clara: sirve como ejemplo reproducible de un pipeline completo de LeRobot para una tarea industrial de manipulación, y como punto de partida para quien quiera reentrenar o adaptar una política ACT a un robot similar. No sustituye a un modelo fundacional de robótica; es una política especializada y de nicho.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con codificador visual y decodificador de acciones |
| Parámetros totales | 51.670.663 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; política de control por pasos) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Librería | LeRobot 0.6.2 |
| Tipo de robot | `rebot_b601_follower` |
| Cámaras de entrada | `cam_front`, `cam_wrist` (3×480×640 cada una) |
| Entrada de estado | `observation.state` de forma (7,) |
| Salida de acción | `action` de forma (7,) |
| Pipeline | robotics |
| Descargas | 19 |
| Likes | 0 |

## Arquitectura y entrenamiento

ACT es un transformer diseñado para imitación visuomotora que predice fragmentos de acción (action chunks) en lugar de pasos individuales, lo que reduce el error de acumulación y mejora la estabilidad del control. La política recibe dos flujos visuales (`cam_front` y `cam_wrist`, 480×640) junto con el estado de 7 dimensiones del robot, y emite una acción de 7 dimensiones. El modelo tiene 51,67 M de parámetros, coherente con una política ACT de tamaño medio con codificador visual.

El entrenamiento se realizó sobre el dataset `chenproject35/pick-and-place-b601-hil-72ep-yaw0-dagger-r1`: 85 episodios, 82.067 fotogramas a 30 FPS, con una única tarea ("Pick up inreach2 and place it in the jig."). La configuración reportada incluye 27.864 pasos de entrenamiento, batch de 32, optimizador AdamW, learning rate de 1e-05 y semilla 1000. El nombre del modelo y del dataset indica el uso de HIL (human-in-the-loop) y DAgger para corregir errores durante el entrenamiento, una técnica habitual para mejorar la robustez de políticas de imitación en tareas de contacto. No se detalla la composición exacta del dataset ni si hubo aumentos de datos.

## Capacidades

- Control visuomotor de un robot manipulador `rebot_b601_follower` para una tarea concreta de pick-and-place.
- Predicción de chunks de acción de 7 dimensiones a partir de estado articular e imágenes de dos cámaras.
- Ejecución autónoma de la tarea "Pick up inreach2 and place it in the jig." mediante `lerobot-rollout`.
- Entrenamiento y reentrenamiento con `lerobot-train` sobre datasets compatibles.
- Integración con el ecosistema LeRobot (visualización de datasets, CLI, documentación).
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües: es una política robótica especializada.

## Casos de uso

- Automatización de pick-and-place en línea de montaje: la política ejecuta la secuencia de recogida y colocación en el jig sobre un robot `rebot_b601_follower`, adecuada para tareas repetitivas de alimentación de piezas.
- Prototipado rápido de políticas de imitación: sirve como referencia reproducible para validar el pipeline de LeRobot (grabación, entrenamiento, rollout) antes de escalar a tareas propias.
- Reentrenamiento con datos propios: el repositorio y la configuración de entrenamiento permiten adaptar la política a variantes de la tarea con `lerobot-train`, usando el dataset como plantilla.
- Investigación en HIL y DAgger: el nombre del modelo y del dataset documentan un flujo de corrección humana iterativa, útil para estudiar cómo mejora la robustez con intervenciones.
- Benchmark interno de manipulación: puede usarse como línea base de éxito en una tarea de colocación precisa para comparar con otras políticas (Diffusion Policy, VQ-BeT) en el mismo robot.
- Formación y demos: al ser un ejemplo completo y ligero (51,67 M de parámetros), es adecuado para talleres y tutoriales de robótica de imitación con LeRobot.
- Evaluación de robustez ante cambios de iluminación o posición: al no haber resultados publicados, sirve como caso de estudio para medir degradación fuera de distribución.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación en robot real ("No evaluation results have been provided for this policy yet.").

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 51,67 M de parámetros en precisión completa (FP32) el peso ronda los 0,2 GB, por lo que la inferencia cabe holgadamente en cualquier GPU consumer moderna.
- GPU recomendadas: no hay recomendación oficial; por tamaño, una RTX 3060/4060 o superior es suficiente para inferencia. Para entrenamiento con batch 32 y dos cámaras a 480×640 se recomienda una GPU con al menos 8-12 GB de VRAM (no confirmado por el autor).
- Cabe en GPU consumer: sí, por el tamaño del modelo; el cuello de botella es el procesamiento de imágenes, no los parámetros.
- Opciones de despliegue: LeRobot (`lerobot-rollout` con `--strategy.type=base`), con soporte de CUDA vía `--policy.device=cuda`. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles. El control se ejecuta a 30 FPS según el dataset, pero no se reporta latencia de inferencia medida.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ACT (este modelo) | 51,67 M | no aplica | Pick-and-place `rebot_b601_follower` | Apache 2.0 | Hugging Face, 19 descargas |
| Diffusion Policy | no disponible | no aplica | Políticas de imitación visuomotora | no disponible en esta ficha | Referencia académica |
| VQ-BeT | no disponible | no disponible | Políticas de imitación | no disponible en esta ficha | Referencia académica |

No se dispone de datos comparativos de rendimiento entre estas alternativas en la información proporcionada; la comparación se limita a categoría y disponibilidad.

## Limitaciones y advertencias

- Política especializada en una única tarea y un único robot (`rebot_b601_follower`); no es generalizable a otras tareas sin reentrenamiento.
- Sin resultados de evaluación publicados: no hay tasa de éxito medida en robot real, por lo que no puede afirmarse su robustez en producción.
- Riesgo de degradación fuera de distribución ante cambios de iluminación, posición de objetos, fondo o calibración de cámaras.
- Dependencia de la configuración exacta de cámaras (`cam_front`, `cam_wrist`) y de sus índices y nombres; un desajuste en las claves de observación impide la ejecución.
- El dataset es pequeño (85 episodios, 82.067 fotogramas) para una tarea de contacto; puede limitar la generalización.
- No soporta instrucciones en lenguaje natural ni tool calling; la tarea se fija en el prompt de rollout.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte; verificar el cumplimiento en despliegues industriales.
- El repositorio ocupa 5,0 GB, lo que puede ser pesado para entornos con almacenamiento limitado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/chenproject35/act_pick-and-place-b601-hil-72ep-yaw0-dagger-r1_hil_36ep_dagger_r1
- Dataset: https://huggingface.co/datasets/chenproject35/pick-and-place-b601-hil-72ep-yaw0-dagger-r1
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=chenproject35/pick-and-place-b601-hil-72ep-yaw0-dagger-r1
- Paper ACT: https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía ACT de LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
