# qualcomm/MiniLM-v2

## Resumen

MiniLM-v2 es una versión optimizada por Qualcomm del modelo de embeddings de frases All-MiniLM-L6-v2, desarrollado originalmente por el equipo de sentence-transformers (UKPLab). Con 22,7 millones de parámetros, mapea frases a un espacio vectorial denso de 384 dimensiones, lo que lo hace adecuado para tareas de búsqueda semántica, similitud de frases y clustering. El modelo está entrenado sobre más de mil millones de pares de frases y se distribuye en formatos preexportados (ONNX, QNN_DLC y TFLITE) listos para ejecutarse en la NPU de dispositivos Qualcomm, con tiempos de inferencia inferiores a 2 ms en la mayoría de los chipsets recientes.

Su relevancia actual radica en la creciente demanda de modelos de embeddings ligeros que puedan ejecutarse en tiempo real en dispositivos móviles y edge, sin depender de la nube. Al estar basado en una arquitectura transformer compacta (6 capas, 384 dimensiones) y soportar cuantización w8a8, MiniLM-v2 ofrece un equilibrio entre calidad de representación y eficiencia computacional, con un consumo de memoria pico que oscila entre 1 y 107 MB según el chipset. El modelo se publica bajo licencia Apache 2.0 y está disponible en el repositorio de Qualcomm AI Hub Models.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (MiniLM-L6, 6 capas, 384 dimensiones de embedding) |
| Parametros totales | 22,7 millones |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 128 tokens (resolucion de entrada declarada) |
| Tipos de cuantizacion | float (FP32) y w8a8 (pesos y activaciones en 8 bits) |
| Idiomas soportados | No disponible (el modelo original all-MiniLM-L6-v2 soporta multiples idiomas, pero no se especifica en esta version) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX, QNN_DLC, TFLITE (preexportados); tambien disponible en PyTorch |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura MiniLM-L6, descrita en el articulo "MiniLM: Deep Self-Attention Distillation for Task-Agnostic Compression of Pre-Trained Transformers" (arXiv:1908.10084). Consta de 6 capas transformer con 384 dimensiones ocultas y 6 cabezas de atencion, disenado para producir embeddings de frases de alta calidad con un coste computacional reducido. El checkpoint de partida es `sentence-transformers/all-MiniLM-L6-v2`, entrenado sobre mas de mil millones de pares de frases mediante aprendizaje contrastivo, lo que permite capturar relaciones semanticas entre oraciones.

No se menciona el uso de RLHF, DPO ni otras tecnicas de alineacion, ya que se trata de un modelo de embeddings y no de generacion de texto. La innovacion principal de esta version de Qualcomm reside en la optimizacion para hardware especifico: los pesos se preexportan en formatos compatibles con la NPU de los chipsets Snapdragon y Dragonwing, y se ofrece cuantizacion w8a8 (pesos y activaciones en 8 bits) que reduce el consumo de memoria y mejora la latencia sin una degradacion significativa de la calidad, segun los datos de rendimiento publicados.

## Capacidades

- Generacion de embeddings de frases de 384 dimensiones para representacion semantica densa.
- Busqueda semantica: dado un texto de consulta, recupera documentos o fragmentos relevantes por similitud coseno.
- Similitud de frases: calcula la similitud entre pares de oraciones o parrafos.
- Clustering de textos: agrupa documentos o mensajes por contenido tematico.
- Clasificacion de texto: los embeddings pueden alimentar clasificadores lineales o redes pequenas para tareas como analisis de sentimiento o deteccion de spam.
- Deduplicacion de contenido: identifica textos duplicados o casi duplicados en grandes volumenes de datos.
- No soporta generacion de texto autoregresiva, tool calling, agentes ni razonamiento multi-paso.
- Capacidad multilingue: no confirmada en la documentacion de esta version, aunque el modelo base all-MiniLM-L6-v2 esta entrenado con datos multilingues.
- Optimizado para ejecucion en tiempo real en NPU de dispositivos Qualcomm, con latencias inferiores a 2 ms en chipsets recientes.

## Casos de uso

