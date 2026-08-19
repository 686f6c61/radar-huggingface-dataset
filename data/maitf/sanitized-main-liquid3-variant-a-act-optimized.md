# maitf/sanitized-main-liquid3-variant-a-act-optimized

## Resumen

El modelo `maitf/sanitized-main-liquid3-variant-a-act-optimized` es una política de aprendizaje por imitación basada en ACT (Action Chunking with Transformers), desarrollada por el usuario maitf y publicada en Hugging Face bajo licencia Apache-2.0. Se trata de un modelo de robótica entrenado con LeRobot, la biblioteca de Hugging Face para aprendizaje por imitación en robots reales. El modelo está especializado en una tarea concreta: agarrar una taza, verter su contenido y dejarla en una posición neutra utilizando un brazo robótico tipo `so_follower`.

El modelo consume imágenes de dos cámaras (vista cenital y vista de muñeca) y el estado del robot (6 valores), y produce acciones de 6 dimensiones (posición y orientación del efector final). Su arquitectura ACT predice "chunks" de acciones en lugar de pasos individuales, lo que mejora la estabilidad del movimiento y la tasa de éxito en tareas de manipulación. Con 51,6 millones de parámetros, es un modelo ligero que puede ejecutarse en hardware modesto.

La relevancia de este modelo reside en que es un ejemplo de política de imitación entrenada con LeRobot y publicada en abierto, lo que permite a otros desarrolladores reproducir y adaptar el entrenamiento a sus propios robots. Aunque no se han publicado resultados de evaluación, el modelo representa una contribución práctica al campo de la robótica de bajo coste y la manipulación con aprendizaje automático.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) |
| Parámetros totales | 51.668.614 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica, es un modelo de visión y estado) |
| Tipos de cuantización | no disponible (pesos originales en safetensors) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (LeRobot) |

## Arquitectura y entrenamiento

El modelo implementa la arquitectura ACT (Action Chunking with Transformers), propuesta en el artículo "Learning Fine-Grained Bimanual Manipulation with Low-Cost Hardware" (arxiv:2304.13705). ACT es un método de aprendizaje por imitación que, en lugar de predecir una sola acción, predice un segmento (chunk) de acciones futuras, lo que permite generar movimientos suaves y consistentes. La arquitectura se compone de un codificador de visión (para procesar las imágenes de las cámaras), un codificador de estado del robot y un transformador que genera las secuencias de acciones.

El entrenamiento se realizó con el dataset `maitf/sanitized-main-liquid3-variant-a`, que contiene 76 episodios teleoperados con 101.081 fotogramas a 30 FPS. La tarea consistía en "coger la taza, verterla y dejarla en una posición neutra usando el palo". Se utilizó el optimizador AdamW con una tasa de aprendizaje de 1e-5, un tamaño de lote de 32 y se entrenó durante 25.000 pasos con la versión 0.6.1 de LeRobot. El modelo fue entrenado y subido al Hub mediante la biblioteca LeRobot, sin información sobre técnicas adicionales como RLHF o DPO (no son aplicables a este tipo de modelo).

## Capacidades

- Generación de acciones de 6 dimensiones para control de un brazo robótico tipo `so_follower`.
- Procesamiento de imágenes de dos cámaras (topdown y wrist) de resolución 480x640 píxeles.
- Predicción de chunks de acciones (action chunking), lo que permite movimientos más fluidos y estables en tareas de manipulación.
- Integración con el ecosistema LeRobot: permite ejecutar el modelo en un robot real mediante `lerobot-rollout`.
- Entrenado para una tarea específica de agarre y vertido de líquidos, pero la arquitectura es generalizable a otras tareas de manipulación con el mismo tipo de robot.

## Casos de uso

