# finvector/nomic_raw_ccdb_tri_merged

## Resumen

`finvector/nomic_raw_ccdb_tri_merged` es un modelo de embeddings de frases (sentence transformer) derivado de `nomic-ai/nomic-embed-text-v1.5` mediante ajuste fino supervisado con tripletas. Lo desarrolla el usuario `finvector` y está orientado a la similitud semántica y la extracción de características en inglés, con un enfoque particular en el dominio de reclamaciones financieras y de consumo (disputas de crédito, quejas ante entidades reguladoras, comunicaciones con agencias de cobro).

El modelo cuenta con 136.731.648 parámetros totales en formato safetensors y un repositorio de 0,3 GB. Se distribuye bajo licencia Apache 2.0 y es compatible con `sentence-transformers` y con Text Embeddings Inference (TEI), lo que facilita su despliegue como servicio de embeddings. La información disponible no especifica la longitud de contexto ni los tipos de cuantización soportados.

Su relevancia radica en que demuestra un patrón habitual en la comunidad: la especialización de un modelo de embeddings generalista de referencia (nomic-embed-text-v1.5) sobre un corpus vertical concreto mediante `CachedMultipleNegativesRankingLoss`, lo que permite mejorar la recuperación semántica en un nicho específico sin partir de cero. No obstante, el modelo es muy reciente (creado en noviembre de 2026), no tiene descargas ni valoraciones, y sus métricas declaradas deben interpretarse con cautela.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder (nomic_bert), basado en `nomic-ai/nomic-embed-text-v1.5` |
| Parámetros totales | 136.731.648 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un sentence transformer construido sobre la arquitectura `nomic_bert` del checkpoint `nomic-ai/nomic-embed-text-v1.5`, que a su vez deriva de la familia BERT con modificaciones orientadas a embeddings de texto. El autor lo ha ajustado mediante fine-tuning supervisado usando `CachedMultipleNegativesRankingLoss`, una función de pérdida de tipo contrastivo que aprovecha negativos en el lote para mejorar la discriminación entre pares positivos y negativos sin necesidad de minería explícita de negativos duros.

El conjunto de entrenamiento declarado tiene 124.887 ejemplos y, a juzgar por los ejemplos de la model card, está compuesto por textos del dominio de reclamaciones financieras y de consumo: disputas de informes de crédito (TransUnion), violaciones de la FCRA, comunicaciones con agencias de cobro y quejas formales. El nombre del repositorio sugiere un proceso de fusión (`merged`) de variantes entrenadas con tripletas sobre un corpus de quejas (`ccdb`, probablemente Consumer Complaint Database). No se dispone de información sobre el número total de tokens de entrenamiento, la composición exacta del dataset, ni si se aplicaron técnicas de RLHF o DPO (no aplicables habitualmente a modelos de embeddings).

## Capacidades

- Generación de embeddings de frases para similitud semántica y recuperación de información en inglés.
- Extracción de características (`feature-extraction`) a nivel de frase y de documento.
- Búsqueda semántica y recuperación densa (dense retrieval) sobre corpus textuales.
- Agrupamiento (clustering) y deduplicación semántica de documentos.
- Clasificación de textos por similitud a prototipos o ejemplos etiquetados.
- Detección de paráfrasis y near-duplicates en textos legales o administrativos.
- Integración con pipelines de `sentence-transformers` y con Text Embeddings Inference (TEI) para servir embeddings vía API.
- No soporta tool calling, agentes, razonamiento multi-paso ni generación de texto: es un modelo exclusivamente de representación.

## Casos de uso

- Búsqueda semántica en bases de conocimiento de quejas de consumo: indexar las reclamaciones con este modelo y recuperar las más similares a una consulta del usuario, aprovechando el ajuste específico sobre el dominio de disputas financieras.
- Deduplicación de reclamaciones: agrupar quejas casi idénticas presentadas por distintos usuarios o contra distintas entidades mediante similitud coseno sobre los embeddings, reduciendo el trabajo manual de triaje.
- Enrutamiento automático de tickets: clasificar una reclamación entrante comparándola con prototipos de categorías (disputa de crédito, cobro abusivo, bancarrota mal reportada) y asignarla al equipo correspondiente.
- Detección de plantillas y textos generados: identificar reclamaciones que siguen plantillas conocidas (por ejemplo, cartas modelo de la FCRA) comparando su embedding con el de plantillas de referencia.
- Recuperación aumentada (RAG) sobre documentación regulatoria: usar el modelo como retriever para localizar cláusulas o precedentes relevantes antes de que un LLM genere una respuesta, manteniendo el generador separado del recuperador.
- Monitorización de similitud en producción: calcular la deriva semántica de las reclamaciones recibidas a lo largo del tiempo agrupando embeddings y detectando la aparición de nuevos patrones.
- Filtrado previo en pipelines de anotación: priorizar para revisión humana los documentos con mayor similitud a casos previamente marcados como problemáticos.

## Benchmarks y rendimiento

Los únicos datos disponibles provienen del `model-index` declarado por el autor:

| Tarea | Dataset | Métrica | Valor | Verificado |
|---|---|---|---|---|
| Triplet | triplet eval | Cosine Accuracy | 1,0 | No |

El valor de 1,0 en precisión coseno sobre un conjunto de evaluación de tripletas no verificado externamente debe tratarse con escepticismo: es consistente con una evaluación sobre un conjunto pequeño, fácil o parcialmente visto durante el entrenamiento. No se han publicado resultados en benchmarks estándar de embeddings (MTEB, BEIR, MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,55 GB solo para pesos (136,7 M de parámetros × 4 bytes), más overhead de activaciones y tokenizador; en la práctica, menos de 2 GB para lotes moderados.
- VRAM estimada en fp16/bf16: alrededor de 0,28 GB para pesos; cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente; RTX 3060, RTX 4060, RTX 4090, A10, L4, A100 o H100 funcionan sin problema. Para alto throughput, GPUs con mayor ancho de banda (A100/H100) escalan mejor.
- Cabe en GPU consumer: sí, en prácticamente todas las GPU consumer modernas, e incluso en CPU para volúmenes moderados.
- Opciones de despliegue: `sentence-transformers` (Python), Text Embeddings Inference (TEI), integración vía endpoints compatibles, exportación a ONNX si se desea optimizar en CPU.
- Latencia y throughput estimados: no disponibles en la información proporcionada; para un encoder de 137 M de parámetros se espera un throughput alto (miles de frases por segundo en GPU moderna), pero no se aportan cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| `finvector/nomic_raw_ccdb_tri_merged` | 136,7 M | no disponible | Apache 2.0 | Embeddings especializados en reclamaciones financieras (inglés) | Hugging Face, sin descargas |
| `nomic-ai/nomic-embed-text-v1.5` | ~137 M | 8.192 tokens (según la documentación pública del modelo base) | Apache 2.0 | Embeddings generalistas multilingües/inglés | Hugging Face, ampliamente utilizado |
| `BAAI/bge-small-en-v1.5` | ~33 M | 512 tokens | MIT | Embeddings generalistas en inglés | Hugging Face, muy extendido |
| `intfloat/e5-small-v2` | ~33 M | 512 tokens | MIT | Embeddings generalistas en inglés | Hugging Face, muy extendido |

La comparación con el modelo base es la más relevante: este checkpoint hereda la arquitectura y el contexto de `nomic-embed-text-v1.5`, pero sustituye el ajuste generalista por uno específico de dominio. Frente a `bge-small-en-v1.5` y `e5-small-v2`, ofrece aproximadamente cuatro veces más parámetros, lo que puede traducirse en mejor calidad de representación a costa de mayor coste computacional, aunque no hay benchmarks públicos que lo confirmen.

## Limitaciones y advertencias

- El modelo solo está entrenado y evaluado para inglés; su rendimiento en castellano u otros idiomas no está garantizado.
- El ajuste fino sobre un corpus muy específico (reclamaciones financieras) puede degradar su rendimiento en dominios generales en comparación con el modelo base.
- El único benchmark declarado (Cosine Accuracy = 1,0) no está verificado y probablemente no es representativo de un uso real.
- No hay información sobre sesgos; al entrenarse sobre quejas de consumo, puede heredar sesgos presentes en ese corpus (por ejemplo, sobrerrepresentación de ciertos perfiles o entidades).
- Riesgo de falsos positivos en similitud: textos con vocabulario parecido pero significado distinto (distintas entidades, importes o fechas) pueden obtener puntuaciones altas.
- La licencia Apache 2.0 permite uso comercial, pero el modelo no incluye garantías; conviene validarlo en el dominio objetivo antes de llevarlo a producción.
- El repositorio no tiene descargas ni valoraciones, lo que dificulta estimar su fiabilidad; se recomienda evaluarlo con un conjunto propio antes de adoptarlo.
- No se especifican la longitud de contexto efectiva ni los tipos de cuantización soportados, lo que limita la planificación del despliegue.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/finvector/nomic_raw_ccdb_tri_merged)
- [Modelo base: nomic-ai/nomic-embed-text-v1.5](https://huggingface.co/nomic-ai/nomic-embed-text-v1.5)
- [Paper de Sentence-BERT (arXiv:1908.10084)](https://arxiv.org/abs/1908.10084)
- [Paper de Multiple Negatives Ranking (arXiv:2101.06983)](https://arxiv.org/abs/2101.06983)
