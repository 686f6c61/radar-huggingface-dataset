# loom-draft/unsloth-Inkling-2-Mini-GGUF-loop-loom

## Resumen

Inkling-2-Mini es un modelo de lenguaje publicado por unsloth en formato GGUF, con una cuantizacion UD-Q4_K_XL. Este repositorio concreto, `loom-draft/unsloth-Inkling-2-Mini-GGUF-loop-loom`, no contiene pesos nuevos ni un fine-tune del modelo: es un paquete de despliegue para el ecosistema Loom de AMD, generado con la herramienta loom-next a partir del checkpoint original sin modificar. Incluye programas `.loom` y una tarjeta `model.json` que permiten servir el modelo en GPUs AMD concretas mediante `loom-serve`, con una API compatible con OpenAI.

El interes practico del paquete esta en que adapta el GGUF de Inkling-2-Mini a dos aceleradores AMD: el Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y la Radeon AI PRO R9700 (gfx1201, 32 GB). Incorpora decodificacion especulativa DFlash con profundidad 3 activada por defecto, un modo de razonamiento siempre activo con niveles de esfuerzo configurables y una ventana de contexto de 254.976 tokens por peticion. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y su tamano declarado es de 0,0 GB, lo que sugiere que los artefactos no estan materializados en el repo o que la metadata no refleja su contenido real.

La relevancia de esta ficha es acotada: no documenta un modelo nuevo, sino un artefacto de empaquetado y serving. La informacion disponible sobre el modelo subyacente (parametros totales, datos de entrenamiento, benchmarks) no aparece en la model card, y las mediciones de rendimiento del propio paquete figuran como "not yet re-measured" en ambas GPUs.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo subyacente); el paquete es un artefacto de despliegue Loom para GGUF |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 254.976 tokens por peticion |
| Tipos de cuantizacion | UD-Q4_K_XL (unica variante empaquetada; el repo base de unsloth ofrece GGUF) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (`Inkling-2-Mini-UD-Q4_K_XL.gguf`) empaquetado como programa `.loom` + `model.json` |
| Tokens maximos de salida | 4.096 (preset `max_tokens`) |
| Concurrencia | 4 peticiones simultaneas |
| Decodificacion especulativa | DFlash, profundidad 3, activada por defecto; drafter: unsloth/Inkling-2-Mini-GGUF |
| Niveles de reasoning effort | minimal, low, medium, high, xhigh, max (por defecto high) |
| GPUs objetivo | AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151); AMD Radeon AI PRO R9700 (gfx1201, 32 GB) |
| API | OpenAI-style `/v1/chat/completions` |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura del modelo subyacente Inkling-2-Mini: la model card de este repositorio describe unicamente el empaquetado para Loom y no detalla si se trata de un transformer denso, un MoE o una arquitectura hibrida, ni el numero de parametros, tokens de entrenamiento o composicion del dataset. Tampoco se documenta si hubo RLHF, DPO u otra fase de alineamiento.

La innovacion tecnica documentada pertenece al runtime, no al modelo: el paquete genera kernels especificos para gfx1151 y gfx1201 mediante loom-next, soporta decodificacion especulativa DFlash con profundidad 3 (con la salida identica a la de la decodificacion sin especulacion, segun el gate `spec` previsto), y ofrece un modo de razonamiento siempre activo con seis niveles de esfuerzo. El paquete incluye ademas un conjunto de gates de correccion (kernel_tests, golden, compare, vision, consistency, spec, agent, agent_think_off, sampling, logits, decision) definidos en `gates.sh` de loom-benchmark, aunque todos figuran como "not yet re-measured" para ambas GPUs.

## Capacidades

- Generacion de texto y razonamiento con modo "thinking" siempre activo y esfuerzo configurable mediante `reasoning_effort`.
- Servicio HTTP con API compatible con OpenAI (`/v1/chat/completions`), lo que facilita la integracion con clientes y SDK existentes.
- Decodificacion especulativa DFlash de profundidad 3 activada por defecto, pensada para reducir la latencia de generacion en las GPUs AMD soportadas.
- Contexto largo de 254.976 tokens por peticion, adecuado para documentos extensos o historiales de conversacion largos.
- Concurrencia de hasta 4 peticiones simultaneas.
- Entrada de imagen: el modelo upstream la soporta, pero Loom no la implementa en este paquete (marcado como no soportado).
- Tool calling: marcado como "not applicable" en la tabla de features del paquete, aunque los gates `agent` y `agent_think_off` sugieren que el benchmark de referencia contempla bucles de tool calling multi-turno.
- Audio: no aplicable.
- Muestreo (temperature, top_k, seed): estado "not determined" en la model card.

## Casos de uso

- Despliegue local en estaciones de trabajo con Ryzen AI Max+ 395: el paquete permite servir Inkling-2-Mini en un equipo Strix Halo con un unico comando `loom-fetch` seguido de `loom-serve`, sin depender de CUDA ni de toolchains propietarias.
- Servicio en servidores con Radeon AI PRO R9700: el preset `chat-r9700` esta ajustado a los 32 GB de memoria de esa tarjeta, lo que permite atender hasta 4 peticiones concurrentes con contexto largo en un nodo AMD.
- Procesamiento de documentos extensos: con 254.976 tokens de contexto por peticion, el modelo puede ingerir contratos, informes o bases de codigo completas en una sola llamada, siempre que el preset de memoria fijo (`--pool_backing=fixed`) se dimensione adecuadamente.
- Sustitucion de backends CUDA por AMD en pipelines internos: al exponer una API compatible con OpenAI, cualquier cliente que ya apunte a `/v1/chat/completions` puede redirigirse a `loom-serve` cambiando la URL base, lo que simplifica migraciones parciales a hardware AMD.
- Evaluacion comparativa de runtimes: los gates de correccion (golden, compare, logits, spec) permiten verificar que la salida del paquete coincide token a token con la referencia de llama.cpp sobre el mismo GGUF, util para validar una plataforma antes de adoptarla en produccion.
- Experimentacion con razonamiento graduado: los seis niveles de `reasoning_effort` permiten ajustar el coste computacional por consulta, desde `minimal` para respuestas rapidas hasta `max` para tareas que requieren cadenas de razonamiento largas.
- Inferencia acelerada por especulacion: DFlash con profundidad 3 esta activo por defecto, de modo que las cargas interactivas (chat, autocompletado) se benefician sin configuracion adicional, a costa de memoria para el drafter.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que los resultados de rendimiento frente a llama.cpp para este paquete "are not yet re-measured" tanto en Strix Halo (gfx1151) como en Radeon AI PRO R9700 (gfx1201). Del mismo modo, todos los gates de correccion figuran como "not yet re-measured" en ambas GPUs, por lo que no hay evidencia registrada de que la salida coincida con la referencia de llama.cpp.

## Requisitos de hardware

- GPU objetivo: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) o AMD Radeon AI PRO R9700 (gfx1201, 32 GB de VRAM).
- VRAM estimada: no disponible de forma explicita; el preset de R9700 esta disenado para 32 GB, y el paquete usa `--pool_backing=fixed`, que reserva el pool de memoria por adelantado.
- GPUs NVIDIA (A100, H100, RTX 4090): no soportadas por este paquete, que genera kernels para arquitecturas AMD gfx1151 y gfx1201.
- Cabe en GPU de consumo: parcialmente; Strix Halo es un SoC con memoria unificada y la R9700 es una GPU de estacion de trabajo de 32 GB, no una tarjeta de consumo convencional.
- Despliegue: `pipx install "hrx-loom[hf]==0.2.0"`, seguido de `loom-fetch` y `loom-serve`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI en este paquete; llama.cpp se usa unicamente como referencia de correccion.
- Latencia y throughput: no disponibles; no se han publicado mediciones para este paquete.
- Parametros de servicio relevantes: `completion_spin_ns=4294967295` activa espera activa de finalizaciones de GPU (consume CPU mientras hay trabajo en vuelo); `--parameter_mode=preload` solo afecta a la carga de pesos en host.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos de parametros, contexto ni rendimiento de modelos comparables, y el propio modelo subyacente carece de especificaciones publicadas en esta ficha. Como referencia de categoria, el unico artefacto relacionado identificable es el checkpoint base `unsloth/Inkling-2-Mini-GGUF`, del que este repositorio es un empaquetado para Loom sin modificacion de pesos.

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| loom-draft/unsloth-Inkling-2-Mini-GGUF-loop-loom | no disponible | 254.976 tokens | MIT | GGUF empaquetado en `.loom` | Paquete de serving para AMD gfx1151/gfx1201 |
| unsloth/Inkling-2-Mini-GGUF | no disponible | no disponible | no disponible | GGUF | Checkpoint base sin modificar |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | Sin datos en la informacion proporcionada |

## Limitaciones y advertencias

- Este repositorio no es un modelo nuevo ni un fine-tune: es un paquete de despliegue generado con loom-next sobre el GGUF original. Cualquier limitacion del modelo subyacente se hereda sin cambios.
- Cero evidencia de correccion registrada: todos los gates (kernel_tests, golden, compare, spec, agent, sampling, logits, etc.) figuran como "not yet re-measured" en ambas GPUs, por lo que no hay validacion publicada frente a llama.cpp.
- Sin mediciones de rendimiento: no se han publicado cifras de latencia ni throughput para este paquete, de modo que no puede compararse con llama.cpp en terminos cuantitativos.
- Cobertura de hardware muy restringida: solo gfx1151 (Strix Halo) y gfx1201 (R9700). No funciona en GPUs NVIDIA ni en otras arquitecturas AMD sin regenerar el paquete.
- Entrada de imagen no soportada en Loom, aunque el modelo upstream la admite; quien necesite vision debe usar otro runtime.
- Tool calling marcado como "not applicable" en la tabla de features, lo que limita su uso en pipelines de agentes pese a que existan gates de agente en el benchmark de referencia.
- Muestreo sin determinar: el comportamiento de temperature, top_k y seed no esta documentado como verificado.
- Concurrencia limitada a 4 peticiones simultaneas y salida maxima de 4.096 tokens por peticion, lo que puede ser insuficiente para cargas de generacion larga.
- Repositorio sin adopcion: 0 descargas y 0 likes, con fecha de creacion y actualizacion separadas por dos segundos, lo que indica publicacion automatizada sin validacion de la comunidad.
- Licencia MIT declarada, permisiva para uso comercial, pero conviene verificar la licencia del checkpoint base antes de redistribuir, ya que la model card no la detalla.
- El aviso de la model card sobre el contenido citado es relevante: parte del texto del README esta truncado y no debe interpretarse como documentacion completa.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/loom-draft/unsloth-Inkling-2-Mini-GGUF-loop-loom
- Checkpoint base: https://huggingface.co/unsloth/Inkling-2-Mini-GGUF
- Runtime Loom (ROCm/hrx-system): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Ecosistema Loom: https://loom-fun.github.io/loom-dev/

Nota: los resultados de busqueda web obtenidos corresponden a Loom (herramienta de grabacion de pantalla), Loom (marca de ropa) y el articulo de Wikipedia sobre el telar, y no guardan relacion con el ecosistema Loom de AMD ni con el modelo. Se han descartado por no ser relevantes.
