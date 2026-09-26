# mcauttam/sentiment-model

## Resumen

sentiment-model es un ajuste fino (fine-tuning) de distilbert-base-uncased publicado por el usuario mcauttam en HuggingFace, orientado a clasificacion de texto y, por el nombre del repositorio, a analisis de sentimiento. Se trata de un transformer encoder de tipo solo-codificador con 66.955.779 parametros, derivado de la destilacion de BERT-base, que reduce el numero de capas de 12 a 6 manteniendo aproximadamente el 97 % del rendimiento del modelo original en tareas de comprension del lenguaje.

El modelo resuelve la tarea de clasificacion de secuencias cortas de texto en categorias de sentimiento, un caso de uso clasico en analitica de opinion, monitorizacion de redes sociales y priorizacion de tickets de soporte. Su relevancia practica radica en el coste de inferencia: con 67 millones de parametros ocupa unos 268 MB en fp32, cabe en cualquier GPU de consumo e incluso puede ejecutarse en CPU con latencias de milisegundos, algo que los clasificadores basados en LLM generativos no ofrecen.

La informacion publicada por el autor es muy limitada: la model card esta generada automaticamente por la libreria Trainer y no documenta el dataset de entrenamiento, los idiomas soportados ni las intenciones de uso. Las unicas metricas disponibles son las de validacion del propio entrenamiento: accuracy 0.6747 y F1 weighted 0.6699 sobre un conjunto de evaluacion no identificado. Es, por tanto, un modelo experimental sin validacion externa ni adopcion en la comunidad (0 descargas, 0 likes en el momento de la consulta).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder solo-codificador (DistilBERT, destilado de BERT-base) |
| Parametros totales | 66.955.779 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 512 tokens (limite arquitectonico de distilbert-base-uncased; no especificado en la model card) |
| Tipos de cuantizacion | No disponible (no se han publicado variantes cuantizadas ni ficheros GGUF) |
| Idiomas soportados | No disponible en la model card; el modelo base distilbert-base-uncased esta entrenado fundamentalmente con texto en ingles (Wikipedia y BookCorpus en su version inglesa) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (etiqueta del repositorio); tamano del repo 0.3 GB |
| Pipeline | text-classification |
| Libreria | transformers |
| Modelo base | distilbert/distilbert-base-uncased |

## Arquitectura y entrenamiento

La arquitectura subyacente es DistilBERT, un transformer encoder con 6 capas, 768 dimensiones ocultas, 12 cabezas de atencion y 66 millones de parametros, obtenido mediante destilacion por transferencia de conocimiento supervisada desde BERT-base durante la fase de preentrenamiento. Sobre esa base, el autor ha anadido una cabeza de clasificacion de secuencias (pooler mas capa lineal) cuyo numero de clases no se especifica en la model card, y ha realizado un ajuste fino completo con la clase Trainer de la libreria transformers.

Los hiperparametros documentados son: learning rate 2e-05 con scheduler lineal, batch de entrenamiento y evaluacion de 32, 3 epocas, semilla 42 y optimizador AdamW con betas (0.9, 0.999), epsilon 1e-08 y la variante torch fused. El entrenamiento duro aproximadamente 174 pasos (58 pasos por epoca), lo que implica un conjunto de entrenamiento muy reducido, del orden de unos pocos miles de ejemplos como maximo. No se documenta la composicion del dataset, ni si hubo RLHF, DPO u otra fase de alineamiento (no aplicable en un encoder de clasificacion).

El comportamiento de las curvas de entrenamiento es informativo: la perdida de entrenamiento cae de 0.6355 a 0.3983 entre la primera y la tercera epoca, mientras que la perdida de validacion sube de 0.6837 a 0.7163. Es un patron claro de sobreajuste a partir de la segunda epoca, coherente con un dataset pequeno y solo 3 epocas de entrenamiento. La mejor metrica de validacion se alcanza en la epoca 2 (accuracy 0.7253, F1 macro 0.7217), aunque las metricas finales reportadas en la model card corresponden a la epoca 3 (accuracy 0.6747, F1 0.6699), lo que sugiere que el checkpoint publicado podria no ser el mejor disponible. No se documenta ninguna innovacion tecnica adicional.

## Capacidades

- Clasificacion de texto: asigna una etiqueta de sentimiento a una secuencia de texto de hasta 512 tokens. No es un modelo generativo, por lo que no produce texto libre.
- Analisis de sentimiento: clasificacion de polaridad en texto corto y medio (resenas, tuits, comentarios, tickets), presumiblemente con un numero reducido de clases, aunque el numero exacto no esta documentado.
- Extraccion de logits y probabilidades por clase mediante `AutoModelForSequenceClassification`, lo que permite umbrales personalizados y agregacion de scores.
- Inferencia por lotes: al ser un encoder pequeno, admite batching agresivo con una huella de memoria minima.
- Soporte de tool calling / function calling: no disponible. No es una capacidad propia de un modelo encoder de clasificacion.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles ni documentadas; el modelo base es de vocabulario ingles sin distincion de mayusculas (uncased).
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Analisis de sentimiento en resenas de producto: el modelo puede etiquetar lotes de resenas de comercio electronico para construir cuadros de mando agregados de satisfaccion. Su ventana de 512 tokens cubre la practica totalidad de las resenas tipicas y su tamano permite procesar cientos de miles de resenas por hora en una sola GPU.
- Monitorizacion de menciones en redes sociales: clasificacion en tiempo real de publicaciones cortas para detectar picos de sentimiento negativo asociados a una marca. La latencia en CPU es del orden de pocos milisegundos por ejemplo, lo que habilita despliegues sin GPU dedicada.
- Triaje y priorizacion de tickets de soporte: uso del score de sentimiento como senal auxiliar para enrutar tickets de clientes molestos a agentes senior. Se integraria como microservicio previo al sistema de ticketing, no como sustituto del enrutado basado en reglas.
- Analisis de encuestas NPS y verbatims: clasificacion automatica de respuestas abiertas para separar comentarios positivos de negativos antes de un analisis tematico manual, reduciendo el volumen que un analista debe leer.
- Filtrado previo en pipelines RAG: uso del clasificador para descartar o etiquetar documentos y fragmentos con tono negativo en corpus de opinion, evitando que un LLM generativo caro procese contenido irrelevante.
- Investigacion academica en PLN: punto de partida para experimentos de destilacion, comparacion de estrategias de ajuste fino o estudio de sobreajuste en datasets pequenos, gracias a su licencia Apache 2.0 y a su reducido coste computacional.
- Clasificacion de feedback interno de empleados: procesamiento on-premise de encuestas internas sin enviar datos a APIs externas, aprovechando que el modelo cabe en una maquina de oficina con CPU y unos pocos cientos de megabytes de RAM.
- Prototipado rapido y pruebas de concepto: su huella de 0.3 GB en disco permite incluirlo como dependencia dentro de una imagen Docker ligera para validar un flujo de clasificacion antes de invertir en un modelo mayor.

## Benchmarks y rendimiento

El model-index publicado por el autor no contiene resultados (`results: []`). Los unicos datos disponibles son las metricas de validacion registradas por el Trainer durante el entrenamiento, que se reproducen a continuacion tal cual. No se especifica el conjunto de evaluacion, el numero de clases ni la distribucion de etiquetas, por lo que estos numeros no son directamente comparables con benchmarks publicos como MMLU, GLUE o SST-2.

| Epoca | Paso | Perdida de entrenamiento | Perdida de validacion | Accuracy | F1 weighted | F1 macro |
|---|---|---|---|---|---|---|
| 1.0 | 58 | 0.6355 | 0.6837 | 0.7130 | 0.7041 | 0.7041 |
| 2.0 | 116 | 0.4831 | 0.7045 | 0.7253 | 0.7217 | 0.7217 |
| 3.0 | 174 | 0.3983 | 0.7163 | 0.7130 | 0.7098 | 0.7098 |
| Checkpoint final reportado en la model card | - | - | 0.7662 | 0.6747 | 0.6699 | 0.6699 |

Observacion tecnica: el valor de perdida de validacion del checkpoint final (0.7662) es superior al de cualquier epoca intermedia registrada (0.6837, 0.7045, 0.7163), y su accuracy (0.6747) es inferior a la de las tres epocas de la tabla. Esto indica que las metricas de la model card no coinciden con las del mejor checkpoint del entrenamiento y sugiere una discrepancia en el conjunto de evaluacion o un guardado posterior del modelo.

No se han publicado resultados de benchmarks estandar (GLUE, SST-2, IMDB) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0.27 GB en fp32 (268 MB de pesos mas activaciones), unos 0.14 GB en fp16 y alrededor de 0.07 GB en int8. En la practica, cualquier GPU con 2 GB o mas es sobradamente suficiente, incluso con batch grande.
- GPU recomendadas: no requiere GPU dedicada. Funciona correctamente en NVIDIA T4, RTX 3060, RTX 4090, A100 o H100, aunque en estos dos ultimos el modelo desaprovechara casi toda la capacidad de computo; el uso tipico es como microservicio pequeno o en CPU.
- Cabe en GPU de consumo: si, en cualquier GPU de consumo de los ultimos diez anos (por ejemplo GTX 1050 Ti, RTX 2060, RTX 4090), y tambien en CPU sin GPU.
- Opciones de despliegue: pipeline de transformers; servidor de inferencia de HuggingFace (el repositorio esta etiquetado como `endpoints_compatible`); exportacion a ONNX o TorchScript para servidores de alto rendimiento; FastAPI o Flask con `pipeline("text-classification")`. No hay ficheros GGUF publicados, por lo que Ollama y llama.cpp no son vias directas (aunque es posible convertir el modelo a GGUF manualmente con herramientas externas). vLLM y TGI soportan arquitecturas encoder, pero estan pensados para modelos generativos y no aportarian ventaja apreciable a este tamano.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada. Como referencia dimensional, un DistilBERT de 67 M de parametros suele procesar del orden de miles de secuencias por segundo en una GPU moderna con batching y del orden de decenas a cientos por segundo en CPU, pero son cifras orientativas no verificadas para este checkpoint concreto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Idiomas | Disponibilidad | Metricas publicadas |
|---|---|---|---|---|---|---|
| mcauttam/sentiment-model | 66.955.779 | 512 tokens | Apache 2.0 | No documentados (base en ingles) | Repositorio HuggingFace, 0 descargas | Accuracy 0.6747 y F1 0.6699 en validacion propia |
| distilbert-base-uncased (modelo base) | 66 M | 512 tokens | Apache 2.0 | Ingles | Ampliamente utilizado, muy descargado | Resultados publicados en GLUE por sus autores |
| roberta-base (encoder de referencia) | 125 M | 514 tokens | MIT | Ingles | Ampliamente utilizado | Resultados publicados en GLUE |
| cardiffnlp/twitter-roberta-base-sentiment-latest | 125 M | 514 tokens | MIT (con condiciones de uso en investigacion) | Ingles y multilingue en variantes | Muy descargado y validado en benchmarks de sentimiento | Metricas publicadas en tareas de sentimiento en redes sociales |
| bert-base-uncased | 110 M | 512 tokens | Apache 2.0 | Ingles | Estandar de facto | Resultados publicados en GLUE |

