# adventists-ai/Sophon-Realtime-4B-Flash

## Resumen

Sophon-Realtime-4B-Flash es un modelo de voz a voz (speech-to-speech) en modo full-duplex desarrollado por adventists-ai. Forma parte de la familia Sophon-Realtime y constituye la variante de 4B parámetros de la rama "Flash", diseñada para ejecutarse en una única GPU de 24 GB (consume aproximadamente 21 GB). El modelo escucha mientras el usuario habla, decide a partir de la prosodia y el contenido cuándo el interlocutor ha terminado, y genera una respuesta con etiquetas de sonido paralingüístico mientras la sintetiza.

El núcleo de razonamiento es DuplexJev-4B-Para, un modelo de voz de 4B parámetros al que se le ha fusionado un adaptador para escribir etiquetas de sonido (`[laughter]`, `[cough]`, `[sigh]`, `[breath]`, `<strong>…</strong>`). La síntesis corre a cargo de un modelo de habla más ligero que pronuncia la respuesta etiquetada en un único forward pass por trama de 80 ms. Todo se sirve como un solo modelo vLLM-Omni con endpoints `/v1/realtime` y `/v1/chat/completions`.

Es relevante porque ofrece interacción conversacional full-duplex (back-channels, barge-in, detección de fin de turno) en hardware de gama consumer-profesional, con licencia Apache-2.0 y pesos abiertos, algo poco habitual en esta categoría. La contrapartida es su capacidad de razonamiento: el propio autor advierte que puede afirmar hechos erróneos con confianza y recomienda las variantes de 32B o la API alojada cuando la exactitud es crítica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Full-duplex speech-to-speech; thinker (4B, transformer) + talker ligero de síntesis; pipeline any-to-any sobre vLLM-Omni |
| Parametros totales | 4B (thinker) + modelo de habla ligero (tamaño no especificado) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en bf16) |
| Idiomas soportados | chino (zh), inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (repo de 13.0 GB; `thinker/` en bf16) |

## Arquitectura y entrenamiento

El modelo sigue un diseño full-duplex en el que la entrada de audio y la generación de salida ocurren de forma simultánea. El "cerebro" es un transformer de 4B parámetros (DuplexJev-4B-Para) con un adaptador fusionado que le permite emitir etiquetas de sonido paralingüístico junto al texto de la respuesta. La rama Flash delega la síntesis en un modelo de habla más ligero y rápido que la variante Tag: pronuncia la respuesta etiquetada con un único forward pass por trama de 80 ms, lo que reduce la latencia del primer audio a 0,21 s (medido en una RTX PRO 6000 con un solo usuario).

El repositorio se organiza en `config.json`, `thinker/` (4B, bf16), `talker/` y `voices/`. El modelo se sirve como un único modelo vLLM-Omni (vLLM 0.30 + vLLM-Omni 0.30 + plugin) y expone endpoints compatibles con OpenAI Realtime. No se han publicado en la información disponible detalles sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se emplearon RLHF o DPO.

## Capacidades

- Conversación de voz a voz en tiempo real con modo full-duplex: escucha mientras el usuario habla.
- Detección de fin de turno basada en la voz del usuario (no solo en pausas silenciosas).
- Back-channels (señales de escucha activa) y barge-in (interrupción del usuario).
- Generación de etiquetas de sonido paralingüístico: `[laughter]`, `[cough]`, `[sigh]`, `[breath]`, `<strong>…</strong>`.
- Síntesis de voz expresiva mediante un modelo de habla ligero (una pasada por trama de 80 ms).
- Clonación de voz zero-shot (según la documentación del repositorio).
- Modo Live (según la documentación del repositorio).
- Endpoints `/v1/realtime` y `/v1/chat/completions`, compatibles con el protocolo OpenAI Realtime.
- Capacidades multilingües limitadas a chino e inglés.
- Sin visión: el cerebro de 4B no procesa imágenes.

## Casos de uso

- Demos locales de conversación por voz: el modelo cabe en una GPU de 24 GB y arranca con un script (`start.sh`), lo que permite montar una demo full-duplex en una sola máquina sin infraestructura adicional.
- Compañeros y personajes conversacionales: las etiquetas de sonido y los back-channels aportan naturalidad a interacciones de rol o acompañamiento, donde la exactitud factual no es el requisito principal.
- Investigación sobre turn-taking: el modelo expone métricas de detección de fin de turno, interrupción y pausas (Full-Duplex-Bench v1.0), lo que lo hace útil como banco de pruebas reproducible para estudiar la dinámica conversacional.
- Atención al cliente de baja exigencia factual: para flujos guionizados o FAQ donde las respuestas están acotadas, la latencia de 0,21 s al primer audio y el soporte de barge-in permiten conversaciones fluidas multi-turno.
- Clonación de voz para prototipos: la clonación zero-shot permite generar voces personalizadas para demos, siempre que se cuente con permiso explícito sobre la voz clonada.
- Integración en aplicaciones compatibles con OpenAI Realtime: al exponer `/v1/realtime`, puede conectarse a clientes existentes de ese protocolo sin reescribir la capa de transporte.
- Evaluación comparativa de modelos full-duplex: sus puntuaciones publicadas (VoiceBench 62,4; Full-Duplex-Bench 87,7) sirven como referencia para comparar alternativas abiertas en la misma franja de tamaño.

## Benchmarks y rendimiento

| Metrica | 4B (Flash) | 32B (publicado) |
|---|---|---|
| VoiceBench overall | 62,4 | 82,8 |
| Big Bench Audio (respuesta hablada, transcrita) | 44,3 % | 81,8 % |
| Full-Duplex-Bench v1.0 (media de 2 tareas de pausa, turn-taking e interrupción) | 87,7 | 94,0 |
| Tasa de etiquetas de sonido en conversaciones held-out (referencia: 0,36) | 0,36 | no disponible |
| Primer audio, un usuario (RTX PRO 6000) | 0,21 s | 0,31 s (E2E) / 0,4 s (Tag) |

Comparativa de VoiceBench con otros modelos full-duplex abiertos citada por el autor: Freeze-Omni 55,2; Moshi 29,5; MiniCPM-o 71,2. El modelo de 4B se sitúa por encima de Freeze-Omni y Moshi y por debajo de MiniCPM-o. Las mediciones se realizaron el 2026-11-16 en una RTX PRO 6000, con evaluadores oficiales de VoiceBench (juez gpt-4o-mini, AlpacaEval sobre el subconjunto estándar de 199 preguntas, media de 9 tareas) y 1.000 preguntas de Big Bench Audio juzgadas por GPT-4.1 sobre la transcripción de la respuesta hablada.

## Requisitos de hardware

- VRAM estimada: aproximadamente 21 GB en bf16 para la variante Flash.
- GPU recomendada: una única GPU de 24 GB (el autor indica que usa ~21 GB); las mediciones se hicieron en una RTX PRO 6000.
- Cabe en GPU consumer de gama alta con 24 GB, como la RTX 4090; no cabe en GPUs de 16 GB o menos en esta variante.
- Existe una variante MLX para Apple silicon con 16 GB o más (Sophon-Realtime-4B-Flash-MLX).
- Despliegue: vLLM 0.30 + vLLM-Omni 0.30 + plugin, mediante los scripts `install.sh` y `start.sh` del repositorio; expone `/v1/realtime` y `/v1/chat/completions`.
- Latencia: 0,21 s hasta el primer audio con un solo usuario en RTX PRO 6000. Throughput con múltiples usuarios concurrentes: no disponible.
- Alternativa sin GPU local: API alojada de adventists.ai (compatible con OpenAI Realtime).

## Comparativa con modelos similares

| Modelo | Parametros | Full-duplex | VoiceBench | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Sophon-Realtime-4B-Flash | 4B (+ talker ligero) | Si | 62,4 | Apache-2.0 | Pesos abiertos en HF y ModelScope |
| Sophon-Realtime-32B-Flash | 32B | Si | 82,8 | Apache-2.0 (según familia) | Pesos abiertos en HF |
| MiniCPM-o | no disponible | Si | 71,2 | no disponible | Pesos abiertos |
| Freeze-Omni | no disponible | Si | 55,2 | no disponible | Pesos abiertos |
| Moshi | no disponible | Si | 29,5 | no disponible | Pesos abiertos |

Dentro de la propia familia, la variante Tag de 4B obtiene 94,3 en Full-Duplex-Bench v1.0 (frente a 87,7 de Flash) pero requiere 32 GB de VRAM y presenta 0,4 s de latencia al primer audio; la variante E2E obtiene 92,3 y 0,31 s, con un consumo de ~31 GB.

## Limitaciones y advertencias

- Capacidad de razonamiento limitada: el autor advierte explícitamente que el cerebro de 4B "sabe y razona mucho menos" que el de 32B y que puede afirmar hechos erróneos con confianza. No es adecuado para respuestas que deban ser correctas.
- Riesgo de alucinación factual elevado en comparación con modelos de mayor tamaño (Big Bench Audio 44,3 % frente a 81,8 % del 32B).
- Idiomas limitados a chino e inglés; no se declara soporte de castellano.
- Sin capacidades de visión.
- Longitud de contexto no publicada, lo que dificulta planificar conversaciones de muy largo recorrido.
- Restricciones éticas y legales sobre clonación de voz: solo debe clonarse la propia voz o una voz sobre la que se tenga permiso explícito.
- El despliegue requiere vLLM 0.30 y vLLM-Omni 0.30 con un plugin específico, lo que limita la portabilidad frente a stacks más estándar (llama.cpp, Ollama, TGI no aparecen soportados).
- Licencia Apache-2.0 permite uso comercial, pero debe revisarse el archivo `NOTICE` para conocer las fuentes de los pesos incluidos.
- Aunque la licencia es permisiva, la exactitud limitada del modelo hace recomendable una capa de verificación o un modelo mayor en producción cuando la respuesta importa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/adventists-ai/Sophon-Realtime-4B-Flash
- Variante MLX para Apple silicon: https://huggingface.co/adventists-ai/Sophon-Realtime-4B-Flash-MLX
- Repositorio GitHub: https://github.com/adventists-ai/sophon-realtime
- Instrucciones de la variante Flash: https://github.com/adventists-ai/sophon-realtime/blob/main/flash/README.md
- Changelog: https://github.com/adventists-ai/sophon-realtime/blob/main/CHANGELOG.md
- Cerebro base DuplexJev-4B-Para: https://huggingface.co/adventists-ai/DuplexJev-4B-Para
- Variante 4B Tag: https://huggingface.co/adventists-ai/Sophon-Realtime-4B-Tag
- Variante 4B E2E: https://huggingface.co/adventists-ai/Sophon-Realtime-4B-E2E
- Variante 32B Tag: https://huggingface.co/adventists-ai/Sophon-Realtime-32B-Tag
- Variante 32B Flash: https://huggingface.co/adventists-ai/Sophon-Realtime-32B-Flash
- Variante 32B E2E: https://huggingface.co/adventists-ai/Sophon-Realtime-32B-E2E
- ModelScope (Flash): https://www.modelscope.cn/models/AdventistsAI/Sophon-Realtime-4B-Flash
- API alojada: https://api.adventists.ai/console/
- Documentación de la API: https://api.adventists.ai/console/docs
