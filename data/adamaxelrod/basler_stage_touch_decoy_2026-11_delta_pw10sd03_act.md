# AdamAxelrod/basler_stage_touch_decoy_2026-11_delta_pw10sd03_act

## Resumen

`AdamAxelrod/basler_stage_touch_decoy_2026-11_delta_pw10sd03_act` es una política de imitación robótica entrenada con el método Action Chunking with Transformers (ACT), publicado en el paper arXiv:2304.13705 y distribuida a través del ecosistema LeRobot de Hugging Face. El modelo aprende a partir de datos de teleoperación y predice fragmentos cortos de acciones (action chunks) en lugar de pasos individuales, lo que reduce el error de acumulación y suele lograr tasas de éxito altas en tareas de manipulación.

El modelo está especializado en una única tarea concreta: `move_pipette_to_target`, ejecutada sobre un robot de tipo `meca500_basler` equipado con una cámara de microscopio (`microscope_cam`). Consume una observación de estado de 6 dimensiones y una imagen RGB de 3x640x427 píxeles, y produce una acción de 7 dimensiones (típicamente 6 grados de libertad más el estado del gripper). Con 51.597.959 parámetros y un tamaño de repositorio de 0,2 GB, es un modelo compacto orientado a inferencia en tiempo real a 20 FPS.

La relevancia de esta ficha es acotada: no se trata de un modelo de lenguaje generalista, sino de un artefacto de investigación muy específico, con 0 descargas y 0 likes en el momento de la consulta, sin resultados de evaluación publicados y entrenado sobre un dataset privado del propio autor. Es útil como referencia de cómo se estructura una política ACT en LeRobot y como plantilla reproducible para experimentos de imitación en robótica de precisión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con codificador visual y decodificador de acciones |
| Parametros totales | 51.597.959 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; política de imitación por chunks de acción) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje; las instrucciones de tarea son cadenas fijas como `move_pipette_to_target`) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (repositorio LeRobot) |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que combina un backbone transformer con un esquema de predicción por chunks: en lugar de predecir una sola acción por paso de tiempo, el modelo emite un bloque de acciones futuras, lo que mitiga el sesgo de acumulación de errores típico de las políticas paso a paso. La entrada incluye el estado propioceptivo del robot (`observation.state`, vector de 6 dimensiones) y la observación visual de la cámara de microscopio (`observation.images.microscope_cam`, tensor 3x640x427). La salida es un vector de acción de 7 dimensiones.

El entrenamiento se realizó con LeRobot 0.6.2 sobre el dataset `AdamAxelrod/basler_stage_touch_decoy_2026-11_delta`, compuesto por 100 episodios y 47.151 frames grabados a 20 FPS, todos ellos de la tarea `move_pipette_to_target`. La configuración reportada es de 100.000 pasos de entrenamiento, batch size 8, optimizador AdamW, learning rate 1e-05 y semilla 1000. No se documenta en la model card el uso de RLHF, DPO ni técnicas de refinamiento posteriores; se trata de imitación supervisada pura sobre demostraciones teleoperadas.

## Capacidades

- Generación de comandos de acción de 7 dimensiones para un robot `meca500_basler` con cámara de microscopio.
- Predicción de chunks de acción (action chunking) para reducir el error acumulado en horizontes largos.
- Aprendizaje por imitación a partir de demostraciones teleoperadas (no requiere recompensas ni entorno simulado).
- Ejecución de la tarea específica `move_pipette_to_target` en un entorno de laboratorio con pipetas.
- Integración nativa con el stack LeRobot (`lerobot-rollout`, `lerobot-train`).
- No soporta tool calling, function calling, agentes multi-paso, razonamiento simbólico ni capacidades multilingües; es una política visuomotora, no un modelo de lenguaje.

## Casos de uso

