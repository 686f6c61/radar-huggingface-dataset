# mradermacher/Nemotron-3-Embed-8B-BF16-i1-GGUF

## Resumen

Nemotron-3-Embed-8B-BF16-i1-GGUF es una colección de cuantizaciones en formato GGUF del modelo de embeddings nvidia/Nemotron-3-Embed-8B-BF16, realizadas por el cuantizador comunitario mradermacher. El modelo base de NVIDIA es un modelo de text embeddings de aproximadamente 8.000 millones de parámetros (7.952.683.008 según los safetensors del repositorio), orientado a tareas de recuperación de información, búsqueda semántica y RAG (Retrieval-Augmented Generation). La versión cuantizada permite ejecutar este modelo de embeddings en hardware modesto, incluyendo GPU de consumo e incluso CPU, algo habitualmente inviable con los pesos en BF16 originales.

La relevancia de esta ficha radica en la combinación de dos factores: por un lado, NVIDIA ofrece un modelo de embeddings multilingüe de tamaño medio con soporte para más de 30 idiomas (incluido el castellano); por otro, la comunidad de cuantización con imatrix (importance matrix) facilita despliegues ligeros sin depender del ecosistema propietario de APIs de embeddings. Esto resulta especialmente útil para construir pipelines de RAG autoalojados, donde la latencia, el coste por token y la privacidad de los datos son consideraciones críticas.

