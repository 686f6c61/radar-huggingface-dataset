# flowercomputers/bekko-static-v1-slim-50k

## Resumen

bekko-static-v1-slim-50k es un modelo de embeddings estaticos multilingue desarrollado por flowercomputers como derivado podado del vocabulario de hotchpotch/bekko-static-embedding-v1. No es un transformer: se trata de una tabla de busqueda de tokens (WordPiece) con pooling medio, que produce vectores de 1024 dimensiones con soporte Matryoshka de 32 a 1024 dimensiones. El modelo conserva 50.000 de los 200.000 tokens del vocabulario original, seleccionados por su utilidad para las 25 lenguas cubiertas por los benchmarks de retrieval multilingue del modelo fuente.

El problema que resuelve es el coste de despliegue de los modelos de embeddings estaticos: al reducir el vocabulario a la cuarta parte, el tamano en fp16 baja de 410 MB a 102 MB manteniendo el mismo espacio de embeddings y la misma arquitectura. Esto permite compilar el modelo dentro de un binario Rust (crate `encoders`), ejecutarlo sin Python y sin descarga en tiempo de ejecucion, lo que resulta relevante para sistemas de busqueda semantica embebidos, aplicaciones de escritorio y servicios con requisitos estrictos de latencia y memoria.

La contrapartida es una perdida de calidad medible: en NanoBEIR-en pasa de 53,71 a 50,22 nDCG@10, en MNanoBEIR de 43,71 a 40,37 y en NanoMIRACL de 68,03 a 61,35. Ademas, el modelo solo soporta texto en las 25 lenguas listadas; el texto en otras lenguas se tokeniza a caracteres o a `[UNK]`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Embedding estatico (busqueda de token + mean pooling, sin transformer) |
| Parametros totales | 51.200.000 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8, int16 (por defecto en el crate `encoders`), float32; dimensiones Matryoshka de 1024, 512, 256, 128, 64 y 32 |
| Idiomas soportados | 25: en, ar, bn, de, es, fa, fi, fr, hi, id, it, ja, ko, nl, no, pt, ru, sr, sv, sw, te, th, vi, yo, zh |
| Licencia | MIT |
| Formato de pesos | safetensors (sentence-transformers); integrable en binario via crate `encoders` |

## Arquitectura y entrenamiento

El modelo no contiene capas de atencion ni transformer. La inferencia consiste en tokenizar el texto con un vocabulario WordPiece de 50.000 piezas, recuperar el vector de embedding asociado a cada token de una tabla de 50.000 x 1024 y aplicar pooling medio sobre la secuencia. El resultado es un vector de 1024 dimensiones que puede truncarse a anchos Matryoshka menores (512, 256, 128, 64, 32) sin reentrenamiento.

El modelo es un fine-tune derivado de hotchpotch/bekko-static-embedding-v1, del que hereda el espacio de embeddings y la tabla de vectores. La poda del vocabulario se realizo ordenando los tokens por dano esperado de eliminacion, con la formula `usefulness(t) = frecuencia en corpus de t × ‖ E[t] − Σ E[piezas a las que cae t al eliminarse] ‖`, calculada en rondas iterativas: se elimina el 10 % menos util, se retokeniza y se vuelve a puntuar. Las consultas y los documentos no requieren prefijos ni prompts, igual que en el modelo fuente. La model card no detalla el numero de tokens de entrenamiento ni la composicion del dataset del modelo original.

## Capacidades

- Generacion de embeddings de frases para similitud semantica y recuperacion de informacion (retrieval).
- Extraccion de caracteristicas (`feature-extraction`) a partir de texto.
- Soporte multilingue en 25 lenguas, incluyendo arabe, bengali, hindi, japones, coreano, chino, tailandes, telugu y yoruba.
- Dimensiones Matryoshka: truncamiento de 1024 a 512, 256, 128, 64 o 32 dimensiones con perdida gradual de calidad.
- Cuantizacion de la tabla de embeddings a int8 o int16, con salida practicamente indistinguible de float32 en int16.
- Integracion nativa en Rust mediante el crate `encoders`, con compilacion del modelo en el binario en tiempo de build.
- Procesamiento por lotes paralelizado con la feature `rayon` del crate.
- No soporta tool calling, agentes, razonamiento multi-paso, vision ni audio: es exclusivamente un modelo de embeddings.

## Casos de uso

- Busqueda semantica embebida en aplicaciones de escritorio o moviles: el modelo de 102 MB en fp16 y 51 MB en int8 puede compilarse dentro del binario Rust, eliminando la dependencia de Python y las descargas en tiempo de ejecucion.
- Deduplicacion y agrupamiento de documentos multilingues: el pooling medio sobre 1024 dimensiones permite calcular similitud coseno por lotes sobre corpus en 25 lenguas con un coste de computo minimo.
- Filtrado previo en pipelines RAG: al ser un modelo estatico sin atencion, su latencia es muy inferior a la de un transformer y puede usarse como primera etapa de recuperacion antes de un reranker mas costoso.
- Clasificacion de texto por similitud a prototipos: se calculan embeddings de frases de referencia por categoria y se asigna la clase del prototipo mas cercano, sin entrenamiento adicional.
- Sistemas de atencion al cliente con FAQ: indexacion de preguntas frecuentes en las 25 lenguas soportadas y recuperacion de la respuesta mas cercana mediante similitud de embeddings.
- Moderacion y enrutado de contenido: deteccion de duplicados o near-duplicates en flujos de ingesta multilingue con un modelo de huella de memoria reducida.
- Busqueda en dispositivos con recursos limitados: con truncamiento Matryoshka a 256 dimensiones y cuantizacion int8, el modelo ocupa aproximadamente 12,8 MB y sigue obteniendo 37,60 nDCG@10 en MNanoBEIR.

## Benchmarks y rendimiento

Resultados de nDCG@10 x 100 a 1024 dimensiones, segun la model card:

| Modelo | Vocab | Idiomas | NanoBEIR-en | MNanoBEIR | NanoMIRACL |
|---|---:|---:|---:|---:|---:|
| hotchpotch/bekko-static-embedding-v1 | 200k | 40 | 53,71 | 43,71 | 68,03 |
| bekko-static-v1-slim-100k | 100k | 25 | 52,91 | 42,98 | 66,53 |
| bekko-static-v1-slim-75k | 75k | 25 | 52,09 | 42,15 | 64,51 |
| **bekko-static-v1-slim-50k** | 50k | 25 | 50,22 | 40,37 | 61,35 |
| bekko-static-v1-slim-32k | 32k | 14 | 49,31 | 39,86 | 49,25 |

Rendimiento por anchura de embedding (nDCG@10 x 100):

| Benchmark | 1024 | 512 | 256 | 128 | 64 |
|---|---:|---:|---:|---:|---:|
| NanoBEIR-en | 50,22 | 49,39 | 47,12 | 44,44 | 38,03 |
| MNanoBEIR | 40,37 | 39,35 | 37,60 | 34,26 | 28,49 |
| NanoMIRACL | 61,35 | 60,73 | 59,41 | 55,70 | 48,19 |

No se han publicado resultados de benchmarks de otros tipos (MMLU, HumanEval, GSM8K) en la informacion disponible, ya que el modelo no realiza generacion de texto.

## Requisitos de hardware

- VRAM estimada: 102 MB en fp16, aproximadamente 51 MB en int8, aproximadamente 12,8 MB con truncamiento a 256 dimensiones e int8.
- GPU recomendadas: no requiere GPU; el modelo es lo bastante pequeno para ejecutarse en CPU con latencia de microsegundos por frase.
- Cabe en cualquier GPU consumer, incluida una GTX 1050 o una iGPU moderna, y en dispositivos moviles o sistemas embebidos.
- Opciones de despliegue: sentence-transformers (Python), crate `encoders` de Rust con compilacion en tiempo de build, y cualquier runtime que cargue safetensors.
- Latencia y throughput: no se han publicado mediciones concretas en la informacion disponible; al tratarse de una busqueda de tabla y un pooling medio, el coste dominante es la tokenizacion y el ancho de banda de memoria.

## Comparativa con modelos similares

| Modelo | Parametros | Vocab | Idiomas | NanoBEIR-en | MNanoBEIR | NanoMIRACL | Licencia |
|---|---:|---:|---:|---:|---:|---:|---|
| **bekko-static-v1-slim-50k** | 51,2 M | 50k | 25 | 50,22 | 40,37 | 61,35 | MIT |
| hotchpotch/bekko-static-embedding-v1 | no disponible | 200k | 40 | 53,71 | 43,71 | 68,03 | no disponible |
| bekko-static-v1-slim-100k | no disponible | 100k | 25 | 52,91 | 42,98 | 66,53 | MIT |
| bekko-static-v1-slim-32k | no disponible | 32k | 14 | 49,31 | 39,86 | 49,25 | MIT |

Frente al modelo fuente, slim-50k sacrifica 3,49 puntos en NanoBEIR-en, 3,34 en MNanoBEIR y 6,68 en NanoMIRACL a cambio de reducir el tamano de 410 MB a 102 MB y el vocabulario a la cuarta parte. Frente a slim-100k, la perdida es de 2,69, 2,61 y 5,18 puntos respectivamente, con la mitad de tamano. Frente a slim-32k, slim-50k mejora en todos los benchmarks y conserva 11 lenguas adicionales.

## Limitaciones y advertencias

- Solo soporta las 25 lenguas listadas; el texto en otras lenguas se tokeniza a caracteres o a `[UNK]`, degradando la calidad de forma severa.
- La poda del vocabulario introduce perdida de calidad medible frente al modelo fuente, especialmente en NanoMIRACL (6,68 puntos menos).
- Al ser un modelo estatico, no captura contexto dependiente del orden ni negaciones complejas: cada token contribuye con un unico vector independientemente de su posicion.
- Riesgo de alucinacion no aplica en el sentido generativo, pero la similitud de embeddings puede producir falsos positivos en retrieval sobre textos largos o ambiguos.
- No se han publicado datos sobre sesgos del modelo en la informacion disponible.
- La licencia MIT permite uso comercial sin restricciones conocidas, pero conviene verificar la licencia del modelo base hotchpotch/bekko-static-embedding-v1, no indicada en la informacion disponible.
- El identificador del autor aparece como `flowercomputers` en el ID de Hugging Face y como `flower-computer` en los ejemplos de codigo de la model card; verificar el nombre correcto antes de integrar en produccion.
- La longitud de contexto no esta documentada; en modelos estaticos el limite practico lo impone el truncamiento de la tokenizacion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/flowercomputers/bekko-static-v1-slim-50k
- Modelo base: https://huggingface.co/hotchpotch/bekko-static-embedding-v1
- Coleccion de la familia slim: https://huggingface.co/collections/flower-computer/bekko-static-v1-slim-6aecc3d4969e7752c8a5074f
- Variante 100k: https://huggingface.co/flower-computer/bekko-static-v1-slim-100k
- Variante 75k: https://huggingface.co/flower-computer/bekko-static-v1-slim-75k
- Variante 32k: https://huggingface.co/flower-computer/bekko-static-v1-slim-32k
- Crate `encoders` en crates.io: https://crates.io/crates/encoders
- Repositorio del crate: https://github.com/flowercomputers/encoders
