# go234/act_chunk10

## Resumen

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación que predice fragmentos cortos de acciones en lugar de pasos individuales. El modelo `go234/act_chunk10` es una política entrenada con LeRobot que implementa este método sobre un robot `so_follower` (SO-100/SO-101 de LeRobot), consumiendo el estado articular y dos cámaras RGB para producir comandos de acción de 6 dimensiones. Resuelve una tarea concreta de manipulación: coger un cubo y depositarlo en una caja.

El modelo tiene 51.576.454 parámetros y un tamaño de repositorio de 0,2 GB, lo que lo sitúa en la categoría de políticas ligeras que pueden ejecutarse en tiempo real sobre hardware de consumo. Está entrenado sobre un dataset propio de 50 episodios y 24.423 fotogramas a 30 FPS, con 100.000 pasos de entrenamiento y un batch size de 8. Su relevancia es práctica: demuestra el flujo completo de LeRobot para grabar datos de teleoperación, entrenar una política ACT y desplegarla en un robot real.

La licencia Apache 2.0 permite uso comercial y modificación, aunque el modelo no ha publicado resultados de evaluación en robot real ni benchmarks estandarizados, por lo que su rendimiento efectivo en la tarea declarada no está cuantificado en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con encoder visual y decodificador de acciones |
| Parámetros totales | 51.576.454 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (política de imitación, no modelo de lenguaje) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (modelo de robótica, sin capacidades lingüísticas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería lerobot) |

## Arquitectura y entrenamiento

ACT es un transformer diseñado para aprendizaje por imitación que predice *chunks* de acciones (secuencias cortas de comandos) en lugar de un único paso, lo que reduce el error de acumulación y mejora la estabilidad en tareas de manipulación. La política recibe como entrada el estado de las articulaciones `observation.state` con forma `(6,)` y dos imágenes RGB de 480×640 píxeles procedentes de las cámaras `cam1` y `cam2`, y produce una acción de forma `(6,)`. El modelo emplea un encoder visual para procesar las imágenes y un decodificador transformer que genera el chunk de acciones.

El entrenamiento se realizó con LeRobot 0.6.0 sobre el dataset `go234/cube-box_20261013_041703`, compuesto por 50 episodios y 24.423 fotogramas a 30 FPS para la tarea "Pick up the cube and put it in the box." Se usaron 100.000 pasos de entrenamiento, batch size de 8, optimizador AdamW, learning rate de 1e-05 y semilla 1000. No se especifica en la información disponible si hubo aumentos de datos, RLHF/DPO (no aplicable en este paradigma) ni innovaciones adicionales más allá del propio chunking de acciones descrito en el paper.

## Capacidades

- Manipulación robótica de una tarea concreta: coger un cubo y colocarlo en una caja.
- Predicción de chunks de acciones de 6 dimensiones a partir de estado articular y dos vistas de cámara.
- Aprendizaje por imitación a partir de datos de teleoperación (no requiere modelado explícito del entorno).
- Ejecución en tiempo real sobre el robot `so_follower` mediante `lerobot-rollout`.
- Entrada multimodal: estado propioceptivo (`observation.state`) e imágenes RGB (`cam1`, `cam2`).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües; no es un modelo de lenguaje.
- No dispone de modo *thinking*, visión general, audio ni otras capacidades fuera del dominio robótico entrenado.

## Casos de uso

