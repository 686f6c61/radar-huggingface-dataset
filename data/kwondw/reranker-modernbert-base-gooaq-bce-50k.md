# kwondw/reranker-ModernBERT-base-gooaq-bce-50k

## Resumen

El modelo `kwondw/reranker-ModernBERT-base-gooaq-bce-50k` es un cross-encoder de reranking desarrollado por el usuario kwondw y publicado en Hugging Face. Se trata de un ajuste fino (fine-tuning) del backbone `answerdotai/ModernBERT-base` mediante la librería sentence-transformers. Su función no es generar texto, sino puntuar pares (consulta, documento) y devolver una puntuación de relevancia, lo que lo convierte en una pieza de segunda etapa dentro de arquitecturas de recuperación de información: primero un retriever barato (BM25, búsqueda vectorial) recupera candidatos y después este modelo los reordena.

El modelo tiene 149.605.633 parámetros, una longitud máxima de secuencia de 8.192 tokens y una única etiqueta de salida (una puntuación por par). Está entrenado sobre el conjunto GooAQ con la función de pérdida BinaryCrossEntropyLoss y un volumen de datos declarado de 2.758.533 ejemplos. La licencia es Apache-2.0, lo que permite uso comercial sin restricciones adicionales, y el idioma declarado es únicamente el inglés.

Su relevancia actual reside en dos factores: por un lado, ModernBERT aporta atención con RoPE y soporte nativo de secuencias largas (8.192 tokens), algo poco habitual en rerankers de tamaño base, que suelen limitarse a 512 tokens; por otro, la ventana larga permite puntuar pasajes completos sin truncado agresivo. Como contrapartida, es un modelo recién publicado, sin descargas ni validación de la comunidad, y las métricas del model-index están marcadas como no verificadas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (ModernBERT) para clasificación de secuencias; envoltorio CrossEncoder con `ModernBertForSequenceClassification` |
| Parametros totales | 149.605.633 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 8.192 tokens (máxima longitud de secuencia declarada) |
| Tipos de cuantizacion | No disponible en la model card. Pesos publicados en safetensors (repo de 0,6 GB, coherente con fp32). Compatible con cuantización dinámica int8 vía PyTorch/Optimum, no documentada por el autor |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors |
| Libreria | sentence-transformers |
| Pipeline | text-ranking |
| Etiquetas de salida | 1 (una puntuación de relevancia por par) |
| Funcion de perdida | BinaryCrossEntropyLoss |
| Tamano del dataset de entrenamiento | 2.758.533 ejemplos |
| Modelo base | answerdotai/ModernBERT-base (revisión 8949b909ec900327062f0ebf497f51aef5e6f0c8) |
| Idioma de la model card | Inglés |

## Arquitectura y entrenamiento

La arquitectura es un cross-encoder: un encoder transformer que recibe la concatenación de consulta y documento y produce un único logit de relevancia, en lugar de codificar ambos textos por separado como haría un bi-encoder. El bloque subyacente es `ModernBertForSequenceClassification` sobre el backbone ModernBERT-base, una revisión moderna de la familia BERT que incorpora atención rotatoria (RoPE), alternancia de atención local y global, y un preprocesamiento pensado para eficiencia en GPU. La longitud máxima de secuencia es de 8.192 tokens, compartidos entre consulta y documento, lo que la sitúa muy por encima de los 512 tokens típicos de los rerankers base clásicos.

El ajuste fino se realizó con la librería sentence-transformers sobre el conjunto GooAQ, con BinaryCrossEntropyLoss y 2.758.533 ejemplos, según los metadatos del repositorio. No se documentan en la información disponible detalles sobre composición exacta del dataset, número de tokens vistos, épocas, hiperparámetros, ni si hubo fases adicionales de RLHF, DPO u optimización por preferencias (poco habituales en modelos de ranking). Tampoco se documentan innovaciones propias del autor más allá del uso del backbone ModernBERT: la aportación del modelo es el ajuste concreto sobre GooAQ, no un cambio arquitectónico. El sufijo `50k` del nombre sugiere un número de pasos de entrenamiento, pero este dato no está confirmado en la model card.

## Capacidades

