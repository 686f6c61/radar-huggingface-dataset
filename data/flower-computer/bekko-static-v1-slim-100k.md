# flower-computer/bekko-static-v1-slim-100k

## Resumen

`bekko-static-v1-slim-100k` es un modelo de embeddings estaticos multilingue desarrollado por flower-computer, derivado por poda de vocabulario del modelo `hotchpotch/bekko-static-embedding-v1`. A diferencia de un transformer, es una tabla de busqueda de tokens con mean pooling: cada WordPiece tiene asociado un vector de 1024 dimensiones y la representacion de una frase se obtiene promediando los vectores de sus tokens. No hay capas de atencion ni calculo matricial pesado, lo que lo hace extremadamente ligero en inferencia.

El modelo reduce el vocabulario original de 200.000 a 100.000 tokens, conservando los mas utiles para las 25 lenguas cubiertas por los benchmarks de recuperacion multilingue que reporta el modelo fuente (MNanoBEIR, NanoMIRACL, NanoMLDR y neerlandes). El resultado es un modelo de 102,4 millones de parametros y unos 205 MB en fp16, con soporte Matryoshka de 32 a 1024 dimensiones, que mantiene un rendimiento cercano al original (52,91 frente a 53,71 en NanoBEIR-en; 42,98 frente a 43,71 en MNanoBEIR).

Es relevante porque ofrece embeddings multilingues de calidad razonable con un coste de despliegue minimo: cabe en cualquier entorno, se puede compilar dentro de un binario Rust mediante el crate `encoders` y no requiere GPU. La contrapartida es que el texto en lenguas fuera de las 25 soportadas se tokeniza a caracteres o `[UNK]` y pierde calidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Embedding estatico (token lookup + mean pooling), sin transformer |
| Parametros totales | 102.400.000 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | fp16 (205 MB); tablas enteras de 8 y 16 bits via `quant-8` / `quant-16` en el crate `encoders`; dimensiones Matryoshka de 32 a 1024 |
| Idiomas soportados | 25: en, ar, bn, de, es, fa, fi, fr, hi, id, it, ja, ko, nl, no, pt, ru, sr, sv, sw, te, th, vi, yo, zh |
| Licencia | MIT |
| Formato de pesos | safetensors (libreria sentence-transformers) |

## Arquitectura y entrenamiento

El modelo es un embedding estatico puro: una tabla de 100.000 vectores de 1024 dimensiones, uno por WordPiece, y mean pooling sobre los tokens de la frase. No hay capas de transformer ni atencion. Soporta dimensiones Matryoshka (32, 64, 256, 1024, etc.), de modo que se puede truncar el vector de salida para reducir coste de almacenamiento y busqueda a cambio de algo de calidad.

La construccion del vocabulario siguio un criterio de "dano esperado por eliminacion": cada token se ordeno por frecuencia en corpus (mezcla por lengua de WebFAQ-v2 y Wikipedia, con ingles x3) multiplicada por la norma de la diferencia entre su vector y la suma de los vectores de los fragmentos en que se descompone al eliminarlo. El proceso se hizo en rondas (eliminar el 10 % menos util, re-tokenizar, re-puntuar) hasta truncar a 100.000 piezas. Se conservaron siempre los tokens especiales y todas las piezas de un solo caracter presentes en el corpus, de modo que el texto en lenguas cubiertas nunca degrada a `[UNK]`. Tras la truncacion, las filas supervivientes se ajustaron por autodestilacion: perdida coseno a 1024, 256 y 64 dimensiones contra los embeddings de frase del modelo completo, sobre parrafos de WebFAQ-v2 y Wikipedia de las lenguas cubiertas (lr 0,03, 3000 pasos, batch 1024, Adam disperso solo sobre filas tocadas). El ajuste mueve aproximadamente el 10 % de la norma de la fila mediana y recupera entre 1 y 2 puntos nDCG en vocabularios pequenos.

## Capacidades

- Generacion de embeddings de frase para similitud semantica y recuperacion (retrieval) densa.
- Extraccion de caracteristicas (`feature-extraction`) a partir de texto.
- Multilingue en 25 lenguas, con calidad medida en benchmarks de recuperacion multilingue.
- Dimensiones Matryoshka: truncado del vector a 32, 64, 256 o 1024 dimensiones.
- Sin prompts ni prefijos: consultas y documentos se codifican igual, como en el modelo fuente.
- Despliegue nativo en Rust mediante el crate `encoders`, que compila la tabla dentro del binario en tiempo de build.
- No soporta tool calling, agentes, razonamiento multi-paso, vision ni audio: es exclusivamente un codificador de texto.

## Casos de uso

- Busqueda semantica en aplicaciones moviles o embebidas: el modelo ocupa 205 MB en fp16 y puede compilarse dentro de un binario Rust con `encoders`, sin runtime de Python ni descarga en tiempo de ejecucion, lo que permite busqueda semantica offline en dispositivos con recursos limitados.
- Deduplicacion y agrupamiento de documentos multilingues: al cubrir 25 lenguas con un mismo espacio de embeddings, permite detectar near-duplicates entre articulos de Wikipedia o noticias en distintos idiomas comparando similitud coseno.
- Recuperacion aumentada (RAG) de bajo coste: sirve como retriever en pipelines donde la latencia y el coste de GPU son criticos; el embedding se calcula con una simple media de vectores y la busqueda se hace sobre indices vectoriales estandar.
- Clasificacion de tickets de soporte por similitud: se comparan los embeddings de tickets entrantes contra prototipos de categorias previamente embebidos, con coste de inferencia practicamente nulo y sin GPU.
- Filtrado de contenido y moderacion por similitud: comparar embeddings de mensajes contra una lista de ejemplos problematicos por lengua, aprovechando el soporte multilingue para cubrir comunidades en arabe, bengali, hindi, telugu, tailandes o yoruba.
- Cache semantica de respuestas: almacenar embeddings de consultas frecuentes y recuperar respuestas cacheadas cuando la similitud supera un umbral, reduciendo llamadas a modelos generativos en produccion.
- Sistemas de recomendacion de articulos: embeber el catalogo una sola vez con el modelo y hacer busquedas de vecinos mas cercanos por articulo; el tamano reducido permite reindexar el catalogo con frecuencia.

## Benchmarks y rendimiento

Resultados reportados en la model card (nDCG@10 x 100, 1024 dimensiones):

| Modelo | Vocab · tamano fp16 | Lenguas | NanoBEIR-en | MNanoBEIR | NanoMIRACL |
|---|---|---:|---:|---:|---:|
| hotchpotch/bekko-static-embedding-v1 | 200k · 410 MB | 40 | 53,71 | 43,71 | 68,03 |
| este vocabulario sin recuperacion | 100k · 205 MB | 25 | 52,90 | 42,95 | 66,33 |
| **bekko-static-v1-slim-100k** | 100k · 205 MB | 25 | 52,91 | 42,98 | 66,53 |
| bekko-static-v1-slim-75k | 75k · 154 MB | 25 | 52,09 | 42,15 | 64,51 |
| bekko-static-v1-slim-50k | 50k · 102 MB | 25 | 50,22 | 40,37 | 61,35 |
| bekko-static-v1-slim-32k | 32k · 66 MB | 14 | 49,31 | 39,86 | 49,25 |

No se han publicado resultados de MMLU, HumanEval ni GSM8K, ya que el modelo no es generativo.

## Requisitos de hardware

- Inferencia en CPU: el modelo no necesita GPU; una tabla de 100.000 x 1024 valores en fp16 ocupa unos 205 MB de memoria.
- VRAM estimada en GPU: menos de 1 GB en fp16; practicamente despreciable incluso en GPUs integradas.
- GPU recomendadas: cualquiera; no se requiere GPU dedicada. Funciona en A100, H100 y RTX 4090 sin aprovechar su capacidad de computo.
- Cabe en cualquier GPU de consumo, incluida una GTX 1050 o una iGPU moderna.
- Despliegue: sentence-transformers (Python), crate `encoders` de Rust (compilacion estatica en el binario, con features `dim-512` a `dim-32` para Matryoshka y `quant-8` / `quant-16` para tablas enteras), y cualquier runtime que cargue safetensors.
- Latencia y throughput: no se han publicado cifras concretas; al ser una media de vectores, el coste por frase es proporcional al numero de tokens. El vocabulario reducido hace que el texto en lenguas cubiertas se tokenice en aproximadamente un 3 % mas de tokens que con el tokenizador original, medido sobre parrafos de Wikipedia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| **bekko-static-v1-slim-100k** | 102,4 M | no disponible | MIT | Hugging Face, crate `encoders` | 25 lenguas, Matryoshka 32-1024, 205 MB |
| hotchpotch/bekko-static-embedding-v1 | no disponible | no disponible | no disponible | Hugging Face | Modelo fuente, 200k tokens, 40 lenguas, 410 MB |
| bekko-static-v1-slim-50k | no disponible | no disponible | MIT | Hugging Face | Misma familia, 50k tokens, 102 MB, 25 lenguas |
| bekko-static-v1-slim-32k | no disponible | no disponible | MIT | Hugging Face | Misma familia, 32k tokens, 66 MB, 14 lenguas |

No se dispone de datos para comparar con modelos de embeddings densos basados en transformer (por ejemplo, familias tipo multilingual-e5 o bge-m3), ya que no se han proporcionado resultados de esos modelos en la informacion disponible.

## Limitaciones y advertencias

- Solo soporta las 25 lenguas listadas; el texto en otras lenguas se tokeniza a caracteres o `[UNK]` y la calidad cae drasticamente.
- Al ser un embedding estatico, no captura contexto dependiente del orden ni composicionalidad mas alla de la media de vectores de tokens; frases con negaciones o estructura sintactica compleja pueden representarse de forma imprecisa.
- El vocabulario reducido provoca un 3 % mas de tokens en lenguas cubiertas, lo que aumenta ligeramente el coste de embedding.
- Riesgo de alucinacion no aplica (no genera texto), pero la similitud coseno puede producir falsos positivos en retrieval con textos cortos o ambiguos.
- La licencia MIT permite uso comercial sin restricciones conocidas, pero conviene verificar la licencia del modelo base `hotchpotch/bekko-static-embedding-v1` antes de redistribuir derivados.
- No hay informacion publicada sobre sesgos por lengua o dominio; al entrenarse con WebFAQ-v2 y Wikipedia, puede heredar los sesgos de esas fuentes.
- La longitud de contexto no esta documentada; al usar mean pooling, frases muy largas diluyen la senal en el vector medio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/flower-computer/bekko-static-v1-slim-100k
- Modelo base: https://huggingface.co/hotchpotch/bekko-static-embedding-v1
- Coleccion de la familia slim: https://huggingface.co/collections/flower-computer/bekko-static-v1-slim-6aecc3d4969e7752c8a5074f
- Variante 75k: https://huggingface.co/flower-computer/bekko-static-v1-slim-75k
- Variante 50k: https://huggingface.co/flower-computer/bekko-static-v1-slim-50k
- Variante 32k: https://huggingface.co/flower-computer/bekko-static-v1-slim-32k
- Crate `encoders` en crates.io: https://crates.io/crates/encoders
- Repositorio del crate: https://github.com/flowercomputers/encoders
