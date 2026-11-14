# iamaber/face-mask-mobilenetv3

## Resumen

`iamaber/face-mask-mobilenetv3` es un clasificador de imágenes binario que predice si la persona de una fotografía lleva mascarilla facial o no. Lo desarrolla el usuario iamaber y se publica en Hugging Face como un `state_dict` de PyTorch, no como un módulo empaquetado. El modelo se construye sobre la arquitectura MobileNetV3-Large de torchvision, sustituyendo la cabeza de clasificación original de 1000 clases por una cabeza personalizada de tres capas lineales que termina en 2 logits ("With Mask" en el índice 0, "Without Mask" en el índice 1).

El interés práctico del modelo es limitado pero concreto: es un ejemplo reproducible de transfer learning sobre un backbone ligero de visión, con un checkpoint de 20.305.172 bytes (unos 20 MB) y un pipeline de preprocesado documentado al detalle. Resuelve la tarea acotada de clasificación de imagen completa, no de detección: no devuelve cajas delimitadoras ni localiza rostros. Su relevancia actual es la de un artefacto de referencia para prototipos de control de acceso o señalización, no la de un sistema de producción.

La información disponible es escasa: el repositorio ocupa 0.0 GB, no tiene descargas ni likes, no declara licencia y no especifica idiomas. La model card es, sin embargo, inusualmente detallada en cuanto a arquitectura, preprocesado y limitaciones, lo que permite evaluar el modelo con rigor pese a la falta de métricas reproducidas de forma independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MobileNetV3-Large (torchvision) con cabeza de clasificación personalizada |
| Parametros totales | no disponible (checkpoint de 20.305.172 bytes, ~20 MB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada 224 x 224 píxeles RGB) |
| Tipos de cuantizacion | no disponible (solo se documenta el checkpoint `state_dict` en float32) |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | no disponible (el repo no declara licencia; los datasets de entrenamiento figuran como CC0) |
| Formato de pesos | `state_dict` de PyTorch (`best_mobilenet_mask_detector.pt`), no `safetensors` ni GGUF |

## Arquitectura y entrenamiento

El modelo es una CNN de tipo MobileNetV3-Large. Durante el entrenamiento se cargan los pesos preentrenados en ImageNet y se congela `model.features`; en inferencia el modelo se instancia con `weights=None` y el checkpoint aporta todos los parámetros. La cabeza original de 1000 clases se reemplaza por `Linear(960, 1280) → Hardswish → Dropout(0.5) → Linear(1280, 640) → Hardswish → Dropout(0.5) → Linear(640, 2)`. La salida son 2 logits; el índice 0 corresponde a "With Mask" y el 1 a "Without Mask", orden codificado de forma fija en `scripts/utils.py`.

El entrenamiento usa transfer learning en PyTorch con batch size 32, optimizador Adam con lr 1e-4 y weight decay 1e-4, hasta 30 épocas, función de pérdida focal (alpha 1.0, gamma 2.0), dropout 0.5, early stopping con paciencia 7 sobre accuracy de validación y `ReduceLROnPlateau` (factor 0.5, paciencia 3). Los datos proceden de dos conjuntos de Kaggle: el *Face Mask 12K Images Dataset* (12.000 imágenes en Train/Validation/Test con dos clases) como conjunto principal, y el *Face Mask Detection Dataset* de Wobot Intelligence para pruebas adicionales en condiciones diversas. Ambos figuran como CC0 en la API pública de Kaggle. No se documenta el número total de tokens ni composición más allá de esta descripción, ni se menciona RLHF/DPO (no aplica a clasificación).

## Capacidades

- Clasificación binaria de imagen completa: predice "With Mask" o "Without Mask" a partir de una fotografía RGB.
- Preprocesado definido: conversión a RGB, `Resize((224, 224))` sin `CenterCrop` (distorsiona la relación de aspecto) y normalización con medias y desviaciones estándar de ImageNet.
- Inferencia en CPU viable: el checkpoint pesa unos 20 MB y el modelo se ejecuta con `model.eval()` y `torch.no_grad()`.
- Salida probabilística: aplica `softmax` sobre 2 logits, lo que permite umbralizar la confianza.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto.
- No soporta visión más allá de la clasificación: no hay detección de rostros, segmentación ni cajas delimitadoras.
- No hay capacidades multilingües ni modo "thinking".

## Casos de uso

- Prototipo de control de acceso en interiores: el modelo clasifica una imagen capturada por una cámara fija y devuelve una probabilidad de mascarilla; adecuado para demos y pruebas de concepto, no para cumplimiento normativo.
- Señalización en pantallas de entrada: integrado en un script de captura periódica, puede mostrar un aviso genérico cuando la probabilidad de "Without Mask" supera un umbral; requiere recorte previo del rostro porque el modelo no detecta caras.
- Filtro de datasets de imágenes: útil para etiquetar automáticamente lotes de fotos en tareas de curación de datos, dado su bajo coste computacional (~20 MB) y su ejecución en CPU.
- Educación y transferencia de aprendizaje: sirve como ejemplo reproducible de fine-tuning de MobileNetV3 con pérdida focal y early stopping, documentado paso a paso en el repositorio de GitHub asociado.
- Despliegue en dispositivos de borde: al caber en memoria de un Raspberry Pi o similar, puede ejecutarse en local para clasificación por fotograma en aplicaciones de kiosco.
- Demo interactiva en Hugging Face Spaces: el autor mantiene un Space público (`iamaber/face-mask-detector`) que ilustra el uso del checkpoint con la misma transformación documentada.

