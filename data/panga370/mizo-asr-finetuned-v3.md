# panga370/mizo-asr-finetuned-v3

## Resumen

El modelo `panga370/mizo-asr-finetuned-v3` es un sistema de reconocimiento automático del habla (ASR) especializado en el idioma mizo, una lengua tibetano-birmana hablada principalmente en el estado de Mizoram (India) y en regiones vecinas de Birmania y Bangladés. Se trata de un ajuste fino (fine-tuning) del modelo base `facebook/wav2vec2-xls-r-300m`, un transformer preentrenado en más de 128 idiomas mediante aprendizaje autosupervisado. El modelo fue desarrollado por el usuario `panga370` y publicado en Hugging Face bajo licencia Apache 2.0.

El modelo cuenta con 315,5 millones de parámetros y una ventana de contexto de audio de aproximadamente 20 segundos (heredada de la arquitectura XLS-R). Aunque el autor no ha documentado el conjunto de datos de entrenamiento, la colección de modelos Mizo ASR en Hugging Face sugiere que se utilizó el dataset MiZonal v1.0, un corpus de voz recientemente creado para esta lengua. El modelo se presenta como una herramienta para transcribir audio en mizo, un idioma con escasos recursos digitales, lo que lo convierte en un intento relevante para preservar y procesar lenguas minoritarias mediante IA.

Sin embargo, los resultados de evaluación reportados por el autor indican un rendimiento muy deficiente: un WER (Word Error Rate) de 0,9731 y un CER (Character Error Rate) de 0,9933 en el conjunto de validación, lo que significa que prácticamente ninguna palabra es transcrita correctamente. Esto sugiere que el modelo no está listo para uso práctico y requiere un entrenamiento adicional o una revisión de los datos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | wav2vec2 (transformer encoder) |
| Parámetros totales | 315.477.670 |
| Parámetros activos | no aplica (modelo denso) |
| Longitud de contexto | 20 segundos de audio (aprox., heredada de XLS-R) |
| Tipos de cuantización | no disponible (pesos en safetensors, FP32) |
| Idiomas soportados | Mizo (no declarado explícitamente, inferido por el nombre y la colección) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura wav2vec2, un encoder transformer que procesa señales de audio sin necesidad de transcripciones alineadas durante el preentrenamiento. El modelo base `facebook/wav2vec2-xls-r-300m` fue preentrenado en 128 idiomas con más de 56.000 horas de audio, y su capa de salida se adaptó para clasificar caracteres del idioma mizo durante el ajuste fino.

El entrenamiento se realizó con los siguientes hiperparámetros: learning rate de 3e-05, batch size de entrenamiento de 2 (con acumulación de gradientes de 4, dando un batch efectivo de 8), batch de evaluación de 1, optimizador AdamW (con betas 0.9/0.999 y epsilon 1e-08), scheduler lineal con 0.1 pasos de warmup, y 30 épocas. Se utilizó precisión mixta (Native AMP). El conjunto de datos de entrenamiento no está documentado, aunque la colección asociada sugiere el uso de MiZonal v1.0, un corpus de voz en mizo. No se menciona el uso de técnicas de RLHF o DPO, ya que es un modelo ASR y no un LLM.

## Capacidades

- Reconocimiento automático del habla (ASR) para el idioma mizo.
- Transcripción de audio a texto a partir de señales de voz.
- Procesamiento de audio de hasta 20 segundos por segmento (limitación de la arquitectura).
- Soporte para inferencia en tiempo real con frameworks como Transformers y pipelines de Hugging Face.
- No incluye capacidades de tool calling, agentes ni razonamiento multi-paso, ya que es un modelo de transcripción puro.
- No es multilingüe; está especializado únicamente en mizo.

## Casos de uso

- Transcripción de entrevistas y testimonios orales en mizo para investigación lingüística y antropológica.
- Generación de subtítulos para vídeos en mizo en plataformas de contenido local.
- Asistencia a personas con discapacidad auditiva mediante transcripción en tiempo real de conversaciones en mizo.
- Creación de corpus de texto a partir de grabaciones de radio o podcasts en mizo para alimentar otros modelos de NLP.
- Archivado y digitalización de material sonoro histórico en mizo.
- Desarrollo de asistentes de voz en mizo para dispositivos móviles o aplicaciones de accesibilidad.

No obstante, dado el alto WER actual, estos casos de uso son teóricos; el modelo necesita una mejora sustancial antes de poder emplearse en entornos reales.

## Benchmarks y rendimiento

El autor reporta los siguientes resultados en el conjunto de evaluación durante el entrenamiento (épocas 1 a 7):

| Época | Pérdida de validación | WER | CER |
|:-----:|:---------------------:|:---:|:---:|
| 1.0   | 9.4520                | 1.0 | 0.9897 |
| 2.0   | 5.4387                | 0.9731 | 0.9933 |
| 3.0   | 3.6515                | 0.9731 | 0.9933 |
| 4.0   | 3.2223                | 0.9731 | 0.9933 |
| 5.0   | 3.0080                | 0.9731 | 0.9933 |
| 6.0   | 2.8755                | 0.9731 | 0.9933 |
| 7.0   | 2.8109                | 0.9731 | 0.9933 |

El WER se estabiliza en 0,9731 y el CER en 0,9933 a partir de la segunda época, lo que indica que el modelo no logra aprender a transcribir correctamente el idioma. No se han publicado resultados comparativos con otros modelos ASR para mizo.

## Requisitos de hardware

- El modelo tiene 315 millones de parámetros, lo que en FP32 ocupa aproximadamente 1,26 GB en memoria.
- Para inferencia en CPU es viable, pero con latencia alta (varios segundos por audio de 10 segundos).
- Para inferencia en tiempo real se recomienda una GPU con al menos 4 GB de VRAM (p. ej., NVIDIA GTX 1650, RTX 3050).
- En GPU de gama alta (RTX 3090, A100) el throughput es de varios cientos de segundos de audio por segundo.
- Despliegue compatible con la librería Transformers de Hugging Face, así como con `pipeline("automatic-speech-recognition")`.
- También se puede exportar a ONNX para optimizar la inferencia en CPU o edge devices.

## Comparativa con modelos similares

No se dispone de información pública sobre otros modelos ASR específicos para el idioma mizo. La colección de Hugging Face "Mizo Automatic Speech Recognition (ASR) Models" incluye varios fine-tunes de wav2vec2 y XLS-R, pero no hay benchmarks comparativos publicados. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- Rendimiento extremadamente bajo: WER de 97,31% y CER de 99,33%, lo que hace que el modelo sea prácticamente inutilizable para transcripción real.
- El conjunto de datos de entrenamiento no está documentado; la calidad y el tamaño del corpus son desconocidos, lo que impide evaluar la cobertura dialectal o la diversidad de hablantes.
- La licencia Apache 2.0 permite uso comercial, pero el modelo no está listo para producción.
- No hay garantías sobre la robustez frente a ruido, acentos o variaciones del habla.
- El modelo solo procesa segmentos de audio de hasta 20 segundos; audios más largos deben segmentarse previamente.
- No se ha evaluado la latencia ni el consumo de recursos en dispositivos móviles.
- Al ser un modelo generado automáticamente con `Trainer`, es posible que la configuración de preprocesamiento no sea óptima para el idioma mizo.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/panga370/mizo-asr-finetuned-v3)
- [Colección de modelos ASR en mizo](https://huggingface.co/collections/andrewbawitlung/mizo-automatic-speech-recognition-asr-models-676ebba07158e5e5c832ecd5)
- [Modelo base: facebook/wav2vec2-xls-r-300m](https://huggingface.co/facebook/wav2vec2-xls-r-300m)
- [Artículo sobre fine-tuning de wav2vec2 para mizo (ResearchGate)](https://www.researchgate.net/figure/Model-architecture-for-fine-tuning-mizo-language-using-Wav2vec-20-and-XLS-R-model_fig2_393134809)
