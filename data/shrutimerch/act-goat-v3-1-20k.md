# shrutimerch/act-goat-v3.1-20k

## Resumen

`act-goat-v3.1-20k` es una política de imitación para robótica basada en el método Action Chunking with Transformers (ACT), publicada por el usuario `shrutimerch` en Hugging Face. No es un modelo de lenguaje: es un checkpoint de control motor entrenado con la librería LeRobot de Hugging Face para ejecutar una tarea física concreta, "coger la cabra y colocarla en el cubo", sobre un robot de tipo `so_follower` (SO-100/SO-101 de bajo coste). El modelo predice directamente vectores de acción de 6 dimensiones a partir del estado articular y de dos cámaras.

El checkpoint tiene 51.668.614 parámetros en formato safetensors (0,2 GB de repositorio) y se entrenó durante 20.000 pasos con un batch de 8 y una tasa de aprendizaje de 1e-5 sobre un dataset propio de 46 episodios y 26.023 fotogramas a 30 FPS. La arquitectura sigue el paper ACT (arXiv:2304.13705), que combina un transformer con un cuello de botella VAE y decodificación de chunks de acciones para reducir el error de composición que aparece en políticas de imitación paso a paso.

Su relevancia es acotada pero representativa: muestra el flujo completo de LeRobot para grabar teleoperación, entrenar una política y desplegarla en hardware asequible. No sirve como modelo general ni como base para otras tareas; es un artefacto específico de una tarea, con licencia Apache 2.0 y sin resultados de evaluación publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers): transformer con cuello de botella VAE y decodificador de chunks de acciones |
| Parametros totales | 51.668.614 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de contexto textual; consume observaciones por paso) |
| Tipos de cuantizacion | no disponible (checkpoint safetensors en precisión de entrenamiento) |
| Idiomas soportados | no disponible (modelo de robótica, sin interfaz de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería LeRobot) |

## Arquitectura y entrenamiento

ACT aprende una política de imitación que, en lugar de predecir una única acción por paso, predice un chunk de acciones futuras y las ejecuta de forma agregada. El modelo combina un codificador de observaciones (estado articular de 6 dimensiones más dos flujos visuales: cámara de muñeca a 480x640 y cámara exocéntrica a 720x1280), un transformer que modela la secuencia de observaciones y un decodificador de acciones de 6 dimensiones. El paper original incorpora un VAE con cuello de botella para capturar la variabilidad de las demostraciones humanas y un mecanismo de agregación temporal de chunks que suaviza la ejecución.

El entrenamiento se realizó con LeRobot 0.6.1 sobre el dataset `shrutimerch/v3.1-goat-pickup`: 46 episodios teleoperados, 26.023 fotogramas a 30 FPS, una única tarea ("Pick up the goat and place it in the bucket"). Configuración: 20.000 pasos, batch de 8, optimizador AdamW, learning rate 1e-5 y semilla 1000. No se documenta aumento de datos, RLHF, DPO ni ninguna innovación adicional más allá del método ACT original.

## Capacidades

- Control motor de imitación para una tarea física concreta: coger un objeto ("cabra") y depositarlo en un cubo.
- Entrada multimodal: estado articular de 6 dimensiones y dos cámaras RGB (muñeca y exocéntrica).
- Salida de acciones continuas de 6 dimensiones por paso, ejecutadas en chunks.
- Funcionamiento en tiempo real a 30 FPS sobre el robot `so_follower`.
- Integración nativa con el ecosistema LeRobot (`lerobot-rollout`, `lerobot-train`).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües.
- No dispone de modo thinking, visión general, audio ni generación de texto.

## Casos de uso

- Automatización de pick-and-place en laboratorio: el modelo ejecuta la secuencia completa de agarre y deposición sobre el robot SO-100/SO-101, adecuado para prototipos de manipulación de bajo coste.
- Docencia e investigación en imitación: sirve como ejemplo reproducible del pipeline LeRobot (grabación, entrenamiento, despliegue) con un dataset pequeño y una configuración documentada.
- Benchmark interno de hardware asequible: permite medir latencia y éxito de una política ACT en GPUs de consumo frente a configuraciones de servidor.
- Base para fine-tuning en tareas similares: al estar en formato LeRobot y con licencia Apache 2.0, se puede reentrenar con nuevos datasets de pick-and-place.
- Pruebas de robustez visual: al usar dos cámaras con resoluciones distintas, permite estudiar el impacto de la vista exocéntrica frente a la de muñeca en el éxito de la tarea.
- Validación de despliegue en tiempo real: con `lerobot-rollout --strategy.type=base` se puede ejecutar de forma indefinida para pruebas de estabilidad del controlador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación en robot real para esta política.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 51,7 M de parámetros y dos flujos de imagen, el checkpoint en precisión de entrenamiento ocupa del orden de 0,2 GB, por lo que la inferencia cabe holgadamente en GPUs de consumo.
- GPU recomendadas: cualquier GPU NVIDIA con al menos 4 GB de VRAM es suficiente en la práctica; se desconoce la recomendación oficial del autor.
- Cabe en GPU de consumo: sí, previsiblemente en GTX 1650, RTX 3050, RTX 4060 y superiores; no confirmado por el autor.
- Opciones de despliegue: LeRobot (`lerobot-rollout`, `lerobot-train`); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles; el sistema opera a 30 FPS según la tasa del dataset, pero no se publican medidas de latencia por paso.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| act-goat-v3.1-20k | 51,7 M | no aplica | Pick-and-place con SO-100 | Apache 2.0 | Hugging Face |
| Políticas ACT de referencia en LeRobot | no disponible | no aplica | Tareas diversas de imitación | Apache 2.0 | Hugging Face / LeRobot |
| Diffusion Policy (paper) | no disponible | no aplica | Imitación visomotora | según implementación | Repositorios de investigación |

No se dispone de datos comparativos de rendimiento entre estas alternativas en la información proporcionada. La comparación se limita a categoría, licencia y disponibilidad.

## Limitaciones y advertencias

- Modelo específico de una única tarea: no generaliza a otros objetos, entornos ni robots distintos del `so_follower` con la misma configuración de cámaras.
- Sin resultados de evaluación publicados: se desconoce la tasa de éxito real en robot.
- Dataset muy pequeño (46 episodios, 26.023 fotogramas): alta probabilidad de sobreajuste a posiciones, iluminación y disposición concretas del montaje de grabación.
- Sensible a cambios en la cámara de muñeca y exocéntrica: las claves de observación deben coincidir exactamente con las del entrenamiento.
- No es un modelo de lenguaje: no admite prompts textuales, tool calling ni razonamiento; la única instrucción es la tarea fija.
- Riesgo de alucinación no aplica en el sentido habitual, pero sí de acciones erráticas fuera de distribución.
- Licencia Apache 2.0 permite uso comercial, pero el usuario asume la responsabilidad de validar la seguridad física del despliegue.
- Sin garantías del autor sobre robustez, seguridad ni mantenimiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/shrutimerch/act-goat-v3.1-20k
- Dataset de entrenamiento: https://huggingface.co/datasets/shrutimerch/v3.1-goat-pickup
- Paper ACT: https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía ACT de LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia: https://huggingface.co/docs/lerobot/main/en/inference
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=shrutimerch/v3.1-goat-pickup
