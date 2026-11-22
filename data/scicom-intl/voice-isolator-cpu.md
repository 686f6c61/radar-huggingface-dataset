# Scicom-intl/voice-isolator-cpu

## Resumen

voice-isolator-cpu es un modelo de aislamiento de voz orientado a agentes conversacionales, desarrollado por Scicom-intl. Su funcion es retener la voz del interlocutor principal (el "caller") y eliminar otras voces y ruido antes de que el detector de actividad de voz (VAD) y el sistema de reconocimiento automatico del habla (STT) de un agente de voz procesen la llamada. Resuelve un problema concreto en produccion: en llamadas reales, voces de terceros y ruido disparan falsas detecciones de habla, interrumpen al agente y degradan la transcripcion.

Se trata de un modelo de 22 millones de parametros, disenado para ejecutarse en una sola hebra de CPU mediante onnxruntime y numpy, sin torch ni GPU. Procesa audio a 16 kHz con tramas de 10 ms y una latencia de 10 ms, lo que lo hace apto para streaming en tiempo real dentro de agentes desplegados en infraestructura modesta.

Su relevancia actual radica en que ofrece una alternativa ligera y desplegable en CPU a soluciones de aislamiento de voz basadas en GPU, con resultados de tasa de error de palabra (WER) competitivos frente a sistemas comerciales y de investigacion en varios conjuntos de prueba publicos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | 8 capas de anchura 384 sobre los ultimos 10 s, LSTM de trama y LSTM de banda |
| Parametros totales | 22 millones (version principal); variantes de 10M disponibles |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | ventana de audio de 10 s |
| Tipos de cuantizacion | exportacion de 8 bits (`quantized=True`) |
| Idiomas soportados | ingles (en) |
| Licencia | other |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

El modelo es una destilacion de la version GPU de Scicom-intl (voice-isolator) hacia un diseno compacto de 22M de parametros. La arquitectura combina 8 capas de anchura 384 que operan sobre los ultimos 10 segundos de audio, una LSTM a nivel de trama y LSTM por bandas de frecuencia. El procesamiento se realiza en tramas de 10 ms a 16 kHz, con una latencia de 10 ms, lo que permite su uso en streaming dentro de un agente de voz.

No se detalla en la informacion disponible el numero de tokens de audio ni la composicion exacta del dataset de entrenamiento. El modelo se evalua en conjuntos como Krisp VI benchmark, AMI, NOTSOFAR, AliMeeting y llamadas de centro de contacto, y se selecciono unicamente sobre conjuntos de desarrollo. La model card menciona tambien una variante "agent" con una compuerta de presencia destilada, pensada para agentes que hablan primero, y variantes de 10M parametros con aproximadamente un tercio menos de CPU por llamada.

## Capacidades

- Aislamiento de la voz del interlocutor principal (target-speaker extraction) en audio de llamadas.
- Eliminacion de ruido y de voces de terceros antes del VAD y del STT.
- Procesamiento en streaming con tramas de 10 ms y latencia de 10 ms.
- Ejecucion en una sola hebra de CPU con onnxruntime y numpy, sin torch ni GPU.
- Entrada y salida a 16 kHz.
- Integracion como plugin de LiveKit para agentes de voz.
- Modo `voicebot` para agentes que saludan primero al interlocutor.
- Exportacion cuantizada a 8 bits para reducir coste computacional.
- Uso sin LiveKit mediante `voice_isolator.OnnxStream(model_dir).push(chunk)`.
- Orientado exclusivamente a ingles.

## Casos de uso

- Atencion al cliente automatizada: el modelo se coloca como procesador de tramas en la entrada de audio del agente, antes del VAD y del STT, de modo que las voces de fondo de otras personas no activen el turno del agente ni contaminen la transcripcion.
- Agentes de voz en produccion con multiples participantes: en llamadas donde hay varias personas hablando, el aislamiento del interlocutor principal reduce las falsas interrupciones (de 2,77 a 1,36 por minuto en la version de 8 bits) y mantiene la coherencia del dialogo.
- Despliegue en infraestructura sin GPU: al ejecutarse en una sola hebra de CPU, permite incorporar aislamiento de voz en entornos con recursos limitados o en contenedores sin aceleracion hardware.
- Integracion en pipelines de LiveKit: el plugin `voice_isolator` permite activar el aislamiento mediante `noise_cancellation` en `RoomOptions`, sin reescribir el agente existente.
- Transcripcion de reuniones y actas: en conjuntos como AMI, el modelo reduce el WER de 42,59 a 10,29 en reuniones de prueba, lo que mejora la calidad de las transcripciones automaticas.
- Centros de contacto con ruido de fondo: en llamadas de centro de contacto con otra voz presente, el WER baja de 69,79 a 49,90, lo que ayuda a que el STT capture correctamente las palabras del cliente.
- Agentes que hablan primero: la variante `agent` con modo `voicebot` reduce las falsas interrupciones a 0,26 por minuto, adecuada para asistentes proactivos que inician la conversacion.
- Procesamiento por lotes de archivos de audio: mediante `example.py` o `OnnxStream`, se puede aislar la voz principal de grabaciones para su posterior analisis o transcripcion.

## Benchmarks y rendimiento

Tasa de error de palabra (%), menor es mejor. Modo live: enrollment a partir de la propia llamada.

| Conjunto de prueba | Sin procesar | VoxLock live (CPU) | Este modelo, live (CPU) | Version GPU, live |
|---|---:|---:|---:|---:|
| Krisp VI benchmark | 23,19 | 5,63 | 5,66 | 5,74 |
| AMI headset, ventanas de VoxLock | 33,00 | 11,71 | 11,23 | 10,19 |
| AMI reuniones de prueba | 42,59 | 12,07 | 10,29 | 10,18 |
| AMI test, ventanas de 60 s | 121,79 | 23,66 | 15,55 | 16,13 |
| NOTSOFAR | 34,70 | 8,84 | 7,58 | 7,67 |
| AliMeeting (CER) | 29,40 | 16,28 | 15,82 | 15,69 |
| Centro de contacto, solo el caller | 0,04 | 2,92 | 5,32 | 5,58 |
| Centro de contacto + otra voz | 69,79 | 56,65 | 49,90 | 47,52 |
| Llamadas de prueba ai-coustics | 66,36 | 24,55 | 18,03 | 14,26 |

Rendimiento del VAD de LiveKit (Silero) con 120 llamadas de prueba con otra voz:

| | Habla oida en las pausas del caller | Falsos inicios / min | Fin de turno p90 (s) | Habla del caller perdida |
|---|---:|---:|---:|---:|
| Sin procesar | 47,9% | 3,33 | 2,43 | 0,1% |
| GTCRN (solo ruido) | 48,3% | 3,58 | 2,40 | 0,3% |
| VoxLock live | 27,5% | 2,28 | 1,51 | 11,0% |
| Este modelo, live | 26,2% | 2,27 | 1,34 | 6,7% |
| Version GPU, live | 22,8% | 1,94 | 1,00 | 8,4% |

Interrupciones falsas por minuto de habla del agente (816 llamadas simuladas):

| | Interrupciones falsas / min | Turnos del caller perdidos |
|---|---:|---:|
| Sin filtro | 2,77 | 0,4% |
| GTCRN (solo ruido) | 5,33 | 0,1% |
| VoxLock live | 1,18 | 6,8% |
| NVIDIA Real-time RE-USE (GPU) | 0,95 | 2,6% |
| Inworld Voice Isolator v1, realtime | 4,52 | 0,0% |
| Este modelo, 8 bits | 1,36 | 0,3% |
| Modelo agent, 8 bits | 0,48 | 2,4% |
| Modelo agent, modo voicebot, 8 bits | 0,26 | 1,7% |

## Requisitos de hardware

- Inferencia en una sola hebra de CPU con onnxruntime y numpy; no requiere GPU ni torch.
- VRAM estimada: no aplica (ejecucion en CPU).
- GPU recomendadas: no aplica para esta version; existe una version GPU separada (Scicom-intl/voice-isolator).
- Cabe en cualquier CPU de consumo; las variantes de 10M reducen el coste de CPU aproximadamente un tercio por llamada.
- Opciones de despliegue: onnxruntime, plugin de LiveKit (`stt_api.livekit_plugin.voice_isolator`), uso directo con `OnnxStream` y script `example.py`.
- Latencia: 10 ms por trama de 10 ms de audio.
- Throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / ventana | Enfoque | Licencia | Despliegue |
|---|---|---|---|---|---|
| voice-isolator-cpu (este) | 22M (y variantes 10M) | 10 s de audio | Aislamiento del interlocutor principal | other | CPU, ONNX |
| Scicom-intl/voice-isolator | no disponible | no disponible | Aislamiento del interlocutor principal | no disponible | GPU |
| VoxLock live (CPU) | no disponible | no disponible | Aislamiento de voz | no disponible | CPU |
| Inworld Voice Isolator v1 | no disponible | no disponible | Eliminacion de ruido conservando todas las voces | no disponible | no disponible |
| NVIDIA Real-time RE-USE | no disponible | no disponible | Mejora de voz en tiempo real | licencia de investigacion | GPU |

En WER medio sobre los 9 conjuntos de prueba, este modelo obtiene 15,49% frente a 38,81% de Inworld Voice Isolator v1. En falsas interrupciones por minuto, la variante agent en modo voicebot alcanza 0,26 frente a 0,95 de NVIDIA RE-USE y 1,18 de VoxLock live.

## Limitaciones y advertencias

- Solo soporta ingles; no se ha validado su comportamiento en otros idiomas.
- En llamadas de centro de contacto con un unico interlocutor limpio, el WER empeora respecto a no procesar (5,32 frente a 0,04), por lo que puede degradar audio ya limpio.
- La version principal pierde un 6,7% del habla del caller en el VAD, y la variante agent un 2,4% de turnos, lo que puede afectar a la deteccion de turnos.
- La licencia es "other"; no se detallan en la informacion disponible las condiciones exactas para uso comercial, por lo que es necesario revisar los terminos del repositorio antes de desplegarlo en produccion.
- Riesgo de alucinacion no aplica directamente al ser un modelo de audio, pero el aislamiento puede eliminar senal util si el interlocutor principal cambia o si hay solapamiento de voces.
- El rendimiento depende de la calidad del enrollment en modo live; en escenarios con multiples voces simultaneas el WER sigue siendo elevado (49,90 en centro de contacto con otra voz).
- La ventana de contexto de audio es de 10 s, lo que limita la informacion disponible para el aislamiento en conversaciones con cambios frecuentes de hablante.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Scicom-intl/voice-isolator-cpu
- Version GPU: https://huggingface.co/Scicom-intl/voice-isolator
- Paper: https://arxiv.org/abs/2610.35272
- Plugin de LiveKit (STT-API): https://github.com/Scicom-AI-Enterprise-Organization/STT-API/tree/main/stt_api/livekit_plugin/voice_isolator
- Inworld Voice Isolator v1: https://huggingface.co/inworld/voice-isolator
