# adventists-ai/Sophon-Realtime-32B-Tag

## Resumen

Sophon-Realtime-32B-Tag es un modelo de audio-a-audio en tiempo real desarrollado por adventists-ai, disenado para conversacion de voz full-duplex. Se trata de la variante "Tag" de la familia Sophon-Realtime v1, en la que un "cerebro" de 32B parametros escucha al usuario, decide cuando intervenir y genera la respuesta junto con etiquetas de sonido en linea (risas, suspiros, enfasis) que un modelo de voz expresivo (tag-tts) interpreta mientras el texto aun se esta escribiendo. Las etiquetas nunca se leen en voz alta y se eliminan del flujo de texto.

El sistema completo se sirve como un unico modelo vLLM-Omni que integra el thinker, el talker tag-tts y un vocoder flow + HiFT, todo sobre una sola GPU de 80 GB. Soporta entrada de audio, salida de audio y texto, con capacidad de turn-taking, barge-in (interrupcion) y backchannel (asentimientos tipo "mm-hm"). Los idiomas soportados son chino e ingles.

La relevancia del modelo radica en su rendimiento entre modelos full-duplex abiertos: lidera VoiceBench (82.8) y Big Bench Audio (81.8%) en su categoria, y destaca en comprension paralinguistica (48.6 en LISTEN, StressTest y MSPB), por delante de Gemini 3.8 Flash y Qwen3-Omni. Su licencia Apache-2.0 permite uso comercial sin restricciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Sistema full-duplex multimodal: thinker LLM 32B + talker tag-tts (modelo de voz expresivo) + vocoder flow + HiFT; servido como un unico modelo vLLM-Omni |
| Parametros totales | 32B (thinker); tamano del talker y vocoder no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | chino (zh), ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors, ONNX |

## Arquitectura y entrenamiento

Sophon-Realtime-32B-Tag es un sistema compuesto por tres etapas que se ejecutan como un unico modelo en vLLM-Omni: un thinker de 32B parametros que procesa la entrada de audio (y potencialmente vision, segun la demo del Space), gestiona el turn-taking y genera la respuesta textual con etiquetas de sonido inline; un talker tag-tts que convierte esas etiquetas en habla expresiva; y un vocoder basado en flow matching + HiFT que sintetiza la onda de audio. El modelo esta construido sobre el framework DuplexJev de adventists-ai.

No se dispone de informacion detallada sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO. La model card menciona que el modelo puede ajustarse finamente para persona, tono y conocimiento de dominio con ms-swift. La innovacion tecnica principal es la generacion de etiquetas paralinguisticas inline que se eliminan del flujo de texto antes de la sintesis, permitiendo que el modelo "actue" la respuesta (risas, suspiros, enfasis) sin que las etiquetas se pronuncien.

## Capacidades

