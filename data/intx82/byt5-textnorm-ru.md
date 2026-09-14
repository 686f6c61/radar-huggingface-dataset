# intx82/byt5-textnorm-ru

## Resumen

byt5-textnorm-ru es un modelo de normalización de texto en ruso desarrollado por el usuario intx82, pensado para convertir formas escritas (números, fechas, horas, medidas, porcentajes, fracciones, expresiones matemáticas y referencias) en su representación hablada, preservando el resto de la frase. Se trata de un fine-tuning de google/byt5-small, un encoder-decoder T5 que opera a nivel de byte en lugar de usar un vocabulario de subpalabras, lo que le permite manejar cualquier carácter sin tokens desconocidos. Su uso principal declarado es servir como etapa de preprocesado para sistemas TTS en ruso, donde leer "18:45" como "восемнадцать сорок пять" es un requisito previo ineludible.

El modelo cuenta con 299.637.760 parámetros (unos 300 millones), un tamaño de repositorio de 1,2 GB (pesos en fp32) y una longitud de entrada de 200 tokens durante el entrenamiento, con un máximo de 384 tokens de salida. Se distribuye bajo licencia Apache 2.0, la misma que el modelo base, lo que permite uso comercial sin restricciones adicionales.

Su relevancia actual radica en que la normalización de texto (*text normalization*) sigue siendo uno de los cuellos de botella clásicos de los pipelines TTS en ruso: las soluciones basadas en reglas y transductores de estados finitos cubren bien los casos canónicos, pero fallan en contextos gramaticales ambiguos, mientras que los modelos neuronales pequeños como este ofrecen una alternativa más flexible con coste de inferencia muy bajo. El autor reporta un proceso de entrenamiento iterativo con generación de datasets, ejemplos difíciles y etapas correctivas, además de una evaluación independiente sobre 1.000 frases con alta densidad numérica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ByT5 / T5 encoder-decoder (transformer byte a byte) |
| Parametros totales | 299.637.760 |
| Parametros activos | no aplica (arquitectura densa, no MoE) |
| Longitud de contexto | 200 tokens de entrada (longitud máxima usada en entrenamiento); 384 tokens de salida máxima |
| Tipos de cuantizacion | no disponible; el repositorio solo publica pesos en safetensors (fp32, ~1,2 GB) |
| Idiomas soportados | ruso (ru) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Modelo base | google/byt5-small |
| Pipeline declarado | other (text2text-generation) |
| Libreria | transformers |
| Tamano del repositorio | 1,2 GB |
| Compatibilidad declarada | text-generation-inference, endpoints_compatible |
| Descargas / likes en HuggingFace | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es la de ByT5, una variante de T5 que elimina el tokenizador de subpalabras y trabaja directamente sobre bytes UTF-8 tanto en el encoder como en el decoder. Esto implica que cada carácter cirílico consume varios bytes (habitualmente dos en UTF-8), por lo que las secuencias efectivas son más largas que en un modelo con vocabulario subword y el coste de inferencia por frase aumenta en consecuencia. Al no depender de un vocabulario cerrado, el modelo no sufre problemas de tokens fuera de vocabulario, algo relevante en normalización, donde aparecen símbolos, cifras y formatos heterogéneos. Se desconoce el número exacto de capas, dimensión oculta y cabezas de atención a partir de la información proporcionada; esos valores corresponden a la configuración de google/byt5-small y no se detallan en la model card.

El entrenamiento se realizó en varias etapas sucesivas de generación de datasets, incorporación de ejemplos difíciles, ejemplos correctivos y fine-tuning. En total se generaron 238.023 ejemplos de entrada únicos entre todos los conjuntos empleados, y el conjunto final de fine-tuning quedó repartido en 37.046 ejemplos de entrenamiento, 1.446 de validación y 1.520 de test (40.012 en total), con firma de dataset `a26a3b376f8f5796`. Los datos se produjeron mediante reglas deterministas de normalización, generación y revisión asistidas por modelo, validación semántica, validación lingüística y verificación determinista. Las etapas finales priorizaron ejemplos difíciles y correctivos en lugar de ampliar volumen genérico. La decodificación empleada en evaluación es greedy (`num_beams=1`, `do_sample=False`). No se menciona en la información disponible el uso de RLHF, DPO u otras técnicas de alineación por preferencias.

## Capacidades

