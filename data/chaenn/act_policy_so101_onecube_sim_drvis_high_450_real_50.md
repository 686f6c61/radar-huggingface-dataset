# Chaenn/act_policy_so101_onecube_sim_drvis_high_450_real_50

## Resumen

`Chaenn/act_policy_so101_onecube_sim_drvis_high_450_real_50` es una política de imitación para robótica basada en Action Chunking with Transformers (ACT), el método presentado por Zhao et al. (2023) y popularizado por el ecosistema LeRobot de Hugging Face. El modelo ha sido entrenado para controlar un brazo robótico SO-101 (`so_follower`) equipado con dos cámaras (una lateral y otra en la muñeca), resolviendo una única tarea concreta: coger un cubo rojo y colocarlo dentro de un límite negro.

El modelo tiene 51.668.614 parámetros y un tamaño de repositorio de 0,2 GB, lo que lo sitúa en la categoría de políticas ligeras aptas para inferencia en tiempo real sobre hardware modesto. Consume observaciones de estado de 6 dimensiones y dos imágenes RGB de 480x640, y produce acciones de 6 dimensiones a 30 FPS. Es un ejemplo típico de política especializada: no es un modelo de propósito general, sino un controlador entrenado para una tarea y un robot específicos.

Su relevancia radica en que ilustra el flujo completo de imitación robótica con LeRobot 0.6.2: recogida de datos de teleoperación, entrenamiento con ACT y despliegue mediante `lerobot-rollout`. El dataset combina 450 episodios de simulación con 50 episodios reales, lo que refleja una práctica habitual de domain randomization para mejorar la transferencia sim-a-real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con encoder visual y decodificador de chunks de acciones |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (política de control, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo robótico, sin capacidades lingüísticas) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (repo de 0,2 GB) |
| Tipo de robot | `so_follower` (SO-101) |
| Cámaras | `side`, `wrist` (RGB 480x640) |
| Entrada de estado | `observation.state` de forma `(6,)` |
| Salida de acción | `action` de forma `(6,)` |
| Frecuencia de control | 30 FPS |
| Biblioteca | lerobot 0.6.2 |
| Pasos de entrenamiento | 170.000 |
| Batch size | 8 |
| Optimizador | AdamW |
| Learning rate | 1e-5 |
| Semilla | 1000 |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que predice chunks de acciones (secuencias cortas de comandos) en lugar de pasos individuales, lo que reduce el error de compounding y mejora la estabilidad del control. La arquitectura combina un backbone visual (encoder de imágenes) con un transformer que fusiona las observaciones visuales y proprioceptivas para generar el chunk de acciones. El modelo está entrenado para la tarea "Pick up the red cube and place it inside the black boundary" sobre el robot SO-101.

El entrenamiento se realizó con LeRobot 0.6.2 durante 170.000 pasos, con batch size 8, optimizador AdamW y learning rate 1e-5. El dataset asociado (`Chaenn/so101_onecube_sim_drvis_high_450_real_50`) contiene 500 episodios y 218.753 frames a 30 FPS, combinando 450 episodios de simulación con domain randomization visual alta (`drvis_high`) y 50 episodios reales. No se documenta el uso de RLHF, DPO ni otras técnicas de alineación, lo cual es esperable en una política de imitación.

## Capacidades

- Control robótico de manipulación para la tarea específica de recoger un cubo rojo y depositarlo dentro de un límite negro.
- Procesamiento multimodal de entrada: estado proprioceptivo de 6 dimensiones más dos vistas RGB (lateral y de muñeca) a 480x640.
- Generación de chunks de acciones de 6 dimensiones a 30 FPS para control de un brazo SO-101.
- Aprendizaje por imitación a partir de datos de teleoperación, sin refuerzo explícito.
- Transferencia sim-a-real mediante entrenamiento mixto con datos simulados y reales.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades lingüísticas: es una política de control, no un modelo de lenguaje.

## Casos de uso

