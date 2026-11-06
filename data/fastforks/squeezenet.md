# fastforks/squeezenet

## Resumen

SqueezeNet es una arquitectura de red neuronal convolucional para clasificación de imágenes presentada por Iandola et al. en 2016, diseñada para ofrecer una precisión comparable a AlexNet con un número de parámetros drásticamente menor (del orden de 50 veces menos). La variante recogida en este repositorio es SqueezeNet 1.1, la revisión que reduce el coste computacional de los módulos fire manteniendo la precisión sobre ImageNet-1k. El modelo clasifica una única imagen RGB de 224x224 píxeles en una de las 1000 clases de ILSVRC 2012 y devuelve logits.

El repositorio `fastforks/squeezenet` no es un repositorio de pesos: es una model card de integración para la librería `fastforks`, que descarga los pesos originales de PyTorch Vision y los verifica contra un SHA-256. Ofrece dos backends de ejecución, `portable` (PyTorch estándar, fp16 en GPU) y `kernels` (kernels CUDA propios de la librería), y publica mediciones de latencia, memoria y paridad numérica frente al código original. Es relevante para quienes necesitan un clasificador de imágenes extremadamente ligero y de baja latencia dentro de un pipeline, con cifras de rendimiento verificables y una ruta de despliegue reproducible.

La licencia del código es BSD-3-Clause; el autor original no declara una licencia separada para los pesos, por lo que la model card asume BSD-3-Clause para estos y marca el uso comercial como permitido, con la advertencia de verificar esa asunción antes de un uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN con modulos fire (convolucion 1x1 de squeeze y convoluciones 1x1 / 3x3 de expand), SqueezeNet 1.1 |
| Parametros totales | no disponible (la model card no indica el recuento; SqueezeNet 1.1 se situa en torno a 1,2 M segun el paper original, dato no confirmado en la informacion proporcionada) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, entrada fija de 224x224) |
| Tipos de cuantizacion | no disponible (la model card solo documenta fp32 y fp16) |
| Idiomas soportados | no aplica (clasificacion de imagenes; etiquetas en ingles de ImageNet-1k) |
| Licencia | Codigo BSD-3-Clause; pesos sin licencia declarada por el autor, asumida BSD-3-Clause |
| Formato de pesos | `.pth` (PyTorch, `squeezenet1_1-b8a52dc0.pth`), descargado desde download.pytorch.org |

## Arquitectura y entrenamiento

SqueezeNet 1.1 es una CNN feed-forward compuesta por módulos fire. Cada módulo aplica una convolución 1x1 de compresión (squeeze) seguida de una expansión con convoluciones 1x1 y 3x3 en paralelo, concatenadas. La versión 1.1 reduce el número de filtros en los módulos fire respecto a la 1.0 y coloca la capa de pooling tardía para maximizar la resolución de los mapas de activación, lo que mantiene la precisión con menos cómputo. La entrada es fija: la imagen se redimensiona con el lado corto a 256 píxeles y se recorta al centro a 224x224.

El entrenamiento se realizó sobre ImageNet-1k (ILSVRC 2012), según la model card. No se documentan en la información proporcionada el número de tokens o imágenes exactas, la composición del dataset más allá de ImageNet-1k, ni si hubo etapas de ajuste fino con RLHF o DPO (no aplicables en un clasificador de este tipo). La innovación técnica destacable no está en el entrenamiento sino en la integración: `fastforks` verifica los pesos contra un SHA-256, ofrece paridad numérica frente al código original (máximo |diff| <= 0,002 en CPU fp32; media |diff| <= 0,02 px y p99 <= 0,08 px en GPU fp16) y un backend de kernels CUDA propios (`cudnn_hacc`, `fvm_conv`, `fvm_extra`, `fvm_mb`, `fvm_r3`) que acelera la inferencia.

## Capacidades

- Clasificación de imágenes en las 1000 clases de ImageNet-1k, con salida de logits y acceso a las top-k clases.
- Entrada de una única imagen RGB, redimensionada y recortada a 224x224 de forma fija.
- Ejecución en GPU (fp16 por defecto) o CPU (fp32) mediante el backend `portable`.
- Ejecución acelerada con kernels CUDA propios mediante el backend `kernels`, con selección automática en `mode="auto"`.
- Verificación de integridad de pesos por SHA-256 en la descarga.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, generación de texto, código, matemáticas, visión general, audio ni modo thinking.
- No es multilingüe: las etiquetas de salida son las clases en inglés de ImageNet-1k.

## Casos de uso

- Moderación y etiquetado automático de imágenes a gran escala: el modelo clasifica cada imagen en 1000 categorías con una latencia de 0,4 ms por imagen en el backend `kernels` sobre una RTX 5060 Ti, lo que permite procesar lotes masivos en pipelines de ingesta.
- Preprocesado para sistemas de búsqueda visual: usar los logits o las clases top-k como señal de filtrado o enrutamiento antes de un modelo de visión más pesado, reduciendo el coste computacional del sistema global.
- Clasificación en dispositivos con recursos limitados: el reducido tamaño de SqueezeNet 1.1 y su bajo consumo de memoria (8 MiB asignados en el backend `kernels`) lo hacen apto para entornos embebidos o GPUs de gama baja.
- Detección de contenido no deseado en plataformas: clasificación rápida de imágenes subidas por usuarios para marcar categorías sensibles antes de la revisión humana.
- Etiquetado de datasets de entrenamiento: generación automática de etiquetas preliminares sobre grandes colecciones de imágenes para acelerar la anotación manual posterior.
- Benchmarking y validación de infraestructura: por su latencia mínima y su paridad numérica documentada, sirve como modelo de referencia para medir el rendimiento de GPUs, drivers y stacks de inferencia en tareas de clasificación.

## Benchmarks y rendimiento

Datos de velocidad y memoria publicados en la model card (RTX 5060 Ti 16 GB, sm_120, entrada sintética de 224x224):

| Modelo | Tiempo (ms) fp32 original | Original | Portable | Kernels | Aceleración kernels vs original | vs portable |
|---|---|---|---|---|---|---|
| `squeezenet1_1.tv_in1k` | 1,72 | 2,63 | 1,82 | 0,42 | 4,1x | 4,3x |

| Modelo | Carga (s): original | Portable | Kernels | Primera llamada (s): original | Portable | Kernels |
|---|---|---|---|---|---|---|
| `squeezenet1_1.tv_in1k` | 1,09 | 0,05 | 0,07 | 0,37 | 0,02 | 0,00 |

| Modelo | Modo | 224x224 (tiempo ms / memoria asignada MiB / memoria reservada MiB) |
|---|---|---|
| `squeezenet1_1.tv_in1k` | portable | 1,8 / 7 / 28 |
| `squeezenet1_1.tv_in1k` | kernels | 0,4 / 8 / 14 |

Paridad con el código original: en CPU y float32, máximo |diff| <= 0,002; en GPU y float16 (por defecto), media |diff| <= 0,02 px y p99 <= 0,08 px.

No se han publicado resultados de benchmarks de precisión (top-1, top-5 en ImageNet) en la información disponible.

## Requisitos de hardware

- VRAM estimada: mínima. El backend `portable` reporta 7 MiB asignados y 28 MiB reservados en 224x224; el backend `kernels`, 8 MiB asignados y 14 MiB reservados. Cabe en cualquier GPU con unos pocos cientos de MiB libres.
- GPU recomendadas: cualquier GPU NVIDIA reciente. Las mediciones se hicieron en una RTX 5060 Ti 16 GB (sm_120). El backend `kernels` requiere una arquitectura con kernel precompilado disponible en `fastforks/kernels` y un driver NVIDIA reciente; si no existe, lanza `BackendUnavailableError` sin fallback silencioso.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo con soporte CUDA; también funciona en CPU con el backend `portable`.
- Opciones de despliegue: librería `fastforks` (`pip install fastforks`), con backends `portable` (PyTorch) y `kernels` (CUDA propio). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: 0,4 ms por imagen en `kernels` y 1,8 ms en `portable` sobre la RTX 5060 Ti; carga del modelo en 0,05-0,07 s y primera llamada en 0,00-0,02 s.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | Latencia documentada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SqueezeNet 1.1 (fastforks) | no disponible en la ficha (aprox. 1,2 M segun el paper, no confirmado) | 224x224 fija | 0,4 ms (kernels) / 1,8 ms (portable) en RTX 5060 Ti | BSD-3-Clause (codigo); pesos asumidos BSD-3-Clause | Hugging Face (model card) y PyTorch Vision |
| MobileNetV2 | no disponible en la informacion proporcionada | no disponible | no disponible | no disponible | no disponible |
| ResNet-18 | no disponible en la informacion proporcionada | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones de los modelos alternativos en la información proporcionada, por lo que la comparación cuantitativa no está disponible.

## Limitaciones y advertencias

- Solo clasifica en las 1000 clases de ImageNet-1k; cualquier categoría fuera de ese conjunto se mapea a la clase más cercana, con el consiguiente riesgo de etiquetas erróneas.
- Precisión limitada por el diseño compacto: SqueezeNet prioriza el bajo coste computacional sobre la precisión máxima, por lo que no es adecuado para tareas que exijan alta exactitud en dominios especializados.
- Entrada fija de 224x224: no admite resoluciones variables ni imágenes de alta resolución sin recorte, lo que puede perder detalle en objetos pequeños.
- Sesgos heredados de ImageNet-1k: el dataset contiene sesgos de representación geográfica, cultural y de clase que el modelo reproduce en sus predicciones.
- Riesgo de alucinación en sentido estricto no aplica (no genera texto), pero sí de falsos positivos con alta confianza en imágenes fuera de distribución.
- Licencia: el código es BSD-3-Clause, pero el autor original no declara licencia para los pesos. La model card asume BSD-3-Clause y marca el uso comercial como permitido; conviene verificar esa asunción antes de un despliegue comercial.
- El backend `kernels` depende de kernels precompilados para la arquitectura de GPU concreta y de un driver NVIDIA reciente; si no hay kernel disponible, falla explícitamente y no recurre al backend `portable`.
- El repositorio no aloja pesos: depende de la disponibilidad de download.pytorch.org y de la verificación SHA-256 en cada descarga.
- No soporta procesamiento por lotes documentado, ni vídeo, ni múltiples imágenes por llamada en la información proporcionada.

## Enlaces

- Model card en Hugging Face: https://huggingface.co/fastforks/squeezenet
- Repositorio de la librería fastforks: https://github.com/kleinicke/fastforks
- Kernels del backend CUDA: https://huggingface.co/fastforks/kernels
- Definición de la variante (card.toml): https://github.com/kleinicke/fastforks/blob/main/src/fastforks/classification/models/squeezenet/card.toml
- Documentación de benchmarks: https://github.com/kleinicke/fastforks/blob/main/docs/benchmarks.md
- Pesos originales: https://download.pytorch.org/models/squeezenet1_1-b8a52dc0.pth
- Código original (PyTorch Vision, commit 1f1a920d685d): https://github.com/pytorch/vision
- Licencia del código original: https://github.com/pytorch/vision/blob/1f1a920d685d46dfbe187934b785b7ecb7a182f2/LICENSE
