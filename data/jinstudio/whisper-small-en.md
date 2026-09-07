# Jinstudio/whisper-small.en

## Resumen

Jinstudio/whisper-small.en es una re-subida del checkpoint whisper-small.en de OpenAI, un modelo de reconocimiento automático de voz (ASR) basado en la arquitectura Transformer encoder-decoder. Desarrollado originalmente por OpenAI y publicado en el Hub de Hugging Face por el usuario Jinstudio, este modelo está entrenado para transcribir audio en inglés. Con 241.734.144 parámetros, es la variante "small" de la familia Whisper, que fue entrenada con 680.000 horas de audio etiquetado mediante supervisión débil a gran escala. Su relevancia radica en que ofrece transcripciones robustas en inglés sin necesidad de ajuste fino, lo que lo hace adecuado para aplicaciones de ASR en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (sequence-to-sequence) |
| Parámetros totales | 241.734.144 |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Inglés (solo) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (también PyTorch, TensorFlow y JAX según etiquetas) |

## Arquitectura y entrenamiento

Whisper es un modelo Transformer encoder-decoder, también denominado sequence-to-sequence. Fue entrenado sobre 680.000 horas de audio etiquetado mediante supervisión débil a gran escala. Los checkpoints de Whisper se entrenan en datos solo en inglés o multilingües; este checkpoint es de solo inglés y se entrenó específicamente para la tarea de reconocimiento de voz, prediciendo transcripciones en el mismo idioma del audio. No se mencionan técnicas de RLHF, DPO ni otras innovaciones destacables en la información disponible.

## Capacidades

- Reconocimiento automático de voz en inglés: transcribe audio a texto en el mismo idioma.
- Generalización sin fine-tuning: entrenado con 680.000 horas de audio, demuestra capacidad de adaptarse a múltiples datasets y dominios sin ajuste adicional.
- Integración con la librería Transformers de Hugging Face mediante WhisperProcessor y WhisperForConditionalGeneration.
- No soporta traducción ni otros idiomas; es un modelo de solo inglés.
- No se documentan capacidades de tool calling, agentes, visión, audio multimodal ni razonamiento de múltiples pasos en la información disponible.

## Casos de uso

- Transcripción de reuniones en inglés: el modelo puede transcribir audio de reuniones con acentos y ruido de fondo, generando texto listo para análisis posterior.
- Subtitulado automático de vídeos: adecuado para generar subtítulos en inglés para contenido multimedia, aprovechando su robustez frente a diferentes dominios.
- Accesibilidad para personas con discapacidad auditiva: integración en aplicaciones de transcripción en tiempo real para ofrecer subtítulos en inglés.
- Análisis de llamadas de atención al cliente: transcripción de conversaciones telefónicas en inglés para su posterior análisis de sentimiento o extracción de información.
- Documentación de audio en investigación: transcribir entrevistas, grabaciones de campo o datos de voz en inglés para su análisis cualitativo.
- Automatización de flujos de trabajo de medios: integración en pipelines de procesamiento de audio para generar transcripciones de archivos de audio en inglés antes de su indexación o búsqueda.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El model-index del repositorio declara evaluaciones en LibriSpeech (clean y other) para la tarea de reconocimiento automático de voz, pero los valores de WER aparecen como null, por lo que no se pueden presentar resultados numéricos.

## Requisitos de hardware

- VRAM estimada para inferencia: no se proporcionan requisitos oficiales. Con 241,7 millones de parámetros, una estimación orientativa es del orden de 1 GB en FP32, 0,5 GB en FP16 y 0,25 GB en INT8. La VRAM real depende de la implementación y del tamaño del lote.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente para la inferencia de este modelo (por ejemplo, NVIDIA GTX 1650, RTX 3050, etc.). También puede ejecutarse en CPU con un rendimiento aceptable para clips cortos.
- ¿Cabe en GPU de consumo? Sí, es un modelo pequeño que cabe en la mayoría de GPUs de consumo.
- Opciones de despliegue: Transformers de Hugging Face, whisper.cpp, y otras implementaciones compatibles con el formato de pesos.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Jinstudio/whisper-small.en | 241.734.144 | No disponible | Apache-2.0 | Hugging Face |
| openai/whisper-small.en | 244 M | No disponible | Apache-2.0 | Hugging Face |
| openai/whisper-base.en | 74 M | No disponible | Apache-2.0 | Hugging Face |
| openai/whisper-medium.en | 769 M | No disponible | Apache-2.0 | Hugging Face |

Nota: Jinstudio/whisper-small.en es una re-subida del checkpoint openai/whisper-small.en, por lo que sus pesos y capacidades son equivalentes.

## Limitaciones y advertencias

- Modelo exclusivo para inglés: no soporta reconocimiento de voz en otros idiomas ni traducción.
- Sesgos conocidos: no se documentan sesgos específicos en la información disponible.
- Riesgo de alucinación: no documentado en la información disponible; se recomienda validar las transcripciones en producción.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero requiere mantener el aviso de licencia y atribución.
- No se proporcionan datos de rendimiento en benchmarks, por lo que se debe evaluar el modelo en el dominio de uso antes de producción.

## Enlaces

- Hugging Face: https://huggingface.co/Jinstudio/whisper-small.en
- Modelo original: https://huggingface.co/openai/whisper-small.en
- Paper: https://arxiv.org/abs/2212.04356
- Repositorio de OpenAI: https://github.com/openai/whisper
