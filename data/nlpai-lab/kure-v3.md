# nlpai-lab/KURE-v3

## Resumen

KURE-v3 es un modelo de recuperación densa (dense retrieval) bilingüe coreano-inglés desarrollado por nlpai-lab, el mismo equipo responsable de las variantes KURE anteriores. Se trata de un modelo encoder de 1.140.918.272 parámetros que convierte cada texto en un único vector de 2.048 dimensiones, puntuado mediante similitud coseno, y que está afinado sobre el modelo base nvidia/Nemotron-3-Embed-1B-BF16. Su función no es generar texto, sino producir embeddings de consulta y de pasaje de alta calidad para sistemas RAG, búsqueda semántica y motores de recuperación documental.

El dato más relevante es su rendimiento en la suite MTEB(kor, v2) Retrieval, donde promedia 0,8027 nDCG@10 sobre nueve tareas, superando según el autor a modelos densos de 8B parámetros como comsat-embed-ko-8b-preview y Qwen3-Embedding-8B. Es decir, consigue resultados de la gama 8B con una octava parte del tamaño, lo que reduce drásticamente el coste de indexación y de inferencia en producción. Incorpora embeddings Matryoshka entrenados a 2.048, 1.024, 512 y 256 dimensiones, de modo que los vectores pueden truncarse para ahorrar almacenamiento con una pérdida de calidad controlada.

Soporta documentos de hasta 8.192 tokens, lo que lo hace apto para fragmentos largos (artículos, resoluciones judiciales, documentación técnica) sin trocear en exceso. Se distribuye con licencia Apache 2.0 en formato safetensors, es compatible con sentence-transformers y está disponible también como servicio a través de una API compatible con OpenAI en kure.kullm.ai. El modelo se publicó en HuggingFace con fecha de creación 2026-10-15 y, en el momento de redactar esta ficha, acumula 89 descargas y 14 likes.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder denso (etiqueta `ministral3` en HuggingFace), afinado desde nvidia/Nemotron-3-Embed-1B-BF16 |
| Parametros totales | 1.140.918.272 (1,1B) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 8.192 tokens |
| Tipos de cuantizacion | No se publican versiones cuantizadas; pesos en BF16. Admite cuantizacion estándar mediante librerías de inferencia (no verificada oficialmente) |
| Idiomas soportados | Coreano (ko) e inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16) |
| Dimensión del embedding | 2.048 (Matryoshka: 2.048 / 1.024 / 512 / 256) |
| Tipo de recuperación | Dense, single-vector |
| Función de similitud | Coseno (vectores L2-normalizados; el producto escalar equivale al coseno) |
| Prompts requeridos | `query: ` para consultas y `passage: ` para documentos (aplicados por `encode_query` / `encode_document`) |
| Tamaño del repositorio | 2,3 GB |
| Librería | sentence-transformers |
| Pipeline | sentence-similarity |
| Fecha de creación en HuggingFace | 2026-10-15 (última actualización 2026-10-21) |

## Arquitectura y entrenamiento

KURE-v3 es un encoder transformer de 1,1B parámetros derivado de nvidia/Nemotron-3-Embed-1B-BF16, un modelo de embeddings de la familia Nemotron. La etiqueta `ministral3` presente en el repositorio sugiere que la arquitectura subyacente corresponde a la familia Ministral 3, reutilizada aquí como backbone de embeddings. El modelo produce una representación pooled de 2.048 dimensiones por texto y se entrena con objetivo de similitud contrastiva sobre pares consulta-pasaje, con prompts asimétricos (`query:` / `passage:`) que el modelo espera en el momento de la codificación.

La innovación técnica destacable es el entrenamiento Matryoshka a cuatro dimensiones (2.048, 1.024, 512 y 256), que permite truncar los vectores en inferencia pasando `truncate_dim` o el parámetro `dimensions` en la API, sin reentrenar. El modelo soporta `flash_attention_2` como implementación de atención y está diseñado para documentos largos de hasta 8.192 tokens.

No se han publicado en la información disponible datos sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron fases de RLHF, DPO o destilación desde un modelo mayor. Tampoco se detalla la estrategia de negative mining ni el uso de hard negatives.

## Capacidades

- Generación de embeddings densos de 2.048 dimensiones para búsqueda semántica y recuperación de pasajes.
- Recuperación bilingüe coreano-inglés en un mismo espacio vectorial (consultas en un idioma contra documentos en el otro).
- Embeddings Matryoshka: truncado a 1.024, 512 o 256 dimensiones para reducir coste de almacenamiento y latencia de búsqueda.
- Manejo de documentos largos de hasta 8.192 tokens por fragmento.
- Prompts asimétricos integrados: `encode_query()` y `encode_document()` añaden automáticamente `query: ` y `passage: `.
- Compatibilidad directa con sentence-transformers y con `attn_implementation="flash_attention_2"`.
- Exposición como servicio mediante API compatible con OpenAI (`/v1/embeddings`) en kure.kullm.ai, con parámetro `input_type` (`query` o `document`) y `dimensions` ajustable.
- Vectores L2-normalizados, lo que permite usar producto escalar en índices vectoriales en lugar de distancia coseno explícita.
- No es un modelo generativo: no soporta tool calling, function calling, razonamiento multi-paso ni agentes. Su única salida es el vector de embedding.

## Casos de uso

- **RAG sobre documentación coreana**: indexar manuales, informes o bases de conocimiento en coreano con fragmentos de hasta 8.192 tokens y recuperar los pasajes relevantes para alimentar un LLM. La ventana larga evita fragmentar en trozos demasiado pequeños y perder contexto.
- **Búsqueda semántica en corpus jurídico o administrativo**: el benchmark incluye LawIRKo, donde el modelo obtiene 0,8158 nDCG@10. Adecuado para recuperación de normativa, contratos o expedientes con lenguaje técnico.
- **Atención al cliente en coreano con base de conocimiento**: dado su 0,9673 en Belebele (ko-ko) y 0,9666 en SQuADKorV1, funciona bien en preguntas factuales sobre pasajes concretos, típicas de un asistente de soporte con FAQ.
- **Búsqueda bilingüe en comercio electrónico**: consultas en coreano contra catálogos con descripciones en inglés (o viceversa) usando un único índice vectorial, sin necesidad de traducir previamente.
- **Deduplicación y clustering de documentos**: los embeddings normalizados permiten agrupar noticias, reseñas o tickets por similitud coseno y detectar duplicados a escala de millones de documentos.
- **Indexación de bajo coste con Matryoshka**: para corpus de decenas de millones de fragmentos, truncar a 256 dimensiones reduce el almacenamiento de 8 KB a 1 KB por vector (float32) manteniendo parte de la calidad; útil en una primera fase de recuperación seguida de un reranking más caro.
- **Clasificación y filtrado por similitud (few-shot)**: usar los embeddings como características para enrutar tickets, moderar contenido o etiquetar documentos comparándolos con prototipos por clase.

## Benchmarks y rendimiento

Evaluación sobre las nueve tareas de MTEB(kor, v2) Retrieval, métrica nDCG@10. Datos extraídos de la model card:

| Modelo | Tipo | Params | Avg | AutoRAG | PubHealthQA | Ko-StrategyQA | LawIRKo | SQuADKorV1 | Belebele (ko-ko) | MrTidy | MLDR | MIRACL |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| nlpai-lab/KURE-v3 | Dense | 1,1B | **0,8027** | 0,9324 | 0,8639 | 0,8192 | 0,8158 | 0,9666 | 0,9673 | 0,6320 | 0,4781 | 0,7489 |
| nlpai-lab/KURE-v2 | Late-interaction | 0,2B | 0,8160 | 0,9718 | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |
| comsat-embed-ko-8b-preview | Dense | 8B | no disponible (el autor indica que KURE-v3 lo supera) | — | — | — | — | — | — | — | — | — |
| Qwen3-Embedding-8B | Dense | 8B | no disponible (el autor indica que KURE-v3 lo supera) | — | — | — | — | — | — | — | — | — |

Observaciones: las tareas más débiles son MLDR (0,4781) y MrTidy (0,6320), ambas de recuperación multilingüe o multilingüe-larga, lo que sugiere que el rendimiento cae fuera del par coreano-inglés. KURE-v2, con arquitectura late-interaction (multi-vector) y solo 0,2B parámetros, reporta un promedio superior (0,8160) pero con un coste de indexación mucho mayor al generar múltiples vectores por documento. No se han publicado resultados en la información disponible para MMLU, HumanEval, GSM8K ni otras suites de razonamiento, ya que el modelo no es generativo.

## Requisitos de hardware

- **VRAM estimada en BF16**: pesos de aproximadamente 2,3 GB; con overhead de activaciones y KV/caché de embeddings, entre 3 y 4 GB para inferencia de una sola consulta o lotes pequeños (estimación).
- **VRAM estimada en FP32**: alrededor de 4,6 GB solo de pesos.
- **Cuantización**: no hay versiones oficiales cuantizadas ni GGUF publicados. Una cuantización a 8 bits dejaría los pesos en torno a 1,2 GB y a 4 bits en torno a 0,6 GB (estimación teórica, no verificada por el autor).
- **GPU consumer**: cabe holgadamente en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080 y RTX 4090. También en GPUs de 8 GB con margen suficiente en BF16.
- **GPU de datacenter**: L4, A10G, T4 (BF16 limitado en T4), A100 y H100 para indexación masiva por lotes. Para máxima eficiencia se recomienda `flash_attention_2`, que requiere Ampere o superior.
- **Opciones de despliegue**: sentence-transformers (referencia de la model card), Text Embeddings Inference (TEI) de HuggingFace, vLLM en modo embeddings, Infinity, o la API gestionada de kure.kullm.ai. No hay soporte GGUF, por lo que llama.cpp y Ollama no son viables sin convertir los pesos.
- **Almacenamiento del índice**: 2.048 dimensiones en float32 equivalen a 8 KB por vector; un millón de documentos ocupa unos 8 GB. Con truncado a 256 dimensiones, ese mismo millón baja a aproximadamente 1 GB.
- **Latencia y throughput**: no disponible. No se han publicado mediciones de latencia ni de documentos por segundo.

