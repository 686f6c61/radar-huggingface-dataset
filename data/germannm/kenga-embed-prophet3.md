# GermannM/kenga-embed-prophet3

## Resumen

kenga-embed-prophet3 es un encoder de frases (sentence encoder) de 44,2 millones de parámetros para ruso e inglés, publicado por el autor GermannM dentro del proyecto Kenga. No es un modelo generativo: su salida es un vector denso de 768 dimensiones, normalizado en L2, pensado para similitud semántica, recuperación de información y clasificación de textos. Se distribuye bajo licencia MIT y con un tamaño de repositorio de 0,2 GB.

Técnicamente se apoya en un transformer bidireccional con factorización Z (proyecciones de atención y de la capa feed-forward factorizadas), tokenizador SentencePiece de 16k, pooling por media y una ventana de contexto de 512 tokens. El protocolo de prefijos es el heredado de FRIDA / BERTA, de modo que puede sustituir a esos modelos en pipelines ya existentes sin reescribir el preprocesado.

Su relevancia es acotada y el propio autor la delimita: es un modelo pequeño, aproximadamente diez veces menor que Giga-Embeddings-instruct-480M, y su comparación natural es con encoders rusos de 30-40M como USER2-small-34M o rubert-tiny-turbo-29M. En las 23 tareas completadas del MTEB(rus, v1.1) obtiene una media de 53,4 (51,2 en la media por tipo de tarea estilo leaderboard), frente a 74,2 de Giga-Embeddings-instruct-480M y 58,5 de USER2-small-34M. El propio autor indica explícitamente que "no supera a Giga".

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer bidireccional con factorización Z (Z-factored); encoder de frases con mean pooling |
| Parámetros totales | 44,2 M (44M) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 512 tokens (posiciones aprendidas hasta 512) |
| Tipos de cuantización | no disponible (solo se publica un checkpoint fp32 de 177 MB; no se documentan versiones GGUF, int8 ni fp16) |
| Idiomas soportados | ruso (ru) e inglés (en) |
| Licencia | MIT |
| Formato de pesos | `pytorch_model.bin` (PyTorch binario) + `config.json` + `kenga_spm.model` (SentencePiece) + `modeling_kenga_embed_v2.py` autocontenido |

Detalles de dimensión: d=768, 8 capas, 12 cabezas, dff=3072. Embedding de tokens factorizado (16385 x 128 -> 768). Proyecciones de atención y feed-forward con factorización Z de rango 192/512. Salida de 768 dimensiones normalizada en L2. Checkpoint en el paso 1000 de entrenamiento.

## Arquitectura y entrenamiento

La arquitectura es un transformer bidireccional tipo encoder con dos rasgos distintivos. El primero es el embedding de tokens factorizado: en lugar de una matriz de embedding completa de 16385 x 768, se aprende un espacio intermedio de 128 dimensiones que se proyecta a 768, lo que reduce el recuento de parámetros. El segundo es la factorización Z de las proyecciones de atención y de la capa feed-forward, con rangos de 192 y 512 respectivamente. El modelo usa posiciones aprendidas hasta 512 tokens, pooling por media sobre las representaciones y normalización L2 de la salida. El tokenizador es SentencePiece con vocabulario de 16k.

En cuanto al entrenamiento, la model card indica que la receta de la etapa Prophet parte de `kenga-embed-z2` y añade una fase supervisada con tres componentes: InfoNCE con negativos duros minados sobre 80.000 pares de recuperación (estilo RuBQ / MIRACL: pares pregunta-respuesta y título-pasaje de Wikipedia), CoSENT sobre 20.000 pares STS, y una pérdida de anclaje (anchor loss) que mantiene el embedding cerca del del profesor para no sobrescribir el conocimiento destilado. Los entrenadores en PyTorch se encuentran en el árbol de laboratorio `z-system` (`build_segments.py`, `teacher.py`, `distill.py`, `build_ft_data.py`, `mine_hard.py`, `finetune_prophet.py`, `run_mteb.py`), que no forma parte del repositorio público `kenga-lang`.

Conviene señalar una discrepancia en la documentación: el título de la model card es `kenga-embed-prophet3`, pero el párrafo de entrenamiento describe la etapa de `kenga-embed-prophet2`. No se documenta en la información disponible si prophet3 reutiliza literalmente la receta de prophet2 o si el texto es un remanente no actualizado.

Protocolo de prefijos (se antepone automáticamente "<prefijo>: <texto>"):

| Uso | Prefijo |
|---|---|
| Consulta de recuperación | `search_query` |
| Documento de recuperación | `search_document` |
| STS / paráfrasis (ambos lados) | `paraphrase` |
| Clasificación y clustering | `categorize`, `categorize_sentiment`, `categorize_topic` |
| NLI / entailment (TERRa) | `categorize_entailment` |

## Capacidades

- Generación de embeddings de frases y pasajes: salida de 768 dimensiones normalizada en L2, lista para similitud coseno directa mediante producto matricial.
- Recuperación de información (retrieval) sobre corpus en ruso e inglés, con prefijos separados para consulta y documento.
- Similitud semántica textual (STS) y detección de paráfrasis mediante el prefijo `paraphrase`.
- Clasificación de textos por embedding: sentimiento, tema y categoría general, además de entailment / NLI.
- Clustering de textos (P2P) y reranking de resultados de búsqueda.
- Soporte bilingüe ru-en; no hay evidencia de cobertura de otros idiomas.
- No soporta generación de texto, razonamiento autoregresivo, tool calling, function calling, uso como agente, visión, audio ni modo thinking. Es exclusivamente un encoder de representaciones.
- Compatibilidad de protocolo con FRIDA / BERTA, lo que permite sustituirlos en pipelines existentes sin cambiar el preprocesado de prefijos.

## Casos de uso

- Búsqueda semántica interna sobre documentación en ruso: indexar el corpus con `search_document`, emitir la consulta con `search_query` y recuperar por similitud coseno. Adecuado por su ventana de 512 tokens, que cubre pasajes y fragmentos de documento típicos.
- Deduplicación y clustering de noticias o reseñas: agrupar titulares y textos de reseñas mediante embeddings con prefijo `categorize_topic` para detectar temas recurrentes sin etiquetado previo.
- Reranking ligero en un pipeline de búsqueda híbrida: usar el modelo como segunda etapa sobre los candidatos devueltos por un recuperador léxico, con la ventaja de que 44M parámetros permiten ejecutarlo en CPU con latencia baja.
- Moderación y filtrado de contenido: la tarea SensitiveTopicsClassification está incluida en la evaluación, de modo que el modelo puede servir como señal auxiliar para detectar temas sensibles, aunque con la salvedad de que su puntuación en esa tarea es de 23,5 y no debería usarse como único filtro en producción.
- Clasificación de intenciones en asistentes conversacionales en ruso: las tareas MassiveIntentClassification y MassiveScenarioClassification están cubiertas, lo que permite entrenar un clasificador lineal sobre los embeddings en lugar de ajustar un modelo generativo completo.
- Búsqueda de preguntas frecuentes y soporte al cliente: indexar el catálogo de respuestas con `search_document` y mapear la consulta del usuario con `search_query` para devolver la respuesta más cercana. El coste computacional es mínimo al ser un modelo de 44M.
- Filtrado previo en pipelines RAG en ruso: sustituir un encoder multilingüe grande por este modelo cuando el corpus sea mayoritariamente ruso y el presupuesto de latencia o de VRAM sea reducido, aceptando la pérdida de calidad en retrieval documentada en los benchmarks.
- Detección de similitud entre pares pregunta-respuesta en sistemas de evaluación automática o en la construcción de datasets de entrenamiento, usando el prefijo `paraphrase` sobre ambos lados.

## Benchmarks y rendimiento

Resultados oficiales de MTEB(rus, v1.1), ejecutados con `mteb==2.20.5`, todos los splits y subconjuntos definidos por el benchmark, sin omitir ni reponderar tareas. 23 de 23 tareas completadas. Las columnas de referencia provienen de las entregas de cada modelo al leaderboard oficial.

