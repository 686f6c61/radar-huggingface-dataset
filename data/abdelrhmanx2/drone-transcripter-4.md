# AbdelrhmanX2/drone-transcripter-4

## Resumen

Drone Transcripter 4 es un modelo de reconocimiento automático del habla (ASR) especializado en árabe egipcio, desarrollado por Drone Academy y publicado por el usuario AbdelrhmanX2 en Hugging Face. Se trata de un ajuste fino completo (full fine-tune) del modelo `openai/whisper-large-v3-turbo`, que parte de una arquitectura transformer encoder-decoder de 809 millones de parámetros y está orientado principalmente a la transcripción de clases y conferencias en dialecto egipcio, aunque también cubre habla cotidiana, árabe estándar moderno (MSA) y code-switching árabe-inglés.

El modelo aborda un problema concreto: los sistemas ASR multilingües genéricos, incluido el Whisper original, rinden muy por debajo de lo aceptable en dialectos árabes. Según la propia model card, el modelo base obtiene un WER del 64,0 % en el conjunto de clases egipcias retenido, frente al 10,2 % de este ajuste. Esa diferencia de más de 50 puntos porcentuales en el dominio objetivo es el argumento central del modelo.

Es relevante ahora porque el árabe egipcio es uno de los dialectos con menos recursos supervisados de calidad, y este modelo se entrena sobre 329,5 horas de audio revisado por humanos y limpiado con Gemini, con un checkpoint listo para `transformers` (safetensors) y una conversión a `whisper.cpp` (GGML f16) que permite ejecución en CPU o GPU de consumo. La licencia Apache-2.0, heredada del modelo base, facilita su uso comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper large-v3-turbo) |
| Parámetros totales | 809 M |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (ventana de audio de 30 s por segmento, propia de Whisper; no confirmado en la información) |
| Tipos de cuantización | f16 (GGML); safetensors en el checkpoint original. Otras cuantizaciones no disponibles |
| Idiomas soportados | Árabe (`ar`), árabe egipcio (`arz`); incluye palabras en inglés dentro del habla árabe |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (`WhisperForConditionalGeneration`) y GGML `.bin` (f16) para whisper.cpp |

## Arquitectura y entrenamiento

El modelo es un Whisper large-v3-turbo completo, es decir, un transformer encoder-decoder con 809 M de parámetros (la variante «turbo» reduce el número de capas del decoder respecto a large-v3). El ajuste fino es completo, no mediante adaptadores ni LoRA: 2 épocas, 4.712 pasos, batch de 32, learning rate de 1e-5 con warm-up del 5 % y decaimiento lineal, precisión bf16, ejecutado en una única A100-40GB durante aproximadamente 3,5 horas.

Los datos de entrenamiento suman 329,5 horas y 75.390 clips: 122,4 horas de clases revisadas por humanos más 207,1 horas de clases de plataforma recortadas y limpiadas con Gemini. Se excluyeron canciones y música. No se menciona en la información disponible el uso de RLHF, DPO ni ninguna técnica de alineación adicional; el pipeline es un fine-tune supervisado clásico sobre transcripciones.

## Capacidades

- Transcripción de voz a texto en árabe egipcio, con salida en escritura árabe y sin puntuación.
- Reconocimiento de árabe estándar moderno (MSA), con WER del 10,5 % en FLEURS ar_eg.
- Manejo de code-switching árabe-inglés: las palabras en inglés se conservan en alfabeto latino, con un 90,1 % de acierto declarado.
- Normalización de números hablados, con un 91,7 % de acierto declarado.
- Segmentación de audio de larga duración mediante el pipeline estándar de Whisper.
- Ejecución tanto en `transformers` como en `whisper.cpp` (CPU, Metal o CUDA).
- No soporta tool calling, function calling, agentes, visión ni audio más allá del ASR estándar.

## Casos de uso

- Transcripción de clases y conferencias egipcias: es el dominio objetivo del ajuste y donde el modelo rinde mejor (WER del 10,2 % en el conjunto retenido de 600 clips). Adecuado para digitalizar material docente y generar apuntes buscables.
- Subtitulado de vídeo educativo en dialecto egipcio: el checkpoint GGML permite procesar lotes de audio en CPU sin GPU dedicada, lo que abarata pipelines de subtitulado a gran escala.
- Investigación en dialectología árabe: al ofrecer WER comparables sobre MGB-3 y FLEURS, sirve como línea base para estudiar variación dialectal y code-switching.
- Atención al cliente en centros de llamadas egipcios: útil para transcribir conversaciones y alimentar análisis de calidad, siempre que se acepte su debilidad en habla telefónica ruidosa (WER del 40,2 % en Casablanca).
- Indexación y búsqueda de archivos audiovisuales: transcripción previa a la indexación semántica de vídeos o pódcasts en árabe egipcio.
- Prototipado de asistentes de voz locales: la variante whisper.cpp f16 permite desplegar en portátiles o dispositivos edge sin depender de la nube.
- Evaluación comparativa de ASR dialectal: como referencia reproducible con licencia Apache-2.0 para comparar futuros modelos de árabe egipcio.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo (WER, menor es mejor; no verificados de forma independiente):

