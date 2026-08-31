# Ansu/whisper-large-basque

## Resumen

Ansu/whisper-large-basque es un modelo de reconocimiento automático de voz (ASR) entrenado específicamente para el euskera. Se trata de un ajuste fino (fine-tuning) del modelo Whisper Large de OpenAI, adaptado al corpus en euskera de Mozilla Common Voice 13.0. El modelo fue desarrollado por el usuario Ansu y publicado en Hugging Face, con el objetivo de ofrecer una transcripción robusta para uno de los idiomas minoritarios de Europa.

La relevancia de este modelo radica en la escasez de sistemas ASR de alta calidad para lenguas con pocos recursos como el euskera. Al partir de Whisper Large, que ya tiene capacidades multilingües, el ajuste fino permite mejorar la precisión en este idioma concreto, logrando un WER (word error rate) del 12,23% en el conjunto de evaluación de Common Voice. Con aproximadamente 1.610 millones de parámetros, es un modelo de gran tamaño que requiere recursos de cómputo considerables, pero que ofrece resultados competitivos para su dominio lingüístico.

El repositorio de Hugging Face contiene los pesos en formato safetensors, con un tamaño total de 38,6 GB, lo que indica que se distribuye en precisión completa (FP32) o similar. Aunque la ficha del modelo no incluye una tarjeta detallada, la información disponible en el proyecto ILENIA confirma su origen y rendimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (adaptación de Whisper Large) |
| Parametros totales | 1.609.692.160 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (Whisper original usa ventanas de 30 segundos de audio) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Euskera (eu) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Whisper Large de OpenAI, que es un transformer encoder-decoder entrenado con supervisión débil sobre 680.000 horas de audio multilingüe. Whisper original procesa señales de audio de hasta 30 segundos, las convierte en espectrogramas log-Mel y las codifica mediante un encoder, mientras que el decoder genera los tokens de texto de forma autorregresiva. Además de la transcripción, Whisper puede realizar identificación de idioma y traducción al inglés, aunque este modelo concreto parece estar enfocado únicamente en el reconocimiento de voz en euskera.

El ajuste fino se realizó sobre el corpus en euskera de Mozilla Common Voice 13.0. No se han publicado detalles sobre el procedimiento de entrenamiento (épocas, tasa de aprendizaje, estrategia de congelado de capas, etc.) en la información disponible. Sin embargo, existen repositorios similares del mismo autor con nombres como `whisper-large-v3-basque-lr1e-5` y `whisper-large-basque-lr1e-5-freezeFalse`, lo que sugiere que se experimentó con diferentes configuraciones, posiblemente con tasa de aprendizaje de 1e-5 y opciones de congelado de parámetros. No se menciona el uso de RLHF, DPO ni otras técnicas de alineación.

## Capacidades

- Transcripción automática de voz en euskera a texto.
- Reconocimiento de voz robusto para audio de hasta 30 segundos por segmento (según la arquitectura Whisper subyacente).
- Posible identificación de idioma, aunque no se ha confirmado en este modelo específico.
- No se indica soporte para traducción automática, tool calling, agentes ni otras capacidades de razonamiento.
- El modelo no es multimodal más allá del audio (no procesa imágenes ni video).
- No se ha documentado soporte para otros idiomas distintos del euskera, aunque al derivar de Whisper Large podría conservar cierta capacidad multilingüe residual, pero no se recomienda su uso fuera del euskera sin evaluación previa.

## Casos de uso

- Transcripción de reuniones y entrevistas en euskera: el modelo puede convertir grabaciones de audio en actas textuales, facilitando la documentación en entornos empresariales o institucionales donde el euskera es lengua de trabajo.
- Generación de subtítulos para contenido audiovisual en euskera: al integrarse en pipelines de postproducción, permite subtitular vídeos, programas de televisión o material educativo de forma automática.
- Asistencia a personas con discapacidad auditiva: la transcripción en tiempo real (con el hardware adecuado) puede servir para mostrar texto de conversaciones o eventos en euskera.
- Archivado y búsqueda de contenido histórico: al transcribir archivos de audio en euskera (entrevistas, programas de radio, testimonios), se facilita la indexación y búsqueda por texto.
- Entrenamiento de asistentes de voz en euskera: el modelo puede utilizarse como componente ASR en aplicaciones de voz, aunque su tamaño limita el despliegue en dispositivos embebidos.
- Investigación lingüística: permite procesar grandes corpus orales en euskera para análisis fonético, dialectológico o sociolingüístico.

