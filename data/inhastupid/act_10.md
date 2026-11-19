# inhastupid/act_10

## Resumen

`inhastupid/act_10` es una política de robótica entrenada con el método Action Chunking with Transformers (ACT), una técnica de aprendizaje por imitación presentada en el paper arXiv:2304.13705 que predice fragmentos cortos de acciones (action chunks) en lugar de pasos individuales. El modelo ha sido entrenado y publicado en el Hub mediante LeRobot, la librería de Hugging Face para aprendizaje automático en robótica real.

La política está especializada en una única tarea de manipulación: "Pick the object and place it on the target" (coger el objeto y colocarlo en el objetivo). Consume el estado del robot (vector de 6 dimensiones) y una imagen de una cámara cenital de 480x640 píxeles, y produce un vector de acción de 6 dimensiones. El entrenamiento se realizó sobre el dataset `inhastupid/pick_place_100`, compuesto por 100 episodios de teleoperación a 30 FPS (60.000 frames en total).

Con 51.668.614 parámetros y un tamaño de repositorio de 0,2 GB, es un modelo compacto pensado para ejecutarse en el robot `so_follower` (SO-100/SO-101 de LeRobot). No es un modelo de lenguaje ni un modelo generativo de propósito general: es un controlador de políticas visomotoras para robótica de manipulación. Su relevancia radica en que ejemplifica el flujo completo de LeRobot para entrenar y desplegar políticas de imitación en hardware de bajo coste.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con encoder visual y decoder de acciones con chunking |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; consume observaciones por frame, no secuencias de texto) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan cuantizaciones) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible (la model card indica "More Information Needed") |
| Formato de pesos | safetensors (librería lerobot) |

## Arquitectura y entrenamiento

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación que combina un backbone visual (encoder de imágenes) con un transformer que predice un chunk de acciones futuras en lugar de una sola acción por paso. Esta estrategia de chunking reduce el error de composición acumulado y mejora la estabilidad en tareas de manipulación de precisión. La política consume `observation.state` (6 dimensiones) y `observation.images.top` (3x480x640) y emite `action` (6 dimensiones).

El entrenamiento se realizó con LeRobot 0.7.1 durante 10.000 pasos, con batch size 8, optimizador AdamW, learning rate 1e-5 y semilla 1000, sobre el dataset `inhastupid/pick_place_100` (100 episodios, 60.000 frames, 30 FPS, tarea única de pick-and-place). No se documenta el uso de RLHF, DPO ni fases de refinamiento posteriores; es aprendizaje por imitación supervisado a partir de demostraciones teleoperadas. No se especifican innovaciones adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Control visomotor para manipulación robótica: genera comandos de acción de 6 dimensiones a partir de estado propioceptivo e imagen cenital.
- Ejecución de una tarea concreta de pick-and-place ("Pick the object and place it on the target") sobre el robot `so_follower`.
- Predicción de chunks de acciones (action chunking) que reduce la frecuencia efectiva de inferencia y mejora la suavidad del movimiento.
- Integración con el ecosistema LeRobot mediante el comando `lerobot-rollout` para despliegue en robot real.
- No soporta tool calling, function calling, agentes multi-paso, razonamiento textual ni capacidades multilingües: no es un modelo de lenguaje.
- No dispone de modo thinking, visión general, audio ni otras capacidades fuera de la política visomotora entrenada.

## Casos de uso

- Automatización de pick-and-place en laboratorio: el modelo ejecuta la tarea de coger un objeto y depositarlo en una posición objetivo usando la cámara cenital y el estado del robot, adecuado para bancos de pruebas de bajo coste con SO-100/SO-101.
- Reproducción de demostraciones teleoperadas: sirve como referencia para validar que el pipeline de LeRobot (grabación, entrenamiento, rollout) funciona de extremo a extremo antes de escalar a tareas más complejas.
- Base para fine-tuning en tareas similares: al ser una política ACT compacta (51,7 M de parámetros), puede reentrenarse con nuevos datasets de pick-and-place para adaptar la tarea a otros objetos o posiciones.
- Evaluación de infraestructura de inferencia en robot: útil para medir latencia y throughput del bucle de control a 30 FPS con una política ACT en hardware consumer.
- Docencia y formación en aprendizaje por imitación: ejemplo didáctico completo de una política ACT con configuración de entrenamiento documentada (pasos, batch, learning rate, semilla).
- Prototipado de controladores visomotores: punto de partida para comparar ACT frente a otros métodos de imitación en la misma tarea y dataset.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet." No se dispone de tasas de éxito en robot real, ni de métricas de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 51,7 M de parámetros y pesos en safetensors (repo de 0,2 GB), la huella en memoria es reducida y cabe holgadamente en GPUs consumer.
- GPU recomendadas: no especificadas por el autor; por tamaño, cualquier GPU con al menos unos pocos GB de VRAM es suficiente (por ejemplo, RTX 3060 en adelante). Para entrenamiento se documenta `--policy.device=cuda`, sin modelo de GPU concreto.
- Cabe en GPU consumer: sí, por el reducido número de parámetros; no se documentan requisitos mínimos oficiales.
- Opciones de despliegue: LeRobot (`lerobot-rollout` para ejecución en robot, `lerobot-train` para reentrenamiento). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput estimados: no disponibles. El sistema opera a 30 FPS según el dataset, pero no se publican mediciones de latencia de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| inhastupid/act_10 | 51.668.614 | no aplica | Pick-and-place con cámara cenital | no disponible | Hugging Face (LeRobot) |
| Otras políticas ACT en LeRobot Hub | variable | no aplica | Manipulación por imitación | variable | Hugging Face |
| Políticas Diffusion Policy (LeRobot) | variable | no aplica | Manipulación por imitación | variable | Hugging Face |
| Políticas VLA (p. ej. pi0, SmolVLA) | variable (mayor) | no aplica | Manipulación generalista | variable | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada. La comparación se limita a categoría, tamaño y disponibilidad; no se han publicado métricas que permitan contrastar tasas de éxito.

## Limitaciones y advertencias

- Modelo altamente especializado: entrenado para una única tarea ("Pick the object and place it on the target") y un único robot (`so_follower`); no generaliza a otras tareas sin reentrenamiento.
- Dependencia de la configuración de cámara: espera una cámara `top` a 480x640 y 30 FPS; cambios de posición, iluminación o tipo de cámara pueden degradar el rendimiento.
- Sin evaluación publicada: no hay tasas de éxito en robot real, por lo que no puede afirmarse su fiabilidad en producción.
- Licencia no especificada: la model card indica "More Information Needed", lo que impide confirmar si el uso comercial está permitido.
- Dataset de entrenamiento reducido (100 episodios, 60.000 frames): riesgo de sobreajuste a las condiciones exactas de recogida de datos.
- Riesgo de alucinación en el sentido de acciones incorrectas o inseguras: al ser una política de control, errores de predicción pueden provocar colisiones o manipulaciones fallidas; requiere supervisión y paradas de seguridad en robot real.
- Sin soporte multilingüe ni de texto: no aplica como modelo de lenguaje; no debe compararse con LLMs.
- Sin datos de sesgos: no se documentan análisis de sesgo; el comportamiento depende enteramente de las demostraciones teleoperadas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/inhastupid/act_10
- Dataset de entrenamiento: https://huggingface.co/datasets/inhastupid/pick_place_100
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=inhastupid/pick_place_100
- Paper ACT: https://huggingface.co/papers/2304.13705
- Guía ACT de LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
