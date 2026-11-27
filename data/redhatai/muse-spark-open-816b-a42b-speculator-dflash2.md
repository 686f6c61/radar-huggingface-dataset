# RedHatAI/Muse-Spark-Open-816B-A42B-speculator.dflash2

## Resumen

Muse-Spark-Open-816B-A42B-speculator.dflash2 es un modelo borrador (draft model) de decodificación especulativa en BF16, desarrollado conjuntamente por RedHatAI (equipo Speculators) e Inferact, para acelerar la inferencia del modelo verificador meta-models/Muse-Spark-Open-816B-A42B-NVFP4. No es un modelo generativo autónomo: su función es proponer tokens candidatos que el modelo grande verifica en bloque, reduciendo el coste por token generado sin alterar la distribución de salida del verificador.

Técnicamente se trata de una red de cinco capas transformer que consume los estados ocultos del verificador en las capas 42, 46, 50, 54 y 58, y propone hasta siete tokens borrador por paso de verificación. Con 3.377.529.472 parámetros reales (según safetensors) y un repositorio de 6,8 GB, está pensado para desplegarse junto al verificador en vLLM mediante el método de especulación `dflash` con rechazo por bloques y verificación adaptativa.

Su relevancia es práctica: en la suite de aceptación publicada alcanza una longitud de aceptación agrupada de 4,215 tokens por paso de verificación sobre 3.543 prompts, lo que se traduce en un ahorro sustancial de cómputo del modelo de 816B en cargas de razonamiento, código y contexto largo (hasta 1.048.576 tokens). La licencia Muse Model License condiciona el uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer draft de 5 capas para decodificación especulativa (DFlash2), con entrada de estados ocultos del verificador en capas 42, 46, 50, 54 y 58 |
| Parametros totales | 3.377.529.472 |
| Parametros activos | no disponible (no es MoE el borrador; el verificador asociado es 816B-A42B) |
| Longitud de contexto | 1.048.576 tokens en la configuración de evaluación del verificador |
| Tipos de cuantizacion | Pesos en BF16; el verificador asociado usa NVFP4 y caché KV FP8 E4M3 |
| Idiomas soportados | no disponible |
| Licencia | muse-model-license (license: other) |
| Formato de pesos | safetensors (custom_code, requiere `--trust-remote-code`) |

## Arquitectura y entrenamiento

El modelo es un borrador DFlash2 de cinco capas transformer que se apoya en los estados ocultos intermedios del verificador Muse-Spark-Open-816B-A42B-NVFP4 en cinco puntos concretos (capas 42, 46, 50, 54 y 58). En cada paso de verificación propone hasta siete tokens borrador, que el verificador valida en bloque mediante rechazo por bloques (`rejection_sample_method: block`) con muestreo probabilístico del borrador (`draft_sample_method: probabilistic`). La integración se realiza a través del método `dflash` de vLLM, con soporte de verificación adaptativa (`enable_adaptive_verification`).

La model card no detalla el volumen de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de alineación como RLHF o DPO para el borrador. La evaluación publicada se ejecutó con el verificador en NVFP4, el borrador y el cómputo en BF16, caché KV FP8 E4M3, tensor parallelism 4 más expert parallelism, CUDA graphs activados y prefix caching desactivado, con temperatura 1.0, top-p 0.95, top-k 64 y esfuerzo de razonamiento `xhigh`.

## Capacidades

- Decodificación especulativa: propone hasta siete tokens por paso de verificación para el verificador Muse-Spark-Open-816B-A42B-NVFP4.
- Aprovechamiento de estados ocultos del verificador en cinco capas, lo que alinea las propuestas con la distribución del modelo grande.
- Verificación adaptativa: el número efectivo de tokens especulados se ajusta dinámicamente según la aceptación observada.
- Compatibilidad con vLLM mediante `--speculative-config` con método `dflash`.
- No genera respuestas de forma autónoma ni soporta tool calling, agentes o razonamiento multi-step por sí mismo: esas capacidades residen en el verificador.
- No se documentan capacidades multilingües, de visión ni de audio propias del borrador.

## Casos de uso

