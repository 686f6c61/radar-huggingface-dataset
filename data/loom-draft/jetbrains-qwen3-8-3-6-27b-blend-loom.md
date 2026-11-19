# loom-draft/JetBrains-Qwen3.8-3.6-27B-blend-loom

## Resumen

`loom-draft/JetBrains-Qwen3.8-3.6-27B-blend-loom` es un paquete de despliegue en formato Loom (programas `.loom` y una tarjeta `model.json`) para el checkpoint GGUF sin modificar `JetBrains/Qwen3.8-3.6-27B-blend-GGUF`, en su cuantizacion `Q4_K_M`. Lo publica el usuario `loom-draft` y esta generado con la herramienta `loom-next` (solo el generador, sin LLM en el bucle), segun la model card. No se trata de un modelo entrenado desde cero ni de un fine-tune: es un artefacto de empaquetado y ejecucion para hardware AMD concreto.

El objetivo del paquete es servir el modelo base sobre dos aceleradores AMD: la APU Ryzen AI Max+ 395 «Strix Halo» (gfx1151) y la GPU Radeon AI PRO R9700 (gfx1201, 32 GB), a traves del runtime `loom-serve` del ecosistema Loom (repositorio `ROCm/hrx-system`). El modelo base es un Qwen de 27B con capacidades de vision (pipeline `image-text-to-text`) y un proyector multimodal separado en BF16.

La relevancia es acotada pero clara para quien trabaje con inferencia local en AMD: el paquete expone una API compatible con OpenAI, soporte de tool calling, modo de razonamiento configurable, decodificacion especulativa MTP y una ventana de contexto de 262.144 tokens por peticion. Ahora bien, la propia model card indica que las mediciones de rendimiento y las puertas de correccion no se han vuelto a medir para este paquete, por lo que no hay evidencia publicada de su comportamiento real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Qwen de 27B; la model card no detalla la arquitectura interna) |
| Parametros totales | 27B (segun el nombre del checkpoint base) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 262.144 tokens por peticion |
| Tipos de cuantizacion | Q4_K_M (GGUF); proyector de vision en BF16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (`Qwen3.8-3.6-27B-blend-Q4_K_M.gguf`) + proyector `mmproj-Qwen3.8-3.6-27B-blend-BF16.gguf`; empaquetado como paquete Loom (`.loom` + `model.json`) |
| Pipeline | image-text-to-text (vision) |
| Salida maxima | 4.096 tokens (preset `max_tokens`) |
| Concurrencia | 4 peticiones simultaneas |
| Decodificacion especulativa | MTP, profundidad 3, activada por defecto |
| API | OpenAI-style `/v1/chat/completions` |
| Hardware objetivo | AMD Ryzen AI Max+ 395 «Strix Halo» (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB) |
| Runtime | `hrx-loom[hf]==0.2.0` (`loom-fetch`, `loom-serve`) |

## Arquitectura y entrenamiento

No hay informacion sobre la arquitectura interna ni sobre el proceso de entrenamiento en la informacion proporcionada. El paquete no modifica los pesos: parte del checkpoint GGUF `Qwen3.8-3.6-27B-blend-GGUF` de JetBrains y genera programas `.loom` y una tarjeta `model.json` con `loom-next`, el generador del ecosistema Loom. Por tanto, cualquier detalle de arquitectura (tipo de transformer, atencion, datos de entrenamiento, tokens vistos, RLHF/DPO) corresponde al modelo base y no se documenta aqui.

La innovacion tecnica del paquete esta en la capa de ejecucion: kernels generados para las arquitecturas AMD gfx1151 y gfx1201, decodificacion especulativa MTP con profundidad 3 activada por defecto, y un conjunto de puertas de correccion (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `agent_think_off`, `sampling`, `logits`, `decision`) que comparan la salida contra una referencia de llama.cpp registrada sobre el mismo GGUF. Segun la model card, ninguna de esas puertas se ha vuelto a medir para este paquete.

## Capacidades

- Generacion de texto y razonamiento con modo «thinking» activado por defecto y desactivable mediante `chat_template_kwargs: {"enable_thinking": false}`.
- Control de esfuerzo de razonamiento mediante `reasoning_effort` con valores `low`, `medium` y `xhigh` (por defecto `xhigh`).
- Tool calling estilo OpenAI: acepta `tools` y devuelve `tool_calls`.
- Bucles de agente multi-turno con reutilizacion de historial (segun la puerta `agent` de la model card).
- Entrada de imagenes mediante partes `image_url` estilo OpenAI, con proyector multimodal BF16.
- Decodificacion especulativa MTP (profundidad 3) activada por defecto, con la garantia declarada de que la salida con especulacion activa es identica a la de especulacion desactivada.
- Ventana de contexto de 262.144 tokens por peticion y hasta 4 peticiones concurrentes.
- Sin soporte de audio (entrada ni salida).
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Asistente de codigo en local sobre estaciones AMD: el paquete sirve una API compatible con OpenAI en `127.0.0.1:8080`, de modo que herramientas tipo extension de IDE o CLI pueden apuntar al endpoint sin cambiar de SDK, aprovechando el tool calling para leer ficheros y ejecutar comandos.
- Analisis de capturas y diagramas tecnicos: con entrada `image_url` y un proyector BF16, se pueden enviar diagramas de arquitectura, capturas de errores o tablas escaneadas junto a una pregunta en texto en la misma peticion.
- Agentes de recuperacion con contexto largo: los 262.144 tokens por peticion permiten inyectar documentacion extensa o varios ficheros completos en un solo turno, y el bucle `agent` con reutilizacion de historial reduce el coste de repetir contexto entre pasos.
- Automatizacion de triaje con razonamiento graduable: para clasificacion o extraccion simple se puede fijar `reasoning_effort: low` y `enable_thinking: false`, reservando `xhigh` para tareas de analisis donde la latencia importa menos.
- Despliegue en hardware de escritorio AMD: el paquete esta pensado para Strix Halo y R9700, lo que permite montar un servidor de inferencia privado en una estacion de trabajo sin GPU de centro de datos.
- Evaluacion comparativa frente a llama.cpp: las puertas de correccion (`golden`, `compare`, `logits`, `sampling`) estan disenadas para verificar que la implementacion Loom reproduce la referencia de llama.cpp token a token, util para validar un backend nuevo antes de produccion.
- Procesamiento por lotes con concurrencia limitada: el preset admite 4 peticiones simultaneas, adecuado para pipelines internos de resumen o extraccion con carga moderada y salidas de hasta 4.096 tokens.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye secciones de rendimiento para Strix Halo y R9700, pero ambas indican literalmente que los resultados de este paquete «no se han vuelto a medir», y las tablas de puertas de correccion muestran «not yet re-measured» en todas las filas y en ambas plataformas.

| Puerta de correccion | Strix Halo (gfx1151) | Radeon AI PRO R9700 (gfx1201) |
|---|---|---|
| `kernel_tests` | no medida | no medida |
| `golden` | no medida | no medida |
| `compare` | no medida | no medida |
| `vision` | no medida | no medida |
| `consistency` | no medida | no medida |
| `spec` | no medida | no medida |
| `agent` | no medida | no medida |
| `agent_think_off` | no medida | no medida |
| `sampling` | no medida | no medida |
| `logits` | no medida | no medida |
| `decision` | no medida | no medida |

## Requisitos de hardware

- VRAM estimada: no disponible. El checkpoint es Q4_K_M de un modelo de 27B, pero la model card no publica el tamano exacto del fichero ni el consumo medido.
- GPU objetivo declaradas: AMD Ryzen AI Max+ 395 «Strix Halo» (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB). No se menciona soporte para otras GPU.
- GPU de consumo: no hay datos de compatibilidad con RTX 4090 u otras GPU NVIDIA; el paquete esta construido sobre el runtime AMD `hrx-loom`, por lo que no es un artefacto portable a CUDA.
- Despliegue: `pipx install "hrx-loom[hf]==0.2.0"`, seguido de `loom-fetch` con el preset `chat` (Strix Halo) o `chat-r9700` (R9700) y `loom-serve` con `--device=amdgpu://?completion_spin_ns=4294967295 --pool_backing=fixed --parameter_mode=preload`.
- `completion_spin_ns=4294967295` activa espera activa de las finalizaciones de GPU (consume CPU mientras hay trabajo en vuelo); la model card indica que sus mediciones usan ese ajuste.
- `--pool_backing=fixed` reserva el pool de memoria del preset por adelantado en lugar de crecimiento elastico.
- `--parameter_mode=preload` solo cambia la carga de pesos en el host.
- Latencia y throughput: no disponibles; las secciones de rendimiento del paquete no se han vuelto a medir.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos de rendimiento ni especificaciones de modelos alternativos con los que comparar de forma rigurosa. Como referencia estructural, el unico punto de comparacion citado en la model card es llama.cpp, usado como referencia de correccion (tokens greedy, top-5 log-probs, vision y sampling) sobre el mismo GGUF, no como modelo alternativo.

| Aspecto | Este paquete | llama.cpp (referencia citada) |
|---|---|---|
| Funcion | Runtime Loom para AMD gfx1151/gfx1201 | Runtime GGUF generico |
| Pesos | Mismo GGUF Q4_K_M | Mismo GGUF Q4_K_M |
| Comparacion de rendimiento | no medida | referencia de correccion, sin cifras publicadas aqui |
| Licencia del artefacto | Apache 2.0 | no disponible en la informacion |

## Limitaciones y advertencias

- Artefacto de empaquetado, no un modelo nuevo: cualquier limitacion del checkpoint base `JetBrains/Qwen3.8-3.6-27B-blend-GGUF` se hereda sin cambios.
- Sin evidencia de rendimiento ni de correccion: todas las puertas y las tablas de rendimiento figuran como «not yet re-measured» para ambas plataformas. No hay base publicada para afirmar que la salida coincide con llama.cpp en este paquete concreto.
- Cero adopcion verificable: 0 descargas y 0 «likes» en el momento de la consulta; el autor es `loom-draft` y el paquete se creo y actualizo el mismo dia (2026-11-19), sin historial de mantenimiento.
- Compatibilidad de hardware muy restringida: solo se documentan Strix Halo (gfx1151) y Radeon AI PRO R9700 (gfx1201). No hay indicacion de soporte para otras GPU AMD ni para NVIDIA.
- Dependencia de un runtime joven: requiere `hrx-loom[hf]==0.2.0` y el ecosistema Loom (`ROCm/hrx-system`, `loom-next`), con API y flags que pueden cambiar.
- Limite de salida de 4.096 tokens por peticion y 4 peticiones concurrentes segun el preset; para cargas mayores habria que ajustar la configuracion, sin documentacion disponible sobre como hacerlo.
- Idiomas soportados no declarados: no se puede garantizar calidad en castellano ni en otros idiomas sin evaluacion propia.
- Riesgo de alucinacion y sesgos: no documentados en la informacion proporcionada; deben evaluarse sobre el modelo base.
- Licencia Apache 2.0 declarada en el paquete, pero conviene verificar la licencia y las condiciones del checkpoint base de JetBrains antes de un uso comercial, ya que la model card no las detalla.
- La seccion de busqueda web no aporta informacion relevante: los resultados corresponden a Loom (herramienta de grabacion de pantalla), Loom (marca de ropa) y Atlassian Loom, sin relacion con este paquete.

## Enlaces

- Paquete en Hugging Face: https://huggingface.co/loom-draft/JetBrains-Qwen3.8-3.6-27B-blend-loom
- Modelo base (GGUF): https://huggingface.co/JetBrains/Qwen3.8-3.6-27B-blend-GGUF
- Runtime Loom (ROCm): https://github.com/ROCm/hrx-system
- Generador `loom-next`: https://github.com/loom-fun/loom-next
- Web del ecosistema Loom: https://loom-fun.github.io/loom-dev/
