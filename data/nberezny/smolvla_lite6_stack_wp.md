# nberezny/smolvla_lite6_stack_wp

## Resumen

smolvla_lite6_stack_wp es un modelo de vision-lenguaje-acción (VLA) afinado a partir de lerobot/smolvla_base y publicado por el usuario nberezny. Está entrenado específicamente para controlar un robot Ufactory Lite 6 en simulación (tipo `ufactory_lite6_sim_hybrid_wp`) y ejecutar una única tarea de manipulación: apilar tres bloques en el orden rojo-abajo, amarillo-medio, azul-arriba. El modelo consume el estado articular del robot (vector de 6 dimensiones) y tres cámaras (overhead y wrist, 256x256 píxeles cada una) y produce un vector de acción de 11 dimensiones.

Se trata de una política de imitación (behavior cloning) construida sobre la arquitectura SmolVLA, un modelo VLA compacto diseñado para ejecutarse en hardware de consumo. Con 450 millones de parámetros, se posiciona en la gama baja de cómputo dentro de la robótica basada en aprendizaje, lo que lo hace relevante para prototipado rápido y despliegue en GPUs de gama media.

El modelo es relevante como ejemplo reproducible de fine-tuning de SmolVLA con LeRobot 0.7.0 sobre un dataset propio de 800 episodios y 36.151 fotogramas a 20 FPS. Su licencia Apache 2.0 permite uso comercial, aunque su aplicabilidad está limitada al robot y la tarea concretos para los que fue entrenado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | SmolVLA (vision-language-action, transformer multimodal) |
| Parámetros totales | 450.046.176 |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (modelo de robótica, no conversacional) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Librería | lerobot |
| Modelo base | lerobot/smolvla_base |
| Tipo de robot | ufactory_lite6_sim_hybrid_wp |
| Entradas | observation.state (6,), 3 cámaras visuales (3, 256, 256) |
| Salidas | action (11,) |
| Tamaño del repositorio | 5,4 GB |
| Pipeline | robotics |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura SmolVLA descrita en el paper arXiv:2506.01844, un VLA compacto que combina un codificador visual, un modelo de lenguaje y un cabezal de acciones para generar comandos motores a partir de observaciones multimodales. La política procesa el estado del robot junto con tres flujos de imagen (cámara overhead y cámara de muñeca) y emite directamente un vector de acción de 11 dimensiones, sin pasos intermedios de planificación explícita.

El entrenamiento se realizó mediante fine-tuning del checkpoint lerobot/smolvla_base sobre el dataset nberezny/lite6_stack_wp, compuesto por 800 episodios y 36.151 fotogramas capturados a 20 FPS. La configuración reportada incluye 30.000 pasos de entrenamiento, batch size de 32, optimizador AdamW con learning rate 1e-4 y semilla 1000, usando LeRobot 0.7.0. La tarea única del dataset es "stack the blocks: red at the bottom, yellow, blue on top". No se documenta en la información disponible si hubo RLHF, DPO u otras etapas de alineación, ni detalles sobre la composición exacta del corpus de preentrenamiento del modelo base.

## Capacidades

- Control robótico de manipulación: genera comandos de acción de 11 dimensiones para un brazo Ufactory Lite 6 en simulación.
- Percepción visual multimodal: integra tres cámaras (overhead y wrist) con resolución 256x256.
- Fusión estado-visión: combina el estado articular (6 dimensiones) con las imágenes para producir acciones.
- Ejecución de una tarea específica de apilamiento de bloques en orden predefinido.
- Inferencia en tiempo real a 20 FPS según la frecuencia del dataset de entrenamiento.
- No soporta tool calling ni function calling (no es un modelo de lenguaje conversacional).
- No soporta agentes multi-paso ni razonamiento explícito.
- Capacidades multilingües no aplicables: no procesa texto libre como entrada principal.
- No dispone de modo thinking, visión general, audio ni otras capacidades fuera del dominio robótico.

## Casos de uso

