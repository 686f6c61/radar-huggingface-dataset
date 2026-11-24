# Linkup-Platform/linkup-sparseup-embed-v2

## Resumen

SPARSEUP-v2 es un modelo de recuperación dispersa (sparse retrieval) para inglés desarrollado por Linkup Research, el brazo de investigación de Linkup. Se presenta como un modelo de embeddings de tipo SPLADE construido sobre una arquitectura ModernBERT y afinado a partir de un checkpoint de preentrenamiento propio (`linkup-sparseup-embed-v2-pretrain`). Su función es generar representaciones dispersas de documentos y consultas para búsqueda léxica-semántica, tarea en la que compite con recuperadores densos y multivector.

El modelo destaca por su equilibrio entre calidad y eficiencia: según la model card, alcanza 57,2 nDCG@10 en BEIR-15, lo que supone +2,8 puntos sobre SPARSEUP v1 con un 32 % menos de FLOPS, y 59,7 en la tarea de retrieval de MTEB(eng, v2). Con 149,7 millones de parámetros y un repositorio de 0,6 GB, es un modelo compacto orientado a producción en pipelines de búsqueda.

Es relevante ahora porque demuestra que los recuperadores dispersos pueden igualar a modelos multivector de mayor coste computacional manteniendo la interpretabilidad y la eficiencia de un índice invertido, lo que facilita su despliegue en motores de búsqueda a gran escala.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT con cabecera de proyección dispersa (SPLADE) |
| Parametros totales | 149.707.140 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en la informacion proporcionada |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Dimension de salida | dispersa (sparse), con soporte Matryoshka |
| Modelo base | Linkup-Platform/linkup-sparseup-embed-v2-pretrain |
| Libreria | sentence-transformers |
| Pipeline | feature-extraction |

## Arquitectura y entrenamiento

El modelo parte de un backbone ModernBERT, una arquitectura transformer encoder moderna que incorpora atención con rotación posicional y capas de atención local/global alternadas para manejar secuencias largas de forma eficiente. Sobre ese backbone se añade una cabecera de proyección de tipo SPLADE que produce representaciones dispersas de alta dimensión, con expansión de términos aprendida y activación con regularización de dispersión. El modelo también incorpora soporte Matryoshka, lo que permite truncar las representaciones a distintas dimensiones según el compromiso entre calidad y coste de almacenamiento.

El entrenamiento se realizó como un fine-tuning del checkpoint de preentrenamiento `linkup-sparseup-embed-v2-pretrain` sobre el dataset `lightonai/embeddings-fine-tuning-filtered-en`, un corpus filtrado en inglés orientado al ajuste de embeddings. La model card indica que se entrenó sobre el mismo backbone y con datos similares a los del modelo multivector LateOn, lo que permite una comparación directa. No se detalla en la información disponible el número exacto de tokens de entrenamiento, la composición completa del dataset ni si se aplicaron fases de RLHF o DPO (en un modelo de recuperación no sería el mecanismo habitual; lo esperable es entrenamiento contrastivo con negativos minados, aunque este extremo no se confirma en la información proporcionada).

## Capacidades

- Generación de embeddings dispersos para similitud semántica entre consultas y documentos.
- Recuperación léxica-semántica de primer nivel (sparse retrieval) apta para índices invertidos.
- Soporte de Matryoshka: representaciones truncables a menores dimensiones.
- Eficiencia mejorada: 32 % menos FLOPS que SPARSEUP v1 según la model card.
- Compatibilidad con `sentence-transformers` y con Text Embeddings Inference (TEI).
- Compatible con endpoints (tag `endpoints_compatible`).
- Código personalizado (`custom_code`) requerido para cargar el modelo.
- Capacidad monolingüe: solo inglés.
- No se documentan capacidades de tool calling, agentes, visión ni audio (no aplicables a un modelo de embeddings).

## Casos de uso

- Búsqueda documental a escala: indexar corpus en inglés con representaciones dispersas en un motor de índice invertido (por ejemplo, Lucene, Elasticsearch o OpenSearch) y recuperar documentos por relevancia semántica sin necesidad de un índice vectorial denso.
- Reranking de primer nivel en pipelines RAG: usar SPARSEUP-v2 como recuperador inicial barato antes de un reranker cross-encoder, aprovechando su bajo coste en FLOPS para reducir el conjunto candidato.
- Búsqueda en bases de conocimiento internas: desplegar el modelo con TEI o sentence-transformers para servir embeddings de consultas y documentos en una API de búsqueda corporativa en inglés.
- Deduplicación y clustering semántico de documentos: calcular similitud entre representaciones dispersas para agrupar contenido redundante en pipelines de ingesta.
- Sistemas de recomendación de contenido textual: emparejar perfiles o consultas de usuario con artículos, noticias o documentación mediante similitud dispersa.
- Filtrado de candidatos en motores de búsqueda web: integrar el modelo en la fase de recuperación de un buscador para mejorar el recall antes de etapas más costosas.
- Evaluación de recuperación en investigación: usar el modelo como baseline sparse en experimentos de IR sobre BEIR y MTEB, dado su rendimiento publicado y su licencia permisiva.

