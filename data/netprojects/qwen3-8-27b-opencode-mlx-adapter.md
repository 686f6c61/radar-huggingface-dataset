# netprojects/Qwen3.8-27B-opencode-MLX-adapter

## Resumen

Qwen3.8-27B-opencode-MLX-adapter es un adaptador LoRA en formato mlx-lm para el modelo base Qwen/Qwen3.8-27B, publicado por NetProjects (Internet Projects Ltd). El adaptador es una conversion del LoRA original de harness-hub/Qwen3.8-27B-opencode-adapted, entrenado con aprendizaje por refuerzo (AsyncGRPO en TRL) para convertir al modelo en el motor del agente de programacion OpenCode en tareas de ingenieria de software y terminal.

El adaptador tiene rango 32, escala 2.0 (alpha 64) y se aplica sobre las proyecciones q, k, v y o de las 16 capas de atencion completa, y sobre gate, up y down de las 64 capas. Los pesos se conservan en float32 original y se transponen al layout de mlx-lm. El repositorio ocupa 638 MB, por lo que se distribuye como adaptador que se monta sobre cualquier build MLX del modelo base, permitiendo alternar entre el modelo base y el adaptador sin duplicar pesos.

La relevancia del artefacto es doble: por un lado, traslada a Apple Silicon un adaptador especializado en agentes de codigo con mejoras publicadas de 35,3% a 51,0% en SWE-bench Pro (hard 51) y de 46,4% a 52,4% en Terminal-Bench 2.1; por otro, demuestra un flujo de conversion reproducible y verificado (256 modulos LoRA con actualizacion identica a `2.0 · B @ A` del fichero original). Esta pensado para desarrolladores que quieran ejecutar el agente OpenCode en local sobre hardware Apple con un unico modelo base y conmutar el adaptador segun la tarea.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador) sobre transformer Qwen3.8-27B; rango 32, escala 2.0 (alpha 64) |
| Parametros totales | no disponible (adaptador de 638 MB; el modelo base Qwen3.8-27B no detalla parametros en la informacion disponible) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (depende del modelo base Qwen3.8-27B) |
| Tipos de cuantizacion | adaptador en float32; builds merged disponibles en 4-bit, 6-bit, 8-bit y bf16 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | adaptador mlx-lm (layout MLX, pesos float32); builds merged en formato MLX |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 32 con escala 2.0 (alpha 64) que se inserta en las proyecciones q, k, v y o de las 16 capas de atencion completa del modelo base y en gate, up y down de las 64 capas. Los pesos se conservan en float32 original y se transponen al layout de mlx-lm; la verificacion en mlx-lm 0.32.2 sobre mlx-community/Qwen3.8-27B-4bit confirma la creacion de exactamente 256 modulos LoRA y que la actualizacion de cada modulo coincide con `2.0 · B @ A` del fichero original de harness-hub.

El entrenamiento del LoRA original lo realizo harness-hub mediante aprendizaje por refuerzo con AsyncGRPO en TRL, orientado a tareas de ingenieria de software y terminal dentro del agente OpenCode. El adaptador publicado por NetProjects no reentrena: solo convierte el LoRA a formato mlx-lm y valida su equivalencia numerica. La model card no detalla el volumen de datos de entrenamiento, la composicion del dataset ni si hubo etapas adicionales de RLHF o DPO mas alla del AsyncGRPO citado.

## Capacidades

- Generacion de codigo y resolucion de tareas de ingenieria de software en el contexto del agente OpenCode.
- Ejecucion de tareas de terminal y linea de comandos (Terminal-Bench 2.1).
- Tool calling y function calling: la verificacion del autor confirma que base 4-bit + adaptador produce una llamada a herramienta bien formada.
- Razonamiento multi-paso orientado a agentes, con modo thinking desactivable mediante `enable_thinking: false` en la plantilla de chat.
- Capacidad multimodal image-text-to-text heredada del pipeline declarado en el repositorio.
- Conmutacion entre modelo base y adaptador sobre un unico build MLX, sin duplicar pesos.
- Capacidades multilingues: no disponible.

## Casos de uso

- Agente de codigo en local sobre Apple Silicon: montar el adaptador sobre mlx-community/Qwen3.8-27B-4bit y servirlo con `mlx_lm.server` para que OpenCode lo use como backend, manteniendo el flujo de trabajo en la maquina del desarrollador.
- Resolucion de issues y parches en repositorios: el adaptador esta entrenado especificamente para SWE-bench Pro, por lo que es adecuado para tareas de localizacion de fallos, edicion de ficheros y generacion de parches dentro de un pipeline de agente.
- Automatizacion de tareas de terminal: uso en scripts de administracion, refactorizacion masiva o generacion de one-liners de shell, aprovechando la mejora medida en Terminal-Bench 2.1.
- Integracion en pipelines de CI/CD: servir el modelo con `mlx_lm.server` y consumirlo desde herramientas de revision automatica o generacion de tests, con thinking desactivado para reducir el consumo de tokens.
- Prototipado de agentes con tool calling: validar flujos de function calling y multi-step reasoning antes de desplegar en produccion, gracias a la verificacion de llamadas a herramienta bien formadas.
- Evaluacion comparativa de adaptadores: usar el mismo modelo base y alternar entre el adaptador opencode y el base para medir el efecto del entrenamiento por refuerzo en tareas concretas.
- Despliegue con requisitos de memoria ajustados: emplear el build merged de 4-bit (16,3 GB) o 6-bit (23,1 GB) en equipos con memoria unificada limitada, aceptando la perdida de fidelidad documentada.

