# LibertAIDAI/DeepSeek-V4.1-Flash-1017-EXL3-3.5bpw

## Resumen

DeepSeek-V4.1-Flash-1017-EXL3-3.5bpw es una cuantización EXL3 de 3,53 bits por peso (bpw) del modelo base `deepseek-ai/DeepSeek-V4.1-Flash-1017`, publicada por el usuario LibertAIDAI. No se trata de un modelo entrenado desde cero, sino de un checkpoint comprimido para inferencia que reduce el peso del trunk cuantizado a 239,9 GiB (257,6 GB repartidos en 44 shards de safetensors) manteniendo el modelo original en licencia MIT. El objetivo es hacer servible un MoE de gran tamaño en hardware de gama workstation, en concreto en el kit de dos nodos DGX Spark con tensor parallelism 2 que mantiene MiaAI-Lab.

El modelo base es un transformer de mezcla de expertos con 384 expertos enrutados por capa, atención con compresor de KV e indexador disperso, streams mHC, sinks de atención y dos tablas Engram de búsqueda n-gram en las capas 1 y 14. Según los safetensors de este repositorio, el trunk cuantizado suma 128.729.792.722 parámetros; las tablas Engram (FP8 con escalas de bloque E8M0, unos 95 GiB cada una) no se incluyen y deben descargarse del repositorio base. El checkpoint conserva además la torre de visión en BF16 y el drafter MTP/DSpark, lo que habilita entrada multimodal y decodificación especulativa.

La relevancia es práctica: es una de las pocas rutas documentadas para ejecutar un modelo de esta familia por debajo de los 4 bpw con una degradación de perplejidad medida de +0,8 % en código y +0,1 % en prosa frente al modelo sin cuantizar. El coste es una dependencia fuerte de un stack de serving concreto (vLLM modificado más el kit de dos DGX Spark), porque exllamav3 upstream todavía no dispone de clase `DeepseekV41`.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE con 384 expertos enrutados por capa, compresor de KV, indexador disperso, streams mHC, sinks de atención y tablas Engram n-gram |
| Parámetros totales | 128.729.792.722 (~128,7 B) según safetensors del repo; excluye las tablas Engram (~190 GiB), que no se incluyen |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | EXL3 trellis a 3,53 bpw medios: expertos enrutados a 4 bpw en capas 0-9 y 30-39, 3 bpw en capas 10-29; experto compartido, atención, compresor de KV, indexador, proyección Engram, cabeza de salida y drafter a 6 bpw; `indexer.wk` a 8 bpw; embeddings, normas y torre de visión en BF16; router en FP16/FP32 |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (matrices EXL3 como `trellis` int16 + `suh`/`svh` fp16 + `mul1` int32); 44 shards, 257,6 GB |

## Arquitectura y entrenamiento

El modelo base es un transformer de mezcla de expertos de 40 capas (el rango de cuantización cubre capas 0 a 39) con 384 expertos enrutados por capa, cada uno con las matrices `w1`, `w2` y `w3`, lo que da 1.152 matrices por capa y un total de 384 expertos. Además del bloque de expertos enrutados existe un experto compartido (`ffn.shared_experts`), y el enrutamiento se realiza mediante `ffn.gate.weight` y `ffn.gate.bias` en FP16, con un sesgo de enrutamiento específico para tokens de imagen (`gate.bias_vl`, FP32). La atención incorpora mecanismos poco habituales: un compresor de KV (`attn.compressor.wkv` / `wgate`) en las capas 2, 8, 14 y 20, y un indexador disperso (`attn.indexer.wq_b` en las capas 2, 8, 14, 20, 24, 28, 32 y 36, e `indexer.wk` en 2, 8, 14 y 20), además de streams mHC en FP32 y sinks de atención. La matriz de salida de atención `wo_a` se almacena como 8 slices por grupo.

La innovación propia de la familia V4.1 son las dos tablas Engram de búsqueda n-gram (`layers.1.engram.embed` y `layers.14.engram.embed`), en FP8 con escalas de bloque E8M0 y unos 95 GiB cada una, que se consultan sin cuantizar y que en la versión 1017 han cambiado respecto a `DeepSeek-V4.1-Flash`, por lo que no se pueden reutilizar los shards antiguos. El checkpoint incluye también el drafter MTP/DSpark (`mtp.0-2`, con `markov_head` y `confidence_head`) para decodificación especulativa, y una torre de visión más aligner copiados sin cambios del base en BF16.

