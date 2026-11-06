# Beer-Gut-Boomer/Qwen3-Next-80B-A3B-MTP-blk48-Q4_K_M-Sidecar

## Resumen

`Qwen3-Next-80B-A3B-MTP-blk48-Q4_K_M-Sidecar` es un artefacto GGUF de pequeño tamaño (1,00 GiB, 20 tensores) publicado por el desarrollador independiente Thomas R. Burnsed Jr. (usuario `Beer-Gut-Boomer` en Hugging Face) que contiene exclusivamente el módulo de Multi-Token Prediction (MTP) NextN de la capa `blk.48` del modelo `Qwen/Qwen3-Next-80B-A3B-Instruct`. No es un modelo completo: es un sidecar de decodificación especulativa que debe emparejarse con la cuantización comunitaria `Qwen3-Next-80B-A3B-Instruct-Q4_K_M.gguf` (45,2 GiB) para funcionar.

El problema que resuelve es concreto: las cuantizaciones GGUF estándar de la comunidad eliminan el módulo `mtp.*` (512 expertos) que Qwen distribuye en el shard `model-00041-of-00041.safetensors` del modelo original, perdiendo así la capacidad de draft nativo para decodificación especulativa. Este repositorio reconstruye ese módulo en formato GGUF v3 con paridad exacta de stride (`1.899.136` bytes por experto) respecto a las capas `blk.0..47`, lo que permite cargarlo como `--draft-model` en el motor `PolyStrata` del autor.

La relevancia es acotada pero técnica: demuestra que es posible recuperar el MTP nativo de Qwen3-Next en entornos GGUF y reporta tasas de aceptación especulativa del 75,9% (MTP puro) y hasta 94,2% (híbrido N-gram + MTP) en hardware de gama alta de 2013 (Xeon E5-2697 v2 + Quadro P6000 de 24 GB). Está pensado para investigadores que experimenten con inferencia out-of-core de MoE en workstations, no para uso en producción general.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Sidecar GGUF del módulo NextN MTP (MoE, 512 expertos en `blk.48`) de Qwen3-Next |
| Parametros totales | 1.650.471.424 (según safetensors del repo; el sidecar GGUF pesa 1,00 GiB) |
| Parametros activos | No aplica al sidecar; el modelo base es MoE con top-10 de 512 expertos por capa |
| Longitud de contexto | 32.768 tokens (probado de 4K a 128K con `--kv-whole` en el motor PolyStrata) |
| Tipos de cuantizacion | Q4_K (gate/up experts), Q6_K (down experts), F32 (RMSNorm); sufijo Q4_K_M en el nombre |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF v3 (20 tensores, 1.075.449.280 bytes) |

## Arquitectura y entrenamiento

El sidecar replica la arquitectura NextN MTP de Qwen3-Next: una capa adicional (`blk.48`) con 512 expertos enrutados que predice tokens futuros para alimentar decodificación especulativa. El conversor propietario (`build_qwen3_next_80b_mtp_sidecar.cpp`, C++17 con AVX + F16C, 12 hilos) cuantiza `blk.48.ffn_gate_exps.weight` y `blk.48.ffn_up_exps.weight` (`[2048, 512, 512]`) a `GGML_TYPE_Q4_K` (589.824 B/experto) y `blk.48.ffn_down_exps.weight` (`[512, 2048, 512]`) a `GGML_TYPE_Q6_K` (719.488 B/experto), logrando un stride de `1.899.136` bytes por experto idéntico al de las capas `blk.0..47` del modelo base cuantizado. Además pliega el offset unitario `+1.0f` en los 7 tensores `Qwen3NextRMSNorm` en F32 (`eh_norm`, `enorm`, `hnorm`, `attn_norm`, `attn_q_norm`, `attn_k_norm`, `post_attention_norm`).

