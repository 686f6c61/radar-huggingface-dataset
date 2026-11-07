# flowercomputers/bekko-static-v1-slim-32k

## Resumen

bekko-static-v1-slim-32k es un modelo de embeddings estaticos derivado de hotchpotch/bekko-static-embedding-v1 mediante poda de vocabulario. No es un transformer: se trata de una tabla de lookup de tokens seguida de mean pooling, con embeddings de 1024 dimensiones y soporte Matryoshka de 32 a 1024 dimensiones. El autor es flowercomputers y se distribuye bajo licencia MIT a traves de sentence-transformers.

El modelo reduce el vocabulario original de 200.000 tokens WordPiece a 32.000, seleccionados por su utilidad para los 14 idiomas cubiertos (ingles, arabe, aleman, espanol, frances, italiano, japones, coreano, noruego, portugues, serbio, sueco, tailandes y vietnamita). El objetivo es ofrecer un encoder de recuperacion y similitud semantica con una huella de apenas 66 MB en fp16, apto para despliegues embebidos o en el borde sin dependencia de Python en tiempo de ejecucion.

Su relevancia actual radica en el coste computacional: al eliminar la atencion y reducir el vocabulario, la inferencia se reduce a tokenizacion, lookup y media de vectores, lo que permite compilar el modelo dentro de un binario (por ejemplo, mediante el crate de Rust `encoders`) y ejecutarlo sin GPU ni descarga en runtime.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Static embedding (token lookup + mean pooling, sin transformer) |
| Parametros totales | 32.768.000 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de embeddings; sin ventana de atencion) |
| Tipos de cuantizacion | int8, int16 (por defecto), float32; truncado Matryoshka a 512, 256, 128, 64 y 32 dimensiones |
| Idiomas soportados | en, ar, de, es, fr, it, ja, ko, no, pt, sr, sv, th, vi |
| Licencia | MIT |
| Formato de pesos | safetensors (sentence-transformers); integrable en binario via crate `encoders` |

## Arquitectura y entrenamiento

La arquitectura es un modelo de embeddings estaticos: cada token del vocabulario WordPiece tiene asociado un vector de 1024 dimensiones, y el embedding de una frase se obtiene promediando (mean pooling) los vectores de sus tokens. No hay capas de atencion ni parametros contextuales, por lo que el modelo no distingue el orden de las palabras mas alla de la composicion del vocabulario. Soporta dimensiones Matryoshka (32 a 1024) mediante truncado del vector.

El entrenamiento hereda el del modelo base hotchpotch/bekko-static-embedding-v1; esta variante no reentrena los vectores, sino que poda el vocabulario. La seleccion de tokens se hizo ordenando cada pieza por "dano esperado al eliminarla": utilidad(t) = frecuencia en corpus de t multiplicada por la norma de la diferencia entre el vector de t y la suma de vectores de las piezas en las que se descompone al eliminarlo. El proceso se aplico en rondas (eliminar el 10 % menos util, retokenizar, recalcular), con frecuencias derivadas de una mezcla por idioma de WebFAQ-v2 y Wikipedia (peso igual por idioma, ingles x3). Se conservan siempre los tokens especiales y todas las piezas de un solo caracter presentes en el corpus, de modo que el texto en idiomas cubiertos no degrada a `[UNK]`. Tras el truncado, los vectores supervivientes se reajustan para preservar el espacio de embeddings del modelo original.

## Capacidades

- Generacion de embeddings de frases y documentos para similitud semantica y recuperacion (retrieval).
- Feature extraction a nivel de frase con pooling por media.
- Soporte Matryoshka: truncado del vector a 512, 256, 128, 64 o 32 dimensiones con perdida gradual de calidad.
- Multilingue en 14 idiomas: en, ar, de, es, fr, it, ja, ko, no, pt, sr, sv, th, vi.
- Sin prompts ni prefijos para consultas o documentos (mismo esquema que el modelo base).
- Compatible con la API `StaticEmbedding` de sentence-transformers (misma tokenizacion y pooling).
- Integrable en Rust mediante el crate `encoders`, con compilacion del modelo en el binario en tiempo de build.
- No soporta tool calling, agentes, razonamiento multi-paso, vision ni audio: es exclusivamente un encoder de embeddings.

## Casos de uso

- Busqueda semantica en aplicaciones embebidas: el modelo se compila dentro de un binario Rust con el crate `encoders`, eliminando la descarga en runtime y la dependencia de Python; adecuado para dispositivos con recursos limitados donde 66 MB en fp16 son asumibles.
- Deduplicacion y agrupamiento de documentos multilingues: al generar embeddings de 1024 dimensiones (o truncados a 256) se pueden calcular similitudes coseno para clusterizar articulos, tickets o registros en los 14 idiomas cubiertos.
- Filtrado previo en pipelines RAG: como primera etapa de recuperacion de bajo coste antes de un reranker o un LLM, reduciendo el numero de candidatos enviados a etapas mas caras.
- Moderacion y clasificacion por similitud: comparar el embedding de un mensaje contra un conjunto de embeddings de referencia de categorias predefinidas, con latencia muy baja al no requerir GPU.
- Sistemas de recomendacion basados en contenido: calcular similitud entre descripciones de productos o articulos y el perfil textual del usuario mediante embeddings truncados a 128 o 256 dimensiones para ahorrar memoria.
- Analisis de corpus en investigacion: procesar grandes volumenes de texto sin infraestructura de GPU, aprovechando el modo int8 (un cuarto del tamano) para maximizar throughput en CPU.

## Benchmarks y rendimiento

Resultados publicados por el autor (nDCG@10 x 100, 1024 dimensiones):

| Modelo | Vocab | Idiomas | NanoBEIR-en | MNanoBEIR | NanoMIRACL |
|---|---:|---:|---:|---:|---:|
| hotchpotch/bekko-static-embedding-v1 (base) | 200k | 40 | 53,71 | 43,71 | 68,03 |
| bekko-static-v1-slim-100k | 100k | 25 | 52,91 | 42,98 | 66,53 |
| bekko-static-v1-slim-75k | 75k | 25 | 52,09 | 42,15 | 64,51 |
| bekko-static-v1-slim-50k | 50k | 25 | 50,22 | 40,37 | 61,35 |
| **bekko-static-v1-slim-32k** | 32k | 14 | **49,31** | **39,86** | **49,25** |

Rendimiento del modelo 32k segun dimension del embedding (nDCG@10 x 100):

| Benchmark | 1024 | 512 | 256 | 128 | 64 |
|---|---:|---:|---:|---:|---:|
| NanoBEIR-en | 49,31 | 48,39 | 46,16 | 42,53 | 36,51 |
| MNanoBEIR | 39,86 | 38,88 | 36,85 | 33,12 | 27,50 |
| NanoMIRACL | 49,25 | 48,60 | 47,19 | 44,10 | 36,47 |

La caida mas acusada respecto al modelo base se da en NanoMIRACL (68,03 a 49,25), atribuible a la eliminacion de idiomas no cubiertos por esta variante.

## Requisitos de hardware

- VRAM: no requiere GPU; la inferencia es lookup de tabla y media de vectores.
- Memoria: aproximadamente 66 MB en fp16 para los pesos; cerca de 33 MB con int8 y alrededor de 131 MB en float32.
- GPU recomendadas: no aplica; cualquier CPU es suficiente. En caso de usar GPU, cualquier modelo con memoria suficiente para la tabla es valido.
- Cabe en cualquier GPU de consumo e incluso en microcontroladores con memoria suficiente.
- Opciones de despliegue: sentence-transformers (Python), crate `encoders` de Rust (compilacion en build time, features `mrl-512` a `mrl-32`, `int8`/`int16`/`float32`, paralelizacion con `rayon`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que estan orientados a modelos generativos.
- Latencia y throughput: no disponibles en la informacion proporcionada; al no haber atencion, el coste es lineal en el numero de tokens y muy inferior al de un transformer de tamano comparable.

## Comparativa con modelos similares

| Modelo | Parametros | Vocab | Idiomas | NanoBEIR-en | Licencia | Formato |
|---|---:|---:|---:|---:|---|---|
| bekko-static-v1-slim-32k | 32,77 M | 32k | 14 | 49,31 | MIT | safetensors, binario Rust |
| bekko-static-v1-slim-50k | no disponible | 50k | 25 | 50,22 | MIT | safetensors |
| bekko-static-v1-slim-100k | no disponible | 100k | 25 | 52,91 | MIT | safetensors |
| hotchpotch/bekko-static-embedding-v1 | no disponible | 200k | 40 | 53,71 | no disponible | safetensors |

Frente a los modelos densos de embeddings basados en transformer (tipo Sentence-BERT), este modelo sacrifica calidad de recuperacion a cambio de un orden de magnitud menos de computo y memoria; no se dispone de comparaciones directas publicadas con esos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Solo soporta los 14 idiomas indicados; el texto en otros idiomas se tokeniza a caracteres o a `[UNK]` porque sus piezas de script fueron eliminadas.
- No modela el orden de las palabras ni el contexto: dos frases con las mismas palabras en distinto orden producen el mismo embedding.
- La calidad de recuperacion es inferior al modelo base, especialmente en NanoMIRACL (49,25 frente a 68,03), por la perdida de idiomas y piezas de vocabulario.
- El truncado Matryoshka degrada la calidad de forma progresiva; a 64 dimensiones el rendimiento cae de forma notable (36,51 en NanoBEIR-en frente a 49,31 a 1024).
- Riesgo de alucinacion no aplica (no genera texto); el riesgo es de falsos positivos o negativos en similitud semantica por la composicion bolsa-de-palabras.
- La licencia MIT permite uso comercial sin restricciones adicionales documentadas.
- En produccion conviene validar el rendimiento en el dominio concreto, dado que las frecuencias de poda se calcularon sobre WebFAQ-v2 y Wikipedia y pueden no reflejar jerga tecnica o dominios especializados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/flowercomputers/bekko-static-v1-slim-32k
- Modelo base: https://huggingface.co/hotchpotch/bekko-static-embedding-v1
- Coleccion de la familia slim: https://huggingface.co/collections/flower-computer/bekko-static-v1-slim-6aecc3d4969e7752c8a5074f
- Crate `encoders` en crates.io: https://crates.io/crates/encoders
- Repositorio del crate: https://github.com/flowercomputers/encoders
- Ficha en free2aitools: https://free2aitools.com/model/flower-computer/bekko-static-v1-slim-32k
