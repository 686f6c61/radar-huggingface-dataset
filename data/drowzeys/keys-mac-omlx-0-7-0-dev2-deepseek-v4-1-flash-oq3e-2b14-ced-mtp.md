# drowzeys/keys-Mac-oMLX-0.7.0.dev2-DeepSeek-V4.1-Flash-oQ3e-2b14-CED-MTP

## Resumen

Este repositorio es una requantizacion del checkpoint `Jundot/DeepSeek-V4.1-Flash-oQ3e-mtp`, que a su vez es una version cuantizada del modelo DeepSeek-V4.1-Flash de DeepSeek-AI, un MoE de 763.000 millones de parametros. El objetivo del autor, `drowzeys`, no es mejorar la calidad del modelo sino hacerlo caber y ejecutarse de forma estable en una unica maquina Apple Silicon: un Mac Studio M3 Ultra con 256 GB de memoria unificada (identificador Mac15,14). El checkpoint original dejaba 239,04 GiB de pesos residentes frente a 238,42 GiB de RAM utilizable, es decir, no entraba ni siquiera con el offload de expertos a SSD activado.

Para resolverlo, esta version requantiza 14 de las 40 capas MoE, pasando sus expertos enrutados de `affine 3-bit` a `affine 2-bit` con `group_size 64`. El resultado libera 22,15 GiB y deja 217,77 GB de pesos residentes, con margen de trabajo real. Se conservan intactos el drafter DSpark MTP y las capas criticas para la atencion dispersa y las tablas Engram. El modelo se sirve exclusivamente con el runtime oMLX 0.7.0.dev2 sobre MLX 0.32.2, y no es un checkpoint portable a otras pilas de inferencia.

