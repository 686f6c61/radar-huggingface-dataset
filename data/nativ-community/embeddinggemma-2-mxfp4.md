# nativ-community/embeddinggemma-2-mxfp4

## Resumen
nativ-community/embeddinggemma-2-mxfp4 es una conversión al formato MXFP4 (4 bits) del modelo multimodal de embeddings google/embeddinggemma-2, publicada por el usuario nativ-community y pensada para ejecutarse con MLX sobre Apple Silicon. Se trata de un modelo de extracción de características (pipeline `feature-extraction`, también etiquetado como `sentence-similarity`) que produce embeddings normalizados de 768 dimensiones para texto, imagen, audio y vídeo, conservando los codificadores de las cuatro modalidades.

El modelo cuenta con 744.371.512 parámetros y la conversión cuantiza el codificador de texto y la proyección de audio a MXFP4 de 4 bits con tamaño de grupo 32, mientras que las torres de visión y audio y la proyección de visión permanecen en BF16. El repositorio ocupa 1,1 GB y los pesos cuantizados declarados pesan 1,090 GB (decimal), lo que lo sitúa en el rango de modelos ligeros desplegables en un único equipo.

Su relevancia actual es doble: por un lado, permite búsqueda semántica y recuperación multimodal (RAG sobre texto, imagen, audio y vídeo) ejecutada en local, sin dependencia de GPU NVIDIA; por otro, es una conversión de comunidad, sin descargas ni validación externa más allá de las comprobaciones numéricas del propio autor, por lo que conviene evaluarla antes de usarla en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal con codificador de texto y torres de visión y audio; no se detalla la arquitectura interna en la información disponible |
| Parámetros totales | 744.371.512 |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | MXFP4, 4 bits, tamaño de grupo 32 (codificador de texto y proyección de audio); torres de visión y audio y proyección de visión en BF16 |
| Idiomas soportados | multilingüe (sin lista detallada de idiomas en la información disponible) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors en formato MLX (librería `mlx`) |
| Dimensión del embedding | 768, con truncamiento Matryoshka a 128, 256 o 512 |
| Modalidades | texto, imagen, audio y vídeo |
| Modelo base | google/embeddinggemma-2 (revisión `914f7f89142e33e77833254d9c9b90c3cef7303b`) |
| Herramienta de conversión | MLX-VLM, revisión `3d87e884` (rama `pc/embeddinggemma-2`), MLX 0.32.3 |
| Tamaño de pesos | 1,090 GB (decimal) |

## Arquitectura y entrenamiento
La ficha del autor no describe la arquitectura interna más allá de indicar que la conversión conserva los codificadores de texto, imagen, audio y vídeo, y que el modelo produce embeddings normalizados de 768 dimensiones. La presencia de torres de visión y audio y de proyecciones específicas por modalidad apunta a un diseño multimodal de tipo torre de codificación con proyección a un espacio de embedding compartido, pero no se aportan detalles sobre el número de capas, la atención utilizada ni el mecanismo de fusión entre modalidades.

Tampoco se documentan en la información disponible los datos de entrenamiento del modelo base (número de tokens, composición del dataset, uso de RLHF o DPO) ni innovaciones técnicas propias: el autor remite expresamente a la model card original de google/embeddinggemma-2 para uso previsto, entrenamiento, evaluación y limitaciones. Lo único específico de esta conversión es el esquema de cuantización: MXFP4 de 4 bits con grupo 32 aplicado de forma selectiva al codificador de texto y a la proyección de audio, manteniendo el resto de componentes en BF16. El autor advierte de que las ponderaciones y activaciones no cuantizadas deben permanecer en BF16 y que el modelo no debe convertirse a float16.

## Capacidades
- Generación de embeddings de texto normalizados de 768 dimensiones para similitud semántica y recuperación.
- Extracción de características de imagen (`image-feature-extraction`), con torre de visión en BF16.
- Extracción de características de audio (`audio-feature-extraction`) y de vídeo (`video-feature-extraction`, validado con entradas de dos fotogramas).
- Embeddings conjuntos texto+imagen, lo que habilita recuperación cruzada entre modalidades.
- Soporte multilingüe declarado, aunque sin lista de idiomas ni evaluación por idioma en la información disponible.
- Truncamiento Matryoshka opcional a 128, 256 o 512 dimensiones para reducir coste de almacenamiento y búsqueda, renormalizando el vector truncado.
- Uso de prefijos de tarea procedentes de `config_sentence_transformers.json` (por ejemplo, `task: search result | query:` y `title: none | text:`).
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso ni modo de pensamiento: es un modelo de embeddings, no un modelo generativo conversacional.

## Casos de uso
- Búsqueda semántica multilingüe en documentación técnica: se indexan pasajes con prefijos de documento y se consulta con prefijos de consulta, usando la similitud coseno entre embeddings de 768 dimensiones para recuperar los fragmentos relevantes.
- RAG local sobre corpus privados: al ejecutarse con MLX en un Mac, los documentos sensibles no salen del equipo; el modelo actúa como recuperador dentro de un pipeline que alimenta a un LLM generativo.
- Deduplicación y agrupamiento de documentos: el embedding de 768 dimensiones permite clustering y detección de near-duplicates sobre grandes volúmenes sin coste de API.
- Clasificación zero-shot y enrutado de tickets: comparar el embedding de un ticket contra embeddings de prototipos de categoría y asignar la más cercana.
- Recuperación de imágenes por descripción textual: la torre de visión y la proyección compartida permiten buscar imágenes a partir de una consulta en lenguaje natural.
- Indexación y búsqueda en archivos de audio y vídeo: extracción de características de audio y de fotogramas de vídeo para localizar fragmentos por contenido semántico.
- Sistemas de recomendación por similitud de ítems: construir un espacio vectorial común para textos, imágenes y audio y recomendar elementos cercanos al perfil del usuario.
- Evaluación de calidad de traducciones o resúmenes: medir la similitud coseno entre el embedding del original y el de la salida como métrica complementaria a BLEU o ROUGE.
- Filtrado y moderación por similitud: comparar contenido entrante contra embeddings de referencia de contenido no deseado.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks (MTEB u otros) en la información disponible. El propio autor indica explícitamente que sus comprobaciones son verificaciones numéricas de humo, no un benchmark de calidad de recuperación. Los únicos datos medidos son las desviaciones de los embeddings de la conversión MXFP4 frente al checkpoint original ejecutado en PyTorch FP32:

| Entrada | Similitud coseno mínima frente a FP32 | Error absoluto máximo |
|---|---:|---:|
| audio | 0,955243 | 0,031123 |
| imagen | 0,984482 | 0,028382 |
| texto | 0,971975 | 0,030078 |
| texto + imagen | 0,981411 | 0,022458 |
| vídeo | 0,979497 | 0,032354 |

Todas las salidas verificadas fueron finitas, unitarias y de 768 dimensiones; las mediciones completas, incluidas las comparaciones con vectores truncados, están en `validation.json` del repositorio.

## Requisitos de hardware
- Pesos cuantizados declarados: 1,090 GB (decimal); el repositorio completo ocupa 1,1 GB. El total de memoria en inferencia es superior por las torres en BF16, las activaciones y el procesador multimodal; una estimación razonable es de 2 a 3 GB, aunque el autor no publica cifras.
- El repositorio usa MLX, por lo que el despliegue está orientado a Apple Silicon con memoria unificada (familias M1, M2, M3 y M4). No hay soporte CUDA documentado en la información disponible.
- No requiere GPU dedicada: cabe holgadamente en cualquier Mac con 8 GB o más de memoria unificada, ya que es un codificador de 744 millones de parámetros.
- Opciones de despliegue: MLX-VLM en la revisión `3d87e884` (`pip install "git+https://github.com/Blaizzy/mlx-vlm.git@3d87e88402f307efbf68e568971aa887ee7d9ed0"`), `mlx>=0.32.3` y `transformers>=5.18.0`. Carga de texto mediante `AutoTokenizer` y `load_embedding_model`; carga multimodal mediante `mlx_vlm.load`, que requiere una build de Transformers que exponga `EmbeddingGemma2Processor`.
- No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI para este repositorio, ni formatos GGUF.
- Latencia y throughput: no disponibles. Al ser un codificador sin generación autorregresiva, el coste por lote es bajo, pero no hay cifras publicadas.
- Aviso del autor: no convertir el modelo a float16; mantener en BF16 los pesos y activaciones no cuantizados.

## Comparativa con modelos similares

| Modelo | Parámetros | Dimensión de embedding | Contexto | Licencia | Formato | Tamaño de pesos |
|---|---:|---|---|---|---|---:|
| embeddinggemma-2-mxfp4 (este repo) | 744.371.512 | 768 (Matryoshka 128-768) | no disponible | Apache-2.0 | safetensors MLX | 1,090 GB |
| google/embeddinggemma-2 (BF16 original) | 744.371.512 | 768 | no disponible | Apache-2.0 | safetensors (PyTorch) | ~1,49 GB (estimado) |
| Variante de 8 bits citada en la model card | 744.371.512 | 768 | no disponible | Apache-2.0 | no disponible | ~0,74 GB (estimado) |

No se han identificado en la información proporcionada otros modelos comparables de embeddings multimodales (texto, imagen, audio y vídeo simultáneamente) con datos verificables de parámetros, contexto y rendimiento, por lo que la comparativa se limita a las variantes de cuantización del mismo modelo base. Los tamaños estimados se derivan aritméticamente del número de parámetros y no están publicados por el autor.

## Limitaciones y advertencias
- Deriva de embeddings medible: la similitud coseno mínima frente a FP32 baja hasta 0,955 en audio y 0,972 en texto. El autor recomienda comparar contra BF16 u 8 bits sobre los propios datos de recuperación cuando la fidelidad del embedding sea crítica.
- Es una conversión de comunidad: cero descargas y cero valoraciones en el momento de la ficha, sin auditoría externa ni evaluación MTEB. Las comprobaciones publicadas son de humo, no de calidad de recuperación.
- Dependencia estricta de Apple Silicon y del ecosistema MLX; no hay ruta documentada para CUDA, vLLM, TGI, llama.cpp u Ollama en este repositorio.
- El preprocesado multimodal exige una build de Transformers que exponga `EmbeddingGemma2Processor`; la versión estándar de PyPI 5.18.0 no lo expone, según el propio autor.
- No se debe convertir a float16: los pesos y activaciones no cuantizados deben permanecer en BF16, lo que limita combinaciones de despliegue.
- Es obligatorio aplicar los prefijos de tarea de `config_sentence_transformers.json`; consulta y documento deben usar la misma dimensionalidad de embedding.
- El truncamiento Matryoshka a 128, 256 o 512 dimensiones reduce la información del vector y exige renormalizar; puede degradar la recuperación.
- No se documentan sesgos, composición del dataset ni evaluación por idioma del modelo base en la información proporcionada; cualquier riesgo de sesgo se hereda de google/embeddinggemma-2.
- No hay riesgo de alucinación en sentido generativo (no produce texto), pero sí de falsos positivos por similitud: embeddings con deriva de cuantización pueden ordenar mal documentos muy próximos entre sí.
- Licencia Apache-2.0, que permite uso comercial manteniendo la atribución a Google; la conversión preserva la licencia del modelo original.
- La longitud de contexto no está documentada, por lo que el troceado de documentos largos debe decidirse empíricamente.

## Enlaces
- Modelo en HuggingFace: https://huggingface.co/nativ-community/embeddinggemma-2-mxfp4
- Modelo base: https://huggingface.co/google/embeddinggemma-2
- Revisión del modelo base usada en la conversión: https://huggingface.co/google/embeddinggemma-2/tree/914f7f89142e33e77833254d9c9b90c3cef7303b
- Repositorio MLX-VLM: https://github.com/Blaizzy/mlx-vlm
- Revisión concreta de MLX-VLM usada: https://github.com/Blaizzy/mlx-vlm/tree/3d87e88402f307efbf68e568971aa887ee7d9ed0
- Búsqueda web: los resultados obtenidos corresponden a entidades sin relación con el modelo (servicios de idiomas, agencias de viaje, marcas de ropa y programas de nutrición bajo el nombre "Nativ"); no se han encontrado papers, blogs ni demos relevantes para esta conversión.
