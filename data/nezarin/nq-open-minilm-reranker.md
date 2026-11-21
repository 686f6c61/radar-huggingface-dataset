# NezarIn/nq-open-minilm-reranker

## Resumen

nq-open-minilm-reranker es un cross-encoder de 22,7 millones de parametros desarrollado por NezarIn, un refinamiento del conocido `cross-encoder/ms-marco-MiniLM-L6-v2` ajustado especificamente sobre preguntas del dataset Natural Questions (NQ) para actuar como segunda etapa en pipelines de recuperacion-aumentada (RAG) sobre Wikipedia. Resuelve el problema de reordenar candidatos recuperados por un buscador de primera etapa, mejorando la precision de los pasajes que se entregan al generador o al usuario final.

El modelo parte de la arquitectura BERT (familia MiniLM-L6) y se entrena con un objetivo de clasificacion de pares consulta-pasaje mediante softmax cross-entropy sobre grupos de 1 positivo y 7 negativos. Su relevancia actual radica en que demuestra que un ajuste fino muy barato (unos 6 minutos en una sola GPU RTX PRO 6000) sobre un reranker generico puede elevar el hit@10 de 88,4% a 91,0% en preguntas de NQ-open, superando tambien a ColBERTv2 en la misma lista de candidatos.

El contexto de uso es claramente el de RAG en ingles sobre Wikipedia: no es un modelo generativo ni multilingue, sino una pieza especializada de ranking dentro de un sistema de recuperacion. Su tamano reducido (0,1 GB de repositorio) y su latencia (13 ms de mediana para 50 pasajes) lo hacen adecuado para despliegues de bajo coste y alta concurrencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo BERT (MiniLM-L6, cross-encoder de clasificacion de pares) |
| Parametros totales | 22.713.601 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens (truncacion `only_second`, max_length=512) |
| Tipos de cuantizacion | no disponible (pesos safetensors en bf16/fp32; no se documentan variantes GGUF/INT8) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Pipeline | text-ranking |
| Modelo base | cross-encoder/ms-marco-MiniLM-L6-v2 |
| Dataset de ajuste | google-research-datasets/natural_questions |
| Tamano del repositorio | 0,1 GB |
| Compatibilidad | text-embeddings-inference, endpoints_compatible |

## Arquitectura y entrenamiento

El modelo es un cross-encoder basado en MiniLM-L6: codifica conjuntamente la consulta y el pasaje en una unica secuencia y produce una puntuacion de relevancia por par, en lugar de comparar embeddings independientes como hacen los bi-encoders. Esta formulacion permite capturar interacciones token a token entre pregunta y pasaje, a costa de requerir una pasada por cada candidato.

El entrenamiento se realizo sobre las primeras 80.000 filas del split train de NQ, filtrando preguntas con respuesta corta de 5 tokens o menos: 21.963 preguntas tras reservar 1.000 para seleccion de epoca, de las cuales 19.198 formaron grupos utilizables (2.399 descartadas por no tener pasaje con respuesta en el top 50 y 366 por no alcanzar 7 negativos). El positivo era el candidato mejor rankeado que contenia una respuesta gold y provenia de la pagina Wikipedia gold; los negativos eran los 7 candidatos mejor rankeados sin cadena de respuesta y fuera de la pagina gold. Se uso softmax cross-entropy sobre cada grupo de 1 positivo + 7 negativos, 3 epocas, learning rate 1e-5 con warmup y decay lineal, 16 preguntas (128 pares) por paso, max 512 tokens y bf16. El entrenamiento completo consumio aproximadamente 6 minutos en una RTX PRO 6000. Los pasajes se formatearon como `"<title> > <section path> | <passage text>"` durante entrenamiento y evaluacion.

## Capacidades

- Ranking de pasajes para preguntas de dominio abierto: puntua la relevancia de cada par consulta-pasaje y permite ordenar candidatos.
- Cross-encoder de clasificacion de pares: salida de un unico logit por par, donde mayor valor indica mayor relevancia.
- Funciona con pasajes formateados con metadatos (`title > section path | texto`) y tambien con texto plano.
- Integrable como segunda etapa en pipelines retrieve-then-rerank con candidatos de recuperadores densos, BM25 o hibridos.
- Compatible con text-embeddings-inference y endpoints compatibles, lo que facilita su despliegue como servicio de reranking.
- No soporta tool calling, function calling, agentes ni generacion de texto: es exclusivamente un modelo de ranking.
- Capacidad multilingue limitada al ingles.
- Sin modo thinking, vision ni audio.

## Casos de uso

- RAG sobre Wikipedia en ingles: el modelo reordena los 50 pasajes recuperados por un hibrido contriever-msmarco + BM25 y entrega al generador los pasajes con mayor probabilidad de contener la respuesta, elevando el hit@10 de 84,2% a 91,0%.
- Atencion al cliente basada en base de conocimiento: dado un corpus documental en ingles, se usa como reranker para seleccionar los fragmentos mas relevantes antes de pasarlos a un LLM generativo, reduciendo respuestas alucinadas por contexto irrelevante.
- Busqueda interna empresarial: integrado tras un retriever denso o lexical, mejora la precision de los primeros resultados mostrados al usuario sin necesidad de reentrenar el retriever.
- Evaluacion de pipelines de retrieval: sirve como componente de referencia para medir la contribucion marginal de un reranker frente a ColBERTv2 o al MiniLM base en listas de candidatos identicas.
- Filtrado de candidatos en sistemas de QA extractivo: al puntuar pares consulta-pasaje con alta latencia baja (13 ms de mediana para 50 pasajes), permite descartar ruido antes de etapas costosas de generacion o lectura.
- Servicio de reranking de bajo coste: con 22,7M de parametros y 0,1 GB de pesos, puede desplegarse en GPUs consumer o incluso CPU para cargas moderadas, sirviendo a APIs de busqueda con requisitos ajustados de VRAM.
- Prototipado rapido de RAG en ingles: al ser un ajuste fino barato (6 minutos de entrenamiento) sobre un modelo publico, sirve de plantilla para adaptar rerankers a dominios verticales con presupuesto minimo.