## Benchmarks y rendimiento

| Benchmark | Metrica | Resultado |
|---|---|---|
| BEIR-15 | nDCG@10 | 57,2 |
| MTEB(eng, v2) retrieval | no especificada en la informacion | 59,7 |
| Comparacion con SPARSEUP v1 | nDCG@10 BEIR-15 | +2,8 puntos |
| Comparacion con LateOn (multivector) | nDCG@10 BEIR-15 | empate a 57,2 |
| Eficiencia vs SPARSEUP v1 | FLOPS | -32 % |

No se han publicado en la informacion disponible resultados desglosados por tarea (MMLU, HumanEval, GSM8K u otras), ya que no son benchmarks aplicables a un modelo de recuperación. Tampoco se detallan los resultados por subconjunto de BEIR-15.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 149,7 M de parámetros; en fp32 ocupa aproximadamente 0,6 GB de pesos, en fp16 unos 0,3 GB y en int8 unos 0,15 GB. La VRAM total necesaria depende del tamaño de lote y de la longitud de secuencia, pero cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 4-8 GB de VRAM es suficiente; RTX 3060, RTX 4060, RTX 4090, A100 o H100 funcionan sin problema. Para servir en producción con alto throughput se recomienda A100/H100 o L4.
- Cabe en GPU consumer: sí, en cualquier GPU moderna con 4 GB o más de VRAM, e incluso en CPU para cargas moderadas.
- Opciones de despliegue: sentence-transformers, Text Embeddings Inference (TEI), y cualquier framework compatible con modelos Hugging Face. Requiere `custom_code` para la carga.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada. El dato de 32 % menos FLOPS que la versión anterior sugiere una mejora proporcional en coste de inferencia, pero no se publican cifras absolutas.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | BEIR-15 nDCG@10 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SPARSEUP-v2 | 149,7 M | Sparse (SPLADE) | 57,2 | Apache 2.0 | Hugging Face |
| SPARSEUP v1 | no disponible | Sparse (SPLADE) | 54,4 (inferido de +2,8) | no disponible | Hugging Face |
| LateOn (multivector) | no disponible | Multivector | 57,2 | no disponible | no disponible |

La comparativa se limita a los datos publicados en la model card. No se dispone de información sobre parámetros, contexto o licencia de los modelos alternativos citados, por lo que no se pueden completar esas filas.

## Limitaciones y advertencias

- Modelo monolingüe: solo soporta inglés; su uso en otros idiomas no está validado.
- Riesgo de alucinación: no aplica en el sentido generativo, pero sí puede producir recuperaciones irrelevantes o falsos positivos si el corpus o las consultas se alejan de la distribución de entrenamiento.
- Sesgos: no se documentan análisis de sesgo en la información proporcionada; al entrenarse sobre un corpus filtrado en inglés, puede heredar sesgos de ese dataset.
- Licencia Apache 2.0: permite uso comercial, modificación y redistribución con atribución; no obstante, conviene revisar las condiciones del dataset de entrenamiento (`lightonai/embeddings-fine-tuning-filtered-en`) por si impone restricciones adicionales.
- Requiere código personalizado para la carga (`custom_code`), lo que puede complicar la integración en algunos entornos y exige confiar en el código del autor.
- Longitud de contexto no documentada: no se puede garantizar el comportamiento en documentos muy largos sin verificación empírica.
- No se han publicado cifras de latencia ni throughput absolutos, lo que dificulta la planificación de capacidad en producción.
- El número de descargas (125) y likes (3) es bajo, lo que sugiere una adopción todavía limitada y menos validación comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Linkup-Platform/linkup-sparseup-embed-v2
- Modelo de preentrenamiento base: https://huggingface.co/Linkup-Platform/linkup-sparseup-embed-v2-pretrain
- Modelo anterior SPARSEUP v1: https://huggingface.co/Linkup-Platform/linkup-sparseup-embed-v1
- Dataset de fine-tuning: https://huggingface.co/datasets/lightonai/embeddings-fine-tuning-filtered-en
- Paper de referencia (arXiv): https://arxiv.org/abs/2611.09680
- Web de Linkup: https://www.linkup.so/
- LinkedIn de Linkup: https://www.linkedin.com/company/linkup-platform/
- X (Twitter) de Linkup: https://x.com/Linkup_platform
