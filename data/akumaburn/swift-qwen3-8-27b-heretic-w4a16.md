# akumaburn/Swift-Qwen3.8-27b-heretic-W4A16

## Resumen

Swift-Qwen3.8-27b-heretic-W4A16 es una cuantizacion de 4 bits (INT4, esquema W4A16, solo pesos) del modelo akumaburn/Swift-Qwen3.8-27b-heretic, un derivado "abliterated" (alineamiento de seguridad eliminado de forma deliberada) construido sobre la familia Qwen3.8 y con soporte de vision (pipeline `image-text-to-text`). El checkpoint lo publica el usuario akumaburn y su proposito declarado es servir como artefacto de investigacion para decodificacion interactiva de un solo usuario sobre GPUs de clase Ampere (SM 8.0), apoyandose en el drafter especulativo DFlash2.

Tecnicamente es una cuantizacion GPTQ con redondeo aprendido, grupo 128, simetrica y sin `act-order`, empaquetada en formato `compressed-tensors` (`pack-quantized`) para que el kernel Marlin no necesite `g_idx`. Deja sin cuantizar `lm_head`, `embed_tokens`, la torre de vision, las puertas recurrentes GatedDeltaNet (`in_proj_a`/`in_proj_b`), la cabeza MTP y todas las normalizaciones. El resultado ocupa 19 GB, frente a los 30 GB del hermano W8A8 y los 52 GB del BF16 original.

Su relevancia es doble: por un lado documenta un punto de operacion concreto (maximo throughput de decodificacion a concurrencia baja, a costa de mayor divergencia respecto al modelo original); por otro, es el unico checkpoint de la familia que evita la rotacion QuaRot offline, decision necesaria para que el drafter DFlash2 acepte los borradores (el hermano W8A8, al estar rotado, mide una longitud de aceptacion exactamente 1,00). Se distribuye bajo licencia Apache 2.0, pero con aviso explicito de uso exclusivamente investigador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido con capas GatedDeltaNet (puertas recurrentes `in_proj_a`/`in_proj_b`), torre de vision y cabeza MTP; no se detalla el reparto exacto de capas |
| Parametros totales | 6.260.690.960 segun los safetensors publicados (la nomenclatura del repositorio indica "27b"; no se explica la discrepancia) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 32.768 tokens en la configuracion de servicio documentada (`--max-model-len 32768`); no se declara la longitud nativa maxima |
| Tipos de cuantizacion | INT4 W4A16 GPTQ, grupo 128, simetrica, sin `act-order`; pesos en `compressed-tensors` `pack-quantized`; activaciones en bf16; existe un hermano W8A8 INT8 con SmoothQuant |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 (con aviso de uso exclusivamente investigador y exencion de responsabilidad del autor) |
| Formato de pesos | safetensors (`compressed-tensors`), libreria `vllm` |

## Arquitectura y entrenamiento

La model card no documenta el proceso de entrenamiento del modelo base ni de la variante heretic: no hay numero de tokens, composicion del dataset, ni si hubo RLHF, DPO u otra fase de preferencias. Lo que si se detalla es la arquitectura a traves de la lista de modulos excluidos de la cuantizacion: la red incluye capas GatedDeltaNet con puertas recurrentes (`in_proj_a`/`in_proj_b`), una torre de vision (de ahi el pipeline `image-text-to-text`) y una cabeza MTP (multi-token prediction). El resto de componentes (norms, embeddings, `lm_head`) corresponden a un transformer estandar. La cuantizacion se aplica sobre el checkpoint ya "abliterated", de modo que ambas perturbaciones son independientes y acumulativas.

La innovacion tecnica central de este checkpoint es la decision de no aplicar rotacion QuaRot offline. El hermano W8A8 si la aplica, lo que traslada el flujo residual a una base rotada; como el `fc` del drafter DFlash2 fue entrenado sobre estados ocultos sin rotar, ese checkpoint rechaza todos los borradores (longitud de aceptacion medida de 1,00 exacto). Este build omite la rotacion y tambien SmoothQuant (que migraria dificultad de cuantizacion hacia los pesos, algo contraproducente cuando solo se cuantizan pesos), lo que lo hace compatible con decodificacion especulativa. La fidelidad resultante se documenta como KL(source ‖ this) de 0,1146 nats sobre el primer token a vocabulario completo en 100 prompts inocuos, frente a 0,0244 del W8A8; es decir, el coste de bajar a 4 bits multiplica por ~4,7 la divergencia, y supera incluso la divergencia introducida por la propia abliteracion respecto al Swift original (0,0763).

## Capacidades

- Generacion de texto conversacional en modo chat, con pipeline declarado `conversational`.
- Procesamiento de imagen y texto (`image-text-to-text`), gracias a la torre de vision, que se mantiene sin cuantizar.
- Razonamiento y generacion de codigo y matematicas, segun los conjuntos de evaluacion usados por el autor (prompts concatenados de codigo y matematicas, estilo HumanEval).
- Decodificacion especulativa con el drafter DFlash2, con longitudes de aceptacion medidas de 3,7 a 3,9.
- Salida multimodal de imagen en entrada; no se documenta generacion de imagen.
- Cabeza MTP presente en el checkpoint (sin cuantizar), aunque la model card no describe su uso en inferencia.
- No se documenta soporte explicito de tool calling ni de function calling.
- No se documenta soporte de agentes ni de razonamiento multi-paso mas alla del propio modo de cadena de pensamiento.
- Capacidades multilingues: no disponible.
- Modo "sin censura": el modelo no aplica moderacion de contenido y el autor declara 0/100 rechazos duros, con una banda de desvio via cadena de pensamiento del 20-24 %.

## Casos de uso

- Investigacion sobre cuantizacion extrema: comparar la divergencia KL de un build W4A16 sin rotacion frente a su equivalente W8A8 y al BF16 de origen, usando los 100 prompts de evaluacion y la metrica de primer token a vocabulario completo.
- Investigacion sobre decodificacion especulativa: estudiar por que un drafter entrenado sobre estados no rotados (DFlash2) falla con checkpoints rotados y funciona con este, midiendo longitud de aceptacion por nivel de concurrencia.
- Estudios de alineacion y seguridad: analizar el comportamiento de un modelo con el alineamiento eliminado (tasa de rechazo, desvio via cadena de pensamiento del 20-24 %), siempre en entorno controlado y con fines de investigacion.
- Despliegue interactivo de un solo usuario: con 19 GB de pesos y decodificacion de 154 tok/s a concurrencia 1, es adecuado para asistentes de codigo locales donde prima la latencia percibida sobre el throughput agregado.
- Procesamiento de documentos con imagen: al conservar la torre de vision sin cuantizar, puede emplearse en tareas de image-text-to-text como interpretacion de capturas, diagramas o figuras dentro de un pipeline de investigacion.
- Evaluacion comparativa de kernels: medir el coste del camino de dequantizacion INT4 a bf16 de Marlin frente a las GEMM INT8 nativas de CUTLASS, usando la relacion de prefill observada (~0,52x).
- Pruebas de capacidad de contexto largo: con `--max-model-len 32768` y cache KV en `fp8_e4m3`, sirve para experimentos de prompts largos, teniendo en cuenta que el TTFT crece linealmente al encolar peticiones largas.
- Referencia de fidelidad de cuantizacion: usar el KL de 0,1146 como cota practica de lo que se puede degradar un modelo al pasar de 8 a 4 bits en este esquema.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. Los unicos datos de rendimiento son medidas de servicio (`vllm bench serve`, TP=1, KV `fp8_e4m3`, planificacion asincrona, drafter DFlash2 con `num_speculative_tokens=7`, sobre una GPU CMP 170HX de 64 GB):

| Concurrencia | Prefill (tok/s entrada) | Decodificacion (tok/s salida) | TTFT p50 | TPOT p50 | Longitud de aceptacion DFlash2 |
|---|---|---|---|---|---|
| 1 | 1.762 | 154,1 | 10,5 s | 5,7 ms | 3,74 |
| 2 | 1.778 | 236,3 | 20,0 s | 7,2 ms | 3,71 |
| 4 | 1.760 | 352,6 | 41,3 s | 8,9 ms | 3,75 |
| 8 | 1.749 | 478,7 | 83,7 s | 12,8 ms | 3,87 |
| 16 | 1.746 | 570,1 | 169 s | 21,1 ms | 3,86 |
| 32 | 1.751 | 578,4 | 338 s | 35,9 ms | 3,80 |

Notas del autor sobre estas cifras: el prefill se satura en torno a 1.750 tok/s con prompts realistas de ~16k tokens (concatenacion de codigo y matematicas) y no escala con la concurrencia, mientras que con prompts sinteticos aleatorios si escala; la decodificacion se satura por encima de c≈16 (570 a 578 tok/s). En modo greedy mono-stream sobre prompts de codigo estilo HumanEval (`code88`, temperatura 0, k=7) se miden 58,9 % de tasa de aceptacion, longitud 5,12 y 168 tok/s. Fidelidad: KL(source ‖ this) = 0,1146 nats frente a 0,0244 del W8A8.

## Requisitos de hardware

