# perplexity-ai/pplx-embed-v2-context-9b-preview

## Resumen

`pplx-embed-v2-context-9b-preview` es un modelo de embeddings contextuales desarrollado por Perplexity AI para su uso en sistemas RAG (retrieval-augmented generation). A diferencia de los modelos de embeddings convencionales, que codifican cada fragmento de texto de forma aislada, este modelo recibe un documento completo como una lista de chunks y los codifica conjuntamente, de modo que el embedding de cada chunk incorpora informacion de su contexto circundante. Devuelve un vector de 2048 dimensiones por chunk.

El modelo se construye sobre una arquitectura transformer basada en Qwen3.5 (identificador `pplx_contextual_qwen3_5` en los tags) con 8.401.083.632 parametros totales, lo que lo situa en la categoria de modelos de embedding de gran tamano. Incorpora soporte nativo de cuantizacion INT8 en la salida, dimensiones Matryoshka (MRL) a 1024 y 2048, y pooling por media. La licencia es MIT, lo que facilita su uso comercial.

Es relevante ahora porque aborda una limitacion clasica de los pipelines RAG: la perdida de contexto al fragmentar documentos. Al codificar los chunks en conjunto, mejora la calidad del retrieval en escenarios donde el significado de un fragmento depende del texto que lo rodea. Se trata, no obstante, de una version preview: los pesos, los embeddings y la interfaz pueden cambiar sin compatibilidad hacia atras.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer basada en Qwen3.5 (`pplx_contextual_qwen3_5`), codificacion contextual de chunks |
| Parametros totales | 8.401.083.632 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Salida nativa INT8 (embeddings sin normalizar); MRL a 1024 y 2048 dimensiones |
| Idiomas soportados | Multilingue |
| Licencia | MIT |
| Formato de pesos | safetensors (libreria transformers, requiere `trust_remote_code=True`) |
| Dimensiones de embedding | 2048 (MRL: 1024, 2048) |
| Pooling | Mean |
| Prefijos | Prefijos fijos separados para query y documento (sin instrucciones) |
| Tamano del repo | 67,2 GB |

## Arquitectura y entrenamiento

El modelo es un transformer encoder derivado de la familia Qwen3.5, adaptado para la tarea de codificacion contextual de documentos. La innovacion principal reside en el esquema de entrada: un documento se pasa como una lista de chunks que se codifican de forma conjunta, y el modelo devuelve una matriz de forma `(chunk_count, 2048)` por documento. Cada embedding refleja, por tanto, el contenido del chunk y su posicion dentro del documento. El pooling es por media y la salida se genera de forma nativa en INT8 sin normalizar.

El entrenamiento emplea prefijos fijos y distintos para queries y documentos, lo que obliga a usar metodos de codificacion separados (`encode_queries` para consultas y `encode` para chunks de documento). Se aplicaron perdidas Matryoshka (MRL) exclusivamente a 1024 y 2048 dimensiones; otras longitudes de truncamiento no fueron entrenadas. No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO. La model card cita un articulo de Perplexity titulado "Contextual embedding beyond the gold passage" como referencia tecnica.

## Capacidades

- Generacion de embeddings contextuales para chunks de documentos en pipelines RAG.
- Codificacion conjunta de multiples chunks de un mismo documento, con un vector por chunk que incorpora el contexto circundante.
- Recuperacion de informacion multilingue.
- Similitud semantica entre frases y documentos (`sentence-similarity`).
- Salida nativa en INT8 sin normalizar, compatible con similitud coseno o producto escalar tras normalizacion.
- Dimensiones Matryoshka a 1024 y 2048 para ajustar el coste de almacenamiento y busqueda.
- API separada para queries (`encode_queries`) y documentos (`encode`), con prefijos fijos entrenados.
- No se documentan capacidades de tool calling, agentes, vision, audio ni modo de razonamiento; el modelo es exclusivamente de extraccion de caracteristicas.

## Casos de uso

- Recuperacion en RAG sobre documentos largos: el modelo codifica cada chunk junto con sus vecinos, de modo que fragmentos ambiguos por si solos (por ejemplo, "esto supuso un aumento del 30 %") se recuperan correctamente al incorporar el contexto del documento.
- Busqueda semantica en bases de conocimiento multilingues: la cobertura multilingue permite indexar documentacion en varios idiomas y consultar en cualquiera de ellos con similitud coseno sobre embeddings de 2048 dimensiones.
- Indexacion de documentacion tecnica y manuales: la codificacion contextual mejora el retrieval en secciones donde las referencias internas ("como se describio en la seccion anterior") dependen del texto previo.
- Sistemas de preguntas y respuestas sobre corpus legales o financieros: la separacion estricta entre `encode_queries` y `encode` permite construir un pipeline de dos fases con prefijos entrenados especificamente para cada rol.
- Deduplicacion y agrupacion de fragmentos: la similitud coseno entre embeddings contextuales permite detectar contenido repetido o solapado entre documentos de un mismo corpus.
- Despliegue con almacenamiento reducido: usando la variante MRL de 1024 dimensiones se reduce a la mitad el espacio de almacenamiento del indice vectorial, con la normalizacion aplicada tras el truncamiento.
- Clasificacion y filtrado previo de candidatos en pipelines de retrieval de dos etapas: el modelo puede actuar como retriever denso antes de un reranker.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 16,8 GB solo para pesos (8,4 mil millones de parametros), mas overhead de activaciones y del contexto de codificacion; se recomienda reservar al menos 24 GB.
- GPU recomendadas: A100 (40/80 GB), H100, L40S o A6000 para produccion; una RTX 4090 (24 GB) puede ser suficiente en BF16 con lotes pequenos, aunque el margen es ajustado.
- En consumer GPU de 16 GB o menos no cabe en BF16; seria necesario cuantizar los pesos, opcion no documentada en la model card.
- Opciones de despliegue: transformers (>= 5.4.0) con `trust_remote_code=True`, que es el unico metodo documentado. No se confirma soporte de vLLM, llama.cpp, Ollama ni TGI.
- El tamano del repo (67,2 GB) sugiere que se distribuyen multiples formatos de pesos ademas de safetensors.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Dimensiones | Contexto de codificacion | Licencia | Codificacion contextual |
|---|---|---|---|---|---|
| pplx-embed-v2-context-9b-preview | 8,4 B | 2048 (MRL 1024) | Por documento (lista de chunks) | MIT | Si |
| pplx-embed-context-v1 | no disponible | no disponible | Por documento | no disponible | Si |
| Modelos de embedding convencionales (p. ej. familia BGE/E5 de ~7-8 B) | ~7-8 B | variable | Por chunk aislado | variable | No |

La comparativa se limita a lo indicado en la informacion disponible; no se dispone de datos de rendimiento comparado con alternativas concretas.

## Limitaciones y advertencias

- Version preview: los pesos, los embeddings y la interfaz pueden cambiar en versiones posteriores sin compatibilidad hacia atras. Los embeddings generados con esta preview no deben mezclarse con los de una version futura.
- Uso incorrecto de la API: codificar queries con `encode` en lugar de `encode_queries` degrada silenciosamente la calidad del retrieval, ya que el modelo fue entrenado con prefijos separados.
- Los embeddings se generan sin normalizar en INT8; deben compararse con similitud coseno o normalizarse antes de usar producto escalar.
- Solo se entrenaron las dimensiones Matryoshka 1024 y 2048; truncar a otras longitudes no esta soportado.
- No se documentan sesgos conocidos, riesgo de alucinacion (el modelo no genera texto) ni limitaciones especificas de idioma mas alla de la etiqueta "multilingual".
- La longitud maxima de contexto no esta disponible, lo que impide planificar el tamano maximo de documento o de lista de chunks.
- Requiere `transformers>=5.4.0` y `trust_remote_code=True`, lo que implica ejecutar codigo personalizado del autor.
- Licencia MIT: permite uso comercial, pero al ser una preview conviene evaluar la estabilidad de la interfaz antes de integrarla en produccion.

## Enlaces

- Hugging Face: https://huggingface.co/perplexity-ai/pplx-embed-v2-context-9b-preview
- Blog tecnico de Perplexity: https://www.perplexity.ai/hub/blog/contextual-embedding-beyond-the-gold-passage
