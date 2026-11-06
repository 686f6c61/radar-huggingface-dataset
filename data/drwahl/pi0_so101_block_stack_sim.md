# drwahl/pi0_so101_block_stack_sim

## Resumen

pi0_so101_block_stack_sim es un ajuste fino del modelo fundacional de robótica lerobot/pi0_base, desarrollado por el usuario drwahl, para una tarea concreta de manipulación: apilar un bloque de 30 mm sobre otro con un brazo robótico SO-101 en simulación. El modelo parte de la arquitectura pi0, un vision-language-action (VLA) construido sobre un backbone lingüístico Gemma 2B y un codificador visual SigLIP, y se adapta mediante LoRA (r=32, alpha 64) sobre dicho backbone, manteniendo densos el experto de acciones y las cabezas de proyección.

El modelo resuelve el problema de transferir un modelo generalista de robótica a una tarea específica con recursos de entrenamiento limitados: 20.000 pasos con batch 4 sobre el dataset drwahl/so101_block_stack_sim. Es relevante porque demuestra el flujo completo de ajuste de un VLA open source con LeRobot, incluyendo la distribución del adaptador junto con los procesadores que gestionan la normalización y el renombrado de cámaras.

La evaluación se realiza sobre 150 layouts retenidos, con métricas de apilado y levantamiento. El repositorio ocupa 0,8 GB y se distribuye en formato safetensors, con licencia gemma heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) pi0: backbone Gemma 2B + codificador visual SigLIP + experto de acciones |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | gemma |
| Formato de pesos | safetensors (adaptador LoRA + procesadores) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA aplicado sobre lerobot/pi0_base. La arquitectura subyacente pi0 combina un backbone lingüístico Gemma 2B, un codificador visual SigLIP congelado durante el ajuste y un experto de acciones con cabezas de proyección que se mantienen densas. El adaptador LoRA usa r=32 y alpha 64, y se distribuye junto con los procesadores necesarios para la normalización y el renombrado de cámaras; LeRobot lo carga sobre los pesos base.

El entrenamiento se realizó durante 20.000 pasos con batch 4, usando la configuración train/pi0_so101.yaml del repositorio vla-test y el dataset drwahl/so101_block_stack_sim. La normalización, la tasa de aprendizaje y la longitud de chunk son las del checkpoint base. El protocolo de entrenamiento replica el empleado en drwahl/pi05_so101_block_stack_sim. No se especifican en la información disponible el número total de tokens, la composición del dataset ni si hubo RLHF o DPO.

## Capacidades

- Control robótico de manipulación: apilado de un bloque de 30 mm sobre otro con un brazo SO-101 en simulación.
- Generación de acciones motoras a partir de observaciones visuales y del estado del robot (política VLA).
- Ejecución por chunks de 50 pasos, con evaluación específica a horizontes de 10 y 20 pasos.
- Levantamiento y colocación de objetos (métricas de lift y stack reportadas).
- Integración con LeRobot para carga del adaptador sobre los pesos base.
- No se documentan en la información disponible capacidades de tool calling, agentes multi-paso, multilingüismo ni modos de razonamiento.

## Casos de uso

- Investigación en aprendizaje por imitación para robótica: el modelo sirve como punto de partida reproducible para experimentar con ajuste LoRA de un VLA sobre tareas de manipulación concretas, usando el pipeline de vla-test.
- Evaluación de políticas VLA en simulación: permite medir tasas de éxito de apilado y levantamiento sobre 150 layouts retenidos, con protocolos de ejecución por chunks configurables.
- Benchmark de técnicas de ejecución de chunks: la model card reporta diferencias entre ejecutar 10 de 50 pasos, el chunk completo o 20 pasos, lo que permite estudiar el efecto del stitching y del horizonte de ejecución.
- Formación y docencia en robótica open source: al estar construido sobre LeRobot y SO-101, sirve para demostrar el ciclo completo de descarga, carga del adaptador y evaluación de una política entrenada.
- Prototipado de tareas de pick-and-place: la capacidad de levantar y apilar bloques es transferible como base para experimentos de ensamblaje simple en entornos simulados.
- Comparación de variantes de ajuste: al compartir protocolo con drwahl/pi05_so101_block_stack_sim, permite comparar el comportamiento de pi0 frente a pi0.5 en la misma tarea y dataset.

## Benchmarks y rendimiento

Resultados reportados en la model card sobre 150 layouts retenidos, ejecutando 10 pasos de cada chunk de 50 (configuración con --horizon 10), promediados sobre tres semillas adicionales:

| Metrica | Resultado |
|---|---|
| Apilados (stack) | 114,7 de 150 |
| Levantados (lift) | 132,7 de 150 |
| Apilados ejecutando el chunk completo | 48,7 de 150 |
| Apilados a 20 pasos (stitching) | penalización de 20 layouts |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; el repositorio del adaptador ocupa 0,8 GB, pero requiere cargar los pesos base de lerobot/pi0_base.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: LeRobot (carga del adaptador sobre los pesos base) y el script de evaluación sim/scripts/eval.py del repositorio vla-test, ejecutable con uv.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Base | Tarea | Metodo de ajuste | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| drwahl/pi0_so101_block_stack_sim | lerobot/pi0_base | Apilado de bloques con SO-101 en simulación | LoRA r=32, alpha 64, 20k pasos, batch 4 | gemma | Hugging Face |
| drwahl/pi05_so101_block_stack_sim | pi0.5 | Apilado de bloques con SO-101 en simulación | Protocolo de referencia del anterior | no disponible | Hugging Face |
| lerobot/pi0_base | — | Modelo fundacional VLA generalista | — | no disponible | Hugging Face |

No se dispone de datos de rendimiento de los modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente para una tarea muy concreta (apilar un bloque de 30 mm sobre otro) y en simulación; no se ha validado en un robot físico.
- El rendimiento depende fuertemente del horizonte de ejecución: ejecutar el chunk completo reduce los apilados a 48,7 de 150 frente a 114,7 con 10 pasos, y el stitching a 20 pasos penaliza 20 layouts.
- Los resultados reportados son promedios sobre semillas y layouts específicos; no hay garantía de generalización a otras condiciones de iluminación, cámaras o geometrías.
- La licencia es gemma, heredada del modelo base; deben revisarse los términos de dicha licencia para uso comercial.
- No se documentan sesgos, riesgos de alucinación ni limitaciones idiomáticas, dado que el modelo no es de propósito lingüístico general.
- El adaptador requiere los pesos base de lerobot/pi0_base y los procesadores incluidos en adapter/ para funcionar correctamente; cargarlo de forma aislada no es suficiente.
- No hay información sobre latencia, throughput ni requisitos de VRAM, lo que dificulta planificar un despliegue en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/drwahl/pi0_so101_block_stack_sim
- Modelo base: https://huggingface.co/lerobot/pi0_base
- Dataset de entrenamiento: https://huggingface.co/datasets/drwahl/so101_block_stack_sim
- Modelo comparable (pi0.5): https://huggingface.co/drwahl/pi05_so101_block_stack_sim
- Repositorio de entrenamiento y evaluación: https://github.com/danwahl/vla-test
- Repositorio del brazo SO-101: https://github.com/TheRobotStudio/SO-ARM100
