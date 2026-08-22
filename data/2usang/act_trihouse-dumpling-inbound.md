# 2usang/act_trihouse-dumpling-inbound

## Resumen

El modelo `2usang/act_trihouse-dumpling-inbound` es una política de control robótico basada en el método Action Chunking with Transformers (ACT), desarrollada por el usuario de Hugging Face 2usang y publicada bajo licencia Apache-2.0. ACT es una técnica de aprendizaje por imitación que predice secuencias de acciones (chunks) en lugar de pasos individuales, lo que mejora la estabilidad y el éxito en tareas de manipulación. El modelo ha sido entrenado con el framework LeRobot sobre el dataset `2usang/trihouse-dumpling-inbound`, que contiene demostraciones teleoperadas de una tarea de manipulación de dumplings en un entorno tipo "trihouse".

Con 51,6 millones de parámetros, es un modelo compacto diseñado para ejecutarse en robots de bajo coste como el SO-100. Su relevancia radica en ser un ejemplo práctico de aplicación de ACT con herramientas open source, permitiendo a desarrolladores e investigadores reproducir y adaptar políticas de imitación sin necesidad de infraestructura masiva. No se especifican detalles sobre la longitud de contexto ni el número de tokens de entrenamiento, pero su tamaño reducido lo hace accesible para pruebas en entornos académicos y de prototipado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo safetensors) |
| Idiomas soportados | no disponible (modelo de robotica, sin procesamiento de lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación que utiliza un transformer para predecir un chunk de acciones futuras a partir de observaciones actuales. En lugar de emitir una sola acción por paso, el modelo genera una secuencia de acciones que el robot ejecuta de forma encadenada, lo que reduce la acumulación de errores y mejora la suavidad del movimiento. La arquitectura concreta (número de capas, cabezas de atención, etc.) no se detalla en la información disponible.

El entrenamiento se realizó con el framework LeRobot, que gestiona la recopilación de datos, el preprocesado y el entrenamiento. El dataset `2usang/trihouse-dumpling-inbound` contiene demostraciones teleoperadas de la tarea, aunque no se especifica el número de episodios ni la composición exacta de los datos. No se menciona el uso de técnicas como RLHF o DPO; el aprendizaje es puramente por imitación supervisada. Tampoco se indican innovaciones técnicas adicionales más allá de las propias de ACT.

## Capacidades

- Control robótico de manipulación: predice secuencias de acciones para ejecutar tareas como recoger, mover o colocar objetos (en este caso, dumplings).
- Aprendizaje por imitación: aprende directamente de demostraciones teleoperadas, sin necesidad de recompensas explícitas.
- Integración con LeRobot: compatible con el ecosistema de LeRobot para entrenamiento, evaluación y despliegue en robots como SO-100.
- Procesamiento de observaciones multimodales: aunque no se detalla, ACT típicamente procesa imágenes y estados del robot; el dataset incluye modalidades de video y series temporales.
- No soporta tool calling, agentes conversacionales ni capacidades multilingües, al ser un modelo puramente motor.

## Casos de uso

- Automatización de tareas repetitivas en entornos controlados: el modelo puede ejecutar la tarea de manipulación de dumplings en un escenario de laboratorio, sirviendo como base para automatizar procesos similares en líneas de producción.
- Investigación en aprendizaje por imitación: permite estudiar el efecto del tamaño del chunk, la arquitectura del transformer y la calidad de las demostraciones en el rendimiento de la política.
- Prototipado rápido de políticas robóticas: gracias a su tamaño reducido y a la integración con LeRobot, se puede entrenar y evaluar en pocas horas con hardware modesto.
- Benchmarking de métodos de control: sirve como referencia para comparar ACT con otras técnicas de imitación (por ejemplo, Diffusion Policy) en la misma tarea.
- Educación en robótica: adecuado para cursos y talleres donde se enseña aprendizaje por imitación con robots de bajo coste.
- Desarrollo de sistemas de teleoperación asistida: el modelo puede complementar la teleoperación humana sugiriendo acciones, aunque no se ha probado en ese escenario.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de tasas de éxito, métricas de precisión ni comparaciones con otros modelos en la tarea concreta.

## Requisitos de hardware

- Al tratarse de un modelo de 51,6 millones de parámetros, el tamaño del repositorio es de 0,2 GB, lo que sugiere que los pesos ocupan aproximadamente 200 MB en precisión FP32 o 100 MB en FP16.
- No se proporcionan requisitos oficiales de VRAM. Sin embargo, por su tamaño, es probable que pueda ejecutarse en GPUs de consumo con al menos 2 GB de VRAM en FP16, aunque no hay confirmación oficial.
- GPUs recomendadas: cualquier GPU NVIDIA con soporte CUDA (por ejemplo, RTX 2060 o superior) debería ser suficiente para inferencia. Para entrenamiento, se recomienda al menos 4 GB de VRAM.
- Opciones de despliegue: LeRobot ofrece scripts de entrenamiento y evaluación; también se puede exportar a otros formatos si se desea, aunque no se documenta.
- Latencia y throughput: no disponibles. Dado el tamaño, se espera una inferencia rápida (del orden de milisegundos por chunk), pero no hay datos medidos.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa con otros modelos. El autor ha publicado otros modelos similares (`2usang/act_trihouse-dumpling` y `2usang/act_trihouse-icebar`) que probablemente usan la misma arquitectura con diferentes datasets, pero no se han publicado sus especificaciones ni resultados. No se conocen modelos comparables de otros autores en la misma tarea.

## Limitaciones y advertencias

- El modelo está entrenado específicamente para la tarea de manipulación de dumplings en el entorno "trihouse". No se espera que generalice a otras tareas sin reentrenamiento.
- No se han documentado sesgos, pero al ser un modelo de robótica, los riesgos de alucinación o sesgo lingüístico no aplican.
- La calidad del comportamiento depende directamente de la calidad y diversidad de las demostraciones del dataset. Si las demostraciones son limitadas, la política puede fallar en situaciones no vistas.
- No se especifica la longitud de contexto ni el número de pasos de acción predichos por chunk, lo que limita la capacidad de ajuste fino.
- La licencia Apache-2.0 permite uso comercial, pero el modelo se publica sin garantías y no ha sido validado en entornos de producción reales.
- Para uso en robots físicos, se recomienda implementar medidas de seguridad (límites de velocidad, parada de emergencia) ya que no se ha probado su robustez en condiciones reales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/2usang/act_trihouse-dumpling-inbound
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Dataset utilizado: https://huggingface.co/datasets/2usang/trihouse-dumpling-inbound
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
