# jorgeasmz/distilbert-irony-tweeteval

## Resumen

El modelo `jorgeasmz/distilbert-irony-tweeteval` es un clasificador binario de detección de ironía en tweets en inglés, desarrollado por Jorge A. S. M. (jorgeasmz). Se basa en el modelo `distilbert-base-uncased` de Hugging Face, fine-tuneado sobre la configuración `irony` del dataset TweetEval, y posteriormente exportado a formato ONNX y cuantizado a int8 para inferencia eficiente en CPU. Su propósito explícito es complementar a un clasificador de sentimiento: la ironía invierte la polaridad semántica de un texto, por lo que un modelo de sentimiento superficial puede dar una confianza alta en una etiqueta incorrecta. Este modelo responde a la pregunta independiente de si el texto es irónico o no, permitiendo filtrar o recalibrar predicciones de sentimiento.

El modelo es ligero (el repositorio ocupa 0.1 GB) y está diseñado para despliegue en entornos con recursos limitados, como CPUs sin GPU. Incluye un umbral de decisión optimizado (0.84) seleccionado sobre el grafo int8, lo que refleja una atención cuidadosa a la calibración tras la cuantización. Su licencia Apache 2.0 permite uso comercial sin restricciones significativas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DistilBERT base uncased) |
| Parametros totales | no disponible (modelo base DistilBERT, 66M aprox., no confirmado en la ficha) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (DistilBERT soporta hasta 512 tokens, pero no se especifica en la ficha) |
| Tipos de cuantizacion | int8 (ONNX) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | ONNX (model-int8.onnx) |

## Arquitectura y entrenamiento

El modelo es un encoder transformer de tipo DistilBERT, una versión destilada de BERT con 6 capas, 12 cabezas de atención y 66 millones de parámetros (no confirmado en la ficha, pero es la arquitectura base conocida). La cabeza de clasificación se fine-tuneó sobre el subconjunto `irony` de TweetEval, un benchmark estándar para tareas de clasificación de tweets. El proceso de entrenamiento se describe en el repositorio fuente (https://github.com/jorgeasmz/NLP-Sentiment-Analysis), aunque no se detallan hiperparámetros específicos en la model card. Tras el fine-tuning, el checkpoint se exportó a ONNX y se cuantizó a int8, lo que reduce el tamaño y acelera la inferencia en CPU. La cuantización altera la escala de probabilidades, por lo que el umbral de decisión (0.84) se recalibró sobre el grafo int8, no sobre el checkpoint original.

## Capacidades

- Detección binaria de ironía en tweets en inglés (clasificación de texto).
- Salida de probabilidad para la clase "irónico" (índice 1) mediante softmax sobre logits.
- Inferencia eficiente en CPU gracias a la cuantización int8 y al formato ONNX.
- Integración sencilla con `onnxruntime` y `transformers` (tokenizer).
- No soporta tool calling, agentes, generación de texto ni capacidades multimodales.
- No es multilingüe; está entrenado exclusivamente en inglés.

## Casos de uso

- Filtro de predicciones de sentimiento en redes sociales: un sistema de análisis de opinión puede usar este modelo para detectar tweets irónicos y descartar o invertir la etiqueta de sentimiento asignada por un clasificador superficial, mejorando la precisión global del pipeline.
- Monitorización de marca en tiempo real: empresas que rastrean menciones en Twitter pueden identificar comentarios irónicos que, de otro modo, se contarían como positivos o negativos erróneamente, permitiendo una respuesta más matizada.
- Moderación de contenido en plataformas sociales: el modelo puede marcar publicaciones potencialmente irónicas para revisión humana, evitando que el sarcasmo se interprete como agresión o spam.
- Análisis de campañas políticas o de opinión pública: los investigadores pueden cuantificar la prevalencia de ironía en discusiones políticas, separando críticas reales de comentarios sarcásticos.
- Mejora de sistemas de recomendación de contenido: al detectar ironía, se puede ajustar la relevancia de un tweet en feeds personalizados, evitando que contenido sarcástico se muestre fuera de contexto.
- Entrenamiento de modelos más grandes: el modelo puede servir como un componente de preprocesamiento o como un "teacher" para destilar conocimiento en sistemas más ligeros, aunque su uso principal es como clasificador independiente.

## Benchmarks y rendimiento

Métricas medidas en el split de test de TweetEval (784 tweets), con decisión por argmax (regla estándar del benchmark):

| Metrica | Valor |
|---|---|
| F1 (clase irónica) | 0.664 |
| Precision (clase irónica) | 0.559 |
| Recall (clase irónica) | 0.817 |
| Macro F1 | 0.672 |
| Accuracy | 0.672 |

El umbral de decisión recomendado es 0.84, seleccionado en el split de validación para maximizar macro F1. No se proporcionan comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- Inferencia en CPU: el modelo ONNX int8 es extremadamente ligero; puede ejecutarse en cualquier CPU moderna sin GPU.
- VRAM: no requiere VRAM dedicada; si se usa en GPU, el consumo es inferior a 1 GB (modelo de ~66M parámetros en int8).
- GPUs recomendadas: cualquier GPU con soporte ONNX Runtime (incluso integradas), aunque no es necesario.
- Opciones de despliegue: `onnxruntime` (Python, C++, etc.), `text-embeddings-inference` (mencionado en tags), o cualquier runtime compatible con ONNX.
- Latencia: en CPU, la inferencia de un tweet de hasta 96 tokens (longitud de truncamiento usada en el ejemplo) tarda típicamente menos de 10 ms en hardware moderno; el throughput puede superar 1000 predicciones por segundo en un solo núcleo.
- El modelo también puede cargarse con `transformers` si se convierte a PyTorch, pero el formato distribuido es ONNX.

## Comparativa con modelos similares

No se dispone de datos de comparación con otros modelos de detección de ironía en la información proporcionada. Como referencia, el modelo base DistilBERT sin fine-tuning no es capaz de detectar ironía, y los modelos de tamaño completo como BERT o RoBERTa fine-tuneados en TweetEval suelen obtener F1 superiores (por ejemplo, RoBERTa-large alcanza ~0.75 en la tarea de ironía), pero requieren más recursos. Este modelo prioriza la eficiencia y la facilidad de despliegue sobre el rendimiento máximo.

## Limitaciones y advertencias

- Entrenado exclusivamente en tweets en inglés a partir de 2015; el rendimiento en otros registros (texto formal, correos, artículos) es significativamente peor, como se indica en la model card.
- La distribución de puntuaciones se desplaza hacia arriba en texto formal, lo que degrada la separación entre clases; cualquier despliegue fuera de tweets requiere recalibrar el umbral sobre una muestra del nuevo dominio.
- El modelo tiene un recall alto (0.817) pero una precisión baja (0.559) en la clase irónica, lo que implica muchos falsos positivos; el umbral de 0.84 ayuda a mitigarlo, pero no lo elimina.
- No se distribuye el grafo fp32; solo está disponible la versión int8 ONNX. Para reproducir el modelo original es necesario ejecutar el script de exportación desde el repositorio fuente.
- La cuantización int8 puede introducir pequeñas pérdidas de precisión respecto al modelo fp32, aunque el umbral se recalibró para compensar.
- No se han evaluado sesgos demográficos o lingüísticos específicos; el modelo puede reflejar sesgos presentes en los datos de TweetEval.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jorgeasmz/distilbert-irony-tweeteval
- Repositorio fuente (entrenamiento y evaluación): https://github.com/jorgeasmz/NLP-Sentiment-Analysis
- Dataset TweetEval: https://github.com/cardiffnlp/tweeteval
- Documentación de DistilBERT en Transformers: https://huggingface.co/docs/transformers/model_doc/distilbert
