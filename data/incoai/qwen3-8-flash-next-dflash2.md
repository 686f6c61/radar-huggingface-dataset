# incoai/Qwen3.8-Flash-Next-DFlash2

## Resumen

DFlash 2 es un modelo borrador (*draft model*) de decodificación especulativa desarrollado por Inco AI para acelerar la inferencia de `Qwen/Qwen3.8-Flash-Next`. No es un modelo de lenguaje autónomo: se ejecuta dentro de un servidor de decodificación especulativa (SGLang) y propone bloques de tokens que el modelo objetivo verifica. Su tamaño es de 603.065.600 parámetros (unos 603 M), con pesos en safetensors y un repositorio de 1,2 GB.

La innovación principal es que sustituye el borrador autorregresivo clásico por un *drafter* de difusión por bloques: predice un bloque completo de tokens en una sola pasada, conserva los mejores candidatos en cada posición y un selector ligero traza una única trayectoria coherente entre ellos. La decodificación resultante es sin pérdida (*lossless*): la salida greedy coincide exactamente con la del modelo objetivo y el muestreo preserva su distribución.

Es relevante ahora porque ofrece una mejora medible frente al MTP integrado de Flash-Next: en la evaluación del autor con un bloque especulativo de 4 tokens (3 borradores por paso de verificación), DFlash 2 alcanza velocidades de 1,79× frente a autorregresivo en GSM8K a concurrencia 1, frente a 1,59× del MTP, y gana también a concurrencias 8 y 32. La licencia es Apache 2.0 y el modelo se distribuye ya publicado en HuggingFace (con 25 likes y 0 descargas en el momento de la consulta).

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo borrador de difusión por bloques (*block diffusion*) para decodificación especulativa; backbone con convoluciones dinámicas de dos tomas (*two-tap*) y selector de trayectoria de candidatos |
| Parametros totales | 603.065.600 (~603 M) |
| Parametros activos | No aplica: no es un modelo MoE según la información disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | El modelo se sirve sin cuantizar (`--speculative-draft-model-quantization unquant` en SGLang); no se documentan otros formatos (GGUF, AWQ, GPTQ) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repositorio de 1,2 GB) |
| Modelo base / objetivo | `Qwen/Qwen3.8-Flash-Next` (evaluado con `Qwen/Qwen3.8-Flash-Next-FP8`) |
| Libreria | transformers |
| Pipeline | text-generation (`inference: false`, no es un modelo autónomo) |
| Tamano de bloque especulativo | 4 (3 tokens borrador por paso de verificación), limitado por la implementación actual de QSA |
| Fecha de publicacion | 2026-10-19 (creación); 2026-10-19 (última actualización) |

## Arquitectura y entrenamiento

DFlash 2 es un *drafter* de difusión por bloques: en lugar de generar token a token, predice un bloque completo en una sola pasada y mantiene el conjunto de mejores candidatos en cada posición del bloque. Sobre esos candidatos, un selector ligero traza un camino coherente que se envía al modelo objetivo para su verificación. Para evitar la degradación típica del borrador hacia el final del bloque, el backbone incorpora convoluciones dinámicas de dos tomas (*two-tap dynamic convolutions*). La decodificación es sin pérdida: la salida greedy coincide exactamente con la del objetivo y el muestreo preserva su distribución.

El modelo se integra en SGLang con atención `trtllm_mha` en el borrador, y en el objetivo utiliza Qwen Sparse Attention (QSA) para las capas de atención dispersa y Gated DeltaNet con prefill/decode en FlashInfer y verificación en Triton. El número de tokens de entrenamiento, la composición del corpus y si hubo RLHF o DPO no están disponibles en la información proporcionada. La model card únicamente referencia el blog de DFlash 2 y el artículo original de DFlash (ICML 2026) para los detalles metodológicos.

## Capacidades

- Generación de borradores de tokens en paralelo por bloques para un modelo objetivo `Qwen/Qwen3.8-Flash-Next`.
- Decodificación sin pérdida: la salida greedy es idéntica a la del modelo objetivo y el muestreo reproduce su distribución.
- Selección de trayectoria entre candidatos por posición mediante un selector ligero.
- Mantenimiento de la calidad del borrador a lo largo del bloque mediante convoluciones dinámicas de dos tomas.
- Integración con SGLang mediante el algoritmo especulativo `DFLASH` y el flag `--speculative-draft-model-path`.
- Compatibilidad con el backend de verificación Triton (`--linear-attn-verify-backend triton`) y `--mamba-ssm-dtype bfloat16` en el objetivo.
- No es un modelo autónomo: no genera texto por sí mismo, no soporta *tool calling*, ni agentes, ni visión, ni audio, ni modo *thinking* propio.
- Idiomas soportados: no disponibles (heredados, en su caso, del modelo objetivo, que no se documenta en esta ficha).

## Casos de uso

