# hermitdave/LFM3-1.7B-MLX-MACaQ-R-4.25bpw

## Resumen

LFM3-1.7B-MLX-MACaQ-R-4.25bpw es una cuantización de 4 bits del modelo LiquidAI/LFM3-1.7B, publicada por el usuario hermitdave. No se trata de un modelo nuevo, sino de un checkpoint comprimido con una variante del método MACaQ (weight-only, estrategia "MACaQ-R") que reoptimiza los códigos E2M1 de la cuantización MXFP4 nativa de MLX contra el profesor en BF16. El objetivo es reducir el daño de la cuantización round-to-nearest estándar sin requerir kernels personalizados ni `trust_remote_code`.

El modelo base, LFM3-1.7B de LiquidAI, es un transformer híbrido de 1.728.801.536 parámetros con 24 capas que combinan convolución, atención deslizante y atención completa, tamaño oculto de 2048, tamaño intermedio de 7680 y un vocabulario de 128.000 tokens. La arquitectura se registra como `lfm3` (`Lfm3ForCausalLM`).

La relevancia de este checkpoint es práctica: empaqueta el modelo en 876 MiB (frente a 3,22 GiB en BF16, una compresión de 3,8×), mantiene una perplejidad de 35,47 frente a 45,50 del mxfp4 estándar de MLX en WikiText-2, y ofrece una decodificación entre 2,1 y 2,6 veces más rápida que BF16 en hardware Apple Silicon. Está pensado para inferencia local en Macs con `mlx-lm`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `lfm3` (`Lfm3ForCausalLM`), transformer híbrido conv / atención deslizante / atención completa, 24 capas |
| Parametros totales | 1.728.801.536 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MXFP4 (códigos E2M1 + escalas E8M0), group_size=32, W4A16, 4,25 bpw medios; método MACaQ-R (weight-only) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | MLX packed (`mxfp4`), safetensors |
| Tamano oculto | 2048 |
| Tamano intermedio | 7680 |
| Vocabulario | 128.000 |
| Tamano del repo | 0,9 GB (876 MiB empaquetado) |
| Modelo base | LiquidAI/LFM3-1.7B |

## Arquitectura y entrenamiento

El checkpoint hereda la arquitectura del modelo base: un transformer de 24 capas que alterna convolución, atención deslizante y atención completa, con tamaño oculto de 2048 y capa intermedia de 7680. El vocabulario es de 128.000 tokens. No se dispone de información sobre el dataset de preentrenamiento, el número de tokens ni si hubo fases de RLHF o DPO en el modelo base a partir de la documentación proporcionada.

La innovación técnica de este checkpoint es el proceso de cuantización MACaQ-R, aplicado sobre las 153 capas lineales cuantizadas. Para cada capa: (1) se descomprimen los nibbles E2M1 y las escalas E8M0 del formato MXFP4 de MLX; (2) se captura la Hessiana de activaciones `H = Σ xᵀx` del profesor en BF16 sobre 200.000 tokens de entrenamiento de WikiText-2 mediante hooks de forward; (3) se reexaminan los exponentes de bloque sobre los desplazamientos {−1, 0, +1} bajo la métrica diagonal de la Hessiana; (4) se aplica Flip-Refinement, un descenso por coordenadas codicioso sobre los códigos E2M1 con la ganancia en forma cerrada `2Δg − Δ²H_jj`, con los exponentes fijos y 256 barridos con parada temprana; (5) se reempaqueta en el layout mxfp4 nativo de MLX. No se modifica ninguna capa vecina, normalización ni rama residual, por lo que el layout, la configuración y el runtime permanecen inalterados.

## Capacidades

- Generación de texto y conversación: el pipeline declarado es `text-generation` con tag `conversational`.
- Razonamiento y generación de código y matemáticas: capacidades heredadas del modelo base LiquidAI/LFM3-1.7B; no se detallan métricas específicas en la información disponible.
- Soporte de tool calling / function calling: no disponible en la documentación proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la documentación proporcionada.
- Capacidades multilingües: no disponibles; el campo de idiomas no está rellenado.
- Capacidades especiales (modo thinking, visión, audio): no disponibles en la información proporcionada.
- Inferencia local en Apple Silicon: carga con `mlx-lm` estándar, sin kernels personalizados ni `trust_remote_code`.

## Casos de uso

- Inferencia local en Mac con memoria unificada limitada: el checkpoint ocupa 876 MiB y pico de memoria de 2,22 GB a contexto de ~1K, frente a 4,34 GB en BF16. Adecuado para Macs de 16 GB o menos donde el modelo en BF16 no cabría con holgura.
- Servicio de generación de texto con `mlx-lm` u oMLX: con decodificación de 150,9 tok/s a ~1K de contexto y 141,3 tok/s a ~8K en M3 Max, permite servir un modelo conversacional de 1,7B con latencia baja en hardware de consumo Apple.
- Prototipado rápido de aplicaciones conversacionales: la API de `mlx_lm.load` y `mlx_lm.generate` permite integrar el modelo en scripts de Python en pocas líneas, útil para validar prompts y flujos antes de escalar a modelos mayores.
- Evaluación de técnicas de cuantización: el checkpoint sirve como referencia reproducible del método MACaQ-R frente a mxfp4 RTN y affine-4, con perplejidades medidas en WikiText-2 (35,47 vs 45,50 vs 42,38), útil para investigación en compresión de modelos.
- Generación de texto por lotes en pipelines de CI o scripts de evaluación: el formato MLX packed y la ausencia de código personalizado simplifican el despliegue en entornos macOS sin dependencias adicionales.
- Asistentes de texto embebidos en herramientas de escritorio para macOS: al no requerir GPU dedicada y caber en memoria unificada, puede integrarse en aplicaciones nativas que necesiten generación de texto sin conexión.

