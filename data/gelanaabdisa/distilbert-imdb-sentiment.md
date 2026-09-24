# gelanaabdisa/distilbert-imdb-sentiment

## Resumen

distilbert-imdb-sentiment es un modelo de clasificacion de texto publicado en HuggingFace por el usuario gelanaabdisa, consistente en un ajuste fino (fine-tuning) de distilbert-base-uncased sobre un conjunto de datos que el propio autor no identifica en la model card (aparece literalmente como "unknown dataset"), aunque el nombre del repositorio sugiere una tarea de analisis de sentimiento sobre resenas estilo IMDB. La tarea declarada es text-classification y el pipeline oficial es text-classification, con salida de dos clases (positivo/negativo) segun la nomenclatura del repositorio.

El modelo tiene 66.955.010 parametros segun los pesos en safetensors y ocupa 0.5 GB en el repositorio. Se distribuye bajo licencia Apache 2.0 y esta etiquetado como compatible con text-embeddings-inference y endpoints_compatible, lo que facilita su despliegue en infraestructuras de inferencia gestionadas. La model card es autogenerada por el Trainer y no aporta informacion sobre composicion del dataset, idiomas soportados ni usos previstos.

La relevancia de esta ficha es limitada pero concreta: se trata de un clasificador encoder-only pequeno, rapido y barato de ejecutar, util como linea base de sentimiento en ingles. El autor reporta una exactitud de 0.873 en el conjunto de evaluacion tras 2 epocas, con perdida de validacion de 0.3233. No hay descargas ni likes registrados, y no se han publicado resultados en benchmarks estandar (el model-index del repositorio esta vacio).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-only (DistilBERT), ajustado con cabeza de clasificacion de secuencia |
| Parametros totales | 66.955.010 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 512 tokens (limite posicional del modelo base; no confirmado de forma explicita en la model card) |
| Tipos de cuantizacion | No disponible en el repositorio (solo pesos safetensors); no se publican versiones GGUF, ONNX o INT8 |
| Idiomas soportados | No disponibles en la model card. El modelo base distilbert-base-uncased esta entrenado unicamente en ingles |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Modelo base | distilbert/distilbert-base-uncased |
| Pipeline | text-classification |
| Tamaño del repositorio | 0.5 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-09-24 |
| Ultima actualizacion | 2026-09-24 |

## Arquitectura y entrenamiento

La arquitectura corresponde a DistilBERT, una version destilada de BERT-base: encoder transformer con 6 capas, dimension oculta 768 y 12 cabezas de atencion, entrenada originalmente mediante destilacion del conocimiento de BERT-base y sin objetivo de prediccion de siguiente frase. Sobre este backbone se anade una cabeza de clasificacion de secuencia, que produce la etiqueta de sentimiento. El modelo base esta entrenado en ingles en modo uncased (sin distincion de mayusculas/minusculas).

El ajuste fino se realizo con los siguientes hiperparametros declarados en la model card: learning rate 2e-05, tamaño de lote de entrenamiento 16, tamaño de lote de evaluacion 32, semilla 42, optimizador AdamW torch fused con betas (0.9, 0.999) y epsilon 1e-08, scheduler lineal, 2 epocas y entrenamiento con precision mixta nativa (Native AMP). No se especifica el numero total de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF, DPO o similares; la propia model card indica "More information needed" en las secciones de descripcion, usos previstos y datos de entrenamiento. El numero de pasos reportado es 188 en la epoca 1 y 376 en la epoca 2.

## Capacidades

- Clasificacion de texto binaria orientada a analisis de sentimiento (positivo/negativo) segun el nombre del repositorio y el pipeline declarado.
- Generacion de embeddings de frase a traves del encoder subyacente, aprovechables para similitud semantica o clustering, aunque no es la tarea para la que se publica el modelo.
- Inferencia rapida y de bajo coste computacional gracias a los 66,9 M de parametros.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible; es un modelo discriminativo, no generativo.
- Capacidades multilingues: no disponibles; el modelo base es exclusivamente en ingles.
- Capacidades especiales (modo thinking, vision, audio): no disponibles.
- Compatibilidad con text-embeddings-inference y endpoints_compatible segun las etiquetas del repositorio.

## Casos de uso

- Analisis de sentimiento en resenas de producto: el modelo clasifica resenas breves en positivas o negativas, con una exactitud declarada de 0.873 en validacion, lo que permite priorizar opiniones negativas para su revision por equipos de soporte.
- Monitorizacion de reputacion en redes sociales: clasificar menciones de una marca en tiempo real; al ser un modelo de 66,9 M de parametros, se puede desplegar en CPU y procesar volumenes altos con coste reducido.
- Enrutado de tickets de soporte: usar la etiqueta de sentimiento como senal adicional para decidir si un ticket requiere atencion prioritaria o gestion automatizada.
- Filtrado previo en pipelines de moderacion: descartar o etiquetar de forma rapida comentarios con tono muy negativo antes de pasarlos a un modelo mayor mas costoso.
- Linea base para investigacion en NLP: punto de partida economico para comparar tecnicas de ajuste fino, aumento de datos o destilacion adicional sobre tareas de sentimiento en ingles.
- Analisis de encuestas de satisfaccion (NPS, CSAT): clasificar respuestas abiertas de clientes, siempre que el texto este en ingles y no supere el limite de contexto del encoder.
- Extraccion de senales para dashboards analiticos: agregar la proporcion de sentimiento positivo/negativo por producto, periodo o canal, mediante inferencia por lotes.
- Prototipado rapido con text-embeddings-inference: al estar etiquetado como compatible con endpoints, se puede exponer como servicio HTTP de clasificacion sin infraestructura GPU.

