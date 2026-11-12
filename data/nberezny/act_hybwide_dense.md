# nberezny/act_hybwide_dense

## Resumen

`nberezny/act_hybwide_dense` es una política de imitación (imitation learning) para robótica basada en el método Action Chunking with Transformers (ACT), publicado en el paper arXiv:2304.13705. En lugar de predecir una única acción por paso de tiempo, el modelo predice "chunks" de acciones de corto horizonte, lo que reduce el error de composición acumulado y suele mejorar la tasa de éxito en tareas de manipulación. Está entrenada y publicada con la librería LeRobot de Hugging Face, y se distribuye como un checkpoint de 51,6 millones de parámetros en formato safetensors (0,8 GB de repositorio).

El modelo está especializado en una única tarea de manipulación sobre un robot Franka Panda simulado (`franka_panda_sim_hybrid_dense_rel`): coger un cubo rojo y colocarlo sobre una casilla azul. Consume dos cámaras (vista cenital y vista de muñeca) con imágenes de 240x320 píxeles y un vector de estado de 27 dimensiones, y produce un vector de acción de 10 dimensiones. Se entrenó sobre el dataset `nberezny/franka_pick_place_hybwide_dense`, con 1600 episodios y 58 016 frames a 20 FPS.

Su relevancia es acotada pero clara: sirve como referencia reproducible de un pipeline completo de LeRobot (grabación de datos, entrenamiento con ACT, despliegue con `lerobot-rollout`) para tareas pick-and-place en simulación. No es un modelo de lenguaje ni un modelo generalista; es una política robótica de nicho con cero descargas y sin métricas de evaluación publicadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con encoder visual y decoder de acciones |
| Parametros totales | 51.602.058 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; política por chunks de acciones) |
| Tipos de cuantizacion | no disponible (checkpoint safetensors en precisión de entrenamiento) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible (la model card indica "More Information Needed") |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT es un método de imitation learning que combina un backbone transformer con un encoder visual (procesa las dos cámaras, `overhead` y `wrist`, a 240x320) y un decoder que genera secuencias de acciones (chunks) condicionadas por el estado del robot (vector de 27 dimensiones). La salida es un vector de acción de 10 dimensiones. El enfoque de chunking mitiga el problema de la acumulación de errores típico de las políticas que predicen paso a paso, a costa de una menor frecuencia efectiva de corrección.

El entrenamiento se realizó con LeRobot 0.7.0 durante 100 000 pasos, batch size 8, optimizador AdamW con learning rate 1e-5 y semilla 1000. El dataset contiene 1600 episodios teleoperados y 58 016 frames a 20 FPS de la tarea "Pick up the red cube and place it on the blue square". No se documenta uso de RLHF, DPO ni aumentos de datos; es aprendizaje supervisado por imitación puro. No se especifican innovaciones adicionales más allá del propio mecanismo de action chunking del paper original.

## Capacidades

- Generación de secuencias de acciones robóticas (chunks) para control de un brazo Franka Panda simulado.
- Percepción visual multimodal mediante dos cámaras: vista cenital (`overhead`) y vista de muñeca (`wrist`), ambas RGB de 240x320.
- Condicionamiento por estado proprioceptivo del robot (vector de 27 dimensiones).
- Ejecución de una tarea concreta de pick-and-place: coger un cubo rojo y depositarlo sobre una casilla azul.
- Integración con el ecosistema LeRobot: entrenamiento con `lerobot-train` y despliegue con `lerobot-rollout`.
- No soporta tool calling, function calling, agentes multi-paso, razonamiento simbólico, matemáticas, código ni capacidades multilingües: no es un modelo de lenguaje.

## Casos de uso

- Reproducción de un pipeline de imitation learning: sirve como checkpoint de referencia para validar la instalación de LeRobot, la configuración de cámaras y el flujo `lerobot-train` → `lerobot-rollout` en un entorno controlado.
- Benchmark interno de tareas pick-and-place en simulación: al estar acotada a una tarea y un robot concretos, permite medir regresiones al cambiar hiperparámetros, aumentos de datos o versiones de LeRobot.
- Docencia y formación en robótica: el modelo y su dataset asociado permiten mostrar de extremo a extremo cómo se graba teleoperación, se entrena una política ACT y se evalúa en un Franka simulado.
- Punto de partida para fine-tuning: al ser un checkpoint pequeño (51,6 M de parámetros), se puede reentrenar con datos propios de otra tarea pick-and-place sobre el mismo robot simulado.
- Pruebas de integración de hardware y calibración: útil para verificar la correspondencia entre los nombres de cámara (`overhead`, `wrist`) y las claves de observación esperadas por la política antes de invertir en datos propios.
- Investigación comparativa de métodos de imitación: ACT como línea base frente a otros métodos de LeRobot (p. ej. diffusion policy) sobre el mismo dataset y robot.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "_No evaluation results have been provided for this policy yet._" No hay tasas de éxito, número de ensayos ni comparaciones numéricas con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint tiene 51,6 M de parámetros; en FP32 ocupa aproximadamente 0,2 GB de pesos, y en FP16 unos 0,1 GB. Sumando buffers de activación para dos cámaras a 240x320, la inferencia cabe holgadamente en cualquier GPU consumer con 4 GB o más.
- GPU recomendadas: cualquier GPU NVIDIA consumer moderna (RTX 3060, 4060, 4090) es suficiente; también es viable en CPU para inferencia a baja frecuencia.
- Cabe en GPU consumer: sí, con margen amplio.
- Opciones de despliegue: LeRobot (`lerobot-rollout`) como vía principal; el formato safetensors permite cargarlo con PyTorch directamente. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponible. La frecuencia de control viene determinada por el bucle de `lerobot-rollout` y por los 20 FPS del dataset de entrenamiento, pero no se publican cifras medidas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `nberezny/act_hybwide_dense` | 51,6 M | no aplica | Pick-and-place Franka sim | no disponible | Hugging Face (0 descargas) |
| Diffusion Policy (LeRobot) | no disponible | no aplica | Manipulación por difusión de acciones | MIT (librería LeRobot) | Hugging Face / GitHub |
| ACT original (paper 2304.13705) | no disponible | no aplica | Manipulación general con chunking | según paper | Referencia académica |

No se dispone de datos de rendimiento comparables entre estas alternativas en la información proporcionada; la comparación se limita a categoría, formato y disponibilidad.

## Limitaciones y advertencias

- Especialización extrema: la política solo se ha entrenado para una tarea ("Pick up the red cube and place it on the blue square") sobre un robot Franka Panda simulado; no generaliza a otras tareas ni a robots reales sin reentrenamiento.
- Sin evaluación publicada: no hay tasas de éxito ni protocolo de evaluación, por lo que no se puede afirmar su fiabilidad en producción.
- Licencia no especificada: la model card marca la licencia como "More Information Needed", lo que impide confirmar si el uso comercial está permitido.
- Cero tracción: 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso por terceros ni de validación externa.
- Dependencia del entorno: los nombres de cámara (`overhead`, `wrist`) y el tipo de robot (`franka_panda_sim_hybrid_dense_rel`) deben coincidir exactamente con la configuración de despliegue; cualquier desviación invalida la inferencia.
- Riesgo de sobreajuste al dataset: 1600 episodios de una única tarea y un único setup de iluminación y posiciones pueden provocar fallos ante cambios de posición de objetos, distracciones o variaciones de iluminación.
- Sin capacidades de lenguaje, razonamiento ni tool calling: no debe confundirse con un LLM ni usarse en pipelines de texto.
- Formato y versión: entrenado con LeRobot 0.7.0; versiones distintas de la librería pueden requerir ajustes en la carga del checkpoint.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nberezny/act_hybwide_dense
- Dataset de entrenamiento: https://huggingface.co/datasets/nberezny/franka_pick_place_hybwide_dense
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=nberezny/franka_pick_place_hybwide_dense
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rápida de comandos: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference
