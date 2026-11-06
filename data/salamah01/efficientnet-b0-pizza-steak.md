# Salamah01/efficientnet-b0-pizza-steak

## Resumen

EfficientNet-B0 pizza vs steak es un clasificador binario de imagenes desarrollado por el usuario Salamah01 como proyecto de aprendizaje de transfer learning. Partiendo de un EfficientNet-B0 preentrenado en ImageNet (via torchvision), el autor sustituye la cabeza de clasificacion original por una nueva capa lineal (1280 a 1) con dropout de 0,2 y activacion sigmoide, y ajusta el modelo sobre un conjunto propio de imagenes de pizza y filete.

El modelo resuelve una tarea muy acotada: dada una imagen, devuelve la probabilidad de que corresponda a la clase 1 (filete), siendo la clase 0 la pizza. No es un modelo de proposito general ni un sistema multimodal: es un artefacto de demostracion con pesos en formato PyTorch (.pth), licencia MIT y un repositorio de tamano practicamente nulo en el momento de la consulta.

Su relevancia es limitada fuera del ambito educativo: sirve como ejemplo reproducible de un pipeline de transfer learning en dos fases (congelacion y descongelacion parcial del backbone) y como caso de estudio de las precauciones que exige desplegar un clasificador de dos clases en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | EfficientNet-B0 (CNN con compound scaling) con cabeza binaria personalizada |
| Parametros totales | no disponible (EfficientNet-B0 base ronda los 5,3 M, dato no confirmado en la model card) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, no de texto) |
| Tipos de cuantizacion | no disponible (solo se distribuyen pesos .pth en precision original) |
| Idiomas soportados | no aplica (clasificacion de imagenes; etiquetas en ingles: pizza, steak) |
| Licencia | MIT |
| Formato de pesos | .pth (PyTorch state dict) |

## Arquitectura y entrenamiento

La arquitectura es una red neuronal convolucional EfficientNet-B0, importada desde torchvision con pesos preentrenados en ImageNet. La cabeza original se reemplaza por una secuencia Dropout(0,2) seguida de Linear(1280, 1) y una sigmoide, de modo que la salida es una probabilidad escalar. El entrenamiento se realizo en dos fases: en la primera se congela el backbone y solo se entrena la nueva cabeza (Adam, learning rate 0,001, 5 epocas); en la segunda se descongelan los tres ultimos bloques de caracteristicas y se ajusta con Adam a learning rate 0,0001 durante 5 epocas adicionales. La funcion de perdida es BCEWithLogitsLoss con tamano de lote 32.

El conjunto de datos consta de 1200 imagenes de entrenamiento, 300 de validacion y 500 de prueba, con aumentacion basada en recorte redimensionado aleatorio, volteo horizontal y variacion de color (color jitter). No se documenta el origen de las imagenes, la composicion por clase, la resolucion de entrada ni si hubo balanceo. Tampoco se menciona el uso de tecnicas como RLHF, DPO ni decodificacion especulativa, propias de modelos de lenguaje y no aplicables aqui.

## Capacidades

- Clasificacion binaria de imagenes en dos categorias: pizza (indice 0) y filete (indice 1).
- Salida de una probabilidad calibrada de forma implicita mediante sigmoide sobre el logit de la clase filete.
- Inferencia sobre imagenes individuales mediante una funcion `predict` incluida en el repositorio.
- Carga de pesos y codigo a traves de `huggingface_hub` (`hf_hub_download`), con un fichero `model.py` y un `config.json` auxiliares.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingues.
- No dispone de modo thinking, vision general, audio ni generacion de texto.

## Casos de uso

- Demo educativa de transfer learning: el modelo sirve para ilustrar en un curso o tutorial como se congela un backbone preentrenado, se sustituye la cabeza y se hace fine-tuning parcial en dos fases con un dataset pequeno.
- Clasificacion de menus o catalogos gastronomicos controlados: en un entorno con fotografias de estudio de solo dos platos, puede etiquetar automaticamente imagenes para una base de datos interna, siempre con revision humana.
- Filtro previo en un pipeline de vision mas amplio: como primera etapa de bajo coste para descartar imagenes que no sean de comida antes de pasar a un modelo mayor, aunque su naturaleza binaria limita mucho este uso.
- Prueba de concepto de extremo a extremo: validar el flujo de descarga de pesos, carga de codigo y ejecucion de inferencia con `huggingface_hub` en un entorno PyTorch antes de migrar a un modelo propio.
- Ejercicio de evaluacion de robustez: analizar como se comporta un clasificador de dos clases ante imagenes fuera de distribucion, dado que siempre devuelve una de las dos etiquetas.
- Referencia para comparativas de metodos de aumentacion: reproducir el pipeline de recorte, volteo y color jitter y medir su impacto en un dataset propio de dos clases.

