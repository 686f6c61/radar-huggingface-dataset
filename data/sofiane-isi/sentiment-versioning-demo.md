# sofiane-isi/sentiment-versioning-demo

## Resumen

El modelo `sofiane-isi/sentiment-versioning-demo` es una version afinada de `distilbert-base-uncased` para la clasificacion de sentimiento. Lo ha desarrollado el usuario `sofiane-isi` como una demostracion de versionado de modelos, tal como sugiere el nombre. Se trata de un proyecto experimental, no de un modelo listo para produccion. La arquitectura es un transformer encoder destilado de BERT, con 66.955.010 parametros totales. No se ha publicado informacion sobre el dataset de entrenamiento ni sobre la longitud de contexto. El modelo se distribuye bajo licencia Apache-2.0 y los pesos estan en formato safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DistilBERT (transformer encoder) |
| Parametros totales | 66.955.010 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de `distilbert-base-uncased`, que a su vez es una version destilada de BERT-base con un 40 % menos de parametros, manteniendo un rendimiento cercano al original. La arquitectura es un transformer encoder de 6 capas, con embeddings de 768 dimensiones y atencion multi-cabecera. El entrenamiento se realizo durante 1 epoca con un lote de 16 ejemplos, una tasa de aprendizaje de 2e-05 y un optimizador AdamW fusionado. El autor reporta una accuracy de validacion de 0,854 y una perdida de 0,3502. No se proporcionan detalles sobre el dataset, el numero de tokens de entrenamiento ni si hubo ajuste por preferencias (RLHF/DPO). El proceso se genero automaticamente mediante el Trainer de Hugging Face.

## Capacidades

- Clasificacion de sentimiento: el modelo asigna una etiqueta de sentimiento (presumiblemente positivo, negativo o neutral, aunque no se especifica) a un texto de entrada.
- Generacion de texto: no, es un modelo de clasificacion puro, sin capacidad generativa.
- Razonamiento complejo: no se ha entrenado para tareas de razonamiento multi-paso.
- Codigo: no esta preparado para generacion o analisis de codigo.
- Vision: no, solo procesa entrada de texto.
- Tool calling / function calling: no implementado.
- Agentes y multi-step reasoning: no soportado.
- Multilinguismo: el modelo base es en ingles (uncased), pero este fine-tuning no documenta los idiomas soportados.
- Capacidades especiales: ninguna adicional.

## Casos de uso

- Analisis de resenas de productos: el modelo clasifica automaticamente el sentimiento de resenas de clientes en plataformas de e-commerce, lo que permite priorizar respuestas a opiniones negativas.
- Monitorizacion de redes sociales: analisis de tweets o publicaciones para detectar sentimiento negativo hacia una marca o producto en tiempo real.
- Triaje de soporte al cliente: clasificacion de tickets entrantes segun el sentimiento del usuario para priorizar los casos mas urgentes.
- Encuestas de satisfaccion: analisis de respuestas abiertas en encuestas para cuantificar la percepcion general de los encuestados.
- Analisis de comentarios en foros: etiquetado automatico de opiniones en comunidades online para moderacion o estudio de tendencias.
- Pipeline de datos en streaming: integracion del modelo en un flujo de procesamiento de textos para etiquetar comentarios o valoraciones a medida que llegan.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El autor declara los siguientes resultados de validacion durante el entrenamiento:

| Training Loss | Epoch | Step | Validation Loss | Accuracy |
|:-------------:|:-----:|:----:|:---------------:|:--------:|
| No log | 1.0 | 125 | 0.3502 | 0.854 |

## Requisitos de hardware

- No se dispone de datos oficiales sobre requisitos de hardware. A partir del tamano de parametros (66,9 millones), se estima que los pesos en FP32 ocupan aproximadamente 268 MB y en FP16 unos 134 MB.
- La VRAM necesaria para inferencia con lotes pequenos suele rondar entre 1 y 2 GB, aunque el modelo puede ejecutarse en CPU sin problema.
- Cualquier GPU con 2 GB o mas es suficiente; una RTX 3060 o superior ofrece margen de sobra.
- Se puede desplegar con Hugging Face Transformers, o con librerias de optimizacion como ONNX Runtime o TensorRT si se busca reducir latencia.
- No se dispone de datos de latencia o throughput.

## Comparativa con modelos similares

No se han proporcionado datos comparativos en la informacion disponible. El modelo pertenece a la categoria de fine-tunes de DistilBERT para clasificacion de texto. Otros modelos similares son `distilbert-base-uncased` (modelo base sin fine-tuning) y otros fine-tunes como `distilbert-base-uncased-finetuned-sst-2-english`, pero no se dispone de metricas de comparacion. Dado que este modelo es una demo sin benchmarks publicados, no se puede establecer una comparativa cuantitativa.

## Limitaciones y advertencias

- No se documenta el dataset de entrenamiento, por lo que se desconocen los sesgos introducidos.
- La evaluacion se limita a una unica epoca y a una metrica de validacion, sin pruebas externas.
- El modelo es una demostracion y no esta optimizado para produccion.
- Puede fallar en contextos especializados o con jerga no vista durante el entrenamiento.
- El modelo base es en ingles (uncased), por lo que su rendimiento en otros idiomas probablemente sea deficiente.
- La licencia Apache-2.0 permite uso comercial, pero la garantia es limitada y no hay soporte oficial.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sofiane-isi/sentiment-versioning-demo
- Demo en linea: https://sentiment-ai-demo.vercel.app/
- Repositorio GitHub del autor (ml_demos): https://github.com/sofiane87/ml_demos
