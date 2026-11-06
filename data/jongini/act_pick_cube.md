# jongini/act_pick_cube

## Resumen

`jongini/act_pick_cube` es una política de robótica basada en Action Chunking with Transformers (ACT), un método de aprendizaje por imitación presentado en el paper arXiv 2304.13705. El modelo ha sido entrenado y publicado con LeRobot, la librería de Hugging Face para aprendizaje automático en robótica real, y está pensado para controlar un robot seguidor de tipo `so_follower` equipado con dos cámaras (una superior y otra en la muñeca).

La política resuelve una tarea concreta de manipulación: coger un objeto y depositarlo en una taza, según la instrucción "Pick up the <물건> and put it in the cup". En lugar de predecir acciones paso a paso, ACT genera chunks de acciones a corto plazo, lo que mejora la estabilidad y la tasa de éxito en tareas de imitación con datos de teleoperación.

El modelo tiene 51.668.614 parámetros y un tamaño de repositorio de 0,2 GB, lo que lo hace muy ligero y desplegable en hardware modesto. Es relevante como ejemplo práctico de pipeline completo de LeRobot: grabación de datos, entrenamiento de una política ACT y despliegue en robot real mediante `lerobot-rollout`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con codificador visual y decodificador de acciones |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (política de robótica; no aplica ventana de contexto de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (la tarea está descrita en inglés con un marcador en coreano) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que combina un codificador visual (procesa las imágenes de las cámaras `top` y `wrist` a resolución 480x640) con un transformer que predice chunks de acciones en lugar de pasos individuales. La entrada de estado es un vector de 6 dimensiones (`observation.state`) y la salida es un vector de acción también de 6 dimensiones. Esta formulación de chunking reduce el error de acumulación y mejora la suavidad de las trayectorias.

El entrenamiento se realizó con LeRobot 0.6.2 sobre el dataset `jongini/pick_cube`, compuesto por 28 episodios y 19.682 frames a 30 FPS. Se ejecutaron 100.000 pasos de entrenamiento con batch size 8, optimizador AdamW, learning rate 1e-05 y semilla 1000. No se especifica en la información disponible si hubo RLHF, DPO ni otras fases de ajuste; se trata de aprendizaje supervisado a partir de teleoperación.

## Capacidades

- Generación de acciones de control robótico de 6 dimensiones a partir de observaciones multimodales (estado + dos cámaras).
- Predicción de chunks de acciones para tareas de manipulación de corto horizonte.
- Aprendizaje por imitación a partir de datos de teleoperación, sin necesidad de recompensas explícitas.
- Ejecución de la tarea "Pick up the <objeto> and put it in the cup" en un robot `so_follower`.
- Integración con el ecosistema LeRobot para entrenamiento, evaluación y despliegue.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, multilingüismo ni modos de pensamiento, ya que no es un modelo de lenguaje.

## Casos de uso

- Manipulación pick-and-place en laboratorio: el modelo ejecuta la secuencia de coger un objeto y dejarlo en una taza, adecuado para prototipos de investigación en robótica de imitación con bajo coste computacional.
- Reproducción de experimentos ACT: sirve como referencia para validar pipelines de LeRobot y comparar configuraciones de entrenamiento (pasos, batch size, learning rate).
- Base para fine-tuning en tareas similares: al ser una política ligera (51,7 M de parámetros), se puede reentrenar con un dataset propio de pocos episodios para nuevas variantes de pick-and-place.
- Demostraciones educativas: útil en cursos y talleres para mostrar el flujo completo de grabación de datos, entrenamiento y despliegue en robot real con `lerobot-rollout`.
- Evaluación de robustez visual: al usar dos cámaras (top y wrist), permite estudiar el impacto de oclusiones y cambios de iluminación en políticas de imitación.
- Prototipado rápido en hardware de bajo coste: el tamaño reducido del repositorio (0,2 GB) facilita el despliegue en estaciones de trabajo con GPU consumer.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación en robot real para esta política.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 51,7 M de parámetros en precisión completa (fp32) se estiman alrededor de 0,2 GB de pesos, más el coste del codificador visual y los buffers de inferencia.
- GPU recomendadas: no disponible; por tamaño, cualquier GPU con al menos 4-8 GB de VRAM debería ser suficiente, incluyendo RTX 3060, RTX 4090, A100 o H100.
- Compatibilidad con GPU consumer: sí, es probable que quepa en GPU consumer modernas, aunque no se documenta una lista oficial.
- Opciones de despliegue: LeRobot (`lerobot-rollout` para ejecución y `lerobot-train` para reentrenamiento). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| jongini/act_pick_cube | 51.668.614 | no aplica | Pick-and-place con ACT sobre `so_follower` | no disponible | Hugging Face |
| DebuggingByte/act_pick_cube | no disponible | no aplica | Política ACT (posible réplica o variante) | no disponible | Hugging Face |
| SEONGMIN1234/act_pick_cube | no disponible | no aplica | Política ACT (posible réplica o variante) | no disponible | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- No se han publicado resultados de evaluación en robot real, por lo que se desconoce la tasa de éxito real de la política.
- El dataset de entrenamiento es muy pequeño (28 episodios, 19.682 frames), lo que limita la generalización a nuevas posiciones de objetos, iluminación o distractores.
- La tarea está acotada a "Pick up the <objeto> and put it in the cup"; no se documenta comportamiento fuera de esa instrucción.
- La licencia no está disponible, lo que impide confirmar si se permite uso comercial.
- No se documentan sesgos, pero al ser una política entrenada con datos de teleoperación, puede heredar sesgos de las trayectorias humanas y del entorno de grabación.
- El modelo depende de la configuración exacta de cámaras y robot (`so_follower`, cámaras `top` y `wrist` a 640x480 y 30 FPS); cambios en el hardware pueden degradar el rendimiento.
- Riesgo de alucinación no aplica en el sentido de texto, pero sí existe riesgo de acciones erráticas ante observaciones fuera de distribución.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jongini/act_pick_cube
- Dataset de entrenamiento: https://huggingface.co/datasets/jongini/pick_cube
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=jongini/pick_cube
- Paper ACT: https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía ACT de LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de instalación: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guía de grabación y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia: https://huggingface.co/docs/lerobot/main/en/inference
- Variante DebuggingByte/act_pick_cube: https://huggingface.co/DebuggingByte/act_pick_cube
- Variante SEONGMIN1234/act_pick_cube: https://huggingface.co/SEONGMIN1234/act_pick_cube
