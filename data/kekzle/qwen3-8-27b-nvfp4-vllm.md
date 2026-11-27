# kekzle/Qwen3.8-27B-NVFP4-vllm

## Resumen

Qwen3.8-27B-NVFP4-vllm es una cuantización de pesos del modelo Qwen/Qwen3.8-27B, publicada por el usuario independiente kekzle. El modelo base es un transformer híbrido de la familia Qwen 3.5 con 27.781 millones de parámetros, capacidad de razonamiento previo a la respuesta y soporte de entrada imagen-texto. Esta revisión concreta convierte los pesos BF16 originales (51,75 GiB) a NVFP4 en el formato `nvfp4-pack-quantized` de compressed-tensors, reduciendo el repositorio a 19,2 GiB y permitiendo su carga en una única GPU de 32 GB.

La motivación técnica del autor es explícita: las exportaciones NVFP4 publicadas hasta la fecha de este modelo son de precisión mixta con atención en FP8, y no arrancan en GPUs consumer Blackwell (`sm_120`) porque esa arquitectura carece de GEMM FP8. Esta versión es weight-only NVFP4 (W4A16), es decir, cuantiza solo pesos y deja las activaciones en su precisión de origen, lo que sí funciona en esas tarjetas. Está pensada para servirse con vLLM (verificado en 0.27.1 y 0.31.0) o con el motor imp del mismo autor.

El interés práctico es doble: por un lado, demuestra un pipeline de cuantización reproducible con calibración AWQ sobre un modelo multimodal de razonamiento; por otro, documenta con medidas reales (perplejidad, throughput, aceptación del draft head MTP) el coste de calidad y el rendimiento obtenido en una RTX 5090. La licencia Apache 2.0 del modelo base se mantiene.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con capas GDN (atención lineal tipo Mamba) y atención, más torre de visión y cabeza MTP; familia `qwen3_5` |
| Parametros totales | 27.781.427.952 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible en la información proporcionada; el autor usa `max_model_len=4096` en el ejemplo de vLLM |
| Tipos de cuantizacion | NVFP4 weight-only (W4A16), grupo de tamaño 16; embeddings, `lm_head`, normas, torre de visión y cabeza MTP en BF16 |
| Idiomas soportados | en (inglés, según la model card) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors con `quantization_config` de compressed-tensors (`nvfp4-pack-quantized`) |

## Arquitectura y entrenamiento

El modelo base es un transformer híbrido: combina capas de atención con capas GDN (atención lineal de estado recurrente, del tipo Mamba), lo que explica que vLLM reserve un bloque de caché Mamba por secuencia de decodificación. Incluye además una torre de visión para entrada imagen-texto y una cabeza MTP (multi-token prediction) que actúa como draft head para decodificación especulativa. El checkpoint cuantizado conserva la torre de visión y la cabeza MTP en BF16, y solo cuantiza los pesos lineales de atención, MLP y proyecciones GDN.

Sobre el entrenamiento del modelo base no hay información en los datos proporcionados (número de tokens, composición del dataset, uso de RLHF o DPO): no disponible. Lo que sí está documentado es el proceso de cuantización: conversión desde la release oficial BF16 con el cuantizador de imp, calibración de activaciones AWQ desde el 21 de noviembre de 2026, y estadísticas de activación obtenidas de una exportación round-to-nearest del mismo modelo (porque los 51,75 GiB en BF16 no caben en una tarjeta de 32 GB). El conjunto de calibración son 150 000 bytes de prosa en inglés (37 235 muestras, 496 entradas), disjunto del corpus de perplejidad. Las capas que un motor fusiona en un único lineal (`q/k/v`, `gate/up`, pares `in_proj_*` de GDN) comparten una sola escala de tensor, porque la dispersión de amax dentro de esos grupos llega a 3,7x en este modelo.

## Capacidades

