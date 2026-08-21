# dakerholdings/BGE-Small-LegalEmbeddings-USCode-6bit-mlx

## Resumen

El modelo `dakerholdings/BGE-Small-LegalEmbeddings-USCode-6bit-mlx` es una conversión al formato MLX del modelo `ArchitRastogi/BGE-Small-LegalEmbeddings-USCode`, un fine-tuning del modelo de embeddings BGE-Small (basado en BERT) especializado en texto legal del Código de los Estados Unidos (USCode). El modelo original fue entrenado sobre el dataset `USCode-QAPairs-Finetuning`, un subconjunto del corpus USLawQA, con el objetivo de generar representaciones vectoriales de alta calidad para tareas de similitud semántica y recuperación de información en el dominio legal estadounidense.

La conversión a MLX, realizada por el usuario `dakerholdings`, permite ejecutar el modelo de forma eficiente en hardware Apple Silicon, manteniendo los pesos en formato `safetensors` y una cuantización de 6 bits. Con aproximadamente 33,2 millones de parámetros, es un modelo ligero y adecuado para entornos con recursos limitados, como aplicaciones de búsqueda semántica o sistemas de respuesta a preguntas (RAG) sobre legislación. Su licencia Apache 2.0 facilita su uso comercial y su integración en pipelines de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (BGE-Small) |
| Parametros totales | 33.212.160 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo base BGE-Small soporta 512 tokens, pero no se especifica en la informacion) |
| Tipos de cuantizacion | 6-bit (MLX) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura BERT de tamaño pequeño (BGE-Small), con 12 capas y una dimension de embedding de 384. El fine-tuning se realizo sobre el dataset `USCode-QAPairs-Finetuning`, que contiene pares de preguntas y respuestas extraidos del USCode, con el objetivo de optimizar la similitud coseno entre embeddings de preguntas y sus correspondientes respuestas. No se menciona el uso de tecnicas como RLHF o DPO; se trata de un ajuste supervisado clasico para tareas de similitud semantica.

La conversion a MLX se llevo a cabo con la herramienta `mlx-vlm` (version 0.6.15), que transforma los pesos originales de PyTorch al formato nativo de MLX, incluyendo una cuantizacion de 6 bits para reducir el tamano del modelo y acelerar la inferencia en hardware Apple. No se han documentado innovaciones tecnicas adicionales en el proceso de entrenamiento o conversion.

## Capacidades

- Generacion de embeddings de texto para similitud semantica, especialmente en el dominio legal estadounidense (USCode).
- Busqueda de documentos y recuperacion de informacion mediante similitud coseno o producto escalar.
- Soporte para integracion en pipelines de RAG (Retrieval-Augmented Generation) como componente de recuperacion.
- Clasificacion de textos legales basada en la proximidad de embeddings.
- Capacidad multilingue limitada: solo ingles, con vocabulario especifico del ambito legal de EE.UU.
- No soporta tool calling, agentes ni razonamiento multi-paso; es exclusivamente un modelo de embeddings.

## Casos de uso

- Busqueda semantica en bases de datos legales: el modelo permite indexar articulos del USCode y recuperar los mas relevantes para una consulta en lenguaje natural, gracias a su entrenamiento especifico en pares pregunta-respuesta.
- Asistentes legales basados en RAG: integrado en un sistema de generacion aumentada por recuperacion, puede proporcionar contexto legal preciso a un modelo generativo para responder consultas de usuarios.
- Clasificacion de documentos juridicos: los embeddings generados pueden alimentar clasificadores para categorizar contratos, sentencias o normativas segun su tematica.
- Deduplicacion de textos legales: comparando embeddings, se pueden identificar documentos duplicados o muy similares en grandes corpus.
- Sistemas de recomendacion de jurisprudencia: dado un caso o pregunta, se pueden sugerir articulos o precedentes relacionados.
- Analisis de similitud entre versiones de leyes: util para detectar cambios o diferencias entre textos legislativos.

