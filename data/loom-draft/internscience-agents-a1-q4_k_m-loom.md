# loom-draft/InternScience-Agents-A1-Q4_K_M-loom

## Resumen

InternScience-Agents-A1-Q4_K_M-loom es un paquete de despliegue en formato Loom (programas `.loom` y una tarjeta `model.json`) que envuelve el checkpoint GGUF sin modificar `InternScience/Agents-A1-Q4_K_M-GGUF`, concretamente el fichero `Agents-A1-Q4_K_M.gguf`. Lo publica el usuario `loom-draft` y esta pensado para ejecutarse sobre la GPU integrada AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y la GPU dedicada AMD Radeon AI PRO R9700 (gfx1201, 32 GB). El paquete se ha generado con la herramienta `loom-next`, un generador automatico de paquetes Loom que no emplea ningun LLM en el bucle.

El modelo subyacente es un modelo multimodal de tipo image-text-to-text, con soporte de razonamiento (thinking) y tool calling, empaquetado en cuantizacion Q4_K_M. El paquete Loom no modifica los pesos: solo aporta los kernels y la configuracion de servicio para el runtime `loom-serve` sobre ROCm. La licencia declarada es Apache 2.0.

Su relevancia es acotada pero concreta: ofrece una via de ejecucion de un modelo de agentes con vision sobre hardware AMD consumer y profesional (Strix Halo y R9700) mediante una API compatible con OpenAI, con contexto de 262.144 tokens por peticion y 4 peticiones concurrentes. No obstante, en el momento de la publicacion no hay mediciones de rendimiento ni de correccion registradas para este paquete.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base multimodal image-text-to-text; detalles del transformer no publicados en la informacion disponible) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 262.144 tokens por peticion |
| Tipos de cuantizacion | Q4_K_M (GGUF) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (`Agents-A1-Q4_K_M.gguf`) mas proyector multimodal `Agents-A1-mmproj.gguf`; paquete Loom (`model.json`, `program/*.loom`, `weights.loom`) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo base (tipo de transformer, atencion, numero de capas o dimensiones) ni sobre el proceso de entrenamiento (tokens, composicion del dataset, RLHF/DPO). La model card del paquete Loom no documenta estos extremos y se limita a describir el empaquetado y el runtime.

Lo que si esta documentado es la capa de despliegue: el paquete contiene kernels generados para las arquitecturas AMD gfx1151 y gfx1201, un fichero `model.json` con los ficheros fuente fijados y verificados por sha256 mediante `loom-fetch`, y programas `.loom` que implementan el servicio. El runtime `loom-serve` expone una API estilo OpenAI, soporta tool calling con `tools`/`tool_calls`, entrada de imagen via `image_url` con el proyector `Agents-A1-mmproj.gguf`, y modo de razonamiento activado por defecto (desactivable con `chat_template_kwargs: {"enable_thinking": false}`). No aplica decodificacion especulativa ni ajuste de esfuerzo de razonamiento segun la tabla de caracteristicas.

## Capacidades

- Generacion de texto y razonamiento con modo "thinking" activado por defecto y desactivable por peticion.
- Entrada de imagen (image-text-to-text) mediante partes `image_url` en formato OpenAI, usando el proyector multimodal `Agents-A1-mmproj.gguf`.
- Tool calling / function calling con esquema OpenAI (`tools` y `tool_calls`).
- Bucles de agente multi-turno con reutilizacion de historial (segun la descripcion de las puertas de correccion `agent` y `agent_think_off`).
- Contexto largo de hasta 262.144 tokens por peticion.
- Concurrencia de hasta 4 peticiones simultaneas.
- Limite de salida de 4.096 tokens por peticion (preset `max_tokens`).
- API compatible con OpenAI en `/v1/chat/completions`.
- No soporta audio de entrada ni de salida.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Agentes con vision sobre documentos: el modelo puede recibir imagenes de capturas, diagramas o formularios junto a instrucciones de texto y encadenar tool calls para extraer y estructurar datos, aprovechando el contexto de 262.144 tokens para adjuntar multiples imagenes y documentos en una misma sesion.
- Automatizacion de soporte tecnico con capturas de pantalla: un usuario envia una imagen de un error y el modelo razona sobre ella (thinking activado) y propone pasos o invoca herramientas de diagnostico mediante `tool_calls`.
- Asistente de escritorio local en Strix Halo: al ejecutarse sobre la GPU integrada del Ryzen AI Max+ 395, permite desplegar un asistente multimodal sin GPU dedicada, con API local en `127.0.0.1:8080` consumible por herramientas de escritorio.
- Procesamiento por lotes de imagenes con contexto largo: clasificacion, resumen o extraccion de informacion de lotes de imagenes dentro de una misma peticion gracias al contexto de 262.144 tokens, con 4 peticiones concurrentes para paralelizar.
- Pipelines de agentes con tool calling en produccion interna: la API compatible con OpenAI permite sustituir un endpoint remoto por `loom-serve` en el mismo hardware AMD, manteniendo el formato de `tools`/`tool_calls` sin reescribir el cliente.
- Evaluacion y prototipado en Radeon AI PRO R9700: con 32 GB de VRAM, sirve como banco de pruebas para flujos de agentes multimodales antes de migrar a infraestructura mayor, usando el mismo paquete Loom.
- Razonamiento desactivable para tareas de baja latencia: en tareas simples (clasificacion, extraccion) se puede enviar `enable_thinking: false` para evitar el coste del modo de razonamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que las mediciones de rendimiento frente a llama.cpp para este paquete "no se han vuelto a medir" tanto en Strix Halo (gfx1151) como en Radeon AI PRO R9700 (gfx1201), y que todas las puertas de correccion (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `agent_think_off`, `sampling`, `logits`, `decision`) figuran como "not yet re-measured" en ambas plataformas.

| Benchmark | Resultado | Comparacion |
|---|---|---|
| MMLU | no disponible | no disponible |
| HumanEval | no disponible | no disponible |
| GSM8K | no disponible | no disponible |
| Rendimiento vs llama.cpp (Strix Halo) | no medido | no disponible |
| Rendimiento vs llama.cpp (R9700) | no medido | no disponible |

## Requisitos de hardware

- GPU objetivo: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- VRAM estimada: no disponible de forma explicita; el modelo se distribuye en Q4_K_M y la R9700 dispone de 32 GB, pero no se publica el consumo exacto.
- Compatibilidad con GPU consumer: limitada a las arquitecturas AMD indicadas; no se documenta soporte para GPUs NVIDIA ni para otras Radeon.
- Despliegue: exclusivamente mediante el runtime Loom (`hrx-loom[hf]==0.2.0`, `loom-fetch` y `loom-serve`). No se documenta soporte para vLLM, llama.cpp, Ollama o TGI en este paquete, aunque el GGUF base es compatible con llama.cpp por origen.
- Opciones de servicio documentadas: `--device=amdgpu://?completion_spin_ns=4294967295`, `--pool_backing=fixed`, `--parameter_mode=preload`.
- Latencia y throughput: no disponibles (no medidos para este paquete).
- Concurrencia maxima: 4 peticiones simultaneas.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos de rendimiento ni especificaciones del modelo base que permitan una comparacion rigurosa con alternativas de la misma categoria. Como referencia estructural, el paquete se apoya en el mismo GGUF que `InternScience/Agents-A1-Q4_K_M-GGUF`, por lo que su comportamiento numerico deberia coincidir con el de llama.cpp sobre ese checkpoint, pero no se han registrado mediciones que lo confirmen.

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| InternScience-Agents-A1-Q4_K_M-loom | no disponible | 262.144 | Apache 2.0 | GGUF + Loom | Paquete para AMD Strix Halo y R9700; sin benchmarks publicados |
| InternScience/Agents-A1-Q4_K_M-GGUF | no disponible | no disponible | no disponible | GGUF | Checkpoint base sin modificar |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Ausencia total de mediciones: tanto el rendimiento como las puertas de correccion figuran como "not yet re-measured", por lo que no hay evidencia publicada de que la salida coincida con la referencia de llama.cpp en este paquete.
- Hardware muy restringido: solo se documenta soporte para AMD Ryzen AI Max+ 395 (gfx1151) y Radeon AI PRO R9700 (gfx1201); no hay soporte declarado para otras GPU.
- Dependencia de un runtime especifico: requiere `hrx-loom[hf]==0.2.0` y el ecosistema Loom; no es un artefacto desplegable con vLLM, TGI u Ollama.
- Limite de salida de 4.096 tokens por peticion, lo que restringe tareas de generacion larga.
- Concurrencia maxima de 4 peticiones, insuficiente para cargas de produccion con alto trafico.
- Sin informacion sobre sesgos, composicion del dataset de entrenamiento ni evaluaciones de seguridad del modelo base.
- Idiomas soportados no documentados; no se puede garantizar calidad multilingue.
- Riesgo de alucinacion: no evaluado en la informacion disponible.
- Licencia Apache 2.0 declarada, lo que en principio permite uso comercial, pero conviene verificar la licencia del checkpoint base `InternScience/Agents-A1-Q4_K_M-GGUF`, no documentada aqui.
- El repositorio figura con 0 descargas y 0 likes, y un tamano de 0.0 GB, lo que sugiere que los pesos no estan alojados en este repositorio sino referenciados desde el modelo base.

## Enlaces

- Paquete en Hugging Face: https://huggingface.co/loom-draft/InternScience-Agents-A1-Q4_K_M-loom
- Modelo base (GGUF): https://huggingface.co/InternScience/Agents-A1-Q4_K_M-GGUF
- Repositorio del runtime Loom (ROCm): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Sitio del ecosistema Loom: https://loom-fun.github.io/loom-dev/
