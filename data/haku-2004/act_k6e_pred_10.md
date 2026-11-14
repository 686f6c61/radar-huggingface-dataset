# Haku-2004/act_k6e_pred_10

## Resumen

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación para robótica que predice secuencias cortas de acciones (chunks) en lugar de pasos individuales, lo que reduce el error de composición acumulado en tareas de manipulación de horizonte largo. Este repositorio concreto, `Haku-2004/act_k6e_pred_10`, es una política entrenada con LeRobot sobre el dataset `Haku-2004/k6_4seg` y publicada en Hugging Face con licencia Apache 2.0.

El modelo resuelve el problema de mapear observaciones visuales y de estado del robot a comandos motores continuos, aprendiendo directamente de datos de teleoperación sin necesidad de recompensas ni de un simulador. Es relevante para quien quiera desplegar o reproducir políticas de manipulación con el stack LeRobot, ya que sigue el formato estándar de la librería y puede evaluarse con `lerobot-record` sobre un robot SO-100 follower.

Con 51.672.714 parámetros y un tamaño de repositorio de 0,2 GB, es un modelo compacto pensado para inferencia en tiempo real en hardware de consumo, no un modelo de lenguaje. La información pública disponible no incluye detalles sobre el número de tokens de entrenamiento, la composición del dataset ni resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer ACT (Action Chunking with Transformers), política de imitación |
| Parametros totales | 51.672.714 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; ventana de observación definida por la política) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de robótica, sin procesamiento de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería LeRobot) |

## Arquitectura y entrenamiento

ACT se basa en un transformer encoder-decoder con un cuello de botella latente de tipo VAE. El encoder procesa las observaciones (imágenes de cámaras y estado de las articulaciones) y el decoder genera un chunk de acciones futuras de forma autorregresiva. La innovación principal del método original es la predicción de chunks de acciones, que suaviza la trayectoria y mitiga el error de composición típico de las políticas que predicen un único paso. El modelo incorpora además *temporal ensembling* durante la inferencia para promediar predicciones solapadas entre chunks consecutivos.

Este checkpoint concreto fue entrenado con LeRobot sobre el dataset `Haku-2004/k6_4seg`, que por el nombre sugiere episodios de 4 segundos, aunque no se dispone de información pública sobre el número de episodios, el número de tokens procesados, la resolución de las cámaras ni si se aplicaron aumentos de datos. No hay constancia de RLHF, DPO ni de ajuste por refuerzo; es aprendizaje supervisado por imitación puro.

## Capacidades

- Generación de comandos motores continuos para robots manipuladores a partir de observaciones visuales y de estado.
- Predicción de chunks de acciones, lo que permite ejecutar movimientos suaves y coherentes en el tiempo.
- Aprendizaje por imitación a partir de datos de teleoperación, sin función de recompensa.
- Integración nativa con el ecosistema LeRobot: entrenamiento con `lerobot-train` y evaluación con `lerobot-record`.
- Compatible con el robot SO-100 follower según los comandos de ejemplo de la model card.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües: es una política de control motor, no un modelo generativo de texto.

## Casos de uso

- Manipulación robótica de precisión en laboratorio: la política puede ejecutar tareas de pick-and-place sobre un SO-100 tras entrenarse con demostraciones teleoperadas del mismo entorno, aprovechando la predicción de chunks para trayectorias estables.
- Reproducción de experimentos de investigación en aprendizaje por imitación: sirve como punto de partida para comparar ACT con otros métodos de LeRobot (Diffusion Policy, VQ-BeT) sobre el mismo dataset.
- Evaluación de pipelines de LeRobot: al estar en el formato estándar, permite validar el flujo completo de `lerobot-record` con `--policy.path` apuntando a este checkpoint.
- Prototipado rápido en robótica de bajo coste: con 51,7 M de parámetros y 0,2 GB de pesos, cabe en GPUs de consumo y permite iterar sobre un robot SO-100 sin infraestructura dedicada.
- Tareas de ensamblaje de corto horizonte: el dataset de entrenamiento parece cubrir episodios de 4 segundos, adecuado para operaciones acotadas como insertar, apilar o trasladar objetos.
- Base para fine-tuning en entornos nuevos: al ser Apache 2.0, puede reentrenarse o adaptarse con datos propios sin restricciones de uso comercial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en precisión completa (51,7 M de parámetros en safetensors, repo de 0,2 GB); el grueso del consumo proviene del procesamiento de imágenes de las cámaras.
- GPU recomendadas: cualquier GPU con CUDA, incluida una RTX 3060 o superior; también es viable en GPUs integradas para inferencia a baja frecuencia.
- Cabe holgadamente en GPU de consumo (RTX 4090, RTX 3090, RTX 4060, etc.).
- Opciones de despliegue: LeRobot (`lerobot-record` con `--policy.path`), que es el flujo documentado por el autor; no se documentan exportaciones a ONNX, TensorRT ni llama.cpp (no aplica).
- Latencia y throughput: no disponibles. La latencia vendrá determinada por la frecuencia de control del robot y el coste de codificar las imágenes de entrada.

## Comparativa con modelos similares

| Modelo | Parametros | Enfoque | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ACT (este checkpoint) | 51,7 M | Chunking de acciones con transformer + VAE | no aplica | Apache 2.0 | Hugging Face, LeRobot |
| Diffusion Policy | no disponible | Difusión sobre acciones | no aplica | no disponible | Implementado en LeRobot |
| VQ-BeT | no disponible | Cuantización vectorial de comportamiento | no aplica | no disponible | Implementado en LeRobot |

No se dispone de datos de rendimiento comparativo entre estas políticas en la información proporcionada; la comparación se limita al enfoque metodológico.

## Limitaciones y advertencias

- Es una política específica para el robot y el entorno del dataset `Haku-2004/k6_4seg`; no generaliza a otros robots, cámaras o disposiciones sin reentrenamiento.
- No hay información pública sobre la composición del dataset, por lo que se desconoce su cobertura de escenarios y el riesgo de sobreajuste.
- El modelo no procesa lenguaje ni texto; cualquier expectativa de uso como LLM es incorrecta.
- Riesgo de fallo ante cambios de iluminación, posición de cámara u objetos no vistos durante el entrenamiento, típico del aprendizaje por imitación.
- Sin métricas publicadas de tasa de éxito, no es posible evaluar su fiabilidad antes de desplegarlo.
- La licencia Apache 2.0 permite uso comercial, pero la responsabilidad sobre el comportamiento físico del robot recae en el integrador.
- No se documentan sesgos ni evaluaciones de seguridad física; en producción debe existir un mecanismo de parada de emergencia independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Haku-2004/act_k6e_pred_10
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de políticas: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- Dataset de entrenamiento: https://huggingface.co/datasets/Haku-2004/k6_4seg
