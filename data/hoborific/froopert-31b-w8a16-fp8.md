# hoborific/Froopert-31B-W8A16-FP8

## Resumen

Froopert-31B-W8A16-FP8 es una versión cuantizada del modelo base Nimbz/Froopert-31B, desarrollada por el usuario hoborific. El modelo utiliza un esquema de cuantización W8A16 en formato FP8 (float8_e4m3fn) mediante la librería compressed-tensors de Neural Magic, con el objetivo de reducir el footprint de memoria y acelerar la inferencia manteniendo una calidad aceptable. Está pensado principalmente para despliegue en vLLM sobre hardware Intel XPU, aunque también es compatible con GPUs NVIDIA.

El modelo base Froopert-31B pertenece a la familia Gemma 4, con una arquitectura densa de aproximadamente 31.273 millones de parámetros. La cuantización offline aplica escalas por canal de salida con búsqueda de clip por error cuadrático medio, lo que según el autor ofrece mejor relación señal-ruido que la cuantización online per-tensor de vLLM. Es relevante porque permite ejecutar un modelo de 31B en hardware con VRAM limitada, como tarjetas consumer o aceleradores XPU, sin sacrificar demasiada precisión.

El repositorio incluye los pesos en formato safetensors con un tamaño total de 33,3 GB, y la licencia no está disponible en la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Gemma 4) |
| Parametros totales | 31.273.088.876 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | W8A16 FP8 (float8_e4m3fn) con escalas por canal |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (compressed-tensors, formato float-quantized) |

## Arquitectura y entrenamiento

El modelo base Froopert-31B es un transformer denso de la familia Gemma 4 con aproximadamente 31.273 millones de parámetros. La arquitectura incluye atención multi-cabeza estándar, MLP con gate/up/down projections, embeddings, capas de normalización, y una torre de visión para procesamiento de imágenes (pipeline image-text-to-text). No se dispone de información sobre el número de tokens de entrenamiento, composición del dataset ni técnicas de alineación como RLHF o DPO.

La cuantización se realizó offline sobre las proyecciones lineales 2D (atención q/k/v/o y MLP gate/up/down). Cada fila de salida recibe su propia escala calculada a partir de `amax / 448`, refinada mediante una búsqueda de clip por error cuadrático medio sobre aproximadamente 9 fracciones de clip (0,8–1,0× amax). Los pesos se cuantizan con redondeo al más cercano y saturación. Embeddings, normas, lm_head, routers/experts y la torre de visión permanecen en bf16 y se listan en la lista `ignore` del checkpoint para que vLLM no los modifique.

## Capacidades

- Generación de texto conversacional de propósito general.
- Procesamiento de entrada multimodal imagen-texto (pipeline image-text-to-text).
- Inferencia cuantizada en FP8 con soporte para vLLM en Intel XPU y NVIDIA CUDA.
- Compatible con el ecosistema transformers de Hugging Face.
- No se dispone de información sobre tool calling, function calling, capacidades de agente, razonamiento multi-paso ni modo thinking.

## Casos de uso

- Despliegue en Intel XPU: el kernel `XPUW8A16FP8LinearKernel` está diseñado específicamente para aceleradores Intel, permitiendo ejecutar un modelo de 31B en hardware alternativo a NVIDIA.
- Inferencia en GPUs NVIDIA consumer: con soporte para kernels `MarlinFP8ScaledMMLinearKernel` o `HummingFP8ScaledMMLinearKernel` (si se instala el paquete `humming`), es viable en tarjetas con 24-48 GB de VRAM.
- Prototipado y experimentación con modelos cuantizados: el formato compressed-tensors permite cargar el modelo con transformers para evaluar el impacto de la cuantización W8A16 en la calidad de salida.
- Reducción de costes de inferencia: al usar pesos FP8, se reduce el ancho de banda de memoria requerido, lo que puede mejorar el throughput en servidores con GPUs Turing o más recientes.
- Integración en pipelines de visión-lenguaje: al ser un modelo image-text-to-text, puede usarse para tareas que combinan entrada visual y textual.
- Evaluación de esquemas de cuantización per-channel con búsqueda de clip: el método documentado puede servir de referencia para otros proyectos de cuantización.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 33,3 GB en disco, por lo que se recomienda al menos 34-40 GB de VRAM para cargar el modelo completo en FP8. Con cuantización adicional o offloading parcial podría reducirse, pero no hay datos disponibles.
- GPUs recomendadas: NVIDIA RTX 4090 (24 GB) no es suficiente para el modelo completo; se necesitan GPUs con 48 GB o más (A6000, A100 40/80 GB, H100) o configuraciones multi-GPU. También es compatible con Intel XPU.
- Compatibilidad con consumer GPU: no cabe en tarjetas consumer de 24 GB o menos sin técnicas de offloading o cuantización adicional.
- Opciones de despliegue: vLLM es el runtime objetivo. También se puede cargar con transformers, aunque la cuantización está orientada a vLLM.
- Latencia y throughput: no se dispone de datos medidos.
- Backends no soportados: ROCm, CPU y TPU no tienen kernels W8A16-FP8 en vLLM, por lo que la carga fallará con un error de kernel.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Backends soportados | Licencia |
|---|---|---|---|---|
| Froopert-31B-W8A16-FP8 | 31,27B | W8A16 FP8 | Intel XPU, NVIDIA CUDA | no disponible |
| G4-MeroMero-v2-31B-W8A16-FP8 | 31B | W8A16 FP8 | Intel XPU, NVIDIA CUDA | no disponible |
| Ornith 1.0 31B Dense | 31B | no disponible | no disponible | MIT |

El modelo G4-MeroMero-v2-31B-W8A16-FP8 es del mismo autor y sigue el mismo esquema de cuantización, por lo que es la alternativa más directa. Ornith 1.0 31B Dense es un modelo denso de código abierto con licencia MIT, pero no se dispone de información sobre su formato de cuantización ni rendimiento comparativo. No se dispone de datos de benchmarks para comparar calidad entre estos modelos.

## Limitaciones y advertencias

- Licencia no disponible: no se puede confirmar si el modelo es utilizable en proyectos comerciales.
- Sin soporte para ROCm, CPU o TPU en vLLM: el modelo solo funciona en Intel XPU y NVIDIA CUDA (SM75+).
- La cuantización solo cubre las proyecciones lineales 2D; embeddings, normas y torre de visión permanecen en bf16, lo que limita el ahorro de memoria total.
- No hay información sobre el dataset de entrenamiento, por lo que no se pueden evaluar sesgos potenciales ni limitaciones idiomáticas.
- No se han publicado benchmarks, por lo que el impacto real de la cuantización en la calidad de salida es desconocido.
- Al ser una versión cuantizada de un modelo base, puede presentar alucinaciones o errores de razonamiento similares a los del modelo original, pero sin datos de evaluación no se puede cuantificar.
- El pipeline es image-text-to-text, pero no se especifica qué tipos de imagen soporta ni la resolución máxima.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hoborific/Froopert-31B-W8A16-FP8
- Modelo base Nimbz/Froopert-31B: https://huggingface.co/Nimbz/Froopert-31B
- Modelo similar del mismo autor: https://huggingface.co/hoborific/G4-MeroMero-v2-31B-W8A16-FP8
- Librería compressed-tensors: https://github.com/neuralmagic/compressed-tensors
