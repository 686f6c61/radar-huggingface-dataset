# Alibaba-NLP/gte-multilingual-mlm-base

## Resumen

`gte-multilingual-mlm-base` es un modelo de lenguaje bidireccional (encoder) desarrollado por el Institute for Intelligent Computing de Alibaba Group, presentado en el artículo mGTE (arXiv:2407.19669). Se trata del componente base de la familia mGTE, un conjunto de encoders, modelos de embedding y rerankers multilingües diseñados para recuperación de información en 75 idiomas con una longitud de contexto de hasta 8192 tokens. El modelo aquí descrito es específicamente el checkpoint de masked language modeling (MLM), es decir, la columna vertebral preentrenada que sirve como base tanto para tareas de entendimiento de lenguaje natural como para el ajuste fino orientado a retrieval.

La relevancia del modelo radica en dos factores. Por un lado, sustituye el backbone clásico de XLM-R (transformer estándar con embeddings posicionales aprendidos y contexto de 512 tokens) por lo que los autores denominan transformer++ encoder: una arquitectura BERT con RoPE, GLU y normalización pre-LN, manteniendo el vocabulario de XLM-R. Por otro lado, extiende el contexto de 512 a 8192 tokens mediante entrenamiento multietapa, lo que habilita aplicaciones de recuperación sobre documentos largos sin truncamiento agresivo. Con 306 millones de parámetros, supera a XLM-R-base tanto en GLUE (83,47 frente a 80,44) como en XTREME-R (64,44 frente a 62,02).

