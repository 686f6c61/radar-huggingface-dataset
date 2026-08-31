# omkarpatil/ffw_sg2_pick-blue-cylinder-right-arm_smolvla_nonorm_noproprio

## Resumen

Este modelo es un ajuste fino (fine-tuning) de `lerobot/smolvla_base`, un modelo de visión-lenguaje-acción (VLA) desarrollado por LeRobot, especializado para una tarea robótica concreta: recoger un cilindro azul con el brazo derecho de un robot semi-humanoide ROBOTIS AI Worker FFW-SG2. El autor, omkarpatil, lo ha entrenado con el submódulo `cyclo_intelligence` de LeRobot 0.6.1 sobre demostraciones del brazo derecho del dataset `omkarpatil/pick-blue-cylinder-right-arm` a 15 fps, alcanzando el checkpoint 020000 de una ejecución de 30k pasos.

La relevancia de este modelo radica en su enfoque experimental: se ha entrenado sin normalización de datos (el normalizador es identidad) y solo con información visual, anulando el vector de estado. Esto lo hace adecuado para composición de políticas en el espacio de puntuaciones entre brazos, aunque limita su uso a entornos donde se cumplan estas condiciones. Es un ejemplo de cómo adaptar un VLA base a tareas específicas de manipulación con un coste computacional moderado (repo de 0.9 GB).

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA (Vision-Language-Action) basado en SmolVLA (no se especifican detalles internos) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo safetensors) |
| Idiomas soportados | no disponible (modelo de robótica, no de lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `lerobot/smolvla_base`, un VLA que combina un codificador visual (SigLIP) con un módulo de predicción de acciones mediante flow matching. En este ajuste fino se ha eliminado la normalización del dataset: el normalizador incorporado es identidad (media 0, desviación 1), por lo que la política opera directamente en el espacio articular bruto (radianes). Esta decisión está orientada a permitir la composición de puntuaciones entre brazos en futuros desarrollos.

El entrenamiento se realizó con LeRobot 0.6.1, usando un batch de 64, semilla 1000 y sin aumento de imágenes. Las imágenes se procesan con la transformación fija del modelo base (decodificación /255, redimensionado con padding a 512, y escalado ×2−1 para SigLIP). El vector de estado (`observation.state`) se puso a cero durante el entrenamiento, por lo que en inferencia debe alimentarse un vector de ceros de 22 dimensiones; cualquier vector real estaría fuera de la distribución de entrenamiento. La acción es un vector de 16 dimensiones (objetivos articulares absolutos en radianes: 7 del brazo izquierdo, 1 del gripper izquierdo, 7 del brazo derecho, 1 del gripper derecho) con un chunk de 50 pasos a 15 Hz.

## Capacidades

- Ejecución de la tarea específica "recoger el cilindro azul" con el brazo derecho, usando tres cámaras (izquierda de cabeza, izquierda de muñeca, derecha de muñeca) renombradas como `camera1`, `camera2`, `camera3`.
- Control articular de 16 grados de libertad con predicción de secuencias de acciones (chunk de 50 pasos).
- Funcionamiento exclusivamente visual: no requiere información de estado del robot, lo que simplifica la integración en entornos donde el estado no esté disponible o sea ruidoso.
- Diseñado para composición de políticas en el espacio de puntuaciones (score-space) entre brazos, gracias a la ausencia de normalización.
- No soporta tool calling, generación de texto, razonamiento simbólico ni capacidades multilingües; es un modelo de política puramente motora.

## Casos de uso

- Automatización de tareas de pick-and-place en entornos industriales controlados: el modelo puede integrarse en un robot ROBOTIS AI Worker FFW-SG2 para recoger objetos específicos (en este caso, un cilindro azul) de forma repetitiva, reduciendo la necesidad de programación manual.
- Investigación en aprendizaje por imitación: sirve como punto de partida para estudiar la composición de políticas entre brazos, gracias a su entrenamiento sin normalización y con solo visión.
- Prototipado rápido de habilidades robóticas: al ser un ajuste fino de un modelo base, permite validar la viabilidad de una tarea con un coste de entrenamiento bajo (30k pasos) antes de escalar a tareas más complejas.
- Evaluación de la robustez de VLA en condiciones de estado ausente: al anular el estado, el modelo demuestra que la política puede operar únicamente con información visual, lo que es útil para entornos donde los sensores de estado fallan.
- Integración en pipelines de LeRobot: al usar la librería estándar, el modelo puede cargarse y ejecutarse con las herramientas existentes de LeRobot, facilitando su despliegue en robots compatibles.
- Benchmarking de variantes de normalización: comparar este modelo (nonorm) con versiones normalizadas permite cuantificar el impacto de la normalización en el rendimiento de la política.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se proporcionan métricas como tasa de éxito, precisión de la tarea ni comparaciones con otros modelos.

## Requisitos de hardware

- Tamaño del repositorio: 0.9 GB, lo que sugiere que el modelo cabe en GPUs con al menos 2-4 GB de VRAM en precisión FP32, aunque no se especifica el número exacto de parámetros.
- No se indica la GPU recomendada. Dado que es un VLA con procesamiento de imágenes, se espera que funcione en GPUs de consumo como RTX 3060 o superiores, pero no hay confirmación.
- Opciones de despliegue: al ser un modelo de LeRobot, puede ejecutarse con el framework LeRobot, que soporta inferencia en PyTorch. No se mencionan integraciones con vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (VLA para tareas específicas de robótica). El modelo base `lerobot/smolvla_base` es el punto de referencia, pero no se proporcionan métricas comparativas. Se recomienda consultar la documentación de LeRobot para otros ajustes finos.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente para una tarea y un robot concretos; no generaliza a otros objetos, posiciones o configuraciones de brazos.
- La anulación del vector de estado implica que cualquier entrada de estado real (no cero) produce salidas fuera de distribución, lo que puede causar comportamientos erráticos.
- La ausencia de normalización hace que la política sea sensible a la escala de los valores articulares; si el robot tiene límites articulares diferentes, el modelo puede no ser transferible.
- No se han evaluado sesgos ni riesgos de alucinación, pero al ser un modelo de control motor, el riesgo principal es la ejecución de movimientos inseguros si se usa fuera de las condiciones de entrenamiento.
- La licencia Apache-2.0 permite uso comercial, pero el modelo depende del hardware ROBOTIS y de la librería LeRobot; se deben verificar los términos de uso del robot y del software subyacente.
- No se proporcionan garantías de rendimiento en entornos reales; se recomienda validar en simulador antes de desplegar en producción.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/omkarpatil/ffw_sg2_pick-blue-cylinder-right-arm_smolvla_nonorm_noproprio)
- [Dataset de demostraciones](https://huggingface.co/datasets/omkarpatil/pick-blue-cylinder-right-arm)
- [Modelo base SmolVLA](https://huggingface.co/lerobot/smolvla_base)
- [Plataforma ROBOTIS AI Worker](https://robotis.us/ai-worker/)
- [Documentación de ROBOTIS AI Worker](https://docs.robotis.com/docs/systems/aiworker/introduction/)