- VRAM para los pesos: 19 GB en INT4 (el repositorio ocupa 19,5 GB). Hay que anadir la cache KV; el autor sirve con `fp8_e4m3` y 32.768 tokens de contexto sobre una GPU de 64 GB.
- GPU validada por el autor: una CMP 170HX de 64 GB, TP=1. Se declara soporte para GPUs de clase Ampere (SM 8.0), requisito del kernel Marlin.
- Cabe en GPU de consumo: no documentado por el autor. Como estimacion a partir del tamano de los pesos (19 GB), encajaria en GPUs de 24 GB o mas, pero no hay ninguna medicion publicada en esa configuracion y la cache KV a 32k tokens consume VRAM adicional.
- Opciones de despliegue: vLLM con los parches `dflash2` (validado en 0.27.1). La version upstream 0.29.0 falla con `'QKVParallelLinear' object has no attribute 'weight'` porque el drafter DFlash2 tambien es W4A16. No se documenta soporte para llama.cpp, Ollama ni TGI.
- Latencia y throughput medidos: TTFT p50 de 10,5 s a c=1 con prompts de ~16k tokens de entrada; TPOT p50 de 5,7 ms a c=1 y 35,9 ms a c=32; decodificacion de 154,1 tok/s a c=1 y 578,4 tok/s a c=32; prefill de ~1.750 tok/s independiente de la concurrencia.
- Memoria liberada frente al hermano W8A8: 11 GB, aprovechables para cache KV.

## Comparativa con modelos similares

Los unicos puntos de comparacion documentados son los propios miembros de la familia. No se dispone de datos frente a modelos externos.

| Modelo | Tamano | Prefill | Decodificacion c=1 | Decodificacion c=32 | KL vs BF16 | Licencia / disponibilidad |
|---|---|---|---|---|---|---|
| Este build (W4A16) | 19 GB | ~1.750 tok/s | 154 tok/s | 578 tok/s | 0,1146 | apache-2.0, uso solo investigacion |
| Hermano SmoothQuant W8A8 INT8 | 30 GB | ~3.350 tok/s | 73 tok/s | 840 tok/s | 0,0244 | apache-2.0, mismo autor |
| Fuente BF16 (Swift-Qwen3.8-27b-heretic) | 52 GB | no disponible | no disponible | no disponible | referencia | apache-2.0 |
| Drafter DFlash2 (Qwen3.8-27B-DFlash2) | no disponible | no disponible | no disponible | no disponible | no aplica | repositorio incoai |

Criterio de eleccion segun el autor: para uso interactivo con concurrencia baja (c ≤ 4) este build ofrece hasta 2,2x el throughput de decodificacion del W8A8; para lote o alta concurrencia (c ≥ 16), trabajo con prefill intensivo o contexto largo, el W8A8 es preferible.

## Limitaciones y advertencias

- El alineamiento de seguridad ha sido eliminado deliberadamente: el modelo intentara cumplir peticiones daninas, peligrosas, ilegales o poco eticas que el modelo base rechaza, y no aplica moderacion de contenido. El autor lo marca explicitamente como artefacto de investigacion y se ha de tratar como tal.
- Se miden 0/100 rechazos duros y una banda de desvio via cadena de pensamiento del 20-24 %, heredada sin cambios del modelo fuente.
- La cuantizacion INT4 introduce una divergencia (KL 0,1146 nats) superior a la que introduce la propia abliteracion respecto al Swift original (0,0763); en este checkpoint, la cuantizacion perturba el modelo mas que la eliminacion del alineamiento.
- Las cifras de KL de las dos fichas (W4A16 y W8A8) no son directamente comparables: la del W8A8 se midio servida en vLLM (top-512, 0,0117) y la equivalente no se ha ejecutado para este build.
- Riesgo de alucinacion: no evaluado en la informacion disponible.
- Idiomas soportados: no disponible.
- La licencia declarada es Apache 2.0, pero el autor anade un descargo de responsabilidad y restringe el uso a fines de investigacion; conviene revisar la compatibilidad con uso comercial antes de cualquier despliegue en produccion.
- Dependencia de un vLLM parcheado: la version upstream 0.29.0 no funciona con este checkpoint por el drafter DFlash2 cuantizado. Esto limita la portabilidad a stacks estandar.
- El prefill no escala con la concurrencia (saturacion en ~1.750 tok/s con cargas realistas) y el TTFT crece linealmente con la cola de peticiones largas: inadecuado para escenarios con muchos prompts largos simultaneos.
- La decodificacion se satura por encima de c≈16, por lo que no aporta ventaja en despliegues de alta concurrencia.
- Discrepancia no explicada entre el nombre del repositorio ("27b") y el recuento real de parametros en safetensors (6.260.690.960).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/akumaburn/Swift-Qwen3.8-27b-heretic-W4A16
- Modelo base (BF16, heretic): https://huggingface.co/akumaburn/Swift-Qwen3.8-27b-heretic
- Hermano SmoothQuant W8A8 INT8: https://huggingface.co/akumaburn/Swift-Qwen3.8-27b-heretic-SmoothQuant-W8A8-INT8
- Drafter especulativo DFlash2: https://huggingface.co/incoai/Qwen3.8-27B-DFlash2
- No se han encontrado papers, blogs ni repositorios adicionales en la busqueda web realizada (los resultados devueltos corresponden a paginas genericas de Google y no son relevantes).