El modelo se distribuye con licencia Apache 2.0 y, desde la versión 5.18.0 de `transformers`, funciona de forma nativa sin necesidad de `trust_remote_code=True`. Es un modelo de encoder, no un generador: su pipeline es `fill-mask` y su uso principal es como base para clasificación, NER, extracción de características y, especialmente, ajuste fino para embeddings y reranking multilingüe.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer bidireccional (encoder) tipo transformer++ (BERT + RoPE + GLU) |
| Parametros totales | 306.210.496 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 8192 tokens |
| Tipos de cuantizacion | No disponible (el repositorio solo publica pesos safetensors en fp32/fp16; no se documentan cuantizaciones oficiales) |
| Idiomas soportados | 75 idiomas (af, ar, az, be, bg, bn, ca, ceb, cs, cy, da, de, el, en, es, et, eu, fa, fi, fr, gl, gu, he, hi, hr, ht, hu, hy, id, is, it, ja, jv, ka, kk, km, kn, ko, ky, lo, lt, lv, mk, ml, mn, mr, ms, my, ne, nl, no, pa, pl, pt, qu, ro, ru, si, sk, sl, so, sq, sr, sv, sw, ta, te, th, tl, tr, uk, ur, vi, yo, zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (también compatible con `transformers`; no se publican GGUF ni ONNX oficiales) |

## Arquitectura y entrenamiento

El modelo emplea un encoder bidireccional basado en la implementación `Alibaba-NLP/new-impl`, que combina el esquema de BERT con mejoras propias de los transformers modernos: rotary position embeddings (RoPE) en lugar de embeddings posicionales absolutos aprendidos, gated linear units (GLU) en las capas feed-forward y normalización previa a la atención. El vocabulario es el de XLM-R, lo que facilita la reutilización de tokenizadores y comparaciones directas con la familia XLM-R. El tamaño es de 306M parámetros, comparable a XLM-R-base (279M), pero con un contexto efectivo 16 veces mayor.

El entrenamiento es de tipo masked language modeling (MLM) puro, sin RLHF ni DPO, ya que no es un modelo generativo. Los datos proceden de `c4-en`, `mc4`, `Skywork/SkyPile-150B`, `Wikipedia` y `uonlp/CulturaX`, entre otras fuentes detalladas en el apéndice A.1 del paper. La estrategia de entrenamiento es multietapa para alcanzar los 8192 tokens de contexto: una primera fase MLM-2048 con learning rate 2e-4, probabilidad de máscara 0,3, batch size 8192, 250.000 pasos y `rope_base` 10000; seguida de una fase MLM-8192 con learning rate 5e-5, probabilidad de máscara 0,3, batch size 2048, 30.000 pasos y `rope_base` 160000. En la segunda fase se remuestrean los datos reduciendo la proporción de textos cortos, lo que evita que el modelo pierda capacidad en secuencias largas por sesgo hacia documentos breves.

## Capacidades

- Masked language modeling multilingüe en 75 idiomas, con especial cobertura de lenguas de bajos recursos (cebuano, javanés, yoruba, quichua, etc.).
- Extracción de representaciones contextuales de tokens y frases, apta para clasificación de secuencias, etiquetado NER, análisis de sentimiento y QA extractivo.
- Procesamiento de documentos largos de hasta 8192 tokens en una sola pasada, sin truncamiento ni chunking obligatorio.
- Base para ajuste fino de modelos de embedding y reranking (la familia mGTE incluye variantes específicas para retrieval).
- Compatibilidad con `sentence_transformers.SparseEncoder` para ajuste fino de recuperación dispersa.
- No soporta generación de texto, tool calling, agentes ni razonamiento multi-paso: es un encoder, no un decoder.
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Recuperación de información multilingüe: ajustando el modelo con `SparseEncoder` o como backbone de un bi-encoder, se pueden construir índices de búsqueda semántica sobre corpus en 75 idiomas con documentos de hasta 8192 tokens, evitando el truncamiento a 512 que impone XLM-R.
- Clasificación de documentos largos: contratos, informes o artículos periodísticos que superan los 2000 tokens se pueden clasificar (categoría temática, sentimiento, toxicidad) en una sola pasada gracias al contexto extendido.
- Extracción de entidades nombradas (NER) multilingüe: el modelo sirve como backbone para fine-tuning con `AutoModelForTokenClassification`, cubriendo idiomas europeos, asiáticos y africanos con un único checkpoint.
- Reranking de resultados de búsqueda: ajustando una cabeza de clasificación sobre pares (query, documento), el modelo puede reordenar candidatos recuperados por un sistema léxico o denso, aprovechando el contexto largo para pares query-documento extensos.
- Moderación de contenido en plataformas globales: clasificación de textos en decenas de idiomas con un solo modelo, reduciendo la necesidad de mantener pipelines por lengua.
- Análisis de reseñas y feedback de clientes: extracción de aspectos y sentimiento en múltiples idiomas para paneles de analítica, usando el modelo como encoder congelado y una cabeza ligera entrenada por tarea.
- Base para investigación en NLP multilingüe: punto de partida para experimentos de transferencia cross-lingual y evaluación en XTREME-R, con la ventaja de un contexto 16 veces mayor que XLM-R.

## Benchmarks y rendimiento

| Modelo | Idioma | Parametros | Contexto max. | GLUE | XTREME-R |
|---|---|---|---|---|---|
| gte-multilingual-mlm-base | Multiple | 306M | 8192 | 83,47 | 64,44 |
| gte-en-mlm-base | Ingles | No disponible | 8192 | 85,61 | No disponible |
| gte-en-mlm-large | Ingles | No disponible | 8192 | 87,58 | No disponible |
| XLM-R-base | Multiple | 279M | 512 | 80,44 | 62,02 |
| MosaicBERT-base | Ingles | 137M | 128 | 85,4 | No disponible |
| MosaicBERT-base-2048 | Ingles | 137M | 2048 | 85 | No disponible |
| JinaBERT-base | Ingles | 137M | 512 | 85 | No disponible |
| nomic-bert-2048 | Ingles | 137M | 2048 | 84 | No disponible |
| MosaicBERT-large | Ingles | 434M | 128 | 86,1 | No disponible |
| JinaBERT-large | Ingles | 434M | 512 | 83,7 | No disponible |
| RoBERTa-base | Ingles | 125M | 512 | 86,4 | No disponible |
| RoBERTa-large | Ingles | 355M | 512 | 88,9 | No disponible |

Los datos proceden de la model card y del paper mGTE. No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K) en la información disponible, ya que no son aplicables a un encoder de MLM.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,2 GB en fp32 (306M parámetros × 4 bytes) y unos 0,6 GB en fp16/bf16. El repositorio ocupa 0,6 GB en safetensors.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente. Una RTX 3060 (12 GB), RTX 4060 (8 GB) o RTX 4090 (24 GB) pueden ejecutar el modelo con holgura, incluso con batches grandes y secuencias de 8192 tokens.
- Cabe en GPU consumer: sí, en cualquier GPU con al menos 4 GB de VRAM para inferencia en fp16 con batch pequeño; para fine-tuning con secuencias de 8192 tokens se recomienda al menos 16 GB (RTX 4080, RTX 4090, A100 40 GB).
- Opciones de despliegue: `transformers` (nativo desde la versión 5.18.0, sin `trust_remote_code`; para versiones anteriores, fijar `revision="b747c5e"` con `trust_remote_code=True`), `sentence-transformers` para embeddings, `SparseEncoder` para recuperación dispersa, y servidores de inferencia compatibles con `transformers` como TGI o vLLM (aunque vLLM está optimizado para decoders generativos; para encoders conviene usar TGI o un servidor FastAPI con batching dinámico).
- Latencia y throughput estimados: no disponibles en la información proporcionada. Como referencia orientativa, un encoder de 306M en una RTX 4090 procesa secuencias de 512 tokens en el orden de milisegundos por batch, pero no se han publicado cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | GLUE | XTREME-R | Licencia |
|---|---|---|---|---|---|---|
| gte-multilingual-mlm-base | 306M | 8192 | 75 | 83,47 | 64,44 | Apache 2.0 |
| XLM-R-base | 279M | 512 | 100 | 80,44 | 62,02 | MIT |
| RoBERTa-base | 125M | 512 | 1 (inglés) | 86,4 | No disponible | MIT |
| MosaicBERT-base-2048 | 137M | 2048 | 1 (inglés) | 85 | No disponible | Apache 2.0 |

