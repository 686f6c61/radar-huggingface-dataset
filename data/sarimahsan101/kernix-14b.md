# sarimahsan101/Kernix-14B

## Resumen

Kernix-14B es un modelo de lenguaje especializado en optimización de kernels para GPU, desarrollado por Syed Sarim Ahsan (usuario `sarimahsan101` en Hugging Face). Se trata de un fine-tuning del modelo Qwen2.5-Coder-14B-Instruct orientado a una tarea muy concreta: analizar trazas del profiler NVIDIA Nsight Compute (`ncu`) y sintetizar kernels en Triton y CUDA que sean correctos a nivel numérico y mediblemente más rápidos en hardware real. El modelo parte de la familia Qwen2.5, con arquitectura transformer decoder-only y 14.770.033.664 parámetros totales en formato safetensors de 16 bits.

La propuesta diferencial del modelo es el "grounding" empírico: según su model card, se entrenó sobre trazas profiler-a-kernel recogidas en cuatro microarquitecturas NVIDIA distintas (Turing `sm_75`, Ampere `sm_80`, Ada Lovelace `sm_89` y Blackwell `sm_120`), con una etapa de SFT seguida de DPO sobre pares de preferencia definidos por el tiempo de ejecución medido en silicio. Frente a modelos de código genéricos que eligen tamaños de tile, factores de unroll o asignación de warps mediante heurísticas, Kernix-14B pretende razonar a partir de métricas reales de ocupación, ancho de banda y stalls.

Es relevante ahora porque la optimización de kernels es uno de los cuellos de botella prácticos en el despliegue de modelos y pipelines de alto rendimiento, y porque el modelo se distribuye tanto como pesos fusionados en 16 bits como mediante un adaptador LoRA ligero, lo que facilita su integración en flujos existentes basados en Qwen2.5-Coder. La licencia Apache 2.0 permite uso comercial, aunque el modelo es muy reciente y con escasa tracción pública (0 descargas y 0 likes en el momento de la consulta).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2.5, tag `qwen2`) |
| Parametros totales | 14.770.033.664 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base Qwen2.5-Coder-14B-Instruct, valor no confirmado en esta ficha) |
| Tipos de cuantizacion | no se documentan cuantizaciones publicadas; pesos distribuidos en 16 bits (bfloat16/float16) y adaptador LoRA |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (pesos fusionados 16-bit, posiblemente sharded) y adaptador LoRA (`adapter/adapter_model.safetensors`, `adapter_config.json`) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del transformer decoder-only de Qwen2.5-Coder-14B-Instruct, con atención por grupos de consultas (GQA) propia de la familia Qwen2.5, aunque los detalles exactos de cabezas, dimensiones y contexto no se detallan en la información disponible. El entrenamiento se realizó en dos etapas: una primera fase de SFT (instruction tuning multi-GPU) sobre trazas de alta resolución profiler-a-kernel recogidas en Ampere, Ada Lovelace, Turing y Blackwell, y una segunda fase de DPO (Direct Preference Optimization) en la que los pares de preferencia se definieron estrictamente por el tiempo de ejecución físico (el kernel ganador es el más rápido, el perdedor el más lento).

La innovación técnica destacable es el enfoque "profiler-grounded": el modelo consume observaciones de `ncu` (porcentaje de throughput de cómputo, uso de ancho de banda de memoria, stalls por latencia DRAM, tiempo base) y produce kernels Triton/CUDA con decisiones de tile, unroll y warps justificadas por esas métricas. Según la model card, el pipeline de verificación se organiza en tres niveles: compilación, coincidencia numérica frente a `torch.matmul` en FP16 (diferencia <= 0.125) y speedup medido en hardware real. No se especifican en la información proporcionada el número de tokens de entrenamiento, la composición exacta del dataset ni detalles de hiperparámetros de SFT/DPO.

## Capacidades

