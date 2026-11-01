# OpensourceWTF/Qwen3.8-Flash-Next-EXL3-3.05-mlx-serve

## Resumen

Qwen3.8-Flash-Next-EXL3-3.05-mlx-serve es una cuantización de terceros del modelo Qwen3.8-Flash-Next, publicado por el usuario OpensourceWTF en Hugging Face. No se trata de una cuantización nueva: el repositorio reempaqueta los ficheros EXL3 a 3,05 bits por peso creados por turboderp (repositorio turboderp/Qwen3.8-Flash-Next-exl3, rama `3.05bpw_h5_ng5`) al layout de ficheros que carga mlx-serve, un runtime de inferencia para Apple silicon. El modelo base es un modelo de generación de texto conversacional con arquitectura MoE (etiqueta `qwen4_exp`) que incluye capa MTP (multi-token prediction), tabla n-gram y torre de visión, aunque el pack solo ha sido probado con texto.

Su relevancia es que permite ejecutar una cuantización agresiva (3,05 bpw) de un modelo MoE con 26.349 millones de parámetros totales en hardware Apple silicon, con soporte completo de la cuantización EXL3 para el trunk, la tabla n-gram y la cabeza MTP. El resultado es un pack de 85,4 GB que en las pruebas del autor alcanza 0,982 de pass@1 en HumanEval, cifras notables para un modelo cuantizado a poco más de 3 bits por peso. Es un release no oficial: ni Qwen, ni turboderp ni los mantenedores de mlx-serve lo publican.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (transformer con expertos enrutados, Gated DeltaNet, sparse attention con indexer, capa MTP) |
| Parametros totales | 26.349.105.555 (dato real de safetensors) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | EXL3 3,05 bpw (K3 expertos, K5 atencion y lm_head, K4 MTP fc, tensores pequenos en bf16) |
| Idiomas soportados | no disponibles |
| Licencia | qwen-community-1.0 (licencia "other") |
| Formato de pesos | safetensors (repack EXL3 para mlx-serve) |

## Arquitectura y entrenamiento

El modelo base, Qwen3.8-Flash-Next, es una arquitectura MoE hibrida. El pack contiene 49 capas con expertos enrutados (48 capas del trunk mas la capa MTP), con 512 expertos por capa, proyecciones de atencion q/k/v/o, proyecciones Gated DeltaNet y expertos compartidos, un indexer de sparse attention, una tabla de embebido n-gram de 32,64 GB usada para decodificacion especulativa por n-gram, y una torre de vision en bf16. La cuantizacion EXL3 usa codigos trellis con distintos niveles K (bits por peso): K3 para expertos e indexer, K5 para atencion, lm_head y tabla n-gram, K4 para las proyecciones del MTP, con codebook MUL1. Los routers, normas, embebidos de tokens, pesos de hiperconexiones y convoluciones permanecen en bf16 sin cuantizar.

Sobre el entrenamiento del modelo base no se proporciona informacion (numero de tokens, composicion del dataset, RLHF/DPO): no disponible. La innovacion tecnica principal de este pack no esta en el entrenamiento sino en el empaquetado: los tensores por-experto de cada capa se apilan en un unico tensor por proyeccion (`switch_mlp.{gate,up,down}_proj.{trellis,suh,svh}`) sin recuantizar ningun byte, y el pack requiere el plugin turboexl3 y una rama de mlx-serve con soporte EXL3 completo (`qwen38-exl3-full`).

## Capacidades

- Generacion de texto conversacional (pipeline text-generation).
- Generacion de codigo: en las pruebas del autor con EvalPlus greedy pass@1 obtiene 0,982 en HumanEval, 0,939 en HumanEval+, 0,950 en MBPP y 0,820 en MBPP+.
- Decodificacion especulativa mediante la tabla n-gram EXL3 y la cabeza MTP (multi-token prediction), que aceleran la inferencia.
- Arquitectura hibrida con Gated DeltaNet y sparse attention con indexer para manejo eficiente de secuencias.
- Torre de vision incluida en bf16 (0,90 GB), aunque el pack no ha sido probado con entrada de imagen o video.
- Capacidades de tool calling, agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponibles.

## Casos de uso

- Inferencia local en Apple silicon de gama alta: el pack esta pensado para servirse con mlx-serve en Macs con memoria unificada amplia; el autor lo ha validado en un M5 Max con 128 GB.
- Generacion y revision de codigo en local: con 0,982 de pass@1 en HumanEval, es adecuado para asistentes de codigo que ejecutan offline sin depender de APIs externas.
- Chatbot conversacional autoalojado: al ser un modelo conversacional con inferencia eficiente en Mac, sirve para desplegar asistentes privados sin enviar datos a terceros.
- Experimentacion con decodificacion especulativa: incluye tabla n-gram y cabeza MTP, util para investigar aceleracion de inferencia en hardware de consumo.
- Investigacion sobre cuantizacion EXTREMA (3,05 bpw): util como punto de comparacion frente a otras cuantizaciones (2,05, 4,05 y 5,05 bpw de la serie EXL3 de turboderp) midiendo KLD y perplejidad.
- Prototipado de pipelines con vision en Mac: la torre de vision esta incluida en bf16, lo que abre la puerta a pruebas multimodales una vez validadas (actualmente sin probar).

