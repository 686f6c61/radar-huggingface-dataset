# NYSgpt/biomed-reranker

## Resumen

BioMed Reranker es un cross-encoder de 149M de parámetros desarrollado por NYSgpt (Brendan Stanton) para el re-rankeo de literatura científica biomédica, concretamente sobre el corpus completo de preprints de bioRxiv y medRxiv (433.449 artículos). El modelo se presenta como la segunda etapa de un sistema de recuperación en dos fases: un primer recuperador denso (BioMed Encoder) obtiene un top-K de candidatos y este reranker reordena los resultados asignando una puntuación de relevancia a cada par `(consulta, documento)`.

El modelo está fine-tuneado sobre `Alibaba-NLP/gte-reranker-modernbert-base`, un backbone basado en arquitectura ModernBERT, y se distribuye bajo licencia Apache-2.0. Su relevancia actual reside en que supera al cross-encoder oficial del NLM (`ncbi/MedCPT-Cross-Encoder`) en búsqueda conceptual MeSH cuando se le entrega el mismo pool de candidatos (R@10 0.544 vs 0.525, p = 0.013), con un coste de entrenamiento de apenas 42 minutos en una única GPU L40S. La ventana de contexto nativa es de 8.192 tokens, aunque se entrena y sirve a 256 tokens.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Cross-encoder basado en ModernBERT (backbone `Alibaba-NLP/gte-reranker-modernbert-base`) |
| Parámetros totales | 149.605.633 (149 M) |
| Parámetros activos | No aplicable (no es MoE) |
| Longitud de contexto | 8.192 tokens nativos; entrenado y servido a 256 tokens |
| Tipos de cuantización | No disponible |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

BioMed Reranker es un cross-encoder de arquitectura ModernBERT, lo que implica una atención eficiente con soporte de contexto largo nativo (8.192 tokens) y una codificación rápida en comparación con los transformers clásicos. El modelo toma un par `(consulta, documento)` y produce un único logit de relevancia, que se utiliza para reordenar los candidatos recuperados en una etapa previa. El objetivo de entrenamiento es entropía cruzada agrupada (grouped cross-entropy): una positiva frente a varias negativas duras por grupo. Los grupos son 40.000 pares consulta→documento, con una mezcla de familias de consultas MESH (61 %) y AUTHORKW (39 %), igualando la distribución del benchmark de evaluación. Los negativos se extraen del propio espacio de recuperación (hard negatives minados), no de muestreo aleatorio, para que el modelo aprenda a ordenar por relevancia y no por topicalidad. Se entrenaron 2 épocas con un presupuesto de texto de 600 caracteres para la consulta y 900 para el documento, idéntico al de la ruta de inferencia. El entrenamiento se realizó en una única GPU NVIDIA L40S (`g6e.2xlarge`) durante 42,3 minutos con un coste aproximado de 1,70 USD. Todos los documentos de oro del benchmark fueron excluidos del entrenamiento como consultas, positivos y negativos.

## Capacidades

- Re-ranking de pares `(consulta, documento)` devolviendo un logit de relevancia, adecuado como segunda etapa sobre cualquier recuperador denso o híbrido.
- Búsqueda conceptual MeSH (Medical Subject Headings), con un rendimiento superior al del cross-encoder del NLM cuando se le entrega el mismo pool de candidatos (R@10 0.544 vs 0.525, p = 0.013).
- Soporte para corpus biomédico de preprints (bioRxiv y medRxiv) con 433.449 documentos indexados.
- Inferencia eficiente: 326 pares/s en una GPU A10G y una latencia p50 de 151 ms por consulta sobre 50 candidatos.
- Integración como drop-in con la librería `sentence-transformers` (clase `CrossEncoder`).
- Compatible con `text-embeddings-inference` (TEI) para despliegue en producción.
- Soporte de contexto largo nativo de 8.192 tokens, aunque el uso recomendado es de 256 tokens para el caso de uso de reranking.
- Capacidad de mejorar el rendimiento de cualquier recuperador aguas arriba: el techo del pool (R@50) del recuperador determina el límite superior recuperable.

## Casos de uso

- Búsqueda de literatura biomédica en preprints: el modelo permite reordenar los resultados de búsqueda sobre bioRxiv y medRxiv, de forma que los artículos más relevantes para una consulta concreta aparecen en las primeras posiciones. Se usaría como segunda etapa de un pipeline de recuperación densa o híbrida.
- Búsqueda conceptual por MeSH: para investigadores que buscan por encabezados de materia (subject headings), el modelo ofrece una ganancia del +14 % en R@1 respecto al recuperador solo (0.269 → 0.306), lo que facilita la localización de artículos sobre conceptos concretos.
- Sistemas RAG biomédicos: en una arquitectura de retrieval-augmented generation, el reranker puede reordenar los fragmentos recuperados antes de pasarlos al modelo generativo, mejorando la calidad de las respuestas con citas. Su latencia de 151 ms por consulta sobre 50 candidatos lo hace apto para servicios interactivos.
- Pipeline de búsqueda híbrida: se puede combinar con un recuperador basado en BM25 o FTS (como Postgres FTS) y un recuperador denso; el reranker fusiona y reordena los candidatos de ambas fuentes, superando a cualquiera de los recuperadores por separado.
- Monitorización de la literatura científica: para investigadores o bibliotecarios que necesitan revisar diariamente nuevos preprints relevantes a su campo, el modelo puede reordenar los resultados de una búsqueda programada y priorizar los documentos más pertinentes.
- Evaluación de sistemas de búsqueda: el modelo sirve como referencia para evaluar la calidad de recuperadores biomédicos, ya que proporciona una puntuación de relevancia fiable y consistente sobre el corpus de preprints, como demuestra su uso en el benchmark BioMed Eval.

## Benchmarks y rendimiento

Los benchmarks se han realizado sobre el conjunto de evaluación BioMed Eval (1.241 consultas MeSH retenidas, divididas por documento, con pools de candidatos recuperados sobre los 433.449 documentos del corpus). Las comparaciones son emparejadas con pruebas exactas de McNemar e intervalos de confianza bootstrap de 5.000 muestras.

**Efecto de la segunda etapa (mismo top-50, antes y después del reranker):**

| Métrica | Solo encoder (top-50) | + BioMed Reranker | Delta |
|---|---:|---:|---:|
| R@1 | 0.269 | **0.306** | +14 % |
| R@10 | 0.524 | **0.549** | +5 % |
| nDCG@10 | 0.388 | **0.419** | +8 % |

**Sistema completo de dos etapas (BioMed Encoder + BioMed Reranker) frente a alternativas:**

| Posición | Sistema | R@1 | R@10 | nDCG@10 |
|---:|---|---:|---:|---:|
| 1 | BioMed Encoder + BioMed Reranker | **0.306** | **0.549** | **0.419** |
| 2 | `ncbi/MedCPT` + `MedCPT-Cross-Encoder` (stack completo del NLM) | — | 0.525 | 0.405 |
| 3 | BioMed Encoder, solo recuperación | 0.269 | 0.524 | 0.388 |
| 4 | `allenai/specter2_base`, solo recuperación | 0.153 | 0.351 | 0.247 |
| 5 | `BAAI/bge-m3`, solo recuperación | 0.118 | 0.286 | 0.194 |
| 6 | Postgres FTS (búsqueda por palabras clave) | 0.047 | 0.081 | 0.063 |

**Comparativa directa con el cross-encoder del NLM:** entregado con el pool de candidatos de MedCPT, BioMed Reranker obtiene R@10 0.544 frente a 0.525 de `MedCPT-Cross-Encoder` (p = 0.013). Cabe destacar que `MedCPT-Cross-Encoder` funciona en modo zero-shot sobre preprints, mientras que sus datos de entrenamiento de PubMed solapan sustancialmente con el corpus.

**Techo del pool de candidatos (R@50 del recuperador, el máximo recuperable por cualquier reranker):**

| Pool | MeSH R@50 |
|---|---:|
| BioMed Encoder | **0.673** |
| `ncbi/MedCPT` | 0.624 |

## Requisitos de hardware

