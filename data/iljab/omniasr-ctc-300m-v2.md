# iljab/omniASR-CTC-300M-v2

## Resumen

omniASR-CTC-300M-v2 es un modelo de reconocimiento automático de voz (ASR) basado en la arquitectura wav2vec2 con cabezal CTC, desarrollado originalmente por Meta AI dentro del proyecto Omnilingual ASR. Esta versión concreta es una conversión a HuggingFace del checkpoint oficial de Meta (`omniASR-CTC-300M-v2.pt`) realizada por el usuario iljab, lo que permite cargarlo directamente con la librería `transformers` mediante la clase `Wav2Vec2ForCTC`.

El modelo pertenece a la familia Omnilingual ASR, diseñada para cubrir más de 1.600 idiomas, incluyendo cientos que nunca habían tenido soporte en sistemas ASR comerciales. Su enfoque combina aprendizaje zero-shot con una familia de modelos flexible, permitiendo añadir nuevos idiomas con solo unos pocos ejemplos pareados. Con 325,98 millones de parámetros y una arquitectura de encoder transformer de 24 capas, ofrece un equilibrio entre precisión y velocidad gracias a la decodificación CTC, que es más rápida que los modelos encoder-decoder.

La relevancia actual de este modelo radica en su amplia cobertura lingüística, su licencia Apache-2.0 que permite uso comercial sin restricciones, y su disponibilidad en formato HuggingFace, lo que facilita su integración en pipelines de ASR existentes. Es especialmente útil para aplicaciones que requieren transcripción en idiomas de bajos recursos donde otros modelos como Whisper tienen una cobertura limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Wav2Vec2ForCTC (encoder transformer con cabezal CTC) |
| Parametros totales | 325.983.920 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 5 segundos de audio por segmento (límite del positional encoding) |
| Tipos de cuantizacion | no disponible (existe una conversión GGUF externa, pero no se especifican tipos) |
| Idiomas soportados | Más de 1.600 idiomas (según el proyecto Omnilingual ASR) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (también disponible GGUF en conversión externa) |

## Arquitectura y entrenamiento

El modelo utiliza una arquitectura wav2vec2 estándar: un encoder transformer con 24 capas, tamaño oculto de 1024, 16 cabezas de atención y una capa intermedia FFN de 4096 unidades. El vocabulario de salida tiene 10.288 tokens, que corresponden a las unidades de subpalabra del tokenizer `omniASR_tokenizer_written_v2.model`. La cabeza de clasificación es CTC (Connectionist Temporal Classification), lo que permite una decodificación rápida y eficiente, adecuada para aplicaciones en tiempo real.

Los detalles específicos del entrenamiento (número de tokens, composición del dataset, uso de RLHF o DPO) no están disponibles en la información proporcionada. Sin embargo, el proyecto Omnilingual ASR de Meta se basa en un enfoque de aprendizaje zero-shot: el modelo se entrena en un conjunto de idiomas de alta disponibilidad y luego se adapta a idiomas de bajos recursos mediante ejemplos pareados limitados. La innovación principal reside en la capacidad de añadir nuevos idiomas sin necesidad de reentrenar el modelo completo, utilizando técnicas de adaptación rápida.

## Capacidades

- Reconocimiento de voz automático en más de 1.600 idiomas, incluyendo lenguas minoritarias y de bajos recursos.
- Transcripción de audio a texto con decodificación CTC, que ofrece baja latencia y es adecuada para streaming.
- Soporte para audio de hasta 5 segundos por segmento (límite del positional encoding); para audio más largo se requiere segmentación con VAD (detección de actividad de voz).
- Integración nativa con la librería `transformers` mediante la clase `Wav2Vec2ForCTC` y `AutoProcessor`.
- No soporta tool calling, agentes ni razonamiento multi-paso, ya que es un modelo puramente de ASR.
- Capacidades multilingües excepcionales, con cobertura de idiomas que no están presentes en otros sistemas ASR comerciales.

## Casos de uso

