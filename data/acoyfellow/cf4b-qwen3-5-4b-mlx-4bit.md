# acoyfellow/cf4b-qwen3.5-4b-mlx-4bit

## Resumen

cf4b es un ajuste fino de Qwen3.5-4B, desarrollado por el usuario acoyfellow, orientado a la generación de código TypeScript para Cloudflare Workers y de configuraciones válidas de `wrangler.jsonc`. El modelo parte de la versión cuantizada a 4 bits en MLX (`mlx-community/Qwen3.5-4B-MLX-4bit`) y se distribuye como un artefacto de 2,22 GB pensado para ejecutarse localmente en portátiles con Apple Silicon, concretamente en un MacBook Air de 16 GB. La propuesta es acotada pero muy específica: sustituir el comportamiento errático del modelo base en tareas de Cloudflare por una respuesta ajustada al ecosistema de Workers.

El problema que aborda es concreto: el Qwen3.5-4B sin ajustar alucina importaciones de Deno y Node (`deno.land/x/cors`, `node-fetch`, `node:crypto`) en tareas HTTP y de almacenamiento, y coloca bindings de R2 o KV dentro del bloque `vars` de la configuración. El ajuste reduce esos errores de lista blanca de importaciones y bindings del 100 % al 0 % en las categorías `http` y `storage`, lo que eleva los resultados del microbenchmark de Cloudflare de 12/80 a 26/80.

La relevancia es doble. Por un lado, demuestra un flujo de trabajo de ajuste fino con verificación puramente mecánica (compilación, despliegue en seco, tests) en lugar de evaluación con LLM como juez. Por otro, expone con honestidad sus límites: el entrenamiento se hizo en un equipo de 16 GB que sufrió OOM de Metal por encima de 512 tokens, de modo que las categorías de almacenamiento y estado siguen débiles y el modelo está muy lejos de una referencia en la nube (90 % en el mismo benchmark). La versión publicada es la v0.1.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (heredada de Qwen3.5-4B), ajuste fino con LoRA y fusión posterior en MLX |
| Parámetros totales | 4B (modelo base Qwen3.5-4B); no se detalla el recuento exacto tras el ajuste |
| Parámetros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible en la información proporcionada; el entrenamiento se filtró a secuencias de ≤ 512 tokens |
| Tipos de cuantización | 4 bits (MLX 4-bit, pesos fusionados con `mlx_lm.fuse`) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 (heredada de Qwen/Qwen3.5-4B) |
| Formato de pesos | MLX (formato nativo de `mlx-lm`); no se indica disponibilidad de safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo es un ajuste fino mediante LoRA sobre la versión MLX 4-bit de Qwen3.5-4B. La configuración declarada es `rank=8`, `8 layers` entrenables y `1.546` iteraciones. Tras el entrenamiento se aplicó `mlx_lm.fuse`, lo que explica que el artefacto final (2,22 GB) sea más pequeño que el modelo base cuantizado (2,85 GB): la fusión elimina los pesos de visión no utilizados. El resultado es un modelo de texto puro.

Los datos de entrenamiento son 2.000 tareas sintéticas de Cloudflare Workers y `wrangler.jsonc`, generadas por tres modelos profesores distintos de pesos abiertos. Solo entraron en el conjunto las soluciones que superaron `wrangler 4.101.0 deploy --dry-run`, `typescript 5.9.3 --noEmit`, `vitest 4.1.12` con `@cloudflare/vitest-pool-workers 0.16.16`, la lista blanca de bindings e importaciones y la rúbrica de configuración JSONC, con una tasa de aprobación del 67,8 %. Se añadió un 25 % de repetición de código Python verificado (MBPP train+val y transformaciones sintéticas) para preservar la capacidad general de programación. La limpieza de contaminación combinó deduplicación de 8-gramas prosa contra prosa y de esqueletos AST, eliminando 56 filas solapadas, y se re verificó con 0 coincidencias frente a las 80 tareas de test, 20 de desarrollo y 18 fixtures públicos de `cf-build-bench`.

La limitación técnica principal del entrenamiento es la memoria: el MacBook Air de 16 GB sufrió OOM de Metal en las pasadas backward de `qwen3_5` por encima de 512 tokens. Por eso el conjunto se filtró a las 773 filas más cortas sin truncar (≤ 512 tokens), lo que excluyó la mayoría de ejemplos largos de `storage` (KV, R2, D1) y `stateful` (Durable Objects, Queues, Workflows). No se menciona RLHF ni DPO.

## Capacidades

- Generación de código TypeScript para Cloudflare Workers, con especial atención a la lista blanca de importaciones y bindings del runtime.
- Generación de configuraciones `wrangler.jsonc` válidas, con bindings colocados en el bloque correcto.
- Corrección de errores de configuración en tareas de tipo `cfg` y `http`, donde el modelo base fallaba sistemáticamente.
- Reparación de código (`repair`): 10/16 en el microbenchmark, ligeramente por debajo del modelo base (12/16).
- Retención de programación general en Python: 757/952 casos (79,52 %) en el canario, apenas 0,53 puntos por debajo del base.
- Generación de texto en modo no-thinking (`enable_thinking=False`) según la configuración de evaluación empleada.
- No se documentan capacidades de tool calling, function calling, agentes, visión, audio ni multilingüismo; el ajuste eliminó los pesos de visión.

## Casos de uso

- Generación de `wrangler.jsonc` para nuevos Workers: el modelo produce configuraciones con bindings de R2, KV y D1 en el bloque correcto, y es la categoría donde el ajuste logró pasar de 0/16 a 7/16. Se usaría como primer borrador que luego valida `wrangler deploy --dry-run` en CI.
- Andamiaje de handlers HTTP en Workers: dado un enunciado de endpoint, genera el `src/index.ts` con importaciones permitidas por el runtime, evitando las dependencias de Node y Deno que el base alucinaba. Adecuado para prototipado rápido en local sobre Apple Silicon.
- Asistente de código en el editor para proyectos de Cloudflare: al ejecutarse en un MacBook Air de 16 GB con 2,72 GB de RSS pico y 244 ms de TTFT, puede mantener una sesión interactiva de autocompletado y generación de fragmentos sin conexión.
- Reparación de errores de compilación en Workers: la categoría `repair` (10/16) permite alimentar el error de `tsc` o de `wrangler` y obtener un parche. Es más fiable como sugerencia que como corrección automática, dado que el base obtiene 12/16 en esa misma categoría.
- Generación de tests con `vitest-pool-workers`: el modelo se entrenó con ese entorno de pruebas, por lo que puede proponer casos de test para handlers de Workers, aunque esta capacidad no se evalúa de forma aislada en el benchmark publicado.
- Filtro previo en pipelines de revisión: al tener una tasa de error de lista blanca del 0 % en importaciones y bindings tras el ajuste, puede usarse como generador de candidatos que un paso de validación mecánica acepta o rechaza, reduciendo el coste de revisión manual.
- Experimentación e investigación en ajuste fino local: sirve como referencia reproducible de un ciclo LoRA con verificación mecánica sobre un equipo de consumo, útil para quien quiera replicar el método con más datos.

## Benchmarks y rendimiento

Evaluación greedy (`temp=0`), modo no-thinking, `max_tokens=1024`, sin reintentos y sin salidas vacías.

| Modelo | Tamaño | CF micro-bench (80) | cfg (16) | http (16) | storage (16) | stateful (16) | repair (16) | Canario Python (952) | Velocidad en M4 Air |
|---|---|---:|---:|---:|---:|---:|---:|---:|---|
| **cf4b v0.1 (MLX 4-bit fusionado)** | **2,22 GB** | **26/80 (32,50 %)** | **7** | **7** | **1** | **1** | 10 | **757/952 (79,52 %)** | **37,57 tok/s · 244 ms TTFT** |
| Qwen3.5-4B (base sin entrenar, MLX 4-bit) | 2,85 GB | 12/80 (15,00 %) | 0 | 0 | 0 | 0 | 12 | 762/952 (80,04 %) | 37,34 tok/s · 260 ms TTFT |
| Qwen3-4B (sin entrenar, MLX 4-bit) | 2,10 GB | 15/80 (18,75 %) | 0 | 3 | 0 | 0 | 12 | 734/952 (77,10 %) | — |
| Qwen3-4B-Instruct-2507 (sin entrenar, MLX 4-bit) | 2,30 GB | 15/80 (18,75 %) | 0 | 3 | 0 | 0 | 12 | — | — |
| gemma-4-e4b-it (sin entrenar, MLX 4-bit) | 5,15 GB | 15/80 (18,75 %) | 2 | 3 | 0 | 0 | 10 | — | — |
| Qwen2.5-Coder-7B-Instruct (sin entrenar, MLX 4-bit) | 4,28 GB | 13/80 (16,25 %) | 2 | 0 | 0 | 0 | 11 | — | — |
| Qwen2.5-Coder-3B-Instruct (sin entrenar, MLX 4-bit) | 1,80 GB | 12/80 (15,00 %) | 2 | 0 | 0 | 0 | 10 | — | — |
| Phi-4-mini-instruct (sin entrenar, MLX 4-bit) | 2,30 GB | 5/80 (6,25 %) | 1 | 0 | 0 | 0 | 4 | — | — |
| Referencia en la nube (DeepSeek V4.1 Flash) | nube | 72/80 (90,00 %) | 16 | 16 | 12 | 12 | 16 | — | — |

