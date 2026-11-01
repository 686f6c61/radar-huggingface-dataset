# OpensourceWTF/Qwen3.8-Flash-Next-EXL3-2.05-mlx-serve

## Resumen

Qwen3.8-Flash-Next-EXL3-2.05-mlx-serve es una cuantización extrema a 2,05 bits por peso del modelo Qwen3.8-Flash-Next de Qwen, publicada por el usuario OpensourceWTF en Hugging Face. No se trata de una cuantización nueva: los bytes EXL3 proceden del trabajo de turboderp (repositorio turboderp/Qwen3.8-Flash-Next-exl3, rama `2.05bpw_h4_ng4`), repackeados al layout de ficheros que carga mlx-serve en Apple silicon. El modelo base es un MoE de aproximadamente 18.400 millones de parámetros totales (dato real extraído de los safetensors: 18.414.907.795), con 512 expertos enrutados por capa y soporte de decodificación MTP (multi-token prediction) y tabla n-gram para decodificación especulativa.

Su relevancia está en permitir servir un modelo grande y muy cuantizado en Macs con Apple silicon mediante mlx-serve, algo que el mlx-serve estándar no soporta: se necesitan la rama `qwen38-exl3-full` de davidtai/mlx-serve y el plugin turboexl3. La cuantización a 2,05 bpw reduce el tamaño del repo a 63,09 GB (36,85 GB sin la tabla n-gram), lo que permite ejecutarlo en una M5 Max de 128 GB. La licencia del modelo base es qwen-community-1.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE transformer con Gated DeltaNet, atención sparse con indexer, capa MTP y tabla n-gram (familia qwen4_exp) |
| Parametros totales | 18.414.907.795 (dato real de safetensors) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | EXL3 a 2,05 bpw (expertos K2, trunk/atención K4, MTP K3, lm_head K4); embeddings, routers, normas, vision tower y otros tensores pequeños en bf16 |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (other) |
| Formato de pesos | safetensors (layout EXL3 repackeado para mlx-serve) |

## Arquitectura y entrenamiento

El modelo base, Qwen3.8-Flash-Next, es un MoE con 48 capas de 512 expertos enrutados cada una, más una capa MTP con otros 512 expertos. Combina proyecciones de atención q/k/v/o con bloques Gated DeltaNet y un indexer de atención sparse tanto en el trunk como en la capa MTP. Incluye una tabla de embeddings n-gram (26,24 GB en este pack) para decodificación especulativa n-gram y una cabeza MTP para predicción de múltiples tokens. El pack incorpora además una vision tower en bf16 (0,90 GB), aunque solo se ha probado la entrada de texto.

Respecto al entrenamiento del modelo base, no hay datos disponibles en la información proporcionada (tokens, composición del dataset, RLHF/DPO). En cuanto a la cuantización, turboderp midió con exllamav3 sobre sus ficheros una divergencia KL media D_KL(p_BF16 ‖ p_quant) de 0,0681 y una perplejidad de 1,4871 frente a 1,38474 del BF16, sobre una traza autogenerada in-domain de 14.496 tokens de entrada y 45.588 de salida; el suelo de ruido KLD es 0,00262. Todos los tensores EXL3 usan el codebook MUL1.

## Capacidades

- Generacion de texto conversacional (pipeline text-generation).
- Generacion de codigo: el pack ha sido evaluado con EvalPlus en modo greedy, con pass@1 de 0,970 en HumanEval y 0,958 en MBPP.
- Soporte de vision (incluye vision tower en bf16), aunque no probado por el autor del pack.
- Decodificacion especulativa via tabla n-gram EXL3 y cabeza MTP.
- Arquitectura hibrida con Gated DeltaNet y atencion sparse para eficiencia en secuencias largas (longitud de contexto concreta no disponible).
- Tool calling, agentes y capacidades multilingues: no disponible en la informacion proporcionada.

## Casos de uso

- Ejecucion local en Apple silicon de gama alta: el objetivo principal del pack es servir el modelo en Macs con memoria unificada suficiente (probado en M5 Max de 128 GB), sin depender de GPUs de datacenter.
- Generacion y completado de codigo offline: con pass@1 de 0,970 en HumanEval, es adecuado para asistentes de codigo locales integrados en editores, sin enviar codigo a servicios externos.
- Experimentacion con cuantizaciones extremas: al mantener solo 2,05 bits por peso con KLD contenido (0,0681), sirve como banco de pruebas para estudiar el limite de la cuantizacion en MoE grandes.
- Prototipado de decodificacion especulativa: la tabla n-gram y la cabeza MTP permiten investigar tecnicas de aceleracion de inferencia en mlx-serve.
- Chatbot local privado: como modelo conversacional cuantizado, puede desplegarse en un Mac para conversaciones donde la privacidad de los datos es prioritaria.
- Investigacion sobre inferencia eficiente de MoE: la combinacion de expertos K2, trunk K4 y tensores bf16 es un caso de estudio de cuantizacion mixta por componente.

## Benchmarks y rendimiento

Datos de la cuantizacion medidos por turboderp con exllamav3 sobre sus ficheros (los mismos bytes de este pack):

