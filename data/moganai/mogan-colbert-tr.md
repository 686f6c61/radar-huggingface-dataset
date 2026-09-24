# moganai/Mogan-ColBERT-TR

## Resumen

Mogan-ColBERT-TR es un modelo de recuperación de información (retrieval) en turco basado en interacción tardía (late interaction) y representación multi-vector, desarrollado por MoganAI (Furkan Yilmaz, Habibe Aleyna Tasdemir y Muhammed Faruk Gozay). En lugar de comprimir cada texto en un único vector, mantiene una representación por token mediante una proyección 768→128 y puntúa con MaxSim. Cuenta con 148.768.512 parámetros (148,9 M) y se distribuye bajo licencia Apache-2.0.

El modelo parte de MoganBERT-Embed, un encoder ModernBERT entrenado desde cero sobre un corpus íntegramente turco (no es un ajuste fino de un base extranjero), y se entrena mediante destilación KL desde el cross-encoder `bge-reranker-v2-m3`. Las consultas se rellenan con `[MASK]` hasta 32 tokens y los documentos se codifican hasta 512 tokens.

Su relevancia práctica es doble: cubre un hueco poco atendido (retrieval multi-vector de calidad en turco, un idioma con menos recursos que el inglés) y ofrece un pipeline de producción claro en dos etapas, con MoganBERT-Embed generando candidatos y este modelo reordenándolos. El autor publica resultados zero-shot sobre el benchmark TurkColBERT con el pipeline oficial (índice PLAID y MaxSim exacto), lo que permite comparar sin contaminación de entrenamiento.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder ModernBERT con cabeza multi-vector de interacción tardía (ColBERT); proyección 768→128 y scoring MaxSim |
| Parametros totales | 148.768.512 (148,9 M) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 512 tokens para documentos y 32 tokens para consultas (las consultas se rellenan con `[MASK]`); la ventana máxima del encoder base no se especifica en la información disponible |
| Tipos de cuantizacion | No disponible; el repositorio solo publica pesos en safetensors |
| Idiomas soportados | Turco (tr), monolingüe |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (tamaño del repositorio: 0,6 GB) |

Otros datos: `library_name` PyLate, `pipeline_tag` sentence-similarity, modelo base `moganai/MoganBERT-Embed`, etiquetas de compatibilidad con `text-embeddings-inference` y endpoints. 87 descargas y 4 likes en el momento de la consulta (creado el 27 de agosto de 2026, actualizado el 24 de septiembre de 2026).

## Arquitectura y entrenamiento

La arquitectura combina un encoder ModernBERT monolingüe en turco con el esquema ColBERT de interacción tardía: el encoder produce un embedding por token de 768 dimensiones que se proyecta a 128 dimensiones; la similitud consulta-documento se calcula con MaxSim, es decir, para cada token de la consulta se toma el máximo producto escalar contra los tokens del documento y se suman esos máximos. Las consultas se limitan a 32 tokens y los documentos a 512. Frente a un retriever denso de un solo vector, esta representación conserva granularidad léxica y semántica a nivel de token, a costa de un índice mucho mayor.

El entrenamiento consiste en una destilación KL de una sola época desde el cross-encoder `bge-reranker-v2-m3`, con 1 positivo y 7 negativos duros minados por consulta, sobre 1×H100. El optimizador usa dos grupos de parámetros con tasas distintas —1e-5 para el encoder y 1e-4 para la proyección— porque la proyección parte de inicialización aleatoria mientras que el encoder ya está preentrenado. Los datos de entrenamiento son pares título→pasaje extraídos del corpus de preentrenamiento de MoganAI más dos conjuntos turcos de retrieval basados en preguntas. Los pasajes se dividen en el dominio de caracteres respetando límites de frase (en lugar de decodificar listas de tokens truncadas). Los negativos se minan en el espacio de embeddings de MoganBERT-Embed y se filtran con tres reglas simultáneas: descartar los 10 mejores, descartar candidatos que comparten el identificador de grupo de la consulta y descartar cualquier candidato con coseno superior a 0,95. La máscara de grupo es relevante porque un segundo pasaje del mismo documento puntúa alto para el mismo título sin ser un negativo real.

## Capacidades

