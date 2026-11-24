# loom-draft/bartowski-ReadyArt_Wicked-Stuff-26B-A4B-v3.0-Final-loom

## Resumen

`loom-draft/bartowski-ReadyArt_Wicked-Stuff-26B-A4B-v3.0-Final-loom` no es un modelo de lenguaje entrenado desde cero, sino un paquete de despliegue en formato Loom (programas `.loom` y una tarjeta `model.json`) generado a partir del checkpoint GGUF `bartowski/ReadyArt_Wicked-Stuff-26B-A4B-v3.0-Final-Q4_K_M.gguf`. Lo publica el usuario `loom-draft` y su propósito es servir el modelo base en GPUs AMD concretas: el SoC AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y la GPU AMD Radeon AI PRO R9700 (gfx1201, 32 GB). El paquete se ha generado con la herramienta `loom-next`, que según la model card opera sin un LLM en el bucle, y se distribuye bajo licencia MIT.

El modelo subyacente, por el nombre, es un Mixture-of-Experts de aproximadamente 26 000 millones de parámetros totales con unos 4000 millones activos por token (sufijo `26B-A4B`), cuantizado en Q4_K_M. El paquete Loom expone una API compatible con OpenAI (`/v1/chat/completions`), soporta tool calling, modo de razonamiento opcional (desactivado por defecto) y una ventana de contexto de 215 040 tokens por petición con hasta 4 peticiones concurrentes y un máximo de 4096 tokens de salida por preset.

La relevancia de esta ficha es acotada: no aporta pesos nuevos ni mejoras de entrenamiento, sino una vía de ejecución optimizada para hardware AMD de consumo y profesional reciente. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y las mediciones de rendimiento y las puertas de corrección (`kernel_tests`, `golden`, `compare`, etc.) figuran como "not yet re-measured" para ambas GPUs, por lo que no hay datos verificados de velocidad ni de fidelidad frente a llama.cpp.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el nombre del checkpoint sugiere Mixture-of-Experts; no confirmado en la informacion) |
| Parametros totales | ~26B (inferido del nombre `26B`; no confirmado) |
| Parametros activos | ~4B (inferido del sufijo `A4B`; no confirmado) |
| Longitud de contexto | 215 040 tokens por peticion |
| Tipos de cuantizacion | Q4_K_M (GGUF) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF empaquetado en formato Loom (`.loom` + `model.json`) |
| Salida maxima | 4096 tokens (preset `max_tokens`) |
| Concurrencia | 4 peticiones simultaneas |
| API | OpenAI-style `/v1/chat/completions` |
| Tool calling | si (formato OpenAI `tools` / `tool_calls`) |
| Modo thinking | si, desactivado por defecto |
| Entrada de imagen | no soportada por Loom (el modelo upstream la tiene) |
| Entrada/salida de audio | no soportada por Loom (el modelo upstream la tiene) |
| Decodificacion especulativa | no aplicable |
| Hardware objetivo | AMD Ryzen AI Max+ 395 (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB) |
| Tamano del repo | 0.0 GB (reportado por Hugging Face) |

## Arquitectura y entrenamiento

No hay informacion en la documentacion proporcionada sobre la arquitectura interna del modelo base (tipo de transformer, configuracion de expertos, atencion, etc.) ni sobre su proceso de entrenamiento (numero de tokens, composicion del dataset, fases de RLHF/DPO). El nombre `ReadyArt_Wicked-Stuff-26B-A4B-v3.0-Final` sugiere un ajuste fino de la familia ReadyArt sobre una base MoE de ~26B con ~4B activos, pero esto es una inferencia a partir de la nomenclatura y no un dato confirmado.

Lo que si documenta la model card es la capa de despliegue: el paquete Loom contiene kernels generados especificamente para las arquitecturas AMD gfx1151 y gfx1201, con dos presets (`chat` y `chat-r9700`) que se sirven mediante `loom-serve`. El servidor admite opciones de memoria (`--pool_backing=fixed` reserva el pool de memoria por adelantado; `--parameter_mode=preload` cambia la carga de pesos en host) y un parametro `completion_spin_ns=4294967295` que activa espera activa en CPU mientras hay trabajo en GPU, ajuste con el que se midieron las (inexistentes por ahora) cifras de rendimiento de la tarjeta.

## Capacidades

- Generacion de texto conversacional mediante API compatible con OpenAI (`/v1/chat/completions`).
- Tool calling en formato OpenAI (`tools` y `tool_calls`), con soporte de bucles multi-turno segun la puerta `agent` descrita en la model card.
- Modo de razonamiento opcional (`enable_thinking`), desactivado por defecto; el campo `reasoning effort` no aplica en esta implementacion.
- Contexto largo de 215 040 tokens por peticion, adecuado para documentos extensos y conversaciones prolongadas.
- Concurrencia de hasta 4 peticiones simultaneas con garantia de consistencia declarada (puerta `consistency`, pendiente de re-medicion).
- Capacidades multimodales del modelo upstream (imagen y audio) presentes en el checkpoint original pero no expuestas por Loom.
- Soporte multilingue: no disponible en la informacion proporcionada.

## Casos de uso

