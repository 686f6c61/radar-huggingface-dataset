# iljab/omniASR-CTC-1B-v2

## Resumen

omniASR-CTC-1B-v2 es un modelo de reconocimiento automático de voz (ASR) basado en la arquitectura Wav2Vec2 con decodificación CTC, desarrollado por Meta AI como parte de la familia Omnilingual ASR. Esta versión concreta es una conversión a HuggingFace del checkpoint oficial de Meta (`omniASR-CTC-1B-v2.pt`) realizada por el usuario iljab, que facilita su uso con la librería `transformers`. El modelo está diseñado para transcribir audio en más de 1.600 idiomas, incluyendo muchos que no tenían cobertura previa, mediante un enfoque de aprendizaje zero-shot y few-shot.

Con aproximadamente 975 millones de parámetros, 48 capas de encoder y una ventana de contexto de audio que no se especifica en la documentación disponible, este modelo ofrece una alternativa rápida y eficiente para tareas de transcripción multilingüe. Su licencia Apache-2.0 permite uso comercial sin restricciones, lo que lo hace atractivo para integraciones en producción. La relevancia actual radica en su capacidad para cubrir una amplia variedad de lenguas con un solo modelo, algo poco común en el ecosistema ASR.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Wav2Vec2ForCTC (Transformer encoder con capa CTC) |
| Parametros totales | 975.676.336 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (depende del audio de entrada, sin límite documentado) |
| Tipos de cuantizacion | safetensors (original); GGUF (conversión de terceros, no oficial) |
| Idiomas soportados | más de 1.600 idiomas (según la familia Omnilingual ASR); lista específica no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (también disponible GGUF de terceros) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Wav2Vec2, un encoder Transformer con capa de clasificación CTC (Connectionist Temporal Classification) en la parte superior. Según la model card, tiene 48 capas de encoder, un tamaño oculto de 1280, 16 cabezas de atención y una dimensión intermedia de FFN de 5120. El vocabulario de salida es de 10.288 tokens, basado en un tokenizer SentencePiece (el archivo `omniASR_tokenizer_written_v2.model`). El token de blank de CTC es el id 0 (`<s>`).

No se dispone de información detallada sobre el proceso de entrenamiento (número de tokens, composición del dataset, uso de RLHF o DPO) en la documentación proporcionada. Sin embargo, la familia Omnilingual ASR de Meta se caracteriza por un enfoque de aprendizaje zero-shot y few-shot, que permite añadir nuevos idiomas con solo unos pocos ejemplos emparejados. El modelo se distribuye como checkpoint oficial de Meta y ha sido convertido al formato HuggingFace para su uso directo con `transformers`.

## Capacidades

- Transcripción de voz a texto en más de 1.600 idiomas, incluyendo lenguas de bajos recursos.
- Decodificación CTC rápida, adecuada para aplicaciones de tiempo real o casi tiempo real.
- Soporte multilingüe nativo: un solo modelo cubre una amplia variedad de lenguas sin necesidad de modelos separados.
- Integración sencilla con la librería `transformers` mediante `Wav2Vec2ForCTC` y `AutoProcessor`.
- No incluye capacidades de tool calling, agentes, razonamiento multi-paso ni generación de texto libre; es exclusivamente un modelo de reconocimiento de voz.

## Casos de uso

- Transcripción automática de reuniones y conferencias: el modelo puede procesar audio de alta duración (si se segmenta adecuadamente) y transcribir en múltiples idiomas, útil para equipos internacionales.
- Subtitulado automático de vídeos: integrable en pipelines de postproducción para generar subtítulos en varios idiomas a partir de pistas de audio.
- Asistentes de voz multilingües: puede servir como backend de ASR en asistentes que necesiten entender comandos en diferentes lenguas, con baja latencia gracias a la decodificación CTC.
- Accesibilidad para personas con discapacidad auditiva: conversión de contenido hablado a texto en tiempo real, especialmente valioso en idiomas minoritarios.
- Análisis de llamadas de atención al cliente: transcripción de grabaciones para búsqueda de información, análisis de sentimiento o cumplimiento normativo, con cobertura multilingüe.
- Investigación lingüística: documentación y preservación de lenguas en peligro de extinción, ya que el modelo puede transcribir idiomas con pocos recursos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de métricas como WER (Word Error Rate) o CER (Character Error Rate) para este modelo específico en la documentación consultada.

