# kobayashi1225/my_policy_record-test_19

## Resumen

`kobayashi1225/my_policy_record-test_19` es una política de robótica basada en ACT (Action Chunking with Transformers), un método de aprendizaje por imitación presentado en el paper arXiv:2304.13705 que predice fragmentos cortos de acciones (*action chunks*) en lugar de pasos individuales. El modelo ha sido entrenado y publicado con LeRobot, la librería de Hugging Face para aprendizaje automático en robótica real, y está diseñado para controlar un robot de tipo `so_follower` (SO-100/SO-101 de bajo coste) equipado con dos cámaras.

Se trata de un modelo de tamaño muy reducido (51.668.614 parámetros, aproximadamente 0,2 GB de pesos en safetensors) especializado en una única tarea concreta: "Pick up red cube" (recoger un cubo rojo). No es un modelo de lenguaje ni un modelo fundacional multimodal; es una política visomotora que mapea observaciones (estado articular de 6 dimensiones e imágenes de dos cámaras a 240x320) a comandos de acción de 6 dimensiones.

Su relevancia es la de un artefacto de referencia para el flujo de trabajo de LeRobot: demuestra el ciclo completo de grabación de datos de teleoperación, entrenamiento de una política ACT y despliegue en hardware real. Al ser un modelo entrenado sobre un dataset pequeño y específico (45 episodios, 26.905 frames), su utilidad práctica está acotada a esa tarea y a ese montaje físico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con codificador visual y decodificador de acciones con chunking |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; entrada fija de observaciones por paso) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje; la tarea se especifica como texto "Pick up red cube") |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería LeRobot) |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que combina un codificador visual (procesa las dos cámaras: `arm` y `side`, con entradas de 3x240x320) con un transformer que genera *action chunks*: secuencias de varias acciones predichas de una vez, lo que reduce el error de acumulación típico de las políticas que predicen paso a paso. La entrada de estado es un vector de 6 dimensiones (`observation.state`) y la salida es un vector de acción de 6 dimensiones (`action`), coherente con un brazo robótico de 6 grados de libertad.

El entrenamiento se realizó con LeRobot 0.5.2 sobre el dataset `kobayashi1225/record-test_19_20261119_170935`: 45 episodios, 26.905 frames a 30 FPS, una única tarea ("Pick up red cube"). La configuración reportada es de 25.000 pasos, batch size 8, optimizador AdamW, learning rate 1e-5 y semilla 1000. No se documenta en la información disponible el uso de RLHF, DPO ni otras fases de ajuste posteriores; ACT es un método puramente supervisado sobre datos de teleoperación.

## Capacidades

- Control visomotor de un brazo robótico `so_follower` de 6 grados de libertad a partir de dos cámaras RGB.
- Predicción de *action chunks*: genera secuencias cortas de acciones en lugar de pasos individuales, lo que mejora la estabilidad del control.
- Ejecución de una tarea concreta de manipulación: recoger un cubo rojo ("Pick up red cube").
- Aprendizaje por imitación a partir de datos de teleoperación (no requiere definición manual de recompensas).
- Integración con el ecosistema LeRobot para entrenamiento, evaluación y despliegue (`lerobot-train`, `lerobot-rollout`).
- No soporta tool calling, function calling, razonamiento multi-paso simbólico, capacidades multilingües ni modos de "thinking".

## Casos de uso

- **Automatización de una celda de pick-and-place de laboratorio**: el modelo ejecuta la tarea de recoger un cubo rojo sobre un robot SO-100/SO-101, adecuado para prototipos de manipulación de bajo coste en entornos controlados.
- **Referencia para el flujo de trabajo de LeRobot**: sirve como ejemplo reproducible de grabación de datos, entrenamiento ACT y despliegue con `lerobot-rollout`, útil para equipos que quieran validar su pipeline antes de entrenar tareas propias.
- **Generación de datos sintéticos de manipulación**: al ejecutar la política de forma repetida se pueden recolectar trayectorias adicionales para ampliar el dataset original de 45 episodios.
- **Docencia y formación en aprendizaje por imitación robótico**: el modelo y su dataset asociado permiten estudiar el efecto del número de episodios, la tasa de frames y la configuración de entrenamiento en el éxito de una política ACT.
- **Pruebas de integración hardware-software**: validar la calibración de cámaras (`arm`, `side`), la latencia del bucle de control a 30 FPS y la comunicación con el robot antes de abordar tareas más complejas.
- **Base para *fine-tuning* de tareas relacionadas**: al ser Apache 2.0 y tener solo ~51,7 M de parámetros, se puede reentrenar rápidamente sobre nuevos datasets de manipulación con objetos o posiciones distintas.
- **Evaluación comparativa de métodos de imitación**: usar este checkpoint ACT como línea base frente a otras políticas (p. ej. Diffusion Policy) sobre el mismo montaje y dataset.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación en robot real para esta política.

