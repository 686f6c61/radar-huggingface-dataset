# Lynn47/whisper_medium_burmese_ucsy

## Resumen

El modelo `Lynn47/whisper_medium_burmese_ucsy` es un ajuste fino (fine-tuning) del modelo Whisper medium de OpenAI, especializado en el reconocimiento automático de voz (ASR) para el idioma birmano. El autor, Lynn47, ha adaptado el modelo base multilingüe para mejorar su rendimiento en birmano, un idioma con relativamente pocos recursos en el ámbito de la ASR. El modelo tiene aproximadamente 0,8 mil millones de parámetros y se distribuye en formato safetensors bajo licencia openrail. Aunque la ficha técnica en Hugging Face es mínima, el nombre del repositorio indica claramente su propósito: transcripción de voz birmana, probablemente entrenado con un corpus específico de la Universidad de Ciencias de la Computación de Yangon (UCSY). Este modelo resulta relevante para desarrolladores que necesiten transcribir audio en birmano sin depender de servicios comerciales, y puede integrarse en pipelines de ASR con herramientas como Whisper.cpp o la API de OpenAI.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper medium) |
| Parametros totales | 0,8 mil millones (según metadatos de safetensors) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 30 segundos de audio (heredado de Whisper medium) |
| Tipos de cuantizacion | no disponible (el repositorio solo muestra F32) |
| Idiomas soportados | Birmano (según el nombre del modelo; no se especifica en la model card) |
| Licencia | openrail |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Whisper medium de OpenAI, un transformer encoder-decoder con aproximadamente 769 millones de parámetros (0,8 B). El modelo original fue preentrenado con 680 000 horas de audio débilmente supervisado en múltiples idiomas, incluyendo birmano, aunque con menor representación que otros idiomas. El ajuste fino realizado por Lynn47 probablemente utilizó un corpus de audio birmano, posiblemente de origen académico (UCSY), pero no se dispone de detalles sobre el número de horas, la composición del dataset ni el método de entrenamiento (si se usó solo transcripción o también traducción). Tampoco se indica si se aplicaron técnicas de alineación como RLHF o DPO; lo más probable es que sea un fine-tuning estándar de ASR supervisado. No se mencionan innovaciones técnicas adicionales más allá del ajuste del modelo base.

## Capacidades

- Transcripción de audio en birmano a texto.
- Posible capacidad de traducción al inglés si se conservó la funcionalidad original de Whisper, aunque no está confirmado.
- Manejo de audio de hasta 30 segundos por segmento, con capacidad de procesar archivos más largos mediante ventanas deslizantes.
- Inferencia en tiempo real o por lotes mediante librerías compatibles con Whisper (openai-whisper, faster-whisper, whisper.cpp).
- No se indica soporte para tool calling, agentes ni razonamiento multi-paso, ya que es un modelo de ASR puro.
- No se especifican capacidades multilingües adicionales; el modelo está especializado en birmano.

## Casos de uso

- Transcripción de reuniones y entrevistas en birmano: el modelo puede convertir grabaciones de audio en actas textuales, útil para periodistas, investigadores o empresas que operan en Myanmar.
- Subtitulado automático de vídeos en birmano: integrado en pipelines de procesamiento de vídeo, permite generar subtítulos para contenido educativo o de entretenimiento.
- Asistencia a personas con discapacidad auditiva: transcripción en tiempo real de conversaciones o eventos en birmano para mostrar texto en pantalla.
- Análisis de llamadas de servicio al cliente: transcripción de grabaciones de centros de atención para extraer métricas de calidad o detectar problemas recurrentes.
- Archivado de contenido oral: digitalización de entrevistas históricas o testimonios en birmano para su preservación y búsqueda textual.
- Desarrollo de asistentes de voz en birmano: el modelo puede servir como componente ASR en aplicaciones de voz a texto, aunque se necesitaría un sistema de síntesis y comprensión adicional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de métricas como WER (Word Error Rate) o comparaciones con otros modelos de ASR birmano. El repositorio no incluye ninguna evaluación cuantitativa.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: alrededor de 5-6 GB (el modelo pesa ~3 GB en FP32, más overhead de activaciones).
- Con cuantización a int8 (si se convierte a GGUF o similar), la VRAM necesaria se reduce a ~2-3 GB.
- GPU recomendadas: RTX 3060 (12 GB) o superior para FP32; una RTX 2060 o incluso una GTX 1660 podrían funcionar con cuantización.
- En CPU, es viable con llama.cpp o whisper.cpp, aunque la latencia será alta (varios segundos por minuto de audio).
- Opciones de despliegue: openai-whisper, faster-whisper (CTranslate2), whisper.cpp, Hugging Face Transformers.
- Latencia estimada: en una GPU moderna (RTX 3090), la transcripción de 30 segundos de audio toma aproximadamente 2-3 segundos; en CPU puede tardar 20-30 segundos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idioma | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Lynn47/whisper_medium_burmese_ucsy | 0,8 B | 30 s | Birmano | openrail | Hugging Face |
| openai/whisper-medium (original) | 0,8 B | 30 s | Multilingüe (incluye birmano) | MIT | Hugging Face / OpenAI |
| myMediWhisper (paper, no público) | no disponible | no disponible | Birmano médico | no disponible | no disponible |

El modelo original de Whisper medium ya soporta birmano, aunque con menor precisión que para idiomas con más datos. Este fine-tuning busca mejorar el rendimiento específicamente en birmano, pero sin benchmarks no se puede cuantificar la mejora. myMediWhisper es un modelo mencionado en un paper de arXiv, pero no está disponible públicamente.

## Limitaciones y advertencias

- No hay información sobre la calidad del modelo; al no publicarse métricas, no se puede garantizar su precisión en birmano general.
- El contexto de audio se limita a 30 segundos por segmento; para audios largos se necesita segmentación, lo que puede introducir errores en los bordes.
- Posible sesgo hacia el dialecto o vocabulario específico del corpus de entrenamiento (probablemente académico de UCSY), lo que puede reducir el rendimiento en habla coloquial o regional.
- Riesgo de alucinaciones en transcripciones cuando el audio es ruidoso o ininteligible, como es común en los modelos Whisper.
- Licencia openrail permite uso comercial, pero no se especifican restricciones adicionales; se recomienda revisar los términos completos.
- No se indica si el modelo conserva la capacidad de traducción al inglés del Whisper original; puede que el fine-tuning la haya eliminado.
- El modelo no está desplegado en ningún Inference Provider, por lo que el usuario debe gestionar su propia infraestructura.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Lynn47/whisper_medium_burmese_ucsy
- Modelo base Whisper medium de OpenAI: https://huggingface.co/openai/whisper-medium
- Repositorio oficial de Whisper: https://github.com/openai/whisper
- Paper relacionado (myMediWhisper, corpus médico birmano): https://arxiv.org/html/2608.11036v1
