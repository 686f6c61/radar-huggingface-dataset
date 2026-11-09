# adambuttrick/ror-set-point-retriever-e5-base-openalex-jev-distill

## Resumen

`ror-set-point-retriever-e5-base-openalex-jev-distill` es un modelo de recuperación (retriever) de frases, basado en `intfloat/multilingual-e5-base`, afinado por adambuttrick para una tarea muy concreta: encontrar los registros del ROR (Research Organization Registry) candidatos para una cadena de afiliación institucional. Forma parte de un pipeline de "ROR set point matching" en el que un retriever dual-encoder genera candidatos y un modelo de conjunto (set model) posterior selecciona los registros que la cadena realmente nombra.

La particularidad de esta variante es el origen de sus datos de entrenamiento: se ha destilado a partir de los juicios de `openalex-affiliation-matcher v3.0.0`, cuyo componente de decisión es Jev, un modelo comercial cerrado de TypeSafe AI. Esto contrasta con la versión original del retriever, que aprende de un modelo de pesos abiertos. El resultado es una copia de la revisión `3f011b6` de `ror-set-point-retriever-e5-base` con el mismo propósito pero distinta fuente de supervisión.

El modelo tiene 278 millones de parámetros (XLM-RoBERTa base), produce embeddings normalizados con pooling de media y se distribuye con licencia MIT. Es relevante para quienes construyen pipelines de desambiguación de afiliaciones académicas y quieren comparar el efecto de distintas fuentes de destilación sobre el mismo retriever.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder bi-direccional (XLM-RoBERTa base, vía `intfloat/multilingual-e5-base`), dual encoder con mean pooling |
| Parametros totales | 278.043.648 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens para cadenas de consulta; 128 tokens para textos de registro (configuración de entrenamiento) |
| Tipos de cuantizacion | no disponible (pesos publicados en fp16) |
| Idiomas soportados | no disponible (heredados de multilingual-e5-base, multilingüe) |
| Licencia | MIT |
| Formato de pesos | safetensors (librería `sentence-transformers`) |

## Arquitectura y entrenamiento

El modelo es un dual encoder basado en `intfloat/multilingual-e5-base` (revisión `d12875059715`). Codifica por separado la cadena de afiliación (con el prefijo `"query: "`) y el texto de cada registro ROR (con el prefijo `"passage: "`), aplica mean pooling y produce vectores de dimensión 1 según la model card (dato que conviene verificar en la práctica, ya que e5-base estándar produce 768 dimensiones). La similitud se calcula como producto escalar: un valor alto indica un buen candidato. Los vectores de los 143.284 registros se precalculan una sola vez y se reutilizan para todas las consultas.

El entrenamiento usa pérdida InfoNCE con temperatura 0,02 sobre todos los registros del lote, con lotes de 128 cadenas, cada una con 1 positivo y 3 negativos duros. Se entrena 1 época (3.833 pasos) con AdamW, learning rate 2e-5 y weight decay (valor truncado en la información disponible). El conjunto de datos suma 490.704 filas de tres fuentes: juicios del profesor Jev (304.626 filas, cadenas con p ≥ 0,5 como positivos y registros con p < 0,1 como negativos), datos etiquetados de instituciones no vistas (49.890 filas) y cadenas sintéticas no latinas (136.188 filas). Los negativos duros de las cadenas sintéticas se minaron con el retriever `ror-set-point-retriever-e5-base-no-synthetic`, descartando etiquetas, registros relacionados y candidatos con puntuación ≥ 0,95 × la del registro fuente.

## Capacidades

- Generación de embeddings de similitud semántica para recuperación de candidatos (pipeline `sentence-similarity`).
- Recuperación de registros ROR candidatos a partir de cadenas de afiliación institucional, sobre un índice de 143.284 registros.
- Soporte de dos modos de codificación con prefijos distintos (`query` para cadenas, `passage` para registros).
- Manejo de cadenas de afiliación de hasta 512 tokens y textos de registro de hasta 128 tokens.
- Capacidad multilingüe heredada del modelo base (no se detalla el conjunto exacto de idiomas).
- Integración con `sentence-transformers` y con Text Embeddings Inference (tag `text-embeddings-inference`).
- No soporta tool calling, agentes, visión, audio ni modo de razonamiento: es un encoder de recuperación, no un modelo generativo.

## Casos de uso

