# pulkitdayal/sentiment-model

## Resumen

`sentiment-model` es un modelo de clasificación de texto obtenido mediante fine-tuning de `distilbert-base-uncased`, la variante destilada de BERT desarrollada por Hugging Face. Lo publica el usuario `pulkitdayal` en Hugging Face y su propósito declarado es la clasificación de sentimiento, aunque la model card no especifica el dataset de entrenamiento ni las etiquetas concretas que predice. La relevancia práctica es limitada: se trata de un experimento de ajuste con un rendimiento moderado y documentación mínima.

Arquitectónicamente es un transformer encoder de tipo BERT destilado, con 66.955.779 parámetros totales (unos 67 millones) y un repositorio de 0,3 GB en formato safetensors. La longitud de contexto no se declara explícitamente, pero al derivar de `distilbert-base-uncased` hereda el límite habitual de 512 tokens de posición de su tokenizador WordPiece en minúsculas. La licencia es Apache 2.0, lo que permite uso comercial sin restricciones adicionales.

El modelo resulta relevante únicamente como ejemplo de pipeline de fine-tuning reproducible (generado con `Trainer` de Transformers) o como punto de partida para tareas de clasificación binaria o multiclase de sentimiento en inglés. No debe considerarse un modelo de referencia para producción sin una evaluación adicional, dado que su accuracy en validación es del 65,98 % y la model card está generada automáticamente sin revisar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DistilBERT, destilado de BERT) |
| Parametros totales | 66.955.779 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la model card; hereda el límite de 512 tokens de `distilbert-base-uncased` |
| Tipos de cuantizacion | no disponible (pesos en safetensors; admite cuantización estándar a int8/fp16 vía herramientas de Transformers) |
| Idiomas soportados | no disponible (el modelo base es solo inglés, `uncased`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning completo de `distilbert-base-uncased`, un transformer encoder de 6 capas con atención multi-cabeza estándar, entrenado originalmente por Hugging Face mediante destilación de BERT. La cabeza de clasificación se ha sustituido por una capa de clasificación de texto adaptada a la tarea de sentimiento, aunque la model card no detalla el número de etiquetas ni su semántica.

El entrenamiento se realizó con el `Trainer` de Transformers durante 3 épocas, con `learning_rate` de 2e-05, `train_batch_size` y `eval_batch_size` de 32, semilla 42, optimizador `AdamW` (variante fused, betas 0,9/0,999, epsilon 1e-08) y scheduler lineal. No se documenta el dataset, el número de tokens de entrenamiento, la composición de los datos ni si hubo RLHF o DPO (no aplica en un modelo de clasificación). Las versiones de framework declaradas son Transformers 5.21.0, PyTorch 2.11.0+cu130, Datasets 4.8.5 y Tokenizers 0.23.3.

## Capacidades

- Clasificación de texto (pipeline `text-classification`): asigna una etiqueta de sentimiento a una secuencia de entrada.
- Generación de texto: no soportada (es un encoder de clasificación, no un modelo causal).
- Razonamiento, código y matemáticas: no soportados de forma nativa.
- Tool calling / function calling: no soportado.
- Agentes y razonamiento multi-paso: no soportado.
- Capacidades multilingües: no declaradas; el modelo base está entrenado en inglés y usa tokenizador `uncased`.
- Capacidades especiales (thinking mode, visión, audio): no disponibles.
- Salida: logits por etiqueta con probabilidades asociadas, aptas para umbrales configurables.

## Casos de uso

- Análisis de sentimiento en reseñas de producto en inglés: el modelo puede clasificar reseñas cortas en una o varias categorías de polaridad, siempre que se valide previamente el mapeo de etiquetas, ya que la model card no lo especifica.
- Moderación de comentarios en foros: útil como filtro de primera pasada para detectar contenido negativo o tóxico, con revisión humana posterior dado el accuracy del 65,98 %.
- Monitorización de opinión en redes sociales: procesamiento por lotes de tuits o publicaciones cortas en inglés, aprovechando el bajo coste computacional de un modelo de 67 M de parámetros.
- Clasificación de tickets de soporte: etiquetado automático de la urgencia o el tono de las solicitudes entrantes en inglés, integrado en un pipeline de Transformers.
- Etiquetado de datos para entrenamiento: uso como anotador débil o preetiquetador en un flujo de human-in-the-loop, dado que es rápido y barato de ejecutar en CPU.
- Prototipado académico y experimentos de fine-tuning: sirve como base reproducible para comparar hiperparámetros de ajuste en tareas de clasificación de texto.
- Extracción de señal en encuestas abiertas: clasificación de respuestas de texto libre en inglés para agregar métricas de satisfacción.

## Benchmarks y rendimiento

La model card declara resultados de evaluación, pero el `model-index` no incluye entradas de benchmark (`results: []`). Los datos disponibles son métricas de validación del entrenamiento:

| Metrica | Valor |
|---|---|
| Loss (evaluacion final) | 0,7470 |
| Accuracy | 0,6598 |
| F1 weighted | 0,6493 |
| F1 macro | 0,6493 |

Evolución durante el entrenamiento:

| Epoca | Step | Validation loss | Accuracy | F1 weighted | F1 macro |
|---|---|---|---|---|---|
| 1 | 58 | 0,8737 | 0,6080 | 0,5529 | 0,5529 |
| 2 | 116 | 0,7226 | 0,6975 | 0,6881 | 0,6881 |
| 3 | 174 | 0,7117 | 0,6821 | 0,6736 | 0,6736 |

No se han publicado resultados de benchmarks estándar (MMLU, GLUE, SST-2, etc.) en la información disponible. El mejor punto observado es la época 2 (accuracy 0,6975), lo que sugiere cierto sobreajuste en la tercera época.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 (67 M de parámetros), aproximadamente 0,3 GB en fp16 y menos de 0,2 GB en int8.
- GPU recomendadas: cualquier GPU moderna; funciona bien en CPU para lotes pequeños. GPU como T4, RTX 3060, RTX 4090 o A100 son sobredimensionadas para este modelo, pero válidas para procesamiento por lotes a gran escala.
- Cabe en cualquier GPU consumer, incluida una GTX 1650 o una iGPU con suficiente memoria compartida.
- Opciones de despliegue: `transformers` (pipeline `text-classification`), `optimum`/ONNX Runtime, TorchScript, `text-embeddings-inference` no aplica, y exportación a GGUF mediante `llama.cpp` no es el camino habitual para un encoder de clasificación. También es compatible con `endpoints_compatible` según los tags del repositorio.
- Latencia y throughput estimados: no disponibles en la información proporcionada; por el tamaño del modelo, se espera un throughput alto en CPU y muy alto en GPU para lotes de 32.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| `pulkitdayal/sentiment-model` | 66,9 M | 512 tokens (heredado) | Apache 2.0 | Hugging Face | Accuracy 0,6598 en validación; documentación mínima |
| `distilbert-base-uncased-finetuned-sst-2-english` | 67 M | 512 tokens | Apache 2.0 | Hugging Face | Fine-tuning sobre SST-2, referencia habitual para sentimiento en inglés |
| `cardiffnlp/twitter-roberta-base-sentiment-latest` | ~125 M | 512 tokens | MIT (verificar) | Hugging Face | Basado en RoBERTa, optimizado para texto de redes sociales |
| `nlptown/bert-base-multilingual-uncased-sentiment` | ~178 M | 512 tokens | MIT (verificar) | Hugging Face | Multilingüe, clasificación en 5 estrellas |

La comparación directa de rendimiento no es posible porque este modelo no publica resultados en benchmarks estándar y sus métricas de validación no son directamente equiparables a las de los modelos citados, que sí reportan resultados en SST-2 o en sus propios conjuntos de evaluación.

## Limitaciones y advertencias

- Documentación insuficiente: la model card está generada automáticamente y no especifica el dataset, las etiquetas ni el dominio de aplicación, lo que impide conocer la semántica exacta de las predicciones.
- Rendimiento moderado: accuracy del 65,98 % y F1 macro de 0,6493 en validación, insuficiente para la mayoría de aplicaciones en producción sin una evaluación adicional.
- Riesgo de sobreajuste: la pérdida de validación empeora entre la época 2 y la 3, y el mejor resultado se obtiene en la época 2.
- Idioma: el modelo base es solo inglés y usa tokenizador `uncased`; no se declaran capacidades multilingües.
- Sesgos: no se documentan análisis de sesgo; al derivar de `distilbert-base-uncased`, puede heredar sesgos de género, raza y dominio presentes en los corpus web de entrenamiento de BERT.
- Alucinación: al ser un clasificador, no genera texto, pero puede producir etiquetas erróneas con alta confianza en dominios distintos al de entrenamiento.
- Contexto limitado: 512 tokens, insuficiente para documentos largos sin truncamiento o segmentación.
- Licencia: Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte; conviene verificar la procedencia del dataset de fine-tuning, que no se declara.
- Reproducibilidad: las versiones de framework (Transformers 5.21.0, PyTorch 2.11.0) son posteriores a las habituales en producción, lo que puede complicar la replicación exacta del entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/pulkitdayal/sentiment-model
- Modelo base: https://huggingface.co/distilbert-base-uncased
- Documentación de DistilBERT (paper): https://arxiv.org/abs/1910.01108
- Documentación de BERT (paper): https://arxiv.org/abs/1810.04805
- Pipeline de clasificación de texto en Transformers: https://huggingface.co/docs/transformers/tasks/sequence_classification