Sobre el entrenamiento del modelo original no hay información en la documentación disponible: no se detallan número de tokens, composición del dataset ni si hubo RLHF, DPO u otras fases de alineamiento. Lo que sí está documentado es el proceso de cuantización: cuantización post-entrenamiento con EXL3 en formato trellis, codebook `mul1` y escalas de canal de salida en modo `always`, con un K por capa compartido por las 1.152 matrices de cada capa para que el cargador MoE del kit de serving funcione.

## Capacidades

- Generación de texto autoregresiva en modo `text-generation`, el pipeline declarado en el repositorio.
- Procesamiento de imágenes: la torre de visión y el aligner están incluidos en BF16, y el router tiene un sesgo específico para tokens de imagen (`gate.bias_vl`), lo que indica soporte multimodal de entrada.
- Razonamiento multi-paso y modo "thinking": no confirmado explícitamente en la información disponible.
- Tool calling y function calling: no disponible en la documentación.
- Capacidades de agente: no disponible en la documentación.
- Decodificación especulativa mediante el drafter MTP/DSpark incluido en el checkpoint (`mtp.0-2`).
- Recuperación n-gram a través de las tablas Engram de las capas 1 y 14, que se consultan sin cuantizar.
- Capacidades multilingües: no disponible; el repositorio no declara idiomas.
- Capacidad de código: la evaluación de perplejidad incluye un conjunto específico de código (1,8895 en esta cuantización), lo que sugiere presencia de ese dominio en el modelo base, sin que se documenten benchmarks funcionales.

## Casos de uso

- Serving de un MoE de ~128,7 B en dos nodos DGX Spark: el caso de uso documentado por el autor, con TP=2 mediante el kit basado en vLLM; adecuado para laboratorios que ya dispongan de ese hardware y quieran evitar GPUs de 80 GB en número elevado.
- Investigación sobre cuantización extrema: la pareja de checkpoints a 2,9 y 3,5 bpw permite estudiar la curva de degradación de perplejidad (+1,84 % en código a 2,9 bpw frente a +0,8 % a 3,5 bpw) con dos puntos de medida sobre el mismo modelo base.
- Evaluación comparativa de atención eficiente: la presencia de compresor de KV e indexador disperso permite medir el impacto de estos mecanismos en tareas de contexto largo, aunque la longitud de contexto no esté declarada.
- Prototipado multimodal interno: al incluir la torre de visión en BF16, el checkpoint puede usarse para experimentar con entrada de imagen sin necesidad de un segundo modelo, siempre que el stack de serving lo soporte.
- Generación asistida con decodificación especulativa: el drafter MTP/DSpark incluido permite medir la ganancia de throughput de la decodificación especulativa frente a la generación estándar en el mismo hardware.
- Reproducción de experimentos con modelos de pesos abiertos: al ser MIT y publicar hashes sha256 de los shards requeridos del base, el setup es auditable y replicable en entornos de investigación que exigen trazabilidad de los artefactos.
- Fine-tuning o destilado posterior sobre el base: no se recomienda usar este checkpoint cuantizado como punto de partida; para entrenamiento habría que recurrir al modelo `deepseek-ai/DeepSeek-V4.1-Flash-1017` original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor únicamente reporta perplejidad sobre dos conjuntos de texto no publicados, con 32 secuencias de 2.048 tokens cada uno y 65.504 tokens puntuados por conjunto, usando el mismo forward de secuencia completa en todas las filas:

| Modelo | Tamaño | Perplejidad código | Perplejidad prosa |
|---|---|---|---|
| Sin cuantizar (base FP8 / MXFP4, de-cuantizado) | no disponible | 1,8749 | 6,4277 |
| EXL3 2,9 bpw | 196,3 GiB | 1,9094 | 6,4520 |
| EXL3 3,5 bpw (este repo) | 239,9 GiB | 1,8895 | 6,4341 |
| Este repo con Engram desactivado (control) | 239,9 GiB | 4,1548 | 8,9702 |

La última fila es un control de sanidad del autor: desactivar las tablas Engram degrada la perplejidad de forma drástica (de 1,8895 a 4,1548 en código), lo que confirma que esas tablas son imprescindibles para el funcionamiento correcto del checkpoint.

## Requisitos de hardware

