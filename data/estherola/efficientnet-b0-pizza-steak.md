# estherola/efficientnet-b0-pizza-steak

## Resumen

EfficientNet-B0 pizza vs steak es un clasificador binario de imagenes desarrollado por el usuario estherola como proyecto de aprendizaje. Se construye mediante transfer learning sobre un EfficientNet-B0 preentrenado en ImageNet (disponible en torchvision) y se reentrena para distinguir entre dos clases: pizza (indice 0) y steak (indice 1). El modelo devuelve la probabilidad de que la imagen pertenezca a la clase steak mediante una sigmoide en la cabeza de clasificacion.

La relevancia del modelo es limitada: se trata de un ejercicio didactico publicado en HuggingFace, sin descargas ni likes en el momento de la consulta, y con un repositorio de 0.0 GB que sugiere que los pesos podrian no estar subidos o ser de tamano despreciable. No obstante, el autor reporta una precision del 99.40% en el conjunto de test, un dato que debe interpretarse con cautela dado el reducido tamano del dataset y la simplicidad de la tarea.

Arquitectonicamente es una CNN EfficientNet-B0 estandar con una cabeza lineal de 1280 a 1 neuronas, sin innovaciones tecnicas destacables. El contexto de uso es la clasificacion de imagenes de comida en dos categorias, y su interes practico es escaso fuera del ambito educativo o de prototipado rapido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | EfficientNet-B0 (CNN) con cabeza lineal personalizada |
| Parametros totales | no disponible (EfficientNet-B0 base: ~5,3 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (clasificacion de imagenes) |
| Licencia | MIT |
| Formato de pesos | .pth (PyTorch state dict) |

## Arquitectura y entrenamiento

El modelo parte de un EfficientNet-B0 preentrenado en ImageNet, una CNN con bloques MBConv y conexiones residuales que emplea compound scaling para equilibrar profundidad, anchura y resolucion. Sobre el backbone se anade una cabeza compuesta por Dropout(0.2), una capa Linear(1280, 1) y una sigmoide, que produce la probabilidad de la clase steak. La salida es un unico escalar, por lo que la clase pizza corresponde al complemento.

El entrenamiento se realizo en dos fases. En la primera se congelo el backbone y se entreno solo la cabeza nueva con Adam (lr 0.001) durante 5 epocas. En la segunda se descongelaron los ultimos 3 bloques de caracteristicas y se continuo el entrenamiento con Adam (lr 0.0001) durante un numero de epocas no especificado en la model card. La funcion de perdida fue BCEWithLogitsLoss, con batch size 32 y aumentacion de datos mediante random resized crop, horizontal flip y color jitter. El dataset consta de 1200 imagenes de entrenamiento, 300 de validacion y 500 de test. No se menciona el uso de RLHF, DPO ni tecnicas de alineacion, algo esperable en un clasificador de vision.

## Capacidades

- Clasificacion binaria de imagenes en dos categorias: pizza y steak.
- Salida de una probabilidad continua (sigmoide) para la clase steak.
- Inferencia sobre imagenes individuales mediante una funcion `predict` incluida en el codigo del repositorio.
- Carga de pesos y configuracion mediante `hf_hub_download` desde HuggingFace Hub.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues (no procesa texto).
- No dispone de modo thinking, vision general, audio ni otras capacidades especiales.

## Casos de uso

- Prototipado educativo de transfer learning: sirve como ejemplo practico para aprender a adaptar un backbone preentrenado a una tarea binaria con PyTorch y torchvision, incluyendo congelacion y descongelacion de capas.
- Clasificacion rapida de imagenes de menu en una demo: se puede integrar en un script que reciba fotos de platos y devuelva si es pizza o steak, util para una prueba de concepto de una app de restaurante.
- Filtrado preliminar en un pipeline de catalogacion de imagenes: como primer paso para separar fotos de pizza y steak antes de un etiquetado manual, siempre que el dominio de las imagenes coincida con el del entrenamiento.
- Docencia en cursos de vision por computador: permite ilustrar el impacto del fine-tuning parcial y la aumentacion de datos con un caso sencillo y reproducible.
- Prueba de integracion con HuggingFace Hub: el codigo de ejemplo demuestra como descargar pesos, configuracion y codigo desde un repositorio y ejecutar inferencia local.
- Benchmark interno de infraestructura de inferencia: por su reducido tamano, puede usarse para validar el funcionamiento de un entorno de PyTorch antes de desplegar modelos mayores.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Precision en test | 99.40% |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ya que no aplican a un clasificador de imagenes. No se proporcionan comparaciones con otros modelos en la model card.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 para el modelo completo (EfficientNet-B0 ~5,3 M de parametros), aunque el dato exacto no esta disponible en la informacion proporcionada.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; una RTX 3060, RTX 4090 o incluso una GTX 1650 pueden ejecutar la inferencia sin problemas.
- Cabe en GPU consumer: si, en practicamente cualquier GPU con al menos 2 GB de VRAM, e incluso en CPU para inferencia por lotes pequenos.
- Opciones de despliegue: PyTorch nativo (unico formato documentado); no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Precision | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| estherola/efficientnet-b0-pizza-steak | no disponible (~5,3 M base) | no aplica | 99.40% en test propio | MIT | HuggingFace, 0 descargas |
| EfficientNet-B0 (torchvision, ImageNet) | ~5,3 M | no aplica | no disponible (1000 clases) | BSD-3-Clause | Ampliamente disponible |
| ResNet-50 (torchvision, ImageNet) | ~25,6 M | no aplica | no disponible (1000 clases) | BSD-3-Clause | Ampliamente disponible |

La comparacion directa con alternativas no es significativa porque el modelo es un fine-tuning especifico de dos clases y no se han publicado metricas comparables en la informacion disponible. Los modelos de referencia de torchvision son alternativas genericas de vision, no especializadas en esta tarea.

## Limitaciones y advertencias

- El modelo solo conoce dos clases y siempre respondera con una de ellas, incluso ante imagenes no relacionadas (limitacion explicita en la model card).
- La precision del 99.40% procede de un conjunto de test de solo 500 imagenes y un dataset de 1200 imagenes de entrenamiento; la generalizacion a dominios distintos es dudosa.
- No se documentan sesgos conocidos, pero al entrenarse con un dataset reducido y no especificado puede heredar sesgos de recopilacion (iluminacion, estilo de fotografia, origen cultural de los platos).
- Riesgo de alucinacion en el sentido de falsos positivos: al ser un clasificador binario, asignara pizza o steak a cualquier imagen, incluidas personas, paisajes u objetos.
- No hay informacion sobre el numero exacto de epocas de la fase 2 ni sobre la composicion del dataset, lo que dificulta la reproducibilidad.
- La licencia MIT permite uso comercial, pero el modelo base EfficientNet-B0 de torchvision tiene su propia licencia (BSD-3-Clause) que conviene verificar.
- El repositorio tiene 0.0 GB y 0 descargas, lo que sugiere que los pesos podrian no estar disponibles o que el modelo no ha sido validado por la comunidad.
- No apto para produccion sin una evaluacion previa sobre el dominio objetivo y sin un manejo explicito de la clase "desconocida".

## Enlaces

- HuggingFace: https://huggingface.co/estherola/efficientnet-b0-pizza-steak
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la informacion proporcionada.
