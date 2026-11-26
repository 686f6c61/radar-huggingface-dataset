# loom-draft/bartowski-Yi-1.5-6B-Chat-loom

## Resumen

Este repositorio no contiene un modelo nuevo entrenado desde cero, sino un paquete de despliegue en formato Loom (`.loom`) generado a partir del checkpoint GGUF `Yi-1.5-6B-Chat-Q4_K_M.gguf` publicado por bartowski, que a su vez es una cuantizacion del modelo Yi-1.5-6B-Chat desarrollado por 01.AI. El paquete lo publica el usuario `loom-draft` y esta orientado a la ejecucion del modelo en GPU AMD concretas: el APU Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y la Radeon AI PRO R9700 (gfx1201, 32 GB). El objetivo es ofrecer una ruta de inferencia nativa en ROCm mediante el runtime `loom-serve`, con un servidor compatible con la API de OpenAI.

La relevancia de esta ficha es acotada: no aporta mejoras de calidad sobre el modelo original, sino un artefacto de empaquetado y ejecucion para hardware AMD. La model card no incluye resultados de rendimiento ni de correccion para este paquete en concreto: todas las tablas de gates de correccion y de comparacion frente a llama.cpp aparecen como "not yet re-measured". Ademas, la ventana de contexto configurada en el preset es de solo 4.096 tokens por peticion, muy por debajo de la ventana nativa del modelo base.

El modelo subyacente, Yi-1.5-6B-Chat, es un transformer denso de aproximadamente 6.000 millones de parametros, con licencia MIT en esta distribucion, y esta pensado para conversacion, generacion de texto y tareas de razonamiento e instrucciones en ingles y chino. Esta ficha describe el paquete Loom y las caracteristicas conocidas del modelo base, indicando explicitamente cuando un dato no esta disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (modelo base Yi-1.5-6B-Chat); paquete Loom con programas generados y pesos en GGUF |
| Parametros totales | Aproximadamente 6.000 millones (modelo base); no se detalla en la model card |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 4.096 tokens por peticion en el preset del paquete; contexto nativo del modelo base no disponible en la informacion proporcionada |
| Tipos de cuantizacion | Q4_K_M (unico checkpoint empaquetado) |
| Idiomas soportados | No disponible en la model card; el modelo base Yi-1.5 esta orientado a ingles y chino |
| Licencia | MIT |
| Formato de pesos | GGUF (`Yi-1.5-6B-Chat-Q4_K_M.gguf`) mas programas `.loom` (`program/*.loom`, `weights.loom`) |

Otros parametros operativos del preset: 4 peticiones concurrentes, `max_tokens` de 4.096, `pool_backing=fixed`, `parameter_mode=preload` y `completion_spin_ns=4294967295`.

## Arquitectura y entrenamiento

El modelo subyacente es Yi-1.5-6B-Chat, un transformer denso de la familia Yi-1.5 de 01.AI, afinado para conversacion. La model card de este repositorio no documenta la arquitectura interna, el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO; esa informacion corresponde a la documentacion oficial de 01.AI, no incluida aqui.

La innovacion de este paquete no esta en el modelo, sino en el runtime: `loom-next` genera programas `.loom` y kernels especificos para las GPU AMD objetivo a partir de la configuracion del modelo (`llm_config.json`), sin intervencion de un LLM en el bucle de generacion. El paquete incluye `model.json` y `model.json.lock` con los ficheros fuente fijados por hash sha256, que `loom-fetch` verifica durante la descarga. `loom-serve` expone un endpoint `/v1/chat/completions` compatible con OpenAI. El checkpoint GGUF no se modifica respecto al original de bartowski.

## Capacidades

- Generacion de texto conversacional multi-turno mediante API compatible con OpenAI.
- Razonamiento e instrucciones generales heredados del modelo base Yi-1.5-6B-Chat.
- Generacion de codigo y matematicas basicas, segun las capacidades del modelo base (no verificadas en esta model card).
- Servidor HTTP con `/v1/chat/completions`, con 4 peticiones concurrentes y hasta 4.096 tokens de salida por peticion.
- Tool calling: marcado como "not applicable" en la tabla de caracteristicas del paquete.
- Modo de razonamiento o thinking: "not applicable".
- Decodificacion especulativa: "not applicable".
- Entrada de imagen y audio: "not determined" (sin determinar).
- Muestreo (temperature, top_k, seed): "not determined" en la tabla de caracteristicas, aunque existe un gate de correccion `sampling` definido y pendiente de medicion.

## Casos de uso

