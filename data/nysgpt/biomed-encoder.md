# NYSgpt/biomed-encoder

## Resumen
NYSgpt/biomed-encoder es un modelo de embeddings densos especializado en el dominio biomédico, desarrollado por NYSgpt (Brendan Stanton). Se trata de un fine-tuning del modelo BAAI/bge-m3 sobre preprints de bioRxiv y medRxiv, con el objetivo de mejorar la recuperación de literatura científica en biomedicina. Está diseñado para tareas de retrieval y búsqueda semántica, generando representaciones vectoriales de alta calidad para textos biomédicos.

El modelo hereda la arquitectura de bge-m3, un encoder basado en XLM-RoBERTa con 567 millones de parámetros. Su pipeline es de feature-extraction y se distribuye en formato safetensors con licencia MIT. Aunque el acceso está restringido (gated) en HuggingFace, su uso está permitido bajo dicha licencia. Su relevancia radica en la creciente necesidad de herramientas de búsqueda eficientes sobre el creciente volumen de publicaciones científicas biomédicas.

## Especificaciones tecnicas
| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (XLM-RoBERTa) |
| Parametros totales | 567.754.752 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (hereda de bge-m3, pero no confirmado) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento
El modelo se basa en la arquitectura de BAAI/bge-m3, un encoder transformer con atención densa y embeddings de longitud fija. Al ser un fine-tuning, conserva la estructura de bge-m3, que es un modelo de tipo XLM-RoBERTa con 568 millones de parámetros. No se han publicado detalles específicos sobre el número de tokens de entrenamiento, la composición exacta del dataset ni el uso de técnicas como RLHF o DPO. Lo que sí se conoce es que el ajuste se realizó sobre preprints de bioRxiv y medRxiv, con el objetivo de adaptar las representaciones al lenguaje técnico de la literatura biomédica.

No se dispone de información sobre innovaciones técnicas adicionales más allá del fine-tuning, ni sobre técnicas de decodificación especulativa o atención lineal, ya que se trata de un encoder puro.

## Capacidades
- Generación de embeddings densos para textos biomédicos, optimizados para recuperación semántica.
- Búsqueda de documentos por similitud vectorial (retrieval) en corpus de preprints y artículos científicos.
- Compatible con bibliotecas de sentence-transformers y herramientas de inferencia como text-embeddings-inference.
- Soporte de búsqueda por similitud coseno o producto escalar en espacios de alta dimensión.
- Capacidad multilingüe limitada: solo se ha entrenado con inglés, aunque la arquitectura base de bge-m3 soporta más idiomas.
- No es un modelo generativo, no soporta tool calling, agentes ni razonamiento multi-step.

## Casos de uso
- **Búsqueda de literatura biomédica**: indexar preprints de bioRxiv y medRxiv y permitir búsquedas por similitud semántica para localizar papers relevantes a partir de una consulta en lenguaje natural.
- **Sistemas de respuesta a preguntas sobre papers**: combinar el encoder con un modelo de lectura para responder preguntas concretas sobre un conjunto de documentos recuperados.
- **Deduplicación de documentos**: comparar embeddings para identificar duplicados o versiones de un mismo preprint en diferentes repositorios.
- **Recomendación de artículos**: usar los embeddings para recomendar papers relacionados según el perfil de investigación de un usuario.
- **Clasificación de documentos**: entrenar un clasificador lineal sobre los embeddings para categorizar artículos por área temática (oncología, genética, etc.).
- **Búsqueda dentro de un corpus interno**: integrar el modelo en un pipeline de RAG (Retrieval-Augmented Generation) para sistemas de consulta sobre documentación biomédica corporativa.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- **VRAM estimada**: para inferencia en FP32, el modelo ocupa aproximadamente 2,3 GB de memoria (según el tamaño del repo). En FP16 sería ~1,2 GB y en int8 ~0,6 GB (estimación, no confirmada).
- **GPU recomendadas**: cualquier GPU con al menos 4 GB de VRAM puede ejecutarlo cómodamente, por ejemplo RTX 3060, RTX 3090, o incluso una T4 de 16 GB.
- **Compatibilidad con consumer GPU**: sí, cabe en la mayoría de GPUs de consumo actuales (a partir de 4 GB).
- **Opciones de despliegue**: se puede servir con vLLM, llama.cpp (aunque es encoder, no es típico), Ollama (no para embeddings), pero principalmente con sentence-transformers, o mediante TEI (text-embeddings-inference) de HuggingFace.
- **Latencia y throughput**: al ser un modelo de 568M, la inferencia es rápida; se pueden procesar miles de textos por minuto en una GPU moderna, pero no se tienen datos exactos.

