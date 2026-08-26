# hzlama/pi0_0825_merge_pnp_lekiwi_test

## Resumen

El modelo `hzlama/pi0_0825_merge_pnp_lekiwi_test` es un fine-tune del modelo base `lerobot/pi0_base`, una política robótica Vision-Language-Action (VLA) desarrollada por Physical Intelligence y adaptada al ecosistema LeRobot de Hugging Face. Este modelo concreto ha sido entrenado por el usuario hzlama para controlar un robot móvil manipulador LeKiwi en una tarea específica de *pick and place* (coger y colocar objetos), utilizando un dataset propio de 40 episodios con 28.488 fotogramas a 30 FPS.

La relevancia de este modelo radica en que demuestra el flujo completo de fine-tuning de un modelo fundacional de robótica sobre un hardware de bajo coste y código abierto como LeKiwi, permitiendo a desarrolladores e investigadores adaptar capacidades generalistas de manipulación a tareas concretas con un volumen de datos relativamente pequeño. El modelo tiene aproximadamente 4.030 millones de parámetros y se distribuye bajo licencia Apache 2.0, lo que facilita su uso comercial y académico.

Al ser un modelo de política robótica, no es un chatbot ni un generador de texto generalista, sino un sistema que mapea observaciones visuales y de estado a acciones de control. Está diseñado para ejecutarse en tiempo real sobre el robot LeKiwi, consumiendo imágenes de tres cámaras (frontal, muñeca y cabeza) y un vector de estado de 9 dimensiones, y produciendo un vector de acción de 9 dimensiones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en transformer, adaptación de pi0 de Physical Intelligence vía LeRobot |
| Parametros totales | 4.028.019.472 (~4,03B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos en safetensors, sin cuantizaciones publicadas) |
| Idiomas soportados | No disponible (el modelo interpreta instrucciones en lenguaje natural, pero no se especifican idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tune de `lerobot/pi0_base`, que a su vez es la implementación en LeRobot del modelo π₀ (Pi0) de Physical Intelligence. Pi0 es una política generalista de robótica que combina un codificador de visión, un modelo de lenguaje y un decodificador de acciones, permitiendo que el sistema entienda imágenes, interprete instrucciones en lenguaje natural y genere comandos de control para distintos robots. La arquitectura exacta (número de capas, dimensiones ocultas, tipo de atención) no se detalla en la información disponible, pero se sabe que es un modelo denso de aproximadamente 4.030 millones de parámetros.

El entrenamiento se realizó con LeRobot (versión 0.6.2) sobre el dataset `hzlama/0825_merge_pnp_lekiwi_test`, que contiene 40 episodios de la tarea "lekiwi pick and place test" con 28.488 fotogramas a 30 FPS. La configuración de entrenamiento incluye 5.000 pasos, batch size de 32, optimizador AdamW, learning rate de 2,5e-05 y semilla 1000. No se menciona el uso de técnicas como RLHF o DPO; se trata de un fine-tuning supervisado de imitación (behavior cloning) sobre demostraciones.

## Capacidades

- Control de robot móvil manipulador LeKiwi: genera acciones de 9 dimensiones (probablemente combinación de movimiento base, brazo y pinza) a partir de observaciones de estado y visión.
- Percepción multi-cámara: procesa simultáneamente imágenes de tres cámaras (frontal, muñeca y cabeza) a resolución 480×640.
- Interpretación de instrucciones en lenguaje natural: al ser un VLA, puede recibir comandos textuales como "lekiwi pick and place test" y ejecutar la tarea correspondiente.
- Ejecución en tiempo real: diseñado para inferencia continua sobre el robot, con soporte en LeRobot para rollout directo.
- Fine-tuning específico de tarea: adaptado a una tarea concreta de pick and place, mostrando capacidad de especialización a partir de un modelo base generalista.
- Integración con el ecosistema LeRobot: compatible con las herramientas de entrenamiento, evaluación y despliegue de Hugging Face.

## Casos de uso

- Automatización de tareas de pick and place en laboratorios de robótica: el modelo puede controlar un LeKiwi para recoger objetos de una posición y colocarlos en otra, sirviendo como base para experimentos de manipulación.
- Investigación en aprendizaje por imitación: al ser un fine-tune con pocos datos, es un caso de estudio para evaluar cómo modelos fundacionales se adaptan a tareas específicas con datasets pequeños.
- Desarrollo de robots móviles de bajo coste: LeKiwi es un manipulador móvil 3D-printable; este modelo permite dotarlo de capacidades de manipulación sin necesidad de programación manual de trayectorias.
- Prototipado rápido de políticas robóticas: los desarrolladores pueden usar este modelo como punto de partida para fine-tuning en nuevas tareas, reduciendo el tiempo de entrenamiento desde cero.
- Evaluación de robustez en entornos controlados: al estar entrenado con 40 episodios, es útil para estudiar la generalización y los límites de la política en variaciones de iluminación, posición de objetos, etc.
- Demostraciones educativas: sirve como ejemplo práctico de despliegue de un VLA en hardware real, integrable en cursos de robótica y aprendizaje automático.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no hay resultados de evaluación en robot real ("No evaluation results have been provided for this policy yet"). No se dispone de métricas como tasa de éxito, precisión de manipulación ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: no hay datos oficiales. Dado que el modelo tiene ~4,03B parámetros, en FP16 los pesos ocupan aproximadamente 8 GB. Con el procesamiento de tres imágenes de 480×640 y el overhead de activaciones, se estima que se necesitan al menos 12-16 GB de VRAM para una inferencia cómoda. Esta es una estimación orientativa, no un dato verificado.
- GPU recomendadas: tarjetas con 16 GB o más de VRAM, como NVIDIA RTX 4090, A100 (40 GB) o H100. En GPUs de 8 GB (como RTX 3070/3080) podría ser posible con cuantización, pero no se han publicado versiones cuantizadas.
- Compatibilidad con consumer GPU: sí, siempre que se disponga de suficiente VRAM; una RTX 4090 sería adecuada.
- Opciones de despliegue: el modelo está integrado en LeRobot, por lo que se puede ejecutar con `lerobot-rollout` sobre el robot. No se menciona soporte para vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje generativo estándar.
- Latencia y throughput: no disponibles. Al ser un sistema de control en tiempo real, se espera que la inferencia sea rápida (del orden de decenas de milisegundos), pero no hay mediciones publicadas.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa con otros modelos de la misma categoría. El modelo base `lerobot/pi0_base` es el punto de referencia natural, pero no se han publicado métricas comparativas entre ambos. Tampoco se conocen otros fine-tunes de pi0 sobre LeKiwi con datos públicos. Por tanto, la comparativa se limita a indicar que este modelo es una especialización de pi0_base para una tarea concreta, con el mismo número de parámetros y licencia.

## Limitaciones y advertencias

- Dataset de entrenamiento muy pequeño (40 episodios), lo que limita la generalización a variaciones no vistas en las demostraciones (cambios de iluminación, posiciones de objetos, distracciones, etc.).
- Sin resultados de evaluación en robot real: no se ha verificado la tasa de éxito de la política, por lo que su rendimiento efectivo es desconocido.
- Especialización excesiva: el modelo está entrenado para una tarea concreta ("lekiwi pick and place test") y puede no funcionar bien en otras tareas sin fine-tuning adicional.
- Dependencia de la configuración de cámaras: las observaciones requieren tres cámaras específicas (frontal, muñeca, cabeza) con resoluciones concretas; cambios en la disposición de sensores pueden degradar el rendimiento.
- Riesgo de alucinación en acciones: como cualquier modelo de imitación, puede generar acciones incorrectas o inseguras si las observaciones difieren del dominio de entrenamiento; se recomienda supervisión humana durante el despliegue.
- Sin soporte multilingüe documentado: aunque el modelo interpreta instrucciones en lenguaje natural, no se especifica qué idiomas soporta; probablemente esté limitado al inglés de los datos de entrenamiento.
- Licencia Apache 2.0: permite uso comercial, pero se debe atribuir adecuadamente y no se ofrece garantía alguna sobre el funcionamiento del modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hzlama/pi0_0825_merge_pnp_lekiwi_test
- Modelo base: https://huggingface.co/lerobot/pi0_base
- Dataset de entrenamiento: https://huggingface.co/datasets/hzlama/0825_merge_pnp_lekiwi_test
- Blog de Physical Intelligence sobre π₀: https://www.physicalintelligence.company/blog/pi0
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de pi0 en LeRobot: https://huggingface.co/docs/lerobot/main/en/pi0
- Repositorio LeKiwi (hardware): https://github.com/SIGRobotics-UIUC/LeKiwi
- Repositorio LeRobot-Lekiwi-Dual-Arm: https://github.com/zdh1213112/LeRobot-Lekiwi-Dual-Arm