## Benchmarks y rendimiento

Datos medidos por turboderp sobre los ficheros EXL3 originales (rama `3.05bpw_h5_ng5`, traza auto-generada in-domain de 14.496 tokens de entrada y 45.588 de salida, con exllamav3; este pack contiene los mismos ficheros pero no fue medido a traves de mlx-serve):

| Metrica | Valor |
|---|---|
| KL divergence media D_KL(p_BF16 ‖ p_quant) | 0,0174 |
| Perplejidad del pack 3,05 bpw | 1,4074 |
| Perplejidad BF16 (referencia) | 1,38474 |
| Suelo de ruido KLD | 0,00262 |

Evaluacion end-to-end a traves de mlx-serve (EvalPlus, greedy pass@1, segun turboexl3):

| Benchmark | Pass@1 |
|---|---|
| HumanEval | 0,982 (161/164) |
| HumanEval+ | 0,939 (154/164) |
| MBPP | 0,950 (359/378) |
| MBPP+ | 0,820 (310/378) |

No se han publicado resultados de benchmarks estandar tipo MMLU o GSM8K en la informacion disponible.

## Requisitos de hardware

- Memoria: el pack completo pesa 85,36 GB; sin la tabla n-gram, 52,72 GB. El unico Mac probado es un Apple M5 Max con 128 GB de memoria unificada; otros Macs no han sido testeados.
- GPU: al ser un pack para Apple silicon via mlx-serve, no aplica VRAM de GPU NVIDIA; se necesita memoria unificada suficiente para alojar el modelo (idealmente 128 GB o mas para el pack completo).
- Consumer GPU: no aplicable; el pack no carga en exllamav3, transformers, vLLM, SGLang ni mlx-lm.
- Despliegue: requiere mlx-serve con soporte EXL3 completo para Qwen3.8 (rama `qwen38-exl3-full` de davidtai/mlx-serve, o la head de ddalcu/mlx-serve#997) mas el plugin turboexl3 compilado desde el directorio `plugin/` de davidtai/turboexl3, que gestiona los bloques `expert_quant` y `trunk_quant`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Formato/runtime | Licencia |
|---|---|---|---|---|
| OpensourceWTF/Qwen3.8-Flash-Next-EXL3-3.05-mlx-serve | 26.349 M (total) | EXL3 3,05 bpw | safetensors / mlx-serve | qwen-community-1.0 |
| turboderp/Qwen3.8-Flash-Next-exl3 | 26.349 M (total) | EXL3 (2,05 a 5,05 bpw) | EXL3 / exllamav3 | no disponible |
| Qwen/Qwen3.8-Flash-Next (base) | no disponible | bf16 (sin cuantizar) | no disponible | no disponible |

El pack de OpensourceWTF es esencialmente el punto 3,05 bpw de la serie EXL3 de turboderp, reempaquetado para Apple silicon; para usarlo con exllamav3 hay que acudir al repositorio original de turboderp.

## Limitaciones y advertencias

- No es un release oficial de Qwen, turboderp ni mlx-serve; es un repack comunitario con 247 descargas y sin validacion amplia.
- El autor no midio la calidad del pack: no se ejecutaron pruebas KLD ni de perplejidad a traves de mlx-serve; las metricas de turboderp fueron medidas con exllamav3 sobre sus ficheros.
- Solo probado con texto; la entrada de imagen o video no ha sido testada pese a incluir la torre de vision.
- Solo probado en un Apple M5 Max con 128 GB; compatibilidad con otros Macs desconocida.
- Incompatible con runtimes estandar: no carga en exllamav3, transformers, vLLM, SGLang ni mlx-lm; exige ramas y plugins concretos, lo que anade fragilidad para produccion.
- La cuantizacion a 3,05 bpw introduce degradacion medible respecto a BF16 (KLD 0,0174 frente a suelo de ruido 0,00262), con posible aumento de alucinaciones en tareas delicadas.
- Sesgos, limitaciones de idioma y restricciones de uso comercial concretas: no disponibles en la informacion proporcionada; la licencia es "other" (qwen-community-1.0), por lo que conviene revisar el texto LICENSE antes de uso comercial.

## Enlaces

- Ficha del modelo: https://huggingface.co/OpensourceWTF/Qwen3.8-Flash-Next-EXL3-3.05-mlx-serve
- Cuantizacion original de turboderp: https://huggingface.co/turboderp/Qwen3.8-Flash-Next-exl3 (rama `3.05bpw_h5_ng5`: https://huggingface.co/turboderp/Qwen3.8-Flash-Next-exl3/tree/3.05bpw_h5_ng5)
- Modelo base de Qwen: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- exllamav3: https://github.com/turboderp-org/exllamav3
- mlx-serve: https://github.com/ddalcu/mlx-serve
- Rama con soporte EXL3 completo: https://github.com/davidtai/mlx-serve/tree/qwen38-exl3-full
- Pull request de soporte: https://github.com/ddalcu/mlx-serve/pull/997
- turboexl3 (plugin): https://github.com/davidtai/turboexl3 (plugin: https://github.com/davidtai/turboexl3/tree/main/plugin)
- Resultados de evaluaciones de codigo: https://github.com/davidtai/turboexl3/blob/main/docs/RESULTS.md#coding-evals