- Desambiguación de afiliaciones en bases bibliográficas: dado un campo de afiliación de OpenAlex, Crossref o similar, el modelo recupera los 32 registros ROR más probables y un set model posterior selecciona los correctos, reduciendo el espacio de búsqueda frente a comparar contra los 143.284 registros.
- Enriquecimiento de metadatos de publicaciones: precalcular los embeddings de todos los registros ROR una vez y consultarlos con cada nueva afiliación ingerida, lo que permite un throughput alto en pipelines de ingestión masiva.
- Construcción de índices vectoriales para búsqueda institucional: usar los vectores de registro como índice persistente (por ejemplo, en FAISS o similar) y resolver consultas con producto escalar.
- Evaluación comparativa de estrategias de destilación: al ser una variante destilada de juicios cerrados (Jev) frente a la versión original destilada de un modelo abierto, sirve para medir el impacto de la fuente de supervisión en la calidad del retriever.
- Normalización de afiliaciones en repositorios institucionales: mapear variantes de nombre de una misma institución a un identificador ROR canónico, combinando el retriever con un paso de desambiguación.
- Investigación en entity linking: usar el modelo como componente de recuperación en pipelines de enlace de entidades organizativas, con negativos duros minados para afinar variantes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona que la tarjeta de `ror-set-point-retriever-e5-base` compara ambos retrievers, pero no se incluyen cifras en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,6 GB en fp16 (278 M de parámetros) más el espacio de los embeddings de registro; en fp32, alrededor de 1,1 GB.
- Índice de registros: 143.284 vectores; el tamaño exacto depende de la dimensión real de salida (la model card indica 1, lo que conviene verificar; con 768 dimensiones en fp16 serían unos 220 MB).
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; RTX 3090, RTX 4090, A10, L4, A100 o H100 para codificación por lotes a gran escala.
- Cabe en GPU consumer: sí, en cualquier GPU con al menos 2 GB de VRAM (por ejemplo, GTX 1650, RTX 3060 en adelante).
- Opciones de despliegue: `sentence-transformers`, Text Embeddings Inference (TGI), ONNX Runtime; también es posible exportar a GGUF para `llama.cpp`, aunque no se documenta en la información disponible.
- Latencia y throughput: no disponible. El autor recomienda `batch_size=256` para codificar los registros y `max_seq_length=128` para textos de registro.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Fuente de destilación | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `ror-set-point-retriever-e5-base-openalex-jev-distill` (este) | 278 M | 512 / 128 | Juicios de Jev (modelo cerrado) | MIT | Hugging Face |
| `ror-set-point-retriever-e5-base` | 278 M | 512 / 128 | Juicios de StartLux-Decision v1.1 27B Instant (pesos abiertos) | MIT | Hugging Face |
| `ror-set-point-retriever-e5-base-no-synthetic` | 278 M | 512 / 128 | Sin cadenas sintéticas; usado para minar negativos duros | MIT | Hugging Face |
| `intfloat/multilingual-e5-base` (base) | 278 M | 512 | No aplica (modelo base) | MIT | Hugging Face |

Los tres retrievers de la familia comparten arquitectura y tamaño; la diferencia está en los datos de entrenamiento y la fuente de supervisión. No se dispone de cifras de rendimiento comparadas en la información proporcionada.

## Limitaciones y advertencias

- Es un encoder de recuperación, no un modelo generativo: no produce texto, no razona y no admite tool calling ni agentes.
- La model card indica vectores de salida de longitud 1, lo que resulta inconsistente con la arquitectura e5-base; conviene verificar la dimensión real antes de dimensionar un índice vectorial.
- El modelo se ha entrenado exclusivamente para la tarea de recuperación de registros ROR; su uso fuera de ese dominio no está validado.
- La supervisión proviene de un modelo comercial cerrado (Jev, de TypeSafe AI), lo que puede introducir sesgos o comportamientos del profesor no documentados públicamente.
- Riesgo de falsos positivos en cadenas ambiguas (por ejemplo, nombres de instituciones homónimas en distintos países); el retriever solo propone candidatos y depende del set model para la decisión final.
- La cobertura lingüística no está documentada; el entrenamiento incluye cadenas sintéticas no latinas, pero no se detalla qué idiomas ni en qué proporción.
- Licencia MIT: permite uso comercial, pero no se ofrece garantía ni soporte por parte del autor.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que sugiere poca validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/adambuttrick/ror-set-point-retriever-e5-base-openalex-jev-distill
- Retriever original: https://huggingface.co/adambuttrick/ror-set-point-retriever-e5-base
- Variante sin cadenas sintéticas: https://huggingface.co/adambuttrick/ror-set-point-retriever-e5-base-no-synthetic
- Set model asociado: https://huggingface.co/adambuttrick/ror-set-point-set-model-mmbert-base-openalex-jev-distill
- Colección ROR set point matching: https://huggingface.co/collections/adambuttrick/ror-set-point-matching-6ada8733c9e6fb018f382d0b
- Dataset de entrenamiento: https://huggingface.co/datasets/adambuttrick/ror-set-point-matching-train-validation-test
- Dataset de juicios del profesor: https://huggingface.co/datasets/adambuttrick/ror-set-point-matching-train-validation-test-openalex-jev-distill
- Repositorio GitHub: https://github.com/adambuttrick/ror-set-point-matching
- Modelo base: https://huggingface.co/intfloat/multilingual-e5-base
