# adventists-ai/Sophon-Realtime-32B-Flash-4bit

## Resumen

Sophon-Realtime-32B-Flash-4bit es la variante cuantizada a 4 bits de Sophon-Realtime-32B-Flash, un modelo de voz a voz (speech-to-speech) full-duplex desarrollado por adventists-ai. El modelo integra en un único sistema tres etapas: escucha continua de audio, decisión de turno de palabra y generación de la respuesta hablada con etiquetas de sonido. Su objetivo es habilitar conversaciones en tiempo real con latencia baja, sin los pipelines fragmentados habituales de ASR + LLM + TTS.

La innovación principal de esta versión es la compresión del "thinker" (el componente de razonamiento) a pesos de 4 bits, lo que reduce el consumo de memoria de aproximadamente 55 GB a unos 30 GB. Esto permite desplegar el modelo completo en una única GPU de 32 GB en lugar de una de 80 GB, manteniendo la misma API, voces y clonación de voz que la versión completa. Está pensado para una o dos conversaciones simultáneas, frente a las hasta 40 de la versión Flash sin cuantizar.

El modelo se distribuye bajo licencia Apache-2.0, soporta chino e inglés, y se ejecuta sobre vLLM y vLLM-Omni con CUDA MPS para compartir la GPU entre las tres etapas. El repositorio ocupa 25,8 GB en formato safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline de tres etapas (escucha, decisión de turno, síntesis de voz) sobre un thinker de 32B comprimido a 4 bits; no se detalla la arquitectura interna del transformer |
| Parametros totales | 32B (denominación del modelo; no se desglosa el reparto entre etapas) |
| Parametros activos | no disponible |
| Longitud de contexto | 4096 tokens (frente a 8192 en la versión Flash completa) |
| Tipos de cuantizacion | 4 bits (pesos del thinker); no se especifica el esquema exacto (GPTQ, AWQ, etc.) |
| Idiomas soportados | chino (zh), inglés (en) |
| Licencia | Apache-2.0 (código y pesos; ver NOTICE para fuentes) |
| Formato de pesos | safetensors |
| Version | 1.1.6 |
| Memoria en uso | ~30 GB (presupuesto de 32 GB) |
| Tamano del repo | 25,8 GB |

## Arquitectura y entrenamiento

El modelo es un sistema full-duplex de voz a voz que combina tres etapas sobre una única GPU: escucha del audio de entrada, decisión del momento de turno y generación de la respuesta con etiquetas de sonido que guían la síntesis de voz. El componente de razonamiento (thinker) es un modelo de 32B cuyos pesos se han comprimido a 4 bits en esta variante; el resto del pipeline (voces, clonación zero-shot, API) es idéntico al de la versión Flash completa. La inferencia se ejecuta con vLLM 0.30 y vLLM-Omni 0.30, con CUDA MPS activado para que las tres etapas compartan memoria de GPU.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. La model card tampoco detalla innovaciones de atención o decodificación más allá del diseño full-duplex. La cuantización a 4 bits del thinker es la modificación técnica central de esta versión, con un impacto medido de aproximadamente 1,5 puntos en conocimiento (CMMLU y MMLU-Pro) y sin cambios significativos en la escritura de etiquetas de sonido, la claridad del habla ni la gestión de turnos.

## Capacidades

- Conversación de voz a voz en tiempo real con procesamiento full-duplex (escucha mientras genera).
- Decisión autónoma de turno de palabra: detecta cuándo debe responder y cuándo callar.
- Generación de respuestas habladas con etiquetas de sonido que controlan la prosodia y la expresión.
- Clonación de voz zero-shot, con las mismas voces que la versión Flash completa.
- Razonamiento y conocimiento general en chino e inglés (CMMLU 85,5; MMLU-Pro 57,1).
- API compatible con `/v1/chat/completions` y `/v1/realtime`.
- Entrada de imagen desactivada en esta variante para ahorrar memoria (activa en Flash).
- Soporte de system prompt para configurar el comportamiento del asistente.
- No se documenta soporte explícito de tool calling ni de razonamiento multi-paso con agentes.

## Casos de uso

- Asistentes de voz en tiempo real para atención al cliente: el modelo gestiona conversaciones multi-turno con decisión de turno autónoma y latencia de primera respuesta de audio de 0,24 s (mediana) en una H100, adecuado para interacción telefónica o por voz.
- Agentes conversacionales embebidos en dispositivos con una sola GPU de 32 GB: al caber en una H100 de 32 GB o en una RTX PRO 6000 Blackwell, permite desplegar un asistente de voz completo sin infraestructura de 80 GB.
- Clonación de voz para locución personalizada: la funcionalidad zero-shot permite generar respuestas con la voz del usuario en aplicaciones de accesibilidad o avatares.
- Pruebas de concepto y demos de voz a voz: el script `client_example.py` y la API `/v1/realtime` facilitan prototipos rápidos con audio WAV de entrada.
- Sistemas de interpretación bidireccional chino-inglés: el soporte nativo de ambos idiomas y la síntesis de voz permiten construir interfaces de traducción hablada en tiempo real.
- Evaluación de modelos full-duplex en investigación: la variante 4 bits permite reproducir experimentos de turn-taking y latencia en hardware más asequible que la versión completa.
- Despliegue con mayor concurrencia en GPUs de 48 GB o más: reutilizando los pesos 4 bits con un presupuesto de memoria mayor se alcanzan 8 respuestas largas simultáneas con retraso máximo de 0,2 s en una H100.

## Benchmarks y rendimiento

