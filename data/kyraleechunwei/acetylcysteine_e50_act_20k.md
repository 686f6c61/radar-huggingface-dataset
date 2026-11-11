# KyraLeeChunWei/Acetylcysteine_e50_ACT_20K

## Resumen

Acetylcysteine_e50_ACT_20K es una política de robótica basada en Action Chunking with Transformers (ACT), un método de aprendizaje por imitación presentado en el artículo arXiv 2304.13705 que predice fragmentos cortos de acciones en lugar de pasos individuales. El modelo ha sido entrenado y publicado en Hugging Face mediante LeRobot, la librería de aprendizaje por imitación para robótica de Hugging Face, y está asociado al conjunto de datos KyraLeeChunWei/e50_Acetylcysteine.

El checkpoint contiene 51.678.855 parámetros en formato safetensors y ocupa aproximadamente 0,2 GB, lo que lo sitúa en el rango de políticas ligeras diseñadas para control de robots manipuladores de sobremesa, como el brazo SO-100 referenciado en la documentación de LeRobot. No se trata de un modelo de lenguaje: es una política visomotora que mapea observaciones (imágenes de cámara y estado de las articulaciones) a secuencias de acciones motoras.

Su relevancia es práctica para quienes experimentan con manipulación robótica de bajo coste: ofrece un punto de partida reproducible, con licencia Apache 2.0, para entrenar y evaluar políticas ACT sobre datos de teleoperación propios, siguiendo el flujo de trabajo estándar de LeRobot (`lerobot-train` y `lerobot-record`).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con codificador visual y decodificador de acciones |
| Parámetros totales | 51.678.855 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos en safetensors; LeRobot no documenta cuantizaciones para esta política) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación (imitation learning) que combina un backbone visual con un transformer que predice "chunks" de acciones: en lugar de generar una única acción por paso, el modelo emite una secuencia corta de acciones futuras, lo que reduce el error de compounding y mejora la estabilidad del control. El entrenamiento se realiza sobre demostraciones de teleoperación, en este caso el dataset KyraLeeChunWei/e50_Acetylcysteine, con 20K pasos de entrenamiento según el nombre del checkpoint (e50, ACT, 20K).

No se dispone de información sobre el número exacto de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de regularización adicionales más allá de las propias de ACT (como el uso de un decoder con queries aprendidas). La innovación principal es la propia formulación de action chunking del paper original, que permite un control más suave y preciso en tareas de manipulación.

## Capacidades

- Control visomotor para robots manipuladores: genera comandos de articulaciones a partir de observaciones visuales y de estado.
- Predicción de secuencias de acciones (action chunking) en lugar de acciones individuales.
- Aprendizaje por imitación a partir de demostraciones de teleoperación.
- Integración nativa con LeRobot para entrenamiento, evaluación y despliegue.
- Compatible con robots tipo SO-100 follower (según la documentación de LeRobot).
- No soporta tool calling, agentes, razonamiento multi-step ni capacidades lingüísticas: es una política específica de robótica.

## Casos de uso

- Manipulación robótica de sobremesa: el modelo puede ejecutar tareas de pick-and-place sobre un brazo SO-100, aprovechando su entrenamiento en el dataset e50_Acetylcysteine para control fino de articulaciones.
- Investigación en aprendizaje por imitación: sirve como referencia reproducible para comparar variantes de ACT y analizar el efecto del action chunking en la tasa de éxito.
- Prototipado rápido de políticas: con 51,7M de parámetros y 0,2 GB, permite iterar entrenamientos en una sola GPU consumer y desplegar en hardware embebido.
- Evaluación de datasets de teleoperación: el checkpoint permite validar la calidad del dataset KyraLeeChunWei/e50_Acetylcysteine mediante `lerobot-record` y medir episodios de éxito.
- Educación y divulgación en robótica: su licencia Apache 2.0 y su integración con LeRobot facilitan su uso en cursos y talleres de robótica de bajo coste.
- Base para fine-tuning en tareas específicas: al ser un modelo pequeño, se puede reentrenar con nuevos datos de teleoperación para adaptarlo a otras tareas de manipulación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye tasas de éxito, métricas de error de posición ni comparaciones cuantitativas con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 (51,7M de parámetros, ~0,2 GB de pesos); en FP16 o cuantización ligera, aún menor.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4090) es suficiente; también es viable en GPUs integradas o en CPU para inferencia.
- Cabe en GPU consumer: sí, en cualquier GPU con al menos 2 GB de VRAM; también en dispositivos embebidos tipo Jetson.
- Opciones de despliegue: LeRobot (`lerobot-record` con `--policy.path`), que gestiona la inferencia sobre el robot; no se documentan integraciones con vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Acetylcysteine_e50_ACT_20K | 51.678.855 | no disponible | Apache 2.0 | Hugging Face (LeRobot) |
| ACT (paper original) | varía según implementación | no aplica | no disponible | Referencia académica |
| Otras políticas LeRobot (p. ej. Diffusion Policy, TDMPC) | varía | no aplica | varía según checkpoint | Hugging Face (LeRobot) |

No se dispone de datos cuantitativos de rendimiento para establecer una comparación rigurosa con alternativas.

## Limitaciones y advertencias

- El modelo está entrenado para una tarea y un robot concretos (dataset e50_Acetylcysteine, robot tipo SO-100); su generalización a otros robots o entornos es limitada.
- Riesgo de sobreajuste al dataset de teleoperación: no se documenta la diversidad de las demostraciones ni el número de episodios.
- No es un modelo de lenguaje: no procesa texto, no responde a instrucciones verbales y no tiene capacidades de razonamiento simbólico.
- La licencia Apache 2.0 permite uso comercial, pero no se ofrecen garantías sobre el rendimiento en producción.
- Posibles sesgos derivados de las condiciones de captura (iluminación, posiciones de cámara, objetos presentes en el dataset).
- No se han publicado métricas de éxito ni evaluaciones independientes, por lo que su fiabilidad en entornos reales no está cuantificada.

## Enlaces

- Hugging Face: https://huggingface.co/KyraLeeChunWei/Acetylcysteine_e50_ACT_20K
- Paper ACT: https://huggingface.co/papers/2304.13705
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento LeRobot: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Dataset asociado: https://huggingface.co/datasets/KyraLeeChunWei/e50_Acetylcysteine
