# ml-resources/Sophon-Realtime-v1

## Resumen

Sophon-Realtime v1 es una familia de modelos de voz full-duplex de tipo speech-to-speech desarrollada por Adventists AI y publicada bajo licencia Apache-2.0. Su objetivo es resolver el problema de la conversacion hablada natural con un agente de IA: escucha de forma continua mientras el usuario habla, detecta el final del turno, permite interrupciones (barge-in) y responde con entonacion propia, incluyendo risas, suspiros o carraspeos cuando la conversacion lo requiere. Frente a los pipelines clasicos de ASR + LLM + TTS, elimina la latencia acumulada y la perdida de informacion paralinguistica.

La familia comparte un unico "cerebro" de 32B parametros que decide cuando tomar el turno y redacta la respuesta, y se distribuye en tres variantes que difieren solo en la sintesis de voz: Tag (recomendada, con etiquetas de sonido interpretadas por un modelo expresivo), Flash (voz mas ligera y rapida) y E2E (research preview, con un talker interno sin modelo de voz separado). Segun la model card, el sistema se sirve con vLLM-Omni en una sola GPU de 80 GB y soporta hasta 16 usuarios concurrentes (Tag) o 40 (Flash).

Es relevante ahora porque, de acuerdo con los datos del autor, ocupa el primer puesto entre los modelos full-duplex de pesos abiertos en VoiceBench (82,8) y Big Bench Audio (81,8 %), y lidera la comprension paralinguistica con 48,6 en la evaluacion LISTEN/StressTest/MSPB. Los pesos y el codigo son libres para uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de voz full-duplex speech-to-speech con un nucleo LLM de 32B y modulo de sintesis expresiva separado (Tag/Flash) o talker interno (E2E); el componente de decision de turno es DuplexJev |
| Parametros totales | 32B (nucleo compartido por las tres variantes) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | chino (zh) e ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | no disponible (pesos descargados por el instalador, ~42 GB para Tag) |

## Arquitectura y entrenamiento

La arquitectura es un sistema full-duplex any-to-any: un nucleo LLM de 32B actua como "cerebro" que escucha de forma continua, decide el momento de tomar el turno y genera la respuesta. La variante Tag escribe la respuesta con etiquetas de sonido no verbal que un modelo de sintesis expresiva interpreta y vocaliza; Flash emplea el mismo texto etiquetado pero con un modelo de voz mas ligero y rapido; E2E integra un talker dentro del propio modelo de 32B y prescinde del modelo de voz separado. El modulo de escucha y decision de turno se denomina DuplexJev y se describe como un modelo abierto de decision de habla.

No se detallan en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO. Tampoco se especifican innovaciones de atencion o decodificacion mas alla del diseno full-duplex con borrador de respuesta durante el habla del usuario, que permite detener la generacion ante una interrupcion y responder a la nueva pregunta.

## Capacidades

- Conversacion de voz full-duplex con turn-taking automatico: escucha mientras el usuario habla y responde en cuanto este termina.
- Barge-in: detiene la respuesta en curso cuando el usuario interrumpe y atiende la nueva intervencion.
- Comprension paralinguistica: detecta hesitacion, enfasis, sarcasmo, risas y suspiros en la voz del usuario.
- Expresividad vocal: genera risas, suspiros, respiraciones y carraspeos mediante etiquetas de sonido no verbal (NVV).
- Tool calling en modo full-duplex: Full-Duplex-Bench v3 con Pass@1 del 48 % y tasa de respuesta del 100 %.
- Modo Live compatible con la interfaz OpenAI GPT-Live, con delegacion de tareas a un modelo backend mayor y transcripcion auditable de cada respuesta.
- Multilingue limitado a chino e ingles.
- APIs WebSocket (`/v1/realtime`) y HTTP (`/v1/chat/completions`) para audio de entrada y texto mas audio de salida.
- No se documentan capacidades de vision ni de audio ambiental mas alla de la voz.

## Casos de uso

- Atencion al cliente telefonica: la variante Flash, con 0,31 s hasta el primer audio y 40 usuarios concurrentes por GPU de 80 GB, permite desplegar agentes de voz economicos que gestionan conversaciones multi-turno con interrupciones naturales.
- Companeros y personajes conversacionales: la variante Tag, con NVV-SuperBench de 0,86 en chino y 0,80 en ingles, produce respuestas con risas y suspiros adecuados para productos de acompanamiento y entretenimiento.
- Asistentes en vehiculo: la baja latencia de Flash y la capacidad de barge-in encajan con entornos donde el usuario interrumpe constantemente y la respuesta debe llegar en menos de un segundo.
- Agentes de voz con acciones: el tool calling de Full-Duplex-Bench v3 (Pass@1 48 %) y el modo Live permiten consultar sistemas externos, decir "Let me check that" y verbalizar el resultado, por ejemplo para reservas o gestion de pedidos.
- Demos interactivas y prototipado: el despliegue con `sophon-realtime serve` y los scripts de un solo comando reducen la puesta en marcha a una GPU y pocos minutos tras la primera descarga de pesos.
- Investigacion en habla expresiva end-to-end: la variante E2E, con un talker interno sin modelo de voz separado, sirve como banco de pruebas para sintesis expresiva integrada en el LLM.
- Evaluacion de agentes conversacionales: la transcripcion auditable de cada respuesta facilita el registro y la revision de conversaciones en produccion.

## Benchmarks y rendimiento

Datos publicados en la model card (evaluadores oficiales, juez gpt-4o-mini en VoiceBench):

| Modelo | Full-duplex | Pesos abiertos | VoiceBench (overall) |
|---|---|:-:|:-:|
| GPT-4o-Audio | — | — | 86.8 |
| Sophon-Realtime v1 | Si | Si | 82.8 |
| GPT-4o-mini-Audio | — | — | 82.8 |

| Metrica | Tag | Flash | E2E |
|---|---|---|---|
| NVV-SuperBench (zh / en) | 0.86 / 0.80 | 0.77 / 0.63 | 0.77 / 0.60 |
| Primer audio, un usuario | ~0.6 s | 0.31 s | ~1 s |
| Usuarios por GPU de 80 GB | 16 | 40 | 4-5 |
| GPUs necesarias | 1 | 1 | 2 |

Otros resultados citados: Big Bench Audio 81,8 % (hasta ~83 con DeepSeek V4 Pro como backend en modo Live); comprension paralinguistica 48,6 en LISTEN, StressTest y MSPB, por delante de Gemini 3.8 Flash (46,9) y Qwen3-Omni (44,6); Full-Duplex-Bench v3 tool calling Pass@1 48 % frente a Grok (43 %). La tabla de VoiceBench aparece truncada en la informacion disponible, por lo que no se incluyen el resto de filas.

## Requisitos de hardware

- VRAM estimada: los pesos de Tag ocupan aproximadamente 42 GB; se recomienda una GPU de 80 GB para el servicio con vLLM-Omni.
- GPU recomendadas: A100 80 GB o H100 80 GB para Tag y Flash; E2E requiere 2 GPU.
- GPU de consumo: no se documenta soporte en RTX 4090 u otras GPU consumer; el tamano de pesos y el motor de servicio lo hacen inviable en configuraciones de 24 GB sin cuantizacion no disponible.
- Despliegue: vLLM-Omni con un solo comando (`sophon-realtime serve` o los scripts `install.sh`/`start.sh`); no se mencionan llama.cpp, Ollama ni TGI.
- Latencia: primer audio de ~0,6 s en Tag y 0,31 s en Flash; primer arranque del servicio de 15-20 minutos y arranques posteriores de 5-8 minutos.
- Concurrencia: 16 usuarios por GPU en Tag, 40 en Flash y 4-5 en E2E.

## Comparativa con modelos similares

| Modelo | Parametros | Full-duplex | Pesos abiertos | VoiceBench | Licencia |
|---|---|:-:|:-:|:-:|---|
| Sophon-Realtime v1 (Tag) | 32B | Si | Si | 82.8 | Apache-2.0 |
| GPT-4o-Audio | no disponible | No | No | 86.8 | propietaria |
| GPT-4o-mini-Audio | no disponible | No | No | 82.8 | propietaria |
| Gemini 3.8 Flash | no disponible | no disponible | No | no disponible (paralinguistica 46.9) | propietaria |
| Qwen3-Omni | no disponible | no disponible | no disponible | no disponible (paralinguistica 44.6) | no disponible |

La informacion disponible solo permite comparar en VoiceBench y en la metrica paralinguistica; no se aportan datos de contexto, tool calling ni disponibilidad para el resto de modelos.

## Limitaciones y advertencias

- Solo soporta chino e ingles; no se documenta cobertura de castellano.
- No se publican datos sobre sesgos, tasas de alucinacion ni evaluaciones de robustez fuera de los benchmarks citados.
- El rendimiento en tool calling es moderado (Pass@1 48 % en Full-Duplex-Bench v3), por lo que las acciones criticas requieren validacion externa.
- La variante E2E es una research preview con mayor latencia (~1 s) y menor concurrencia (4-5 usuarios por GPU).
- El despliegue exige GPU de 80 GB y el primer arranque tarda 15-20 minutos; no hay ruta documentada para hardware consumer.
- No se especifican la longitud de contexto ni los formatos de pesos, lo que dificulta planificar integraciones fuera de vLLM-Omni.
- La licencia Apache-2.0 permite uso comercial, pero el autor no detalla condiciones adicionales sobre los modelos de voz asociados.
- El modelo tiene 0 descargas y 0 likes en Hugging Face en el momento de la consulta, sin validacion independiente de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/ml-resources/Sophon-Realtime-v1
- Variante Tag: https://huggingface.co/adventists-ai/Sophon-Realtime-32B-Tag
- Variante Flash: https://huggingface.co/adventists-ai/Sophon-Realtime-32B-Flash
- Variante E2E: https://huggingface.co/adventists-ai/Sophon-Realtime-32B-E2E
- GitHub: https://github.com/adventists-ai/sophon-realtime
- Modo Live: https://github.com/adventists-ai/sophon-realtime/blob/main/live/README.md
- Demo en ModelScope: https://www.modelscope.ai/studios/AdventistsAI/Sophon-Realtime
- Paper: arXiv:2609.21967
