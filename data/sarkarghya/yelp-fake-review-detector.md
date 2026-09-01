# sarkarghya/yelp-fake-review-detector

## Resumen

El modelo `sarkarghya/yelp-fake-review-detector` es un clasificador de texto diseñado para identificar reseñas de Yelp que presentan patrones sospechosos según los filtros automáticos de la propia plataforma. Desarrollado por el usuario sarkarghya, consiste en un fine-tuning de DeBERTa-v3-base sobre el dataset YelpZip, que utiliza etiquetas proxy (proxy labels) derivadas del estado de filtrado de Yelp como aproximación a la falsedad de las reseñas. El modelo resuelve el problema de la moderación de contenido generado por usuarios en plataformas de reseñas, ofreciendo una herramienta para detectar patrones que Yelp considera potencialmente fraudulentos.

Con 184 millones de parámetros y un tamaño de repositorio de 0,7 GB, el modelo se publica en formato safetensors y es compatible con la librería transformers. Su relevancia actual radica en la creciente necesidad de combatir reseñas falsas en plataformas de comercio electrónico y servicios, aunque el autor advierte explícitamente que las etiquetas proxy no constituyen una verificación manual de fraude y que el modelo no debe utilizarse para acusar a personas o negocios de prácticas fraudulentas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DeBERTa-v3-base (encoder transformer) |
| Parametros totales | 184.423.682 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo safetensors en fp32) |
| Idiomas soportados | no disponible (probablemente ingles, no confirmado) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de DeBERTa-v3-base, un encoder transformer con mecanismos de atención mejorados (attention dispersa y decodificación relativa posicional). Se realizó un fine-tuning supervisado sobre el dataset YelpZip, que contiene reseñas de Yelp con etiquetas proxy basadas en el estado de filtrado de la plataforma: las reseñas marcadas como "recommended" se consideran legítimas, mientras que las "yelp_filtered_suspicious" corresponden a patrones que Yelp ha filtrado como potencialmente falsos. El entrenamiento utilizó 483.363 reseñas para entrenamiento, 60.142 para validación y 60.496 para prueba. No se menciona el uso de RLHF, DPO ni otras técnicas de alineación; se trata de un fine-tuning clásico de clasificación de texto. La innovación principal reside en el uso de proxy labels como ground truth aproximado, un enfoque práctico cuando no se dispone de etiquetas verificadas manualmente.

## Capacidades

- Clasificacion binaria de reseñas: distingue entre "recommended" (reseña legítima según Yelp) y "yelp_filtered_suspicious" (patrón sospechoso filtrado por Yelp).
- Generacion de probabilidades para cada clase, permitiendo ajustar el umbral de decisión según la aplicación.
- No soporta tool calling, function calling, ni capacidades de agente.
- No dispone de capacidades multimodales (visión, audio).
- Capacidad multilingüe no confirmada; el modelo base DeBERTa-v3-base está entrenado principalmente en inglés, por lo que se espera un rendimiento óptimo en reseñas en inglés.
- Compatible con text-embeddings-inference y endpoints de HuggingFace, lo que facilita su despliegue en producción.

## Casos de uso

- Moderacion de reseñas en plataformas de comercio electrónico: el modelo puede integrarse en un pipeline de moderación para priorizar la revisión manual de reseñas que presenten patrones sospechosos, reduciendo la carga de trabajo humano.
- Analisis de reputacion de negocios: una empresa puede analizar las reseñas recibidas en Yelp para identificar posibles campañas de reseñas falsas dirigidas contra su establecimiento, usando el modelo como filtro preliminar.
- Investigacion academica sobre deteccion de fraude: los investigadores pueden utilizar este modelo como baseline para comparar técnicas más avanzadas de detección de reseñas falsas, dado que está disponible públicamente y es reproducible.
- Filtrado de reseñas en marketplaces de segunda mano: plataformas como Wallapop o Vibbo pueden adaptar el modelo para detectar reseñas manipuladas en sus sistemas de valoración de usuarios.
- Auditoria de reseñas para agencias de marketing: agencias que gestionan la reputación online de clientes pueden emplear el modelo para detectar reseñas negativas artificiales y responder adecuadamente.
- Herramientas de analisis de sentimiento con deteccion de spam: el modelo puede combinarse con analizadores de sentimiento para descartar reseñas sospechosas antes de calcular métricas de opinión, mejorando la calidad de los datos.

