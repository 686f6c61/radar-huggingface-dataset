# fastforks/yolox

## Resumen

YOLOX es un detector de objetos de una etapa (one-stage) y sin anclas (anchor-free) publicado originalmente por Megvii (Ge et al., 2021). Esta ficha corresponde al repositorio `fastforks/yolox`, una tarjeta de modelo que no aloja pesos propios: actúa como manifiesto que referencia los checkpoints oficiales de los autores (variantes tiny, S, M, L y X) y verifica su integridad mediante SHA-256. El modelo resuelve detección de objetos sobre COCO (80 clases) a partir de una única imagen RGB.

La arquitectura es completamente convolucional: backbone CSPDarknet, cuello PAFPN y cabeza desacoplada que predice, por celda de los mapas de stride 8/16/32, una caja (centro y tamaño), una objectness y una puntuación por clase; la puntuación final de una celda es objectness multiplicado por la mejor clase, seguida de NMS por clase. La entrada se ajusta a 640×640 (416×416 en tiny), aunque el modelo admite cualquier resolución H×W mayor o igual a 32, con padding a múltiplo de 32.

Su relevancia actual reside en el ecosistema de despliegue que lo acompaña: el paquete `fastforks` ofrece kernels optimizados para el backend `kernels`, además de soporte para `torch.compile` y TensorRT, con aceleraciones medidas de hasta 5,4× frente al código original en `yolox-tiny`. Está marcado por el autor como de nivel "experimental" y la licencia es Apache-2.0 tanto para el código como para los pesos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | CNN one-stage anchor-free (CSPDarknet + PAFPN + cabeza desacoplada) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (visión; entrada de imagen H×W ≥ 32, padding a múltiplo de 32) |
| Tipos de cuantización | no disponible (se documenta fp16 y fp32; TensorRT fp16) |
| Idiomas soportados | no disponible (modelo de visión, sin capacidades lingüísticas) |
| Licencia | Apache-2.0 (código y pesos) |
| Formato de pesos | `.pth` (PyTorch); exportación a ONNX y TensorRT documentada |
| Pipeline | object-detection |
| Variantes | `yolox-tiny@1`, `yolox-s@1`, `yolox-m@1`, `yolox-l@1`, `yolox-x@1` |
| Salidas | `boxes`, `scores`, `labels` (y máscaras de instancia según la tarjeta) |
| Backends | `portable`, `kernels` |
| Nivel | experimental |

## Arquitectura y entrenamiento

YOLOX es un detector de una etapa sin anclas. El backbone CSPDarknet extrae características que un cuello PAFPN fusiona a múltiples escalas; la cabeza desacoplada predice por separado, para cada celda de los mapas de stride 8, 16 y 32, la caja (centro y tamaño), la objectness y las puntuaciones por clase. La puntuación de una celda se calcula como objectness × mejor clase, y el post-procesado aplica NMS por clase. El modelo se entrenó sobre COCO 2017 (split de entrenamiento con anotaciones de instancia) durante 300 épocas desde cero, sin preentrenamiento en ImageNet, tal como describen Ge et al. (2021, sección 2.1).

La tarjeta indica que el código está "vendored" desde la referencia original (commit `6ddff4824372`) sin dependencia del paquete `yolox`, y que la función portable `module()` expone la red completa (cajas decodificadas, puntuaciones y etiquetas por celda, antes de NMS). No se documentan en la información disponible detalles sobre RLHF/DPO (no aplica a un detector), composición exacta del dataset más allá de COCO 2017 ni innovaciones de decodificación especulativa.

## Capacidades

- Detección de objetos en una sola imagen RGB con 80 clases de COCO.
- Salida de cajas delimitadoras, etiquetas de clase y puntuaciones de confianza.
- Segmentación de instancias según la tarjeta (etiqueta `instance-segmentation`) y mención de máscaras de instancia en la descripción de salidas.
- Procesamiento a resoluciones arbitrarias H×W ≥ 32, con padding a múltiplo de 32 (probado hasta 3000×4000).
- Ejecución en fp16 y fp32; exportación a ONNX y TensorRT fp16.
- Backend `kernels` con kernels específicos y aceleraciones documentadas frente al código original y al backend `portable`.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües (es un modelo puramente visual).

## Casos de uso

- Detección en tiempo real en vídeo: con `yolox-tiny` o `yolox-s` y el backend `kernels` se obtienen latencias de 1,80 ms y 2,43 ms respectivamente a 800×1344 en una RTX 5060 Ti, adecuadas para pipelines de videovigilancia o análisis de tráfico.
- Inspección industrial en línea: `yolox-m` o `yolox-l` a 800×1344 con TensorRT fp16 (2,03 ms y 3,10 ms) permiten verificar piezas en cadenas de producción de alta cadencia.
- Procesamiento de imágenes de alta resolución: la tarjeta documenta ejecución a 3000×4000 con picos de memoria de 0,5-0,7 GiB en fp16, útil para teledetección o imágenes médicas de gran formato.
- Detección en dispositivos con recursos limitados: `yolox-tiny` con backend `kernels` consume 22 MiB de pico asignado a 800×1344, lo que facilita su despliegue en GPUs de gama de entrada.
- Análisis de imágenes aéreas o satelitales: la flexibilidad de resolución de entrada (hasta 3000×4000 probado) permite detectar objetos pequeños en ortomosaicos sin redimensionar a 640×640.
- Integración en pipelines de visión con PyTorch: al exponer la red completa vía `module()` y permitir exportación a ONNX/TensorRT, se puede insertar en sistemas existentes de inferencia o en servicios de clasificación y conteo de objetos.
- Prototipado e investigación: el repositorio verifica los pesos oficiales por SHA-256 y ofrece benchmarks reproducibles, lo que facilita la comparación de variantes y backends en experimentos.

## Benchmarks y rendimiento

La información proporcionada no incluye métricas de precisión (mAP) sobre COCO. Sí se documentan tiempos y memoria de inferencia sintética a 800×1344 en una RTX 5060 Ti 16 GB (sm_120):

| Modelo | Original (ms) | Portable (ms) | Kernels (ms) | Aceleración kernels vs original | Memoria pico portable (MiB) | Memoria pico kernels (MiB) |
|---|---|---|---|---|---|---|
| `yolox-tiny` | 9,79 | 5,58 | 1,80 | 5,4× | 60 / 92 | 22 / 88 |
| `yolox-s` | 10,4 | 5,55 | 2,43 | 4,3× | 79 / 100 | 40 / 92 |
| `yolox-m` | 12,4 | 6,42 | 3,45 | 3,6× | 110 / 132 | 77 / 184 |
| `yolox-l` | 15,1 | 8,13 | 5,02 | 3,0× | 165 / 206 | 139 / 250 |
| `yolox-x` | 17,2 | 11,8 | 7,82 | 2,2× | 255 / 300 | 258 / 358 |

Con `torch.compile` y TensorRT fp16 a 800×1344:

| Modelo | Portable (ms) | Compile (ms) | TensorRT fp16 (ms) | Kernels (ms) |
|---|---|---|---|---|
| `yolox-tiny` | 5,58 | 2,87 | 0,561 | 1,80 |
| `yolox-s` | 5,55 | 2,95 | 1,02 | 2,43 |
| `yolox-m` | 6,42 | 3,70 | 2,03 | 3,45 |
| `yolox-l` | 8,13 | 6,15 | 3,10 | 5,02 |
| `yolox-x` | 11,8 | 11,3 | 5,28 | 7,82 |

Tiempos de carga y primera llamada (segundos): `yolox-tiny` carga en 0,18 s (portable) y 1,58 s (kernels); la primera llamada tarda 1,31 s (portable) y 0,31 s (kernels). La preparación de `torch.compile` oscila entre 12,7 y 15,8 s, y la construcción de ONNX + engine de TensorRT entre 17,2 y 24,1 s.

## Requisitos de hardware

- VRAM estimada: en fp16 a 800×1344, el pico asignado va de 22 MiB (`yolox-tiny`, kernels) a 258 MiB (`yolox-x`, kernels); con TensorRT fp16 el pico total (engine + torch) llega a 432 MiB en `yolox-x`.
- GPU recomendadas: los benchmarks se realizaron en una RTX 5060 Ti 16 GB (sm_120); por el reducido consumo de memoria, cualquier GPU consumer moderna con soporte CUDA es suficiente.
- Cabe en GPU consumer: sí, todas las variantes; incluso `yolox-x` con TensorRT requiere menos de 0,5 GiB.
- Opciones de despliegue: backend `portable` (PyTorch), backend `kernels` (kernels específicos del proyecto), `torch.compile`, exportación a ONNX y TensorRT fp16.
- Latencia y throughput: a 800×1344 en RTX 5060 Ti, desde 0,561 ms (`yolox-tiny` con TensorRT fp16) hasta 11,8 ms (`yolox-x` portable). No se documenta throughput agregado (imágenes/s) ni latencia en otras GPUs.

## Comparativa con modelos similares

La información proporcionada no incluye datos de otros detectores (por ejemplo, YOLOv5, YOLOv8 o Faster R-CNN) que permitan una comparación cuantitativa. Se indica "no disponible" para métricas de precisión y para alternativas comparables. Como referencia interna, las cinco variantes de YOLOX se diferencian en tamaño y latencia:

| Variante | Latencia kernels (ms, 800×1344) | Memoria pico kernels (MiB) | Licencia |
|---|---|---|---|
| `yolox-tiny` | 1,80 | 22 / 88 | Apache-2.0 |
| `yolox-s` | 2,43 | 40 / 92 | Apache-2.0 |
| `yolox-m` | 3,45 | 77 / 184 | Apache-2.0 |
| `yolox-l` | 5,02 | 139 / 250 | Apache-2.0 |
| `yolox-x` | 7,82 | 258 / 358 | Apache-2.0 |

## Limitaciones y advertencias

- El repositorio no aloja pesos: es solo una tarjeta de modelo; la descarga de los checkpoints se realiza desde los enlaces de los autores y se verifica por SHA-256.
- Nivel "experimental" declarado por el autor; no se garantiza estabilidad de API ni de resultados en producción.
- No se publican métricas de precisión (mAP) en la información disponible, por lo que no es posible evaluar la exactitud frente a otros detectores.
- Entrenado únicamente sobre COCO 2017 (80 clases); el rendimiento en dominios fuera de distribución (imágenes médicas, aéreas, industriales) no está documentado.
- La tarjeta menciona cadenas de licencia del código original "registradas tal cual" y recomienda revisarlas antes de cualquier uso; aunque el código y los pesos figuran como Apache-2.0, conviene verificar los términos del paquete de investigación original.
- No dispone de capacidades de texto, tool calling ni agentes; su uso está restringido a visión por computador.
- Los benchmarks se limitan a una única GPU (RTX 5060 Ti 16 GB, sm_120) y a entradas sintéticas; el rendimiento en otros hardware o con imágenes reales puede diferir.
- La segmentación de instancias aparece en las etiquetas y en la descripción de salidas, pero no se detalla su implementación ni su calidad.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/fastforks/yolox
- Código del proyecto fastforks: https://github.com/kleinicke/fastforks
- Kernels del backend: https://huggingface.co/fastforks/kernels
- Código original de YOLOX (Megvii): https://github.com/Megvii-BaseDetection/YOLOX
- Commit de referencia: https://github.com/Megvii-BaseDetection/YOLOX/tree/6ddff4824372
- Pesos oficiales (release 0.1.1rc0): https://github.com/Megvii-BaseDetection/YOLOX/releases/tag/0.1.1rc0
- Licencia del código original: https://github.com/Megvii-BaseDetection/YOLOX/blob/6ddff4824372906469a7fae2dc3206c7aa4bbaee/LICENSE
- Benchmarks y protocolo: https://github.com/kleinicke/fastforks/blob/main/docs/benchmarks.md
- Fichero de tarjeta con hashes completos: https://github.com/kleinicke/fastforks/blob/main/src/fastforks/detection/models/yolox/card.toml
