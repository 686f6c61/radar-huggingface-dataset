# loom-draft/ggml-org-Laguna-S-2.1-loom

## Resumen

Laguna-S-2.1-loom es un paquete de despliegue en formato Loom (programas `.loom` y una tarjeta `model.json`) generado a partir del checkpoint GGUF sin modificar `ggml-org/Laguna-S-2.1-GGUF`, en su cuantizacion `Q4_K_M`. Lo publica el usuario `loom-draft` dentro del ecosistema Loom, una infraestructura de ejecucion (runtime) orientada a GPUs AMD que compila el modelo a programas nativos mediante el generador `loom-next`, sin intervencion de un LLM en el bucle de generacion.

El objetivo del paquete no es ofrecer un modelo nuevo, sino un artefacto reproducible para servir Laguna-S-2.1 sobre hardware AMD concreto: la APU Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y la GPU Radeon AI PRO R9700 (gfx1201, 32 GB). El paquete expone una API compatible con OpenAI (`/v1/chat/completions`) a traves de `loom-serve`, con soporte de tool calling y modo de razonamiento activado por defecto.

La relevancia es fundamentalmente de infraestructura: demuestra un camino alternativo a llama.cpp para ejecutar GGUF en GPUs AMD, con verificacion de correctitud por compuertas (gates) frente a una referencia de llama.cpp. No obstante, en la informacion disponible no constan especificaciones del modelo base (arquitectura, parametros, contexto nativo) ni resultados de rendimiento medidos para este paquete.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base GGUF de `ggml-org/Laguna-S-2.1-GGUF`; no se detalla en la informacion) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | 9.216 tokens por peticion (limite del preset Loom) |
| Tipos de cuantizacion | Q4_K_M (unico checkpoint empaquetado) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF de origen; empaquetado como programas `.loom` (`program/*.loom`, `weights.loom`) |
| Tokens maximos de salida | 4.096 (preset `max_tokens`) |
| Concurrencia | 4 peticiones simultaneas |
| Hardware objetivo | AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151); AMD Radeon AI PRO R9700 (gfx1201, 32 GB) |
| Runtime | `hrx-loom[hf]==0.2.0` (`loom-fetch`, `loom-serve`) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura del modelo base Laguna-S-2.1 (tipo de transformer, atencion, posible mezcla de expertos, numero de capas o dimensiones ocultas) ni sobre su proceso de entrenamiento (tokens, composicion del dataset, RLHF/DPO). La model card del paquete se centra exclusivamente en el empaquetado y el despliegue, no en el modelo.

Lo que si se documenta es la arquitectura del artefacto de despliegue: `loom-next` genera programas `.loom` y un fichero `weights.loom` a partir del GGUF original, junto con `tokenizer.json`, `llm_config.json` y un `model.json` con los ficheros fuente fijados por hash SHA-256 (verificado por `loom-fetch`). El runtime usa IREE sobre AMDGPU; en hosts con memlock de 8 MiB por defecto se recomienda lanzar bajo `systemd-run` con `SystemCallFilter=~io_uring_setup` para forzar el proactor POSIX de IREE, o elevar `ulimit -l`. El paquete incluye opciones de servido como `completion_spin_ns=4294967295` (espera activa de finalizaciones de GPU) y `--pool_backing=fixed` (reserva fija del pool de memoria).

## Capacidades

- Generacion de texto conversacional mediante API compatible con OpenAI (`/v1/chat/completions`).
- Tool calling estilo OpenAI: acepta `tools` y devuelve `tool_calls`.
- Modo de razonamiento (thinking) activado por defecto; se desactiva con `chat_template_kwargs: {"enable_thinking": false}`.
- Soporte de conversaciones multi-turno con reutilizacion de historial (segun la compuerta `agent`).
- Servicio concurrente de hasta 4 peticiones simultaneas.
- Salida maxima de 4.096 tokens por peticion.
- No soporta entrada de imagen, entrada/salida de audio, decodificacion especulativa ni ajuste de esfuerzo de razonamiento (marcados como no aplicables en la model card).
- Capacidades multilingues: no disponibles en la informacion.

## Casos de uso

