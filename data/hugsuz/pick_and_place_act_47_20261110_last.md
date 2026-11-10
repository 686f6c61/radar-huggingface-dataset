# hugsuz/pick_and_place_act_47_20261110_last

## Resumen

`hugsuz/pick_and_place_act_47_20261110_last` es una política de robótica entrenada con ACT (Action Chunking with Transformers), un método de aprendizaje por imitación que predice fragmentos cortos de acciones en lugar de pasos individuales. El modelo lo publica el usuario `hugsuz` y se ha entrenado y subido al Hub mediante la librería LeRobot de Hugging Face. Resuelve una tarea concreta de manipulación robótica: recoger y colocar objetos (`pick_and_place`) con un robot de tipo `omx_follower` equipado con dos cámaras (muñeca y cenital).

La política consume el estado articular (vector de 6 dimensiones) y dos imágenes RGB de 240x320 píxeles, y produce un vector de acción de 6 dimensiones. Con 51.668.614 parámetros y un repositorio de 0,2 GB, es un modelo compacto orientado a inferencia en tiempo real sobre hardware de robótica de sobremesa. Se entrenó con 43 episodios (17.995 fotogramas a 30 FPS) capturados por teleoperación.

Es relevante como ejemplo reproducible de un pipeline completo de imitación en robótica: dataset público, configuración de entrenamiento documentada (1000 pasos, batch 10, AdamW, LR 1e-05) y comandos de despliegue con `lerobot-rollout`. No obstante, es un modelo de nicho, sin métricas de evaluación publicadas ni licencia declarada, por lo que su uso en producción requiere validación propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con codificador visual y decodificador de acciones |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; política de imitación por chunks de acción) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de robótica, no lingüístico) |
| Licencia | no disponible |
| Formato de pesos | safetensors (librería lerobot) |

## Arquitectura y entrenamiento

ACT es un transformer diseñado para aprendizaje por imitación que predice secuencias de acciones (chunks) en lugar de una acción por paso, lo que reduce el error de acumulación y mejora la estabilidad en tareas de manipulación. La política recibe como entrada el estado del robot (6 dimensiones) y dos flujos visuales (`observation.images.wrist` y `observation.images.top`, ambos de 3x240x320) y emite un vector de acción de 6 dimensiones. El modelo se ha entrenado con LeRobot 0.7.1 sobre el dataset `hugsuz/pick_and_place_20261110_172403`, compuesto por 43 episodios, 17.995 fotogramas a 30 FPS y la tarea única `pick_and_place`.

La configuración de entrenamiento documentada es de 1000 pasos con batch size 10, optimizador AdamW, learning rate 1e-05 y semilla 1000. No se especifican en la información disponible detalles sobre aumentos de datos, composición exacta del dataset, ni si se aplicaron técnicas adicionales como RLHF o DPO (no aplicables habitualmente en este tipo de políticas). Tampoco se documentan innovaciones técnicas más allá del propio método ACT publicado en arXiv:2304.13705.

## Capacidades

- Control robótico de manipulación para la tarea `pick_and_place` sobre el robot `omx_follower`.
- Aprendizaje por imitación a partir de datos de teleoperación (43 episodios, 17.995 fotogramas).
- Fusión de estado articular (6 dimensiones) con dos cámaras RGB (muñeca y cenital) a 240x320.
- Predicción de chunks de acción de 6 dimensiones para control continuo.
- Inferencia en tiempo real mediante `lerobot-rollout` con estrategia base.
- Entrenamiento reproducible con `lerobot-train` y el tipo de política `act`.
- No soporta tool calling, agentes, razonamiento multi-paso, capacidades multilingües ni modos de pensamiento: es una política motora específica.

## Casos de uso

- Automatización de pick-and-place en laboratorio: usar la política para recoger y colocar objetos con el robot `omx_follower`, validando primero la tasa de éxito en el entorno real antes de cualquier despliegue.
- Prototipado de pipelines de imitación: servir como referencia reproducible para equipos que quieran entrenar su propia política ACT con LeRobot, partiendo de la configuración documentada (1000 pasos, batch 10, LR 1e-05).
- Investigación en aprendizaje por imitación: comparar el rendimiento de ACT frente a otras políticas (p. ej. Diffusion Policy) sobre el mismo dataset de 43 episodios.
- Docencia y formación en robótica: demostrar el flujo completo grabación de datos, entrenamiento y rollout con comandos `lerobot-*`.
- Benchmark interno de hardware: medir latencia y throughput de una política de ~51,7 M de parámetros en GPUs de consumo o embebidas.
- Base para fine-tuning: reentrenar la política con datos adicionales de la misma tarea para mejorar la robustez ante nuevas posiciones de objetos o iluminación.
- Integración en celdas de manipulación simples: desplegar la política como componente de control en una estación de trabajo con robot de sobremesa, siempre con supervisión humana.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación en robot real (`No evaluation results have been provided for this policy yet`), por lo que no hay tasas de éxito, MMLU, HumanEval ni métricas comparables que reportar.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 51,7 M de parámetros en FP32 el peso ronda los 0,2 GB, por lo que la huella de memoria es muy reducida y el cuello de botella será el procesamiento de las dos imágenes de entrada.
- GPU recomendadas: no especificadas por el autor; por tamaño, cualquier GPU con al menos unos pocos GB de VRAM debería poder alojar los pesos.
- GPU de consumo: previsiblemente cabe en GPUs de consumo (p. ej. RTX 3060 en adelante) e incluso en dispositivos embebidos con suficiente memoria, aunque no hay confirmación oficial.
- Opciones de despliegue: `lerobot-rollout` (estrategia `base`) y `lerobot-train` para reentrenamiento, según la documentación de LeRobot. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a una política robótica).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye comparaciones con otras políticas de imitación (p. ej. Diffusion Policy) ni métricas que permitan establecer una comparativa rigurosa de parámetros, contexto, rendimiento o licencia.

## Limitaciones y advertencias

- No se han publicado resultados de evaluación en robot real; se desconoce la tasa de éxito de la tarea `pick_and_place`.
- La licencia no está declarada (`[More Information Needed]` en la model card), lo que impide confirmar si el uso comercial está permitido.
- El modelo está entrenado para una tarea única (`pick_and_place`) y un robot concreto (`omx_follower`); no generaliza a otras tareas, robots o configuraciones de cámara sin reentrenamiento.
- Solo 43 episodios y 17.995 fotogramas de entrenamiento: dataset pequeño, con riesgo de sobreajuste y baja robustez ante cambios de iluminación, posiciones de objetos o distractores.
- Dependencia de dos cámaras con nombres y resoluciones específicas (`wrist`, `top`, 240x320); un cambio en la configuración de entrada invalida la política.
- Riesgo de alucinación no aplicable en el sentido lingüístico, pero sí de acciones erróneas o inseguras en el robot; se recomienda supervisión humana y parada de emergencia.
- No hay información sobre sesgos, idiomas ni restricciones adicionales más allá de las indicadas.
- Entrenamiento con solo 1000 pasos: puede ser insuficiente para converger en tareas más complejas; conviene validar con el dataset propio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hugsuz/pick_and_place_act_47_20261110_last
- Dataset de entrenamiento: https://huggingface.co/datasets/hugsuz/pick_and_place_20261110_172403
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=hugsuz/pick_and_place_20261110_172403
- Paper de ACT: https://huggingface.co/papers/2304.13705 (arXiv:2304.13705)
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Chuleta de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Repositorio LeRobot: https://github.com/huggingface/lerobot
