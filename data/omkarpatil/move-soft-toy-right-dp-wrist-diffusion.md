# omkarpatil/move-soft-toy-right-dp-wrist-diffusion

## Resumen

El modelo `omkarpatil/move-soft-toy-right-dp-wrist-diffusion` es una política de difusión (Diffusion Policy) entrenada con el framework LeRobot para controlar un brazo robótico ROBOTIS FFW SG2 Rev1 en la tarea de mover un juguete suave hacia la derecha. Desarrollado por Omkar Patil, este modelo pertenece a la categoría de aprendizaje por imitación en robótica: aprende a generar acciones de control a partir de observaciones visuales capturadas por dos cámaras de muñeca (izquierda y derecha), sin necesidad de programación explícita de la tarea.

La relevancia de este modelo radica en que demuestra la aplicación práctica de las políticas de difusión en robótica, una técnica que ha ganado popularidad por su capacidad para modelar distribuciones multimodales de acciones. Además, incorpora una innovación metodológica: el uso de estadísticas de normalización agrupadas (shared-norm) para facilitar la composición de políticas entrenadas en tareas similares, lo que permite reutilizar y combinar habilidades. Con aproximadamente 278,8 millones de parámetros y un tamaño de repositorio de 1,1 GB, es un modelo de tamaño moderado, adecuado para experimentación en entornos de investigación y desarrollo.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Policy (red de difusión para generación de acciones) |
| Parametros totales | 278.792.848 (según safetensors); 278.773.200 (según model card) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo de robótica, no procesa texto) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No aplica (modelo de control robótico) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo implementa una política de difusión (Diffusion Policy), una arquitectura que genera secuencias de acciones mediante un proceso de denoising iterativo condicionado a observaciones. En este caso, las observaciones son imágenes de dos cámaras de muñeca (izquierda y derecha) con resolución nativa de 424x240 píxeles. La política se entrena con el framework LeRobot (versión 0.6.1, fork ROBOTIS `lerobot-cyclo`), utilizando el scheduler de ruido DDPM.

El entrenamiento se realizó durante 100.000 pasos con un tamaño de lote de 8, optimizador Adam con tasa de aprendizaje 1e-4, betas (0.95, 0.999) y weight decay 1e-6. Los datos provienen de demostraciones de la tarea `move-soft-toy-right`, agrupadas en el grupo de composición C junto con la tarea `move-soft-toy-left`. Las estadísticas de normalización se calcularon sobre 5.249 frames de todos los miembros del grupo y se escribieron idénticamente en cada dataset, garantizando que las políticas del mismo grupo compartan la misma distribución de entrada. La pérdida final de entrenamiento fue de 0.002.

Una característica destacable es la restricción a solo cámaras de muñeca, lo que evita el problema de resoluciones heterogéneas entre cámaras (la cámara de cabeza tiene 376x672, mientras que las de muñeca son 424x240). Esta decisión simplifica el preprocesamiento y mantiene la uniformidad requerida por Diffusion Policy.

## Capacidades

- Control robótico de manipulación: genera acciones de posición o velocidad para el brazo ROBOTIS FFW SG2 Rev1, permitiendo ejecutar la tarea de mover un juguete suave hacia la derecha.
- Percepción visual con dos cámaras de muñeca: procesa imágenes simultáneas de las cámaras izquierda y derecha a 424x240 píxeles.
- Aprendizaje por imitación: reproduce comportamientos aprendidos de demostraciones humanas, sin necesidad de ingeniería de recompensas.
- Composición con políticas del mismo grupo: puede combinarse con la política `move-soft-toy-left` (mismo grupo de composición C) siempre que compartan el hash de normalización `bbd29ed19fbe`.
- Compatibilidad con LeRobot: integrable en pipelines de entrenamiento y evaluación del ecosistema LeRobot.
- No tiene capacidades de lenguaje natural, tool calling, ni procesamiento de texto; es un modelo puramente de control motor.

## Casos de uso

