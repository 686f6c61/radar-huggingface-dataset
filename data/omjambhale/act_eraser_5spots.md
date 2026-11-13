# omjambhale/act_eraser_5spots

## Resumen

`omjambhale/act_eraser_5spots` es una política de imitación robótica entrenada con el método ACT (Action Chunking with Transformers), publicado en el artículo arXiv:2304.13705. El modelo lo ha entrenado y subido a Hugging Face el usuario omjambhale usando LeRobot 0.6.1, la librería de Hugging Face para aprendizaje automático en robótica real. No es un modelo de lenguaje: es un controlador visuomotor que mapea observaciones (estado articular de 6 dimensiones y dos cámaras RGB de 480x640) a acciones de 6 dimensiones para un robot seguidor tipo `so_follower`.

Resuelve una tarea concreta de manipulación: "Pick up the eraser and put it in the blue bucket" (coger la goma de borrar y depositarla en el cubo azul). Se entrenó sobre el dataset `omjambhale/eraser-5spots_clean`, con 49 episodios y 19.714 fotogramas a 30 FPS, durante 25.000 pasos con batch de 8 y learning rate 1e-5.

El modelo tiene 51.668.614 parámetros en formato safetensors (unos 0,2 GB de repositorio) y licencia Apache 2.0. Es relevante como ejemplo de política ACT lista para desplegar con `lerobot-rollout` en hardware SO-100/SO-101, aunque carece de evaluación en robot real publicada y no tiene descargas ni interacción en el Hub.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con encoder visual y decoder de acciones |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; consume observaciones por paso, no secuencias de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo robótico, no lingüístico) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo LeRobot) |

## Arquitectura y entrenamiento

ACT es un método de imitación que predice *chunks* de acciones (varias acciones futuras de golpe) en lugar de un único paso, lo que reduce el error de composición y mejora la estabilidad en tareas de manipulación. La política combina dos entradas visuales (`observation.images.wrist` y `observation.images.front`, ambas 3x480x640) con el estado proprioceptivo `observation.state` de dimensión 6, y emite un vector de acción de dimensión 6.

El entrenamiento se hizo con LeRobot 0.6.1 sobre 49 episodios (19.714 fotogramas a 30 FPS), 25.000 pasos, batch size 8, optimizador AdamW, learning rate 1e-5 y semilla 1000. La model card no detalla composición del dataset, aumentación de datos ni si hubo RLHF/DPO (no aplica en imitación supervisada). No se documentan innovaciones adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Control visuomotor de un robot seguidor `so_follower` a partir de dos cámaras (muñeca y frontal) y estado de 6 articulaciones.
- Predicción de chunks de acciones de 6 dimensiones (no pasos sueltos), lo que aporta suavidad y consistencia temporal.
- Ejecución de una tarea de manipulación concreta: coger una goma de borrar y dejarla en un cubo azul.
- Aprendizaje por imitación a partir de datos de teleoperación (no refuerzo, no instrucciones en lenguaje natural más allá del prompt de tarea).
- No soporta tool calling, function calling, agentes multi-paso, razonamiento textual, visión general, audio ni capacidades multilingües.

## Casos de uso

- **Automatización de pick-and-place en laboratorio:** el modelo recoge un objeto pequeño y lo deposita en un contenedor; útil para validar pipelines de imitación antes de escalar a tareas industriales.
- **Prototipado rápido con LeRobot:** sirve como política de referencia para probar `lerobot-rollout` en un SO-100/SO-101 y verificar calibración de cámaras y articulaciones.
- **Recogida de datos y fine-tuning:** el dataset `eraser-5spots_clean` y la configuración de entrenamiento permiten reproducir o adaptar el pipeline con `lerobot-train` y `policy.type=act`.
- **Benchmark interno de políticas ACT:** comparar variantes (distintos datasets, semillas o número de pasos) sobre la misma tarea para medir estabilidad.
- **Educación e investigación en imitación robótica:** ejemplo reproducible de entrenamiento visuomotor con 49 episodios, útil en cursos y tutoriales de robótica.
- **Integración en líneas de montaje simples:** clasificación y traslado de objetos ligeros en cintas con posiciones acotadas, donde un controlador de 51,7 M parámetros es suficiente y barato de ejecutar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet."

## Requisitos de hardware

- **VRAM estimada:** no disponible en la información proporcionada; con 51,7 M parámetros el peso en FP32 ronda los 0,2 GB, pero no se documenta consumo real de inferencia.
- **GPU recomendadas:** no disponible; LeRobot permite `--policy.device=cuda`, por lo que cualquier GPU NVIDIA con CUDA es candidata.
- **¿Cabe en GPU consumer?** Muy probablemente sí (el repositorio completo pesa 0,2 GB), pero no hay confirmación oficial ni requisitos mínimos publicados.
- **Opciones de despliegue:** LeRobot (`lerobot-rollout`), entrenamiento con `lerobot-train`; no se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplican a políticas robóticas).
- **Latencia y throughput:** no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento comparables en la información proporcionada. A continuación se comparan características estructurales con alternativas típicas de la familia ACT en LeRobot, sin cifras de éxito:

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `omjambhale/act_eraser_5spots` | 51.668.614 | no disponible | pick-and-place goma/cubo | Apache 2.0 | Hub HF (0 descargas) |
| Otras políticas ACT de LeRobot | no disponible | no disponible | tareas de manipulación | Apache 2.0 (habitual) | Hub HF |
| Políticas Diffusion Policy (LeRobot) | no disponible | no disponible | manipulación visuomotora | Apache 2.0 (habitual) | Hub HF |
| Políticas VQ-BeT / SmolVLA | no disponible | no disponible | manipulación y VLA | Apache 2.0 (habitual) | Hub HF |

## Limitaciones y advertencias

- **Sin evaluación real:** no hay tabla de trials/success rate; no se puede afirmar robustez fuera del dataset de entrenamiento.
- **Sobreajuste al entorno:** entrenado con 49 episódios y una única tarea; cambios de iluminación, posición de objetos o distractores pueden degradar el rendimiento.
- **Dependencia de hardware:** requiere robot `so_follower`, dos cámaras (`wrist`, `front`) a 640x480 y 30 FPS, y nombres de cámara que coincidan con las claves de observación.
- **Riesgo de alucinación en el sentido robótico:** puede ejecutar acciones incorrectas o inseguras si las observaciones se salen de la distribución; no hay mecanismo de seguridad documentado.
- **Sesgos:** no disponibles; el dataset no documenta diversidad de posiciones, objetos o condiciones.
- **Licencia:** Apache 2.0 permite uso comercial, pero la política concreta no incluye garantías ni evaluación de seguridad para producción.
- **Caveat de producción:** 0 descargas y 0 likes indican que no ha sido validado por terceros; conviene reentrenarlo o evaluarlo antes de desplegarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/omjambhale/act_eraser_5spots
- Dataset de entrenamiento: https://huggingface.co/datasets/omjambhale/eraser-5spots_clean
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=omjambhale/eraser-5spots_clean
- Paper ACT: https://huggingface.co/papers/2304.13705
- Guía ACT de LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Repositorio LeRobot: https://github.com/huggingface/lerobot
