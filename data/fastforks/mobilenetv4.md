# fastforks/mobilenetv4

## Resumen

MobileNetV4 es una arquitectura de red neuronal convolucional para clasificación de imágenes presentada por Qin et al. en 2024. Este repositorio concreto, publicado por el usuario `fastforks`, no contiene pesos propios: es una model card que actúa como manifiesto de una variante específica (`mobilenetv4_conv_medium.e500_r256_in1k`), cuyos pesos originales residen en el repositorio de `timm` y se descargan desde ahí, verificándose contra un hash SHA-256 registrado.

El modelo resuelve la tarea de clasificación sobre ImageNet-1k (ILSVRC 2012), devolviendo logits sobre las 1.000 clases del dataset. La variante "conv medium" emplea bloques *universal inverted bottleneck* (UIB) y está entrenada durante 500 épocas con resolución de entrada de 256x256. Es relevante para desarrolladores que necesitan un clasificador de imágenes ligero, con licencia Apache-2.0 y compatible con uso comercial, dentro del ecosistema `fastforks`.

La propuesta de valor de este repositorio no es el modelo en sí (que es el de los autores originales), sino el envoltorio de ejecución: `fastforks` ofrece dos backends, `portable` (PyTorch puro) y `kernels` (kernels CUDA propios), con verificación de integridad de pesos y comprobaciones de paridad numérica frente al código original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN con universal inverted bottlenecks (MobileNetV4, variante conv-medium) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, entrada fija de imagen) |
| Tipos de cuantizacion | no disponible (se documenta ejecución en fp16 y fp32) |
| Idiomas soportados | no aplica (clasificación de imágenes, sin componente textual) |
| Licencia | Apache-2.0 (código y pesos) |
| Formato de pesos | safetensors (pesos alojados en `timm/mobilenetv4_conv_medium.e500_r256_in1k`) |

## Arquitectura y entrenamiento

La arquitectura corresponde a MobileNetV4 en su variante convolucional "medium", basada en *universal inverted bottlenecks* (UIB), según la publicación de Qin et al. (2024). El modelo opera sobre una única imagen RGB con entrada fija de 256x256: la imagen se redimensiona con lado corto 269 y se recorta centralmente a 256x256. La salida son logits sobre las 1.000 clases de ImageNet-1k.

El entrenamiento se realizó sobre ImageNet-1k (ILSVRC 2012) durante 500 épocas, según el identificador de la variante (`e500_r256_in1k`). No se detallan en la información disponible la composición exacta del dataset, el número de tokens (no aplica) ni si hubo fases de ajuste adicionales. La innovación técnica destacable en este repositorio no está en el modelo, sino en el runtime: el backend `kernels` implementa kernels CUDA propios (`cudnn_hacc`, `fvm_conv`, `fvm_extra`, `fvm_mb`, `fvm_r3`) que aceleran la inferencia frente a PyTorch portable y frente al código original.

## Capacidades

- Clasificación de imágenes sobre ImageNet-1k: devuelve logits para las 1.000 clases y permite obtener el top-k mediante `result.top(k)`.
- Ejecución en GPU con precisión fp16 por defecto y en CPU con float32.
- Dos backends de ejecución: `portable` (PyTorch) y `kernels` (kernels CUDA propios), con selección automática mediante `mode="auto"`.
- Verificación de integridad de pesos mediante SHA-256 contra el hash registrado en la model card.
- Comprobación de paridad numérica frente a las salidas doradas del código original.
- No soporta tool calling, agentes, razonamiento multi-paso, texto, audio ni visión más allá de la clasificación de una única imagen.

## Casos de uso

- Moderación de contenido visual en pipelines de subida: el modelo clasifica cada imagen entrante en 1.000 categorías con una latencia de milisegundos, lo que permite filtrar o etiquetar automáticamente grandes volúmenes sin incurrir en costes elevados de GPU.
- Etiquetado automático de catálogos de producto: dado que la salida son logits de ImageNet-1k, se puede mapear el top-k a taxonomías propias para prellenar metadatos de imágenes en sistemas de gestión de activos digitales.
- Preprocesado en sistemas de búsqueda visual: usar las predicciones como señal auxiliar o como extractor de características base para indexar imágenes antes de un re-ranking más costoso.
- Clasificación en el borde o en dispositivos con recursos limitados: el modelo cabe en GPUs de consumo (se documenta ejecución en una RTX 5060 Ti de 16 GB con 0,1 GiB de memoria pico) y su naturaleza convolucional lo hace adecuado para despliegues de baja latencia.
- Validación de pipelines de inferencia: al incluir comprobaciones de paridad numérica frente al código original, sirve como referencia para verificar que una implementación propia reproduce fielmente el modelo de `timm`.
- Prototipado rápido de aplicaciones de visión: la API de una línea (`classification.load(...)` y `model("photo.jpg")`) permite integrar un clasificador funcional en scripts de investigación sin gestionar manualmente pesos ni preprocesado.
- Benchmarking de kernels y hardware: las tablas de velocidad y memoria del repositorio permiten comparar el rendimiento de distintos backends y GPUs sobre una carga de trabajo estandarizada.

## Benchmarks y rendimiento

Los datos disponibles son de velocidad y memoria, no de precisión sobre ImageNet (no se publican métricas como top-1 o top-5 en la información proporcionada).

Clasificación sintética a 224x224, RTX 5060 Ti 16 GB (sm_120):

| Backend | Tiempo (ms) | Memoria pico asignada / reservada (MiB) | Aceleración |
|---|---|---|---|
| Original fp32 | 5,78 | 90 / 106 | referencia |
| Original (fp16) | 7,77 | no disponible | — |
| Portable | 3,91 | 54 / 86 | 5,2x vs portable (kernels) |
| Kernels | 0,75 | 87 / 124 | 7,7x vs original |

Arranque y primera llamada:

| Backend | Carga (s) | Primera llamada (s) |
|---|---|---|
| Original | 1,56 | 2,29 |
| Portable | 0,36 | 0,04 |
| Kernels | 0,22 | 0,00 |

Tamaño fijo 224x224 (tiempo ms / memoria pico asignada / reservada en MiB):

| Modo | 224x224 |
|---|---|
| Portable | 3,8 ms / 55 / 74 |
| Kernels | 0,8 ms / 87 / 112 |

Paridad con el código original: en CPU float32, diferencia máxima absoluta <= 0,002; en GPU float16, diferencia media <= 0,02 px y p99 <= 0,08 px.

## Requisitos de hardware

- VRAM estimada: 0,1 GiB de memoria pico asignada para la variante conv-medium a 256x256 en fp16 (backend portable, RTX 5060 Ti 16 GB).
- GPU recomendadas: cualquier GPU NVIDIA con soporte para el backend `portable` (PyTorch + CUDA). Para el backend `kernels` se requiere una arquitectura con kernel precompilado disponible en `fastforks/kernels` y un driver NVIDIA reciente; en su ausencia se lanza `BackendUnavailableError` sin fallback silencioso.
- Cabe holgadamente en GPUs de consumo: se ha probado en una RTX 5060 Ti de 16 GB; por el tamaño de memoria, cabría en GPUs con mucha menos VRAM.
- Opciones de despliegue: paquete `fastforks` (`pip install fastforks`) con backends `portable` y `kernels`; los pesos se obtienen del repositorio de `timm`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplican a un clasificador de imágenes de este tipo).
- Latencia y throughput: 3,8 ms por imagen a 224x224 en portable y 0,8 ms en kernels sobre RTX 5060 Ti; primera llamada de 0,04 s (portable) y 0,00 s (kernels); carga de 0,36 s y 0,22 s respectivamente.

## Comparativa con modelos similares

No se dispone en la información proporcionada de datos de otros modelos comparables (por ejemplo, otras variantes de MobileNetV4, EfficientNet o ResNet) más allá de las referencias internas del propio repositorio. La comparación directa con alternativas queda como **no disponible**.

| Modelo | Parámetros | Contexto/entrada | Licencia | Disponibilidad |
|---|---|---|---|---|
| MobileNetV4 conv-medium (este repo) | no disponible | imagen fija 256x256 | Apache-2.0 | pesos en `timm`, runtime en `fastforks` |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El repositorio no contiene pesos: depende de la disponibilidad del repositorio de `timm` y de la verificación SHA-256; si el hash no coincide, la carga fallará.
- El modelo está entrenado exclusivamente sobre ImageNet-1k, por lo que su vocabulario de salida se limita a 1.000 clases genéricas; no es adecuado para dominios especializados sin ajuste fino.
- Entrada fija de 256x256: no admite resoluciones arbitrarias sin redimensionado y recorte central, lo que puede degradar el rendimiento en objetos pequeños o imágenes con relaciones de aspecto extremas.
- No se documentan sesgos específicos, pero al derivar de ImageNet-1k hereda los sesgos de etiquetado y representación de dicho dataset.
- Riesgo de alucinación no aplica en el sentido generativo, pero sí existe riesgo de clasificaciones erróneas con alta confianza en imágenes fuera de distribución.
- El backend `kernels` requiere una GPU con kernel precompilado y driver reciente; en caso contrario no hay degradación automática a `portable`, sino un error explícito.
- La model card advierte de que las cadenas de licencia del código original se registran "tal cual" y deben revisarse antes de cualquier uso distinto de la investigación; la licencia declarada es Apache-2.0 con uso comercial permitido.
- El repositorio tiene 0 descargas y 0 likes, y la librería `fastforks` es de autoría independiente; conviene evaluar su madurez antes de usarla en producción.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/fastforks/mobilenetv4
- Pesos originales (timm): https://huggingface.co/timm/mobilenetv4_conv_medium.e500_r256_in1k
- Archivo de pesos safetensors: https://huggingface.co/timm/mobilenetv4_conv_medium.e500_r256_in1k/resolve/ad66898c045c1b5223ea3f2c0830b74cf2e75bac/model.safetensors
- Código de fastforks: https://github.com/kleinicke/fastforks
- Kernels del backend: https://huggingface.co/fastforks/kernels
- Código original (pytorch-image-models, commit `0df212b369a5`): https://github.com/huggingface/pytorch-image-models
- Documentación de benchmarks: https://github.com/kleinicke/fastforks/blob/main/docs/benchmarks.md
- Fichero de definición de la variante: https://github.com/kleinicke/fastforks/blob/main/src/fastforks/classification/models/mobilenetv4/card.toml
- Evidencia de licencia: https://huggingface.co/timm/mobilenetv4_conv_medium.e500_r256_in1k/blob/ad66898c045c1b5223ea3f2c0830b74cf2e75bac/README.md
