# fastforks/fastvit

## Resumen

FastViT es una familia de modelos de visión por computador para clasificación de imágenes presentada por Apple en 2023 (Vasu et al.). El repositorio `fastforks/fastvit` no contiene pesos propios: es una model card de un paquete de inferencia alternativo, `fastforks`, que descarga los pesos originales publicados por el autor (concretamente la variante `fastvit_sa24.apple_dist_in1k` alojada en el repositorio de timm) y los verifica mediante SHA-256.

La arquitectura combina un mecanismo de mezcla de tokens reparametrizable denominado RepMixer con atención en la última etapa de la red, lo que reduce el coste computacional de los bloques de atención manteniendo capacidad de modelado global. El modelo está entrenado sobre ImageNet-1k (ILSVRC 2012) para clasificación en 1.000 clases y produce logits como salida.

Su relevancia práctica no reside en el modelo en sí, sino en la propuesta de despliegue: el paquete `fastforks` ofrece dos backends (uno portable en PyTorch y otro con kernels CUDA propios) y reporta aceleraciones de hasta 8x frente al código original en una RTX 5060 Ti, con una latencia de 1,49 ms por imagen a 224x224 en el backend de kernels.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastViT (RepMixer reparametrizable + atención en la última etapa) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (visión; entrada fija de 256x256) |
| Tipos de cuantizacion | fp16 y fp32 (según backend); no se documentan otras |
| Idiomas soportados | no aplica (clasificación de imágenes, sin salida textual) |
| Licencia | apple-sample-code (LicenseRef-Apple-Sample-Code); código del paquete Apache-2.0 |
| Formato de pesos | safetensors (pesos del autor, no alojados en este repo) |

## Arquitectura y entrenamiento

FastViT es una red neuronal convolucional híbrida con atención. Su innovación principal es el RepMixer, un mecanismo de mezcla de tokens convolucional que puede reparametrizarse en tiempo de inferencia para fusionar operaciones y reducir latencia. La atención se reserva para la última etapa de la red, donde aporta modelado global a un coste computacional contenido. La variante concreta referenciada es `fastvit_sa24`, que incorpora atención con compuertas (self-attention) en esa etapa final.

El entrenamiento se realizó sobre ImageNet-1k (ILSVRC 2012), según indica la model card. No se especifican en la información disponible el número de tokens de entrenamiento, la composición detallada del dataset ni si hubo fases de ajuste fino con RLHF o DPO (lo cual es esperable en un modelo de clasificación de imágenes, donde esos procedimientos no aplican). Tampoco se detalla el régimen de aumentación de datos ni la estrategia de destilación, aunque el sufijo `apple_dist` sugiere que los pesos provienen de un proceso de destilación del autor original.

La innovación destacable en este repositorio no es arquitectónica sino de despliegue: el paquete `fastforks` implementa kernels CUDA propios (`cudnn_hacc`, `fvm_conv`, `fvm_extra`, `fvm_mb`, `fvm_r3`) que aceleran la inferencia entre 4,6x y 8x respecto al código original, con una paridad numérica verificada (diferencia máxima de 0,002 en CPU float32 y error medio de 0,02 px en GPU float16).

## Capacidades

- Clasificación de imágenes en 1.000 clases de ImageNet-1k, con salida de logits.
- Inferencia sobre una única imagen RGB de entrada, redimensionada (lado corto 284) y recortada al centro a 256x256.
- Dos backends de ejecución: `portable` (PyTorch, GPU o CPU) y `kernels` (kernels CUDA propios con selección automática mediante `mode="auto"`).
- Verificación de integridad de pesos mediante SHA-256 contra el hash publicado en la model card.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües, al no ser un modelo de lenguaje.
- No dispone de modo thinking, visión generativa, audio ni otras capacidades multimodales más allá de la clasificación.

## Casos de uso

- Moderación de contenido visual: clasificar imágenes subidas por usuarios en categorías ImageNet para filtrar contenido no deseado antes de su publicación, aprovechando la latencia de 1,49 ms por imagen del backend de kernels.
- Etiquetado automático de catálogos de producto: preclasificar imágenes de inventario en categorías gruesas para alimentar un pipeline de anotación humana posterior, con un coste de 81 MiB de memoria pico en modo portable.
- Preprocesamiento en pipelines de visión: usar el modelo como extractor de características o clasificador rápido en etapas previas a modelos más pesados, reduciendo el coste total del pipeline.
- Prototipado e investigación en visión: validar arquitecturas híbridas convolucional-atención con un modelo de referencia ligero que cabe en GPUs de consumo (RTX 5060 Ti 16 GB) con 0,1 GiB de memoria pico.
- Clasificación en dispositivos con recursos limitados: el modo portable con 6,88 ms por imagen a 224x224 permite ejecutar en GPU de gama media o CPU para aplicaciones de baja frecuencia.
- Benchmarking de kernels CUDA: usar las dos implementaciones (portable y kernels) como caso de prueba para medir el rendimiento de kernels personalizados frente a PyTorch nativo en arquitecturas sm_120.
- Filtrado en sistemas de captura de imágenes: clasificación en tiempo real de fotogramas en aplicaciones de cámara o vídeo, donde la latencia sub-2 ms del backend de kernels es determinante.

