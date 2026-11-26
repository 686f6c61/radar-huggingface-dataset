# loom-draft/ReadyArt-Vesper-26B-A4B-Nocturne-loom

## Resumen

Vesper-26B-A4B-Nocturne-loom es un paquete de despliegue en formato Loom (programas `.loom` y una tarjeta `model.json`) generado por el autor `loom-draft` para servir el checkpoint GGUF sin modificar `ReadyArt/Vesper-26B-A4B-Nocturne-GGUF` (concretamente el fichero `Vesper-26B-A4B-Nocturne-Q4_K_M_hb16.gguf`) sobre GPUs AMD. El objetivo no es ofrecer un modelo nuevo, sino una ruta de inferencia nativa para hardware AMD concreto: la APU AMD Ryzen AI Max+ 395 «Strix Halo» (gfx1151) y la GPU AMD Radeon AI PRO R9700 (gfx1201, 32 GB).

El paquete se ha producido con `loom-next`, el generador del ecosistema Loom, sin intervención de un LLM en el bucle. Su relevancia actual es acotada pero específica: permite ejecutar un modelo de la familia 26B-A4B (nomenclatura que sugiere arquitectura Mixture-of-Experts con aproximadamente 26 000 millones de parámetros totales y 4 000 millones activos, aunque el dato no se confirma en la información disponible) sobre GPUs AMD de consumo y profesional mediante una API compatible con OpenAI.

La ficha del autor declara soporte de tool calling, modo de razonamiento opcional (desactivado por defecto), contexto de 216 064 tokens por petición, concurrencia de 4 peticiones y un máximo de 4096 tokens de salida. No se han publicado mediciones de rendimiento ni resultados de las puertas de corrección para esta versión concreta: todas aparecen como «not yet re-measured».

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el nombre del modelo sugiere MoE con ~26B totales y ~4B activos; sin confirmar en la informacion proporcionada) |
| Parametros totales | no disponible (la nomenclatura «26B-A4B» sugiere 26 000 millones; sin confirmar) |
| Parametros activos | no disponible (la nomenclatura sugiere 4 000 millones; sin confirmar) |
| Longitud de contexto | 216 064 tokens por peticion (segun la model card) |
| Tipos de cuantizacion | Q4_K_M (fichero `Vesper-26B-A4B-Nocturne-Q4_K_M_hb16.gguf`); no se listan otras |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (empaquetado como paquete Loom con programas `.loom` y `model.json`) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base más allá de lo que sugiere su nombre (`26B-A4B`, patrón habitual para modelos Mixture-of-Experts con parámetros totales y activos). Tampoco se documentan en la información proporcionada el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF, DPO u otras técnicas de alineamiento. El paquete Loom no modifica los pesos: sirve el GGUF original tal cual.

La innovación técnica relevante de este repositorio no está en el modelo, sino en el runtime: Loom genera kernels específicos para las arquitecturas AMD gfx1151 y gfx1201 y expone un servidor compatible con la API `/v1/chat/completions` de OpenAI. La model card indica que la decodificación especulativa no está disponible en este paquete y que el razonamiento se controla mediante `chat_template_kwargs: {"enable_thinking": true|false}`. Las puertas de validación (comparación token a token contra llama.cpp, consistencia en concurrencia, pruebas de kernel, etc.) están definidas pero sin resultados registrados para esta versión.

## Capacidades

