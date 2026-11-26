# qualcomm/RegNet

## Resumen

RegNet es una red neuronal convolucional (CNN) para clasificación de imágenes, publicada originalmente por Facebook AI Research (el paper arXiv:2003.13678 corresponde a "Designing Network Design Spaces") y empaquetada aquí por Qualcomm para su despliegue optimizado en dispositivos con aceleración NPU. El repositorio `qualcomm/RegNet` no contiene un modelo nuevo, sino los pesos de RegNet exportados a formatos ONNX, QNN_DLC y TFLITE, compilados con Qualcomm AI Hub Workbench para ejecutarse sobre los SoC Snapdragon y Dragonwing de la compañía. La arquitectura es una CNN con bloques residuales cuyo diseño de espacio de búsqueda se parametriza de forma cuantizada y lineal, y el checkpoint incluido está entrenado sobre ImageNet.

El modelo tiene 15,3 millones de parámetros, acepta entradas de 224x224 píxeles y ocupa 58,3 MB en precisión float (15,4 MB en cuantización w8a8). Su relevancia actual no reside en el rendimiento bruto de clasificación, sino en la disponibilidad de artefactos precompilados y perfilados para decenas de chipsets Qualcomm, con latencias de inferencia del orden de 0,7 a 3,2 ms en NPU. Esto lo convierte en una pieza útil como backbone ligero o como clasificador de baja latencia en pipelines de visión embebida, donde el coste energético y la integración con el SDK QAIRT son determinantes.

La licencia BSD-3-Clause permite uso comercial sin restricciones significativas, y el modelo se distribuye a través de Hugging Face con la librería PyTorch como referencia, aunque los artefactos listos para producción son los exportados a los runtimes de Qualcomm.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | CNN con bloques residuales (familia RegNet, diseño de espacio parametrizado) |
| Parámetros totales | 15,3 M |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, entrada 224x224 px) |
| Tipos de cuantización | float (FP32) y w8a8 (pesos y activaciones de 8 bits) |
| Idiomas soportados | no aplica (clasificación de imágenes, sin capacidades lingüísticas) |
| Licencia | BSD-3-Clause |
| Formato de pesos | ONNX, QNN_DLC, TFLITE (float); PyTorch como referencia |
| Tamaño del modelo | 58,3 MB (float), 15,4 MB (w8a8) |
| Resolución de entrada | 224x224 |
| Checkpoint | ImageNet |
| Librería | PyTorch |
| Tamaño del repositorio | 6,3 GB |

## Arquitectura y entrenamiento

RegNet pertenece a la familia de redes convolucionales con conexiones residuales descrita en "Designing Network Design Spaces" (Radosavovic et al., 2020). En lugar de buscar arquitecturas individuales, el trabajo define un espacio de diseño parametrizado por la anchura, la profundidad y los factores de grupo de cada etapa, y deriva reglas cuantizadas lineales que generan familias completas de modelos. La implementación de referencia es la de `torchvision.models.regnet`, sobre la que Qualcomm ha construido los artefactos exportados.

El checkpoint incluido está entrenado sobre ImageNet para clasificación de 1000 clases. La model card no detalla el número de tokens de entrenamiento (no aplica), la composición exacta del dataset más allá de ImageNet, ni si se aplicaron técnicas de aumento de datos o regularización específicas. Tampoco se documentan innovaciones de inferencia como decodificación especulativa, al no tratarse de un modelo generativo. La contribución técnica del paquete es la exportación y compilación para NPU Qualcomm mediante QAIRT 2.51 y ONNX Runtime 1.30.0, con perfiles medidos por chipset.

## Capacidades

