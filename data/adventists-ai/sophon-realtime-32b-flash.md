# adventists-ai/Sophon-Realtime-32B-Flash

## Resumen

Sophon-Realtime-32B-Flash es un modelo de voz a voz (speech-to-speech) full-duplex desarrollado por adventists-ai, servido como un unico modelo en vLLM-Omni. El modelo escucha al usuario de forma continua, redacta la respuesta mientras el usuario habla (opcionalmente con etiquetas de sonido como `[laughter]`, `[cough]`, `[sigh]` o `[breath]`) y emite audio mientras escribe, con un frame de voz cada 80 ms. La variante Flash comparte el "cerebro" de 32B con la build Tag; solo cambia la etapa de voz, que es autorregresiva con un unico forward pass por paso, lo que reduce el tiempo hasta el primer audio y aumenta la concurrencia.

El modelo pertenece a la familia Sophon-Realtime v1, compuesta por tres builds (Tag, Flash y E2E) que comparten el mismo modelo de 32B para escuchar, decidir turnos y escribir la respuesta. Flash esta pensado para despliegues con muchos usuarios simultaneos: alcanza 0,31 s hasta el primer audio y hasta 40 usuarios concurrentes por GPU de 80 GB. La version documentada es la 1.2.0 (13 de noviembre de 2026), con licencia Apache-2.0.

Su relevancia actual radica en que combina un cerebro de 32B con capacidad paralinguistica (interpreta emocion, enfasis, sarcasmo, risas y suspiros en la voz del usuario) y un rendimiento en benchmarks de audio conversacional que el autor situa como el mejor entre los modelos full-duplex abiertos, a la altura de GPT-4o-mini-Audio en VoiceBench. Todo ello con licencia permisiva para uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo full-duplex speech-to-speech servido en vLLM-Omni; cerebro de 32B (transformer, detalles no disponibles) mas etapa de voz autorregresiva con un forward pass por paso |
| Parametros totales | 32B (cerebro); parametros de la etapa de voz no disponibles |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8 (build principal); BF16 disponible en build separada (Sophon-Realtime-32B-Flash-BF16) |
| Idiomas soportados | chino (zh) e ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (libreria vLLM) |

## Arquitectura y entrenamiento

Sophon-Realtime-32B-Flash se sirve como un unico modelo en vLLM-Omni con pipeline any-to-any. La familia v1 separa el sistema en dos etapas: un "cerebro" de 32B que escucha, decide los turnos de palabra y escribe la respuesta (con soporte de etiquetas de sonido), y una etapa de voz que convierte esa respuesta en audio. En la build Flash, la etapa de voz es autorregresiva con un unico forward pass por paso, lo que la hace mas ligera y rapida que la de la build Tag, a costa de una expresividad algo menor (NVV-SuperBench 0,63 en ingles y 0,77 en chino frente a 0,80/0,86 de Tag). La etapa de voz emite un frame cada 80 ms y las etiquetas se interpretan vocalmente, nunca se leen en voz alta.

El modelo funciona en full-duplex real: escucha durante toda la intervencion del usuario, redacta la respuesta sobre la marcha, retoma cuando el usuario termina, se detiene si le interrumpen y continua si el usuario solo emite confirmaciones como "mm-hm". El autor indica que el ajuste fino de persona, tono y conocimiento de dominio puede hacerse con ms-swift. No se detallan en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO.

## Capacidades

- Generacion de voz a voz full-duplex: escucha continua, deteccion de turnos, interrupciones y solapamiento conversacional.
- Comprension paralinguistica: interpreta emocion, enfasis, sarcasmo, risas y suspiros en la voz del usuario (puntuacion de 48,6 en el agregado LISTEN, StressTest y MSPB segun el autor).
- Etiquetas de sonido expresivas: `[laughter]`, `[cough]`, `[sigh]`, `[breath]`, `<laughter>…</laughter>` y `<strong>…</strong>`, interpretadas vocalmente y nunca leidas.
- Tool calling en modo full-duplex: Full-Duplex-Bench v3 con Pass@1 del 48% y tasa de respuesta del 100%; modo live compatible con la interfaz OpenAI GPT-Live.
- API compatible con OpenAI Realtime (hosted API) y con `/v1/chat/completions` en vLLM-Omni.
- Capacidades multilingues limitadas a chino e ingles.
- Clonacion de voz zero-shot (introducida en v1.1, segun el video de demostracion del repositorio).
- Ajuste fino de persona, tono y dominio con ms-swift.

