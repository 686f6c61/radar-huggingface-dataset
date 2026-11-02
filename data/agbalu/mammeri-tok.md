# agbalu/Mammeri-Tok

## Resumen

Mammeri-Tok es un conjunto de diez vocabularios SentencePiece Unigram para kabileño (taqbaylit, código ISO `kab`), una lengua bereber de Argelia escrita en alfabeto latino. Lo publica el usuario agbalu como artefacto de investigación reproducible: cinco tamanos de vocabulario (8k, 12k, 16k, 24k y 32k) en dos ramas de inicialización, una estándar y otra sembrada con un léxico de 395.834 entradas. No es un modelo de lenguaje, sino el tokenizador sobre el que se entrenan los modelos `Masinissa-31M` y `Belaid-31M` del mismo autor.

El interés del artefacto es metodológico. La model card documenta dos experimentos controlados con resultado negativo: la inicialización sembrada con léxico apenas cambia la longitud tokenizada (0,17% a 16k) y no altera ninguna medida morfológica, y ningún vocabulario de los diez representa el estado anexo del kabileño (0 de 15 pares comparten raíz). Se publican los diez vocabularios para que nadie repita ese trabajo.

El vocabulario por defecto es el de 16.000 piezas, entrenado sobre 3.041.989 frases normalizadas ortográficamente y con `byte_fallback` activado. La relevancia práctica está en la normalización previa: los tokenizadores kabileños publicados anteriormente penalizan entre un 17,8% y un 21,3% en tokens sobre texto bien escrito debido a la corrupción por homóglifos (épsilon griega por `ɛ` latina) horneada en las fusiones del vocabulario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SentencePiece Unigram (tokenizador, no modelo neuronal) |
| Parametros totales | no disponible (no aplica; tabla de embeddings de 3,07M a 12,29M según tamano a dimensión 384) |
| Parametros activos | no aplica |
| Longitud de contexto | no disponible (no aplica a un tokenizador) |
| Tipos de cuantizacion | no disponible (no aplica) |
| Idiomas soportados | kabileño (taqbaylit, `kab`), escritura latina |
| Licencia | Apache-2.0 |
| Formato de pesos | vocabulario SentencePiece Unigram (`.model`/`.vocab`); tamano de repo 0,0 GB |
| Tamanos de vocabulario | 8.000, 12.000, 16.000, 24.000, 32.000, en dos ramas (`base` y `seeded`) |
| Algoritmo | Unigram con `byte_fallback=True` |
| Cobertura de caracteres | 0.9995 |
| Regla de normalización | `identity` (el corpus ya es salida del normalizador) |
| Frases de entrada | 2.000.000 muestreadas de 3.041.989 |
| Semilla aleatoria | 20260807 |
| Versión de normalizador | 1.3.0+rules1.0.0 |
| Versión de tokenizador | 1.0.0 |

## Arquitectura y entrenamiento

El tokenizador usa el algoritmo Unigram de SentencePiece con `byte_fallback=True`, lo que garantiza cobertura total de bytes y explica las cero fallas de ida y vuelta en todos los tamanos. La regla de normalización se fija explícitamente en `identity` porque el corpus ya pasó por el normalizador de referencia; la normalización NMT por defecto de SentencePiece pliega caracteres que el kabileño necesita distinguir, en particular `ţ`, que una especificación publicada mapea a `ṭ` contra la evidencia del corpus. Además se fija `required_chars` sobre el inventario kabileño más `-` y `'`, ya que sin ello ranuras del vocabulario se filtran a escrituras que en conjunto suponen menos del 0,5% de los tokens.

El corpus, denominado AƔBALU-Text v1, consta de 3.041.989 frases deduplicadas procedentes de 42 fuentes con trazabilidad de procedencia, todas pasadas por el normalizador 1.3.0+rules1.0.0. Ese normalizador repara la corrupción sistemática por homóglifos del texto kabileño público (épsilon griega U+03B5 por `ɛ` latina U+025B, `γ` por `ɣ`), que afecta al 2,6-3,2% de las filas en las fuentes más grandes, preservando `ɣ ɛ ḥ ḍ ṣ ṭ ẓ ṛ č ǧ ţ` y las distinciones enfáticas y espirantizadas con carga semántica. La rama `seeded` inicializa el conjunto de candidatos Unigram desde un léxico kabileño de 395.834 entradas (258.221 formas sobre 32.914 lemas, más reglas de estado anexo y afijos Hunspell).

## Capacidades

