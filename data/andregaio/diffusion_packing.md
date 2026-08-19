# AndreGaio/diffusion_packing

## Resumen

Este modelo es una política de control visuomotor basada en Diffusion Policy, entrenada con el framework LeRobot de Hugging Face. Diffusion Policy trata el control como un proceso generativo de difusión, produciendo trayectorias de acción suaves y multi-paso, especialmente adecuadas para manipulación robótica con contacto. El modelo fue desarrollado por AndreGaio y está especializado en la tarea de cargar gomas de borrar en un contenedor, usando un robot tipo SO-100 follower con dos cámaras (frontal y superior). Con 277,8 millones de parámetros y una arquitectura de difusión condicionada por observaciones, este modelo es un ejemplo de política entrenada mediante imitación a partir de demostraciones humanas, sin necesidad de ingeniería de recompensas. Su relevancia radica en que demuestra el flujo completo de LeRobot: registro de datos, entrenamiento y despliegue en robots reales, con una licencia Apache 2.0 que permite uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Policy (UNet + condicionamiento por observaciones) |
| Parametros totales | 277.840.246 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; procesa observaciones de estado e imágenes) |
| Tipos de cuantizacion | no disponible (solo safetensors en precisión original) |
| Idiomas soportados | no disponible (modelo de robótica, no lingüístico) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (1,1 GB) |

## Arquitectura y entrenamiento

Diffusion Policy es una arquitectura que modela la distribución de acciones futuras mediante un proceso de difusión denoising. En este caso, el modelo recibe como entrada el estado del robot (vector de 6 dimensiones) y dos imágenes RGB de 640x480 píxeles (cámaras frontal y superior). La salida es un vector de acción de 6 dimensiones (posiblemente posiciones o esfuerzos de las articulaciones). El entrenamiento se realizó con el framework LeRobot (versión 0.6.2) sobre un dataset de 5 episodios y 14.234 fotogramas a 30 FPS, con la tarea "Load erasers into container". Se usaron 5000 pasos de entrenamiento, batch size 8, optimizador Adam con learning rate 0,0001 y semilla 1000. No se menciona el uso de RLHF ni DPO; es un entrenamiento de imitación supervisada estándar para políticas de difusión. La innovación clave de Diffusion Policy (paper arXiv 2303.04137) es que la generación de acciones se formula como un problema de difusión, lo que permite generar trayectorias multimodales y robustas frente a perturbaciones.

## Capacidades

- Control visuomotor para manipulación robótica: genera acciones de 6 dimensiones a partir de observaciones de estado e imágenes.
- Generación de trayectorias multi-paso: produce secuencias de acciones suaves y coherentes, adecuadas para tareas de contacto como empujar, agarrar o insertar objetos.
- Manejo de multimodalidad: al ser un modelo generativo, puede representar múltiples soluciones válidas para una misma observación.
- Entrenamiento por imitación: aprende directamente de demostraciones humanas registradas con el robot.
- Integración con LeRobot: compatible con el ecosistema de Hugging Face para robótica, incluyendo herramientas de registro de datos, entrenamiento y despliegue.
- Soporte de dos cámaras: procesa simultáneamente imágenes de una cámara frontal y una superior, lo que proporciona información visual rica para la tarea.
- No es un modelo de lenguaje ni multimodal en el sentido tradicional; no soporta tool calling, agentes ni razonamiento simbólico.

## Casos de uso

- Manipulación industrial de piezas pequeñas: el modelo puede controlar un brazo robótico para cargar objetos (como gomas de borrar) en contenedores, una tarea típica de kitting o ensamblaje. Se usaría con el robot SO-100 y las cámaras configuradas según el flujo de LeRobot.
- Automatización de tareas repetitivas en laboratorios: por ejemplo, clasificar o empaquetar componentes pequeños. La política se puede ejecutar con `lerobot-rollout` y adaptar a diferentes configuraciones de cámaras.
- Investigación en aprendizaje por imitación: sirve como punto de partida para experimentar con Diffusion Policy en tareas de manipulación, comparando con otras arquitecturas (ACT, VQ-BeT) dentro de LeRobot.
- Desarrollo de nuevas tareas robóticas: el flujo de entrenamiento permite registrar un nuevo dataset y reentrenar la política con `lerobot-train`, cambiando la tarea y los datos.
- Prototipado rápido en robótica educativa: al ser un modelo pequeño (277M parámetros) y con licencia Apache 2.0, es adecuado para entornos académicos y de formación.
- Benchmarking de políticas de difusión: se puede evaluar la robustez de la política frente a variaciones en la posición de los objetos o condiciones de iluminación, aunque el autor no ha publicado resultados de evaluación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente "No evaluation results have been provided for this policy yet". No hay datos de éxito en tareas reales ni comparaciones con otras políticas. Por tanto, no se presenta tabla de rendimiento.

## Requisitos de hardware

- El modelo tiene 277,8 millones de parámetros. En precisión fp32, ocupa aproximadamente 1,1 GB (coincide con el tamaño del repositorio). En fp16, ocuparía unos 555 MB.
- Para inferencia en tiempo real con el robot, se recomienda una GPU con al menos 4 GB de VRAM, aunque el modelo podría caber en GPUs de 2 GB si se usa fp16. No se proporcionan requisitos oficiales.
- GPUs adecuadas: NVIDIA RTX 3060, RTX 4060, GTX 1660 Super o superiores. También funciona en GPUs de datacenter como T4 o A10.
- El despliegue se realiza mediante el comando `lerobot-rollout` de LeRobot, que gestiona la carga del modelo y la comunicación con el robot. No se menciona soporte para vLLM, llama.cpp u Ollama (no es un modelo de lenguaje).
- La latencia y el throughput dependen del hardware y de la configuración de las cámaras. No se proporcionan datos concretos, pero para un modelo de este tamaño, la inferencia en una GPU moderna debería ser inferior a 50 ms por paso.

## Comparativa con modelos similares

No se dispone de información comparativa con otros modelos en la documentación proporcionada. Diffusion Policy es una arquitectura establecida, y dentro del ecosistema LeRobot existen alternativas como ACT (Action Chunking with Transformers) o VQ-BeT, pero no se han proporcionado datos de estos modelos para este repositorio. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- El modelo fue entrenado con solo 5 episodios (14.234 fotogramas), lo que puede limitar su generalización a variaciones del entorno no vistas durante el entrenamiento.
- No se han publicado evaluaciones en robot real; el rendimiento real es desconocido.
- La tarea es muy específica ("Load erasers into container") y el modelo no es reutilizable directamente para otras tareas sin reentrenamiento.
- Depende de la configuración exacta de cámaras y del robot SO-100; cambios en la posición de las cámaras o en la cinemática del robot pueden degradar el rendimiento.
- Al ser un modelo de difusión, la generación de acciones puede ser estocástica; en aplicaciones de producción puede requerir fijar la semilla o usar estrategias de selección de la mejor trayectoria.
- No hay información sobre sesgos, pero al ser un modelo de robótica, los sesgos provienen principalmente del dataset de demostraciones (por ejemplo, preferencias del operador humano).
- Riesgo de alucinación: no aplica en el sentido lingüístico, pero el modelo puede generar acciones no válidas si las observaciones están fuera de la distribución de entrenamiento.
- Licencia Apache 2.0 permite uso comercial, pero se debe citar el método original (Diffusion Policy) y LeRobot según la indicación de la model card.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AndreGaio/diffusion_packing
- Paper de Diffusion Policy: https://huggingface.co/papers/2303.04137
- Dataset de entrenamiento: https://huggingface.co/datasets/AndreGaio/test-packing_20260816_160939
- Visualización del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=AndreGaio/test-packing_20260816_160939
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
