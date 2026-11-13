# mrodher/policy_test_V8

## Resumen

`mrodher/policy_test_V8` es una política de imitación robótica entrenada con el método ACT (Action Chunking with Transformers) y publicada en Hugging Face a través de la librería LeRobot. No se trata de un modelo de lenguaje, sino de un controlador visomotor que, a partir de dos cámaras RGB (vista superior y vista de muñeca) y del estado articular del robot, predice comandos de acción de 6 dimensiones para un brazo `so_follower` (SO-101). El modelo resuelve una tarea concreta de manipulación: "put the beige piece on the aruco", es decir, colocar una pieza de color beige sobre un marcador ArUco.

El modelo tiene 51.668.614 parámetros y un tamaño de repositorio de 0,2 GB, lo que lo sitúa en el rango de políticas ligeras aptas para inferencia en tiempo real en hardware de consumo. Fue entrenado durante 20.000 pasos con batch size 8, optimizador AdamW y learning rate 1e-5 sobre un dataset propio de 150 episodios y 42.406 frames a 30 FPS. La fecha de creación del repositorio (13 de noviembre de 2026) y el nombre del dataset (`so101_dataset_test_V8_20261112_124525`) sugieren que se trata de un experimento de validación interna más que de un modelo listo para producción.

Su relevancia es acotada: sirve como ejemplo reproducible del flujo de entrenamiento y despliegue de LeRobot con ACT, y como referencia para quien quiera adaptar la receta a su propio robot SO-101. No es un modelo generalista ni compite con políticas fundacionales de robótica; su utilidad está ligada a la tarea y al hardware concretos con los que fue entrenado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con encoder visual y decoder de acciones |
| Parametros totales | 51.668.614 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (política de imitación, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan variantes GGUF/INT8) |
| Idiomas soportados | no aplica (modelo robótico; la tarea se especifica en inglés: "put the beige piece on the aruco") |
| Licencia | no disponible |
| Formato de pesos | safetensors (repo de 0,2 GB, librería `lerobot`) |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación presentado en el paper arXiv:2304.13705 (Zhao et al., 2023). La política combina un backbone transformer que procesa las observaciones (estado articular de 6 dimensiones y dos imágenes RGB de 3×480×640 procedentes de las cámaras `top` y `wrist`) con un decoder que predice *chunks* de acciones de corto horizonte en lugar de un único paso. Esta predicción por bloques reduce el error de compounding y suaviza la ejecución, y es la razón por la que ACT alcanza tasas de éxito altas en tareas de manipulación con datos de teleoperación.

El entrenamiento se realizó con LeRobot 0.6.2 sobre el dataset `mrodher/so101_dataset_test_V8_20261112_124525`: 150 episodios, 42.406 frames a 30 FPS, una única tarea ("put the beige piece on the aruco") y robot `so_follower`. La configuración reportada es de 20.000 pasos, batch size 8, AdamW, learning rate 1e-5 y semilla 1000. No se documenta composición del dataset más allá del número de episodios y frames, ni se menciona uso de RLHF, DPO ni aumentos de datos. Tampoco se especifican detalles del backbone visual (tipo de encoder, resolución de entrada tras preprocesado) ni el horizonte exacto de *chunking*.

## Capacidades

- Control visomotor de un brazo robótico `so_follower` (SO-101) a partir de dos cámaras RGB (`top` y `wrist`) y del estado articular de 6 dimensiones.
- Predicción de acciones de 6 dimensiones (posición/articulaciones) en *chunks*, orientada a ejecución en tiempo real a 30 FPS.
- Ejecución de una única tarea de manipulación: colocar una pieza beige sobre un marcador ArUco.
- Aprendizaje por imitación a partir de datos de teleoperación; no requiere definición explícita de recompensas.
- Integración nativa con el ecosistema LeRobot (`lerobot-rollout`, `lerobot-train`, visualización de datasets en Spaces).
- No soporta tool calling, function calling, agentes multi-paso, razonamiento simbólico ni capacidades multilingües: es una política de control, no un modelo de lenguaje.

## Casos de uso

- **Automatización de una celda de pick-and-place con SO-101**: la política se ejecuta con `lerobot-rollout` sobre el robot real y reproduce la tarea de colocar la pieza beige sobre el ArUco, útil como demo de extremo a extremo del stack LeRobot.
- **Validación de un pipeline de imitación antes de escalar**: sirve para comprobar que la grabación de datos, el formateo del dataset y el entrenamiento ACT funcionan correctamente antes de invertir en datasets mayores o tareas más complejas.
- **Prototipado rápido de nuevas tareas de manipulación**: dado que el entrenamiento completo son 20.000 pasos con batch 8, se puede reentrenar la receta con un dataset propio de pocas horas de teleoperación para una tarea nueva del mismo robot.
- **Banco de pruebas de hardware y calibración**: al depender de las cámaras `top` y `wrist` y del estado articular, permite verificar la calibración de cámaras, la latencia del bus de control y la tasa de refresco a 30 FPS.
- **Docencia y formación en robótica de imitación**: el repositorio, el dataset y la configuración de entrenamiento están publicados, lo que lo convierte en un ejemplo reproducible para cursos o talleres sobre LeRobot y ACT.
- **Investigación comparativa de métodos de imitación**: puede usarse como línea base ACT frente a otros métodos (Diffusion Policy, VQ-BeT, etc.) sobre el mismo dataset y robot, siempre que se reentrene con la misma configuración.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: *"No evaluation results have been provided for this policy yet."* No hay tasas de éxito en robot real, ni comparaciones con otras políticas sobre el mismo dataset, ni métricas de latencia o throughput medidas.

