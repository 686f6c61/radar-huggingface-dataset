# 3cda2225/record-2black01_act_policy

## Resumen

`record-2black01_act_policy` es una política de imitación robótica entrenada con el método Action Chunking with Transformers (ACT), publicado en el paper arXiv 2304.13705. El modelo ha sido entrenado y subido al Hub mediante LeRobot, la librería de Hugging Face para aprendizaje por imitación en robótica. No es un modelo de lenguaje: es una política de control que mapea observaciones visuales y de estado del robot a secuencias de acciones motoras.

El modelo predice trozos de acción (action chunks) en lugar de pasos individuales, una estrategia que reduce el error de acumulación y mejora la estabilidad en tareas de manipulación aprendidas a partir de datos de teleoperación. Con 51.668.614 parámetros y un tamaño de repositorio de 0,2 GB, es un modelo compacto orientado a control en tiempo real sobre hardware asequible.

Es relevante para quienes trabajan en robótica de imitación con LeRobot, ya que sirve como checkpoint de referencia entrenado sobre un dataset concreto (`record-2black01_20261113_200355`) y puede reutilizarse, evaluarse o servir de base para reentrenamiento con el flujo estándar de LeRobot. El repositorio no incluye métricas de éxito ni detalles del dataset más allá del identificador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con codificador visual y decodificador de acciones |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (política de control, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no aplica; salida de acciones motoras) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería lerobot) |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que combina un backbone transformer con un esquema de predicción por chunks: en cada paso, el modelo emite un bloque de acciones futuras en lugar de una sola acción, lo que mitiga el error compounding típico de las políticas paso a paso. La arquitectura incorpora un codificador de imágenes (observaciones visuales) y un decodificador que genera la secuencia de acciones articulares del robot. El paper original reporta que este enfoque alcanza tasas de éxito altas en tareas de manipulación aprendidas de datos teleoperados.

El entrenamiento se realizó con LeRobot sobre el dataset `3cda2225/record-2black01_20261113_200355`, que no está descrito en la información disponible (número de episodios, frecuencia de control, tarea concreta y composición de observaciones no disponibles). No se documenta en la model card el uso de RLHF, DPO ni fases de ajuste posteriores; se trata de aprendizaje supervisado por imitación a partir de demostraciones. El comando de entrenamiento documentado usa `--policy.type=act`, dispositivo CUDA y logging opcional en Weights & Biases.

## Capacidades

- Predicción de chunks de acción para control de robots manipuladores a partir de observaciones visuales y de estado.
- Aprendizaje por imitación a partir de datos de teleoperación; no requiere definición manual de recompensas.
- Control de robots tipo `so100_follower` (referenciado en el flujo de evaluación de la model card).
- Integración nativa con el ecosistema LeRobot para entrenamiento, evaluación y despliegue.
- No soporta tool calling, function calling ni razonamiento multi-paso en el sentido de los modelos de lenguaje.
- No dispone de capacidades multilingües, de visión general ni de audio; la entrada visual se limita a las cámaras configuradas en el dataset de entrenamiento.

## Casos de uso

- Manipulación robótica de precisión en laboratorio: la política predice bloques de acciones que reducen la acumulación de error en tareas de pick-and-place aprendidas de demostraciones teleoperadas.
- Reentrenamiento sobre nuevos datasets: sirve como checkpoint de partida con `lerobot-train --policy.type=act` para adaptar la política a una tarea o robot distinto.
- Evaluación comparativa de políticas ACT: el flujo `lerobot-record` con `--policy.path` permite medir tasas de éxito sobre episodios de evaluación y contrastar con otras políticas del ecosistema LeRobot.
- Prototipado rápido en robótica de bajo coste: con 51,7 M de parámetros y 0,2 GB de pesos, el modelo es viable en estaciones con GPU de consumo para experimentación.
- Investigación en aprendizaje por imitación: base reproducible para estudiar el efecto del tamaño de chunk, la frecuencia de control y la composición del dataset en el éxito de la tarea.
- Docencia y formación en robótica: ejemplo completo del pipeline LeRobot (grabación de datos, entrenamiento, evaluación) con un modelo pequeño y licencia permisiva.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tasas de éxito, número de episodios de evaluación ni comparaciones con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 51,7 M de parámetros en precisión completa los pesos ocupan aproximadamente 0,2 GB, por lo que la inferencia cabe holgadamente en GPUs de consumo.
- GPU recomendadas: el flujo de entrenamiento documentado usa `--policy.device=cuda`; para inferencia en tiempo real se recomienda una GPU dedicada (por ejemplo, RTX 3060 o superior) aunque no se especifican modelos concretos.
- Cabe en GPU de consumo: sí, por tamaño de parámetros; la viabilidad en tiempo real depende de la frecuencia de control del robot y del coste del codificador visual.
- Opciones de despliegue: LeRobot (`lerobot-record` con `--policy.path`), con soporte de checkpoints locales o del Hub. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplicables a una política robótica).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| record-2black01_act_policy (este) | 51,7 M | no aplica | no disponible | apache-2.0 | Hugging Face Hub |
| Otras políticas ACT en LeRobot | no disponible | no aplica | no disponible | variable | Hugging Face Hub |
| Políticas Diffusion Policy (LeRobot) | no disponible | no aplica | no disponible | variable | Hugging Face Hub |

No se dispone de datos de benchmarks ni de especificaciones detalladas de políticas comparables en la información proporcionada, por lo que la comparación cuantitativa no está disponible.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, código ni respuestas conversacionales; cualquier uso fuera del control robótico no está soportado.
- La política está especializada en el robot y la tarea del dataset de entrenamiento; su generalización a otras morfologías, cámaras o entornos no está garantizada ni documentada.
- No se publican tasas de éxito, número de episodios ni condiciones de evaluación, por lo que el rendimiento real en producción es desconocido.
- Riesgo de sobreajuste al dataset de teleoperación concreto; se recomienda validar con `lerobot-record` antes de cualquier despliegue.
- El dataset de entrenamiento no está descrito en la información disponible (tarea, frecuencia, número de episodios), lo que dificulta evaluar su idoneidad para otros escenarios.
- Licencia apache-2.0: permite uso comercial y modificación, pero el autor no ofrece garantías ni soporte.
- Sin datos sobre sesgos, robustez ante cambios de iluminación o presencia de objetos no vistos en entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/3cda2225/record-2black01_act_policy
- Dataset de entrenamiento: https://huggingface.co/datasets/3cda2225/record-2black01_20261113_200355
- Paper ACT (arXiv 2304.13705): https://huggingface.co/papers/2304.13705
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de políticas: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- Repositorio LeRobot: https://github.com/huggingface/lerobot
