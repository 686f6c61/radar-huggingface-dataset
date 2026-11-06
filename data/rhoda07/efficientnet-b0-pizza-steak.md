# Rhoda07/efficientnet-b0-pizza-steak

## Resumen

EfficientNet-B0 pizza vs steak es un clasificador binario de imagenes desarrollado por el usuario Rhoda07 como proyecto de aprendizaje. Se construye mediante transfer learning sobre un EfficientNet-B0 preentrenado en ImageNet (via torchvision) y se especializa en distinguir entre dos clases: pizza (indice 0) y steak (indice 1). El modelo devuelve la probabilidad de que la imagen pertenezca a la clase steak mediante una sigmoide.

Se trata de un modelo de vision por computadora de proposito muy acotado, no un modelo de lenguaje ni un sistema multimodal general. Su relevancia es limitada: sirve como ejemplo didactico de fine-tuning de una CNN y como demostracion de un pipeline de clasificacion de imagenes con PyTorch. No hay informacion sobre arquitectura modificada mas alla del cambio de cabeza, ni sobre datos de entrenamiento mas alla de los conteos indicados en la model card.

El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y un tamano de 0.0 GB, lo que sugiere que los pesos no estan disponibles publicamente o el repositorio esta vacio. La licencia es MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | EfficientNet-B0 (CNN, torchvision) con cabeza lineal binaria |
| Parametros totales | no disponible (EfficientNet-B0 base: ~5,3 M; cabeza: 1280 + 1) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (clasificacion de imagenes) |
| Licencia | MIT |
| Formato de pesos | .pth (PyTorch state dict), con config.json y model.py auxiliares |

## Arquitectura y entrenamiento

La arquitectura es una EfficientNet-B0 preentrenada en ImageNet, a la que se le sustituye la cabeza original por una secuencia Dropout(0.2) -> Linear(1280, 1) -> sigmoide. La salida es la probabilidad de la clase steak (indice 1); pizza es el indice 0. No se indica ninguna modificacion del backbone mas alla del desbloqueo parcial de capas.

El entrenamiento se realizo en dos fases: (1) backbone congelado y solo la nueva cabeza entrenada con Adam, lr 0.001, 5 epocas; (2) desbloqueo de los ultimos 3 bloques de features con Adam, lr 0.0001, 5 epocas. Se uso BCEWithLogitsLoss, batch size 32 y aumentacion de datos con random resized crop, horizontal flip y color jitter. El conjunto de datos consta de 1200 imagenes de entrenamiento, 300 de validacion y 500 de test. No se menciona el uso de RLHF, DPO ni tecnicas de regularizacion adicionales.

## Capacidades

- Clasificacion binaria de imagenes en dos clases: pizza y steak.
- Salida de probabilidad calibrada mediante sigmoide (probabilidad de steak).
- Inferencia sobre imagenes individuales mediante una funcion `predict` incluida en el repositorio.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues (no procesa texto).
- No dispone de modo thinking, vision general, audio ni otras capacidades especiales.
- No es un modelo generativo: no produce texto ni descripciones.

## Casos de uso

- Clasificacion de imagenes en un menu digital: el modelo puede etiquetar automaticamente fotos de platos como pizza o steak para un catalogo de restaurante, aprovechando su precision reportada del 99,40% en el conjunto de test.
- Filtrado en aplicaciones de recetas: dado un conjunto de fotos subidas por usuarios, el modelo puede separar imagenes de pizza y de steak para asignarlas a la categoria correcta antes de una revision manual.
- Proyecto educativo de transfer learning: sirve como ejemplo practico para ensenar fine-tuning de EfficientNet-B0 con PyTorch, incluyendo las dos fases de entrenamiento y la aumentacion de datos.
- Prototipo de control de calidad en cocina: en un entorno controlado con solo esos dos platos, podria usarse para verificar que la imagen capturada corresponde al plato esperado, aunque con las limitaciones de un modelo binario.
- Demostracion de despliegue de modelos de vision: el repositorio incluye `model.py` y `config.json`, lo que facilita integrar el modelo en un script de inferencia o en un servicio ligero.
- Base para experimentos de clasificacion de alimentos: al ser un modelo pequeno y con licencia MIT, puede servir como punto de partida para ampliar a mas clases o para comparar tecnicas de fine-tuning.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Test accuracy | 99,40% |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible, ya que no aplican a un clasificador de imagenes.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja, inferior a 1 GB para EfficientNet-B0 en precision FP32 (el modelo base tiene ~5,3 M de parametros). No se dispone de mediciones concretas en la informacion proporcionada.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4090, etc.) es mas que suficiente; tambien puede ejecutarse en CPU para inferencia puntual.
- Cabe en GPU consumer: si, en practicamente cualquier GPU con al menos 1-2 GB de VRAM, e incluso en CPU.
- Opciones de despliegue: PyTorch nativo (el repositorio proporciona `model.py` y pesos `.pth`); no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| EfficientNet-B0 pizza vs steak (Rhoda07) | ~5,3 M (base) | no aplica | 99,40% test accuracy (2 clases) | MIT | Repositorio Hugging Face, 0 descargas |
| EfficientNet-B0 (torchvision, ImageNet) | ~5,3 M | no aplica | Top-1 ImageNet ~77,7% (referencia general) | BSD-3-Clause (torchvision) | Ampliamente disponible |
| ResNet-50 (torchvision, ImageNet) | ~25,6 M | no aplica | Top-1 ImageNet ~80,9% (referencia general) | BSD-3-Clause | Ampliamente disponible |
| MobileNetV3 (torchvision, ImageNet) | ~5,4 M | no aplica | Top-1 ImageNet ~75,7% (referencia general) | BSD-3-Clause | Ampliamente disponible |

Nota: los datos de EfficientNet-B0, ResNet-50 y MobileNetV3 son referencias generales de sus versiones preentrenadas en ImageNet; no son directamente comparables con un clasificador binario especializado. No se dispone de comparativas directas con otros clasificadores pizza/steak en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo solo conoce dos clases y siempre respondera con una de ellas, incluso ante fotos no relacionadas (limitacion explicita en la model card).
- Riesgo alto de falsos positivos en imagenes fuera de dominio: cualquier imagen se clasificara como pizza o steak.
- No hay informacion sobre sesgos del dataset de entrenamiento (composicion, procedencia, posibles desequilibrios).
- Precision reportada del 99,40% en un conjunto de test de 500 imagenes; no se detalla la distribucion de clases ni el intervalo de confianza, por lo que la cifra debe tomarse con cautela.
- El repositorio tiene 0 descargas y 0 likes, y un tamano de 0.0 GB, lo que sugiere que los pesos podrian no estar disponibles o el repositorio estar incompleto; conviene verificar antes de usarlo.
- Licencia MIT: permite uso comercial y modificacion, pero el autor no ofrece garantias.
- No apto para produccion en entornos con imagenes fuera de las dos clases o con requisitos de robustez.
- No se especifican limitaciones de idioma porque el modelo no procesa texto.

## Enlaces

- Hugging Face: https://huggingface.co/Rhoda07/efficientnet-b0-pizza-steak
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la informacion disponible.
