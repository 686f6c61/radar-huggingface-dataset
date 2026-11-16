# adventists-ai/Sophon-Realtime-4B-Tag

## Resumen

Sophon-Realtime-4B-Tag es un modelo de voz a voz (speech-to-speech) full-duplex de 4.000 millones de parametros desarrollado por adventists-ai, la version mas pequena de la familia Sophon-Realtime. Su particularidad es que escucha mientras el usuario habla, decide a partir de la senal de voz cuando el turno ha terminado y genera una respuesta con etiquetas de sonido (`[laughter]`, `[cough]`, `[sigh]`, `[breath]`, `<strong>…</strong>`) que un modelo TTS expresivo (tag-tts) interpreta. Esta disenado para ejecutarse en una unica GPU de 32 GB, con un consumo aproximado de 27 GB.

El nucleo de razonamiento es DuplexJev-4B-Para, un modelo de voz de 4B al que se le ha fusionado un adaptador de escritura de etiquetas. El modelo es exclusivamente de audio: no procesa vision. Se sirve como un unico modelo vLLM-Omni con endpoints `/v1/realtime` (compatible con OpenAI Realtime) y `/v1/chat/completions`, y su licencia es Apache-2.0.

Es relevante ahora porque cubre el nicho de conversacion por voz en tiempo real full-duplex en hardware de gama profesional pero asequible (una sola GPU de 32 GB), con una puntuacion en Full-Duplex-Bench v1.0 (94,3) practicamente identica a la de sus hermanos de 32B (94,0), aunque con una capacidad de razonamiento sustancialmente menor (VoiceBench 62,4 frente a 82,8).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Full-duplex speech-to-speech; cerebro DuplexJev-4B-Para con adaptador de etiquetas fusionado, mas modulo talker tag-tts para sintesis expresiva |
| Parametros totales | 4B (cerebro thinker) + tag-tts (tamano no disponible) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16 (pesos del thinker); otras cuantizaciones no disponibles |
| Idiomas soportados | chino (zh) e ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (tambien ONNX en los tags del repo); layout `thinker/`, `talker/`, `voices/` |
| Tamano del repositorio | 16,7 GB |
| Version | 1.4.0 (2026-11-16) |
| Pipeline | any-to-any |

## Arquitectura y entrenamiento

El modelo sigue el diseno full-duplex de la familia Sophon-Realtime: un cerebro de 4B (DuplexJev-4B-Para) que procesa el flujo de audio de entrada de forma continua, detecta el final del turno del usuario por la propia senal de voz (no por VAD externo) y emite la respuesta textual anotada con etiquetas paralinguisticas. Esas etiquetas las interpreta un modelo TTS expresivo independiente (tag-tts), que es quien produce el audio final. El repositorio incluye ademas un directorio `voices/` para clonacion de voz zero-shot.

La innovacion principal es la integracion de todo el pipeline en un unico modelo servido por vLLM-Omni, con soporte de back-channels, barge-in (interrupcion del usuario) y generacion solapada de habla y texto ("speaks while it writes"). No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO. El modelo solo maneja audio; no tiene capacidad de vision.

## Capacidades

- Conversacion por voz full-duplex: escucha de forma continua mientras el usuario habla.
- Deteccion de fin de turno basada en la voz del usuario.
- Back-channels (asentimientos y respuestas breves durante el turno del otro).
- Barge-in: gestiona interrupciones del usuario a mitad de respuesta.
- Generacion de etiquetas de sonido paralinguisticas: `[laughter]`, `[cough]`, `[sigh]`, `[breath]`, enfasis con `<strong>…</strong>`.
- Sintesis de voz expresiva mediante el modelo tag-tts, con clonacion de voz zero-shot.
- Salida de texto y audio de forma solapada (habla mientras escribe).
- API compatible con OpenAI Realtime (`/v1/realtime`) y chat completions (`/v1/chat/completions`).
- Multilingue limitado a chino e ingles.
- Sin vision, sin tool calling ni capacidades de agente documentadas.

## Casos de uso

- Demos locales de voz en tiempo real: el modelo cabe en una sola GPU de 32 GB y se levanta con `install.sh` y `start.sh`, lo que permite montar una demo de conversacion por voz sin infraestructura en la nube.
- Companeros y personajes conversacionales: la presencia de etiquetas de risa, suspiro y respiracion, junto con la clonacion de voz, permite construir personajes con expresividad vocal creible para juegos o aplicaciones de entretenimiento.
- Investigacion sobre turn-taking: el modelo expone comportamiento full-duplex medible (Full-Duplex-Bench 94,3) y es util para estudiar deteccion de fin de turno, back-channels e interrupciones en entornos controlados.
- Atencion al cliente de bajo riesgo: para flujos guiados donde la correccion factual no es critica (saludos, enrutamiento, respuestas de cortesia), el modelo ofrece latencia de primera respuesta de 0,4 s en RTX PRO 6000.
- Interfaces de voz para accesibilidad: conversacion manos libres con interrupcion natural, adecuada para usuarios que necesitan dialogos fluidos sin pulsar botones.
- Prototipado de asistentes con voz clonada: el directorio `voices/` y la clonacion zero-shot permiten validar productos de voz personalizada antes de migrar a los builds de 32B.

## Benchmarks y rendimiento

| Metrica | 4B Tag | 32B (publicado) |
|---|---|---|
| VoiceBench overall | 62,4 | 82,8 |
| Big Bench Audio (respuesta hablada, transcrita) | 44,3 % | 81,8 % |
| Full-Duplex-Bench v1.0 (media de 2 tareas de pausa, turn-taking e interrupcion) | 94,3 | 94,0 |
| Tasa de etiquetas de sonido en conversaciones held-out (referencia: 0,36) | 0,36 | no disponible |
| Primera respuesta de audio, un usuario (RTX PRO 6000) | 0,4 s | no disponible |

Comparativa de VoiceBench con otros modelos full-duplex abiertos citada por el autor: Sophon-Realtime-4B-Tag 62,4; MiniCPM-o 71,2; Freeze-Omni 55,2; Moshi 29,5.

Condiciones de medicion segun el autor: RTX PRO 6000, evaluadores oficiales de VoiceBench con juez gpt-4o-mini y AlpacaEval sobre el subconjunto estandar de 199 preguntas; Big Bench Audio con 1.000 preguntas y GPT-4.1 evaluando la transcripcion; Full-Duplex-Bench v1.0 con los mismos scripts que la release de 32B; primera respuesta medida con `client_example.py`, mediana de 6 ejecuciones.

## Requisitos de hardware

- VRAM estimada: aproximadamente 27 GB en bf16, disenado para una GPU de 32 GB.
- GPU recomendadas: RTX PRO 6000 (referencia de las mediciones), A100 40 GB, H100, cualquier GPU con al menos 32 GB de memoria.
- No cabe en GPUs de consumo de 24 GB (RTX 4090, 3090); para ese perfil existe la variante Flash (aproximadamente 21 GB en 24 GB).
- Despliegue: vLLM 0.30 con vLLM-Omni 0.30 y el plugin de adventists-ai; el `start.sh` detecta el modelo y selecciona la configuracion de 32 GB.
- Latencia: primera respuesta de audio de 0,4 s en RTX PRO 6000.
- Throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Full-duplex | VoiceBench | Licencia | Hardware |
|---|---|---|---|---|---|
| Sophon-Realtime-4B-Tag | 4B + tag-tts | Si | 62,4 | Apache-2.0 | 1 GPU de 32 GB (~27 GB) |
| Sophon-Realtime-4B-Flash | 4B + TTS ligero | Si | no disponible (Full-Duplex-Bench 87,7) | Apache-2.0 | 1 GPU de 24 GB (~21 GB) |
| Sophon-Realtime-4B-E2E | 4B + talker ~350M | Si | no disponible (Full-Duplex-Bench 92,3) | Apache-2.0 | 1 GPU de 32 GB (~31 GB) |
| MiniCPM-o | no disponible | Si | 71,2 | no disponible | no disponible |
| Freeze-Omni | no disponible | Si | 55,2 | no disponible | no disponible |
| Moshi | no disponible | Si | 29,5 | no disponible | no disponible |

## Limitaciones y advertencias

- Capacidad de razonamiento y conocimiento muy inferior a la de los builds de 32B (VoiceBench 62,4 frente a 82,8; Big Bench Audio 44,3 % frente a 81,8 %), con riesgo alto de afirmar hechos incorrectos con seguridad. El propio autor recomienda no usarlo cuando las respuestas deban ser correctas.
- Solo admite chino e ingles; no hay soporte documentado de otros idiomas.
- No procesa vision ni dispone de tool calling o capacidades de agente documentadas.
- Riesgo de alucinacion factual elevado en dominios de conocimiento; adecuado para demos, personajes e investigacion, no para produccion con requisitos de exactitud.
- La clonacion de voz zero-shot exige consentimiento explicito: solo se debe clonar la propia voz o voces con permiso; el aviso legal esta en el fichero `NOTICE`.
- La licencia Apache-2.0 cubre los pesos, pero el `NOTICE` detalla las fuentes de los pesos empaquetados, que conviene revisar antes de uso comercial.
- La longitud de contexto no esta publicada, lo que dificulta planificar conversaciones largas.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validacion independiente de los resultados publicados.

## Enlaces

- Hugging Face: https://huggingface.co/adventists-ai/Sophon-Realtime-4B-Tag
- ModelScope: https://www.modelscope.cn/models/AdventistsAI/Sophon-Realtime-4B-Tag
- Repositorio GitHub: https://github.com/adventists-ai/sophon-realtime
- Instrucciones del build Tag: https://github.com/adventists-ai/sophon-realtime/blob/main/tag/README.md
- Changelog: https://github.com/adventists-ai/sophon-realtime/blob/main/CHANGELOG.md
- Cerebro base DuplexJev-4B-Para: https://huggingface.co/adventists-ai/DuplexJev-4B-Para
- Variante Flash: https://huggingface.co/adventists-ai/Sophon-Realtime-4B-Flash
- Variante E2E: https://huggingface.co/adventists-ai/Sophon-Realtime-4B-E2E
- Build de 32B Tag: https://huggingface.co/adventists-ai/Sophon-Realtime-32B-Tag
- Build de 32B Flash: https://huggingface.co/adventists-ai/Sophon-Realtime-32B-Flash
- Build de 32B E2E: https://huggingface.co/adventists-ai/Sophon-Realtime-32B-E2E
- API alojada (compatible con OpenAI Realtime): https://api.adventists.ai/console/
- Documentacion de la API: https://api.adventists.ai/console/docs
