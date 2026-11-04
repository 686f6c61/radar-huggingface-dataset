# fastforks/efficientnet

## Resumen

EfficientNet es una familia de redes neuronales convolucionales para clasificación de imágenes presentada por Mingxing Tan y Quoc V. Le en 2019. Su aportación principal es el escalado compuesto: en lugar de aumentar solo la profundidad, la anchura o la resolución de la red, EfficientNet escala las tres dimensiones de forma conjunta mediante un coeficiente fijo, lo que produce modelos con mejor relación precisión/coste computacional. La arquitectura base son bloques MBConv (Mobile Inverted Bottleneck Convolution) con conexiones squeeze-and-excitation.

El repositorio `fastforks/efficientnet` no contiene pesos propios: es una model card que describe cómo el paquete `fastforks` descarga los pesos originales de PyTorch Vision y los verifica mediante SHA-256. Incluye dos variantes preentrenadas en ImageNet-1k: `efficientnet_b0.tv_in1k@1` (entrada 224x224) y `efficientnet_b4.tv_in1k@1` (entrada 380x380). El paquete ofrece dos backends de ejecución: `portable` (PyTorch estándar) y `kernels` (kernels CUDA propios), con el objetivo de acelerar la inferencia.

La relevancia de esta ficha radica en que documenta una infraestructura de despliegue optimizada para un modelo clásico de visión, con mediciones concretas de latencia y memoria en una GPU consumer (RTX 5060 Ti 16 GB). No obstante, el modelo es exclusivamente de clasificación de imágenes en ImageNet-1k: no es un modelo de lenguaje ni soporta generación de texto, tool calling ni razonamiento multi-paso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN con bloques MBConv y squeeze-excitation (EfficientNet, Tan y Le 2019) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de texto) |
| Tipos de cuantizacion | fp32 (original), fp16 (portable y kernels); no se documentan otros formatos |
| Idiomas soportados | no disponible (la salida son logits de clases ImageNet-1k, no texto) |
| Licencia | Código: BSD-3-Clause; pesos: no declarada por los autores (la model card asume BSD-3-Clause) |
| Formato de pesos | `.pth` (PyTorch); descargados desde download.pytorch.org, verificados por SHA-256 |

## Arquitectura y entrenamiento

EfficientNet emplea bloques MBConv con convoluciones depthwise separables y módulos de squeeze-and-excitation. El escalado compuesto ajusta simultáneamente profundidad, anchura y resolución mediante coeficientes derivados de una búsqueda en rejilla sobre el modelo base B0. Las dos variantes incluidas corresponden a B0 (224x224) y B4 (380x380), esta última con mayor profundidad, anchura y resolución de entrada.

Los pesos son los publicados por Ross Wightman en PyTorch Vision (`efficientnet_b0_rwightman-7f5810bc.pth` y `efficientnet_b4_rwightman-23ab8bcd.pth`), entrenados sobre ImageNet-1k (ILSVRC 2012). No se documentan en la información proporcionada detalles sobre el número de tokens, composición del dataset más allá de ImageNet-1k, ni sobre técnicas de ajuste como RLHF o DPO (no aplicables a un clasificador de imágenes). La innovación del repositorio `fastforks` es de despliegue: kernels CUDA propios (`cudnn_hacc`, `fvm_conv`, `fvm_extra`, `fvm_mb`, `fvm_r3`) que aceleran la inferencia entre 4,6x y 6,5x frente a la implementación original, con verificación de paridad numérica frente a los outputs dorados del código original.

## Capacidades

- Clasificación de imágenes en las 1.000 clases de ImageNet-1k, con salida de logits.
- Procesamiento de una única imagen RGB por inferencia.
- Entrada de tamaño fijo: 224x224 para B0 (redimensionado con lado corto 256 y recorte central) y 380x380 para B4 (lado corto 384 y recorte central).
- Dos backends de ejecución: `portable` (PyTorch, GPU o CPU) y `kernels` (kernels CUDA propios, requiere arquitectura de GPU precompilada).
- Selección automática de backend con `mode="auto"`, que elige `kernels` cuando puede ejecutarse.
- No soporta generación de texto, tool calling, agentes, razonamiento multi-paso, visión general (detección, segmentación, VQA) ni capacidades multilingües.

## Casos de uso

- Moderación de contenido visual: clasificar imágenes subidas por usuarios en categorías ImageNet para filtrar contenido no deseado en pipelines de ingestión, aprovechando la latencia de 0,9 ms por imagen con el backend `kernels` en B0.
- Etiquetado automático de catálogos de productos: preclasificar imágenes de inventario en categorías amplias antes de un paso de revisión humana, usando B4 (380x380) cuando se requiere mayor resolución de detalle.
- Preprocesamiento en sistemas de búsqueda visual: generar etiquetas de clase como metadatos para indexar y filtrar imágenes antes de aplicar embeddings más costosos.
- Clasificación en dispositivos con GPU consumer: B0 en fp16 ocupa 48 MiB asignados (84 MiB reservados) en modo `portable`, lo que permite ejecutarlo junto a otros modelos en una RTX 5060 Ti de 16 GB.
- Procesamiento por lotes de imágenes a gran escala: con 0,9 ms por imagen en B0 y backend `kernels`, un solo dispositivo puede procesar del orden de un millar de imágenes por segundo en condiciones ideales, adecuado para tareas de etiquetado masivo offline.
- Validación de pipelines de visión: servir como modelo de referencia para comprobar la paridad numérica de implementaciones propias, ya que la model card documenta tolerancias concretas (max |diff| <= 0,002 en CPU fp32; mean |diff| <= 0,02 px y p99 <= 0,08 px en GPU fp16).
- Prototipado rápido de clasificadores: la API `classification.load(...)` y `result.top(5)` permite integrar un clasificador funcional en pocas líneas para demos y pruebas de concepto.

## Benchmarks y rendimiento

La model card no publica métricas de precisión (top-1/top-5) sobre ImageNet-1k. Sí documenta latencia, memoria y paridad numérica.

Rendimiento en clasificación sintética 224x224 (RTX 5060 Ti 16 GB, sm_120):

| Modelo | Tiempo original fp32 (ms) | Original (ms) | Portable (ms) | Kernels (ms) | Aceleración kernels vs original | Memoria pico asignada/reservada original (MiB) | Portable (MiB) | Kernels (MiB) |
|---|---|---|---|---|---|---|---|---|
| `efficientnet_b0.tv_in1k` | 5,64 | 7,91 | 4,98 | 0,87 | 6,5x | 64 / 84 | 48 / 96 | 78 / 162 |
| `efficientnet_b4.tv_in1k` | 11,09 | 15,66 | 10,0 | 2,19 | 5,1x | 147 / 174 | 89 / 114 | 109 / 178 |

Arranque y primera llamada:

| Modelo | Carga original (s) | Carga portable (s) | Carga kernels (s) | Primera llamada original (s) | Primera llamada portable (s) | Primera llamada kernels (s) |
|---|---|---|---|---|---|---|
| `efficientnet_b0.tv_in1k` | 1,25 | 0,17 | 0,24 | 2,86 | 0,38 | 0,01 |
| `efficientnet_b4.tv_in1k` | 0,41 | 0,37 | 0,53 | 1,72 | 0,06 | 0,01 |

Tamaño fijo 224x224 (tiempo ms / memoria pico asignada / reservada en MiB):

| Modelo | Modo | 224x224 |
|---|---|---|
| `efficientnet_b0.tv_in1k` | portable | 5,0 ms / 48 / 84 |
| `efficientnet_b0.tv_in1k` | kernels | 0,9 ms / 81 / 164 |
| `efficientnet_b4.tv_in1k` | portable | 9,9 ms / 92 / 120 |
| `efficientnet_b4.tv_in1k` | kernels | 2,2 ms / 125 / 200 |

Paridad numérica frente al código original: en CPU float32, max |diff| <= 0,002; en GPU float16 (por defecto), mean |diff| <= 0,02 px y p99 <= 0,08 px.

## Requisitos de hardware