- Normalización de texto en ruso: convierte formas escritas de números, fechas, horas, medidas, porcentajes, fracciones, expresiones matemáticas y referencias a su forma hablada, manteniendo intacto el resto de la frase.
- Generación seq2seq de texto a texto: al ser un modelo encoder-decoder T5, puede emplearse para cualquier tarea de transformación texto-texto dentro de su dominio de entrenamiento.
- Manejo de entradas multibyte sin tokenizador subword: procesa carácter a carácter a nivel de byte, sin tokens desconocidos.
- Preservación de contexto oracional: no se limita a sustituir cifras aisladas, sino que reescribe la oración completa con las formas habladas insertadas.
- Preprocesado para TTS: la salida está pensada para ser consumida directamente por un sintetizador de voz en ruso.
- Tool calling / function calling: no disponible; no se documenta soporte alguno.
- Capacidades de agente o razonamiento multi-paso: no disponible; el modelo está especializado en una única transformación.
- Capacidades multilingües: no; el modelo está entrenado y evaluado exclusivamente en ruso.
- Capacidades especiales (modo thinking, visión, audio): ninguna documentada. No es multimodal ni dispone de modo de razonamiento explícito.

## Casos de uso

- Preprocesado de pipelines TTS en ruso: es el caso de uso principal declarado. Se inserta como etapa previa al sintetizador para convertir cifras, horas y fechas en palabras antes de la síntesis, evitando que el motor TTS lea los símbolos de forma incorrecta o los omita.
- Audiolibros y narración automática: al normalizar oraciones completas preservando el contexto, permite generar versiones habladas de textos literarios o divulgativos que contienen cifras dispersas, sin necesidad de reglas manuales por tipo de expresión.
- Sistemas de voz interactiva (IVR) en ruso: en centralitas telefónicas y asistentes de voz, los datos dinámicos como importes, plazos o referencias llegan en formato escrito desde el backend; este modelo los convierte a forma hablada antes de sintetizarlos.
- Lectura en voz alta de material educativo y matemático: el benchmark independiente sobre el corpus del libro de matemáticas OMath muestra un 97,66% de validez semántica en la categoría matemática, lo que respalda su uso para narrar apuntes, ejercicios y manuales con expresiones numéricas abundantes.
- Accesibilidad para lectores de pantalla: integrado en herramientas de accesibilidad, permite que documentos rusos con fechas, medidas y cifras se lean de forma inteligible para personas con discapacidad visual.
- Doblaje y generación de pódcast automatizados: en flujos de producción de audio a partir de guiones escritos, la etapa de normalización garantiza que las cifras del guion se pronuncien correctamente antes de la síntesis, reduciendo las regrabaciones manuales.
- Normalización de datos financieros o periodísticos: boletines, informes y noticias con porcentajes, rangos y cifras monetarias pueden transformarse a forma hablada para versiones audio o para sistemas de lectura automatizada.
- Preparación de corpus para entrenamiento de TTS: el propio modelo puede emplearse para normalizar grandes volúmenes de texto ruso y generar datos de entrenamiento alineados texto-habla.

## Benchmarks y rendimiento

Validación controlada final reportada por el autor:

| Metrica | Resultado |
|---|---|
| Exact match | 78,01% |
| CER (tasa de error de caracteres) | 2,32% |
| Validez semantica | 89,56% |
| Validez segun verificador | 82,23% |

Benchmark independiente OMath (1.000 frases rusas con alta densidad numérica, no vistas en entrenamiento, revisión de fuente `a337a64825f6dcbbb7f96aded2622593689b1d4e`):

| Metrica | Resultado |
|---|---|
| Muestras | 1.000 |
| Exact match | 10,1% |
| Validez semantica | 92,1% |
| Validez segun verificador | 91,6% |

Desglose por categoría en el benchmark OMath (tasa de validez semántica):

| Categoria | Muestras | Validez semantica |
|---|---|---|
| Math | 555 | 97,66% |
| Cardinal | 246 | 77,24% |
| Mixed | 104 | 95,19% |
| Fraction | 33 | 90,91% |
| Measure | 11 | 100% |
| Ordinal | 10 | 100% |
| Range | 6 | 100% |
| Duration | 7 | 100% |

El propio autor advierte que el exact match es intencionadamente estricto, ya que una misma forma escrita admite varias realizaciones habladas válidas, por lo que subestima la precisión semántica real. No se han publicado comparaciones con otros modelos de normalización en la información disponible.

## Requisitos de hardware

