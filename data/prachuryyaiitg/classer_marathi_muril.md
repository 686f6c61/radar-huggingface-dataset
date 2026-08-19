# prachuryyaIITG/CLASSER_Marathi_MuRIL

## Resumen

CLASSER_Marathi_MuRIL es un modelo de reconocimiento de entidades nombradas (NER) de grano fino para el idioma maratí, desarrollado por Prachuryya Kaushik y el profesor Ashish Anand del IIT Guwahati. Se basa en el modelo multilingüe MuRIL-large-cased de Google, diseñado específicamente para lenguas de la India, y se ajusta mediante fine-tuning con el dataset CLASSER, un recurso creado mediante proyección cross-lingual de anotaciones con refinamiento por similitud de escritura. El modelo clasifica tokens en un conjunto de 30 etiquetas finas derivadas de MultiCoNER2, que se agrupan en seis categorías gruesas: ubicación, obra creativa, grupo, persona, producto y médico.

Con 504,9 millones de parámetros, este modelo es parte del ecosistema AWED-PIPER, que incluye agentes y aplicaciones web para NER de grano fino y protección de datos personales (PII). Su relevancia radica en abordar una lengua de bajos recursos como el maratí, ofreciendo una precisión y exhaustividad competitivas para tareas de extracción de información en contextos reales. El modelo se distribuye bajo licencia MIT, lo que facilita su integración en proyectos comerciales y de investigación.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (BERT, variante MuRIL-large-cased) |
| Parametros totales | 504.926.275 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (heredado de MuRIL-large, 512 tokens) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Maratí (mr) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se construye sobre MuRIL-large-cased, un transformer basado en la arquitectura BERT con 24 capas, 1024 dimensiones ocultas y 16 cabezas de atención, preentrenado en 17 lenguas indias y sus transliteraciones. Para esta tarea, se realiza un fine-tuning completo sobre el dataset CLASSER, que contiene anotaciones de NER de grano fino en maratí. El entrenamiento utiliza el optimizador AdamW con una tasa de aprendizaje de 5e-5, weight decay de 0.01, tamaño de lote de 64 y 6 épocas. La innovación principal proviene del framework CLASSER, que mejora la proyección de anotaciones cross-lingual mediante la similitud de escrituras, permitiendo generar datos de alta calidad para lenguas con pocos recursos. No se emplean técnicas de RLHF ni DPO; el ajuste es supervisado exclusivamente sobre el dataset de NER.

## Capacidades

- Reconocimiento de entidades nombradas de grano fino en maratí, con 30 etiquetas finas (p. ej., Scientist, Politician, Medication/Vaccine, Facility) mapeadas a 6 categorías gruesas (LOC, CW, GRP, PER, PROD, MED).
- Clasificación de tokens a nivel de palabra, adecuada para extraer entidades en textos narrativos, noticias, documentos legales y redes sociales.
- Soporte para el pipeline de token-classification de Hugging Face, lo que permite su uso directo con la librería transformers.
- Capacidad de procesar textos en escritura devanagari, gracias al preentrenamiento de MuRIL en dicha escritura.
- No dispone de capacidades de generación de texto, tool calling, agentes ni razonamiento multi-paso; su función se limita a la etiquetación secuencial.

## Casos de uso

- Extracción de entidades en artículos periodísticos en maratí: el modelo identifica personas, organizaciones, lugares y obras creativas, facilitando la indexación y el análisis de contenido informativo.
- Análisis de redes sociales y comentarios: permite detectar menciones a productos, enfermedades o figuras públicas en publicaciones de plataformas como Twitter o Facebook, útil para monitorización de marca y salud pública.
- Procesamiento de documentos legales y administrativos: extrae nombres de partes, instituciones y ubicaciones en contratos o expedientes redactados en maratí, agilizando tareas de gestión documental.
- Anonimización de datos personales (PII): al identificar entidades como personas, organizaciones y ubicaciones, puede integrarse en pipelines de protección de privacidad, como el agente AWED-PII-Protector, para enmascarar información sensible.
- Investigación en lingüística computacional: sirve como referencia para evaluar técnicas de NER en lenguas indias de bajos recursos y comparar con otros modelos multilingües.
- Construcción de bases de conocimiento: alimenta sistemas de extracción de relaciones y grafos de conocimiento a partir de corpus en maratí, enriqueciendo recursos semánticos para esta lengua.

## Benchmarks y rendimiento

La model card reporta las siguientes métricas obtenidas en el conjunto de evaluación del dataset CLASSER:

| Metrica | Valor |
|---|---|
| Precision | 79.24 |
| Recall | 81.00 |
| F1 | 80.11 |

No se han publicado comparaciones con otros modelos en la información disponible. Estos resultados corresponden al ajuste fino sobre el dataset CLASSER y no se dispone de evaluaciones externas adicionales.

## Requisitos de hardware

- VRAM estimada: el modelo tiene 504,9 millones de parámetros. En FP32 ocupa aproximadamente 2,0 GB, por lo que se recomienda al menos 3 GB de VRAM para inferencia cómoda. En FP16, el uso se reduce a ~1 GB.
- GPU recomendadas: tarjetas de gama media como NVIDIA T4, RTX 3060, RTX 4070 o superiores. También puede ejecutarse en CPU, aunque con mayor latencia.
- Compatibilidad con GPU de consumo: sí, cabe en GPUs con 4 GB o más de VRAM, como la RTX 3050 o la GTX 1660 Super.
- Opciones de despliegue: se puede utilizar mediante la librería transformers de Hugging Face, tanto en Python como en entornos de producción con servidores de inferencia como FastAPI o TorchServe. No se mencionan integraciones específicas con vLLM, llama.cpp u Ollama, pero al ser un modelo BERT, puede servirse con cualquier framework que soporte transformers.
- Latencia y throughput: no se dispone de datos medidos. En una GPU T4, se espera un tiempo de inferencia de decenas de milisegundos por secuencia de 128 tokens, dependiendo del lote.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables específicos para NER de grano fino en maratí. Alternativas genéricas como XLM-RoBERTa o mBERT podrían ajustarse para esta tarea, pero no se han publicado comparaciones directas con CLASSER_Marathi_MuRIL. Por tanto, esta sección queda sin datos concretos.

## Limitaciones y advertencias

- El modelo está entrenado únicamente para maratí; no soporta otros idiomas ni transliteraciones fuera de su dominio.
- La longitud de contexto está limitada a 512 tokens (heredada de MuRIL-large), por lo que textos más largos deben truncarse o dividirse en fragmentos.
- Al ser un modelo de NER, puede presentar errores de etiquetado en entidades ambiguas o poco frecuentes, especialmente en dominios especializados no cubiertos por el dataset de entrenamiento.
- No se han documentado sesgos específicos, pero al entrenarse con datos de un corpus limitado, puede reflejar sesgos presentes en las fuentes originales (p. ej., sobrerrepresentación de ciertos tipos de entidades).
- La licencia MIT permite uso comercial, pero el modelo no incluye garantías de precisión en entornos de producción; se recomienda validar su rendimiento en el dominio objetivo.
- No se proporcionan cuantizaciones oficiales; el despliegue en dispositivos con recursos limitados requerirá cuantización manual mediante herramientas como ONNX o TensorRT.

## Enlaces

- [Hugging Face - CLASSER_Marathi_MuRIL](https://huggingface.co/prachuryyaIITG/CLASSER_Marathi_MuRIL)
- [Dataset CLASSER](https://huggingface.co/datasets/prachuryyaIITG/CLASSER)
- [Paper AWED-PIPER (arXiv)](https://arxiv.org/abs/2601.10161)
- [Repositorio GitHub AWED-PIPER](https://github.com/PrachuryyaKaushik/AWED-PIPER)
- [Repositorio GitHub CLASSER](https://github.com/PrachuryyaKaushik/CLASSER)
- [Web app AWED-FiNER](https://huggingface.co/spaces/prachuryyaIITG/AWED-FiNER)
- [Web app AWED-PII-Protector](https://huggingface.co/spaces/prachuryyaIITG/AWED_PII_Protector)
- [Paper CLASSER (ACL Anthology)](https://aclanthology.org/2025.ijcnlp-long.94/)
