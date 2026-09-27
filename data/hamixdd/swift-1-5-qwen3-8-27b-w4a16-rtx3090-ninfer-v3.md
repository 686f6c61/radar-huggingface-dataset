# hamixdd/Swift-1.5-Qwen3.8-27B-W4A16-RTX3090-NInfer-v3

## Resumen

Swift-1.5-Qwen3.8-27B es un ajuste fino sobre la base Qwen3.8-27B, publicado por el usuario hamixdd como artefacto autocontenido para el motor de inferencia NInfer. Se distribuye en un unico fichero `.ninfer` de 20,4 GB que integra los pesos cuantizados a W4A16 (4 bits en pesos, 16 bits en activaciones), la torre de vision para entrada multimodal, una cabeza de prediccion multi-token (MTP) y un componente de decodificacion especulativa DFlash2. El objetivo declarado es ejecutar un modelo de clase 27B con capacidades multimodales en una sola GPU de consumo, la NVIDIA RTX 3090 (24 GB, Ampere sm_86).

El modelo resuelve el problema de desplegar un modelo grande con contexto largo en hardware limitado. La cuantizacion groupwise W4A16 junto con la decodificacion especulativa permite mantener el artefacto en 20,4 GB y operar con una ventana de contexto configurada de 172.032 tokens, segun los ajustes de referencia del autor. Su relevancia actual es acotada: se trata de un artefacto de nicho, muy reciente y ligado al ecosistema del motor NInfer, no a los formatos habituales como safetensors, GGUF o AWQ.

En el momento de la consulta el repositorio no registra descargas ni likes, y el propio autor lo presenta como un artefacto de inferencia mas que como un modelo con validacion externa. La licencia es Apache-2.0 y el unico idioma declarado es el ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con torre de vision para entrada multimodal; base Qwen3.8-27B (detalles internos de la arquitectura no disponibles) |
| Parametros totales | ~27B (segun la denominacion del modelo y la base declarada) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 172.032 tokens (segun la configuracion de referencia del artefacto) |
| Tipos de cuantizacion | W4A16 groupwise (`grouped_absmax`); mezcla por tensor de `q4_g64_fp16`, `q5` y `q8`; embeddings en q4 |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | `.ninfer` (artefacto autocontenido del motor NInfer; no safetensors ni GGUF) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna de la base Qwen3.8-27B ni el proceso de ajuste fino que da lugar a Swift-1.5. Lo que si se describe es la composicion del artefacto: pesos completos cuantizados a W4A16 con esquema `grouped_absmax`, torre de vision para entrada multimodal, una cabeza MTP (multi-token prediction) con su correspondiente draft head, un componente DFlash2 heredado del modelo NInfer Qwen3.8-27B original, una cabeza de propuesta especifica de Swift en q4 con una lista corta (`shortlist`) de 131.000 tokens derivada de un corpus de frecuencias, y una plantilla de chat `qwen3_8.jinja`. El repositorio incluye ademas un manifiesto de conversion (`conversion.json`, 538 KB) con el origen, metodo, formato y layout de cada peso.

En cuanto a innovaciones tecnicas, el artefacto combina tres mecanismos: cuantizacion W4A16 con mezcla de precisiones por tensor, prediccion multi-token (MTP) y decodificacion especulativa DFlash2 con K=7 y draft head. No se proporcionan datos sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo RLHF o DPO. Tampoco se confirma si el ajuste fino partio de un checkpoint instruct o base.

## Capacidades

- Generacion de texto en ingles.
- Entrada multimodal con vision: la torre de vision viene incluida en el artefacto y se activa con el flag `--vision` (residencia `overlay`, `vision-max-merged 2048`).
- Generacion de codigo: el propio autor menciona la generacion de codigo en la comparativa A/B, con velocidad de decodificacion y aceptacion de DFlash2 ligeramente superiores a la base.
- Decodificacion especulativa acelerada: MTP mas DFlash2 con draft head y K=7.
- Contexto largo: hasta 172.032 tokens en la configuracion de referencia.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponibles en la informacion proporcionada.
- Capacidades multilingues: solo se declara ingles (`en`).
- Modo de razonamiento explicito (thinking mode): no disponible en la informacion proporcionada.

## Casos de uso

- Analisis de documentos con imagenes en local: al integrar torre de vision y una ventana de 172.032 tokens, el modelo puede procesar capturas, diagramas o paginas escaneadas junto a texto largo en una unica RTX 3090, sin depender de servicios en la nube.
- Generacion de codigo en estacion de trabajo: el autor reporta que la generacion de codigo sale ligeramente por delante de la base en velocidad de decodificacion, lo que lo hace adecuado para autocompletado y refactorizacion en un flujo local sobre GPU de consumo.
- Asistente tecnico sobre repositorios largos: con 172.032 tokens de contexto es posible cargar fragmentos extensos de codigo o documentacion y mantener conversaciones multi-turno sin truncar.
- Procesamiento por lotes de imagenes con descripcion textual: clasificacion, etiquetado o generacion de descripciones sobre lotes de imagenes, aprovechando la entrada multimodal y el prefill con cuBLAS en chunks de 4096.
- Evaluacion de cuantizacion W4A16 en Ampere: sirve como artefacto de referencia para medir la perdida de calidad de la cuantizacion groupwise frente a la base en sm_86.
- Despliegue de un endpoint local para prototipado: mediante `ninfer-serve.exe` con concurrencia 1 y 4 slots de estado en host, se puede exponer un servicio HTTP en `127.0.0.1:8080` para pruebas internas.
- Investigacion sobre decodificacion especulativa: la combinacion MTP mas DFlash2 con draft head y shortlist de 131.000 tokens permite estudiar tasas de aceptacion y aceleracion en GPUs Ampere.

