# onnx-community/ModernBERT-large-ONNX

## Resumen

ModernBERT-large-ONNX es una conversión a formato ONNX del modelo ModernBERT-large, desarrollado por Answer.AI y LightOn en colaboración con la comunidad. Esta versión, publicada por onnx-community, está optimizada para su uso con Transformers.js, lo que permite ejecutar el modelo directamente en entornos JavaScript como navegadores o Node.js sin necesidad de infraestructura Python. El modelo base es un Transformer encoder-only de estilo BERT, preentrenado en 2 billones de tokens de texto y código en inglés, con una ventana de contexto nativa de 8.192 tokens.

ModernBERT-large incorpora mejoras arquitectónicas recientes como posiciones rotatorias (RoPE), atención alternante local-global, unpadding y Flash Attention, lo que lo hace especialmente eficiente para procesar documentos largos. Su pipeline principal es fill-mask (modelado de lenguaje enmascarado), y está diseñado para ser fine-tuneado en tareas de recuperación de información, clasificación, búsqueda semántica y recuperación de código. La disponibilidad de pesos ONNX amplía su uso a aplicaciones web y de servidor JavaScript, lo que resulta relevante para desarrolladores que buscan modelos encoder eficientes en ese ecosistema.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-only (estilo BERT) |
| Parametros totales | 395 millones (modelo base) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 8.192 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

ModernBERT-large es un modelo Transformer encoder-only, es decir, no genera texto sino representaciones contextuales de tokens. Fue preentrenado con 2 billones de tokens que combinan texto en inglés y código fuente. El entrenamiento no incluye RLHF ni DPO, ya que no es un modelo de chat ni instructivo; es un modelo de lenguaje enmascarado (MLM) destinado a ser fine-tuneado para tareas downstream.

Las innovaciones técnicas destacables son el uso de posiciones rotatorias (RoPE) para soportar contextos largos, la atención alternante local-global que reduce el coste computacional en entradas extensas, y técnicas de unpadding junto con Flash Attention para acelerar la inferencia. Además, el modelo no utiliza token type IDs, a diferencia de BERT clásico, lo que simplifica su uso en la mayoría de pipelines.

## Capacidades

- Modelado de lenguaje enmascarado (fill-mask): puede predecir tokens ocultos en una secuencia, útil para completar frases o evaluar probabilidades de texto.
- Representaciones contextuales de alta calidad para tareas de recuperación de información (retrieval) en configuraciones single-vector (DPR-style) y multi-vector (ColBERT-style).
- Soporte de contexto largo nativo de hasta 8.192 tokens, ideal para procesar documentos extensos, contratos, artículos o repositorios de código.
- Preentrenado con datos de código, lo que le confiere capacidades destacadas para recuperación de código (CodeSearchNet, StackQA) y búsqueda híbrida texto + código.
- Compatible con Transformers.js y ONNX Runtime, permitiendo su ejecución en navegadores y Node.js.
- No soporta tool calling, agentes, visión ni audio, al ser un modelo encoder-only.

## Casos de uso

- Búsqueda semántica en documentos largos: gracias a su ventana de 8.192 tokens, puede generar embeddings de documentos completos sin truncarlos, lo que mejora la precisión en motores de búsqueda internos o en sistemas de recuperación de conocimiento.
- Recuperación de código en repositorios: al haber sido entrenado con código, es adecuado como backbone para buscar fragmentos de código por similitud semántica, por ejemplo, en herramientas de búsqueda de código o en asistentes de desarrollo.
- Clasificación de textos extensos: puede fine-tunearse para categorizar artículos, informes legales o reseñas largas, manteniendo el contexto completo de la entrada.
- Preguntas y respuestas sobre documentos: siguiendo recetas de fine-tuning estándar de BERT, puede adaptarse a tareas de QA extractivo sobre documentos largos.
- Detección de similitud y deduplicación de textos: sus embeddings permiten identificar documentos duplicados o casi duplicados en grandes corpus, útil en limpieza de datos o gestión de contenidos.
- Motores de recomendación basados en contenido: puede representar ítems y usuarios mediante embeddings, facilitando recomendaciones por similitud en plataformas de contenido o e-commerce.
- Integración en aplicaciones JavaScript: al estar en formato ONNX, puede ejecutarse en el navegador con Transformers.js para tareas de NLP en tiempo real sin servidor dedicado.

