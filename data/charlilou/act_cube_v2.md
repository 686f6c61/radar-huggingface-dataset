# charlilou/act_cube_v2

## Resumen

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación que predice secuencias cortas de acciones (chunks) en lugar de pasos individuales, lo que reduce el error de acumulación y permite un control más estable en tareas de manipulación robótica. El modelo `charlilou/act_cube_v2` es una política entrenada con LeRobot sobre el robot `so_follower` (SO-101) para la tarea concreta "Put the red cube in the bowl", usando dos cámaras (vista superior y muñeca) y un estado proprioceptivo de 6 dimensiones.

Se trata de un modelo de robótica de pequeño tamaño (51.668.614 parámetros, ~0,2 GB en safetensors) entrenado con solo 12 episodios (7016 frames a 30 FPS) durante 2500 pasos. No es un modelo de lenguaje: es una política visuomotora especializada que consume observaciones (estado + dos imágenes RGB de 480×640) y produce acciones de 6 grados de libertad.

Su relevancia es práctica y acotada: sirve como referencia reproducible de un pipeline completo de imitación con LeRobot (grabación de datos, entrenamiento y despliegue en un SO-101 real), y como ejemplo de lo que se puede lograr con datasets muy pequeños cuando la tarea está bien delimitada. No debe confundirse con un modelo generalista; su validez está restringida al robot, la tarea y la configuración de cámaras con los que fue entrenado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con encoder visual y decoder de acciones |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; ventana de observación de imágenes y estado, sin contexto textual) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible (la model card indica "[More Information Needed]") |
| Formato de pesos | safetensors |
| Tipo de robot | `so_follower` (SO-101) |
| Camaras | `top`, `wrist` (3, 480, 640) |
| Entrada de estado | `observation.state` (6,) |
| Salida de accion | `action` (6,) |
| Dataset de entrenamiento | `charlilou/so101_cube_v2` (12 episodios, 7016 frames, 30 FPS) |
| Pasos de entrenamiento | 2500 |
| Batch size | 16 |
| Optimizador | AdamW |
| Learning rate | 1e-05 |
| Seed | 1000 |
| Version de LeRobot | 0.7.1 |
| Tamano del repo | 0.2 GB |

## Arquitectura y entrenamiento

El modelo implementa ACT, un método de aprendizaje por imitación presentado en el paper arXiv:2304.13705. La arquitectura combina un encoder visual (procesa las dos cámaras, `top` y `wrist`, a resolución 480×640) con un transformer que fusiona las representaciones visuales con el estado proprioceptivo de 6 dimensiones y genera un chunk de acciones de 6 dimensiones. Predecir chunks en lugar de pasos aislados mitiga el error de compounding y produce trayectorias más suaves, algo especialmente relevante en manipulación fina.

El entrenamiento se realizó con LeRobot 0.7.1 sobre el dataset `charlilou/so101_cube_v2`, compuesto por 12 episodios teleoperados (7016 frames a 30 FPS) de la tarea "Put the red cube in the bowl". Se usaron 2500 pasos, batch size 16, optimizador AdamW y learning rate 1e-05, con semilla 1000. No se documenta el uso de RLHF, DPO ni datos adicionales; es aprendizaje supervisado puro sobre demostraciones. No se especifican innovaciones técnicas adicionales más allá del propio mecanismo de action chunking.

## Capacidades

- Control visuomotor de un robot SO-101 (`so_follower`) para la tarea de recoger un cubo rojo y depositarlo en un cuenco.
- Fusión de dos vistas de cámara (`top` y `wrist`) con estado proprioceptivo de 6 dimensiones.
- Predicción de chunks de acciones de 6 dimensiones, lo que aporta suavidad y estabilidad en la ejecución.
- Aprendizaje por imitación a partir de datos teleoperados; no requiere definición explícita de recompensas.
- Despliegue mediante `lerobot-rollout` con `--strategy.type=base` para ejecución en tiempo real.
- No soporta tool calling, function calling, agentes multi-paso, razonamiento simbólico ni capacidades multilingües: es una política robótica especializada, no un modelo de lenguaje.
- No dispone de modo thinking, visión general, audio ni otras capacidades fuera del ámbito visuomotor.

## Casos de uso

- Recogida de objetos en línea de montaje: el modelo ejecuta la secuencia "coger cubo rojo y depositarlo en cuenco" con las dos cámaras como entrada, adecuado para tareas de pick-and-place repetitivas en un SO-101.
- Referencia reproducible para formación: sirve como ejemplo completo de pipeline LeRobot (dataset, entrenamiento de 2500 pasos, despliegue con `lerobot-rollout`) para equipos que quieran replicar el flujo con sus propios datos.
- Base para fine-tuning en tareas similares: al ser un checkpoint ACT pequeño (51,7 M de parámetros), se puede reentrenar con nuevos datasets de manipulación de objetos sobre el mismo robot.
- Validación de hardware y calibración: útil para comprobar que las cámaras `top` y `wrist`, el puerto del robot y la frecuencia de 30 FPS están correctamente configurados antes de escalar a tareas más complejas.
- Investigación en aprendizaje por imitación con datos escasos: permite estudiar el comportamiento de ACT con solo 12 episodios y 7016 frames, un régimen de baja disponibilidad de datos.
- Demostraciones educativas: adecuado para talleres y cursos sobre robótica de imitación, dado su tamaño reducido (0,2 GB) y su integración directa con LeRobot.
- Pruebas de robustez ante cambios de iluminación o posición del objeto: al no haber evaluación publicada, puede usarse como punto de partida para medir la degradación fuera de la distribución de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet." No se dispone de tasas de éxito, número de ensayos ni comparaciones cuantitativas con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 51,7 M de parámetros y pesos safetensors de ~0,2 GB, la inferencia cabe holgadamente en GPUs de consumo (por debajo de 1 GB de VRAM en FP32, y menos aún en FP16).
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA es suficiente; una RTX 3060, RTX 4090 o superior no suponen cuello de botella para este tamaño. También es viable en CPU para inferencia, aunque la latencia de control a 30 FPS debe validarse.
- Cabe en GPU de consumo: sí, en cualquier GPU moderna con al menos 2 GB de VRAM; incluso en iGPU o CPU con margen.
- Opciones de despliegue: `lerobot-rollout` (comando documentado en la model card) con `--strategy.type=base`; el ecosistema LeRobot es la vía principal. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de política.
- Latencia y throughput estimados: no disponibles. El control se ejecuta a 30 FPS según la configuración del dataset, pero no se publican mediciones de latencia por paso ni throughput.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `charlilou/act_cube_v2` | 51.668.614 | Estado (6,) + 2 imagenes 480×640 | Pick-and-place de cubo rojo en SO-101 | no disponible | Hugging Face (LeRobot) |
| ACT (paper original, arXiv:2304.13705) | no disponible en la informacion | Configuracion variable segun implementacion | Manipulacion general con action chunking | no disponible | Paper y codigo de referencia |
| Otras politicas LeRobot (p. ej. Diffusion Policy, TDMPC) | no disponible en la informacion | Variable | Manipulacion robotica | variable | Hugging Face / LeRobot |

No se dispone de datos cuantitativos para comparar rendimiento con alternativas; la comparativa se limita a parámetros, tipo de entrada y licencia. Cualquier comparación de tasas de éxito requeriría evaluaciones en robot real que no se han publicado.

## Limitaciones y advertencias

- Especialización extrema: la política está entrenada únicamente para "Put the red cube in the bowl" con el robot `so_follower` y las cámaras `top` y `wrist`; fuera de esa configuración no hay garantía de funcionamiento.
- Dataset muy pequeño: 12 episodios y 7016 frames implican un riesgo alto de sobreajuste y baja generalización a nuevas posiciones, iluminación o distractores.
- Sin evaluación publicada: no hay tasas de éxito ni número de ensayos, por lo que no se puede afirmar su fiabilidad en producción.
- Licencia no especificada: la model card indica "[More Information Needed]", lo que impide confirmar el uso comercial; debe aclararse con el autor antes de cualquier despliegue productivo.
- Dependencia de hardware y calibración: requiere un SO-101 correctamente calibrado, puerto serie y cámaras con índices y nombres que coincidan con las claves de observación (`observation.images.top`, `observation.images.wrist`).
- Sin capacidades de lenguaje: no procesa texto ni mantiene conversaciones; no es apto para tareas de NLP, razonamiento o generación de código.
- Riesgo de alucinación en el sentido robótico: puede ejecutar acciones incorrectas o inseguras ante observaciones fuera de distribución; se recomienda supervisión y parada de emergencia.
- Sesgos: no documentados; al derivarse de demostraciones humanas, puede heredar sesgos de la persona que teleoperó los datos.
- Idiomas: no aplica; no es un modelo lingüístico.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/charlilou/act_cube_v2
- Dataset de entrenamiento: https://huggingface.co/datasets/charlilou/so101_cube_v2
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=charlilou/so101_cube_v2
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de comandos: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Repositorio LeRobot: https://github.com/huggingface/lerobot
