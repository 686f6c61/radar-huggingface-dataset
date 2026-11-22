# nebhailema/afrixir-afro-xlmr-mini-reranker

## Resumen

AfriXIR Afro-XLM-R Mini Reranker es un modelo de reordenación (reranker) de tipo cross-encoder entrenado para recuperación de información en ocho lenguas africanas: amárico, hausa, oromo, shona, somalí, suajili, yoruba y zulú. Lo desarrolla el usuario nebhailema y parte del modelo base Davlan/afro-xlmr-mini, un XLM-RoBERTa de tamaño reducido preentrenado específicamente con corpus africanos. El modelo recibe pares de textos (consulta y pasaje) y devuelve una puntuación de relevancia, lo que permite reordenar los resultados de un recuperador inicial y mejorar la precisión del ranking.

Su relevancia radica en que la mayoría de los rerankers multilingües disponibles están dominados por el inglés y un puñado de lenguas europeas, mientras que las lenguas africanas suelen quedar fuera de los conjuntos de entrenamiento. Este modelo se afina sobre AfriXIR, un dataset de 902.912 ejemplos, y ofrece una licencia Apache 2.0 que permite uso comercial sin restricciones adicionales.

Con 117.641.089 parámetros y una ventana máxima de 510 tokens, es un modelo compacto pensado para integrarse como segunda etapa en pipelines de búsqueda y RAG. Su tamaño reducido permite desplegarlo en hardware modesto, aunque su adopción pública es todavía muy limitada (2 descargas y 0 likes en el momento de redactar esta ficha).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cross-encoder basado en XLM-RoBERTa (XLMRobertaForSequenceClassification), 1 etiqueta de salida |
| Parametros totales | 117.641.089 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | 510 tokens |
| Tipos de cuantizacion | no disponible (pesos en safetensors; compatible con cuantización estándar de transformers, sin variantes publicadas) |
| Idiomas soportados | am, ha, om, sn, so, sw, yo, zu |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura de un cross-encoder: un transformer XLM-RoBERTa en configuración mini que procesa conjuntamente la consulta y el pasaje como una única secuencia y produce una puntuación escalar de relevancia mediante una cabeza de clasificación de secuencia con una sola etiqueta. A diferencia de los bi-encoders, que codifican consulta y documento por separado, el cross-encoder permite interacciones completas de atención entre ambos textos, lo que suele traducirse en una mayor precisión en el ranking a costa de un coste de inferencia proporcional al número de pares a evaluar.

El ajuste fino se realizó sobre el dataset AfriXIR (902.912 ejemplos) con la librería sentence-transformers y una función de pérdida BinaryCrossEntropyLoss, típica en tareas de ranking binario relevante/no relevante. El modelo base, Davlan/afro-xlmr-mini, aporta un preentrenamiento centrado en lenguas africanas, lo que reduce el sesgo hacia el inglés respecto a un XLM-R estándar. No se especifican en la información disponible el número exacto de tokens de entrenamiento, la composición detallada del dataset ni si se aplicaron etapas de RLHF o DPO.

## Capacidades

- Puntuación de relevancia para pares consulta-pasaje en ocho lenguas africanas.
- Reordenación de resultados de un recuperador previo (reranking) en pipelines de búsqueda.
- Recuperación de información multilingüe dentro del conjunto de idiomas soportados.
- Integración con la librería sentence-transformers mediante la clase CrossEncoder.
- Compatibilidad con Text Embeddings Inference (TEI) y endpoints compatibles, según los tags del repositorio.
- Puntuación de una sola etiqueta, adecuada para clasificación binaria de relevancia.
- No dispone de generación de texto, tool calling, capacidades de agente, visión ni audio: es exclusivamente un modelo de ranking.

## Casos de uso

