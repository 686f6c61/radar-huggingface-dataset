# fastforks/vit

## Resumen

Vision Transformer (ViT) en la variante `vit_base_patch16_224.augreg2_in21k_ft_in1k`, empaquetada y distribuida por el proyecto fastforks. Se trata de un modelo de clasificación de imágenes basado en la arquitectura Transformer aplicada a visión propuesta por Dosovitskiy et al. en 2020: la imagen se divide en parches de 16x16 píxeles, se proyectan linealmente y se procesan con un encoder Transformer pre-norm junto con un token de clase que agrega la representación final. El modelo original procede del repositorio `timm` (pytorch-image-models) de Hugging Face y se entrena sobre ImageNet-21k/22k y posteriormente se ajusta sobre ImageNet-1k.

El repositorio `fastforks/vit` no aloja pesos: es únicamente una model card que describe la integración del modelo dentro de la librería fastforks. La librería descarga los pesos del autor original (timm) y los verifica contra un SHA-256 registrado en la model card. Ofrece dos backends: `portable` (PyTorch puro en GPU o CPU) y `kernels` (kernels CUDA propios de fastforks), con mejoras de velocidad medidas de hasta 3,1x frente al código original en fp32.

Es relevante ahora porque ilustra un patrón de empaquetado reproducible y verificado por hash para modelos de visión clásicos, con benchmarks de latencia y memoria explícitos sobre hardware consumer (RTX 5060 Ti 16 GB). El modelo en sí es un ViT-Base estándar de 86M de parámetros para clasificación de imágenes en 1000 clases de ImageNet-1k, con entrada fija de 224x224.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision Transformer (ViT-Base), parches 16x16, encoder Transformer pre-norm, class token |
| Parámetros totales | 86M (ViT-Base, valor estándar de la arquitectura; no confirmado explícitamente en la model card) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, entrada fija 224x224) |
| Tipos de cuantización | fp32 (original), fp16 (por defecto en portable y kernels); no se documentan otras cuantizaciones |
| Idiomas soportados | no disponible (modelo de clasificación de imágenes) |
| Licencia | Apache-2.0 (código y pesos) |
| Formato de pesos | safetensors (archivo del autor `model.safetensors`, verificado por SHA-256) |

## Arquitectura y entrenamiento

Vision Transformer con división de la imagen en parches de 16x16 píxeles, proyección lineal de cada parche, embeddings posicionales y un encoder Transformer con normalización pre-norm. Un token de clase adicional agrega la información global y se utiliza para la cabeza de clasificación. La variante empaquetada es `vit_base_patch16_224.augreg2_in21k_ft_in1k`, que corresponde al entrenamiento con aumentación de datos (AugReg) sobre ImageNet-21k/22k y ajuste fino posterior sobre ImageNet-1k (ILSVRC 2012).

Los datos de entrenamiento documentados son ImageNet-21k / ImageNet-22k (release completa de ImageNet, otoño de 2011) e ImageNet-1k para el ajuste fino. No se detalla en la información disponible el número exacto de tokens, la composición del dataset ni si hubo etapas de RLHF/DPO (no aplicables a un clasificador de imágenes supervisado). La innovación técnica del empaquetado fastforks no está en la arquitectura sino en la infraestructura: kernels CUDA propios (`cudnn_hacc`, `fvm_conv`, `fvm_extra`, `fvm_mb`, `fvm_r3`) que aceleran la inferencia, verificación por SHA-256 de los pesos del autor y paridad numérica comprobada contra las salidas doradas del código original (CPU fp32: max |diff| <= 0.002; GPU fp16: mean |diff| <= 0.02 px, p99 <= 0.08 px).

## Capacidades

- Clasificación de imágenes en las 1000 clases de ImageNet-1k; salida como logits.
- Entrada de una única imagen RGB con tamaño fijo 224x224 (redimensionado con lado corto 248 y recorte central).
- Inferencia en GPU (CUDA) o CPU mediante el backend `portable` de PyTorch.
- Backend `kernels` con kernels CUDA precompilados por arquitectura de GPU, descargados desde `fastforks/kernels`.
- Selección automática de backend con `mode="auto"` (elige `kernels` si puede ejecutarse y registra la decisión).
- API de alto nivel: `result.top(5)` devuelve las 5 clases más probables y `result.backend` informa del backend, dispositivo y dtype utilizados.
- No soporta tool calling, agentes, razonamiento multi-paso, generación de texto, código, matemáticas, visión generativa, audio ni capacidades multilingües: es exclusivamente un clasificador de imágenes.

