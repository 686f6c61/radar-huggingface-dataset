# qwegnai/ERNIE-5.5-Flash-Preview-hq4g32m5-hq8head-shvq15g64-shvq3g64

## Resumen

ERNIE-5.5-Flash-Preview es un modelo de lenguaje de tipo Mixture-of-Experts (MoE) desarrollado por Baidu, con 280 000 millones de parámetros totales y 14 000 millones activos por token. Esta ficha concreta no es el modelo original, sino un *pack* de pesos cuantizados publicado por el usuario qwegnai para el motor de inferencia Qwegn (Swift 6.2 + Metal 4), orientado exclusivamente a Apple Silicon. El pack comprime el modelo original hasta 77,91 GiB (2,36 bits por parámetro) mediante una combinación de cuantización mixta HQ4, HQ8 y SHVQ, e incluye un borrador especulativo DSpark y un índice FlashIndexer.

La relevancia de esta publicación es doble. Por un lado, demuestra que un MoE de 280 000 millones de parámetros puede residir al 100 % en la memoria unificada de un Mac de 128 GB, con velocidades de *prefill* de 1 544,9 tok/s a 4K y decodificación especulativa de hasta 110,6 tok/s. Por otro, ilustra una tendencia creciente: la cuantización extrema por debajo de 3 bits por parámetro aplicada selectivamente (expertos en 1,75-3,25 bpw, proyecciones densas en 5 bpw, cabeza de salida en 8,5 bpw) para preservar calidad donde más importa.

El modelo base soporta un contexto nativo de 1 048 576 tokens, arquitectura `ernie5_5_moe` con atención fuertemente comprimida (HCA 128:1) y MLA con decodificación dispersa, y está disponible bajo licencia Apache 2.0. Esta variante concreta solo carga en Qwegn v0.41.0 o superior y no es compatible con safetensors, GGUF ni MLX.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `ernie5_5_moe` (transformer MoE con HCA y MLA-DSA) |
| Parametros totales | 280 000 millones |
| Parametros activos | 14 000 millones por token |
| Longitud de contexto | 1 048 576 tokens (nativo) |
| Tipos de cuantizacion | HQ4_G32_M5 (5,0 bpw), HQ8_G32 (8,5 bpw), SHVQ15_G64 (1,75 bpw), SHVQ3_G64 (3,25 bpw), BF16, F32; media 2,36 bits/parametro |
| Idiomas soportados | Ingles (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | QWP1 (contenedor propietario de Qwegn); no compatible con safetensors, GGUF ni MLX |

## Arquitectura y entrenamiento

El modelo base emplea la arquitectura `ernie5_5_moe`, con 43 capas: 37 capas de atención fuertemente comprimida (HCA 128:1) con ventana deslizante de 128 tokens, y 6 capas de MLA-DSA desacopladas con RoPE y `FlashIndexer` de Walsh-Hadamard de 64 cabezas. La primera capa (L0) es densa y las 42 restantes son MoE, cada una con 512 expertos enrutados (top-10 con sigmoid de doble división) más un experto compartido de 2048 de dimensión intermedia y `moe_latent_size=2048`. Incorpora un mecanismo mHC (multi-head compression) de 4 flujos con Sinkhorn-20, cabeza de salida `MultiMax`, 4096 de dimensión oculta y un vocabulario de 201 216 tokens. El chat usa el formato nativo `chatv2p3` con soporte de tool calling paralelo mediante `<ernie:tool_call>`.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en el modelo base. La innovación técnica destacable de este pack es la cuantización mixta selectiva: los expertos enrutados `gate_proj` y `up_proj` se comprimen con SHVQ15_G64 (1,75 bpw, LUT esférica), los `down_proj` con SHVQ3_G64 (3,25 bpw), las proyecciones densas, expertos compartidos y proyecciones HCA/MLA con HQ4_G32_M5 (5,0 bpw), y la cabeza de salida con HQ8_G32 (8,5 bpw). Se incluye además un borrador especulativo DSpark (4,39 GiB) y un índice QLSA v1 para decodificación especulativa con presupuesto de expertos.

## Capacidades

- Generación de texto en inglés y chino con contexto nativo de hasta 1 048 576 tokens.
- Razonamiento multi-paso con modo `--reasoning low` y `--reasoning off` configurables.
- Generación de código: 78/100 en Code-100 con razonamiento bajo (45/50 HumanEval, 33/50 MBPP).
- Tool calling paralelo nativo mediante el formato `<ernie:tool_call>`.
- Capacidades de agente y razonamiento multi-turno (supera 9/9 pruebas de multi-turno y multi-knob Law 28).
- Recuperación verbatim en contexto largo: 3/3 needles a 16K.
- Decodificación especulativa con DSpark (hasta 7,11 tokens por paso, 3,47× de aceleración).
- Caché de prefijo en caliente con aceleración de 38× (de 1 140 ms a 30 ms).

## Casos de uso

- **Atención al cliente automatizada en chino e inglés**: el modelo gestiona conversaciones multi-turno con contexto de hasta 1M tokens, lo que permite mantener historiales completos de cliente sin truncamiento y recuperar información verbatim de interacciones previas.
- **Generación de código en pipelines de CI/CD**: con tool calling paralelo y 78/100 en Code-100, puede integrarse en flujos de revisión automática, generación de tests y parcheo de código, invocando herramientas externas de compilación o análisis estático.
- **Análisis de documentación técnica extensa**: la ventana de 1M tokens y la recuperación verbatim a 16K permiten procesar manuales, normativas o bases de código completas en una sola pasada sin fragmentación por RAG.
- **Agentes autónomos de investigación**: el soporte de razonamiento multi-paso y tool calling paralelo facilita la orquestación de agentes que consultan APIs, sintetizan resultados y deciden siguientes acciones.
- **Asistentes de desarrollo en local sobre Apple Silicon**: al residir al 100 % en un Mac de 128 GB con 89,48 tok/s en JSON y 63,92 tok/s en código, es viable como asistente privado sin enviar datos a la nube.
- **Procesamiento de contratos y documentación legal bilingüe**: la combinación de contexto largo, capacidades bilingües en/zh y recuperación verbatim permite extraer cláusulas y comparar versiones de documentos extensos.
- **Prototipado de aplicaciones de IA en estación de trabajo**: el pack permite experimentar con un MoE de 280B en hardware de consumo profesional (M5 Max) sin infraestructura de servidores GPU.

## Benchmarks y rendimiento

Resultados medidos en un Apple M5 Max (Mac17,6, 128 GB de memoria unificada, GPU Apple10 NAX de 40 núcleos, macOS 26.2+) con Qwegn v0.41.0+, `--kv-mode q4 --temperature 0 --no-profile`:

| Metrica | Resultado |
|---|---|
| Prefill CLI 4K (4 087 tok) | 1 544,9 tok/s GPU (1 540,9 wall) |
| Prefill CLI 16K (d=0 / DSpark) | 1 259,9 tok/s / 1 165,5 tok/s |
| Decodificación serial (mtp=0) | 43,28-44,78 tok/s (100 % repetibilidad SHA-256) |
| Decodificación DSpark d=7 (128 tok) | 89,48 tok/s JSON / 63,92 tok/s Code / 62,65 tok/s Prose |
| Pico especulativo | 110,6 tok/s (7,11 tok/paso, 3,47×) |
| Caché de prefijo en caliente | 38× (1 140 → 30 ms) |
| Conformidad API | 291/291 (100 %) |
| Fidelidad | 36/36 (100 %), 0,998 top-1 medio, 3/3 determinismo |
| Code-100 (`--reasoning low`) | 78/100 (45/50 HumanEval, 33/50 MBPP) |
| Code-100 (`--reasoning off`) | 75/100 |
| Needles verbatim 16K | 3/3 (100 %) |
| Law 28 multi-turno | 9/9 PASS, 0 errores, 0 allocs en estado estacionario |

No se han publicado resultados de benchmarks estándar (MMLU, GSM8K, etc.) del modelo base en la información disponible.

## Requisitos de hardware

- **VRAM / memoria unificada**: el pack requiere 77,91 GiB en disco y ocupa 76,37 GiB de arena de pesos en GPU; con CLI en 4K-16K el consumo de RAM medido es de 82,06-82,30 GiB.
- **Hardware validado**: Apple M5 Max con 128 GB de memoria unificada y GPU Apple10 NAX de 40 núcleos. No hay validación publicada en otros equipos Apple Silicon.
- **Cabe en GPU de consumo**: no aplica a GPUs discretas NVIDIA/AMD; el pack es exclusivo para Apple Silicon con Metal 4.
- **Opciones de despliegue**: únicamente el motor Qwegn v0.41.0 o superior (Swift 6.2 + Metal 4). No es compatible con vLLM, llama.cpp, Ollama, TGI ni MLX.
- **Latencia y throughput**: TTFT de 203 ms con 8 775 tokens; prefill de 1 111-1 544,9 tok/s según longitud; decodificación de 43-110 tok/s según modo (serial o especulativa).
- **Almacenamiento**: 88,4 GB de repositorio (model.qwp 83,66 GB, dspark.qwp 4,39 GiB, flashindexer.qwp 3,00 MiB más assets).

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Formato / disponibilidad |
|---|---|---|---|---|---|
| ERNIE-5.5-Flash-Preview (este pack, Track C) | 280B | 14B | 1 048 576 | Apache 2.0 | QWP1, solo Qwegn, Apple Silicon |
| ERNIE-5.5-Flash-Preview (variante HQ8_G32) | 280B | 14B | 1 048 576 | Apache 2.0 | QWP1, solo Qwegn, 81,57 GiB, 81-83/100 Code-100 |
| baidu/ERNIE-5.5-Flash-Preview (original) | 280B | 14B | 1 048 576 | Apache 2.0 | Pesos originales del autor (formato no especificado en la información disponible) |

No se dispone de datos de benchmarks comparativos con otros modelos de la misma categoría (por ejemplo, otros MoE de ~280B) en la información proporcionada.

## Limitaciones y advertencias

- **Compatibilidad restringida**: el pack solo carga en Qwegn v0.41.0+ sobre Apple Silicon con Metal 4; no es un safetensors, GGUF ni MLX, por lo que no puede usarse en ecosistemas estándar de inferencia.
- **Idiomas limitados**: solo inglés y chino; no hay soporte declarado para castellano ni otros idiomas.
- **Sesgos**: no se documentan sesgos conocidos del modelo base ni evaluaciones de seguridad en la información disponible; al ser un modelo de Baidu entrenado principalmente en en/zh, es probable un sesgo cultural hacia esos mercados (no cuantificado).
- **Alucinación**: no se publican tasas de alucinación ni evaluaciones de veracidad; la fidelidad reportada (36/36, 0,998 top-1) mide determinismo frente al modelo de referencia, no corrección factual.
- **Rendimiento dependiente del hardware**: todas las métricas se midieron en un M5 Max de 128 GB; en equipos con menos memoria unificada el modelo no residirá al 100 % y el rendimiento caerá drásticamente o no cargará.
- **Cuantización agresiva**: 2,36 bits/parámetro de media implica pérdida de precisión; la propia model card reconoce que la variante HQ8_G32 obtiene 81-83/100 en Code-100 frente a 78/100 de esta variante.
- **Licencia**: Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base de Baidu y del motor Qwegn por separado.
- **Madurez**: 0 descargas y 0 likes en el momento de la ficha; es una publicación reciente (25 de noviembre de 2026) sin validación comunitaria independiente.

## Enlaces

- Pack cuantizado en Hugging Face: https://huggingface.co/qwegnai/ERNIE-5.5-Flash-Preview-hq4g32m5-hq8head-shvq15g64-shvq3g64
- Modelo base: https://huggingface.co/baidu/ERNIE-5.5-Flash-Preview
- Variante HQ8_G32 (mayor precisión): https://huggingface.co/qwegnai/ERNIE-5.5-Flash-Preview-hq8g32-shvq15g64-shvq3g64
- Motor de inferencia Qwegn: https://github.com/qwegnai/qwegn
