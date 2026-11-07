# flowercomputers/bekko-static-v1-slim-75k

## Resumen

bekko-static-v1-slim-75k es un modelo de embeddings estáticos (static embeddings) derivado de hotchpotch/bekko-static-embedding-v1 mediante poda de vocabulario. Lo desarrolla flowercomputers y su propósito es ofrecer recuperación de información multilingüe (retrieval) con un coste computacional mínimo: no contiene transformer, sino una tabla de búsqueda de tokens seguida de mean pooling. El resultado es un modelo de 76,8 millones de parámetros, 1024 dimensiones nativas con soporte Matryoshka de 32 a 1024, y un vocabulario reducido de 75.000 WordPiece frente a los 200.000 del modelo original.

La relevancia del modelo reside en su relación calidad/tamaño: conserva 25 idiomas y mantiene buena parte de la calidad de recuperación del modelo fuente con una huella de 154 MB en fp16 (0,2 GB de repositorio), lo que permite desplegarlo en entornos con memoria muy limitada, sin GPU y con inferencia puramente de consulta de tabla. Está pensado para pipelines de búsqueda semántica, deduplicación y clustering donde el coste por embedding es el factor crítico.

La poda no es gratuita: cada token eliminado obliga a re-tokenizar las palabras que lo usaban en piezas más cortas cuyos vectores fueron entrenados para otros contextos. El autor ordena los tokens por "daño esperado de eliminación" (frecuencia en corpus multiplicada por la distancia entre el vector del token y la suma de los vectores de sus piezas de respaldo), de modo que la pérdida de calidad se concentra en los tokens menos útiles para los benchmarks de recuperación multilingüe reportados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Embedding estático (token lookup + mean pooling, sin transformer) |
| Parámetros totales | 76.800.000 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo estático; sin ventana de atención) |
| Tipos de cuantización | int8, int16 (por defecto en el crate `encoders`), float32; anchos Matryoshka 1024/512/256/128/64/32 |
| Idiomas soportados | 25: en, ar, bn, de, es, fa, fi, fr, hi, id, it, ja, ko, nl, no, pt, ru, sr, sv, sw, te, th, vi, yo, zh |
| Licencia | MIT |
| Formato de pesos | safetensors (sentence-transformers); integrable en binario vía crate Rust `encoders` |

## Arquitectura y entrenamiento

El modelo no es un transformer: es un embedding estático compuesto por una tabla de vectores por token WordPiece y un pooling de media sobre los vectores de los tokens de entrada. Las dimensiones nativas son 1024, con truncamiento Matryoshka a 512, 256, 128, 64 y 32 sin reentrenamiento. Al no haber capas de atención, la "ventana de contexto" no aplica en el sentido habitual: el coste es lineal en el número de tokens y el modelo procesa la secuencia completa que se le entregue, limitada por el tokenizador y la memoria del pipeline.

El entrenamiento hereda el del modelo base hotchpotch/bekko-static-embedding-v1 (no se detalla en la información disponible el número de tokens, la composición del dataset ni si hubo RLHF/DPO). La innovación propia de esta variante es el procedimiento de poda de vocabulario: los tokens se ordenan por utilidad, definida como frecuencia en corpus multiplicada por la norma de la diferencia entre el vector del token y la suma de los vectores de las piezas a las que se degrada al eliminarlo; el proceso se ejecuta en rondas (se descarta el 10 % menos útil, se re-tokeniza y se recalculan las puntuaciones de los tokens cuyo respaldo cambió) hasta truncar en 75.000 piezas. El espacio de embeddings se mantiene alineado con el del modelo fuente, ya que solo se eliminan filas de la tabla.

## Capacidades

- Generación de embeddings de frase y documento para similitud semántica y recuperación (pipeline `sentence-similarity` y `feature-extraction`).
- Recuperación multilingüe en 25 idiomas, evaluada en MNanoBEIR, NanoMIRACL y NanoMLDR (más neerlandés).
- Dimensiones Matryoshka: truncamiento a 512, 256, 128, 64 y 32 dimensiones con degradación gradual y medida.
- Cuantización de la tabla a int8 e int16, con int16 prácticamente indistinguible de float32 según el autor.
- Uso sin prompts ni prefijos: consultas y documentos se codifican igual, como en el modelo fuente.
- Integración nativa en Rust mediante el crate `encoders`, que compila el modelo en el binario en tiempo de build, sin Python ni descarga en runtime.
- Paralelización de lotes con la feature `rayon` del crate.
- No soporta tool calling, agentes, razonamiento multi-paso, visión ni audio: es exclusivamente un codificador de texto a vectores.

## Casos de uso

- Búsqueda semántica de baja latencia en producción: al ser una consulta de tabla más mean pooling, el coste por embedding es mínimo y permite indexar y consultar corpus grandes sin GPU, usando el truncamiento Matryoshka a 256 o 128 dimensiones para reducir memoria del índice vectorial.
- Deduplicación de documentos a gran escala: comparar embeddings de pasajes para detectar near-duplicates en pipelines de ingesta, con la ventaja de que el modelo cabe en 154 MB en fp16 y puede ejecutarse en el propio proceso de ingesta.
- Clustering y etiquetado temático de corpus multilingües: agrupar artículos, tickets o reseñas en 25 idiomas en un mismo espacio vectorial, útil para taxonomías y análisis exploratorio.
- Filtrado previo en arquitecturas de recuperación en dos etapas: usar el modelo como retriever barato que reduce candidatos antes de un cross-encoder o un LLM, reduciendo el coste total del pipeline RAG.
- Aplicaciones embebidas y de borde: el crate `encoders` compila el modelo en el binario Rust, lo que permite búsqueda semántica en aplicaciones de escritorio, CLI o dispositivos sin intérprete de Python ni acceso a red en runtime.
- Moderación y enrutado de contenido por similitud: clasificar mensajes de usuario contra un conjunto de prototipos vectoriales (por ejemplo, categorías de soporte) con latencia de microsegundos y sin dependencia de GPU.
- Sistemas de recomendación basados en contenido: generar embeddings de descripciones de ítems en varios idiomas y calcular similitud coseno para recuperación de candidatos en tiempo real.

## Benchmarks y rendimiento

Resultados publicados por el autor (nDCG@10 × 100, 1024 dimensiones):

| Modelo | Vocab · tamaño fp16 | Idiomas | NanoBEIR-en | MNanoBEIR | NanoMIRACL |
|---|---|---:|---:|---:|---:|
| hotchpotch/bekko-static-embedding-v1 (fuente) | 200k · 410 MB | 40 | 53,71 | 43,71 | 68,03 |
| bekko-static-v1-slim-100k | 100k · 205 MB | 25 | 52,91 | 42,98 | 66,53 |
| **bekko-static-v1-slim-75k** | 75k · 154 MB | 25 | 52,09 | 42,15 | 64,51 |
| bekko-static-v1-slim-50k | 50k · 102 MB | 25 | 50,22 | 40,37 | 61,35 |
| bekko-static-v1-slim-32k | 32k · 66 MB | 14 | 49,31 | 39,86 | 49,25 |

Matriz de vocabulario × dimensiones para NanoBEIR-en (nDCG@10 × 100):

| vocab \ dims | 1024 | 512 | 256 | 128 | 64 |
|---|---:|---:|---:|---:|---:|
| 200k (fuente) | 53,71 | 52,84 | 50,84 | 47,82 | 43,96 |
| 100k | 52,91 | 52,13 | 50,05 | 47,03 | 42,84 |
| 75k | 52,09 | 51,62 | 48,72 | 46,36 | 40,78 |
| 50k | 50,22 | 49,39 | 47,12 | 44,44 | 38,03 |
| 32k | 49,31 | 48,39 | 46,16 | 42,53 | 36,51 |

Matriz equivalente para MNanoBEIR (nDCG@10 × 100):

| vocab \ dims | 1024 | 512 | 256 | 128 | 64 |
|---|---:|---:|---:|---:|---:|
| 200k (fuente) | 43,71 | 42,83 | 41,03 | 38,03 | 32,87 |
| 100k | 42,98 | 42,07 | 40,39 | 37,08 | 32,13 |
| 75k | 42,15 | 41,28 | 39,28 | 36,04 | 30,87 |
| 50k | 40,37 | 39,35 | 37,60 | 34,26 | 28,49 |
| 32k | 39,86 | 38,88 | 36,85 | 33,12 | 27,50 |

Matriz equivalente para NanoMIRACL (nDCG@10 × 100):

| vocab \ dims | 1024 | 512 | 256 | 128 | 64 |
|---|---:|---:|---:|---:|---:|
| 200k (fuente) | 68,03 | 67,67 | 66,47 | 63,99 | 58,33 |
| 100k | 66,53 | 66,01 | 64,76 | 62,09 | 55,75 |
| 75k | 64,51 | 63,96 | 62,42 | 59,59 | 53,07 |
| 50k | 61,35 | 60,73 | 59,41 | 55,70 | 48,19 |
| 32k | 49,25 | 48,60 | 47,19 | 44,10 | 36,47 |