- Puntuación de relevancia de pares (consulta, documento): devuelve una puntuación por par, apta para ordenar una lista de candidatos.
- Reranking de resultados de búsqueda: segunda etapa sobre salidas de BM25, búsqueda vectorial o motores híbridos.
- Búsqueda semántica asistida: el método `rank()` ordena un conjunto de textos frente a una consulta única.
- Manejo de contextos largos: hasta 8.192 tokens por par, lo que permite incluir documentos extensos en una sola pasada.
- No es un modelo generativo: no produce texto libre, ni resúmenes, ni respuestas.
- No soporta tool calling ni function calling: no genera tokens estructurados ni llamadas a herramientas.
- No soporta agentes ni razonamiento multi-paso: es un componente de ranking dentro de un pipeline, no un orquestador.
- Multilingüismo: no disponible. Solo inglés declarado.
- Capacidades especiales: no se declaran modos de pensamiento (thinking), visión ni audio.

## Casos de uso

- Reranking en pipelines RAG: se recuperan entre 50 y 200 fragmentos con un retriever vectorial o BM25 y este modelo los reordena antes de pasarlos al generador. Su ventana de 8.192 tokens permite puntuar fragmentos largos sin truncar, algo crítico en documentación técnica densa.
- Búsqueda interna en documentación de producto: indexación de manuales, guías y páginas de soporte, con reranking de los resultados para colocar la respuesta correcta en primera posición antes de mostrarla al usuario final.
- Atención al cliente sobre base de conocimiento: dado un ticket o pregunta del usuario en inglés, el modelo puntúa respuestas candidatas de la FAQ y selecciona la más relevante; el par pregunta-respuesta se procesa conjuntamente, lo que captura negaciones y matices que un bi-encoder pierde.
- Filtrado y deduplicación de conjuntos de datos de entrenamiento: puntuar pares pregunta-respuesta o pares (consulta, pasaje) para descartar ejemplos poco relevantes antes de usarlos en el entrenamiento de otros modelos. Es directamente aplicable a corpus en inglés.
- Segunda etapa en buscadores de código y documentación de APIs: la ventana larga permite incluir fragmentos de código o descripciones extensas junto a la consulta del desarrollador, mejorando la precisión frente a coincidencia léxica.
- Evaluación de calidad en sistemas de QA: generar múltiples respuestas candidatas y usar la puntuación del modelo como criterio de selección o de descarte en una fase de filtrado.
- Construcción de conjuntos de evaluación de recuperación: al ser una implementación estándar de sentence-transformers, se puede usar para reproducir métricas de ranking (MAP, MRR@10, NDCG@10) sobre corpus propios en inglés.
- Búsqueda en bases de conocimiento legales o normativas en inglés: el modelo puntúa pasajes extensos completos, evitando la pérdida de contexto que provoca el truncado a 512 tokens.

## Benchmarks y rendimiento

Resultados declarados por el autor en el model-index. Todos aparecen con `"verified": false`, es decir, no han sido verificados por Hugging Face.

| Dataset | MAP | MRR@10 | NDCG@10 |
|---|---|---|---|
| gooaq dev | 0,5969 | 0,5964 | 0,6408 |
| NanoMSMARCO R100 | 0,4076 | 0,3912 | 0,4703 |
| NanoNFCorpus R100 | 0,3461 | 0,4815 | 0,3600 |
| NanoNQ R100 | 0,4223 | 0,4446 | 0,4739 |
| NanoBEIR R100 (media) | 0,3920 | 0,4391 | 0,4347 |

Notas sobre la tabla: el resultado en `gooaq dev` refleja el dominio de entrenamiento y es muy superior al resto; en los conjuntos NanoBEIR el rendimiento cae hasta MAP 0,392 (media), con el peor resultado individual en NanoNFCorpus R100 (MAP 0,3461). No se han publicado en la información disponible comparaciones directas contra otros rerankers sobre estos mismos conjuntos, ni latencias o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: alrededor de 0,6 GB en fp32 y 0,3 GB en fp16/bf16 solo para los pesos (149,6 M de parámetros). Con activaciones y lote pequeño, el consumo real se mantiene por debajo de 1-2 GB en fp16.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM. Una RTX 3060, RTX 4060 o superior es suficiente; para volúmenes altos, A100, H100 o L40S permiten lotes grandes y mayor paralelismo.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU dedicada moderna e incluso en GPUs integradas con suficiente memoria compartida. También es viable en CPU para volúmenes moderados, ya que el modelo es pequeño.
- Opciones de despliegue: sentence-transformers (vía documentada por el autor), Hugging Face Text Embeddings Inference —el repositorio lleva la etiqueta `text-embeddings-inference` y `endpoints_compatible`—, Hugging Face Inference Endpoints, y exportación a ONNX con Optimum si se necesita inferencia optimizada (esta última no está documentada por el autor).
- Latencia y throughput: no publicados. Conviene recordar que, al ser un cross-encoder, el coste de inferencia escala linealmente con el número de candidatos: una consulta con 100 documentos requiere 100 pasadas por el modelo. A 8.192 tokens por par, el coste por pasada crece de forma cuadrática respecto a la longitud, por lo que el truncado a longitudes realistas (por ejemplo 512-2.048 tokens) es una práctica recomendable en producción.

