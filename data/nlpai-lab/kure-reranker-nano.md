# nlpai-lab/KURE-Reranker-nano

## Resumen

KURE-Reranker-nano es un reranker cross-encoder bilingüe coreano-inglés de aproximadamente 149 millones de parámetros, desarrollado por el laboratorio nlpai-lab. Su función es recibir un par consulta-documento y emitir una puntuación escalar de relevancia, lo que lo sitúa en la segunda fase de un pipeline de recuperación de información (retrieval): tras un primer filtrado con un modelo de embeddings, el reranker reordena los candidatos según su pertinencia real a la consulta.

El modelo se construye sobre el backbone `skt/A.X-Encoder-base`, un encoder de la familia ModernBERT orientado a coreano e inglés, y se distribuye con licencia Apache-2.0. Su propuesta de valor es clara: rendimiento de reordenación en coreano cercano a modelos mucho mayores con un coste computacional muy inferior. Según la model card, alcanza 87,57 de nDCG@10 de media en nueve benchmarks coreanos, solo 1,5 puntos por debajo de KURE-Reranker-base (1,7B), y 79,66 en MultiLongDocRetrieval.

Es relevante ahora porque la mayoría de rerankers de alto rendimiento (Qwen3-Reranker, por ejemplo) tienen entre 4B y 8B de parámetros, lo que encarece el despliegue en producción. Un modelo de 149M con 8.192 tokens de contexto y alto throughput permite reordenar en CPU o en GPUs de consumo, manteniendo calidad competitiva en coreano.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cross-encoder basado en ModernBERT (backbone `skt/A.X-Encoder-base`) |
| Parametros totales | 149.323.009 (aprox. 149M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 8.192 tokens de entrada de inferencia (consulta + documento + tokens especiales) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Coreano (ko) e inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |
| Salida | Una puntuación escalar de relevancia por par consulta-documento |
| Tamano del repositorio | 0,6 GB |
| Libreria | sentence-transformers |
| Pipeline | text-ranking |

## Arquitectura y entrenamiento

El modelo es un cross-encoder: codifica conjuntamente la consulta y el documento en una única secuencia y produce un logit de relevancia mediante una cabeza de clasificación de secuencias (`AutoModelForSequenceClassification`). A diferencia de los bi-encoders, que generan embeddings independientes, el cross-encoder permite atención cruzada completa entre consulta y documento, lo que mejora la precisión del ranking a costa de no poder precalcular representaciones. El backbone es `skt/A.X-Encoder-base`, un encoder de la familia ModernBERT, que emplea atención con rotación posicional (RoPE) y soporte nativo de contexto largo.

La información disponible no detalla la composición del dataset de entrenamiento, el número de tokens utilizados, ni si se aplicaron técnicas de RLHF, DPO u otras fases de ajuste. Tampoco se especifican innovaciones técnicas adicionales más allá de las inherentes al backbone ModernBERT y al esquema cross-encoder. Los datos de evaluación publicados se centran en rendimiento de reordenación en coreano, no en detalles de entrenamiento.

## Capacidades

- Reordenación de documentos: asigna una puntuación de relevancia a cada par consulta-documento y permite ordenar candidatos recuperados por un sistema de búsqueda previo.
- Bilingüe coreano-inglés: maneja consultas y documentos en ambos idiomas, incluyendo pares cruzados (consulta en coreano, documento en inglés y viceversa).
- Documentos largos: soporta hasta 8.192 tokens de entrada, lo que permite reordenar pasajes extensos o documentos completos sin truncamiento agresivo.
- Puntuación por lotes: la API de sentence-transformers permite `predict` y `rank` con `batch_size` configurable para procesar grandes volúmenes de pares.
- Integración con pipelines de recuperación: compatible con `text-embeddings-inference` y con endpoints de Hugging Face, lo que facilita su despliegue como servicio de reordenación.
- API alojada: disponible como servicio en `kure.kullm.ai` con autenticación mediante GitHub y salida normalizada (sigmoide del logit, rango 0-1).
- No dispone de generación de texto, tool calling, capacidades de agente, visión ni audio: es exclusivamente un modelo de ranking.

## Casos de uso

- Búsqueda empresarial en coreano: tras una primera fase de recuperación con un modelo de embeddings, KURE-Reranker-nano reordena los 50-100 candidatos según relevancia. Su nDCG@10 medio de 87,57 en nueve benchmarks coreanos lo hace adecuado para motores de búsqueda internos en organizaciones que operan en coreano.
- Atención al cliente con base de conocimiento: en un sistema RAG, el modelo selecciona los fragmentos de documentación más pertinentes a la consulta del usuario antes de pasarlos al LLM generador. Su contexto de 8.192 tokens permite manejar artículos de ayuda largos sin truncar.
- Reordenación de documentación técnica bilingüe: equipos que mantienen documentación en coreano e inglés pueden usar un único modelo para reordenar resultados en ambos idiomas, evitando desplegar dos rerankers separados.
- Búsqueda en corpus de documentos largos: con 79,66 de nDCG@10 en MultiLongDocRetrieval, es adecuado para escenarios donde los documentos candidatos son extensos (informes, contratos, artículos) y requieren evaluación de relevancia sobre pasajes largos.
- Despliegue en infraestructura limitada: con 149M de parámetros, puede ejecutarse en CPU o en GPUs de consumo, lo que permite incorporar reordenación de calidad en entornos sin GPUs de datacenter. Su throughput de 482,4 pares por segundo en una RTX A6000 facilita el procesamiento por lotes.
- Filtrado de resultados en buscadores verticales: portales de noticias, catálogos o foros en coreano pueden reordenar los resultados de búsqueda por relevancia antes de presentarlos al usuario, mejorando la satisfacción sin incrementar significativamente la latencia.
- Evaluación y benchmarking de sistemas de recuperación: al ser ligero y de código abierto, sirve como componente de referencia para comparar pipelines de retrieval en coreano.

## Benchmarks y rendimiento

Los datos publicados en la model card corresponden a nDCG@10 y throughput (pares por segundo, PPS) sobre nueve subconjuntos de MTEB-ko-retrieval, incluyendo MLDR. La evaluación se realizó con la implementación de referencia `reranker-simple-benchmark`.

| Modelo | Parametros | Mean NDCG@10 | Mean PPS |
|---|---|---|---|
| Qwen/Qwen3-Reranker-8B | 8,2B | 0,8990 | 15,0 |
| Qwen/Qwen3-Reranker-4B | 4,0B | no disponible en el extracto | no disponible en el extracto |
| KURE-Reranker-nano | 149M | 87,57 (0,8757) | 482,4 |

Datos adicionales reportados en la model card:

| Benchmark | Metrica | Resultado |
|---|---|---|
| MTEB-ko-retrieval (media de 9 subconjuntos) | nDCG@10 | 87,57 |
| MultiLongDocRetrieval (MLDR) | nDCG@10 | 79,66 |
| Throughput medio (RTX A6000 48GB) | PPS | 482,4 |

El throughput se midió usando el límite de entrada propio de cada modelo y su mejor tamaño de lote medido, por lo que no refleja velocidad a igualdad de longitud de tokens ni latencia extremo a extremo. La comparación con Qwen3-Reranker-4B indica que KURE-Reranker-nano es aproximadamente 19,8 veces más rápido en las condiciones descritas.

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos en fp32 (aproximadamente 600 MB) y activaciones para lotes moderados, el modelo cabe holgadamente en GPUs con 4-8 GB de VRAM. En fp16 el peso ronda los 300 MB. No se han publicado cifras oficiales de VRAM para cuantizaciones de 8 o 4 bits.
- GPU recomendadas: el modelo se evaluó en una NVIDIA RTX A6000 48GB. Para producción con alto throughput, una A100 o H100 permite procesar lotes grandes; para despliegues modestos, una RTX 4090, RTX 3090 o incluso una RTX 4060 Ti de 16 GB son suficientes.
- Cabe en GPU de consumo: sí, en cualquier GPU con al menos 4 GB de VRAM en fp16, y potencialmente en CPU para volúmenes moderados.
- Opciones de despliegue: sentence-transformers (CrossEncoder), Transformers con `AutoModelForSequenceClassification`, text-embeddings-inference (tag `text-embeddings-inference`), endpoints de Hugging Face y la API alojada en `kure.kullm.ai`. No se menciona soporte explícito de llama.cpp, Ollama o vLLM en la información disponible.
- Latencia y throughput: 482,4 pares por segundo de media en una RTX A6000 48GB, según la model card. No se han publicado cifras de latencia por par ni de throughput en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Mean NDCG@10 (MTEB-ko-retrieval) | Mean PPS | Licencia | Idiomas |
|---|---|---|---|---|---|---|
| KURE-Reranker-nano | 149M | 8.192 tokens | 87,57 | 482,4 | Apache-2.0 | ko, en |
| KURE-Reranker-base | 1,7B | no disponible | aprox. 89,07 (1,5 puntos por encima) | no disponible | no disponible | ko, en |
| Qwen/Qwen3-Reranker-8B | 8,2B | no disponible | 0,8990 | 15,0 | no disponible | multilingüe |
| Qwen/Qwen3-Reranker-4B | 4,0B | no disponible | no disponible en el extracto | no disponible en el extracto | no disponible | multilingüe |

KURE-Reranker-nano se posiciona como la opción de menor tamaño entre los modelos evaluados con rendimiento competitivo en coreano, con una ventaja de throughput de más de 30 veces frente a Qwen3-Reranker-8B en las condiciones medidas. Frente a KURE-Reranker-base, sacrifica 1,5 puntos de nDCG@10 medio a cambio de una reducción de parámetros de más de diez veces.

## Limitaciones y advertencias

- Idiomas limitados: solo coreano e inglés. No se ha evaluado su rendimiento en otros idiomas y no debe asumirse capacidad multilingüe general.
- Sesgos: no se ha publicado información sobre sesgos demográficos, culturales o lingüísticos en la model card. Como modelo entrenado sobre datos web, es probable que herede sesgos presentes en el corpus, pero no hay documentación al respecto.
- Riesgo de alucinación: al ser un modelo de ranking y no de generación, no produce texto libre; el riesgo se limita a puntuaciones de relevancia mal calibradas en dominios alejados de los datos de entrenamiento.
- Limitación de contexto: la entrada máxima es de 8.192 tokens incluyendo consulta, documento y tokens especiales. Documentos más largos requieren truncamiento o fragmentación, lo que puede perder información relevante.
- Licencia Apache-2.0: permite uso comercial, modificación y redistribución con atribución, sin restricciones adicionales conocidas.
- Caveat de producción: el throughput reportado se midió con el límite de entrada propio de cada modelo y su mejor lote, no a igualdad de longitud de tokens; la latencia real en producción dependerá de la longitud de los documentos y del hardware.
- No se han publicado detalles sobre el dataset de entrenamiento ni sobre procesos de alineación, lo que dificulta evaluar su robustez en dominios especializados (legal, médico, técnico).
- La información sobre cuantizaciones disponibles no está documentada; el repositorio solo contiene pesos en safetensors.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nlpai-lab/KURE-Reranker-nano
- Repositorio GitHub de KURE: https://github.com/nlpai-lab/KURE
- API alojada: https://kure.kullm.ai/
- Backbone: https://huggingface.co/skt/A.X-Encoder-base
- Benchmark de referencia: https://github.com/instructkr/reranker-simple-benchmark
