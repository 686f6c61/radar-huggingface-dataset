# Ishaan-codes11/smolvla_pick_place_glass_cup_pol

## Resumen

SmolVLA es un modelo compacto de visión-lenguaje-acción (VLA) desarrollado por Hugging Face dentro del ecosistema LeRobot, diseñado para controlar robots manipuladores a partir de observaciones visuales y estado propioceptivo. La ficha que nos ocupa, `Ishaan-codes11/smolvla_pick_place_glass_cup_pol`, es un fine-tuning del modelo base `lerobot/smolvla_base` sobre un dataset propio de 50 episodios y 13.393 fotogramas (30 FPS) para una única tarea: coger un vaso de cristal y colocarlo en una zona roja.

El modelo tiene 450.046.176 parámetros (aproximadamente 450 M) y se distribuye en formato `safetensors` con licencia Apache 2.0. No es un modelo de lenguaje: es una política de imitación que consume tres flujos de imagen (cámara frontal, cámara de muñeca y cámara de polarización) de 480x640 píxeles, más un vector de estado de 6 dimensiones, y emite un vector de acción de 6 dimensiones. Su relevancia radica en que demuestra el flujo completo de fine-tuning de SmolVLA sobre hardware asequible (robot `so_follower`), aunque se trata de una política muy específica y sin evaluación publicada.

Esta ficha describe exclusivamente el checkpoint publicado por Ishaan-codes11, no el modelo base genérico. Cualquier uso fuera de la tarea "Pick up the glass cup and place it in the red area." con el robot `so_follower` y la configuración de cámaras exacta requiere reentrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (SmolVLA), política de imitación basada en transformer con encoder visual y decoder de acciones |
| Parametros totales | 450.046.176 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; consume observaciones por paso, no secuencias de texto) |
| Tipos de cuantizacion | no disponible (el repo solo publica safetensors en precisión de entrenamiento) |
| Idiomas soportados | no disponible (modelo de robótica; las instrucciones de tarea van en inglés en el dataset) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería `lerobot`) |
| Modelo base | lerobot/smolvla_base |
| Tipo de robot | so_follower |
| Cámaras de entrada | front, wrist, polarization (3 x 480 x 640) |
| Dimensión de estado | (6,) |
| Dimensión de acción | (6,) |
| Tamaño del repo | 1.2 GB |

## Arquitectura y entrenamiento

SmolVLA es un modelo VLA compacto que combina un encoder visual (procesa tres cámaras RGB a 480x640) con un backbone de lenguaje preentrenado y un cabezal de acciones que predice vectores de 6 dimensiones. El modelo base se describe en el paper arXiv:2506.01844 como una alternativa eficiente a VLAs de mayor tamaño, pensada para desplegarse en hardware de consumo. La política aquí publicada es un fine-tuning de imitación supervisada sobre `lerobot/smolvla_base`.

El entrenamiento se realizó con LeRobot 0.6.2 durante 30.000 pasos, batch size 8, optimizador AdamW, learning rate 1e-4 y semilla 1000. El dataset contiene 50 episodios y 13.393 fotogramas a 30 FPS de una única tarea de pick-and-place. No se documenta uso de RLHF, DPO ni decodificación especulativa; es imitación conductual pura sobre demostraciones teleoperadas. No se especifica el número de tokens de entrenamiento del modelo base ni la composición de su dataset original.

## Capacidades

- Control robótico de manipulación: genera acciones de 6 dimensiones para el robot `so_follower` a partir de observaciones visuales y de estado.
- Percepción visual multi-cámara: integra simultáneamente cámara frontal, de muñeca y de polarización.
- Ejecución de una tarea concreta de pick-and-place: "Pick up the glass cup and place it in the red area."
- Política de imitación entrenada por comportamiento clonado sobre 50 demostraciones.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni planificación de agentes.
- No es un modelo conversacional ni multilingüe en el sentido de generación de texto.
- No dispone de modo thinking, visión general, audio ni otras capacidades fuera del control motor.

## Casos de uso