## Requisitos de hardware

- **VRAM estimada para inferencia**: el modelo tiene 51,7 M de parámetros en safetensors (≈0,2 GB en FP32). En FP32 cabría en menos de 1 GB de VRAM; en FP16 o BF16, en torno a 0,1 GB. A esto hay que sumar el coste de los dos encoders visuales a 480×640, que dominan el uso de memoria en inferencia.
- **GPU recomendadas**: cualquier GPU con al menos 4-8 GB de VRAM es suficiente para la política; una RTX 3060/4060 o superior es más que adecuada. Para entrenamiento, una RTX 4090 o A100 acelera los 20.000 pasos, aunque el modelo es lo bastante pequeño para entrenar en GPUs de consumo.
- **¿Cabe en GPU de consumo?**: sí, con holgura. El cuello de botella no es la memoria sino la latencia de captura de las dos cámaras y del bus del robot.
- **Opciones de despliegue**: `lerobot-rollout` (CLI oficial de LeRobot) con `--policy.path=mrodher/policy_test_V8`; también se puede cargar con la API de Python de LeRobot. No se documentan exportaciones a ONNX, TensorRT, llama.cpp ni Ollama (no aplican a este tipo de modelo).
- **Latencia y throughput**: no disponibles. La model card no reporta tiempos de inferencia; la ejecución está pensada para 30 FPS (33 ms por frame) según la tasa del dataset.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto / horizonte | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `mrodher/policy_test_V8` | ACT (LeRobot) | 51,7 M | no aplica; *chunking* de acciones | no disponible | Hugging Face, repo público |
| ACT oficial (LeRobot) | ACT | ~50 M (configuración por defecto) | no aplica | Apache-2.0 (LeRobot) | Hugging Face / GitHub |
| Diffusion Policy | Política de difusión | variable (decenas de M) | no aplica | MIT (implementación de referencia) | GitHub / Hugging Face |
| VQ-BeT | Política con cuantización vectorial | variable | no aplica | MIT | GitHub |

La comparación es aproximada: no hay benchmarks públicos de `policy_test_V8` frente a estas alternativas, y las diferencias de rendimiento dependen fuertemente del dataset y del robot. La principal ventaja de este repositorio es la reproducibilidad del pipeline LeRobot; su principal desventaja frente a las implementaciones oficiales es la ausencia de licencia declarada y de resultados de evaluación.

## Limitaciones y advertencias

- **Licencia no especificada**: la model card deja la licencia como `[More Information Needed]`. Sin licencia explícita, el uso comercial y la redistribución son jurídicamente ambiguos; conviene contactar con el autor antes de cualquier uso en producción.
- **Sin evaluación publicada**: no hay tasas de éxito en robot real, ni número de ensayos, ni condiciones de dificultad. No se puede afirmar que la política funcione de forma fiable.
- **Sobreajuste a la tarea y al hardware**: entrenada para una única tarea ("put the beige piece on the aruco") sobre un `so_follower` con cámaras `top` y `wrist` concretas. Cambiar la posición de las cámaras, la iluminación, los objetos o el robot invalida la política.
- **Riesgo de alucinación motora**: como toda política de imitación, puede generar acciones plausibles pero incorrectas en estados fuera de distribución; no hay mecanismo de verificación ni de rechazo.
- **Dataset pequeño**: 150 episodios y 42.406 frames son un volumen modesto; la diversidad de posiciones, iluminación y distractores es limitada.
- **Sin soporte multilingüe ni de texto**: la tarea se especifica en inglés y el modelo no procesa lenguaje natural; no es un modelo de propósito general.
- **Fecha de creación futura**: el repositorio figura creado el 13 de noviembre de 2026, lo que sugiere que es un artefacto de pruebas (`policy_test_V8`) y no un modelo estable.
- **Cero descargas y cero likes**: no hay evidencia de uso externo ni de validación por la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mrodher/policy_test_V8
- Dataset de entrenamiento: https://huggingface.co/datasets/mrodher/so101_dataset_test_V8_20261112_124525
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=mrodher/so101_dataset_test_V8_20261112_124525
- Paper de ACT: https://huggingface.co/papers/2304.13705 (arXiv:2304.13705)
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de instalación: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference
