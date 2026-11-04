# fastforks/efficientvit

## Resumen

EfficientViT es una arquitectura de visión por computador para clasificación de imágenes presentada por Cai et al. (MIT Han lab) en 2023. Combina etapas basadas en MBConv con un mecanismo de atención lineal ReLU multi-escala, lo que reduce el coste computacional cuadrático de la self-attention tradicional manteniendo capacidad expresiva. El repositorio `fastforks/efficientvit` no aloja pesos: es una model card de integración que descarga los pesos originales del autor (`timm/efficientvit_b2.r288_in1k`) y los verifica mediante SHA-256.

La variante disponible es `efficientvit_b2.r288_in1k`, entrenada sobre ImageNet-1k (ILSVRC 2012) y con entrada fija de 288x288 píxeles. El modelo emite logits sobre las 1.000 clases de ImageNet. Su interés práctico radica en el backend de kernels CUDA propios (`cudnn_hacc`, `fvm_conv`, `fvm_extra`, `fvm_mb`, `fvm_r3`) que, según las mediciones del autor, aceleran la inferencia hasta 8,9x respecto al código original en fp32 y 9,9x respecto al backend portable.

El paquete `fastforks` actúa como capa de carga y validación: fija versiones, comprueba integridad de pesos y ofrece dos backends (`portable` en PyTorch puro y `kernels` con CUDA precompilado). La licencia del código y de los pesos es Apache-2.0, lo que permite uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | EfficientViT (MBConv + atención lineal ReLU multi-escala) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, entrada fija 288x288) |
| Tipos de cuantizacion | fp32 (original), fp16 (portable y kernels); no se documentan otras |
| Idiomas soportados | no aplica (clasificación de imágenes, sin texto) |
| Licencia | Apache-2.0 (código y pesos) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

EfficientViT es una red neuronal convolucional híbrida con atención. La columna vertebral alterna etapas de MBConv (bloques convolucionales invertidos con expansión y proyección, típicos de MobileNetV2/EfficientNet) con bloques de atención lineal ReLU multi-escala. La atención lineal sustituye el producto softmax(QK^T)V por una formulación con kernel ReLU que reduce la complejidad de O(n²) a O(n) respecto al número de tokens, lo que permite procesar mapas de características de mayor resolución con menos FLOPs. La variante `b2` corresponde al segundo escalón de la familia en cuanto a anchura y profundidad.

El entrenamiento se realizó sobre ImageNet-1k (ILSVRC 2012), el conjunto estándar de 1.000 clases con aproximadamente 1,28 millones de imágenes de entrenamiento. La model card no detalla el número exacto de tokens vistos, la composición del dataset más allá de ImageNet-1k, ni si se aplicaron técnicas de RLHF/DPO (no aplicables en clasificación de imágenes). Tampoco se documentan innovaciones adicionales como decodificación especulativa. La contribución técnica principal es la atención lineal ReLU multi-escala integrada en un backbone convolucional eficiente.

## Capacidades

- Clasificación de imágenes en las 1.000 clases de ImageNet-1k, con salida de logits por clase.
- Entrada RGB única, redimensionada por el lado corto a 288 y recortada al centro a 288x288.
- Salida `logits` consumible mediante `result.top(k)` para obtener las k clases más probables.
- Dos backends de ejecución: `portable` (PyTorch puro, GPU o CPU) y `kernels` (kernels CUDA propios, requiere arquitectura de GPU soportada y driver NVIDIA reciente).
- Verificación de integridad de pesos mediante SHA-256 contra el hash fijado en `card.toml`.
- No soporta tool calling, agentes, razonamiento multi-paso, texto, visión generativa, audio ni modo thinking: es un clasificador discriminativo.

## Casos de uso

- Moderación de contenido visual: clasificar imágenes entrantes en las 1.000 categorías de ImageNet para filtrar contenido no deseado antes de un pipeline de revisión; la inferencia en 1,2 ms con el backend `kernels` permite procesar lotes grandes en tiempo real.
- Etiquetado automático de catálogos de producto: asignar categorías gruesas (animales, vehículos, objetos domésticos) a imágenes de inventario; la entrada fija 288x288 y la salida de logits facilitan umbrales de confianza por clase.
- Preprocesamiento para sistemas de búsqueda visual: usar los logits o las características intermedias como señal auxiliar de filtrado antes de un modelo de embeddings más costoso.
- Clasificación en dispositivos con GPU de consumo: el pico de memoria de 85-124 MiB en fp16 permite ejecutarlo en GPUs modestas o compartir GPU con otros servicios.
- Control de calidad en líneas de producción: inspección de imágenes de cámara industrial para detectar categorías esperadas o anómalas, con latencia inferior a 12 ms por imagen en modo portable.
- Benchmarking y validación de infraestructura: servir como modelo de referencia para medir throughput y latencia de GPUs nuevas (el autor lo usa sobre RTX 5060 Ti, sm_120) y comparar backends `portable` frente a `kernels`.
- Filtrado previo en datasets de entrenamiento: descartar o etiquetar imágenes de un corpus antes de alimentar un modelo mayor, reduciendo coste de anotación manual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de precisión (top-1/top-5 en ImageNet) en la información disponible. La model card solo aporta métricas de velocidad, memoria y paridad numérica con el código original.

| Metrica | Original fp32 | Original (fp16) | Portable | Kernels |
|---|---|---|---|---|
| Tiempo por imagen (ms, 224x224) | 10,67 | 14,66 | 11,9 | 1,2 |
| Aceleración vs original fp32 | 1x | 0,73x | 0,90x | 8,9x |
| Aceleración vs portable | — | — | 1x | 9,9x |
| Memoria pico asignada (MiB) | 173 | — | 85 | 120 |
| Memoria pico reservada (MiB) | 194 | — | 124 | 190 |
| Carga del modelo (s) | 1,84 | — | 0,40 | 0,26 |
| Primera llamada (s) | 1,89 | — | 0,04 | 0,00 |

