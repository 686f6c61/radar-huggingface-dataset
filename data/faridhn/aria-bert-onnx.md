# faridhn/aria-bert-onnx

## Resumen

AriaBERT (ONNX) es una exportación del encoder base del modelo AriaBERT, un BERT preentrado en persa desarrollado por Vira Intelligent Data Mining. Este repositorio, creado por faridhn, convierte el checkpoint original de `RobertaForMaskedLM` a formato ONNX con la tarea `feature-extraction`, eliminando la cabeza de MLM y dejando únicamente el encoder que produce `last_hidden_state`. El objetivo es permitir la inferencia en CPU mediante ONNX Runtime sin necesidad de PyTorch en tiempo de ejecución.

El modelo mantiene la arquitectura RoBERTa-base (12 capas, 12 cabezas, tamaño oculto 768) con aproximadamente 125 millones de parámetros y una longitud máxima de secuencia de 512 tokens. Es relevante para desarrolladores que trabajan con procesamiento de lenguaje natural en persa y necesitan obtener representaciones vectoriales de texto de forma ligera y portable, sin depender de un framework específico. Al ser un export fp32, no incluye cuantización, pero su tamaño de 0.5 GB lo hace manejable en entornos con recursos limitados.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RoBERTa-base (12 capas, 12 cabezas, hidden size 768) |
| Parametros totales | ~125M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | fp32 (sin cuantización) |
| Idiomas soportados | Persa (fa) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (model.onnx) |

## Arquitectura y entrenamiento

El modelo es un transformer encoder basado en la arquitectura RoBERTa, preentrenado con el objetivo de modelado de lenguaje enmascarado (MLM) sobre texto persa. El checkpoint original, AriaBERT, fue entrenado por Vira Intelligent Data Mining y publicado con licencia Apache 2.0. Este repositorio no modifica los pesos ni el tokenizador; solo cambia el formato de exportación mediante la herramienta Optimum de Hugging Face, utilizando la tarea `feature-extraction` para descartar la cabeza de MLM y quedarse con el encoder puro.

No se ha realizado ningún fine-tuning adicional con objetivos de similitud de oraciones (como contraste o triplet loss). Por tanto, las embeddings generadas con mean pooling miden similitud superficial de forma menos fiable que modelos específicamente entrenados para ello, como SBERT o E5. El tokenizador es Byte-Pair Encoding (BPE) estilo RoBERTa, con un vocabulario adaptado al persa.

## Capacidades

- Generación de embeddings de texto persa: produce vectores de 768 dimensiones a partir de la última capa oculta, con mean pooling y normalización L2.
- Extracción de características (feature extraction) para pipelines de NLP.
- Inferencia en CPU sin dependencia de PyTorch, solo requiere `onnxruntime` y `tokenizers`.
- Soporte de batch processing mediante `encode_batch`.
- No incluye capacidades de generación de texto, tool calling, agentes, visión ni audio.
- No es multilingüe: está limitado al persa.

## Casos de uso

- Búsqueda semántica en documentos persas: se pueden indexar párrafos o artículos y recuperar los más relevantes mediante similitud coseno de las embeddings generadas. Aunque no está fine-tuned para similitud, puede servir como base para prototipos.
- Clasificación de texto: las embeddings de 768 dimensiones pueden alimentar un clasificador lineal o una red neuronal para tareas como análisis de sentimiento, categorización de noticias o detección de spam en persa.
- Agrupación (clustering) de documentos: agrupar textos persas por temas usando las representaciones vectoriales, útil para organización de corpus o análisis exploratorio.
- Sistemas de recomendación basados en contenido: representar ítems (artículos, productos) mediante embeddings y recomendar elementos similares según la distancia vectorial.
- Extracción de características para pipelines de NLP: integrar el modelo como capa de representación en sistemas más complejos, como chatbots o asistentes virtuales en persa, sin necesidad de GPU.
- Fine-tuning posterior: aunque el modelo no está entrenado para similitud, se puede usar como punto de partida para fine-tuning en tareas específicas de persa, aprovechando su arquitectura RoBERTa-base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor no proporciona métricas de rendimiento en tareas como MMLU, HumanEval o similares. Tampoco se incluyen comparativas con otros modelos en la documentación del repositorio.

## Requisitos de hardware

- Inferencia en CPU: el modelo ONNX fp32 ocupa aproximadamente 0.5 GB en disco y requiere alrededor de 500 MB de RAM para cargar los pesos. Funciona correctamente en CPUs modernas sin necesidad de GPU.
- GPU opcional: si se desea acelerar la inferencia, se puede usar ONNX Runtime con ejecutores CUDA, aunque no es necesario.
- Compatible con cualquier máquina que ejecute Python y tenga instalados `onnxruntime` y `tokenizers`.
- Despliegue: se puede integrar en servicios web mediante ONNX Runtime, o en aplicaciones embebidas. No hay soporte nativo para vLLM, llama.cpp u Ollama, ya que es un modelo de embeddings, no generativo.
- Latencia: no se proporcionan datos de throughput, pero al ser un modelo de 125M parámetros, la inferencia en CPU es razonable para aplicaciones de procesamiento por lotes.

## Comparativa con modelos similares

No se dispone de datos comparativos de rendimiento con otros modelos de embeddings persas. Sin embargo, existen alternativas conocidas en el ecosistema:

| Modelo | Arquitectura | Parámetros | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| AriaBERT (ONNX) | RoBERTa-base | ~125M | 512 | Apache 2.0 | ONNX |
| PartAI/Tooka-SBERT-V2-Small | SBERT (basado en BERT) | no disponible | no disponible | no disponible | PyTorch |
| intfloat/multilingual-e5-small | E5 (basado en transformer) | ~118M | 512 | MIT | PyTorch |

Estos modelos están específicamente entrenados para similitud de oraciones, por lo que pueden ofrecer mejores resultados en tareas de búsqueda semántica. No se dispone de más detalles en la información proporcionada.

## Limitaciones y advertencias

- No está fine-tuned para similitud de oraciones: las embeddings crudas pueden no reflejar bien la similitud semántica, especialmente en comparación con modelos SBERT o E5.
- Solo soporta persa: no es útil para otros idiomas.
- Longitud de contexto limitada a 512 tokens: textos más largos deben truncarse, lo que puede perder información.
- Sin cuantización: el modelo es fp32, lo que implica mayor uso de memoria y menor velocidad en comparación con versiones cuantizadas.
- No es un modelo generativo: no puede completar texto ni generar respuestas.
- Riesgo de alucinación no aplica, pero sí puede producir embeddings poco discriminativas si se usa fuera de su dominio de entrenamiento.
- La licencia Apache 2.0 permite uso comercial, pero se debe atribuir al autor original.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/faridhn/aria-bert-onnx
- Modelo original: https://huggingface.co/ViraIntelligentDataMining/AriaBERT
- Paper de AriaBERT: https://www.researchsquare.com/article/rs-3558473/v1
- Documentación de Optimum: https://huggingface.co/docs/optimum
- ONNX Runtime: https://onnxruntime.ai/
