# Jbbok/my-kanana-2-3b-dart

## Resumen

`Jbbok/my-kanana-2-3b-dart` es un modelo de embeddings de frases (sentence embeddings) obtenido por fine-tuning del modelo base `kakaocorp/kanana-2-3b-embedding`, desarrollado por Kakao Corp. El autor del ajuste es el usuario de Hugging Face Jbbok, y el modelo está publicado bajo la librería `sentence-transformers` con el pipeline `sentence-similarity`. Su propósito es la recuperación semántica densa (dense retrieval) sobre documentación financiera y regulatoria coreana, en concreto sobre informes anuales (사업보고서) de empresas cotizadas, incluyendo el sistema DART de divulgación electrónica de Corea del Sur.

El ajuste se ha realizado sobre un conjunto de datos de 3.687 ejemplos, empleando las funciones de pérdida `CachedMultipleNegativesRankingLoss` y `MultipleNegativesRankingLoss`, típicas del entrenamiento de recuperadores densos. El modelo base aporta 3.000 millones de parámetros y una arquitectura transformer de tipo decoder adaptada a la extracción de representaciones vectoriales; el resultado es un encoder de 3B parámetros orientado a similitud semántica en coreano.

La relevancia de este modelo radica en su especialización: los ejemplos de la model card muestran consultas en coreano sobre cifras de ingresos, participaciones de mercado y desgloses contables de empresas como SK Hynix, Naver o LG Chem, emparejadas con fragmentos extensos de informes. Esto lo hace útil para sistemas RAG (retrieval-augmented generation) sobre corpus financieros coreanos, un nicho poco cubierto por los embeddings multilingües genéricos. No obstante, el modelo tiene cero descargas y cero likes en el momento de la ficha, y no se ha publicado información sobre licencia ni idiomas soportados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (encoder de embeddings derivado de `kakaocorp/kanana-2-3b-embedding`); detalles internos del base no disponibles |
| Parámetros totales | 3B (según el nombre del modelo base; no confirmado en la model card) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en safetensors; repo de 0,1 GB, lo que sugiere pesos parciales o cuantizados, no confirmado) |
| Idiomas soportados | no disponible (los ejemplos de la model card son exclusivamente en coreano) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning del checkpoint `kakaocorp/kanana-2-3b-embedding`, que a su vez pertenece a la familia Kanana de Kakao Corp. La model card no detalla la arquitectura interna del base (número de capas, dimensión oculta, mecanismo de atención, si emplea atención lineal o decodificación especulativa); únicamente se indica que se trata de un modelo de embeddings densos compatibles con `sentence-transformers`. El tamaño del repositorio (0,1 GB) es llamativamente pequeño para un modelo de 3B parámetros en precisión completa, lo que podría indicar que los pesos publicados están cuantizados o que el repositorio contiene solo una parte de los artefactos; este dato no se aclara en la información disponible.

El entrenamiento se realizó con 3.687 ejemplos y dos funciones de pérdida de ranking: `MultipleNegativesRankingLoss` y su variante con caché `CachedMultipleNegativesRankingLoss`. Ambas son estándar en el ajuste de recuperadores densos con pares (consulta, pasaje positivo) y negativos en el lote. Los tags incluyen las referencias arXiv 1908.10084 (Sentence-BERT), 2101.06983 (CachedMultipleNegativesRankingLoss, artículo de Sentence-Transformers) y 1807.03748 (SimCLR, base conceptual de las pérdidas contrastivas). No se especifica el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo etapas de RLHF o DPO (poco habituales en modelos de embeddings).

## Capacidades

- Generación de embeddings de frases y pasajes para similitud semántica y recuperación densa.
- Extracción de características (`feature-extraction`) a partir de texto.
- Recuperación de pasajes relevantes en coreano sobre documentos financieros y regulatorios extensos (informes anuales, notas contables).
- Manejo de fragmentos largos con estructura Markdown y tablas, según los ejemplos de la model card.
- Discriminación entre pasajes semánticamente próximos pero incorrectos (p. ej., distintas partidas contables o distintos ejercicios fiscales).
- No se ha documentado soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking; al ser un modelo de embeddings, estas capacidades no aplican.
- Capacidades multilingües: no documentadas; los ejemplos disponibles son exclusivamente en coreano.

## Casos de uso

- RAG sobre informes anuales coreanos (DART): indexar los PDF/HTML de los 사업보고서 y recuperar los fragmentos que contienen la cifra solicitada (ingresos por segmento, participación de mercado, dividendos) para que un LLM genere la respuesta con la cita correcta.
- Búsqueda semántica en bases de datos regulatorias: consultas en lenguaje natural sobre múltiples empresas y ejercicios fiscales, con recuperación de la partida contable exacta y no de una sección genérica del informe.
- Asistentes de análisis financiero: dado que el modelo distingue entre magnitudes similares (por ejemplo, ingresos consolidados frente a ingresos por segmento), sirve como primera etapa de recuperación en herramientas de extracción de KPIs.
- Deduplicación y clustering de fragmentos de informes: agrupar secciones equivalentes entre distintos documentos o años para construir un corpus normalizado.
- Verificación de citas y auditoría: comprobar si una afirmación sobre una empresa está respaldada por un pasaje concreto del informe, comparando el embedding de la afirmación con los pasajes candidatos.
- Enrutamiento de consultas en atención al usuario financiero: clasificar la consulta del usuario hacia el documento o sección correcta antes de invocar un modelo generativo, reduciendo el contexto enviado al LLM.
- Construcción de índices vectoriales específicos de dominio: al estar ajustado sobre 3.687 pares del dominio, puede superar a embeddings multilingües genéricos en recall sobre jerga contable coreana, aunque no hay métricas publicadas que lo confirmen.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de recuperación (Recall@k, nDCG, MRR) ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión. Para un modelo de 3B parámetros, las estimaciones genéricas serían de aproximadamente 6-7 GB en FP16 y 2-3 GB en cuantización de 4 bits, pero no se confirma que los pesos publicados correspondan a esos tamaños.
- GPU recomendadas: no disponibles en la información proporcionada. Por tamaño, un modelo de 3B podría ejecutarse en GPUs de consumo como RTX 3090 o RTX 4090 en FP16, y en GPUs de datacenter (A100, H100) para despliegues de alto throughput, pero son estimaciones no verificadas.
- Cabe en GPU de consumo: probablemente sí en RTX 3090/4090 para un modelo de 3B en FP16, según estimación genérica; no confirmado para este checkpoint.
- Opciones de despliegue: `sentence-transformers` (librería declarada), y por compatibilidad con el ecosistema, servidores de embeddings como TEI (Text Embeddings Inference) o vLLM en modo embedding; no se documenta compatibilidad explícita con llama.cpp u Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Jbbok/my-kanana-2-3b-dart` | 3B (según base) | no disponible | Embeddings financieros en coreano (DART) | no disponible | Hugging Face, 0 descargas |
| `kakaocorp/kanana-2-3b-embedding` | 3B | no disponible | Embeddings generales en coreano | no disponible en esta ficha | Hugging Face |
| Sentence-BERT multilingüe (p. ej. `paraphrase-multilingual-mpnet-base-v2`) | ~278M | 384 tokens típicamente | Embeddings multilingües generales | Apache-2.0 (habitual) | Hugging Face, ampliamente usado |
| `BAAI/bge-m3` | ~568M | 8.192 tokens | Embeddings multilingües, densos y dispersos | MIT (habitual) | Hugging Face, ampliamente usado |

La comparativa con los modelos multilingües genéricos es aproximada: no hay métricas publicadas que permitan afirmar que este fine-tuning supera a `bge-m3` o a los modelos SBERT en recuperación sobre coreano financiero. La ventaja esperada es la especialización de dominio; la desventaja, el mayor coste computacional (3B frente a cientos de millones de parámetros) y la ausencia de licencia declarada.

## Limitaciones y advertencias

- No se declara licencia, lo que impide determinar si el uso comercial está permitido; debe contactarse con el autor antes de cualquier despliegue en producción.
- No se declaran los idiomas soportados; todos los ejemplos de la model card son en coreano, por lo que el rendimiento en castellano u otros idiomas es desconocido y probablemente deficiente.
- El dataset de entrenamiento es pequeño (3.687 ejemplos) y de un dominio muy concreto (informes DART), lo que puede provocar sobreajuste al formato y estilo de esos documentos y degradar el rendimiento en otros corpus.
- No hay benchmarks publicados: no es posible verificar la calidad de recuperación frente a alternativas establecidas.
- Riesgo de recuperación de pasajes plausibles pero incorrectos (por ejemplo, cifras de otro ejercicio fiscal o de otra empresa) en consultas ambiguas; debe combinarse con verificación posterior.
- El repositorio tiene 0 descargas y 0 likes y fue creado en noviembre de 2026, sin señales de mantenimiento ni validación por parte de la comunidad.
- El tamaño del repo (0,1 GB) no es coherente con un modelo de 3B en FP16; conviene verificar qué artefactos contiene realmente antes de integrarlo.
- Al ser un modelo de embeddings, no genera texto: cualquier caso de uso generativo requiere un LLM adicional.
- No se documenta la longitud máxima de contexto, lo que impide planificar el troceado (chunking) de documentos largos con garantías.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Jbbok/my-kanana-2-3b-dart
- Modelo base: https://huggingface.co/kakaocorp/kanana-2-3b-embedding
- Sentence-BERT (arXiv:1908.10084): https://arxiv.org/abs/1908.10084
- CachedMultipleNegativesRankingLoss (arXiv:2101.06983): https://arxiv.org/abs/2101.06983
- SimCLR (arXiv:1807.03748): https://arxiv.org/abs/1807.03748
