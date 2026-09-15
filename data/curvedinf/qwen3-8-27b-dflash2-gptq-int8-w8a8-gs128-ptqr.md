# curvedinf/Qwen3.8-27B-DFlash2-GPTQ-INT8-W8A8-GS128-PTQR

## Resumen

Este repositorio contiene un modelo borrador (draft model) de decodificacion especulativa, no un modelo de lenguaje autonomo. Se trata de una cuantizacion INT8 GPTQ del drafter DFlash 2 (`z-lab/Qwen3.8-27B-DFlash2`), el modelo auxiliar de cinco capas basado en block diffusion disenado para acompanar al modelo objetivo `Qwen/Qwen3.8-27B`. El autor, `curvedinf`, lo publica como companion del checkpoint objetivo `curvedinf/Qwen3.8-27B-GPTQ-INT8-W8A8-GS128-PTQR`, y solo tiene sentido ejecutarlo junto a ese modelo dentro de un servidor de decodificacion especulativa.

La innovacion principal es el proceso PTQR (post-training quantization with rounding-dither retraining): en lugar de cuantizar una sola vez, se afina un estudiante cuyo forward replica exactamente los kernels INT8 de servicio (rejilla de pesos G128, cuantizacion dinamica de activaciones por token, cache KV INT8) destilado contra un profesor BF16 congelado, aplicando dither geometricamente anillado sobre cada decision de redondeo. El resultado se reempaqueta en el mismo envoltorio GPTQ GS128, de modo que el checkpoint es identico en formato y configuracion al original de un solo paso.

Con 1.924.404.480 parametros en formato safetensors y un repositorio de 2,3 GB, el interes actual de esta ficha es acotado pero tecnico: documenta una ruta de servicio INT8 completa sobre AMD/ROCm para acelerar un modelo grande mediante decodificacion especulativa, con una puerta de fidelidad que afirma cero perdida adicional de aceptacion frente al drafter BF16.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Draft model de block diffusion (DFlash 2) de 5 capas, con estado fp32 Mamba/GDN, cuantizado a INT8; actua como companion especulativo del modelo objetivo Qwen3.8-27B |
| Parametros totales | 1.924.404.480 (~1,92 mil millones), segun los pesos safetensors del repositorio |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en la model card; el test de fidelidad reportado se ejecuto con 42k de contexto |
| Tipos de cuantizacion | GPTQ INT8, modo de servicio W8A8, grupo de 128 (GS128), simetrico, `desc_act = false`; 35 matrices empaquetadas |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (matrices GPTQ empaquetadas con escalas y tensores `g_idx`); libreria `transformers` |
| Capas del draft | 5 |
| Matrices cuantizadas | 35 |
| Tokens especulativos | 13 (`num_speculative_tokens: 13` en la configuracion de servicio) |
| Tamano del repositorio | 2,3 GB |
| Modelo base | `z-lab/Qwen3.8-27B-DFlash2` |
| Modelo objetivo asociado | `curvedinf/Qwen3.8-27B-GPTQ-INT8-W8A8-GS128-PTQR` |
| Inferencia estandar | `inference: false`; no funciona como modelo autonomo en el pipeline de `transformers` |

## Arquitectura y entrenamiento

El modelo es un drafter de cinco capas que genera tokens candidatos mediante block diffusion: propone bloques de tokens que el modelo objetivo verifica despues. Al ser verificados por el objetivo, la decodificacion especulativa preserva la distribucion de salida del modelo grande, de modo que este checkpoint no altera la calidad final de la generacion, solo su coste por token. La configuracion de servicio emplea estado Mamba/GDN en fp32 (`--mamba-ssm-cache-dtype float32`, `VLLM_GFX908_INT8_LM_HEAD=1`), lo que indica que la pila objetivo es un modelo hibrido con capas de estado recurrente ademas de atencion.

El entrenamiento descrito es el procedimiento PTQR: se parte de la rejilla GPTQ GS128 de GPTQModel 7.3.4 y se afina el estudiante bajo la cuantizacion desplegada, con un forward que replica los kernels exactos de servicio (rejilla de pesos G128, cuantizacion dinamica de activaciones por token e cache KV INT8). El dither geometricamente anillado hace que las primeras fases exploren puntos vecinos de la rejilla y las finales sean identicas bit a bit al servicio. Los pesos reentrenados se recuantizan y exportan por el mismo envoltorio GPTQ. Se verifico que las 35 matrices empaquetadas usan grupos contiguos de exactamente 128 pesos, contrastando escalas y `g_idx`. La puerta de fidelidad reportada indica un top-1 mismatch de 0,042 sobre 120 sondas, identico al del drafter BF16, y una aceptacion de 3,83/13 frente a 3,88/13 del BF16 a 42k de contexto.

## Capacidades

- Generacion de tokens candidatos para decodificacion especulativa: no genera texto por si mismo de forma autonoma, propone bloques que el modelo objetivo verifica.
- Block diffusion draft: genera candidatos por bloques en lugar de token a token, con 13 tokens especulativos configurados.
- Ejecucion en W8A8 con kernels AITER INT8 GEMM para cualquier valor de M y atencion unificada AITER.
- Cache KV en INT8 con bloques de 128 (`int8_block_g128`), tanto en el objetivo como en el drafter.
- Compatibilidad con tensor parallelism de 4 vias y hasta 8 secuencias concurrentes en el contrato de servicio documentado.
- Estado Mamba/GDN en fp32 para preservar la precision de las capas recurrentes del objetivo.
- No se documentan capacidades de tool calling, agentes, vision, audio ni thinking mode; esas capacidades, en su caso, corresponderian al modelo objetivo, no a este drafter.
- No se documenta soporte multilingue.

## Casos de uso

- Aceleracion de inferencia del objetivo Qwen3.8-27B en AMD/ROCm: desplegar el objetivo `Qwen3.8-27B-GPTQ-INT8-W8A8-GS128-PTQR` con este drafter permite verificar 13 tokens candidatos por paso y aceptar en torno a 3,83 de cada 13 en contexto de 42k, reduciendo el numero de forwards del modelo grande.
- Servicio de chat multi-turno con contexto largo: el par objetivo+drafter funciona con cache KV INT8 en grupos de 128 y estado Mamba/GDN fp32, adecuado para conversaciones sostenidas en las que la latencia por token domina la experiencia.
- Generacion de codigo interactiva (autocompletado, asistentes de IDE): la reduccion de pasos de decodificacion del objetivo baja la latencia percibida, sin cambiar la distribucion de salida gracias a la verificacion del modelo grande.
- Agentes y razonamiento multi-paso: en pipelines donde cada paso implica una llamada al modelo, la mejora de throughput por token se acumula a lo largo de decenas de iteraciones de planificacion y llamada a herramientas.
- Batch offline de generacion: con `--max-num-seqs 8` y TP4, sirve lotes moderados en clústeres AMD, util para generacion de datos sinteticos o evaluaciones masivas.
- Investigacion en decodificacion especulativa: sirve como caso de estudio reproducible de entrenamiento PTQR bajo cuantizacion, con metricas de mismatch top-1 y aceptacion comparadas contra el drafter BF16.
- Validacion de stacks INT8 sobre ROCm: util para equipos que evaluan el fork `curvedinf/int8-vllm`, kernels AITER y el esquema de cuantizacion GS128 antes de desplegar el objetivo completo en produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible; al tratarse de un drafter, esos benchmarks no aplican directamente. La model card si publica metricas de fidelidad y aceptacion:

| Metrica | Drafter INT8 PTQR (este) | Drafter BF16 (referencia) |
|---|---|---|
| Top-1 mismatch (120 sondas) | 0,042 | 0,042 |
| Aceptacion de decodificacion especulativa a 42k de contexto | 3,83/13 | 3,88/13 |

La model card afirma que la perdida adicional por cuantizacion es nula en mismatch top-1 y que la aceptacion no cambia de forma relevante respecto al drafter BF16.

## Requisitos de hardware