## Benchmarks y rendimiento

Fidelidad medida en WikiText-2 test, 130.816 tokens, longitud de secuencia 512, mismos datos de evaluación para todas las filas:

| Modelo | Perplejidad ↓ | Diferencia vs BF16 |
|---|---:|---:|
| BF16 | 30,84 ± 0,29 | — |
| affine-4 (group 64) | 42,38 ± 0,41 | +11,54 |
| mxfp4 RTN (MLX por defecto) | 45,50 ± 0,45 | +14,66 |
| **Este modelo** | **35,47 ± 0,34** | **+4,63** |

Rendimiento local con `mlx-lm` en M3 Max (64 GB de memoria unificada), prompts de prosa WikiText-2 y 256 tokens generados:

| Contexto | Modelo | Prompt TPS | Decode TPS | Memoria pico |
|---|---|---:|---:|---:|
| ~1K | BF16 | 2075 | 71,5 | 4,34 GB |
| ~1K | **Este modelo** | 2623 | **150,9** | **2,22 GB** |
| ~8K | BF16 | 2903 | 70,3 | 4,95 GB |
| ~8K | **Este modelo** | 2920 | **141,3** | **2,53 GB** |

Rendimiento servido con oMLX (media de 3 ejecuciones por celda):

| Contexto | BF16 | **Este modelo** | Aceleración |
|---|---:|---:|---:|
| ~1K | 75,5 tok/s | 171,2 tok/s | 2,3× |
| ~8K | 78,0 tok/s | 203,8 tok/s | 2,6× |

Ablación del método sobre este checkpoint (200K tokens de calibración salvo indicación):

| Configuración | Perplejidad ↓ |
|---|---:|
| flips=64 | 36,14 |
| **flips=256 (publicado)** | **35,47** |
| flips=512 | 35,38 |
| calibración 500K | 35,60 |
| calibración 1M | 35,41 |
| ridge λ=0,5 | 35,48 |
| ridge λ=2,0 | 36,27 |

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM / memoria unificada estimada para inferencia: 2,22 GB de pico a contexto ~1K y 2,53 GB a ~8K, medidos en M3 Max con 64 GB.
- GPU recomendadas: Apple Silicon con soporte MLX (medido en M3 Max); no se han publicado mediciones en A100, H100 ni RTX 4090, y el formato MLX packed está orientado a hardware Apple.
- Cabe en GPU de consumo: sí, en cualquier Mac con memoria unificada suficiente para 2,53 GB más el resto del sistema; encaja con holgura en equipos de 16 GB.
- Opciones de despliegue: `mlx-lm` (librería declarada, carga estándar sin `trust_remote_code`), CLI `mlx_lm.generate`, servidor oMLX. No se mencionan vLLM, llama.cpp, Ollama ni TGI para este formato.
- Latencia y throughput: decodificación de 150,9 tok/s a ~1K y 141,3 tok/s a ~8K con `mlx-lm` en M3 Max; 171,2 y 203,8 tok/s servido con oMLX. El prefill está saturado por ancho de banda en estas longitudes, por lo que el throughput de prompt es comparable a BF16.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Perplejidad WikiText-2 | bpw | Licencia | Formato |
|---|---|---:|---:|---:|---|---|
| **Este modelo** | 1,7B | no disponible | 35,47 | 4,25 | Apache-2.0 | MLX mxfp4 |
| LFM3-1.7B BF16 (base) | 1,7B | no disponible | 30,84 | 16 | Apache-2.0 | BF16 |
| LFM3-1.7B mxfp4 RTN (MLX) | 1,7B | no disponible | 45,50 | 4,25 | Apache-2.0 | MLX mxfp4 |
| LFM3-1.7B affine-4 (group 64) | 1,7B | no disponible | 42,38 | 4,50 | Apache-2.0 | MLX affine |

## Limitaciones y advertencias

- No es un fine-tune: es compresión con pérdida y la perplejidad sigue por encima de BF16 (35,47 frente a 30,84).
- Sin rotación de Hadamard: el mayor término de la ablación del paper no está disponible porque requeriría una transformación online de activaciones que el matmul cuantizado de MLX no expone. Esta es la variante weight-only.
- Solo W4A16: el kernel `qqmm` W4A4 de MLX solo es más rápido que BF16 con batch ≤ 4 en Apple Silicon, por lo que el checkpoint se distribuye como weight-only.
- Validado en un único modelo: las mediciones corresponden solo a LFM3-1.7B.
- Sesgos conocidos: no disponibles en la documentación proporcionada; se heredan del modelo base.
- Riesgo de alucinación: no cuantificado en la información disponible; aplicable el riesgo habitual de un modelo de 1,7B.
- Limitaciones de contexto e idioma: la longitud de contexto y los idiomas soportados no están declarados.
- Restricciones de licencia: Apache-2.0, permite uso comercial; conviene verificar las condiciones del modelo base LiquidAI/LFM3-1.7B.
- Caveat para producción: el formato MLX packed limita el despliegue a hardware Apple con `mlx-lm` u oMLX; no es portable a CUDA sin reconversión.

## Enlaces

- Hugging Face: https://huggingface.co/hermitdave/LFM3-1.7B-MLX-MACaQ-R-4.25bpw
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
- Paper MACaQ: https://arxiv.org/abs/2611.10649
- Repositorio MACaQ: https://github.com/huawei-csl/MACaQ
- Port MLX y benchmarks: https://github.com/hermitdave/macaq-mlx
- Hermes Agent: https://hermes-agent.nousresearch.com/
