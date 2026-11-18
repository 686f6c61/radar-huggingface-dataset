# hapyendin/qwen3.8-next-flash-uncensored-iqr-v4

## Resumen

`hapyendin/qwen3.8-next-flash-uncensored-iqr-v4` es una cuantización de un checkpoint abliterado del modelo Qwen3.8-Flash-Next, empaquetada en un único contenedor `.rad` para el motor de inferencia radiance, orientado a GPUs AMD con arquitectura RDNA4 y ROCm. El autor del artefacto es el usuario de Hugging Face `hapyendin`, que aplica la receta de cuantización `qwen4exp-iqr-v4` de StillDeadcode sobre el checkpoint BF16 `orcarouter/Qwen3.8-Flash-Next-Uncensored`, a su vez derivado del modelo base `Qwen/Qwen3.8-Flash-Next` del equipo Qwen. No se trata de un modelo entrenado desde cero, sino de un artefacto de distribución: mismos pesos, mismo recetario de cuantización y misma disposición de bandas que su hermano censurado, con la única diferencia del checkpoint de origen.

El modelo subyacente es un MoE de 180.000 millones de parámetros con capacidades de visión y decodificación especulativa multitoken (MTP) preservadas, y una longitud de contexto entrenada de 262.144 tokens. La cuantización resultante ocupa 113,32 GiB (121.678.372.864 bytes) distribuidos en 51.489 tensores con arquitectura declarada `qwen4exp` y un vocabulario de 248.077 entradas. El contenedor está pensado para servirse con tensor paralelo de 2 vías sobre dos GPUs de 32 GB, con una política de colocación de expertos por niveles (`expert_tiered`) que descarga parte de los expertos a RAM de host.

Su relevancia es doble: por un lado, demuestra que la eliminación de la dirección de rechazo (abliteration) sobrevive intacta al proceso de cuantización, con 0 rechazos en una batería de 8 prompts conversacionales frente a 0/8 del gemelo censurado en prompts suaves (la separación aparece en tareas de generación más exigentes); por otro, los autores reportan que el rendimiento de decodificación es estadísticamente indistinguible del modelo censurado, entre 172 y 234 tok/s en una sola secuencia. Es, por tanto, un artefacto de interés para quienes necesitan un modelo sin guardarraíles integrados en hardware AMD, asumiendo la responsabilidad legal y ética del uso.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE (arquitectura declarada en el contenedor: `qwen4exp`) |
| Parámetros totales | 180B (según model card del checkpoint de origen) |
| Parámetros activos | no disponible |
| Longitud de contexto | 262.144 tokens entrenados; `max-model-len` configurado a 200.000 en el YAML de ejemplo |
| Tipos de cuantización | Receta `qwen4exp-iqr-v4` (bandas mixtas, con codebook w4nl y Hessians de calibración `qc-fn-bf16`); tags del repo mencionan 4-bit, int8 y GPTQ, pero el contenedor es un formato propietario RAD2 |
| Idiomas soportados | no disponible |
| Licencia | Qwen Community License 1.0 (heredada de la cadena base → abliterado → cuantización) |
| Formato de pesos | `.rad` (RAD2), 51.489 tensores, vocabulario 248.077, 113,32 GiB |

## Arquitectura y entrenamiento

El modelo subyacente es un transformer con mezcla de expertos (MoE) de 180B parámetros, con visión y decodificación especulativa multitoken (MTP) preservadas tras el proceso de cuantización. La model card no detalla el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO; esa información correspondería a la documentación del modelo base `Qwen/Qwen3.8-Flash-Next`, que no se incluye en la información disponible. La innovación técnica destacable del artefacto no está en el entrenamiento sino en el pipeline de compresión: la receta `qwen4exp-iqr-v4` define bandas de cuantización por tensor, un conjunto de codebooks `w4nl` y Hessians de calibración (`calib/qc-fn-bf16`), aplicados mediante `rad-convert` sobre backend de CPU de host con 26 hilos durante aproximadamente 21 horas. La puerta de validación `--plan-only` confirmó 35 reglas y 50.605 tensores cuantizados con un plan de 113,16 GiB, coincidente con el resultado publicado.

