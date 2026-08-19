# hoborific/Omega-Convergence-27B-v1.0-W8A16-FP8

## Resumen

Omega-Convergence-27B-v1.0-W8A16-FP8 es una versión cuantizada del modelo base ReadyArt/Omega-Convergence-27B-v1.0, desarrollada por el usuario hoborific. El modelo base, del que no se proporcionan detalles adicionales en la documentación disponible, está etiquetado como `qwen3_5` y `image-text-to-text`, lo que sugiere una arquitectura multimodal basada en la familia Qwen3.5 con capacidad de procesar tanto imágenes como texto. La cuantización aplicada reduce el tamaño de los pesos a FP8 (formato e4m3) manteniendo las activaciones en bf16/fp16, lo que permite desplegar el modelo en entornos con memoria de GPU limitada.

Esta versión está específicamente optimizada para su uso con vLLM, con kernels dedicados para Intel XPU y NVIDIA CUDA (SM75+). La relevancia de esta ficha radica en que ofrece una alternativa cuantizada de un modelo de 27.800 millones de parámetros, pensada para inferencia eficiente en hardware heterogéneo, aunque su adopción está condicionada a la disponibilidad de kernels W8A16-FP8 en el backend de despliegue.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (etiquetado como `qwen3_5`, multimodal imagen-texto) |
| Parametros totales | 27.781.427.952 (27,8B) |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | W8A16 FP8 (pesos en `float8_e4m3fn`, activaciones en bf16/fp16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (compressed-tensors, `float-quantized`) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura del modelo base, el proceso de entrenamiento, el dataset utilizado ni las técnicas de alineación (RLHF, DPO, etc.). La única información técnica disponible se refiere al proceso de cuantización offline realizado por el autor de esta versión:

- La cuantización se aplica únicamente a las capas lineales 2D (proyecciones de atención q/k/v/o y MLP gate/up/down), mientras que embeddings, normas, lm_head, routers/experts y la torre de visión se mantienen en bf16 y se incluyen en la lista `ignore` del checkpoint para que vLLM no las modifique.
- Para cada fila de salida de cada capa lineal se calcula una escala a partir de `amax / 448`, refinada mediante una búsqueda de error cuadrático medio (MSE) sobre aproximadamente 9 fracciones de clip (0.8–1.0× amax), seleccionando la escala con menor error por fila.
- Los pesos se cuantizan como `q = e4m3(w / scale)` con redondeo al más cercano y saturación.
- Según el autor, este esquema por canal y con clipping proporciona una mejor relación señal-ruido que la cuantización online per-tensor de vLLM (`--quantization fp8`).

## Capacidades

No se han publicado capacidades específicas del modelo base en la información proporcionada. Basándose en las etiquetas de HuggingFace (`image-text-to-text`, `qwen3_5`, `conversational`), se puede inferir que el modelo es multimodal y capaz de procesar imágenes y texto, además de mantener conversaciones. Sin embargo, no se confirman detalles como:

- Generación de texto y razonamiento: no verificado.
- Soporte de tool calling / function calling: no verificado.
- Soporte de agentes y multi-step reasoning: no verificado.
- Capacidades multilingües: no disponibles.
- Modo de pensamiento extendido (thinking mode): no disponible.

Se recomienda consultar la documentación del modelo base para obtener una lista completa de capacidades.

## Casos de uso

Dado que no se dispone de información sobre el modelo base, no es posible enumerar casos de uso concretos y verificados. No obstante, al tratarse de un modelo multimodal de 27,8B parámetros cuantizado en FP8, los casos de uso típicos podrían incluir:

- Despliegue de asistentes conversacionales con entrada de imágenes en entornos con GPUs de 40 GB o 48 GB (p. ej., A100, L40S), aprovechando la cuantización para reducir el consumo de memoria.
- Integración en pipelines de vLLM sobre Intel XPU o NVIDIA CUDA, donde los kernels W8A16-FP8 están disponibles.
- Prototipado de aplicaciones de visión-lenguaje (VQA, captioning, etc.) cuando el modelo base esté documentado y sus capacidades sean conocidas.

Hasta que no se publique información adicional sobre el modelo base, cualquier caso de uso debe considerarse especulativo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de datos sobre MMLU, HumanEval, GSM8K ni otras métricas estándar para este modelo cuantizado ni para su versión base.

## Requisitos de hardware

- VRAM estimada: el repositorio pesa 36,4 GB, por lo que se necesitará al menos esa cantidad de memoria para cargar los pesos, más overhead de activaciones y buffers. En la práctica, se recomienda una GPU con 40 GB o más (p. ej., A100 40GB, A100 80GB, L40S, H100).
- GPU recomendadas: NVIDIA CUDA (SM75+ y posteriores, es decir, Turing o más nuevas) e Intel XPU. No compatible con ROCm, CPU o TPU.
- Opciones de despliegue: vLLM es el backend principal. Se requieren los kernels `XPUW8A16FP8LinearKernel` (Intel XPU) o `HummingFP8ScaledMMLinearKernel` / `MarlinFP8ScaledMMLinearKernel` (NVIDIA CUDA). Para el kernel `HummingFP8` es necesario instalar el paquete `humming`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables. Dado que el modelo base no está documentado en la información proporcionada, no es posible establecer una comparativa fiable con otras alternativas de la misma categoría (por ejemplo, otros modelos multimodales de 27B cuantizados). Se recomienda consultar el repositorio del modelo base para obtener referencias.

## Limitaciones y advertencias

- Licencia no especificada: no se indica la licencia del modelo base ni de esta versión cuantizada, lo que impide conocer las restricciones de uso comercial y modificación.
- Idiomas no especificados: no se conoce qué idiomas soporta el modelo, lo que limita su uso en aplicaciones multilingües.
- Soporte de plataforma restringido: la cuantización W8A16-FP8 solo funciona con vLLM en Intel XPU y NVIDIA CUDA (SM75+). No es compatible con ROCm, CPU ni TPU, y cargar el modelo en estos backends producirá un error de kernel.
- Dependencia de kernels específicos: en NVIDIA CUDA, el kernel `HummingFP8ScaledMMLinearKernel` requiere la instalación del paquete `humming`; sin él, se usará `MarlinFP8ScaledMMLinearKernel`, que puede tener un rendimiento diferente.
- Falta de documentación del modelo base: no se conocen sesgos, riesgos de alucinación ni limitaciones de contexto, ya que no se ha publicado información sobre el entrenamiento o la evaluación del modelo original.

## Enlaces

- Repositorio de la versión cuantizada: https://huggingface.co/hoborific/Omega-Convergence-27B-v1.0-W8A16-FP8
- Modelo base: https://huggingface.co/ReadyArt/Omega-Convergence-27B-v1.0
- Biblioteca compressed-tensors: https://github.com/neuralmagic/compressed-tensors
