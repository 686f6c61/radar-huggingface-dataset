# ases200q2/roboverse_pick_cube_mujocoE100_pi05_lora_20260911_0953

## Resumen

Este repositorio contiene una política robótica entrenada mediante *imitation learning* sobre la arquitectura π₀.₅ (Pi05), un modelo Vision-Language-Action (VLA) desarrollado por Physical Intelligence y adaptado al ecosistema LeRobot de Hugging Face. El autor, `ases200q2`, ha publicado un *fine-tuning* del modelo base `lerobot/pi05_base` especializado en una única tarea de manipulación: "pick_cube" (recoger un cubo), sobre un brazo robótico de tipo Franka en simulación MuJoCo. El resultado es un *checkpoint* que asigna acciones de 9 grados de libertad a partir de observaciones visuales y proprioceptivas.

El modelo no es un LLM de propósito general, sino una política de control que mapea observaciones (una imagen RGB de 240x320 píxeles, el estado del robot de dimensión 9 y su velocidad de dimensión 9) a un vector de acción de dimensión 9. Se ha entrenado durante 40 000 pasos con *batch size* 32 y optimizador AdamW sobre un dataset de 100 episodios (9830 fotogramas a 30 FPS) generado en el entorno RoboVerse. Por su naturaleza, el modelo está pensado para ejecutarse en bucle cerrado sobre hardware robótico real o simulado, no para inferencia de texto.

