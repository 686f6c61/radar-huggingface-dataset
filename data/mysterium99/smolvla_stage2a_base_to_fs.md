# mysterium99/smolvla_stage2a_base_to_fs

## Resumen

SmolVLA es un modelo compacto de visión-lenguaje-acción (VLA) desarrollado originalmente por Hugging Face dentro del ecosistema LeRobot, y descrito en el artículo arXiv:2506.01844. La ficha que nos ocupa, `mysterium99/smolvla_stage2a_base_to_fs`, es un fine-tuning del checkpoint base `lerobot/smolvla_base` realizado por el usuario mysterium99 sobre un conjunto de datos propio denominado `fs`. El modelo está diseñado para control robótico por imitación: recibe el estado de las articulaciones y tres cámaras, y emite un vector de acción de seis dimensiones.

El modelo resuelve el problema de desplegar políticas VLA en hardware de consumo, algo que los VLA de gran escala no permiten. Con 450 millones de parámetros y un repositorio de 0,9 GB en formato safetensors, es viable ejecutarlo en una GPU convencional. La tarea concreta para la que se ha ajustado es "Pick up the bolt and put it in the bucket", con 26 episodios y 38.356 fotogramas a 30 FPS.

Es relevante ahora porque ejemplifica el flujo de trabajo de ajuste fino de políticas robóticas con LeRobot 0.6.1 y porque demuestra la reproducibilidad del pipeline: cualquiera puede partir de `lerobot/smolvla_base` y especializarlo en una tarea concreta. No obstante, se trata de un artefacto de investigación sin evaluación publicada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) compacta, según SmolVLA (arXiv:2506.01844); detalles internos no disponibles en la información proporcionada |
| Parámetros totales | 450.046.176 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Biblioteca | lerobot |
| Modelo base | lerobot/smolvla_base |
| Tipo de robot | follower |
| Cámaras de entrada | gripper, newtop, newside |
| Entrada de estado | `observation.state` (6,) |
| Entrada visual | 3 cámaras, (3, 256, 256) cada una |
| Salida | `action` (6,) |
| Tamaño del repositorio | 0,9 GB |
| Pipeline | robotics |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de que se trata de un modelo SmolVLA, descrito en el artículo arXiv:2506.01844 como un VLA compacto y eficiente que logra rendimiento competitivo con costes computacionales reducidos y puede desplegarse en hardware de consumo. No se especifican en la ficha el número de capas, el codificador visual empleado, el backbone de lenguaje ni si incorpora mecanismos como atención lineal o decodificación especulativa.

El ajuste fino se realizó sobre el conjunto de datos `fs`, compuesto por 26 episodios y 38.356 fotogramas a 30 FPS para la tarea "Pick up the bolt and put it in the bucket". La configuración de entrenamiento fue de 20.000 pasos, batch size 8, optimizador AdamW, learning rate 0,0001, semilla 0 y LeRobot 0.6.1. No se indica si hubo RLHF, DPO ni qué composición tiene el dataset más allá de la tarea citada.

## Capacidades

- Control robótico por imitación: genera acciones de 6 dimensiones a partir del estado articular y de tres vistas de cámara.
- Percepción visual multi-cámara: procesa simultáneamente las imágenes de `gripper`, `newtop` y `newside` a resolución 256x256.
- Ejecución de una tarea manipulativa concreta: recoger un perno y depositarlo en un cubo.
- Integración con LeRobot: se ejecuta mediante `lerobot-rollout` y se reentrena mediante `lerobot-train`.
- No se documentan capacidades de tool calling, function calling, razonamiento multi-paso, generación de texto libre ni procesamiento de audio.
- Capacidades multilingües: no disponibles (no es un modelo de lenguaje conversacional).

## Casos de uso

