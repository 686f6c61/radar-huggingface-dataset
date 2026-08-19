# Saurabh18888/gliner-news-geo

## Resumen

El modelo `Saurabh18888/gliner-news-geo` es un sistema de reconocimiento de entidades nombradas (NER) especializado en textos de noticias geopolíticas y de actualidad internacional. Desarrollado por Saurabh18888, se basa en la arquitectura GLiNER2, una evolución de GLiNER que permite extraer entidades mediante descripciones textuales de las etiquetas, lo que facilita su adaptación a dominios específicos sin necesidad de reentrenar. El modelo se ha ajustado mediante técnicas de fine-tuning eficiente (PEFT/LoRA) sobre el checkpoint base `fastino/gliner2-base-v1`, utilizando una combinación del dataset OntoNotes5 y un conjunto de datos propio construido a partir de eventos de Wikipedia entre 2020 y 2022. Con aproximadamente 210 millones de parámetros y un tamaño de repositorio de 0,8 GB, está diseñado para integrarse en pipelines de procesamiento de lenguaje natural que requieran extraer personas, organizaciones, lugares, eventos, fechas, horas y cantidades de forma fiable.

La relevancia de este modelo radica en su ontología unificada de siete etiquetas, que cubre las necesidades habituales del análisis de noticias y del seguimiento de acontecimientos internacionales. Al estar entrenado específicamente sobre datos de noticias, ofrece un equilibrio entre precisión y cobertura para textos periodísticos, algo que los modelos NER genéricos suelen resolver peor. Su licencia Apache 2.0 permite su uso comercial sin restricciones, y su tamaño moderado lo hace viable para despliegue en entornos con recursos limitados.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GLiNER2 (basada en transformer encoder) |
| Parametros totales | 209.803.925 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el texto de ejemplo está en inglés, pero no se especifica) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

GLiNER2 es una arquitectura de tipo transformer encoder diseñada específicamente para tareas de reconocimiento de entidades nombradas. A diferencia de los modelos NER clásicos que clasifican tokens contra un conjunto fijo de etiquetas, GLiNER2 acepta descripciones textuales de las entidades objetivo y las combina con el texto de entrada para generar predicciones. Esto permite que el modelo sea flexible y pueda aplicarse a dominios nuevos sin necesidad de ajustes adicionales, siempre que se proporcionen descripciones adecuadas.

El entrenamiento se realizó mediante fine-tuning eficiente con LoRA sobre el checkpoint base `fastino/gliner2-base-v1`. Los datos de entrenamiento provienen de dos fuentes: el dataset `tner/ontonotes5`, que aporta cobertura para entidades núcleo como PERSON, ORG y DATE, y un dataset propio construido a partir de un volcado de eventos de Wikipedia (2020-2022), que refuerza específicamente las categorías GPE y EVENT. Tras el entrenamiento, los pesos de LoRA se fusionaron completamente con el modelo base, dando lugar a una arquitectura independiente y lista para producción. No se menciona el uso de RLHF ni DPO; el ajuste es puramente supervisado.

## Capacidades

- Extracción de entidades nombradas en texto de noticias geopolíticas y de actualidad.
- Soporte para siete tipos de entidad: PERSON, ORG, GPE (entidades geopolíticas), EVENT, DATE, TIME y QUANTITY.
- Inferencia con etiquetas definidas por el usuario mediante descripciones textuales, gracias a la arquitectura GLiNER2.
- Capacidad de devolver spans de entidades junto con puntuaciones de confianza (`include_confidence=True`).
- Funciona como pipeline de token-classification, integrable en flujos de procesamiento de lenguaje natural.
- Entrenado específicamente sobre datos de noticias, lo que mejora la precisión en textos periodísticos frente a modelos NER genéricos.
- Al ser un modelo de tamaño moderado (210M parámetros), es adecuado para entornos con recursos limitados.

## Casos de uso

- Análisis de flujo de noticias: extraer automáticamente personas, organizaciones y lugares mencionados en artículos de prensa para construir bases de datos de actores y ubicaciones.
- Seguimiento de eventos internacionales: identificar eventos nombrados (conflictos, desastres, operaciones) y fechas asociadas para generar líneas temporales automáticas.
- Monitorización de medios: clasificar y etiquetar entidades en noticias de agencias para alimentar sistemas de alerta temprana o resúmenes automáticos.
- Investigación periodística: extraer citas, fechas y cantidades de documentos para verificar hechos y facilitar la redacción de reportajes.
- Construcción de grafos de conocimiento: convertir las entidades extraídas en nodos y relaciones para alimentar sistemas de búsqueda semántica o recomendación.
- Automatización de informes de inteligencia: procesar boletines de prensa y comunicados oficiales para extraer actores, lugares y eventos relevantes en tiempo casi real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de métricas como F1, precisión o recall sobre conjuntos de evaluación estándar (p. ej., CoNLL-2003, OntoNotes) ni comparaciones con otros modelos NER.

## Requisitos de hardware

- El modelo tiene 210M parámetros y un tamaño de pesos de aproximadamente 0,8 GB en formato safetensors (presumiblemente en precisión float32).
- Para inferencia en float32, se estima una VRAM de al menos 1 GB, aunque en la práctica con batch pequeño y secuencias cortas puede funcionar con menos.
- Es viable en GPUs de consumo como NVIDIA GTX 1060 (6 GB), RTX 2060, RTX 3060, etc. También puede ejecutarse en CPU, aunque con mayor latencia.
- No se dispone de información sobre cuantización, por lo que no se puede confirmar si existen versiones GGUF o INT8/INT4.
- Opciones de despliegue: la librería `gliner2` (pip install gliner2) es la vía nativa. No se menciona soporte para vLLM, TGI u Ollama, pero al ser un modelo de tamaño pequeño, podría adaptarse a entornos como ONNX Runtime o TensorRT si se exporta.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa con otros modelos NER específicos para noticias. Como referencia general, GLiNER2 se posiciona como una alternativa flexible a modelos como SpaCy (en pipelines NER) o a modelos basados en transformers como BERT fine-tuneado para NER, pero no se tienen datos concretos de rendimiento relativo.

## Limitaciones y advertencias

- El modelo está entrenado principalmente sobre datos en inglés (aunque no se especifica explícitamente), por lo que su rendimiento en otros idiomas puede ser limitado.
- No se ha evaluado formalmente su comportamiento en textos fuera del dominio de noticias geopolíticas; puede degradarse en otros géneros textuales.
- Como todo modelo NER, existe riesgo de alucinación o de extraer entidades incorrectas, especialmente en textos ambiguos o con errores tipográficos.
- No se proporcionan datos sobre sesgos demográficos o geopolíticos; al entrenarse con noticias, podría reflejar sesgos presentes en los medios de comunicación.
- La ontología de siete etiquetas es fija; si se necesitan tipos de entidad adicionales, habría que reentrenar o adaptar el modelo.
- Aunque la licencia Apache 2.0 permite uso comercial, no se especifican limitaciones adicionales sobre el uso de los datos de entrenamiento (especialmente el dataset custom de Wikipedia).
- El repositorio no incluye información sobre la longitud máxima de secuencia soportada, lo que puede afectar a textos largos.

## Enlaces

- Modelo en Hugging Face: [Saurabh18888/gliner-news-geo](https://huggingface.co/Saurabh18888/gliner-news-geo)
- Librería GLiNER2 (referencia): no se proporciona enlace directo, pero puede consultarse el paquete `gliner2` en PyPI.
