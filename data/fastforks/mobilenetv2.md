# fastforks/mobilenetv2

## Resumen

MobileNetV2 es una red neuronal convolucional para clasificación de imágenes presentada por Sandler et al. en 2018. Su aportación principal es el bloque de "residual invertido con cuello de botella lineal" (inverted residual with linear bottleneck), que reduce el coste computacional y el número de parámetros manteniendo una precisión competitiva en ImageNet-1k. Está pensada para inferencia eficiente en dispositivos con recursos limitados, desde móviles hasta GPUs de consumo.

El repositorio `fastforks/mobilenetv2` no contiene pesos: es una model card que documenta cómo el paquete `fastforks` descarga los pesos originales del autor (PyTorch Vision, checkpoint `mobilenet_v2-7ebf99e0.pth`) y los verifica contra un SHA-256. El modelo se expone con dos backends: `portable` (PyTorch estándar) y `kernels` (kernels CUDA propios), con el objetivo declarado de acelerar la inferencia manteniendo paridad numérica con el código original.

La tarea es clasificación sobre ImageNet-1k (1.000 clases), con entrada RGB fija de 224x224 y salida de logits. Es relevante para quien necesite un clasificador de imágenes ligero, rápido y con licencia permisiva, aunque el repositorio en sí es un envoltorio de terceros y no una publicación de pesos nuevos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | CNN con bloques de residual invertido y cuello de botella lineal (MobileNetV2, Sandler et al. 2018) |
| Parámetros totales | no disponible en la información proporcionada |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada fija 224x224) |
| Tipos de cuantización | no disponible (el repo documenta ejecución en fp16 y fp32; no se listan cuantizaciones) |
| Idiomas soportados | no aplica (clasificación de imágenes; sin capacidades lingüísticas) |
| Licencia | Código: BSD-3-Clause; pesos: no declarada por el autor (`bsd-3-clause-code-weights-unstated`) |
| Formato de pesos | `.pth` (PyTorch, descargado desde `download.pytorch.org`) |

## Arquitectura y entrenamiento

MobileNetV2 es una CNN compuesta por bloques de convolución separable en profundidad combinados con residuales invertidos: cada bloque expande los canales con una convolución 1x1, aplica una depthwise 3x3 y proyecta de nuevo con una 1x1 lineal (sin activación ReLU en la proyección) para evitar la pérdida de información en cuellos de botella de baja dimensión. No hay mecanismos de atención ni componentes tipo transformer.

Los datos de entrenamiento del checkpoint referenciado son ImageNet-1k (ILSVRC 2012, clasificación). La información proporcionada no detalla el número de tokens, la composición exacta del dataset ni si hubo etapas de ajuste fino adicionales (RLHF/DPO no aplican a este tipo de modelo). La innovación técnica destacable del repositorio `fastforks` no está en el modelo, sino en el envoltorio: kernels CUDA propios (`cudnn_hacc`, `fvm_conv`, `fvm_extra`, `fvm_mb`, `fvm_r3`) que, según la model card, reducen el tiempo de inferencia de 5,14 ms (original) a 0,52 ms (kernels) en una RTX 5060 Ti 16 GB, con verificación de paridad numérica frente a las salidas doradas del código original.

## Capacidades

- Clasificación de imágenes en ImageNet-1k: devuelve logits sobre 1.000 clases a partir de una imagen RGB.
- Inferencia en fp32 y fp16: el backend `portable` ejecuta en CPU o GPU; el backend `kernels` requiere GPU NVIDIA con arquitectura soportada.
- API de alto nivel: `classification.load(...)` y `result.top(5)` para obtener las cinco clases más probables.
- Selección de backend: `mode="portable"`, `mode="kernels"` o `mode="auto"` (elige kernels si puede y registra la decisión).
- Verificación de integridad de pesos mediante SHA-256 contra el hash documentado en `card.toml`.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un clasificador de imágenes puro.
- No incluye modo "thinking", visión generativa, audio ni generación de texto.

## Casos de uso

- Moderación de contenido visual: clasificar imágenes subidas por usuarios en categorías ImageNet para filtrar contenido no deseado antes de su publicación, aprovechando la latencia de milisegundos del backend `kernels`.
- Etiquetado automático de catálogos de producto: predecir la clase dominante de cada imagen de un inventario y usarla como señal auxiliar para búsqueda o recomendación, con throughput alto gracias a los 0,52 ms por imagen en GPU.
- Preprocesado en pipelines de visión por computador: usar los logits como features o como filtro previo antes de un modelo más pesado (detección, segmentación), reduciendo el coste computacional total.
- Clasificación en el borde (edge): desplegar el modelo en dispositivos con poca memoria (43 MiB de pico asignado en modo portable) para tareas de reconocimiento de escenas o categorías genéricas.
- Prototipado rápido de aplicaciones de visión: validar una idea de producto con un clasificador preentrenado y licencia permisiva antes de invertir en un modelo a medida.
- Benchmarking de hardware y kernels: comparar el rendimiento del backend `portable` frente a `kernels` en distintas GPUs para decidir la infraestructura de inferencia.
- Docencia e investigación en eficiencia de CNNs: estudiar el efecto de los residuales invertidos y los cuellos de botella lineales con un modelo pequeño y bien documentado.

## Benchmarks y rendimiento

La model card proporciona métricas de velocidad y memoria, no de precisión (top-1/top-5) sobre ImageNet.

| Modelo | Tiempo (ms) fp32 original | Original | Portable | Kernels | Aceleración kernels vs original | Aceleración kernels vs portable |
|---|---|---|---|---|---|---|
| `mobilenet_v2.tv2_in1k` | 3,6 | 5,14 | 2,95 | 0,52 | 6,9x | 5,7x |

| Modelo | Memoria pico (MiB, asignada / reservada) original | Portable | Kernels |
|---|---|---|---|
| `mobilenet_v2.tv2_in1k` | 54 / 72 | 43 / 70 | 74 / 112 |

| Modelo | Carga (s) original | Portable | Kernels | Primera llamada (s) original | Portable | Kernels |
|---|---|---|---|---|---|---|
| `mobilenet_v2.tv2_in1k` | 1,23 | 0,11 | 0,14 | 1,65 | 0,03 | 0,00 |

Protocolo: RTX 5060 Ti 16 GB, sm_120, entrada sintética 224x224. Paridad numérica: CPU float32 con max |diff| <= 0,002 frente al original; GPU float16 con mean |diff| <= 0,02 px y p99 <= 0,08 px. No se han publicado resultados de precisión (top-1, top-5) en la información disponible.

## Requisitos de hardware

- VRAM estimada: 43 MiB de pico asignado en modo `portable` y 74 MiB en modo `kernels` (224x224, fp16). El modelo es extremadamente ligero.
- GPU recomendadas: cualquier GPU NVIDIA con arquitectura soportada por los kernels precompilados (probado en RTX 5060 Ti 16 GB, sm_120). Para el backend `portable` basta con CPU o cualquier GPU con PyTorch.
- Cabe en cualquier GPU de consumo: incluso en iGPU o CPU, dado su reducido tamaño.
- Opciones de despliegue: paquete `fastforks` (`pip install fastforks`); el backend `kernels` descarga los binarios precompilados desde `huggingface.co/fastforks/kernels` en el primer uso. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplican a un clasificador de imágenes).
- Latencia y throughput: 3,0 ms por imagen en `portable` y 0,5 ms en `kernels` (GPU, 224x224). La primera llamada es prácticamente instantánea en `kernels` (0,00 s) y de 0,03 s en `portable`.

## Comparativa con modelos similares

La información proporcionada no incluye comparativas con otros modelos. Se indican alternativas de la misma categoría sin datos numéricos verificados en esta ficha:

| Modelo | Parámetros | Contexto / entrada | Licencia | Disponibilidad |
|---|---|---|---|---|
| MobileNetV2 (este repo) | no disponible | 224x224 fija | Código BSD-3-Clause; pesos sin declarar | Pesos en `download.pytorch.org`, vía `fastforks` |
| MobileNetV3 | no disponible | 224x224 | BSD-3-Clause (PyTorch Vision) | Pesos en PyTorch Vision |
| ResNet-50 | no disponible | 224x224 | BSD-3-Clause (PyTorch Vision) | Pesos en PyTorch Vision |
| EfficientNet-B0 | no disponible | 224x224 | BSD-3-Clause (PyTorch Vision) | Pesos en PyTorch Vision |

No se dispone de datos de precisión ni de latencia comparada para estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- El repositorio no contiene pesos: es solo una model card. Cualquier uso requiere descargar los pesos desde `download.pytorch.org` y confiar en la verificación SHA-256 del paquete.
- La licencia de los pesos no está declarada por el autor; la model card asume BSD-3-Clause a partir del código, pero no es una confirmación legal. Verificar antes de uso comercial.
- Modelo entrenado exclusivamente en ImageNet-1k: las 1.000 clases son genéricas y no cubren dominios especializados (medicina, industria, satélite) sin ajuste fino.
- Riesgo de sesgo heredado de ImageNet: desequilibrios demográficos y geográficos en las categorías y en las imágenes de entrenamiento.
- Riesgo de alucinación en sentido estricto no aplica (no genera texto), pero sí de clasificaciones erróneas con alta confianza en imágenes fuera de distribución.
- Entrada fija de 224x224: no admite resoluciones variables sin redimensionado y recorte central (short side 232).
- El backend `kernels` exige una GPU NVIDIA con arquitectura precompilada y un driver reciente; si no hay kernel disponible lanza `BackendUnavailableError` y no cae silenciosamente a `portable`.
- Sin soporte multilingüe, tool calling, agentes ni generación: no es adecuado para tareas de lenguaje.
- No se han publicado métricas de precisión (top-1/top-5) en la información disponible; la paridad numérica con el original no equivale a una evaluación de calidad.

## Enlaces

- Model card en HuggingFace: https://huggingface.co/fastforks/mobilenetv2
- Repositorio del paquete `fastforks`: https://github.com/kleinicke/fastforks
- Kernels del backend: https://huggingface.co/fastforks/kernels
- `card.toml` con hashes completos: https://github.com/kleinicke/fastforks/blob/main/src/fastforks/classification/models/mobilenetv2/card.toml
- Documentación de benchmarks: https://github.com/kleinicke/fastforks/blob/main/docs/benchmarks.md
- Pesos originales: https://download.pytorch.org/models/mobilenet_v2-7ebf99e0.pth
- Código original (PyTorch Vision, commit `1f1a920d685d`): https://github.com/pytorch/vision
- Licencia de PyTorch Vision: https://github.com/pytorch/vision/blob/1f1a920d685d46dfbe187934b785b7ecb7a182f2/LICENSE
