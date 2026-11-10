# lee1jun/LES-eg2-665M-asr-en

## Resumen

LES-eg2-665M-asr-en es un sistema de reconocimiento automático del habla (ASR) en inglés que reutiliza EmbeddingGemma 2 como extractor congelado de representaciones de audio y texto, y añade un "lector" entrenado de 88M de parámetros que convierte los estados ocultos en salidas CTC a nivel de palabra. Lo desarrolla el usuario lee1jun y se distribuye con licencia Apache 2.0. La idea central es que el habla y las palabras se encuentran en un mismo espacio de embeddings: cada token blando de 40 ms produce un vector que se compara por similitud coseno con una tabla de 407.736 embeddings de palabras generados por el propio EmbeddingGemma 2.

El modelo completo en inferencia ocupa 664,6M de parámetros (576,6M congelados de EmbeddingGemma 2 en su configuración audio-lenguaje más 88,0M del lector entrenado). Alcanza un WER de 1,74 en LibriSpeech test-clean en decodificación greedy y 1,58 con el reranker, según la model card. Es relevante porque demuestra que se puede obtener ASR competitivo sin reentrenar el backbone multimodal, y porque permite modificar el vocabulario sin reentrenar: basta con sustituir la tabla de palabras.

Una particularidad destacable es que se entrenó únicamente con datos de licencia permisiva (sin GigaSpeech, SPGISpeech, TED-LIUM ni Fisher), lo que habilita su uso comercial. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y el modelo fue creado el 10 de noviembre de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | EmbeddingGemma 2 congelado (encoder de audio USM: 2 conv de downsampling + 12 capas conformer; adaptador de audio 1536→512; backbone bidireccional de 24 capas) + lector Transformer de 12 capas × 768 con cabeza CTC a nivel de palabra |
| Parametros totales | 664,6M en inferencia (greedy/beam); 671,1M con la segunda pasada (reranker) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (la tabla de palabras se almacena en INT8 por filas; no se documentan cuantizaciones del modelo completo) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (transformers, con código remoto `trust_remote_code=True`) |

## Arquitectura y entrenamiento

El sistema mantiene íntegros los pesos de EmbeddingGemma 2 (576,6M de parámetros en configuración audio-lenguaje: encoder de audio de 304,8M, adaptador de 0,8M y backbone de 271,0M). El encoder de audio, basado en arquitectura USM, convierte entradas Mel filterbank en 25 tokens blandos por segundo con dimensión d_A = 1536; el adaptador los proyecta a d_M = 512 y el backbone bidireccional de 24 capas los procesa. El lector entrenado (88,0M, Transformer de 12 capas × 768) consume, para cada token blando, la entrada del backbone, sus 24 salidas de capa, las doce capas conformer y la salida del encoder de audio, y produce un logit de blank y un vector unitario.

La decodificación se realiza comparando por coseno ese vector con la tabla de palabras (`word_table.safetensors`, 407.736 × 768, almacenada en INT8 por filas), que es una caché de embeddings de texto de EmbeddingGemma 2 (mean pooling, proyección lineal a d = 768, normalización L2). La decodificación greedy emite la palabra más cercana cuando la puntuación supera el logit de blank, y los decodificadores beam conservan las 16 filas más cercanas de cada frame como candidatos. El encoder de visión (167M) no se carga.

Los datos de entrenamiento proceden de LibriSpeech, People's Speech, VoxPopuli, AMI, Common Voice 17.0, MLS English y NVIDIA Granary. No se especifica en la información disponible el número de tokens de entrenamiento ni si se aplicaron técnicas de RLHF o DPO (no aplicables habitualmente en ASR CTC). La innovación principal es el uso de una tabla de vocabulario intercambiable sin reentrenamiento y la exposición de las salidas crudas (lista 32-best puntuada, candidatos por frame, puntuación de hipótesis y búsqueda sobre candidatos propios) para re-ranking externo.

## Capacidades

- Reconocimiento de voz en inglés con salida CTC a nivel de palabra.
- Decodificación greedy, beam con modelo de n-gramas (descarga `lee1jun/LES-eg2-asr-en-lm-4gram`) y reranking con cabezas dedicadas (32-best).
- Control de vocabulario: permite añadir palabras o reemplazar la tabla completa sin reentrenar (`add_words` / `set_vocabulary` mediante sentence-transformers).
- Exposición de salidas crudas para re-ranking propio: lista 32-best puntuada, candidatos de palabra por frame, puntuación de cualquier hipótesis y búsqueda sobre candidatos del usuario.
- Generación de embeddings de audio y texto de EmbeddingGemma 2 en la misma pasada.
- No se documentan tool calling, capacidades de agente, visión ni audio más allá del propio ASR en la información disponible.

## Casos de uso

- Transcripción de reuniones y actas: el modelo procesa audio en inglés y ofrece decodificación beam con LM de n-gramas, adecuada para conversaciones multi-hablante de datasets como AMI; la salida 32-best permite revisión posterior.
- Subtitulado automático de vídeo en inglés: con WER de 1,74 en LibriSpeech test-clean, es viable para generar subtítulos con revisión humana en contenido de habla clara.
- Dominios con jerga específica: al permitir añadir palabras a la tabla de vocabulario sin reentrenar, se puede adaptar a terminología médica, legal o de producto introduciendo los términos como embeddings de texto.
- Búsqueda y recuperación sobre audio: los embeddings de audio y texto de EmbeddingGemma 2 en la misma pasada permiten indexar segmentos de audio y consultarlos con texto.
- Re-ranking en pipelines ASR existentes: las salidas crudas (candidatos por frame, puntuación de hipótesis) permiten integrar el modelo como componente de rescoring en un sistema mayor.
- Prototipado e investigación en ASR: al ser Apache 2.0 y no requerir reentrenamiento del backbone, sirve para experimentar con vocabularios alternativos y estrategias de decodificación en entornos académicos y comerciales.
- Asistentes de voz en inglés: la latencia de un modelo de 664,6M parámetros y la decodificación greedy permiten integrarlo en aplicaciones de dictado o comandos de voz.

## Benchmarks y rendimiento

Resultados publicados en la model card (normalizador de Open ASR Leaderboard):

| Test set | WER greedy | WER con LM n-gramas | WER con reranker |
|---|---|---|---|
| LibriSpeech test-clean | 1,74 | 1,61 | 1,58 |
| Otros siete test sets en inglés | No disponibles en el extracto | No disponibles | No disponibles |

La model card menciona siete conjuntos de test adicionales en su tabla de resultados, pero los valores concretos no están incluidos en la información proporcionada. No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada: el modelo completo en inferencia ocupa 664,6M parámetros; en precisión completa (fp32) serían aproximadamente 2,7 GB, y en fp16/bf16 unos 1,4 GB, sin contar la tabla de palabras (407.736 × 768 en INT8, aproximadamente 300 MB). No se documentan cuantizaciones oficiales.
- GPU recomendadas: no especificadas en la información disponible. Por tamaño, cualquier GPU con al menos 4-6 GB de VRAM debería alojar el modelo en fp16.
- Cabe en GPU de consumo: previsiblemente sí (RTX 3060, RTX 4060, RTX 4090), aunque no se confirma en la documentación.
- Opciones de despliegue: la model card usa `transformers` con `trust_remote_code=True` y requiere torch ≥ 2.11, transformers ≥ 5.20, torchvision, safetensors, numpy, soundfile y soxr. Para beam con LM se necesita kenlm; para `add_words`/`set_vocabulary`, sentence-transformers ≥ 6.1. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se han publicado comparaciones con modelos alternativos en la información proporcionada. Como referencia estructural, el modelo se apoya en EmbeddingGemma 2 (Google), del que reutiliza 576,6M de parámetros congelados, pero no se dispone de datos de rendimiento de otros sistemas ASR comparables (por ejemplo, Whisper o Parakeet) en la documentación consultada.

| Modelo | Parámetros | Contexto | WER LibriSpeech test-clean | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LES-eg2-665M-asr-en | 664,6M | No disponible | 1,74 (greedy) | Apache 2.0 | Hugging Face |
| Alternativas comparables | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Solo soporta inglés; no se documentan otros idiomas.
- El WER de 1,74 se ha medido en LibriSpeech test-clean, un corpus de habla leída y limpia; el rendimiento en audio ruidoso, acentos marcados o habla espontánea puede degradarse considerablemente.
- Riesgo de alucinación y de errores en palabras fuera del vocabulario: la tabla de 407.736 palabras puede no cubrir nombres propios, siglas o términos técnicos, aunque se pueden añadir manualmente.
- La decodificación greedy depende de un umbral (logit de blank) que puede producir omisiones o inserciones en pasajes ambiguos.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código del autor del repositorio; conviene auditar el código antes de usarlo en producción.
- Dependencia de versiones muy recientes de torch (≥ 2.11) y transformers (≥ 5.20), lo que puede complicar el despliegue en entornos con versiones fijadas.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base EmbeddingGemma 2 debe cumplir sus propios términos; la model card indica que los datos de entrenamiento son permisivos, aunque no se detalla la verificación completa.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que sugiere escasa validación por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/lee1jun/LES-eg2-665M-asr-en
- Modelo de n-gramas: https://huggingface.co/lee1jun/LES-eg2-asr-en-lm-4gram
- Paper de EmbeddingGemma 2: https://arxiv.org/abs/2610.37364
- Modelo base: https://huggingface.co/google/embeddinggemma-2
- kenlm: https://github.com/kpu/kenlm
