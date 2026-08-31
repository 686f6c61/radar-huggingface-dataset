# gratex/Qwen3.8-27B-DFlash2-W4A16-g128-sym-GPTQ

## Resumen

El modelo `gratex/Qwen3.8-27B-DFlash2-W4A16-g128-sym-GPTQ` es un modelo borrador (draft model) cuantizado a 4 bits, diseñado exclusivamente para decodificación especulativa con el modelo objetivo `Qwen/Qwen3.8-27B`. Desarrollado por el usuario gratex sobre la base `incoai/Qwen3.8-27B-DFlash2`, implementa la arquitectura DFlash2 (block diffusion), que predice un bloque de 8 tokens en una sola pasada y utiliza un selector de ruta ligero para trazar una secuencia coherente a través de los tokens candidatos. Su propósito es acelerar la inferencia del modelo de 27B parámetros sin degradar la calidad de las respuestas.

El drafter comparte las capas `embed_tokens` y `lm_head` con el modelo objetivo, por lo que no se incluyen en el repositorio, lo que reduce el tamaño a 1,19 GB cuantizado (frente a 3,85 GB en BF16, una reducción de 3,2×). Con solo 5 capas estilo Qwen3 y 1,92 mil millones de parámetros, es un componente ligero que se integra en vLLM para lograr aceleraciones de hasta 3,04× en escenarios de baja concurrencia. Su relevancia actual radica en que permite desplegar modelos grandes de forma más eficiente en hardware de consumo, como una RTX 5090, manteniendo la calidad del modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DFlash2DraftModel (5 capas estilo Qwen3) |
| Parametros totales | 1.924.404.480 (drafter) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | Depende del modelo objetivo; en el ejemplo de vLLM se usa `--max-model-len 8192` |
| Tipos de cuantizacion | W4A16 (pesos INT4, activaciones BF16), group_size=128, simetrico |
| Idiomas soportados | no disponible (el modelo base Qwen3.8-27B es multilingue, pero no se especifica) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compressed-tensors pack-quantized, compatible Marlin) |

## Arquitectura y entrenamiento

El drafter implementa la arquitectura DFlash2, una variante de difusion de bloques para decodificacion especulativa. Consta de 5 capas transformer con hidden size de 5.120, intermediate size de 17.408, 32 cabezas de atencion para query y 8 para key/value (GQA), con dimension de cabeza de 128. El vocabulario es de 248.320 tokens. Cada bloque predice 8 tokens (1 verificado + 7 especulativos) y utiliza un selector de ruta basado en atencion bilineal con rango 256 y top-16 candidatos. Incluye una convolucion dinamica de dos taps (group_size=16) y atencion con ventana deslizante de 2.048 tokens en modo bidireccional (`is_causal=false`). Las capas del drafter se alinean con las capas [5, 19, 33, 47, 61] del modelo objetivo de 64 capas.

El modelo comparte `embed_tokens` y `lm_head` con el objetivo, por lo que no se incluyen en el repositorio. Todos los 35 pesos lineales de las 5 capas estan cuantizados a INT4 con group_size=128 y simetria, mientras que los componentes no lineales (normas, kernels de convolucion, codebooks del selector) se conservan en BF16. No se proporcionan detalles sobre el dataset de entrenamiento ni el proceso de optimizacion (RLHF, DPO, etc.), pero al ser un drafter, su entrenamiento se centra en imitar las salidas del modelo objetivo para maximizar la tasa de aceptacion de tokens especulativos.

## Capacidades

- Decodificacion especulativa: predice bloques de 8 tokens en una sola pasada, acelerando la generacion del modelo objetivo Qwen3.8-27B.
- Integracion con vLLM: compatible con vLLM ≥ 0.26.1 mediante el metodo `dflash` en `--speculative-config`.
- Cuantizacion eficiente: pesos INT4 con formato Marlin, lo que reduce el uso de VRAM y mejora el rendimiento en GPUs consumer.
- Seleccion de ruta adaptativa: el path selector con atencion bilineal elige la secuencia mas coherente entre los candidatos generados.
- Compatibilidad con KV cache FP8: soporta `--kv-cache-dtype fp8_e4m3` para aumentar la capacidad de cache sin penalizar la tasa de aceptacion.
- No es un modelo autonomo: no genera texto por si mismo; requiere el modelo objetivo para funcionar.

## Casos de uso

- Despliegue de Qwen3.8-27B en produccion con baja latencia: al usar el drafter con `num_speculative_tokens=7` en escenarios de un solo usuario, se consigue un speedup de hasta 3,04×, reduciendo el tiempo de respuesta en aplicaciones interactivas como chatbots o asistentes virtuales.
- Servicio multi-usuario con alta concurrencia: con `num_speculative_tokens=3` y KV cache FP8, se logra un speedup de 1,75× manteniendo un mayor espacio para cache, lo que permite atender hasta 8 peticiones simultaneas en una RTX 5090.
- Inferencia en hardware de consumo: el drafter cuantizado ocupa solo 1,19 GB, por lo que junto al modelo objetivo cuantizado cabe en GPUs de 24-32 GB, habilitando despliegues locales sin necesidad de clusters.
- Optimizacion de costes en la nube: al reducir el tiempo de computo por peticion, se disminuyen los costes de inferencia en entornos cloud con GPUs facturadas por hora.
- Integracion en pipelines de agentes con tool calling: el modelo objetivo soporta tool calling y razonamiento; el drafter acelera estas tareas sin alterar la funcionalidad, manteniendo la calidad de las respuestas.
- Evaluacion y pruebas de modelos: permite ejecutar benchmarks de Qwen3.8-27B con mayor rapidez, facilitando iteraciones de desarrollo y validacion.