- Automatización de una celda de pick-and-place: el modelo ejecuta la secuencia de recogida y depósito del perno sobre un robot follower, sustituyendo la programación explícita de trayectorias por una política aprendida.
- Prototipado rápido de políticas robóticas: al partir de `lerobot/smolvla_base` y ajustarse con 26 episodios, sirve como plantilla para validar un pipeline de imitación en pocas horas.
- Investigación en aprendizaje por imitación: permite reproducir el flujo de LeRobot 0.6.1 con una configuración de entrenamiento documentada (20.000 pasos, batch 8, AdamW, lr 1e-4).
- Despliegue en hardware de consumo: con 450 millones de parámetros y 0,9 GB de pesos, es viable en GPUs convencionales para experimentación en laboratorio.
- Benchmark interno de tareas de manipulación: sirve como línea base para comparar variantes de fine-tuning sobre el mismo dataset `fs`.
- Docencia y demostraciones: la tarea es simple y visualmente clara, lo que facilita explicar el ciclo observación-acción de un VLA en cursos o talleres.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye explícitamente la sección de evaluación vacía con la nota "_No evaluation results have been provided for this policy yet_", por lo que no existen tasas de éxito, métricas de MMLU, HumanEval, GSM8K ni equivalentes para esta política.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Con 450 millones de parámetros en safetensors (aproximadamente 1,8 GB en fp32 o 0,9 GB en fp16), la huella de pesos es reducida; el consumo adicional depende de los codificadores visuales y de los buffers de activación, no documentados.
- GPU recomendadas: no especificadas en la información proporcionada. El artículo de SmolVLA indica que puede desplegarse en hardware de consumo.
- Compatibilidad con GPU de consumo: previsiblemente sí, dado el tamaño del modelo y la afirmación del paper sobre hardware de consumo; no se detallan modelos concretos.
- Opciones de despliegue: LeRobot (`lerobot-rollout` para inferencia, `lerobot-train` para reentrenamiento). No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que además no aplican a un modelo de acción robótica.
- Latencia y throughput: no disponibles. La captura de datos se realizó a 30 FPS, pero no se indica la frecuencia de inferencia alcanzable.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mysterium99/smolvla_stage2a_base_to_fs | 450.046.176 | no disponible | Pick-and-place de un perno | apache-2.0 | Hugging Face (LeRobot) |
| lerobot/smolvla_base | no disponible en la información proporcionada | no disponible | VLA base para fine-tuning | no disponible en la información proporcionada | Hugging Face (LeRobot) |
| Otros VLA de gran escala (p. ej. RT-2, OpenVLA) | no disponibles en la información proporcionada | no disponible | Control robótico generalista | no disponible | no disponible |

La comparación cuantitativa con alternativas no es posible con los datos disponibles: no se han publicado métricas de rendimiento para esta política ni se detallan las especificaciones completas del modelo base.

## Limitaciones y advertencias

- Ausencia total de evaluación: no hay tasas de éxito ni pruebas en robot real publicadas, por lo que se desconoce su fiabilidad.
- Dataset muy reducido: 26 episodios y una única tarea limitan la generalización a variaciones de posición, iluminación, objetos o distractores.
- Especialización estrecha: la política está ajustada exclusivamente a "Pick up the bolt and put it in the bucket"; no se espera que funcione en otras tareas sin reentrenamiento.
- Dependencia de la configuración de hardware: las cámaras deben llamarse `gripper`, `newtop` y `newside` y corresponder a la disposición usada en el entrenamiento; un cambio de montaje o de robot invalida la política.
- Riesgo de alucinación: en el contexto de un VLA, se traduce en acciones erráticas o inseguras ante observaciones fuera de distribución; no hay salvaguardas documentadas.
- Sesgos: no documentados, pero inherentes a un dataset de un único operador, entorno y objeto.
- Licencia apache-2.0: permite uso comercial, pero el autor no ofrece garantías ni soporte; el despliegue en producción requiere validación propia.
- Idiomas: no aplica; el modelo no procesa lenguaje natural de forma conversacional más allá de la instrucción de tarea.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso comunitario ni de validación externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mysterium99/smolvla_stage2a_base_to_fs
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Artículo SmolVLA: https://huggingface.co/papers/2506.01844
- Guía de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Documentación de inferencia: https://huggingface.co/docs/lerobot/main/en/inference
- Dataset `fs`: https://huggingface.co/datasets/fs
- Visualizador de datasets de LeRobot: https://huggingface.co/spaces/lerobot/visualize_dataset?path=fs
