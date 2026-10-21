# harsimran2004/social-embedding-v1-384d-onnx

## Resumen

Social Embedding Model v1.0 es un modelo de embeddings de texto en inglés derivado de BAAI/bge-base-en-v1.5 mediante fine-tuning con objetivo contrastivo de Multiple Negatives Ranking combinado con Matryoshka, lo que permite obtener representaciones útiles tanto a 768 como a 384 dimensiones. Lo desarrolla el usuario harsimran2004 y se distribuye como artefacto ONNX optimizado para inferencia en CPU, con una variante UINT8 dinámicamente cuantizada como opción recomendada y una variante FP32 de referencia. El problema que aborda es la recuperación semántica de contenido social (títulos y cuerpos de Reddit, preguntas duplicadas de Quora, pares consulta/pasaje de MS MARCO y captions de vídeo de MSR-VTT) con un coste de cómputo bajo en producción.

El modelo tiene aproximadamente 109 millones de parámetros, una arquitectura de bi-encoder basada en BERT y una longitud máxima de entrada de 128 tokens, un valor notablemente corto frente a los 512 tokens habituales de la familia BGE. El fine-tuning se realizó sobre 116.033 pares positivos durante una sola época, con una tasa de aprendizaje inicial de 2e-5 y AdamW, y la selección de checkpoint se hizo por nDCG@10 a 384 dimensiones sobre validación.

Su relevancia ahora es doble: por un lado demuestra un flujo de destilación de dimensionalidad (Matryoshka) que reduce el coste de almacenamiento e indexación a 384 dimensiones sin pérdida medible frente a 768 en el conjunto de test; por otro, el empaquetado ONNX UINT8 de 104,6 MiB permite desplegar búsqueda semántica en CPU con un throughput superior al del modelo FP32 en el entorno de medida del autor. No obstante, el repositorio no declara licencia y su estado declarado es "deployment candidate", con distribución inicialmente privada pendiente de revisión de permisos de los datos de origen.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Bi-encoder basado en BERT (BERT-based bi-encoder) |
| Parametros totales | ~109 millones |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 128 tokens de entrada como maximo |
| Dimensiones de salida | 768 y 384 (entrenadas con Matryoshka); 384 recomendada |
| Tipos de cuantizacion | ONNX FP32, ONNX UINT8 (recomendada para CPU), ONNX INT4 (MatMulNBits), ONNX UINT4 (MatMulNBits) |
| Idiomas soportados | Ingles (en) |
| Licencia | No disponible (la model card y los metadatos de HuggingFace no la declaran) |
| Formato de pesos | ONNX (FP32, UINT8, INT4, UINT4); no se ofrecen safetensors ni GGUF |
| Normalizacion | L2 aplicada despues del truncado dimensional |
| Fine-tuning | Multiple Negatives Ranking + Matryoshka |
| Pares de entrenamiento | 116.033 (de 130.654 pares totales: 7.351 validacion, 7.270 test) |
| Epocas | 1 |
| Tamano del repositorio | 0,5 GB |
| Pipeline declarado | sentence-similarity |
| Compatibilidad | text-embeddings-inference, endpoints_compatible |

## Arquitectura y entrenamiento

La base es el encoder BERT de BAAI/bge-base-en-v1.5, reutilizado como bi-encoder: cada texto se codifica de forma independiente y la similitud se calcula sobre los vectores resultantes, lo que permite precalcular el índice del corpus. El fine-tuning aplica un objetivo contrastivo de Multiple Negatives Ranking con batching group-aware para reducir falsos negativos, y una cabeza Matryoshka que entrena simultáneamente las salidas de 768 y 384 dimensiones; tras el truncado a 384 se aplica normalización L2. Hiperparámetros declarados: learning rate inicial 2e-5, AdamW, weight decay 0,01, batch por dispositivo 16, longitud máxima de secuencia 128 tokens, una época, y selección de checkpoint por nDCG@10 de validación a 384 dimensiones.

