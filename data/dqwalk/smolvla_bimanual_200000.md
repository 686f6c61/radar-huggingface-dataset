# DQwalk/smolvla_bimanual_200000

## Resumen

SmolVLA es un modelo compacto de visión-lenguaje-acción (VLA) desarrollado por Hugging Face dentro del ecosistema LeRobot, diseñado para controlar robots manipuladores a partir de observaciones visuales e instrucciones en lenguaje natural. La versión aquí descrita, `DQwalk/smolvla_bimanual_200000`, es un ajuste fino del checkpoint base `lerobot/smolvla_base` realizado por el usuario DQwalk para una tarea concreta de manipulación bimanual: la transferencia de bloques entre dos brazos robóticos.

El modelo resuelve el problema de la política de imitación visomotora en robótica de bajo coste: dado un estado articular de 12 dimensiones y tres cámaras RGB (480x640), predice una acción de 12 dimensiones a partir de una instrucción textual. Con 450 millones de parámetros y pesos en safetensors, está pensado para ejecutarse en hardware de consumo, lo que lo hace accesible para laboratorios y desarrolladores que no disponen de clústeres de GPU.

La relevancia actual radica en su carácter abierto (licencia Apache 2.0) y en su integración con LeRobot, que estandariza el entrenamiento, la evaluación y el despliegue de políticas robóticas. Este ajuste concreto se entrenó sobre un dataset local de 20 episodios y 8.675 fotogramas a 15 FPS, con 200.000 pasos de entrenamiento, para la plataforma `bi_so_follower` con tres cámaras.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) compacta, basada en SmolVLA |
| Parametros totales | 450.046.176 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (las instrucciones de tarea estan en ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria `lerobot`) |

## Arquitectura y entrenamiento

SmolVLA es una arquitectura VLA compacta que combina un codificador visual, un codificador de lenguaje y un cabezal de acciones, siguiendo el diseño descrito en el paper arXiv:2506.01844. El modelo consume tres flujos de imagen RGB de 480x640 y un vector de estado de 12 dimensiones, y produce un vector de acción de 12 dimensiones. La model card no detalla la composición interna de capas ni el esquema exacto de atención, por lo que esos datos no están disponibles.

Este checkpoint concreto se obtuvo por ajuste fino supervisado (imitación) desde `lerobot/smolvla_base` sobre el dataset `local/block_handover_20_correct_ports`, compuesto por 20 episodios y 8.675 fotogramas a 15 FPS. El entrenamiento usó 200.000 pasos, batch size 1, optimizador AdamW, learning rate 1e-4, semilla 1000 y LeRobot 0.7.0. No se documenta uso de RLHF ni DPO. Las tareas aprendidas son dos instrucciones en inglés: recoger un bloque rojo o azul con el brazo dador, entregarlo al brazo receptor y depositarlo en la mesa.

## Capacidades

- Generación de acciones motoras de 12 dimensiones para un robot bimanual tipo `bi_so_follower`.
- Percepción visual multimodal a partir de tres cámaras: `left_giver_arm`, `overhead` y `right_receiver_arm`.
- Condicionamiento por instrucción en lenguaje natural (task prompting) en inglés.
- Ejecución de tareas de manipulación bimanual: agarre, transferencia y colocación de bloques.
- Política de imitación entrenada de extremo a extremo, sin necesidad de planificación explícita.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión general, audio ni modo de razonamiento explícito.

## Casos de uso

- Transferencia bimanual de bloques en laboratorio: el modelo ejecuta la secuencia de agarre, entrega y colocación descrita en las instrucciones de entrenamiento, adecuado para experimentos de manipulación cooperativa entre dos brazos.
- Investigación en imitación visual: sirve como punto de partida para estudiar cómo una política VLA compacta generaliza a variaciones de posición y color de objetos dentro del mismo dominio de tarea.
- Benchmark de referencia para ajustes finos: al estar entrenado sobre un dataset pequeño y reproducible, permite comparar técnicas de aumento de datos o de regularización en políticas VLA.
- Prototipado rápido en robótica de bajo coste: su tamaño de 450 M de parámetros y su licencia Apache 2.0 facilitan desplegarlo en estaciones de trabajo con GPU de consumo para pruebas de concepto.
- Educación y docencia en robótica: el flujo `lerobot-rollout` y `lerobot-train` permite a estudiantes reproducir el entrenamiento y la ejecución de una política VLA completa.
- Base para nuevas tareas bimanuales: desarrolladores pueden reajustar este checkpoint con sus propios datasets para tareas de ensamblaje o clasificación de piezas, reutilizando la arquitectura y el pipeline de LeRobot.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación en robot real para esta política.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 450 M de parámetros, en FP32 ocuparía aproximadamente 1,8 GB y en FP16/BF16 alrededor de 0,9 GB, a lo que habría que sumar el coste del codificador visual y de las tres cámaras.
- GPU recomendadas: no especificadas por el autor; por tamaño, cualquier GPU con al menos 4-8 GB de VRAM debería ser suficiente para inferencia en precisión reducida.
- Cabe en GPU de consumo: sí, previsiblemente en RTX 3060, RTX 4060, RTX 4090 y similares, aunque el dato no está confirmado en la documentación.
- Opciones de despliegue: LeRobot mediante `lerobot-rollout` (comando documentado en la model card); no se documentan vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a políticas robóticas.
- Latencia y throughput: no disponibles. El control se ejecuta a la frecuencia del bucle de rollout, con datos de entrenamiento grabados a 15 FPS.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| DQwalk/smolvla_bimanual_200000 | 450 M | no disponible | Apache 2.0 | Hugging Face | Ajuste fino bimanual sobre SmolVLA base |
| lerobot/smolvla_base | no disponible | no disponible | Apache 2.0 | Hugging Face | Checkpoint base del que deriva este modelo |
| Otros VLA de referencia (p. ej. OpenVLA, RT-2) | no disponible en la informacion | no disponible | no disponible | no disponible | No se dispone de datos verificados en la informacion proporcionada |

No se dispone de datos suficientes para una comparativa cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Entrenado únicamente con 20 episodios y 8.675 fotogramas, lo que limita severamente la generalización a posiciones, iluminación o distracciones no vistas.
- Solo cubre dos tareas concretas (bloque rojo y bloque azul) con instrucciones en inglés; no es un modelo generalista.
- No hay resultados de evaluación en robot real publicados, por lo que se desconoce la tasa de éxito.
- Riesgo de sobreajuste al dataset local y de fallo ante cambios en la configuración de cámaras o en el robot.
- Requiere que los nombres de cámara coincidan exactamente con las claves de observación del entrenamiento (`left_giver_arm`, `overhead`, `right_receiver_arm`).
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de evaluación y el dominio tan restringido desaconsejan su uso en producción sin validación previa.
- No se documentan sesgos lingüísticos ni de otro tipo, pero al ser un modelo de acción no genera texto libre.
- No se dispone de información sobre cuantizaciones oficiales ni sobre el rendimiento en hardware de consumo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DQwalk/smolvla_bimanual_200000
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Paper SmolVLA: https://huggingface.co/papers/2506.01844
- Dataset de entrenamiento: https://huggingface.co/datasets/local/block_handover_20_correct_ports
- Guía LeRobot SmolVLA: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentación LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Documentación de inferencia: https://huggingface.co/docs/lerobot/main/en/inference
