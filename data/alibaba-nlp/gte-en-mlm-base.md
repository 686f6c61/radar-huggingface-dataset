# Alibaba-NLP/gte-en-mlm-base

## Resumen

gte-en-mlm-base es un modelo de lenguaje bidireccional (encoder) especializado en masked language modeling (MLM) para inglés, desarrollado por el Institute for Intelligent Computing de Alibaba Group. Forma parte de la familia GTE-v1.5, presentada en el paper mGTE, que introduce una serie de encoders, modelos de embedding y rerankers con longitud de contexto de hasta 8192 tokens. Este modelo concreto corresponde a la variante `GTEv1.5-en-MLM-base-8192` descrita en la tabla 13 del paper.

El modelo emplea una arquitectura transformer++ encoder (BERT + RoPE + GLU) con el vocabulario de `bert-base-uncased`, y cuenta con 137.398.848 parámetros reales según los pesos en safetensors. Su principal valor diferencial frente a BERT-base y variantes como MosaicBERT o nomic-bert es la ventana de contexto extendida a 8192 tokens, manteniendo un rendimiento en GLUE de 85.61, competitivo con encoders de tamaño similar pero con contextos mucho menores (128 a 2048 tokens).

Es relevante ahora porque sirve como base sólida para fine-tuning en tareas de retrieval, incluyendo el entrenamiento con `sentence_transformers.SparseEncoder`, y porque desde `transformers>=5.18.0` funciona de forma nativa sin necesidad de `trust_remote_code=True`, lo que simplifica su integración en pipelines de producción. Su licencia Apache 2.0 facilita el uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer++ encoder (BERT + RoPE + GLU), bidireccional |
| Parametros totales | 137.398.848 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8192 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un encoder transformer bidireccional basado en el backbone transformer++ que combina la estructura de BERT con RoPE (Rotary Position Embeddings) y GLU (Gated Linear Units), según la implementación de referencia `Alibaba-NLP/new-impl`. Utiliza el vocabulario de `bert-base-uncased`. La tarea de entrenamiento es masked language modeling (MLM) sobre el dataset `allenai/c4` en su partición inglesa (`c4-en`).

Para alcanzar el contexto de 8192 tokens se empleó una estrategia de entrenamiento multi-etapa. Primero se realiza un preentrenamiento MLM preliminar a longitudes más cortas: MLM-2048 con learning rate 5e-4, `mlm_probability` 0.3, batch size 4096, 70.000 pasos y `rope_base` 10000. Después se remuestrean los datos reduciendo la proporción de textos cortos y se continúa el preentrenamiento MLM a 8192: learning rate 5e-5, `mlm_probability` 0.3, batch size 1024, 20.000 pasos y `rope_base` 500000. No se documenta en la información disponible el uso de RLHF, DPO ni datos de instrucciones.

## Capacidades

- Masked language modeling (fill-mask) en inglés: predice tokens enmascarados en una secuencia.
- Codificación de texto bidireccional para representaciones contextuales de hasta 8192 tokens.
- Base para fine-tuning en tareas de retrieval y ranking, incluyendo `sentence_transformers.SparseEncoder`.
- Procesamiento de documentos largos gracias a su ventana de contexto extendida.
- Compatibilidad nativa con `transformers>=5.18.0` mediante `AutoModelForMaskedLM`.
- No soporta tool calling, function calling, agentes ni razonamiento multi-step (no es un modelo generativo de instrucciones).
- No dispone de capacidades de visión, audio ni modo thinking.
- Capacidad multilingüe limitada: solo inglés.

## Casos de uso

- Recuperación de información (retrieval) en inglés: el modelo sirve como encoder base para fine-tuning con `SparseEncoder` u otras cabeceras de retrieval, aprovechando su contexto de 8192 tokens para indexar y comparar pasajes largos sin truncamiento agresivo.
- Reranking de documentos: tras un primer filtrado, puede afinarse para puntuar la relevancia entre consulta y documento en pipelines de búsqueda, con la ventaja de procesar documentos extensos completos.
- Clasificación de textos largos: fine-tuning sobre la representación del token `[CLS]` o pooling para tareas como clasificación de documentos legales, artículos científicos o informes técnicos que superan los límites de BERT-base (512 tokens).
- Extracción de entidades y etiquetado de secuencias: fine-tuning como modelo base para NER o POS tagging en inglés, beneficiándose de las representaciones contextuales bidireccionales.
- Preentrenamiento continuado en dominio: al ser un modelo MLM con licencia Apache 2.0, puede usarse como punto de partida para adaptar el encoder a vocabulario o jerga de un dominio específico (biomédico, financiero, legal) mediante MLM adicional.
- Filtrado y deduplicación de corpus: uso de las representaciones del encoder para detectar similitud semántica entre documentos largos en tareas de curación de datos.
- Evaluación de calidad lingüística: la cabeza MLM permite puntuar la fluidez o probabilidad de secuencias en inglés para control de calidad de textos generados o traducidos.

## Benchmarks y rendimiento

