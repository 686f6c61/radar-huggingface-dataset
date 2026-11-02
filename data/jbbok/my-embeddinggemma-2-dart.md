# Jbbok/my-embeddinggemma-2-dart

## Resumen

`Jbbok/my-embeddinggemma-2-dart` es un modelo de embeddings de frases (sentence-similarity) obtenido mediante fine-tuning del modelo base `google/embeddinggemma-2`. Lo publica el usuario Jbbok en HuggingFace y está empaquetado con la librería `sentence-transformers`, por lo que se integra directamente en pipelines de recuperación densa, búsqueda semántica y re-ranking. Con 271.002.648 parámetros y un repositorio de 1,1 GB en formato safetensors, se posiciona como un encoder de tamaño medio, adecuado para despliegues de recuperación a escala moderada.

El problema que aborda es la recuperación de información sobre documentos financieros coreanos: la model card incluye ejemplos de similitud entre preguntas sobre cuentas anuales (SK Hynix, Naver, LG Chem, CJ CheilJedang) y fragmentos de informes de auditoría en coreano. Esto sugiere un ajuste orientado a dominios contables y regulatorios, donde los embeddings genéricos suelen fallar por la densidad de terminología y la estructura tabular del texto.

La relevancia actual es doble: por un lado, demuestra el patrón de adaptación de encoders de embeddings de código abierto a nichos verticales con datasets pequeños (3.687 pares de entrenamiento); por otro, al derivar de EmbeddingGemma, hereda una arquitectura compacta y moderna pensada para ejecución eficiente en CPU/GPU. No obstante, la información pública es escasa: no se declaran licencia, idiomas ni resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder denso (derivado de `google/embeddinggemma-2`, familia `embedding_gemma2`) |
| Parametros totales | 271.002.648 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan GGUF ni otras variantes) |
| Idiomas soportados | no disponible (los ejemplos de la model card están en coreano) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un encoder transformer denso de la familia EmbeddingGemma, orientado a producir representaciones vectoriales de frases y pasajes. Se ha entrenado con `sentence-transformers` usando las pérdidas `MultipleNegativesRankingLoss` y `CachedMultipleNegativesRankingLoss`, ambas variantes de contrastive learning in-batch negativos que optimizan la similitud coseno entre pares (ancla, positivo) y empujan los negativos del lote hacia el exterior. La aparición conjunta de ambas pérdidas en las etiquetas sugiere una configuración de entrenamiento por etapas o con caché de embeddings para aumentar el tamaño efectivo de negativos sin multiplicar el coste de memoria.

El dataset de entrenamiento declarado contiene 3.687 pares, un volumen reducido que apunta a un ajuste de dominio más que a un reentrenamiento generalista. Los ejemplos de la model card muestran tripletas de similitud centradas en informes de auditoría coreanos (제78기 de SK Hynix, 제27기 de Naver), con pasajes de estructura tabular, referencias a IFRS y terminología contable. No se documenta el número de tokens de entrenamiento, la composición exacta del corpus, ni si hubo fases de RLHF o DPO (poco habituales en modelos de embeddings). Tampoco se especifica si se aplicaron técnicas de Matryoshka Representation Learning o decodificación especulativa.

## Capacidades

- Generación de embeddings de frases y pasajes para similitud semántica y recuperación densa (pipeline `sentence-similarity` y `feature-extraction`).
- Búsqueda semántica sobre documentos largos con estructura tabular y terminología financiera en coreano.
- Recuperación de respuestas a preguntas factuales extrayendo el pasaje relevante de informes corporativos.
- Clasificación y agrupamiento de fragmentos documentales por similitud de embeddings.
- Compatible con `sentence-transformers` y con endpoints de HuggingFace (`endpoints_compatible`).
- Soporte de tool calling / function calling: no disponible (no es un modelo generativo).
- Soporte de agentes multi-paso: no disponible de forma nativa; puede usarse como recuperador dentro de un pipeline RAG.
- Capacidades multilingües: no documentadas; los ejemplos públicos son exclusivamente en coreano.
- Capacidades especiales (thinking mode, visión, audio): no disponibles.

## Casos de uso

- Recuperación aumentada (RAG) sobre informes financieros coreanos: indexar los PDF de cuentas anuales troceados por secciones y usar el modelo para recuperar el pasaje que responde a preguntas como el importe de ventas de un segmento, tal como ilustran los ejemplos de la model card.
- Asistentes de análisis contable: dado un corpus de memorias y estados financieros, el encoder permite localizar la nota concreta (por ejemplo, política de deterioro o provisiones) reduciendo el ruido de tablas y referencias cruzadas a IFRS.
- Búsqueda semántica en portales de transparencia corporativa: desplegar el modelo como servicio de embeddings para que analistas consulten en lenguaje natural múltiples empresas y ejercicios fiscales sin depender de coincidencia exacta de términos.
- Deduplicación y clustering de fragmentos regulatorios: agrupar notas al pie y disclosures similares entre distintas compañías para detectar patrones o anomalías en la presentación de resultados.
- Motor de recomendación documental: sugerir informes o secciones relacionadas a partir de la similitud entre embeddings de consultas previas y nuevos documentos ingestados.
- Filtrado previo en pipelines de extracción: usar el modelo como primera etapa de recuperación (retriever) y delegar la respuesta final a un LLM generativo, reduciendo el contexto enviado al modelo grande.
- Evaluación de similitud entre borradores y textos de referencia: comparar redacciones de notas financieras con plantillas aprobadas para control de calidad editorial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 1,1 GB solo de pesos (271 M de parámetros × 4 bytes), más overhead de activaciones y tokenizador; en la práctica, entre 1,5 y 2,5 GB según longitud de secuencia y batch.
- VRAM estimada en FP16/BF16: alrededor de 0,55 GB de pesos; el modelo cabe holgadamente en cualquier GPU consumer moderna.
- VRAM estimada en cuantización de 8 bits: en torno a 0,3 GB de pesos, aunque no se publican artefactos cuantizados oficiales.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para lotes pequeños; RTX 3060/4060, RTX 4090, A10, L4, A100 o H100 para throughput alto en indexación masiva.
- Cabe en GPU consumer: sí, en todas las GPU consumer con 4 GB o más; también es viable en CPU para cargas moderadas.
- Opciones de despliegue: `sentence-transformers` (nativo), HuggingFace Inference Endpoints, Text Embeddings Inference (TEI) para servir embeddings a escala, y `optimum`/ONNX para optimización. No se documentan artefactos GGUF ni soporte explícito de llama.cpp u Ollama.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| `Jbbok/my-embeddinggemma-2-dart` | 271 M | no disponible | no disponible | Fine-tuning de dominio sobre informes financieros coreanos; 3.687 pares de entrenamiento |
| `google/embeddinggemma-2` (modelo base) | no disponible en la información | no disponible | no disponible | Encoder generalista del que deriva; sin ajuste específico al dominio contable coreano |
| `BM25` / recuperación léxica | no aplica | no aplica | según implementación | Baseline léxico; suele rendir peor en paráfrasis y terminología variable, pero es más barato y determinista |

No se dispone de datos de benchmarks que permitan comparar el rendimiento empírico frente a alternativas como `multilingual-e5`, `bge-m3` o `KoE5`, por lo que la comparación cuantitativa queda como no disponible.

## Limitaciones y advertencias

- La licencia no está declarada en la model card ni en los metadatos de HuggingFace; no se puede asumir uso comercial sin consultar al autor o al modelo base.
- El dataset de entrenamiento es pequeño (3.687 pares), lo que aumenta el riesgo de sobreajuste al dominio y de degradación en consultas fuera del corpus contable coreano.
- No se documentan los idiomas soportados; los ejemplos son exclusivamente en coreano y se desconoce el comportamiento en castellano u otras lenguas.
- No se publican evaluaciones de sesgo, robustez ni tasas de alucinación en recuperación (por ejemplo, métricas de recall@k o nDCG).
- Al ser un modelo de embeddings, no genera texto: cualquier alucinación en un sistema RAG provendrá del generador downstream, no del encoder, pero una recuperación deficiente puede inducir respuestas incorrectas.
- La longitud máxima de contexto no está especificada, lo que impide planificar el troceado de documentos largos con garantías.
- No se ofrecen variantes cuantizadas ni artefactos GGUF, lo que limita el despliegue en entornos sin GPU o con herramientas tipo llama.cpp.
- El repositorio tiene cero descargas y cero likes en el momento de la consulta, y la fecha de creación es muy reciente; no hay evidencia de uso en producción ni validación comunitaria.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jbbok/my-embeddinggemma-2-dart
- Modelo base: https://huggingface.co/google/embeddinggemma-2
- Paper de referencia sobre MultipleNegativesRankingLoss (arXiv:1908.10084): https://arxiv.org/abs/1908.10084
- Paper de referencia sobre CachedMultipleNegativesRankingLoss / caché de embeddings (arXiv:2101.06983): https://arxiv.org/abs/2101.06983
- Paper de referencia sobre representaciones contrastivas (arXiv:1807.03748): https://arxiv.org/abs/1807.03748
- Documentación de Sentence Transformers: https://www.sbert.net/
