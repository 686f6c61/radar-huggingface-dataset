# mahiyama/Sazanami-AGC-310m

## Resumen

Sazanami-AGC-310m es un modelo de recuperación de información (retrieval) en japonés desarrollado por mahiyama (Masayuki Hiyama) y publicado bajo licencia MIT. Parte del checkpoint sbintuitions/modernbert-ja-310m, un encoder transformer de tipo ModernBERT con 314.611.968 parámetros, y se ha entrenado específicamente para búsqueda por Late Interaction con compresión de índice. No es un modelo generativo: es un encoder de representaciones (pipeline de feature-extraction) que produce embeddings multi-vector para consultas y documentos.

Su particularidad técnica es AGC (Attention-Guided Compression), un método que estima la importancia de cada token a partir de las ponderaciones de atención y agrega cada documento en un máximo de 32 vectores de 128 dimensiones, en lugar de almacenar un vector por token como hace ColBERT. Frente a Sazanami-ColBERT-310m, reduce la cantidad de vectores almacenados a aproximadamente 1/23 y el tiempo de cálculo de similitud a aproximadamente 1/11, con una pérdida de precisión casi nula en documentos cortos y una degradación clara en escenarios de documentos largos con muchos candidatos.

Es relevante para equipos que construyen sistemas RAG o motores de búsqueda semántica en japonés con restricciones de almacenamiento o latencia, y que necesitan el equilibrio entre la granularidad del Late Interaction y el coste operativo de un índice multi-vector completo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con agregación (encoder ModernBERT) → proyección lineal por token (768 → 128, sin sesgo) → normalización L2 |
| Parametros totales | 314.611.968 (~315M); incluye 24.576 parámetros de tokens de estimación de importancia y 98.304 de la capa de proyección |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible; entrada recomendada de 256 tokens para consulta y 1.024 tokens para documento, más 32 tokens de estimación de importancia |
| Tipos de cuantizacion | no disponible (no se documentan cuantizaciones; el entrenamiento se realizó en bf16) |
| Idiomas soportados | japonés (ja) |
| Licencia | MIT |
| Formato de pesos | safetensors (repositorio de 1,3 GB) |
| Dimension del embedding | 128 |
| Vectores por documento | máximo 32 (media de 30,31 en JaGovFaqs-22k) |
| Vectores por consulta | igual al número de tokens válidos de la consulta |
| Funcion de similitud | MaxSim (suma de la máxima similitud por token de consulta) |
| Prefijos | consulta: `検索クエリ: `; documento: 32 tokens de estimación de importancia + `検索文書: ` (gestionados por el modelo) |
| Framework principal | sentence-transformers 6.0.0 o superior (`MultiVectorEncoder`, con `trust_remote_code=True`) |

## Arquitectura y entrenamiento

El modelo se inicializa desde sbintuitions/modernbert-ja-310m, un encoder ModernBERT entrenado únicamente con objetivos de modelado enmascarado y sin aprendizaje orientado a recuperación. Sobre esa base se añaden dos componentes inicializados desde cero: la capa de proyección lineal que transforma las representaciones de 768 a 128 dimensiones y los 32 tokens de estimación de importancia, cuyos embeddings se inicializan a partir de la media de los embeddings del vocabulario más un pequeño ruido. El aprendizaje de la interacción tardía y de la compresión documental se realiza de forma conjunta en una sola pasada de entrenamiento, en precisión mixta bf16. El autor indica que también probó a partir de un modelo de Late Interaction ya entrenado y que, en este conjunto de tareas, no obtuvo diferencias.

El mecanismo AGC funciona en cuatro pasos. Primero se concatenan los 32 tokens de estimación de importancia al inicio del documento. Después, en la última capa, se promedian las ponderaciones de atención que esos 32 tokens dirigen hacia cada token del cuerpo para obtener una puntuación de importancia por token, calculando solo las filas necesarias en lugar de almacenar las matrices de atención de todas las capas. A continuación se seleccionan los 32 tokens con mayor importancia como centros de agrupamiento. Por último, cada token del documento se asigna al centro más cercano en representación y se agrega mediante una media ponderada por importancia dentro de cada clúster, seguida de proyección y normalización L2. La consulta conserva la representación token a token original, de modo que la función de similitud MaxSim no cambia: solo disminuye el número de vectores del índice.

Los datos de entrenamiento combinan n-tuples (un positivo y cinco negativos por consulta) y pares positivos, con un total de 379.029 ejemplos según la suma de los recuentos de la model card (el documento original muestra la cifra truncada como «379,0»). Las fuentes incluyen auto-wiki-qa (100.000), mqa-ja (100.000), mmarco-ja (50.000), el dataset privado civicqa-ja (43.382 en n-tuples y 28.653 en pares), quiz-no-mori (13.422), quiz-works (12.502), amagasaki-qna (11.069 en n-tuples y 7.323 en pares), miracl-retrieval (4.603), mrtydi (3.602), anlp-meeting-retrieval en las variantes title-abs (1.926) y title-intro (1.952) y kosodate-faq-pairs-ja (595). No se documenta el uso de RLHF ni de DPO, algo esperable en un encoder de recuperación.

