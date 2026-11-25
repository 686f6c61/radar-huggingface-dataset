# loom-draft/unsloth-GLM-4-9B-0414-loom

## Resumen

Este repositorio no contiene un modelo de lenguaje nuevo, sino un paquete de despliegue para AMD Loom: un conjunto de programas `.loom` y un fichero `model.json` que permiten servir el checkpoint GGUF `GLM-4-9B-0414-Q4_K_M.gguf` de Unsloth sobre las GPU AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y Radeon AI PRO R9700 (gfx1201, 32 GB). Lo publica el usuario `loom-draft` y se ha generado con la herramienta `loom-next`, sin intervención de un LLM en el proceso de generación.

El modelo subyacente es GLM-4-9B-0414, un transformer de aproximadamente 9.000 millones de parámetros de la familia GLM-4 de Zhipu AI, cuantizado a Q4_K_M. El paquete expone una API compatible con OpenAI (`/v1/chat/completions`), soporta 32.768 tokens de contexto por petición, cuatro peticiones concurrentes y un máximo de 4.096 tokens de salida según el preset.

Su relevancia es acotada y muy específica: demuestra un flujo de empaquetado para ejecutar GGUF sobre ROCm en hardware AMD consumer y de estación de trabajo, con compuertas de corrección (`kernel_tests`, `golden`, `compare`, `agent`, `logits`, etc.) definidas contra llama.cpp. En el momento de la publicación, ninguna de esas compuertas ni las mediciones de rendimiento estaban re-medidas para este paquete; el propio autor lo indica con "not yet re-measured".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (GLM-4-9B-0414); empaquetado Loom para ROCm |
| Parametros totales | no disponible (el nombre del checkpoint indica 9B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 32.768 tokens por peticion |
| Tipos de cuantizacion | Q4_K_M (GGUF) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (`GLM-4-9B-0414-Q4_K_M.gguf`) empaquetado como programas `.loom` + `weights.loom` |
| Salida maxima | 4.096 tokens (preset `max_tokens`) |
| Concurrencia | 4 peticiones simultaneas |
| API | OpenAI-style `/v1/chat/completions` en `127.0.0.1:8080` |
| Hardware objetivo | AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151); AMD Radeon AI PRO R9700 (gfx1201, 32 GB) |
| Version del runtime | `hrx-loom[hf]==0.2.0` |

## Arquitectura y entrenamiento

El paquete no define una arquitectura propia: envuelve el checkpoint GLM-4-9B-0414 de Zhipu AI, servido a traves de los programas `.loom` generados por `loom-next`. El runtime compila kernels para ROCm y los ejecuta sobre las GPU objetivo, con un pool de memoria de respaldo fijo (`--pool_backing=fixed`) y precarga de parametros en host (`--parameter_mode=preload`). El tokenizador se entrega como `tokenizer.json` y la configuracion del modelo como `llm_config.json`.

No se proporcionan en la informacion disponible datos sobre el corpus de entrenamiento del modelo base, el numero de tokens vistos, ni si hubo RLHF, DPO u otras fases de alineamiento. Tampoco se documentan innovaciones de decodificacion: la tabla de caracteristicas marca la decodificacion especulativa como "not applicable". El paquete incluye un conjunto de compuertas de correccion (comparacion token a token contra llama.cpp, logits en host, consistencia bajo concurrencia, bucles de tool calling, muestreo), pero todas aparecen como "not yet re-measured" para ambas GPU.

## Capacidades

- Generacion de texto y conversacion multi-turno mediante API compatible con OpenAI.
- Contexto de hasta 32.768 tokens por peticion, adecuado para documentos largos o historiales extensos.
- Hasta cuatro peticiones concurrentes con consistencia verificable (compuerta `consistency` definida, aunque sin medicion registrada).
- Muestreo configurable (`temperature`, `top_k`, `seed`) segun la compuerta `sampling` definida en el paquete.
- Lectura de logits en host (`llm.logits`) para inspeccion y evaluacion.
- Tool calling: marcado como "not applicable" en la tabla de caracteristicas del paquete.
- Modo razonamiento / thinking: marcado como "not applicable".
- Entrada de imagen y audio: marcadas como "not applicable".
- Decodificacion especulativa: marcada como "not applicable".

## Casos de uso

- Despliegue local en estaciones AMD: servir GLM-4-9B-0414 en una Radeon AI PRO R9700 de 32 GB mediante `loom-serve`, sin depender de CUDA ni de servicios en la nube, usando el flujo `loom-fetch` + `loom-serve` documentado.
- Prototipado en Strix Halo: ejecutar un modelo de 9B cuantizado a Q4_K_M en un Ryzen AI Max+ 395 para pruebas de integracion de aplicaciones que consumen una API compatible con OpenAI.
- Evaluacion de runtimes ROCm: comparar el comportamiento del paquete Loom contra llama.cpp usando las compuertas `golden` y `compare` (tokens greedy y top-5 log-probs sobre prompts cortos y documentos de 1k a 32k).
- Procesamiento de documentos largos: analisis o resumen de textos de hasta 32.768 tokens en una sola peticion, util para informes tecnicos o expedientes.
- Servicio de chat interno de baja concurrencia: con cuatro peticiones simultaneas y 4.096 tokens de salida maxima, encaja en herramientas internas de equipo con trafico moderado.
- Banco de pruebas de cuantizacion: validar el impacto de Q4_K_M frente a otras cuantizaciones del mismo checkpoint usando la lectura de logits en host y la compuerta `logits`.
- Integracion en pipelines de evaluacion: emplear `info.json` y `REPORT.md` como evidencia reproducible de versiones y mediciones en procesos de CI de modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que las mediciones de rendimiento frente a llama.cpp para Strix Halo (gfx1151) y Radeon AI PRO R9700 (gfx1201) "are not yet re-measured", y que todas las compuertas de correccion figuran como "not yet re-measured".

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; el checkpoint es Q4_K_M de un modelo de ~9B, y el paquete esta pensado para GPU con 32 GB (Radeon AI PRO R9700) y para la memoria unificada del Ryzen AI Max+ 395.
- GPU objetivo declaradas: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- GPU NVIDIA: no soportadas por este paquete (el runtime es ROCm/AMD Loom).
- Despliegue: `pipx install "hrx-loom[hf]==0.2.0"`, `loom-fetch huggingface:loom-draft/unsloth-GLM-4-9B-0414-loom:chat --materialize=copy --output=glm-4-9b-0414` y `loom-serve --model=glm-4-9b-0414 '--device=amdgpu://?completion_spin_ns=4294967295' --pool_backing=fixed --parameter_mode=preload`.
- Alternativas de despliegue para el mismo GGUF: llama.cpp (referencia usada por las compuertas), aunque no se documentan en este paquete.
- Latencia y throughput: no disponibles; no se han registrado mediciones para este paquete.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Despliegue |
|---|---|---|---|---|---|
| loom-draft/unsloth-GLM-4-9B-0414-loom | ~9B (segun nombre) | 32.768 | Q4_K_M | MIT | AMD Loom (ROCm) |
| unsloth/GLM-4-9B-0414-GGUF (modelo base) | ~9B | no disponible en la informacion | GGUF (varias) | MIT | llama.cpp y otros runtimes GGUF |
| GLM-4-9B-0414 (original Zhipu AI) | ~9B | no disponible en la informacion | safetensors (original) | no disponible en la informacion | vLLM, TGI y otros |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- Paquete sin mediciones: rendimiento y compuertas de correccion aparecen como "not yet re-measured" para ambas GPU; no hay evidencia registrada de que la salida coincida con llama.cpp en este empaquetado.
- Alcance de hardware muy restringido: solo Strix Halo (gfx1151) y Radeon AI PRO R9700 (gfx1201); no es portable a NVIDIA ni a otras GPU AMD sin regenerar el paquete.
- Sin tool calling, sin modo thinking, sin vision ni audio segun la tabla de caracteristicas; no apto para flujos de agentes que requieran esas capacidades.
- Concurrencia limitada a cuatro peticiones y salida maxima de 4.096 tokens; puede quedarse corto en cargas de produccion.
- Idiomas soportados no documentados; no se puede garantizar calidad multilingue sin evaluacion previa.
- El modelo subyacente puede alucinar y arrastrar sesgos del corpus original; no se documentan mitigaciones en este paquete.
- La licencia MIT se declara a nivel de paquete; conviene verificar los terminos del checkpoint base y del modelo GLM-4-9B-0414 original antes de uso comercial.
- Repositorio con cero descargas y cero likes en el momento de la consulta; sin validacion de la comunidad.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/loom-draft/unsloth-GLM-4-9B-0414-loom
- Modelo base GGUF: https://huggingface.co/unsloth/GLM-4-9B-0414-GGUF
- Runtime Loom (ROCm): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Sitio del ecosistema Loom: https://loom-fun.github.io/loom-dev/
- Los resultados de busqueda web obtenidos corresponden a Loom (loom.com, loom.fr) y no guardan relacion con este paquete; se descartan como fuentes.
