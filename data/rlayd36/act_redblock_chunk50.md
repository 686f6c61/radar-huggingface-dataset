# Rlayd36/act_redblock_chunk50

## Resumen

`act_redblock_chunk50` es una política de imitación (imitation learning) entrenada con el método Action Chunking with Transformers (ACT) sobre el framework LeRobot de Hugging Face. El modelo resuelve una tarea robótica concreta de manipulación: recoger y colocar un bloque rojo ("Red block pickup and place") con un robot tipo `so_follower` (Standard Open Arm / SO-100 de LeRobot). No es un modelo de lenguaje: es un controlador visomotor que consume el estado de las articulaciones y dos cámaras (overhead y wrist) y emite comandos de acción de 6 dimensiones.

El modelo tiene 51.617.414 parámetros (unos 51,6 M) y un tamaño de repositorio de 0,2 GB. Se entrenó durante 100.000 pasos con batch size 8, optimizador AdamW y learning rate 1e-5 sobre un dataset de 50 episodios y 29.176 frames a 30 FPS. La licencia es Apache 2.0.

Su relevancia es la de un ejemplo canónico de política ACT entrenada con LeRobot 0.6.0: sirve como referencia reproducible para quien quiera replicar el pipeline de imitación (grabación de datos, entrenamiento y despliegue) en un brazo robótico de bajo coste, y como punto de partida para adaptar la tarea a otros objetos o entornos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers): transformer con encoder visual y decoder de acciones con chunking |
| Parametros totales | 51.617.414 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de contexto textual; consume observaciones por frame) |
| Tipos de cuantizacion | no disponible (pesos safetensors sin cuantización publicada) |
| Idiomas soportados | no disponible (modelo robótico; la instrucción de tarea es texto en inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería LeRobot) |

## Arquitectura y entrenamiento

ACT (Action Chunking with Transformers) es un método de imitation learning que predice *chunks* de acciones cortas en lugar de un único paso, lo que reduce el error de acumulación y mejora la estabilidad del control. La política sigue una arquitectura transformer con un encoder que procesa las observaciones (estado de 6 dimensiones y dos imágenes RGB de 3×480×640 procedentes de las cámaras `overhead` y `wrist`) y un decoder que genera las acciones de 6 dimensiones. El nombre del modelo, `chunk50`, sugiere un tamaño de chunk de 50 pasos de acción, aunque este dato no se confirma explícitamente en la model card.

El entrenamiento se realizó con LeRobot 0.6.0 durante 100.000 pasos, batch size 8, AdamW con learning rate 1e-5 y semilla 1000, sobre el dataset `Rlayd36/pick-cube_20261116_142939` (50 episodios, 29.176 frames, 30 FPS). La tarea es "Red block pickup and place". No se documenta uso de RLHF/DPO (no aplica a este tipo de modelo) ni innovaciones adicionales más allá del propio chunking de acciones del método ACT.

## Capacidades

- Control visomotor de un brazo robótico `so_follower` para la tarea de recoger y colocar un bloque rojo.
- Fusión de dos cámaras RGB (overhead y wrist) con el estado de las articulaciones (6 dimensiones) para producir acciones de 6 dimensiones.
- Predicción de chunks de acciones (según el nombre, 50 pasos), lo que aporta suavidad y reduce el error acumulado.
- Ejecución autónoma en bucle mediante `lerobot-rollout` con `--strategy.type=base`.
- No soporta tool calling, function calling, agentes multi-paso ni razonamiento textual: es una política puramente reactiva de imitación.
- Capacidades multilingües: no aplica; la instrucción de tarea es una cadena de texto en inglés ("Red block pickup and place").
- No dispone de modo thinking, visión general, audio ni generación de texto.

## Casos de uso

- **Automatización de pick-and-place en laboratorio**: usar la política para recoger y colocar un bloque rojo en una celda de manipulación con un SO-100, sirviendo como base reproducible para experimentos de imitation learning.
- **Referencia de pipeline LeRobot**: emplear el modelo como ejemplo de extremo a extremo (dataset → entrenamiento → rollout) para formar a nuevos usuarios en la herramienta con un caso real de 50 episodios.
- **Punto de partida para fine-tuning en tareas similares**: reentrenar con `lerobot-train` sobre un dataset propio de pick-and-place modificando objeto, posiciones o iluminación, partiendo de esta configuración (100k pasos, batch 8, lr 1e-5).
- **Evaluación de robustez visomotora**: medir la tasa de éxito ante cambios de posición del bloque, iluminación o distracciones, dado que la model card no reporta evaluación y este caso permitiría caracterizar la política.
- **Integración en un banco de pruebas de robótica de bajo coste**: desplegar la política en un SO-100 con dos cámaras USB a 640×480 y 30 FPS para validar la latencia y el throughput del control en hardware asequible.
- **Docencia y demostraciones**: mostrar en clase o demo el funcionamiento de ACT y del chunking de acciones con un modelo pequeño (51,6 M de parámetros) que cabe en cualquier GPU consumer.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet." No se dispone de tasas de éxito, número de ensayos ni comparaciones cuantitativas.