## Capacidades

- Recuperación de información monolingüe en japonés mediante representaciones multi-vector (Late Interaction).
- Codificación de documentos en un máximo de 32 vectores de 128 dimensiones por documento, con agregación guiada por atención.
- Codificación de consultas con representación token a token, sin compresión.
- Cálculo de similitud mediante MaxSim, con soporte nativo en sentence-transformers 6.0.0 y superiores a través de `MultiVectorEncoder`.
- Gestión automática de prefijos y de los tokens de estimación de importancia: no es necesario añadirlos manualmente al texto.
- Compatibilidad declarada con text-embeddings-inference y con endpoints compatibles de Hugging Face.
- No es un modelo generativo: no produce texto, no soporta tool calling ni function calling, no implementa agentes ni razonamiento multi-paso y no tiene capacidades de visión, audio ni modo de pensamiento.
- Capacidad multilingüe: únicamente japonés (etiqueta de idioma `ja`).

## Casos de uso

- RAG sobre documentación interna en japonés: el modelo indexa manuales, políticas y notas técnicas reduciendo el índice a 32 vectores por documento, lo que abarata el almacenamiento frente a un ColBERT completo sin renunciar al emparejamiento a nivel de token en la consulta.
- Búsqueda en preguntas frecuentes de administración pública: el entrenamiento incluye corpus municipales (amagasaki-qna, kosodate-faq-pairs-ja, civicqa-ja) y una media de 30,31 vectores por documento en JaGovFaqs-22k, un perfil que encaja con portales de trámites y atención ciudadana.
- Atención al cliente automatizada: se puede usar como recuperador en un pipeline de respuesta a consultas de soporte en japonés, devolviendo los pasajes más relevantes para que un modelo generativo los sintetice.
- Búsqueda semántica sobre literatura académica: el modelo se entrenó con anlp-meeting-retrieval en variantes título-resumen y título-introducción, por lo que es adecuado para motores de búsqueda sobre actas de congresos y preprints japoneses.
- Reranking de candidatos: dado que la similitud MaxSim es más fina que una única representación vectorial, puede recolocar los primeros resultados devueltos por un recuperador léxico como BM25 en un sistema de búsqueda en dos etapas.
- Deduplicación y agrupamiento de documentos: las representaciones multi-vector permiten comparar pares de documentos similares en corpus grandes donde un índice de tokens completos resultaría demasiado costoso.
- Recuperación en comercio electrónico: búsqueda de productos por descripción o consulta en lenguaje natural en catálogos japoneses, con la ventaja de que el índice ocupa aproximadamente 1/23 del espacio respecto al modelo ColBERT de la misma familia.
- Filtrado de contexto para agentes conversacionales: selección de pasajes relevantes antes de pasarlos a un modelo generativo, controlando el coste de cómputo por consulta gracias a la reducción del tiempo de similitud.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente aporta comparaciones relativas entre los modelos de la misma familia: frente a Sazanami-ColBERT-310m, el almacenamiento de vectores se reduce a aproximadamente 1/23 y el tiempo de cálculo de similitud a aproximadamente 1/11. El autor señala que en tareas con documentos cortos la precisión apenas se deteriora, mientras que en tareas de búsqueda de documentos largos entre muchos candidatos la precisión disminuye de forma apreciable, sin aportar cifras concretas de nDCG, MRR ni Recall.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,6 GB de pesos en bf16 o fp16 y aproximadamente 1,26 GB en fp32, calculados a partir de los 314,6 M de parámetros. Con activaciones y procesamiento por lotes de documentos de hasta 1.024 tokens, el consumo típico se sitúa en el rango de 2 a 4 GB en precisión mixta (estimación, no dato publicado).
- GPU recomendadas: cualquier GPU con 8 GB o más, como RTX 3060, RTX 4060, RTX 4070, RTX 4090, L4 o superior. Para indexación por lotes a gran escala, A100 o H100 reducen el tiempo total de generación de vectores.
- Compatibilidad con GPU de consumo: sí, cabe holgadamente en tarjetas de consumo actuales e incluso en equipos con 4 GB de VRAM si se procesa en lotes pequeños.
- Ejecución en CPU: viable para inferencia puntual y para indexación de corpus modestos, dado el tamaño de 315 M de parámetros, aunque con mayor latencia que en GPU.
- Opciones de despliegue: sentence-transformers 6.0.0 o superior con `MultiVectorEncoder` y `trust_remote_code=True`, text-embeddings-inference y endpoints compatibles de Hugging Face. No se documenta soporte explícito para vLLM, llama.cpp u Ollama.
- Latencia y throughput: no disponibles como valores absolutos. La única referencia publicada es que el cálculo de similitud es aproximadamente 11 veces más rápido que el de Sazanami-ColBERT-310m.

## Comparativa con modelos similares

Los cuatro modelos de la familia comparten el mismo checkpoint base (sbintuitions/modernbert-ja-310m) y los mismos datos de entrenamiento; la diferencia está en el número de vectores por documento.

| Modelo | Vectores por documento | Dimension | Escenario recomendado | Licencia |
|---|---|---|---|---|
| Sazanami-ColBERT-310m | Igual al número de tokens válidos | 128 | Máxima precisión al buscar documentos largos entre muchos candidatos | no disponible en la informacion proporcionada |
| Sazanami-AGC-310m (este modelo) | Máximo 32 | 128 | Reducir el volumen de datos del índice manteniendo Late Interaction | MIT |
| Sazanami-MetaEmbed-310m | Máximo 64, con posibilidad de reducir el número en consulta | 128 | Acelerar el cálculo de similitud | no disponible en la informacion proporcionada |
| Sazanami-Embed-310m | 1 | 768 | Minimizar almacenamiento y cómputo; recuperación de un solo vector | no disponible en la informacion proporcionada |

Frente a un recuperador bi-encoder denso convencional, este modelo conserva el emparejamiento a nivel de token en el lado de la consulta, lo que suele traducirse en mayor precisión en consultas largas o con matices. El coste es un índice mayor que el de un único vector por documento, aunque aproximadamente 23 veces menor que el de un ColBERT completo.

## Limitaciones y advertencias

- Cobertura de idioma restringida al japonés: no hay evidencia de rendimiento en castellano ni en otros idiomas.
- Degradación de precisión documentada en tareas de búsqueda de documentos largos entre muchos candidatos; el autor recomienda Sazanami-ColBERT-310m para ese perfil de uso.
- La compresión AGC resume cada documento en 32 centros ponderados, de modo que la información relevante distribuida de forma muy dispersa en el texto puede perderse en la agregación.
- Sesgos: no se documenta ningún análisis de sesgos. El entrenamiento utiliza corpus japoneses heterogéneos (Wikipedia, QA municipal, cuestionarios, MIRACL, MrTydi, FAQ de crianza), por lo que puede heredar los sesgos presentes en esas fuentes.
- Riesgo de alucinación: al no ser un modelo generativo, no produce texto, pero puede devolver pasajes irrelevantes si MaxSim otorga puntuaciones altas a coincidencias superficiales de tokens.
- Requiere sentence-transformers 6.0.0 o superior y el uso de `trust_remote_code=True`, lo que implica ejecutar código remoto del repositorio del autor.
- El dataset civicqa-ja empleado en el entrenamiento es privado y no está publicado, por lo que no es posible reproducir exactamente la mezcla de datos.
- Licencia MIT permite uso comercial y modificación, pero conviene revisar las licencias de los checkpoints base y de los datasets derivados antes de un despliegue en producción.
- Ausencia de validación externa: el repositorio registra 0 descargas y 0 «likes» en el momento de la consulta, y no hay resultados de benchmarks públicos que permitan contrastar las afirmaciones de la model card.
- No se documentan límites máximos de secuencia del encoder base distintos de la entrada recomendada (256 tokens para consulta, 1.024 para documento), por lo que conviene validar el comportamiento con entradas más largas antes de usarlo en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mahiyama/Sazanami-AGC-310m
- Modelo base: https://huggingface.co/sbintuitions/modernbert-ja-310m
- Sazanami-ColBERT-310m: https://huggingface.co/mahiyama/Sazanami-ColBERT-310m
- Sazanami-MetaEmbed-310m: https://huggingface.co/mahiyama/Sazanami-MetaEmbed-310m
- Sazanami-Embed-310m: https://huggingface.co/mahiyama/Sazanami-Embed-310m
- Perfil del autor: https://huggingface.co/mahiyama
- splade-amagasaki-qna-310m (modelo relacionado del mismo autor): https://huggingface.co/mahiyama/splade-amagasaki-qna-310m
- Artículo de ColBERT: https://arxiv.org/abs/2004.12832
- Artículo de ColBERTv2: https://arxiv.org/abs/2112.01488
- Artículo de AGC (Multi-Vector Index Compression in Any Modality): https://arxiv.org/html/2602.21202 (arXiv:2602.21202)
- Documentación de MultiVectorEncoder en sentence-transformers: https://sbert.net/docs/package_reference/multi_vector_encoder/model.html
- Dataset auto-wiki-qa: https://huggingface.co/datasets/mahiyama/auto-wiki-qa
- Dataset mqa-ja: https://huggingface.co/datasets/mahiyama/mqa-ja
- Dataset mmarco-ja: https://huggingface.co/datasets/mahiyama/mmarco-ja
- Dataset miracl-retrieval: https://huggingface.co/datasets/mahiyama/miracl-retrieval
- Dataset mrtydi: https://huggingface.co/datasets/mahiyama/mrtydi
- Dataset amagasaki-qna: https://huggingface.co/datasets/mahiyama/amagasaki-qna
- Dataset quiz-works: https://huggingface.co/datasets/mahiyama/quiz-works
- Dataset quiz-no-mori: https://huggingface.co/datasets/mahiyama/quiz-no-mori
- Dataset anlp-meeting-retrieval: https://huggingface.co/datasets/mahiyama/anlp-meeting-retrieval
- Dataset kosodate-faq-pairs-ja: https://huggingface.co/datasets/mahiyama/kosodate-faq-pairs-ja
