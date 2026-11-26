# loom-draft/bartowski-Saathimed_AxonMed-32B-Thinking-loom

## Resumen

`loom-draft/bartowski-Saathimed_AxonMed-32B-Thinking-loom` es un paquete de despliegue en formato Loom para el checkpoint GGUF `bartowski/Saathimed_AxonMed-32B-Thinking-GGUF`, concretamente la cuantizacion `Q4_K_M`. No se trata de un modelo nuevo entrenado desde cero, sino de un artefacto generado con la herramienta `loom-next` que traduce los pesos GGUF originales a programas `.loom` ejecutables sobre el runtime `hrx-loom` de AMD. El objetivo es servir el modelo de forma nativa en GPUs AMD concretas: el APU Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y la Radeon AI PRO R9700 (gfx1201, 32 GB).

El modelo subyacente, Saathimed_AxonMed-32B-Thinking, es un modelo de 32.000 millones de parametros con modo de razonamiento (thinking), orientado presumiblemente al dominio medico por su nombre. El paquete Loom expone una API compatible con OpenAI (`/v1/chat/completions`), soporte de tool calling, una ventana de contexto de 32.768 tokens por peticion y hasta 4 peticiones concurrentes, con un maximo de 4.096 tokens de salida por preset.

La relevancia de esta ficha es doble: por un lado documenta un ejemplo de empaquetado Loom para hardware AMD de consumo y profesional; por otro, advierte de que las mediciones de rendimiento y las puertas de correccion del paquete **aun no se han vuelto a medir** en el momento de la publicacion, por lo que no hay evidencia publicada de rendimiento ni de paridad con llama.cpp para esta build concreta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base de 32B; el paquete Loom no documenta la arquitectura interna) |
| Parametros totales | 32.000 millones (por el nombre del modelo base; no confirmado en la informacion proporcionada) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 32.768 tokens por peticion |
| Tipos de cuantizacion | Q4_K_M (GGUF) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF de origen; empaquetado como programas `.loom` y `weights.loom` |
| Salida maxima | 4.096 tokens (preset `max_tokens`) |
| Concurrencia | 4 peticiones simultaneas |
| API | compatible con OpenAI (`/v1/chat/completions`) |
| Hardware objetivo | AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151); AMD Radeon AI PRO R9700 (gfx1201, 32 GB) |
| Runtime | `hrx-loom[hf]==0.2.0` |
| Generador | `loom-next` (sin LLM en el bucle) |

## Arquitectura y entrenamiento

La informacion proporcionada no describe la arquitectura interna del modelo base Saathimed_AxonMed-32B-Thinking ni sus datos de entrenamiento (numero de tokens, composicion del dataset, uso de RLHF/DPO). Lo unico documentado es el proceso de empaquetado: `loom-next` genera programas `.loom` (kernels y grafo de ejecucion) y un fichero `weights.loom` a partir del GGUF `Q4_K_M` sin modificarlo, junto con `tokenizer.json` y una tarjeta `model.json` con los ficheros fuente fijados por hash SHA-256.

El paquete incluye un conjunto de puertas de correccion (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `agent_think_off`, `sampling`, `logits`, `decision`) disenadas para verificar paridad con llama.cpp sobre el mismo GGUF. En la version publicada, todas ellas aparecen como "not yet re-measured" para ambas GPUs, de modo que no existe evidencia registrada de correccion numerica ni de equivalencia de tokens frente a la referencia. La model card indica ademas que el modo de razonamiento y el razonamiento configurable no son aplicables en este preset, pese al sufijo "Thinking" del modelo base.

## Capacidades

- Generacion de texto conversacional mediante API compatible con OpenAI.
- Tool calling con el esquema `tools` / `tool_calls` de OpenAI.
- Bucle de agente multi-turno con reutilizacion de historial (sujeto a la puerta `agent`, aun no medida).
- Contexto de 32.768 tokens por peticion, suficiente para documentos medios y conversaciones largas.
- Hasta 4 peticiones concurrentes con consistencia declarada frente a ejecuciones aisladas (puerta `consistency`, no medida).
- Sin soporte de razonamiento explicito, effort de razonamiento, decodificacion especulativa, entrada de imagen ni audio segun la tabla de features del paquete.
- Multilingue: no disponible.

## Casos de uso

- Despliegue local en estaciones de trabajo con Ryzen AI Max+ 395: el paquete permite servir el modelo en el propio APU sin GPU discreta, usando `loom-serve` con pool de memoria fijo y precarga de parametros, util para entornos de desarrollo y prototipado sin dependencia de la nube.
- Servicio de chat interno con API OpenAI: al exponer `/v1/chat/completions`, se puede conectar directamente a clientes y frameworks que ya hablan el protocolo OpenAI (LangChain, LlamaIndex, SDK oficial) sin adaptadores.
- Asistentes con tool calling: el soporte de `tools` y `tool_calls` permite construir asistentes que consulten bases de datos, APIs o sistemas internos en un bucle multi-turno.
- Procesamiento de documentos de hasta 32k tokens: informes, historiales o contratos que quepan en la ventana de contexto pueden resumirse o consultarse en una sola peticion.
- Evaluacion de hardware AMD en produccion: sirve como banco de pruebas para comparar el rendimiento del runtime Loom frente a llama.cpp en R9700 y Strix Halo, una vez se publiquen las mediciones pendientes.
- Despliegue en Radeon AI PRO R9700 de 32 GB: con cuantizacion Q4_K_M el modelo de 32B encaja en la VRAM de la tarjeta, lo que permite servir hasta 4 conversaciones concurrentes en una unica GPU profesional.
- Entornos de investigacion medica (por el nombre del modelo base): uso potencial como asistente de consulta sobre literatura o notas clinicas, siempre con supervision humana y validacion de sesgos y alucinaciones, dado que no hay benchmarks publicados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que las mediciones de rendimiento frente a llama.cpp para Strix Halo (gfx1151) y Radeon AI PRO R9700 (gfx1201) "no se han vuelto a medir" para este paquete, y que todas las puertas de correccion aparecen sin ejecucion registrada.

## Requisitos de hardware

- VRAM estimada: el modelo base es de 32B en Q4_K_M; el paquete esta pensado para GPUs con 32 GB (R9700) y para el APU Strix Halo con memoria unificada. No se publica una cifra exacta de VRAM en la informacion disponible.
- GPU recomendadas: AMD Radeon AI PRO R9700 (gfx1201, 32 GB) y AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151).
- GPU de consumo: no se documenta compatibilidad con GPUs consumer NVIDIA ni con Radeon consumer; el paquete esta dirigido a los dos targets AMD citados.
- Despliegue: `pipx install "hrx-loom[hf]==0.2.0"`, seguido de `loom-fetch` y `loom-serve`. Opciones de servicio: `--pool_backing=fixed`, `--parameter_mode=preload` y `completion_spin_ns=4294967295` para espera activa de completaciones en GPU.
- Alternativas de despliegue no documentadas para este paquete: no se mencionan vLLM, llama.cpp, Ollama ni TGI como backends del artefacto Loom; llama.cpp solo aparece como referencia de correccion.
- Latencia y throughput: no disponibles (mediciones pendientes).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Hardware objetivo |
|---|---|---|---|---|---|
| Saathimed_AxonMed-32B-Thinking (paquete Loom) | 32B (segun nombre) | 32.768 | GGUF Q4_K_M empaquetado en `.loom` | MIT | AMD Strix Halo, R9700 |
| Saathimed_AxonMed-32B-Thinking-GGUF (bartowski) | 32B (segun nombre) | no disponible | GGUF | MIT (heredada) | Generico (llama.cpp y similares) |
| Modelos de 32B comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento del paquete Loom ni del modelo base en la informacion proporcionada, por lo que no es posible establecer una comparacion cuantitativa con alternativas.

## Limitaciones y advertencias

- Ausencia de evidencia de correccion: todas las puertas (`kernel_tests`, `golden`, `compare`, `agent`, `sampling`, `logits`, etc.) figuran como no medidas; no hay garantia publicada de paridad con llama.cpp.
- Ausencia de mediciones de rendimiento: no se han publicado cifras de latencia ni throughput para ninguna de las dos GPUs objetivo.
- El sufijo "Thinking" del modelo base no se traduce en soporte de razonamiento en este preset: la tabla de features marca razonamiento y effort como no aplicables.
- Sin datos de sesgos, alucinacion ni comportamiento multilingue del modelo base en la informacion disponible; tratandose de un modelo de dominio medico, el riesgo de respuestas erroneas con apariencia de autoridad es relevante y exige validacion humana.
- Licencia MIT declarada en la tarjeta del paquete; conviene verificar la licencia del modelo base y de los datos de entrenamiento antes de uso comercial.
- Dependencia de un runtime especifico (`hrx-loom` 0.2.0) y de dos targets AMD concretos; no hay soporte documentado para otras GPUs.
- El paquete esta generado automaticamente por `loom-next` sin LLM en el bucle, lo que limita la validacion semantica del artefacto.
- Cero descargas y cero likes en el momento de la consulta: sin validacion por parte de la comunidad.

## Enlaces

- Paquete en Hugging Face: https://huggingface.co/loom-draft/bartowski-Saathimed_AxonMed-32B-Thinking-loom
- Modelo base GGUF: https://huggingface.co/bartowski/Saathimed_AxonMed-32B-Thinking-GGUF
- Runtime Loom (ROCm): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Web del ecosistema Loom: https://loom-fun.github.io/loom-dev/
