# qualcomm/DDRNet23-Slim

## Resumen

DDRNet23-Slim es una red neuronal convolucional para segmentación semántica de escenas de carretera, publicada por Qualcomm en su catálogo Qualcomm AI Hub Models. El modelo original procede de la implementación DDRNet (Deep Dual-resolution Network) y está pensado para conducción autónoma y percepción vehicular, donde debe clasificar cada píxel de la imagen en una de 19 clases semánticas (carretera, vehículo, peatón, señalización, etc.). Con 6,13 millones de parámetros y una resolución de entrada de 2048x1024, está diseñado explícitamente para inferencia en tiempo real.

La relevancia de esta ficha concreta no está en el algoritmo sino en el empaquetado: Qualcomm distribuye pesos pre-exportados y compilados para sus aceleradores (NPU Hexagon), con variantes en ONNX, QNN_DLC y TFLite, en precisión float y cuantización w8a8. Esto permite desplegar el modelo en dispositivos móviles y de borde con latencias de decenas de milisegundos.

Es, por tanto, un modelo de visión por computador orientado a producción en hardware Qualcomm, no un modelo generativo: no procesa lenguaje ni tiene ventana de contexto textual. Su licencia MIT facilita la integración comercial, y el repositorio incluye tanto los artefactos listos para usar como la librería para reexportar con pesos o formas de entrada personalizados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | CNN DDRNet23-Slim (Deep Dual-resolution Network) |
| Parámetros totales | 6,13 M |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada 2048x1024 px) |
| Tipos de cuantización | float y w8a8 (int8 pesos y activaciones) |
| Idiomas soportados | no aplica (segmentación de imágenes, sin capacidades lingüísticas) |
| Licencia | MIT |
| Formato de pesos | PyTorch (checkpoint DDRNet23s_imagenet.pth), ONNX, QNN_DLC, TFLite |
| Número de clases de salida | 19 |
| Tamaño del modelo | 21,7 MB (float), 6,11 MB (w8a8) |
| Tamaño del repositorio | 1,9 GB |
| Runtime objetivo | QAIRT 2.51, ONNX Runtime 1.30.0 |

## Arquitectura y entrenamiento

DDRNet23-Slim es una red convolucional con esquema de doble resolución: mantiene una rama de alta resolución y otra de baja resolución que intercambian información mediante módulos de fusión, lo que permite preservar detalle espacial fino (necesario para delimitar carreteras y objetos pequeños) sin renunciar al campo receptivo amplio de la rama profunda. La variante "Slim" reduce canales y profundidad respecto a DDRNet23 completo, sacrificando algo de precisión a cambio de latencia muy baja.

El checkpoint publicado se denomina DDRNet23s_imagenet.pth, lo que indica un preentrenamiento en ImageNet seguido del ajuste para segmentación semántica de escenas de conducción (el conjunto habitual en esta tarea es Cityscapes, con 19 clases, aunque la model card no detalla explícitamente el dataset de ajuste ni el número de tokens o épocas). No se documentan en la información disponible técnicas de RLHF, DPO ni decodificación especulativa, al no tratarse de un modelo de lenguaje.

La innovación relevante de esta publicación es el pipeline de despliegue: Qualcomm AI Hub Workbench compila el modelo para la NPU Hexagon y publica artefactos con métricas de latencia y memoria pico por chipset, además de una librería Python (ai-hub-models) para reexportar con pesos ajustados, formas de entrada personalizadas y configuraciones de dispositivo.

## Capacidades

- Segmentación semántica densa de imágenes: asigna una de 19 clases a cada píxel.
- Especialización en escenas de carretera y conducción: carretera, vehículos, peatones, vegetación, señalización y clases afines.
- Inferencia en tiempo real sobre NPU de Qualcomm, con latencias de 9 a 110 ms según chipset y precisión.
- Ejecución en dispositivos móviles y de borde (smartphones, plataformas automotrices e IoT de Qualcomm).
- Exportación a múltiples runtimes: ONNX, QNN_DLC y TFLite.
- Cuantización int8 (w8a8) soportada de fábrica, con reducción de tamaño de 21,7 MB a 6,11 MB.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües: no es un modelo de lenguaje.