## Comparativa con modelos similares

| Modelo | Params | Tipo de embedding | Contexto | Idiomas | Avg MTEB(kor, v2) Retrieval | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| nlpai-lab/KURE-v3 | 1,1B | Dense, 2.048 dims (Matryoshka 256-2.048) | 8.192 | ko, en | 0,8027 | Apache 2.0 | HuggingFace + API |
| nlpai-lab/KURE-v2 | 0,2B | Late-interaction (multi-vector) | no disponible | ko, en | 0,8160 | no disponible en la información | HuggingFace |
| Qwen3-Embedding-8B | 8B | Dense | no disponible | multilingüe | no disponible (superado por KURE-v3 según el autor) | no disponible en la información | HuggingFace |
| comsat-embed-ko-8b-preview | 8B | Dense | no disponible | coreano | no disponible (superado por KURE-v3 según el autor) | no disponible en la información | HuggingFace |

El compromiso principal es claro: KURE-v3 ofrece un promedio cercano al de KURE-v2 con un único vector por documento (frente a la representación multi-vector de v2), lo que abarata el índice y la búsqueda, a costa de 1,5 puntos porcentuales de nDCG@10 medio. Frente a los modelos densos de 8B, la ventaja declarada es de eficiencia: mismo nivel de rendimiento con 7 veces menos parámetros.

## Limitaciones y advertencias

- **Sesgo de dominio**: la evaluación se limita a recuperación en coreano. El rendimiento real en otros dominios o en inglés no está cuantificado en la model card, pese a declarar soporte bilingüe.
- **Idiomas**: solo coreano e inglés. El bajo resultado en MLDR (0,4781) apunta a un rendimiento pobre en escenarios multilingües fuera de ese par.
- **No es un modelo generativo**: no responde preguntas, no razona y no ejecuta herramientas. Cualquier caso de uso que requiera generación necesita un LLM adicional.
- **Dependencia de los prompts**: usar `encode_query` y `encode_document` (o los equivalentes `input_type`) es obligatorio para obtener el rendimiento reportado; codificar consultas y documentos con la misma función degrada la calidad.
- **Riesgo de alucinación indirecta**: en un pipeline RAG, un embedding mediocre trae pasajes irrelevantes y el LLM generador puede alucinar sobre ellos. El nDCG@10 de 0,4781 en MLDR indica que en corpus multilingües esta derivada es un riesgo real.
- **Coste de almacenamiento**: 2.048 dimensiones es el doble o cuádruple de lo habitual en modelos de embeddings (768-1.024). Sin truncado Matryoshka, el índice crece proporcionalmente.
- **Licencia**: Apache 2.0 permite uso comercial, pero conviene verificar la licencia del modelo base nvidia/Nemotron-3-Embed-1B-BF16, que puede imponer condiciones adicionales no reflejadas en el repositorio derivado.
- **Madurez**: 89 descargas y 14 likes en el momento de la consulta; es un modelo reciente (octubre de 2026) con poca validación independiente fuera del equipo autor.
- **Sin datos de entrenamiento publicados**: no se conoce la composición del corpus ni posibles filtraciones de los benchmarks de evaluación en el conjunto de entrenamiento.
- **Cuantización no soportada oficialmente**: desplegar en entornos con requisitos de cuantización (GGUF, GPTQ, AWQ) requiere trabajo adicional no documentado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/nlpai-lab/KURE-v3
- Repositorio GitHub del proyecto KURE: https://github.com/nlpai-lab/KURE
- API gestionada (compatible con OpenAI): https://kure.kullm.ai/
- Modelo base: https://huggingface.co/nvidia/Nemotron-3-Embed-1B-BF16
- Versión anterior (late-interaction): https://huggingface.co/nlpai-lab/KURE-v2
- Logo del proyecto: https://huggingface.co/nlpai-lab/KURE-v2/resolve/main/kure_logo.png
- La búsqueda web realizada no devolvió resultados relevantes sobre el modelo: únicamente páginas del dominio de Société Générale sin relación con KURE-v3. No se han localizado papers, blogs técnicos ni demos adicionales más allá de los enlaces anteriores.
