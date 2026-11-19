# loom-draft/unsloth-Magistral-Small-2509-loom

## Resumen

`loom-draft/unsloth-Magistral-Small-2509-loom` es un paquete de despliegue en formato Loom (programas `.loom` y una tarjeta `model.json`) generado a partir del checkpoint GGUF `unsloth/Magistral-Small-2509-GGUF`, en su variante `Magistral-Small-2509-Q4_K_M.gguf`. No es un modelo entrenado desde cero ni un fine-tune: es un artefacto de empaquetado e inferencia generado con `loom-next` (el generador, sin LLM en el bucle) para ejecutar el modelo original sobre GPUs AMD concretas, en particular el Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y la Radeon AI PRO R9700 (gfx1201, 32 GB).

El paquete expone una API compatible con OpenAI (`/v1/chat/completions`) mediante `loom-serve`, con un contexto declarado de 131.072 tokens por petición, hasta 4 peticiones concurrentes y un máximo de 4.096 tokens de salida según el preset. La licencia declarada es Apache 2.0, heredada del modelo base, y el autor publica el paquete con 0 descargas y 0 likes en el momento de la consulta, lo que lo convierte en un artefacto reciente y sin validación comunitaria.

Su relevancia es acotada pero específica: demuestra un flujo de despliegue alternativo a llama.cpp para modelos GGUF cuantizados en hardware AMD, con verificación de kernels y comparación contra referencias de llama.cpp. No obstante, la propia tarjeta indica que las mediciones de rendimiento y las puertas de corrección no se han vuelto a medir para este paquete, por lo que su madurez en producción es limitada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (heredada del modelo base Magistral-Small-2509; el paquete no la documenta) |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | 131.072 tokens por petición |
| Tipos de cuantización | Q4_K_M (checkpoint `Magistral-Small-2509-Q4_K_M.gguf`) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (empaquetado en programas `.loom` y `weights.loom`) |

Otros datos del paquete: API compatible con OpenAI, 4 peticiones concurrentes, `max_tokens` del preset fijado en 4.096, tokenizador incluido en `tokenizer.json` y configuración en `llm_config.json`.

## Arquitectura y entrenamiento

No hay información sobre la arquitectura interna ni sobre el proceso de entrenamiento en la documentación proporcionada. El paquete no entrena ni modifica pesos: toma el GGUF `Magistral-Small-2509-Q4_K_M.gguf` de `unsloth/Magistral-Small-2509-GGUF` y genera programas Loom (`program/*.loom`, `weights.loom`) a partir de `llm_config.json`. La generación la realiza `loom-next`, descrito explícitamente como "el generador solo, sin LLM en el bucle".

La innovación técnica del artefacto no está en el modelo, sino en el runtime: kernels generados para gfx1151 y gfx1201, un pool de memoria de respaldo fijo (`--pool_backing=fixed`), precarga de parámetros (`--parameter_mode=preload`) y espera activa de finalizaciones de GPU (`completion_spin_ns=4294967295`). El paquete incluye puertas de corrección (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `agent_think_off`, `sampling`, `logits`, `decision`) que comparan contra referencias de llama.cpp, pero todas aparecen como "not yet re-measured" en la tarjeta.

## Capacidades

- Generación de texto y conversación multi-turno mediante API compatible con OpenAI.
- Contexto largo: hasta 131.072 tokens por petición, útil para documentos extensos.
- Concurrencia de hasta 4 peticiones simultáneas.
- Salida limitada a 4.096 tokens por respuesta según el preset `max_tokens`.
- Tool calling: marcado como "not applicable" en la tabla de características del paquete.
- Razonamiento / thinking: marcado como "not applicable".
- Esfuerzo de razonamiento (reasoning effort): "not applicable".
- Decodificación especulativa: "not applicable".
- Entrada de imagen: no soportada por Loom, aunque el modelo original sí la tiene según la tarjeta.
- Entrada/salida de audio: "not applicable".
- Muestreo: estado "?" (no determinado).
- Idiomas: no disponible.

## Casos de uso

- Asistente conversacional autoalojado en estación de trabajo AMD: el paquete permite servir un chat con API OpenAI en un Ryzen AI Max+ 395 o una Radeon AI PRO R9700, útil para entornos donde no se quiere depender de la nube.
- Procesamiento de documentos largos: con 131.072 tokens de contexto, se pueden analizar contratos, informes o bases de código extensas en una sola petición, siempre que se acepte el límite de 4.096 tokens de salida.
- Prototipado de aplicaciones con SDK de OpenAI: al exponer `/v1/chat/completions`, se puede apuntar el cliente oficial al endpoint local `http://127.0.0.1:8080` sin cambiar el código de la aplicación.
- Evaluación de hardware AMD para inferencia: sirve como banco de pruebas para comparar el rendimiento de Loom frente a llama.cpp en gfx1151 y gfx1201, aunque las métricas del paquete aún no estén re-medidas.
- Despliegue en entornos con requisitos de licencia permisiva: la licencia Apache 2.0 facilita su integración en productos comerciales, sujeto a las obligaciones de atribución.
- Servicio interno de baja concurrencia: con 4 peticiones concurrentes, encaja en equipos de trabajo pequeños o herramientas internas más que en servicios de alta demanda.
- Reproducibilidad de pipelines: el paquete incluye `model.json.lock` con hashes sha256 de los ficheros de origen, lo que permite verificar la integridad de los pesos descargados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La tarjeta indica explícitamente que, tanto para Strix Halo (gfx1151) como para Radeon AI PRO R9700 (gfx1201), "the results for this package are not yet re-measured". Las puertas de corrección (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `agent_think_off`, `sampling`, `logits`, `decision`) figuran todas como "not yet re-measured".

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el checkpoint es Q4_K_M y la Radeon AI PRO R9700 tiene 32 GB, lo que sugiere que el paquete está dimensionado para caber en esa VRAM, pero no se confirma.
- GPU soportadas: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- GPU de consumo: no se documenta compatibilidad con GPUs consumer NVIDIA ni con otras AMD distintas de las dos indicadas.
- Despliegue: `pipx install "hrx-loom[hf]==0.2.0"`, `loom-fetch` para descargar el paquete y `loom-serve` para servirlo. No se mencionan vLLM, llama.cpp, Ollama ni TGI para este artefacto.
- Opciones de servicio: `--device=amdgpu://?completion_spin_ns=4294967295`, `--pool_backing=fixed`, `--parameter_mode=preload`.
- Latencia y throughput: no disponibles; las mediciones no se han vuelto a realizar para este paquete.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| `loom-draft/unsloth-Magistral-Small-2509-loom` | no disponible | 131.072 | Apache 2.0 | GGUF empaquetado en `.loom` | Paquete para AMD gfx1151/gfx1201 |
| `unsloth/Magistral-Small-2509-GGUF` | no disponible | no disponible | Apache 2.0 (heredada) | GGUF | Checkpoint de origen, sin empaquetar |
| Magistral-Small-2509 (modelo original) | no disponible | no disponible | no disponible | no disponible | Modelo base del que deriva el GGUF |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- El paquete no ha vuelto a medir ninguna de sus puertas de corrección ni sus métricas de rendimiento; no hay evidencia publicada de que funcione correctamente en las GPUs objetivo.
- Sin descargas ni likes en el momento de la consulta: no hay validación de la comunidad.
- Tool calling, razonamiento, decodificación especulativa y audio figuran como "not applicable"; el muestreo está como "no determinado".
- La entrada de imagen no está soportada por Loom, aunque el modelo original sí la tenga.
- El límite de salida es de 4.096 tokens por respuesta, lo que puede ser insuficiente para tareas de generación larga.
- Solo 4 peticiones concurrentes: no apto para cargas de producción de alta concurrencia.
- Compatibilidad limitada a las GPUs documentadas (gfx1151 y gfx1201); no se garantiza en otro hardware.
- La licencia Apache 2.0 permite uso comercial, pero conviene revisar las condiciones del modelo base y del GGUF de origen.
- Riesgo de alucinación y sesgos: no documentados en la información disponible; aplican los del modelo base.
- Idiomas soportados: no disponibles, lo que impide garantizar calidad multilingüe.

## Enlaces

- Hugging Face: https://huggingface.co/loom-draft/unsloth-Magistral-Small-2509-loom
- Modelo base GGUF: https://huggingface.co/unsloth/Magistral-Small-2509-GGUF
- Repositorio Loom (ROCm): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Web del ecosistema Loom: https://loom-fun.github.io/loom-dev/