## Comparativa con modelos similares
No se dispone de datos de rendimiento comparativos para este modelo. Sin embargo, se puede comparar a nivel estructural con otros modelos de embeddings biomédicos:

| Modelo | Parámetros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| NYSgpt/biomed-encoder | 568M | no disponible | MIT | Fine-tune de bge-m3 sobre preprints biomédicos |
| BAAI/bge-m3 | 818M | 8192 | MIT | Modelo de embeddings multilingüe general |
| BioBERT | 110M | 512 | MIT | Fine-tune de BERT sobre PubMed |
| all-MiniLM-L6-v2 | 22M | 256 | Apache-2.0 | Embeddings ligeros generales |

Nota: los datos de contexto de biomed-encoder no están confirmados, pero se heredan probablemente de bge-m3 (8192).

## Limitaciones y advertencias
- **Acceso restringido**: el modelo es gated, es decir, requiere aceptar condiciones en HuggingFace para su descarga, lo que puede dificultar su integración en pipelines automatizados.
- **Idioma**: solo entrenado en inglés; no es adecuado para textos en otros idiomas sin fine-tuning adicional.
- **Sesgos**: al ser entrenado sobre preprints, puede heredar sesgos de la literatura científica (publicación, idioma, campos dominantes).
- **Riesgo de alucinación**: como encoder, no genera texto, por lo que no hay riesgo de alucinación, pero los embeddings pueden no capturar matices semánticos en dominios muy especializados.
- **Sin garantía de actualización**: no se sabe si el modelo se actualizará con nuevos preprints; es una versión estática.
- **Uso comercial**: la licencia MIT permite uso comercial, pero el acceso restringido puede requerir una revisión de términos.

## Enlaces
- [Modelo en HuggingFace](https://huggingface.co/NYSgpt/biomed-encoder)
- [Perfil del autor NYSgpt](https://huggingface.co/NYSgpt)
- [Modelo base BAAI/bge-m3](https://huggingface.co/BAAI/bge-m3) (para referencia)</think>## Resumen
NYSgpt/biomed-encoder es un modelo de embeddings densos especializado en el ámbito biomédico, desarrollado por NYSgpt (Brendan Stanton). Se trata de un fine-tuning del modelo BAAI/bge-m3 sobre preprints de bioRxiv y medRxiv, con el objetivo de mejorar la recuperación de literatura científica en biomedicina. Está diseñado para tareas de búsqueda semántica y retrieval, generando representaciones vectoriales de alta calidad para textos biomédicos.

El modelo hereda la arquitectura de bge-m3, un encoder basado en XLM-RoBERTa con 567,7 millones de parámetros. Su pipeline es de feature-extraction y se distribuye en formato safetensors con licencia MIT. Aunque el acceso está restringido (gated) en HuggingFace, la licencia permite uso comercial. Su relevancia radica en la creciente necesidad de herramientas de búsqueda eficientes sobre el volumen creciente de publicaciones científicas biomédicas.

## Especificaciones tecnicas
| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (XLM-RoBERTa) |
| Parametros totales | 567.754.752 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (hereda de bge-m3, pero no confirmado) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento
El modelo se basa en la arquitectura de BAAI/bge-m3, un encoder con atención densa y embeddings de tipo transformer. Al ser un fine-tuning, conserva la estructura de bge-m3, que es un modelo XLM-RoBERTa con 568 millones de parámetros. No se han publicado especificaciones sobre el número de tokens de entrenamiento, la composición exacta del dataset ni el uso de técnicas como RLHF o DPO. Lo único que se conoce es que el ajuste se realizó sobre preprints de bioRxiv y medRxiv, con el objetivo de optimizar las representaciones para el lenguaje técnico de la literatura biomédica.

No se dispone de información sobre innovaciones técnicas adicionales, como decodificación especulativa o atención lineal, ya que se trata de un encoder puro y no de un modelo generativo.

## Capacidades
- Generación de embeddings densos para textos biomédicos, optimizados para recuperación semántica.
- Búsqueda de documentos por similaridad vectorial en corpus de preprints y artículos científicos.
- Compatible con bibliotecas de sentence-transformers y con el servidor text-embeddings-inference de HuggingFace.
- Soporte de búsqueda por similitud coseno o distancia euclidiana en espacios de alta dimensión.
- Capacidad multilingüe limitada: solo entrenado en inglés, aunque la arquitectura base de bge-m3 soporta más idiomas.
- No es un modelo generativo, no soporta tool calling, agentes ni razonamiento multi-step.

## Casos de uso
- **Búsqueda de literatura biomédica**: indexar artículos de bioRxiv y medRxiv y permitir consultas en lenguaje natural para localizar documentos relevantes mediante similitud de embeddings.
- **Sistemas de respuesta a preguntas sobre papers**: combinar este encoder con un modelo de lectura para extraer respuestas concretas de artículos recuperados.
- **Deduplicación de documentos**: comparar embeddings para identificar artículos duplicados o versiones de un mismo preprint en distintos repositorios.
- **Recomendación de artículos**: generar vectores de perfil de usuario y compararlos con los embeddings de artículos para sugerir publicaciones relacionadas.
- **Clasificación de documentos**: usar los embeddings como entrada para un clasificador lineal que categorice textos por área temática (oncología, genética, etc.).
- **Integración en pipelines de RAG**: emplear los embeddings para recuperar fragmentos de documentos biomédicos en sistemas de generación aumentada por recuperación (Retrieval-Augmented Generation).

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- **VRAM estimada**: en FP32, el modelo ocupa aproximadamente 2,3 GB de memoria (según tamaño del repositorio). En FP16 sería ~1,2 GB y en int8 ~0,6 GB (estimación orientativa, no confirmada).
- **GPU recomendadas**: cualquier GPU con al menos 4 GB de VRAM puede ejecutarlo, como RTX 3060, RTX 3090 o T4.
- **Compatibilidad con consumer GPU**: sí, cabe en la mayoría de GPUs de consumo (8 GB o más).
- **Opciones de despliegue**: se puede servir mediante sentence-transformers, text-embeddings-inference (TEI) de HuggingFace, o bien con vLLM (aunque es menos habitual para encoders).
- **Latencia y throughput**: al ser un modelo de 568M, la inferencia es rápida; en una GPU moderna se pueden procesar miles de documentos por minuto, pero no se han publicado cifras exactas.

## Comparativa con modelos similares
| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| NYSgpt/biomed-encoder | 567,7 M | no disponible | MIT | Fine-tuning de bge-m3 sobre preprints biomédicos |
| BAAI/bge-m3 | 818 M | 8192 (según original) | Apache-2.0 | Embeddings multilingües generales |
| BioBERT | 110 M | 512 | Apache-2.0 | Fine-tuning de BERT sobre PubMed |
| all-MiniLM-L6-v2 | 22 M | 256 | Apache-2.0 | Embeddings ligeros generales |

Nota: el contexto de biomed-encoder no está confirmado; se espera que herede los 8192 tokens de bge-m3, pero no se ha verificado.

## Limitaciones y advertencias
- **Acceso restringido**: el modelo es gated, por lo que se debe aceptar condiciones en HuggingFace para descargarlo, lo que puede dificultar su integración en pipelines automáticos.
- **Idioma**: solo entrenado en inglés, no es adecuado para textos en otros idiomas sin un fine-tuning adicional.
- **Sesgos**: al entrenarse sobre preprints, puede heredar sesgos de la literatura científica (idioma, género, geografía, líneas de investigación dominantes).
- **Riesgo de alucinación**: como encoder, no genera texto, por lo que no hay riesgo de alucinación, pero los embeddings pueden no capturar matices semánticos en dominios muy especializados.
- **Actualización**: no se indica si el modelo se actualizará con nuevos preprints; es una versión estática.
- **Uso comercial**: la licencia MIT lo permite, pero el acceso gated puede requerir una solicitud formal.

## Enlaces
- [Modelo en HuggingFace](https://huggingface.co/NYSgpt/biomed-encoder)
- [Perfil del autor NYSgpt](https://huggingface.co/NYSgpt)
- [Modelo base BAAI/bge-m3](https://huggingface.co/BAAI/bge-m3) (para referencia)