## Casos de uso

- Moderación de contenido visual: clasificar imágenes subidas por usuarios en categorías ImageNet para filtrar contenido no deseado antes de su publicación; el modelo cabe en 0,2-0,3 GiB de memoria en fp16 y responde en 1,8-3,0 ms por imagen en una RTX 5060 Ti.
- Etiquetado automático de catálogos de producto: preasignar categorías a imágenes de e-commerce usando las 1000 clases de ImageNet como taxonomía base, con verificación por hash de los pesos para garantizar reproducibilidad en producción.
- Preprocesado en pipelines de visión: usar el ViT como extractor de logits o features en etapas previas de sistemas más complejos (detección, segmentación, búsqueda visual) donde se necesita un clasificador rápido y ligero.
- Investigación en visión por computador: servir como baseline reproducible de ViT-Base para comparar experimentos propios, con paridad numérica documentada frente al código original de timm.
- Despliegue en hardware consumer: ejecutar clasificación en tiempo real en una GPU de gama media (RTX 5060 Ti 16 GB) o incluso en CPU, gracias a la baja huella de memoria (205-316 MiB asignados en los benchmarks).
- Benchmarking de kernels y backends: comparar el rendimiento del backend `portable` frente a `kernels` en distintas arquitecturas de GPU para evaluar el impacto de los kernels CUDA de fastforks en cargas de clasificación.
- Prototipado rápido con `pip install fastforks`: cargar el modelo en 0,51-0,73 s (frente a 2,49 s del código original) y obtener la primera inferencia prácticamente sin coste de arranque.

## Benchmarks y rendimiento

Datos de velocidad y memoria sobre RTX 5060 Ti 16 GB (sm_120), clasificación sintética 224x224:

| Modelo | Tiempo original fp32 (ms) | Original (fp16) (ms) | Portable (ms) | Kernels (ms) | Speed-up kernels vs original | Speed-up kernels vs portable | Memoria pico original (MiB, asignada/reservada) | Portable (MiB) | Kernels (MiB) |
|---|---|---|---|---|---|---|---|---|---|
| `vit_base_patch16_224.augreg2_in21k_ft_in1k` | 6,33 | 5,48 | 3,02 | 1,78 | 3,1x | 1,7x | 531 / 548 | 205 / 390 | 302 / 456 |

Arranque y primera llamada:

| Modelo | Carga original (s) | Carga portable (s) | Carga kernels (s) | Primera llamada original (s) | Primera llamada portable (s) | Primera llamada kernels (s) |
|---|---|---|---|---|---|---|
| `vit_base_patch16_224.augreg2_in21k_ft_in1k` | 2,49 | 0,73 | 0,51† | 0,28 | 0,00 | 0,00 |

Tamaño fijo, todos los modos (tiempo ms / memoria pico asignada / reservada en MiB):

| Modelo | Modo | 224x224 |
|---|---|---|
| `vit_base_patch16_224.augreg2_in21k_ft_in1k` | portable | 2,9 ms / 214 / 338 |
| `vit_base_patch16_224.augreg2_in21k_ft_in1k` | kernels | 1,8 ms / 316 / 418 |

No se han publicado resultados de benchmarks de precisión (top-1, top-5 en ImageNet) en la información disponible. La model card solo documenta paridad numérica frente al código original (CPU fp32: max |diff| <= 0,002; GPU fp16: mean |diff| <= 0,02 px, p99 <= 0,08 px).

## Requisitos de hardware