- Generación de código especializado en kernels Triton y CUDA para operaciones tipo GEMM y similares.
- Razonamiento guiado por métricas de profiler: interpreta trazas de NVIDIA Nsight Compute (`ncu`) y traduce stalls y cuellos de botella en decisiones de optimización.
- Ajuste de parámetros de kernel: tamaños de tile, factores de unroll, asignación de warps y estrategias de acceso a memoria.
- Verificación numérica: genera kernels que, según la model card, alcanzan coincidencia exacta frente a `torch.matmul` en FP16.
- Conocimiento de cuatro microarquitecturas NVIDIA: Turing `sm_75`, Ampere `sm_80`, Ada Lovelace `sm_89` y Blackwell `sm_120`.
- Conversación multi-turno mediante plantilla de chat compatible con el formato de Qwen2.5-Coder (roles system/user/assistant).
- Capacidades generales de generación de texto y código heredadas del modelo base Qwen2.5-Coder-14B-Instruct.
- Soporte de tool calling / function calling: no documentado de forma específica en la información proporcionada.
- Capacidades de agente multi-step y modos de razonamiento explícito (thinking): no documentados.
- Capacidades de visión o audio: no disponibles.

## Casos de uso

- Optimización de kernels GEMM en producción: dado un problema de dimensiones M, N, K y una traza `ncu` con el porcentaje de throughput y los stalls dominantes, el modelo genera un kernel Triton con tile y warps ajustados a la microarquitectura objetivo, reduciendo el trabajo manual de tuning.
- Ingeniería de rendimiento asistida en equipos de HPC/ML: el modelo actúa como par de revisión que interpreta informes de profiler y propone reescrituras de kernel justificadas por métricas, útil para equipos sin especialistas dedicados a GPU.
- Migración entre generaciones de GPU: al conocer las diferencias entre `sm_75`, `sm_80`, `sm_89` y `sm_120`, puede adaptar kernels existentes a una nueva arquitectura cuando cambian las características de memoria y cómputo.
- Generación de kernels para pipelines de inferencia: integración en flujos que necesitan operadores personalizados (fusiones, layouts específicos) y que se benefician de kernels numéricamente verificados frente a una referencia en PyTorch.
- Formación y documentación técnica: uso como asistente explicativo que relaciona métricas de profiler con decisiones de diseño de kernel, para material didáctico sobre optimización CUDA/Triton.
- Automatización de pruebas de rendimiento: generación de variantes de kernel que se evalúan en un banco de pruebas físico (compilación, comparación numérica y medición de tiempo) para seleccionar la más rápida.
- Prototipado rápido con adaptador LoRA: al cargar solo el adaptador sobre Qwen2.5-Coder-14B-Instruct ya cacheado, se reduce el coste de almacenamiento y se puede mantener una única copia del modelo base para varias tareas.

## Benchmarks y rendimiento

Los datos siguientes provienen exclusivamente de la model card del autor y comparan el modelo ajustado con su base Qwen2.5-Coder-14B-Instruct. No se han verificado de forma independiente.

| Benchmark / puerta | Modelo base | Kernix-14B | Estado |
|---|---|---|---|
| Perplejidad en held-out (PPL) | 3,46 | 1,03 (reducción del 70,1 %) | PASS |
| Precisión de preferencia DPO | 50,0 % | 100,0 % (15/15 pares held-out) | PASS |
| Margen de recompensa DPO | 0,0 nats | +0,03 nats | PASS |
| Tier 1: tasa de compilación | ~35,0 % | 100,0 % | PASS |
| Tier 2: coincidencia numérica | ~30,0 % | Coincidencia exacta vs `torch.matmul` (diff FP16 <= 0,125) | PASS |
| Tier 3: speedup medido en silicio | 0,75x (stalled) | 1,68x - 1,85x | PASS |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en 16 bits: aproximadamente 29,5 GB solo para pesos (14,77 mil millones de parámetros a 2 bytes), más overhead de activaciones y caché KV; en la práctica se recomienda disponer de 32 GB o más de VRAM para contexto moderado.
- El repositorio ocupa 29,8 GB, coherente con pesos fusionados en 16 bits más el adaptador LoRA.
- GPU recomendadas para 16 bits: A100 80 GB, H100, RTX PRO 6000 Server Edition; en GPUs de 24 GB (RTX 4090, L4) no cabe en 16 bits sin cuantización u offloading.
- Cabe en GPU de consumo únicamente con cuantización (por ejemplo 8 bits o 4 bits) o con descarga parcial a CPU; no se documentan cuantizaciones publicadas por el autor.
- Opción ligera: cargar solo el adaptador LoRA (unos 60-240 MB según la model card) sobre Qwen2.5-Coder-14B-Instruct, lo que reduce el almacenamiento pero no la VRAM necesaria para el modelo base.
- Opciones de despliegue: transformers con `device_map="auto"`, vLLM (el autor lo menciona como recomendado para los pesos fusionados), PEFT para el adaptador; llama.cpp/Ollama requerirían conversión a GGUF no documentada.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Kernix-14B | 14,77 B | no disponible | Optimización de kernels GPU guiada por profiler | Apache 2.0 | Hugging Face (pesos + adaptador LoRA) |
| Qwen2.5-Coder-14B-Instruct | 14,77 B | no disponible en esta ficha | Generación de código general | Apache 2.0 | Hugging Face, ampliamente desplegado |
| Modelos de código genéricos de tamaño similar (por ejemplo, CodeLlama 13B Instruct) | ~13 B | no disponible en esta ficha | Generación de código general | Licencia propia de Llama | Hugging Face |

La comparación con alternativas especializadas en optimización de kernels GPU no está disponible en la información proporcionada. La diferencia principal frente al base es la especialización en trazas `ncu` y la etapa DPO guiada por tiempo de ejecución medido.

## Limitaciones y advertencias

- Modelo muy reciente y con escasa validación externa: 0 descargas y 0 likes en el momento de la consulta; los benchmarks proceden únicamente de la model card del autor y no han sido replicados de forma independiente.
- El alcance está muy acotado: está entrenado para kernels Triton/CUDA guiados por perfiles de `ncu`; fuera de ese dominio puede degradar respecto al modelo base.
- Riesgo de alucinación en métricas y APIs: puede generar referencias a métricas de profiler o parámetros de compilación inexistentes; toda salida debe pasar por compilación y verificación numérica antes de usarse.
- Las tasas de compilación del 100 % y los speedups de 1,68x-1,85x corresponden a un conjunto de evaluación concreto del autor; no garantizan el mismo comportamiento en otros problemas, dimensiones o versiones de Triton/CUDA.
- Sesgos conocidos: no documentados; al heredar de Qwen2.5-Coder arrastra los sesgos del corpus de código del modelo base.
- Idiomas soportados no documentados; el uso previsto es técnico en inglés, por lo que el rendimiento en castellano no está caracterizado.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero debe respetarse la licencia del modelo base Qwen2.5-Coder-14B-Instruct y las condiciones de las herramientas mencionadas (Triton, CUDA, Nsight Compute).
- En producción, el adaptador LoRA requiere mantener el modelo base; los pesos fusionados en 16 bits exigen hardware de gama alta o cuantización no documentada por el autor.
- No se documentan contexto máximo, cuantizaciones publicadas ni soporte de tool calling, lo que limita la planificación de despliegues a gran escala.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sarimahsan101/Kernix-14B
- Perfil del autor en Hugging Face: https://huggingface.co/sarimahsan101/models
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-14B-Instruct
- NVIDIA Nsight Compute: https://developer.nvidia.com/nsight-compute
- OpenAI Triton: https://github.com/triton-lang/triton
- Paper, blog o demo adicionales: no disponibles en la información proporcionada.
