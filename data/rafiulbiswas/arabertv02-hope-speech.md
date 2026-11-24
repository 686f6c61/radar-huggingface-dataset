# rafiulbiswas/arabertv02-hope-speech

## Resumen

AraBERTv02-hope-speech es un modelo de clasificación de texto en árabe (con algo de inglés) obtenido por ajuste fino de `aubmindlab/bert-base-arabertv02`, un transformer encoder de tipo BERT preentrenado específicamente para árabe. Lo desarrolla Md. Rafiul Biswas (Hamad Bin Khalifa University, Catar) y resuelve una tarea concreta de tres clases: detectar si un texto contiene "discurso de esperanza" (`hope`), es `neutral` o es `not-hope`. Es relevante por su especialización: en lugar de un modelo generativo generalista, ofrece un clasificador ligero (135 millones de parámetros, ~0,5 GB en safetensors) pensado para moderación y análisis de contenido en árabe.

El modelo se entrenó sobre un corpus combinado y deduplicado de 19.015 muestras y se evaluó sobre 2.853 muestras reservadas, con una accuracy del 67,89 % y un macro-F1 del 66,05 %. El rendimiento es claramente asimétrico: la clase `hope` alcanza un F1 de 0,8143, mientras que `neutral` (0,6115) y `not-hope` (0,5557) quedan muy por debajo. Esa distribución es la principal advertencia para cualquier uso en producción.

La ficha se basa exclusivamente en la información publicada en Hugging Face y en la model card del autor; no hay paper, blog ni repositorio adicional asociados. El modelo tiene 0 descargas y 0 likes en el momento de la consulta, y la licencia no está declarada, lo que condiciona su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo BERT (AraBERTv0.2 base) |
| Parametros totales | 135.195.651 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la model card; el ejemplo de uso aplica `max_length=128` |
| Tipos de cuantizacion | no disponible (pesos safetensors en fp32; admite cuantizacion estándar vía herramientas externas) |
| Idiomas soportados | árabe (ar) e inglés (en) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Tarea | text-classification (3 clases: not-hope, neutral, hope) |
| Modelo base | aubmindlab/bert-base-arabertv02 |
| Tamano del repositorio | 0,5 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es la de un transformer encoder BERT base heredada de AraBERTv0.2: 12 capas, atención bidireccional y una cabeza de clasificación de secuencia con tres salidas (softmax sobre `not-hope`, `neutral` y `hope`). El ajuste fino se realizó sobre un dataset combinado y deduplicado de 19.015 muestras, con la siguiente distribución: 8.032 de `hope`, 6.873 de `neutral` y 4.110 de `not-hope`. No se documenta el número de tokens de entrenamiento, la composición exacta de las fuentes del corpus ni si hubo técnicas de aumento de datos o regularización más allá del ajuste estándar.

No hay información sobre RLHF, DPO ni otros procesos de alineación, algo esperable en un clasificador encoder. Tampoco se detalla el esquema de entrenamiento (épocas, learning rate, batch size, split train/validation/test más allá del conjunto de evaluación de 2.853 muestras). El preprocesado recomendado por el autor utiliza `ArabertPreprocessor` con `keep_emojis=True` y `apply_farasa_segmentation=False`, lo que indica que el pipeline de inferencia debe replicar ese preprocesado para obtener resultados coherentes con la evaluación publicada.

## Capacidades

- Clasificación de texto en tres clases (`not-hope`, `neutral`, `hope`) para árabe, con soporte parcial de inglés.
- Detección de discurso de esperanza en publicaciones, comentarios y textos breves.
- Análisis de sentimiento orientado a contenido positivo/constructivo en árabe.
- Procesamiento de texto con emojis (el preprocesador recomendado los conserva).
- Integración con la librería `transformers` mediante `pipeline("text-classification")`.
- Compatible con Text Embeddings Inference (tag `text-embeddings-inference`) y endpoints compatibles.
- No soporta generación de texto, tool calling, agentes, visión, audio ni razonamiento multi-paso: es exclusivamente un clasificador.

## Casos de uso

