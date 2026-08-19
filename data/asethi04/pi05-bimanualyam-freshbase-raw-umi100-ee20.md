# ASethi04/pi05-BimanualYAM-freshbase-raw-umi100-ee20

## Resumen

Este modelo es un checkpoint de investigación del modelo Pi0.5 de Physical Intelligence, un modelo de visión-lenguaje-acción (VLA) de flujo diseñado para manipulación robótica. El autor, ASethi04, lo ha entrenado sobre la base "fresh-base" (base limpia) del modelo, con 12.000 pasos de optimizador y semilla 1000, para una tarea concreta de manipulación bimanual: recoger naranjas y colocarlas en un cuenco. Se trata de un experimento que combina exclusivamente datos UMI (100%) y sin datos de teleoperación (0%), lo que lo convierte en un checkpoint de investigación para evaluar el comportamiento del modelo con datos de demostración independientes.

El modelo cuenta con 4.143.404.816 parámetros (aproximadamente 4,14 mil millones), está formateado en safetensors y se integra con el ecosistema LeRobot. Su relevancia radica en que explora el ajuste fino de un modelo fundacional robótico para tareas bimanuales de largo horizonte, con una ventana de acción de 24 pasos (H24). Es un checkpoint intermedio, no un modelo final listo para producción, y su uso requiere medidas de seguridad adicionales en el lado de despliegue.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | VLA basada en flujo (Pi0.5) |
| Parámetros totales | 4.143.404.816 (4,14B) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (modelo de acción, no de texto) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura π0.5 de Physical Intelligence, un modelo de visión-lenguaje-acción que emplea un enfoque de flujo (flow matching) para la generación de acciones. El checkpoint se entrenó durante 12.000 pasos de optimizador con semilla 1000, utilizando una composición de datos de 100% del dataset UMI `brandonyang/dual-lidar-umi-independent` y 0% del dataset de teleoperación `brandonyang/yam-ultrawide-teleop`. La tarea concreta es "recoger naranjas y colocarlas en el bowl".

La representación de acciones es específica: por cada brazo, se predicen las coordenadas XYZ, las dos primeras filas de la matriz de rotación y la apertura del gripper normalizada, con una transformación temporal definida como `inverse(T_t) @ T_(t+k)` para k de 1 a 24. El orden de los brazos es izquierdo primero, luego derecho. No hay padding terminal, y la ejecución es exacta para el horizonte H24. Esta configuración está diseñada para control bimanual de precisión, sin contracción de rotación y con una ventana de predicción de 24 pasos.

## Capacidades

- Manipulación bimanual: control simultáneo de dos brazos robóticos con salida de acciones de 24 pasos (H24).
- Tarea específica: recogida y colocación de objetos (naranjas en un cuenco) mediante visión y acción conjunta.
- Integración con LeRobot: compatible con el ecosistema de la biblioteca LeRobot para robótica.
- Acciones de alta dimensión: incluye posición cartesiana (XYZ), orientación (dos filas de la matriz de rotación) y apertura del gripper normalizada.
- Sin capacidades de texto o lenguaje: es un modelo puramente de acción, no un chatbot ni un generador de texto.

## Casos de uso

- Investigación en manipulación bimanual: el modelo sirve como base para estudiar el rendimiento de un VLA en tareas de dos brazos con horizonte largo, comparando el efecto de datos UMI frente a teleoperación.
- Desarrollo de robots de recogida y colocación: puede desplegarse en un robot con dos brazos para ejecutar la tarea específica de recoger objetos (naranjas) y colocarlos en un recipiente, siempre que se implementen comprobaciones de seguridad.
- Evaluación de checkpoints de investigación: dado que es un checkpoint intermedio (fresh-base), se puede usar para medir la progresión del entrenamiento y comparar con otras variantes del autor (por ejemplo, con 95% UMI o con gripper largo).
- Benchmark de control bimanual: como modelo de referencia para comparar técnicas de control de acciones en entornos robóticos, especialmente con ventana de 24 pasos.
- Validación de pipelines de despliegue: sirve para probar la integración de modelos VLA con sistemas de IK y control de colisiones en robots reales, siguiendo el procedimiento de seguridad del autor.
- Desarrollo de modelos de manipulación generalista: al estar basado en π0.5, puede servir de punto de partida para ajustes adicionales en otras tareas bimanuales, aunque requiere trabajo adicional de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor no proporciona métricas de rendimiento, ni comparativas con otros modelos en tareas de manipulación.

## Requisitos de hardware

- VRAM estimada para inferencia: dado el tamaño de 4,14B parámetros y el tamaño del repositorio de 16,6 GB, se estima que la inferencia requiere al menos 16-24 GB de VRAM, dependiendo de la precisión de los pesos (FP32 o FP16). No se dispone de cuantizaciones oficiales.
- GPUs recomendadas: GPU de gama alta como NVIDIA RTX 4090 (24 GB), A100 (40/80 GB) o H100 (80 GB). Una RTX 3090 (24 GB) podría ser suficiente con pesos en FP16.
- Compatibilidad con GPU de consumo: sí, es posible ejecutarlo en GPUs de consumo con 24 GB de VRAM (RTX 3090/4090), pero no en tarjetas de menos de 16 GB sin cuantización.
- Opciones de despliegue: el modelo está integrado con LeRobot, por lo que puede ejecutarse mediante las herramientas de la biblioteca. No se mencionan compatibilidades con vLLM, llama.cpp u Ollama, dado que es un modelo robótico, no de texto.
- Latencia y rendimiento: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ASethi04/pi05-BimanualYAM-freshbase-raw-umi100-ee20 | 4,14B | H24 | Bimanual, recoger naranjas | no disponible | HuggingFace |
| ASethi04/pi05-BimanualYAM-freshbase-raw-umi95-teleop05-ee20 | no disponible | no disponible | Bimanual, variación con 95% UMI | no disponible | HuggingFace |
| ASethi04/pi05-BimanualYAM-long-gripper182-joint14 | no disponible | no disponible | Bimanual con gripper largo | no disponible | HuggingFace |
| π0.5 (Physical Intelligence) | no disponible | no disponible | VLA generalista de robótica | no disponible | openpi (GitHub) |

Los otros checkpoints del mismo autor son variaciones del mismo experimento, que difieren en la proporción de datos UMI/teleop o en la configuración del gripper. No hay comparativas directas con otros modelos de la misma categoría en la información disponible.

## Limitaciones y advertencias

- Checkpoint de investigación: no es un modelo listo para producción; requiere un pipeline de despliegue completo con IK, límites de articulaciones y colisiones.
- Tarea específica: está entrenado únicamente para la tarea de recoger naranjas y colocarlas en un bowl, por lo que no generaliza a otras tareas sin reentrenamiento.
- Sin capacidades de lenguaje: no puede procesar instrucciones textuales ni mantener conversaciones; es un modelo de acción.
- Licencia no disponible: no se especifica la licencia, lo que limita el uso comercial y la redistribución sin confirmación del autor.
- Datos no documentados: no hay información sobre el dataset de entrenamiento más allá de las referencias de HuggingFace, lo que impide evaluar sesgos o cobertura de escenarios.
- Riesgo de alucinación en acciones: como modelo de flujo, podría generar acciones inválidas o inseguras si no se aplican comprobaciones de seguridad I2RT en el despliegue.
- Instrucción del autor: se recomienda fijar la revisión inmutable del Hub (revisión inmutable) en lugar de `main`, para evitar cambios en el checkpoint.

## Enlaces

- HuggingFace: https://huggingface.co/ASethi04/pi05-BimanualYAM-freshbase-raw-umi100-ee20
- Variación con 95% UMI: https://huggingface.co/ASethi04/pi05-BimanualYAM-freshbase-raw-umi95-teleop05-ee20
- Variación con gripper largo: https://huggingface.co/ASethi04/pi05-BimanualYAM-long-gripper182-joint14
- Repositorio openpi (Physical Intelligence): https://github.com/Physical-Intelligence/openpi
- Página de π0.5 en Qualcomm AI Hub: https://aihub.qualcomm.com/models/pi05
- Web de Physical Intelligence: https://www.pi.website/
