# LibertAIDAI/DeepSeek-V4.1-Flash-1017-EXL3-3.5bpw

## Resumen

DeepSeek-V4.1-Flash-1017-EXL3-3.5bpw es una cuantización EXL3 (trellis) del modelo base deepseek-ai/DeepSeek-V4.1-Flash-1017, publicada por el usuario LibertAIDAI. Se trata de un modelo de arquitectura Mixture-of-Experts (MoE) con 128.729.792.722 parámetros totales almacenados en safetensors, orientado a generación de texto y conversación. La cuantización reduce los pesos del tronco a 3,53 bits por peso (bpw) con cabezal de salida a 6 bpw, dando un repositorio de 257,6 GB (239,9 GiB) repartido en 44 shards.

El interés de esta ficha radica en que permite ejecutar un modelo de escala ~128B con pérdida de perplejidad mínima: +0,8% en código y +0,1% en prosa respecto al modelo sin cuantizar, según la model card. Además, incluye la torre de visión en BF16 y el drafter MTP/DSpark, lo que habilita decodificación especulativa. No obstante, el propio autor advierte de que este build no cabe en 2× DGX Spark a TP=2 (121,5 GiB de pesos por rango frente a ~117 GiB disponibles), por lo que para ese hardware remite a la variante de 2,9 bpw.

La licencia es MIT, lo que facilita el uso comercial, y el formato EXL3 requiere el runtime ExLlamaV3 o kits compatibles. Las tablas Engram (dos tablas de n-gramas de ~95 GiB cada una) no están incluidas en este repositorio y deben tomarse del checkpoint base, ya que cambiaron en esta release.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) transformer con atención, compresor KV, indexer, Engram y torre de visión; formato de pesos EXL3 trellis |
| Parametros totales | 128.729.792.722 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | EXL3 3,53 bpw en el tronco (4 bpw en capas 0-9 y 30-39; 3 bpw en capas 10-29), 6 bpw en shared expert, atención, compresor KV, indexer, proyección Engram, cabezal de salida y drafter MTP; BF16 en embeddings, normas, torre de visión y aligner; FP16/FP32 en router y streams mHC |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (EXL3 trellis: int16 + fp16 scales + codebook `mul1`), 44 shards, 257,6 GB |

## Arquitectura y entrenamiento

El modelo base es un transformer MoE con 384 expertos enrutados por capa, expertos compartidos y un router con sesgo de enrutamiento específico para tokens de imagen (`gate.bias_vl`). Incorpora mecanismos destacables: un compresor KV en las capas 2, 8, 14 y 20, un indexer de atención en las capas 2, 8, 14, 20, 24, 28, 32 y 36, y dos tablas Engram de búsqueda de n-gramas en las capas 1 y 14. Además incluye un drafter MTP/DSpark (`mtp.0-2`) con cabezales Markov y de confianza, lo que permite decodificación especulativa. La torre de visión y el aligner se copian sin cambios del checkpoint base en BF16.

La cuantización EXL3 emplea un esquema trellis con codebook `mul1` y escalas de canal de salida `always`. Los expertos enrutados usan una K por capa para las 1.152 matrices, requisito del loader MoE del kit de despliegue. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el modelo base. La model card menciona un parámetro `reasoning_effort` (valores 50, 75 y 100, con 75 por defecto) evaluado sobre 3.738 tareas de código agéntico, tau-bench, LiveCodeBench, AIME y chat.

## Capacidades

- Generación de texto y conversación multi-turno con plantilla de chat Jinja (`chat_template.jinja`) que renderiza de forma byte-idéntica al encoder de referencia en un corpus de 8.455 casos.
- Razonamiento con esfuerzo configurable mediante `reasoning_effort` (low 50, high 75 por defecto, max 100).
- Capacidades de visión: torre de visión y aligner incluidos en BF16, con tokens especiales `image_start`, `image_end` y `image_newline`.
- Uso agéntico con herramientas: la model card describe comportamiento en bucles agénticos donde el razonamiento de cada turno se relee en turnos posteriores.
- Decodificación especulativa mediante el drafter MTP/DSpark incluido.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Soporte de tool calling / function calling: no detallado explícitamente en la información disponible.

## Casos de uso

- Evaluación de modelos de escala ~128B en hardware limitado: la cuantización a 3,53 bpw permite cargar el modelo en configuraciones multi-GPU con menos memoria que el checkpoint base, manteniendo una perplejidad muy cercana (+0,8% en código).
- Pipelines de generación de código con razonamiento: el modelo puede usarse con `reasoning_effort` en high o low para equilibrar calidad y coste, según los datos del autor (high iguala a max con 0,55-0,8× del coste).
- Tareas agénticas de código: LiveCodeBench y agentic coding aparecen en el benchmark del autor, lo que sugiere uso en entornos de resolución de problemas de programación con herramientas.
- Benchmarking de tau-bench: útil para evaluar comportamiento conversacional con herramientas en escenarios de atención al cliente simulado.
- Evaluación de matemáticas: AIME figura entre las tareas evaluadas, por lo que puede emplearse en razonamiento matemático.
- Despliegue con decodificación especulativa: el drafter MTP/DSpark incluido permite acelerar la inferencia en runtimes que lo soporten.
- Investigación sobre cuantización EXL3: el repositorio sirve como referencia para estudiar el impacto de 3,53 bpw frente a 2,9 bpw y frente al modelo sin cuantizar.
- Procesamiento multimodal: al incluir torre de visión en BF16, puede emplearse en tareas que requieran entrada de imagen, aunque no se detallan capacidades concretas.

