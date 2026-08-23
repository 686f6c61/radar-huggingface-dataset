# AlexStamp/roberta-base-finetuned-yelp-ratings

## Resumen

El modelo `AlexStamp/roberta-base-finetuned-yelp-ratings` es un ajuste fino de `FacebookAI/roberta-base` para la clasificación de reseñas de Yelp en cinco categorías ordinales: de 1 a 5 estrellas. Desarrollado por AlexStamp, el modelo sustituye representaciones clásicas tipo bolsa de palabras o TF-IDF por representaciones contextuales bidireccionales, lo que permite capturar matices lingüísticos como sarcasmo, negación o contexto multi-oración. Está pensado como una demostración educativa y experimental de fine-tuning de Transformers, no como un predictor listo para producción.

La arquitectura base es RoBERTa-base, con 124,6 millones de parámetros y una longitud máxima de secuencia de 512 tokens. El modelo fue entrenado sobre un subconjunto de 10.000 reseñas de Yelp procedentes de la competición de Kaggle RecSys2013, con una división estratificada en 80% entrenamiento, 10% validación y 10% test. El ajuste se realizó con el framework Hugging Face Trainer, usando PyTorch y entrenamiento de precisión mixta (fp16) en una GPU NVIDIA T4.

La relevancia actual de este modelo reside en su uso como ejemplo didáctico para explorar el fine-tuning de modelos transformer en tareas de clasificación multiclase con etiquetas ordinales, así como para comparar arquitecturas contextuales frente a métodos tradicionales. Su licencia MIT permite reutilización libre, lo que facilita su incorporación en proyectos de aprendizaje o prototipos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RoBERTa-base (Transformer encoder, 12 capas, 12 cabezas de atención) |
| Parametros totales | 124.649.477 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | no disponible (pesos en safetensors de precisión completa) |
| Idiomas soportados | Inglés (en) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `FacebookAI/roberta-base`, una arquitectura Transformer encoder-only con 12 capas, 12 cabezas de atención y 768 dimensiones ocultas. Se ha realizado un fine-tuning completo, es decir, todos los parámetros del modelo han sido entrenados para la tarea de clasificación de 5 clases (etiquetas 0 a 4 correspondientes a 1 a 5 estrellas). El entrenamiento se llevó a cabo sobre un subconjunto de 10.000 reseñas del dataset Yelp de RecSys2013 (Kaggle), que originalmente contiene unas 230.000 reseñas. Se utilizó una partición estratificada para preservar la distribución de estrellas.

Los hiperparámetros principales incluyen: learning rate de 2e-5, batch size de 16, optimizador AdamW, scheduler lineal, 3 épocas y entrenamiento con precisión mixta (fp16). El mejor checkpoint se seleccionó según la macro-F1 de validación. No se aplicó rebalanceo de clases ni oversampling. La métrica de evaluación principal es la macro-F1, complementada con precisión, recall, MAE y otras métricas específicas para etiquetas ordinales.

## Capacidades

- Clasificación de texto en 5 categorías ordinales (1 a 5 estrellas) a partir de reseñas de Yelp.
- Captura de matices lingüísticos como sarcasmo, negación y contexto multi-oración gracias a las representaciones bidireccionales de RoBERTa.
- Soporta entrada de texto libre en inglés, con una longitud máxima de 512 tokens.
- No incluye capacidades de generación de texto, tool calling, agentes, visión o audio.
- No dispone de modo de razonamiento explícito ni soporte multilingüe más allá del inglés.
- Adecuado para tareas de análisis de sentimiento y clasificación de opiniones en inglés.

## Casos de uso

- Análisis de opiniones de clientes en plataformas de reseñas: el modelo puede asignar una puntuación de 1 a 5 estrellas a un texto de reseña, útil para monitorizar la satisfacción en comercios, restaurantes o servicios.
- Clasificación ordinal de feedback en encuestas: se puede adaptar para clasificar respuestas abiertas en niveles de satisfacción (muy insatisfecho, insatisfecho, neutro, satisfecho, muy satisfecho) con un pequeño ajuste de etiquetas.
- Educación en NLP: sirve como ejemplo práctico para enseñar fine-tuning de transformers, comparación con modelos lineales y evaluación de métricas multiclase.
- Prototipado de sistemas de recomendación: aunque no es el objetivo original, puede servir para predecir la valoración de un negocio a partir de reseñas textuales en entornos de investigación.
- Filtrado de reseñas: en plataformas que necesitan detectar reseñas extremadamente positivas o negativas para priorizar moderación, el modelo puede ayudar a identificar reseñas con valoraciones bajas o altas.
- Evaluación de modelos de lenguaje: como benchmark de clasificación de texto, se puede comparar contra otros modelos de base en tareas de sentimiento y ordinalidad.