- Moderación de comunidades en árabe: filtrar comentarios y publicaciones para priorizar o despriorizar contenido según su carácter esperanzador, neutral o negativo, usando el clasificador como primera capa de triaje antes de la revisión humana.
- Análisis de sentimiento en redes sociales: procesar grandes volúmenes de tuits o comentarios en árabe y agregar la proporción de mensajes `hope` frente a `not-hope` por tema, campaña o periodo temporal.
- Monitorización de reputación de marca: clasificar menciones en árabe para detectar señales positivas o constructivas y separarlas de las negativas, con la advertencia de que la clase `not-hope` tiene un F1 de 0,5557 y requiere umbrales conservadores.
- Investigación en ciencias sociales y NLP: analizar corpus de discurso público en árabe para estudiar la prevalencia de discurso de esperanza en contextos como crisis, política o salud, dado el alto F1 de la clase `hope` (0,8143).
- Filtrado de datasets para entrenamiento: etiquetar corpus árabes y seleccionar subconjuntos de contenido positivo o constructivo para entrenar otros modelos o para curación de datos.
- Enrutamiento en atención al cliente: clasificar mensajes entrantes en árabe para dirigir los mensajes esperanzadores o neutros a respuestas automatizadas y los negativos a agentes humanos, siempre con validación previa del rendimiento en el dominio concreto.
- Análisis de comentarios en plataformas educativas o de soporte: detectar mensajes de ánimo y apoyo entre usuarios en foros en árabe, con `max_length=128` como configuración de referencia del autor.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre 2.853 muestras reservadas:

| Clase | Precision | Recall | F1 |
|---|---:|---:|---:|
| Not-Hope | 0,5190 | 0,5981 | 0,5557 |
| Neutral | 0,5963 | 0,6275 | 0,6115 |
| Hope | 0,8713 | 0,7643 | 0,8143 |

| Metrica global | Valor |
|---|---:|
| Accuracy | 67,89 % |
| Macro-F1 | 66,05 % |
| Weighted-F1 | 68,51 % |

No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: en torno a 0,6 GB para los pesos (135 M de parámetros), más overhead de activaciones y del tokenizador; cabe holgadamente en cualquier GPU consumer.
- VRAM estimada en fp16/bf16: aproximadamente 0,3 GB de pesos, con margen amplio para batches grandes.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; RTX 3060, RTX 4090, A100 o H100 son suficientes, aunque para esta carga las GPU de gama alta quedan sobredimensionadas.
- Cabe en GPU consumer: sí, en cualquier GPU moderna e incluso en CPU para volúmenes moderados.
- Opciones de despliegue: `transformers` con `pipeline`, Text Embeddings Inference (tag oficial del repo), endpoints compatibles y servidores de inferencia estándar para modelos encoder.
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño del modelo se espera un throughput alto en GPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rafiulbiswas/arabertv02-hope-speech | 135 M | no disponible (ejemplo con 128 tokens) | Clasificación de esperanza (3 clases) | no disponible | Hugging Face, 0 descargas |
| aubmindlab/bert-base-arabertv02 | ~135 M | 512 tokens (BERT base) | Modelo base de representaciones en árabe | no disponible en la información | Hugging Face, ampliamente usado |
| CAMeL-Lab/bert-base-arabic-camelbert-mix | ~110 M | 512 tokens (BERT base) | Modelo base en árabe (dialectos y MSA) | no disponible en la información | Hugging Face |
| UBC-NLP/MARBERT | ~110 M | 512 tokens (BERT base) | Modelo base en árabe | no disponible en la información | Hugging Face |

La comparación es estructural: los tres alternativos son modelos base de propósito general, mientras que este es un ajuste fino para una tarea concreta. No hay benchmarks comunes publicados que permitan comparar rendimiento entre ellos en la tarea de detección de esperanza.

## Limitaciones y advertencias

- Rendimiento desigual entre clases: F1 de 0,8143 en `hope` frente a 0,5557 en `not-hope` y 0,6115 en `neutral`; la accuracy global del 67,89 % oculta este desequilibrio.
- El propio autor advierte de que el rendimiento puede variar entre dialectos y dominios del árabe.
- Riesgo de alucinación no aplica en sentido generativo (no genera texto), pero sí de clasificaciones erróneas con alta confianza en textos ambiguos o de dominio no visto.
- Sesgos potenciales derivados de la composición del dataset de entrenamiento (19.015 muestras) y de las fuentes de las que procede, no documentadas.
- Licencia no declarada: no se puede asumir uso comercial sin consultar al autor.
- Contexto de entrada limitado en la práctica: el ejemplo oficial trunca a 128 tokens, por lo que textos largos pierden información.
- Soporte de inglés limitado y no cuantificado en la evaluación publicada.
- Modelo con 0 descargas y 0 likes: sin validación externa ni adopción comunitaria.
- Requiere replicar el preprocesado de AraBERT (`ArabertPreprocessor` con `keep_emojis=True` y `apply_farasa_segmentation=False`) para obtener resultados comparables a los publicados.
- No debe usarse como sistema de decisión autónomo en moderación sin revisión humana, dado el F1 moderado en dos de las tres clases.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rafiulbiswas/arabertv02-hope-speech
- Modelo base: https://huggingface.co/aubmindlab/bert-base-arabertv02
- Librería transformers: https://github.com/huggingface/transformers
- Preprocesador AraBERT: https://github.com/aub-mind/arabert
