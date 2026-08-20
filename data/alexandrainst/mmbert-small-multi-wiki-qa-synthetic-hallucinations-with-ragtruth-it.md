# alexandrainst/mmBERT-small-multi-wiki-qa-synthetic-hallucinations-with-ragtruth-it

## Resumen

El modelo `alexandrainst/mmBERT-small-multi-wiki-qa-synthetic-hallucinations-with-ragtruth-it` es un clasificador de tokens basado en la arquitectura ModernBERT, desarrollado por el Instituto Alexandra (Alexandra Institute) para la detección de alucinaciones en respuestas generadas por sistemas de recuperación aumentada (RAG). El modelo ha sido ajustado (fine-tuning) sobre un conjunto de datos sintéticos generado a partir del corpus MultiWikiQA, empleando el framework LettuceDetect para etiquetar a nivel de token las respuestas que contienen información no fiel al contexto recuperado.

Con 140,6 millones de parámetros, este modelo se especializa en el idioma italiano (sufijo `-it`), aunque forma parte de una familia multilingüe que incluye variantes para otros idiomas como finlandés y ucraniano. Su relevancia radica en abordar un problema crítico en sistemas RAG: la verificación automática de la fidelidad de las respuestas generadas, permitiendo señalar con precisión qué fragmentos concretos de una respuesta son inventados o inconsistentes con la fuente. El modelo se publica como parte del benchmark MultiWikiQHalluA, descrito en el artículo arXiv:2605.02504.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (encoder transformer, clasificación de tokens) |
| Parametros totales | 140.642.306 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | italiano (inferido del nombre; no declarado en la model card) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en ModernBERT, una evolución del transformer BERT con mejoras en eficiencia y capacidad de contexto. Se trata de un encoder de solo atención, adaptado aquí para la tarea de clasificación de tokens, donde cada token de la respuesta se etiqueta como fiel o alucinado respecto al contexto RAG. El entrenamiento se realizó mediante fine-tuning sobre un conjunto de datos sintéticos generado con el framework LettuceDetect, que utiliza un modelo de lenguaje para producir respuestas etiquetadas a nivel de token a partir de los contextos, preguntas y respuestas de referencia del corpus MultiWikiQA. No se dispone de información detallada sobre el número de tokens de entrenamiento, la composición exacta del dataset ni el uso de técnicas como RLHF o DPO.

## Capacidades

- Detección de alucinaciones a nivel de token en respuestas generadas por sistemas RAG.
- Clasificación de tokens como fieles o infieles respecto al contexto proporcionado.
- Soporte para el idioma italiano, con variantes multilingües disponibles para otros idiomas.
- Integración con el pipeline de `token-classification` de Hugging Face Transformers.
- Compatible con la inferencia mediante endpoints estándar de la librería Transformers.

## Casos de uso

- Auditoría de respuestas en sistemas RAG: el modelo puede integrarse como un paso de verificación posterior a la generación, señalando qué tokens de la respuesta no están respaldados por el contexto recuperado, lo que permite filtrar o corregir respuestas antes de mostrarlas al usuario.
- Control de calidad en asistentes virtuales: en un chatbot empresarial que responde preguntas sobre documentación interna, el modelo puede marcar automáticamente las respuestas que contienen información inventada, activando una alerta o una regeneración.
- Evaluación de pipelines RAG: durante el desarrollo de un sistema de recuperación, este modelo puede utilizarse como métrica automática para medir la tasa de alucinación de diferentes configuraciones de generación, sin necesidad de anotación manual.
- Análisis de logs de producción: las respuestas generadas por un sistema RAG en producción pueden procesarse con este modelo para detectar patrones de alucinación y mejorar el corpus de recuperación o el prompt de generación.
- Investigación en fidelidad de modelos: como parte del benchmark MultiWikiQHalluA, el modelo sirve como referencia para comparar nuevas técnicas de detección de alucinaciones en contextos multilingües.
- Filtrado de contenido en generación de resúmenes: si un sistema genera resúmenes a partir de documentos, el modelo puede identificar frases que no se corresponden con el texto fuente, ayudando a mantener la precisión factual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El artículo arXiv:2605.02504 describe el benchmark MultiWikiQHalluA, pero no se incluyen métricas específicas de este modelo en la documentación consultada.

## Requisitos de hardware

- VRAM estimada para inferencia: con 140,6 millones de parámetros en precisión fp32, el modelo requiere aproximadamente 560 MB de memoria para los pesos; en fp16 se reduce a unos 280 MB. La inferencia puede ejecutarse en GPUs con 4 GB de VRAM o menos.
- GPU recomendadas: cualquier GPU moderna con al menos 4 GB de VRAM, como NVIDIA GTX 1650, RTX 3060, o superiores. También es viable en CPU para inferencia por lotes pequeños.
- Compatibilidad con hardware de consumo: sí, cabe en GPUs de consumo estándar.
- Opciones de despliegue: al ser un modelo de Transformers, puede servirse con vLLM, Hugging Face TGI, o mediante la API de inferencia de Hugging Face. También es posible ejecutarlo con `transformers` directamente en Python.
- Latencia y throughput: no disponible; al ser un encoder pequeño, la latencia esperada es baja (del orden de milisegundos por secuencia en GPU), pero no se proporcionan cifras oficiales.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa con otros modelos de detección de alucinaciones. El modelo pertenece a una familia multilingüe (variantes para finlandés, ucraniano, etc.) y se enmarca en el benchmark MultiWikiQHalluA, pero no se han encontrado datos de rendimiento comparativo en la documentación disponible.

## Limitaciones y advertencias

- La model card no proporciona información sobre sesgos, riesgos o limitaciones específicas; se recomienda precaución al usar el modelo en producción sin una evaluación adicional.
- El modelo está entrenado con datos sintéticos generados por un framework automático, lo que puede introducir sesgos en la distribución de alucinaciones y afectar a la generalización a dominios reales.
- La licencia no está especificada, por lo que el uso comercial no está garantizado sin aclaración por parte del autor.
- El idioma principal es italiano; el rendimiento en otros idiomas no está documentado.
- No se dispone de información sobre la longitud de contexto máxima, lo que limita su aplicación a pasajes largos sin verificación previa.
- El modelo solo detecta alucinaciones a nivel de token; no corrige ni genera respuestas alternativas.

## Enlaces

- Hugging Face: https://huggingface.co/alexandrainst/mmBERT-small-multi-wiki-qa-synthetic-hallucinations-with-ragtruth-it
- Artículo del benchmark: https://arxiv.org/pdf/2605.02504 (versión HTML: https://arxiv.org/html/2605.02504v2)
- Repositorio del dataset MultiWikiQA: https://github.com/alexandrainst/multi_wiki_qa
- Variante en ucraniano: https://huggingface.co/alexandrainst/mmBERT-small-multi-wiki-qa-synthetic-hallucinations-with-ragtruth-uk
- Variante en finlandés: https://huggingface.co/alexandrainst/mmBERT-small-multi-wiki-qa-synthetic-hallucinations-fi
