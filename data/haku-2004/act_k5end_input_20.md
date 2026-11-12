# Haku-2004/act_k5end_input_20

## Resumen

ACT (`act_k5end_input_20`) es una política de imitación robótica entrenada con el método Action Chunking with Transformers (ACT), publicado por Zhao et al. en 2023 y adoptado como referencia dentro del ecosistema LeRobot de Hugging Face. El modelo aprende a partir de datos de teleoperación y predice fragmentos cortos de acciones (action chunks) en lugar de pasos individuales, lo que reduce el error de acumulación y estabiliza la ejecución en tareas de manipulación. El autor del repositorio es Haku-2004, que lo ha entrenado y publicado con la librería LeRobot 0.5.2.

Se trata de un modelo específico para un robot `so_follower` (SO-100/SO-101 de LeRobot) con dos cámaras (`front` y `side`) a resolución 640x480 y 30 FPS. Consume un vector de estado de 6 dimensiones y produce un vector de acción de 6 dimensiones. La tarea concreta para la que se ha entrenado se denomina "taskbox" y el dataset asociado (`Haku-2004/k5_4seg`) contiene 20 episodios y 25.815 fotogramas.

Con 51.671.174 parámetros y un tamaño de repositorio de 0,2 GB, es un modelo pequeño y ligero, pensado para inferencia en tiempo real en hardware de consumo. Su relevancia radica en que ejemplifica el flujo completo de LeRobot: grabar con teleoperación, entrenar una política ACT y desplegarla con `lerobot-rollout` sobre un robot físico de bajo coste.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con codificador visual y decodificador de acciones |
| Parametros totales | 51.671.174 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; el modelo consume observaciones por paso, no secuencias de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de robótica, sin capacidades lingüísticas) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería `lerobot`) |

## Arquitectura y entrenamiento

ACT es un transformer diseñado para imitación visomotora. La arquitectura combina un codificador visual (procesa las imágenes de las cámaras `front` y `side` a 3x480x640) con un codificador del estado proprioceptivo (vector de 6 dimensiones) y un decodificador transformer que genera un chunk de acciones de forma autoregresiva. La innovación clave del método es predecir varios pasos de acción a la vez (action chunking), lo que mitiga el problema de la acumulación de errores típico de las políticas que predicen un solo paso, y permite un control más suave y con menor latencia efectiva.

El entrenamiento se realizó sobre el dataset `Haku-2004/k5_4seg` (20 episodios, 25.815 fotogramas, 30 FPS, tarea "taskbox"), con 50.000 pasos, batch size 8, optimizador AdamW, learning rate 1e-5 y semilla 1000, usando LeRobot 0.5.2. No se especifica en la información disponible el número total de tokens, la composición exacta del dataset ni si hubo etapas de RLHF o DPO (no aplicables en el contexto de imitación robótica). Tampoco se documentan innovaciones adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Control robótico visomotor: genera acciones de 6 dimensiones a partir de dos imágenes RGB y un vector de estado de 6 dimensiones.
- Imitación de tareas de manipulación: aprende a partir de demostraciones teleoperadas y reproduce la tarea "taskbox".
- Predicción de chunks de acción: emite secuencias cortas de acciones en lugar de pasos aislados, lo que mejora la estabilidad del control.
- Inferencia en tiempo real: diseñado para ejecutarse a 30 FPS en hardware de consumo.
- Integración con LeRobot: compatible con `lerobot-rollout` y `lerobot-train` para despliegue y reentrenamiento.
- No soporta tool calling, function calling, agentes multi-paso, razonamiento simbólico, matemáticas, generación de código ni capacidades multilingües; es un modelo puramente de robótica.

## Casos de uso

- Manipulación de objetos en laboratorio: el modelo ejecuta la tarea "taskbox" sobre un robot `so_follower` con dos cámaras, adecuado para experimentos de imitación visomotora en entornos controlados.
- Prototipado rápido de políticas robóticas: sirve como punto de partida para que un equipo entrene su propia política ACT con `lerobot-train` sobre un dataset propio y compare resultados.
- Docencia y formación en robótica de imitación: su tamaño reducido (51,7 M de parámetros) y su licencia Apache 2.0 lo hacen idóneo para cursos y talleres donde se enseña el pipeline completo de LeRobot.
- Despliegue en hardware de bajo coste: al caber en una GPU de consumo, permite ejecutar la política en estaciones de trabajo con RTX 3060 o superiores sin necesidad de infraestructura de datacenter.
- Validación de datasets de teleoperación: ejecutar la política sobre el robot permite comprobar la calidad y coherencia de un dataset recién grabado antes de escalar el entrenamiento.
- Investigación en action chunking: sirve como referencia reproducible para estudiar el efecto del tamaño del chunk y de la resolución de cámara en la tasa de éxito de tareas de manipulación.
- Automatización de tareas repetitivas de pick-and-place: en entornos industriales ligeros, la política puede encadenarse con lógica externa para repetir la tarea "taskbox" de forma continua.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación en robot real para esta política.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 para los 51,7 M de parámetros; en la práctica, el cuello de botella es el procesamiento de dos imágenes de 480x640 a 30 FPS, no el peso del modelo.
- GPU recomendadas: cualquier GPU NVIDIA con al menos 4 GB de VRAM; RTX 3060, RTX 4060, RTX 4090, A100 o H100 son suficientes y sobradas.
- Cabe en GPU de consumo: sí, en cualquier GPU moderna de gama media o superior; también es viable en CPU para pruebas no críticas, aunque con mayor latencia.
- Opciones de despliegue: `lerobot-rollout` (CLI oficial de LeRobot) con `--policy.path=Haku-2004/act_k5end_input_20`; el resto de backends (vLLM, llama.cpp, Ollama, TGI) no aplican porque no es un modelo de lenguaje.
- Latencia y throughput estimados: no disponibles en la información proporcionada; el diseño apunta a control a 30 FPS, pero no se documentan mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Haku-2004/act_k5end_input_20` (este) | 51,7 M | no aplica | Imitación robótica (ACT), tarea "taskbox" | Apache 2.0 | Hugging Face Hub |
| Políticas ACT de referencia en LeRobot | no disponible | no aplica | Imitación robótica genérica | Apache 2.0 | Hugging Face Hub / LeRobot |
| Políticas Diffusion Policy | no disponible | no aplica | Imitación robótica visomotora | no disponible | Repositorios de investigación |
| Políticas VQ-BeT | no disponible | no aplica | Imitación robótica con cuantización vectorial | no disponible | Repositorios de investigación |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada; la comparación se limita a la categoría y a la licencia.

## Limitaciones y advertencias

- Especialización extrema: la política está entrenada únicamente para la tarea "taskbox" sobre un robot `so_follower` con dos cámaras concretas; no generaliza a otras tareas, objetos o configuraciones de cámara sin reentrenamiento.
- Sin evaluación publicada: la model card no reporta tasas de éxito en robot real, por lo que se desconoce su fiabilidad en producción.
- Dataset pequeño: 20 episodios y 25.815 fotogramas son una base limitada; es probable que la política sea sensible a cambios de iluminación, posiciones de objetos o distracciones.
- Dependencia del hardware: requiere un robot `so_follower` y dos cámaras con los nombres `front` y `side` exactamente como se definieron en el entrenamiento; cualquier desviación invalida la inferencia.
- Sin capacidades lingüísticas ni de razonamiento: no debe emplearse para tareas de texto, código o agentes.
- Riesgo de sobreajuste al entorno de grabación: al no documentarse variaciones en el dataset, es esperable un comportamiento frágil ante condiciones no vistas.
- Licencia Apache 2.0: permite uso comercial y modificación, pero el autor no ofrece garantías ni soporte; conviene citar el paper de ACT y LeRobot según indica la model card.
- Sin cuantizaciones publicadas: no hay versiones GGUF u otras, lo que limita el despliegue en entornos sin PyTorch.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Haku-2004/act_k5end_input_20
- Dataset de entrenamiento: https://huggingface.co/datasets/Haku-2004/k5_4seg
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de instalación: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia: https://huggingface.co/docs/lerobot/main/en/inference
- Visualizador de dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=Haku-2004/k5_4seg
