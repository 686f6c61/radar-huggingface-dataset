# nattly/rahmahandjoanitah-sentiment-model

## Resumen

`nattly/rahmahandjoanitah-sentiment-model` es un clasificador binario de sentimiento (positivo / negativo) en inglés, obtenido mediante fine-tuning de `distilbert-base-uncased`. Lo publican en Hugging Face Namugwanya Rahmah y Nattabi Joanitah bajo la cuenta `nattly`, y la model card lo presenta como un trabajo de equipo académico, con un conjunto de datos propio (`nattlyandrahma-sentiment-model`) y evaluación sobre un test set del que no se detalla composición ni tamaño.

El modelo es un transformer encoder de 66.955.010 parámetros (aproximadamente 67 M), la arquitectura DistilBERT de 6 capas y 768 dimensiones ocultas, con un límite de 512 tokens por secuencia. El repo ocupa 0,3 GB y los pesos están en `safetensors`. No incorpora capacidades generativas: es una cabeza de clasificación sobre el token `[CLS]` que devuelve dos etiquetas, POSITIVE y NEGATIVE.

Su relevancia es limitada y muy acotada: sirve como ejemplo reproducible de fine-tuning ligero de sentiment analysis y como clasificador de reseñas cinematográficas en inglés que cabe en cualquier equipo. No es un modelo para producción multilingüe ni para dominios distintos del reseñado: la propia model card declara que solo se entrenó con reseñas de películas en inglés y que falla con sarcasmo y con texto mezclado Luganda/inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DistilBERT, destilado de BERT-base): 6 capas, 768 dimensiones ocultas, 12 cabezas de atencion |
| Parametros totales | 66.955.010 (dato real de los pesos en safetensors) |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | 512 tokens (limite de posiciones de DistilBERT) |
| Tipos de cuantizacion | No disponible en la informacion proporcionada; al ser un encoder de 67 M es convertible a int8 y a formatos GGUF/ONNX con herramientas estandar |
| Idiomas soportados | Ingles (`en`) unicamente |
| Licencia | No disponible |
| Formato de pesos | safetensors (repo de 0,3 GB) |

## Arquitectura y entrenamiento

La base es DistilBERT, una destilacion de BERT-base que conserva la mitad de las capas (6 frente a 12) y aproximadamente el 60 % de los parametros, manteniendo las 768 dimensiones ocultas y el vocabulario de 30.522 tokens de `distilbert-base-uncased`. Sobre ese encoder se anade una cabeza de clasificacion con dos etiquetas de salida (POSITIVE, NEGATIVE). El modelo es *uncased*: el texto se normaliza a minusculas antes de la tokenizacion.

No se han publicado en la informacion disponible ni el numero de tokens de entrenamiento, ni la composicion exacta del dataset, ni los hiperparametros (learning rate, epocas, batch size), ni si se aplico algun ajuste posterior tipo RLHF o DPO (procedimiento, por otra parte, poco habitual en un clasificador). La unica referencia al corpus es el nombre `nattlyandrahma-sentiment-model`, sin URL verificada ni estadisticas de tamano. Tampoco se documenta ninguna innovacion tecnica mas alla del fine-tuning supervisado estandar con `transformers`.

## Capacidades

- Clasificacion de sentimiento binaria en ingles: devuelve POSITIVE o NEGATIVE con una puntuacion de confianza (softmax) por prediccion.
- Analisis de reseñas y opiniones de dominio cinematografico, el unico dominio declarado en el entrenamiento.
- Integracion directa con el pipeline `text-classification` de Transformers, lo que permite uso en una linea de codigo.
- Procesamiento por lotes de textos cortos mediante `batch_size` en el pipeline.
- No soporta tool calling ni function calling, ni razonamiento multi-paso, ni uso como agente: no es un modelo generativo.
- No dispone de modo *thinking*, vision, audio ni capacidades multimodales.
- Capacidad multilingue: nula. Solo ingles; la model card reconoce dificultades con texto mixto Luganda/ingles.
- No maneja la clase neutra: fuerza toda entrada a positivo o negativo, lo que produce asignaciones erroneas en opiniones ambiguas (la propia model card muestra "The movie was okay, but the story was predictable" clasificada como NEGATIVE con 0,9989).

