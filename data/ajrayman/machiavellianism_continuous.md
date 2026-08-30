# ajrayman/machiavellianism_continuous

## Resumen

El modelo `ajrayman/machiavellianism_continuous` es un clasificador de texto basado en `FacebookAI/roberta-base`, ajustado para predecir un valor continuo de maquiavelismo a partir de un texto de entrada. El maquiavelismo es un rasgo psicologico que mide la tendencia a manipular y engañar a otros, y este modelo intenta cuantificarlo de forma automatica. Esta desarrollado por el usuario `ajrayman` y publicado bajo licencia MIT, lo que permite uso comercial sin restricciones significativas.

El modelo tiene 124,6 millones de parametros, heredados de la arquitectura RoBERTa, y su tarea principal es la regresion de etiquetas continuas (clasificacion de texto con salida numerica). Aunque la ficha tecnica es minima y generada automaticamente, los resultados de evaluacion incluidos indican un error cuadratico medio (RMSE) de 0,25 y una correlacion de 0,38, lo que sugiere una capacidad predictiva moderada. Su relevancia actual radica en la creciente demanda de herramientas de analisis psicometrico automatizado, especialmente en contextos de moderacion de contenido, investigacion social y analisis de comportamiento en redes sociales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RoBERTa (Transformer encoder, 12 capas, 768 dimensiones ocultas) |
| Parametros totales | 124.646.401 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | 512 tokens (herencia de RoBERTa, no se especifica ampliacion) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, cuantizacion no documentada) |
| Idiomas soportados | no disponible (probablemente ingles, por el modelo base, no confirmado) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura RoBERTa, un transformer encoder preentrenado con un objetivo de lenguaje enmascarado (MLM) sobre un corpus masivo de texto en ingles. La capa de clasificacion original se ha sustituido por una cabeza de regresion que produce una salida continua. El ajuste fino se realizo sobre un dataset no especificado en la model card, con un tamaño de lote de 32 y una tasa de aprendizaje de 2e-5 durante 8 epocas. Se utilizo el optimizador Adam con betas (0,9, 0,999) y un scheduler lineal con un 6% de warmup. No se menciona el uso de tecnicas como RLHF o DPO, y la evaluacion se basa en metricas de regresion (RMSE, MAE y correlacion de Pearson).

## Capacidades

- Regresion de textos a un valor continuo de maquiavelismo (escala no documentada, probablemente 0-1 o 0-100).
- Clasificacion de texto de longitud moderada (hasta 512 tokens).
- Inferencia en español e inglés (el modelo base es multilingue limitado, aunque RoBERTa esta entrenado principalmente en ingles; no hay evidencia de soporte explicito para otros idiomas).
- No soporta tool calling, agentes, vision, audio ni modos de razonamiento especiales.
- Capacidad limitada de analisis psicometrico automatizado en textos como publicaciones, respuestas o comentarios.

## Casos de uso

- Analisis de comportamiento en redes sociales: el modelo puede puntuar el nivel de maquiaculismo en comentarios o publicaciones, util para estudios sociologicos o deteccion de patrones de manipulacion.
- Moderacion de contenido en foros y comunidades: permite identificar mensajes con altas cargas de manipulacion o engaño, aunque su correlacion moderada limita su uso como filtro autonomo.
- Investigacion en psicologia computacional: los investigadores pueden aplicar el modelo a corpus de entrevistas o textos narrativos para cuantificar rasgos de personalidad de forma automatica.
- Analisis de mensajes en atencion al cliente: las empresas pueden evaluar el tono de las interacciones para detectar posibles abusos o intentos de manipulacion hacia los agentes.
- Estudios de opinion publica: el modelo puede procesar encuestas abiertas o respuestas a preguntas abiertas para correlacionar puntuaciones de maquiavelismo con variables demograficas.
- Deteccion de noticias falsas o propaganda: aunque no es su proposito principal, textos con alta puntuacion pueden correlacionarse con contenido desinformativo, como hipotesis de investigacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye metricas de validacion propias del autor:

| Metrica | Valor |
|---|---|
| Validation Loss | 0,0626 |
| RMSE | 0,2503 |
| MAE | 0,2004 |
| Correlacion de Pearson | 0,3767 |

No se incluyen comparaciones con otros modelos ni resultados en conjuntos de datos estandar como MMLU o GLUE.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 500 MB en FP32 (124M parametros), menos de 200 MB en cuantizacion INT8.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM, incluyendo NVIDIA GTX 1050, RTX 2060 o superiores. Tambien puede ejecutarse en CPU con latencia aceptable (menos de 100 ms por texto corto).
- Cabe en GPU de consumo: si, en cualquier GPU moderna de gama media o alta.
- Opciones de despliegue: transformers (PyTorch), ONNX Runtime, TensorFlow, o servidores de inferencia como HuggingFace Inference Endpoints, vLLM (aunque no esta optimizado para modelos encoder), o FastAPI con transformers.
- Latencia estimada: ~50-150 ms por texto en GPU, ~500 ms en CPU.

## Comparativa con modelos similares

No se han identificado modelos comparables especificos en la misma tarea (regresion de maquiavelismo) dentro de la informacion disponible. Como referencia, el modelo base `roberta-base` tiene 125M parametros y una ventana de 512 tokens, y se puede comparar con:

| Modelo | Parametros | Contexto | Tarea | Licencia |
|---|---|---|---|---|
| ajrayman/machiavellianism_continuous | 124,6M | 512 | Regresion de maquiavelismo | MIT |
| ajrayman/machiavellianism_binary | no disponible | no disponible | Clasificacion binaria de maquiavelismo | no disponible |
| FacebookAI/roberta-base | 125M | 512 | MLM / clasificacion general | MIT |

## Limitaciones y advertencias

- Sesgos no documentados: al entrenarse sobre un dataset desconocido, puede heredar sesgos de genero, raza o cultura del texto original.
- Riesgo de alucinacion: como modelo de regresion, no genera texto, pero puede producir valores extremos o inconsistentes en entradas fuera de distribucion.
- Correlacion moderada (0,38): la precision predictiva es limitada, no apta para decisiones de alto riesgo sin supervision humana.
- Idioma no confirmado: el modelo base es principalmente ingles; su rendimiento en español u otros idiomas no esta verificado.
- Longitud de contexto limitada a 512 tokens: no es adecuado para documentos largos.
- Sin informacion sobre el dataset de entrenamiento: no se puede auditar la calidad ni la representatividad de los datos.
- Uso en produccion: la falta de documentacion sobre cuantizacion y optimizacion limita su despliegue en entornos de alta demanda.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ajrayman/machiavellianism_continuous
- Modelo base: https://huggingface.co/FacebookAI/roberta-base
- Modelo relacionado (binario): https://huggingface.co/ajrayman/machiavellianism_binary
