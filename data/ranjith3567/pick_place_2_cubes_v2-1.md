# ranjith3567/pick_place_2_cubes_v2.1

## Resumen

SmolVLA es un modelo compacto de visión-lenguaje-acción (VLA) desarrollado por Hugging Face dentro del ecosistema LeRobot, diseñado para controlar robots manipuladores a partir de observaciones visuales e instrucciones en lenguaje natural. Esta ficha concreta, `ranjith3567/pick_place_2_cubes_v2.1`, es un fine-tuning del checkpoint base `lerobot/smolvla_base` sobre un dataset propio de 100 episodios y 70.561 frames grabados a 30 FPS, orientado a una tarea muy específica: coger un bloque rosa o verde y depositarlo en una caja marrón.

El modelo resuelve el problema de la imitación visual-motora de bajo coste: en lugar de requerir un VLA de gran escala, ofrece una política de 450 millones de parámetros que cabe en hardware de consumo y se entrena con el flujo estándar de LeRobot. La arquitectura combina un codificador visual, un modelo de lenguaje y un decodificador de acciones, y se ha entrenado con 150.000 pasos, batch de 8, optimizador AdamW y tasa de aprendizaje 1e-4.

Su relevancia es doble: por un lado, demuestra el patrón de fine-tuning de SmolVLA sobre robots SO-100/SO-101 (`so_follower`) con dos cámaras; por otro, sirve como referencia práctica de cómo adaptar un VLA genérico a una tarea de pick-and-place concreta con un dataset pequeño y reproducible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (SmolVLA): codificador visual + modelo de lenguaje + decodificador de acciones |
| Parametros totales | 450.046.176 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (instrucciones de tarea en inglés en el dataset) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (repo de 0,9 GB) |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de `lerobot/smolvla_base`, un VLA compacto presentado en el paper arXiv:2506.01844. La política consume un vector de estado de 6 dimensiones, tres cámaras de 256×256 (etiquetadas `camera1`, `camera2`, `camera3`) y una cámara adicional de 480×640 (`empty_camera_0`), y produce un vector de acción de 6 dimensiones. El robot objetivo es un `so_follower` con cámaras `Top` y `Side`.

El entrenamiento se realizó con LeRobot 0.6.2 sobre el dataset `ranjith3567/pick_place_2_cubes_v2_20261118_193925`: 100 episodios, 70.561 frames a 30 FPS, con dos tareas ("pick the pink block and place it in brown box" y "pick the green block and place it in brown box"). Configuración: 150.000 pasos, batch size 8, AdamW, learning rate 1e-4, semilla 1000. No se documenta el uso de RLHF, DPO ni técnicas de decodificación especulativa en la información disponible.

## Capacidades

- Control robótico de manipulación pick-and-place a partir de instrucciones en lenguaje natural.
- Percepción visual multi-cámara: procesa tres vistas de 256×256 y una vista de 480×640 de forma simultánea.
- Fusión estado-acción: recibe el estado articular de 6 dimensiones y emite comandos de 6 dimensiones.
- Ejecución de dos tareas concretas diferenciadas por el color del bloque (rosa o verde) y el destino (caja marrón).
- Despliegue en hardware de consumo gracias a su tamaño compacto (450 M de parámetros).
- Integración nativa con el ecosistema LeRobot para rollout, evaluación y reentrenamiento.
- No se documenta soporte de tool calling, agentes multi-paso, visión general, audio ni modo de razonamiento explícito.

## Casos de uso

- Automatización de pick-and-place en línea de montaje: el modelo ejecuta la secuencia de coger un bloque y depositarlo en una caja, adecuado para tareas repetitivas de clasificación por color en células de fabricación.
- Prototipado rápido de políticas robóticas: sirve como punto de partida para equipos que quieran validar un pipeline de imitación con LeRobot antes de escalar a tareas más complejas.
- Investigación en aprendizaje por imitación: al ser un fine-tuning reproducible con dataset y configuración públicos, permite estudiar el efecto del número de episodios y de la configuración de entrenamiento en el éxito de la tarea.
- Educación y formación en robótica: su tamaño (0,9 GB) y su licencia Apache-2.0 lo hacen apto para laboratorios docentes con robots SO-100/SO-101 y GPUs de consumo.
- Benchmark de referencia para comparar variantes de SmolVLA: al estar entrenado sobre un dataset concreto y documentado, permite medir mejoras de nuevas técnicas de VLA sobre la misma tarea.
- Despliegue en robot de bajo coste con dos cámaras: el modelo está calibrado para `so_follower` con vistas `Top` y `Side`, lo que facilita su integración en montajes de bajo presupuesto.
- Base para transferencia a tareas de clasificación por color: las dos instrucciones del dataset permiten reutilizar el modelo como inicialización para tareas similares con otros objetos o destinos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación en robot real para esta política.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 450 M de parámetros en safetensors (0,9 GB), la inferencia en precisión nativa requiere del orden de 1-2 GB de VRAM, y menos con cuantización, aunque el autor no publica cifras.
- GPU recomendadas: no disponible. El modelo base SmolVLA se describe como desplegable en hardware de consumo, por lo que se espera compatibilidad con GPUs consumer, pero no se especifican modelos concretos.
- Cabe en GPU consumer: previsiblemente sí, dado el tamaño del checkpoint, aunque no se confirma en la información disponible.
- Opciones de despliegue: LeRobot (`lerobot-rollout` con `--strategy.type=base`, `--policy.path=ranjith3567/pick_place_2_cubes_v2.1`). No se documentan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política robótica.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `ranjith3567/pick_place_2_cubes_v2.1` | 450 M | no disponible | Pick-and-place de dos bloques en caja | Apache-2.0 | Hugging Face |
| `lerobot/smolvla_base` | no disponible en la informacion | no disponible | VLA base para fine-tuning | no disponible en la informacion | Hugging Face |
| Políticas ACT / Diffusion Policy de LeRobot | no disponible | no disponible | Imitación visual-motora genérica | no disponible | Hugging Face / LeRobot |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- El modelo está especializado en dos tareas muy concretas (bloque rosa o verde hacia caja marrón); no generaliza a otros objetos, colores o destinos sin reentrenamiento.
- No se han publicado evaluaciones en robot real, por lo que se desconoce la tasa de éxito efectiva.
- Depende de la configuración exacta de cámaras y del robot `so_follower`; cambios en la posición, iluminación o tipo de cámara pueden degradar el rendimiento.
- El dataset de entrenamiento es pequeño (100 episodios), lo que aumenta el riesgo de sobreajuste a posiciones y condiciones concretas.
- Riesgo de alucinación no aplica en el sentido lingüístico, pero sí de acciones erráticas fuera de la distribución de entrenamiento.
- Licencia Apache-2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte.
- No se documentan sesgos ni limitaciones idiomáticas; las instrucciones de tarea están en inglés.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin comunidad de validación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ranjith3567/pick_place_2_cubes_v2.1
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/ranjith3567/pick_place_2_cubes_v2_20261118_193925
- Paper SmolVLA: https://huggingface.co/papers/2506.01844
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentación LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guía de grabación y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia: https://huggingface.co/docs/lerobot/main/en/inference
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=ranjith3567/pick_place_2_cubes_v2_20261118_193925