## Benchmarks y rendimiento

Según el proyecto ILENIA, el modelo alcanza un WER del 12,23% en el conjunto de evaluación de Common Voice 13.0 para euskera. No se han publicado resultados adicionales en otros benchmarks (como FLEURS, MLS o LibriSpeech) en la información disponible. Tampoco se ofrecen comparativas con otros modelos ASR para euskera en la documentación consultada.

| Benchmark | Resultado |
|---|---|
| Common Voice 13.0 (euskera) | WER 12,23% |

## Requisitos de hardware

- No se proporcionan requisitos oficiales de hardware en la documentación del modelo.
- Basándose en el tamaño de los pesos (38,6 GB en FP32) y en el número de parámetros (1,61 mil millones), la inferencia en FP16 requeriría aproximadamente 3,2 GB de VRAM solo para los pesos, más memoria para activaciones y buffers, lo que podría caber en GPUs consumer de gama alta como la RTX 3090 o RTX 4090 (24 GB VRAM).
- Para FP32, se necesitarían unos 6,4 GB de VRAM para los pesos, pero el tamaño del repositorio sugiere que los safetensors están en FP32 (38,6 GB / 1,61e9 parámetros ≈ 24 bytes por parámetro, lo que indica precisión doble o un formato inusual; más probablemente sea FP32 con overhead). En cualquier caso, una GPU con 24 GB de VRAM es suficiente para FP16.
- Se recomienda el uso de frameworks de inferencia optimizados como Whisper.cpp, faster-whisper, o la API de Hugging Face Transformers con soporte de batching.
- Para despliegue en producción con baja latencia, se sugiere una GPU NVIDIA A10, A100 o similar, dependiendo del throughput deseado.
- El modelo no está diseñado para ejecutarse en CPU de forma eficiente, aunque Whisper.cpp podría ofrecer una opción con cuantización.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos ASR para euskera. El modelo más cercano es el Whisper Large original de OpenAI, que también soporta euskera pero con un WER presumiblemente peor (no se han publicado cifras oficiales para euskera en Whisper Large). Otros modelos como XLSR-Wav2Vec2 o Wav2Vec2-BERT podrían existir para euskera, pero no hay información en la documentación consultada.

| Modelo | Parámetros | Contexto | WER (Common Voice eu) | Licencia |
|---|---|---|---|---|
| Ansu/whisper-large-basque | 1,61B | 30 s | 12,23% | no disponible |
| openai/whisper-large | 1,55B | 30 s | no disponible | MIT |
| Otros modelos ASR para euskera | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- No se ha publicado una tarjeta de modelo detallada, por lo que se desconocen los sesgos específicos, las limitaciones de dominio o los posibles fallos de alucinación en entornos ruidosos.
- El modelo fue entrenado principalmente con datos de Common Voice, que es un corpus de lectura de frases; puede tener un rendimiento inferior en habla espontánea, acentos regionales o jerga técnica.
- La licencia no está especificada en el repositorio, lo que genera incertidumbre sobre su uso comercial. El modelo original Whisper tiene licencia MIT, pero el ajuste fino podría tener restricciones adicionales. Se recomienda contactar con el autor antes de usarlo en producción.
- No se han documentado limitaciones de contexto más allá de la ventana de 30 segundos de Whisper, por lo que para audios largos se requiere segmentación previa.
- El modelo solo está adaptado al euskera; su uso en otros idiomas no está garantizado y podría producir resultados degradados.
- Al ser un modelo de gran tamaño, los costes de inferencia son elevados y no es adecuado para aplicaciones en tiempo real en dispositivos de baja potencia.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Ansu/whisper-large-basque
- Repositorio relacionado (variante con lr 1e-5): https://huggingface.co/Ansu/whisper-large-v3-basque-lr1e-5
- Repositorio relacionado (variante sin freeze): https://huggingface.co/Ansu/whisper-large-basque-lr1e-5-freezeFalse
- Proyecto ILENIA (descripción del modelo): https://proyectoilenia.es/en/recurso/whisper-large-basque/
- Paper original de Whisper: https://github.com/openai/whisper (incluye enlaces al paper y blog)
