# flowercomputers/bekko-static-v1-slim-100k

## Resumen

bekko-static-v1-slim-100k es un modelo de embeddings estaticos para similitud de frases y recuperacion de informacion, publicado por flowercomputers como derivado podado del vocabulario de hotchpotch/bekko-static-embedding-v1. No es un transformer generativo: se trata de una tabla de embeddings por token (lookup) seguida de mean pooling, con dimension nativa de 1024 y soporte Matryoshka de 32 a 1024 dimensiones. Su interes reside en que reduce el vocabulario original de 200.000 a 100.000 piezas WordPiece, lo que recorta el tamano del modelo a la mitad (205 MB en fp16) manteniendo un espacio de embeddings identico al del modelo fuente.

El modelo cubre 25 idiomas (incluido el castellano) y esta disenado para los mismos benchmarks de recuperacion multilingue que reporta el modelo original: MNanoBEIR, NanoMIRACL, NanoMLDR y neerlandes. La poda no es arbitraria: cada token se ordena por el dano esperado al eliminarlo, combinando frecuencia de corpus y distancia entre su vector y la suma de los vectores de las piezas en las que se re-tokenizaria la palabra.

Es relevante para despliegues con requisitos estrictos de latencia, memoria o tamano de binario: al no haber atencion ni capas transformer, la inferencia es practicamente una suma de vectores indexados. El autor ofrece ademas un crate de Rust (`encoders`) que compila el modelo dentro del binario, sin Python ni descarga en tiempo de ejecucion. La licencia es MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Embedding estatico (lookup de tokens + mean pooling, sin transformer) |
| Parametros totales | 102.400.000 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica atencion; limitada por la tokenizacion de la frase) |
| Tipos de cuantizacion | int8, int16 (por defecto en el crate Rust), float32; truncado Matryoshka a 512, 256, 128, 64 y 32 dimensiones |
| Idiomas soportados | 25: en, ar, bn, de, es, fa, fi, fr, hi, id, it, ja, ko, nl, no, pt, ru, sr, sv, sw, te, th, vi, yo, zh |
| Licencia | MIT |
| Formato de pesos | safetensors (libreria sentence-transformers); tablas compilables via crate `encoders` |

## Arquitectura y entrenamiento

El modelo no contiene bloques transformer. La arquitectura consiste en una tabla de embeddings de 100.000 entradas por 1024 dimensiones: cada token WordPiece se mapea directamente a un vector y la representacion de la frase se obtiene promediando los vectores de sus tokens (mean pooling). El autor indica que el espacio de embeddings es el mismo que el del modelo fuente, por lo que no hay un reentrenamiento de los vectores, sino una seleccion del subconjunto de tokens.

La innovacion tecnica esta en el metodo de poda del vocabulario. Los tokens se ordenan por "dano esperado al eliminar", calculado como la frecuencia del token en el corpus multiplicada por la norma de la diferencia entre su vector y la suma de los vectores de las piezas en las que se re-tokenizaria al eliminarlo. El proceso se ejecuta por rondas: se descarta el 10 % menos util, se re-tokeniza, se re-puntuan los tokens cuyo fallback ha cambiado y se trunca al tamano objetivo (100k). El resultado mantiene 25 idiomas; el miembro de 32k de la misma familia solo conserva 14 porque los alfabetos con palabras largas (telugu, thai, bengali) se fragmentan en caracteres. No se dispone de informacion sobre el dataset de entrenamiento original ni sobre el uso de RLHF o DPO, que no aplican a este tipo de modelo.

## Capacidades

- Generacion de embeddings de frases y documentos para similitud semantica y recuperacion densa.
- Recuperacion multilingue en 25 idiomas, incluidos castellano, portugues, frances, aleman, arabe, hindi, japones, coreano y chino.
- Dimension adaptativa Matryoshka: truncado a 512, 256, 128, 64 o 32 dimensiones con perdida gradual de calidad.
- Cuantizacion de la tabla a int8 o int16, con int16 practicamente indistinguible de float32 segun el autor.
- Integracion directa con sentence-transformers (`SentenceTransformer`, `encode`, `similarity`).
- Compilacion estatica en binarios Rust mediante el crate `encoders`, con features `mrl-512` a `mrl-32`, `int8`, `int16`, `float32` y `rayon` para paralelizar lotes.
- Sin prompts ni prefijos para consultas y documentos.
- No soporta tool calling, agentes, razonamiento multi-paso, vision ni audio: no es un modelo generativo.
- No soporta idiomas fuera de la lista de 25; sus tokens fueron eliminados y el texto se tokeniza a caracteres o `[UNK]`.

