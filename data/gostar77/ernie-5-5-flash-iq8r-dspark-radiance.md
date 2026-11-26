# gostar77/ernie-5.5-flash-iq8r-dspark-radiance

## Resumen

ERNIE-5.5-Flash-Preview IQ8R + DSpark es un contenedor de pesos cuantizados en formato `.rad` nativo del runtime Radiance, derivado del modelo `baidu/ERNIE-5.5-Flash-Preview` de Baidu. No es un checkpoint de Transformers, ni un GGUF, ni un modelo safetensors: es un artefacto empaquetado especificamente para el motor de inferencia Radiance, con el tronco (trunk) requantizado a IQ8R (int8 con escalas por grupo y rotacion Hadamard) y los expertos enrutados conservados byte a byte en MXFP4 original de Baidu. El autor del contenedor es el usuario `gostar77`, no Baidu.

El modelo base es un Mixture-of-Experts (MoE) de gran escala con 512 expertos enrutados por capa y un total de 92.160 planos de expertos (154,0 GB solo en expertos). El contenedor incluye ademas un drafter DSpark para decodificacion especulativa, lo que permite acelerar la generacion sin perdida de calidad (lossless) en modo determinista. El objetivo es ofrecer una alternativa de cuantizacion int8 al contenedor FP8 de referencia, con menor divergencia respecto al maestro BF16 y el mismo tamano en disco.

Es relevante ahora porque demuestra un flujo de cuantizacion GPTQ aplicado a un MoE masivo con expertos en MXFP4, manteniendo los expertos intactos y solo requantizando las capas lineales densas y de atencion. La licencia es Apache-2.0, heredada del modelo base, y los idiomas soportados son ingles y chino. El repositorio ocupa 166,0 GB y no tiene descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) transformer, con atencion DSA (DeepSeek-style attention), hiper-conexiones y drafter DSpark |
| Parametros totales | no disponible |
| Parametros activos | no disponible (512 expertos enrutados por capa, sin cifra de activos publicada) |
| Longitud de contexto | 131.072 tokens (segun `max-model-len` en la configuracion de servicio) |
| Tipos de cuantizacion | Tronco IQ8R (int8, grupo 256, rotacion Hadamard, escalas bf16 por fila); expertos MXFP4 (byte a byte del original); drafter en int8 redondeado |
| Idiomas soportados | en, zh |
| Licencia | Apache-2.0 |
| Formato de pesos | `.rad` (contenedor nativo Radiance); incluye `.recipe` y plantilla Jinja |

## Arquitectura y entrenamiento

El modelo base es un transformer MoE con 512 expertos enrutados por capa (92.160 planos en total, 154,0 GB en MXFP4), router en bf16, atencion con componentes DSA (q_b, kv_a_lat, indexer q), ocho grupos `wo_a`, gate de atencion, un FFN denso en la capa 0, experto compartido e hiper-conexiones. El contenedor conserva los expertos MXFP4 sin modificar (0 diferencias respecto al contenedor oficial) y solo requantiza el tronco: las 846 matrices lineales de atencion, FFN denso, experto compartido, latent_in/latent_out y drafter pasan de block-FP8 a IQ8R mediante GPTQ, usando los hessianos de la entrada bf16 de cada lineal.

La calibracion se realizo con 337.277 tokens y 491 documentos: 349 documentos de prosa tecnica en ingles y codigo fuente (documentacion de Radiance, C++/HIP, Python, tareas HumanEval+ y MBPP+), y 142 documentos en formato chat generados por el propio modelo servido a partir de 107 prompts nuevos (40 en chino, 25 en ingles, 20 de codigo, 12 de matematicas, 10 de otros idiomas, tool-call y role-play). No se registraron las entradas de los expertos enrutados, por lo que estos no se recalibraron. El drafter se redondeo a vecino mas cercano en la misma rejilla, sin hessianos.

La innovacion principal es la combinacion de cuantizacion GPTQ por grupo con rotacion Hadamard no normalizada cada 128 de K, leida en formato `i8a8h` (grupo 256) contra activaciones int8 con la misma rotacion, mas decodificacion especulativa DSpark con ventana adaptativa.

## Capacidades

- Generacion de texto en ingles y chino.
- Modo de razonamiento nativo mediante la plantilla `<ernie:think>`.
- Soporte de tool calling / function calling mediante `<ernie:tool_call>` en la plantilla nativa incluida.
- Decodificacion especulativa con drafter DSpark (7 tokens de especulacion, lossless en modo determinista).
- Contexto largo de hasta 131.072 tokens.
- Razonamiento multi-paso y agentes (implicito en el modo think y tool calling).
- Generacion de codigo (el corpus de calibracion incluye HumanEval+ y MBPP+).
- Matematicas (prompts de matematicas en el corpus de calibracion).
- No se documentan capacidades de vision ni audio en la informacion disponible.

## Casos de uso

- Atencion al cliente automatizada en chino e ingles: el modelo puede gestionar conversaciones multi-turno con contexto de hasta 131.072 tokens, adecuado para historiales largos y documentacion de soporte adjunta.
- Generacion de codigo en produccion: el soporte de tool calling y la plantilla nativa permiten integrarlo en pipelines de CI/CD para autocompletado, revision de parches y generacion de tests, con el drafter DSpark reduciendo latencia.
- Agentes autonomos multi-paso: el modo `<ernie:think>` y el tool calling permiten cadenas de razonamiento con llamadas a herramientas, adecuado para orquestacion de tareas.
- Procesamiento de documentos tecnicos largos: con 131K de contexto puede resumir y extraer informacion de manuales, codigo fuente y documentacion extensa.
- Asistente de matematicas y razonamiento: util para resolver problemas paso a paso con el modo de pensamiento activado.
- Despliegue en infraestructura AMD: el contenedor esta medido en Radeon AI PRO R9700 x3 con TP3, lo que lo hace adecuado para entornos con GPUs AMD y el runtime Radiance.
- Servicio de inferencia de baja latencia: la decodificacion especulativa DSpark eleva el throughput de 31,3 a 38,3 tok/s en la configuracion medida, util para chat interactivo.

