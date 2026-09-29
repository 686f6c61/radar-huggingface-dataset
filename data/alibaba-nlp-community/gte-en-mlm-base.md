# alibaba-nlp-community/gte-en-mlm-base

## Resumen

`gte-en-mlm-base` es un codificador de texto (text encoder) en inglés desarrollado por el Institute for Intelligent Computing de Alibaba Group, publicado dentro de la familia GTE-v1.5. Se trata de un modelo de tipo masked language modeling (MLM) con 137.398.848 parámetros, etiquetado con pipeline `fill-mask`, que sirve como backbone para tareas de representación de texto y reranking. No es un modelo generativo: su función es producir representaciones contextuales de secuencias y resolver tareas de enmascarado de tokens.

La relevancia principal del modelo reside en su ventana de contexto de 8192 tokens, muy superior a los 512 tokens típicos de BERT y RoBERTa, gracias a la inclusión de RoPE (Rotary Position Embeddings) y a una estrategia de entrenamiento multietapa. Está construido sobre el backbone transformer++ (BERT + RoPE + GLU) y reutiliza el vocabulario de `bert-base-uncased`, lo que facilita su integración en infraestructuras ya existentes.

Este repositorio concreto, `alibaba-nlp-community/gte-en-mlm-base`, es una conversión del original `Alibaba-NLP/gte-en-mlm-base`: los pesos son idénticos y solo se ha modificado el `config.json` para que el modelo cargue de forma nativa en Transformers sin necesidad de `trust_remote_code`. Está liberado bajo licencia Apache 2.0 y en formato safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo BERT con RoPE y GLU (backbone transformer++) |
| Parametros totales | 137.398.848 (~137M) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 8192 tokens |
| Tipos de cuantizacion | No disponible de forma oficial; al ser safetensors en FP32/BF16 es convertible a INT8 y 4-bit con herramientas estándar |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

El modelo es un codificador transformer de tipo BERT enmascarado, denominado internamente `GTEv1.5-en-MLM-base-8192`. Sobre la arquitectura BERT clásica se incorporan dos modificaciones: Rotary Position Embeddings (RoPE) en lugar de embeddings posicionales aprendidos, y capas GLU (Gated Linear Units). Esta combinación, referida por los autores como backbone transformer++ (implementado en `Alibaba-NLP/new-impl`), es la que permite extender la ventana de contexto hasta 8192 tokens. El vocabulario es el de `bert-base-uncased`.

El entrenamiento utiliza únicamente masked language modeling sobre el corpus `c4-en` (allenai/c4 en inglés), sin fases de RLHF ni DPO, ya que no es un modelo generativo. Los autores aplican una estrategia multietapa para alcanzar el contexto largo: primero un preentrenamiento MLM a longitudes cortas (MLM-2048, lr 5e-4, mlm_probability 0.3, batch_size 4096, 70.000 pasos, rope_base 10000) y después un remuestreo de los datos que reduce la proporción de textos cortos y continúa el entrenamiento MLM a longitud completa (MLM-8192, lr 5e-5, mlm_probability 0.3, batch_size 1024, 20.000 pasos, rope_base 500000).

## Capacidades

- Enmascarado de tokens (fill-mask) sobre texto en inglés: predice tokens ocultos en una secuencia, con soporte de contexto de hasta 8192 tokens.
- Extracción de representaciones contextuales de texto: las activaciones del encoder sirven como embeddings para búsqueda semántica, clasificación, clustering y reranking (la variante de embeddings/reranking se construye sobre este backbone).
- Clasificación de secuencias mediante fine-tuning: el modelo es un backbone apto para tareas tipo GLUE (entailment, similitud, sentimiento, etc.).
- Comprensión de contexto largo en inglés: permite procesar documentos extensos (informes, artículos, contratos) sin truncar.
- Tokenization compatible con `bert-base-uncased`, lo que simplifica la reutilización de pipelines existentes.
- No soporta tool calling ni function calling: no es un modelo de instrucciones.
- No tiene soporte de agentes ni razonamiento multi-step: es un encoder MLM, no un modelo de chat/generación.
- No dispone de modo "thinking", visión ni audio.
- Multilingüismo: no soportado (solo inglés; para multilingüe existe `gte-multilingual-mlm-base`).

## Casos de uso

- Búsqueda semántica y recuperación de documentos: usando las representaciones del encoder como embeddings, puede indexar documentos largos en inglés sin truncar gracias a los 8192 tokens, útil en motores de búsqueda interna o RAG sobre corpus extensos.
- Fine-tuning para clasificación de texto: se puede añadir una cabeza de clasificación para tareas de análisis de sentimiento, detección de temas o categorización de tickets, aprovechando su rendimiento GLUE de 85.61.
- Reranking de resultados de búsqueda: como backbone para un cross-encoder de reranking en inglés, reevaluando la relevancia de pares consulta-documento con contexto largo.
- Análisis de documentos largos: contratos, artículos científicos o informes legales en inglés que superan los límites habituales de 512 tokens de BERT/RoBERTa.
- Preentrenamiento de dominio y adaptación: al ser un modelo MLM, sirve como base para continuar el preentrenamiento con texto especializado (biomédico, legal, financiero) y generar después un encoder específico de dominio.
- Similitud semántica y deduplicación: cálculo de similitud entre pares de oraciones o detección de contenido duplicado en grandes volúmenes de texto inglés.
- Clustering y exploración de corpus: agrupación de grandes colecciones de documentos por temática usando embeddings del encoder.

