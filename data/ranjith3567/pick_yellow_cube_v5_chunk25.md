# ranjith3567/pick_yellow_cube_v5_chunk25

## Resumen

`pick_yellow_cube_v5_chunk25` es una política robótica de imitación entrenada con LeRobot sobre la arquitectura SmolVLA (Small Vision-Language-Action), un modelo compacto de visión-lenguaje-acción presentado en el paper arXiv:2506.01844. Lo publica el usuario `ranjith3567` y su propósito es concreto: controlar un robot tipo `so_follower` (SO-100/SO-101 de LeRobot) para ejecutar la tarea "pick the yellow block and place it in brown box" (coger el bloque amarillo y colocarlo en la caja marrón).

El modelo tiene 450.046.176 parámetros (unos 450 M) y un tamaño de repositorio de 0,9 GB en formato safetensors. Consume observaciones multimodales (estado articular de 6 dimensiones y hasta cuatro cámaras) y produce un vector de acción de 6 dimensiones. Es, por tanto, un modelo de política (policy) para control robótico de bajo nivel, no un modelo de lenguaje general.

Su relevancia es la de SmolVLA en general: demostrar que un VLA compacto puede ejecutarse en hardware de consumo y entrenarse con datasets modestos (aquí, 100 episodios y 63.143 frames a 30 FPS). Es un ejemplo típico de fine-tuning de SmolVLA para una tarea de manipulación específica, útil para quien quiera replicar el flujo de trabajo de LeRobot de extremo a extremo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | SmolVLA (vision-language-action, basada en transformer; detalles internos no disponibles en la información proporcionada) |
| Parámetros totales | 450.046.176 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en safetensors) |
| Idiomas soportados | no disponible (modelo de robótica; no orientado a texto) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Librería | lerobot (versión 0.6.2 en entrenamiento) |
| Pipeline | robotics |
| Tipo de robot | `so_follower` |
| Cámaras de entrada | `Top`, `Side` (más `camera1`, `camera2`, `camera3`, `empty_camera_0` en la definición de features) |
| Entrada de estado | `observation.state`, shape (6,) |
| Salida de acción | `action`, shape (6,) |
| Resolución de imagen | 256×256 (cámaras 1-3) y 480×640 (`empty_camera_0`) |
| Dataset de entrenamiento | `ranjith3567/pick_yellow_cube_v5_20261105_191046` (100 episodios, 63.143 frames, 30 FPS) |
| Pasos de entrenamiento | 100.000 |
| Tamaño del repo | 0,9 GB |

## Arquitectura y entrenamiento

SmolVLA es un modelo de visión-lenguaje-acción compacto que combina un codificador visual, un modelo de lenguaje pequeño y un cabezal de acciones, entrenado para mapear observaciones (imágenes y estado del robot) a comandos motores. La model card no detalla la composición interna exacta de este checkpoint concreto (número de capas, dimensión oculta, tokenizador de acciones), por lo que esos datos se marcan como no disponibles.

El entrenamiento se realizó con LeRobot 0.6.2 sobre el dataset `pick_yellow_cube_v5_20261105_191046`, compuesto por 100 episodios y 63.143 frames grabados a 30 FPS para la tarea "pick the yellow block and place it in brown box". La configuración reportada es: 100.000 pasos, batch size 8, optimizador AdamW, learning rate 1e-4 y semilla 1000. Se trata de aprendizaje por imitación supervisado (behavior cloning) sobre demostraciones, no de RLHF ni DPO. El sufijo `chunk25` del nombre sugiere action chunking con horizonte 25, aunque este dato no se confirma explícitamente en la model card.

## Capacidades

- Control robótico de manipulación: genera acciones de 6 dimensiones para un robot `so_follower` a partir de observaciones visuales y de estado articular.
- Percepción visual multi-cámara: procesa hasta cuatro flujos de imagen (tres a 256×256 y uno a 480×640).
- Ejecución de una tarea específica de pick-and-place: "pick the yellow block and place it in brown box".
- Integración con el ecosistema LeRobot: se ejecuta con `lerobot-rollout` y se puede reentrenar con `lerobot-train`.
- Despliegue en hardware de consumo: por tamaño (450 M parámetros) y filosofía del modelo SmolVLA.
- No soporta tool calling, agentes multi-paso, generación de texto libre ni capacidades multilingües en el sentido de un LLM; es una política de robótica.

## Casos de uso

- Automatización de pick-and-place en laboratorio: el modelo ejecuta la tarea de coger un bloque amarillo y depositarlo en una caja marrón sobre un SO-100/SO-101, útil para validar pipelines de imitación antes de escalar a tareas más complejas.
- Reproducción de experimentos de SmolVLA: sirve como checkpoint de referencia para comparar el rendimiento de un fine-tuning de 100.000 pasos con 100 episodios frente a otras configuraciones.
- Base para fine-tuning con nuevos objetos o posiciones: al estar en formato LeRobot, se puede reentrenar con `lerobot-train --policy.type=smolvla` sobre un dataset propio y usar este checkpoint como inicialización.
- Docencia y formación en robótica de imitación: permite a estudiantes ejecutar una política entrenada de extremo a extremo con hardware asequible y comandos CLI documentados.
- Pruebas de integración de cámaras y calibración: el modelo exige que los nombres de cámara coincidan con las claves de observación (`Top`, `Side`, `camera1`...), lo que lo convierte en un banco de pruebas para validar la configuración de sensores.
- Evaluación de robustez ante cambios de iluminación o distractores: al no haber resultados de evaluación publicados, sirve como caso de estudio para medir la tasa de éxito real en distintas condiciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet."

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 450 M parámetros en safetensors (aproximadamente 1,8 GB en fp32 o ~0,9 GB en fp16), es esperable que quepa en GPUs de consumo, pero no se confirma en la documentación.
- GPU recomendadas: no disponible. SmolVLA se describe como desplegable en hardware de consumo, pero no se especifican modelos concretos.
- ¿Cabe en GPU de consumo? Probablemente sí por tamaño, pero no hay confirmación oficial en la información proporcionada.
- Opciones de despliegue: LeRobot (`lerobot-rollout` con `--policy.path=ranjith3567/pick_yellow_cube_v5_chunk25`). No se documentan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles. El dataset se grabó a 30 FPS, pero no se reporta la frecuencia de inferencia alcanzada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `pick_yellow_cube_v5_chunk25` (este) | 450 M | no disponible | Pick-and-place específico (SO-100) | no disponible | Hugging Face, 0 descargas |
| SmolVLA base (Hugging Face) | ~450 M (según paper) | no disponible | VLA generalista | no disponible en esta ficha | Hugging Face |
| Otros checkpoints LeRobot `so_follower` | variable | no disponible | Tareas de manipulación | variable | Hugging Face |

No se dispone de datos de rendimiento comparativo (tasas de éxito) para este checkpoint ni para alternativas en la información proporcionada, por lo que la comparación cuantitativa no está disponible.

## Limitaciones y advertencias

- Sin resultados de evaluación: no hay tasa de éxito reportada, por lo que se desconoce su fiabilidad real en el robot.
- Tarea única y muy específica: solo se ha entrenado para "pick the yellow block and place it in brown box"; no generaliza a otras tareas sin reentrenamiento.
- Dataset pequeño: 100 episodios y 63.143 frames; puede sufrir sobreajuste a posiciones, iluminación y disposición concretas del entorno de grabación.
- Dependencia de la configuración de cámaras: los nombres y resoluciones de cámara deben coincidir exactamente con las claves de observación del entrenamiento; un desajuste puede impedir la inferencia.
- Licencia no disponible: no se puede confirmar el uso comercial; hay que contactar con el autor antes de usarlo en producción.
- Riesgo de alucinación en el sentido de acciones erráticas: como toda política de imitación, puede producir movimientos incorrectos ante estados fuera de distribución.
- Idiomas no aplicables: no es un modelo de lenguaje; no procesa instrucciones en lenguaje natural más allá del condicionamiento de tarea.
- Repositorio con 0 descargas y 0 likes: sin validación comunitaria; tratar como experimental.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ranjith3567/pick_yellow_cube_v5_chunk25
- Dataset de entrenamiento: https://huggingface.co/datasets/ranjith3567/pick_yellow_cube_v5_20261105_191046
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=ranjith3567/pick_yellow_cube_v5_20261105_191046
- Paper SmolVLA: https://huggingface.co/papers/2506.01844
- Guía SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentación LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de rollout/inferencia: https://huggingface.co/docs/lerobot/main/en/inference
- Repositorio LeRobot: https://github.com/huggingface/lerobot
