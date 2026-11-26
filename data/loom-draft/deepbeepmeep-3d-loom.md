# loom-draft/DeepBeepMeep-3D-loom

## Resumen

DeepBeepMeep-3D-loom es un paquete de despliegue en formato Loom (programas `.loom` y una tarjeta `model.json`) generado a partir del checkpoint GGUF no modificado `Qwen3.5-4B-GLB-3D-Coder-Q4_K_M.gguf`, publicado por el autor `loom-draft` bajo el modelo base DeepBeepMeep/3D. No se trata de un modelo entrenado desde cero ni de un fine-tune nuevo: es un artefacto de empaquetado orientado a la ejecución del modelo original sobre GPUs AMD concretas, el AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y la AMD Radeon AI PRO R9700 (gfx1201, 32 GB).

El problema que resuelve es la portabilidad de la inferencia sobre el stack ROCm: los programas Loom generados permiten servir el modelo con una API compatible con OpenAI (`/v1/chat/completions`) sin depender de una build específica de llama.cpp, incluyendo soporte de tool calling y modo de razonamiento. El paquete se generó con la herramienta loom-next (solo el generador, sin LLM en el bucle) y se distribuye con licencia MIT.

La relevancia es acotada pero específica: ofrece una vía reproducible para ejecutar un modelo de 4B cuantizado en Q4_K_M sobre hardware AMD de consumo y profesional, con ventana de contexto declarada de 262.144 tokens por petición y 4 peticiones concurrentes. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y el tamaño declarado es de 0.0 GB, lo que sugiere que los pesos no están alojados en este repositorio sino que se resuelven vía `loom-fetch` desde el checkpoint de origen.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el modelo base se distribuye como GGUF Qwen3.5-4B-GLB-3D-Coder; la arquitectura interna no se detalla en la información proporcionada) |
| Parametros totales | no disponible (la denominación del checkpoint sugiere ~4B, sin confirmación oficial en la información disponible) |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens por petición |
| Tipos de cuantizacion | Q4_K_M (GGUF) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (checkpoint de origen) y programas Loom generados (`program/*.loom`, `weights.loom`) |

## Arquitectura y entrenamiento

La información disponible no describe la arquitectura interna del modelo base DeepBeepMeep/3D ni su proceso de entrenamiento: no se indican número de tokens, composición del dataset, ni si hubo RLHF, DPO u otra fase de alineamiento. El checkpoint de origen se identifica como `Qwen3.5-4B-GLB-3D-Coder-Q4_K_M.gguf`, una cuantización Q4_K_M en formato GGUF, lo que sitúa la familia en torno a Qwen3.5 y a un tamaño nominal de 4B, pero estos datos provienen únicamente del nombre del fichero y no están confirmados en la documentación consultada.

La innovación técnica del artefacto no está en el modelo sino en el empaquetado: loom-next genera kernels y programas Loom específicos para las arquitecturas gfx1151 y gfx1201, con verificación de integridad sha256 de los ficheros de origen mediante `loom-fetch`. El paquete declara soporte de decodificación especulativa como "no aplicable" y de ajuste de esfuerzo de razonamiento como "no aplicable". Las puertas de corrección (kernel_tests, golden, compare, vision, consistency, spec, agent, agent_think_off, sampling, logits, decision) figuran como "not yet re-measured" para ambas GPUs, es decir, no hay evidencia registrada de validación en esta revisión del paquete.

## Capacidades

- Generación de texto y razonamiento con modo "thinking" activado por defecto, desactivable mediante `chat_template_kwargs: {"enable_thinking": false}`.
- Tool calling en estilo OpenAI, con campos `tools` y `tool_calls` en la API.
- Servicio HTTP compatible con OpenAI en `/v1/chat/completions`.
- Concurrencia de hasta 4 peticiones simultáneas.
- Límite de 4.096 tokens de salida por petición (preset `max_tokens`).
- Contexto de 262.144 tokens por petición.
- Entrada de imagen: estado "no determinado" en la tabla de características.
- Entrada y salida de audio: estado "no determinado".
- Muestreo (sampling): estado "no determinado" en la tabla de características.
- Capacidades multilingües: no disponibles.

## Casos de uso

- Asistente de código en estación de trabajo AMD: el modelo, orientado a código según la denominación "Coder" del checkpoint, puede servirse localmente en una Radeon AI PRO R9700 con 32 GB y consumirse desde un IDE mediante la API compatible con OpenAI, sin salir del stack ROCm.
- Automatización de agentes con tool calling: el soporte de `tools` y `tool_calls` permite construir bucles multi-turno de llamadas a herramientas; el preset incluye pruebas de agente (`agent`, `agent_think_off`) aunque sin resultados registrados en esta revisión.
- Procesamiento de documentos largos: con 262.144 tokens de contexto por petición, es viable cargar repositorios de código, expedientes o transcripciones extensas en una sola llamada, siempre que el hardware soporte el coste de atención asociado.
- Despliegue en portátiles y mini-PC con Strix Halo: el paquete incluye comandos específicos para gfx1151, lo que facilita ejecutar el modelo en equipos con memoria unificada sin GPU dedicada.
- Servicio local multiusuario ligero: con 4 peticiones concurrentes y un límite de 4.096 tokens de salida, encaja en entornos de equipo pequeño o laboratorio donde no se requiere un clúster de inferencia.
- Evaluación comparativa frente a llama.cpp: el paquete está diseñado para medirse contra una referencia de llama.cpp sobre el mismo GGUF (puertas `golden` y `compare`), lo que lo hace útil como banco de pruebas de la madurez del runtime Loom en GPUs AMD.
- Modo razonamiento controlable: para tareas de análisis que se benefician de cadena de pensamiento se deja el thinking activado; para respuestas de baja latencia en producción se desactiva por petición.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que los resultados de rendimiento frente a llama.cpp "not yet re-measured" tanto para Strix Halo (gfx1151) como para Radeon AI PRO R9700 (gfx1201), y que las puertas de corrección no tienen ejecuciones registradas.

## Requisitos de hardware

- GPU soportadas de forma explícita: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- VRAM estimada: no disponible de forma oficial; el checkpoint es una cuantización Q4_K_M de un modelo de ~4B, pero no se publica el consumo medido.
- Compatibilidad con GPUs de consumo: no confirmada en la información disponible; el paquete está orientado a las dos GPUs AMD citadas.
- Despliegue: `pipx install "hrx-loom[hf]==0.2.0"`, seguido de `loom-fetch` y `loom-serve` con `--device=amdgpu://?completion_spin_ns=4294967295 --pool_backing=fixed --parameter_mode=preload`.
- Opciones de despliegue alternativas (vLLM, llama.cpp, Ollama, TGI): no documentadas para este paquete; llama.cpp se menciona únicamente como referencia de corrección y comparación.
- Latencia y throughput: no disponibles; la model card indica que las mediciones aún no se han repetido para esta revisión.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| DeepBeepMeep-3D-loom | no disponible (~4B por denominación del checkpoint) | 262.144 tokens | MIT | Paquete Loom para gfx1151 y gfx1201 | Artefacto de despliegue, no modelo nuevo |
| DeepBeepMeep/3D (modelo base) | no disponible (~4B por denominación) | no disponible | no disponible en la información consultada | Hugging Face | Checkpoint GGUF de origen |
| llama.cpp sobre el mismo GGUF | mismo checkpoint | no disponible | MIT (runtime) | Multiplataforma | Referencia de corrección citada por la model card |

No se dispone de datos de rendimiento comparado con alternativas de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- El repositorio declara 0 descargas y 0 likes, y un tamaño de 0.0 GB: no hay evidencia de uso ni de que los pesos estén alojados aquí; el flujo depende de `loom-fetch` contra el checkpoint de origen.
- Las puertas de corrección y las mediciones de rendimiento figuran como "not yet re-measured" para ambas GPUs: no hay validación registrada de que la salida coincida con la referencia de llama.cpp en esta revisión.
- El soporte de imagen, audio y muestreo está marcado como "no determinado", por lo que no debe asumirse su funcionamiento en producción.
- El límite de salida es de 4.096 tokens por petición, muy inferior al contexto de entrada declarado; las tareas que requieran respuestas largas quedarán truncadas.
- La concurrencia está limitada a 4 peticiones simultáneas, lo que restringe el uso como servicio multiusuario.
- El paquete está atado a dos GPUs AMD concretas (gfx1151 y gfx1201); no se documenta compatibilidad con otras arquitecturas.
- No se dispone de información sobre sesgos, riesgo de alucinación ni cobertura idiomática del modelo base.
- La licencia MIT del paquete no implica necesariamente las mismas condiciones para el checkpoint de origen, cuyos términos no se detallan en la información consultada.
- El modelo base se identifica como "Coder" en el nombre del fichero, pero no se confirma en la documentación su especialización real ni su calidad en tareas de código.

## Enlaces

- Paquete en Hugging Face: https://huggingface.co/loom-draft/DeepBeepMeep-3D-loom
- Modelo base: https://huggingface.co/DeepBeepMeep/3D
- Runtime Loom (ROCm): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Ecosistema Loom: https://loom-fun.github.io/loom-dev/
