# 1bit-MONSTER/Inkling-2-Mini-NVFP4-attention

## Resumen

Inkling-2-Mini-NVFP4-attention es un fichero de datos derivado del modelo Inkling-2-Mini de Thinking Machines, publicado por el usuario 1bit-MONSTER. No se trata de un modelo autonomo, sino de una re-cuantizacion de 145 tensores BF16 del checkpoint original (proyecciones de atencion `wq_du`, `wk_dv`, `wv_dv`, `wr_du`, `gate_attn`, `wo_ud` de las 24 capas, mas la cabeza de salida `unembed`) al formato NVFP4. El modelo base es un MoE con bucles ("looped MoE") de 26 000 millones de parametros publicado bajo licencia Apache-2.0.

El proposito de este repositorio es servir como variante opcional de velocidad ("opt-in speed variant") dentro del motor de inferencia propio de 1bit-MONSTER, llamado Loom, orientado a GPUs AMD HRX (Strix Halo, gfx1151). Al reducir la precision de la atencion y de la cabeza de salida a NVFP4 se obtiene un incremento de velocidad de decodificacion del 14 al 20 % a cambio de un deterioro medible en calidad: la divergencia KL media frente a una referencia bf16 pasa de 0,004583 a 0,018259 (4x peor) y la coincidencia del token top-1 baja del 97,99 % al 95,07 %.

Es relevante ahora por dos motivos. Primero, documenta con numeros concretos el compromiso precision/velocidad de NVFP4 aplicado a atencion en hardware consumer AMD, un terreno poco cubierto frente al ecosistema NVIDIA. Segundo, forma parte de una familia de cinco repositorios que muestran el proceso completo de portar y cuantizar un MoE de 26 B a un motor de inferencia alternativo, con trazabilidad criptografica de cada tensor convertido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE con bucles (looped MoE); este repo contiene solo tensores de atencion y cabeza de salida en NVFP4 |
| Parametros totales | 622 835 776 (tamano del fichero de este repo); modelo base: 26 B |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (el modelo base se evalua a 0,7k y 5,6k tokens en las mediciones del autor) |
| Tipos de cuantizacion | NVFP4 (E2M1 con escalas UE4M3 por bloques de 16 valores y escala global f32) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (`Inkling-2-Mini-nvfp4-attention.gguf`, 622 844 480 bytes) con blobs int8 nombrados `nvfp4.<tensor>` |

## Arquitectura y entrenamiento

El modelo base Inkling-2-Mini es un MoE con bucles de 26 000 millones de parametros desarrollado por Thinking Machines. Este repositorio no contiene el modelo completo: es un fichero de datos que re-cuantiza 145 tensores BF16 del checkpoint original en la revision `b85c3cfa615fc413cc9af3379f491b963f3b586a` (`model-00001-of-00001.safetensors`). Los tensores afectados son las proyecciones de atencion de las 24 capas y la cabeza de salida `unembed`. El resto de pesos del modelo (expertos enrutados, embeddings, normalizaciones) no se incluyen aqui y provienen de otros repositorios de la familia.

El formato de cuantizacion es NVFP4: cada tensor se almacena como un blob con cabecera de 64 bytes (escala global f32, filas u32, columnas u32, magic `VPF4`) seguida de las filas en el layout `block_nvfp4` de ggml, con 64 valores por cada 36 bytes (cuatro escalas UE4M3 y 32 bytes de codigos E2M1). Un valor se decodifica como `2·E2M1[code] · UE4M3(scale)·0.5 · global`, donde la escala global es `amax/(6·448)` y cada escala de 16 valores se elige como la mejor de tres representables UE4M3 por error cuadratico. El fichero incluye `provenance.jsonl` con el nombre, dtype, forma y sha256 del tensor original y el sha256 del blob convertido para cada uno de los 145 tensores. No se describe entrenamiento adicional ni ajuste fino: es una conversion pura de pesos.

## Capacidades

