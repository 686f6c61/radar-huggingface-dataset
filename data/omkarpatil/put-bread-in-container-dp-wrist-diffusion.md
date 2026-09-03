# omkarpatil/put-bread-in-container-dp-wrist-diffusion

## Resumen

El modelo `omkarpatil/put-bread-in-container-dp-wrist-diffusion` es una política de control robótico basada en Diffusion Policy, entrenada con la librería LeRobot para ejecutar la tarea de colocar una barra de pan en un contenedor utilizando el robot manipulador ROBOTIS FFW SG2 Rev1. El modelo emplea únicamente las dos cámaras de muñeca (izquierda y derecha) a resolución nativa de 424x240, lo que simplifica el pipeline de percepción al evitar la necesidad de reescalar vistas de distinta resolución.

Desarrollado por Omkar Patil, investigador de robótica en ASU, este modelo forma parte de un grupo de composición de tres tareas similares (put-bread-in-container, put-bread-in-tray y put-bread-in-pan) cuyas estadísticas de normalización se calcularon de forma conjunta sobre 11 872 frames. Esto permite que las políticas entrenadas para cada tarea compartan la misma normalización y puedan componerse entre sí. El modelo se publica con licencia Apache-2.0 y pesos en formato safetensors, con un total de 274 492 048 parámetros.

La relevancia de este modelo radica en su enfoque práctico para el aprendizaje por imitación en robótica: utiliza una arquitectura de difusión (DDPM) para generar acciones a partir de observaciones visuales, un paradigma que ha demostrado robustez frente a la multimodalidad en demostraciones humanas. Además, al ser liberado bajo una licencia permisiva y con el ecosistema LeRobot, facilita la reproducibilidad y la experimentación en entornos de investigación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Policy (DDPM) sobre observaciones de cámaras de muñeca |
| Parametros totales | 274 492 048 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible (modelo de robótica, no aplica) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de robótica, no aplica) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo implementa una política de difusión (Diffusion Policy) tal como se define en LeRobot 0.6.1, con un scheduler de ruido DDPM. La política toma como entrada las imágenes de las dos cámaras de muñeca (424x240 cada una) y genera secuencias de acciones del efector final mediante un proceso de denoising iterativo. No se especifica en la documentación la arquitectura interna de la red (p. ej., U-Net, transformador), pero es la implementación estándar de LeRobot para políticas de difusión.

El entrenamiento se realizó con los hiperparámetros por defecto de LeRobot: 100 000 pasos, batch size 8, optimizador Adam con learning rate 1e-4, betas (0.95, 0.999) y weight decay 1e-6. La tasa de datos del dataset es de 15 fps. La pérdida final de entrenamiento reportada es 0.000. Los datos provienen de un dataset en formato v3.0 de LeRobot, convertido desde v2.1, y se restauraron las estadísticas de normalización agrupadas tras la conversión. Estas estadísticas se calcularon sobre 11 872 frames de los tres miembros del grupo de composición (container, tray y pan) y se escribieron idénticamente en cada dataset. El hash SHA-256 de la combinación de observaciones, acciones y campos de normalización es `8bb05eca753c`.

Una nota importante es que las políticas GR00T para las mismas tareas comparten el mismo archivo de estadísticas pero consumen campos diferentes (GR00T usa percentiles q01/q99, Diffusion Policy usa min/max). Por tanto, la composición solo es válida entre políticas de la misma arquitectura, no entre Diffusion Policy y GR00T.

## Capacidades

- Control robótico de manipulación: el modelo genera comandos de acción (probablemente posiciones y orientaciones del efector) para ejecutar la tarea de colocar un pan en un contenedor.
- Percepción visual únicamente desde cámaras de muñeca: utiliza dos vistas de 424x240, sin necesidad de cámara externa ni de fusión de múltiples resoluciones.
- Aprendizaje por imitación: entrenado a partir de demostraciones humanas, es capaz de reproducir comportamientos multimodales gracias a la naturaleza estocástica de la difusión.
- Composición entre tareas relacionadas: al compartir estadísticas de normalización con las tareas de bandeja y sartén, el modelo puede combinarse con otras políticas del mismo grupo, lo que facilita el aprendizaje multitarea o la transferencia.
- Ejecución en tiempo real: diseñado para operar a 15 fps, compatible con los requisitos de control de robots manipuladores.

No dispone de capacidades de generación de texto, tool calling, razonamiento simbólico ni procesamiento de lenguaje, al ser un modelo puramente motor.

## Casos de uso