Los datos provienen de cuatro fuentes con relaciones positivas de distinta naturaleza: paráfrasis de Quora (30.464 pares de entrenamiento), relevancia título/cuerpo en Reddit (46.351), relevancia consulta/pasaje de MS MARCO (18.262) y captions del mismo vídeo en MSR-VTT (20.956). El pipeline de preparación incluye deduplicación exacta, partición train/validación/test consciente de grupos, comprobaciones de normalización Unicode y puntuación, y cribado aproximado de casi duplicados. El etiquetado se filtró con criterios de relevancia específicos por fuente asistidos por IA, y una revisión posterior centrada en desacuerdos examinó 40 ejemplos: 31 válidos y 9 ambiguos, sin rechazos inequívocos en esa muestra seleccionada; el propio autor advierte que esto no constituye una estimación de precisión global del dataset.

Como innovación operativa destaca la comparativa de cuatro variantes ONNX en CPU, con cuantización dinámica UINT8 y variantes de 4 bits basadas en MatMulNBits. La UINT8 fue seleccionada por ser el artefacto más pequeño (104,6 MiB), mantener la calidad de recuperación en validación y ofrecer el mayor throughput del conjunto comparado.

## Capacidades

- Generación de embeddings de texto en inglés para similitud semántica entre frases y pasajes.
- Recuperación densa (dense retrieval) consulta-documento con índice precalculado, adecuada para búsqueda semántica y RAG.
- Representaciones Matryoshka: un mismo modelo sirve vectores de 768 y 384 dimensiones, lo que permite ajustar el equilibrio entre precisión y coste de almacenamiento.
- Salida de 384 dimensiones con calidad de recuperación igual o superior a la de 768 en el conjunto de test del autor.
- Inferencia en CPU con artefacto ONNX UINT8, pensada para despliegues sin GPU.
- Compatibilidad declarada con text-embeddings-inference y con endpoints de HuggingFace.
- Capacidades específicas para contenido social: relevancia título/cuerpo (Reddit), paráfrasis de preguntas (Quora), consulta/pasaje (MS MARCO) y relación entre captions del mismo vídeo (MSR-VTT).
- No soporta tool calling, function calling, razonamiento multi-paso, agentes, visión ni audio: es exclusivamente un encoder de embeddings.

## Casos de uso

- Búsqueda semántica sobre foros y comunidades: indexar títulos y cuerpos de hilos de Reddit con el vector de 384 dimensiones y recuperar hilos relevantes para una consulta en lenguaje natural; el modelo fue entrenado explícitamente con relaciones título/cuerpo de Reddit.
- Deduplicación y agrupación de preguntas: detectar preguntas equivalentes o paráfrasis en plataformas de Q&A usando los pares de Quora del entrenamiento, con umbral de similitud sobre vectores normalizados L2.
- Motor de recuperación para RAG ligero en CPU: desplegar el ONNX UINT8 en un servicio sin GPU, precalcular embeddings del corpus y resolver la fase de retrieval antes de pasar los pasajes a un LLM generativo.
- Moderación y triaje de contenido social: agrupar publicaciones por similitud semántica para detectar duplicados, campañas de spam o contenido repetido entre subforos.
- Búsqueda dentro de catálogos de vídeo: el modelo se entrenó con captions de MSR-VTT, por lo que puede emparejar descripciones textuales con subtítulos o metadatos de vídeos del mismo contenido.
- Enrutamiento y clasificación zero-shot por similitud: comparar un texto entrante contra descripciones de categorías embebidas para asignar etiquetas sin entrenar un clasificador adicional.
- Índice de bajo coste en memoria: con 384 dimensiones en float32 cada vector ocupa 1.536 bytes, lo que permite indexar millones de documentos en RAM en un servicio modesto; la variante de 768 dobla ese coste.
- Filtrado previo en pipelines de CI/CD de documentación: recuperar fragmentos de documentación técnica semánticamente próximos a un mensaje de error o a una descripción de cambio.

## Benchmarks y rendimiento

Recuperación en el conjunto de test retenido (427 consultas y 427 documentos de corpus; etiquetas de relevancia derivadas de captions del mismo vídeo y no exhaustivas):

| Modelo | Dimensiones | Recall@1 | Recall@10 | MRR@10 | nDCG@10 |
|---|---|---|---|---|---|
| bge-small-384 (base) | 384 | 0,3958 | 0,7073 | 0,4859 | 0,5383 |
| bge-base-768 (base) | 768 | 0,4075 | 0,7119 | 0,4963 | 0,5476 |
| bge-base truncado a 384 (base) | 384 | 0,4169 | 0,7026 | 0,4987 | 0,5469 |
| Social Embedding fine-tuned | 768 | 0,4450 | 0,7681 | 0,5503 | 0,6027 |
| Social Embedding fine-tuned | 384 | 0,4543 | 0,7658 | 0,5527 | 0,6037 |

Recuperación en validación (432 consultas de captions) para las líneas base preentrenadas:

| Modelo | Dimensiones | Recall@1 | Recall@10 | MRR@10 | nDCG@10 |
|---|---|---|---|---|---|
| bge-small-384 | 384 | 0,3727 | 0,6829 | 0,4622 | 0,5147 |
| bge-base-768 | 768 | 0,3819 | 0,6968 | 0,4730 | 0,5262 |
| bge-base truncado a 384 | 384 | 0,3773 | 0,6667 | 0,4660 | 0,5142 |

Comparativa de cuantizaciones ONNX en validación (entorno CPU de Colab):

| Variante | Tamano (MiB) | Recall@10 | nDCG | Throughput (textos/s) |
|---|---|---|---|---|
| FP32 | 415,61 | 0,7454 | 0,5707 | 12,64 |
| UINT8 | 104,60 | 0,7523 | 0,5676 | 15,64 |
| INT4 | 142,33 | 0,7361 | 0,5574 | 11,11 |
| UINT4 | 143,60 | 0,7500 | 0,5658 | 13,01 |

Advertencia del autor: los resultados de test corresponden al encoder fine-tuned en precisión original, no a una evaluación independiente del artefacto ONNX cuantizado. No se han publicado resultados en benchmarks estándar tipo MMLU, HumanEval o GSM8K, que no aplican a un modelo de embeddings.

## Requisitos de hardware

- Inferencia en CPU totalmente viable: el artefacto UINT8 ocupa 104,6 MiB y el FP32 415,61 MiB, por lo que cabe en cualquier máquina con unos pocos cientos de MiB de RAM libre.
- VRAM estimada en GPU: aproximadamente 0,2 GB en FP16 y 0,4 GB en FP32 para los pesos, más el espacio de activaciones, que es reducido al limitarse la secuencia a 128 tokens.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM sirve; para lotes grandes en producción de embeddings son adecuadas T4, L4, A10G, RTX 4090, A100 y H100, aunque la ventaja frente a CPU solo aparece con mucho volumen.
- Cabe en GPU de consumo: sí, en cualquier RTX o GTX moderna con 2 GB o más de VRAM, e incluso en iGPU y en CPU doméstica.
- Opciones de despliegue: ONNX Runtime (backend principal), text-embeddings-inference (soporte declarado en los tags), HuggingFace Inference Endpoints (tag endpoints_compatible), Optimum/ONNX para pipelines de transformers y un servidor propio tipo FastAPI sobre onnxruntime. No hay artefactos GGUF, por lo que llama.cpp y Ollama no son opciones directas; vLLM y TGI están orientados a modelos generativos y no aplican.
- Throughput medido por el autor en CPU de Colab: 15,64 textos/s con UINT8, 12,64 con FP32, 13,01 con UINT4 y 11,11 con INT4. En un único flujo equivale a unos 64 ms por texto con UINT8 (dato derivado de la tasa medida).
- Latencia en GPU para lotes de decenas de textos: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Dimensiones de salida | Contexto de entrada | nDCG@10 en test (caption retrieval) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Social Embedding v1.0 (este modelo) | ~109 M | 768 y 384 (Matryoshka) | 128 tokens | 0,6037 (384D) / 0,6027 (768D) | No disponible | ONNX en HuggingFace, 0 descargas |
| BAAI/bge-base-en-v1.5 | ~109 M (misma base) | 768 | No disponible en la informacion proporcionada | 0,5476 (linea base del autor) | No disponible en la informacion proporcionada | Modelo base ampliamente distribuido |
| BAAI/bge-small-en-v1.5 (linea base bge-small-384) | No disponible en la informacion proporcionada | 384 | No disponible en la informacion proporcionada | 0,5383 (linea base del autor) | No disponible en la informacion proporcionada | Modelo base distribuido |

