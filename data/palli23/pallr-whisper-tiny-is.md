# palli23/pallr-whisper-tiny-is

## Resumen

pallr-whisper-tiny-is es un ajuste fino (fine-tuning) del modelo OpenAI Whisper-tiny para reconocimiento automático del habla (ASR) en islandés. Lo desarrolla Páll Rúnarsson, del laboratorio HUMI de la Universidad de Reikiavik, y está pensado como una alternativa ligera a los grandes modelos ASR islandeses: con solo 37,7 millones de parámetros y un repositorio de 0,2 GB, se carga en segundos y puede ejecutarse en la CPU de un portátil o un teléfono móvil sin conexión.

El modelo parte de la arquitectura transformer encoder-decoder de Whisper (contexto de audio de 30 segundos por ventana, muestreo a 16 kHz) y se ha entrenado con corpus islandeses de habla espontánea y leída: Samrómur Milljón, Samrómur 21.05 y Spjallrómur. Genera texto con mayúsculas y puntuación, una diferencia práctica frente a muchos ASR que devuelven texto en minúsculas sin formato.

Su relevancia actual es la de demostrar que un modelo de 39M de parámetros puede ser útil en un idioma de bajos recursos como el islandés, sacrificando precisión en habla leída (WER del 19,2 % frente al 6,9 % de un Whisper-large específico) pero ganando en despliegue: inferencia local, sin GPU y con privacidad por diseño. Forma parte de una colección de modelos pequeños comparados sistemáticamente contra "gigantes multilingües" en el artículo del mismo laboratorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper-tiny, ASR secuencia a secuencia) |
| Parametros totales | 37.760.640 (≈39M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 30 segundos de audio por ventana (arquitectura Whisper); chunking para audio más largo |
| Tipos de cuantizacion | no disponible (pesos safetensors en fp32/fp16; admite cuantización estándar vía herramientas externas) |
| Idiomas soportados | islandés (is) |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Arquitectura Whisper-tiny de OpenAI: un encoder transformer que procesa espectrogramas mel de 30 segundos y un decoder autorregresivo que genera tokens de texto. El modelo base tiene 39M de parámetros y se ha ajustado específicamente para islandés. El autor no detalla en la model card el número exacto de tokens de audio ni la composición porcentual del dataset, pero sí los corpus empleados: Samrómur Milljón, Samrómur 21.05 y Spjallrómur, todos ellos recursos de habla islandesa del ecosistema Samrómur.

No se documentan en la información disponible detalles sobre RLHF, DPO ni innovaciones de decodificación específicas. La recomendación práctica del autor es usar `repetition_penalty=1.2` y `no_repeat_ngram_size=3` durante la generación, ya que sin ellos Whisper tiende a repetirse en silencios o ruido. El modelo es un fine-tune directo del checkpoint `openai/whisper-tiny`, por lo que hereda su tokenizador multilingüe y su mecánica de tareas (`transcribe`, `translate`).

## Capacidades

- Reconocimiento automático del habla en islandés, con salida en texto con mayúsculas y puntuación.
- Transcripción de audio de cualquier duración mediante `chunk_length_s=30` en el pipeline de Transformers (el audio se remuestrea a 16 kHz automáticamente).
- Funcionamiento offline en CPU de teléfono o portátil, sin GPU.
- Integración nativa con `transformers` (`pipeline("automatic-speech-recognition")`).
- Demo en navegador en ormal.is, con procesamiento local sin subida de audio.
- No soporta tool calling, agentes, visión, audio de entrada multimodal ni modo "thinking"; es un ASR puro.

## Casos de uso

- Transcripción offline en dispositivos móviles: el modelo cabe en ~150 MB de pesos y se ejecuta en CPU, lo que permite dictado y notas de voz sin conexión y sin enviar audio a un servidor, algo crítico para privacidad.
- Subtitulado de contenido en islandés: con chunking de 30 segundos se pueden procesar podcasts o vídeos largos y generar subtítulos con mayúsculas y puntuación, útiles para accesibilidad.
- Asistentes de voz locales para islandés: al ser tan ligero, se puede embeber en aplicaciones de escritorio o IoT que necesiten comandos de voz en islandés sin depender de la nube.
- Investigación en lenguas de bajos recursos: sirve como línea base pequeña para comparar estrategias de aumento de datos y fine-tuning en islandés, tal como hace el artículo del laboratorio HUMI.
- Prototipado rápido de pipelines ASR: su carga en segundos y su integración con `transformers` permiten validar ideas de producto antes de invertir en modelos grandes.
- Transcripción de reuniones y entrevistas en islandés en entornos con recursos limitados (portátiles sin GPU), aceptando un WER mayor en habla espontánea.
- Herramientas educativas y de aprendizaje de islandés: transcripción de audio de práctica con texto puntuado que facilita la lectura.

## Benchmarks y rendimiento

Resultados publicados en la model card (WER en %, menor es mejor; minúsculas y sin puntuación antes de puntuar):

| Modelo | Parámetros | Pesos | Samrómur 21.05 | Fjölmiðlatal 22.02 (RÚV) | Samrómur Milljón |
|---|---|---|---|---|---|
| pallr-whisper-tiny-is | 39M | ~150 MB | 19,2 | 46,9 | 5,5 |
| whisper-large-icelandic-62640-steps-967h | 1.550M | ~6,2 GB | 6,9 | 38,1 | no disponible |
| wav2vec2-large-xlsr-53-icelandic-ep30-967h | 315M | ~1,3 GB | 7,0 | 45,4 | no disponible |

Nota del autor: el test de Samrómur Milljón contiene frases que también aparecen en los prompts de entrenamiento de Milljón, por lo que su 5,5 % es una métrica en dominio y no directamente comparable con las otras dos.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB en fp32 (37,7M de parámetros, ~150 MB de pesos); en fp16, ~75 MB. Cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: no requiere GPU; funciona en CPU. Cualquier GPU (RTX 3060, RTX 4090, A100, H100) acelera la inferencia, pero no es necesaria.
- Cabe en GPU consumer: sí, en todas, incluidas las integradas y las de portátiles de gama baja.
- Despliegue: `transformers` con `pipeline`; también es compatible con servidores de inferencia estándar (TGI, vLLM) y con conversión a ONNX o GGUF para llama.cpp/Ollama si se desea, aunque el autor solo documenta el uso vía Transformers.
- Latencia y throughput: no disponibles en la información proporcionada. Por tamaño, se espera inferencia en tiempo real o superior en CPU moderna, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto de audio | WER Samrómur 21.05 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pallr-whisper-tiny-is | 39M | 30 s por ventana | 19,2 | CC BY-SA 4.0 | HuggingFace |
| whisper-large-icelandic-62640-steps-967h | 1.550M | 30 s por ventana | 6,9 | no disponible en la información | HuggingFace (language-and-voice-lab) |
| wav2vec2-large-xlsr-53-icelandic-ep30-967h | 315M | no disponible | 7,0 | no disponible en la información | HuggingFace (language-and-voice-lab) |

La comparación muestra el compromiso central: los modelos grandes son claramente más precisos en habla leída (6,9-7,0 % frente a 19,2 %), pero pesan entre 8 y 40 veces más. En habla de radio (Fjölmiðlatal) la brecha se reduce (46,9 % frente a 38,1 % y 45,4 %), lo que sugiere que el modelo pequeño es competitivo en condiciones ruidosas o espontáneas.

## Limitaciones y advertencias

- Precisión limitada en habla leída: WER del 19,2 % en Samrómur 21.05, casi el triple que los modelos grandes islandeses.
- Rendimiento pobre en audio de radio y habla espontánea: 46,9 % de WER en Fjölmiðlatal, con errores frecuentes en nombres propios y condiciones acústicas adversas.
- Riesgo de repetición y alucinación: sin `repetition_penalty=1.2` y `no_repeat_ngram_size=3`, Whisper puede entrar en bucles sobre silencios o ruido.
- Solo islandés: no está entrenado para otros idiomas; usarlo con audio en otra lengua producirá transcripciones incorrectas o inventadas.
- Métrica en dominio: el 5,5 % de Samrómur Milljón no es representativo de un uso general, ya que hay solapamiento con los prompts de entrenamiento.
- Licencia CC BY-SA 4.0: permite uso comercial, pero obliga a atribuir y a compartir las obras derivadas bajo la misma licencia, lo que puede ser incompatible con productos propietarios que no quieran liberar sus adaptaciones.
- Sin datos publicados sobre sesgos demográficos, acentos o variedades dialectales del islandés.
- No hay información sobre latencia, throughput ni cuantizaciones validadas por el autor.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/palli23/pallr-whisper-tiny-is
- Colección "Scaling smaller ASR models vs multilingual giants": https://huggingface.co/collections/palli23/scaling-smaller-asr-models-vs-multilingual-giants-6aa9aabd202fee0610231065
- Modelo base: https://huggingface.co/openai/whisper-tiny
- Modelo comparativo Whisper-large islandés: https://huggingface.co/language-and-voice-lab/whisper-large-icelandic-62640-steps-967h
- Modelo comparativo wav2vec2-large islandés: https://huggingface.co/language-and-voice-lab/wav2vec2-large-xlsr-53-icelandic-ep30-967h
- Demo en navegador: https://ormal.is
