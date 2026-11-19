# googaar/act_sos101_test_50k

## Resumen

`googaar/act_sos101_test_50k` es una política de imitación robótica entrenada con el método Action Chunking with Transformers (ACT), desarrollada por el usuario googaar y publicada en Hugging Face mediante la librería LeRobot. No se trata de un modelo de lenguaje, sino de un controlador visomotor que mapea observaciones (estado articular de 6 dimensiones e imagen frontal de 480x640) a acciones articulares de 6 dimensiones. El modelo resuelve una tarea concreta de manipulación: introducir una pelota roja en una cesta negra.

El modelo tiene 51.668.614 parámetros (aproximadamente 51,7 millones) y un tamaño de repositorio de 0,2 GB en formato safetensors. Se entrenó durante 50.000 pasos con batch size 8, optimizador AdamW y learning rate 1e-5 sobre un dataset propio de 52 episodios y 29.867 frames a 30 FPS. Está pensado para el robot `so_follower` (SO-101) con una única cámara frontal.

Su relevancia es acotada: se trata de un artefacto de prueba o experimento personal (`test` en el nombre), sin resultados de evaluación publicados, sin licencia declarada y sin descargas ni interacciones. Resulta útil como ejemplo reproducible de entrenamiento ACT con LeRobot 0.7.1, pero no como componente listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con encoder visual y decodificador de chunks de acción |
| Parámetros totales | 51.668.614 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; política de imitación, no modelo de lenguaje) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (no procesa lenguaje natural como entrada principal; recibe una instrucción de tarea en texto en tiempo de ejecución) |
| Licencia | no disponible (la model card indica «More Information Needed») |
| Formato de pesos | safetensors |
| Librería | lerobot 0.7.1 |
| Pipeline | robotics |
| Tipo de robot | `so_follower` |
| Cámaras | `front` (3, 480, 640) |
| Entrada de estado | `observation.state` (6,) |
| Salida de acción | `action` (6,) |
| Dataset de entrenamiento | googaar/lerobot_training_data (52 episodios, 29.867 frames, 30 FPS) |
| Tareas entrenadas | «Put red ball in black basket», «Pick up red ball and place in black basket» |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que predice chunks de acciones (secuencias cortas de comandos) en lugar de pasos individuales, lo que reduce el error de composición acumulado en tareas de manipulación de horizonte largo. La arquitectura combina un backbone visual (típicamente ResNet) para procesar la imagen de la cámara frontal con un transformer que fusiona la observación visual y el estado articular, y un decodificador que emite el chunk de acciones. El modelo está condicionado por una instrucción de tarea en texto («Put red ball in black basket»).

El entrenamiento se realizó con LeRobot 0.7.1 durante 50.000 pasos, batch size 8, AdamW con learning rate 1e-5 y semilla 1000. El dataset contiene 52 episodios teleoperados (29.867 frames a 30 FPS) de una única tarea de pick-and-place sobre el robot SO-101. No se documenta uso de RLHF, DPO ni aumentos de datos; es aprendizaje supervisado puro sobre demostraciones. No se especifican detalles del backbone visual ni del número de capas del transformer más allá de lo que aporta el paper de ACT (arXiv:2304.13705).

## Capacidades

- Control visomotor de un brazo robótico de 6 grados de libertad (SO-101 / `so_follower`) a partir de una imagen frontal y el estado articular.
- Predicción de chunks de acción para tareas de pick-and-place.
- Ejecución condicionada por instrucción de tarea en texto («Put red ball in black basket»).
- Aprendizaje por imitación a partir de demostraciones teleoperadas (no requiere recompensa explícita).
- Integración con el ecosistema LeRobot: `lerobot-rollout` para inferencia y `lerobot-train` para reentrenamiento.
- No soporta tool calling, function calling, razonamiento multi-paso simbólico, visión general, audio ni generación de texto libre.

## Casos de uso