## Benchmarks y rendimiento

| Metrica | Valor | Conjunto |
|---|---|---|
| Exactitud (accuracy) | 99,80 % | Test propio de 500 imagenes |

No se han publicado resultados de benchmarks estandar (ImageNet, Food-101 u otros) en la informacion disponible. La unica cifra reportada es la exactitud sobre el conjunto de prueba del autor, sin comparacion con lineas base ni intervalos de confianza.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en precision FP32 para EfficientNet-B0 con entrada de resolucion estandar (224x224); no confirmado en la model card.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; una RTX 3060, RTX 4090 o incluso una GTX 1650 pueden ejecutar la inferencia sin problemas.
- Cabe en GPU consumer: si, practicamente en cualquier GPU con al menos 2 GB de VRAM, e incluso en CPU para inferencia por lotes pequenos.
- Opciones de despliegue: PyTorch nativo (unico soportado oficialmente por el autor), exportacion a TorchScript u ONNX no documentada pero viable; no hay pesos GGUF ni integracion con Ollama, vLLM o TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Salamah01/efficientnet-b0-pizza-steak | no disponible (base EfficientNet-B0) | Imagen 2D, sin contexto textual | 99,80 % en test propio de 500 imagenes | MIT | Hugging Face, 0 descargas |
| EfficientNet-B0 (torchvision, ImageNet) | ~5,3 M | Imagen 2D | Top-1 ~77,7 % en ImageNet (referencia externa, no verificada en esta ficha) | BSD-3-Clause (torchvision) | Ampliamente disponible |
| ResNet-50 (torchvision, ImageNet) | ~25,6 M | Imagen 2D | Top-1 ~80,9 % en ImageNet (referencia externa) | BSD-3-Clause | Ampliamente disponible |
| CLIP ViT-B/32 (zero-shot) | ~151 M | Imagen + texto | Clasificacion zero-shot variable | MIT (pesos OpenAI) | Ampliamente disponible |

La comparacion directa con estos modelos no es homogenea: el modelo de Salamah01 esta especializado en dos clases y su exactitud no es trasladable a tareas generales, mientras que los alternativos son modelos de proposito general. No se dispone de datos de benchmarks comparables en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo solo conoce dos clases y siempre respondera con una de ellas, incluso ante imagenes no relacionadas (limitacion declarada por el autor).
- La exactitud del 99,80 % procede de un test propio de 500 imagenes sin documentar su procedencia, balance de clases ni posible contaminacion con el conjunto de entrenamiento; no debe interpretarse como rendimiento garantizado en produccion.
- No se documenta la resolucion de entrada, el preprocesado exacto ni el rango de normalizacion, lo que puede provocar degradacion si se usa con un pipeline distinto al del autor.
- Riesgo de sesgo por el origen no especificado de las imagenes: si el dataset esta sesgado hacia ciertos estilos de fotografia, iluminacion o presentacion, el modelo fallara en dominios distintos.
- Riesgo de alucinacion en sentido amplio: el clasificador no puede indicar "ninguna de las dos clases", por lo que etiquetara erróneamente imagenes fuera de distribucion.
- No hay soporte multilingue ni procesamiento de texto; las etiquetas estan en ingles.
- Licencia MIT: permite uso comercial y modificacion con atribucion, pero el autor no ofrece garantias de ningun tipo.
- Proyecto de aprendizaje con 0 descargas y 0 likes en el momento de la consulta: sin mantenimiento, sin issues resueltos y sin validacion externa.
- El repositorio tiene un tamano declarado de 0,0 GB, lo que sugiere que los pesos pueden no estar efectivamente subidos o que el dato es impreciso; conviene verificar la descarga antes de integrarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Salamah01/efficientnet-b0-pizza-steak
- Documentacion de EfficientNet en torchvision: https://pytorch.org/vision/stable/models/efficientnet.html
- Paper original de EfficientNet: https://arxiv.org/abs/1905.11946
- Documentacion de huggingface_hub: https://huggingface.co/docs/huggingface_hub
