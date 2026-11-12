# Haku-2004/act_k3_pred_20

## Resumen

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación que predice secuencias cortas de acciones (chunks) en lugar de pasos individuales, lo que reduce el error de composición y mejora la estabilidad en tareas de manipulación robótica. Este repositorio concreto, `Haku-2004/act_k3_pred_20`, es una política entrenada con LeRobot sobre un dataset propio de 20 episodios teleoperados para la tarea "taskbox", destinada a un robot `so_follower` (SO-100/SO-101 de bajo coste).

El modelo es un transformer ligero de aproximadamente 51,7 millones de parámetros que consume el estado articular del robot (vector de 6 dimensiones) junto con dos cámaras RGB de 480x640 (vistas frontal y lateral) y produce un vector de acción de 6 dimensiones. El repositorio ocupa 0,2 GB y se distribuye en formato safetensors con licencia Apache 2.0.

Su relevancia es práctica más que de investigación: demuestra el flujo completo de entrenamiento y despliegue de políticas de imitación en robótica de bajo coste usando el stack de LeRobot, y sirve como referencia reproducible para quien quiera entrenar su propia política ACT sobre un brazo SO. No es un modelo de lenguaje ni un modelo fundacional: es una política específica de tarea con alcance muy acotado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con encoder visual y decoder de acciones |
| Parametros totales | 51.672.714 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (política de control robótico; no procesa texto) |
| Tipos de cuantizacion | no disponible (pesos safetensors en precisión original; no se documentan variantes GGUF/INT8) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje; la tarea se especifica como cadena "taskbox") |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 0,2 GB) |
| Tipo de robot | `so_follower` |
| Cámaras de entrada | `front`, `side` (3, 480, 640) |
| Entrada de estado | `observation.state` (6,) |
| Salida de acción | `action` (6,) |
| Dataset de entrenamiento | Haku-2004/LeRobot_dataset_k_3_4seg (20 episodios, 22.272 frames, 30 FPS) |
| Pasos de entrenamiento | 50.000 |
| Batch size | 8 |
| Optimizador | AdamW |
| Learning rate | 1e-05 |
| Seed | 1000 |
| Versión de LeRobot | 0.5.2 |

## Arquitectura y entrenamiento

ACT es un transformer diseñado para aprendizaje por imitación que predice un chunk de acciones futuras en cada paso de inferencia, en lugar de una sola acción. La arquitectura combina un backbone visual (procesa las dos imágenes de 480x640) con un encoder de estado y un decoder transformer que genera la secuencia de acciones. Esta formulación por chunks mitiga el problema de la acumulación de errores típico de las políticas paso a paso y produce trayectorias más suaves y estables, tal como se describe en el paper arXiv:2304.13705.

El entrenamiento se realizó con LeRobot 0.5.2 sobre el dataset `Haku-2004/LeRobot_dataset_k_3_4seg`, compuesto por 20 episodios teleoperados (22.272 frames a 30 FPS) para la tarea "taskbox". Se ejecutaron 50.000 pasos con batch size 8, AdamW y learning rate 1e-05, semilla 1000. No se documenta en la model card el uso de RLHF, DPO ni aumentos de datos; es aprendizaje supervisado puro sobre demostraciones. Tampoco se detalla la composición exacta del dataset más allá del número de episodios y frames.

## Capacidades

- Control robótico de manipulación: genera comandos de acción de 6 dimensiones para un brazo `so_follower` a partir de estado articular y dos vistas de cámara.
- Aprendizaje por imitación: reproduce comportamientos demostrados por teleoperación para la tarea "taskbox".
- Predicción por chunks de acción: emite secuencias cortas de acciones en lugar de pasos aislados, lo que mejora la suavidad y reduce el error acumulado.
- Percepción visual multi-cámara: integra simultáneamente las vistas `front` y `side` a resolución 480x640.
- Condicionamiento por tarea: acepta una cadena de tarea ("taskbox") en el comando de despliegue.
- No soporta tool calling, function calling, agentes multi-paso, razonamiento simbólico ni capacidades multilingües: no es un modelo de lenguaje.

## Casos de uso

- Manipulación de objetos tipo "taskbox" en un brazo SO: la política está entrenada específicamente para esta tarea y robot, por lo que su uso directo es la reproducción del comportamiento demostrado en el entorno de entrenamiento.
- Base reproducible para entrenar políticas ACT propias: sirve como referencia de configuración (50.000 pasos, batch 8, lr 1e-05) para quien entrene sobre su propio dataset de LeRobot.
- Prototipado rápido en robótica de bajo coste: al ocupar 0,2 GB y 51,7 M de parámetros, se puede desplegar en un PC con GPU consumer conectado al brazo, sin infraestructura de servidor.
- Investigación en aprendizaje por imitación: útil para comparar variantes de ACT, tamaños de chunk o configuraciones de cámaras sobre una misma tarea.
- Docencia y formación: ejemplo completo del pipeline LeRobot (grabación, entrenamiento, rollout) con un caso real y pequeño.
- Evaluación de generalización: permite medir la degradación de la política ante cambios de iluminación, posición de objetos o distracciones, ya que la model card indica que no se han reportado resultados de evaluación y deja ese análisis al usuario.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet." No se dispone de tasas de éxito en robot real, número de ensayos ni condiciones de evaluación.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 51,7 M de parámetros en FP32 los pesos ocupan aproximadamente 0,2 GB, por lo que la inferencia cabe holgadamente en cualquier GPU consumer con 4 GB o más, sumando el coste de procesar dos imágenes de 480x640.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA (por ejemplo, RTX 3060, RTX 4090, A100, H100) es suficiente; el cuello de botella real será la latencia del robot y las cámaras, no el modelo.
- Cabe en GPU consumer: sí, en cualquier GPU moderna con al menos 4 GB de VRAM; también es viable en CPU para pruebas, aunque con mayor latencia.
- Opciones de despliegue: LeRobot (`lerobot-rollout` con `--policy.path=Haku-2004/act_k3_pred_20`), y el stack de entrenamiento `lerobot-train`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de política).
- Latencia y throughput: no disponibles. La model card no reporta tiempos de inferencia ni frecuencia de control efectiva; el dataset se grabó a 30 FPS, pero no se especifica la tasa de ejecución de la política.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Entrada | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Haku-2004/act_k3_pred_20 | ACT (LeRobot) | 51,7 M | estado (6,) + 2 cámaras 480x640 | "taskbox" en `so_follower` | Apache 2.0 | Hugging Face |
| Políticas ACT genéricas de LeRobot | ACT | variable | estado + cámaras | depende del dataset | Apache 2.0 (típico) | Hugging Face / LeRobot |
| Diffusion Policy (referencia) | Política por difusión | variable | estado + cámaras | manipulación | variable | papers/repos |
| Políticas VLA (p. ej. RT-2, OpenVLA) | Vision-Language-Action | miles de millones | imagen + instrucción textual | múltiples tareas | variable | papers/repos |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada; la comparación se limita a tipo de arquitectura, entradas y licencia.

## Limitaciones y advertencias

- Especialización extrema: entrenada solo para la tarea "taskbox" sobre un robot `so_follower` concreto; no generaliza a otras tareas, objetos o morfologías sin reentrenamiento.
- Dataset muy pequeño: 20 episodios y 22.272 frames; riesgo alto de sobreajuste y baja robustez ante variaciones de iluminación, posición de objetos o distracciones.
- Sin evaluación publicada: no hay tasas de éxito en robot real, por lo que no se puede afirmar su fiabilidad en producción.
- Sin soporte de lenguaje: no procesa instrucciones en lenguaje natural más allá de la etiqueta de tarea; no es un modelo conversacional ni multilingüe.
- Dependencia de hardware específico: requiere el robot `so_follower` y dos cámaras configuradas con los nombres `front` y `side`; cambios en la configuración invalidan la política.
- Riesgo de alucinación en el sentido robótico: puede generar acciones plausibles pero incorrectas fuera de la distribución de entrenamiento, sin mecanismo de verificación.
- Licencia Apache 2.0: permite uso comercial y modificación, pero el autor no ofrece garantías; conviene revisar la licencia del dataset asociado.
- Repositorio sin descargas ni likes en el momento de la consulta: no hay evidencia de uso comunitario ni validación externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Haku-2004/act_k3_pred_20
- Dataset de entrenamiento: https://huggingface.co/datasets/Haku-2004/LeRobot_dataset_k_3_4seg
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=Haku-2004/LeRobot_dataset_k_3_4seg
- Paper de ACT: https://huggingface.co/papers/2304.13705 (arXiv:2304.13705)
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Documentación de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Guía de grabación y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
