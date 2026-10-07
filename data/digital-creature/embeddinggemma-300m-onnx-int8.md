# digital-creature/embeddinggemma-300m-onnx-int8

## Resumen

EmbeddingGemma 300M ONNX int8 es una versión cuantizada y exportada a formato ONNX del modelo de embeddings google/embeddinggemma-300m, publicada por el usuario digital-creature. No es un modelo generativo: es un modelo de extracción de características (feature-extraction) que convierte texto en vectores densos de 768 dimensiones, ya agrupados (pooling) y normalizados, listos para ser indexados en un motor de búsqueda vectorial. Su objetivo declarado es servir como modelo de auto-embedding local dentro de Manticore Search, sin depender de APIs externas ni de GPU.

La aportación específica de este repositorio frente al export fp32 de onnx-community/embeddinggemma-300m es la cuantización dinámica a int8 aplicada únicamente a las operaciones MatMul, con pesos por canal, dejando la tabla de embeddings de tokens en fp32 porque se resuelve por búsqueda de filas y no requiere desquantización completa. Según las mediciones del autor en un Apple M-series, esto reduce la latencia de una consulta de 14 tokens de 24,8 ms a 9,6 ms con 4 hilos, y el pico de memoria residente de unos 495 MB a 330-370 MB.

El modelo es relevante en el contexto de pipelines RAG y búsqueda semántica en hardware modesto: permite ejecutar recuperación densa en CPU con una degradación de calidad muy baja (similitud coseno de 0,98-0,99 respecto a fp32) y sin cambios en la métrica de ranking en las evaluaciones que cita el autor. La contrapartida es que el repositorio tiene un tamaño de 0,9 GB, no incluye safetensors y arrastra la licencia Gemma de Google, con las restricciones que eso implica.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo encoder de la familia Gemma 3 (etiqueta gemma3_text), con salida de embedding de 768 dimensiones agrupada y normalizada |
| Parametros totales | Aproximadamente 300 millones (segun la denominacion del modelo base google/embeddinggemma-300m) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada; las mediciones del autor incluyen documentos de hasta 171 tokens |
| Tipos de cuantizacion | int8 dinamico (onnxruntime.quantization.quantize_dynamic) aplicado solo a MatMul, pesos por canal; tabla de embeddings de tokens en fp32; el repositorio fuente ofrece tambien fp32 |
| Idiomas soportados | No disponible en la informacion proporcionada |
| Licencia | Gemma Terms of Use (ai.google.dev/gemma/terms) y Gemma Prohibited Use Policy |
| Formato de pesos | ONNX: onnx/model.onnx + onnx/model.onnx.data, acompanados de config.json y tokenizer.json; no hay safetensors |
| Entradas | input_ids, attention_mask (sin token_type_ids) |
| Salida | sentence_embedding, float32, 768 dimensiones |
| Tamano del repositorio | 0,9 GB |
| Descargas / likes | 0 descargas, 1 like |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo base google/embeddinggemma-300m, un encoder de la familia Gemma 3 (etiqueta gemma3_text en HuggingFace) especializado en producir representaciones vectoriales de frases y documentos. El grafo ONNX exportado recibe input_ids y attention_mask, aplica el pooling y la normalización dentro del propio grafo, y devuelve directamente un vector de 768 componentes en float32. No hay decoder, ni generación autoregresiva, ni modo de razonamiento. Los detalles de composición del dataset de entrenamiento, número de tokens y si hubo fases de RLHF o DPO no están disponibles en la información proporcionada.

La innovación técnica de esta build concreta es la estrategia de cuantización. El autor aplica quantize_dynamic de ONNX Runtime exclusivamente a las multiplicaciones matriciales, con cuantización por canal, de modo que las MatMul se ejecutan en aritmética entera. La tabla de embeddings de tokens permanece en fp32 porque una búsqueda por índice de fila lee pocas filas y no necesita un paso de desquantización. El autor señala explícitamente que el archivo model_quantized.onnx del repositorio fuente (cuantización solo de pesos) es más lento que fp32 en CPU y supera 1 GB de memoria en el pico, por lo que esta build está pensada para ser la opción de inferencia en CPU dentro de ese repositorio.

Un detalle operativo relevante: el grafo no añade ninguna plantilla de prompt. EmbeddingGemma espera que las consultas se prefijen con `task: search result | query: ` y los documentos con `title: {title} | text: {content}`. Es responsabilidad de la capa de aplicación construir esos prefijos.

## Capacidades

- Generación de embeddings de texto: transforma consultas y documentos en vectores densos de 768 dimensiones, normalizados, listos para similitud coseno o producto escalar.
- Recuperación semántica: pensado para el lado de indexación y consulta de motores de búsqueda vectorial, con integración directa como modelo de auto-embedding en Manticore Search mediante MODEL_NAME='digital-creature/embeddinggemma-300m-onnx-int8'.
- Inferencia en CPU: el objetivo declarado de la build es la ejecución rápida sin GPU, con soporte de cuantización int8 dinámica.
- Integración con ONNX Runtime: carga mediante el ecosistema onnxruntime, con la etiqueta text-embeddings-inference en el repositorio, lo que sugiere compatibilidad con Text Embeddings Inference.
- Compatibilidad con endpoints: el repositorio está etiquetado como endpoints_compatible, orientado a despliegues tipo HuggingFace Endpoints.
- Soporte de prompt asimétrico: permite separar el tratamiento de consultas y documentos mediante prefijos de tarea distintos, lo que mejora la calidad en recuperación.
- Fidelidad respecto a fp32: mantiene similitud coseno de 0,98-0,99 con los vectores fp32 y el mismo NDCG@10 en la evaluación híbrida de búsqueda de producto citada por el autor.

No se ha documentado en la información disponible soporte de tool calling, function calling, agentes, visión, audio, modo thinking ni capacidades multilingües explícitas.

## Casos de uso

- Búsqueda semántica local en Manticore Search: el caso de uso principal del repositorio. Se configura el modelo como auto-embedding local (MODEL_NAME='digital-creature/embeddinggemma-300m-onnx-int8') y el motor genera los vectores de los documentos al indexar y de las consultas al buscar, sin salir del servidor y sin coste de API.
- Recuperación aumentada (RAG) autoalojada: en un pipeline con una base vectorial como Qdrant, Milvus o pgvector, este modelo genera los embeddings de los fragmentos de documentación y de las preguntas del usuario. Al ocupar 330-370 MB de RSS en CPU, cabe en el mismo nodo que el resto del servicio.
- Búsqueda híbrida en catálogos de comercio electrónico: el autor validó el modelo con el conjunto WANDS y cuatro catálogos de e-commerce, obteniendo el mismo NDCG@10 que con vectores fp32. Sirve para combinar coincidencia léxica (BM25) con similitud vectorial en búsquedas de producto.
- Deduplicación y agrupación de documentos: al producir vectores normalizados, permite calcular similitud coseno por pares o ejecutar clustering sobre grandes colecciones de textos para detectar duplicados o agrupar temáticamente.
- Clasificación y filtrado por similitud: comparar la incrustación de un texto contra un conjunto de incrustaciones de referencia (por ejemplo, categorías o etiquetas) permite clasificar sin entrenar un modelo adicional.
- Sistemas de recomendación basados en contenido: indexar las descripciones de artículos o contenidos y usar la similitud entre vectores para sugerir elementos relacionados a partir del historial del usuario.
- Despliegue en entornos sin GPU: al no requerir acelerador y mantenerse por debajo de 400 MB de memoria en int8, es viable en máquinas virtuales pequeñas, portátiles y dispositivos edge.
- Búsqueda sobre documentación técnica interna: con documentos de hasta 171 tokens medidos en 81 ms, es adecuado para indexar manuales, tickets o artículos de knowledge base y resolver consultas en tiempo interactivo.

## Benchmarks y rendimiento

El autor publica mediciones de latencia y memoria en un Apple M-series con ONNX Runtime, fechadas el 7 de octubre de 2026. No hay datos de benchmarks académicos (MMLU, HumanEval, GSM8K, MTEB) en la información disponible, algo esperable en un modelo de embeddings.

| Build | Consulta de 14 tokens, 4 hilos | Consulta de 14 tokens, 1 hilo | Documento de 171 tokens | Pico de RSS |
|---|---|---|---|---|
| fp32 | 24,8 ms | 45,0 ms | 211 ms | ~495 MB |
| int8 (esta build) | 9,6 ms | 14,6 ms | 81 ms | ~330-370 MB |

Métricas de calidad reportadas:

| Metrica | Resultado |
|---|---|
| Similitud coseno frente a los vectores fp32 | 0,98-0,99 |
| NDCG@10 en evaluacion hibrida de busqueda de producto (WANDS y cuatro catalogos de e-commerce) | Identico al obtenido con consultas codificadas en fp32 |
| Mejora de latencia en consulta corta (4 hilos) | 2,6x respecto a fp32 |
| Reduccion de pico de memoria | Aproximadamente un 25-33 por ciento respecto a fp32 |

## Requisitos de hardware

