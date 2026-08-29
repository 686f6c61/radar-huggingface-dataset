# MWirelabs/ne-speechembed

## Resumen

NE-SpeechEmbed es un modelo de embeddings multimodales habla-texto desarrollado por MWire Labs, diseñado específicamente para lenguas del noreste de India, una región con recursos lingüísticos muy limitados. Es el primer modelo de recuperación speech-text para estas lenguas, que incluyen khasi, garo, mizo, nagamese, kokborok, asamés, wancho y chakma. El modelo permite buscar fragmentos de audio a partir de texto y viceversa, lo que resulta fundamental para tareas de archivado, transcripción y análisis de corpus orales en contextos de bajos recursos.

La arquitectura combina un encoder de habla basado en Whisper-medium (ajustado en un corpus ASR propio) con un encoder de texto basado en xlm-roberta-base, ambos proyectados a un espacio común de 768 dimensiones con normalización L2. El entrenamiento utiliza la pérdida InfoNCE con temperatura aprendida, sobre 73 476 pares habla-texto procedentes de corpus propietarios de MWire y del conjunto Vaani. El modelo se publica bajo licencia CC-BY-4.0 y su repositorio ocupa 5,9 GB.

La relevancia de este modelo radica en abordar un vacío claro: las lenguas del noreste de India están muy infrarrepresentadas en los sistemas de procesamiento de habla y texto. NE-SpeechEmbed ofrece una base para construir sistemas de búsqueda semántica, recuperación de información y anotación automática en estos idiomas, con un enfoque de código abierto que facilita su adopción y adaptación.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Dual-encoder: Whisper-medium (speech) + xlm-roberta-base (text) con proyecciones lineales (1024→768 y 768→768) |
| Parametros totales | no disponible (Whisper-medium ~769M, xlm-roberta-base ~278M, sin contabilizar proyecciones) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de embeddings, no generativo) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | khasi, garo, mizo, nagamese, kokborok, asamés, wancho, chakma |
| Licencia | CC-BY-4.0 |
| Formato de pesos | no disponible (repositorio de 5,9 GB, probablemente safetensors) |

## Arquitectura y entrenamiento

NE-SpeechEmbed sigue una arquitectura dual-encoder clásica para recuperación cross-modal. El encoder de habla es Whisper-medium, ajustado en un corpus ASR propio de lenguas del noreste de India (checkpoint 8000), que produce representaciones de 1024 dimensiones. El encoder de texto es xlm-roberta-base, que genera representaciones de 768 dimensiones. Ambas ramas se proyectan mediante capas lineales a un espacio común de 768 dimensiones, y los vectores resultantes se normalizan con L2.

El entrenamiento se realiza con la pérdida InfoNCE con temperatura aprendida, una función de contraste que maximiza la similitud entre pares habla-texto correctos y minimiza la de pares incorrectos dentro de un lote. Los datos de entrenamiento consisten en 73 476 pares habla-texto, procedentes de corpus propietarios de MWire Labs y del conjunto Vaani, un recurso público de habla para lenguas indias. No se menciona el uso de técnicas como RLHF o DPO, ya que no es un modelo generativo sino de representación.

## Capacidades

- Generación de embeddings de habla y texto en un espacio común de 768 dimensiones, normalizado L2.
- Recuperación cross-modal: dado un texto, encontrar el fragmento de audio más relevante, y viceversa.
- Búsqueda semántica de audio en corpus multilingües de lenguas del noreste de India.
- Soporte multilingüe para ocho lenguas de la región, incluyendo algunas muy poco representadas como wancho y chakma.
- Representaciones aptas para tareas de similitud, clustering y clasificación de audio y texto.
- No es un modelo generativo: no produce texto ni audio, solo representaciones vectoriales.

## Casos de uso

- Archivado y búsqueda de grabaciones orales: permite indexar entrevistas, testimonios o narraciones en lenguas como khasi o garo, y recuperarlas mediante consultas de texto, facilitando el trabajo de etnógrafos y lingüistas.
- Transcripción asistida y alineación: dado un texto transcrito, el modelo puede localizar el segmento de audio correspondiente, útil para herramientas de subtitulado o revisión de transcripciones.
- Sistemas de recomendación de contenido multimedia: en plataformas de vídeo o audio en lenguas regionales, se pueden generar embeddings de los clips y del texto de descripción para recomendar contenido relacionado.
- Análisis de corpus de habla para investigación sociolingüística: permite agrupar fragmentos por similitud semántica, identificar temas recurrentes o medir la distancia entre variedades dialectales.
- Asistente de búsqueda en bibliotecas digitales: instituciones que conservan archivos orales en lenguas del noreste de India pueden ofrecer búsqueda por texto sobre sus colecciones de audio.
- Entrenamiento de modelos downstream: los embeddings generados pueden servir como características de entrada para clasificadores de tópicos, detección de idioma o segmentación de habla.