- Conversacion de voz full-duplex en tiempo real: escucha continua, turn-taking, barge-in e interrupciones, backchannel.
- Generacion de audio expresivo con etiquetas de sonido inline (risa, suspiro, respiracion, carraspeo, enfasis) interpretadas por el talker tag-tts.
- Comprension paralinguistica: deteccion de emocion, enfasis, sarcasmo, risas y suspiros en la voz del usuario.
- Entrada de audio a salida de audio y texto (pipeline audio-to-audio).
- Soporte de tool calling / function calling en modo full-duplex (Full-Duplex-Bench v3 Pass@1 48%).
- Clonacion de voz zero-shot con un clip de 3-10 segundos (desde v1.1), sin fine-tuning ni reinicio.
- Multilingue en chino e ingles.
- Compatibilidad con la interfaz OpenAI Realtime (ws://HOST:8000/v1/realtime) y con POST /v1/chat/completions.
- Posible entrada de vision (la demo del Space permite activar la camara; no confirmado en especificaciones).

## Casos de uso

- Atencion al cliente por voz: el modelo gestiona conversaciones multi-turno con turn-taking natural y barge-in, permitiendo al usuario interrumpir y al agente responder de forma expresiva y empatica, adecuado por su comprension paralinguistica y su tasa de respuesta del 100%.
- Asistentes de voz para dispositivos y aplicaciones: integracion via API compatible con OpenAI Realtime, con hasta 16 usuarios concurrentes por GPU de 80 GB y ~0,6 s hasta el primer audio.
- Agentes conversacionales con tool calling: el soporte de function calling en modo full-duplex (Pass@1 48%) permite al agente consultar APIs, reservar citas o ejecutar acciones mientras mantiene la conversacion de voz.
- Clonacion de voz para marcas o personas: con un clip de 3-10 segundos se puede dotar al asistente de una voz concreta sin fine-tuning, util para identidad de marca o accesibilidad.
- Simulacion y entrenamiento de entrevistas o role-play: la expresividad (risas, suspiros, enfasis) y la deteccion de emocion permiten escenarios conversacionales realistas para formacion.
- Investigacion en interaccion humano-maquina: su condicion de lider entre modelos full-duplex abiertos en VoiceBench, Big Bench Audio y pruebas paralinguisticas lo hace util como linea base en estudios de dialogo de voz.
- Subtitulado y transcripcion conversacional expresiva: el pipeline audio-a-audio con salida de texto y etiquetas permite generar transcripciones enriquecidas con informacion paralinguistica.

## Benchmarks y rendimiento

| Benchmark | Sophon-Realtime-32B-Tag | Sophon-Realtime-32B-Flash | Sophon-Realtime-32B-E2E | Referencia externa |
|---|---|---|---|---|
| NVV-SuperBench (en) | 0.80 | 0.63 | 0.75 | no disponible |
| NVV-SuperBench (zh) | 0.86 | 0.77 | 0.85 | no disponible |
| VoiceBench | 82.8 | no disponible | no disponible | GPT-4o-mini-Audio (nivel similar) |
| Big Bench Audio | 81.8% | no disponible | no disponible | no disponible |
| Paralinguistica (LISTEN, StressTest, MSPB) | 48.6 | no disponible | no disponible | Gemini 3.8 Flash (46.9), Qwen3-Omni (44.6) |
| Full-Duplex-Bench v3 tool calling (Pass@1) | 48% | no disponible | no disponible | Grok (43%) |

Datos de latencia y concurrencia: ~0,6 s hasta el primer audio con un usuario; 16 usuarios concurrentes por GPU de 80 GB.

## Requisitos de hardware

- VRAM estimada para inferencia: una GPU de 80 GB (el repo pesa 52,5 GB; la instalacion descarga ~42 GB de pesos).
- GPU recomendadas: NVIDIA A100 80 GB, H100 80 GB o equivalentes con 80 GB de memoria.
- No cabe en GPU de consumo (RTX 4090 de 24 GB, etc.) en esta variante de 32B; existe una variante Sophon-Realtime-4B-Tag que corre en una GPU de 32 GB.
- Opciones de despliegue: vLLM 0.30 + vLLM-Omni 0.30 con el plugin de adventists-ai; instalacion mediante `install.sh` y `start.sh` del repositorio. El primer arranque tarda 15-20 min (kernels + motores TensorRT); los posteriores, 5-8 min.
- Latencia y throughput: ~0,6 s hasta el primer audio (un usuario); hasta 16 usuarios concurrentes por GPU de 80 GB.
- API disponible: WebSocket full-duplex (`/v1/realtime`) y `POST /v1/chat/completions`.

## Comparativa con modelos similares

| Modelo | Parametros | Full-duplex | Idiomas | Licencia | NVV-SuperBench (en/zh) | Primer audio | Usuarios/GPU 80 GB |
|---|---|---|---|---|---|---|---|
| Sophon-Realtime-32B-Tag | 32B | Si | zh, en | Apache-2.0 | 0.80 / 0.86 | ~0,6 s | 16 |
| Sophon-Realtime-32B-Flash | 32B | Si | zh, en | Apache-2.0 | 0.63 / 0.77 | 0,31 s | 40 |
| Sophon-Realtime-32B-E2E | 32B | Si | zh, en | Apache-2.0 | 0.75 / 0.85 | ~0,25 s | 16 |
| Sophon-Realtime-4B-Tag | 4B | Si | zh, en | Apache-2.0 | no disponible | no disponible | no disponible (1 GPU de 32 GB) |

Comparativas externas citadas en la model card (sin tabla completa de parametros ni contexto): GPT-4o-mini-Audio (nivel similar en VoiceBench), Gemini 3.8 Flash (46.9 en paralinguistica frente a 48.6) y Qwen3-Omni (44.6 en paralinguistica), Grok (43% en tool calling frente a 48%).

## Limitaciones y advertencias

- Solo soporta chino e ingles; no hay soporte declarado para castellano ni otros idiomas.
- No se dispone de informacion sobre sesgos conocidos ni sobre la composicion del dataset de entrenamiento.
- Riesgo de alucinacion inherente a modelos de lenguaje de 32B; en contexto de voz puede generar respuestas incorrectas con apariencia de seguridad.
- La longitud de contexto no esta publicada, lo que dificulta planificar conversaciones muy largas o documentos extensos.
- Requiere una GPU de 80 GB para esta variante; el coste de hardware es elevado y el primer arranque tarda 15-20 minutos.
- La clonacion de voz zero-shot plantea riesgos de suplantacion de identidad y requiere consentimiento explicito y controles de uso; la licencia Apache-2.0 no impone restricciones legales adicionales, pero la responsabilidad etica y legal recae en el desplegador.
- La comprension paralinguistica, aunque lider en su categoria, no es perfecta: puede confundir sarcasmo o emociones sutiles.
- El rendimiento en tool calling (Pass@1 48%) deja margen de error en produccion; conviene validar acciones criticas con confirmacion.
- No se han publicado tipos de cuantizacion, por lo que no se puede reducir facilmente el requisito de VRAM.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/adventists-ai/Sophon-Realtime-32B-Tag
- Pagina de la familia v1: https://huggingface.co/adventists-ai/Sophon-Realtime-v1
- Coleccion Sophon-Realtime: https://huggingface.co/collections/adventists-ai/sophon-realtime-6afb357253a3a8905ad758b0
- Variante 4B: https://huggingface.co/adventists-ai/Sophon-Realtime-4B-Tag
- Variante Flash: https://huggingface.co/adventists-ai/Sophon-Realtime-32B-Flash
- Variante E2E: https://huggingface.co/adventists-ai/Sophon-Realtime-32B-E2E
- Repositorio GitHub: https://github.com/adventists-ai/sophon-realtime
- Directorio Tag: https://github.com/adventists-ai/sophon-realtime/tree/main/tag
- Framework DuplexJev: https://github.com/adventists-ai/duplexjev
- Modelo de voz tag-tts: https://huggingface.co/adventists-ai/tag-tts
- Changelog: https://github.com/adventists-ai/sophon-realtime/blob/main/CHANGELOG.md
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/adventists-ai/Sophon-Realtime
- Demo en ModelScope Studio: https://www.modelscope.ai/studios/AdventistsAI/Sophon-Realtime
- API hosted y documentacion: https://api.adventists.ai/console/ y https://api.adventists.ai/console/docs
