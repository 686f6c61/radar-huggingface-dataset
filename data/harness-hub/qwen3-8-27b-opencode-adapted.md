# harness-hub/Qwen3.8-27B-opencode-adapted

## Resumen

Qwen3.8-27B-opencode-adapted es un adaptador LoRA entrenado con aprendizaje por refuerzo sobre el modelo base Qwen/Qwen3.8-27B, desarrollado por harness-hub. Su objetivo es convertir al modelo en el motor detrás del agente de programación OpenCode, especializándolo en tareas de ingeniería de software y operaciones de terminal. El adaptador se publica bajo licencia Apache 2.0 y se distribuye como pesos PEFT en safetensors, con un tamaño de repositorio de 0,7 GB, lo que refleja que solo contiene los pesos del adaptador y no el modelo completo.

La propuesta central del proyecto es la eficiencia: con el modo de razonamiento desactivado, el adaptador iguala o supera el rendimiento del modelo base en su máximo esfuerzo de razonamiento (`xhigh`), generando entre 6 y 8 veces menos tokens por tarea. En SWE-bench Pro alcanza un 51,0 % frente al 47,1 % del base con thinking máximo, y en Terminal-Bench 2.1 un 53,0 % frente al 55,4 %. Además, resuelve las tareas con muchas menos interacciones con el entorno: 13 turnos frente a 48 en SWE-bench Pro y la mitad en Terminal-Bench 2.1.

