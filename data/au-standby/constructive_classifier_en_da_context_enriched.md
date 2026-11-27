# AU-STANDBY/constructive_classifier_EN_DA_context_enriched

## Resumen

El modelo `AU-STANDBY/constructive_classifier_EN_DA_context_enriched` es un clasificador de texto multilingue y multi-tarea desarrollado en el marco del proyecto de investigacion STANDBY, por el autor AU-STANDBY. Se construye mediante fine-tuning del encoder `intfloat/multilingual-e5-large` y esta disenado para clasificar textos en ingles y danes a lo largo de tres dimensiones independientes: discurso de odio, discurso constructivo y acuerdo/desacuerdo. A diferencia de los clasificadores de etiqueta unica, trata cada dimension de forma independiente, de modo que un mismo texto puede ser simultaneamente etiquetado como odioso y constructivo.

Esta variante concreta es la version "context-enriched": clasifica una respuesta teniendo en cuenta el texto de referencia al que responde, formateando la entrada como `[reference text] [SEP] [response text]`. Esto la hace adecuada para analisis de conversaciones multi-turno, hilos de debate y moderacion contextualizada, donde el significado de una respuesta depende del mensaje previo.

El modelo es relevante para investigacion en moderacion de contenido y analisis de calidad del debate, ya que separa la deteccion de toxicidad de la evaluacion de constructividad y postura, tres ejes que habitualmente se abordan con modelos separados. Tiene 559.899.657 parametros, un repositorio de 2,3 GB y un contexto de entrada de 512 tokens segun el codigo de ejemplo de la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (XLM-RoBERTa), fine-tuning de `intfloat/multilingual-e5-large` para clasificacion de secuencias |
| Parametros totales | 559.899.657 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 512 tokens (segun el ejemplo de tokenizacion de la model card) |
| Tipos de cuantizacion | No disponible (pesos publicados en safetensors sin cuantizaciones oficiales) |
| Idiomas soportados | Ingles (en) y danes (da) |
| Licencia | No disponible |
| Formato de pesos | safetensors |
| Tarea | Clasificacion de texto multi-tarea (9 logits, 3 tareas de 3 clases) |
| Etiquetas | Odio: Not Hateful / Hateful / Unclassifiable Hateful; Constructivo: Not Constructive / Constructive / Unclassifiable Constructive; Acuerdo: Agree / Disagree / Unclear |
| Dataset de entrenamiento | `AU-STANDBY/annotated_constructive_dataset_DA_EN` |
| Descargas | 23 |
| Fecha de creacion | 2026-11-17 |

## Arquitectura y entrenamiento

El modelo parte del encoder multilingue `intfloat/multilingual-e5-large`, basado en la familia XLM-RoBERTa, al que se anade una cabeza de clasificacion de secuencias con 9 salidas. Esas 9 salidas se dividen en tres grupos de 3 logits, uno por tarea (odio, constructividad y acuerdo), y se aplica softmax de forma independiente a cada grupo. Este diseno multi-cabeza permite que las tres dimensiones se predigan de manera no excluyente, en lugar de forzar una unica etiqueta global.

El entrenamiento se realizo sobre el dataset `AU-STANDBY/annotated_constructive_dataset_DA_EN`, con anotaciones en ingles y danes. La variante "context-enriched" se entrena con pares de texto (referencia y respuesta) concatenados mediante el token separador del tokenizador, de modo que el modelo aprende a condicionar la clasificacion de la respuesta al contexto conversacional. La model card no detalla el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF, DPO u otras optimizaciones posteriores; esa informacion no esta disponible.

Como innovacion destacable, el modelo incorpora la separacion explicita de la clase "no clasificable" (U) en las tareas de odio y constructividad, lo que permite al clasificador abstenerse cuando el texto no es evaluable en ese eje. Ademas, la version context-enriched aborda una limitacion habitual de los clasificadores de toxicidad: la perdida de contexto en respuestas breves o dependientes del mensaje anterior.

## Capacidades

