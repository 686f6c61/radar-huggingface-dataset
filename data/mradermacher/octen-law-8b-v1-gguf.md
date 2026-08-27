# mradermacher/octen-law-8b-v1-GGUF

## Resumen

El modelo `mradermacher/octen-law-8b-v1-GGUF` es una colección de cuantizaciones en formato GGUF del modelo base `litillabs/octen-law-8b-v1`, un modelo de embeddings orientado al dominio legal. Aunque el nombre sugiere 8 mil millones de parámetros, el peso real en safetensors es de 7.567.295.488 parámetros (aproximadamente 7,57 B). Está diseñado para tareas de recuperación semántica y generación de representaciones vectoriales de texto legal, con soporte declarado para inglés, alemán y chino.

El autor de la cuantización, mradermacher, es un conocido proveedor de archivos GGUF que facilita el despliegue de modelos en entornos con recursos limitados. Esta versión incluye 12 niveles de cuantización, desde Q2_K (3,2 GB) hasta f16 (15,2 GB), lo que permite elegir el equilibrio entre tamaño, velocidad y fidelidad según el hardware disponible. La licencia Apache-2.0 permite uso comercial sin restricciones adicionales.

La relevancia de este modelo radica en que ofrece una vía práctica para incorporar embeddings legales multilingües en aplicaciones de producción, especialmente en sistemas de búsqueda y recuperación de documentos jurídicos, sin necesidad de infraestructura de alto coste.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 7.567.295.488 (7,57 B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en, de, zh |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (safetensors disponible en el modelo base) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo base `litillabs/octen-law-8b-v1`. Los metadatos de HuggingFace indican que se trata de un modelo de embeddings (tags: `sentence-transformers`, `embeddings`, `retrieval`, `legal`, `mteb`), lo que sugiere una arquitectura transformer con una cabeza de pooling para generar representaciones vectoriales. Sin embargo, no se han publicado datos sobre el número de capas, la dimensión de los embeddings, el tamaño del vocabulario ni el proceso de entrenamiento (datos, número de tokens, técnicas de optimización como contraste o hard negative mining). Tampoco se especifica si se utilizó fine-tuning sobre un modelo base previo o entrenamiento desde cero.

## Capacidades

- Generación de embeddings de texto para recuperación semántica en el dominio legal.
- Soporte multilingüe para inglés, alemán y chino, según los metadatos.
- Integración con el ecosistema `sentence-transformers` para tareas de similitud, búsqueda y clustering.
- Compatible con el benchmark MTEB (Multilingual Text Embedding Benchmark), lo que indica que fue evaluado o diseñado para tareas estándar de embeddings.
- No se ha confirmado soporte para generación de texto, tool calling, agentes u otras capacidades propias de modelos generativos.

## Casos de uso

Dado que se trata de un modelo de embeddings legales, los casos de uso típicos incluyen:

- Búsqueda semántica en bases de datos de jurisprudencia: indexar sentencias, leyes y documentos legales para recuperar los más relevantes a partir de consultas en lenguaje natural.
- Clasificación de documentos legales: agrupar contratos, dictámenes o escritos por temática o tipo mediante la comparación de vectores.
- Sistemas de recomendación de precedentes: encontrar casos similares a uno dado para apoyar la investigación jurídica.
- Deduplicación de documentos: identificar versiones duplicadas o casi duplicadas en grandes repositorios legales.
- Asistentes de redacción legal: sugerir fragmentos de texto o referencias a partir de la similitud semántica con documentos existentes.
- Análisis de riesgo contractual: comparar cláusulas de diferentes contratos para detectar patrones o desviaciones.

Estos escenarios son inferencias razonables basadas en la finalidad declarada del modelo (embeddings legales), pero no se ha publicado documentación oficial que los confirme.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de puntuaciones en MTEB, MMLU, HumanEval u otros conjuntos de evaluación para este modelo.

## Requisitos de hardware

Los requisitos dependen de la cuantización elegida. La siguiente tabla estima la VRAM necesaria para cargar el modelo en memoria (considerando overhead de ejecución):

| Cuantizacion | Tamano del archivo | VRAM estimada |
|---|---|---|
| Q2_K | 3,2 GB | ~4 GB |
| Q3_K_S | 3,6 GB | ~4,5 GB |
| Q3_K_M | 4,0 GB | ~5 GB |
| Q3_K_L | 4,3 GB | ~5,5 GB |
| IQ4_XS | 4,4 GB | ~5,5 GB |
| Q4_K_S | 4,6 GB | ~6 GB |
| Q4_K_M | 4,8 GB | ~6 GB |
| Q5_K_S | 5,4 GB | ~7 GB |
| Q5_K_M | 5,5 GB | ~7 GB |
| Q6_K | 6,3 GB | ~8 GB |
| Q8_0 | 8,1 GB | ~10 GB |
| f16 | 15,2 GB | ~18 GB |

- Las cuantizaciones Q4_K_M y Q4_K_S son las recomendadas por el autor para un equilibrio entre calidad y velocidad.
- Las versiones Q2_K y Q3_* pueden ejecutarse en GPUs de consumo con 4-6 GB de VRAM (por ejemplo, GTX 1660, RTX 3050).
- Para Q8_0 o f16 se recomienda una GPU con al menos 10-18 GB de VRAM (RTX 3080/4080, A100, etc.).
- Al ser formato GGUF, es compatible con `llama.cpp`, `Ollama`, `llama-cpp-python` y otros motores que soporten este formato. También puede usarse con `sentence-transformers` si se convierte a safetensors, aunque la cuantización GGUF está pensada para inferencia con `llama.cpp`.
- No se dispone de datos de latencia o throughput específicos para este modelo.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (embeddings legales multilingües de ~8B). No se puede ofrecer una comparativa fiable sin datos adicionales.

## Limitaciones y advertencias

- Al ser un modelo de embeddings, no genera texto ni mantiene conversaciones; su uso se limita a producir vectores de representación.
- La cuantización puede degradar la calidad de los embeddings, especialmente en niveles bajos como Q2_K o Q3_*. Se recomienda validar el rendimiento en el caso de uso concreto.
- No se ha publicado información sobre sesgos, alucinaciones o riesgos específicos del dominio legal. Los modelos entrenados con datos legales pueden reflejar sesgos presentes en los corpus de origen.
- La licencia Apache-2.0 permite uso comercial, pero se debe verificar que el modelo base no tenga restricciones adicionales (no se han encontrado indicios de ello).
- El soporte de idiomas se limita a inglés, alemán y chino; no se garantiza un buen rendimiento en otros idiomas.
- No se dispone de documentación sobre el contexto máximo de entrada, por lo que se desconoce si puede procesar documentos legales largos de una sola vez.

## Enlaces

- Modelo cuantizado: [https://huggingface.co/mradermacher/octen-law-8b-v1-GGUF](https://huggingface.co/mradermacher/octen-law-8b-v1-GGUF)
- Modelo base: [https://huggingface.co/litillabs/octen-law-8b-v1](https://huggingface.co/litillabs/octen-law-8b-v1)
- Página de solicitudes de cuantización del autor: [https://huggingface.co/mradermacher/model_requests](https://huggingface.co/mradermacher/model_requests)