Cabe destacar que esta ficha describe el repositorio cuantizado de mradermacher, no el modelo original: la model card técnica completa (datos de entrenamiento, dimensiones del embedding, instrucciones de uso con transformers o vLLM) reside en el repositorio de NVIDIA, cuyos detalles no están disponibles en la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (modelo de embeddings basado en Nemotron; detalles no disponibles) |
| Parametros totales | 7.952.683.008 |
| Parametros activos | No aplicable (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K_S, Q2_K, IQ3_XXS, IQ3_XS, Q3_K_S, IQ3_S, IQ3_M, Q3_K_M, Q3_K_L, IQ4_XS, Q4_0, IQ4_NL, Q4_K_S, Q4_K_M, Q4_1, Q5_K_S, Q5_K_M, Q6_K (todas con imatrix) |
| Idiomas soportados | Multilingüe: en, ar, as, bn, bg, zh, da, nl, fi, fr, de, hi, id, it, ja, ko, ms, mr, ne, no, fa, pt, ro, ru, es, sw, sv, ta, te, th, uk, ur, vi |
| Licencia | openmdw-1.1 (heredada del modelo base, licencia "other") |
| Formato de pesos | GGUF (cuantizado con imatrix); el modelo base está en safetensors BF16 |

## Arquitectura y entrenamiento

El modelo base, Nemotron-3-Embed-8B-BF16, pertenece a la familia Nemotron de NVIDIA y se trata de un modelo de text embeddings de unos 8.000 millones de parámetros, etiquetado para las tareas de feature extraction, retrieval y semantic search. Los modelos de embeddings de este tipo suelen basarse en un transformer entrenado o ajustado mediante aprendizaje contrastivo para producir vectores densos comparables por similitud coseno; sin embargo, la información proporcionada no detalla la arquitectura exacta, el número de tokens de entrenamiento, la composición del dataset ni el procedimiento de ajuste fino, por lo que estos datos no están disponibles.

Respecto a la versión aquí descrita, mradermacher ha aplicado cuantización con importance matrix (imatrix), una técnica que calcula estadísticas de importancia sobre un corpus de calibración para minimizar la pérdida de calidad al reducir la precisión de los pesos. El repositorio ofrece cuantos desde IQ1_S (2,0 GB) hasta Q6_K (6,6 GB), además de un archivo imatrix de 0,1 GB para quien desee generar sus propias cuantizaciones. También existe una versión de cuantos estáticos en un repositorio hermano.

## Capacidades

- Generación de text embeddings densos a partir de texto de entrada (feature extraction).
- Recuperación de información (retrieval) y búsqueda semántica sobre corpus documentales.
- Construcción de sistemas RAG como componente de embedding para indexación y consulta.
- Soporte multilingüe para 33 idiomas, incluidos castellano, inglés, chino, japonés, árabe, hindi y ruso.
- Ejecución local mediante runtimes compatibles con GGUF (llama.cpp y derivados como Ollama o LM Studio).
- Compatibilidad declarada con vLLM según las etiquetas del repositorio.
- No es un modelo generativo de chat: no produce texto conversacional ni soporta tool calling.

## Casos de uso

- Búsqueda semántica en documentación interna: se indexan documentos de la empresa como vectores y las consultas de los empleados se comparan por similitud, encontrando resultados relevantes aunque no compartan palabras clave exactas.
- RAG autoalojado: el modelo genera los embeddings del corpus y de las consultas de usuario en un pipeline con una base vectorial (por ejemplo, Qdrant o Milvus), alimentando después a un LLM generativo; al ser local, los datos sensibles no salen de la infraestructura.
- Búsqueda multilingüe en catálogos o bases de conocimiento: gracias al soporte de 33 idiomas, una consulta en castellano puede recuperar documentos escritos en inglés u otros idiomas sin necesidad de traducción previa.
- Deduplicación y agrupación de texto: los embeddings permiten clustering de tickets de soporte, noticias o comentarios para detectar temas recurrentes o contenido duplicado.
- Clasificación semántica ligera: comparando el embedding de un texto con embeddings de etiquetas descriptivas se pueden enrutar consultas o clasificar documentos sin entrenar un clasificador específico.
- Sistemas de recomendación de contenido: cálculo de similitud entre descripciones de productos o artículos para recomendar elementos cercanos semánticamente al interés del usuario.
- Despliegue en hardware de borde o estaciones de trabajo sin GPU de gama alta: con cuantos de 3-5 GB, el modelo cabe en GPUs de consumo o incluso en CPU, facilitando la integración en aplicaciones de escritorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio cuantizado no incluye evaluaciones (MTEB ni otras), y los datos del modelo base de NVIDIA no figuran en la información proporcionada. Además, la calidad de los embeddings puede degradarse en cuantizaciones agresivas (IQ1/IQ2), algo que conviene validar empíricamente en cada caso de uso.

## Requisitos de hardware

- VRAM estimada para inferencia: desde unos 2 GB con el cuant i1-IQ1_S hasta unos 6,6 GB con i1-Q6_K; el modelo base en BF16 requeriría aproximadamente 16 GB solo para los pesos.
- GPU recomendadas: cualquier GPU moderna con suficiente VRAM es válida dada la naturaleza de embeddings; un RTX 3060 de 12 GB o una RTX 4090 ejecutan sin problemas los cuantos de hasta Q6_K. No se requieren A100 ni H100 para inferencia.
- Consumer GPUs: sí, cabe con holgura; incluso un cuant Q4_K_M (5,0 GB) funciona en GPUs de 6-8 GB de VRAM.
- CPU: viable con llama.cpp y cuantos bajos/medios, a costa de mayor latencia en la indexación de grandes corpus.
- Opciones de despliegue: llama.cpp y derivados (Ollama, LM Studio) para GGUF; vLLM está mencionado en las etiquetas del repositorio; el modelo base admite la librería transformers de Hugging Face.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Idiomas | Licencia |
|---|---|---|---|---|
| Nemotron-3-Embed-8B (este, cuantizado) | 7,95 B | GGUF (imatrix) | 33 | openmdw-1.1 |
| BGE-M3 (BAAI) | ~0,57 B | safetensors | ~100 | MIT |
| multilingual-e5-large (intfloat) | ~0,56 B | safetensors | ~100 | MIT |
| GTE-Qwen2-7B-instruct (Alibaba) | ~7,6 B | safetensors | multilingüe | Apache 2.0 |

Nota: los datos de la tabla corresponden a conocimiento general de estos modelos comparables; para Nemotron-3-Embed-8B no hay métricas de calidad publicadas en la información disponible, por lo que la comparación de rendimiento no puede realizarse con números concretos.

## Limitaciones y advertencias

- No es un modelo generativo: no sirve para chat, razonamiento ni generación de código; su salida son vectores.
- La cuantización extrema (IQ1_S, IQ1_M, IQ2_XXS) puede degradar notablemente la calidad de los embeddings; mradermacher marca estos cuantos como "para desesperados" y recomienda rangos intermedios como Q4_K_S o Q4_K_M.
- No hay benchmarks públicos (por ejemplo MTEB) en la información disponible para validar su calidad frente a otros modelos de embeddings.
- La longitud de contexto máxima no está especificada aquí; debe consultarse la model card del modelo base antes de indexar documentos largos.
- La licencia openmdw-1.1 es una licencia "other" (no una licencia estándar tipo Apache/MIT); conviene revisar sus términos antes de un uso comercial.
- Como todo modelo de embeddings, puede reflejar sesgos presentes en sus datos de entrenamiento, afectando a la relevancia y equidad de los resultados de búsqueda.
- El repositorio cuantizado no incluye instrucciones de uso específicas del modelo (por ejemplo, prefijos de instrucción o pooling); estas deben consultarse en la model card original de NVIDIA.

## Enlaces

- Repositorio cuantizado (esta ficha): https://huggingface.co/mradermacher/Nemotron-3-Embed-8B-BF16-i1-GGUF
- Modelo base de NVIDIA: https://huggingface.co/nvidia/Nemotron-3-Embed-8B-BF16
- Cuantos estáticos del mismo modelo: https://huggingface.co/mradermacher/Nemotron-3-Embed-8B-BF16-GGUF
- Página de descargas de mradermacher: https://hf.tst.eu/model#Nemotron-3-Embed-8B-BF16-i1-GGUF
- Licencia openmdw-1.1: https://openmdw.ai/license/1-1/
- Guía de uso de GGUF referenciada (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
