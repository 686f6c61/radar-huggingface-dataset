# eetudigi/hf_act_recordpolicy1_50ep_40k

## Resumen

`eetudigi/hf_act_recordpolicy1_50ep_40k` es una política de imitación para robótica basada en ACT (Action Chunking with Transformers), publicada en Hugging Face Hub por el usuario `eetudigi` mediante la librería LeRobot. El modelo aprende a partir de datos teleoperados y predice fragmentos cortos de acciones (action chunks) en lugar de pasos individuales, lo que reduce el error de acumulación y suele mejorar las tasas de éxito en tareas de manipulación.

Se trata de una política específica para el robot `so_follower` (SO-100/101 follower de LeRobot), con dos cámaras (`wrist` y `top`) y un espacio de acciones de 6 dimensiones. El modelo se entrenó durante 40.000 pasos sobre un dataset propio de 50 episodios y 25.144 fotogramas a 30 FPS, con una única tarea: "Grab the yellow cap".

Es relevante como ejemplo reproducible de entrenamiento de políticas ACT de extremo a extremo con LeRobot 0.6.2, útil para quien quiera replicar el pipeline o adaptarlo a su propio robot y tarea. Con 51,7 millones de parámetros y un repo de 0,2 GB, es un modelo pequeño pensado para inferencia en tiempo real en hardware modesto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers): transformer condicionado a observaciones visuales y de estado que predice chunks de acciones |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; política de imitación, no LLM) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | safetensors (repo LeRobot) |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que combina un codificador visual (típicamente ResNet) con un transformer que fusiona las observaciones y predice secuencias de acciones de longitud fija (action chunks). Esta formulación, descrita en el paper arXiv:2304.13705, mitiga el error de compounding de las políticas paso a paso y permite un control más suave. La política consume `observation.state` de dimensión 6 y dos imágenes RGB de 480×640 (`wrist` y `top`), y produce acciones de dimensión 6.

El entrenamiento se realizó con LeRobot 0.6.2 sobre el dataset `eetudigi/record-test_20261104_175931`: 50 episodios, 25.144 fotogramas a 30 FPS, una única tarea ("Grab the yellow cap"). Configuración: 40.000 pasos, batch size 8, optimizador AdamW, learning rate 1e-5 y semilla 1000. No se documenta el uso de RLHF, DPO ni técnicas de refinamiento posteriores; es aprendizaje supervisado puro sobre demostraciones.

## Capacidades

- Control robótico de manipulación por imitación: predice chunks de acciones de 6 dimensiones a partir de estado y dos vistas de cámara.
- Percepción visual multimodal: procesa simultáneamente las cámaras `wrist` (muñeca) y `top` (vista cenital) a 480×640.
- Ejecución en tiempo real: diseñada para despliegue con `lerobot-rollout` sobre el robot `so_follower` a 30 FPS.
- Tarea única especializada: "Grab the yellow cap"; no es un modelo generalista ni multi-tarea.
- Sin soporte de tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües (no es un modelo de lenguaje).
- No dispone de modo thinking, visión general, audio ni otras capacidades fuera del control motor.

## Casos de uso

- Automatización de una tarea de pick-and-place concreta: recoger un objeto (tapón amarillo) en un entorno controlado; la política está entrenada para esa tarea y ese robot, por lo que se usaría directamente con `lerobot-rollout` sobre el `so_follower`.
- Base de referencia para reproducir el pipeline ACT de LeRobot: sirve como punto de partida para validar la instalación, la calibración de cámaras y el flujo de entrenamiento antes de entrenar políticas propias.
- Prototipado rápido de manipulación en laboratorio: con 51,7 M de parámetros y 0,2 GB de pesos, se puede desplegar en un PC con GPU consumer conectado al robot para experimentos de investigación.
- Docencia y formación en aprendizaje por imitación: ejemplo completo y pequeño (50 episodios, 40k pasos) para explicar action chunking, configuración de entrenamiento y evaluación en robot real.
- Evaluación de robustez frente a variaciones: al ser una política especializada, permite estudiar cómo afectan cambios de iluminación, posición del objeto o distracciones a una política ACT entrenada con pocos datos.
- Punto de partida para fine-tuning: se puede reentrenar o adaptar con `lerobot-train` sobre un dataset propio del mismo robot y espacio de acciones para nuevas tareas de agarre.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación en robot real para esta política.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 51,7 M de parámetros en fp32 los pesos ocupan aproximadamente 0,2 GB, por lo que la inferencia cabe holgadamente en cualquier GPU con 4-8 GB de VRAM.
- GPU recomendadas: no especificadas por el autor; por tamaño, cualquier GPU consumer (RTX 3060, RTX 4090) o profesional (A100, H100) es suficiente; el cuello de botella real es la captura de cámara a 30 FPS y el bucle de control.
- Cabe en GPU consumer: sí, con amplio margen.
- Opciones de despliegue: LeRobot (`lerobot-rollout` para ejecución, `lerobot-train` para reentrenamiento); no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplican a políticas robóticas).
- Latencia y throughput estimados: no disponibles; el sistema está pensado para operar a 30 FPS sincronizado con las cámaras del robot.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| eetudigi/hf_act_recordpolicy1_50ep_40k | 51,7 M | no aplica | Manipulación (1 tarea) | no disponible | Hugging Face Hub |
| Políticas ACT de referencia en LeRobot | no disponible | no aplica | Manipulación | según repo | Hugging Face / LeRobot |
| Políticas Diffusion Policy (LeRobot) | no disponible | no aplica | Manipulación | según repo | Hugging Face / LeRobot |
| Políticas VLA tipo pi0 (LeRobot) | no disponible | no aplica | Manipulación generalista | según repo | Hugging Face / LeRobot |

No se dispone de datos comparativos de rendimiento entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Especialización extrema: entrenada solo para la tarea "Grab the yellow cap" con un robot `so_follower` concreto; no generaliza a otras tareas, objetos o morfologías sin reentrenamiento.
- Dataset muy pequeño: 50 episodios y 25.144 fotogramas; alta probabilidad de sobreajuste a posiciones, iluminación y disposición específicas del entorno de grabación.
- Sin evaluación publicada: no hay tasas de éxito en robot real, por lo que no se puede afirmar su fiabilidad en producción.
- Licencia no especificada: la model card marca la licencia como "More Information Needed"; no se debe asumir uso comercial permitido.
- Idiomas y sesgos: no aplica en el sentido de LLM, pero sí existe riesgo de sesgo hacia las condiciones visuales del dataset de entrenamiento.
- Dependencia de hardware y calibración: requiere el robot `so_follower`, dos cámaras con nombres `wrist` y `top`, y calibración correcta; cualquier desviación degrada el rendimiento.
- Sin soporte de razonamiento, tool calling ni agentes: no es un modelo de lenguaje y no debe usarse fuera del ámbito de control robótico.
- Riesgo de alucinación en el sentido de acciones no válidas: al ser una política de imitación, puede generar trayectorias fuera de distribución ante entradas novedosas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/eetudigi/hf_act_recordpolicy1_50ep_40k
- Dataset de entrenamiento: https://huggingface.co/datasets/eetudigi/record-test_20261104_175931
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=eetudigi/record-test_20261104_175931
- Paper ACT: https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía ACT de LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference
