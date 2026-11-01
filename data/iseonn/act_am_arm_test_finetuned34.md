# iseonn/act_am_arm_test_finetuned34

## Resumen

`iseonn/act_am_arm_test_finetuned34` es una política de aprendizaje por imitación basada en ACT (Action Chunking with Transformers) para control robótico, publicada en Hugging Face Hub por el usuario iseonn. No es un modelo de lenguaje: es un modelo de robótica que consume observaciones multimodales (estado articular de 7 dimensiones y dos cámaras RGB de 480x640) y produce acciones de 7 dimensiones para un robot seguidor de tipo `so_follower`. El modelo se ha entrenado con la librería LeRobot de Hugging Face sobre un dataset propio de 21 episodios y 16.872 fotogramas a 30 FPS para la tarea de recogida "pickup1".

El modelo resuelve el problema clásico de manipulación robótica mediante imitación: aprender una política que prediga trozos de acciones (action chunks) en lugar de pasos individuales, lo que reduce el error de acumulación y mejora la estabilidad en tareas de contacto. Su relevancia es acotada: se trata de un artefacto de experimentación personal (25 descargas, 0 likes, sin resultados de evaluación publicados), útil como referencia de cómo se estructura una política ACT en LeRobot y como punto de partida para reentrenar con datos propios.

Con 51.670.663 parámetros totales y un tamaño de repositorio de 0,2 GB, el modelo es ligero y desplegable en hardware modesto. La licencia Apache 2.0 permite uso comercial sin restricciones adicionales, aunque la ausencia de benchmarks y de evaluación en robot real limita seriamente su uso en producción sin validación previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con codificador visual y decodificador de acciones |
| Parametros totales | 51.670.663 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; ventana de observación de política, no contexto de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo robótico, sin capacidades lingüísticas) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Tipo de robot | `so_follower` |
| Cámaras | `wrist`, `top` (RGB 3x480x640) |
| Entrada de estado | `observation.state` (7,) |
| Salida de acción | `action` (7,) |
| Dataset de entrenamiento | `iseonn/am_arm_test34_merged` (21 episodios, 16.872 fotogramas, 30 FPS) |
| Tarea | `pickup1` |
| Versión de LeRobot | 0.6.1 |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación presentado en el paper arXiv:2304.13705 que predice secuencias cortas de acciones (action chunks) en lugar de acciones individuales. La arquitectura combina un codificador visual (procesa las dos imágenes de cámara), un codificador de estado (estado articular de 7 dimensiones) y un transformer que fusiona ambas representaciones para generar el chunk de acciones. Esta formulación reduce el horizonte efectivo de predicción y mitiga el error compuesto típico de las políticas paso a paso.

El entrenamiento se realizó con LeRobot 0.6.1 durante 20.000 pasos, con batch size 8, optimizador AdamW y learning rate 1e-05, semilla 1000. El dataset contiene únicamente 21 episodios teleoperados de la tarea "pickup1", lo que supone un volumen muy reducido para generalización. No se documenta el uso de RLHF, DPO ni técnicas de refinamiento posteriores; es aprendizaje supervisado puro sobre demostraciones. Tampoco se especifican aumentos de datos, composición detallada del dataset ni innovaciones técnicas adicionales más allá de las propias del método ACT.

## Capacidades

- Control robótico de manipulación: genera comandos de 7 dimensiones (posición/orientación y pinza) para un robot `so_follower`.
- Percepción visual multimodal: procesa simultáneamente las cámaras `wrist` y `top` a 480x640 píxeles.
- Predicción de action chunks: emite secuencias de acciones, no pasos aislados, lo que estabiliza la ejecución.
- Aprendizaje por imitación: reproduce la tarea "pickup1" aprendida de demostraciones teleoperadas.
- Integración con LeRobot: se ejecuta mediante `lerobot-rollout` y se reentrena con `lerobot-train`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un modelo puramente motor-visual.
- No dispone de modo thinking, visión general, audio ni generación de texto.

## Casos de uso

