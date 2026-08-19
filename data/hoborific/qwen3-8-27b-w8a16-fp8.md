# hoborific/Qwen3.8-27B-W8A16-FP8

## Resumen

`hoborific/Qwen3.8-27B-W8A16-FP8` es una version cuantizada del modelo multimodal `Qwen/Qwen3.8-27B`, desarrollada por el usuario hoborific. Se trata de una cuantizacion offline W8A16 FP8 en formato `compressed-tensors` `float-quantized`, con pesos en `float8_e4m3fn` y escalas simetricas por canal de salida, mientras que las activaciones se mantienen en bf16/fp16. El modelo base pertenece a la familia Qwen3.5 (tag `qwen3_5`) y es de tipo image-text-to-text, por lo que conserva capacidades de comprension visual.

El objetivo principal de esta cuantizacion es reducir la huella de memoria del modelo de 27,78 B parametros manteniendo la fidelidad, con un esquema de cuantizacion per-channel con busqueda de clip MSE que, segun el autor, ofrece mejor SNR que la cuantizacion online per-tensor de vLLM. El modelo esta disenado especificamente para su ejecucion en vLLM sobre Intel XPU (kernel `XPUW8A16FP8LinearKernel`) y NVIDIA CUDA (SM75+), y no es compatible con ROCm, CPU ni TPU.

La relevancia actual radica en que permite desplegar un modelo multimodal de 27,8 B parametros con cuantizacion FP8 en plataformas Intel XPU, un backend que tradicionalmente tiene menos soporte de kernels optimizados que CUDA. El repositorio tiene 0 descargas y 0 likes, lo que indica que es un modelo reciente y aun sin validacion comunitaria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) basada en Qwen3.5 (Qwen3.8-27B) |
| Parametros totales | 27.781.427.952 (27,78 B) |
| Parametros activos | no disponible (la model card menciona routers/experts en la lista de exclusion de cuantizacion, lo que sugiere componentes MoE en el modelo base, pero no se especifica el numero) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | W8A16 FP8 (float8_e4m3fn, per-output-channel symmetric scales) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors (compressed-tensors float-quantized) |

## Arquitectura y entrenamiento

El modelo es una cuantizacion offline de `Qwen/Qwen3.8-27B` realizada con la libreria `compressed-tensors` de Neural Magic, en formato `float-quantized`. Los pesos se almacenan en `float8_e4m3fn` con escalas simetricas por canal de salida. El proceso de cuantizacion calcula la escala inicial de cada fila de salida como `amax / 448` y la refina mediante una busqueda de clip MSE sobre aproximadamente 9 fracciones de clip (0,8–1,0× amax), seleccionando la escala con menor error por fila. Los pesos se cuantizan con redondeo al mas cercano y saturacion.

Solo se cuantizan las proyecciones lineales 2D: atencion (q/k/v/o) y MLP (gate/up/down). Las embeddings, normas, lm_head, routers/experts y el vision tower permanecen en bf16 y figuran en la lista `ignore` del checkpoint, de modo que vLLM no los modifica. La mencion de routers/experts en dicha lista sugiere que el modelo base incorpora componentes de arquitectura MoE, aunque no se dispone de detalles adicionales sobre el entrenamiento del modelo base en la informacion proporcionada.

## Capacidades

- Procesamiento multimodal imagen-texto: el modelo base es image-text-to-text, por lo que puede procesar entradas visuales y textuales.
- Generacion de texto conversacional: tag `conversational` en el repositorio.
- Cuantizacion W8A16 FP8: reduce la huella de memoria de los pesos frente al formato bf16 original.
- Compatibilidad con vLLM: tag `endpoints_compatible`, integrable en infraestructuras de servicion existentes.
- Soporte de vision tower en bf16: las capacidades de vision del modelo base se conservan intactas al no cuantizar esta parte.
- Despliegue en Intel XPU: kernel dedicado `XPUW8A16FP8LinearKernel` para plataformas Intel.