## Benchmarks y rendimiento

La model card del autor declara los siguientes resultados sobre el conjunto de test (1000 reseñas):

| Métrica | Score |
|---|---|
| Accuracy | 0.639 |
| Macro F1 | 0.631 |
| Macro Precision | 0.634 |
| Macro Recall | 0.630 |
| ROC-AUC (One-vs-Rest) | 0.904 |
| PR-AUC | 0.682 |
| MAE | 0.387 |
| MSE | 0.451 |
| Off-by-1 Accuracy | 0.980 |
| Off-by-1 Macro-F1 | 0.973 |

No se han publicado resultados comparativos con otros modelos en la información disponible. Los valores de ROC-AUC y PR-AUC se calcularon con estrategia one-vs-rest. Las métricas de MAE, MSE y off-by-1 reflejan la naturaleza ordinal de la tarea.

## Requisitos de hardware

- VRAM estimada: no disponible explícitamente. Dado el tamaño de 124M parámetros, la inferencia en fp32 requeriría aproximadamente 500 MB de memoria, pero se recomienda usar cuantización o FP16 para reducir el consumo.
- GPUs recomendadas: el autor entrenó en una NVIDIA T4 (16 GB) con fp16. Para inferencia, una GPU con 8 GB de VRAM (por ejemplo, RTX 3060, RTX 3070) sería suficiente.
- Cabe en GPUs de consumo: sí, con cuantización o incluso en FP16 sin cuantizar.
- Opciones de despliegue: vLLM, Hugging Face Inference Endpoints, Ollama (si se convierte a GGUF), llama.cpp, o mediante la librería Transformers directamente.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Resultado |
|---|---|---|---|---|---|
| AlexStamp/roberta-base-finetuned-yelp-ratings | 124,6M | 512 | Clasificación 5 estrellas | MIT | Accuracy 0.639 |
| VictorSanh/roberta-base-finetuned-yelp-polarity | 124,6M | 512 | Clasificación binaria (positivo/negativo) | MIT | Accuracy 0.9808 |
| FacebookAI/roberta-base | 124,6M | 512 | Modelo base preentrenado | MIT | - |

La comparativa muestra que el modelo de polaridad binaria alcanza una precisión mucho mayor (98%) que el de 5 estrellas (63.9%), lo que es esperable por la mayor dificultad de clasificación ordinal multiclase. Ambos comparten arquitectura y tamaño. No se dispone de datos de otros modelos comparables.

## Limitaciones y advertencias

- El modelo fue entrenado solo con 10.000 reseñas, un subconjunto pequeño del dataset original, lo que puede limitar su generalización a reseñas de otras fuentes o dominios.
- La precisión de 0.639 en accuracy es moderada; para tareas de producción con datos reales se requeriría un entrenamiento con un dataset más grande y equilibrado.
- No se han reportado sesgos específicos, pero al ser un modelo basado en RoBERTa, puede heredar los sesgos del corpus de preentrenamiento.
- Riesgo de alucinación: como modelo de clasificación, no genera texto libre, por lo que el riesgo de alucinación no es relevante en su uso.
- Limitación de idioma: solo inglés. No soporta otros idiomas.
- Licencia MIT permite uso comercial, pero el autor declara que el modelo es para fines educativos y experimentales, no para producción.
- El modelo no ha sido evaluado en otros conjuntos de datos ni tareas, por lo que su rendimiento fuera del dominio de reseñas de Yelp es desconocido.

## Enlaces

- HuggingFace: https://huggingface.co/AlexStamp/roberta-base-finetuned-yelp-ratings
- Modelo base: https://huggingface.co/FacebookAI/roberta-base
- Dataset original (Kaggle): https://www.kaggle.com/competitions/yelp-recsys-2013/overview
