# alphaedge-ai/multilingual-e5-large-instruct-nob-32768

## Resumen

`alphaedge-ai/multilingual-e5-large-instruct-nob-32768` es un modelo de embeddings de frases (sentence-similarity) derivado de `intfloat/multilingual-e5-large-instruct` mediante la técnica de *trimming* de vocabulario, especializado en noruego bokmål (`nb`). El autor del modelo derivado es la cuenta `alphaedge-ai`; el modelo base lo desarrolló el equipo de Microsoft Research (intfloat). El problema que resuelve es el sobredimensionamiento del vocabulario multilingüe original: al recortar el vocabulario de 250.037 a 32.768 tokens, el modelo pierde un 86,89% de entradas léxicas y un 39,73% de parámetros (de 559.890.432 a 337.442.816), reduciendo el tamaño del repositorio a 0,7 GB.

Arquitectura subyacente: transformer tipo XLM-RoBERTa (encoder) con pooling para generar embeddings densos. La ventana de contexto efectiva del modelo base E5 es de 512 tokens; el sufijo `32768` del nombre hace referencia al tamaño del vocabulario recortado, no a la longitud de contexto. El modelo está pensado para búsqueda semántica, recuperación y clustering en noruego bokmål, no para generación de texto.

Es relevante ahora porque permite desplegar un encoder multilingüe de calidad en entornos con restricciones de memoria (edge, contenedores pequeños, CPU) a costa de sacrificar cobertura en idiomas distintos del noruego bokmål. La licencia MIT facilita su uso comercial, aunque con las salvedades de sesgo y cobertura lingüística que se detallan más abajo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (XLM-RoBERTa), modelo de embeddings de frases con pooling |
| Parametros totales | 337.442.816 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la información proporcionada (el modelo base E5 usa 512 tokens; el sufijo 32768 corresponde al vocabulario) |
| Tipos de cuantizacion | No disponible en la información proporcionada; pesos en safetensors (se puede cuantizar a int8/fp16 con herramientas estándar) |
| Idiomas soportados | Noruego bokmål (`nb`) |
| Licencia | MIT |
| Formato de pesos | safetensors (librería sentence-transformers) |

## Arquitectura y entrenamiento

El modelo es un encoder transformer XLM-RoBERTa heredado de `intfloat/multilingual-e5-large-instruct`, con la cabeza de embeddings de frases de sentence-transformers. La modificación aplicada es puramente de vocabulario: se recortan las entradas del tokenizador y las filas correspondientes de la matriz de embeddings de entrada y de la proyección de salida, pasando de 250.037 a 32.768 tokens. La selección de tokens se realizó minando 200.000 textos en noruego bokmål del dataset `lbourdois/fineweb-2-trimming`, conservando los tokens más frecuentes en ese corpus. No se ha reentrenado el modelo: los pesos de las capas internas se mantienen del modelo base, por lo que el ajuste instruccional original (pares query/document con instrucciones) se conserva.

No hay información sobre número de tokens de entrenamiento adicionales, composición del dataset de ajuste fino, ni uso de RLHF/DPO en el material proporcionado. La innovación técnica destacable es el *trimming* de vocabulario: reduce el footprint de memoria y acelera la inferencia en el idioma objetivo, pero degrada la tokenización de otros idiomas cuyos tokens fueron eliminados.

## Capacidades

- Generación de embeddings densos de frases y documentos para similitud semántica.
- Recuperación de información (retrieval) query-document con el esquema `encode_query` / `encode_document`.
- Clustering y deduplicación de textos en noruego bokmål.
- Clasificación semántica y reranking basado en similitud coseno.
- Soporte de instrucciones en el prompt (herencia del modelo base instruct), útil para adaptar la tarea de recuperación.
- Capacidades multilingües limitadas al noruego bokmål; el resto de idiomas no están garantizados.
- No soporta generación de texto, tool calling, agentes ni visión.

## Casos de uso

