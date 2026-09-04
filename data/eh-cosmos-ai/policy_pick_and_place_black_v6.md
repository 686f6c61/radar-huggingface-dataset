# eh-cosmos-ai/policy_pick_and_place_black_v6

## Resumen

El modelo `eh-cosmos-ai/policy_pick_and_place_black_v6` es una política de aprendizaje por imitación para robótica, desarrollada por `eh-cosmos-ai` y publicada en Hugging Face. Está basada en la arquitectura ACT (Action Chunking with Transformers), presentada en el paper `2304.13705`, y ha sido entrenada y subida al Hub utilizando el framework LeRobot. El modelo resuelve el problema de generar acciones de control para un robot manipulador a partir de observaciones del entorno, mediante la predicción de fragmentos de acciones (action chunks) en lugar de pasos individuales, lo que mejora la estabilidad y la tasa de éxito en tareas de manipulación.

Con 51,7 millones de parámetros y un tamaño de 0,2 GB, es un modelo ligero, pensado para entornos de investigación y prototipado en robótica. No se trata de un modelo de lenguaje: no tiene ventana de contexto ni soporte de texto, y su relevancia radica en el ámbito de la robótica de aprendizaje por imitación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) |
| Parámetros totales | 51.668.614 |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (no es un modelo de lenguaje) |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No disponible (no aplica) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo utiliza la arquitectura ACT, un método de aprendizaje por imitación que transforma observaciones en fragmentos de acciones (action chunks), en lugar de predecir acciones paso a paso. Esta técnica reduce el error acumulativo y permite ejecutar secuencias de movimientos más coherentes. El entrenamiento se ha realizado con el framework LeRobot, que facilita la recopilación de datos teleoperados y el entrenamiento de políticas.

Según la model card, el modelo está asociado al dataset `eh-cosmos-ai/dataset_pick_and_place_black_v6`, aunque no se proporcionan detalles sobre el número de episodios, la composición del dataset ni el proceso de entrenamiento. La innovación técnica destacable es el propio enfoque de action chunking, que ha demostrado altas tasas de éxito en tareas de manipulación robótica.

## Capacidades

- Generación de acciones de control para robots manipuladores en tareas de pick and place.
- Predicción de fragmentos de acciones (action chunks) para ejecutar movimientos suaves y estables.
- Aprendizaje por imitación a partir de demostraciones teleoperadas, sin necesidad de especificar recompensas.
- Integración con el framework LeRobot para entrenamiento, evaluación y despliegue.
- La documentación incluye un ejemplo de evaluación con `--robot.type=so100_follower`, lo que indica que el modelo puede ser evaluado con ese tipo de robot.
- No soporta generación de texto, tool calling, ni capacidades de visión o audio; es exclusivamente un modelo de política robótica.

## Casos de uso

- Automatización de tareas de pick and place en entornos de laboratorio: el modelo puede aprender a recoger y colocar objetos a partir de demostraciones humanas, y luego ejecutar la tarea de forma autónoma. Es adecuado porque ACT predice secuencias de acciones completas, lo que reduce el riesgo de errores en movimientos complejos.
- Investigación en aprendizaje por imitación: sirve como modelo de referencia para estudiar el rendimiento de ACT frente a otras políticas. La integración con LeRobot facilita la comparación y reproducción de experimentos.
- Prototipado de brazos robóticos de bajo coste: dado su tamaño reducido (51,7 millones de parámetros), puede ejecutarse en hardware modesto, permitiendo probar políticas en robots SO-100 u otros compatibles.
- Evaluación de políticas en simulación y real: el modelo puede cargarse con `lerobot-record` para evaluar episodios en un robot real o en simulación, lo que permite validar la robustez de la política.
- Transferencia de tareas entre entornos: al estar entrenado con un dataset específico, puede servir como punto de partida para fine-tuning en tareas similares de manipulación, gracias al framework LeRobot.
- Educación en robótica: el modelo y su documentación permiten a estudiantes aprender cómo se entrena y despliega una política de manipulación, ya que el código y los ejemplos son accesibles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. No se han publicado cifras oficiales.
- GPU recomendadas: no disponible. Dado el tamaño del modelo (0,2 GB en safetensors), es probable que se ejecute en GPUs de consumo como RTX 3060 o superiores, pero no hay datos oficiales.
- Compatibilidad con GPU de consumo: probablemente sí, por el reducido tamaño de los pesos, aunque no hay confirmación oficial.
- Opciones de despliegue: LeRobot (entrenamiento, evaluación y grabación), con soporte para ejecutar la política en dispositivos compatibles.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. No se han encontrado datos comparativos con otros modelos de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no disponible.
- Riesgo de alucinación: no aplica, al no ser un modelo de lenguaje.
- Limitaciones de contexto o idioma: no aplica.
- Restricciones de licencia: la licencia Apache-2.0 permite uso comercial, pero requiere conservar los avisos de licencia y atribución.
- Advertencia general: al ser un modelo de aprendizaje por imitación, su rendimiento depende en gran medida de la calidad y cobertura de las demostraciones del dataset. No se especifica un proceso de evaluación exhaustivo, por lo que se recomienda validar la política en el entorno objetivo antes de usarla en producción.
- El nombre del modelo sugiere una variante específica ("black"), pero la documentación no detalla qué significa, por lo que el usuario debe consultar el dataset asociado para conocer el alcance de la tarea.

## Enlaces

- https://huggingface.co/eh-cosmos-ai/policy_pick_and_place_black_v6
- https://huggingface.co/papers/2304.13705
- https://arxiv.org/abs/2304.13705
- https://github.com/huggingface/lerobot
- https://huggingface.co/docs/lerobot/index