| Tarea | kenga-embed-prophet3 | Giga-Embeddings-instruct-480M | BERTA-128M | USER2-small-34M | rubert-tiny-turbo-29M |
|---|---:|---:|---:|---:|---:|
| GeoreviewClassification | 45,2 | 55,4 | 54,8 | 41,1 | 41,4 |
| HeadlineClassification | 81,6 | 89,0 | 89,0 | 74,3 | 68,9 |
| InappropriatenessClassification | 58,6 | 86,1 | 74,8 | 60,7 | 59,1 |
| KinopoiskClassification | 61,0 | 73,0 | 67,8 | 52,2 | 50,5 |
| MassiveIntentClassification | 56,3 | 85,3 | 74,0 | 66,1 | 58,0 |
| MassiveScenarioClassification | 66,6 | 90,9 | 84,5 | 70,3 | 62,9 |
| RuReviewsClassification | 68,4 | 76,3 | 72,3 | 60,8 | 60,7 |
| RuSciBenchGRNTIClassification | 60,8 | 74,0 | 69,0 | 63,1 | 52,9 |
| RuSciBenchOECDClassification | 46,2 | 59,9 | 54,8 | 49,2 | 40,8 |
| CEDRClassification | 51,7 | 69,8 | 73,0 | 39,4 | 39,0 |
| SensitiveTopicsClassification | 23,5 | 44,3 | 39,9 | 27,5 | 25,2 |
| GeoreviewClusteringP2P | 43,9 | 73,8 | 73,8 | 66,2 | 59,7 |
| RuSciBenchGRNTIClusteringP2P | 58,3 | 70,5 | 65,0 | 56,4 | 48,1 |
| RuSciBenchOECDClusteringP2P | 49,6 | 58,1 | 55,6 | 48,6 | 41,1 |
| TERRa | 61,1 | 79,6 | 65,7 | 54,0 | 56,3 |
| RuBQReranking | 60,2 | 80,5 | 75,2 | 66,0 | 62,2 |
| MIRACLReranking | 38,4 | 67,5 | 64,3 | 50,5 | 47,7 |
| RiaNewsRetrievalHardNegatives.v2 | 38,2 | 88,9 | 84,5 | 74,5 | 52,3 |
| RuBQRetrieval | 41,5 | 80,6 | 71,0 | 61,1 | 51,7 |
| MIRACLRetrievalHardNegatives.v2 | 30,5 | 74,7 | 65,9 | 46,1 | 42,4 |
| RUParaPhraserSTS | 65,9 | 78,3 | 77,8 | 69,6 | 72,1 |
| RuSTSBenchmarkSTS | 70,2 | 83,6 | 82,2 | 81,0 | 78,5 |
| STS22 | 51,4 | 65,3 | 61,1 | 66,1 | 64,6 |

Agregados por tipo de tarea:

| Tipo de tarea | kenga-embed-prophet3 | Giga-Embeddings-instruct-480M | BERTA-128M | USER2-small-34M | rubert-tiny-turbo-29M |
|---|---:|---:|---:|---:|---:|
| Classification (media) | 60,5 | 76,7 | 71,2 | 59,8 | 55,0 |
| MultilabelClassification (media) | 37,6 | 57,1 | 56,5 | 33,5 | 32,1 |
| Clustering (media) | 50,6 | 67,5 | 64,8 | 57,1 | 49,6 |
| PairClassification (media) | 61,1 | 79,6 | 65,7 | 54,0 | 56,3 |
| Reranking (media) | 49,3 | 74,0 | 69,7 | 58,3 | 54,9 |
| Retrieval (media) | 36,7 | 81,4 | 73,8 | 60,6 | 48,8 |
| STS (media) | 62,5 | 75,7 | 73,7 | 72,2 | 71,7 |
| Media sobre tareas | 53,4 | 74,2 | 69,4 | 58,5 | 53,7 |
| Media sobre tipos de tarea (leaderboard) | 51,2 | 73,1 | 67,9 | 56,5 | 52,6 |
| Tareas completadas | 23 | 23 | 23 | 23 | 23 |

Según el propio autor, la brecha frente a Giga-Embeddings-instruct-480M en la media simple de las 23 tareas es de +20,7 puntos a favor de Giga, y de -5,0 puntos frente a USER2-small-34M (es decir, kenga-embed-prophet3 queda por debajo de USER2-small-34M en esa métrica). Los ficheros de resultados en bruto están en `mteb_results/` del árbol de entrenamiento. No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) porque el modelo no es generativo y esas evaluaciones no aplican.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint fp32 ocupa 177 MB. Con activaciones para lotes pequeños, el consumo realista es inferior a 1 GB de VRAM. Cabe holgadamente en cualquier GPU con al menos 2 GB.
- GPU recomendadas: no requiere GPU dedicada. Funciona en CPU (la model card lo indica explícitamente: "cpu works too"). Cualquier GPU CUDA moderna (RTX 3060, RTX 4090, A100, H100) es más que suficiente y quedará limitada por el ancho de banda de memoria, no por la capacidad de cómputo.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo actual e incluso en GPU integradas, y también en CPU. No se documentan requisitos mínimos adicionales.
- Opciones de despliegue: el modelo necesita su código propio (`modeling_kenga_embed_v2.py`, que depende únicamente de torch y sentencepiece) y se carga con `KengaEmbedV2HF.from_pretrained(...)` o mediante `huggingface_hub.snapshot_download`. No se documenta soporte para vLLM, llama.cpp, Ollama, TGI ni ningún formato GGUF, algo esperable al tratarse de un encoder y no de un modelo generativo.
- Latencia y throughput estimados: no disponible. No se publican mediciones de latencia ni de tokens por segundo.

## Comparativa con modelos similares

Todos los modelos de la comparativa son encoders de frases multilingües o rusos. Las puntuaciones corresponden a la media sobre tipos de tarea del MTEB(rus, v1.1) reportada en la propia model card.