## Benchmarks y rendimiento

La informacion disponible solo incluye una comparativa A/B cualitativa frente a la base Qwen3.8-27B sobre una RTX 3090. El autor afirma que no hay una perdida significativa al aplicar el artefacto Swift y que, en generacion de codigo, la velocidad de decodificacion y la aceptacion de DFlash2 son ligeramente superiores. No se publican cifras concretas.

| Prueba | Resultado |
|---|---|
| A/B frente a Qwen3.8-27B base (RTX 3090) | Sin perdida significativa; en generacion de codigo, velocidad de decodificacion y aceptacion DFlash2 ligeramente superiores |
| MMLU | no disponible |
| HumanEval | no disponible |
| GSM8K | no disponible |
| Throughput / tokens por segundo | no disponible |
| Tasa de aceptacion DFlash2 (valor numerico) | no disponible |

No se han publicado resultados de benchmarks numericos en la informacion disponible.

## Requisitos de hardware

- VRAM: el artefacto ocupa 20,4 GB, por lo que encaja en los 24 GB de una RTX 3090 dejando margen para cache KV. La configuracion de referencia reserva `host-kv-mib 8192` y `kv-capacity 172032`.
- GPU objetivo: NVIDIA RTX 3090 (Ampere sm_86). El artefacto esta explicitamente ajustado a esta arquitectura.
- Otras GPU: no disponible. No se documenta compatibilidad con Ada, Hopper ni con GPUs AMD.
- GPU de consumo: si, cabe en RTX 3090. No se confirma su funcionamiento en GPUs con menos de 24 GB.
- Motor de despliegue: NInfer (`ninfer-serve.exe`), version v3 del formato de artefacto. No se menciona soporte para vLLM, llama.cpp, Ollama o TGI, dado que el formato `.ninfer` es propietario del motor.
- Opciones de ejecucion destacadas: `--spec dflash2`, `--draft-tokens 7`, `--lm-head-draft`, `--embedding-q4`, `--gdn-state-fp16`, `--prefill-cublas --prefill-chunk 4096`, `--vision --vision-residency overlay --vision-max-merged 2048`, `--max-concurrency 1`, `--max-pending-requests 16`, `--host-state-slots 4`.
- Latencia y throughput: no disponibles. Solo se indica cualitativamente que la generacion de codigo es algo mas rapida que la base.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Swift-1.5-Qwen3.8-27B (NInfer v3) | ~27B | 172.032 tokens (config. de referencia) | W4A16 groupwise | en | Apache-2.0 | Artefacto `.ninfer` para motor NInfer |
| Qwen3.8-27B (base) | ~27B | no disponible | no disponible | no disponible | no disponible | Base de referencia; resultados A/B citados por el autor |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos suficientes para establecer una comparativa cuantitativa con otras alternativas de la misma categoria.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles. El autor no documenta evaluaciones de sesgo.
- Riesgo de alucinacion: no cuantificado. Al ser un ajuste fino sin datos publicos de evaluacion, no hay evidencia sobre su tasa de alucinacion.
- Idiomas: solo se declara ingles (`en`). El uso en castellano u otros idiomas no esta soportado explicitamente.
- Perdida por cuantizacion: los pesos estan cuantizados a W4A16 con mezcla q4/q5/q8 por tensor, lo que puede degradar la calidad respecto a la base en precision completa, aunque el autor afirma que la perdida no es significativa.
- Dependencia del motor: el artefacto solo funciona con NInfer. No es portable a vLLM, llama.cpp, Ollama u otros runners, lo que limita su integracion en produccion.
- Hardware: ajustado a Ampere sm_86. No se garantiza su funcionamiento en otras arquitecturas de GPU.
- Validacion externa: cero descargas y cero likes en el momento de la consulta; sin replicaciones independientes de los resultados.
- Fecha de publicacion: los metadatos indican creacion y actualizacion en septiembre de 2026, con una ventana de cambios de unos once minutos, lo que sugiere un artefacto recien generado.
- Uso comercial: la licencia Apache-2.0 lo permite, pero se desconoce el regimen de licencia de la base Qwen3.8-27B subyacente y de los componentes DFlash2 y de la torre de vision, que podrian imponer condiciones adicionales.

## Enlaces

- HuggingFace: https://huggingface.co/hamixdd/Swift-1.5-Qwen3.8-27B-W4A16-RTX3090-NInfer-v3
- Repositorio del motor NInfer para RTX 3090: https://github.com/ashalliants/ninfer-3090
- Fichero del artefacto: `Swift-1.5-Qwen3.8-27b.ninfer` (20,4 GB, `artifact_id b851593f9f184b9895de7d85990b9a7f`)
- Manifiesto de conversion: `Swift-1.5-Qwen3.8-27b.ninfer.conversion.json` (538 KB)
- Paper, blog o demo adicionales: no disponibles
