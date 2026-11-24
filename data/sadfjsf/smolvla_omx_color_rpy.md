# sadfjsf/smolvla_omx_color_rpy

## Resumen

SmolVLA es un modelo compacto de visión-lenguaje-acción (VLA) desarrollado por Hugging Face, orientado a control robótico mediante imitación y desplegable en hardware de consumo. Esta ficha concreta corresponde a un fine-tuning del modelo base `lerobot/smolvla_base` realizado por el usuario `sadfjsf` sobre el dataset `choijunpyo/OMX_color_RPY`, especializado en tareas de manipulación de bloques de colores con un robot OMX. El modelo consume el estado articular del robot (6 dimensiones) junto con tres cámaras de 256x256 píxeles y produce acciones de 6 dimensiones, todo ello dentro del ecosistema LeRobot.

Con 450 millones de parámetros y un repositorio de 0,9 GB, el modelo está pensado para ejecutarse en una GPU de gama media o incluso en hardware integrado, algo poco habitual en el espacio VLA, donde los modelos suelen superar los miles de millones de parámetros. La licencia Apache 2.0 permite uso comercial sin restricciones adicionales, lo que lo hace atractivo para prototipado rápido en robótica de laboratorio.

Este checkpoint es relevante como ejemplo de fine-tuning de bajo coste: 20.000 pasos de entrenamiento, batch de 32 y una tasa de aprendizaje de 1e-4 sobre un dataset de 180 episodios y 52.791 fotogramas a 15 FPS. No obstante, el autor no ha publicado resultados de evaluación en robot real, por lo que su rendimiento efectivo en la tarea de picking no está verificado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) compacta, basada en SmolVLA (paper arXiv:2506.01844) |
| Parámetros totales | 450.046.176 |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Librería | LeRobot 0.7.1 |
| Modelo base | lerobot/smolvla_base |
| Tipo de robot | omx_follower_current |
| Entradas | observation.state (6,), 3 cámaras visuales (3, 256, 256) |
| Salidas | action (6,) |
| Dataset de entrenamiento | choijunpyo/OMX_color_RPY (180 episodios, 52.791 fotogramas, 15 FPS) |
| Pasos de entrenamiento | 20.000 |
| Tamaño del repositorio | 0,9 GB |

## Arquitectura y entrenamiento

SmolVLA es una arquitectura VLA compacta que combina un codificador visual y un codificador de lenguaje con un cabezal de acciones, siguiendo el paradigma de los modelos visión-lenguaje-acción. El modelo base fue presentado en el paper arXiv:2506.01844, que describe un diseño orientado a reducir el coste computacional manteniendo un rendimiento competitivo frente a modelos VLA de mayor tamaño. Esta ficha corresponde a un fine-tuning supervisado por imitación (behavior cloning) sobre el checkpoint `lerobot/smolvla_base`, no a un entrenamiento desde cero.

El entrenamiento se realizó con LeRobot 0.7.1 durante 20.000 pasos, con batch de 32, optimizador AdamW, tasa de aprendizaje 1e-4 y semilla 1000. El dataset `choijunpyo/OMX_color_RPY` contiene 180 episodios y 52.791 fotogramas a 15 FPS, con tres tareas de picking: coger un bloque amarillo, rojo o morado y depositarlo en una caja. Las observaciones incluyen el estado articular de 6 dimensiones y tres cámaras (muñeca y superior, según la model card). No se documenta el uso de RLHF, DPO ni técnicas de refinamiento posteriores al entrenamiento por imitación. Tampoco se especifica el número de tokens de entrenamiento ni la composición detallada del dataset más allá de las tres tareas mencionadas.

## Capacidades

- Control robótico por imitación: genera acciones de 6 dimensiones a partir del estado articular y de tres cámaras, adecuado para tareas de manipulación tipo pick-and-place.
- Percepción visual multi-cámara: procesa tres flujos de imagen de 256x256 píxeles, lo que permite cierta robustez ante oclusiones parciales.
- Ejecución de instrucciones en lenguaje natural: acepta una descripción de tarea (por ejemplo, "pick the yellow block and place it in the box") como condicionamiento.
- Despliegue en hardware de consumo: su tamaño de 450 millones de parámetros permite inferencia en GPUs de gama media.
- Integración con LeRobot: compatible con los comandos `lerobot-rollout` y `lerobot-train` para ejecución y reentrenamiento.
- Especialización en tres tareas concretas: picking de bloques amarillo, rojo y morado.
- No se documentan capacidades de tool calling, razonamiento multi-paso, agentes autónomos, visión general, audio ni modo thinking.

## Casos de uso

