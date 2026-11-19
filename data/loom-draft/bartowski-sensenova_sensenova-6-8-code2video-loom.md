# loom-draft/bartowski-sensenova_SenseNova-6.8-Code2Video-loom

## Resumen

SenseNova-6.8-Code2Video es un modelo multimodal de tipo image-text-to-text desarrollado por SenseTime (bajo la familia SenseNova), distribuido originalmente en formato GGUF por bartowski. Esta ficha describe una variante empaquetada por loom-draft para el ecosistema Loom de AMD, que convierte el checkpoint GGUF sin modificar en un paquete ejecutable mediante `loom-serve` sobre GPUs AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y Radeon AI PRO R9700 (gfx1201, 32 GB).

El modelo está orientado a tareas que combinan código y vídeo (de ahí su nombre Code2Video), con soporte de entrada de imagen mediante un proyector multimodal separado (`mmproj-sensenova_SenseNova-6.8-Code2Video-bf16.gguf`) y una ventana de contexto declarada de 262.144 tokens por petición. Incorpora modo de razonamiento (thinking) activado por defecto, con control mediante `reasoning_effort` (low, medium, xhigh) y la posibilidad de desactivarlo con `enable_thinking: false`.

La relevancia de este paquete es fundamentalmente de despliegue: no introduce pesos nuevos, sino que ofrece una ruta de ejecución nativa en GPUs AMD (ROCm) con API compatible con OpenAI, tool calling y hasta 4 peticiones concurrentes. No obstante, la model card indica explícitamente que las mediciones de rendimiento y las puertas de corrección (`kernel_tests`, `golden`, `compare`, `vision`, `agent`, etc.) todavía no se han vuelto a medir para este paquete, por lo que su validación práctica está pendiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo multimodal image-text-to-text con proyector separado) |
| Parametros totales | no disponible (la nomenclatura "6.8" sugiere ~6.800 M, sin confirmar) |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens por petición |
| Tipos de cuantizacion | Q4_K_M (checkpoint GGUF empaquetado); proyector en bf16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (Q4_K_M) + proyector GGUF bf16; paquete `.loom` con `model.json` |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base SenseNova-6.8-Code2Video en la documentación proporcionada. Por la etiqueta de pipeline (`image-text-to-text`) y la presencia de un proyector multimodal independiente (`mmproj-...-bf16.gguf`), se trata de un modelo de lenguaje con codificador visual acoplado mediante un proyector, en la línea habitual de los modelos vision-language. Tampoco se detallan el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO.

El paquete Loom en sí no modifica los pesos: envuelve el GGUF original de bartowski con programas `.loom` generados por `loom-next` (sin LLM en el bucle) y una tarjeta `model.json`. La innovación técnica relevante está en la capa de ejecución: kernels generados para gfx1151 y gfx1201, pool de memoria de respaldo fijo (`--pool_backing=fixed`), precarga de parámetros (`--parameter_mode=preload`) y espera activa de finalizaciones de GPU (`completion_spin_ns=4294967295`). La decodificación especulativa no aplica en este paquete.

## Capacidades

- Generación de texto y razonamiento con modo thinking activado por defecto, desactivable mediante `chat_template_kwargs: {"enable_thinking": false}`.
- Control granular del esfuerzo de razonamiento con `reasoning_effort`: low, medium y xhigh (valor por defecto).
- Entrada de imagen mediante partes `image_url` en estilo OpenAI, procesadas por el proyector bf16.
- Tool calling en estilo OpenAI (`tools` y `tool_calls`), con soporte de bucles multi-turno de agentes.
- API compatible con OpenAI en el endpoint `/v1/chat/completions`.
- Concurrencia de hasta 4 peticiones simultáneas.
- Límite de 4.096 tokens de salida por petición (preset `max_tokens`).
- Sin soporte de audio (ni entrada ni salida) y sin decodificación especulativa.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Asistencia sobre código y vídeo: el modelo puede recibir capturas o fotogramas como entrada de imagen junto a una consulta de código, lo que permite explicar fragmentos de interfaz, diagnosticar errores visuales o generar código a partir de una referencia gráfica.
- Agentes de desarrollo con tool calling: integrado en un bucle de herramientas (ejecución de tests, consulta de repositorios, llamadas a APIs), el modelo puede encadenar varios pasos y reutilizar historial de conversación, con la salvedad de que la puerta `agent` aún no se ha revalidado en este paquete.
- Documentación técnica automatizada: con 262.144 tokens de contexto por petición, puede procesar repositorios o documentación extensa y generar resúmenes o guías sin trocear el material.
- Análisis de documentación visual: extracción de información de diagramas, esquemas de arquitectura o capturas de paneles para producir texto estructurado o código de infraestructura.
- Despliegue en infraestructura AMD: adecuado para equipos con Strix Halo o Radeon AI PRO R9700 que necesiten servir un modelo multimodal con API OpenAI sin depender de CUDA, usando `loom-fetch` y `loom-serve`.
- Prototipado de asistentes con razonamiento configurable: el ajuste `reasoning_effort` permite degradar el coste computacional en tareas simples (low) y elevarlo en tareas de análisis complejo (xhigh), útil en entornos de desarrollo con recursos limitados.
- Evaluación comparativa frente a llama.cpp: el paquete incluye puertas de corrección diseñadas para comparar token a token con la referencia de llama.cpp sobre el mismo GGUF, lo que lo hace útil como banco de pruebas de la pila ROCm/Loom.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica que, tanto en Strix Halo (gfx1151) como en Radeon AI PRO R9700 (gfx1201), "the results for this package are not yet re-measured", y que todas las puertas de corrección (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `agent_think_off`, `sampling`, `logits`, `decision`) figuran como "not yet re-measured".

