# loom-draft/calcuis-pig-encoder-loom

## Resumen

`loom-draft/calcuis-pig-encoder-loom` es un paquete de despliegue en formato Loom (programas `.loom` y una tarjeta `model.json`) para el checkpoint GGUF `calcuis/pig-encoder`, concretamente el fichero `llava_llama3_encoder-q4_k_m.gguf` sin modificar. Lo publica el usuario `loom-draft` y esta pensado para ejecutarse sobre GPUs AMD: el Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y la Radeon AI PRO R9700 (gfx1201, 32 GB). El paquete se genero con `loom-next`, el generador del ecosistema Loom, sin intervencion de un LLM en el proceso.

No se trata de un modelo nuevo ni de un fine-tune con pesos propios: es un artefacto de empaquetado y compilacion que traduce un GGUF preexistente a programas ejecutables por el runtime `loom-serve` (instalable via `hrx-loom[hf]==0.2.0`). Su relevancia es de infraestructura, no de modelado: permite servir el encoder multimodal de `pig-encoder` en hardware AMD con una API compatible con OpenAI (`/v1/chat/completions`), sin depender de llama.cpp en tiempo de ejecucion.

La ficha tecnica del modelo subyacente (`calcuis/pig-encoder`) no esta detallada en la informacion disponible; los datos que siguen corresponden a lo que declara la model card del paquete Loom. El prefijo `llava_llama3_encoder` sugiere una arquitectura de tipo LLaVA con encoder visual y backbone Llama 3, pero el numero de parametros, el contexto de entrenamiento y los idiomas no se especifican.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el nombre del GGUF, `llava_llama3_encoder`, sugiere LLaVA con backbone Llama 3; sin confirmar) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | 8.192 tokens por peticion (limite del preset Loom) |
| Tipos de cuantizacion | Q4_K_M (unico checkpoint empaquetado) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF de origen, empaquetado como programas `.loom` y `weights.loom` |
| Modelo base | `calcuis/pig-encoder` |
| Runtime | `hrx-loom[hf]==0.2.0` (`loom-fetch`, `loom-serve`) |
| Concurrencia | 4 peticiones simultaneas |
| Maximo de tokens de salida | 4.096 (preset `max_tokens`) |
| Hardware objetivo | AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y Radeon AI PRO R9700 (gfx1201, 32 GB) |
| Fecha de publicacion | 2026-11-26 |

## Arquitectura y entrenamiento

El paquete no incluye entrenamiento propio: hereda los pesos del GGUF `llava_llama3_encoder-q4_k_m.gguf` de `calcuis/pig-encoder`, cuantizado en Q4_K_M. La aportacion de `loom-draft` es la generacion, mediante `loom-next`, de kernels y programas `.loom` que ejecutan ese mismo grafo en GPUs AMD a traves de `loom-serve`. La model card indica explicitamente que el generador opera "solo, sin LLM en el bucle", es decir, que la traduccion del checkpoint a programas Loom es automatica y determinista a partir de la configuracion (`llm_config.json`).

El paquete incluye artefactos de verificacion (`info.json`, `REPORT.md`, `model.json.lock` con hashes sha256 de los ficheros fuente) y un conjunto de puertas de correccion (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `agent_think_off`, `sampling`, `logits`, `decision`) que comparan la salida contra una referencia de llama.cpp sobre el mismo GGUF. En la version publicada, ninguna de esas puertas tiene medicion registrada: todas figuran como "not yet re-measured" en ambas GPUs. Tampoco hay datos de rendimiento re-medidos frente a llama.cpp para este paquete concreto.

## Capacidades

- Servidor HTTP con API compatible con OpenAI: endpoint `/v1/chat/completions` con cuerpo JSON estandar (`model`, `messages`).
- Generacion de texto por chat multi-turno dentro de la ventana de 8.192 tokens por peticion.
- Concurrencia de hasta 4 peticiones simultaneas, con una puerta de consistencia definida (misma salida en concurrencia que en ejecucion aislada), aunque sin evidencia registrada todavia.
- Entrada de imagen: el campo figura como "?" (no determinado) en la tabla de caracteristicas; la puerta `vision` esta definida pero sin medicion.
- Tool calling: no aplicable segun la model card.
- Razonamiento o modo thinking: no aplicable.
- Decodificacion especulativa: no aplicable.
- Entrada o salida de audio: no determinado.
- Muestreo (temperature, top_k, seed): no determinado en la tabla de caracteristicas, aunque existe una puerta `sampling` definida.

## Casos de uso

