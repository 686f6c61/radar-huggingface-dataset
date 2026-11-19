# loom-draft/unsloth-gpt-oss-20b-loom

## Resumen

`loom-draft/unsloth-gpt-oss-20b-loom` es un paquete de despliegue en formato Loom (programas `.loom` y una tarjeta `model.json`) para el checkpoint GGUF sin modificar `gpt-oss-20b-Q4_K_M.gguf` de `unsloth/gpt-oss-20b-GGUF`. Lo publica el usuario `loom-draft` y esta generado con la herramienta `loom-next`, un generador que produce kernels y programas especificos para GPUs AMD sin intervencion de un LLM en el bucle. El objetivo no es entrenar ni afinar un modelo nuevo, sino empaquetar el modelo GPT-OSS 20B de OpenAI (distribuido por Unsloth en cuantizacion Q4_K_M) para que se ejecute de forma nativa sobre hardware AMD concretamente el Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y la Radeon AI PRO R9700 (gfx1201, 32 GB).

El modelo subyacente es GPT-OSS 20B, un transformer denso de 20 mil millones de parametros con ventana de contexto de 131.072 tokens, capacidad de razonamiento con niveles de esfuerzo (`reasoning_effort`: low, medium, high) y soporte de tool calling estilo OpenAI. El paquete anade una capa de servicio `loom-serve` que expone un endpoint compatible con `/v1/chat/completions`, con concurrencia de 4 peticiones y un maximo de 4.096 tokens de salida por peticion.

La relevancia de esta ficha es doble: por un lado documenta una via de despliegue alternativa a llama.cpp para GPUs AMD de consumo y profesionales; por otro, advierte de que el repositorio esta practicamente vacio (tamano de 0.0 GB, 0 descargas, 0 likes) y de que las mediciones de rendimiento y las puertas de correccion (`kernel_tests`, `golden`, `compare`, etc.) no estan re-medidas para este paquete. Es, por tanto, un artefacto experimental mas que una distribucion lista para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (modelo base GPT-OSS 20B); paquete Loom con kernels generados para AMD |
| Parametros totales | 20 mil millones (modelo base GPT-OSS 20B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 131.072 tokens por peticion |
| Tipos de cuantizacion | Q4_K_M (unico checkpoint incluido) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (`gpt-oss-20b-Q4_K_M.gguf`) empaquetado en programas `.loom` y `weights.loom` |
| Tamano del repositorio | 0.0 GB (segun Hugging Face) |
| Hardware objetivo | AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151); AMD Radeon AI PRO R9700 (gfx1201, 32 GB) |
| API servida | OpenAI-style `/v1/chat/completions` |
| Concurrencia | 4 peticiones concurrentes |
| Maximo de tokens de salida | 4.096 (preset `max_tokens`) |
| Decodificacion especulativa | no aplicable |
| Entrada de imagen / audio | no aplicable |

## Arquitectura y entrenamiento

El paquete no entrena ni modifica el modelo: reutiliza el checkpoint GGUF Q4_K_M de GPT-OSS 20B publicado por Unsloth y genera, mediante `loom-next`, un conjunto de programas `.loom` y kernels especificos para las arquitecturas AMD gfx1151 (Strix Halo) y gfx1201 (Radeon AI PRO R9700). El modelo subyacente es un transformer denso de 20B parametros; la informacion disponible no detalla la composicion del dataset de preentrenamiento, el numero de tokens vistos ni si hubo fases de RLHF o DPO. Tampoco se especifican innovaciones de atencion (linear attention, decodificacion especulativa u otras) mas alla de que la decodificacion especulativa se marca como "no aplicable" en la tabla de caracteristicas del paquete.

La innovacion tecnica relevante esta en la capa de despliegue: `loom-serve` permite fijar el pool de memoria por adelantado (`--pool_backing=fixed`), precargar pesos en host (`--parameter_mode=preload`) y activar espera activa de finalizaciones de GPU (`completion_spin_ns=4294967295`). Segun la model card, estas opciones afectan a como se cargan los pesos y a como se gestiona la memoria, pero las filas de rendimiento se midieron sin `--parameter_mode=preload` salvo que el trabajo correspondiente lo usara. No se documenta el proceso de cuantizacion Q4_K_M ni la perdida de calidad asociada.

## Capacidades

- Generacion de texto y razonamiento con modo "thinking" siempre activo.
- Control del esfuerzo de razonamiento mediante `reasoning_effort` con valores `low`, `medium` y `high` (por defecto `medium`).
- Tool calling estilo OpenAI: acepta `tools` y devuelve `tool_calls` en el formato de la API de chat completions.
- Soporte de bucles multi-turno con herramientas (la model card incluye una puerta `agent` para validar el renderizado exacto del prompt, la reutilizacion de historial y la validez de las llamadas).
- Ventana de contexto de 131.072 tokens por peticion, adecuada para documentos largos y conversaciones extensas.
- Concurrencia de hasta 4 peticiones simultaneas.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Vision y audio: no aplicables segun la tabla de caracteristicas del paquete.
- Muestreo (`temperature`, `top_k`, `seed`): marcado como "not determined" en la tabla de caracteristicas, aunque existe una puerta `sampling` para verificarlo.

## Casos de uso