- Demostración de fine-tuning de SmolVLA: sirve como ejemplo reproducible de cómo adaptar `lerobot/smolvla_base` a una tarea concreta con LeRobot, usando el comando `lerobot-train` documentado en la model card.
- Automatización de pick-and-place de objetos frágiles en laboratorio: la inclusión de una cámara de polarización sugiere que el autor buscaba robustez frente a reflejos en superficies de cristal, lo que puede interesar en entornos con objetos transparentes.
- Benchmark interno de referencia: al ser una política pequeña (450 M parámetros, 1.2 GB), puede desplegarse en estaciones con GPU de consumo para comparar latencias y tasas de éxito frente a otras políticas.
- Reproducción de experimentos de imitación: el dataset de 50 episodios y 13.393 fotogramas permite estudiar el efecto del número de demostraciones en la generalización de políticas VLA.
- Base para transferencia a tareas similares: puede servir como punto de partida (fine-tuning adicional) para tareas de manipulación con el mismo robot y configuración de cámaras.
- Validación de pipeline LeRobot de extremo a extremo: desde la grabación de datos hasta el rollout con `lerobot-rollout`, útil para equipos que evalúan adoptar el ecosistema.
- Docencia y prototipado en robótica: por su tamaño reducido y licencia permisiva, es adecuado para cursos o pruebas de concepto en manipulación visual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet." No se dispone de tasas de éxito, latencia ni throughput medidos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 450 M parámetros en safetensors (aproximadamente 1,8 GB en fp32 o 0,9 GB en fp16), la huella de pesos es reducida; el consumo adicional depende de los tres flujos de imagen a 480x640 y del backend de LeRobot.
- GPU recomendadas: no especificadas por el autor. Por tamaño, cualquier GPU con al menos 4-8 GB de VRAM debería poder cargar los pesos; se recomienda una RTX 3060/4060 o superior para margen con los buffers visuales.
- Cabe en GPU de consumo: sí, previsiblemente en la mayoría de GPUs consumer modernas, aunque no hay confirmación oficial.
- Opciones de despliegue: LeRobot (`lerobot-rollout`), que es el método documentado en la model card. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de política).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ishaan-codes11/smolvla_pick_place_glass_cup_pol | 450 M | no aplica | Pick-and-place de vaso (so_follower) | Apache 2.0 | Hugging Face |
| lerobot/smolvla_base | no disponible en esta ficha | no aplica | VLA base para fine-tuning | no disponible en esta ficha | Hugging Face |
| Otras políticas VLA (p. ej. OpenVLA, π0) | no disponible en esta ficha | no aplica | Manipulación general | no disponible en esta ficha | no disponible en esta ficha |

No se dispone de datos suficientes en la información proporcionada para comparar rendimiento, tasas de éxito ni latencia con alternativas. La comparativa se limita a la relación de fine-tuning con `lerobot/smolvla_base`.

## Limitaciones y advertencias

- Política de tarea única: solo se ha entrenado para "Pick up the glass cup and place it in the red area." con el robot `so_follower`; no generaliza a otras tareas sin reentrenamiento.
- Sin evaluación publicada: no hay tasas de éxito ni pruebas de robustez, por lo que no puede recomendarse para producción sin validación propia.
- Dataset muy pequeño: 50 episodios y 13.393 fotogramas son insuficientes para garantizar generalización ante cambios de iluminación, posiciones de objetos o distractores.
- Dependencia estricta de la configuración de hardware: requiere las cámaras `front`, `wrist` y `polarization` a 480x640 y 30 FPS, y un robot `so_follower`; cualquier desviación invalida la política.
- Riesgo de sobreajuste a las condiciones de grabación (posición de cámara, mesa, objeto concreto).
- Sin datos sobre sesgos: no se documenta análisis de sesgo, aunque al ser un modelo robótico el riesgo se traslada a fallos físicos (p. ej. rotura del vaso de cristal).
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías; la responsabilidad de validación recae en el integrador.
- Sin información sobre cuantización ni despliegue optimizado: no hay pesos GGUF ni recetas para inferencia de baja latencia.
- Idiomas: la instrucción de tarea está en inglés; no se documenta soporte multilingüe.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Ishaan-codes11/smolvla_pick_place_glass_cup_pol
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/Ishaan-codes11/pick_place_glass_cup_pol_20261115_165211
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=Ishaan-codes11/pick_place_glass_cup_pol_20261115_165211
- Paper de SmolVLA: https://huggingface.co/papers/2506.01844
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de instalación: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
