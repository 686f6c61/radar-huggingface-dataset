# OlenaG/chesster_act_v3

## Resumen

`OlenaG/chesster_act_v3` es una política de imitación para robótica basada en ACT (Action Chunking with Transformers), entrenada y publicada con la librería LeRobot de Hugging Face. El modelo aprende a partir de datos de teleoperación y predice fragmentos de acción (action chunks) en lugar de pasos individuales, una estrategia que reduce el error de acumulación y suele mejorar las tasas de éxito en tareas de manipulación. Está pensado para ejecutarse sobre un robot `so_follower` con tres cámaras (top, front y hand) y un estado propioceptivo de 6 dimensiones.

El modelo resuelve una única tarea concreta: "Grab the figure from the blue square and put it into the green square" (coger la figura del cuadrado azul y colocarla en el cuadrado verde). Se entrenó sobre el dataset `OlenaG/chesster_v2`, con 100 episodios y 89.802 fotogramas a 30 FPS. No es un modelo de lenguaje ni un modelo multimodal general: es una política visomotora especializada que mapea observaciones (imágenes y estado) a comandos de acción de 6 dimensiones.

Con 51.668.614 parámetros y un repositorio de 0,2 GB, es un modelo compacto que puede ejecutarse en hardware modesto. Su relevancia es práctica: sirve como ejemplo reproducible de un pipeline completo de imitation learning en LeRobot, desde la grabación de datos hasta el despliegue con `lerobot-rollout`. La licencia no está especificada en la model card.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) |
| Parámetros totales | 51.668.614 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (política de imitación, no modelo de lenguaje) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no aplica (modelo de robótica, sin capacidades lingüísticas) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Librería | lerobot |
| Tipo de robot | `so_follower` |
| Entradas | `observation.state` (6,), `observation.images.top` (3, 480, 640), `observation.images.front` (3, 480, 640), `observation.images.hand` (3, 360, 640) |
| Salidas | `action` (6,) |
| Dataset de entrenamiento | `OlenaG/chesster_v2` (100 episodios, 89.802 fotogramas, 30 FPS) |
| Pasos de entrenamiento | 55.000 |
| Batch size | 8 |
| Optimizador | AdamW |
| Learning rate | 1e-05 |
| Semilla | 1000 |
| Versión de LeRobot | 0.7.1 |

## Arquitectura y entrenamiento

ACT es un método de imitation learning que combina un codificador visual y un transformer que predice secuencias cortas de acciones (chunks) en lugar de una sola acción por paso. Esta formulación, descrita en el paper arXiv:2304.13705, mitiga el problema de la acumulación de errores típico de las políticas que predicen un único paso y permite un control más suave y consistente. El modelo consume tres flujos de imagen (top, front, hand) junto con el estado del robot de 6 dimensiones, y produce un vector de acción de 6 dimensiones.

El entrenamiento se realizó sobre 100 episodios teleoperados (89.802 fotogramas a 30 FPS) del dataset `OlenaG/chesster_v2`, con 55.000 pasos, batch size 8, optimizador AdamW y learning rate 1e-05, usando LeRobot 0.7.1. No se documenta en la información disponible el uso de RLHF, DPO ni otras fases de ajuste posteriores; se trata de un entrenamiento supervisado de imitación puro. Tampoco se detalla la composición exacta del dataset más allá del número de episodios, fotogramas y la tarea descrita.

## Capacidades

- Control visomotor para manipulación robótica: mapea tres cámaras y el estado del robot a comandos de acción de 6 dimensiones.
- Predicción de action chunks: genera secuencias cortas de acciones en lugar de pasos aislados, lo que reduce el error acumulado.
- Ejecución de una tarea concreta de pick-and-place: "Grab the figure from the blue square and put it into the green square".
- Integración con el ecosistema LeRobot: compatible con `lerobot-rollout` para despliegue y `lerobot-train` para reentrenamiento.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, capacidades multilingües ni modos de pensamiento: es una política de robótica, no un modelo de lenguaje.
- No dispone de capacidades de visión general (VQA, OCR, detección abierta); las cámaras se usan únicamente como entrada para la política de control.

## Casos de uso

- Automatización de pick-and-place en laboratorio: el modelo ejecuta la tarea de coger una figura de un cuadrado azul y depositarla en uno verde, útil como banco de pruebas para validar hardware y calibración del robot `so_follower`.
- Reproducción de experimentos de imitation learning: sirve como referencia reproducible de un pipeline completo (grabación, entrenamiento y despliegue) con LeRobot 0.7.1 y el dataset `chesster_v2`.
- Base para fine-tuning en tareas similares: al ser una política ACT compacta (51,7 M de parámetros), puede reentrenarse con `lerobot-train` sobre nuevos datasets de manipulación con la misma configuración de robot y cámaras.
- Evaluación de infraestructura de inferencia robótica: permite medir latencia y throughput de `lerobot-rollout` en un robot real con tres cámaras a 30 FPS.
- Docencia y formación en robótica: ejemplo práctico de teleoperación, curado de datos y entrenamiento de políticas visomotoras en un entorno controlado.
- Pruebas de robustez ante variaciones de iluminación y posición: al estar entrenado sobre 100 episodios, permite estudiar cómo afectan cambios de escena al éxito de la política (aunque no se han publicado métricas de éxito).
- Integración en flujos de investigación sobre action chunking: comparación con otras políticas ACT o con métodos que predicen acciones paso a paso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye una sección de evaluación vacía con la nota "_No evaluation results have been provided for this policy yet._", por lo que no hay tasas de éxito, número de ensayos ni métricas de latencia documentadas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 51,7 M de parámetros en precisión FP32 el peso ronda los 0,2 GB, por lo que la VRAM necesaria es muy reducida (del orden de pocos GB incluyendo las tres cámaras y buffers).
- GPU recomendadas: no especificadas en la información disponible; por tamaño, cualquier GPU consumer moderna (RTX 3060 o superior) debería ser suficiente, aunque no hay datos oficiales.
- Cabe en GPU consumer: sí, por el reducido número de parámetros, aunque no se documenta el hardware exacto usado en el entrenamiento ni en la inferencia.
- Opciones de despliegue: `lerobot-rollout` (estrategia `base`) para ejecución en robot; `lerobot-train` para reentrenamiento. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput estimados: no disponibles. La política está pensada para operar a 30 FPS (frecuencia del dataset), pero no se publican mediciones reales.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parámetros | Entradas | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `OlenaG/chesster_act_v3` | ACT | 51,7 M | 3 cámaras + estado (6,) | Pick-and-place concreto | no disponible | Hugging Face (LeRobot) |
| Otras políticas ACT en LeRobot Hub | ACT | variable | variable | variable | variable | Hugging Face |
| Políticas Diffusion Policy en LeRobot | Diffusion Policy | variable | variable | variable | variable | Hugging Face |
| Políticas VLA (p. ej. OpenVLA) | Transformer visión-lenguaje-acción | del orden de miles de millones | imagen + instrucción textual | multi-tarea | variable | Hugging Face |

No se dispone de datos comparativos de rendimiento (tasas de éxito, latencia) entre este modelo y alternativas, ya que la model card no publica evaluaciones. La comparación se limita a características estructurales.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al entrenarse sobre 100 episodios de un único operador y entorno, la política puede sobreajustarse a las condiciones específicas de grabación (posiciones, iluminación, fondo).
- Riesgo de alucinación: no aplica en el sentido de generación de texto, pero sí existe riesgo de acciones erróneas o inseguras fuera de la distribución de entrenamiento.
- Limitaciones de contexto o idioma: no aplica; el modelo no procesa lenguaje natural ni tiene ventana de contexto textual.
- Restricciones de licencia: la licencia figura como "no disponible" y la model card indica "\[More Information Needed]"; no se puede asumir uso comercial sin consultar al autor.
- Caveat para producción: no hay evaluación publicada de tasa de éxito, robustez ni latencia; el despliegue en un robot real requiere validación previa y medidas de seguridad.
- Dependencia de hardware específico: entrenado para el robot `so_follower` con tres cámaras con nombres y resoluciones concretas (`top` 480x640, `front` 480x640, `hand` 360x640); cambiar la configuración requiere reentrenamiento.
- Tarea única: no generaliza a otras tareas sin fine-tuning sobre nuevos datos.
- Sin datos de cuantización: no se documentan formatos GGUF, AWQ, GPTQ ni similares.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OlenaG/chesster_act_v3
- Dataset de entrenamiento: https://huggingface.co/datasets/OlenaG/chesster_v2
- Paper de ACT: https://huggingface.co/papers/2304.13705 (arXiv:2304.13705)
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de instalación: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=OlenaG/chesster_v2
