# bangbangkido/Product-Classifier-ONNX-INT8

## Resumen

Product-Classifier-ONNX-INT8 es un clasificador de texto en chino para titulos de productos de comercio electronico, exportado a ONNX y cuantizado a INT8 para inferencia en CPU. Lo desarrolla el usuario bangbangkido y deriva del modelo PyTorch `bangbangkido/Product-Classifier`, cuyo backbone es `google-bert/bert-base-chinese`. Resuelve el problema de categorizar titulos de producto en 30 clases fijas (sistema legacy) con un coste de computo bajo y sin dependencia de GPU.

La relevancia practica del modelo esta en su formato: un grafo ONNX de 152.826.473 bytes (frente a 407.003.189 bytes en FP32, una reduccion del 62,45%) que se ejecuta unicamente con ONNX Runtime CPU, tokenizer y NumPy, sin PyTorch ni CUDA. La longitud de entrada es fija de 48 tokens, con batch variable, y la salida es un vector de logits de 30 dimensiones.

Es importante senalar que el autor marca este repositorio como **legacy**: usa un esquema de 30 clases incompatible con el estandar actual de 27 clases de la familia `product-title-classifier-*`. Para nuevas integraciones, el propio autor redirige a la version de 27 clases en ModelScope.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (transformer encoder), exportado a ONNX |
| Parametros totales | no disponible (backbone `bert-base-chinese`) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 48 tokens fijos (incluye tokens especiales; truncado en exceso) |
| Tipos de cuantizacion | INT8 estatico QDQ, per-channel, mixed precision; tambien se distribuye FP32 |
| Idiomas soportados | chino (zh) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`model.fp32.onnx`, `model.int8.onnx`) |

## Arquitectura y entrenamiento

El modelo es un encoder BERT base en chino afinado para clasificacion de secuencias con 30 etiquetas. La exportacion a ONNX mantiene la interfaz estandar de dos entradas (`input_ids` y `attention_mask`, ambas int64 de forma `[batch, 48]`) y una salida `logits` float32 de forma `[batch, 30]`. La version identificada es `20261027-051303-065127_seq48_bs32_lr1e-05_ep100_seed42_samplesall`, lo que indica una entrada de 48 tokens, batch 32, learning rate 1e-5, 100 epocas y semilla 42.

La cuantizacion es estatica QDQ con precision mixta por canal: las matrices MatMul constantes del encoder usan pesos y activaciones INT8, mientras que Embedding, LayerNorm, Softmax, la cabeza de clasificacion y otros operadores se mantienen en FP32. La calibracion se realizo con 128 muestras extraidas del conjunto de entrenamiento con semilla 42. El autor documenta que los datos originales de preprocesado a 64 tokens se convirtieron a 48 tokens en un directorio de publicacion independiente, preservando el SEP en el punto de truncado.

## Capacidades

- Clasificacion de texto en 30 categorias de producto a partir de titulos en chino.
- Inferencia por lotes con orden de salida garantizado respecto a la entrada.
- Ejecucion en CPU pura mediante ONNX Runtime (CPUExecutionProvider), sin GPU.
- Funcionamiento offline una vez descargado el repositorio completo.
- Interfaz programatica en Python (`OnnxClassifier` con `predict_many`) y script CLI (`predict.py`).
- Compatibilidad declarada con text-embeddings-inference y endpoints compatibles.
- No soporta generacion de texto, tool calling, agentes, vision ni audio: es un clasificador discriminativo.
- No soporta multi-turno ni razonamiento multi-paso.

## Casos de uso

- Categorizacion automatica de catalogos de e-commerce: dado un titulo de producto en chino, el modelo devuelve una de las 30 clases, lo que permite asignar categoria de forma masiva en pipelines de ingestion de datos sin coste de GPU.
- Enriquecimiento de feeds de marketplace: procesar lotes de miles de titulos con `predict_many` y batch 32 para poblar campos de categoria en bases de datos de producto.
- Filtrado y moderacion de listados: detectar titulos que caen en categorias sensibles o restringidas antes de publicarlos, aprovechando la inferencia en CPU para integrarse en un servicio web ligero.
- Normalizacion de taxonomias heredadas: mapear titulos de sistemas antiguos al esquema de 30 clases durante migraciones, siempre que el destino siga usando ese esquema legacy.
- Servicio de clasificacion de baja latencia en contenedores sin GPU: al requerir solo ONNX Runtime, tokenizer y NumPy, puede desplegarse en instancias CPU pequenas o en el borde.
- Preetiquetado para anotacion humana: generar categorias iniciales sobre grandes volumenes de titulos y reservar la revision manual para los casos de baja confianza (utilizando los logits como senal).
- Busqueda y navegacion facetada: usar la categoria predicha como filtro adicional en motores de busqueda interna de un catalogo.