- Prototipado de asistentes conversacionales en hardware AMD Strix Halo o R9700: el paquete permite levantar un endpoint compatible con OpenAI con dos comandos (`loom-fetch` y `loom-serve`), sin necesidad de compilar llama.cpp con soporte ROCm.
- Evaluacion de la cadena de herramientas Loom frente a llama.cpp: util para equipos que quieran comparar latencia y correccion en las mismas GPU, aunque las mediciones de este paquete aun no estan publicadas.
- Chatbots de soporte con turnos cortos: con 4.096 tokens de contexto por peticion y 4 peticiones concurrentes, encaja en escenarios de conversacion acotada, no en analisis de documentos largos.
- Generacion de texto y resumenes de fragmentos cortos en local: el checkpoint Q4_K_M reduce el peso en memoria y permite ejecucion en un APU con memoria unificada.
- Entornos de desarrollo y CI con GPU AMD: al fijar los ficheros por hash sha256 en `model.json.lock`, el despliegue es reproducible entre maquinas.
- Despliegue en estaciones de trabajo con Radeon AI PRO R9700 de 32 GB: el modelo Q4_K_M de 6B ocupa una fraccion pequena de la VRAM, dejando margen para otras cargas en la misma GPU.
- Experimentacion con cuantizacion Q4_K_M: sirve para medir la perdida de calidad frente al modelo en precision completa en tareas de chat, siempre que se ejecuten los gates de correccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card declara explicitamente que los resultados de rendimiento frente a llama.cpp para este paquete "are not yet re-measured" tanto en Strix Halo (gfx1151) como en Radeon AI PRO R9700 (gfx1201). Todas las puertas de correccion (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `agent_think_off`, `sampling`, `logits`, `decision`) figuran como "not yet re-measured" en ambas GPU, por lo que no hay evidencia registrada de correccion numerica ni de rendimiento.

## Requisitos de hardware

- VRAM estimada: un checkpoint Q4_K_M de 6B ocupa del orden de 3,5 a 4 GB de pesos; el preset reserva un pool de memoria fijo (`--pool_backing=fixed`) cuyo tamano exacto no se detalla en la model card. Con 4 peticiones concurrentes y 4.096 tokens de contexto, el consumo adicional de KV cache es moderado.
- GPU soportadas explicitamente: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- GPU consumer: no se documenta soporte para GPU consumer AMD ni NVIDIA en este paquete; el runtime es especifico de ROCm y de los objetivos indicados.
- Despliegue: `pipx install "hrx-loom[hf]==0.2.0"`, seguido de `loom-fetch huggingface:loom-draft/bartowski-Yi-1.5-6B-Chat-loom:chat --materialize=copy --output=yi-1.5-6b-chat` y `loom-serve --model=yi-1.5-6b-chat '--device=amdgpu://?completion_spin_ns=4294967295' --pool_backing=fixed --parameter_mode=preload`.
- Latencia y throughput: no disponibles; no se han publicado mediciones para este paquete.
- Alternativas de despliegue no cubiertas por este repositorio: al tratarse de un GGUF sin modificar, el checkpoint original de bartowski puede ejecutarse con llama.cpp u otros runtimes compatibles con GGUF, aunque esa ruta no forma parte de este paquete.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato / despliegue | Notas |
|---|---|---|---|---|---|
| bartowski/Yi-1.5-6B-Chat-GGUF (Q4_K_M) | ~6B | No disponible en la informacion proporcionada | MIT (segun este paquete) | GGUF, ejecutable con llama.cpp y runtimes compatibles | Checkpoint de origen, sin modificaciones; sirve de referencia para los gates `golden` y `compare` |
| loom-draft/bartowski-Yi-1.5-6B-Chat-loom | ~6B | 4.096 tokens por peticion en el preset | MIT | Paquete Loom (`.loom` + GGUF), runtime `loom-serve` | Objeto de esta ficha; sin mediciones publicadas |
| Yi-1.5-6B-Chat (original de 01.AI) | ~6B | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada | Pesos originales (safetensors, presumiblemente) | Modelo base del que deriva el GGUF; datos de entrenamiento y benchmarks no incluidos en esta busqueda |

No se dispone de datos de benchmarks ni de modelos comparables adicionales en la informacion proporcionada; no se incluyen cifras de rendimiento para evitar datos no verificados.

## Limitaciones y advertencias

- Ausencia total de evidencia de correccion: ningun gate (`golden`, `compare`, `consistency`, `sampling`, `logits`, etc.) tiene medicion registrada para este paquete, por lo que no se puede afirmar que la salida coincida con la de llama.cpp.
- Contexto muy reducido en el preset: 4.096 tokens por peticion, inferior a la ventana nativa del modelo base; no apto para documentos largos ni conversaciones extensas.
- Concurrencia limitada a 4 peticiones simultaneas.
- Tool calling, modo thinking y decodificacion especulativa marcados como "not applicable"; entrada de imagen y audio sin determinar.
- Idiomas no declarados en la model card; el modelo base Yi-1.5 esta orientado principalmente a ingles y chino, con soporte limitado de otros idiomas.
- Riesgo de alucinacion inherente a un modelo de 6B en tareas de conocimiento factual; no hay evaluaciones publicadas en este repositorio que lo cuantifiquen.
- Sesgos: no documentados en la informacion proporcionada.
- Licencia MIT declarada en el paquete; conviene verificar los terminos del modelo base Yi-1.5 de 01.AI antes de un uso comercial, ya que la model card no los reproduce.
- Dependencia de un runtime joven (`hrx-loom==0.2.0`) y de dos GPU AMD concretas; no hay soporte documentado para otras plataformas.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validacion por parte de la comunidad.
- Los resultados de busqueda web obtenidos corresponden a servicios no relacionados (Loom.com, Loom.fr, Wikipedia), por lo que no aportan informacion tecnica sobre este modelo.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/loom-draft/bartowski-Yi-1.5-6B-Chat-loom
- Modelo base GGUF: https://huggingface.co/bartowski/Yi-1.5-6B-Chat-GGUF
- Runtime Loom (ROCm): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Sitio del ecosistema Loom: https://loom-fun.github.io/loom-dev/