- VRAM estimada: con 149 M de parámetros y pesos en FP16, el modelo ocupa aproximadamente 0,6 GB en memoria. A 256 tokens de contexto, es viable en GPUs con 4 GB o menos de VRAM.
- GPU recomendadas: la inferencia se ha validado en una NVIDIA A10 (24 GB), con un throughput de 326 pares/s y una latencia p50 de 151 ms por consulta sobre 50 candidatos. También es viable en GPUs de consumo como RTX 3090, RTX 4090 o incluso RTX 3060 para uso en batch reducido.
- Entrenamiento: se realizó en una única NVIDIA L40S (instancia `g6e.2xlarge`) en 42,7 minutos con un coste de 1,70 USD.
- Opciones de despliegue: compatible con `sentence-transformers` (clase `CrossEncoder`), `text-embeddings-inference` (TEI) y servidores de reranking estándar. No se menciona soporte explícito para vLLM, llama.cpp ni Ollama en la información disponible.
- Throughput: 326 pares/s en una A10, lo que permite responder a búsquedas interactivas con un solo GPU de gama media.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Tipo | R@10 (conceptos MeSH) |
|---|---|---:|---|---:|---:|
| **NYSgpt/biomed-reranker** | 149 M | 8.192 (nativo) | Apache-2.0 | Cross-encoder | 0.549 (sobre pool propio) / 0.544 (sobre pool de MedCPT) |
| `ncbi/MedCPT-Cross-Encoder` | No disponible | No disponible | No disponible | Cross-encoder | 0.525 (sobre su propio pool) |
| `allenai/specter2-base` | No disponible | No disponible | No disponible | Retrieval (bi-encoder) | 0.351 (solo recuperación) |
| `BAAI/bge-m3` | No disponible | No disponible | No disponible | Retrieval (bi-encoder) | 0.286 (solo recuperación) |

La comparación más directa es con `ncbi/MedCPT-Cross-Encoder`, el cross-encoder oficial del NLM. BioMed Reranker lo supera en R@10 cuando ambos reciben el mismo pool de candidatos (0.544 vs 0.525, p = 0.013). Los otros dos modelos comparados son recuperadores de una sola etapa, no rerankers, y se incluyen para contextualizar el rendimiento del sistema completo de dos etapas.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente en inglés y sobre corpus de preprints biomédicos (bioRxiv y medRxiv). Su rendimiento fuera de este dominio no está validado y probablemente se degrade significativamente.
- La ventana de contexto nativa es de 8.192 tokens, pero el modelo se entrena y sirve a 256 tokens. El uso con contextos mucho mayores puede no mantener el rendimiento observado.
- El rendimiento está acotado por el techo del recuperador aguas: el R@50 del retriever determina el máximo recuperable. Un recuperador pobre limita la mejora que puede aportar el reranker.
- El modelo no es un generador de texto ni un modelo de razonamiento: solo produce un logit de relevancia por par `(consulta, documento)`.
- Los datos de entrenamiento de `MedCPT-Cross-Encoder` solapan sustancialmente con el corpus de preprints, lo que puede favorecer al comparador en ciertos escenarios; el benchmark de BioMed Reranker se ha construido para evitar solapamientos con sus propios datos de entrenamiento.
- La licencia Apache-2.0 permite uso comercial sin restricciones, pero no se proporciona ninguna garantía sobre el rendimiento en producción.
- El autor no publica información sobre sesgos específicos del modelo ni sobre su comportamiento con dominios fuera de la literatura biomédica.
- No se dispone de datos sobre cuantización (GGUF, int8, etc.) ni sobre su rendimiento en formatos cuantizados.

## Enlaces

- [Modelo en Hugging Face: NYSgpt/biomed-reranker](https://huggingface.co/NYSgpt/biomed-reranker)
- [Colección BioMed en Hugging Face](https://huggingface.co/collections/NYSgpt/biomed-6a888bc1dc1f1a24ba2876b5)
- [BioMed Encoder (primera etapa)](https://huggingface.co/NYSgpt/biomed-encoder)
- [Dataset de evaluación BioMed Eval](https://huggingface.co/datasets/NYSgpt/biomed-eval)
- [Modelo base: Alibaba-NLP/gte-reranker-modernbert-base](https://huggingface.co/Alibaba-NLP/gte-reranker-modernbert-base)
- [Perfil del autor en Hugging Face](https://huggingface.co/NYSgpt)
