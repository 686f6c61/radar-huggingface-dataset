# prachuryyaIITG/CLASSER_Sanskrit_MuRIL

## Resumen

CLASSER_Sanskrit_MuRIL es un modelo de reconocimiento de entidades nombradas (NER) de grano fino, obtenido mediante fine-tuning de MuRIL large cased sobre el dataset CLASSER, específicamente para la lengua sánscrita. El modelo ha sido desarrollado por Prachuryya Kaushik y el profesor Ashish Anand del IIT Guwahati, como parte del ecosistema AWED-PIPER, que integra agentes, aplicaciones web y detectores expertos para NER y protección de datos personales en 36 lenguas.

El modelo utiliza la arquitectura transformer encoder-only de MuRIL, un BERT multilingüe preentrenado en 17 lenguas indias, y se ajusta con el conjunto de etiquetas de MultiCoNER2, que distingue seis categorías gruesas (LOC, CW, GRP, PER, PROD, MED) y múltiples subcategorías finas. Con 504,9 millones de parámetros, ofrece un F1 de 78,30 en el corpus de evaluación, siendo una herramienta relevante para el procesamiento computacional del sánscrito, una lengua clásica con recursos digitales limitados.

Su licencia MIT permite uso comercial sin restricciones, y su formato safetensors facilita la integración en pipelines de Transformers. Es el primer modelo de NER fine-grained específico para sánscrito publicado en Hugging Face, lo que lo convierte en un recurso valioso para la investigación en lingüística computacional y humanidades digitales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-only (MuRIL, similar a BERT large) |
| Parametros totales | 504.926.275 |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible (heredada de MuRIL, típicamente 512 tokens) |
| Tipos de cuantizacion | no disponible (safetensors original en fp32) |
| Idiomas soportados | sa (sánscrito) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de google/muril-large-cased, un transformer encoder-only preentrenado con 24 capas, 16 cabezas de atención y una dimensión oculta de 1024. MuRIL está específicamente diseñado para lenguas indias y soporta el alfabeto devanagari, lo que lo hace adecuado para el sánscrito. El fine-tuning se realizó sobre el dataset CLASSER, que contiene anotaciones de entidades finas en cinco lenguas (asamés, bodo, maratí, nepalí y sánscrito) generadas mediante proyección de anotaciones entre lenguas con refinamiento por similitud de escritura.

El entrenamiento se llevó a cabo con 6 épocas, optimizador AdamW, tasa de aprendizaje de 5e-5, weight decay de 0.01 y batch size de 64. No se menciona el uso de técnicas como RLHF o DPO; es un ajuste supervisado estándar sobre el corpus etiquetado. El tagset sigue la taxonomía de MultiCoNER2, que incluye categorías como Location, Creative Work, Group, Person, Product y Medical, con subcategorías detalladas.

## Capacidades

- Reconocimiento de entidades nombradas de grano fino en sánscrito, con etiquetas jerárquicas (6 categorías principales y 30 subcategorías).
- Clasificación de tokens a nivel de token (token-classification) para identificar personas, lugares, organizaciones, obras creativas, productos y entidades médicas.
- Soporte de texto en escritura devanagari, dado el preentrenamiento de MuRIL en lenguas indias.
- No incluye generación de texto, tool calling, ni capacidades multimodales; es exclusivamente un modelo discriminativo para NER.

## Casos de uso

- Análisis de textos clásicos sánscritos: permite etiquetar automáticamente personajes, lugares y obras en corpus como el Mahabharata o el Ramayana, facilitando estudios literarios e históricos.
- Construcción de bases de datos de entidades: extracción de nombres propios, topónimos y títulos de obras para crear ontologías y grafos de conocimiento del dominio sánscrito.
- Digitalización de manuscritos: integración en pipelines de OCR y post-procesamiento para estructurar contenido extraído de escaneos.
- Investigación en lingüística computacional: uso como referencia para evaluar otros modelos de NER en lenguas de baja disponibilidad de recursos.
- Enriquecimiento de corpus para traducción automática: identificación de entidades que deben conservarse o transliterarse en sistemas de traducción sánscrito-inglés.
- Protección de datos personales (PII): dentro del ecosistema AWED-PIPER, puede emplearse para detectar y anonimizar nombres, lugares y otras entidades en documentos sánscritos digitalizados.

## Benchmarks y rendimiento

El autor reporta las siguientes métricas sobre el conjunto de evaluación de CLASSER:

| Metrica | Valor |
|---|---|
| Precision | 77,62 |
| Recall | 78,99 |
| F1 | 78,30 |

No se han publicado comparativas con otros modelos de NER en sánscrito en la información disponible.

## Requisitos de hardware

- Tamaño del modelo: 504,9 millones de parámetros, aproximadamente 2 GB en fp32 (2.0 GB según el repositorio).
- VRAM estimada para inferencia: con fp16, los pesos ocupan ~1 GB; con cuantización int8 ~0,5 GB. En la práctica, una GPU con 4 GB de VRAM es suficiente para inferencia en lotes pequeños.
- GPU recomendadas: RTX 3060 o superior, o cualquier GPU con al menos 4 GB de VRAM. Para entrenamiento o fine-tuning adicional, se recomienda una GPU con 16 GB o más (A100, RTX 4090).
- Compatible con consumer GPU: sí, cabe en GPUs de gama media.
- Opciones de despliegue: puede cargarse con la librería Transformers de Hugging Face, o servirse mediante vLLM, TGI o ONNX Runtime si se exporta. No se proporcionan pesos GGUF ni soporte nativo para llama.cpp.
- Latencia y throughput: no se han publicado datos específicos, pero al ser un modelo BERT large, la latencia típica para una secuencia de 512 tokens en una GPU moderna es del orden de 10-30 ms por muestra.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables específicos para NER en sánscrito. Alternativas genéricas multilingües como XLM-RoBERTa large o mBERT podrían adaptarse, pero no hay datos de rendimiento comparativo publicados en la información disponible.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente para sánscrito; no funciona con otros idiomas.
- La longitud de contexto está limitada por la arquitectura de MuRIL (típicamente 512 tokens), lo que puede ser insuficiente para documentos largos sin segmentación previa.
- El rendimiento depende de la calidad del dataset CLASSER, que puede contener sesgos hacia ciertos tipos de texto o dominios (por ejemplo, textos religiosos o literarios).
- Riesgo de alucinación en entidades poco frecuentes o ambiguas, especialmente en nombres transliterados o variantes ortográficas.
- No se han publicado análisis de sesgos ni estudios de robustez frente a ruido o errores de OCR.
- Aunque la licencia MIT permite uso comercial, el modelo se distribuye tal cual, sin garantías de precisión en entornos de producción.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/prachuryyaIITG/CLASSER_Sanskrit_MuRIL)
- [Dataset CLASSER](https://huggingface.co/datasets/prachuryyaIITG/CLASSER)
- [Colección CLASSER en Hugging Face](https://huggingface.co/collections/prachuryyaIITG/classer)
- [Paper AWED-PIPER (arXiv)](https://arxiv.org/abs/2601.10161)
- [Repositorio GitHub AWED-PIPER](https://github.com/PrachuryyaKaushik/AWED-PIPER)
- [Repositorio GitHub CLASSER](https://github.com/PrachuryyaKaushik/CLASSER)
- [Web App AWED-FiNER](https://huggingface.co/spaces/prachuryyaIITG/AWED-FiNER)
- [Web App AWED-PII Protector](https://huggingface.co/spaces/prachuryyaIITG/AWED_PII_Protector)
- [Paper CLASSER (ACL Anthology)](https://aclanthology.org/2025.ijcnlp-long.94/)