## Casos de uso

- Busqueda semantica de baja latencia: al ser una suma de vectores indexados, el coste por consulta es una fraccion del de un transformer; adecuado para motores de busqueda interna con millones de documentos y requisitos de milisegundos.
- Deduplicacion y clustering de documentos multilingues: los embeddings de 1024 dimensiones permiten agrupar articulos, tickets o registros duplicados en castellano, ingles, arabe o chino con el mismo modelo.
- Filtrado previo en pipelines RAG: como primera etapa de recuperacion barata antes de un re-ranker o de un modelo generativo, reduciendo el numero de candidatos que llegan al modelo caro.
- Despliegue en el borde o en binarios Rust: con el crate `encoders` el modelo se compila dentro del ejecutable (205 MB en fp16, menos en int8), sin dependencia de Python ni descarga en tiempo de ejecucion, util para aplicaciones de escritorio o servicios embebidos.
- Moderacion y clasificacion por similitud: comparar mensajes de usuario contra un conjunto de plantillas de referencia para detectar spam, abuso o temas prohibidos en varios idiomas.
- Sistemas de recomendacion por contenido: calcular similitud entre descripciones de productos o articulos en 25 idiomas para recomendar items relacionados sin entrenar un modelo por idioma.
- Indexacion de bajo coste en memoria: con truncado Matryoshka a 256 o 128 dimensiones y cuantizacion int8, el indice vectorial cabe en memoria en entornos con recursos limitados.

## Benchmarks y rendimiento

Resultados publicados por el autor (nDCG@10 x 100, 1024 dimensiones):

| Modelo | Vocab | Idiomas | NanoBEIR-en | MNanoBEIR | NanoMIRACL |
|---|---:|---:|---:|---:|---:|
| hotchpotch/bekko-static-embedding-v1 | 200k | 40 | 53,71 | 43,71 | 68,03 |
| bekko-static-v1-slim-100k | 100k | 25 | 52,91 | 42,98 | 66,53 |
| bekko-static-v1-slim-75k | 75k | 25 | 52,09 | 42,15 | 64,51 |
| bekko-static-v1-slim-50k | 50k | 25 | 50,22 | 40,37 | 61,35 |
| bekko-static-v1-slim-32k | 32k | 14 | 49,31 | 39,86 | 49,25 |

Rendimiento segun la anchura de embedding (NanoBEIR-en, nDCG@10 x 100):

| Vocab \ dims | 1024 | 512 | 256 | 128 | 64 |
|---|---:|---:|---:|---:|---:|
| 200k (fuente) | 53,71 | 52,84 | 50,84 | 47,82 | 43,96 |
| 100k | 52,91 | 52,13 | 50,05 | 47,03 | 42,84 |
| 75k | 52,09 | 51,62 | 48,72 | 46,36 | 40,78 |
| 50k | 50,22 | 49,39 | 47,12 | 44,44 | 38,03 |
| 32k | 49,31 | 48,39 | 46,16 | 42,53 | 36,51 |

Rendimiento segun la anchura de embedding (MNanoBEIR, nDCG@10 x 100):

| Vocab \ dims | 1024 | 512 | 256 | 128 | 64 |
|---|---:|---:|---:|---:|---:|
| 200k (fuente) | 43,71 | 42,83 | 41,03 | 38,03 | 32,87 |
| 100k | 42,98 | 42,07 | 40,39 | 37,08 | 32,13 |
| 75k | 42,15 | 41,28 | 39,28 | 36,04 | 30,87 |
| 50k | 40,37 | 39,35 | 37,60 | 34,26 | 28,49 |
| 32k | 39,86 | 38,88 | 36,85 | 33,12 | 27,50 |

Rendimiento segun la anchura de embedding (NanoMIRACL, nDCG@10 x 100):

| Vocab \ dims | 1024 | 512 | 256 | 128 | 64 |
|---|---:|---:|---:|---:|---:|
| 200k (fuente) | 68,03 | 67,67 | 66,47 | 63,99 | 58,33 |
| 100k | 66,53 | 66,01 | 64,76 | 62,09 | 55,75 |
| 75k | 64,51 | 63,96 | 62,42 | 59,59 | 53,07 |
| 50k | 61,35 | 60,73 | 59,41 | 55,70 | 48,19 |
| 32k | 49,25 | 48,60 | 47,19 | 44,10 | 36,47 |

## Requisitos de hardware

