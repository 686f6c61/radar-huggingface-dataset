# heohyeri/act_policy

## Resumen

`heohyeri/act_policy` es una política de aprendizaje por imitación basada en Action Chunking with Transformers (ACT), publicada en Hugging Face Hub mediante la librería LeRobot. El modelo no es un LLM ni un modelo generativo de texto: es una política visomotora que, a partir de una imagen de cámara de muñeca y del estado de las articulaciones del robot, predice directamente acciones de control. Está entrenada para una única tarea concreta: coger un cubo y colocarlo en una posición objetivo ("Pick up the cube and place it on the place").

El autor es `heohyeri`, un usuario individual sin organización asociada, y el modelo se distribuye con licencia Apache 2.0. Cuenta con 51.670.663 parámetros en formato safetensors y un tamaño de repositorio de 0,2 GB. Está diseñado para el robot `so102_follower` (variante del SO-100/SO-101 de bajo coste) con una sola cámara (`cam_wrist`), y se entrenó sobre el dataset `heohyeri/pick_cube` con 36 episodios y 15.609 fotogramas a 30 FPS.

Su relevancia es acotada pero clara: sirve como ejemplo reproducible de un pipeline completo de imitación en robótica de bajo coste con LeRobot 0.6.0, útil para desarrolladores que quieran replicar el flujo (grabar datos, entrenar ACT, desplegar con `lerobot-rollout`) antes de escalar a tareas propias. No es un modelo de propósito general ni apto para producción fuera de su tarea y hardware específicos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con codificador visual y decodificador de acciones con chunking |
| Parametros totales | 51.670.663 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; política de control por pasos, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (pesos safetensors en precisión de entrenamiento; no se documentan variantes GGUF/INT8) |
| Idiomas soportados | no disponible (no procesa lenguaje; la tarea se especifica como cadena de texto en la CLI) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería LeRobot) |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que predice *chunks* de acciones (secuencias cortas de comandos) en lugar de pasos individuales, lo que reduce el error de acumulación y mejora la estabilidad del control. La arquitectura combina un codificador visual (procesa la imagen de `cam_wrist` de 3×480×640), un codificador del estado de las articulaciones (vector de 7 dimensiones) y un decodificador transformer que emite el vector de acción de 7 dimensiones. El modelo sigue el paper arXiv:2304.13705.

El entrenamiento se realizó con LeRobot 0.6.0 sobre 36 episodios (15.609 fotogramas a 30 FPS) del dataset `heohyeri/pick_cube`, con 30.000 pasos, batch size 8, optimizador AdamW, learning rate 1e-05 y semilla 1000. No se documenta composición adicional del dataset, aumento de datos, RLHF/DPO ni técnicas de decodificación especulativa; al tratarse de imitación supervisada, no aplican. La innovación relevante es el propio *action chunking* de ACT y el uso de una única cámara de muñeca, que simplifica el montaje hardware.

## Capacidades

- Control visomotor de un robot `so102_follower` a partir de una imagen de muñeca y del estado articular (7 dimensiones).
- Predicción de chunks de acciones de 7 dimensiones para la tarea "Pick up the cube and place it on the place".
- Aprendizaje por imitación a partir de datos teleoperados; no requiere modelado explícito del entorno.
- Ejecución en bucle cerrado mediante `lerobot-rollout` con estrategia `base`.
- No soporta tool calling, function calling, agentes multi-paso, razonamiento simbólico ni capacidades multilingües.
- No dispone de modo *thinking*, visión general, audio ni generación de texto.
- Reentrenable con `lerobot-train` sobre datasets propios en el mismo formato.

## Casos de uso