- Búsqueda semántica en corpus noruegos: indexar documentos en bokmål con `encode_document` y consultar con `encode_query`, aprovechando la reducción de memoria para servir el índice en CPU o GPU de gama baja.
- Motor de preguntas y respuestas sobre base documental (RAG): usar los embeddings como retriever en un pipeline con un LLM generador, donde el encoder aporta el ranking de fragmentos relevantes.
- Deduplicación de catálogos y datasets: calcular similitudes entre pares de textos para eliminar duplicados o near-duplicates en corpus en noruego.
- Clustering temático de noticias o tickets: agrupar documentos por similitud de embeddings para análisis exploratorio o enrutamiento automático.
- Moderación y filtrado de contenido: comparar mensajes entrantes contra una lista de patrones o ejemplos etiquetados mediante similitud coseno.
- Recomendación de contenidos: construir un índice vectorial de artículos y recomendar los más próximos a la consulta o al historial del usuario.
- Despliegue en edge o contenedores ligeros: al ocupar 0,7 GB en safetensors y 337 M de parámetros, cabe en instancias pequeñas o incluso en CPU con latencias aceptables para volúmenes moderados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: ~0,7 GB en fp32 (337 M parámetros), ~0,35 GB en fp16, ~0,2 GB en int8. Cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: RTX 3060/4060 o superiores para throughput alto; también funciona en CPU (AVX2) para cargas moderadas.
- Cabe en consumer GPU: sí, en cualquier GPU con al menos 2 GB de VRAM; incluso en iGPU y CPU.
- Opciones de despliegue: sentence-transformers (nativo), Text Embeddings Inference (TEI, etiqueta `text-embeddings-inference`), ONNX Runtime, FastEmbed; no es compatible con vLLM/llama.cpp porque no es un modelo generativo.
- Latencia y throughput: no disponibles en la información proporcionada; orientativamente, un encoder de 337 M parámetros en fp16 en una RTX 4090 procesa cientos de textos por segundo, pero no hay cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parámetros | Vocabulario | Idiomas | Contexto | Licencia |
|---|---|---|---|---|---|
| alphaedge-ai/multilingual-e5-large-instruct-nob-32768 | 337 M | 32.768 | nb | no disponible (base: 512) | MIT |
| intfloat/multilingual-e5-large-instruct (base) | 560 M | 250.037 | multilingüe | 512 | MIT |
| intfloat/multilingual-e5-base | 278 M | 250.037 | multilingüe | 512 | MIT |
| BAAI/bge-m3 | 568 M | 250.002 | multilingüe | 8.192 | MIT |

El modelo recortado ofrece un footprint menor que el base y que bge-m3, a cambio de perder cobertura multilingüe y contexto largo. Para cargas exclusivamente en noruego bokmål y con restricciones de memoria, es una alternativa razonable; para uso multilingüe o contexto largo, el base o bge-m3 son preferibles.

## Limitaciones y advertencias

- Cobertura lingüística restringida: solo noruego bokmål; el rendimiento en otros idiomas puede degradarse severamente por la eliminación de tokens del vocabulario.
- Riesgo de tokenización subóptima en textos con caracteres, nombres propios o términos técnicos poco frecuentes en bokmål, que pueden caer en tokens `<unk>` o fragmentarse.
- No es un modelo generativo: no produce texto, no soporta tool calling ni razonamiento multi-paso.
- Longitud de contexto limitada (heredada del base, 512 tokens); textos más largos requieren chunking.
- Sesgos heredados del corpus fineweb-2 y del modelo base; no se han publicado evaluaciones de sesgo en la información disponible.
- Riesgo de falsos positivos en similitud si los embeddings se usan fuera del dominio de entrenamiento.
- Licencia MIT permite uso comercial, pero conviene verificar la licencia del modelo base y del dataset de minado (`lbourdois/fineweb-2-trimming`) antes de redistribuir.
- El modelo tiene pocas descargas (34) y 0 likes; no hay validación comunitaria extensa de su calidad.

## Enlaces

- Hugging Face: https://huggingface.co/alphaedge-ai/multilingual-e5-large-instruct-nob-32768
- Modelo base: https://huggingface.co/intfloat/multilingual-e5-large-instruct
- Paper Multilingual E5: https://arxiv.org/abs/2402.05672
- Blog de trimming: https://huggingface.co/blog/lbourdois/introduction-to-trimming
- Dataset de minado: https://huggingface.co/datasets/lbourdois/fineweb-2-trimming
