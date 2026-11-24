# harness-hub/Qwen3.8-27B-pi-adapted

## Resumen

Qwen3.8-27B-pi-adapted es un adaptador LoRA sobre el modelo base Qwen/Qwen3.8-27B, desarrollado por harness-hub y entrenado mediante aprendizaje por refuerzo (GRPO asíncrono con TRL) para funcionar como el modelo subyacente del agente de programación pi en tareas de ingeniería de software y terminal. No es un modelo completo, sino un adaptador PEFT de 0,7 GB que se aplica sobre los pesos del modelo base de 27B parámetros.

El problema que resuelve es concreto: reducir el coste computacional de las tareas agénticas sin sacrificar precisión. Con el modo de razonamiento desactivado, el adaptador iguala al modelo base con razonamiento en su máximo esfuerzo (`xhigh`) en Terminal-Bench 2.1 (56,6% frente a 54,2%) y alcanza 64,7% en SWE-bench Pro frente al 74,5% del base con razonamiento, generando aproximadamente 4,5 veces menos tokens por tarea.

Es relevante ahora porque demuestra que el ajuste fino con RL específico para un harness agéntico concreto puede recuperar la mayor parte de la ganancia del razonamiento extendido a una fracción del coste en tokens, un factor crítico en despliegues de agentes a escala donde el coste por tarea y la latencia determinan la viabilidad económica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer Qwen/Qwen3.8-27B; pipeline image-text-to-text |
| Parametros totales | no disponible (adaptador de 0,7 GB; el base tiene 27B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en la informacion proporcionada; existe version GGUF publicada |
| Idiomas soportados | no disponibles |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT); GGUF disponible en repo separado |

## Arquitectura y entrenamiento

El adaptador se entrena sobre Qwen/Qwen3.8-27B, un transformer multimodal (image-text-to-text) de 27B parámetros, mediante LoRA y aprendizaje por refuerzo con GRPO asíncrono usando la librería TRL. El entrenamiento se realiza contra el harness del agente pi, con presupuesto de 100 pasos por tarea y muestreo a temperatura 0,8 con top-p 1,0. Los datasets empleados son harness-hub/scale800-harbor, harness-hub/harness-adapters, harness-hub/termgrade-train-harbor y ai-and/termgrade-environments. El checkpoint seleccionado es el paso 160, elegido por su rendimiento en SWE-bench Pro y en un subconjunto de 18 tareas de Terminal-Bench 2.1 monitorizado durante el entrenamiento.

La innovación técnica principal es el ajuste por RL orientado a la eficiencia agéntica: el adaptador aprende a resolver tareas con menos turnos y menos tokens generados, en lugar de maximizar únicamente la tasa de acierto. Según la model card, en las tareas que ambos modelos resuelven el adaptador emplea menos de la mitad de los turnos del modelo base. La torre de visión no se sirve durante la evaluación (modo solo texto). La receta completa se publicará en el blog de lanzamiento del autor.

## Capacidades

- Razonamiento agéntico multi-paso orientado a tareas de ingeniería de software y terminal.
- Edición de código y corrección de funciones en repositorios reales (demostrado en tareas de SWE-bench Pro).
- Ejecución de comandos de terminal y uso de herramientas dentro del harness pi.
- Uso eficiente de presupuesto de pasos: resuelve tareas complejas en pocas llamadas a herramientas (ejemplo documentado: 8 llamadas frente al límite de 100 del modelo base).
- Funcionamiento con razonamiento desactivado manteniendo precisión cercana al modo `xhigh`, con aproximadamente 4,5 veces menos tokens generados.
- Capacidad multimodal heredada del base (image-text-to-text), aunque la torre de visión no se sirve en la evaluación publicada.
- Soporte de tool calling implícito a través del harness pi.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Reparación automática de bugs en repositorios de producción: el adaptador localiza la función afectada, aplica la edición, ejecuta las pruebas y corrige los casos fallidos en pocas llamadas a herramientas, lo que lo hace adecuado para pipelines de CI/CD con coste controlado por tarea.
- Agente de terminal autónomo: ejecución de secuencias de comandos de administración, diagnóstico y corrección en entornos Linux con presupuesto acotado de pasos, aprovechando su entrenamiento específico en Terminal-Bench.
- Automatización de tareas de mantenimiento de código a gran escala: al generar 4,5 veces menos tokens por tarea que el base con razonamiento, reduce el coste de ejecutar miles de tareas agénticas en paralelo.
- Integración en el agente pi como modelo por defecto: sustitución directa del base en despliegues existentes del harness, sin cambios de infraestructura, gracias a que es un adaptador PEFT sobre el mismo modelo.
- Evaluación y benchmarking interno de agentes: sirve como referencia de adaptador RL para comparar recetas de entrenamiento agéntico sobre un mismo base.
- Despliegue en hardware limitado: la versión GGUF publicada permite ejecución local en macOS mediante Llama.app y en CPU/GPU de consumo con llama.cpp, útil para prototipado y pruebas offline.
- Tareas de razonamiento con restricción de latencia: cuando el presupuesto de tokens es limitado, el adaptador ofrece precisión cercana al modo de razonamiento máximo sin el coste asociado.

## Benchmarks y rendimiento