- Automatización de líneas de envasado alimentario: el modelo puede integrarse en un brazo robótico ROBOTIS FFW SG2 Rev1 para colocar productos de panadería en contenedores de forma repetitiva, reduciendo la intervención humana en entornos controlados de producción.
- Investigación en aprendizaje por imitación: sirve como punto de partida para estudiar la composición de políticas, la transferencia entre tareas y el efecto de la normalización agrupada en el rendimiento de Diffusion Policy.
- Desarrollo de robots domésticos de asistencia: la capacidad de manipular objetos cotidianos (como pan) con solo cámaras de muñeca es relevante para robots de asistencia en cocinas, donde el espacio y la oclusión son habituales.
- Benchmark de políticas de difusión en hardware real: al estar publicado con pesos safetensors y el formato LeRobot, puede utilizarse como referencia para comparar arquitecturas de control (difusión vs. GR00T) en el mismo robot y tarea.
- Entrenamiento de políticas con datos limitados: el uso de estadísticas agrupadas permite aprovechar demostraciones de tareas similares, lo que puede reducir la cantidad de datos necesarios para nuevas tareas dentro del grupo.
- Simulación y validación de algoritmos de control: el modelo puede cargarse en entornos simulados compatibles con LeRobot (p. ej., MuJoCo) para probar variaciones de la política, robustez ante perturbaciones o integración con planificadores de alto nivel.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta la pérdida final de entrenamiento (0.000) y la tasa de datos (15 fps), pero no incluye métricas de éxito en el robot real, ni comparaciones con otras políticas o modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Dado el tamaño del modelo (274 M parámetros, 1.1 GB en safetensors), una GPU con al menos 4 GB de VRAM podría ejecutar la inferencia en precisión FP32, aunque se recomienda una GPU con 8 GB para margen y velocidad.
- GPU recomendadas: no especificadas por el autor. Para despliegue en robot, se sugiere una GPU embebida como NVIDIA Jetson Orin Nano o una GPU de escritorio tipo RTX 3060 o superior.
- Compatibilidad con GPU de consumo: sí, el modelo puede ejecutarse en GPUs de consumo con suficiente VRAM, aunque no se han publicado pruebas oficiales.
- Opciones de despliegue: el modelo está diseñado para el ecosistema LeRobot, por lo que puede ejecutarse mediante el framework LeRobot (Python) en entornos con PyTorch. No se mencionan opciones como vLLM, llama.cpp u Ollama, que son específicas de modelos de lenguaje.
- Latencia y throughput: no disponibles. La tasa de datos de entrenamiento es de 15 fps, lo que sugiere que la inferencia debe ser capaz de operar a esa frecuencia para control en tiempo real, pero no se aportan mediciones.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa con otros modelos. La model card menciona que existen políticas GR00T para las mismas tareas, pero no se proporcionan detalles de arquitectura, parámetros ni rendimiento. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- Especialización estrecha: el modelo está entrenado exclusivamente para la tarea de colocar pan en un contenedor, con el robot ROBOTIS FFW SG2 Rev1. No generaliza a otras tareas, objetos o robots sin reentrenamiento.
- Dependencia de las cámaras de muñeca: al usar solo las cámaras de muñeca, la política no tiene visión global de la escena. Esto puede limitar su robustez en entornos con oclusiones o cuando el objeto no está en el campo de visión de las muñecas.
- Normalización agrupada: las estadísticas de normalización se calcularon sobre un grupo de tareas. Si se utiliza el modelo de forma aislada, la normalización puede no ser óptima para la tarea específica, aunque fue diseñada para componerse.
- Incompatibilidad cross-arquitectura: no se puede combinar con políticas GR00T, incluso si comparten el mismo archivo de estadísticas, debido a diferencias en los campos de normalización.
- Riesgo de sobreajuste: la pérdida final de entrenamiento de 0.000 sugiere un posible sobreajuste al dataset de demostraciones, lo que podría reducir la capacidad de generalización ante variaciones en la posición del pan, iluminación o textura.
- Sin evaluación pública: no se han publicado métricas de éxito en el robot real ni en simulación, por lo que el rendimiento real no está verificado.
- Limitaciones de datos: el dataset proviene de un grupo de tres tareas con 11 872 frames en total, lo que puede ser insuficiente para capturar toda la variabilidad del mundo real.
- Licencia Apache-2.0: permite uso comercial, pero el usuario es responsable de cumplir con las condiciones de la licencia y de verificar la procedencia de los datos de entrenamiento (aunque el autor los ha publicado bajo esta licencia).

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/omkarpatil/put-bread-in-container-dp-wrist-diffusion)
- [Perfil del autor en Hugging Face](https://huggingface.co/omkarpatil)
- [Perfil de GitHub del autor](https://github.com/omkarpatil18)