Es relevante ahora porque demuestra que un modelo de escala frontier (763B, atencion dispersa CSA2, enrutado `sqrtsoftplus`, tablas Engram de n-gramas) puede servirse en local sobre hardware de escritorio de gama alta, a costa de una receta de cuantizacion muy especifica y de una configuracion de sistema obligatoria. El registro acumula 0 descargas y 0 likes, y no declara licencia ni idiomas soportados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con atencion dispersa CSA2, enrutado `sqrtsoftplus`, tablas Engram de n-gramas y drafter DSpark MTP |
| Parametros totales | 763.000 millones (763B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Mezcla de `affine 3-bit` y `affine 2-bit` con `group_size 64`; 14 de 40 capas MoE requantizadas de 3-bit a 2-bit (capas 7, 15, 19, 21, 22, 23, 25, 26, 27, 29, 30, 31, 33 y 34) |
| Idiomas soportados | no disponible (la model card no declara idiomas) |
| Licencia | no disponible |
| Formato de pesos | MLX (repositorio de 309 GB); no se especifica en la informacion disponible si se usa safetensors |
| Tamano del repositorio | 309 GB, de los cuales 231,1 GiB son byte a byte identicos al checkpoint base de Jundot |
| Pesos residentes | 217,77 GB |
| Runtime | oMLX 0.7.0.dev2 (commit `395ec2fd`), MLX 0.32.2 |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de DeepSeek-V4.1-Flash: un transformer con mezcla de expertos (MoE) de 763B parametros que incorpora atencion dispersa CSA2, una tabla de n-gramas denominada Engram, enrutado con funcion `sqrtsoftplus` y un drafter de decodificacion especulativa DSpark MTP. El autor de este repositorio no ha entrenado ni ajustado el modelo: su aportacion consiste exclusivamente en una requantizacion de precision mixta y en una bateria de mediciones sobre el runtime.

La seleccion de que capas degradar es estructural, no numerica. El dano medido en coseno de pesos al pasar de 3-bit a 2-bit es practicamente plano en las 40 capas (dispersion de 0,0037), por lo que no sirve como criterio. Un intento previo que se guio por esa metrica incluyo las capas 28 y 32, que forman parte de `index_source_layer_ids` y generan las claves de indice para la atencion dispersa; la aceptacion del MTP se hundio del 84% al 58,5%. El autor excluye sistematicamente de toda cuantizacion por debajo de 3 bits las capas `kv_source_layer_ids`, `index_source_layer_ids`, `candidate_source_layer_id`, `engram_layer_ids`, `dspark_target_layer_ids`, la capa 0 y la capa n-1. Los pesos del drafter DSpark MTP se mantienen en su precision original, ya que un drafter degradado fue lo que arruino un checkpoint V4 de 2,4 bits anterior en tareas de codigo pese a ser 1,8 veces mas pequeno. No se dispone de informacion sobre volumen de tokens, composicion del dataset ni fases de RLHF o DPO para el modelo original.

## Capacidades

- Generacion de texto en modo `text-generation`, segun el pipeline declarado.
- Decodificacion especulativa mediante DSpark MTP, con tasa de aceptacion medida de aproximadamente 81-85% en codigo y 64% en prosa.
- Rendimiento notablemente superior en codigo que en prosa dentro de este build: 29,08 tok/s frente a 25,69 tok/s en flujo unico.
- Reutilizacion de prefijo para cargas de agente con prompts de sistema largos, que reduce una llamada con 15.688 tokens de contexto de 98,9 s a 6,6 s en caliente.
- Offload de las tablas Engram a NVMe sin paginacion de expertos (`deepseek_v41_expert_ssd_offload: false`).
- Prefill acelerado mediante kernels Metal personalizados de oMLX y prefill CED.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado explicitamente, aunque la model card menciona workloads de agente con prompts de sistema de gran tamano.
- Capacidades multilingues: no disponible.
- Capacidades especiales (modo thinking, vision, audio): no disponible.

## Casos de uso

- Inferencia local de un modelo de 763B en una sola maquina: el escenario central de este checkpoint es ejecutar DeepSeek-V4.1-Flash en un Mac Studio M3 Ultra de 256 GB sin depender de GPUs de datacenter ni de APIs externas.
- Generacion de codigo asistida en local: el build alcanza 29,08 tok/s en codigo y una aceptacion MTP del 81-85% en esa tarea, lo que lo hace apto para autocompletado y generacion de funciones en un flujo de trabajo individual, siempre con un unico usuario.
- Agentes con prompts de sistema largos y repetidos: gracias a la reutilizacion de prefijo del CLI de oMLX, un prompt de sistema de 15.688 tokens pasa de 98,9 s a 6,6 s, lo que hace viable mantener un agente con instrucciones extensas durante una sesion.
- Procesamiento de documentos extensos: con 551 tok/s de prefill sobre 1.893 tokens de entrada y un TTFT de 3,43 s, el modelo es adecuado para resumir o extraer informacion de documentos largos donde el coste dominante es la entrada, no la salida.
- Laboratorio de investigacion en cuantizacion: el repositorio documenta la receta completa (que capas degradar, por que criterio estructural, que capas nunca tocar) y sirve como caso de estudio reproducible sobre precision mixta en MoE.
- Evaluacion de decodificacion especulativa en Apple Silicon: las metricas de aceptacion MTP por tarea permiten medir el impacto real de un drafter preservado a precision original frente a uno cuantizado.
- Sustitucion de API en entornos con requisitos de privacidad: al ejecutarse en local, permite generar texto sobre datos sensibles sin enviarlos a un tercero, con la salvedad de que la licencia no esta declarada.
- Servicio interno para un unico usuario o pocos: la concurrencia satura en torno a 19,5 tok/s agregados independientemente del batch, de modo que solo tiene sentido como endpoint personal, no como servicio multiusuario.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. La model card unicamente proporciona mediciones de throughput y latencia sobre Mac15,14 / M3 Ultra / 256 GB / macOS 26.6.2, en flujo unico, con `max_tokens` de 256, temperatura 0 y medianas de 3 ejecuciones.

| Metrica | Baseline paginado 3-bit | Este build |
|---|---:|---:|
| Prosa (tok/s) | 15,45 | 25,69 |
| Codigo (tok/s) | 10,18 | 29,08 |
| Prefill, 1.893 tokens (tok/s) | 227 | 551 |
| TTFT con 1.893 tokens (s) | 8,34 | 3,43 |
| Carga de agente, prompt de sistema de 15.688 tokens (s) | 98,9 | 6,6 en caliente (con reutilizacion de prefijo) |
| Aceptacion MTP, codigo | no disponible | ~81-85% |
| Aceptacion MTP, prosa | no disponible | ~64% |
| Concurrencia agregada (tok/s) | no disponible | ~19,5, saturada e independiente del batch |

La mejora de prefill se atribuye a los kernels Metal personalizados de oMLX (+52% de prefill, -34% de TTFT) y al prefill CED introducido en 0.7.0.dev2 (+45% de prefill, -31% de TTFT).

## Requisitos de hardware

- VRAM / memoria unificada: 217,77 GB de pesos residentes sobre una maquina de 256 GB. El checkpoint base requeria 239,04 GiB, por encima de los 238,42 GiB de RAM utilizable.
- Equipo objetivo: Mac Studio M3 Ultra de 256 GB (Mac15,14), macOS 26.6.2. No se documenta ningun otro equipo probado.
- GPU recomendadas: no aplica en el sentido habitual; MLX requiere Apple Silicon. No hay ruta CUDA documentada en esta ficha.
- Compatibilidad con GPU de consumo: no. No cabe en ninguna GPU consumer actual, y el runtime es especifico de Apple Silicon.
- Ajuste obligatorio del sistema: hay que elevar el limite de memoria wired con `sudo sysctl iogpu.wired_limit_mb=253952`, ya que oMLX limita el prefill al 90% de ese valor y el ajuste de fabrica (249036) deja el tope en 218,4 GB, por debajo del modelo. Sin este cambio, el servidor rechaza todo prefill mostrando un error enganoso de "Context length exceeded" o muere con un SIGKILL silencioso. El ajuste no persiste tras reiniciar.
- Arranque: debe lanzarse con `python -m omlx.cli serve`. El modulo `python -m omlx.server` desactiva silenciosamente la cache (`oMLX cache disabled`) y ninguna variable de entorno lo corrige.
- Parametros de arranque relevantes: `--paged-ssd-cache-dir ~/kvcache --paged-ssd-cache-max-size 16GB --initial-cache-blocks 8 --memory-guard safe`. El valor por defecto de 256 bloques iniciales reserva demasiado y provoca SIGKILL durante la carga.
- Configuracion del modelo: `mtp_enabled: true`, `mtp_num_draft_tokens: 7`, `deepseek_v41_engram_ssd_offload: true`, `deepseek_v41_expert_ssd_offload: false`, `deepseek_v41_ced_prefill_enabled: true`.
- Opciones de despliegue alternativas: no disponible. No se documenta soporte para vLLM, llama.cpp, Ollama, TGI ni GGUF.
- Latencia y throughput: 25,69 tok/s en prosa, 29,08 tok/s en codigo, 551 tok/s de prefill sobre 1.893 tokens, TTFT de 3,43 s sobre esa misma entrada. La decodificacion no esta batcheada, por lo que el rendimiento agregado bajo concurrencia se mantiene en torno a 19,5 tok/s.
- Decodificacion especulativa: DSpark MTP con 7 tokens de borrador.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Pesos residentes | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `drowzeys/...-oQ3e-2b14-CED-MTP` (este) | 763B MoE | no disponible | 3-bit y 2-bit mixto, `group_size 64` | 217,77 GB | no disponible | MLX / oMLX sobre Apple Silicon |
| `Jundot/DeepSeek-V4.1-Flash-oQ3e-mtp` | 763B MoE | no disponible | `affine 3-bit` calibrado | 239,04 GiB | no disponible | Requiere Engram SSD offload; no cabe en 256 GB |
| `Jundot/DeepSeek-V4.1-Flash-oQ4e-mtp` | 763B MoE | no disponible | `oQ4e` (mayor precision que 3-bit) | no disponible en esta ficha | no disponible | Checkpoint de referencia de calidad, no orientado a caber en 256 GB |
| DeepSeek-V4.1-Flash (original, DeepSeek-AI) | 763B MoE | no disponible | Pesos completos | no disponible | no disponible | Requiere infraestructura de datacenter |

No se dispone de datos de benchmarks comparativos entre estos checkpoints, solo de las mediciones de throughput del build analizado frente al baseline paginado de 3 bits.

## Limitaciones y advertencias

- Licencia no declarada: la model card no especifica licencia, por lo que no puede asumirse uso comercial sin verificar la licencia del modelo base y del checkpoint de Jundot.
- Idiomas no declarados: no hay informacion sobre cobertura multilingue.
- Riesgo de degradacion por cuantizacion: 14 de 40 capas MoE tienen sus expertos enrutados a 2-bit. El autor justifica la seleccion por criterios estructurales, pero el impacto en calidad mas alla de la aceptacion MTP no esta cuantificado con benchmarks publicos.
- Riesgo de alucinacion: no evaluado en la informacion disponible.
- Sesgos: no documentados.
- Configuracion fragil del sistema: omitir el ajuste de `iogpu.wired_limit_mb` provoca errores enganosos de "Context length exceeded" o SIGKILL silencioso, sin mensaje claro de causa raiz.
- Dependencia del CLI: lanzar el servidor como modulo desactiva la cache de prefijo sin aviso, lo que degrada cargas de agente de 6,6 s a 98,9 s por llamada.
- Sin batching real: la decodificacion no esta batcheada y la concurrencia satura en torno a 19,5 tok/s, por lo que no es adecuado para servicio multiusuario.
- Rendimiento en prosa claramente inferior al de codigo, tanto en throughput como en aceptacion del drafter (64% frente a 81-85%).
- Dependencia de una unica pila de software: MLX y oMLX en versiones concretas (0.7.0.dev2, commit `395ec2fd`, MLX 0.32.2). No hay portabilidad documentada a otros runtimes.
- Contexto maximo no especificado: sin datos, no puede planificarse una carga con ventanas largas mas alla de los ejemplos medidos (1.893 y 15.688 tokens).
- Adopcion nula: 0 descargas y 0 likes en el momento del registro, sin comunidad que haya validado la receta de forma independiente.
- Dependencia de hardware muy concreto: las mediciones corresponden a un unico Mac15,14 con M3 Ultra y 256 GB.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/drowzeys/keys-Mac-oMLX-0.7.0.dev2-DeepSeek-V4.1-Flash-oQ3e-2b14-CED-MTP
- Repositorio GitHub con receta, parches, benchmarks y notas de servicio: https://github.com/drowzeys/keys-Mac-oMLX-0.7.0.dev2-DeepSeek-V4.1-Flash-oQ3e-2b14-CED-MTP
- Checkpoint base: https://huggingface.co/Jundot/DeepSeek-V4.1-Flash-oQ3e-mtp
- Checkpoint de referencia de mayor precision: https://huggingface.co/Jundot/DeepSeek-V4.1-Flash-oQ4e-mtp
- Runtime oMLX: https://github.com/jundot/omlx
- Pull request de oMLX con soporte de V4.1 Flash, MTP y offload de Engram: https://github.com/jundot/omlx/pull/3574
- Pull request de oMLX con prefill CED: https://github.com/jundot/omlx/pull/3607
- Pull request de oMLX con offload de expertos MoE: https://github.com/jundot/omlx/pull/2595
- Pull request de oMLX adicional: https://github.com/jundot/omlx/pull/3571
- Organizacion DeepSeek-AI en HuggingFace: https://huggingface.co/deepseek-ai
- Busqueda web: no se han encontrado enlaces relevantes; los resultados devueltos no guardan relacion con el modelo.
