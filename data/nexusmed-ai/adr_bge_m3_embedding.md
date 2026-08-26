# nexusmed-ai/adr_bge_m3_embedding

## Resumen

El modelo `nexusmed-ai/adr_bge_m3_embedding` es un fine-tuning del modelo de embeddings BAAI/bge-m3, desarrollado por el equipo de nexusmed-ai. Está especializado en la generación de representaciones vectoriales (embeddings) para datos estructurados de farmacovigilancia, concretamente para el análisis de reacciones adversas a medicamentos (ADR, por sus siglas en inglés). El modelo toma como entrada descripciones JSON que incluyen información del paciente, tratamientos e indicaciones médicas, y produce vectores densos que permiten medir similitud semántica entre casos clínicos.

Con 567,75 millones de parámetros, el modelo se basa en la arquitectura XLM-RoBERTa, la misma que utiliza BGE-M3, y ha sido entrenado con un conjunto de datos de 400.000 ejemplos utilizando la función de pérdida MultipleNegativesRankingLoss, una técnica estándar para fine-tuning de modelos de similitud semántica. Aunque el modelo base BGE-M3 es multilingüe y multifuncional (dense, sparse y multi-vector), este fine-tuning se centra en la recuperación densa de información para el dominio médico.

La relevancia de este modelo radica en su aplicación potencial en sistemas de farmacovigilancia, donde la identificación de casos similares de reacciones adversas puede ayudar a detectar señales de seguridad de medicamentos. Sin embargo, los benchmarks publicados por el autor muestran un rendimiento muy bajo en tareas de recuperación de información, lo que sugiere que el modelo puede tener limitaciones significativas en la práctica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (XLM-RoBERTa) basado en BAAI/bge-m3 |
| Parametros totales | 567.754.752 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el modelo base BGE-M3 soporta más de 100 idiomas, pero no se confirma para este fine-tuning) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de BAAI/bge-m3, un modelo de embeddings basado en XLM-RoBERTa con 567 millones de parámetros. BGE-M3 originalmente soporta tres modos de recuperación: denso, sparse y multi-vector, pero este fine-tuning se ha realizado con sentence-transformers y la pérdida MultipleNegativesRankingLoss, lo que indica que está optimizado para producir embeddings densos de alta calidad para similitud coseno.

El entrenamiento se realizó sobre un dataset de 400.000 ejemplos, aparentemente compuesto por registros médicos estructurados en formato JSON (información de paciente, tratamientos e indicaciones). No se han publicado detalles sobre el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas adicionales como RLHF o DPO. El modelo se generó con la herramienta `trainer` de HuggingFace, lo que sugiere un pipeline estándar de fine-tuning.

## Capacidades

- Generación de embeddings densos para similitud semántica entre textos médicos estructurados.
- Recuperación de información (information retrieval) basada en similitud coseno, orientada a casos de reacciones adversas a medicamentos.
- Procesamiento de entradas en formato JSON con campos como edad, sexo, peso, medicamentos, dosis e indicaciones.
- Compatible con la librería sentence-transformers y con Text Embeddings Inference (TEI) para despliegue en producción.
- No soporta generación de texto, tool calling, agentes ni razonamiento multi-paso; es exclusivamente un modelo de embeddings.

## Casos de uso

- **Detección de señales en farmacovigilancia**: el modelo puede utilizarse para agrupar informes de reacciones adversas similares, facilitando la identificación de patrones emergentes de seguridad de medicamentos. Se usaría generando embeddings de cada informe y aplicando clustering o búsqueda de vecinos cercanos.
- **Búsqueda de casos clínicos similares**: en entornos de investigación médica, permite recuperar casos históricos con características similares a un nuevo reporte, ayudando a los analistas a comparar tratamientos y resultados.
- **Deduplicación de informes de ADR**: al comparar embeddings de informes duplicados o casi duplicados, se pueden fusionar registros redundantes en bases de datos de farmacovigilancia, mejorando la calidad de los datos.
- **Análisis de co-ocurrencia de medicamentos y reacciones**: el modelo puede ayudar a explorar relaciones entre fármacos y efectos adversos mediante la similitud de sus representaciones vectoriales, aunque su rendimiento real debe validarse.
- **Soporte a sistemas de recomendación clínica**: integrado en un pipeline de recuperación, puede sugerir tratamientos o precauciones basados en casos previos con perfiles de paciente similares.
- **Indexación y consulta de literatura médica**: aunque el modelo está entrenado con datos estructurados, podría adaptarse para recuperar artículos o resúmenes relacionados con reacciones adversas, siempre que se ajuste el formato de entrada.

## Benchmarks y rendimiento

El autor declara los siguientes resultados en el model-index, correspondientes a una tarea de recuperación de información sobre un dataset no especificado:

