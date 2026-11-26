# hfsameh/Qwen3.8-Flash-Next-NVFP4-Coder-Lean-MTP

## Resumen

Qwen3.8-Flash-Next-NVFP4-Coder-Lean-MTP es una compilación comunitaria de pesos cuantizados en NVFP4 (formato de coma flotante de 4 bits de NVIDIA) derivada de `nvidia/Qwen3.8-Flash-Next-NVFP4`, orientada a la inferencia de un modelo MoE de gran tamaño en hardware Blackwell de gama alta. El autor, `hfsameh`, añade un injerto de decodificación especulativa multi-token (MTP) sobre el checkpoint "Coder-Lean" de `elisepaul`, con el objetivo de acelerar la generación en un único nodo DGX Spark. El repositorio pesa 80,6 GB y declara 128.826.011.539 parámetros totales en safetensors.

El modelo resuelve un problema muy concreto: servir un LLM de ~129 mil millones de parámetros con cuantización de 4 bits y decodificación especulativa en un entorno con memoria unificada limitada, usando vLLM con backends específicos de arquitectura (b12x) y parches de código fuente. No es un modelo nuevo entrenado desde cero, sino una receta de empaquetado y configuración de serving: pesos NVFP4, configuraciones densas en BF16 y un shard MTP añadido para acelerar el decode.

Es relevante ahora porque documenta de forma explícita los compromisos reales de esta familia de despliegues: la model card advierte que el repositorio está obsoleto frente a la versión de `elisepaul` (superset estricto con MXFP8 denso y +372 entradas de escala), que alcanza 64 tok/s frente a los 59,9 tok/s de esta build, y que la única ventaja de este repo es descargar 7 GB menos. La licencia es la NVIDIA Open Model License, con restricciones para uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE híbrida con atención lineal GDN (gated delta network) y atención QSA; incluye cabezas MTP para decodificación especulativa |
| Parametros totales | 128.826.011.539 |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens (configurado en el ejemplo de serving con `--max-model-len 262144`) |
| Tipos de cuantizacion | NVFP4 (W4A16) para lineales y MoE; escalas densas en BF16 o MXFP8; KV cache en bfloat16 |
| Idiomas soportados | en, zh, code |
| Licencia | nvidia-open-model-license (etiquetada como `other`) |
| Formato de pesos | safetensors (10 shards NVFP4 + `mtp-graft.safetensors`), configs JSON e index |
| Tamano del repo | 80,6 GB |
| Cuantizacion declarada | 8-bit (tag), `modelopt_mixed` en vLLM |
| Modelo base | elisepaul/Qwen3.8-Flash-Next-NVFP4-Coder-Lean, nvidia/Qwen3.8-Flash-Next-NVFP4 |
| Descargas / likes | 287 / 3 |

## Arquitectura y entrenamiento

La arquitectura es un transformer MoE híbrido que combina capas de atención lineal GDN con atención QSA (Qwen Sparse Attention, según los mensajes de error citados en la model card). El checkpoint incluye un injerto MTP (`mtp-graft.safetensors`) que añade cabezas de predicción multi-token para decodificación especulativa, con profundidad de borrador configurable (4 en esta build, 3 en la de `elisepaul`). El serving requiere `--quantization modelopt_mixed` porque las configuraciones declaran las capas `mtp.*` como `W4A16_NVFP4`; sin ese flag, vLLM falla con `no parameter 'w2_weight_scale'`.

No se proporcionan datos de entrenamiento en la información disponible: ni número de tokens, ni composición del dataset, ni si hubo RLHF/DPO. Este repositorio no entrena el modelo, solo reempaqueta pesos ya cuantizados por NVIDIA y añade el injerto MTP y las configuraciones de serving. La innovación técnica destacable es la caracterización del prefijo de caché en una arquitectura híbrida con atención lineal, junto con los backends b12x para decode GDN, lineales y MoE, y el uso de decodificación especulativa MTP con longitud media de aceptación de 3,46 tokens (81,9%).

## Capacidades

- Generación de texto en inglés y chino, con soporte específico de código (tag `code`).
- Razonamiento y generación de código: el checkpoint base se denomina "Coder-Lean", orientado a tareas de programación.
- Decodificación especulativa multi-token (MTP) con profundidad configurable, que acelera el decode entre 2,5x y 3x según las mediciones del autor.
- Serving con vLLM mediante `--quantization modelopt_mixed`, incluyendo parser de razonamiento `qwen3` (`--reasoning-parser qwen3`).
- Soporte de contextos largos de hasta 262.144 tokens, con caché KV en bfloat16 y block size de 48.
- Compatibilidad con prefix caching en arquitectura híbrida (atención lineal GDN), con caracterización del tamaño de chunk.
- No se documentan en la información disponible capacidades de visión, audio, tool calling explícito ni modo thinking más allá del parser de razonamiento.

## Casos de uso

- Serving de código en un nodo DGX Spark: el modelo está calibrado para un único nodo con memoria unificada, usando NVFP4 y MTP para alcanzar 50-64 tok/s en salidas de 120-600 tokens, lo que permite asistentes de código interactivos en hardware de borde.
- Autocompletado y generación en IDE con contexto largo: con 262.144 tokens de ventana y prefix caching, se puede mantener un repositorio completo en contexto y reutilizar prefijos entre peticiones, reduciendo el coste de prefill.
- Procesamiento por lotes de revisiones de código: `--max-num-seqs 4` y `--max-num-batched-tokens 1024` permiten servir varias peticiones concurrentes en un solo nodo, adecuado para pipelines de análisis estático asistido por LLM.
- Evaluación de recetas de cuantización NVFP4: el repo documenta comparativas de throughput entre BF16 denso, NVFP4 y MXFP8, útil para equipos que deciden qué formato desplegar en Blackwell.
- Investigación en decodificación especulativa: la model card aporta métricas de aceptación (3,46 tokens medios, 81,9%) y comparativas de profundidad de borrador (3 vs 4), útiles para estudiar el equilibrio entre draft depth y tasa de aceptación.
- Despliegue de referencia con vLLM parcheado: sirve como plantilla de configuración (`--kv-cache-dtype bfloat16`, backends b12x, `--block-size 48`) para reproducir un serving funcional de un MoE de 129B en FP4.
- Fallback de configuraciones BF16 densas: si la ruta MXFP8 falla, este repo conserva un conjunto de configuraciones densas en BF16 que se puede superponer a los pesos de `elisepaul`.

## Benchmarks y rendimiento

| Build | Lineales densos | Config | Throughput medido |
|---|---|---|---|
| Coder-Lean (sin MTP) | BF16 | AR | 19,3 tok/s |
| Este repo (NVFP4 + MTP) | BF16 | MTP depth 4, gmu 0,82 | 59,9 tok/s |
| elisepaul (MXFP8) | MXFP8 | MTP depth 3, gmu 0,82 | 64 tok/s |