## Benchmarks y rendimiento

Resultados publicados en la model card (GLUE), comparados con otros encoders de tamaño similar:

| Modelo | Idioma | Parametros | Longitud max. seq. | GLUE | XTREME-R |
|---|---|---|---|---|---|
| gte-en-mlm-base | Inglés | 137M | 8192 | 85,61 | No disponible |
| gte-en-mlm-large | Inglés | 435M | 8192 | 87,58 | No disponible |
| gte-multilingual-mlm-base | Multiples | 306M | 8192 | 83,47 | 64,44 |
| MosaicBERT-base | Inglés | 137M | 128 | 85,4 | No disponible |
| MosaicBERT-base-2048 | Inglés | 137M | 2048 | 85 | No disponible |
| nomic-bert-2048 | Inglés | 137M | 2048 | 84 | No disponible |
| JinaBERT-base | Inglés | 137M | 512 | 85 | No disponible |
| RoBERTa-base | Inglés | 125M | 512 | 86,4 | No disponible |
| RoBERTa-large | Inglés | 355M | 512 | 88,9 | No disponible |
| XLM-R-base | Multiples | 279M | 512 | 80,44 | 62,02 |

No se han publicado resultados de XTREME-R para este modelo concreto en la informacion disponible. No se dispone de datos de MMLU, HumanEval ni GSM8K, ya que no es un modelo generativo.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos): ~550 MB en FP32, ~275 MB en FP16/BF16, ~137 MB en INT8 y ~70 MB en 4-bit.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; por ejemplo, GTX 1650, RTX 3060, RTX 4090 o superiores. También cabe holgadamente en GPUs de datacenter (A100, H100) para despliegues de gran volumen.
- Cabe en GPU consumer: sí, en la práctica totalidad de GPU con al menos 2 GB de VRAM, incluso en configuraciones antiguas.
- Ejecución en CPU: viable para inferencia individual o lotes pequeños, dado el tamaño reducido del modelo.
- Opciones de despliegue: carga nativa en Transformers (sin `trust_remote_code`), exportación a ONNX, integración en servidores de embeddings y uso como backbone en frameworks de sentence-transformers para tareas de representación.
- Latencia y throughput estimados: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | GLUE | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| gte-en-mlm-base | 137M | 8192 | 85,61 | Apache 2.0 | Safetensors | HuggingFace |
| MosaicBERT-base-2048 | 137M | 2048 | 85 | Apache 2.0 | Safetensors | HuggingFace |
| nomic-bert-2048 | 137M | 2048 | 84 | Apache 2.0 | Safetensors | HuggingFace |
| RoBERTa-base | 125M | 512 | 86,4 | MIT | Safetensors/PyTorch | HuggingFace |

La ventaja diferencial de `gte-en-mlm-base` es su contexto de 8192 tokens manteniendo un rendimiento GLUE competitivo con encoders de tamaño equivalente. RoBERTa-base obtiene un GLUE ligeramente superior (86,4 frente a 85,61) pero con un contexto ocho veces menor (512 frente a 8192). Frente a MosaicBERT y nomic-bert, el modelo de Alibaba ofrece mayor contexto y mejor puntuación GLUE con el mismo número de parámetros.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan análisis de sesgo específicos; al entrenarse sobre `c4-en`, puede heredar sesgos presentes en texto web en inglés.
- Riesgo de alucinación: no aplica en el sentido generativo, ya que no produce texto libre; en fill-mask las predicciones pueden ser incorrectas o reflejar sesgos del corpus.
- Limitación de idioma: solo inglés. No debe usarse para tareas multilingües sin el modelo equivalente `gte-multilingual-mlm-base`.
- Limitación de contexto: aunque soporta 8192 tokens, el rendimiento en longitudes cercanas al máximo puede degradarse; conviene validar en el dominio de uso.
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificación y redistribución, con obligación de mantener el aviso de licencia y atribución.
- No es un modelo de instrucciones ni de chat: no soporta tool calling, agentes ni generación condicionada por prompt.
- Es un modelo MLM base, no un modelo de embeddings listo para producción: para búsqueda semántica o reranking hay que construir la cabeza correspondiente o usar los modelos GTE derivados.
- El repositorio concreto es una conversión de la comunidad con 0 descargas y 0 likes, por lo que no tiene validación de uso extendida; conviene contrastar con el repositorio original de Alibaba.

## Enlaces

- Repositorio HuggingFace (conversión de la comunidad): https://huggingface.co/alibaba-nlp-community/gte-en-mlm-base
- Repositorio original de Alibaba: https://huggingface.co/Alibaba-NLP/gte-en-mlm-base
- Paper mGTE: https://arxiv.org/abs/2407.19669
- PDF del paper: https://arxiv.org/pdf/2407.19669
- Implementación del backbone transformer++ (new-impl): https://huggingface.co/Alibaba-NLP/new-impl
- Modelo multilingüe relacionado: https://huggingface.co/Alibaba-NLP/gte-multilingual-mlm-base
- Modelo large relacionado: https://huggingface.co/Alibaba-NLP/gte-en-mlm-large
- Documentación de GTE en Transformers: https://huggingface.co/docs/transformers/main/en/model_doc/gte

Nota: la busqueda web realizada no devolvio enlaces tecnicos relevantes sobre el modelo (los resultados correspondian a paginas comerciales de Alibaba.com sin relacion con el contenido de esta ficha).