- VRAM estimada: los pesos INT8 ocupan aproximadamente 1,9 GB, mas escalas, tensores `g_idx` y estructuras auxiliares; el repositorio completo son 2,3 GB. En servicio, el drafter anade del orden de 2 a 2,5 GB por replica, ademas del modelo objetivo y de la cache KV INT8. Estas cifras son una estimacion a partir del tamano del repositorio; la model card no publica un desglose de VRAM.
- GPU: el contrato de servicio documentado usa `--tensor-parallel-size 4`, kernels AITER y variables especificas `VLLM_GFX908_*`, lo que apunta a GPUs AMD con ROCm (arquitectura GFX908). La model card no especifica el modelo exacto de GPU probado.
- No esta pensado para GPU de consumo: requiere el fork `curvedinf/int8-vllm`, kernels AITER y un minimo de 4 GPUs para TP4. No se documenta soporte en CUDA, llama.cpp, Ollama ni TGI.
- Opciones de despliegue: unicamente vLLM modificado (`curvedinf/int8-vllm`) con la configuracion `--speculative-config '{"method": "dflash", "model": ..., "num_speculative_tokens": 13, "kv_cache_dtype": "int8_block_g128"}'`, `--dtype bfloat16`, `--kv-cache-dtype int8_block_g128`, `--mamba-ssm-cache-dtype float32` y `VLLM_DISABLED_KERNELS=TritonW8A16LinearKernel`.
- Latencia y throughput: no disponibles. Lo unico reportado es la longitud de aceptacion (3,83 de 13 tokens especulativos a 42k de contexto), que es el factor determinante de la ganancia de throughput.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|---|
| `curvedinf/Qwen3.8-27B-DFlash2-GPTQ-INT8-W8A8-GS128-PTQR` (este) | Drafter DFlash 2 INT8 con reentrenamiento PTQR | 1,92 B | probado a 42k | safetensors GPTQ INT8 | apache-2.0 | Aceptacion 3,83/13; requiere el objetivo PTQR y `int8-vllm` |
| `curvedinf/Qwen3.8-27B-DFlash2-GPTQ-INT8-W8A8-GS128` | Drafter DFlash 2 INT8 GPTQ de un solo paso | no disponible | no disponible | safetensors GPTQ INT8 | apache-2.0 | Mismo formato y configuracion, sin reentrenamiento PTQR |
| `z-lab/Qwen3.8-27B-DFlash2` | Drafter DFlash 2 en BF16 | no disponible | probado a 42k | safetensors BF16 | no disponible en la informacion | Aceptacion 3,88/13; referencia de calidad sin cuantizar |

No se dispone de datos de otros drafters de la misma categoria (por ejemplo, variantes EAGLE o Medusa) en la informacion proporcionada, por lo que no se incluye una comparacion cuantitativa con ellos.

## Limitaciones y advertencias

- No es un modelo autonomo: `inference: false` en la model card y uso restringido a servidor de decodificacion especulativa junto al objetivo `curvedinf/Qwen3.8-27B-GPTQ-INT8-W8A8-GS128-PTQR`.
- Dependencia de una pila de servicio muy concreta: el fork `curvedinf/int8-vllm`, kernels AITER, ROCm y las variables de entorno `VLLM_GFX908_*`. No es portable a vLLM estandar, CUDA, llama.cpp, Ollama ni TGI.
- Contrato de despliegue fijo: un solo contrato TP4/C8 documentado. Cambiar el grado de tensor parallelism, el numero de secuencias o los tipos de cache KV invalida las garantias descritas.
- Acoplamiento al objetivo: el drafter esta entrenado y cuantizado especificamente para ese checkpoint objetivo; mezclarlo con otro objetivo o con cuantizaciones distintas puede degradar la aceptacion sin aviso.
- Restricciones de rendimiento en contexto: la aceptacion se midio a 42k; no se documenta comportamiento a contextos mayores ni menores, ni la longitud de contexto maxima soportada.
- Sesgos y alucinacion: al ser un drafter verificado por el objetivo, la distribucion de salida final es la del modelo objetivo, por lo que los sesgos y alucinaciones dependen del objetivo y no de este checkpoint. La model card no documenta evaluaciones de sesgo.
- Idiomas: no se declaran idiomas soportados; el comportamiento multilingue dependera del modelo objetivo.
- Licencia: apache-2.0 para este checkpoint, lo que permite uso comercial, pero conviene verificar la licencia del modelo base `z-lab/Qwen3.8-27B-DFlash2` y la del objetivo antes de un despliegue en produccion.
- Madurez: 0 descargas y 0 likes en el momento de la consulta, creado y actualizado el mismo dia (15 de septiembre de 2026). No hay validacion externa independiente de las metricas declaradas.
- La busqueda web realizada no devolvio documentacion tecnica adicional relevante (los resultados obtenidos no guardaban relacion con el modelo).

## Enlaces

- Pagina de HuggingFace del modelo: https://huggingface.co/curvedinf/Qwen3.8-27B-DFlash2-GPTQ-INT8-W8A8-GS128-PTQR
- Modelo objetivo asociado: https://huggingface.co/curvedinf/Qwen3.8-27B-GPTQ-INT8-W8A8-GS128-PTQR
- Checkpoint original DFlash2 GPTQ INT8 W8A8 GS128: https://huggingface.co/curvedinf/Qwen3.8-27B-DFlash2-GPTQ-INT8-W8A8-GS128
- Modelo base del drafter: https://huggingface.co/z-lab/Qwen3.8-27B-DFlash2
- Proyecto DFlash: https://github.com/z-lab/dflash
- Pila de servicio personalizada: https://github.com/curvedinf/int8-vllm
- No se han encontrado enlaces adicionales relevantes (papers, blogs o demos) en la busqueda web realizada.
