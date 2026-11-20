# personaxis/Qwen3.8-27B-pi-adapted

## Resumen
Qwen3.8-27B-pi-adapted es un adaptador LoRA sobre el modelo base Qwen/Qwen3.8-27B, publicado por el usuario personaxis en Hugging Face. El adaptador se ha entrenado mediante aprendizaje por refuerzo (GRPO asíncrono con TRL) para funcionar como el modelo subyacente del agente de programación pi (earendil-works/pi) en tareas de ingeniería de software y de terminal. El problema que aborda es la eficiencia en agentes: el modelo base consume muchos turnos y tokens para resolver tareas de SWE-bench Pro y Terminal-Bench 2.1, mientras que este adaptador reduce el trabajo por tarea manteniendo una precisión competitiva.

La propuesta central es obtener la mayor parte de la ganancia del modo de razonamiento de máximo esfuerzo (`xhigh`) con aproximadamente una cuarta parte de los tokens. Con el thinking desactivado, el adaptador iguala al modelo base con thinking `xhigh` en Terminal-Bench 2.1 (56,6 % frente a 54,2 %) y alcanza 25 de los 35 puntos de ganancia del thinking en SWE-bench Pro (64,7 % frente a 74,5 %), generando unas 4,5 veces menos tokens por tarea. El adaptador es relevante para quienes despliegan agentes de código en producción y necesitan reducir coste de inferencia y latencia sin renunciar a la precisión.

El repositorio es pequeño (0,7 GB) porque contiene únicamente los pesos del adaptador en formato safetensors, no el modelo completo. La licencia declarada es Apache 2.0 y el pipeline es image-text-to-text, aunque las evaluaciones publicadas se han realizado en modo solo texto (la torre de visión no se sirve).

## Especificaciones tecnicas
| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer Qwen3.8-27B; entrenamiento con GRPO asíncrono (TRL) |
| Parametros totales | no disponible (adaptador LoRA; el modelo base Qwen3.8-27B no detalla parámetros en la información proporcionada) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (existe una versión GGUF publicada por harness-hub) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT); disponible también en GGUF |

## Arquitectura y entrenamiento
El adaptador se construye sobre Qwen/Qwen3.8-27B mediante PEFT (LoRA) y se entrena con aprendizaje por refuerzo, concretamente GRPO asíncrono implementado con TRL. El objetivo del entrenamiento es que el modelo actúe como el motor del agente de programación pi en entornos de terminal e ingeniería de software. Los datasets empleados, según las etiquetas del repositorio, son harness-hub/scale800-harbor, harness-hub/harness-adapters, harness-hub/termgrade-train-harbor y ai-and/termgrade-environments, orientados a la construcción de adaptadores de harness y a la evaluación de tareas de terminal.

La innovación principal no está en la arquitectura del transformer subyacente, sino en el procedimiento de adaptación: se entrena el modelo para resolver tareas agénticas con menos turnos y menos tokens generados, de modo que el modo sin thinking rinda cerca del modo con thinking de máximo esfuerzo. El checkpoint publicado corresponde al paso 160, seleccionado según las puntuaciones en SWE-bench Pro y en un subconjunto de 18 tareas de Terminal-Bench 2.1 monitorizado durante el entrenamiento. La receta completa se anuncia en el blogpost de lanzamiento de harness-hub.

## Capacidades
- Generación de texto y razonamiento en el contexto de tareas agénticas de software.
- Ejecución de tareas de ingeniería de software: localizar funciones, editar código, ejecutar tests y corregir fallos.
- Uso de herramientas (tool calling) dentro del harness pi, con trayectorias de múltiples llamadas a herramientas.
- Razonamiento multi-paso y planificación acotada por presupuesto de pasos (100 pasos en las evaluaciones).
- Operación en entornos de terminal (Terminal-Bench 2.1).
- Capacidad multimodal declarada por el pipeline image-text-to-text del modelo base, aunque en las evaluaciones publicadas la torre de visión no se sirve y se opera en modo solo texto.
- Modo thinking del chat template, con nivel de esfuerzo `xhigh` disponible; el adaptador está optimizado para rendir sin thinking.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso
- Agente de resolución de incidencias en repositorios: el adaptador puede recibir un issue, localizar la función afectada, aplicar el parche y ejecutar la suite de tests en pocos turnos, lo que reduce el coste por incidencia frente al modelo base con thinking.
- Automatización de tareas de terminal en CI/CD: integrado en el harness pi, puede ejecutar comandos, interpretar salidas y corregir errores dentro de un presupuesto de pasos, útil para tareas de mantenimiento repetitivas.
- Corrección de tests fallidos en pipelines: dado un fallo de test, el adaptador inspecciona el código, reproduce el error y aplica la corrección, aprovechando su menor número de turnos por tarea resuelta.
- Asistente de refactorización acotada: para cambios localizados (renombrados, ajustes de firma, corrección de funciones auxiliares), el adaptador ofrece una relación precisión/coste favorable al operar sin thinking.
- Evaluación y benchmarking de agentes: sirve como referencia de adaptador de harness para comparar configuraciones de agente bajo condiciones idénticas, dado que el autor publica resultados emparejados con tests de signos.
- Despliegue en entornos con restricciones de latencia y coste: al generar aproximadamente 4,5 veces menos tokens por tarea, encaja en escenarios donde el coste de inferencia por tarea es crítico.
- Investigación en RL para agentes: la receta (GRPO asíncrono con TRL sobre datos de harness) es replicable para construir adaptadores propios sobre otros modelos base.

## Benchmarks y rendimiento
Resultados publicados por el autor bajo el harness pi, un intento por tarea, presupuesto de 100 pasos, thinking desactivado salvo indicación, solo texto, muestreo con temperatura 0,8 y top-p 1,0. El modelo base y el adaptador se ejecutan con ajustes idénticos.

| Benchmark | Qwen3.8-27B | Qwen3.8-27B, thinking `xhigh` | Qwen3.8-27B-pi-adapted | Qwen3.8-27B-pi-adapted, thinking `xhigh` |
|---|---|---|---|---|
| SWE-bench Pro (hard 51) | 39,2 % | 74,5 % | 64,7 % | 74,5 % |
| Terminal-Bench 2.1 | 41,0 % | 54,2 % | 56,6 % | 56,6 % |

Resultados emparejados (un intento por tarea, thinking desactivado, comparación contra el modelo base en las mismas tareas; intervalo del 95 % y test de signos exacto):

| Benchmark | Tareas | Qwen3.8-27B | Adaptador (paso 160) | Diferencia (puntos) | Nuevas resueltas / perdidas |
|---|---|---|---|---|---|
| SWE-bench Pro (hard 51) | 51 | 39,2 % | 64,7 % | +25,5 ± 14,2 | 15 / 2 (p = 0,0023) |
| Terminal-Bench 2.1 | 86 | 39,5 % | 55,8 % | +16,3 ± 9,1 | 16 / 2 (p = 0,0013) |
| Terminal-Bench 2.1, 68 tareas no usadas para elegir el checkpoint | 68 | 39,7 % | 55,9 % | +16,2 ± 10,6 | 13 / 2 (p = 0,0074) |

Notas del autor: en Terminal-Bench 2.1 las cuatro configuraciones se comparan sobre las 83 tareas que todas calificaron, por lo que las cifras difieren ligeramente de los resultados emparejados (86 tareas). Los resultados no son comparables con los de la model card de Qwen3.8-27B, que usa otros harnesses (Terminus, Claude Code), thinking a máximo esfuerzo, presupuestos mayores y el SWE-bench Pro completo. SWE-bench Pro (hard 51) corresponde a las 51 tareas más difíciles, con 2 horas y 100 pasos por tarea; Terminal-Bench 2.1 comprende las 89 tareas, con 1 hora y 100 pasos por tarea.

Trabajo por tarea resuelta: según el autor, el adaptador necesita menos de la mitad de turnos que el modelo base en las tareas que ambos resuelven, con aproximadamente 4,5 veces menos tokens generados por tarea.

## Requisitos de hardware
- VRAM estimada para inferencia: no disponible en la información proporcionada; depende del modelo base Qwen3.8-27B y de la cuantización empleada, dato no publicado.
- GPU recomendadas: no disponibles en la información proporcionada.
- Viabilidad en GPU de consumo: no disponible; existe una versión GGUF publicada por harness-hub que sugiere despliegue en llama.cpp y Llama.app en macOS, pero no se detallan requisitos.
- Opciones de despliegue: transformers, vLLM, llama.cpp, Llama.app (macOS) y fusión del adaptador con PEFT; el autor documenta secciones específicas para cada una.
- Latencia y throughput estimados: no disponibles como cifras absolutas; el autor reporta aproximadamente 4,5 veces menos tokens generados por tarea y menos de la mitad de turnos en tareas resueltas por ambos modelos.

## Comparativa con modelos similares
| Modelo | Parámetros | Contexto | SWE-bench Pro (hard 51) | Terminal-Bench 2.1 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Qwen3.8-27B-pi-adapted (este) | no disponible (adaptador LoRA sobre Qwen3.8-27B) | no disponible | 64,7 % (sin thinking) / 74,5 % (`xhigh`) | 56,6 % (sin thinking) / 56,6 % (`xhigh`) | Apache 2.0 | Hugging Face (safetensors y GGUF) |
| Qwen3.8-27B (base) | no disponible | no disponible | 39,2 % (sin thinking) / 74,5 % (`xhigh`) | 41,0 % (sin thinking) / 54,2 % (`xhigh`) | no disponible en la información | Hugging Face |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de otros adaptadores o modelos comparables en la información proporcionada. La comparación más directa y documentada es contra el modelo base Qwen3.8-27B bajo el mismo harness y ajustes.

## Limitaciones y advertencias
- Los resultados publicados se han obtenido exclusivamente bajo el harness pi, con un intento por tarea, presupuesto de 100 pasos, thinking desactivado salvo indicación y modo solo texto; no deben extrapolarse a otros harnesses ni a configuraciones distintas.
- Las cifras no son comparables con las de la model card de Qwen3.8-27B, que emplea Terminus y Claude Code, thinking a máximo esfuerzo, presupuestos mayores y el SWE-bench Pro completo.
- El adaptador está especializado en tareas agénticas de ingeniería de software y terminal; su rendimiento en otras tareas de propósito general no está documentado y podría degradarse respecto al modelo base.
- La torre de visión no se sirve en las evaluaciones; aunque el pipeline declarado es image-text-to-text, no hay evidencia publicada del rendimiento multimodal del adaptador.
- No se han publicado datos sobre sesgos, tasas de alucinación ni comportamiento multilingüe.
- El checkpoint publicado (paso 160) se seleccionó usando puntuaciones en SWE-bench Pro y en un subconjunto de 18 tareas de Terminal-Bench 2.1; el autor mitiga el riesgo de sobreajuste reportando resultados en las 68 tareas restantes, pero persiste la cautela sobre la selección de checkpoint.
- Licencia Apache 2.0 declarada para el adaptador; deben verificarse las condiciones del modelo base Qwen3.8-27B para uso comercial combinado.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado el mismo día (2026-11-20); se trata de una publicación reciente sin validación independiente.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/personaxis/Qwen3.8-27B-pi-adapted
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Versión GGUF: https://huggingface.co/harness-hub/Qwen3.8-27B-pi-adapted-GGUF
- Agente pi: https://github.com/earendil-works/pi
- Blogpost de la receta: https://huggingface.co/blog/harness-hub/harness-adapters-at-scale
- Dataset SWE-bench Pro (hard 51): https://huggingface.co/datasets/harness-hub/swebench-pro-v2-hard51-harbor
- Dataset Terminal-Bench 2.1: https://huggingface.co/datasets/harborframework/terminal-bench-2.1