- Despliegue de un asistente conversacional local en estaciones de trabajo con GPU AMD: el paquete `loom-serve` expone un endpoint compatible con OpenAI, de modo que herramientas que ya hablan con la API de OpenAI pueden apuntar a `http://127.0.0.1:8080/v1/chat/completions` sin cambios en el codigo.
- Prototipado de agentes con tool calling sobre hardware AMD: la combinacion de `tools`/`tool_calls` y el bucle multi-turno validado por la puerta `agent` permite construir agentes que consultan APIs externas, ejecutan funciones y encadenan pasos.
- Analisis de documentos largos: con 131.072 tokens de contexto, el modelo puede ingerir contratos, informes o bases de codigo extensas en una sola peticion, util para resumenes y extraccion de entidades.
- Razonamiento controlado por coste: el parametro `reasoning_effort` permite bajar a `low` para tareas simples (clasificacion, respuestas cortas) y subir a `high` para problemas de matematicas o logica, ajustando latencia y consumo.
- Evaluacion comparativa de backends de inferencia: investigadores que quieran comparar `loom-serve` frente a llama.cpp sobre el mismo GGUF pueden usar las puertas de correccion (`golden`, `compare`, `logits`) como marco de validacion, aunque en este paquete aparecen como "not yet re-measured".
- Entornos con requisitos de licencia permisiva: al ser Apache 2.0, el paquete puede integrarse en productos comerciales sin obligaciones de copyleft, siempre que se respete la licencia del modelo base.
- Laboratorio de pruebas para kernels generados: el repositorio incluye `program/*.loom`, `weights.loom` y `llm_config.json`, lo que permite inspeccionar y modificar los programas generados por `loom-next`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que las mediciones de rendimiento para Strix Halo (gfx1151) y Radeon AI PRO R9700 (gfx1201) "are not yet re-measured", y todas las puertas de correccion (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `agent_think_off`, `sampling`, `logits`, `decision`) aparecen como "not yet re-measured" en ambas GPUs. No se dispone de cifras de MMLU, HumanEval, GSM8K ni de throughput o latencia medidos para este paquete.

## Requisitos de hardware

- VRAM estimada: el checkpoint es Q4_K_M de un modelo de 20B parametros; la informacion disponible no proporciona una cifra de VRAM medida. Como referencia de orden de magnitud, un GGUF Q4_K_M de 20B suele ocupar en torno a 12-14 GB en disco, aunque el paquete Loom puede requerir memoria adicional para el pool fijo y los buffers de inferencia.
- GPU objetivo declaradas: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- Compatibilidad con GPU de consumo: no confirmada en la informacion disponible; el paquete esta generado especificamente para las dos arquitecturas AMD citadas.
- Opciones de despliegue: `hrx-loom[hf]==0.2.0` (via `pipx`), con `loom-fetch` para descargar el paquete y `loom-serve` para servirlo. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI en este paquete concreto.
- Latencia y throughput: no disponibles; la model card no incluye cifras medidas para este paquete.
- Concurrencia maxima: 4 peticiones simultaneas segun la tabla de caracteristicas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| `loom-draft/unsloth-gpt-oss-20b-loom` | 20B (denso) | 131.072 | Apache 2.0 | GGUF + programas `.loom` | Paquete especifico para AMD gfx1151 y gfx1201; sin benchmarks re-medidos |
| `unsloth/gpt-oss-20b-GGUF` | 20B (denso) | 131.072 (segun modelo base) | Apache 2.0 | GGUF | Checkpoint de origen; ejecutable con llama.cpp y otros runners GGUF |
| GPT-OSS 20B (original) | 20B (denso) | 131.072 | Apache 2.0 | safetensors / GGUF (segun distribucion) | Modelo base de OpenAI; la informacion disponible no detalla sus benchmarks en esta ficha |

No se dispone de datos de rendimiento comparativo entre estas opciones en la informacion proporcionada. La comparativa se limita a parametros, contexto, licencia y formato.

## Limitaciones y advertencias

- Repositorio practicamente vacio: 0.0 GB de tamano, 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en produccion.
- Sin benchmarks ni puertas de correccion re-medidas: todas las puertas aparecen como "not yet re-measured", por lo que no hay garantia documentada de que la salida coincida con la referencia de llama.cpp.
- Muestreo no determinado: la tabla de caracteristicas marca `sampling` como "not determined"; el comportamiento de `temperature`, `top_k` y `seed` no esta verificado.
- Hardware muy especifico: el paquete esta generado para gfx1151 (Strix Halo) y gfx1201 (Radeon AI PRO R9700); no se documenta compatibilidad con otras GPUs AMD o NVIDIA.
- Concurrencia limitada a 4 peticiones y salida maxima de 4.096 tokens por peticion, lo que puede ser insuficiente para cargas de produccion intensivas.
- Idiomas soportados no disponibles: no se puede confirmar el rendimiento en castellano ni en otros idiomas distintos del ingles.
- Riesgo de alucinacion inherente al modelo base GPT-OSS 20B; no se documentan mitigaciones especificas en este paquete.
- Sesgos conocidos del modelo base: no documentados en la informacion proporcionada.
- Licencia Apache 2.0 permisiva para uso comercial, pero conviene verificar las condiciones del checkpoint de origen (`unsloth/gpt-oss-20b-GGUF`) y del modelo GPT-OSS original.
- Dependencia de la herramienta `loom-next` y del runtime `hrx-loom` version 0.2.0; cambios de version pueden romper la compatibilidad.
- El modo de razonamiento esta siempre activo, lo que incrementa el consumo de tokens y la latencia frente a modelos sin "thinking".

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/loom-draft/unsloth-gpt-oss-20b-loom
- Checkpoint de origen: https://huggingface.co/unsloth/gpt-oss-20b-GGUF
- Runtime Loom (ROCm): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Sitio del ecosistema Loom: https://loom-fun.github.io/loom-dev/