## Casos de uso

- Servicion multimodal en Intel XPU: el modelo esta disenado especificamente para el kernel `XPUW8A16FP8LinearKernel` de vLLM, permitiendo ejecutar un modelo de 27,8 B parametros con vision en hardware Intel XPU, un backend con escaso soporte de kernels optimizados.
- Servicion multimodal en NVIDIA CUDA: en GPUs Turing o posteriores (SM75+), vLLM utiliza `HummingFP8ScaledMMLinearKernel` si el paquete `humming` esta instalado, o `MarlinFP8ScaledMMLinearKernel` como alternativa, ofreciendo flexibilidad de despliegue en hardware NVIDIA.
- Reduccion de huella de memoria en produccion: la cuantizacion W8A16 FP8 reduce el consumo de VRAM frente al modelo en bf16, permitiendo servir el modelo en GPUs con menos memoria o aumentar el tamano de lote en infraestructuras existentes.
- Aplicaciones de vision-language: al mantener el vision tower en bf16, el modelo conserva las capacidades de comprension de imagenes del modelo base, util para tareas de captioning, VQA o analisis de documentos visuales.
- Integracion en pipelines de vLLM existentes: al ser `endpoints_compatible`, puede desplegarse como endpoint de inferencia en infraestructuras que ya usan vLLM, sin cambios en la interfaz de servicion.
- Investigacion sobre cuantizacion per-channel FP8: el esquema con busqueda de clip MSE por canal ofrece mejor SNR que la cuantizacion online per-tensor de vLLM, lo que lo convierte en un caso de estudio util para trabajos sobre cuantizacion de modelos multimodales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Tamano del repositorio: 36,4 GB en formato safetensors.
- Parametros totales: 27,78 B, lo que requiere una GPU con VRAM suficiente para alojar los pesos cuantizados mas las activaciones en bf16/fp16.
- VRAM estimada: no disponible (depende de la cuantizacion, el tamano de lote y la longitud de contexto).
- Plataformas soportadas: Intel XPU (kernel `XPUW8A16FP8LinearKernel`, destino principal) y NVIDIA CUDA SM75+ (Turing o posterior, kernels `HummingFP8ScaledMMLinearKernel` o `MarlinFP8ScaledMMLinearKernel`).
- No soportado: ROCm, CPU y TPU. vLLM no dispone de kernels W8A16-FP8 para estos backends, por lo que la carga fallara con un error de kernel no encontrado.
- Opciones de despliegue: vLLM con soporte de `compressed-tensors`.

## Comparativa con modelos similares

No disponible. No se dispone de informacion suficiente sobre modelos comparables en los datos proporcionados.

## Limitaciones y advertencias

- Compatibilidad restringida: solo funciona en Intel XPU y NVIDIA CUDA (SM75+); no es compatible con ROCm, CPU ni TPU en vLLM.
- Licencia no documentada: no se indica la licencia del modelo, lo que puede limitar su uso comercial o en entornos con requisitos legales estrictos.
- Idiomas no documentados: no se especifican los idiomas soportados por el modelo.
- Sin benchmarks publicados: no hay datos de rendimiento que permitan evaluar la degradacion introducida por la cuantizacion.
- Adopcion nula: el repositorio tiene 0 descargas y 0 likes, por lo que no hay validacion comunitaria ni informes de uso en produccion.
- Cuantizacion parcial: las activaciones se mantienen en bf16/fp16, por lo que la reduccion de memoria es parcial (solo en pesos) y el ahorro de VRAM es menor que en esquemas W8A8.
- Riesgo de degradacion en tareas multimodales: aunque el vision tower no se cuantiza, la cuantizacion de las proyecciones de atencion y MLP puede afectar al rendimiento en tareas que requieren alta precision numerica.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/hoborific/Qwen3.8-27B-W8A16-FP8
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- compressed-tensors: https://github.com/neuralmagic/compressed-tensors
