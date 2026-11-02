# Lovesther/efficientnet-b0-pizza-steak

## Resumen

EfficientNet-B0 pizza vs steak es un clasificador de imágenes binario desarrollado por el usuario Lovesther como proyecto de aprendizaje de transfer learning. Parte de un EfficientNet-B0 preentrenado en ImageNet (disponible en torchvision) y sustituye la cabeza de clasificación original por una capa lineal única que produce, mediante sigmoide, la probabilidad de que la imagen pertenezca a la clase "steak" (índice 1), frente a la clase "pizza" (índice 0).

El modelo no introduce innovaciones arquitectónicas: es un fine-tuning en dos fases sobre un backbone convolucional estándar de aproximadamente 5,3 millones de parámetros. Su relevancia es limitada y de carácter didáctico: sirve como ejemplo mínimo de pipeline de transfer learning con PyTorch, con un conjunto de datos pequeño (1200 imágenes de entrenamiento, 300 de validación y 500 de test) y una precisión reportada del 99,80% en test.

No se trata de un modelo de propósito general ni de un modelo de lenguaje: no procesa texto, no soporta tool calling ni razonamiento multi-paso. Es una pieza de visión por computador muy acotada, pensada para integrarse en scripts de Python que cargan pesos `.pth` y ejecutan inferencia sobre imágenes de comida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN EfficientNet-B0 (torchvision) con cabeza lineal personalizada |
| Parametros totales | no disponible (EfficientNet-B0 base: ~5,3 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (clasificación de imágenes) |
| Licencia | MIT |
| Formato de pesos | `.pth` (PyTorch), más `config.json` y `model.py` en el repositorio |

## Arquitectura y entrenamiento

La arquitectura es una EfficientNet-B0 estándar de torchvision, preentrenada en ImageNet, a la que se le añade una nueva cabeza compuesta por `Dropout(0.2) -> Linear(1280, 1) -> sigmoid`. La salida es una probabilidad escalar: valores cercanos a 1 indican "steak" y cercanos a 0 indican "pizza". El entrenamiento se realizó en dos fases: primero con el backbone congelado y solo la cabeza entrenable (Adam, lr 0,001, 5 épocas), y después descongelando los tres últimos bloques de características (Adam, lr 0,0001, 5 épocas). La función de pérdida fue `BCEWithLogitsLoss` con batch size 32.

El conjunto de datos consta de 1200 imágenes de entrenamiento, 300 de validación y 500 de test, con aumentación mediante random resized crop, volteo horizontal y color jitter. No se documenta el origen de las imágenes, la composición por clase ni si hubo limpieza o deduplicación. No se menciona uso de RLHF, DPO ni técnicas de alineación, algo esperable en un clasificador visual. Tampoco se especifica si se aplicó early stopping, scheduler de learning rate o validación cruzada.

## Capacidades

- Clasificación binaria de imágenes en dos categorías: pizza (índice 0) y steak (índice 1).
- Salida de probabilidad calibrada de forma implícita mediante sigmoide sobre un logit único.
- Inferencia sobre imágenes individuales mediante la función `predict` incluida en `model.py`.
- Carga de pesos desde Hugging Face Hub mediante `hf_hub_download`.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües ni de texto.
- No dispone de modo thinking, visión general, audio ni otras modalidades.

## Casos de uso

- Prototipo educativo de transfer learning: sirve para demostrar en un curso o tutorial cómo congelar un backbone, sustituir la cabeza y hacer fine-tuning en dos fases con PyTorch, usando un dataset pequeño y un resultado medible.
- Clasificación de menús o catálogos de restaurante: en un pipeline interno se podría usar para etiquetar fotos de platos entre "pizza" y "steak" antes de una revisión humana, siempre que el dominio de las imágenes coincida con el de entrenamiento.
- Filtrado preliminar en aplicaciones de food delivery: como primer paso para separar imágenes de dos categorías de producto, con verificación posterior por un modelo o un operador.
- Prueba de concepto de integración con Hugging Face Hub: el script de carga con `hf_hub_download` y `importlib` sirve como ejemplo de cómo distribuir un modelo PyTorch con código auxiliar en el repositorio.
- Base para experimentos de aumentación de datos: permite comparar el efecto de random resized crop, flip y color jitter en un clasificador pequeño sin necesidad de infraestructura costosa.
- Benchmark interno de latencia en CPU: al ser un EfficientNet-B0, se puede usar para medir tiempos de inferencia en entornos sin GPU y comparar con alternativas más ligeras o más pesadas.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Test accuracy (pizza vs steak) | 99,80% |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que no aplican a un clasificador de imágenes. Tampoco se reportan métricas por clase, matriz de confusión, precisión, recall ni F1.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB en FP32 para EfficientNet-B0 (~5,3 M de parámetros), aunque no se proporciona una cifra oficial.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; una RTX 3060, RTX 4090 o incluso una GPU integrada puede ejecutar la inferencia.
- Cabe en GPU consumer: sí, con amplio margen; también funciona en CPU para inferencia por lotes pequeños.
- Opciones de despliegue: PyTorch nativo (script `model.py` del repositorio), exportación a TorchScript u ONNX no documentada pero viable; no se menciona soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Lovesther/efficientnet-b0-pizza-steak | ~5,3 M (base) | no aplica | 99,80% test accuracy (binario) | MIT | Hugging Face |
| EfficientNet-B0 (torchvision, ImageNet) | ~5,3 M | no aplica | Top-1 ImageNet ~77,7% | BSD-3-Clause | torchvision |
| ResNet-50 (torchvision, ImageNet) | ~25,6 M | no aplica | Top-1 ImageNet ~80,9% | BSD-3-Clause | torchvision |
| MobileNetV3-Large (torchvision, ImageNet) | ~5,5 M | no aplica | Top-1 ImageNet ~74,0% | BSD-3-Clause | torchvision |

La comparación directa es imperfecta: los modelos de referencia son clasificadores de 1000 clases en ImageNet, mientras que este modelo es binario y está entrenado sobre un dataset propio no publicado. La accuracy del 99,80% no es comparable con métricas de ImageNet.

## Limitaciones y advertencias

- El modelo solo conoce dos clases y siempre devolverá una de ellas, incluso ante imágenes no relacionadas (pizza o steak), tal y como advierte el autor.
- No se documenta el origen, la licencia ni la composición del dataset de entrenamiento, lo que impide evaluar sesgos de dominio o de representación.
- La accuracy del 99,80% procede de un test de 500 imágenes del mismo dataset; no hay evidencia de generalización a imágenes reales de otras fuentes.
- Riesgo alto de sobreajuste al estilo visual del dataset (iluminación, encuadre, resolución) y de fallos ante dominios distintos.
- No se reportan métricas por clase ni matriz de confusión, por lo que se desconoce el equilibrio entre falsos positivos y falsos negativos.
- La licencia MIT permite uso comercial, pero al no especificarse la procedencia de las imágenes de entrenamiento no se puede garantizar la limpieza de derechos sobre los datos.
- El repositorio tiene 0 descargas y 0 likes, y fue creado en 2026; no hay evidencia de uso en producción ni de mantenimiento.
- El modelo requiere cargar código Python auxiliar (`model.py`) desde el repositorio, lo que introduce un riesgo de seguridad si no se audita antes de ejecutarlo.
- No apto para decisiones críticas: es un proyecto de aprendizaje, no un modelo validado para producción.

## Enlaces

- Hugging Face: https://huggingface.co/Lovesther/efficientnet-b0-pizza-steak
- EfficientNet (paper original): https://arxiv.org/abs/1905.11946
- torchvision EfficientNet-B0: https://pytorch.org/vision/stable/models/efficientnet.html
- Documentación de `hf_hub_download`: https://huggingface.co/docs/huggingface_hub/guides/download