- Automatización de picking y placing en laboratorio: el modelo ejecuta la secuencia completa de coger un cubo y soltarlo en una zona delimitada, útil para validar pipelines de imitación antes de escalar a tareas industriales.
- Benchmark de referencia para comparar variantes de ACT: al estar entrenado con una receta concreta (170k pasos, lr 1e-5, dataset mixto sim+real), sirve como baseline reproducible en experimentos de imitación robótica.
- Validación de transferencia sim-a-real: el dataset combina 450 episodios simulados con 50 reales, por lo que el modelo permite estudiar cómo el domain randomization visual afecta al rendimiento en el robot físico.
- Docencia y formación en robótica: es un ejemplo completo y ligero (51,7 M de parámetros, 0,2 GB) para enseñar el flujo LeRobot de grabación, entrenamiento y despliegue con `lerobot-rollout`.
- Pruebas de integración de hardware SO-101: permite verificar cámaras, calibración y puertos antes de entrenar políticas propias más complejas.
- Prototipado rápido de tareas de manipulación: al ser una política pequeña, se puede reentrenar con un dataset propio en hardware de consumo y comparar con esta referencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet." No se dispone de tasas de éxito en robot real ni en simulación.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 dado el tamaño de 51,7 M de parámetros (aproximadamente 207 MB de pesos) más el coste de los dos encoders visuales a 480x640; en la práctica cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; RTX 3060, RTX 4060, RTX 4090, A100 o H100 son suficientes. Para entrenamiento se recomienda al menos 8-12 GB por el batch de imágenes.
- Cabe en GPU consumer: sí, en cualquier tarjeta moderna de NVIDIA, AMD o incluso en CPU para inferencia a baja frecuencia (no recomendado para control a 30 FPS).
- Opciones de despliegue: `lerobot-rollout` (CLI oficial), biblioteca `lerobot` 0.6.2, integración con SO-101 vía puerto serie y cámaras OpenCV. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput estimados: no disponibles. El control opera a 30 FPS (33 ms por paso), pero no se publican mediciones de latencia de inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Tipo | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ACT (este modelo) | 51,7 M | ACT / imitación | Pick-and-place cubo rojo | apache-2.0 | Hugging Face |
| Diffusion Policy | no disponible | Política de difusión | Manipulación genérica | no disponible | Repositorios de investigación |
| VQ-BeT | no disponible | Transformer discretizado | Manipulación genérica | no disponible | Repositorios de investigación |
| π0 (Physical Intelligence) | no disponible | VLA de propósito general | Manipulación multi-tarea | no disponible | No público en el momento de redactar |

La comparación cuantitativa no es posible porque no se han publicado benchmarks de este modelo ni de las alternativas en la información disponible. ACT se distingue por su simplicidad, su bajo coste computacional y su integración nativa en LeRobot, frente a propuestas más pesadas como Diffusion Policy o modelos VLA de propósito general.

## Limitaciones y advertencias

- Especialización extrema: la política solo ha sido entrenada para una tarea ("Pick up the red cube and place it inside the black boundary") y un robot concreto (SO-101). No generaliza a otras tareas, objetos ni morfologías sin reentrenamiento.
- Sin evaluación publicada: no hay tasas de éxito en robot real ni en simulación, por lo que se desconoce su robustez ante cambios de iluminación, posiciones de objetos o distracciones.
- Dependencia de la configuración de cámaras: los nombres `side` y `wrist` y sus índices deben coincidir exactamente con los usados en el entrenamiento; un cambio de montaje o calibración puede degradar el rendimiento.
- Riesgo de sobreajuste al dominio simulado: 450 de los 500 episodios son simulados, lo que puede introducir una brecha sim-a-real no cuantificada.
- Sin capacidades lingüísticas ni de razonamiento: no admite instrucciones en lenguaje natural ni tool calling; la tarea se fija en el argumento `--task` del rollout.
- Licencia apache-2.0: permite uso comercial y modificación, pero el autor no ofrece garantías ni soporte; el usuario asume la responsabilidad de validar el modelo en su hardware.
- Sin datos de sesgos: al no ser un modelo de lenguaje, no aplican sesgos lingüísticos, pero sí posibles sesgos de los datos de teleoperación (posiciones, objetos y condiciones de iluminación limitadas).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Chaenn/act_policy_so101_onecube_sim_drvis_high_450_real_50
- Dataset de entrenamiento: https://huggingface.co/datasets/Chaenn/so101_onecube_sim_drvis_high_450_real_50
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=Chaenn/so101_onecube_sim_drvis_high_450_real_50
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de instalación: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
