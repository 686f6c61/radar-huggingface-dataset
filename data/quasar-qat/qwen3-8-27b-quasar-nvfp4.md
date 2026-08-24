# QUASAR-QAT/Qwen3.8-27B-QUASAR-NVFP4

## Resumen

El modelo **Qwen3.8-27B-QUASAR-NVFP4** es un checkpoint cuantizado del modelo multimodal `Qwen/Qwen3.8-27B` (27.36 mil millones de parámetros), desarrollado por el equipo QUASAR-QAT. El objetivo principal es reducir el peso del modelo original en BF16 (55.6 GB) hasta 19.7 GB mediante cuantización NVFP4 (W4A4) en **todas** las capas lineales de la red, incluidas las de atención y las del gated delta-net, algo que normalmente degrada la calidad de forma severa.

La relevancia de este checkpoint radica en que es el NVFP4 más pequeño disponible para Qwen3.8-27B, superando en compresión a otras variantes públicas como `unsloth/Qwen3.8-27B-NVFP4` (23.4 GB) o `Inferact/Qwen3.8-27B-NVFP4` (26.4 GB), manteniendo al mismo tiempo un rendimiento casi idéntico al original en razonamiento avanzado (GPQA-Diamond y AIME26). Se entrena con el método QUASAR (quantization-aware distillation con reconstrucción consciente de la pérdida), descrito en el preprint arXiv 2608.13966.

El checkpoint es compatible con vLLM sin conversión previa y soporta una ventana de contexto de hasta 262.144 tokens. Requiere hardware NVIDIA con soporte FP4 (Blackwell, compute capability 10.0 o superior), lo que lo hace viable en GPUs como RTX 5090 o DGX Spark (GB10).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.8 (híbrida: self-attention + gated delta-net + MLP) |
| Parametros totales | 27.356.728.560 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262.144 tokens (según configuracion de vLLM) |
| Tipos de cuantizacion | NVFP4 (W4A4) en las 496 capas lineales |
| Idiomas soportados | No disponible (heredados del modelo base Qwen3.8-27B) |
| Licencia | No disponible |
| Formato de pesos | Safetensors (compatible con compressed-tensors / vLLM) |

## Arquitectura y entrenamiento

El modelo base es `Qwen/Qwen3.8-27B`, una arquitectura híbrida que combina mecanismos de self-attention con capas de gated delta-net, lo que permite manejar secuencias largas con un coste computacional menor que un transformer puramente cuadrático. En este checkpoint, **todas** las capas lineales (496 de 496), incluyendo las de atención, el gated delta-net y los MLP, se cuantizan a NVFP4 (4 bits para pesos y activaciones), una configuración que normalmente provoca colapso de calidad en atención y delta-net, pero que QUASAR logra estabilizar.

El entrenamiento consiste en una época de destilación de cuantización consciente de la pérdida (QAD) contra el profesor BF16 congelado: batch size global de 32, learning rate 1e-6 y 2446 pasos. El método QUASAR utiliza una reconstrucción orientada a la pérdida que reduce el "loss floor" típico de los enfoques QAT, permitiendo cuantizar agresivamente sin sacrificar rendimiento.

## Capacidades

- Generación de texto multimodal: el modelo hereda del Qwen3.8-27B la capacidad de procesar y generar texto junto con imágenes (pipeline image-text-to-text).
- Razonamiento avanzado: mantiene un rendimiento casi idéntico al original en tareas de razonamiento científico (GPQA-Diamond 0.9091) y matemáticas (AIME26 1.0000).
- Ventana de contexto larga: soporta hasta 262.144 tokens, adecuado para documentos extensos o conversaciones multi-turno con historial largo.
- Inferencia eficiente en hardware FP4: al cuantizar todas las capas a NVFP4, el modelo puede ejecutarse en GPUs Blackwell con menor uso de VRAM y mayor throughput.
- Compatibilidad con decodificación especulativa: se ha validado su uso con SGLang y DSpark (block-diffusion speculative decoding) en DGX Spark, alcanzando velocidades superiores sin pérdida de calidad (la decodificación especulativa es lossless por construcción).
- Tool calling y uso agéntico: heredado del modelo base Qwen3.8-27B, aunque no se detalla en la documentación del checkpoint cuantizado.

## Casos de uso

- **Despliegue en hardware de consumo**: con 19.7 GB de pesos, el modelo cabe en una RTX 5090 (32 GB) o en un DGX Spark (GB10, 128 GB unificados), permitiendo ejecutar un modelo multimodal de 27B en equipos de sobremesa sin necesidad de clústeres. Es ideal para prototipos locales o entornos de desarrollo.
- **Servicio de chat multimodal en producción**: integrable en vLLM con un comando directo, exponiendo un endpoint compatible con OpenAI para aplicaciones de chat con imágenes, análisis de documentos o asistentes visuales.
- **Razonamiento matemático y científico**: con un 100% de acierto en AIME26 y 0.9091 en GPQA-Diamond, es adecuado como motor de razonamiento en herramientas de tutoría, resolución de problemas de nivel olimpíada o análisis de datos científicos.
- **Análisis de documentos largos**: con 262K tokens de contexto, puede procesar libros técnicos, expedientes legales o conversaciones extensas de soporte, manteniendo la coherencia a lo largo de todo el documento.
- **Agentes autónomos con tool calling**: combinado con frameworks de agencia, el modelo puede planificar y ejecutar tareas de varios pasos (búsqueda, cálculo, generación de código) gracias a su capacidad de razonamiento y a la compatibilidad con vLLM para uso en pipelines de agentes.
- **Investigación en eficiencia de modelos**: sirve como referencia para estudiar el impacto de la cuantización W4A4 completa en arquitecturas híbridas, comparando con los otros checkpoints NVFP4 disponibles.

## Benchmarks y rendimiento

La model card proporciona resultados comparativos con otros dos builds NVFP4 del mismo modelo base, así como con el original BF16:

| Modelo | Tamaño | GPQA-Diamond (2 runs, n=396) | AIME26 (3 repeats, n=90) |
|---|---|---|---|
| `Qwen/Qwen3.8-27B` (BF16 original) | 55.6 GB | 0.9141 | 1.0000 |
| **`QUASAR-QAT/Qwen3.8-27B-QUASAR-NVFP4`** | **19.7 GB** | 0.9091 | 1.0000 |
| `unsloth/Qwen3.8-27B-NVFP4` | 23.4 GB | 0.8939 | 0.9778 |
| `Inferact/Qwen3.8-27B-NVFP4` | 26.4 GB | 0.8763 | 0.9667 |

El checkpoint QUASAR pierde solo 0.005 puntos en GPQA-Diamond frente al BF16 original, manteniendo el 100% en AIME26, y supera claramente a las alternativas NVFP4 de mayor tamaño.

## Requisitos de hardware

- **VRAM estimada**: 19.7 GB de pesos en NVFP4, más overhead de activaciones y KV cache. Con una ventana de 262K tokens, la VRAM total puede superar los 24 GB, por lo que se recomienda al menos 32 GB para uso completo o reducir `--max-model-len` para ajustar el presupuesto.
- **GPUs compatibles**: cualquier NVIDIA con soporte FP4 (compute capability 10.0+), es decir, arquitectura Blackwell: RTX 5090, RTX 5080, B200, GB10 (DGX Spark), etc. No es compatible con Ampere o Ada (RTX 4090 no soporta FP4).
- **Opciones de despliegue**: vLLM (>= 0.27) con `--max-model-len 262144 --gpu-memory-utilization 0.85`; también validado con SGLang en DGX Spark (con DSpark o EAGLE/MTP).
- **Rendimiento medido**: en DGX Spark (GB10), sin decodificación especulativa se obtienen 20–27 tokens/s; con DSpark speculative decoding se supera esa cifra, aunque no se dan valores exactos en los repositorios consultados.
- **Configuración multi-GPU**: es posible usar tensor parallelism (TP=2) sobre RoCE para obtener ~1.6x más velocidad, según el hilo de NVIDIA forums.

## Comparativa con modelos similares

| Modelo | Params | Tamaño (GB) | Contexto | GPQA-Diamond | AIME26 | Licencia |
|---|---|---|---|---|---|---|
| Qwen3.8-27B (BF16) | 27.36B | 55.6 | 262K | 0.9141 | 1.0000 | No disponible |
| **QUASAR-QAT NVFP4** | 27.36B | 19.7 | 262K | 0.9091 | 1.0000 | No disponible |
| unsloth NVFP4 | 27.36B | 23.4 | 262K | 0.8939 | 0.9778 | No disponible |
| Inferact NVFP4 | 27.36B | 26.4 | 262K | 0.8763 | 0.9667 | No disponible |

La comparativa muestra que QUASAR ofrece el mejor equilibrio entre compresión y rendimiento entre las variantes NVFP4 públicas del mismo modelo base.

## Limitaciones y advertencias

- **Requisito de hardware específico**: no es ejecutable en GPUs sin soporte FP4 (RTX 4090, A100, H100), lo que limita su adopción en clústeres existentes.
- **Licencia no especificada**: no se indica la licencia del checkpoint cuantizado ni del modelo base en la model card; antes de un uso comercial, hay que verificar los términos de Qwen3.8-27B y del propio QUASAR-QAT.
- **Riesgo de alucinación y sesgos**: heredados del modelo original Qwen3.8-27B; no se proporcionan evaluaciones de sesgo o toxicidad para el checkpoint cuantizado.
- **Degradación en tareas específicas**: aunque los benchmarks de razonamiento se mantienen, no se publican resultados en otras áreas (traducción, código, generación creativa), por lo que podría haber pérdidas no cuantificadas en otros dominios.
- **Cuantización W4A4 completa**: la cuantización de atención y delta-net a 4 bits es una configuración agresiva; aunque QUASAR la estabiliza, es recomendable probar en el caso de uso concreto antes de producción.
- **Contexto y idioma**: los idiomas soportados no se documentan; se asume multilingüe por el modelo base, pero no hay evidencia en esta model card.

## Enlaces

- HuggingFace: [QUASAR-QAT/Qwen3.8-27B-QUASAR-NVFP4](https://huggingface.co/QUASAR-QAT/Qwen3.8-27B-QUASAR-NVFP4)
- Paper QUASAR: [arXiv:2608.13966](https://arxiv.org/abs/2608.13966)
- Modelo base: [Qwen/Qwen3.8-27B](https://huggingface.co/Qwen/Qwen3.8-27B)
- Variantes NVFP4 de referencia: [unsloth/Qwen3.8-27B-NVFP4](https://huggingface.co/unsloth/Qwen3.8-27B-NVFP4), [Inferact/Qwen3.8-27B-NVFP4](https://huggingface.co/Inferact/Qwen3.8-27B-NVFP4)
- Repos de despliegue con SGLang/DSpark: [MiaAI-Lab/Qwen3.8-27B-SGLang-DGX-Spark](https://github.com/MiaAI-Lab/Qwen3.8-27B-SGLang-DGX-Spark), [hasso5703/dgx-spark-qwen38](https://github.com/hasso5703/dgx-spark-qwen38)
- Discusión en foros NVIDIA: [Qwen3.8-27B NVFP4 en DGX Spark](https://forums.developer.nvidia.com/t/qwen3-8-27b-nvfp4-on-single-dual-dgx-spark-sglang-dflash2-fully-openai-compatible/380732)