- VRAM estimada: no aplica en el caso de uso objetivo, que es inferencia en CPU. No se han publicado mediciones en GPU para esta build.
- Memoria en CPU: pico de RSS de 330-370 MB en int8, frente a unos 495 MB en fp32.
- GPU recomendadas: no disponibles. El repositorio está orientado a CPU y las únicas mediciones publicadas son en Apple M-series.
- Cabe en GPU de consumo: no aplica para esta build; no hay datos de ejecución con CUDA Execution Provider.
- Hardware validado: Apple M-series con onnxruntime, 4 hilos y 1 hilo. No hay mediciones publicadas en x86, ARM servidor ni aceleradores.
- Opciones de despliegue: ONNX Runtime (onnxruntime); Manticore Search como modelo de auto-embedding local; la etiqueta text-embeddings-inference del repositorio apunta a compatibilidad con Text Embeddings Inference; el tag endpoints_compatible sugiere despliegue en HuggingFace Endpoints.
- No disponible en llama.cpp ni Ollama: no se publican pesos en formato GGUF.
- Latencia estimada: 9,6 ms por consulta de 14 tokens con 4 hilos y 81 ms por documento de 171 tokens en Apple M-series; 14,6 ms por consulta con un solo hilo.
- Throughput: no disponible (el autor solo publica latencias por petición).

## Comparativa con modelos similares

La comparación más informativa es entre las distintas variantes del mismo modelo base, ya que todas comparten los 300 millones de parámetros, el vector de 768 dimensiones y la licencia Gemma.

| Modelo | Parametros | Formato | Cuantizacion | Consulta 14 tokens (M-series, 4 hilos) | Pico de memoria | Licencia |
|---|---|---|---|---|---|---|
| google/embeddinggemma-300m (original) | ~300 M | safetensors (PyTorch) | fp32 | No disponible | No disponible | Gemma Terms of Use |
| onnx-community/embeddinggemma-300m-ONNX (onnx/model.onnx) | ~300 M | ONNX | fp32 | 24,8 ms | ~495 MB | Gemma Terms of Use |
| onnx-community/embeddinggemma-300m-ONNX (model_quantized.onnx) | ~300 M | ONNX | int8 solo pesos | Mas lento que fp32 (sin cifra publicada) | Mas de 1 GB | Gemma Terms of Use |
| digital-creature/embeddinggemma-300m-onnx-int8 (esta build) | ~300 M | ONNX | int8 dinamico en MatMul, per-channel | 9,6 ms | ~330-370 MB | Gemma Terms of Use |

La diferencia clave entre las dos variantes ONNX cuantizadas es el alcance de la cuantización: la del repositorio onnx-community desquantiza todos los pesos de MatMul y la tabla de embeddings completa en cada ejecución, mientras que esta build mantiene las MatMul en aritmética entera y deja la tabla de embeddings en fp32 para evitar el coste de desquantización.

## Limitaciones y advertencias

- Licencia Gemma: el uso está sujeto a los Gemma Terms of Use y a la Gemma Prohibited Use Policy de Google. Es una versión modificada (cuantizada) del modelo original, por lo que se aplican los mismos términos. Cualquier uso comercial debe revisarse contra esas condiciones antes de desplegar.
- Sin validación comunitaria: el repositorio registra 0 descargas y 1 like en el momento de la consulta, y fue creado y actualizado el mismo día. No hay evidencia de uso en producción por terceros.
- Benchmarks limitados: todas las mediciones publicadas provienen del propio autor y de una única plataforma (Apple M-series). No hay datos en x86, ARM servidor ni GPU, ni pruebas de carga con concurrencia.
- Degradación por cuantización: aunque la similitud coseno frente a fp32 es de 0,98-0,99 y el NDCG@10 se mantiene en las evaluaciones citadas, existe una pérdida pequeña pero real de precisión en los vectores. En dominios muy sensibles a la granularidad del ranking conviene validar con el corpus propio.
- Prefijos obligatorios: el grafo no añade ninguna plantilla. Si la aplicación no antepone `task: search result | query: ` a las consultas y `title: {title} | text: {content}` a los documentos, la calidad de recuperación se degradará de forma no evidente.
- Riesgo de recuperación incorrecta: como modelo de embeddings no genera texto, pero un fallo de recuperación (falso negativo o vecino semánticamente cercano pero irrelevante) se propaga directamente al sistema RAG que lo consuma. No hay capa de verificación interna.
- Longitud de contexto no confirmada: no se especifica en la información disponible. Los documentos largos deben trocearse antes de generar los embeddings, y las mediciones publicadas solo llegan a 171 tokens.
- Idiomas no confirmados: la información proporcionada no detalla la cobertura lingüística. No se debe asumir un comportamiento multilingüe sin verificarlo con el corpus objetivo.
- Ausencia de safetensors: los cargadores que exigen safetensors (Manticore entre ellos) deben usar la ruta ONNX. Esto puede complicar la integración con herramientas que solo aceptan PyTorch o GGUF.
- Dos archivos de pesos: el modelo se reparte entre onnx/model.onnx y onnx/model.onnx.data, con un total de 0,9 GB en el repositorio. Hay que gestionar ambos al desplegar.
