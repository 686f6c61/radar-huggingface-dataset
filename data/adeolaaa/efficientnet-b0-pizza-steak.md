# Adeolaaa/efficientnet-b0-pizza-steak

## Resumen

EfficientNet-B0 pizza vs steak es un clasificador binario de imagenes desarrollado por Adeolaaa como proyecto de aprendizaje. Se construye mediante transfer learning sobre un EfficientNet-B0 preentrenado en ImageNet (torchvision) y se especializa en distinguir entre dos clases: pizza (indice 0) y steak (indice 1). El modelo no es un modelo de lenguaje ni un sistema multimodal generativo: es exclusivamente un clasificador de imagenes con una unica salida sigmoide que representa la probabilidad de que la imagen pertenecca a la clase steak.

La relevancia de este modelo es limitada y de caracter didactico. Con 0 descargas y 0 likes en el momento de la ficha, y un repositorio de 0.0 GB, se trata de un artefacto de aprendizaje publicado en Hugging Face mas que de un modelo listo para produccion. Resulta util como ejemplo de pipeline de transfer learning en PyTorch con fine-tuning en dos fases, pero su alcance funcional es estrictamente binario y no cubre tareas de razonamiento, generacion de texto, codigo ni vision general.

Arquitectonicamente hereda la red convolucional EfficientNet-B0, con aproximadamente 5.3 millones de parametros en el backbone y una nueva cabeza lineal de 1280 a 1 dimensiones. No dispone de ventana de contexto, no procesa lenguaje y no admite tool calling ni agentes; sus especificaciones se limitan a clasificacion de imagenes de 224x224 pixels.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | EfficientNet-B0 (CNN) con cabeza lineal de clasificacion binaria |
| Parametros totales | Aproximadamente 5.3 millones (backbone EfficientNet-B0) + 1280 en la cabeza lineal; no confirmado de forma explicita en la model card |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo de vision, no de lenguaje) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (modelo de vision, sin capacidades linguisticas) |
| Licencia | MIT |
| Formato de pesos | .pth (PyTorch state dict) acompanado de config.json y model.py |

## Arquitectura y entrenamiento

El modelo parte de un EfficientNet-B0 preentrenado en ImageNet, una red convolucional con compound scaling que equilibra profundidad, anchura y resolucion. Sobre el backbone se anade una nueva cabeza compuesta por Dropout(0.2), una capa Linear(1280, 1) y una activacion sigmoide, produciendo una probabilidad unica para la clase steak. La salida se interpreta como probabilidad de la clase positiva (steak), mientras que la clase negativa (pizza) corresponde al indice 0.

El entrenamiento se realizo en dos fases con BCEWithLogitsLoss y batch size 32. En la fase 1 se congelo el backbone y se entreno unicamente la nueva cabeza con Adam a learning rate 0.001 durante 5 epochs. En la fase 2 se descongelaron los ultimos 3 bloques de features y se continuo el entrenamiento con Adam a learning rate 0.0001 durante otros 5 epochs. Se aplico augmentation consistente en random resized crop, horizontal flip y color jitter. El conjunto de datos consta de 1200 imagenes de entrenamiento, 300 de validacion y 500 de test. No se documenta ningun proceso de RLHF, DPO ni tecnicas de decodificacion especulativa, ya que no se trata de un modelo generativo.

## Capacidades

- Clasificacion binaria de imagenes en dos categorias: pizza y steak.
- Salida de una probabilidad sigmoide unica que indica la pertenencia a la clase steak (indice 1); la clase pizza corresponde al indice 0.
- Inferencia sobre imagenes individuales mediante la funcion `predict` incluida en el archivo model.py descargable del repositorio.
- Transfer learning sobre representaciones de ImageNet, lo que permite cierto reconocimiento de texturas y formas genericas.
- No dispone de generacion de texto, razonamiento, codigo, matematicas ni vision general.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues.
- No dispone de modo thinking, audio ni ninguna otra modalidad especial.

## Casos de uso

