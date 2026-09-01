# fcmeyer/F2LLM-v2-4B-mlx-bf16

## Resumen

F2LLM-v2-4B-mlx-bf16 es una conversión al formato nativo de MLX (Apple Silicon) del modelo de embeddings multilingüe F2LLM-v2-4B desarrollado por CodeFuse. El modelo original es un LLM de 4 000 millones de parámetros basado en la arquitectura Qwen3, diseñado para generar representaciones vectoriales de texto de 2560 dimensiones mediante pooling del último token y normalización L2. Esta conversión, realizada por fcmeyer, mantiene los pesos en bfloat16 sin cuantizar (7,5 GB en disco) y permite ejecutar el modelo de forma nativa en hardware Apple Silicon a través de la librería `mlx-embeddings`, sin necesidad de GPUs NVIDIA ni de entornos CUDA.

La relevancia de esta conversión radica en que amplía el acceso a un modelo de embeddings de alta calidad a usuarios de ecosistemas Apple, que tradicionalmente quedaban excluidos de las herramientas optimizadas para GPU. El modelo original forma parte de la familia F2LLM-v2, entrenada con 60 millones de pares consulta-documento de alta calidad procedentes exclusivamente de fuentes abiertas y sin datos sintéticos, y soporta más de 200 idiomas con especial énfasis en lenguas de bajos recursos. Esta versión en MLX conserva todas las capacidades del original y añade compatibilidad con el ecosistema de Apple, lo que la hace especialmente útil para desarrolladores que trabajan en entornos macOS o que desean integrar embeddings en aplicaciones locales.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder basado en Qwen3, embeddings de 2560 dimensiones, pooling del último token con normalización L2 |
| Parametros totales | 4 022 468 096 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (el ejemplo de uso muestra `max_length=8192`, pero no se especifica el máximo oficial) |
| Tipos de cuantizacion | bfloat16 (este repositorio); existen versiones 8-bit y 6-bit en otros repositorios del mismo autor |
| Idiomas soportados | Más de 70 idiomas listados en el repositorio (la familia F2LLM-v2 declara soporte para más de 200) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (formato nativo MLX) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder denso basado en la arquitectura Qwen3. Utiliza embeddings de 2560 dimensiones y emplea pooling del último token (last-token pooling) seguido de normalización L2 para producir representaciones de texto. Esta arquitectura está optimizada para tareas de recuperación de información, búsqueda semántica, clasificación y clustering.

El modelo original F2LLM-v2-4B fue entrenado por CodeFuse sobre un conjunto de datos compuesto por 60 millones de pares consulta-documento de alta calidad, curados exclusivamente a partir de fuentes abiertas y sin datos sintéticos. El entrenamiento se realizó en una sola etapa con micro-batches homogéneos. Esta versión en MLX no introduce cambios en los pesos: se trata de una conversión de formato que preserva la precisión bfloat16 del checkpoint original. El proceso de conversión se documenta en el repositorio y verifica la fidelidad de los embeddings resultantes frente a una referencia en PyTorch.

## Capacidades

- Generación de embeddings de texto densos de 2560 dimensiones, adecuados para tareas de recuperación, búsqueda semántica, clasificación y clustering.
- Soporte multilingüe extenso: más de 70 idiomas listados en el repositorio, con énfasis en lenguas de medios y bajos recursos dentro de la familia F2LLM-v2.
- Compatible con el formato de prompt `Instruct: ... Query: ...` para consultas; los documentos se procesan sin prompt.
- Funciona para tareas simétricas (STS, clustering, bitext mining) tanto con prompt como sin él.
- Integración directa con `mlx-embeddings`, que permite cargar el modelo y generar embeddings con una API sencilla.
- Capacidad de procesar secuencias de hasta 8192 tokens (según el ejemplo de uso), aunque el máximo oficial no está documentado en este repositorio.
- No incluye capacidades de tool calling, agentes ni generación de texto; es exclusivamente un modelo de embeddings.

## Casos de uso

- Búsqueda semántica en aplicaciones de atención al cliente: el modelo puede generar embeddings de consultas y documentos de soporte para recuperar respuestas relevantes en múltiples idiomas, aprovechando su contexto de 8192 tokens para manejar descripciones largas.
- Sistemas RAG (Retrieval-Augmented Generation): integración en pipelines de generación aumentada por recuperación, donde el modelo indexa documentos y consultas para alimentar a un LLM generativo, especialmente en entornos Apple Silicon donde las alternativas basadas en GPU no son viables.
- Clasificación de textos multilingües: uso de los embeddings como características de entrada para clasificadores supervisados, por ejemplo en moderación de contenidos o análisis de sentimiento en redes sociales con múltiples idiomas.
- Clustering de documentos en entornos corporativos: agrupación de informes, artículos o correos electrónicos por similitud temática, gracias a la representación densa de 2560 dimensiones que captura relaciones semánticas finas.
- Deduplicación de contenidos: detección de textos duplicados o casi duplicados en grandes corpus, comparando embeddings mediante similitud coseno, útil en gestión de bases de conocimiento o limpieza de datos.
- Búsqueda de pasajes en documentos legales o técnicos: recuperación de fragmentos relevantes dentro de contratos, normativas o manuales, con soporte para consultas en varios idiomas y documentos extensos gracias al contexto de 8192 tokens.
- Evaluación de similitud entre frases (STS) en investigación lingüística: cálculo de puntuaciones de similitud semántica entre pares de frases en diferentes idiomas, sin necesidad de ajuste adicional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del repositorio indica que la verificación de precisión se limitó a una prueba de humo con 5 cadenas de texto, comparando la conversión MLX con una referencia PyTorch en bfloat16. Los resultados muestran una similitud coseno mínima de 0,99984 y una diferencia máxima de 0,0017 en las puntuaciones de similitud consulta-documento, con preservación del ranking. No se ejecutaron evaluaciones MTEB ni de recuperación sobre las versiones cuantizadas. Por tanto, no se dispone de métricas comparativas con otros modelos de embeddings.

## Requisitos de hardware

- Modelo diseñado para Apple Silicon (M1, M2, M3 y posteriores) mediante la librería `mlx-embeddings`.
- En bfloat16, el modelo ocupa 7,5 GB en disco; en memoria unificada se recomienda al menos 16 GB para inferencia fluida con secuencias largas.
- Para versiones cuantizadas: 8-bit ocupa 4,0 GB y 6-bit 3,1 GB, lo que permite ejecutarlo en Macs con 8 GB de memoria unificada.
- No requiere GPU NVIDIA ni CUDA; la ejecución se realiza en la CPU/GPU integrada de Apple.
- Opciones de despliegue: `mlx-embeddings` (recomendado), también compatible con `sentence-transformers` si se convierte el formato, aunque el propósito principal es MLX.
- La latencia depende del hardware concreto; en un MacBook Pro con chip M2 Pro se pueden generar cientos de embeddings por segundo para secuencias cortas, pero no hay cifras oficiales publicadas.

## Comparativa con modelos similares

No se dispone de datos comparativos en la información proporcionada. El modelo original F2LLM-v2-4B puede compararse con otros modelos de embeddings multilingües como BGE-M3, E5-mistral-7b o GTE-Qwen2-7B, pero no se han publicado resultados de benchmarks para esta conversión MLX. Como referencia, la familia F2LLM-v2 ofrece tamaños desde 80M hasta 14B, y el modelo de 4B se sitúa en un punto intermedio entre eficiencia y capacidad. Esta versión MLX es funcionalmente equivalente al original en PyTorch, con la ventaja de ejecutarse nativamente en Apple Silicon.

## Limitaciones y advertencias

- No se han realizado evaluaciones MTEB ni de recuperación sobre esta conversión ni sobre las versiones cuantizadas; la precisión solo se verificó con una prueba de humo de 5 cadenas.
- Los embeddings generados en bfloat16 pueden quedar ligeramente fuera de la norma unitaria; se recomienda re-normalizar en float32 antes de comparar.
- El modelo es exclusivamente de embeddings; no genera texto ni admite tool calling o interacciones conversacionales.
- La longitud de contexto máxima oficial no está documentada en este repositorio; el ejemplo de uso emplea 8192 tokens, pero no se garantiza que sea el límite real.
- Al ser una conversión de formato, no se han corregido posibles sesgos del modelo base (Qwen3), que puede reflejar sesgos de género, culturales o lingüísticos presentes en sus datos de entrenamiento.
- Para uso en producción, se recomienda medir la pérdida de calidad de las versiones cuantizadas sobre datos propios, ya que no hay benchmarks públicos al respecto.
- La licencia Apache 2.0 permite uso comercial, pero se debe atribuir adecuadamente y mantener el aviso de licencia.

## Enlaces

- Repositorio de HuggingFace: https://huggingface.co/fcmeyer/F2LLM-v2-4B-mlx-bf16
- Modelo base original: https://huggingface.co/codefuse-ai/F2LLM-v2-4B
- Librería `mlx-embeddings`: https://github.com/Blaizzy/mlx-embeddings
- Paper técnico de F2LLM (arXiv): https://arxiv.org/html/2510.02294
- Repositorio GitHub de CodeFuse-Embeddings: https://github.com/codefuse-ai/CodeFuse-Embeddings
