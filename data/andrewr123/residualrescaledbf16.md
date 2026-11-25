# AndrewR123/ResidualRescaledBF16

## Resumen

`ResidualRescaledBF16` (denominado `CSP-BF16-IR` por su autor, Andrew Rober Fouad Samy / BytesGlue) no es un modelo de lenguaje generativo, sino un *framework* de refinamiento numérico en precisión mixta para solvers de difusión y *flow matching* en tiempo continuo. Resuelve un problema concreto de la pila de aceleradores modernos: los Tensor Cores `BF16` solo ofrecen 7 bits de mantisa (ε_bf16 = 2⁻⁸), lo que provoca un estancamiento fijo de los solvers ODE/Diffusion estándar (DDIM, DPM-Solver-2, ParaDiGMS) cuando las actualizaciones de trayectoria caen por debajo de 2⁻⁷‖X‖, es decir, en torno a 2,1e-3 de error relativo L2 y 38–46 dB de PSNR.

La propuesta combina dos técnicas: un *rescalado residual antípoda* con checkpoints espectrales de Clenshaw–Curtis que eleva correcciones sub-mantisa al rango óptimo de `BF16` mediante pares simétricos X_k ± s_c R_k empaquetados en una única llamada a Tensor Cores, y una *desingularización en tiempo raíz* z = √τ para eliminar la amplificación de ruido de cuantización (152,2×) que aparece en paneles de alto ruido de modelos de difusión con preservación de varianza (VP).

El resultado, según el autor, es que capas DiT SwiGLU sin modificar de 7 bits `BF16` (46,91M de parámetros) alcanzan precisión IEEE-FP32 (9,37e-08) con una aceleración de 44,2× frente a RK4 FP32 con CUDAGraph y 512 NFE en una NVIDIA GB10, y que el techo de ~46 dB en `google/ddpm-cifar10-32` se rompe hasta 69,69 dB. El repositorio se publica bajo licencia MIT y está orientado a investigadores que trabajan en inferencia de difusión de alta precisión sobre hardware Blackwell.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No es un modelo neuronal; framework de refinamiento numérico (Volterra–Newton espectral, Clenshaw–Curtis, desingularización z=√τ) sobre solvers de difusión/flow matching |
| Parámetros totales | No aplica al framework; los modelos de prueba empleados son DiT SwiGLU de 46,9M, DiT 2D Glyph de 34,7M, DDPM CIFAR-10 de 35,75M y DDPM CelebA-HQ-256 de 113,67M |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (no es un modelo de lenguaje) |
| Tipos de cuantización | Precisión mixta `BF16` (7 bits de mantisa) con correcciones `FP32`; no se documentan cuantizaciones enteras |
| Idiomas soportados | No aplica / no disponible |
| Licencia | MIT |
| Formato de pesos | No disponible (el repositorio contiene código Python/PyTorch y kernels PTX, no pesos preentrenados) |

## Arquitectura y entrenamiento

El framework no entrena un modelo propio: opera sobre modelos de difusión preentrenados (VP schedules) y sobre DiT/UNet existentes, inyectando precisión efectiva sin cirugía intralayer ni *splitting* de matrices de Ozaki. Su núcleo son dos componentes. El primero es el *Antipodal Residual Rescaling* (Teoremas 1–2): evalúa checkpoints espectrales de defecto de Volterra R_k en `FP32` disperso y los reescala dinámicamente con s_c = σ_c‖X_k‖/‖R_k‖, σ_c = 2⁻³ = 0,125 = Θ(ε_bf16^(1/3)), empaquetando el par X_k ± s_c R_k en una sola llamada `[2M, d]` a Tensor Cores `BF16`. La simetría antípoda cancela el término cuadrático de Hessiano D²V_θ(X_k)[R_k, R_k] sin FLOPs adicionales, lo que reduce el error JVP de una pasada de 14,12% a 4,46% (3,68×). El segundo es la *High-Noise Root-Time Desingularization* (Teorema 3 y Proposición 3): sustituye la variable temporal por z = √τ y aplica un horizonte Nyquist sin(999τ), eliminando la amplificación 1/α_T ≈ 152,2× en paneles con SNR ≤ 1.

El repositorio incluye kernels PTX 8.0 con JIT (con *fallback* CPU para CI), operadores exactos Clenshaw–Curtis y exp(−λ), QR CGS2 con aceleración de Anderson, un UNet2DModel compatible con Diffusers 0.0.4 (32×32 y 256×256 con `strict=True`) y una suite de verificación determinista (`verify_all.py`). No se documenta el número de tokens ni composición de dataset porque no hay entrenamiento de un modelo base; los "datos de entrenamiento" son los modelos preentrenados sobre los que se evalúa.

## Capacidades

- Acelerar solvers de difusión y flow matching en `BF16` sin degradar la precisión numérica por debajo de `FP32`.
- Romper el techo de estancamiento de mantisa de 7 bits en Tensor Cores `BF16` (superar el límite de ~46 dB de PSNR).
- Refinamiento iterativo tipo Volterra–Newton con checkpoints espectrales de Clenshaw–Curtis.
- Desingularización en tiempo raíz (z = √τ) para paneles de alto ruido (SNR ≤ 1) en modelos VP.
- Integración con UNet2DModel de Diffusers (32×32 y 256×256) y con DiT SwiGLU.
- Ejecución con CUDAGraph y kernels PTX 8.0 JIT sobre NVIDIA GB10 y RTX 5060 (verificados por el autor).
- No soporta generación de texto, tool calling, agentes, visión ni audio: no es un modelo de lenguaje ni multimodal.

## Casos de uso

- **Inferencia de difusión de alta fidelidad en producción**: sustituir solvers `FP32` por `CSP-BF16-IR` para obtener precisión cercana a `FP32` (9,37e-08 en DiT de 46,9M) con 44,2× menos tiempo que RK4 FP32 con CUDAGraph y 512 NFE, reduciendo coste de GPU en pipelines de generación de imágenes.
- **Generación de imágenes en CIFAR-10 con calidad superior al techo BF16**: el solver eleva el PSNR de 46,02 dB (techo `BF16`) a 69,69 dB en `google/ddpm-cifar10-32`, útil para investigación en muestreo de difusión que necesita métricas de fidelidad por encima de lo que permite `BF16` estándar.
- **Despliegue zero-shot en resoluciones mayores**: con σ_c = 0,125 fijo se obtiene 50,10 dB en `google/ddpm-celebahq-256` (UNet de 113,67M, 256×256, D=196.608), lo que permite reutilizar el mismo solver al escalar de 32×32 a 256×256 sin reajustar hiperparámetros.
- **Aceleración de flow matching en 2D**: en el experimento 2D Glyph OT-CFM (34,7M) logra 70,25 dB en 6,40 ms frente a 54,01 dB en 9,03 ms de ParaDiGMS-128, adecuado para prototipado rápido de modelos de flujo con requisitos estrictos de PSNR.
- **Investigación en aritmética de precisión mixta**: el repositorio sirve como banco de pruebas reproducible (suite `verify_all.py`, scripts por *stage*) para estudiar límites de mantisa `BF16` en Tensor Cores y validar técnicas de rescalado residual.
- **Sustitución de solvers en código Diffusers existente**: al incluir un `UNet2DModel` compatible con Diffusers 0.0.4 y helpers de CUDAGraph, se puede integrar en pipelines de difusión ya existentes sin reescribir el modelo.
- **Evaluación comparativa de solvers**: los scripts por *stage* (A–E) permiten reproducir las comparativas frente a DDIM, DPM-Solver-2 y ParaDiGMS en las mismas condiciones de hardware.

## Benchmarks y rendimiento

Los datos provienen de la model card del autor (medidos en NVIDIA GB10 Grace Blackwell). No se han verificado de forma independiente.

| Stage y modelo | Baseline | ParaFlow-BF16 (BF16 puro) | CSP-BF16-IR | Ganancia |
|---|---|---|---|---|
| A: DiT 46,9M JVP V-Curve | BF16 sin escalar: 162× err; Fwd 14,12% | — | 4,46% JVP err (σ*=0,125) | 3,68× vs. Forward SP |
| B: DiT SwiGLU 46,9M (S=512) | CG-RK4 FP32: 468,3 ms (2,85e-07); ParaDiGMS: 2,10e-03 | 2,76 ms (170× speedup) | 10,59 ms @ 9,37e-08 | 44,2× más rápido y 3,0× más limpio que FP32 RK4 |
| C: 2D Glyph OT-CFM 34,7M | CG ParaDiGMS-128: 9,03 ms @ 54,01 dB | 2,70 ms @ 50,73 dB | 6,40 ms @ 70,25 dB | Más rápido y +16,24 dB vs. ParaDiGMS |
| D: ddpm-cifar10-32 (35,8M) | Techo BF16: 46,02 dB; IEEE DDIM-250: 3020 ms | 146,4 ms @ 46,97 dB | 729,6 ms @ 69,69 dB | +23,7 dB sobre el techo BF16 (86,08 dB vs. colocación exacta) |
| E: ddpm-celebahq-256 (113,7M, 256×256) | ParaDiGMS: 26,46 dB; DPM2-100 BF16: 25,65 dB | 8569 ms @ 25,60 dB | 40323 ms @ 50,10 dB | Escalado 64× en píxeles con σ_c=0,125 sin cambios |

## Requisitos de hardware

- **VRAM estimada**: no disponible de forma explícita; el framework opera sobre modelos de 34,7M a 113,67M de parámetros, por lo que la huella es la del modelo base más los buffers `FP32` de checkpoints espectrales (no cuantificados en la información disponible).
- **GPU verificadas por el autor**: NVIDIA GB10 (Grace Blackwell Superchip) y RTX 5060.
- **GPU recomendadas**: al depender de kernels PTX 8.0 y Tensor Cores `BF16`, requiere arquitecturas Blackwell o compatibles con PTX 8.0; no se documenta soporte para A100, H100 ni RTX 4090.
- **Consumer GPU**: sí, según el autor se ha verificado en RTX 5060; no se detalla el rendimiento en esa GPU.
- **Despliegue**: PyTorch con kernels PTX JIT, CUDAGraph y *fallback* CPU para CI; no se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de framework).
- **Latencia y throughput**: ver tabla de benchmarks (Stage B: 10,59 ms para CSP-BF16-IR frente a 468,3 ms de RK4 FP32; Stage D: 729,6 ms frente a 3020 ms de DDIM-250 IEEE).

## Comparativa con modelos similares

| Framework / solver | Tipo | Precisión efectiva | PSNR (CIFAR-10) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| **CSP-BF16-IR (este)** | Refinamiento espectral Volterra–Newton en BF16 | ~FP32 (9,37e-08 en DiT 46,9M) | 69,69 dB | MIT | Hugging Face + GitHub |
| ParaDiGMS | Picard iterativo en ventana deslizante | Limitada por mantisa BF16 | ~46 dB (techo BF16) | No disponible en la información | Referencia académica |
| DPM-Solver-2 | Solver ODE de segundo orden | BF16 estándar | 25,65 dB (celebahq-256, 100 pasos) | No disponible en la información | Implementaciones varias |
| DDIM-250 | Solver determinista estándar | IEEE (FP32) | 3020 ms en CIFAR-10 (referencia temporal) | No disponible en la información | Ampliamente disponible |

No se dispone de comparativas con otros frameworks de precisión mixta (p. ej. Ozaki splitting) más allá de las menciones cualitativas de la model card.

## Limitaciones y advertencias

- **No es un modelo de lenguaje**: no genera texto, no soporta tool calling, agentes, visión ni audio; la ficha se ha adaptado porque la estructura estándar no encaja con un framework numérico.
- **Resultados no verificados de forma independiente**: todas las cifras proceden de la model card del autor; no hay publicaciones revisadas por pares citadas en la información disponible más allá de los PDFs del propio repositorio.
- **Dependencia de hardware específico**: verificado solo en NVIDIA GB10 y RTX 5060; requiere PTX 8.0 y Tensor Cores `BF16`, lo que puede excluir GPUs anteriores.
- **Sesgo de evaluación**: las pruebas se limitan a modelos pequeños (34,7M–113,67M) y a datasets de imagen (CIFAR-10, CelebA-HQ 256, glifos 2D); no se documenta comportamiento en modelos de difusión de gran escala (p. ej. Stable Diffusion).
- **Riesgo de alucinación**: no aplica en el sentido habitual, pero el framework no corrige errores conceptuales del modelo base, solo el error de cuantización numérica.
- **Licencia MIT**: permite uso comercial, pero el autor no ofrece garantías; los modelos base sobre los que se aplique conservan sus propias licencias.
- **Sin pesos publicados**: el repositorio contiene código, no checkpoints; el usuario debe aportar su propio modelo de difusión.
- **Caveat de producción**: el *fallback* CPU existe solo para CI; el rendimiento real depende del JIT de PTX y de CUDAGraph, con posible sobrecoste de compilación en el primer arranque.

## Enlaces

- Hugging Face: https://huggingface.co/AndrewR123/ResidualRescaledBF16
- GitHub del autor: https://github.com/AndrewRober
- Paper (camera-ready): `paper/main.pdf` dentro del repositorio
- Paper (revisión doble ciego): `paper/main_anonymous_review.pdf` dentro del repositorio
- Informe de resultados: `RESULTS_REPORT.md` dentro del repositorio
- Suite de verificación: `scripts/verify_all.py` dentro del repositorio
