# fastforks/shufflenetv2

## Resumen

ShuffleNetV2 es una arquitectura de red neuronal convolucional ligera para clasificación de imágenes, publicada originalmente por Ma et al. en 2018 (ECCV). Este repositorio, `fastforks/shufflenetv2`, no aloja pesos propios: es una model card que documenta la integración de la variante `shufflenet_v2_x1_0.tv_in1k` (entrenada sobre ImageNet-1k) dentro del framework `fastforks`, que descarga los pesos originales de PyTorch Vision y los verifica mediante SHA-256.

El modelo resuelve clasificación de imágenes en 1.000 clases de ImageNet-1k a partir de una única imagen RGB de 224x224 píxeles, devolviendo logits. Su relevancia actual radica en el rendimiento medido: con el backend de kernels CUDA propietario de fastforks alcanza 0,84 ms por inferencia en una RTX 5060 Ti, frente a 4,79 ms del código original en fp32, con un pico de memoria de 89 MiB. Es, por tanto, una opción de muy baja latencia para pipelines de visión en producción.

La arquitectura emplea unidades de channel split y channel shuffle, diseñadas para minimizar el coste de acceso a memoria (MAC) en GPUs y dispositivos móviles. El repositorio es únicamente una ficha técnica: no contiene pesos, que se obtienen del enlace oficial de PyTorch.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN ShuffleNetV2 (channel split y channel shuffle), variante x1.0 |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada fija de 224x224) |
| Tipos de cuantizacion | fp32 (original) y fp16 (portable y kernels) |
| Idiomas soportados | no disponible (tarea de clasificación de imágenes, sin procesamiento de lenguaje) |
| Licencia | Código BSD-3-Clause; pesos sin licencia declarada por los autores (commercial use: yes según la card) |
| Formato de pesos | `.pth` (PyTorch); no se alojan en el repo, se descargan del enlace del autor |
| Pipeline | image-classification |
| Salida | logits de 1.000 clases ImageNet-1k |
| Entrada | una imagen RGB, redimensionada (lado corto 256) y recorte central a 224x224 |
| Backends | `portable` (PyTorch) y `kernels` (CUDA propietario) |
| Librería | fastforks |

## Arquitectura y entrenamiento

ShuffleNetV2 es una CNN diseñada bajo el principio de eficiencia en acceso a memoria, no solo en FLOPs. Introduce la unidad de channel split (dividir los canales de entrada en dos ramas, una de las cuales pasa por convoluciones depthwise) y la operación de channel shuffle para mezclar información entre grupos. La variante `x1_0` es la de menor anchura de la familia. La entrada es fija a 224x224.

El entrenamiento se realizó sobre ImageNet-1k (ILSVRC 2012, clasificación), según indica la model card. No se detalla el número de tokens ni composición del dataset más allá de esa referencia, ni si hubo técnicas de ajuste fino adicionales. La innovación técnica destacable en este repositorio no está en la arquitectura original, sino en el backend `kernels` de fastforks, que implementa kernels CUDA propios (`cudnn_hacc`, `fvm_conv`, `fvm_extra`, `fvm_mb`, `fvm_r3`) y requiere un kernel precompilado para la arquitectura de GPU del usuario, descargado de `fastforks/kernels` en el primer uso.

## Capacidades

- Clasificación de imágenes en 1.000 clases de ImageNet-1k, devolviendo logits.
- Inferencia en fp32 (original) y fp16 (portable y kernels).
- Backend `portable`: PyTorch estándar, funciona en GPU o CPU.
- Backend `kernels`: kernels CUDA propietarios con aceleración de hasta 5,7x frente al original y 4,4x frente a portable.
- Verificación de integridad de pesos mediante SHA-256.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un clasificador de imágenes puro.
- No dispone de modo thinking, visión generativa, audio ni generación de texto.

## Casos de uso

- Moderación de contenido visual en tiempo real: con 0,84 ms por imagen en el backend `kernels`, el modelo puede clasificar flujos de vídeo o galerías de imágenes a alta frecuencia, filtrando categorías de ImageNet antes de un análisis más costoso.
- Preetiquetado en pipelines de anotación: usar los logits de ImageNet-1k como etiqueta inicial para datasets internos, reduciendo el trabajo manual en tareas de triaje de imágenes.
- Clasificación en dispositivos con recursos limitados: el pico de memoria de 41 MiB (portable) y 89 MiB (kernels) permite ejecutarlo junto a otros modelos en la misma GPU sin competir por VRAM.
- Servicio de clasificación de baja latencia: con 0,10 s de carga y 0,00 s de primera llamada en modo `kernels`, es adecuado para funciones serverless o endpoints con arranque en frío frecuente.
- Verificación de pipelines de visión: al comprobar paridad con el código original (max |diff| <= 0.002 en CPU fp32), sirve como referencia para validar implementaciones propias de ShuffleNetV2.
- Extracción de características para búsqueda visual: los logits o features intermedios pueden alimentar sistemas de similitud de imágenes en catálogos de producto, dado el bajo coste por inferencia.
- Prototipado rápido en investigación: la API de una línea (`classification.load(...)`) y la descarga automática de pesos verificados simplifican la reproducibilidad de experimentos.

## Benchmarks y rendimiento

