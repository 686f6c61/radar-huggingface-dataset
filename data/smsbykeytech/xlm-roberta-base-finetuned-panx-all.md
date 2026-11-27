# smsbykeytech/xlm-roberta-base-finetuned-panx-all

## Resumen

`smsbykeytech/xlm-roberta-base-finetuned-panx-all` es un modelo de clasificación de tokens (token classification) obtenido mediante fine-tuning de `FacebookAI/xlm-roberta-base` sobre el corpus PanX (Pan-Genome Annotation), un conjunto de referencia multilingüe para reconocimiento de entidades nombradas (NER). Lo publica el usuario `smsbykeytech` en Hugging Face con licencia MIT y un total de 277.459.208 parámetros en formato safetensors.

El modelo resuelve la tarea de etiquetado a nivel de token, es decir, asignar una categoría a cada token de una secuencia de entrada (por ejemplo, nombres de personas, organizaciones o localizaciones en un texto). Al partir de XLM-RoBERTa base, hereda la arquitectura transformer encoder multilingüe con 12 capas y una ventana de contexto de 512 tokens, lo que lo hace adecuado para tareas de NER y etiquetado secuencial en varios idiomas.

Es relevante como ejemplo de fine-tuning ligero y reproducible: la model card documenta los hiperparámetros exactos (learning rate 5e-05, batch size 24, 3 épocas, AdamW con betas 0.9/0.999) y la curva de validación, con un F1 final de 0.8528 y una pérdida de validación de 0.1767. No obstante, el modelo tiene 0 descargas y 0 likes en el momento de la consulta, y la model card está generada automáticamente por el Trainer sin documentación adicional sobre el dataset o los usos previstos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder (XLM-RoBERTa base) |
| Parámetros totales | 277.459.208 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 512 tokens (heredada de XLM-RoBERTa base) |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No disponible (modelo base multilingüe) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de `xlm-roberta-base`, un transformer encoder de 12 capas con atención multi-cabeza completa, entrenado originalmente por Facebook AI sobre datos multilingües. La tarea de cabecera es `token-classification`, por lo que el modelo emite una etiqueta por token de entrada, típicamente en formato BIO (B-PER, I-PER, B-ORG, etc.) para NER.

El entrenamiento se realizó con el `Trainer` de Transformers 4.57.6 sobre PyTorch 2.2.1+cu121 y Datasets 4.8.5, con optimizador AdamW (betas 0.9/0.999, epsilon 1e-08), learning rate 5e-05, scheduler lineal, batch size de 24 (entrenamiento y evaluación) y 3 épocas, con semilla 42. La model card indica que se entrenó sobre "None dataset", sin especificar la composición exacta del corpus PanX utilizado ni el número de tokens de entrenamiento. No se documenta uso de RLHF, DPO ni técnicas de decodificación especulativa.

## Capacidades

- Clasificación de tokens para reconocimiento de entidades nombradas (NER) en textos multilingües, gracias a la base XLM-RoBERTa.
- Etiquetado secuencial genérico (POS tagging, chunking, etc.) si el cabezal se ha entrenado para ello, aunque la model card no lo especifica.
- Procesamiento de secuencias de hasta 512 tokens por inferencia.
- Compatible con el pipeline `token-classification` de Transformers y con endpoints compatibles (`endpoints_compatible` en los tags).
- No soporta generación de texto, tool calling, agentes, visión ni audio: es un modelo encoder discriminativo.
- Capacidades multilingües heredadas del modelo base, aunque la model card no detalla los idiomas cubiertos por el fine-tuning.

## Casos de uso

- Extracción de entidades en documentos multilingües: el modelo puede etiquetar personas, organizaciones y localizaciones en textos de varios idiomas gracias a la base XLM-RoBERTa, integrándose en pipelines de extracción de información.
- Anonimización de datos personales: detectar nombres y entidades sensibles en textos antes de almacenarlos o compartirlos, usando la salida BIO para enmascarar tokens.
- Enriquecimiento de bases de datos documentales: procesar lotes de documentos y extraer entidades para indexación o búsqueda semántica.
- Preprocesado para sistemas RAG: identificar entidades en consultas y documentos para mejorar la recuperación y el filtrado.
- Análisis de reseñas y soporte al cliente: detectar productos, marcas y ubicaciones mencionadas en tickets o encuestas para su clasificación automática.
- Investigación en NER multilingüe: servir como baseline reproducible (F1 0.8528 en validación) para comparar con otros fine-tunings sobre PanX.
- Moderación de contenido: identificar entidades y términos en textos generados por usuarios para su revisión.

