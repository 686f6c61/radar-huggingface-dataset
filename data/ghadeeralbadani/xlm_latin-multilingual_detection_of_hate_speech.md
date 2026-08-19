# GhadeerALbadani/xlm_latin-Multilingual_detection_of_hate_speech

## Resumen

El modelo `xlm_latin-Multilingual_detection_of_hate_speech` es un clasificador de secuencias basado en XLM-RoBERTa, desarrollado por Ghadeer Albadani, que detecta discurso de odio en ocho idiomas mediante una representación unificada en escritura latina. El enfoque principal es la transliteración de los textos originales (árabe, hebreo, persa, ruso, español, bengalí, chino y coreano) a un mismo alfabeto latino, lo que permite entrenar un único modelo multilingüe y evaluarlo de forma individual por idioma.

El problema que resuelve es la fragmentación lingüística en la moderación de contenido: en lugar de mantener un modelo separado por lengua, esta propuesta estandariza la entrada y aprovecha el aprendizaje conjunto. Con 110,6 millones de parámetros, el modelo es compacto y adecuado para entornos con recursos limitados. La longitud de contexto no se ha publicado, y la licencia depende de la del modelo base y los datos utilizados.

La relevancia actual radica en la creciente necesidad de herramientas de moderación multilingüe eficientes, especialmente en plataformas sociales donde los idiomas con escrituras no latinas están infrarrepresentados en los datasets de odio. Este modelo ofrece una vía para abordar esa brecha mediante transliteración, aunque con limitaciones documentadas en idiomas de baja representación.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | XLM-RoBERTa (fine-tuned, variante no especificada) |
| Parametros totales | 110.618.882 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Arabe, hebreo, persa, ruso, español, bengali, chino, coreano (transliterados a latin) |
| Licencia | No disponible (depende de la licencia del modelo base y los datasets) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Transformer encoder de XLM-RoBERTa, fine-tuned para clasificación de secuencias binaria (odio / no odio). La innovación principal es el uso de transliteración: los textos de los ocho idiomas se convierten a una escritura latina unificada antes del entrenamiento y la inferencia. Esto permite que el modelo aprenda representaciones compartidas entre lenguas que originalmente usan alfabetos distintos.

El proceso de entrenamiento consistió en un fine-tuning conjunto sobre los ocho idiomas transliterados, seguido de una evaluación individual por lengua. No se han publicado detalles sobre el número de tokens, la composición del dataset ni si se aplicaron técnicas como RLHF o DPO. El modelo se distribuye con los pesos en formato safetensors y se carga mediante la librería Transformers de Hugging Face.

## Capacidades

- Clasificación binaria de discurso de odio (odio / no odio) en ocho idiomas.
- Soporte multilingüe mediante transliteración a escritura latina unificada.
- Inferencia cross-lingual: un único modelo procesa textos de diferentes alfabetos.
- Compatible con el pipeline `text-classification` de Hugging Face.
- Preparado para despliegue con `text-embeddings-inference` y endpoints compatibles.
- Requiere que el texto de entrada sea transliterado al mismo formato latino usado durante el entrenamiento.

## Casos de uso

- Moderación de contenido en redes sociales: el modelo puede clasificar comentarios y publicaciones en varios idiomas (árabe, español, ruso, etc.) tras aplicar la transliteración, ayudando a priorizar la revisión humana en plataformas multilingües.
- Análisis de opinión en foros y comunidades internacionales: permite detectar mensajes de odio en hilos de discusión que mezclan idiomas con escrituras diversas, usando un solo modelo.
- Investigación académica en NLP multilingüe: sirve como punto de partida para estudiar el impacto de la transliteración en la detección de odio y para comparar con enfoques por idioma.
- Herramientas de escucha social para marcas: monitorización de menciones en múltiples mercados, filtrando contenido tóxico antes de que afecte a la reputación.
- Sistemas de alerta temprana en comunidades de juegos online: clasificación de mensajes de chat en tiempo real para identificar comportamientos abusivos en partidas multijugador.
- Archivado y análisis de corpus históricos: etiquetado automático de documentos multilingües transliterados para estudios sociológicos sobre discurso de odio.

## Benchmarks y rendimiento

La model card del autor reporta el rendimiento por idioma en términos de Macro F1, evaluado individualmente tras el entrenamiento conjunto:

| Idioma | Macro F1 |
|---|---|
| Bengalí | 0,85 |
| Español | 0,81 |
| Persa | 0,80 |
| Ruso | 0,77 |
| Chino | 0,75 |
| Árabe | 0,72 |
| Hebreo | 0,72 |
| Coreano | 0,62 |

No se han publicado comparaciones con otros modelos de detección de odio multilingües en la información disponible.

## Requisitos de hardware

- Con 110,6 millones de parámetros, el modelo en precisión float32 ocupa aproximadamente 442 MB, en float16 unos 221 MB y en int8 cerca de 110 MB (estimación basada en el tamaño de parámetros).
- Puede ejecutarse en GPUs de consumo con al menos 1 GB de VRAM (por ejemplo, NVIDIA GTX 1050 Ti, RTX 2060) y también en CPU para inferencia por lotes pequeña.
- Para despliegue en producción se recomienda usar vLLM, TGI o Hugging Face Inference Endpoints, que soportan el formato safetensors.
- La latencia no se ha publicado, pero dado el tamaño reducido, se espera un throughput alto en GPU modernas (del orden de miles de inferencias por segundo en batch, aunque sin datos oficiales).

## Comparativa con modelos similares

No se dispone de comparativas publicadas con otros modelos de detección de odio multilingües en la información proporcionada. A modo de referencia cualitativa:

- **XLM-RoBERTa base** (278M parámetros): modelo preentrenado multilingüe sin fine-tuning específico para odio; requiere adaptación por idioma.
- **mBERT** (178M parámetros): similar a XLM-R pero con menor cobertura de idiomas; no está orientado a odio.
- **HateBERT** (base, 110M parámetros): especializado en inglés, no multilingüe.

Este modelo se distingue por su enfoque de transliteración y su tamaño compacto, pero carece de datos comparativos de rendimiento frente a estas alternativas.

## Limitaciones y advertencias

- La transliteración introduce ambigüedad y puede perder matices fonéticos o semánticos propios de cada lengua.
- El rendimiento varía significativamente entre idiomas: el coreano obtiene un Macro F1 de 0,62, muy por debajo del bengalí (0,85).
- Dificultad para detectar sarcasmo, ironía y discurso de odio implícito, así como slang y jerga informal de redes sociales.
- Riesgo de falsos positivos y falsos negativos; el modelo no debe usarse como único mecanismo de decisión en contextos legales o de suspensión de cuentas.
- Posible degradación en dominios distintos a los datos de entrenamiento (domain shift).
- Rendimiento reducido en idiomas no representados durante el fine-tuning.
- La licencia no está especificada; debe verificarse la del modelo base (XLM-RoBERTa) y los datasets utilizados antes de uso comercial.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/GhadeerALbadani/xlm_latin-Multilingual_detection_of_hate_speech
- Repositorio del modelo base: https://huggingface.co/GhadeerALbadani/XLM_Latin
