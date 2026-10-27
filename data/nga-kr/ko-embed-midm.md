# NGA-KR/ko-embed-midm

## Resumen

NGA-KR/ko-embed-midm es un modelo de embeddings de texto para coreano (con soporte declarado de ingles) publicado por el usuario independiente NGA-KR. Se obtiene mediante un fine-tune completo del modelo generativo K-intelligence/Midm-2.0-Mini-Instruct, el Mi:dm 2.0 Mini de KT Corporation, al que se le ha eliminado la plantilla de chat y se ha convertido en un encoder de frases con pooling de ultimo token y normalizacion L2. El resultado es un modelo de 2.305.517.312 parametros que produce vectores de 1792 dimensiones.

El problema que resuelve es la recuperacion densa y la similitud semantica en coreano, un idioma con mucha menos oferta de embeddings de calidad que el ingles. Su resultado principal es una media de 70,00 en MTEB(kor, v2) sobre 20 tareas, con un 81,69 en STS y un 70,85 en Retrieval. Es relevante porque demuestra que un modelo base centrado en coreano puede convertirse en un embedder competitivo entrenando exclusivamente con datos publicos en ingles, sin usar ningun corpus coreano ni las particiones de test de los benchmarks.

El modelo se publica bajo licencia MIT (igual que el modelo base de KT), en formato safetensors y con soporte nativo para sentence-transformers >= 6.0 y Text Embeddings Inference. Es un lanzamiento muy reciente (creado el 27 de octubre de 2026) y sin traccion publica: cero descargas y cero likes en el momento de redactar esta ficha, por lo que debe evaluarse con cautela antes de llevarlo a produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama), adaptado a embeddings con pooling de ultimo token y normalizacion L2 |
| Parametros totales | 2.305.517.312 (2,3B) |
| Longitud de contexto | 512 tokens en inferencia (256 tokens durante el entrenamiento); el autor no declara una ventana de contexto mayor |
| Tipos de cuantizacion | No disponible: el repositorio solo contiene pesos safetensors; el autor no publica variantes GGUF, AWQ ni GPTQ |
| Idiomas soportados | Coreano (ko) e ingles (en) |
| Licencia | MIT (modelo base Midm-2.0-Mini-Instruct tambien MIT, Copyright (c) 2025 KT Corporation) |
| Formato de pesos | safetensors (repositorio de 4,6 GB, compatible con sentence-transformers y TEI) |
| Dimension del embedding | 1792 |
| Funcion de similitud | Producto escalar sobre vectores normalizados L2 (equivale a similitud coseno) |
| Prompt de consulta | `Instruct: Given a question, retrieve passages that answer the question` + `Query: ` (via `prompt_name="query"`) |
| Biblioteca minima | sentence-transformers >= 6.0 |

## Arquitectura y entrenamiento

La base es un transformer decoder-only de 2,3B parametros de la familia Llama (el tag del repositorio lo confirma), correspondiente al Mi:dm 2.0 Mini Instruct de KT. El autor elimina la plantilla de chat del modelo instructivo y anade una cabeza de embedding: se toma el ultimo token de la secuencia como representacion de la frase y se normaliza L2. Es, por tanto, un modelo denso de una sola pasada, sin mezcla de expertos ni componentes de atencion lineal. La dimension de salida es 1792.

El entrenamiento es un fine-tune completo (no LoRA) durante 1 epoca, con batch de 1024, learning rate 1e-5, schedule coseno, 5% de warmup y autocast en bf16. La funcion de perdida es CachedMultipleNegativesRankingLoss con negativos en batch mas un negativo duro, y temperatura de 0,02. La longitud maxima de secuencia en entrenamiento fue de 256 tokens. El corpus son 302.812 filas exclusivamente de datos publicos en ingles: 200.000 filas de recuperacion (MS MARCO, Natural Questions, HotpotQA, GooAQ), 100.000 tripletas de SNLI y MultiNLI (ancla, implicacion, contradiccion) y 2.812 pares del split de entrenamiento de STS Benchmark con puntuacion >= 4,0 sobre 5 en ambas direcciones. No se uso ningun conjunto coreano de entrenamiento ni ninguna particion de test de los benchmarks evaluados.

El detalle tecnico mas interesante es la estrategia de transferencia: todo el aprendizaje se hace sobre datos ingleses y la evaluacion es integramente en coreano, apoyandose en que el modelo base ya internalizo representaciones del coreano durante su preentrenamiento. El autor declara los datasets en los metadatos de MTEB como `training_datasets`, lo que otorga un 100% de zero-shot en MTEB(kor, v1) y v2. Conviene senalar que KorSTS y KorNLI son traducciones de STS-B y SNLI/MultiNLI, de modo que existe solapamiento semantico entre el material de entrenamiento y las tareas de evaluacion aunque no se compartan las particiones.

