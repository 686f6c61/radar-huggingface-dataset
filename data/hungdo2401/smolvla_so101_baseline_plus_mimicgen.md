# hungdo2401/smolvla_so101_baseline_plus_mimicgen

## Resumen

SmolVLA es un modelo de visión-idioma-acción (VLA) compacto y eficiente, presentado en el paper 2506.01844, diseñado para tareas de manipulación robótica. Este repositorio concreto, `hungdo2401/smolvla_so101_baseline_plus_mimicgen`, es un fine-tuning del modelo base `lerobot/smolvla_base` realizado por el autor `hungdo2401`. El modelo está entrenado para ejecutar la tarea de recoger una lata y colocarla en una papelera, utilizando un robot de tipo `so101_mujoco`. Su relevancia radica en que ofrece un rendimiento competitivo con un coste computacional reducido, lo que permite su despliegue en hardware de consumo. Cuenta con 450.046.176 parámetros y se distribuye en formato safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SmolVLA (vision-language-action) |
| Parametros totales | 450.046.176 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

SmolVLA es un modelo de arquitectura de visión-idioma-acción (VLA), diseñado para procesar entradas multimodales —estado del robot e imágenes de varias cámaras— y generar acciones de control. Este fine-tuning se entrenó con la librería LeRobot en su versión 0.6.2, durante 20.000 pasos, con batch size de 64, optimizador AdamW, learning rate de 0,0001 y semilla 1000. El dataset de entrenamiento, `hungdo2401/so101_baseline_plus_mimicgen`, contiene 150 episodios y 74.586 frames a 20 FPS, todos ellos para la tarea "pick up the can and place it in the bin". No se ha aplicado RLHF ni DPO; se trata de un aprendizaje por imitación supervisado.

## Capacidades

- Genera acciones de control de 6 dimensiones para el robot `so101_mujoco`.
- Entrada multimodal: estado del robot (6 dimensiones) e imágenes de varias cámaras (resoluciones 256x256 y 480x640).
- Fine-tuned para una tarea específica de pick-and-place: recoger una lata y colocarla en una papelera.
- Modelo compacto y eficiente, desplegable en hardware de consumo.
- No soporta tool calling, agentes ni razonamiento multi-paso; es un modelo de políticas robóticas, no un LLM de propósito general.

## Casos de uso

1. **Investigación en aprendizaje por imitación:** permite estudiar políticas VLA compactas y compararlas con otros modelos en el entorno simulado `so101_mujoco`.
2. **Fine-tuning para nuevas tareas:** se puede partir de este modelo y entrenarlo con datasets propios para adaptarlo a otras tareas de manipulación robótica.
3. **Evaluación de políticas en simulación:** se puede utilizar con `lerobot-rollout` para ejecutar la política y medir la tasa de éxito en la tarea objetivo.
4. **Despliegue en hardware de consumo:** gracias a su tamaño compacto, puede ejecutarse en GPUs de gama media, facilitando la experimentación local.
5. **Generación de demostraciones:** el modelo puede usarse para generar trayectorias de demostración que sirvan como datos de entrenamiento para otros sistemas robóticos.
6. **Comparación de estrategias de entrenamiento:** permite evaluar el impacto de incluir datos de mimicgen (el "plus" del nombre) frente a un baseline sin esos datos, al existir el modelo `hungdo2401/smolvla_so101_baseline`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica: "No evaluation results have been provided for this policy yet."

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible, aunque el modelo está descrito como desplegable en hardware de consumo.
- Opciones de despliegue: se utiliza con la librería LeRobot, mediante los comandos `lerobot-rollout` y `lerobot-train`.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se dispone de resultados de benchmarks que permitan comparar este modelo con alternativas de forma cuantitativa. El modelo base es `lerobot/smolvla_base`, y existe otro fine-tuning `hungdo2401/smolvla_so101_baseline` sin datos de mimicgen, pero no se han publicado métricas comparativas.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| smolvla_so101_baseline_plus_mimicgen | 450.046.176 | no disponible | no disponible | Apache-2.0 | HuggingFace |
| lerobot/smolvla_base | no disponible | no disponible | no disponible | Apache-2.0 | HuggingFace |
| smolvla_so101_baseline | no disponible | no disponible | no disponible | Apache-2.0 | HuggingFace |

## Limitaciones y advertencias

- No hay resultados de evaluación publicados, por lo que el rendimiento real en el robot es desconocido.
- El modelo está entrenado para una tarea concreta (recoger una lata y colocarla en una papelera) y para un robot específico (`so101_mujoco`), lo que limita su generalización a otros robots o tareas.
- Los datos provienen del dataset `so101_baseline_plus_mimicgen`, que puede no transferirse bien a entornos físicos reales.
- No aplica riesgo de alucinación en el sentido de generación de texto, pero sí puede cometer errores de control que resulten en trayectorias fallidas.
- La licencia Apache-2.0 permite el uso comercial, siempre que se cumplan los términos establecidos.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/hungdo2401/smolvla_so101_baseline_plus_mimicgen
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset: https://huggingface.co/datasets/hungdo2401/so101_baseline_plus_mimicgen
- Paper SmolVLA: https://huggingface.co/papers/2506.01844
- Guía LeRobot SmolVLA: https://huggingface.co/docs/lerobot/main/en/smolvla
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Visualización del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=hungdo2401/so101_baseline_plus_mimicgen
