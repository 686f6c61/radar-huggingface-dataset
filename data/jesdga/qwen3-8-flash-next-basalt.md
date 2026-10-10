# jesdga/Qwen3.8-Flash-Next-Basalt

## Resumen

Qwen3.8-Flash-Next-Basalt es un repositorio de artefactos de inferencia publicado por el usuario jesdga que empaqueta el modelo de mezcla de expertos (MoE) Qwen3.8-Flash-Next en el formato propietario `.basalt` del motor Basalt. No es un fine-tune con pesos nuevos: el propio autor lo describe como los archivos de modelo para Basalt, un motor de inferencia local derivado (fork) de Strata y orientado a un escenario muy concreto, Linux x86-64 con GPU NVIDIA Blackwell (sm_120) y CUDA 13.

El objetivo de Basalt es ejecutar un MoE grande en una única estación de trabajo: mantiene en VRAM los expertos más usados, deja el resto en RAM del sistema, admite una segunda tarjeta como "peer expert tier" y expone una API compatible con OpenAI y Anthropic. Cada archivo `.basalt` es autocontenido e incluye pesos, tokenizer, plantilla de chat, drafter MTP, perfil de expertos, copias de hiper-conexión en 8 bits y proyector de visión.

El repositorio ocupa 552,3 GB e incluye varios packs cuantizados (GSQ-RCO Q2_0, IQ3_XXS e IQ3_S, entre otros), un kit de conversión desde GGUF y un drafter MTP afinado por autodestilización. La relevancia práctica está en las cifras declaradas por el autor: 299-354 tokens/s en un solo flujo sobre RTX 5090 más RTX 5060 Ti, y 7.317-7.368 tokens/s de prefill a 64k de contexto. Los archivos del modelo quedan bajo la Qwen Community License 1.0, mientras que el motor Basalt es MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE); numero de capas, atencion y configuracion interna: no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens segun la configuracion de ejemplo del autor (`max-context: 262144`); no se documenta el contexto nativo del modelo base |
| Tipos de cuantizacion | GSQ-RCO Q2_0, GSQ-RCO IQ3_XXS, GSQ-RCO IQ3_S; comparativas UD-Q2_K_XL, UD-IQ3_XXS, UD-Q3_K_XL, UD-Q4_K_XL y Q8_0 (referencia). KV cache en int8 |
| Idiomas soportados | no disponible |
| Licencia | Archivos del modelo: Qwen Community License 1.0 (`license: other`, `license_name: qwen-community-1.0`). Motor Basalt: MIT |
| Formato de pesos | `.basalt` (contenedor autocontenido) y GGUF como entrada del kit de conversion |
| Modelo base | Qwen/Qwen3.8-Flash-Next |
| Tamano del repositorio | 552,3 GB |
| Publicacion / actualizacion | 2026-10-06 / 2026-10-10 |
| Hardware objetivo | Linux x86-64, GPU NVIDIA Blackwell (compute capability 12.0), CUDA 13 |
| Servidor / API | `bin/basalt serve`; API compatible con OpenAI y Anthropic; `--parallel 1..8` |
| Descargas / likes | 4 / 0 |

## Arquitectura y entrenamiento

El modelo subyacente es un MoE (tag `moe`, `base_model: Qwen/Qwen3.8-Flash-Next`), pero la informacion proporcionada no detalla numero de capas, dimension oculta, numero de expertos ni regimen de atencion, por lo que esos datos quedan como no disponibles. Lo que si se documenta es la capa de decodificacion especulativa: Basalt usa un drafter MTP (multi-token prediction) con `spec: 7` y `spec-min-p: 0.5`, y un subconjunto de vocabulario propio (`draft_vocab.bin`) que la cabeza draft propone. Cada token se decide en la fase de verificacion, por lo que, segun el autor, el drafter no altera la salida.