Paridad numérica con el código original: en CPU float32, diferencia máxima absoluta <= 0,002; en GPU float16 (portable y kernels), diferencia media <= 0,05 px y p99 <= 0,2 px. Mediciones realizadas sobre RTX 5060 Ti 16 GB (sm_120).

## Requisitos de hardware

- VRAM estimada: ~85 MiB asignados / 124 MiB reservados en modo portable fp16; ~120 MiB asignados / 190 MiB reservados en modo kernels. En la prueba a 288x288 el pico fue de 0,1 GiB asignados y 0,1 GiB reservados.
- GPU recomendadas: cualquier GPU NVIDIA con soporte para la arquitectura objetivo de los kernels (probado en RTX 5060 Ti, sm_120). Para el backend `portable` basta una GPU con CUDA y suficiente memoria (prácticamente cualquier GPU moderna) o incluso CPU.
- Cabe en cualquier GPU de consumo: el consumo de memoria es inferior a 200 MiB, por lo que RTX 3060, RTX 4060, RTX 4090 o superiores lo ejecutan sin problema.
- Opciones de despliegue: paquete `fastforks` (`pip install fastforks`) con `classification.load(...)`; backend `portable` (PyTorch) o `kernels` (CUDA precompilado descargado de `fastforks/kernels` en el primer uso). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a un clasificador de imágenes).
- Latencia y throughput: 1,2 ms por imagen a 224x224 con `kernels` y 11,9 ms con `portable` en RTX 5060 Ti; la primera llamada es prácticamente inmediata en `kernels` (0,00 s) y 0,04 s en `portable`. El backend `kernels` exige un kernel precompilado para la arquitectura de GPU; si no existe, lanza `BackendUnavailableError` sin fallback silencioso (con `mode="auto"` selecciona `kernels` cuando puede ejecutarlo).

## Comparativa con modelos similares

No se dispone de datos de precisión ni de parámetros de este modelo en la información proporcionada, por lo que la comparación cuantitativa con alternativas no es posible. Cualitativamente:

| Modelo | Familia | Entrada | Licencia | Pesos en el repo | Backend acelerado |
|---|---|---|---|---|---|
| efficientvit_b2.r288_in1k (este) | EfficientViT (CNN + atención lineal) | 288x288 fija | Apache-2.0 | No (enlace al autor) | Sí (kernels CUDA propios) |
| EfficientNet-B2 | CNN (MBConv) | 260x260 | Apache-2.0 (timm) | No | No documentado aquí |
| MobileNetV3 | CNN | 224x224 | Apache-2.0 | No | No documentado aquí |
| DeiT / ViT pequeños | Transformer puro | 224x224 | Apache-2.0 | No | No documentado aquí |

Los datos de rendimiento y licencia de las alternativas no están disponibles en la información proporcionada; la tabla refleja solo características generales de familia y no debe interpretarse como comparación de precisión.

## Limitaciones y advertencias

- Modelo exclusivamente discriminativo: no genera texto, no razona, no soporta tool calling ni agentes. Cualquier expectativa de uso generativo es incorrecta.
- Entrada fija de 288x288: no admite resoluciones variables sin reentrenamiento o interpolación manual; imágenes muy grandes o muy pequeñas pueden degradar la precisión.
- Solo 1.000 clases de ImageNet: el espacio de etiquetas es cerrado y genérico; para dominios específicos (medicina, industria, satélite) requiere fine-tuning.
- No se publican métricas de precisión (top-1/top-5) en la información disponible, por lo que no se puede evaluar su calidad frente a alternativas sin medirla.
- Sesgos: al entrenarse en ImageNet-1k hereda los sesgos de representación y etiquetado de ese dataset (desequilibrio de clases, sesgos geográficos y culturales en las imágenes).
- Riesgo de clasificación errónea con confianza alta en imágenes fuera de distribución; se recomienda calibrar umbrales y validar con datos propios.
- Licencia Apache-2.0 permite uso comercial, pero la model card advierte que el paquete es de "research-use" y que deben revisarse las cadenas de licencia originales antes de otros usos.
- El backend `kernels` depende de kernels precompilados por arquitectura de GPU y de un driver NVIDIA reciente; en arquitecturas no soportadas no hay fallback automático y se debe usar `portable`.
- El repositorio no aloja pesos: depende de la disponibilidad del repositorio `timm/efficientvit_b2.r288_in1k` y de la verificación SHA-256; si el autor retira o cambia los pesos, la carga fallará.
- Sin soporte multilingüe ni de texto: la ficha de idiomas no aplica y no debe interpretarse como carencia.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/fastforks/efficientvit
- Pesos del autor: https://huggingface.co/timm/efficientvit_b2.r288_in1k
- README de licencia de los pesos: https://huggingface.co/timm/efficientvit_b2.r288_in1k/blob/891530d0c5a400dd2d4549c81d433661b192abe1/README.md
- Código del paquete fastforks: https://github.com/kleinicke/fastforks
- Kernels CUDA: https://huggingface.co/fastforks/kernels
- Código original (timm, commit 0df212b369a5): https://github.com/huggingface/pytorch-image-models
- Documentación de benchmarks: https://github.com/kleinicke/fastforks/blob/main/docs/benchmarks.md
- Fichero card.toml con hashes completos: https://github.com/kleinicke/fastforks/blob/main/src/fastforks/classification/models/efficientvit/card.toml