- VRAM estimada en fp32: alrededor de 1,2 GB solo para los pesos, más activaciones y caché; en la práctica cabe holgadamente en menos de 2 GB.
- VRAM estimada en fp16/bf16: en torno a 0,6 GB para los pesos.
- VRAM estimada en int8: aproximadamente 0,3 GB, si se aplica cuantización dinámica con herramientas de transformers.
- GPU recomendadas: cualquier GPU con 4 GB o más de VRAM es suficiente; una RTX 3060, RTX 4060, RTX 4090, A100 o H100 lo ejecutan sin dificultad. El modelo está sobredimensionado para GPUs de gama alta.
- Compatibilidad con GPU de consumo: sí, cabe en cualquier GPU de consumo moderna e incluso en GPUs integradas con memoria compartida. También es viable la inferencia en CPU, dado el tamaño y la naturaleza byte a byte del modelo.
- Opciones de despliegue: transformers con PyTorch (opción documentada en la model card), HuggingFace Inference Endpoints (el repositorio está marcado como `endpoints_compatible`) y Text Generation Inference (etiqueta `text-generation-inference`). El soporte en vLLM, llama.cpp, Ollama o TGI para la variante ByT5 byte a byte no está confirmado en la información disponible; conviene verificarlo antes de desplegar.
- Latencia y throughput: no disponible. Como referencia cualitativa, al operar sobre bytes en lugar de subpalabras el número de tokens por frase es varias veces superior al de un modelo T5 equivalente con tokenizador, lo que reduce el throughput respecto a un modelo subword del mismo tamaño de parámetros.
- Nota de despliegue: el tokenizador debe cargarse con `use_fast=False`, tal como indica el ejemplo oficial, para respetar el comportamiento byte a byte.

## Comparativa con modelos similares

| Modelo | Parametros | Enfoque | Contexto | Normalizacion en ruso | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| intx82/byt5-textnorm-ru | 299,6 M | ByT5 fine-tuneado, byte a byte | 200 tokens entrada / 384 salida | Especifica para ruso; 78,01% exact match en validacion controlada | Apache 2.0 | HuggingFace, safetensors |
| google/byt5-small (base) | 299,6 M | ByT5 preentrenado, byte a byte | Segun configuracion del modelo base (no detallada aqui) | No especializado; no realiza normalización de forma fiable sin fine-tuning | Apache 2.0 | HuggingFace, safetensors |
| google/mt5-small | 300 M aprox. | T5 multilingue con tokenizador SentencePiece | No disponible en la informacion proporcionada | No especializado en normalización de ruso | Apache 2.0 | HuggingFace |
| Pipelines basados en reglas (WFST, pynini, gramaticas propias) | no aplica | Transductores deterministas escritos a mano | no aplica | Cobertura alta en casos canonicos, fragil en contextos ambiguos | depende de la implementacion | Codigo propio; no es un modelo |

No se dispone de comparativas publicadas de rendimiento entre este modelo y alternativas equivalentes de normalización de texto en ruso, por lo que la tabla anterior se limita a parámetros, enfoque y licencia.

## Limitaciones y advertencias

- Debilidad conocida en números cardinales dentro de contextos gramaticales difíciles: en el benchmark OMath la categoría Cardinal obtiene solo un 77,24% de validez semántica, muy por debajo del 97,66% de la categoría Math.
- Truncamiento y repeticiones: entradas largas o estructuralmente complejas pueden provocar truncamiento o bucles de repetición en la salida. El límite de 200 tokens de entrada agrava este riesgo.
- Exact match bajo en dominios fuera de distribución: el 10,1% de exact match en el benchmark OMath refleja una fuerte sensibilidad a cambios de distribución, aunque la validez semántica se mantenga en el 92,1%.
- Sesgo de variedad lingüística: el modelo está optimizado para ruso moderno y no cubre ortografía histórica ni prerreformista.
- Ambigüedad de formas habladas: varias realizaciones pueden ser igualmente correctas para una misma expresión matemática, de modo que el exact match no debe usarse como única métrica de calidad en producción.
- Riesgo de alucinación: al ser un modelo generativo, puede producir formas habladas inventadas o alterar partes de la frase que no deberían modificarse. La model card reporta métricas de un verificador (82,23% en validación, 91,6% en OMath), lo que implica que entre un 8% y un 18% de las salidas no pasan esa comprobación automática.
- Idioma único: no soporta otros idiomas además del ruso. Aplicarlo a textos en otra lengua producirá salidas inválidas.
- Sin validación comunitaria: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, y no se ha publicado ningún benchmark externo independiente más allá del aportado por el propio autor.
- Licencia: Apache 2.0, heredada de google/byt5-small, permite uso comercial y modificación, pero obliga a conservar los avisos de licencia y a indicar los cambios realizados. No se identifican restricciones adicionales.
- Ausencia de cuantizaciones oficiales: no se publican pesos en GGUF, ONNX ni versiones cuantizadas, lo que obliga a generarlas por cuenta propia si se necesita reducir memoria o latencia.
- Adecuación a producción: el modelo se declara como etapa de preprocesado, no como generador de texto general. No debe emplearse para generación libre, resumen, traducción ni diálogo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/intx82/byt5-textnorm-ru
- Modelo base google/byt5-small: https://huggingface.co/google/byt5-small
- Paper de ByT5: https://arxiv.org/abs/2105.13626
- Paper de T5: https://arxiv.org/abs/1910.10683
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- Los resultados de la busqueda web realizada no contenian ninguna referencia relevante al modelo (contenido sobre Plex y foros no relacionados), por lo que no se incluyen enlaces adicionales.
