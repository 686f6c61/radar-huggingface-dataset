# ajrayman/Intellect_continuous

## Resumen

`Intellect_continuous` es un modelo de clasificación de texto (en realidad, regresión) desarrollado por el usuario `ajrayman` como un fine-tune de `roberta-base` de Facebook AI. El modelo está diseñado para predecir un valor continuo asociado al rasgo psicológico de "intelecto" a partir de texto, probablemente dentro de un pipeline de análisis de personalidad. Aunque la model card no especifica el dataset de entrenamiento, las métricas de evaluación (RMSE, MAE, correlación) indican que se trata de una tarea de regresión sobre una variable numérica.

Con 124,6 millones de parámetros, hereda la arquitectura transformer encoder de RoBERTa-base, con una ventana de contexto de 512 tokens (característica del modelo base). Su licencia MIT permite uso comercial sin restricciones, y al ser un modelo pequeño, es viable en hardware de consumo. Sin embargo, la información pública es escasa: no se detallan los datos de entrenamiento, los idiomas soportados ni benchmarks externos, lo que limita su evaluación objetiva.

La relevancia de este modelo radica en su especialización en un rasgo psicológico concreto, un nicho poco cubierto por los LLM generalistas. No obstante, su baja correlación (0.2476) sugiere un rendimiento limitado, y su uso en producción requeriría una validación adicional con datos propios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (RoBERTa-base) |
| Parametros totales | 124.646.401 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de RoBERTa-base, 512 tokens) |
| Tipos de cuantizacion | no disponible (solo safetensors en el repo) |
| Idiomas soportados | no disponible (probablemente ingles, por el modelo base) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura de RoBERTa-base, un transformer encoder de 12 capas con 768 dimensiones ocultas y 12 cabezas de atención. Sobre esta base se añade una cabeza de regresión (una capa lineal que produce un valor escalar), dado que las métricas de evaluación (RMSE, MAE, correlación) son propias de tareas de regresión, no de clasificación. El fine-tune se realizó con el framework Hugging Face Transformers, utilizando un optimizador Adam con tasa de aprendizaje de 2e-5, batch size de 32, 8 épocas y un scheduler lineal con warmup del 6%. El dataset de entrenamiento no está especificado en la model card (aparece como "None"), lo que impide conocer la procedencia y composición de los datos.

No se mencionan innovaciones técnicas adicionales como decodificación especulativa, atención lineal o técnicas de alineación (RLHF/DPO). El entrenamiento parece ser un fine-tune estándar de regresión sobre un modelo preentrenado.

## Capacidades

- Regresión de texto: predice un valor numérico continuo (presumiblemente una puntuación de "intelecto") a partir de un texto de entrada.
- Clasificación de texto: aunque la tarea es de regresión, el pipeline declarado es `text-classification`, por lo que puede usarse con la API de clasificación de Transformers.
- No se conocen capacidades de generación de texto, tool calling, agentes, razonamiento multi-paso, visión o audio.
- Multilingüismo: no disponible; el modelo base RoBERTa está entrenado principalmente en inglés, por lo que se espera un rendimiento limitado en otros idiomas.

## Casos de uso

- Análisis de personalidad en textos: el modelo puede puntuar el rasgo de intelecto en respuestas de cuestionarios, ensayos o publicaciones en redes sociales, útil en investigación psicológica o selección de personal.
- Evaluación de contenido educativo: puntuar la complejidad intelectual de textos académicos o materiales de aprendizaje, ayudando a adaptar recursos a distintos niveles.
- Moderación de foros o comunidades: asignar una puntuación de "intelecto" a comentarios para priorizar contenido de mayor calidad o detectar aportaciones superficiales.
- Investigación en ciencias sociales: correlacionar puntuaciones de intelecto con variables demográficas o de comportamiento en estudios observacionales.
- Filtrado de currículums: puntuar la sofisticación intelectual de cartas de presentación o descripciones de experiencia, como apoyo en procesos de reclutamiento.
- Desarrollo de chatbots con perfil psicológico: integrar el modelo en un sistema que ajuste el tono o la complejidad de las respuestas según la puntuación de intelecto del usuario.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks externos (el campo `results` del model-index está vacío). El autor declara las siguientes métricas de evaluación en su model card:

| Metrica | Valor |
|---|---|
| Loss (validacion) | 0.0571 |
| RMSE | 0.2389 |
| MAE | 0.1908 |
| Correlacion | 0.2476 |

Estos valores corresponden a la última época de entrenamiento (época 5). La correlación de 0.2476 es baja, lo que indica una capacidad predictiva limitada. No se dispone de comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB en FP32 (el modelo tiene 124M parámetros, ~500 MB en FP32). Con cuantización a 8 bits, cabría en ~250 MB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM, incluyendo GTX 1050 Ti, RTX 2060, o incluso CPU para inferencia en lote.
- Cabe en GPUs de consumo: sí, en prácticamente cualquier GPU moderna.
- Opciones de despliegue: Hugging Face Transformers (Python), ONNX Runtime, TensorRT, o servidores de inferencia como vLLM (aunque no es óptimo para modelos tan pequeños). También puede ejecutarse en CPU con baja latencia.
- Latencia y throughput: no disponible, pero al ser un modelo pequeño, se espera una latencia inferior a 10 ms por muestra en GPU y ~50-100 ms en CPU.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (regresión de rasgos psicológicos sobre texto). Como referencia, otros fine-tunes de RoBERTa-base para tareas de regresión (por ejemplo, predicción de puntuaciones de calidad) suelen tener arquitecturas similares, pero no hay datos públicos de este modelo para comparar. Se recomienda evaluar contra modelos como `ajrayman/Morality_continuous` o `ajrayman/machiavellianism_continuous`, del mismo autor, que probablemente siguen el mismo esquema de entrenamiento.

## Limitaciones y advertencias

- Dataset de entrenamiento no especificado: no se conoce la procedencia ni el sesgo potencial de los datos, lo que puede afectar a la generalización.
- Correlación baja (0.2476): el modelo tiene una capacidad predictiva débil, por lo que no es recomendable para decisiones críticas sin validación adicional.
- Idiomas limitados: al estar basado en RoBERTa (entrenado principalmente en inglés), el rendimiento en otros idiomas será deficiente.
- Sin información sobre sesgos: no se han realizado auditorías de sesgo, por lo que puede reflejar sesgos presentes en el texto de entrenamiento.
- Riesgo de alucinación: al ser un modelo de regresión, no genera texto, pero puede producir valores extremos o inconsistentes si la entrada está fuera de distribución.
- Licencia MIT: permite uso comercial, pero el autor no ofrece garantías de precisión o idoneidad para fines específicos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ajrayman/Intellect_continuous
- Modelo relacionado (Morality_continuous): https://huggingface.co/ajrayman/Morality_continuous
- Modelo relacionado (machiavellianism_continuous): https://huggingface.co/ajrayman/machiavellianism_continuous
