# SergiioB/biascorr-sidecars-v1

## Resumen

`SergiioB/biascorr-sidecars-v1` no es un modelo de lenguaje, sino un repositorio de artefactos de corrección de sesgo (bias correction) pensados para cuantizaciones de 4 bits ya publicadas del checkpoint `Qwen/Qwen3.8-27B`. Cada fichero es un `safetensors` de 14,95 MiB con 496 tensores FP32 por canal que se aplican *post hoc* sobre los pesos cuantizados para reducir la deriva de la distribución de siguiente token (KL) respecto a la referencia BF16, sin necesidad de recuantizar ni volver a descargar los ~15 GB de pesos base.

El autor es `SergiioB` y el repositorio se publica bajo licencia Apache 2.0. La relevancia es doble: por un lado propone un mecanismo barato (unos pocos MiB) para mitigar la degradación típica de la cuantización a 4 bits; por otro, la propia model card documenta con honestidad que la corrección falla en varios modelos (SmolLM2, Llama-3.2-3B, Phi-4-mini, OLMo-2) y que solo se ha validado en un checkpoint concreto.

El estado de carga es limitado: el sidecar `MLX-4bit` solo funciona hoy en una versión parcheada de TensorFold sobre Intel Arc (XPU), con un PR abierto, y no hay loader para Apple MLX/Metal. El fichero `HF-INT4-G16` es una copia de tensores que el checkpoint `Qwen3.8-27B-HF-INT4-G16-BC` ya almacena, por lo que no debe aplicarse dos veces.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No aplica (artefacto de corrección de sesgo para pesos cuantizados de un transformer Qwen3.8-27B) |
| Parametros totales | No aplica (496 tensores FP32 por canal, 14,95 MiB por fichero) |
| Parametros activos | No aplica |
| Longitud de contexto | No disponible (depende del checkpoint base `Qwen/Qwen3.8-27B`) |
| Tipos de cuantizacion | Sidecars para `MLX-4bit` y `HF-INT4-G16` (W4A16); estudio adicional sobre `TFQ3-4b`, `GPTQ-Int4-sym-G128` y NVFP4 |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `safetensors` (FP32 por canal) + `.meta.json` de recibo por fichero |

## Arquitectura y entrenamiento

Los sidecars no son un modelo entrenado de forma convencional: son vectores de corrección de sesgo por canal calculados a partir del error de redondeo de la cuantización, `(W_bf16 - W_quant) * E[x_{t>=1}]`, es decir, el error de pesos ponderado por la activación esperada en cada canal. Cada `.safetensors` está ligado 1 a 1 al checkpoint cuantizado exacto para el que se calculó, de modo que no es reutilizable entre cuantizaciones distintas.

La corrección se valida con una puerta causal de KL sobre un stream BF16 de 64 capas en PyTorch, midiendo la KL de siguiente token frente a BF16 en `WikiText-2` (test) y en código Python (`difflib.py`), con 2.044 posiciones puntuadas por dominio y 0/0 de solapamiento de 6-gramas con el conjunto de calibración. La puerta exige tres condiciones: caída de KL en prosa con IC bootstrap por bloques (blk32) estrictamente por debajo de 0, caída de KL en código con el mismo criterio, y que el control de signo invertido (`-b`) empeore la KL en ambos dominios. La puerta no ejecuta kernels de TensorFold ni de vLLM, y no mide precisión de tarea ni velocidad.

## Capacidades

- Reducción de la deriva de KL de siguiente token en checkpoints cuantizados a 4 bits ya publicados, sin recuantizar ni redistribuir los pesos base.
- Aplicación específica sobre `TensorFold/Qwen3.8-27B-MLX-4bit` (496 tensores F32, claves `language_model.model.layers.*`).
- Aplicación específica sobre `Qwen3.8-27B-HF-INT4-G16-BC` (496 tensores F32, claves `model.language_model.layers.*`).
- Inclusión de recibos `.meta.json` con resultado de la puerta, hash de tokens de calibración, identidades de entrada y versiones de runtime, lo que permite auditar la reproducibilidad.
- Soporte de control A/B mediante el signo invertido (`-b`) para verificar que la corrección no es un artefacto.
- No aporta capacidades nuevas de generación, razonamiento, código, visión, tool calling ni agentes: hereda exclusivamente las del checkpoint base.
- No soporta multilinguismo propio ni modos de pensamiento; cualquier capacidad de ese tipo depende de `Qwen3.8-27B`.