## Benchmarks y rendimiento

La información proporcionada incluye una tabla de benchmarks del modelo base correspondiente a la versión base (149M parámetros). Los resultados para la versión large no se han podido extraer del material disponible. A continuación se presentan los datos de la versión base, comparando ModernBERT con otros modelos encoder de tamaño similar:

| Modelo | IR (DPR) BEIR | IR (DPR) MLDR_OOD | IR (DPR) MLDR_ID | IR (ColBERT) BEIR | IR (ColBERT) MLDR_OOD | NLU GLUE | Code CSN | Code SQA |
|---|---|---|---|---|---|---|---|---|
| BERT | 38.9 | 23.9 | 32.2 | 49.0 | 28.1 | 84.7 | 41.2 | 59.5 |
| RoBERTa | 37.7 | 22.9 | 32.8 | 48.7 | 28.2 | 86.4 | 44.3 | 59.6 |
| DeBERTaV3 | 20.2 | 5.4 | 13.4 | 47.1 | 21.9 | 88.1 | 17.5 | 18.6 |
| NomicBERT | 41.0 | 26.7 | 30.3 | 49.9 | 61.3 | 84.0 | 41.6 | 61.4 |
| GTE-en-MLM | 41.4 | 34.3 | 44.4 | 48.2 | 69.3 | 85.6 | 44.9 | 71.4 |
| ModernBERT | 41.6 | 27.4 | 44.0 | 51.3 | 80.2 | 88.4 | 56.4 | 73.6 |

Según el resumen del modelo base, ModernBERT-large supera a modelos de tamaño similar en GLUE y solo es superado por Deberta-v3-large. No se han encontrado resultados de benchmarks específicos para la versión ONNX en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible en la información proporcionada.
- GPU recomendadas: no disponible en la información proporcionada.
- Compatibilidad con GPU de consumo: no disponible en la información proporcionada.
- Opciones de despliegue: Transformers.js y ONNX Runtime, con soporte para Node.js y navegadores.
- Latencia y throughput estimados: no disponible en la información proporcionada.

## Comparativa con modelos similares

La información proporcionada no incluye especificaciones completas de modelos comparables. A continuación se comparan las dos variantes de ModernBERT:

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| ModernBERT-base | 149 millones | 8.192 tokens | Apache 2.0 | HuggingFace (answerdotai/ModernBERT-base) |
| ModernBERT-large | 395 millones | 8.192 tokens | Apache 2.0 | HuggingFace (answerdotai/ModernBERT-large y onnx-community/ModernBERT-large-ONNX) |

En la tabla de benchmarks de la versión base se comparan otros modelos como BERT, RoBERTa, DeBERTaV3, NomicBERT y GTE-en-MLM, pero no se dispone de sus parámetros ni especificaciones en la información proporcionada.

## Limitaciones y advertencias

- El modelo solo está entrenado en inglés, por lo que su rendimiento en otros idiomas es limitado o no evaluado.
- Es un modelo encoder-only, no generativo: no puede generar texto, completar instrucciones ni realizar tool calling.
- Requiere fine-tuning para la mayoría de tareas downstream (clasificación, retrieval, QA); no ofrece predicciones listas para producción sin adaptación.
- La conversión a ONNX es automática y puede introducir pequeñas diferencias numéricas respecto a los pesos originales en PyTorch.
- Para alcanzar la máxima eficiencia se recomienda Flash Attention 2, que requiere una GPU compatible con esta tecnología.
- El model card original no detalla sesgos específicos en el extracto disponible, por lo que no se pueden descartar sesgos presentes en los datos de entrenamiento.
- No se han encontrado advertencias adicionales sobre restricciones de uso comercial más allá de la licencia Apache 2.0.

## Enlaces

- Modelo ONNX en HuggingFace: https://huggingface.co/onnx-community/ModernBERT-large-ONNX
- Modelo base en HuggingFace: https://huggingface.co/answerdotai/ModernBERT-large
- Blog de lanzamiento de ModernBERT: https://huggingface.co/blog/modernbert
- Pre-print en arXiv: https://arxiv.org/abs/2412.13663