- Busqueda semantica en aplicaciones moviles: permite indexar documentos, notas o mensajes en el dispositivo y recuperarlos mediante consultas en lenguaje natural. Su tamano reducido (86,7 MB en float) y su ejecucion en NPU hacen posible una experiencia de busqueda instantanea sin conexion.
- Clustering de tickets de soporte: los embeddings permiten agrupar automaticamente incidencias de clientes por tema, facilitando la priorizacion y el analisis de tendencias. El modelo puede ejecutarse en el servidor o en el dispositivo, segun la arquitectura.
- Sistemas de recomendacion basados en contenido: al representar articulos, productos o noticias como vectores, se pueden calcular similitudes para sugerir elementos relacionados. Su baja latencia permite generar recomendaciones en tiempo real incluso en hardware modesto.
- Deduplicacion de registros: en bases de datos de contactos, documentos legales o publicaciones, los embeddings ayudan a detectar entradas duplicadas comparando la similitud coseno entre vectores. El modelo es lo suficientemente ligero para procesar grandes volumenes de forma batch.
- Clasificacion de texto en el edge: combinado con un clasificador lineal entrenado sobre los embeddings, puede realizar analisis de sentimiento, deteccion de spam o moderacion de contenido directamente en el dispositivo, reduciendo la latencia y preservando la privacidad de los datos.
- Recuperacion aumentada por generacion (RAG) en dispositivos moviles: los embeddings pueden indexar una base de conocimiento local y recuperar fragmentos relevantes para alimentar a un LLM generativo. Su velocidad de inferencia (menos de 1 ms en Snapdragon 8 Elite) lo hace adecuado para pipelines de RAG en tiempo real.
- Analisis de similitud de documentos legales o academicos: permite comparar rapidamente grandes colecciones de textos para encontrar referencias cruzadas o plagio, gracias a la representacion semantica densa de 384 dimensiones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (como MMLU, HumanEval o GLUE) en la informacion disponible, ya que se trata de un modelo de embeddings y no de un LLM generativo. Sin embargo, la model card incluye datos de rendimiento en hardware Qualcomm, que se resumen a continuacion:

| Runtime | Precision | Chipset | Tiempo de inferencia (ms) | Memoria pico (MB) |
|---|---|---|---|---|
| ONNX | float | Snapdragon X2 Elite | 0,671 | 1 - 1 |
| ONNX | float | Snapdragon X Elite | 1,673 | 44 - 44 |
| ONNX | float | Snapdragon 8 Gen 3 Mobile | 1,128 | 0 - 102 |
| ONNX | float | Snapdragon 8 Gen 1 Mobile | 2,35 | 0 - 107 |
| ONNX | float | Snapdragon 8 Elite Mobile | 0,789 | 0 - 60 |
| ONNX | float | Snapdragon 8 Elite Gen 5 Mobile | 0,643 | 0 - 62 |
| ONNX | w8a8 | Snapdragon X2 Elite | 0,671 | 1 - 1 |
| ONNX | w8a8 | Snapdragon X Elite | 1,782 | 23 - 23 |
| ONNX | w8a8 | Snapdragon 8 Gen 3 Mobile | 1,207 | 0 - 87 |
| ONNX | w8a8 | Snapdragon 8 Gen 1 Mobile | 1,964 | 0 - 87 |
| ONNX | w8a8 | Qualcomm Dragonwing QCS6490 | 5,267 | 0 - 3 |
| ONNX | w8a8 | Qualcomm Dragonwing Q-8750 | 0,843 | 0 - 60 |

Todos los resultados se obtuvieron utilizando la NPU como unidad de computo principal. La cuantizacion w8a8 reduce la memoria pico en algunos chipsets (por ejemplo, de 44 MB a 23 MB en Snapdragon X Elite) manteniendo latencias similares.

## Requisitos de hardware