## Benchmarks y rendimiento

Resultados publicados por harness-hub para el adaptador original, bajo OpenCode con thinking desactivado:

| Benchmark | Modelo base | Base + adaptador |
|---|---|---|
| SWE-bench Pro (hard 51) | 35,3% | 51,0% |
| Terminal-Bench 2.1 | 46,4% | 52,4% |

Fidelidad de los builds merged respecto a bf16:

| Build | Tamano | Mismo siguiente token que bf16 | KL vs bf16 |
|---|---|---|---|
| MLX-6bit (recomendado) | 23,1 GB | 98,7% | 0,0014 |
| MLX-8bit | 30,0 GB | 99,2% | 0,0004 |
| MLX-4bit | 16,3 GB | 96,7% | 0,0203 |
| MLX-bf16 | 55,6 GB | referencia | referencia |

No se han publicado resultados de benchmarks del adaptador en formato MLX mas alla de la verificacion cualitativa (3/3 tareas cortas de codigo superadas y llamada a herramienta bien formada).

## Requisitos de hardware

- VRAM/memoria unificada: el adaptador solo ocupa 638 MB, pero requiere cargar el modelo base. Con el build 4-bit el consumo ronda los 16,3 GB; con 6-bit, 23,1 GB; con 8-bit, 30,0 GB; con bf16, 55,6 GB.
- GPU recomendadas: Apple Silicon con memoria unificada suficiente. La verificacion se realizo en un MacBook Pro M5 Max de 128 GB con mlx 0.32.4 y mlx-lm 0.32.2.
- Cabe en GPU de consumo: si, en equipos Apple Silicon con memoria unificada suficiente; el build 4-bit (16,3 GB) es el mas accesible. No hay datos de despliegue en GPU NVIDIA en la informacion disponible.
- Opciones de despliegue: mlx-lm (version >= 0.32.2) mediante `mlx_lm.generate`, API Python `load`/`generate` y `mlx_lm.server` para servir el modelo a OpenCode.
- Latencia y throughput: no disponible. La model card solo indica que con thinking desactivado el modelo genera aproximadamente una sexta parte de los tokens del base con thinking al maximo esfuerzo, manteniendo resultados equivalentes.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B-opencode-MLX-adapter (este) | adaptador sobre Qwen3.8-27B | no disponible | SWE-bench Pro 51,0%; Terminal-Bench 2.1 52,4% | Apache-2.0 | Hugging Face, formato MLX |
| Qwen/Qwen3.8-27B (base) | no disponible | no disponible | SWE-bench Pro 35,3%; Terminal-Bench 2.1 46,4% | Apache-2.0 | Hugging Face |
| harness-hub/Qwen3.8-27B-opencode-adapted (LoRA original) | adaptador sobre Qwen3.8-27B | no disponible | mismos resultados publicados | Apache-2.0 | Hugging Face |
| netprojects/Qwen3.8-27B-opencode-MLX-6bit (merged) | modelo fusionado | no disponible | 98,7% mismo siguiente token que bf16 | Apache-2.0 | Hugging Face |

No se dispone de datos de otros modelos comparables de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- El adaptador no es un modelo autonomo: requiere cargar el modelo base Qwen/Qwen3.8-27B en formato MLX, lo que implica el coste de memoria del base completo.
- Los resultados de SWE-bench Pro y Terminal-Bench 2.1 corresponden al adaptador original de harness-hub; la model card no publica una reevaluacion independiente del adaptador convertido a MLX.
- El rendimiento esta optimizado para el agente OpenCode y tareas de codigo/terminal; fuera de ese dominio no hay garantias de mejora frente al base.
- Thinking desactivado es la configuracion recomendada por el autor; activarlo puede cambiar el comportamiento y el consumo de tokens.
- Los builds merged cuantizados introducen perdida de fidelidad medible (KL 0,0203 en 4-bit frente a 0,0014 en 6-bit), relevante en tareas sensibles a la precision.
- Riesgo de alucinacion y sesgos: no documentados en la informacion disponible.
- Idiomas soportados: no disponible.
- Licencia Apache-2.0 permite uso comercial, pero el autor declara no estar afiliado a Hugging Face, harness-hub ni Alibaba; conviene revisar el NOTICE y los terminos del modelo base.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso en produccion por terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/netprojects/Qwen3.8-27B-opencode-MLX-adapter
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Adaptador original: https://huggingface.co/harness-hub/Qwen3.8-27B-opencode-adapted
- Build merged 6-bit (recomendado): https://huggingface.co/netprojects/Qwen3.8-27B-opencode-MLX-6bit
- Build merged 8-bit: https://huggingface.co/netprojects/Qwen3.8-27B-opencode-MLX-8bit
- Build merged 4-bit: https://huggingface.co/netprojects/Qwen3.8-27B-opencode-MLX-4bit
- Build merged bf16: https://huggingface.co/netprojects/Qwen3.8-27B-opencode-MLX-bf16
- OpenCode: https://opencode.ai
- Perfil de NetProjects en Hugging Face: https://huggingface.co/netprojects
- Sitio de NetProjects: https://netprojects.com
