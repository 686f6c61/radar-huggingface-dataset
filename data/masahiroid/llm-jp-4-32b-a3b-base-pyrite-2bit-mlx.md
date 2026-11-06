# masahiroid/llm-jp-4-32b-a3b-base-Pyrite-2bit-MLX

## Resumen

`llm-jp-4-32b-a3b-base-Pyrite-2bit-MLX` es una cuantización ultra-baja precisión (2 bits con asignación mixta) del modelo base `llm-jp/llm-jp-4-32b-a3b-base`, desarrollada por el usuario `masahiroid` mediante el pipeline **Project Pyrite**. El modelo original es un LLM de arquitectura Qwen3-MoE con 31,8B de parámetros totales y 3,0B activos por token, entrenado por el equipo japonés LLM-jp para japonés e inglés.

El problema que resuelve esta versión es doble: por un lado, hacer que un modelo MoE de 32B quepa en la memoria unificada de 16 GB de un Mac con Apple Silicon (los pesos ocupan 9,81 GiB); por otro, evitar los problemas típicos de las cuantizaciones uniformes a 2 bits en MoE, como bucles de repetición y colapso estructural, mediante una asignación de bits sensible a la sensibilidad de cada proyección.

Es relevante porque demuestra que una cuantización de 2 bits con reasignación inteligente de bytes puede superar a la línea base uniforme de `mlx-lm` sin coste adicional de memoria: reduce la divergencia KL frente al profesor BF16 un 10,98 % y mejora la perplejidad en japonés e inglés, alcanzando velocidades de decodificación de 34–49 tokens/segundo en un Apple M2 Pro de 16 GB.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Qwen3-MoE (transformer MoE, 32 capas, 128 expertos enrutados, top-8 routing) |
| Parámetros totales | 32.139.028.992 (≈31,8B) |
| Parametros activos | ≈3,0B por token (8 de 128 expertos) |
| Longitud de contexto | No disponible (el README menciona pruebas a 4096 tokens, pero no especifica el máximo) |
| Tipos de cuantización | Mixta: 2-bit (expertos mayoritarios, group_size=128), 3-bit (proyecciones sensibles, group_size=64), 4-bit (embeddings, lm_head, proyecciones de atención), 8-bit (routers MoE, group_size=64) |
| Idiomas soportados | Japonés (ja), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (formato MLX, librería `mlx`) |

## Arquitectura y entrenamiento

El modelo base es un transformer de tipo mixture-of-experts con 32 capas y 128 expertos enrutados por capa, de los cuales se activan 8 por token (top-8 routing), lo que reduce el cómputo por token a unos 3.000 millones de parámetros activos. Los expertos suponen el 94,8 % del total de parámetros del modelo, lo que los convierte en el objetivo principal de la compresión. El modelo original es un modelo base (no instruct) entrenado por LLM-jp; los detalles del preentrenamiento (tokens, composición del dataset, RLHF/DPO) no están disponibles en la información proporcionada.

La innovación principal de esta versión es el pipeline **Project Pyrite**, una cuantización consciente de la sensibilidad con presupuesto de bytes estrictamente idéntico al de una cuantización uniforme 2-bit/group_size=64 de `mlx-lm` (10.533.950.464 bytes de tensores, 9,81 GiB). La estrategia consiste en:

- Reducir la precisión de los metadatos de escala en `gate_proj` y `up_proj` de los expertos (group_size de 64 a 128, 2,25 bits efectivos), ahorrando 629.145.600 bytes.
- Reinvertir esos bytes para subir a 3 bits (group_size=64, 3,50 bits efectivos) las 15 proyecciones más sensibles a outliers: los `down_proj` de las capas L21–L31 y los `gate_proj`/`up_proj` de L29–L31.
- Proteger los 32 routers MoE (`mlp.gate.weight`) a 8 bits/group_size=64 (coste total de solo 0,0098 GiB), preservando un 98,25 % de concordancia en la selección top-8 de expertos frente al profesor BF16.
- Proteger `embed_tokens`, `lm_head` y las proyecciones de atención GQA a 4 bits/group_size=64.