- Segmentación de texto kabileño en subtokens para entrenamiento e inferencia de modelos de lenguaje.
- Compresión medida: fertilidad de 1,9355 tokens por palabra y 0,3288 tokens por carácter en el vocabulario base-16k sobre 30.000 frases retenidas (344.648 palabras, 2.028.636 caracteres).
- Cobertura completa de bytes mediante `byte_fallback`, con cero fallas de ida y vuelta en los diez vocabularios; las piezas de fallback de byte suponen entre el 0,65% y el 0,74% de los tokens.
- Representación atómica de clíticos: 72 de 72 casos de prueba permanecen como pieza única en todos los tamanos y ambas ramas.
- Preservación de caracteres del inventario kabileño gracias a `required_chars` explícito y normalización `identity`.
- No soporta tool calling, agentes, visión, audio ni generación de texto: es exclusivamente un tokenizador.

## Casos de uso

- Entrenamiento de modelos de lenguaje en kabileño desde cero: el vocabulario base-16k es el que usan `Masinissa-31M` y `Belaid-31M`, de modo que emplearlo garantiza compatibilidad exacta con los checkpoints publicados y con sus tablas de embeddings de 6.144.000 parámetros a dimensión 384.
- Construcción de corpus preentrenado de bajos recursos: la fertilidad de 1,9355 tokens por palabra permite estimar con precisión el presupuesto de tokens y el coste de entrenamiento antes de lanzar el job, algo crítico cuando el corpus disponible ronda los tres millones de frases.
- Evaluación comparativa de tokenizadores kabileños: los diez vocabularios permiten medir el efecto del tamano y de la inicialización sobre la longitud tokenizada sin entrenar nada, usando las 30.000 frases retenidas como conjunto de referencia.
- Normalización y limpieza de texto kabileño en pipelines de datos: el normalizador 1.3.0+rules1.0.0 corrige la corrupción por homóglifos que afecta al 2,6-3,2% de las filas de las fuentes públicas mayores, y aplicarlo antes de tokenizar evita la fragmentación en piezas de byte.
- Investigación lingüística computacional sobre morfología bereber: el conjunto de pruebas de estado anexo (15 pares) y de clíticos (72 casos) sirve como banco de evaluación reproducible para cualquier segmentador futuro, dado que documenta que la construcción de vocabulario por sí sola no factoriza el estado anexo.
- Sistemas de búsqueda y recuperación de información en kabileño: un tokenizador con fertilidad baja y cero fallas de ida y vuelta reduce el índice invertido y evita falsos negativos por variantes ortográficas corruptas.
- Despliegue en modelos pequeños de 31M de parámetros para dispositivos con recursos limitados: el vocabulario de 16k mantiene la tabla de embeddings en el 19,7% del total del encoder, frente al 33,0% que supondría un vocabulario de 32k.

## Benchmarks y rendimiento

Resultados sobre 30.000 frases retenidas (344.648 palabras, 2.028.636 caracteres). `fertility` es tokens por palabra; menor es más denso.

| Vocabulario | Fertility | Tokens/carácter | Piezas de palabra completa | Estado anexo | Clíticos | Params. embedding @384 |
|---|---:|---:|---:|:---:|:---:|---:|
| base-8k | 2,0915 | 0,3553 | 53,0% | 0/15 | 72/72 | 3.072.000 |
| base-12k | 1,9949 | 0,3389 | 55,8% | 0/15 | 72/72 | 4.608.000 |
| **base-16k** | **1,9355** | **0,3288** | **57,8%** | 0/15 | 72/72 | **6.144.000** |
| base-24k | 1,8621 | 0,3163 | 59,8% | 0/15 | 72/72 | 9.216.000 |
| base-32k | 1,8163 | 0,3086 | 60,7% | 0/15 | 72/72 | 12.288.000 |
| seeded-8k | 2,0895 | 0,3550 | 52,9% | 0/15 | 72/72 | 3.072.000 |
| seeded-12k | 1,9925 | 0,3385 | 55,9% | 0/15 | 72/72 | 4.608.000 |
| seeded-16k | 1,9322 | 0,3283 | 57,9% | 0/15 | 72/72 | 6.144.000 |
| seeded-24k | 1,8602 | 0,3160 | 59,9% | 0/15 | 72/72 | 9.216.000 |
| seeded-32k | 1,8146 | 0,3083 | 60,8% | 0/15 | 72/72 | 12.288.000 |

Datos adicionales reportados: cero fallas de ida y vuelta en todos los tamanos; piezas de fallback de byte entre 0,65% y 0,74% de los tokens; la rama sembrada cambia la longitud tokenizada un 0,17% a 16k (665.935 tokens frente a 667.068 sobre las mismas 344.648 palabras). Sobre tokenizadores kabileños publicados, la corrupción por homóglifos cuesta entre un 17,8% y un 21,3% más de tokens en texto correctamente escrito. No se han publicado resultados de benchmarks en la información disponible más allá de estas métricas intrínsecas de segmentación.

## Requisitos de hardware

- VRAM para inferencia: despreciable. Un tokenizador SentencePiece Unigram de 32k entradas ocupa del orden de megabytes; el repo completo mide 0,0 GB.
- GPU recomendadas: no aplica. La tokenización es una operación de CPU; no requiere acelerador.
- Cabe en cualquier GPU consumer y en CPU sin restricciones; también en entornos sin GPU.
- Opciones de despliegue: biblioteca `sentencepiece` directamente, `tokenizers` de Hugging Face con conversión, o cualquier framework que consuma vocabularios SentencePiece (transformers, fairseq, linugua). No aplica vLLM, llama.cpp ni TGI en su función de inferencia de modelos, aunque el vocabulario puede integrarse en ellos como componente del tokenizador de un LLM.
- Latencia y throughput: no disponibles en la información proporcionada. Como referencia cualitativa, la tokenización Unigram es lineal en el número de caracteres y se ejecuta en CPU a velocidades muy superiores a las de cualquier modelo neuronal.

## Comparativa con modelos similares

| Tokenizador | Idioma | Tamanos | Algoritmo | Byte fallback | Licencia | Artefactos publicados |
|---|---|---|---|---|---|---|
| Mammeri-Tok (agbalu) | kab | 8k-32k (10 variantes) | Unigram | Sí | Apache-2.0 | 10 vocabularios con métricas intrínsecas |
| Tokenizadores kabileños publicados (referenciados en la model card) | kab | no disponible | no disponible | no disponible | no disponible | no disponible; penalizan +17,8% a +21,3% en tokens por homóglifos |
| LTG-BERT (referencia citada) | multi | 16.384 | no disponible | no disponible | no disponible | línea ganadora de BabyLM con 100M palabras |

La model card no identifica por nombre los tokenizadores kabileños previos con los que se compara, solo reporta la penalización medida. No se dispone de comparativa con otros tokenizadores bereberes (por ejemplo, variantes para tachelhit o tamazight estándar) en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona y no responde a instrucciones. Cualquier uso como modelo conversacional es un error de categoría.
- El estado anexo no está representado: 0 de 15 pares comparten raíz en todos los tamanos y ambas ramas; ambas formas se memorizan completas y Viterbi prefiere la palabra entera por 9 nats. Cualquier sistema que dependa de compartir raíz entre estados debe resolverlo en el modelo, en el objetivo o en una capa morfológica explícita.
- La inicialización sembrada con léxico no aporta beneficio medible y no debe reintentarse sin un cambio de planteamiento.
- Obligación de normalizar antes de tokenizar: el vocabulario se entrenó con `ɛ` en U+025B y nunca con épsilon griega. La entrada corrupta por homóglifos se fragmenta en piezas de byte y afecta al 2,6-3,2% de los corpus semilla del proyecto.
- La licencia Apache-2.0 cubre los ficheros de vocabulario, no el texto con el que se construyeron. La composición del corpus de entrenamiento es: 34,9% con licencia no resoluble (1.062.569 frases), 32,0% permisiva (973.218), 31,0% share-alike (944.438) y 2,0% no comercial (61.764). El 34,9% "unclear" es ausencia de licencia resoluble, no permiso implícito; esto puede condicionar la redistribución de derivados en entornos corporativos con políticas estrictas de procedencia.
- La elección de 16k no se basa en una medición downstream, sino en el equilibrio entre compresión y coste de embeddings (19,7% del encoder de 31,1M frente a 33,0% del de 37,3M a 32k) y en la convención de LTG-BERT. El propio autor indica que la decisión debería revisarse con una evaluación downstream.
- Cobertura monolingüe: solo kabileño. No hay soporte para otras variedades bereberes ni para code-switching con árabe o francés, frecuente en el contexto argelino real.
- Sin descargas ni likes en el momento de la consulta, lo que implica ausencia de validación externa por parte de la comunidad.
- No se han publicado evaluaciones en tareas downstream (perplejidad, GLUE-style, generación) que confirmen que la mejora intrínseca se traduce en mejor rendimiento del modelo final.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/agbalu/Mammeri-Tok
- Modelo entrenado sobre el vocabulario por defecto: https://huggingface.co/agbalu/Masinissa-31M
- Segundo modelo entrenado sobre el vocabulario por defecto: https://huggingface.co/agbalu/Belaid-31M