- Recuperación de información en turco mediante representación multi-vector y scoring MaxSim, con codificación asimétrica de consultas (32 tokens) y documentos (hasta 512 tokens).
- Generación de candidatos en índices PLAID, con búsqueda exacta MaxSim sobre los vectores almacenados.
- Reordenación (reranking) de listas de candidatos previamente recuperadas por un retriever denso, mediante `pylate.rank.rerank`.
- Búsqueda semántica tolerante a reformulaciones y a variaciones morfológicas propias del turco (lengua aglutinante), gracias a la representación a nivel de token.
- Integración con el ecosistema PyLate y con `sentence-transformers` para pipelines de embeddings.
- Compatibilidad declarada con `text-embeddings-inference` y con endpoints gestionados.
- No dispone de modo de razonamiento (thinking), tool calling, capacidades de agente, visión ni audio: es exclusivamente un modelo de representación y recuperación de texto.

## Casos de uso

- **RAG sobre documentación corporativa en turco**: usar MoganBERT-Embed para recuperar los 100 primeros candidatos de un índice denso y Mogan-ColBERT-TR para reordenarlos con MaxSim. Es el despliegue que el propio autor recomienda, porque evita el coste de mantener un índice multi-vector completo sobre todo el corpus.
- **Búsqueda semántica en comercio electrónico turco**: indexar descripciones de producto y títulos para resolver consultas coloquiales ("kışlık mont kadın") contra catálogos con vocabulario heterogéneo, aprovechando que el modelo fue entrenado sobre pares título→pasaje.
- **Atención al cliente y bases de conocimiento/FAQ**: dado un corpus de artículos de ayuda en turco, recuperar el artículo relevante para una consulta de usuario y alimentar un generador de respuestas; el componente de recuperación es el que determina la precisión final del sistema.
- **Búsqueda jurídica o administrativa**: localizar artículos, cláusulas o expedientes relevantes en repositorios largos en turco, donde los términos exactos importan y la coincidencia a nivel de token aporta ventaja frente a un único vector.
- **Búsqueda académica y de literatura técnica turca**: consultar tesis, resúmenes y artículos indexados, con reranking sobre los resultados de un primer recuperador.
- **Deduplicación y agrupación de documentos**: comparar documentos entre sí con MaxSim para detectar duplicados casi idénticos o versiones solapadas de un mismo texto; el filtrado por coseno superior a 0,95 usado en el entrenamiento es una heurística directamente reutilizable.
- **Evaluación y ajuste de pipelines de retrieval turcos**: al publicar resultados zero-shot con un pipeline reproducible (índice PLAID, MaxSim exacto, `document_length=300`, `k=100`), sirve como línea base para comparar nuevos retrievers en turco.

## Benchmarks y rendimiento

La model card reporta resultados sobre TurkColBERT con el pipeline oficial (índice PLAID, MaxSim exacto, `document_length=300`, `k=100`). Ninguno de los cinco conjuntos de datos aparece en el pool de entrenamiento, por lo que los resultados son zero-shot. La benchmark evalúa a `document_length=300` mientras que el modelo se entrenó a 512, de modo que el autor los describe como una cota inferior.

| Metrica (media de 5 datasets) | Valor |
|---|---|
| nDCG@10 | 31,81 |
| nDCG@100 | 35,53 |
| Recall@100 | 56,98 |
| mAP | 25,13 |

No se han publicado en la información disponible los resultados desglosados por dataset ni comparaciones numéricas directas contra otros modelos en la misma tabla. Tampoco se han proporcionado resultados de benchmarks de propósito general (MMLU, HumanEval, GSM8K), que además no aplican a un modelo de retrieval.

## Requisitos de hardware

