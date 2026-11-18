# alphaedge-ai/multilingual-e5-large-instruct-mar-32768

## Resumen

`alphaedge-ai/multilingual-e5-large-instruct-mar-32768` es una versión recortada (trimmed) del modelo de embeddings `intfloat/multilingual-e5-large-instruct`, especializada en maratí (mr) mediante reducción del vocabulario. El recorte reduce el vocabulario de 250.037 a 32.768 tokens (una disminución del 86,89%) y el número de parámetros de 559.890.432 a 337.442.816 (un 39,73% menos), lo que se traduce en un footprint de memoria notablemente inferior (0,7 GB en el repositorio) manteniendo, según el autor, un rendimiento similar al original en la lengua objetivo.

El modelo conserva la arquitectura del original: un transformer XLM-RoBERTa encoder-only adaptado para similitud de frases mediante SentenceTransformers. Su propósito es generar embeddings densos de consulta y documento para tareas de recuperación de información, búsqueda semántica y clustering en maratí, con la ventaja de un menor coste de despliegue.

Es relevante para equipos que necesiten un modelo de embeddings ligero, de licencia MIT y compatible con Text Embeddings Inference (endpoints compatibles), orientado a pipelines RAG en maratí donde el modelo original multilingüe resulta sobredimensionado. No obstante, al haberse eliminado los tokens poco frecuentes en maratí, su utilidad para otras lenguas es limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-only (XLM-RoBERTa), adaptado con SentenceTransformers |
| Parametros totales | 337.442.816 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el nombre del modelo sugiere 32.768 tokens de vocabulario, no de contexto) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantizaciones adicionales no publicadas) |
| Idiomas soportados | maratí (mr) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `intfloat/multilingual-e5-large-instruct`, un encoder XLM-RoBERTa de tipo E5 multilingüe entrenado con objetivos de contraste y datos instructivos, según el informe técnico referenciado (arXiv:2402.05672). Sobre esa base, el autor aplica la técnica de *trimming* descrita en el blog de Hugging Face: se minan 200.000 textos del dataset `lbourdois/fineweb-2-trimming` para identificar los tokens realmente utilizados en maratí y se recorta la matriz de embeddings del vocabulario, conservando 32.768 tokens.

El resultado es un modelo con la misma profundidad y dimensiones ocultas que el original, pero con una capa de embeddings mucho menor, lo que reduce el recuento total de parámetros un 39,73%. No se detalla en la información disponible si hubo reentrenamiento posterior al recorte ni qué hiperparámetros se emplearon; la model card indica únicamente que el modelo recortado debería comportarse de forma similar al original en la lengua seleccionada.

## Capacidades

- Generación de embeddings densos de frases y documentos para similitud semántica.
- Codificación separada de consultas (`encode_query`) y documentos (`encode_document`), siguiendo el esquema E5.
- Recuperación de información (retrieval) y ranking por similitud coseno.
- Búsqueda semántica monolingüe en maratí.
- Clustering y deduplicación de textos en maratí.
- Compatibilidad con Text Embeddings Inference y endpoints compatibles.
- No soporta tool calling, agentes, visión, audio ni modo de razonamiento (es un modelo de embeddings, no generativo).
- Capacidad multilingüe muy limitada: el vocabulario se ha recortado específicamente para maratí.

## Casos de uso

- Búsqueda semántica en maratí: indexar un corpus de documentos en maratí y recuperar los fragmentos más relevantes para una consulta mediante similitud coseno entre embeddings de query y documento.
- RAG (generación aumentada por recuperación) en maratí: usar el modelo como recuperador en un pipeline que alimente a un LLM generativo, aprovechando su bajo footprint para desplegarlo junto al generador en la misma infraestructura.
- Deduplicación de contenidos: calcular embeddings de un conjunto de artículos o páginas web en maratí y agrupar los duplicados o casi duplicados por umbral de similitud.
- Clustering temático de noticias o documentos: agrupar textos periodísticos en maratí por temática sin necesidad de etiquetas previas.
- Moderación y clasificación por similitud: comparar mensajes entrantes con un conjunto de ejemplos etiquetados para asignar categorías por vecindad semántica.
- Sistemas de recomendación de contenido: generar embeddings de artículos y del historial del usuario para sugerir lecturas afines en maratí.
- Despliegue en entornos con recursos limitados: al ocupar 0,7 GB y 337 millones de parámetros, puede servirse en CPU o en GPUs de gama baja con latencias aceptables para volúmenes moderados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 1,35 GB solo para pesos (337,4 M de parámetros × 4 bytes), más overhead de activaciones y tokenizador.
- VRAM estimada en FP16/BF16: aproximadamente 0,7 GB para pesos.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM para FP16; tarjetas consumer como RTX 3060, RTX 4060 o superiores son suficientes. Para lotes grandes, A10G, L4 o A100 ofrecen mayor throughput.
- Cabe holgadamente en GPU consumer y también puede ejecutarse en CPU para cargas moderadas.
- Opciones de despliegue: `sentence-transformers` (Python), Text Embeddings Inference (TEI), endpoints compatibles de Hugging Face; no se documentan pesos GGUF para llama.cpp ni Ollama.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Vocabulario | Idiomas | Licencia | Contexto |
|---|---|---|---|---|---|
| alphaedge-ai/multilingual-e5-large-instruct-mar-32768 | 337.442.816 | 32.768 | maratí | MIT | no disponible |
| intfloat/multilingual-e5-large-instruct | 559.890.432 | 250.037 | multilingüe | MIT | no disponible |
| intfloat/multilingual-e5-large | no disponible | no disponible | multilingüe | MIT | no disponible |
| intfloat/multilingual-e5-base | no disponible | no disponible | multilingüe | MIT | no disponible |

La comparativa se limita a la familia E5 de intfloat, ya que no se dispone de datos de benchmarks ni de especificaciones detalladas de alternativas en la información proporcionada. El modelo recortado ofrece un 39,73% menos de parámetros y un vocabulario un 86,89% menor que su base, a costa de perder cobertura en lenguas distintas del maratí.

## Limitaciones y advertencias

- El recorte de vocabulario elimina tokens poco frecuentes en maratí, por lo que el rendimiento en otras lenguas puede degradarse significativamente.
- Al ser un modelo de embeddings, no genera texto: no debe emplearse para tareas generativas, de razonamiento o de tool calling.
- No se han publicado evaluaciones de sesgo ni de robustez para esta versión recortada.
- Riesgo de alucinación no aplica en sentido generativo, pero sí de recuperaciones irrelevantes si el corpus de destino difiere del dominio de entrenamiento (FineWeb-2).
- La model card no detalla la longitud máxima de contexto soportada; conviene validar empíricamente el truncado antes de usarlo en producción.
- Licencia MIT: permite uso comercial, pero se recomienda revisar las condiciones del modelo base y del dataset de minado por si imponen restricciones adicionales.
- El modelo tiene un número muy bajo de descargas (29) y ningún like, lo que sugiere escasa validación por parte de la comunidad; conviene realizar una evaluación propia antes de adoptarlo en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/alphaedge-ai/multilingual-e5-large-instruct-mar-32768
- Modelo base: https://huggingface.co/intfloat/multilingual-e5-large-instruct
- Dataset de minado: https://huggingface.co/datasets/lbourdois/fineweb-2-trimming
- Blog sobre trimming: https://huggingface.co/blog/lbourdois/introduction-to-trimming
- Informe técnico Multilingual E5: https://arxiv.org/abs/2402.05672
