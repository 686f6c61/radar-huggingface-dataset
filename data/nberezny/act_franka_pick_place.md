# nberezny/act_franka_pick_place

## Resumen

`nberezny/act_franka_pick_place` es una política de imitación basada en Action Chunking with Transformers (ACT), publicada en el Hub de Hugging Face y entrenada con la librería LeRobot. No es un modelo de lenguaje: es un modelo de robótica que mapea observaciones visuales y de estado de un brazo Franka Panda simulado a comandos de acción de 8 dimensiones. El objetivo concreto es la tarea "Pick up the red cube and place it on the blue square", aprendida a partir de 50 episodios teleoperados.

El modelo emplea la arquitectura ACT descrita en el paper arXiv:2304.13705, que predice fragmentos de acción (action chunks) en lugar de pasos individuales, lo que reduce el error de acumulación y mejora la estabilidad en tareas de manipulación. Cuenta con 51.672.712 parámetros y consume dos cámaras RGB de 240x320 píxeles (overhead y wrist) más un vector de estado de 8 dimensiones.

Su relevancia es acotada pero clara: sirve como referencia reproducible de un pipeline completo de aprendizaje por imitación con LeRobot 0.7.0 sobre un robot simulado, útil para desarrolladores que quieran validar su cadena de entrenamiento, despliegue y evaluación antes de pasar a hardware real. La model card no incluye resultados de evaluación ni licencia declarada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) |
| Parametros totales | 51.672.712 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; política de robótica) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Libreria | lerobot 0.7.0 |
| Tipo de robot | franka_panda_sim |
| Camaras | overhead, wrist (3, 240, 320) cada una |
| Entrada de estado | observation.state, shape (8,) |
| Salida de accion | action, shape (8,) |
| Tamano del repositorio | 0.2 GB |

## Arquitectura y entrenamiento

ACT es un transformer encoder-decoder con un cuello de botella latente de tipo VAE que predice chunks de acciones de horizonte fijo. La política recibe dos flujos visuales (cámaras overhead y wrist) y el vector de estado del robot, y emite una secuencia de acciones de 8 dimensiones. El chunking de acciones es la innovación central del método: en lugar de predecir un único paso, el modelo genera varios pasos futuros de golpe, lo que mitiga el cambio de distribución entre entrenamiento e inferencia y suaviza la ejecución.

El entrenamiento se realizó sobre el dataset `nberezny/franka_pick_place_img` (50 episodios, 8016 frames, 20 FPS) con 20.000 pasos, batch size 8, optimizador AdamW y learning rate 1e-05, semilla 1000. No se documenta el uso de RLHF, DPO ni ningún ajuste posterior; es aprendizaje por imitación supervisado puro a partir de demostraciones teleoperadas. No se especifica el número de tokens de entrenamiento (no aplica) ni la composición detallada del dataset más allá de la tarea única.

## Capacidades

- Manipulación robótica pick-and-place sobre un Franka Panda simulado: recoger un cubo rojo y depositarlo sobre un cuadrado azul.
- Percepción visual multimodal a partir de dos cámaras RGB (overhead y wrist) a 240x320.
- Predicción de chunks de acción de 8 dimensiones (posición/orientación y pinza, según la convención del robot).
- Ejecución autónoma de la política mediante `lerobot-rollout`.
- Aprendizaje por imitación reproducible: el pipeline de entrenamiento está documentado y es replicable con `lerobot-train`.
- Soporte de tool calling / function calling: no disponible (no aplica).
- Soporte de agentes y razonamiento multi-paso: no disponible (no aplica).
- Capacidades multilingües: no disponible (no aplica).
- Modo thinking, visión general, audio: no disponible (solo visión para control motor).

## Casos de uso

- Validación de pipelines de LeRobot: sirve para comprobar de extremo a extremo la instalación, calibración de cámaras, entrenamiento y rollout antes de invertir en hardware real, ya que el robot es simulado.
- Reproducción de experimentos ACT: investigadores pueden reentrenar la política con el mismo dataset y configuración (20.000 pasos, lr 1e-05, semilla 1000) para estudiar la variabilidad del aprendizaje por imitación.
- Benchmark de referencia para tareas pick-and-place: permite comparar nuevas políticas contra una línea base conocida en la misma tarea y dataset.
- Docencia y formación en robótica: el par política + dataset + comandos CLI constituye un ejemplo didáctico completo de imitación visual-motora.
- Pruebas de integración de cámaras y calibración: el modelo exige dos cámaras con nombres `overhead` y `wrist`, lo que lo convierte en un test útil para validar la configuración de sensores.
- Desarrollo de sistemas de evaluación: al no incluir resultados de evaluación, puede usarse como caso para construir protocolos de medición de tasa de éxito en simulación.
- Base para fine-tuning en tareas similares: al ser un checkpoint ACT entrenado, puede servir de inicialización para variantes de pick-and-place con nuevos objetos o posiciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet."

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 51,7 M de parámetros en fp32, los pesos ocupan aproximadamente 0,2 GB; el consumo real dependerá del backend y de los buffers de las cámaras.
- GPU recomendadas: no especificadas por el autor. Cualquier GPU con soporte CUDA y suficiente memoria para el runtime de LeRobot debería bastar; el entrenamiento se realizó con `--policy.device=cuda`.
- ¿Cabe en GPU de consumo? Muy probablemente sí, dado el tamaño del modelo, aunque no hay confirmación oficial.
- Opciones de despliegue: LeRobot (`lerobot-rollout`, `lerobot-train`); no se documentan exportaciones a vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles. La frecuencia de control del dataset es de 20 FPS, pero no se publica la latencia de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| nberezny/act_franka_pick_place | 51,7 M | ACT | Pick-and-place Franka sim | no disponible | Hugging Face |
| Políticas ACT genéricas de LeRobot | no disponible | ACT | Manipulación variada | no disponible | Hugging Face / docs LeRobot |
| Diffusion Policy (referencia del ecosistema LeRobot) | no disponible | Diffusion | Manipulación variada | no disponible | Hugging Face / docs LeRobot |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al entrenarse con 50 episodios de una única tarea, la política está fuertemente especializada y probablemente no generalice a otros objetos, posiciones o iluminaciones.
- Riesgo de alucinación: no aplica en el sentido de LLM, pero sí existe riesgo de acciones erróneas o inseguras fuera de la distribución de entrenamiento.
- Limitaciones de contexto o idioma: no aplica; el modelo no procesa lenguaje, solo visión y estado.
- Restricciones de licencia: la licencia figura como "no disponible" y la model card indica "More Information Needed"; no debe asumirse uso comercial permitido.
- Entrenado en simulación (`franka_panda_sim`): la transferencia a un robot físico no está validada.
- Sin resultados de evaluación publicados: no hay tasa de éxito medida, lo que impide estimar su fiabilidad en producción.
- Dependencia de la configuración exacta de cámaras y claves de observación; un desajuste en nombres o resolución rompe la inferencia.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de uso comunitario ni validación externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nberezny/act_franka_pick_place
- Dataset de entrenamiento: https://huggingface.co/datasets/nberezny/franka_pick_place_img
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=nberezny/franka_pick_place_img
- Paper ACT: https://huggingface.co/papers/2304.13705
- Guía ACT de LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de instalación: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
