# loom-draft/bartowski-Tesslate_OmniCoder-9B-loom

## Resumen

`loom-draft/bartowski-Tesslate_OmniCoder-9B-loom` es un paquete de despliegue en formato Loom (programas `.loom` y una tarjeta `model.json`) generado a partir del checkpoint GGUF sin modificar `bartowski/Tesslate_OmniCoder-9B-GGUF`, concretamente la cuantizacion `Tesslate_OmniCoder-9B-Q4_K_M.gguf`. Lo publica el usuario `loom-draft` y esta orientado a dos aceleradores AMD concretos: el Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y la Radeon AI PRO R9700 (gfx1201, 32 GB). El paquete se genero con `loom-next`, el generador del ecosistema Loom, sin intervencion de un LLM en el bucle.

El modelo subyacente es un OmniCoder de 9B parametros, segun se deduce del propio nombre del checkpoint; la model card no detalla la arquitectura interna, los datos de entrenamiento ni los idiomas. La relevancia de esta publicacion no esta en el modelo en si, sino en el runtime: Loom es un stack de inferencia para GPUs AMD que compila kernels propios y expone una API compatible con OpenAI, con soporte declarado de tool calling, modo de razonamiento y una ventana de contexto de 262.144 tokens por peticion.

En el momento de redactar esta ficha el repositorio tiene 0 descargas, 0 likes y un tamano de 0.0 GB, y las mediciones de rendimiento y las puertas de correccion (`kernel_tests`, `golden`, `compare`, etc.) figuran como "not yet re-measured" para ambos aceleradores. Debe tratarse, por tanto, como un artefacto de borrador sin validacion publicada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo subyacente OmniCoder de 9B; la model card no detalla la arquitectura) |
| Parametros totales | 9B (segun el nombre del checkpoint; no confirmado en la model card) |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens por peticion |
| Tipos de cuantizacion | Q4_K_M (unico checkpoint incluido en el paquete) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (`Tesslate_OmniCoder-9B-Q4_K_M.gguf`) empaquetado en formato Loom (`.loom` + `model.json`) |

## Arquitectura y entrenamiento

La model card no aporta informacion sobre la arquitectura del transformer subyacente, el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de alineacion como RLHF o DPO. El unico dato estructural disponible es el del runtime: el paquete Loom incluye programas compilados (`program/*.loom`) y un fichero `weights.loom`, y `loom-fetch` verifica los sha256 de los ficheros fuente fijados en `model.json.lock`.

A nivel de innovacion tecnica, el elemento diferencial es el propio stack Loom: kernels generados especificamente para gfx1151 y gfx1201, un pool de memoria de respaldo fijo (`--pool_backing=fixed`) o elastico, precarga de parametros en host (`--parameter_mode=preload`) y espera activa de finalizacion en GPU (`completion_spin_ns=4294967295`). La decodificacion especulativa figura como "not applicable" y el ajuste de esfuerzo de razonamiento tambien.

## Capacidades

- Generacion de texto y codigo: el checkpoint es un OmniCoder, orientado a tareas de programacion, aunque la model card no detalla tareas concretas.
- Tool calling: soporte de `tools` y `tool_calls` en estilo OpenAI a traves de la API `/v1/chat/completions`.
- Modo de razonamiento (thinking): activado por defecto; se desactiva con `chat_template_kwargs: {"enable_thinking": false}`.
- Contexto largo: 262.144 tokens por peticion, adecuado para documentos extensos o historiales de conversacion largos.
- Concurrencia: 4 peticiones simultaneas declaradas.
- Limite de salida: 4.096 tokens por respuesta (preset `max_tokens`).
- Entrada de imagen: no soportada por Loom, aunque el modelo original la tenga.
- Entrada y salida de audio: no aplicable.
- Sampling: estado "not determined" en la model card; no hay confirmacion de que temperatura, top_k y semilla se comporten de forma verificada.

## Casos de uso

