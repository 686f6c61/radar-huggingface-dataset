# AdamAxelrod/basler_stage_touch_2026-11_delta_act

## Resumen

`AdamAxelrod/basler_stage_touch_2026-11_delta_act` es una política de imitación para robótica basada en Action Chunking with Transformers (ACT), el método presentado por Zhao et al. en el artículo arXiv:2304.13705. El modelo lo publica el usuario AdamAxelrod en HuggingFace Hub y se ha entrenado y exportado con la librería LeRobot de HuggingFace. No es un modelo de lenguaje: es una política visomotora que, a partir de una imagen de microscopio y del estado articular del robot, predice una secuencia corta de acciones de control.

El modelo está especializado en una única tarea, `move_pipette_to_target`, sobre un robot `meca500_basler` equipado con una cámara de microscopio (`microscope_cam`). Consume un vector de estado de 6 dimensiones y una imagen RGB de 640x427, y produce acciones de 7 dimensiones. Se entrenó a partir de 206 episodios de teleoperación (92.339 fotogramas a 20 FPS) recogidos en el dataset `AdamAxelrod/basler_stage_touch_dataset_2026-11_delta`.

Su relevancia es acotada pero concreta: sirve como ejemplo reproducible de un pipeline completo de aprendizaje por imitación con LeRobot para manipulación de precisión en un entorno de microscopio, y como punto de partida para quien quiera reentrenar o evaluar una política ACT sobre hardware similar. El repositorio es pequeño (0,2 GB) y el checkpoint tiene 51.597.959 parámetros en formato safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con encoder visual y decoder de acciones |
| Parametros totales | 51.597.959 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (no aplica; política de imitación por chunk de acciones) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería LeRobot) |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que predice fragmentos cortos de acciones (action chunks) en lugar de un único paso, lo que reduce el error de acumulación y mejora la estabilidad del control. La arquitectura combina un encoder visual (procesa la imagen `observation.images.microscope_cam` de 3x640x427) con un transformer que fusiona la observación del estado (vector de 6 dimensiones) y genera la secuencia de acciones de salida (7 dimensiones). El entrenamiento es supervisado sobre demostraciones de teleoperación, sin RLHF ni DPO.

La configuración de entrenamiento reportada es: 100.000 pasos, batch size 8, optimizador AdamW, learning rate 1e-5, semilla 1000 y LeRobot 0.6.2. El dataset contiene 206 episodios y 92.339 fotogramas a 20 FPS para la tarea `move_pipette_to_target`. No se documentan innovaciones adicionales como decodificación especulativa o atención lineal; el interés técnico está en el propio esquema de chunking de acciones y en el pipeline LeRobot.

## Capacidades

- Control visomotor de precisión: genera acciones de 7 grados de libertad a partir de una imagen de microscopio y del estado del robot.
- Aprendizaje por imitación de una tarea concreta: `move_pipette_to_target` sobre el robot `meca500_basler`.
- Predicción de chunks de acciones para reducir el error acumulado en secuencias largas.
- Integración con el ecosistema LeRobot: rollout, entrenamiento y evaluación mediante CLI (`lerobot-rollout`, `lerobot-train`).
- No soporta tool calling, function calling, agentes multi-paso, razonamiento textual ni capacidades multilingües; no es un modelo generativo de texto.
- No incluye modo thinking, visión general, audio ni otras capacidades fuera del control robótico.

## Casos de uso

- Manipulación de precisión en microscopio: la política mueve una pipeta hasta un objetivo guiándose por la cámara de microscopio, adecuada para tareas de micro-manipulación donde la realimentación visual de alta resolución es crítica.
- Automatización de laboratorio: integrada en una estación con robot Meca500 y cámara Basler, puede ejecutar de forma repetible la tarea de posicionamiento de pipeta en protocolos de laboratorio.
- Base para reentrenamiento con LeRobot: sirve como referencia para entrenar políticas ACT sobre nuevos datasets con el mismo esquema de observaciones y acciones.
- Evaluación de pipelines de imitación: útil para comparar configuraciones de entrenamiento (pasos, batch, learning rate) sobre una tarea acotada y medible.
- Prototipado de control visomotor: permite validar la cadena completa cámara-robot-política antes de escalar a tareas más complejas.
- Docencia y reproducción: ejemplo pequeño (0,2 GB, 51,6 M de parámetros) para demostrar el flujo completo de LeRobot en cursos o talleres de robótica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que aún no se han proporcionado resultados de evaluación en robot real para esta política.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 51,6 M de parámetros y una imagen de entrada de 640x427, la huella es reducida y cabe holgadamente en GPUs de consumo, aunque no se documenta una cifra concreta.
- GPU recomendadas: no disponible; por tamaño, cualquier GPU con soporte CUDA es suficiente, pero el fabricante no especifica modelos.
- Cabe en GPU de consumo: probablemente sí por el tamaño del checkpoint, aunque no se confirma en la documentación.
- Opciones de despliegue: LeRobot (`lerobot-rollout`) sobre el robot `meca500_basler`; no se documentan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles; el dataset se grabó a 20 FPS, pero no se reporta la latencia de inferencia en el robot.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| basler_stage_touch_2026-11_delta_act (este) | 51,6 M | no aplica | move_pipette_to_target (meca500_basler) | Apache 2.0 | HuggingFace |
| Políticas ACT genéricas de LeRobot | variable | no aplica | tareas de manipulación diversas | Apache 2.0 | HuggingFace / LeRobot |
| Políticas Diffusion Policy | variable | no aplica | manipulación visomotora | según repo | HuggingFace / LeRobot |

No se dispone de datos de rendimiento comparables entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Especialización extrema: la política solo se ha entrenado para la tarea `move_pipette_to_target` y el robot `meca500_basler`; no generaliza a otras tareas ni a otros robots sin reentrenamiento.
- Sin evaluación publicada: no hay resultados de éxito en robot real, por lo que se desconoce su fiabilidad en producción.
- Dependencia del entorno: cambios en iluminación, posición de la cámara, calibración del robot o del microscopio pueden degradar el rendimiento.
- Sin datos de sesgos: no se documentan sesgos, pero al ser una política de imitación hereda las limitaciones y posibles sesgos de las demostraciones de teleoperación.
- Riesgo de fallo silencioso: como toda política de imitación, puede producir acciones plausibles pero incorrectas sin señal de error explícita.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las dependencias de LeRobot y del dataset asociado.
- Sin soporte de texto ni multilingüe: no debe emplearse como modelo de lenguaje ni en tareas fuera del control robótico.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AdamAxelrod/basler_stage_touch_2026-11_delta_act
- Dataset de entrenamiento: https://huggingface.co/datasets/AdamAxelrod/basler_stage_touch_dataset_2026-11_delta
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=AdamAxelrod/basler_stage_touch_dataset_2026-11_delta
- Paper ACT: https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de instalación: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia: https://huggingface.co/docs/lerobot/main/en/inference
