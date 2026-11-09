# evelnap/indobertweet-text-only-s1

## Resumen

`evelnap/indobertweet-text-only-s1` es un modelo de clasificación de texto en indonesio obtenido mediante fine-tuning de `indolem/indobertweet-base-uncased`, un BERT base adaptado al indonesio y al habla informal de redes sociales. El modelo resuelve una tarea concreta de clasificación binaria de toxicidad, con dos etiquetas posibles: `non_toxic` y `toxic`. Lo publica el usuario evelnap y está pensado para filtrar contenido tóxico en textos en indonesio.

La relevancia práctica es acotada: se trata de un ajuste fino de un modelo base de 110,6 millones de parámetros, con 14 descargas y sin resultados de benchmarks publicados. No es un modelo generativo ni un modelo de propósito general; es un clasificador de secuencia que devuelve una distribución sobre dos clases. Su interés está en el caso de uso específico (moderación de contenido en indonesio), no en capacidades generales de razonamiento o generación.

La información disponible es escasa: la model card está en indonesio, no documenta el dataset de entrenamiento, no incluye métricas de evaluación y no declara licencia. Cualquier evaluación en producción debe partir de una validación propia sobre datos representativos del dominio objetivo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (transformer encoder), base model `indolem/indobertweet-base-uncased` |
| Parametros totales | 110.559.746 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base es BERT base, tipicamente 512 tokens) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; compatible con cuantizacion estandar de transformers, no documentada por el autor) |
| Idiomas soportados | indonesio (`id`) |
| Licencia | no disponible |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo es un encoder transformer tipo BERT con cabeza de clasificación de secuencia (`AutoModelForSequenceClassification`) para clasificación de etiqueta única (`single_label_classification`). Parte de `indolem/indobertweet-base-uncased`, un BERT base entrenado sobre texto indonesio de Twitter, lo que le da familiaridad con lenguaje informal, abreviaturas y ruido típico de redes sociales. El número total de parámetros reportado en safetensors es de 110.559.746, coherente con un BERT base más la cabeza de clasificación.

El autor indica que los hiperparámetros se buscaron con Optuna, pero no detalla el dataset, el número de ejemplos, la composición de las clases, la proporción de train/validation/test ni si hubo balanceo. No se documenta ningún proceso de RLHF/DPO (no aplica a un clasificador de este tipo). La model card recomienda aplicar al texto de entrada el mismo preprocesado usado en entrenamiento (minúsculas, normalización de emojis, menciones y URLs) para que las predicciones sean consistentes; esto sugiere que el pipeline de entrenamiento incluía limpieza de texto de redes sociales, pero no se publica el código.

## Capacidades

- Clasificación binaria de texto en indonesio: devuelve `non_toxic` o `toxic`.
- Detección de toxicidad en texto informal, con posible sensibilidad a jerga y ruido de redes sociales gracias al preentrenamiento del modelo base en Twitter.
- Integración con la librería `transformers` mediante `AutoTokenizer` y `AutoModelForSequenceClassification`.
- Compatible con Text Embeddings Inference y endpoints compatibles (según los tags del repositorio).
- No soporta generación de texto, tool calling, function calling, razonamiento multi-paso, visión, audio ni modo thinking.
- Capacidad multilingüe: limitada al indonesio; no se declaran otros idiomas.
- No se documentan capacidades de clasificación multietiqueta ni de regresión de intensidad de toxicidad.

## Casos de uso

- Moderación de comentarios en plataformas indonesias: el modelo puede puntuar cada comentario y enviar a revisión humana los clasificados como `toxic`, reduciendo la carga de moderadores en foros, apps de noticias o redes sociales con audiencia indonesia.
- Filtrado previo de datasets de entrenamiento: al construir corpus en indonesio, se puede ejecutar el clasificador sobre cada documento para descartar contenido tóxico antes de usarlo en el entrenamiento de modelos generativos.
- Moderación de reseñas y valoraciones de producto: clasificar reseñas de e-commerce en indonesio y priorizar las que contienen lenguaje tóxico para su revisión o eliminación.
- Monitorización de comunidades y chats: procesar mensajes en tiempo real (o por lotes) en canales de Discord, Telegram o foros y activar alertas cuando la proporción de mensajes tóxicos supera un umbral.
- Análisis de toxicidad para investigación social: etiquetar grandes volúmenes de tuits o posts en indonesio para estudios cuantitativos sobre discurso hostil, con la advertencia de validar el clasificador en el dominio concreto.
- Enrutado en pipelines de atención al cliente: detectar mensajes de clientes con tono tóxico o agresivo y derivarlos a un flujo con prioridad o a un agente humano, evitando respuestas automáticas inadecuadas.
- Preprocesado en sistemas de detección de abuso más amplios: usar la salida del clasificador como una señal más dentro de un ensemble o un sistema de reglas para decidir si un contenido requiere revisión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,45 GB de pesos (110,6 M de parámetros × 4 bytes), más activaciones y overhead del runtime; en la práctica, menos de 2 GB en total para lotes pequeños.
- En fp16/bf16: aproximadamente 0,22 GB de pesos; cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM; RTX 3060, RTX 4060, RTX 4090, T4, L4, A10, A100 o H100 son suficientes. También es viable en CPU para volúmenes moderados.
- Cabe en GPU consumer: sí, en prácticamente todas las GPU dedicadas modernas e incluso en iGPU con suficiente memoria compartida.
- Opciones de despliegue: `transformers` (PyTorch), Text Embeddings Inference (tag del repo), endpoints compatibles; también es posible exportarlo a ONNX o cuantizarlo con las herramientas estándar de Hugging Face, aunque el autor no documenta estos flujos.
- Latencia y throughput: no disponibles en la información proporcionada. Por el tamaño del modelo, se espera un throughput alto en GPU (miles de documentos por segundo en lote con GPUs modernas) y aceptable en CPU, pero son estimaciones no verificadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `evelnap/indobertweet-text-only-s1` | 110,6 M | no disponible | Clasificación binaria de toxicidad en indonesio | no disponible | Hugging Face, 14 descargas |
| `indolem/indobertweet-base-uncased` | ~110 M | no disponible (BERT base, típicamente 512) | Modelo base enmascarado en indonesio | no disponible en la información consultada | Hugging Face, ampliamente usado |
| Clasificadores de toxicidad multilingües basados en XLM-R | ~278 M (XLM-R base) | no disponible (típicamente 512) | Clasificación de toxicidad multilingüe | variable según el checkpoint | Hugging Face |

La comparación con alternativas concretas es limitada porque no se dispone de métricas del modelo ni de una lista verificada de clasificadores comparables en indonesio. La alternativa más directa es el propio modelo base `indolem/indobertweet-base-uncased` sin ajuste, que no realiza clasificación de toxicidad por sí mismo; y, para cobertura multilingüe, clasificadores basados en XLM-R, cuyo rendimiento en indonesio no se ha verificado en esta ficha.

## Limitaciones y advertencias

- No se declara licencia: no está claro si se permite uso comercial; hay que contactar con el autor antes de usarlo en producción.
- No se documenta el dataset de entrenamiento, el número de ejemplos ni el balance de clases; el riesgo de sesgos hacia una clase o hacia ciertos registros es desconocido.
- No hay métricas de evaluación publicadas (precisión, recall, F1, AUC); no se puede afirmar su calidad sin una validación propia.
- Riesgo de alucinación no aplica en el sentido generativo, pero sí de falsos positivos y falsos negativos en la clasificación.
- El modelo está entrenado sobre texto de Twitter en indonesio; su rendimiento puede degradarse en otros dominios (texto formal, prensa, legal, médico) o en variedades regionales.
- La recomendación de replicar el preprocesado de entrenamiento implica que, sin ese pipeline, las predicciones pueden ser inconsistentes; el autor no publica el código de preprocesado.
- Solo cubre indonesio; no es adecuado para otros idiomas sin validación.
- El modelo tiene 14 descargas y 0 likes en el momento de la consulta, lo que indica poca validación por parte de la comunidad.
- La model card está en indonesio y es muy breve; no hay información sobre sesgos medidos, robustez ante ataques adversariales ni comportamiento en textos largos.
- Es un clasificador binario: no distingue tipos de toxicidad (insulto, amenaza, discurso de odio) ni intensidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/evelnap/indobertweet-text-only-s1
- Modelo base: https://huggingface.co/indolem/indobertweet-base-uncased
