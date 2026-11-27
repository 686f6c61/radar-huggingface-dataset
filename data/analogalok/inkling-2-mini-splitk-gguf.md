# analogalok/Inkling-2-Mini-SplitK-GGUF

## Resumen

Inkling-2-Mini-SplitK-GGUF es una redistribución en formato GGUF del modelo Inkling-2-Mini desarrollado por Thinking Machines Lab. El modelo original es un transformer con arquitectura MoE (mixture of experts) y núcleo "looped" (repetido tres veces), con 26.070.390.272 parámetros totales. Esta versión concreta, publicada por el usuario analogalok, no modifica los pesos: mantiene los tensores bit a bit idénticos a la cuantización dinámica de 3 bits `UD-Q3_K_XL` de Unsloth y solo altera una clave de metadatos del cabecero GGUF.

La innovación de esta ficha es puramente de despliegue: convierte el parámetro global `inkling2_loop.expert_used_count` (un escalar de valor 8) en un array de 24 elementos que permite asignar un número distinto de expertos activos por capa. El objetivo es ajustar el reparto de cómputo entre VRAM de GPU y memoria DDR4 de CPU en equipos con poca VRAM, de modo que las capas del núcleo looped (las más críticas) mantengan más expertos activos en GPU y las capas externas usen menos expertos en CPU.

Es relevante para desarrolladores que quieran ejecutar un MoE de ~26B parámetros en GPUs de consumo (8 GB de VRAM) sin recompilar llama.cpp, ajustando el equilibrio latencia/calidad mediante presets predefinidos (`split4684` y `split585`) y un script de parcheo local que evita descargar de nuevo los 12,7 GiB del GGUF base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con núcleo looped (3× looped core); 24 bloques (`blk.0`–`blk.23`) |
| Parametros totales | 26.070.390.272 |
| Parametros activos | No disponible (el número de expertos activos es configurable por capa: 4, 5, 6 u 8 en los presets publicados) |
| Longitud de contexto | Hasta 32k–64k tokens recomendado en 8 GB de VRAM con `split4684`; 4k–8k con `split585`; contexto máximo nativo no disponible |
| Tipos de cuantizacion | GGUF `UD-Q3_K_XL` (3 bits dinámico de Unsloth); caché KV `q4_0` en los comandos de ejemplo |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (compatible con llama.cpp / llama-server; builds Unsloth `-mix`) |

## Arquitectura y entrenamiento

El modelo base es un transformer MoE con una estructura "looped": un núcleo central de capas que se ejecuta tres veces, flanqueado por capas externas. En los GGUF de esta ficha los 24 bloques se agrupan funcionalmente en `blk.0–5` (externos inferiores, candidatos a CPU), `blk.6` (borde del loop), `blk.7–17` (núcleo looped 3×, candidato a GPU) y `blk.18–23` (externos superiores, candidatos a CPU). El parámetro `inkling2_loop.expert_used_count` controla cuántos expertos se activan por capa.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF/DPO, porque la model card de esta redistribución solo documenta el proceso de cuantización y parcheo. La innovación técnica documentada es el parcheo del cabecero GGUF: sustituir el escalar global `expert_used_count=8` por un array `UINT32` de 24 elementos, sin recompilar llama.cpp y sin tocar los pesos. Los presets publicados son `split4684` (capas CPU a 4 expertos, borde a 6, núcleo a 8) y `split585` (capas CPU a 5, borde a 8, núcleo a 8). El repositorio incluye `patch_split_k.py` para aplicar el parche en menos de un segundo, en copia o in-place, con opción de restaurar.

## Capacidades

- Generación de texto conversacional en formato chat (tag `conversational`, soporte de plantilla Jinja con `--jinja`).
- Razonamiento con control de esfuerzo mediante `--chat-template-kwargs '{"reasoning_effort":0.3}'`.
- Ejecución nativa en llama.cpp y llama-server sin recompilación de C++.
- Ajuste fino del equilibrio VRAM/CPU por capa mediante `expert_used_count` y `-ot` (offload de tensores).
- Compatible con endpoints (`endpoints_compatible`).
- Capacidades multilingües, de código, matemáticas, tool calling o agentes: no disponibles en la información proporcionada.

## Casos de uso

- Inferencia de un MoE de ~26B parámetros en GPU de 8 GB: con el preset `split4684` y `-ot "blk\.([0-6]|1[89]|2[0-3])\.ffn_.*_exps.*=CPU"`, el núcleo looped se mantiene en VRAM y las capas externas se descargan a DDR4, permitiendo contextos de 32k–64k con decodificación de ~30 t/s en una RTX 4060 Laptop.
- Resumen de documentos largos: el autor midió un resumen de 11.374 tokens con 114,92 t/s de prefill y 25,71 t/s de decode, adecuado para pipelines de summarization con prompts de decenas de miles de tokens.
- Servicio de chat local con contexto extendido: `llama-server` con `--ctx-size 32768 --parallel 1` y caché KV `q4_0` permite desplegar un endpoint conversacional en hardware de consumo.
- Ajuste de rendimiento por tiers de memoria: el preset `split585` mejora la perplejidad (8,3989 frente a 8,4247 del `k=6` global) y está pensado para GPUs de 10–12 GB o para contextos de 4k–8k donde se prioriza velocidad.
- Experimentación con routing MoE por capa: el script `patch_split_k.py` permite generar variantes propias del array de 24 elementos y medir el impacto en perplejidad y throughput sin re-descargar el modelo.
- Integración en pipelines existentes de llama.cpp/Unsloth: al mantener los pesos idénticos al `UD-Q3_K_XL` de Unsloth, se puede sustituir el GGUF base por el parcheado conservando el resto de la configuración.

