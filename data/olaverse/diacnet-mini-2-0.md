# olaverse/diacnet-mini-2.0

## Resumen

diacnet-mini-2.0 es un modelo encoder-decoder de nivel de byte (byte-level) especializado en la restauración de diacríticos, marcas tonales y vocales árabes (tashkeel) sobre texto plano. Lo desarrolla olaverse y se obtiene por fine-tuning de google/byt5-small, del que hereda su arquitectura ByT5-small con 12 capas de encoder, 4 de decoder, dimensión de modelo 1472 y 6 cabezas de atención. Con 299.637.760 parámetros (unos 300M) y un único modelo cubre 11 idiomas, entre ellos yoruba, igbo, hausa, vietnamita, árabe, polaco, turco, portugués, español, francés e italiano.

El problema que resuelve es concreto: buena parte del texto digital en estos idiomas circula sin acentos ni marcas tonales, lo que introduce ambigüedad semántica y dificulta tareas posteriores de TTS, traducción o búsqueda. diacnet-mini-2.0 recibe texto desnudo y devuelve el texto con sus marcas restauradas, con etiquetas de idioma explícitas (`<yor>`, `<ibo>`, `<ara>`, etc.) o detección automática mediante `<auto>`.

Es relevante ahora porque unifica en un solo checkpoint de 300M lo que habitualmente requiere modelos separados por idioma, incluye árabe con y sin marcas de caso (`<ara>` y `<ara-nocase>`) y ofrece un helper de alineación que garantiza que el texto de entrada nunca se altera: solo se añaden marcas sobre las letras conservadas. Según la model card, mejora a diactag-2.0 en 5 de 10 idiomas y reduce el error en yoruba de 0,174 a 0,081 frente a diacnet-1.1.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ByT5-small (encoder-decoder transformer byte-level), 12 capas encoder + 4 decoder, d_model 1472, 6 cabezas |
| Parametros totales | 299.637.760 (~300M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | ~300 caracteres por llamada; el helper del autor trocea textos más largos |
| Tipos de cuantizacion | no disponible (pesos publicados en fp32 safetensors de 1,2 GB) |
| Idiomas soportados | yo, ig, ha, vi, pl, tr, pt, es, fr, it, ar |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (fp32); repo de 2,4 GB |

## Arquitectura y entrenamiento

diacnet-mini-2.0 es un modelo texto-a-texto construido sobre ByT5-small, la variante byte-level de la familia T5. Al operar sobre bytes en lugar de tokens subword, maneja de forma nativa alfabetos con diacríticos combinatorios (marcas tonales yoruba, puntos bajo igbo, ganchos hausa, tonos vietnamitas, harakat árabes) sin depender de un tokenizador específico por idioma. La arquitectura declarada es de 12 capas de encoder y 4 de decoder, con dimensión 1472 y 6 cabezas de atención, lo que da los ~300M parámetros publicados.

El entrenamiento se realizó por fine-tuning sobre google/byt5-small usando los datasets olaverse/diacnet-1.1-train y olaverse/diacbench, según los metadatos del repositorio. La model card no detalla el número exacto de tokens de entrenamiento ni la composición completa del dataset, ni confirma el uso de RLHF o DPO; esos datos figuran como no disponibles. Sí se documentan innovaciones de uso destacables: el modo de pistas de significado `[g: word=meaning]` para palabras cuya acentuación depende del sentido (mejora la precisión en vietnamita de 0,53 a 0,78 según el autor), la preservación de marcas ya presentes en la entrada (99,9–100 %) y la función `align` que reconcilia la salida con la entrada para no modificar ninguna letra.

## Capacidades

- Restauración de diacríticos y marcas tonales en 11 idiomas desde un único checkpoint de 300M.
- Diacritización árabe completa (`<ara>`, DER 0,110 en árabe clásico) y modo sin marcas de caso (`<ara-nocase>`, DER 0,082).
- Detección automática de idioma con `<auto>`, con una desviación de tasa de error de solo 0,0012 respecto a la etiqueta explícita según la model card.
- Pistas de significado mediante `[g: word=meaning]` para desambiguar palabras cuya acentuación depende del contexto.
- Conservación de marcas ya presentes en el texto de entrada y relleno del resto.
- Alineación de salida garantizada: el helper mantiene todas las letras originales y solo incorpora marcas, con cumplimiento del 100 % por construcción.
- Corrección de erratas en la salida cruda (sin alineación), si se desea.
- Procesamiento por trozos de ~300 caracteres con batching recomendado para textos largos.

## Casos de uso

- Preprocesado para TTS en yoruba, igbo y hausa: restaurar tonos y puntos diacríticos antes de sintetizar voz evita pronunciaciones erróneas, ya que el modelo devuelve el texto acentuado listo para el front-end fonético.
- Normalización de corpus web para búsqueda y recuperación: acentuar texto desnudo permite indexar formas canónicas y mejorar la coincidencia en consultas con diacríticos en español, francés, italiano o portugués.
- Enriquecimiento de subtítulos y transcripciones: pasar transcripciones ASR (que suelen perder acentos) por diacnet-mini-2.0 para publicar subtítulos correctos en vietnamita o polaco.
- Diacritización árabe para edición y publicación: usar `<ara>` para texto clásico con harakat completas o `<ara-nocase>` cuando no se desean marcas de caso, integrándolo en pipelines editoriales.
- Limpieza de datasets para entrenamiento de LLM: aplicar el modelo como paso previo para que los corpus multilingües mantengan ortografía correcta antes de alimentar modelos mayores.
- Integración vía API sin GPU: el autor ofrece el endpoint `POST /v1/diacritize` en la API de Olaverse, útil para aplicaciones que no quieren desplegar infraestructura propia.
- Corrección ortográfica ligera: la salida cruda (sin alinear) corrige erratas además de restaurar marcas, aprovechable en formularios o chats.

## Benchmarks y rendimiento

Datos publicados en la model card (tasa de error; menor es mejor):

| Idioma / prueba | diacnet-mini-2.0 | Referencia |
|---|---|---|
| Yorùbá (DER) | 0,081 | diacnet-1.1: 0,174 |
| Yorùbá (frases exactas) | 9 % | diacnet-1.1: 0,8 % |
| Árabe clásico (DER, `<ara>`) | 0,110 | no disponible |
| Árabe sin marcas de caso (DER, `<ara-nocase>`) | 0,082 | no disponible |
| Vietnamita (precisión con pistas de significado) | 0,78 | 0,53 sin pistas |
| `<auto>` vs etiqueta explícita | diferencia ≤ 0,0012 | no disponible |
| Polaco, portugués, español, francés, italiano | mejor que diactag-2.0 con alineación | diactag-2.0 |
| Hausa | idéntico a diactag-2.0 con alineación | diactag-2.0 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible; el modelo no está orientado a esas tareas.

## Requisitos de hardware

- VRAM estimada: el checkpoint fp32 ocupa 1,2 GB; en bf16 ronda los 0,6 GB de pesos, más memoria de activaciones. Cabe holgadamente en cualquier GPU consumer con 4 GB o más.
- GPU recomendadas: RTX 3060/4060 y superiores para uso interactivo; A100/H100 no son necesarias por el tamaño, aunque aceleran el batching.
- Cabe en GPU consumer: sí, en cualquier tarjeta con 4-8 GB de VRAM; también funciona en CPU en float32 (más lento).
- Opciones de despliegue: transformers (AutoModelForSeq2SeqLM), text-generation-inference (etiqueta del repo) y endpoints compatibles; para CPU pura puede exportarse a otros runtimes, aunque no se documenta GGUF.
- Latencia y throughput: no disponibles de forma oficial; el autor recomienda batching de entradas de longitud similar con `padding="longest"` y ejecución en GPU en bf16 para mejorar el rendimiento.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| diacnet-mini-2.0 | ~300M | 11 | ~300 caracteres/llamada | Apache 2.0 | Un solo modelo multilingüe; alineación garantizada |
| diactag-2.0 | no disponible | varios (incluye pl, pt, es, fr, it, ha) | no disponible | no disponible | Superado por diacnet-mini-2.0 en 5 de 10 idiomas con alineación |
| diacnet-1.1 | no disponible | varios | no disponible | no disponible | Predecesor; peor en yoruba (DER 0,174 frente a 0,081) |
| google/byt5-small | ~300M | multilingüe base | no especificado | Apache 2.0 | Modelo base sin fine-tuning para diacríticos |

## Limitaciones y advertencias

- Entrada limitada a ~300 caracteres por llamada; textos largos requieren troceado manual, con riesgo de perder contexto entre fragmentos.
- Sesgos lingüísticos no documentados: la cobertura por idioma puede ser desigual y no se detalla la composición del corpus de entrenamiento.
- Riesgo de alucinación ortográfica: el modelo puede alterar letras en la salida cruda (por eso existe el helper de alineación); sin alineación, el texto de entrada no está garantizado.
- La corrección de erratas en la salida cruda puede cambiar palabras no previstas si se usa sin alineación.
- Las pistas de significado `[g: word=meaning]` requieren preparación manual y no se generan automáticamente.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las condiciones de los datasets de entrenamiento (diacnet-1.1-train y diacbench) si se redistribuye.
- No es un modelo generativo general: no debe emplearse para razonamiento, código o conversación; su pipeline declarado es text-generation pero su función real es la diacritización.
- No se han publicado evaluaciones independientes ni benchmarks estándar; las cifras proceden de la model card del autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/olaverse/diacnet-mini-2.0
- Modelo base: https://huggingface.co/google/byt5-small
- Predecesor: https://huggingface.co/olaverse/diacnet-1.1
- Modelo comparado: https://huggingface.co/olaverse/diactag-2.0
- Dataset de entrenamiento: https://huggingface.co/datasets/olaverse/diacnet-1.1-train
- Benchmark: https://huggingface.co/datasets/olaverse/diacbench
- Consola de desarrollador de la API: https://console.olaverselab.com
- Documentación de la API de diacríticos: https://docs.olaverselab.com/api/diacritics/