- Filtrado de imagenes en una aplicacion de recetas: clasificar fotografias subidas por usuarios como pizza o steak para etiquetarlas automaticamente en una base de datos culinaria, aprovechando la salida binaria directa del modelo.
- Demostracion docente de transfer learning: usar el repositorio como ejemplo practico en un curso de PyTorch para ilustrar el congelado y descongelado progresivo de capas y el uso de BCEWithLogitsLoss en clasificacion binaria.
- Prototipo de clasificador de platos en un menu digital: integrar el modelo en una app de restaurante que, a partir de una foto, decide si el plato pertenece a la categoria pizza o steak para enrutarlo a la seccion adecuada del menu.
- Pruebas de pipeline de despliegue: emplear el modelo como banco de pruebas ligero para validar el flujo de descarga de pesos via hf_hub_download, carga dinamica de modulos Python y ejecucion de inferencia en CPU o GPU consumer.
- Etiquetado asistido en conjuntos de datos pequenos: usar las predicciones como preetiquetado semi-automatico en tareas de anotacion de imagenes de comida, revisando manualmente los casos de baja confianza.
- Ejemplo de publicacion de modelos en Hugging Face: servir como referencia de estructura minima de repositorio (pesos .pth, config.json, model.py y model card) para desarrolladores que quieran publicar sus primeros modelos de vision.
- Verificacion de robustez de modelos convolucionales: utilizar el clasificador para experimentar con tecnicas de augmentation y medir como afectan a la precision en un problema binario sencillo.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Precision en test (accuracy) | 99.80% |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ya que el modelo no cubre esas tareas. La unica metrica reportada por el autor es la precision de test del 99.80% sobre 500 imagenes, sin desglose de precision/recall por clase ni matriz de confusion.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 para el backbone EfficientNet-B0 y la cabeza lineal; en la practica cabe en cualquier GPU consumer moderna.
- GPU recomendadas: no requiere GPU dedicada; funciona en CPU. En GPU, cualquier tarjeta con al menos 2 GB de VRAM es suficiente (por ejemplo, GTX 1650, RTX 3060, RTX 4090, A100 o H100, todas sobredimensionadas para este modelo).
- Cabe en GPU consumer: si, en practicamente todas las GPU consumer disponibles, incluidas integradas con suficiente memoria compartida.
- Opciones de despliegue: el repositorio proporciona pesos .pth y un model.py para carga directa con PyTorch; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que estan orientados a modelos de lenguaje.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; al ser una CNN de ~5.3M parametros, la latencia por imagen en GPU moderna seria del orden de milisegundos, pero no se aporta medicion oficial.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Adeolaaa/efficientnet-b0-pizza-steak | ~5.3M (backbone) + cabeza lineal | No aplica | 99.80% accuracy en test (500 imagenes) | MIT | Hugging Face, 0 descargas |
| EfficientNet-B0 preentrenado en ImageNet (torchvision) | ~5.3M | No aplica | Top-1 ImageNet ~77% | BSD-3-Clause (torchvision) | Amplia, via torchvision |
| ResNet-18 preentrenado en ImageNet | ~11.7M | No aplica | Top-1 ImageNet ~69-70% | BSD-3-Clause (torchvision) | Amplia, via torchvision |

La comparativa se limita a clasificadores convolucionales de proposito general, ya que no se dispone de informacion sobre otros clasificadores binarios pizza/steak publicados. El modelo de Adeolaaa es un fine-tune especifico de EfficientNet-B0, por lo que su rendimiento en la tarea binaria no es directamente comparable con las metricas de ImageNet de los modelos base.

## Limitaciones y advertencias

- El modelo solo conoce dos clases y siempre respondera con una de ellas, incluso ante fotografias no relacionadas con pizza o steak; no dispone de clase de rechazo ni de deteccion de fuera de distribucion.
- Riesgo elevado de falsos positivos en imagenes genericas: cualquier imagen de comida o incluso objetos no culinarios sera forzada a la clase pizza o steak.
- La precision del 99.80% se reporta sobre un conjunto de test de 500 imagenes procedente presumiblemente de la misma distribucion que el entrenamiento; no hay evidencia de generalizacion a dominios distintos (iluminacion, angulos, estilos de cocina).
- No se documentan sesgos conocidos; al ser un clasificador binario de comida, el riesgo de sesgo se limita a la representacion del dataset de entrenamiento, no descrito en detalle.
- Limitaciones de contexto e idioma: no aplica, al no ser un modelo de lenguaje.
- Restricciones de licencia: licencia MIT, que permite uso comercial, modificacion y redistribucion con atribucion; conviene conservar el aviso de copyright original.
- Caveat para produccion: el modelo es un proyecto de aprendizaje con 0 descargas y 0 likes, sin validacion externa; no se recomienda desplegarlo en produccion sin una reevaluacion sobre datos propios y una clase de rechazo.
- La carga requiere ejecutar codigo Python descargado del repositorio (model.py) mediante importlib, lo que introduce un riesgo de seguridad si no se audita el archivo antes de ejecutarlo.

## Enlaces

- Hugging Face: https://huggingface.co/Adeolaaa/efficientnet-b0-pizza-steak
- Repositorio de pesos: https://huggingface.co/Adeolaaa/efficientnet-b0-pizza-steak/tree/main
- EfficientNet (paper original, Tan y Le, 2019): https://arxiv.org/abs/1905.11946
- EfficientNet-B0 en torchvision: https://pytorch.org/vision/stable/models/efficientnet.html
- Documentacion de PyTorch: https://pytorch.org/docs/stable/index.html
- huggingface_hub (descarga de pesos): https://huggingface.co/docs/huggingface_hub
