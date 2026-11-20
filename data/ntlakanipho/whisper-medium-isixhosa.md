# Ntlakanipho/whisper-medium-isixhosa

## Resumen

whisper-medium-isixhosa es un modelo de reconocimiento automático del habla (ASR) especializado en isiXhosa, una lengua bantú de Sudáfrica que el Whisper original de OpenAI no soporta de forma nativa. Lo desarrolla Ntlakanipho como parte de un proyecto abierto de aprendizaje documentado públicamente, y consiste en un ajuste fino de `openai/whisper-medium` (769M parámetros) sobre corpus sudafricanos específicos. La relevancia actual es doble: por un lado, demuestra que es posible adaptar modelos multilingües genéricos a lenguas de bajos recursos con presupuestos mínimos (unas 5,5 horas de GPU L40S, unos 12 dólares); por otro, publica métricas CER/WER sobre tres corpus independientes con transparencia poco habitual en el ecosistema ASR.

El modelo se distribuye en formato transformers (safetensors) y también en una copia CTranslate2 cuantizada a int8 de 775 MB para ejecución en CPU. Su licencia CC-BY-4.0 permite uso comercial con atribución, lo que lo hace directamente desplegable en productos. La versión actual (R-0035, noviembre de 2026) se reentrenó sobre 309,7 horas de audio con SpecAugment y selección de checkpoint sobre voz natural, mejorando todas las versiones anteriores en todos los conjuntos de test.

Un detalle de implementación crítico es que el modelo reutiliza la etiqueta de idioma *swahili* (`language="sw"`) de Whisper para generar isiXhosa, una solución heredada de la arquitectura base que cualquier integración debe respetar si no se quiere obtener salida incorrecta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder de Whisper (seq2seq con atención, 24 capas encoder / 24 decoder, 1024 dim) |
| Parametros totales | 763.857.920 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (ventana de audio de 30 s por segmento, característica de Whisper) |
| Tipos de cuantizacion | safetensors en fp32/fp16; CTranslate2 int8 (carpeta `ct2-int8/`, 775 MB) |
| Idiomas soportados | isiXhosa (xh) únicamente |
| Licencia | CC-BY-4.0 |
| Formato de pesos | safetensors (transformers) y CTranslate2 (`faster-whisper`) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino completo de `openai/whisper-medium`, un transformer encoder-decoder de 769M parámetros con atención estándar y procesamiento de audio en ventanas de 30 segundos. No se ha modificado la arquitectura base: se conserva el tokenizador y el vocabulario multilingüe de Whisper, y el modelo aprende a mapear la etiqueta de idioma swahili (`<|sw|>`) a transcripciones en isiXhosa, ya que Whisper no dispone de token de idioma para xh.

El entrenamiento utilizó 309,7 horas de audio (98.663 clips, 603 hablantes) procedentes de tres fuentes: NCHLT isiXhosa Speech Corpus train (51,2 h de habla leída), FLEURS xh_za train (13,0 h de frases leídas) y Swivuriso isiXhosa train (245,4 h de habla leída y espontánea de 407 hablantes, incluyendo 98,9 h de fragmentos cortados en límites de palabra). Se eliminaron clips con marcas de habla ininteligible (`[?]`) y cualquier clip cuya frase apareciera en conjuntos de test o dev (6.139 clips). La receta: 9.000 pasos (~2,9 pasadas sobre los datos), batch 32 (8 × 4 de acumulación), learning rate 1e-5 con 500 pasos de warm-up y decaimiento lineal, precisión bf16 y SpecAugment (máscaras de tiempo y frecuencia, solo en entrenamiento). El checkpoint final se seleccionó en el paso 8.000 según el CER medio de una muestra dev de Swivuriso (528 clips) y FLEURS dev (441 clips). Todo el entrenamiento se ejecutó en una NVIDIA L40S durante 4,6 horas (~5,5 h de tiempo de máquina, unos 12 dólares). El texto objetivo se normaliza a minúsculas, sin puntuación, y los guiones tras prefijos se sustituyen por espacios.

## Capacidades