## Benchmarks y rendimiento

El modelo reporta resultados de recuperación sobre un pool de 100 muestras por idioma. No se han publicado comparaciones con otros modelos de recuperación speech-text en estas lenguas, por lo que la referencia principal es el azar (random).

| Idioma | R@1 | R@5 | R@10 |
|---|---|---|---|
| Khasi | 5,0 % | 19,0 % | 27,0 % |
| Garo | 7,0 % | 21,0 % | 33,0 % |
| Mizo | 5,0 % | 17,0 % | 30,0 % |
| Nagamese | 5,0 % | 19,0 % | 30,0 % |
| Kokborok | 8,0 % | 24,0 % | 35,0 % |
| Random | 1,0 % | 5,0 % | 10,0 % |

Los valores de R@1 son bajos en términos absolutos, pero superan claramente al azar (5-8 % frente a 1 %), lo que indica que el modelo ha aprendido una señal útil, aunque con margen de mejora. El pool de evaluación es pequeño (100 muestras), por lo que los resultados deben interpretarse con cautela.

## Requisitos de hardware

- Inferencia en GPU: el modelo combina Whisper-medium y xlm-roberta-base. En fp16, Whisper-medium requiere aproximadamente 5 GB de VRAM y xlm-roberta-base alrededor de 1 GB, más las proyecciones lineales. Se estima un consumo total de 6-7 GB de VRAM para inferencia en lote pequeño.
- GPU recomendadas: tarjetas con al menos 8 GB de VRAM, como RTX 3060, RTX 3070, RTX 4060 o superiores. Para procesamiento por lotes grande, se recomienda una GPU con 16 GB o más, como RTX 4090 o A100.
- En CPU: es posible ejecutar el modelo con librerías como Transformers, pero la latencia será alta, especialmente para el encoder de habla.
- Opciones de despliegue: al ser un modelo de embeddings, se puede servir con frameworks como Sentence-Transformers, FAISS para indexación, o mediante una API REST con FastAPI. No se menciona compatibilidad con vLLM, Ollama o TGI, que están orientados a modelos generativos.
- Latencia y throughput: no se han publicado datos. En una GPU moderna, la codificación de un audio de 10 segundos con Whisper-medium suele tardar menos de 1 segundo, y la codificación de texto con xlm-roberta-base es del orden de milisegundos.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables específicos para lenguas del noreste de India. Existen modelos multilingües de embeddings speech-text como CLAP o SpeechT5, pero no cubren estas lenguas y no se han publicado comparaciones con NE-SpeechEmbed. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- Los resultados de recuperación son bajos en términos absolutos (R@1 entre 5 % y 8 %), lo que limita su uso en aplicaciones que requieran alta precisión sin un ajuste adicional.
- El pool de evaluación es pequeño (100 muestras), por lo que los benchmarks pueden no reflejar el rendimiento en corpus más grandes o diversos.
- El modelo se ha entrenado con 73 476 pares, una cantidad reducida para ocho lenguas, lo que puede provocar un rendimiento desigual entre idiomas y una generalización limitada.
- No se han documentado sesgos específicos, pero al tratarse de datos de corpus propietarios y Vaani, es posible que existan sesgos de género, edad o dialecto en las grabaciones.
- El modelo no es generativo: no puede transcribir audio ni generar texto, solo produce representaciones vectoriales.
- La licencia CC-BY-4.0 permite uso comercial con atribución, pero es recomendable revisar los términos de los corpus subyacentes (Vaani y corpus propietarios) para asegurar el cumplimiento.
- No se especifican los formatos de audio soportados ni el preprocesamiento necesario, lo que puede requerir trabajo adicional de integración.

## Enlaces

- Hugging Face: https://huggingface.co/MWirelabs/ne-speechembed
- GitHub: https://github.com/MWirelabs/ne-speechembed
- Paper (OpenReview): https://openreview.net/forum?id=cOCsA88Fza
- Ficha en AIKosh (India AI): https://aikosh.indiaai.gov.in/home/models/details/ne_speechembed.html