## Requisitos de hardware

- GPU objetivo declaradas: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- VRAM estimada: no disponible de forma explícita; el checkpoint es Q4_K_M, por lo que un modelo de ~6.800 M de parámetros ocuparía del orden de 4-5 GB en pesos, más el proyector bf16 y el pool de memoria fijo, aunque esta cifra no está confirmada en la documentación.
- Cabe en GPU de consumo: no confirmado; el paquete está dirigido a las dos GPUs AMD indicadas, no a tarjetas consumer genéricas.
- Despliegue: `pipx install "hrx-loom[hf]==0.2.0"`, seguido de `loom-fetch` (preset `chat` para Strix Halo, `chat-r9700` para R9700) y `loom-serve` con `--device=amdgpu://?completion_spin_ns=4294967295 --pool_backing=fixed --parameter_mode=preload`.
- Alternativas de despliegue (vLLM, llama.cpp, Ollama, TGI): no documentadas para este paquete; la referencia de comparación interna es llama.cpp, pero la ruta soportada es Loom.
- Latencia y throughput: no disponibles; las mediciones de rendimiento frente a llama.cpp no se han vuelto a realizar para este paquete.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrada imagen | Tool calling | Licencia | Formato |
|---|---|---|---|---|---|---|
| SenseNova-6.8-Code2Video (paquete Loom) | no disponible (~6.800 M por nomenclatura) | 262.144 | Sí | Sí | Apache 2.0 | GGUF Q4_K_M + `.loom` |
| bartowski/sensenova_SenseNova-6.8-Code2Video-GGUF | no disponible | no disponible | Sí (proyector separado) | no disponible | Apache 2.0 | GGUF |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información suficiente para establecer una comparativa con modelos alternativos de la misma categoría (visión-lenguaje de ~7B con soporte de código) en términos de rendimiento medido.

## Limitaciones y advertencias

- Ausencia de validación publicada: todas las puertas de corrección y las mediciones de rendimiento figuran como no revalidadas para este paquete, por lo que no hay garantía documentada de equivalencia con llama.cpp.
- Riesgo de alucinación: no cuantificado en la información disponible; es un riesgo inherente a los modelos generativos, especialmente en tareas de código y análisis de imágenes.
- Idiomas soportados no declarados: no se puede confirmar el rendimiento en castellano ni en otros idiomas distintos de los usados en el entrenamiento original.
- Sesgos: no documentados en la información proporcionada.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base original de SenseTime y del checkpoint de bartowski, ya que esta ficha solo cubre el empaquetado Loom.
- Dependencia de hardware AMD específico: la ruta soportada son gfx1151 y gfx1201; no se documenta compatibilidad con otras GPUs ni con CUDA.
- Límites operativos: 4.096 tokens máximos de salida por petición y 4 peticiones concurrentes, lo que puede ser insuficiente para cargas de producción de alta demanda.
- Madurez del ecosistema: el paquete depende de `hrx-loom==0.2.0`, una versión temprana de la herramienta, y de generadores `loom-next` sin LLM en el bucle; la estabilidad a largo plazo no está garantizada.
- Sin soporte de audio ni decodificación especulativa, lo que limita casos de uso multimodales más amplios.

## Enlaces

- Paquete en Hugging Face: https://huggingface.co/loom-draft/bartowski-sensenova_SenseNova-6.8-Code2Video-loom
- Checkpoint GGUF base: https://huggingface.co/bartowski/sensenova_SenseNova-6.8-Code2Video-GGUF
- Repositorio Loom (ROCm): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Sitio del ecosistema Loom: https://loom-fun.github.io/loom-dev/