- VRAM estimada para el trunk: 239,9 GiB (257,6 GB) solo para los pesos cuantizados de este repositorio.
- Memoria adicional obligatoria: las dos tablas Engram se usan sin cuantizar, ~95 GiB cada una, es decir, ~190 GiB extra. El footprint conjunto estimado ronda los 430 GiB, sin contar caché KV ni activaciones.
- GPU recomendadas: el autor apunta al kit MiaAI-Lab/DeepSeek-v4.1-Flash-EXL3-2x-DGX-Sparks con 2x DGX Spark y TP=2. Para el base sin cuantizar no hay recomendación documentada en la información disponible.
- GPU de consumo: no cabe. Ni siquiera el trunk de 239,9 GiB entra en una RTX 4090 (24 GB), A100 80 GB o H100 80 GB individual; haría falta un pool agregado de al menos ~240 GiB solo para el trunk.
- Opciones de despliegue: vLLM a través del kit de MiaAI-Lab, que requiere el `exl3_k_map.json` incluido en este repo. exllamav3 upstream no puede cargar el checkpoint directamente porque no tiene clase `DeepseekV41`. Soporte en llama.cpp, Ollama o TGI: no disponible.
- Latencia y throughput: no disponible; el autor no publica métricas de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tamaño en disco | Perplejidad código / prosa | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| DeepSeek-V4.1-Flash-1017 EXL3 3,5 bpw (este repo) | ~128,7 B (trunk) | no disponible | 257,6 GB (239,9 GiB) + ~190 GiB Engram | 1,8895 / 6,4341 | MIT | público en HF, 0 descargas |
| DeepSeek-V4.1-Flash-1017 EXL3 2,9 bpw | no disponible | no disponible | 196,3 GiB + ~190 GiB Engram | 1,9094 / 6,4520 | MIT | público en HF |
| DeepSeek-V4.1-Flash-1017 NVFP4 | no disponible | no disponible | no disponible | no disponible | MIT | público en HF |
| DeepSeek-V4.1-Flash-1017 (base FP8 / MXFP4) | ~128,7 B (trunk) | no disponible | no disponible | 1,8749 / 6,4277 (de-cuantizado) | MIT | público en HF |

El compromiso entre las dos cuantizaciones EXL3 es claro: bajar de 3,5 a 2,9 bpw ahorra 43,6 GiB de disco y memoria a cambio de duplicar aproximadamente la degradación en código (+1,84 % frente a +0,8 %). Para prosa la diferencia es marginal (+0,38 % frente a +0,1 %).

## Limitaciones y advertencias

- Checkpoint incompleto por sí solo: las tablas Engram no están en el repositorio y hay que descargar los shards 47 y 48 del modelo base 1017. Reutilizar los de `DeepSeek-V4.1-Flash` produce resultados incorrectos porque las tablas cambiaron en esta release.
- Dependencia de un stack no estándar: exllamav3 upstream carece de clase `DeepseekV41`, de modo que el checkpoint solo es funcional con el kit basado en vLLM de MiaAI-Lab y su mapa de K (`exl3_k_map.json`).
- Sesgos conocidos: no disponible; no hay documentación sobre sesgos en la información proporcionada.
- Riesgo de alucinación: no disponible; no se han publicado evaluaciones de fidelidad ni de alineamiento para este checkpoint.
- Idiomas: el repositorio no declara idiomas soportados, por lo que el rendimiento fuera de los idiomas del modelo base es desconocido.
- Longitud de contexto: no declarada; los mecanismos de compresor de KV e indexador disperso sugieren contexto largo en el base, pero no hay cifra confirmada.
- Evaluación limitada: solo perplejidad sobre dos conjuntos de texto no publicados, con 65.504 tokens por conjunto. No hay MMLU, HumanEval, GSM8K ni evaluaciones de visión, y los datos no son reproducibles al no publicarse los conjuntos.
- Métricas de serving ausentes: sin latencia, throughput ni consumo de memoria medidos bajo carga.
- Licencia: MIT permite uso comercial, pero al derivar del modelo base conviene verificar los términos del repositorio `deepseek-ai/DeepSeek-V4.1-Flash-1017` y de las tablas Engram descargadas por separado.
- Madurez: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y una única actualización el mismo día de su creación; es una publicación comunitaria sin validación externa.
- Uso en producción: la combinación de tres artefactos separados (trunk cuantizado, tablas Engram del base, mapa de K) añade puntos de fallo en el despliegue y complica las actualizaciones.

## Enlaces

- Repositorio HuggingFace de esta cuantización: https://huggingface.co/LibertAIDAI/DeepSeek-V4.1-Flash-1017-EXL3-3.5bpw
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Cuantización hermana 2,9 bpw: https://huggingface.co/LibertAIDAI/DeepSeek-V4.1-Flash-1017-EXL3-2.9bpw
- Cuantización NVFP4: https://huggingface.co/LibertAIDAI/DeepSeek-V4.1-Flash-1017-NVFP4
- Layout de referencia EXL3 2,9 bpw: https://huggingface.co/Mia-AiLab/DeepSeek-V4.1-Flash-EXL3-2.9bpw
- Kit de serving para 2x DGX Spark: https://github.com/MiaAI-Lab/DeepSeek-v4.1-Flash-EXL3-2x-DGX-Sparks
