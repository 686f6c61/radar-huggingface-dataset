# gabrione/pocket-tts-phonemes-africa

## Resumen

Pocket TTS phonemes africa es un modelo de síntesis de voz (text-to-speech) desarrollado por el usuario gabrione como fine-tuning de kyutai/pocket-tts. Su particularidad es que no recibe texto ortográfico sino transcripciones fonéticas en IPA (Alfabeto Fonético Internacional) separadas por espacios, lo que permite que un único conjunto de pesos sirva para varias lenguas africanas sin necesidad de un vocabulario ortográfico por idioma. Está ajustado para swahili, amárico, zulú, yoruba, hausa, luganda y kinyarwanda.

La arquitectura subyace al diseño de Pocket TTS de Kyutai: un FlowLM de 24 capas acoplado a un códec Mimi que opera a 24 kHz, con capacidad de clonación de voz a partir de unos pocos segundos de audio de referencia. El modelo cuenta con 336.068.290 parámetros y un repositorio de 1,3 GB en formato safetensors, e incluye además un tokenizador SentencePiece de 4000 piezas sobre IPA y tablas de conversión grafema-fonema (G2P) para cinco de las lenguas.

Su relevancia radica en la cobertura de lenguas africanas de bajos recursos, un ámbito donde los sistemas TTS comerciales suelen carecer de soporte. El modelo forma parte del proyecto mynah-s2s como opción de "talker" (`--talker-mode phonemes-africa`), y toda la lógica de servicio, G2P y evaluación se distribuye en ese repositorio, no en la model card de Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FlowLM de 24 capas + códec Mimi (Pocket TTS de Kyutai) |
| Parametros totales | 336.068.290 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | sw, am, zu, yo, ha, lg, rw |
| Licencia | CC-BY-4.0 |
| Formato de pesos | safetensors (`model.safetensors`), configuración en `model.yaml` |

## Arquitectura y entrenamiento

El modelo parte de kyutai/pocket-tts, un sistema TTS inglés basado en un FlowLM de 24 capas que genera representaciones acústicas a través de un códec Mimi a 24 kHz, con clonación de voz a partir de pocos segundos de audio. El fine-tuning introduce una interfaz fonética: la entrada es IPA palabra a palabra, sin puntuación ni marcas de acento, con africadas unidas por barra (`t͡ʃ d͡ʒ t͡s d͡z`). El tokenizador es un SentencePiece de 4000 piezas con byte fallback, procedente de AfriSpeech/africa-tts.

El entrenamiento se realizó en varias fases: primero un ajuste sobre IPA para lenguas europeas (MLS, FLEURS), después swahili, amárico, zulú, yoruba y hausa (FLEURS train, unas 10 horas por lengua), luego luganda, kinyarwanda y 20 horas adicionales de swahili (Common Voice 17), y finalmente una etapa de pulido. En total, 11.000 pasos con batch de 32, precisión bf16 y pérdida de flujo LSD. Las marcas de tiempo por palabra se obtuvieron mediante alineamiento forzado con Omni ASR CTC, limitando a 15 minutos por hablante. El entrenador empleado es el código oficial de Kyutai (MIT), distribuido en AfriSpeech/africa-tts.

## Capacidades

- Síntesis de voz a partir de entrada fonética IPA, no de texto ortográfico.
- Clonación de voz a partir de unos 5 segundos de audio de referencia del mismo hablante.
- Soporte de siete lenguas africanas: swahili, amárico, zulú, yoruba, hausa, luganda y kinyarwanda.
- Generación de audio a 24 kHz mediante el códec Mimi.
- Entrada multilingüe con un único conjunto de pesos: añadir una lengua requiere su G2P y una etapa corta de entrenamiento.
- Conversión grafema-fonema incluida para zu, ha, rw, lg y yo mediante tablas de reglas; para sw y am se usa espeak-ng 1.51 a través de phonemizer 3.6.0.
- Tonos del yoruba representados como letras de tono (˥ ˩).
- Integración como motor de voz en mynah-s2s (servidor, frontend y batch).

## Casos de uso

- Locución para asistentes de voz en swahili o amárico: el modelo permite generar respuestas habladas en estas lenguas a partir de su representación IPA, con clonación de una voz de referencia para mantener consistencia de timbre en toda la conversación.
- Doblaje y audiolibros en lenguas africanas de bajos recursos: al procesar el texto frase a frase (el modelo degrada en textos de más de ~30 s en una sola pasada), se puede construir un motor de voz que lea documentos largos con pausas naturales entre frases.
- Accesibilidad para lectores de pantalla en zulú, yoruba o hausa: las tablas G2P del repositorio permiten convertir texto escrito a IPA y alimentar el modelo, ofreciendo síntesis en lenguas que los motores comerciales no cubren.
- Investigación lingüística y preservación: el modelo sirve para generar estímulos de audio controlados fonéticamente en experimentos de percepción del habla, ya que la entrada IPA permite especificar con precisión la pronunciación.
- Integración en pipelines de conversión voz-a-voz: forma parte de mynah-s2s como "talker", de modo que un sistema de reconocimiento y traducción puede cerrar el bucle con síntesis en la lengua destino.
- Prototipado de interfaces de voz multilingües: con un solo modelo y una voz de referencia se pueden generar muestras en las siete lenguas para pruebas de producto, sin depender de varios sistemas TTS.
- Evaluación de calidad TTS: el repositorio incluye herramientas de evaluación (`fleurs_eval.py`) que permiten medir la degradación de WER de la voz sintética frente a grabaciones reales, útil para comparar variantes de G2P o de entrenamiento.

## Benchmarks y rendimiento

La model card publica una evaluación basada en la diferencia de WER (palabras erróneas) entre el habla sintética transcrita por Omni ASR CTC 3B v2 y las grabaciones reales de las mismas frases, usando voces clonadas de 5 segundos. Cuanto menor es la brecha, mejor.

Frases cortas (100 por lengua; FLEURS test, kinyarwanda con Common Voice test):

| Métrica | sw | am | zu | yo | ha | lg | rw |
|---|---|---|---|---|---|---|---|
| WER grabaciones reales | 0,102 | 0,235 | 0,255 | 0,458 | 0,182 | 0,433 | 0,378 |
| Brecha con G2P del repo | 0,110 | 0,165 | 0,112 | 0,108 | 0,079 | 0,027 | 0,068 |

Textos de dos frases (~10-20 s, sintetizados frase a frase): brecha de sw 0,094, am 0,129, zu 0,070, yo 0,105, ha 0,028, lg −0,019, rw 0,037.

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, al tratarse de un modelo TTS.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; con 336 millones de parámetros, la inferencia en precisión nativa (bf16/fp16) requiere del orden de 0,7 GB solo para pesos, más el códec Mimi y el audio de referencia.
- GPU recomendadas: no disponible; no se especifican modelos concretos en la documentación.
- Compatibilidad con GPU de consumo: no confirmada explícitamente, pero el tamaño del modelo (336 M de parámetros, repo de 1,3 GB) sugiere que puede ejecutarse en GPUs de consumo con memoria suficiente, aunque no hay cifras publicadas.
- Opciones de despliegue: el servicio se realiza a través de mynah-s2s (`frankenstein2/tts/phoneme_batch.py`, `phoneme_server.py`, `phoneme_frontend.py`); no se documentan integraciones con vLLM, llama.cpp u Ollama, que además no son aplicables a un modelo TTS de este tipo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| gabrione/pocket-tts-phonemes-africa | 336 M | sw, am, zu, yo, ha, lg, rw | IPA | CC-BY-4.0 | Hugging Face |
| kyutai/pocket-tts | no disponible | inglés | texto | CC-BY-4.0 | Hugging Face |
| AfriSpeech/africa-tts | no disponible | lenguas africanas (no detalladas) | no disponible | MIT (código y tokenizador) | GitHub |

La comparación con otros sistemas TTS multilingües comerciales no está disponible en la información proporcionada. Frente a su modelo base, la diferencia principal es la interfaz fonética y la cobertura de siete lenguas africanas, a costa de requerir un G2P externo y de perder la puntuación y el acento léxico en la entrada.

## Limitaciones y advertencias

- Solo cubre siete lenguas; la calidad varía según los datos disponibles, y amárico y zulú presentan las brechas mayores en la evaluación.
- La entrada no incluye acento léxico ni puntuación, por lo que no se genera entonación interrogativa.
- Los textos mucho más largos que los clips de entrenamiento (~30 s) degradan la salida si se sintetizan en una sola pasada; deben dividirse por frases.
- Los números deben escribirse como palabras antes del G2P; el modelo no incluye normalizador numérico.
- La tabla de yoruba hereda una convención del IPA de entrenamiento (vocal antes de n + vocal se nasaliza), pendiente de corrección en una próxima etapa.
- Riesgo de alucinación acústica y de artefactos en voces clonadas, especialmente con audio de referencia ruidoso o corto.
- Sesgos: no documentados explícitamente, pero dependen de la composición de FLEURS, Common Voice y MLS.
- Licencia CC-BY-4.0: permite uso comercial con atribución a Kyutai y al autor del fine-tuning; las tablas G2P son MIT, pero espeak-ng y phonemizer son GPL-3.0 y no se incluyen, por lo que su instalación queda sujeta a esa licencia.
- No se distribuye ninguna voz: el usuario debe aportar su propio audio de referencia con consentimiento del hablante.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validación externa de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/gabrione/pocket-tts-phonemes-africa
- Modelo base: https://huggingface.co/kyutai/pocket-tts
- Repositorio mynah-s2s: https://github.com/mynah-org/mynah-s2s
- Repositorio AfriSpeech/africa-tts: https://github.com/AfriSpeech/africa-tts
- Dataset FLEURS: https://huggingface.co/datasets/google/fleurs
- Dataset MLS: https://www.openslr.org/94/
- Common Voice 17: no disponible como enlace directo en la información proporcionada