Datos adicionales declarados por el autor:

- Ganancia sobre el base sin entrenar: +17,50 puntos (IC bootstrap pareado del 95 %: [+7,50, +27,50]; 17 victorias y 3 derrotas).
- Supera a todas las líneas base locales de 3B a 7B probadas por entre +13,75 y +26,25 puntos.
- Retención de programación general: −0,53 puntos en el canario Python de 119 tareas y 952 casos.
- Huella en MacBook Air de 16 GB: 2,22 GB en disco, 1,63 s de carga, 2,72 GB de RSS pico, 0,60 GB de swap, 37,57 tok/s de decodificación (1,01× el base) y 244 ms de TTFT (0,94× el base).

## Requisitos de hardware

- VRAM/RAM estimada: 2,72 GB de RSS pico en inferencia según la medición del autor; el artefacto ocupa 2,22 GB en disco.
- GPU recomendadas: Apple Silicon con soporte Metal; el autor lo midió en un MacBook Air M4 con 16 GB de memoria unificada.
- Cabe en GPU de consumo: sí, en cualquier Mac Apple Silicon con al menos 16 GB de memoria unificada. No se proporcionan datos para GPU NVIDIA o AMD, dado que el formato es MLX.
- Opciones de despliegue: `mlx-lm` en Apple Silicon. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, ni existen pesos GGUF publicados.
- Latencia y throughput: 37,57 tok/s de decodificación y 244 ms de TTFT en M4 Air con contexto de evaluación de hasta 1.024 tokens de salida. Tiempo de carga de 1,63 s.
- Nota: el entrenamiento requirió filtrar a 512 tokens por OOM de Metal en un equipo de 16 GB; la inferencia no presenta ese límite según los datos publicados.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | CF micro-bench (80) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| cf4b v0.1 | 4B (base Qwen3.5-4B) | no disponible | 26/80 (32,50 %) | Apache-2.0 | MLX 4-bit en Hugging Face |
| Qwen3.5-4B (base) | 4B | no disponible | 12/80 (15,00 %) | Apache-2.0 | MLX 4-bit en Hugging Face |
| Qwen2.5-Coder-7B-Instruct | 7B | no disponible | 13/80 (16,25 %) | Apache-2.0 | MLX 4-bit en Hugging Face |
| gemma-4-e4b-it | 4B (aprox.) | no disponible | 15/80 (18,75 %) | no disponible | MLX 4-bit en Hugging Face |
| DeepSeek V4.1 Flash | no disponible | no disponible | 72/80 (90,00 %) | no disponible | Referencia en la nube |

La comparación se limita al microbenchmark de Cloudflare publicado por el autor; no hay datos de MMLU, HumanEval ni GSM8K para ninguno de los modelos de la tabla, por lo que no es posible contrastar capacidades generales.

## Limitaciones y advertencias

- El benchmark es propio y muy acotado (80 tareas de Cloudflare); no se ha ejecutado la evaluación ciega sobre el conjunto público de 18 tareas `cf-build-bench`.
- Las categorías `storage` (1/16) y `stateful` (1/16) siguen siendo muy débiles porque el entrenamiento excluyó la mayoría de ejemplos largos de KV, R2, D1, Durable Objects, Queues y Workflows.
- La categoría `repair` (10/16) está por debajo del modelo base (12/16): el ajuste no mejora la reparación de código.
- El modelo está muy lejos de una referencia en la nube en el mismo benchmark (26/80 frente a 72/80), por lo que no sustituye a un modelo frontier en producción.
- El ajuste se hizo sobre un conjunto de 773 filas de ≤ 512 tokens por limitaciones de memoria del equipo de entrenamiento; la cobertura de casos largos es estructuralmente incompleta.
- Riesgo de alucinación de importaciones y bindings fuera de las categorías ajustadas; la lista blanca solo se verificó como corregida en `http` y `storage`.
- Solo se distribuyen pesos en formato MLX: no hay GGUF ni safetensors, lo que limita el despliegue a Apple Silicon y a `mlx-lm`.
- No se documentan idiomas soportados, sesgos conocidos ni evaluación multilingüe; el modelo base es de propósito general, pero el ajuste es específico de Cloudflare.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, y la versión publicada es v0.1 con una v0.2 anunciada pero no disponible.
- Licencia Apache-2.0 heredada, permisiva para uso comercial, pero conviene verificar las condiciones del modelo base Qwen3.5-4B.
- El autor declara que el 100 % del código de entrenamiento es sintético, sin datos de clientes, logs privados ni secretos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/acoyfellow/cf4b-qwen3.5-4b-mlx-4bit
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Versión MLX del base: https://huggingface.co/mlx-community/Qwen3.5-4B-MLX-4bit