- VRAM estimada para inferencia: 205-316 MiB de memoria pico asignada en fp16; 390-456 MiB reservada por el allocator de PyTorch.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA reciente; los benchmarks se realizaron en RTX 5060 Ti 16 GB (sm_120). El backend `kernels` requiere un kernel precompilado para la arquitectura de la GPU, descargado desde `fastforks/kernels` en el primer uso.
- Cabe en GPU consumer: sí, en cualquier GPU consumer con al menos ~0,5 GiB de VRAM libre; también funciona en CPU con el backend `portable`.
- Opciones de despliegue: librería `fastforks` (`pip install fastforks`), con backends `portable` (PyTorch) y `kernels` (CUDA). No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplicables a un clasificador de imágenes de este tipo).
- Latencia y throughput: 1,78 ms por imagen con `kernels` y 3,02 ms con `portable` en RTX 5060 Ti; carga del modelo en 0,51-0,73 s; primera llamada prácticamente instantánea (0,00 s). El throughput no se especifica explícitamente, pero a 1,78 ms/imagen equivale a unas 562 imágenes/s en esa GPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Entrada | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `vit_base_patch16_224.augreg2_in21k_ft_in1k` (fastforks) | 86M (ViT-Base) | 224x224 fijo | no aplica | 1,78 ms/img en RTX 5060 Ti (kernels); precisión no documentada en la card | Apache-2.0 | Pesos en timm; empaquetado en fastforks |
| ViT-Base original (timm, `vit_base_patch16_224`) | 86M | 224x224 | no aplica | 5,48 ms/img fp16 en RTX 5060 Ti (código original) | Apache-2.0 | Hugging Face (timm) |
| Otros clasificadores ImageNet (p. ej. ResNet-50) | ~25M | 224x224 | no aplica | no disponible en esta información | variable | amplia |

No se dispone de datos de precisión (top-1/top-5) en la información proporcionada para establecer una comparación cuantitativa de calidad frente a alternativas; la comparación anterior se limita a latencia y memoria medidas en el mismo hardware.

## Limitaciones y advertencias

- Es un clasificador cerrado de 1000 clases de ImageNet-1k; no genera texto, no responde preguntas y no admite instrucciones en lenguaje natural.
- Entrada fija de 224x224: no soporta resoluciones variables ni imágenes de mayor tamaño sin redimensionado y recorte central, lo que puede degradar la clasificación de objetos pequeños o con relaciones de aspecto extremas.
- No se documentan sesgos específicos, pero al entrenarse sobre ImageNet-21k/1k hereda los sesgos de etiquetado y de representación de ese dataset (clases desbalanceadas, categorías culturalmente sesgadas).
- Riesgo de alucinación en el sentido de predicciones de alta confianza sobre clases incorrectas cuando la imagen queda fuera de la distribución de ImageNet; no se documentan calibraciones ni umbrales de confianza.
- Licencia Apache-2.0 para código y pesos, con uso comercial permitido según la tabla de variantes de la model card; aun así, la card advierte que es un paquete de uso en investigación y recomienda revisar las cadenas de licencia originales antes de otros usos.
- El backend `kernels` requiere un kernel precompilado para la arquitectura de GPU concreta y un driver NVIDIA reciente; si no existe, lanza `BackendUnavailableError` y no hace fallback silencioso a `portable`.
- El repositorio no aloja pesos: depende de la disponibilidad del repositorio del autor (timm) y de la verificación SHA-256; una alteración del archivo remoto rompería la carga.
- No se documentan límites de idioma porque el modelo no procesa texto.
- No se han publicado métricas de precisión en la información disponible, por lo que no es posible garantizar un nivel de exactitud concreto en producción sin evaluarlo previamente.

## Enlaces

- Model card en Hugging Face: https://huggingface.co/fastforks/vit
- Repositorio de código fastforks: https://github.com/kleinicke/fastforks
- Kernels del backend: https://huggingface.co/fastforks/kernels
- Pesos del autor (timm): https://huggingface.co/timm/vit_base_patch16_224.augreg2_in21k_ft_in1k
- Código original (pytorch-image-models, commit `0df212b369a5`): https://github.com/huggingface/pytorch-image-models
- Documentación de benchmarks: https://github.com/kleinicke/fastforks/blob/main/docs/benchmarks.md
- Definición de la variante (card.toml): https://github.com/kleinicke/fastforks/blob/main/src/fastforks/classification/models/vit/card.toml
- Evidencia de licencia del autor: https://huggingface.co/timm/vit_base_patch16_224.augreg2_in21k_ft_in1k/blob/063c6c38a5d8510b2e57df480445e94b231dad2c/README.md
- Paper original de ViT (Dosovitskiy et al. 2020): no disponible en la información proporcionada.
