# mradermacher/vdr-2b-v1-GGUF

## Resumen

vdr-2b-v1-GGUF es la versión cuantizada en formato GGUF del modelo llamaindex/vdr-2b-v1, un modelo de representaciones vectoriales densas (VDR, Visual Document Retrieval) construido sobre la arquitectura Qwen2-VL y publicado bajo licencia Apache 2.0. Lo desarrolla LlamaIndex y lo cuantiza mradermacher, un autor habitual en la comunidad de cuantizaciones GGUF. El modelo resuelve el problema de la recuperación de documentos visuales: en lugar de depender de OCR y extracción de texto, genera embeddings directamente a partir de imágenes de páginas de documentos, lo que permite indexar y buscar en corpus con tablas, gráficos, diagramas y maquetación compleja.

Con aproximadamente 1.540 millones de parámetros (1.543.714.304 según los safetensors del modelo base), es un modelo compacto pensado para desplegarse en infraestructura modesta, incluso en GPU de consumo. Esta versión GGUF permite ejecutarlo con llama.cpp, Ollama y otros runtimes compatibles, reduciendo la huella de memoria desde los 3,2 GB del formato f16 hasta los 0,8 GB de la cuantización Q2_K.

Es relevante ahora porque el paradigma de RAG multimodal está desplazando a los pipelines clásicos de OCR más chunking de texto: un modelo de 2B que produce embeddings visuales de calidad competitiva abarata y simplifica la indexación de documentos escaneados, PDFs maquetados y capturas. La versión cuantizada facilita su integración en entornos de producción sin GPU de datacenter.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer basado en Qwen2-VL (modelo de embeddings visuales y de texto) |
| Parámetros totales | 1.543.714.304 (aprox. 1,54B) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16, mmproj-fp16 |
| Idiomas soportados | en (inglés; el dataset de entrenamiento se llama vdr-multilingual-train, pero la model card declara solo en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo base llamaindex/vdr-2b-v1 se construye sobre Qwen2-VL, un transformer con encoder visual y decoder lingüístico, adaptado como modelo de representaciones vectoriales (sentence-transformers). En lugar de generar texto, produce un embedding denso a partir de una página de documento renderizada como imagen o de una consulta textual, de modo que la similitud coseno entre ambos vectores permite recuperar la página relevante. Esta aproximación evita el pipeline OCR y preserva información de layout, tablas y figuras que la extracción de texto pierde.

El entrenamiento se realizó sobre el dataset llamaindex/vdr-multilingual-train, orientado a recuperación visual de documentos. No se dispone en la información proporcionada de detalles sobre el número de tokens, la composición exacta del dataset ni si se aplicaron fases de RLHF o DPO; estos datos no están disponibles. La model card del repositorio GGUF es una ficha de cuantización generada por mradermacher y no incluye información arquitectónica adicional más allá de la referencia al modelo base y a Qwen2-VL.

## Capacidades

- Generación de embeddings densos para recuperación de información (retrieval), tanto de texto como de imágenes de documentos.
- Procesamiento multimodal: acepta páginas de documento renderizadas como imagen gracias al componente Qwen2-VL.
- Recuperación visual de documentos (VDR): indexación y búsqueda en PDFs, escaneos, facturas, informes y material maquetado.
- Soporte de búsqueda semántica multilingüe potencial, dado el nombre del dataset de entrenamiento, aunque la model card solo declara inglés.
- Integración con sentence-transformers y con el ecosistema de LlamaIndex para pipelines RAG.
- Compatibilidad con endpoints (tag endpoints_compatible) y con runtimes GGUF como llama.cpp.
- No es un modelo generativo conversacional: no produce respuestas de texto libre ni soporta tool calling ni razonamiento multi-paso.

## Casos de uso

- Indexación de PDFs escaneados sin OCR: se renderiza cada página como imagen, el modelo genera su embedding y se almacena en una base vectorial; las consultas textuales recuperan las páginas relevantes preservando tablas y figuras que el OCR destruiría.
- Búsqueda en facturas y albaranes: las páginas con maquetación tabular se indexan directamente como imagen, permitiendo recuperar el documento correcto a partir de una consulta en lenguaje natural sobre proveedor, importe o fecha.
- RAG sobre documentación técnica con diagramas: en manuales de ingeniería donde los esquemas son críticos, el embedding visual captura la información gráfica que un chunk de texto perdería, mejorando la recuperación de la página correcta.
- Atención al cliente sobre base documental: se indexan políticas, contratos y guías en PDF y el sistema recupera el fragmento visual pertinente antes de pasarlo a un LLM generador, reduciendo errores de extracción.
- Archivística y gestión documental: clasificación y búsqueda semántica en fondos escaneados históricos o administrativos donde no existe texto digital nativo.
- Despliegue en edge o en portátil: con la cuantización Q4_K_M (1,1 GB) el modelo cabe en GPU de consumo y permite construir un índice vectorial local sin enviar documentos sensibles a la nube.
- Evaluación de similitud entre páginas: detección de duplicados o near-duplicates en corpus documentales comparando embeddings de página completa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: entre 0,8 GB (Q2_K) y 3,2 GB (f16) solo para los pesos; añadir overhead de contexto y del proyector multimodal (mmproj-fp16, 1,4 GB) si se procesan imágenes.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM para cuantizaciones Q4/Q5 con margen; RTX 3060, RTX 4060, RTX 4090, A100 o H100 son válidas, aunque para un modelo de 1,5B las consumer son suficientes.
- Cabe en GPU de consumo: sí, en la mayoría de tarjetas con 6 GB o más usando Q4_K_M o Q5_K_M; en Q2_K o Q3_K_S podría ejecutarse incluso en iGPU o CPU con suficiente RAM.
- Opciones de despliegue: llama.cpp, Ollama, y runtimes compatibles con GGUF; el modelo base puede servirse con vLLM o TGI en formato safetensors si se prefiere.
- Latencia y throughput: no disponibles en la información proporcionada; al tratarse de un modelo de 1,5B, se espera baja latencia en GPU consumer, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidad | Licencia | Formato |
|---|---|---|---|---|---|
| vdr-2b-v1 (este, GGUF) | ~1,54B | no disponible | Visual + texto (embeddings) | Apache 2.0 | GGUF, safetensors |
| ColPali (vidore) | ~2-3B (basado en PaliGemma) | no disponible | Visual + texto (embeddings) | depende de la variante | safetensors |
| ColQwen2 (vidore) | ~2B (basado en Qwen2-VL) | no disponible | Visual + texto (embeddings) | Apache 2.0 | safetensors |
| BGE-M3 | ~0,57B | 8.192 tokens | Texto (embeddings) | MIT | safetensors, GGUF |

La comparación con ColPali y ColQwen2 es la más directa por tratarse de modelos de recuperación visual de documentos; BGE-M3 se incluye como referencia de embedding puramente textual de tamaño menor. No se dispone de cifras de rendimiento comparadas en la información proporcionada, por lo que la comparativa se limita a parámetros, modalidad y licencia.

## Limitaciones y advertencias

- Modelo de embeddings, no generativo: no debe usarse para responder preguntas ni generar texto; su salida es un vector.
- Idiomas: la model card declara únicamente inglés, pese al nombre del dataset de entrenamiento (vdr-multilingual-train); el rendimiento en castellano no está verificado.
- Sesgos: al derivar de Qwen2-VL y entrenarse sobre un corpus concreto, puede heredar sesgos de representación en documentos de determinadas regiones, idiomas o formatos.
- Alucinación: no aplica en el sentido generativo, pero sí existe riesgo de recuperaciones irrelevantes si el corpus visual difiere del dominio de entrenamiento.
- Contexto: no se especifica la longitud máxima de secuencia ni el número máximo de tokens visuales por página, lo que dificulta planificar el troceado de documentos de alta resolución.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las condiciones del modelo base Qwen2-VL y del dataset de entrenamiento por si imponen restricciones adicionales.
- La cuantización Q2_K y Q3_K_M degradan la calidad; para producción se recomienda Q4_K_M o superior.
- El repositorio GGUF es una conversión de terceros: no hay garantía de paridad exacta con el modelo base en todos los casos.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/vdr-2b-v1-GGUF
- Modelo base: https://huggingface.co/llamaindex/vdr-2b-v1
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/vdr-2b-v1-i1-GGUF
- Página de descargas del cuantizador: https://hf.tst.eu/model#vdr-2b-v1-GGUF
- Dataset de entrenamiento: https://huggingface.co/datasets/llamaindex/vdr-multilingual-train
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
