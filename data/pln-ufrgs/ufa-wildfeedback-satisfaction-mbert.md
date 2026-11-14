# pln-ufrgs/ufa-wildfeedback-satisfaction-mbert

## Resumen

UFA WildFeedback Satisfaction mBERT es un clasificador de texto multilingüe desarrollado por el grupo PLN-UFRGS (trabajo INF01100, Grupo 16) que detecta el grado de satisfacción del usuario en conversaciones de retroalimentación. Se trata de un fine-tuning de `google-bert/bert-base-multilingual-cased` sobre el subconjunto `sat_dsat_annotation` del dataset `microsoft/WildFeedback`, con tres etiquetas de salida: satisfacción (SAT), insatisfacción (DSAT) y ausencia de señal.

El modelo resuelve una tarea de clasificación de sentimiento orientada a feedback de producto, no a reseñas genéricas: distingue entre usuarios satisfechos, insatisfechos y mensajes que no expresan señal afectiva clara. Es relevante porque aplica un encoder multilingüe consolidado (mBERT, 178 M de parámetros, contexto de 512 tokens) a un corpus anotado específicamente para análisis de feedback, y libera tres semillas independientes con resultados de hold-out documentados.

La arquitectura es un transformer encoder estándar con una cabeza lineal de clasificación sobre el token `[CLS]`. El repositorio pesa 2,1 GB e incluye tres particiones (`seed-0`, `seed-1`, `seed-2`) con encoder, tokenizer, pesos de la cabeza y metadatos de ejecución. La licencia del encoder exportado es Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT base multilingüe) + cabeza lineal `nn.Linear(768, 3)` sobre `[CLS]` |
| Parametros totales | 178 M (bert-base-multilingual-cased) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens (límite de mBERT); entrenamiento con `max_length=128` |
| Tipos de cuantizacion | no disponible (pesos en safetensors; admite cuantización estándar de transformers, no documentada) |
| Idiomas soportados | multilingüe (heredado de mBERT, 104 idiomas en el modelo base) |
| Licencia | Apache-2.0 (encoder exportado); corpus WildFeedback bajo ODC-By |
| Formato de pesos | safetensors (encoder + `classifier_head.safetensors`) |

## Arquitectura y entrenamiento

El modelo parte de `bert-base-multilingual-cased`, un transformer encoder de 12 capas, 768 dimensiones ocultas y 178 M de parámetros, y sustituye la cabeza estándar de `AutoModelForSequenceClassification` por una capa lineal explícita de 768 a 3 aplicada sobre `last_hidden_state[:, 0]` (token `[CLS]`). La función de pérdida es entropía cruzada sin ponderación de clases, y la selección de época se realiza por early stopping sobre macro F1 en validación.

El entrenamiento usa el subconjunto `sat_dsat_annotation` de `microsoft/WildFeedback`, con partición `test_fraction=0.12` estratificada por conversación y `role=User`. La validación es un hold-out de conversaciones sin estratificar de 15 000 ejemplos (distribución real, aproximadamente 87 % sin señal), decisión tomada porque un `val-size` de 3000 generaba solo unos 31 ejemplos SAT y hacía inestable el early stopping. El conjunto de entrenamiento se balancea con un techo de 10 000 ejemplos por clase; SAT no alcanza ese techo tras el hold-out (unos 5110 ejemplos). El entrenamiento se ejecutó en una RTX 4060 de 8 GB con batch 16, `max_length=128` y precisión fp16. Cada semilla registra su mejor época en validación: seed-0 época 1, seed-1 época 3, seed-2 época 1.

## Capacidades

- Clasificación de texto en tres clases: SAT (satisfacción), DSAT (insatisfacción) y sin señal.
- Detección de sentimiento orientada a feedback de usuario en conversaciones, no a reseñas aisladas.
- Procesamiento multilingüe heredado de mBERT (cobertura de más de 100 idiomas en el encoder base).
- Manejo de entradas de hasta 128 tokens en el régimen de entrenamiento (hasta 512 por límite arquitectónico).
- Inferencia determinista por seed: se pueden cargar tres clasificadores independientes y comparar sus salidas.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un clasificador, no un modelo generativo.
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Triaje de feedback de producto: clasificar automáticamente mensajes de usuarios en SAT, DSAT o sin señal para enrutar los casos negativos a equipos de soporte y priorizar incidencias.
- Monitorización de satisfacción en canales de atención: procesar conversaciones multi-turno (el split se hace por conversación) y agregar la proporción de DSAT por periodo o por producto.
- Análisis de reseñas y encuestas multilingües: al heredar el vocabulario de mBERT, puede aplicarse a feedback en varios idiomas sin reentrenamiento específico por lengua, aunque el corpus de ajuste es mayoritariamente en inglés.
- Filtrado previo en pipelines de NLP: usar la clase "sin señal" para descartar mensajes neutros o irrelevantes antes de pasarlos a modelos generativos o de análisis más costosos.
- Investigación en análisis de feedback: las tres semillas permiten estudiar la varianza del ajuste fino y comparar estrategias de agregación, tal como documenta el propio autor.
- Etiquetado asistido para anotación humana: preetiquetar grandes volúmenes de feedback y revisar manualmente solo los casos de baja confianza o las clases minoritarias (SAT/DSAT).
- Señal auxiliar en sistemas de recomendación o CRM: incorporar la predicción de satisfacción como feature adicional en modelos de churn o de priorización de tickets.

## Benchmarks y rendimiento

Resultados de hold-out publicados por el autor (macro F1 sobre el harness compartido; la agregación de semillas no está cerrada como métrica oficial):

| Seed | n test | Precisión macro | Recall macro | Macro F1 | SAT F1 | DSAT F1 | Sin señal F1 |
|---|---:|---:|---:|---:|---:|---:|---:|
| 0 | 63000 | 0.5683 | 0.7927 | 0.6349 | 0.4875 | 0.4901 | 0.9270 |
| 1 | 62865 | 0.5373 | 0.7911 | 0.5971 | 0.4872 | 0.4086 | 0.8954 |
| 2 | 62920 | 0.5378 | 0.8141 | 0.6043 | 0.4536 | 0.4537 | 0.9055 |
| Media | — | 0.5478 | 0.7993 | 0.6121 | — | — | — |
| Desv. poblacional | — | — | — | 0.0164 | — | — | — |

No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,7-1 GB en fp32 (178 M de parámetros), menos de 0,5 GB en fp16 o int8. Cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: RTX 4060 de 8 GB (la usada en el entrenamiento), RTX 3060, RTX 4090, A100 o H100; también funciona en CPU para volúmenes moderados.
- Cabe en GPU consumer sin problema; incluso en iGPU o CPU con llama.cpp/ONNX Runtime para lotes pequeños.
- Opciones de despliegue: `transformers` con `AutoModel` y carga manual de `classifier_head.safetensors`, pipeline de `text-classification`, vLLM no aplica (no es generativo), TGI no aplica, ONNX Runtime y TorchScript viables para producción.
- Throughput estimado: no disponible en la información proporcionada; con batch 16 y `max_length=128` en RTX 4060 el entrenamiento fue viable, lo que sugiere latencias de milisegundos por lote en GPU consumer.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| UFA WildFeedback Satisfaction mBERT | 178 M | 512 | Clasificación SAT/DSAT/sin señal | Apache-2.0 | Hugging Face |
| bert-base-multilingual-cased (base) | 178 M | 512 | Representaciones generales | Apache-2.0 | Hugging Face |
| Modelos de sentimiento multilingües genéricos (p. ej. XLM-R fine-tuned) | 278 M-560 M | 512 | Sentimiento positivo/negativo/neutro | varía | Hugging Face |

No se dispone de resultados de benchmarks comparativos directos con alternativas en la información proporcionada.

## Limitaciones y advertencias

- Macro F1 medio de 0,6121 con desviación de 0,0164 entre semillas: el rendimiento en las clases minoritarias (SAT y DSAT) es bajo (F1 entre 0,41 y 0,49), dominado por la clase mayoritaria "sin señal" (F1 en torno a 0,90).
- El desbalance extremo del corpus (aproximadamente 87 % sin señal) provoca que el modelo tienda a predecir la clase mayoritaria; la precisión macro por debajo de 0,57 lo confirma.
- La partición de validación no está estratificada, lo que puede introducir sesgo en la selección de época.
- El autor advierte que `official_result` es `false` en los JSON locales hasta que el grupo valide los números para el artículo; los resultados deben tratarse como preliminares.
- La agregación de las tres semillas no está cerrada en el protocolo; la media y la desviación son descriptivas, no una métrica oficial de comparación.
- El corpus de ajuste es principalmente en inglés; el rendimiento en otros idiomas no está evaluado.
- Riesgo de alucinación no aplica (es un clasificador), pero sí de falsos positivos y negativos en las clases minoritarias.
- Licencia Apache-2.0 en el encoder exportado, pero el corpus WildFeedback es ODC-By y requiere citar el dataset en usos derivados.
- El paquete de inferencia (`user_feedback_analysis`) es necesario para cargar el modelo tal como documenta el autor; sin él hay que reconstruir manualmente la cabeza lineal sobre `[CLS]`.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/pln-ufrgs/ufa-wildfeedback-satisfaction-mbert
- Dataset WildFeedback: https://huggingface.co/datasets/microsoft/WildFeedback
- Modelo base: https://huggingface.co/google-bert/bert-base-multilingual-cased
- Código del trabajo: https://github.com/JoaoVitorBaggio/UserFeedbackAnalysis