- Búsqueda documental en suajili o hausa: se recuperan candidatos con un índice vectorial o BM25 y el cross-encoder reordena los 50-100 primeros pasajes para colocar los más relevantes en cabeza, aprovechando la interacción completa entre consulta y documento.
- RAG sobre corpus africanos: en un sistema de generación aumentada, el reranker filtra los fragmentos recuperados antes de pasarlos al modelo generador, reduciendo el ruido y las alucinaciones en lenguas como amárico u oromo.
- Atención al cliente multilingüe: para bases de conocimiento en yoruba, zulú o somalí, el modelo permite localizar el artículo correcto entre miles de entradas con una ventana de 510 tokens suficiente para pasajes cortos.
- Búsqueda legal o administrativa en amárico: reordenación de fragmentos de normativa y prensa, como los ejemplos de la model card, para responder consultas concretas sobre documentos extensos divididos en pasajes.
- Moderación y deduplicación de contenido: puntuación de similitud semántica entre pares de textos para detectar duplicados o contenido relacionado en corpus multilingües africanos.
- Evaluación de sistemas de recuperación: uso como juez de relevancia en la evaluación de pipelines de búsqueda para lenguas de bajos recursos, donde faltan anotadores humanos.
- Filtrado previo en motores de recomendación de noticias: reordenación de artículos candidatos según su afinidad con el perfil o la consulta del usuario en suajili o hausa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,5 GB solo para pesos, más memoria de activaciones; en la práctica cabe en cualquier GPU con 2 GB o más.
- En fp16 o bf16 el modelo ocupa alrededor de 0,25 GB, por lo que es viable incluso en GPUs integradas o en CPU para volúmenes moderados.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4090) es sobradamente suficiente; para alto throughput, A100 o H100 permiten procesar lotes grandes de pares.
- Cabe en GPU consumer: sí, en cualquier tarjeta con al menos 2 GB de VRAM, e incluso en CPU con latencias aceptables para lotes pequeños.
- Opciones de despliegue: sentence-transformers (CrossEncoder), Text Embeddings Inference (TEI), integración en pipelines de búsqueda con Elasticsearch/OpenSearch mediante servicios externos, y exportación a ONNX para inferencia optimizada.
- Latencia y throughput: no disponibles en la información proporcionada; dependerá del lote, la longitud de los pasajes y el hardware.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| nebhailema/afrixir-afro-xlmr-mini-reranker | 117,6 M | 510 tokens | 8 lenguas africanas | Apache 2.0 | Cross-encoder especializado en África |
| BAAI/bge-reranker-base | no disponible en la información | no disponible | Multilingüe (énfasis en inglés y chino) | MIT | Reranker popular, sin foco específico en lenguas africanas |
| cross-encoder/ms-marco-MiniLM-L-6-v2 | no disponible en la información | 512 tokens | Principalmente inglés | Apache 2.0 | Referencia clásica en inglés, no cubre lenguas africanas |
| Davlan/afro-xlmr-mini (base) | no disponible en la información | no disponible | Lenguas africanas | no disponible | Modelo base sin ajuste para ranking |

La comparación con alternativas es limitada porque no se han publicado métricas de rendimiento para este modelo ni datos verificables de los comparadores en la información disponible. La ventaja diferencial es la cobertura de lenguas africanas y la licencia permisiva; la desventaja es la ausencia de benchmarks públicos que permitan cuantificar la mejora frente a alternativas.

## Limitaciones y advertencias

- Ventana de contexto de solo 510 tokens: los pasajes más largos deben dividirse, lo que puede perder contexto entre fragmentos.
- Cobertura lingüística restringida a ocho lenguas; no soporta otras lenguas africanas ni europeas de forma fiable.
- Riesgo de alucinación no aplica directamente al ser un modelo de ranking, pero sí puede producir puntuaciones mal calibradas en dominios alejados del dataset de entrenamiento.
- Sesgos potenciales derivados del corpus AfriXIR y del preentrenamiento de afro-xlmr-mini; no se documentan análisis de sesgo en la información disponible.
- Sin benchmarks publicados: no es posible verificar empíricamente su calidad frente a alternativas.
- Adopción muy baja (2 descargas, 0 likes) y creado en 2026: no hay evidencia de uso en producción ni validación comunitaria.
- La licencia Apache 2.0 permite uso comercial, pero el usuario debe verificar las condiciones del dataset AfriXIR y del modelo base.
- El coste de inferencia crece linealmente con el número de pares a puntuar, por lo que conviene usarlo solo sobre un subconjunto de candidatos previamente filtrados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nebhailema/afrixir-afro-xlmr-mini-reranker
- Dataset AfriXIR: https://huggingface.co/datasets/nebhailema/AfriXIR
- Modelo base Davlan/afro-xlmr-mini: https://huggingface.co/Davlan/afro-xlmr-mini
- Documentación de Sentence Transformers: https://sbert.net
- Documentación de Cross Encoder: https://www.sbert.net/docs/cross_encoder/usage/usage.html
- Repositorio de Sentence Transformers en GitHub: https://github.com/huggingface/sentence-transformers
- Cross Encoders en Hugging Face: https://huggingface.co/models?library=sentence-transformers&other=cross-encoder
- Paper de XLM-R (arXiv:1908.10084): https://arxiv.org/abs/1908.10084