Resultados bajo el harness pi, un intento por tarea, presupuesto de 100 pasos, razonamiento desactivado salvo indicación, solo texto, temperatura 0,8 y top-p 1,0. No son comparables con los de la model card de Qwen3.8-27B, que usa otros harnesses y presupuestos.

| Benchmark | Qwen3.8-27B | Qwen3.8-27B `xhigh` | pi-adapted | pi-adapted `xhigh` |
|---|---|---|---|---|
| SWE-bench Pro (hard 51) | 39,2% | 74,5% | 64,7% | 74,5% |
| Terminal-Bench 2.1 | 41,0% | 54,2% | 56,6% | 56,6% |

Resultados emparejados frente al base (razonamiento desactivado, mismas tareas):

| Benchmark | Tareas | Base | pi-adapted (paso 160) | Diferencia (puntos) | Nuevas / perdidas |
|---|---|---|---|---|---|
| SWE-bench Pro (hard 51) | 51 | 39,2% | 64,7% | +25,5 ± 14,2 | 15 / 2 (p = 0,0023) |
| Terminal-Bench 2.1 | 86 | 39,5% | 55,8% | +16,3 ± 9,1 | 16 / 2 (p = 0,0013) |
| Terminal-Bench 2.1 (68 tareas no usadas para elegir checkpoint) | 68 | 39,7% | 55,9% | +16,2 ± 10,6 | 13 / 2 (p = 0,0074) |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. El adaptador pesa 0,7 GB, pero requiere cargar el modelo base Qwen3.8-27B; en FP16 el base necesita aproximadamente 54 GB de VRAM, y en cuantización de 4 bits alrededor de 14-16 GB (estimación estándar para 27B, no confirmada en la model card).
- GPU recomendadas: no especificadas en la información disponible. Por tamaño del base, se requieren A100 80GB o H100 para FP16 sin cuantizar; RTX 4090 (24 GB) solo con cuantización agresiva.
- Cabe en GPU de consumo: probablemente en RTX 4090 y RTX 3090 con cuantización de 4 bits, aunque no está confirmado en la documentación.
- Opciones de despliegue: transformers (con PEFT), vLLM, llama.cpp, Llama.app (macOS) y la versión GGUF publicada.
- Latencia y throughput: no disponibles. La model card destaca que el adaptador genera aproximadamente 4,5 veces menos tokens por tarea que el base con razonamiento, lo que se traduce directamente en menor latencia y coste por tarea.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | SWE-bench Pro (hard 51) | Terminal-Bench 2.1 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Qwen3.8-27B (base) | 27B | no disponible | 39,2% | 41,0% | apache-2.0 | Hugging Face |
| Qwen3.8-27B `xhigh` thinking | 27B | no disponible | 74,5% | 54,2% | apache-2.0 | Hugging Face |
| Qwen3.8-27B-pi-adapted | 27B + LoRA | no disponible | 64,7% | 56,6% | apache-2.0 | Hugging Face |

No se dispone de datos de otros adaptadores agénticos comparables en la información proporcionada.

## Limitaciones y advertencias

- Los resultados están medidos exclusivamente bajo el harness pi, con un intento por tarea y presupuesto de 100 pasos; el rendimiento puede diferir sustancialmente con otros harnesses o configuraciones.
- El adaptador está especializado en tareas de ingeniería de software y terminal; su rendimiento en dominios generales no está documentado y podría degradarse respecto al base.
- La torre de visión no se sirve en la evaluación publicada, por lo que las capacidades multimodales del base no están validadas en este adaptador.
- Riesgo de alucinación: no cuantificado en la información disponible; como adaptador RL sobre un LLM, persiste el riesgo inherente del modelo base.
- Sesgos conocidos: no documentados en la información proporcionada.
- Idiomas soportados: no disponibles; el entrenamiento se centró en tareas técnicas, posiblemente en inglés.
- Licencia apache-2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen3.8-27B.
- El checkpoint (paso 160) se eligió usando un subconjunto de 18 tareas de Terminal-Bench 2.1, lo que introduce un sesgo de selección; los resultados en las 68 tareas restantes confirman la mejora (+16,2 puntos), pero con intervalos más amplios.
- Requiere cargar el modelo base completo de 27B además del adaptador, por lo que el ahorro de espacio del adaptador (0,7 GB) no reduce los requisitos de memoria de inferencia.

## Enlaces

- Adaptador en Hugging Face: https://huggingface.co/harness-hub/Qwen3.8-27B-pi-adapted
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Version GGUF: https://huggingface.co/harness-hub/Qwen3.8-27B-pi-adapted-GGUF
- Blog de lanzamiento (receta completa): https://huggingface.co/blog/harness-adapters-at-scale
- Repositorio del agente pi: https://github.com/earendil-works/pi
- Dataset SWE-bench Pro hard 51: https://huggingface.co/datasets/harness-hub/swebench-pro-v2-hard51-harbor
- Dataset Terminal-Bench 2.1: https://huggingface.co/datasets/harborframework/terminal-bench-2.1
- Dataset de entrenamiento scale800-harbor: https://huggingface.co/datasets/harness-hub/scale800-harbor
- Dataset de adaptadores: https://huggingface.co/datasets/harness-hub/harness-adapters
- Dataset termgrade-train-harbor: https://huggingface.co/datasets/harness-hub/termgrade-train-harbor
- Dataset termgrade-environments: https://huggingface.co/datasets/ai-and/termgrade-environments
