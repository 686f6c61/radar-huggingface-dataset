# Raoul12/wispher_small_kh

## Resumen

El modelo `Raoul12/wispher_small_kh` es un ajuste fino (fine-tune) de `openai/whisper-small` especializado en el reconocimiento automático del habla (ASR) en idioma jemer (khmer). Ha sido desarrollado por el usuario Raoul12 y publicado en HuggingFace con licencia Apache 2.0. El modelo se entrenó sobre el dataset `seanghay/khmer_mpwt_speech`, un corpus de habla jemer, y está diseñado para transcribir audio en este idioma, que cuenta con poca representación en los modelos ASR multilingües generales.

Con 241,7 millones de parámetros, hereda la arquitectura encoder-decoder de Whisper Small, optimizada para tareas de transcripción. Su relevancia radica en ofrecer una alternativa específica para jemer, un idioma con escasos recursos en el ecosistema de ASR, aunque su rendimiento declarado (WER del 58,3 %) indica que aún tiene margen de mejora. El modelo se distribuye en formato safetensors y es compatible con la librería Transformers.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Whisper (encoder-decoder transformer) |
| Parametros totales | 241.734.912 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de Whisper Small, típicamente 30 segundos de audio) |
| Tipos de cuantizacion | no disponible (solo safetensors en el repo) |
| Idiomas soportados | kh (jemer) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tune de `openai/whisper-small`, que emplea una arquitectura transformer encoder-decoder con atención multi-cabeza y normalización de capa. Whisper Small procesa audio muestreado a 16 kHz y lo convierte en una secuencia de tokens de texto mediante un tokenizer de byte-pair encoding. El ajuste fino se realizó sobre el dataset `seanghay/khmer_mpwt_speech`, aunque no se especifica el número total de tokens de entrenamiento ni la composición exacta del corpus.

El entrenamiento utilizó los siguientes hiperparámetros: tasa de aprendizaje de 1e-5, tamaño de lote de 8, optimizador AdamW (variante torch fused), programador de tasa de aprendizaje lineal con 50 pasos de calentamiento, y 1000 pasos de entrenamiento en total. Se empleó precisión mixta nativa (AMP). No se menciona el uso de técnicas como RLHF o DPO; el proceso se limitó a un ajuste supervisado estándar. La pérdida de validación final fue de 0,3627 y el WER de 58,2979.

## Capacidades

- Reconocimiento automático del habla (ASR) en idioma jemer (kh), transcribiendo audio a texto.
- Procesamiento de audio de entrada y generación de transcripciones textuales.
- Compatible con el pipeline `automatic-speech-recognition` de Transformers.
- Al ser un fine-tune de Whisper Small, hereda la capacidad de manejar audio de hasta 30 segundos por segmento (no confirmado en la documentación).
- No se documentan capacidades adicionales como traducción, diarización de hablantes o soporte multilingüe más allá del jemer.

## Casos de uso

- Transcripción de reuniones y entrevistas en jemer: el modelo puede convertir grabaciones de audio en texto para su posterior análisis o archivado, aunque su WER elevado sugiere que se requiere revisión humana.
- Generación de subtítulos para vídeos en jemer: integrable en pipelines de procesamiento de vídeo para crear subtítulos automáticos, útil para plataformas de contenido local.
- Asistentes de voz en aplicaciones móviles: permite la entrada por voz en apps dirigidas a hablantes de jemer, siempre que se acepte una tasa de error considerable.
- Análisis de llamadas de atención al cliente: transcripción de conversaciones telefónicas en jemer para extraer métricas de calidad o detectar problemas recurrentes.
- Documentación de archivos históricos orales: digitalización de grabaciones en jemer para preservar contenido cultural o histórico.
- Investigación lingüística: herramienta para estudios de fonética o sociolingüística que requieran corpus transcritos en jemer, aunque la precisión limitada obliga a una corrección manual posterior.

## Benchmarks y rendimiento

El autor declara los siguientes resultados en el conjunto de test del dataset `seanghay/khmer_mpwt_speech`:

| Metrica | Valor |
|---|---|
| WER (Word Error Rate) | 58,2979 |
| Loss (validación) | 0,3627 |

No se proporcionan comparaciones con otros modelos ni resultados en benchmarks estándar como MMLU o HumanEval, dado que se trata de un modelo ASR especializado. El WER del 58,3 % es alto, lo que indica que la transcripción en jemer presenta dificultades significativas, posiblemente por la naturaleza del idioma o la calidad del dataset.

## Requisitos de hardware

- No se dispone de información específica sobre requisitos de VRAM o GPU en la documentación del modelo.
- Al tratarse de un fine-tune de Whisper Small (244M parámetros), los requisitos de inferencia son similares a los de ese modelo base, pero no se confirman datos concretos.
- El modelo se puede cargar con la librería Transformers en PyTorch; no se mencionan otras opciones de despliegue como vLLM, llama.cpp u Ollama.
- Para inferencia en CPU, el rendimiento sería lento; se recomienda una GPU con al menos 4 GB de VRAM para una ejecución fluida, aunque este dato no está verificado en la documentación.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. El único punto de referencia es el modelo base `openai/whisper-small`, del cual deriva, pero no se ofrecen métricas comparativas entre ambos. Se recomienda consultar el estado del arte en ASR para jemer en fuentes externas.

## Limitaciones y advertencias

- El WER del 58,3 % es elevado, lo que implica que la transcripción contendrá numerosos errores y no es apta para uso sin supervisión humana en contextos críticos.
- La model card no documenta sesgos específicos, pero al entrenarse sobre un único dataset (`seanghay/khmer_mpwt_speech`), el modelo puede estar sesgado hacia las variedades dialectales o condiciones de grabación presentes en ese corpus.
- No se especifican limitaciones de contexto de audio; se asume la ventana de 30 segundos de Whisper Small, pero no está confirmado.
- La licencia Apache 2.0 permite uso comercial, pero no se garantiza la calidad del modelo para producción.
- El modelo fue generado automáticamente con `Trainer`, y la model card carece de detalles sobre el preprocesado de audio, la calidad del dataset o posibles alucinaciones en la transcripción.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/Raoul12/wispher_small_kh)
- [Dataset de entrenamiento: seanghay/khmer_mpwt_speech](https://huggingface.co/datasets/seanghay/khmer_mpwt_speech)
- [Modelo base: openai/whisper-small](https://huggingface.co/openai/whisper-small)