- Aceleración de inferencia en producción del verificador de 816B: desplegar el borrador junto a Muse-Spark-Open-816B-A42B-NVFP4 en vLLM con `--speculative-config` para reducir el número de pasos de verificación por token emitido, con una longitud de aceptación agrupada de 4,215 en la suite publicada.
- Servicio de razonamiento matemático de alto volumen: en GSM8K la longitud de aceptación es 4,558 y en MATH-500 de 4,613, por lo que cargas de problemas matemáticos con salidas largas se benefician especialmente del ahorro de cómputo del verificador.
- Generación de código en pipelines de CI/CD: con HumanEval en 4,477 y MBPP en 4,474 de longitud de aceptación, y 4,273 en la categoría Coding de SPEED-Bench, el borrador es adecuado para autocompletado y generación de tests donde el verificador produce bloques de código extensos.
- Procesamiento de contexto largo: en MRCR con 8 agujas la longitud de aceptación alcanza 5,476, lo que hace al borrador idóneo para tareas de recuperación y síntesis sobre documentos de hasta 1.048.576 tokens.
- RAG empresarial: la categoría RAG de SPEED-Bench registra 4,272 de aceptación, de modo que respuestas ancladas a documentación recuperada mantienen una tasa de aceptación alta y reducen la latencia del verificador.
- Despliegue multilingüe: la categoría Multilingual de SPEED-Bench obtiene 4,342, lo que respalda su uso en asistentes con salidas en varios idiomas siempre que el verificador los soporte.
- Resumen y extracción de información: con 4,199 en Summarization, es adecuado para resumir actas, informes o hilos de soporte donde el verificador genera texto descriptivo largo.

## Benchmarks y rendimiento

Los datos publicados miden aceptación de decodificación especulativa, no precisión de respuesta ni speedup final. Configuración: 4 GPU NVIDIA B200 (4 B300 para MRCR extendido), verificación adaptativa desactivada en todas las filas, 4.096 tokens máximos por llamada.

| Benchmark | Prompts | Longitud de aceptación | Posición 1 | Posición 4 | Posición 7 |
|---|---:|---:|---:|---:|---:|
| GSM8K | 1.319 | 4,558 | 83,51% | 47,58% | 26,30% |
| HumanEval | 164 | 4,477 | 82,78% | 45,91% | 26,08% |
| MBPP | 500 | 4,474 | 82,84% | 45,97% | 25,70% |
| MATH-500 | 500 | 4,613 | 83,78% | 48,55% | 27,17% |
| MT-Bench | 80 | 3,744 | 77,72% | 33,48% | 15,01% |
| SPEED-Bench qualitative | 880 | 3,762 | 77,68% | 34,01% | 14,93% |
| MRCR, 8 needles | 100 | 5,476 | 91,10% | 61,94% | 41,39% |
| Agrupado | 3.543 | 4,215 | 81,02% | 41,65% | 21,63% |

Desglose por categoría de SPEED-Bench qualitative (80 prompts por categoría, 4.096 tokens máximos):

| Categoría | Longitud de aceptación | Posición 1 | Posición 7 |
|---|---:|---:|---:|
| Coding | 4,273 | 81,62% | 22,69% |
| Humanities | 3,422 | 74,40% | 10,55% |
| Math | 4,051 | 80,56% | 18,04% |
| QA | 3,584 | 75,97% | 12,49% |
| RAG | 4,272 | 81,43% | 22,83% |
| Reasoning | 3,974 | 80,03% | 17,14% |
| STEM | 3,711 | 77,55% | 13,71% |
| Writing | 3,265 | 73,53% | 9,24% |
| Multilingual | 4,342 | 80,99% | 24,22% |
| Summarization | 4,199 | 82,36% | 19,06% |
| Roleplay | 3,599 | 76,46% | no disponible en el extracto |

La model card define la longitud de aceptación como 1 + tokens borrador aceptados / pasos de verificación, incluido el token aportado por el verificador, y la posición k como la fracción de pasos que aceptan al menos k tokens borrador (posiciones numeradas de 1 a 7). Los contadores se suman antes de dividir. No se publican curvas de speedup numéricas en la información disponible, solo la metodología (concurrencias 1, 4, 8, 16 y 32, con verificación adaptativa on/off y base no especulativa).

## Requisitos de hardware