- Recogida de objetos en laboratorio: ejecutar la política sobre un `so_follower` real para la tarea "pickup1" y medir la tasa de éxito como base de comparación frente a políticas propias.
- Reentrenamiento con datos propios: usar el repositorio como plantilla de configuración ACT en LeRobot, sustituyendo el dataset por uno mayor y manteniendo la estructura de observaciones y acciones.
- Docencia y formación en imitación robótica: ejemplo reproducible de extremo a extremo (grabación, entrenamiento, rollout) con comandos documentados y dataset público enlazado.
- Benchmark interno de infraestructura: validar pipelines de inferencia robótica, latencia de cámaras y sincronización a 30 FPS antes de escalar a políticas más grandes.
- Prototipado de manipulación de bajo coste: al tener 51,7 M de parámetros y 0,2 GB de pesos, puede ejecutarse en una GPU de consumo para pruebas rápidas de agarre.
- Estudio de sensibilidad a datos: comparar el rendimiento de esta política entrenada con 21 episodios frente a versiones con más datos para analizar el efecto del volumen de demostraciones en ACT.
- Integración en entornos de simulación o gemelos digitales: cargar la política en un bucle de control para depurar el formato de observaciones y acciones antes del despliegue físico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet." No existen tasas de éxito en robot real, ni comparaciones con otras políticas, ni métricas de pérdida de entrenamiento reportadas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 51,7 M de parámetros en FP32 el modelo ocupa aproximadamente 0,2 GB, por lo que la VRAM vendrá dominada por los buffers de imagen y el runtime (estimación orientativa, no confirmada por el autor).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM debería bastar para inferencia; se desconoce la configuración usada en entrenamiento.
- Cabe en GPU de consumo: sí, previsiblemente en GTX 1650, RTX 3050, RTX 4060 y superiores; no confirmado por el autor.
- Opciones de despliegue: LeRobot (`lerobot-rollout`), con soporte de PyTorch y CUDA según la configuración del comando documentado (`--policy.device=cuda` en entrenamiento).
- Latencia y throughput: no disponibles. El control opera a 30 FPS según el dataset, pero no se reporta latencia de inferencia por paso.

## Comparativa con modelos similares

| Modelo | Parámetros | Tipo | Contexto/observación | Licencia | Evaluación publicada |
|---|---|---|---|---|---|
| `iseonn/act_am_arm_test_finetuned34` | 51,7 M | ACT (LeRobot) | 2 cámaras 480x640 + estado (7,) | Apache 2.0 | No |
| ACT original (paper 2304.13705) | no disponible | ACT | Configurable | Investigación (según paper) | Sí, en simulación y robot real |
| Políticas Diffusion Policy (referencia de la categoría) | no disponible | Diffusion | Configurable | no disponible | Sí, en benchmarks de imitación |
| Otras políticas LeRobot del Hub | variable | ACT / Diffusion / VLA | variable | variable | Rara vez |

La comparación cuantitativa no es posible: este modelo carece de evaluación pública, mientras que ACT y Diffusion Policy reportan tasas de éxito en sus papers. Cualquier comparación directa requeriría reentrenar y evaluar en el mismo robot y tarea.

## Limitaciones y advertencias

- Ausencia total de evaluación: no hay tasas de éxito en robot real ni en simulación, por lo que se desconoce si la política funciona más allá del dataset de entrenamiento.
- Dataset muy reducido: 21 episodios y 16.872 fotogramas son insuficientes para generalizar a posiciones de objetos, iluminación o distractores distintos de los vistos.
- Tarea única: entrenada exclusivamente para "pickup1"; no es una política generalista ni multi-tarea.
- Dependencia de hardware específico: asume robot `so_follower` con cámaras `wrist` y `top` a 480x640 y 30 FPS; cambios de cámara o montaje invalidan la política.
- Sin capacidades lingüísticas ni de razonamiento: no debe evaluarse como modelo de lenguaje ni usarse para tareas de texto.
- Riesgo de sobreajuste y comportamiento errático fuera de distribución: típico en imitación con pocos datos, con posible acumulación de error en ejecuciones largas.
- Licencia Apache 2.0: permite uso comercial y modificación, pero no exime de validar el modelo antes de desplegarlo en entornos reales.
- Sin información sobre sesgos: no aplica en el sentido habitual, pero el comportamiento refleja los sesgos de las demostraciones teleoperadas (posiciones, objetos y condiciones concretas).
- Repositorio de carácter personal: 25 descargas y 0 likes sugieren bajo mantenimiento y soporte comunitario limitado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/iseonn/act_am_arm_test_finetuned34
- Dataset de entrenamiento: https://huggingface.co/datasets/iseonn/am_arm_test34_merged
- Paper ACT: https://huggingface.co/papers/2304.13705 (arXiv:2304.13705)
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Visualizador de dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=iseonn/am_arm_test34_merged
