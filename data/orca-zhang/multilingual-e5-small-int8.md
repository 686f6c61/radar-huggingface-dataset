# orca-zhang/multilingual-e5-small-int8

## Resumen

`multilingual-e5-small-int8` es una versión cuantizada a INT8 del modelo de embeddings multilingüe `multilingual-e5-small` de intfloat (Microsoft), empaquetada en formato ONNX para su uso con el motor de inferencia Manticore en ZimaOS Photos. El modelo original, presentado en el informe técnico "Multilingual E5 Text Embeddings" (arXiv 2024), está basado en la arquitectura BERT y genera representaciones vectoriales de 384 dimensiones para texto en más de 100 idiomas. Esta variante INT8 reduce el tamaño del modelo a aproximadamente 0,1 GB, lo que permite una inferencia eficiente en CPU y en dispositivos con recursos limitados, manteniendo un contrato de embeddings fijo: prefijos `query:` y `passage:`, pooling por media con máscara de atención y normalización L2, y una longitud máxima de secuencia de 512 tokens.

La relevancia de este modelo radica en su uso práctico para sistemas de búsqueda semántica y recuperación de información en aplicaciones de gestión de fotos y archivos, donde se necesita indexar y buscar contenido multilingüe de forma rápida y ligera. Al ser una conversión ONNX INT8, se integra directamente con el runtime de ONNX y con herramientas como `text-embeddings-inference`, facilitando su despliegue en entornos de producción sin necesidad de GPUs potentes. El repositorio actual solo publica los pesos ONNX INT8, sin alternativas en safetensors o GGUF, y está pensado como un bundle inmutable para un caso de uso específico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (encoder transformer, 12 capas) |
| Parametros totales | no disponible (modelo original ~118M, no confirmado en esta ficha) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens (maxima secuencia) |
| Tipos de cuantizacion | INT8 (ONNX) |
| Idiomas soportados | multilingue (mas de 100 idiomas segun el modelo original) |
| Licencia | MIT |
| Formato de pesos | ONNX (model.onnx) |

## Arquitectura y entrenamiento

El modelo base `multilingual-e5-small` es un transformer encoder de tipo BERT con 12 capas y una dimensión de embedding de 384. Se entrena mediante aprendizaje contrastivo sobre pares de consultas y pasajes en múltiples idiomas, utilizando los prefijos `query:` y `passage:` para distinguir el rol del texto. El entrenamiento original incluye datos de MS-MARCO y otros conjuntos multilingües, y el modelo se optimiza con una función de pérdida contrastiva. Esta versión INT8 es una conversión del modelo original a ONNX con cuantización de 8 bits, realizada para reducir el tamaño y acelerar la inferencia en CPU. No se dispone de detalles adicionales sobre el proceso de cuantización ni sobre el dataset de entrenamiento en la información proporcionada.

## Capacidades

- Generacion de embeddings de texto para busqueda semantica y recuperacion de informacion.
- Soporte multilingue: puede representar consultas y pasajes en multiples idiomas, facilitando la busqueda cruzada entre lenguas.
- Pooling por media con mascara de atencion y normalizacion L2, lo que produce vectores unitarios comparables por similitud coseno.
- Longitud de secuencia de hasta 512 tokens, adecuada para parrafos y descripciones de longitud media.
- Compatible con el ecosistema ONNX Runtime y con `text-embeddings-inference` para despliegue en servidores.
- No incluye capacidades de generacion de texto, tool calling ni agentes; es exclusivamente un modelo de embeddings.

## Casos de uso