- **Manipulación robótica en laboratorio**: el modelo puede usarse para tareas de agarre y vertido en entornos de investigación, por ejemplo para automatizar la preparación de muestras o la manipulación de líquidos en experimentos.
- **Prototipado rápido de políticas de imitación**: sirve como punto de partida para desarrolladores que quieran entrenar sus propios modelos ACT con LeRobot, reutilizando la configuración y el pipeline de entrenamiento.
- **Educación en robótica**: permite a estudiantes y docentes desplegar una política de aprendizaje por imitación en un robot real de bajo coste (tipo SO-100) sin necesidad de grandes recursos computacionales.
- **Benchmark de reproducibilidad**: al estar disponible públicamente con su dataset y código de entrenamiento, es un recurso útil para comparar diferentes configuraciones de hiperparámetros o variaciones de arquitectura.
- **Desarrollo de sistemas de teleoperación asistida**: el modelo puede integrarse en sistemas de teleoperación donde se combina la acción humana con la asistencia del modelo para mejorar la precisión.
- **Investigación en generalización**: al estar entrenado con una tarea específica, puede servir para estudiar la transferencia de políticas entre diferentes entornos o variaciones de la tarea.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del autor no incluye datos de evaluación en robot real (ni éxito, ni precisión). No se dispone de comparaciones con otros modelos de robótica similares.

## Requisitos de hardware

- **VRAM estimada**: al tratarse de un modelo de 51,6 millones de parámetros con entrada de imágenes, se estima que la inferencia requiere al menos 2-4 GB de VRAM dependiendo de la resolución y del tamaño de lote. No se dispone de datos oficiales.
- **GPU recomendadas**: cualquier GPU moderna con soporte CUDA (por ejemplo, NVIDIA RTX 2060 o superior) debería ser suficiente. Para entrenamiento, se recomienda una GPU con al menos 8 GB de VRAM.
- **Uso en consumer GPU**: sí, es viable en GPUs de consumo como RTX 3060, 3070, 4080, etc.
- **Opciones de despliegue**: el modelo está pensado para ejecutarse con LeRobot. Se puede usar con `lerobot-rollout` para inferencia en tiempo real sobre un robot físico. No se mencionan soportes para vLLM, Ollama, etc., ya que es un modelo de robótica, no un LLM.
- **Latencia y throughput**: no hay datos oficiales. En una GPU moderna, la inferencia debería ser de decenas de milisegundos por paso, pero depende del hardware y de la implementación.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables de la misma categoría (políticas de aprendizaje por imitación para robots). La categoría de modelos robóticos en Hugging Face es aún emergente y cada modelo se entrena para tareas específicas. Por tanto, se indica "no disponible".

## Limitaciones y advertencias