- Generacion de texto y razonamiento heredados del modelo base Inkling-2-Mini (no verificables directamente en este fichero, que solo contiene pesos de atencion y cabeza de salida).
- No es un modelo utilizable de forma autonoma: el autor indica explicitamente "Not used on its own".
- Pensado para integrarse en la variante de velocidad del motor Loom, que combina estos tensores NVFP4 con el resto de pesos del modelo base.
- El modelo base es un MoE con bucles; no se documentan en esta ficha capacidades de tool calling, agentes, vision ni audio.
- Capacidades multilingues: no disponibles.

## Casos de uso

- Aceleracion de inferencia en GPUs AMD Strix Halo (gfx1151): este fichero permite activar en el motor Loom una variante de velocidad que sube la decodificacion de 57,2 a 65,8 tok/s a 0,7k de contexto y de 52,5 a 63,1 tok/s a 5,6k, a costa de 4x mas divergencia KL. Adecuado cuando prima el throughput sobre la fidelidad exacta.
- Despliegue local en hardware consumer AMD: al reducir el peso de los tensores de atencion a NVFP4 (622 MB en total), libera ancho de banda de memoria en un equipo con GPU integrada, escenario en el que el cuello de botella suele ser el ancho de banda.
- Experimentacion con cuantizacion NVFP4: sirve como referencia reproducible para medir el impacto de cuantizar atencion y cabeza de salida en un MoE, con KLD, top-1 y perplejidad ya calculados frente a una referencia bf16.
- Investigacion en motores de inferencia alternativos: util para quienes trabajan en Loom o en kernels NVFP4 y quieren un caso de estudio con trazabilidad de cada tensor (sha256 en `provenance.jsonl`).
- Generacion de texto interactiva de baja latencia en local: la mejora del 14-20 % en decodificacion reduce el tiempo por token en asistentes conversacionales desplegados en Strix Halo, aceptando una pequena perdida de calidad (ratio de perplejidad 1,011).
- Evaluacion comparativa de variantes de cuantizacion: junto con `Inkling-2-Mini-NVFP4-MXFP8-loom` y `Inkling-2-Mini-GGUF-quants`, permite al investigador contrastar precisiones y formatos bajo el mismo motor.

## Benchmarks y rendimiento

Datos publicados por el autor en la model card, medidos en AMD Ryzen AI Max+ 395 (gfx1151), comparando la tarjeta por defecto del motor Loom con esta variante de velocidad:

| Metrica | Tarjeta por defecto | Variante de velocidad (este fichero) |
|---|---|---|
| KLD media vs referencia bf16 HF (4 080 posiciones) | 0,004583 | 0,018259 (4x) |
| Coincidencia token top-1 | 97,99 % | 95,07 % |
| Ratio de perplejidad | 0,999 | 1,011 |
| Decodificacion tok/s a 0,7k contexto | 57,2 | 65,8 (+14 %) |
| Decodificacion tok/s a 5,6k contexto | 52,5 | 63,1 (+20 %) |
| Prefill tok/s con prompt de 5,6k | 2 067 | 1 998 (−3,9 %) |

No se han publicado en la informacion disponible resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) para este fichero ni para el modelo base.

## Requisitos de hardware