## Benchmarks y rendimiento

La model card declara los siguientes resultados en el conjunto de evaluación (datos del autor):

| Métrica | Valor |
|---|---|
| Loss (validación) | 0.1767 |
| F1 | 0.8528 |

Evolución durante el entrenamiento:

| Época | Paso | Training loss | Validation loss | F1 |
|---|---|---|---|---|
| 1.0 | 835 | 0.2939 | 0.2061 | 0.8090 |
| 2.0 | 1670 | 0.1553 | 0.1720 | 0.8456 |
| 3.0 | 2505 | 0.1003 | 0.1767 | 0.8528 |

El `model-index` del modelo no contiene resultados adicionales (lista vacía). No se han publicado resultados de benchmarks en la información disponible más allá de los anteriores.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 1,1 GB de pesos (tamaño del repo) más overhead de activaciones; en la práctica, entre 2 y 4 GB según longitud de secuencia y batch.
- En fp16/bf16: alrededor de 0,6 GB de pesos, con un consumo total típico inferior a 2 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; RTX 3060, RTX 4090, A100 o H100 son suficientes y sobredimensionadas para este tamaño.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU consumer moderna (GTX 1650 en adelante) e incluso en CPU para lotes pequeños.
- Opciones de despliegue: `transformers` con pipeline `token-classification`, TGI (Text Generation Inference no aplica a encoder, pero se puede servir con `transformers` + FastAPI), ONNX Runtime, o `optimum` para exportación. llama.cpp y Ollama no son adecuados para este tipo de modelo encoder.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| smsbykeytech/xlm-roberta-base-finetuned-panx-all | 277 M | 512 | Token classification (NER) | MIT | Hugging Face, 0 descargas |
| FacebookAI/xlm-roberta-base | 278 M | 512 | Modelo base multilingüe | MIT | Hugging Face, ampliamente usado |
| Davlan/bert-base-multilingual-cased-ner-hrl | ~178 M | 512 | NER multilingüe | No disponible | Hugging Face, uso extendido |
| Babelscape/wikineural-multilingual-ner | ~278 M | 512 | NER multilingüe | No disponible | Hugging Face, uso extendido |

La comparativa se basa en características públicas de los modelos; no se dispone de resultados de benchmarks comparables en la información proporcionada para este modelo frente a las alternativas.

## Limitaciones y advertencias

- Modelo con 0 descargas y 0 likes: no hay evidencia de uso en producción ni validación externa.
- La model card está generada automáticamente y no documenta el dataset de entrenamiento ("None dataset"), los idiomas cubiertos ni los usos previstos.
- Riesgo de alucinación no aplica en sentido generativo, pero sí de falsos positivos y negativos en la detección de entidades, especialmente en dominios distintos al de entrenamiento.
- Ventana de contexto limitada a 512 tokens: textos más largos requieren segmentación, lo que puede romper entidades a caballo entre fragmentos.
- Sesgos heredados de XLM-RoBERTa base y del corpus PanX, no evaluados en la información disponible.
- Licencia MIT permite uso comercial, pero al derivar de XLM-RoBERTa conviene revisar las condiciones del modelo base.
- Sin información sobre cuantización ni sobre rendimiento en CPU/GPU concreto; las estimaciones de hardware son orientativas.
- No apto para generación de texto, agentes ni tool calling.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/smsbykeytech/xlm-roberta-base-finetuned-panx-all
- Modelo base: https://huggingface.co/FacebookAI/xlm-roberta-base
- Paper de XLM-RoBERTa: https://arxiv.org/abs/1911.02116
- Paper de PanX: https://arxiv.org/abs/2112.08700