Frente a XLM-R-base, el modelo de Alibaba ofrece +3,03 puntos en GLUE y +2,42 en XTREME-R con un contexto 16 veces mayor, al coste de 27M parámetros adicionales. Frente a RoBERTa-base, el modelo multilingüe pierde 2,93 puntos en GLUE (esperable, ya que RoBERTa se evalúa solo en inglés) pero cubre 75 idiomas y 8192 tokens de contexto. Frente a MosaicBERT-base-2048, pierde 1,53 puntos en GLUE pero multiplica por cuatro el contexto y cubre decenas de idiomas adicionales.

## Limitaciones y advertencias

- Es un modelo de encoder y MLM: no genera texto coherente ni mantiene conversaciones. No debe usarse como chatbot ni como modelo de instrucciones.
- Riesgo de alucinación: bajo en el sentido generativo, pero el modelo puede producir predicciones de máscara plausibles y erróneas en contextos ambiguos; en tareas downstream, la calibración depende del fine-tuning.
- Sesgos: al entrenarse con C4, mC4, CulturaX y Wikipedia, hereda sesgos de género, nacionalidad y representación lingüística de esas fuentes. Los idiomas con menos datos en el corpus (yoruba, quichua, cebuano) pueden rendir peor que los mayoritarios.
- Limitación de contexto: aunque soporta 8192 tokens, el rendimiento en secuencias muy largas puede degradarse si el fine-tuning downstream se hace con secuencias cortas; conviene mantener la distribución de longitudes durante el ajuste.
- Restricciones de licencia: Apache 2.0 permite uso comercial sin restricciones adicionales, pero el usuario debe verificar las licencias de los datasets de entrenamiento subyacentes si redistribuye derivados.
- Caveat de producción: para `transformers<5.18.0` es necesario fijar `revision="b747c5e"` y `trust_remote_code=True`; usar la revisión `main` con versiones antiguas puede fallar. Además, el tokenizador es el de XLM-R, con vocabulario de 250k tokens, lo que infla el tamaño del embedding y el coste de memoria en comparación con tokenizadores más compactos.
- No se publican cuantizaciones oficiales (GGUF, ONNX, AWQ); para despliegue en CPU o entornos con poca memoria hay que generarlas manualmente.

## Enlaces

- Hugging Face: https://huggingface.co/Alibaba-NLP/gte-multilingual-mlm-base
- Paper mGTE: https://arxiv.org/pdf/2407.19669
- Repositorio de la implementación transformer++: https://huggingface.co/Alibaba-NLP/new-impl
- Modelo relacionado (inglés base): https://huggingface.co/Alibaba-NLP/gte-en-mlm-base
- Modelo relacionado (inglés large): https://huggingface.co/Alibaba-NLP/gte-en-mlm-large
- Configuración nativa en transformers: https://huggingface.co/tomaarsen/gte-multilingual-mlm-base-native
- PR de implementación nativa GTE en transformers: https://github.com/huggingface/transformers/pull/48416
- Documentación de SparseEncoder: https://sbert.net/docs/sparse_encoder/training_overview.html
- XLM-R-base (comparativa): https://huggingface.co/FacebookAI/xlm-roberta-base
- RoBERTa-base (comparativa): https://huggingface.co/FacebookAI/roberta-base
- RoBERTa-large (comparativa): https://huggingface.co/FacebookAI/roberta-large
- MosaicBERT-base (comparativa): https://huggingface.co/mosaicml/mosaic-bert-base
- MosaicBERT-base-2048 (comparativa): https://huggingface.co/mosaicml/mosaic-bert-base-seqlen-2048
- nomic-bert-2048 (comparativa): https://huggingface.co/nomic-ai/nomic-bert-2048