- Transcripción de contenido audiovisual en idiomas minoritarios: el modelo puede transcribir podcasts, vídeos o grabaciones en lenguas que carecen de subtítulos, gracias a su amplia cobertura lingüística. Se usaría cargando el modelo con `Wav2Vec2ForCTC` y procesando segmentos de audio de 5 segundos con VAD previo.
- Subtitulado automático para plataformas de vídeo: al ser un modelo CTC rápido, puede integrarse en pipelines de generación de subtítulos en tiempo real o por lotes, especialmente para idiomas de bajos recursos donde otros modelos fallan.
- Asistentes de voz multilingües: el modelo puede servir como backend de reconocimiento de voz en asistentes virtuales que necesiten entender comandos en múltiples idiomas, incluyendo dialectos regionales.
- Archivado y búsqueda de audio en bibliotecas digitales: permite indexar archivos de audio históricos o etnográficos transcribiéndolos a texto, facilitando la búsqueda y el análisis.
- Accesibilidad para personas con discapacidad auditiva: el modelo puede generar subtítulos en tiempo real para conversaciones o eventos en idiomas que no están cubiertos por soluciones comerciales.
- Procesamiento de llamadas en centros de atención al cliente: con la segmentación VAD adecuada, el modelo puede transcribir conversaciones telefónicas en múltiples idiomas para análisis posterior o cumplimiento normativo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo no incluye métricas como WER (Word Error Rate) o CER (Character Error Rate) en la documentación proporcionada. Se recomienda consultar el repositorio oficial de Omnilingual ASR para posibles evaluaciones comparativas.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,3 GB en FP32 (tamaño del repo), lo que cabe en cualquier GPU moderna con al menos 2 GB de VRAM. Con cuantización a int8 o float16, el consumo se reduce a unos 700-800 MB.
- GPU recomendadas: cualquier GPU con soporte CUDA, desde una NVIDIA GTX 1650 (4 GB) hasta A100 o H100 para procesamiento por lotes. También puede ejecutarse en CPU para inferencia no en tiempo real.
- Compatible con GPUs de consumo: sí, cabe en RTX 3060, RTX 4060, etc. Incluso en hardware de gama baja.
- Opciones de despliegue: al ser un modelo `transformers`, puede servirse con HuggingFace pipelines, TorchServe, ONNX Runtime o mediante la API de HuggingFace Inference Endpoints. Para despliegue en producción, se puede exportar a ONNX o TensorRT para optimizar la latencia.
- Latencia y throughput: no se han publicado datos específicos. Al ser un modelo CTC de 300M, la inferencia es significativamente más rápida que un modelo encoder-decoder del mismo tamaño, pero los valores exactos dependen del hardware y la optimización.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| omniASR-CTC-300M-v2 | 325M | 1.600+ | 5 s/segmento | Apache-2.0 | safetensors, GGUF |
| facebook/omniASR-CTC-300M | 325M | 1.600+ | 5 s/segmento | Apache-2.0 | PyTorch (fairseq2) |
| openai/whisper-small | 244M | ~100 | 30 s | MIT | safetensors, GGUF |
| facebook/mms-1b-all | 1B | 1.100+ | 30 s | CC-BY-NC 4.0 | PyTorch |

La comparativa se basa en características generales, ya que no se dispone de benchmarks comunes. Whisper-small tiene una cobertura de idiomas mucho menor pero soporta contexto de 30 segundos. MMS-1b-all cubre 1.100 idiomas pero tiene una licencia no comercial (CC-BY-NC). omniASR-CTC-300M-v2 destaca por su licencia permisiva y su cobertura superior, aunque con la limitación de segmentos de 5 segundos.

## Limitaciones y advertencias

- Limitación de contexto: el modelo solo procesa segmentos de audio de hasta 5 segundos debido al positional encoding. Para audio más largo es imprescindible usar un sistema de segmentación VAD, lo que puede introducir errores en los límites de los segmentos.
- Sesgos potenciales: al entrenarse con datos de idiomas de alta disponibilidad, el rendimiento puede ser inferior en idiomas de bajos recursos o con dialectos muy divergentes. No se han publicado evaluaciones de sesgo.
- Riesgo de alucinación: como todo modelo ASR, puede producir transcripciones incorrectas o inventar palabras en contextos de audio ruidoso o con acentos poco representados.
- Sin soporte para audio largo directo: a diferencia de Whisper, no puede procesar archivos de audio completos de una sola vez; requiere preprocesamiento.
- No se han publicado resultados de benchmarks oficiales, por lo que el rendimiento real en tareas específicas debe validarse antes de su uso en producción.
- La licencia Apache-2.0 permite uso comercial sin restricciones, pero el modelo se distribuye sin garantías.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/iljab/omniASR-CTC-300M-v2
- Checkpoint original de Meta: https://dl.fbaipublicfiles.com/mms/omniASR-CTC-300M-v2.pt
- Tokenizer original: https://dl.fbaipublicfiles.com/mms/omniASR_tokenizer_written_v2.model
- Repositorio oficial de Omnilingual ASR: https://github.com/facebookresearch/omnilingual-asr
- Documentación de modelos CTC en DeepWiki: https://deepwiki.com/facebookresearch/omnilingual-asr/2.2.2-ctc-models-(fast-asr)
- Modelo original de Facebook en HuggingFace: https://huggingface.co/facebook/omniASR-CTC-300M
- Conversión GGUF para CrispASR: https://github.com/linmi/remoasr/blob/main/hf_readmes/omniASR-CTC-300M-v2-GGUF.md
