# quyenpro/re-ranker-vibio

## Resumen

`quyenpro/re-ranker-vibio` es un modelo cross-encoder para reranking de textos, obtenido mediante fine-tuning de `BAAI/bge-reranker-v2-m3` con la librería `sentence-transformers`. Un cross-encoder recibe un par (consulta, documento) y devuelve una puntuación de relevancia, lo que lo hace adecuado para la segunda etapa de pipelines de búsqueda semántica y RAG, donde se reordena un conjunto reducido de candidatos recuperados previamente por un retriever bi-encoder. El modelo está pensado, por los ejemplos de la model card, para contenido en vietnamita, aunque la arquitectura base es multilingüe.

La arquitectura subyacente es un transformer XLM-RoBERTa con cabeza de clasificación de secuencias (`XLMRobertaForSequenceClassification`) y una única etiqueta de salida. El checkpoint contiene 567.755.777 parámetros en formato safetensors y el repositorio ocupa 2,3 GB. La longitud máxima de secuencia es de 2048 tokens, lo que permite puntuar pares consulta-documento con documentos relativamente largos sin truncar en exceso.

El modelo es relevante como ejemplo de reranker afinado sobre un dataset pequeño (15.870 ejemplos) con pérdida `BinaryCrossEntropyLoss`, especializado en un dominio concreto (contenido médico en vietnamita según los ejemplos). No obstante, su adopción general está limitada por la ausencia de datos publicados de evaluación, de licencia declarada y de idiomas soportados, así como por su nulo historial de descargas y likes en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer XLM-RoBERTa con cabeza de clasificación de secuencias (`XLMRobertaForSequenceClassification`), cross-encoder |
| Parametros totales | 567.755.777 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 2048 tokens (longitud máxima de secuencia) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (los ejemplos de la model card están en vietnamita; el modelo base es multilingüe) |
| Licencia | No disponible |
| Formato de pesos | safetensors |
| Etiquetas de salida | 1 (score de relevancia) |
| Función de pérdida | BinaryCrossEntropyLoss |
| Tamaño del dataset de entrenamiento | 15.870 ejemplos |
| Tamaño del repositorio | 2,3 GB |
| Librería | sentence-transformers |
| Pipeline | text-ranking |
| Compatibilidad | text-embeddings-inference, endpoints_compatible |

## Arquitectura y entrenamiento

El modelo es un cross-encoder construido sobre `BAAI/bge-reranker-v2-m3` (revisión `953dc6f6f85a1b2dbfca4c34a2796e7dde08d41e`), que a su vez se basa en la familia XLM-RoBERTa. La arquitectura completa, tal como se declara en la model card, es un `CrossEncoder` con un único componente transformer configurado para `sequence-classification`, salida `logits` y módulo de salida `scores`. El modelo procesa conjuntamente el par (query, passage) y produce un escalar de relevancia, en lugar de generar embeddings independientes como haría un bi-encoder.

El fine-tuning se realizó con la librería `sentence-transformers` sobre un conjunto de 15.870 ejemplos, empleando `BinaryCrossEntropyLoss` como función de pérdida. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si hubo etapas de RLHF o DPO (en un reranker de este tipo no serían habituales). Tampoco se detallan innovaciones técnicas adicionales como decodificación especulativa o atención lineal; se trata de un fine-tuning estándar de cross-encoder sobre un modelo base ya optimizado para reranking multilingüe.

## Capacidades

- Puntuación de relevancia para pares (consulta, documento) mediante cross-encoder, orientada a reranking en pipelines de búsqueda y RAG.
- Reranking de resultados recuperados por un bi-encoder en la primera etapa de recuperación.
- Búsqueda semántica de dos etapas: recuperación aproximada seguida de reordenación precisa.
- Manejo de documentos de hasta 2048 tokens por par, lo que permite puntuar pasajes largos sin truncamiento agresivo.
- Compatibilidad con `sentence-transformers` mediante la clase `CrossEncoder`.
- Compatibilidad declarada con Text Embeddings Inference (TEI) y con endpoints compatibles, lo que facilita su despliegue como servicio.
- Capacidad multilingüe heredada del modelo base XLM-RoBERTa, aunque no se declaran idiomas oficialmente soportados.
- No se declaran capacidades de generación de texto, tool calling, agentes, visión, audio ni modo de razonamiento extendido; es un modelo exclusivamente de scoring.

## Casos de uso