En los packs IQ3_S, IQ3_XXS y Q2_0 la capa MTP va afinada por autodestilizacion sobre la propia salida del modelo para elevar la tasa de aceptacion del draft; los packs Q4_K_XL y Q8_0 conservan la capa MTP original. El repositorio incluye ademas un `profile.bin` con cada par (capa, experto) ordenado por frecuencia de enrutado, que es lo que permite decidir que expertos residen en VRAM y cuales en RAM, y copias de hiper-conexion en 8 bits. No hay informacion sobre el dataset de entrenamiento, el numero de tokens ni si hubo RLHF o DPO.

## Capacidades

- Generacion de texto en tres regimenes medidos por el autor: prosa, chat y salida estructurada (structured).
- Salida estructurada con mayor throughput que la prosa (665 tokens/s frente a 354 en IQ3_XXS), adecuada para generacion de JSON y esquemas.
- Vision: el contenedor incluye el proyector de vision `mmproj-Qwen3.8-Flash-Next-BF16.gguf`, por lo que el modelo procesa imagen ademas de texto. No se publican evaluaciones de calidad de vision.
- Decodificacion especulativa con drafter MTP afinado y verificacion token a token.
- Servidor con API compatible con OpenAI y Anthropic, lo que permite reutilizar clientes y SDK existentes.
- Concurrencia por lotes con `--parallel` (1 a 8 peticiones simultaneas, contexto compartido entre ellas).
- Cache de contexto en int8 y contexto configurable hasta 262.144 tokens.
- Soporte de tool calling / function calling: no documentado explicitamente en la informacion disponible.
- Modo de razonamiento explicito (thinking): no disponible.
- Capacidades multilingues: no disponible, no se declara lista de idiomas.

## Casos de uso

- Inferencia local de un MoE grande en una sola estacion de trabajo: con una RTX 5090 y los expertos no residentes en RAM del sistema, se ejecuta el modelo sin depender de un clúster multi-GPU, algo que otros runners no resuelven con este tamano de pesos.
- Sustitucion de endpoints en la nube: al exponer una API compatible con OpenAI y Anthropic, un equipo puede redirigir su cliente existente al servidor local (`127.0.0.1:8080`) sin reescribir codigo ni SDK.
- Analisis de documentos largos: la configuracion admite 262.144 tokens de contexto con KV en int8, util para revisar repositorios completos, expedientes o contratos extensos en una sola pasada.
- Generacion de codigo y datos estructurados en pipelines: el regimen "structured" alcanza 665 tokens/s (IQ3_XXS), lo que permite encadenar validacion de esquemas y generacion de salidas machine-readable en herramientas internas de CI/CD.
- Procesamiento de imagenes en local: gracias al proyector de vision incluido, se pueden montar tareas de OCR, extraccion de tablas o descripcion de capturas sin enviar datos a terceros.
- Servicio para equipos pequenos: con `--parallel 4` u 8 el throughput agregado en prosa sube de 338 a 504-623 tokens/s (IQ3_S), suficiente para un grupo reducido de usuarios concurrentes.
- Laboratorio de investigacion sobre enrutado MoE: el kit `convert/` y `profile.bin` permiten convertir cualquier GGUF del modelo a `.basalt` y estudiar la distribucion de frecuencia por experto.
- Despliegue con presupuesto energetico acotado: todas las cifras publicadas se miden con el limite de potencia de GPU fijado en 400 W.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, MT-Bench, etc.) en la informacion disponible. Los unicos datos son mediciones del propio autor, realizadas con `basalt-bench --quality` sobre 20 fragmentos de wikitext-2 de 512 tokens, evaluados a traves de la ruta de decodificacion y comparados contra la referencia Q8_0 (menor KLD y mayor coincidencia top-1 indican mayor fidelidad).

