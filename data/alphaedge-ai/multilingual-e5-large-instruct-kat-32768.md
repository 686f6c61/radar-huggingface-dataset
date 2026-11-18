# alphaedge-ai/multilingual-e5-large-instruct-kat-32768

## Resumen

multilingual-e5-large-instruct-kat-32768 es una versión recortada (trimmed) del modelo de embeddings intfloat/multilingual-e5-large-instruct, especializada en georgiano (ka) mediante reducción de vocabulario. Lo publica el usuario alphaedge-ai en Hugging Face y su propósito es ofrecer un encoder de frases mucho más ligero en memoria que el original, manteniendo un comportamiento similar para el idioma objetivo.

El modelo parte de una arquitectura XLM-RoBERTa (transformer encoder) con 337.442.816 parámetros tras el recorte, frente a los 559.890.432 del original, lo que supone una reducción del 39,73 % en tamaño. El vocabulario pasa de 250.037 a 32.768 tokens (una reducción del 86,89 %), seleccionados a partir de 200.000 textos en georgiano del dataset lbourdois/fineweb-2-trimming.

Es relevante para equipos que despliegan búsqueda semántica o RAG en georgiano con restricciones de memoria: el recorte reduce el footprint del repositorio a 0,7 GB y el número de parámetros, a costa de perder cobertura en otros idiomas. La licencia es MIT y se distribuye en formato safetensors para sentence-transformers y text-embeddings-inference.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | XLM-RoBERTa (transformer encoder), derivada de intfloat/multilingual-e5-large-instruct |
| Parametros totales | 337.442.816 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el sufijo 32768 hace referencia al tamaño de vocabulario, no a la ventana de contexto) |
| Tipos de cuantizacion | no disponible (el repo publica safetensors; no se documentan variantes GGUF/ONNX) |
| Idiomas soportados | georgiano (ka); el resto de idiomas del modelo original pueden degradarse por el recorte de vocabulario |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Dimension de embedding | no disponible |
| Tamano del repositorio | 0,7 GB |
| Libreria | sentence-transformers |
| Pipeline | sentence-similarity |
| Modelo base | intfloat/multilingual-e5-large-instruct (relacion: quantized) |
| Dataset de minado | lbourdois/fineweb-2-trimming (200.000 textos) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del multilingual-e5-large-instruct, un encoder XLM-RoBERTa entrenado para producir embeddings de frases y pasajes con instrucciones. Sobre esa base, el proceso de trimming reduce la matriz de embeddings de entrada y la capa de salida del vocabulario de 250.037 a 32.768 tokens, conservando los tokens más frecuentes en georgiano según el minado sobre 200.000 textos de fineweb-2. No se documenta un reentrenamiento completo del encoder ni fases adicionales de RLHF/DPO; la model card describe el resultado como un modelo que "debería comportarse de forma similar al original" para el idioma seleccionado.

La innovación técnica es precisamente el recorte de vocabulario: al eliminar tokens poco usados en georgiano, se reduce el número de parámetros en un 39,73 % y el tamaño en disco de forma proporcional, lo que abarata el despliegue en memoria. El precio es la pérdida de cobertura léxica para otros idiomas, ya que los tokens eliminados no se pueden recuperar en inferencia. El modelo conserva la interfaz de sentence-transformers con métodos `encode_query`, `encode_document` y `similarity`, y mantiene los tags de compatibilidad con text-embeddings-inference y endpoints.

## Capacidades

- Generación de embeddings de frases y pasajes para similitud semántica y ranking.
- Recuperación de información (retrieval) en georgiano: codificación separada de consultas y documentos mediante `encode_query` y `encode_document`.
- Búsqueda semántica y deduplicación de textos en georgiano.
- Soporte de instrucciones heredado del modelo E5 instruct original (no se detalla el formato exacto en la model card).
- Integración con sentence-transformers, text-embeddings-inference y endpoints compatibles.
- No soporta tool calling, agentes, visión, audio ni modos de razonamiento: es un encoder, no un modelo generativo.
- Capacidad multilingüe limitada: el recorte está optimizado para georgiano y puede degradar otros idiomas.

## Casos de uso