- VRAM estimada: 205 MB en fp16 a 1024 dimensiones; aproximadamente 102 MB en int8; el truncado Matryoshka reduce proporcionalmente la tabla (256 dimensiones implica un cuarto de la tabla).
- GPU: no necesita GPU dedicada; cualquier GPU consumer reciente (RTX 3060 o superior) ejecuta lotes grandes con holgura. En CPU, la inferencia es viable para cargas moderadas por tratarse de un lookup con pooling.
- Cabe en cualquier GPU consumer y en dispositivos con poca memoria; tambien en entornos sin GPU.
- Despliegue: sentence-transformers (Python), crate `encoders` (Rust, compilacion estatica con features `int8`, `int16`, `float32`, `rayon` y `mrl-*`). No se mencionan integraciones con vLLM, TGI, llama.cpp ni Ollama, que no aplican a un modelo estatico de embeddings.
- Latencia y throughput: no se publican mediciones concretas. El autor afirma que la salida del crate coincide con la implementacion de referencia de sentence-transformers (`StaticEmbedding`, misma tokenizacion y mean pooling), y que int16 es practicamente indistinguible de float32 a la mitad de tamano.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | NanoBEIR-en | MNanoBEIR | NanoMIRACL | Licencia |
|---|---:|---|---:|---:|---:|---|
| bekko-static-v1-slim-100k | 102,4 M | no aplica | 52,91 | 42,98 | 66,53 | MIT |
| hotchpotch/bekko-static-embedding-v1 | no disponible (200k vocab, 410 MB fp16) | no aplica | 53,71 | 43,71 | 68,03 | no disponible |
| bekko-static-v1-slim-75k | no disponible (75k vocab, 154 MB fp16) | no aplica | 52,09 | 42,15 | 64,51 | MIT |
| bekko-static-v1-slim-50k | no disponible (50k vocab, 102 MB fp16) | no aplica | 50,22 | 40,37 | 61,35 | MIT |

Frente a los transformers de embeddings densos (tipo E5 o BGE), este modelo no compite en calidad absoluta sino en coste: no se dispone en la informacion proporcionada de resultados comparativos directos con esos modelos.

## Limitaciones y advertencias

- Solo soporta los 25 idiomas listados. Cualquier otro idioma se tokeniza a caracteres o `[UNK]` y produce embeddings de baja calidad.
- El sesgo del modelo hereda el del corpus usado para calcular frecuencias y entrenar la tabla original; no se documenta ninguna evaluacion de sesgo.
- Riesgo de perdida de calidad en palabras raras o dominios especializados: la poda elimina tokens poco frecuentes y las palabras afectadas se re-tokenizan en piezas cuyos vectores fueron entrenados para otros contextos.
- La calidad en recuperacion cae de forma medible respecto al modelo fuente: -0,80 puntos en NanoBEIR-en, -0,73 en MNanoBEIR y -1,50 en NanoMIRACL a 1024 dimensiones.
- El truncado Matryoshka por debajo de 256 dimensiones degrada notablemente el rendimiento (a 64 dimensiones se pierden mas de 10 puntos en NanoBEIR-en).
- No es un modelo generativo: no produce texto, no hace razonamiento, no soporta tool calling ni agentes.
- La licencia MIT permite uso comercial sin restricciones conocidas, pero conviene verificar la licencia del modelo base (hotchpotch/bekko-static-embedding-v1), que no se detalla en la informacion disponible.
- El ID del modelo aparece como `flowercomputers/bekko-static-v1-slim-100k` en la ficha de Hugging Face, pero los ejemplos de codigo de la model card usan `flower-computer/bekko-static-v1-slim-100k`; conviene comprobar el identificador correcto antes de integrarlo.
- El modelo se creo en noviembre de 2026 y acumula 0 descargas en el momento de la consulta: no hay evidencia de uso en produccion ni validacion independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/flowercomputers/bekko-static-v1-slim-100k
- Modelo base: https://huggingface.co/hotchpotch/bekko-static-embedding-v1
- Coleccion de la familia slim: https://huggingface.co/collections/flower-computer/bekko-static-v1-slim-6aecc3d4969e7752c8a5074f
- Miembro de 75k: https://huggingface.co/flower-computer/bekko-static-v1-slim-75k
- Miembro de 50k: https://huggingface.co/flower-computer/bekko-static-v1-slim-50k
- Miembro de 32k: https://huggingface.co/flower-computer/bekko-static-v1-slim-32k
- Crate `encoders` en crates.io: https://crates.io/crates/encoders
- Repositorio del crate: https://github.com/flowercomputers/encoders