La comparacion cuantitativa de rendimiento no es posible: este checkpoint no publica resultados en ningun benchmark estandar y sus metricas de validacion (accuracy 0.6747) son notablemente inferiores a las que suelen reportar los clasificadores de sentimiento de referencia, que se situan por encima del 0.85 de accuracy en conjuntos como SST-2 o resenas de Twitter. En igualdad de tamanio, un ajuste fino bien realizado de distilbert-base-uncased deberia superar comodamente el 0.80 de accuracy en una tarea binaria de sentimiento, por lo que el resultado de este modelo apunta a un dataset pequeno, a un problema de mas de dos clases o a un ajuste fino incompleto.

## Limitaciones y advertencias

- Dataset de entrenamiento desconocido: la model card indica explicitamente "unknown dataset" y no documenta composicion, idioma, dominio ni numero de ejemplos. No es posible evaluar su generalizacion fuera del dominio de origen.
- Sobreajuste evidente: la perdida de validacion aumenta de 0.6837 a 0.7163 entre la primera y la tercera epoca mientras la de entrenamiento cae a 0.3983, con solo 174 pasos de entrenamiento. El checkpoint publicado no es el de mejor validacion.
- Rendimiento bajo en terminos absolutos: accuracy 0.6747 y F1 macro 0.6699. Para tareas con clases desbalanceadas, un F1 macro de 0.67 indica errores frecuentes en las clases minoritarias; conviene medir la matriz de confusion antes de cualquier uso real.
- Numero de clases no documentado: se desconoce si el modelo es binario (positivo/negativo) o multiclase, lo que impide saber que representa la etiqueta de salida sin inspeccionar el `config.json` del repositorio.
- Idioma: el modelo base es de vocabulario ingles y el autor no declara idiomas soportados. El rendimiento en castellano u otros idiomas es impredecible y previsiblemente pobre sin un ajuste fino especifico.
- Limite de 512 tokens: los textos mas largos deben truncarse o segmentarse, con perdida de contexto en documentos extensos.
- Sesgos: no se documenta ninguna evaluacion de sesgo. Al ser un derivado de distilbert-base-uncased entrenado sobre un corpus desconocido, heredara los sesgos de genero, raza y registro presentes tanto en el preentrenamiento (Wikipedia y BookCorpus) como en el dataset de ajuste fino, que no ha sido auditado.
- Riesgo de alucinacion: no aplica en sentido estricto, porque el modelo no genera texto. El riesgo equivalente es la clasificacion erronea con alta confianza (sobreconfianza), especialmente en dominios alejados del conjunto de entrenamiento.
- Licencia: Apache 2.0 permite uso comercial, modificacion y redistribucion con atribucion y sin obligacion de compartir derivados. Sin embargo, la ausencia de documentacion sobre el dataset de ajuste fino impide verificar que los datos de entrenamiento no tengan restricciones de uso, lo que traslada un riesgo legal no cuantificado a un despliegue comercial.
- Ausencia de validacion comunitaria: con 0 descargas y 0 likes, el modelo no ha sido reproducido ni evaluado por terceros. No debe usarse en produccion sin una evaluacion propia sobre datos representativos del caso de uso.
- Repositorio con model card autogenerada: el propio texto incluye avisos de "More information needed" en las secciones de descripcion, usos previstos y datos de entrenamiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mcauttam/sentiment-model
- Modelo base: https://huggingface.co/distilbert-base-uncased
- Paper de DistilBERT (Sanh et al., 2019): https://arxiv.org/abs/1910.01108
- Paper de BERT (Devlin et al., 2018): https://arxiv.org/abs/1810.04805
- Repositorio de transformers: https://github.com/huggingface/transformers
- Documentacion de DistilBertForSequenceClassification: https://huggingface.co/docs/transformers/model_doc/distilbert
- Documentacion de la tarea de clasificacion de texto: https://huggingface.co/tasks/text-classification