## Capacidades

- Generacion de embeddings de frases y parrafos de hasta 512 tokens, con vectores de 1792 dimensiones normalizados.
- Recuperacion densa asimetrica (pregunta -> pasaje) mediante el prompt de instruccion almacenado en la configuracion del modelo.
- Similitud semantica simetrica (STS) sin prompt, con un 81,69 de media en la categoria STS de MTEB(kor, v2).
- Clustering de textos (62,26) y clasificacion mediante embeddings con sonda lineal (62,73).
- Pair classification y deteccion de duplicados o pares equivalentes (69,62).
- Reranking de candidatos recuperados previamente (58,93), aunque es la categoria mas floja del modelo.
- Soporte nativo de `sentence-transformers` y de Hugging Face Text Embeddings Inference (tag `text-embeddings-inference` y `endpoints_compatible`).
- Capacidad multilingue limitada a coreano e ingles; no se declaran otros idiomas.
- No dispone de tool calling, agentes, vision, audio ni modo de razonamiento: es exclusivamente un modelo de representacion.

## Casos de uso

- RAG sobre documentacion juridica y administrativa coreana: el ejemplo de la model card recupera el articulo que fija en dos anos la duracion de un contrato de alquiler cuando no se ha estipulado plazo. La ventana de 512 tokens encaja con la indexacion por fragmentos de articulos y clausulas.
- Busqueda semantica en portales de soporte en coreano: indexar articulos de ayuda y preguntas frecuentes y usar `prompt_name="query"` en las consultas de usuario para recuperar el articulo relevante aunque no compartan lexico.
- Deduplicacion de corpus coreanos a gran escala: los 1792 dims y el buen rendimiento en clustering (62,26) permiten agrupar documentos casi identicos con umbrales de coseno antes de entrenar otros modelos.
- Clasificacion de tickets y resenas: extraer embeddings y entrenar una regresion logistica o un MLP ligero encima; evita desplegar un LLM generativo para una tarea de etiquetado cerrado.
- Deteccion de preguntas duplicadas en foros o mesas de ayuda: la categoria STS (81,69) es la mas solida del modelo, apropiada para decidir si dos formulaciones son equivalentes.
- Filtrado y reranking en pipelines de busqueda hibrida: usar el modelo como segunda etapa sobre los 50-100 candidatos devueltos por BM25, compensando el 58,93 de Reranking con un coste de inferencia bajo.
- Construccion de conjuntos de evaluacion coreanos: al ser zero-shot sobre MTEB(kor), sirve como referencia para medir si otros embedders han visto datos coreanos en su entrenamiento.

## Benchmarks y rendimiento

Resultados publicados por el autor en la model card. MTEB(kor, v2), 20 tareas, media de las medias por tipo de tarea:

| Benchmark | Media | Classification | Clustering | PairClassification | Reranking | Retrieval | STS |
|---|---|---|---|---|---|---|---|
| MTEB(kor, v2) | 70,00 | 62,73 | 62,26 | 69,62 | 58,93 | 70,85 | 81,69 |
| MTEB(kor, v1) | 70,03 | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

MTEB(kor, v1) cubre solo 6 tareas y el autor remite al leaderboard de MTEB para el desglose por tarea. No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks generativos, algo esperable al tratarse de un modelo de embeddings y no de generacion.

## Requisitos de hardware

- VRAM estimada: unos 4,6 GB solo para pesos en bf16/fp16, y aproximadamente 9,2 GB en fp32. Con activaciones y lote pequeno, un despliegue realista en bf16 se situa en el rango de 6-8 GB.
- Cabe en GPU de consumo: RTX 4090 (24 GB), RTX 4080/4070 Ti Super (16 GB), RTX 4060 Ti 16 GB, RTX 3090 (24 GB) e incluso tarjetas de 8 GB en bf16 con lotes reducidos.
- GPU de centro de datos recomendadas para alto throughput: L40S, A10G, L4 o A100/H100 si se necesita procesar corpus de millones de documentos con lotes grandes.
- Opciones de despliegue: sentence-transformers >= 6.0 (referencia), Hugging Face Text Embeddings Inference (soportado de forma explicita por los tags del repositorio), y servicios de inferencia compatibles con endpoints. No hay variantes GGUF publicadas, por lo que llama.cpp u Ollama requeririan conversion propia de los pesos y no estan validados por el autor.
- Latencia y throughput: no disponibles. El autor no publica mediciones y el modelo no tiene descargas registradas que permitan extrapolar.

