# loom-draft/weareapexcreators-Qwen3.5-0.8B-LocalAI-loom

## Resumen

Qwen3.5-0.8B-LocalAI-loom es un paquete de despliegue en formato Loom (programas `.loom` y una tarjeta `model.json`) generado a partir del checkpoint GGUF sin modificar `weareapexcreators/Qwen3.5-0.8B-LocalAI` (fichero `Qwen3.5-0.8B-Q4_K_M.gguf`). Lo publica el usuario `loom-draft` y esta pensado especificamente para las GPU AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB). No se trata de un modelo nuevo entrenado desde cero, sino de un artefacto de empaquetado y ejecucion para el ecosistema Loom, generado con la herramienta `loom-next` sin intervencion de un LLM en el bucle.

El modelo subyacente es un Qwen3.5 de 0,8 mil millones de parametros con capacidades multimodales (pipeline `image-text-to-text`, con proyector `mmproj-BF16.gguf`), licencia Apache 2.0 y una ventana de contexto declarada de 262.144 tokens por peticion. El paquete anade soporte de decodificacion especulativa mediante MTP (multi-token prediction) con profundidad 3, activada por defecto, y expone una API compatible con OpenAI (`/v1/chat/completions`).

La relevancia de esta ficha es acotada: el interes principal reside en la integracion con hardware AMD de gama consumer y workstation (Strix Halo y R9700) mediante el runtime Loom, no en mejoras de capacidad del modelo. El repositorio no incluye resultados de rendimiento ni de correccion re-medidos para este paquete concreto, por lo que las cifras de rendimiento frente a llama.cpp no estan disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Qwen3.5 de 0,8B; familia transformer multimodal, detalle no especificado en la informacion) |
| Parametros totales | 0,8 mil millones (segun nombre del modelo base) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 262.144 tokens por peticion |
| Tipos de cuantizacion | Q4_K_M (GGUF); proyector multimodal en BF16 (`mmproj-BF16.gguf`) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF dentro de paquete Loom (`.loom` + `model.json`) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base `weareapexcreators/Qwen3.5-0.8B-LocalAI` mas alla de su caracter multimodal (entrada de imagen y texto, pipeline `image-text-to-text`) y su tamano de 0,8B. Tampoco se especifican los datos de entrenamiento, el numero de tokens, la composicion del dataset ni si hubo etapas de RLHF o DPO. Estos datos deben consultarse en la model card del checkpoint original, no en este paquete.

La innovacion tecnica destacable de este artefacto es de infraestructura, no de modelado: el paquete Loom incluye decodificacion especulativa mediante MTP con profundidad 3, activada por defecto, y un conjunto de puertas de correccion (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `agent_think_off`, `sampling`, `logits`, `decision`) que comparan la salida del runtime Loom contra una referencia de llama.cpp sobre el mismo GGUF. Para este paquete concreto, todas las puertas figuran como "not yet re-measured", es decir, sin evidencia registrada en la model card.

## Capacidades

- Generacion de texto conversacional mediante API compatible con OpenAI (`/v1/chat/completions`).
- Entrada de imagen en formato OpenAI (`image_url`) con proyector `mmproj-BF16.gguf`, lo que habilita tareas image-text-to-text.
- Tool calling en estilo OpenAI (`tools` y `tool_calls`), con soporte de bucles multi-turno de llamadas a herramientas segun la puerta `agent`.
- Modo de razonamiento/thinking opcional, desactivado por defecto y activable con `chat_template_kwargs: {"enable_thinking": true}`.
- Decodificacion especulativa MTP con profundidad 3, activada por defecto.
- Concurrencia de 4 peticiones simultaneas.
- Limite de 4.096 tokens de salida por peticion (preset `max_tokens`).
- Soporte de audio: no determinado en la informacion disponible.
- Comportamiento de muestreo (sampling): no determinado en la informacion disponible.
- Capacidades multilingues: no disponibles.

## Casos de uso

