# ranjith3567/smolvla_pick_yellow_cube_v4

## Resumen

SmolVLA es un modelo compacto de visión-lenguaje-acción (VLA) desarrollado por Hugging Face dentro del ecosistema LeRobot, diseñado para control robótico mediante imitación a partir de instrucciones en lenguaje natural. Esta ficha concreta, `ranjith3567/smolvla_pick_yellow_cube_v4`, es un fine-tuning del modelo base `lerobot/smolvla_base` sobre un dataset propio de 101 episodios que enseña a un robot SO-100 (tipo `so_follower`) a recoger un bloque amarillo y depositarlo en una caja marrón.

El modelo resuelve el problema de la política robótica end-to-end: recibe el estado de las articulaciones y varias cámaras, y emite directamente las acciones de los actuadores. Su relevancia radica en que SmolVLA está pensado para ejecutarse en hardware de consumo, lo que lo convierte en una opción asequible para laboratorios y aficionados que quieran reproducir flujos de aprendizaje por imitación sin grandes clústeres de GPU.

Con 450 millones de parámetros y un repositorio de 0,9 GB, esta política es un artefacto de propósito muy específico, publicado bajo licencia Apache 2.0 y formateado en safetensors para su uso con la librería LeRobot.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | VLA (vision-language-action) compacta basada en SmolVLA, según el paper arXiv:2506.01844 |
| Parámetros totales | 450.046.176 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible (las instrucciones de tarea están en inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de `lerobot/smolvla_base`, un VLA compacto que combina un codificador visual y de lenguaje con un cabezal de acciones. La política consume `observation.state` (vector de 6 dimensiones) y cuatro flujos visuales: tres cámaras a 256×256 (`observation.images.camera1`, `camera2`, `camera3`) y una cámara a 480×640 (`observation.images.empty_camera_0`). La salida es un vector de acción de 6 dimensiones, correspondiente a los actuadores del robot SO-100.

El entrenamiento se realizó con LeRobot 0.6.2 sobre el dataset `ranjith3567/pick_Yellow_cube_v4_20261103_185906`, compuesto por 101 episodios y 66.127 fotogramas a 30 FPS, con la tarea "pick the yellow block and place it in brown box". La configuración reportada es de 150.000 pasos, batch size 8, optimizador AdamW, learning rate 0,0001 y semilla 1000. No se documentan detalles sobre preentrenamiento del modelo base, composición del dataset original ni uso de RLHF/DPO en este fine-tuning.

## Capacidades

- Control robótico por imitación: genera acciones de 6 dimensiones para un robot SO-100 a partir de observaciones visuales y de estado.
- Ejecución de una tarea concreta: "pick the yellow block and place it in brown box".
- Entrada multimodal: procesa simultáneamente estado de articulaciones y hasta cuatro cámaras.
- Condicionamiento por instrucción en lenguaje natural (task prompt).
- Despliegue en hardware de consumo, según la model card del modelo base.
- Integración con el ecosistema LeRobot (`lerobot-rollout`, `lerobot-train`).
- No se documentan capacidades de tool calling, agentes, matemáticas, código ni multilingüismo; es un modelo especializado en robótica.

## Casos de uso

- Recogida y colocación de objetos en laboratorio: el modelo ejecuta la tarea de coger el bloque amarillo y dejarlo en la caja marrón, útil como banco de pruebas de pipelines de imitación con SO-100.
- Reproducción de experimentos de aprendizaje por imitación: sirve como referencia para comparar políticas entrenadas con LeRobot sobre el mismo robot y dataset.
- Base para fine-tuning adicional: al derivar de `lerobot/smolvla_base` y publicarse con Apache 2.0, puede reentrenarse con nuevos datasets para tareas similares de manipulación.
- Docencia y formación en robótica: permite a estudiantes desplegar una política VLA real en hardware asequible y observar el ciclo completo observación-acción.
- Validación de hardware y calibración: ejecutar la política con `lerobot-rollout` ayuda a verificar cámaras, puertos y calibración del SO-100 antes de entrenar políticas propias.
- Prototipado de automatización de pick-and-place: como punto de partida para extender la tarea a otros objetos o contenedores mediante nuevos datasets.
- Evaluación de robustez visual: al depender de cuatro cámaras, permite estudiar cómo afectan cambios de iluminación, posición o distracciones al éxito de la política.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación para esta política.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; con 450 millones de parámetros en safetensors (repo de 0,9 GB), la inferencia en FP32 requeriría del orden de 1,8 GB de pesos, y en FP16/BF16 alrededor de 0,9 GB, más el overhead de los codificadores visuales y del runtime.
- GPU recomendadas: no disponible; la model card del modelo base afirma que SmolVLA puede desplegarse en hardware de consumo.
- GPU de consumo: previsiblemente cabe en tarjetas con 8 GB o más, aunque no se confirma en la documentación.
- Despliegue: LeRobot (`lerobot-rollout` para inferencia, `lerobot-train` para entrenamiento). No se documentan opciones vLLM, llama.cpp, Ollama ni TGI para este modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `ranjith3567/smolvla_pick_yellow_cube_v4` | 450 M | no disponible | Pick-and-place SO-100 | Apache 2.0 | Hugging Face (0 descargas) |
| `lerobot/smolvla_base` | no disponible | no disponible | VLA base para fine-tuning | no disponible | Hugging Face |
| Políticas ACT/Diffusion de LeRobot | no disponible | no disponible | Imitación robótica genérica | no disponible | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Especialización extrema: la política solo se ha entrenado para una tarea y un robot concretos; no generaliza a otros objetos, contenedores o morfologías sin reentrenamiento.
- Sin evaluación publicada: no hay tasas de éxito ni métricas de robustez, por lo que se desconoce su fiabilidad real.
- Dependencia de la configuración de cámaras: los nombres y resoluciones de las cámaras deben coincidir exactamente con las claves de observación del entrenamiento.
- Dataset pequeño: 101 episodios y 66.127 fotogramas pueden ser insuficientes para cubrir variaciones de iluminación, posiciones o distracciones.
- Riesgo de sobreajuste al entorno de grabación: cambios en la mesa, la iluminación o la cámara pueden degradar el comportamiento.
- Idiomas: las instrucciones de tarea están en inglés; no se documenta soporte multilingüe.
- Sin datos sobre sesgos, alucinación o seguridad física: al ser un modelo de control motriz, deben tomarse precauciones en el espacio de trabajo del robot.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías ni soporte; el modelo base podría tener condiciones adicionales no detalladas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ranjith3567/smolvla_pick_yellow_cube_v4
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/ranjith3567/pick_Yellow_cube_v4_20261103_185906
- Paper SmolVLA: https://huggingface.co/papers/2506.01844
- Guía LeRobot SmolVLA: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentación LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=ranjith3567/pick_Yellow_cube_v4_20261103_185906