Resultados publicados en la model card (comparación entre Flash-4bit y Flash, misma GPU H100, CUDA MPS):

| Metrica | Flash-4bit | Flash |
|---|---|---|
| CMMLU (2000 preguntas, chino) | 85,5 | 87,1 |
| MMLU-Pro (2000 preguntas, inglés, 10 opciones) | 57,1 | 58,4 |
| Respuestas con etiqueta de sonido (600 turnos) | 13,0% | 14,2% |
| Tasa de error del habla, chino (80 respuestas, mediana) | 1,6% | 0,8% |
| Tasa de error del habla, inglés (69 respuestas, mediana) | 0% | 0% |
| Turn-taking (40 turnos): demasiado pronto / sin respuesta | 11 / 1 | 10 / 2 |

Latencia (H100, configuración de 32 GB, `/v1/chat/completions`, audio del usuario a primer fragmento de audio):

| Escenario | Primera respuesta mediana / P90 | Retraso de reproducción |
|---|---|---|
| 1 conversación, 10 turnos, chino | 0,24 / 0,26 s | 0 |
| 1 conversación, 10 turnos, inglés | 0,24 / 0,27 s | 0 |
| 2 conversaciones simultáneas, respuestas largas | 0,29–0,32 s | 0 |
| 2 conversaciones × 10 turnos | 0,27 / 0,34 s | 0 |
| `/v1/realtime`, fin del habla a primer audio | 0,60 / 0,75 s | – |

En una RTX PRO 6000 Blackwell: primera respuesta de 0,27–0,41 s con una conversación (retraso 0) y de 0,37–0,48 s con dos conversaciones largas simultáneas (retraso de 0,3–0,75 s al inicio de la respuesta). No se ha probado en una RTX 5090 real.

## Requisitos de hardware

- VRAM: aproximadamente 30 GB en uso con un presupuesto de 32 GB; el thinker en 4 bits necesita unos 23 GB solo al arrancar.
- GPU recomendadas: H100 (32 GB de configuración), RTX PRO 6000 Blackwell. Una RTX 5090 (32,6 GB) es teóricamente suficiente pero no se ha validado; requiere ejecución headless y la GPU libre.
- GPUs de 24 GB no son suficientes.
- Con 48 GB o más se pueden usar los pesos 4 bits con mayor presupuesto de memoria (`gpu_memory_utilization`, `max_model_len`, `max_num_seqs`); en una H100 con ajustes de la versión completa ocupa unos 42 GB y soporta 8 respuestas largas simultáneas con retraso máximo de 0,2 s.
- Despliegue: vLLM 0.30 y vLLM-Omni 0.30, con CUDA MPS activado; scripts `install.sh`, `start.sh` y `stop.sh` del repositorio.
- El primer arranque compila kernels durante 5–10 minutos y requiere el CUDA toolkit (`CUDA_HOME`).
- Throughput: una o dos conversaciones simultáneas de forma fiable; dos respuestas largas simultáneas pueden sufrir un retraso breve al inicio en la generación Blackwell.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Memoria | Idiomas | Licencia | Entrada de imagen |
|---|---|---|---|---|---|---|
| Sophon-Realtime-32B-Flash-4bit | 32B (thinker 4 bits) | 4096 | ~30 GB | zh, en | Apache-2.0 | No |
| Sophon-Realtime-32B-Flash | 32B | 8192 | ~55 GB | zh, en | Apache-2.0 | Sí |
| Modelos full-duplex de voz a voz comparables | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

La única alternativa directamente comparable documentada es la versión Flash completa del mismo autor, que ofrece mayor contexto, entrada de imagen y hasta 40 conversaciones simultáneas a cambio de una GPU de 80 GB.

## Limitaciones y advertencias

- La cuantización a 4 bits reduce el conocimiento en aproximadamente 1,5 puntos (CMMLU y MMLU-Pro), una diferencia estadísticamente significativa con 2000 preguntas emparejadas.
- Las respuestas largas (en torno a 100 s) pierden precisión en su segunda mitad; según el autor, el problema proviene de la etapa de voz, no del thinker cuantizado.
- La entrada de imagen está desactivada en esta variante.
- El contexto se reduce a la mitad (4096 frente a 8192 tokens).
- Solo soporta chino e inglés; no se documentan otros idiomas.
- La gestión de turnos muestra fallos: en 40 turnos reales, 11 arranques demasiado pronto y 1 sin respuesta.
- No validado en RTX 5090; en Blackwell, dos respuestas largas simultáneas pueden retrasarse al inicio.
- No se documentan sesgos específicos ni evaluaciones de alucinación; al ser un modelo de voz a voz, el riesgo de respuestas incorrectas con apariencia fluida es relevante en producción.
- Licencia Apache-2.0 permite uso comercial, pero debe revisarse el fichero `NOTICE` para las fuentes de los datos y pesos.
- Requiere compilación de kernels en el primer arranque y el CUDA toolkit, lo que complica despliegues automatizados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/adventists-ai/Sophon-Realtime-32B-Flash-4bit
- Versión completa Flash: https://huggingface.co/adventists-ai/Sophon-Realtime-32B-Flash
- Repositorio GitHub: https://github.com/adventists-ai/sophon-realtime
- Directorio Flash del repositorio: https://github.com/adventists-ai/sophon-realtime/tree/main/flash
- Changelog: https://github.com/adventists-ai/sophon-realtime/blob/main/CHANGELOG.md
- Issues: https://github.com/adventists-ai/sophon-realtime/issues
