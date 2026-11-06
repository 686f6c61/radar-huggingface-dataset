# benjaminogbonna/efficientnet-b0-pizza-steak

## Resumen

EfficientNet-B0 pizza vs steak es un clasificador binario de imagenes construido mediante transfer learning sobre EfficientNet-B0 preentrenado en ImageNet. Lo publica el usuario benjaminogbonna en Hugging Face como proyecto de aprendizaje, y su unica tarea es distinguir entre fotos de pizza y fotos de filete (steak). No es un modelo de lenguaje ni un modelo fundacional: es un checkpoint de vision de proposito muy acotado, con una cabeza de clasificacion nueva y el backbone parcialmente ajustado.

El modelo parte de la arquitectura EfficientNet-B0 de torchvision, que emplea bloques MBConv con compound scaling y tiene alrededor de 5,3 millones de parametros en su version original. Sobre esa base se anade una cabeza compuesta por Dropout(0.2) y una capa Linear(1280, 1) con salida sigmoide, de modo que la red devuelve la probabilidad de que la imagen pertenezca a la clase 1 (steak); la clase 0 corresponde a pizza.

Su relevancia es limitada fuera del ambito docente: sirve como ejemplo minimo y reproducible de transfer learning en PyTorch, con un pipeline de dos fases (backbone congelado y luego descongelacion parcial de los ultimos bloques). No hay datos publicados sobre contexto, idiomas ni capacidades generativas porque no aplican a este tipo de modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | EfficientNet-B0 (torchvision) con cabeza Dropout(0.2) + Linear(1280, 1) + sigmoid |
| Parametros totales | no disponible (EfficientNet-B0 base: ~5,3 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, no de texto) |
| Tipos de cuantizacion | no disponible (pesos en .pth, sin versiones GGUF/ONNX publicadas) |
| Idiomas soportados | no aplica (clasificacion de imagenes; sin etiquetas de idioma) |
| Licencia | MIT |
| Formato de pesos | PyTorch (.pth), mas config.json y model.py en el repo |

## Arquitectura y entrenamiento

La arquitectura es una CNN EfficientNet-B0, que combina bloques MBConv con conexiones residuales y ajuste compuesto de profundidad, anchura y resolucion. El backbone se inicializa con pesos preentrenados en ImageNet de torchvision y se sustituye la cabeza original por Dropout(0.2) seguido de una capa lineal de 1280 a 1 con activacion sigmoide, lo que convierte el problema en una clasificacion binaria con perdida BCEWithLogitsLoss.

El entrenamiento se hizo en dos fases. En la primera se congelo el backbone y solo se entreno la cabeza nueva con Adam (lr 0,001) durante 5 epocas. En la segunda se descongelaron los ultimos 3 bloques de caracteristicas y se ajusto con Adam (lr 0,0001) durante otras 5 epocas, con batch size 32. La augmentation incluyo random resized crop, horizontal flip y color jitter. El conjunto de datos consta de 1200 imagenes de entrenamiento, 300 de validacion y 500 de test. No se documenta el numero de tokens (no aplica), la composicion exacta del dataset ni si hubo tecnicas de RLHF o DPO (no aplica a vision supervisada).

## Capacidades

- Clasificacion binaria de imagenes en dos clases: pizza (indice 0) y steak (indice 1).
- Salida de una probabilidad continua mediante sigmoide, interpretable como confianza de que la imagen sea steak.
- Inferencia sobre imagenes individuales a traves de la funcion `predict` incluida en `model.py`.
- Transfer learning como base para reentrenar en otras tareas de clasificacion binaria.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues (no procesa texto).
- No dispone de modo thinking, vision general, audio ni otras capacidades especiales.

## Casos de uso

