# fastforks/vgg

## Resumen

VGG (Simonyan y Zisserman, 2014) es una arquitectura de red neuronal convolucional para clasificación de imágenes que apila convoluciones de 3x3 y culmina en tres capas totalmente conectadas. El repositorio `fastforks/vgg` no contiene pesos propios: es una model card que documenta cómo el framework [fastforks](https://github.com/kleinicke/fastforks) descarga los pesos originales de PyTorch Vision, verifica su integridad mediante SHA-256 y expone una API unificada para ejecutar la inferencia con distintos backends.

La variante documentada es `vgg16.tv_in1k@1`, que corresponde a VGG-16 preentrenada en ImageNet-1k (ILSVRC 2012). El modelo recibe una única imagen RGB de 224x224 píxeles y devuelve logits sobre las 1.000 clases de ImageNet-1k. Es relevante como referencia histórica y como baseline de clasificación de imágenes, y el interés actual del repositorio reside en las optimizaciones de inferencia que ofrece fastforks: un backend `portable` en PyTorch y un backend `kernels` con kernels CUDA propios que aceleran la ejecución.

El repositorio está pensado para desarrolladores que quieran usar VGG-16 con una interfaz moderna, mediciones de latencia y memoria, y verificación de pesos, sin tener que gestionar manualmente los ficheros `.pth` originales ni las particularidades del preprocesado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | CNN (VGG-16): convoluciones 3x3 apiladas y tres capas totalmente conectadas |
| Parámetros totales | no disponible (VGG-16 canónico: ~138 M) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada fija de 224x224) |
| Tipos de cuantización | fp32 (original) y fp16 (portable y kernels); no se documentan otras |
| Idiomas soportados | no disponible (clasificación de imágenes, sin componente textual) |
| Licencia | Código: BSD-3-Clause; pesos: el autor no declara licencia separada (indicada como "other") |
| Formato de pesos | `.pth` (PyTorch) descargados desde download.pytorch.org; verificación SHA-256 |

## Arquitectura y entrenamiento

VGG-16 es una red convolucional pura: bloques de convoluciones 3x3 con activaciones ReLU y max-pooling, seguidos de tres capas densas y una capa de salida softmax sobre 1.000 clases. La entrada es fija a 224x224, con redimensionado del lado corto a 256 y recorte central. El modelo fue entrenado sobre ImageNet-1k (ILSVRC 2012), según indica la model card. No se documentan en la información proporcionada detalles sobre número de tokens, composición exacta del dataset, ni procesos de RLHF/DPO (no aplicables a este tipo de modelo).

La innovación técnica del repositorio no está en la arquitectura, sino en la infraestructura de inferencia de fastforks. El backend `portable` ejecuta el modelo en PyTorch (GPU si hay CUDA disponible, si no CPU) y el backend `kernels` usa kernels CUDA propios (`cudnn_hacc`, `fvm_conv`, `fvm_extra`, `fvm_mb`, `fvm_r3`) precompilados por arquitectura de GPU y descargados desde `fastforks/kernels`. El modo `auto` selecciona `kernels` cuando puede ejecutarse y registra la elección; si no hay kernel disponible lanza `BackendUnavailableError` sin degradar silenciosamente. La paridad con el código original se verifica contra salidas doradas: en CPU float32 la diferencia máxima es <= 0.002, y en GPU float16 la diferencia media es <= 0.02 px y el p99 <= 0.08 px.

## Capacidades

- Clasificación de imágenes en ImageNet-1k: devuelve logits sobre 1.000 clases para una imagen RGB de 224x224.
- Salida `logits` con utilidad `top(k)` para obtener las k clases más probables.
- Ejecución en GPU (CUDA) o CPU según disponibilidad, con backend `portable` en PyTorch.
- Backend `kernels` con kernels CUDA optimizados para arquitecturas NVIDIA soportadas.
- Verificación de integridad de pesos mediante SHA-256 antes de la carga.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un clasificador de imágenes.
- No dispone de modo "thinking", visión generativa, audio ni generación de texto.

## Casos de uso

- Clasificación automática de imágenes en pipelines de ingesta: el modelo etiqueta cada imagen con una de las 1.000 clases de ImageNet, útil para organizar o filtrar catálogos fotográficos antes de un etiquetado manual.
- Baseline en investigación de visión por computador: sirve como referencia de exactitud y latencia contra la que comparar arquitecturas más recientes en tareas de clasificación.
- Moderación preliminar de contenido visual: clasificación rápida de imágenes para detectar categorías concretas (por ejemplo, objetos o escenas) antes de aplicar filtros más costosos.
- Prototipado rápido con fastforks: la API `classification.load("vgg16.tv_in1k")` permite integrar el modelo en pocas líneas, con salida `top(5)` y detección del backend usado.
- Evaluación de infraestructura GPU: el backend `kernels` y las tablas de latencia y memoria permiten medir el rendimiento de un despliegue en GPUs NVIDIA concretas (por ejemplo, RTX 5060 Ti 16 GB, sm_120).
- Sistemas de recuperación de imágenes por etiqueta: usar las clases predichas como metadatos para indexar y buscar imágenes en una base de datos.
- Docencia y demostraciones: modelo pequeño y bien conocido para ilustrar el funcionamiento de una CNN y comparar implementaciones (original, portable y kernels).

## Benchmarks y rendimiento

Datos de velocidad y memoria publicados en la model card (RTX 5060 Ti 16 GB, sm_120; clasificación sintética, 224x224):

| Modelo | Tiempo original fp32 (ms) | Original (ms) | Portable (ms) | Kernels (ms) | Aceleración kernels vs original | Aceleración kernels vs portable | Memoria pico original (MiB, alloc/reserv) | Portable (MiB) | Kernels (MiB) |
|---|---|---|---|---|---|---|---|---|---|
| `vgg16.tv_in1k` | 3.62 | 4.09 | 1.99 | 1.56 | 2.3x | 1.3x | 825 / 846 | 313 / 372 | 333 / 432 |

Carga y primera llamada:

| Modelo | Carga original (s) | Carga portable (s) | Carga kernels (s) | Primera llamada original (s) | Primera llamada portable (s) | Primera llamada kernels (s) |
|---|---|---|---|---|---|---|
| `vgg16.tv_in1k` | 3.22 | 1.74 | 0.59† | 0.30 | 0.00 | 0.00 |

Tamaño fijo, todos los modos:

| Modelo | Modo | 224x224 (tiempo ms / pico alloc / pico reserv) |
|---|---|---|
| `vgg16.tv_in1k` | portable | 2.0 ms / 313 / 338 |
| `vgg16.tv_in1k` | kernels | 1.6 ms / 343 / 412 |

No se han publicado resultados de benchmarks de exactitud (top-1/top-5 en ImageNet) en la información disponible; solo se documenta la paridad numérica con el código original.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0.3 GiB de memoria pico asignada en fp16 con el backend `portable` (313 MiB asignados, 372 MiB reservados); con `kernels`, 333 MiB asignados y 432 MiB reservados.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA; las mediciones se realizaron en una RTX 5060 Ti 16 GB (sm_120). El backend `kernels` requiere un kernel precompilado para la arquitectura de la GPU y un driver NVIDIA reciente.
- Cabe en GPU de consumo: sí, con menos de 1 GiB de memoria pico, por lo que funciona en GPUs consumer con al menos ~1 GiB de VRAM libre.
- Opciones de despliegue: paquete `fastforks` (`pip install fastforks`) con backends `portable` (PyTorch) y `kernels` (CUDA propio); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a un clasificador de imágenes).
- Latencia y throughput: 1.6-2.0 ms por imagen en 224x224 en la RTX 5060 Ti 16 GB; carga del modelo entre 0.59 s (kernels) y 3.22 s (original); primera llamada prácticamente inmediata en portable y kernels (0.00 s).

## Comparativa con modelos similares

La información proporcionada no incluye comparaciones con otras arquitecturas de clasificación (ResNet, EfficientNet, ViT, etc.). La única comparación disponible es entre las tres implementaciones del mismo modelo dentro de fastforks:

| Implementación | Tiempo 224x224 (ms) | Memoria pico (MiB) | Carga (s) | Notas |
|---|---|---|---|---|
| Original (código del autor) | 4.09 (fp16); 3.62 (fp32) | 825 / 846 | 3.22 | Código de referencia en el commit fijado |
| Portable (fastforks) | 1.99 | 313 / 372 | 1.74 | PyTorch, GPU o CPU |
| Kernels (fastforks) | 1.56 | 333 / 432 | 0.59† | Requiere kernel CUDA precompilado para la GPU |

Comparativa con modelos alternativos de la misma categoría: no disponible.

## Limitaciones y advertencias

- Modelo de clasificación cerrado a las 1.000 clases de ImageNet-1k; no genera texto, código ni respuestas, y no admite instrucciones en lenguaje natural.
- Entrada fija de 224x224: imágenes de otra resolución deben redimensionarse (lado corto 256) y recortarse al centro, lo que puede perder información en los bordes.
- Sesgos conocidos: no se documentan en la información proporcionada, pero al entrenarse en ImageNet-1k hereda los sesgos de composición y etiquetado de ese dataset.
- Riesgo de alucinación: no aplica en el sentido generativo, pero el modelo puede asignar con alta confianza una clase incorrecta en imágenes fuera de la distribución de ImageNet.
- Licencia: el código es BSD-3-Clause; el autor no declara una licencia separada para los pesos (indicada como "other"). La model card asume BSD-3-Clause para los pesos a partir del código, pero recomienda comprobarlo antes de cualquier uso; el uso comercial figura como "yes" en la tabla de variantes.
- El backend `kernels` solo funciona en GPUs NVIDIA con kernel precompilado disponible y driver reciente; si no lo hay, lanza `BackendUnavailableError` sin degradar a `portable`.
- El repositorio no aloja los pesos: depende de la disponibilidad de `download.pytorch.org` y de `fastforks/kernels` para la descarga.
- La model card advierte que el paquete es de uso en investigación y que deben revisarse las cadenas de licencia originales antes de otros usos.
- No se documentan idiomas soportados ni capacidades multilingües porque el modelo no procesa texto.

## Enlaces

- Model card en HuggingFace: https://huggingface.co/fastforks/vgg
- Repositorio de fastforks: https://github.com/kleinicke/fastforks
- Kernels para el backend `kernels`: https://huggingface.co/fastforks/kernels
- Fichero `card.toml` con hashes completos: https://github.com/kleinicke/fastforks/blob/main/src/fastforks/classification/models/vgg/card.toml
- Documentación de benchmarks: https://github.com/kleinicke/fastforks/blob/main/docs/benchmarks.md
- Pesos originales VGG-16: https://download.pytorch.org/models/vgg16-397923af.pth
- Código original (PyTorch Vision, commit 1f1a920d685d): https://github.com/pytorch/vision
- Licencia del código original: https://github.com/pytorch/vision/blob/1f1a920d685d46dfbe187934b785b7ecb7a182f2/LICENSE
