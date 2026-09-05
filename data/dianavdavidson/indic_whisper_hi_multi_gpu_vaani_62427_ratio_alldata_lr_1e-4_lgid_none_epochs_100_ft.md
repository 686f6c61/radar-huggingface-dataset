# dianavdavidson/indic_whisper_hi_multi_gpu_vaani_62427_ratio_alldata_lr_1e-4_lgid_None_epochs_100_FT

## Resumen

El modelo `indic_whisper_hi_multi_gpu_vaani_62427_ratio_alldata_lr_1e-4_lgid_None_epochs_100_FT` es un modelo de reconocimiento automático de voz (ASR) basado en la arquitectura Whisper, desarrollado por el usuario `dianavdavidson`. Se trata de un ajuste fino (fine-tuning) sobre el modelo base `parthiv11/indic_whisper_hi_multi_gpu`, que a su vez es una variante del proyecto IndicWhisper de AI4Bharat, especializado en lenguas indias. El modelo está orientado a la transcripción de audio en hindi, como sugiere el prefijo `hi` en el identificador.

La arquitectura subyacente es un Transformer encoder-decoder de Whisper, con aproximadamente 763,8 millones de parámetros, lo que corresponde a la variante medium de Whisper. La ventana de contexto de audio típica de Whisper es de 30 segundos. El modelo fue entrenado durante 100 épocas con una tasa de aprendizaje de 1e-4, utilizando un dataset no especificado, aunque el nombre del modelo apunta al dataset Vaani. Los resultados de validación reportados en la model card indican una pérdida de 0,5097 y un WER global del 15,0052 tras 3 épocas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Whisper (Transformer encoder-decoder) |
| Parametros totales | 763.857.920 (aproximadamente 764M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 30 segundos de audio (ventana estandar de Whisper) |
| Tipos de cuantizacion | no disponible (solo safetensors) |
| Idiomas soportados | no disponible explicitamente; el nombre indica hindi (hi) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un Whisper afinado, un transformer encoder-decoder diseñado originalmente para ASR multilingüe. El encoder procesa el audio muestreado a 16 kHz en fragmentos de 30 segundos, y el decoder genera texto tokenizado. El modelo base `parthiv11/indic_whisper_hi_multi_gpu` corresponde a una variante de IndicWhisper, por lo que el fine-tuning refuerza el rendimiento en hindi.

Los datos de entrenamiento no están documentados en la model card; se indica únicamente que se usó un dataset desconocido. El nombre del modelo sugiere la utilización del dataset Vaani, aunque esto no está confirmado. Los hiperparámetros de entrenamiento registrados son: tasa de aprendizaje de 1e-4, batch de entrenamiento de 16, acumulación de gradientes de 2, optimizador AdamW (fused), scheduler `constant_with_warmup` con 500 pasos de warmup y 100 épocas. El entrenamiento se realizó con múltiples GPUs, según el nombre del modelo. No se describen innovaciones técnicas destacables más allá del ajuste fino estándar.

## Capacidades

- Transcribir audio en hindi a texto, con un WER global reportado del 15,0052 en el conjunto de validación.
- Reconocimiento de voz en español? No, centrado en hindi. El modelo es especializado en hindi, pero al ser una variante de Whisper podría retener capacidades multilingües parciales.
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso.
- No tiene capacidades de visión ni de audio además de la entrada de voz; es puramente un modelo de ASR.
- La ventana de 30 segundos permite transcribir segmentos de audio de hasta 30 segundos de duración, lo que es adecuado para clips de voz, aunque para audios largos se requiere segmentación.

## Casos de uso

- Transcripción de llamadas telefónicas en hindi: el modelo puede procesar segmentos de audio de 30 segundos, por lo que en pipelines de transcripción de llamadas se divide el audio en ventanas y se concatenan los resultados.
- Subtitulado automático de vídeos en hindi: se utiliza para generar subtítulos en vídeos de YouTube o plataformas de streaming, aplicando segmentación previa y postprocesado de puntuación.
- Asistentes de voz en hindi: integrado en sistemas de interacción por voz, permite convertir la entrada del usuario en texto para alimentar un LLM o un sistema de diálogo.
- Análisis de conversaciones en centros de contacto: permite extraer transcripciones de llamadas para analizar sentimiento, detectar temas o evaluar la calidad del servicio en hindi.
- Accesibilidad para personas con discapacidad auditiva: facilita la conversión de audio en tiempo real a texto para usuarios que necesitan subtítulos en reuniones o clases.
- Generación de datos de entrenamiento: se puede emplear para etiquetar automáticamente audios en hindi y construir datasets para otros modelos de NLP.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible, ya que el model-index de la model card contiene una lista vacia de resultados. Sin embargo, la model card reporta metricas de evaluacion obtenidas durante el entrenamiento:

| Metrica | Valor |
|---|---|
| Perdida de evaluacion | 0,5097 |
| WER global | 15,0052 |

La tabla de progreso de entrenamiento muestra la evolucion del WER en las primeras 6 epocas:

| Epoch | Perdida de entrenamiento | Perdida de validacion | WER global |
|:-----:|:-----------------------:|:---------------------:|:----------:|
| 1.0   | 1,2654                  | 0,5157                | 23,4808    |
| 2.0   | 0,7918                  | 0,4974                | 22,4966    |
| 3.0   | 0,5037                  | 0,5097                | 15,0052    |
| 4.0   | 0,3728                  | 0,5212                | 15,4954    |
| 5.0   | 0,2900                  | 0,5442                | 15,8771    |
| 6.0   | 0,2398                  | 0,5822                | 16,2700    |

El mejor WER se alcanza en la epoca 3 con 15,0052, y posteriormente el rendimiento empeora, lo que sugiere sobreajuste a partir de esa epoca.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 763,8 millones de parametros. En precision fp16, los pesos ocupan aproximadamente 1,5 GB, por lo que se estima una VRAM minima de 2-3 GB para inferencia basica con Transformers. En fp32, la VRAM requerida asciende a 3-4 GB.
- GPU recomendadas: tarjetas como NVIDIA RTX 3060, RTX 4060, T4 o A10G son suficientes para inferencia. Para entrenamiento se recomiendan GPUs con al menos 24 GB de VRAM, como A100 o H100.
- Si cabe en consumer GPU: si, una GPU de gama media con 8 GB de VRAM puede ejecutar el modelo en fp16 sin problemas.
- Opciones de despliegue: se puede desplegar con la libreria Transformers de HuggingFace mediante la pipeline de `automatic-speech-recognition`, o con implementaciones optimizadas como faster-whisper. Tambien es compatible con el formato safetensors, lo que facilita la carga en frameworks como PyTorch.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Rendimiento |
|---|---|---|---|---|
| `parthiv11/indic_whisper_hi_multi_gpu` (base) | no disponible | 30 s | no disponible | no disponible |
| `openai/whisper-medium` | 769M | 30 s | MIT | no disponible |
| `dianavdavidson/indic_whisper_hi_multi_gpu_vaani_62427...` | 764M | 30 s | MIT | WER 15,0052 |

No se dispone de datos de benchmarks de los modelos comparables en la informacion proporcionada. El modelo aqui descrito se diferencia de Whisper-medium estandar por su fine-tuning especifico en hindi, lo que podria mejorar el rendimiento en esa lengua, aunque no hay pruebas directas disponibles.

## Limitaciones y advertencias

- El dataset de entrenamiento es desconocido, por lo que no se puede evaluar la cobertura de dominios ni la calidad de los datos.
- La model card fue generada automaticamente y carece de documentacion detallada sobre usos previstos, limitaciones o sesgos.
- El WER del 15,0052 es relativamente alto en comparacion con modelos ASR modernos en lenguas con muchos recursos; en hindi puede ser aceptable, pero habria que validarlo con mas datos.
- El modelo muestra signos de sobreajuste a partir de la epoca 3, ya que la perdida de validacion aumenta mientras la perdida de entrenamiento sigue bajando.
- El soporte de idiomas distintos del hindi no esta documentado; es probable que el fine-tuning haya degradado la capacidad multilingue original de Whisper.
- No se proporcionan datos sobre alucinaciones, sesgos demograficos ni errores comunes en escenarios ruidosos.
- El tamaño del repositorio es de 18,3 GB, lo que puede incluir pesos no optimizados o checkpoints adicionales; el uso en produccion puede requerir conversion a formatos cuantizados como GGUF, pero no se ofrecen actualmente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dianavdavidson/indic_whisper_hi_multi_gpu_vaani_62427_ratio_alldata_lr_1e-4_lgid_None_epochs_100_FT
- Modelo base: https://huggingface.co/parthiv11/indic_whisper_hi_multi_gpu
- Proyecto IndicWhisper de AI4Bharat: https://ai4bharat.iitm.ac.in/areas/model/ASR/IndicWhisper/
