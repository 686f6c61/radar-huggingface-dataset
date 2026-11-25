# L0000P/distilbert-base-uncased-finetuned-emotion

## Resumen

`distilbert-base-uncased-finetuned-emotion` es un modelo de clasificación de texto obtenido mediante fine-tuning de `distilbert-base-uncased`, la versión destilada de BERT. Lo publica el usuario L0000P en Hugging Face y está pensado para la tarea de detección de emociones en texto, aunque la model card no documenta explícitamente el dataset de entrenamiento ni las etiquetas utilizadas. Se trata, por tanto, de un modelo pequeño y especializado, no de un modelo generativo de propósito general.

La arquitectura es un transformer encoder de tipo DistilBERT, con 66.958.086 parámetros totales (6 capas, representaciones ocultas de 768 dimensiones según la arquitectura estándar de DistilBERT). Al ser un modelo encoder-only, no genera texto: produce una distribución de probabilidad sobre las clases de emoción aprendidas durante el fine-tuning. Su ventana de contexto efectiva es de 512 tokens, el límite habitual de la familia BERT.

Su relevancia es la de un artefacto de bajo coste computacional: con menos de 67 millones de parámetros puede ejecutarse en CPU o en GPUs de gama baja con latencias de milisegundos, lo que lo hace útil para clasificación de emociones a gran escala o como componente en pipelines de moderación y análisis de sentimiento. No obstante, la documentación es mínima y el autor no detalla el dataset ni las clases, lo que limita su uso en producción sin una validación previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DistilBERT, encoder-only) |
| Parametros totales | 66.958.086 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens (límite estándar de DistilBERT/BERT) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; admite cuantización dinámica de PyTorch y exportación a ONNX, aunque no documentado por el autor) |
| Idiomas soportados | no disponible (modelo base `uncased` entrenado principalmente en inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 4,0 GB) |

## Arquitectura y entrenamiento

El modelo parte de `distilbert-base-uncased`, un transformer encoder de 6 capas y 66 millones de parámetros obtenido por destilación de conocimiento de BERT-base. Sobre esa base se aplicó un fine-tuning supervisado para clasificación de texto. Los hiperparámetros declarados en la model card son: learning rate 2e-05, batch size de entrenamiento y evaluación de 64, optimizador AdamW (variante `ADAMW_TORCH_FUSED`, betas 0,9/0,999, epsilon 1e-08), scheduler lineal, 2 épocas y semilla 42.

El entrenamiento se realizó con Transformers 5.22.1, PyTorch 2.14.1+cu130, Datasets 5.1.0 y Tokenizers 0.23.3. La model card indica explícitamente que el dataset es desconocido («on an unknown dataset») y que no se proporciona información sobre la composición de los datos, el número de tokens de entrenamiento ni si hubo técnicas de alineación como RLHF o DPO (no aplicables en un clasificador de este tipo). No se documenta ninguna innovación técnica adicional más allá del propio proceso de destilación heredado del modelo base.

## Capacidades

- Clasificación de texto multietiqueta o multiclase orientada a la detección de emociones (el número y nombre de las clases no está documentado).
- Inferencia rápida sobre secuencias de hasta 512 tokens.
- Ejecución en CPU sin GPU dedicada, dado su reducido tamaño.
- Compatibilidad con el pipeline `text-classification` de Transformers.
- Compatible con Text Embeddings Inference (tag `text-embeddings-inference`) y con endpoints de Hugging Face (tag `endpoints_compatible`).
- No soporta generación de texto, tool calling, function calling, razonamiento multi-paso ni capacidades de agente.
- No dispone de visión, audio ni modo de razonamiento explícito.
- Capacidad multilingüe no garantizada: el modelo base es `uncased` en inglés.

## Casos de uso

- Análisis de sentimiento y emociones en reseñas de producto: clasificar grandes volúmenes de opiniones de clientes en categorías emocionales para agregar métricas de satisfacción, aprovechando el bajo coste por inferencia del modelo.
- Moderación de comentarios en comunidades online: prefiltrar mensajes con carga emocional negativa (ira, frustración) antes de una revisión humana, gracias a la latencia de milisegundos en CPU.
- Enrutamiento de tickets de soporte: etiquetar automáticamente el tono emocional de las solicitudes entrantes para priorizar casos de clientes molestos o urgentes.
- Investigación en ciencias sociales y psicología computacional: procesar corpus de texto a escala para estudiar distribuciones emocionales, siempre que se valide previamente el conjunto de etiquetas del modelo.
- Componente en pipelines de análisis de redes sociales: clasificar publicaciones o tuits en tiempo real con un modelo ligero desplegado en contenedores sin GPU.
- Extracción de señales para sistemas de recomendación: incorporar la emoción detectada en reseñas como feature adicional en un modelo de ranking o personalización.
- Preetiquetado en flujos de anotación humana: usar el clasificador como primer paso para sugerir etiquetas emocionales que luego revisan anotadores, reduciendo el coste de anotación.

## Benchmarks y rendimiento

Los únicos resultados disponibles son los declarados por el autor en la model card, medidos sobre un conjunto de evaluación no documentado:

| Metrica | Valor |
|---|---|
| Loss (evaluación) | 0,2179 |
| Accuracy | 0,9245 |
| F1 | 0,9244 |

Evolución durante el entrenamiento:

| Epoca | Paso | Validation loss | Accuracy | F1 |
|---|---|---|---|---|
| 1 | 250 | 0,3131 | 0,905 | 0,9047 |
| 2 | 500 | 0,2179 | 0,9245 | 0,9244 |

El model-index oficial no contiene resultados adicionales (`results: []`). No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,3 GB en fp32 (67 M de parámetros × 4 bytes), menos de 0,2 GB en fp16 y por debajo de 0,1 GB en cuantización int8.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM es suficiente; funciona igualmente bien en CPU.
- Cabe en cualquier GPU de consumo (GTX 1050, RTX 2060, RTX 3060, RTX 4090) e incluso en dispositivos de borde con pocos recursos.
- Opciones de despliegue: pipeline de Transformers, Text Embeddings Inference (TEI), Hugging Face Inference Endpoints, exportación a ONNX Runtime y TorchScript; también es viable con FastAPI o servicios serverless.
- Latencia y throughput: no se han publicado mediciones oficiales; por el tamaño del modelo se espera latencia de pocos milisegundos por secuencia en CPU moderna y throughput de miles de secuencias por segundo en GPU, aunque estos valores son estimaciones y no datos del autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| L0000P/distilbert-base-uncased-finetuned-emotion | 66,9 M | 512 | Clasificación de emociones | Apache 2.0 | Hugging Face |
| distilbert-base-uncased-finetuned-sst-2-english | ~67 M | 512 | Análisis de sentimiento (positivo/negativo) | Apache 2.0 | Hugging Face |
| bhadresh-savani/distilbert-base-uncased-emotion | ~67 M | 512 | Clasificación de emociones (6 clases) | Apache 2.0 | Hugging Face |
| roberta-base-go_emotions | ~125 M | 512 | Clasificación de emociones (28 clases) | MIT | Hugging Face |

La comparación se basa en características públicas de los modelos citados; no se dispone de resultados de benchmarks comparativos en la información proporcionada para establecer diferencias de rendimiento objetivas.

## Limitaciones y advertencias

- El dataset de entrenamiento es desconocido y la model card no especifica las clases de emoción ni su número, lo que impide conocer el espacio de etiquetas sin inspeccionar la configuración del modelo.
- No se documentan sesgos conocidos, pero al derivar de un modelo base entrenado en inglés y sin información sobre la composición de los datos, es probable que presente sesgos demográficos y culturales no medidos.
- Riesgo de alucinación no aplicable en sentido estricto (no genera texto), pero sí riesgo de clasificaciones erróneas fuera de distribución, especialmente en textos en castellano u otros idiomas distintos del inglés.
- Límite de contexto de 512 tokens: los textos más largos deben truncarse, lo que puede perder información relevante para la clasificación.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni documentación sobre el rendimiento en dominios distintos al de evaluación.
- El modelo tiene 0 likes y 146 descargas en el momento de la consulta, lo que sugiere escasa validación por parte de la comunidad.
- La model card está generada automáticamente y contiene secciones sin completar («More information needed»), lo que reduce la fiabilidad de la documentación.
- Para producción se recomienda validar el modelo sobre un conjunto propio etiquetado antes de desplegarlo, dado que no hay información sobre el conjunto de evaluación original.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/L0000P/distilbert-base-uncased-finetuned-emotion
- Modelo base: https://huggingface.co/distilbert-base-uncased
- Documentación de DistilBERT (paper): https://arxiv.org/abs/1910.01108
- Documentación de Transformers para clasificación de texto: https://huggingface.co/docs/transformers/tasks/sequence_classification
- Text Embeddings Inference: https://github.com/huggingface/text-embeddings-inference
