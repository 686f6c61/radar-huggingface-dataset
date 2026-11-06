# fastforks/efficientnetv2

## Resumen

EfficientNetV2 es una familia de redes neuronales convolucionales para clasificación de imágenes presentada por Mingxing Tan y Quoc V. Le (Google Research) en 2021. La innovación principal frente a EfficientNetV1 es la combinación de bloques Fused-MBConv en las etapas tempranas y MBConv en las etapas tardías, junto con un procedimiento de entrenamiento con aumento progresivo de resolución. El resultado son modelos que entrenan hasta 5 veces más rápido que sus predecesores manteniendo o mejorando la precisión en ImageNet-1k.

El repositorio `fastforks/efficientnetv2` no contiene pesos: es una model card de un paquete de inferencia alternativo denominado fastforks, que descarga los pesos originales publicados por PyTorch Vision y los verifica mediante SHA-256. La variante disponible es `efficientnet_v2_s.tv_in1k`, la versión "small" preentrenada en ImageNet-1k, con entrada fija de 384x384 píxeles y salida de logits sobre las 1000 clases de ImageNet.

Su relevancia actual radica en el backend `kernels` del paquete fastforks, que implementa núcleos CUDA propios (`cudnn_hacc`, `fvm_conv`, `fvm_extra`, `fvm_mb`, `fvm_r3`) y logra aceleraciones de hasta 5,8 veces frente al código original en fp32 y de 4,8 veces frente al backend portable en fp16, con un consumo de memoria moderado. Es, por tanto, una vía para servir clasificadores EfficientNetV2 con baja latencia en GPUs modernas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN con bloques Fused-MBConv (etapas tempranas) y MBConv (etapas tardias) |
| Parametros totales | no disponible (la variante `efficientnet_v2_s` ronda los 21,5 M en la literatura original, no confirmado en la informacion proporcionada) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, entrada fija de imagen 384x384) |
| Tipos de cuantizacion | fp32 y fp16 soportados por el paquete; no se documentan otros formatos |
| Idiomas soportados | no disponible (no aplica; clasificacion de imagenes con etiquetas ImageNet en ingles) |
| Licencia | Codigo BSD-3-Clause; licencia de pesos no declarada por los autores (`bsd-3-clause-code-weights-unstated`) |
| Formato de pesos | `.pth` (PyTorch state dict), descargado desde `download.pytorch.org` y verificado por SHA-256 |

## Arquitectura y entrenamiento

La red sigue el diseno de EfficientNetV2: una etapa inicial con bloques Fused-MBConv, que fusiona la convolucion expansion 1x1 y la depthwise en una sola convolucion 3x3 para aprovechar mejor las unidades de aceleracion hardware en las primeras capas, seguida de etapas con bloques MBConv clasicos (expansion, depthwise y proyeccion con conexiones residuales). La variante `s` (small) emplea una entrada fija de 384x384, con redimensionado del lado corto a 384 y recorte central.

El entrenamiento se realizo sobre ImageNet-1k (ILSVRC 2012, 1000 clases). El articulo original de Tan y Le introduce un entrenamiento con aumento progresivo de la resolucion y regularizacion adaptativa, que reduce el coste computacional del preentrenamiento. No se documenta en la informacion proporcionada el uso de RLHF, DPO ni tecnicas de alineacion, algo esperable en un clasificador de vision supervisado. La innovacion tecnica destacable del repositorio fastforks no esta en el modelo sino en la implementacion: kernels CUDA propios para las convoluciones y verificacion de integridad de pesos por hash.

## Capacidades

