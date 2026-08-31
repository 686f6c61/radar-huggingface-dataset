# kdotmahesh/pi05-pick-clip-mug-test

## Resumen

El modelo `kdotmahesh/pi05-pick-clip-mug-test` es un fine-tune del modelo de visión-lenguaje-acción (VLA) π₀.₅ (Pi05), desarrollado por Physical Intelligence, realizado con la librería LeRobot de Hugging Face. Está entrenado para ejecutar una tarea robótica concreta: recoger un clip y colocarlo dentro de una taza, utilizando dos cámaras (muñeca y vista cenital) y el estado del robot. El modelo base π₀.₅ es una evolución de π₀ diseñada para generalizar a entornos y situaciones nuevas no vistas durante el entrenamiento, y su implementación en LeRobot se adapta del repositorio open-source OpenPI.

Este modelo concreto se ha entrenado sobre un dataset propio de 50 episodios (26 095 fotogramas a 30 FPS) con solo 200 pasos de entrenamiento, lo que lo convierte en un ejemplo de fine-tune rápido y ligero para una tarea específica de manipulación. Con 4 143 millones de parámetros, es un modelo de tamaño medio dentro de la categoría de VLA, y su licencia Apache 2.0 permite uso comercial sin restricciones. Su relevancia radica en demostrar cómo un modelo base de propósito general puede adaptarse a tareas concretas de robótica con pocos datos, siguiendo el flujo de trabajo de LeRobot.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en π₀.₅ (transformer multimodal) |
| Parametros totales | 4 143 404 816 (~4,14 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos publicados en safetensors, sin cuantizaciones oficiales) |
| Idiomas soportados | No disponible (modelo de robótica, no orientado a lenguaje natural) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura π₀.₅ de Physical Intelligence, un VLA que combina un codificador de visión, un modelo de lenguaje y un decodificador de acciones para control robótico. π₀.₅ se describe en el paper arXiv 2504.16054 y se caracteriza por su capacidad de generalización a entornos nuevos gracias a un entrenamiento con co-entrenamiento en datos diversos. La implementación en LeRobot adapta el código de OpenPI y utiliza un transformer multimodal que procesa simultáneamente imágenes de dos cámaras (muñeca y overhead, resolución 480×640) y el estado del robot (6 dimensiones), generando acciones de 6 dimensiones.

El fine-tune se realizó con la librería LeRobot versión 0.6.2, partiendo del checkpoint base `lerobot/pi05_base`. Se emplearon 50 episodios de un dataset propio, con un total de 26 095 fotogramas a 30 FPS, y se entrenó durante 200 pasos con un batch size de 2, optimizador AdamW, tasa de aprendizaje de 2,5e-05 y semilla 1000. No se menciona el uso de técnicas como RLHF o DPO; el entrenamiento es de imitación supervisada (behavior cloning) sobre las demostraciones del dataset.

## Capacidades

- Control de robot manipulador: genera comandos de acción de 6 grados de libertad (posición y orientación del efector final) a partir de observaciones visuales y de estado.
- Percepción visual multi-cámara: procesa simultáneamente imágenes de una cámara de muñeca y una cámara cenital, ambas en RGB a 480×640.
- Comprensión de tareas por instrucción: el modelo recibe una descripción textual de la tarea ("Pick the clip and place it in the mug") y la asocia con las observaciones para producir las acciones adecuadas.
- Ejecución de tareas de manipulación fina: entrenado específicamente para recoger un clip y colocarlo en una taza, lo que requiere precisión en la pinza y coordinación visomotora.
- Integración con LeRobot: compatible con el ecosistema de LeRobot para entrenamiento, evaluación y despliegue en robots reales (tipo `so_follower`).
- Generalización limitada a la tarea entrenada: al ser un fine-tune con pocos datos, su capacidad se restringe a la tarea y configuración específicas de las demostraciones.

## Casos de uso