- Generación de texto conversacional mediante API compatible con OpenAI (`/v1/chat/completions`).
- Tool calling estilo OpenAI, con soporte de los campos `tools` y `tool_calls`.
- Modo de razonamiento («thinking») opcional, desactivado por defecto y activable por petición.
- Concurrencia de hasta 4 peticiones simultáneas.
- Contexto de 216 064 tokens por petición y hasta 4096 tokens de salida por defecto.
- Entrada de imagen: no soportada por Loom, aunque el modelo original sí la admite según la model card.
- Entrada y salida de audio: no soportadas por Loom, aunque el modelo original sí las admite según la model card.
- Decodificación especulativa: no aplicable en este paquete.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Asistente conversacional autoalojado en estación de trabajo AMD: el paquete permite servir el modelo sobre una Radeon AI PRO R9700 o una APU Strix Halo con una API compatible con OpenAI, útil para equipos que quieren evitar dependencias de la nube y trabajar con hardware AMD.
- Procesamiento de documentos largos: con 216 064 tokens de contexto por petición, encaja en tareas de resumen, extracción de entidades o preguntas sobre contratos, informes técnicos o bases de código extensas en una sola pasada.
- Agentes con tool calling: el soporte de `tools` y `tool_calls` permite construir bucles multi-turno de razonamiento y ejecución de herramientas, con la opción de activar el modo thinking para pasos que requieran deliberación.
- Automatización de atención al cliente interna: despliegue en una única GPU AMD con 4 peticiones concurrentes para un chatbot corporativo de baja/media carga, con la ventaja de mantener los datos en la infraestructura propia.
- Generación asistida de código en entornos con hardware AMD: integración con editores o pipelines internos mediante la API HTTP, siempre que se validen previamente las puertas de corrección (que en esta versión no están registradas).
- Prototipado e investigación sobre runtimes alternativos: útil para equipos que evalúan Loom frente a llama.cpp en GPUs AMD, comparando kernels generados, latencia y fidelidad de logits.
- Experimentación con modos de razonamiento: comparación de respuestas con `enable_thinking` activado y desactivado sobre el mismo prompt para estudiar el impacto en calidad y coste.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que las mediciones de rendimiento para Strix Halo (gfx1151) y Radeon AI PRO R9700 (gfx1201) «no se han vuelto a medir» para este paquete, y que todas las puertas de corrección (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `agent_think_off`, `sampling`, `logits`, `decision`) aparecen sin ejecución registrada.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita. El checkpoint es Q4_K_M de un modelo de ~26B totales (según nomenclatura), lo que en la práctica suele situarse en el rango de 15-18 GB para los pesos, más overhead de contexto y pool; el dato exacto no se confirma en la información proporcionada.
- GPUs soportadas oficialmente por el paquete: AMD Ryzen AI Max+ 395 «Strix Halo» (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- Compatibilidad con GPUs de consumo: no se documenta soporte para Radeon RX de consumo ni para GPUs NVIDIA en este paquete.
- Despliegue: `pipx install "hrx-loom[hf]==0.2.0"`, seguido de `loom-fetch` para materializar el paquete y `loom-serve` para servir el modelo. Parámetros relevantes: `--device=amdgpu://?completion_spin_ns=4294967295`, `--pool_backing=fixed`, `--parameter_mode=preload`. Presets disponibles: `chat` (Strix Halo) y `chat-r9700` (R9700).
- Latencia y throughput: no disponibles; la model card no incluye cifras para esta versión.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Hardware objetivo | Formato |
|---|---|---|---|---|---|
| Vesper-26B-A4B-Nocturne-loom (este) | no disponible (~26B segun nomenclatura) | 216 064 tokens | MIT | AMD Strix Halo, Radeon AI PRO R9700 | Paquete Loom + GGUF Q4_K_M |
| ReadyArt/Vesper-26B-A4B-Nocturne-GGUF (modelo base) | no disponible (~26B segun nomenclatura) | no disponible en la informacion | MIT (heredada) | Generico (GGUF) | GGUF |
| llama.cpp sobre el mismo GGUF | no disponible | no disponible | MIT | CPU, CUDA, ROCm, Metal | GGUF |

La comparación con alternativas de la misma categoría (otros modelos MoE de ~26B con ~4B activos) no está disponible en la información proporcionada. La referencia más directa es el propio GGUF base servido con llama.cpp, que la model card usa como patrón de corrección para las puertas `golden` y `compare`.

## Limitaciones y advertencias

- Ausencia de validación publicada: todas las puertas de corrección y mediciones de rendimiento aparecen como «not yet re-measured»; no hay evidencia registrada de que la salida coincida con llama.cpp ni de la latencia real.
- Cero tracción comunitaria: 0 descargas y 0 likes en el momento de la consulta, lo que reduce la probabilidad de que los problemas estén detectados y documentados por terceros.
- Cobertura de hardware muy restringida: solo se documentan Strix Halo (gfx1151) y Radeon AI PRO R9700 (gfx1201); no hay soporte declarado para otras GPUs AMD, NVIDIA o CPU.
- Funcionalidades recortadas respecto al modelo original: Loom no soporta entrada de imagen ni audio aunque el modelo base sí las admite, por lo que este paquete no es un sustituto completo del checkpoint original en aplicaciones multimodales.
- Sin decodificación especulativa: el paquete no la implementa, lo que puede limitar el throughput frente a configuraciones alternativas.
- Concurrencia limitada a 4 peticiones simultáneas, insuficiente para cargas de producción medias o altas.
- Límite de 4096 tokens de salida por defecto (preset `max_tokens`), ajustable pero no documentado en la información disponible.
- Idiomas soportados no declarados: no se puede garantizar calidad en castellano ni en otros idiomas sin evaluación previa.
- Riesgo de alucinación y sesgos: no documentados en la información proporcionada; deben evaluarse empíricamente antes de cualquier uso en producción.
- Licencia MIT: permite uso comercial, pero conviene verificar que la licencia del modelo base (`ReadyArt/Vesper-26B-A4B-Nocturne-GGUF`) sea compatible, ya que el paquete la hereda.
- Dependencia de una versión concreta del runtime (`hrx-loom[hf]==0.2.0`) y de los presets del autor; cambios en Loom pueden romper la reproducibilidad.

## Enlaces

- Repositorio Hugging Face del paquete: https://huggingface.co/loom-draft/ReadyArt-Vesper-26B-A4B-Nocturne-loom
- Modelo base en Hugging Face: https://huggingface.co/ReadyArt/Vesper-26B-A4B-Nocturne-GGUF
- Repositorio del runtime Loom (ROCm): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Sitio del ecosistema Loom: https://loom-fun.github.io/loom-dev/
