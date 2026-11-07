# kokitabayashi/e5-mistral-qlora_FinModernBERT_query

## Resumen

`kokitabayashi/e5-mistral-qlora_FinModernBERT_query` es un modelo de embeddings de frases (sentence transformer) derivado de `intfloat/e5-mistral-7b-instruct` mediante un ajuste fino con QLoRA (cuantización de 4 bits con bitsandbytes) sobre el dataset `fin_modern_bert-pairs-sec-synthetic-v1`, de carácter financiero y sintético. Lo publica el usuario kokitabayashi y su propósito es la recuperación semántica de información en el dominio financiero, en particular sobre documentos tipo SEC (informes 10-K, 8-K y similares).

El modelo mantiene la arquitectura Mistral de 7 000 millones de parámetros del modelo base (7.124.291.584 parámetros según los pesos en safetensors) y produce vectores densos de 4096 dimensiones, con pooling sobre el último token y normalización posterior, por lo que la similitud se calcula por coseno. Su ventana de secuencia en la configuración del sentence transformer es de 384 tokens, muy inferior al contexto nativo de Mistral, lo que condiciona su uso a fragmentos cortos.

Es relevante ahora porque ejemplifica el patrón de especialización de un modelo de embeddings generalista de 7B hacia un dominio vertical (finanzas) con un coste de entrenamiento reducido gracias a QLoRA, y porque declara métricas de recuperación notables en su propio conjunto de evaluación financiero (Accuracy@1 de 0,828 y Recall@10 de 0,991). La licencia Apache 2.0 facilita su uso comercial, aunque el modelo solo declara soporte para inglés.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Mistral) con cabecera de sentence transformer: pooling de último token + normalización L2 |
| Parámetros totales | 7.124.291.584 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | 384 tokens (máxima secuencia declarada en el modelo de embeddings); el modelo base Mistral soporta contextos mayores, pero la configuración publicada fija 384 |
| Tipos de cuantización | QLoRA con cuantización de 4 bits (bitsandbytes) durante el ajuste fino; pesos publicados en safetensors (precisión original del adaptador fusionado, no se especifica cuantización de inferencia) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (tamaño del repo: 4,2 GB) |
| Dimensión de embedding | 4096 |
| Función de similitud | coseno |
| Librería | sentence-transformers |
| Pipeline | sentence-similarity / feature-extraction |
| Dataset de entrenamiento | fin_modern_bert-pairs-sec-synthetic-v1 (44 709 pares) |
| Funciones de pérdida | CachedMultipleNegativesRankingLoss, MultipleNegativesRankingLoss |

## Arquitectura y entrenamiento

El modelo reutiliza el backbone `MistralModel` de `intfloat/e5-mistral-7b-instruct` como extractor de características (`feature-extraction` sobre `last_hidden_state`). Sobre la salida del transformer se aplica un módulo de pooling de tipo `lasttoken` con `include_prompt: True` y dimensión 4096, seguido de una normalización L2. No se ha modificado la arquitectura del transformer; el ajuste se limita a los pesos mediante QLoRA, que congela el modelo base cuantizado a 4 bits y entrena adaptadores de bajo rango, posteriormente fusionados en los safetensors publicados.

El entrenamiento se realizó sobre `fin_modern_bert-pairs-sec-synthetic-v1`, un conjunto de 44 709 pares (query, documento) de temática financiera y generación sintética, orientado a fragmentos de informes SEC. Se emplearon dos funciones de pérdida de la familia de ranking por negativos múltiples: `MultipleNegativesRankingLoss` y `CachedMultipleNegativesRankingLoss`, esta última para reducir el consumo de memoria con batches efectivos grandes. No se documenta el número de tokens de entrenamiento, la composición detallada del dataset, ni si hubo etapas adicionales de alineación (RLHF/DPO), que en un modelo de embeddings no serían el mecanismo habitual. La innovación técnica destacable es la combinación de un embedding generalista de 7B con un ajuste eficiente en parámetros para un dominio vertical y la reducción de la longitud de secuencia a 384 tokens, coherente con el tamaño de los fragmentos financieros indexados.

## Capacidades

