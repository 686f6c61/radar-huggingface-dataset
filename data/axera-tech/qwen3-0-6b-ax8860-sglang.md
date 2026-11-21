# AXERA-TECH/Qwen3-0.6B-AX8860-SGLang

## Resumen

Qwen3-0.6B-AX8860-SGLang es un paquete de despliegue publicado por AXERA-TECH que adapta el modelo de lenguaje Qwen3-0.6B (desarrollado originalmente por Alibaba Qwen) para su ejecución sobre la NPU Axera AX8860 mediante el runtime SGLang. No se trata de un modelo nuevo entrenado desde cero, sino de un artefacto de ingeniería que combina un checkpoint cuantizado en NVFP4 (generado con NVIDIA ModelOpt 0.33.0), scripts de validación, parches de runtime y una caché de kernels precompilados para el acelerador AX8860.

El checkpoint base es la variante text-only de Qwen3-0.6B, un transformer decoder de 28 capas con embeddings atados, 16 cabezas de consulta y 8 de clave/valor (GQA), ventana de contexto de 32.768 tokens y vocabulario de 151.936 entradas. La contribución de AXERA-TECH consiste en empaquetar ese modelo en FP4 (pesos NVFP4 con grupo de 16 y escalas F8_E4M3) y aportar la infraestructura necesaria para servirlo en modo batch offline sobre la NPU, incluyendo la caché AXDSL con nueve kernels compilados por el toolchain AXNN.

La relevancia de este repositorio es acotada pero clara: sirve como referencia reproducible para quien necesite desplegar Qwen3-0.6B en hardware de borde AX8860 con SGLang, con un conjunto validado de argumentos de servidor, variables de entorno y parches de runtime. Es un artefacto de despliegue, no un modelo de propósito general para uso directo en la nube, y su utilidad depende de disponer del hardware AX8860 y del stack de software exacto documentado por el autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (Qwen3ForCausalLM), text-only |
| Parametros totales | 0,6 mil millones (Qwen3-0.6B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens (checkpoint); 512 en la validacion del autor |
| Tipos de cuantizacion | NVFP4 (pesos, grupo 16, escalas F8_E4M3); KV cache FP8 en metadatos, BF16 en la validacion |
| Idiomas soportados | no disponible |
| Licencia | BSD-3-Clause (heredera de la licencia del checkpoint fuente Qwen3-0.6B) |
| Formato de pesos | safetensors (model.safetensors de 559.126.528 bytes), mas cache AXDSL de kernels `.compiled.axmodel` |

## Arquitectura y entrenamiento

El modelo subyacente es Qwen3-0.6B, un transformer decoder denso con 28 capas, dimensión oculta de 1024, dimensión intermedia de 3072, GQA con 16 cabezas de consulta y 8 de clave/valor, dimensión de cabeza 128, vocabulario de 151.936 tokens y embeddings atados (el `lm_head` no se almacena por separado). El checkpoint empaquetado es text-only: no incluye torre de visión, no hay AXModel de visión ni parche de runtime para VL, según indica el autor.

La cuantización se realizó con ModelOpt 0.33.0 en formato NVFP4: pesos empaquetados dos por byte en tipo `U8`, escalas de grupo en `F8_E4M3` con tamaño de grupo 16, y escalas por tensor `weight_scale_2` e `input_scale` en `F32`. El `lm_head` queda excluido de la cuantización y permanece en BF16, atado a los embeddings. El checkpoint resultante contiene 954 tensores: 196 `U8`, 196 `F8_E4M3`, 448 `F32` y 114 `BF16`. La caché de clave/valor se marca como FP8 en los metadatos, aunque en la validación del autor se sirvió en BF16.

No se documentan en la información disponible los datos de entrenamiento originales de Qwen3-0.6B (número de tokens, composición del dataset, uso de RLHF o DPO). La innovación técnica del paquete es de despliegue: una caché AXDSL precompilada con nueve entradas de kernel (`argmax_kernel`, `decode_paged_kv_kernel`, `flash_attn_with_kvcache` x2, `mlp_kernel` x3, `rmsnorm_gemm_kernel` y `vocab_embedding_kernel`) generadas por el toolchain AXNN para el AX8860, junto con parches de runtime que permiten seleccionar el directorio de caché AXDSL y auditar su reutilización.

## Capacidades

- Generación de texto autoregresiva en modo decoder causal, con muestreo greedy determinista en la validación del autor (temperatura 0, top_p 0.95, max_new_tokens 5, repetition_penalty 1.1).
- Inferencia batch offline sobre la NPU AX8860 mediante `sgl.Engine` y el backend de atención `axera`.
- Soporte de caché de clave/valor paginada (`decode_paged_kv_kernel`, page-size 256) y atención con KV cache (`flash_attn_with_kvcache`).
- Capacidades de razonamiento, código y matemáticas heredadas de Qwen3-0.6B: no se documentan explícitamente en la model card del paquete.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Capacidades especiales (thinking mode, visión, audio): no disponibles; el autor confirma explícitamente que no hay torre de visión ni runtime VL.

## Casos de uso

- Despliegue de referencia en NPU AX8860: el paquete permite reproducir un entorno funcional de Qwen3-0.6B en FP4 sobre el acelerador, con argumentos de servidor validados (`--device axera --attention-backend axera --context-length 512 --max-total-tokens 12288 --max-running-requests 6 --page-size 256`) y variables de entorno (`RUN_MODE=BRUN`, `SGLANG_ENABLE_DELAY_SAMPLE=1`). Es adecuado para equipos que necesiten una base reproducible antes de optimizar su propio pipeline.
- Validación de checkpoints cuantizados: el script `validate_qwen3_06b_fp4_checkpoint.py` comprueba el conjunto de ficheros, las configuraciones y el layout de safetensors, además del SHA256 (`f93cda479e431262458e2ba04cc4259be6b6caadbb53a2f2b0813c045e8e8d55`). Útil en pipelines de CI que verifiquen la integridad de artefactos antes de desplegarlos en flota.
- Inferencia batch offline en borde: el lanzador `run_qwen3_06b_text.sh` ejecuta inferencia por lotes sin necesidad de servidor OpenAI, con tolerancia a exit-134 y filtrado de ruido en stderr. Encaja en escenarios de procesamiento por lotes desconectado (clasificación, extracción, resúmenes) donde no se requiere API HTTP.
- Aceleración mediante caché de kernels: la caché AXDSL precompilada con nueve kernels permite evitar recompilaciones en el primer arranque si el toolchain AXNN y el contenido del grafo coinciden. Resulta útil en despliegues repetidos sobre el mismo hardware y versión de software.
- Investigación en cuantización FP4 para NPU: el paquete documenta con precisión el esquema NVFP4 (grupo 16, escalas F8_E4M3, escalas por tensor F32) y su interacción con la caché KV FP8/BF16, lo que lo convierte en material de referencia para estudiar cuantización de bajo bit en aceleradores no NVIDIA.
- Integración en pipelines de CI/CD de artefactos de modelo: los scripts de parcheo (`apply_runtime_patches.py`) e importación de caché (`import_cache.sh`) permiten automatizar la preparación de un entorno de ejecución con copias de seguridad de los ficheros originales en `$HOME/tmp/qwen3-06b-ax8860`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Hardware objetivo: NPU Axera AX8860, con runtime Axera (torch 2.13.0+cpu con runtime Axera, axnn 8.0, pyAXCL 0.5.1).
- Checkpoint: 533 MB en disco (559.126.528 bytes para `model.safetensors`).
- VRAM estimada para inferencia: no disponible; el despliegue es sobre NPU, no sobre GPU.
- GPU recomendadas: no aplica; el paquete está validado exclusivamente para AX8860.
- Compatibilidad con GPU de consumo: no disponible; no se documenta ejecución en RTX 4090 u otras GPU.
- Opciones de despliegue: SGLang con backend `axera` (`sglang-axera 0.5.18`, `sgl-kernel-axera 0.1.0`), modo BRUN batch offline. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI para este paquete.
- Límites de servidor validados: `--context-length 512`, `--max-total-tokens 12288`, `--max-running-requests 6`, `--page-size 256`, `--watchdog-timeout 99999`, `--disable-cuda-graph`, sin mem-fraction.
- Latencia y throughput: no disponibles en la información proporcionada.
- Stack de referencia: CPython 3.12.15, torch 2.13.0+cpu, transformers 5.12.1, sglang-axera 0.5.18, sgl-kernel-axera 0.1.0, axnn 8.0, pyAXCL 0.5.1.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-0.6B-AX8860-SGLang (este paquete) | 0,6 B | 32.768 (512 en validacion) | NVFP4, KV FP8/BF16 | BSD-3-Clause | Hugging Face, requiere NPU AX8860 |
| Qwen/Qwen3-0.6B (fuente) | 0,6 B | 32.768 | BF16 original | Apache-2.0 | Hugging Face |
| NVFP4/Qwen3-0.6B-FP4 (checkpoint base) | 0,6 B | 32.768 | NVFP4 (ModelOpt) | Apache-2.0 (heredada) | Hugging Face |

La comparación se limita a las variantes del mismo modelo base, ya que la información disponible no identifica alternativas de despliegue equivalentes para NPU AX8860. Los datos de rendimiento comparativo no están disponibles.

## Limitaciones y advertencias

- El paquete está validado exclusivamente para la NPU Axera AX8860 y el stack de software documentado; no se garantiza su funcionamiento en otro hardware o versiones distintas de sglang-axera, sgl-kernel-axera, axnn o pyAXCL.
- El contexto validado en la placa es de 512 tokens, muy inferior a los 32.768 del checkpoint original; el autor no documenta validación con contextos mayores.
- El checkpoint es text-only: no incluye torre de visión, AXModel de visión ni parche de runtime VL, por lo que no puede usarse para tareas multimodales.
- La caché AXDSL está indexada por contenido del grafo; si el toolchain AXNN o el grafo no coinciden, se producirán fallos de caché y recompilación en la placa, con el coste de tiempo asociado.
- El checkpoint FP4 no se almacena en el repositorio (0,0 GB); debe descargarse por separado desde `NVFP4/Qwen3-0.6B-FP4`, lo que introduce una dependencia externa y un paso adicional de verificación de integridad.
- Los metadatos del checkpoint marcan la caché KV como FP8, pero la validación del autor la sirvió en BF16; esta discrepancia puede afectar al consumo de memoria y debe tenerse en cuenta en producción.
- La licencia BSD-3-Clause del paquete hereda de la del checkpoint fuente; conviene verificar las condiciones de la licencia Apache-2.0 original de Qwen3-0.6B para usos comerciales y de redistribución.
- No se documentan sesgos conocidos, riesgos de alucinación ni limitaciones idiomáticas específicas en la información disponible; al tratarse de un modelo de 0,6 B parámetros, es razonable esperar una capacidad limitada de razonamiento complejo y una mayor propensión a errores factuales que modelos de mayor tamaño, aunque el autor no aporta datos al respecto.
- El script de parcheo modifica ficheros del paquete original y crea copias de seguridad en `$HOME/tmp/qwen3-06b-ax8860`; debe revisarse antes de aplicarlo en entornos productivos.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/AXERA-TECH/Qwen3-0.6B-AX8860-SGLang
- Checkpoint FP4 base: https://huggingface.co/NVFP4/Qwen3-0.6B-FP4
- Modelo original Qwen3-0.6B: https://huggingface.co/Qwen/Qwen3-0.6B
- Papers, blogs, repos y demos adicionales: no disponibles en la información proporcionada.
