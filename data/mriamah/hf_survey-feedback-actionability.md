# mriamah/hf_survey-feedback-actionability

## Resumen

`mriamah/hf_survey-feedback-actionability` es un modelo de clasificación de texto obtenido mediante fine-tuning de `distilbert/distilbert-base-uncased`, la variante destilada de BERT publicada por Hugging Face. Lo desarrolla el usuario `mriamah` y su propósito declarado, a partir del nombre, es clasificar feedback de encuestas según su grado de accionabilidad (es decir, determinar si un comentario de encuesta contiene información sobre la que se puede actuar). Se trata de un modelo de nicho, con cero descargas y cero likes en el momento de la consulta, y sin documentación sustantiva en su model card.

Técnicamente es un transformer encoder de tipo DistilBERT con 66.955.010 parámetros, entrenado para clasificación de secuencias. El repositorio ocupa 0,3 GB y los pesos están en formato safetensors, lo que permite cargarlo directamente con la librería `transformers` y desplegarlo con Text Embeddings Inference (el tag `text-embeddings-inference` y `endpoints_compatible` aparece en los metadatos).

Su relevancia es limitada y muy específica: puede servir como punto de partida o referencia para tareas de triaje de feedback textual en encuestas, pero la ausencia de datos sobre el conjunto de entrenamiento, la evaluación perfecta declarada (accuracy 1.0 con solo 10 pasos de entrenamiento) y la falta de benchmarks publicados aconsejan tratarlo con cautela antes de cualquier uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DistilBERT, destilado de BERT) |
| Parametros totales | 66.955.010 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (DistilBERT-base admite hasta 512 tokens de entrada) |
| Tipos de cuantizacion | no disponible (pesos safetensors en fp32; compatible con cuantizacion via herramientas externas) |
| Idiomas soportados | no disponible (el modelo base es `uncased` en ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de `distilbert-base-uncased`, un transformer encoder de 6 capas y 66 millones de parámetros obtenido por destilación de conocimiento de BERT-base. La tarea es clasificación de texto (`text-classification`), con una cabeza de clasificación sobre el token `[CLS]`. El vocabulario y el tokenizador son los del modelo base, en inglés y sin distinción de mayúsculas.

Los hiperparámetros declarados en la model card son: learning rate 1e-4, batch size 32 (entrenamiento y evaluación), semilla 42, optimizador AdamW con betas (0.9, 0.999) y epsilon 1e-8, scheduler lineal y 10 épocas. El detalle más llamativo es que el entrenamiento registra únicamente 10 pasos totales (un paso por época), lo que implica un conjunto de entrenamiento extremadamente pequeño (del orden de decenas de ejemplos con batch 32). No se especifica el dataset utilizado ("None dataset" en la model card), ni la composición, ni si hubo validación cruzada, aumento de datos o técnicas de regularización adicionales. Las versiones de framework reportadas son Transformers 5.22.1, PyTorch 2.14.1+cpu, Datasets 4.8.5 y Tokenizers 0.23.3.

## Capacidades

- Clasificación de texto: asigna una etiqueta a un texto de entrada, presumiblemente relacionada con la accionabilidad del feedback de encuestas.
- Procesamiento de secuencias cortas y medianas: hereda la ventana de entrada de DistilBERT (hasta 512 tokens), adecuada para comentarios de encuesta.
- Inferencia eficiente en CPU: al ser un modelo de 66 M de parámetros, puede ejecutarse sin GPU con latencia baja.
- Integración con el ecosistema `transformers` y con Text Embeddings Inference para despliegue como endpoint.
- No dispone de generación de texto, razonamiento multi-paso, tool calling, capacidades de agente, visión, audio ni modo de razonamiento extendido.
- Capacidades multilingües: no declaradas; el modelo base está entrenado principalmente en inglés.

## Casos de uso

- Triaje de feedback de encuestas: clasificar comentarios abiertos de NPS o CSAT para separar los que contienen una petición o queja concreta (accionable) de los que son genéricos, y enrutar los primeros a los equipos correspondientes.
- Priorización de tickets de soporte: usar la etiqueta de accionabilidad como señal adicional para ordenar la cola de atención al cliente, combinándola con reglas de negocio.
- Enrutamiento por categoría en pipelines de voz del cliente: integrar el clasificador como primer paso de un pipeline que después aplica análisis de sentimiento o extracción de entidades sobre los comentarios marcados como accionables.
- Filtrado de ruido en paneles de analítica: descartar automáticamente comentarios no accionables antes de agregarlos en informes, reduciendo el volumen que revisa manualmente el equipo de investigación de usuarios.
- Etiquetado asistido para anotación humana: preetiquetar grandes volúmenes de feedback para que los anotadores solo revisen y corrijan, acelerando la construcción de datasets supervisados.
- Prototipado rápido en CPU: servir el modelo en una instancia sin GPU o en local para validar la viabilidad de una funcionalidad de clasificación antes de invertir en un modelo mayor o en datos etiquetados propios.

## Benchmarks y rendimiento

Los datos disponibles provienen exclusivamente de la model card del autor. El `model-index` no contiene resultados; la tabla de entrenamiento reporta métricas sobre el conjunto de validación:

| Metrica | Valor |
|---|---|
| Loss (evaluacion final, epoca 10) | 0.0075 |
| Accuracy (evaluacion final) | 1.0 |
| Loss de entrenamiento (epoca 10) | 0.0065 |

No se han publicado resultados de benchmarks estándar (MMLU, GLUE, etc.) en la información disponible. La accuracy de 1.0 debe interpretarse con cautela: con 10 pasos de entrenamiento y un conjunto de validación presumiblemente muy pequeño, la métrica no es representativa del rendimiento en datos reales.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,3 GB en fp32 (66 M de parámetros); menos de 0,2 GB en fp16 o int8.
- GPU recomendadas: cualquier GPU con al menos 1 GB de memoria; funciona sobradamente en tarjetas de gama baja (GTX 1050, T4) e incluso en CPU.
- Cabe en cualquier GPU de consumo actual y en la mayoría de sistemas embebidos con suficiente RAM.
- Opciones de despliegue: `transformers` (PyTorch), Text Embeddings Inference (tag `text-embeddings-inference`), ONNX Runtime tras conversión, y contenedores de inferencia compatibles con endpoints (`endpoints_compatible`).
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño del modelo se espera latencia de milisegundos por petición en CPU y throughput alto en GPU, pero no hay cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `mriamah/hf_survey-feedback-actionability` | 66,9 M | hasta 512 tokens (heredado) | Clasificacion de accionabilidad de feedback | apache-2.0 | Hugging Face |
| `distilbert/distilbert-base-uncased` | 66,9 M | 512 tokens | Modelo base (MLM, sin cabeza de clasificacion) | apache-2.0 | Hugging Face |
| `distilbert-base-uncased-finetuned-sst-2-english` | 67 M | 512 tokens | Analisis de sentimiento (clasificacion binaria) | apache-2.0 | Hugging Face |
| `cardiffnlp/twitter-roberta-base-sentiment-latest` | 125 M | 512 tokens | Analisis de sentimiento en tres clases | apache-2.0 | Hugging Face |

La comparación con alternativas es aproximada: no existen benchmarks públicos de este modelo frente a otros clasificadores de feedback, por lo que la elección entre ellos debe basarse en validación sobre datos propios.

## Limitaciones y advertencias

- Conjunto de entrenamiento no documentado: la model card indica "None dataset" y no se especifica el número de ejemplos, la distribución de clases ni el origen de los datos.
- Riesgo elevado de sobreajuste: 10 pasos de entrenamiento y accuracy 1.0 en validación sugieren un conjunto de datos muy pequeño; el rendimiento en producción probablemente será muy inferior.
- Sin información sobre sesgos: no hay evaluación de sesgos demográficos, lingüísticos ni de dominio.
- Riesgo de alucinación no aplicable (no genera texto), pero sí de clasificaciones erróneas por falta de generalización.
- Idioma: el modelo base es inglés `uncased`; no se declara soporte para castellano ni otros idiomas, por lo que su uso en feedback en español no está validado.
- Sin benchmarks publicados ni métricas más allá de la accuracy de validación; no hay matriz de confusión ni F1 por clase.
- Licencia apache-2.0: permite uso comercial y modificación, pero el autor no ofrece garantías ni soporte.
- Para producción se recomienda reentrenar o validar con un conjunto de datos propio representativo antes de desplegar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mriamah/hf_survey-feedback-actionability
- Modelo base: https://huggingface.co/distilbert/distilbert-base-uncased
- Documentación de DistilBERT en Transformers: https://huggingface.co/docs/transformers/model_doc/distilbert
- Text Embeddings Inference: https://github.com/huggingface/text-embeddings-inference
