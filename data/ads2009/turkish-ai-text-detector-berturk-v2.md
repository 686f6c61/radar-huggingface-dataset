# ads2009/turkish-ai-text-detector-berturk-v2

## Resumen

SENTINEL-AI TR v2 es un clasificador binario de texto en turco disenado para distinguir entre texto escrito por humanos (etiqueta 0) y texto generado por inteligencia artificial (etiqueta 1). Lo publica el usuario ads2009 en Hugging Face y se construye mediante fine-tuning del modelo base dbmdz/bert-base-turkish-cased, un BERT en variante cased entrenado especificamente para turco.

El modelo resuelve un problema acotado pero creciente: la deteccion de contenido sintetico en una lengua con morfologia aglutinante y relativamente pocos recursos de deteccion respecto al ingles. Con 110,6 millones de parametros y un repositorio de 0,4 GB, es un modelo compacto pensado para inferencia rapida y despliegue en CPU o GPU de gama baja, no para generacion.

Es relevante ahora porque la mayoria de detectores de texto IA publicados se centran en ingles, y las aproximaciones multilingues genericas rinden peor en turco por la segmentacion morfologica. Este modelo ofrece una alternativa especifica de idioma con licencia Apache 2.0, lo que permite uso comercial sin restricciones adicionales. La model card es muy escueta: solo indica el pipeline, las etiquetas y la necesidad de normalizar la entrada con el esquema `norm_v2` (version `tr_v2_norm_1`, documentado en `sentinel_meta.json`).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder BERT (base_model: dbmdz/bert-base-turkish-cased) |
| Parametros totales | 110.618.882 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo base BERT admite hasta 512 tokens; no confirmado en la model card) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantizacion dinamica posible via PyTorch/ONNX, no documentada por el autor) |
| Idiomas soportados | turco (tr) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es un transformer encoder tipo BERT en configuracion base, heredada de dbmdz/bert-base-turkish-cased, con una cabeza de clasificacion de una sola salida (clasificacion binaria: 0 = HUMAN, 1 = AI). El modelo base es una variante cased entrenada sobre corpus en turco; el fine-tuning convierte ese encoder en un detector de autoria sintetica.

No se dispone de informacion publica sobre el volumen de datos de entrenamiento, la composicion del dataset, el numero de tokens vistos, ni si se aplicaron tecnicas de RLHF, DPO o calibracion posterior. La unica indicacion tecnica relevante de la model card es la exigencia de normalizar la entrada con `norm_v2` (version `tr_v2_norm_1`, definida en `sentinel_meta.json`), lo que sugiere que el pipeline de entrenamiento y el de inferencia comparten una etapa de preprocesado que afecta a la distribucion de la entrada; omitirla puede degradar la precision de forma no documentada.

## Capacidades

- Clasificacion binaria de texto en turco: devuelve la probabilidad de que un texto haya sido generado por IA frente a escrito por un humano.
- Deteccion de contenido sintetico en textos de extension corta y media (limitado por el contexto del encoder BERT subyacente).
- Funcionamiento en modo inferencia pura: no genera texto, no razona de forma multi-paso y no mantiene conversaciones.
- No dispone de tool calling ni function calling.
- No soporta agentes ni planificacion multi-paso.
- Capacidad multilingue limitada al turco; no se documenta rendimiento en otras lenguas.
- No incluye modo thinking, vision ni audio.

## Casos de uso

- Moderacion de contenido en plataformas turcoparlantes: integrar el modelo como filtro previo en un pipeline de moderacion para marcar publicaciones sospechosas de ser generadas por IA antes de la revision humana, gracias a su tamano reducido y su baja latencia esperada en CPU.
- Verificacion de autoria en medios y editoriales: comprobar si un articulo o nota de prensa recibida en turco presenta senales de generacion automatica antes de su publicacion, usando la probabilidad de salida como indicador de riesgo y no como veredicto definitivo.
- Deteccion de resenas falsas en comercio electronico: clasificar resenas de producto en turco para priorizar la revision de aquellas con alta probabilidad de haber sido generadas por modelos de lenguaje, reduciendo el volumen de trabajo manual.
- Filtrado de datasets para entrenamiento: descartar muestras sinteticas de un corpus turco recopilado de la web antes de usarlo para entrenar otros modelos, evitando el sesgo de contaminacion por datos generados.
- Investigacion academica sobre deteccion de texto generado: servir como linea base especifica de turco en estudios comparativos de detectores, con la ventaja de ser un modelo pequeno, reproducible y de licencia permisiva.
- Analisis forense de comunicaciones: en entornos de compliance o auditoria, senalar mensajes en turco que probablemente hayan sido redactados por un sistema automatico, como apoyo a la revision documental.
- Integracion en APIs de bajo coste: desplegar el modelo detras de un endpoint de clasificacion con cuantizacion dinamica en CPU para procesar lotes de textos turcos sin necesidad de GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de precision, recall, F1, AUC ni comparaciones con otros detectores, y tampoco se documenta el conjunto de evaluacion empleado.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 0,45 GB solo para pesos (110,6 M de parametros), mas activaciones y overhead del runtime; en la practica cabe en cualquier GPU consumer.
- En FP16/BF16: alrededor de 0,22 GB de pesos, con margen amplio en GPUs de 4 GB o menos.
- Cabe en GPU consumer: si, en cualquier tarjeta moderna (RTX 3060, RTX 4060, RTX 4090, e incluso iGPUs con suficiente memoria compartida).
- Inferencia en CPU: viable para lotes moderados; el cuello de botella sera el throughput del procesador, no la memoria.
- Opciones de despliegue: Hugging Face Transformers (pipeline de text-classification), ONNX Runtime, TorchScript, y servidores de inferencia compatibles con modelos de clasificacion (por ejemplo, Text Embeddings Inference no aplica; si aplican frameworks genericos como FastAPI + Transformers o BentoML). No se documenta soporte nativo en vLLM, llama.cpp ni Ollama, que estan orientados a modelos generativos.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idioma | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ads2009/turkish-ai-text-detector-berturk-v2 | 110,6 M | no disponible (base BERT, hasta 512 tokens) | Turco | Apache 2.0 | Hugging Face, 44 descargas |
| dbmdz/bert-base-turkish-cased | ~110 M | 512 tokens | Turco | no disponible en esta ficha | Hugging Face, modelo base sin cabeza de deteccion |
| Detectores multilingues genericos (p. ej. variantes de OpenAI detector o clasificadores XLM-R) | variable | variable | Multiples | variable | Disponibles, pero sin evaluacion publica especifica en turco |

La comparacion cuantitativa de rendimiento no esta disponible: ninguno de los datos proporcionados incluye metricas del modelo ni de alternativas en turco. La ventaja principal frente al modelo base es la cabeza de clasificacion especifica; frente a detectores multilingues, la especializacion en turco y la licencia permisiva.

## Limitaciones y advertencias

- Model card extremadamente escueta: no documenta datos de entrenamiento, metricas, ni el procedimiento de calibracion, lo que impide evaluar su fiabilidad antes de desplegarlo.
- Dependencia critica del preprocesado: la entrada debe normalizarse con `norm_v2` (version `tr_v2_norm_1`); usar otra normalizacion puede alterar las predicciones de forma no controlada.
- Riesgo de falsos positivos y falsos negativos no cuantificado: sin benchmarks publicados no hay garantia de precision en dominios distintos al de entrenamiento.
- Sensibilidad a la evolucion de los generadores: un detector entrenado contra una generacion concreta de modelos puede degradarse frente a modelos mas recientes.
- Sesgos desconocidos: no se documenta la composicion del dataset, por lo que no puede descartarse sesgo por dominio, registro o variedad dialectal del turco.
- Alcance limitado al turco: no hay evidencia de comportamiento en otras lenguas ni en texto mixto turco-ingles.
- Uso responsable: la salida es una probabilidad, no una prueba; no deberia usarse como unico criterio para acusar a una persona de usar IA.
- Licencia Apache 2.0: permite uso comercial y modificacion, pero conviene revisar las condiciones del modelo base dbmdz/bert-base-turkish-cased, que no se detallan en la informacion disponible.
- Baja adopcion (44 descargas, 0 likes): no hay senales de validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ads2009/turkish-ai-text-detector-berturk-v2
- Modelo base: https://huggingface.co/dbmdz/bert-base-turkish-cased
- Archivo de metadatos de normalizacion: `sentinel_meta.json` (referenciado en la model card, dentro del repositorio del modelo)
- Paper, blog o repositorio adicional: no disponible