- Busqueda semantica en aplicaciones de fotos: ZimaOS Photos lo utiliza para indexar descripciones bilingues generadas por VLM y resumenes detallados, permitiendo buscar imagenes por contenido conceptual en varios idiomas.
- Recuperacion de pasajes en sistemas RAG: al generar embeddings de documentos y consultas, se puede integrar en pipelines de recuperacion aumentada por generacion para responder preguntas sobre corpus multilingues.
- Clasificacion de texto por similitud: permite agrupar o etiquetar textos (tickets de soporte, articulos, comentarios) basandose en la distancia coseno entre embeddings.
- Deduplicacion de contenido: comparar embeddings de documentos para detectar duplicados o variaciones cercanas en grandes colecciones multilingues.
- Motor de recomendacion por contenido: representar items textuales (productos, noticias, publicaciones) y recomendar elementos similares segun la proximidad vectorial.
- Indexacion de archivos y busqueda empresarial: integrar en sistemas de gestion documental para buscar informacion en diferentes idiomas sin traduccion previa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo original `multilingual-e5-small` cuenta con evaluaciones en MTEB y otros conjuntos, pero esta ficha no incluye esos datos. Se recomienda consultar la pagina del modelo base para obtener metricas comparativas.

## Requisitos de hardware

- Tamano del modelo: aproximadamente 0,1 GB (100 MB) en INT8, lo que permite cargarlo en memoria RAM de cualquier equipo moderno.
- Inferencia en CPU: optimizado para CPU gracias a la cuantizacion INT8; puede ejecutarse en procesadores sin GPU.
- GPU: si se usa en GPU, requiere menos de 1 GB de VRAM, por lo que es compatible con GPUs de gama baja (ej. GTX 1050, RTX 2060) e incluso con iGPUs.
- Opciones de despliegue: ONNX Runtime, `text-embeddings-inference` (TEI), y cualquier framework que soporte ONNX (Hugging Face Optimum, etc.).
- Latencia y throughput: no se proporcionan datos concretos, pero al ser un modelo pequeno (12 capas, 384 dimensiones) y cuantizado, la latencia por embedding suele ser de pocos milisegundos en CPU moderna.

## Comparativa con modelos similares

| Modelo | Arquitectura | Dimension embedding | Contexto maximo | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|---|
| multilingual-e5-small-int8 (este) | BERT 12 capas | 384 | 512 | multilingue | MIT | ONNX INT8 |
| multilingual-e5-base | BERT 12 capas | 768 | 512 | multilingue | MIT | safetensors, ONNX |
| paraphrase-multilingual-MiniLM-L12-v2 | MiniLM 12 capas | 384 | 128 | multilingue | Apache 2.0 | safetensors, ONNX |
| bge-small-en | BERT 12 capas | 384 | 512 | ingles | MIT | safetensors, ONNX |

Nota: los datos de la tabla para modelos alternativos provienen de conocimiento general y no estan verificados en la informacion proporcionada. No se dispone de comparativas de rendimiento numerico.

## Limitaciones y advertencias

- Modelo pequeno: al ser la variante "small", su capacidad de representacion es limitada en comparacion con modelos mas grandes (base, large), lo que puede afectar a tareas que requieren matices semanticos complejos.
- Longitud de secuencia fija de 512 tokens: textos mas largos deben truncarse, perdiendo informacion.
- Solo embeddings: no genera texto ni responde preguntas directamente; requiere un sistema externo para tareas de generacion.
- Sesgos potenciales: al entrenarse con datos web multilingues, puede heredar sesgos de genero, raza o cultura presentes en esos datos.
- Riesgo de alucinacion: no aplica directamente, pero en sistemas RAG que lo usen, la calidad de la recuperacion depende de la representacion; errores de embedding pueden llevar a resultados irrelevantes.
- Restricciones de uso: licencia MIT permite uso comercial, pero el repositorio actual es un bundle especifico para ZimaOS Photos; no se publican otros formatos de pesos.
- Dependencia de ONNX Runtime: para desplegarlo fuera de Manticore, se necesita un runtime compatible con ONNX.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/orca-zhang/multilingual-e5-small-int8
- Modelo original (intfloat/multilingual-e5-small): https://huggingface.co/intfloat/multilingual-e5-small
- Repositorio GitHub de P1-AI con el modelo original: https://github.com/P1-AI/multilingual-e5-small
- Pagina en ModelScope: https://www.modelscope.cn/models/intfloat/multilingual-e5-small
- Paper "Multilingual E5 Text Embeddings: A Technical Report" (arXiv 2024): https://arxiv.org/abs/2402.05672
- Repositorio orca-zhang/ncnn (bundle relacionado): https://huggingface.co/orca-zhang/ncnn/tree/main/multilingual-e5-small-int8
