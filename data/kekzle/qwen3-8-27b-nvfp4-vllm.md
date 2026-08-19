# kekzle/Qwen3.8-27B-NVFP4-vllm

## Resumen

El modelo `kekzle/Qwen3.8-27B-NVFP4-vllm` es una cuantización NVFP4 (W4A16) del modelo denso híbrido Qwen3.8-27B de Alibaba, desarrollada por el usuario kekzle. El modelo base es un vision-language model de 27.781 millones de parámetros con una ventana de contexto de 256K tokens, arquitectura híbrida GDN (con proyecciones GDN, torre de visión y cabezal de decodificación especulativa MTP) y licencia Apache 2.0. Esta versión cuantizada reduce los pesos de 51,75 GiB en BF16 a 19,2 GiB, lo que permite ejecutar el modelo en una única GPU de 32 GB con espacio para la caché KV.

La relevancia de este repositorio radica en que las exportaciones NVFP4 publicadas por el propio Qwen no funcionan en GPUs consumer Blackwell (`sm_120`) por usar atención en FP8, mientras que esta versión es weight-only NVFP4 (W4A16), compatible con dichas tarjetas. Está formateada con compressed-tensors en layout `nvfp4-pack-quantized`, por lo que carga directamente en vLLM y en el servidor `imp`. El autor la presenta como una alternativa para modelos sin exportación calibrada usable, con la advertencia de que la cuantización es experimental y no incluye calibración de activaciones.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Dense hybrid GDN (vision-language transformer) |
| Parametros totales | 27.781.427.952 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 256K tokens (del modelo base) |
| Tipos de cuantizacion | NVFP4 (FP4) weight-only, group size 16, W4A16 |
| Idiomas soportados | en (declarado en la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compressed-tensors, layout `nvfp4-pack-quantized`) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformer denso híbrido con proyecciones GDN (según la documentación de SGLang), que incorpora una torre de visión para entrada de imágenes y un cabezal MTP (multi-token prediction) para decodificación especulativa. El entrenamiento original no está detallado en la información proporcionada, pero se sabe que es un modelo de propósito general con capacidades de razonamiento, agente y visión.

La cuantización de este repositorio se realizó con la herramienta `imp-quantize` del proyecto `imp`, aplicando redondeo al más cercano (round-to-nearest) sin calibración de activaciones. Los pesos lineales de atención, MLP y proyecciones GDN se cuantizan a NVFP4 con group size 16, mientras que embeddings, `lm_head`, normas, torre de visión y cabezal MTP se mantienen en BF16. Una particularidad técnica es que las capas que el motor fusiona en un solo linear (como `q/k/v`, `gate/up` y los pares `in_proj_*` de GDN) comparten una única escala de tensor, lo que evita errores de dequantización al fusionar. La configuración de cuantización declara `input_activations: null`, por lo que vLLM la interpreta como NVFP4A16.

## Capacidades

- Generación de texto, razonamiento, código y matemáticas, heredadas del modelo base Qwen3.8-27B.
- Procesamiento de imágenes (visión) mediante la torre de visión, que se mantiene en precisión BF16 sin cuantizar.
- Decodificación especulativa con cabezal MTP (draft head) en BF16, lo que puede acelerar la generación en motores que lo soporten.
- Ventana de contexto larga de 256K tokens, útil para tareas con documentos extensos o conversaciones multi-turno.
- Compatible con vLLM (verificado en versión 0.27.1) y con el servidor `imp` mediante contenedor Docker.
- Soporte de tool calling y agentes no está confirmado explícitamente en la información proporcionada, aunque el modelo base lo incluye; la cuantización no altera estas capacidades.

## Casos de uso

- Despliegue local de un asistente multimodal en una GPU de 32 GB: con 17,9 GiB de pesos residentes y ~7,7 GiB libres para caché KV, permite ejecutar el modelo completo con contexto razonable en una RTX 5090.
- Servicio de inferencia en producción con vLLM: el formato compressed-tensors se carga directamente, evitando conversiones manuales, y admite `max_model_len` configurable.
- Prototipado de aplicaciones de visión-lenguaje en hardware consumer Blackwell: a diferencia de otras exportaciones NVFP4, esta funciona en `sm_120` al ser weight-only.
- Evaluación de impacto de cuantización en calidad: el autor proporciona mediciones de perplejidad y una suite de 45 comprobaciones de calidad, útil para comparar con el modelo BF16 original.
- Investigación en técnicas de cuantización sin calibración: el proceso `imp-quantize` es reproducible y sirve como referencia para cuantizar otros modelos de la misma familia.
- Integración en pipelines de generación aumentada por recuperación (RAG) con contexto largo, aprovechando los 256K tokens de ventana y la menor huella de memoria.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información proporcionada. La model card incluye mediciones propias del autor sobre una RTX 5090 con batch 1, greedy, usando `imp` 0.27:

| Metrica | Valor |
|---|---|
| Perplejidad (`ppl_corpus_45k.txt`, 13.5k tokens, GEMM determinista) | 4.6158 |
| Decode `tg128` | 87.4 tok/s (mediana de 3 procesos, dispersión 0.06 %) |
| Prefill `pp512` | 7 566 tok/s |
| Pesos residentes | 17.9 GiB (deja ~7.7 GiB para caché KV) |
| Suite de calidad (`degen_suite.py`, 45 comprobaciones) | 45/45 |

Estos datos son mediciones del autor, no comparativas con otros modelos.

## Requisitos de hardware

- VRAM estimada: 17,9 GiB para pesos, más la caché KV. Cabe en una GPU de 32 GB con espacio para contexto real (la model card indica que deja ~7,7 GiB para KV cache).
- GPU recomendadas: RTX 5090 (verificada), también compatible con DGX Spark según el foro de NVIDIA. No requiere GPU de datacenter.
- Compatible con GPUs consumer Blackwell (`sm_120`) al ser W4A16; las exportaciones NVFP4 con atención FP8 no funcionan en esa arquitectura.
- Opciones de despliegue: vLLM (verificado en 0.27.1), servidor `imp` (contenedor Docker), y SGLang (según su documentación, soporta checkpoints NVFP4 W4A4).
- Nota para WSL2: vLLM requiere `VLLM_WSL2_ENABLE_PIN_MEMORY=1` y `--gpu-memory-utilization` por debajo de ~0.92 porque WSLg consume ~1.2 GB.
- En `sm_120`, vLLM no tiene kernel FP4 nativo y usa Marlin, por lo que el throughput es inferior al de una GPU de datacenter.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Precision | Tamano pesos | VRAM necesaria | Licencia |
|---|---|---|---|---|---|---|
| Qwen/Qwen3.8-27B (BF16) | 27.8B | 256K | BF16 | 51.75 GiB | >64 GB | Apache 2.0 |
| Qwen/Qwen3.8-27B-FP8 (oficial) | 27.8B | 256K | FP8 (block 128, e4m3) | 26 952 MiB | >32 GB (no cabe con KV cache) | Apache 2.0 |
| unsloth/Qwen3.8-27B-NVFP4 | 27.8B | 256K | NVFP4 dinámico (4-bit MLP + 8-bit attention + FP8 KV) | no disponible | 32 GB (según Unsloth) | Apache 2.0 |
| kekzle/Qwen3.8-27B-NVFP4-vllm | 27.8B | 256K | NVFP4 W4A16 | 19.2 GiB | 32 GB | Apache 2.0 |

Según el foro de NVIDIA, la versión NVFP4 de Unsloth es un 30-34 % más rápida en generación que la FP8 oficial en DGX Spark, pero no se dispone de comparación directa con este repositorio. La ventaja de esta versión es que cabe en 32 GB con caché KV, algo que la FP8 oficial no logra.

## Limitaciones y advertencias

- Cuantización sin calibración de activaciones: el redondeo al más cercano puede degradar la calidad en tareas sensibles a la precisión, aunque la suite de 45 comprobaciones del autor pasa al completo.
- Herramienta `imp-quantize` es experimental: el autor recomienda preferir exportaciones calibradas de proveedores cuando existan y funcionen en la GPU objetivo.
- Escalas compartidas entre capas fusionadas: si un motor no respeta la escala única para capas fusionadas, puede dequantizar incorrectamente; el amax dentro de esos grupos alcanza 3.7x en este modelo.
- vLLM en `sm_120` usa Marlin por falta de kernel FP4 nativo, lo que reduce el throughput respecto a GPUs de datacenter.
- En WSL2 se requieren variables de entorno específicas y limitaciones de memoria (ver requisitos de hardware).
- La model card declara solo inglés como idioma, aunque el modelo base probablemente sea multilingüe; no hay confirmación de rendimiento en otros idiomas.
- No se han publicado benchmarks estándar (MMLU, HumanEval, etc.) para esta cuantización, por lo que el impacto real en tareas concretas no está cuantificado.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/kekzle/Qwen3.8-27B-NVFP4-vllm
- Repositorio hermano (layout Modelopt para imp): https://huggingface.co/kekzle/Qwen3.8-27B-NVFP4
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Proyecto `imp`: https://github.com/kekzl/imp
- Documentación de SGLang para Qwen3.8-27B: https://docs.sglang.io/cookbook/autoregressive/Qwen/Qwen3.8-27B
- Guía de Unsloth para Qwen3.8: https://unsloth.ai/docs/models/qwen3.8
- Foro de NVIDIA sobre rendimiento NVFP4 vs FP8 en DGX Spark: https://forums.developer.nvidia.com/t/qwen3-8-27b-on-dgx-spark-using-vllm-nvfp4-vs-fp8-performance/380258