- Clasificacion de imagenes en las 1000 clases de ImageNet-1k, devolviendo logits (y top-k mediante `result.top(k)`).
- Entrada de una unica imagen RGB, redimensionada y recortada a 384x384.
- Ejecucion en GPU (CUDA) o CPU, con precision fp16 por defecto en GPU y fp32 en CPU.
- Dos backends: `portable` (PyTorch estandar) y `kernels` (kernels CUDA propios), seleccionables de forma explicita o mediante `mode="auto"`.
- No soporta tool calling, agentes, razonamiento multi-paso ni generacion de texto.
- No dispone de capacidades multilingues, de vision generativa ni de modo "thinking".
- Verificacion de pesos por SHA-256 antes de la carga.

## Casos de uso

- Etiquetado automatico de catalogos de producto: clasificar imagenes de inventario en categorias ImageNet o en un subconjunto de clases relevantes, aprovechando la latencia de 2,1 ms por imagen con el backend `kernels` para procesar lotes grandes.
- Filtrado y moderacion de contenido visual: preclasificar imagenes subidas por usuarios para detectar categorias sensibles antes de un analisis mas profundo con modelos mayores.
- Preprocesamiento en pipelines de vision por computador: usar los logits como caracteristicas o como etapa de enrutamiento previa a un modelo especifico de dominio.
- Clasificacion en dispositivos con GPU de consumo: el modelo cabe en 0,1 GiB de memoria en fp16 y puede ejecutarse en una RTX 5060 Ti u otras GPU consumer, lo que permite desplegarlo en estaciones de trabajo sin aceleradores de datacenter.
- Servicio de inferencia de baja latencia: con 2,1 ms por imagen a 224x224 y 10,0 ms en modo portable, es adecuado para APIs de clasificacion con requisitos de throughput alto y presupuesto de memoria reducido.
- Prototipado rapido en investigacion: la carga en 0,35 s (portable) y la primera llamada en 0,01-0,04 s facilitan la experimentacion iterativa en notebooks y scripts.
- Benchmarking de kernels CUDA: el repositorio sirve como referencia para comparar implementaciones de convoluciones (original fp32, portable fp16 y kernels propios) sobre el mismo modelo.

## Benchmarks y rendimiento

Los datos disponibles son de velocidad y memoria, no de precision en ImageNet (la model card no publica top-1/top-5). Se presentan a continuacion.

Clasificacion sintetica a 224x224 (RTX 5060 Ti 16 GB, sm_120):

| Modelo | Tiempo original fp32 (ms) | Original (ms) | Portable (ms) | Kernels (ms) | Aceleracion kernels vs original | Aceleracion kernels vs portable | Memoria pico original (MiB, alloc/res) | Portable (MiB) | Kernels (MiB) |
|---|---|---|---|---|---|---|---|---|---|
| `efficientnet_v2_s.tv_in1k` | 12,14 | 16,6 | 10,18 | 2,11 | 5,8x | 4,8x | 159 / 176 | 81 / 106 | 113 / 168 |

Arranque y primera llamada:

| Modelo | Carga original (s) | Carga portable (s) | Carga kernels (s) | Primera llamada original (s) | Primera llamada portable (s) | Primera llamada kernels (s) |
|---|---|---|---|---|---|---|
| `efficientnet_v2_s.tv_in1k` | 1,48 | 0,35 | 0,53 | 0,97 | 0,04 | 0,01 |

Velocidad y memoria a tamano fijo 224x224 (tiempo ms / memoria pico alloc / reservada en MiB):

| Modelo | Modo | 224x224 |
|---|---|---|
| `efficientnet_v2_s.tv_in1k` | portable | 10,0 ms / 82 / 132 |
| `efficientnet_v2_s.tv_in1k` | kernels | 2,1 ms / 116 / 210 |