| Metrica | Valor |
|---|---|
| Divergencia KL media (frente a BF16) | 0,0681 |
| Perplejidad de la cuantizacion | 1,4871 |
| Perplejidad de BF16 en la misma traza | 1,38474 |
| Suelo de ruido KLD | 0,00262 |
| Trazas de evaluacion | 14.496 tokens entrada / 45.588 tokens salida |

Resultados end-to-end medidos por los autores del pack a traves de mlx-serve (EvalPlus, greedy, pass@1):

| Benchmark | Resultado |
|---|---|
| HumanEval | 0,970 (159/164) |
| HumanEval+ | 0,927 (152/164) |
| MBPP | 0,958 (362/378) |
| MBPP+ | 0,807 (305/378) |

No se han publicado resultados de benchmarks estandar (MMLU, GSM8K, etc.) del modelo base en la informacion disponible.

## Requisitos de hardware

- Memoria: el pack completo ocupa 63,09 GB; sin la tabla n-gram, 36,85 GB. Probado unicamente en un Apple M5 Max con 128 GB de memoria unificada; otros Macs no han sido testeados.
- No es un modelo para GPU NVIDIA convencional en este formato: no carga en exllamav3, transformers, vLLM, SGLang ni mlx-lm.
- Software necesario: mlx-serve con soporte EXL3 completo para Qwen3.8 (rama `qwen38-exl3-full` de davidtai/mlx-serve, o la head de ddalcu/mlx-serve#997) y el plugin turboexl3 compilado desde davidtai/turboexl3 (directorio `plugin/`), que gestiona los bloques `expert_quant` y `trunk_quant`.
- Latencia y throughput: no disponibles.
- Despliegue: exclusivamente mlx-serve en Apple silicon para este pack; para exllamav3 debe usarse el repositorio original de turboderp.

## Comparativa con modelos similares

| Modelo | Tamano | Formato | Entorno | Licencia |
|---|---|---|---|---|
| Qwen3.8-Flash-Next-EXL3-2.05-mlx-serve (este) | 18.414.907.795 parametros | EXL3 2,05 bpw repackeado | mlx-serve (Apple silicon) | qwen-community-1.0 |
| turboderp/Qwen3.8-Flash-Next-exl3 (2.05bpw_h4_ng4) | mismo modelo base | EXL3 2,05 bpw | exllamav3 | qwen-community-1.0 |
| Qwen/Qwen3.8-Flash-Next (base) | mismo modelo base | pesos originales (bf16) | transformers/vLLM/SGLang | qwen-community-1.0 |

No hay datos comparativos de rendimiento directo entre estas variantes mas alla de las curvas KLD/perplejidad de turboderp, que cubren sus cuantizaciones EXL3 en 2,05, 3,05, 4,05 y 5,05 bpw y formatos EXL3-SC.

## Limitaciones y advertencias

- Cuantizacion muy agresiva: a 2,05 bpw la perplejidad sube de 1,38474 (BF16) a 1,4871 y el KLD es 0,0681 frente a un suelo de ruido de 0,00262; puede haber degradacion apreciable en tareas sensibles.
- Los autores no midieron la calidad del pack: no ejecutaron pruebas KLD ni de perplejidad a traves de mlx-serve; los numeros de turboderp se midieron con exllamav3 sobre sus ficheros.
- Compatibilidad muy limitada: no carga en exllamav3, transformers, vLLM, SGLang ni mlx-lm; requiere ramas y plugins concretos de mlx-serve y turboexl3.
- Solo probado en texto; la entrada de imagen o video no ha sido testada pese a incluir vision tower.
- Solo probado en un Apple M5 Max de 128 GB; el comportamiento en otros Macs es desconocido.
- No es una release oficial de Qwen, turboderp ni mlx-serve; los autores piden acreditar a turboderp si se usan los ficheros.
- Licencia qwen-community-1.0 (tipo "other"): conviene revisar sus terminos antes de uso comercial; las restricciones concretas no estan detalladas en la informacion disponible.
- La tabla n-gram anade 26,24 GB al download; si no se necesita decodificacion especulativa, puede prescindirse de ella (36,85 GB).
- Riesgo de alucinacion, sesgos y limites de contexto o idioma: no disponibles datos especificos.

## Enlaces

- Pack cuantizado: https://huggingface.co/OpensourceWTF/Qwen3.8-Flash-Next-EXL3-2.05-mlx-serve
- Cuantizacion original de turboderp: https://huggingface.co/turboderp/Qwen3.8-Flash-Next-exl3
- Rama 2.05bpw_h4_ng4: https://huggingface.co/turboderp/Qwen3.8-Flash-Next-exl3/tree/2.05bpw_h4_ng4
- Modelo base de Qwen: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- exllamav3: https://github.com/turboderp-org/exllamav3
- mlx-serve: https://github.com/ddalcu/mlx-serve
- Rama qwen38-exl3-full de mlx-serve: https://github.com/davidtai/mlx-serve/tree/qwen38-exl3-full
- Pull request ddalcu/mlx-serve#997: https://github.com/ddalcu/mlx-serve/pull/997
- turboexl3: https://github.com/davidtai/turboexl3
- Plugin turboexl3: https://github.com/davidtai/turboexl3/tree/main/plugin
- Resultados de evaluacion (coding evals): https://github.com/davidtai/turboexl3/blob/main/docs/RESULTS.md#coding-evals
