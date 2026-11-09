# sksak/act_block

## Resumen

`sksak/act_block` es una política de aprendizaje por imitación basada en Action Chunking with Transformers (ACT), publicada en Hugging Face Hub mediante la librería LeRobot. No es un modelo de lenguaje: es un controlador robótico entrenado para ejecutar una tarea física concreta, en este caso mover un bloque de madera hasta un cuenco verde ("wooden block to green bowl"), sobre un robot de tipo `so_follower` con dos cámaras (muñeca y cenital). El repositorio lo mantiene el usuario `sksak` y el modelo se generó automáticamente con el flujo de entrenamiento de LeRobot 0.6.2.

El modelo tiene 51.668.614 parámetros (unos 51,7 millones) y un tamaño de repositorio de 0,2 GB en formato safetensors. Consume una observación compuesta por el estado articular de 6 dimensiones y dos imágenes RGB de 480x640, y produce una acción de 6 dimensiones. Fue entrenado durante 40.000 pasos con batch size 8, optimizador AdamW y learning rate de 1e-5 sobre un dataset de 140 episodios y 35.024 fotogramas a 30 FPS.

Su relevancia es acotada pero clara: sirve como ejemplo reproducible de un pipeline completo de imitación en robótica de bajo coste con LeRobot, y como punto de partida para quien quiera replicar la tarea o reentrenar con sus propios datos. No hay resultados de evaluación publicados ni información sobre licencia o idiomas, por lo que su uso en producción requiere validación propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), política de imitación |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (política robótica; no aplica ventana de contexto textual) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Libreria | lerobot |
| Pipeline | robotics |
| Tipo de robot | `so_follower` |
| Camaras | `wrist`, `top` (480x640, 3 canales) |
| Entrada de estado | `observation.state` de forma (6,) |
| Salida de accion | `action` de forma (6,) |
| Tamano del repositorio | 0,2 GB |
| Dataset de entrenamiento | `sksak/block_20261108_185930` (140 episodios, 35.024 fotogramas, 30 FPS) |
| Tarea | "wooden block to green bowl" |
| Pasos de entrenamiento | 40.000 |
| Batch size | 8 |
| Optimizador | AdamW |
| Learning rate | 1e-5 |
| Semilla | 1000 |
| Version de LeRobot | 0.6.2 |

## Arquitectura y entrenamiento

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación que predice trozos cortos de acciones (chunks) en lugar de pasos individuales, lo que reduce el error de acumulación y mejora la estabilidad en tareas de manipulación. La política combina un codificador visual para las dos cámaras (`wrist` y `top`), un codificador del estado articular y un transformer que genera la secuencia de acciones. El modelo se entrenó con datos de teleoperación del dataset `sksak/block_20261108_185930`, compuesto por 140 episodios y 35.024 fotogramas a 30 FPS, todos ellos correspondientes a la misma tarea.

El entrenamiento se realizó con LeRobot 0.6.2 durante 40.000 pasos, batch size 8, optimizador AdamW y learning rate 1e-5, con semilla 1000. No se especifica en la información disponible si hubo aumento de datos, regularización adicional ni variaciones de la arquitectura estándar de ACT. Tampoco se documentan innovaciones técnicas adicionales más allá del propio mecanismo de action chunking descrito en el paper de referencia (arXiv:2304.13705).

## Capacidades

- Control robótico de manipulación: genera comandos de acción de 6 dimensiones a partir de observaciones visuales y de estado articular.
- Percepción visual multimodal: procesa simultáneamente dos flujos de imagen RGB (muñeca y cenital) a 480x640.
- Aprendizaje por imitación: reproduce comportamientos aprendidos de demostraciones teleoperadas.
- Predicción de chunks de acción: emite secuencias cortas de acciones en lugar de pasos aislados, lo que mejora la suavidad y la robustez.
- Ejecución de una tarea concreta: "wooden block to green bowl" sobre robot `so_follower`.
- No soporta tool calling, function calling, agentes multi-paso, razonamiento textual ni capacidades multilingües, al no ser un modelo de lenguaje.

## Casos de uso

- Replicación de la tarea de pick-and-place: el modelo puede ejecutarse directamente sobre un robot `so_follower` con las cámaras `wrist` y `top` para mover un bloque de madera a un cuenco verde, usando el comando `lerobot-rollout` documentado en la model card.
- Punto de partida para reentrenamiento: sirve como base para entrenar variantes de la misma tarea con `lerobot-train` y un dataset propio, ajustando el tipo de robot y las cámaras.
- Docencia y divulgación en robótica de imitación: ejemplo reproducible y de tamaño reducido (0,2 GB, 51,7 M de parámetros) para explicar el pipeline completo de LeRobot, desde la grabación de datos hasta el despliegue.
- Benchmark interno de referencia: útil como línea base para comparar nuevas políticas ACT o variantes sobre la misma tarea y el mismo robot.
- Prototipado de automatización de laboratorio: para tareas de clasificación o traslado de objetos pequeños en entornos controlados con iluminación y posiciones similares a las del dataset.
- Validación de hardware y calibración: al ejecutar la política se comprueba el correcto funcionamiento de cámaras, puertos y cinemática del robot `so_follower` antes de abordar tareas más complejas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación para esta política ("No evaluation results have been provided for this policy yet").

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 51,7 M de parámetros en safetensors, el peso en FP32 ronda los 0,2 GB, por lo que la inferencia cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: no se especifican; por tamaño, cualquier GPU con al menos 4 GB de VRAM es suficiente, incluidas GTX 1650, RTX 3060, RTX 4090, A100 o H100.
- Cabe en GPU consumer: sí, con margen amplio; también podría ejecutarse en CPU para inferencia, aunque no se documenta latencia.
- Opciones de despliegue: LeRobot (`lerobot-rollout`, `lerobot-train`), con soporte para `--policy.device=cuda`; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `sksak/act_block` | 51,7 M | no aplica | "wooden block to green bowl" sobre `so_follower` | no disponible | Hugging Face Hub |
| `SkalskiP/SO-ARM101-blocks-act` | no disponible | no aplica | Manipulación de bloques con SO-ARM101 | no disponible | Hugging Face Hub |
| `SkalskiP/SO-ARM101-blocks-act-v3` | no disponible | no aplica | Manipulación de bloques con SO-ARM101 (v3) | no disponible | Hugging Face Hub |

Los dos modelos de SkalskiP son políticas ACT para el robot SO-ARM101 centradas en tareas con bloques, por lo que son las alternativas más cercanas encontradas en la búsqueda. No se dispone de sus especificaciones completas ni de resultados de evaluación que permitan una comparación cuantitativa.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al entrenarse con un único dataset y una única tarea, la política puede sobreajustarse a las posiciones, iluminación y objetos concretos de las demostraciones.
- Riesgo de alucinación: no aplica en el sentido textual, pero sí existe riesgo de acciones erróneas o inseguras fuera de la distribución de entrenamiento.
- Limitaciones de contexto o idioma: no aplica ventana de contexto textual; la política solo ejecuta la tarea "wooden block to green bowl" y no generaliza a otras instrucciones.
- Restricciones de licencia: la licencia no está disponible, por lo que no se puede confirmar el uso comercial sin consultar al autor.
- Caveats para producción: no hay resultados de evaluación publicados; el repositorio tiene 0 descargas y 0 likes, lo que sugiere poca validación externa; requiere un robot `so_follower` con cámaras `wrist` y `top` y calibración correcta; el dataset de entrenamiento es específico y limitado (140 episodios).
- Advertencia de seguridad: la ejecución sobre hardware real debe hacerse en un entorno controlado y con supervisión, dado que no se documentan límites de par, velocidades ni paradas de emergencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sksak/act_block
- Dataset de entrenamiento: https://huggingface.co/datasets/sksak/block_20261108_185930
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=sksak/block_20261108_185930
- Paper de ACT: https://huggingface.co/papers/2304.13705 (arXiv:2304.13705)
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia: https://huggingface.co/docs/lerobot/main/en/inference
- Alternativa similar: https://huggingface.co/SkalskiP/SO-ARM101-blocks-act
- Alternativa similar: https://huggingface.co/SkalskiP/SO-ARM101-blocks-act-v3
