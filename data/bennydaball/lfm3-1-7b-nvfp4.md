# BennyDaBall/LFM3-1.7B-NVFP4

## Resumen

LFM3-1.7B-NVFP4 es una cuantización de 4 bits (NVFP4) del modelo LFM3-1.7B de Liquid AI, publicada por el usuario independiente BennyDaBall. El modelo base es un transformer de tipo Liquid de 1.162.570.496 parámetros, orientado a generación de texto conversacional, con soporte de razonamiento, tool calling y modo "thinking" activado por defecto. Esta versión concreta no es un modelo nuevo, sino un derivado cuantizado que reemplaza los pesos del feed-forward por pesos NVFP4, manteniendo el resto de componentes (atención, convoluciones, embeddings, cabeza de salida y normalizaciones) en BF16 original de Liquid AI.

La relevancia de esta ficha radica en que introduce una mejora de cuantización sobre la NVFP4 oficial de Liquid AI. Frente al esquema de redondeo al más cercano (RTN) usado por defecto en ModelOpt, este repositorio aplica GPTQ junto con dos técnicas: Schur Replay (selección de escalas de bloque basada en la pérdida GPTQ real) y Four Over Six (mapeo a escala 4). El resultado declarado por el autor es una menor divergencia KL respecto al modelo BF16, tanto en el cómputo W4A4 como en el de solo pesos (W4A16), con el mismo mapa de capas, formato y velocidad que la NVFP4 oficial.

El modelo está pensado para su despliegue en GPUs Blackwell mediante vLLM o SGLang, con kernels CUTLASS SM120 de FP4 con escalas por bloque. No obstante, LFM3 no está integrado en ninguna release estable de esos motores a fecha de la publicación, por lo que requiere aplicar PRs específicos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer "Liquid" (LFM3), capas feed-forward cuantizadas a NVFP4; atención, convoluciones, embeddings, cabeza y normas en BF16 |
| Parametros totales | 1.162.570.496 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (W4A4 en feed-forward; W4A16 en vista de solo pesos), escalas por bloque de 16, escalas estáticas por tensor en activaciones |
| Idiomas soportados | no disponible |
| Licencia | LFM Open License v1.0 (lfm1.0) |
| Formato de pesos | safetensors (ModelOpt NVFP4), compatible con transformers y con vLLM/SGLang |

## Arquitectura y entrenamiento

El modelo base LFM3-1.7B es un transformer de la familia Liquid, de 1.162 millones de parámetros, orientado a generación de texto con capacidades conversacionales, de razonamiento y de tool calling. La cuantización de este repositorio no altera la arquitectura: mantiene el mapa de capas de la NVFP4 oficial de Liquid AI, con pesos y activaciones de las capas feed-forward en NVFP4 (bloques de 16 pesos con escalas E4M3, escalas de entrada estáticas por tensor y escalas dinámicas por bloque de 16 en activaciones), y el resto de componentes en BF16.

La innovación técnica está en el solver de pesos. En lugar de redondeo al más cercano (RTN, el valor por defecto de ModelOpt), se aplica GPTQ en el que cada bloque de 16 pesos prueba una ventana de códigos de escala E4M3 junto con el mapeo Four Over Six (arXiv 2512.02010). Cada candidato se evalúa reproduciendo las actualizaciones GPTQ del bloque y puntuándolo con su pérdida GPTQ real, es decir, el complemento de Schur de las columnas aún no cuantizadas (método Schur Replay, arXiv 2609.36654). Las matrices de Hessian se calculan a partir de 599.000 tokens de calibración que incluyen tool calls, chat, razonamiento y texto crudo; las respuestas de chat, tool call y razonamiento son generaciones del propio modelo BF16. El autor reporta que esta combinación produce pesos 1,36 veces más cercanos al BF16 bajo W4A4 y 1,87 veces en la vista de solo pesos.

## Capacidades

