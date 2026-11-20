# finvector/Test_nomic_raw_finmodern_tri_merged

## Resumen

Test_nomic_raw_finmodern_tri_merged es un modelo de embeddings de frases (sentence embeddings) desarrollado por finvector, obtenido mediante fine-tuning del modelo base nomic-ai/nomic-embed-text-v1.5. Su propósito es generar representaciones vectoriales densas para tareas de similitud semántica y extracción de características, con un enfoque particular en texto financiero y corporativo en inglés, como se deduce de los ejemplos de la model card (balances de goodwill, informes 10-K, acuerdos de compra de receivables).

El modelo se distribuye a través de la librería sentence-transformers y emplea una arquitectura nomic_bert con 136.731.648 parámetros totales en formato safetensors. El entrenamiento se realizó con la función de pérdida CachedMultipleNegativesRankingLoss sobre un conjunto de datos de tan solo 70 ejemplos, lo que sugiere un ajuste fino muy específico y de alcance limitado, probablemente orientado a un caso de uso concreto de recuperación o emparejamiento de pasajes financieros.

Es relevante ahora porque los embeddings especializados en dominios financieros permiten mejorar la recuperación semántica en sistemas RAG sobre documentación corporativa, donde los modelos generalistas suelen fallar al distinguir matices contables y legales. La licencia Apache 2.0 y la compatibilidad con text-embeddings-inference y endpoints facilitan su despliegue en producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | nomic_bert (transformer encoder) |
| Parametros totales | 136.731.648 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en nomic-bert, la arquitectura del modelo nomic-ai/nomic-embed-text-v1.5, un transformer encoder diseñado para generar embeddings de texto. Se ha generado mediante fine-tuning supervisado con sentence-transformers, partiendo del checkpoint base y aplicando la pérdida CachedMultipleNegativesRankingLoss, una variante de contrastive learning que cachea embeddings negativos para mejorar la eficiencia del entrenamiento con batches grandes.

El conjunto de entrenamiento declarado contiene únicamente 70 ejemplos (dataset_size:70), lo que indica un ajuste fino de baja escala, probablemente centrado en tripletas del dominio financiero. No se dispone de información sobre el número total de tokens de entrenamiento, la composición detallada del dataset ni si se aplicaron técnicas de RLHF o DPO. El nombre del modelo ("raw_finmodern_tri_merged") sugiere el uso de tripletas financieras y una posible fusión de checkpoints, aunque no se detalla el procedimiento de merge en la información disponible.

## Capacidades

- Generación de embeddings de frases para tareas de similitud semántica (sentence-similarity) y extracción de características (feature-extraction).
- Codificación de pasajes financieros y corporativos en inglés, incluyendo informes anuales, notas contables y contratos.
- Soporte para búsqueda semántica y recuperación de información densa (dense retrieval).
- Compatible con la librería sentence-transformers y con text-embeddings-inference para despliegue como servicio.
- Compatibilidad declarada con endpoints (endpoints_compatible).
- Capacidad multilingüe: limitada al inglés (en).
- No se declara soporte de tool calling, agentes, visión, audio ni modo de razonamiento explícito.

## Casos de uso

- Recuperación aumentada (RAG) sobre informes 10-K y documentación financiera: el modelo puede indexar pasajes de informes anuales y recuperar los fragmentos más relevantes para una consulta, gracias a su ajuste específico sobre texto contable y corporativo.
- Búsqueda semántica en bases de conocimiento legal y financiera: permite encontrar cláusulas o secciones similares (por ejemplo, políticas de goodwill o acuerdos de receivables) aunque no compartan términos exactos.
- Deduplicación y agrupación de documentos corporativos: al generar embeddings densos, facilita el clustering de pasajes con contenido equivalente en grandes corpus de filings.
- Motor de recomendación de documentos: dado un pasaje de referencia, el modelo puede sugerir otros fragmentos relacionados dentro de un repositorio de documentación financiera.
- Clasificación de texto por similitud: comparar la representación de un documento con prototipos de categorías (por ejemplo, riesgos, contingencias, políticas contables) para asignar etiquetas.
- Detección de duplicados en pipelines de ingesta documental: integrable en procesos ETL para identificar pasajes repetidos o casi idénticos antes de la indexación.
- Evaluación de similitud en sistemas de control de calidad de traducciones o resúmenes financieros, comparando el embedding del original con el de la versión generada.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo (no verificados):

| Tarea | Dataset | Métrica | Valor |
|---|---|---|---|
| Triplet | triplet eval | Cosine Accuracy | 0,9333 |

No se han publicado otros resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de 136,7 millones de parámetros, en precisión FP32 requiere aproximadamente 0,55 GB solo para pesos; en FP16 alrededor de 0,27 GB. Con overhead de activaciones y tokenizador, es holgado en cualquier GPU con 2 GB o más.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4090) es suficiente; para despliegues de alto throughput se pueden usar A100 o H100, aunque el modelo es pequeño y no las aprovecha intensivamente.
- Cabe en GPU consumer: sí, en cualquier GPU con al menos 2 GB de VRAM, e incluso en CPU para cargas moderadas.
- Opciones de despliegue: sentence-transformers, text-embeddings-inference (declarado compatible), y potencialmente ONNX u otros runtimes compatibles con transformers. No se confirma soporte de llama.cpp, Ollama o vLLM en la información disponible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Enfoque |
|---|---|---|---|---|---|
| finvector/Test_nomic_raw_finmodern_tri_merged | 136,7 M | no disponible | en | apache-2.0 | Embeddings financieros (fine-tuning) |
| nomic-ai/nomic-embed-text-v1.5 (base) | ~137 M | no disponible | en (multilingüe limitado) | apache-2.0 | Embeddings generalistas |
| BAAI/bge-small-en-v1.5 | ~33 M | 512 tokens | en | MIT | Embeddings generalistas ligeros |
| intfloat/e5-small-v2 | ~33 M | 512 tokens | en | MIT | Embeddings generalistas ligeros |

La comparativa se basa en características públicas de los modelos citados; no se dispone de resultados de benchmarks comparativos directos en la información proporcionada.

## Limitaciones y advertencias

- El conjunto de entrenamiento es extremadamente pequeño (70 ejemplos), lo que limita la generalización y aumenta el riesgo de sobreajuste al dominio y estilo de esos datos.
- El modelo solo declara soporte de inglés; su rendimiento en castellano u otros idiomas no está garantizado.
- No se dispone de información sobre la longitud máxima de contexto soportada, lo que impide planificar el truncado de documentos largos con precisión.
- Riesgo de alucinación no aplica directamente a un modelo de embeddings, pero sí el riesgo de similitudes espurias en pasajes financieros con vocabulario muy técnico.
- Los resultados de benchmark declarados (cosine accuracy 0,9333) no están verificados y corresponden a un único conjunto de evaluación de tripletas, por lo que no deben extrapolarse a otros dominios.
- Aunque la licencia es Apache 2.0 y permite uso comercial, la ausencia de documentación sobre el dataset de entrenamiento impide evaluar posibles sesgos o problemas de licencia de los datos originales.
- El nombre del modelo incluye "Test", lo que sugiere que podría tratarse de un experimento interno y no de un modelo destinado a producción estable.
- No se declaran capacidades de tool calling, agentes ni razonamiento multi-paso, por lo que no es adecuado como modelo generativo.

## Enlaces

- Hugging Face: https://huggingface.co/finvector/Test_nomic_raw_finmodern_tri_merged
- Modelo base: https://huggingface.co/nomic-ai/nomic-embed-text-v1.5
- Paper de Sentence-BERT (arXiv:1908.10084): https://arxiv.org/abs/1908.10084
- Paper de Nomic Embed (arXiv:2101.06983): https://arxiv.org/abs/2101.06983
