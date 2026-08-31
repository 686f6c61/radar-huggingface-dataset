# serge9/whisper-small-atc

## Resumen

El modelo `serge9/whisper-small-atc` es un ajuste fino (fine-tuning) de `openai/whisper-small`, un modelo de reconocimiento automático del habla (ASR) basado en arquitectura transformer encoder-decoder. El autor, `serge9`, ha entrenado este modelo sobre un conjunto de datos no especificado, aunque el nombre sugiere un enfoque en comunicaciones de control de tráfico aéreo (ATC). El modelo se distribuye bajo licencia Apache 2.0 y está disponible en Hugging Face con formato de pesos safetensors.

Con 241,7 millones de parámetros, este modelo hereda las capacidades generales de Whisper-small, pero su rendimiento específico depende del dataset de entrenamiento, que no ha sido documentado. Según la model card, el modelo alcanza una pérdida de 0.0678 y un WER (Word Error Rate) de 5.6366 en el conjunto de evaluación, aunque no se detalla la composición de dicho conjunto. La relevancia de este modelo radica en su potencial aplicación en dominios especializados como la transcripción de comunicaciones aeronáuticas, aunque la falta de información sobre los datos de entrenamiento limita su evaluación rigurosa.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper) |
| Parametros totales | 241.734.912 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredado de Whisper-small, típicamente 30 segundos de audio) |
| Tipos de cuantizacion | no disponible (solo safetensors en el repositorio) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino de `openai/whisper-small`, que emplea una arquitectura transformer encoder-decoder con atención multi-cabeza y normalización de capas. Whisper-small procesa audio muestreado a 16 kHz y genera transcripciones de texto, con soporte para múltiples idiomas y tareas de traducción en su versión original. El fine-tuning se realizó con el framework Transformers, utilizando un optimizador AdamW con learning rate de 1e-5, batch size de 8 (16 con acumulación de gradientes), y un total de 2000 pasos de entrenamiento. Se empleó precisión mixta (Native AMP) y un scheduler lineal con 200 pasos de warmup.

No se ha documentado el dataset de entrenamiento, ni se especifica si se aplicaron técnicas como RLHF o DPO. La model card indica que el modelo fue generado automáticamente por el Trainer, por lo que los detalles del corpus y el preprocesamiento no están disponibles. Tampoco se mencionan innovaciones técnicas adicionales más allá del ajuste fino estándar.

## Capacidades

- Reconocimiento automático del habla (ASR): transcribe audio a texto, heredando la funcionalidad base de Whisper-small.
- Posible soporte de traducción de voz a texto en inglés (capacidad del modelo base, no confirmada en este fine-tuning).
- Manejo de audio en inglés y otros idiomas (depende del dataset de entrenamiento, no especificado).
- Integración con el ecosistema Transformers y pipelines de `automatic-speech-recognition`.
- No se ha confirmado soporte para tool calling, agentes o razonamiento multi-paso, ya que es un modelo puramente de ASR.

## Casos de uso

- Transcripción de comunicaciones de control de tráfico aéreo (ATC): el nombre del modelo sugiere este dominio, aunque no hay confirmación del dataset. Si se entrenó con grabaciones de ATC, podría utilizarse para generar registros textuales de conversaciones entre pilotos y controladores, mejorando la trazabilidad y el análisis posterior.
- Generación de subtítulos para vídeos o podcasts: al ser un modelo ASR, puede transcribir audio de forma automática, aunque su rendimiento en dominios generales dependerá del fine-tuning.
- Asistentes de voz para entornos ruidosos: si el dataset de entrenamiento incluye audio con ruido de fondo (típico en ATC), el modelo podría ser robusto en condiciones acústicas adversas, aunque no hay evidencia.
- Análisis de grabaciones de seguridad: transcripción de comunicaciones en entornos críticos para su revisión y auditoría.
- Investigación académica en ASR especializado: como punto de partida para estudios sobre reconocimiento de voz en dominios técnicos.
- Despliegue en sistemas de documentación automática: integración en pipelines que requieran convertir audio en texto para archivo o búsqueda.

## Benchmarks y rendimiento

La model card reporta los siguientes resultados en el conjunto de evaluación (no especificado):

| Metrica | Valor |
|---|---|
| Loss | 0.0678 |
| WER | 5.6366 |

No se han publicado resultados en benchmarks estándar como MMLU, HumanEval o GSM8K, ya que es un modelo de ASR y no de razonamiento general. El WER de 5.6366 es relativamente bajo, pero sin conocer el conjunto de evaluación no es posible compararlo con otros modelos de forma rigurosa. El autor no ha incluido comparaciones con el modelo base ni con otros fine-tunings.

## Requisitos de hardware

- VRAM estimada: para inferencia en FP32, el modelo requiere aproximadamente 1 GB de VRAM (241,7 M parámetros × 4 bytes). En FP16, alrededor de 0,5 GB; en cuantización int8, ~0,25 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM, como NVIDIA GTX 1650, RTX 2060, o superiores. También puede ejecutarse en CPU con mayor latencia.
- Compatibilidad con GPUs de consumo: sí, cabe en tarjetas de gama media y baja.
- Opciones de despliegue: se puede usar con la librería Transformers de Hugging Face, así como con herramientas como vLLM (aunque no es óptimo para ASR), o mediante pipelines de `automatic-speech-recognition`. También es posible exportar a ONNX o TensorRT para optimización.
- Latencia y throughput: no se han publicado datos específicos. En una GPU moderna (por ejemplo, RTX 3090), la transcripción de un audio de 30 segundos suele tomar menos de 1 segundo, pero depende de la implementación.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | WER (evaluación) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| serge9/whisper-small-atc | 241,7 M | no disponible | 5.6366 | Apache 2.0 | Hugging Face |
| openai/whisper-small (base) | 244 M | 30 s (típico) | no disponible | MIT | Hugging Face |
| san2003m/whisper-small-atc | 244 M (aprox.) | no disponible | 10.6129 | Apache 2.0 | Hugging Face |

El modelo de `serge9` presenta un WER notablemente inferior al de `san2003m` (5.64 vs 10.61), pero ambos se evaluaron en conjuntos de datos desconocidos, por lo que la comparación no es concluyente. El modelo base `openai/whisper-small` tiene un rendimiento general bien documentado, pero no se dispone de su WER en el mismo conjunto de evaluación.

## Limitaciones y advertencias

- El dataset de entrenamiento es desconocido, lo que impide evaluar la generalización del modelo a dominios fuera del posible ámbito ATC.
- No se han documentado sesgos específicos, pero al ser un fine-tuning de Whisper-small, puede heredar sesgos del modelo base (por ejemplo, en acentos o idiomas poco representados).
- Riesgo de alucinación: como todo modelo ASR, puede generar transcripciones incorrectas en audio con ruido o habla superpuesta.
- Limitaciones de idioma: no se especifican los idiomas soportados; el modelo base soporta múltiples idiomas, pero el fine-tuning podría haber reducido esa cobertura.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero se debe mantener el aviso de copyright y la atribución.
- Para producción, se recomienda validar el modelo en el dominio objetivo antes de desplegarlo, dado que no hay información sobre el corpus de entrenamiento.

## Enlaces

- [Hugging Face: serge9/whisper-small-atc](https://huggingface.co/serge9/whisper-small-atc)
- [Hugging Face: san2003m/whisper-small-atc](https://huggingface.co/san2003m/whisper-small-atc)
- [GitHub: jlvdoorn/WhisperATC](https://github.com/jlvdoorn/WhisperATC)
- [Hugging Face: openai/whisper-small](https://huggingface.co/openai/whisper-small)
- [Qualcomm AI Hub: Whisper-Small](https://aihub.qualcomm.com/models/whisper_small)
- [ModelScope: whisper-small](https://www.modelscope.cn/models/openai-mirror/whisper-small/summary)