## Casos de uso

- Despliegue de `Qwen3.8-27B` en 4 bits sobre Intel Arc: aplicar el sidecar `MLX-4bit` en la versión parcheada de TensorFold (PR abierto) para recuperar parte de la fidelidad de distribución frente a BF16 sin tocar los pesos de 15 GB.
- Auditoría de calidad de cuantización: usar los recibos `.meta.json` y las métricas de KL para documentar en un pipeline de CI que una cuantización concreta no se degrada más de lo aceptable en prosa y código.
- A/B testing controlado: comparar el checkpoint con y sin corrección usando el control de signo invertido (`-b`) para descartar mejoras espurias antes de promover un checkpoint a producción.
- Investigación en corrección post hoc: servir como referencia reproducible del método BiasCorr con puerta KL y partición por bloques, útil para replicar el estudio en otras familias de modelos.
- Inspección de tensores almacenados: el fichero `HF-INT4-G16` permite verificar qué correcciones incorpora ya el checkpoint `HF-INT4-G16-BC` y evitar aplicarlas por duplicado.
- Evaluación de límites del método: emplear la tabla de regresiones de la model card (GPTQ calibrado, SmolLM2, Llama-3.2-3B, Phi-4-mini, OLMo-2) como checklist para decidir si BiasCorr es aplicable a un checkpoint nuevo antes de invertir esfuerzo.

## Benchmarks y rendimiento

Resultados de la puerta causal en vivo sobre una Intel Arc Pro B70, con 2.044 posiciones puntuadas por dominio y 0/0 de solapamiento de 6-gramas con calibración:

| Fichero | Dominio | KL sin corrección | KL con `+b` | IC 95% blk32 del cambio | KL con `-b` |
|---|---|---:|---:|---|---:|
| `MLX-4bit` v1 | WT2 | 0,05060 | 0,03850 (-23,9%) | [-0,01667, -0,00806] | 0,08791 |
| `MLX-4bit` v1 | Código | 0,18407 | 0,15787 (-14,2%) | [-0,03717, -0,01556] | 0,29898 |
| `HF-INT4-G16` v1 | WT2 | 0,03196 | 0,02708 (-15,3%) | [-0,00741, -0,00280] | 0,05727 |
| `HF-INT4-G16` v1 | Código | 0,14905 | 0,12897 (-13,5%) | [-0,02962, -0,01151] | 0,25463 |

Mediciones del estudio sobre `Qwen3.8-27B` (SDPA causal de 64 capas, 2.044 tokens puntuados por dominio; perplejidad BF16 de referencia 7,7982 en WT2 y 2,3744 en código):

| Checkpoint | WT2 KL (base -> +BC) | WT2 Top-1 | Código KL (base -> +BC) | Código Top-1 |
|---|---|---|---|---|
| `TFQ3-4b` (400 matrices decoder emparejadas, cabeza BF16) | 0,02529 -> 0,01852 (-26,7%) | 93,15% -> 94,47% | 0,11042 -> 0,08879 (-19,6%) | 91,14% -> 92,86% |
| `HF-INT4-G16` (W4A16, cabeza BF16), en memoria (`exp13a`) | 0,03163 -> 0,02720 (-14,0%) | 94,13% -> 94,47% | No disponible en el extracto | No disponible en el extracto |

Regresiones documentadas por el autor al aplicar BiasCorr:

| Modelo / checkpoint | Efecto | ¿Publicado aquí? |
|---|---|---|
| `Qwen3.8-27B` `GPTQ-Int4-sym-G128` (calibrado) | +5,7% peor KL en prosa (sig=True), -5,0% en código | No (la KL empeora) |
| `SmolLM2-1.7B` (4 formatos) | +18% a +51% peor KL | No |
| `Llama-3.2-3B-Instruct` (4 formatos) | +17% a +43% peor KL, -9/160 ítems de tarea | No |
| `Phi-4-mini-instruct` (3 de 4 formatos) | +3% a +24% peor KL, -5/160 ítems de tarea | No |
| `OLMo-2-7B-Instruct` (Post-Norm, 4 formatos) | +92% a +211% peor KL | No |
| `OLMoE-1B-7B-0125-Instruct` (MoE de 64 expertos) | Victoria pequeña en HF-G16 (-3,3% / -7,8%) y MLX (-2,2% / -8,7%), con `all_experts`; empeora NVFP4 y SymINT4 en WT2; p de tarea entre 0,076 y 0,38 | No (solo referencia de investigación) |

