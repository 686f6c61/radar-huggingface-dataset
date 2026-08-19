# Kiyan122/whisper-small-fa-commonvoice

## Resumen

El modelo `whisper-small-fa-commonvoice` es un ajuste fino (fine-tune) del modelo `openai/whisper-small` realizado por Kiyan122, orientado al reconocimiento automático del habla (ASR) en persa (farsi). Aunque el modelo base de OpenAI ya soporta 99 idiomas, este ajuste específico busca mejorar la precisión en persa, probablemente entrenado sobre el corpus CommonVoice (como sugiere el nombre). El modelo fue generado automáticamente con el Trainer de HuggingFace y no incluye una documentación detallada ni resultados de evaluación publicados.

Con aproximadamente 241,7 millones de parámetros, hereda la arquitectura encoder-decoder de Whisper y su ventana de contexto de 30 segundos de audio. Su relevancia radica en ofrecer una opción de ASR en persa basada en un modelo consolidado, aunque la falta de métricas oficiales obliga a validarlo empíricamente antes de usarlo en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper) |
| Parametros totales | 241.734.912 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 30 segundos de audio (448 tokens de audio) |
| Tipos de cuantizacion | no disponible (se puede cuantizar con herramientas estandar como llama.cpp o bitsandbytes) |
| Idiomas soportados | Persa (fa) como idioma principal; el modelo base soporta 99 idiomas |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo mantiene la arquitectura original de Whisper-small: un transformer encoder-decoder con atención de tiempo y espacio, diseñado para procesar espectrogramas de Mel de 80 bandas. El encoder convierte la señal de audio en representaciones latentes y el decoder genera el texto transcrito de forma autorregresiva. No se ha modificado la arquitectura; solo se ha realizado un ajuste fino sobre el checkpoint preentrenado.

El entrenamiento se realizó con el Trainer de HuggingFace usando los siguientes hiperparámetros: learning rate de 1e-5, batch total de 256 (tras acumulación de gradientes en 2 GPUs), 400 pasos de entrenamiento, scheduler de tipo `cosine_with_min_lr` con 40 pasos de warmup y precisión mixta (AMP). No se especifica el dataset exacto de entrenamiento, aunque el nombre del repositorio sugiere CommonVoice. No se menciona el uso de RLHF, DPO u otras técnicas de alineación.

## Capacidades

- Transcripción de audio a texto en persa (farsi) con la arquitectura Whisper.
- Reconocimiento de voz multilingüe limitado: aunque el modelo base soporta 99 idiomas, el ajuste fino puede degradar el rendimiento en otros idiomas.
- Procesamiento de audio de hasta 30 segundos por ventana (con manejo de segmentos más largos mediante fragmentación).
- Extracción de características robusta frente a ruido y acentos, heredada del preentrenamiento de Whisper.
- No se ha verificado soporte para tool calling, agentes o razonamiento multi-paso, ya que es un modelo de transcripción puro.

## Casos de uso

- Transcripción de reuniones y entrevistas en persa: el modelo puede convertir grabaciones de voz en texto con una precisión aceptable para persa, facilitando la generación de actas o subtítulos.
- Subtitulado automático de vídeos en persa: integrable en pipelines de procesamiento de vídeo para generar subtítulos en tiempo real o diferido.
- Asistentes de voz para aplicaciones en persa: sirve como backend de reconocimiento de voz para comandos de voz o dictado en aplicaciones móviles y de escritorio.
- Análisis de llamadas de atención al cliente: transcribe llamadas en persa para su posterior análisis de sentimiento o búsqueda de palabras clave.
- Accesibilidad para personas con discapacidad auditiva: convierte contenido hablado en persa a texto para su lectura en tiempo real.
- Archivado de material audiovisual histórico: digitaliza y transcribe archivos de audio en persa para su indexación y búsqueda.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La sección `model-index` de la model card está vacía (`results: []`), por lo que no existen métricas oficiales de WER, CER ni comparativas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: ~1-2 GB en FP16 (Whisper-small tiene 244M parámetros; el peso del checkpoint es de ~1 GB en FP32, ~0,5 GB en FP16).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM, p. ej., NVIDIA GTX 1650, RTX 3060, o superiores. También puede ejecutarse en CPU con tiempos de inferencia mayores (del orden de segundos por 30 s de audio).
- En consumer GPU: sí, cabe en GPUs de gama media como RTX 3060 o superiores.
- Opciones de despliegue: compatible con HuggingFace Transformers (pipeline `automatic-speech-recognition`), también se puede exportar a ONNX o usar con `faster-whisper` para acelerar la inferencia.
- Latencia estimada: en GPU moderna (RTX 3090) la transcripción de 30 s de audio suele tardar <1 s; en CPU puede tardar 3-10 s.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| whisper-small-fa-commonvoice (este) | 241,7M | 30 s | Persa (principal) | Apache-2.0 | Fine-tune no documentado, sin benchmarks |
| openai/whisper-small | 244M | 30 s | 99 idiomas | MIT | Modelo base, buen rendimiento general, peor en persa que un fine-tune dedicado |
| mozilla-foundation/common_voice_16_0 | - | - | Persa | CC0 | Dataset, no modelo; sirve para entrenar ASR propio |

No se dispone de comparativas con otros modelos ASR en persa (p. ej., Vosk, Kaldi) en la información proporcionada.

## Limitaciones y advertencias

- Sin métricas oficiales: no hay resultados de WER ni CER, por lo que la calidad real en persa es desconocida.
- Dataset de entrenamiento no especificado: aunque el nombre sugiere CommonVoice, no se confirma el corpus exacto ni su tamaño, lo que dificulta evaluar la generalización.
- Posible degradación en idiomas distintos al persa: el ajuste fino puede reducir la capacidad multilingüe del modelo base.
- Alucinaciones en transcripciones: como cualquier modelo ASR, puede generar texto inventado en segmentos de audio ambiguos o con ruido.
- Licencia Apache-2.0 permite uso comercial, pero el modelo base es MIT, por lo que no hay restricciones adicionales.
- Modelo generado automáticamente: la model card es incompleta y no incluye información sobre sesgos, evaluación o limitaciones específicas.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/Kiyan122/whisper-small-fa-commonvoice)
- [Modelo base openai/whisper-small](https://huggingface.co/openai/whisper-small)
