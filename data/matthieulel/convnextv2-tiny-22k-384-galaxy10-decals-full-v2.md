# matthieulel/convnextv2-tiny-22k-384-galaxy10-decals-full-v2

## Resumen

convnextv2-tiny-22k-384-galaxy10-decals-full-v2 es un modelo de clasificacion de imagenes obtenido por ajuste fino completo de facebook/convnextv2-tiny-22k-384, un backbone ConvNeXt V2 de 27,87 millones de parametros preentrenado con el esquema FCMAE (fully convolutional masked autoencoder) sobre ImageNet-22k a 384 px. El autor, matthieulel, lo ha adaptado a la clasificacion de morfologia de galaxias en el dataset Galaxy10 DECaLS, que distingue diez clases morfologicas. La tarea resuelve un problema clasico de astronomia observacional: separar galaxias espirales, elipticas e irregulares de forma automatizada en catalogos de gran volumen.

El modelo forma parte de una coleccion mas amplia, Vision Foundation Models Benchmark, en la que se evaluan 40 backbones de vision bajo dos regimenes de adaptacion (ajuste completo y lineal) sobre el mismo conjunto de datos, siguiendo el protocolo revisado del articulo *When foundation models meet astronomical data* (Astronomy and Computing, version revisada, 2026). Esto lo convierte en una pieza de referencia reproducible para comparar arquitecturas de vision en un dominio cientifico concreto, mas que en un modelo de proposito general.

La relevancia practica es doble: por un lado ofrece un clasificador de morfologia galactica ligero (27,9 M de parametros, repo de 0,1 GB) que cabe en cualquier GPU de consumo; por otro, su protocolo de entrenamiento y sus metricas por epoca estan publicados de forma exhaustiva, lo que permite auditar el resultado y reproducirlo. La licencia Apache 2.0 facilita su uso comercial y su integracion en pipelines cientificos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ConvNeXt V2 (CNN pura, fully convolutional), backbone tiny |
| Parametros totales | 27.874.186 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, entrada 384x384 px) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantizacion no documentada) |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El backbone es ConvNeXt V2 en variante tiny, una red convolucional pura que moderniza el diseno de ResNet con convoluciones depthwise de 7x7, normalizacion LayerNorm y activacion GELU, e incorpora el mecanismo GRN (Global Response Normalization) introducido en ConvNeXt V2. El preentrenamiento original de facebook/convnextv2-tiny-22k-384 se realizo con FCMAE sobre ImageNet-22k a resolucion 384. En este checkpoint se sustituye la cabeza de clasificacion por una unica capa lineal de diez salidas y se ajustan todos los parametros (full fine-tuning).

El entrenamiento usa Galaxy10 DECaLS (17.736 imagenes), con el split publico de test (1.774 imagenes) reservado como test held-out y el split de train dividido de forma estratificada en 14.188 imagenes de entrenamiento y 1.774 de validacion. La receta, identica para los 40 backbones del benchmark, es AdamW (betas 0,9/0,999, eps 1e-8, weight decay 0,1, gradient clipping 1,0), learning rate 5e-5 con schedule lineal y 10% de warm-up, batch efectivo de 256 (32 imagenes x 8 pasos de acumulacion), 30 epocas en fp32 con TF32 desactivado y una sola GPU. El aumento de datos se limita a random resized crop a la resolucion de entrada y flip horizontal aleatorio; en evaluacion se redimensiona y recorta al centro a 384x384 px y se aplica la normalizacion del image processor del checkpoint. El checkpoint publicado corresponde a la epoca 11, seleccionada por minima perdida de validacion (0,3914).

## Capacidades

- Clasificacion de imagenes en 10 clases de morfologia galactica del dataset Galaxy10 DECaLS.
- Extraccion de caracteristicas visuales mediante el backbone ConvNeXt V2 tiny, reutilizable para otras tareas de vision por transferencia.
- Inferencia sobre imagenes de 384x384 px con el preprocesado estandar de transformers (resize + center crop + normalizacion).
- No soporta tool calling ni function calling: es un modelo puramente discriminativo de vision.
- No soporta agentes, razonamiento multi-paso ni generacion de texto.
- No tiene capacidades multilingues ni procesa lenguaje natural.
- No dispone de modo thinking, vision generativa, audio ni ninguna modalidad adicional.

## Casos de uso