## Benchmarks y rendimiento

La model card proporciona datos de perplejidad sobre dos conjuntos de texto no publicado (32 secuencias × 2048 tokens, 65.504 tokens puntuados por conjunto):

| Modelo | Tamano | code | prose |
|---|---|---|---|
| Sin cuantizar (base FP8/MXFP4 dequantizado) | — | 1,8749 | 6,4277 |
| EXL3 2,9 bpw | 196,3 GiB | 1,9094 | 6,4520 |
| EXL3 3,5 bpw (este repo) | 239,9 GiB | 1,8895 | 6,4341 |
| Este repo con Engram desactivado (control) | — | 4,1548 | 8,9702 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. El autor menciona un benchmark de 3.738 tareas (agentic coding, tau-bench, LiveCodeBench, AIME, chat) sobre los pesos originales 1017, pero no se incluyen cifras concretas en la información proporcionada.

## Requisitos de hardware

- VRAM estimada: 239,9 GiB de pesos en total; a TP=2 requiere 121,5 GiB por rango, lo que excede la memoria disponible de un DGX Spark (~117 GiB).
- No cabe en 2× DGX Spark con este build; el autor recomienda la variante de 2,9 bpw (~98 GiB por rango) para ese hardware.
- GPU recomendadas: no disponibles explícitamente; por tamaño, requiere configuraciones multi-GPU de clase数据中心 (A100/H100) o kits específicos como el de MiaAI-Lab para 2× DGX Spark.
- No cabe en GPU de consumo individual (RTX 4090, etc.) dado el tamaño de 239,9 GiB.
- Opciones de despliegue: ExLlamaV3 (formato EXL3), kit MiaAI-Lab/DeepSeek-v4.1-Flash-EXL3-2x-DGX-Sparks (requiere `exl3_k_map.json` incluido), runtimes basados en vLLM con su encoder DeepSeek integrado.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Perplejidad code | Licencia | Tamano |
|---|---|---|---|---|---|
| EXL3 3,5 bpw (este repo) | 128,7B | no disponible | 1,8895 | MIT | 239,9 GiB |
| EXL3 2,9 bpw (LibertAIDAI) | no disponible | no disponible | 1,9094 | MIT | 196,3 GiB |
| Base sin cuantizar (DeepSeek-V4.1-Flash-1017) | no disponible | no disponible | 1,8749 | MIT | no disponible |
| NVFP4 (LibertAIDAI) | no disponible | no disponible | no disponible | MIT | no disponible |

No se dispone de datos de otros modelos comparables de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Las tablas Engram no están incluidas en este repositorio; deben tomarse de los shards 47 y 48 del checkpoint base, ya que cambiaron en esta release. Sin ellas, la perplejidad se degrada drásticamente (4,1548 en code y 8,9702 en prose en el control).
- El modelo no cabe en 2× DGX Spark a TP=2; usar la variante de 2,9 bpw para ese hardware.
- En uso agéntico, el razonamiento de cada turno se relee en turnos posteriores, por lo que el coste de razonamiento se acumula; el autor recomienda evitar `reasoning_effort` max en bucles agénticos salvo necesidad.
- Riesgo de alucinación: no cuantificado en la información disponible.
- Sesgos conocidos: no disponibles.
- Idiomas soportados: no disponibles.
- La licencia MIT permite uso comercial, pero debe verificarse la licencia del modelo base y de las tablas Engram tomadas del checkpoint base.
- El formato EXL3 requiere runtimes específicos (ExLlamaV3 o kits compatibles); no es directamente compatible con llama.cpp u Ollama según la información disponible.
- La plantilla de chat es necesaria en runtimes que la exijan al arranque; los kits basados en vLLM usan su encoder DeepSeek integrado.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/LibertAIDAI/DeepSeek-V4.1-Flash-1017-EXL3-3.5bpw
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Variante 2,9 bpw: https://huggingface.co/LibertAIDAI/DeepSeek-V4.1-Flash-1017-EXL3-2.9bpw
- Variante NVFP4: https://huggingface.co/LibertAIDAI/DeepSeek-V4.1-Flash-1017-NVFP4
- Variante 2,9 bpw de Mia-AiLab: https://huggingface.co/Mia-AiLab/DeepSeek-V4.1-Flash-EXL3-2.9bpw
- Kit de despliegue 2× DGX Spark: https://github.com/MiaAI-Lab/DeepSeek-v4.1-Flash-EXL3-2x-DGX-Sparks
- Plantilla de chat de referencia (jayleaton): https://huggingface.co/jayleaton/DeepSeek-V4.1-Flash-EXL3-2.8bpw
- Discusión sobre reasoning_effort: https://huggingface.co/LibertAIDAI/DeepSeek-V4.1-Flash-1017-EXL3-2.9bpw/discussions/4