- Generación de texto conversacional multi-turno.
- Razonamiento con modo "thinking" activado por defecto.
- Tool calling / function calling mediante el formato XML propietario de Liquid.
- Razonamiento multi-paso y uso en flujos de agente (el autor menciona parsers automáticos de razonamiento y tool call en SGLang).
- Capacidades matemáticas y STEM, con parámetros de muestreo específicos recomendados (temperatura 1.0, top_p 0.95, top_k 20).
- Capacidades multilingües: no disponibles en la información proporcionada.
- No se documentan capacidades de visión ni audio.

## Casos de uso

- Asistentes conversacionales de baja latencia en GPUs Blackwell: el modelo decodifica a 402 tok/s en una RTX 5090 con vLLM, lo que permite interacción en tiempo real con un solo stream y un pool de KV de 1 GiB.
- Agentes con tool calling: el soporte del formato XML de Liquid y los parsers automáticos de SGLang permiten integrar el modelo en pipelines de agentes que invocan funciones externas, con la ventaja de que la cuantización preserva mejor las respuestas de tool call (KLD 0,0233 frente a 0,0353 de la NVFP4 oficial).
- Razonamiento asistido en entornos con VRAM limitada: con 1,86 GiB de pesos y un pico de 4.001 MiB, cabe en GPUs de consumo de gama alta y permite ejecutar cadenas de razonamiento sin renunciar a precisión de 4 bits.
- Servicio de chat en producción con vLLM: el checkpoint es drop-in respecto a la NVFP4 oficial de Liquid, por lo que se puede sustituir sin cambios en el pipeline de despliegue.
- Evaluación y benchmarking de técnicas de cuantización: al incluir métricas de KLD, acuerdo top-1 y desglose por tipo de contenido (tool, chat, razonamiento, texto crudo), sirve como referencia para comparar solvers de cuantización.
- Prototipado en estaciones de trabajo con una sola RTX 5090: el prefill de 53.368 tok/s con prompts de 2.300 tokens permite procesar contextos largos en local sin infraestructura dedicada.
- Despliegue en llama.cpp / LM Studio mediante el GGUF gemelo del autor, para entornos sin vLLM ni SGLang.

## Benchmarks y rendimiento

El autor publica métricas de divergencia respecto al BF16, no benchmarks de tareas estándar (MMLU, HumanEval, GSM8K no están disponibles en la información proporcionada).

| W4A4 (vLLM / SGLang) | KLD medio | Mediana | p99 | Acuerdo top-1 | Tool | Chat | Razonamiento | Texto crudo |
|---|---|---|---|---|---|---|---|---|
| Liquid NVFP4 | 0,0628 | 0,0187 | 0,584 | 90,3% | 0,0353 | 0,0707 | 0,0378 | 0,0870 |
| Este repositorio | 0,0461 | 0,0133 | 0,441 | 91,6% | 0,0233 | 0,0523 | 0,0262 | 0,0663 |

| Vista de solo pesos (W4A16) | KLD medio | Acuerdo top-1 |
|---|---|---|
| Liquid NVFP4 | 0,0332 | 92,9% |
| Este repositorio | 0,0178 | 94,8% |

Evaluación realizada sobre 150 secuencias y 124.790 tokens puntuados, con la matemática NVFP4 reproducida exactamente como la calculan los kernels W4A4.

Rendimiento en una RTX 5090 (vLLM 0.32.0 + overlay PR, 512 tokens, pool KV de 1 GiB):

| Checkpoint | Decode tok/s | Prefill tok/s (prompt 2,3k) | Pesos | VRAM pico |
|---|---|---|---|---|
| BF16 | 290 | 33.555 | 3,36 GiB | 5.424 MiB |
| Liquid NVFP4 | 379 | 54.685 | 1,86 GiB | 3.945 MiB |
| Este repositorio | 402 | 53.368 | 1,86 GiB | 4.001 MiB |

