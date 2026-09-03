# omkarpatil/blue-cylinder-handover-aug-dp-wrist-hw-diffusion

## Resumen

Este modelo es una política de difusión (Diffusion Policy) entrenada con LeRobot para el robot ROBOTIS FFW SG2 Rev1, especializada en la tarea de entrega (handover) de un cilindro azul. Desarrollado por omkarpatil, el modelo utiliza únicamente las cámaras de muñeca izquierda y derecha (resolución nativa 424x240) y aplica una normalización basada en los límites articulares del URDF del robot, en lugar de derivar los rangos de los datos de entrenamiento. Esta elección permite que las estadísticas de normalización sean estables ante la adición de nuevas demostraciones y que la política sea componible con otras arquitecturas que compartan el mismo grupo de composición.

El modelo forma parte del grupo de composición B, que incluye tres tareas relacionadas: pick-blue-cylinder-left-arm, pick-blue-cylinder-right-arm y blue-cylinder-handover. Con 274,5 millones de parámetros y una pérdida final de entrenamiento de 0,001, representa un ejemplo de política de difusión ligera y específica para manipulación robótica, publicada bajo licencia Apache 2.0. Su relevancia radica en la metodología de normalización hardware-derivada, que facilita la composición de políticas entre arquitecturas y la reutilización de datos sin necesidad de reentrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Policy (DDPM) |
| Parametros totales | 274.492.048 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica, modelo de control robótico) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es modelo de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura de política de difusión (Diffusion Policy) con scheduler DDPM, implementada sobre LeRobot 0.6.1 (fork `lerobot-cyclo` de ROBOTIS). Se entrenó durante 100.000 pasos con batch size 8, optimizador Adam (lr 1e-4, betas 0.95/0.999, weight decay 1e-6) y una tasa de datos de 15 fps. La entrada se compone de las observaciones de las dos cámaras de muñeca (izquierda y derecha) y el estado del robot, y la salida son acciones de control para los joints.

La innovación principal es la normalización de estado y acción basada en hardware: los límites se toman directamente del URDF del robot, con un 75% de padding en los joints de gripper, cabeza y elevación (cuyos límites URDF no cubren el rango observado) y valores fijos ±1.0 para las tres dimensiones de odometría. Esto produce una transformación que no cambia al añadir datos, permitiendo componer políticas sin reentrenar. Las estadísticas se comparten entre los tres miembros del grupo B, y el hash `1184068d20ae` verifica la compatibilidad entre modelos.

## Capacidades

- Generación de trayectorias de acción para control de robot manipulador (tarea de handover de cilindro azul).
- Procesamiento de observaciones visuales de dos cámaras de muñeca (izquierda y derecha) a resolución nativa.
- Normalización de estado y acción basada en límites URDF, independiente de los datos de entrenamiento.
- Composición con otras políticas del mismo grupo (pick-blue-cylinder-left-arm, pick-blue-cylinder-right-arm) que compartan el mismo hash de normalización.
- Compatibilidad con el ecosistema LeRobot para entrenamiento y despliegue.
- Soporte para inferencia en tiempo real a 15 fps (frecuencia de datos de entrenamiento).

## Casos de uso

- Automatización de tareas de entrega de objetos en líneas de montaje: el modelo puede ejecutar la transferencia de un cilindro entre dos brazos robóticos, reduciendo la intervención manual en procesos repetitivos.
- Investigación en políticas de difusión para manipulación robótica: sirve como referencia para estudiar el efecto de la normalización hardware-derivada en la estabilidad del entrenamiento y la composición de políticas.
- Desarrollo de habilidades robóticas con LeRobot: los desarrolladores pueden integrar este modelo como módulo de control en sistemas basados en LeRobot, aprovechando su formato safetensors y su licencia permisiva.
- Entrenamiento de robots colaborativos (cobot) para interacción humano-robot: la tarea de handover es un caso típico de colaboración, y este modelo proporciona una solución específica para el robot FFW SG2 Rev1.
- Composición de políticas multi-tarea: al compartir estadísticas de normalización con otras dos tareas del grupo B, permite combinar comportamientos sin reentrenar, útil en entornos de producción donde se alternan tareas.
- Simulación y transferencia a robot real: al estar entrenado con datos reales (15 fps) y normalización URDF, puede servir como punto de partida para fine-tuning en simuladores o para validar estrategias de sim-to-real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El único dato de rendimiento reportado es la pérdida final de entrenamiento de 0,001, pero no se proporcionan métricas de éxito en tarea, precisión de agarre ni comparaciones con otras políticas.

## Requisitos de hardware

- No se especifican requisitos de VRAM en la documentación del modelo.
- Dado el tamaño de 274,5 millones de parámetros, el modelo es ligero y debería ejecutarse en GPUs de consumo (por ejemplo, RTX 3060 o superior) con menos de 1 GB de VRAM, aunque no hay datos confirmados.
- El despliegue típico sería en el propio robot o en un ordenador dedicado con GPU, utilizando el framework LeRobot.
- No se mencionan opciones de despliegue como vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje; la inferencia se realiza mediante el pipeline de LeRobot.
- La latencia y el throughput no están documentados; la tasa de datos de entrenamiento es de 15 fps, lo que sugiere que la inferencia puede operar en tiempo real en hardware adecuado.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. Al ser una política de difusión específica para un robot concreto, no se pueden establecer comparaciones directas sin datos adicionales de otras implementaciones.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente para la tarea de handover de un cilindro azul con el robot FFW SG2 Rev1; no generaliza a otros objetos, colores o configuraciones robóticas.
- Depende de la normalización hardware-derivada; si se modifica el URDF del robot o se añaden nuevos joints, las estadísticas de normalización podrían quedar invalidadas.
- Solo utiliza cámaras de muñeca; no procesa información de cámaras de cabeza u otras fuentes, lo que limita su percepción del entorno.
- La composición con otras políticas solo es válida si comparten el mismo hash de normalización (`1184068d20ae`); mezclar políticas con estadísticas diferentes puede producir comportamientos erróneos.
- No se han publicado evaluaciones de robustez ante perturbaciones, cambios de iluminación o variaciones en la posición del objeto.
- La licencia Apache 2.0 permite uso comercial, pero el modelo es específico de un hardware concreto, lo que puede requerir adaptación para otros robots.

## Enlaces

- [HuggingFace: omkarpatil/blue-cylinder-handover-aug-dp-wrist-hw-diffusion](https://huggingface.co/omkarpatil/blue-cylinder-handover-aug-dp-wrist-hw-diffusion)