## Requisitos de hardware

- **VRAM estimada para inferencia**: con 51,7 M de parámetros, los pesos en fp32 ocupan aproximadamente 0,2 GB; la inferencia cabe holgadamente en cualquier GPU con 2-4 GB de VRAM, incluyendo GPUs integradas o de portátil.
- **GPU recomendadas**: cualquier GPU NVIDIA con soporte CUDA es suficiente; una RTX 3060, RTX 4060 o superior ofrece margen de sobra. Para entrenamiento, una RTX 3090/4090 o A100 acelera los 25.000 pasos, aunque el modelo también se puede entrenar en GPUs de gama media.
- **Consumer GPU**: sí, cabe en cualquier GPU de consumo moderna e incluso en CPU para inferencia (aunque la latencia a 30 FPS puede verse comprometida).
- **Opciones de despliegue**: LeRobot (`lerobot-rollout` con `--strategy.type=base`), que carga el checkpoint safetensors y ejecuta el bucle de control contra el robot `so_follower`. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo.
- **Latencia y throughput**: no disponibles en la información proporcionada; el dataset se grabó a 30 FPS, lo que marca el ritmo de control esperado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| my_policy_record-test_19 (este) | 51,7 M | Estado 6D + 2 imágenes 240x320 | Pick up red cube | Apache 2.0 | Hugging Face (LeRobot) |
| Otras políticas ACT de LeRobot | no disponible | no disponible | Variables por dataset | Apache 2.0 | Hugging Face (LeRobot) |
| Diffusion Policy (referencia metodológica) | no disponible | no disponible | Manipulación visomotora | no disponible | Repositorios académicos |
| Políticas fundacionales robóticas (p. ej. RT-2, OpenVLA) | Órdenes de miles de millones | Multimodal texto+imagen | Múltiples tareas | no disponible | no disponible |

No se dispone de datos comparativos de rendimiento (tasas de éxito, latencia) entre este modelo y alternativas, ya que no se han publicado evaluaciones.

## Limitaciones y advertencias

- **Tarea única y altamente específica**: entrenado exclusivamente para "Pick up red cube" sobre un montaje concreto; no generaliza a otras tareas, objetos o posiciones sin reentrenamiento.
- **Dataset muy pequeño**: 45 episodios y 26.905 frames implican un riesgo elevado de sobreajuste y baja robustez ante variaciones de iluminación, posición de cámara u objetos distractores.
- **Sin evaluación publicada**: no hay tasas de éxito en robot real, por lo que no se puede afirmar su fiabilidad en producción.
- **Dependencia del hardware exacto**: requiere un robot `so_follower` con cámaras `arm` y `side` en la configuración y calibración usadas durante la grabación; cambios en la disposición física degradan el rendimiento.
- **Riesgo de alucinación en el sentido de acciones erróneas**: como toda política de imitación, puede generar comandos incoherentes fuera de la distribución de entrenamiento, con riesgo físico para el robot y el entorno.
- **Sesgos**: no documentados, pero inherentes a los datos de teleoperación de un único operador y entorno.
- **Licencia Apache 2.0**: permite uso comercial y modificación, pero el autor no ofrece garantías ni soporte; el usuario asume la responsabilidad del despliegue.
- **Sin capacidades de lenguaje**: no debe emplearse como modelo conversacional ni para tareas de NLP.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kobayashi1225/my_policy_record-test_19
- Dataset de entrenamiento: https://huggingface.co/datasets/kobayashi1225/record-test_19_20261119_170935
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=kobayashi1225/record-test_19_20261119_170935
- Paper de ACT: https://huggingface.co/papers/2304.13705 (arXiv:2304.13705)
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de instalación: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación y entrenamiento de políticas: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
