# adventists-ai/Sophon-Realtime-4B-E2E

## Resumen

Sophon-Realtime-4B-E2E es un modelo de voz a voz (speech-to-speech) full-duplex de 4.000 millones de parametros desarrollado por adventists-ai. Forma parte de la familia Sophon-Realtime, que tambien incluye variantes de 32B, y representa la version compacta del diseno full-duplex: el modelo escucha mientras el usuario habla, decide a partir de la prosodia cuando este ha terminado, redacta una respuesta con etiquetas de sonido (`[laughter]`, `[cough]`, `[sigh]`, `[breath]`, `<strong>…</strong>`) y habla mientras escribe.

La arquitectura combina un "cerebro" conversacional de 4B (DuplexJev-4B-Para con un adaptador de escritura de etiquetas fusionado) con un talker compacto de aproximadamente 350M parametros que convierte la respuesta etiquetada directamente en vectores de voz, y un decodificador que los transforma en audio. Todo se sirve como un unico modelo vLLM-Omni con endpoints `/v1/realtime` y `/v1/chat/completions`, lo que simplifica el despliegue.

El modelo esta pensado para demos locales, companeros conversacionales, personajes y investigacion sobre turn-taking (gestion de turnos de palabra), no para respuestas factuales criticas: su capacidad de razonamiento es notablemente inferior a la de las variantes de 32B. Es relevante ahora porque ofrece un pipeline full-duplex completo en una sola GPU de 32 GB con licencia Apache-2.0, algo poco habitual entre los modelos abiertos de esta categoria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Full-duplex speech-to-speech: cerebro conversacional (DuplexJev-4B-Para + adaptador de etiquetas) + talker (~350M) + decodificador de audio |
| Parametros totales | 4B (cerebro) + ~350M (talker) + decodificador |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en bf16) |
| Idiomas soportados | chino (zh), ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (layout: `thinker/`, `talker220/`, `e2/`, `voices/`) |

## Arquitectura y entrenamiento

El modelo sigue un diseno full-duplex en tres etapas. El "thinker" es un modelo de habla de 4B (DuplexJev-4B-Para) al que se ha fusionado un adaptador que le ensena a escribir etiquetas de sonido y marcas de enfasis en la respuesta. A partir de ahi, un talker compacto de aproximadamente 350M parametros transforma directamente la respuesta etiquetada en vectores de voz (un pase forward por cada trama de 80 ms en la variante Flash; en E2E el talker trabaja sobre la salida etiquetada), y un decodificador convierte esos vectores en audio reproducible.

El modelo es solo de voz: el cerebro de 4B no tiene vision. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplico RLHF o DPO. La model card menciona que la tasa de etiquetas de sonido en conversaciones de validacion (0.36) coincide con la de los datos de referencia, lo que sugiere un ajuste supervisado para reproducir la distribucion de etiquetas del corpus original. El despliegue se realiza mediante vLLM 0.30 y vLLM-Omni 0.30 con un plugin especifico, sobre Python 3.12.

## Capacidades

- Generacion de voz a voz en tiempo real con diseno full-duplex: escucha mientras el usuario habla y responde solapandose con la entrada.
- Deteccion del final de turno basada en la voz del usuario (no solo en silencio), con gestion de turn-taking e interrupciones (barge-in).
- Back-channels (asentimientos y muletillas conversacionales) durante el habla del usuario.
- Etiquetado paralinguistico: `[laughter]`, `[cough]`, `[sigh]`, `[breath]` y enfasis con `<strong>…</strong>`.
- Clonacion de voz zero-shot (segun la documentacion del repositorio).
- Modo Live documentado en `e2e/README.md`.
- API compatible con OpenAI Realtime (`/v1/realtime`) y con chat completions (`/v1/chat/completions`).
- Capacidades multilingues limitadas a chino e ingles.
- No dispone de vision, tool calling ni capacidades de agente multi-step documentadas.

## Casos de uso

- Demos locales de voz a voz: el modelo cabe en una GPU de 32 GB y se levanta con un script (`start.sh`), lo que permite montar una demo interactiva sin infraestructura en la nube.
- Companeros conversacionales y personajes: la tasa de etiquetas de sonido (0.36, identica a la referencia) y los back-channels producen interacciones con expresividad paralinguistica adecuada para chatbots de acompanamiento.
- Investigacion sobre turn-taking: Full-Duplex-Bench v1.0 de 92.3 en la variante E2E permite estudiar gestion de pausas, interrupciones y solapamiento con un modelo abierto y reproducible.
- Atencion al cliente con voz: conversaciones multi-turno en tiempo real con interrupcion natural; adecuado para prototipos, no para respuestas factuales criticas.
- Clonacion de voz para locucion o doblaje: la funcionalidad zero-shot permite generar una voz concreta (previa autorizacion) para narrar contenido o dar voz a un personaje.
- Integracion en pipelines OpenAI-compatible: al exponer `/v1/realtime` y `/v1/chat/completions`, puede conectarse a clientes existentes que ya hablan el protocolo de OpenAI Realtime.
- Evaluacion comparativa de modelos full-duplex: sirve como referencia abierta de 4B frente a Freeze-Omni, Moshi o MiniCPM-o en pruebas de voz.

## Benchmarks y rendimiento

| Metrica | 4B (E2E) | 32B (publicado) |
|---|---|---|
| VoiceBench overall | 62.4 | 82.8 |
| Big Bench Audio (respuesta hablada, transcrita) | 44.3% | 81.8% |
| Full-Duplex-Bench v1.0 (media de 2 tareas de pausa, turn-taking e interrupcion) | 92.3 | 94.0 |
| Tasa de etiquetas de sonido en conversaciones de validacion (referencia: 0.36) | 0.36 | no disponible |
| Primer audio, un usuario (RTX PRO 6000) | 0.31 s | no disponible |

Comparativa de VoiceBench con otros modelos full-duplex abiertos: Sophon-Realtime-4B-E2E (62.4) supera a Freeze-Omni (55.2) y Moshi (29.5), y queda por debajo de MiniCPM-o (71.2). Las mediciones se realizaron el 2026-11-16 en una RTX PRO 6000, con evaluadores oficiales de VoiceBench (juez gpt-4o-mini, subconjunto estandar de 199 preguntas, media de 9 tareas) y Big Bench Audio (1.000 preguntas, GPT-4.1 juzga la transcripcion de la respuesta hablada). El primer audio es la mediana de 6 ejecuciones con `client_example.py`.

## Requisitos de hardware

- VRAM estimada: aproximadamente 31 GB para la variante E2E (configurada para una GPU de 32 GB). La variante Tag usa ~27 GB y la Flash ~21 GB.
- GPU recomendadas: RTX PRO 6000 (usada en las mediciones), A100 40GB, H100; cualquier GPU con al menos 32 GB de memoria.
- No cabe en GPU de consumo de 24 GB (RTX 4090); la variante Flash, con ~21 GB, si cabe en una de 24 GB.
- Despliegue: vLLM 0.30 + vLLM-Omni 0.30 con plugin, instalado via `install.sh` (entorno Python 3.12). El repositorio ocupa 13.9 GB.
- Latencia: primer audio de 0.31 s en la variante E2E (0.21 s en Flash, 0.4 s en Tag) sobre RTX PRO 6000. Throughput no disponible.
- Alternativa sin GPU: API alojada compatible con OpenAI Realtime (3 horas de chat de voz gratis al registrarse).

## Comparativa con modelos similares

| Modelo | Parametros | Full-duplex | VoiceBench | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Sophon-Realtime-4B-E2E | 4B + ~350M talker | Si | 62.4 | Apache-2.0 | Hugging Face, ModelScope |
| Freeze-Omni | no disponible | Si | 55.2 | no disponible | no disponible |
| Moshi | no disponible | Si | 29.5 | no disponible | no disponible |
| MiniCPM-o | no disponible | Si | 71.2 | no disponible | no disponible |
| Sophon-Realtime-32B-E2E | 32B | Si | 82.8 | Apache-2.0 | Hugging Face |

Los datos de parametros, licencia y disponibilidad de Freeze-Omni, Moshi y MiniCPM-o no se detallan en la informacion proporcionada; solo se dispone de sus puntuaciones VoiceBench tal como aparecen en la model card.

## Limitaciones y advertencias

- Capacidad de razonamiento y conocimiento factual muy inferior a las variantes de 32B (VoiceBench 62.4 frente a 82.8; Big Bench Audio 44.3% frente a 81.8%): puede afirmar datos erroneos con confianza. No debe usarse cuando las respuestas deban ser correctas.
- Solo voz: el cerebro de 4B no tiene vision.
- Idiomas limitados a chino e ingles; no se documenta soporte de castellano.
- Longitud de contexto no disponible; el rendimiento en conversaciones muy largas no esta documentado.
- Riesgo de sesgos no evaluado en la informacion disponible; no se publican analisis de sesgo.
- Restricciones de uso de voz: solo se debe clonar la propia voz o una voz para la que se tenga permiso explicito.
- La licencia Apache-2.0 permite uso comercial, pero conviene revisar el archivo `NOTICE` para conocer las fuentes de los pesos incluidos.
- Pensado para demos locales, companeros, personajes e investigacion sobre turn-taking, no para produccion con requisitos de exactitud.
- Sin datos publicados sobre tool calling, agentes o cuantizacion; el despliegue documentado es en bf16 con vLLM-Omni.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/adventists-ai/Sophon-Realtime-4B-E2E
- Repositorio GitHub: https://github.com/adventists-ai/sophon-realtime
- Changelog: https://github.com/adventists-ai/sophon-realtime/blob/main/CHANGELOG.md
- Instrucciones E2E, protocolo realtime, clonacion de voz y modo Live: https://github.com/adventists-ai/sophon-realtime/blob/main/e2e/README.md
- Cerebro base DuplexJev-4B-Para: https://huggingface.co/adventists-ai/DuplexJev-4B-Para
- Variante Tag 4B: https://huggingface.co/adventists-ai/Sophon-Realtime-4B-Tag
- Variante Flash 4B: https://huggingface.co/adventists-ai/Sophon-Realtime-4B-Flash
- Variante Tag 32B: https://huggingface.co/adventists-ai/Sophon-Realtime-32B-Tag
- Variante Flash 32B: https://huggingface.co/adventists-ai/Sophon-Realtime-32B-Flash
- Variante E2E 32B: https://huggingface.co/adventists-ai/Sophon-Realtime-32B-E2E
- ModelScope (E2E): https://www.modelscope.cn/models/AdventistsAI/Sophon-Realtime-4B-E2E
- API alojada (compatible con OpenAI Realtime): https://api.adventists.ai/console/
- Documentacion de la API: https://api.adventists.ai/console/docs
