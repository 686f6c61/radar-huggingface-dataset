# knight7024/act_pick_and_place_hair_roll_fine_tuned

## Resumen

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación que predice secuencias cortas de acciones en lugar de pasos individuales, lo que reduce el error de acumulación y mejora la estabilidad en tareas de manipulación robótica. Este repositorio concreto, `knight7024/act_pick_and_place_hair_roll_fine_tuned`, es una política entrenada con LeRobot 0.7.0 para un robot `so_follower` (SO-100/SO-101 de bajo coste) equipado con dos cámaras: una cenital (`top`) y otra en la muñeca (`wrist`).

El modelo resuelve una tarea muy específica: recoger y colocar un rulo de pelo ("hair roll") en una posición determinada. No es un modelo de lenguaje ni un modelo fundacional de robótica: es una política visomotora de 51,7 millones de parámetros que mapea observaciones (estado articular de 6 dimensiones e imágenes de 240×320) a acciones de 6 dimensiones. Su relevancia es práctica: demuestra el flujo completo de LeRobot para grabar datos con teleoperación, entrenar una política ACT y desplegarla en hardware real de bajo coste.

El modelo se publicó en noviembre de 2026, cuenta con 0 descargas y 0 likes, y no incluye resultados de evaluación en robot real ni información sobre licencia. Es, por tanto, un artefacto de investigación reproducible más que un componente listo para producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con codificador visual y decodificador de acciones |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; política de horizonte de acción fijo) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | safetensors (librería `lerobot`, pipeline `robotics`) |

Especificaciones adicionales relevantes:

| Parametro | Valor |
|---|---|
| Tipo de robot | `so_follower` |
| Cámaras | `top`, `wrist` (3×240×320 cada una) |
| Entrada de estado | `observation.state` de forma (6,) |
| Salida de acción | `action` de forma (6,) |
| Pasos de entrenamiento | 300.000 |
| Batch size | 1 |
| Optimizador | AdamW |
| Learning rate | 1e-5 |
| Semilla | 1000 |
| Versión de LeRobot | 0.7.0 |
| Episodios de entrenamiento | 80 |
| Frames de entrenamiento | 60.498 |
| Frecuencia de datos | 30 FPS |
| Tamaño del repositorio | 0,2 GB |

## Arquitectura y entrenamiento

ACT se basa en un transformer que procesa conjuntamente las observaciones visuales (dos cámaras RGB de 240×320) y el estado propioceptivo del robot (6 dimensiones), y emite un *chunk* de acciones futuras en lugar de una única acción por paso. Esta predicción por bloques mitiga el problema de compounding error típico de las políticas de imitación paso a paso y permite un control más suave. El modelo sigue la formulación del paper arXiv:2304.13705 e incorpora el estilo de entrenamiento y serialización de LeRobot.

El entrenamiento se realizó sobre el dataset `knight7024/pick_and_place_hair_roll_fine_tuned`, compuesto por 80 episodios teleoperados y 60.498 frames a 30 FPS, con dos tareas anotadas: `pick_and_place_hair_roll_final` y `pick_and_place_hair_roll_261116`. La configuración es de ajuste fino conservador: 300.000 pasos con batch size 1 y learning rate 1e-5, lo que sugiere un entrenamiento largo y de baja tasa para estabilizar una política previamente entrenada. No se documenta el uso de RLHF, DPO ni aumentos de datos; el pipeline es de imitación supervisada pura.

## Capacidades

- Control visomotor para manipulación robótica: recoger y colocar un objeto (rulo de pelo) a partir de dos vistas de cámara.
- Predicción de *action chunks*: emite secuencias cortas de acciones de 6 dimensiones, lo que reduce la acumulación de error y suaviza la trayectoria.
- Fusión multimodal de estado y visión: combina `observation.state` (6,) con dos imágenes de 240×320.
- Ejecución en robot real de bajo coste: pensado para la plataforma `so_follower` (familia SO-100/SO-101).
- Integración con el ecosistema LeRobot: compatible con `lerobot-rollout` y `lerobot-train`.
- No soporta tool calling, function calling, agentes multi-paso, razonamiento simbólico ni capacidades multilingües; no es un modelo de lenguaje.
- No dispone de modo de razonamiento explícito (*thinking*), visión general, audio ni generación de texto.

## Casos de uso

