# hansu0521/pick_and_place_model1

## Resumen

`hansu0521/pick_and_place_model1` es una política de imitación (imitation learning) para robótica basada en el método ACT (Action Chunking with Transformers), publicado en el paper arXiv 2304.13705. No es un modelo de lenguaje: es un controlador visomotor entrenado con LeRobot que, a partir de dos cámaras (muñeca y cenital) y el estado articular del robot, predice comandos de acción de 6 dimensiones para una tarea concreta de manipulación ("pick dice"). El autor es hansu0521 y el modelo está publicado bajo licencia Apache 2.0.

El modelo resuelve un problema acotado: aprender una política de agarre y colocación a partir de 10 episodios de teleoperación (4161 fotogramas a 30 FPS) sobre un robot de tipo `so_follower` (SO-100/SO-101 de LeRobot). Con 51.668.614 parámetros y un repositorio de 0,2 GB, es un modelo pequeño que cabe en cualquier GPU consumer y que se ejecuta en tiempo real junto al robot.

Su relevancia es práctica y acotada: sirve como ejemplo reproducible de un pipeline completo de LeRobot (grabación de datos, entrenamiento ACT, despliegue con `lerobot-rollout`), no como modelo generalista. No tiene capacidades lingüísticas, de razonamiento ni de generación de texto, y no se han publicado resultados de evaluación en robot real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con encoder visual y decoder de acciones con chunking |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; ventana de observación de la política, no publicada) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan variantes GGUF/AWQ) |
| Idiomas soportados | no disponible (modelo no lingüístico) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería `lerobot`) |

## Arquitectura y entrenamiento

ACT es un método de imitation learning que predice *chunks* de acciones (varias acciones futuras de golpe) en lugar de un único paso, lo que reduce el error de acumulación y estabiliza el control en tareas de manipulación. La política consume `observation.state` de forma `(6,)` y dos imágenes RGB de 480x640 (`cam_wrist` y `cam_top`), y produce una acción de forma `(6,)`. El modelo usa un transformer con atención sobre tokens visuales y de estado, y una cabeza que genera el chunk de acciones.

El entrenamiento se hizo con LeRobot 0.6.0 sobre el dataset `hansu0521/pick_and_place1`: 10 episodios, 4161 fotogramas a 30 FPS, tarea "pick dice", robot `so_follower`. Configuración: 3000 pasos, batch size 8, optimizador AdamW, learning rate 1e-05, semilla 1000. No se documenta uso de RLHF, DPO ni aumento de datos; es aprendizaje supervisado por imitación puro sobre demostraciones de teleoperación. No se especifica el número de tokens de entrenamiento (no aplica) ni innovaciones adicionales más allá del chunking de acciones propio de ACT.

## Capacidades

- Control visomotor de un robot `so_follower` para la tarea "pick dice" (agarre de un dado).
- Predicción de chunks de acciones de 6 dimensiones a partir de estado articular e imágenes de dos cámaras.
- Ejecución en tiempo real mediante `lerobot-rollout` con `--strategy.type=base`.
- Entrenamiento y reentrenamiento reproducibles con `lerobot-train` y `--policy.type=act`.
- No soporta tool calling, function calling ni razonamiento multi-paso simbólico.
- No tiene capacidades multilingües, de generación de texto, visión general, audio ni modo "thinking".
- No incluye decodificación especulativa ni mecanismos de planificación de alto nivel.

## Casos de uso

- Demostración educativa de un pipeline completo de LeRobot: grabar datos con teleoperación, entrenar ACT y desplegar la política en un SO-100/SO-101, útil para talleres y cursos de robótica.
- Prototipado de tareas pick-and-place: sirve como línea base para comparar con otras políticas (Diffusion Policy, VQ-BeT) sobre el mismo robot y dataset.
- Automatización de una celda de laboratorio concreta: recogida de piezas pequeñas (dados, bloques) en posiciones acotadas, con las dos cámaras fijas y el robot calibrado.
- Validación de hardware y calibración: ejecutar la política como test de que cámaras, puerto del robot y cinemática están correctamente configurados antes de grabar nuevos datasets.
- Reentrenamiento con datos propios: usar el script de entrenamiento como plantilla para adaptar ACT a una nueva tarea cambiando el dataset y el `repo_id`.
- Benchmark interno de latencia e inferencia: al ser un modelo de 51,7 M de parámetros, permite medir throughput de políticas en GPU consumer y comparar con despliegues en CPU.
- Base para investigación en imitation learning: experimentar con número de episodios, resolución de cámara o chunk size y medir el impacto en la tasa de éxito.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación en robot real ("No evaluation results have been provided for this policy yet"). No se dispone de tasas de éxito, MMLU, HumanEval, GSM8K ni métricas equivalentes, que además no aplican a este tipo de modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 para 51,7 M de parámetros (los pesos ocupan aproximadamente 0,2 GB); con overhead de activaciones y dos cámaras a 480x640, el consumo es modesto.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; RTX 3060, RTX 4090, A100 o H100 son suficientes y en la práctica sobredimensionadas.
- Cabe en GPU consumer: sí, en cualquier GPU consumer moderna; también es viable en CPU para inferencia, aunque la latencia de control puede degradarse.
- Opciones de despliegue: `lerobot-rollout` (recomendado por el autor), librería `lerobot` en Python; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles en la información proporcionada. El dataset se grabó a 30 FPS, lo que marca un objetivo razonable de frecuencia de control, pero no se publica la latencia real de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| hansu0521/pick_and_place_model1 (ACT) | 51,7 M | Política de imitación visomotora | no aplica | Apache 2.0 | Hugging Face |
| ACT genérico (LeRobot) | ~50 M (configuración típica) | Política de imitación visomotora | no aplica | Apache 2.0 | Hugging Face / GitHub |
| Diffusion Policy | no disponible | Política de imitación generativa | no aplica | no disponible | Repositorios de investigación |
| VQ-BeT | no disponible | Política de imitación con discretización | no aplica | no disponible | Repositorios de investigación |

La comparación se limita a la categoría (políticas de imitación para manipulación robótica); no hay datos de rendimiento publicados para este checkpoint que permitan una comparación cuantitativa con las alternativas.

## Limitaciones y advertencias

- Entrenado con solo 10 episodios y 4161 fotogramas: la generalización es muy limitada y probablemente fallará ante cambios de posición de objetos, iluminación o distractores.
- Sin evaluación en robot real publicada: no hay evidencia cuantitativa de tasa de éxito.
- Tarea única ("pick dice") y robot específico (`so_follower`): no es reutilizable directamente en otro hardware o tarea sin reentrenar.
- Requiere que los nombres y la configuración de las cámaras coincidan exactamente con las claves de observación (`cam_wrist`, `cam_top`); un desajuste rompe la inferencia.
- Riesgo de sobreajuste a las condiciones de grabación (fondo, mesa, iluminación) y de fallos silenciosos en producción.
- No es un modelo de lenguaje: no procesa instrucciones en lenguaje natural ni mantiene conversaciones; la tarea se pasa como cadena fija (`--task="pick dice"`).
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías ni soporte; el uso en producción exige validación propia.
- Al ser un repositorio con 0 descargas y 0 likes, no hay evidencia de la comunidad sobre su funcionamiento; trátese como artefacto de ejemplo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hansu0521/pick_and_place_model1
- Dataset de entrenamiento: https://huggingface.co/datasets/hansu0521/pick_and_place1
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=hansu0521/pick_and_place1
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de instalación: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
