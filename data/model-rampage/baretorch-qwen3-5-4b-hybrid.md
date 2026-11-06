# model-rampage/BareTorch-Qwen3.5-4B-Hybrid

## Resumen

BareTorch-Qwen3.5-4B-Hybrid es un modelo de lenguaje híbrido de unos 4,68 mil millones de parámetros desarrollado por model-rampage, obtenido mediante destilación por capas a partir de Qwen3.5-4B y una segunda fase de "up-distillation" con Qwen3.5-9B como profesor. Su objetivo es resolver un problema práctico de las arquitecturas sub-cuadráticas (Mamba-2, RWKV, Gated DeltaNet): su dependencia de extensiones C++/CUDA/Triton específicas que no portan bien a dispositivos edge.

La propuesta de BareTorch es formular el mezclado de secuencias sub-cuadrático usando exclusivamente multiplicaciones de matrices estándar (GEMM) y una actualización recurrente asociativa de bajo rango con coste O(1) por token en decodificación. Sustituye el 75 % de los mezcladores de tokens del backbone (24 de 32 capas) por bloques recurrentes CS-LRAD (rank=32, chunk_size=64), conservando 8 capas de atención completa intercaladas.

Según el autor, el modelo iguala o supera al profesor nativo Qwen3.5-4B en las suites de evaluación publicadas (73,01 % frente a 71,19 % de media en 10 tareas de lm-evaluation-harness, y 40,63 % frente a 35,80 % en razonamiento generativo y código), con hasta 1,35x más velocidad en prefill y un 13 % menos de VRAM pico en contexto de 32K sobre una RTX 4090. Se distribuye bajo licencia Apache 2.0 en formato safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrido intercalado 3:1 (24 bloques recurrentes CS-LRAD + 8 capas de atencion completa) |
| Parametros totales | 4.681.407.744 (4,68 B, dato real de safetensors) |
| Parametros activos | 4045,7M (bf16, no es MoE; VRAM de pesos estaticos ~7,90 GB) |
| Longitud de contexto | 32.768 tokens (512 chunks) |
| Tipos de cuantizacion | no disponible (pesos en bf16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-4B (d_model=2560, 16 cabezas de query y 4 de KV) y sustituye 24 de sus 32 capas de atencion por bloques CS-LRAD (Chunked Selective Low-Rank Associative Delta), un mecanismo recurrente de bajo rango (rank=32, chunk_size=64) cuya actualizacion de estado asociativo es O(1) por token durante la decodificacion. Se conservan 8 capas de atencion completa intercaladas en relacion 3:1 como anclas. Todo el mecanismo se implementa con multiplicaciones de matrices estandar de PyTorch, compatible con `torch.compile` (TorchInductor), sin dependencias de `causal-conv1d` ni `flash-linear-attention`.

El entrenamiento se realizo con el pipeline BareTorch Layerwise Up-Distillation: destilacion por capas desde Qwen3.5-4B y, en fases 4B/4C, destilacion sesgada (Top-64 Skew-KL + Skew-RKL) desde Qwen3.5-9B como profesor, seguida de un entrenamiento Dr. GRPO de 2.100 pasos sobre 4 pilares de razonamiento `<think>`. El numero de tokens y la composicion del dataset de destilacion no estan disponibles.

## Capacidades

- Generacion de texto conversacional (pipeline text-generation).
- Razonamiento paso a paso con modo `<think>` para matematicas y problemas cientificos.
- Generacion de codigo Python (HumanEval y MBPP con Pass@1 medidos por el autor).
- Resolucion de problemas matematicos (GSM8K, MATH-500).
- Comprension lectora y sentido comun (BoolQ, PIQA, WinoGrande, SciQ, ARC, OpenBookQA).
- Decodificacion recurrente O(1) por token, util para contextos largos en inferencia.
- Ejecucion con aceleracion por kernel fusion mediante `model.compile_cs_lrad()` (torch.compile, dynamic=True), sin recompilaciones ante longitudes de prompt variables.
- Soporte de tool calling, agentes y capacidades multilingues: no disponible en la informacion proporcionada.

## Casos de uso

- Razonamiento matematico paso a paso: el modo `<think>` permite descomponer problemas aritmeticos y de calculo; con 79,60 % en GSM8K es adecuado para asistentes de resolucion de problemas de nivel escolar y universitario basico.
- Generacion de codigo Python en entornos limitados: con 35,37 % Pass@1 en HumanEval y solo ~8 GB de pesos, cabe en GPUs de consumo para autocompletado y generacion de scripts.
- Inferencia en dispositivos edge y hardware portatil: al no requerir extensiones CUDA/Triton personalizadas y basarse en GEMM estandar, es candidato para portado a arrays sistolicos y aceleradores no convencionales.
- Chatbots con contexto largo y VRAM contenida: el cache de contexto corto es 2,6x mas pequeno y la VRAM pico en 32K es de 11,22 GB frente a 12,89 GB del profesor, lo que permite conversaciones largas en una RTX 4090 con margen.
- Procesamiento de prompts largos (RAG y resumen de documentos): el prefill hasta 1,35x mas rapido que Qwen3.5-4B beneficia pipelines que ingieren documentos de varios miles de tokens.
- Despliegue en CPU o entornos sin compilacion CUDA custom: solo necesita `torch` y `transformers` con `trust_remote_code=True`, simplificando la instalacion en clusters heterogeneos.
- Investigacion en arquitecturas hibridas: la publicacion del pipeline de destilacion por capas permite reproducir la conversion de modelos de atencion completa a hibridos recurrentes.

## Benchmarks y rendimiento

Resultados publicados por el autor (lm-evaluation-harness, 10 tareas):

| Benchmark | BareTorch-Qwen3.5-4B-Hybrid | Qwen3.5-4B (profesor) |
|---|---|---|
| Media macro (10 tareas) | 73,01 % | 71,19 % |
| ARC-Easy | 86,78 % | no disponible |
| ARC-Challenge | 65,36 % | no disponible |
| SciQ | 97,30 % | no disponible |
| BoolQ | 86,36 % | no disponible |
| PIQA | 78,56 % | no disponible |
| OpenBookQA | 44,00 % | no disponible |
| WinoGrande | 75,45 % | no disponible |

Suite generativa `<think>` (razonamiento y codigo Python, 5 tareas):

| Benchmark | BareTorch-Qwen3.5-4B-Hybrid | Qwen3.5-4B (profesor) |
|---|---|---|
| Media macro (5 tareas) | 40,63 % | 35,80 % |
| GSM8K | 79,60 % | no disponible |
| MATH-500 | 37,80 % | no disponible |
| HumanEval (Pass@1) | 35,37 % | no disponible (1,87x segun autor) |
| MBPP (Pass@1) | 35,20 % | no disponible (1,63x segun autor) |

Rendimiento de inferencia (RTX 4090, segun el autor): prefill hasta 1,35x mas rapido, decodificacion autorregresiva 1,18x mas rapida, cache de contexto corto 2,6x mas pequena y VRAM pico en 32K de 11,22 GB frente a 12,89 GB (-13,0 %) respecto a Qwen3.5-4B nativo. No hay comparativas con modelos de terceros (MMLU, LLM leaderboards independientes): no disponibles.

## Requisitos de hardware

- VRAM para inferencia en bf16: ~7,90 GB solo de pesos estaticos; 11,22 GB de VRAM pico con contexto de 32K (medido por el autor en RTX 4090).
- GPU de referencia en las mediciones: NVIDIA RTX 4090 (24 GB).
- Cabe en GPUs de consumo de 12 GB o mas para contextos de hasta 32K segun las cifras publicadas (RTX 4090 confirmada; RTX 3060 de 12 GB o RTX 4070 probablemente viables, aunque no hay mediciones publicadas).
- No requiere `causal-conv1d` ni `flash-linear-attention`; solo `torch` y `transformers` con `trust_remote_code=True`.
- Aceleracion recomendada: `model.compile_cs_lrad(mode="default", dynamic=True)`; la primera llamada tarda ~10 segundos en compilar kernels Triton fusionados.
- Opciones de despliegue: transformers (via oficial documentada). Compatibilidad con vLLM, llama.cpp, Ollama o TGI: no disponible (arquitectura custom con `custom_code`, probablemente no soportada por defecto).
- Ejecucion en CPU posible al ser PyTorch puro, aunque sin cifras de latencia publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Arquitectura | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| BareTorch-Qwen3.5-4B-Hybrid | 4,68 B | Hibrido CS-LRAD + atencion (3:1) | 32.768 | Apache 2.0 | Sin dependencias CUDA custom; destilado de Qwen3.5-4B/9B |
| Qwen/Qwen3.5-4B (profesor) | no disponible | Transformer con atencion completa | no disponible | no disponible | Base original; 12,89 GB VRAM pico en 32K |
| Qwen/Qwen3.5-9B (profesor KD) | no disponible | Transformer | no disponible | no disponible | Profesor de la fase de up-distillation |
| Mamba-2 / RWKV / Gated DeltaNet | no disponible | SSM / RNN lineal | no disponible | no disponible | Requieren extensiones C++/CUDA/Triton especificas |

No hay datos de rendimiento comparados con terceros: no disponible.

## Limitaciones y advertencias

- Es un modelo derivado por destilacion: hereda los sesgos y alucinaciones potenciales de Qwen3.5-4B y Qwen3.5-9B; no hay auditoria de sesgos publicada.
- Los benchmarks provienen del propio autor y no han sido verificados de forma independiente; las cifras de retencion (102,6 % y 113,5 %) dependen de la suite y configuracion elegidas.
- El rendimiento en codigo (35,37 % Pass@1 en HumanEval) es modesto para tareas de programacion exigentes.
- Requiere `trust_remote_code=True` (codigo custom en el repo), lo que implica revisar el codigo remoto antes de usarlo en produccion.
- Idiomas soportados, soporte de tool calling y agentes: no disponibles en la documentacion.
- La primera inferencia tras `compile_cs_lrad()` introduce ~10 segundos de compilacion JIT.
- La compatibilidad con servidores de inferencia estandar (vLLM, TGI, llama.cpp) no esta documentada; la arquitectura custom puede requerir el motor BareTorch o transformers.
- Proyecto de autor independiente con descargas muy bajas (337) y madurez comunitaria limitada; conviene evaluar estabilidad antes de uso en produccion.
- La licencia Apache 2.0 permite uso comercial sin restricciones adicionales del derivado, sujeto a los terminos de los modelos base Qwen.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/model-rampage/BareTorch-Qwen3.5-4B-Hybrid
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Motor BareTorch (GitHub): https://github.com/martin-kbcc/baretorch
- Pipeline de destilacion por capas (GitHub): https://github.com/martin-kbcc/BareTorch_Layerwise_Distill
- Demo en vivo (ZeroGPU Playground): https://huggingface.co/spaces/martin-kb-rampage/BareTorch-Qwen3.5-Playground
- Paper (PDF): https://github.com/martin-kbcc/baretorch-experiments/blob/main/paper.pdf
- Licencia Apache 2.0: https://apache.org/licenses/LICENSE-2.0
