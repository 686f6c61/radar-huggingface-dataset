# bigdawg003/pplx-embed-v2-late-0.6b-GGUF

## Resumen

Este repositorio contiene la conversión a GGUF en cuantización Q8_0 del modelo de embeddings `perplexity-ai/pplx-embed-v2-late-0.6b`, realizada por el usuario bigdawg003 para la aplicación de búsqueda de escritorio LocalLens. Es un modelo de recuperación de información basado en interacción tardía (late interaction) de estilo ColBERT, con representación multi-vector: no devuelve un único vector por documento, sino un vector de 128 dimensiones por cada token. Además es multimodal, ya que incluye un codificador de visión en un archivo `mmproj` independiente.

Con 493.859.776 parámetros (aproximadamente 0,6B), está diseñado para búsqueda semántica local de texto e imágenes. Utiliza tokens de prefijo específicos (`[Q]` para consultas, `[D]` para documentos e imágenes) y puntuación mediante MaxSim con normalización L2 por token. La conversión funciona sobre llama.cpp mainline (build b11554) sin necesidad de parches.

Su relevancia actual reside en que permite desplegar recuperación multimodal multi-vector en hardware modesto, incluso en CPU, con una pérdida de precisión despreciable frente al modelo original en float32. El repositorio no está afiliado a Perplexity AI, aunque deriva de su modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con cabecera multi-vector de interaccion tardia (late interaction, estilo ColBERT) y codificador de vision asociado |
| Parametros totales | 493.859.776 (modelo base en safetensors) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 8192 tokens en el ejemplo de uso del autor (`-c 8192`); maximo oficial no disponible |
| Tipos de cuantizacion | Q8_0 (8 bits) |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (`pplx-late-Q8_0.gguf` y `pplx-late-mmproj-Q8_0.gguf`) |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna del modelo base mas alla de sus etiquetas: late-interaction, ColBERT, multi-vector y multimodal. Se trata, por tanto, de un modelo de embeddings con recuperacion por interaccion tardia: cada token genera un vector de 128 dimensiones y la similitud entre consulta y documento se calcula con MaxSim (suma, sobre los tokens de consulta, del maximo producto escalar contra los tokens del documento). El componente de texto y la proyeccion de 1024 a 128 dimensiones se empaquetan en `pplx-late-Q8_0.gguf`, mientras que el codificador de vision se distribuye por separado en `pplx-late-mmproj-Q8_0.gguf`.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni sobre si se aplicaron tecnicas de alineacion como RLHF o DPO. Este repositorio concreto es unicamente una conversion de cuantizacion: se genero con un pequeno shim sobre el conversor de llama.cpp (tag b11554) y se cuantizo con `llama-quantize Q8_0`. Como innovacion tecnica destacable del formato, el modelo requiere gestionar tokens especiales y un skiplist de puntuacion (`MultiVectorMask`) para replicar el comportamiento de referencia.

## Capacidades

- Extraccion de embeddings de texto con representacion multi-vector: un vector de 128 dimensiones por token.
- Extraccion de embeddings de imagenes mediante el codificador de vision (`pplx-late-mmproj-Q8_0.gguf`).
- Busqueda multimodal texto-imagen e imagen-texto con puntuacion MaxSim.
- Recuperacion semantica (retrieval) para RAG y motores de busqueda.
- Uso de tokens de prefijo: `[Q] ` (id 248077) para consultas y `[D] ` (id 248078) para documentos e imagenes.
- Filtrado de tokens de puntuacion mediante skiplist para replicar la referencia (ids 0-14, 25-31, 58-63, 90-93).
- No es un modelo generativo: no produce texto, razonamiento, codigo ni soporta tool calling o agentes.
- Multilingue: no disponible (no se especifican idiomas soportados).
- Modo thinking, audio u otras capacidades especiales: no disponibles.

## Casos de uso

- Busqueda semantica de escritorio: integrado en LocalLens para indexar y recuperar documentos locales de texto mediante vectores por token y MaxSim, aprovechando que el modelo Q8_0 cabe en memoria y puede ejecutarse en CPU.
- Recuperacion aumentada (RAG) sobre corpus propios: generar embeddings multi-vector de los documentos para alimentar un recuperador de estilo ColBERT, con mayor granularidad que los embeddings de un unico vector.
- Busqueda multimodal imagen-texto: indexar capturas, PDF con figuras o imagenes y recuperarlas mediante consultas en lenguaje natural, usando el codificador de vision y los tokens `[D]`.
- Respuesta a preguntas sobre documentos visuales (DocVQA): recuperar la pagina o figura relevante antes de pasarla a un modelo generativo, con resultados medidos de nDCG@5 = 0,556 en ViDoRe DocVQA.
- Busqueda cientifica y tecnica: recuperacion sobre articulos academicos (ArxivQA, SciFact) para asistentes de literatura o revisiones bibliograficas.
- Deteccion de duplicados y similitud: comparar documentos a nivel de token para tareas de deduplicacion o agrupacion semantica.
- Filtrado y re-ranking en pipelines de busqueda existentes: usar el modelo como re-ranker multi-vector sobre un primer recuperador lexical o denso.

