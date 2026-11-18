# alphaedge-ai/multilingual-e5-large-instruct-mon-32768

## Resumen

`alphaedge-ai/multilingual-e5-large-instruct-mon-32768` es un modelo de embeddings de frases (sentence-similarity) derivado de `intfloat/multilingual-e5-large-instruct` mediante la técnica de *trimming* de vocabulario, especializado para el idioma mongol. El autor, alphaedge-ai, ha reducido el vocabulario del modelo original de 250.037 a 32.768 tokens (una reducción del 86,89%), lo que se traduce en una disminución del 39,73% en el número de parámetros: de 559.890.432 a 337.442.816. El objetivo es ofrecer un modelo de recuperación semántica más ligero y con menor huella de memoria para despliegues centrados en mongol, manteniendo un comportamiento similar al original en ese idioma.

El modelo conserva la arquitectura XLM-RoBERTa del E5 original y se distribuye en formato safetensors a través de la librería `sentence-transformers`, con licencia MIT. El repositorio ocupa 0,7 GB y está etiquetado como compatible con `text-embeddings-inference` y endpoints. Es relevante para equipos que necesiten búsqueda semántica o RAG en mongol con requisitos de memoria reducidos, aunque su utilidad fuera de ese idioma es limitada por el recorte agresivo del vocabulario.

No se han publicado resultados de benchmarks, métricas de recuperación ni detalles sobre el proceso de *mining* más allá del uso de 200.000 textos del dataset `lbourdois/fineweb-2-trimming`. El modelo tiene un uso muy reducido en el ecosistema (10 descargas, 0 likes en el momento de la consulta).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | XLM-RoBERTa (transformer encoder), base de E5 |
| Parámetros totales | 337.442.816 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (el sufijo 32768 del nombre hace referencia al tamaño de vocabulario, no al contexto) |
| Tipos de cuantización | no disponible (pesos en safetensors; compatible con cuantización estándar vía sentence-transformers/TEI) |
| Idiomas soportados | mongol (mn); otros idiomas degradados por el recorte de vocabulario |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un encoder transformer basado en XLM-RoBERTa, heredado directamente de `intfloat/multilingual-e5-large-instruct`. No se ha reentrenado desde cero: la intervención consiste en el recorte del vocabulario (*trimming*) para eliminar los tokens poco frecuentes en mongol, conservando 32.768 entradas. Según la model card, la selección de tokens se realizó mediante *mining* sobre 200.000 textos del dataset `lbourdois/fineweb-2-trimming`. El modelo original incorpora entrenamiento con instrucciones (variante *instruct*) y la técnica E5 de prefijos `query:` y `document:` para recuperación asimétrica, que se mantiene en esta versión.

La innovación principal es puramente de eficiencia: al reducir el vocabulario, disminuye el tamaño de la matriz de embeddings y, por tanto, el número total de parámetros y la memoria necesaria, manteniendo la dimensionalidad del encoder. No se documentan cambios en las capas del transformer, en la dimensionalidad de los embeddings ni en el proceso de entrenamiento posterior al recorte. No se especifican el número de tokens de entrenamiento, la composición del dataset de preentrenamiento original ni si hubo RLHF/DPO (el modelo base E5 no emplea RLHF en su pipeline habitual, pero este dato no se confirma en la información disponible).

## Capacidades

- Generación de embeddings de frases para similitud semántica y recuperación de información (pipeline `sentence-similarity`).
- Codificación asimétrica de consultas y documentos mediante `encode_query` y `encode_document`, con los prefijos instructivos heredados de E5.
- Búsqueda semántica y *dense retrieval* en mongol.
- Soporte multilingüe degradado: el vocabulario recortado elimina tokens de otros idiomas, por lo que el rendimiento fuera del mongol puede ser notablemente inferior.
- Compatibilidad con `text-embeddings-inference` y endpoints de Hugging Face para despliegue como servicio de embeddings.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión ni audio: es un modelo exclusivamente de embeddings.

## Casos de uso

- Búsqueda semántica en mongol: indexar un corpus de documentos en mongol con `encode_document` y recuperar los fragmentos más relevantes ante consultas de usuario con `encode_query`, aprovechando la reducción de memoria del vocabulario recortado.
- RAG (generación aumentada por recuperación) sobre documentación en mongol: usar el modelo como recuperador en un pipeline con un LLM generador, con una huella de memoria un 39,73% menor que el E5 original.
- Deduplicación y clustering de textos en mongol: calcular embeddings de un conjunto de documentos y agrupar por similitud coseno para eliminar duplicados o organizar contenidos.
- Moderación y clasificación semántica de contenido en mongol: comparar embeddings de mensajes contra embeddings de referencia de categorías predefinidas.
- Motor de recomendación de contenidos en mongol: representar ítems y perfiles de usuario como vectores y calcular afinidad por similitud.
- Despliegue en entornos con recursos limitados: al ocupar 0,7 GB en safetensors y tener 337 millones de parámetros, puede servirse en infraestructura modesta mediante `text-embeddings-inference` o sentence-transformers, sin necesidad de GPUs de gama alta.
- Evaluación de similitud de pares de frases en mongol para tareas de paráfrasis o control de calidad de traducciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 1,35 GB solo para pesos (337 M de parámetros × 4 bytes), más overhead de activaciones y tokenizador; en la práctica, alrededor de 2 GB.
- En fp16/bf16: aproximadamente 0,7 GB para pesos; en la práctica, alrededor de 1-1,5 GB con overhead.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; tarjetas como RTX 3060, RTX 4090, A100 o H100 son más que suficientes. El modelo cabe holgadamente en GPUs de consumo.
- También puede ejecutarse en CPU para cargas de baja concurrencia, dado su tamaño reducido.
- Opciones de despliegue: `sentence-transformers`, `text-embeddings-inference` (TEI), endpoints de Hugging Face. No se documenta soporte explícito para vLLM, llama.cpp u Ollama (son herramientas orientadas a modelos generativos, no a encoders de embeddings).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Vocabulario | Idiomas | Licencia | Contexto |
|---|---|---|---|---|---|
| alphaedge-ai/multilingual-e5-large-instruct-mon-32768 | 337.442.816 | 32.768 | mongol (mn) | MIT | no disponible |
| intfloat/multilingual-e5-large-instruct (base) | 559.890.432 | 250.037 | multilingüe | MIT | no disponible |
| intfloat/multilingual-e5-large | no disponible en la información | no disponible | multilingüe | MIT | no disponible |
| intfloat/multilingual-e5-base | no disponible en la información | no disponible | multilingüe | MIT | no disponible |

El modelo base `intfloat/multilingual-e5-large-instruct` es la alternativa directa cuando se necesita cobertura multilingüe completa. Las variantes `multilingual-e5-base` y `multilingual-e5-large` son opciones de la misma familia con distinto tamaño, pero no se dispone de sus especificaciones exactas en la información proporcionada. No se dispone de datos de rendimiento comparado (benchmarks) para establecer diferencias cuantitativas.

## Limitaciones y advertencias

- El recorte de vocabulario elimina tokens de otros idiomas: el rendimiento fuera del mongol puede degradarse significativamente, tal como advierte la propia model card.
- No se han publicado métricas de recuperación (Recall@k, nDCG, MRR) que confirmen que el rendimiento en mongol se mantiene respecto al modelo original; la afirmación de "comportamiento similar" no está cuantificada.
- Riesgo de alucinación no aplica en sentido generativo (es un encoder), pero sí existe riesgo de recuperaciones irrelevantes si el corpus o las consultas contienen vocabulario fuera del vocabulario recortado (por ejemplo, préstamos, nombres propios o transliteraciones).
- El campo `language: mn` en la model card y la etiqueta de idioma limitan las expectativas de uso multilingüe.
- Licencia MIT: permite uso comercial, pero se recomienda verificar la licencia del modelo base (`intfloat/multilingual-e5-large-instruct`, también MIT) y del dataset de *mining* (`lbourdois/fineweb-2-trimming`) para el cumplimiento completo.
- El modelo tiene un uso muy reducido en el ecosistema (10 descargas, 0 likes), por lo que no hay validación comunitaria ni reportes de producción.
- No se especifica la longitud máxima de secuencia soportada; el sufijo "32768" del nombre alude al vocabulario, no al contexto, lo que puede inducir a confusión.
- No se documentan sesgos específicos; al derivar de un modelo multilingüe entrenado con datos web, puede heredar sesgos presentes en esos datos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/alphaedge-ai/multilingual-e5-large-instruct-mon-32768
- Modelo base: https://huggingface.co/intfloat/multilingual-e5-large-instruct
- Dataset de *mining*: https://huggingface.co/datasets/lbourdois/fineweb-2-trimming
- Blog sobre trimming: https://huggingface.co/blog/lbourdois/introduction-to-trimming
- Paper Multilingual E5: https://arxiv.org/abs/2402.05672
- Repositorio del blog de trimming (imagen de estadísticas): https://github.com/lbourdois/blog