- Prototipado de pick-and-place en laboratorio: el modelo puede ejecutar las tres tareas de picking para las que fue entrenado sobre un robot OMX, permitiendo validar pipelines de imitación sin invertir en GPUs de datacenter.
- Investigación en aprendizaje por imitación: sirve como punto de partida para estudiar el efecto del número de episodios, la resolución de cámara o la inclusión de distractores en el rendimiento de políticas VLA compactas.
- Docencia y formación en robótica: su bajo coste computacional y la licencia Apache 2.0 facilitan su uso en cursos universitarios donde se enseña a entrenar y desplegar políticas con LeRobot.
- Fine-tuning sobre nuevos datasets: al estar construido sobre `lerobot/smolvla_base`, puede reentrenarse con `lerobot-train` para nuevas tareas de manipulación con el mismo tipo de robot y configuración de cámaras.
- Benchmarking de políticas compactas: útil como línea base para comparar arquitecturas VLA pequeñas frente a modelos de mayor tamaño en tareas de manipulación controladas.
- Automatización de tareas repetitivas en células de fabricación ligeras: aunque limitado a las tres tareas entrenadas, puede integrarse en flujos donde la variabilidad de posiciones y colores sea baja.
- Validación de hardware de bajo coste: permite comprobar si una GPU consumer o un dispositivo embebido es suficiente para ejecutar políticas VLA en tiempo real a 15 FPS.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet". No se dispone de tasas de éxito en robot real, ni de comparaciones con otras políticas sobre el mismo dataset.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 450 millones de parámetros en precisión FP32 se requieren aproximadamente 1,8 GB solo para los pesos, y en FP16 alrededor de 0,9 GB, a lo que hay que sumar el coste de los tres codificadores visuales y el estado de inferencia.
- GPU recomendadas: no especificadas por el autor. Por tamaño, una RTX 3060, RTX 4060 o RTX 4090 deberían ser suficientes; también cabría en GPUs de datacenter como A100 o H100, aunque estarían sobredimensionadas.
- ¿Cabe en GPU consumer? Sí, por el número de parámetros es probable que quepa en GPUs consumer con al menos 8 GB de VRAM, aunque no se ha verificado en la información disponible.
- Opciones de despliegue: LeRobot (`lerobot-rollout`) es la vía documentada. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que además no son adecuados para un modelo de robótica de este tipo.
- Latencia y throughput: no disponibles. El dataset se grabó a 15 FPS, lo que sugiere que la política debe operar al menos a esa frecuencia, pero no se documenta la latencia real de inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| sadfjsf/smolvla_omx_color_rpy | 450 M | no disponible | Pick-and-place de bloques (3 tareas) | Apache 2.0 | Hugging Face |
| lerobot/smolvla_base | no disponible en la información proporcionada | no disponible | VLA generalista base para fine-tuning | Apache 2.0 | Hugging Face |
| Otros VLA de gran tamaño (p. ej., RT-2, OpenVLA) | no disponible en la información proporcionada | no disponible | Manipulación generalista | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada. La comparación se limita a parámetros, licencia y disponibilidad, y en el caso de los VLA de gran tamaño no se han podido verificar cifras concretas.

## Limitaciones y advertencias

- Ausencia de evaluación: no hay tasas de éxito publicadas en robot real, por lo que se desconoce si la política funciona de forma fiable fuera del dataset de entrenamiento.
- Especialización estrecha: solo se ha entrenado para tres tareas de picking de bloques de colores concretos; no generaliza a otras tareas, objetos o disposiciones sin reentrenamiento.
- Dependencia del hardware: requiere un robot `omx_follower_current` y una configuración de tres cámaras con nombres específicos (`wrist`, `top` y una tercera no detallada), lo que limita su portabilidad.
- Riesgo de sobreajuste: 20.000 pasos sobre 180 episodios es un régimen propenso a sobreajuste; no se documentan técnicas de regularización ni aumentación de datos.
- Sesgos: no se documentan sesgos conocidos, pero al entrenarse sobre un dataset pequeño y específico, el modelo puede fallar ante variaciones de iluminación, posiciones de objetos o distractores no presentes en los datos.
- Alucinación: en el contexto de políticas VLA, el riesgo se traduce en acciones erróneas o inseguras; no hay mecanismos de seguridad documentados.
- Idiomas: no se especifican; las instrucciones de tarea están en inglés y no se ha verificado soporte multilingüe.
- Licencia: Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte; el uso en producción requiere validación propia.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de uso comunitario ni de validación externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sadfjsf/smolvla_omx_color_rpy
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/choijunpyo/OMX_color_RPY
- Paper de SmolVLA: https://huggingface.co/papers/2506.01844
- Guía de LeRobot para SmolVLA: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot en GitHub: https://github.com/huggingface/lerobot
- Documentación de inferencia: https://huggingface.co/docs/lerobot/main/en/inference
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=choijunpyo/OMX_color_RPY