- Búsqueda semántica en georgiano: indexar un corpus de documentos georgianos con `encode_document` y consultar con `encode_query` para obtener rankings por similitud coseno, con un footprint de 0,7 GB que cabe en entornos con poca memoria.
- RAG sobre documentación en georgiano: usar el modelo como retriever en un pipeline de generación aumentada, recuperando los fragmentos más relevantes antes de pasarlos a un LLM generativo.
- Deduplicación de contenidos: calcular embeddings de artículos o registros en georgiano y agrupar por similitud para eliminar duplicados en bases de datos o crawlers.
- Clasificación y clustering de textos: agrupar noticias, tickets o reseñas en georgiano por temática usando los embeddings como features para k-means o clasificadores lineales.
- Moderación y filtrado: comparar mensajes de usuarios con una lista de patrones o políticas codificadas como documentos para detectar contenido similar.
- Despliegue en CPU o GPUs pequeñas: al reducir parámetros y vocabulario, el modelo es adecuado para servir embeddings en entornos con recursos limitados mediante text-embeddings-inference.
- Sistemas de recomendación basados en contenido: representar ítems y consultas en georgiano y recomendar por similitud semántica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo aporta métricas de tamaño (vocabulario y parámetros) y no incluye evaluaciones de MTEB, retrieval ni similitud para georgiano.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 1,35 GB solo para pesos (337,4 M de parámetros × 4 bytes), más overhead de activaciones y tokenizador.
- VRAM estimada en fp16/bf16: aproximadamente 0,67 GB para pesos.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM para fp16; RTX 3060, RTX 4090, A100 o H100 son suficientes y quedan sobredimensionadas para el tamaño del modelo.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna (GTX 1650 en adelante) e incluso en CPU para lotes pequeños.
- Opciones de despliegue: sentence-transformers, text-embeddings-inference (tag `text-embeddings-inference`), endpoints compatibles; no se documentan pesos GGUF para llama.cpp u Ollama.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Vocabulario | Idiomas | Licencia | Contexto |
|---|---|---|---|---|---|
| alphaedge-ai/multilingual-e5-large-instruct-kat-32768 | 337.442.816 | 32.768 | georgiano (optimizado) | MIT | no disponible |
| intfloat/multilingual-e5-large-instruct | 559.890.432 | 250.037 | multilingüe | MIT | no disponible |
| intfloat/multilingual-e5-large | no disponible | no disponible | multilingüe | MIT | no disponible |
| intfloat/multilingual-e5-base | no disponible | no disponible | multilingüe | MIT | no disponible |

La comparación principal es con su modelo base: el recorte elimina el 39,73 % de los parámetros y el 86,89 % del vocabulario, a cambio de especializarse en georgiano. Frente a las variantes base y large originales, pierde cobertura multilingüe pero reduce el coste de memoria. No se dispone de datos de rendimiento comparado en benchmarks.

## Limitaciones y advertencias

- El recorte de vocabulario elimina tokens poco frecuentes en georgiano; el rendimiento en otros idiomas puede degradarse de forma significativa.
- No es un modelo generativo: no produce texto, solo embeddings; no sirve para chat, tool calling ni agentes.
- Riesgo de alucinación no aplicable en el sentido generativo, pero sí de falsos positivos en similitud si el corpus de minado no representa el dominio de uso.
- La model card no documenta sesgos específicos; al derivar de fineweb-2, puede heredar sesgos del corpus web utilizado para el minado.
- No se documentan evaluaciones de calidad para georgiano, por lo que conviene validar el modelo en el dominio concreto antes de producción.
- Licencia MIT: permite uso comercial, pero se recomienda conservar la atribución al modelo base y revisar las condiciones del dataset de minado.
- El sufijo "32768" del nombre se refiere al tamaño de vocabulario, no a la longitud de contexto; no debe interpretarse como ventana de 32k tokens.
- Solo 31 descargas y 0 likes en el momento de la consulta: ecosistema de validación muy limitado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/alphaedge-ai/multilingual-e5-large-instruct-kat-32768
- Modelo base: https://huggingface.co/intfloat/multilingual-e5-large-instruct
- Dataset de minado: https://huggingface.co/datasets/lbourdois/fineweb-2-trimming
- Blog sobre trimming: https://huggingface.co/blog/lbourdois/introduction-to-trimming
- Paper Multilingual E5: https://arxiv.org/abs/2402.05672
