# Operaer/disaster-tweet-bert

## Resumen

`Operaer/disaster-tweet-bert` es un modelo de clasificación de texto en inglés obtenido por fine-tuning de `google-bert/bert-base-uncased` sobre el conjunto de datos de la competición de Kaggle *Real or Not? NLP with Disaster Tweets* (`nlp-getting-started`). Su tarea es un problema de clasificación binaria: determinar si una publicación de Twitter se refiere a una catástrofe real (incendios, terremotos, accidentes) o si, por el contrario, emplea vocabulario catastrófico de forma figurada o no relacionada.

El modelo tiene 109.483.778 parámetros (BERT-base, 12 capas, 768 dimensiones ocultas) y una ventana de contexto de 512 tokens, aunque el autor limitó el entrenamiento a 128 tokens por muestra. Se distribuye en formato safetensors con licencia Apache 2.0 y un tamaño de repositorio de 0,4 GB, lo que lo hace trivial de desplegar en CPU o en cualquier GPU de consumo.

Es relevante ahora únicamente como referencia práctica: se trata de un artefacto docente (así lo declara el propio autor, "trabajo de curso de Procesamiento de Lenguaje Natural") con métricas modestas y 35 descargas. No compite con modelos de clasificación de producción, pero sirve como ejemplo reproducible de fine-tuning de BERT para clasificación de eventos y como punto de partida para pipelines de monitorización de redes sociales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder BERT-base (12 capas, 768 hidden, 12 cabezas) |
| Parametros totales | 109.483.778 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens (modelo base); entrenado con max_len=128 |
| Tipos de cuantizacion | no disponible (pesos safetensors en fp32; admite cuantización estándar vía bitsandbytes/ONNX no documentada por el autor) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es un transformer encoder estándar de tipo BERT-base, con una cabeza de clasificación de secuencia (`AutoModelForSequenceClassification`) de dos etiquetas: 0 = no desastre, 1 = desastre. No incorpora innovaciones arquitectónicas: es el `bert-base-uncased` original con la capa de clasificación reentrenada.

El fine-tuning se realizó sobre 7.613 muestras de entrenamiento del dataset de Kaggle, durante 2 épocas, con tasa de aprendizaje 2e-5, tamaño de lote 16 y longitud máxima de 128 tokens. No se documenta el uso de RLHF, DPO ni aumentación de datos. El autor publica el script `train.py` y una demo Gradio (`app.py`), pero la model card no detalla la partición exacta de validación ni la semilla empleada, lo que limita la reproducibilidad estricta de las métricas reportadas.

## Capacidades

- Clasificación binaria de texto corto en inglés: distingue tuits sobre desastres reales frente a tuits no relacionados o metafóricos.
- Salida de logits y probabilidad por clase mediante `AutoModelForSequenceClassification`.
- Manejo de texto informal de redes sociales (abreviaturas, menciones, URLs, hashtags) dentro de los límites del tokenizador WordPiece de BERT.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento de agente.
- No tiene capacidades multilingües: solo inglés.
- No dispone de modo de razonamiento (thinking), visión ni audio.

## Casos de uso

- Monitorización de alertas tempranas en redes sociales: clasificar en tiempo real un flujo de tuits y derivar a operadores humanos aquellos con probabilidad alta de desastre real, usando el modelo como primer filtro de bajo coste (109 M de parámetros, inferencia en CPU viable).
- Enrutamiento de quejas ciudadanas: en un sistema de atención al ciudadano que recibe mensajes cortos, separar los que describen incidentes reales (incendios, inundaciones) de los que usan lenguaje figurado.
- Etiquetado asistido en proyectos de anotación: preanotar grandes volúmenes de texto con una etiqueta preliminar y revisión humana posterior, reduciendo el coste de anotación manual.
- Filtro de contenido en foros y comentarios: detectar mensajes que reportan emergencias para priorizar su moderación o escalado.
- Base para experimentos académicos: servir de línea base reproducible en cursos y trabajos de NLP sobre clasificación de eventos y fine-tuning de BERT.
- Prototipado rápido de pipelines de clasificación: integrarse en un servicio Hugging Face Inference Endpoint o en un contenedor con `transformers` para validar un flujo de clasificación binaria antes de invertir en un modelo mayor.
- Detección de duplicados temáticos: agrupar tuits que reportan el mismo tipo de evento como paso previo a un sistema de deduplicación y geolocalización.