- Automatización de tareas de pick-and-place en entornos industriales: el modelo puede controlar un brazo robótico para recoger objetos pequeños (clips, tornillos) y colocarlos en contenedores o piezas, integrado en líneas de montaje. Su entrenamiento específico lo hace adecuado para tareas repetitivas con alta precisión.
- Investigación en aprendizaje por imitación: sirve como ejemplo de fine-tune rápido de un VLA base sobre un dataset pequeño, útil para estudiar la transferencia de habilidades y la adaptación a tareas concretas en laboratorios de robótica.
- Pruebas de concepto en robótica doméstica: el modelo puede desplegarse en robots asistenciales para tareas como recoger objetos pequeños y depositarlos en recipientes, demostrando la viabilidad de VLA en entornos no industriales.
- Benchmarking de políticas de control: al ser un modelo con configuración conocida (200 pasos, dataset de 50 episodios), puede utilizarse como referencia para comparar métodos de fine-tune, arquitecturas y estrategias de aumento de datos en robótica.
- Desarrollo de sistemas de manipulación con visión: el modelo integra percepción visual y control motor, por lo que puede servir como base para desarrollar sistemas más complejos que requieran razonamiento espacial y coordinación ojo-mano.
- Formación y educación en robótica con LeRobot: los estudiantes pueden usar este modelo como ejemplo práctico para aprender a entrenar, evaluar y desplegar políticas de VLA con LeRobot, gracias a su documentación y comandos CLI.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no se proporcionan resultados de evaluación en robot real: "No evaluation results have been provided for this policy yet". Por tanto, no hay datos de tasas de éxito ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible oficialmente. Dado el tamaño del modelo (~4,14 B parámetros), una estimación orientativa sería de unos 8-10 GB en FP16, y alrededor de 4-5 GB en cuantización INT8, pero estos valores no están confirmados por el autor.
- GPU recomendadas: no hay recomendaciones oficiales. Para inferencia en FP16, una GPU con al menos 12 GB de VRAM (p. ej., RTX 3060, RTX 4070) podría ser suficiente; para entrenamiento con batch size 2, se requeriría mayor capacidad (p. ej., RTX 4090, A100).
- Compatibilidad con GPU de consumo: probablemente sí, dado el tamaño moderado del modelo, aunque no hay confirmación oficial.
- Opciones de despliegue: se puede ejecutar mediante los comandos `lerobot-rollout` y `lerobot-train` de LeRobot, que gestionan la carga del modelo y la interfaz con el robot. No se mencionan otros motores de inferencia (vLLM, llama.cpp, etc.) porque el modelo no es un LLM tradicional.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa rigurosa. El modelo es un fine-tune específico de π₀.₅, y no se han publicado resultados frente a otros VLA como OpenVLA, RT-2 o la versión base π₀. Los parámetros totales (~4,14 B) lo sitúan en un rango medio, pero sin datos de rendimiento no es posible comparar de forma objetiva.

## Limitaciones y advertencias

- Entrenamiento con muy pocos datos: solo 50 episodios y 200 pasos, lo que aumenta el riesgo de sobreajuste y limita la generalización a variaciones de la tarea (posiciones de objetos, iluminación, distracciones).
- Sin evaluación en robot real: la model card indica que no hay resultados de evaluación, por lo que se desconoce la tasa de éxito real en el robot.
- Tarea restringida: el modelo está entrenado exclusivamente para la tarea "Pick the clip and place it in the mug"; no es adecuado para otras tareas sin un nuevo fine-tune.
- Dependencia de la configuración de cámaras: requiere las dos cámaras específicas (muñeca y overhead) con las resoluciones y posiciones usadas en el entrenamiento; cambios en la configuración pueden degradar el rendimiento.
- Riesgo de alucinación en acciones: como todo modelo de imitación, puede generar acciones incorrectas o inestables ante observaciones fuera de la distribución de entrenamiento.
- Sin cuantizaciones oficiales: no se proporcionan versiones cuantizadas, lo que puede dificultar el despliegue en hardware con poca memoria.
- Licencia Apache 2.0: permite uso comercial, pero el modelo base π₀.₅ puede tener sus propias restricciones (aunque el repo indica Apache 2.0 para este fine-tune).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kdotmahesh/pi05-pick-clip-mug-test
- Modelo base π₀.₅ en LeRobot: https://huggingface.co/lerobot/pi05_base
- Paper de π₀.₅: https://arxiv.org/html/2504.16054v1
- Blog de Physical Intelligence sobre π₀.₅: https://www.physicalintelligence.company/blog/pi05
- Guía de LeRobot para pi05: https://huggingface.co/docs/lerobot/main/en/pi05
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Dataset de entrenamiento: https://huggingface.co/datasets/kdotmahesh/pick-clip-place-mug_20260830_120021
- Repositorio OpenPI (referencia): https://github.com/physical-intelligence/openpi