No se han publicado en la información disponible resultados de MMLU, HumanEval o GSM8K, que no aplican a un modelo de embeddings.

## Requisitos de hardware

- VRAM estimada: no requiere GPU para inferencia. La tabla completa ocupa 154 MB en fp16, aproximadamente 77 MB en int8 y 154 MB en int16.
- GPU recomendadas: cualquiera con suficiente memoria para el índice vectorial; el modelo en sí cabe en CPU. Para lotes masivos, una RTX 4090, A100 o H100 aceleran el pooling, pero no son necesarias.
- Cabe en cualquier GPU de consumo e incluso en dispositivos sin GPU; el cuello de botella es el índice vectorial, no el modelo.
- Opciones de despliegue: sentence-transformers (Python), crate Rust `encoders` con features `bekko-static-v1-slim-75k`, `mrl-512` a `mrl-32`, `int8`/`int16`/`float32` y `rayon`. No se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a embeddings estáticos.
- Latencia y throughput: no se publican cifras concretas en la información disponible; al ser una consulta de tabla más mean pooling, la latencia es del orden de microsegundos por frase en CPU, muy inferior a la de un transformer del mismo tamaño nominal.

## Comparativa con modelos similares

| Modelo | Parámetros | Vocab | Idiomas | NanoBEIR-en | MNanoBEIR | Licencia | Tamaño fp16 |
|---|---|---:|---:|---:|---:|---|---:|
| **bekko-static-v1-slim-75k** | 76,8 M | 75k | 25 | 52,09 | 42,15 | MIT | 154 MB |
| bekko-static-v1-slim-100k | no disponible | 100k | 25 | 52,91 | 42,98 | MIT | 205 MB |
| bekko-static-v1-slim-50k | no disponible | 50k | 25 | 50,22 | 40,37 | MIT | 102 MB |
| hotchpotch/bekko-static-embedding-v1 | no disponible | 200k | 40 | 53,71 | 43,71 | no disponible | 410 MB |

Frente a los transformers de embeddings (tipo E5, BGE o GTE), el modelo sacrifica calidad de recuperación a cambio de un coste de inferencia órdenes de magnitud menor; no se dispone en la información proporcionada de comparaciones numéricas directas con esos modelos.

## Limitaciones y advertencias

- Solo soporta texto en los 25 idiomas listados. Texto en otros idiomas se tokeniza a caracteres o `[UNK]`, con degradación severa de la calidad.
- La poda de vocabulario degrada la recuperación respecto al modelo fuente: aproximadamente 1,6 puntos de nDCG@10 en NanoBEIR-en, 1,6 en MNanoBEIR y 3,5 en NanoMIRACL.
- El truncamiento Matryoshka reduce la calidad de forma medible: a 256 dimensiones se pierden unos 3,4 puntos en NanoBEIR-en y a 64 dimensiones más de 11 puntos.
- Riesgo de alucinación no aplica (no genera texto); el riesgo equivalente es la pérdida de señal semántica en palabras raras, nombres propios o dominios especializados cuyos tokens fueron podados.
- No hay información sobre sesgos de género, etnia o idioma en los datos de entrenamiento del modelo fuente.
- Licencia MIT, que permite uso comercial sin restricciones adicionales conocidas; conviene verificar la licencia del modelo base hotchpotch/bekko-static-embedding-v1, no indicada en la información disponible.
- El modelo se creó y actualizó en noviembre de 2026 y registra 0 descargas, por lo que carece de validación comunitaria independiente.
- No debe usarse para tareas generativas, razonamiento, código o matemáticas: es exclusivamente un codificador de texto a vectores.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/flowercomputers/bekko-static-v1-slim-75k
- Colección de la familia slim: https://huggingface.co/collections/flower-computer/bekko-static-v1-slim-6aecc3d4969e7752c8a5074f
- Modelo base: https://huggingface.co/hotchpotch/bekko-static-embedding-v1
- Variante de 100k: https://huggingface.co/flower-computer/bekko-static-v1-slim-100k
- Variante de 50k: https://huggingface.co/flower-computer/bekko-static-v1-slim-50k
- Variante de 32k: https://huggingface.co/flower-computer/bekko-static-v1-slim-32k
- Crate Rust `encoders`: https://crates.io/crates/encoders
- Repositorio del crate: https://github.com/flowercomputers/encoders
- Blog del modelo base (referenciado en la model card del original): no disponible como URL directa en la información proporcionada