## Casos de uso

- Atencion al cliente automatizada: con hasta 40 usuarios concurrentes por GPU de 80 GB y 0,31 s hasta el primer audio, el modelo puede gestionar conversaciones telefonicas multi-turno con interrupciones naturales y deteccion de turnos, reduciendo la latencia percibida frente a pipelines STT-LLM-TTS encadenados.
- Asistentes en vehiculo: el full-duplex real permite que el modelo siga escuchando mientras el conductor habla, se detenga al ser interrumpido y responda a confirmaciones breves, algo critico en entornos manos libres.
- Agentes de voz con tool calling: el modo live compatible con la interfaz OpenAI GPT-Live y el Pass@1 del 48% en Full-Duplex-Bench v3 permiten integrar el modelo en flujos donde debe consultar APIs o sistemas externos durante la conversacion.
- Analisis de tono y emocion en tiempo real: la puntuacion paralinguistica permite aplicaciones de triaje en centros de llamadas que detecten frustracion o sarcasmo en la voz del cliente y escalen la conversacion.
- Generacion de contenido de audio expresivo: las etiquetas de sonido (risas, tos, suspiros) con tasas de acierto del 77-100% en varios casos permiten producir locuciones con matices para doblaje, audiolibros o personajes interactivos.
- Despliegue de bajo coste por usuario: al compartir el cerebro de 32B y usar una etapa de voz mas ligera, Flash maximiza usuarios por GPU, adecuado para servicios con muchos usuarios simultaneos y presupuesto de hardware limitado.
- Investigacion en interaccion conversacional: la API y los scripts de despliegue de una sola orden facilitan experimentos de deteccion de turnos, interrupciones y comportamiento full-duplex.

## Benchmarks y rendimiento

| Benchmark | Sophon-Realtime-32B-Flash | Referencia |
|---|---|---|
| VoiceBench | 82,8 | Nivel de GPT-4o-mini-Audio (segun el autor) |
| Big Bench Audio | 81,8% | #1 entre modelos full-duplex abiertos (segun el autor) |
| Paralinguistico (LISTEN, StressTest, MSPB) | 48,6 | Gemini 3.8 Flash: 46,9; Qwen3-Omni: 44,6 |
| NVV-SuperBench (en / zh) | 0,63 / 0,77 | Tag: 0,80 / 0,86; E2E: 0,75 / 0,85 |
| Full-Duplex-Bench v3 tool calling (Pass@1) | 48% | Grok: 43% |

Rendimiento de servicio (una H100 80 GB, thinker FP8, `/v1/chat/completions`, voz del usuario hasta primer chunk de audio):

| Carga | Primer audio mediana / P90 | Stall (mediana) |
|---|---|---|
| 1 stream | 0,31 / 0,34 s | 0 |
| 20 streams (en 10 s) | 0,45 / 0,52 s | 0,09 s |
| 40 streams (en 10 s) | 0,58 / 0,67 s | 0,37 s |
| 64 streams (en 8 s) | 0,84 / 1,03 s | 1,9 s (cola) |

Tasas de acierto de etiquetas de sonido (conjunto held-out, voz Chelsie, evaluado por DuplexJev):

| Etiqueta | zh | en |
|---|---|---|
| `[laughter]` | 83% | 77% |
| `<laughter>…</laughter>` (reir mientras habla) | 78% | 71% |
| `[cough]` | 90% | 50% (8 items) |
| `[sigh]` (AST) | 90% | 100% |
| Tasa media de error de caracteres / palabras | 0,9% | 1,0% |

## Requisitos de hardware

- VRAM estimada: aproximadamente 55 GB por instancia en FP8; la build BF16 ocupa unos 64 GB y suele requerir dos dispositivos.
- GPU recomendada: una H100 de 80 GB para el despliegue de referencia con hasta 40 streams concurrentes.
- Cabe en GPU consumer: la build de 32B no cabe en GPUs consumer de 24 GB; el autor ofrece Sophon-Realtime-4B-Flash para una unica GPU de 24 GB (con menor conocimiento).
- Opciones de despliegue: vLLM-Omni (libreria oficial, con plugin y scripts de una sola orden en el repositorio de GitHub); API alojada compatible con OpenAI Realtime.
- Latencia y throughput: 0,31 s de mediana hasta el primer audio con 1 stream y 0,58 s con 40 streams; se recomienda un maximo de unos 40 streams concurrentes por GPU de 80 GB y, para mas carga, una instancia por GPU detras de un balanceador.
- Arranque: la primera ejecucion compila kernels (unos 10 minutos); los arranques posteriores tardan 5-8 minutos.

