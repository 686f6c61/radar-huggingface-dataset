# loom-draft/bartowski-Qwen2.5-3B-Instruct-loom

## Resumen

`loom-draft/bartowski-Qwen2.5-3B-Instruct-loom` es un paquete de despliegue para AMD Loom, no un modelo entrenado desde cero. Empaqueta el checkpoint GGUF sin modificar `Qwen2.5-3B-Instruct-Q4_K_M.gguf` de bartowski junto con programas `.loom` generados y una tarjeta `model.json`, orientados a las GPU AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB). El generador empleado es `loom-next`, sin intervención de un LLM en el bucle.

El modelo subyacente es Qwen2.5-3B-Instruct, un transformer denso de 3.000 millones de parámetros de la familia Qwen2.5 de Alibaba, aquí en cuantización Q4_K_M. El paquete expone una API compatible con OpenAI (`/v1/chat/completions`), soporta tool calling, una ventana de 32.768 tokens por petición y 4 peticiones concurrentes, con un máximo de 4.096 tokens de salida por preset.

La relevancia es acotada: se trata de un artefacto de borrador (`loom-draft`) con 0 descargas y 0 likes, creado y actualizado el 19 de noviembre de 2026, cuyas mediciones de rendimiento y puertas de corrección aún no se han vuelto a medir para esta versión. Es útil como referencia de integración de Loom en hardware AMD, no como checkpoint de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen2.5); empaquetado como programas Loom sobre GGUF |
| Parametros totales | 3.000 millones (modelo base Qwen2.5-3B-Instruct) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 32.768 tokens por petición |
| Tipos de cuantizacion | Q4_K_M (GGUF) |
| Idiomas soportados | no disponible |
| Licencia | other (heredada del paquete; ver limitaciones) |
| Formato de pesos | GGUF de origen; empaquetado como `program/*.loom` y `weights.loom`, con `tokenizer.json`, `llm_config.json`, `model.json` e `info.json` |
| Salida maxima | 4.096 tokens (preset `max_tokens`) |
| Concurrencia | 4 peticiones simultaneas |
| Hardware objetivo | AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151); AMD Radeon AI PRO R9700 (gfx1201, 32 GB) |
| Runtime | `hrx-loom[hf]==0.2.0` (`loom-fetch`, `loom-serve`) |

## Arquitectura y entrenamiento

El paquete no introduce entrenamiento propio: reutiliza el checkpoint Qwen2.5-3B-Instruct en Q4_K_M de bartowski sin modificaciones. La capa aportada por Loom son programas `.loom` generados por `loom-next` que implementan los kernels de inferencia para las arquitecturas AMD objetivo, más un `model.json` con los ficheros fuente fijados por sha256 (verificado por `loom-fetch`). El `llm_config.json` recoge la configuración desde la que se generaron los programas.

Los datos de entrenamiento del modelo subyacente (número de tokens, composición del dataset, uso de RLHF o DPO) no se detallan en la información proporcionada. Tampoco se documentan innovaciones de decodificación: la tabla de características marca decodificación especulativa, modo de razonamiento y esfuerzo de razonamiento como "not applicable", y el muestreo queda como "not determined".

## Capacidades

- Generación de texto conversacional vía API compatible con OpenAI (`/v1/chat/completions`).
- Tool calling estilo OpenAI, con campos `tools` y `tool_calls`.
- Bucles de tool calling multi-turno (existe una puerta de corrección `agent` específica, aunque sin medición registrada).
- Ventana de contexto de 32.768 tokens por petición, suficiente para documentos medios y conversaciones largas.
- Concurrencia de 4 peticiones simultáneas.
- Sin soporte de razonamiento/thinking, decodificación especulativa, entrada de imagen ni audio (marcados como "not applicable").
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Asistente conversacional local en estaciones de trabajo con GPU AMD: el paquete se sirve con `loom-serve` y expone un endpoint compatible con OpenAI, de modo que clientes existentes funcionan sin cambios sobre hardware Strix Halo o R9700.
- Automatización de agentes con herramientas: el soporte de `tools`/`tool_calls` y las 4 peticiones concurrentes permiten orquestar flujos de varios pasos (consulta de APIs, cálculo, recuperación) en local.
- Procesamiento de documentos de hasta 32k tokens: resumen, extracción de entidades y preguntas sobre contratos o informes que quepan en la ventana por petición.
- Prototipado en CI/CD de integraciones LLM: al ser un artefacto reproducible (ficheros fijados por sha256), sirve para validar pipelines que luego se migran a otros runtimes.
- Evaluación comparativa de runtimes AMD: las puertas `golden` y `compare` están diseñadas para contrastar token a token contra llama.cpp sobre el mismo GGUF, lo que permite medir fidelidad de la implementación Loom.
- Inferencia de bajo coste en escritorio: con Q4_K_M y 3B de parámetros, el modelo cabe en GPUs de consumo con suficiente VRAM, útil para tareas de clasificación, reescritura y asistencia ligera.
- Servicio interno de chat con límite de salida: el preset de 4.096 tokens de salida acota coste y latencia en aplicaciones de respuesta corta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que los resultados de rendimiento para Strix Halo (gfx1151) y Radeon AI PRO R9700 (gfx1201) "no se han vuelto a medir" para este paquete, y que todas las puertas de corrección (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `agent_think_off`, `sampling`, `logits`, `decision`) figuran como "not yet re-measured".

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el checkpoint es Q4_K_M de un modelo de 3B, por lo que el peso de los parámetros ronda los 2 GB, a lo que hay que sumar caché KV para 32k de contexto y el pool de memoria del preset.
- GPU validadas por el autor: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- GPU de consumo: no se documenta compatibilidad con GPUs de consumo; el runtime está orientado a `amdgpu://` en las arquitecturas citadas.
- Despliegue: `pipx install "hrx-loom[hf]==0.2.0"`, `loom-fetch` para materializar el paquete y `loom-serve` para servirlo. Opciones relevantes: `--materialize=copy`, `--pool_backing=fixed`, `--parameter_mode=preload` y `completion_spin_ns=4294967295` (espera activa de finalizaciones de GPU, usada en las mediciones de la tarjeta).
- Latencia y throughput: no disponibles; las filas de rendimiento de la tarjeta no se han vuelto a medir.
- Alternativa de despliegue sobre el mismo GGUF: llama.cpp, que la tarjeta usa como referencia para las puertas de corrección.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| bartowski/Qwen2.5-3B-Instruct-GGUF (Q4_K_M) | 3B | no disponible en esta ficha | GGUF | other | Checkpoint de origen sin modificar; ejecutable en llama.cpp y otros runtimes GGUF |
| loom-draft/bartowski-Qwen2.5-3B-Instruct-loom | 3B | 32.768 tokens por peticion | GGUF empaquetado en `.loom` | other | Mismo checkpoint con kernels Loom para gfx1151 y gfx1201; sin mediciones registradas |
| Qwen2.5-3B-Instruct (original) | 3B | no disponible en esta ficha | safetensors | no disponible en esta ficha | Pesos de referencia del modelo base |

La comparación con alternativas de la misma categoría (otros modelos de 3B) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Artefacto de borrador: 0 descargas, 0 likes y publicación bajo el espacio `loom-draft`; no debe tratarse como una versión estable.
- Sin evidencia de corrección: todas las puertas de la tabla de correctness figuran como "not yet re-measured", incluida la comparación token a token contra llama.cpp.
- Sin datos de rendimiento: no hay latencia ni throughput medidos para esta versión del paquete.
- Licencia "other": no se especifican los términos exactos en la información disponible; es imprescindible revisar la licencia del modelo base Qwen2.5-3B-Instruct y la del paquete antes de un uso comercial.
- Idiomas soportados no documentados; no se puede garantizar calidad fuera de los idiomas del modelo base.
- Sin modo de razonamiento ni decodificación especulativa; el muestreo está marcado como "not determined".
- Riesgo de alucinación inherente a un modelo de 3B en cuantización Q4_K_M; verificar salidas en tareas factuales.
- Dependencia de hardware concreto (gfx1151, gfx1201) y del runtime `hrx-loom==0.2.0`; no es portable a otras GPUs sin regenerar el paquete.
- El contexto de 32k por petición con 4 peticiones concurrentes exige dimensionar el pool de memoria; `--pool_backing=fixed` reserva la memoria por adelantado.

## Enlaces

- Hugging Face: https://huggingface.co/loom-draft/bartowski-Qwen2.5-3B-Instruct-loom
- Modelo base (GGUF): https://huggingface.co/bartowski/Qwen2.5-3B-Instruct-GGUF
- Repositorio Loom (ROCm): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Sitio del ecosistema Loom: https://loom-fun.github.io/loom-dev/
