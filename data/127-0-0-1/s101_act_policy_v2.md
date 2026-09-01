# 127-0-0-1/s101_ACT_Policy_v2

## Resumen

El modelo `127-0-0-1/s101_ACT_Policy_v2` es una política de aprendizaje por imitación basada en el método Action Chunking with Transformers (ACT), desarrollada por el autor `127-0-0-1` y entrenada con el framework LeRobot de Hugging Face. ACT es una técnica de aprendizaje por imitación que predice secuencias de acciones (action chunks) en lugar de pasos individuales, lo que mejora la estabilidad y el éxito en tareas de manipulación robótica. El modelo está diseñado específicamente para el robot `so_follower` y resuelve la tarea de agarrar un cubo de Rubik y colocarlo en un bol.

Con 51,6 millones de parámetros, esta política consume observaciones de estado (6 dimensiones) y dos cámaras (superior y muñeca) a 480x640 píxeles, y produce acciones de 6 dimensiones. El entrenamiento se realizó sobre 70 episodios teleoperados (24.814 fotogramas a 30 FPS) con 100.000 pasos de entrenamiento. Su relevancia radica en que representa un ejemplo práctico de aplicación de ACT en robótica real, con licencia Apache-2.0 y pesos en formato safetensors, listo para desplegarse mediante LeRobot.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Action Chunking with Transformers (ACT) |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de robótica, no de lenguaje) |
| Tipos de cuantizacion | no disponible (pesos en fp32 por defecto en LeRobot) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación basado en transformers que predice secuencias de acciones (chunks) en lugar de acciones individuales. La arquitectura combina un codificador visual (para procesar las imágenes de las cámaras) con un transformer que modela la dependencia temporal entre las observaciones y las acciones. En este caso, el modelo consume dos imágenes (cámara superior y cámara de muñeca) de 480x640 píxeles y un vector de estado de 6 dimensiones, produciendo como salida un vector de acción de 6 dimensiones.

El entrenamiento se realizó con el framework LeRobot (versión 0.6.2) sobre un dataset de 70 episodios teleoperados (24.814 fotogramas a 30 FPS) para la tarea "Grab the rubix cube and put it in the bowl". Se usaron 100.000 pasos de entrenamiento con batch size 8, optimizador AdamW y learning rate de 1e-05, con semilla 1000. No se menciona el uso de RLHF ni DPO; el método es puramente de aprendizaje supervisado por imitación.

## Capacidades

- Manipulación robótica por imitación: ejecuta la tarea de agarrar un cubo de Rubik y colocarlo en un bol, aprendida mediante teleoperación.
- Procesamiento visual multimodal: integra dos flujos de cámara (superior y muñeca) junto con el estado del robot para generar acciones.
- Acciones por chunks: predice secuencias de acciones, lo que mejora la estabilidad y la tasa de éxito frente a métodos de predicción paso a paso.
- Integración con LeRobot: compatible con el ecosistema de entrenamiento y despliegue de LeRobot, incluyendo comandos CLI para rollout y entrenamiento.
- No soporta tool calling, agentes, razonamiento multilingüe ni capacidades de lenguaje, ya que es un modelo puramente robótico.

## Casos de uso

- Automatización de tareas de pick-and-place en entornos de laboratorio: el modelo puede ejecutar la tarea de agarrar un objeto (cubo de Rubik) y depositarlo en un contenedor, útil para investigación en robótica.
- Validación de políticas de imitación en robots reales: permite probar el enfoque ACT sobre el robot so_follower, evaluando tasas de éxito en condiciones controladas.
- Base para aprendizaje por imitación en tareas similares: el modelo puede servir como punto de partida para fine-tuning con nuevos datasets de teleoperación en tareas de manipulación.
- Desarrollo de sistemas de control robótico con visión: su entrada multimodal (dos cámaras + estado) lo hace adecuado para experimentos que requieren coordinación visuomotora.
- Benchmarking de algoritmos de imitación: al ser un modelo de referencia con pesos públicos, puede compararse con otras políticas entrenadas en el mismo hardware.
- Educación en robótica e IA: sirve como ejemplo didáctico de despliegue de una política ACT con LeRobot, incluyendo el flujo completo de entrenamiento y rollout.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación en robot real ("No evaluation results have been provided for this policy yet").

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de 51,6 millones de parámetros con entradas visuales de 480x640, se estima un consumo de memoria de entre 1 y 3 GB en fp32, dependiendo del batch size y del tamaño de los chunks de acción.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (por ejemplo, NVIDIA GTX 1650, RTX 3050, RTX 4090) es suficiente para inferencia en tiempo real. Para entrenamiento, se recomienda una GPU con 8 GB o más (RTX 3070, RTX 4080, A100).
- Compatibilidad con GPU de consumo: sí, cabe en GPUs de consumo como la RTX 3060 o superiores.
- Opciones de despliegue: LeRobot proporciona el comando `lerobot-rollout` para ejecutar la política en el robot. No se menciona compatibilidad con vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles en la información proporcionada; dependerán del hardware y del tamaño del chunk de acción configurado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Metodo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `127-0-0-1/s101_ACT_Policy_v2` | 51,7 M | no aplica | ACT | Apache-2.0 | Hugging Face |
| `AdithyaRajendran/so101_act_policy_V2` | no disponible | no aplica | ACT | no disponible | Hugging Face |

Ambos modelos son políticas ACT para el robot so_follower, pero no se dispone de datos comparativos de rendimiento. No se conocen otras alternativas directas en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no se han documentado sesgos específicos, pero al ser entrenado con un único dataset de 70 episodios, la generalización a otras posiciones, iluminación o variaciones del entorno es limitada.
- Riesgo de alucinación: no aplica (no es un modelo generativo de lenguaje), pero puede ejecutar acciones incorrectas si las observaciones difieren del dominio de entrenamiento.
- Limitaciones de contexto: la ventana de contexto está limitada al número de fotogramas procesados; no maneja tareas de largo horizonte sin re-entrenamiento.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero el hardware robótico asociado (robot so_follower) puede tener sus propias restricciones.
- Caveat para producción: no hay resultados de evaluación en robot real; se recomienda validar exhaustivamente antes de cualquier uso en producción. El modelo está entrenado para una tarea específica y no es transferible a otras tareas sin fine-tuning.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/127-0-0-1/s101_ACT_Policy_v2)
- [Dataset de entrenamiento](https://huggingface.co/datasets/127-0-0-1/s101-ACT_v2_20260831_195620)
- [Paper de ACT (arXiv:2304.13705)](https://huggingface.co/papers/2304.13705)
- [Repositorio LeRobot](https://github.com/huggingface/lerobot)
- [Guía de ACT en LeRobot](https://huggingface.co/docs/lerobot/main/en/act)
- [Documentación completa de LeRobot](https://huggingface.co/docs/lerobot/index)