## Benchmarks y rendimiento

| Configuración | `blk.0–5` | `blk.6` | `blk.7–17` | `blk.18–23` | WikiText-2 PPL (8.192 tok) |
|---|---:|---:|---:|---:|---:|
| Unsloth `UD-Q3_K_XL` (k=8) | 8 | 8 | 8 | 8 | 8,2201 |
| Global k=6 (`--override-kv`) | 6 | 6 | 6 | 6 | 8,4247 |
| `split4684.gguf` | 4 | 6 | 8 | 4 | 8,6100 |
| `split585.gguf` | 5 | 8 | 8 | 5 | 8,3989 |

Rendimiento medido en RTX 4060 Laptop (8 GB) + 16 GB DDR4, contexto 32.768, caché KV `q4_0`, build Unsloth `b12651-mix`:

| Escenario | Prefill | Decode |
|---|---:|---:|
| Prompt limpio de 3,2k tokens (`split4684`) | 154,44 t/s | 30,46 t/s |
| Resumen de 11.374 tokens grabando pantalla (`split4684`) | 114,92 t/s | 25,71 t/s |

Mejoras relativas declaradas por el autor con `split4684` frente a `k=6` global: +28 % en prefill y +7 % en decode; frente a `k=8`: +81 % en prefill y +34 % en decode. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM: 8 GB es el mínimo objetivo de los presets publicados; con `split4684` se recomienda contexto de 32k–64k y con `split585` de 4k–8k o GPUs de 10–12 GB o más.
- Memoria de sistema: 16 GB DDR4 en las mediciones del autor; el modelo completo en `UD-Q3_K_XL` ocupa unos 12,7 GiB.
- GPU recomendadas: RTX 4060 Laptop (8 GB) como referencia medida; cualquier GPU con 8 GB o más puede usar los presets, y con 10–12 GB conviene `split585`.
- Cabe en GPU de consumo: sí, con offload parcial de capas a CPU mediante `-ot` y `-ngl 99 -fit off`.
- Despliegue: llama.cpp / llama-server con builds Unsloth `-mix` (probado en `b12651-mix`); requiere soporte de `--jinja`, `--cache-type-k/v`, `-ot` y `--chat-template-kwargs`.
- Throughput estimado: 154,44 t/s prefill y 30,46 t/s decode en prompt de 3,2k; 114,92 t/s prefill y 25,71 t/s decode en 11.374 tokens (RTX 4060 Laptop, 8 GB + 16 GB DDR4).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | PPL WikiText-2 (8.192 tok) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Inkling-2-Mini `UD-Q3_K_XL` (Unsloth, k=8) | 26,07B totales | No disponible | 8,2201 | Apache 2.0 | Hugging Face (unsloth/Inkling-2-Mini-GGUF) |
| Inkling-2-Mini `UD-Q3_K_XL` con `--override-kv` k=6 | 26,07B totales | No disponible | 8,4247 | Apache 2.0 | Mismo GGUF base |
| Inkling-2-Mini-SplitK `split585` | 26,07B totales | 4k–8k (8 GB) | 8,3989 | Apache 2.0 | Este repositorio |
| Inkling-2-Mini-SplitK `split4684` | 26,07B totales | 32k–64k (8 GB) | 8,6100 | Apache 2.0 | Este repositorio |

No se dispone de datos para comparar con modelos de otros autores de tamaño o tarea equivalente.

## Limitaciones y advertencias

- El parche solo cambia metadatos; no mejora la calidad intrínseca del modelo base. La perplejidad empeora en ambos presets respecto al baseline `k=8` (8,6100 y 8,3989 frente a 8,2201).
- No se debe pasar `--override-kv inkling2_loop.expert_used_count=...` al usar estos GGUF: sobrescribe el array por capa y vuelve al escalar global, anulando el beneficio.
- El rendimiento medido corresponde a un único equipo (RTX 4060 Laptop 8 GB + 16 GB DDR4); en otras configuraciones los presets pueden no ser óptimos.
- Al reducir expertos activos en las capas externas se puede degradar la coherencia; el autor documenta que un `k=5` global provoca "rambling" con +28 % de tokens generados.
- Riesgo de alucinación, sesgos conocidos y limitaciones idiomáticas: no disponibles en la información proporcionada.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base de Thinking Machines Lab y de la cuantización de Unsloth.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; es una redistribución de terceros, no una publicación oficial del autor del modelo base.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/analogalok/Inkling-2-Mini-SplitK-GGUF
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- GGUF de Unsloth: https://huggingface.co/unsloth/Inkling-2-Mini-GGUF