## Comparativa con modelos similares

| Modelo | Parametros | Primer audio | Usuarios por GPU 80 GB | NVV-SuperBench (en / zh) | Licencia |
|---|---|---|---|---|---|
| Sophon-Realtime-32B-Flash | 32B | 0,31 s | 40 | 0,63 / 0,77 | Apache-2.0 |
| Sophon-Realtime-32B-Tag | 32B | ~0,6 s | 16 | 0,80 / 0,86 | Apache-2.0 |
| Sophon-Realtime-32B-E2E | 32B (talker de ~350M) | ~0,25 s | 16 | 0,75 / 0,85 | Apache-2.0 |
| Sophon-Realtime-4B-Flash | 4B | no disponible | 1 GPU de 24 GB | no disponible | Apache-2.0 |

Frente a alternativas externas, el autor situa a Flash por delante de Grok en tool calling full-duplex (48% frente a 43% de Pass@1) y por delante de Gemini 3.8 Flash (46,9) y Qwen3-Omni (44,6) en la puntuacion paralinguistica agregada de 48,6. No se dispone de datos comparativos adicionales en la informacion proporcionada.

## Limitaciones y advertencias

- Solo soporta chino e ingles; no hay soporte documentado de otros idiomas.
- La expresividad es inferior a la build Tag (NVV-SuperBench 0,63/0,77 frente a 0,80/0,86): las etiquetas de sonido se interpretan con menor fidelidad.
- La etiqueta `<strong>` (enfasis) es debil en esta build; el autor anuncia mejoras en la siguiente version.
- Sin etiqueta explicita, el modelo rara vez se rie por si solo.
- La tasa de acierto de `[cough]` en ingles es solo del 50% sobre 8 items, un conjunto muy pequeno.
- Riesgo de alucinacion no cuantificado en la informacion disponible; como todo modelo generativo, puede producir respuestas incorrectas, especialmente en tool calling (Pass@1 del 48% implica que mas de la mitad de los intentos fallan en el primer intento).
- A partir de 40 streams concurrentes la cola crece (1,9 s de stall con 64 streams), lo que degrada la experiencia conversacional.
- El arranque inicial requiere compilar kernels (unos 10 minutos), lo que complica el escalado elastico.
- Licencia Apache-2.0: permite uso comercial, pero se deben respetar las obligaciones de atribucion y las condiciones de la licencia.
- No se detallan sesgos conocidos ni la composicion del dataset de entrenamiento, lo que limita la evaluacion de riesgos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/adventists-ai/Sophon-Realtime-32B-Flash
- Build BF16: https://huggingface.co/adventists-ai/Sophon-Realtime-32B-Flash-BF16
- Build Tag: https://huggingface.co/adventists-ai/Sophon-Realtime-32B-Tag
- Build E2E: https://huggingface.co/adventists-ai/Sophon-Realtime-32B-E2E
- Build de 4B: https://huggingface.co/adventists-ai/Sophon-Realtime-4B-Flash
- Coleccion de la familia: https://huggingface.co/collections/adventists-ai/sophon-realtime-6afb357253a3a8905ad758b0
- Pagina de la familia v1: https://huggingface.co/adventists-ai/Sophon-Realtime-v1
- Repositorio GitHub: https://github.com/adventists-ai/sophon-realtime
- Changelog: https://github.com/adventists-ai/sophon-realtime/blob/main/CHANGELOG.md
- Demo en video (v1.1): https://github.com/adventists-ai/sophon-realtime#zero-shot-voice-cloning-new-in-v11
- API alojada (consola): https://api.adventists.ai/console/
- Documentacion de la API: https://api.adventists.ai/console/docs
- Demo en ModelScope Studio: https://www.modelscope.ai/studios/AdventistsAI/Sophon-Realtime
