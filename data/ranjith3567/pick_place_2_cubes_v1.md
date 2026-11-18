# ranjith3567/pick_place_2_cubes_v1

## Resumen

SmolVLA es un modelo compacto de visión-lenguaje-acción (VLA) desarrollado por Hugging Face dentro del ecosistema LeRobot, diseñado para control robótico mediante imitación y desplegable en hardware de consumo. El repositorio `ranjith3567/pick_place_2_cubes_v1` es un fine-tuning de `lerobot/smolvla_base` sobre un dataset propio de 60 episodios (49.619 fotogramas a 30 FPS) para la tarea concreta de recoger bloques y depositarlos en una caja marrón, usando un robot `so_follower` con dos cámaras (Top y Wrist).

El modelo resuelve el problema de la política de control visuomotor de bajo coste: en lugar de requerir infraestructura de inferencia pesada, un VLA de 450 millones de parámetros puede ejecutarse en GPUs de consumo. Es relevante ahora porque el paper SmolVLA (arXiv:2506.01844) demuestra que modelos compactos de esta familia alcanzan rendimiento competitivo frente a VLA de mayor tamaño, abriendo la experimentación robótica a laboratorios y aficionados con presupuesto limitado.

Este checkpoint concreto es un artefacto de investigación: un fine-tuning acotado a dos tareas específicas de pick-and-place, sin resultados de evaluación publicados por el autor y con cero descargas en el momento de redactar esta ficha. No es un modelo de propósito general, sino una política entrenada para un robot y un entorno determinados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (SmolVLA), transformer multimodal con política de acciones |
| Parametros totales | 450.046.176 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo robótico, no conversacional) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería `lerobot`) |

## Arquitectura y entrenamiento

SmolVLA es un modelo visión-lenguaje-acción compacto que combina percepción visual multicámara, una instrucción en lenguaje natural y el estado del robot para producir acciones de control. El checkpoint parte de `lerobot/smolvla_base` y se ha fine-tuneado con el pipeline de LeRobot 0.6.2 sobre el dataset `ranjith3567/pick_place_2_cubes_v1_20261117_200005`, que contiene 60 episodios y 49.619 fotogramas a 30 FPS con dos tareas: "pick the green block and place it in brown box" y "pick the pink block and place it in brown box".

La configuración de entrenamiento reportada incluye 150.000 pasos, batch size 8, optimizador AdamW, learning rate 0,0001 y semilla 1000. La política consume `observation.state` de forma `(6,)`, tres cámaras visuales de `(3, 256, 256)` y una cámara adicional `empty_camera_0` de `(3, 480, 640)`, y produce una acción de forma `(6,)`. El robot objetivo es `so_follower` con cámaras denominadas Top y Wrist. No se detalla en la información disponible la composición del dataset de preentrenamiento del modelo base, ni si hubo RLHF/DPO u otras fases de alineamiento.

## Capacidades

- Control visuomotor de un robot `so_follower` mediante imitación para tareas de pick-and-place.
- Seguimiento de instrucciones en lenguaje natural acotadas a dos tareas concretas: recoger el bloque verde y recoger el bloque rosa, depositándolos en una caja marrón.
- Fusión de estado propioceptivo (`observation.state`, 6 dimensiones) con hasta cuatro entradas visuales.
- Generación de acciones continuas de 6 dimensiones a partir de observaciones multimodales.
- Despliegue en hardware de consumo según la descripción del modelo base SmolVLA.
- No se documentan capacidades de tool calling, razonamiento multi-paso, diálogo multilingüe, visión general, audio ni modo thinking; no es un modelo de lenguaje conversacional.

## Casos de uso

- Automatización de pick-and-place en laboratorio: la política ejecuta la tarea de recoger bloques y colocarlos en una caja mediante `lerobot-rollout`, adecuada para validar pipelines de imitación antes de escalar a tareas más complejas.
- Prototipado rápido de políticas robóticas: al partir de `lerobot/smolvla_base` y requerir solo 150.000 pasos con batch 8, sirve como plantilla para fine-tunings con datasets propios de decenas de episodios.
- Docencia e investigación en imitación: el modelo permite demostrar el ciclo completo grabación de datos, entrenamiento y despliegue con LeRobot en un robot de bajo coste.
- Benchmarking interno de hardware robótico: útil para comparar latencia y fiabilidad de un VLA compacto en GPUs de consumo frente a políticas clásicas.
- Recolección de datos asistida: combinado con `lerobot-rollout` en modo `base`, puede ejecutar la política mientras se registran episodios para ampliar el dataset.
- Pruebas de robustez visual: al usar varias cámaras (Top, Wrist y una adicional de 480x640), permite estudiar cómo afectan cambios de iluminación o posición al éxito de la política.
- Base para transferencia a tareas relacionadas: el checkpoint puede servir de inicialización para nuevas tareas de manipulación con el mismo robot y configuración de cámaras.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación para esta política.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 450 millones de parámetros en safetensors (repo de 0,9 GB), la inferencia en precisión nativa requiere del orden de 1-2 GB de VRAM, aunque no se confirma en la documentación.
- GPU recomendadas: no especificadas; el modelo base SmolVLA se describe como desplegable en hardware de consumo.
- Compatibilidad con GPU de consumo: previsiblemente sí, dado el tamaño del modelo, si bien no se detalla una lista de GPUs validadas.
- Opciones de despliegue: `lerobot-rollout` (CLI de LeRobot) para ejecución en robot; el entrenamiento se realiza con `lerobot-train` en dispositivo CUDA.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ranjith3567/pick_place_2_cubes_v1 | 450 M | no disponible | VLA fine-tuned | apache-2.0 | Hugging Face |
| lerobot/smolvla_base | no disponible en la informacion | no disponible | VLA base | no disponible en la informacion | Hugging Face |
| Otros VLA de la familia SmolVLA | no disponible | no disponible | VLA | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Entrenado exclusivamente para dos tareas concretas ("pick the green block..." y "pick the pink block..."); no generaliza a otras instrucciones ni objetos.
- Sin resultados de evaluación publicados: se desconoce la tasa de éxito real de la política.
- Dependiente de la configuración exacta de robot (`so_follower`) y cámaras (Top, Wrist y `empty_camera_0`); cambios de montaje o calibración pueden degradar el comportamiento.
- Dataset pequeño (60 episodios, 49.619 fotogramas): riesgo de sobreajuste al entorno de grabación (posiciones, iluminación, fondo).
- Riesgo de alucinación de acciones en situaciones fuera de distribución; no hay mecanismo de seguridad documentado.
- Licencia apache-2.0 permite uso comercial, pero la ausencia de evaluación y el alcance limitado hacen desaconsejable su uso en producción sin validación propia.
- Cero descargas y cero likes en el momento de redactar: sin evidencia de uso comunitario ni validación externa.
- No es un modelo de lenguaje: no soporta diálogo, tool calling ni razonamiento textual.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ranjith3567/pick_place_2_cubes_v1
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/ranjith3567/pick_place_2_cubes_v1_20261117_200005
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=ranjith3567/pick_place_2_cubes_v1_20261117_200005
- Paper SmolVLA: https://huggingface.co/papers/2506.01844 (arXiv:2506.01844)
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia: https://huggingface.co/docs/lerobot/main/en/inference