- Generación de embeddings de texto de 4096 dimensiones para similitud semántica, búsqueda semántica, minería de paráfrasis, clasificación y clustering.
- Recuperación de información (retrieval) en dominio financiero: emparejamiento de preguntas con fragmentos de informes SEC, tablas de deuda, estados financieros y notas contables.
- Búsqueda semántica sobre corpus cortos (hasta 384 tokens por fragmento) con similitud coseno.
- Extracción de características (`feature-extraction`) para pipelines de re-ranking o clasificación downstream.
- Compatibilidad con Text Embeddings Inference (TEI) y con endpoints de Hugging Face, según los tags del repositorio.
- Soporte multilingüe: no disponible; el modelo declara únicamente inglés (`en`).
- Tool calling / function calling: no disponible; es un modelo de embeddings, no generativo conversacional.
- Capacidades de agente o razonamiento multi-paso: no disponibles por la naturaleza del modelo.
- Capacidades de visión o audio: no disponibles; modalidad únicamente texto.

## Casos de uso

- Búsqueda semántica sobre informes financieros: indexar fragmentos de 10-K, 8-K y notas contables (hasta 384 tokens) y recuperar los pasajes relevantes para una consulta en lenguaje natural; el modelo está ajustado específicamente sobre pares de este dominio.
- Asistente de preguntas y respuestas sobre documentación SEC: usar el modelo como recuperador en un pipeline RAG, de modo que un LLM generativo reciba los fragmentos financieros más relevantes recuperados por similitud coseno.
- Minería de cláusulas y métricas contables: agrupar por similitud fragmentos que describen deuda, arrendamientos o deterioros, facilitando la revisión de disclosures repetitivas en grandes volúmenes de presentaciones.
- Deduplicación y clustering de disclosures: agrupar notas al pie o tablas con contenido semánticamente equivalente entre distintos ejercicios y emisores, usando la dimensión 4096 y la normalización L2 para distancias estables.
- Re-ranking en motores de búsqueda internos de entidades financieras: combinar un recuperador léxico (BM25) con este modelo denso para reordenar los candidatos y mejorar la precisión en la primera posición (Accuracy@1 de 0,828 en su evaluación).
- Clasificación de documentos financieros: entrenar un clasificador ligero sobre los embeddings de 4096 dimensiones para etiquetar tipos de documento o secciones (por ejemplo, notas de deuda frente a políticas contables).
- Detección de duplicados y control de calidad en pipelines de extracción: comparar fragmentos extraídos por OCR frente a originales para detectar errores de segmentación mediante umbrales de similitud coseno.

## Benchmarks y rendimiento

Resultados declarados por el autor en el model-index, sobre el conjunto `finance eval` (tarea information-retrieval). No están verificados (`verified: false`).

| Métrica | Valor |
|---|---|
| Cosine Accuracy@1 | 0,8282 |
| Cosine Accuracy@3 | 0,9568 |
| Cosine Accuracy@5 | 0,9778 |
| Cosine Accuracy@10 | 0,9913 |
| Cosine Precision@1 | 0,8282 |
| Cosine Precision@3 | 0,3189 |
| Cosine Precision@5 | 0,1956 |
| Cosine Precision@10 | 0,0991 |
| Cosine Recall@1 | 0,8282 |
| Cosine Recall@3 | 0,9568 |
| Cosine Recall@5 | 0,9778 |
| Cosine Recall@10 | 0,9913 |
| Cosine nDCG@10 | 0,9187 |
| Cosine MRR@10 | 0,8944 |
| Cosine MAP@100 | 0,8949 |

No se han publicado resultados en benchmarks estándar (MMLU, HumanEval, GSM8K, MTEB, BEIR) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp16, aproximadamente 14-15 GB para los 7,12 000 millones de parámetros más overhead de activaciones; en 8 bits, en torno a 8-9 GB; en 4 bits, alrededor de 5-6 GB. Cálculo orientativo a partir del tamaño de parámetros, no verificado por el autor.
- GPU recomendadas: A100 40/80 GB, H100, L40S o A10G para despliegues con throughput alto; RTX 4090 (24 GB) y RTX 3090 (24 GB) suficientes para fp16 en inferencia de una sola instancia.
- GPU de consumo: cabe en RTX 4090/3090 en fp16; en RTX 4080 (16 GB) o RTX 4070 Ti (12 GB) requiere cuantización a 8 o 4 bits. El ajuste fino con QLoRA cabe en GPUs de 24 GB.
- Opciones de despliegue: sentence-transformers (referencia), Text Embeddings Inference (TEI), endpoints de Hugging Face, FriendliAI (según la búsqueda web); vLLM y llama.cpp no están documentados para este modelo en la información disponible.
- Latencia y throughput: no disponibles; no se publican mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Dimensión | Licencia | Observaciones |
|---|---|---|---|---|---|
| kokitabayashi/e5-mistral-qlora_FinModernBERT_query | 7,12 000 M | 384 tokens | 4096 | Apache 2.0 | Ajuste QLoRA en dominio financiero; solo inglés; métricas declaradas en `finance eval` |
| intfloat/e5-mistral-7b-instruct (base) | 7,12 000 M | contexto largo del modelo Mistral (no fijado en la información disponible) | 4096 | MIT (según el modelo base; no confirmado en la información disponible) | Generalista, multilingüe en la práctica; sin ajuste financiero específico |
| kokitabayashi/e5-mistral_FinModernBERT_query | 7,12 000 M | no disponible | 4096 | Apache 2.0 | Variante del mismo autor sin QLoRA sobre el mismo dataset; no se dispone de sus métricas en la información proporcionada |

No se dispone de datos de benchmarks comparativos entre estas variantes en la información disponible, por lo que la comparación se limita a parámetros, contexto, dimensión y licencia.

## Limitaciones y advertencias

- Ventana de contexto muy reducida (384 tokens): fragmentos más largos deben trocearse, lo que puede romper la coherencia semántica de tablas y notas extensas.
- Entrenamiento exclusivamente en inglés: el rendimiento en castellano u otros idiomas no está evaluado y probablemente sea deficiente.
- Dataset sintético y de dominio estrecho (finanzas/SEC): posible sobreajuste al estilo de los documentos de entrenamiento y degradación en otros dominios.
- Métricas no verificadas (`verified: false`) y evaluadas sobre un conjunto propio (`finance eval`) del que no se documenta composición ni tamaño; no son comparables con MTEB o BEIR.
- Riesgo de sesgo heredado del corpus financiero de origen (empresas estadounidenses cotizadas), con posible infrarrepresentación de otros mercados y sectores.
- Riesgo de falsos positivos en recuperación: Precision@10 de 0,099 indica que la mayoría de los diez primeros resultados no son relevantes, aunque el recall sea alto; conviene usar umbrales de similitud y re-ranking.
- Licencia Apache 2.0 permite uso comercial, pero debe revisarse la licencia del modelo base y de los datos de entrenamiento originales, no detallada en la información disponible.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validación comunitaria ni mantenimiento demostrado; conviene fijar la revisión concreta de los pesos en producción.
- No es un modelo generativo: no debe emplearse para responder preguntas ni para tool calling, solo para representar texto como vectores.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kokitabayashi/e5-mistral-qlora_FinModernBERT_query
- Variante sin QLoRA del mismo autor: https://huggingface.co/kokitabayashi/e5-mistral_FinModernBERT_query
- Modelo base: https://huggingface.co/intfloat/e5-mistral-7b-instruct
- Documentación de Sentence Transformers: https://sbert.net
- Repositorio de Sentence Transformers: https://github.com/huggingface/sentence-transformers
- Modelos con librería sentence-transformers: https://huggingface.co/models?library=sentence-transformers
- Endpoint de inferencia en FriendliAI: https://friendli.ai/models/kokitabayashi/e5-mistral_FinModernBERT_query
- Paper de referencia sobre pérdidas de ranking por negativos múltiples (arXiv:1705.00652, citado indirectamente por las funciones de pérdida): no disponible en la información proporcionada
- Papers referenciados en los tags (arXiv:1908.10084, arXiv:2101.06983, arXiv:1807.03748): https://arxiv.org/abs/1908.10084, https://arxiv.org/abs/2101.06983, https://arxiv.org/abs/1807.03748
