# harness-hub/Qwen3.8-27B-hermes-adapted

## Resumen

Qwen3.8-27B-hermes-adapted es un adaptador LoRA sobre el modelo base Qwen/Qwen3.8-27B, desarrollado por harness-hub y entrenado mediante aprendizaje por refuerzo (GRPO asíncrono con TRL) para funcionar como el modelo subyacente del agente Hermes Agent de NousResearch en tareas de ingeniería de software y terminal. No es un modelo completo: el repositorio contiene únicamente los pesos del adaptador PEFT (0,7 GB), que deben combinarse con el modelo base para su uso.

El objetivo del adaptador es reducir el coste computacional de la resolución de tareas agénticas sin sacrificar precisión. Según la model card, con el modo de razonamiento (thinking) desactivado iguala al modelo base con thinking a máximo esfuerzo en SWE-bench Pro (43,1% frente a 45,1%) y Terminal-Bench 2.1 (58,8% frente a 58,8%), generando entre 3,5 y 4,4 veces menos tokens por tarea. Esto lo hace relevante para despliegues de agentes de código donde el coste por token y la latencia dominan la factura.

La ficha se elabora a partir de la información publicada en Hugging Face; los datos no presentes en dicha información se indican explícitamente como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer Qwen3.8-27B; el adaptador en sí es de bajo rango |
| Parametros totales | No disponible para el adaptador (0,7 GB en safetensors); el modelo base es Qwen3.8-27B |
| Parametros activos | No aplica (no es MoE según la información disponible) |
| Longitud de contexto | 131.072 tokens (ventana usada en la evaluación bajo Hermes Agent) |
| Tipos de cuantizacion | No disponible en el repo del adaptador; existe una versión GGUF publicada aparte (Qwen3.8-27B-hermes-adapted-GGUF) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (adaptador PEFT/LoRA); GGUF disponible en repositorio separado |

## Arquitectura y entrenamiento

El adaptador se entrena con aprendizaje por refuerzo sobre el modelo base Qwen3.8-27B, usando TRL con GRPO asíncrono (async-grpo) y LoRA como método de ajuste eficiente. El entrenamiento se orienta a tareas agénticas de ingeniería de software y terminal dentro del harness Hermes Agent, con entornos y datos de entrenamiento publicados por el autor: harness-hub/scale800-harbor, harness-hub/harness-adapters, harness-hub/termgrade-train-harbor y ai-and/termgrade-environments. La model card anuncia que la receta completa se publicará en el blog de lanzamiento (harness-adapters-at-scale) para que terceros puedan construir sus propios adaptadores de harness.

La innovación principal no está en la arquitectura del transformer subyacente, sino en el procedimiento de RL: se optimiza al modelo para que resuelva tareas con pocos turnos y pocas llamadas a herramientas, manteniendo la precisión del modo thinking. En la evaluación, el adaptador resuelve tareas que el base resolvía con 59 turnos en 22 turnos (SWE-bench Pro) y con 21 turnos en 8 (Terminal-Bench 2.1), con aproximadamente la mitad de tokens generados. No se detallan en la información disponible el número total de tokens de entrenamiento ni la composición exacta del dataset más allá de los identificadores citados.

## Capacidades

- Generación de texto y razonamiento orientado a tareas de ingeniería de software: parcheo de código, corrección de tests, depuración de fallos.
- Ejecución de tareas de terminal y línea de comandos dentro de un agente (Terminal-Bench 2.1).
- Uso de herramientas (tool calling / function calling) bajo el harness Hermes Agent: execute_code, terminal, read_file, entre otras.
- Razonamiento multi-paso y planificación agéntica con presupuesto de pasos (100 pasos por tarea en la evaluación).
- Modo thinking opcional heredado del modelo base (chat template con esfuerzo de razonamiento xhigh), aunque la model card recomienda desactivarlo.
- Capacidad multimodal heredada del modelo base (pipeline image-text-to-text), si bien en la evaluación el vision tower no se sirve y se opera solo con texto.
- Capacidades multilingües: no disponibles en la información proporcionada (los idiomas del modelo base no se detallan en la ficha del adaptador).

