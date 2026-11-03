# oruk/orukqwen-asr-1.7b

## Resumen

orukqwen-asr-1.7b es un artefacto de investigación publicado por oruk que parte de Qwen/Qwen3-ASR-1.7B y lo somete a un post-entrenamiento con refuerzo (RL) para reducir la tasa de error de palabra (WER) en reconocimiento automático del habla en inglés. El modelo conserva íntegramente la arquitectura, el tokenizador, el formato de prompt y el código de inferencia del modelo base; solo cambian los pesos. Cuenta con 2.038.052.480 parámetros en safetensors bf16 y se distribuye bajo licencia Apache-2.0.

La contribución técnica es el método de entrenamiento: GSPO con asignación de crédito a nivel de token mediante alineamiento de Levenshtein, seguido de un "model soup" uniforme de tres ejecuciones RL hermanas interpolado al 50 % con el modelo base, al estilo WiSE-FT. Todo el proceso se ejecutó en una única NVIDIA A100 de 40 GB durante aproximadamente 14 horas de GPU, más una pasada de selección de datos de hasta 7,5 horas, sobre un pool de 54,6 horas de audio inglés transcrito.

Es relevante porque demuestra que es posible mejorar de forma medible un ASR de 2B parámetros con recursos muy limitados: el promedio en el Open ASR Leaderboard (conjuntos públicos en inglés, harness oficial) baja de 4,94 a 4,76 WER. El modelo está orientado a investigación y replicabilidad más que a despliegue comercial a gran escala.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3-ASR (transformer encoder-decoder para ASR), idéntica a Qwen/Qwen3-ASR-1.7B |
| Parametros totales | 2.038.052.480 (2,04B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16 safetensors) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 (heredada del modelo base) |
| Formato de pesos | safetensors (layout `-hf` de transformers) |

## Arquitectura y entrenamiento

La arquitectura es la de Qwen3-ASR-1.7B, sin modificaciones: mismo encoder, decoder, tokenizador, formato de prompt y código de inferencia. El cambio está exclusivamente en los pesos, obtenidos mediante post-entrenamiento con RL. El pipeline consta de tres fases: (1) RL con GSPO-token y asignación de crédito a nivel de token; (2) soup uniforme de tres ejecuciones RL hermanas; (3) interpolación 50/50 de ese soup con el modelo base, siguiendo el esquema WiSE-FT.

El RL muestrea 64 transcripciones por grabación con temperatura 0,8 y recompensa `r = 1 − min(WER, 1)` sobre texto normalizado, sin juez aprendido. La ventaja se calcula con baseline leave-one-out normalizado por la desviación típica del grupo, descartando grupos con recompensas idénticas y usando 20 grupos informativos (1.280 transcripciones) por actualización. La innovación principal es la asignación de crédito a nivel de token: cada transcripción se alinea con su referencia mediante Levenshtein a nivel de palabra y, en transcripciones con ventaja positiva, los tokens de palabras erróneas reciben ventaja cero; las palabras de referencia borradas enmascaran el primer token tras el hueco (o el EOS) para no premiar omisiones. Los spans de tokens provienen de los ids muestreados, nunca de texto re-tokenizado. Una de las ejecuciones hermanas aplica además la regla espejo a transcripciones con ventaja negativa, anulando la penalización sobre sus palabras correctas.

## Capacidades

- Reconocimiento automático del habla en inglés sobre audio, con salida de transcripción de texto.
- Formato de prompt y API de inferencia compatibles con Qwen/Qwen3-ASR-1.7B-hf (transformers, pipeline `automatic-speech-recognition`).
- Manejo de audio de dominio variado: conversacional (AMI), reuniones de resultados (Earnings22), podcasts (Gigaspeech), lectura limpia (LibriSpeech), habla espontánea (VoxPopuli), dominio médico (URGENT2024) y acento indio-inglés (Voice Arena Monsoon).
- Robustez frente a muletillas y etiquetas de no-habla gracias a la normalización por palabra usada en el entrenamiento.
- No se documentan en la información disponible capacidades de tool calling, agentes, multilingüismo, visión ni audio más allá del ASR en inglés.

## Casos de uso