## Requisitos de hardware

- Almacenamiento: 14,95 MiB por sidecar, además de los ~15 GB del checkpoint base cuantizado.
- Memoria: la corrección es FP32 por canal y se aplica en carga; el coste adicional en VRAM es despreciable frente a los pesos del modelo base.
- GPU validadas: Intel Arc Pro B70 (XPU) con TensorFold parcheado; el autor no reporta validación en A100, H100 ni RTX 4090.
- Apple Silicon: no hay loader para MLX/Metal; los ficheros no hacen nada en `mlx` ni en `mlx-lm` estándar.
- Despliegue: TensorFold parcheado (PR abierto) para el sidecar `MLX-4bit`; el plugin del checkpoint `HF-INT4-G16-BC` aplica automáticamente los tensores almacenados. No se documenta soporte en vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; la puerta de validación no ejecuta kernels de inferencia ni mide velocidad.

## Comparativa con modelos similares

| Artefacto | Tipo | Tamaño | Checkpoint objetivo | Licencia | Estado de carga |
|---|---|---:|---|---|---|
| `biascorr-sidecars-v1` (este repo) | Sidecar de corrección de sesgo FP32 | 14,95 MiB | `TensorFold/Qwen3.8-27B-MLX-4bit` y `Qwen3.8-27B-HF-INT4-G16-BC` | Apache 2.0 | MLX-4bit solo en TensorFold parcheado (XPU); HF-INT4-G16 vía plugin |
| `Qwen3.8-27B-HF-INT4-G16-BC` | Checkpoint cuantizado con correcciones ya embebidas | No disponible | `Qwen/Qwen3.8-27B` | No disponible | Plugin del autor |
| `Qwen3.8-27B` BF16 | Modelo de referencia sin cuantizar | No disponible | No aplica | No disponible | Estándar |
| `Qwen3.8-27B` `GPTQ-Int4-sym-G128` | Cuantización GPTQ calibrada | No disponible | `Qwen/Qwen3.8-27B` | No disponible | Ecosistema GPTQ |

No se dispone de datos de benchmarks de tarea comparables entre estos artefactos en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo: no genera texto ni aporta capacidades propias; solo modifica la salida de un checkpoint cuantizado concreto.
- Cada sidecar está ligado 1 a 1 al error de redondeo de su checkpoint padre; reutilizarlo en otra cuantización invalida la corrección.
- El sidecar `HF-INT4-G16` duplica tensores ya presentes en `HF-INT4-G16-BC`; aplicarlo dos veces es un error.
- El método no es universal: el autor mide regresiones de KL en GPTQ calibrado, SmolLM2-1.7B, Llama-3.2-3B-Instruct, Phi-4-mini-instruct y OLMo-2-7B-Instruct, con pérdidas de hasta 9/160 ítems de tarea.
- En OLMoE-1B-7B los efectos son mixtos y no significativos en tarea (p entre 0,076 y 0,38); no debe interpretarse como mejora general en MoE.
- La validación se limita a cuatro ventanas por dominio; los intervalos no cubren otros textos ni otras distribuciones.
- La puerta mide KL de siguiente token, no precisión de tarea ni velocidad; no hay garantía de mejora en benchmarks downstream.
- No hay loader para Apple MLX/Metal ni validación en GPU NVIDIA; el soporte XPU depende de un PR abierto.
- El repositorio no declara idiomas soportados ni sesgos propios; cualquier sesgo o alucinación proviene del checkpoint base.
- La licencia Apache 2.0 cubre los sidecars, pero el uso comercial del checkpoint base depende de la licencia de `Qwen3.8-27B`, no disponible en la información proporcionada.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/SergiioB/biascorr-sidecars-v1
- Checkpoint base de referencia: `Qwen/Qwen3.8-27B` (revisión `8c0b3d30`)
- Checkpoint MLX-4bit objetivo: `TensorFold/Qwen3.8-27B-MLX-4bit` (revisión `22d8d538`)
- Checkpoint HF-INT4-G16-BC objetivo: `Qwen3.8-27B-HF-INT4-G16-BC`
- Paper, blog, repositorio de código y demo: no disponibles en la información proporcionada.