## Benchmarks y rendimiento

Las métricas proceden del README del repositorio de origen, que no registra el script de evaluación, la semilla aleatoria ni una ejecución independiente; no se han reproducido en esta ficha.

| Metrica | Valor | Fuente |
|---|---|---|
| Accuracy de entrenamiento | ~98% | README, "Model Performance" |
| Accuracy de validación | ~97% | README, "Model Performance" |
| Accuracy de test | ~96% | README, "Model Performance" |
| Precision | 0.96 | README, "Key Performance Indicators" |
| Recall | 0.95 | README, "Key Performance Indicators" |
| F1-score | 0.955 | README, "Key Performance Indicators" |
| ROC-AUC | 0.98 | README, "Key Performance Indicators" |

No se han publicado resultados de benchmarks estándar (ImageNet, COCO, etc.) en la información disponible, ni comparaciones con otros clasificadores de mascarilla.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en float32; el checkpoint ocupa unos 20 MB y la activación para una imagen de 224 x 224 es mínima.
- GPU recomendadas: cualquier GPU con al menos 2 GB de memoria; no requiere A100 ni H100. Una GTX 1650, RTX 3060 o RTX 4090 funcionan sobradamente.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna e incluso en iGPU.
- Ejecución en CPU: viable (el autor verificó el snippet en CPU); latencia del orden de decenas de milisegundos por imagen en un CPU de escritorio, aunque no se documenta una cifra exacta.
- Opciones de despliegue: PyTorch nativo (único formato documentado). No se proporcionan pesos en GGUF, ONNX ni TensorRT, por lo que llama.cpp, Ollama y vLLM no aplican directamente. Sería necesario exportar el modelo a ONNX o TorchScript para otros runtimes.
- Throughput y latencia: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. Como referencia cualitativa, el propio backbone MobileNetV3-Large de torchvision (ImageNet, 1000 clases) comparte arquitectura y tamaño, pero resuelve una tarea distinta; no se han encontrado otros clasificadores binarios de mascarilla con métricas publicadas en la información disponible. Por tanto, la comparativa cuantitativa se indica como no disponible.

| Modelo | Parametros | Contexto/entrada | Licencia | Disponibilidad |
|---|---|---|---|---|
| iamaber/face-mask-mobilenetv3 | ~20 MB (checkpoint) | 224 x 224 RGB | no disponible | Hugging Face |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Sin detección de rostros: clasifica la imagen completa y devuelve una única etiqueta; una foto con varias personas colapsa a una predicción y la clase "Without Mask" puede significar simplemente que no había ninguna cara.
- Oclusión y pose: los recortes de entrenamiento son mayoritariamente frontales; oclusiones fuertes, perfiles, poca luz o una mascarilla sostenida en la mano quedan fuera de la distribución de entrenamiento.
- Tipo de mascarilla: la clase positiva indica "se lleva mascarilla", no "se lleva correctamente"; no distingue mascarilla sobre la boca, barbilla al descubierto, N95 o tela.
- Licencia no declarada: el repositorio no especifica licencia para los pesos, lo que impide asumir uso comercial sin consultar al autor, pese a que los datasets de entrenamiento figuren como CC0.
- Métricas no reproducidas: los valores del README no van acompañados del script de evaluación, la semilla ni una ejecución independiente; deben tratarse como indicativos.
- Sesgos de datos: al entrenar con imágenes web mayoritariamente frontales, el rendimiento puede degradarse en cámaras de vigilancia, ángulos cenitales o condiciones de iluminación adversas.
- Riesgo de alucinación en sentido figurado: el modelo puede asignar alta confianza a imágenes sin rostro, por lo que cualquier uso en producción exige un detector de caras previo y umbrales calibrados.
- Sin soporte de cuantización documentado: no hay pesos GGUF ni ONNX oficiales, lo que limita el despliegue en runtimes ligeros sin trabajo adicional de exportación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/iamaber/face-mask-mobilenetv3
- Repositorio de código y script de entrenamiento: https://github.com/iamaber/real-time-face-mask-detection
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/iamaber/face-mask-detector
- Dataset principal (Face Mask 12K Images Dataset): https://www.kaggle.com/datasets/ashishjangra27/face-mask-12k-images-dataset
- Dataset adicional (Face Mask Detection Dataset, Wobot Intelligence): https://www.kaggle.com/datasets/wobotintelligence/face-mask-detection-dataset
