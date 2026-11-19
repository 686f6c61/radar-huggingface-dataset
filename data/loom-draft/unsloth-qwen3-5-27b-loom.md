# loom-draft/unsloth-Qwen3.5-27B-loom

## Resumen

El paquete `loom-draft/unsloth-Qwen3.5-27B-loom` es una distribucion empaquetada del checkpoint GGUF `Qwen3.5-27B-Q4_K_M.gguf` publicado por Unsloth, adaptada al formato de ejecucion Loom (programas `.loom` y una tarjeta `model.json`). No se trata de un modelo entrenado por el autor del repositorio, sino de un artefacto de despliegue generado con la herramienta `loom-next` (generador sin LLM en el bucle) para acelerar la inferencia del modelo base sobre GPUs AMD concretas: el APU Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y la Radeon AI PRO R9700 (gfx1201, 32 GB).

El modelo subyacente es Qwen3.5-27B, un transformer multimodal de 27.000 millones de parametros con soporte de entrada de imagen, plantilla de chat con modo de razonamiento ("thinking") activado por defecto y una ventana de contexto de 262.144 tokens por peticion. El paquete expone una API compatible con OpenAI (`/v1/chat/completions`), tool calling, entrada de imagen mediante el proyector `mmproj-BF16.gguf` y hasta 4 peticiones concurrentes.

Su relevancia es fundamentalmente practica: permite ejecutar un modelo de 27B en cuantizacion Q4_K_M sobre hardware AMD de consumo y estaciones de trabajo (Strix Halo y R9700), un nicho donde el soporte de herramientas propietarias es limitado. La licencia Apache 2.0 y la ausencia de modificaciones en los pesos facilitan su adopcion en entornos de produccion, aunque el repositorio no incluye mediciones de rendimiento ni resultados de validacion publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (modelo base Qwen3.5-27B); paquete de ejecucion Loom generado con loom-next |
| Parametros totales | 27.000 millones (modelo base) |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | 262.144 tokens por peticion |
| Tipos de cuantizacion | Q4_K_M (GGUF); proyector de vision en BF16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (`Qwen3.5-27B-Q4_K_M.gguf`) + programas `.loom` y `weights.loom`; proyector `mmproj-BF16.gguf` |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-27B es un transformer de 27.000 millones de parametros con capacidad de vision (pipeline `image-text-to-text`) y una plantilla de chat que incorpora razonamiento explicito activado por defecto. El paquete Loom no modifica los pesos: reproduce el checkpoint GGUF original de Unsloth y genera programas de kernel especificos para las arquitecturas AMD gfx1151 y gfx1201, junto con un `model.json` que fija los ficheros fuente mediante verificacion sha256.

No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni las etapas de alineacion (RLHF, DPO) del modelo base en la documentacion proporcionada. Tampoco se detalla si Qwen3.5-27B emplea innovaciones como atencion lineal o decodificacion especulativa; la tarjeta del paquete indica explicitamente que la decodificacion especulativa no es aplicable en esta configuracion. La innovacion tecnica del artefacto es el propio pipeline de generacion de kernels Loom para GPUs AMD, con puertas de validacion (kernel_tests, golden, compare, vision, consistency, agent, sampling, logits, decision) que en el momento de la publicacion figuran como "not yet re-measured".

## Capacidades

- Generacion de texto y razonamiento con modo "thinking" activado por defecto; se desactiva con `chat_template_kwargs: {"enable_thinking": false}`.
- Entrada de imagen mediante partes `image_url` estilo OpenAI, con proyector `mmproj-BF16.gguf`.
- Tool calling estilo OpenAI (`tools` y `tool_calls`), con validacion de bucles multi-turno en las puertas `agent` y `agent_think_off`.
- API compatible con OpenAI en `/v1/chat/completions`.
- Concurrencia de hasta 4 peticiones simultaneas con consistencia verificada entre ejecuciones concurrentes y aisladas.
- Limite de salida de 4.096 tokens por peticion (preset `max_tokens`).
- Soporte multilingue: no disponible en la informacion proporcionada.
- Entrada y salida de audio: no soportada.
- Ajuste de esfuerzo de razonamiento ("reasoning effort"): no aplicable.
- Muestreo (temperatura, top_k, semilla): estado "not determined" en la tarjeta.

## Casos de uso

- Asistente conversacional de contexto largo: con 262.144 tokens por peticion puede mantener conversaciones multi-turno sobre documentos extensos (manuales, expedientes, bases de codigo) sin truncar el historial, siempre que el hardware objetivo sea Strix Halo o R9700.
- Analisis de documentos con imagenes: la entrada multimodal permite extraer informacion de capturas, diagramas o formularios escaneados y combinarla con texto en una misma peticion, usando el proyector BF16 incluido.
- Agente con tool calling en flujos internos: el soporte de `tools` y `tool_calls` estilo OpenAI permite integrar el modelo en orquestadores existentes (LangChain, LlamaIndex) sin adaptadores propietarios, con bucles multi-turno validados por la puerta `agent`.
- Despliegue en estaciones de trabajo AMD: organizaciones con Radeon AI PRO R9700 (32 GB) pueden servir el modelo en local mediante `loom-serve` sin depender de CUDA ni de servicios en la nube, manteniendo los datos en la infraestructura propia.
- Prototipado en equipos de sobremesa con APU: el preset para Ryzen AI Max+ 395 permite ejecutar un 27B cuantizado en un equipo compacto, util para demos, evaluacion interna y desarrollo de aplicaciones antes de escalar a GPU dedicada.
- Generacion de codigo asistida: el modelo base Qwen3.5-27B incluye capacidades de codigo (segun la categoria del modelo base), y el paquete permite servirlo con una API compatible con OpenAI para integrarlo en asistentes de IDE o pipelines de revision.
- Razonamiento con modo thinking para tareas de analisis: activado por defecto, adecuado para problemas que requieren cadena de razonamiento explicita; puede desactivarse para reducir latencia en tareas simples.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La tarjeta del paquete indica que las mediciones de rendimiento frente a llama.cpp para Strix Halo (gfx1151) y Radeon AI PRO R9700 (gfx1201) "no se han vuelto a medir" ("not yet re-measured"), y todas las puertas de correccion figuran sin ejecucion registrada.

## Requisitos de hardware

- VRAM estimada: el checkpoint Q4_K_M de un modelo de 27B ocupa aproximadamente 16-17 GB en pesos, mas el proyector BF16 y el pool de memoria fijado con `--pool_backing=fixed`; no se proporcionan cifras exactas en la documentacion.
- GPU objetivo declaradas: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- Compatibilidad con GPUs NVIDIA: no disponible; el paquete esta generado para arquitecturas AMD.
- Despliegue: `pipx install "hrx-loom[hf]==0.2.0"`, seguido de `loom-fetch` y `loom-serve` con `--device=amdgpu://?completion_spin_ns=4294967295`, `--pool_backing=fixed` y `--parameter_mode=preload`.
- Alternativas de despliegue (llama.cpp, vLLM, Ollama, TGI): no documentadas para este paquete; la tarjeta solo menciona llama.cpp como referencia de comparacion.
- Latencia y throughput: no disponibles; las mediciones no se han vuelto a realizar.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Vision | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-27B (paquete Loom) | 27B | 262.144 tokens | Si | Apache 2.0 | Hugging Face (este repo) |
| unsloth/Qwen3.5-27B-GGUF | 27B | no disponible | Si (modelo base) | Apache 2.0 (segun modelo base) | Hugging Face |
| Alternativas de mismo tamano | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparado con otros modelos en la informacion proporcionada; la unica comparacion mencionada es frente a llama.cpp, sin resultados publicados.

## Limitaciones y advertencias

- Sin mediciones de rendimiento ni validacion de correccion publicadas: todas las puertas (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `agent`, `sampling`, `logits`, `decision`) figuran como "not yet re-measured", por lo que no hay evidencia registrada de que la salida coincida con la referencia de llama.cpp.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y un tamano de repo de 0.0 GB; conviene verificar la integridad de los ficheros antes de usarlo en produccion.
- Limitado a hardware AMD especifico (gfx1151 y gfx1201); no es portable a NVIDIA sin regenerar el paquete.
- Limite de 4.096 tokens de salida por peticion y 4 peticiones concurrentes, insuficiente para cargas de alta concurrencia.
- Idiomas soportados no documentados; no se puede garantizar calidad multilingue.
- El modo thinking esta activado por defecto, lo que incrementa la latencia y el consumo de tokens si no se desactiva explicitamente.
- Riesgo de alucinacion inherente al modelo base; no se documentan sesgos conocidos en la informacion disponible.
- La licencia Apache 2.0 permite uso comercial, pero el autor del paquete no ofrece garantias sobre el artefacto generado.
- El muestreo figura como "not determined", lo que impide garantizar reproducibilidad con temperatura y semilla.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/loom-draft/unsloth-Qwen3.5-27B-loom
- Modelo base GGUF: https://huggingface.co/unsloth/Qwen3.5-27B-GGUF
- Repositorio Loom (ROCm): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Sitio del ecosistema Loom: https://loom-fun.github.io/loom-dev/
