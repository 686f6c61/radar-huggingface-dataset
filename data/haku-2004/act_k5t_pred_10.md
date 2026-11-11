# Haku-2004/act_k5t_pred_10

## Resumen

`Haku-2004/act_k5t_pred_10` es una política de robótica entrenada con el método Action Chunking with Transformers (ACT), una técnica de aprendizaje por imitación presentada en el paper arXiv:2304.13705 que predice fragmentos cortos de acciones (action chunks) en lugar de pasos individuales. El modelo ha sido entrenado y publicado en Hugging Face mediante LeRobot, la librería de aprendizaje automático para robótica real de Hugging Face. El autor es Haku-2004 y la licencia es Apache 2.0.

La política está especializada en una única tarea concreta: "taskbox", ejecutada sobre un robot de tipo `so_follower` (el seguidor del kit SO-100/SO-101 de LeRobot). Consume el estado articular de 6 dimensiones y dos cámaras (`front` y `side`) a resolución 480x640, y produce un vector de acción de 6 dimensiones. No es un modelo de lenguaje: es un controlador visual-motor de extremo a extremo con 51,67 millones de parámetros.

Su relevancia es acotada pero ilustrativa: sirve como ejemplo reproducible de entrenamiento de una política ACT con LeRobot 0.5.2 sobre un dataset pequeño (20 episodios, 25.815 fotogramas a 30 FPS), y como punto de partida para quien quiera replicar el flujo de trabajo de imitación en un robot de bajo coste. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y no incluye resultados de evaluación en robot real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con action chunking (ACT) |
| Parametros totales | 51.672.714 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de contexto textual; ventana de observación propia de ACT) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de robótica, sin capacidades linguisticas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria `lerobot`) |
| Tipo de robot | `so_follower` |
| Camaras de entrada | `front`, `side` (3, 480, 640) |
| Entrada de estado | `observation.state` (6,) |
| Salida de accion | `action` (6,) |
| Tamano del repositorio | 0.2 GB |

## Arquitectura y entrenamiento

ACT (Action Chunking with Transformers) es una arquitectura de aprendizaje por imitación que combina un codificador visual, un transformer que fusiona las observaciones (imágenes y estado propioceptivo) y un decodificador que emite un chunk de acciones futuras en lugar de una sola acción por paso. Esta formulación reduce el error de compounding y suaviza la ejecución en tareas de manipulación. El modelo tiene 51,67 millones de parámetros y no emplea mezcla de expertos ni mecanismos de atención lineal.

El entrenamiento se realizó sobre el dataset `Haku-2004/k5_4seg`, con 20 episodios, 25.815 fotogramas a 30 FPS y la tarea "taskbox". La configuración reportada es: 50.000 pasos, batch size 8, optimizador AdamW, learning rate 1e-05, semilla 1000 y LeRobot 0.5.2. No se documenta el uso de RLHF, DPO ni datos adicionales; se trata de imitación supervisada pura a partir de demostraciones teleoperadas.

## Capacidades

- Control visual-motor de extremo a extremo para la tarea "taskbox" sobre robot `so_follower`.
- Predicción de chunks de acción de 6 dimensiones a partir de estado articular de 6 dimensiones y dos vistas de cámara.
- Fusión multimodal de dos cámaras (`front` y `side`) con estado propioceptivo.
- Aprendizaje por imitación a partir de demostraciones teleoperadas.
- Ejecución de políticas en tiempo real mediante `lerobot-rollout`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües.
- No dispone de modo thinking, visión general, audio ni generación de texto.

## Casos de uso

