# kingjones777/Qwen3.8-Flash-Next-MTP-Heads-GGUF

## Resumen

Este repositorio contiene las cabezas de predicción multi-token (MTP) extraídas del modelo Qwen/Qwen3.8-Flash-Next, convertidas a formato GGUF y cuantizadas por el usuario kingjones777. El MTP es un bloque auxiliar diseñado para decodificación especulativa: permite que el modelo principal genere varios tokens por paso, acelerando la inferencia. El autor publica estos archivos como un artefacto de investigación, no como un release funcional, ya que actualmente ninguno de los cinco archivos carga correctamente en ninguna build pública de llama.cpp, incluido su propio fork.

El problema técnico es un desajuste en el índice de capas: el convertidor emite el bloque MTP en su posición absoluta dentro del modelo padre (`blk.48.*`), mientras que la metadata del archivo declara `qwen4exp.block_count = 1`, por lo que el loader busca tensores `blk.0.*` y falla con el error `missing tensor 'blk.0.hc_attn_norm.weight'`. El autor no ha demostrado que renombrar los tensores sea suficiente, y advierte explícitamente que no hay ganancia de velocidad hoy. El modelo base, Qwen3.8-Flash-Next, es un MoE de 125B parámetros con 6B activos, contexto 262K y arquitectura Qwen4, pero este repositorio solo contiene el bloque MTP, no el modelo completo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Bloque MTP (Multi-Token Prediction) extraido de Qwen3.8-Flash-Next, arquitectura Qwen4 (GDN + QSA hybrid) |
| Parametros totales | 3.878.559.488 (dato de safetensors originales; los GGUF son cuantizaciones de este bloque) |
| Parametros activos | no disponible (bloque auxiliar, no es un modelo MoE independiente) |
| Longitud de contexto | no disponible (depende del modelo principal; el modelo base soporta 262K) |
| Tipos de cuantizacion | BF16 (ftype 32), Q4_0_ROCMFP4_FAST (ftype 103), Q4_0_ROCMFP4_STRIX (ftype 105), Q4_K_M (ftype 15), Q6_K (ftype 18) |
| Idiomas soportados | no disponible (no es un modelo de generacion independiente) |
| Licencia | qwen-community-1.0 |
| Formato de pesos | GGUF (5 archivos: 7.24 GiB BF16, 1.94 GiB Q4_0_FAST, 2.11 GiB Q4_0_STRIX, 2.59 GiB Q4_K_M, 3.17 GiB Q6_K) |

## Arquitectura y entrenamiento

El bloque MTP es un componente de decodificación especulativa que predice varios tokens futuros a partir del estado oculto del modelo principal. En Qwen3.8-Flash-Next, este bloque incluye una pila de hiperconexiones (`hc_attn_norm`, `hc_attn_up`, `hc_attn_down`, `hc_attn_inject`, `hc_ffn_*`, `output_hc_*`) y un sub-bloque `nextn` con proyecciones (`eh_proj`, `enorm`, `hnorm`, `shared_head_norm`) y un indexador (`indexer.q_proj`, `k_proj`, `q_norm`, `k_norm`). El convertidor de kingjones777 extrae este bloque del modelo padre y lo serializa en GGUF, pero lo hace manteniendo el índice de capa absoluto (`blk.48`), lo que provoca el fallo de carga descrito.

No se dispone de información sobre el entrenamiento de este bloque específico; el modelo base Qwen3.8-Flash-Next fue entrenado por Qwen con una arquitectura híbrida GDN (Gated Delta Network) y QSA (Query-Selective Attention), con 125B parámetros totales y 6B activos por token. El autor menciona que en Qwen3.8-27B, MTP sobre ROCm midió una aceleración de 2.03–2.46× en cargas de razonamiento (13.46 → 33.06 tok/s), pero no ha verificado que estas cabezas funcionen de manera similar.

## Capacidades

- No es un modelo de generación de texto independiente: es un bloque auxiliar para decodificación especulativa.
- Diseñado para usarse como modelo borrador (draft model) con `--spec-type draft-mtp` en llama.cpp.
- Contiene la pila completa de hiperconexiones y el sub-bloque `nextn` necesarios para la predicción multi-token.
- Incluye cuantizaciones ROCmFP4 específicas para hardware AMD Strix Halo (gfx1151).
- No soporta tool calling, agentes, visión ni otras capacidades por sí mismo; depende del modelo principal.
- Capacidades multilingües: no aplicable (no es un modelo de lenguaje completo).

## Casos de uso