## Benchmarks y rendimiento

Metrica: answer-hit@k, proporcion de preguntas en las que una respuesta gold normalizada aparece en al menos uno de los top k pasajes. Los candidatos son los top 50 pasajes de un hibrido contriever-msmarco + BM25 con reciprocal-rank fusion y duplicados exactos eliminados.

| Etapa (top-50 candidatos) | test hit@1 | test hit@10 (IC 95%) | test hit@20 | val hit@10 (IC 95%) |
|---|---|---|---|---|
| Retriever hibrido, duplicados eliminados | 47,3 | 84,2 (83,2-85,1) | 90,6 | 85,6 (84,5-86,7) |
| ColBERTv2, off the shelf | 57,9 | 88,4 (87,5-89,2) | 92,6 | 89,6 (88,6-90,6) |
| MiniLM base model, off the shelf | 57,7 | 88,4 (87,6-89,2) | 92,9 | 89,1 (88,0-90,1) |
| Este modelo | 67,3 | 91,0 (90,2-91,7) | 94,1 | 91,7 (90,7-92,5) |

- Test: 5.712 preguntas NQ-open de las filas 80.000-99.999 del split train de NQ, no usadas para entrenamiento ni seleccion.
- Val: 3.608 preguntas del split validation oficial de NQ.
- Techo: la respuesta esta entre los 50 candidatos en el 95,5% (test) y 96,1% (val) de las preguntas.
- Resultado exploratorio: con 100 candidatos, test hit@10 es 92,1; comparado sobre test, no es resultado held-out.
- Latencia: 13 ms de mediana (20 ms p99) para rerankear 50 pasajes por pregunta en RTX PRO 6000.
- Evolucion en dev durante entrenamiento: hit@10 88,4 (base) -> 90,9 -> 91,8 -> 92,0, conservando la epoca 3.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja, del orden de menos de 1 GB en fp32 para los 22,7M de parametros; en bf16 aproximadamente 45 MB de pesos mas overhead de activaciones por lote.
- GPU recomendadas: RTX PRO 6000 (referencia de latencia del autor), A100, H100, L40S; cualquier GPU con suficiente memoria para el lote de pares consulta-pasaje.
- Cabe en GPUs consumer: si, en RTX 4090, RTX 3090, RTX 3060 e incluso en GPUs de gama baja; tambien puede ejecutarse en CPU para cargas moderadas.
- Opciones de despliegue: transformers (`AutoModelForSequenceClassification`), text-embeddings-inference (tag `text-embeddings-inference`), endpoints compatibles; no se documentan pesos GGUF ni soporte explicito de llama.cpp/Ollama.
- Latencia y throughput: 13 ms de mediana y 20 ms p99 para 50 pasajes por pregunta en RTX PRO 6000; el throughput depende del batching de pares y del max_length efectivo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | hit@10 test (NQ-open) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (NezarIn/nq-open-minilm-reranker) | 22,7M | 512 tokens | 91,0 | apache-2.0 | Hugging Face |
| cross-encoder/ms-marco-MiniLM-L6-v2 | 22,7M | 512 tokens | 88,4 | apache-2.0 (segun modelo base) | Hugging Face |
| ColBERTv2 (off the shelf) | no disponible en la informacion | no disponible | 88,4 | no disponible en la informacion | no disponible en la informacion |
| Retriever hibrido contriever-msmarco + BM25 | no disponible | no disponible | 84,2 | no disponible | no disponible |

## Limitaciones y advertencias

- Etiquetas por coincidencia de cadena: los positivos se derivan de coincidencias de cadena de respuesta, por lo que algunas son menciones coincidentes; la metrica answer-hit arrastra el mismo sesgo.
- Alcance del corpus: el corpus de pasajes corresponde a las paginas Wikipedia de las primeras 100.000 preguntas de NQ train mas las paginas de validation (3,2M pasajes, 2,0M distintos), no a Wikipedia completa; los resultados sobre Wikipedia completa seran inferiores.
- Versiones de pagina: las paginas NQ estan indexadas por URL con revision id; el 2,8% de las preguntas apuntan a una revision almacenada distinta de la suya. Una comprobacion directa encontro la respuesta ausente de la pagina almacenada en 8 de las 5.712 preguntas de test, solo 1 por el desajuste de revision.
- Solo Wikipedia en ingles y preguntas con el estilo de NQ (consultas reales de busqueda de Google); no se garantiza rendimiento fuera de ese dominio o idioma.
- No es un modelo generativo: no produce respuestas, solo puntuaciones de relevancia; su uso incorrecto como generador no esta soportado.
- Licencia apache-2.0: permite uso comercial, pero conviene verificar las condiciones del modelo base y del dataset NQ en el contexto de produccion.
- Riesgo de alucinacion no aplica directamente al modelo, pero los errores de ranking pueden propagarse al generador aguas abajo si este recibe pasajes irrelevantes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/NezarIn/nq-open-minilm-reranker
- Modelo base: https://huggingface.co/cross-encoder/ms-marco-MiniLM-L6-v2
- Dataset Natural Questions: https://huggingface.co/datasets/google-research-datasets/natural_questions