## Requisitos de hardware

- **VRAM estimada para inferencia**: no disponible de forma oficial; con 51,6 M de parámetros y pesos en safetensors (repo de 0,2 GB), la inferencia requiere muy poca memoria (del orden de cientos de MB a ~1 GB incluyendo buffers de las dos imágenes 3×480×640).
- **GPU recomendadas**: cualquier GPU con CUDA es suficiente; no se requiere A100/H100. Una RTX 4090, RTX 3090 o incluso GPUs de gama media son sobradas.
- **¿Cabe en consumer GPU?**: sí, en cualquier GPU consumer moderna; también es viable en CPU para pruebas, aunque con mayor latencia.
- **Opciones de despliegue**: LeRobot (`lerobot-rollout`), con soporte de `--policy.device=cuda`; el ecosistema LeRobot 0.6.0 es la vía documentada.
- **Latencia y throughput**: no disponibles. El control opera a 30 FPS según el dataset, pero no se publican mediciones de latencia por paso ni throughput.

## Comparativa con modelos similares

| Modelo | Parámetros | Tipo | Tarea | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `Rlayd36/act_redblock_chunk50` | 51,6 M | ACT (LeRobot) | Pick-and-place bloque rojo (SO-100) | no aplica | Apache 2.0 | Hugging Face, 0 descargas, 0 likes |
| Políticas ACT de referencia de LeRobot | no disponible | ACT (LeRobot) | Tareas diversas (p. ej. Aloha, SO-100) | no aplica | Apache 2.0 | Hugging Face / docs LeRobot |
| Políticas Diffusion Policy | no disponible | Diffusion Policy | Manipulación visomotora | no aplica | según repo | Repos académicos y LeRobot |
| Políticas VQ-BeT / otros IL | no disponible | VQ-BeT | Manipulación visomotora | no aplica | según repo | Repos académicos |

No se dispone de datos cuantitativos de rendimiento de este modelo ni de alternativas concretas en la información proporcionada, por lo que la comparación se limita a parámetros, tipo, licencia y disponibilidad.

## Limitaciones y advertencias

- **Tarea única y específica**: la política está entrenada exclusivamente para "Red block pickup and place" con un `so_follower`; no generaliza a otras tareas, objetos ni robots sin reentrenamiento.
- **Sin evaluación publicada**: no hay tasas de éxito ni ensayos documentados, por lo que se desconoce su fiabilidad real en producción.
- **Dataset pequeño**: 50 episodios y 29.176 frames; la cobertura de posiciones, iluminación y distracciones es limitada, lo que aumenta el riesgo de fallo fuera de la distribución de entrenamiento.
- **Dependencia de las cámaras**: requiere exactamente las cámaras `overhead` y `wrist` con los nombres y la resolución (3×480×640) del entrenamiento; un cambio de montaje o calibración puede degradar el rendimiento.
- **Sesgos y alucinación**: no aplica el concepto de alucinación textual; el riesgo equivalente es la ejecución de acciones incorrectas o inseguras ante observaciones no vistas.
- **Licencia Apache 2.0**: permite uso comercial y modificación, pero el autor no ofrece garantías; el despliegue en un robot físico conlleva riesgos de seguridad que deben gestionarse externamente.
- **Madurez**: 0 descargas y 0 likes en el momento de la consulta; es un artefacto reciente (creado el 2026-11-16) sin validación comunitaria.
- **Idioma**: la instrucción de tarea está en inglés; no hay soporte multilingüe documentado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Rlayd36/act_redblock_chunk50
- Dataset de entrenamiento: https://huggingface.co/datasets/Rlayd36/pick-cube_20261116_142939
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=Rlayd36/pick-cube_20261116_142939
- Paper de ACT: https://huggingface.co/papers/2304.13705 (arXiv:2304.13705)
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de instalación: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