- Automatización de tareas de manipulación en entornos industriales: el modelo puede ejecutar la tarea de desplazar objetos blandos (como juguetes o piezas flexibles) en una línea de producción, reduciendo la necesidad de programación manual.
- Teleoperación asistida: un operador humano puede demostrar la tarea unas pocas veces y el modelo aprende a replicarla, permitiendo la automatización de operaciones repetitivas en almacenes o laboratorios.
- Investigación en aprendizaje por imitación: sirve como banco de pruebas para estudiar políticas de difusión, composición de habilidades y generalización en robótica, gracias a su tamaño moderado y su documentación detallada.
- Desarrollo de robots de bajo coste: al estar entrenado para el ROBOTIS FFW SG2 Rev1, un robot asequible, el modelo es útil para validar algoritmos en plataformas económicas antes de escalar a hardware más caro.
- Composición de habilidades: combinando esta política con la de `move-soft-toy-left`, se pueden crear comportamientos más complejos, como mover objetos en ambas direcciones, siempre que se respete la compatibilidad de normalización.
- Evaluación de robustez visual: al depender únicamente de cámaras de muñeca, el modelo permite estudiar el impacto de la posición y orientación de las cámaras en el rendimiento de la política, útil para diseñar configuraciones de sensores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo reporta la pérdida final de entrenamiento (0.002) y el número de pasos, pero no hay comparaciones con otros modelos ni métricas de éxito en la tarea (por ejemplo, tasa de éxito en el mundo real).

## Requisitos de hardware

- No se han publicado requisitos de hardware específicos en la documentación del modelo.
- Dado el tamaño de aproximadamente 278,8 millones de parámetros y 1,1 GB de pesos en safetensors, se estima que una GPU con al menos 4 GB de VRAM podría ejecutar la inferencia en tiempo real, aunque no hay datos oficiales de latencia o throughput.
- Para entrenamiento desde cero, se necesitaría una GPU con mayor memoria (por ejemplo, 8-12 GB) y un dataset de demostraciones, pero no se especifican requisitos mínimos.
- Opciones de despliegue: al ser un modelo de LeRobot, puede ejecutarse con las herramientas del ecosistema LeRobot (por ejemplo, `lerobot` CLI) y potencialmente con librerías de inferencia como PyTorch. No se menciona compatibilidad con vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.
- Se recomienda probar en el hardware robótico real para validar el rendimiento, ya que la simulación no está cubierta en la documentación.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. Existen otras políticas de difusión en el ecosistema LeRobot para diferentes robots y tareas, pero no se han encontrado datos específicos de este modelo frente a alternativas. Se recomienda consultar el hub de LeRobot para comparar con otras políticas de difusión entrenadas en tareas similares.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente para la tarea `move-soft-toy-right` en el robot ROBOTIS FFW SG2 Rev1; no generaliza a otras tareas, objetos o robots sin reentrenamiento.
- Depende críticamente de la configuración de cámaras: solo utiliza las dos cámaras de muñeca a 424x240. Cambios en la resolución, posición o calibración de las cámaras pueden degradar el rendimiento.
- La composición con políticas de otras arquitecturas (por ejemplo, GR00T) no es posible debido a diferencias en las estadísticas de normalización (percentiles vs. min/max). Solo se puede componer con políticas de difusión del mismo grupo.
- No se han documentado sesgos en los datos de demostración, pero es probable que el modelo herede cualquier sesgo presente en las demostraciones humanas (por ejemplo, preferencias de velocidad o trayectoria).
- Riesgo de acciones erróneas: si las observaciones en tiempo real difieren significativamente de las del entrenamiento (cambios de iluminación, fondo, posición del objeto), el modelo puede generar acciones incorrectas o inseguras. Se recomienda supervisión humana durante el despliegue.
- La licencia Apache-2.0 permite uso comercial, pero es necesario verificar los términos de uso del hardware ROBOTIS y del framework LeRobot, así como las patentes relacionadas con Diffusion Policy si se utiliza en productos comerciales.
- El modelo fue creado en septiembre de 2026 y no tiene descargas ni valoraciones, lo que indica que es un proyecto reciente y posiblemente experimental; se debe validar su robustez antes de usarlo en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/omkarpatil/move-soft-toy-right-dp-wrist-diffusion
- Dataset asociado: https://huggingface.co/datasets/omkarpatil/move-soft-toy-right/tree/main
- Perfil del autor: https://huggingface.co/omkarpatil/models
- Blog de Seeed Studio sobre proyectos LeRobot (referencia general): https://www.seeedstudio.com/blog/2026/08/31/cool-so-arm101-projects-to-try-now-from-grasping-to-imitation-learning/
