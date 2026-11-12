# jdherman94/novapay-sentiment

## Resumen

novapay-sentiment es un modelo de clasificación de texto obtenido mediante fine-tuning de distilbert-base-uncased, publicado por el usuario jdherman94 en Hugging Face. Se trata de un modelo encoder-only de tipo DistilBERT, con 66.955.010 parámetros y un repositorio de 0,3 GB en formato safetensors, orientado a la clasificación de sentimiento en el dominio de pagos (por el nombre "novapay"). El autor no ha documentado el conjunto de datos de entrenamiento ni los usos previstos, y la model card indica explícitamente "More information needed" en las secciones de descripción, limitaciones y datos.

El modelo se entrenó durante 2 épocas con un learning rate de 2e-05, batch size de 16 y el optimizador AdamW fused, alcanzando en el conjunto de evaluación una pérdida de 0,3039, una accuracy de 0,883 y un F1 de 0,8831. Estos resultados proceden de la model card autogenerada por el Trainer de Hugging Face, no de una evaluación independiente.

Su relevancia es limitada: se publicó en noviembre de 2026, no tiene descargas ni likes, y no incluye información sobre el dataset, los idiomas soportados ni los benchmarks. Es un artefacto de fine-tuning de propósito acotado, útil únicamente si el dominio de sentimiento financiero o de pagos coincide con el de su entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-only (DistilBERT, destilación de BERT) |
| Parametros totales | 66.955.010 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (DistilBERT base admite hasta 512 tokens, no confirmado por el autor) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantización posible vía herramientas externas) |
| Idiomas soportados | no disponible (modelo base entrenado en inglés, no confirmado por el autor) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de distilbert-base-uncased, un transformer encoder-only de 6 capas obtenido por destilación de BERT-base. La cabeza de clasificación se ha reentrenado para la tarea de text-classification, aunque el autor no especifica el número de etiquetas ni su significado. El entrenamiento se realizó con Transformers 5.22.1, PyTorch 2.14.1+cu130, Datasets 4.8.5 y Tokenizers 0.23.3, con 2 épocas, 626 pasos totales, batch size de 16, learning rate 2e-05, scheduler lineal y semilla 42.

No se dispone de información sobre el volumen de datos, la composición del dataset, si hubo aumentación o balanceo de clases, ni si se aplicaron técnicas de regularización adicionales. Tampoco se documenta ningún proceso de RLHF, DPO ni ajuste por preferencias, algo esperable en un modelo encoder de clasificación. No hay innovaciones técnicas destacables más allá del fine-tuning estándar sobre el checkpoint base.

## Capacidades

- Clasificación de texto (text-classification): asigna una etiqueta de sentimiento a una secuencia de entrada.
- Especialización probable en el dominio de pagos o finanzas, a juzgar por el nombre "novapay", aunque no está documentado.
- Inferencia rápida y ligera: 66,9 M de parámetros, adecuado para CPU y GPUs de gama baja.
- Compatible con Text Embeddings Inference (tag `text-embeddings-inference`) y con endpoints de Hugging Face (tag `endpoints_compatible`).
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-step.
- No tiene capacidades multilingües confirmadas.
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Análisis de sentimiento en reseñas de usuarios de una pasarela de pago: el modelo puede clasificar comentarios de clientes sobre transacciones, incidencias o soporte, aprovechando su especialización aparente en el dominio de pagos.
- Monitorización de tickets de soporte: clasificar automáticamente la tonalidad de los mensajes entrantes para priorizar casos negativos y escalar a agentes humanos.
- Enrutado de feedback en encuestas: etiquetar respuestas abiertas de NPS o CSAT como positivas o negativas para agregar métricas sin revisión manual.
- Filtrado de reseñas en marketplaces: detectar opiniones negativas sobre métodos de pago o checkout para su revisión por el equipo de producto.
- Moderación ligera de comentarios: preclasificar el tono de comentarios en foros o redes antes de aplicar reglas más estrictas.
- Prototipado rápido en entornos con recursos limitados: al ser un DistilBERT de 67 M de parámetros, se puede desplegar en una CPU o en una GPU consumer para validar un pipeline de sentimiento antes de invertir en un modelo mayor.
- Clasificación por lotes en pipelines de datos: procesar grandes volúmenes de texto en batch con latencia baja gracias al tamaño reducido del modelo.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (conjunto de evaluación no especificado):

| Metrica | Valor |
|---|---|
| Loss (evaluación) | 0,3039 |
| Accuracy | 0,883 |
| F1 | 0,8831 |
| Loss (época 1) | 0,3215 (train) / 0,4145 (validación) |
| Accuracy (época 1) | 0,838 |
| F1 (época 1) | 0,8541 |

El model-index oficial no contiene resultados adicionales (`results: []`). No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 270 MB (67 M de parámetros × 4 bytes), más overhead de activaciones y tokenizador.
- VRAM estimada en FP16: aproximadamente 135 MB.
- VRAM estimada en INT8: aproximadamente 70 MB.
- Cabe holgadamente en cualquier GPU consumer (GTX 1060, RTX 2060, RTX 3060, RTX 4090) y también en CPU.
- GPUs profesionales recomendadas para despliegue a gran escala: T4, L4, A10G, A100; el modelo es lo bastante pequeño como para que la elección dependa más del throughput agregado que de la memoria.
- Opciones de despliegue: Transformers con pipeline de text-classification, Text Embeddings Inference (tag oficial), Hugging Face Inference Endpoints (tag `endpoints_compatible`), ONNX Runtime, y conversión a GGUF para llama.cpp u Ollama si se desea.
- Latencia y throughput: no disponibles en la información proporcionada. Por el tamaño del modelo, se espera un throughput alto en GPU y aceptable en CPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Rendimiento publicado |
|---|---|---|---|---|---|
| novapay-sentiment | 66,9 M | no disponible | Apache 2.0 | Hugging Face, 0 descargas | Accuracy 0,883 / F1 0,8831 (eval. propia) |
| distilbert-base-uncased-finetuned-sst-2-english | ~67 M | 512 tokens | Apache 2.0 | Hugging Face, ampliamente usado | No disponible en esta ficha |
| cardiffnlp/twitter-roberta-base-sentiment-latest | ~125 M | 512 tokens | No disponible | Hugging Face | No disponible en esta ficha |
| ProsusAI/finbert | ~110 M | 512 tokens | No disponible | Hugging Face | No disponible en esta ficha |

La comparación se limita a la categoría (clasificación de sentimiento basada en encoders pequeños). No se dispone de datos de rendimiento de los modelos alternativos en la información proporcionada, por lo que no se puede establecer una comparación cuantitativa fiable.

## Limitaciones y advertencias

- Dataset de entrenamiento desconocido: la model card indica "unknown dataset", lo que impide evaluar la representatividad y los posibles sesgos.
- Sin información sobre el número ni el significado de las etiquetas de salida.
- Idiomas no declarados: el modelo base es en inglés, por lo que el uso en castellano no está garantizado.
- Riesgo de alucinación no aplica en sentido generativo, pero sí de clasificaciones erróneas fuera de la distribución de entrenamiento.
- Métricas reportadas por el propio Trainer sobre un conjunto de evaluación no descrito; no verificadas de forma independiente.
- Sin descargas ni likes: no hay evidencia de uso en producción ni validación por la comunidad.
- Licencia Apache 2.0 permite uso comercial, pero al desconocerse el dataset de entrenamiento no se puede descartar que los datos subyacentes tuvieran restricciones adicionales.
- No apto para tareas generativas, de razonamiento, tool calling ni agentes.
- La fecha de creación (2026-11-12) y el escaso mantenimiento sugieren que no debe asumirse soporte continuado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jdherman94/novapay-sentiment
- Modelo base: https://huggingface.co/distilbert/distilbert-base-uncased
- Documentación de DistilBERT (paper): https://arxiv.org/abs/1910.01108
- Documentación de Transformers para text-classification: https://huggingface.co/docs/transformers/tasks/sequence_classification
- Text Embeddings Inference: https://github.com/huggingface/text-embeddings-inference
