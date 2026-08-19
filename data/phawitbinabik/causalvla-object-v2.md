# phawitbinabik/causalvla-object-v2

## Resumen

`phawitbinabik/causalvla-object-v2` es una política robótica de tipo *causal VLA* (Vision-Language-Action) entrenada con el framework LeRobot de Hugging Face. El modelo está diseñado para controlar un brazo robótico Panda en tareas de manipulación de objetos, concretamente para recoger objetos de una mesa y colocarlos en una cesta. Fue entrenado sobre el dataset `lerobot/libero_object_image`, que contiene 454 episodios con 66 984 frames a 10 FPS, abarcando diez tareas distintas de *pick-and-place* con objetos cotidianos como zumo de naranja, kétchup, leche o mantequilla.

El modelo tiene 450 millones de parámetros y consume dos imágenes (cámara fija y cámara de muñeca) junto con el estado del robot (8 dimensiones) para producir una acción de 7 dimensiones. Está publicado bajo licencia Apache 2.0 y los pesos están en formato safetensors, lo que facilita su integración en pipelines de robótica basados en LeRobot. Su relevancia radica en ser un ejemplo de política VLA causal entrenada con imitación, accesible para la comunidad y reproducible con las herramientas de LeRobot.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal VLA (vision-language-action) |
| Parametros totales | 450 046 176 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (depende de la secuencia de observaciones) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No aplica (modelo de robótica, sin procesamiento de lenguaje natural) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura corresponde a un modelo *causal VLA*, una familia de políticas que integran representaciones visuales y de estado del robot en un modelo autorregresivo para generar acciones. Aunque la información publicada no detalla la implementación interna (número de capas, mecanismo de atención, etc.), el modelo sigue el diseño estándar de LeRobot para VLA causales, donde las observaciones multimodales (imagen de cámara, imagen de muñeca y estado del robot) se tokenizan y se procesan de forma secuencial para predecir el siguiente vector de acción.

El entrenamiento se realizó con el dataset `lerobot/libero_object_image`, compuesto por 454 episodios y 66 984 frames. Se usó el optimizador AdamW con una tasa de aprendizaje de 0.0001, batch size de 16 y 25 000 pasos de entrenamiento, con semilla 1000. No se menciona el uso de RLHF, DPO ni otras técnicas de refinamiento; se trata de un entrenamiento supervisado de imitación (behavior cloning) sobre demostraciones. La versión de LeRobot empleada es la 0.6.1.

## Capacidades

- Control de un brazo robótico Panda mediante políticas de imitación, generando acciones de 7 dimensiones (posición y orientación del efector final).
- Procesamiento de dos flujos visuales simultáneos: imagen de cámara fija y imagen de muñeca, ambas a resolución 256×256.
- Integración del estado del robot (8 dimensiones) como entrada adicional para la predicción de acciones.
- Ejecución de tareas de *pick-and-place* sobre objetos específicos (10 tareas definidas en el dataset de entrenamiento).
- Inferencia en tiempo real a 10 FPS, compatible con el robot Panda de Franka Emika.
- Despliegue mediante la CLI de LeRobot (`lerobot-rollout`) y entrenamiento reproducible con `lerobot-train`.

## Casos de uso

- Automatización de líneas de recogida y empaquetado: el modelo puede controlar un brazo Panda para recoger objetos de una cinta y colocarlos en contenedores, reduciendo la intervención manual en entornos de producción.
- Investigación en aprendizaje por imitación: sirve como punto de partida para estudiar políticas VLA causales, comparar arquitecturas o desarrollar variantes con otros datasets de LeRobot.
- Prototipado de robótica de asistencia: en laboratorios, el modelo permite probar tareas de manipulación doméstica (recoger y colocar objetos) sin necesidad de programar trayectorias manualmente.
- Evaluación de generalización: al estar entrenado en 10 tareas con objetos distintos, puede usarse para medir la capacidad de generalización de políticas causales ante variaciones de posición y apariencia.
- Formación y demostración en robótica: el flujo de entrenamiento con LeRobot es reproducible, lo que facilita su uso en cursos o talleres sobre aprendizaje automático aplicado a robots.
- Base para *fine-tuning*: dado su tamaño moderado (450M parámetros) y licencia permisiva, puede adaptarse a nuevas tareas de manipulación mediante entrenamiento adicional con datasets propios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no hay resultados de evaluación en robot real ("No evaluation results have been provided for this policy yet"). Tampoco se ofrecen métricas de éxito por tarea ni comparaciones con otras políticas.

## Requisitos de hardware

- VRAM estimada: no disponible oficialmente. Con 450M parámetros y entradas de imagen 256×256, se estima que la inferencia requiere entre 4 y 8 GB de VRAM en FP32, reducible a 2-4 GB con cuantización (aunque no se ofrecen pesos cuantizados).
- GPU recomendadas: una GPU consumer con al menos 8 GB de VRAM (RTX 3070/4060 o superior) debería ser suficiente para inferencia; para entrenamiento se recomienda una GPU con 16 GB o más (RTX 4090, A5000, etc.).
- Compatibilidad con consumer GPU: sí, probablemente cabe en GPUs de gama media-alta, aunque el entrenamiento completo puede requerir más memoria.
- Opciones de despliegue: LeRobot proporciona scripts de rollout (`lerobot-rollout`) y soporta integración con el robot Panda. No se menciona compatibilidad con vLLM, llama.cpp u otros motores de inferencia, al ser un modelo de robótica, no un LLM.
- Latencia y throughput: no disponibles. El dataset se grabó a 10 FPS, lo que sugiere que la inferencia debería completarse en menos de 100 ms por paso para mantener tiempo real, pero no hay mediciones publicadas.

## Comparativa con modelos similares

No se dispone de información comparativa con otros modelos en la documentación proporcionada. Existen otros VLA como OpenVLA (7B parámetros) o RT-2 (Google), pero no se han publicado comparaciones con este modelo. Dado que se trata de una política entrenada específicamente sobre el dataset LIBERO, la comparación directa requeriría ejecutar evaluaciones estandarizadas, lo que no se ha documentado.

## Limitaciones y advertencias

- No se han publicado resultados de evaluación en robot real; el rendimiento en entornos no vistos es desconocido.
- El entrenamiento se limita a 10 tareas de *pick-and-place* con objetos concretos; la generalización a otros objetos, posiciones o entornos no está garantizada.
- El modelo depende de dos cámaras específicas (fija y de muñeca) y de un robot Panda; su uso con otros robots o configuraciones de cámara requeriría adaptación y reentrenamiento.
- No hay soporte de lenguaje natural: las tareas están codificadas implícitamente en el dataset y no se puede especificar una tarea nueva en tiempo de inferencia mediante texto.
- El tamaño del repositorio (8.1 GB) puede resultar pesado para despliegues en dispositivos con almacenamiento limitado.
- No se indica si los pesos están cuantizados; el uso en hardware de bajos recursos puede requerir conversión manual a formatos como GGUF o FP16.
- Al ser un modelo de imitación, puede heredar sesgos del dataset de demostraciones, como variaciones en la posición de los objetos o iluminación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/phawitbinabik/causalvla-object-v2
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Dataset LIBERO object image: https://huggingface.co/datasets/lerobot/libero_object_image
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=lerobot/libero_object_image