| Modelo / pack | Origen | Fichero | Expertos | PPL | KLD medio | Coincidencia top-1 |
|---|---|---:|---:|---:|---:|---:|
| GSQ-RCO Q2_0 | ISTA-DASLab | 64,9 GiB | 31,6 GiB | 2,971 | 0,486 | 80,6% |
| GSQ-RCO IQ3_XXS | ISTA-DASLab | 74,4 GiB | 40,0 GiB | 2,535 | 0,277 | 86,8% |
| GSQ-RCO IQ3_S | ISTA-DASLab | 81,0 GiB | 46,8 GiB | 2,387 | 0,177 | 89,4% |
| UD-Q2_K_XL | Unsloth | 76,5 GiB | 42,9 GiB | 2,755 | 0,323 | 84,3% |
| UD-IQ3_XXS | Unsloth | 79,4 GiB | 45,3 GiB | 2,564 | 0,244 | 87,0% |
| UD-Q3_K_XL | Unsloth | 86,8 GiB | 52,0 GiB | 2,457 | 0,160 | 89,3% |
| UD-Q4_K_XL | Unsloth | 106,7 GiB | 71,7 GiB | 2,321 | 0,068 | 93,0% |
| Q8_0 | Unsloth | 178,3 GiB | 119,5 GiB | 2,282 | referencia | - |

Mediciones de velocidad declaradas (limite de GPU 400 W, RTX 5090 + RTX 5060 Ti como peer expert tier, 32 GB de RAM, Ryzen 9 9950X):

| Pack | Prosa (tok/s) | Structured (tok/s) | Chat (tok/s) |
|---|---:|---:|---:|
| GSQ-RCO IQ3_XXS | 354 | 665 | 433 |
| GSQ-RCO IQ3_S | 299 | 595 | 348 |

Prefill a 64k de contexto: 7.317 tokens/s (IQ3_XXS) y 7.368 tokens/s (IQ3_S). Concurrencia con `--parallel` en IQ3_S, throughput total de prosa: 1 usuario 338 tokens/s, 2 usuarios 432, 4 usuarios 504, 8 usuarios 623.

## Requisitos de hardware

- Sistema operativo y plataforma: Linux x86-64 exclusivamente; no se documenta soporte para Windows, macOS ni ARM.
- GPU: NVIDIA Blackwell con compute capability 12.0 y CUDA 13. Una RTX 5090 es el minimo declarado; una segunda tarjeta puede actuar como "peer expert tier".
- VRAM: no se publica un minimo cerrado. Los expertos ocupan 31,6 GiB (Q2_0), 40,0 GiB (IQ3_XXS), 46,8 GiB (IQ3_S) y hasta 119,5 GiB en Q8_0; los que no caben en VRAM residen en RAM del sistema.
- RAM del sistema: 32 GB en la configuracion de prueba; en la practica debe dimensionarse segun los expertos que no queden residentes en VRAM.
- CPU de referencia en las mediciones: Ryzen 9 9950X. Fijado de 400 W de potencia de GPU en todas las cifras de velocidad.
- No cabe en GPU de consumo de gama media; el autor solo garantiza la ruta Blackwell sm_120.
- Opciones de despliegue: motor Basalt compilado desde el repositorio `jesdga95/basalt` (`bin/basalt serve --config basalt_config.json`). No se documenta despliegue con vLLM, llama.cpp, Ollama ni TGI para los ficheros `.basalt`; el GGUF solo se usa como entrada del conversor (`tools/convert/convert.py`).
- Latencia y throughput: los de las tablas anteriores (299-665 tokens/s por flujo segun regimen y pack; 7.317-7.368 tokens/s de prefill a 64k; 623 tokens/s agregados con 8 usuarios en IQ3_S).
- API: servidor en `127.0.0.1:8080` por defecto; se recomienda no exponerlo fuera de la maquina sin `--api-key`.

## Comparativa con modelos similares

No se dispone de datos de otros modelos de la misma categoria (MoE de gran tamano) en la informacion proporcionada, por lo que la comparacion se limita al motor del que deriva Basalt y a los packs cuantizados equivalentes.

Comparacion de motores, misma maquina (RTX 5090 + RTX 5060 Ti, 32 GB RAM, Ryzen 9 9950X, un solo flujo):

