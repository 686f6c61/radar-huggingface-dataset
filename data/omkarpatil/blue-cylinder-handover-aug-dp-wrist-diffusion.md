# omkarpatil/blue-cylinder-handover-aug-dp-wrist-diffusion

## Resumen

El modelo `omkarpatil/blue-cylinder-handover-aug-dp-wrist-diffusion` es una política de difusión (diffusion policy) entrenada con la librería LeRobot para el robot manipulador ROBOTIS FFW SG2 Rev1. Desarrollado por Omkar Patil, el modelo resuelve la tarea de transferencia (handover) de un cilindro azul entre los dos brazos del robot, utilizando únicamente las cámaras de muñeca izquierda y derecha como entrada visual. Esta variante con solo cámaras de muñeca evita el problema de resolver múltiples resoluciones de imagen que presenta el robot (cámara de cabeza 376×672 y muñecas 424×240), al trabajar con una resolución uniforme.

El modelo emplea una arquitectura de difusión de denoising (DDPM) para generar secuencias de acciones condicionadas a observaciones de estado e imágenes, un enfoque popular en aprendizaje por imitación para robótica. Con aproximadamente 274 millones de parámetros, es un modelo de tamaño medio que se integra en el ecosistema LeRobot. Su relevancia radica en demostrar la composición de políticas dentro de un grupo de tareas compartidas, utilizando estadísticas de normalización agrupadas para mejorar la transferencia entre variantes de la misma habilidad. Publicado bajo licencia Apache 2.0, está disponible para investigación y uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Policy (DDPM) |
| Parametros totales | 274.492.048 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (procesa secuencias de observaciones, no texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de control robótico) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es una política de difusión, un modelo generativo condicional que aprende a predecir acciones a partir de observaciones mediante un proceso de denoising iterativo. El modelo utiliza un scheduler DDPM (Denoising Diffusion Probabilistic Models) y está implementado dentro del framework LeRobot (versión 0.6.1, fork `lerobot-cyclo` de ROBOTIS). Las observaciones consisten en imágenes de las dos cámaras de muñeca (424×240 cada una) y el estado del robot; el modelo genera una secuencia de acciones de control.

El entrenamiento se realizó durante 100.000 pasos con un tamaño de lote de 8, optimizador Adam (lr 1e-4, betas 0.95 y 0.999, weight decay 1e-6). El dataset, denominado `blue-cylinder-handover-aug`, contiene 11.870 frames y forma parte del "grupo de composición B", junto con las tareas `pick-blue-cylinder-left-arm` y `pick-blue-cylinder-right-arm`. Las estadísticas de normalización (min/max) se agruparon sobre todos los miembros del grupo y se escribieron idénticamente en cada dataset, garantizando coherencia entre políticas compuestas. El loss final de entrenamiento fue de 0.004. Los datos se almacenan en formato LeRobot v3.0, convertidos desde v2.1 con restauración de las estadísticas agrupadas.

## Capacidades

- Generación de acciones de control para el robot ROBOTIS FFW SG2 Rev1 en la tarea específica de transferencia de un cilindro azul entre brazos.
- Procesamiento de observaciones visuales de dos cámaras de muñeca (izquierda y derecha) a resolución 424×240.
- Aprendizaje por imitación a partir de demostraciones humanas, con capacidad de generar trayectorias suaves y robustas gracias al proceso de difusión.
- Normalización de estado y acciones basada en estadísticas agrupadas del grupo de composición B, lo que permite componer con otras políticas del mismo grupo.
- Compatibilidad con el ecosistema LeRobot para entrenamiento, evaluación y despliegue en robots reales o simulados.
- No incluye capacidades de lenguaje, tool calling, agentes ni razonamiento multimodal fuera del ámbito robótico.

## Casos de uso

