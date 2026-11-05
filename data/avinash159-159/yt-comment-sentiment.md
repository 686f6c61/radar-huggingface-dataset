# Avinash159-159/yt-comment-sentiment

## Resumen

`yt-comment-sentiment` es un modelo de clasificación de texto en ingles especializado en el analisis de sentimiento de comentarios de YouTube, con tres clases: negativo (0), neutral (1) y positivo (2). Lo desarrolla el usuario Avinash159-159 y se publica bajo licencia MIT. Se construye sobre el encoder DistilRoBERTa, del que se afinan las capas superiores, y anade una cabeza de clasificacion propia con pooling sobre el token CLS.

El modelo resuelve una tarea concreta y acotada: asignar una polaridad a comentarios cortos de redes sociales, con una longitud maxima de entrada de 128 tokens. Su relevancia es practica para pipelines de moderacion, analitica de audiencia o monitorizacion de comunidad en YouTube, donde se necesita un clasificador ligero y rapido que pueda ejecutarse en CPU.

Con 82.350.095 parametros totales y un tamano de repositorio de 0,3 GB, es un modelo compacto pensado para inferencia economica. Una advertencia importante: no es un `AutoModelForSequenceClassification` estandar, sino un `nn.Module` personalizado que requiere cargar `model.py` desde el repositorio y los pesos con `safetensors`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DistilRoBERTa) con cabeza de clasificacion personalizada y pooling CLS |
| Parametros totales | 82.350.095 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128 tokens (longitud maxima de entrada) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ingles (en) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Tarea | text-classification (sentiment-analysis, 3 clases) |
| Modelo base | distilbert/distilroberta-base |
| Framework | PyTorch |

## Arquitectura y entrenamiento

El modelo parte de `distilroberta-base`, un encoder transformer de tipo RoBERTa destilado, y afina sus capas superiores. Sobre la representacion del token CLS se aplica una cabeza de clasificacion propia implementada como un `nn.Module` personalizado (`YTmodel`), que no sigue la interfaz estandar de `transformers` para clasificacion de secuencias. La salida es una distribucion sobre tres etiquetas: Negative, Neutral y Positive.

No se dispone de informacion sobre el volumen de datos de entrenamiento, la composicion del corpus de comentarios de YouTube, el numero de tokens vistos ni si se aplicaron tecnicas de RLHF, DPO u otro ajuste posterior. Tampoco se detalla la estrategia de congelacion de capas mas alla de la mencion a la afinacion de las capas superiores.

## Capacidades

- Clasificacion de sentimiento en tres clases (negativo, neutral, positivo) sobre texto en ingles.
- Analisis de comentarios cortos de YouTube y, por extension, de otros textos de redes sociales de longitud similar.
- Inferencia ligera: al ser un encoder de 82 millones de parametros, puede ejecutarse en CPU con latencias bajas.
- Integracion en pipelines de PyTorch mediante carga manual de pesos `safetensors` y la clase `YTmodel`.
- No soporta tool calling ni function calling.
- No dispone de modo de razonamiento multi-paso ni capacidades de agente.
- No tiene capacidades multimodales (vision, audio) ni generacion de texto.
- Capacidad multilingue limitada al ingles.

## Casos de uso

- Moderacion de comunidades en YouTube: clasificar automaticamente comentarios como negativos para priorizar revision humana, usando la clase Neutral para filtrar ruido y reducir la carga de moderadores.
- Analitica de audiencia: agregar la polaridad de los comentarios de un video o canal para medir la reaccion del publico y detectar cambios de sentimiento tras la publicacion.
- Monitorizacion de marca: procesar en lote comentarios asociados a una campana o producto y generar informes de sentimiento con conteos por clase.
- Enrutado de atencion al cliente en redes: clasificar mensajes entrantes y dirigir los negativos a colas de soporte prioritario y los neutros a respuestas automatizadas.
- Investigacion en ciencias sociales: etiquetar grandes volumenes de comentarios para estudios de opinion, aprovechando el bajo coste de inferencia en CPU.
- Preetiquetado para anotacion humana: usar el modelo como primer paso en un flujo de etiquetado asistido, revisando manualmente solo los casos de baja confianza.
- Filtrado previo en pipelines de NLP: descartar o separar comentarios por polaridad antes de aplicar modelos mas costosos de generacion o resumen.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: en torno a 0,33 GB para los pesos (82,35 millones de parametros), mas el overhead de activaciones para secuencias de hasta 128 tokens.
- Cabe holgadamente en cualquier GPU consumer, incluidas GTX 1650, RTX 3060, RTX 4090, asi como en CPU.
- GPU recomendadas para alto throughput: A100, H100 o L4 para procesamiento por lotes a gran escala; para uso individual basta una GPU de gama media o incluso CPU.
- Opciones de despliegue: al ser un `nn.Module` personalizado, requiere cargar `model.py` del repositorio; no es directamente compatible con `AutoModelForSequenceClassification`. El despliegue con vLLM o TGI no esta soportado de forma nativa. Es viable exportarlo a TorchScript u ONNX para servirlo.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| yt-comment-sentiment | 82,35 M | 128 tokens | Clasificacion de sentimiento (3 clases) | MIT | HuggingFace |
| distilroberta-base (base) | ~82 M | 512 tokens | Modelo base de lenguaje | MIT | HuggingFace |
| Modelos de sentimiento genericos en ingles | no disponible | no disponible | Clasificacion de sentimiento | variable | HuggingFace |

No se dispone de datos de rendimiento comparativo entre este modelo y alternativas, por lo que no es posible establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- Entrenado exclusivamente en ingles; el rendimiento en otros idiomas no esta garantizado.
- Longitud maxima de 128 tokens: los comentarios largos se truncan y pueden perder informacion relevante para la clasificacion.
- No es un `AutoModelForSequenceClassification` estandar; requiere cargar `model.py` y los pesos manualmente, lo que complica la integracion con herramientas estandar de `transformers`.
- No se han publicado metricas de evaluacion (accuracy, F1) ni detalles del conjunto de entrenamiento, lo que impide valorar su calidad de forma objetiva.
- Riesgo de sesgo y de alucinacion de etiquetas en textos ambiguos, sarcasticos o con jerga especifica de YouTube.
- Sin descargas ni likes registrados en el momento de la consulta; no hay evidencia de uso en produccion ni validacion por la comunidad.
- Licencia MIT: permite uso comercial, pero conviene verificar las condiciones del modelo base `distilroberta-base` y de los datos de entrenamiento, no documentadas.
- El modelo solo clasifica; no genera explicaciones ni puntuaciones de confianza calibradas documentadas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Avinash159-159/yt-comment-sentiment
- Demo / API en Spaces: https://huggingface.co/spaces/Avinash159-159/yt-comment-sentiment-demo
- Modelo base DistilRoBERTa: https://huggingface.co/distilbert/distilroberta-base
