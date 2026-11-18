# harness-hub/Qwen3.8-27B-opencode-adapted

## Resumen

Qwen3.8-27B-opencode-adapted es un adaptador LoRA publicado por harness-hub sobre el modelo base Qwen/Qwen3.8-27B. No se trata de un modelo entrenado desde cero, sino de un ajuste fino mediante aprendizaje por refuerzo (GRPO asíncrono con TRL) cuyo objetivo es convertir el modelo base en el motor detrás del agente de programación OpenCode en tareas de ingeniería de software y de terminal. El repositorio ocupa 0,7 GB y contiene únicamente los pesos del adaptador en formato safetensors, no los del modelo completo.

La propuesta de valor del adaptador es la eficiencia: según la model card, con el modo de razonamiento (thinking) desactivado iguala o supera el rendimiento del modelo base con razonamiento a máximo esfuerzo, generando entre 6 y 8 veces menos tokens por tarea. En SWE-bench Pro (subconjunto de las 51 tareas más difíciles) pasa del 35,3 % al 51,0 %, y en Terminal-Bench 2.1 del 46,4 % al 52,4 % en la comparación por pares. Además, resuelve las tareas con muchas menos interacciones: 13 turnos frente a 48 del base en SWE-bench Pro.

Es relevante porque ejemplifica una tendencia práctica: adaptar modelos abiertos de gran tamaño a arneses de agente concretos mediante RL, en lugar de reentrenar el modelo completo. El adaptador se distribuye con licencia Apache 2.0, aunque hereda las características del modelo base, incluida una torre de visión que, según la model card, no se sirve en las evaluaciones publicadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer Qwen3.8-27B; el adaptador en sí es de bajo rango |
| Parametros totales | No disponible para el adaptador; el modelo base es Qwen3.8-27B (27B nominales) |
| Parametros activos | No aplica (no es MoE según la informacion disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible en la model card; existe un repositorio GGUF asociado (Qwen3.8-27B-opencode-adapted-GGUF) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); GGUF disponible en repositorio aparte |

## Arquitectura y entrenamiento

El adaptador se construye sobre Qwen/Qwen3.8-27B, un transformer multimodal (la pipeline declarada es image-text-to-text), mediante LoRA y la librería PEFT. El entrenamiento utiliza aprendizaje por refuerzo con GRPO asíncrono implementado con TRL, orientado a tareas de agente en entornos de terminal y de ingeniería de software. Los conjuntos de datos declarados son harness-hub/scale800-harbor, harness-hub/harness-adapters, harness-hub/termgrade-train-harbor y ai-and/termgrade-environments, lo que sugiere un pipeline de datos centrado en trayectorias de agente y entornos de evaluación tipo Harbor/OpenEnv.

El checkpoint publicado corresponde al paso 150, seleccionado según las puntuaciones en SWE-bench Pro y en un subconjunto de 18 tareas de Terminal-Bench 2.1 monitorizado durante el entrenamiento. La model card anuncia la publicación de la receta completa en un blogpost de harness-hub, pero no detalla el número de tokens de entrenamiento ni la composición exacta del dataset. La innovación principal no es arquitectónica sino de comportamiento: el adaptador aprende a resolver tareas con menos turnos y menos tokens, de modo que el modo thinking deja de aportar ventaja significativa.

## Capacidades

- Generación de código y resolución de tareas de ingeniería de software en entornos reales, evaluada en SWE-bench Pro.
- Ejecución de tareas de terminal y línea de comandos, evaluada en Terminal-Bench 2.1.
- Uso de herramientas (tool calling) dentro del arnés OpenCode, con trayectorias de múltiples pasos.
- Comportamiento de agente autónomo: planificación, edición de ficheros, ejecución de comandos y validación de resultados.
- Modo thinking disponible en la plantilla de chat, aunque la model card recomienda mantenerlo desactivado porque no aporta mejoras significativas en el adaptador.
- Capacidad multimodal heredada del modelo base (image-text-to-text), si bien la torre de visión no se sirve en las evaluaciones publicadas.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Reparación automática de bugs en repositorios: el adaptador puede recibir un issue y un repositorio, localizar el fallo y proponer un parche validado con los tests, aprovechando su entrenamiento específico en SWE-bench Pro y su tendencia a completar la tarea en pocos turnos.
- Agente de terminal para tareas de DevOps: ejecutar comandos, inspeccionar ficheros de configuración y corregir errores en entornos Linux, con un presupuesto de pasos acotado y menor consumo de tokens.
- Integración en el arnés OpenCode: desplegar el adaptador como motor del agente de programación OpenCode para asistentes de código en el IDE o en pipelines de CI/CD, con la ventaja de generar entre 6 y 8 veces menos tokens por tarea.
- Automatización de migraciones y refactorizaciones: tareas que requieren editar varios ficheros y verificar con tests, donde el modelo demuestra capacidad de escribir esquemas, validadores y pruebas en una sola trayectoria.
- Evaluación comparativa de adaptadores: servir como referencia para medir el impacto del RL sobre arneses de agente frente al modelo base, dado que la model card publica resultados emparejados con intervalos de confianza y tests de signos.
- Despliegue en local con llama.cpp u Ollama: gracias a la disponibilidad de pesos GGUF en un repositorio aparte, puede ejecutarse en estaciones de trabajo sin infraestructura de GPU de datacenter, aunque el tamaño del modelo base condiciona los requisitos.

## Benchmarks y rendimiento

Resultados publicados en la model card, bajo el arnés OpenCode, un intento por tarea, presupuesto de 100 pasos, temperatura 0,8 y top-p 1,0. La columna "thinking" corresponde al esfuerzo de razonamiento por defecto (xhigh).

| Benchmark | Modelo base | Base con thinking | Adaptador | Adaptador con thinking |
|---|---|---|---|---|
| SWE-bench Pro (hard 51) | 35,3 % | 47,1 % | 51,0 % | 54,9 % |
| Terminal-Bench 2.1 | 47,0 % | 55,4 % | 53,0 % | 56,6 % |

Resultados emparejados (un intento por tarea, thinking desactivado):

| Benchmark | Tareas | Base | Adaptador (paso 150) | Diferencia | Nuevas resueltas / perdidas |
|---|---|---|---|---|---|
| SWE-bench Pro (hard 51) | 51 | 35,3 % | 51,0 % | +15,7 ± 13,9 | 11 / 3 (p = 0,057) |
| Terminal-Bench 2.1 | 84 | 46,4 % | 52,4 % | +6,0 ± 10,7 | 13 / 8 (p = 0,38) |
| Terminal-Bench 2.1, 66 tareas no usadas para elegir checkpoint | 66 | 45,5 % | 59,1 % | +13,6 ± 11,1 | 12 / 3 (p = 0,035) |

Eficiencia por tarea resuelta (medianas sobre tareas que ambos resuelven): 13 turnos frente a 48 en SWE-bench Pro y la mitad en Terminal-Bench 2.1, con 3,5 y 2,6 veces menos tokens generados respectivamente.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; depende del modelo base Qwen3.8-27B y de la cuantización empleada.
- GPU recomendadas: no disponibles de forma específica; por el tamaño del modelo base se requiere hardware de gama alta (A100, H100 o equivalentes) para precisión completa, y GPUs de consumo con suficiente VRAM para cuantizaciones agresivas.
- Compatibilidad con GPU de consumo: posible únicamente mediante los pesos GGUF del repositorio asociado, sujeto a la VRAM disponible; no se publican cifras concretas.
- Opciones de despliegue: vLLM, transformers, llama.cpp y GGUF, según los enlaces de la model card; también es posible fusionar el adaptador con PEFT.
- Latencia y throughput: no disponibles; la model card solo aporta métricas relativas de eficiencia (menos turnos y entre 6 y 8 veces menos tokens por tarea).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | SWE-bench Pro (hard 51) | Terminal-Bench 2.1 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Qwen3.8-27B (base) | 27B | No disponible | 35,3 % (sin thinking) / 47,1 % (thinking) | 47,0 % / 55,4 % | No disponible | Hugging Face |
| Qwen3.8-27B-opencode-adapted | 27B + LoRA | No disponible | 51,0 % / 54,9 % | 53,0 % / 56,6 % | Apache 2.0 | Hugging Face (adaptador y GGUF) |
| Alternativas de la misma categoría | No disponible | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de otros adaptadores o modelos comparables en la información proporcionada; la comparación directa más fiable es contra el modelo base bajo el mismo arnés y configuración.

## Limitaciones y advertencias

- Los resultados están medidos exclusivamente bajo el arnés OpenCode; no son comparables con los publicados en la model card de Qwen3.8-27B, que usa otros arneses (Terminus, Claude Code), mayor presupuesto y el SWE-bench Pro completo.
- El intervalo de confianza de la mejora en SWE-bench Pro (±13,9 puntos) es amplio y el test de signos arroja p = 0,057, ligeramente por encima del umbral convencional de 0,05; la mejora en Terminal-Bench 2.1 completa tampoco alcanza significación (p = 0,38).
- El checkpoint se seleccionó usando parte de Terminal-Bench 2.1; la cifra de +13,6 puntos en las 66 tareas no usadas para la selección (p = 0,035) es la evidencia más sólida de generalización, pero sigue siendo un conjunto reducido.
- La torre de visión no se sirve en las evaluaciones, por lo que el rendimiento multimodal del adaptador no está caracterizado.
- No se documentan sesgos, comportamiento multilingüe ni riesgos de alucinación específicos; al ser un adaptador de agente que ejecuta comandos, los errores pueden tener efectos reales sobre el sistema donde opera.
- La licencia del adaptador es Apache 2.0, pero el uso comercial está condicionado por la licencia del modelo base, que no se detalla en la información disponible.
- El adaptador no incluye los pesos del modelo base: es necesario descargar Qwen/Qwen3.8-27B por separado y aplicar el LoRA o fusionarlo.
- La model card recomienda mantener el modo thinking desactivado; activarlo añade coste sin mejoras significativas según sus propias mediciones.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/harness-hub/Qwen3.8-27B-opencode-adapted
- Pesos GGUF: https://huggingface.co/harness-hub/Qwen3.8-27B-opencode-adapted-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Blogpost con la receta de entrenamiento: https://huggingface.co/blog/harness-hub/harness-adapters-at-scale
- OpenCode: https://opencode.ai
- Dataset SWE-bench Pro (hard 51): https://huggingface.co/datasets/harness-hub/swebench-pro-v2-hard51-harbor
- Dataset Terminal-Bench 2.1: https://huggingface.co/datasets/harborframework/terminal-bench-2.1
- Datasets de entrenamiento: https://huggingface.co/datasets/harness-hub/scale800-harbor, https://huggingface.co/datasets/harness-hub/harness-adapters, https://huggingface.co/datasets/harness-hub/termgrade-train-harbor, https://huggingface.co/datasets/ai-and/termgrade-environments
