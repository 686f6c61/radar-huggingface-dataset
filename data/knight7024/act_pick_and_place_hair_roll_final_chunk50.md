# knight7024/act_pick_and_place_hair_roll_final_chunk50

## Resumen

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación para robótica que predice bloques cortos de acciones en lugar de pasos individuales, reduciendo el error de composición acumulado típico de las políticas paso a paso. Este repositorio concreto, `knight7024/act_pick_and_place_hair_roll_final_chunk50`, es una política entrenada con LeRobot sobre el robot `so_follower` para la tarea de recoger y colocar un rulo de pelo ("pick_and_place_hair_roll_final"), usando dos cámaras (`top` y `wrist`) y un vector de estado de 6 dimensiones.

El modelo tiene 51.617.414 parámetros y un tamaño de repositorio de 0,2 GB, lo que lo sitúa en el rango de políticas ligeras ejecutables en hardware de consumo. Emplea una arquitectura transformer con codificador visual y decodificador de acciones con *action chunking* (el sufijo `chunk50` sugiere un horizonte de predicción de 50 pasos, aunque este dato no se explicita en la model card). Se entrenó durante 100.000 pasos con batch size 1, optimizador AdamW y learning rate 1e-5 sobre un dataset de 60 episodios y 43.285 frames a 30 FPS.

Es relevante como ejemplo reproducible de *imitation learning* end-to-end en robótica de bajo coste: la política es de código abierto (Apache 2.0), se ejecuta con la CLI de LeRobot y sirve como referencia para quien quiera replicar el pipeline de grabación de datos, entrenamiento y despliegue en un robot SO-100/SO-101. No obstante, al ser un modelo entrenado para una tarea y un robot específicos, su valor es demostrativo y no de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con codificador visual y decodificador de acciones |
| Parametros totales | 51.617.414 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (política de control, no modelo de lenguaje; entrada compuesta por estado de 6 dims y dos imágenes de 3x240x320) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; LeRobot no documenta cuantización para esta política) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT es un transformer que combina un *backbone* visual (codificador de imágenes) con un codificador de estado y un decodificador que genera un *chunk* de acciones de forma conjunta, condicionado por una representación latente de estilo (CVAE). La predicción por bloques mitiga el problema de *compounding error* de las políticas autoregresivas paso a paso y suaviza las trayectorias. En este caso, la política consume `observation.state` (6 dims) y dos imágenes RGB de 3x240x320 (`top` y `wrist`), y produce un vector de acción de 6 dims. El sufijo `chunk50` del nombre apunta a un horizonte de 50 acciones por chunk, aunque el valor exacto no se detalla en la model card.

El entrenamiento se realizó con LeRobot 0.6.0 sobre el dataset `knight7024/pick_and_place_hair_roll_final` (60 episodios, 43.285 frames, 30 FPS, tarea única). Configuración: 100.000 pasos, batch size 1, optimizador AdamW, learning rate 1e-5, semilla 1000. No se documenta uso de RLHF/DPO (no aplica a este paradigma), ni aumentos de datos, ni composición detallada del dataset más allá de la tarea y el número de episodios. No se reportan innovaciones adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Control robótico por imitación para la tarea `pick_and_place_hair_roll_final` sobre robot `so_follower`.
- Predicción de chunks de acciones (horizonte nominal de 50 pasos según el nombre del checkpoint) a partir de estado propioceptivo de 6 dims y dos vistas RGB.
- Fusión multimodal de dos cámaras (`top` y `wrist`) con el estado del robot.
- Ejecución en bucle cerrado a 30 FPS mediante `lerobot-rollout`.
- No soporta tool calling, function calling ni razonamiento multi-paso en el sentido de los LLM.
- No tiene capacidades multilingües, de visión general, audio ni *thinking mode*.
- No es un modelo de propósito general: está especializado en una única tarea y un único tipo de robot.

## Casos de uso

- **Automatización de una celda de pick-and-place de laboratorio**: ejecutar la política en un SO-100/SO-101 para recoger y colocar un rulo de pelo de forma repetitiva, usando las cámaras `top` y `wrist` ya calibradas. Adecuado por su entrenamiento específico sobre esa tarea y su bajo coste computacional.
- **Referencia reproducible para cursos de imitation learning**: servir como checkpoint de partida en talleres de LeRobot, ya que el pipeline completo (dataset, configuración de entrenamiento y comando de rollout) está documentado en la model card.
- **Base para fine-tuning en tareas similares**: reentrenar con `lerobot-train --policy.type=act` sobre un dataset propio de otra tarea de manipulación con el mismo robot, aprovechando la receta de hiperparámetros publicada (100k pasos, AdamW, lr 1e-5).
- **Validación de hardware y calibración de cámaras**: usar la política como *smoke test* para verificar que el robot, los puertos y las dos cámaras están correctamente configurados antes de grabaciones de datos más largas.
- **Investigación en action chunking**: comparar el efecto del tamaño de chunk (el checkpoint sugiere 50) frente a variantes de ACT con horizontes menores en la misma tarea, midiendo fluidez y tasa de éxito.
- **Generación de datos sintéticos de evaluación**: ejecutar la política en bucle para producir trayectorias de referencia que sirvan como *baseline* en experimentos de robustez ante cambios de iluminación o posición de objetos.
- **Demostración educativa de robótica de bajo coste**: mostrar en charlas o clases un pipeline completo de aprendizaje por imitación con hardware asequible y software open source.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: *"No evaluation results have been provided for this policy yet."* No se dispone de tasas de éxito, número de ensayos ni comparaciones cuantitativas con otras políticas.

## Requisitos de hardware

- **VRAM estimada para inferencia**: con 51,6 M de parámetros y pesos en safetensors (0,2 GB de repo), la inferencia cabe holgadamente en GPUs de consumo; en FP32 los pesos ocupan aproximadamente 0,2 GB, y el coste dominante es el procesamiento de las dos imágenes de 240x320 por paso.
- **GPU recomendadas**: cualquier GPU NVIDIA con al menos 4-6 GB de VRAM es suficiente; RTX 3060/4060, RTX 4090, A100 y H100 funcionan sin problema. También es viable en CPU para pruebas lentas.
- **¿Cabe en consumer GPU?**: sí, en prácticamente cualquier GPU de consumo moderna (GTX 1660 en adelante) e incluso en placas integradas para inferencia a baja frecuencia.
- **Opciones de despliegue**: `lerobot-rollout` (CLI oficial de LeRobot) es la vía documentada; el modelo se carga con `--policy.path=knight7024/act_pick_and_place_hair_roll_final_chunk50`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplican a políticas robóticas).
- **Latencia y throughput**: no disponibles. La política está pensada para ejecutarse a 30 FPS (frecuencia del dataset), pero no se publican mediciones de latencia por paso ni throughput en hardware concreto.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de comparaciones publicadas en la información proporcionada. A continuación se comparan características estructurales con otras políticas de la familia ACT/LeRobot, marcando como "no disponible" los datos de rendimiento:

| Modelo | Parametros | Contexto / entrada | Tarea | Licencia | Rendimiento |
|---|---|---|---|---|---|
| `knight7024/act_pick_and_place_hair_roll_final_chunk50` | 51,6 M | estado (6,) + 2 imágenes 3x240x320 | pick_and_place_hair_roll_final (so_follower) | Apache 2.0 | no disponible |
| Otras políticas ACT en LeRobot Hub | variable (típicamente 40-80 M) | según robot y cámaras | tareas específicas | habitualmente Apache 2.0 | no disponible |
| Políticas Diffusion Policy en LeRobot | variable | según robot y cámaras | tareas específicas | habitualmente Apache 2.0 | no disponible |
| Políticas VLA (p. ej. RT-2, OpenVLA) | miles de millones | imágenes + instrucción en lenguaje | multi-tarea generalista | variable | no disponible |

La comparación cuantitativa con alternativas concretas no está disponible en la información proporcionada; cualquier cifra de éxito requeriría evaluación en robot real, que este repositorio no incluye.

## Limitaciones y advertencias

- **Especialización extrema**: la política solo ha sido entrenada para la tarea `pick_and_place_hair_roll_final` con el robot `so_follower`; no generaliza a otras tareas, objetos ni morfologías sin reentrenamiento.
- **Sin evaluación publicada**: no hay tasas de éxito ni ensayos documentados, por lo que se desconoce su robustez real ante variaciones de posición, iluminación o distractores.
- **Dataset pequeño**: 60 episodios y 43.285 frames son una base limitada; el riesgo de sobreajuste a las condiciones de grabación es alto.
- **Dependencia de calibración**: el rendimiento depende críticamente de que los nombres y la configuración de las cámaras (`top`, `wrist`) coincidan con los usados en entrenamiento, tal como advierte la model card.
- **Riesgo de alucinación**: no aplica en el sentido de los LLM, pero sí existe riesgo de acciones erráticas o fuera de distribución cuando la observación visual se aleja de la distribución de entrenamiento.
- **Sesgos**: no documentados; al ser un modelo entrenado con datos de un único operador y entorno, hereda los sesgos de esas demostraciones (posiciones, velocidades, estilos de agarre).
- **Licencia**: Apache 2.0 permite uso comercial y modificación, pero el autor no ofrece garantías ni soporte; conviene verificar la licencia del dataset asociado antes de redistribuir derivados.
- **Idioma y contexto**: no aplica soporte multilingüe ni ventana de contexto en el sentido de los modelos de lenguaje; la "entrada" es estado propioceptivo más imágenes.
- **Caveat para producción**: requiere robot físico, calibración y supervisión; no debe desplegarse en entornos con personas sin medidas de seguridad adicionales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/knight7024/act_pick_and_place_hair_roll_final_chunk50
- Dataset de entrenamiento: https://huggingface.co/datasets/knight7024/pick_and_place_hair_roll_final
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=knight7024/pick_and_place_hair_roll_final
- Paper de ACT: https://huggingface.co/papers/2304.13705 (arXiv:2304.13705)
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía ACT de LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
