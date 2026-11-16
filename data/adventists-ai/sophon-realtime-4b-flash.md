# adventists-ai/Sophon-Realtime-4B-Flash

## Resumen

Sophon-Realtime-4B-Flash es un modelo de voz a voz (speech-to-speech) full-duplex desarrollado por adventists-ai, la variante ligera de 4B parámetros de la familia Sophon-Realtime. Su particularidad es que mantiene el diseño conversacional de las versiones de 32B (escucha mientras el usuario habla, decide cuándo ha terminado, emite back-channels y produce etiquetas de sonido como `[laughter]` o `[sigh]`) pero cabe en una única GPU de 24 GB, con un consumo aproximado de 21 GB.

El modelo se sirve como un único modelo vLLM-Omni con los endpoints `/v1/realtime` y `/v1/chat/completions`, y se apoya en el cerebro de 4B `DuplexJev-4B-Para` con un adaptador de escritura de etiquetas fusionado. La síntesis de voz la realiza un modelo de habla más ligero que convierte la respuesta etiquetada en audio con un forward pass por cada frame de 80 ms, lo que le permite empezar a hablar mientras sigue generando texto.

Es relevante ahora porque ofrece, con licencia Apache-2.0 y pesos abiertos, un modelo full-duplex de voz que hasta hace poco requería GPUs de 32 GB o superiores, lo que lo hace accesible para demos locales, prototipos de compañeros conversacionales e investigación sobre turn-taking. No obstante, su capacidad de razonamiento es notablemente inferior a la de los builds de 32B, por lo que no está pensado para respuestas que deban ser factualmente correctas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Full-duplex speech-to-speech; cerebro de 4B (`DuplexJev-4B-Para`) con adaptador de etiquetas fusionado, más un modelo de habla ligero para la síntesis (tag-tts) |
| Parametros totales | 4B (cerebro); el modelo de habla es "más ligero" (sin cifra publicada) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos en bf16) |
| Idiomas soportados | Chino (zh) e inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (`thinker/`, `talker/`, `voices/`) |
| Pipeline | any-to-any |
| Libreria | vLLM (vLLM 0.30, vLLM-Omni 0.30) |
| Tamano del repo | 13.0 GB |

## Arquitectura y entrenamiento

El modelo sigue un diseño full-duplex: escucha de forma continua mientras el usuario habla y decide a partir de la propia voz cuándo ha terminado el turno, en lugar de depender de un detector de voz externo. La respuesta se genera como texto con etiquetas de sonido (`[laughter]`, `[cough]`, `[sigh]`, `[breath]`, `<strong>…</strong>`) que posteriormente se convierten en audio mediante un modelo de habla más ligero que procesa un forward pass por cada frame de 80 ms. El cerebro de 4B es `DuplexJev-4B-Para`, un modelo de habla abierto de la misma familia, al que se le ha fusionado un adaptador para la escritura de etiquetas.

El repositorio se organiza en `config.json`, `thinker/` (4B en bf16), `talker/` y `voices/`. La model card no detalla el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO. Tampoco se documentan innovaciones adicionales como decodificación especulativa o atención lineal. La licencia Apache-2.0 se acompaña de un fichero `NOTICE` con las fuentes de los pesos incluidos.

## Capacidades

- Conversación de voz a voz full-duplex: escucha mientras el usuario habla y gestiona el turn-taking de forma autónoma.
- Detección de fin de turno basada en la voz del usuario, sin VAD externo explícito.
- Back-channels y barge-in: puede emitir señales de escucha y ser interrumpido por el usuario.
- Generación de etiquetas de sonido paralingüísticas (`[laughter]`, `[cough]`, `[sigh]`, `[breath]`, `<strong>…</strong>`).
- Síntesis de voz integrada mediante un modelo de habla ligero que habla mientras el cerebro escribe.
- Clonación de voz zero-shot (según la documentación del repositorio, con la advertencia de clonar solo voces propias o con permiso).
- Modo Live documentado en el README del repositorio.
- Soporte de los endpoints `/v1/realtime` (compatible con OpenAI Realtime) y `/v1/chat/completions` a través de vLLM-Omni.
- Idiomas: chino e inglés.
- Sin capacidades de visión: el cerebro de 4B es solo de habla.

## Casos de uso

- Demos locales de voz full-duplex: desplegable en una única GPU de 24 GB con vLLM-Omni, permite montar una demo de conversación por voz en tiempo real sin infraestructura de 32 GB o superior.
- Compañeros conversacionales y personajes: el modelo mantiene el turn-taking, los back-channels y las etiquetas de sonido de la familia, lo que encaja en aplicaciones de acompañamiento donde importa la naturalidad de la interacción más que la exactitud factual.
- Investigación sobre turn-taking: sus puntuaciones en Full-Duplex-Bench v1.0 (87.7 de media en la build Flash) lo convierten en una base abierta para estudiar pausas, interrupciones y solapamiento de habla.
- Atención al cliente de baja exigencia factual: para flujos guiados o FAQ donde las respuestas están acotadas por el sistema y no se depende del conocimiento del modelo.
- Asistentes de voz integrados en aplicaciones: el endpoint `/v1/realtime` compatible con OpenAI Realtime facilita la integración en clientes existentes.
- Prototipado de interfaces de voz con latencia baja: primer audio en 0.21 s en una RTX PRO 6000, adecuado para iterar sobre experiencias conversacionales.
- Clonación de voz para locuciones personalizadas: con la advertencia explícita de usar únicamente voces propias o con permiso.

