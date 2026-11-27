# loom-draft/bartowski-Inkling-2-Mini-loom

## Resumen

Inkling-2-Mini en formato GGUF (cuantización Q4_K_M) empaquetado para el ecosistema Loom de AMD. No se trata de un modelo nuevo, sino de una distribución del checkpoint `bartowski/Inkling-2-Mini-GGUF` en el formato propietario de Loom (`.loom` + `model.json`), generada automáticamente con la herramienta `loom-next` (sin intervención de un LLM en el proceso). El repositorio lo publica el usuario `loom-draft` y está pensado para ejecutarse en las GPU integradas AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y en la GPU de escritorio AMD Radeon AI PRO R9700 (gfx1201, 32 GB).

El modelo subyacente, Inkling-2-Mini, es un modelo de lenguaje con capacidades multimodales (la model card indica que el modelo original soporta entrada de imagen, aunque Loom no la implementa) y con modo de razonamiento siempre activo y configurable mediante `reasoning_effort`. El paquete Loom expone una API compatible con OpenAI (`/v1/chat/completions`), soporta hasta 262.144 tokens de contexto por petición y 4 peticiones concurrentes, con un máximo de 4.096 tokens de salida por preset.

La relevancia de esta ficha es acotada: se trata de un artefacto de despliegue para hardware AMD concreto, no de un modelo con benchmarks públicos propios. El repositorio no contiene pesos en el momento de la consulta (tamaño de 0.0 GB), no registra descargas ni likes, y las mediciones de rendimiento y las puertas de corrección aparecen como "not yet re-measured" en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base: Inkling-2-Mini; el paquete Loom genera kernels `.loom` específicos para AMD) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens por petición |
| Tipos de cuantizacion | Q4_K_M (única incluida en el paquete) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (checkpoint `Inkling-2-Mini-Q4_K_M.gguf`) empaquetado como programas `.loom` + `weights.loom` + `model.json` |
| Tokens máximos de salida | 4.096 (preset `max_tokens`) |
| Concurrencia | 4 peticiones simultáneas |
| API | compatible OpenAI `/v1/chat/completions` |
| Hardware objetivo | AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151); AMD Radeon AI PRO R9700 (gfx1201, 32 GB) |
| Runtime | `hrx-loom[hf]==0.2.0` (`loom-fetch`, `loom-serve`) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base Inkling-2-Mini en la documentación proporcionada: no se indica si es un transformer denso, un MoE, un modelo híbrido ni el número de parámetros. Tampoco se documentan los datos de entrenamiento (número de tokens, composición del corpus, uso de RLHF/DPO) ni innovaciones técnicas del modelo original.

Lo que sí documenta la model card es la capa de despliegue: el paquete Loom se genera con `loom-next`, que produce programas `.loom` y un fichero `weights.loom` a partir del GGUF original sin modificarlo. El paquete incluye `model.json` y `model.json.lock` con los ficheros fuente fijados por hash SHA-256, verificados por `loom-fetch`; el tokenizer se distribuye como `tokenizer.json` y la configuración como `llm_config.json`. La ejecución usa `loom-serve` con opciones como `--pool_backing=fixed` (reserva el pool de memoria por adelantado) y `--parameter_mode=preload` (carga de pesos en host). El modo de razonamiento está siempre activo y se controla con `reasoning_effort` (valores: minimal, low, medium, high, xhigh, max; por defecto high). No se documenta decodificación especulativa (marcada como "not applicable").

## Capacidades

- Generación de texto conversacional vía API compatible con OpenAI (`/v1/chat/completions`).
- Razonamiento con modo "thinking" siempre activo y esfuerzo configurable mediante `reasoning_effort` en seis niveles.
- Contexto largo: hasta 262.144 tokens por petición, adecuado para documentos extensos.
- Concurrencia de 4 peticiones simultáneas con la opción de consistencia documentada en las puertas de corrección.
- Entrada de imagen: el modelo original la soporta, pero Loom la marca explícitamente como no soportada (`image input: ❌`).
- Tool calling y function calling: marcado como "not applicable" en el paquete Loom.
- Audio: no aplicable.
- Decodificación especulativa: no aplicable.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Despliegue local en estaciones de trabajo con GPU AMD: el paquete está diseñado para ejecutarse en Strix Halo y R9700 mediante `loom-serve`, lo que permite servir el modelo sin depender de CUDA ni de llama.cpp, usando la pila ROCm/HIP a través de Loom.
- Procesamiento de documentos largos: con 262.144 tokens de contexto por petición, es adecuado para resumir, extraer información o responder preguntas sobre contratos, informes o bases de código extensas en una sola pasada.
- Asistentes conversacionales con razonamiento explícito: el modo thinking siempre activo y los niveles de `reasoning_effort` permiten ajustar el coste computacional entre respuestas rápidas (minimal) y análisis profundos (max) según la tarea.
- Evaluación de la pila Loom en hardware AMD: el repositorio sirve como artefacto de referencia para validar `loom-fetch`, `loom-serve` y las puertas de corrección (`kernel_tests`, `golden`, `compare`, `consistency`, `sampling`, `logits`, `decision`) frente a llama.cpp sobre el mismo GGUF.
- Prototipado de aplicaciones con API OpenAI: al exponer `/v1/chat/completions`, se puede integrar con clientes y SDKs existentes de OpenAI apuntando a `http://127.0.0.1:8080`, sin reescribir la capa de integración.
- Investigación sobre cuantización Q4_K_M en GPUs de consumo profesional: la R9700 con 32 GB permite alojar el checkpoint Q4_K_M y medir latencia y calidad frente a otras configuraciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que las comparativas de rendimiento frente a llama.cpp para Strix Halo (gfx1151) y Radeon AI PRO R9700 (gfx1201) "are not yet re-measured", y que todas las puertas de corrección (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `agent_think_off`, `sampling`, `logits`, `decision`) figuran como "not yet re-measured" en ambas plataformas. No se proporcionan cifras de MMLU, HumanEval, GSM8K ni de throughput o latencia.

## Requisitos de hardware

- VRAM estimada: no disponible con precisión; el checkpoint es Q4_K_M y el paquete está pensado para GPUs con 32 GB (R9700) y para la memoria unificada del Ryzen AI Max+ 395.
- GPU recomendadas: AMD Radeon AI PRO R9700 (gfx1201, 32 GB) y AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151).
- GPU de consumo: no se documenta compatibilidad con GPUs de consumo NVIDIA ni con otras AMD distintas de las dos indicadas.
- Despliegue: `pipx install "hrx-loom[hf]==0.2.0"`, seguido de `loom-fetch` y `loom-serve`. No se mencionan vLLM, llama.cpp, Ollama ni TGI como opciones de despliegue para este paquete (llama.cpp se usa solo como referencia de corrección).
- Opciones de servicio documentadas: `--device=amdgpu://?completion_spin_ns=4294967295` (espera activa de finalizaciones en GPU), `--pool_backing=fixed` y `--parameter_mode=preload`.
- Latencia y throughput: no disponibles; las mediciones aún no se han repetido para este paquete.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de rendimiento ni especificaciones del modelo base que permitan una comparación cuantitativa con alternativas de la misma categoría. Como referencia cualitativa, el propio paquete se compara funcionalmente con llama.cpp sobre el mismo GGUF (usado como referencia en las puertas de corrección), y el checkpoint base es `bartowski/Inkling-2-Mini-GGUF`; no se dispone de parámetros, contexto ni licencia de otros modelos comparables en esta información.

## Limitaciones y advertencias

- El repositorio no contiene pesos en el momento de la consulta (tamaño de 0.0 GB); es un artefacto de despliegue que referencia el GGUF de `bartowski/Inkling-2-Mini-GGUF`, no una copia autónoma del modelo.
- No hay mediciones de rendimiento ni de corrección publicadas para este paquete: todas las puertas figuran como "not yet re-measured", por lo que no hay evidencia registrada de equivalencia con llama.cpp.
- La entrada de imagen no está soportada por Loom aunque el modelo original la tenga; no se debe asumir capacidad multimodal en este despliegue.
- Tool calling y function calling marcados como "not applicable": no apto para flujos de agentes con herramientas en esta configuración.
- Sin decodificación especulativa; el rendimiento dependerá de la implementación de kernels generada.
- Máximo de 4.096 tokens de salida por preset, lo que limita respuestas muy largas aunque el contexto de entrada sea de 262.144 tokens.
- Licencia MIT declarada en el paquete, pero conviene verificar la licencia del modelo base y del GGUF original antes de uso comercial, ya que la ficha no la detalla.
- Idiomas soportados no documentados: no se puede garantizar calidad en castellano ni en otros idiomas.
- Riesgo de sesgos y alucinaciones del modelo base: no evaluado en la información disponible.
- Dependencia de la pila `hrx-loom` y de hardware AMD específico (gfx1151, gfx1201); no hay soporte documentado para otras GPUs.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/loom-draft/bartowski-Inkling-2-Mini-loom
- Modelo base GGUF: https://huggingface.co/bartowski/Inkling-2-Mini-GGUF
- Repositorio Loom (ROCm): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Sitio del ecosistema Loom: https://loom-fun.github.io/loom-dev/