La comparación se limita al dominio de evaluación del autor (recuperación de captions de MSR-VTT) y no permite extrapolar a otros corpus. Frente a bge-base-en-v1.5, el fine-tuning aporta aproximadamente +3,5 puntos de Recall@1 y +5,6 puntos de nDCG@10 en ese conjunto, además de permitir truncado a 384 dimensiones con pérdida prácticamente nula (nDCG@10 0,6037 frente a 0,6027). No se dispone de datos que comparen este modelo con alternativas orientadas a contenido social de otros proveedores.

## Limitaciones y advertencias

- Licencia no declarada: no hay información sobre permisos de uso comercial, modificación o redistribución. Es un bloqueante potencial para producción.
- Estado declarado como "deployment candidate", con distribución inicialmente privada a la espera de revisar permisos de los datos de origen; la procedencia de los cuatro datasets no se detalla en la model card.
- Solo inglés: no hay soporte multilingüe declarado ni evaluado.
- Longitud de entrada máxima de 128 tokens: insuficiente para pasajes largos, documentos completos o conversaciones; obliga a trocear el texto y puede degradar la recuperación en textos extensos.
- Fine-tuning de una sola época sobre 116.033 pares, con datasets pequeños por fuente (MS MARCO aporta solo 18.262 pares de entrenamiento frente a los cientos de miles habituales), lo que limita la generalización fuera de los dominios cubiertos.
- Evaluación restringida a un único conjunto de test de 427 consultas y 427 documentos, con etiquetas de relevancia no exhaustivas derivadas de captions del mismo vídeo; las métricas pueden estar sobreestimadas por relevancia no anotada.
- La revisión de calidad del etiquetado se hizo sobre 40 ejemplos y, según el autor, no constituye una estimación de precisión del dataset.
- El artefacto ONNX cuantizado no se ha evaluado de forma independiente: las métricas de test corresponden al encoder fine-tuned, no al modelo UINT8 que se recomienda desplegar.
- Las cifras de throughput proceden de un entorno CPU de Colab concreto y no son extrapolables a otros servidores.
- Riesgo de alucinación no aplica en sentido generativo (no produce texto), pero sí existe riesgo de recuperar pasajes semánticamente próximos y factualmente irrelevantes; requiere umbral de similitud y validación aguas abajo.
- No se han publicado análisis de sesgos. Los datos de Reddit y Quora pueden introducir sesgos sociales, demográficos y de estilo que se reflejen en los embeddings y afecten a la paridad entre grupos en tareas de recuperación o moderación.
- Ausencia total de tracción: 0 descargas y 0 likes en el momento de la consulta, sin validación por terceros ni informes independientes.
- Un fallo de recuperación con este modelo no se puede corregir con prompting: la calidad depende por completo del índice y del corpus precalculado.
- El cribado de casi duplicados es aproximado y el split es group-aware, pero no se detalla el criterio de agrupación, lo que dificulta auditar posibles fugas entre train y test.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/harsimran2004/social-embedding-v1-384d-onnx
- Modelo base BAAI/bge-base-en-v1.5: https://huggingface.co/BAAI/bge-base-en-v1.5
- Paper, blog, repositorio o demo adicionales: no disponible. La búsqueda web realizada no devolvió resultados relevantes para este modelo.