## Benchmarks y rendimiento

Los benchmarks se ejecutaron en una RTX 5090 (32 GB) con el modelo objetivo `gratex/Qwen3.8-27B-W4A16-g128-sym-GPTQ`. Se midieron tres veces cada configuracion con semillas aleatorias para evitar hits de cache de prefijo.

### Throughput y aceptacion

| Config | C=1 tok/s | C=1 aceptacion | C=8 tok/s | C=8 aceptacion | KV cache tokens |
|---|---|---|---|---|---|
| Sin decodificacion especulativa | 88,8 | — | 577 | — | 79.510 |
| spec=3, fp8 KV, gpu_mem=0,98 | 185 | 70,0% (2,10/3) | 995 | 69,5% (2,09/3) | 58.173 |
| spec=7, fp8 KV, gpu_mem=0,98 | 260 | 46,8% (3,28/7) | 868 | 46,3% (3,24/7) | 38.751 |
| spec=3, bf16 KV, gpu_mem=0,90 | 189 | 69,9% (2,10/3) | 1.013 | 70,5% (2,11/3) | 31.495 |
| spec=7, bf16 KV, gpu_mem=0,90 | 270 | 47,3% (3,31/7) | 776 | 47,0% (3,29/7) | 22.454 |

### Speedup vs sin decodificacion especulativa

| Config | C=1 speedup | C=8 speedup |
|---|---|---|
| spec=3, fp8 KV | 2,08× | 1,72× |
| spec=7, fp8 KV | 2,93× | 1,50× |
| spec=3, bf16 KV | 2,13× | 1,75× |
| spec=7, bf16 KV | 3,04× | 1,34× |

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.) para este drafter, ya que no es un modelo de proposito general.

## Requisitos de hardware

- VRAM estimada: el drafter cuantizado ocupa 1,19 GB; el modelo objetivo cuantizado W4A16 de 27B requiere aproximadamente 14-16 GB. En total, se necesita una GPU con al menos 24 GB para operar con comodidad, aunque con cuantizaciones mas agresivas podria caber en 16 GB.
- GPU recomendadas: RTX 5090 (32 GB) utilizada en los benchmarks; tambien son adecuadas RTX 4090 (24 GB), A100 (40/80 GB) y H100 (80 GB).
- Compatibilidad con consumer GPU: si, siempre que se use el modelo objetivo cuantizado y se ajuste `gpu-memory-utilization` (0,90-0,98 en los ejemplos).
- Opciones de despliegue: vLLM (≥ 0.26.1 con soporte DFlash2, via PR #52816), imagen Docker `vllm/vllm-openai:cu129-nightly` (posterior a 2026-08-21). No se menciona soporte en llama.cpp, Ollama o TGI.
- Latencia y throughput: los datos de las tablas anteriores muestran entre 185 y 270 tok/s para C=1, y entre 776 y 1.013 tok/s para C=8, dependiendo de la configuracion.

## Comparativa con modelos similares

No se dispone de comparativas publicadas con otros drafter (como EAGLE, Medusa o Lookahead). La unica comparacion disponible es contra el propio modelo objetivo sin decodificacion especulativa, que se refleja en los benchmarks de speedup. Se puede considerar que este drafter es especifico para Qwen3.8-27B, mientras que alternativas genericas como Medusa requieren entrenamiento por modelo y no ofrecen el mismo nivel de integracion con vLLM. No obstante, no hay datos cuantitativos para una comparacion rigurosa.

## Limitaciones y advertencias

- No es un modelo autonomo: requiere el modelo objetivo Qwen3.8-27B (o una cuantizacion del mismo) para funcionar; no puede generar texto por si solo.
- Dependencia de vLLM: necesita una version especifica de vLLM (≥ 0.26.1) con soporte DFlash2, lo que limita su portabilidad a otros frameworks de inferencia.
- Parche requerido: la model card menciona un parche necesario para drafter cuantizados (vLLM issue #51581), que debe aplicarse manualmente en el entorno de despliegue.
- Perdida de precision por cuantizacion: los pesos INT4 pueden introducir una ligera degradacion en la calidad de las predicciones del drafter, aunque los benchmarks muestran tasas de aceptacion altas (70% con spec=3).
- Sesgos y alucinaciones: al ser un drafter, no aplican directamente, pero hereda las limitaciones del modelo objetivo en cuanto a sesgos y alucinaciones.
- Licencia: Apache 2.0, permite uso comercial y modificacion, pero se debe mantener la atribucion y los avisos de licencia.
- Contexto limitado: el drafter usa atencion con ventana deslizante de 2.048 tokens, aunque el contexto efectivo lo determina el modelo objetivo (hasta 8.192 en el ejemplo).

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/gratex/Qwen3.8-27B-DFlash2-W4A16-g128-sym-GPTQ
- Modelo base (drafter sin cuantizar): https://huggingface.co/incoai/Qwen3.8-27B-DFlash2
- Modelo objetivo: https://huggingface.co/Qwen/Qwen3.8-27B
- Cuantizacion del modelo objetivo usada en benchmarks: https://huggingface.co/gratex/Qwen3.8-27B-W4A16-g128-sym-GPTQ
- PR de vLLM con soporte DFlash2: https://github.com/vllm-project/vllm/pull/52816
- Documentacion de vLLM sobre decodificacion especulativa: https://docs.vllm.ai/en/latest/features/spec_decode.html
- Articulo de HackerNoon sobre Qwen3.8-27B-DFlash2: https://hackernoon.com/qwen38-27b-dflash2-a-guide-to-faster-qwen-inference
