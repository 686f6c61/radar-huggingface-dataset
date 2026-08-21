# EuroEval/mmBERT-small-multi-wiki-qa-synthetic-hallucinations-with-ragtruth-ro

## Resumen

Este modelo, publicado por el grupo EuroEval, es un clasificador de tokens basado en la arquitectura ModernBERT (mmBERT-small) ajustado para detectar alucinaciones en respuestas de preguntas-respuesta generadas con recuperación aumentada (RAG). El nombre completo del repositorio indica que fue entrenado sobre un conjunto de datos sintético construido a partir de la base MultiWikiQA, con respuestas etiquetadas a nivel de token como veraces o alucinadas. El proyecto forma parte de un esfuerzo por evaluar la fiabilidad de los sistemas de IA generativa, y se relaciona con el paper "A multilingual hallucination benchmark: MultiWikiQA" (arXiv:2605.02504). El modelo tiene 140,6 millones de parámetros, un tamaño que lo hace adecuado para inferencia en GPU de consumo, y se distribuye en formato safetensors.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ModernBERT (encoder transformer) con cabecera de clasificación de tokens |
| Parámetros totales | 140.642.306 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos en safetensors, sin cuantizaciones publicadas) |
| Idiomas soportados | no disponible (el nombre sugiere multilingüe, pero no se listan) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en ModernBERT, una arquitectura de transformer encoder optimizada para eficiencia y contextos largos, aunque los detalles específicos de esta variante (mmBERT-small) no están documentados en la model card. El entrenamiento se realizó mediante fine-tuning sobre un conjunto de datos sintético generado con el pipeline LettuceDetect, descrito en el paper de arXiv: se tomaron contextos y preguntas de MultiWikiQA, se generaron respuestas con modelos de lenguaje y se etiquetaron los tokens como alucinados o correctos. La tarea resultante es clasificación de tokens (token-classification), donde cada token de la respuesta recibe una etiqueta indicando si es parte de una alucinación o no. No se especifican hiperparámetros de entrenamiento, ni el régimen de precisión (fp32, fp16, etc.), ni el número de pasos.

## Capacidades

- Detección de alucinaciones a nivel de token en respuestas de QA generadas con RAG.
- Clasificación de tokens como correctos o alucinados, lo que permite señalar la porción exacta de texto problemática.
- Capacidad multilingüe implícita, ya que se publican variantes para varios idiomas (inglés, español, italiano, feroés, rumano), aunque no se detalla la cobertura exacta.
- Integración con el ecosistema Transformers de HuggingFace (pipeline de token-classification).

## Casos de uso

- Validación de respuestas generadas por sistemas RAG: se puede usar como filtro de calidad para marcar tokens que contengan información inventada antes de presentar la respuesta al usuario.
- Auditoría de modelos de lenguaje: permite analizar la frecuencia y posición de las alucinaciones en un conjunto de respuestas, ayudando a caracterizar el comportamiento del sistema.
- Desarrollo de pipelines de post-procesamiento: los tokens etiquetados pueden alimentar un sistema de reescritura o de alerta en aplicaciones de atención al cliente o búsqueda documental.
- Evaluación de benchmarks de alucinación: el modelo puede servir como anotador automático para construir datasets etiquetados a partir de respuestas generadas por LLMs.
- Depuración de sistemas RAG: al detectar las partes de la respuesta que no están respaldadas por el contexto recuperado, se puede mejorar la selección de pasajes o la prompt.
- Investigación en explicabilidad: las etiquetas token a token permiten visualizar de forma granular dónde se producen las desviaciones del contexto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de evaluación ni comparaciones con otros modelos. El paper de arXiv que describe la metodología puede contener resultados, pero no están disponibles en los datos proporcionados.

## Requisitos de hardware

- VRAM estimada para inferencia: con 140 millones de parámetros y pesos en fp32, el modelo ocupa aproximadamente 0,56 GB; con cuantización a fp16 se reduce a unos 0,28 GB, por lo que cabe en cualquier GPU con al menos 1 GB de VRAM.
- GPU recomendadas: cualquier GPU de consumo con más de 4 GB de VRAM (por ejemplo, GTX 1650, RTX 3050 o superior) es suficiente para inferencia en batch pequeño.
- Opciones de despliegue: se puede cargar con la librería Transformers de HuggingFace, y también es compatible con herramientas como vLLM o TGI, aunque al ser un modelo de clasificación de tokens, lo más natural es usarlo con el pipeline de token-classification.
- Latencia y throughput: no se proporcionan datos, pero para un modelo de 140M parámetros en una GPU moderna, la inferencia de un texto de 512 tokens suele estar por debajo de los 100 ms.

## Comparativa con modelos similares

No hay información suficiente para comparar con otros modelos de detección de alucinaciones. Se puede mencionar que existen variantes del mismo modelo para otros idiomas (por ejemplo, `mmBERT-small-multi-wiki-qa-synthetic-hallucinations-with-ragtruth-es` para español, `-it` para italiano, `-en` para inglés, `-fo` para feroés), lo que sugiere una familia de modelos, pero no hay datos de rendimiento comparativo.

## Limitaciones y advertencias

- La model card no aporta información sobre sesgos, riesgos o limitaciones específicas.
- El modelo se entrenó con datos sintéticos generados por LLMs, por lo que puede heredar los sesgos de los modelos que generaron los datos.
- La detección de alucinaciones se limita a respuestas de QA con contexto recuperado; no está claro si generaliza a otros dominios o tipos de generación.
- La licencia no está especificada, lo que implica incertidumbre sobre su uso comercial.
- No se ha publicado información sobre la longitud de contexto soportada, lo que puede limitar su aplicación a preguntas con contextos muy largos.
- El modelo no está diseñado para generación de texto, sino únicamente para clasificación de tokens; usarlo para otros propósitos puede dar resultados erróneos.

## Enlaces

- [HuggingFace del modelo](https://huggingface.co/EuroEval/mmBERT-small-multi-wiki-qa-synthetic-hallucinations-with-ragtruth-ro)
- [Variante en inglés](https://huggingface.co/EuroEval/mmBERT-small-multi-wiki-qa-synthetic-hallucinations-with-ragtruth-en)
- [Variante en español](https://huggingface.co/EuroEval/mmBERT-small-multi-wiki-qa-synthetic-hallucinations-with-ragtruth-es)
- [Variante en italiano](https://huggingface.co/EuroEval/mmBERT-small-multi-wiki-qa-synthetic-hallucinations-with-ragtruth-it)
- [Paper arXiv "A multilingual hallucination benchmark: MultiWikiQA"](https://arxiv.org/pdf/2605.02504v2)