La modificación de pesos que da sentido a este artefacto es la abliteración aplicada por `orcarouter` sobre el checkpoint BF16: una edición de las matrices de escritura residual que elimina la dirección de rechazo, no un desaprendizaje. El autor advierte explícitamente de que el fine-tuning sobre datos con alta densidad de rechazos puede reintroducir parcialmente conductas de negativa. La cuantización, según la model card, no interactúa con las bandas de cuantización porque la abliteración solo modifica matrices de escritura residual. La verificación de calidad KL frente al BF16 queda marcada como pendiente (TODO) en la documentación del autor.

## Capacidades

- Generación de texto y razonamiento conversacional multi-turno, con contexto entrenado de hasta 262.144 tokens.
- Capacidades de visión preservadas desde el checkpoint de origen (tag `vision` y mención explícita de "vision + MTP preserved").
- Decodificación especulativa multitoken (MTP) integrada, con `num-speculative-tokens: 3` en la configuración de servicio y una media reportada de ~2,4 tokens aceptados por paso.
- Generación sin guardarraíles: 0 rechazos en una batería de 8 prompts conversacionales, incluida generación de blasfemias, no solo su definición.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada (el campo de idiomas del repo está vacío).

## Casos de uso

- Investigación sobre alineación y abliteración: el artefacto permite comparar el comportamiento de un mismo modelo con y sin dirección de rechazo eliminada, manteniendo idéntica receta de cuantización y mismo motor, lo que aísla la variable de alineación del efecto de compresión.
- Evaluación de robustez de cuantizaciones: al existir un gemelo censurado con bandas idénticas, se puede medir si la cuantización degrada de forma diferencial capacidades afectadas por la edición de pesos residuales.
- Despliegue en hardware AMD RDNA4: con dos Radeon AI PRO R9700 (gfx1201) y ROCm, el contenedor se sirve con tensor paralelo de 2 vías y colocación `expert_tiered`, aprovechando el ecosistema radiance en lugar de CUDA.
- Generación creativa sin filtros: escritura de ficción, guiones o contenido de tono adulto donde un modelo alineado rechazaría la petición; el autor reporta 0 rechazos en generación de blasfemias y contenido soez.
- Procesamiento de documentos largos con entrada visual: la combinación de contexto de 262.144 tokens y capacidades de visión permite tareas de comprensión de documentos escaneados o capturas extensas, siempre que se valide empíricamente la retención de la torre visual tras la cuantización.
- Servicio de inferencia de alto rendimiento en una sola máquina: con 172–234 tok/s de decodificación en una secuencia y TTFT de 0,11–3,3 s en prompts cortos, es viable para aplicaciones interactivas que toleren latencias de primera token de hasta unos segundos.
- Estudio de decodificación especulativa: la configuración con `num-speculative-tokens: 3` y los datos de tokens aceptados por paso (~2,4) permiten analizar el rendimiento del MTP en entornos ROCm.

## Benchmarks y rendimiento

La model card no publica resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) para este contenedor. Los únicos datos de rendimiento reportados son de serving y de comportamiento de rechazo:

| Métrica | Valor reportado | Condiciones |
|---|---|---|
| Decodificación (tok/s) | 172–234 | 2× Radeon AI PRO R9700 (gfx1201), radiance 2.1.0, una secuencia, generaciones idénticas de 550 tokens |
| Paso de decodificación | ~12,5 ms | Referencia del modelo original censurado, ~2,4 tokens aceptados por paso ≈ 190 tok/s |
| TTFT | 0,11–3,3 s | Una secuencia, prompts cortos |
| Tiempo de carga del contenedor | ~13 s | NVMe con caché caliente |
| Rechazos (batería de 8 prompts) | 0/8 | Generación conversacional, incluida generación de blasfemias |
| Rechazos del gemelo censurado | 0/8 | Misma batería, apuestas suaves; la separación aparece en tareas de generación más exigentes |
| KL vs BF16 | TODO (pendiente) | No medido en el momento de la publicación |

Advertencia del autor: las ejecuciones se realizaron con `memlock` del contenedor limitado a 8 MiB, lo que degrada el nivel de expertos fijado en memoria; con `perf-fix` aplicado se espera el extremo superior del rango o mejor.

## Requisitos de hardware

- VRAM: el contenedor ocupa 113,32 GiB; la configuración de referencia usa 2 GPUs de 32 GB con tensor paralelo de 2 vías y `gpu-headroom-mib: 96`.
- RAM de host: ~32 GB libres para el pool de expertos fijado; el YAML de ejemplo fija `host-pool-mib: 12288` y `prefix-cache-mib: 4096`.
- GPU recomendadas: 2× Radeon AI PRO R9700 (gfx1201, RDNA4, ROCm). No hay datos de funcionamiento en GPUs NVIDIA ni en otras arquitecturas AMD.
- Consumer GPU: no cabe en una GPU de consumo; requiere dos aceleradores de 32 GB y un pool de expertos en RAM de host.
- Almacenamiento: el contenedor debe residir en NVMe por la tabla de n-gramas; la carga en frío reportada es de ~13 s con caché caliente.
- Motor de despliegue: radiance, versión superior a 1.17.0; verificado en 2.1.0. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, ya que el formato `.rad` es propietario de radiance.
- Configuración de servicio: `kv-cache-dtype: i8`, `max-num-seqs: 8`, `max-num-batched-tokens: 2048`, `num-speculative-tokens: 3`, `tp-wire: wht6`.
- Latencia y throughput: 172–234 tok/s de decodificación en una secuencia y TTFT de 0,11–3,3 s en prompts cortos, con la salvedad de `memlock` limitado.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| `hapyendin/qwen3.8-next-flash-uncensored-iqr-v4` | 180B (MoE) | 262.144 | `.rad` (RAD2), 113,32 GiB | Qwen Community License 1.0 | Abliterado, cuantización IQR-V4, solo radiance/ROCm |
| `StillDeadcode/qwen3.8-next-flash-iqr-v4` | 180B (MoE) | 262.144 | `.rad` (RAD2), 113,3 GiB | Qwen Community License 1.0 | Gemelo censurado, misma receta y bandas; ~190 tok/s reportados |
| `orcarouter/Qwen3.8-Flash-Next-Uncensored` | 180B (MoE) | 262.144 | BF16 | Qwen Community License 1.0 (el badge Apache 2.0 de su card es incorrecto según esta model card) | Checkpoint abliterado de origen; AdvBench 100% → 2% de rechazo según su card |
| `Qwen/Qwen3.8-Flash-Next` | 180B (MoE) | 262.144 | BF16 | Qwen Community License 1.0 | Modelo base con alineación estándar del equipo Qwen |

## Limitaciones y advertencias

- Ausencia de guardarraíles: la alineación de seguridad ha sido sustancialmente eliminada; el modelo cumplirá peticiones que un modelo alineado rechazaría. El usuario asume toda la responsabilidad del uso.
- La abliteración no es un desaprendizaje: el fine-tuning sobre datos con alta densidad de rechazos puede reintroducir parcialmente conductas de negativa.
- Calidad de cuantización no verificada: la divergencia KL frente al BF16 está marcada como TODO en la model card; no hay medición publicada.
- Idiomas soportados no declarados: el campo de idiomas del repo está vacío y la model card no los enumera.
- Ecosistema restringido: el formato `.rad` solo se sirve con radiance en GPUs AMD RDNA4 con ROCm; no hay ruta documentada para CUDA, vLLM, llama.cpp, Ollama o TGI.
- Requisito de memoria: 113,32 GiB de contenedor más ~32 GB de RAM de host para el pool de expertos, lo que excluye su uso en una sola GPU de consumo.
- Las mediciones de rendimiento se tomaron con `memlock` limitado a 8 MiB, lo que degrada el nivel de expertos fijado; los valores reales con `perf-fix` podrían ser superiores.
- La separación entre el modelo censurado y el abliterado no se observó en prompts suaves (0/8 en ambos); solo aparece en tareas de generación más exigentes, por lo que la evaluación de la eliminación de rechazos requiere baterías diseñadas para provocar generación, no definición.
- Licencia Qwen Community License 1.0: conviene revisar sus restricciones de uso comercial antes de desplegar en producción; el autor advierte además de que el badge Apache 2.0 del checkpoint de origen es incorrecto.
- Datos de benchmarks estándar (MMLU, HumanEval, GSM8K) no publicados para este contenedor; las cifras de rechazo de AdvBench (100% → 2%) corresponden al checkpoint de origen, no a esta cuantización.
- Riesgo de alucinación: no cuantificado en la información disponible.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/hapyendin/qwen3.8-next-flash-uncensored-iqr-v4
- Checkpoint abliterado de origen: https://huggingface.co/orcarouter/Qwen3.8-Flash-Next-Uncensored
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Gemelo censurado con la misma receta: https://huggingface.co/StillDeadcode/qwen3.8-next-flash-iqr-v4
- Motor de inferencia radiance: https://codeberg.org/StillDeadcode/radiance
