# omkarpatil/ffw_sg2_pick-blue-cylinder-left-arm_smolvla_nonorm

## Resumen

Este modelo es un fine-tuning del modelo base `lerobot/smolvla_base` (SmolVLA, un modelo de visión-lenguaje-acción eficiente) realizado por el autor `omkarpatil` con la librería LeRobot 0.6.1. Está especializado en la tarea robótica de recoger un cilindro azul con el brazo izquierdo de un robot semi-humanoide ROBOTIS AI Worker FFW-SG2. El checkpoint corresponde al paso 020000 de una ejecución de 30k pasos, con un tamaño de lote de 64 y sin aumento de imágenes.

La particularidad principal de este modelo es que no aplica normalización del dataset: el normalizador incorporado es la identidad (media 0, desviación estándar 1), por lo que el flujo de coincidencia (flow matching) opera directamente en el espacio articular bruto en radianes. Esto está pensado para permitir la composición de espacios de puntuación entre brazos, una técnica avanzada en control robótico. El modelo recibe imágenes de tres cámaras (cabeza izquierda, muñeca izquierda y muñeca derecha) y produce objetivos articulares absolutos de 16 dimensiones (7 articulaciones del brazo izquierdo, 1 pinza izquierda, 7 articulaciones del brazo derecho, 1 pinza derecha) en tramos de 50 pasos a 15 Hz.

La relevancia de este modelo radica en que demuestra un enfoque de fine-tuning sin normalización para políticas de control robótico, lo que facilita la reutilización y composición de habilidades en sistemas multi-brazo. Está publicado bajo licencia Apache 2.0 y los pesos están en formato safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SmolVLA (Vision-Language-Action), basada en el modelo base `lerobot/smolvla_base` |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de control robótico, no de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de `lerobot/smolvla_base`, un modelo de visión-lenguaje-acción (VLA) entrenado originalmente con LeRobot. La arquitectura exacta de SmolVLA no se detalla en la información proporcionada, pero se sabe que es un modelo eficiente diseñado para tareas de robótica que combina codificación visual (probablemente SigLIP para las imágenes) con un mecanismo de flujo de coincidencia para generar acciones. En este fine-tuning, las imágenes se procesan con una transformación fija: decodificación a valores en [0,1], redimensionado con padding a 512×512, y normalización a [−1,1] mediante ×2−1, antes de ser alimentadas al codificador SigLIP.

El entrenamiento se realizó con LeRobot 0.6.1, utilizando el submódulo `cyclo_intelligence`. Se usaron las demostraciones del brazo izquierdo del dataset `omkarpatil/pick-blue-cylinder-left-arm` a 15 fps, con un tamaño de lote de 64, semilla 1000 y sin aumento de imágenes. El checkpoint 020000 corresponde a una ejecución de 30k pasos. La característica más destacable es la ausencia de normalización del dataset: el normalizador es la identidad, lo que significa que el modelo opera directamente sobre los valores articulares brutos en radianes. Esto se hace intencionalmente para permitir la composición de espacios de puntuación entre brazos, una técnica que facilita la combinación de políticas entrenadas por separado para cada brazo.

## Capacidades

- Control robótico de precisión: el modelo genera objetivos articulares absolutos para dos brazos (izquierdo y derecho) y sus pinzas, permitiendo ejecutar la tarea de recoger un cilindro azul con el brazo izquierdo.
- Percepción multimodal: utiliza tres cámaras (cabeza izquierda, muñeca izquierda y muñeca derecha) para percibir el entorno y guiar la acción.
- Generación de acciones en tramos (chunking): produce secuencias de 50 pasos de acción a 15 Hz, lo que permite un control suave y anticipatorio.
- Composición de habilidades: al no usar normalización, el modelo está diseñado para ser combinado con otras políticas en el espacio de puntuación, facilitando la composición de comportamientos multi-brazo.
- Sin capacidades de lenguaje: al ser un modelo de control robótico puro, no genera texto ni responde a instrucciones verbales; la tarea está fijada como "Pick up the blue cylinder".

## Casos de uso

- Automatización de tareas de picking en entornos industriales: el modelo puede integrarse en un robot ROBOTIS AI Worker FFW-SG2 para recoger objetos específicos (en este caso, un cilindro azul) de forma autónoma, reduciendo la intervención humana en líneas de montaje o almacenes.
- Investigación en aprendizaje por imitación para robótica: al ser un fine-tuning de SmolVLA con normalización identidad, sirve como caso de estudio para evaluar el impacto de la normalización en políticas de control y para experimentar con composición de habilidades entre brazos.
- Desarrollo de políticas multi-brazo: el modelo produce acciones para ambos brazos simultáneamente, lo que permite explorar estrategias de coordinación bimanual en tareas que requieren manipulación colaborativa.
- Benchmarking de modelos VLA en hardware real: puede utilizarse como referencia para comparar el rendimiento de diferentes arquitecturas de visión-lenguaje-acción en tareas de manipulación con el robot FFW-SG2.
- Entrenamiento de políticas transferibles: al operar en espacio articular bruto, el modelo puede servir como punto de partida para fine-tuning en tareas similares sin necesidad de re-normalizar los datos.
- Demostración de integración con LeRobot: el modelo es un ejemplo de cómo fine-tuning de SmolVLA con LeRobot puede producir políticas funcionales para robots específicos, útil para desarrolladores que quieran replicar el flujo de trabajo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de tasas de éxito, precisión de agarre ni comparaciones con otros modelos en la tarea de recoger el cilindro azul.

## Requisitos de hardware

- Tamaño del repositorio: 0.9 GB, lo que sugiere que los pesos del modelo son relativamente compactos, pero no se especifica la VRAM necesaria para inferencia.
- No se dispone de información sobre GPUs recomendadas, latencia o throughput. Dado que es un modelo VLA con procesamiento de imágenes, se espera que requiera una GPU con al menos 8-12 GB de VRAM para inferencia en tiempo real, pero este dato no está confirmado.
- Opciones de despliegue: al ser un modelo de LeRobot, puede ejecutarse con la librería LeRobot en Python, posiblemente con aceleración por GPU. No se mencionan integraciones con vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.
- Para uso en el robot real, se necesita el hardware ROBOTIS AI Worker FFW-SG2 y el entorno de control correspondiente.

## Comparativa con modelos similares

| Modelo | Tarea | Normalización | Brazo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `omkarpatil/ffw_sg2_pick-blue-cylinder-left-arm_smolvla_nonorm` (este) | Recoger cilindro azul | Identidad (sin normalización) | Izquierdo | Apache 2.0 | HuggingFace |
| `omkarpatil/ffw_sg2_pick-blue-cylinder-right-arm_smolvla` (similar) | Recoger cilindro azul | No especificado (probablemente normalizado) | Derecho | Apache 2.0 | HuggingFace |
| `lerobot/smolvla_base` (modelo base) | Tareas VLA generales | Normalización estándar | Ambos | Apache 2.0 | HuggingFace |

No se dispone de datos de rendimiento comparativo entre estos modelos. La diferencia principal es la ausencia de normalización en este modelo, lo que lo hace adecuado para composición de espacios de puntuación, mientras que el modelo base y el de brazo derecho probablemente usan normalización estándar.

## Limitaciones y advertencias

- Especialización extrema: el modelo está entrenado únicamente para la tarea de recoger un cilindro azul con el brazo izquierdo. No generaliza a otros objetos, colores o configuraciones del entorno.
- Sin normalización de datos: al operar en espacio articular bruto, el modelo es sensible a las unidades y rangos de las articulaciones del robot específico. Si se usa en otro robot con diferentes límites articulares, el comportamiento puede ser impredecible.
- Dependencia de las cámaras: el rendimiento depende de la correcta calibración y posición de las tres cámaras. Cambios en la iluminación o el fondo pueden afectar la percepción.
- Sin capacidades de lenguaje: no puede interpretar instrucciones verbales ni generar explicaciones; la tarea está fijada en el entrenamiento.
- Riesgo de alucinación en acciones: como cualquier modelo de aprendizaje automático, puede generar acciones incorrectas o inseguras si el entorno difiere del de entrenamiento. Se recomienda supervisión humana en entornos reales.
- Licencia Apache 2.0 permite uso comercial, pero el modelo está vinculado al hardware ROBOTIS AI Worker; su uso en otros robots requeriría adaptación y validación.
- No se han publicado benchmarks ni evaluaciones de seguridad, por lo que su fiabilidad en producción no está demostrada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/omkarpatil/ffw_sg2_pick-blue-cylinder-left-arm_smolvla_nonorm
- Discusiones del modelo similar (brazo derecho): https://huggingface.co/omkarpatil/ffw_sg2_pick-blue-cylinder-right-arm_smolvla/discussions
- Blog de SmolVLA en HuggingFace: https://huggingface.co/blog/smolvla
- Documentación de ROBOTIS AI Worker: https://docs.robotis.com/docs/systems/aiworker/introduction/
- Página de producto AI Worker FFW-SG2: https://en.robotis.com/shop_en/item.php?it_id=905-0055-000
- Página de ROBOTIS AI Worker (US): https://robotis.us/ai-worker/
