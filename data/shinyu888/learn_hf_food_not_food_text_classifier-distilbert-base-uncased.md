# shinyu888/learn_hf_food_not_food_text_classifier-distilbert-base-uncased

## Resumen

`learn_hf_food_not_food_text_classifier-distilbert-base-uncased` es un modelo de clasificación de texto binaria obtenido por fine-tuning de DistilBERT base uncased, publicado por el usuario `shinyu888` en Hugging Face. El identificador del modelo sugiere que la tarea objetivo es distinguir entre textos relacionados con comida ("food") y textos que no lo son, aunque la model card no documenta explícitamente el dataset ni la definición exacta de las etiquetas. Se trata, por tanto, de un clasificador de dominio muy acotado, no de un modelo generativo de propósito general.

La relevancia de este modelo es limitada y fundamentalmente práctica: es un ejemplo de fine-tuning ligero (70 pasos de entrenamiento, 10 épocas, batch de 32) sobre una arquitectura encoder compacta de 66,9 millones de parámetros, empaquetado en safetensors y compatible con Transformers y con Text Embeddings Inference. Resulta útil como referencia para pipelines de clasificación de bajo coste, no como modelo de razonamiento o generación.

Cabe advertir que el modelo no tiene descargas ni interacciones registradas, la model card es la generada automáticamente por el `Trainer` y no incluye información sobre el dataset, los idiomas o los usos previstos. La accuracy de 1,0 reportada debe interpretarse con cautela: con 70 pasos totales y un conjunto de evaluación presumiblemente muy pequeño, es un indicio de sobreajuste más que una medida fiable de rendimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DistilBERT, destilado de BERT base) |
| Parametros totales | 66.955.010 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (DistilBERT base soporta hasta 512 tokens por configuración estándar; no confirmado en la información proporcionada) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantización dinámica posible vía herramientas externas, no documentada por el autor) |
| Idiomas soportados | no disponible (modelo base `uncased` entrenado originalmente en inglés, no confirmado por el autor) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `distilbert/distilbert-base-uncased`, un encoder transformer de 6 capas destilado de BERT base, con 66,9 millones de parámetros y vocabulario WordPiece en minúsculas. Sobre esa base se añade una cabeza de clasificación de secuencia (`text-classification`) y se realiza un fine-tuning supervisado completo. No hay indicios de arquitecturas híbridas, atención lineal, decodificación especulativa ni mecanismos MoE: es un encoder denso convencional.

Los hiperparámetros documentados son: learning rate 1e-4, batch de entrenamiento y evaluación de 32, semilla 42, optimizador AdamW (`ADAMW_TORCH_FUSED`, betas 0,9/0,999, epsilon 1e-8), scheduler lineal y 10 épocas. El entrenamiento completo consta de solo 70 pasos, lo que implica un conjunto de entrenamiento muy reducido (aproximadamente 224 ejemplos si el batch de 32 se aplica íntegro en cada paso). No se documenta el dataset, la composición de clases, ni si hubo balanceo. Las versiones de framework declaradas son Transformers 5.22.1, PyTorch 2.14.1+cu130, Datasets 5.2.0 y Tokenizers 0.23.3.

## Capacidades

- Clasificación de texto binaria (presumiblemente "food" / "not food" según el nombre del modelo; las etiquetas exactas no están documentadas).
- Inferencia sobre secuencias cortas de texto en un único paso forward, sin generación.
- Compatible con la pipeline `text-classification` de Transformers.
- Compatible con Text Embeddings Inference (tag `text-embeddings-inference`) y con endpoints de Hugging Face (tag `endpoints_compatible`).
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No dispone de modo thinking, visión ni audio.
- Capacidades multilingües: no documentadas; el modelo base es de origen anglófono.

## Casos de uso

- Filtrado de contenidos en un foro o red social: clasificar publicaciones como relacionadas con comida o no, para enrutarlas a una sección temática. Adecuado por su bajo coste computacional y su latencia de milisegundos en CPU.
- Preetiquetado en un pipeline de anotación humana: usar el modelo como primer paso para reducir el volumen de revisión manual, aceptando que la accuracy real fuera del conjunto de evaluación es desconocida.
- Enrutamiento en un chatbot de recetas: decidir si la consulta del usuario pertenece al dominio culinario antes de derivarla a un modelo generativo mayor, ahorrando coste por token.
- Moderación de catálogos de productos: separar ítems de alimentación del resto en un inventario, siempre que se valide previamente con datos propios del dominio.
- Clasificación de correos o tickets de soporte: identificar consultas de restauración o alimentación para asignarlas a un equipo concreto.
- Componente de demostración educativa: ejemplo mínimo de fine-tuning de DistilBERT con `Trainer` para talleres o tutoriales sobre clasificación de texto.
- Extracción de señales en analítica de reseñas: marcar reseñas que mencionan comida para su posterior análisis de sentimiento con otro modelo.

## Benchmarks y rendimiento

El autor declara los siguientes resultados en el conjunto de evaluación, extraídos de la model card. No se especifica el tamaño ni la composición de dicho conjunto.

| Metrica | Valor |
|---|---|
| Loss (evaluación) | 0,0005 |
| Accuracy (evaluación) | 1,0 |

Evolución del entrenamiento declarada por el autor:

| Epoca | Paso | Training loss | Validation loss | Accuracy |
|---|---|---|---|---|
| 1 | 7 | 0,4356 | 0,2964 | 1,0 |
| 2 | 14 | 0,1452 | 0,0390 | 1,0 |
| 3 | 21 | 0,0122 | 0,0072 | 1,0 |
| 4 | 28 | 0,0024 | 0,0036 | 1,0 |
| 5 | 35 | 0,0012 | 0,0016 | 1,0 |
| 6 | 42 | 0,0008 | 0,0010 | 1,0 |
| 7 | 49 | 0,0007 | 0,0007 | 1,0 |
| 8 | 56 | 0,0006 | 0,0006 | 1,0 |
| 9 | 63 | 0,0005 | 0,0005 | 1,0 |
| 10 | 70 | 0,0005 | 0,0005 | 1,0 |

No hay resultados de MMLU, HumanEval, GSM8K ni de ningún otro benchmark estándar, y el `model-index` del autor está vacío. La accuracy perfecta desde la primera época es coherente con un conjunto de evaluación trivial o con fuga de datos entre entrenamiento y evaluación.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 270 MB solo de pesos (66,9 M de parámetros × 4 bytes), más activaciones y overhead del runtime; en la práctica, menos de 1 GB.
- VRAM estimada en fp16/bf16: aproximadamente 135 MB de pesos; cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: no requiere GPU dedicada. Funciona en CPU con latencias de pocos milisegundos por muestra; una T4, L4 o RTX 3060 en adelante ofrecen throughput muy alto para lotes grandes.
- Cabe en cualquier GPU consumer, incluidas integradas modernas con soporte de PyTorch.
- Opciones de despliegue: pipeline de Transformers, Text Embeddings Inference (tag oficial), Hugging Face Inference Endpoints (tag `endpoints_compatible`), ONNX Runtime y TorchScript mediante exportación manual. No se distribuyen pesos GGUF, por lo que llama.cpp y Ollama no son opciones directas sin conversión.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (DistilBERT fine-tuned) | 66,9 M | no disponible | Clasificación binaria de dominio | apache-2.0 | Hugging Face, 0 descargas |
| distilbert-base-uncased | 66,9 M | 512 tokens (configuración estándar) | Modelo base, enmascarado y embeddings | apache-2.0 | Hugging Face, ampliamente usado |
| bert-base-uncased | 110 M | 512 tokens (configuración estándar) | Modelo base | apache-2.0 | Hugging Face, ampliamente usado |
| ModernBERT-base | no disponible en esta ficha | no disponible | Encoder de propósito general | no disponible en esta ficha | Hugging Face |

La comparación relevante es con el modelo base del que deriva: este checkpoint solo añade una cabeza de clasificación entrenada con 70 pasos, por lo que su valor frente a `distilbert-base-uncased` reside exclusivamente en la tarea concreta para la que fue ajustado, no en capacidades generales.

## Limitaciones y advertencias

- Dataset de entrenamiento no documentado: se desconoce la composición, el idioma, el equilibrio de clases y la procedencia de los datos, lo que impide evaluar sesgos.
- Riesgo elevado de sobreajuste: 70 pasos y 10 épocas con accuracy de 1,0 desde la primera época sugieren un conjunto de evaluación demasiado pequeño o no independiente.
- La accuracy de 1,0 no es extrapolable a datos reales; no debe usarse como métrica de producción sin una evaluación propia.
- Idiomas soportados no declarados; el modelo base es de origen anglófono y el tokenizador `uncased` pierde información de mayúsculas y de acentos en lenguas distintas del inglés.
- Longitud de contexto no confirmada por el autor; asumir 512 tokens es una inferencia basada en la arquitectura del modelo base, no un dato verificado.
- Modelo de clasificación binaria de un solo dominio: no sirve para generación, razonamiento, código ni matemáticas.
- Sin descargas ni validación comunitaria: no hay evidencia externa de su comportamiento.
- Licencia apache-2.0 permite uso comercial y modificación, pero la ausencia de documentación sobre el dataset impide verificar la procedencia y los derechos de los datos de entrenamiento, lo que es un riesgo legal en producción.
- La model card conserva el aviso automático de `Trainer` ("More information needed"), lo que indica que el autor no la ha revisado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/shinyu888/learn_hf_food_not_food_text_classifier-distilbert-base-uncased
- Modelo base: https://huggingface.co/distilbert/distilbert-base-uncased
- Documentación de DistilBERT (paper): https://arxiv.org/abs/1910.01108
- Documentación de BERT (paper): https://arxiv.org/abs/1810.04805
- Pipeline de clasificación de texto de Transformers: https://huggingface.co/docs/transformers/tasks/sequence_classification
- Text Embeddings Inference: https://github.com/huggingface/text-embeddings-inference