- Transcripción de reuniones y actas: el modelo está evaluado en AMI-Cleaned (7,92 WER) y mantiene el formato de prompt del base, por lo que puede integrarse en pipelines de diarización y resumen posteriores para generar actas de reuniones técnicas.
- Subtitulado y transcripción de podcasts: su 7,11 WER en Gigaspeech-Cleaned lo hace adecuado para contenido hablado largo y espontáneo, con pasos de puntuación y segmentación aguas abajo.
- Análisis de llamadas de resultados financieros: el 5,85 WER en Earnings22-Cleaned-AA-chunked permite transcribir audio corporativo para extracción de entidades, análisis de sentimiento y cumplimiento normativo.
- Dictado médico y documentación clínica: el 9,48 WER en URGENT2024 lo sitúa como candidato para borradores de notas clínicas que requieren revisión humana obligatoria.
- Investigación en RL para ASR: al ser un artefacto de investigación con método documentado (GSPO, Levenshtein token-level credit assignment, model soup, WiSE-FT), sirve como punto de partida reproducible para experimentos de post-entrenamiento con una sola A100.
- Evaluación comparativa en leaderboards: al usar el harness oficial del Open ASR Leaderboard y publicar resultados por conjunto de datos, es útil como baseline afinado en estudios de ablación de técnicas de RL.
- Transcripción de acento indio-inglés: el 3,5 WER en Voice Arena Monsoon lo hace apropiado para aplicaciones de atención al cliente en centros de contacto con acento del sur de Asia.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados de forma independiente, `verified: false`):

| Conjunto de datos | Split | WER |
|---|---|---|
| LibriSpeech Clean | test.clean | 1,20 |
| LibriSpeech Other | test.other | 2,89 |
| SPGISpeech | test | 2,75 |
| VoxPopuli-AA-Cleaned | test | 2,11 |
| Voice Arena Monsoon (en_IN) | test | 3,50 |
| Earnings22-Cleaned-AA-chunked | test | 5,85 |
| Gigaspeech-Cleaned | test | 7,11 |
| AMI-Cleaned | test | 7,92 |
| URGENT2024 | test | 9,48 |
| Promedio Open ASR Leaderboard (inglés, harness oficial) | — | 4,76 (base: 4,94) |

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 4,1 GB solo para pesos (2,04B × 2 bytes), más overhead de activaciones y buffers de audio; en la práctica se recomienda reservar 6-8 GB.
- GPU recomendadas: A100 40GB (la usada en el entrenamiento), H100, L40S, A10G; cualquier GPU con al menos 8 GB de VRAM para bf16.
- Cabe en GPU de consumo: sí, en RTX 3090, RTX 4090, RTX 4080 y superiores; en GPUs de 8 GB conviene usar cuantización (no se documentan pesos GGUF oficiales).
- Opciones de despliegue: transformers (pipeline `automatic-speech-recognition`, layout `-hf`), endpoints compatibles según el tag `endpoints_compatible`; no se documentan recetas para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada; el coste de entrenamiento fue de unas 14 GPU-horas en una A100 40GB, más hasta 7,5 GPU-horas de selección de datos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | WER medio Open ASR (inglés) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| oruk/orukqwen-asr-1.7b | 2,04B | no disponible | 4,76 (declarado) | Apache-2.0 | HuggingFace |
| Qwen/Qwen3-ASR-1.7B (base) | ~1,7B (según nombre) | no disponible | 4,94 (declarado por oruk) | Apache-2.0 | HuggingFace |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible |

El modelo base es la referencia directa y la única comparación documentada en la información disponible; no se dispone de datos de otros ASR comparables en la búsqueda realizada.

## Limitaciones y advertencias

- Solo soporta inglés (`language: en`); no se ha validado para otros idiomas.
- Es un artefacto de investigación: los resultados de benchmark están declarados por el autor y marcados como no verificados (`verified: false`).
- El WER en dominios difíciles sigue siendo alto (9,48 en URGENT2024, 7,92 en AMI-Cleaned), por lo que en entornos clínicos o de reuniones ruidosas requiere revisión humana.
- Riesgo de alucinación en audio con ruido, silencios largos o habla solapada; no se documentan mecanismos de detección de no-habla más allá de la normalización de muletillas.
- Sesgos: no se documenta análisis de sesgo por acento, género, edad o dialecto; el único conjunto con acento específico es Voice Arena Monsoon (indio-inglés).
- Licencia Apache-2.0 permite uso comercial, pero al derivar de Qwen3-ASR-1.7B conviene revisar los términos del modelo base y de los datasets de entrenamiento (54,6 horas de audio transcrito) antes de un despliegue en producción.
- No se publican pesos cuantizados (GGUF, AWQ, GPTQ) ni recetas de despliegue de alta concurrencia, lo que limita el uso en infraestructuras de bajo coste.
- El contexto máximo de audio no está especificado; para grabaciones largas habrá que segmentar externamente.
- El modelo tiene muy poca tracción (17 descargas, 0 likes en el momento de la consulta), por lo que no hay validación comunitaria independiente.

## Enlaces

- HuggingFace: https://huggingface.co/oruk/orukqwen-asr-1.7b
- Modelo base: https://huggingface.co/Qwen/Qwen3-ASR-1.7B
- Referencia GSPO: arXiv:2507.18071
- Referencia model soup: arXiv:2203.05482
- Referencia WiSE-FT: arXiv:2109.01903
- Referencia adicional citada en tags: arXiv:2601.21337, arXiv:2512.20856
- Open ASR Leaderboard: https://huggingface.co/spaces/hf-audio/open_asr_leaderboard
