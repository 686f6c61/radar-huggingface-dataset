# Ohunene/efficientnet-b0-pizza-steak

## Resumen

EfficientNet-B0 pizza vs steak es un clasificador binario de imagenes desarrollado por el usuario Ohunene como proyecto de aprendizaje, segun se indica en su propia model card. El modelo parte de un EfficientNet-B0 preentrenado en ImageNet (via torchvision) y sustituye la cabeza de clasificacion original por una nueva capa lineal con dropout y activacion sigmoide, ajustada mediante transfer learning en dos fases sobre un conjunto de imagenes de pizza y filete.

El modelo resuelve una tarea muy acotada: dada una imagen, devolver la probabilidad de que corresponda a la clase "steak" (indice 1), siendo "pizza" la clase 0. No es un modelo de proposito general ni un modelo de lenguaje: es un checkpoint de vision por computador de tamano reducido (el repositorio ocupa 0.0 GB segun HuggingFace) orientado exclusivamente a esta clasificacion binaria.

Su relevancia es limitada y de caracter educativo: sirve como ejemplo minimo de transfer learning con PyTorch y como prueba de concepto de un pipeline de clasificacion de imagenes. No dispone de descargas ni likes en el momento de la consulta, y la model card lo presenta explicitamente como un proyecto de principiante.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | EfficientNet-B0 (CNN) con cabeza de clasificacion binaria |
| Parametros totales | no disponible (EfficientNet-B0 base ronda los 5,3 M, no confirmado en la informacion) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, no de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no aplica; el modelo procesa imagenes) |
| Licencia | MIT |
| Formato de pesos | .pth (PyTorch), con archivos auxiliares config.json y model.py |

## Arquitectura y entrenamiento

La arquitectura es una red neuronal convolucional EfficientNet-B0 preentrenada en ImageNet, importada desde torchvision. Sobre el backbone se anade una nueva cabeza compuesta por Dropout(0.2), una capa Linear(1280, 1) y una activacion sigmoide, de modo que la salida es una probabilidad escalar correspondiente a la clase "steak". La clase "pizza" corresponde al indice 0.

El entrenamiento se realizo en dos fases. En la fase 1 se congelo el backbone y solo se entreno la nueva cabeza con el optimizador Adam, learning rate 0.001 y 5 epocas. En la fase 2 se descongelaron los ultimos 3 bloques de caracteristicas y se ajusto todo con Adam, learning rate 0.0001 y 5 epocas. La funcion de perdida fue BCEWithLogitsLoss con batch size 32. Se aplico aumento de datos consistente en random resized crop, volteo horizontal y color jitter. El conjunto de datos consta de 1200 imagenes de entrenamiento, 300 de validacion y 500 de test. No se documenta el uso de RLHF, DPO ni tecnicas de decodificacion especulativa, ya que no aplican a este tipo de modelo.

## Capacidades

- Clasificacion binaria de imagenes en dos clases: pizza y steak.
- Devuelve una probabilidad continua (sigmoide) de pertenecer a la clase "steak".
- Transfer learning sobre caracteristicas de ImageNet, lo que le permite reconocer patrones visuales genericos aprendidos del backbone.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues (no procesa texto).
- No dispone de modo thinking, vision generativa, audio ni ninguna capacidad multimodal mas alla de la clasificacion de imagen.

## Casos de uso

- Clasificacion automatica en menus o apps de comida: el modelo puede etiquetar fotos subidas por usuarios como pizza o steak para organizar galerias o menus digitales, aprovechando su entrenamiento especifico en esas dos categorias.
- Filtrado de imagenes en un dataset de recetas: se puede usar para separar imagenes de pizza y de filete en un corpus culinario, con la advertencia de que cualquier imagen que no sea de esas dos clases sera forzada a una de ellas.
- Demo educativa de transfer learning: sirve como ejemplo practico en cursos o tutoriales de PyTorch para mostrar el flujo completo de congelar backbone, entrenar cabeza y hacer fine-tuning parcial.
- Prueba de concepto en un pipeline de vision: puede integrarse como primer filtro en un sistema mayor que luego derive a un clasificador mas fino, siempre que el dominio de entrada este acotado a esas dos clases.
- Clasificacion en dispositivos con recursos limitados: al estar basado en EfficientNet-B0, el coste computacional es bajo y puede ejecutarse en CPU o GPU consumer para inferencia puntual.
- Validacion de hipotesis de aumento de datos: el modelo y su configuracion permiten reproducir el experimento de augmentacion (random resized crop, flip, color jitter) y comparar resultados en un entorno controlado.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Precision en test | 99,80% |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8G u otros) en la informacion disponible, ya que no aplican a un clasificador binario de imagenes. La unica metrica reportada es la precision en el conjunto de test de 500 imagenes.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; al tratarse de EfficientNet-B0 (del orden de millones de parametros), la huella es muy reducida y cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU consumer moderna (por ejemplo, RTX 3060, RTX 4090) es mas que suficiente; tambien puede ejecutarse en CPU para inferencia por lotes pequenos.
- Cabe en GPU consumer: si, con amplio margen, dado el tamano reducido del modelo.
- Opciones de despliegue: al ser un checkpoint PyTorch (.pth) con codigo auxiliar en model.py, el despliegue tipico es mediante PyTorch/TorchScript o exportacion a ONNX. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ohunene/efficientnet-b0-pizza-steak | no disponible (base EfficientNet-B0) | no aplica | 99,80% en test propio | MIT | HuggingFace, 0 descargas |
| EfficientNet-B0 (ImageNet, torchvision) | ~5,3 M | no aplica | Clasificacion en 1000 clases ImageNet | BSD-3-Clause (torchvision) | Ampliamente disponible |
| ResNet-50 (ImageNet) | ~25,6 M | no aplica | Clasificacion en 1000 clases ImageNet | BSD-3-Clause (torchvision) | Ampliamente disponible |

La comparativa con alternativas de la misma categoria es limitada: no se dispone de datos de rendimiento de otros clasificadores binarios pizza/steak en la informacion proporcionada. Los modelos citados son backbones genericos de referencia, no clasificadores binarios equivalentes.

## Limitaciones y advertencias

- El modelo solo conoce dos clases y siempre respondera con una de ellas, incluso ante fotos no relacionadas, tal y como advierte el autor en la model card.
- Riesgo elevado de falsos positivos en dominios fuera de distribucion: cualquier imagen que no sea pizza o steak sera forzada a una de las dos categorias.
- La precision del 99,80% se ha medido en un conjunto de test propio de 500 imagenes; no hay validacion externa ni evaluacion en condiciones reales diversas.
- No se documentan sesgos especificos, pero al ser un proyecto de aprendizaje con un dataset pequeno (1200 imagenes de entrenamiento), la generalizacion es limitada.
- No hay informacion sobre el origen, la diversidad ni la licencia de las imagenes de entrenamiento, lo que impide evaluar posibles sesgos de recoleccion.
- Restricciones de licencia: MIT permite uso comercial, pero la ausencia de documentacion sobre el dataset subyacente impide confirmar que no haya restricciones heredadas.
- Para produccion: no recomendado como clasificador general; solo adecuado en entornos donde la entrada este estrictamente acotada a las dos clases y se acepte la tasa de error no verificada externamente.
- El repositorio no incluye informacion sobre cuantizacion ni formatos optimizados (GGUF, ONNX), lo que limita el despliegue en entornos no PyTorch.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Ohunene/efficientnet-b0-pizza-steak
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la informacion proporcionada.
