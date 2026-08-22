# andreasmartin/apertus-v1.5-swiss-embed-4.9b-bidir-langmoe

## Resumen

Apertus v1.5 Swiss Embed — Language-MoE es un modelo de embeddings multilingüe para recuperación de información, especializado en los idiomas de Suiza (alemán, inglés, francés, italiano, romanche y suizo-alemán). Ha sido desarrollado por andreasmartin como una variante del modelo de embeddings denso `apertus-v1.5-swiss-embed-4.9b-bidir`, que a su vez se basa en la familia Apertus v1.5 de la Swiss AI Initiative (EPFL, ETH Zúrich y CSCS). El modelo resuelve el problema de representar semánticamente textos en un entorno multilingüe con idiomas minoritarios, donde los modelos genéricos suelen perder precisión.

La arquitectura combina un backbone transformer bidireccional denso de 4.9 mil millones de parámetros con una cabeza de proyección MoE (Mixture of Experts) que selecciona dinámicamente dos de siete expertos especializados por idioma. Esta combinación permite mantener un alto rendimiento en cada idioma sin aumentar el coste de inferencia por frase. El modelo produce embeddings de 1024 dimensiones con soporte Matryoshka para reducirlas a 768, 512 o 256. La ventana de contexto alcanza 1024 tokens en inferencia, aunque el entrenamiento de la cabeza MoE se limitó a 512 tokens.

La relevancia de este modelo radica en su enfoque en idiomas suizos poco representados, como el romanche y el suizo-alemán, y en su licencia Apache-2.0, que permite uso comercial sin restricciones. Aunque aún no cuenta con evaluaciones externas en benchmarks estándar, sus diagnósticos internos muestran una precisión superior al 86 % en recuperación monolingüe.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer bidireccional denso (Apertus v1.5) + cabeza Language-MoE |
| Parámetros totales | 4.899.939.368 (según safetensors) |
| Parámetros activos | 4.908.356.655 (según model card) |
| Longitud de contexto | 1024 tokens (inferencia); 512 tokens (entrenamiento MoE) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | de, en, fr, it, rm, gsw |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (sentence-transformers) |

## Arquitectura y entrenamiento

El modelo utiliza un encoder bidireccional de la familia Apertus v1.5 como backbone, que está congelado. Las representaciones ocultas de este encoder se agregan mediante mean pooling y se pasan a un router Language-MoE que selecciona los dos expertos más relevantes entre siete disponibles (DE, EN, FR, IT, RM, GSW y un experto compartido). Cada experto es una proyección lineal de 4.194.304 parámetros; la salida se combina y se proyecta a 1024 dimensiones, seguida de normalización L2. El router (28.679 parámetros) utiliza la representación pooled para decidir qué expertos activar, sin necesidad de un identificador de idioma en inferencia.

El entrenamiento se realizó en dos fases: primero se generó el backbone denso y luego, congelándolo, se entrenaron solo el router y las proyecciones de los expertos. Los datos de entrenamiento consisten en 31.483 tripletas (consulta, positivo, negativo) procedentes de Wikipedia, folletos de votación suizos (`VotingBooklets-v1`) y datos de gobierno suizo (`SwissGov-RSD`). No se aplicaron técnicas de RLHF ni DPO; es un entrenamiento supervisado con contraste de similitud semántica.

## Capacidades

- Generación de embeddings de frases para similitud semántica y recuperación de información.
- Multilingüe con soporte específico para alemán, inglés, francés, italiano, romanización y suán-alemán.
- Soporte de dimensiones Matryoshka: 1024, 768, 512 y 256, permitiendo compactar los embeddings según el caso de uso.
- Alineación cross-lingual: los embeddings de consultas en un idioma pueden recuperar documentos en otro idioma.
- No soporta tool calling ni generación de texto; es exclusivamente un modelo de embeddings.
- No incluye plantilla de chat ni sistema de agentes.

## Casos de uso

- Búsqueda semántica en documentos gubernamentales suizos: consultas en francés pueden recuperar leyes o reglamentos redactados en alemán o italiano, gracias a la alineación cross-lingual.
- Sistemas de pregunta-respuesta sobre folletos de votación: las consultas de los ciudadanos se convierten en embeddings y se comparan con los pasajes de los folletos para extraer la sección relevante.
- Clasificación automática de noticias regionales: se pueden agrupar artículos de diferentes idiomas suizos por tema mediante la similitud de sus embeddings.
- Deduplicación de documentos multilingües: detectar que dos informes en idiomas distintos contienen la misma información comparando sus representaciones.
- Recuperación aumentada (RAG) para asistentes virtuales en el contexto suizo: indexar pasajes de textos gubernamentales y recuperarlos con consultas en cualquiera de los idiomas soportados.
- Análisis de sentimiento o categorización de encuestas multilingües: convertir respuestas abiertas en embeddings para agruparlas por contenido semántico sin importar el idioma original.

## Benchmarks y rendimiento

No se han publicado resultados en benchmarks estándar como MTEB o MMTEB. La model card incluye diagnósticos internos calculados sobre un conjunto de evaluación propio, que no deben compararse con métricas externas.

| Diagnóstico | Dimensión | Accuracy@1 | Recall@10 | nDCG@10 | MRR@10 |
|---|---|---:|---:|---:|---:|
| Suizo monolingüe | 1024 | 86.67% | 95.00% | 0.9100 | 0.8970 |
| Suizo monolingüe | 512 | 87.08% | 95.21% | 0.9109 | 0.8979 |
| Suizo cross-lingual | 1024 | 33.54% | 99.58% | 0.7140 | 0.6176 |
| Suizo cross-lingual | 512 | 33.96% | 99.58% | 0.7152 | 0.6194 |

Nota: los diagnósticos cross-lingual muestran una Recall@10 muy alta (99.58%) pero una Accuracy@1 baja (33.5%), lo que sugiere que la alineación entre idiomas es suficiente para recuperar el documento correcto en los primeros 10, pero no para posicionarlo en primer lugar.

## Requisitos de hardware

- Estimación de VRAM: en precisión fp32 (~4 bytes por parámetro) se requieren aproximadamente 19,6 GB; en fp16 (~2 bytes por parámetro) unos 9,8 GB; en int8 (~1 byte por parámetro) unos 4,9 GB. No se han publicado versiones cuantizadas oficiales.
- GPU recomendadas: para fp16 se recomienda una GPU con al menos 10 GB de VRAM, como una RTX 4090 (24 GB) o una A100 (40 GB). Para int8 sería posible usar una RTX 3080 de 10 GB o similar, aunque no hay soporte oficial.
- El modelo cabe en una GPU de consumo como la RTX 4090 en fp16, pero no en tarjetas con menos de 10 GB en fp16.
- Despliegue: se puede usar directamente con la librería `sentence-transformers` (cargando con `trust_remote_code=True`). Para producción, se puede exportar a ONNX o usar vLLM para servir embeddings, aunque vLLM no soporta nativamente este tipo de modelos de embeddings. Alternativas: FAISS para indexación y búsqueda de similitud.
- Latencia y throughput: no se han publicado datos. Como referencia, un modelo de 4,9B parámetros en fp16 en una RTX 4090 puede procesar cientos de frases por segundo en inferencia por lotes, pero depende del tamaño de la secuencia.

## Comparativa con modelos similares

No se han publicado comparaciones con otros modelos de embeddings multilingües en la información disponible. Modelos comparables en tamaño y función serían `multilingual-e5-large` (560M parámetros), `bge-m3` (560M) o `nomic-embed-text` (137M), pero carecen de soporte específico para los idiomas suizos y tienen una arquitectura mucho más pequeña. No es posible establecer una comparativa cuantitativa sin datos de evaluación conjunta.

## Limitaciones y advertencias

- El sparse routing se aplica solo en la cabeza de proyección; el backbone completo es denso, lo que limita la especialización por idioma a la capa final.
- Los datos de entrenamiento son pseudo-retrieval (pares de títulos y párrafos de Wikipedia, folletos de votación), no consultas reales de búsqueda, lo que puede reducir el rendimiento en consultas naturales.
- No hay evaluaciones externas (MTEB, MMTEB, MIRACL) que permitan comparar con otros modelos.
- La calidad de los embeddings más allá de 512 tokens no ha sido validada, aunque el modelo permite 1024 tokens en inferencia.
- Riesgo de alucinación no aplica al ser un modelo de embeddings, pero puede producir representaciones sesgadas si los datos de entrenamiento contienen sesgos lingüísticos o culturales.
- Licencia Apache-2.0 permite uso comercial, pero es necesario conservar la atribución al proyecto Apertus y la Swiss AI Initiative.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/andreasmartin/apertus-v1.5-swiss-embed-4.9b-bidir-langmoe)
- [Modelo base denso](https://huggingface.co/andreasmartin/apertus-v1.5-swiss-embed-4.9b-bidir)
- [Colección Apertus v1.5 en HuggingFace](https://huggingface.co/collections/swiss-ai/apertus-v15)
- [Apertus AI - Documentación](https://apertus-ai.org/pages/documentation/)
- [Apertus AI - Página principal](https://apertus-ai.org/)
- [Apertus (LLM) - Wikipedia](https://en.wikipedia.org/wiki/Apertus_(LLM))