## Casos de uso

- Reparación automática de bugs en repositorios: el adaptador puede recibir un issue y un repositorio, ejecutar tests, inspeccionar código y generar un parche; su entrenamiento en SWE-bench Pro lo hace adecuado para tareas de parcheo con verificación automática.
- Agente de terminal para operaciones de sistemas: ejecución de comandos, diagnóstico de entornos y corrección de configuraciones, con un presupuesto acotado de pasos y turnos que reduce el coste operativo.
- Integración en pipelines de CI/CD: dado su bajo consumo de tokens por tarea (alrededor de 2 veces menos que el base en las tareas comparadas), puede usarse como agente de corrección automática de builds fallidos con coste controlado.
- Asistente de código en IDE o CLI: al mantener la precisión del modo thinking con thinking desactivado, ofrece respuestas rápidas y baratas para tareas de edición y refactorización de archivos.
- Automatización de tareas de mantenimiento de dependencias: actualización de versiones, ajuste de tests y verificación de compatibilidad mediante llamadas a herramientas de shell y ejecución de código.
- Evaluación y benchmarking interno de agentes: sirve como referencia de adaptador RL sobre Qwen3.8-27B para comparar harnesses y recetas de entrenamiento en entornos tipo Harbor/OpenEnv.
- Despliegue en entornos con ventana de contexto amplia: con 131.072 tokens, puede manejar conversaciones agénticas largas y múltiples archivos de un repositorio en una sola sesión.

## Benchmarks y rendimiento

Resultados publicados en la model card, bajo el harness Hermes Agent, un intento por tarea, presupuesto de 100 pasos, contexto de 131.072 tokens, thinking desactivado salvo indicación, solo texto, temperatura 0,8 y top-p 1,0.

| Benchmark | Qwen3.8-27B | Qwen3.8-27B (thinking) | Qwen3.8-27B-hermes-adapted | Qwen3.8-27B-hermes-adapted (thinking) |
|---|---|---|---|---|
| SWE-bench Pro (hard 51) | 29,4% | 45,1% | 43,1% | 51,0% |
| Terminal-Bench 2.1 | 44,7% | 58,8% | 58,8% | 57,6% |

Resultados pareados frente al modelo base (thinking desactivado, mismas tareas):

| Benchmark | Tareas | Base | Adaptador (step 160) | Diferencia (puntos) | Nuevas resueltas / perdidas |
|---|---|---|---|---|---|
| SWE-bench Pro (hard 51) | 51 | 29,4% | 43,1% | +13,7 ± 13,3 | 10 / 3 (p = 0,092) |
| Terminal-Bench 2.1 | 85 | 44,7% | 58,8% | +14,1 ± 11,4 | 19 / 7 (p = 0,029) |

Notas: SWE-bench Pro (hard 51) corresponde a las 51 tareas más difíciles de SWE-bench Pro, con 2 horas y 100 pasos por tarea; Terminal-Bench 2.1 usa 89 tareas, de las que 4 quedan fuera por fallos de entorno o timeout del verificador. El autor advierte que estos números no son comparables con los de la model card de Qwen3.8-27B, que emplea otros harnesses (Terminus, Claude Code), thinking a máximo esfuerzo y presupuestos mayores.

## Requisitos de hardware

- El adaptador LoRA ocupa 0,7 GB en safetensors; el requisito real de VRAM lo determina el modelo base Qwen3.8-27B, cuyas necesidades exactas no se detallan en la información disponible.
- GPU recomendadas: no disponibles de forma específica; para un modelo de 27B en precisión completa se requiere hardware de centro de datos (A100/H100) o cuantización agresiva en GPU de consumo.
- Cabe en GPU de consumo solo mediante cuantización (existe una versión GGUF publicada en repositorio separado), con requisitos concretos no disponibles en la información proporcionada.
- Opciones de despliegue documentadas: vLLM, transformers y llama.cpp; también se ofrece la ruta de fusión del adaptador con PEFT (merge).
- Latencia y throughput: no disponibles. La model card sí cuantifica el ahorro de trabajo por tarea: en las tareas que ambos modelos resuelven, el adaptador usa menos del 40% de los turnos del base (22 frente a 59 en SWE-bench Pro; 8 frente a 21 en Terminal-Bench 2.1) y aproximadamente la mitad de tokens generados.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | SWE-bench Pro (hard 51) | Terminal-Bench 2.1 | Licencia |
|---|---|---|---|---|---|---|
| Qwen3.8-27B-hermes-adapted | Adaptador LoRA RL | No disponible (base 27B) | 131.072 | 43,1% (thinking off) | 58,8% (thinking off) | Apache 2.0 |
| Qwen3.8-27B (base) | Modelo completo | 27B | 131.072 en la evaluación | 29,4% (thinking off) / 45,1% (thinking) | 44,7% (thinking off) / 58,8% (thinking) | No disponible en la información |
| Alternativas de la misma categoría | No disponible | No disponible | No disponible | No disponible | No disponible | No disponible |

La información proporcionada no incluye comparaciones con otros modelos de la misma categoría (por ejemplo, otros adaptadores agénticos o modelos de código de tamaño similar), por lo que la comparativa se limita al modelo base.

## Limitaciones y advertencias

- El adaptador debe combinarse con Qwen/Qwen3.8-27B; no es utilizable de forma autónoma.
- Los resultados están medidos bajo el harness Hermes Agent con una configuración concreta (100 pasos, 131.072 tokens de contexto, thinking off, temperatura 0,8, top-p 1,0) y no son comparables con los de la model card del modelo base, que usa otros harnesses y presupuestos.
- Con thinking activado bajo Hermes Agent, muchas sesiones se quedaron sin contexto, según advierte el autor; la recomendación es mantener thinking desactivado.
- El intervalo de confianza en SWE-bench Pro es amplio (±13,3 puntos) y el test de signos no alcanza significación estadística (p = 0,092); la mejora en Terminal-Bench 2.1 sí es significativa (p = 0,029).
- El vision tower no se sirve en la evaluación; el rendimiento multimodal no está validado en la información disponible.
- Riesgo de alucinación y sesgos: no documentados específicamente en la model card; aplican los del modelo base, no detallados aquí.
- Idiomas soportados: no disponibles; no se puede confirmar el comportamiento multilingüe del adaptador.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar la licencia del modelo base Qwen3.8-27B antes de producción, ya que no se detalla en la información proporcionada.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; se trata de una publicación reciente (creada el 2026-11-16) sin validación comunitaria independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/harness-hub/Qwen3.8-27B-hermes-adapted
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Versión GGUF: https://huggingface.co/harness-hub/Qwen3.8-27B-hermes-adapted-GGUF
- Hermes Agent (NousResearch): https://github.com/NousResearch/hermes-agent
- Blog de la receta de entrenamiento: https://huggingface.co/blog/harness-hub/harness-adapters-at-scale
- Dataset SWE-bench Pro hard 51: https://huggingface.co/datasets/harness-hub/swebench-pro-v2-hard51-harbor
- Dataset Terminal-Bench 2.1: https://huggingface.co/datasets/harborframework/terminal-bench-2.1
- Dataset de entrenamiento: https://huggingface.co/datasets/harness-hub/scale800-harbor
- Dataset de adaptadores: https://huggingface.co/datasets/harness-hub/harness-adapters
- Dataset TermGrade (entrenamiento): https://huggingface.co/datasets/harness-hub/termgrade-train-harbor
- Dataset TermGrade (entornos): https://huggingface.co/datasets/ai-and/termgrade-environments
