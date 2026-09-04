# omkarpatil/ffw_sg2_put-bread-in-tray_dp_sharednorm_3cam

## Resumen

Modelo de Diffusion Policy para control robótico desarrollado por Omkar Patil, basado en LeRobot 0.6.1. Está entrenado para la tarea específica de colocar pan en una bandeja en un robot de la familia FFW SG2. Utiliza tres cámaras (cabeza izquierda y dos muñecas) con entrada uniforme de 224×224, estado de 22 dimensiones y salida de acciones de 16 dimensiones a 15 Hz. El checkpoint se ha entrenado durante 100.000 pasos con normalización MIN_MAX y forma parte del grupo de composición D, que agrupa datos de tres tareas de colocar pan con un total de 11.872 fotogramas. Es relevante como ejemplo de política de difusión entrenada con LeRobot para manipulación robótica, especialmente en contextos de investigación con pocos datos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Policy (LeRobot 0.6.1) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (n_obs_steps=1, observación de un único fotograma) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de control robótico, no de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo implementa una política de difusión (Diffusion Policy) dentro del framework LeRobot, con los parámetros por defecto y `n_obs_steps=1`, lo que significa que en ejecución utiliza un único fotograma de observación. Las entradas son imágenes de tres cámaras: `cam_left_head` y las dos cámaras de muñeca, todas redimensionadas a 224×224 píxeles. El estado del robot se representa con 22 dimensiones y las acciones de salida son de 16 dimensiones (brazos) a una frecuencia de 15 Hz. La normalización de entradas y salidas es de tipo MIN_MAX. El entrenamiento se realizó durante 100.000 pasos. Los datos provienen del grupo de composición D, que agrupa las tres tareas de colocar pan y contiene 11.872 fotogramas; el normalizador se verificó idéntico entre los miembros del grupo en los checkpoints guardados. No se ha publicado información adicional sobre el conjunto de datos original ni sobre el procedimiento de entrenamiento.

## Capacidades

- Genera acciones de control para los brazos (16 dimensiones) para la tarea de colocar pan en una bandeja.
- Procesa imágenes de tres cámaras (cabeza y muñecas) a resolución 224×224 para condicionar la política.
- Utiliza una ventana de observación de un solo fotograma (`n_obs_steps=1`), lo que reduce la latencia en ejecución.
- No soporta tool calling, generación de texto, razonamiento simbólico ni capacidades de lenguaje.
- La salida se limita a acciones de 16 dimensiones para los brazos, sin control de pinza explícito según la model card.

## Casos de uso

- Manipulación robótica en entornos de laboratorio: el modelo puede controlar un brazo robótico para ejecutar la tarea de colocar un pan en una bandeja, útil para investigar políticas de difusión en robótica.
- Automatización de procesos de picking y placing: adecuado para tareas repetitivas de manipulación donde se dispone de las mismas cámaras y configuración del robot.
- Evaluación de políticas en simulador o en robot real: sirve como referencia para comparar con otras políticas entrenadas con LeRobot en el mismo grupo de composición.
- Desarrollo de sistemas de control basados en aprendizaje por imitación: el modelo demuestra cómo se pueden entrenar políticas con pocos datos (11.872 fotogramas) para una tarea concreta.
- Investigación en normalización y transferencia entre tareas: la verificación del normalizador entre miembros del grupo permite estudiar el efecto de compartir estadísticas entre tareas relacionadas.
- Base para fine-tuning en tareas similares: al ser un checkpoint de 100.000 pasos, puede servir como inicialización para nuevas tareas de colocación de objetos con la misma configuración de cámaras.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible.
- GPU recomendadas: no disponible.
- Capacidad para ejecutarse en GPU de consumo: no disponible (el tamaño del repositorio es de 1,2 GB, pero no se especifican requisitos de VRAM).
- Opciones de despliegue: el modelo se integra con LeRobot 0.6.1; no se mencionan otras opciones como vLLM, llama.cpp u Ollama, que son específicas para modelos de lenguaje.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar este modelo con alternativas de la misma categoría. El autor publica otros modelos como `omkarpatil/ffw_sg2_put-blocks-in-bowl_groot-n1.7`, que es un modelo VLA basado en GR00T N1.7, pero no pertenece a la misma familia de Diffusion Policy y no se han proporcionado benchmarks comparables. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente para la tarea "put-bread-in-tray" y no generaliza a otros objetos o tareas sin fine-tuning.
- Depende de una configuración específica de cámaras (cam_left_head y ambas muñecas) y de una resolución de entrada de 224×224; cambios en la disposición de las cámaras o en el robot invalidan el funcionamiento esperado.
- La normalización MIN_MAX requiere que los datos de entrada se escalen exactamente igual que en el entrenamiento; cualquier discrepancia en el normalizador degradará el rendimiento.
- Al ser un modelo de control robótico, no presenta riesgo de alucinación en el sentido de generación de lenguaje, pero sí puede generar acciones incorrectas ante observaciones fuera de la distribución de entrenamiento.
- No se han publicado métricas de éxito ni tasas de error, por lo que no es posible evaluar su fiabilidad en producción.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre el rendimiento ni el soporte.

## Enlaces

- Hugging Face: https://huggingface.co/omkarpatil/ffw_sg2_put-bread-in-tray_dp_sharednorm_3cam
- Perfil del autor: https://huggingface.co/omkarpatil/models
