# leyholsjAob/Qwen3.8-27B-pi-adapted

## Resumen

Qwen3.8-27B-pi-adapted es un adaptador LoRA (PEFT) sobre el modelo base Qwen/Qwen3.8-27B, desarrollado por el usuario leyholsjAob en el marco del ecosistema harness-hub. Su propósito es convertir el modelo base en el motor de razonamiento del agente de programación pi (de earendil-works), especializándolo en tareas de ingeniería de software y operación de terminal mediante aprendizaje por refuerzo (GRPO asíncrono con TRL). No es un modelo autónomo: requiere cargar el modelo base Qwen3.8-27B y aplicar el adaptador.

La propuesta de valor central del adaptador es la eficiencia: según la model card, con el modo de pensamiento desactivado iguala la precisión del modelo base con pensamiento en su nivel máximo (`xhigh`) en SWE-bench Pro (64,7% frente a 64,7%) y supera ligeramente en Terminal-Bench 2.1 (56,6% frente a 54,2%), generando aproximadamente 4,5 veces menos tokens por tarea. En la comparación por pares bajo el harness pi, el adaptador mejora el modelo base en +25,5 puntos en SWE-bench Pro (hard 51) y +16,3 puntos en Terminal-Bench 2.1.

El modelo se distribuye bajo licencia Apache 2.0, con pesos en formato safetensors (PEFT) y un repositorio de 0,7 GB, lo que corresponde al tamaño del adaptador y no al del modelo base completo. La información disponible no detalla el número de parámetros del adaptador ni su rango LoRA.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer Qwen3.8-27B; pipeline image-text-to-text |
| Parámetros totales | no disponible (adaptador LoRA; el modelo base es Qwen3.8-27B) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (la model card menciona ejecución con llama.cpp y GGUF, sin detallar tipos) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (PEFT/LoRA); existe una versión GGUF publicada aparte |

## Arquitectura y entrenamiento

El adaptador se entrena sobre Qwen/Qwen3.8-27B, un transformer multimodal (pipeline image-text-to-text) del que no se detallan en la información disponible ni el número de parámetros, ni la longitud de contexto, ni la composición de su dataset de preentrenamiento. El adaptador en sí es un LoRA entrenado con TRL usando GRPO (Group Relative Policy Optimization) en su variante asíncrona (`async-grpo`), una técnica de aprendizaje por refuerzo que optimiza directamente la recompensa de la tarea en lugar de imitar trayectorias supervisadas.

El entrenamiento se apoya en cuatro datasets del ecosistema harness-hub: `scale800-harbor`, `harness-adapters`, `termgrade-train-harbor` y `ai-and/termgrade-environments`. El objetivo es que el modelo opere como el backend del agente pi en entornos de terminal y reparación de software. La model card indica que la receta completa se publicará en el blog de harness-hub (`harness-adapters-at-scale`). El checkpoint publicado corresponde al paso 160, seleccionado según las puntuaciones en SWE-bench Pro y en un subconjunto de 18 tareas de Terminal-Bench 2.1 monitorizadas durante el entrenamiento. Un detalle técnico relevante: la torre de visión no se sirve durante la evaluación (evaluación solo texto), pese a que el pipeline declarado es image-text-to-text.

## Capacidades

- Generación de texto y razonamiento orientado a tareas de ingeniería de software: localización de funciones, edición de código y ejecución de tests.
- Uso de herramientas (tool calling) en el bucle del agente pi: búsqueda en el repositorio, ejecución de comandos de terminal, ejecución de tests y corrección iterativa.
- Razonamiento multi-paso y comportamiento agéntico: la model card documenta trayectorias de hasta 100 pasos de agente por tarea.
- Operación de terminal: resolución de tareas de Terminal-Bench 2.1 (comandos, entornos, diagnóstico).
- Modo de pensamiento (thinking mode) del chat template de Qwen, con niveles de esfuerzo de razonamiento; el adaptador está optimizado para funcionar con el pensamiento desactivado.
- Capacidades multilingües: no disponible en la información proporcionada.
- Capacidades de visión: el modelo base es image-text-to-text, pero la torre de visión no se sirve en las evaluaciones del adaptador y no se documenta su comportamiento multimodal tras el ajuste.

## Casos de uso

- Reparación automática de bugs en repositorios: el adaptador está entrenado para localizar la función defectuosa, aplicar la edición y validar con la suite de tests, como muestra la trayectoria de ejemplo sobre `human_to_bytes` en Ansible resuelta en 8 llamadas a herramientas frente al límite de 100 pasos del modelo base.
- Agente de terminal para tareas de administración y diagnóstico: resolución de tareas de Terminal-Bench 2.1 (instalación, configuración, depuración de entornos) con un presupuesto de 100 pasos y una hora por tarea.
- Integración en pipelines de CI/CD como agente de corrección: dado un fallo de test, el modelo puede reproducirlo, inspeccionar el código y proponer un parche, con la ventaja de consumir aproximadamente 4,5 veces menos tokens que el modelo base con razonamiento máximo.
- Asistente de desarrollo dentro del harness pi: despliegue como backend del agente pi para tareas de ingeniería de software interactivas, aprovechando su entrenamiento específico con las herramientas de ese harness.
- Automatización de tareas de mantenimiento de código a gran escala: al necesitar menos turnos (23 frente a 59 de mediana en las tareas resueltas por ambos en SWE-bench Pro), reduce el coste por tarea en flotas de agentes.
- Evaluación y benchmarking de agentes: servir como referencia de adaptador de harness para comparar recetas de RL sobre el mismo modelo base, dado que la receta se publicará abiertamente.
- Despliegue en hardware de consumo: la existencia de una versión GGUF y las instrucciones para llama.cpp y Llama.app permiten ejecutar el modelo fusionado en equipos locales, aunque el rendimiento en ese formato no está documentado.

## Benchmarks y rendimiento

Resultados bajo el harness pi, un intento por tarea, presupuesto de 100 pasos, solo texto, temperatura 0,8 y top-p 1,0. "Thinking" corresponde al modo de pensamiento del chat template en su esfuerzo por defecto (`xhigh`).

| Benchmark | Modelo base | Modelo base, thinking | Este adaptador | Este adaptador, thinking |
|---|---|---|---|---|
| SWE-bench Pro (hard 51) | 39,2% | 64,7% | 64,7% | 66,7% |
| Terminal-Bench 2.1 | 41,0% | 54,2% | 56,6% | 56,6% |

Resultados por pares (thinking desactivado, mismos ajustes para base y adaptador, intervalo de confianza del 95%, test de signos exacto):

| Benchmark | Tareas | Modelo base | Este adaptador (paso 160) | Diferencia (puntos) | Nuevas resueltas / perdidas |
|---|---|---|---|---|---|
| SWE-bench Pro (hard 51) | 51 | 39,2% | 64,7% | +25,5 ± 14,2 | 15 / 2 (p = 0,0023) |
| Terminal-Bench 2.1 | 86 | 39,5% | 55,8% | +16,3 ± 9,1 | 16 / 2 (p = 0,0013) |
| Terminal-Bench 2.1, 68 tareas no usadas para elegir checkpoint | 68 | 39,7% | 55,9% | +16,2 ± 10,6 | 13 / 2 (p = 0,0074) |

Trabajo por tarea resuelta (medianas, adaptador / modelo base, sobre tareas resueltas por ambos):

| Benchmark | Tareas | Turnos | Tokens de contenido | Tokens de razonamiento | Tokens generados |
|---|---|---|---|---|---|
| SWE-bench Pro | 18 | 23 / 59 | 3,5k / 0,6k | 0 / 0 | 6,9k / 9,6k |

La model card advierte de que estos números no son comparables con los de la tarjeta de Qwen3.8-27B, que emplea otros harnesses (Terminus, Claude Code), pensamiento en esfuerzo máximo, presupuestos mayores y el SWE-bench Pro completo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; depende del modelo base Qwen3.8-27B y del grado de cuantización, que no se detalla.
- GPU recomendadas: no disponible. La model card no especifica hardware de referencia para las evaluaciones.
- Ejecución en GPU de consumo: no se documenta. Existe una versión GGUF (`harness-hub/Qwen3.8-27B-pi-adapted-GGUF`) y guías para llama.cpp y Llama.app, lo que sugiere viabilidad en equipos locales con la cuantización adecuada, pero sin cifras publicadas.
- Opciones de despliegue documentadas: transformers, vLLM, llama.cpp, Llama.app (macOS) y fusión del adaptador con PEFT (`merge`).
- Latencia y throughput: no disponibles de forma directa; el dato indirecto es la reducción de tokens generados (aproximadamente 4,5 veces menos por tarea) y de turnos (23 frente a 59 en SWE-bench Pro), que se traduce en menor coste por tarea resuelta.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Rendimiento documentado | Licencia |
|---|---|---|---|---|---|
| Qwen3.8-27B-pi-adapted (este) | LoRA sobre Qwen3.8-27B | no disponible (base 27B) | no disponible | SWE-bench Pro hard 51: 64,7%; Terminal-Bench 2.1: 55,8% (harness pi, thinking off) | Apache 2.0 |
| Qwen3.8-27B (base) | Transformer multimodal | 27B (según nombre) | no disponible | SWE-bench Pro hard 51: 39,2%; Terminal-Bench 2.1: 39,5% (mismos ajustes) | no disponible en la información proporcionada |
| Otros adaptadores de harness de harness-hub | LoRA | no disponible | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de datos de otros modelos comparables de la misma categoría (agentes de código) con los que contrastar parámetros, contexto o rendimiento bajo el mismo harness.

## Limitaciones y advertencias

- Los resultados están medidos exclusivamente bajo el harness pi con ajustes concretos (temperatura 0,8, top-p 1,0, 100 pasos, solo texto); no son extrapolables a otros harnesses o configuraciones de muestreo.
- El adaptador está optimizado para funcionar con el pensamiento desactivado; activarlo no aporta mejoras significativas según la model card (64,7% frente a 66,7% en SWE-bench Pro, idéntico en Terminal-Bench 2.1).
- La torre de visión no se sirve en las evaluaciones y no se documenta su comportamiento multimodal tras el ajuste, pese a que el pipeline declarado es image-text-to-text.
- El checkpoint publicado (paso 160) se seleccionó usando parte de las tareas de Terminal-Bench 2.1; la model card reporta por separado el resultado sobre las 68 tareas no usadas para la selección (+16,2 puntos), lo que mitiga pero no elimina el riesgo de sobreajuste al benchmark.
- No se documentan sesgos conocidos, tasas de alucinación ni comportamiento multilingüe en la información disponible.
- Es un adaptador, no un modelo autónomo: requiere descargar Qwen3.8-27B y fusionarlo o cargarlo con PEFT; el repositorio de 0,7 GB no contiene los pesos completos.
- Licencia Apache 2.0 para el adaptador; las condiciones del modelo base deben consultarse en su propia tarjeta, no disponible en la información proporcionada.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso en producción ni validación independiente por terceros.

## Enlaces

- Hugging Face del adaptador: https://huggingface.co/leyholsjAob/Qwen3.8-27B-pi-adapted
- Modelo base Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Versión GGUF: https://huggingface.co/harness-hub/Qwen3.8-27B-pi-adapted-GGUF
- Blog de la receta (harness-adapters-at-scale): https://huggingface.co/blog/harness-hub/harness-adapters-at-scale
- Repositorio del agente pi: https://github.com/earendil-works/pi
- Dataset SWE-bench Pro hard 51: https://huggingface.co/datasets/harness-hub/swebench-pro-v2-hard51-harbor
- Dataset Terminal-Bench 2.1: https://huggingface.co/datasets/harborframework/terminal-bench-2.1