No hay entrenamiento: es un proceso de conversión y cuantización del módulo MTP original de Qwen. El autor acompaña el artefacto con una monografía de investigación sobre "ejecución armónica phase-locked" en inferencia MoE out-of-core, que describe el motor `PolyStrata` (`strata-poly v0.1.42` + Harmonic PLL `v1.0.0`) con el que se ejecuta. No se documentan datos de entrenamiento, RLHF ni DPO porque el sidecar hereda el comportamiento del modelo base.

## Capacidades

- Decodificación especulativa: actúa como `--draft-model` para acelerar la generación del modelo base Qwen3-Next-80B-A3B-Instruct.
- Predicción multi-token nativa (MTP/NextN) con 512 expertos enrutados.
- Aceptación especulativa medida: 75,9% (63/83) en modo MTP puro (`--lookup 0 --window 4`) y 90,7%–94,2% (81/86) en modo híbrido N-gram + MTP (`--lookup 3 --window 4`, gate 0,74).
- Tasa de acierto de expertos en VRAM del 100,0% (0,0 ms/token en expertos de CPU) cuando se combina con caché de expertos normalizada por capa (`norm = 1.0 / layer_sum`, boost de prioridad MTP de 1,5x).
- Compatibilidad con el motor PolyStrata y perfiles de expertos precalculados (`.profile`).
- No soporta tool calling, agentes, visión ni audio por sí mismo: esas capacidades pertenecen al modelo base.
- Idiomas soportados: no disponibles en la información del repositorio.

## Casos de uso

- Aceleración de inferencia de Qwen3-Next-80B-A3B en workstations: cargar el sidecar como `--draft-model` junto al GGUF Q4_K_M base para reducir el coste por token mediante decodificación especulativa con aceptación del 75,9%–94,2%.
- Investigación en decodificación especulativa: banco de pruebas reproducible para comparar MTP puro frente a híbrido N-gram + MTP con distintas ventanas (`--window`) y parámetros de lookup (`--lookup`).
- Inferencia MoE out-of-core en hardware antiguo: el autor valida el flujo en un HP Z420 con Xeon E5-2697 v2 (12C/24T, AVX + F16C) y Quadro P6000 (24 GB, `sm_61`), demostrando viabilidad en GPUs sin tensor cores modernos.
- Reproducción de la monografía "Harmonic Phase-Locked Execution": el sidecar es el artefacto de referencia para replicar los experimentos de phase-locking y caché de expertos del paper del autor.
- Recuperación de módulos MTP perdidos en cuantizaciones comunitarias: sirve como plantilla metodológica para reconstruir otros sidecars MTP en GGUF con paridad de stride.
- Benchmarking de calidad bajo drift: el autor reporta suites de "quality-drift" (N=5 smoke + N=200) sobre GSM8K y ARC-Challenge para verificar que el sidecar no degrada la salida del modelo base.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (no verificados de forma independiente):

| Benchmark | Tarea | Metrica | Valor | Notas |
|---|---|---|---|---|
| GSM8K | Razonamiento matemático | Exact Match | 100,0 | N=5 smoke + N=200 quality-drift, ±1,4% IC 95% |
| ARC-Challenge | Razonamiento científico | Accuracy | 100,0 | N=5 smoke + N=200 quality-drift, ±1,4% IC 95% |

Métricas de aceptación especulativa reportadas:

| Modo | Configuración | Aceptación |
|---|---|---|
| MTP puro | `--lookup 0 --window 4` | 75,9% (63/83) |
| Híbrido N-gram + MTP | `--lookup 3 --window 4`, gate 0,74 | 90,7%–94,2% (81/86) |
| Acierto expertos VRAM | caché normalizada + boost 1,5x | 100,0% (0,0 ms/token en CPU) |

## Requisitos de hardware

- VRAM del sidecar: 1,00 GiB adicional sobre el modelo base (45,2 GiB en Q4_K_M); footprint total documentado de 46,2 GiB.
- GPU validadas por el autor: NVIDIA Quadro P6000 (24 GB GDDR5X, `GP102`, `sm_61`, PCIe 3.0 x16).
- CPU: Xeon E5-2697 v2 (12C/24T, Ivy Bridge-EP) con 12 hilos fijados a núcleos físicos (`--threads 12`, sin SMT); requiere AVX + F16C.
- RAM: 64 GB DDR3 ECC quad-channel en la estación de referencia.
- Compilación: `-O3 -DCMAKE_CUDA_ARCHITECTURES=61 -march=ivybridge -mtune=ivybridge -mavx -msse4.2 -mf16c`.
- Motor de despliegue: exclusivamente `PolyStrata` (`strata-poly`); no se documenta compatibilidad con llama.cpp, vLLM, Ollama ni TGI.
- Latencia y throughput: no disponibles de forma agregada; solo se reporta 0,0 ms/token en expertos servidos desde CPU gracias al 100% de acierto en VRAM.
- No cabe en GPUs de consumo tipo RTX 4090 (24 GB) por sí solo: el modelo base Q4_K_M ocupa 45,2 GiB y requiere esquema out-of-core o multi-GPU.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-Next-80B-A3B-MTP-blk48-Q4_K_M-Sidecar | Sidecar MTP GGUF | 1,65 B (sidecar) | 32.768 | Apache-2.0 | Hugging Face (0 descargas) |
| Qwen/Qwen3-Next-80B-A3B-Instruct | Modelo base MoE | 80 B totales / 3 B activos | No disponible | Apache-2.0 | Hugging Face oficial |
| Cuantizaciones comunitarias Q4_K_M de Qwen3-Next-80B-A3B | GGUF sin MTP | 80 B (Q4_K_M, 45,2 GiB) | No disponible | Apache-2.0 | Hugging Face (múltiples autores) |

No se dispone de datos de benchmarks independientes que permitan comparar rendimiento frente a alternativas de decodificación especulativa (EAGLE, Medusa, draft models pequeños) en el mismo hardware.

## Limitaciones y advertencias

- El artefacto no es un modelo autónomo: sin el GGUF base `Qwen3-Next-80B-A3B-Instruct-Q4_K_M.gguf` no genera texto.
- Dependencia total del motor `PolyStrata` del autor; no hay evidencia de compatibilidad con llama.cpp, vLLM u otros runtimes GGUF estándar.
- Los benchmarks GSM8K y ARC-Challenge al 100% con N=5 smoke + N=200 son sospechosamente altos y están marcados como `verified: false`; deben tratarse con escepticismo y no como resultados reproducibles independientes.
- El repositorio tiene 0 descargas y 0 likes en el momento de la ficha: no hay validación de la comunidad.
- La model card incluye referencias a herramientas ("Gemini 4 Argon") y afirmaciones de investigación no revisadas por pares; la monografía y el código están en un repositorio personal de GitHub.
- Idiomas soportados no documentados en el sidecar; hereda los del modelo base pero no se especifican.
- Riesgo de alucinación y sesgos: no evaluados específicamente para este sidecar; aplican los del modelo base Qwen3-Next.
- Licencia Apache-2.0 permite uso comercial, pero la viabilidad práctica en producción está limitada por el motor propietario y el hardware requerido (46,2 GiB de footprint).
- El nombre "Q4_K_M" en el sidecar se refiere a la mezcla Q4_K/Q6_K de los expertos, no a una cuantización completa del modelo base.

## Enlaces

- Hugging Face: https://huggingface.co/Beer-Gut-Boomer/Qwen3-Next-80B-A3B-MTP-blk48-Q4_K_M-Sidecar
- Modelo base: https://huggingface.co/Qwen/Qwen3-Next-80B-A3B-Instruct
- Repositorio de investigación y código: https://github.com/Hypo30285/Harmonic-Phase-Locked-MoE-Inference
- Perfil del autor en GitHub: https://github.com/Hypo30285
- Perfil del autor en Hugging Face: https://huggingface.co/Beer-Gut-Boomer
- Ficha de Gemini 4 Argon (Artificial Analysis): https://artificialanalysis.ai/models/gemini-4-argon
- Ficha de Gemini 4 Argon (OpenRouter): https://openrouter.ai/google/gemini-4-argon