- Investigación en aprendizaje por imitación: el modelo sirve como punto de partida para estudiar la composición de políticas de difusión en tareas bimanuales, comparando el efecto de las estadísticas de normalización agrupadas frente a las individuales.
- Desarrollo de habilidades de manipulación robótica: puede integrarse en un pipeline de LeRobot para ejecutar la tarea de handover en el robot FFW SG2 Rev1, permitiendo validar algoritmos de control y percepción.
- Evaluación de políticas en entornos de laboratorio: investigadores pueden reproducir el entrenamiento y evaluar la robustez del modelo ante variaciones de iluminación, posición del objeto o perturbaciones externas.
- Base para fine-tuning: aunque está entrenado para una tarea concreta, puede ajustarse con nuevos datos de demostración para adaptarlo a objetos o configuraciones similares (por ejemplo, cilindros de otros colores o posiciones de agarre).
- Benchmark de políticas de difusión: sirve como referencia para comparar el rendimiento de otras arquitecturas (como GR00T o SmolVLA) en la misma tarea, dentro del contexto del grupo de composición B.
- Demostración de interoperabilidad de datos: el modelo ejemplifica el uso de estadísticas de normalización compartidas entre datasets, lo que facilita la creación de conjuntos de datos compuestos para entrenamiento multi-tarea.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El único dato de rendimiento reportado es el loss final de entrenamiento de 0.004, pero no se proporcionan métricas de éxito en tarea, precisión de agarre ni comparaciones con otros modelos. Tampoco se incluyen resultados en simulador o en el robot real.

## Requisitos de hardware

- Tamaño del modelo: aproximadamente 1,1 GB en safetensors (274M parámetros en FP32).
- VRAM estimada para inferencia: no disponible de forma oficial. Una estimación conservadora para FP32 sería de ~1,1 GB de pesos, más memoria adicional para activaciones e imágenes, por lo que se recomienda al menos 4 GB de VRAM en GPUs de consumo.
- GPU recomendadas: no se especifican. Para ejecución en tiempo real sobre el robot, se requeriría una GPU embebida como NVIDIA Jetson Orin o similar, o una GPU de escritorio (RTX 3060 o superior) para pruebas en laboratorio.
- Opciones de despliegue: el modelo está integrado en LeRobot, por lo que puede ejecutarse mediante su API estándar. No se mencionan adaptaciones para llama.cpp, vLLM u Ollama, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles. La inferencia de una política de difusión implica múltiples pasos de denoising, por lo que la latencia depende del número de pasos configurado y del hardware.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables directamente. El autor ha publicado otros modelos para el mismo robot y tareas similares, como `ffw_sg2_pick-blue-cylinder-left-arm_groot-n1.7` y `ffw_sg2_pick-blue-cylinder-left-arm_smolvla`, pero no se proporcionan datos de rendimiento comparativos. En el ecosistema LeRobot existen otras políticas de difusión, pero sin datos públicos de benchmarks para esta tarea concreta, no es posible realizar una comparativa cuantitativa.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente para la tarea de handover de un cilindro azul en el robot FFW SG2 Rev1. No generaliza a otras tareas ni a otros robots sin un reentrenamiento completo.
- Depende de la configuración exacta de cámaras de muñeca (resolución 424×240). Cualquier cambio en la posición, orientación o calibración de las cámaras puede degradar el rendimiento.
- La normalización de estado y acciones está vinculada al grupo de composición B; si se intenta componer con políticas de otros grupos (o de arquitecturas diferentes como GR00T), los resultados pueden ser inconsistentes.
- El dataset de demostraciones puede contener sesgos implícitos del operador humano (por ejemplo, trayectorias preferentes, velocidades de agarre), lo que podría afectar la robustez en entornos variables.
- Aunque la licencia Apache 2.0 permite uso comercial, es necesario verificar la licencia del dataset subyacente y las restricciones del robot ROBOTIS FFW SG2 Rev1.
- No se han reportado pruebas de robustez ante perturbaciones (cambios de iluminación, oclusiones, variaciones de la posición del objeto) ni evaluaciones en condiciones fuera del conjunto de entrenamiento.
- El modelo se entrenó con datos a 15 fps; si se ejecuta a una frecuencia de control diferente, la dinámica de las acciones generadas puede no ser adecuada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/omkarpatil/blue-cylinder-handover-aug-dp-wrist-diffusion
- Perfil del autor: https://huggingface.co/omkarpatil
- Lista de modelos del autor: https://huggingface.co/omkarpatil/models
