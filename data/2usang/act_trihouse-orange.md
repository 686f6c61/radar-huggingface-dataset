# 2usang/act_trihouse-orange

## Resumen
El modelo `2usang/act_trihouse-orange` es una política de control robótico basada en el método Action Chunking with Transformers (ACT), desarrollada por el usuario 2usang y publicada en Hugging Face bajo la licencia Apache-2.0. Está entrenado con el framework LeRobot y utiliza el dataset `2usang/trihouse-orange` para aprender tareas de manipulación mediante imitación. Con aproximadamente 51,7 millones de parámetros, es un modelo compacto diseñado para ejecutarse en hardware modesto.

ACT es una técnica de aprendizaje por imitación que predice secuencias de acciones (chunks) en lugar de pasos individuales, lo que mejora la estabilidad y el éxito en tareas robóticas teleoperadas. Este modelo concreto se centra en una tarea específica de trihouse (posiblemente una tarea de organización o clasificación de objetos) y está pensado para ser utilizado con robots tipo SO-100, como se indica en la documentación de LeRobot. Su relevancia radica en ofrecer una implementación lista para usar de ACT, permitiendo a desarrolladores e investigadores reproducir y adaptar políticas de control sin partir de cero.

## Especificaciones tecnicas
| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Action Chunking with Transformers, ACT) |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (aplica a secuencias de observaciones y acciones, no a texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de robótica) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento
El modelo sigue la arquitectura ACT descrita en el paper [Action Chunking with Transformers](https://arxiv.org/abs/2304.13705). ACT emplea un transformer encoder-decoder que recibe observaciones (imágenes y estados del robot) y predice una secuencia de acciones futuras (chunk) de longitud fija. Esta predicción por chunks reduce el error acumulativo típico de los métodos de control paso a paso y mejora la robustez en tareas de manipulación.

El entrenamiento se realizó mediante aprendizaje por imitación sobre demostraciones teleoperadas contenidas en el dataset `2usang/trihouse-orange`. No se han publicado detalles específicos sobre el número de episodios, la composición exacta del dataset ni el uso de técnicas adicionales como RLHF o DPO. El modelo fue entrenado y subido al Hub usando la librería LeRobot, que proporciona herramientas estandarizadas para el entrenamiento y evaluación de políticas robóticas. Se desconoce si se aplicó alguna innovación técnica más allá de la arquitectura ACT estándar.

## Capacidades
- Control robótico por imitación: predice secuencias de acciones para ejecutar tareas de manipulación.
- Aprendizaje a partir de demostraciones: utiliza datos teleoperados para generalizar comportamientos.
- Integración con LeRobot: compatible con el ecosistema de entrenamiento, registro y evaluación de LeRobot.
- Soporte para robots SO-100: diseñado para funcionar con el robot seguidor SO-100, como se indica en la documentación.
- No incluye capacidades de lenguaje, visión general ni tool calling; su ámbito es exclusivamente robótico.

## Casos de uso
- Automatización de tareas repetitivas en laboratorio: el modelo puede controlar un brazo robótico para clasificar o mover objetos en un escenario fijo (por ejemplo, "trihouse"), reduciendo la intervención humana.
- Investigación en aprendizaje por imitación: sirve como punto de partida para estudiar la transferencia de políticas entre entornos o la robustez frente a variaciones en la iluminación o la posición de los objetos.
- Prototipado rápido de control robótico: gracias a su tamaño reducido y a la integración con LeRobot, permite validar nuevas tareas de manipulación en pocas horas de entrenamiento.
- Teleoperación asistida: el modelo puede complementar la teleoperación humana sugiriendo acciones o ejecutando segmentos completos de una tarea.
- Educación en robótica: adecuado para cursos que enseñan aprendizaje por refuerzo o imitación, ya que se puede ejecutar en GPUs de gama media.
- Benchmarking de algoritmos de imitación: al estar disponible públicamente, facilita comparaciones justas con otras políticas ACT o métodos alternativos.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible. No hay datos sobre tasas de éxito, métricas de precisión ni comparaciones con otros modelos en tareas robóticas.

## Requisitos de hardware
- VRAM estimada para inferencia: no disponible oficialmente, pero dado el tamaño de 51,7M de parámetros, se estima que requiere menos de 1 GB de VRAM en FP32 (inferencia en CPU también es viable para pruebas).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM (por ejemplo, NVIDIA GTX 1050 Ti, RTX 2060) es suficiente para inferencia; para entrenamiento se recomienda una GPU con 6-8 GB (RTX 3060 o superior).
- Compatible con GPU de consumo: sí, cabe en tarjetas gráficas de gama media e incluso en algunas integradas con suficiente memoria.
- Opciones de despliegue: se puede ejecutar mediante LeRobot (que usa PyTorch), y también es posible exportar a ONNX para inferencia en otros entornos. No se menciona soporte para vLLM, Ollama o TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles; dependerán del hardware y del tamaño del chunk de acciones.

## Comparativa con modelos similares
No se dispone de datos comparativos específicos con otros modelos de la misma categoría. Sin embargo, existen otras políticas ACT entrenadas con LeRobot publicadas por el mismo autor (por ejemplo, `2usang/act_trihouse-dumpling`) y por otros usuarios. Todas comparten la misma arquitectura base y tamaño de parámetros, diferenciándose principalmente en el dataset y la tarea. Para una comparación rigurosa se necesitarían benchmarks comunes, que no están publicados.

## Limitaciones y advertencias
- Sesgos y generalización: al ser un modelo de imitación, su rendimiento depende fuertemente de la calidad y diversidad de las demostraciones; puede fallar ante variaciones no vistas en el entrenamiento (cambios de iluminación, posiciones de objetos, etc.).
- Riesgo de sobreajuste: con un dataset pequeño, la política puede memorizar las demostraciones y no generalizar a nuevos episodios.
- Alucinación de acciones: en situaciones ambiguas, el modelo puede generar secuencias de acciones incoherentes o peligrosas para el robot.
- Limitaciones de contexto: no maneja lenguaje natural ni razonamiento simbólico; solo procesa observaciones de sensores y produce comandos motores.
- Licencia: Apache-2.0 permite uso comercial, pero se debe verificar que el dataset `2usang/trihouse-orange` tenga una licencia compatible con el uso previsto.
- Sin soporte para múltiples tareas: el modelo está especializado en la tarea "trihouse-orange"; no es un controlador generalista.
- Documentación limitada: no se proporcionan detalles sobre el entorno de entrenamiento, número de episodios ni hiperparámetros, lo que dificulta la reproducción exacta.

## Enlaces
- [Modelo en Hugging Face](https://huggingface.co/2usang/act_trihouse-orange)
- [Paper de ACT](https://huggingface.co/papers/2304.13705) (también en arXiv: [2304.13705](https://arxiv.org/abs/2304.13705))
- [Repositorio de LeRobot](https://github.com/huggingface/lerobot)
- [Documentación de LeRobot](https://huggingface.co/docs/lerobot/index)
- [Dataset usado](https://huggingface.co/datasets/2usang/trihouse-orange) (enlace inferido, no verificado en la búsqueda)