- Servicio interactivo de baja latencia sobre Flash-Next: desplegar `Qwen/Qwen3.8-Flash-Next-FP8` con DFlash 2 como borrador permite pasar de 205,4 a 368,2 tok/s en GSM8K a concurrencia 1, lo que reduce el tiempo hasta el primer token completo en asistentes conversacionales.
- Reducción de coste por token en producción: a concurrencia 32 en MT-Bench, DFlash 2 entrega 2.695,5 tok/s frente a 1.884,1 tok/s autorregresivo (1,43×), manteniendo la misma distribución de salida, por lo que no requiere revalidar la calidad del modelo objetivo.
- Generación de código en pipelines de CI/CD: con 1,72× de aceleración en HumanEval y 1,80× en MBPP a concurrencia 1, es adecuado para tareas de autocompletado y generación de parches donde el volumen de llamadas es alto.
- Razonamiento matemático por lotes: en MATH-500 alcanza 383,6 tok/s a concurrencia 1 (1,82×) y 3.173,3 tok/s a concurrencia 32 (1,53×), útil para evaluaciones masivas de problemas con cadenas de razonamiento largas.
- Despliegue de agentes multi-paso: al conservar exactamente la distribución del objetivo, se puede insertar en flujos agénticos existentes sin cambiar prompts ni parámetros de muestreo (temperatura 1.0, top-p 0.95, top-k 20, esfuerzo de razonamiento `xhigh`).
- Evaluación comparativa de técnicas de decodificación especulativa: sirve como referencia reproducible frente al MTP integrado de Flash-Next en GSM8K, MATH-500, HumanEval, MBPP y MT-Bench.
- Despliegue en un único acelerador: validado en una NVIDIA GB300 con TP1, lo que simplifica arquitecturas de serving sin paralelismo tensorial.

## Benchmarks y rendimiento

Evaluación del autor. Objetivo: `Qwen/Qwen3.8-Flash-Next-FP8` en SGLang sobre una NVIDIA GB300 (TP1). Muestreo con los parámetros recomendados por Flash-Next (temperatura 1.0, top-p 0.95, top-k 20), esfuerzo de razonamiento `xhigh`, máximo 4.096 tokens nuevos (incluidos los de razonamiento). 128 muestras a concurrencia 1; 1.024 a concurrencias 8 y 32.

Longitud de aceptación (tokens de finalización divididos entre pasos de verificación, concurrencia 1; mayor es mejor):

| Tarea | MTP | DFlash 2 |
| :--- | ---: | ---: |
| GSM8K | 3,08 | **3,26** |
| MATH-500 | 2,93 | **3,17** |
| HumanEval | 2,52 | **2,94** |
| MBPP | 2,65 | **3,06** |
| MT-Bench | 2,50 | **2,83** |

Throughput a concurrencia 1 (tok/s de salida y aceleración frente a autorregresivo):

| Tarea | Autorregresivo | MTP | DFlash 2 |
| :--- | ---: | ---: | ---: |
| GSM8K | 205,4 | 326,0 (1,59×) | **368,2 (1,79×)** |
| MATH-500 | 210,5 | 325,9 (1,55×) | **383,6 (1,82×)** |
| HumanEval | 211,3 | 296,9 (1,40×) | **363,8 (1,72×)** |
| MBPP | 210,5 | 304,7 (1,45×) | **378,3 (1,80×)** |
| MT-Bench | 211,2 | 285,1 (1,35×) | **343,8 (1,63×)** |

Throughput a concurrencia 8:

| Tarea | Autorregresivo | MTP | DFlash 2 |
| :--- | ---: | ---: | ---: |
| GSM8K | 924,8 | 1.122,5 (1,21×) | **1.312,6 (1,42×)** |
| MATH-500 | 998,1 | 1.248,4 (1,25×) | **1.473,1 (1,48×)** |
| HumanEval | 999,5 | 1.138,2 (1,14×) | **1.397,5 (1,40×)** |
| MBPP | 987,7 | 1.156,9 (1,17×) | **1.420,0 (1,44×)** |
| MT-Bench | 966,7 | 1.075,6 (1,11×) | **1.261,8 (1,31×)** |

Throughput a concurrencia 32:

| Tarea | Autorregresivo | MTP | DFlash 2 |
| :--- | ---: | ---: | ---: |
| GSM8K | 1.680,9 | 2.027,5 (1,21×) | **2.907,3 (1,73×)** |
| MATH-500 | 2.075,9 | 2.566,6 (1,24×) | **3.173,3 (1,53×)** |
| HumanEval | 2.072,2 | 2.321,2 (1,12×) | **3.039,6 (1,47×)** |
| MBPP | 2.044,0 | 2.390,8 (1,17×) | **3.131,0 (1,53×)** |
| MT-Bench | 1.884,1 | 2.201,8 (1,17×) | **2.695,5 (1,43×)** |

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval como métrica de acierto, etc.) del modelo borrador en la información disponible; por diseño, la calidad de salida es la del modelo objetivo.

## Requisitos de hardware