En SGLang (PR 46858): BF16 345 tok/s, Liquid NVFP4 513 tok/s, este repositorio 457 tok/s. El autor señala que la diferencia entre ambas NVFP4 cambia de signo según el runtime y que el tiempo total de kernels difiere en torno al 2%, por lo que deben considerarse iguales en velocidad.

## Requisitos de hardware

- Pesos: 1,86 GiB en NVFP4 (frente a 3,36 GiB en BF16).
- VRAM pico medida: 4.001 MiB en una RTX 5090 con pool KV de 1 GiB y 512 tokens.
- GPU recomendadas: NVIDIA Blackwell (RTX 5090, y por extensión la familia SM120) para aprovechar los kernels CUTLASS SM120 block-scaled FP4 GEMM. No se documenta soporte en arquitecturas anteriores.
- Cabe en GPU de consumo: sí, al menos en RTX 5090; no se confirma en otras consumer.
- Despliegue: vLLM v0.32.0 con el PR 64959, SGLang nightly con el PR 46858, y llama.cpp / LM Studio mediante el GGUF gemelo. Requiere `--trust-remote-code` en vLLM.
- Latencia y throughput: 402 tok/s de decode y 53.368 tok/s de prefill en RTX 5090 con vLLM; 457 tok/s de decode en SGLang.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | KLD medio (W4A4) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Este repositorio | 1.162.570.496 | no disponible | NVFP4 (GPTQ + Schur Replay + Four Over Six) | 0,0461 | LFM Open License v1.0 | Hugging Face |
| LiquidAI/LFM3-1.7B-NVFP4 | 1.162.570.496 | no disponible | NVFP4 (RTN vía ModelOpt) | 0,0628 | LFM Open License v1.0 | Hugging Face |
| LiquidAI/LFM3-1.7B (BF16) | 1.162.570.496 | no disponible | BF16 | 0 (referencia) | LFM Open License v1.0 | Hugging Face |

No se dispone de información sobre otros modelos comparables de la misma categoría en la documentación proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información proporcionada; al ser un derivado del modelo base, hereda los del LFM3-1.7B original.
- Riesgo de alucinación: no cuantificado; la cuantización introduce una divergencia adicional respecto al BF16 (KLD medio de 0,0461 en W4A4), que puede afectar a tareas sensibles a la precisión.
- Limitaciones de contexto e idioma: la longitud de contexto y los idiomas soportados no están disponibles en la información proporcionada.
- Licencia: LFM Open License v1.0 permite uso comercial solo si la entidad y su grupo corporativo facturan menos de 10 millones de dólares anuales; por encima de ese umbral se requiere licencia de Liquid AI. La licencia se mantiene sin cambios respecto al modelo base.
- Restricciones de despliegue: LFM3 no está en ninguna release estable de vLLM ni SGLang a fecha del 1 de noviembre de 2026; requiere PRs específicos y `--trust-remote-code`, lo que implica ejecutar código remoto.
- Compatibilidad de hardware: los kernels NVFP4 empleados son específicos de Blackwell (SM120); no se garantiza funcionamiento en GPUs anteriores.
- Autoría: el repositorio no está afiliado ni respaldado por Liquid AI; los pesos del feed-forward han sido modificados por un tercero.
- Rendimiento: la diferencia de velocidad frente a la NVFP4 oficial es inferior al 2% en tiempo de kernel y cambia de signo según el runtime, por lo que no debe esperarse una mejora de throughput.

## Enlaces

- Hugging Face: https://huggingface.co/BennyDaBall/LFM3-1.7B-NVFP4
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
- NVFP4 oficial de Liquid AI: https://huggingface.co/LiquidAI/LFM3-1.7B-NVFP4
- GGUF gemelo: https://huggingface.co/BennyDaBall/LFM3-1.7B-NVFP4-GGUF
- Liquid AI: https://www.liquid.ai/
- Paper Four Over Six: arXiv 2512.02010
- Paper Schur Replay: arXiv 2609.36654
- PR de vLLM: vllm-project/vllm PR 64959
- PR de SGLang: sgl-project/sglang PR 46858