## Casos de uso

- Percepción en conducción asistida: el modelo segmenta la escena a 2048x1024 para identificar carril, calzada y obstáculos; su latencia de ~9-25 ms en Snapdragon 8 Elite o X Elite permite integrarlo en el bucle de percepción a decenas de FPS.
- Sistemas de alerta en vehículo (ADAS) en plataformas automotrices Qualcomm: al ejecutarse en NPU con memoria pico de 24-289 MB, deja la CPU y la GPU libres para otras tareas del vehículo.
- Robótica móvil y vehículos autónomos de interior: la versión w8a8 (6,11 MB) cabe en dispositivos con recursos muy limitados y mantiene latencias de 26-110 ms según el chipset.
- Segmentación de imágenes en aplicaciones Android: los artefactos TFLite y ONNX permiten integrar el modelo en apps mediante NNAPI o el runtime de Qualcomm, sin necesidad de infraestructura de servidor.
- Procesamiento de vídeo en el borde para vigilancia o análisis de tráfico: la segmentación por fotograma a resolución completa posibilita contar vehículos y peatones o medir ocupación de calzada en el propio dispositivo.
- Prototipado e investigación en segmentación eficiente: al ser un checkpoint pequeño con licencia MIT y pipeline de exportación reproducible, sirve como línea base para comparar variantes de cuantización o ajustar con pesos propios.
- Vehículos aéreos y terrestres no tripulados con cómputo Qualcomm: la baja huella de memoria y el uso exclusivo de NPU reducen consumo energético, crítico en plataformas alimentadas por batería.

## Benchmarks y rendimiento

La model card no publica métricas de calidad de segmentación (mIoU sobre Cityscapes u otros conjuntos). Sí publica latencias y memoria pico medidas con Qualcomm AI Hub Workbench. Extracto representativo:

| Chipset | Runtime | Precisión | Latencia (ms) | Memoria pico (MB) | Unidad |
|---|---|---|---|---|---|
| Snapdragon 8 Elite Extreme Gen 6 Mobile | ONNX | float | 9,026 | 31-213 | NPU |
| Snapdragon 8 Elite Gen 5 For Galaxy Mobile | ONNX | float | 9,177 | 5-207 | NPU |
| Snapdragon X2 Elite | ONNX | float | 9,626 | 24-24 | NPU |
| Snapdragon 8 Elite For Galaxy Mobile | ONNX | float | 13,625 | 7-189 | NPU |
| Snapdragon 8 Gen 3 Mobile | ONNX | float | 19,643 | 29-289 | NPU |
| Snapdragon X Elite | ONNX | float | 24,907 | 24-24 | NPU |
| Snapdragon 8 Gen 1 Mobile | ONNX | float | 35,534 | 24-289 | NPU |
| Snapdragon 8 Elite Gen 5 For Galaxy Mobile | ONNX | w8a8 | 26,598 | 1-202 | NPU |
| Snapdragon X2 Elite | ONNX | w8a8 | 26,954 | 7-7 | NPU |
| Snapdragon 8 Gen 3 Mobile | ONNX | w8a8 | 37,856 | 2-240 | NPU |
| Dragonwing QCS6490 | ONNX | w8a8 | 109,772 | 6-9 | NPU |

Observación técnica: en esta compilación concreta la variante w8a8 es más lenta que float en todos los chipsets listados (por ejemplo, 26,6 ms frente a 9,2 ms en Snapdragon 8 Elite Gen 5), aunque reduce el tamaño del modelo y, en algunos casos, la memoria pico. La decisión float frente a w8a8 debe tomarse midiendo en el dispositivo objetivo.

## Comparativa con modelos similares

