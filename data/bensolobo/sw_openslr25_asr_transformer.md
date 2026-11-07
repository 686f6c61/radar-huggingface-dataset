# Bensolobo/sw_openslr25_asr_transformer

## Resumen

`Bensolobo/sw_openslr25_asr_transformer` es un modelo de reconocimiento automático del habla (ASR) para suajili, entrenado con el framework ESPnet2 sobre el corpus `sw_openslr25` (OpenSLR 25). Lo firma Guillaume Atencia y lo publica el usuario Bensolobo en Hugging Face. No es un modelo de lenguaje generativo, sino un sistema ASR acústico-a-texto de tipo transformer con tokenización BPE de 300 unidades, pensado para transcribir audio en suajili.

El modelo se enmarca en la familia de recetas ESPnet2 para ASR y sigue el flujo estándar de entrenamiento de la herramienta: extracción de características, tokenizador BPE a nivel de subpalabra y un encoder-decoder transformer entrenado con Adam, warmup de 2500 pasos y hasta 80 épocas con early stopping. Su relevancia es acotada: cubre una lengua de bajos recursos (suajili) con una licencia permisiva (CC-BY-4.0) y ofrece resultados publicados en el conjunto de test de OpenSLR 25.

El rendimiento es modesto: 31,5 % de WER y 10,8 % de CER en `sw_test`, con una tasa de error de frase (S.Err) del 86,4 %, lo que indica que la mayoría de las frases contienen al menos un error. Es un modelo de investigación o de línea base, no un sistema listo para producción de alta precisión.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (ESPnet2 ASR) con tokenizacion BPE de 300 unidades |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (procesa segmentos de audio; `chunk_length: 500` en configuracion) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Suajili (`sw`) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | Pesos ESPnet2 (checkpoint nativo de ESPnet, no safetensors ni GGUF) |

## Arquitectura y entrenamiento

El modelo es un sistema ASR de ESPnet2 con arquitectura transformer encoder-decoder. La entrada son características acústicas extraídas del audio (`speech`, tipo `sound`) y la salida es texto tokenizado con un vocabulario BPE de 300 unidades (`bpe300_sp`), con token `<blank>` para CTC y tokens de subpalabra con prefijo `▁`. El entrenamiento usa `batch_type: numel` con `batch_bins: 4000000`, `accum_grad: 1`, optimizador Adam con `lr: 0.002`, scheduler `warmuplr` con 2500 pasos de calentamiento, `grad_clip: 5`, hasta 80 épocas y early stopping con paciencia de 15, seleccionando el mejor modelo por accuracy de validación (`best_model_criterion: valid/acc/max`) y promediando los 10 mejores checkpoints (`keep_nbest_models: 10`).

Los datos de entrenamiento provienen del corpus `sw_openslr25` (OpenSLR 25), con `sw_train_sp` para entrenamiento y `sw_dev` para validación. No se especifica en la información disponible el número de horas de audio, la composición exacta del dataset ni si hubo aumentación de datos o técnicas de regularización adicionales. Tampoco se documenta el uso de RLHF, DPO ni decodificación especulativa; el pipeline es el estándar de ESPnet2 para ASR. La configuración usa `train_dtype: float32`, `use_amp: false` y `cudnn_deterministic: true`, lo que sugiere un entrenamiento en una sola GPU (`ngpu: 1`).

## Capacidades

- Transcripción de voz a texto en suajili (`automatic-speech-recognition`).
- Reconocimiento a nivel de subpalabra mediante tokenizador BPE de 300 unidades, lo que ayuda con palabras poco frecuentes y morfología aglutinante del suajili.
- Decodificación con CTC (token `<blank>` presente en el vocabulario) y salida con puntuación de subpalabras estilo SentencePiece.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un modelo puramente ASR.
- No tiene capacidades multimodales más allá del audio de entrada; no procesa visión ni texto como modelo generativo.
- No se documentan capacidades de diarización, detección de idioma ni traducción.

## Casos de uso

- Transcripción de reuniones y entrevistas en suajili: el modelo convierte audio en texto para actas o subtítulos, adecuado para contenidos internos donde un WER del 31,5 % es tolerable y se revisa manualmente.
- Subtitulado automático de vídeo en suajili: se puede usar como primer paso de un pipeline de subtítulos, con corrección posterior por un revisor humano, dado el S.Err del 86,4 %.
- Generación de corpus textual a partir de archivos de audio en suajili: útil para proyectos de investigación lingüística o para aumentar datos de entrenamiento de otros modelos, aceptando la tasa de error y filtrando por confianza.
- Búsqueda por voz en aplicaciones locales: integrado en un front-end que transcriba consultas cortas en suajili y las enrute a un motor de búsqueda, con umbral de confianza para descartar transcripciones dudosas.
- Accesibilidad para hablantes de suajili: dictado de notas o documentos en aplicaciones de escritorio, con revisión humana obligatoria por la tasa de error.
- Línea base para investigación en ASR de bajos recursos: sirve como referencia reproducible para comparar nuevas técnicas sobre `sw_openslr25`, dado que la receta y la configuración están documentadas.
- Prototipado de asistentes de voz en suajili: como componente ASR en un pipeline mayor (ASR + LLM + TTS), siempre con un paso de validación y corrección.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre el conjunto de test `sw_test` (1991 frases, 17700 palabras) con decodificación `decode_asr_asr_model_valid.acc.ave`:

| Metrica | Corr | Sub | Del | Ins | Err | S.Err |
|---|---|---|---|---|---|---|
| WER | 71,2 | 23,2 | 5,6 | 2,7 | 31,5 | 86,4 |
| CER | 91,4 | 3,3 | 5,3 | 2,2 | 10,8 | 86,4 |
| TER | 80,9 | 10,9 | 8,2 | 2,4 | 21,5 | 86,4 |

Resultados en el conjunto de desarrollo `org/sw_dev` (634 frases, 5877 palabras):

| Metrica | Corr | Sub | Del | Ins | Err | S.Err |
|---|---|---|---|---|---|---|
| WER | 76,2 | 19,4 | 4,5 | 3,8 | 27,7 | 82,2 |
| CER | 93,2 | 2,5 | 4,3 | 3,0 | 9,8 | 82,2 |
| TER | 84,2 | 8,7 | 7,1 | 3,0 | 18,8 | 82,2 |

No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (el número de parámetros no se documenta; un transformer ASR de ESPnet2 de este tipo suele caber en GPUs de gama media, pero no hay dato confirmado).
- GPU recomendadas: no disponible. El entrenamiento se hizo con `ngpu: 1` y `train_dtype: float32`, sin AMP, lo que sugiere que una sola GPU fue suficiente.
- ¿Cabe en GPU de consumo? No confirmado; por el tamaño típico de estos modelos es probable, pero no hay dato en la información proporcionada.
- Opciones de despliegue: ESPnet2 (flujo nativo con `run.sh --download_model`), y potencialmente exportación a otros runtimes, aunque no se documenta. No hay soporte declarado para vLLM, llama.cpp, Ollama ni TGI (no son aplicables a un modelo ASR de ESPnet).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de otros modelos ASR para suajili en la información proporcionada, por lo que la comparativa no está disponible.

| Modelo | Parametros | Contexto | WER (sw_test) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Bensolobo/sw_openslr25_asr_transformer | no disponible | no disponible | 31,5 | CC-BY-4.0 | Hugging Face (ESPnet2) |
| Alternativas | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Rendimiento limitado: WER del 31,5 % y S.Err del 86,4 % en test indican que la mayoría de frases contienen errores; no es apto para producción sin revisión humana.
- Sesgos: al entrenarse solo con `sw_openslr25`, puede tener sesgos de dominio, género, acento y registro presentes en ese corpus; no se documentan análisis de sesgo.
- Riesgo de alucinación y errores de sustitución: como todo ASR, puede generar palabras plausibles pero incorrectas, especialmente en audio ruidoso o con acentos no representados.
- Limitación de idioma: solo suajili (`sw`); no soporta otros idiomas ni code-switching documentado.
- Limitaciones de contexto: no se documenta la longitud máxima de audio procesable; la configuración usa `chunk_length: 500`, lo que puede afectar a audios largos.
- Licencia CC-BY-4.0: permite uso comercial con atribución, pero conviene revisar las condiciones del corpus `sw_openslr25` subyacente.
- Repositorio con 0 descargas y 0 likes: sin validación comunitaria; el tamaño del repo es 0.0 GB, lo que puede indicar que los pesos no están subidos o que la información está incompleta.
- Fecha de creación futura (2026-11-07) en los metadatos: posible inconsistencia que conviene verificar antes de confiar en el artefacto.
- Sin soporte declarado para cuantización ni para runtimes de inferencia distintos de ESPnet2.

## Enlaces

- Hugging Face: https://huggingface.co/Bensolobo/sw_openslr25_asr_transformer
- ESPnet (repositorio): https://github.com/espnet/espnet/
- Instrucciones de instalación de ESPnet: https://espnet.github.io/espnet/installation.html
- Paper de referencia citado en los tags (arXiv:1804.00015): https://arxiv.org/abs/1804.00015
- Corpus OpenSLR 25: https://www.openslr.org/25/
- Documentación de Transformers en Hugging Face: https://huggingface.co/docs/transformers/index
