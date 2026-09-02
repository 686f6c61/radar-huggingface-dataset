# 1goldexperience1/towel_fold_smolvla_shaping_005000

## Resumen

El modelo `1goldexperience1/towel_fold_smolvla_shaping_005000` es una política robótica de tipo vision-language-action (VLA) especializada en el plegado de toallas con un robot bimanual real. Desarrollado por el usuario 1goldexperience1, el modelo se basa en el backbone de SmolVLM2-500M, un modelo de lenguaje y visión compacto, al que se le añade un "action expert" entrenado con flow matching. El checkpoint es el resultado de 5.000 pasos de fine-tuning sobre un conjunto de 120 demostraciones reales, con el objetivo de "moldear" (shaping) una política base de ACT ya existente y probada, en lugar de actuar como un controlador independiente.

La relevancia de este modelo radica en su enfoque híbrido de seguridad: se integra en un sistema de control con "authority blend", donde la política SmolVLA solo toma el control cuando sus predicciones coinciden con la política base ACT, lo que reduce el riesgo de movimientos bruscos o pérdida de control en un robot real. Con 450 millones de parámetros y una ventana de contexto de acción de 50 pasos, el modelo está diseñado para ser eficiente y desplegable en hardware de gama media, alineándose con la filosofía de SmolVLA de hacer la robótica de manipulación más asequible.

La arquitectura procesa tres vistas RGB de 256×256 píxeles junto con el estado articular de ambos brazos (28 dimensiones) y genera objetivos de posición articular absolutos de 14 dimensiones. El modelo está publicado bajo licencia Apache 2.0 y utiliza el ecosistema LeRobot, lo que facilita su carga y uso con las herramientas estándar de la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SmolVLM2-500M (backbone vision-language) + action expert con flow matching |
| Parametros totales | 450.046.176 |
| Parametros activos | No disponible (no es un modelo MoE) |
| Longitud de contexto | No especificada para texto; acción: chunk de 50 pasos (n_action_steps=50) |
| Tipos de cuantizacion | No disponible (safetensors de precisión completa) |
| Idiomas soportados | No disponible (modelo entrenado para control robótico, no para diálogo) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (model.safetensors) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura SmolVLA, que combina un modelo de lenguaje y visión preentrenado (SmolVLM2-500M) con un "action expert" entrenado mediante flow matching. El backbone VLM procesa las observaciones visuales y el estado del robot, mientras que el action expert transforma estas representaciones en una secuencia de acciones futuras. En este caso, el action expert genera un chunk de 50 acciones (14 dimensiones cada una: 6 articulaciones + pinza por brazo).

El entrenamiento se realizó en dos fases. Primero, un preentrenamiento del backbone en tareas generales de visión y lenguaje (no especificado). Segundo, un fine-tuning específico para la tarea de plegado de toallas, siguiendo la "Receta Stage B" de SmolVLA: el codificador de visión se congela y solo se entrena el action expert. Se utilizaron 120 demostraciones reales recogidas con un robot bimanual Piper, que se tradujeron en 85.187 frames a 30 FPS. El dataset, llamado `towel_fold_dataset_aug_v1`, se aumentó con variaciones para mejorar la generalización. El entrenamiento se realizó con un batch size de 8 durante 5.000 pasos, partiendo del checkpoint `smolvla_towel120_continue20k_b8_50k_v4` en su paso 50.000.

Una innovación clave de este modelo es su uso en producción: no se despliega como un controlador autónomo, sino como un "candidato" dentro de un sistema de mezcla de autoridades. Un script (`run_hybrid_towel_blend750.sh`) combina las predicciones de este modelo con las de una política ACT base (`towel_fold_act_v4_040000`). La autoridad del modelo SmolVLA aumenta hasta un máximo de 0,9 solo cuando ambas políticas están de acuerdo; si hay desacuerdo, la autoridad decae. Además, las correcciones se limitan en magnitud (máximo 0,15 rad) y en velocidad (máximo 0,02 rad/paso), y la política base siempre controla las pinzas. Este diseño busca la seguridad y la suavidad en la ejecución real.

## Capacidades

- Control robótico bimanual: genera comandos de posición articular absoluta para dos brazos (6 articulaciones + pinza cada uno) a partir de observaciones visuales y propioceptivas.
- Percepción visual multi-cámara: procesa tres vistas RGB simultáneas (256×256) para entender la escena.
- Plegado de toallas: especializado en la tarea de plegar una toalla real con un robot bimanual, aprendido de demostraciones humanas.
- Aprendizaje por imitación: el modelo se entrena mediante behavior cloning (flow matching) sobre demostraciones reales.
- Integración con sistemas de seguridad: diseñado para funcionar dentro de un esquema de "authority blend" con una política base, no como un controlador independiente.
- Generación de acciones en chunk: produce secuencias de 50 acciones de una sola vez, lo que permite una ejecución fluida y reduce la frecuencia de inferencia necesaria.

## Casos de uso

- Automatización de tareas de manipulación deformables: el modelo está específicamente entrenado para plegar toallas, una tarea que requiere percepción visual fina y control preciso de ambos brazos. Puede servir como punto de partida para otras tareas con objetos deformables (ropa, manteles, etc.).
- Investigación en aprendizaje por imitación para robótica: al estar basado en SmolVLA y LeRobot, es un recurso valioso para estudiar cómo un VLA pequeño y eficiente puede moldear una política base más segura. Los investigadores pueden analizar el comportamiento del "authority blend" y las estrategias de corrección.
- Desarrollo de políticas híbridas seguras: el esquema de mezcla de autoridades (SmolVLA + ACT) es un caso de estudio relevante para cualquiera que quiera desplegar VLA en robots reales sin sacrificar la seguridad. El código del proyecto (en GitHub) muestra cómo implementar este enfoque.
- Benchmark de fine-tuning de VLA: el checkpoint sirve como referencia para comparar el rendimiento de diferentes recetas de entrenamiento (Stage A vs. Stage B) y tamaños de backbone (500M vs. modelos más grandes) en una tarea física real.
- Base para nuevos fine-tunings: dado que el modelo ya está ajustado para una tarea específica, se puede usar como checkpoint inicial para fine-tuning en tareas similares de manipulación bimanual, ahorrando tiempo y datos.
- Educación en robótica con IA: el modelo y su documentación (aunque escasa) pueden usarse en cursos de robótica para ilustrar el flujo completo de entrenamiento y despliegue de un VLA, desde la recogida de datos hasta la ejecución en un robot real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo no reporta métricas como MMLU, HumanEval o GSM8K, ya que no es un modelo de lenguaje de propósito general sino una política robótica especializada. El único dato de rendimiento mencionado es cualitativo: en una ejecución real de 750 pasos, el sistema alcanza `status=0` (éxito) con segmentos dominados por SmolVLA a niveles de autoridad de 0,7–0,9. No hay métricas cuantitativas de tasa de éxito o error.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la documentación. Dado el tamaño del modelo (450M parámetros), se estima que cabría en GPUs con al menos 6-8 GB de VRAM en FP16, y menos si se cuantiza. Sin embargo, la inferencia se realiza en tiempo real (30 Hz) sobre un robot, por lo que se recomienda una GPU dedicada.
- GPU recomendadas: una NVIDIA RTX 3060 o superior debería ser suficiente para inferencia a tiempo real. Para entrenamiento, se necesitaría una GPU con al menos 12-16 GB de VRAM (por ejemplo, RTX 3080/4080 o A5000).
- Compatibilidad con GPU de consumo: sí, el modelo es lo suficientemente pequeño como para caber en GPUs de consumo actuales.
- Opciones de despliegue: el modelo se carga con la librería LeRobot (fork SmolVLA). El script de despliegue (`run_hybrid_towel_blend750.sh`) está diseñado para un robot Piper real. No se menciona soporte para vLLM, Ollama o TGI, ya que no es un modelo de lenguaje conversacional.
- Latencia y throughput: no disponibles. El sistema opera a 30 Hz en el robot, lo que implica que la inferencia completa (incluyendo el procesamiento de 3 imágenes) debe completarse en menos de ~33 ms. Esto es factible con hardware moderno y el tamaño compacto del modelo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SmolVLA (este modelo) | 450M | 50 pasos de acción | VLA con flow matching, shaping sobre ACT | Apache 2.0 | HuggingFace |
| ACT (Action Chunking with Transformers) | ~80M (típico) | Variable | Política basada en transformers, sin VLM | MIT (típico) | Código abierto |
| OpenVLA (7B) | 7B | Variable | VLA grande, generalista | MIT | HuggingFace |

Este modelo es significativamente más pequeño que OpenVLA (450M vs 7B), lo que lo hace más adecuado para hardware de bajo coste y despliegue en tiempo real. A diferencia de ACT, que no tiene componentes visuales preentrenados, SmolVLA aprovecha un VLM preentrenado, lo que puede mejorar la generalización visual. Sin embargo, ACT es más simple y puede ser más robusto en tareas muy específicas. La principal diferencia es el enfoque híbrido de seguridad, que no está presente en los otros modelos comparados.

## Limitaciones y advertencias

- El modelo no es un controlador independiente: está diseñado para funcionar dentro de un sistema de "authority blend" con una política base ACT. Usarlo sin este mecanismo de seguridad podría provocar movimientos erráticos o peligrosos.
- Especialización limitada: está entrenado únicamente para plegar toallas con un robot Piper específico. No generaliza a otras tareas, objetos o configuraciones de robot sin un nuevo fine-tuning.
- Datos de entrenamiento limitados: 120 demostraciones es un conjunto pequeño, lo que puede provocar overfitting a las condiciones específicas de recogida de datos (iluminación, posición de la toalla, etc.).
- Riesgo de alucinación visual: como cualquier VLA, puede malinterpretar la escena y generar acciones incorrectas, especialmente en situaciones no vistas durante el entrenamiento.
- Sin métricas cuantitativas: no se proporcionan tasas de éxito, errores medios ni otros benchmarks objetivos, lo que dificulta evaluar su rendimiento real.
- Documentación escasa: la model card es breve y no detalla el dataset de entrenamiento, los hiperparámetros completos ni los resultados de validación.
- Requisitos de integración: para usarlo en un robot real, se necesita el código del repositorio GitHub asociado, que puede no estar mantenido o documentado. El modelo por sí solo no es suficiente.

## Enlaces

- HuggingFace: https://huggingface.co/1goldexperience1/towel_fold_smolvla_shaping_005000
- Repositorio del proyecto: https://github.com/dk2472780158-ctrl/piper-dual-arm-smolvla-towel-folding
- Fork de LeRobot con SmolVLA: https://github.com/zyqdragon/lerobot_smolvla
- Paper de SmolVLA: https://arxiv.org/html/2506.01844v1
- Datasets del autor: https://huggingface.co/1goldexperience1/towel_fold_dataset_aug_v1
