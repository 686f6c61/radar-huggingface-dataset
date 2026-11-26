# loom-draft/prithivMLmods-Qwen3.8-27B-super-adapter-loom

## Resumen

Este repositorio no contiene un modelo entrenado por su autor, sino un paquete de despliegue para el runtime AMD Loom. Concretamente, empaqueta el checkpoint GGUF `Qwen3.8-27B-super-adapter.Q4_K_M.gguf` de `prithivMLmods` junto con programas `.loom` y una tarjeta `model.json`, de modo que el modelo puede servirse directamente en GPUs AMD Ryzen AI Max+ 395 ("Strix Halo", gfx1151) y Radeon AI PRO R9700 (gfx1201, 32 GB) a través de `loom-serve`. El paquete se ha generado con la herramienta `loom-next`, sin intervención de un LLM en el proceso de generación.

El modelo subyacente es un Qwen3.8 de 27 000 millones de parámetros con adaptadores adicionales ("super-adapter") y capacidad de entrada de imagen, en formato GGUF con cuantización Q4_K_M y un proyector multimodal separado en bf16. El paquete expone una API compatible con OpenAI (`/v1/chat/completions`), soporte de tool calling, modo de razonamiento configurable, decodificación especulativa mediante MTP y una ventana de contexto de 262 144 tokens por petición con hasta 4 peticiones concurrentes.

Su relevancia es acotada pero clara: permite ejecutar un modelo multimodal de 27B en hardware AMD de consumo y de estación de trabajo sin depender de CUDA ni de llama.cpp, con verificación de correctitud por puertas (`kernel_tests`, `golden`, `compare`, `vision`, `spec`, `agent`, entre otras). En el momento de la consulta, el repositorio tiene 0 descargas y 0 likes, y las mediciones de rendimiento y correctitud figuran como "not yet re-measured".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Qwen3.8 de 27B; el paquete no detalla la arquitectura interna) |
| Parametros totales | 27 000 millones (según el nombre del modelo base) |
| Parametros activos | no disponible |
| Longitud de contexto | 262 144 tokens por petición |
| Tipos de cuantizacion | Q4_K_M (checkpoint principal); proyector multimodal en bf16 |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (`Qwen3.8-27B-super-adapter.Q4_K_M.gguf` y `Qwen3.8-27B-super-adapter.mmproj-bf16.gguf`), empaquetado como paquete Loom (`.loom` + `model.json`) |
| Tokens máximos de salida | 4096 (preset `max_tokens`) |
| Concurrencia | 4 peticiones concurrentes |
| Decodificación especulativa | MTP, profundidad 3, activada por defecto |
| Hardware objetivo | AMD Ryzen AI Max+ 395 (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB) |
| Runtime | `hrx-loom[hf]==0.2.0` (`loom-fetch`, `loom-serve`) |
| Tamaño del repositorio | 0.0 GB (metadatos; los pesos se materializan al hacer `loom-fetch`) |

## Arquitectura y entrenamiento

La información disponible no describe la arquitectura interna del modelo base: solo se sabe que es un Qwen3.8 de 27B con adaptadores ("super-adapter") y que incorpora un proyector multimodal (`mmproj-bf16.gguf`) para entrada de imagen, lo que lo sitúa en la categoría image-text-to-text. No se detallan el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF, DPO u otras etapas de alineamiento.

Lo que sí está documentado es la capa de despliegue. El paquete Loom incluye kernels generados para las arquitecturas gfx1151 y gfx1201, una política de memoria con pool de respaldo fijo (`--pool_backing=fixed`) o elástico, carga de pesos en modo `preload` y una espera activa de finalizaciones de GPU (`completion_spin_ns=4294967295`) que consume CPU mientras hay trabajo en vuelo. La decodificación especulativa se implementa mediante MTP con profundidad 3 y está activada por defecto. El paquete incorpora además un conjunto de puertas de correctitud (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `agent_think_off`, `sampling`, `logits`, `decision`) que comparan la salida contra una referencia de llama.cpp registrada sobre el mismo GGUF.

## Capacidades

- Generación de texto conversacional multi-turno mediante API compatible con OpenAI.
- Entrada de imagen en formato `image_url` (pipeline image-text-to-text) usando el proyector `mmproj-bf16.gguf`.
- Tool calling estilo OpenAI: campos `tools` y `tool_calls` en la petición y en la respuesta.
- Modo de razonamiento ("thinking") activado por defecto, desactivable con `chat_template_kwargs: {"enable_thinking": false}`.
- Control de esfuerzo de razonamiento mediante `reasoning_effort` con valores `low`, `medium` y `xhigh` (por defecto `xhigh`).
- Decodificación especulativa MTP con profundidad 3, pensada para reducir la latencia de generación sin alterar la salida.
- Contexto largo de hasta 262 144 tokens por petición, adecuado para documentos extensos y conversaciones con historial amplio.
- Soporte de hasta 4 peticiones concurrentes con consistencia de salida verificada por la puerta `consistency`.
- Capacidades de audio (entrada o salida): no determinado.
- Comportamiento de muestreo (temperatura, top_k, semilla): no determinado en la documentación del paquete, aunque existe una puerta `sampling` para verificarlo.

## Casos de uso

- Asistente documental con contexto largo: con 262 144 tokens por petición, el modelo puede ingerir contratos, informes o bases de código completas en una sola llamada y responder preguntas sobre ellos sin trocear el material en fragmentos.
- Automatización de atención al cliente: la API compatible con OpenAI y el soporte de tool calling permiten conectar el modelo a un CRM o a un sistema de tickets, encadenando varias llamadas a herramientas dentro de una misma conversación.
- Agentes multi-paso en estaciones de trabajo AMD: la puerta `agent` valida el bucle de tool calling multi-turno con reutilización de historial, lo que hace viable desplegar agentes sobre Radeon AI PRO R9700 sin infraestructura CUDA.
- Procesamiento de documentos escaneados con imagen: la entrada multimodal permite extraer información de capturas, formularios o diagramas y combinarla con el texto del mismo prompt.
- Generación de código asistida en local: el modelo de 27B en Q4_K_M cabe en 32 GB de VRAM, por lo que puede servir como backend de autocompletado o revisión de código en un equipo de desarrollo con GPU AMD, sin enviar el código a un servicio externo.
- Evaluación y prototipado de modelos multimodales: al estar empaquetado con puertas de correctitud comparadas contra llama.cpp, sirve para validar que una implementación propia reproduce el comportamiento de referencia antes de llevarla a producción.
- Razonamiento con esfuerzo configurable: para tareas de clasificación o extracción rápida se puede fijar `reasoning_effort: low` o desactivar el thinking, y reservar `xhigh` para análisis que requieran cadenas de razonamiento largas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que las mediciones de rendimiento frente a llama.cpp para Strix Halo (gfx1151) y Radeon AI PRO R9700 (gfx1201) "no se han vuelto a medir todavía", y que todas las puertas de correctitud figuran como "not yet re-measured".

## Requisitos de hardware

- VRAM estimada: el checkpoint es Q4_K_M de un modelo de 27B; el paquete está dirigido a la Radeon AI PRO R9700 con 32 GB, lo que sugiere que ese es el mínimo práctico para el conjunto de pesos más el proyector bf16 y el contexto. No se publica una cifra exacta de VRAM.
- GPU validadas por el paquete: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- GPU consumer: no se documenta soporte para GPUs de consumo; el runtime está orientado a las dos arquitecturas AMD citadas.
- Despliegue: `pipx install "hrx-loom[hf]==0.2.0"`, seguido de `loom-fetch` (variantes `:chat` para Strix Halo y `:chat-r9700` para R9700) y `loom-serve`. No se menciona compatibilidad con vLLM, llama.cpp, Ollama ni TGI para este paquete; llama.cpp se usa únicamente como referencia de correctitud.
- Memoria: se recomienda `--pool_backing=fixed` para comprometer el pool de memoria por adelantado en lugar de crecimiento elástico, y `--parameter_mode=preload` para cambiar solo la forma de cargar los pesos en el host.
- Latencia y throughput: no disponibles; las filas de rendimiento de la model card están pendientes de remedición.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Multimodal | Licencia | Formato / runtime |
|---|---|---|---|---|---|
| loom-draft/prithivMLmods-Qwen3.8-27B-super-adapter-loom | 27B | 262 144 | Sí (imagen) | MIT | GGUF empaquetado para Loom (AMD gfx1151/gfx1201) |
| prithivMLmods/Qwen3.8-27B-super-adapter-GGUF (modelo base) | 27B | no disponible | Sí (imagen) | no disponible | GGUF genérico |
| Qwen3.8-27B sin adaptadores | 27B | no disponible | no disponible | no disponible | no disponible |

La comparación con alternativas de la misma categoría queda limitada porque la información disponible no incluye datos de rendimiento ni especificaciones de contexto de los modelos de referencia. Las únicas alternativas identificables son el checkpoint GGUF original del que deriva este paquete y la familia Qwen3.8 sin adaptadores.

## Limitaciones y advertencias

- El repositorio tiene 0 descargas y 0 likes, y las puertas de correctitud y las mediciones de rendimiento figuran como "not yet re-measured": no hay evidencia publicada de que el paquete reproduzca fielmente la salida de llama.cpp en esta versión.
- El tamaño del repositorio es de 0.0 GB, por lo que los pesos no están alojados aquí; es necesario ejecutar `loom-fetch` para materializarlos.
- El soporte de hardware está restringido a AMD Ryzen AI Max+ 395 (gfx1151) y Radeon AI PRO R9700 (gfx1201); no se documenta funcionamiento en GPUs NVIDIA ni en otras arquitecturas AMD.
- El límite de salida por defecto es de 4096 tokens, inferior al contexto de entrada; las respuestas largas requerirán ajustar el preset.
- La concurrencia está limitada a 4 peticiones simultáneas.
- El comportamiento de muestreo y el soporte de audio figuran como "not determined".
- No se detallan sesgos conocidos, tasas de alucinación ni limitaciones idiomáticas del modelo base; los idiomas soportados no están disponibles.
- La licencia del paquete es MIT, pero la licencia y las condiciones de uso comercial del checkpoint base `prithivMLmods/Qwen3.8-27B-super-adapter-GGUF` no se especifican en la información disponible y deben verificarse antes de un despliegue en producción.
- El modo de razonamiento está activado por defecto con `reasoning_effort: xhigh`, lo que incrementa el consumo de tokens y la latencia si no se ajusta explícitamente.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/loom-draft/prithivMLmods-Qwen3.8-27B-super-adapter-loom
- Modelo base en Hugging Face: https://huggingface.co/prithivMLmods/Qwen3.8-27B-super-adapter-GGUF
- Runtime Loom (ROCm): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Sitio del ecosistema Loom: https://loom-fun.github.io/loom-dev/
