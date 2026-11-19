# loom-draft/bartowski-Qwen2.5-14B-Instruct-loom

## Resumen

`loom-draft/bartowski-Qwen2.5-14B-Instruct-loom` es un paquete de despliegue para el modelo Qwen2.5-14B-Instruct en su cuantizacion Q4_K_M, empaquetado en el formato `.loom` que consume el runtime Loom (herramienta `loom-serve`, del ecosistema HRX/ROCm). No se trata de un modelo nuevo ni de un fine-tune: los pesos subyacentes son el checkpoint GGUF sin modificar de `bartowski/Qwen2.5-14B-Instruct-GGUF`, concretamente el fichero `Qwen2.5-14B-Instruct-Q4_K_M.gguf`. El autor del paquete es `loom-draft` y el contenido se ha generado con la herramienta `loom-next`, un generador de programas Loom que no emplea un LLM en el proceso.

El interes de esta ficha no esta en las capacidades del modelo Qwen2.5-14B-Instruct (ampliamente conocido), sino en el formato de empaquetado y en el soporte de hardware objetivo: las GPU integradas AMD Ryzen AI Max+ 395 "Strix Halo" (arquitectura gfx1151) y la GPU de escritorio AMD Radeon AI PRO R9700 (gfx1201, 32 GB). El paquete incluye programas `.loom` generados, un tokenizer, un fichero de configuracion (`llm_config.json`) y una tarjeta `model.json` con metadatos y evidencia de validacion.

La relevancia actual es acotada: se publica como borrador (`loom-draft`), con cero descargas y cero likes en el momento de la consulta, y sin mediciones de rendimiento ni resultados de las puertas de correccion registrados ("not yet re-measured" en todas las filas). Es util como artefacto de evaluacion del runtime Loom sobre hardware AMD, no como sustituto del GGUF original para despliegues en produccion con llama.cpp u otros motores.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5), empaquetado en formato Loom `.loom` |
| Parametros totales | 14B (heredados del checkpoint base Qwen2.5-14B-Instruct) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens por peticion (segun la model card del paquete) |
| Tipos de cuantizacion | Q4_K_M (unica incluida en el paquete) |
| Idiomas soportados | no disponible (la model card del paquete no los declara; Qwen2.5 soporta multilingue, pero no se especifica en la informacion proporcionada) |
| Licencia | apache-2.0 |
| Formato de pesos | `.loom` (programas generados) + GGUF Q4_K_M de origen; incluye `tokenizer.json`, `llm_config.json`, `info.json`, `model.json` |

## Arquitectura y entrenamiento

El paquete no define una arquitectura propia: reutiliza el checkpoint Qwen2.5-14B-Instruct de Alibaba, un transformer decoder-only denso de 14.000 millones de parametros, en su version Instruct (ajustada por instrucciones). Sobre ese checkpoint, la herramienta `loom-next` genera programas `.loom` que implementan el grafo de computo para las GPU AMD objetivo (gfx1151 y gfx1201), junto con un fichero `weights.loom` que referencia los pesos. No hay entrenamiento adicional, ni RLHF, ni DPO en este paquete: es puramente un artefacto de compilacion y empaquetado.

El paquete declara soporte de atencion con contexto de 32.768 tokens por peticion y concurrencia de 4 peticiones simultaneas, con un maximo de 4.096 tokens de salida por preset (`max_tokens`). Las innovaciones tecnicas del runtime Loom que se mencionan en la model card incluyen el modo de espera activa de finalizacion en GPU (`completion_spin_ns=4294967295`), el pool de memoria fijo (`--pool_backing=fixed`) y la precarga de parametros en host (`--parameter_mode=preload`). No se documentan en la informacion disponible datos sobre el dataset de entrenamiento del modelo base, ni sobre decodificacion especulativa (marcada como "not applicable" en la tabla de caracteristicas), ni sobre modos de razonamiento o thinking.

## Capacidades

- Generacion de texto conversacional y de instrucciones, heredada de Qwen2.5-14B-Instruct en cuantizacion Q4_K_M.
- Tool calling / function calling en estilo OpenAI: la tabla de caracteristicas marca `tool calling` como soportado, con `tools` y `tool_calls` compatibles con la API de OpenAI.
- API compatible con OpenAI: endpoint `/v1/chat/completions` servido por `loom-serve`.
- Concurrencia de 4 peticiones simultaneas, con contexto de 32.768 tokens por peticion.
- Salida maxima de 4.096 tokens por peticion (preset `max_tokens`).
- Razonamiento / thinking mode: no aplicable en este paquete (marcado como "—").
- Decodificacion especulativa: no aplicable en este paquete.
- Entrada de imagen: no aplicable.
- Entrada o salida de audio: no aplicable.
- Muestreo (sampling): estado "no determinado" en la tabla de caracteristicas del paquete.
- Capacidades multilingues: no disponibles en la informacion proporcionada para este paquete.

## Casos de uso

- Evaluacion del runtime Loom sobre Strix Halo: usar `loom-fetch` y `loom-serve` con el preset `chat` para medir latencia y throughput reales del runtime en la iGPU Ryzen AI Max+ 395 (gfx1151), comparando despues con llama.cpp sobre el mismo GGUF.
- Evaluacion del runtime Loom sobre Radeon AI PRO R9700: mismo flujo sobre gfx1201 con 32 GB de VRAM, donde el modelo Q4_K_M (aproximadamente 9 GB de pesos) deja margen amplio para el pool de memoria fijo y la concurrencia de 4 peticiones.
- Pruebas de compatibilidad de tool calling: ejercitar el bucle multi-turno de llamadas a herramientas a traves de la API OpenAI-style del runtime, validando el renderizado exacto del prompt y la reutilizacion de historial con la puerta `agent` de loom-benchmark.
- Validacion de correccion frente a llama.cpp: usar las puertas `golden`, `compare` y `logits` para verificar que la salida greedy del runtime coincide token a token con la referencia de llama.cpp sobre el mismo GGUF, incluyendo documentos de 1k a 32k tokens.
- Pruebas de concurrencia: lanzar 4 peticiones simultaneas y comprobar con la puerta `consistency` que la salida coincide con la de las mismas peticiones ejecutadas de forma aislada.
- Prototipado de asistentes conversacionales con contexto largo: aprovechar los 32.768 tokens por peticion para conversaciones multi-turno o analisis de documentos de hasta ese tamano, con la salvedad de que el estado de las puertas de correccion no esta registrado.
- Referencia de empaquetado: usar el paquete como ejemplo de como `loom-next` genera programas `.loom` a partir de un GGUF de terceros, para replicar el flujo con otros checkpoints.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del paquete indica explicitamente que las mediciones de rendimiento frente a llama.cpp en Strix Halo (gfx1151) y en Radeon AI PRO R9700 (gfx1201) "no se han vuelto a medir todavia" ("the results for this package are not yet re-measured"). Del mismo modo, todas las puertas de correccion (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `agent_think_off`, `sampling`, `logits`, `decision`) figuran como "not yet re-measured" en ambas plataformas, por lo que no hay evidencia registrada de su cumplimiento.

## Requisitos de hardware

- VRAM estimada para inferencia: el fichero Q4_K_M de un modelo de 14B ocupa del orden de 9 GB; el paquete no publica una cifra oficial de VRAM ni de memoria del pool.
- GPU objetivo declaradas: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- Compatibilidad con GPU consumer: no disponible; el paquete solo declara soporte para las dos plataformas AMD anteriores.
- Opciones de despliegue: `loom-serve` del paquete `hrx-loom[hf]==0.2.0`, instalado via `pipx`, con `loom-fetch` para descargar el paquete desde Hugging Face. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI en este artefacto.
- Parametros de servicio relevantes: `--device=amdgpu://?completion_spin_ns=4294967295`, `--pool_backing=fixed`, `--parameter_mode=preload`.
- Latencia y throughput: no disponibles; las filas de rendimiento no se han vuelto a medir.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| `loom-draft/bartowski-Qwen2.5-14B-Instruct-loom` | 14B | 32.768 tokens por peticion | `.loom` + GGUF Q4_K_M | apache-2.0 | Paquete de despliegue para Loom en GPU AMD gfx1151 y gfx1201; sin mediciones ni puertas de correccion registradas |
| `bartowski/Qwen2.5-14B-Instruct-GGUF` | 14B | no disponible en la informacion proporcionada | GGUF (multiples cuantizaciones) | apache-2.0 | Checkpoint de origen; sirve como referencia de correccion en las puertas `golden` y `compare` del paquete Loom |
| Qwen2.5-14B-Instruct (oficial) | 14B | no disponible en la informacion proporcionada | safetensors | apache-2.0 | Modelo base original de Alibaba; no se detallan en la informacion proporcionada sus especificaciones completas |

## Limitaciones y advertencias

- Artefacto en estado de borrador: publicado bajo el espacio `loom-draft`, con cero descargas y cero likes en el momento de la consulta; no debe tratarse como una version estable.
- Sin evidencia de correccion registrada: todas las puertas de `loom-benchmark` figuran como "not yet re-measured" en ambas plataformas, por lo que no hay prueba publicada de que la salida coincida con la referencia de llama.cpp.
- Sin mediciones de rendimiento: no hay datos de latencia ni de throughput frente a llama.cpp en Strix Halo ni en Radeon AI PRO R9700.
- Restriccion de hardware: el paquete solo declara soporte para AMD Ryzen AI Max+ 395 (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB); no se documenta compatibilidad con otras GPU.
- Dependencia de un runtime especifico: requiere `hrx-loom[hf]==0.2.0` y el flujo `loom-fetch` / `loom-serve`; no es un GGUF generico que se pueda cargar en llama.cpp, Ollama o vLLM.
- Capacidades ausentes: sin vision, sin audio, sin modo thinking, sin decodificacion especulativa; el estado del muestreo figura como "no determinado".
- Cuantizacion unica: solo se ofrece Q4_K_M, con la perdida de precision asociada frente al checkpoint en safetensors.
- Idiomas no declarados: la model card del paquete no especifica los idiomas soportados.
- Riesgo de alucinacion y sesgos: no documentados en la informacion proporcionada para este paquete; se heredan los del modelo base Qwen2.5-14B-Instruct, no descritos aqui.
- Licencia: apache-2.0, que permite uso comercial, pero conviene verificar las condiciones del checkpoint base y del GGUF de origen antes de desplegar en produccion.

## Enlaces

- Paquete en Hugging Face: https://huggingface.co/loom-draft/bartowski-Qwen2.5-14B-Instruct-loom
- Checkpoint GGUF de origen: https://huggingface.co/bartowski/Qwen2.5-14B-Instruct-GGUF
- Repositorio del runtime Loom (HRX/ROCm): https://github.com/ROCm/hrx-system
- Generador `loom-next`: https://github.com/loom-fun/loom-next
- Sitio del ecosistema Loom: https://loom-fun.github.io/loom-dev/
