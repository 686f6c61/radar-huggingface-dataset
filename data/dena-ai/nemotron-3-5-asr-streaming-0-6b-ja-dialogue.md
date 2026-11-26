# dena-ai/nemotron-3.5-asr-streaming-0.6b-ja-dialogue

## Resumen

Nemotron 3.5 ASR Streaming 0.6B Japanese Dialogue es un modelo de reconocimiento automático del habla (ASR) en streaming para japones, desarrollado por dena-ai mediante fine-tuning de nvidia/nemotron-3.5-asr-streaming-0.6b. El objetivo es mejorar la transcripcion de dialogo hablado real: interjecciones como «うん» o «ええ», frases conversacionales y audio con ruido. La arquitectura no se modifica respecto al modelo base, por lo que la velocidad y el modo de uso son identicos.

El modelo emplea una arquitectura FastConformer con decodificador RNNT (familia Parakeet) y es cache-aware, lo que permite inferencia en streaming con distintos niveles de lookahead (80, 320, 560 y 1.120 ms). Con 0,6 mil millones de parametros, esta pensado para despliegues de baja latencia en produccion, no para transcripcion por lotes de alta precision.

Su relevancia actual radica en que la mayoria de los ASR multilingues rinden mal en fenomenos propios del dialogo japones: interjecciones cortas, solapamientos y habla con ruido de fondo. Este fine-tuning reduce el CER en interjecciones del 54,8 % al 17,3 % y en frases conversacionales del 2,6 % al 1,2 %, manteniendo el rendimiento del modelo original en lectura de frases.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer con decodificador RNNT, cache-aware streaming |
| Parametros totales | 0,6 mil millones (0.6B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible; ventana de atencion configurable via `att_context_size` con lookahead de 80, 320, 560 o 1.120 ms |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | japones (ja, ja-JP) |
| Licencia | OpenMDW License 1.1 |
| Formato de pesos | `.nemo` (checkpoint NeMo, ~2,6 GB en el repo) |

## Arquitectura y entrenamiento

El modelo conserva la arquitectura del base: un encoder FastConformer (variante de Conformer con atencion por bloques y convoluciones depthwise) acoplado a un decodificador RNNT. La caracteristica clave es el diseno cache-aware, que mantiene cache de estados de atencion y convolucion entre fragmentos de audio, permitiendo transcripcion incremental con latencia controlada por el lookahead configurado. No hay cambios estructurales respecto al modelo de NVIDIA.

El fine-tuning uso aproximadamente 100.000 enunciados y 173 horas de audio: unas 129 horas de Common Voice v27 en japones (voces reales), 25 horas de interjecciones sinteticas, 8 horas de FLEURS train y 12 horas de datos sinteticos dirigidos a puntos debiles (numeros, respuestas cortas, interjecciones similares). Las voces sinteticas se generaron con Irodori TTS v4.1-Small a partir de descripciones textuales, no de grabaciones de personas reales, y se excluyeron del entrenamiento los hablantes y frases del conjunto de test de Common Voice.

Entre las decisiones de entrenamiento destacan: relleno de 2-3 s de silencio al final de cada clip con truncado de la perdida 0,5 s despues de la ultima palabra (para que el modelo emita sin esperar al final del audio), aumento de volumen aleatorio entre -35 y +5 dB, y seleccion de lookahead por lote entre los cuatro valores disponibles. Se entreno en A100 con 400 s de audio por lote, learning rate 5e-5 y 6.302 pasos (unas 4 epocas), promediando los ultimos 4 checkpoints.

## Capacidades

- Transcripcion de voz en streaming con latencia configurable (lookahead de 80 a 1.120 ms).
- Reconocimiento de interjecciones y respuestas cortas («うん», «ええ», «へえ») sin esperar al final del enunciado.
- Transcripcion de habla conversacional y de voz real con ruido de fondo (cafe, metro, calle, cocina).
- Robustez ante volumen bajo, gracias al aumento de volumen durante el entrenamiento.
- Salida con numeros en kanji (p. ej. «二十四時間»); requiere postproceso para convertir a cifras arabigas.
- No transcribe simbolos que no se pronuncian.
- Modelo unicamente de ASR: no hace traduccion, diarizacion ni comprension semantica.
- Soporte de tool calling / function calling: no aplica (no es un modelo de lenguaje).
- Capacidades de agente y razonamiento multi-paso: no aplica.
- Capacidades multilingues: limitadas al japones.

## Casos de uso

- Subtitulado en tiempo real de reuniones y videollamadas en japones: el modo cache-aware con lookahead de 560 ms permite emitir texto mientras se habla, y la mejora en interjecciones evita que las muletillas se pierdan o se transcriban mal.
- Transcripcion de atencion al cliente (contact centers): el modelo esta afinado para dialogo real con ruido y respuestas cortas, lo que encaja con grabaciones telefonicas y permite generar transcripciones para analitica de calidad.
- Asistentes de voz y agentes conversacionales: la baja latencia (modelo de 0,6B) y la transcripcion inmediata de interjecciones facilitan la deteccion de turnos y la respuesta rapida en interfaces habladas.
- Actas automaticas de reuniones internas: con audio de microfonos de sala y habla solapada, el modelo mantiene un CER bajo en frases conversacionales (1,2 %) frente al original (2,6 %).
- Accesibilidad para personas sordas o con hipoacusia en entornos presenciales: transcripcion en directo desde microfono con requisitos de computo moderados.
- Investigacion en linguistica de corpus orales: generacion de transcripciones de dialogo con interjecciones preservadas, util para estudios de pragmatica y analisis conversacional.
- Preprocesado para pipelines de NLP japones (resumen, analisis de sentimiento): transcripcion de audio conversacional como primer paso antes de pasar el texto a un LLM.

## Benchmarks y rendimiento

CER de lectura (%, menor es mejor), medido con streaming a 560 ms de lookahead:

| Conjunto de test | Enunciados | Modelo original | Este modelo |
|---|---|---|---|
| Common Voice | 300 | 9,5 | 4,6 |
| FLEURS | 300 | 5,9 | 5,1 |
| ReazonSpeech (referencia) | 300 | 22,6 | 21,1 |
| Interjecciones (sintetico) | 768 | 54,8 | 17,3 |
| Frases conversacionales (sintetico) | 720 | 2,6 | 1,2 |
| FLEURS con ruido | 1.700 | 8,1 | 6,8 |
| Alucinaciones en audio solo con ruido | 40 | 0 | 0 |

Notas: el CER se calcula sobre lecturas en katakana, por lo que variantes ortograficas como «子供／子ども» no cuentan como error. En ReazonSpeech las referencias son subtitulos de emision que omiten disfluencias, por lo que es un valor de referencia. Los conjuntos sinteticos usan TTS y voces distintas a las del entrenamiento. El ruido se mezclo a SNR entre 20 y 0 dB. No se han publicado resultados en benchmarks estandar como MMLU o HumanEval, ya que no es un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con 0,6B parametros en precision FP32 el checkpoint ocupa ~2,6 GB, por lo que en FP16 la inferencia cabe holgadamente en GPUs de 8 GB.
- GPU recomendadas: el autor cita A100 para entrenamiento; para inferencia streaming es adecuada cualquier GPU NVIDIA moderna (T4, L4, RTX 3090, RTX 4090, A10, A100, H100).
- Cabe en GPU de consumo: si, en tarjetas con 8 GB o mas (RTX 3060 Ti, RTX 4060, RTX 4070, etc.).
- Opciones de despliegue: NVIDIA NeMo (script `speech_to_text_cache_aware_streaming_infer.py`) con `target_lang=ja-JP` y `att_context_size` configurable. No se documentan exportaciones a GGUF, ONNX ni integraciones con vLLM, llama.cpp u Ollama.
- Latencia y throughput: controlados por el lookahead elegido (80, 320, 560 o 1.120 ms). No se publican cifras de throughput (audio por segundo) ni de RTF.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / streaming | CER relevante | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| dena-ai/nemotron-3.5-asr-streaming-0.6b-ja-dialogue | 0,6B | Cache-aware, lookahead 80-1.120 ms | Common Voice 4,6; interjecciones 17,3 | OpenMDW 1.1 | Hugging Face |
| nvidia/nemotron-3.5-asr-streaming-0.6b (base) | 0,6B | Cache-aware, lookahead 80-1.120 ms | Common Voice 9,5; interjecciones 54,8 | OpenMDW 1.1 | Hugging Face |
| Otros ASR japoneses comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

La informacion disponible solo permite comparar de forma directa con el modelo base, del que este fine-tuning mejora todos los conjuntos evaluados salvo el de alucinaciones, que se mantiene en cero.

## Limitaciones y advertencias

- Las transcripciones contienen errores; en contextos con consecuencias graves (medico, legal, contractual) se requiere revision humana.
- Modelo limitado al japones: no soporta otros idiomas.
- La salida usa numerales kanji; es necesario postprocesar para obtener cifras arabigas.
- No transcribe simbolos que no se pronuncian; puede omitir informacion paralinguistica.
- Rendimiento en ReazonSpeech (21,1 % CER) es notablemente peor que en otros conjuntos, en parte por la naturaleza de las referencias (subtitulos sin disfluencias).
- El modelo base y este fine-tuning comparten posibles sesgos derivados de Common Voice y de las voces sinteticas generadas por TTS; no se documentan analisis de sesgo.
- Riesgo de alucinacion bajo en audio solo con ruido segun la evaluacion del autor (0 de 40 clips), pero no se garantiza en otras condiciones acusticas.
- Uso prohibido en formas que violen leyes o derechos de terceros.
- Licencia OpenMDW 1.1: conviene revisar sus terminos antes de uso comercial, ya que no es una licencia permisiva estandar como Apache 2.0 o MIT.
- Requiere el ecosistema NeMo; no hay formatos alternativos documentados que faciliten el despliegue fuera de el.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dena-ai/nemotron-3.5-asr-streaming-0.6b-ja-dialogue
- README en japones: https://huggingface.co/dena-ai/nemotron-3.5-asr-streaming-0.6b-ja-dialogue/blob/main/README_JA.md
- Modelo base: https://huggingface.co/nvidia/nemotron-3.5-asr-streaming-0.6b
- Blog de dena (en japones): https://engineering.dena.com/blog/2026/11/asr-finetuning-voice-dialogue/
- Repositorio NeMo: https://github.com/NVIDIA/NeMo
- Script de inferencia streaming cache-aware: https://github.com/NVIDIA-NeMo/NeMo/blob/main/examples/asr/asr_cache_aware_streaming/speech_to_text_cache_aware_streaming_infer.py
- Dataset FLEURS: https://huggingface.co/datasets/google/fleurs
- Common Voice japones: https://commonvoice.mozilla.org/ja
- Irodori TTS v4.1-Small: https://huggingface.co/Aratako/Irodori-TTS-v4.1-Small
- Licencia OpenMDW 1.1: https://openmdw.ai/license/1-1/