## Comparativa con modelos similares

La información proporcionada no incluye métricas de otros rerankers sobre los mismos conjuntos, por lo que la comparación cuantitativa no está disponible.

| Modelo | Parametros | Contexto | Idiomas | Licencia | Datos de rendimiento |
|---|---|---|---|---|---|
| kwondw/reranker-ModernBERT-base-gooaq-bce-50k | 149,6 M | 8.192 tokens | Inglés | Apache-2.0 | MAP 0,392 en NanoBEIR R100 (media) |
| answerdotai/ModernBERT-base (backbone, no es reranker) | 149,6 M | 8.192 tokens | Inglés | Apache-2.0 | No aplica (no es un modelo de ranking) |
| BAAI/bge-reranker-base y BAAI/bge-reranker-v2-m3 | No disponible en la información proporcionada | No disponible | No disponible | No disponible | No disponible |

Los modelos de la familia BGE reranker y alternativas como `mixedbread-ai/mxbai-rerank-base-v1` son los competidores naturales de esta categoría, pero no se dispone de sus especificaciones ni de sus resultados en la información facilitada, por lo que no se incluyen cifras.

## Limitaciones y advertencias

- Sesgos: al entrenarse sobre GooAQ (preguntas y respuestas de Google), el modelo está fuertemente sesgado hacia el formato pregunta-respuesta corta. Su rendimiento cae notablemente fuera de ese dominio, como refleja el descenso de MAP de 0,5969 en gooaq dev a 0,3461 en NanoNFCorpus.
- Riesgo de alucinación: no aplica en el sentido generativo, porque el modelo no produce texto. El riesgo equivalente es asignar una puntuación alta a un documento irrelevante, lo que puede propagar errores al generador situado aguas abajo en un pipeline RAG.
- Limitación de idioma: solo inglés. No debe usarse para reranking en castellano ni en otros idiomas sin un ajuste previo.
- Limitación de contexto: aunque la ventana es de 8.192 tokens, esa longitud se reparte entre consulta y documento; documentos más largos deben truncarse o dividirse en fragmentos, con la consiguiente pérdida de contexto.
- Coste computacional: como cross-encoder, requiere una pasada por cada par, lo que limita el número de candidatos que se pueden reordenar en tiempo real.
- Licencia: Apache-2.0 permite uso comercial y modificación, siempre que se conserve el aviso de licencia y se indique si se han realizado cambios. No se identifican restricciones adicionales.
- Madurez: el repositorio tiene 0 descargas y 0 likes, con benchmarks marcados como no verificados. No hay validación independiente, ni evaluación de sesgos, ni informes de terceros.
- Erratas de la model card: el nombre del modelo en el model-index aparece escrito como «MordernBERT-base trained on GooAQ». Además, la sección de dataset de entrenamiento aparece comentada como «Unknown» en la plantilla original, aunque los metadatos del repositorio sí indican GooAQ con 2.758.533 ejemplos.
- Ausencia de datos operativos: no se publican latencias, throughput, ni requisitos de memoria medidos, lo que obliga a hacer pruebas propias antes de llevarlo a producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kwondw/reranker-ModernBERT-base-gooaq-bce-50k
- Modelo base: https://huggingface.co/answerdotai/ModernBERT-base
- Documentación de Sentence Transformers: https://sbert.net
- Documentación de Cross Encoder: https://www.sbert.net/docs/cross_encoder/usage/usage.html
- Repositorio de sentence-transformers en GitHub: https://github.com/huggingface/sentence-transformers
- Cross encoders en Hugging Face: https://huggingface.co/models?library=sentence-transformers&other=cross-encoder
- Paper de Sentence-BERT (arXiv:1908.10084): https://arxiv.org/abs/1908.10084

Nota sobre la búsqueda web: los resultados devueltos (hilos del foro soloarquitectura.com sobre autopromoción, precios contradictorios, RD 1627/1997, obras con varios contratistas y ensayos obligatorios) no guardan relación alguna con este modelo ni con inteligencia artificial, por lo que no se incluyen como enlaces relevantes.