- Dispositivos compatibles: chipsets Qualcomm Snapdragon (8 Gen 1, 8 Gen 3, 8 Elite, X Elite, X2 Elite) y Dragonwing (QCS6490, QCS8450, IQ-8275, IQ-9075, IQ-X7181, Q-6690, Q-7790, Q-8750).
- Memoria: el consumo pico varia entre 1 MB y 107 MB segun el chipset y la precision. La cuantizacion w8a8 reduce el uso de memoria en la mayoria de los casos.
- Unidad de computo: NPU (no GPU ni CPU). El modelo esta optimizado para ejecutarse en la NPU de Qualcomm.
- VRAM: no aplica, al ser un modelo para dispositivos moviles y edge.
- Opciones de despliegue: ONNX Runtime (con QAIRT 2.45), Qualcomm AI Hub Workbench, TFLite, QNN (Qualcomm Neural Network). Tambien se puede exportar con configuraciones personalizadas mediante la libreria `qai_hub_models`.
- Latencia: entre 0,64 ms y 6,7 ms segun el chipset y la precision. Los chipsets mas recientes (Snapdragon 8 Elite Gen 5, X2 Elite) ofrecen las mejores latencias.
- Throughput: no se proporciona un valor explicito, pero las latencias indicadas permiten procesar cientos de frases por segundo en tiempo real.

## Comparativa con modelos similares

| Modelo | Parametros | Dimension embedding | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| MiniLM-v2 (Qualcomm) | 22,7M | 384 | 128 tokens | Apache 2.0 | ONNX, TFLITE, QNN | Optimizado para NPU Qualcomm, cuantizacion w8a8 |
| all-MiniLM-L6-v2 (original) | 22,7M | 384 | 256 tokens (tipico) | Apache 2.0 | PyTorch, ONNX | Modelo base sin optimizacion especifica de hardware |
| all-mpnet-base-v2 | 109M | 768 | 384 tokens | Apache 2.0 | PyTorch, ONNX | Mayor calidad de embeddings, pero mas pesado y lento |
| BGE-small-en-v1.5 | 33M | 384 | 512 tokens | MIT | PyTorch, ONNX | Alternativa ligera con buen rendimiento en busqueda semantica |

La comparativa se basa en caracteristicas generales de los modelos; no se dispone de benchmarks de calidad comparativos en la informacion proporcionada. MiniLM-v2 se distingue por su optimizacion especifica para hardware Qualcomm, que no esta presente en las alternativas.

## Limitaciones y advertencias

- No es un modelo generativo: a pesar de que el pipeline_tag en HuggingFace indica `text-generation`, MiniLM-v2 produce embeddings y no genera texto. No debe utilizarse para tareas de generacion de lenguaje.
- Longitud de contexto limitada: la resolucion de entrada declarada es de 128 tokens, lo que restringe la longitud de las frases o parrafos que pueden procesarse de una sola vez. Textos mas largos requieren truncamiento o estrategias de fragmentacion.
- Idiomas soportados: no se especifican en la documentacion de esta version. Aunque el modelo base all-MiniLM-L6-v2 es multilingue, no se garantiza el mismo comportamiento en esta adaptacion.
- Dependencia de hardware Qualcomm: el rendimiento optimo (latencias inferiores a 2 ms) solo se alcanza en chipsets Qualcomm con NPU. En otras plataformas, el modelo puede ejecutarse pero sin las optimizaciones declaradas.
- Sesgos potenciales: al estar entrenado sobre pares de frases de internet, los embeddings pueden reflejar sesgos presentes en los datos de entrenamiento. No se han publicado evaluaciones de sesgo para esta version.
- Riesgo de alucinacion: no aplica, al no generar texto. Sin embargo, los embeddings pueden producir falsos positivos en tareas de similitud si los textos son semanticamente ambiguos.
- Restricciones de uso comercial: la licencia Apache 2.0 permite uso comercial sin restricciones, pero se recomienda revisar los terminos de Qualcomm AI Hub para el despliegue en sus plataformas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/qualcomm/MiniLM-v2
- Pagina del modelo en Qualcomm AI Hub: https://aihub.qualcomm.com/compute/models/minilm_v2
- Repositorio de Qualcomm AI Hub Models (GitHub): https://github.com/qualcomm/ai-hub-models/tree/main/src/qai_hub_models/models/minilm_v2
- Articulo de MiniLM (arXiv): https://arxiv.org/abs/1908.10084
- Implementacion original de sentence-transformers: https://github.com/UKPLab/sentence-transformers
