# malaiwah/Qwen3.8-27B-EXL3-K5K6-hydrated

## Resumen

`malaiwah/Qwen3.8-27B-EXL3-K5K6-hydrated` es una cuantización experimental del modelo vision-language `Qwen/Qwen3.8-27B` (10.793 millones de parámetros) realizada por el usuario malaiwah. La variante "hydrated" se distingue por cuantizar la atención directamente a EXL3 K6 en disco durante la conversión, en lugar de enviarla en BF16 y codificarla en caliente en cada arranque. Esto reduce la descarga de 30,57 GB a 21,61 GB y acelera el primer arranque en frío de 957 a 178 segundos (5,4 veces), manteniendo una fidelidad medida por divergencia KL ligeramente superior a la del build hermano con atención BF16.

El modelo emplea una mezcla de precisiones: MLP en EXL3 K5/K6, atención en EXL3 K6 calibrada, cabeza `lm_head` en K6, cabeza de borrador MTP cuantizada, y el vision tower y los embeddings en BF16. Es un artefacto de investigación que **requiere un runtime específico** (fork Gilded Gnosis de vLLM con `--quantization exl3` y una lista `ignore` exacta); no carga en vLLM estándar, SGLang, TensorRT-LLM, llama.cpp, transformers ni exllamav3 stock. Su relevancia radica en demostrar que una cuantización mixta EXL3 con atención "hidratada" puede acercarse al BF16 de referencia (KLD 0,007406) con un footprint de 20,31 GiB residentes y un arranque en frío rápido en entornos sin caché persistente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido vision-language con atención full + atención lineal (GatedDeltaNet) y vision tower de 27 bloques |
| Parametros totales | 10.793.481.456 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | ~186.000 tokens en GPU de 32 GB (medición del autor; el contexto nativo de 262k no se alcanza con este build) |
| Tipos de cuantizacion | EXL3 K5/K6 (mixto), BF16, FP16; atención fija en K6 |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (3 shards) con `quantization_manifest.json` y `build-receipt.json` |

## Arquitectura y entrenamiento

El modelo base `Qwen/Qwen3.8-27B` es un sistema multimodal de 27B parámetros que combina atención completa (64 capas con `self_attn`) con atención lineal tipo GatedDeltaNet (48 módulos `linear_attn`), más un vision tower de 27 bloques. Sobre esa base, este build aplica una cuantización EXL3 mixta calibrada: `gate_proj` y `up_proj` en K5, `down_proj` en K6, atención (tanto `linear_attn` como `self_attn`) en K6 fijado en disco, `lm_head` en K6, y la cabeza de borrador MTP (multi-token prediction) cuantizada con atención K4 y MLP K5/K6. Los embeddings, el vision tower y las normas se mantienen en BF16, mientras que las proyecciones `in_proj_a`/`in_proj_b` de GatedDeltaNet pasan en FP16.

El proceso de construcción utilizó exllamav3 con dos hooks de asignación de memoria no estándar (`EXL3_BITS_FIXED` y `EXL3_BITS_OVERRIDE`) que permiten fijar la atención en K6 antes de la asignación presupuestaria. Tras la conversión se verificó que los 1.199 nombres de tensor lógicos coinciden exactamente con los del modelo original. No se dispone de información sobre los datos de entrenamiento del modelo base (número de tokens, composición del dataset, uso de RLHF/DPO).

## Capacidades

- Generación de texto y razonamiento multimodal (entrada imagen + texto, salida texto) al ser una cuantización del Qwen3.8-27B.
- Procesamiento de imágenes mediante vision tower de 27 bloques en BF16.
- Soporte de atención lineal (GatedDeltaNet) que reduce el coste de contexto largo frente a atención full.
- Cabeza de borrador MTP cuantizada que permite decodificación especulativa multi-token (depende del runtime).
- Capacidad de tool calling y función de agente: no confirmada explícitamente en la documentación; se asume heredada del modelo base, pero no hay datos verificados.
- Idiomas: no disponible.

## Casos de uso

- Investigación en cuantización de precisión mixta: permite estudiar el impacto de fijar la atención en K6 frente a codificarla en caliente, con métricas de KLD y top-1 sobre un corpus de validación reproducible.
- Despliegue en entornos efímeros o de solo lectura: al no requerir caché persistente de codificación, arranca en 178 s en contenedores desechables o imágenes de sistema de archivos de solo lectura.
- Servicio de inferencia multimodal con contexto largo en GPU de 32 GB: alcanza ~186k tokens de contexto, adecuado para análisis de documentos extensos con imágenes integradas.
- Evaluación de fidelidad frente a cuantizaciones oficiales: comparación directa con `Qwen3.8-27B-FP8` y `NVFP4` usando la misma suite de KLD, útil para decidir el punto óptimo entre tamaño y calidad.
- Prototipado de pipelines de visión-lenguaje con vLLM fork específico: integración en sistemas que ya usan el runtime Gilded Gnosis y necesitan arranque rápido sin caché.
- Benchmarking de cold start y throughput en clústeres multi-nodo: el arranque sin caché simplifica la sincronización de pesos en muchos nodos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor proporciona mediciones de fidelidad frente a la referencia BF16 sobre un corpus propio (136 contextos, 278.392 posiciones puntuadas, sin top-k):

| Candidate | Resident (GiB) | Mean KLD | Bootstrap 95 % CI | Mediana | Top-1 |
|---|---:|---:|---|---:|---:|
| **Este build (hydrated)** | 20,31 | **0,007406** | [0,00543, 0,00978] | 0,001335 | **97,19 %** |
| Build hermano (atención BF16) | 20,32 | 0,008157 | [0,00607, 0,01067] | 0,001529 | 96,97 % |
| `Qwen/Qwen3.8-27B-FP8` | 28,51 | 0,013126 | [0,00981, 0,01709] | 0,002343 | 96,22 % |
| `unsloth/Qwen3.8-27B-NVFP4` | 21,34 | 0,094978 | [0,06858, 0,12688] | 0,012911 | 90,53 % |

Además, el arranque en frío mide 178 s frente a 957 s del build con atención BF16 (5,4 veces más rápido), y la descarga es de 21,61 GB frente a 30,57 GB.

## Requisitos de hardware

- VRAM estimada: 20,31 GiB residentes; se necesita una GPU con al menos 24 GB para inferencia básica y 32 GB para alcanzar ~186k tokens de contexto.
- GPU recomendadas: NVIDIA A100 40 GB, H100, RTX 4090 24 GB, o cualquier GPU con 32 GB o más para contexto largo.
- No cabe en GPUs de consumo de 8-16 GB (p. ej., RTX 3060, 4060) por el tamaño de los pesos y la atención.
- Opciones de despliegue: únicamente el fork Gilded Gnosis de vLLM con `--quantization exl3` y la lista `ignore` exacta. No compatible con llama.cpp, Ollama, TGI, SGLang, TensorRT-LLM ni transformers estándar.
- Latencia y throughput: no disponibles; el autor solo reporta tiempos de arranque (178 s en frío) y no mediciones de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto (32 GB) | Residente | Fidelidad (KLD) | Licencia | Runtime |
|---|---:|---:|---:|---:|---|---|
| **Este build (EXL3 K5/K6 hydrated)** | 10,79B | ~186k | 20,31 GiB | 0,007406 | Apache 2.0 | Fork Gilded Gnosis vLLM |
| `malaiwah/Qwen3.8-27B-EXL3-K5K6` (hermano, atención BF16) | 10,79B | ~206k (K5) | 20,32 GiB | 0,008157 | Apache 2.0 | Fork Gilded Gnosis vLLM |
| `Qwen/Qwen3.8-27B-FP8` (oficial) | 10,79B | 262k nativo | 28,51 GiB | 0,013126 | Apache 2.0 | vLLM estándar |
| `unsloth/Qwen3.8-27B-NVFP4` | 10,79B | no disponible | 21,34 GiB | 0,094978 | Apache 2.0 | vLLM estándar |

La comparativa muestra que este build ofrece la mejor fidelidad del grupo, pero a costa de requerir un runtime propietario y no alcanzar el contexto nativo de 262k en 32 GB.

## Limitaciones y advertencias

- **Runtime específico y no estándar**: no carga en vLLM, SGLang, TensorRT-LLM, llama.cpp, transformers ni exllamav3 stock. Requiere el fork Gilded Gnosis con flags y lista `ignore` exactas; cualquier cambio en el runtime puede romper la carga.
- **Artefacto experimental**: cero descargas y cero likes en el momento de redacción; sin validación comunitaria ni soporte oficial.
- **Contexto limitado en 32 GB**: no alcanza los 262k tokens nativos del modelo base; se queda en ~186k. Para contexto completo hay que usar el build `-K4` o el FP8 oficial.
- **Sin caché persistente**: el arranque en frío es rápido, pero no hay caché de codificación; en entornos con arranques repetidos puede ser menos eficiente que el build con caché.
- **Riesgo de alucinación y sesgos**: no hay información sobre evaluaciones de sesgo o seguridad; al ser una cuantización agresiva, la calidad de salida puede degradarse en tareas de razonamiento complejo.
- **Restricciones de producción**: la licencia Apache 2.0 permite uso comercial, pero el runtime propietario y la falta de soporte en herramientas estándar dificultan su integración en producción.
- **Fidelidad medida solo en KLD**: los benchmarks de tareas (MMLU, etc.) no están publicados; la KLD baja no garantiza buen rendimiento en tareas específicas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/malaiwah/Qwen3.8-27B-EXL3-K5K6-hydrated
- Build hermano (atención BF16): https://huggingface.co/malaiwah/Qwen3.8-27B-EXL3-K5K6
- Build con contexto nativo en 32 GB: https://huggingface.co/malaiwah/Qwen3.8-27B-K4
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio companion con los hooks de asignación: https://github.com/malaiwah/qwen38-27b-exl3
- Colección de mediciones: https://huggingface.co/collections/qwen38-27b-mixed-precision-exl3-measured-6a7fe0cb27817c23e4a57025
