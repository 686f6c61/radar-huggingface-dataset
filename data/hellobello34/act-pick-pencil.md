# hellobello34/act-pick-pencil

## Resumen

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación que predice secuencias cortas de acciones (chunks) en lugar de pasos individuales, lo que reduce el error de acumulación y mejora la estabilidad en tareas de manipulación robótica. Este repositorio concreto, `hellobello34/act-pick-pencil`, es una política entrenada con LeRobot sobre el robot `xlerobot_2wheels` para la tarea específica de coger un lápiz y levantarlo.

El modelo consume el estado de las articulaciones (vector de 16 dimensiones) y dos flujos de vídeo (cámara de cabeza y muñeca izquierda, a 480x640) y produce un vector de acción de 16 dimensiones. Con 51.689.104 parámetros y un tamaño de repositorio de 0,2 GB, es una política compacta orientada a inferencia en tiempo real sobre hardware modesto.

Su relevancia es acotada: no es un modelo de propósito general, sino una política de imitación de un solo task entrenada con 30 episodios (17.565 frames a 15 FPS) durante 20.000 pasos. Resulta útil como referencia práctica de un pipeline completo de LeRobot (grabación de datos, entrenamiento, despliegue) y como punto de partida para experimentos de manipulación con robots de bajo coste.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con encoder visual y decoder de acciones |
| Parámetros totales | 51.689.104 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; entrada fija: estado 16D + 2 imágenes 3x480x640) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (modelo de robótica, sin procesamiento de lenguaje natural) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería `lerobot`) |

## Arquitectura y entrenamiento

ACT es un transformer que mapea observaciones (estado propioceptivo e imágenes de cámaras) a chunks de acciones futuras. La predicción por chunks mitiga el problema de compounding error típico de las políticas que predicen un solo paso, y permite ejecutar acciones de forma más suave y consistente. El modelo incluye un encoder visual para las dos cámaras (`head` y `left_wrist`) y un decoder que genera el vector de acción de 16 dimensiones.

El entrenamiento se realizó con LeRobot 0.6.1 sobre el dataset `hellobello34/xlerobot-pick-pencil`: 30 episodios, 17.565 frames a 15 FPS, una única instrucción de tarea ("Pick up the pencil and lift it."). La configuración fue de 20.000 pasos, batch size 8, optimizador AdamW, learning rate 1e-5 y semilla 1000. No se documenta uso de RLHF, DPO ni aumentos de datos; es aprendizaje por imitación supervisado puro sobre datos de teleoperación.

## Capacidades

- Manipulación robótica de una sola tarea: coger un lápiz y levantarlo con el robot `xlerobot_2wheels`.
- Fusión de percepción visual multi-cámara: procesa simultáneamente las vistas `head` y `left_wrist`.
- Control de acciones en espacio de 16 dimensiones a partir del estado de 16 dimensiones.
- Predicción de chunks de acciones para ejecución suave y estable.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni agentes.
- No tiene capacidades multilingües ni de generación de lenguaje.
- No dispone de modo thinking, visión general, audio ni otras capacidades multimodales más allá de las imágenes de entrada.

## Casos de uso

- Recogida de objetos pequeños en laboratorio: la política se ejecuta con `lerobot-rollout` sobre el robot `xlerobot_2wheels` para recoger y levantar un lápiz, útil como banco de pruebas de manipulación fina.
- Reproducción de una tarea de pick-and-lift en demostraciones: sirve para mostrar el flujo completo de LeRobot (grabación, entrenamiento, despliegue) en talleres y cursos.
- Base para fine-tuning con nuevos objetos: al ser una política ACT entrenada con 30 episodios, es un punto de partida razonable para reentrenar con otros objetos o posiciones usando el mismo pipeline `lerobot-train`.
- Validación de hardware de bajo coste: con 0,2 GB de pesos y 51,7 M de parámetros, permite comprobar el rendimiento de un robot de dos ruedas con dos cámaras en tareas de manipulación.
- Evaluación de robustez visual: al depender de las cámaras `head` y `left_wrist`, sirve para estudiar cómo afectan cambios de iluminación, posición o distractores al éxito de la tarea.
- Integración en pipelines de investigación de imitación: útil para comparar ACT con otros métodos de imitation learning sobre el mismo dataset y robot.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación en robot real ("No evaluation results have been provided for this policy yet.").

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 51,7 M de parámetros en safetensors y un repo de 0,2 GB, la huella es reducida y cabe holgadamente en GPUs consumer.
- GPU recomendadas: no especificadas por el autor. Por tamaño, cualquier GPU con al menos 4-8 GB de VRAM debería ser suficiente; una RTX 3060/4060 o superior es razonable.
- Cabe en GPU consumer: sí, previsiblemente en la mayoría de GPUs modernas con 8 GB o más.
- Opciones de despliegue: LeRobot (`lerobot-rollout`), con soporte de `--policy.device=cuda` para entrenamiento e inferencia. No se documentan vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de política).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entrada | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `hellobello34/act-pick-pencil` | 51,7 M | estado 16D + 2 imágenes 480x640 | Pick and lift de un lápiz | apache-2.0 | HuggingFace (34 descargas) |
| ACT (paper original, 2304.13705) | no disponible en la información | no disponible | Manipulación por imitación (chunks de acciones) | no disponible | Paper |
| Otras políticas LeRobot (p. ej. Diffusion Policy, SmolVLA) | no disponible en la información | no disponible | Manipulación por imitación | no disponible | LeRobot / HuggingFace |

No se dispone de datos comparativos de rendimiento entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Especialización extrema: entrenada para una única tarea ("Pick up the pencil and lift it.") y un único robot (`xlerobot_2wheels`); no generaliza a otras tareas sin reentrenamiento.
- Sin evaluación publicada: no hay tasas de éxito en robot real, por lo que se desconoce su robustez ante cambios de posición, iluminación o distractores.
- Dataset pequeño: 30 episodios y 17.565 frames; riesgo alto de sobreajuste a las condiciones de grabación.
- Dependencia de las cámaras: los nombres y la configuración de las cámaras deben coincidir exactamente con las claves de observación (`head`, `left_wrist`); cualquier cambio invalida la política.
- Sin capacidades de lenguaje, razonamiento ni tool calling; no debe emplearse fuera del ámbito de control robótico.
- Licencia apache-2.0: permite uso comercial, pero el autor no ofrece garantías ni soporte.
- Riesgo de alucinación no aplica en el sentido de generación de texto, pero sí existe riesgo de acciones incorrectas o inseguras en el robot; se recomienda supervisión y límites de seguridad físicos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/hellobello34/act-pick-pencil
- Dataset de entrenamiento: https://huggingface.co/datasets/hellobello34/xlerobot-pick-pencil
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=hellobello34/xlerobot-pick-pencil
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de instalación: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia: https://huggingface.co/docs/lerobot/main/en/inference
