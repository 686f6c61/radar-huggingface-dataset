# jhd0313/act_move-box_chunk10

## Resumen

`jhd0313/act_move-box_chunk10` es una política de imitación basada en ACT (Action Chunking with Transformers) entrenada con LeRobot para la tarea robótica "Move the box" sobre un robot `so_follower` (SO-100/SO-101 de LeRobot). El modelo consume el estado articular de 6 dimensiones y dos cámaras (`overhead` y `wrist`, ambas a 480x640) y produce un vector de acción de 6 dimensiones. No es un modelo de lenguaje: es un controlador visuomotor que predice trozos de acción (*action chunks*) en lugar de pasos individuales, lo que reduce el error de composición y estabiliza la ejecución.

El modelo tiene 51.576.454 parámetros (dato real de los safetensors) y un tamaño de repositorio de 0,2 GB. Se entrenó durante 5000 pasos con batch size 8, optimizador AdamW y learning rate 1e-5 sobre un dataset propio de 50 episodios y 10.668 frames a 30 FPS. Es relevante como ejemplo reproducible de *imitation learning* de bajo coste: un usuario con hardware SO-100 puede replicar el pipeline completo con LeRobot 0.6.0 y el dataset público asociado.

La licencia es Apache 2.0, lo que permite uso comercial y modificación. No hay resultados de evaluación publicados, ni benchmarks, ni demo en vídeo en la model card, por lo que su rendimiento real en el robot solo puede verificarse ejecutándolo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer condicionado por observaciones visuales y de estado |
| Parámetros totales | 51.576.454 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (política visuomotora; horizonte de *chunk* de 10 pasos según el nombre del repo) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería `lerobot`) |
| Entradas | `observation.state` (6,), `observation.images.overhead` (3, 480, 640), `observation.images.wrist` (3, 480, 640) |
| Salidas | `action` (6,) |
| Robot objetivo | `so_follower` |
| Cámaras | `overhead`, `wrist` |
| Dataset de entrenamiento | `jhd0313/move-box_20261008_100955` (50 episodios, 10.668 frames, 30 FPS) |
| Pasos de entrenamiento | 5000 |
| Batch size | 8 |
| Optimizador | AdamW |
| Learning rate | 1e-5 |
| Semilla | 1000 |
| Versión de LeRobot | 0.6.0 |

## Arquitectura y entrenamiento

ACT es un método de *imitation learning* que combina un codificador visual (típicamente ResNet) con un transformer que predice secuencias de acciones de longitud fija (*chunks*). El nombre del repositorio (`chunk10`) sugiere un horizonte de predicción de 10 pasos por chunk. El modelo se condiciona conjuntamente por las dos imágenes (vista cenital y de muñeca) y por el estado articular de 6 dimensiones, y emite una acción de 6 dimensiones por paso. La predicción por chunks mitiga el problema de la varianza en el condicionamiento por estado y suaviza las trayectorias.

El entrenamiento se realizó desde cero (no se indica *fine-tuning* de un checkpoint previo) sobre 50 episodios teleoperados de la tarea "Move the box", con 10.668 frames a 30 FPS. No se documenta composición del dataset más allá de la tarea única, ni uso de RLHF/DPO (no aplica en este dominio). No hay información sobre aumentos de datos, resolución de entrada efectiva tras el *resize* ni sobre la inicialización de pesos del codificador visual.

## Capacidades

- Control visuomotor de un robot `so_follower` para la tarea concreta "Move the box", a partir de dos cámaras y del estado articular.
- Predicción de *action chunks* de 10 pasos, lo que permite ejecutar trayectorias más suaves y con menos deriva acumulada que un controlador paso a paso.
- Condicionamiento multimodal: fusión de imágenes cenital y de muñeca con el vector de estado de 6 dimensiones.
- Ejecución en bucle cerrado con `lerobot-rollout` a 30 FPS.
- No soporta *tool calling*, agentes, razonamiento multi-paso ni capacidades multilingües: es una política robótica, no un LLM.
- No incluye *thinking mode*, visión general, audio ni generación de texto.

## Casos de uso