## Benchmarks y rendimiento

Los datos disponibles son de velocidad y memoria, no de precisión sobre ImageNet-1k (top-1/top-5 no publicados en la información proporcionada).

Clasificación sintética a 224x224 en RTX 5060 Ti 16 GB (sm_120):

| Modelo | Tiempo original fp32 (ms) | Original (ms) | Portable (ms) | Kernels (ms) | Aceleración kernels vs original | Aceleración kernels vs portable |
|---|---|---|---|---|---|---|
| `fastvit_sa24.apple_dist_in1k` | 11,92 | 16,53 | 6,88 | 1,49 | 8,0x | 4,6x |

Memoria pico (MiB, asignada / reservada):

| Modelo | Original | Portable | Kernels |
|---|---|---|---|
| `fastvit_sa24.apple_dist_in1k` | 157 / 176 | 81 / 108 | 111 / 168 |

Arranque y primera llamada:

| Modelo | Carga original (s) | Carga portable (s) | Carga kernels (s) | Primera llamada original (s) | Primera llamada portable (s) | Primera llamada kernels (s) |
|---|---|---|---|---|---|---|
| `fastvit_sa24.apple_dist_in1k` | 2,49 | 0,62 | 0,74 | 1,67 | 0,17 | 0,00 |

Paridad numérica con el código original: en CPU float32, diferencia absoluta máxima <= 0,002; en GPU float16, diferencia media <= 0,02 px y p99 <= 0,08 px.

## Requisitos de hardware

- VRAM estimada: 81 MiB de memoria pico asignada en modo portable y 111 MiB en modo kernels para una imagen de 224x224; 0,1 GiB de memoria pico asignada a 256x256 en fp16.
- GPU recomendadas: RTX 5060 Ti 16 GB (probada); cualquier GPU NVIDIA con soporte para sm_120 para el backend de kernels. El modo portable funciona en GPU y CPU.
- Cabe holgadamente en cualquier GPU de consumo con al menos 1 GB de VRAM; el cuello de botella no es la memoria sino la disponibilidad de kernels precompilados para la arquitectura concreta.
- Opciones de despliegue: paquete `fastforks` (`pip install fastforks`), con backends `portable` (PyTorch) y `kernels` (CUDA propio). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo de lenguaje.
- Latencia: 1,49 ms por imagen a 224x224 en modo kernels y 6,88 ms en modo portable; primera llamada de 0,00 s en kernels y 0,17 s en portable.
- El backend `kernels` requiere una versión reciente de driver NVIDIA y descarga el binario precompilado desde `fastforks/kernels` en el primer uso; si no existe kernel para la arquitectura, lanza `BackendUnavailableError` sin fallback silencioso.

## Comparativa con modelos similares

No se dispone en la información proporcionada de datos de otros modelos comparables (parámetros, contexto, precisión o licencia) para establecer una comparativa rigurosa. Se indica, por tanto, "no disponible".

## Limitaciones y advertencias

- La licencia de los pesos es Apple Sample Code (LicenseRef-Apple-Sample-Code), que no concede derechos de patente; debe revisarse antes de cualquier uso comercial, aunque la model card indica "commercial use: yes".
- El repositorio no aloja pesos: depende de la disponibilidad del repositorio original de timm y de que el SHA-256 siga coincidiendo.
- El backend `kernels` solo funciona en arquitecturas NVIDIA con kernel precompilado disponible; en otras plataformas hay que usar el modo portable.
- Al ser un clasificador de ImageNet-1k, hereda los sesgos de ese dataset: categorías desequilibradas, etiquetas culturalmente sesgadas y cobertura limitada a las 1.000 clases de ILSVRC 2012.
- No es un modelo generativo: no produce texto, no razona y no admite instrucciones en lenguaje natural; cualquier expectativa de uso como modelo multimodal o de lenguaje es incorrecta.
- La resolución de entrada es fija (256x256 con recorte central desde lado corto 284); imágenes con relaciones de aspecto extremas o detalles finos pueden perder información.
- No se publican métricas de precisión (top-1/top-5) en la información disponible, lo que impide evaluar su calidad frente a alternativas sin consultar el repositorio original de timm.
- El paquete se describe como de uso en investigación; conviene validar el comportamiento en el dominio concreto antes de desplegarlo en producción.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/fastforks/fastvit
- Pesos originales (timm): https://huggingface.co/timm/fastvit_sa24.apple_dist_in1k
- Licencia de los pesos: https://huggingface.co/timm/fastvit_sa24.apple_dist_in1k/blob/0b86f2b98f83274e9f03b6ddbcb3942b84efb839/README.md
- Código del paquete fastforks: https://github.com/kleinicke/fastforks
- Kernels del backend: https://huggingface.co/fastforks/kernels
- Código original (pytorch-image-models, commit 0df212b369a5): https://github.com/huggingface/pytorch-image-models
- Documentación de benchmarks: https://github.com/kleinicke/fastforks/blob/main/docs/benchmarks.md
- Definición de variantes (card.toml): https://github.com/kleinicke/fastforks/blob/main/src/fastforks/classification/models/fastvit/card.toml