- Transcripción de voz a texto en isiXhosa, incluyendo habla leída y habla espontánea.
- Manejo de audio de entre 1 y 30 segundos por segmento, con múltiples hablantes (el conjunto de entrenamiento cubre 603 hablantes).
- Robustez razonable frente a variación de hablante y dominio: los tres conjuntos de test incluyen hablantes no vistos en entrenamiento.
- Funcionamiento en CPU mediante la copia CTranslate2 int8, apto para portátiles sin GPU.
- Compatible con el pipeline `automatic-speech-recognition` de transformers y con `faster-whisper`.
- No soporta tool calling, agentes, visión ni audio más allá de la transcripción.
- Capacidad multilingüe: ninguna; solo isiXhosa. El código-switching isiXhosa-inglés presenta un rendimiento notablemente degradado (CER 25,98 / WER 60,84 en el corpus Soapies).
- No incluye modo de razonamiento ni decodificación especulativa específica.

## Casos de uso

- Transcripción de entrevistas y testimonios en isiXhosa: el modelo puede procesar grabaciones de campo de 1 a 30 segundos por segmento con un CER del 3,0 % en habla espontánea (Swivuriso), lo que lo hace adecuado para investigación cualitativa y archivos orales.
- Subtitulado automático de contenido audiovisual sudafricano: con la copia int8 en CTranslate2 y `beam_size=5`, se puede integrar en pipelines de subtitulado en CPU sin necesidad de GPU dedicada, a un coste de precisión bajo (CER 6,16 frente a 5,97 en fp32 sobre 100 clips de FLEURS).
- Accesibilidad y dictado para hablantes de isiXhosa: el modelo permite construir interfaces de voz a texto en aplicaciones de productividad, con la ventaja de que la versión int8 de 775 MB cabe en un portátil convencional.
- Digitalización de corpus lingüísticos: investigadores pueden transcribir grabaciones NCHLT o Swivuriso con un CER del 1,99 % en NCHLT test (aunque el 82 % de esos clips repiten frases de entrenamiento; en frases no vistas el CER sube a 4,3 %), lo que agiliza la anotación de nuevos materiales.
- Sistemas de atención al ciudadano en Sudáfrica: integrado en un pipeline de ASR + LLM, permite transcribir consultas orales en isiXhosa antes de pasarlas a un modelo de lenguaje o a un clasificador de intenciones.
- Investigación en lenguas de bajos recursos: el proyecto documenta cada experimento (incluidos los fallidos) en GitHub, y el modelo sirve como referencia reproducible para adaptar Whisper a otras lenguas sin token propio, reutilizando la etiqueta de un idioma cercano.
- Evaluación comparativa de ASR: al publicar CER/WER en tres corpus con normalización explícita, el modelo puede usarse como baseline en estudios de adaptación de dominio o de cuantización.

## Benchmarks y rendimiento

Datos declarados por el autor (no verificados de forma independiente). CER = tasa de error de caracteres, WER = tasa de error de palabras; menor es mejor. Se comparan dos modos de decodificación: *plain* (transformers, greedy) y *guarded* (beam 5 con fallback de repetición de Whisper, sobre CTranslate2/faster-whisper).