- **Automatización de una tarea de picking-and-placing en laboratorio**: el modelo mueve una caja de una posición a otra usando las vistas cenital y de muñeca; adecuado para validar pipelines de imitación antes de escalar a tareas más complejas.
- **Reproducción de experimentos de ACT**: sirve como referencia reproducible (dataset público, hiperparámetros documentados, semilla fija) para comparar variantes de ACT en el mismo robot y dataset.
- **Base para *fine-tuning* en tareas similares**: al estar en formato LeRobot y con licencia Apache 2.0, se puede reentrenar con `lerobot-train` sobre nuevos datasets de manipulación con el mismo robot y configuración de cámaras.
- **Docencia y formación en robótica de imitación**: el tamaño reducido (51,6 M de parámetros, 0,2 GB) permite ejecutarlo y entrenarlo en una estación de trabajo con una sola GPU consumer.
- **Pruebas de integración de LeRobot 0.6.0**: útil para verificar la cadena `lerobot-rollout` con `--strategy.type=base`, calibración de cámaras y nombres de observaciones antes de desplegar políticas propias.
- **Evaluación de robustez frente a cambios de iluminación y posición**: al no haber resultados de evaluación publicados, el modelo es un buen candidato para medir empíricamente la degradación de éxito al variar posición inicial de la caja y condiciones de luz.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente: *"No evaluation results have been provided for this policy yet."*

## Requisitos de hardware

- **VRAM estimada para inferencia**: no disponible de forma oficial; con 51,6 M de parámetros en precisión completa (fp32) el peso ocupa aproximadamente 0,2 GB, por lo que la inferencia cabe holgadamente en cualquier GPU con al menos 2-4 GB de VRAM libre (más el coste de las dos cámaras a 480x640 y del codificador visual).
- **GPU recomendadas**: cualquier GPU NVIDIA con soporte CUDA (RTX 3060 en adelante) es suficiente; para entrenamiento, una RTX 4090 o A100 acelera los 5000 pasos, pero no son necesarias.
- **¿Cabe en GPU consumer?**: sí, con margen amplio, incluidas GTX/RTX de gama media y posiblemente CPU para inferencia a baja frecuencia (no documentado).
- **Opciones de despliegue**: `lerobot-rollout` (CLI oficial de LeRobot 0.6.0) con `--policy.path=jhd0313/act_move-box_chunk10`; el formato safetensors es compatible con PyTorch. No se documenta soporte para vLLM, TGI, llama.cpp ni Ollama (no aplican a este tipo de política).
- **Latencia y throughput**: no disponibles. El bucle de control opera a 30 FPS según el dataset; la latencia real depende del hardware y de la resolución de las cámaras.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Entradas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `jhd0313/act_move-box_chunk10` | ACT (chunk 10) | 51,6 M | estado 6D + 2 cámaras 480x640 | Apache 2.0 | Hugging Face |
| ACT original (paper 2304.13705) | ACT | no disponible en la información | estado + cámaras | investigación (paper) | paper y código de referencia |
| Otras políticas LeRobot (`act`, `diffusion`, `pi0`) | varias | variable | variable | variable | Hugging Face / LeRobot |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada; la comparación se limita a tipo de método, entradas y licencia.

## Limitaciones y advertencias

- **Sin evaluación publicada**: no hay tasas de éxito en robot real, por lo que el rendimiento es desconocido hasta que se ejecute.
- **Tarea única**: entrenado exclusivamente para "Move the box"; no generaliza a otras tareas sin reentrenamiento.
- **Dataset pequeño**: 50 episodios y 10.668 frames; propenso a sobreajuste a posiciones, iluminación y disposición concretas del entorno de grabación.
- **Dependencia de la configuración de cámaras**: los nombres `overhead` y `wrist` y las resoluciones 480x640 deben coincidir exactamente con las observaciones de entrenamiento; un cambio de montaje o de índice de cámara invalida la política.
- **Dependencia del robot**: diseñado para `so_follower`; no se garantiza transferencia a otro robot aunque sea del mismo tipo sin recalibración.
- **Riesgo de alucinación**: no aplica en el sentido de LLM, pero sí existe riesgo de acciones erróneas o inseguras fuera de la distribución de entrenamiento; se recomienda supervisión y parada de emergencia.
- **Licencia Apache 2.0**: permite uso comercial, pero el autor no ofrece garantías; el usuario asume la responsabilidad del despliegue físico.
- **Sin información sobre sesgos**: no disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jhd0313/act_move-box_chunk10
- Dataset de entrenamiento: https://huggingface.co/datasets/jhd0313/move-box_20261008_100955
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=jhd0313/move-box_20261008_100955
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia: https://huggingface.co/docs/lerobot/main/en/inference
- Repositorio LeRobot: https://github.com/huggingface/lerobot