- Replicación de experimentos de imitación en robótica de bajo coste: el modelo sirve como referencia para validar el pipeline completo de LeRobot (grabación, entrenamiento, rollout) sobre el kit SO-100/SO-101 con dos cámaras.
- Automatización de la tarea "taskbox": la política puede ejecutar la manipulación de una caja de tareas en un entorno controlado, siempre que las condiciones de iluminación y posicionamiento se aproximen a las del dataset original.
- Docencia y formación: útil para demostrar en clase cómo ACT aprende de 20 episodios teleoperados y cómo se despliega con `lerobot-rollout`.
- Base para fine-tuning: al estar en formato safetensors y con licencia Apache 2.0, puede reentrenarse con nuevos datasets propios para tareas de manipulación similares.
- Benchmark interno de infraestructura: sirve para medir latencia y throughput de inferencia en GPU consumer con un modelo de 51,67 M de parámetros y dos streams de vídeo 480x640 a 30 FPS.
- Prototipado de controladores visuales: permite comparar ACT frente a otras políticas de LeRobot (por ejemplo, Diffusion Policy o VQ-BeT) sobre el mismo dataset y robot.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación en robot real para esta política.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; por el tamaño (51,67 M de parámetros, ~0,2 GB en safetensors) es previsible que quepa holgadamente en GPUs consumer, aunque esta estimación no está confirmada por el autor.
- GPU recomendadas: no disponibles en la información proporcionada. Por tamaño, cualquier GPU con al menos 4-8 GB de VRAM debería ser suficiente, pero no hay dato oficial.
- Cabe en GPU consumer: previsiblemente sí, dado el tamaño del modelo, aunque no está verificado por el autor.
- Opciones de despliegue: `lerobot-rollout` (estrategia `base`), con `--policy.path=Haku-2004/act_k5t_pred_10` y `--policy.device=cuda` para entrenamiento. No se documentan opciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles. El modelo debe ejecutarse a 30 FPS para coincidir con la frecuencia del dataset.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entradas | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Haku-2004/act_k5t_pred_10` | 51,67 M | 2 camaras 480x640 + estado (6,) | taskbox (so_follower) | Apache 2.0 | Hugging Face, 0 descargas |
| Otras politicas ACT en LeRobot Hub | no disponible | variable segun robot | variable | variable | Hugging Face |
| Diffusion Policy (LeRobot) | no disponible | variable | manipulacion | variable | Hugging Face / repositorio LeRobot |
| VQ-BeT (LeRobot) | no disponible | variable | manipulacion | variable | Hugging Face / repositorio LeRobot |

No se dispone de datos comparativos de rendimiento entre estas políticas en la información proporcionada. La comparación se limita a categoría, licencia y disponibilidad.

## Limitaciones y advertencias

- Especialización extrema: la política está entrenada solo para la tarea "taskbox" sobre `so_follower`; no generaliza a otras tareas, robots ni configuraciones de cámara.
- Dataset muy pequeño: 20 episodios y 25.815 fotogramas; alta probabilidad de sobreajuste y baja robustez ante cambios de iluminación, posición de objetos o distracciones.
- Sin evaluación publicada: no hay tasa de éxito reportada en robot real, por lo que no puede afirmarse su fiabilidad en producción.
- Sesgos conocidos: no documentados, pero al derivarse de demostraciones teleoperadas hereda los sesgos de posicionamiento, velocidad y estilo del operador.
- Riesgo de alucinación: no aplica en el sentido lingüístico, pero sí existe riesgo de acciones erróneas o inseguras ante observaciones fuera de distribución.
- Limitaciones de idioma: no aplica; el modelo no procesa texto.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte; el uso en robots reales implica riesgos físicos que deben evaluarse de forma independiente.
- Caveat para producción: requiere calibración del robot, correspondencia exacta de los nombres de cámara (`front`, `side`) y una frecuencia de 30 FPS; el script de rollout no graba episodios con `--strategy.type=base`.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Haku-2004/act_k5t_pred_10
- Dataset de entrenamiento: https://huggingface.co/datasets/Haku-2004/k5_4seg
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=Haku-2004/k5_4seg
- Paper ACT: https://huggingface.co/papers/2304.13705 (arXiv:2304.13705)
- Guia ACT de LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabacion de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Repositorio LeRobot: https://github.com/huggingface/lerobot