## Benchmarks y rendimiento

| Benchmark | 4B (Flash) | 32B (publicado) |
|---|---|---|
| VoiceBench overall | 62.4 | 82.8 |
| Big Bench Audio (respuesta hablada, transcrita) | 44.3% | 81.8% |
| Full-Duplex-Bench v1.0 (media de 5 tareas) | 87.7 | 94.0 |
| Sound-tag rate en conversaciones held-out (referencia: 0.36) | 0.36 | — |
| Primer audio, un usuario (RTX PRO 6000) | 0.21 s | — |

Comparativas citadas en la model card para VoiceBench entre modelos full-duplex abiertos: Freeze-Omni 55.2, Moshi 29.5, Sophon-Realtime-4B-Flash 62.4, MiniCPM-o 71.2.

Las mediciones se realizaron el 2026-11-16 en una RTX PRO 6000, con evaluadores oficiales de VoiceBench (juez gpt-4o-mini, AlpacaEval sobre el subconjunto estándar de 199 preguntas, media de 9 tareas), Big Bench Audio con 1.000 preguntas y GPT-4.1 como juez de la transcripción, y Full-Duplex-Bench v1.0 con los mismos scripts que la release de 32B. El primer audio se midió con `client_example.py`, mediana de 6 ejecuciones.

## Requisitos de hardware

- VRAM estimada: aproximadamente 21 GB en la configuración de 24 GB de la build Flash.
- GPU recomendadas: una GPU de 24 GB o superior; las mediciones se hicieron en una RTX PRO 6000.
- Cabe en GPU de consumo: sí, en tarjetas con 24 GB (por ejemplo, la familia RTX 4090/5090 de 24 GB), aunque la model card no confirma explícitamente modelos concretos de consumo.
- Opciones de despliegue: vLLM 0.30 con vLLM-Omni 0.30 y el plugin de Sophon-Realtime; el repositorio proporciona `install.sh` y `start.sh`. No se mencionan llama.cpp, Ollama ni TGI.
- Latencia: primer audio de 0.21 s en RTX PRO 6000 para un usuario.
- Throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Full-duplex | VoiceBench | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Sophon-Realtime-4B-Flash | 4B | Sí | 62.4 | Apache-2.0 | Pesos abiertos (HF, ModelScope) |
| Sophon-Realtime-32B-Flash | 32B | Sí | 82.8 | Apache-2.0 (según familia) | Pesos abiertos (HF, ModelScope) |
| MiniCPM-o | No disponible | No disponible | 71.2 | No disponible | No disponible |
| Freeze-Omni | No disponible | No disponible | 55.2 | No disponible | No disponible |
| Moshi | No disponible | Sí (full-duplex) | 29.5 | No disponible | No disponible |

Los datos de MiniCPM-o, Freeze-Omni y Moshi provienen únicamente de la comparativa citada en la model card (VoiceBench); el resto de especificaciones de esos modelos no se detallan en la información disponible.

## Limitaciones y advertencias

- Capacidad de razonamiento y conocimiento muy inferior a los builds de 32B: VoiceBench 62.4 frente a 82.8 y Big Bench Audio 44.3% frente a 81.8%. Puede afirmar hechos incorrectos con seguridad, según advierte el propio autor.
- No apto para casos donde las respuestas deban ser factualmente correctas; el autor recomienda los builds de 32B o la API alojada para esos escenarios.
- Sin visión: el cerebro de 4B es solo de habla.
- Idiomas limitados a chino e inglés.
- Longitud de contexto no documentada.
- Riesgo de alucinación explícitamente señalado en la model card.
- Sesgos conocidos: no documentados en la información disponible.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero debe revisarse el fichero `NOTICE` por las fuentes de los pesos incluidos.
- Clonación de voz: solo debe clonarse la propia voz o una voz para la que se tenga permiso explícito.
- La build Flash prioriza latencia y huella de memoria sobre calidad de respuesta; el modelo de habla es más ligero que el de la build Tag.

## Enlaces

- Hugging Face: https://huggingface.co/adventists-ai/Sophon-Realtime-4B-Flash
- ModelScope: https://www.modelscope.cn/models/AdventistsAI/Sophon-Realtime-4B-Flash
- Repositorio GitHub: https://github.com/adventists-ai/sophon-realtime
- README de la build Flash: https://github.com/adventists-ai/sophon-realtime/blob/main/flash/README.md
- Changelog: https://github.com/adventists-ai/sophon-realtime/blob/main/CHANGELOG.md
- Cerebro 4B (DuplexJev-4B-Para): https://huggingface.co/adventists-ai/DuplexJev-4B-Para
- Build hermana Tag 4B: https://huggingface.co/adventists-ai/Sophon-Realtime-4B-Tag
- Build hermana E2E 4B: https://huggingface.co/adventists-ai/Sophon-Realtime-4B-E2E
- Build 32B Tag: https://huggingface.co/adventists-ai/Sophon-Realtime-32B-Tag
- Build 32B Flash: https://huggingface.co/adventists-ai/Sophon-Realtime-32B-Flash
- Build 32B E2E: https://huggingface.co/adventists-ai/Sophon-Realtime-32B-E2E
- API alojada (consola): https://api.adventists.ai/console/
- Documentación de la API: https://api.adventists.ai/console/docs
