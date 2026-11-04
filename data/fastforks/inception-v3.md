# fastforks/inception-v3

## Resumen

Inception-v3 es una red neuronal convolucional para clasificación de imágenes publicada originalmente por Szegedy et al. en 2015. Esta ficha corresponde al repositorio `fastforks/inception-v3`, un contenedor de metadatos gestionado por el proyecto fastforks que no aloja pesos propios: descarga los pesos oficiales de PyTorch Vision (`inception_v3_google-0cc3c7bd.pth`) y los verifica contra un SHA-256 registrado en la model card. El modelo resuelve clasificación de imágenes en ImageNet-1k (1000 clases ILSVRC 2012) a partir de una única imagen RGB de 299x299 píxeles, devolviendo logits por clase.

La relevancia actual no está en la arquitectura, que es histórica, sino en el envoltorio de inferencia: fastforks ofrece dos backends (portable y kernels CUDA propios) con benchmarks de latencia y memoria sobre una RTX 5060 Ti 16 GB, y verifica paridad numérica frente al código original de PyTorch Vision en su commit fijado `1f1a920d685d`. Según la model card, el backend `kernels` reduce el tiempo de inferencia a 1,56 ms frente a 7,88 ms del código original en fp32, con un pico de memoria asignada de 149 MiB.

Se trata, por tanto, de una pieza de infraestructura para pipelines de clasificación de imágenes que necesitan un baseline convolucional rápido y con licencia permisiva, no de un modelo generativo ni multimodal. El repositorio no contiene pesos, solo la tarjeta y las referencias de descarga.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN con módulos Inception factorizados (Inception-v3, Szegedy et al. 2015) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entrada de imagen fija 299x299) |
| Tipos de cuantizacion | fp32 (original), fp16 (portable y kernels); no se documentan otras |
| Idiomas soportados | no aplica (clasificación de imágenes, sin texto) |
| Licencia | Código BSD-3-Clause; pesos sin licencia declarada por los autores (`bsd-3-clause-code-weights-unstated`) |
| Formato de pesos | `.pth` (PyTorch, `inception_v3_google-0cc3c7bd.pth`), descargado desde download.pytorch.org |

## Arquitectura y entrenamiento

Inception-v3 es una red convolucional profunda que introduce módulos Inception factorizados: convoluciones asimétricas (por ejemplo, 7x1 seguida de 1x7) para reducir el coste computacional manteniendo la capacidad representacional, junto con clasificadores auxiliares durante el entrenamiento. La entrada es una imagen RGB redimensionada con lado corto 342 y recorte central a 299x299 píxeles. La salida son logits sobre las 1000 clases de ImageNet-1k.

El entrenamiento se realizó sobre ImageNet-1k (ILSVRC 2012), según indica la model card. No se documentan en la información disponible detalles sobre número de tokens o épocas, composición exacta del dataset, ni uso de RLHF o DPO (no aplicables a una CNN de clasificación). La innovación destacable en este repositorio no es la arquitectura, sino la infraestructura de ejecución: kernels CUDA propios (`cudnn_hacc`, `fvm_conv`, `fvm_extra`, `fvm_mb`, `fvm_r3`) que aceleran la inferencia y un backend portable en PyTorch puro, ambos verificados contra las salidas doradas del código original con tolerancias de `max |diff| <= 0.002` en CPU fp32 y `mean |diff| <= 0.02 px` / `p99 <= 0.08 px` en GPU fp16.

## Capacidades

- Clasificación de imágenes en ImageNet-1k: devuelve logits para 1000 clases a partir de una imagen RGB de 299x299.
- Inferencia en GPU con backend `portable` (PyTorch) o `kernels` (kernels CUDA propios, requieren binario precompilado para la arquitectura de GPU y driver NVIDIA reciente).
- Selección automática de backend con `mode="auto"`, que elige `kernels` cuando puede ejecutarse y registra la decisión.
- Ejecución en CPU cuando no hay GPU disponible (backend portable).
- Salida con utilidades de post-proceso: `result.top(5)` para las cinco clases más probables y `result.backend` para inspeccionar modo, dispositivo y tipo de dato usados.
- No soporta tool calling, agentes, razonamiento multi-paso, ni capacidades multilingües: es un clasificador de imagen puro.
- No soporta visión generativa ni descripción de imágenes; solo etiquetado de clase.

## Casos de uso

- Moderación de contenido visual en pipelines de subida: clasificar imágenes entrantes en las 1000 categorías de ImageNet para filtrar contenido no permitido antes de almacenarlo, con latencia de 1,6 ms por imagen en backend `kernels`.
- Etiquetado automático de catálogos de producto: usar las top-5 clases como sugerencia de categoría en un e-commerce, aprovechando que el modelo cabe en 149 MiB de memoria asignada y puede ejecutarse en una GPU consumer.
- Preprocesado para sistemas de búsqueda visual: generar etiquetas de clase como metadatos en un índice vectorial, con throughput alto gracias al backend acelerado.
- Baseline de evaluación en investigación: comparar nuevas arquitecturas contra Inception-v3 con paridad numérica garantizada frente al código original de PyTorch Vision (tolerancia `max |diff| <= 0.002` en CPU fp32).
- Clasificación en dispositivos con GPU modesta: el modelo se ha probado en una RTX 5060 Ti 16 GB con 0,1 GiB de pico asignado en fp16 a 299x299, lo que permite desplegarlo en estaciones de trabajo con GPUs de gama media.
- Detección de regresiones en pipelines de visión: usar el backend portable como referencia y el backend kernels como objetivo de rendimiento, comparando salidas para validar cambios en kernels CUDA personalizados.
- Filtrado rápido en lotes grandes: con 1,56 ms por imagen en `kernels` sobre RTX 5060 Ti, procesar decenas de miles de imágenes por hora en una sola GPU para tareas de curación de datasets.

## Benchmarks y rendimiento

Datos de la model card, clasificación sintética a 224x224 sobre RTX 5060 Ti 16 GB (sm_120):

| Modelo | Tiempo original fp32 (ms) | Original (ms) | Portable (ms) | Kernels (ms) | Aceleración kernels vs original | Aceleración kernels vs portable |
|---|---|---|---|---|---|---|
| `inception_v3.tv_in1k` | 7,88 | 10,33 | 5,21 | 1,56 | 5,1x | 3,3x |

Memoria pico (MiB, asignada / reservada):

| Modelo | Original | Portable | Kernels |
|---|---|---|---|
| `inception_v3.tv_in1k` | 185 / 206 | 120 / 166 | 149 / 230 |

Arranque y primera llamada:

| Modelo | Carga original (s) | Carga portable (s) | Carga kernels (s) | Primera llamada original (s) | Primera llamada portable (s) | Primera llamada kernels (s) |
|---|---|---|---|---|---|---|
| `inception_v3.tv_in1k` | 1,62 | 0,28 | 0,34 | 0,40 | 0,04 | 0,00 |

Tamaño fijo, todos los modos a 224x224 (tiempo ms / memoria asignada / reservada en MiB):

| Modelo | Modo | 224x224 |
|---|---|---|
| `inception_v3.tv_in1k` | portable | 5,2 ms / 123 / 226 |
| `inception_v3.tv_in1k` | kernels | 1,6 ms / 154 / 306 |

Paridad numérica frente al código original: CPU float32 con `max |diff| <= 0.002`; GPU float16 con `mean |diff| <= 0.02 px` y `p99 <= 0.08 px`. No se han publicado resultados de precisión (top-1/top-5 en ImageNet) en la información disponible.

## Requisitos de hardware