- Asistente conversacional autohospedado en estaciones de trabajo AMD: el paquete se sirve con `loom-serve` sobre Strix Halo o R9700 y expone una API OpenAI, de modo que cualquier cliente compatible (LibreChat, Open WebUI, SDKs oficiales) puede conectarse sin adaptadores.
- Procesamiento de documentos largos: con 215 040 tokens de contexto se pueden ingerir contratos, informes o bases de codigo completas en una sola peticion, util para resumen, extraccion de entidades o Q&A sobre corpus extensos.
- Agentes con tool calling: el soporte de `tools`/`tool_calls` y las puertas `agent` y `agent_think_off` de la model card indican que el paquete esta pensado para bucles de agente multi-turno con reutilizacion de historial, apropiado para automatizacion de tareas internas.
- Razonamiento con modo thinking para tareas de analisis: activando `enable_thinking` se obtienen trazas de razonamiento antes de la respuesta, util para depuracion de pipelines o para tareas de clasificacion compleja donde interesa inspeccionar el proceso.
- Despliegue en hardware AMD de gama profesional: la R9700 con 32 GB permite cargar el checkpoint Q4_K_M (~15-16 GB estimados para 26B a 4 bits) con margen para KV cache, lo que habilita inferencia local sin depender de NVIDIA.
- Prototipado y evaluacion de la pila Loom: el paquete sirve como banco de pruebas para validar kernels generados, comparar salidas contra llama.cpp (puertas `golden`, `compare`, `logits`) y medir latencia en gfx1151/gfx1201.
- Integracion en pipelines internos con requisitos de licencia permisiva: al ser MIT, puede incorporarse a productos comerciales sin obligaciones de atribucion mas alla de la propia licencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que las mediciones de rendimiento frente a llama.cpp para Strix Halo (gfx1151) y Radeon AI PRO R9700 (gfx1201) "are not yet re-measured", y que todas las puertas de correccion (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `agent_think_off`, `sampling`, `logits`, `decision`) figuran como "not yet re-measured" en ambas GPUs. Tampoco hay datos de MMLU, HumanEval, GSM8K ni similares para el modelo base en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint es Q4_K_M; para un modelo de ~26B totales a ~4.5 bits por peso se estiman del orden de 15-16 GB solo de pesos, mas KV cache para 215 040 tokens de contexto, que puede ser considerable y depende de la configuracion de atencion (no disponible). La R9700 con 32 GB ofrece margen; Strix Halo comparte memoria unificada con la CPU.
- GPU soportadas oficialmente por el paquete: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- GPU consumer: no se documenta soporte para GPUs de consumo AMD o NVIDIA en esta tarjeta; el paquete esta generado para las arquitecturas AMD citadas.
- Opciones de despliegue: `loom-serve` (runtime propio, instalado via `pipx install "hrx-loom[hf]==0.2.0"`), con `loom-fetch` para descargar el paquete. No se menciona compatibilidad con vLLM, llama.cpp, Ollama o TGI para este paquete concreto, aunque el GGUF original si podria cargarse con llama.cpp.
- Latencia y throughput: no disponibles; las mediciones estan pendientes de re-medicion segun la model card.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato / runtime | Notas |
|---|---|---|---|---|---|
| `loom-draft/bartowski-ReadyArt_Wicked-Stuff-26B-A4B-v3.0-Final-loom` | ~26B totales / ~4B activos (inferido) | 215 040 tokens | MIT | Loom (GGUF Q4_K_M empaquetado) | Paquete de despliegue para AMD gfx1151/gfx1201; sin benchmarks publicados |
| `bartowski/ReadyArt_Wicked-Stuff-26B-A4B-v3.0-Final-GGUF` | ~26B totales / ~4B activos (inferido) | no disponible | no disponible en la informacion | GGUF | Checkpoint base sin empaquetar; compatible con llama.cpp y derivados |
| Alternativas MoE de ~20-30B con ~3-4B activos (p. ej. familia Mixtral / Qwen MoE) | variable | variable | variable | GGUF, safetensors | No se dispone de datos comparativos verificados en la informacion proporcionada |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada, por lo que la comparativa se limita a parametros, contexto, licencia y formato.

## Limitaciones y advertencias

- El paquete no aporta pesos nuevos: es un artefacto de despliegue generado automaticamente; cualquier limitacion del modelo base (sesgos, alucinaciones, calidad en idiomas distintos del entrenado) se hereda sin cambios.
- Ausencia total de benchmarks y de puertas de correccion re-medidas: no hay evidencia publicada de que la salida coincida con llama.cpp ni de la latencia real en las GPUs objetivo.
- Cero descargas y cero likes en el momento de la consulta: no hay validacion de la comunidad ni informes independientes de funcionamiento.
- Soporte de hardware restringido: solo se documentan Strix Halo (gfx1151) y Radeon AI PRO R9700 (gfx1201); no hay garantia en otras GPUs AMD ni en NVIDIA.
- Capacidades multimodales del modelo upstream (imagen, audio) no estan expuestas por Loom, lo que limita su uso a texto.
- Salida maxima de 4096 tokens por preset: insuficiente para generaciones largas sin ajustar la configuracion.
- Concurrencia limitada a 4 peticiones: no apto para cargas de produccion de alta concurrencia sin escalado horizontal.
- Idiomas soportados no documentados: no se puede garantizar calidad en castellano ni en otros idiomas sin evaluacion previa.
- Licencia MIT declarada, lo que en principio permite uso comercial, pero conviene verificar las condiciones del checkpoint base (`bartowski/...`) antes de distribuirlo en productos.
- El campo `pipeline` no esta definido en la ficha de Hugging Face y el tamano del repo aparece como 0.0 GB, lo que puede indicar que los artefactos no estan subidos o que la metadata no se ha actualizado.

## Enlaces

- Repositorio Hugging Face del paquete: https://huggingface.co/loom-draft/bartowski-ReadyArt_Wicked-Stuff-26B-A4B-v3.0-Final-loom
- Checkpoint GGUF base: https://huggingface.co/bartowski/ReadyArt_Wicked-Stuff-26B-A4B-v3.0-Final-GGUF
- Repositorio del runtime Loom (ROCm): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Sitio del ecosistema Loom: https://loom-fun.github.io/loom-dev/