- Automatización de manipulación de pipetas en laboratorio: el modelo puede ejecutar la tarea `move_pipette_to_target` sobre un robot `meca500_basler`, sustituyendo la teleoperación manual en rutinas repetitivas de dosificación o transferencia de líquidos.
- Reproducción de experimentos de imitación: sirve como referencia reproducible para validar el pipeline ACT de LeRobot con un dataset de 100 episodios y 47.151 frames, útil para comparar hiperparámetros o variantes del método.
- Base para fine-tuning en tareas similares: al estar entrenado sobre observaciones de microscopio y estado de 6 dimensiones, puede servir como inicialización para tareas de micro-manipulación con el mismo hardware.
- Docencia y formación en robótica de imitación: el modelo y su dataset asociado permiten ilustrar el ciclo completo grabación → entrenamiento → despliegue con `lerobot-rollout`.
- Benchmark interno de políticas ACT: con 51,6 M de parámetros y 0,2 GB de repositorio, es ligero enough para iterar rápidamente en estaciones de trabajo con una sola GPU.
- Prototipado de control visuomotor de precisión: la combinación de cámara de microscopio y acción de 7 dimensiones lo hace adecuado para experimentos que requieran realimentación visual de alta resolución.
- Integración en pipelines de investigación reproducibles: al usar licencia Apache 2.0 y formato safetensors, puede incorporarse a flujos de evaluación automatizada sin restricciones de licencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye explícitamente la frase «No evaluation results have been provided for this policy yet», por lo que no existen tasas de éxito en robot real, comparativas con otras políticas ni métricas de error de acción reportadas por el autor.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 para los 51,6 M de parámetros; en la práctica, el cuello de botella es el codificador visual y el pipeline de captura de cámara, no el peso del modelo.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente; se ha documentado entrenamiento con `--policy.device=cuda`, por lo que se asume compatibilidad con GPUs NVIDIA consumer (RTX 3060, RTX 4060, RTX 4090) y profesionales (A100, H100) sin problema.
- Cabe holgadamente en GPU consumer: sí, en cualquier GPU moderna con soporte CUDA; también es viable en CPU para inferencia, aunque la latencia a 20 FPS puede no cumplirse.
- Opciones de despliegue: LeRobot (`lerobot-rollout` con `--strategy.type=base`), integración con el stack de Hugging Face; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput estimados: el dataset fue grabado a 20 FPS y el modelo está pensado para control en tiempo real a esa frecuencia; no se publican medidas de latencia por paso ni throughput medido.

## Comparativa con modelos similares

| Modelo | Parámetros | Tipo | Tarea | Licencia | Estado |
|---|---|---|---|---|---|
| `AdamAxelrod/basler_stage_touch_decoy_2026-11_delta_pw10sd03_act` | 51,6 M | ACT | `move_pipette_to_target` sobre `meca500_basler` | Apache 2.0 | 0 descargas, sin evaluación publicada |
| Políticas ACT de referencia en LeRobot | variable | ACT | tareas Aloha / Koch / SO-100 | Apache 2.0 | disponibles en el Hub de LeRobot |
| Políticas Diffusion Policy en LeRobot | variable | Diffusion Policy | manipulación diversa | Apache 2.0 | disponibles en el Hub de LeRobot |
| Políticas VQ-BeT en LeRobot | variable | VQ-BeT | manipulación diversa | Apache 2.0 | disponibles en el Hub de LeRobot |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada; la comparación se limita a tipo de método, licencia y disponibilidad.

## Limitaciones y advertencias

- Sesgos conocidos: al entrenarse sobre un único dataset de 100 episodios y una única tarea, el modelo está fuertemente sesgado hacia las condiciones de iluminación, posiciones de objeto y configuración de cámara del dataset original; generalizará mal fuera de ese dominio.
- Riesgo de alucinación: en el contexto de políticas de imitación, se traduce en acciones plausibles pero incorrectas cuando la observación se sale de la distribución de entrenamiento; no hay mecanismo de verificación ni de rechazo.
- Limitaciones de contexto e idioma: no es un modelo de lenguaje; no procesa instrucciones en lenguaje natural más allá de la cadena fija de tarea, y no admite múltiples tareas.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el dataset asociado (`AdamAxelrod/basler_stage_touch_decoy_2026-11_delta`) debe verificarse por separado antes de un uso comercial, ya que puede contener datos del entorno del autor.
- Caveat para producción: sin resultados de evaluación publicados (0 trials, 0 successes reportados) no es posible estimar la tasa de éxito real; desplegarlo en un entorno de producción sin una evaluación propia en robot real es arriesgado.
- Dependencia de hardware específico: requiere un robot `meca500_basler` y una cámara con las mismas claves de observación (`observation.images.microscope_cam`) y resolución 640x427; cambiar la cámara o la resolución invalida la política.
- Fecha de creación futura (2026-11-05): el repositorio tiene marcas temporales posteriores a la fecha actual de muchas herramientas, lo que puede indicar un entorno de pruebas o un artefacto sintético; conviene verificar la integridad antes de confiar en él.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AdamAxelrod/basler_stage_touch_decoy_2026-11_delta_pw10sd03_act
- Dataset de entrenamiento: https://huggingface.co/datasets/AdamAxelrod/basler_stage_touch_decoy_2026-11_delta
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=AdamAxelrod/basler_stage_touch_decoy_2026-11_delta
- Paper ACT (arXiv:2304.13705): https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de instalación: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference
