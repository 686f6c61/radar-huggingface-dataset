# JoSTR/act_ram_v2

## Resumen

El modelo `JoSTR/act_ram_v2` es una política de control robótico basada en Action Chunking with Transformers (ACT), un método de aprendizaje por imitación que predice secuencias de acciones (chunks) en lugar de pasos individuales. Ha sido desarrollado por el usuario JoSTR y entrenado con el framework LeRobot de Hugging Face para ejecutar la tarea concreta de desbloquear y retirar un stick de memoria RAM utilizando un robot de doble brazo `Dual_xArm7`. El modelo procesa tres flujos de vídeo (cámara cenital y dos cámaras de muñeca) junto con el estado del robot, y genera comandos de acción de 16 dimensiones.

Con 51,7 millones de parámetros, este modelo representa un caso práctico de aplicación de ACT en manipulación fina de componentes electrónicos. Su relevancia radica en que demuestra cómo un transformer relativamente compacto puede aprender políticas de control visuomotor a partir de datos teleoperados, sin necesidad de modelos de lenguaje ni de razonamiento simbólico. El repositorio incluye el dataset de entrenamiento asociado, con 60 episodios y más de 87 000 fotogramas, y la licencia Apache 2.0 permite su uso y modificación sin restricciones comerciales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) |
| Parametros totales | 51 689 104 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (procesa imagenes y estado, no texto) |
| Tipos de cuantizacion | no disponible (solo safetensors) |
| Idiomas soportados | no disponible (modelo de robotica, no de lenguaje) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación basado en transformers que, en lugar de predecir una única acción por paso de tiempo, genera un chunk de acciones futuras (en este caso, un vector de 16 dimensiones). La arquitectura combina un codificador visual que procesa las tres cámaras (imagenes de 480x640 píxeles) con un codificador de estado del robot (vector de 16 valores), y un decodificador transformer que produce la secuencia de acciones. Esta predicción por chunks reduce la acumulación de errores y mejora la estabilidad del control en tareas de manipulación.

El entrenamiento se realizó con el framework LeRobot (versión 0.6.2) sobre un dataset propio de 60 episodios teleoperados, con 87 659 fotogramas a 30 FPS. Se emplearon 200 000 pasos de entrenamiento con un batch size de 64, optimizador AdamW y una tasa de aprendizaje de 1e-5, con semilla 1000. No se menciona el uso de técnicas de refuerzo adicionales como RLHF o DPO; el aprendizaje es puramente por imitación supervisada sobre las demostraciones.

## Capacidades

- Control robótico por imitación: aprende a replicar movimientos teleoperados para una tarea específica de manipulación.
- Percepción visual multicámara: procesa simultáneamente tres flujos de imagen (cenital, muñeca derecha e izquierda) con resolución 480x640.
- Integración de estado del robot: utiliza un vector de estado de 16 dimensiones como entrada adicional a las imágenes.
- Generación de acciones continuas: produce comandos de acción de 16 dimensiones (posiciones articulares o comandos de efector final).
- Especialización en tarea concreta: entrenado exclusivamente para "desbloquear y retirar un stick de RAM".
- No incluye capacidades de lenguaje, tool calling, agentes ni razonamiento simbólico; es un modelo puramente visuomotor.

## Casos de uso

- Automatización de desensamblaje de componentes electrónicos: el modelo puede integrarse en líneas de reciclaje o reparación de hardware para retirar módulos de memoria de forma autónoma, reduciendo la intervención manual.
- Investigación en aprendizaje por imitación: sirve como referencia para estudiar la transferencia de políticas ACT entre diferentes configuraciones de robot y cámaras.
- Desarrollo de robots de laboratorio: permite replicar tareas de manipulación fina en entornos de investigación donde se requiere precisión repetitiva.
- Pruebas de robustez en control visuomotor: al estar entrenado con tres cámaras, puede evaluarse la tolerancia a cambios de iluminación o posición de objetos.
- Formación de operarios mediante teleoperación: el modelo puede utilizarse como base para que un robot aprenda nuevas tareas a partir de demostraciones humanas, acelerando la puesta en marcha.
- Integración en pipelines de LeRobot: al ser compatible con el ecosistema LeRobot, puede combinarse con otros módulos de captura de datos, evaluación y despliegue en robots reales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no hay resultados de evaluación para esta política ("No evaluation results have been provided for this policy yet"). No se dispone de métricas como tasa de éxito en el robot real ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada: no disponible. Dado el tamaño del modelo (51,7 M de parámetros) y la entrada de tres imágenes de 480x640, se estima que la inferencia puede ejecutarse en GPUs con al menos 6-8 GB de VRAM, aunque no hay datos oficiales.
- GPU recomendadas: no especificadas. Por las características del modelo, una GPU de gama media como una RTX 3060 o superior podría ser suficiente para inferencia en tiempo real, pero no hay confirmación.
- Compatibilidad con GPU de consumo: probablemente sí, dado el reducido número de parámetros, pero no hay datos verificados.
- Opciones de despliegue: el modelo se utiliza principalmente con LeRobot mediante el comando `lerobot-rollout`. No es compatible con vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (políticas ACT para robótica con LeRobot). No hay datos públicos de otros modelos con la misma arquitectura y tarea que permitan una comparación objetiva. Se indica "no disponible".

## Limitaciones y advertencias

- Especialización extrema: el modelo está entrenado únicamente para la tarea de desbloquear y retirar un stick de RAM. No generaliza a otras tareas ni a variaciones significativas del entorno.
- Dependencia de la configuración hardware: requiere el robot `Dual_xArm7` y las tres cámaras específicas (cenital, muñeca derecha e izquierda) con las mismas posiciones y calibración que en el entrenamiento.
- Sin evaluación de robustez: no se han publicado pruebas en el robot real, por lo que se desconoce su tasa de éxito ante perturbaciones, cambios de iluminación o variaciones en la posición de los objetos.
- Riesgo de sobreajuste: con solo 60 episodios de entrenamiento, el modelo puede memorizar las demostraciones y fallar ante condiciones no vistas.
- No es un modelo de lenguaje: no puede procesar texto, mantener conversaciones ni realizar razonamiento simbólico.
- Licencia Apache 2.0: permite uso comercial y modificación, pero el usuario debe asumir la responsabilidad de su aplicación en entornos reales.

## Enlaces

- Repositorio del modelo: https://huggingface.co/JoSTR/act_ram_v2
- Paper de ACT: https://huggingface.co/papers/2304.13705
- LeRobot (framework): https://github.com/huggingface/lerobot
- Dataset de entrenamiento: https://huggingface.co/datasets/JoSTR/rm_ram_20260831_145557
- Documentación de LeRobot para ACT: https://huggingface.co/docs/lerobot/main/en/act