El modelo es relevante porque demuestra que el ajuste fino con RL específico para un arnés de agente concreto (OpenCode) puede mejorar sustancialmente la tasa de éxito en tareas de ingeniería de software reales sin necesidad de aumentar el presupuesto de cómputo en inferencia. El adaptador está pensado para desplegarse junto al modelo base Qwen3.8-27B, que según la información disponible es un modelo multimodal de 27 mil millones de parámetros con torre de visión, aunque esta no se sirve en las evaluaciones del adaptador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer multimodal (Qwen3.8-27B); el adaptador en sí es PEFT |
| Parametros totales | No disponible para el adaptador; modelo base Qwen3.8-27B (27B según nomenclatura) |
| Parametros activos | No disponible (no es MoE según la información disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible en la información del adaptador; existe versión GGUF publicada |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (PEFT/LoRA); disponible también en GGUF |

## Arquitectura y entrenamiento

El adaptador se construye sobre Qwen/Qwen3.8-27B, un modelo multimodal de tipo image-text-to-text, y se entrena mediante aprendizaje por refuerzo con GRPO y async-GRPO usando la librería TRL. Se trata de un LoRA, no de un modelo completo: los pesos publicados son únicamente los del adaptador (0,7 GB), que debe combinarse con el modelo base para su uso. El entrenamiento se orienta específicamente a que el modelo funcione como el motor del agente OpenCode en tareas de ingeniería de software y terminal, con un presupuesto de 100 pasos de agente por tarea.

Los conjuntos de datos empleados incluyen harness-hub/scale800-harbor, harness-hub/harness-adapters, harness-hub/termgrade-train-harbor y ai-and/termgrade-environments. El checkpoint publicado corresponde al paso 150, seleccionado según las puntuaciones en SWE-bench Pro y en un subconjunto de 18 tareas de Terminal-Bench 2.1 monitorizadas durante el entrenamiento. La innovación principal no es arquitectónica sino de procedimiento: el ajuste fino con RL contra un arnés concreto reduce drásticamente el número de turnos y de tokens generados necesarios para resolver una tarea, y permite obtener con thinking desactivado un rendimiento comparable al máximo esfuerzo de razonamiento del modelo base. El autor anuncia que publicará la receta completa en un blogpost de lanzamiento.

## Capacidades

- Generación de código y resolución de tareas de ingeniería de software en entornos reales, evaluada en SWE-bench Pro y Terminal-Bench 2.1.
- Ejecución de comandos de terminal y operación de herramientas dentro del arnés OpenCode.
- Uso de tool calling y function calling como parte del bucle de agente.
- Razonamiento multi-paso con planificación y corrección de errores (el ejemplo de la model card muestra cómo escribe un esquema, un validador y sus tests, corrige un error de API y pasa la tarea en 17 llamadas a herramientas).
- Modo thinking opcional heredado del modelo base; en el adaptador no aporta mejoras significativas según el autor.
- Capacidad multimodal image-text-to-text heredada del modelo base, aunque la torre de visión no se sirve en las evaluaciones publicadas.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Agente de programación autónomo en producción: integrado en OpenCode, el adaptador resuelve tareas de modificación de repositorios (añadir paquetes, escribir validadores, corregir APIs) con un presupuesto acotado de pasos, lo que encaja en pipelines de integración continua que lanzan agentes sobre issues etiquetadas.
- Automatización de tareas de terminal y DevOps: al estar entrenado sobre Terminal-Bench 2.1, es adecuado para agentes que inspeccionan sistemas, ejecutan comandos y corrigen configuraciones dentro de contenedores o máquinas virtuales.
- Reducción de coste de inferencia en agentes: al generar 6-8 veces menos tokens por tarea con thinking desactivado, permite desplegar agentes de código con presupuestos de tokens mucho menores manteniendo la tasa de éxito.
- Reparación de errores en bases de código grandes: su capacidad de seguir trazas de dependencias y evitar bucles de repetición de comandos (fallo típico del modelo base en la tarea de ejemplo) lo hace útil para tareas de depuración multi-archivo.
- Generación de tests y validadores: el ejemplo de la model card muestra la creación de un esquema CUE, un validador y sus tests; es un patrón replicable para tareas de aseguramiento de calidad automatizado.
- Investigación en RL para agentes: al publicarse la receta y los datasets asociados, sirve como punto de partida para construir adaptadores propios contra otros arneses (Terminus, Claude Code u otros), según indica el autor.

## Benchmarks y rendimiento

Resultados bajo el arnés OpenCode, un intento por tarea, presupuesto de 100 pasos, thinking desactivado salvo indicación, solo texto, muestreo con temperatura 0,8 y top-p 1,0:

| Benchmark | Qwen3.8-27B | Qwen3.8-27B, thinking | Adaptador | Adaptador, thinking |
|---|---|---|---|---|
| SWE-bench Pro (hard 51) | 35,3 % | 47,1 % | 51,0 % | 54,9 % |
| Terminal-Bench 2.1 | 47,0 % | 55,4 % | 53,0 % | 56,6 % |

Resultados emparejados frente al modelo base (thinking desactivado, mismas tareas):

| Benchmark | Tareas | Base | Adaptador (paso 150) | Diferencia (puntos) | Nuevas resueltas / perdidas |
|---|---|---|---|---|---|
| SWE-bench Pro (hard 51) | 51 | 35,3 % | 51,0 % | +15,7 ± 13,9 | 11 / 3 (p = 0,057) |
| Terminal-Bench 2.1 | 84 | 46,4 % | 52,4 % | +6,0 ± 10,7 | 13 / 8 (p = 0,38) |
| Terminal-Bench 2.1, 66 tareas no usadas para elegir checkpoint | 66 | 45,5 % | 59,1 % | +13,6 ± 11,1 | 12 / 3 (p = 0,035) |

El autor advierte que estas cifras no son comparables con las de la model card de Qwen3.8-27B, que usa otros arneses (Terminus, Claude Code), thinking a máximo esfuerzo y presupuestos mayores.

## Requisitos de hardware

- El adaptador en sí ocupa 0,7 GB, pero requiere cargar el modelo base Qwen3.8-27B completo para inferencia.
- VRAM estimada para el modelo base: no disponible en la información proporcionada; dependerá de la cuantización empleada (existe versión GGUF publicada para despliegue con llama.cpp).
- GPU recomendadas: no disponible. Por el tamaño del modelo base (27B), se requiere hardware de gama alta o cuantización agresiva para GPUs de consumo.
- Despliegue: el autor documenta opciones con vLLM, transformers y llama.cpp, además de una versión GGUF y el procedimiento de fusión del adaptador con PEFT.
- Latencia y throughput: no disponibles. El autor reporta eficiencia en tokens generados (3,5 veces menos en SWE-bench Pro y 2,6 veces menos en Terminal-Bench 2.1 en las tareas que ambos resuelven), pero no cifras de latencia absoluta.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B-opencode-adapted | 27B (base) + LoRA | No disponible | 51,0 % SWE-bench Pro hard 51; 53,0 % Terminal-Bench 2.1 | Apache 2.0 | Hugging Face (PEFT y GGUF) |
| Qwen3.8-27B (base) | 27B | No disponible | 35,3 % SWE-bench Pro hard 51; 47,0 % Terminal-Bench 2.1 (thinking off); 47,1 % y 55,4 % con thinking xhigh | No disponible en la información | Hugging Face |
| Alternativas de la misma categoría | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone en la información proporcionada de otros adaptadores o modelos comparables de la misma categoría (agentes de código sobre arneses concretos) con los que establecer una comparación cuantitativa.

## Limitaciones y advertencias

- El adaptador solo funciona junto con el modelo base Qwen/Qwen3.8-27B; no es un modelo autónomo.
- Los resultados están medidos exclusivamente bajo el arnés OpenCode, con un intento por tarea y 100 pasos de presupuesto; el rendimiento en otros arneses o configuraciones puede diferir.
- El modo thinking no aporta mejoras significativas en el adaptador según el autor; activarlo incrementa el coste de tokens sin ganancia clara.
- La torre de visión no se sirve en las evaluaciones publicadas, por lo que el rendimiento multimodal del adaptador no está validado.
- El checkpoint se eligió usando SWE-bench Pro y un subconjunto de Terminal-Bench 2.1, lo que introduce riesgo de sobreajuste a esos benchmarks; el autor mitiga parcialmente este punto reportando resultados en las 66 tareas no usadas para la selección (p = 0,035).
- La significación estadística en SWE-bench Pro hard 51 es límite (p = 0,057 con 51 tareas), por lo que la mejora debe interpretarse con cautela.
- Sesgos conocidos, riesgo de alucinación y limitaciones idiomáticas: no disponibles en la información proporcionada.
- Licencia Apache 2.0: permite uso comercial, pero debe verificarse la licencia del modelo base Qwen3.8-27B, no indicada en la información disponible.
- El repositorio tiene 578 descargas y 193 likes en el momento de la consulta; es un artefacto reciente (creado el 16 de noviembre de 2026) con validación externa limitada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/harness-hub/Qwen3.8-27B-opencode-adapted
- Versión GGUF: https://huggingface.co/harness-hub/Qwen3.8-27B-opencode-adapted-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Blogpost de lanzamiento (receta completa): https://huggingface.co/blog/harness-adapters-at-scale
- OpenCode: https://opencode.ai
- Dataset SWE-bench Pro hard 51: https://huggingface.co/datasets/harness-hub/swebench-pro-v2-hard51-harbor
- Dataset Terminal-Bench 2.1: https://huggingface.co/datasets/harborframework/terminal-bench-2.1