- Clasificacion de discurso de odio en tres clases (no odioso, odioso, no clasificable), en ingles y danes.
- Clasificacion de discurso constructivo en tres clases (no constructivo, constructivo, no clasificable).
- Clasificacion de acuerdo/desacuerdo en tres clases (de acuerdo, en desacuerdo, poco claro).
- Clasificacion multi-etiqueta no excluyente: un texto puede ser a la vez odioso y constructivo.
- Clasificacion condicionada al contexto: acepta un texto de referencia y una respuesta para evaluar la respuesta en su contexto conversacional.
- Salida con etiqueta predicha, puntuacion de confianza y distribucion de probabilidades por tarea.
- Soporte bilingue limitado a ingles y danes.
- No soporta generacion de texto, tool calling, agentes ni razonamiento multi-paso; es exclusivamente un clasificador.
- No dispone de capacidades de vision ni audio.

## Casos de uso

- Moderacion de comunidades online: el modelo puede clasificar respuestas de un hilo como odiosas o constructivas teniendo en cuenta el mensaje al que responden, lo que reduce falsos positivos en respuestas sarcasticas o dependientes del contexto. Es adecuado porque la variante context-enriched incorpora el texto de referencia en la entrada.
- Analisis de calidad del debate: plataformas de discusion civica pueden puntuar cada intervencion en los ejes de constructividad y acuerdo para generar metricas agregadas de calidad conversacional por hilo.
- Investigacion en ciencias sociales y comunicacion: el modelo permite anotar a escala corpus bilingues (en/da) de conversaciones con tres dimensiones independientes, sustituyendo parte del etiquetado manual en estudios sobre polarizacion y discurso de odio.
- Deteccion de toxicidad contextualizada en redes sociales: al recibir el tuit o comentario previo como referencia, el clasificador puede distinguir una respuesta agresiva de una respuesta critica legitima que, aislada, pareceria hostil.
- Sistemas de reputacion y salud de comunidad: integrado en un pipeline de moderacion, puede alimentar puntuaciones de usuario o de hilo basadas en la proporcion de intervenciones constructivas frente a odiosas, con la clase "no clasificable" para casos ambiguos.
- Filtrado previo en datasets de entrenamiento: el modelo puede usarse para descartar o etiquetar respuestas toxicas o no constructivas en la construccion de corpus para fine-tuning de LLM, aprovechando su capacidad bilingue y su salida de probabilidades para aplicar umbrales configurables.

## Benchmarks y rendimiento

La model card reporta F1 por clase y F1 agregado por tarea sobre el conjunto de evaluacion del proyecto. No se comparan con modelos de referencia en la informacion disponible.

| Tarea | Clase Y/A | Clase N/D | Clase U | F1 de tarea |
|---|---|---|---|---|
| Constructivo | 0,79 (Y) | 0,93 (N) | 0,60 (U) | 0,88 |
| Odio | 0,67 (Y) | 0,91 (N) | 0,62 (U) | 0,86 |
| Acuerdo | 0,74 (A) | 0,81 (D) | 0,54 (U) | 0,72 |
| Promedio F1 | - | - | - | 0,82 |

