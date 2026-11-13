# mrodher/policy_test_V9

## Resumen

`mrodher/policy_test_V9` es una política de imitación robótica entrenada con el método ACT (Action Chunking with Transformers) y publicada en Hugging Face a través de la librería LeRobot. No es un modelo de lenguaje: es un modelo de control visuomotor que, a partir de dos imágenes de cámara (vista superior y vista de muñeca) y del estado de las articulaciones, predice comandos de acción para un brazo robótico de tipo `so_follower` (SO-101). Resuelve una tarea concreta de manipulación: "put the beige piece on the aruco".

El modelo tiene 51.668.614 parámetros y un tamaño de repositorio de 0,2 GB, lo que lo sitúa en el rango de políticas ligeras que pueden ejecutarse en tiempo real sobre hardware modesto. Se entrenó durante 20.000 pasos con un lote de 8 y una tasa de aprendizaje de 1e-5 sobre un dataset propio de 200 episodios y 44.649 fotogramas grabados a 30 FPS mediante teleoperación.

Es relevante ahora como ejemplo reproducible del flujo completo de LeRobot (grabación de datos, entrenamiento y despliegue de una política ACT), aunque se trata de un artefacto de prueba (`policy_test_V9`) sin resultados de evaluación publicados ni licencia declarada, por lo que no debe considerarse listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con encoder visual y decodificador de acciones |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; ventana de observación definida por la política, no documentada) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors de precisión completa) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje; la tarea se especifica mediante una instrucción textual fija) |
| Licencia | no disponible |
| Formato de pesos | safetensors (repositorio LeRobot) |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que predice trozos de acción (*action chunks*) de varios pasos en lugar de una única acción por inferencia, lo que reduce el error de acumulación y suaviza la ejecución. La política combina un encoder visual (procesa dos cámaras RGB de 480×640) con un transformer que fusiona las características visuales, el estado articular de 6 dimensiones y la instrucción de tarea, y un decodificador que emite acciones de 6 dimensiones. Emplea además un estilo de entrenamiento tipo CVAE con una latente de estilo que ayuda a modelar la variabilidad de las demostraciones humanas.

El entrenamiento se realizó con LeRobot 0.6.2 sobre el dataset `mrodher/so101_dataset_test_V9_20261113_110914`: 200 episodios, 44.649 fotogramas a 30 FPS, una única tarea ("put the beige piece on the aruco") y robot `so_follower` con cámaras `top` y `wrist`. La configuración fue de 20.000 pasos, batch de 8, optimizador AdamW, learning rate de 1e-5 y semilla 1000. No se documenta composición adicional del dataset, aumento de datos, ni etapas de RLHF o DPO (no aplicables a este tipo de política).

## Capacidades

- Control visuomotor de un brazo robótico SO-101 (`so_follower`) a partir de dos cámaras RGB y el estado articular.
- Predicción de chunks de acción de 6 dimensiones para ejecución en bucle cerrado.
- Aprendizaje por imitación a partir de demostraciones teleoperadas (no requiere modelado explícito del entorno).
- Ejecución en tiempo real mediante `lerobot-rollout` con estrategia `base`.
- Condicionamiento por instrucción de tarea textual fija ("put the beige piece on the aruco").
- No dispone de tool calling, function calling, razonamiento multi-paso simbólico, capacidades multilingües ni modo de pensamiento; no es un modelo generativo de texto.

## Casos de uso

- Automatización de una tarea de pick-and-place concreta: colocar una pieza beige sobre un marcador ArUco. El modelo está entrenado específicamente para esta secuencia y puede desplegarse con `lerobot-rollout` sobre el robot SO-101.
- Prototipado de flujos de imitación con LeRobot: sirve como referencia reproducible del pipeline completo (grabación, entrenamiento con `lerobot-train`, despliegue) para equipos que evalúan ACT.
- Base para *fine-tuning* en tareas similares: al ser una política ligera (51,7 M de parámetros), puede reentrenarse con nuevos datasets de manipulación sobre el mismo robot.
- Investigación en manipulación visuomotora: permite estudiar el efecto de action chunking, la fusión de cámaras `top`/`wrist` y la robustez ante variaciones de posición de objetos.
- Docencia y demostraciones de robótica de bajo coste: el tamaño del repositorio (0,2 GB) y la ausencia de requisitos de GPU de gran escala facilitan su uso en laboratorios con hardware limitado.
- Validación de infraestructura de inferencia robótica: útil para probar latencias, tasas de control y sincronización de cámaras a 30 FPS antes de escalar a políticas más complejas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación en robot real (número de ensayos, éxitos ni tasa de éxito).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 51,7 M de parámetros en safetensors, la inferencia requiere del orden de unos pocos cientos de MB, pero no se documenta una cifra concreta.
- GPU recomendadas: no disponible; LeRobot permite `--policy.device=cuda`, por lo que cualquier GPU NVIDIA compatible con PyTorch es suficiente en la práctica.
- ¿Cabe en GPU de consumo? Sí, por tamaño de modelo; no se especifica un modelo mínimo validado.
- Opciones de despliegue: `lerobot-rollout` (CLI de LeRobot) con `--strategy.type=base`; entrenamiento con `lerobot-train`.
- Latencia y throughput: no disponibles; el dataset se grabó a 30 FPS, pero no se publica la tasa de control efectiva ni el tiempo de inferencia por paso.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `mrodher/policy_test_V9` (ACT) | 51,7 M | no aplica | sin evaluación publicada | no disponible | Hugging Face (LeRobot) |
| ACT (implementación de referencia LeRobot) | no disponible | no aplica | reportado en paper original | no disponible en esta ficha | Hugging Face / GitHub |
| Diffusion Policy (alternativa de imitación) | no disponible | no aplica | no disponible en esta ficha | no disponible en esta ficha | no disponible en esta ficha |
| VQ-BeT (alternativa de imitación) | no disponible | no aplica | no disponible en esta ficha | no disponible en esta ficha | no disponible en esta ficha |

No se dispone de datos comparativos verificados en la información proporcionada para establecer una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- Política de prueba (`policy_test_V9`): nombre y ausencia de evaluación sugieren que no está validada para uso real.
- Sin resultados de evaluación en robot: se desconoce la tasa de éxito, la robustez ante cambios de iluminación, posiciones de objetos o distracciones.
- Entrenada para una única tarea y un único tipo de robot (`so_follower`); no generaliza a otras tareas ni a otros brazos sin reentrenamiento.
- Depende de la configuración exacta de cámaras (`top`, `wrist`) y de sus nombres en las claves de observación; un montaje distinto invalida la política.
- Licencia no declarada: no se puede asumir uso comercial ni redistribución.
- Riesgo de sobreajuste al dataset de 200 episodios y a las condiciones de grabación.
- No es un modelo de lenguaje: no admite prompts arbitrarios, tool calling ni razonamiento simbólico; la instrucción de tarea es fija.
- No se documentan sesgos, pero al derivar de demostraciones humanas puede heredar sesgos de ejecución del teleoperador.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mrodher/policy_test_V9
- Dataset de entrenamiento: https://huggingface.co/datasets/mrodher/so101_dataset_test_V9_20261113_110914
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=mrodher/so101_dataset_test_V9_20261113_110914
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de instalación: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference
