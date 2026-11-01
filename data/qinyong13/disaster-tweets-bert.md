# qinyong13/disaster-tweets-bert

## Resumen

`qinyong13/disaster-tweets-bert` es un modelo de clasificación de texto obtenido mediante fine-tuning de `google-bert/bert-base-uncased` sobre el conjunto de datos del desafío de Kaggle *NLP with Disaster Tweets*. Su tarea es binaria: determinar si un tuit se refiere a un desastre real (incendio, terremoto, accidente, etc.) o si emplea vocabulario catastrófico de forma figurada o metafórica. Lo publica el usuario `qinyong13` bajo licencia Apache 2.0.

El modelo es relevante como ejemplo práctico de adaptación de un encoder BERT base a una tarea de clasificación de alta precisión sobre dominios ruidosos (texto corto, informal, con jerga y errores ortográficos). Con 109,5 millones de parámetros, un repositorio de 0,6 GB y pesos disponibles tanto en `safetensors` como en `onnx`, está pensado para despliegues ligeros y de baja latencia, no para generación de texto.

No se trata de un modelo conversacional ni de propósito general: es un clasificador especializado de dos clases. Su utilidad principal radica en pipelines de monitorización de redes sociales, sistemas de alerta temprana y tareas de filtrado de contenido donde se necesita distinguir señales reales de emergencia del ruido lingüístico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT base, 12 capas, 768 dimensiones ocultas, 12 cabezas de atención) |
| Parametros totales | 109.483.778 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens (límite estándar de `bert-base-uncased`) |
| Tipos de cuantizacion | no disponible (pesos en FP32/BF16 según safetensors; ONNX exportado) |
| Idiomas soportados | no disponible (el modelo base es `bert-base-uncased`, principalmente inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, ONNX |

## Arquitectura y entrenamiento

La arquitectura es un transformer encoder tipo BERT base: 12 capas, 768 dimensiones ocultas, 12 cabezas de auto-atención y 110 millones de parámetros. Sobre el encoder se añade una cabeza de clasificación lineal de dos clases (no desastre / desastre). El tokenizador es el WordPiece de `bert-base-uncased`, con vocabulario de 30.522 tokens y normalización a minúsculas.

El fine-tuning se realizó sobre las 7.613 muestras etiquetadas del dataset *NLP with Disaster Tweets* de Kaggle. La model card no documenta hiperparámetros de entrenamiento (tasa de aprendizaje, número de épocas, tamaño de lote), ni si se aplicaron técnicas de aumento de datos, ponderación de clases o búsqueda de hiperparámetros. Tampoco se indica si el conjunto de test utilizado para las métricas reportadas es una partición del propio dataset de Kaggle o un conjunto retenido independiente. No se menciona RLHF, DPO ni ninguna técnica de alineación, algo esperable en un clasificador encoder.

## Capacidades

- Clasificación binaria de texto: distingue entre tuits que describen un desastre real y tuits que usan lenguaje catastrófico de forma no literal.
- Procesamiento de texto corto e informal: entrenado sobre tuits con jerga, abreviaturas, menciones, hashtags y errores ortográficos.
- Inferencia ligera: al ser un encoder de 110 M de parámetros, admite despliegue en CPU y GPU de gama baja.
- Exportación a ONNX: permite integración en runtimes optimizados (ONNX Runtime) y despliegues sin dependencia de PyTorch.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo de pensamiento.
- Capacidad multilingüe: no disponible; el modelo base está entrenado principalmente en inglés.

## Casos de uso

- Monitorización de redes sociales para alerta temprana: el clasificador puede filtrar en tiempo real el flujo de tuits y marcar candidatos a desastre real, reduciendo el volumen que llega a revisión humana. Su ventana de 512 tokens cubre de sobra la longitud típica de un tuit.
- Verificación de fuentes ciudadanas: en plataformas de periodismo participativo, se puede usar como primer filtro para separar reportes genuinos de emergencias de mensajes figurados o humorísticos.
- Moderación y triaje de contenido: en sistemas de gestión de incidencias, clasifica automáticamente mensajes entrantes y los enruta al equipo de emergencias o al de comunicación según la predicción.
- Integración en pipelines de ONNX Runtime: al disponer de pesos ONNX, puede desplegarse en entornos de producción con latencia baja y sin GPU dedicada, por ejemplo en funciones serverless o contenedores ligeros.
- Análisis histórico de eventos: permite reclasificar grandes corpus de tuits ya almacenados para estudiar la evolución de la percepción pública durante catástrofes.
- Filtrado previo en sistemas de recomendación o búsqueda: descarta contenido no relacionado con emergencias reales antes de aplicar modelos más costosos de comprensión o generación.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente):

| Tarea | Métrica | Valor |
|---|---|---|
| Disaster tweet classification | Accuracy | 0,8373 |
| Disaster tweet classification | F1 (clase desastre) | 0,8127 |

No se han publicado en la información disponible resultados comparativos con otros modelos sobre el mismo conjunto de test, ni métricas de precisión, recall o AUC.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,5 GB en FP32 y alrededor de 0,25 GB en FP16. Cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: no requiere GPU dedicada; funciona en CPU con latencia aceptable para clasificación por lotes. En GPU, cualquier modelo desde una GTX 1650 en adelante es suficiente.
- Cabe en GPU consumer: sí, en todas las GPU con al menos 1 GB de VRAM, incluidas integradas modernas.
- Opciones de despliegue: `transformers` pipeline, ONNX Runtime, Hugging Face Inference Endpoints, TorchServe, FastAPI con `optimum`. También es compatible con `text-embeddings-inference` en modo clasificación.
- Latencia y throughput estimados: no disponibles en la información proporcionada. Para un encoder de este tamaño, el throughput típico en CPU moderna ronda los cientos de inferencias por segundo en lotes, pero no hay medición oficial.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `qinyong13/disaster-tweets-bert` | 109,5 M | 512 | Clasificación binaria de desastres | Apache 2.0 | Hugging Face |
| `google-bert/bert-base-uncased` | 110 M | 512 | Modelo base sin fine-tuning | Apache 2.0 | Hugging Face |
| `distilbert-base-uncased` | 66 M | 512 | Modelo base destilado | Apache 2.0 | Hugging Face |
| `roberta-base` | 125 M | 512 | Modelo base alternativo | MIT | Hugging Face |

La comparación directa de rendimiento con alternativas no está disponible, ya que no se han publicado resultados de otros clasificadores sobre el mismo conjunto de test en la información proporcionada.

## Limitaciones y advertencias

- Dominio muy restringido: el modelo solo está entrenado para clasificación binaria de desastres en tuits. No debe usarse para otras tareas de clasificación ni para generación de texto.
- Idioma: el modelo base es `bert-base-uncased`, principalmente inglés. El rendimiento en castellano u otros idiomas no está evaluado y probablemente sea deficiente.
- Riesgo de alucinación: al ser un clasificador, no genera texto, pero puede producir falsos positivos y falsos negativos. Los valores de accuracy y F1 reportados (0,8373 y 0,8127) implican un margen de error no despreciable en producción.
- Métricas no verificadas: los resultados de la model card están marcados como no verificados de forma independiente. No se documenta la partición de test utilizada.
- Sesgos: el dataset de Kaggle puede contener sesgos geográficos y lingüísticos propios de la muestra de tuits recogida. No se ha realizado un análisis de sesgos por subgrupos.
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificación y redistribución con atribución. No obstante, el modelo base `bert-base-uncased` también es Apache 2.0, por lo que no hay conflicto de licencias.
- Caveat para producción: no se documentan hiperparámetros de entrenamiento ni el proceso de selección del modelo, lo que dificulta la reproducibilidad. Se recomienda validar el modelo sobre datos propios antes de desplegarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/qinyong13/disaster-tweets-bert
- Modelo base: https://huggingface.co/google-bert/bert-base-uncased
- Dataset de referencia (Kaggle, *NLP with Disaster Tweets*): https://www.kaggle.com/c/nlp-getting-started
- Documentación de `transformers` para clasificación de texto: https://huggingface.co/docs/transformers/tasks/sequence_classification