## Benchmarks y rendimiento

Segun la model card del autor, el modelo fue evaluado en el dataset USLawQA (a traves del subconjunto USCode-QAPairs-Finetuning) con los siguientes resultados:

| Metrica | Valor |
|---|---|
| Accuracy | 0.72 |
| Recall | 0.75 |

Estos valores son declarados por el autor y no han sido verificados de forma independiente. No se dispone de comparaciones con otros modelos en la informacion proporcionada.

## Requisitos de hardware

- Al ser un modelo de 33M de parametros cuantizado a 6 bits, el tamano del repositorio es de aproximadamente 0.2 GB, por lo que cabe en cualquier GPU con al menos 1 GB de VRAM, incluso en tarjetas consumer como la GTX 1060 o superiores.
- En hardware Apple Silicon (M1 o posterior), el formato MLX permite una inferencia eficiente en CPU y GPU unificada, sin necesidad de GPU dedicada.
- Para despliegue en servidores, se puede utilizar `text-embeddings-inference` (mencionado en los tags) o cualquier framework compatible con safetensors y MLX, como `mlx-lm` o `mlx-vlm`.
- La latencia esperada es muy baja (del orden de milisegundos por consulta) debido al tamano reducido del modelo, aunque no se proporcionan cifras exactas.
- Opciones de despliegue: `mlx-vlm` (para generacion, aunque no es su uso principal), `sentence-transformers` (si se convierte a PyTorch), o servidores de embeddings como TEI.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Formato |
|---|---|---|---|---|---|
| BGE-Small-LegalEmbeddings-USCode (original) | 33M | 512 (tipico) | Legal USCode | Apache-2.0 | PyTorch |
| BGE-Small-LegalEmbeddings-USCode-6bit-mlx (este) | 33M | no disponible | Legal USCode | Apache-2.0 | MLX (6-bit) |
| BGE-Small-en-v1.5 (base) | 33M | 512 | General ingles | MIT | PyTorch/MLX |

El modelo se diferencia del BGE-Small original por su fine-tuning en datos legales, lo que mejora la precision en tareas de recuperacion de informacion juridica. La version MLX ofrece la ventaja de ejecucion nativa en Apple Silicon, aunque con la misma capacidad semantica.

## Limitaciones y advertencias

- El modelo esta entrenado exclusivamente con texto legal del USCode, por lo que su rendimiento fuera de ese dominio (por ejemplo, derecho europeo o textos no juridicos) puede ser significativamente inferior.
- Solo soporta ingles; no hay capacidades multilingues.
- La longitud de contexto no esta documentada en la informacion proporcionada; se asume la tipica de BGE-Small (512 tokens), pero no se garantiza.
- Al ser un modelo de embeddings, no genera texto ni realiza razonamiento; su uso se limita a tareas de representacion vectorial.
- Los benchmarks declarados (Accuracy 0.72, Recall 0.75) provienen de una unica evaluacion sobre USLawQA y no han sido verificados externamente.
- La conversion a MLX se realizo con `mlx-vlm`, una herramienta pensada para modelos de vision; aunque el proceso es valido, no se han publicado pruebas especificas de equivalencia de resultados con el modelo original.
- La licencia Apache-2.0 permite uso comercial, pero se recomienda revisar los terminos del dataset USCode-QAPairs-Finetuning para posibles restricciones de uso.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dakerholdings/BGE-Small-LegalEmbeddings-USCode-6bit-mlx
- Modelo original: https://huggingface.co/ArchitRastogi/BGE-Small-LegalEmbeddings-USCode
- Dataset de entrenamiento: https://huggingface.co/datasets/ArchitRastogi/USCode-QAPairs-Finetuning
- Dataset de evaluacion (USLawQA): https://huggingface.co/datasets/ArchitRastogi/USLawQA
- Documentacion de BGE: https://bge-model.com/