- Despliegue de inferencia en hardware AMD sin CUDA: el paquete permite servir el GGUF de `pig-encoder` en Strix Halo o Radeon AI PRO R9700 mediante `loom-serve`, evitando la pila CUDA y usando el runtime Loom sobre ROCm.
- Sustitucion de llama.cpp en produccion: al exponer una API compatible con OpenAI, un servicio existente puede apuntar a `http://127.0.0.1:8080/v1/chat/completions` cambiando solo la URL base, sin reescribir el cliente.
- Evaluacion de la cadena de herramientas Loom: util para equipos que quieran medir la fidelidad de los kernels generados por `loom-next` frente a la referencia de llama.cpp usando las puertas `golden`, `compare` y `logits`.
- Prototipado de asistentes conversacionales en estaciones de trabajo AMD: con 8.192 tokens de contexto y 4 peticiones concurrentes, sirve para demos internas y pruebas de integracion en un solo equipo con GPU Radeon.
- Pruebas de regresion de cuantizacion: al fijar `--pool_backing=fixed` y `--parameter_mode=preload`, se puede reproducir el mismo entorno de memoria y comparar salidas token a token contra el checkpoint original.
- Validacion de pipelines multimodales: si la puerta `vision` llega a registrarse, el paquete permitiria comparar la entrada de imagen contra llama.cpp con el mismo proyector, util para auditar encoders visuales en hardware AMD.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card declara explicitamente que, tanto en Strix Halo (gfx1151) como en Radeon AI PRO R9700 (gfx1201), "the results for this package are not yet re-measured", y que todas las puertas de correccion figuran como "not yet re-measured". No hay cifras de MMLU, HumanEval, GSM8K ni de throughput o latencia.

## Requisitos de hardware

- GPU objetivo declaradas: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB de VRAM).
- VRAM estimada: no disponible; depende del tamano del checkpoint Q4_K_M, que no se especifica en la informacion proporcionada.
- GPUs consumer: no se indica compatibilidad con GPUs de consumo distintas de las dos plataformas AMD listadas.
- Despliegue: `pipx install "hrx-loom[hf]==0.2.0"`, seguido de `loom-fetch huggingface:loom-draft/calcuis-pig-encoder-loom:chat --materialize=copy --output=pig-encoder` y `loom-serve --model=pig-encoder '--device=amdgpu://?completion_spin_ns=4294967295' --pool_backing=fixed --parameter_mode=preload`.
- Opciones de runtime: `completion_spin_ns=4294967295` activa espera activa de finalizaciones en GPU (consume CPU mientras hay trabajo en vuelo); `--pool_backing=fixed` reserva el pool de memoria por adelantado; `--parameter_mode=preload` solo cambia la carga de pesos en host.
- Latencia y throughput: no disponibles; no se han re-medido para este paquete.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| `loom-draft/calcuis-pig-encoder-loom` | no disponible | 8.192 tokens | MIT | `.loom` + GGUF de origen | Paquete Loom para AMD gfx1151 y gfx1201; sin benchmarks ni puertas registradas |
| `calcuis/pig-encoder` (modelo base) | no disponible | no disponible | no disponible | GGUF (`llava_llama3_encoder-q4_k_m.gguf`) | Checkpoint original; el paquete Loom lo referencia sin modificar |
| llama.cpp sobre el mismo GGUF | no disponible | no disponible | MIT (llama.cpp) | GGUF | Referencia de correccion usada por las puertas de Loom; ejecutable en multiples backends |

No se dispone de datos de rendimiento comparables entre estas opciones en la informacion proporcionada.

## Limitaciones y advertencias

- Ausencia total de evidencia de correccion: las once puertas (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `agent_think_off`, `sampling`, `logits`, `decision`) figuran como "not yet re-measured" en ambas GPUs. No hay garantia publicada de que la salida coincida con llama.cpp.
- Sin mediciones de rendimiento: no se puede afirmar que el paquete sea mas rapido o mas lento que llama.cpp en el mismo hardware.
- Capacidades multimodales sin confirmar: la entrada de imagen aparece como "?" y la puerta `vision` no tiene registro; no debe asumirse soporte visual en produccion.
- Tool calling, razonamiento y decodificacion especulativa declarados como "no aplicable": no apto para flujos de agentes que dependan de function calling.
- Contexto limitado a 8.192 tokens por peticion y salida maxima de 4.096 tokens, insuficiente para documentos largos o conversaciones muy extensas.
- Concurrencia maxima de 4 peticiones: no disenado para alta carga sin escalado horizontal.
- Idiomas soportados no declarados: riesgo de comportamiento irregular fuera del idioma o idiomas de entrenamiento del modelo base.
- Dependencia de una version concreta del runtime (`hrx-loom[hf]==0.2.0`) y de las GPUs AMD listadas; no se documenta compatibilidad con otras plataformas.
- Licencia MIT declarada por el publicador del paquete, pero la licencia del checkpoint base `calcuis/pig-encoder` no se detalla en la informacion disponible; conviene verificarla antes de uso comercial.
- Riesgo de alucinacion y sesgos: no evaluados ni documentados para este paquete ni para el modelo base en la informacion proporcionada.
- Cero descargas y cero likes en Hugging Face en el momento de la consulta: sin validacion por parte de la comunidad.

## Enlaces

- Paquete en Hugging Face: https://huggingface.co/loom-draft/calcuis-pig-encoder-loom
- Modelo base: https://huggingface.co/calcuis/pig-encoder
- Repositorio del runtime Loom (ROCm): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Web del ecosistema Loom: https://loom-fun.github.io/loom-dev/