- Automatización de pick-and-place en laboratorio: el modelo ejecuta la tarea de coger el cubo y depositarlo en la caja sobre un SO-100/SO-101, útil para validar pipelines de imitación antes de escalar a tareas más complejas.
- Prototipado rápido de políticas con LeRobot: sirve como referencia reproducible del flujo `lerobot-train` → `lerobot-rollout` con un dataset pequeño (50 episodios) y una configuración documentada.
- Investigación en aprendizaje por imitación: permite comparar variantes de ACT (por ejemplo, distintos tamaños de chunk) sobre una misma tarea y dataset, ya que el nombre `chunk10` sugiere un chunk de 10 pasos.
- Docencia y formación en robótica: ejemplo completo y ligero (0,2 GB, 51,5 M de parámetros) para enseñar grabación de datos, entrenamiento y despliegue en hardware asequible.
- Base para *fine-tuning* en tareas similares: al estar bajo Apache 2.0, puede reentrenarse con nuevos datasets de manipulación de objetos pequeños y reutilizar la arquitectura y los hiperparámetros.
- Evaluación de robustez frente a cambios de iluminación, posición de objetos o distracciones: el modelo permite medir tasas de éxito en condiciones controladas, aunque el autor no ha publicado dichos resultados.
- Integración en bancos de pruebas de robot learning: como política de referencia para comparar con otros métodos (Diffusion Policy, VQ-BeT) en la misma tarea y robot.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente: *"No evaluation results have been provided for this policy yet."*

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 51,5 M de parámetros y pesos en FP32 (≈206 MB), la inferencia cabe holgadamente en GPUs de consumo con 4-8 GB de VRAM, aunque no se especifica el *footprint* exacto del encoder visual.
- GPU recomendadas: no disponible; LeRobot permite `--policy.device=cuda`, por lo que cualquier GPU NVIDIA con CUDA es compatible. Para tiempo real a 30 FPS se recomienda una GPU de gama media o superior (por ejemplo, RTX 3060 o superior), aunque no hay datos publicados de latencia.
- Cabe en GPU de consumo: sí, por tamaño de parámetros y de repositorio (0,2 GB), en tarjetas como RTX 3060, RTX 4060 o superiores; no confirmado oficialmente.
- Opciones de despliegue: LeRobot (`lerobot-rollout`), con soporte de `--policy.path=go234/act_chunk10`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles. La ejecución se realiza a 30 FPS según la configuración de cámaras del dataset, pero no se publica latencia medida.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| go234/act_chunk10 | ACT (LeRobot) | 51,5 M | no aplica | Pick cube into box (SO-100/SO-101) | Apache 2.0 | Hugging Face |
| Políticas ACT de LeRobot (referencia) | ACT | ~50 M (típico) | no aplica | Manipulación variada | Apache 2.0 | Hugging Face / LeRobot |
| Diffusion Policy | Política por difusión | no disponible | no aplica | Manipulación | no disponible | Repos académicos |
| VQ-BeT | Política con cuantización vectorial | no disponible | no aplica | Manipulación | no disponible | Repos académicos |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada; la comparación se limita a categoría, licencia y disponibilidad.

## Limitaciones y advertencias

- Sin resultados de evaluación: no hay tasas de éxito publicadas en robot real, por lo que el rendimiento en la tarea declarada es desconocido.
- Dataset muy pequeño: 50 episodios y 24.423 fotogramas limitan la generalización; es probable que el modelo sea sensible a cambios de posición, iluminación o fondo.
- Especialización extrema: solo realiza la tarea "Pick up the cube and put it in the box." sobre el robot `so_follower` con dos cámaras concretas; no es reutilizable fuera de ese dominio sin reentrenamiento.
- Dependencia de hardware: requiere el robot `so_follower` y cámaras con los nombres `cam1` y `cam2` y resolución 480×640; cualquier desviación en la configuración invalida la política.
- Sin capacidades lingüísticas: no procesa texto, por lo que no aplican sesgos de lenguaje, pero tampoco puede interpretar instrucciones en lenguaje natural.
- Riesgo de sobreajuste al entorno de grabación: al ser imitación pura, puede replicar comportamientos espurios de la teleoperación.
- Licencia Apache 2.0: permite uso comercial y modificación, pero el autor no ofrece garantías ni soporte; conviene citar el paper de ACT y LeRobot.
- Sin información sobre cuantizaciones ni despliegue en CPU: no se documenta si funciona en tiempo real sin GPU.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/go234/act_chunk10
- Dataset de entrenamiento: https://huggingface.co/datasets/go234/cube-box_20261013_041703
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=go234/cube-box_20261013_041703
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de instalación: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia: https://huggingface.co/docs/lerobot/main/en/inference