| Motor | Prosa (tok/s) | Structured (tok/s) | Chat (tok/s) | Prefill (tok/s) |
|---|---:|---:|---:|---:|
| Basalt (IQ3_S) | 299 | 595 | 348 | 7.368 |
| Strata (motor de origen del fork) | 166 | 254 | 205 | 4.615 |

Comparacion de packs frente a alternativas GGUF del mismo modelo:

| Aspecto | Basalt (GSQ-RCO IQ3_S) | Unsloth UD-Q3_K_XL | Q8_0 |
|---|---:|---:|---:|
| Tamano de fichero | 81,0 GiB | 86,8 GiB | 178,3 GiB |
| Expertos | 46,8 GiB | 52,0 GiB | 119,5 GiB |
| PPL (wikitext-2) | 2,387 | 2,457 | 2,282 |
| KLD medio vs Q8_0 | 0,177 | 0,160 | referencia |
| Coincidencia top-1 | 89,4% | 89,3% | - |
| Formato | `.basalt` | GGUF | GGUF |
| Drafter MTP afinado | Si (autodestilizacion) | No aplica | No aplica |

## Limitaciones y advertencias

- Requisitos de hardware muy restrictivos: solo Linux x86-64 con GPU Blackwell (sm_120) y CUDA 13. No hay ruta documentada para Ampere, Ada, Hopper ni aceleradores no NVIDIA.
- Adopcion minima y sin validacion independiente: 4 descargas y 0 likes en la fecha de los datos; todas las cifras de velocidad y calidad las publica el propio autor.
- Perdida de fidelidad en cuantizaciones bajas: el pack Q2_0 presenta KLD medio 0,486 y solo un 80,6% de coincidencia top-1 frente a Q8_0; para tareas sensibles conviene IQ3_S o superior.
- Ausencia total de benchmarks de capacidad: no hay MMLU, HumanEval, GSM8K ni evaluaciones de vision, tool calling o agentes.
- Idiomas soportados: no disponibles; no se puede garantizar calidad fuera del ingles sin datos adicionales.
- Sesgos: no se han publicado evaluaciones de sesgo en la informacion disponible.
- Riesgo de alucinacion: no cuantificado; al ser un modelo generativo de gran tamano y sin evaluaciones publicadas, conviene validar las salidas en produccion.
- Licencia: los pesos estan bajo la Qwen Community License 1.0, no bajo MIT. El motor es MIT, pero eso no cubre los archivos del modelo; hay que revisar `LICENSE` antes de cualquier uso comercial.
- La mejora del drafter MTP por autodestilizacion y su neutralidad sobre la salida son afirmaciones del autor no verificadas por terceros.
- Superficie de seguridad: el servidor escucha en `127.0.0.1` por defecto; exponerlo a red requiere `--api-key` explicita.
- Las cifras de rendimiento dependen de una configuracion concreta (400 W de limite, dos GPU distintas, 32 GB de RAM) y no son extrapolables a otros equipos.
- Los tags del repositorio referencian dos identificadores arXiv (2604.18556 y 2605.00649), pero no se incluye informacion sobre su contenido en los datos disponibles.
- Este repositorio no es un fine-tune: quien busque pesos nuevos o ajuste de comportamiento debe tener en cuenta que se trata de artefactos de inferencia sobre el modelo base.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jesdga/Qwen3.8-Flash-Next-Basalt
- Repositorio del motor Basalt: https://github.com/jesdga95/basalt
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- GGUF GSQ-RCO de ISTA-DASLab: https://huggingface.co/ISTA-DASLab/Qwen3.8-Flash-Next-GSQ-RCO-GGUF
- GGUF de Unsloth: https://huggingface.co/unsloth/Qwen3.8-Flash-Next-GGUF
- Licencia (fichero en el repositorio): LICENSE
- Referencias arXiv presentes en los tags: https://arxiv.org/abs/2604.18556 y https://arxiv.org/abs/2605.00649 (sin informacion adicional en los datos proporcionados)