- Asistente local en estacion de trabajo AMD: el modelo puede servirse con `loom-serve` sobre una Radeon AI PRO R9700 o un Ryzen AI Max+ 395 y atender peticiones por HTTP en `127.0.0.1:8080`, adecuado para prototipos y herramientas internas que requieran inferencia local sin dependencia de la nube.
- Procesamiento de documentos largos: con 262.144 tokens de contexto por peticion, es viable resumir o extraer informacion de documentos extensos en una sola pasada, limitado por los 4.096 tokens de salida configurados.
- Descripcion y analisis de imagenes: gracias a la entrada `image_url` y al proyector BF16, puede emplearse para etiquetado de imagenes, extraccion de texto en capturas o respuestas sobre contenido visual en flujos internos.
- Agentes con herramientas: el soporte de `tools`/`tool_calls` y las puertas `agent` y `agent_think_off` permiten construir asistentes que consulten APIs o bases de datos en bucles multi-turno, con la salvedad de que la correccion frente a llama.cpp no esta re-medida en este paquete.
- Evaluacion de runtime en hardware AMD: util para ingenieros que quieran comparar el rendimiento y la fidelidad de Loom frente a llama.cpp sobre el mismo GGUF en gfx1151 o gfx1201, aunque las tablas de rendimiento de esta tarjeta aun no contienen mediciones.
- Chat de baja latencia con decodificacion especulativa: con MTP a profundidad 3 activado por defecto, resulta adecuado para aplicaciones interactivas donde importa el tiempo por token, siempre que se valide la equivalencia de salida con la puerta `spec`.
- Despliegue con concurrencia moderada: con 4 peticiones concurrentes soportadas, encaja en equipos pequenos o demos publicas de baja carga, no en servicios de alta disponibilidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que las mediciones de rendimiento frente a llama.cpp para este paquete "are not yet re-measured" tanto en Strix Halo (gfx1151) como en Radeon AI PRO R9700 (gfx1201), y todas las puertas de correccion figuran sin ejecucion registrada. No se dispone de datos de MMLU, HumanEval, GSM8K ni de throughput o latencia.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; el checkpoint es Q4_K_M de un modelo de 0,8B, por lo que la huella de pesos es reducida, pero la informacion no proporciona cifras exactas.
- GPU objetivo declaradas: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- GPU consumer: no se indica compatibilidad con GPU NVIDIA ni con otras Radeon consumer; el paquete esta generado para las dos plataformas AMD citadas.
- Despliegue: runtime Loom mediante `pipx install "hrx-loom[hf]==0.2.0"`, `loom-fetch` y `loom-serve`; no se mencionan vLLM, llama.cpp, Ollama ni TGI para este paquete (llama.cpp aparece solo como referencia de correccion).
- Opciones de servicio: `--pool_backing=fixed` reserva el pool de memoria por adelantado y `--parameter_mode=preload` precarga los pesos en host; `completion_spin_ns=4294967295` activa espera activa de finalizaciones de GPU.
- Latencia y throughput: no disponibles; las tablas de rendimiento del paquete no contienen mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Formato / runtime | Notas |
|---|---|---|---|---|---|---|
| Qwen3.5-0.8B-LocalAI-loom (este paquete) | 0,8B | 262.144 tokens | Si (imagen) | Apache 2.0 | GGUF empaquetado en Loom; runtime Loom | Paquete especifico para AMD Strix Halo y R9700; sin benchmarks re-medidos |
| weareapexcreators/Qwen3.5-0.8B-LocalAI (modelo base) | 0,8B | no disponible en esta informacion | Si (imagen) | Apache 2.0 | GGUF (`Qwen3.5-0.8B-Q4_K_M.gguf`) | Checkpoint original sin empaquetar; ejecutable con llama.cpp y otros runtimes GGUF |
| Alternativas de 0,8B-1B de la familia Qwen | no disponible | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificados en la informacion proporcionada |

No se dispone de datos suficientes en la informacion proporcionada para establecer una comparativa cuantitativa con modelos alternativos de la misma categoria.

## Limitaciones y advertencias

- El paquete no aporta mejoras de capacidad sobre el modelo base; cualquier limitacion del checkpoint `weareapexcreators/Qwen3.5-0.8B-LocalAI` (sesgos, alucinacion, cobertura idiomatica) se hereda sin cambios.
- Las puertas de correccion (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `agent_think_off`, `sampling`, `logits`, `decision`) figuran como "not yet re-measured" para este paquete: no hay evidencia registrada de equivalencia con llama.cpp ni de consistencia bajo concurrencia.
- No hay mediciones de rendimiento publicadas para este paquete en ninguna de las dos GPU objetivo, por lo que no puede afirmarse ninguna ventaja de velocidad frente a llama.cpp.
- El limite de salida esta fijado en 4.096 tokens por peticion en el preset, lo que restringe tareas de generacion larga pese al contexto de 262.144 tokens.
- La concurrencia maxima declarada es de 4 peticiones, insuficiente para cargas de produccion elevadas.
- El soporte de audio y el comportamiento de muestreo aparecen como "not determined": no deben asumirse.
- Compatibilidad de hardware restringida a las plataformas AMD indicadas (gfx1151 y gfx1201); no se declara soporte para otras GPU.
- Aunque la licencia del paquete es Apache 2.0, conviene verificar los terminos del modelo base antes de un uso comercial, ya que la informacion disponible no detalla condiciones adicionales.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validacion por parte de la comunidad.

## Enlaces

- Repositorio Hugging Face del paquete: https://huggingface.co/loom-draft/weareapexcreators-Qwen3.5-0.8B-LocalAI-loom
- Modelo base en Hugging Face: https://huggingface.co/weareapexcreators/Qwen3.5-0.8B-LocalAI
- Repositorio del runtime Loom (ROCm): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Sitio del ecosistema Loom: https://loom-fun.github.io/loom-dev/