## Comparativa con modelos similares

Los datos de rendimiento de las alternativas no estan en la informacion proporcionada; las especificaciones de bge-m3 y multilingual-e5-large proceden del conocimiento publico de esos modelos, no de la busqueda realizada, y deben verificarse antes de usarse en una decision.

| Modelo | Parametros | Dimension | Contexto | Idiomas | Licencia | MTEB(kor) |
|---|---|---|---|---|---|---|
| NGA-KR/ko-embed-midm | 2,3B | 1792 | 512 | ko, en | MIT | 70,00 (v2, 20 tareas) |
| NGA-KR/ko-embed-v0 | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |
| BAAI/bge-m3 | 568M | 1024 | 8192 | multilingue (incluye ko) | MIT | no disponible en esta busqueda |
| intfloat/multilingual-e5-large | 560M | 1024 | 512 | multilingue (incluye ko) | MIT | no disponible en esta busqueda |

La diferencia de planteamiento es clara: este modelo apuesta por un backbone grande (2,3B) con contexto corto, mientras que las alternativas multilingues son 4 veces mas pequenas y, en el caso de bge-m3, con contexto 16 veces mayor. Para corpus con documentos largos, 512 tokens puede ser el factor limitante; para fragmentos cortos, el mayor numero de parametros puede compensar.

## Limitaciones y advertencias

- Ventana de 512 tokens en inferencia: los documentos mas largos deben trocearse, lo que fragmenta el contexto y puede degradar la recuperacion de pasajes que dependen de informacion distribuida.
- Entrenamiento exclusivamente en ingles: el rendimiento en coreano depende por completo de las representaciones heredadas del modelo base. No se ha validado en dominios especializados (medico, legal, financiero) ni en jerga o coreano coloquial.
- Rendimiento desigual por tarea: Reranking (58,93) y Clustering (62,26) estan muy por debajo de STS (81,69). No es un buen reranker de proposito general.
- Solapamiento potencial en la evaluacion: KorSTS y KorNLI son traducciones de STS-B y SNLI/MultiNLI, y el modelo uso los splits de entrenamiento ingleses de esas mismas fuentes. La etiqueta de zero-shot es formalmente correcta, pero la proximidad semantica entre entrenamiento y evaluacion debe tenerse en cuenta al interpretar el 81,69 en STS.
- Requiere prompt asimetrico: omitir `prompt_name="query"` en las consultas de recuperacion degrada los resultados sin aviso; es un error facil de cometer en integraciones.
- Modelo sin traccion ni validacion externa: cero descargas y cero likes, creado en octubre de 2026. No hay informes de terceros, ni issues, ni evidencia de uso en produccion.
- Necesita sentence-transformers >= 6.0; versiones anteriores pueden fallar al cargar la configuracion con prompts.
- Licencia MIT permite uso comercial y modificacion siempre que se conserve el aviso de copyright de KT Corporation que acompana al modelo base; conviene revisar el fichero LICENSE del repositorio.
- No hay variantes cuantizadas oficiales ni pesos GGUF: el despliegue en CPU o en hardware limitado exige conversion propia.
- Al ser un modelo de embeddings, el riesgo de alucinacion se traslada al sistema que lo usa: una recuperacion incorrecta puede hacer que el LLM de la etapa generativa produzca respuestas sin respaldo.
- Sesgos no evaluados: el autor no publica analisis de sesgo de genero, edad ni dialectos del coreano.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/NGA-KR/ko-embed-midm
- Modelo base (K-intelligence/Midm-2.0-Mini-Instruct): https://huggingface.co/K-intelligence/Midm-2.0-Mini-Instruct
- Repositorio oficial de Mi:dm 2.0 en GitHub: https://github.com/K-intelligence-Midm/Midm-2.0
- Version alternativa de Mi:dm 2.0 Base Instruct (OpenLLM-Korea): https://huggingface.co/OpenLLM-Korea/Midm-2.0-Base-Instruct
- Ficha de Mi:dm 2.0 Base Instruct en Korea AI Map: https://korea-ai-map.github.io/models/midm-2-0-base/
- Version anterior del mismo autor (NGA-KR/ko-embed-v0): https://huggingface.co/NGA-KR/ko-embed-v0
- Leaderboard de MTEB (resultados por tarea): https://huggingface.co/spaces/mteb/leaderboard
