# loom-draft/netprojects-Qwen3.8-27B-opencode-adapted-loom

## Resumen

`loom-draft/netprojects-Qwen3.8-27B-opencode-adapted-loom` es un paquete de despliegue en formato Loom (programas `.loom` y una tarjeta `model.json`) generado automáticamente con la herramienta `loom-next` a partir del checkpoint GGUF sin modificar `netprojects/Qwen3.8-27B-opencode-adapted-GGUF`, en su variante `Qwen3.8-27B-opencode-Q4_K_M.gguf`. No se trata de un modelo nuevo ni de un reentrenamiento: los pesos son los del modelo base, y lo que aporta este repositorio es un conjunto de kernels y presets precompilados para ejecutar ese GGUF en GPUs AMD concretas, el Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y la Radeon AI PRO R9700 (gfx1201, 32 GB).

El modelo subyacente se presenta como un Qwen de 27B con capacidades multimodales (pipeline `image-text-to-text`) y modo de razonamiento, adaptado por el autor `netprojects` para tareas de codigo tipo opencode. El paquete Loom expone una API compatible con OpenAI (`/v1/chat/completions`), soporte de tool calling, decodificacion especulativa MTP con profundidad 3 activada por defecto y una ventana de contexto de 262.144 tokens por peticion con 4 peticiones concurrentes.

Su relevancia es de nicho pero concreta: permite servir un modelo de 27B cuantizado en Q4_K_M sobre hardware AMD consumer y de estacion de trabajo sin depender de CUDA ni de llama.cpp, usando el stack `hrx-loom` (version 0.2.0). El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y un tamano de 0.0 GB, lo que sugiere que los artefactos no estan materializados o que el paquete es unicamente metadatos y programas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base tipo Qwen; el paquete no detalla la arquitectura interna) |
| Parametros totales | 27B (segun el nombre del modelo base) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 262.144 tokens por peticion |
| Tipos de cuantizacion | Q4_K_M (GGUF); proyector de vision en F16 (`mmproj-Qwen3.8-27B-opencode-F16.gguf`) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (checkpoint base), empaquetado como programa Loom (`.loom` + `model.json`) |
| Salida maxima | 4.096 tokens (preset `max_tokens`) |
| Concurrencia | 4 peticiones simultaneas |
| Decodificacion especulativa | MTP, profundidad 3, activada por defecto |
| Hardware objetivo | AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151); AMD Radeon AI PRO R9700 (gfx1201, 32 GB) |

## Arquitectura y entrenamiento

No hay informacion en la documentacion proporcionada sobre la arquitectura interna del modelo base (tipo de transformer, atencion, composicion del dataset o fases de alineamiento como RLHF o DPO). El nombre sugiere una variante de la familia Qwen 3.x de 27B adaptada por `netprojects` para tareas de codigo (sufijo `opencode-adapted`), pero no se aportan detalles del proceso de ajuste ni del volumen de tokens de entrenamiento.

Lo que si esta documentado es la capa de ejecucion que anade este repositorio: un paquete Loom generado con `loom-next` (generador sin LLM en el bucle) que compila kernels para las arquitecturas gfx1151 y gfx1201, con presets de memoria (`--pool_backing=fixed`), precarga de parametros (`--parameter_mode=preload`) y espera activa de finalizacion en GPU (`completion_spin_ns=4294967295`). Incluye decodificacion especulativa basada en MTP con profundidad 3, que segun la model card produce exactamente la misma salida que con la decodificacion especulativa desactivada (puerta de correccion `spec`, aunque marcada como "not yet re-measured").

## Capacidades

- Generacion de texto y razonamiento con modo "thinking" activado por defecto; se puede desactivar con `chat_template_kwargs: {"enable_thinking": false}`.
- Control de esfuerzo de razonamiento mediante `reasoning_effort` con valores `low`, `medium` y `xhigh` (por defecto `xhigh`).
- Tool calling estilo OpenAI: acepta `tools` y devuelve `tool_calls`.
- Entrada de imagenes multimodal: soporta partes `image_url` estilo OpenAI, con proyector `mmproj-Qwen3.8-27B-opencode-F16.gguf`.
- Decodificacion especulativa MTP con profundidad 3 activada por defecto.
- API compatible con OpenAI en `/v1/chat/completions`.
- Contexto largo de 262.144 tokens por peticion y hasta 4 peticiones concurrentes.
- Entrada y salida de audio: no determinado.
- Muestreo (temperatura, top_k, semilla): no determinado en la documentacion del paquete.
- Idiomas soportados: no disponible.

## Casos de uso

- Asistencia de codigo en local sobre GPU AMD: el modelo base esta adaptado para tareas tipo opencode y el paquete Loom permite servirlo en una Radeon AI PRO R9700 de 32 GB o en un Strix Halo, sin CUDA, exponiendo una API compatible con OpenAI para integrarlo en el IDE o en un CLI de programacion.
- Agentes de codigo multi-turno con tool calling: la puerta de correccion `agent` describe un bucle de tool calling multi-turno con reutilizacion de historial y renderizado exacto del prompt, lo que encaja con agentes que editan ficheros, ejecutan tests y consultan documentacion.
- Procesamiento de repositorios completos: con 262.144 tokens de contexto por peticion se pueden pasar ficheros grandes, diffs extensos o varios modulos a la vez para revision de codigo o generacion de parches.
- Analisis de capturas y diagramas: al aceptar `image_url`, se puede usar para interpretar capturas de pantalla de errores, diagramas de arquitectura o mockups y generar codigo o explicaciones a partir de ellos.
- Razonamiento con esfuerzo configurable en produccion: `reasoning_effort` permite bajar a `low` para tareas simples de clasificacion o extraccion y subir a `xhigh` para problemas de matematicas o depuracion compleja, ajustando coste y latencia.
- Despliegue en estaciones de trabajo AMD sin NVIDIA: el paquete esta pensado para Strix Halo y R9700, de modo que equipos con grafica AMD pueden servir un 27B cuantizado en Q4_K_M mediante `loom-serve` con API OpenAI.
- Evaluacion comparativa frente a llama.cpp: las puertas de correccion (`golden`, `compare`, `vision`, `spec`, `agent`, `logits`) estan disenadas para verificar que la salida coincide token a token con la referencia de llama.cpp sobre el mismo GGUF, util para validar el stack antes de adoptarlo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye secciones de rendimiento frente a llama.cpp para Strix Halo y R9700, pero ambas indican explicitamente que "the results for this package are not yet re-measured". Del mismo modo, todas las puertas de correccion (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `agent_think_off`, `sampling`, `logits`, `decision`) figuran como "not yet re-measured" en ambas GPUs.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita. El modelo es un 27B en Q4_K_M (aproximadamente 16-17 GB de pesos) mas el proyector de vision en F16; la Radeon AI PRO R9700 dispone de 32 GB, lo que deja margen para cache KV y contexto.
- GPU objetivo declaradas: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- GPU consumer: no se documenta soporte para GPUs consumer AMD o NVIDIA en este paquete; el stack es `hrx-loom` sobre ROCm y las arquitecturas gfx1151 y gfx1201.
- Despliegue: `pipx install "hrx-loom[hf]==0.2.0"`, seguido de `loom-fetch` y `loom-serve`. Se ofrecen dos presets de descarga, `chat` (Strix Halo) y `chat-r9700` (R9700).
- Parametros de servicio relevantes: `--pool_backing=fixed` (reserva fija del pool de memoria), `--parameter_mode=preload` (carga de pesos en host) y `completion_spin_ns=4294967295` (espera activa de finalizacion en GPU, consume CPU mientras hay trabajo en vuelo).
- Latencia y throughput: no disponibles; no se han publicado mediciones para este paquete.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos de rendimiento ni comparaciones con otros modelos, y el modelo base (`Qwen3.8-27B-opencode-adapted`) no cuenta con benchmarks publicados en la documentacion consultada. Como referencia estructural, la comparacion natural seria contra el mismo GGUF servido con llama.cpp sobre el mismo hardware, que es precisamente la referencia que usan las puertas de correccion del paquete, pero no se aportan cifras.

## Limitaciones y advertencias

- El repositorio no contiene pesos nuevos: es un paquete de ejecucion sobre `netprojects/Qwen3.8-27B-opencode-adapted-GGUF`. Cualquier limitacion del modelo base (sesgos, alucinacion, calidad en ciertos idiomas) se hereda sin cambios.
- No hay mediciones de rendimiento ni de correccion para este paquete: todas las puertas figuran como "not yet re-measured", por lo que no se puede afirmar que la salida coincida con llama.cpp hasta que se ejecuten.
- Soporte de hardware muy restringido: solo se documentan gfx1151 (Strix Halo) y gfx1201 (R9700). No hay indicacion de soporte para otras GPUs AMD ni para NVIDIA.
- Idiomas soportados no disponibles: no se puede garantizar calidad en castellano ni en otros idiomas sin evaluacion propia.
- Muestreo no determinado: la model card marca como "?" el comportamiento de temperatura, top_k y semilla, aunque existe una puerta `sampling` pendiente de re-medir.
- Audio no determinado: no se confirma soporte de entrada ni salida de audio.
- Limite de salida de 4.096 tokens por peticion (preset `max_tokens`), que puede ser insuficiente para generacion de ficheros completos o respuestas de razonamiento largas.
- Concurrencia limitada a 4 peticiones simultaneas en el preset documentado.
- El repositorio tiene 0 descargas y 0 likes y un tamano de 0.0 GB: conviene verificar que los artefactos esten realmente disponibles antes de integrarlo en un pipeline.
- Licencia MIT declarada, lo que en principio permite uso comercial, pero al derivar de un modelo base de terceros conviene revisar tambien la licencia del checkpoint original `netprojects/Qwen3.8-27B-opencode-adapted-GGUF`.
- La espera activa (`completion_spin_ns=4294967295`) consume CPU mientras hay trabajo en GPU; en entornos con CPU limitada puede degradar el rendimiento global.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/loom-draft/netprojects-Qwen3.8-27B-opencode-adapted-loom
- Modelo base (GGUF): https://huggingface.co/netprojects/Qwen3.8-27B-opencode-adapted-GGUF
- Stack Loom (ROCm/hrx-system): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Web del ecosistema Loom: https://loom-fun.github.io/loom-dev/
