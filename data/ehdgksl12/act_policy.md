# Ehdgksl12/act_policy

## Resumen

`Ehdgksl12/act_policy` es una política de imitación robótica entrenada con el método Action Chunking with Transformers (ACT), publicado en el paper arXiv:2304.13705, y empaquetada con la librería LeRobot de Hugging Face. El modelo aprende a predecir fragmentos de acciones (action chunks) en lugar de pasos individuales, lo que reduce el error de acumulación y mejora la estabilidad en tareas de manipulación de precisión. Está desarrollado por el usuario Ehdgksl12 y entrenado sobre un dataset propio de teleoperación.

Se trata de un modelo pequeño, de 51.670.663 parámetros (unos 51,7 M), orientado exclusivamente a robótica y no a generación de texto. Consume una observación compuesta por el estado del robot (vector de 7 dimensiones) y una imagen de una cámara de muñeca a resolución 480x640, y produce un vector de acción de 7 dimensiones. La tarea concreta para la que fue entrenado es "Pick up the cube and place it on the plate" sobre un robot de tipo `so102_follower`.

Su relevancia es acotada: no es un modelo de propósito general, sino un artefacto reproducible de aprendizaje por imitación que sirve como ejemplo práctico del flujo de trabajo de LeRobot (grabación de datos, entrenamiento y despliegue en robot real). La licencia Apache 2.0 permite su reutilización y modificación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con codificador visual y decodificador de acciones |
| Parametros totales | 51.670.663 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; entrada de observación por paso) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan cuantizaciones) |
| Idiomas soportados | no disponible (modelo de robótica, sin capacidades lingüísticas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo implementa ACT, un método de aprendizaje por imitación que combina un codificador visual (procesa la imagen de la cámara de muñeca `cam_wrist` a 480x640) con un transformer que predice secuencias cortas de acciones en lugar de una acción por paso. Esta estrategia de *action chunking* mitiga el problema de los errores compuestos en políticas autoregresivas paso a paso y suele traducirse en tasas de éxito más altas en tareas de manipulación. La entrada de estado es un vector de 7 dimensiones y la salida de acción también es de 7 dimensiones, coherente con un robot de 6 grados de libertad más pinza.

El entrenamiento se realizó con LeRobot 0.6.0 durante 30.000 pasos, con batch size 8, optimizador AdamW, learning rate 1e-05 y semilla 1000. El dataset `Ehdgksl12/pnp_bluecube_fin_20261121_171926` contiene 30 episodios, 31.936 frames a 30 FPS, todos correspondientes a la tarea de recoger un cubo y colocarlo en un plato. No se documenta el uso de RLHF, DPO ni técnicas de refuerzo; es aprendizaje supervisado puro a partir de demostraciones teleoperadas.

## Capacidades

- Predicción de acciones robóticas de 7 dimensiones a partir de estado y una imagen de muñeca.
- Aprendizaje por imitación de tareas de manipulación pick-and-place.
- Generación de *action chunks* para reducir la acumulación de error.
- Ejecución en bucle cerrado sobre robot real mediante `lerobot-rollout`.
- Entrenamiento y ajuste reproducible con `lerobot-train`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües.
- No dispone de modo *thinking*, visión general, audio ni generación de texto.

## Casos de uso

- Recogida y colocación de objetos en línea de montaje: el modelo ejecuta la tarea "Pick up the cube and place it on the plate" sobre un robot `so102_follower`, adecuado para demostrar flujos pick-and-place repetitivos con objetos de color y posición controlados.
- Base de referencia para nuevos entrenamientos: sirve como punto de partida para ajustar una política ACT con datos propios usando `lerobot-train`, modificando el dataset y el tipo de robot.
- Validación de pipelines de LeRobot: útil para verificar la instalación, calibración de hardware y comunicación con el robot antes de entrenar políticas más complejas.
- Docencia y experimentación en aprendizaje por imitación: su tamaño reducido (51,7 M de parámetros) y su licencia Apache 2.0 lo hacen apropiado para laboratorios y cursos que quieran reproducir el método ACT de extremo a extremo.
- Pruebas de integración de cámaras y sensores: el modelo consume una imagen de muñeca y un vector de estado, lo que permite validar la sincronización y el preprocesado de observaciones en un robot real.
- Benchmark interno de tareas de manipulación: al estar entrenado sobre un dataset concreto y documentado (30 episodios, 31.936 frames), puede usarse como línea base para comparar variantes de arquitectura o de datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación en robot real (*"No evaluation results have been provided for this policy yet"*), por lo que no existen tasas de éxito, métricas de error de acción ni comparaciones cuantitativas con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con 51,7 M de parámetros en safetensors (aproximadamente 0,2 GB de pesos en FP32), la inferencia cabe holgadamente en cualquier GPU consumer con 4 GB o más.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA (RTX 3060, RTX 4090, A100, H100); el cuello de botella real es la latencia de captura de cámara y comunicación con el robot, no el cómputo del modelo.
- Cabe en GPU consumer: sí, en cualquier GPU con al menos 4 GB de VRAM; también es viable en CPU para pruebas no críticas.
- Opciones de despliegue: `lerobot-rollout` (CLI oficial de LeRobot) con `--policy.path=Ehdgksl12/act_policy`; entrenamiento con `lerobot-train`.
- Latencia y throughput estimados: no disponibles en la información proporcionada; dependen del hardware del robot, de la cámara (30 FPS en el dataset) y del bucle de control.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ehdgksl12/act_policy | 51,7 M | no aplica | Pick-and-place con ACT | Apache 2.0 | Hugging Face |
| Otras políticas ACT en LeRobot Hub | variable | no aplica | Manipulación por imitación | variable (habitualmente Apache 2.0) | Hugging Face |
| Políticas Diffusion Policy (LeRobot) | variable | no aplica | Manipulación por imitación | variable | Hugging Face |
| Políticas VLA (p. ej. OpenVLA) | >1 B | variable | Manipulación guiada por lenguaje | variable | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada. La comparación se limita a categoría, tamaño y licencia; para una evaluación cuantitativa sería necesario ejecutar cada política en el mismo robot y tarea.

## Limitaciones y advertencias

- Modelo altamente específico: entrenado únicamente para la tarea "Pick up the cube and place it on the plate" con un robot `so102_follower` y una sola cámara de muñeca; no generaliza a otras tareas, objetos o configuraciones sin reentrenamiento.
- Sin evaluación publicada: no hay tasas de éxito ni validación en robot real, por lo que su fiabilidad en producción es desconocida.
- Dataset pequeño: 30 episodios y 31.936 frames son insuficientes para capturar variabilidad de iluminación, posiciones de objetos o distracciones; se espera un rendimiento frágil fuera de las condiciones de entrenamiento.
- Dependencia de la cámara: cambios en la resolución, el índice o la calibración de `cam_wrist` pueden degradar o invalidar la política.
- Sin capacidades lingüísticas ni de razonamiento: no debe evaluarse como modelo de lenguaje; los campos de idiomas y contexto no aplican.
- Riesgo de sobreajuste a la posición inicial del cubo y del plato; no se documentan aumentos de datos ni variaciones.
- Licencia Apache 2.0: permite uso comercial y modificación, pero el autor no ofrece garantías ni soporte; la responsabilidad de validación recae en el integrador.
- Sin información sobre sesgos: al ser un modelo de robótica, los sesgos relevantes son de distribución de datos (posiciones, colores, iluminación) más que sociales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Ehdgksl12/act_policy
- Dataset de entrenamiento: https://huggingface.co/datasets/Ehdgksl12/pnp_bluecube_fin_20261121_171926
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=Ehdgksl12/pnp_bluecube_fin_20261121_171926
- Paper ACT: https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía ACT de LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de instalación: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference
