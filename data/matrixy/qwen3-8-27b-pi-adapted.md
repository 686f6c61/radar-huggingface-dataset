# matrixy/Qwen3.8-27B-pi-adapted

## Resumen
Qwen3.8-27B-pi-adapted es un adaptador LoRA sobre el modelo base Qwen/Qwen3.8-27B, desarrollado por el usuario matrixy y publicado bajo el paraguas de harness-hub. No se trata de un modelo completo, sino de un ajuste fino orientado a reforzar el comportamiento del modelo base como motor de un agente de programación llamado pi (earendil-works/pi), especializado en tareas de ingeniería de software y operaciones de terminal. El adaptador se entrena mediante aprendizaje por refuerzo (GRPO asíncrono) sobre conjuntos de datos de trayectorias de agente (scale800-harbor, harness-adapters, termgrade-train-harbor y termgrade-environments).

El objetivo declarado es conseguir que el modelo resuelva tareas de SWE-bench Pro y Terminal-Bench con un presupuesto de pasos limitado y con el modo de razonamiento desactivado, reduciendo drásticamente el número de tokens generados. Según la model card, el adaptador iguala o supera al modelo base con razonamiento máximo (`xhigh`) en Terminal-Bench 2.1 (56,6 % frente a 54,2 %) generando aproximadamente 4,5 veces menos tokens por tarea, y alcanza 64,7 % en el subconjunto hard 51 de SWE-bench Pro frente al 39,2 % del base sin razonamiento.

La relevancia actual reside en la tendencia a adaptar modelos abiertos de gran tamaño a entornos de agente concretos mediante RL, en lugar de reentrenar desde cero. El repositorio ocupa 0,7 GB (solo los pesos del adaptador) y se distribuye con licencia Apache 2.0, lo que facilita su integración en pipelines propios. El pipeline declarado es image-text-to-text, aunque las evaluaciones publicadas se realizan en modo solo texto, sin servir la torre de visión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer Qwen3.8-27B; adaptador de bajo rango |
| Parametros totales | no disponible (el adaptador ocupa 0,7 GB; los parámetros del modelo base no se detallan en la información disponible) |
| Parametros activos | no disponible (no se indica que el modelo base sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en la información del adaptador; existe una versión GGUF publicada por harness-hub |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT); existe variante GGUF en harness-hub/Qwen3.8-27B-pi-adapted-GGUF |

## Arquitectura y entrenamiento
El adaptador es un LoRA entrenado con TRL y GRPO asíncrono (async-grpo) sobre el modelo base Qwen3.8-27B. El entrenamiento se realiza con recompensas derivadas de la ejecución de tareas en entornos de agente (harbor, openenv), usando los datasets harness-hub/scale800-harbor, harness-hub/harness-adapters, harness-hub/termgrade-train-harbor y ai-and/termgrade-environments. El checkpoint seleccionado es el step 160, elegido según las puntuaciones en SWE-bench Pro y en un subconjunto de 18 tareas de Terminal-Bench 2.1 monitorizadas durante el entrenamiento.

La innovación principal no está en la arquitectura del transformer subyacente (que no se detalla en la información disponible), sino en el procedimiento de RL: se optimiza el comportamiento del agente bajo el arnés pi con un presupuesto de 100 pasos, una sola tentativa por tarea y muestreo a temperatura 0,8 con top-p 1,0 (la configuración de entrenamiento). El resultado es un adaptador que aprende a resolver tareas con menos turnos y menos tokens, acercándose al rendimiento del modo de razonamiento máximo sin activarlo. La receta completa se anuncia en el blogpost de harness-hub.

## Capacidades
- Generación de texto y razonamiento en el contexto de tareas de ingeniería de software y terminal.
- Ejecución de trayectorias de agente multi-paso con llamadas a herramientas (tool calling) bajo el arnés pi.
- Resolución de tareas de parcheo de código, ejecución de tests y corrección iterativa.
- Operaciones de terminal: búsqueda, ejecución de comandos, inspección de ficheros.
- Modo de razonamiento (`thinking`) del modelo base, evaluado a esfuerzo `xhigh`.
- Capacidad image-text-to-text declarada en el pipeline, aunque las evaluaciones publicadas son solo texto y la torre de visión no se sirve.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso
- Agente de resolución de incidencias en repositorios: integrado en el arnés pi, el adaptador localiza la función afectada, aplica el parche, ejecuta los tests y corrige el último caso fallido en un número reducido de llamadas a herramientas, como se muestra en la trayectoria de ejemplo de la model card (tarea de Ansible, `human_to_bytes`).
- Automatización de tareas de terminal en CI/CD: el adaptador puede ejecutar comandos, inspeccionar salidas y aplicar correcciones dentro de un presupuesto de 100 pasos, lo que encaja en pipelines de integración con límites de tiempo y coste.
- Evaluación comparativa de agentes: sirve como referencia para medir la eficiencia (tokens y turnos por tarea resuelta) frente al modelo base con razonamiento máximo, gracias a los resultados pareados publicados.
- Asistente de mantenimiento de código heredado: el ejemplo de Ansible demuestra capacidad para trabajar sobre bases de código reales con tests existentes y funciones de utilidad complejas.
- Reducción de coste de inferencia en producción: al igualar el rendimiento de Terminal-Bench 2.1 del modo `xhigh` con razonamiento desactivado y ~4,5 veces menos tokens, es adecuado para despliegues con presupuesto de tokens ajustado.
- Investigación en RL para agentes: la receta y los datasets publicados permiten reproducir el entrenamiento de adaptadores de arnés propios.

## Benchmarks y rendimiento

Resultados bajo el arnés pi, una tentativa por tarea, presupuesto de 100 pasos, razonamiento desactivado salvo indicación, solo texto, temperatura 0,8 y top-p 1,0.

| Benchmark | Qwen3.8-27B | Qwen3.8-27B `xhigh` | pi-adapted | pi-adapted `xhigh` |
|---|---|---|---|---|
| SWE-bench Pro (hard 51) | 39,2 % | 74,5 % | 64,7 % | 74,5 % |
| Terminal-Bench 2.1 | 41,0 % | 54,2 % | 56,6 % | 56,6 % |

Resultados pareados frente al modelo base (una tentativa, razonamiento desactivado):

| Benchmark | Tareas | Base | pi-adapted (step 160) | Diferencia | Nuevas / perdidas |
|---|---|---|---|---|---|
| SWE-bench Pro (hard 51) | 51 | 39,2 % | 64,7 % | +25,5 ± 14,2 | 15 / 2 (p = 0,0023) |
| Terminal-Bench 2.1 | 86 | 39,5 % | 55,8 % | +16,3 ± 9,1 | 16 / 2 (p = 0,0013) |
| Terminal-Bench 2.1 (68 tareas no usadas para elegir checkpoint) | 68 | 39,7 % | 55,9 % | +16,2 ± 10,6 | 13 / 2 (p = 0,0074) |

La model card advierte que estos números no son comparables con los de la ficha de Qwen3.8-27B, que usa otros arneses (Terminus, Claude Code), razonamiento a máximo esfuerzo, presupuestos mayores y el SWE-bench Pro completo.

## Requisitos de hardware
- VRAM estimada para inferencia: no disponible en la información proporcionada; depende del modelo base Qwen3.8-27B y de la cuantización elegida.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible; existe una variante GGUF publicada por harness-hub que podría permitir despliegue en llama.cpp y Llama.app en macOS, pero no se detallan requisitos.
- Opciones de despliegue documentadas: transformers, vLLM, llama.cpp, Llama.app (macOS) y fusión del adaptador con PEFT.
- Latencia y throughput: no disponibles; la model card solo reporta que el adaptador genera aproximadamente 4,5 veces menos tokens por tarea que el base con razonamiento `xhigh` y usa menos de la mitad de turnos en las tareas que ambos resuelven.

## Comparativa con modelos similares

| Modelo | Tipo | Contexto | SWE-bench Pro (hard 51) | Terminal-Bench 2.1 | Licencia |
|---|---|---|---|---|---|
| Qwen3.8-27B-pi-adapted | LoRA sobre Qwen3.8-27B | no disponible | 64,7 % (sin thinking) | 56,6 % (sin thinking) | Apache 2.0 |
| Qwen3.8-27B (base) | Modelo completo | no disponible | 39,2 % (sin thinking) / 74,5 % (`xhigh`) | 41,0 % (sin thinking) / 54,2 % (`xhigh`) | no disponible en esta ficha |
| Adaptadores de arnés de harness-hub | LoRA sobre modelos abiertos | no disponible | no disponible | no disponible | no disponible |

La comparativa se limita al modelo base porque la información proporcionada no incluye otros adaptadores de arnés con resultados publicados.

## Limitaciones y advertencias
- Los resultados están medidos exclusivamente bajo el arnés pi, con una tentativa por tarea, presupuesto de 100 pasos y muestreo a temperatura 0,8/top-p 1,0; no son extrapolables a otros arneses o configuraciones.
- El adaptador se evalúa en modo solo texto: la torre de visión no se sirve, pese a que el pipeline declarado sea image-text-to-text.
- El checkpoint (step 160) se eligió usando puntuaciones en SWE-bench Pro y en un subconjunto de 18 tareas de Terminal-Bench 2.1, lo que introduce un riesgo de sobreajuste a esos conjuntos; la model card mitiga parcialmente esto con los resultados en las 68 tareas no usadas para la selección.
- No se dispone de información sobre sesgos, idiomas soportados ni riesgo de alucinación específicos del adaptador.
- El adaptador hereda las limitaciones del modelo base Qwen3.8-27B, cuyos detalles no se incluyen en la información disponible.
- La licencia Apache 2.0 permite uso comercial, pero debe verificarse la licencia del modelo base Qwen3.8-27B antes de desplegar en producción.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación independiente de los resultados.

## Enlaces
- Hugging Face del adaptador: https://huggingface.co/matrixy/Qwen3.8-27B-pi-adapted
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Versión GGUF: https://huggingface.co/harness-hub/Qwen3.8-27B-pi-adapted-GGUF
- Repositorio del agente pi: https://github.com/earendil-works/pi
- Blogpost de la receta: https://huggingface.co/blog/harness-hub/harness-adapters-at-scale
- Dataset SWE-bench Pro hard 51: https://huggingface.co/datasets/harness-hub/swebench-pro-v2-hard51-harbor
- Dataset Terminal-Bench 2.1: https://huggingface.co/datasets/harborframework/terminal-bench-2.1
- Dataset de entrenamiento: https://huggingface.co/datasets/harness-hub/scale800-harbor
- Dataset de entrenamiento: https://huggingface.co/datasets/harness-hub/harness-adapters
- Dataset de entrenamiento: https://huggingface.co/datasets/harness-hub/termgrade-train-harbor
- Dataset de entrenamiento: https://huggingface.co/datasets/ai-and/termgrade-environments