- Despliegue local en estaciones de trabajo AMD: servir un asistente conversacional sobre una APU Strix Halo o una R9700 sin depender de CUDA, usando `loom-serve` con el pool de memoria fijo para latencias estables.
- Automatizacion de agentes con herramientas: el soporte de `tools`/`tool_calls` permite construir bucles de agente que consulten APIs internas, ejecuten comandos o consulten bases de datos, con el modo thinking activo para tareas de varios pasos.
- Evaluacion de infraestructura alternativa a llama.cpp: el paquete incluye compuertas de correctitud (`golden`, `compare`, `agent`, `sampling`, `logits`) que permiten validar token a token la equivalencia frente a la referencia de llama.cpp sobre el mismo GGUF.
- Prototipado de asistentes con razonamiento explicito: activar o desactivar `enable_thinking` por peticion permite comparar respuestas con y sin cadena de razonamiento en el mismo servidor.
- Integracion en pipelines con cliente OpenAI: al exponer una API compatible, se puede apuntar cualquier SDK de OpenAI al endpoint local (`http://127.0.0.1:8080/v1`) sin reescribir el codigo de aplicacion.
- Reproducibilidad de despliegues: `loom-fetch` verifica los SHA-256 de los ficheros fuente, lo que facilita replicar exactamente el mismo paquete en distintas maquinas del mismo hardware objetivo.
- Servicio de bajo volumen con concurrencia limitada: con 4 peticiones concurrentes y 9.216 tokens de contexto, encaja en herramientas internas de equipo o entornos de demostracion mas que en servicios de alta carga.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que los resultados de rendimiento frente a llama.cpp "no se han vuelto a medir" tanto para Strix Halo (gfx1151) como para Radeon AI PRO R9700 (gfx1201), y que todas las compuertas de correctitud figuran como "not yet re-measured". No hay datos de MMLU, HumanEval, GSM8K ni de throughput/latencia.

## Requisitos de hardware

- VRAM estimada: no disponible (depende del tamano del modelo base, no indicado; el checkpoint es Q4_K_M).
- GPU objetivo declaradas: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151, memoria unificada) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- GPU NVIDIA: no soportadas por este paquete (runtime sobre AMDGPU/IREE).
- Despliegue: `pipx install "hrx-loom[hf]==0.2.0"`, seguido de `loom-fetch` y `loom-serve`. No se mencionan vLLM, llama.cpp, Ollama ni TGI para este artefacto.
- Ajustes recomendados: `completion_spin_ns=4294967295` (espera activa, consume CPU mientras hay trabajo en GPU), `--pool_backing=fixed` y, en R9700, `--parameter_mode=preload`.
- Host con memlock de 8 MiB: lanzar bajo `systemd-run --user --pty --same-dir -p SystemCallFilter=~io_uring_setup -p SystemCallErrorNumber=ENOSYS` o elevar `ulimit -l`.
- Latencia y throughput: no disponibles (sin mediciones publicadas).

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos de modelos comparables (parametros, contexto, rendimiento) ni del propio modelo base, por lo que no es posible establecer una comparacion cuantitativa fiable. Como referencia de categoria, el unico punto de comparacion mencionado es la propia implementacion de llama.cpp sobre el mismo GGUF, usada como referencia de correctitud, pero sin cifras de rendimiento publicadas para este paquete.

## Limitaciones y advertencias

- El paquete no incluye mediciones de rendimiento ni de correctitud: todas las compuertas figuran como "not yet re-measured", por lo que no hay evidencia registrada de equivalencia con llama.cpp en esta version.
- Contexto limitado a 9.216 tokens por peticion, muy por debajo de lo habitual en modelos actuales; puede ser insuficiente para documentos largos o historiales extensos.
- Concurrencia maxima de 4 peticiones y salida maxima de 4.096 tokens: no apto para servicios de alta carga sin escalado horizontal.
- Solo soporta el hardware AMD indicado (gfx1151 y gfx1201); no hay soporte declarado para NVIDIA ni para otras GPUs AMD.
- Sin soporte de vision, audio ni decodificacion especulativa.
- El modo thinking esta activado por defecto, lo que incrementa tokens generados y latencia si no se desactiva explicitamente.
- Sin informacion sobre sesgos, riesgo de alucinacion o cobertura idiomatica del modelo base; no se puede evaluar su calidad sin consultar la documentacion de `ggml-org/Laguna-S-2.1-GGUF`.
- Licencia MIT declarada en el paquete, pero conviene verificar la licencia del modelo base antes de uso comercial.
- Cero descargas y cero likes en el momento de la consulta: paquete sin validacion por parte de la comunidad.
- Los resultados de busqueda web disponibles no son relevantes (corresponden a la herramienta de grabacion de pantalla Loom y a una marca de ropa homonima), por lo que no aportan informacion tecnica adicional.

## Enlaces

- Paquete en Hugging Face: https://huggingface.co/loom-draft/ggml-org-Laguna-S-2.1-loom
- Modelo base GGUF: https://huggingface.co/ggml-org/Laguna-S-2.1-GGUF
- Repositorio del runtime Loom (ROCm/hrx-system): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Sitio del ecosistema Loom: https://loom-fun.github.io/loom-dev/
