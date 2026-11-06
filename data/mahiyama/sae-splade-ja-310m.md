# mahiyama/sae-splade-ja-310m

## Resumen

`sae-splade-ja-310m` es un modelo de recuperación dispersa aprendida (*learned sparse retrieval*) para japonés, publicado por el usuario mahiyama en Hugging Face. Se construye sobre el encoder `sbintuitions/modernbert-ja-310m` y sustituye la cabeza MLM típica de SPLADE por el codificador de un autoencoder disperso (SAE) preentrenado con 65.536 características. El resultado es un encoder que proyecta consultas y documentos a vectores dispersos de 65.536 dimensiones cuyo producto escalar aproxima la relevancia, manteniendo la eficiencia de un índice invertido.

La innovación frente a SPLADE clásico es que las dimensiones ya no corresponden a tokens del vocabulario, sino a características latentes del SAE que capturan conceptos, expresiones y estructuras sintácticas. Esto permite generalización semántica sin perder la interpretabilidad y la velocidad de la recuperación léxica. Sigue la línea de SAE-SPLADE (Zong et al., 2026) y SPLARE (Formal et al., 2026), congelando los pesos del SAE y entrenando solo el resto para la tarea de recuperación.

El modelo cuenta con unos 365M parámetros (315M del encoder base más ~50M del codificador SAE), soporta entradas de hasta 8.192 tokens y se distribuye bajo licencia MIT. Está pensado para pipelines de búsqueda y *retrieval-augmented generation* en japonés, donde ofrece una alternativa dispersa competitiva con embeddings densos de tamaño similar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (ModernBERT) + SAETopKPooling (codificador Top-K SAE con max-pooling) |
| Parametros totales | 314.611.968 (safetensors); ~365M segun model card (incluye SAE) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8.192 tokens (entrenamiento: consultas 256, documentos 1.024) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | japones (ja) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Dimension de salida | 65.536 (caracteristicas del SAE), dispersa |
| Similitud | producto escalar (inner product) |
| Top-K en inferencia | consulta 40, documento 400 (configurable) |
| Libreria | sentence-transformers (SparseEncoder, verificado en 6.2.0) |

## Arquitectura y entrenamiento

El modelo parte del encoder `sbintuitions/modernbert-ja-310m` y reemplaza la cabeza de modelado de lenguaje enmascarado por el codificador de un autoencoder disperso Top-K previamente entrenado sobre los estados ocultos de la última capa del modelo base. Para cada token se conservan las 16 características de mayor activación y, tras aplicar max-pooling sobre la secuencia, se obtiene un vector disperso de 65.536 dimensiones. En inferencia se aplica además un recorte a las 40 dimensiones de mayor valor para consultas y 400 para documentos, lo que reduce el coste computacional del índice invertido.

El entrenamiento se realiza siguiendo el esquema de SPLARE: los pesos del SAE permanecen congelados y se ajusta el encoder para la tarea de recuperación. La model card enumera un conjunto amplio de datasets japoneses de recuperación y QA (auto-wiki-qa, mqa-ja, mmarco-ja, miracl-retrieval, mrtydi, quiz-works, quiz-no-mori, amagasaki-qna, kosodate-faq-pairs-ja, anlp-meeting-retrieval, JMTEB, Mintaka y Wikipedia). No se especifican en la información disponible el número total de tokens de entrenamiento ni la composición exacta de las pérdidas (por ejemplo, si se empleó destilación o negativos duros).

## Capacidades

- Generación de embeddings dispersos para consultas y documentos en japonés, con dimensiones alineadas a características del SAE.
- Recuperación de información mediante producto escalar sobre índice invertido, apta para motores tipo Lucene/PISA.
- Codificación asimétrica: `encode_query` aplica recorte Top-40, `encode_document` aplica Top-400; `encode` no aplica recorte.
- Manejo de documentos largos de hasta 8.192 tokens, útil para artículos y actas.
- Capacidad multilingüe limitada al japonés; no se declara soporte para otros idiomas.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un encoder de recuperación, no un modelo generativo.
- Interpretabilidad parcial: las dimensiones del SAE se asocian a conceptos, expresiones y estructuras (analizado en `interpretability.md`).

## Casos de uso

- Búsqueda empresarial en japonés: indexación de documentación interna o bases de conocimiento con un índice invertido sobre 65.536 dimensiones y recorte a 400 por documento, lo que reduce el coste de almacenamiento y latencia frente a embeddings densos.
- RAG sobre Wikipedia japonesa: recuperación de pasajes para alimentar un LLM generativo, aprovechando la ventana de 8.192 tokens para fragmentos largos y el producto escalar para ranking rápido.
- Atención al cliente y FAQ: emparejamiento consulta–respuesta sobre pares FAQ (kosodate-faq-pairs-ja, amagasaki-qna), donde la dispersión permite filtrar por términos y conceptos simultáneamente.
- Búsqueda en actas de reuniones: recuperación sobre transcripciones (anlp-meeting-retrieval) con consultas cortas y documentos extensos, beneficiándose de la codificación asimétrica.
- Recuperación académica y de publicaciones: tareas de NLP Journal (título–abstract, abstract–artículo) donde el modelo alcanza nDCG@10 superior al 97 en varios subtasks.
- Sistemas de preguntas y respuestas sobre datos estructurados y tabulares (Mintaka), integrados en asistentes que combinan recuperación léxica y semántica.
- Filtrado y deduplicación de corpus: uso de los vectores dispersos para detectar documentos próximos sin necesidad de un índice denso aproximado (ANN).

## Benchmarks y rendimiento

Evaluación sobre las 11 tareas de recuperación de JMTEB v2 lite (nDCG@10), con documentos truncados a 8.192 tokens y consultas sin truncar.

| Tarea | Con recorte (q=40, d=400) | Sin recorte |
|---|---:|---:|
| JaqketRetrievalLite | 79,72 | 81,63 |
| MrTyDiJaRetrievalLite | 55,66 | 57,17 |
| JaGovFaqsRetrieval | 76,49 | 76,39 |
| NLPJournalTitleAbsRetrieval.V2 | 97,58 | 97,67 |
| NLPJournalTitleIntroRetrieval.V2 | 97,48 | 97,69 |
| NLPJournalAbsIntroRetrieval.V2 | 99,25 | 99,29 |
| NLPJournalAbsArticleRetrieval.V2 | 99,66 | 99,59 |
| JaCWIRRetrievalLite | 82,39 | 81,10 |
| MIRACLJaRetrievalLite | 68,99 | 70,74 |
| MintakaRetrieval | 22,70 | 23,09 |
| MultiLongDocRetrieval | 48,95 | 51,21 |
| **Media** | **75,35** | **75,96** |
| Dimensiones no nulas (q/d) | 40,0 / 301,1 | 92,4 / 395,5 |
| FLOPs relativos | 12,1 | 45,1 |

Comparativa en las 7 tareas comunes entre JMTEB v2 lite y v2 (media nDCG@10, modelos ≤1B parámetros, condiciones de medición no idénticas):

| Modelo | Tipo | Media 7 tareas |
|---|---|---:|
| sionic-ai/comsat-embed-ja-0.3b-preview | Dense | 79,68 |
| cl-nagoya/ruri-v3-130m | Dense | 78,40 |
| cl-nagoya/ruri-v3-310m | Dense | 78,29 |
| **mahiyama/sae-splade-ja-310m** | **Sparse** | **77,44** |
| codefuse-ai/F2LLM-v2-0.6B | Dense | 76,86 |
| mahiyama/splade-ja-310m-v2 | Sparse | 76,53 |
| BAAI/bge-m3 | Dense | 74,50 |
| microsoft/harrier-oss-v1-270m | Dense | 72,48 |

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: ~1,3 GB; en fp16/bf16: ~0,7 GB. Cabe holgadamente en cualquier GPU consumer (RTX 3060 12 GB, RTX 4090, etc.) e incluso en CPU para lotes pequeños.
- GPUs recomendadas: RTX 4090 o A100/H100 para indexación a gran escala; T4 o L4 suficientes para servir consultas en línea.
- Despliegue mediante `sentence-transformers` (SparseEncoder ≥ 6.2.0), con soporte declarado para `text-embeddings-inference` y endpoints compatibles.
- El coste dominante en producción es el índice invertido y el producto escalar disperso, no la inferencia del encoder; el recorte Top-40/Top-400 reduce los FLOPs de búsqueda de 45,1 a 12,1 (referencia relativa de la model card).
- No se publican cifras de latencia ni throughput absolutos en la información disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mahiyama/sae-splade-ja-310m | Sparse (SAE-SPLADE) | ~365M | 8.192 | MIT | Hugging Face |
| mahiyama/splade-ja-310m-v2 | Sparse (SPLADE) | ~310M | no disponible | no disponible | Hugging Face |
| cl-nagoya/ruri-v3-310m | Dense | ~310M | no disponible | no disponible | Hugging Face |
| cl-nagoya/ruri-v3-130m | Dense | ~130M | no disponible | no disponible | Hugging Face |
| BAAI/bge-m3 | Dense multilingüe | ~568M | 8.192 | MIT | Hugging Face |

Frente a `ruri-v3-310m` y `comsat-embed-ja-0.3b-preview`, el modelo queda ligeramente por debajo en media de nDCG@10 (77,44 frente a 78,29 y 79,68), pero ofrece recuperación dispersa nativa con índice invertido, lo que abarata el almacenamiento y permite filtrar por términos. Frente a `splade-ja-310m-v2` mejora ~0,9 puntos en las mismas 7 tareas, a costa de un SAE adicional de ~50M parámetros.

## Limitaciones y advertencias

- Modelo exclusivamente en japonés; su uso con otros idiomas no está soportado ni evaluado.
- Las dimensiones del vector no son legibles como tokens, a diferencia de SPLADE clásico; la inspección requiere el análisis de características del SAE.
- Rendimiento bajo en Mintaka (22,70–23,09 nDCG@10) y moderado en MrTyDi (55,66–57,17) y MultiLongDocRetrieval (48,95–51,21): no es adecuado como solución única para QA sobre tablas o documentos muy largos.
- El recorte Top-K por defecto sacrifica ~0,6 puntos de media a cambio de reducir ~3,7× los FLOPs; conviene validar el umbral en el dominio propio.
- Riesgo de alucinación no aplica directamente (no genera texto), pero sí de falsos positivos en el ranking; se recomienda re-ranking supervisado en producción.
- Sesgos heredados del corpus de entrenamiento (Wikipedia, QA japonesa, actas) y del encoder base `modernbert-ja-310m`; no se documentan análisis de sesgo.
- Licencia MIT permite uso comercial, pero los datasets de entrenamiento pueden tener condiciones propias que conviene revisar.
- Requiere `trust_remote_code=True` y `sentence-transformers ≥ 6.2.0`; la compatibilidad con versiones anteriores no está garantizada.
- No se han publicado cifras de latencia, throughput ni consumo en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mahiyama/sae-splade-ja-310m
- Modelo base: https://huggingface.co/sbintuitions/modernbert-ja-310m
- Análisis de interpretabilidad: https://huggingface.co/mahiyama/sae-splade-ja-310m/blob/main/interpretability.md
- Modelo predecesor: https://huggingface.co/mahiyama/splade-ja-310m-v2
- Paper SAE-SPLADE (Zong et al., 2026): https://arxiv.org/abs/2604.21511
- Paper SPLARE (Formal et al., 2026): https://arxiv.org/abs/2603.13277
- Paper ModernBERT: https://arxiv.org/abs/2406.04093
- Paper SPLADE original: https://arxiv.org/abs/2004.05665
- Resultados MTEB/JMTEB: https://github.com/embeddings-benchmark/results
- Dataset JMTEB: https://huggingface.co/datasets/sbintuitions/JMTEB
- Dataset Mintaka: https://huggingface.co/datasets/AmazonScience/mintaka