- Clasificación de imágenes sobre ImageNet (1000 clases) a resolución 224x224.
- Uso como backbone convolucional para tareas derivadas: detección, segmentación o clasificación con cabezas personalizadas.
- Extracción de características intermedias para pipelines de visión por computador.
- Inferencia en NPU de chipsets Snapdragon y Dragonwing mediante QNN_DLC, ONNX y TFLITE.
- Ejecución en FP32 y en cuantización w8a8, con reducción de tamaño de 58,3 MB a 15,4 MB.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un modelo puramente visual y discriminativo.

## Casos de uso

- Clasificación de imágenes en tiempo real en dispositivos móviles: con latencias de 0,7 a 1,2 ms en NPU de Snapdragon 8 Elite y 8 Gen 3, el modelo puede procesar flujos de vídeo a decenas de FPS sin salir del dispositivo.
- Backbone en sistemas de visión embebida para automoción: los perfiles sobre SA8650P, SA8255P y SA8295P (3,2 ms) permiten integrar el extractor de características en pipelines de asistencia a la conducción con requisitos estrictos de latencia.
- Preprocesado y filtrado en cámaras inteligentes: clasificación previa de fotogramas para descartar escenas irrelevantes antes de invocar modelos más costosos, reduciendo el consumo energético del sistema.
- Aplicaciones de realidad aumentada en gafas y visores con Snapdragon X2 Elite o X Elite: la inferencia en 0,9 a 2,2 ms hace viable la clasificación por fotograma dentro del bucle de renderizado.
- Etiquetado automático de datasets de imágenes: uso como clasificador rápido para preanotar grandes volúmenes de imágenes antes de la revisión humana, aprovechando su bajo coste computacional.
- Prototipado de productos IoT con Qualcomm Dragonwing IQ-8275 o IQ-9075: los artefactos precompilados permiten desplegar un clasificador funcional en 2,7 a 2,9 ms sin necesidad de reentrenar ni reexportar.
- Fine-tuning como backbone para dominios específicos (médico, industrial, retail): al estar disponible en PyTorch, se puede adaptar con cabezas personalizadas y reexportar con Qualcomm AI Hub Models.

## Benchmarks y rendimiento

La model card no publica métricas de precisión (top-1/top-5) sobre ImageNet. Sí incluye una tabla extensa de latencia de inferencia por runtime y chipset, de la que se resume una selección:

| Chipset | Runtime | Precisión | Latencia (ms) | Memoria pico (MB) | Unidad |
|---|---|---|---|---|---|
| Snapdragon 8 Elite Extreme Gen 6 | ONNX | float | 0,728 | 1 - 79 | NPU |
| Snapdragon 8 Elite Gen 6 | ONNX | float | 0,862 | 1 - 79 | NPU |
| Snapdragon 8 Elite Gen 5 For Galaxy | ONNX | float | 0,836 | 0 - 83 | NPU |
| Snapdragon 8 Elite For Galaxy | ONNX | float | 0,988 | 0 - 80 | NPU |
| Snapdragon X2 Elite | ONNX | float | 0,885 | 2 - 2 | NPU |
| Snapdragon X Elite | ONNX | float | 1,711 | 39 - 39 | NPU |
| Snapdragon 8 Gen 3 | ONNX | float | 1,221 | 0 - 130 | NPU |
| Snapdragon 8 Gen 1 | ONNX | float | 2,574 | 0 - 123 | NPU |
| Dragonwing IQ-8275 | ONNX | float | 2,845 | 0 - 5 | NPU |
| Dragonwing IQ-9075 | ONNX | float | 2,658 | 1 - 5 | NPU |
| SA8650P | QNN_DLC | float | 3,202 | 1 - 78 | NPU |
| SA8295P | QNN_DLC | float | 3,217 | 0 - 71 | NPU |

