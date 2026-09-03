# omkarpatil/pick-blue-cylinder-right-arm-dp-wrist-hw-diffusion

## Resumen

Este modelo es una política de difusión (diffusion policy) entrenada con LeRobot para la tarea de recoger un cilindro azul con el brazo derecho del robot ROBOTIS FFW SG2 Rev1, utilizando exclusivamente las cámaras de muñeca (`cam_left_wrist` y `cam_right_wrist`). El desarrollo corre a cargo de omkarpatil y se distribuye bajo licencia Apache 2.0. Su relevancia radica en que emplea una normalización basada en los límites articulares del URDF (hardware-derived) en lugar de estadísticas de datos, lo que permite componer políticas entre distintas arquitecturas y tareas del mismo grupo sin necesidad de reentrenar.

El modelo tiene 274.492.048 parámetros y se presenta en formato safetensors, con un tamaño de repositorio de 1,1 GB. Está diseñado para ser ejecutado con la librería LeRobot en su versión 0.6.1, usando el fork `lerobot-cyclo` de ROBOTIS. La política genera acciones de control a 15 fps y alcanza una pérdida final de entrenamiento de 0,001.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion policy (DDPM) |
| Parametros totales | 274.492.048 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de control robótico, no lingüístico) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Se trata de una política de difusión basada en el proceso de denoising DDPM, implementada con los parámetros por defecto de LeRobot. El entrenamiento se realizó durante 100 000 pasos con un tamaño de lote de 8, optimizador Adam con tasa de aprendizaje 1e-4, betas (0,95, 0,999) y weight decay 1e-6. La tasa de datos es de 15 fps y la pérdida final de entrenamiento es 0,001.

La innovación principal es la normalización de estados y acciones basada en los límites articulares del URDF del robot, con un 75 % de margen adicional en las articulaciones de pinza, cabeza y elevación, y valores fijos ±1,0 para las tres dimensiones de odometría. Esta transformación es independiente de los datos, por lo que añadir nuevas demostraciones a cualquier miembro del grupo de composición no invalida las demás políticas ni requiere reentrenamiento. El grupo de composición B incluye las tareas `pick-blue-cylinder-left-arm`, `pick-blue-cylinder-right-arm` y `blue-cylinder-handover`, y todas comparten un hash de normalización (`1184068d20ae`) que debe verificarse antes de componer modelos.

## Capacidades

- Generación de acciones de control para un brazo robótico de 6 grados de libertad (FFW SG2 Rev1) en tareas de recogida y colocación.
- Procesamiento de imágenes de dos cámaras de muñeca (resolución nativa 424x240) para percibir el objeto y guiar la manipulación.
- Composición con otras políticas del mismo grupo de normalización, siempre que compartan el hash indicado.
- Compatibilidad con el ecosistema LeRobot para entrenamiento, evaluación y despliegue.
- Normalización invariante a la adición de datos, lo que facilita el mantenimiento y la extensión del conjunto de demostraciones.

## Casos de uso

- Automatización de tareas de pick-and-place en líneas de producción: el modelo puede integrarse en un sistema robótico para recoger piezas cilíndricas de una cinta transportadora y colocarlas en una posición determinada, usando las cámaras de muñeca para localizar el objeto.
- Investigación en aprendizaje por imitación: sirve como referencia para estudiar el efecto de la normalización basada en hardware frente a la basada en datos, y para validar estrategias de composición de políticas.
- Desarrollo de políticas robóticas componibles: al compartir estadísticas de normalización con otras tareas del grupo B, permite construir bibliotecas de habilidades reutilizables sin reentrenar desde cero.
- Entrenamiento y evaluación en entornos simulados: puede desplegarse en simuladores compatibles con LeRobot para validar el comportamiento antes de pasar al hardware real.
- Demostración de buenas prácticas en LeRobot: el repositorio documenta el proceso de conversión de dataset v2.1 a v3.0 y la restauración de estadísticas agrupadas, útil para desarrolladores que trabajen con formatos de datos robóticos.
- Integración en sistemas de control de robots ROBOTIS FFW SG2 Rev1: el modelo está específicamente calibrado para este hardware, por lo que puede usarse directamente en aplicaciones que utilicen este robot.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente reporta la pérdida final de entrenamiento (0,001) y la tasa de datos (15 fps), pero no incluye métricas de éxito en tareas reales ni comparaciones con otras políticas.

## Requisitos de hardware

- No se dispone de datos oficiales sobre VRAM o GPU recomendadas en la model card.
- Dado el tamaño del modelo (274 M parámetros) y su naturaleza de política de difusión, es razonable estimar que puede ejecutarse en GPUs de consumo con al menos 8 GB de VRAM en precisión FP32, y menos si se aplica cuantización, aunque no se proporcionan cifras concretas.
- El despliegue está pensado para el ecosistema LeRobot, que soporta inferencia en GPU (CUDA) y también en CPU para pruebas de baja frecuencia.
- No se indican opciones de despliegue como vLLM u Ollama, ya que no es un modelo de lenguaje; el flujo habitual es mediante el pipeline de LeRobot.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa con otros modelos de la misma categoría. La model card no menciona alternativas ni proporciona datos de rendimiento comparativo. Se recomienda consultar el repositorio de LeRobot para encontrar otras políticas de difusión entrenadas en tareas similares, aunque no hay métricas públicas que permitan una comparación objetiva.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente para la tarea de recoger un cilindro azul con el brazo derecho; no generaliza a otros objetos, colores o configuraciones de brazo sin reentrenamiento.
- Depende de la configuración específica de cámaras de muñeca y de la normalización basada en URDF; cualquier cambio en el hardware o en los límites articulares invalidaría la política.
- La composición con otras políticas solo es válida si comparten el mismo hash de normalización (`1184068d20ae`); mezclar modelos con estadísticas diferentes puede producir comportamientos erróneos.
- No es un modelo de lenguaje ni de razonamiento general; su salida son acciones de control, no texto.
- Aunque la licencia Apache 2.0 permite uso comercial, el modelo está ligado al hardware ROBOTIS FFW SG2 Rev1, por lo que su aplicabilidad fuera de ese robot es limitada.
- No se han publicado evaluaciones de robustez ante perturbaciones visuales, cambios de iluminación o variaciones en la posición del objeto, por lo que su comportamiento en entornos no controlados es incierto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/omkarpatil/pick-blue-cylinder-right-arm-dp-wrist-hw-diffusion
- LeRobot (librería de referencia): https://github.com/huggingface/lerobot
- Documentación de LeRobot sobre diffusion policies: https://lerobot.readthedocs.io/ (no se ha verificado un enlace directo, pero es el recurso oficial)
