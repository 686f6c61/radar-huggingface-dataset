# sarimahsan101/Kernix-14B

## Resumen

Kernix-14B es un ajuste fino del modelo Qwen2.5-Coder-14B-Instruct orientado a una tarea muy concreta: la síntesis de kernels de GPU en Triton y CUDA a partir de trazas del perfilador NVIDIA Nsight Compute (`ncu`). Lo desarrolla el usuario sarimahsan101 y se distribuye con licencia Apache 2.0. El modelo parte de la arquitectura transformer densa de Qwen2.5-Coder (14.770.033.664 parámetros) y se especializa en razonar sobre métricas de rendimiento (ocupación, ancho de banda de memoria, stalls) para proponer configuraciones de tiling, unroll y asignación de warps fundamentadas en mediciones reales en silicio.

La propuesta diferencial frente a modelos de código genéricos es que el ajuste se ha realizado sobre ejecuciones empíricas en cuatro microarquitecturas NVIDIA (Turing `sm_75`, Ada Lovelace `sm_89`, Ampere `sm_80` y Blackwell `sm_120`), en lugar de sobre heurísticas. El autor publica un pipeline de SFT más DPO y una suite de verificación física en tres niveles (compilación, paridad numérica frente a `torch.matmul` y medición de speedup con eventos CUDA).