- VRAM estimada: este fichero ocupa 0,6 GB; el modelo base completo de 26 B requiere mucha mas memoria, no cuantificada en la informacion disponible.
- GPU objetivo: AMD Ryzen AI Max+ 395 (gfx1151, Strix Halo) con kernels NVFP4 nativos del motor HRX/Loom.
- No se documenta compatibilidad con GPUs NVIDIA (A100, H100, RTX 4090) ni con consumer NVIDIA en esta ficha.
- Opciones de despliegue: motor Loom de 1bit-MONSTER (version 0.3.0 medida); los GGUF planos de la familia estan pensados para uso estilo llama.cpp, aunque el autor senala que la colocacion para esta arquitectura en HRX aun no esta completa (engine#3491).
- Latencia y throughput: 65,8 tok/s de decodificacion a 0,7k de contexto y 63,1 tok/s a 5,6k; prefill de 1 998 tok/s con prompt de 5,6k, todo en Strix Halo.

## Comparativa con modelos similares

| Repositorio | Contenido | Uso | KLD media | Top-1 | Decode tok/s (0,7k / 5,6k) |
|---|---|---|---|---|---|
| Inkling-2-Mini-NVFP4-MXFP8-loom | Tarjeta Loom por defecto; expertos como los publico Thinking Machines (NVFP4 y MXFP8 en capas 20-23) sobre GGUF UD-Q4_K_XL con drafter DSpark | Punto de partida recomendado | 0,004583 | 97,99 % | 90,7-91,1 |
| Inkling-2-Mini-loom | Misma tarjeta sin kernels nativos (capas 20-23 desde Q8_0 del GGUF) | Alternativa sin kernels nativos | 0,004571 | no disponible | igual que la por defecto |
| Inkling-2-Mini-GGUF-quants | GGUF planos (Q8_0, Q5_K, Q4_K_M, mixto) con KLD por variante | Uso estilo llama.cpp | no disponible | no disponible | no disponible |
| Inkling-2-Mini-NVFP4-attention (este repo) | Solo atencion y cabeza de salida en NVFP4 | Variante de velocidad opt-in, no autonomo | 0,018259 | 95,07 % | 65,8 / 63,1 |

No se dispone de comparacion con modelos de otros autores de tamano o tarea equivalente en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo autonomo: contiene solo 145 tensores de atencion y la cabeza de salida; necesita el resto de pesos del modelo base para funcionar.
- Peor calidad que la tarjeta por defecto: KLD 4x mayor (0,018259 frente a 0,004583) y top-1 del 95,07 % frente al 97,99 %. El autor advierte explicitamente "It trades accuracy for speed. Read the numbers before using it".
- Ligera degradacion en prefill (−3,9 %) aunque mejore la decodificacion.
- Dependencia de hardware: disenado para GPUs AMD HRX (Strix Halo) con kernels NVFP4 nativos; no se documenta soporte en otras plataformas.
- El autor senala que la colocacion de esta arquitectura en HRX para los GGUF planos aun no esta completa (engine#3491), lo que puede afectar a despliegues fuera de la ruta Loom.
- Riesgo de alucinacion y sesgos del modelo base: no documentados en esta ficha.
- Licencia Apache-2.0, pero el uso del modelo esta sujeto ademas a la Model Acceptable Use Policy de Thinking Machines.
- El port Loom subyacente se basa en la tarjeta loom-fun de Jeremy Fowers y Daniel Holanda (MIT); conviene respetar ambas atribuciones.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/1bit-MONSTER/Inkling-2-Mini-NVFP4-attention
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Tarjeta Loom por defecto: https://huggingface.co/1bit-MONSTER/Inkling-2-Mini-NVFP4-MXFP8-loom
- Tarjeta Loom sin kernels nativos: https://huggingface.co/1bit-MONSTER/Inkling-2-Mini-loom
- GGUF planos: https://huggingface.co/1bit-MONSTER/Inkling-2-Mini-GGUF-quants
- Expertos MXFP8 de capas 20-23: https://huggingface.co/1bit-MONSTER/Inkling-2-Mini-MXFP8-experts
- Familia 1bit-MONSTER: https://huggingface.co/1bit-MONSTER#families
- Detalles de la cuantizacion (issue): https://github.com/1bit-MONSTER/engine/issues/3333
- Mediciones de la tarjeta por defecto: https://github.com/1bit-MONSTER/engine/issues/3158#issuecomment-7216723223
- Limitacion de colocacion en HRX: https://github.com/1bit-MONSTER/engine/issues/3491
- Politica de uso aceptable: https://thinkingmachines.ai/model-acceptable-use-policy/
- Tarjeta loom-fun (base del port): https://huggingface.co/loom-fun