- Automatización de una celda de pick-and-place de laboratorio: la política ejecuta la secuencia de recogida y colocación del rulo de pelo sobre el `so_follower`, adecuada para prototipos de investigación en manipulación.
- Reproducción de experimentos de imitación: sirve como referencia entrenada para comparar variantes de ACT, cambios de hiperparámetros o aumentos de datos sobre el mismo dataset.
- Base para *fine-tuning* en una tarea adyacente: al tener 51,7 M de parámetros y pesos safetensors, se puede reentrenar con `lerobot-train` sobre un dataset propio de pocas decenas de episodios.
- Docencia y formación en robótica de bajo coste: el par robot SO + LeRobot + ACT permite ilustrar el ciclo completo teleoperación → dataset → entrenamiento → despliegue con hardware asequible.
- Pruebas de robustez visomotora: útil para medir cómo afectan cambios de iluminación, posición del objeto o distracciones a una política entrenada con 80 episodios.
- Integración en pipelines de evaluación de LeRobot: sirve como política de referencia para validar versiones de la librería (entrenado con 0.7.0) y el comando `lerobot-rollout`.
- Benchmark interno de latencia y throughput en GPUs de consumo: con 51,7 M de parámetros, permite medir el coste de inferencia de ACT en tarjetas como RTX 3060/4090.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente: «No evaluation results have been provided for this policy yet», por lo que no hay tasas de éxito en robot real, ni comparaciones con otras políticas, ni métricas de pérdida de entrenamiento.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja por el tamaño del modelo (51,7 M de parámetros, ~0,2 GB de pesos en safetensors). En FP32 serían ~207 MB solo de pesos; con activaciones y dos flujos de imagen de 240×320, el consumo realista se sitúa en el rango de 1 a 2 GB de VRAM.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente. Una RTX 3060, RTX 4060, RTX 4090 o una A100/H100 funcionan sin problema; las profesionales no aportan ventaja significativa por el reducido tamaño.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU consumer moderna (GTX 1650 en adelante) e incluso en placas integradas con suficiente memoria compartida.
- Opciones de despliegue: `lerobot-rollout` (comando oficial de la model card) sobre el robot `so_follower`; el resto del stack LeRobot para entrenamiento (`lerobot-train`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput estimados: no disponibles. La model card no publica cifras de latencia por paso ni de frecuencia de control efectiva; el dataset está a 30 FPS, pero no se confirma que la política se ejecute a esa tasa.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto / horizonte | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `knight7024/act_pick_and_place_hair_roll_fine_tuned` | ACT (LeRobot) | 51,7 M | chunk de acciones; contexto no aplica | no disponible | Hugging Face, 0 descargas |
| ACT original (paper arXiv:2304.13705) | ACT | no disponible en la información | chunk de acciones | código de referencia público (no verificado aquí) | paper y repo originales |
| Políticas LeRobot oficiales (p. ej. `lerobot/act_*`) | ACT / Diffusion Policy | variable | variable | generalmente Apache-2.0 en repos oficiales (no confirmado para este repo) | Hugging Face |
| Diffusion Policy (paper) | Política de difusión | no disponible en la información | horizonte de acción | no disponible | paper y repo |

La comparación cuantitativa de rendimiento no es posible porque este repositorio no publica evaluaciones. Frente a Diffusion Policy, ACT suele ser más ligera y rápida de entrenar, mientras que Diffusion Policy tiende a modelar distribuciones multimodales de acciones con mayor fidelidad; no obstante, no hay datos de este modelo que permitan confirmarlo.

## Limitaciones y advertencias

- Sin evaluación en robot real: no hay tasas de éxito publicadas, por lo que se desconoce su fiabilidad fuera del conjunto de entrenamiento.
- Dataset muy pequeño: 80 episodios y 60.498 frames son insuficientes para generalizar a cambios de iluminación, posición del objeto, fondo o variaciones del robot.
- Tarea única y específica: entrenado para «pick_and_place_hair_roll»; no es reutilizable directamente para otras tareas sin reentrenamiento.
- Dependencia de hardware concreto: asume un robot `so_follower` con dos cámaras en posiciones `top` y `wrist`; cambiar la configuración invalida la política.
- Licencia no especificada: la model card marca la licencia como «More Information Needed», por lo que no se puede asumir uso comercial.
- Riesgo de sobreajuste: 300.000 pasos con batch size 1 y learning rate 1e-5 sobre 80 episodios sugieren un ajuste fino agresivo sobre pocos datos.
- Sin información sobre sesgos: al no ser un modelo de lenguaje, no aplican sesgos lingüísticos, pero sí sesgos de distribución de datos (posiciones, objetos y condiciones de la celda de entrenamiento).
- Sin garantías de reproducibilidad: no se documentan semillas de evaluación, versiones de CUDA/PyTorch ni el checkpoint exacto utilizado.
- No apto para producción sin validación previa: la ausencia de métricas y de licencia clara desaconseja su uso en entornos comerciales o críticos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/knight7024/act_pick_and_place_hair_roll_fine_tuned
- Dataset de entrenamiento: https://huggingface.co/datasets/knight7024/pick_and_place_hair_roll_fine_tuned
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=knight7024/pick_and_place_hair_roll_fine_tuned
- Paper de ACT: https://huggingface.co/papers/2304.13705 (arXiv:2304.13705)
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rápida de comandos: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference
