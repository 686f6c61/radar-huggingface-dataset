# prithivMLmods/Qwen3.8-27B-opencode-adapted-bf16

## Resumen

Qwen3.8-27B-opencode-adapted-bf16 es un checkpoint autónomo en BF16 publicado por prithivMLmods que resulta de fusionar el adaptador LoRA `harness-hub/Qwen3.8-27B-opencode-adapted` sobre el modelo base `Qwen/Qwen3.8-27B`. El objetivo del adaptador es especializar el modelo como columna vertebral del agente de programación OpenCode en tareas de ingeniería de software y de terminal, de modo que pueda desplegarse en cualquier motor de inferencia sin necesidad de soporte nativo para LoRA.

El modelo conserva la arquitectura del Qwen3.8-27B original (familia Qwen3.5, transformer con tensores MTP) y añade el comportamiento aprendido mediante aprendizaje por refuerzo AsyncGRPO en entornos Harbor/OpenEnv. Según la model card del adaptador, su uso bajo OpenCode eleva SWE-bench Pro (hard 51) del 35,3% al 51,0% y Terminal-Bench 2.1 del 46,4% al 52,4%, reduciendo además el número de turnos necesarios y generando entre 6 y 8 veces menos tokens por tarea.

Es relevante ahora porque empaqueta en un único artefacto de pesos estándar una especialización orientada a agentes de código que normalmente requeriría cargar un adaptador aparte, lo que simplifica el despliegue en pipelines de CI/CD y en infraestructuras de inferencia que no gestionan LoRA. El repositorio ocupa 55,6 GB y contiene 18 shards safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de la familia Qwen3.5 (tag `qwen3_5`), con tensores MTP |
| Parametros totales | 27.781.427.952 (~27,8 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el checkpoint publicado es BF16; no se listan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (18 shards, BF16) |

## Arquitectura y entrenamiento

El checkpoint es un modelo transformer de la familia Qwen3.5 con aproximadamente 27,8 mil millones de parámetros, derivado de `Qwen/Qwen3.8-27B`. La fusión se realizó aplicando la actualización estándar `W + (alpha/r)·B@A` por tensor en fp32 y convirtiendo después de nuevo a BF16, preservando la disposición de shards, los nombres de tensores y todos los tensores MTP del modelo base. El adaptador original tenía r = 32, alpha = 64 y afectaba a las proyecciones q, k, v, o, gate, up y down.

El adaptador se entrenó con aprendizaje por refuerzo AsyncGRPO en entornos Harbor/OpenEnv, usando los datasets `harness-hub/scale800-harbor`, `harness-hub/harness-adapters`, `harness-hub/termgrade-train-harbor` y `ai-and/termgrade-environments`. El entrenamiento se realizó con el modo thinking desactivado, y ese mismo modo es el que debe usarse en inferencia para reproducir el comportamiento aprendido. No se especifican en la información disponible el número de tokens de entrenamiento, la composición detallada del dataset ni si hubo fases adicionales de SFT o DPO.

## Capacidades

- Generación de texto conversacional en inglés.
- Razonamiento orientado a tareas de ingeniería de software y de terminal.
- Ejecución de tareas de agente multi-paso bajo el arnés OpenCode.
- Uso de herramientas y entornos de ejecución (Harbor/OpenEnv) para resolver tareas de código.
- Capacidad multimodal de entrada imagen-texto según el `pipeline_tag` declarado (`image-text-to-text`), aunque no se detallan en la información disponible las capacidades de visión concretas.
- Modo thinking desactivado por defecto, tal como se entrenó; no se documenta un modo thinking activo funcional en este checkpoint.
- Soporte de plantilla de chat Jinja para formatear conversaciones y prompts.

## Casos de uso

- Agente de programación en terminal: el modelo puede conectarse al arnés OpenCode para resolver tareas de terminal y de ingeniería de software de extremo a extremo, aprovechando que fue entrenado específicamente para reducir turnos y tokens por tarea.
- Automatización de parches en repositorios: dado un issue o una descripción de bug, el modelo puede generar el parche correspondiente y validarlo ejecutando pruebas en el entorno, lo que encaja con su especialización en SWE-bench Pro.
- Integración en pipelines de CI/CD: al ser un checkpoint BF16 estándar sin LoRA, puede cargarse en motores de inferencia convencionales y usarse como paso de revisión o corrección automática de código dentro de un flujo de integración.
- Asistente de operaciones de terminal: el modelo puede interpretar comandos, diagnosticar errores de shell y proponer secuencias de comandos correctivas, apoyándose en su entrenamiento en entornos de terminal.
- Evaluación de agentes y arneses: sirve como referencia para medir el impacto de adaptadores GRPO en tareas de agente, ya que permite comparar directamente contra el modelo base sin necesidad de gestionar LoRA.
- Despliegue en infraestructura sin soporte LoRA: al estar fusionado, puede servirse en plataformas que solo aceptan pesos completos, simplificando la operativa frente a la versión con adaptador.

## Benchmarks y rendimiento

Los únicos datos disponibles proceden de la model card del adaptador y se midieron sobre el modelo base BF16 con el adaptador, no sobre este checkpoint fusionado, que no ha sido reevaluado.

| Benchmark | Modelo base | Con adaptador OpenCode |
|---|---|---|
| SWE-bench Pro (hard 51) | 35,3% | 51,0% |
| Terminal-Bench 2.1 | 46,4% | 52,4% |

Además, la model card indica que el adaptador requiere entre un cuarto y la mitad de turnos y genera entre 6 y 8 veces menos tokens por tarea en comparación con el modelo sin adaptar.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 55,6 GB solo para pesos, más overhead de activaciones y caché KV; se recomienda un mínimo de 64-80 GB de VRAM.
- GPU recomendadas para BF16: A100 80 GB, H100 80 GB, o configuraciones multi-GPU con tensor parallelism.
- En consumer GPU: no cabe en BF16 en una sola GPU de 24 GB; requeriría cuantización (no publicada en este repositorio) o sharding multi-GPU.
- Opciones de despliegue: al ser safetensors BF16 estándar, es compatible con motores que soporten la arquitectura Qwen3.5, como vLLM o TGI; no se documentan variantes GGUF ni Ollama en la información disponible.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se dispone de datos suficientes en la información proporcionada para establecer una comparativa rigurosa con alternativas de la misma categoría. Como referencia, el propio modelo base `Qwen/Qwen3.8-27B` y la versión con adaptador `harness-hub/Qwen3.8-27B-opencode-adapted` son los puntos de comparación naturales, pero no se han publicado sus especificaciones completas (contexto, cuantizaciones, benchmarks generales) en la información disponible.

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| prithivMLmods/Qwen3.8-27B-opencode-adapted-bf16 | ~27,8B | no disponible | Apache 2.0 | safetensors BF16 | Adaptador fusionado, orientado a agentes de código |
| Qwen/Qwen3.8-27B | no disponible | no disponible | no disponible | no disponible | Modelo base sin especialización |
| harness-hub/Qwen3.8-27B-opencode-adapted | no disponible | no disponible | no disponible | adaptador LoRA | Requiere motor con soporte LoRA |

## Limitaciones y advertencias

- El modelo está entrenado y evaluado únicamente en inglés; el rendimiento en castellano u otros idiomas no está documentado.
- El modo thinking debe permanecer desactivado para reproducir el comportamiento de entrenamiento; activarlo puede degradar los resultados.
- Los benchmarks reportados corresponden al adaptador sobre el modelo base y no han sido revalidados en este checkpoint fusionado.
- No se documentan sesgos conocidos, pero al derivar de Qwen3.8-27B hereda los sesgos del modelo base y de los datos de entrenamiento del adaptador.
- Riesgo de alucinación en tareas de código y terminal: las soluciones generadas deben validarse ejecutando pruebas en un entorno controlado.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen3.8-27B y de los datasets de entrenamiento citados.
- No se publican cuantizaciones, por lo que el despliegue en hardware limitado requiere generar las propias.
- El repositorio tiene 0 descargas y 1 like en el momento de la consulta, lo que indica una validación comunitaria muy limitada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/prithivMLmods/Qwen3.8-27B-opencode-adapted-bf16
- Modelo base del adaptador: https://huggingface.co/harness-hub/Qwen3.8-27B-opencode-adapted
- Modelo base original: https://huggingface.co/Qwen/Qwen3.8-27B
- Dataset scale800-harbor: https://huggingface.co/datasets/harness-hub/scale800-harbor
- Dataset harness-adapters: https://huggingface.co/datasets/harness-hub/harness-adapters
- Dataset termgrade-train-harbor: https://huggingface.co/datasets/harness-hub/termgrade-train-harbor
- Dataset termgrade-environments: https://huggingface.co/datasets/ai-and/termgrade-environments