Datos de la model card (RTX 5060 Ti 16 GB, sm_120, entrada sintética 224x224):

| Modelo | Tiempo original fp32 (ms) | Original (ms) | Portable (ms) | Kernels (ms) | Aceleración kernels vs original | Aceleración kernels vs portable | Memoria pico original (MiB, alloc/reserv) | Portable (MiB) | Kernels (MiB) |
|---|---|---|---|---|---|---|---|---|---|
| `shufflenet_v2_x1_0.tv_in1k` | 4,79 | 6,53 | 3,71 | 0,84 | 5,7x | 4,4x | 47 / 48 | 41 / 72 | 89 / 120 |

Carga y primera llamada:

| Modelo | Carga original (s) | Carga portable (s) | Carga kernels (s) | Primera llamada original (s) | Primera llamada portable (s) | Primera llamada kernels (s) |
|---|---|---|---|---|---|---|
| `shufflenet_v2_x1_0.tv_in1k` | 1,13 | 0,14 | 0,10 | 1,15 | 0,02 | 0,00 |

Paridad con el código original: en CPU float32, max |diff| <= 0,002; en GPU float16, mean |diff| <= 0,02 px y p99 <= 0,08 px. No se publican resultados de accuracy top-1/top-5 de ImageNet en la información disponible.

## Requisitos de hardware

- VRAM estimada: 41 MiB pico asignado en modo `portable` y 89 MiB en modo `kernels` (fp16) para 224x224.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA; el backend `kernels` requiere un kernel precompilado para la arquitectura concreta (probado en sm_120, RTX 5060 Ti 16 GB) y un driver NVIDIA reciente.
- Cabe en cualquier GPU consumer moderna; también funciona en CPU con el backend `portable`.
- Opciones de despliegue: librería `fastforks` (`pip install fastforks`); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a un clasificador de imágenes).
- Latencia: 3,71 ms (portable) y 0,84 ms (kernels) por inferencia a 224x224; carga de 0,14 s y 0,10 s respectivamente.
- Si el backend `kernels` no encuentra un kernel para la GPU, lanza `BackendUnavailableError` sin fallback silencioso; `mode="auto"` selecciona `kernels` cuando puede ejecutarse.

## Comparativa con modelos similares

No se dispone de datos de benchmarks comparativos con otras arquitecturas en la información proporcionada. A continuación se comparan características estructurales con alternativas de la misma categoría (clasificadores ligeros de ImageNet-1k), indicando "no disponible" donde no hay datos:

| Modelo | Parámetros | Contexto/entrada | Licencia | Disponibilidad | Rendimiento comparado |
|---|---|---|---|---|---|
| ShuffleNetV2 x1.0 (este repo) | no disponible | 224x224 fija | Código BSD-3-Clause; pesos sin licencia declarada | HuggingFace (card) + descarga de pesos de PyTorch | 0,84 ms (kernels), 3,71 ms (portable) en RTX 5060 Ti |
| MobileNetV2 | no disponible | 224x224 | no disponible | PyTorch Vision | no disponible |
| EfficientNet-B0 | no disponible | 224x224 | no disponible | PyTorch Vision | no disponible |
| ResNet-18 | no disponible | 224x224 | no disponible | PyTorch Vision | no disponible |

## Limitaciones y advertencias

- Solo clasifica en las 1.000 clases de ImageNet-1k; no es un modelo generativo ni un extractor de texto.
- Entrada fija a 224x224: no admite resoluciones variables ni imágenes de mayor tamaño sin redimensionado previo.
- La licencia de los pesos no está declarada por los autores; la card asume BSD-3-Clause a partir del código y marca "commercial use: yes", pero conviene verificar antes de un uso comercial.
- El repositorio no aloja pesos: depende de la disponibilidad del enlace de descarga de PyTorch y de la verificación SHA-256.
- El backend `kernels` solo funciona en GPUs NVIDIA con kernel precompilado para su arquitectura; en otras GPUs hay que usar `portable`.
- Riesgo de sesgo y alucinación: al ser un clasificador, el riesgo se traduce en errores de clasificación y sesgos heredados de ImageNet-1k; no se documentan análisis de sesgo en la información disponible.
- No se publican métricas de accuracy top-1/top-5 en la card; el rendimiento de clasificación debe validarse por el usuario.
- La librería `fastforks` se describe como paquete de investigación; revisar su estado de mantenimiento antes de producción.

## Enlaces

- HuggingFace: https://huggingface.co/fastforks/shufflenetv2
- Repositorio fastforks: https://github.com/kleinicke/fastforks
- Kernels backend: https://huggingface.co/fastforks/kernels
- Benchmarks y protocolo: https://github.com/kleinicke/fastforks/blob/main/docs/benchmarks.md
- Card TOML con hashes completos: https://github.com/kleinicke/fastforks/blob/main/src/fastforks/classification/models/shufflenetv2/card.toml
- Pesos originales: https://download.pytorch.org/models/shufflenetv2_x1-5666bf0f80.pth
- Código original (PyTorch Vision, commit 1f1a920d685d): https://github.com/pytorch/vision
- Licencia original: https://github.com/pytorch/vision/blob/1f1a920d685d46dfbe187934b785b7ecb7a182f2/LICENSE
