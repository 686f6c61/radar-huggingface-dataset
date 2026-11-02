# Olasehindejesutomi/efficientnet-b0-pizza-steak

## Resumen

EfficientNet-B0 pizza vs steak es un clasificador binario de imagenes desarrollado por el usuario Olasehindejesutomi como proyecto de aprendizaje. Parte de una EfficientNet-B0 preentrenada en ImageNet (via torchvision) y anade una cabeza de clasificacion nueva entrenada mediante transfer learning para distinguir entre dos clases: pizza (indice 0) y steak (indice 1). El modelo no es un modelo de lenguaje ni un sistema multimodal general: es un clasificador de vision de proposito muy especifico.

El modelo es relevante unicamente como ejemplo didactico de transfer learning con PyTorch y como pieza reutilizable para demos o prototipos de clasificacion de imagenes de alimentos. Su huella es minima (pesos de EfficientNet-B0, unos 5,3 millones de parametros en el backbone) y se distribuye con licencia MIT, lo que facilita su uso en experimentos sin restricciones legales.

No se trata de un modelo de proposito general: no genera texto, no soporta tool calling ni razonamiento multi-paso, y su salida es una unica probabilidad sigmoide. Cualquier uso en produccion debe limitarse a la tarea binaria para la que fue entrenado, con las cautelas habituales de un modelo de juguete con solo 1200 imagenes de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | EfficientNet-B0 (CNN, compound scaling) con cabeza lineal binaria |
| Parametros totales | no disponible (EfficientNet-B0 base: ~5,3 M en el backbone; cabeza: 1280 -> 1) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, no de texto) |
| Tipos de cuantizacion | no disponible (pesos en PyTorch `.pth`, sin versiones GGUF/ONNX publicadas) |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | MIT |
| Formato de pesos | PyTorch `.pth` (state dict), mas `config.json` y `model.py` en el repo |

## Arquitectura y entrenamiento

La arquitectura es una EfficientNet-B0 estandar de torchvision, preentrenada en ImageNet, a la que se sustituye la cabeza original por `Dropout(0.2) -> Linear(1280, 1) -> sigmoid`. La salida es la probabilidad de que la imagen pertenezca a la clase 1 (steak); la clase 0 corresponde a pizza. EfficientNet-B0 emplea bloques MBConv con conexiones residuales y escalado compuesto de profundidad, anchura y resolucion, con aproximadamente 5,3 millones de parametros en el backbone.

El entrenamiento se realizo en dos fases. La fase 1 congela el backbone y entrena solo la cabeza nueva durante 5 epocas con Adam y learning rate 0,001. La fase 2 descongela los ultimos 3 bloques de caracteristicas y continua 5 epocas con Adam y learning rate 0,0001. Se usa BCEWithLogitsLoss, batch size 32 y aumentacion de datos con random resized crop, horizontal flip y color jitter. El conjunto de datos consta de 1200 imagenes de entrenamiento, 300 de validacion y 500 de test. No se menciona el uso de RLHF, DPO ni tecnicas de alineacion, algo esperable en un clasificador de vision.

## Capacidades

- Clasificacion binaria de imagenes en dos clases: pizza y steak.
- Salida de una probabilidad sigmoide (probabilidad de steak) a partir de una imagen.
- Transfer learning sobre representaciones de ImageNet, lo que le permite cierta robustez ante variaciones de iluminacion, encuadre y color.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues ni procesa texto.
- No dispone de modo thinking, vision general, audio ni otras modalidades.
- No incluye deteccion de objetos, segmentacion ni captioning.

## Casos de uso

- Prototipo educativo de transfer learning: sirve como ejemplo completo de fine-tuning en dos fases con PyTorch, util para cursos y tutoriales sobre clasificacion de imagenes.
- Demo de clasificacion de alimentos en una app movil o web: con solo dos clases y pesos ligeros, puede integrarse en un frontend que muestre "pizza" o "steak" a partir de una foto.
- Filtrado rapido en un pipeline de catalogacion de imagenes de menus o recetas: como primer paso para separar fotos de pizza y de steak antes de un modelo mas complejo.
- Prueba de concepto de moderacion o etiquetado en un dataset pequeno de imagenes de comida, siempre que las dos clases cubran el dominio.
- Baseline para comparar con clasificadores mas grandes o con modelos de vision-lenguaje en tareas binarias de alimentos.
- Ejercicio de evaluacion de robustez: permite estudiar como se comporta una EfficientNet-B0 fine-tuneada con solo 1200 imagenes ante imagenes fuera de distribucion.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Precision en test (500 imagenes) | 99,80% |

No se han publicado resultados de benchmarks estandar (ImageNet, MMLU, HumanEval, GSM8K) en la informacion disponible. La unica metrica reportada es la precision en el conjunto de test propio del autor, que no es comparable con benchmarks publicos.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB en FP32 para EfficientNet-B0; el modelo completo ocupa unos pocos MB en disco.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; no requiere A100 ni H100.
- Cabe en GPU consumer: si, en cualquier GPU con al menos 2 GB de VRAM (GTX 1050, RTX 2060, RTX 3060, RTX 4090, etc.).
- Tambien puede ejecutarse en CPU con latencia de decenas de milisegundos por imagen.
- Opciones de despliegue: PyTorch nativo (via `model.py` y `load_model`), exportacion a TorchScript u ONNX no incluida en el repo; no hay versiones para vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| EfficientNet-B0 pizza vs steak (este modelo) | ~5,3 M (backbone) | no aplica | Clasificacion binaria pizza/steak | MIT | HuggingFace |
| EfficientNet-B0 ImageNet (torchvision) | ~5,3 M | no aplica | Clasificacion 1000 clases | BSD-3-Clause | torchvision |
| ResNet-18 (torchvision) | ~11,7 M | no aplica | Clasificacion 1000 clases | BSD-3-Clause | torchvision |
| MobileNetV3-Small (torchvision) | ~2,5 M | no aplica | Clasificacion 1000 clases | BSD-3-Clause | torchvision |

La comparativa es orientativa: los modelos de torchvision son clasificadores generales de 1000 clases, no especializados en pizza/steak, por lo que la comparacion directa de precision no es posible sin reentrenamiento. No se dispone de otros clasificadores binarios publicos equivalentes en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo solo conoce dos clases y siempre respondera con una de ellas, incluso ante fotos no relacionadas (limitacion declarada por el autor).
- Precision del 99,80% en test con solo 500 imagenes: la metrica es poco fiable por el tamano reducido del conjunto y la posible fuga entre train y test.
- Entrenado con 1200 imagenes, lo que limita la generalizacion a dominios distintos (otra iluminacion, estilos de cocina, angulos, resoluciones).
- No es un modelo de lenguaje: no procesa texto, no soporta agentes ni tool calling.
- Riesgo de sesgo hacia las dos clases y hacia las caracteristicas visuales presentes en el dataset de entrenamiento (probablemente imagenes de estilo similar).
- Licencia MIT permite uso comercial, pero el autor no ofrece garantias ni soporte.
- No hay versiones cuantizadas ni exportadas a otros formatos, lo que complica el despliegue en entornos sin PyTorch.
- No apto para produccion critica: es un proyecto de aprendizaje sin validacion externa ni evaluacion de robustez.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Olasehindejesutomi/efficientnet-b0-pizza-steak
- EfficientNet (paper original): https://arxiv.org/abs/1905.11946
- EfficientNet-B0 en torchvision: https://pytorch.org/vision/stable/models/efficientnet.html
- Documentacion de PyTorch: https://pytorch.org/docs/stable/index.html
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la busqueda web.