- VRAM para inferencia: con 148,9 M de parámetros, los pesos ocupan aproximadamente 595 MB en fp32 y 298 MB en fp16/bf16. Sumando activaciones y overhead del runtime, cabe holgadamente en 2-4 GB de VRAM.
- GPU recomendadas: entra en cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090, e incluso iGPU o CPU para volúmenes pequeños). Para indexación masiva o reranking a gran escala, una A100 o H100 acelera el proceso, pero no son necesarias.
- El entrenamiento documentado se realizó en 1×H100, lo que da idea del coste si se quiere reproducir la destilación.
- Opciones de despliegue: PyLate (`pylate.models.ColBERT`, `pylate.indexes.PLAID`, `pylate.retrieve.ColBERT`, `pylate.rank.rerank`), `sentence-transformers` y `text-embeddings-inference` (compatibilidad declarada). No se mencionan pesos GGUF, por lo que el despliegue con llama.cpp u Ollama no está soportado tal cual.
- Almacenamiento del índice: un índice multi-vector es "decenas de veces mayor" que uno denso, según la model card. Como referencia aritmética, 512 tokens × 128 dimensiones = 65.536 valores por documento, aproximadamente 128 KB por documento en fp16 antes de la compresión que aplica PLAID; el índice completo puede reducirse notablemente con cuantización de centroides y poda.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / uso | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Mogan-ColBERT-TR | 148,9 M | 32 tokens consulta, 512 tokens documento | Multi-vector, interacción tardía | Apache-2.0 | HuggingFace (PyLate) |
| MoganBERT-Embed | 149 M | Embeddings de un solo vector | Denso | no disponible en la información proporcionada | HuggingFace |
| MoganBERT-TR | 149,4 M | Encoder base | Encoder | no disponible en la información proporcionada | HuggingFace |
| bge-reranker-v2-m3 | No disponible en la información proporcionada | Cross-encoder de reranking | Cross-encoder | no disponible en la información proporcionada | Referenciado en la model card como docente |

Los tres primeros modelos pertenecen a la misma familia MoganBERT y comparten escala de parámetros; la diferencia es el tipo de representación (encoder base, denso de un vector y multi-vector de interacción tardía). No se dispone de valores de benchmark comparativos entre ellos en la información proporcionada, ni de resultados de otros retrievers multi-vector en turco para establecer una comparación numérica.

## Limitaciones y advertencias

- Modelo monolingüe en turco: no se ha entrenado ni evaluado para otros idiomas, por lo que su uso fuera del turco no está respaldado.
- Sesgos conocidos: no disponible. El modelo hereda los sesgos del corpus de preentrenamiento de MoganBERT-Embed y de los datos de destilación, pero no se documenta un análisis específico de sesgos.
- Riesgo de alucinación: el modelo no genera texto, por lo que no alucina contenido; el riesgo se traslada al generador que consuma sus resultados si la recuperación falla.
- La representación multi-vector implica un índice mucho mayor que el de un retriever denso (decenas de veces, según el autor), con el consiguiente coste de almacenamiento, memoria y tiempo de indexación. El propio autor recomienda un esquema de dos etapas en producción.
- Los resultados publicados son una cota inferior: se evaluó a `document_length=300` aunque el entrenamiento fue a 512 tokens, de modo que el rendimiento real con documentos de hasta 512 tokens puede ser superior, pero no está cuantificado.
- Las consultas se truncan o rellenan a 32 tokens; consultas más largas pueden perder información respecto a la codificación completa.
- Uso comercial: la licencia Apache-2.0 lo permite sin restricciones adicionales conocidas, pero conviene verificar las condiciones de los datos de entrenamiento y del corpus propietario de MoganAI, no detalladas en la información disponible.
- El identificador arXiv citado en las etiquetas (`arxiv:2608.26344`) y las fechas del repositorio son posteriores a la fecha de consulta habitual; conviene verificar la disponibilidad del paper antes de citarlo.
- No se especifican tasas de latencia, throughput ni límites de batch recomendados, por lo que el dimensionado de producción debe medirse empíricamente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/moganai/Mogan-ColBERT-TR
- Paper (según las etiquetas de la model card): https://huggingface.co/papers/2608.26344
- Blog del autor: https://moganai.github.io/
- Colección de modelos MoganBERT: https://huggingface.co/collections/moganai/moganbert
- Modelo base: https://huggingface.co/moganai/MoganBERT-Embed
- Encoder base de la familia: https://huggingface.co/moganai/MoganBERT-TR
- Cross-encoder docente referenciado en la model card: https://huggingface.co/BAAI/bge-reranker-v2-m3
- Librería PyLate (instalación: `pip install -U pylate`)
- Benchmark TurkColBERT: referenciado en la model card, no se ha proporcionado URL en la información disponible
- Repositorio de la librería PyLate: no se ha proporcionado URL en la información disponible
