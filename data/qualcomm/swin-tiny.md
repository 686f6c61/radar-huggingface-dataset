# qualcomm/Swin-Tiny

## Resumen

Swin-Tiny es un modelo de clasificación de imágenes basado en la arquitectura Swin Transformer, publicado por Qualcomm dentro de su catálogo Qualcomm AI Hub Models. El repositorio no contiene un entrenamiento propio, sino el checkpoint de Swin-Tiny de ImageNet exportado y optimizado para ejecutarse en la NPU de dispositivos con chipset Snapdragon y Dragonwing. Se apoya en la implementación de referencia de `torchvision` (`torchvision/models/swin_transformer.py`) y se distribuye junto con artefactos ya compilados en ONNX, QNN_DLC y TFLite.

El modelo resuelve dos problemas concretos: clasificación de imágenes en 224x224 píxeles sobre las clases de ImageNet, y extracción de características como backbone para modelos más complejos (detección, segmentación o clasificación con cabezas propias). Su relevancia actual está en el despliegue en el borde: con 28,8 millones de parámetros y 110 MB en precisión float (29,9 MB en w8a16), consigue latencias de 3,3 a 13,8 ms por inferencia en NPU según el chipset, lo que lo hace apto para inferencia en tiempo real en móvil, PC con Snapdragon y dispositivos embebidos.

La ficha se centra en el paquete de despliegue de Qualcomm. Los detalles de entrenamiento (número de tokens o imágenes, composición del dataset, uso de RLHF/DPO) no aplican ni están documentados en la información disponible, ya que se trata de un modelo de visión heredado del checkpoint público de ImageNet.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Swin Transformer (vision transformer jerárquico con atención de ventanas desplazadas), variante Tiny |
| Parámetros totales | 28,8 M |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica: modelo de visión. Entrada fija de 224x224 píxeles |
| Tipos de cuantización | float (FP32/FP16 según runtime) y w8a16 (pesos 8 bits, activaciones 16 bits) |
| Idiomas soportados | No disponible (no aplica: no procesa lenguaje natural; las etiquetas del checkpoint son las 1000 clases de ImageNet) |
| Licencia | BSD-3-Clause |
| Formato de pesos | PyTorch (checkpoint original), ONNX (float y w8a16), QNN_DLC (float y w8a16), TFLite (float) |
| Resolución de entrada | 224x224 |
| Tamaño del modelo | 110 MB en float, 29,9 MB en w8a16 |
| Checkpoint | ImageNet |
| Tamaño del repositorio | 10,6 GB (incluye todos los artefactos exportados, no solo los pesos) |
| Runtime de referencia | QAIRT 2.45, ONNX Runtime 1.27.1 |
| Versión del paquete de exportación | v0.62.0 de Qualcomm AI Hub Models |
| Descargas / likes en HuggingFace | 872 / 1 |

## Arquitectura y entrenamiento

Swin Transformer es un transformer de visión jerárquico que construye representaciones en múltiples escalas mediante particiones de la imagen en ventanas locales y mecanismos de atención con ventanas desplazadas (*shifted windows*), lo que reduce el coste cuadrático de la atención global y permite usarlo como backbone denso. La variante Tiny del repositorio trabaja con entradas de 224x224 y sigue la implementación de `torchvision`; la información proporcionada no detalla la configuración por etapas (dimensiones de embedding, número de cabezas o profundidades), por lo que esos datos se consideran no disponibles en esta ficha.

El checkpoint procede del entrenamiento de clasificación sobre ImageNet y Qualcomm no documenta en este repositorio el procedimiento de entrenamiento (número de épocas, aumentación de datos, recetas de optimización ni técnicas de alineación tipo RLHF/DPO, que en cualquier caso no se aplican a un clasificador de imágenes). La aportación técnica del repositorio está en la fase de despliegue: exportación con `Qualcomm AI Hub Workbench` a formatos ejecutables en NPU (ONNX, QNN_DLC, TFLite), compilación con QAIRT 2.45, y cuantización w8a16 que reduce el peso de los pesos de 110 MB a 29,9 MB y mejora la latencia en la mayoría de los chipsets medidos.

## Capacidades

- Clasificación de imágenes en 224x224 sobre las 1000 clases de ImageNet.
- Extracción de características (*feature extraction*) como backbone para cabezas y modelos aguas abajo, tal como declara el autor en la model card.
- Inferencia en dispositivo (NPU de Qualcomm) en Android, PC con Snapdragon y plataformas embebidas Dragonwing, con tiempos medidos por chipset.
- Exportación a múltiples runtimes: ONNX (con ONNX Runtime 1.27.1), QNN_DLC (QAIRT 2.45) y TFLite.
- Ejecución en precisión float y en w8a16, con variantes ya compiladas listas para descargar.
- Reexportación con configuraciones propias (pesos ajustados, formas de entrada distintas, dispositivo objetivo) mediante la librería `ai-hub-models`.
- No dispone de tool calling, function calling, capacidades de agente, modo de razonamiento, visión multimodal, audio ni generación de texto: es un clasificador de visión puro.
- Capacidades multilingües: no aplica.

## Casos de uso

- Clasificación de imágenes en aplicaciones Android: el modelo se ejecuta íntegramente en la NPU del dispositivo (por ejemplo, 4,511 ms en Snapdragon 8 Elite Mobile en float), lo que permite etiquetar fotos sin enviar datos a la nube.
- Moderación de contenido en el dispositivo: clasificación previa de imágenes antes de subirlas a un servicio, reduciendo coste de servidor y mejorando la privacidad al no salir el contenido del terminal.
- Backbone para detección o segmentación: con 28,8 M de parámetros y salidas jerárquicas, se puede conectar a cabezas tipo FPN o decodificadores ligeros y reexportar el conjunto con la herramienta de Qualcomm.
- Etiquetado e indexado de fototecas locales: generación de etiquetas ImageNet para búsqueda por categoría o agrupación automática en aplicaciones de galería y gestores de archivos.
- Inspección visual en entornos industriales o de logística: inferencia en plataformas Dragonwing con latencias de 7 a 10 ms por imagen, suficiente para líneas de clasificación de producto a varias decenas de imágenes por segundo.
- Robótica y drones con cómputo en el borde: consumo y memoria reducidos (31-58 MB de pico en algunos chipsets con w8a16) permiten integrarlo en sistemas con presupuesto térmico y energético ajustado.
- Extracción de embeddings para búsqueda visual o deduplicación: uso del modelo como extractor de características y comparación por similitud en bases de imágenes, sin necesidad de etiquetas.
- Prototipado y validación de pipelines: al ofrecer artefactos precompilados para varios runtimes, sirve para medir rendimiento real en un chipset antes de invertir en el entrenamiento de un modelo propio.

## Benchmarks y rendimiento

No se han publicado resultados de exactitud (top-1/top-5 en ImageNet) en la información disponible. La model card sí incluye mediciones de latencia y pico de memoria por chipset, ejecutadas con Qualcomm AI Hub Workbench. Se reproduce una selección representativa:

| Chipset | Runtime | Precisión | Tiempo de inferencia (ms) | Pico de memoria (MB) | Unidad de cómputo |
|---|---|---|---|---|---|
| Snapdragon X2 Elite | ONNX | float | 4,052 | 2 - 2 | NPU |
| Snapdragon X Elite | ONNX | float | 9,476 | 58 - 58 | NPU |
| Snapdragon 8 Gen 3 Mobile | ONNX | float | 5,92 | 1 - 269 | NPU |
| Snapdragon 8 Gen 1 Mobile | ONNX | float | 13,83 | 0 - 255 | NPU |
| Snapdragon 8 Elite Gen 5 Mobile | ONNX | float | 3,691 | 0 - 449 | NPU |
| Snapdragon X2 Elite | ONNX | w8a16 | 3,466 | 1 - 1 | NPU |
| Snapdragon X Elite | ONNX | w8a16 | 8,222 | 31 - 31 | NPU |
| Snapdragon 8 Gen 3 Mobile | ONNX | w8a16 | 5,135 | 0 - 330 | NPU |
| Snapdragon 8 Elite Gen 5 Mobile | ONNX | w8a16 | 3,268 | 0 - 273 | NPU |
| Dragonwing QCS6490 | ONNX | w8a16 | 24,544 | 0 - 3 | NPU |
| Dragonwing Q-6690 | ONNX | w8a16 | 34,677 | 0 - 385 | NPU |
| Dragonwing IQ-X7181 | ONNX | w8a16 | 8,222 | 31 - 31 | NPU |

La tabla completa cubre además Snapdragon 8 Elite Mobile, Dragonwing IQ-8275, IQ-9075, QCS8550 (proxy), QCS8450, Q-7790, Q-8750 y Snapdragon 7 Gen 4, entre otros. Comparando precisiones, w8a16 reduce el tiempo de inferencia entre un 6 % y un 30 % según el chipset (por ejemplo, de 4,052 a 3,466 ms en X2 Elite, o de 13,83 a 9,702 ms en 8 Gen 1) con una caída de pico de memoria muy acusada en varios casos.

## Requisitos de hardware

- Pesos: 110 MB en float y 29,9 MB en w8a16; requiere muy poca memoria frente a modelos de lenguaje.
- Hardware objetivo: NPU de Qualcomm. Las latencias documentadas van de 3,268 ms (Snapdragon 8 Elite Gen 5, w8a16) a 34,677 ms (Dragonwing Q-6690, w8a16), siempre con la NPU como unidad de cómputo principal.
- Chipsets con mediciones publicadas: Snapdragon X2 Elite, X Elite, 8 Elite Gen 5, 8 Elite, 8 Gen 3, 8 Gen 1, 7 Gen 4; Dragonwing IQ-8275, IQ-9075, IQ-X7181, QCS6490, QCS8550 (proxy), QCS8450, Q-6690, Q-7790, Q-8750.
- GPU de escritorio: no hay métricas publicadas en la información disponible. Por tamaño (110 MB de pesos en float, 29,9 MB en w8a16), cabe holgadamente en cualquier GPU de consumo con 2 GB o más de VRAM, incluidas GTX 1650, RTX 3060 o RTX 4090, aunque el rendimiento real no está documentado en este repositorio.
- CPU: por debajo de 30 millones de parámetros, la inferencia en CPU es viable, pero no se aportan cifras de latencia.
- Opciones de despliegue: ONNX Runtime 1.27.1, QAIRT 2.45 (QNN_DLC), TFLite, y el flujo de exportación de `ai-hub-models` (v0.62.0) para ONNX, QNN_DLC, TFLite y otras configuraciones compatibles con el SDK. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a un modelo de visión.
- La evaluación en dispositivo real requiere cuenta en Qualcomm AI Hub Workbench; sin ella solo se dispone de los artefactos precompilados.

## Comparativa con modelos similares

No se dispone de datos de otros modelos en la información proporcionada, por lo que los valores de las alternativas se marcan como no disponibles. La comparación se limita a lo que se puede afirmar con la información de esta ficha:

| Modelo | Parámetros | Entrada | Licencia | Disponibilidad |
|---|---|---|---|---|
| Swin-Tiny (qualcomm) | 28,8 M | 224x224 | BSD-3-Clause | HuggingFace + Qualcomm AI Hub, artefactos ONNX/QNN_DLC/TFLite |
| Swin-Tiny (implementación de torchvision) | 28,8 M (misma arquitectura) | 224x224 | BSD-3-Clause (torchvision) | Repositorio de PyTorch; sin optimización para NPU |
| ResNet-50 | No disponible en la información proporcionada | No disponible | No disponible | No disponible |
| ViT-B/16 | No disponible en la información proporcionada | No disponible | No disponible | No disponible |
| MobileNetV3 | No disponible en la información proporcionada | No disponible | No disponible | No disponible |

Criterio de comparación: backbones de visión de tamaño pequeño-medio aptos para despliegue en el borde. La diferencia práctica del paquete de Qualcomm frente a otras distribuciones del mismo modelo es la disponibilidad de artefactos compilados y perfilados para NPU de Qualcomm, con latencias medidas por chipset.

## Limitaciones y advertencias

- Es un modelo de visión: no genera texto, no mantiene conversaciones, no soporta tool calling ni razonamiento multi-paso.
- Cobertura de clases cerrada: solo las 1000 clases de ImageNet. Cualquier objeto fuera de ese conjunto se asignará a la clase más parecida.
- No hay datos de exactitud en la información proporcionada (ni top-1 ni top-5), por lo que no se puede evaluar la calidad de clasificación sin medirla.
- Sesgos heredados de ImageNet: sobrerrepresentación de determinadas culturas y contextos geográficos, y etiquetas taxonómicamente problemáticas; el modelo puede fallar o ser ofensivo en categorías sensibles.
- Riesgo de degradación fuera de distribución (iluminación, dominios médicos, industriales o imágenes sintéticas), habitual en clasificadores entrenados con imágenes naturales.
- No está calibrado como detector de confianza: no debe usarse como única fuente de decisión en aplicaciones críticas.
- Licencia BSD-3-Clause: permite uso comercial y modificación, pero exige conservar el aviso de copyright y la cláusula de exención de responsabilidad; no hay garantía del autor.
- El rendimiento depende fuertemente del chipset y del runtime; los tiempos publicados corresponden a la NPU y a versiones concretas (QAIRT 2.45, ONNX Runtime 1.27.1) y pueden variar con otras combinaciones.
- El repositorio ocupa 10,6 GB porque incluye múltiples exportaciones; conviene descargar solo el artefacto necesario para el chipset objetivo.
- Los resultados por chipset solo cubren plataformas Qualcomm; no se documentan métricas para GPU de escritorio ni CPU, por lo que el rendimiento fuera de ese ecosistema es desconocido.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/qualcomm/Swin-Tiny
- Página del modelo en Qualcomm AI Hub: https://aihub.qualcomm.com/models/swin_tiny
- Repositorio Qualcomm AI Hub Models (Swin-Tiny, v0.62.0): https://github.com/qualcomm/ai-hub-models/blob/v0.62.0/src/qai_hub_models/models/swin_tiny
- Qualcomm AI Hub Workbench: https://workbench.aihub.qualcomm.com
- Registro en Qualcomm AI Hub: https://myaccount.qualcomm.com/signup
- Implementación de referencia en torchvision: https://github.com/pytorch/vision/blob/main/torchvision/models/swin_transformer.py
- Paper de la arquitectura Swin Transformer (arXiv:2103.14030): https://arxiv.org/abs/2103.14030
- Descarga ONNX float: https://qaihub-public-assets.s3.us-west-2.amazonaws.com/qai-hub-models/models/swin_tiny/releases/v0.62.0/swin_tiny-onnx-float.zip
- Descarga ONNX w8a16: https://qaihub-public-assets.s3.us-west-2.amazonaws.com/qai-hub-models/models/swin_tiny/releases/v0.62.0/swin_tiny-onnx-w8a16.zip
- Descarga QNN_DLC float: https://qaihub-public-assets.s3.us-west-2.amazonaws.com/qai-hub-models/models/swin_tiny/releases/v0.62.0/swin_tiny-qnn_dlc-float.zip
- Descarga QNN_DLC w8a16: https://qaihub-public-assets.s3.us-west-2.amazonaws.com/qai-hub-models/models/swin_tiny/releases/v0.62.0/swin_tiny-qnn_dlc-w8a16.zip
- Descarga TFLite float: https://qaihub-public-assets.s3.us-west-2.amazonaws.com/qai-hub-models/models/swin_tiny/releases/v0.62.0/swin_tiny-tflite-float.zip
- Imagen de demostración: https://qaihub-public-assets.s3.us-west-2.amazonaws.com/qai-hub-models/models/swin_tiny/web-assets/model_demo.png