- VRAM del borrador: 603 M de parámetros en bfloat16 equivalen a aproximadamente 1,2 GB de pesos, más overhead de activaciones y del selector; el repositorio completo ocupa 1,2 GB.
- VRAM total: viene determinada por el modelo objetivo `Qwen/Qwen3.8-Flash-Next-FP8`, cuyo tamaño no está disponible en la información proporcionada.
- GPU validadas: una NVIDIA GB300 con TP1 en la evaluación del autor. No se documentan pruebas en A100, H100 ni RTX 4090.
- GPU de consumo: el borrador por sí solo (≈1,2 GB en bf16) cabría en cualquier GPU consumer con 8 GB o más; el requisito real lo impone el modelo objetivo. No hay validación publicada en GPU de consumo.
- Backend de despliegue: SGLang, con el commit `3c560089e1818a5217a73f2168273485a5350341` y el parche `patches/qwen38-dflash2-capture.patch` incluido en el repositorio (necesario para capturar features del objetivo hasta que el soporte llegue a upstream).
- Flags relevantes: `--speculative-algorithm DFLASH`, `--speculative-draft-model-path incoai/Qwen3.8-Flash-Next-DFlash2`, `--speculative-draft-model-quantization unquant`, `--speculative-num-draft-tokens 4`, `--linear-attn-verify-backend triton`, `--mamba-ssm-dtype bfloat16`.
- VLLM, llama.cpp, Ollama y TGI no se mencionan como soportados.
- Latencia y throughput: ver tablas de benchmarks (de 343,8 a 383,6 tok/s a concurrencia 1 según tarea; hasta 3.173,3 tok/s a concurrencia 32).

## Comparativa con modelos similares

Comparación con las alternativas evaluadas por el propio autor sobre el mismo objetivo (`Qwen3.8-Flash-Next-FP8`, GB300 TP1, bloque especulativo de 4 tokens, 3 borradores por paso de verificación):

| Metodo | Tipo | Borradores por paso | Longitud de aceptacion (GSM8K / MT-Bench) | Throughput C1 GSM8K | Throughput C32 MT-Bench | Licencia |
|---|---|---:|---|---:|---:|---|
| Decodificacion autorregresiva | Sin especulacion | 0 | 1,00 / 1,00 (referencia) | 205,4 tok/s (1,00×) | 1.884,1 tok/s (1,00×) | No aplica |
| MTP integrado de Flash-Next | Prediccion multi-token nativa | 3 | 3,08 / 2,50 | 326,0 tok/s (1,59×) | 2.201,8 tok/s (1,17×) | La del modelo objetivo |
| DFlash 2 (este modelo) | Difusion por bloques con selector | 3 | **3,26 / 2,83** | **368,2 tok/s (1,79×)** | **2.695,5 tok/s (1,43×)** | Apache 2.0 |

No se dispone de datos de otros borradores de decodificación especulativa (EAGLE, Medusa, hidia) en la información proporcionada, por lo que la comparativa se limita a las tres configuraciones evaluadas por el autor.

## Limitaciones y advertencias

- No es un modelo autónomo: la model card indica explícitamente `inference: false`. Solo funciona dentro de un servidor de decodificación especulativa y acoplado a `Qwen/Qwen3.8-Flash-Next`; no se puede usar con otro modelo objetivo.
- Requiere un parche no upstream: la captura de features de Flash-Next está en `patches/qwen38-dflash2-capture.patch` y solo está validada en TP1; fija además un commit concreto de SGLang, lo que complica el mantenimiento y las actualizaciones.
- Bloque especulativo limitado a 4 tokens (3 borradores) por la implementación actual de QSA; bloques mayores podrían cambiar las cifras de aceleración.
- Evaluación restringida a un único hardware (NVIDIA GB300, TP1) y al checkpoint FP8 oficial del objetivo; no hay datos de robustez en otras GPU, topologías, cuantizaciones ni backends.
- No se documentan sesgos, tasas de alucinación ni comportamiento multilingüe del borrador. Al ser una decodificación sin pérdida, la calidad semántica es la del modelo objetivo, pero cualquier sesgo del objetivo se hereda íntegramente.
- No se especifican limitaciones de longitud de contexto ni idiomas soportados; ambos dependen del modelo objetivo.
- Licencia Apache 2.0: permite uso comercial y modificación, pero conviene revisar también los términos del modelo base `Qwen/Qwen3.8-Flash-Next` y del checkpoint FP8 utilizado.
- Los resultados de rendimiento provienen del propio autor: no hay replicación independiente disponible.
- Los resultados de la búsqueda web realizada no contenían enlaces técnicos relevantes sobre este modelo (solo contenido no relacionado), por lo que no se incluyen.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/incoai/Qwen3.8-Flash-Next-DFlash2
- Blog de DFlash 2: https://inco.ai/blog/dflash2/
- Repositorio GitHub de DFlash: https://github.com/z-lab/dflash
- Modelo objetivo: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Checkpoint FP8 del objetivo (usado en la evaluación): https://huggingface.co/Qwen/Qwen3.8-Flash-Next-FP8
- SGLang (requerido para el despliegue): https://github.com/sgl-project/sglang
- Parche de captura de features: `patches/qwen38-dflash2-capture.patch` dentro del repositorio de HuggingFace
- Cita DFlash 2: Inco AI, «DFlash 2: Keep Drafting Parallel», agosto de 2026
- Cita DFlash original: Chen, Liang y Liu, «DFlash: Block Diffusion for Flash Speculative Decoding», ICML 2026