## Benchmarks y rendimiento

Métricas reportadas por el autor en el conjunto de validación del dataset de Kaggle:

| Metrica | Valor |
|---|---|
| Accuracy | 0.8451 |
| F1 (binary) | 0.8168 |
| Precision | 0.8297 |
| Recall | 0.8043 |

No se han publicado resultados de benchmarks estándar (MMLU, GLUE, SuperGLUE) en la información disponible, ni comparaciones con otros modelos en la model card.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,45 GB de pesos (109 M parámetros × 4 bytes) más activaciones; en la práctica, menos de 1 GB para lotes pequeños.
- VRAM estimada en fp16: alrededor de 0,25 GB de pesos.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; RTX 3060, RTX 4090, A100 o H100 funcionan sin problema, aunque el modelo está sobredimensionado para ellas.
- Cabe holgadamente en GPU de consumo (GTX 1650, RTX 3050) e incluso en CPU para inferencia de baja concurrencia.
- Opciones de despliegue: `transformers` con PyTorch, ONNX Runtime, Hugging Face Inference Endpoints, contenedores Docker con FastAPI, o exportación a GGUF para llama.cpp aunque no está documentada por el autor.
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño del modelo, se espera latencia de milisegundos por muestra en GPU y decenas de milisegundos en CPU, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Operaer/disaster-tweet-bert | 109,5 M | 512 (entrenado a 128) | Clasificación binaria de desastres | Apache 2.0 | Hugging Face |
| google-bert/bert-base-uncased | 110 M | 512 | Modelo base, sin fine-tuning para esta tarea | Apache 2.0 | Hugging Face |
| roberta-base (fine-tuned en el mismo dataset) | 125 M | 514 | Clasificación binaria de desastres | MIT | Hugging Face (varias variantes comunitarias) |
| distilbert-base-uncased | 66 M | 512 | Modelo base destilado | Apache 2.0 | Hugging Face |

No se dispone de comparaciones de rendimiento publicadas entre este modelo y alternativas en la información proporcionada; las métricas del autor no están contrastadas con las de otras variantes sobre la misma partición de validación.

## Limitaciones y advertencias

- Modelo de carácter docente: el autor lo declara explícitamente como trabajo de curso, sin validación en producción ni mantenimiento posterior documentado.
- Sesgo de dominio: entrenado exclusivamente con tuits en inglés del dataset de Kaggle; su comportamiento fuera de ese registro (noticias formales, otros idiomas, jerga regional) no está evaluado.
- Riesgo de alucinación no aplicable en sentido generativo, pero sí de falsos positivos y negativos: recall de 0,8043 implica que aproximadamente un 20 % de los desastres reales del conjunto de validación no se detectan.
- Ventana efectiva de 128 tokens durante el entrenamiento: textos más largos se truncan, lo que puede eliminar información relevante en la parte final del mensaje.
- Sin capacidades multilingües: no debe usarse con texto en castellano u otros idiomas sin reentrenamiento.
- Licencia Apache 2.0 permite uso comercial, pero el dataset de origen (Kaggle) puede tener condiciones propias que conviene revisar antes de un despliegue comercial.
- Ausencia de documentación sobre la partición de validación y la semilla: las métricas no son estrictamente reproducibles.
- Solo 35 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso comunitario ni de validación independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Operaer/disaster-tweet-bert
- Modelo base: https://huggingface.co/google-bert/bert-base-uncased
- Dataset de la competición: https://www.kaggle.com/c/nlp-getting-started
- Dataset referenciado en Hugging Face: https://huggingface.co/datasets/startificial/nlp-getting-started