No se han publicado resultados de benchmarks de precisión (MMLU, HumanEval, GSM8K u otros) en la información disponible, por tratarse de un modelo de clasificación de imágenes y no de un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada: no aplica en el sentido convencional; el modelo ocupa 58,3 MB en float y 15,4 MB en w8a8, por lo que cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas para inferencia en PyTorch: cualquier GPU con al menos 1 GB de memoria, incluidas RTX 3060, RTX 4090, A100 y H100; el cuello de botella no es la memoria sino el throughput.
- Cabe en GPU consumer: sí, en cualquier GPU moderna, e incluso en CPU para inferencia por lotes pequeños.
- Despliegue: Qualcomm AI Hub Models (exportación y compilación), QAIRT 2.51, ONNX Runtime 1.30.0, TFLite, y PyTorch nativo para fine-tuning.
- Latencia en NPU Qualcomm: 0,728 a 3,217 ms según chipset y runtime, con memoria pico entre 1 y 130 MB.
- Throughput: no disponible de forma agregada; la model card solo reporta latencia por inferencia individual.

## Comparativa con modelos similares

| Modelo | Parámetros | Entrada | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RegNet (qualcomm/RegNet) | 15,3 M | 224x224 | no aplica | BSD-3-Clause | Hugging Face, artefactos ONNX/QNN_DLC/TFLITE |
| MobileNetV3 | no disponible en la información | 224x224 | no aplica | no disponible | torchvision, TF Lite |
| EfficientNet-B0 | no disponible en la información | 224x224 | no aplica | no disponible | torchvision, TF Lite |
| ResNet-50 | no disponible en la información | 224x224 | no aplica | no disponible | torchvision, ONNX |

La información proporcionada no incluye datos de precisión ni latencia de los modelos alternativos, por lo que la comparación cuantitativa no está disponible. La ventaja diferencial de este paquete frente a los backbones genéricos es la disponibilidad de artefactos precompilados y perfilados para NPU Qualcomm.

## Limitaciones y advertencias

- Modelo puramente discriminativo: no genera texto, no razona, no soporta tool calling ni agentes; cualquier uso en esos contextos es un error de categoría.
- Entrenado exclusivamente sobre ImageNet: las 1000 clases son las de dicho dataset y el rendimiento en dominios fuera de distribución puede degradarse sin fine-tuning.
- No se publican métricas de precisión (top-1/top-5) en la model card, lo que impide evaluar su calidad frente a alternativas sin ejecutar pruebas propias.
- Riesgo de sesgo heredado de ImageNet: desequilibrios demográficos y geográficos del dataset original pueden reflejarse en las predicciones.
- La cuantización w8a8 reduce el tamaño a 15,4 MB, pero puede introducir pérdida de precisión no documentada; se recomienda validar en el dominio objetivo.
- Los artefactos QNN_DLC y TFLITE están atados a versiones específicas del SDK (QAIRT 2.51); cambios de versión pueden requerir recompilación.
- El repositorio ocupa 6,3 GB por incluir múltiples artefactos y variantes; no es un único fichero de pesos.
- Licencia BSD-3-Clause: permite uso comercial, pero exige conservar el aviso de copyright y la cláusula de no endorsement.

## Enlaces

- [Hugging Face: qualcomm/RegNet](https://huggingface.co/qualcomm/RegNet)
- [Paper: Designing Network Design Spaces (arXiv:2003.13678)](https://arxiv.org/abs/2003.13678)
- [Implementación de referencia en torchvision](https://github.com/pytorch/vision/blob/main/torchvision/models/regnet.py)
- [Qualcomm AI Hub Models (GitHub)](https://github.com/qualcomm/ai-hub-models/blob/v0.67.0/src/qai_hub_models/models/regnet)
- [RegNet en Qualcomm AI Hub](https://aihub.qualcomm.com/models/regnet)
- [Qualcomm AI Hub Workbench](https://workbench.aihub.qualcomm.com)
- [Qualcomm (sitio corporativo)](https://www.qualcomm.com/)
- [Qualcomm en Wikipedia](https://en.wikipedia.org/wiki/Qualcomm)
- [Qualcomm Investor Relations](https://investor.qualcomm.com/overview/default.aspx)
