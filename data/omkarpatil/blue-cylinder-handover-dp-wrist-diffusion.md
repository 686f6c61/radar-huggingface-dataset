# omkarpatil/blue-cylinder-handover-dp-wrist-diffusion

## Resumen

Este modelo es una política de difusión (Diffusion Policy) entrenada con LeRobot para controlar el robot bimanual ROBOTIS FFW SG2 Rev1 en la tarea de handover de un cilindro azul, utilizando únicamente las cámaras de muñeca izquierda y derecha a resolución nativa de 424x240. El autor, Omkar Patil, investigador de robótica en la Universidad Estatal de Arizona, ha publicado el modelo bajo licencia Apache 2.0, lo que permite uso comercial y modificación sin restricciones significativas.

La relevancia de este modelo radica en su enfoque de composición de tareas: las estadísticas de normalización se agruparon sobre 11.870 fotogramas de tres tareas relacionadas (pick-blue-cylinder-left-arm, pick-blue-cylinder-right-arm y blue-cylinder-handover), lo que permite que el modelo se integre en un grupo de políticas que comparten la misma distribución de datos. Además, al usar solo cámaras de muñeca, evita el problema de resoluciones heterogéneas que afecta a la variante de tres cámaras, simplificando el preprocesamiento.

Con 278,8 millones de parámetros y un tamaño de repositorio de 1,1 GB, el modelo está diseñado para inferencia en tiempo real a 15 fps, y su pérdida final de entrenamiento de 0,001 indica una convergencia satisfactoria. Es un ejemplo práctico de cómo aplicar diffusion policies a tareas de manipulación bimanual con requisitos de hardware moderados.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Policy (denoising diffusion probabilistic model) |
| Parametros totales | 278.792.848 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de robótica, no de lenguaje) |
| Tipos de cuantizacion | no disponible (pesos en precisión completa) |
| Idiomas soportados | no aplica |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo implementa una política de difusión condicionada a observaciones visuales y propioceptivas. La arquitectura típica de Diffusion Policy consiste en un codificador de imágenes (generalmente una red convolucional o un transformer) que procesa las dos cámaras de muñeca, junto con un MLP para el estado del robot, y un decodificador que genera acciones mediante un proceso de denoising iterativo (DDPM). El entrenamiento se realizó con el framework LeRobot 0.6.1 (fork ROBOTIS `lerobot-cyclo`), durante 100.000 pasos con batch size 8, optimizador Adam con learning rate 1e-4, betas (0.95, 0.999) y weight decay 1e-6. El scheduler de ruido fue DDPM y la tasa de datos de las demostraciones fue de 15 fps.

Una innovación destacable es el uso de estadísticas de normalización agrupadas (shared-norm) sobre 11.870 fotogramas de tres tareas del grupo de composición B. Estas estadísticas se escribieron idénticamente en cada dataset miembro, verificadas mediante un hash SHA-256 (192368a81435). Esto permite que el modelo se combine con otras políticas del mismo grupo sin necesidad de reentrenamiento, aunque solo con otras políticas de difusión, no con arquitecturas GR00T que usan percentiles diferentes.

## Capacidades

- Control de robot bimanual: genera acciones de posición y orientación para ambos brazos del ROBOTIS FFW SG2 Rev1, permitiendo tareas de handover (transferencia de objeto entre manos).
- Imitación de demostraciones: aprende a replicar trayectorias demostradas por un operador humano, capturadas a 15 fps con cámaras de muñeca.
- Generación de trayectorias suaves: gracias al proceso de denoising, produce acciones temporalmente coherentes y sin saltos bruscos.
- Composición con otras políticas: al compartir estadísticas de normalización con las tareas de pick-blue-cylinder-left-arm y pick-blue-cylinder-right-arm, puede integrarse en un sistema multi-tarea.
- Robustez a variaciones de iluminación y fondo: al usar solo cámaras de muñeca, el modelo se enfoca en la escena cercana al efector, reduciendo la influencia del entorno global.
- Inferencia en tiempo real: con 278,8 millones de parámetros, es viable ejecutarlo a 15 fps en hardware de gama media.

## Casos de uso

- Automatización de líneas de ensamblaje: el modelo puede transferir un componente (cilindro) de un brazo a otro en una celda robótica, reduciendo el tiempo de ciclo en tareas de manipulación bimanual.
- Investigación en aprendizaje por imitación: sirve como punto de partida para estudiar la composición de políticas y la transferencia entre tareas relacionadas, gracias a su esquema de normalización agrupada.
- Desarrollo de robots de servicio: en entornos domésticos o de oficina, un robot bimanual puede usar esta política para entregar objetos entre sus propias manos, por ejemplo al recoger un vaso y pasarlo a la otra mano para colocarlo en una bandeja.
- Benchmark de control robótico: al estar disponible públicamente con licencia Apache 2.0, puede utilizarse como referencia para comparar algoritmos de diffusion policy en tareas de handover.
- Entrenamiento de políticas multi-tarea: el modelo demuestra cómo agrupar estadísticas de normalización entre tareas, lo que puede replicarse en otros dominios para mejorar la generalización.
- Prototipado rápido en robótica educativa: estudiantes e investigadores pueden cargar el modelo en un robot FFW SG2 Rev1 y experimentar con variaciones de la tarea sin necesidad de entrenar desde cero.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo reporta la pérdida final de entrenamiento (0,001) y la tasa de datos (15 fps), pero no hay métricas de éxito en tareas reales ni comparaciones con otros métodos. Se recomienda al usuario evaluar el modelo en su propio entorno antes de usarlo en producción.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible oficialmente. Con 278,8 millones de parámetros y dos entradas de imagen de 424x240, se estima que una GPU con al menos 8 GB de VRAM (por ejemplo, NVIDIA RTX 3070 o superior) sería suficiente para inferencia en tiempo real a 15 fps.
- GPU recomendadas: NVIDIA RTX 3060/3070/3080, A100, H100. Para despliegue en robot, se puede usar una Jetson Orin con 8 GB o más.
- Compatibilidad con GPU de consumo: sí, cabe en GPUs de consumo medio-alto. No requiere hardware especializado.
- Opciones de despliegue: LeRobot proporciona scripts de inferencia para PyTorch. También puede exportarse a ONNX o TensorRT para optimización, aunque no se proporcionan archivos preconvertidos.
- Latencia y throughput: no disponibles. Dado el tamaño y la arquitectura, se espera una latencia de decodificación de 50-100 ms por paso en GPU moderna, cumpliendo con el requisito de 15 fps.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables directamente para la misma tarea y robot. Sin embargo, el autor ha publicado otras políticas para el mismo robot (por ejemplo, `ffw_sg2_pick-blue-cylinder-left-arm_groot-n1.7` y `ffw_sg2_pick-blue-cylinder-left-arm_smolvla`), que usan arquitecturas diferentes (GR00T y SmolVLA). Estas variantes consumen campos de normalización distintos (percentiles vs. min/max), por lo que no son directamente intercambiables. En términos de parámetros, el modelo de difusión es más ligero que los basados en VLA (que suelen superar los 500 millones), pero no se dispone de métricas de rendimiento comparativas.

## Limitaciones y advertencias

- Entrenado exclusivamente con cámaras de muñeca: no funciona si se utilizan otras configuraciones de cámara (por ejemplo, cámara de cabeza) sin reentrenamiento.
- Específico para el robot ROBOTIS FFW SG2 Rev1: las acciones y el espacio de estado están calibrados para este hardware; transferir a otro robot requiere adaptación.
- Limitado a la tarea de handover de cilindro azul: no generaliza a otros objetos o escenarios sin datos adicionales.
- Riesgo de alucinación en trayectorias: como toda política de difusión, puede generar acciones no seguras si las observaciones están fuera de la distribución de entrenamiento.
- Dependencia de la normalización agrupada: si se combina con otras políticas, debe verificarse que compartan el mismo hash de normalización (192368a81435) para evitar inconsistencias.
- Sin benchmarks publicados: no hay evidencia cuantitativa de éxito en tareas reales más allá de la pérdida de entrenamiento.
- Licencia Apache 2.0: permite uso comercial, pero el usuario es responsable de cumplir con las patentes de terceros si las hubiera.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/omkarpatil/blue-cylinder-handover-dp-wrist-diffusion
- Perfil del autor en HuggingFace: https://huggingface.co/omkarpatil
- GitHub del autor: https://github.com/omkarpatil18
- Página personal del autor: https://omkarpatil18.github.io/
- Paper relacionado (Grasp, Handover, Rotate): https://arxiv.org/html/2607.21341v1
