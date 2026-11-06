# chenproject35/act_pick-and-place-b601-60ep-yaw0-v2_ood_cell4

## Resumen

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación que predice secuencias cortas de acciones (chunks) en lugar de pasos individuales, lo que reduce el error de acumulación y mejora la estabilidad en tareas de manipulación robótica. Este repositorio concreto, publicado por el usuario `chenproject35`, contiene una política ACT entrenada con LeRobot 0.6.2 sobre un conjunto de datos propio de 60 episodios de teleoperación para la tarea "Pick up inreach2 and place it in the jig" con un robot `rebot_b601_follower` y dos cámaras (frontal y de muñeca).

El modelo tiene 51.670.663 parámetros y consume observaciones compuestas por el estado articular (vector de 7 dimensiones) y dos imágenes RGB de 480x640 píxeles, produciendo como salida un vector de acción de 7 dimensiones. El nombre del repositorio incluye el sufijo `ood_cell4`, lo que sugiere un entrenamiento orientado a generalización fuera de distribución (out-of-distribution) en una celda o configuración concreta, aunque la model card no documenta dicho protocolo.

Se trata de un modelo de robótica de nicho, con 31 descargas y sin resultados de evaluación publicados. Su interés es práctico para quien quiera reproducir el pipeline de entrenamiento de ACT con LeRobot o reutilizar los pesos como punto de partida, no como un modelo de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con encoder visual y decoder de acciones |
| Parametros totales | 51.670.663 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (política de imitación, sin ventana de contexto textual) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin variantes GGUF publicadas) |
| Idiomas soportados | no disponible (no procesa lenguaje; recibe instrucción de tarea como cadena en tiempo de ejecución) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Tipo de robot | `rebot_b601_follower` |
| Cámaras de entrada | `cam_front`, `cam_wrist` (3, 480, 640) |
| Entrada de estado | `observation.state` (7,) |
| Salida de acción | `action` (7,) |
| Frecuencia de datos | 30 FPS |
| Pasos de entrenamiento | 100.000 |
| Tamaño del repositorio | 12,4 GB |

## Arquitectura y entrenamiento

ACT es un transformer diseñado para imitación visomotora que combina un backbone visual (codificador de imágenes) con un transformer que fusiona las características visuales, el estado propioceptivo y una representación de la instrucción de tarea. La innovación central es la predicción de chunks de acciones: en lugar de emitir una acción por paso, el modelo genera una secuencia corta que se ejecuta de forma abierta, lo que reduce el error compuesto y suaviza el comportamiento. El paper de referencia es arXiv:2304.13705 (Zhao et al., 2023).

El entrenamiento se realizó con LeRobot 0.6.2 durante 100.000 pasos, batch size 4, optimizador AdamW, learning rate 1e-5 y semilla 1000. El dataset asociado (`chenproject35/pick-and-place-b601-60ep-yaw0-v2`) contiene 60 episodios y 58.148 frames a 30 FPS, todos ellos de la tarea "Pick up inreach2 and place it in the jig". No se documenta en la model card si hubo aumento de datos, variaciones de iluminación, distractores ni un protocolo explícito de evaluación out-of-distribution, pese al sufijo `ood_cell4` del nombre.

## Capacidades

- Control visomotor de un brazo robótico de 7 grados de libertad mediante predicción de chunks de acción.
- Fusión de dos vistas de cámara (frontal y de muñeca) con el estado articular para generar comandos.
- Ejecución de una tarea de pick-and-place específica: coger un objeto "inreach2" y colocarlo en un utillaje ("jig").
- Inferencia en tiempo real a 30 FPS mediante `lerobot-rollout`.
- Reentrenamiento y ajuste fino con `lerobot-train` sobre datasets propios en formato LeRobot.
- No soporta tool calling, function calling, razonamiento multi-paso simbólico, generación de texto ni capacidades multilingües; es una política de imitación, no un modelo de lenguaje.

## Casos de uso

- Automatización de una celda de pick-and-place: la política ejecuta la secuencia de agarre y colocación sobre el robot `rebot_b601_follower`, adecuada para tareas repetitivas de alimentación de utillajes en línea de montaje.
- Prototipado de pipelines de imitación con LeRobot: sirve como referencia funcional para validar la instalación, calibración de cámaras y flujo `lerobot-rollout` antes de entrenar políticas propias.
- Punto de partida para fine-tuning: los pesos pueden ajustarse con `lerobot-train` sobre nuevos datasets del mismo robot para adaptar la tarea (otro objeto, otro utillaje) con pocos episodios adicionales.
- Investigación en generalización OOD: el sufijo `ood_cell4` sugiere que el modelo se entrenó para evaluar robustez ante variaciones de posición o configuración; útil como baseline en estudios de generalización de políticas visomotoras.
- Docencia y demostraciones de aprendizaje por imitación: el tamaño reducido (51,7 M de parámetros) y la licencia Apache 2.0 permiten usarlo en cursos y talleres sin restricciones comerciales.
- Benchmark interno de ACT frente a otras políticas (Diffusion Policy, VQ-BeT) sobre el mismo dataset de 60 episodios, usando la misma configuración de entrenamiento documentada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet." No se dispone de tasas de éxito en robot real, ni de métricas de error de acción, ni de comparaciones cuantitativas con otras políticas sobre el mismo dataset.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; con 51,7 M de parámetros, el peso en fp32 ronda los 200 MB, por lo que la inferencia cabe holgadamente en cualquier GPU consumer con al menos 4 GB de VRAM, aunque el cuello de botella real son las dos cámaras a 30 FPS y el preprocesado de imágenes.
- GPU recomendadas: cualquier GPU NVIDIA con CUDA (RTX 3060 o superior) es suficiente para inferencia; para entrenamiento con batch size 4 y 100.000 pasos se recomienda RTX 4090, A100 o H100 para reducir tiempos.
- Cabe en GPU consumer: sí, en cualquier GPU con CUDA y memoria suficiente para el modelo y el pipeline de cámaras.
- Opciones de despliegue: `lerobot-rollout` (CLI oficial de LeRobot); el modelo no está pensado para vLLM, llama.cpp, Ollama ni TGI, que son servidores de modelos de lenguaje.
- Latencia y throughput estimados: no disponibles; la política está entrenada sobre datos a 30 FPS, por lo que el bucle de control debe sostener esa frecuencia para un comportamiento correcto.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ACT (este repo) | 51,7 M | no aplica | Pick-and-place con `rebot_b601_follower` | Apache 2.0 | Hugging Face, 31 descargas |
| ACT (implementación de referencia LeRobot) | ~50 M (configuración por defecto) | no aplica | Imitación visomotora genérica | Apache 2.0 | Hugging Face / GitHub LeRobot |
| Diffusion Policy | no disponible en la información | no aplica | Imitación visomotora con difusión | no disponible | Repositorios académicos |
| VQ-BeT | no disponible en la información | no aplica | Imitación con cuantización vectorial | no disponible | Repositorios académicos |

La comparación cuantitativa de rendimiento entre estas políticas no está disponible en la información proporcionada; los tres últimos son métodos de referencia de la literatura, no pesos concretos publicados en este repositorio.

## Limitaciones y advertencias

- Sin resultados de evaluación publicados: no hay evidencia empírica de tasa de éxito en robot real, ni en distribución ni fuera de ella.
- Entrenado sobre un único dataset de 60 episodios y una sola tarea; la generalización a otros objetos, posiciones, iluminación o utillajes es incierta.
- Dependencia fuerte de la configuración de cámaras: los nombres `cam_front` y `cam_wrist` y sus índices deben coincidir exactamente con los usados en entrenamiento, o la política fallará.
- Específico del robot `rebot_b601_follower`; no es transferible a otras morfologías sin reentrenamiento.
- Riesgo de sobreajuste al dataset pequeño y de comportamiento frágil ante cambios de calibración o desgaste mecánico.
- No procesa lenguaje natural: la cadena `--task` es informativa para el pipeline, no una instrucción que el modelo interprete semánticamente.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de evaluación hace arriesgado desplegarlo en producción sin validación propia.
- El sufijo `ood_cell4` no está documentado en la model card; no debe interpretarse como garantía de robustez OOD.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/chenproject35/act_pick-and-place-b601-60ep-yaw0-v2_ood_cell4
- Dataset de entrenamiento: https://huggingface.co/datasets/chenproject35/pick-and-place-b601-60ep-yaw0-v2
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=chenproject35/pick-and-place-b601-60ep-yaw0-v2
- Paper de ACT: https://huggingface.co/papers/2304.13705 (arXiv:2304.13705)
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de instalación: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference
