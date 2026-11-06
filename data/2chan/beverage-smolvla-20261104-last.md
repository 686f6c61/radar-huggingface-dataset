# 2chan/beverage-smolvla-20261104-last

## Resumen

Beverage SmolVLA es una política de control robótico (VLA, vision-language-action) construida sobre el modelo de visión-lenguaje SmolVLM2-500M-Video-Instruct de HuggingFaceTB, que se mantiene congelado. El modelo lo publica el usuario 2chan en Hugging Face y está entrenado con la librería LeRobot para una tarea concreta: manipulación bimanual de bebidas con un robot SO-101. No es un modelo de propósito general, sino un checkpoint de investigación orientado a un entorno y un conjunto de tareas específicos.

El modelo ocupa 450.046.176 parámetros en formato safetensors (aproximadamente 0,45 mil millones) y un repositorio de 0,9 GB. La política recibe observaciones de tres cámaras (muñeca izquierda, muñeca derecha y vista superior), un estado de 12 dimensiones (brazo izquierdo seguido del derecho) y una cadena de tarea, y produce acciones también de 12 dimensiones en chunks de 50 pasos. Las tareas registradas son cuatro: remover (stir), verter agua, verter polvo para latte de té verde y verter polvo de café.

Es relevante como ejemplo práctico de fine-tuning de un VLM pequeño para robótica con LeRobot y del formato SmolVLA, útil para quien quiera replicar un pipeline de imitación bimanual con hardware asequible (SO-101). Conviene subrayar que la pérdida de validación reportada (0,05896) es un objetivo offline de flow-matching y no mide el éxito físico en el robot.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | SmolVLA (política vision-language-action sobre SmolVLM2-500M-Video-Instruct congelado, con experto de acción entrenado) |
| Parámetros totales | 450.046.176 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (repositorio LeRobot con pesos, configuración y procesadores de normalización) |

## Arquitectura y entrenamiento

La arquitectura sigue el esquema SmolVLA: un VLM preentrenado (SmolVLM2-500M-Video-Instruct) que actúa como codificador de observaciones visuales y de la instrucción de tarea, congelado durante el entrenamiento, y un experto de acción junto con proyecciones que se entrenan desde cero sobre las demostraciones de bebidas. Según la model card, la política de acción se inicializó sin los pesos de `lerobot/smolvla_base`; solo el experto de acción y las proyecciones se ajustaron. El método de acción es flow-matching, con chunks de 50 pasos.

El entrenamiento corresponde a la ejecución `20261104_034524_031275` (zona horaria Asia/Seúl), checkpoint «last» en el paso 50.000. Se usan tres cámaras (`observation.images.left_wrist`, `observation.images.right_wrist`, `observation.images.top`), estado y acción de 12 dimensiones (brazo izquierdo y luego derecho) y cuatro identificadores de tarea (0, 1, 2 y 4: remover, verter agua, verter polvo de té verde latte y verter polvo de café). El repositorio incluye pesos, configuración y procesadores de normalización, pero no el estado del optimizador, del scheduler ni del generador aleatorio.

## Capacidades

- Control robótico bimanual: genera acciones de 12 dimensiones para dos brazos SO-101 a partir de observaciones visuales y estado del robot.
- Condicionamiento por tarea: acepta una cadena de tarea y distingue entre cuatro habilidades registradas (remover, verter agua, verter polvo de té verde latte, verter polvo de café).
- Percepción multivista: procesa simultáneamente imágenes de muñeca izquierda, muñeca derecha y vista superior.
- Predicción en chunks: emite secuencias de 50 acciones por inferencia, lo que reduce la frecuencia de recálculo.
- Integración con LeRobot: carga mediante `SmolVLAPolicy.from_pretrained` y usa preprocesador y postprocesador guardados para observaciones, estado y escala de acciones.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, multilingüismo general ni otros modos (thinking, audio).

## Casos de uso