- Generación de texto conversacional multi-turno, con razonamiento previo a la respuesta (thinking mode) que consume presupuesto de tokens.
- Entrada imagen-texto: la torre de visión funciona y se mantiene en precisión de origen.
- Razonamiento de varios pasos y sesiones largas: el autor documenta una sesión de 74 turnos creciendo hasta ~8k tokens.
- Decodificación especulativa mediante cabeza MTP integrada (aceptación del draft del 45,1 % en las pruebas del autor).
- Servido en vLLM y en el motor imp; compatible con el formato compressed-tensors.
- Capacidades multilingües: la model card solo declara inglés; no hay datos sobre otros idiomas.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes: no disponible en la información proporcionada.

## Casos de uso

- Despliegue en GPU consumer Blackwell de 32 GB: es el caso central del checkpoint; permite servir un modelo de 27,8B multimodal y con razonamiento en una RTX 5090, algo imposible con los pesos BF16 (51,75 GiB) y con las exportaciones NVFP4 con atención FP8.
- Asistente conversacional multi-turno: con `max_tokens` de al menos ~400 se obtuvieron 74 de 74 turnos limpios en la sesión de prueba del autor; por debajo de 260 el razonamiento agota el presupuesto y devuelve respuestas vacías.
- Procesamiento de documentos con imagen: la torre de visión en BF16 permite pasar capturas, diagramas o páginas escaneadas junto al texto sin degradación por cuantización en esa rama.
- Prototipado e investigación en cuantización: el repositorio incluye `imp_recipe.json` y `quant_report.json` con los ajustes exactos y el error por tensor, útiles para reproducir o comparar esquemas NVFP4 frente a round-to-nearest.
- Evaluación de decodificación especulativa: la cabeza MTP incluida permite medir ganancias de throughput (207,8 tok/s frente a 96,9 sin especulación en imp) en un entorno de una sola GPU.
- Servicio con vLLM en producción de baja concurrencia: con `--max-num-seqs` limitado a 169 o menos (64 recomendado) y `--gpu-memory-utilization` en torno a 0,92 o inferior, se obtiene un endpoint OpenAI-compatible en una sola tarjeta.
- Banch de pruebas de calidad de cuantización: la suite `degen_suite.py` de 52 comprobaciones, superada 52/52, sirve como referencia para validar otras exportaciones del mismo modelo.

## Benchmarks y rendimiento

Medidas del autor en RTX 5090, batch 1, greedy, imp main de 2026-11-21 (posterior a 0.69.1), una ejecución por celda:

| Métrica | Esta revisión (AWQ) | Revisión anterior (round-to-nearest) |
|---|---:|---:|
| Perplejidad, ruta de prefill (`ppl_corpus_45k.txt`, 13 811 tokens, determinista) | 4,5392 | 4,6018 |
| Perplejidad, ruta de decode por paso (filas 64 en adelante) | 4,4705 | 4,5044 |
| Decode `tg`, sin especulación | 96,91 tok/s | 96,87 tok/s |
| Prefill `pp512` | 11 474 tok/s | 11 446 tok/s |
| Servidor con cabeza MTP, 30 prompts de chat x 300 tokens, extremo a extremo | 207,81 tok/s | 207,66 tok/s |
| Aceptación del draft MTP en esos prompts | 45,1 % | 44,9 % |
| vLLM 0.31.0, un solo stream, 400 tokens | 71,29 tok/s | 70,58 tok/s |
| Suite de calidad (`degen_suite.py`, 52 comprobaciones), con y sin MTP | 52/52 | 52/52 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM: el checkpoint ocupa 19,2 GiB en NVFP4, frente a 51,75 GiB en BF16; cabe en una tarjeta de 32 GB dejando espacio para contexto real. El autor recomienda `--gpu-memory-utilization` de ~0,92 o menos en WSL2, donde WSLg retiene ~1,2 GB.
- GPU verificada: RTX 5090 (Blackwell consumer, `sm_120`). Requiere arquitectura con soporte NVFP4; las exportaciones con FP8 no arrancan en `sm_120`.
- Cabe en GPU consumer: sí, en tarjetas de 32 GB. No hay datos para tarjetas de 24 GB o menos.
- Despliegue: vLLM 0.27.1 y 0.31.0 (verificados) e imp (`ghcr.io/kekzl/imp:latest`). En `sm_120` vLLM no tiene kernel FP4 nativo y cae a Marlin.
- Flags necesarios en vLLM sobre 32 GB: `--max-num-seqs 64` (o cualquier valor ≤ 169), porque con estos pesos solo caben 169 bloques de caché Mamba y el valor por defecto de 256 aborta el arranque; no usar `--enforce-eager` como solución, ya que oculta el error y cuesta la mayor parte de la velocidad de decode. En WSL2, `VLLM_WSL2_ENABLE_PIN_MEMORY=1` para evitar `RuntimeError: UVA is not available`.
- Throughput medido: 96,91 tok/s en decode sin especulación y 207,81 tok/s extremo a extremo con MTP en imp; 71,29 tok/s en vLLM 0.31.0 a un solo stream. Prefill de 11 474 tok/s en `pp512`.
- Presupuesto de tokens: usar `max_tokens` de al menos ~400 en uso multi-turno; con 260 se observaron turnos con respuesta vacía.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| kekzle/Qwen3.8-27B-NVFP4-vllm | 27,78B | no disponible | NVFP4 W4A16, grupo 16 | apache-2.0 | Hugging Face, 194 descargas |
| Qwen/Qwen3.8-27B (base) | 27,78B | no disponible | BF16 (51,75 GiB) | apache-2.0 | Hugging Face (oficial) |
| Exportaciones NVFP4 públicas del mismo modelo | 27,78B | no disponible | precisión mixta con atención FP8 | no disponible | no arrancan en `sm_120` |

No se dispone de datos de benchmarks comparativos con modelos de otras familias en la información proporcionada.

## Limitaciones y advertencias

- Solo se declara inglés; no hay evidencia de calidad en castellano ni en otros idiomas.
- Riesgo de respuesta vacía: el razonamiento comparte presupuesto con la respuesta; con `max_tokens` bajo (260 en las pruebas) se produjeron turnos vacíos y una respuesta de un único token no latino. Usar ≥ 400 en multi-turno.
- La cuantización es experimental según el propio autor: recomienda preferir una exportación de proveedor calibrada cuando exista y funcione en la tarjeta objetivo.
- `imp-quantize` está marcado como experimental; el pipeline depende de una calibración AWQ obtenida de una exportación round-to-nearest intermedia, no directamente del BF16.
- En vLLM sobre `sm_120` no hay kernel FP4 nativo y se usa Marlin, con menor throughput que en tarjetas de datacenter (71,29 tok/s frente a 96,91 en imp).
- El arranque en vLLM falla con los valores por defecto de `--max-num-seqs` en tarjetas de 32 GB; requiere ajuste manual y no debe resolverse con `--enforce-eager`.
- En WSL2 hay que activar `VLLM_WSL2_ENABLE_PIN_MEMORY=1` y limitar la utilización de memoria; sin ello el servidor aborta.
- La licencia Apache 2.0 del modelo base permite uso comercial, pero el autor no ofrece garantías sobre el checkpoint cuantizado; verificar la calidad en el dominio propio antes de producción.
- Sesgos y alucinaciones del modelo base: no hay información específica en los datos proporcionados.
- El repositorio tiene 0 likes y 194 descargas: es un artefacto de un autor individual, sin validación comunitaria amplia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kekzle/Qwen3.8-27B-NVFP4-vllm
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Motor imp: https://github.com/kekzl/imp
- Imagen de contenedor de imp: ghcr.io/kekzl/imp:latest
- vLLM: no se proporciona enlace en la información disponible
