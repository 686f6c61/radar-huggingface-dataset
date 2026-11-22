# murv2026/act_ur3_pick_cube_s13_chunk30

## Resumen

`act_ur3_pick_cube_s13_chunk30` es una política de aprendizaje por imitación basada en Action Chunking with Transformers (ACT), entrenada con LeRobot sobre un dataset de teleoperación de un robot UR3 en una tarea de recogida de un cubo. El modelo predice secuencias cortas de acciones (chunks de 30 pasos) en lugar de acciones individuales, lo que reduce el error de acumulación y estabiliza el control en tareas de manipulación de precisión.

Lo publica el usuario `murv2026` en Hugging Face con licencia Apache 2.0 y un total de 51.605.127 parámetros (aproximadamente 51,6 M). No es un modelo de lenguaje: es un checkpoint de robótica dentro del ecosistema LeRobot, pensado para ejecutarse en bucle cerrado sobre el robot físico o en simulación. La relevancia es práctica: demuestra el flujo completo de entrenamiento y despliegue de políticas ACT con LeRobot para una tarea concreta de pick-and-place.

El contexto y los idiomas no aplican en el sentido habitual de un LLM; el modelo consume observaciones (imágenes y estado de las articulaciones) y emite comandos de actuación. Su interés está en servir como referencia reproducible para quien quiera entrenar políticas de manipulación con el mismo pipeline.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con encoder visual y decodificador de acciones |
| Parametros totales | 51.605.127 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de contexto textual; opera sobre observaciones por paso) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo linguistico) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 0,2 GB) |

## Arquitectura y entrenamiento

ACT combina un backbone de visión (encoder de imágenes de las cámaras del robot) con un transformer que decodifica un chunk de acciones futuras de forma conjunta, en lugar de predecir una sola acción por paso. Esta predicción por chunks, junto con la agregación temporal (temporal ensembling) en inferencia, mitiga el error compounding típico de las políticas de imitación y permite movimientos más suaves y precisos.

El entrenamiento es de imitación supervisada a partir de datos teleoperados. El dataset asociado es `murv2026/ur3_task_pick_cube_20261120_181029_s13`, correspondiente a la tarea de recogida de un cubo con un UR3. El nombre del checkpoint indica chunks de 30 pasos (`chunk30`) y la sesión 13 (`s13`). No se dispone de información sobre el número exacto de episodios, la composición de las cámaras ni si se aplicaron aumentos de datos; estos datos no están disponibles en la información proporcionada.

## Capacidades

- Control de manipulación robótica: genera comandos de articulaciones para ejecutar una tarea de pick-and-place sobre un UR3.
- Predicción de chunks de acción de 30 pasos, con salida de trayectorias cortas coherentes.
- Aprendizaje por imitación a partir de demostraciones teleoperadas.
- Integración nativa con el ecosistema LeRobot para entrenamiento, evaluación e inferencia.
- Ejecución en bucle cerrado con observaciones visuales y de estado del robot.
- No dispone de capacidades de lenguaje, razonamiento simbólico, tool calling ni agentes multi-paso en el sentido de un LLM.

## Casos de uso

- Automatización de pick-and-place en laboratorio: el modelo ejecuta la secuencia de aproximación, agarre y elevación del cubo sobre un UR3, sirviendo como base para tareas de ensamblaje sencillas.
- Prototipado rápido de políticas con LeRobot: permite reproducir el pipeline `lerobot-train` / `lerobot-record` y evaluar la política en 10 episodios con `--policy.path` apuntando al checkpoint.
- Benchmark interno de manipulación: al ser un checkpoint pequeño (51,6 M de parámetros), se puede usar como línea base para comparar nuevas políticas ACT o variantes sobre la misma tarea.
- Investigación en aprendizaje por imitación: útil para estudiar el efecto del tamaño de chunk (30 pasos) y del ensembling temporal en la estabilidad del control.
- Formación y docencia en robótica: ejemplo completo y reproducible de entrenamiento de una política desde un dataset teleoperado hasta la inferencia en robot real.
- Despliegue en entornos con recursos limitados: el reducido tamaño del modelo permite inferencia en GPU de consumo o incluso en CPU para pruebas de integración.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 para 51,6 M de parámetros; en la práctica, el consumo lo dominan los buffers de imagen y el runtime, no los pesos.
- GPU recomendadas: cualquier GPU con CUDA, incluidas RTX 3060/4060/4090; también es viable en CPU para pruebas.
- Cabe en GPU de consumo sin problema; incluso en iGPU o CPU para evaluación offline.
- Opciones de despliegue: LeRobot (`lerobot-record` con `--policy.path`), con backend PyTorch; no se documentan exportaciones a ONNX, TensorRT ni GGUF.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| act_ur3_pick_cube_s13_chunk30 | 51,6 M | ACT (LeRobot) | no aplica | Apache 2.0 | Hugging Face |
| Otras políticas ACT en LeRobot Hub | variable | ACT | no aplica | variable | Hugging Face |
| Políticas Diffusion Policy | variable | diffusion | no aplica | variable | Hugging Face / repos |
| Políticas VLA (p. ej. RT-2, OpenVLA) | cientos de M a miles de M | VLA | no disponible | variable | Hugging Face / repos |

No se dispone de datos comparativos de rendimiento entre estos modelos en la información proporcionada; la comparación se limita a categoría, tamaño y licencia.

## Limitaciones y advertencias

- Especialización estrecha: entrenado solo para la tarea `pick_cube` sobre un UR3 concreto; no generaliza a otras tareas, objetos o robots sin reentrenamiento.
- Dependencia del dataset de teleoperación: el rendimiento está acotado por la calidad y variedad de las demostraciones de la sesión 13.
- Riesgo de fallo ante cambios de iluminación, posición de cámara, fondo o variaciones del objeto no presentes en el entrenamiento.
- No es un modelo de lenguaje: no procesa texto, no responde a instrucciones en lenguaje natural y no soporta tool calling.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre el comportamiento en producción ni sobre seguridad física del robot.
- Sin métricas publicadas de éxito, robustez ni latencia; se recomienda evaluación exhaustiva en el entorno real antes de cualquier despliegue.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria del checkpoint.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/murv2026/act_ur3_pick_cube_s13_chunk30
- Dataset asociado: https://huggingface.co/datasets/murv2026/ur3_task_pick_cube_20261120_181029_s13
- Paper ACT (arXiv:2304.13705): https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Documentación LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de políticas: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
