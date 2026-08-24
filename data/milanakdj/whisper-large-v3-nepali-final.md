# milanakdj/whisper-large-v3-nepali-final

## Resumen

`milanakdj/whisper-large-v3-nepali-final` es un modelo de reconocimiento automático del habla (ASR) fine-tuneado sobre `openai/whisper-large-v3` para transcribir audio en nepalí. Desarrollado por el usuario milanakdj, el modelo se entrenó sobre el dataset `lilgoose7777/slr-combined-nepali-tts2`, compuesto por audio limpio de un solo hablante en estudio. El resultado es un transcriptor especializado que alcanza un WER del 11,45 % y un CER del 3,08 % en un conjunto de test reservado.

El modelo conserva la arquitectura encoder-decoder de Whisper large-v3, con 1.543.490.560 parámetros, y se distribuye en formato safetensors bajo licencia Apache 2.0. Su relevancia radica en ofrecer una alternativa fine-tuneada para nepalí, un idioma con pocos recursos ASR de calidad, aunque con limitaciones claras en entornos ruidosos o con múltiples hablantes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder-decoder Transformer (Whisper large-v3) |
| Parametros totales | 1.543.490.560 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | Ventana de audio de 30 segundos; generacion de hasta 225 tokens (segun ejemplo de uso) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, precision no especificada) |
| Idiomas soportados | ne (nepali) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Whisper large-v3 de OpenAI, un transformer encoder-decoder con atención estándar, diseñado para procesar espectrogramas de audio de 30 segundos y generar transcripciones de texto. El fine-tune se realizó sobre el dataset `lilgoose7777/slr-combined-nepali-tts2`, con 177.000 filas de audio a 16 kHz mono, divididas en 80 % entrenamiento, 10 % validación y 10 % test. El entrenamiento duró 3 épocas (26.550 pasos) con una tasa de aprendizaje de 5e-06, schedule lineal con 5 % de warmup, batch efectivo de 16, precisión bf16, gradient checkpointing y optimizador Adafactor. Se empleó la semilla 42 para la partición de datos y el entrenamiento.

No se mencionan innovaciones técnicas adicionales más allá del fine-tune estándar. El modelo se promociona como el mejor checkpoint (el de 26.550 pasos) según el WER en validación.

## Capacidades

- Transcripción de audio en nepalí a texto (tarea `transcribe`).
- Generación de texto a partir de características de audio de 16 kHz.
- Soporte de decodificación autoregresiva con `max_new_tokens` configurable.
- Integración con la librería `transformers` de Hugging Face mediante `WhisperForConditionalGeneration` y `WhisperProcessor`.
- No soporta tool calling, visión, audio de entrada múltiple ni modos de razonamiento especiales.
- Capacidad multilingüe limitada al nepalí, aunque el modelo base Whisper large-v3 soporta muchos idiomas, este fine-tune está especializado en nepalí.

## Casos de uso

- Transcripción de reuniones y entrevistas en nepalí: el modelo puede convertir grabaciones de audio de reuniones a texto, útil para actas o búsqueda de contenido. Su ventana de 30 segundos permite procesar segmentos largos con solapamiento.
- Subtitulado automático de vídeos en nepalí: se puede integrar en pipelines de generación de subtítulos para contenido multimedia, aprovechando la salida de texto con marcas de tiempo (si se usa el decodificador adecuado).
- Asistentes de voz para servicios locales: transcripción de comandos de voz en nepalí para aplicaciones de atención al cliente o interfaces de voz, siempre que el audio sea limpio y de un solo hablante.
- Archivado y búsqueda de audio histórico: digitalización de archivos de audio en nepalí (grabaciones de radio, podcasts) para hacerlos indexables y buscables.
- Herramientas de accesibilidad: generación de transcripciones para personas con discapacidad auditiva en contenido nepalí, como clases o conferencias.
- Investigación lingüística: análisis de corpus orales en nepalí, con transcripciones de alta precisión en condiciones controladas.

## Benchmarks y rendimiento

Según la model card, el modelo se evaluó en un subconjunto de test de 2.000 ejemplos (de 17.700) que no vio durante el entrenamiento. Los resultados son:

| Metrica | Valor |
|---|---|
| Test WER | 11,45 % |
| Test CER | 3,08 % |
| Test examples scored | 2000 de 17700 |
| Best per-epoch eval WER | 17,62 % |
| Final train loss | 0,01 |
| Steps trained | 26550 |
| Epochs completed | 3,00 |

No se han publicado comparaciones con otros modelos ASR nepalí en la información disponible.

## Requisitos de hardware

- VRAM estimada: el modelo tiene 1.543 M de parámetros. En FP32 (probablemente el formato del repo, 6,2 GB) se necesitan al menos 6,2 GB de VRAM para cargar los pesos, más overhead de activaciones. En FP16 (si se convierte) bastarían ~3,1 GB, y en int8 ~1,5 GB.
- GPU recomendadas: para inferencia en FP16, una GPU con 4-6 GB de VRAM (p. ej., RTX 3060, RTX 4060) es suficiente. Para lotes grandes o baja latencia, se recomienda una RTX 3090, RTX 4090 o A100.
- En consumer GPU: sí, cabe en GPUs de gama media con al menos 4 GB de VRAM si se usa FP16 o cuantización.
- Opciones de despliegue: se puede usar con `transformers` (PyTorch), `faster-whisper` (CTranslate2), o servidores de inferencia como TGI o vLLM (aunque Whisper no es el foco principal de vLLM). También es compatible con `endpoints_compatible` según los tags.
- Latencia y throughput: no se han publicado datos específicos. Como referencia, Whisper large-v3 en una GPU moderna procesa audio en tiempo real o más rápido, pero depende del hardware y la optimización.

## Comparativa con modelos similares

No se dispone de información sobre otros modelos ASR nepalí comparables en la documentación proporcionada. El modelo base `openai/whisper-large-v3` tiene un rendimiento generalista, pero no se han publicado sus métricas específicas en nepalí. Se puede considerar que este fine-tune mejora la precisión en nepalí frente al base, pero no hay datos cuantitativos para confirmarlo.

## Limitaciones y advertencias

- Entrenado exclusivamente con audio limpio de un solo hablante en estudio; el rendimiento degrada significativamente con ruido de fondo, múltiples hablantes o acentos fuertes.
- El dataset de entrenamiento es sintético o TTS (según el nombre `slr-combined-nepali-tts2`), lo que puede introducir sesgos hacia voces generadas y afectar la generalización a habla natural.
- Riesgo de alucinaciones en segmentos de audio ambiguos o de baja calidad, común en modelos Whisper.
- Limitado al nepalí; no se garantiza un buen rendimiento en otros idiomas a pesar de que el modelo base los soporte.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda verificar la licencia del dataset de entrenamiento (no especificada en la información).
- El modelo no incluye soporte para tareas de traducción (solo `transcribe`), aunque el base sí las tiene.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/milanakdj/whisper-large-v3-nepali-final)
- [Dataset de entrenamiento](https://huggingface.co/datasets/lilgoose7777/slr-combined-nepali-tts2)
- [Checkpoints de respaldo](https://huggingface.co/milanakdj/whisper-large-v3-nepali-checkpoints)
- [Modelo base: openai/whisper-large-v3](https://huggingface.co/openai/whisper-large-v3)