| Modelo | Parámetros | Contexto | Media leaderboard (MTEB rus) | Licencia | Disponibilidad |
|---|---:|---:|---:|---|---|
| kenga-embed-prophet3 | 44,2 M | 512 tokens | 51,2 | MIT | HuggingFace, requiere código propio |
| Giga-Embeddings-instruct-480M | 480 M | no disponible en la información proporcionada | 73,1 | no disponible en la información proporcionada | HuggingFace / leaderboard MTEB |
| BERTA-128M | 128 M | no disponible en la información proporcionada | 67,9 | no disponible en la información proporcionada | HuggingFace / leaderboard MTEB |
| USER2-small-34M | 34 M | no disponible en la información proporcionada | 56,5 | no disponible en la información proporcionada | HuggingFace / leaderboard MTEB |
| rubert-tiny-turbo-29M | 29 M | no disponible en la información proporcionada | 52,6 | no disponible en la información proporcionada | HuggingFace / leaderboard MTEB |

Lectura de la comparativa: kenga-embed-prophet3 se sitúa por debajo de USER2-small-34M (51,2 frente a 56,5) a pesar de tener más parámetros, y muy por debajo de BERTA-128M y Giga-Embeddings-instruct-480M. Su ventaja principal frente a estos últimos es el tamaño reducido, la licencia MIT y la compatibilidad de protocolo de prefijos con FRIDA / BERTA. La información sobre contexto y licencia de los modelos de referencia no está disponible en el material proporcionado.

## Limitaciones y advertencias

- Calidad limitada en recuperación: es el punto más débil del modelo. La media de Retrieval es 36,7 frente a 81,4 de Giga-Embeddings-instruct-480M y 73,8 de BERTA-128M. En RiaNewsRetrievalHardNegatives.v2 obtiene 38,2 frente a 88,9 de Giga. No es recomendable como recuperador principal en producción sin un reranker posterior.
- Rendimiento inferior a USER2-small-34M en la media global (53,4 frente a 58,5 en media simple de tareas; 51,2 frente a 56,5 en media por tipo de tarea), a pesar de tener más parámetros.
- Rendimiento bajo en clasificación de temas sensibles: 23,5 en SensitiveTopicsClassification, el valor más bajo de toda la tabla. No debe usarse como único mecanismo de moderación.
- Cobertura lingüística restringida a ruso e inglés. No hay evidencia de soporte para otros idiomas, incluido el castellano.
- Ventana de contexto de solo 512 tokens: los documentos largos deben trocearse antes de generar embeddings.
- Riesgo de alucinación: no aplica en el sentido generativo, ya que el modelo no produce texto. El riesgo equivalente es la recuperación de pasajes semánticamente próximos pero incorrectos en tareas de retrieval, acentuado por las puntuaciones bajas en esa categoría.
- Sesgos conocidos: no se documentan análisis de sesgo en la información disponible.
- Licencia MIT: permite uso comercial, modificación y redistribución sin restricciones adicionales documentadas. Es la licencia más permisiva del grupo comparado.
- Repositorio sin tracción: 0 descargas y 0 "likes" en el momento de la consulta, lo que implica ausencia de validación por parte de la comunidad.
- Requiere código propio: no es un modelo estándar de `sentence-transformers`; hay que cargar `modeling_kenga_embed_v2.py` y `kenga_spm.model`. Esto complica la integración en frameworks que esperan un checkpoint Transformers convencional y obliga a gestionar y auditar el código del autor.
- Inconsistencia documental: la model card titula el modelo como prophet3, pero el párrafo de entrenamiento describe la etapa de prophet2. Además, los entrenadores no están en el repositorio público `kenga-lang`, sino en un árbol de laboratorio privado (`z-system`), lo que limita la reproducibilidad.
- Fecha de publicación del repositorio (2026-09-12) posterior a la fecha de la consulta; conviene verificar la vigencia y el estado del repositorio antes de integrarlo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/GermannM/kenga-embed-prophet3
- Repositorio del proyecto Kenga: https://github.com/GermannM/kenga-lang
- Documentación de la etapa Prophet: `docs/PROPHETS.md` en el repositorio kenga-lang. El enlace facilitado en la model card está truncado: https://github.com/GermannM/kenga-lang/blob/m...
- Resultados oficiales del leaderboard MTEB: https://github.com/embeddings-benchmark/results
- Resultados en bruto de la evaluación: carpeta `mteb_results/` del árbol de entrenamiento (no pública según la información disponible)
- Búsqueda web: los resultados devueltos (Google Traduction, Google, Google Images, Google Earth, Google Drive) no contienen información relevante sobre el modelo y se han descartado.