Mediciones adicionales con las configuraciones de este repo a MTP depth 4: 50 tok/s con salida de 120 tokens, 64 tok/s con salida de 600 tokens, longitud media de aceptación 3,46 (81,9%) y caché KV de 762.253 tokens (2,91x a 262.144). No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: el repo ocupa 80,6 GB en disco; en inferencia, los pesos NVFP4 más la caché KV en bfloat16 requieren memoria unificada o VRAM del orden de decenas de GB, aunque no se especifica un mínimo exacto. La caché KV medida es de 762.253 tokens a 262.144 de contexto.
- GPU recomendadas: hardware Blackwell con soporte de NVFP4 y `sm_121a` (el ejemplo usa `CUTE_DSL_ARCH=sm_121a`), en concreto un nodo DGX Spark con `eugr/spark-vllm-b12x`.
- No cabe en GPU de consumo convencionales: el tamaño de pesos y la necesidad de kernels NVFP4/b12x lo restringen a Blackwell de gama alta; no se documenta compatibilidad con RTX 4090.
- Opciones de despliegue: vLLM con imagen parcheada (`eugr/spark-vllm-b12x`), `--quantization modelopt_mixed`, backends `b12x` para GDN decode, lineales y MoE, `--speculative-config '{"method":"mtp","num_speculative_tokens":4}'`. No se mencionan llama.cpp, Ollama ni TGI.
- Latencia y throughput: 50 tok/s con 120 tokens de salida y 64 tok/s con 600 tokens, con `--max-num-seqs 4` y `--max-num-batched-tokens 1024`.
- Variables de entorno obligatorias: `HF_HUB_OFFLINE=1`, `CUTE_DSL_ARCH=sm_121a`, `SAFETENSORS_FAST_GPU=1`, `VLLM_USE_V2_MODEL_RUNNER=1`, `VLLM_MXFP8_LM_HEAD=1`, `B12X_DISK_BACKEND=io_uring`, entre otras.
- Restricciones de arranque: no usar `--kv-cache-dtype fp8_e4m3` (falla con `Qwen4Exp QSA requires a BF16 main KV cache`), no añadir `--enable-expert-parallel` (falla en prefill A4 híbrido) y mantener los backends b12x para evitar el assert de flashinfer con `N=96`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Throughput | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este repo (NVFP4 + MTP) | 128,8B | 262.144 | 59,9 tok/s | nvidia-open-model-license | Hugging Face, 80,6 GB, obsoleto |
| elisepaul/Qwen3.8-Flash-Next-NVFP4-Coder-Lean | mismo base | 262.144 | 64 tok/s | nvidia-open-model-license | Hugging Face, ~85 GB, superset estricto |
| nvidia/Qwen3.8-Flash-Next-NVFP4 | mismo base | no disponible | no disponible | nvidia-open-model-license | Hugging Face, checkpoint original |

La comparativa relevante es interna a la familia: `elisepaul` supera a este repo en throughput (64 vs 59,9 tok/s) con menor profundidad de borrador (3 vs 4) y añade el shard MXFP8 denso de 3,0 GB con +372 entradas de escala. Este repo solo gana en tamaño de descarga (7 GB menos) y en servir como fallback de configuraciones BF16.

## Limitaciones y advertencias

- Repositorio obsoleto: la propia model card indica que está superado por `elisepaul/Qwen3.8-Flash-Next-NVFP4-Coder-Lean`, que es un superset estricto verificado el 2026-11-22. No recibirá más actualizaciones.
- Licencia NVIDIA Open Model License: revisar las restricciones de uso comercial antes de desplegar en producción; la etiqueta es `other`, no una licencia permisiva estándar.
- Requiere parches de código fuente de vLLM (PLE prune y, en la ruta MXFP8, `fix-mxfp8-dense-merge`); el mod upstream tiene un regex que borra `_resolve_weight_scale_encoding` y provoca `AttributeError` al arrancar.
- Configuración frágil: cuatro ajustes son críticos para el arranque (`--kv-cache-dtype bfloat16`, backends b12x, sin expert parallel, `modelopt_mixed`); equivocarse en cualquiera impide el boot.
- Idiomas limitados a inglés, chino y código; no se documenta soporte de castellano ni de otras lenguas.
- Riesgo de alucinación no caracterizado: no hay benchmarks de calidad ni evaluaciones de sesgo en la información disponible.
- Dependencia de hardware muy específico (Blackwell, `sm_121a`, DGX Spark) y de variables de entorno concretas; la portabilidad a otros aceleradores no está documentada.
- Sin datos de entrenamiento ni de alineación (RLHF/DPO), lo que impide evaluar sesgos conocidos o comportamiento en dominios sensibles.

## Enlaces

- Hugging Face: https://huggingface.co/hfsameh/Qwen3.8-Flash-Next-NVFP4-Coder-Lean-MTP
- Repo recomendado (superset): https://huggingface.co/elisepaul/Qwen3.8-Flash-Next-NVFP4-Coder-Lean
- Modelo base original: https://huggingface.co/nvidia/Qwen3.8-Flash-Next-NVFP4
- Imagen de serving de referencia: `eugr/spark-vllm-b12x` (no se proporciona URL directa en la información disponible)
- Paper, blog o demo: no disponible
