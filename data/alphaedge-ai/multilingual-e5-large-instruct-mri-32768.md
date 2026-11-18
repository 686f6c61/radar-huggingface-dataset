# alphaedge-ai/multilingual-e5-large-instruct-mri-32768

## Resumen

`alphaedge-ai/multilingual-e5-large-instruct-mri-32768` es una variante podada del modelo de embeddings `intfloat/multilingual-e5-large-instruct` de Microsoft, especializada en el idioma maorí (código ISO `mi`). El autor, alphaedge-ai, ha aplicado la técnica de *trimming* de vocabulario descrita por Hugging Face: se conservan únicamente los 32.768 tokens más relevantes para el maorí y se descartan el resto, reduciendo el vocabulario original de 250.037 tokens en un 86,89% y el número de parámetros de 559.890.432 a 337.442.816 (un 39,73% menos). El resultado es un modelo de 0,7 GB en el repositorio que mantiene la arquitectura XLM-RoBERTa del original.

El modelo no genera texto: es un codificador de frases (sentence-transformer) que produce embeddings densos para similitud semántica, búsqueda y recuperación. Está pensado para construir índices vectoriales en maorí con un coste de memoria notablemente inferior al del modelo completo, a cambio de perder capacidad multilingüe fuera de ese idioma. Su relevancia es acotada: se trata de un modelo de nicho, con 32 descargas y sin métricas publicadas, útil para proyectos de PLN en maorí que necesiten un footprint reducido.

La ficha se basa exclusivamente en la información del repositorio de Hugging Face y en la model card del autor; no se han encontrado resultados de benchmarks ni detalles adicionales de entrenamiento más allá de los indicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (XLM-RoBERTa), derivado de intfloat/multilingual-e5-large-instruct |
| Parametros totales | 337.442.816 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible (el original multilingual-e5-large-instruct admite 512 tokens, dato no confirmado en esta model card) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan variantes GGUF u otras) |
| Idiomas soportados | maorí (`mi`) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Vocabulario | 32.768 tokens (frente a 250.037 del original) |
| Dimension de embedding | no disponible en la model card |
| Tamano del repositorio | 0,7 GB |
| Libreria | sentence-transformers |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura encoder de XLM-RoBERTa del `multilingual-e5-large-instruct` original, que a su vez se entrena con objetivos de embeddings de frases y ajuste por instrucciones. La modificación aplicada aquí es puramente de vocabulario: mediante el método de *trimming*, se han eliminado los tokens del vocabulario original poco o nada utilizados en maorí, conservando 32.768. Esto reduce la matriz de embeddings y, con ello, el total de parámetros en un 39,73% y el tamaño del modelo en disco.

El proceso de selección de tokens se realizó minando un corpus de 158.804 textos del dataset `lbourdois/fineweb-2-trimming`, según indica la model card. No se documenta un reentrenamiento adicional del encoder ni ajuste fino posterior al recorte: el modelo conserva los pesos del original para los tokens supervivientes. Por tanto, no hay datos sobre número de tokens de entrenamiento, composición del corpus, RLHF/DPO ni innovaciones técnicas más allá del propio recorte de vocabulario.

## Capacidades

- Generación de embeddings de frases y documentos para similitud semántica (`encode_query` / `encode_document`).
- Recuperación de información y búsqueda semántica en maorí.
- Clasificación y agrupamiento (clustering) de textos en maorí a partir de sus vectores.
- Detección de duplicados y near-duplicates en corpus en maorí.
- Soporte de instrucciones de tarea mediante el formato de query/document del modelo E5 original.
- Compatibilidad con Text Embeddings Inference (tag `text-embeddings-inference`) y endpoints de Hugging Face.
- No soporta generación de texto, tool calling, agentes, visión ni audio: es exclusivamente un codificador de embeddings.
- Capacidad multilingüe limitada: la model card advierte explícitamente que puede no funcionar bien en idiomas distintos del maorí, porque se han eliminado los tokens no usados en el idioma seleccionado.

## Casos de uso

