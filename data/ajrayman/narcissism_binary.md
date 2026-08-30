# ajrayman/narcissism_binary

## Resumen

El modelo `ajrayman/narcissism_binary` es un clasificador de texto binario desarrollado por el usuario ajrayman, obtenido mediante fine-tuning del modelo base `roberta-base` de Facebook AI. Su propósito es detectar indicios de narcisismo en fragmentos de texto, aunque la documentación oficial no especifica el dataset de entrenamiento ni los criterios exactos de anotación. Con 124,6 millones de parámetros, se trata de un modelo compacto de arquitectura transformer encoder, adecuado para tareas de clasificación de textos cortos.

La relevancia de este modelo reside en su aplicación potencial en análisis de sentimiento, evaluación de perfiles psicológicos en redes sociales o moderación de contenido. Sin embargo, su escasa documentación, la ausencia de benchmarks externos y unas métricas de evaluación moderadas (accuracy del 67 % en el conjunto de validación) limitan su uso en entornos de producción sin una validación adicional. El modelo está publicado bajo licencia MIT y los pesos están disponibles en formato safetensors.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (RoBERTa-base, 12 capas, 768 dimensiones ocultas, 12 cabezas de atención) |
| Parametros totales | 124.647.170 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 512 tokens (límite estándar de RoBERTa-base) |
| Tipos de cuantizacion | No disponible (los pesos se distribuyen en fp32, se puede cuantizar con herramientas externas) |
| Idiomas soportados | No disponible (RoBERTa-base está entrenado principalmente en inglés, pero no se confirma para este fine-tuning) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura RoBERTa, un transformer encoder preentrenado con máscara de lenguaje (MLM) y optimizado con técnicas como entrenamiento con lotes mayores y eliminación de la predicción de siguiente oración. En este caso, se ha realizado un fine-tuning para clasificación binaria, añadiendo una cabeza de clasificación sobre la representación del token `[CLS]`.

El entrenamiento se llevó a cabo con 8 épocas, un tamaño de lote de 32, una tasa de aprendizaje de 2e-5, optimizador Adam (betas 0.9/0.999, epsilon 1e-8) y un programador lineal con calentamiento del 6 %. El dataset de entrenamiento no está especificado en la model card (se indica "None"), lo que impide conocer la composición y el volumen de datos. Tampoco se menciona el uso de técnicas como RLHF o DPO; se trata de un fine-tuning supervisado clásico.

## Capacidades

- Clasificación de texto binaria: el modelo asigna una etiqueta (presumiblemente "narcisista" o "no narcisista") a un texto de entrada.
- Análisis de rasgos de personalidad: puede utilizarse como componente en sistemas de análisis de texto orientados a la detección de indicadores psicológicos.
- Compatible con la librería Transformers de Hugging Face y con la herramienta Text Embeddings Inference (TEI), según las etiquetas del repositorio.
- No se documentan capacidades de generación de texto, tool calling, agentes ni razonamiento multi-paso.

## Casos de uso

- Análisis de redes sociales: el modelo puede procesar publicaciones, comentarios o mensajes para identificar posibles patrones narcisistas en la comunicación, útil en estudios sociológicos o de comportamiento.
- Moderación de contenido en plataformas: como parte de un pipeline de análisis de texto, podría ayudar a detectar discursos con características asociadas al narcisismo, aunque su precisión limitada exige supervisión humana.
- Investigación en psicología computacional: permite etiquetar corpus de textos para estudios sobre trastornos de personalidad, siempre que se valide previamente con datos anotados por expertos.
- Evaluación de perfiles en entrevistas o currículos: podría aplicarse a textos de autopresentación (cartas de motivación, respuestas abiertas) para obtener una señal preliminar, aunque no debe usarse como criterio único.
- Filtrado de contenido en aplicaciones de salud mental: como herramienta auxiliar en aplicaciones de autoayuda o seguimiento, combinada con otros indicadores y con la supervisión de profesionales.
- Experimentación académica: sirve como modelo base para comparar técnicas de fine-tuning en tareas de clasificación de personalidad, dado su tamaño reducido y su licencia permisiva.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, GLUE, etc.) en la información disponible. La model card incluye únicamente las métricas obtenidas en el conjunto de evaluación durante el entrenamiento, que se resumen a continuación:

| Metrica | Valor |
|---|---|
| Loss | 1.0079 |
| Accuracy | 0.6721 |
| Precision | 0.7212 |
| Recall | 0.5625 |
| F1 | 0.6320 |
| AUC | 0.7424 |

Estos valores indican un rendimiento moderado, con una precisión mayor que el recall, lo que sugiere que el modelo tiende a clasificar correctamente los casos positivos pero deja escapar una proporción relevante de ellos. La tabla completa de evolución por épocas está disponible en la model card original.

## Requisitos de hardware

- Inferencia en CPU: viable para textos cortos, con una latencia de decenas de milisegundos por muestra en hardware moderno (por ejemplo, un procesador Intel i7 o superior).
- Inferencia en GPU: cabe en GPUs de consumo con al menos 2 GB de VRAM. Una RTX 3060 o superior permite procesar lotes de tamaño moderado con baja latencia.
- VRAM estimada: el modelo en fp32 ocupa aproximadamente 500 MB de memoria, por lo que cuantizaciones a int8 o int4 reducen aún más el consumo (alrededor de 125 MB en int4).
- Opciones de despliegue: compatible con la librería Transformers de Python, con servidores de inferencia como vLLM o TGI (aunque al ser un encoder, es más habitual usar pipelines de Hugging Face), y con herramientas como ONNX Runtime para optimización.
- Throughput estimado: en una GPU como la RTX 4090, se pueden procesar cientos de muestras por segundo con un lote adecuado; en CPU, la cifra baja a decenas por segundo.

## Comparativa con modelos similares

No se dispone de datos de rendimiento comparativos con otros modelos en la información proporcionada. Como referencia, se pueden considerar los siguientes modelos de clasificación de texto basados en RoBERTa:

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| ajrayman/narcissism_binary | 124,6 M | 512 | MIT | Fine-tune específico para detección de narcisismo |
| FacebookAI/roberta-base | 124,6 M | 512 | MIT | Modelo base preentrenado, sin fine-tuning |
| ajrayman/Self-consciousness_binary | no disponible | no disponible | MIT | Modelo similar del mismo autor, para autoconciencia |
| ajrayman/Anger_binary | no disponible | no disponible | MIT | Modelo similar del mismo autor, para ira |

La comparación con otros clasificadores de personalidad (por ejemplo, modelos basados en BERT o DistilBERT) no es posible sin datos de evaluación comunes.

## Limitaciones y advertencias

- El dataset de entrenamiento no está documentado, lo que impide conocer la distribución de clases, el idioma de los textos y los criterios de anotación. Esto genera una incertidumbre considerable sobre la generalización del modelo.
- Las métricas de evaluación son moderadas (accuracy 0.67, F1 0.63), por lo que el modelo no es fiable para decisiones críticas sin una validación adicional en el dominio de aplicación.
- El recall bajo (0.56) indica que el modelo falla en detectar una parte importante de los casos positivos, lo que puede provocar falsos negativos en aplicaciones de detección.
- Al estar basado en RoBERTa, el modelo hereda los sesgos presentes en los datos de preentrenamiento (principalmente texto en inglés de internet), que pueden reflejarse en las predicciones.
- No se especifica el idioma de los textos de entrenamiento; si se aplica a textos en español u otros idiomas, el rendimiento podría degradarse significativamente.
- La licencia MIT permite uso comercial y modificación, pero al carecer de documentación sobre el origen de los datos, existe un riesgo legal si se utilizan datos protegidos.
- El tamaño del repositorio (13.6 GB) es sorprendentemente grande para un modelo de 124 M de parámetros, lo que sugiere que puede contener versiones adicionales o archivos de gran tamaño; se recomienda verificar el contenido antes de descargarlo.

## Enlaces

- [Página del modelo en Hugging Face](https://huggingface.co/ajrayman/narcissism_binary)
- [Modelo base: FacebookAI/roberta-base](https://huggingface.co/FacebookAI/roberta-base)
- [Modelo relacionado: ajrayman/Self-consciousness_binary](https://huggingface.co/ajrayman/Self-consciousness_binary)
- [Modelo relacionado: ajrayman/Anger_binary](https://huggingface.co/ajrayman/Anger_binary)
