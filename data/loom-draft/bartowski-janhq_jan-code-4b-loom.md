# loom-draft/bartowski-janhq_Jan-code-4b-loom

## Resumen

`loom-draft/bartowski-janhq_Jan-code-4b-loom` es un paquete de despliegue en formato Loom (programas `.loom` y una tarjeta `model.json`) generado a partir del checkpoint GGUF sin modificar `bartowski/janhq_Jan-code-4b-GGUF`, concretamente la cuantizacion `Q4_K_M`. No se trata de un modelo nuevo ni de un fine-tune: los pesos son los del modelo base Jan-code-4b de Jan HQ, y lo que aporta este repositorio es la compilacion de esos pesos a programas Loom ejecutables sobre GPUs AMD.

El paquete esta orientado a dos aceleradores concretos: el SoC AMD Ryzen AI Max+ 395 "Strix Halo" (objetivo `gfx1151`) y la GPU AMD Radeon AI PRO R9700 (`gfx1201`, 32 GB). Se genera con la herramienta `loom-next` (solo el generador, sin LLM en el bucle) y se sirve con `loom-serve`, que expone una API compatible con OpenAI en `/v1/chat/completions`. El interes practico esta en ejecutar un modelo de codigo de 4B cuantizado en hardware AMD sin pasar por llama.cpp, con soporte declarado de tool calling y concurrencia.

La relevancia es acotada: el repositorio tiene 0 descargas y 0 likes, se creo el 19 de noviembre de 2026 y las mediciones de rendimiento y las puertas de correccion figuran como "not yet re-measured" en ambas plataformas. Es, por tanto, un artefacto de empaquetado en fase temprana, no un modelo evaluado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (heredada del modelo base janhq/Jan-code-4b; el paquete no la documenta) |
| Parametros totales | no disponible (el nombre del checkpoint indica 4B) |
| Parametros activos | no disponible |
| Longitud de contexto | 40.960 tokens por peticion (segun la tarjeta del paquete) |
| Tipos de cuantizacion | Q4_K_M (unica variante empaquetada) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF de origen, empaquetado como programas `.loom` (`program/*.loom`, `weights.loom`) mas `tokenizer.json` y `llm_config.json` |
| Salida maxima | 4.096 tokens (preset `max_tokens`) |
| Concurrencia | 4 peticiones simultaneas |
| Hardware objetivo | AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151); AMD Radeon AI PRO R9700 (gfx1201, 32 GB) |
| API | compatible con OpenAI (`/v1/chat/completions`) |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna del modelo base Jan-code-4b (tipo de transformer, numero de capas, dimensiones, atencion, etc.). El paquete Loom tampoco la detalla: se limita a declarar que parte del checkpoint GGUF `janhq_Jan-code-4b-Q4_K_M.gguf` sin modificarlo y que genera programas especificos para los objetivos `gfx1151` y `gfx1201` mediante `loom-next`.

Tampoco hay datos sobre el corpus de entrenamiento, el numero de tokens, la composicion del dataset ni si hubo RLHF, DPO u otra fase de alineamiento. Lo unico verificable es que el artefacto distribuido aqui es una recompilacion de inferencia, no un reentrenamiento: los pesos son los del GGUF original de bartowski y la licencia declarada es Apache 2.0. La innovacion tecnica del repositorio es de despliegue, no de modelado: kernels generados por objetivo de GPU, un pool de memoria de respaldo fijo (`--pool_backing=fixed`) y espera activa de finalizaciones de GPU (`completion_spin_ns=4294967295`), que la tarjeta indica como configuracion usada en sus mediciones.

## Capacidades

- Generacion de texto y codigo: el checkpoint base es un modelo de codigo de 4B; el paquete no anade capacidades nuevas.
- Tool calling: soportado en estilo OpenAI (`tools` y `tool_calls`), segun la tabla de caracteristicas de la tarjeta.
- API compatible con OpenAI: endpoint `/v1/chat/completions` servido por `loom-serve`.
- Contexto largo: 40.960 tokens por peticion, con un maximo de 4.096 tokens de salida.
- Concurrencia: 4 peticiones simultaneas declaradas.
- Modo razonamiento/thinking: no aplicable.
- Esfuerzo de razonamiento configurable: no aplicable.
- Decodificacion especulativa: no aplicable.
- Entrada de imagen: no aplicable.
- Entrada o salida de audio: no aplicable.
- Muestreo (temperature, top_k, seed): estado "not determined" en la tarjeta; existe una puerta de correccion `sampling` pero sin medicion registrada.

## Casos de uso

- Asistente de codigo en estacion de trabajo AMD: servir el paquete con `loom-serve` sobre una Radeon AI PRO R9700 y consumirlo desde un IDE mediante la API compatible con OpenAI, aprovechando los 40.960 tokens de contexto para incluir varios ficheros en la peticion.
- Automatizacion de tareas de refactorizacion por lotes: enviar hasta 4 peticiones concurrentes con fragmentos de codigo y un prompt de transformacion, usando el limite de 4.096 tokens de salida para parches acotados.
- Agentes con tool calling en local: el soporte de `tools`/`tool_calls` permite construir bucles multi-paso (lectura de ficheros, ejecucion de comandos) sin salir del equipo, util en entornos con requisitos de confidencialidad.
- Prototipado en Strix Halo: un equipo con Ryzen AI Max+ 395 puede ejecutar el paquete `gfx1151` para validar flujos de chat y de herramientas antes de mover la carga a una GPU dedicada.
- Generacion de tests y documentacion tecnica: con contexto de 40k tokens se puede pasar un modulo completo y pedir casos de prueba o docstrings, limitando la salida a 4.096 tokens.
- Evaluacion comparativa de runtimes: al ser un paquete Loom con puertas de correccion definidas frente a llama.cpp (`golden`, `compare`, `agent`), sirve para medir la fidelidad de la ruta Loom frente a la referencia en el mismo GGUF, aunque las puertas aun no tienen mediciones registradas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La tarjeta incluye secciones de rendimiento frente a llama.cpp para Strix Halo y R9700, pero ambas indican que los resultados "are not yet re-measured". Las puertas de correccion (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `agent_think_off`, `sampling`, `logits`, `decision`) figuran igualmente como "not yet re-measured" en las dos plataformas.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita. El checkpoint es una cuantizacion Q4_K_M de un modelo de 4B, y el objetivo R9700 dispone de 32 GB, pero la tarjeta no publica una cifra de memoria residente.
- GPU soportadas: AMD Radeon AI PRO R9700 (gfx1201, 32 GB) y AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151).
- GPU consumer: no hay soporte declarado para GPUs de consumo; los objetivos son hardware AMD profesional e integrado de gama alta. No se mencionan RTX 4090, A100 ni H100.
- Despliegue: `pipx install "hrx-loom[hf]==0.2.0"`, seguido de `loom-fetch` con el preset `chat` (Strix Halo) o `chat-r9700` (R9700) y `loom-serve` con `--device=amdgpu://?completion_spin_ns=4294967295 --pool_backing=fixed --parameter_mode=preload`.
- Alternativas de despliegue (vLLM, llama.cpp, Ollama, TGI): no documentadas para este paquete; llama.cpp se usa solo como referencia de correccion en las puertas.
- Latencia y throughput: no disponibles; las mediciones estan pendientes de repetir en ambas plataformas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| `loom-draft/bartowski-janhq_Jan-code-4b-loom` | 4B (segun nombre; no confirmado en la tarjeta) | 40.960 tokens por peticion | Paquete Loom (desde GGUF Q4_K_M) | Apache 2.0 | Solo AMD gfx1151 y gfx1201; sin benchmarks publicados; 0 descargas |
| `bartowski/janhq_Jan-code-4b-GGUF` | 4B (segun nombre) | no disponible | GGUF, varias cuantizaciones | Apache 2.0 (heredada) | Modelo base del paquete; ejecutable con llama.cpp y otros runtimes GGUF |
| `janhq/Jan-code-4b` | 4B (segun nombre) | no disponible | safetensors (presumible; no confirmado) | no disponible | Checkpoint original de Jan HQ; sin datos de entrenamiento en la informacion disponible |

No se dispone de datos de rendimiento de ninguno de los tres, por lo que la comparativa se limita a formato, licencia y plataformas de ejecucion.

## Limitaciones y advertencias

- Ausencia total de mediciones: rendimiento y puertas de correccion figuran como "not yet re-measured" en ambas plataformas; no hay evidencia registrada de que la salida coincida con llama.cpp.
- Estado de muestreo indeterminado: la caracteristica `sampling` aparece como "not determined", lo que impide garantizar el comportamiento de `temperature`, `top_k` y `seed` en produccion.
- Hardware muy restringido: solo se declaran dos objetivos AMD (gfx1151 y gfx1201); no hay soporte para GPUs NVIDIA ni para hardware consumer.
- Idioma no declarado: la tarjeta no especifica idiomas soportados; el comportamiento multilingue del modelo base no esta documentado aqui.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; es un modelo de 4B cuantizado a Q4_K_M, con la perdida de precision que ello implica.
- Sesgos: no documentados.
- Licencia: Apache 2.0, lo que permite uso comercial, pero la tarjeta no aclara la procedencia de los datos de entrenamiento del modelo base ni posibles restricciones adicionales de `janhq/Jan-code-4b`.
- Madurez: repositorio con 0 descargas y 0 likes, creado y actualizado el mismo dia (19 de noviembre de 2026); no hay historial de uso ni issues.
- Dependencia de version fija: requiere `hrx-loom[hf]==0.2.0` y verificacion sha256 de los ficheros fuente por `loom-fetch`.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/loom-draft/bartowski-janhq_Jan-code-4b-loom
- Modelo base (GGUF): https://huggingface.co/bartowski/janhq_Jan-code-4b-GGUF
- Generador Loom: https://github.com/loom-fun/loom-next
- Ecosistema Loom: https://loom-fun.github.io/loom-dev/
- Runtime Loom para ROCm: https://github.com/ROCm/hrx-system