- Clasificacion automatica de morfologia galactica en catalogos de imagen: el modelo asigna una de las diez clases de Galaxy10 DECaLS a cada recorte de 384x384 px, lo que permite procesar lotes de imagenes de surveys como DECaLS sin intervencion humana y con una precision del 85,51% en el test held-out.
- Etiquetado previo para estudios morfologicos a gran escala: sirve como primer paso para seleccionar submuestras de galaxias espirales o elipticas antes de un analisis manual o espectroscopico mas costoso, reduciendo el volumen de revision humana.
- Baseline reproducible en investigacion de vision astronomica: al formar parte de un benchmark de 40 backbones con receta fija, se puede usar como referencia para medir si una arquitectura nueva mejora o no el rendimiento en el mismo dominio y split.
- Transferencia a tareas relacionadas: el backbone ConvNeXt V2 tiny ajustado puede reinicializarse parcialmente para clasificar otras propiedades galaxicas (por ejemplo, presencia de barras o brazos espirales) con menos datos que partiendo de ImageNet.
- Control de calidad en pipelines de reduccion de datos: integrado como etapa de validacion, permite detectar recortes anomalos o mal segmentados al observar la confianza de la prediccion sobre las diez clases.
- Despliegue en hardware modesto: con 27,9 M de parametros y un repo de 0,1 GB, puede ejecutarse en una GPU de consumo o incluso en CPU para lotes pequenos, lo que facilita su uso en estaciones de trabajo de observatorios sin acceso a clusters.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (model-index), sobre el split de test de Galaxy10 DECaLS (1.774 imagenes):

| Metrica | Valor |
|---|---|
| Accuracy (seed 42, epoca seleccionada 11) | 85,51% |
| Weighted F1 (seed 42, epoca seleccionada 11) | 85,36% |
| Accuracy media +/- desviacion tipica (seeds 42, 1, 2) | 85,34% +/- 0,34 |
| Weighted F1 media +/- desviacion tipica (seeds 42, 1, 2) | 85,12% +/- 0,44 |

No se han publicado en la informacion disponible resultados comparativos con otros modelos del benchmark ni con alternativas externas.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,11 GB solo para pesos (27,9 M de parametros), mas el coste de activaciones para un batch de imagenes de 384x384 px; en la practica, menos de 2 GB para lotes pequenos.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; una RTX 3060, RTX 4060, RTX 4090, A100 o H100 son mas que suficientes. Tambien puede ejecutarse en CPU para inferencia por lotes.
- Cabe holgadamente en GPU de consumo; el cuello de botella es el preprocesado de imagenes, no la memoria.
- Opciones de despliegue: transformers con PyTorch (uso documentado en la model card), exportacion a ONNX o TorchScript para servir con ONNX Runtime o Triton; no se documenta soporte nativo en vLLM, llama.cpp, Ollama ni TGI, que estan orientados a modelos de lenguaje.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de resultados de otros modelos del mismo benchmark en la informacion proporcionada, por lo que la comparativa cuantitativa no esta disponible. Como referencia cualitativa de la misma categoria (clasificacion de imagenes en astronomia con backbone preentrenado):

| Modelo | Parametros | Contexto / entrada | Rendimiento en Galaxy10 DECaLS | Licencia |
|---|---|---|---|---|
| convnextv2-tiny-22k-384-galaxy10-decals-full-v2 | 27,9 M | 384x384 px | 85,51% accuracy (test) | Apache 2.0 |
| Otros backbones del Vision Foundation Models Benchmark | no disponible | no disponible | no disponible en esta ficha | no disponible |
| Clasificadores especificos de morfologia galactica (literatura) | no disponible | no disponible | no disponible en esta ficha | no disponible |

## Limitaciones y advertencias

- El modelo solo predice las diez clases definidas en Galaxy10 DECaLS; no generaliza a esquemas morfologicos mas finos ni a otras taxonomias sin reentrenamiento.
- El rendimiento esta medido sobre un unico dataset y un split concreto; el dominio de aplicacion son imagenes de DECaLS a 384x384 px, y el rendimiento puede degradarse con otras resoluciones, filtros o surveys.
- Riesgo de confusion entre clases morfologicamente proximas y de sesgo hacia las clases mayoritarias del dataset de entrenamiento; la diferencia entre accuracy (85,51%) y weighted F1 (85,36%) sugiere un desbalance moderado entre clases.
- No es un modelo generativo ni de lenguaje: no admite instrucciones en texto, tool calling ni razonamiento; cualquier uso como asistente es inadecuado.
- La seleccion de epoca se hizo sobre validacion (epoca 11), pero en el test la epoca 16 obtiene mejor accuracy (86,19%) y la 24 mejor weighted F1 (86,11%); el checkpoint publicado no es el de maximo rendimiento en test, lo que conviene tener en cuenta al comparar.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias sobre el rendimiento en produccion ni sobre la validez cientifica de las predicciones en muestras fuera del dataset.
- El articulo asociado esta en revision en Astronomy and Computing; la cita definitiva aun no esta disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/matthieulel/convnextv2-tiny-22k-384-galaxy10-decals-full-v2
- Modelo base: https://huggingface.co/facebook/convnextv2-tiny-22k-384
- Dataset Galaxy10 DECaLS: https://huggingface.co/datasets/matthieulel/galaxy10_decals
- Dataset de ejecuciones del benchmark: https://huggingface.co/datasets/matthieulel/vision-foundation-models-benchmark-runs
- Coleccion Vision Foundation Models Benchmark: https://huggingface.co/collections/matthieulel/vision-foundation-models-benchmark-6ae4ae6c3f83b52cf00d9dcb