- Replicación de experimentos de imitación bimanual: sirve como referencia para entrenar políticas SmolVLA con LeRobot sobre un robot SO-101 y comparar checkpoints (existe también el checkpoint «best» de la misma ejecución).
- Automatización de tareas de barra o cocina a pequeña escala: verter agua, verter polvos y remover son operaciones repetitivas que el modelo aprende por demostración y puede ejecutar con las tres cámaras configuradas.
- Evaluación de políticas VLA en laboratorio: permite medir el gap entre pérdida de validación offline (0,05896) y éxito físico real, un punto crítico en robótica por imitación.
- Base para fine-tuning adicional: al estar construido sobre SmolVLM2-500M congelado, se puede reentrenar el experto de acción con nuevas demostraciones manteniendo el codificador visual.
- Docencia y prototipado con hardware asequible: el tamaño de 450 M parámetros y el repositorio de 0,9 GB facilitan experimentos en estaciones de trabajo con una sola GPU.
- Estudio de robustez multivista: las tres vistas permiten analizar cómo afecta la oclusión o el cambio de iluminación a la predicción de acciones en tareas de vertido.
- Integración en pipelines LeRobot existentes: el formato de checkpoint y los procesadores guardados simplifican el despliegue en flujos ya basados en `lerobot.policies`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El único dato numérico reportado es la pérdida de validación de flow-matching en held-out: 0,058963854, que es un objetivo de entrenamiento offline y no una medida de éxito en el robot físico.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 450 M parámetros en precisión completa (fp32) rondaría 1,8 GB de pesos, y en fp16/bf16 unos 0,9 GB, a lo que hay que sumar el VLM congelado y las activaciones de las tres cámaras.
- GPU recomendadas: no especificadas por el autor; por tamaño, cualquier GPU consumer con 8 GB o más debería poder alojar el modelo, aunque no hay cifras publicadas de latencia.
- ¿Cabe en GPU consumer? Sí, por el tamaño de parámetros, pero no hay validación publicada en hardware concreto.
- Opciones de despliegue: LeRobot (`SmolVLAPolicy.from_pretrained` con `make_pre_post_processors`); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que además no son el formato natural para una política de acción.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| 2chan/beverage-smolvla-20261104-last | 450.046.176 | no disponible | Política VLA bimanual SO-101 (bebidas) | no disponible | Hugging Face (LeRobot) |
| 2chan/beverage-smolvla-20261104-best | no disponible | no disponible | Misma ejecución, checkpoint «best» | no disponible | Hugging Face |
| lerobot/smolvla_base | no disponible | no disponible | Política SmolVLA base de LeRobot | no disponible | Hugging Face |
| HuggingFaceTB/SmolVLM2-500M-Video-Instruct | ~500 M (no confirmado en la información) | no disponible | VLM generalista (visión-lenguaje) | no disponible | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Especialización estrecha: solo cubre cuatro tareas de bebidas en un robot SO-101 bimanual; no es un modelo generalista.
- La pérdida de validación (0,05896) es un objetivo offline de flow-matching y no garantiza éxito en el robot físico.
- El VLM base está congelado y el experto de acción se entrenó sin inicializar desde `lerobot/smolvla_base`, lo que puede afectar a la generalización frente a políticas preentrenadas.
- El repositorio no incluye estado del optimizador, scheduler ni RNG, por lo que no se puede reanudar el entrenamiento exactamente desde este checkpoint.
- Licencia no disponible: no se puede confirmar el uso comercial; conviene contactar con el autor antes de cualquier despliegue productivo.
- Idiomas y sesgos no documentados.
- Riesgo de sobreajuste al entorno de captura (posición de cámaras, iluminación, objetos concretos) y de degradación fuera de las condiciones de las demostraciones.
- Sin benchmarks públicos ni métricas de éxito físico, la evaluación queda enteramente en manos de quien replique el montaje.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/2chan/beverage-smolvla-20261104-last
- Checkpoint «best» de la misma ejecución: https://huggingface.co/2chan/beverage-smolvla-20261104-best
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolVLM2-500M-Video-Instruct
- Librería LeRobot: https://github.com/huggingface/lerobot
