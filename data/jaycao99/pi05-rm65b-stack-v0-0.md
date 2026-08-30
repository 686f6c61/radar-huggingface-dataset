# JayCao99/pi05-rm65b-stack-v0.0

## Resumen

El modelo `JayCao99/pi05-rm65b-stack-v0.0` es un checkpoint de política robótica basado en Pi-0.5, un modelo de visión-lenguaje-acción (VLA) desarrollado originalmente por Physical Intelligence. Este checkpoint concreto ha sido subido por el usuario JayCao99 y está especializado en la tarea de apilamiento de bloques (stack blocks). Se distribuye a través de la librería LeRobot, lo que permite su carga directa con la clase `PI05Policy` para despliegue en robots.

El repositorio contiene un único checkpoint en el paso 30.000 de entrenamiento, con una pérdida final de 0.019. El tamaño total del repositorio es de 9,4 GB, lo que sugiere que los pesos están almacenados en precisión completa o media (FP32/BF16). No se proporciona información sobre licencia, idiomas ni especificaciones detalladas del modelo base, por lo que esta ficha se basa en la información disponible y en el conocimiento público sobre la arquitectura Pi-0.5.

La relevancia de este modelo radica en que demuestra el uso de Pi-0.5 para una tarea de manipulación concreta, y su publicación en HuggingFace facilita la reproducibilidad y el despliegue en entornos de robótica. Sin embargo, al ser un checkpoint específico, su utilidad fuera de la tarea de apilamiento de bloques es limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pi-0.5 (VLA con codificador SigLIP y dos expertos Gemma: PaliGemma 2B para procesamiento de contexto y un experto de acción para generación de trayectorias) |
| Parametros totales | no disponible (el checkpoint pesa 9,4 GB, pero no se indica el número de parámetros) |
| Parametros activos | no disponible (no se especifica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (los pesos están en formato safetensors, probablemente FP32 o BF16) |
| Idiomas soportados | no disponible (modelo orientado a robótica, no a procesamiento de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | safetensors (model.safetensors + config.json + pre/postprocessor) |

## Arquitectura y entrenamiento

Pi-0.5 es un modelo de visión-lenguaje-acción que combina un codificador de visión SigLIP con dos transformadores basados en Gemma. El primer experto, PaliGemma (con backbone de 2B parámetros), procesa el prefijo compuesto por imagen, texto y tokens de estado, y escribe una caché KV. El segundo experto, denominado "action expert", lee esa caché congelada y ejecuta un bucle de flow matching de 10 pasos con condicionamiento temporal adaRMS para generar una trayectoria de acción de 50 pasos para el robot.

El checkpoint `rm65b-stack-v0.0` ha sido entrenado mediante aprendizaje por imitación, como indica la etiqueta `imitation-learning` y el uso de LeRobot. El dataset asociado (`JayCao99/rm65b-stack-v0`) contiene 12 muestras de video, lo que sugiere un conjunto de datos pequeño, probablemente recopilado para una tarea específica de apilamiento de bloques. El entrenamiento alcanzó el paso 30.000 con una pérdida final de 0.019, lo que indica una convergencia razonable para una tarea de este tipo.

No se dispone de información sobre el número total de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. El proceso de subida se realizó mediante el script `goal_gen/upload_hf_checkpoints.sh`, lo que sugiere un flujo de trabajo automatizado para publicar checkpoints.

## Capacidades

- Generación de trayectorias de acción para robots: el modelo produce secuencias de 50 pasos de acciones (posiciones de articulaciones o comandos de efector final) a partir de observaciones visuales y de estado.
- Aprendizaje por imitación: está entrenado para replicar demostraciones humanas o teleoperadas en la tarea de apilamiento de bloques.
- Procesamiento multimodal: integra entrada de imagen (a través de SigLIP) y texto/estado (a través de PaliGemma) para condicionar la generación de acciones.
- Despliegue directo con LeRobot: se puede cargar con `PI05Policy.from_pretrained()` y usar en entornos de robótica compatibles con LeRobot.
- No es un modelo de lenguaje general: no genera texto, no soporta tool calling, ni razonamiento conversacional. Su única salida son acciones robóticas.

## Casos de uso

- Apilamiento de bloques en entornos de laboratorio: el modelo está específicamente entrenado para esta tarea, por lo que puede usarse en brazos robóticos para apilar bloques de colores o formas determinadas. Se cargaría con LeRobot y se conectaría a un robot compatible.
- Investigación en aprendizaje por imitación: sirve como punto de partida para estudiar el comportamiento de Pi-0.5 en tareas de manipulación con pocas demostraciones, dado que el dataset de entrenamiento es muy reducido (12 muestras).
- Benchmark de generalización: al ser un checkpoint concreto, puede utilizarse para evaluar la capacidad de Pi-0.5 de generalizar a variaciones de la tarea (diferentes posiciones de bloques, iluminación, etc.).
- Desarrollo de pipelines de robótica con LeRobot: el formato de checkpoint (con `pretrained_model/` y configuración) facilita la integración en flujos de trabajo existentes de LeRobot para entrenamiento y evaluación.
- Reproducibilidad de experimentos: al estar publicado en HuggingFace, permite a otros investigadores reproducir los resultados del entrenamiento y comparar con sus propios modelos.
- Transferencia a tareas similares: aunque no está entrenado para otras tareas, podría servir como inicialización para fine-tuning en tareas de manipulación relacionadas (por ejemplo, apilar objetos de diferentes formas).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El único dato de rendimiento es la pérdida final de entrenamiento (0.019) en el paso 30.000, pero no se proporcionan métricas de éxito en la tarea (por ejemplo, tasa de éxito en apilamiento) ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada: no disponible. El checkpoint pesa 9,4 GB, por lo que en FP16 se necesitarían al menos 10-12 GB de VRAM para cargar los pesos, más memoria para la caché KV y el procesamiento de imágenes. Se recomienda una GPU con al menos 16 GB de VRAM para inferencia cómoda.
- GPU recomendadas: no se especifican, pero por el tamaño y la arquitectura (dos transformadores Gemma), una GPU como RTX 4090 (24 GB) o A100 (40 GB) sería adecuada. En GPUs de menor capacidad (por ejemplo, RTX 3080 de 10 GB) podría no caber.
- Opciones de despliegue: LeRobot es la librería principal, pero también podría usarse con vLLM o TGI si se adapta el modelo a un formato de generación de secuencias, aunque no es el flujo estándar. Para inferencia en tiempo real, se requiere una GPU con suficiente memoria y baja latencia.
- Latencia y throughput: no disponibles. El proceso de flow matching de 10 pasos añade latencia adicional en comparación con modelos autoregresivos puros.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa directa con otros modelos de robótica. El modelo base Pi-0.5 de Physical Intelligence se puede comparar con otros VLA como OpenVLA o RT-2, pero este checkpoint específico no tiene métricas publicadas. Se indica lo siguiente:

| Modelo | Arquitectura | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Pi-0.5 (base) | SigLIP + Gemma experts | no publicado | no publicado | no disponible | openpi (GitHub) |
| OpenVLA | Prismatic + Llama 2 | 7B | 2048 | MIT | HuggingFace |
| RT-2 | PaLI-X + PaLM | 55B | 4096 | no disponible | no abierto |

Este checkpoint concreto no tiene comparativa directa con otros checkpoints de la misma tarea, ya que no se han encontrado modelos equivalentes en la búsqueda.

## Limitaciones y advertencias

- Sesgos conocidos: no se han documentado sesgos específicos, pero al ser un modelo entrenado con un dataset muy pequeño (12 demostraciones), es probable que tenga un sesgo hacia las condiciones específicas de las demostraciones (posición de cámara, tipo de robot, iluminación).
- Riesgo de alucinación: no aplica en el sentido de generación de texto, pero el modelo puede generar acciones incorrectas o inestables si las observaciones difieren de las del entrenamiento.
- Limitaciones de contexto: la ventana de contexto no está especificada, pero al ser un modelo de robótica, la entrada se limita a imágenes y estados, no a texto largo.
- Restricciones de licencia: la licencia no está disponible, por lo que no se puede garantizar el uso comercial. Se recomienda contactar con el autor antes de usar en producción.
- Limitaciones de tarea: el modelo está entrenado exclusivamente para apilamiento de bloques. No funcionará en otras tareas sin fine-tuning.
- Advertencia para producción: al ser un checkpoint de un usuario individual, no hay garantía de mantenimiento, soporte ni validación en entornos reales. Se recomienda evaluar exhaustivamente antes de cualquier despliegue.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/JayCao99/pi05-rm65b-stack-v0.0
- Dataset asociado: https://huggingface.co/datasets/JayCao99/rm65b-stack-v0
- Repositorio openpi (Physical Intelligence): https://github.com/Physical-Intelligence/openpi
- Documentación de componentes Pi-0.5 (M*): http://mstar.stanford.edu/mstar/_autosummary/mstar.model.pi05.components.html
- Documentación de configuración Pi-0.5 (M*): https://mstar.stanford.edu/mstar/_autosummary/mstar.model.pi05.config.html
