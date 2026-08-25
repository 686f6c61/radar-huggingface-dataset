# lenawngr/ACT_SWITCH-2-bottom-clean_v3_default_10k

## Resumen

ACT_SWITCH-2-bottom-clean_v3_default_10k es un modelo de aprendizaje por imitación basado en Action Chunking with Transformers (ACT), publicado por el usuario lenawngr y entrenado con la librería LeRobot de Hugging Face. Está diseñado para controlar un robot manipulador en una tarea específica de manipulación, utilizando datos teleoperados del dataset SWITCH-2-bottom_clean.

El modelo predice secuencias de acciones (action chunks) en lugar de pasos individuales, una técnica que mejora la estabilidad y la tasa de éxito en tareas de control robótico. Con 51,7 millones de parámetros y un tamaño de repositorio de 0,2 GB, es un modelo ligero y desplegable en hardware modesto, lo que lo hace accesible para laboratorios de investigación y prototipado. Su licencia Apache 2.0 permite uso comercial sin restricciones significativas.

La relevancia de este modelo reside en que ejemplifica el flujo de trabajo moderno de entrenamiento y publicación de políticas robóticas con LeRobot, integrando datasets, entrenamiento e inferencia en un ecosistema unificado. No obstante, su alcance es limitado: está entrenado para una tarea concreta y no es un modelo generalista.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Action Chunking with Transformers (ACT) |
| Parámetros totales | 51.668.614 |
| Parámetros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (modelo de control robótico, no de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo utiliza la arquitectura ACT (Action Chunking with Transformers), descrita en el paper arXiv:2304.13705. ACT es un método de aprendizaje por imitación que predice secuencias de acciones de corta duración (action chunks) en lugar de acciones individuales, lo que reduce la acumulación de errores durante la ejecución. El modelo se entrena con datos teleoperados y, según la literatura, alcanza altas tasas de éxito en tareas de manipulación con pocos episodios de demostración.

El entrenamiento se realizó con la librería LeRobot, utilizando el dataset `lenawngr/SWITCH-2-bottom_clean`. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO, dado que es un modelo de política robótica y no un modelo de lenguaje. El modelo se publica con formato safetensors y puede cargarse con las herramientas estándar de LeRobot.

## Capacidades

- Generación de acciones de control robótico: el modelo predice secuencias de acciones (action chunks) para un robot seguidor, basándose en observaciones del estado actual y de la tarea.
- Aprendizaje por imitación: aprende de demostraciones teleoperadas del dataset `SWITCH-2-bottom_clean`, replicando la política del operador.
- Ejecución de tareas de manipulación específicas: entrenado para una tarea concreta de la parte inferior de un interruptor (switch), no es un modelo generalista.
- Integración con LeRobot: compatible con el pipeline de entrenamiento, evaluación e inferencia de LeRobot, incluyendo el registro de episodios y la ejecución en robots SO-100.
- No tiene capacidades de lenguaje, visión generalista, tool calling ni razonamiento multistep, al ser un modelo de política robótica.

## Casos de uso

- Entrenamiento y evaluación de políticas robóticas: el modelo puede usarse como referencia para entrenar o evaluar políticas de imitación en el mismo dataset, comparando tasas de éxito y robustez frente a otras configuraciones de ACT.
- Despliegue en robots de bajo coste: con 51,7 millones de parámetros, el modelo puede ejecutarse en una GPU de gama media (por ejemplo, RTX 3060 o RTX 4090) y en el robot SO-100, lo que lo hace adecuado para laboratorios con recursos limitados.
- Prototipado rápido de tareas de manipulación: la arquitectura ACT permite obtener políticas funcionales con pocas demostraciones, por lo que este modelo puede servir de referencia para tareas similares de manipulación de interruptores o componentes.
- Investigación en aprendizaje por imitación: sirve como caso de estudio de entrenamiento de políticas con LeRobot, incluyendo el flujo de datos, entrenamiento y evaluación reproducible.
- Benchmarking de métodos de cuantización: aunque no se proporcionan cuantizaciones, el formato safetensors permite experimentar con técnicas de compresión y medir el impacto en la tasa de éxito.
- Reutilización en transferencia de tareas: con adaptación fina sobre nuevos datos, el modelo puede adaptarse a tareas de manipulación similares, aprovechando el preentrenamiento en el dataset limpio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni otros benchmarks generales, ya que se trata de un modelo de robótica y no de lenguaje o visión. La métrica habitual sería la tasa de éxito en la tarea evaluada, pero no se proporciona.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible, pero con 51,7 millones de parámetros, la huella de memoria es pequeña (aproximadamente 200 MB en FP32, menos en FP16), por lo que cabe en cualquier GPU con más de 4 GB de VRAM.
- GPUs recomendadas: cualquier GPU moderna con soporte CUDA (por ejemplo, RTX 3060, RTX 4090, A100) o incluso CPU para inferencia, aunque con menor rendimiento.
- Compatible con consumer GPU: sí, cabe en GPUs de gama media como la RTX 3060 de 12 GB.
- Opciones de despliegue: el modelo se usa con LeRobot, que soporta ejecución en GPU (CUDA) y CPU. Se puede integrar con ROS, aunque la documentación de LeRobot es la referencia principal.
- Latencia y throughput: no disponible, pero al ser un modelo pequeño, se espera una inferencia rápida (menos de 10 ms en GPU moderna para un chunk de acciones).

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en el mismo dataset o con la misma arquitectura. La comparativa sería con otras políticas de imitación, como Diffusion Policy o ACT original, pero no se tienen datos de rendimiento publicados para este modelo concreto.

## Limitaciones y advertencias

- Sesgos conocidos: no hay información, pero al ser un modelo entrenado con un único dataset, puede estar sesgado hacia el entorno y el robot específicos de la recopilación de datos.
- Riesgo de alucinación: no aplicable en el sentido de modelos de lenguaje, pero puede generar acciones erróneas si las observaciones están fuera del dominio de entrenamiento.
- Limitaciones de contexto: no se especifica la longitud de contexto, pero al ser un modelo de control, la ventana de observación está limitada por la configuración de ACT (típicamente 1-2 observaciones).
- Restricciones de licencia: licencia Apache 2.0, permite uso comercial, modificación y redistribución, siempre que se mantenga la atribución y se indiquen los cambios.
- Caveat importante: el modelo está entrenado para una tarea específica (SWITCH-2-bottom) y no generaliza a otras tareas sin reentrenamiento. La tasa de éxito en el entorno real depende de la calibración del robot y de la similitud con el entorno de entrenamiento.

## Enlaces

- Página del modelo: https://huggingface.co/lenawngr/ACT_SWITCH-2-bottom-clean_v3_default_10k
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Dataset de entrenamiento: https://huggingface.co/datasets/lenawngr/SWITCH-2-bottom_clean
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Modelo relacionado (v2): https://huggingface.co/lenawngr/ACT_switch-2-bottom_v2