| Conjunto | Este modelo | Whisper large-v3-turbo base | Notas |
|---|---|---|---|
| Clases egipcias, retenido (600 clips) | 10,2 | 64,0 | Dominio objetivo |
| MGB-3 egipcio, multi-referencia (773 clips) | 15,3 (MR-WER) | no disponible | GigaSpeech 3 obtiene 17,99 en los mismos clips |
| FLEURS ar_eg (MSA) | 10,5 | no disponible | — |
| Casablanca (egipcio) | 40,2 | no disponible | Habla cotidiana; GigaSpeech 3 obtiene 38,1 |
| GigaSpeechBench EGY | 48,46 | no disponible | Scorer oficial, con puntuación |
| Palabras en inglés dentro de habla árabe | 90,1 % correctas | no disponible | — |
| Números | 91,7 % correctas | no disponible | — |

## Requisitos de hardware

- VRAM estimada: en torno a 2-3 GB en f16 para el checkpoint de 809 M de parámetros, más el overhead de activaciones y del pipeline; cómodo en GPUs de 8 GB o superiores.
- GPU recomendadas: cualquier GPU con al menos 8 GB (RTX 3060, RTX 4060, RTX 4090) para inferencia en `transformers`; A100 o H100 solo necesarias para entrenamiento o inferencia de alto throughput por lotes.
- Cabe en GPU de consumo: sí, en cualquier tarjeta moderna con 8 GB o más; el entrenamiento original se realizó en una A100-40GB.
- Opciones de despliegue: `transformers` con `pipeline("automatic-speech-recognition")`, `whisper.cpp` (CLI `whisper-cli` con el binario GGML f16), y presumiblemente servidores compatibles con Whisper como faster-whisper o TGI, aunque la información disponible solo documenta explícitamente `transformers` y `whisper.cpp`.
- Latencia y throughput: no disponibles en la información proporcionada. El entrenamiento completo requirió unas 3,5 horas en una A100-40GB, dato que no equivale a latencia de inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / audio | WER egipcio (MGB-3) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Drone Transcripter 4 | 809 M | Segmentos de 30 s (Whisper) | 15,3 (MR-WER) | Apache-2.0 | Hugging Face, safetensors + GGML |
| openai/whisper-large-v3-turbo | 809 M | Segmentos de 30 s | no disponible (64,0 en clases egipcias) | Apache-2.0 | Hugging Face |
| GigaSpeech 3 | no disponible | no disponible | 17,99 | no disponible | no disponible |

La comparación con GigaSpeech 3 se limita a los clips de MGB-3 y Casablanca citados en la model card; no se dispone de sus especificaciones técnicas ni de su licencia en la información proporcionada.

## Limitaciones y advertencias

- El propio autor reconoce que el modelo es más fuerte en clases y habla de aula que en conversación casual o audio telefónico ruidoso: el WER sube al 40,2 % en el conjunto Casablanca.
- La salida es árabe egipcio sin puntuación; si se necesita texto puntuado hay que añadir un paso posterior de puntuación.
- El WER de 48,46 en GigaSpeechBench EGY con el scorer oficial (incluyendo puntuación) indica un rendimiento notablemente peor en ese benchmark, probablemente por la ausencia de puntuación en las salidas.
- Riesgo de alucinación inherente a los modelos Whisper en segmentos con silencio, ruido o audio ininteligible; conviene aplicar umbrales de confianza y detección de silencios.
- Sesgos dialectales: el entrenamiento se centra en árabe egipcio de clases, por lo que otros dialectos árabes y registros formales pueden degradarse.
- Los resultados de benchmarks son declarados por el autor y no han sido verificados de forma independiente (`verified: false` en el model-index).
- Licencia Apache-2.0: permite uso comercial, pero se solicita citar a Drone Academy y enlazar a la página del modelo.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validación comunitaria ni reportes de uso en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AbdelrhmanX2/drone-transcripter-4
- Demo en vivo: https://asr.drone-academy.online
- Modelo base: https://huggingface.co/openai/whisper-large-v3-turbo
- Repositorio whisper.cpp: https://github.com/ggerganov/whisper.cpp
