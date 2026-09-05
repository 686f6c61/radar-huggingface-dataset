# Ayushi054/CourtInsight-BNS-Encoder

## Resumen

CourtInsight BNS Encoder es un modelo de embeddings semánticos desarrollado por Ayushi054 para el sistema de recuperación de información legal CourtInsight. Está especializado en el Bharatiya Nyaya Sanhita (BNS) de 2023, el código penal de la India, y tiene como objetivo recuperar las disposiciones relevantes de dicho código a partir de descripciones en lenguaje natural de situaciones legales. El modelo no utiliza coincidencia de palabras clave ni mapeos manuales de secciones; se basa exclusivamente en similitud semántica.

Se construye sobre `nomic-ai/nomic-embed-text-v1.5` y contiene 136.731.648 parámetros. Su longitud máxima de secuencia durante el entrenamiento es de 512 tokens. El entrenamiento se realizó con 10.545 tripletas (consulta, positivo, negativo) derivadas de un dataset estructurado que cubre 358 secciones del BNS, usando pérdida TripletLoss con distancia coseno. La relevancia del modelo radica en facilitar la búsqueda semántica y el RAG sobre la legislación india moderna, sustituyendo los enfoques tradicionales de recuperación por palabras clave.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (Nomic BERT, basado en nomic-embed-text-v1.5) |
| Parámetros totales | 136.731.648 |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | 512 tokens (configuración de entrenamiento) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un encoder de tipo transformer basado en `nomic-ai/nomic-embed-text-v1.5`, un modelo de embeddings de texto de Nomic AI. La arquitectura subyacente es un BERT modificado con atención estándar, sin componentes MoE ni SSM. El entrenamiento se realizó con la librería Sentence Transformers utilizando TripletLoss con distancia coseno y margen 0.5. Se aplicó minería de hard negatives semánticos usando el modelo base Nomic para seleccionar ejemplos negativos difíciles.

El dataset de entrenamiento (V3) contenía 10.545 tripletas (consulta, positivo, negativo) construidas a partir de un corpus estructurado que cubre 358 secciones del BNS 2023. Cada sección incluye número, título, texto operativo, explicación, ilustración, elementos legales y resúmenes de elementos. El entrenamiento se ejecutó durante 5 épocas con un batch efectivo de 16, learning rate 2e-5 y precisión FP16. No se menciona el uso de RLHF ni DPO.

## Capacidades

- Generación de embeddings semánticos para frases y documentos legales en inglés.
- Recuperación de disposiciones del BNS 2023 a partir de consultas en lenguaje natural.
- Búsqueda semántica y similitud de oraciones (pipeline `sentence-similarity`).
- Compatibilidad con sistemas de recuperación aumentada por generación (RAG).
- Uso de prefijos `search_query:` y `search_document:` para diferenciar consultas y documentos.
- Integración con Sentence Transformers para generar embeddings normalizados.
- No es un modelo generativo: no produce texto, solo representaciones vectoriales.
- No soporta tool calling, agentes, visión ni audio.
- Solo opera en inglés; no es multilingüe.

## Casos de uso

- Búsqueda semántica en el BNS 2023: un usuario describe una situación legal ("una persona utiliza a sabiendas un documento falsificado") y el modelo devuelve las secciones más relevantes del código. Adecuado porque fue entrenado específicamente para mapear descripciones en lenguaje natural a disposiciones del BNS.
- Recuperación aumentada por generación (RAG) para asistentes legales: integrar el modelo como componente de recuperación en un pipeline RAG que genera respuestas basadas en las disposiciones recuperadas. El modelo produce embeddings normalizados que pueden indexarse en bases vectoriales.
- Educación legal e investigación: estudiantes e investigadores pueden buscar disposiciones del BNS describiendo conceptos o situaciones, sin necesidad de conocer el número de sección, lo que facilita el aprendizaje por consultas en lenguaje natural.
- Interfaces de búsqueda en lenguaje natural para portales legales: sustituir la búsqueda por palabras clave en sitios web de legislación india por una búsqueda semántica que comprende la intención del usuario.
- Clasificación o agrupación de documentos legales: generar embeddings de párrafos legales para agruparlos por temas o detectar similitud entre disposiciones, útil para análisis normativo y comparación de textos legales.
- Filtrado de consultas en un sistema de atención legal automatizada: un chatbot legal puede usar el modelo para identificar qué disposiciones del BNS son relevantes para una consulta de un ciudadano, antes de derivar el caso a un abogado.

## Benchmarks y rendimiento

| Evaluación | Top-1 | Top-3 | Top-5 | MRR |
|---|---|---|---|---|
| Controlled Natural Benchmark (15 casos) | 86,67% | 93,33% | 100% | 0,9167 |
| 100-Query Coverage Evaluation | 99,00% | 100,00% | 100,00% | 0,9950 |
| 1.074-Query Held-Out Evaluation | 98,23% | 99,72% | 99,72% | 0,9899 |

Los autores indican que los benchmarks de 100 y 1.074 consultas son sintéticos o derivados de estatutos y no deben interpretarse como precisión real de usuarios ni precisión legal real. No se han publicado comparativas con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 136.731.648 parámetros. En FP16 ocupa aproximadamente 273 MB; en FP32, aproximadamente 546 MB. Con el overhead de Sentence Transformers y el tokenizador, se recomienda al menos 1 GB de VRAM.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM, como NVIDIA T4, RTX 3060, A10, o incluso CPU.
- Cabe en consumer GPU: sí, es un modelo pequeño que puede ejecutarse en GPUs de consumo.
- Opciones de despliegue: Sentence Transformers, `text-embeddings-inference`, Hugging Face Inference Endpoints. También puede integrarse con bases vectoriales como FAISS, Chroma o Qdrant.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se han identificado modelos comparables específicos para la recuperación de disposiciones del BNS 2023 en la información disponible. El modelo es una adaptación especializada de `nomic-ai/nomic-embed-text-v1.5`; no se dispone de evaluaciones comparativas frente a otros modelos de embeddings legales.

## Limitaciones y advertencias

- Especializado en el Bharatiya Nyaya Sanhita (BNS) 2023; no es aplicable a otros códigos legales ni a jurisprudencia.
- Solo soporta inglés; no es multilingüe.
- No es un modelo de generación de texto; no produce respuestas legales.
- No es un sistema de asesoramiento legal; no debe usarse para determinar responsabilidad legal ni decisiones judiciales.
- Consultas ambiguas o incompletas pueden recuperar disposiciones relacionadas pero no exactas.
- Disposiciones estatutarias similares pueden ser difíciles de distinguir.
- Los resultados de evaluación son sintéticos o derivados de estatutos y no establecen precisión legal real en el mundo real.
- Las disposiciones recuperadas deben verificarse de forma independiente contra la legislación aplicable.
- La máxima longitud de secuencia de entrenamiento es 512 tokens; consultas o documentos más largos pueden truncarse.
- El repositorio tiene 0 descargas y 0 likes, lo que indica que es un modelo reciente y no ha sido ampliamente validado por la comunidad.

## Enlaces

- HuggingFace: https://huggingface.co/Ayushi054/CourtInsight-BNS-Encoder
- CourtInsight AI (Space): https://huggingface.co/spaces/Ayushi054/court-insight-ai
- Perfil del autor: https://huggingface.co/Ayushi054
- Modelo base: https://huggingface.co/nomic-ai/nomic-embed-text-v1.5