- Replicación de experimentos ACT: sirve como referencia reproducible para validar un pipeline completo de LeRobot (grabación, entrenamiento, rollout) sobre el robot SO-101 antes de abordar tareas propias.
- Automatización de pick-and-place en laboratorio: el modelo ejecuta la tarea «pelota roja a cesta negra» con una cámara frontal, útil como banco de pruebas para comparar configuraciones de cámara, iluminación o posiciones de objeto.
- Docencia y formación en aprendizaje por imitación: permite mostrar de extremo a extremo cómo se entrena una política ACT con 52 episodios y 50.000 pasos, y cómo se lanza en el robot real.
- Base para fine-tuning: al ser un checkpoint ACT de 51,7 M de parámetros y 0,2 GB, se puede reentrenar con `lerobot-train` sobre un dataset nuevo para adaptarlo a otra tarea de manipulación del mismo robot.
- Evaluación de robustez visomotora: útil para medir cómo degrada el éxito ante cambios de iluminación, posición del objeto o distracciones, dado que la model card invita explícitamente a reportar estas condiciones.
- Prototipado rápido de políticas en robótica de bajo coste: el tamaño reducido permite iterar en estaciones con una sola GPU consumer, sin infraestructura de servidor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente: «No evaluation results have been provided for this policy yet», sin tabla de trials, éxitos ni tasa de éxito.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 51,7 M de parámetros en fp32 el peso ronda los 0,2 GB, por lo que la VRAM necesaria es mínima (dominada por el backbone visual y el buffer de imagen 3x480x640).
- GPU recomendadas: cualquier GPU con soporte CUDA es suficiente; el entrenamiento se realizó con `--policy.device=cuda`. No se especifica el modelo de GPU usado.
- Cabe en GPU consumer: sí, con amplio margen (por ejemplo, RTX 3060, RTX 4060, RTX 4090), aunque no se aportan cifras medidas.
- Opciones de despliegue: LeRobot (`lerobot-rollout` con `--strategy.type=base`), integrado con el robot `so_follower` y cámaras OpenCV a 640x480 y 30 FPS. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplican a una política robótica).
- Latencia y throughput: no disponibles. La inferencia debe sostener el bucle de control del robot a 30 FPS, pero no se publican mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| googaar/act_sos101_test_50k | 51,7 M | no aplica | Pick-and-place SO-101 (pelota roja a cesta) | no disponible | Hugging Face, 0 descargas |
| Políticas ACT de referencia en LeRobot | no disponible | no aplica | Manipulación genérica con SO-101 | según repositorio | Hugging Face |
| Diffusion Policy (alternativa a ACT) | no disponible | no aplica | Imitación visomotora | según implementación | Repositorios de investigación |

No se dispone de datos de rendimiento comparables entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Sin evaluación publicada: no hay tasa de éxito medida en robot real, por lo que se desconoce su fiabilidad.
- Modelo de prueba: el sufijo `test_50k` y la ausencia de descargas o likes sugieren un artefacto experimental, no una política validada.
- Licencia no declarada: la model card indica «More Information Needed», lo que impide confirmar el uso comercial.
- Tarea única y muy específica: entrenado solo para «pelota roja a cesta negra»; no generaliza a otras tareas sin reentrenamiento.
- Entrenado para un robot y cámara concretos (`so_follower`, cámara `front` a 640x480 y 30 FPS); cambiar la configuración de cámara o el robot invalida la política.
- Dataset pequeño: 52 episodios y 29.867 frames, lo que limita la robustez ante variaciones de iluminación, posición de objetos o distracciones.
- Riesgo de sobreajuste a las condiciones de recogida de datos (posiciones, fondo, iluminación).
- No es un modelo de lenguaje: no procesa lenguaje natural libre ni mantiene conversaciones; la instrucción de tarea es un condicionamiento fijo.
- Sin información sobre sesgos, alucinación o comportamiento fuera de distribución más allá de lo anterior.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/googaar/act_sos101_test_50k
- Dataset de entrenamiento: https://huggingface.co/datasets/googaar/lerobot_training_data
- Paper de ACT: https://huggingface.co/papers/2304.13705 (arXiv:2304.13705)
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=googaar/lerobot_training_data
