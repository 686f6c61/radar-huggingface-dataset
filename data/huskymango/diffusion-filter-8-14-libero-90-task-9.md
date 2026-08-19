# HuskyMango/diffusion-filter-8-14-libero-90-task-9

## Resumen

El modelo `HuskyMango/diffusion-filter-8-14-libero-90-task-9` es una política visuomotora basada en Diffusion Policy, entrenada con la librería LeRobot sobre un subconjunto filtrado del benchmark LIBERO-90. Diffusion Policy, descrita en el paper arXiv:2303.04137, trata el control visuomotor como un proceso generativo de difusión: en lugar de predecir una única acción, genera una trayectoria completa de acciones de forma iterativa, lo que produce movimientos suaves y robustos, especialmente en tareas de manipulación con contacto físico.

El modelo ha sido desarrollado por el usuario HuskyMango y publicado en Hugging Face con licencia Apache-2.0. Cuenta con 270,4 millones de parámetros y un tamaño de repositorio de 1,1 GB en formato safetensors. Está diseñado para ser utilizado en el ecosistema LeRobot, tanto para entrenamiento como para evaluación e inferencia en robots reales o simulados. Su relevancia radica en que permite reproducir experimentos de aprendizaje por imitación en el benchmark LIBERO, un estándar para estudiar transferencia de conocimiento en robótica.

Al ser un modelo especializado en robótica, no es un LLM de propósito general; su salida son secuencias de acciones articulares o de efector final, condicionadas por observaciones visuales y de estado. La información disponible no especifica la longitud de contexto, los idiomas ni los tipos de cuantización, por lo que estos campos se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Policy (visuomotor) |
| Parametros totales | 270.421.900 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo implementa Diffusion Policy, una arquitectura que modela la política como un proceso de denoising por difusión. En lugar de predecir una acción puntual, el modelo genera una secuencia de acciones (trayectoria) condicionada a observaciones actuales (imágenes y estado del robot). Durante el entrenamiento se aprende a revertir un proceso de ruido gaussiano aplicado a las trayectorias, y en inferencia se muestrea una trayectoria desde ruido puro mediante iteraciones de denoising. Este enfoque mejora la estabilidad y suavidad de los movimientos en tareas de manipulación de contacto.

Los detalles exactos de entrenamiento (número de tokens, composición del dataset, uso de RLHF o DPO) no se han publicado en la información disponible. Se sabe que el modelo fue entrenado con LeRobot sobre el dataset `HuskyMango/filter-8-14-libero-90-task-9`, que es una versión filtrada del subconjunto LIBERO-90 del benchmark LIBERO. LIBERO-90 contiene 90 tareas de manipulación diseñadas para estudiar la transferencia de conocimiento declarativo y procedimental. El prefijo "filter-8-14" sugiere un filtrado específico, aunque su significado exacto no está documentado en la información proporcionada.

## Capacidades

- Generación de trayectorias de acción para control visuomotor: el modelo produce secuencias de acciones articulares o de efector final a partir de observaciones de cámara y estado.
- Manipulación de contacto: gracias a la generación de trayectorias suaves, es adecuado para tareas que requieren interacción física con objetos.
- Aprendizaje por imitación: puede ser utilizado como política entrenada mediante demostraciones, dentro del flujo de trabajo de LeRobot.
- Integración con el ecosistema LeRobot: compatible con las herramientas de entrenamiento, evaluación y grabación de episodios de LeRobot.
- Especialización en el benchmark LIBERO: diseñado para tareas del subconjunto LIBERO-90, lo que facilita la comparación con otros métodos en este benchmark.
- No se han documentado capacidades adicionales como tool calling, agentes o procesamiento de lenguaje natural.

## Casos de uso

- Evaluación de políticas en el benchmark LIBERO: el modelo puede ejecutarse en el entorno de simulación LIBERO para medir su tasa de éxito en las 90 tareas de LIBERO-90, sirviendo como referencia para estudios de transferencia de conocimiento.
- Entrenamiento de robots reales mediante imitación: utilizando el flujo de LeRobot, el modelo puede desplegarse en un robot SO-100 u otro compatible para ejecutar tareas de manipulación aprendidas de demostraciones humanas.
- Estudio de filtrado de datos en aprendizaje por imitación: al estar entrenado sobre un dataset filtrado, permite investigar cómo la selección de demostraciones afecta al rendimiento de la política.
- Base para aprendizaje continuo: dado que LIBERO-90 se usa para preentrenar y LIBERO-10 para evaluar aprendizaje lifelong, este modelo puede servir como punto de partida para experimentos de adaptación a nuevas tareas.
- Comparación de arquitecturas de políticas: al ser una Diffusion Policy, puede compararse con otras políticas (ACT, etc.) en las mismas tareas para analizar ventajas y desventajas.
- Reproducción de experimentos: investigadores pueden clonar el repositorio y reproducir los resultados reportados, gracias a la integración con LeRobot y la disponibilidad del dataset.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no se dispone de datos oficiales. Con 270M de parámetros en FP32, el peso ocupa aproximadamente 1,08 GB, por lo que una GPU con al menos 2-4 GB de VRAM podría ejecutar la inferencia, aunque la carga real depende del tamaño del batch y de las dimensiones de las observaciones.
- GPU recomendadas: no se especifican. Para entrenamiento, LeRobot suele requerir GPUs de gama media-alta (por ejemplo, RTX 3090, RTX 4090, A100) dependiendo del tamaño del dataset y de las imágenes.
- Compatibilidad con GPUs de consumo: probablemente sí, dado el tamaño moderado del modelo, pero no hay confirmación oficial.
- Opciones de despliegue: el modelo está diseñado para usarse con LeRobot, que soporta PyTorch y CUDA. No se menciona compatibilidad con vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables específicos dentro del mismo contexto (por ejemplo, otras Diffusion Policies entrenadas en LIBERO-90 con diferentes datasets o configuraciones). La información proporcionada no incluye comparativas con alternativas como ACT o RVT en este benchmark.

## Limitaciones y advertencias

- Sesgos conocidos: no se han documentado sesgos específicos, pero al ser un modelo entrenado en un entorno simulado (LIBERO), puede no generalizar bien a entornos físicos reales sin ajuste fino.
- Riesgo de alucinación: en el contexto robótico, puede generar trayectorias de acción que no correspondan a movimientos físicamente realizables o seguros, especialmente si las observaciones están fuera de la distribución de entrenamiento.
- Limitaciones de contexto: no se especifica la longitud de la ventana de observación ni el horizonte de predicción, por lo que no se puede garantizar su comportamiento en tareas de larga duración.
- Limitaciones de idioma: al ser un modelo visuomotor, no procesa lenguaje natural; no es aplicable a tareas de texto.
- Restricciones de licencia: la licencia Apache-2.0 permite uso comercial, modificación y redistribución, siempre que se mantenga el aviso de copyright y se indiquen los cambios realizados.
- Advertencia para producción: no hay evidencia de que el modelo haya sido validado en robots físicos; su uso en producción requiere pruebas exhaustivas de seguridad y robustez.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/HuskyMango/diffusion-filter-8-14-libero-90-task-9)
- [Dataset asociado](https://huggingface.co/datasets/HuskyMango/filter-8-14-libero-90-task-9)
- [Paper de Diffusion Policy](https://huggingface.co/papers/2303.04137)
- [Repositorio de LeRobot](https://github.com/huggingface/lerobot)
- [Documentación de LeRobot](https://huggingface.co/docs/lerobot/index)
- [Benchmark LIBERO (GitHub)](https://github.com/Lifelong-Robot-Learning/LIBERO)
- [Datasets de LIBERO](https://libero-project.github.io/datasets)