- VRAM estimada: B0 en fp16 con backend `portable` requiere 48 MiB asignados (84 MiB reservados) en 224x224; B4 requiere 89 MiB asignados (114 MiB reservados). Con backend `kernels`, B0 requiere 78 MiB asignados (162 MiB reservados) y B4 109 MiB asignados (178 MiB reservados).
- GPU recomendadas: las mediciones se realizaron en una RTX 5060 Ti 16 GB (sm_120). El backend `portable` funciona en cualquier GPU compatible con PyTorch; el backend `kernels` requiere una arquitectura con kernel precompilado disponible en `fastforks/kernels` y un driver NVIDIA reciente.
- Cabe en cualquier GPU consumer moderna: el consumo de memoria es inferior a 200 MiB en todos los casos medidos, por lo que también puede convivir con otros modelos en la misma GPU.
- Opciones de despliegue: paquete `fastforks` (`pip install fastforks`) con API `classification.load(...)`; backends `portable` (PyTorch, GPU o CPU) y `kernels` (CUDA). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a un clasificador de imágenes.
- Latencia y throughput: 0,87 ms por imagen en B0 con `kernels` y 2,19 ms en B4; 4,98 ms y 10,0 ms respectivamente con `portable`. La primera llamada con `kernels` es de 0,01 s, frente a 2,86 s (original) y 0,38 s (portable) en B0.

## Comparativa con modelos similares

No se dispone en la información proporcionada de datos de precisión ni de especificaciones de modelos alternativos (ResNet, MobileNet, ViT, ConvNeXt) que permitan una comparación rigurosa. La model card solo compara el rendimiento del propio EfficientNet entre sus backends (`original`, `portable`, `kernels`), no frente a otros modelos.

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| EfficientNet B0 (fastforks) | no disponible | no aplica | 0,87 ms/imagen (kernels, 224x224) | BSD-3-Clause (código); pesos no declarados | HuggingFace (model card) + PyTorch Vision |
| EfficientNet B4 (fastforks) | no disponible | no aplica | 2,19 ms/imagen (kernels, 380x380) | BSD-3-Clause (código); pesos no declarados | HuggingFace (model card) + PyTorch Vision |
| Alternativas (ResNet, MobileNet, ViT) | no disponible | no aplica | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El repositorio no contiene pesos: es únicamente una model card. Los pesos se descargan de servidores de PyTorch y se verifican por SHA-256, lo que introduce una dependencia de disponibilidad de esos servidores.
- Modelo exclusivamente de clasificación de imágenes en ImageNet-1k: no genera texto, no razona, no soporta tool calling ni agentes. No debe presentarse como un modelo de lenguaje.
- Entrada de tamaño fijo (224x224 o 380x380) con redimensionado y recorte central: objetos pequeños o con relación de aspecto muy distinta pueden perder información.
- Solo una imagen por inferencia; no se documenta soporte de lotes en la API mostrada.
- Riesgo de sesgo y alucinación: las clases de ImageNet-1k heredan los sesgos y desequilibrios del dataset ILSVRC 2012; las predicciones pueden ser incorrectas o estereotipadas en categorías poco representadas.
- Licencia de pesos no declarada explícitamente por los autores: la model card asume BSD-3-Clause a partir de la licencia del código, pero indica que debe comprobarse antes de cualquier uso. La licencia del paquete se etiqueta como `other` con nombre `bsd-3-clause-code-weights-unstated`.
- El backend `kernels` requiere una GPU con arquitectura soportada y driver NVIDIA reciente; si no hay kernel precompilado, lanza `BackendUnavailableError` sin fallback silencioso. Esto puede romper despliegues en hardware no previsto.
- Las mediciones de rendimiento corresponden a una única GPU (RTX 5060 Ti 16 GB, sm_120) y a entradas sintéticas; el rendimiento en producción puede variar con el preprocesado y el hardware.
- No se documentan métricas de precisión top-1/top-5, por lo que no es posible evaluar la calidad del clasificador a partir de esta ficha.

## Enlaces

- Model card en HuggingFace: https://huggingface.co/fastforks/efficientnet
- Repositorio del paquete fastforks: https://github.com/kleinicke/fastforks
- Kernels del backend: https://huggingface.co/fastforks/kernels
- Documentación de benchmarks: https://github.com/kleinicke/fastforks/blob/main/docs/benchmarks.md
- Definición de variantes (card.toml): https://github.com/kleinicke/fastforks/blob/main/src/fastforks/classification/models/efficientnet/card.toml
- Código original (PyTorch Vision, commit 1f1a920d685d): https://github.com/pytorch/vision
- Licencia de PyTorch Vision: https://github.com/pytorch/vision/blob/1f1a920d685d46dfbe187934b785b7ecb7a182f2/LICENSE
- Pesos B0: https://download.pytorch.org/models/efficientnet_b0_rwightman-7f5810bc.pth
- Pesos B4: https://download.pytorch.org/models/efficientnet_b4_rwightman-23ab8bcd.pth