| Modelo | Parámetros | Entrada | Clases | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DDRNet23-Slim (este) | 6,13 M | 2048x1024 | 19 | MIT | Hugging Face, Qualcomm AI Hub |
| DDRNet23 (completo) | no disponible en la información | no disponible | 19 (Cityscapes) | MIT (implementación de referencia) | GitHub chenjun2hao/DDRNet.pytorch |
| Otras redes de segmentación en tiempo real (p. ej. BiSeNet, FastSCNN) | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de datos de latencia o precisión de los modelos alternativos en el mismo hardware, por lo que no es posible una comparación cuantitativa fiable.

## Limitaciones y advertencias

- Modelo especializado en escenas de carretera: su rendimiento fuera de ese dominio (imágenes médicas, interiores, satélite) no está garantizado y probablemente sea deficiente.
- No se publican métricas de calidad (mIoU) en la model card, por lo que la precisión real de segmentación debe validarse con un conjunto propio antes de producción.
- La cuantización w8a8 puede degradar la calidad de los bordes de segmentación; no se documenta la pérdida de mIoU asociada.
- En las mediciones publicadas, w8a8 resulta más lento que float en los chipsets listados; no asumir que la cuantización implica menor latencia.
- El modelo está compilado y perfilado para hardware Qualcomm; en GPU de escritorio o CPU genérica funcionará vía ONNX/PyTorch, pero sin las optimizaciones ni las latencias reportadas.
- Riesgo de sesgo heredado del dataset de entrenamiento (escenas urbanas y de carretera de determinadas regiones), con posible peor segmentación en entornos no representados.
- Licencia MIT: permite uso comercial y modificación, pero se recomienda conservar el aviso de copyright; verificar además las licencias del checkpoint original y del dataset de ajuste.
- El repositorio pesa 1,9 GB por incluir múltiples artefactos exportados; para despliegue conviene descargar solo el zip del runtime y precisión necesarios.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/qualcomm/DDRNet23-Slim
- Página en Qualcomm AI Hub: https://aihub.qualcomm.com/models/ddrnet23_slim
- Librería ai-hub-models (código del modelo): https://github.com/qualcomm/ai-hub-models/blob/v0.67.0/src/qai_hub_models/models/ddrnet23_slim
- Qualcomm AI Hub Workbench: https://workbench.aihub.qualcomm.com
- Implementación de referencia DDRNet en PyTorch: https://github.com/chenjun2hao/DDRNet.pytorch
- Paper DDRNet (arXiv:2101.06085): https://arxiv.org/abs/2101.06085
- Descarga ONNX float: https://qaihub-public-assets.s3.us-west-2.amazonaws.com/qai-hub-models/models/ddrnet23_slim/releases/v0.67.0/ddrnet23_slim-onnx-float.zip
- Descarga ONNX w8a8: https://qaihub-public-assets.s3.us-west-2.amazonaws.com/qai-hub-models/models/ddrnet23_slim/releases/v0.67.0/ddrnet23_slim-onnx-w8a8.zip
- Descarga QNN_DLC float: https://qaihub-public-assets.s3.us-west-2.amazonaws.com/qai-hub-models/models/ddrnet23_slim/releases/v0.67.0/ddrnet23_slim-qnn_dlc-float.zip
- Descarga QNN_DLC w8a8: https://qaihub-public-assets.s3.us-west-2.amazonaws.com/qai-hub-models/models/ddrnet23_slim/releases/v0.67.0/ddrnet23_slim-qnn_dlc-w8a8.zip
- Descarga TFLite float: https://qaihub-public-assets.s3.us-west-2.amazonaws.com/qai-hub-models/models/ddrnet23_slim/releases/v0.67.0/ddrnet23_slim-tflite-float.zip
- Descarga TFLite w8a8: https://qaihub-public-assets.s3.us-west-2.amazonaws.com/qai-hub-models/models/ddrnet23_slim/releases/v0.67.0/ddrnet23_slim-tflite-w8a8.zip
