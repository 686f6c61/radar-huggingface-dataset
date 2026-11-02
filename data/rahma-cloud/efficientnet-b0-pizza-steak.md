# Rahma-cloud/efficientnet-b0-pizza-steak

## Resumen

EfficientNet-B0 pizza vs steak es un clasificador binario de imágenes desarrollado por el usuario Rahma-cloud como proyecto de aprendizaje. Se trata de un fine-tuning de EfficientNet-B0, la variante base de la familia EfficientNet preentrenada en ImageNet y disponible en torchvision, al que se le ha sustituido la cabeza de clasificación original (1000 clases) por una nueva capa lineal con activación sigmoide que distingue entre pizza (índice 0) y steak (índice 1). El modelo se distribuye como pesos de PyTorch (`.pth`) junto con un `config.json` y un `model.py` que define la arquitectura y las funciones de carga e inferencia.

El modelo resuelve una tarea muy acotada de clasificación de imágenes de comida y su relevancia es principalmente didáctica: ilustra el flujo completo de transfer learning en dos fases (congelación del backbone y posterior descongelación parcial) con un conjunto de datos pequeño (1200 imágenes de entrenamiento, 300 de validación y 500 de test). No está pensado como componente de producción general, sino como ejemplo reproducible de fine-tuning sobre una CNN ligera.

La arquitectura subyacente es una CNN con compound scaling (EfficientNet-B0), con aproximadamente 5,3 millones de parámetros en su configuración original de ImageNet, aunque la model card no detalla el recuento exacto tras el reemplazo de la cabeza. El repositorio tiene un tamaño de 0,0 GB y no se han publicado resultados de benchmarks más allá de la precisión de test reportada por el autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | EfficientNet-B0 (CNN con compound scaling), backbone preentrenado en ImageNet + cabeza Dropout(0.2) -> Linear(1280, 1) -> sigmoid |
| Parametros totales | no disponible (EfficientNet-B0 base: ~5,3 M; recuento tras reemplazo de cabeza no especificado) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no aplica; clasificación de imágenes) |
| Licencia | MIT |
| Formato de pesos | PyTorch `.pth` (state dict), con `config.json` y `model.py` auxiliares |

## Arquitectura y entrenamiento

El modelo parte de EfficientNet-B0 preentrenado en ImageNet, una CNN que emplea compound scaling para escalar de forma conjunta profundidad, anchura y resolución de entrada. La cabeza original se sustituye por `Dropout(0.2)` seguido de `Linear(1280, 1)` y activación sigmoide, de modo que la salida es la probabilidad de que la imagen pertenezca a la clase steak (índice 1); pizza corresponde al índice 0. La pérdida utilizada es `BCEWithLogitsLoss` con batch size 32.

El entrenamiento se realizó en dos fases: una primera con el backbone congelado y solo la nueva cabeza entrenable (Adam, lr 0.001, 5 épocas) y una segunda con los últimos 3 bloques de features descongelados (Adam, lr 0.0001; el número de épocas aparece incompleto en la model card). Se aplicó aumento de datos con random resized crop, flip horizontal y color jitter. El conjunto de datos consta de 1200 imágenes de entrenamiento, 300 de validación y 500 de test. No se documenta el origen de las imágenes, el balance de clases ni si hubo validación cruzada.

## Capacidades

- Clasificación binaria de imágenes en dos clases: pizza y steak.
- Salida de probabilidad calibrada mediante sigmoide (probabilidad de steak).
- Inferencia sobre imágenes individuales mediante la función `predict` del `model.py` incluido.
- Aprovechamiento de features de ImageNet gracias al backbone preentrenado.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües (no procesa texto).
- No dispone de modo thinking, visión general, audio ni otras capacidades especiales.
- No incluye detección de objetos, segmentación ni clasificación multi-etiqueta.

## Casos de uso

- Prototipo educativo de transfer learning: sirve para demostrar en un curso o tutorial cómo congelar y descongelar bloques de un backbone EfficientNet y evaluar el efecto en la precisión de validación.
- Clasificación de imágenes en un dataset propio de dos clases: se puede reutilizar el pipeline (`model.py` + `config.json`) como plantilla para fine-tuning sobre otras categorías binarias cambiando el dataset.
- Filtrado automático en una aplicación de recetas: con un conjunto de imágenes controlado, podría etiquetar fotos como pizza o steak para organizar un recetario, siempre que se acepte la limitación de que el modelo siempre devuelve una de las dos clases.
- Demo interactiva en Hugging Face Spaces o Gradio: el modelo es lo bastante pequeño para cargarse en CPU y ofrecer una demo de clasificación en tiempo real con fines divulgativos.
- Benchmark de referencia para comparar técnicas de aumentación: al tener un conjunto de test fijo de 500 imágenes y una precisión reportada del 99,40 %, puede usarse como línea base en experimentos de aumentación o regularización.
- Prueba de integración de un modelo PyTorch en un pipeline de CI/CD: el patrón de descarga de pesos, configuración y código desde el Hub con `hf_hub_download` es reproducible y sirve para validar flujos de despliegue.
- Ejercicio de evaluación crítica de modelos: útil para enseñar por qué una precisión del 99,40 % en un dataset pequeño y posiblemente poco diverso no implica generalización a imágenes del mundo real.

## Benchmarks y rendimiento

| Metrica | Valor | Conjunto |
|---|---|---|
| Accuracy | 99,40 % | Test (500 imágenes) |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible, ni comparaciones con modelos alternativos sobre el mismo dataset.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 para EfficientNet-B0 (~5,3 M de parámetros); en la práctica, unos pocos cientos de MB incluyendo buffers de activación para una imagen de entrada.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; funciona sin problema en GTX 1650, RTX 3050, RTX 4090, A100 o H100, aunque el modelo no aprovecha la capacidad de GPUs de gama alta.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU consumer e incluso en CPU para inferencia por lotes pequeños.
- Opciones de despliegue: PyTorch nativo (carga directa del `.pth` con el `model.py`), TorchScript o exportación a ONNX para servir con ONNX Runtime; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles en la información proporcionada; por el tamaño del modelo, se espera latencia de milisegundos por imagen en GPU y de decenas de milisegundos en CPU, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| EfficientNet-B0 pizza vs steak (este modelo) | ~5,3 M (base) | Imagen, resolución no especificada | 99,40 % accuracy en test propio (500 imágenes) | MIT | Hugging Face |
| EfficientNet-B0 ImageNet (torchvision) | ~5,3 M | Imagen 224x224 | 1000 clases ImageNet; top-1 ~77,7 % (referencia habitual de torchvision) | BSD-3-Clause | torchvision |
| ResNet-50 ImageNet (torchvision) | ~25,6 M | Imagen 224x224 | 1000 clases ImageNet; top-1 ~80,9 % (referencia habitual de torchvision) | BSD-3-Clause | torchvision |
| MobileNetV3-Large ImageNet (torchvision) | ~5,5 M | Imagen 224x224 | 1000 clases ImageNet; top-1 ~75,3 % (referencia habitual de torchvision) | BSD-3-Clause | torchvision |

La comparación es aproximada: los modelos de torchvision son clasificadores generales de 1000 clases, mientras que este modelo es un binario especializado. No se dispone de comparaciones directas sobre el mismo dataset pizza/steak.

## Limitaciones y advertencias

- El modelo solo conoce dos clases y siempre devolverá una de ellas, incluso ante imágenes no relacionadas (pizza o steak), tal como advierte el propio autor.
- La precisión del 99,40 % se ha medido sobre un conjunto de test de 500 imágenes de procedencia no documentada; no hay garantía de que se mantenga en imágenes del mundo real con otras condiciones de iluminación, encuadre o estilo.
- No se documenta el equilibrio de clases del dataset ni posibles sesgos en la recolección de imágenes, por lo que pueden existir sesgos de dominio no cuantificados.
- Riesgo de sobreajuste: 1200 imágenes de entrenamiento y un backbone parcialmente descongelado son propicios a sobreajuste; no se reportan curvas de validación.
- No hay información sobre el número de épocas de la fase 2 (aparece incompleto en la model card), lo que dificulta la reproducibilidad exacta.
- La licencia MIT permite uso comercial, pero al derivar de EfficientNet-B0 preentrenado en ImageNet conviene revisar las condiciones de los pesos originales de torchvision (BSD-3-Clause) y de las imágenes de ImageNet.
- El repositorio tiene 0 descargas y 0 likes, y no hay evidencia de validación por parte de terceros.
- No apto para producción en dominios donde los errores de clasificación tengan consecuencias (por ejemplo, seguridad alimentaria o etiquetado nutricional).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Rahma-cloud/efficientnet-b0-pizza-steak
- EfficientNet (paper original, Tan y Le, 2019): https://arxiv.org/abs/1905.11946
- EfficientNet-B0 en torchvision: https://pytorch.org/vision/stable/models/efficientnet.html
- Documentación de `hf_hub_download`: https://huggingface.co/docs/huggingface_hub/guides/download