## Capacidades

- Generación de texto en japonés e inglés (modelo base, sin ajuste por instrucciones).
- Inferencia eficiente en dispositivo gracias a la arquitectura MoE: solo se evalúan 8 de 128 expertos por token (~3,0B parámetros activos).
- Compatibilidad nativa con `mlx-lm` (usa capas estándar `QuantizedLinear` y `QuantizedSwitchLinear`), sin necesidad de código adicional.
- Preservación del comportamiento de enrutamiento del modelo original: 98,25 % de fidelidad en la selección top-8 de expertos respecto al modelo BF16.
- No hay información sobre tool calling, capacidades de agente, visión, audio ni modo de razonamiento; al ser un modelo base, no está diseñado para seguir instrucciones.

## Casos de uso

- **Experimentación local con LLM grandes en Macs de 16 GB**: permite cargar y ejecutar un MoE de 32B parámetros completos en un Apple M2 Pro de 16 GB, algo inviable en BF16, ideal para desarrolladores que investigan MoE sin acceso a GPUs de datacenter.
- **Investigación en cuantización ultra-baja**: sirve como referencia reproducible (con DOI en Zenodo y paper asociado) para estudiar asignación de bits sensible a la sensibilidad en modelos MoE.
- **Generación de texto en japonés en local**: útil para redacción de borradores, continuación de texto y análisis lingüístico en japonés sin enviar datos a servicios externos, aprovechando la especialización del modelo base de LLM-jp.
- **Prototipado de aplicaciones de texto en inglés**: como modelo base, puede usarse para few-shot prompting, clasificación por ejemplos o generación creativa en inglés.
- **Inferencia de flujo único de alta velocidad en portátiles**: con 34–49 tokens/segundo en un M2 Pro, es adecuado para asistentes locales interactivos donde la latencia de decodificación importa.
- **Comparación de calidad post-cuantización**: permite evaluar en local la degradación real de una cuantización a 2 bits mixta frente a la línea base uniforme de `mlx-lm`, midiendo perplejidad o divergencia KL en datos propios.

## Benchmarks y rendimiento

Datos publicados en la model card (evaluación de la cuantización frente al modelo BF16):

| Métrica | Línea base mlx-lm 2-bit (gs=64) | Pyrite 2-bit mixto | Mejora |
|---|---|---|---|
| Divergencia KL vs BF16 (general) | 0,3583 | 0,3190 | −10,98 % |
| Perplejidad (held-out japonés) | 10,84 | 10,35 | −4,52 % |
| Divergencia KL (held-out inglés) | — | — | −12,94 % |
| Perplejidad (held-out inglés) | 5,83 | 5,42 | −7,03 % |
| Fidelidad top-8 del router | — | 98,25 % | — |
| Presupuesto de bytes de tensores | 10.533.950.464 | 10.533.950.464 | idéntico (0 bytes de sobrecoste) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible, ni para este modelo cuantizado ni para el modelo base.

## Requisitos de hardware

