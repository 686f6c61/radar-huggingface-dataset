# harness-hub/Qwen3.8-27B-pi-adapted

## Resumen

Qwen3.8-27B-pi-adapted es un adaptador LoRA sobre el modelo multimodal Qwen/Qwen3.8-27B, publicado por harness-hub y entrenado con aprendizaje por refuerzo (GRPO asíncrono vía TRL) para funcionar como el modelo subyacente del agente de programación pi (earendil-works/pi) en tareas de ingeniería de software y terminal. El adaptador no modifica la arquitectura del modelo base: se distribuye como pesos PEFT en safetensors (repo de 0,7 GB) y requiere cargar el modelo base Qwen3.8-27B para su uso.

El objetivo declarado es reducir el coste de inferencia manteniendo la precisión: con el modo thinking desactivado, el adaptador alcanza resultados cercanos a los del modelo base con thinking a máximo esfuerzo (xhigh) en Terminal-Bench 2.1 (56,6% frente a 54,2%) y se queda a 10 puntos en SWE-bench Pro (64,7% frente a 74,5%), generando aproximadamente 4,5 veces menos tokens por tarea. Frente al modelo base sin thinking, las mejoras son de +25,5 puntos en SWE-bench Pro (hard 51) y +16,3 puntos en Terminal-Bench 2.1.

Es relevante ahora porque ejemplifica una línea de trabajo emergente: adaptar mediante RL agentes de código a un harness concreto para obtener la mayor parte del rendimiento del razonamiento extendido a una fracción del coste en tokens. La licencia es Apache 2.0 y el pipeline declarado es image-text-to-text, aunque en la evaluación publicada la torre de visión no se sirve y las pruebas son solo de texto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer multimodal Qwen/Qwen3.8-27B; arquitectura interna del base no detallada en la informacion disponible |
| Parametros totales | No disponible para el adaptador (repo de 0,7 GB); parametros del modelo base no disponibles en la informacion proporcionada |
| Parametros activos | No disponible (no se indica que el modelo base sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponibles en la model card; existe version GGUF publicada en harness-hub/Qwen3.8-27B-pi-adapted-GGUF |
| Idiomas soportados | No disponibles (el campo de idiomas no esta poblado) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); GGUF disponible en repo separado |

## Arquitectura y entrenamiento

El adaptador se construye sobre Qwen/Qwen3.8-27B, un modelo multimodal image-text-to-text, mediante LoRA. El entrenamiento usa aprendizaje por refuerzo con GRPO asíncrono (async-grpo) a través de la librería TRL, con recompensas derivadas de la ejecución de tareas reales en entornos de terminal y repositorios de código (tags harbor y openenv). Los datasets declarados son harness-hub/scale800-harbor, harness-hub/harness-adapters, harness-hub/termgrade-train-harbor y ai-and/termgrade-environments. El checkpoint publicado corresponde al paso 160, seleccionado según las puntuaciones en SWE-bench Pro y en un subconjunto de 18 tareas de Terminal-Bench 2.1 monitorizadas durante el entrenamiento.

La innovación principal no está en la arquitectura sino en el procedimiento: el adaptador se ajusta contra el harness pi concreto (presupuesto de 100 pasos por tarea, muestreo a temperatura 0,8 y top-p 1,0, thinking desactivado salvo que se indique lo contrario) y el resultado es un modelo que resuelve tareas con menos turnos y menos tokens. Según la model card, en las tareas que ambos resuelven el adaptador necesita menos de la mitad de turnos que el modelo base. La receta completa de entrenamiento se anuncia para el blog de lanzamiento del proyecto.

## Capacidades

- Generación de código y edición de repositorios en tareas de ingeniería de software (parches, corrección de funciones, ejecución de tests).
- Operación de terminal: ejecución de comandos, lectura de salidas, iteración sobre errores dentro de un bucle de agente.
- Uso de herramientas (tool calling) en el bucle del agente pi, con llamadas encadenadas y verificación mediante tests.
- Razonamiento multi-paso orientado a agentes: planificación, búsqueda en el código, edición y validación.
- Modo thinking opcional heredado del modelo base; el adaptador rinde también con thinking desactivado, que es su configuración de entrenamiento.
- Capacidad multimodal image-text-to-text declarada en el pipeline, aunque la torre de visión no se sirve en la evaluación publicada.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Reparación automática de bugs en producción: el adaptador localiza la función afectada, aplica el parche y ejecuta la suite de tests en un bucle de hasta 100 pasos, con un coste en tokens aproximadamente 4,5 veces menor que el modelo base en modo thinking.
- Agente de CI/CD para pull requests: integrado en el harness pi, puede resolver tareas de SWE-bench Pro con un 64,7% de éxito sin thinking, lo que lo hace viable para triaje y corrección automática de issues en pipelines.
- Automatización de tareas de administración de sistemas: ejecución y depuración de comandos de terminal con verificación de resultados, adecuado para Terminal-Bench 2.1 (55,8% de éxito en la evaluación pareada).
- Asistente de desarrollo en IDE o CLI: al necesitar menos turnos por tarea resuelta, reduce la latencia percibida y el coste por sesión en herramientas de codificación interactivas.
- Generación de scripts y utilidades de línea de comandos: el entrenamiento sobre entornos de terminal favorece la producción de comandos correctos y su validación inmediata.
- Evaluación y ajuste de harnesses propios: sirve como referencia para construir adaptadores RL sobre otros agentes, ya que la receta se publica y los datasets de entrenamiento están disponibles.
- Despliegue en hardware limitado: la versión GGUF permite ejecutar el modelo cuantizado en llama.cpp o Llama.app en macOS, útil para pruebas locales del agente.