- **Entrenado para una tarea concreta**: el modelo solo funciona para la tarea específica de agarrar, verter y dejar la taza con el palo. No es generalizable a otras tareas sin reentrenamiento.
- **Dependencia del dataset**: el rendimiento depende del dataset `sanitized-main-liquid3-variant-a`, que puede tener sesgos en las demostraciones (por ejemplo, iluminación, posición de la cámara, variabilidad del objeto).
- **Sin evaluación publicada**: no se han reportado tasas de éxito ni pruebas en robot real, por lo que no se puede garantizar su fiabilidad en producción.
- **Limitaciones de hardware**: requiere una configuración de robot específica (tipo `so_follower` y cámaras con las mismas características) para funcionar correctamente.
- **Licencia**: Apache-2.0 permite uso comercial, pero es necesario respetar los términos de la licencia y atribuir al autor.
- **No es un modelo de lenguaje**: no debe confundirse con un LLM; no tiene capacidades de procesamiento de texto ni razonamiento general.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/maitf/sanitized-main-liquid3-variant-a-act-optimized)
- [Dataset utilizado](https://huggingface.co/datasets/maitf/sanitized-main-liquid3-variant-a)
- [Paper de ACT](https://huggingface.co/papers/2304.13705)
- [LeRobot (GitHub)](https://github.com/huggingface/lerobot)
- [Documentación de LeRobot](https://huggingface.co/docs/lerobot/index)## Resumen

El modelo `maitf/sanitized-main-liquid3-variant-a-act-optimized` es una política de aprendizaje por imitación basada en ACT (Action Chunking with Transformers), desarrollada por el usuario maitf y publicada en Hugging Face bajo licencia Apache-2.0. Se trata de un modelo de robótica entrenado con la biblioteca LeRobot de Hugging Face, diseñado para controlar un brazo robótico tipo `so_follower` en una tarea concreta: agarrar una taza, verter su contenido y dejarla en una posición neutra utilizando un palo. El modelo procesa imágenes de dos cámaras (cenital y de muñeca) junto con el estado del robot, y genera acciones de seis dimensiones.

La arquitectura ACT predice segmentos de acciones en lugar de pasos individuales, lo que mejora la estabilidad y la fluidez de los movimientos en tareas de manipulación. Con 51,6 millones de parámetros, es un modelo ligero que puede ejecutarse en hardware de consumo. El dataset de entrenamiento contiene 76 episodios teleoperados con 101.081 fotogramas a 30 FPS, y el entrenamiento se realizó durante 25.000 pasos con optimizador AdamW y tasa de aprendizaje de 1e-5.

Aunque no se han publicado resultados de evaluación en robot real, el modelo representa un ejemplo práctico y reproducible de entrenamiento de políticas de imitación para manipulación robótica, con potencial de ser adaptado a otras tareas o robots mediante el ecosistema LeRobot.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) |
| Parámetros totales | 51.668.614 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; es un modelo de visión y acción) |
| Tipos de cuantización | no disponible (pesos originales en safetensors) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (LeRobot) |

## Arquitectura y entrenamiento

El modelo se basa en ACT (Action Chunking with Transformers), una arquitectura propuesta en el artículo *Learning Fine-Grained Bimanual Manipulation with Low-Cost Hardware* (arxiv:2304.13705). ACT utiliza un codificador de visión para procesar las imágenes de las cámaras, un codificador de estado del robot y un transformador que predice secuencias de acciones futuras (chunks). Este enfoque reduce la acumulación de errores y produce movimientos más suaves en comparación con políticas que predicen una sola acción por paso.

El entrenamiento se realizó con el dataset `maitf/sanitized-main-liquid3-variant-a`, que contiene 76 episodios teleoperados con 101.081 fotogramas a 30 FPS. La tarea consistía en "coger la taza, verterla y dejarla en una posición neutra usando el palo". Se utilizó la biblioteca LeRobot en su versión 0.6.1, con el optimizador AdamW, una tasa de aprendizaje de 1e-5, un tamaño de lote de 32 y 25.000 pasos de entrenamiento. No se aplicaron técnicas de refuerzo ni RLHF; es un entrenamiento puramente de aprendizaje por imitación.

## Capacidades

- **Control de robot**: genera acciones de 6 dimensiones (posición y orientación del efector final) para un brazo robótico tipo `so_follower`.
- **Procesamiento visual**: utiliza dos cámaras (cenital y de muñeca) con imágenes de 480x640 píxeles.
- **Action chunking**: predice segmentos de acciones, lo que facilita movimientos suaves y robustos en tareas de manipulación.
- **Integración con LeRobot**: se puede ejecutar en un robot real con `lerobot-rollout` y reentrenar con `lerobot-train`.
- **Entrenado para una tarea específica**: agarre, vertido y desplazamiento de una taza con un palo; no es generalizable sin reentrenamiento.

## Casos de uso

- **Automatización de laboratorios**: el modelo puede utilizarse para manipular líquidos en experimentos científicos, como dispensar o mezclar muestras en entornos controlados, gracias a su capacidad de realizar movimientos precisos y repetitivos.
- **Prototipado rápido de políticas robóticas**: sirve como base para desarrolladores que quieren entrenar sus propios modelos ACT con datos propios, reutilizando el pipeline de LeRobot y la configuración de entrenamiento.
- **Educación en robótica de bajo coste**: al estar diseñado para un robot de tipo `so_follower` (económico), es adecuado para universidades y makerspaces que enseñan aprendizaje por imitación sin necesidad de hardware de alto coste.
- **Investigación en generalización de tareas**: el modelo puede ser un punto de partida para estudiar cómo transferir políticas entre diferentes objetos o entornos, o cómo mejorar la robustez de ACT con variaciones de datos.
- **Desarrollo de teleoperación asistida**: puede combinarse con sistemas de teleoperación para ayudar al usuario en tareas de manipulación, reduciendo el esfuerzo físico y mejorando la precisión.
- **Benchmark de reproducibilidad**: al estar disponible con datos, código y configuración, sirve como referencia para comparar variantes de arquitectura o de entrenamiento en la comunidad LeRobot.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor no proporciona datos de evaluación en robot real (tasas de éxito, número de ensayos, etc.). Por tanto, no se puede cuantificar el rendimiento de la política en la tarea objetivo.

## Requisitos de hardware

- **VRAM estimada**: al tratarse de un modelo de 51,6 millones de parámetros con entrada de imágenes, se estima que la inferencia requiere entre 2 y 4 GB de VRAM, dependiendo de la resolución y del lote. No se dispone de datos oficiales.
- **GPU recomendada**: cualquier GPU NVIDIA con soporte CUDA, como RTX 3060, RTX 3070, RTX 4080, o incluso una GTX 1660 super para inferencia. Para entrenamiento se recomienda al menos 8 GB de VRAM.
- **GPU de consumo**: sí, el modelo cabe en GPUs de consumo estándar. No requiere hardware de datacenter.
- **Opciones de despliegue**: el modelo está integrado en LeRobot; se ejecuta con `lerobot-rollout` para inferencia en tiempo real sobre un robot. No es compatible con vLLM, Ollama ni otros motores de LLM, ya que es un modelo de robótica.
- **Latencia y throughput**: no hay datos medidos. En un GPU moderna, la inferencia de ACT suele estar en el orden de decenas de milisegundos por paso, pero depende de la implementación y de la carga de procesamiento de imágenes.

## Comparativa con modelos similares

No hay disponible información sobre modelos comparables de la misma categoría (políticas de aprendizaje por imitación para robots con ACT). La comunidad de Hugging Face incluye otros modelos de LeRobot, pero no se dispone de datos públicos para comparar directamente con este. Se indica "no disponible".

## Limitaciones y advertencias

- **Entrenado para una tarea específica**: el modelo solo es válido para la tarea descrita (agarrar, verter y desplazar una taza con un palo). No es generalizable a otras tareas sin reentrenamiento.
- **Sin evaluación en robot real**: no se han publicado pruebas de éxito ni datos de rendimiento, por lo que no se puede garantizar su comportamiento en producción.
- **Dependencia del dataset**: el modelo está condicionado por las demostraciones del dataset, que pueden presentar sesgos en cuanto a iluminación, posición de la cámara o variabilidad del objeto.
- **Limitaciones de hardware**: requiere una configuración específica de robot (`so_follower`) y de cámaras (topdown y wrist) con las mismas características que las del entrenamiento.
- **Licencia**: Apache-2.0 permite uso comercial, pero exige atribución y no otorga garantías.
- **No es un modelo de lenguaje**: no procesa texto ni razonamiento simbólico; es exclusivamente una política de control de robot.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/maitf/sanitized-main-liquid3-variant-a-act-optimized)
- [Dataset utilizado](https://huggingface.co/datasets/maitf/sanitized-main-liquid3-variant-a)
- [Paper de ACT (https://huggingface.co/papers/2304.13705)
- [LeRobot en GitHub](https://github.com/huggingface/lerobot)
- [Documentación de LeRobot](https://huggingface.co/docs/lerobot/index)
