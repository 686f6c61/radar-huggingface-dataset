# RenDeniz/emotion-detective-v2

## Resumen

Emotion Detective v2 es un clasificador de emociones multi-etiqueta basado en DistilBERT (`distilbert-base-uncased`) afinado sobre el dataset GoEmotions de Google Research. El modelo asigna a cada texto corto una o varias de 28 etiquetas emocionales (27 emociones más "neutral"), mediante 28 salidas independientes con activación sigmoide y pérdida BCEWithLogitsLoss. Lo desarrolla el usuario RenDeniz y se publica como demostración de portfolio, no como herramienta de producción.

El modelo tiene 66,97 millones de parámetros y una longitud de contexto de 64 tokens, suficiente para frases y comentarios breves. Su relevancia radica en ser un ejemplo claro de fine-tuning de un transformer encoder para clasificación multi-etiqueta, con umbrales de decisión ajustados por clase que se distribuyen junto al modelo. Está pensado para desarrolladores que quieran explorar la detección de emociones en texto inglés, pero con limitaciones importantes de dominio y sesgo.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DistilBERT (encoder transformer, 6 capas, 768 dimensiones ocultas) |
| Parametros totales | 66.975.004 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 64 tokens (máximo usado en entrenamiento; el modelo base soporta 512) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Inglés (entrenado con texto de Reddit) |
| Licencia | Apache 2.0 (coincide con la del dataset GoEmotions) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `distilbert-base-uncased`, una versión destilada de BERT con 6 capas y 768 dimensiones ocultas. Se añade una cabeza de clasificación con 28 salidas independientes, cada una con activación sigmoide, y se entrena con BCEWithLogitsLoss para permitir etiquetas múltiples simultáneas (por ejemplo, "alegría" y "gratitud" a la vez). El entrenamiento se realizó sobre la partición `simplified` de GoEmotions, con 43.410 ejemplos de entrenamiento, 5.426 de validación y 5.427 de prueba, durante 4 épocas, batch de 32, learning rate 3e-5 con warmup lineal del 10% y decaimiento lineal posterior, y recorte de gradiente a norma 1.0. La longitud máxima de secuencia se fijó en 64 tokens.

Una innovación destacable es que los umbrales de decisión por clase se ajustaron sobre la partición de validación y se congelaron para la partición de prueba. Estos umbrales se guardan en `inference_config.json` y son parte integral del modelo: cargar los pesos sin ellos produce resultados peores que los reportados. El código de inferencia oficial requiere descargar ese fichero y aplicarlo manualmente.

## Capacidades

- Clasificación multi-etiqueta de emociones en texto inglés: 27 emociones (alegría, tristeza, enfado, miedo, sorpresa, gratitud, etc.) más "neutral".
- Asignación simultánea de varias emociones a un mismo texto (por ejemplo, "esperanza" y "alivio").
- Inferencia sobre textos cortos de hasta 64 tokens, adecuada para comentarios, tuits o frases sueltas.
- Ajuste de umbrales por clase para equilibrar precisión y recall en etiquetas con distinta frecuencia.
- No soporta tool calling, ni razonamiento multi-paso, ni generación de texto; es un modelo puramente discriminativo de clasificación.

## Casos de uso

- Análisis de comentarios en foros y redes sociales: el modelo puede etiquetar automáticamente el tono emocional de publicaciones breves, por ejemplo para estudiar la reacción de una comunidad a un anuncio o producto.
- Monitorización de encuestas abiertas: en respuestas de satisfacción de clientes, se puede detectar frustración o confusión para priorizar la atención.
- Filtrado de contenido para investigación académica: clasificar emociones en corpus de texto corto (por ejemplo, Reddit) para estudios de psicología o lingüística, siempre que se respete el dominio de entrenamiento.
- Mejora de sistemas de análisis de sentimiento: combinar la salida multi-etiqueta con un clasificador de polaridad para obtener matices más finos (por ejemplo, "sorpresa negativa" vs "sorpresa positiva").
- Detección temprana de quejas en atención al cliente: identificar mensajes con enfado o decepción en tickets de soporte para escalarlos antes de que escalen solos (aunque el modelo no está validado para este dominio).
- Demostración de fine-tuning de DistilBERT para clasificación multi-etiqueta: sirve como referencia educativa para desarrolladores que quieran replicar el pipeline con otros datasets.

## Benchmarks y rendimiento

El autor reporta los siguientes resultados sobre la partición de prueba de GoEmotions, comparando un umbral plano de 0.5 con umbrales ajustados por clase en validación:

| Metrica | Umbral plano 0.5 | Umbrales ajustados por clase |
|---|---|---|
| Micro F1 | 0.584 | 0.598 |
| Macro F1 | 0.441 | 0.517 |

No se han publicado comparaciones con otros modelos en la información disponible. El autor recomienda leer el macro F1 como métrica honesta, ya que el micro F1 está dominado por las etiquetas frecuentes.

## Requisitos de hardware

- El modelo es pequeño (67M parámetros, ~0.3 GB en safetensors). En float32 ocupa unos 268 MB de VRAM, y en float16 unos 134 MB, por lo que cabe en cualquier GPU consumer moderna (por ejemplo, RTX 3060 o superior) e incluso en CPU con memoria RAM suficiente.
- Inferencia en CPU: factible para procesamiento por lotes de textos cortos; latencia típica de milisegundos por ejemplo con transformers en modo evaluación.
- Inferencia en GPU: throughput alto; se puede servir con vLLM o TGI si se quiere exponer como API, aunque al ser un modelo de clasificación (no generativo) el uso habitual es con la librería `transformers` directamente.
- No requiere cuantización para funcionar, pero se puede convertir a ONNX o cuantizar a int8 para despliegue en entornos con recursos limitados.
- Opciones de despliegue: Hugging Face Inference Endpoints, contenedores Docker con FastAPI, o integración directa en pipelines de Python.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de modelos comparables en la información proporcionada. Se puede mencionar cualitativamente que existen otros clasificadores de emociones como `iimran/EmotionDetection` (BERT-base-cased, 7 emociones) o el propio GoEmotions original, pero no hay cifras para comparar. Por tanto, esta sección queda sin datos concretos.

## Limitaciones y advertencias

- Dominio restringido: entrenado exclusivamente con comentarios de Reddit anotados por un pequeño grupo de hablantes de inglés. El modelo degrada significativamente en otros registros (noticias, literatura, lenguaje formal).
- Etiquetas con pocos ejemplos: `grief`, `relief` y `pride` tienen muy pocas muestras de entrenamiento y su rendimiento es casi nulo. Esto es una limitación de datos, no de ajuste.
- Sarcasmo y negación: el modelo es poco fiable para detectar emociones en frases irónicas o con negaciones complejas.
- Sesgo demográfico: los anotadores y el contenido de Reddit introducen sesgos de registro, edad y cultura que se reflejan en las predicciones.
- Uso indebido: el autor advierte explícitamente que no debe usarse para evaluación de salud mental, contratación, seguros, moderación de contenido ni ninguna decisión sobre una persona.
- Longitud de contexto limitada a 64 tokens: no es adecuado para documentos largos o conversaciones extensas.
- Los umbrales ajustados son parte del modelo; ignorarlos produce resultados inferiores a los reportados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/RenDeniz/emotion-detective-v2
- Demo en vivo: https://huggingface.co/spaces/RenDeniz/emotion-detective
- Dataset GoEmotions: https://huggingface.co/datasets/google-research-datasets/go_emotions
- Repositorio de referencia (no oficial): https://github.com/veershah-sh/ai-course/blob/main/ml_project/emotion_detection_v2.py