- Investigación en decodificación especulativa: el repositorio sirve como punto de partida para quienes quieran implementar o corregir el soporte MTP en llama.cpp para la familia Qwen4. El autor pide explícitamente que quien consiga cargar una cabeza reindexada abra una discusión.
- Desarrollo de kernels ROCmFP4: los archivos Q4_0_ROCMFP4_FAST y Q4_0_ROCMFP4_STRIX permiten probar la compatibilidad de estos formatos de cuantización con el bloque MTP.
- Benchmarking de draft models: una vez resuelto el problema de carga, se podría medir la tasa de aceptación y la aceleración real frente a `--spec-type ngram-mod`.
- Pruebas de integración con el fork ROCmFPX de llama.cpp: el autor proporciona instrucciones de compilación para gfx1151.
- Análisis de la estructura de tensores del bloque MTP: los archivos GGUF pueden inspeccionarse con herramientas como `gguf-dump` para estudiar la arquitectura Qwen4.
- Reproducción del error de carga: el repositorio documenta un fallo reproducible en una línea, útil para depurar el cargador de GGUF.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks para estas cabezas MTP específicas. El autor indica que en Qwen3.8-27B (modelo distinto) MTP sobre ROCm midió 2.03–2.46× de aceleración, pero no ha verificado que estas cabezas funcionen. Para el modelo base Qwen3.8-Flash-Next, fuentes externas (unsloth.ai) afirman que supera a Claude-4.6-Opus (Max), pero no se proporcionan números concretos en la información disponible. No se dispone de datos de MMLU, HumanEval, GSM8K ni otros benchmarks para este repositorio.

## Requisitos de hardware

- Los archivos GGUF ocupan entre 1.94 GiB y 7.24 GiB, por lo que caben en cualquier GPU con más de 8 GB de VRAM, pero son inútiles sin el modelo principal (Qwen3.8-Flash-Next, 125B MoE) que requiere mucha más memoria.
- El autor desarrolla para AMD Strix Halo (gfx1151) con ROCmFP4; se necesita el fork ROCmFPX de llama.cpp, ya que el llama.cpp estándar no soporta ni `qwen4exp` ni los tipos ROCmFP4.
- Compilación recomendada: `cmake -B build -DGGML_HIP=ON -DGPU_TARGETS=gfx1151 -DGGML_NATIVE=ON -DCMAKE_BUILD_TYPE=Release`.
- No se recomienda el backend Vulkan en gfx1151: el autor mide una caída de aceptación de 0.750/1.000 (ROCm) a 0.000/0.188 (Vulkan) con `ngram-mod`.
- Opciones de despliegue: llama.cpp (fork ROCmFPX), llama-server, llama-quantize. No compatible con vLLM, Ollama ni TGI en su estado actual.
- Latencia y throughput: no disponibles; el modelo no carga.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Estado | Licencia |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next-MTP-Heads-GGUF (este repo) | Cabezas MTP (draft) | 3.88B (bloque) | no disponible | No carga | qwen-community-1.0 |
| Qwen3.8-Flash-Next (modelo base) | MoE | 125B total, 6B activos | 262K | Funcional | qwen-community-1.0 |
| Qwen3.8-Flash-Next-ROCmFP4-STRIX-GGUF | MoE cuantizado | 125B total, 6B activos | 262K | Funcional (ROCm) | qwen-community-1.0 |
| ngram-mod (llama.cpp) | Draft por n-gramas | no aplica | no aplica | Funcional | MIT (llama.cpp) |

La comparativa directa con otras cabezas MTP no está disponible; este repositorio es el único que publica cabezas MTP extraídas de Qwen3.8-Flash-Next en GGUF. La alternativa práctica hoy es `--spec-type ngram-mod`, que funciona en ROCm con aceptación de 0.750 en código y 1.000 en prosa.

## Limitaciones y advertencias

- Los cinco archivos GGUF no cargan en ninguna build pública de llama.cpp, incluido el fork del autor. El error es reproducible: `missing tensor 'blk.0.hc_attn_norm.weight'`.
- El autor no ha demostrado que renombrar `blk.48.*` a `blk.0.*` sea suficiente; el grafo `qwen4exp` podría no construir correctamente las operaciones de hiperconexión y `nextn`.
- Es un artefacto de investigación, no un release. No hay soporte ni garantía de funcionamiento.
- `gguf-py` estándar no puede reescribir los archivos ROCmFP4 (error de geometría de bloques); se necesita el lado C++ o un parche.
- El repositorio no incluye el modelo principal; sin él, las cabezas son inútiles.
- La licencia qwen-community-1.0 puede tener restricciones para uso comercial; consulte los términos de Qwen.
- La decodificación especulativa en Vulkan/gfx1151 está rota (aceptación 0.000/0.188), por lo que solo es viable en ROCm.
- Riesgo de alucinación y sesgos: no aplicable directamente, pero el modelo base puede heredarlos; no hay evaluación publicada para este bloque.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/kingjones777/Qwen3.8-Flash-Next-MTP-Heads-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Fork ROCmFPX (GitHub): https://github.com/kingjones30/ROCmFPX.git
- Discusión sobre el convertidor: https://huggingface.co/kingjones777/Qwen3.8-Flash-Next-ROCmFP4-STRIX-GGUF/discussions/5
- Modelos principales del autor: https://huggingface.co/kingjones777/Qwen3.8-Flash-Next-ROCmFP4-STRIX-GGUF, https://huggingface.co/kingjones777/Qwen3.8-Flash-Next-ROCmFP4-STRIX_LEAN-GGUF, https://huggingface.co/kingjones777/Qwen3.8-Flash-Next-ROCmFP4-FAST-GGUF, https://huggingface.co/kingjones777/Qwen3.8-Flash-Next-Uncensored-ROCmFP4-FAST-GGUF
- Guía de ejecución local (unsloth): https://unsloth.ai/docs/models/qwen3.8-next
- Guía de ejecución local (atomic.chat): https://atomic.chat/blog/guides/how-to-run-qwen-3-8-flash-next-locally
