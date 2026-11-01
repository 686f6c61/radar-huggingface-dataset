# Haku-2004/act_so101_k_3

## Resumen
El modelo `Haku-2004/act_so101_k_3` es una política de robótica basada en ACT (Action Chunking with Transformers), un método de aprendizaje por imitación que predice secuencias cortas de acciones en lugar de pasos individuales. Lo desarrolla el usuario Haku-2004 y se ha entrenado y publicado mediante LeRobot, la librería de Hugging Face para aprendizaje por imitación en robótica. El modelo está orientado al control de un robot SO-101 (variante del SO-100), tal como indica el sufijo `so101` de su identificador.

El modelo resuelve el problema de generar comandos motores continuos a partir de observaciones visuales y del estado del robot, aprendiendo de datos de teleoperación. ACT es relevante porque logra tasas de éxito altas en tareas de manipulación con un coste computacional moderado, y este checkpoint concreto permite reproducir o continuar el entrenamiento sobre el dataset asociado `LeRobot_dataset_k_3_20261027_143829`.

Con 51.668.614 parámetros y un repositorio de 0,2 GB, es un modelo compacto pensado para inferencia en tiempo real sobre hardware de consumo. No es un modelo de lenguaje: no procesa ni genera texto, sino que actúa como política visuomotora dentro de un pipeline de robótica.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con codificador visual y decodificador de acciones |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; ventana de observación definida por la configuración de entrenamiento) |
| Tipos de cuantizacion | no disponible (pesos en safetensors sin cuantización publicada) |
| Idiomas soportados | no disponible (modelo de robótica, sin capacidades lingüísticas) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento
ACT es un transformer diseñado para aprendizaje por imitación que predice "chunks" de acciones, es decir, secuencias de posiciones articulares para varios pasos futuros en una sola pasada. Esto reduce el error de acumulación típico de las políticas que predicen un único paso y suaviza la ejecución. La arquitectura combina un codificador de imágenes (habitualmente ResNet) con un transformer que fusiona la observación visual, el estado de las articulaciones y las acciones previas para producir el chunk de acciones.

El entrenamiento se realizó con LeRobot sobre el dataset `Haku-2004/LeRobot_dataset_k_3_20261027_143829`, compuesto por episodios de teleoperación del robot SO-101. No se dispone de información sobre el número de episodios, el número de tokens o pasos de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de aumento de datos. El método original ACT incorpora una pérdida de reconstrucción de imagen auxiliar y regularización temporal (CVAE) para modelar la variabilidad humana, aunque no se detalla si este checkpoint concreto las mantiene activas.

## Capacidades
- Control visuomotor de un robot SO-101: genera comandos de articulación a partir de imágenes de cámara y del estado del robot.
- Predicción de chunks de acciones para ejecución suave y con menor acumulación de error.
- Aprendizaje por imitación a partir de demostraciones de teleoperación.
- Inferencia en tiempo real dentro del ecosistema LeRobot (`lerobot-record`, `lerobot-eval`).
- Reentrenamiento y ajuste fino con el comando `lerobot-train` sobre nuevos datasets.
- No dispone de tool calling, capacidades de agente, razonamiento simbólico ni procesamiento de lenguaje.

## Casos de uso
- Manipulación robótica de laboratorio: el modelo ejecuta tareas de pick-and-place aprendidas de demostraciones, adecuado por su bajo número de parámetros y su capacidad de predicción de chunks que suaviza el movimiento.
- Reproducción de experimentos de ACT: sirve como checkpoint de referencia para comparar variantes de entrenamiento sobre el robot SO-101 dentro del ecosistema LeRobot.
- Base para ajuste fino en tareas específicas: al ser un modelo compacto de 51,7 M de parámetros, se puede reentrenar con `lerobot-train` sobre nuevos datasets de teleoperación sin requerir grandes recursos.
- Evaluación de pipelines de imitación: útil para validar el flujo completo de LeRobot (grabación de datos, entrenamiento, evaluación con `lerobot-record`) antes de escalar a tareas más complejas.
- Prototipado educativo en robótica: su licencia Apache 2.0 y su tamaño reducido permiten usarlo en cursos y talleres de aprendizaje por imitación sin restricciones de uso comercial.
- Investigación en políticas visuomotoras: punto de partida para estudiar la variabilidad entre checkpoints y la sensibilidad al dataset de entrenamiento en tareas de manipulación con SO-101.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware
- VRAM estimada para inferencia: inferior a 1 GB en FP32 para los 51,7 M de parámetros (unos 207 MB solo de pesos), más el consumo del codificador visual y los buffers de inferencia.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM; una RTX 3060, RTX 4060 o superior es más que suficiente. También funciona en CPU para inferencia, aunque con mayor latencia.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU moderna, incluidas las integradas con suficiente memoria compartida.
- Opciones de despliegue: LeRobot (`lerobot-record` con `--policy.path`), con soporte de PyTorch y CUDA; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles en la información proporcionada; dependerá de la GPU, del número de cámaras y de la frecuencia de control del robot.

## Comparativa con modelos similares

| Modelo | Parámetros | Tipo | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Haku-2004/act_so101_k_3 | 51,7 M | ACT, imitación | no aplica | Apache 2.0 | Hugging Face (LeRobot) |
| Diffusion Policy (referencia) | variable, típicamente decenas de millones | difusión para acciones | no aplica | MIT (implementación de referencia) | Repositorios de investigación |
| SmolVLA | cientos de millones | VLA (visión-lenguaje-acción) | limitado | Apache 2.0 | Hugging Face (LeRobot) |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada, por lo que la comparación se limita a parámetros, tipo y licencia.

## Limitaciones y advertencias
- Especialización estrecha: el modelo está entrenado para un robot SO-101 y un dataset concreto; no generaliza a otros robots ni a tareas fuera de la distribución de entrenamiento.
- Riesgo de sobreajuste al entorno: cambios en la iluminación, la posición de las cámaras o los objetos pueden degradar el rendimiento de forma significativa.
- Sin capacidades lingüísticas ni de razonamiento: no debe evaluarse con benchmarks de texto ni usarse como modelo de lenguaje.
- Datos de entrenamiento no documentados: se desconoce el número de episodios, la diversidad de demostraciones y la calidad de las mismas, lo que impide estimar su robustez.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías sobre el rendimiento en producción ni sobre la seguridad física del robot.
- Advertencia de seguridad: cualquier despliegue en un robot real debe incluir límites de par, paradas de emergencia y supervisión, dado que el modelo puede generar acciones fuera de rango ante observaciones inesperadas.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/Haku-2004/act_so101_k_3
- Dataset de entrenamiento: https://huggingface.co/datasets/Haku-2004/LeRobot_dataset_k_3_20261027_143829
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de políticas: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
