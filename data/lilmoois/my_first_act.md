# LilMoois/my_first_act

## Resumen

`LilMoois/my_first_act` es una política de robótica entrenada con el método Action Chunking with Transformers (ACT), una técnica de aprendizaje por imitación que predice secuencias cortas de acciones (action chunks) en lugar de pasos individuales. El modelo ha sido entrenado y publicado en Hugging Face Hub mediante la librería LeRobot, el framework de Hugging Face para aprendizaje automático en robótica real. El autor es el usuario LilMoois y el repositorio tiene 0 descargas y 0 likes en el momento de la consulta.

La política está diseñada para controlar un robot seguidor SO-100 (tipo `so100_follower`) equipado con dos cámaras (`up` y `side`), y resuelve una tarea concreta de manipulación: introducir un ladrillo de Lego rosa en una caja transparente. El modelo consume el estado de las articulaciones (vector de 6 dimensiones) y dos imágenes RGB de 480x640 píxeles, y produce un vector de acción de 6 dimensiones.

Con 51.668.614 parámetros y un tamaño de repositorio de 0,2 GB, se trata de un modelo compacto orientado a inferencia en tiempo real sobre hardware de robótica de bajo coste. Su relevancia radica en ser un ejemplo práctico y reproducible del flujo completo de LeRobot: grabación de datos teleoperados, entrenamiento de una política ACT y despliegue en un robot físico.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) |
| Parámetros totales | 51.668.614 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; política de robótica) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Tipo de robot | `so100_follower` |
| Cámaras | `up`, `side` (480x640, 3 canales) |
| Entrada de estado | `observation.state` (6,) |
| Salida de acción | `action` (6,) |
| Librería | lerobot |
| Pipeline | robotics |
| Tamaño del repo | 0,2 GB |

## Arquitectura y entrenamiento

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación presentado en el paper arXiv:2304.13705. La arquitectura se basa en un transformer que, a partir de observaciones multimodales (estado de articulaciones e imágenes de cámaras), predice un chunk de acciones futuras en lugar de una sola acción por paso. Esta estrategia de predicción por bloques reduce el error de acumulación y mejora la estabilidad en tareas de manipulación. El modelo incorpora codificadores visuales para procesar las dos cámaras y un decodificador de acciones.

El entrenamiento se realizó sobre el dataset `lerobot/svla_so101_pickplace`, compuesto por 50 episodios y 11.939 frames a 30 FPS, con la tarea "pink lego brick into the transparent box". La configuración de entrenamiento incluye 2.000 pasos, batch size de 8, optimizador AdamW, learning rate de 1e-05 y semilla 1000, usando LeRobot versión 0.7.1. No se especifica en la información disponible si se aplicaron técnicas de RLHF, DPO ni aumentos de datos adicionales.

## Capacidades

- Control robótico de manipulación: predice chunks de acciones de 6 dimensiones para un robot SO-100 seguidor.
- Percepción visual multimodal: procesa simultáneamente dos flujos de imagen (cámara `up` y cámara `side`) a 480x640.
- Aprendizaje por imitación: reproduce comportamientos aprendidos de datos teleoperados.
- Ejecución de una tarea específica: introducir un ladrillo de Lego rosa en una caja transparente.
- Inferencia en tiempo real: diseñado para ejecutarse a 30 FPS sobre el robot físico.
- Integración con LeRobot: compatible con los comandos `lerobot-rollout` y `lerobot-train`.
- No soporta tool calling, function calling, agentes multi-paso ni capacidades multilingües (no es un modelo de lenguaje).

## Casos de uso

- Automatización de pick-and-place en entornos controlados: el modelo ejecuta la tarea de recoger un ladrillo de Lego y depositarlo en una caja, adecuado para prototipos de líneas de montaje o demostraciones de laboratorio.
- Investigación en aprendizaje por imitación: sirve como referencia reproducible para estudiar el método ACT con un dataset pequeño (50 episodios) y una configuración de entrenamiento documentada.
- Formación y docencia en robótica: permite a estudiantes desplegar una política entrenada en un robot SO-100 real siguiendo el flujo de LeRobot.
- Validación de pipelines de teleoperación: útil para comprobar la integración entre grabación de datos, entrenamiento y despliegue en hardware de bajo coste.
- Benchmarking de políticas robóticas: al ser un modelo compacto (51,7 M de parámetros), sirve como línea base para comparar variantes de ACT o configuraciones de entrenamiento.
- Prototipado rápido de tareas de manipulación: el flujo de LeRobot permite reentrenar la política con nuevos datasets para tareas similares sin cambiar la arquitectura.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación en robot real para esta política.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; con 51,7 M de parámetros y pesos en safetensors, la huella es reducida y compatible con GPUs de consumo.
- GPU recomendadas: no especificadas; el comando de entrenamiento de LeRobot usa `--policy.device=cuda`, por lo que se requiere una GPU NVIDIA con CUDA.
- Compatibilidad con GPU de consumo: probable dada la baja cantidad de parámetros, aunque no se confirma en la documentación.
- Opciones de despliegue: LeRobot (`lerobot-rollout` para inferencia, `lerobot-train` para entrenamiento). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles; el dataset y las cámaras operan a 30 FPS, lo que sugiere que la inferencia debe sostener esa cadencia, pero no se aportan mediciones.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye comparaciones con otras políticas ACT ni con modelos de robótica alternativos.

## Limitaciones y advertencias

- Tarea única: la política está entrenada exclusivamente para "pink lego brick into the transparent box"; no generaliza a otras tareas sin reentrenamiento.
- Dataset pequeño: 50 episodios y 11.939 frames, lo que limita la robustez frente a variaciones de posición, iluminación o distractores.
- Sin resultados de evaluación: no hay métricas de éxito en robot real, por lo que se desconoce su fiabilidad.
- Licencia no disponible: no se especifica la licencia, lo que impide confirmar si el uso comercial está permitido.
- Dependencia de hardware concreto: diseñado para el robot `so100_follower` con cámaras `up` y `side`; requiere calibración y coincidencia de nombres de cámaras.
- Riesgo de sobreajuste: con 2.000 pasos de entrenamiento y un dataset reducido, es probable que el modelo se ajuste a las condiciones exactas de grabación.
- Sin soporte multilingüe ni de texto: no es un modelo de lenguaje y no puede usarse para tareas de NLP.
- Idiomas no disponibles: no aplica, pero se indica como no disponible en la información.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/LilMoois/my_first_act
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Dataset de entrenamiento: https://huggingface.co/datasets/lerobot/svla_so101_pickplace
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=lerobot/svla_so101_pickplace
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia: https://huggingface.co/docs/lerobot/main/en/inference
