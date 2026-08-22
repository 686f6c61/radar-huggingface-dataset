# EuroEval/mmBERT-small-multi-wiki-qa-synthetic-hallucinations-with-ragtruth-sr

## Resumen

Este modelo, publicado por EuroEval, es una versión pequeña de un modelo BERT multilingüe (mmBERT-small) ajustada para la clasificación de tokens de alucinación en respuestas generadas por sistemas de recuperación aumentada (RAG). El nombre completo indica que fue entrenado con datos sintéticos de preguntas y respuestas de Wikipedia multilingüe, con anotaciones de alucinaciones generadas mediante el framework LettuceDetect. El sufijo "sr" sugiere que se trata de la variante para el idioma serbio, aunque el modelo base es multilingüe.

El modelo se enmarca dentro del benchmark MultiWikiQHalluA, descrito en el artículo arXiv 2605.02504, cuyo objetivo es evaluar y detectar alucinaciones en sistemas de generación de texto multilingües. Con 140 millones de parámetros, es un modelo compacto y ligero, adecuado para tareas de clasificación de tokens en entornos con recursos limitados. Su relevancia radica en ofrecer una herramienta específica para el control de calidad de respuestas generadas por RAG, un problema crítico en la adopción de sistemas de IA generativa.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder (basada en BERT, variante ModernBERT) |
| Parámetros totales | 140.642.306 |
| Parámetros activos | no aplicable (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | multilingüe (variante serbio indicada por sufijo "sr") |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en una arquitectura transformer encoder, concretamente en la familia ModernBERT, una actualización reciente de BERT que incorpora optimizaciones de eficiencia como atención con ventana deslizante y mejoras en el preentrenamiento. La variante "small" indica un tamaño reducido respecto a los modelos BERT estándar, con aproximadamente 140 millones de parámetros, lo que lo sitúa en el rango de los modelos base compactos.

El entrenamiento se realizó en dos fases: primero se generaron datos sintéticos de alucinaciones mediante el framework LettuceDetect, que utiliza un modelo de lenguaje para crear respuestas con anotaciones a nivel de token (marcando qué tokens son alucinados). Posteriormente, se ajustó el modelo base mmBERT-small para la tarea de clasificación de tokens, es decir, predecir si cada token de una respuesta generada es factual o alucinado. Este ajuste se llevó a cabo sobre el dataset MultiWikiQA, que contiene contextos, preguntas y respuestas correctas de Wikipedia multilingüe. La metodología completa se detalla en el artículo "A multilingual hallucination benchmark: MultiWikiQHalluA".

## Capacidades

- Clasificación de tokens para detectar alucinaciones en respuestas generadas por sistemas RAG.
- Procesamiento multilingüe, con soporte para varios idiomas europeos (el sufijo "sr" indica serbio, pero el modelo base es multilingüe).
- Integración con el ecosistema Hugging Face Transformers mediante la librería `transformers`.
- Compatible con `pipeline` de token-classification, lo que permite su uso directo en aplicaciones de inferencia.
- Apto para análisis de calidad de respuestas en sistemas de QA, verificación de hechos y monitorización de modelos generativos.

## Casos de uso

- Control de calidad en sistemas RAG: el modelo puede anotar tokens de respuestas generadas por un RAG para identificar qué partes son alucinadas, permitiendo a los desarrolladores filtrar o corregir la salida antes de mostrarla al usuario.
- Auditoría de respuestas en asistentes virtuales: en un bot de atención al cliente que usa RAG, este modelo puede señalar respuestas incorrectas o inventadas, mejorando la fiabilidad del servicio.
- Verificación de hechos en artículos generados: al procesar textos producidos por IA, el modelo puede marcar los pasajes sospechosos para revisión humana.
- Evaluación de modelos de lenguaje: como parte de un pipeline de evaluación, se puede usar para medir la tendencia de un modelo a alucinar en contextos multilingües.
- Investigación académica en detección de alucinaciones: el modelo sirve como baseline para comparar nuevas técnicas de detección, dada su naturaleza ligera y reproducible.
- Integración en pipelines de datos: al ser un modelo pequeño, puede ejecutarse en entornos con recursos limitados, como en edge devices o microservicios, para filtrar respuestas generadas en tiempo real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El artículo arXiv menciona la creación del benchmark MultiWikiQHalluA, pero no se incluyen cifras específicas de rendimiento del modelo en la documentación proporcionada.

## Requisitos de hardware

- Al ser un modelo de 140 millones de parámetros, la inferencia puede ejecutarse en CPU con una memoria moderada (aprox. 1-2 GB de RAM para el modelo en fp32).
- Para uso con GPU, cualquier tarjeta con al menos 4 GB de VRAM es suficiente, incluyendo GPUs de consumo como la GTX 1060 6 GB o RTX 2060.
- El tamaño del repositorio es de 1.2 GB, lo que incluye pesos en safetensors y otros archivos.
- Se puede desplegar con librerías estándar: `transformers` (Python), `onnxruntime` para optimización, o `torchserve` para API.
- La latencia esperada en CPU es de decenas de milisegundos por oración, y en GPU de pocos milisegundos.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. No obstante, existen variantes del mismo modelo para otros idiomas (sufijos -en, -fo, -no, etc.) que comparten arquitectura y propósito. También podrían compararse con otros detectores de alucinación, pero no se han encontrado datos concretos en la búsqueda.

## Limitaciones y advertencias

- La licencia del modelo no está disponible, por lo que no se puede confirmar si su uso comercial es permitido. Se recomienda contactar con el autor antes de usarlo en producción.
- El modelo fue entrenado con datos sintéticos y puede no generalizar perfectamente a datos reales de alucinación en otros dominios.
- La longitud de contexto no se ha especificado; al ser una variante "small" de BERT, es probable que tenga un máximo de 512 tokens, lo que limita su aplicación a respuestas cortas.
- Los idiomas exactos soportados no están documentados, aunque el sufijo "sr" sugiere serio y el prefijo "multi" indica multilingüe.
- La detección de alucinaciones se basa en anotaciones de tokens, lo que puede no capturar alucinaciones a nivel de frase o discurso.
- No se han publicado métricas de precisión o recall en los datos disponibles, por lo que su eficacia real es desconocida.

## Enlaces

- Hugging Face: https://huggingface.co/EuroEval/mmBERT-small-multi-wiki-qa-synthetic-hallucinations-with-ragtruth-sr
- Artículo arXiv: https://arxiv.org/pdf/2605.02504 (también en HTML: https://arxiv.org/html/2605.02504)
- Variantes del modelo en otros idiomas: https://huggingface.co/EuroEval/mmBERT-small-multi-wiki-qa-synthetic-hallucinations-with-ragtruth-en y https://huggingface.co/EuroEval/mmBERT-small-multi-wiki-qa-synthetic-hallucinations-with-ragtruth-fo
- Referencia externa: https://free2aitools.com/model/euroeval/mmbert-small-multi-wiki-qa-synthetic-hallucinations-with-ragtruth-no