Paridad con el codigo original: en CPU y float32, diferencia maxima absoluta <= 0,002 frente a las salidas de referencia; en GPU y float16, diferencia media <= 0,02 px y p99 <= 0,08 px. No se han publicado resultados de precision (top-1/top-5) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: 0,1 GiB de memoria pico en fp16 a 384x384 (backend portable, RTX 5060 Ti); 82-116 MiB a 224x224 segun backend.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA reciente; el backend `kernels` requiere una arquitectura con kernel precompilado (probado en sm_120, RTX 5060 Ti 16 GB) y un driver NVIDIA reciente.
- GPU de consumo: si, cabe holgadamente en cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090, etc.); el limite practico es la disponibilidad de kernel precompilado para la arquitectura.
- Opciones de despliegue: paquete `fastforks` (`pip install fastforks`), con backend portable (PyTorch) o kernels CUDA. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplican a un clasificador de vision de este tipo).
- Latencia y throughput: 2,1 ms por imagen a 224x224 con kernels (unas 476 imagenes/s teoricas en regimen estable), 10,0 ms con portable (unas 100 imagenes/s). Primera llamada de 0,01 s con kernels y 0,04 s con portable. Carga del modelo de 0,35-0,53 s.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de precision ni de especificaciones de modelos alternativos en la informacion proporcionada, por lo que la comparativa cuantitativa no esta disponible. Como referencia cualitativa de la misma categoria (clasificadores CNN preentrenados en ImageNet-1k):

| Modelo | Parametros | Entrada | Contexto/uso | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| EfficientNetV2-S (este repo, via fastforks) | no disponible | 384x384 | clasificacion ImageNet-1k | BSD-3-Clause (codigo); pesos sin declarar | Hugging Face + PyTorch Vision |
| EfficientNetV1 | no disponible | variable | clasificacion ImageNet-1k | no disponible | no disponible |
| ResNet-50 | no disponible | 224x224 | clasificacion ImageNet-1k | no disponible | no disponible |
| ViT-B/16 | no disponible | 224x224 | clasificacion ImageNet-1k | no disponible | no disponible |

Los datos de parametros, precision y licencia de las alternativas no se han proporcionado; deben consultarse en sus respectivas fichas antes de cualquier decision.

## Limitaciones y advertencias

- Solo clasifica en las 1000 clases de ImageNet-1k; no es un modelo generativo ni de proposito general.
- Entrada fija de 384x384: no admite imagenes de otras resoluciones sin redimensionado y recorte previos.
- No se han publicado metricas de precision (top-1/top-5) en la informacion disponible; no se puede verificar el rendimiento real frente al modelo original.
- La licencia de los pesos no esta declarada por los autores (`weights-unstated`); el uso comercial se asume a partir de la licencia del codigo (BSD-3-Clause) pero no esta garantizado. Verificar antes de produccion.
- El backend `kernels` requiere un kernel precompilado para la arquitectura GPU; si no existe, lanza `BackendUnavailableError` y no hace fallback silencioso, lo que puede romper despliegues en GPUs no soportadas.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; es un paquete joven con escasa validacion comunitaria.
- Riesgo de sesgo heredado de ImageNet-1k: las etiquetas y la distribucion del dataset original pueden producir clasificaciones sesgadas en dominios no representados.
- Riesgo de alucinacion no aplica en el sentido generativo, pero si de clasificacion erronea con alta confianza en imagenes fuera de distribucion.
- No soporta otros idiomas ni tareas multimodales; las etiquetas de salida estan en ingles.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/fastforks/efficientnetv2
- Codigo del paquete fastforks: https://github.com/kleinicke/fastforks
- Kernels backend: https://huggingface.co/fastforks/kernels
- Pesos originales: https://download.pytorch.org/models/efficientnet_v2_s-dd5fe13b.pth
- Codigo original (PyTorch Vision, commit 1f1a920d685d): https://github.com/pytorch/vision
- Licencia del codigo original: https://github.com/pytorch/vision/blob/1f1a920d685d46dfbe187934b785b7ecb7a182f2/LICENSE
- Documentacion de benchmarks: https://github.com/kleinicke/fastforks/blob/main/docs/benchmarks.md
- Card TOML con hashes completos: https://github.com/kleinicke/fastforks/blob/main/src/fastforks/classification/models/efficientnetv2/card.toml
