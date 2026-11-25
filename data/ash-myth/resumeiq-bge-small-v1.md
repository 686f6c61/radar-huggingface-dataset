# ash-myth/resumeiq-bge-small-v1

## Resumen

`ash-myth/resumeiq-bge-small-v1` es un modelo de embeddings de frases (bi-encoder) obtenido mediante ajuste fino contrastivo del modelo `BAAI/bge-small-en-v1.5`, que a su vez es una variante compacta de la familia BGE (BAAI General Embedding) basada en arquitectura BERT. Lo desarrolla el usuario `ash-myth` como componente de recuperación y ranking para un sistema propio denominado ResumeIQ, orientado a emparejar currículos (CV) con descripciones de puesto de trabajo (JD).

El problema que aborda es el de la similitud semántica en el dominio de reclutamiento: los embeddings genéricos no discriminan bien entre candidatos que encajan y candidatos que no, porque el vocabulario de CV y ofertas comparte mucha terminología superficial. El autor reporta una mejora sustancial en métricas de ranking tras el ajuste fino sobre el modelo base, lo que lo hace relevante para pipelines de cribado de candidaturas, búsqueda de talento y scoring de afinidad.

Se trata de un modelo muy pequeño (33,36 millones de parámetros, ~0,1 GB de repositorio), lo que permite desplegarlo en CPU o en GPUs de consumo con latencia baja. La información disponible es escasa: no hay datos publicados sobre idiomas soportados, longitud máxima de contexto efectiva, ni detalles sobre composición exacta del dataset de entrenamiento más allá de los nombres de los conjuntos de datos utilizados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo BERT (bi-encoder de sentence-transformers), derivado de BAAI/bge-small-en-v1.5 |
| Parametros totales | 33.360.000 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo base bge-small-en-v1.5 admite 512 tokens, dato no confirmado en la informacion proporcionada) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria sentence-transformers) |

## Arquitectura y entrenamiento

El modelo es un bi-encoder basado en BERT pequeño (12 capas, dimensión oculta 384 en la variante bge-small, dato del modelo base no confirmado explícitamente en la información proporcionada) que produce un vector denso por texto. Se entrena con la función de pérdida `MultipleNegativesRankingLoss`, habitual en recuperación densa: cada par positivo (CV, JD) se contrasta contra los negativos del resto del lote, y el autor indica el uso adicional de negativos duros (hard negatives).

El ajuste fino se realizó sobre 3.217 tripletas contrastivas, durante 3 épocas, con batch size 32 y learning rate 2e-05. Los datos provienen de tres conjuntos multi-dominio: `cnamuangtoun/resume-job-description-fit`, `facehuggerapoorv/resume-jd-match` y `netsol/resume-score-details`. No se especifica el número de tokens totales, la composición por dominio ni si hubo etapas adicionales de alineación o destilación.

## Capacidades

- Generación de embeddings de frases para similitud semántica y recuperación densa (pipeline `sentence-similarity`).
- Ranking de afinidad entre currículos y descripciones de puesto, con puntuación continua por similitud coseno.
- Clasificación binaria de encaje (fit / no-fit) derivada de un umbral sobre la similitud.
- Recuperación cross-domain: el autor reporta mejora en NDCG@5 y MRR sobre datos held-out multi-dominio.
- Compatible con Text Embeddings Inference (tag `text-embeddings-inference`) y con endpoints de Hugging Face (tag `endpoints_compatible`).
- Uso directo con la librería `sentence-transformers`.
- Soporte de tool calling: no disponible (no es un modelo generativo).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (los datasets de entrenamiento son en inglés, pero no se declara cobertura idiomática).
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Cribado automático de candidaturas: codificar cada CV y cada oferta con el modelo y ordenar candidatos por similitud coseno; el modelo está ajustado específicamente para esta tarea y reporta un margen coseno de 0,1003 entre "buen encaje" y "sin encaje".
- Búsqueda semántica de talento en un ATS: indexar todos los CV en una base vectorial y permitir consultas en lenguaje natural sobre descripciones de puesto, recuperando los perfiles más afines con NDCG@5 de 0,6072 en evaluación cross-domain.
- Recomendación bidireccional candidato-oferta: usar el mismo espacio de embeddings para sugerir ofertas a un candidato y candidatos a una oferta sin entrenar dos modelos separados.
- Filtrado previo en pipelines de reclutamiento a gran escala: al ser un modelo de 33 M de parámetros, permite procesar miles de pares CV-JD por minuto en CPU, actuando como primera etapa antes de un re-ranking más costoso.
- Deduplicación y agrupación de CV similares: calcular similitudes entre currículos para detectar perfiles duplicados o agrupar candidatos por familias de competencias.
- Scoring continuo de encaje para paneles de analítica de reclutamiento: el autor reporta una mejora de Spearman rho de -0,1334 a -0,0144, lo que indica que la señal de ordenación por puntuación continua sigue siendo débil y conviene calibrarla antes de usarla como score absoluto.
- Integración en servicios de inferencia de embeddings: al ser compatible con Text Embeddings Inference y endpoints de Hugging Face, puede desplegarse como microservicio HTTP que devuelva vectores para un motor de búsqueda vectorial (FAISS, Qdrant, pgvector).

## Benchmarks y rendimiento

Evaluación held-out multi-dominio publicada por el autor (modelo base frente a modelo ajustado):

| Metrica | Base bge-small-en-v1.5 | resumeiq-bge-small-v1 |
|---|---:|---:|
| ROC-AUC de encaje binario | 0,5384 | 0,7047 |
| PR-AUC de encaje binario | 0,3714 | 0,5173 |
| Margen coseno buen encaje vs sin encaje | 0,009 | 0,1003 |
| NDCG@5 de ranking cross-domain | 0,5149 | 0,6072 |
| MRR de ranking cross-domain | 0,4665 | 0,5235 |
| Spearman rho de score continuo | -0,1334 | -0,0144 |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks generativos en la informacion disponible; no aplican a un modelo de embeddings.

## Requisitos de hardware

- VRAM estimada para inferencia: por debajo de 1 GB en FP32 (33 M de parámetros a 4 bytes por parámetro ≈ 133 MB de pesos), más el overhead de activaciones y tokenizador.
- Cabe holgadamente en cualquier GPU de consumo (RTX 3060, RTX 4090, etc.) y también en CPU.
- GPU recomendadas: no requiere GPU dedicada; para alto throughput se puede usar cualquier GPU con al menos 2 GB de VRAM (T4, L4, A10, A100, H100).
- Despliegue: `sentence-transformers` en Python, Text Embeddings Inference (TEI) para servicio HTTP de alto rendimiento, y endpoints de Hugging Face. Compatibilidad con llama.cpp, Ollama o vLLM no disponible (no es un modelo generativo).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ash-myth/resumeiq-bge-small-v1 | 33,36 M | no disponible | Bi-encoder ajustado para CV-JD | apache-2.0 | Hugging Face |
| BAAI/bge-small-en-v1.5 | no disponible en la informacion proporcionada | no disponible | Bi-encoder generalista | no disponible en la informacion proporcionada | Hugging Face |
| all-MiniLM-L6-v2 (referencia de la categoria) | no disponible en la informacion proporcionada | no disponible | Bi-encoder generalista compacto | no disponible en la informacion proporcionada | Hugging Face |

La comparación cuantitativa directa solo está disponible frente a su modelo base, según la tabla de evaluación del autor. No se han publicado comparaciones con otros modelos de ranking de CV en la informacion disponible.

## Limitaciones y advertencias

- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; no hay validación independiente de las métricas reportadas por el autor.
- El Spearman rho del score continuo sigue siendo muy bajo (-0,0144), lo que indica que la puntuación de similitud no ordena bien la calidad del encaje de forma monótona; es más fiable como clasificador binario con umbral que como score calibrado.
- El entrenamiento se realizó sobre solo 3.217 tripletas y 3 épocas; el riesgo de sobreajuste a los dominios de los datasets utilizados es alto.
- No se declaran idiomas soportados; los datasets de entrenamiento son en inglés, por lo que el rendimiento en castellano no está garantizado.
- No se especifica la longitud máxima de secuencia efectiva; los CV largos pueden truncarse si se supera el límite del tokenizador del modelo base.
- Riesgo de sesgo: los datasets de reclutamiento pueden contener sesgos demográficos o de género que el ajuste fino hereda y amplifica; no se documenta ninguna mitigación.
- Riesgo de alucinación: no aplica en sentido generativo, pero el modelo puede producir similitudes altas espurias por solapamiento léxico superficial.
- Licencia apache-2.0: permite uso comercial, pero el autor no ofrece garantías ni soporte; conviene verificar las licencias de los datasets de entrenamiento antes de un despliegue en producción.
- El modelo no genera texto ni razona; cualquier caso de uso que requiera explicaciones o justificaciones necesita un modelo generativo adicional.

## Enlaces

- Hugging Face: https://huggingface.co/ash-myth/resumeiq-bge-small-v1
- Modelo base: https://huggingface.co/BAAI/bge-small-en-v1.5
- Dataset 1: https://huggingface.co/datasets/cnamuangtoun/resume-job-description-fit
- Dataset 2: https://huggingface.co/datasets/facehuggerapoorv/resume-jd-match
- Dataset 3: https://huggingface.co/datasets/netsol/resume-score-details
- Libreria sentence-transformers: https://www.sbert.net/
- Paper de MultipleNegativesRankingLoss (Sentence-BERT): https://arxiv.org/abs/1908.10084
