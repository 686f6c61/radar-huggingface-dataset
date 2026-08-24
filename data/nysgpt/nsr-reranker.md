# NYSgpt/nsr-reranker

## Resumen

NSR Reranker es un cross-encoder de reranking de 149 millones de parámetros, desarrollado por NYSgpt (Brendan Stanton) y especializado en la recuperación de literatura de física nuclear sobre el corpus Nuclear Science References (NSR), que contiene 277.068 referencias. El modelo se construye a partir de Alibaba-NLP/gte-reranker-modernbert-base, una variante de ModernBERT, y se ha ajustado con 39.600 grupos de consultas y documentos anotados por expertos, con 7 negativos duros por grupo. Está diseñado como segunda etapa de un sistema de recuperación en dos fases: primero un recuperador denso o híbrido obtiene un top-K candidato, y este modelo reordena esos candidatos devolviendo un logit de relevancia para cada par (consulta, documento).

El modelo resuelve el problema de la baja precisión en la recuperación de literatura científica especializada, donde las consultas son expresiones técnicas como "92Zr(n,γ) cross section" y los documentos son artículos con títulos y resúmenes. Según los datos publicados, al reordenar el top-50 de bge-m3, el recall@1 pasa de 0,080 a 0,180 (2,25×) y el nDCG@10 mejora un 76%. Está pensado para usarse con el NSR Encoder como primera etapa, aunque también funciona sobre cualquier recuperador denso o híbrido. La licencia es Apache-2.0, lo que permite uso comercial sin restricciones.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Cross-encoder (ModernBERT) |
| Parámetros totales | 149.605.633 (149M) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 8.192 tokens nativos; entrenado y servido a 256 tokens |
| Tipos de cuantización | No disponible en la información proporcionada |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

NSR Reranker es un cross-encoder de punto (pointwise), basado en el modelo gte-reranker-modernbert-base de Alibaba-NLP, que a su vez usa la arquitectura ModernBERT (una variante de BERT optimizada para eficiencia y contexto largo). El modelo toma un par (consulta, documento) y devuelve un único logit de relevancia, que puede interpretarse como una puntuación de similitud. Su contexto nativo es de 8.192 tokens, pero se entrenó y se sirve con una longitud máxima de 256 tokens, suficiente para los títulos y resúmenes de la literatura científica.

El entrenamiento utilizó un objetivo de cross-entropía agrupada, con 1 positivo y 7 negativos duros por grupo, extraídos del propio espacio de recuperación (kNN del modelo base más un armado léxico), no negativos aleatorios. Se emplearon 39.600 grupos compuestos por consultas de tipo keyword-abstract y EXFOR, donde el positivo es el documento anotado. El entrenamiento duró 2 épocas con longitud máxima de 256 y tasa de aprendizaje 2e-5, en una GPU NVIDIA L40S (instancia g6e.xlarge) durante 42,6 minutos. Los datos se dividieron por documento, excluyendo cualquier documento de benchmark como fuente de consulta o positivo, para evitar fugas de información.

## Capacidades

- Generación de logits de relevancia para pares (consulta, documento), específicamente para recuperación de literatura de física nuclear.
- Reordenación de listas de candidatos (top-K) procedentes de cualquier recuperador denso o híbrido (por ejemplo, bge-m3 o el NSR Encoder).
- Mejora significativa del recall y nDCG en consultas expertas de física nuclear (R@1 +125%, nDCG@10 +76% sobre pool de bge-m3).
- Soporta consultas con notación técnica nuclear (ej. "92Zr(n,γ) cross section") y documentos con títulos o resúmenes.
- Compatible con la librería sentence-transformers, por lo que se integra fácilmente en pipelines existentes.
- No es un modelo de generación de texto ni de razonamiento; es exclusivamente un reranker.
- No soporta tool calling ni agentes; su función es puramente de reordenación de resultados.
- Capacidad multilingüe limitada al inglés, aunque el dominio de física nuclear usa notación internacional.

## Casos de uso

- **Recuperación de literatura científica en física nuclear**: un investigador introduce una consulta como "neutron capture cross section of 92Zr" y el sistema recupera el top-50 con un recuperador denso (por ejemplo, NSR Encoder), luego el reranker reordena esos 50 candidatos para colocar los documentos más relevantes en las primeras posiciones.
- **Búsqueda en bases de datos nucleares (EXFOR)**: para consultas estructuradas sobre datos de reacciones nucleares, el modelo mejora el recall y la precisión sobre un pool ya saturado, pasando R@1 de 0,871 a 0,927.
- **Sistema de recomendación de referencias**: un servicio que sugiere artículos relacionados a partir de una consulta o de un documento semilla, usando el reranker para priorizar las referencias más pertinentes.
- **Indexación y catalogación de bibliografía**: para tareas de clasificación de documentos nuevos en categorías de física nuclear, el modelo puede ordenar los candidatos por relevancia a la consulta o etiqueta.
- **Integración en pipelines RAG (retrieval-augmented generation)**: cuando se usa un LLM para responder preguntas sobre física nuclear, el reranker mejora la calidad de los documentos recuperados antes de la generación, aumentando la fidelidad de las respuestas.
- **Análisis de tendencias de investigación**: los investigadores pueden usar el modelo para filtrar los artículos más relevantes de una búsqueda amplia, reduciendo el tiempo de revisión de literatura.

## Benchmarks y rendimiento

Se han publicado resultados de evaluación en el dataset NSR Eval (NYSgpt/nsr-eval), con dos familias de consultas: consultas de palabras clave expertas (KW, n = 4.998) y consultas EXFOR (EX, n = 4.997). Los resultados se presentan comparando el pool de candidatos (top-50 de bge-m3) antes y después de aplicar este reranker.

| Métrica | Pool solo (bge-m3 top-50) | + NSR Reranker | Δ |
|---|---|---|---|
| R@1 | 0,080 | 0,180 | +125% |
| R@10 | 0,171 | 0,241 | +41% |
| nDCG@10 | 0,121 | 0,213 | +76% |

Por segmento (nDCG@10):

| Segmento | n | Pool solo | + NSR Reranker | Δ |
|---|---|---|---|---|
| Solo título | 4.141 | 0,085 | 0,167 | +96% |
| Con resumen | 857 | 0,296 | 0,436 | +47% |
| Pre-1970 | 602 | 0,045 | 0,107 | +137% |
| 1970–1999 | 2.686 | 0,105 | 0,197 | +89% |
| 2000+ | 1.710 | 0,174 | 0,274 | +58% |
| Artículos de revista | 4.250 | 0,129 | 0,221 | +71% |
| Otros tipos de referencia | 748 | 0,075 | 0,165 | +119% |

Para consultas EXFOR, sobre un pool ya saturado, R@1 pasa de 0,871 a 0,927 y nDCG@10 de 0,878 a 0,912. El modelo no puede recuperar documentos que no estén en la lista de candidatos; el pool de bge-m3 contiene la respuesta correcta el 24,9% de las veces, mientras que el sistema de producción con NSR Encoder la contiene el 65,6% de las veces.

## Requisitos de hardware

- El modelo tiene 149M de parámetros, por lo que cabe en GPUs de consumo para inferencia.
- VRAM estimada: en fp32, alrededor de 600 MB; en cuantización fp16 o int8, menos de 300 MB. No se han publicado pesos cuantizados oficiales, pero la conversión a GGUF o int8 es factible con herramientas estándar.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM, como NVIDIA GTX 1650, RTX 3060, RTX 4090, o incluso inferencia en CPU para lotes pequeños.
- Para despliegue en producción, es compatible con bibliotecas como sentence-transformers, Text Embeddings Inference (TEI) y endpoints compatibles de Hugging Face.
- Latencia: al ser un cross-encoder, la inferencia es por pares (consulta, documento), por lo que el tiempo de procesamiento de 50 candidatos puede ser de unos pocos segundos en GPU. No se han publicado mediciones exactas de latencia.
- Se recomienda el uso con vLLM o TGI si se integra en un pipeline de generación, aunque la inferencia directa con PyTorch es suficiente para la mayoría de casos.

## Comparativa con modelos similares

Se comparan con otros rerankers de la misma categoría (cross-encoders para recuperación de información).

| Modelo | Parámetros | Contexto | Licencia | Especialización | R@1 (bge-m3 top-50) |
|---|---|---|---|---|---|
| NSR Reranker | 149M | 8.192 (trained 256) | Apache-2.0 | Física nuclear (NSR) | 0,180 |
| gte-reranker-modernbert-base | 149M | 8.192 | MIT | General (multilingüe) | no disponible |
| bge-reranker-base | 149M | 512 | MIT | General (chino/inglés) | no disponible |
| Cohere Rerank (v3) | no disponible | no disponible | propietaria | General | no disponible |

El modelo se distingue por su entrenamiento específico en el dominio de física nuclear, lo que explica el salto de rendimiento sobre bge-m3. Para uso general, los otros modelos son más versátiles, pero en el dominio NSR este modelo supera a los alternativos.

## Limitaciones y advertencias

- El modelo solo funciona en inglés; las consultas o documentos en otros idiomas no se procesan correctamente.
- Está especializado en física nuclear; su rendimiento fuera de ese dominio es desconocido y probablemente bajo.
- No es un recuperador, solo reordena candidatos: si el primer paso no devuelve el documento correcto, el reranker no puede recuperarlo.
- El entrenamiento se realizó con datos del corpus NSR, que puede tener sesgos históricos en la cobertura de la literatura (por ejemplo, menos artículos de ciertas épocas o regiones).
- La longitud de contexto se entrenó a 256 tokens, aunque el modelo soporta 8.192; para documentos más largos, puede perder precisión.
- No se han publicado resultados de cuantización ni de despliegue en entornos de baja latencia; para producción con grandes volúmenes, es recomendable medir el rendimiento.
- La licencia Apache-2.0 permite uso comercial, pero el modelo puede estar sujeto a restricciones de los datos de entrenamiento (NSR), aunque no se indica ninguna restricción adicional.

## Enlaces

- HuggingFace: https://huggingface.co/NYSgpt/nsr-reranker
- Modelo base: https://huggingface.co/Alibaba-NLP/gte-reranker-modern-base
- Dataset de evaluación: https://huggingface.co/datasets/NYSgpt/nsr-eval
- Colección NSR: https://huggingface.co/collections/NYSgpt/nsr-6a83f426fd0a4b01d54af471
- NSR Encoder (primera etapa): https://huggingface.co/NYSgpt/nsr-encoder
- Perfil del autor: https://huggingface.co/NYSgpt