- Demostracion docente de transfer learning: el modelo sirve para ilustrar el flujo completo de congelar backbone, entrenar cabeza y descongelar bloques finales en PyTorch, con un dataset pequeno y resultados rapidos de reproducir.
- Prototipo de clasificador de menus o catalogos gastronomicos: se puede integrar en un script que etiquete automaticamente fotos de platos como pizza o steak antes de una revision humana.
- Filtrado preliminar en pipelines de anotacion: usar la probabilidad de salida como senal barata para priorizar que imagenes revisar manualmente en un conjunto de fotos de comida.
- Ejercicio de evaluacion de sobreajuste: con 99,80% de accuracy en test sobre 500 imagenes, es un caso practico para discutir la validez de metricas en datasets pequenos y el riesgo de fuga de datos.
- Base para fine-tuning en dominios similares: al estar liberado con licencia MIT, se puede reutilizar el checkpoint como inicializacion para otras clasificaciones binarias de imagenes.
- Prueba de integracion de modelos PyTorch en Hugging Face Hub: el patron de descarga de pesos, config y codigo con `hf_hub_download` sirve como ejemplo de empaquetado de modelos no estándar.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Accuracy en test | 99,80% |
| Tamano del conjunto de test | 500 imagenes |
| Accuracy en validacion | no disponible |
| Matriz de confusion / precision / recall | no disponible |

No se han publicado resultados de benchmarks en la informacion disponible mas alla de la accuracy de test indicada en la model card.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB en fp32, dado el tamano reducido de EfficientNet-B0 (~5,3 M de parametros) y una entrada estandar de 224x224.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; no se requiere A100 ni H100.
- Cabe en GPU consumer: si, en practicamente cualquier GPU con al menos 2 GB de VRAM (GTX 1050, RTX 2060, RTX 3060, RTX 4090, etc.), e incluso en CPU para inferencia por lotes pequenos.
- Opciones de despliegue: PyTorch nativo mediante el `model.py` del repo; no se han publicado conversiones a ONNX, TorchScript, GGUF ni integraciones con vLLM, llama.cpp, Ollama o TGI (estas ultimas no aplican a vision).
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| benjaminogbonna/efficientnet-b0-pizza-steak | ~5,3 M (base) | no aplica | Clasificacion binaria pizza/steak | MIT | Hugging Face |
| EfficientNet-B0 (torchvision, ImageNet) | ~5,3 M | no aplica | Clasificacion 1000 clases | BSD-3-Clause (torchvision) | Torchvision |
| ResNet-18 (torchvision, ImageNet) | ~11,7 M | no aplica | Clasificacion 1000 clases | BSD-3-Clause (torchvision) | Torchvision |
| MobileNetV3-Small (torchvision, ImageNet) | ~2,5 M | no aplica | Clasificacion 1000 clases | BSD-3-Clause (torchvision) | Torchvision |

La comparacion es aproximada: los modelos de torchvision son clasificadores genericos de 1000 clases, mientras que este checkpoint es un clasificador binario especializado. No se dispone de resultados comparativos de accuracy entre ellos en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo solo conoce dos clases y siempre respondera con una de ellas, incluso ante fotos no relacionadas con comida; no tiene clase "otro" ni umbral de rechazo.
- La accuracy del 99,80% se mide sobre solo 500 imagenes de test y un dataset de 1200 imagenes de entrenamiento; es una cifra propensa a sobreajuste y poco representativa de un uso real.
- No se documenta la procedencia, diversidad ni posibles sesgos del dataset de imagenes; pueden existir sesgos de iluminacion, encuadre o estilo fotografico.
- Riesgo de alucinacion en el sentido de falsos positivos: cualquier imagen se mapea a pizza o steak con una probabilidad, sin calibracion publicada.
- No hay informacion sobre rendimiento en imagenes fuera de distribucion, con oclusiones, baja resolucion o dominios distintos al de entrenamiento.
- Licencia MIT: permite uso comercial y modificacion, pero el autor no ofrece garantias ni soporte.
- No es adecuado como componente critico en produccion sin una validacion adicional sobre el dominio objetivo y un mecanismo de rechazo para clases desconocidas.
- El repo tiene 0 descargas y 0 likes en el momento de la consulta, y un tamano de 0.0 GB reportado, lo que sugiere que los pesos podrian no estar disponibles o no haberse subido correctamente; conviene verificar la integridad de los archivos antes de usarlo.

## Enlaces

- Hugging Face: https://huggingface.co/benjaminogbonna/efficientnet-b0-pizza-steak
- EfficientNet (paper original): https://arxiv.org/abs/1905.11946
- EfficientNet-B0 en torchvision: https://pytorch.org/vision/stable/models/efficientnet.html
- Documentacion de PyTorch: https://pytorch.org/docs/stable/index.html
