# guswjdddd/pick_n_place_v2_diffusion

## Resumen

`pick_n_place_v2_diffusion` es una política de control visuomotor entrenada con el algoritmo Diffusion Policy sobre el framework LeRobot de Hugging Face. No es un modelo de lenguaje: es un modelo de robótica que mapea observaciones multimodales (estado articular de 6 dimensiones y tres cámaras RGB de 480x640) a comandos de acción de 6 dimensiones para un robot seguidor de tipo `so_follower`. El autor es el usuario de Hugging Face `guswjdddd` y el modelo se distribuye bajo licencia Apache 2.0.

El modelo resuelve una tarea de manipulación concreta y de contacto rico: "Pick up the red cube and place it on the green cube". Diffusion Policy trata el control visuomotor como un proceso generativo de difusión, lo que produce trayectorias de acción suaves y multimodales que suelen superar a las políticas deterministas en tareas con contacto físico. Con 292.716.128 parámetros (unos 293 millones) y un repositorio de 1,2 GB en safetensors, es un modelo de tamaño moderado pensado para inferencia en tiempo real a 30 FPS.

Su relevancia es acotada pero clara: sirve como referencia reproducible de un pipeline completo de imitación (grabación de datos, entrenamiento y despliegue) con LeRobot 0.6.1, y como punto de partida para quien quiera replicar o adaptar una política de pick-and-place en hardware SO-100/SO-101. No debe confundirse con un modelo fundacional de robótica: está entrenado para una única tarea y un único montaje de robot y cámaras.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Diffusion Policy (política visuomotora generativa por difusión, implementada en LeRobot) |
| Parámetros totales | 292.716.128 |
| Parámetros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (no aplica; ventana de observación definida por la política, no documentada) |
| Tipos de cuantización | no disponible (pesos en safetensors; no se documentan variantes GGUF/INT8) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje; la tarea se especifica en inglés como cadena de texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería `lerobot`) |

## Arquitectura y entrenamiento

La arquitectura es Diffusion Policy, tal como se describe en el paper arXiv:2303.04137. El modelo consume `observation.state` de forma `(6,)` y tres flujos visuales (`observation.images.wrist`, `observation.images.top`, `observation.images.belly`) de forma `(3, 480, 640)` cada uno, y produce una acción de forma `(6,)`. La política genera trayectorias de acción mediante un proceso de difusión condicionado por las observaciones, lo que permite representar distribuciones multimodales de acciones y suavizar el control en tareas de contacto. El detalle interno de la red (número de pasos de difusión, backbone visual, horizonte de predicción) no está documentado en la model card.

El entrenamiento se realizó con LeRobot 0.6.1 sobre el dataset `guswjdddd/pick_n_place_v2_20261118_135308`, compuesto por 100 episodios y 45.282 fotogramas a 30 FPS de la tarea "Pick up the red cube and place it on the green cube". La configuración reportada es de 100.000 pasos de entrenamiento, batch size 8, optimizador Adam, learning rate 0,0001 y semilla 1000. No se documenta composición del dataset más allá de la tarea, ni uso de RLHF/DPO (no aplica en este dominio), ni innovaciones adicionales como decodificación especulativa.

## Capacidades

- Control visuomotor de manipulación: genera comandos de acción de 6 dimensiones a partir de estado articular y tres cámaras RGB.
- Ejecución de una tarea de pick-and-place específica: recoger un cubo rojo y colocarlo sobre un cubo verde.
- Política generativa por difusión: produce trayectorias de acción suaves y multimodales, adecuadas para manipulación con contacto rico.
- Entrada multimodal: fusiona estado propioceptivo de 6 dimensiones con tres vistas visuales sincronizadas a 30 FPS.
- Despliegue en tiempo real mediante `lerobot-rollout` sobre un robot `so_follower`.
- Reentrenamiento y fine-tuning mediante `lerobot-train` con `--policy.type=diffusion`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües: no es un modelo de lenguaje.

## Casos de uso

- Automatización de pick-and-place en laboratorio: el modelo ejecuta la secuencia de recogida y colocación de cubos sobre un robot SO-100/SO-101 con tres cámaras, sirviendo como línea base reproducible para experimentos de imitación.
- Evaluación de Diffusion Policy frente a políticas deterministas: al estar entrenado con 100 episodios y 45.282 fotogramas, permite comparar curvas de éxito y suavidad de trayectoria en una tarea de contacto concreta.
- Docencia y formación en aprendizaje por imitación: el pipeline completo (grabación con LeRobot, entrenamiento con `lerobot-train`, despliegue con `lerobot-rollout`) es un ejemplo didáctico de extremo a extremo con comandos documentados.
- Punto de partida para fine-tuning en tareas similares: partiendo de estos pesos y de un dataset propio, se puede adaptar la política a variantes de la tarea (otros objetos, posiciones o colores) con `--policy.type=diffusion`.
- Pruebas de integración de hardware: validar la calibración de cámaras `wrist`, `top` y `belly`, la latencia del bucle de control a 30 FPS y el comportamiento del robot `so_follower` antes de escalar a tareas más complejas.
- Generación de datos sintéticos de evaluación: usar la política como generador de trayectorias para estudiar robustez frente a cambios de iluminación, posiciones de objeto o distracciones, aunque el autor no reporta resultados de éxito.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet." No se dispone de tasas de éxito, número de ensayos ni métricas de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 292,7 millones de parámetros en FP32 los pesos ocupan aproximadamente 1,17 GB, por lo que la inferencia cabe holgadamente en GPUs de consumo con 8 GB o más, aunque el consumo real depende del backbone visual y del número de pasos de difusión, que no se documentan.
- GPU recomendadas: no especificadas por el autor. Por tamaño, una RTX 3060/4060 de 8-12 GB o superior es suficiente para los pesos; para entrenamiento con batch size 8 y tres cámaras a 480x640 se recomienda al menos 12-16 GB de VRAM.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU con 8 GB o más, dado el tamaño del checkpoint (1,2 GB en el repositorio).
- Opciones de despliegue: `lerobot-rollout` (estrategia `base`) y `lerobot-train` de LeRobot; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles. La tarea se grabó y se espera ejecutar a 30 FPS, pero el autor no reporta latencias de inferencia ni throughput medido.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto / observación | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `guswjdddd/pick_n_place_v2_diffusion` | Diffusion Policy (LeRobot) | 292,7 M | Estado (6,) + 3 cámaras 480x640 | Apache 2.0 | Hugging Face, 29 descargas |
| Políticas ACT de LeRobot | Action Chunking Transformer | no disponible | Depende del dataset | Apache 2.0 (LeRobot) | Hugging Face / repositorio LeRobot |
| Políticas TDMPC / SAC de LeRobot | RL / control | no disponible | Depende del dataset | Apache 2.0 (LeRobot) | Hugging Face / repositorio LeRobot |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada; la comparación se limita a tipo de método, licencia y disponibilidad.

## Limitaciones y advertencias

- Entrenado para una única tarea ("Pick up the red cube and place it on the green cube") y un único montaje de robot (`so_follower`) con tres cámaras concretas; no generaliza a otras tareas sin reentrenamiento.
- Sin resultados de evaluación publicados: no hay tasas de éxito ni estudios de robustez, por lo que no se puede afirmar su fiabilidad en producción.
- Dependencia estricta de la configuración de hardware: los nombres e índices de cámara deben coincidir con las claves de observación (`wrist`, `top`, `belly`) y con la resolución 480x640 a 30 FPS.
- Dataset pequeño (100 episodios, 45.282 fotogramas) y de un solo autor, lo que limita la diversidad de posiciones, iluminación y distracciones cubiertas.
- Riesgo de sobreajuste al entorno de grabación y de fallo ante cambios de iluminación, fondo u objetos distintos a los cubos rojo y verde.
- No es un modelo de lenguaje: no tiene capacidades de texto, razonamiento, código ni multilingüismo, y no soporta tool calling ni agentes.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de evaluación y la especificidad de la tarea desaconsejan su despliegue directo en entornos productivos sin validación propia.
- La model card no documenta sesgos, límites de contexto ni caveats adicionales más allá de los indicados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/guswjdddd/pick_n_place_v2_diffusion
- Dataset de entrenamiento: https://huggingface.co/datasets/guswjdddd/pick_n_place_v2_20261118_135308
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=guswjdddd/pick_n_place_v2_20261118_135308
- Paper de Diffusion Policy: https://huggingface.co/papers/2303.04137
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guía de grabación y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