## Benchmarks y rendimiento

Resultados medidos por el autor comparando Q8_0 frente al modelo original en precision completa:

| Benchmark | Metrica | Q8_0 | Precision completa |
|---|---|---|---|
| ViDoRe DocVQA | nDCG@5 | 0,556 | 0,557 |
| ArxivQA | no especificada | 0,815 | 0,814 |
| BEIR SciFact | nDCG@10 | 0,779 | 0,780 |

Verificacion de fidelidad frente al modelo oficial de Sentence Transformers (float32):

| Aspecto | Resultado |
|---|---|
| Vectores por token (texto) | coseno >= 0,9997 |
| Vectores por token (imagenes) | coseno medio 0,9999 |
| Puntuaciones MaxSim | dentro del 0,2 % |
| Rankings | identicos |
| GGUF float32 en rutas CPU de llama.cpp (x86-64, SSE4.2, AVX, AVX2), hasta 4000 tokens | coseno >= 0,9999998 |

No se han publicado otros resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 0,65 GB solo para los pesos Q8_0 (536 MB el modelo de texto + 116 MB el codificador de vision); con cache KV y activaciones, en torno a 1-2 GB segun contexto y lote.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4090, etc.) es sobradamente suficiente; tambien cabe en GPUs integradas y en CPU.
- Inferencia en CPU: soportada y verificada en rutas x86-64 con SSE4.2, AVX y AVX2 hasta 4000 tokens.
- Opciones de despliegue: llama.cpp mainline (build b11554) mediante `llama-server`; tambien integrable en la aplicacion LocalLens.
- Comando de referencia del autor: `llama-server -m pplx-late-Q8_0.gguf --mmproj pplx-late-mmproj-Q8_0.gguf --embeddings --pooling none -c 8192 -b 2048 -ub 2048`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Licencia | Notas |
|---|---|---|---|---|
| bigdawg003/pplx-embed-v2-late-0.6b-GGUF (este) | 493,9M | GGUF Q8_0 | MIT | Conversion para llama.cpp; coseno >= 0,9997 frente al original |
| perplexity-ai/pplx-embed-v2-late-0.6b (original) | 493,9M | safetensors (float32) | MIT | Modelo de referencia, requiere Sentence Transformers |
| Otros modelos de interaccion tardia (ColBERTv2, etc.) | No disponible | No disponible | No disponible | Sin datos comparativos en la informacion proporcionada |

No se dispone de datos de parametros, contexto o rendimiento de alternativas de la misma categoria en la informacion facilitada.

## Limitaciones y advertencias

- No es un modelo generativo: solo produce embeddings; no genera texto, codigo ni razonamiento.
- Riesgo de alucinacion no aplica directamente, pero la recuperacion puede devolver pasajes irrelevantes si el corpus o los prefijos no se usan correctamente.
- Requiere seguir estrictamente el protocolo de uso: prefijos `[Q] `/`[D]`, skiplist de puntuacion, normalizacion L2 por token y MaxSim. Omitir estos pasos degrada la fidelidad.
- Las imagenes deben redimensionarse manualmente a multiplos de 32 px (lado largo <= 1024 px) para replicar el procesador de referencia.
- Idiomas soportados no especificados: no hay garantia de rendimiento multilingue.
- Longitud de contexto maxima oficial no documentada; el ejemplo usa 8192 tokens.
- Licencia MIT, que permite uso comercial, pero el modelo original esta atribuido a Perplexity AI y este repositorio no esta afiliado a dicha empresa.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; es una conversion de terceros, no una publicacion oficial.
- No hay informacion sobre sesgos conocidos del modelo base.

## Enlaces

- Repositorio GGUF: https://huggingface.co/bigdawg003/pplx-embed-v2-late-0.6b-GGUF
- Modelo base: https://huggingface.co/perplexity-ai/pplx-embed-v2-late-0.6b
- Revision del modelo base citada: 8fc2de24534aa3610d85fa59c463313a5f096455
- Scripts y resultados de verificacion: `tools/llamacpp/` y `bench/results/llamacpp/` en el repositorio LocalLens, documentados en `docs/LLAMACPP.md`
- Papers, blogs y demos adicionales: no disponibles
