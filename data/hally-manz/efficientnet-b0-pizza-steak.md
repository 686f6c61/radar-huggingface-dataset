# Hally-Manz/efficientnet-b0-pizza-steak

## Resumen

EfficientNet-B0 pizza vs steak es un clasificador binario de imagenes construido mediante transfer learning sobre EfficientNet-B0 preentrenado en ImageNet. Lo desarrolla el usuario Hally-Manz como proyecto de aprendizaje, segun se indica en su propia model card, y resuelve una tarea muy acotada: distinguir entre una fotografia de pizza y una de filete (steak). No es un modelo de lenguaje ni un modelo fundacional, sino un checkpoint de vision de proposito especifico.

La arquitectura subyacente es EfficientNet-B0, una red convolucional con compound scaling que ronda los 5,3 millones de parametros en su version original de ImageNet, aunque la model card no declara el recuento exacto del checkpoint publicado. La cabeza de clasificacion se ha sustituido por un bloque Dropout(0.2) seguido de una capa Linear(1280, 1) con activacion sigmoide, de modo que la salida es la probabilidad de que la imagen pertenezca a la clase 1 (steak); la clase 0 corresponde a pizza.

Su relevancia es limitada fuera del ambito educativo: sirve como ejemplo reproducible de un pipeline de transfer learning en dos fases, con dataset pequeno (1200 imagenes de entrenamiento, 300 de validacion y 500 de test) y una accuracy reportada del 99,80% en test. Es util para quien quiera ver un flujo completo de fine-tuning en PyTorch con pesos distribuidos en Hugging Face Hub, pero no esta pensado para produccion general ni para clasificacion fuera de las dos clases entrenadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | EfficientNet-B0 (CNN con compound scaling) + cabeza lineal binaria |
| Parametros totales | no disponible (EfficientNet-B0 original: ~5,3 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (clasificacion de imagenes) |
| Licencia | MIT |
| Formato de pesos | .pth (PyTorch state dict) + config.json + model.py |

## Arquitectura y entrenamiento

El modelo parte de EfficientNet-B0 preentrenado en ImageNet, disponible en torchvision, y sustituye la cabeza original de 1000 clases por una secuencia Dropout(0.2) -> Linear(1280, 1) -> sigmoide. El entrenamiento se realizo en dos fases: una primera con el backbone congelado y solo la nueva cabeza entrenable (Adam, learning rate 0,001, 5 epocas), y una segunda en la que se descongelaron los ultimos tres bloques de features (Adam, learning rate 0,0001, 5 epocas). La funcion de perdida fue BCEWithLogitsLoss con batch size 32.

El dataset consta de 1200 imagenes de entrenamiento, 300 de validacion y 500 de test, con augmentation consistente en random resized crop, horizontal flip y color jitter. No se documenta la procedencia de las imagenes, la composicion exacta por clase ni si hubo balanceo. Tampoco se menciona el uso de tecnicas adicionales como mixup, cutmix, label smoothing o calibracion de probabilidades, ni se detalla el proceso de seleccion de hiperparametros mas alla de los valores indicados.

## Capacidades

- Clasificacion binaria de imagenes en dos clases: pizza (indice 0) y steak (indice 1).
- Salida de una probabilidad continua mediante sigmoide, interpretable como confianza en la clase steak.
- Inferencia sobre imagenes individuales mediante la funcion `predict` incluida en el archivo `model.py` del repositorio.
- Carga sencilla desde Hugging Face Hub con `hf_hub_download` para pesos, configuracion y codigo.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues (no procesa texto).
- No dispone de modo thinking, vision general, audio ni otras capacidades especiales mas alla de la clasificacion binaria.

## Casos de uso

- Demo educativa de transfer learning: el modelo sirve como ejemplo completo y reproducible de fine-tuning en dos fases sobre un backbone preentrenado, util en cursos o tutoriales de vision por computador con PyTorch.
- Prototipo de filtrado en una aplicacion de recetas: se podria usar para etiquetar automaticamente fotos subidas por usuarios como "pizza" o "steak" antes de asignar una categoria culinaria, siempre que el dominio de imagenes coincida con el de entrenamiento.
- Prueba de concepto en un pipeline de clasificacion de menus: integrado como paso previo en un sistema mayor, permitiria separar platos de dos categorias concretas antes de un analisis mas profundo.
- Validacion de infraestructura de despliegue: por su tamano reducido, es adecuado para probar el ciclo completo de carga de pesos desde Hugging Face Hub, ejecucion en CPU y exposicion como endpoint ligero.
- Ejercicio de evaluacion de robustez: util para experimentar con imagenes fuera de distribucion y comprobar como el modelo asigna probabilidades extremas incluso a contenido no relacionado.
- Base para un clasificador multi-clase: los pesos podrian servir como punto de partida para ampliar la cabeza a mas categorias de comida con un dataset mayor.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Accuracy en test | 99,80% |

No se han publicado resultados de benchmarks adicionales (por ejemplo, precision/recall por clase, F1, matriz de confusion o evaluacion sobre datasets externos) en la informacion disponible. El unico dato reportado es la accuracy global en el conjunto de test de 500 imagenes, sin desglose por clase ni intervalos de confianza.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB en precision FP32 para el modelo completo (EfficientNet-B0 ronda los 20 MB de pesos); no se han publicado mediciones especificas para este checkpoint.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; una RTX 3060, RTX 4060 o superior no presentara problemas. Tambien funciona en CPU sin dificultad por el reducido tamano del modelo.
- Cabe holgadamente en GPU consumer, incluidas GTX 1650, RTX 3050 y similares, asi como en placas integradas con suficiente memoria del sistema.
- Opciones de despliegue: al ser un checkpoint PyTorch con codigo propio (`model.py`), el despliegue natural es mediante TorchServe, FastAPI con PyTorch, o exportacion a TorchScript/ONNX. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea | Contexto/entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| EfficientNet-B0 pizza vs steak (este modelo) | no disponible (~5,3 M en el backbone original) | Clasificacion binaria pizza/steak | Imagen (resolucion no especificada) | MIT | Hugging Face Hub |
| EfficientNet-B0 ImageNet (torchvision) | ~5,3 M | Clasificacion 1000 clases | Imagen 224x224 | BSD-3-Clause (torchvision) | torchvision |
| ResNet-18 ImageNet | ~11,7 M | Clasificacion 1000 clases | Imagen 224x224 | BSD-3-Clause | torchvision |
| MobileNetV3-Small ImageNet | ~2,5 M | Clasificacion 1000 clases | Imagen 224x224 | BSD-3-Clause | torchvision |

La comparacion directa con clasificadores genericos no es del todo equivalente, ya que este modelo esta especializado en dos clases y no cubre el espacio de 1000 categorias de ImageNet. Frente a alternativas especializadas en la misma tarea binaria, no se dispone de informacion sobre otros checkpoints comparables publicados.

## Limitaciones y advertencias

- El modelo solo conoce dos clases y siempre devolvera una de ellas, incluso ante imagenes no relacionadas, tal como advierte el propio autor. No existe clase "desconocido" ni umbral de rechazo.
- La accuracy del 99,80% procede de un test de 500 imagenes del mismo dataset que el entrenamiento; no hay evidencia de generalizacion a imagenes externas, condiciones de iluminacion distintas o estilos fotograficos diferentes.
- El dataset de entrenamiento es muy pequeno (1200 imagenes) y no se documenta su procedencia ni su composicion por clase, lo que impide evaluar posibles sesgos de dominio.
- Riesgo de sobreajuste a caracteristicas espurias del dataset (fondos, platos, iluminacion) en lugar de a la comida en si.
- No se han publicado metricas desagregadas por clase, matriz de confusion ni calibracion de probabilidades.
- La licencia MIT permite uso comercial, pero el modelo se presenta como proyecto de aprendizaje y no como artefacto validado para produccion.
- El repositorio tiene un tamano declarado de 0.0 GB y cero descargas en el momento de la consulta, lo que sugiere escasa validacion por parte de la comunidad.
- No se especifica la resolucion de entrada esperada mas alla de la transformacion estandar de torchvision; conviene revisar `model.py` y `config.json` antes de integrarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Hally-Manz/efficientnet-b0-pizza-steak
- EfficientNet (paper original): https://arxiv.org/abs/1905.11946
- EfficientNet-B0 en torchvision: https://pytorch.org/vision/stable/models/efficientnet.html
- Documentacion de Hugging Face Hub para descarga de archivos: https://huggingface.co/docs/huggingface_hub
