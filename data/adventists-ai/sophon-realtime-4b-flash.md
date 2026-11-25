# adventists-ai/Sophon-Realtime-4B-Flash

## Resumen

Sophon-Realtime-4B-Flash es un modelo de voz a voz (speech-to-speech) full-duplex de 4.000 millones de parametros desarrollado por adventists-ai, disenado para mantener conversaciones habladas en tiempo real. A diferencia de los pipelines clasicos de tipo VAD + ASR + LLM + TTS, el modelo escucha mientras el usuario habla, decide a partir de la propia senal de voz cuando el interlocutor ha terminado y genera una respuesta con etiquetas de sonido paralinguisticas (`[laughter]`, `[cough]`, `[sigh]`, `[breath]`, `<strong>…</strong>`) que un modelo de sintesis ligero convierte en audio.

Forma parte de la familia Sophon-Realtime, que incluye builds de 4B y 32B en tres variantes (Tag, Flash y E2E). El cerebro de 4B es DuplexJev-4B-Para con un adaptador de escritura de etiquetas fusionado; la variante Flash anade un modelo de sintesis mas rapido que genera un pase forward por cada trama de 80 ms. Todo el sistema se sirve como un unico modelo vLLM-Omni con endpoints `/v1/realtime` y `/v1/chat/completions`.

Su relevancia actual radica en que ofrece interaccion full-duplex (back-channels, barge-in, gestion de pausas) en una sola GPU de 24 GB, con un consumo aproximado de 21 GB y un tiempo hasta el primer audio de 0,21 s en una RTX PRO 6000. La licencia Apache-2.0 y los pesos abiertos lo hacen apto para investigacion sobre turn-taking y para demos locales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Full-duplex speech-to-speech; cerebro transformer de 4B (DuplexJev-4B-Para) con adaptador de etiquetas + modelo de sintesis ligero (tag-tts) |
| Parametros totales | 4B (cerebro); el talker de la variante E2E es de ~350M, no aplicable a Flash |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; pesos en bf16 |
| Idiomas soportados | chino (zh) e ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (layout `config.json`, `thinker/`, `talker/`, `voices/`) |
| Tamano del repo | 13,0 GB |
| Pipeline | audio-to-audio |
| Libreria / runtime | vLLM 0.30 + vLLM-Omni 0.30 con plugin |
| Tramas de audio | 80 ms por pase forward en el sintetizador |
| VRAM de inferencia | ~21 GB en una GPU de 24 GB |

## Arquitectura y entrenamiento

El modelo sigue un diseno full-duplex: el cerebro de 4B procesa simultaneamente el flujo de audio entrante y el estado de la conversacion, sin necesidad de un detector de actividad vocal externo. Sobre el cerebro se ha fusionado un adaptador que aprende a insertar etiquetas de sonido en el texto de respuesta, de modo que el sintetizador (tag-tts) las interpreta y las convierte en audio expresivo. En la variante Flash, este sintetizador es un modelo de voz mas ligero y rapido que el de la variante Tag, con un unico pase forward por cada trama de 80 ms, lo que reduce el tiempo hasta el primer audio a 0,21 s.

No se dispone de informacion publica sobre el numero de tokens de entrenamiento, la composicion del dataset ni sobre si se aplicaron tecnicas de RLHF o DPO. La model card unicamente indica que el cerebro es DuplexJev-4B-Para con el adaptador de etiquetas fusionado, que el modelo es solo de voz (sin vision) y que la tasa de etiquetas de sonido en conversaciones held-out es de 0,36, identica a la de los datos de referencia. El sistema se empaqueta como un unico modelo vLLM-Omni, lo que simplifica el despliegue frente a pipelines multi-etapa.

## Capacidades

- Conversacion de voz a voz full-duplex: escucha mientras el usuario habla y responde sin esperar a un turno cerrado.
- Deteccion de fin de turno basada en la propia senal de voz, sin VAD externo.
- Back-channels (asentimientos, interjecciones) y gestion de barge-in (interrupcion del usuario).
- Generacion de etiquetas paralinguisticas: `[laughter]`, `[cough]`, `[sigh]`, `[breath]`, `<strong>…</strong>`.
- Sintesis de voz expresiva mediante el modelo tag-tts integrado.
- Clonacion de voz zero-shot (documentada en el README del repositorio).
- Soporte de modo Live.
- Endpoints compatibles con OpenAI Realtime: `/v1/realtime` y `/v1/chat/completions`.
- Multilinguee limitado a chino e ingles.
- Sin capacidades de vision ni de procesamiento de imagen.

## Casos de uso

- Demos locales de voz en tiempo real: el modelo cabe en una GPU de 24 GB (~21 GB) y arranca con un script (`start.sh`) que detecta la configuracion de 24 GB, lo que permite montar una demo interactiva en una sola maquina sin infraestructura adicional.
- Companeros y personajes conversacionales: las etiquetas de sonido (`[laughter]`, `[sigh]`) y los back-channels aportan naturalidad a interacciones de larga duracion, adecuadas para aplicaciones de acompanamiento o entretenimiento.
- Investigacion sobre turn-taking: el modelo expone comportamiento full-duplex medible con Full-Duplex-Bench v1.0 (87,7 en la variante Flash), lo que lo hace util para estudiar gestion de pausas, interrupciones y solapamiento de habla.
- Prototipado de agentes de voz con API compatible OpenAI: al servir `/v1/realtime`, se puede integrar en clientes existentes que hablen el protocolo Realtime de OpenAI sin reescribir la capa de transporte.
- Clonacion de voz para produccion de contenido: la clonacion zero-shot documentada permite generar locuciones con una voz de referencia propia o autorizada, con la advertencia explicita de usar solo voces propias o con permiso.
- Evaluacion comparativa de modelos full-duplex abiertos: al publicar pesos y benchmarks (VoiceBench, Big Bench Audio, Full-Duplex-Bench), sirve como baseline reproducible frente a Freeze-Omni, Moshi o MiniCPM-o.
- Asistentes de voz para chino e ingles en entornos con GPU unica: el soporte bilinguee y el bajo requisito de VRAM permiten desplegar un asistente conversacional en una sola tarjeta profesional de 24 GB.

## Benchmarks y rendimiento

| Benchmark | 4B (Flash) | 32B (publicado) |
|---|---|---|
| VoiceBench overall | 62,4 | 82,8 |
| Big Bench Audio (respuesta hablada, transcrita) | 44,3 % | 81,8 % |
| Full-Duplex-Bench v1.0 (media de 2 tareas de pausa, turn-taking e interrupcion) | 87,7 | 94,0 |
| Tasa de etiquetas de sonido en conversaciones held-out (referencia: 0,36) | 0,36 | no disponible |
| Primer audio, un usuario (RTX PRO 6000) | 0,21 s | no disponible en esta ficha |

Comparativa de VoiceBench citada en la model card: Sophon-Realtime-4B (62,4) supera a Freeze-Omni (55,2) y Moshi (29,5) y queda por debajo de MiniCPM-o (71,2). Las mediciones se realizaron el 2026-11-16 en una RTX PRO 6000, con evaluadores oficiales de VoiceBench y juez gpt-4o-mini sobre el subconjunto estandar de 199 preguntas (media de 9 tareas); Big Bench Audio con 1.000 preguntas y jueces GPT-4.1 sobre la transcripcion de la respuesta hablada.

## Requisitos de hardware