| Modelo | Idioma | Parametros | Longitud maxima | GLUE | XTREME-R |
|---|---|---|---|---|---|
| gte-multilingual-mlm-base | Multiple | 306M | 8192 | 83.47 | 64.44 |
| **gte-en-mlm-base** | Inglés | 137M | 8192 | **85.61** | - |
| gte-en-mlm-large | Inglés | 435M | 8192 | 87.58 | - |
| MosaicBERT-base | Inglés | 137M | 128 | 85.4 | - |
| MosaicBERT-base-2048 | Inglés | 137M | 2048 | 85 | - |
| JinaBERT-base | Inglés | 137M | 512 | 85 | - |
| nomic-bert-2048 | Inglés | 137M | 2048 | 84 | - |
| MosaicBERT-large | Inglés | 434M | 128 | 86.1 | - |
| JinaBERT-large | Inglés | 434M | 512 | 83.7 | - |
| XLM-R-base | Multiple | 279M | 512 | 80.44 | 62.02 |
| RoBERTa-base | Inglés | 125M | 512 | 86.4 | - |
| RoBERTa-large | Inglés | 355M | 512 | 88.9 | - |

No se han publicado en la información disponible resultados de benchmarks específicos de tareas como MMLU, HumanEval o GSM8K, ya que el modelo no es generativo.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,55 GB en fp32 (137M parámetros × 4 bytes), en torno a 0,27 GB en fp16/bf16 y menos de 0,15 GB en cuantización de 8 bits. Cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; funciona en RTX 3060, RTX 4090, A100, H100 y también en CPU para lotes pequeños.
- Cabe en GPU consumer: sí, en todas las GPU modernas e incluso en iGPU con suficiente memoria compartida.
- Opciones de despliegue: `transformers` (nativo desde la versión 5.18.0), `sentence-transformers` para fine-tuning de retrieval, y exportación a ONNX. No se documenta soporte específico para vLLM o TGI, orientados a modelos generativos.
- Latencia y throughput estimados: no disponibles en la información proporcionada. Al ser un encoder de 137M parámetros, se espera un throughput alto en GPU modernas, pero no se aportan cifras concretas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | GLUE | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| gte-en-mlm-base | 137M | 8192 | 85.61 | Apache 2.0 | Hugging Face |
| RoBERTa-base | 125M | 512 | 86.4 | MIT | Hugging Face |
| MosaicBERT-base-2048 | 137M | 2048 | 85 | Apache 2.0 | Hugging Face |
| nomic-bert-2048 | 137M | 2048 | 84 | Apache 2.0 | Hugging Face |

Frente a RoBERTa-base, gte-en-mlm-base ofrece un contexto 16 veces mayor (8192 vs. 512) a costa de una diferencia mínima en GLUE (85.61 vs. 86.4). Frente a MosaicBERT-base-2048 y nomic-bert-2048, cuadruplica la ventana de contexto manteniendo o superando el rendimiento en GLUE. La licencia Apache 2.0 es más permisiva que la MIT en cuanto a cláusulas de patentes.

## Limitaciones y advertencias

- Solo soporta inglés; no está entrenado para otros idiomas.
- Es un modelo MLM, no un modelo generativo de instrucciones: no responde a prompts conversacionales ni sigue instrucciones.
- Riesgo de alucinación no aplica en el sentido generativo, pero las predicciones fill-mask pueden ser lingüísticamente plausibles y factualmente incorrectas.
- Sesgos: al entrenarse sobre `c4-en`, puede heredar sesgos presentes en la web en inglés (género, raza, nacionalidad, etc.).
- Aunque soporta 8192 tokens, el rendimiento en contextos muy largos puede degradarse; el paper no detalla evaluaciones específicas por longitud más allá de la media GLUE.
- Para versiones de `transformers` anteriores a 5.18.0 es necesario fijar `revision="5d8e84a"` y usar `trust_remote_code=True`, lo que introduce dependencia de código remoto.
- Licencia Apache 2.0 permite uso comercial, pero conviene revisar las cláusulas de patentes y atribución.
- No se documentan tipos de cuantización soportados ni métricas de latencia/throughput, lo que limita la planificación de despliegues de alto rendimiento sin pruebas propias.

## Enlaces

- [Hugging Face: Alibaba-NLP/gte-en-mlm-base](https://huggingface.co/Alibaba-NLP/gte-en-mlm-base)
- [Paper mGTE (arXiv:2407.19669)](https://arxiv.org/abs/2407.19669)
- [Paper en PDF](https://arxiv.org/pdf/2407.19669)
- [Implementación de referencia new-impl](https://huggingface.co/Alibaba-NLP/new-impl)
- [Modelo gte-multilingual-mlm-base](https://huggingface.co/Alibaba-NLP/gte-multilingual-mlm-base)
- [Modelo gte-en-mlm-large](https://huggingface.co/Alibaba-NLP/gte-en-mlm-large)
- [Configuración nativa: tomaarsen/gte-en-mlm-base-native](https://huggingface.co/tomaarsen/gte-en-mlm-base-native)
- [PR de implementación nativa en transformers](https://github.com/huggingface/transformers/pull/48416)
- [Documentación de SparseEncoder en sentence-transformers](https://sbert.net/docs/sparse_encoder/training_overview.html)
- [Dataset allenai/c4](https://huggingface.co/datasets/allenai/c4)
