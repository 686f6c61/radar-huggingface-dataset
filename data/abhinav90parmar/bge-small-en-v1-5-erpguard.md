# abhinav90parmar/bge-small-en-v1.5-erpguard

## Resumen

El modelo `abhinav90parmar/bge-small-en-v1.5-erpguard` es un ajuste fino (fine-tuning) del modelo de embeddings `BAAI/bge-small-en-v1.5` orientado a la recuperación de información en entornos industriales de mantenimiento y gestión de recursos empresariales (ERP). Desarrollado por el usuario abhinav90parmar, el modelo está entrenado con un conjunto de datos de 480 ejemplos etiquetados mediante la pérdida `MultipleNegativesRankingLoss`, lo que permite generar representaciones vectoriales de frases para búsquedas semánticas en dominios específicos como logs de mantenimiento, manuales de piezas y procedimientos operativos estándar (SOP).

Con una arquitectura basada en BERT (33,36 millones de parámetros), el modelo es compacto y eficiente, adecuado para despliegues en entornos con recursos limitados. Su relevancia actual radica en la necesidad de sistemas de búsqueda semántica especializados en documentación técnica industrial, donde los modelos genéricos suelen fallar por falta de vocabulario específico. La licencia MIT permite su uso comercial sin restricciones significativas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (encoder transformer) |
| Parametros totales | 33.360.000 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo base BAAI/bge-small-en-v1.5 soporta 512 tokens, pero no se confirma en la ficha) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles (el modelo base está entrenado principalmente en inglés) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura BERT, específicamente en el checkpoint `BAAI/bge-small-en-v1.5`, que es un modelo de embeddings de frases de tamaño reducido (33M parámetros). El ajuste fino se realizó con la librería `sentence-transformers` utilizando la pérdida `MultipleNegativesRankingLoss`, una técnica estándar para entrenar modelos de similitud semántica con pares positivos y negativos. El conjunto de datos de entrenamiento consta de 480 ejemplos, todos ellos relacionados con documentación de mantenimiento industrial: logs de intervenciones correctivas y preventivas, manuales de piezas de repuesto y procedimientos operativos (SOP). No se dispone de información sobre el número de tokens de entrenamiento, la composición exacta del dataset ni el uso de técnicas adicionales como RLHF o DPO. La innovación principal reside en la especialización del modelo en un vocabulario técnico de mantenimiento, lo que mejora la precisión de recuperación en ese dominio frente al modelo base genérico.

## Capacidades

- Generacion de embeddings de frases para similitud semántica y recuperación de información.
- Búsqueda por similitud coseno en corpus de documentos técnicos (logs, manuales, SOP).
- Recuperación de pasajes relevantes ante consultas en lenguaje natural sobre mantenimiento industrial.
- Soporte para integración en pipelines de retrieval-augmented generation (RAG) mediante `sentence-transformers`.
- Compatible con la infraestructura de Hugging Face Text Embeddings Inference (TEI) y endpoints de inferencia.
- Multilingüe: no confirmado; el modelo base está orientado al inglés, por lo que se asume que el fine-tuning mantiene ese idioma.

## Casos de uso

- Búsqueda en logs de mantenimiento: un técnico puede consultar "¿qué pieza se consumió al resolver el problema de cierre del molde?" y el modelo recupera el log correcto con el número de pieza y los detalles de la intervención.
- Asistente para técnicos de planta: integrado en un chatbot, permite responder preguntas sobre procedimientos de mantenimiento consultando manuales y SOPs de forma semántica.
- Recuperación de manuales de piezas: al buscar "repuesto para la cinta transportadora CV-120", el modelo devuelve el manual de referencia con los números de pieza adecuados.
- Verificación de cumplimiento de procedimientos: consultas sobre formularios o registros requeridos tras una tarea (p. ej., "¿qué formulario hay que rellenar tras el ajuste de la correa?") recuperan la sección de documentación del SOP.
- Indexación de documentación técnica: permite construir un índice semántico de toda la documentación de mantenimiento de una planta para búsquedas rápidas y precisas.
- Soporte a sistemas RAG en entornos industriales: el modelo puede servir como componente de retrieval en un pipeline de generación aumentada por recuperación para responder preguntas complejas sobre operaciones de mantenimiento.
- Clasificación de tickets de mantenimiento: mediante la similitud de embeddings, se pueden agrupar o priorizar tickets según su contenido técnico.

## Benchmarks y rendimiento

El autor declara los siguientes resultados en el modelo-index (no verificados de forma independiente) sobre un conjunto de validación (`val`) para la tarea de recuperación de información:

| Metrica | Valor |
|---|---|
| Cosine Accuracy@1 | 0.5593 |
| Cosine Accuracy@3 | 0.8305 |
| Cosine Accuracy@5 | 0.9153 |
| Cosine Precision@1 | 0.5593 |
| Cosine Precision@3 | 0.2768 |
| Cosine Precision@5 | 0.1831 |
| Cosine Precision@10 | 0.0958 |
| Cosine Recall@1 | 0.5593 |
| Cosine Recall@3 | 0.8305 |
| Cosine Recall@5 | 0.9153 |
| Cosine Recall@10 | 0.9576 |
| Cosine Ndcg@5 | 0.7484 |

No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB en FP32 (33M parámetros ≈ 133 MB en FP32); con cuantización a 8 bits, alrededor de 70 MB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; también funciona en CPU sin problemas.
- Compatible con GPUs de consumo como RTX 3060, RTX 4090, o incluso integradas.
- Opciones de despliegue: `sentence-transformers`, Hugging Face Text Embeddings Inference (TEI), `ollama` (si se convierte a formato GGUF), `llama.cpp` (con conversión previa), o servicios de endpoints compatibles.
- Latencia y throughput: al ser un modelo pequeño, la latencia típica en CPU es del orden de milisegundos por frase; en GPU, sub-milisegundos. No se proporcionan datos exactos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Uso principal |
|---|---|---|---|---|
| BAAI/bge-small-en-v1.5 (base) | 33M | 512 | MIT | Embeddings genéricos en inglés |
| abhinav90parmar/bge-small-en-v1.5-erpguard | 33M | no disponible | MIT | Embeddings especializados en mantenimiento industrial |
| sentence-transformers/all-MiniLM-L6-v2 | 22M | 256 | Apache-2.0 | Embeddings genéricos multilingües |

No se dispone de datos de rendimiento comparativo entre estos modelos en el dominio específico de mantenimiento. El modelo ERPGuard se diferencia por su ajuste fino en un corpus técnico, lo que debería mejorar la precisión de recuperación en ese ámbito, aunque no se han publicado métricas comparativas.

## Limitaciones y advertencias

- El modelo se entrenó con un dataset muy reducido (480 ejemplos), lo que puede limitar su generalización a otros dominios o variaciones del lenguaje técnico.
- No se ha verificado su rendimiento en otros idiomas; se asume que solo funciona bien en inglés.
- Riesgo de alucinación en tareas de generación si se usa como parte de un sistema RAG: los embeddings pueden recuperar pasajes irrelevantes si la consulta está fuera del dominio de entrenamiento.
- No se han documentado sesgos específicos, pero al ser un modelo derivado de BERT, puede heredar sesgos presentes en sus datos de preentrenamiento.
- La licencia MIT permite uso comercial, pero el autor no ofrece garantías sobre la exactitud de las respuestas en entornos de producción crítica.
- No se proporcionan detalles sobre el preprocesamiento de datos ni la metodología de evaluación, por lo que los resultados de benchmark deben interpretarse con cautela.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/abhinav90parmar/bge-small-en-v1.5-erpguard)
- [Modelo base BAAI/bge-small-en-v1.5](https://huggingface.co/BAAI/bge-small-en-v1.5)
- [Paper de BERT (arxiv:1908.10084)](https://arxiv.org/abs/1908.10084)
- [Paper de Sentence-BERT (arxiv:1807.03748)](https://arxiv.org/abs/1807.03748)
- [Documentación de sentence-transformers](https://www.sbert.net/)