- VRAM estimada para el borrador: aproximadamente 6,8 GB de pesos en BF16 (3.377.529.472 parámetros), más overhead de activaciones y estados ocultos del verificador; el repositorio ocupa 6,8 GB.
- El verificador asociado (816B-A42B en NVFP4) requiere múltiples aceleradores de datacenter: la evaluación oficial usa 4 GPU NVIDIA B200 con tensor parallelism 4 y expert parallelism.
- GPU recomendadas: NVIDIA B200 y B300 para el conjunto verificador + borrador; no se documenta funcionamiento en GPU de consumo.
- No cabe en GPU de consumo (RTX 4090, 24 GB) junto al verificador; el borrador por sí solo no es útil sin el verificador.
- Opciones de despliegue: vLLM con `--speculative-config '{"method":"dflash",...}'`, `--trust-remote-code`, `--tensor-parallel-size 4`, `--enable-expert-parallel`, `--kv-cache-dtype fp8_e4m3`, `--max-model-len 1048576`, `--max-num-seqs 64`, `--max-num-batched-tokens 16384`, `--gpu-memory-utilization 1.0`, `--reasoning-parser muse`, `--enable-auto-tool-choice` y `--tool-call-parser muse`.
- Para medir speedup, la model card indica eliminar `--per-request-spec-decode-metrics summary` y comparar con la base sin configuración especulativa.
- Latencia y throughput: no se publican cifras absolutas de tokens por segundo; solo métricas de aceptación y la metodología de las curvas de speedup.

## Comparativa con modelos similares

| Modelo | Rol | Parámetros | Contexto | Licencia | Formato |
|---|---|---:|---:|---|---|
| RedHatAI/Muse-Spark-Open-816B-A42B-speculator.dflash2 | Borrador DFlash2 para verificador de 816B | 3,38B | 1.048.576 (verificador) | muse-model-license | safetensors BF16 |
| meta-models/Muse-Spark-Open-816B-A42B-NVFP4 | Verificador objetivo | 816B totales, 42B activos | 1.048.576 | muse-model-license | safetensors NVFP4 |
| Otros borradores EAGLE/Medusa para el mismo verificador | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de otros borradores comparables publicados para este verificador ni de métricas de aceptación de alternativas, por lo que la comparación cuantitativa con modelos de la misma categoría queda como no disponible.

## Limitaciones y advertencias

- No es un modelo generativo: sin el verificador Muse-Spark-Open-816B-A42B-NVFP4 no produce respuestas útiles.
- Las métricas publicadas miden aceptación de decodificación especulativa, no precisión, calidad de respuesta ni speedup; la model card lo advierte explícitamente.
- La aceptación cae con la posición: del 81,02% en posición 1 al 21,63% en posición 7 en el conjunto agrupado, y en categorías como Writing o Humanities el séptimo token apenas se acepta en torno al 9-10%.
- El rendimiento depende del dominio: Writing (3,265) y Humanities (3,422) están muy por debajo de MRCR (5,476) y MATH-500 (4,613).
- Requiere `--trust-remote-code` y código personalizado (`custom_code`), lo que implica revisar el código remoto antes de desplegar.
- Licencia muse-model-license con política de uso asociada; es necesario revisar LICENSE.md antes de cualquier uso comercial.
- No se documentan idiomas soportados, sesgos conocidos ni tasas de alucinación del borrador; estas propiedades dependen del verificador.
- La configuración de evaluación desactiva prefix caching y fija `--gpu-memory-utilization 1.0`, lo que exige nodos dedicados y limita la convivencia con otras cargas.
- Los resultados se obtuvieron en 4 GPU B200 (y B300 para MRCR extendido); el comportamiento en otras topologías o precisiones no está documentado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/RedHatAI/Muse-Spark-Open-816B-A42B-speculator.dflash2
- Modelo base (verificador): https://huggingface.co/meta-models/Muse-Spark-Open-816B-A42B-NVFP4
- Organización Inferact: https://huggingface.co/Inferact
- Repositorio Speculators (vLLM): https://github.com/vllm-project/speculators
- Licencia Muse Model License: https://huggingface.co/RedHatAI/Muse-Spark-Open-816B-A42B-speculator.dflash2/blob/main/LICENSE.md