La relevancia de esta ficha es doble. Por un lado, ejemplifica el flujo de trabajo estándar de LeRobot para *fine-tuning* de políticas VLA sobre tareas concretas. Por otro, conviene tratarla con cautela: el autor no ha publicado resultados de evaluación, el repositorio reporta un tamaño de 0.0 GB y no hay métricas de tasa de éxito, por lo que su utilidad práctica queda limitada a la experimentación y a servir de plantilla reproducible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en la familia π₀.₅ (Pi05) de Physical Intelligence |
| Parametros totales | no disponible (el autor no publica el recuento; el nombre sugiere un *fine-tuning* LoRA sobre `lerobot/pi05_base`) |
| Parametros activos | no aplica (no se documenta una arquitectura MoE) |
| Longitud de contexto | no aplica / no disponible (es una politica de control, no un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (segun el tag del repositorio); el repositorio reporta 0.0 GB de tamano |
| Modelo base | lerobot/pi05_base |
| Libreria | lerobot (version 0.6.1 durante el entrenamiento) |
| Tipo de robot | franka |
| Camaras | main_camera |
| Entrada - estado | observation.state, forma (9,) |
| Entrada - velocidad | observation.velocity, forma (9,) |
| Entrada - imagen | observation.images.main_camera, forma (3, 240, 320) |
| Salida | action, forma (9,) |
| Dataset de entrenamiento | ases200q2/roboverse-pick_cube-mujoco-E100 (100 episodios, 9830 fotogramas, 30 FPS) |
| Tarea | "pick_cube" |

## Arquitectura y entrenamiento

La arquitectura subyacente es un modelo Vision-Language-Action de la familia π₀.₅, descrito por Physical Intelligence como una evolución de π₀ orientada a la generalización en entornos y situaciones no vistos durante el entrenamiento. En este caso concreto, el modelo parte de `lerobot/pi05_base` y se ha adaptado mediante *fine-tuning* supervisado a una única tarea de manipulación. La política consume tres entradas —imagen RGB, estado articular y velocidad— y emite un vector de acción de 9 dimensiones, que corresponde a los grados de libertad del brazo Franka utilizado en el dataset. No se documenta en la *model card* el número de parámetros, la composición del *backbone* de visión-lenguaje ni si se aplicó RLHF, DPO u otra fase de alineamiento; en políticas de imitación este tipo de etapas no suele emplearse.

Los datos de entrenamiento proceden del dataset `ases200q2/roboverse-pick_cube-mujoco-E100`, con 100 episodios y 9830 fotogramas capturados a 30 FPS en el simulador MuJoCo, todos ellos correspondientes a la tarea "pick_cube". La configuración de entrenamiento reportada es: 40 000 pasos, *batch size* 32, optimizador AdamW, *learning rate* 2.5e-05 y semilla 1000. Al tratarse de un ajuste sobre un modelo preentrenado y por el sufijo "lora" del identificador del repositorio, es plausible que se haya utilizado *Low-Rank Adaptation*, aunque la *model card* no lo confirma explícitamente. El autor no documenta innovaciones técnicas adicionales (decodificación especulativa, atención lineal, *thinking mode* u otras).

## Capacidades

- Control robótico de manipulación: genera acciones continuas de 9 dimensiones para un brazo Franka en la tarea específica "pick_cube".
- Percepción visual: procesa imágenes RGB de 240x320 píxeles procedentes de una cámara frontal (`main_camera`).
- Integración de propriocepción: combina el estado articular (9,) y la velocidad (9,) con la observación visual para producir la acción.
- Ejecución en bucle cerrado: está diseñado para ser desplegado en tiempo real sobre el robot mediante el comando `lerobot-rollout`.
- Reentrenamiento: sirve como punto de partida para *fine-tuning* adicional siguiendo el flujo de LeRobot.
- No se documenta soporte de *tool calling*, *function calling*, agentes multi-paso, razonamiento simbólico, matemáticas, generación de código ni capacidades multilingües, ya que no es un modelo de lenguaje de propósito general.
- No se documenta capacidad de visión general (VQA, OCR) más allá del uso de la imagen como entrada de control.

## Casos de uso

- **Investigación en imitación robótica:** el *checkpoint* sirve como referencia reproducible para estudiar cómo se comporta π₀.₅ tras un *fine-tuning* corto (40 000 pasos) sobre una tarea única en MuJoCo, permitiendo comparar configuraciones de entrenamiento.
- **Validación de pipelines LeRobot:** permite probar de extremo a extremo el flujo `lerobot-train` → `lerobot-rollout` con un modelo real, útil para verificar instalaciones, calibración de cámaras y puertos del robot.
- **Aprendizaje de la tarea "pick_cube":** puede desplegarse sobre un Franka con una cámara frontal para intentar recoger un cubo en un entorno controlado, siempre que la escena se parezca a la distribución del dataset de entrenamiento.
- **Punto de partida para *fine-tuning*:** al estar basado en `lerobot/pi05_base` y publicarse bajo Apache 2.0, se puede reentrenar con datasets propios de otras tareas de manipulación (apilar, insertar, ordenar) añadiendo episodios y ajustando el *learning rate*.
- **Generación de datos sintéticos en simulación:** combinado con el dataset `roboverse-pick_cube-mujoco-E100`, permite estudiar *sim-to-real* midiendo cuánto se degrada la política al transferirla a hardware físico.
- **Docencia y divulgación:** sirve como ejemplo didáctico de cómo se estructura una política VLA, qué observaciones consume y qué salidas produce, sin necesidad de un clúster grande.
- **Pruebas de robustez:** se puede emplear para medir la sensibilidad de la política ante cambios de iluminación, posición del cubo o ruido en la cámara, dado que no hay métricas publicadas de generalización.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La propia *model card* incluye la sección de evaluación vacía con la nota literal de que el autor no ha proporcionado resultados ("No evaluation results have been provided for this policy yet."), por lo que no existen tasas de éxito, números de intentos ni comparaciones cuantitativas con otros *checkpoints*.

## Requisitos de hardware

- **VRAM para inferencia:** no disponible. El autor no publica el tamaño del modelo ni el *checkpoint* asociado (el repositorio reporta 0.0 GB), por lo que no es posible estimar con rigor la VRAM necesaria.
- **GPU recomendadas:** no disponibles. Al no conocerse el número de parámetros ni la cuantización, no se puede confirmar qué GPU (RTX 4090, A100, H100, etc.) es suficiente.
- **Viabilidad en GPU de consumo:** no confirmada. Aunque las políticas VLA de la familia π₀ se suelen desplegar en GPUs de gama alta, este repositorio concreto no aporta datos que permitan afirmarlo.
- **Opciones de despliegue:** el flujo documentado es LeRobot, mediante `lerobot-rollout` con `--policy.path=ases200q2/roboverse_pick_cube_mujocoE100_pi05_lora_20260911_0953` y `--strategy.type=base`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- **Latencia y throughput:** no disponibles. No se publican mediciones de frecuencia de control efectiva, tiempo de inferencia por paso ni *throughput*.
- **Requisitos adicionales:** para ejecutar la política hace falta un robot Franka con el puerto correspondiente y al menos una cámara configurada con el nombre `main_camera`, cuyas dimensiones y FPS deben coincidir con las del entrenamiento (240x320, 30 FPS).

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Estado |
|---|---|---|---|---|---|
| ases200q2/roboverse_pick_cube_mujocoE100_pi05_lora_20260911_0953 | VLA especializada en "pick_cube" | no disponible | no aplica | Apache 2.0 | Publicado, sin evaluacion |
| lerobot/pi05_base | VLA base de proposito general (Pi05) | no disponible en la informacion proporcionada | no aplica | no disponible en la informacion proporcionada | Modelo base del anterior |
| lerobot/pi0 | VLA de la generacion anterior (π₀) | no disponible en la informacion proporcionada | no aplica | no disponible en la informacion proporcionada | Referencia historica de la familia |

No se dispone de datos cuantitativos de otros modelos comparables dentro de la informacion proporcionada, por lo que la comparacion se limita a la relacion de dependencia entre este *checkpoint* y su modelo base. No es posible comparar tasas de exito, latencia, VRAM ni cobertura de tareas con alternativas como OpenVLA o GR00T sin datos publicados.

## Limitaciones y advertencias

- **Ausencia total de evaluacion:** el autor no reporta ni un solo resultado de tasa de exito, por lo que se desconoce si la politica funciona.
- **Especializacion extrema:** el modelo solo ha visto la tarea "pick_cube" en un unico entorno simulado; es previsible que falle ante objetos, posiciones, iluminacion o robots distintos.
- **Repositorio vacio o incompleto:** el tamano reportado es 0.0 GB, lo que sugiere que los pesos pueden no estar subidos o que el *checkpoint* no es utilizable tal cual. Conviene verificar antes de descargarlo.
- **Riesgo de sobreajuste:** 100 episodios y 9830 fotogramas son un volumen reducido para una politica VLA; el *fine-tuning* de 40 000 pasos puede haber memorizado la distribucion del dataset.
- **Brecha sim-to-real:** el entrenamiento se realizo en MuJoCo, por lo que trasladar la politica a un robot fisico puede degradar gravemente el rendimiento.
- **Requisitos de entrada estrictos:** cualquier cambio en el numero o el nombre de las caracteristicas de observacion (estado, velocidad, `main_camera`) rompe la compatibilidad con el *checkpoint*.
- **Sesgos:** no disponible. No se documenta ningun analisis de sesgos, y en el contexto de una politica de manipulacion el concepto se traduce en sesgos de distribucion (posiciones, texturas, colores del cubo).
- **Alucinacion:** no aplica en el sentido linguistico, pero si en cuanto a la generacion de acciones sin sentido fisico cuando la observacion cae fuera de la distribucion de entrenamiento.
- **Licencia:** Apache 2.0 permite uso comercial y modificacion, siempre que se conserve el aviso de copyright y se cite adecuadamente el trabajo original (LeRobot y, por extension, π₀.₅). El autor pide citar LeRobot mediante el BibTeX incluido en la *model card*.
- **Falta de trazabilidad del entrenamiento:** no se enlazan registros de Weights & Biases ni curvas de perdida, por lo que no es posible auditar el proceso.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ases200q2/roboverse_pick_cube_mujocoE100_pi05_lora_20260911_0953
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Dataset de entrenamiento: https://huggingface.co/datasets/ases200q2/roboverse-pick_cube-mujoco-E100
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=ases200q2/roboverse-pick_cube-mujoco-E100
- Blog de π₀.₅ (Physical Intelligence): https://www.physicalintelligence.company/blog/pi05
- Repositorio OpenPI (Physical Intelligence): https://github.com/Physical-Intelligence/openpi
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guia de LeRobot para pi05: https://huggingface.co/docs/lerobot/main/en/pi05
- Documentacion general de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Configuracion de hardware en LeRobot: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabacion de datos y entrenamiento de politicas: https://huggingface.co/docs/lerobot/en/il_robots
- Chuleta de comandos de LeRobot: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference
