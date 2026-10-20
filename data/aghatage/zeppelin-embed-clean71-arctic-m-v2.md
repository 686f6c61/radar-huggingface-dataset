# aghatage/zeppelin-embed-clean71-arctic-m-v2

## Resumen

zeppelin-embed clean71-v1 + Arctic m-v2 es un par de torres de embeddings de texto asimétrico empaquetado como bundle de ejecución para [zeppelin-embed](https://github.com/zepdb/zeppelin-embed), un motor de búsqueda vectorial e híbrida embebido. Lo publica el usuario `aghatage` en HuggingFace bajo licencia Apache 2.0 y no es un checkpoint al uso: no se carga con `transformers` ni con `sentence-transformers`, sino con la librería `zeppelin-embed`, que descarga los ficheros declarados en un manifiesto, verifica su tamano y SHA-256 y los cachea.

La asimetría es la clave del diseno. Los documentos se codifican con el modelo original Snowflake Arctic-embed-m-v2.0 (305.368.320 parámetros, hasta 8.192 tokens de entrada), mientras que las consultas se codifican con clean71-v1, una torre de query destilada de 71.201.280 parámetros (6 capas, anchura 512, FFN 1.536, vocabulario de 98.304 tokens, pooling CLS y proyección aprendida de 512 a 768) limitada a 96 tokens y con el prefijo `query: `. Ambas torres producen vectores de 768 dimensiones normalizados L2, de modo que la puntuación es un producto escalar equivalente a similitud coseno.

La relevancia práctica está en la latencia y el consumo: la torre de query se ejecuta en el Neural Engine vía CoreML con pesos INT8 (solo pesos, por canal, simétrico; activaciones y salida en FP16), con una latencia p50 de 1-2 ms por consulta a batch 1, tokenización incluida, en un Apple M3 Max. El bundle ocupa 832.765.584 bytes, un 49,7 % menos que la release FP32, y la pérdida de calidad medida respecto a la referencia FP32 es como máximo del 0,16 % en nDCG@10. La contrapartida es una plataforma soportada muy concreta: macOS sobre Apple Silicon exclusivamente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Par asimétrico de dos torres (dual encoder) tipo transformer; torre de query destilada de 6 capas y torre de documento Arctic-embed-m-v2.0 |
| Parametros totales | 376.569.600 (71.201.280 de query + 305.368.320 de documento) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 96 tokens en la torre de query (incluye prefijo y tokens especiales); 8.192 tokens en la torre de documento |
| Tipos de cuantizacion | CoreML INT8 solo pesos, por canal, simetrica (torre de query, primaria); FP16 MLX (torre de documento y fallback de query) |
| Idiomas soportados | en, es, fr, de, pt, it, ru, zh, ja, ko, hi, ar, id, vi (14 idiomas objetivo) |
| Licencia | Apache 2.0 |
| Formato de pesos | `.zem` (bundle binario con torre de documento FP16 MLX, fallback de query FP16 MLX y ambos tokenizers), `.mlmodelc` compilado (CoreML INT8), manifiesto `zeppelin-model.json` y `SHA256SUMS`; no hay safetensors ni GGUF |
| Dimension de salida | 768, normalizada L2 |
| Funcion de similitud | producto escalar (= coseno) |
| Pooling | CLS en la torre de query |
| Torre de documento | Snowflake/snowflake-arctic-embed-m-v2.0 en la revision `95c2741480856aa9666782eb4afe11959938017f`, sin prefijo |
| Torre de query | clean71-v1, prefijo `query: `, inicializada desde los pesos publicados de Arctic |
| Plataforma soportada | macOS sobre Apple Silicon exclusivamente (CoreML/ANE para queries, MLX/GPU para documentos) |

## Arquitectura y entrenamiento

El sistema es un dual encoder asimétrico: no se usa el mismo modelo para indexar y para consultar. La torre de documento es Arctic-embed-m-v2.0 sin modificar, con capacidad de 8.192 tokens, lo que permite indexar fragmentos largos sin trocear en exceso. La torre de query, clean71-v1, es un transformer pequeno de 6 capas, anchura 512, FFN de 1.536 y vocabulario de 98.304 tokens, con pooling CLS y una proyección aprendida de 512 a 768 dimensiones para alinear su espacio con el de la torre de documento. Se inicializó a partir de los pesos publicados de Arctic y se destiló para sustituir a la torre de query anterior ("Original S2B"), más grande, reduciendo el número de parámetros de consulta un 69 %.

No se detalla en la información disponible el volumen de tokens de entrenamiento, la composición exacta del corpus de destilación ni si se aplicaron fases de RLHF o DPO (no procede en un modelo de embeddings, pero no se explicita el objetivo de entrenamiento más allá de la destilación). Sí se documenta la innovación de despliegue: cuantización INT8 solo de pesos con granularidad por canal y simétrica para la torre de query, con 230 operaciones asignadas al Neural Engine y 12 a CPU, y ejecución del documento mediante MLX en FP16 sobre la GPU. La precisión de la release se midió contra una referencia FP32 con torre de query CoreML FP16, con una desviación máxima de 0,16 % en nDCG@10.

## Capacidades

- Generación de embeddings de texto para similitud semántica y recuperación de información (pipeline `sentence-similarity` y `feature-extraction`).
- Recuperación asimétrica: consultas cortas (hasta 96 tokens) contra documentos largos (hasta 8.192 tokens).
- Búsqueda densa y búsqueda híbrida (densa + léxica) dentro del motor zeppelin-embed.
- Cobertura multilingüe en 14 idiomas objetivo, con evaluación específica en MIRACL (10 idiomas) y Belebele (14 idiomas).
- Indexación de documentos largos sin truncado agresivo gracias a la ventana de 8.192 tokens de la torre de documento.
- Ejecución en el Neural Engine de Apple Silicon para la fase de consulta, con fallback MLX FP16.
- Verificación de integridad del bundle mediante manifiesto con tamano y SHA-256 por fichero.
- No soporta tool calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking: no es un modelo generativo.

## Casos de uso

- Búsqueda semántica local en aplicaciones macOS: una app de escritorio puede embeber el corpus con la torre de documento (8.192 tokens por fragmento) y responder consultas en 1-2 ms p50 en el Neural Engine, sin salir del dispositivo ni depender de red.
- RAG completamente offline sobre documentación técnica: los fragmentos largos de manuales o referencias de API caben en la ventana de 8.192 tokens, y la consulta del usuario se resuelve con la torre pequena, lo que reduce el coste por pregunta en un asistente integrado en el portátil.
- Búsqueda híbrida en bases de conocimiento internas: zeppelin-embed combina la pierna densa con coincidencia léxica; en las pruebas del autor la pierna híbrida mantiene el nDCG@10 dentro de ±0,065 % respecto a FP32, adecuado para intranets con jerga propia.
- Atención al cliente con recuperación de artículos: consultas cortas de usuarios contra un corpus de artículos y FAQs; el limite de 96 tokens de query encaja con preguntas típicas de soporte y la latencia de milisegundos permite recuperar en el mismo turno conversacional.
- Comercio electrónico multilingüe en el mercado hispanohablante y europeo: el modelo cubre es, fr, de, pt, it además de en, de modo que un catálogo único puede servirse con consultas en varios idiomas sin duplicar el índice de documentos.
- Búsqueda sobre notas y correo personales en macOS: indexación por lotes de documentos largos con MLX y consultas interactivas en el ANE, con el bundle verificado por SHA-256 en la cache local.
- Filtrado y triaje de incidencias: embeber descripciones de tickets y recuperar casos previos similares para enrutarlos; la ventana de 8.192 tokens admite hilos de conversación completos en un solo vector.
- Deduplicación y agrupamiento de documentos a partir de los vectores de la torre de documento, reutilizando los mismos embeddings del índice sin coste adicional de codificación.

## Benchmarks y rendimiento

Calidad de recuperación medida con nDCG@10 y MTEB 2.20.5. Los vectores de documento son los de Arctic sin modificar; se compara clean71-v1 con la torre de query anterior ("Original S2B"):

| Grupo de evaluacion | clean71-v1 | Original S2B |
|---|---:|---:|
| English4 (SciFact, NFCorpus, FiQA, TREC-COVID) | 0,558788 | 0,558020 |
| MIRACL10 (10 idiomas objetivo) | 0,573916 | 0,574632 |
| Belebele14 (14 idiomas objetivo) | 0,865348 | 0,882941 |
| **Macro primaria (media de los tres grupos)** | **0,666017** | **0,671864** |
| Las 37 unidades, incluyendo idiomas fuera del alcance | 0,610932 | 0,719872 |

Regresiones dentro del conjunto objetivo (Belebele, nDCG@10, clean71-v1 frente a S2B): ruso 0,852 vs 0,890; vietnamita 0,797 vs 0,833; chino 0,875 vs 0,901; hindi 0,787 vs 0,812.

Idiomas fuera del conjunto objetivo, donde la degradación es severa:

| Fuera del conjunto objetivo | clean71-v1 | Original S2B |
|---|---:|---:|
| Persa, MIRACL | 0,140 | 0,536 |
| Persa, Belebele | 0,296 | 0,852 |
| Tailandes, Belebele | 0,083 | 0,850 |
| Telugu, Belebele | 0,066 | 0,783 |
| Bengali, Belebele | 0,075 | 0,777 |
| Fines, Belebele | 0,463 | 0,762 |
| Neerlandes, Belebele | 0,643 | 0,877 |

Fidelidad de la cuantización frente a una referencia FP32 (torre de documento FP32 + torre de query CoreML FP16), en BEIR con zeppelin-embed sobre un M3 Max:

| Corpus | Pierna | Referencia FP32 | Esta release | Cambio |
|---|---|---:|---:|---:|
| FiQA (648 consultas) | densa | 0,421072 | 0,420397 | -0,160 % |
| FiQA | hibrida | 0,284278 | 0,284463 | +0,065 % |
| SciFact (300 consultas) | densa | 0,697647 | 0,696895 | -0,108 % |
| SciFact | hibrida | 0,720797 | 0,720797 | 0,000 % |
| NFCorpus (323 consultas) | densa | 0,339128 | 0,340106 | +0,288 % |
| NFCorpus | hibrida | 0,339312 | 0,339146 | -0,049 % |

Latencia declarada por el autor: p50 de 1-2 ms por consulta densa a batch 1 con la torre CoreML (tokenización incluida, sobre un host cargado); 6-7 ms con el fallback MLX FP16, con calidad dentro del 0,2 % de FP32. No se publican cifras de throughput para indexación masiva de documentos.

## Requisitos de hardware

- Plataforma: macOS sobre Apple Silicon exclusivamente. No hay build para x86, Linux ni CUDA.
- Almacenamiento: 832.765.584 bytes en total (761.146.896 del `.zem` más 71.618.688 del `.mlmodelc`), un 49,7 % menos que la release FP32 de 1.656.816.265 bytes.
- Memoria: los pesos de la torre de documento en FP16 suponen aproximadamente 0,61 GB y la torre de query CoreML unos 72 MB; se recomienda un mínimo de 16 GB de memoria unificada para indexar lotes con secuencias largas (estimación a partir del tamano de los pesos, no publicada por el autor).
- GPU/ANE: el Neural Engine es el objetivo primario para consultas (230 operaciones ANE, 12 en CPU); la GPU vía MLX se usa para documentos. Las medidas se tomaron en un Apple M3 Max.
- Cabe en equipos de consumo Apple Silicon (familias M1, M2, M3, M4) por tamano de pesos, aunque el rendimiento medido solo está documentado en M3 Max.
- Opciones de despliegue: únicamente la librería `zeppelin-embed` (con el crate `zeppelin-embed-text` para Rust), abriendo un store por referencia de modelo con repo, revisión y hash del manifiesto. No es compatible con vLLM, llama.cpp, Ollama, TGI, transformers ni sentence-transformers.
- Latencia: 1-2 ms p50 por consulta con CoreML INT8; 6-7 ms con el fallback MLX FP16.
- Integridad: fijar la revisión `d64b817c4021a3f1b9bded3152d9afdf9ac813e7` y el SHA-256 del manifiesto `123c6308e00f769c68498f9df60dfb9efc688f58c4ff2c4da266f978fcb215dc`; la verificación se puede repetir con `shasum -a 256 -c SHA256SUMS`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento (macro primaria) | Licencia | Disponibilidad |
|---|---|---:|---|---|---|
| zeppelin-embed clean71-v1 + Arctic m-v2 (esta ficha) | 71,2 M query + 305,4 M documento | 96 / 8.192 | 0,666017 | Apache 2.0 | Solo macOS Apple Silicon, vía zeppelin-embed |
| Snowflake/snowflake-arctic-embed-m-v2.0 (solo torre de documento) | 305,4 M | 8.192 | no disponible en esta ficha (es la torre de documento de referencia, sin torre de query destilada) | Apache 2.0 | HuggingFace, transformers / sentence-transformers |
| Torre de query "Original S2B" (release anterior del mismo autor) | aprox. 229,7 M (deducido de la reducción del 69 % indicada por el autor) | no disponible | 0,671864 | no disponible | no disponible |

No se han publicado en la información disponible comparaciones contra otros modelos de embeddings multilingües de tamano similar (por ejemplo familias E5, BGE o GTE): no disponible.

## Limitaciones y advertencias

- No hay paridad multilingüe universal: dentro de los 14 idiomas objetivo hay regresiones reales, con caídas de hasta 0,036 en nDCG@10 en Belebele (ruso, vietnamita, chino, hindi).
- Fuera del conjunto objetivo el rendimiento se desploma: persa 0,140 en MIRACL y 0,296 en Belebele, tailandés 0,083, telugu 0,066, bengalí 0,075, finés 0,463, neerlandés 0,643. El autor recomienda usar otro modelo de query para esos idiomas.
- Dependencia de plataforma: solo macOS sobre Apple Silicon. No hay soporte para Linux, Windows, x86 ni GPUs NVIDIA, lo que bloquea su uso en la mayoría de servidores de producción.
- El bundle no es un checkpoint estándar: no se puede cargar con `transformers` ni `sentence-transformers`; requiere `zeppelin-embed` y su manifiesto.
- Limite de 96 tokens en la consulta (prefijo incluido): consultas largas o conversacionales deben reformularse o truncarse antes de embeber.
- La torre de query es una destilación: puede heredar sesgos del corpus de destilación y del modelo Arctic original; no se documentan evaluaciones de sesgo.
- Riesgo de alucinación no aplica directamente (no genera texto), pero sí el riesgo de recuperación incorrecta: un fragmento mal recuperado condiciona cualquier sistema RAG que se apoye en estos embeddings.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías y el repositorio es una publicación comunitaria con 0 descargas y 0 likes, sin validación externa conocida.
- La información de la model card está fechada en octubre de 2026; conviene fijar la revisión por hash, ya que no hay versionado semántico del bundle.
- Los resultados de búsqueda web asociados a esta consulta no contenían material técnico relevante sobre el modelo y se han descartado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/aghatage/zeppelin-embed-clean71-arctic-m-v2
- Repositorio del motor: https://github.com/zepdb/zeppelin-embed
- Modelo base (torre de documento): https://huggingface.co/Snowflake/snowflake-arctic-embed-m-v2.0
- Revisión concreta del modelo base usada en el bundle: `95c2741480856aa9666782eb4afe11959938017f`
- Revisión fijada de este bundle: `d64b817c4021a3f1b9bded3152d9afdf9ac813e7`
- Manifiesto verificado (SHA-256): `123c6308e00f769c68498f9df60dfb9efc688f58c4ff2c4da266f978fcb215dc`
