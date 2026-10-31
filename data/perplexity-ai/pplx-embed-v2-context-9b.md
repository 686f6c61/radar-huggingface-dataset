# perplexity-ai/pplx-embed-v2-context-9b

## Resumen

`pplx-embed-v2-context-9b` es un modelo de embeddings multimodal (visión-lenguaje) desarrollado por Perplexity AI, diseñado para recuperación de información sobre texto, imágenes y documentos visuales. Se trata de un ajuste (finetune) de `pplx-embed-v2-late-9b`, con aproximadamente 8.400 millones de parámetros según los pesos en safetensors, y su característica distintiva es la generación de embeddings contextuales: cada fragmento (chunk) de un documento se codifica teniendo en cuenta el contexto circundante, lo que mejora la calidad de la recuperación frente a la codificación aislada de fragmentos.

El modelo resuelve un problema clásico en sistemas RAG: la pérdida de contexto al indexar documentos fragmentados. Además, extiende este enfoque contextual a entradas visuales, permitiendo dividir imágenes o páginas de documentos en bandas horizontales recuperables mediante índices densos ANN estándar. Su espacio de embeddings de 1024 dimensiones (prefijo MRL) es compartido con la variante más pequeña `pplx-embed-v2-context-0.6b`, lo que permite indexar con un modelo y consultar con otro.

Publica su trabajo bajo licencia MIT y se distribuye en Hugging Face con la librería `transformers` (requiere `trust_remote_code=True` por usar código personalizado). Los detalles de entrenamiento y resultados de benchmarks se recogen en su informe técnico en arXiv.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language embedding model (pplx_contextual_qwen3_5, código personalizado); soporta atención lineal rápida vía flash-linear-attention |
| Parametros totales | 8.401.083.632 (según safetensors) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (la API de texto no trunca entradas; hay que fragmentar manualmente) |
| Tipos de cuantizacion | Embeddings de salida nativamente cuantizados a int8 sin normalizar; no hay cuantización de pesos publicada |
| Idiomas soportados | Multilingüe (sin lista concreta de idiomas publicada) |
| Licencia | MIT |
| Formato de pesos | safetensors (tamaño del repositorio: 33,6 GB) |

## Arquitectura y entrenamiento

El modelo pertenece a la familia `pplx_contextual_qwen3_5`, lo que indica una base basada en la arquitectura Qwen3.5. Utiliza MRoPE de tres ejes (3-axis MRoPE) para codificar posiciones espaciales en imágenes y conserva wrappers de imagen nativos. Soporta un camino de atención lineal rápido mediante las librerías `flash-linear-attention` y `causal-conv1d`, además de la implementación estándar `sdpa`. Fue entrenado con pérdidas Matryoshka (MRL) a 1024 y 2048 dimensiones, y emplea prefijos distintos para consultas y documentos, lo que obliga a usar métodos de codificación separados (`encode_queries` frente a `encode`).

El modelo produce embeddings de salida nativamente cuantizados a int8 sin normalizar, un detalle poco habitual que reduce el espacio de almacenamiento en índices vectoriales. Los detalles sobre el número de tokens de entrenamiento, la composición del dataset y el uso de RLHF/DPO no están disponibles en la información proporcionada; el informe técnico (arXiv:2610.38854) es la referencia para esos datos.

## Capacidades

- Generación de embeddings contextuales: cada chunk de un documento se codifica con el contexto circundante a la vista (modo contextual) o de forma aislada (modo no contextual).
- Embeddings multimodales: codifica texto e imágenes en un espacio compartido, permitiendo búsqueda entre texto e imágenes (por ejemplo, consultar en texto sobre páginas de documentos visuales).
- Chunking contextual de imágenes: divide imágenes en bandas horizontales (parámetro `chunks`), cada una con su propio embedding, recuperable vía índices densos ANN estándar.
- Matryoshka Representation Learning: embeddings trunables a 1024 dimensiones (además de las 2048 nativas), compatibles con la variante 0.6B.
- Salida int8 nativa sin normalizar, con opción de normalización L2 (`normalize_embeddings=True`).
- Pipeline de `feature-extraction` y `sentence-similarity` en Hugging Face.
- Soporte multilingüe (sin detalle de idiomas concretos).
- No soporta tool calling, agentes ni generación de texto: es un modelo de embeddings, no un LLM generativo.

## Casos de uso

- RAG sobre documentos largos: los chunks se indexan con embeddings contextuales que capturan el documento circundante, mejorando la precisión de recuperación frente a embeddings aislados; ideal para bases de conocimiento empresariales.
- Búsqueda en documentos visuales (PDF escaneados, presentaciones, informes): las páginas se codifican como imágenes divididas en bandas horizontales y se recuperan con consultas en texto, sin necesidad de OCR previo.
- Indexación y consulta con modelos distintos: se puede indexar el corpus con la variante 0.6B (más barata) y consultar con la de 9B, o viceversa, gracias al espacio compartido de 1024 dimensiones; útil para equilibrar coste de indexación masiva y calidad de consulta.
- Índices vectoriales a gran escala: la salida int8 nativa reduce el tamaño de los índices ANN (FAISS, Milvus, Qdrant) a la mitad o menos respecto a embeddings float32.
- Búsqueda semántica multilingüe: recuperación de fragmentos en varios idiomas con consultas en otro idioma, aprovechando el entrenamiento multilingüe.
- Deduplicación y agrupación de contenido multimodal: agrupar imágenes y textos similares en el mismo espacio de embeddings para organización de corpus o moderación de contenido.
- Sistemas de respuesta a preguntas sobre facturas, tablas y gráficos: la codificación por bandas horizontales permite localizar la sección exacta de una página (por ejemplo, la fila de ingresos anuales) que responde a la consulta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card remite al informe técnico en arXiv (https://arxiv.org/abs/2610.38854) para resultados de benchmarks y detalles de entrenamiento.

## Requisitos de hardware

- VRAM estimada: con 8.400 millones de parámetros en bfloat16, se necesitan unos 17 GB solo para los pesos; con overhead de activaciones y procesamiento de imágenes, se recomienda una GPU con 24 GB o más. No hay cuantización de pesos publicada para reducir este requisito.
- GPU recomendadas: RTX 4090 o RTX 5090 (24-32 GB) para inferencia individual; A100 40/80 GB o H100 para indexación masiva y lotes grandes.
- Consumer GPUs: cabe en una RTX 4090 de 24 GB en bfloat16. GPUs de 16 GB (RTX 4080, A4000) no son suficientes en precisión completa sin cuantización, que no está publicada.
- Despliegue: la vía documentada es `transformers>=5.4.0` con `AutoModel.from_pretrained(..., trust_remote_code=True)`. Se recomienda instalar `flash-linear-attention` y `causal-conv1d` para la ruta rápida de atención lineal. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles. Los parámetros documentados incluyen `batch_size` (por defecto 32) para controlar el rendimiento en lotes.
- Ejecución en CPU: posible en teoría (la API devuelve tensores de CPU si se solicita), pero no documentada y probablemente poco práctica dado el tamaño del modelo.

## Comparativa con modelos similares

| Modelo | Parametros | Modalidad | Embeddings contextuales | Dimensiones | Licencia |
|---|---|---|---|---|---|
| pplx-embed-v2-context-9b | 8.400 M | Texto + imagen | Sí (texto e imágenes) | 2048 (MRL a 1024) | MIT |
| pplx-embed-v2-context-0.6b | no disponible | Texto + imagen | Sí (texto e imágenes) | Espacio compartido a 1024 | MIT |
| pplx-embed-v2-late-9b (modelo base) | no disponible | no disponible | no disponible | no disponible | MIT |
| Jina embeddings v4 / ColQwen (alternativas multimodales conocidas) | no disponible | Texto + imagen | Parcial (late interaction en ColQwen) | no disponible | Varía |

Nota: la comparativa se limita a la familia propia del modelo, ya que la información proporcionada no incluye datos detallados de alternativas de terceros. Como referencia cualitativa, compite en la categoría de embeddings multimodales para RAG visual con modelos como ColPali/ColQwen (late interaction) y Jina Embeddings v4, si bien el enfoque de embeddings contextuales con salida int8 nativa y espacio MRL compartido entre tamaños es distintivo de la familia pplx-embed.

## Limitaciones y advertencias

- La API de texto no trunca las entradas: los documentos que superen la longitud de entrada configurada deben fragmentarse o truncarse manualmente, o la codificación fallará.
- Es obligatorio usar `encode_queries` para consultas y `encode` para documentos; codificar consultas con `encode` degrada silenciosamente la calidad de recuperación, un error difícil de detectar.
- Los chunks en modo contextual deben ser no solapados (non-overlapping).
- Los embeddings de salida vienen sin normalizar y en int8: hay que compararlos con similitud coseno o normalizarlos antes de usar producto escalar; usar producto escalar directo sobre valores sin normalizar da resultados incorrectos.
- Solo se han entrenado truncamientos Matryoshka a 1024 y 2048 dimensiones; otros tamaños de truncamiento no son válidos.
- Requiere `trust_remote_code=True` (código personalizado), lo que implica ejecutar código arbitrario del autor del repositorio; conviene revisar el código antes de usarlo en producción.
- No hay cuantización de pesos publicada (GGUF, AWQ, GPTQ), lo que limita el despliegue en hardware modesto.
- Como modelo de embeddings, no genera texto ni razona: no es sustituto de un LLM en tareas generativas.
- Riesgo de alucinación: no aplicable directamente (no genera texto), pero un modelo de embeddings puede devolver resultados irrelevantes con consultas fuera de distribución.
- Sesgos: no documentados en la información disponible; al ser multilingüe y multimodal, pueden existir sesgos lingüísticos y visuales no cuantificados.
- Restricciones de licencia: ninguna relevante; la licencia MIT permite uso comercial sin restricciones destacables.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/perplexity-ai/pplx-embed-v2-context-9b
- Modelo base: https://huggingface.co/perplexity-ai/pplx-embed-v2-late-9b
- Variante pequeña compatible: https://huggingface.co/perplexity-ai/pplx-embed-v2-context-0.6b
- Informe técnico (arXiv): https://arxiv.org/abs/2610.38854