Es relevante para equipos de ingeniería de rendimiento que quieran automatizar parte del ciclo de optimización de kernels, un nicho donde los modelos generalistas suelen producir código que compila pero no mejora el rendimiento o rompe la corrección numérica. La información pública disponible es limitada: no hay ficha de benchmarks estándar (MMLU, HumanEval), no se detallan idiomas ni la longitud de contexto efectiva tras el ajuste.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen2, decoder-only), ajuste fino del base Qwen2.5-Coder-14B-Instruct |
| Parametros totales | 14.770.033.664 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (heredada del base Qwen2.5-Coder-14B-Instruct; no confirmada en la informacion proporcionada) |
| Tipos de cuantizacion | no disponible (pesos publicados en 16 bits y adaptador LoRA; no se documentan GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (modelo fusionado 16-bit, sharded) y adaptador LoRA en `adapter/adapter_model.safetensors` (~275 MB) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino supervisado (SFT) más optimización por preferencias (DPO) sobre Qwen2.5-Coder-14B-Instruct, un transformer decoder-only denso de la familia Qwen2. La distribución incluye tanto los pesos fusionados en 16 bits como el adaptador LoRA, lo que permite cargar el adaptador sobre el modelo base con PEFT y ahorrar almacenamiento.

El entrenamiento se apoya en un dataset propio (`sarimahsan101/Kernix-NCU-dataset`) construido a partir de ejecuciones en GPU en cuatro arquitecturas (T4, L4, A100-SXM4 y RTX PRO 6000). El autor describe el ajuste como "empírico y anclado a la arquitectura": el modelo recibe observaciones del perfilador (throughput de cómputo, ancho de banda, stalls, runtime base) y debe generar kernels que superen una compuerta de verificación física en tres niveles. No se especifican en la información disponible el número exacto de tokens de entrenamiento, la composición detallada del dataset ni los hiperparámetros del DPO.

## Capacidades

- Generación de kernels en OpenAI Triton y CUDA a partir de descripciones de problema (dimensiones M, N, K, tipo de dato) y métricas del perfilador `ncu`.
- Razonamiento sobre cuellos de botella de rendimiento: interpreta porcentajes de ocupación, ancho de banda y stalls para justificar decisiones de tiling, unroll y warps.
- Generación de código con verificación de corrección: el pipeline del autor valida compilación JIT y paridad numérica frente a `torch.matmul`.
- Especialización por arquitectura objetivo: distingue entre `sm_75`, `sm_80`, `sm_89` y `sm_120`.
- Formato conversacional con plantilla de chat (`apply_chat_template`) y prompt de sistema para rol de ingeniero de kernels.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente multi-paso: no documentadas explícitamente; el flujo descrito es de generación única de kernel.
- Capacidades multilingües: no disponible.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Optimización de GEMM en producción: dado un kernel de multiplicación de matrices con bajo throughput de cómputo y alto ancho de banda de memoria, el modelo propone variantes de tiling y unroll orientadas a eliminar stalls de DRAM, como en el ejemplo de la model card (M=N=K=4096 en FP16 sobre `sm_80`).
- Portabilidad entre generaciones de GPU: al estar entrenado en cuatro arquitecturas, puede reescribir un kernel pensado para Ampere hacia parámetros adecuados para Ada Lovelace o Blackwell, ajustando tamaños de bloque y asignación de warps.
- Automatización del ciclo de tuning: integrado en un pipeline que ejecute `ncu`, extraiga métricas y alimente al modelo, se puede reducir el número de iteraciones manuales de prueba y error en la búsqueda de configuraciones.
- Formación y revisión de código de kernels: sirve como revisor que explica por qué una configuración concreta provoca stalls, útil para equipos que se inician en optimización CUDA/Triton.
- Generación de kernels de referencia para validación: produce implementaciones que pueden compararse numéricamente contra `torch.matmul` u operadores de PyTorch antes de sustituirlos en un modelo.
- Investigación en ingeniería de rendimiento asistida por LLM: el dataset y el código de entrenamiento publicados permiten reproducir el ajuste y extenderlo a nuevas microarquitecturas o tipos de kernel.
- Prototipado rápido de operadores personalizados: para capas no cubiertas por las librerías estándar, el modelo genera un punto de partida compilable que el ingeniero puede refinar.

## Benchmarks y rendimiento

Los datos publicados por el autor corresponden a una evaluación física propia sobre NVIDIA A100-SXM4-40GB, no a benchmarks estándar de NLP. Se reproducen tal cual se documentan:

| Metrica | Base Qwen2.5-Coder-14B | Kernix-14B | Estado |
|---|---|---|---|
| Precisión de preferencia DPO (pairwise) | 0,0 % | 100,0 % (5/5) | PASS |
| Margen medio de recompensa DPO | -0,01 nats | +0,01 nats | PASS |
| Nivel 1: tasa de compilación Triton | ~35,0 % | 100,0 % (5/5) | PASS |
| Nivel 2: paridad numérica vs `torch.matmul` | ~30,0 % | 100,0 % (5/5) | PASS |
| Nivel 3: speedup físico medido | 0,75× | 1,44× – 1,52× | PASS |
| VRAM pico (A100-40GB) | >56 GB (OOM) | 28,5 GB (liberada a 8,1 MB) | PASS |

Latencia medida por kernel en A100-SXM4: 163,28 µs (1,48×), 160,45 µs (1,51×), 159,32 µs (1,51×), 207,88 µs (1,16×) y 158,75 µs (1,52×), todos con corrección verificada.

Advertencia: la muestra es de cinco kernels y cinco pares de preferencia, por lo que las cifras de 100 % deben interpretarse como resultados preliminares sobre un conjunto reducido. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM para inferencia en 16 bits: aproximadamente 29,5 GB solo para pesos (14.770.033.664 parámetros × 2 bytes), más overhead de activaciones y caché KV; el autor reporta un pico de 28,5 GB en A100-40GB durante la evaluación, lo que encaja con una carga ajustada.
- VRAM con el adaptador LoRA: requiere cargar el modelo base Qwen2.5-Coder-14B-Instruct (~29,5 GB en bf16) más el adaptador (~275 MB), sin ahorro significativo de memoria frente al modelo fusionado.
- GPU recomendadas: A100-SXM4 40 GB u 80 GB, H100, L40S; el modelo fue validado en A100-SXM4-40GB.
- GPU de consumo: no cabe en 16 bits en GPUs de 24 GB (RTX 4090, 3090). Sería necesario cuantizar a 8 o 4 bits, algo no documentado por el autor.
- Opciones de despliegue: transformers con PEFT (ruta recomendada por el autor), vLLM (el autor indica compatibilidad de drop-in con los ficheros de configuración), text-generation-inference (etiqueta `text-generation-inference` en el repo). No se documenta soporte de llama.cpp, GGUF u Ollama.
- Latencia y throughput de inferencia: no disponibles; las latencias publicadas (≈159–208 µs) corresponden a la ejecución de los kernels generados, no a la del modelo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Kernix-14B | 14,77 B | no disponible | Kernels Triton/CUDA guiados por `ncu` | Apache 2.0 | Hugging Face (pesos + LoRA) |
| Qwen2.5-Coder-14B-Instruct | 14,77 B | no disponible en esta ficha | Código generalista | Apache 2.0 | Hugging Face (modelo base) |
| DeepSeek-Coder-V2-Lite-Instruct | 16 B totales (2,4 B activos, MoE) | no disponible en esta ficha | Código generalista | licencia propia de DeepSeek | Hugging Face |
| Codestral-22B | 22 B | no disponible en esta ficha | Código generalista | licencia no comercial (MNPL) | Hugging Face |

La comparación directa en la tarea de optimización de kernels no está disponible: no existen cifras públicas de los modelos alternativos evaluadas con la misma compuerta física de tres niveles. Frente al base Qwen2.5-Coder-14B-Instruct, el propio autor reporta mejoras de compilación (35 % → 100 %), paridad numérica (30 % → 100 %) y speedup (0,75× → 1,44–1,52×) sobre su conjunto de cinco kernels.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados por el autor; al ser un ajuste sobre un dataset propio de ejecuciones en cuatro GPUs, puede sobreajustarse a los patrones de esas microarquitecturas y generalizar peor en otras.
- Riesgo de alucinación: el modelo puede generar kernels que compilan pero no mejoran el rendimiento o que rompen la corrección numérica; el propio autor introduce la compuerta de verificación física precisamente para mitigarlo, por lo que no debe usarse sin validación en silicio.
- Contexto e idioma: la longitud de contexto efectiva tras el ajuste y los idiomas soportados no están documentados.
- Licencia: Apache 2.0 permite uso comercial, pero conviene verificar las obligaciones heredadas del modelo base Qwen2.5-Coder-14B-Instruct (también Apache 2.0).
- Evidencia limitada: los benchmarks publicados se basan en cinco kernels y cinco pares de preferencia; las cifras de 100 % no deben extrapolarse sin una evaluación independiente a mayor escala.
- Producción: requiere GPU de 40 GB o superior en 16 bits; no hay cuantizaciones oficiales publicadas, lo que limita el despliegue en hardware de consumo.
- Fecha de creación del repositorio (2026-11-06) y número de descargas (1077) con cero likes: la adopción comunitaria es aún muy reducida, por lo que falta validación externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sarimahsan101/Kernix-14B
- Dataset de entrenamiento: https://huggingface.co/datasets/sarimahsan101/Kernix-NCU-dataset
- Repositorio GitHub (código de ajuste, SFT + DPO y suite de evaluación): https://github.com/sarimahsan/Kernix
- Licencia: https://github.com/sarimahsan/Kernix/blob/main/LICENSE
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-14B-Instruct
- Referencia del modelo 3B del mismo autor (enlazada en la model card): https://huggingface.co/sarimahsan101/Kernix-3B