- **VRAM/memoria requerida**: 9,81 GiB de pesos; pico de memoria de 10,11 GiB a longitud de contexto 4096. Diseñado específicamente para caber en 16 GB de memoria unificada de Apple Silicon.
- **Hardware de referencia**: Apple M2 Pro con 16 GB de RAM, alcanzando 34–49 tokens/segundo en decodificación de flujo único.
- **Consumer GPUs NVIDIA**: no disponible; el formato MLX está orientado a Apple Silicon y no se ha documentado compatibilidad con CUDA.
- **Ajuste recomendado en Macs de 16 GB**: elevar el límite de memoria "wired" de Metal a 11,0 GiB (`mx.set_wired_limit`) y materializar las capas secuencialmente con `mx.eval` para evitar paginación a SSD.
- **Despliegue**: mediante la librería `mlx-lm` (`pip install -U mlx-lm`), con carga estándar vía `mlx_lm.load`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- **Latencia y throughput**: 34–49 tokens/segundo en Apple M2 Pro (16 GB) en decodificación de flujo único, una vez residentes los pesos en memoria unificada.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Parámetros activos | Cuantización | Memoria de pesos | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| llm-jp-4-32b-a3b-base-Pyrite-2bit-MLX | ≈31,8B | ≈3,0B | 2-bit mixto (Pyrite) | 9,81 GiB | Apache 2.0 | Hugging Face (MLX) |
| llm-jp/llm-jp-4-32b-a3b-base (BF16) | ≈31,8B | ≈3,0B | BF16 (sin cuantizar) | ≈60–64 GiB (estimado) | No disponible | Hugging Face |
| Línea base mlx-lm 2-bit uniforme del mismo modelo | ≈31,8B | ≈3,0B | 2-bit uniforme (gs=64) | 9,81 GiB | No disponible | Reproducible con mlx-lm |

Comparativas con otros MoE de tamaño similar (Qwen3-30B-A3B, etc.) no disponibles en la información proporcionada; no se han publicado números que permitan una comparación cuantitativa de calidad entre ellos.

## Limitaciones y advertencias

- **Es un modelo base, no instruct**: no está ajustado para seguir instrucciones ni para chat; requiere prompting few-shot o fine-tuning posterior para tareas dirigidas.
- **Cuantización agresiva**: aunque mejora la línea base 2-bit uniforme, sigue siendo una cuantización de ultra-baja precisión; puede haber degradación en tareas de razonamiento complejo, código o matemáticas respecto al modelo BF16. No hay benchmarks de tareas downstream que lo cuantifiquen.
- **Restringido a Apple Silicon**: el formato MLX no funciona en GPUs NVIDIA ni en la mayoría de entornos de servidor habituales (vLLM, TGI); su uso práctico queda limitado a Macs.
- **Idiomas limitados**: el modelo base está orientado a japonés e inglés; el rendimiento en castellano u otros idiomas no está documentado y probablemente sea inferior.
- **Riesgo de alucinación y sesgos**: al ser un modelo de lenguaje autorregresivo, puede generar contenido falso o sesgado; no hay evaluaciones de seguridad publicadas en la información disponible.
- **Contexto probado solo hasta 4096 tokens**: el pico de memoria de 10,11 GiB se mide a esa longitud; contextos mayores podrían superar el presupuesto de memoria de un Mac de 16 GB y provocar paginación a SSD con caída drástica de velocidad.
- **Proyecto de un autor individual**: con 492 descargas y sin likes en el momento de la ficha, carece del respaldo comunitario y de auditoría de los modelos oficiales; conviene validar la calidad en el caso de uso concreto antes de producción.
- **Licencia Apache 2.0**: permite uso comercial, pero hay que verificar la licencia del modelo base subyacente (`llm-jp/llm-jp-4-32b-a3b-base`), que no está indicada en la información disponible.

## Enlaces

- Modelo cuantizado (Hugging Face): https://huggingface.co/masahiroid/llm-jp-4-32b-a3b-base-Pyrite-2bit-MLX
- Modelo base (Hugging Face): https://huggingface.co/llm-jp/llm-jp-4-32b-a3b-base
- Paper (PDF en el repositorio): https://huggingface.co/masahiroid/llm-jp-4-32b-a3b-base-Pyrite-2bit-MLX/blob/main/pyrite_en.pdf
- DOI en Zenodo: https://doi.org/10.5281/zenodo.23786705
- Model card en japonés (README_ja.md): https://huggingface.co/masahiroid/llm-jp-4-32b-a3b-base-Pyrite-2bit-MLX/blob/main/README_ja.md
