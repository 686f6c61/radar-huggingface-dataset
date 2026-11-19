# loom-draft/ggml-org-Qwen3.8-27B-loom

## Resumen
Loom-draft/ggml-org-Qwen3.8-27B-loom es un paquete de despliegue en formato Loom (programas `.loom` y una tarjeta `model.json`) que empaqueta el checkpoint GGUF sin modificar `Qwen3.8-27B-Q4_K_M.gguf` del repositorio `ggml-org/Qwen3.8-27B-GGUF`. No se trata de un modelo nuevo ni de un fine-tune: es una distribucion de inferencia generada con la herramienta `loom-next` (sin intervencion de un LLM en el proceso) dirigida especificamente a las GPU AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).

El modelo subyacente es un Qwen3.8 de 27B con capacidades multimodales (entrada de imagen y texto) y un proyector visual `mmproj-Qwen3.8-27B-BF16.gguf`. El paquete expone una API compatible con OpenAI (`/v1/chat/completions`), soporta tool calling, modo de razonamiento configurable (`reasoning_effort`: low, medium, xhigh) y una ventana de contexto de 262.144 tokens por peticion con 4 peticiones concurrentes.

Su relevancia es acotada pero concreta: ofrece una via de ejecucion optimizada para hardware AMD consumer y profesional (Strix Halo y R9700) sin depender de llama.cpp, con verificaciones de correctitud definidas frente a la referencia de llama.cpp. En el momento de publicacion no hay mediciones de rendimiento ni de correctitud registradas para este paquete.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Qwen3.8-27B; el paquete es un artefacto de despliegue Loom) |
| Parametros totales | 27B (segun nombre del modelo base) |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens por peticion |
| Tipos de cuantizacion | Q4_K_M (GGUF); proyector visual en BF16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (`Qwen3.8-27B-Q4_K_M.gguf`, `mmproj-Qwen3.8-27B-BF16.gguf`) + programas `.loom` y `model.json` |

## Arquitectura y entrenamiento
El paquete no define una arquitectura propia: redistribuye el checkpoint GGUF del modelo base Qwen3.8-27B, por lo que la arquitectura del transformer, los datos de entrenamiento, el numero de tokens vistos y las tecnicas de alineacion (RLHF/DPO) corresponden al modelo original `ggml-org/Qwen3.8-27B-GGUF`, sobre el que esta ficha no dispone de informacion detallada.

La aportacion tecnica del paquete es el artefacto Loom: programas `*.loom` y `weights.loom` generados por `loom-next` para ejecutarse sobre el runtime `loom-serve` (version `hrx-loom[hf]==0.2.0`). Incluye un proyector multimodal BF16 para entrada de imagen y define un conjunto de puertas de correctitud (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `agent_think_off`, `sampling`, `logits`, `decision`) que comparan la salida con la referencia de llama.cpp token a token. La decodificacion especulativa no es aplicable en este paquete.

## Capacidades
- Generacion de texto y razonamiento con modo "thinking" activado por defecto; se puede desactivar con `chat_template_kwargs: {"enable_thinking": false}`.
- Control de esfuerzo de razonamiento mediante `reasoning_effort` con valores low, medium y xhigh (por defecto xhigh).
- Entrada de imagen y texto (pipeline `image-text-to-text`) mediante el proyector `mmproj-Qwen3.8-27B-BF16.gguf` y partes `image_url` estilo OpenAI.
- Tool calling estilo OpenAI (`tools` y `tool_calls`), con soporte de bucles multi-turno de agente.
- Servidor compatible con OpenAI en `/v1/chat/completions`.
- Contexto de 262.144 tokens por peticion y 4 peticiones concurrentes.
- Limite de salida de 4.096 tokens por defecto (preset `max_tokens`).
- Sin soporte de audio ni de decodificacion especulativa.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso
- Despliegue local en Strix Halo: ejecutar un modelo de 27B cuantizado en Q4_K_M sobre un Ryzen AI Max+ 395 usando `loom-serve`, sin depender de llama.cpp, con API compatible con OpenAI para integrarse en aplicaciones existentes.
- Inferencia en Radeon AI PRO R9700: servir el modelo en una GPU profesional de 32 GB con el preset `chat-r9700`, adecuado para estaciones de trabajo con hardware AMD.
- Asistentes con entrada de imagen: usar el proyector BF16 para enviar capturas o diagramas junto a texto y obtener respuestas descriptivas o de analisis.
- Agentes con tool calling: construir flujos multi-step que invoquen funciones externas (APIs, bases de datos) aprovechando el soporte de `tools`/`tool_calls` y el modo de razonamiento configurable.
- Procesamiento de documentos largos: aprovechar la ventana de 262.144 tokens para resumir, extraer o consultar documentos extensos en una sola peticion.
- Razonamiento controlado por coste: ajustar `reasoning_effort` a low para tareas simples y a xhigh para problemas complejos, equilibrando latencia y calidad.
- Evaluacion de portabilidad AMD: usar las puertas de correctitud del paquete para comparar la salida del runtime Loom frente a llama.cpp en el mismo GGUF antes de adoptarlo en produccion.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que las mediciones de rendimiento frente a llama.cpp para Strix Halo y R9700 "no se han vuelto a medir" para este paquete, y que todas las puertas de correctitud figuran como "not yet re-measured".

## Requisitos de hardware
- VRAM estimada: no disponible de forma explicita; el checkpoint Q4_K_M de un modelo de 27B requiere del orden de 16-18 GB para pesos, mas el proyector BF16 y el pool de memoria del runtime (estimacion orientativa, no confirmada en la informacion).
- GPU objetivo: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- Compatibilidad con GPU consumer Nvidia: no disponible; el paquete esta orientado a AMD.
- Despliegue: `loom-serve` con `hrx-loom[hf]==0.2.0`, opciones `--pool_backing=fixed`, `--parameter_mode=preload` y `completion_spin_ns=4294967295`.
- Latencia y throughput: no disponibles (sin mediciones registradas).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| loom-draft/ggml-org-Qwen3.8-27B-loom | 27B | 262.144 | GGUF + Loom | Apache 2.0 | Paquete de despliegue para AMD Strix Halo y R9700 |
| ggml-org/Qwen3.8-27B-GGUF | 27B | no disponible | GGUF | no disponible | Checkpoint original del que deriva este paquete |
| llama.cpp (runtime) | no aplica | no disponible | GGUF | MIT | Referencia de correctitud y rendimiento usada por el paquete |

No se dispone de datos de rendimiento comparativo entre estas opciones en la informacion proporcionada.

## Limitaciones y advertencias
- No es un modelo nuevo ni un fine-tune: cualquier limitacion del modelo base Qwen3.8-27B (sesgos, alucinaciones, idiomas) se hereda sin cambios.
- Sin mediciones de rendimiento ni de correctitud registradas para este paquete; las puertas figuran como "not yet re-measured", por lo que no hay evidencia publicada de equivalencia con llama.cpp.
- Dependencia de un runtime especifico (`loom-serve` 0.2.0) y de hardware AMD concretro (gfx1151, gfx1201); no se documenta soporte para otras GPU.
- Limite de salida de 4.096 tokens por defecto, insuficiente para generaciones largas sin ajustar el preset.
- Concurrencia maxima de 4 peticiones; no apto para cargas de alta concurrencia sin escalado horizontal.
- Sin decodificacion especulativa ni soporte de audio.
- Idiomas soportados no documentados; verificar el comportamiento multilingue antes de usarlo en produccion.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar la licencia del checkpoint base `ggml-org/Qwen3.8-27B-GGUF`, no indicada en la informacion disponible.

## Enlaces
- Hugging Face: https://huggingface.co/loom-draft/ggml-org-Qwen3.8-27B-loom
- Modelo base: https://huggingface.co/ggml-org/Qwen3.8-27B-GGUF
- Runtime Loom (ROCm): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Web del ecosistema Loom: https://loom-fun.github.io/loom-dev/
