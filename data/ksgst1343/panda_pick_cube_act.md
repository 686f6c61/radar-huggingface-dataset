# ksgst1343/panda_pick_cube_act

## Resumen

`ksgst1343/panda_pick_cube_act` es una política de imitación para robótica entrenada con el método Action Chunking with Transformers (ACT), publicado en el artículo arXiv 2304.13705. El modelo lo ha desarrollado el usuario ksgst1343 y se distribuye a través del ecosistema LeRobot de Hugging Face. Resuelve una tarea muy concreta de manipulación robótica: recoger un cubo ("pick_cube") con un brazo Panda, a partir de dos cámaras (frontal y de muñeca) y del estado articular del robot.

Se trata de un modelo pequeño, con 51.678.852 parámetros en formato safetensors, y un repositorio de apenas 0,2 GB. No es un modelo de lenguaje: es una política visomotora que consume imágenes de 128x128 píxeles y un vector de estado de 18 dimensiones, y emite acciones de 4 dimensiones. La arquitectura es un transformer que predice trozos de acción (action chunks) en lugar de pasos individuales, lo que reduce el error de acumulación y facilita la ejecución fluida en el robot.

Su relevancia es práctica para quien trabaja con LeRobot: sirve como ejemplo reproducible de entrenamiento de una política ACT con un dataset pequeño (30 episodios, 566 fotogramas a 10 FPS) y como punto de partida para tareas de pick-and-place. La licencia Apache 2.0 permite reutilización comercial, aunque el alcance del modelo está limitado a la tarea y al robot con los que fue entrenado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con codificador visual y decodificador de acciones |
| Parametros totales | 51.678.852 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; política de imitación, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo robótico, sin procesamiento de lenguaje) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que predice secuencias cortas de acciones (chunks) en lugar de una acción por paso temporal. La política combina un codificador visual para las dos cámaras (`observation.images.front` y `observation.images.wrist`, ambas de 3x128x128) con un codificador del estado del robot (`observation.state`, vector de 18 dimensiones) y un decodificador transformer que genera las acciones (`action`, vector de 4 dimensiones). El chunking de acciones mitiga el error de compounding y permite ejecutar movimientos más suaves.

El entrenamiento se realizó con LeRobot 0.6.1 sobre el dataset `ksgst1343/panda_pick_cube`: 30 episodios, 566 fotogramas a 10 FPS, tarea única "pick_cube". La configuración fue de 10.000 pasos, batch size 8, optimizador AdamW, learning rate 1e-05 y semilla 1000. No se documenta el uso de RLHF, DPO ni técnicas de refinamiento posteriores; es aprendizaje supervisado puro a partir de datos de teleoperación.

## Capacidades

- Generación de acciones de control para un brazo robótico Panda en la tarea de recoger un cubo.
- Percepción visomotora con dos cámaras (frontal y de muñeca) a resolución 128x128.
- Predicción de chunks de acción, lo que produce trayectorias más estables que el control paso a paso.
- Condicionamiento por estado articular de 18 dimensiones.
- Ejecución en tiempo real mediante `lerobot-rollout` con `--strategy.type=base`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües.
- No dispone de modo de pensamiento (thinking), visión general, audio ni generación de texto.

## Casos de uso

- Recogida de cubos en laboratorio: ejecutar la política sobre un brazo Panda para recoger un cubo en un entorno controlado, usando las dos cámaras y el estado articular tal como se entrenó.
- Reproducción de experimentos de imitación: servir como referencia reproducible de un pipeline ACT completo con LeRobot, útil para validar instalaciones y flujos de entrenamiento.
- Base para fine-tuning en tareas de pick-and-place: partir de estos pesos y reentrenar con un dataset propio de una tarea similar para acelerar la convergencia.
- Docencia y formación en robótica: demostrar el ciclo completo de teleoperación, grabación de datos, entrenamiento y despliegue con un modelo pequeño que cabe en cualquier GPU.
- Pruebas de integración de LeRobot: validar los comandos `lerobot-rollout` y `lerobot-train` en un entorno real antes de escalar a políticas más grandes.
- Benchmark interno de manipulación: usar la tarea "pick_cube" como caso base para comparar variantes de ACT, cambios de cámara o configuraciones de entrenamiento.
- Prototipado de automatización de almacén a pequeña escala: adaptar la política a una celda de picking con objetos y posiciones similares a los del dataset.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación en robot real ("No evaluation results have been provided for this policy yet"), por lo que no hay tasas de éxito, MMLU, HumanEval, GSM8K ni métricas equivalentes que reportar.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja, en torno a 1-2 GB en FP32 dado el tamaño de 51,7 M de parámetros; no se dispone de cifras oficiales.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; una RTX 3060, RTX 4060 o superior cubre holgadamente la inferencia. Para entrenamiento, una RTX 4090 o A100 acelera los 10.000 pasos, aunque el modelo es pequeño.
- Cabe en GPU consumer: sí, en prácticamente cualquier GPU con al menos 2-4 GB de VRAM.
- Opciones de despliegue: LeRobot (`lerobot-rollout` con `--strategy.type=base`); no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles. La ejecución está ligada al bucle de control del robot y a la frecuencia de las cámaras (el dataset se grabó a 10 FPS).

## Comparativa con modelos similares

| Modelo | Parametros | Tarea | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ksgst1343/panda_pick_cube_act | 51,7 M | Pick_cube con Panda (ACT) | no aplica | apache-2.0 | Hugging Face (LeRobot) |
| Políticas ACT de LeRobot (genéricas) | variable | Manipulación diversa | no aplica | según repo | Hugging Face |
| Políticas Diffusion Policy | variable | Manipulación diversa | no aplica | según repo | Hugging Face / repos académicos |

No se dispone de datos de rendimiento comparables entre estas alternativas en la información proporcionada, por lo que la comparación se limita a parámetros, tarea y licencia.

## Limitaciones y advertencias

- Modelo altamente específico: entrenado solo para la tarea "pick_cube" con un robot Panda y un montaje de cámaras concreto; no generaliza a otras tareas ni objetos.
- Dataset muy pequeño: 30 episodios y 566 fotogramas, lo que limita la robustez frente a variaciones de posición, iluminación o distractores.
- Sin evaluación publicada: no hay tasas de éxito en robot real, por lo que se desconoce su fiabilidad en producción.
- Dependencia del hardware: requiere que los nombres y la configuración de las cámaras coincidan con las claves de observación del entrenamiento (`front`, `wrist`).
- Riesgo de sobreajuste al entorno de grabación; cambios en la mesa, el cubo o la iluminación pueden degradar el comportamiento.
- No es un modelo de lenguaje: no procesa texto, no responde a instrucciones en lenguaje natural y no tiene capacidades de razonamiento simbólico.
- Licencia Apache 2.0 permite uso comercial, pero la responsabilidad sobre el comportamiento físico del robot recae en el integrador; deben tomarse medidas de seguridad en el espacio de trabajo.
- Sin garantías del autor: el repositorio tiene 0 descargas y 0 likes, y no se documentan sesgos ni análisis de fallos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ksgst1343/panda_pick_cube_act
- Dataset de entrenamiento: https://huggingface.co/datasets/ksgst1343/panda_pick_cube
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=ksgst1343/panda_pick_cube
- Artículo ACT: https://huggingface.co/papers/2304.13705
- Guía ACT de LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia: https://huggingface.co/docs/lerobot/main/en/inference