- Reranking en pipelines RAG: tras recuperar los N candidatos más relevantes con un retriever bi-encoder, el cross-encoder puntúa cada par (pregunta, fragmento) y reordena para enviar al LLM solo los fragmentos con mayor score, mejorando la precisión del contexto inyectado.
- Búsqueda semántica en documentación técnica o bases de conocimiento: el modelo puede reordenar resultados de búsqueda sobre artículos, manuales o FAQs, con la ventaja de puntuar conjuntamente consulta y documento en lugar de comparar embeddings independientes.
- Atención al cliente automatizada sobre base de conocimiento: dado un corpus de artículos de soporte, el reranker selecciona los fragmentos más pertinentes a la consulta del usuario antes de que un LLM genere la respuesta, reduciendo alucinaciones por contexto irrelevante.
- Búsqueda en dominios especializados (por ejemplo, contenido médico en vietnamita, según los ejemplos de la model card): el fine-tuning sobre 15.870 pares del dominio permite adaptar el scoring a vocabulario y formulaciones específicas.
- Filtrado y deduplicación de resultados de búsqueda: puntuar pares para descartar documentos por debajo de un umbral de relevancia antes de etapas costosas posteriores.
- Evaluación de sistemas de recuperación: usar los scores del cross-encoder como referencia para medir la calidad de un retriever o comparar configuraciones de chunking.
- Clasificación ligera de pares texto-texto: al tener una única etiqueta de salida con pérdida binaria, puede reutilizarse para tareas de matching o entailment binario entre dos textos, con el fine-tuning adecuado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 1,2 GB solo para pesos (567,7 M de parámetros), más overhead de activaciones y del par de secuencias de hasta 2048 tokens; en la práctica, entre 2 y 4 GB según longitud de entrada y batch.
- En FP32: aproximadamente 2,3 GB solo para pesos, más activaciones; alrededor de 3 a 5 GB en total.
- GPU recomendadas para producción con throughput alto: A100, H100, L40S o A10G, especialmente con TEI o vLLM-like serving y batches grandes.
- GPU de consumo: cabe en RTX 4090, RTX 4080, RTX 3090 y RTX 4070 Ti; también en GPUs con 8 GB o más si se limita el batch y la longitud de secuencia.
- Despliegue: `sentence-transformers` (CrossEncoder), Text Embeddings Inference (TEI) por la compatibilidad declarada, y endpoints compatibles. No se declara soporte de llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: no disponibles; dependerán del hardware, del batch y de la longitud de los pares. Como referencia cualitativa, un cross-encoder de ~570 M de parámetros es más costoso por par que un bi-encoder, por lo que se usa sobre un conjunto reducido de candidatos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| quyenpro/re-ranker-vibio | 567,7 M | 2048 tokens | Cross-encoder (XLM-RoBERTa) | No disponible | Hugging Face, 0 descargas |
| BAAI/bge-reranker-v2-m3 (modelo base) | ~568 M | 8192 tokens (según model card del base) | Cross-encoder multilingüe | Apache 2.0 (según model card del base) | Hugging Face, ampliamente adoptado |
| BAAI/bge-reranker-base | ~278 M | 512 tokens | Cross-encoder | MIT (según model card del base) | Hugging Face, ampliamente adoptado |
| BAAI/bge-reranker-large | ~560 M | 512 tokens | Cross-encoder | MIT (según model card del base) | Hugging Face, ampliamente adoptado |

Nota: los datos de los modelos comparativos corresponden a sus model cards públicas; no se dispone de benchmarks del modelo `quyenpro/re-ranker-vibio` para comparar rendimiento. La ventaja principal del modelo frente a alternativas genéricas sería la especialización en el dominio de su dataset de fine-tuning; la desventaja, la falta de licencia declarada y de evaluación publicada.

## Limitaciones y advertencias

- Licencia no declarada: no se puede asumir uso comercial permitido; es imprescindible contactar con el autor o verificar la licencia antes de usarlo en producción.
- Idiomas no declarados: aunque el modelo base es multilingüe, el fine-tuning se ha realizado presumiblemente sobre contenido en vietnamita (según los ejemplos), lo que puede degradar el rendimiento en otros idiomas respecto al modelo base.
- Sin benchmarks publicados: no hay evidencia cuantitativa de mejora frente al modelo base ni frente a alternativas; el fine-tuning con 15.870 ejemplos y BinaryCrossEntropyLoss puede no superar al base en dominios distintos.
- Riesgo de sobreajuste al dominio: un dataset de ~15,9 k pares es pequeño para un modelo de 568 M de parámetros; el scoring puede no generalizar fuera de la distribución de entrenamiento.
- Sesgos heredados: al derivar de XLM-RoBERTa y de bge-reranker-v2-m3, puede heredar sesgos presentes en los datos de preentrenamiento de esos modelos; no se documenta ningún análisis de sesgo.
- Longitud de contexto limitada a 2048 tokens: documentos más largos deben truncarse o dividirse en fragmentos, lo que puede perder contexto relevante.
- Sin historial de uso: 0 descargas y 0 likes en el momento de la ficha; no hay evidencia de la comunidad sobre su robustez en producción.
- Modelo de scoring, no generativo: no debe esperarse generación de texto, tool calling ni razonamiento multi-paso; su salida es un único score por par.
- Caveat de producción: al ser un cross-encoder, el coste computacional crece linealmente con el número de candidatos a reordenar; conviene limitar el top-k de la primera etapa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/quyenpro/re-ranker-vibio
- Modelo base: https://huggingface.co/BAAI/bge-reranker-v2-m3
- Documentación de Sentence Transformers: https://sbert.net
- Documentación de Cross Encoder: https://www.sbert.net/docs/cross_encoder/usage/usage.html
- Repositorio de Sentence Transformers en GitHub: https://github.com/huggingface/sentence-transformers
- Cross Encoders en Hugging Face: https://huggingface.co/models?library=sentence-transformers&other=cross-encoder
- Paper de referencia (Sentence-BERT, arXiv:1908.10084): https://arxiv.org/abs/1908.10084