## Requisitos de hardware

- VRAM estimada para inferencia: con ~975M parámetros, en FP32 el modelo ocupa aproximadamente 3,9 GB (tamaño del repo). En FP16 ocuparía ~2 GB, y en int8 ~1 GB. Se recomienda al menos 4 GB de VRAM para FP16 y 2 GB para int8.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM, como NVIDIA GTX 1650, RTX 3050, RTX 4060, o GPUs de datacenter como T4, V100, A10. Para procesamiento por lotes o audio largo, se recomienda una GPU con más memoria (A100, H100).
- Sí cabe en GPUs de consumo: una RTX 3060 (12 GB) o superior puede ejecutar el modelo sin problemas, incluso en FP32.
- Opciones de despliegue: se puede usar directamente con `transformers` en Python. Para producción, se puede servir con HuggingFace Inference Endpoints, o exportar a ONNX para optimización. También existe una conversión GGUF de terceros que permite ejecutarlo con llama.cpp u Ollama, aunque no es oficial.
- Latencia y throughput: no se dispone de datos medidos. Al ser un modelo CTC, la inferencia es más rápida que los modelos autoregresivos, pero depende del hardware y la longitud del audio.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| omniASR-CTC-1B-v2 | ~975M | >1.600 | Apache-2.0 | safetensors, GGUF (terceros) | Wav2Vec2 CTC, conversión de Meta |
| Whisper large-v3 | ~1.5B | ~100 | MIT | safetensors, GGUF | Modelo encoder-decoder, más lento pero con mayor precisión en idiomas comunes |
| MMS-1B (Meta) | ~1B | >1.100 | CC-BY-NC 4.0 | safetensors | Modelo hermano de la familia MMS, pero con licencia no comercial |

La comparativa se basa en características generales; no se dispone de benchmarks comparativos directos. Whisper es más conocido y tiene mejor soporte de herramientas, pero omniASR cubre muchos más idiomas. MMS-1B tiene una licencia más restrictiva.

## Limitaciones y advertencias

- Sesgos conocidos: al ser entrenado con datos multilingües, puede tener un rendimiento desigual entre idiomas, con peores resultados en lenguas con menos datos de entrenamiento.
- Riesgo de alucinación: como todo modelo ASR, puede producir transcripciones incorrectas o inventar palabras, especialmente en audio con ruido o acentos poco representados.
- Limitaciones de contexto: no se especifica la duración máxima de audio que puede procesar de una sola vez; puede requerir segmentación para audios largos.
- Limitaciones de idioma: aunque soporta más de 1.600 idiomas, la calidad varía significativamente; algunos idiomas pueden tener tasas de error altas.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero la conversión GGUF de terceros puede tener términos adicionales; se recomienda verificar la fuente.
- Caveat de producción: al ser una conversión no oficial, es recomendable validar el modelo en el dominio específico antes de desplegarlo en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/iljab/omniASR-CTC-1B-v2
- Checkpoint oficial de Meta: https://dl.fbaipublicfiles.com/mms/omniASR-CTC-1B-v2.pt
- Tokenizer oficial: https://dl.fbaipublicfiles.com/mms/omniASR_tokenizer_written_v2.model
- Repositorio GitHub de Omnilingual ASR: https://github.com/facebookresearch/omnilingual-asr
- Documentación de DeepWiki sobre modelos CTC: https://deepwiki.com/facebookresearch/omnilingual-asr/2.2.2-ctc-models-(fast-asr)
- Modelo original de Meta en HuggingFace: https://huggingface.co/facebook/omniASR-CTC-1B
- Conversión GGUF de terceros: https://free2aitools.com/model/cstr/omniasr-ctc-1b-v2-gguf
