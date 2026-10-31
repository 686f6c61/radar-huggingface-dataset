# Aijuus/flint-w4exp

## Resumen

Flint-w4exp es una cuantización de los expertos enrutados a cuatro bits del modelo base [RecursiveSI/flint](https://huggingface.co/RecursiveSI/flint), empaquetada en un único contenedor `.rad` para el motor de inferencia [radiance](https://github.com/stilldeadcode/radiance), publicado por el usuario Aijuus. El objetivo del artefacto es hacer que un modelo MoE de 39,7 mil millones de parámetros quepa íntegramente en una sola GPU, en particular tarjetas AMD RDNA4, cuantizando solo los expertos enrutados (37,8 B de los 39,7 B) a int4 y dejando el resto de pesos en bf16.

El problema que resuelve es el clásico de los MoE grandes: aunque solo se activan 6 expertos por token, el volumen total de pesos impide desplegarlos en hardware de una tarjeta. Con los expertos a int4 (códigos `i4`, escala bf16 por grupo de 128 y rotación Hadamard de 128 anchos), el contenedor completo ocupa 21,79 GiB, lo que permite servirlo con una única Radeon AI PRO R9700 manteniendo una correlación de 0,76–0,82 con la salida del checkpoint de referencia.

El modelo base es una arquitectura híbrida de 49 capas con 256 expertos enrutados (top-6) más un experto compartido no enrutado, atención GQA con 8 cabezas, una mezcla de capas deslizantes (ventana 513) y capas de atención completa, y un contexto entrenado de 262.144 tokens. Es relevante ahora porque demuestra una estrategia de cuantización selectiva (expertos int4, lineales bf16) que evita el colapso del modelo que se produce al cuantizar también las capas densas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `flint` (`FlintForCausalLM`), MoE híbrido con capas sliding-window y full-attention |
| Parametros totales | 39,7 B (37,8 B en expertos enrutados) |
| Parametros activos | Top-6 de 256 expertos enrutados + 1 experto compartido no enrutado (cifra exacta de parámetros activos no disponible) |
| Longitud de contexto | 262.144 tokens (entrenado) |
| Tipos de cuantizacion | Expertos enrutados int4 (códigos `i4`, grupo 128, escala bf16, rotación Hadamard `fwht128`); resto de pesos bf16; KV cache bf16 u fp8 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | Contenedor `.rad` (RAD2), `flint-w4exp.rad`, 21,79 GiB |

## Arquitectura y entrenamiento

La arquitectura `flint` consta de 49 capas con un total de 39,7 B de parámetros, de los cuales 37,8 B corresponden a 256 expertos enrutados seleccionados top-6 por token, más un experto compartido no enrutado (ungated). La atención usa GQA con 8 cabezas de consulta a `head_dim` 128. De las 49 capas, 35 son de atención deslizante con ventana de 513 tokens y 14 son de atención completa sin RoPE, con un "sink" aprendido por cabeza en el softmax de cada capa. Esta mezcla reduce drásticamente el tamaño de la KV cache: 28 KiB por token en bf16, porque solo 14 capas (4 cabezas KV cada una) almacenan caché completa.

Sobre el entrenamiento del modelo base (número de tokens, composición del dataset, RLHF/DPO) no hay datos disponibles en la model card. La innovación principal de este artefacto está en la cuantización: los expertos enrutados se llevan a int4 con rotación Hadamard de 128 anchos (`fwht128`) y escala bf16 por grupo de 128, con un error relativo de Frobenius del 11,7 % por plano de experto. Los autores documentan que cuantizar también las lineales densas y el experto compartido a int4 colapsa el modelo a una distribución uniforme, y localizan el colapso específicamente en el experto compartido; por eso las lineales y el experto compartido se mantienen en bf16 (~1,8 GiB adicionales), un coste pequeño que preserva la calidad. El motor radiance soporta además decodificación especulativa por prompt-lookup (`--num-speculative-tokens 3`), aunque este contenedor no incluye cabeza de draft propia.

## Capacidades

- Generación de texto (pipeline `text-generation`), como modelo base sin afinar instruccionalmente.
- Contexto largo: 262.144 tokens entrenados, con capas deslizantes que abaratan la atención en secuencias extensas.
- Arquitectura MoE con enrutamiento top-6 sobre 256 expertos, que permite alto throughput agregado en batching.
- Decodificación especulativa vía prompt-lookup integrada en el motor radiance (sin draft head propia).
- KV cache en fp8 opcional, que reduce a la mitad la memoria de caché.
- Soporte de tool calling, capacidades de razonamiento y capacidades multilingües: no disponible en la información proporcionada (el modelo base es un checkpoint base, no instruccional).

## Casos de uso

- Servir un MoE de 39,7 B en una sola GPU AMD RDNA4: el contenedor de 21,79 GiB cabe íntegro en una Radeon AI PRO R9700, ideal para despliegues on-premise de una tarjeta sin necesidad de tensor parallelism.
- Chatbots y asistentes multi-turno con contexto largo: los 262.144 tokens de contexto y la KV cache ligera (28 KiB/token) permiten mantener conversaciones muy extensas; ocho sesiones de 32.768 tokens caben junto a los pesos.
- Procesamiento de documentos extensos: el prefill se mantiene en torno a 8,4–9,8k tok/s hasta prompts de ~23.000 tokens, adecuado para resumir o indexar documentos largos en lote.
- Servicios con múltiples usuarios concurrentes: el throughput agregado escala de 86 tok/s (1 usuario) a 309,5 tok/s (8 usuarios) con batching continuo en radiance.
- Experimentación con cuantización MoE: la model card documenta con detalle qué componentes colapsan al cuantizar (el experto compartido) y cuáles toleran int4, lo que lo hace útil como referencia para técnicas de cuantización selectiva.
- Integración en pipelines de inferencia autoalojados con radiance: la receta `flint-w4exp.recipe` incluida permite reproducir la conversión desde el checkpoint bf16 con `rad-convert`.

## Benchmarks y rendimiento

Medidas del propio contenedor en una Radeon AI PRO R9700 (gfx1201, RDNA4) con radiance (`--tp 1 --max-num-seqs 8 --max-model-len 32768 --max-num-batched-tokens 2048 --num-speculative-tokens 3`), 48 peticiones por nivel, temperature 1.0, thinking budget 512:

| Metrica | Valor |
|---|---|
| Decode agregado, 1 usuario | 86,2 tok/s |
| Decode agregado, 2 usuarios | 151,1 tok/s |
| Decode agregado, 4 usuarios | 221,5 tok/s |
| Decode agregado, 8 usuarios | 309,5 tok/s |
| Decode por petición, 1 usuario | 87,3 tok/s (mediana 87,2) |
| Prefill a 1,5k prompt | 9,6k tok/s |
| Prefill a 5,8k prompt | 9,8k tok/s |
| Prefill a 11,7k prompt | 9,5k tok/s |
| Prefill a 23,3k prompt | 8,4k tok/s |
| Correlación de filas de decode con la referencia | 0,76–0,82 |
| Logprob de " Paris" en "The capital of France is" | −0,41 (referencia: −0,84), argmax correcto |

Advertencias de la model card: no hay medición A/B de especulación en este contenedor (las cifras de +17,5 % que circulan corresponden a `flint-w4exp-w4lin`), y la calidad de la KV cache fp8 (KL media 0,105, top-1 0,850) también fue medida en `flint-w4exp-w4lin`, no en este artefacto. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- Pesos: 21,79 GiB (expertos int4 ~18,2 GiB + lineales y experto compartido bf16 ~1,8 GiB), lo que exige una GPU con al menos 24 GB de VRAM.
- KV cache bf16: 28 KiB/token; 7,44 GiB para 262k tokens, 3,72 GiB con fp8. Ocho sesiones de 32.768 tokens ocupan 7,2 GiB y caben junto a los pesos; ocho de 65.536 no (14 GiB de KV).
- GPU de referencia: Radeon AI PRO R9700 (gfx1201, RDNA4), medida con radiance a `--tp 1`.
- Cabe en una única GPU de gama alta; compatibilidad con GPUs NVIDIA o consumer (RTX 4090) no está documentada, aunque los 24 GB de la RTX 4090/3090 serían teóricamente suficientes para los pesos con contexto reducido (no verificado).
- Despliegue: motor radiance (vía `rad-convert` con la receta incluida); soporte en llama.cpp, Ollama, vLLM o TGI: no disponible.
- Latencia y throughput: 87,3 tok/s por petición en decode mono-usuario; prefill de 8,4–9,8k tok/s según longitud de prompt.

## Comparativa con modelos similares

| | Flint-w4exp (este artefacto) | Flint-w4exp-w4lin | Flint bf16 (base) |
|---|---|---|---|
| Parámetros totales | 39,7 B | 39,7 B | 39,7 B |
| Cuantización | Expertos int4, resto bf16 | Expertos y lineales int4 | bf16 |
| Tamaño | 21,79 GiB | no disponible | no disponible |
| Contexto | 262.144 | 262.144 | 262.144 |
| Rendimiento mono-usuario | 87,3 tok/s | 107,5 tok/s (127,0 con especulación) | no disponible |
| Calidad | correlación 0,76–0,82 con referencia; argmax correcto en prueba de sondeo | KL fp8 cache publicada; primer token " not" en prueba de sondeo | referencia |
| Licencia | Apache-2.0 | Apache-2.0 | Apache-2.0 |

No se conocen otros modelos comparables de la misma categoría con datos publicados suficientes; no disponible.

## Limitaciones y advertencias

- Es un modelo base (finetune del base `RecursiveSI/flint`), no instruccional: no está claro que siga formatos de chat ni soporte tool calling sin afinado adicional.
- El error de cuantización int4 (11,7 % de Frobenius por plano de experto) reordena ocasionalmente tokens de máxima probabilidad respecto a la referencia (p. ej., " not" frente a " Paris" en la prueba de sondeo); la capa 46 amplifica cien veces el error residual de los expertos.
- Cuantizar el experto compartido a int4 colapsa el modelo a una distribución uniforme; cualquier recuantización debe preservar bf16 en lineales y experto compartido.
- La calidad de la KV cache fp8 no ha sido medida para este contenedor; los datos publicados corresponden a otra variante y no deben citarse aquí.
- Las cifras de especulación (+17,5 %) corresponden a `flint-w4exp-w4lin`, no a este artefacto.
- Sesgos, riesgo de alucinación y idiomas soportados: no disponible en la información proporcionada.
- Restricción práctica de memoria: con los pesos ocupando 21,79 GiB, el contexto máximo de 262.144 tokens solo es alcanzable con `--max-num-seqs 1` y ocupa toda la tarjeta.
- Dependencia del ecosistema radiance y hardware AMD RDNA4; portabilidad a otros motores y GPUs sin documentar.

## Enlaces

- Modelo: https://huggingface.co/Aijuus/flint-w4exp
- Modelo base: https://huggingface.co/RecursiveSI/flint
- Motor radiance: https://github.com/stilldeadcode/radiance
- Resultados brutos de benchmark: incluidos en el repositorio en `benchmarks/betterbench-results.json` (sin URL pública adicional disponible)