- VRAM de inferencia: aproximadamente 21 GB, disenado para una GPU de 24 GB.
- GPU recomendadas: RTX PRO 6000 (mediciones oficiales), cualquier GPU profesional de 24 GB; las builds de 32B requieren una GPU de 32 GB (~27 GB en Tag, ~31 GB en E2E).
- GPU de consumo: no se confirma compatibilidad con tarjetas consumer; el requisito de ~21 GB excluye la mayoria de GPUs de 16 GB y encaja justo en modelos de 24 GB como la RTX 4090, aunque la model card no lo valida explicitamente.
- Apple silicon: existe una build separada, Sophon-Realtime-4B-Flash-MLX, para Macs con 16 GB o mas (MLX, novedad en 1.5.0).
- Despliegue: vLLM 0.30 + vLLM-Omni 0.30 con plugin, instalado via `install.sh` (entorno Python 3.12); servido con `start.sh` y cliente de ejemplo `client_example.py`.
- Alternativa sin GPU: API alojada compatible con OpenAI Realtime, con 3 horas gratuitas de voz tras registro.
- Latencia: 0,21 s hasta el primer audio con un usuario en RTX PRO 6000; el sintetizador ejecuta un pase forward por trama de 80 ms.
- Throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | VoiceBench overall | Full-Duplex-Bench v1.0 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Sophon-Realtime-4B-Flash | 4B | full-duplex speech-to-speech | 62,4 | 87,7 | Apache-2.0 | pesos abiertos en HF y ModelScope |
| Sophon-Realtime-32B (familia) | 32B | full-duplex speech-to-speech | 82,8 | 94,0 | Apache-2.0 | pesos abiertos en HF y ModelScope |
| MiniCPM-o | no disponible | speech-to-speech | 71,2 | no disponible | no disponible | no disponible |
| Freeze-Omni | no disponible | speech-to-speech | 55,2 | no disponible | no disponible | no disponible |
| Moshi | no disponible | full-duplex speech-to-speech | 29,5 | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Capacidad de conocimiento y razonamiento muy inferior a la de las builds de 32B (VoiceBench 62,4 frente a 82,8; Big Bench Audio 44,3 % frente a 81,8 %), por lo que puede afirmar datos incorrectos con seguridad. La propia model card recomienda usar 32B o la API alojada cuando las respuestas deban ser correctas.
- Riesgo de alucinacion en contenido factual: el modelo esta pensado para demos locales, companeros, personajes e investigacion sobre turn-taking, no para asistencia con precision factual.
- Solo voz: el cerebro de 4B no tiene vision.
- Idiomas limitados a chino e ingles.
- Licencia Apache-2.0, pero el aviso `NOTICE` del repositorio detalla las fuentes de los pesos empaquetados; es necesario revisarlo antes de uso comercial.
- Restriccion etica explicita: solo se debe clonar la propia voz o una voz para la que se tenga permiso.
- La longitud de contexto, los tipos de cuantizacion y el throughput no estan documentados.
- El rendimiento medido corresponde a una RTX PRO 6000; en GPUs de 24 GB con menos compute la latencia hasta el primer audio puede diferir.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/adventists-ai/Sophon-Realtime-4B-Flash
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/adventists-ai/Sophon-Realtime
- Repositorio GitHub: https://github.com/adventists-ai/sophon-realtime
- Instrucciones de la variante Flash: https://github.com/adventists-ai/sophon-realtime/blob/main/flash/README.md
- Changelog: https://github.com/adventists-ai/sophon-realtime/blob/main/CHANGELOG.md
- Build MLX para Apple silicon: https://huggingface.co/adventists-ai/Sophon-Realtime-4B-Flash-MLX
- Variante Tag (4B): https://huggingface.co/adventists-ai/Sophon-Realtime-4B-Tag
- Variante E2E (4B): https://huggingface.co/adventists-ai/Sophon-Realtime-4B-E2E
- Build 32B Tag: https://huggingface.co/adventists-ai/Sophon-Realtime-32B-Tag
- Build 32B Flash: https://huggingface.co/adventists-ai/Sophon-Realtime-32B-Flash
- Build 32B E2E: https://huggingface.co/adventists-ai/Sophon-Realtime-32B-E2E
- Cerebro base DuplexJev-4B-Para: https://huggingface.co/adventists-ai/DuplexJev-4B-Para
- ModelScope (Flash): https://www.modelscope.cn/models/AdventistsAI/Sophon-Realtime-4B-Flash
- ModelScope (Tag): https://www.modelscope.cn/models/AdventistsAI/Sophon-Realtime-4B-Tag
- API alojada (consola): https://api.adventists.ai/console/
- Documentacion de la API: https://api.adventists.ai/console/docs
