# jaheroth/act_pusht_bs64_dec7_seed1002_500k

## Resumen

El modelo `jaheroth/act_pusht_bs64_dec7_seed1002_500k` es una política de control robótico basada en el método Action Chunking with Transformers (ACT), desarrollada por Jacob H. Rothschild y publicada en Hugging Face mediante la librería LeRobot. ACT es una técnica de aprendizaje por imitación que predice secuencias de acciones (chunks) en lugar de pasos individuales, lo que mejora la estabilidad y el éxito en tareas de manipulación. Este modelo concreto se ha entrenado sobre el dataset `lerobot/pusht`, una tarea de empuje de objetos en un entorno simulado, y está pensado para ser evaluado y desplegado en robots reales o simulados.

Con 83,97 millones de parámetros, es un modelo compacto que puede ejecutarse en hardware de consumo, lo que lo hace accesible para investigación y prototipado. Su relevancia radica en que demuestra cómo los transformers pueden aplicarse al control de robots con datos de teleoperación, y su publicación en el Hub facilita la reproducibilidad y la comparación entre políticas. La licencia Apache-2.0 permite uso comercial y modificación sin restricciones significativas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Action Chunking with Transformers, ACT) |
| Parametros totales | 83.969.428 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (el modelo procesa observaciones y acciones, no texto) |
| Tipos de cuantizacion | no disponible (los pesos se publican en safetensors sin cuantizar) |
| Idiomas soportados | no disponible (modelo de robótica, no de lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo implementa la arquitectura ACT, descrita en el paper "Learning Fine-Grained Bimanual Manipulation with Low-Cost Hardware" (arXiv:2304.13705). ACT combina un codificador de visión (para procesar observaciones de cámara) con un transformer que genera secuencias de acciones de forma autorregresiva. La innovación clave es el "action chunking": en lugar de predecir una sola acción por paso de tiempo, el modelo predice un bloque de acciones futuras, lo que reduce la acumulación de errores y mejora la consistencia del movimiento.

El entrenamiento se realizó con la librería LeRobot, utilizando el dataset `lerobot/pusht`, que contiene demostraciones teleoperadas de la tarea PushT (empujar un objeto a una posición objetivo). No se dispone de información detallada sobre el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de refinamiento como RLHF o DPO. El modelo se publicó con el checkpoint correspondiente a 500.000 pasos de entrenamiento, según el nombre del repositorio.

## Capacidades

- Control robótico por imitación: el modelo es capaz de generar comandos de acción para un robot (por ejemplo, un brazo manipulador) a partir de observaciones visuales y del estado del entorno.
- Predicción de secuencias de acciones: gracias al action chunking, produce bloques de acciones coherentes que facilitan la ejecución suave en tareas de manipulación.
- Tarea específica PushT: está especializado en empujar un objeto deslizante hacia una posición objetivo, una tarea de referencia en robótica de manipulación.
- Integración con LeRobot: se puede cargar y ejecutar directamente con las herramientas de LeRobot, tanto para evaluación como para despliegue en robots compatibles (por ejemplo, SO-100).
- No soporta procesamiento de lenguaje natural, tool calling ni razonamiento simbólico; su dominio es exclusivamente el control motor.

## Casos de uso

- Investigación en aprendizaje por imitación: el modelo sirve como punto de partida para estudiar el efecto del action chunking, el tamaño de lote o la semilla en el rendimiento de políticas robóticas. Se puede comparar con otros checkpoints del mismo autor (por ejemplo, `act_pusht_bs64_chunk32_dec7_seed1001`) para analizar la variabilidad.
- Prototipado de control robótico en simulación: dado que la tarea PushT está disponible en entornos simulados, el modelo puede evaluarse sin necesidad de hardware físico, lo que acelera el desarrollo de algoritmos de control.
- Despliegue en robots de bajo coste: con 83,9 millones de parámetros, el modelo es lo suficientemente ligero para ejecutarse en una GPU de gama media o incluso en una Jetson, permitiendo pruebas en robots reales como el SO-100.
- Benchmarking de políticas de imitación: al estar publicado con una licencia permisiva y con el código de entrenamiento disponible, puede utilizarse como referencia para comparar nuevas arquitecturas o métodos de entrenamiento.
- Educación en robótica y aprendizaje automático: el modelo y su documentación permiten a estudiantes y desarrolladores entender cómo se entrena y evalúa una política de control con transformers.
- Reproducibilidad de experimentos: al estar disponible el checkpoint exacto, otros investigadores pueden replicar los resultados del autor o utilizarlo como baseline en sus propios experimentos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no incluye métricas de éxito, tasas de acierto ni comparaciones con otros modelos en la model card. Para obtener datos de rendimiento, sería necesario ejecutar el modelo en el entorno PushT siguiendo las instrucciones de LeRobot.

## Requisitos de hardware

- No se dispone de datos oficiales sobre VRAM, latencia o throughput.
- Dado el tamaño de parámetros (83,97 millones), se estima que el modelo puede ejecutarse en GPUs con al menos 4 GB de VRAM en precisión FP32, y menos si se cuantiza (aunque no se proporcionan cuantizaciones).
- Es probable que quepa en GPUs de consumo como la RTX 3060 o superiores, así como en la mayoría de GPUs de centros de datos (A100, H100, etc.).
- Para inferencia, se puede utilizar el pipeline de LeRobot, que soporta PyTorch. No se menciona compatibilidad con vLLM, llama.cpp u otros motores de inferencia orientados a LLM, ya que no es un modelo de lenguaje.
- El despliegue en robots reales requeriría un ordenador con GPU y el entorno de LeRobot configurado, así como el robot compatible (por ejemplo, SO-100).

## Comparativa con modelos similares

No se dispone de información comparativa con otros modelos en la documentación proporcionada. Existen otras políticas de imitación para la tarea PushT (por ejemplo, Diffusion Policy, ACT con diferentes configuraciones), pero no se han incluido datos de rendimiento en la model card. Se recomienda consultar el paper de ACT y los benchmarks de LeRobot para obtener comparaciones.

## Limitaciones y advertencias

- El modelo está especializado en una única tarea (PushT) y no generaliza a otras tareas de manipulación sin reentrenamiento.
- Al ser un modelo de imitación, su rendimiento depende de la calidad y diversidad de las demostraciones utilizadas en el entrenamiento; puede fallar ante situaciones no vistas.
- No se han documentado sesgos específicos, pero al entrenarse en un entorno simulado, puede haber una brecha de realidad al transferir a robots físicos.
- No se proporcionan garantías de seguridad para su uso en robots reales; es responsabilidad del usuario implementar medidas de seguridad adecuadas.
- La licencia Apache-2.0 permite uso comercial, pero el autor no ofrece soporte ni garantías sobre el funcionamiento del modelo.
- No se incluyen instrucciones detalladas de despliegue en producción; el modelo está pensado principalmente para investigación y evaluación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jaheroth/act_pusht_bs64_dec7_seed1002_500k
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Perfil de GitHub del autor: https://github.com/JaHeRoth