- VRAM estimada: 0,1 GiB de pico asignado en fp16 a 299x299 (portable, RTX 5060 Ti 16 GB); 120 MiB asignados / 166 MiB reservados en portable a 224x224; 149 MiB asignados / 230 MiB reservados en kernels a 224x224.
- GPU recomendadas: cualquier GPU NVIDIA con soporte para el binario precompilado de kernels (probado en RTX 5060 Ti 16 GB, sm_120); para el backend portable, cualquier GPU CUDA compatible con PyTorch o CPU.
- Cabe en cualquier GPU consumer con al menos ~250 MiB libres; también en CPU con el backend portable.
- Opciones de despliegue: paquete `fastforks` (`pip install fastforks`), con `classification.load("inception_v3.tv_in1k")`; backend `portable` (PyTorch) o `kernels` (CUDA propio). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia: 1,56 ms por imagen en kernels y 5,21 ms en portable a 224x224 (RTX 5060 Ti); 7,88 ms en el original fp32. Primera llamada: 0,40 s (original), 0,04 s (portable), 0,00 s (kernels).
- El backend `kernels` requiere un binario precompilado para la arquitectura de GPU y un driver NVIDIA reciente; si no existe, lanza `BackendUnavailableError` sin fallback silencioso.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entrada | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Inception-v3 (fastforks) | no disponible | imagen 299x299 | BSD-3-Clause (código); pesos sin declarar | HuggingFace (solo tarjeta) + PyTorch Vision | Backend kernels CUDA propio con 1,56 ms/imagen |
| ResNet-50 (PyTorch Vision) | no disponible en la información | imagen 224x224 | BSD-3-Clause | PyTorch Vision | Alternativa convolucional clásica; sin datos de rendimiento en esta información |
| MobileNetV3 (PyTorch Vision) | no disponible en la información | imagen variable | BSD-3-Clause | PyTorch Vision | Orientado a eficiencia en dispositivos; sin datos comparativos en esta información |

No se dispone de datos de benchmarks de precisión ni de parámetros de los modelos alternativos en la información proporcionada, por lo que la comparación cuantitativa de rendimiento no está disponible.

## Limitaciones y advertencias

- El repositorio no aloja pesos: solo contiene la model card y las referencias de descarga. Cualquier uso requiere descargar los pesos desde download.pytorch.org y verificar el SHA-256.
- La licencia de los pesos no está declarada por los autores; la model card indica explícitamente `weights-unstated` y asume BSD-3-Clause a partir del código. Es necesario verificar la licencia antes de uso comercial.
- El modelo está entrenado exclusivamente en ImageNet-1k, con 1000 clases; no cubre categorías fuera de ese conjunto y hereda los sesgos de etiquetado y representación de ILSVRC 2012.
- No es un modelo generativo: no produce descripciones, no responde a prompts y no soporta tool calling ni agentes.
- La entrada es fija a 299x299 con redimensionado de lado corto 342 y recorte central; imágenes con relaciones de aspecto extremas o resoluciones muy bajas pueden degradar la precisión.
- El backend `kernels` depende de binarios precompilados por arquitectura de GPU y de un driver NVIDIA reciente; en arquitecturas no cubiertas falla con `BackendUnavailableError` sin fallback automático.
- Los benchmarks se han medido en una única GPU (RTX 5060 Ti 16 GB, sm_120) y con entradas sintéticas; el rendimiento en otros hardware puede diferir.
- No se han publicado métricas de precisión (top-1/top-5) en la información disponible, por lo que no se puede validar la calidad de clasificación con datos de esta ficha.
- Riesgo de alucinación no aplica en el sentido generativo, pero sí de clasificaciones erróneas con alta confianza en clases visualmente próximas.

## Enlaces

- HuggingFace: https://huggingface.co/fastforks/inception-v3
- Repositorio fastforks: https://github.com/kleinicke/fastforks
- Kernels backend: https://huggingface.co/fastforks/kernels
- Código original (PyTorch Vision, commit fijado): https://github.com/pytorch/vision/tree/1f1a920d685d46dfbe187934b785b7ecb7a182f2
- Licencia del código original: https://github.com/pytorch/vision/blob/1f1a920d685d46dfbe187934b785b7ecb7a182f2/LICENSE
- Pesos: https://download.pytorch.org/models/inception_v3_google-0cc3c7bd.pth
- `card.toml` con hashes completos: https://github.com/kleinicke/fastforks/blob/main/src/fastforks/classification/models/inception_v3/card.toml
- Documentación de benchmarks: https://github.com/kleinicke/fastforks/blob/main/docs/benchmarks.md
- Paper original (Szegedy et al. 2015): no disponible en la información proporcionada
