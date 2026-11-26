# ahrazzle/holosphere-v4-monarch2-sm86-15m

## Resumen

HoloSphere-V4 Monarch-2 15M es un modelo de lenguaje a nivel de byte desarrollado por el usuario ahrazzle, publicado en Hugging Face bajo licencia Apache 2.0. Se trata de una variante experimental de la familia HoloSphere-V4 que elimina por completo las tablas de vocabulario almacenadas en memoria HBM, tanto de entrada como de salida, sustituyéndolas por proyecciones algebraicas analíticas (bases de Hadamard y transformadas FWHT). El modelo tiene 15.110.144 parámetros y una arquitectura de 6 capas con dimensión oculta D=512, 16 cabezas y d_ff=800.

El modelo resuelve un problema muy concreto de ingeniería: reducir el coste de memoria de las tablas de embedding y de la cabeza de salida en modelos de lenguaje de pequeño tamaño. En lugar de almacenar una matriz de embedding de 256x512 y una cabeza de salida de 512x256, el modelo genera estas proyecciones de forma analítica en tiempo de ejecución mediante transformadas de Hadamard y una base ortonormal de 256 elementos. La cabeza de salida se implementa como un kernel Monarch-16x16 residente en memoria compartida (SMEM) de la CTA, con solo 8.448 parámetros FP16 (16.896 bytes).

Es relevante ahora por su enfoque en eficiencia extrema de memoria y tolerancia a fallos a nivel de hardware (SECDED, rollback de estado), orientado a GPUs consumer sm_86 (RTX 3080 Laptop). No obstante, se trata de un modelo de investigación con capacidades lingüísticas muy limitadas: su rendimiento se mide en bits por byte (BPB) sobre texto UTF-8, no en benchmarks estándar de razonamiento o código.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de 6 capas con celdas HoloSphere CellOp, Cayley SU(2) y cuantización A_16 Block-H4; cabeza de salida Monarch-16x16 en SMEM |
| Parametros totales | 15.110.144 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (evaluado hasta T=8192 en BPB, sin contexto máximo declarado) |
| Tipos de cuantizacion | A_16 Block-H4 (4.5 bpw) para el backbone; cabeza de salida en FP16 (8.448 params) |
| Idiomas soportados | Inglés (en) y código (code) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (model.safetensors, 8.904.848 bytes) |

## Arquitectura y entrenamiento

La arquitectura combina 6 capas HoloSphere CellOp con holonomía Cayley SU(2) libre de trigonometría, un estado Woodbury S_fast de orden O(1) en FP32 con Chunk32, y un anillo de características V_ring. El backbone se cuantiza con Step-0 Extended Hamming [16, 11, 4] A_16 Block-H4 (4.5 bpw), con 936.960 bloques y 0 errores de síndrome verificados. La entrada de vocabulario es analítica: una inyección de bytes H_256 x bent4 escalada por 1/sqrt(32) más una convolución depthwise causal de 2.048 parámetros con kernel=4. La cabeza de salida es una Monarch-16x16 de dos etapas precedida por H_256 unitario-ortonormal, un sesgo de unigrama de 512 bytes y FWHT_256 x bent4.

El entrenamiento se realizó sobre 19.660.800 tokens (600 pasos, seed=2026) con evaluación en FP16 exacta. No se especifican la composición del dataset ni si hubo RLHF o DPO. La innovación técnica principal es la eliminación total de tablas de vocabulario en HBM (0 bytes almacenados tanto en entrada como en salida), junto con tolerancia a fallos SECDED en vivo: 16/16 eventos SEC curados con 0.0 de deriva en logits y 1/1 rollback DED con recuperación exacta de 64/64 tokens.

## Capacidades

- Generación de texto a nivel de byte sobre UTF-8, con vocabulario de 256 vectores únicos de entrada.
- Modelado de lenguaje autoregresivo con contexto evaluado hasta 8.192 tokens (en métrica BPB).
- Procesamiento de código fuente como parte del dominio declarado (tag "code").
- Soporte de tolerancia a fallos en hardware: corrección SEC inline y rollback DED con latch de 64 épocas.
- Ejecución en GPUs sm_86 (RTX 3080 Laptop) con kernel de cabeza sin spills (27 registros, 20.480 B SMEM, 0 LDL/STL).
- No se declara soporte de tool calling, function calling, agentes, visión, audio ni modo thinking.
- Capacidad multilingüe limitada a inglés y código.

## Casos de uso