- Apilamiento de bloques en simulación: el modelo ejecuta directamente la tarea "stack the blocks: red at the bottom, yellow, blue on top" sobre el robot Lite 6 simulado, sirviendo como referencia para validar pipelines de imitación en LeRobot.
- Prototipado de políticas VLA: investigadores pueden usar este checkpoint como punto de partida para experimentar con fine-tuning sobre sus propios datasets sin partir del modelo base.
- Evaluación de LeRobot 0.7.0: sirve como caso de prueba reproducible del flujo `lerobot-rollout` y `lerobot-train` con la configuración documentada.
- Benchmark de imitación en robótica de bajo coste: con 450M de parámetros, permite medir el rendimiento de políticas compactas frente a alternativas mayores en tareas de manipulación simples.
- Docencia y formación: ejemplo didáctico completo de un pipeline de behavior cloning desde la captura de datos hasta el despliegue en simulación.
- Base para experimentos de sim-to-real: aunque entrenado en simulación, el checkpoint puede servir como inicialización para adaptaciones posteriores a hardware real del Lite 6.
- Comparación de estrategias de aumento de datos: al tener un dataset bien definido (800 episodios, 36k fotogramas), es útil para estudiar el efecto del volumen de datos en políticas VLA pequeñas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet."

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 450M de parámetros en FP32 se requieren aproximadamente 1,8 GB solo para pesos, más overhead de activaciones y buffers visuales.
- GPU recomendadas: no especificadas por el autor; por tamaño, cabría en GPUs consumer como RTX 3060, RTX 4060 o superiores.
- Cabe en GPU consumer: sí, previsiblemente en cualquier GPU con 6 GB o más de VRAM, aunque no hay confirmación oficial.
- Opciones de despliegue: LeRobot (`lerobot-rollout` con `--policy.path=nberezny/smolvla_lite6_stack_wp`), integración con el robot `ufactory_lite6_sim_hybrid_wp`.
- Latencia y throughput: no disponibles; el dataset se capturó a 20 FPS, lo que sugiere que el modelo está pensado para operar a esa frecuencia, pero no se documenta el rendimiento real de inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| smolvla_lite6_stack_wp | 450M | no disponible | Apilamiento Lite 6 (sim) | Apache 2.0 | Hugging Face |
| lerobot/smolvla_base | no disponible en la información | no disponible | VLA general base | Apache 2.0 | Hugging Face |
| Otros VLA compactos (p. ej. variantes de OpenVLA) | no disponible | no disponible | Manipulación general | no disponible | no disponible |

No se dispone de datos de benchmarks ni de comparativas cuantitativas con alternativas en la información proporcionada.

## Limitaciones y advertencias

- Especialización extrema: el modelo solo ha sido entrenado para una tarea concreta (apilar tres bloques en orden fijo) y un robot concreto (Ufactory Lite 6 en simulación); no generaliza a otras tareas sin reentrenamiento.
- Entrenado en simulación: no hay evidencia de transferencia a hardware real; el sufijo `sim_hybrid_wp` indica entorno simulado.
- Sin evaluación publicada: no existen métricas de éxito reportadas, por lo que se desconoce su fiabilidad real.
- Riesgo de sobreajuste al dataset: con 800 episodios y una sola tarea, es probable que el modelo sea sensible a variaciones de posición, iluminación o distractores no presentes en los datos.
- Sin capacidades de lenguaje: no procesa instrucciones en lenguaje natural más allá de la tarea fija; no es apto para diálogo ni generación de texto.
- Idiomas: no aplicable, al no ser un modelo lingüístico.
- Licencia Apache 2.0: permite uso comercial, pero el usuario debe verificar las licencias del modelo base y del dataset subyacente.
- Sin datos de sesgos: no se documentan sesgos conocidos, aunque al ser un modelo de robótica el riesgo principal es de fallo de ejecución más que de sesgo social.
- Repositorio con 0 descargas y 0 likes: no hay validación comunitaria ni reportes de terceros sobre su funcionamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nberezny/smolvla_lite6_stack_wp
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/nberezny/lite6_stack_wp
- Paper SmolVLA: https://huggingface.co/papers/2506.01844
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentación LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guía de grabación y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=nberezny/lite6_stack_wp
