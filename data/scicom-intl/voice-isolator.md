# Scicom-intl/voice-isolator

## Resumen

voice-isolator es un modelo de aislamiento de voz y extraccion de hablante objetivo (target-speaker extraction) desarrollado por Scicom-intl. Su funcion es preservar la voz del interlocutor principal de una llamada y eliminar otras voces y ruido de fondo antes de que el sistema de deteccion de actividad vocal (VAD) y el reconocimiento automatico del habla (ASR) de un agente de voz procesen el audio. El modelo opera de forma causal y en streaming sobre servidor con GPU, con entrada y salida a 16 kHz y tramas de 10 ms, lo que lo hace apto para integracion en agentes conversacionales en tiempo real.

Tecnicamente se trata de un transformer causal de 555 millones de parametros que procesa los ultimos 10 segundos de audio, acompanado de una version causal de WavLM-Large. Consume 47,7 GMAC por segundo de audio y mantiene un estado de 115 MB por llamada, sin look-ahead mas alla de la ventana de 20 ms. El hablante objetivo se inscribe a partir de la propia llamada (los 3 segundos mas fuertes hasta el momento, fijados a los 15 s) o desde un clip externo.

El modelo es relevante porque aborda un problema practico en produccion: en llamadas reales, el ASR de un agente de voz sufre cuando hay otras personas hablando o ruido ambiental. Los resultados publicados muestran reducciones drastricas de la tasa de error de palabra (WER) en multiples conjuntos de prueba, y su diseno streaming con baja latencia (40-50 ms en agentes LiveKit reales) lo posiciona como componente previo al VAD y al STT en pipelines de atencion telefonica automatizada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal sobre los ultimos 10 s, con WavLM-Large hecho causal |
| Parametros totales | 555.229.786 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | ventana causal de 10 s de audio; sin look-ahead mas alla de 20 ms |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | other |
| Formato de pesos | safetensors |
| Entrada/salida | audio 16 kHz, tramas de 10 ms (audio-to-audio) |
| Coste computacional | 47,7 GMAC por segundo de audio |
| Estado por llamada | 115 MB |
| Tamano del repo | 6,8 GB |

## Arquitectura y entrenamiento

El modelo combina un transformer causal que opera sobre los ultimos 10 segundos de audio con una variante causal de WavLM-Large utilizada como extractor de representaciones. La causalidad es un requisito de diseno: el sistema no puede mirar hacia el futuro del flujo de audio, y el unico margen de anticipacion es la ventana de 20 ms. El modelo mantiene un estado de 115 MB por llamada, lo que permite multiplexar muchas llamadas concurrentes en un mismo servidor GPU. El coste de 47,7 GMAC por segundo de audio condiciona el throughput y el numero de streams simultaneos por GPU.

La inscripcion del hablante objetivo se realiza de dos formas: en linea, tomando los 3 segundos mas fuertes de la llamada hasta el momento y fijandolos a los 15 s, o mediante un clip de referencia externo. El modelo se distribuye en tres variantes: la version de publicacion (`Scicom-intl/voice-isolator`), una version para agentes que hablan primero (`agent`) y una version pequena (`agent-small`) que multiplica por seis el numero de llamadas simultaneas por GPU. Ademas existe una version destilada para ejecucion en un solo hilo de CPU dentro del agente (`Scicom-intl/voice-isolator-cpu`). No se detalla en la informacion disponible el numero de tokens de audio de entrenamiento, la composicion exacta del dataset ni si se emplearon tecnicas de RLHF o DPO; la seleccion de hiperparametros y variantes se realizo unicamente sobre conjuntos de desarrollo (WER medio 10,49% para este modelo frente a 11,91% para VoxLock), sin usar los conjuntos de prueba para elegir.

## Capacidades

- Aislamiento de voz del interlocutor principal en llamadas, eliminando otras voces y ruido de fondo.
- Extraccion de hablante objetivo (target-speaker extraction) con inscripcion en linea desde la propia llamada o desde un clip.
- Procesamiento causal y streaming con tramas de 10 ms, apto para tiempo real.
- Integracion como procesador de audio previo al VAD, al detector de turnos y al STT en agentes LiveKit.
- Modo voicebot para agentes que saludan primero al interlocutor.
- Despliegue en servidor GPU multiproceso (`vi.server_mp`) con soporte de hasta 128 streams por servidor y WebSocket por llamada.
- Version para CPU de un solo hilo orientada a ejecucion dentro del agente.
- No se documentan capacidades de generacion de texto, codigo, matematicas, vision ni tool calling: es un modelo exclusivamente audio-a-audio.

## Casos de uso

- Atencion al cliente telefonica automatizada: el modelo se coloca antes del VAD y del STT del agente para que la transcripcion solo contenga la voz del cliente, reduciendo el WER en entornos con ruido y voces de fondo (por ejemplo, de 66,36% a 14,26% en las llamadas de prueba de ai-coustics).
- Agentes de voz en LiveKit: se integra como `noise_cancellation` en `AudioInputOptions` con `RemoteIsolator`, compartiendo un backend por proceso entre todas las llamadas y anadiendo 40-50 ms de latencia con 32-64 llamadas concurrentes.
- Centros de contacto con multiples hablantes: en escenarios de call-centre con otra voz presente, reduce el WER de 69,79% a 47,52%, permitiendo que el agente distinga al cliente de acompanantes o ruido de oficina.
- Reuniones y transcripcion de salas: en los conjuntos AMI y NOTSOFAR reduce el WER de 42,59% a 10,18% y de 34,70% a 7,67% respectivamente, util para asistentes que deben seguir solo al hablante designado.
- Agentes que hablan primero: con el modelo `agent` y el modo voicebot, las pausas por ruido interrumpen menos al agente, mejorando la fluidez de la conversacion en entornos ruidosos.
- Despliegue de alto volumen en una sola GPU: la variante `agent-small` permite seis veces mas llamadas simultaneas por GPU, adecuada para servicios con cientos de conversaciones concurrentes donde la latencia y el coste por llamada son criticos.
- Procesamiento en el borde o en el propio agente: la version CPU destilada permite ejecutar el aislamiento dentro del proceso del agente sin servidor GPU dedicado, para despliegues con menos recursos.

## Benchmarks y rendimiento

Tasa de error de palabra (WER, %), menor es mejor. "Live" indica inscripcion desde la propia llamada.

| Conjunto de prueba | Sin procesar | VoxLock live | VoxLock, 3 s mas fuertes * | Este modelo, live | Este modelo, 3 s mas fuertes * |
|---|---:|---:|---:|---:|---:|
| Krisp VI benchmark | 23,19 | 5,63 | 5,19 | 5,74 | 5,93 |
| AMI headset, ventanas de VoxLock | 33,00 | 11,71 | 11,26 | 10,19 | 11,37 |
| AMI test meetings | 42,59 | 12,07 | 9,70 | 10,18 | 10,35 |
| AMI test, ventanas de 60 s | 121,79 | 23,66 | 19,52 | 16,13 | 16,22 |
| NOTSOFAR | 34,70 | 8,84 | 7,61 | 7,67 | 7,67 |
| AliMeeting (CER) | 29,40 | 16,28 | 17,11 | 15,69 | 15,40 |
| Call-centre, solo el cliente | 0,04 | 2,92 | 3,37 | 5,58 | 5,66 |
| Call-centre + otra voz | 69,79 | 56,65 | 47,05 | 47,52 | 47,87 |
| ai-coustics test calls | 66,36 | 24,55 | 20,31 | 14,26 | 12,54 |

\* Protocolo de benchmark de VoxLock: muestra de los primeros 15 s de la llamada, por lo que no es live.

Latencia medida en agentes LiveKit reales (tramas de 50 ms, `--chunk-hops 4`): 40 ms de mediana con 32 llamadas y 50 ms con 64. Con una sola llamada y el limite de retardo por defecto de 40 ms, el 33% del audio paso sin filtrar; con `max_lag_ms=250` la salida coincide con la del servidor, 90 ms por detras.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el repo pesa 6,8 GB y el estado por llamada es de 115 MB, por lo que el consumo base de pesos mas el estado de cada stream condiciona la VRAM total.
- GPU recomendadas: no se especifican modelos concretos en la informacion disponible; el despliegue previsto es en servidor GPU con `vi.server_mp` y hasta 128 streams por servidor.
- Capacidad en GPU de consumo: no disponible.
- Opciones de despliegue: servidor GPU multiproceso (`python -m vi.server_mp`), imagen Docker (`voice-isolator/Dockerfile`), integracion en proceso con `vi.stream.Stream(...).push(chunk)`, WebSocket por llamada con PCM int16 en ambos sentidos, y plugin de LiveKit (`stt_api.livekit_plugin.voice_isolator`). Existe una version CPU independiente (`Scicom-intl/voice-isolator-cpu`).
- Latencia y throughput: 40 ms de mediana con 32 llamadas y 50 ms con 64 en agentes LiveKit reales; 47,7 GMAC por segundo de audio; la variante `agent-small` multiplica por seis las llamadas simultaneas por GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Resultado destacado |
|---|---|---|---|---|---|
| Scicom-intl/voice-isolator | 555 M | ventana causal de 10 s | Transformer causal + WavLM-Large causal, streaming | other | WER 10,18 en AMI test meetings; 14,26 en ai-coustics |
| VoxLock (referencia del paper) | no disponible | no disponible | Aislamiento de voz comparado en el paper | no disponible | WER 12,07 en AMI test meetings; 24,55 en ai-coustics |
| Inworld Voice Isolator v1 | no disponible | no disponible | Aislamiento de voz (mencionado en la model card) | no disponible | no disponible en la informacion proporcionada |
| Scicom-intl/voice-isolator-cpu | no disponible | no disponible | Version destilada para un hilo de CPU | other | no disponible |

La informacion disponible no permite comparar parametros ni contexto de VoxLock ni de Inworld Voice Isolator v1; solo se dispone de sus resultados parciales de WER en la tabla del paper.

## Limitaciones y advertencias

- Solo soporta ingles (`en`); no se documenta rendimiento en otros idiomas.
- La licencia es "other": es imprescindible revisar los terminos exactos antes de cualquier uso comercial.
- El modelo esta disenado exclusivamente para aislamiento de voz; no genera texto ni realiza otras tareas.
- La inscripcion en linea depende de los primeros 15 s de llamada; si el cliente tarda en hablar o el ruido domina ese periodo, la seleccion del hablante objetivo puede degradarse.
- En el conjunto "Call-centre, caller alone" el modelo empeora el WER respecto a no procesar (5,58% frente a 0,04%), lo que indica que puede introducir artefactos en audio ya limpio.
- Con una sola llamada y el limite de retardo por defecto de 40 ms, el 33% del audio pasa sin filtrar; es necesario ajustar `max_lag_ms` en despliegues de bajo volumen.
- La latencia anadida (40-50 ms con 32-64 llamadas) debe tenerse en cuenta en pipelines sensibles al retardo.
- No se documentan sesgos especificos ni tasas de alucinacion (no aplica al ser audio-a-audio), pero al ser un modelo entrenado en ingles y sobre dominios concretos (reuniones, call-centre) su generalizacion a otros acentos y condiciones acusticas no esta cuantificada en la informacion disponible.
- El estado de 115 MB por llamada limita el numero de streams concurrentes por servidor junto con la VRAM disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Scicom-intl/voice-isolator
- Version CPU: https://huggingface.co/Scicom-intl/voice-isolator-cpu
- Paper "The Voice on the Line": https://arxiv.org/abs/2610.35272 (arXiv:2610.35272)
- Plugin de LiveKit (STT-API `voice_isolator`): https://github.com/Scicom-AI-Enterprise-Organization/STT-API/tree/main/stt_api/livekit_plugin/voice_isolator
- Inworld Voice Isolator v1 (referencia): https://huggingface.co/inw (enlace truncado en la informacion disponible)
