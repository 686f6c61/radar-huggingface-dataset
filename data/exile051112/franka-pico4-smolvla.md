# Exile051112/franka-pico4-smolvla

## Resumen

Este repositorio agrupa los componentes necesarios para desplegar un modelo de visión-lenguaje-acción (VLA) basado en SmolVLA, desarrollado por el usuario Exile051112. SmolVLA es un modelo ligero de Hugging Face diseñado para robótica, que combina un modelo de visión-lenguaje (VLM) compacto con un experto de acción entrenado mediante flow matching. El repositorio no contiene un modelo monolítico, sino una estructura modular: un directorio `base` con los pesos compartidos del policy, un directorio `vlm_metadata` con el tokenizador y procesador de SmolVLM, y tres subdirectorios con adaptadores LoRA independientes para tareas específicas de manipulación robótica con un brazo Franka y una cámara Pico4.

La relevancia de este repositorio radica en su enfoque modular: los adaptadores LoRA se cargan junto con la base compartida, lo que permite intercambiar comportamientos sin fusionar pesos. Los tres adaptadores (`c1_red_yellow_real`, `c2_red_yellow_blue_real`, `c3_red_yellow_blue_edited`) corresponden a variantes de tareas con objetos de colores (rojo, amarillo, azul) en entornos reales o editados. El tamaño total del repositorio es de 0,9 GB, lo que sugiere que la base es relativamente compacta, acorde con la filosofía de SmolVLA de ser eficiente y asequible. No se especifican licencia, idiomas ni detalles de entrenamiento en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SmolVLA (VLM compacto + experto de acción con flow matching) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

SmolVLA, el modelo base sobre el que se construyen los adaptadores, es un VLA ligero que parte de un VLM preentrenado (SmolVLM) y añade un experto de acción entrenado con flow matching. Según el paper de referencia (arXiv:2506.01844), SmolVLA está diseñado para ser eficiente y asequible, permitiendo fine-tuning sobre datasets de LeRobot. El repositorio concreto no proporciona detalles sobre el entrenamiento de los adaptadores LoRA, ni sobre el dataset utilizado, ni sobre el número de tokens de entrenamiento. La estructura modular sugiere que cada adaptador se entrenó de forma independiente para una tarea específica de manipulación con objetos de colores, pero no se dispone de información sobre hiperparámetros, épocas o metodología de entrenamiento.

## Capacidades

- Control robótico de manipulación: el modelo genera acciones (chunks de acción) a partir de imágenes y una instrucción en lenguaje natural, típico de los VLA.
- Percepción visual multi-imagen: al estar basado en SmolVLM, procesa múltiples imágenes de entrada, lo que permite usar varias cámaras o vistas.
- Adaptación por LoRA: los adaptadores independientes permiten especializar el comportamiento sin modificar la base compartida.
- Soporte de instrucciones en lenguaje natural: el modelo interpreta comandos textuales para guiar la ejecución de tareas.
- Capacidades multilingües: no disponibles, ya que no se especifican idiomas soportados.
- Tool calling o function calling: no aplicable en el contexto de robótica; el modelo genera acciones directamente.

## Casos de uso

- Manipulación robótica con brazo Franka: el modelo puede controlar un brazo robótico Franka para tareas de recogida y colocación de objetos, usando las imágenes de una cámara Pico4 como entrada visual. Los adaptadores LoRA permiten configurar comportamientos específicos según los colores de los objetos.
- Investigación en robótica con VLA: el repositorio sirve como base para experimentos de fine-tuning con LoRA, permitiendo a investigadores probar variantes de tareas sin reentrenar el modelo completo.
- Desarrollo de políticas de control con LeRobot: al estar alineado con el ecosistema LeRobot, puede integrarse en pipelines de recolección de datos y entrenamiento de políticas.
- Evaluación de generalización a entornos editados: el adaptador `c3_red_yellow_blue_edited` sugiere pruebas con imágenes editadas sintéticamente, útil para estudiar la robustez del modelo ante variaciones visuales.
- Despliegue en robots de bajo coste: SmolVLA está diseñado para ser eficiente, por lo que este repositorio podría usarse en configuraciones con hardware limitado, aunque no se especifican requisitos concretos.
- Benchmarking de adaptadores LoRA: la estructura modular permite comparar el rendimiento de distintos adaptadores sobre la misma base, facilitando estudios de transferencia de aprendizaje.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye métricas de rendimiento, ni comparaciones con otros modelos, ni evaluaciones en tareas estándar de robótica.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El tamaño del repositorio (0,9 GB) sugiere que la base es ligera, pero no se puede estimar la VRAM sin conocer el número de parámetros y la cuantización.
- GPU recomendadas: no disponible. SmolVLA está diseñado para ser eficiente, pero no se especifican modelos concretos.
- Compatibilidad con GPU de consumo: probablemente sí, dado el enfoque de SmolVLA en asequibilidad, pero no hay confirmación.
- Opciones de despliegue: no se mencionan vLLM, llama.cpp, Ollama ni TGI. Dado que es un modelo de robótica, el despliegue típico sería mediante LeRobot o un framework de control robótico.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar este repositorio con otros modelos VLA. Aunque existen alternativas como OpenVLA o RT-2, no se conocen los parámetros, el rendimiento ni la licencia de este modelo concreto, por lo que cualquier comparación sería especulativa. Se recomienda consultar el paper de SmolVLA para comparaciones a nivel de arquitectura base.

## Limitaciones y advertencias

- El repositorio no especifica licencia, lo que impide conocer las restricciones de uso comercial. Se debe contactar con el autor antes de usar en producción.
- No se proporcionan detalles sobre sesgos o alucinaciones. Al ser un modelo de robótica, el riesgo de alucinación se manifiesta en acciones incorrectas, pero no hay datos al respecto.
- La información sobre idiomas es inexistente; probablemente el modelo funcione mejor en inglés, pero no está confirmado.
- Los adaptadores LoRA son independientes y no están fusionados con la base; es necesario cargarlos correctamente según la estructura del repositorio.
- No hay garantías de que el modelo funcione fuera de las tareas específicas para las que se entrenaron los adaptadores (objetos de colores con brazo Franka y cámara Pico4).
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere que es un proyecto reciente o poco validado por la comunidad.

## Enlaces

- Repositorio principal: https://huggingface.co/Exile051112/franka-pico4-smolvla
- Repositorio base: https://huggingface.co/Exile051112/franka-pico4-smolvla-base
- Árbol de archivos del base: https://huggingface.co/Exile051112/franka-pico4-smolvla-base/tree/main
- Paper de SmolVLA: https://arxiv.org/abs/2506.01844
- Documentación de SmolVLA en LeRobot: https://github.com/saifahmadgit/lerobot_franka_data_collection/blob/main/docs/source/smolvla.mdx