- Asistencia de programacion en local sobre GPU AMD: el paquete esta pensado para servir el modelo en una estacion de trabajo con Strix Halo o R9700 y consumirlo mediante la API compatible con OpenAI, sin depender de servicios en la nube.
- Agentes de codigo con tool calling: el soporte de `tools`/`tool_calls` y las puertas `agent` y `agent_think_off` del benchmark interno apuntan a bucles multi-turno de invocacion de herramientas, utiles para tareas de refactorizacion o consulta de repositorios.
- Analisis de documentos largos: con 262.144 tokens de contexto se pueden procesar bases de codigo, expedientes o manuales completos en una sola peticion, siempre que se acepte el limite de 4.096 tokens de salida.
- Razonamiento paso a paso con thinking activado: para problemas de matematicas o depuracion compleja donde interese una cadena de razonamiento explicita, activando el modo por defecto y desactivandolo en tareas de baja latencia.
- Despliegue en hardware AMD de consumo profesional: la R9700 de 32 GB y el Ryzen AI Max+ 395 permiten ejecutar un 9B en Q4_K_M en una unica GPU o APU, lo que facilita prototipos y entornos de desarrollo sin GPUs NVIDIA.
- Evaluacion de runtimes alternativos: util para comparar el rendimiento y la fidelidad de Loom frente a llama.cpp sobre el mismo GGUF, mediante las puertas `golden`, `compare` y `logits` cuando se publiquen resultados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que las mediciones de rendimiento para Strix Halo (gfx1151) y Radeon AI PRO R9700 (gfx1201) "are not yet re-measured", y todas las puertas de correccion (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `agent_think_off`, `sampling`, `logits`, `decision`) figuran como "not yet re-measured" en ambas plataformas.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; un 9B en Q4_K_M ocupa del orden de 5-6 GB de pesos, pero la model card no confirma la huella total con el pool de Loom.
- GPU soportadas oficialmente: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- GPU de consumo: el paquete no declara soporte para GPUs NVIDIA ni para Radeon de gama consumer distintas de las listadas; no se confirma compatibilidad con RTX 4090 u otras.
- Despliegue: `pipx install "hrx-loom[hf]==0.2.0"`, seguido de `loom-fetch` y `loom-serve` con los flags `--device=amdgpu://?completion_spin_ns=4294967295`, `--pool_backing=fixed` y `--parameter_mode=preload`.
- Servidor: API OpenAI-style en `http://127.0.0.1:8080/v1/chat/completions`, con 4 peticiones concurrentes y 4.096 tokens maximos de salida.
- Latencia y throughput: no disponibles; las cifras de rendimiento frente a llama.cpp no se han vuelto a medir.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos de rendimiento ni especificaciones detalladas de modelos alternativos de la misma categoria, y el paquete es un artefacto de despliegue especifico de Loom mas que un checkpoint comparable de forma directa.

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Tesslate_OmniCoder-9B (Loom, Q4_K_M) | 9B | 262.144 | Apache 2.0 | GGUF + Loom | Solo AMD gfx1151 y gfx1201; sin benchmarks publicados |
| Alternativas de 9B | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Ausencia total de validacion publicada: todas las puertas de correccion y las mediciones de rendimiento figuran como no re-medidas, por lo que no hay evidencia de que la salida coincida con la referencia de llama.cpp.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la ficha, con un tamano de 0.0 GB que sugiere que los pesos pueden no estar materializados en el repo.
- Hardware muy restringido: solo se declara compatibilidad con Strix Halo (gfx1151) y Radeon AI PRO R9700 (gfx1201); no hay soporte indicado para NVIDIA ni para otras Radeon.
- Entrada de imagen deshabilitada en Loom aunque el modelo original la soporte, lo que limita casos de uso multimodales.
- Sampling sin determinar: el comportamiento de temperatura, top_k y semilla no esta verificado, lo que es un riesgo para reproducibilidad en produccion.
- Sin datos de sesgos, alucinacion o cobertura idiomatica: la model card no aporta informacion sobre composicion del dataset ni evaluaciones de seguridad.
- Licencia Apache 2.0 permite uso comercial, pero al ser un paquete derivado de un GGUF de terceros conviene verificar la licencia y las condiciones del checkpoint base `bartowski/Tesslate_OmniCoder-9B-GGUF` antes de desplegarlo.
- El limite de 4.096 tokens de salida puede ser insuficiente para generacion de codigo extensa o respuestas largas, a pesar del contexto de 262.144 tokens.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/loom-draft/bartowski-Tesslate_OmniCoder-9B-loom
- Checkpoint base GGUF: https://huggingface.co/bartowski/Tesslate_OmniCoder-9B-GGUF
- Repositorio del runtime Loom (ROCm): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Sitio del ecosistema Loom: https://loom-fun.github.io/loom-dev/