## Benchmarks y rendimiento

Según la model card, con un umbral de decisión de 0,69 para la clase "yelp_filtered_suspicious", el modelo alcanza las siguientes métricas en el conjunto de prueba:

| Metrica | Valor |
|---|---|
| Accuracy | 0,8057 |
| F1 | 0,4033 |
| ROC AUC | 0,7855 |
| PR AUC | 0,3706 |

No se han publicado comparaciones con otros modelos de detección de reseñas falsas en la información disponible. El F1 bajo (0,4033) indica un desequilibrio entre precisión y recall, probablemente debido a la naturaleza ruidosa de las etiquetas proxy.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,7 GB en fp32 (tamaño del repositorio), unos 0,35 GB en fp16 si se convierte.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM (por ejemplo, GTX 1060, RTX 3060, T4) es suficiente para inferencia. Para entrenamiento o fine-tuning adicional, se recomienda una GPU con 8 GB o más.
- El modelo cabe en GPUs de consumo: sí, en prácticamente cualquier GPU moderna.
- Opciones de despliegue: compatible con transformers pipeline, vLLM, TGI (Text Generation Inference) y text-embeddings-inference, así como con endpoints de HuggingFace.
- Latencia y throughput: no disponibles en la información proporcionada; al ser un modelo de 184M parámetros, la inferencia en CPU es viable (del orden de decenas de milisegundos por ejemplo), pero en GPU será significativamente más rápida.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| sarkarghya/yelp-fake-review-detector | DeBERTa-v3-base | 184M | no disponible | no disponible | HuggingFace |
| varshakashid/yelp-fake-review-detector | DistilBERT | ~67M | no disponible | no disponible | HuggingFace |
| YelpNYC Fake Review Detector (kozmikus) | no especificado | no disponible | no disponible | no disponible | HuggingFace Space |

No se dispone de datos de rendimiento comparativos entre estos modelos. El modelo de varshakashid es más pequeño (DistilBERT) y no tiene model card, mientras que el espacio de kozmikus es una demo interactiva sin especificaciones técnicas publicadas.

## Limitaciones y advertencias

- Las etiquetas proxy de YelpZip no son ground truth verificado; pueden contener errores y no representan necesariamente reseñas fraudulentas reales.
- El F1 de 0,4033 es bajo, lo que implica una alta tasa de falsos positivos o falsos negativos; no es adecuado para decisiones automáticas sin supervisión humana.
- El modelo no debe utilizarse para acusar a personas o negocios de fraude, tal como advierte el autor en la model card.
- La licencia no está especificada, por lo que el uso comercial puede ser problemático; se recomienda contactar al autor antes de integrarlo en productos comerciales.
- El idioma de las reseñas no está confirmado; si se aplica a reseñas en otros idiomas, el rendimiento puede degradarse significativamente.
- No se proporcionan detalles sobre el preprocesamiento de texto ni la longitud máxima de entrada; se asume que sigue las convenciones de DeBERTa-v3-base (512 tokens), pero no está confirmado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sarkarghya/yelp-fake-review-detector
- Repositorio relacionado (no oficial): https://github.com/shrey24/yelp-fake-reviews-detector
- Artículo sobre detección de reseñas falsas (no específico de este modelo): https://knowridge.com/2026/05/new-ai-tool-could-detect-fake-online-reviews-with-93-accuracy-on-amazon-91-on-yelp/
- Espacio de demostración similar: https://huggingface.co/spaces/kozmikus/YelpNYC-Fake-Review-Detector