- Búsqueda semántica en corpus maoríes: indexar documentos en maorí y recuperar por similitud coseno con `encode_query`/`encode_document`, aprovechando el menor footprint frente al modelo completo.
- Construcción de bases de conocimiento vectoriales para aplicaciones de PLN en maorí: el modelo de 0,7 GB permite desplegar el índice en infraestructura modesta, algo inviable con el original de mayor tamaño.
- Deduplicación de datasets en maorí: calcular embeddings de un corpus (por ejemplo, textos de FineWeb-2) y agrupar documentos con similitud alta para eliminar contenido repetido.
- Clasificación temática no supervisada: agrupar noticias o documentos en maorí por clusters de embeddings y etiquetar los grupos manualmente.
- Sistemas de recomendación de contenido en maorí: comparar la representación vectorial de un documento consultado con el catálogo para sugerir artículos relacionados.
- Filtrado de calidad de corpus para entrenamiento: usar la similitud entre pares de frases para detectar traducciones o paráfrasis y limpiar datos antes de entrenar otros modelos.
- Evaluación de similitud de respuestas en pipelines de QA en maorí: comparar la respuesta generada con la referencia mediante embeddings en lugar de métricas léxicas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de recuperación (nDCG, Recall@k), MTEB ni comparaciones cuantitativas con el modelo original; solo indica que el modelo podado "debería comportarse de forma similar al original" en maorí, sin aportar cifras que lo respalden.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo ocupa 0,7 GB en safetensors en FP32; en FP16 rondaría 0,35 GB y en int8 unos 0,17 GB (estimación a partir del número de parámetros, no confirmada por el autor).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; una RTX 3060, RTX 4090 o T4 lo ejecutan sin problema. Para lotes grandes, A100 o H100 aportan throughput adicional pero no son necesarias.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU consumer moderna (GTX 1650 en adelante) e incluso en CPU para cargas moderadas.
- Opciones de despliegue: `sentence-transformers` (librería nativa), Text Embeddings Inference (tag `text-embeddings-inference`), endpoints de Hugging Face. No se documentan variantes GGUF para llama.cpp u Ollama, al ser un modelo de embeddings y no de generación.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| alphaedge-ai/multilingual-e5-large-instruct-mri-32768 | 337.442.816 | no disponible | maorí | MIT | Podado del E5 large, vocabulario de 32.768 tokens |
| intfloat/multilingual-e5-large-instruct | 559.890.432 | no disponible | multilingüe | MIT | Modelo base original, mayor footprint y cobertura de idiomas |
| Otras variantes podadas de E5 (por idioma) | variable | no disponible | idioma específico | MIT | Misma metodología de trimming aplicada a otros idiomas |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada. La comparación se limita a parámetros, licencia y cobertura de idiomas.

## Limitaciones y advertencias

- El recorte de vocabulario elimina tokens no usados en maorí: el modelo puede degradarse gravemente en otros idiomas, incluido el inglés, y no debe usarse como modelo multilingüe general.
- No se han publicado benchmarks que confirmen que el rendimiento en maorí se mantiene respecto al original; la afirmación de la model card es una expectativa, no un resultado medido.
- Riesgo de alucinación no aplica en el sentido generativo (no produce texto), pero sí puede producir similitudes poco fiables en dominios o registros del maorí poco representados en el corpus de minado (158.804 textos de FineWeb-2).
- La licencia MIT permite uso comercial sin restricciones adicionales, pero el autor no ofrece garantías sobre la calidad del modelo podado en producción.
- Modelo de nicho con 32 descargas y sin validación externa: conviene evaluar su calidad en el corpus concreto antes de desplegarlo.
- No se documentan la dimensión de embedding, la longitud máxima de secuencia ni los tipos de cuantización en la model card; estos datos deben verificarse cargando el modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/alphaedge-ai/multilingual-e5-large-instruct-mri-32768
- Modelo base: https://huggingface.co/intfloat/multilingual-e5-large-instruct
- Blog sobre trimming: https://huggingface.co/blog/lbourdois/introduction-to-trimming
- Dataset de minado: https://huggingface.co/datasets/lbourdois/fineweb-2-trimming
- Paper de Multilingual E5: https://arxiv.org/abs/2402.05672