## Casos de uso

- Moderacion y triaje de reseñas de cine o series en ingles: el modelo etiqueta cada reseña como positiva o negativa en milisegundos y permite priorizar las negativas para atencion al cliente o para detectar crisis reputacionales.
- Cuadro de mando de reputacion de producto: procesar en lote reseñas exportadas (CSV) y agregar el porcentaje de sentimiento negativo por titulo, usando la puntuacion de confianza como filtro para descartar predicciones poco fiables.
- Enriquecimiento de datasets para otros proyectos: usar las etiquetas del modelo como preetiquetado (weak supervision) de reseñas en ingles antes de una revision humana, dado su bajo coste computacional.
- Filtro previo en un pipeline de analisis mas complejo: descartar o marcar reseñas negativas antes de pasarlas a un modelo mayor para extraer causas concretas de insatisfaccion, reduciendo el coste de inferencia del sistema global.
- Demo educativa y material docente: por sus 67 M de parametros y su formato safetensors, sirve para ilustrar fine-tuning, evaluacion con accuracy/F1 y despliegue de un pipeline de clasificacion en un notebook o en un portatil sin GPU.
- Pruebas de regresion de infraestructura de inferencia: modelo de referencia barato para validar endpoints de TGI, vLLM o un servidor de inferencia propio antes de desplegar modelos de mayor tamano.
- Analisis de encuestas abiertas de un solo pais angloparlante con preguntas de satisfaccion tipo escala Likert traducidas a texto libre: util solo si el corpus es homogeneous en ingles y de tematica de entretenimiento.

## Benchmarks y rendimiento

Los unicos datos publicados son la evaluacion propia del autor sobre su test set, sin detalle de tamano ni de composicion. No hay resultados en benchmarks estandar (MMLU, GLUE, SST-2, HumanEval), por lo que no se pueden comparar de forma rigurosa con otras alternativas.

| Metrica | Resultado | Ambito |
|---|---|---|
| Accuracy | 0,91 | Test set propio del autor (tamano no disponible) |
| F1 | 0,91 | Test set propio del autor (tamano no disponible) |

Ejemplos de prediccion reportados en la model card:

| Reseña | Prediccion | Puntuacion |
|---|---|---|
| This movie was fantastic! The acting was brilliant. | POSITIVE | 0,9974 |
| Terrible experience, I want my money back. | NEGATIVE | 0,9901 |
| The movie was okay, but the story was predictable. | NEGATIVE | 0,9989 |

No se han publicado resultados de benchmarks estandar en la informacion disponible.

## Requisitos de hardware

- Huella de memoria de los pesos: aproximadamente 268 MB en fp32 (4 bytes por parametro sobre 66,96 M), unos 134 MB en fp16 y unos 67 MB en int8. El repo completo son 0,3 GB.
- VRAM: cualquier GPU con 1 GB o mas puede ejecutar el modelo en fp16; en la practica la limitacion sera el tamano del lote y la longitud de las secuencias, no el modelo.
- GPU recomendadas: no requiere GPU dedicada. Cabe con holgura en RTX 3060, RTX 4060, RTX 4090, T4, L4, A10, A100 y H100, donde el cuello de botella sera el preprocesado de texto y no el calculo.
- Inferencia en CPU: viable y habitualmente suficiente; es un encoder de 6 capas con secuencias de hasta 512 tokens.
- Opciones de despliegue: pipeline `text-classification` de Transformers, Text Generation Inference (TGI) para servir el modelo por HTTP, exportacion a ONNX Runtime o a GGUF para llama.cpp, y empaquetado en contenedores ligeros. vLLM esta orientado a modelos generativos y no aporta ventajas aqui.
- Latencia y throughput: no se han publicado mediciones en la informacion disponible. Como referencia de orden de magnitud, un encoder de 67 M procesa lotes de decenas de secuencias cortas en CPU en tiempos del orden de decenas de milisegundos, pero esta cifra no esta verificada para este modelo concreto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idioma | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| nattly/rahmahandjoanitah-sentiment-model | 66,96 M | 512 tokens | Ingles | No disponible | Hugging Face, 0 descargas y 0 likes en el momento de la consulta |
| distilbert-base-uncased-finetuned-sst-2-english | ~67 M | 512 tokens | Ingles | Apache 2.0 | Hugging Face, modelo de referencia ampliamente usado |
| cardiffnlp/twitter-roberta-base-sentiment-latest | ~125 M | 514 tokens | Ingles (dominio Twitter) | No verificada en esta ficha | Hugging Face, con tres clases (negativo/neutro/positivo) |
| bert-base-uncased + cabeza de clasificacion | ~110 M | 512 tokens | Ingles | Apache 2.0 | Hugging Face, requiere fine-tuning propio |

