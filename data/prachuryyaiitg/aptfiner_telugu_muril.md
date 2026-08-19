# prachuryyaIITG/APTFiNER_Telugu_MuRIL

## Resumen

APTFiNER_Telugu_MuRIL es un modelo de reconocimiento de entidades nombradas (NER) de grano fino, desarrollado por el equipo del IIT Guwahati (Prachuryya Kaushik y colaboradores) como parte del ecosistema AWED-PIPER. Se trata de un fine-tuning del modelo multilingüe MuRIL-large-cased (Google) sobre el dataset APTFiNER, específicamente para la lengua telugu. El modelo clasifica tokens en seis categorías gruesas (LOC, CW, GRP, PER, PROD, MED) con 33 subcategorías finas, siguiendo el tagset de MultiCoNER2.

El modelo resuelve el problema de la escasez de recursos NER de grano fino en lenguas indias de bajos recursos, ofreciendo una precisión del 75,72%, recall del 77,26% y F1 de 76,52. Su relevancia radica en que supera en un 8% al estado del arte anterior en telugu, y forma parte de un ecosistema más amplio que incluye agentes y aplicaciones web para protección de datos personales y extracción de entidades en 36 lenguas. Con 504,9 millones de parámetros, es un modelo transformer encoder-only basado en la arquitectura BERT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT-style), MuRIL-large-cased |
| Parametros totales | 504.926.275 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors) |
| Idiomas soportados | telugu (te) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de MuRIL-large-cased, un transformer encoder de 24 capas, 16 cabezas de atención y dimensión de embedding 1024, preentrenado específicamente para lenguas indias. El fine-tuning se realiza sobre el dataset APTFiNER, que contiene más de 411.000 frases, 697.000 menciones de entidades y 5,8 millones de tokens en seis lenguas indias de bajos recursos. APTFiNER se construyó mediante un método de traducción que preserva las anotaciones, utilizando el modelo Gemini para traducir los datos de entrenamiento manteniendo las etiquetas NER.

El entrenamiento se llevó a cabo durante 6 épocas con el optimizador AdamW, una tasa de aprendizaje de 5e-5, weight decay de 0,01 y tamaño de lote de 64. No se mencionan técnicas adicionales como RLHF o DPO; se trata de un fine-tuning supervisado clásico sobre una tarea de clasificación de tokens.

## Capacidades

- Clasificacion de tokens para NER de grano fino en telugu, con 33 etiquetas finas agrupadas en 6 categorias: Location, Creative Work, Group, Person, Product y Medical.
- Soporte para el tagset completo de MultiCoNER2, incluyendo subcategorias como Facility, HumanSettlement, VisualWork, MusicalGRP, PublicCORP, Scientist, Athlete, Medication/Vaccine, Disease, entre otras.
- Generacion de resultados con precision, recall y F1 reportados (75,72 / 77,26 / 76,52).
- Integracion con el ecosistema AWED-FiNER, que permite usar el modelo como herramienta en agentes conversacionales mediante la clase `AWEDFiNERTool` (basada en smolagents y gradio_client).
- Compatibilidad con la libreria transformers de Hugging Face, con pipeline de token-classification.
- No soporta tool calling, generacion de texto libre ni razonamiento multi-paso; es un modelo discriminativo puro para etiquetado secuencial.

## Casos de uso

- Extraccion de entidades en textos periodisticos en telugu: el modelo puede identificar personas, organizaciones, lugares y productos en noticias, facilitando la indexacion y el analisis de contenido.
- Procesamiento de historiales clinicos en telugu: la categoria Medical incluye sintomas, enfermedades, medicamentos y procedimientos, lo que permite estructurar informacion sanitaria no normalizada.
- Analisis de redes sociales y comentarios: deteccion de menciones a politicos, artistas, deportistas y corporaciones en publicaciones en telugu, util para monitorizacion de marca o analisis de opinion.
- Construccion de grafos de conocimiento para lenguas indias: las entidades extraidas pueden alimentar bases de conocimiento especificas del dominio, aprovechando las 33 subcategorias finas.
- Proteccion de datos personales (PII): dentro del ecosistema AWED-PIPER, el modelo puede combinarse con detectores de PII para anonimizar documentos en telugu, identificando nombres, organizaciones y ubicaciones.
- Enriquecimiento de corpus para entrenamiento de modelos generativos: las anotaciones de entidades generadas pueden servir como datos de supervision para otros modelos de comprension del lenguaje en telugu.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks comparativos en la informacion disponible, pero el modelo reporta las siguientes metricas en el dataset de evaluacion APTFiNER:

| Metrica | Valor |
|---|---|
| Precision | 75,72 |
| Recall | 77,26 |
| F1 | 76,52 |

Segun el articulo de LREC 2026, el fine-tuning sobre APTFiNER produce una mejora del 8% en F1 respecto al estado del arte anterior en telugu. No se proporcionan resultados de MMLU, HumanEval u otros benchmarks genericos.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 504,9 millones de parametros. En precision fp32, los pesos ocupan aproximadamente 2,0 GB; en fp16, unos 1,0 GB. La inferencia con un lote pequeno requiere entre 2 y 4 GB de VRAM adicional para activaciones y logits.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente para inferencia en lote pequeno. Tarjetas como RTX 3060, RTX 4060 o superiores funcionan sin problemas. Para entrenamiento o fine-tuning adicional, se recomienda una GPU con 16 GB o mas (A100, H100, RTX 4090).
- Si cabe en consumer GPU: si, en tarjetas de gama media con 8 GB o mas, especialmente con cuantizacion a int8 o fp16.
- Opciones de despliegue: al ser un modelo de transformers, puede servirse con la pipeline de Hugging Face, o mediante servidores de inferencia como TGI (Text Generation Inference) o vLLM (aunque estos ultimos estan optimizados para modelos generativos, no para clasificacion de tokens). Tambien se puede exportar a ONNX para inferencia en CPU.
- Latencia y throughput estimados: no disponibles. Dependen del hardware y del tamaño del lote.

## Comparativa con modelos similares

No se dispone de datos comparativos publicados en la informacion proporcionada. El modelo se basa en MuRIL-large-cased, que ya es un modelo especifico para lenguas indias. Alternativas teoricas serian mBERT, XLM-R-large o modelos NER genericos multilingues, pero no hay metricas comparables en el dataset APTFiNER disponibles en la documentacion consultada.

## Limitaciones y advertencias

- El modelo esta entrenado exclusivamente para telugu; no funciona en otras lenguas aunque el tokenizador de MuRIL soporte muchas lenguas indias.
- El dataset APTFiNER se construyo mediante traduccion automatica con Gemini, lo que puede introducir errores de anotacion o sesgos en las entidades traducidas. Aunque se realizaron evaluaciones humanas, no se garantiza una cobertura perfecta.
- Riesgo de alucinacion en entidades no vistas o contextos ruidosos: como cualquier modelo NER, puede clasificar incorrectamente tokens ambiguos o fuera de distribucion.
- No se han evaluado sesgos de genero, raza o religion especificos en el contexto telugu; el modelo podria reflejar sesgos presentes en los datos de entrenamiento originales de MuRIL.
- La licencia MIT permite uso comercial, pero el dataset APTFiNER puede tener restricciones adicionales (no se detalla en la informacion disponible).
- Para produccion, se recomienda validar el rendimiento en el dominio especifico antes de desplegar, ya que las metricas reportadas corresponden a un conjunto de evaluacion concreto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/prachuryyaIITG/APTFiNER_Telugu_MuRIL
- Coleccion APTFiNER: https://huggingface.co/collections/prachuryyaIITG/aptfiner
- Dataset APTFiNER: https://huggingface.co/datasets/prachuryyaIITG/APTFiNER
- Paper LREC 2026 (PDF): http://www.lrec-conf.org/proceedings/lrec2026/pdf/2026.lrec2026-1.608.pdf
- Paper arXiv (AWED-PIPER): https://arxiv.org/html/2601.10161v3
- Repositorio GitHub APTFiNER: https://github.com/PrachuryyaKaushik/APTFiNER
- Repositorio GitHub AWED-PIPER: https://github.com/PrachuryyaKaushik/AWED-PIPER
- Agente AWED-FiNER: https://github.com/PrachuryyaKaushik/AWED-FiNER
- Web app AWED-FiNER: https://huggingface.co/spaces/prachuryyaIITG/AWED-FiNER
- Web app AWED-PII Protector: https://huggingface.co/spaces/prachuryyaIITG/AWED_PII_Protector