- Replicación de un pipeline completo de imitación: grabar episodios con un SO-102, entrenar ACT con `lerobot-train` y desplegar con `lerobot-rollout`, usando esta política como referencia funcional.
- *Pick-and-place* de laboratorio: ejecutar la tarea de coger un cubo y depositarlo en una posición fija como banco de pruebas para calibrar cámaras, puertos y frecuencias antes de tareas más complejas.
- Docencia y formación: ilustrar en un curso de robótica el flujo datos → entrenamiento → despliegue con un modelo pequeño (51,7 M de parámetros, 0,2 GB) que cabe en cualquier GPU consumer.
- Base para *fine-tuning*: partir de estos pesos y reentrenar sobre un dataset propio con variaciones de posición, iluminación u objetos, aprovechando que la licencia Apache 2.0 permite uso comercial.
- Validación de hardware de bajo coste: comprobar el comportamiento de un brazo SO-102 con una sola cámara de muñeca antes de invertir en sensórica adicional.
- Generación de datos sintéticos de evaluación: usar la política como *baseline* para comparar con otras arquitecturas (Diffusion Policy, VQ-BeT) sobre el mismo dataset `pick_cube`.
- Demostración de integración con LeRobot Hub: ejemplo mínimo de política publicada y consumible vía `--policy.path=heohyeri/act_policy`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye una sección de evaluación vacía con la nota explícita: "No evaluation results have been provided for this policy yet." No se dispone de tasas de éxito, número de ensayos ni métricas de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 51,7 M de parámetros en safetensors (≈0,2 GB en FP32), la huella en memoria es inferior a 1 GB, pero no se documenta la precisión exacta de los pesos ni el *overhead* del codificador visual.
- GPU recomendadas: no especificadas por el autor. Por tamaño, cualquier GPU con al menos 2-4 GB de VRAM debería ser suficiente; se recomienda CUDA por el flag `--policy.device=cuda` del ejemplo de entrenamiento.
- Cabe en GPU consumer: sí, previsiblemente en GTX 1650/RTX 3050 o superiores; no confirmado por el autor.
- Opciones de despliegue: LeRobot (`lerobot-rollout` para inferencia, `lerobot-train` para reentrenamiento). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de política).
- Latencia y throughput: no disponibles. El control opera a 30 FPS según la frecuencia del dataset, pero no se publican medidas reales de latencia por paso.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| heohyeri/act_policy | 51,7 M | no aplica | Pick-and-place con SO-102 y cámara de muñeca | Apache 2.0 | Hugging Face Hub (LeRobot) |
| ACT (paper original, arXiv:2304.13705) | no disponible en la información | no aplica | Manipulación bimanual (ALOHA) | no disponible en la información | Paper y código de referencia |
| Diffusion Policy | no disponible en la información | no aplica | Políticas visomotoras por difusión | no disponible en la información | Implementaciones en LeRobot y otros repos |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada; la comparación se limita a categoría, tarea y licencia.

## Limitaciones y advertencias

- Entrenada para una única tarea ("Pick up the cube and place it on the place") y un único robot (`so102_follower`); no generaliza a otras tareas sin reentrenamiento.
- Requiere que los nombres y la configuración de las cámaras coincidan exactamente con las claves de observación del entrenamiento (`observation.images.cam_wrist`); cualquier cambio de montaje invalida la política.
- Dataset muy reducido (36 episodios), lo que limita la robustez frente a variaciones de posición, iluminación, objetos o distracciones.
- Sin resultados de evaluación publicados: no hay evidencia cuantitativa de tasa de éxito.
- Riesgo de sobreajuste al entorno de grabación y de fallos silenciosos en producción; se recomienda validación exhaustiva en banco antes de cualquier despliegue.
- No procesa lenguaje natural; el parámetro `--task` es una etiqueta, no una instrucción interpretada semánticamente.
- Sesgos conocidos: no documentados por el autor; en robótica de imitación son habituales los sesgos hacia las trayectorias y posiciones presentes en los datos de teleoperación.
- Licencia Apache 2.0: permite uso comercial y modificación, pero no hay garantías del autor; conviene revisar la ausencia de cláusulas adicionales en el repo.
- Sin información sobre latencia, precisión numérica de los pesos ni requisitos mínimos de software (versión de LeRobot, CUDA, drivers).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/heohyeri/act_policy
- Dataset de entrenamiento: https://huggingface.co/datasets/heohyeri/pick_cube
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rápida de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=heohyeri/pick_cube