## Benchmarks y rendimiento

Resultados publicados en la model card, bajo el harness pi, un intento por tarea, presupuesto de 100 pasos, solo texto y muestreo a temperatura 0,8 con top-p 1,0. La columna de thinking corresponde al esfuerzo xhigh.

| Benchmark | Qwen3.8-27B | Qwen3.8-27B, xhigh thinking | Qwen3.8-27B-pi-adapted | Qwen3.8-27B-pi-adapted, xhigh thinking |
|---|---|---|---|---|
| SWE-bench Pro (hard 51) | 39,2% | 74,5% | 64,7% | 74,5% |
| Terminal-Bench 2.1 | 41,0% | 54,2% | 56,6% | 56,6% |

Resultados pareados frente al modelo base, thinking desactivado, con intervalos de confianza al 95% y test de signos exacto:

| Benchmark | Tareas | Base | Adaptador (paso 160) | Diferencia (puntos) | Nuevas resueltas / perdidas |
|---|---|---|---|---|---|
| SWE-bench Pro (hard 51) | 51 | 39,2% | 64,7% | +25,5 ± 14,2 | 15 / 2 (p = 0,0023) |
| Terminal-Bench 2.1 | 86 | 39,5% | 55,8% | +16,3 ± 9,1 | 16 / 2 (p = 0,0013) |
| Terminal-Bench 2.1, 68 tareas no usadas para elegir checkpoint | 68 | 39,7% | 55,9% | +16,2 ± 10,6 | 13 / 2 (p = 0,0074) |

Los autores advierten que estas cifras no son comparables con las de la model card de Qwen3.8-27B, que usa otros harnesses (Terminus, Claude Code), thinking a máximo esfuerzo, presupuestos mayores y el SWE-bench Pro completo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; depende del modelo base Qwen3.8-27B y de la cuantización elegida. El adaptador LoRA en sí ocupa 0,7 GB.
- GPU recomendadas: no disponibles en la información proporcionada.
- Viabilidad en GPU de consumo: no confirmada; existe una versión GGUF que sugiere despliegue en hardware más modesto y en macOS mediante Llama.app, pero no se publican requisitos mínimos.
- Opciones de despliegue documentadas: transformers (PEFT), vLLM, llama.cpp, Llama.app y fusión del adaptador con el modelo base mediante PEFT.
- Latencia y throughput: no se publican cifras absolutas; la model card indica aproximadamente 4,5 veces menos tokens generados por tarea y menos de la mitad de turnos que el modelo base en tareas resueltas por ambos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento (SWE-bench Pro hard 51 / Terminal-Bench 2.1) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B-pi-adapted | Adaptador LoRA sobre Qwen3.8-27B | No disponible | 64,7% / 56,6% (sin thinking) | Apache 2.0 | Hugging Face (PEFT y GGUF) |
| Qwen3.8-27B (base) | No disponible | No disponible | 39,2% / 41,0% (sin thinking); 74,5% / 54,2% (xhigh) | No disponible en la información | Hugging Face |
| Alternativas de la misma categoría (otros adaptadores de agente) | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de otros adaptadores comparables en la información proporcionada; la comparación más directa es contra el modelo base bajo el mismo harness.

## Limitaciones y advertencias

- Los resultados están medidos exclusivamente bajo el harness pi con un presupuesto de 100 pasos; el rendimiento puede degradarse con otros agentes, prompts o presupuestos distintos.
- Las cifras no son comparables con las de la model card del modelo base, que emplea otros harnesses y configuraciones.
- La evaluación publicada es solo de texto: la torre de visión no se sirve, por lo que el rendimiento multimodal del adaptador no está validado.
- El checkpoint fue seleccionado usando parte de Terminal-Bench 2.1; la model card reporta resultados en las 68 tareas no usadas para la selección (+16,2 puntos), pero persiste el riesgo de sobreajuste al benchmark.
- No se documentan sesgos conocidos, tasas de alucinación ni comportamiento multilingüe.
- El adaptador requiere el modelo base Qwen3.8-27B; su licencia y condiciones de uso deben verificarse por separado, ya que la información disponible solo confirma Apache 2.0 para el adaptador.
- Al ser un adaptador entrenado con RL sobre entornos de ejecución, puede producir comandos destructivos si se despliega sin sandbox; se recomienda ejecución aislada en producción.
- No se publican requisitos de hardware ni latencias absolutas, lo que dificulta la planificación de capacidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/harness-hub/Qwen3.8-27B-pi-adapted
- Versión GGUF: https://huggingface.co/harness-hub/Qwen3.8-27B-pi-adapted-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Agente pi: https://github.com/earendil-works/pi
- Blog de lanzamiento (receta de entrenamiento): https://huggingface.co/blog/harness-hub/harness-adapters-at-scale
- Dataset SWE-bench Pro hard 51: https://huggingface.co/datasets/harness-hub/swebench-pro-v2-hard51-harbor
- Dataset Terminal-Bench 2.1: https://huggingface.co/datasets/harborframework/terminal-bench-2.1
- Datasets de entrenamiento: https://huggingface.co/datasets/harness-hub/scale800-harbor, https://huggingface.co/datasets/harness-hub/harness-adapters, https://huggingface.co/datasets/harness-hub/termgrade-train-harbor, https://huggingface.co/datasets/ai-and/termgrade-environments
