# Omarbm52/Artemis-Embed-v1

## Resumen

Artemis-Embed-v1 es un modelo de embeddings densos de propósito general para inglés, publicado por el usuario Omarbm52 en Hugging Face. Se construye sobre el backbone `answerdotai/ModernBERT-base` y se distribuye a través de la librería `sentence-transformers` con pipeline `feature-extraction`. Su función es convertir texto en un único vector denso normalizado en L2, pensado para similitud semántica, recuperación de documentos, clustering y extracción de características para clasificadores posteriores.

El modelo tiene 149.014.272 parámetros (aproximadamente 149 M) y produce embeddings de 768 dimensiones, con soporte Matryoshka que permite truncar a 512, 256 o 128 dimensiones reduciendo el coste de almacenamiento y de cálculo de similitud. La receta de entrenamiento declarada combina LoRA, aprendizaje contrastivo, negativos duros y aprendizaje Matryoshka, aunque el autor no detalla el volumen ni la composición del dataset.

Su relevancia actual es limitada pero ilustrativa: se trata de un modelo recién publicado, con cero descargas y cero valoraciones en el momento de la consulta, sin licencia declarada y con resultados únicamente internos de desarrollo. Resulta interesante como ejemplo de adaptación eficiente de ModernBERT a tareas de recuperación con presupuesto de cómputo reducido, pero no está listo para sustituir a los modelos de embeddings consolidados en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder bidireccional (backbone `answerdotai/ModernBERT-base`) |
| Parametros totales | 149.014.272 (aproximadamente 149 M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 128 tokens probados en esta release (el backbone ModernBERT-base soporta hasta 8192) |
| Tipos de cuantizacion | no disponible (no se documentan cuantizaciones publicadas) |
| Idiomas soportados | Inglés (en) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Dimension del embedding | 768 (Matryoshka: 768 / 512 / 256 / 128) |
| Pooling | Media enmascarada (masked mean) |
| Normalizacion | L2, aplicada después del truncado Matryoshka |
| Tamano del repositorio | 0,6 GB |
| Libreria | sentence-transformers |
| Pipeline | feature-extraction |
| Etiquetas adicionales | text-embeddings-inference, endpoints_compatible |

## Arquitectura y entrenamiento

El modelo es un encoder transformer bidireccional derivado de ModernBERT-base, sin cabeza generativa: la salida es un vector denso por texto. El pooling empleado es la media enmascarada de las representaciones de tokens, seguida de normalización L2. El vector completo es de 768 dimensiones y se ofrecen prefijos Matryoshka de 512, 256 y 128 dimensiones; el autor advierte explícitamente que truncar dimensiones reduce almacenamiento, ancho de banda, coste de similitud y tamaño de índice, pero no reduce los FLOPs del forward pass del backbone.

La receta de entrenamiento declarada es LoRA más entrenamiento contrastivo con negativos duros y aprendizaje Matryoshka. No se especifica el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases adicionales de ajuste. El propio autor señala que las ramas de entrenamiento no estuvieron todas controladas por cómputo, por lo que el resultado no debe interpretarse como evidencia de que LoRA sea superior al ajuste completo. Tampoco se documenta la longitud de contexto usada durante el entrenamiento más allá de los 128 tokens probados en esta release, lo que sugiere que el modelo no fue entrenado para secuencias largas pese a la capacidad nativa del backbone.

## Capacidades

- Generación de embeddings de texto: un vector L2-normalizado por entrada, con pooling de media enmascarada.
- Similitud semántica entre frases y pasajes cortos.
- Recuperación de información (retrieval) y búsqueda semántica sobre corpus documentales.
- Clustering de textos y detección de duplicados o near-duplicates.
- Extracción de características para clasificadores downstream (regresión logística, SVM, MLP ligera).
- Representaciones Matryoshka: truncado a 512, 256 y 128 dimensiones con renormalización L2 posterior.
- Compatibilidad con `sentence-transformers`, `text-embeddings-inference` y endpoints compatibles.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo de pensamiento: es exclusivamente un modelo de embeddings.
- Capacidad multilingüe: no; la versión 1 es solo en inglés.

## Casos de uso

- Búsqueda semántica sobre documentación técnica: indexar fragmentos cortos (por debajo de 128 tokens) de manuales o APIs y recuperar los pasajes más relevantes ante una consulta en lenguaje natural, usando los 768 dimensiones para máxima calidad o 256 para reducir el índice.
- Recuperación aumentada (RAG) en pipelines de preguntas y respuestas: el modelo actúa como retriever sobre una base vectorial, alimentando a un LLM generativo con los pasajes recuperados; el truncado Matryoshka a 256 dimensiones permite reducir el coste de almacenamiento del índice a un tercio sin una caída drástica según los datos internos.
- Deduplicación de corpus: agrupar documentos casi idénticos en un dataset de entrenamiento mediante similitud coseno sobre embeddings de 128 dimensiones, mucho más rápido de calcular que con el vector completo.
- Clustering y etiquetado temático: agrupar tickets de soporte, reseñas o artículos en inglés con K-means sobre embeddings, y usar el resultado como etiqueta inicial para anotación humana.
- Clasificación de textos con pocos datos: usar los embeddings congelados como entrada de un clasificador lineal, útil cuando no hay suficientes ejemplos para ajustar un modelo completo.
- Motor de recomendación de contenidos: calcular similitud entre el embedding del historial de un usuario y el de artículos en inglés para generar recomendaciones por cercanía semántica.
- Moderación o enrutado de consultas: clasificar intenciones a partir de similitud con prototipos de intención predefinidos, con latencia baja al ser un modelo de 149 M de parámetros.

## Benchmarks y rendimiento

Los únicos datos disponibles son métricas internas de desarrollo del propio proyecto, no una evaluación MTEB en conjunto de test independiente. El autor lo advierte de forma explícita.

| Metrica (768 dimensiones) | Valor |
|---|---:|
| Retrieval Recall@1 | 0,8675 |
| Retrieval Recall@5 | 0,9700 |
| Retrieval MRR | 0,909534 |
| STS Spearman | 0,345035 |
| Classification accuracy | 0,872 |
| Clustering NMI | 0,589730 |
| Agregado interno | 0,702423 |

Resultados por dimensión Matryoshka:

| Dimension | R@1 | R@5 | MRR | STS Spearman |
|---:|---:|---:|---:|---:|
| 768 | 0,8675 | 0,9700 | 0,909534 | 0,345035 |
| 512 | 0,8550 | 0,9650 | 0,901461 | 0,344076 |
| 256 | 0,8275 | 0,9525 | 0,883264 | 0,330863 |
| 128 | 0,8250 | 0,9450 | 0,876263 | 0,329936 |

No se proporcionan comparaciones con otros modelos de embeddings en la información disponible. El valor de STS Spearman (0,345) es notablemente bajo en comparación con lo habitual en tareas de similitud textual, lo que sugiere que el modelo está optimizado para recuperación más que para similitud de pares.

## Requisitos de hardware

- VRAM estimada en fp32: aproximadamente 0,6 GB solo para pesos (149 M de parámetros), más activaciones y memoria del tokenizador.
- VRAM estimada en fp16/bf16: aproximadamente 0,3 GB para pesos.
- VRAM estimada en int8: aproximadamente 0,15 GB para pesos.
- Al ser un modelo de 149 M de parámetros, cabe con holgura en cualquier GPU de consumo: RTX 3060, RTX 4060, RTX 4090 e incluso iGPU con memoria compartida.
- Inferencia en CPU perfectamente viable; el cuello de botella real es el throughput de codificación por lotes, no la memoria.
- GPUs de datacenter (A100, H100, L40S) solo se justifican para indexación masiva por lotes muy grandes o para servir embeddings a escala con `text-embeddings-inference`.
- Opciones de despliegue: `sentence-transformers` en Python, `text-embeddings-inference` (la etiqueta del repositorio indica compatibilidad con endpoints), y cualquier runtime que cargue safetensors con arquitectura ModernBERT. No se documenta soporte de GGUF ni de llama.cpp en la información disponible.
- Latencia y throughput: no disponibles. La longitud máxima probada de 128 tokens mantiene los tiempos de codificación bajos por secuencia, pero el dato no está cuantificado por el autor.

## Comparativa con modelos similares

| Modelo | Parametros | Dimension | Contexto | Matryoshka | Licencia |
|---|---:|---:|---:|---|---|
| Artemis-Embed-v1 | 149 M | 768 | 128 tokens probados | Si (768/512/256/128) | no disponible |
| all-MiniLM-L6-v2 | 22,7 M | 384 | 256 tokens | No | Apache-2.0 |
| bge-base-en-v1.5 | 109 M | 768 | 512 tokens | No | MIT |
| E5-base-v2 | 109 M | 768 | 512 tokens | No | MIT |
| nomic-embed-text-v1.5 | 137 M | 768 | 8192 tokens | Si | Apache-2.0 |

La comparación de rendimiento con estos modelos no está disponible: Artemis-Embed-v1 solo publica métricas internas de desarrollo y no hay resultados MTEB comparables. Los datos de la tabla proceden de las fichas públicas de cada modelo alternativo, no de una evaluación conjunta. La limitación de 128 tokens probados sitúa a Artemis-Embed-v1 por debajo de todos los comparadores en longitud de secuencia admisible, lo que restringe su uso a fragmentos cortos.

## Limitaciones y advertencias

- Modelo exclusivamente en inglés; no procesa otros idiomas de forma fiable.
- Ventana probada de solo 128 tokens: los pasajes largos deben trocearse, lo que degrada la coherencia semántica de documentos completos.
- Las métricas publicadas son internas de desarrollo, no una evaluación MTEB en conjunto de test. El autor deja abierta la evaluación MTEB English v2.
- El autor reconoce que la revisión de licencias de los datasets, el solapamiento y la contaminación de datos están pendientes, requisito previo a cualquier afirmación de calidad de nivel investigación.
- Las ramas de entrenamiento no estuvieron controladas por cómputo, por lo que la comparación entre LoRA y ajuste completo no es concluyente.
- La puntuación de STS Spearman (0,345) es baja, lo que indica un rendimiento pobre en tareas de similitud entre pares de frases.
- Licencia no declarada: sin licencia explícita no hay autorización clara para uso comercial ni para redistribución; conviene contactar con el autor antes de integrarlo en producción.
- Cero descargas y cero valoraciones: no existe validación independiente por parte de la comunidad.
- Riesgo de alucinación no aplica en sentido generativo, pero sí existe riesgo de recuperaciones espurias cuando la consulta cae fuera de la distribución de entrenamiento (no documentada).
- El truncado Matryoshka no reduce los FLOPs del forward pass, solo el coste de almacenamiento y comparación de vectores.
- No se documenta soporte de cuantización ni formatos GGUF/ONNX; el despliegue en entornos no Python queda sin cubrir.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Omarbm52/Artemis-Embed-v1
- Modelo base: https://huggingface.co/answerdotai/ModernBERT-base
- Paper de ModernBERT: https://arxiv.org/abs/2412.13663
- Repositorio de Sentence Transformers: https://github.com/UKPLab/sentence-transformers
- Búsqueda web realizada: los resultados devueltos no guardan relación con el modelo (documentación contable y normativa financiera de Bolivia), por lo que no se incluye ningún enlace adicional.