## Benchmarks y rendimiento

El model-index del repositorio no contiene resultados publicados (array `results` vacio). No se han publicado resultados en benchmarks estandar (MMLU, GLUE, HumanEval, GSM8K u otros) en la informacion disponible. El autor unicamente reporta metricas sobre el conjunto de evaluacion interno, que se reproducen a continuacion tal cual aparecen en la model card:

| Epoca | Paso | Perdida de validacion | Exactitud |
|---|---|---|---|
| 1.0 | 188 | 0.3064 | 0.868 |
| 2.0 | 376 | 0.3233 | 0.873 |

Metrica declarada en la cabecera de la model card: Loss 0.3233, Accuracy 0.873. Se desconoce el conjunto de evaluacion concreto, por lo que estas cifras no son directamente comparables con resultados publicados de otros modelos sobre IMDB o SST-2.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 268 MB en FP32, 134 MB en FP16/BF16 y 67 MB en INT8, calculados a partir de los 66,9 M de parametros. El uso real dependera del tamaño de lote y de la longitud de las secuencias.
- GPU recomendadas: cualquier GPU con al menos 2 GB de memoria, incluidas NVIDIA T4, GTX 1650, RTX 3060 o superiores; tambien es viable en A100 o H100 si se necesita agregacion masiva.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo de los ultimos anos, e incluso en CPU para cargas moderadas.
- Opciones de despliegue: pipeline de transformers (PyTorch), text-embeddings-inference (etiqueta oficial del repositorio), endpoints gestionados compatibles, y exportacion a ONNX u otros runtimes de inferencia mediante herramientas de Optimum (conversion no publicada en el repositorio). La compatibilidad con vLLM no esta declarada.
- Latencia y throughput: no disponible. No se han publicado mediciones de latencia ni de tokens por segundo para este modelo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| distilbert-imdb-sentiment (este modelo) | 66,9 M | 512 tokens | apache-2.0 | Exactitud 0.873 en el conjunto de evaluacion del autor; sin benchmarks estandar publicados |
| distilbert-base-uncased | 66,9 M | 512 tokens | apache-2.0 | Modelo base sin ajustar; no es un clasificador de sentimiento |
| bert-base-uncased | 110 M | 512 tokens | apache-2.0 | Mayor coste de inferencia y mas memoria; requiere ajuste fino para la tarea |
| roberta-base | 125 M | 512 tokens | MIT | Entrenado con un corpus mayor; requiere ajuste fino para la tarea |

No hay datos que permitan comparar el rendimiento de este ajuste con alternativas equivalentes de analisis de sentimiento, ya que el autor no publica evaluacion sobre un benchmark comun. Los datos de parametros, contexto y licencia de los modelos comparados corresponden a sus especificaciones publicas conocidas.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la model card. El modelo base hereda los sesgos presentes en el corpus de entrenamiento original, pero el autor no realiza ningun analisis al respecto.
- Riesgo de alucinacion: no aplica en el sentido generativo, ya que es un clasificador; el riesgo equivalente es la clasificacion incorrecta o poco calibrada, especialmente en textos ironicos, mixtos o con negaciones.
- Dominio de entrenamiento desconocido: la model card indica explicitamente "unknown dataset", por lo que no se puede garantizar el rendimiento fuera del dominio de resenas en ingles.
- Limitaciones de contexto: el encoder esta limitado a 512 tokens; los textos mas largos deberan truncarse o dividirse, con perdida de informacion.
- Limitaciones de idioma: el modelo base es exclusivamente en ingles; no se declara soporte para castellano ni otros idiomas.
- Restricciones de licencia: licencia Apache 2.0, que permite uso comercial y modificacion, con obligacion de conservar el aviso de licencia y el archivo NOTICE si existe.
- Caveats para produccion: repositorio sin descargas ni validacion por parte de la comunidad, model card autogenerada y sin revisar, ausencia de evaluacion sobre benchmarks estandar y de informacion sobre calibracion de probabilidades. Se recomienda validar con datos propios antes de un despliegue real.
- Trazabilidad: se desconoce la version exacta del dataset, el preprocesado aplicado y si hubo deduplicacion o particion estratificada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/gelanaabdisa/distilbert-imdb-sentiment
- Modelo base: https://huggingface.co/distilbert/distilbert-base-uncased
- Modelo base (referencia alternativa en la model card): https://huggingface.co/distilbert-base-uncased
- Paper de DistilBERT (referencia del modelo base, no citado en la model card): https://arxiv.org/abs/1910.01108
- Paper de BERT (referencia de la arquitectura original, no citado en la model card): https://arxiv.org/abs/1810.04805