- Investigación en eficiencia de memoria: el modelo sirve como banco de pruebas para estudiar el impacto de eliminar tablas de vocabulario en HBM, con métricas BPB comparables frente a baselines densos (Row0_RoPE_nGPT y Row3_HoloSphereV3).
- Prototipado de kernels CUDA en sm_86: el repositorio incluye un kernel de cabeza Monarch-2 sin spills y con paridad verificada (max |delta_logit| = 1.907e-06), útil para quienes desarrollan kernels de inferencia de bajo nivel.
- Estudio de tolerancia a fallos en inferencia: los mecanismos SECDED en vivo (512 eventos SEC, 1 evento DED con rollback) permiten investigar recuperación de estado en GPUs consumer sin ECC.
- Generación de texto a nivel de byte en entornos con restricciones extremas de memoria: al no almacenar tablas de vocabulario, el consumo de HBM para embeddings y cabeza es cero, adecuado para dispositivos con presupuesto de memoria muy ajustado.
- Evaluación comparativa de cuantización A_16 Block-H4: el modelo permite medir la degradación de BPB (por ejemplo, +0.1581 BPB a T=8192 frente a cabeza densa) en un pipeline reproducible con recibos de verificación.
- Docencia y experimentación con arquitecturas alternativas: la combinación de Cayley SU(2), Woodbury Chunk32 y Monarch-16x16 sirve como material didáctico para cursos avanzados de arquitecturas de transformers.

## Benchmarks y rendimiento

Los únicos datos publicados son métricas BPB sobre texto UTF-8 held-out (600 pasos, 19.660.800 tokens, seed=2026, evaluación FP16 exacta):

| Modelo (15M, 19,66M tokens) | HBM entrada (B) | HBM salida (B) | BPB T=512 | BPB T=2048 (tail512) | BPB T=8192 (tail1024) |
|---|---:|---:|---:|---:|---:|
| Row0_RoPE_nGPT (FlashAttn baseline) | 266.240 | 266.240 | 3,7362 | 3,6543 | 3,5933 |
| Row3_HoloSphereV3 (cabeza densa A_16) | 0 | 74.880 (A_16) | 2,9011 | 2,9422 | 2,5832 |
| HoloSphere-V4 (Monarch-2 + Bias + FWHT) | 0 | 0 | 3,0208 | 3,0772 | 2,7412 |

A T=8192, la evaluación en BF16 registra 2,7413 BPB, con una diferencia de cuantización FP16 vs BF16 de 6,383e-05 BPB. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint safetensors ocupa 8.904.848 bytes (aproximadamente 8,5 MB); con overhead de runtime y buffers no persistentes de la referencia PyTorch (512 KiB para dos buffers 256x256 FP32), el consumo es inferior a 100 MB en la práctica.
- GPU recomendadas: el kernel bare-metal está compilado para sm_86 (RTX 3080 Laptop GA104M); otras GPUs Ampere o superiores podrían requerir recompilación.
- Cabe en cualquier GPU consumer moderna; el autor reporta latencias medidas en una RTX 3080 Laptop.
- Opciones de despliegue: PyTorch con el script de referencia modeling_holosphere_v4.py y el kernel CUDA incluido; no se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput medidos (RTX 3080 Laptop, 15,11M, 54 capas A_16 SECDED + cabeza Monarch-2 en SMEM): 536,720 us/token (1.863,17 tok/s) en crudo y 466,020 us/token (2.145,83 tok/s) con CUDA Graph.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | BPB T=8192 | Licencia | HBM vocab entrada/salida |
|---|---:|---|---:|---|---|
| HoloSphere-V4 Monarch-2 15M | 15,11M | hasta 8.192 (evaluado) | 2,7412 | Apache 2.0 | 0 B / 0 B |
| Row3_HoloSphereV3 | 15M (aprox.) | hasta 8.192 (evaluado) | 2,5832 | no disponible | 0 B / 74.880 B |
| Row0_RoPE_nGPT | 15M (aprox.) | hasta 8.192 (evaluado) | 3,5933 | no disponible | 266.240 B / 266.240 B |

Las alternativas comparables son los propios baselines internos del autor, no modelos públicos de propósito general. No se dispone de comparación con modelos de la misma categoría fuera del repositorio.

## Limitaciones y advertencias

- El alias de IDs especiales 256..259 (incluido BOS=256) mapea bit a bit sobre los bytes UTF-8 33 ('!'), 32 (' '), 35 ('#') y 34 ('"'), lo que puede provocar comportamientos inesperados si se usan tokens especiales en producción.
- El modelo solo acepta IDs de entrada en [0, 259] y rechaza fuera de rango de forma fail-closed.
- La eliminación de la tabla de salida en HBM degrada el BPB en +0,1197 (T=512), +0,1349 (T=2048) y +0,1581 (T=8192) frente a la cabeza densa Row3_HoloSphereV3.
- Capacidades lingüísticas muy limitadas: es un modelo de 15M parámetros entrenado con 19,66M tokens, sin benchmarks de razonamiento, matemáticas o código publicados.
- Idiomas restringidos a inglés y código; no se declara soporte multilingüe.
- Riesgo de alucinación y sesgos no evaluados en la información disponible.
- Las latencias reportadas son observaciones en un portátil no controlado (energy_power_status = UNCONTROLLED_LAPTOP_NOT_CLAIMED), no mediciones de laboratorio.
- La licencia Apache 2.0 permite uso comercial, pero el modelo no está validado para producción por su tamaño y dominio de entrenamiento.
- No se declara soporte de tool calling, agentes ni integración con frameworks de despliegue estándar.

## Enlaces

- Hugging Face: https://huggingface.co/ahrazzle/holosphere-v4-monarch2-sm86-15m
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la información proporcionada.