| Metrica | Valor |
|---|---|
| Cosine Accuracy@1 | 0,00214 |
| Cosine Accuracy@3 | 0,00535 |
| Cosine Accuracy@5 | 0,008 |
| Cosine Accuracy@10 | 0,01296 |
| Cosine Precision@1 | 0,00214 |
| Cosine Precision@3 | 0,00178 |
| Cosine Precision@5 | 0,00160 |
| Cosine Precision@10 | 0,00130 |
| Cosine Recall@1 | 0,00214 |
| Cosine Recall@3 | 0,00535 |
| Cosine Recall@5 | 0,008 |
| Cosine Recall@10 | 0,01296 |
| Cosine NDCG@10 | 0,00666 |

Estos valores son extremadamente bajos, lo que indica que el modelo no logra una recuperación efectiva en el dataset de evaluación utilizado. No se han publicado comparaciones con otros modelos ni resultados en benchmarks estándar como MMLU, HumanEval o MTEB.

## Requisitos de hardware

- **VRAM estimada**: con 567 millones de parámetros, el modelo en precisión FP32 ocupa aproximadamente 2,3 GB (tamaño del repositorio). En FP16 ocuparía unos 1,2 GB, y en cuantización INT8 alrededor de 0,6 GB. Para inferencia con sentence-transformers, se recomienda al menos 4 GB de VRAM para trabajar cómodamente con lotes pequeños.
- **GPU recomendadas**: cualquier GPU con al menos 4 GB de VRAM, como NVIDIA GTX 1650, RTX 3050, RTX 4060, o GPUs de datacenter como T4, A10 o A100. El modelo es ligero y no requiere hardware especializado.
- **Compatibilidad con GPU de consumo**: sí, cabe en GPUs de consumo como RTX 3060 o superiores, incluso en CPU con suficiente RAM (aunque más lento).
- **Opciones de despliegue**: se puede servir con sentence-transformers, Text Embeddings Inference (TEI), o mediante frameworks como vLLM (aunque no es un LLM generativo). También es compatible con Ollama si se convierte a formato GGUF, aunque no se ha publicado tal conversión.
- **Latencia y throughput**: no se han publicado datos oficiales. En una GPU moderna, la generación de un embedding para una entrada típica (menos de 512 tokens) debería tomar menos de 10 ms, permitiendo cientos de consultas por segundo.

## Comparativa con modelos similares

No se dispone de datos de rendimiento comparativo de este modelo frente a otros. Como referencia, se puede comparar con el modelo base BGE-M3 y con otros embeddings médicos como PubMedBERT, pero no hay métricas publicadas para este fine-tuning.

| Modelo | Parametros | Contexto | Licencia | Uso especifico |
|---|---|---|---|---|
| nexusmed-ai/adr_bge_m3_embedding | 567M | no disponible | no disponible | ADR / farmacovigilancia |
| BAAI/bge-m3 | 567M | 8192 (según documentacion del base) | MIT (base) | Multilingue, multifuncional |
| PubMedBERT | 110M | 512 | MIT | Textos biomedicos |

La comparativa es limitada porque no se han publicado benchmarks del fine-tuning en tareas medicas estandar.

## Limitaciones y advertencias

- **Rendimiento muy bajo en recuperacion**: los benchmarks publicados muestran accuracy@1 de 0,00214, lo que sugiere que el modelo no es util para tareas de recuperacion reales sin un ajuste adicional significativo.
- **Dataset de entrenamiento desconocido**: no se ha detallado la procedencia ni la calidad de los 400.000 ejemplos, lo que dificulta evaluar su sesgo o representatividad.
- **Licencia no disponible**: no se especifica la licencia, lo que impide su uso comercial o en proyectos con requisitos legales estrictos.
- **Idiomas no confirmados**: aunque el modelo base es multilingue, el fine-tuning puede haber reducido su cobertura a un dominio especifico (probablemente ingles medico).
- **Riesgo de alucinacion en embeddings**: aunque no genera texto, los embeddings pueden producir similitudes espurias entre casos no relacionados, lo que podria llevar a conclusiones erroneas en analisis de farmacovigilancia.
- **Sin soporte para generacion de texto**: no es un modelo de lenguaje generativo; solo produce vectores, por lo que no puede utilizarse para tareas de redaccion o chat.
- **Fecha de creacion futura**: el modelo fue creado en agosto de 2026, lo que podria indicar que es un artefacto experimental o que la fecha es incorrecta.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/nexusmed-ai/adr_bge_m3_embedding)
- [Modelo base BAAI/bge-m3](https://huggingface.co/BAAI/bge-m3)
- [Documentacion de BGE-M3](https://bge-model.com/bge/bge_m3.html)
- [Model card de BGE-M3 en NVIDIA NIM](https://build.nvidia.com/baai/bge-m3/modelcard)