## Benchmarks y rendimiento

Calidad medida con teacher-forcing sobre 24 documentos (2.023 posiciones) fuera del corpus de calibracion, comparando contra el maestro BF16 en CPU:

| Contenedor | Split de expertos | KL media | Mediana | p99 | Acuerdo top-1 |
|---|---|---:|---:|---:|---:|
| FP8 trunk (oficial) | 210,208,94 | 0,0934 | 0,0166 | 1,175 | 92,39% |
| FP8 trunk (oficial) | 204,204,104 | 0,0919 | 0,0173 | 1,094 | 92,14% |
| IQ8R trunk | 210,208,94 | 0,0801 | 0,0142 | 0,988 | 92,78% |
| IQ8R trunk | 204,204,104 | 0,0813 | 0,0142 | 0,982 | 93,18% |

Perplejidad relativa al maestro: 1,012 y 1,010 para IQ8R; 1,000 y 0,994 para FP8. El drafter es lossless en este contenedor: con `deterministic: true`, especulacion 7 produce los mismos tokens que especulacion 0 en 8 de 8 prompts dorados (53% de tokens redactados aceptados).

Velocidad medida en Radeon AI PRO R9700 x3, TP3, split 210,208,94, 8 prompts de chat, 256 tokens:

| Metrica | FP8 trunk | IQ8R trunk |
|---|---:|---:|
| Decodificacion greedy | 31,3 tok/s | 32,1 tok/s |
| Decodificacion DSpark 7 | 38,3 tok/s | 38,0 tok/s |
| Prefill 2K | 738 tok/s | 738 tok/s |
| Prefill 8K | 699 tok/s | 699 tok/s |
| Prefill 15K | 729 tok/s | 730 tok/s |
| Prefill 584 tokens sobre 14K cacheados | 336 tok/s | 335 tok/s |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el contenedor ocupa 166,0 GB en disco; en la configuracion medida se reserva un `host-pool-mib` de 79.700 MiB y se reparte en TP3, por lo que se necesita un pool agregado de al menos ~166 GB entre GPU y host.
- GPU recomendadas: Radeon AI PRO R9700 (medido con 3 unidades en TP3); el plugin declara TP1, TP2 y TP4, aunque solo TP3 fue medido con este contenedor.
- No cabe en GPUs de consumo individuales; requiere multiples GPUs o offload a host.
- Opciones de despliegue: exclusivamente el runtime Radiance, con la rama `ernie55/8-iq8r-trunk` del plugin `ernie55` hasta que se fusione upstream; builds anteriores rechazan el contenedor al cargar.
- Latencia y throughput: 32,1 tok/s en greedy y 38,0 tok/s con DSpark 7 en la configuracion medida; prefill de 699 a 738 tok/s entre 2K y 15K tokens.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ERNIE-5.5-Flash-Preview IQ8R + DSpark (este) | no disponible (MoE, 512 expertos/capa) | 131.072 | `.rad` (Radiance) | Apache-2.0 | Hugging Face, 0 descargas |
| ERNIE-5.5-Flash-Preview FP8 (contenedor oficial) | no disponible (MoE, 512 expertos/capa) | 131.072 | `.rad` (Radiance) | Apache-2.0 | Referencia del autor |
| baidu/ERNIE-5.5-Flash-Preview (BF16 maestro) | no disponible | no disponible | safetensors (presumible) | Apache-2.0 | Hugging Face (Baidu) |

No se dispone de datos de benchmarks estandar para comparar rendimiento con alternativas de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- Solo funciona con el runtime Radiance y una rama especifica del plugin `ernie55`; no es compatible con Transformers, llama.cpp, vLLM, TGI ni Ollama.
- Idiomas limitados a ingles y chino; no se documenta soporte de castellano.
- Riesgo de alucinacion inherente al modelo base; no se han publicado evaluaciones de sesgo ni de seguridad.
- La licencia Apache-2.0 del modelo base se hereda, pero el contenedor es una obra derivada cuantizada y no otorga derechos mas alla de los del modelo original.
- Los expertos MXFP4 no se recalibraron (no se registraron sus entradas), por lo que la mayor parte del KL residual proviene de ellos.
- El drafter se redondeo sin hessianos, lo que puede introducir pequenas desviaciones fuera del conjunto de prompts dorados.
- Solo TP3 ha sido medido con este contenedor; TP1, TP2 y TP4 estan declarados pero no verificados.
- Repositorio con 0 descargas y 0 likes: sin validacion comunitaria.
- El contenedor requiere 166 GB de almacenamiento y un pool de memoria agregado muy elevado.

## Enlaces

- Hugging Face: https://huggingface.co/gostar77/ernie-5.5-flash-iq8r-dspark-radiance
- Modelo base: https://huggingface.co/baidu/ERNIE-5.5-Flash-Preview
- Rama del plugin Radiance: https://codeberg.org/gostar/radiance/src/branch/ernie55/8-iq8r-trunk
