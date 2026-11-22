# nebhailema/afrixir-e5-base

## Resumen

AfriXIR-e5-base es un modelo de embeddings de frases (sentence transformer) especializado en recuperación de información multilingüe para lenguas africanas. Lo desarrolla el usuario nebhailema y parte de `intfloat/multilingual-e5-base`, un transformer XLM-RoBERTa de 278 millones de parámetros, al que se ha aplicado un ajuste fino supervisado sobre el dataset AfriXIR (112.864 muestras) para tareas de similitud semántica y retrieval.

El modelo resuelve el problema de la baja calidad de recuperación semántica en lenguas africanas de bajos recursos, donde los embeddings multilingües genéricos rinden de forma deficiente por la escasa representación de estos idiomas en los corpus de preentrenamiento. Cubre explícitamente amárico, hausa, oromo, shona, somalí, suajili, yoruba y zulú, y mantiene las capacidades multilingües heredadas del modelo base.

Es relevante porque combina un enfoque de entrenamiento con MatryoshkaLoss (embeddings truncables de dimensionalidad variable) y MultipleNegativesRankingLoss, lo que permite desplegar representaciones más compactas sin reentrenar. La licencia Apache 2.0 y el formato sentence-transformers facilitan su integración en pipelines de búsqueda y RAG.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (XLM-RoBERTa base), sentence transformer con pooling |
| Parametros totales | 278.043.648 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo base multilingual-e5-base admite hasta 512 tokens) |
| Tipos de cuantizacion | no disponible (pesos safetensors en fp32; cuantización vía herramientas externas) |
| Idiomas soportados | am, ha, om, sn, so, sw, yo, zu (más los idiomas del modelo base multilingüe) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tune de `intfloat/multilingual-e5-base`, basado en la arquitectura XLM-RoBERTa (transformer encoder de 12 capas y 278 millones de parámetros). Se utiliza como sentence transformer para producir embeddings de frases, con el esquema de prefijos `query:` y `passage:` propio de la familia E5, que distingue consultas de documentos en tareas de recuperación.

El entrenamiento se realizó sobre el dataset `nebhailema/AfriXIR` con 112.864 muestras, empleando dos funciones de pérdida combinadas: `MatryoshkaLoss`, que entrena representaciones anidadas y truncables para permitir embeddings de menor dimensionalidad, y `MultipleNegativesRankingLoss`, estándar en el entrenamiento de recuperación con pares positivos y negativos en el lote. No se dispone de información sobre el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo etapas de RLHF o DPO.

## Capacidades

- Generación de embeddings de frases para similitud semántica y recuperación de información.
- Búsqueda semántica y dense retrieval con esquema de prefijos `query:` / `passage:`.
- Feature extraction para pipelines de clasificación, clustering y deduplicación sobre textos.
- Soporte multilingüe para amárico, hausa, oromo, shona, somalí, suajili, yoruba y zulú, además de los idiomas heredados de multilingual-e5-base.
- Embeddings Matryoshka: permite truncar la dimensionalidad de salida para reducir coste de almacenamiento y latencia.
- Compatible con Text Embeddings Inference (TEI) y con endpoints compatibles, según los tags del repositorio.
- No dispone de tool calling, capacidades de agente, visión, audio ni modo de razonamiento: es exclusivamente un modelo de representación.

## Casos de uso

- Búsqueda semántica en lenguas africanas: indexar un corpus documental en suajili, hausa o amárico y recuperar pasajes relevantes ante consultas en lenguaje natural, usando los prefijos `query:` y `passage:` para maximizar la precisión.
- RAG multilingüe: como retriever en pipelines de generación aumentada, recuperando fragmentos de documentación o bases de conocimiento en lenguas africanas antes de pasarlos a un LLM generativo.
- Atención al cliente en suajili y somalí: emparejar preguntas de usuarios con artículos de FAQ o tickets previos mediante similitud de embeddings, con independencia de variaciones léxicas.
- Deduplicación y clustering de noticias: agrupar artículos periodísticos en amárico o yoruba por similitud semántica para detectar duplicados o construir temas.
- Moderación y clasificación de contenido: usar los embeddings como features de entrada para clasificadores de toxicidad o categorización temática en corpus de bajos recursos.
- Investigación lingüística comparada: calcular distancias semánticas entre frases en distintas lenguas africanas para estudios de alineamiento o traducción.
- Sistemas de recomendación de contenido textual: representar documentos y perfiles de usuario en el mismo espacio vectorial para sugerir lecturas afines.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 1,1 GB de pesos, más overhead de activaciones; en la práctica cabe en GPUs con 4 GB o más.
- En fp16: alrededor de 0,6 GB de pesos, apto para GPUs consumer de gama media y baja.
- GPUs recomendadas: cualquier GPU con al menos 4 GB de VRAM; para alto throughput, A10, L4, A100 o H100.
- Cabe en GPUs consumer: sí, por ejemplo RTX 3060, RTX 4060, RTX 4090, e incluso en CPU para cargas moderadas.
- Opciones de despliegue: sentence-transformers, Text Embeddings Inference (TEI), vLLM (soporte de embeddings), Hugging Face Inference Endpoints, y exportación a ONNX para inferencia optimizada.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas africanos | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AfriXIR-e5-base | 278 M | no disponible (base: 512) | 8 explícitos (am, ha, om, sn, so, sw, yo, zu) | Apache 2.0 | Hugging Face |
| intfloat/multilingual-e5-base | 278 M | 512 | multilingüe genérico, cobertura limitada | MIT | Hugging Face |
| intfloat/multilingual-e5-large | 560 M | 512 | multilingüe genérico, cobertura limitada | MIT | Hugging Face |
| BAAI/bge-m3 | 568 M | 8192 | multilingüe, cobertura variable | MIT | Hugging Face |

Los datos de rendimiento comparado no están disponibles en la información proporcionada, por lo que no se puede establecer una comparación cuantitativa de calidad de recuperación.

## Limitaciones y advertencias

- El modelo está diseñado exclusivamente para generar embeddings; no genera texto ni realiza razonamiento.
- Riesgo de sesgo derivado de los corpus de entrenamiento del modelo base y del dataset AfriXIR, cuya composición no se detalla.
- La cobertura de las ocho lenguas africanas depende de la cantidad y calidad de datos del dataset de ajuste; el rendimiento en variedades dialectales o registros informales puede degradarse.
- La longitud máxima de entrada no está documentada explícitamente; se asume la del modelo base (512 tokens), por lo que documentos más largos deben fragmentarse.
- El esquema de prefijos `query:` y `passage:` es necesario para un rendimiento óptimo; omitirlos puede reducir la calidad de recuperación.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones de los datos de entrenamiento del dataset AfriXIR.
- El modelo tiene muy pocas descargas y likes en Hugging Face, lo que sugiere una validación comunitaria limitada; se recomienda evaluar en el dominio concreto antes de producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nebhailema/afrixir-e5-base
- Modelo base: https://huggingface.co/intfloat/multilingual-e5-base
- Dataset AfriXIR: https://huggingface.co/datasets/nebhailema/AfriXIR
- Paper de Sentence-BERT (arXiv:1908.10084): https://arxiv.org/abs/1908.10084
- Paper de Matryoshka Representation Learning (arXiv:2205.13147): https://arxiv.org/abs/2205.13147
- Paper de Multiple Negatives Ranking (arXiv:1807.03748): https://arxiv.org/abs/1807.03748
