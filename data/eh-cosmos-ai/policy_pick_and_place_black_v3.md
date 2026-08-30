# eh-cosmos-ai/policy_pick_and_place_black_v3

## Resumen

Este modelo, identificado como `eh-cosmos-ai/policy_pick_and_place_black_v3`, es una política de control robótico basada en el método Action Chunking with Transformers (ACT), entrenada mediante aprendizaje por imitación con el framework LeRobot de Hugging Face. El autor, `eh-cosmos-ai`, ha publicado el modelo junto con un dataset asociado (`eh-cosmos-ai/dataset_pick_and_place_black_v3`) para la tarea de pick and place, es decir, la manipulación de objetos con un brazo robótico. El modelo tiene aproximadamente 51,7 millones de parámetros y se distribuye en formato safetensors bajo licencia Apache 2.0.

ACT es una técnica de aprendizaje por imitación que predice secuencias de acciones (chunks) en lugar de pasos individuales, lo que mejora la estabilidad y el éxito en tareas de manipulación. Este modelo concreto está entrenado para operar con el robot SO-100 (versión seguidora) y se puede cargar y ejecutar directamente con las herramientas de LeRobot. Su relevancia radica en ser un ejemplo de política open source para robótica, reproducible y lista para evaluar en entornos reales o simulados, aunque no se proporcionan métricas de rendimiento publicadas en la ficha.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Action Chunking with Transformers (ACT) - transformer con decodificador autoregresivo |
| Parametros totales | 51.668.614 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (depende de la configuracion de chunking, tipicamente 1-2 segundos de acciones) |
| Tipos de cuantizacion | No disponible (se distribuye en safetensors con precision FP32/FP16 probablemente) |
| Idiomas soportados | No aplica (modelo de control motor, no de lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación que emplea un transformer con un decodificador autoregresivo. En lugar de predecir una única acción por paso de tiempo, el modelo predice un "chunk" de acciones futuras (por ejemplo, 50-100 pasos), lo que reduce la propagación de errores y mejora la consistencia del movimiento. La arquitectura incluye un codificador de imágenes (típicamente ResNet) para procesar la observación visual del robot, y un decodificador que genera las acciones articulares. El entrenamiento se realiza mediante imitación de demostraciones teleoperadas, donde el modelo aprende a mapear observaciones (imágenes y estados del robot) a secuencias de acciones.

En este caso, el modelo fue entrenado con el framework LeRobot, que gestiona el dataset, el entrenamiento y la evaluación. No se especifican detalles del dataset (número de episodios, duración, variabilidad de objetos, etc.) ni del proceso de entrenamiento (épocas, optimizador, aumentación de datos). El modelo está diseñado para el robot SO-100, un brazo de bajo coste con 6 grados de libertad, y se asume que el dataset contiene demostraciones de tareas de pick and place en un escenario concreto (posiblemente con objetos negros, según el nombre del dataset). No hay información sobre técnicas adicionales como RLHF o DPO, ya que no es un modelo de lenguaje.

## Capacidades

- Control robótico de manipulación: ejecuta tareas de pick and place (coger y colocar objetos) con un brazo SO-100.
- Aprendizaje por imitación: reproduce comportamientos aprendidos de demostraciones teleoperadas.
- Predicción de secuencias de acciones: genera chunks de acciones para movimientos fluidos y coordinados.
- Integración con LeRobot: compatible con las herramientas de entrenamiento, evaluación y registro de LeRobot.
- Inferencia en tiempo real: diseñado para ejecutarse en un robot físico o en simulación, con baja latencia (no se especifica el throughput).
- Sin capacidades de lenguaje ni visión general: el modelo procesa imágenes y estados del robot, pero no es un modelo multimodal de propósito general.

## Casos de uso

- Automatización de tareas de pick and place en entornos de laboratorio: el modelo puede controlar un brazo SO-100 para coger objetos y colocarlos en posiciones determinadas, útil para investigación en robótica.
- Prototipado de políticas de manipulación: los desarrolladores pueden usar este modelo como punto de partida para entrenar políticas similares con sus propios datasets, gracias a la integración con LeRobot.
- Evaluación de algoritmos de aprendizaje por imitación: sirve como referencia para comparar con otras arquitecturas (por ejemplo, diffusion policies) en la misma tarea.
- Educación y formación en robótica: permite a estudiantes y docentes experimentar con un modelo de control real sin necesidad de diseñar un sistema desde cero.
- Desarrollo de aplicaciones de robótica asistencial: aunque el robot SO-100 es de bajo coste, la política puede adaptarse a tareas sencillas de asistencia en entornos controlados.
- Investigación en generalización de políticas: al estar entrenado con un dataset específico, se puede estudiar la transferencia a otros objetos o configuraciones, aunque no se han publicado resultados al respecto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tasas de éxito, métricas de precisión ni comparaciones con otros métodos. Para obtener datos de rendimiento sería necesario ejecutar una evaluación propia utilizando las herramientas de LeRobot (por ejemplo, `lerobot-record` con episodios de prueba).

## Requisitos de hardware

- VRAM estimada para inferencia: dado que el modelo tiene ~51,7 millones de parámetros, en FP32 ocuparía unos 207 MB. Con una cuantización FP16 (si estuviera disponible) ocuparía unos 103 MB. En la práctica, la inferencia de ACT requiere además memoria para las imágenes de entrada (típicamente 224x224 o similar). Se estima que una GPU con al menos 2 GB de VRAM sería suficiente para ejecutar el modelo en tiempo real.
- GPU recomendadas: cualquier GPU NVIDIA con CUDA, por ejemplo GTX 1060 6GB, RTX 2060, RTX 3060, o superiores. No se requieren GPUs de gama alta.
- Compatibilidad con GPU de consumo: sí, cabe en cualquier GPU consumer moderna con al menos 4 GB de VRAM (para margen con el procesamiento de imágenes).
- Opciones de despliegue: LeRobot ofrece scripts de entrenamiento e inferencia. También se puede cargar el modelo con la librería `lerobot` en Python y ejecutarlo en un robot real o en simulación (por ejemplo, MuJoCo). No se menciona compatibilidad con vLLM, llama.cpp u otros servidores de inferencia de modelos de lenguaje, ya que no es un modelo de texto.
- Latencia y throughput: no disponibles. Dependen del hardware y de la frecuencia de control del robot (típicamente 10-50 Hz en SO-100). El modelo debe ser capaz de generar un chunk de acciones en tiempo real, lo cual es factible con la mayoría de GPUs modernas.

## Comparativa con modelos similares

No se dispone de información suficiente para una comparativa rigurosa. Existen otros modelos de políticas robóticas publicados en Hugging Face bajo el ecosistema LeRobot, como por ejemplo políticas basadas en ACT o en Diffusion Policy para diferentes robots (ALOHA, SO-100, etc.). Sin embargo, no se han encontrado datos concretos de estos modelos comparables (parámetros, rendimiento, licencia) en la información proporcionada. Se recomienda consultar el Hub de Hugging Face con el filtro `library_name:lerobot` para explorar alternativas.

## Limitaciones y advertencias

- Sesgos del dataset: el modelo está entrenado con demostraciones de un dataset específico (probablemente con objetos negros en un fondo concreto). Puede no generalizar a otros objetos, colores, posiciones o condiciones de iluminación.
- Riesgo de alucinación en acciones: como todo modelo de imitación, puede generar movimientos erráticos o no deseados ante observaciones fuera de la distribución de entrenamiento. Se recomienda supervisión humana durante las primeras ejecuciones.
- Limitaciones de contexto: el modelo predice chunks de acciones de longitud fija; no tiene memoria a largo plazo del episodio más allá de lo que se incluya en la observación actual.
- Dependencia del hardware del robot: está entrenado para el robot SO-100. Usarlo en otro robot requiere recalibración o reentrenamiento.
- Restricciones de licencia: la licencia Apache-2.0 permite uso comercial y modificación, pero no se proporcionan garantías sobre el funcionamiento en aplicaciones de producción.
- Sin documentación de rendimiento: al no haber benchmarks publicados, no se puede validar la fiabilidad del modelo en entornos reales. Se recomienda realizar una evaluación propia antes de cualquier uso crítico.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/eh-cosmos-ai/policy_pick_and_place_black_v3
- Dataset asociado: https://huggingface.co/datasets/eh-cosmos-ai/dataset_pick_and_place_black_v3
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Página de entrenamiento de políticas con LeRobot: https://huggingface.co/docs/lerobot/il_robots