Para la tarea de constructividad, Y = Yes, N = No, U = Unclassifiable. Para odio, Y = Yes, N = No, U = Unclassifiable. Para acuerdo, A = Agree, D = Disagree, U = Unclear. No se han publicado resultados de benchmarks estandar (MMLU, GLUE, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 2,2 GB solo para pesos (559,9 M de parametros), mas activaciones y overhead; en la practica unos 3-4 GB.
- En fp16/bf16: aproximadamente 1,1 GB de pesos; cabe holgadamente en cualquier GPU consumer con 4 GB o mas.
- GPU recomendadas: cualquier GPU moderna con al menos 4-6 GB de VRAM. Una RTX 3060, RTX 4060, RTX 4090, A100 o H100 pueden ejecutar el modelo; las GPU de gama alta ofrecen mayor throughput pero no son necesarias.
- Cabe en GPU consumer: si, en practicamente cualquier GPU consumer de los ultimos anos (GTX 1660 en adelante) e incluso en CPU para lotes pequenos.
- Opciones de despliegue: `transformers` con `AutoModelForSequenceClassification` (metodo documentado en la model card), y por compatibilidad con la arquitectura XLM-RoBERTa tambien es desplegable con ONNX Runtime, TorchScript o servicios de inferencia tipo TGI/Text Embeddings Inference adaptados a clasificacion. No se documentan integraciones con vLLM, llama.cpp ni Ollama, que no estan orientados a encoders de clasificacion.
- Latencia y throughput: no disponibles en la informacion proporcionada. Por el tamano del modelo, se espera inferencia en milisegundos por lote en GPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de modelos comparables en la informacion proporcionada. La comparativa se limita a caracteristicas estructurales conocidas.

| Modelo | Parametros | Contexto | Idiomas | Tareas | Licencia |
|---|---|---|---|---|---|
| AU-STANDBY/constructive_classifier_EN_DA_context_enriched | 559,9 M | 512 tokens | en, da | 3 tareas multi-etiqueta | No disponible |
| AU-STANDBY/constructive_classifier_EN_DA_non_context_enriched | No disponible (mismo backbone) | 512 tokens | en, da | 3 tareas multi-etiqueta, sin contexto | No disponible |
| intfloat/multilingual-e5-large (modelo base) | 559,9 M | 512 tokens | Multilingue (amplio) | Embeddings, no clasificacion | MIT (segun el modelo base original) |
| Clasificadores de toxicidad genericos (p. ej. basados en XLM-R) | Variable | Variable | Variable | Binario o multi-clase, una tarea | Variable |

La ventaja diferencial frente a clasificadores de una sola tarea es la salida conjunta de tres ejes independientes y el uso del contexto conversacional. La limitacion frente al modelo base es que este clasificador solo cubre ingles y danes, mientras que `multilingual-e5-large` es multilingue amplio.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la model card; al entrenarse sobre un dataset anotado de un proyecto de investigacion concreto, puede heredar sesgos de anotacion y de dominio (probablemente redes sociales o foros).
- Riesgo de alucinacion: no aplica en el sentido generativo, pero el clasificador puede producir etiquetas erroneas con alta confianza, especialmente en la clase "no clasificable", que obtiene el F1 mas bajo (0,54-0,62).
- Limitaciones de contexto: la ventana de 512 tokens limita el tamano de la referencia y la respuesta; textos mas largos se truncan, lo que puede degradar la clasificacion contextual.
- Limitaciones de idioma: solo soporta ingles y danes; no se garantiza un comportamiento correcto en otras lenguas, aunque el backbone sea multilingue.
- Restricciones de licencia: la licencia no esta disponible en la informacion proporcionada, por lo que no puede confirmarse el uso comercial. Debe verificarse en el repositorio antes de desplegarlo en produccion.
- Dependencia del preprocesado: la model card recomienda aplicar el mismo preprocesado que en entrenamiento (sustitucion de menciones `@usuario` y URLs por ``); omitirlo puede degradar el rendimiento.
- Formato de entrada estricto: la variante context-enriched requiere el formato `[reference text] [SEP] [response text]`; usarla sin referencia o con otro formato invalida el supuesto de entrenamiento.
- Uso previsto: es un modelo de investigacion con 23 descargas y sin validacion externa documentada; no se recomienda como unico sistema de moderacion en produccion sin evaluacion propia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AU-STANDBY/constructive_classifier_EN_DA_context_enriched
- Variante sin contexto: https://huggingface.co/AU-STANDBY/constructive_classifier_EN_DA_non_context_enriched
- Modelo base: https://huggingface.co/intfloat/multilingual-e5-large
- Dataset de entrenamiento: https://huggingface.co/datasets/AU-STANDBY/annotated_constructive_dataset_DA_EN
- Referencia arXiv citada en los tags: arXiv:2611.32889 (paper no verificado en la informacion disponible)
