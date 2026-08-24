# judicialmind/greenleaf-law-embed-tiny

## Resumen

GreenLeaf Law Embed Tiny es un modelo de embeddings densos de 596 millones de parámetros, desarrollado por JudicialMind, una empresa especializada en inteligencia artificial para el sector legal. Su propósito principal es la recuperación de información en textos jurídicos: sentencias, contratos, legislación, doctrina y documentos legales en general. A diferencia de los modelos de embeddings genéricos, está diseñado específicamente para manejar la terminología, las citas cruzadas y la estructura jerárquica del lenguaje legal.

El modelo se basa en una arquitectura transformer bidireccional derivada de Qwen3, con 28 capas y atención sin máscara causal, lo que permite que cada token atienda a todo el contexto en ambas direcciones. Su contexto nativo es de 1024 tokens, aunque soporta extensiones hasta 32 768. Según la model card, alcanza un 78,29 % en el benchmark MLEB-12 y un 64,38 % en MTEB(Law, v1), resultados competitivos con modelos 13 veces más grandes. Se distribuye bajo licencia Apache 2.0, lo que facilita su uso comercial y académico.

La relevancia actual de este modelo radica en la creciente demanda de sistemas de búsqueda semántica y RAG (retrieval-augmented generation) en el ámbito legal, donde la precisión en la recuperación de precedentes y cláusulas es crítica. Su tamaño compacto y su licencia permisiva lo convierten en una opción atractiva para despachos, departamentos jurídicos y desarrolladores que necesitan embeddings especializados sin depender de APIs propietarias.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder bidireccional derivado de Qwen3 (28 capas, sin máscara causal) |
| Parametros totales | 596 049 920 (596M) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 1024 tokens nativo; soporta hasta 32 768 |
| Tipos de cuantizacion | bfloat16 (por defecto), int8 y binaria integradas |
| Idiomas soportados | No especificado (probablemente inglés legal, según los benchmarks) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, ONNX, GGUF (no confirmado) |

## Arquitectura y entrenamiento

GreenLeaf Law Embed Tiny emplea un transformer encoder bidireccional derivado de la arquitectura Qwen3. La modificación principal consiste en eliminar la máscara causal en las 28 capas, de modo que cada token puede atender a todos los tokens de la secuencia en ambas direcciones. Esto resulta especialmente útil para textos legales, donde una definición en la primera página puede depender de una cláusula en la página doce. El pooling se realiza mediante la media de los embeddings de salida, y el tamaño de embedding es de 1024 dimensiones.

El entrenamiento utiliza una curación de datos específica para el dominio legal, con atención a la jurisdicción (jurisdiction-aware training data curation), aunque no se han publicado detalles sobre el número de tokens, la composición exacta del dataset ni si se aplicaron técnicas como RLHF o DPO. El modelo incorpora Matryoshka Representation Learning, lo que permite truncar las dimensiones del embedding (a 512, 256 o 128) sin necesidad de reentrenar, con una pérdida de rendimiento mínima (por ejemplo, -1,34 % al pasar de 1024 a 512 dimensiones en MLEB-12). También incluye cuantización int8 y binaria integrada para reducir el almacenamiento y acelerar la inferencia.

## Capacidades

- Generación de embeddings de texto legal para tareas de similitud semántica, búsqueda y recuperación.
- Soporte de Matryoshka truncation: se puede reducir la dimensionalidad del embedding (512, 256, 128) sin reentrenar, manteniendo hasta el 91,6 % del rendimiento con 128 dimensiones.
- Cuantización integrada en int8 y binaria para optimizar el almacenamiento y la velocidad de cómputo.
- Compatible con la librería sentence-transformers, Text Embeddings Inference (TEI) y ONNX Runtime.
- Atención bidireccional completa, lo que permite capturar dependencias de largo alcance en documentos legales extensos.
- No es un modelo generativo: no produce texto, solo representaciones vectoriales. No soporta tool calling ni razonamiento multi-paso.

## Casos de uso

- Búsqueda de jurisprudencia y precedentes: un sistema de recuperación puede indexar sentencias y resoluciones judiciales, y utilizar GreenLeaf para encontrar casos relevantes a partir de una consulta en lenguaje natural. Su atención bidireccional ayuda a capturar referencias cruzadas y citas internas.
- Recuperación de cláusulas contractuales: en la revisión de contratos, el modelo puede localizar cláusulas específicas (indemnización, confidencialidad, terminación) mediante similitud semántica, incluso si la redacción varía entre documentos.
- Asistentes legales con RAG: integrado en un pipeline de generación aumentada por recuperación, permite a un LLM responder preguntas legales citando fuentes relevantes extraídas de una base de conocimiento corporativa.
- Clasificación y categorización de documentos legales: los embeddings generados pueden alimentar clasificadores para etiquetar automáticamente escritos, demandas o dictámenes según su tipo o materia.
- Búsqueda semántica en bases de datos legislativas: útil para localizar artículos, leyes o directivas a partir de descripciones conceptuales, no solo por palabras clave exactas.
- Sistemas de QA legal: combinado con un modelo de lectura, puede responder preguntas de exámenes de acceso a la abogacía o consultas de clientes, como demuestran los resultados en Bar Exam QA (68,38) y LegalQuAD (58,62).

## Benchmarks y rendimiento

La model card reporta los siguientes resultados en MLEB-12 (Massive Legal Embedding Benchmark):

| Dataset | Score |
|---|---|
| Legal RAG Bench | 54,16 |
| Bar Exam QA | 68,38 |
| SCALR | 73,04 |
| ECHR Retrieval | 41,27 |
| Singaporean Judicial Keywords | 86,63 |
| GDPR Holdings Retrieval | 93,43 |
| UK Legislative Long Titles | 95,88 |
| Australian Tax Guidance | 78,66 |
| Irish Legislative Summaries | 91,92 |
| Contractual Clause Retrieval | 91,29 |
| License TL;DR Retrieval | 72,54 |
| Consumer Contracts QA | 92,29 |
| **Overall** | **78,29** |

En MTEB(Law, v1):

| Task | Score |
|---|---|
| AILACasedocs | 40,73 |
| AILAStatutes | 58,68 |
| GerDaLIRSmall | 38,51 |
| LeCaRDv2 | 69,52 |
| LegalBenchConsumerContractsQA | 85,86 |
| LegalBenchCorporateLobbying | 94,94 |
| LegalQuAD | 58,62 |
| LegalSummarization | 68,22 |
| **Overall** | **64,38** |

La model card también incluye una comparativa con otros modelos en MLEB:

| Rank | Model | MLEB | Size |
|---|---|---|---|
| 1 | Kanon 2 Embedder | 81,9 % | — |
| 2 | Voyage 4 Large | 81,1 % | 7B+ |
| 3 | Voyage 4 | 79,6 % | — |
| **4** | **GreenLeaf Law Embed Tiny** | **78,3 %** | **0,6B** |
| 5 | Voyage 4 Lite | 76,4 % | — |
| 6 | Qwen3 Embedding 8B | 75,9 % | 8B |
| 7 | Gemini Embedding 001 | 72,1 % | — |
| 8 | Jina v5 Text Small | 71,0 % | — |
| 9 | OpenAI Text Embedding 3 Large | 70,8 % | — |

No se han publicado resultados adicionales en otros benchmarks generales (MMLU, HumanEval, etc.) porque el modelo está especializado en embeddings legales.

## Requisitos de hardware

- El modelo tiene 596M de parámetros, lo que en bfloat16 ocupa aproximadamente 1,2 GB de memoria (el tamaño del repositorio es de 1,2 GB). Para inferencia, se estima una VRAM de entre 2 y 3 GB en bfloat16, y menos de 1 GB con cuantización int8 o binaria.
- Es ejecutable en GPUs de consumo como RTX 3060, RTX 4090 o superiores, así como en GPUs profesionales (A100, H100) si se requiere alto throughput.
- También puede ejecutarse en CPU, aunque con mayor latencia. La model card afirma que "corre en un portátil".
- Opciones de despliegue: sentence-transformers (Python), Text Embeddings Inference (TEI) mediante Docker, y ONNX Runtime para entornos de producción.
- No se proporcionan datos de latencia o throughput específicos, pero al ser un modelo de 0,6B, es significativamente más rápido que alternativas de 7B u 8B.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | MLEB-12 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GreenLeaf Law Embed Tiny | 596M | 1024 (hasta 32k) | 78,3 % | Apache 2.0 | HuggingFace |
| Qwen3 Embedding 8B | 8B | no disponible | 75,9 % | no disponible | HuggingFace |
| Voyage 4 Large | 7B+ | no disponible | 81,1 % | Propietaria | API |
| Jina v5 Text Small | no disponible | no disponible | 71,0 % | no disponible | HuggingFace |

GreenLeaf ofrece la mejor relación precisión por parámetro según la tabla de la model card, superando a modelos mucho más grandes como Qwen3 Embedding 8B y acercándose a soluciones propietarias como Voyage 4. Su licencia Apache 2.0 permite uso comercial sin restricciones, a diferencia de las APIs propietarias.

## Limitaciones y advertencias

- El contexto nativo es de 1024 tokens, lo que puede ser insuficiente para documentos legales muy extensos. Aunque soporta hasta 32 768 tokens, no se especifica cómo se logra esta extensión (posiblemente mediante interpolación de posiciones o ventanas deslizantes), y el rendimiento en contextos largos no está documentado.
- Los idiomas soportados no están especificados. Los benchmarks se centran en inglés legal (SCALR, ECHR, UK Legislative, etc.), por lo que su rendimiento en otros idiomas (español, francés, alemán) es desconocido y probablemente limitado.
- No es un modelo generativo: no puede redactar textos legales ni responder preguntas de forma autónoma. Solo produce embeddings.
- No se han documentado sesgos específicos, pero al estar entrenado con datos legales, puede reflejar sesgos presentes en la jurisprudencia o en la redacción de contratos.
- La model card no menciona riesgos de alucinación (al no generar texto, este riesgo no aplica directamente), pero sí existe la posibilidad de que los embeddings no capturen matices de interpretación legal compleja.
- Para uso en producción, se recomienda validar el rendimiento en el corpus específico de la organización, ya que los benchmarks públicos pueden no reflejar la distribución real de los datos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/judicialmind/greenleaf-law-embed-tiny
- Sitio web de JudicialMind: https://judicialmind.ai/
- Página de modelos interactivos: https://judicialmind.ai/platform/interactive-models
- Repositorio GitHub: https://github.com/judicialmind/judicialmind