La comparacion cualitativa es clara: frente a las alternativas, este modelo parte con desventajas de licencia (no declarada) y de validacion externa (sin descargas ni evaluaciones independientes), mientras que el DistilBERT fine-tuned en SST-2 de la propia Hugging Face ofrece licencia Apache 2.0 y un historial de uso mucho mayor. El modelo de Cardiff NLP anade la clase neutra, algo que este clasificador no contempla. No se dispone de cifras comparables de accuracy entre estos modelos dentro de la informacion de esta ficha.

## Limitaciones y advertencias

- Dominio muy restringido: solo reseñas de peliculas en ingles. El rendimiento en opiniones de producto, soporte tecnico, redes sociales o texto juridico es desconocido y probablemente inferior.
- Clasificacion binaria forzada: no existe clase neutra, de modo que opiniones tibias se asignan a POSITIVE o NEGATIVE. El ejemplo de la propia model card ("okay, but predictable" como NEGATIVE con 0,9989) evidencia una confianza mal calibrada en ese tipo de entradas.
- Sarcasmo e ironia: la model card reconoce explicitamente que el modelo no los maneja bien.
- Texto mezclado Luganda/ingles: declarado como punto debil por los autores.
- Riesgo de alucinacion: no aplica en el sentido generativo (el modelo no produce texto libre), pero si existe riesgo de predicciones erroneas con alta confianza, lo que es igualmente peligroso si se consume la puntuacion como probabilidad calibrada sin umbral.
- Sesgos: no documentados. Al entrenarse sobre un corpus no descrito de reseñas cinematograficas, puede heredar sesgos de dominio, de genero o culturales presentes en esas fuentes. No hay evaluacion de sesgo publicada.
- Licencia no disponible: no se puede asumir permiso de uso comercial. Antes de integrarlo en un producto hay que contactar con los autores o elegir una alternativa con licencia explicita (Apache 2.0 o MIT).
- Madurez: repositorio creado y actualizado el 26 de octubre de 2026, con 0 descargas y 0 likes. Sin mantenimiento demostrado, sin tests y sin issues de referencia. No es una dependencia recomendable para produccion.
- Sin documentacion de entrenamiento: no se puede auditar el dataset, el proceso de anotacion ni las posibles fugas entre train y test, por lo que el 0,91 de accuracy no es verificable de forma independiente.
- Limite duro de 512 tokens: reseñas largas se truncan, con perdida de la parte final del texto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nattly/rahmahandjoanitah-sentiment-model
- Perfil del autor en Hugging Face: https://huggingface.co/nattly
- Dataset referenciado en la model card: `nattlyandrahma-sentiment-model` (nombre citado por los autores; no se ha localizado URL verificable)
- Paper de DistilBERT (Sanh et al., 2019): https://arxiv.org/abs/1910.01108
- Paper de BERT (Devlin et al., 2018): https://arxiv.org/abs/1810.04805
- Documentacion del pipeline de clasificacion de texto de Transformers: https://huggingface.co/docs/transformers/main_classes/pipelines#transformers.TextClassificationPipeline
- Documentacion de DistilBERT en Transformers: https://huggingface.co/docs/transformers/model_doc/distilbert