| Conjunto de test | CER / WER plain | CER / WER guarded | Versión anterior (R-0019) plain | Nota |
|---|---|---|---|---|
| FLEURS xh_za test (1.034 clips) | 5,56 / 26,64 | 5,21 / 26,06 | 6,24 / 30,32 | frases de test no vistas; el split train de FLEURS sí está en entrenamiento |
| Swivuriso test, habla espontánea (723 clips) | 3,0 / 13,8 | 2,8 / 13,4 | 4,1 / 19,0 | mismo proyecto de grabación que la mayor parte del entrenamiento |
| Swivuriso test, todos (2.145 clips, 24 hablantes) | 3,38 / 15,51 | 3,24 / 15,04 | 4,12 / 19,12 | clips de 1-30 s completamente transcritos |
| NCHLT isiXhosa test (2.770 clips, 8 hablantes no vistos) | 1,99 / 11,45 | 1,92 / 11,11 | 2,31 / 13,67 | inflado: el 82 % de los clips repiten frases de entrenamiento |
| NCHLT test, solo frases no vistas (511 clips) | 4,3 / 25,5 | 4,1 / 24,4 | 4,4 / 26,6 | la mejora en NCHLT se concentra en frases vistas |
| Soapies test (código-switching isiXhosa-inglés, corpus solo investigación) | no disponible | 25,98 / 60,84 | 27,08 / 63,37 | nunca entrenado con este corpus; rendimiento débil |

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 1,6-2 GB para los pesos (769M parámetros), más overhead de activaciones y audio; en la práctica, 3-4 GB de VRAM son suficientes para un pipeline estándar de transformers.
- La copia CTranslate2 int8 ocupa 775 MB y funciona en CPU de portátil convencional con `faster-whisper`, `language="sw"` y `beam_size=5`.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para fp16 (RTX 3060, RTX 4060, T4). Para entrenamiento o ajuste fino, el autor usó una NVIDIA L40S; una A100 o H100 permitirían entrenar en menos tiempo.
- Cabe en GPU de consumo: sí, en RTX 3060/4060/4090 y equivalentes.
- Opciones de despliegue: transformers (pipeline `automatic-speech-recognition`), `faster-whisper` con CTranslate2, y cualquier servidor compatible con el pipeline de transformers (por ejemplo, TGI no soporta ASR de Whisper de forma nativa; vLLM tampoco está orientado a este tipo de modelo). Ollama y llama.cpp no soportan Whisper.
- Latencia y throughput: no disponibles de forma oficial. El coste de cuantización int8 medido es de +0,19 CER sobre 100 clips de FLEURS (6,16 frente a 5,97 en fp32), sin pérdida en NCHLT.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / audio | Idiomas | Licencia | CER isiXhosa (referencia) |
|---|---|---|---|---|---|
| whisper-medium-isixhosa (este) | 769M | ventanas de 30 s | xh | CC-BY-4.0 | 5,56 FLEURS / 1,99 NCHLT (plain) |
| openai/whisper-medium (base) | 769M | ventanas de 30 s | multilingüe, sin xh nativo | MIT | no soporta isiXhosa de forma fiable; no disponible |
| openai/whisper-large-v3 | 1.550M | ventanas de 30 s | multilingüe, sin xh nativo | MIT | no disponible para xh |
| whisper-small-isixhosa (mismo autor) | 244M | ventanas de 30 s | xh | CC-BY-4.0 | no disponible en la información proporcionada |

No se dispone de datos de benchmarks de otros modelos ASR específicos para isiXhosa en la información proporcionada, por lo que la comparativa cuantitativa con alternativas directas no está disponible.

## Limitaciones y advertencias

- El modelo reutiliza la etiqueta de idioma swahili (`language="sw"`); si se omite o se usa otra etiqueta, la salida será incorrecta. Es un requisito obligatorio en cualquier integración.
- Rendimiento débil en habla con código-switching isiXhosa-inglés: CER 25,98 / WER 60,84 en el corpus Soapies, nunca visto en entrenamiento.
- El NCHLT test está inflado: el 82 % de los clips repiten frases de entrenamiento; en frases no vistas el CER sube del 1,99 % al 4,3 %.
- El split train de FLEURS está incluido en el entrenamiento, por lo que las métricas de FLEURS test pueden estar optimistas pese a que las frases de test no se hayan visto.
- El modelo solo transcribe isiXhosa; no traduce ni genera texto en otros idiomas.
- No se han publicado evaluaciones independientes de sesgos; al estar entrenado con corpus sudafricanos concretos, puede presentar sesgos de dominio y de hablante (predominio de determinados acentos y registros).
- Riesgo de alucinación y de repetición en audio ruidoso o con habla solapada, mitigado parcialmente por el fallback de repetición de Whisper en modo *guarded*.
- La licencia CC-BY-4.0 permite uso comercial con atribución, pero exige citar al autor y la licencia; no hay restricciones adicionales conocidas.
- El texto de salida está normalizado a minúsculas y sin puntuación; si se necesita puntuación o mayúsculas, hay que postprocesar.
- La ventana de audio es de 30 segundos por segmento, característica de Whisper; para audio más largo hay que segmentar.
- La cuantización int8 introduce una pérdida pequeña de precisión (CER 6,16 frente a 5,97 en fp32 sobre 100 clips de FLEURS).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Ntlakanipho/whisper-medium-isixhosa
- Modelo base: https://huggingface.co/openai/whisper-medium
- Modelo hermano (small): https://huggingface.co/Ntlakanipho/whisper-small-isixhosa
- Repositorio del proyecto: https://github.com/2Ntlaks/isixhosa-speech-ai
- Artículo del autor: https://ntlaks.dev/writing/teaching-whisper-isixhosa/
- Demo en el navegador (modelo small): https://ntlakanipho-thetha.static.hf.space/index.html
- Dataset FLEURS: https://huggingface.co/datasets/google/fleurs
- Dataset Swivuriso / African Next Voices: https://huggingface.co/datasets/dsfsi-anv/za-african-next-voices
- CTranslate2: https://github.com/OpenNMT/CTranslate2