## Benchmarks y rendimiento

Evaluacion sobre 11.104 muestras de validacion completas, ONNX Runtime con CPUExecutionProvider, batch 32 y 4 hilos de CPU (2026-10-28):

| Metrica | PT FP32 | ONNX FP32 | ONNX INT8 |
|---|---:|---:|---:|
| Accuracy | 94,6686% | 94,6686% | 93,3898% |
| Macro Precision | 89,0989% | 89,0989% | 88,5181% |
| Macro Recall | 87,1758% | 87,1758% | 84,5574% |
| Macro F1 | 88,0200% | 88,0200% | 86,2797% |

La cuantizacion INT8 reduce la accuracy 1,2788 puntos porcentuales y el Macro F1 1,7403 puntos, dentro del umbral interno de "no mas de 2 puntos" fijado por el autor. El conjunto de validacion participo en el early stopping y la seleccion de modelo, por lo que estas cifras no son una evaluacion en test independiente. El autor advierte ademas de clases muy desbalanceadas: "书籍" tiene 1 sola muestra con F1 de 0, y "汽车用品" tiene 19 muestras con F1 del 60,61%. No se realizaron pruebas de throughput ni latencia en el servidor objetivo.

## Requisitos de hardware

- Inferencia exclusivamente en CPU: no requiere GPU ni CUDA.
- Memoria: el grafo INT8 ocupa 152,8 MB; el FP32, 407,0 MB. El repositorio completo pesa 0,7 GB.
- Cabe en cualquier maquina consumer con CPU moderna; el cuello de botella es el computo, no la VRAM.
- Despliegue mediante ONNX Runtime (CPUExecutionProvider), con scripts incluidos (`predict.py`, `inference.py`).
- No se documentan opciones para vLLM, llama.cpp, Ollama o TGI, al no ser un modelo generativo.
- Latencia y throughput: no disponibles. El autor indica explicitamente que el tiempo de evaluacion no constituye una promesa de rendimiento en despliegue.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Accuracy (validacion) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Product-Classifier-ONNX-INT8 (este) | no disponible | 48 tokens | 93,39% (INT8) / 94,67% (FP32) | Apache-2.0 | Hugging Face |
| Product-Classifier (PT, 30 clases) | no disponible | 64 tokens (preprocesado original) | 94,67% | Apache-2.0 | Hugging Face |
| product-title-classifier-bert-base-chinese-v2 (27 clases) | no disponible | no disponible | no disponible | no disponible | ModelScope |
| product-title-classifier-chinese-macbert-base (27 clases) | no disponible | no disponible | no disponible | no disponible | ModelScope |

Las alternativas de 27 clases son las recomendadas por el propio autor para nuevas integraciones, pero no se han publicado metricas comparables en la informacion disponible.

## Limitaciones y advertencias

- **Esquema legacy de 30 clases**: incompatible con el estandar actual de 27 clases; no debe mezclarse con la familia `product-title-classifier-*`.
- **Idioma unico**: solo chino; no soporta otros idiomas.
- **Contexto muy corto**: 48 tokens fijos; los titulos mas largos se truncan, con perdida de informacion.
- **Texto fuera de dominio**: cualquier entrada se asigna a una de las 30 clases existentes, sin opcion de "desconocido".
- **Perdida de precision por cuantizacion**: 1,28 puntos de accuracy y 1,74 de Macro F1 frente a FP32.
- **Clases desbalanceadas**: categorias con muy pocas muestras presentan metricas inestables o nulas.
- **Validacion no independiente**: el conjunto de validacion se uso para early stopping y seleccion de modelo.
- **Sin datos de rendimiento en produccion**: no hay pruebas de latencia ni throughput.
- **Compatibilidad de carga**: el modelo ONNX personalizado no se puede cargar directamente con `AutoModelForSequenceClassification`.
- **Licencia**: Apache-2.0 permite uso comercial, pero debe conservarse el aviso de licencia; el backbone `google-bert/bert-base-chinese` tambien es Apache-2.0.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/bangbangkido/Product-Classifier-ONNX-INT8
- Modelo base PyTorch (30 clases): https://huggingface.co/bangbangkido/Product-Classifier
- Version 27 clases BERT v2 (ModelScope): https://www.modelscope.cn/models/bangbangkido/product-title-classifier-bert-base-chinese-v2
- Version 27 clases MacBERT (ModelScope): https://www.modelscope.cn/models/bangbangkido/product-title-classifier-chinese-macbert-base
- Backbone: https://huggingface.co/google-bert/bert-base-chinese
