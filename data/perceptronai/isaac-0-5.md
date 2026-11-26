# PerceptronAI/Isaac-0.5

## Resumen

Isaac 0.5 es un modelo fundacional abierto para aprendizaje robótico desarrollado por PerceptronAI. Se trata de un modelo multimodal de 36 mil millones de parámetros con arquitectura sparse (MoE) que unifica comprensión de vídeo, razonamiento encarnado (embodied reasoning), anclaje espacial (spatial grounding), estimación de progreso de tarea y control robótico en un único backbone compartido. El modelo consume imágenes, vídeo, instrucciones en lenguaje natural, estado del robot y acciones previas, y produce texto, coordenadas normalizadas, estados de tarea o acciones de robot.

Su relevancia radica en que, según el autor, es el primer modelo abierto que opera en la frontera de comprensión multimodal de vídeo, razonamiento encarnado y control de robots de forma simultánea. Isaac 0.5 se entrena con más de 35 sistemas robóticos, 100.000 horas de experiencia robótica, un millón de horas de vídeo general y tres billones de tokens multimodales, co-entrenando desde el inicio todas sus capacidades sobre un mismo backbone. El checkpoint se distribuye bajo licencia Apache 2.0 y requiere el repositorio propio de Perceptron Isaac para su uso, ya que no es compatible con Transformers estándar ni con LeRobot sin modificaciones.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal sparse (MoE) con expertos dedicados: Flow expert y diffusion transformer para control continuo; vocabulario FAST de 2.048 tokens para control discreto |
| Parámetros totales | 35.723.506.864 (aproximadamente 36 mil millones) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (custom_code) |

## Arquitectura y entrenamiento

Isaac 0.5 emplea un backbone sparse compartido que soporta simultáneamente comprensión de vídeo, pointing, tracking, estimación de estado de tarea y generación de acciones de robot. Para el control continuo incorpora un Flow expert dedicado junto con un diffusion transformer; para el control discreto utiliza un vocabulario de acciones FAST de 2.048 tokens. El modelo predice el siguiente chunk de acciones mientras el chunk actual todavía se está ejecutando, lo que permite control en bucle cerrado en tiempo real usando la observación más reciente y los comandos previamente emitidos.

El entrenamiento combina más de 35 sistemas robóticos, 100.000 horas de experiencia robótica, un millón de horas de vídeo general y tres billones de tokens multimodales. Una de las innovaciones destacadas es el modelado semántico del mundo (semantic world modeling): el modelo aprende de vídeo prediciendo perceptos futuros compactos que capturan cambios relevantes para la tarea, como qué objeto se movió, relaciones espaciales, si hubo contacto, si un agarre se sostuvo o en qué etapa se encuentra la tarea. Estas etiquetas se derivan de fotogramas posteriores, incluyendo vídeo general sin etiquetas de acción. El autor reporta además una ley de escalado para mezclar vídeo general y demostraciones robóticas: con una pérdida objetivo de 2,50, un modelo entrenado con 1.000 horas de vídeo general requiere unas 5.900 horas de teleoperación, mientras que uno entrenado con un millón de horas de vídeo general requiere solo unas 28 horas, una reducción de 210× en teleoperación necesaria.

## Capacidades

- Comprensión multimodal de vídeo e imágenes.
- Razonamiento encarnado (embodied reasoning) orientado a tareas de manipulación y control.
- Anclaje espacial (spatial grounding): producción de coordenadas normalizadas y pointing.
- Tracking de objetos y relaciones espaciales.
- Estimación de progreso y estado de tarea (task-progress estimation).
- Predicción de perceptos futuros (future-percept prediction) para modelado semántico del mundo.
- Generación de acciones de robot con interfaz continua (Flow expert + diffusion transformer) y discreta (vocabulario FAST de 2.048 tokens).
- Control en bucle cerrado en tiempo real con predicción anticipada del siguiente chunk de acciones.
- Procesamiento conjunto de instrucciones en lenguaje, estado del robot y acciones previas.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible de forma explícita.
- Capacidades multilingües: limitadas al inglés según la model card.

## Casos de uso

- Política robótica ajustada por fine-tuning: equipos pueden ajustar Isaac 0.5 como política de robot para una celda de manipulación concreta, aprovechando el co-entrenamiento previo con más de 35 sistemas robóticos para reducir las horas de teleoperación necesarias.
- Planificación y control en bucle cerrado: el modelo predice el siguiente chunk de acciones mientras se ejecuta el actual, lo que lo hace adecuado para tareas de manipulación que requieren reactividad ante cambios en la escena.
- Anclaje espacial para selección de objetos: usar las salidas de coordenadas normalizadas y pointing para indicar al robot qué objeto manipular a partir de una instrucción en lenguaje natural.
- Estimación de progreso de tarea: integrar las salidas de task-state en un planificador o controlador supervisor para detectar fallos de agarre, contactos inesperados o etapas incompletas y disparar recuperaciones.
- Motor de datos para entrenamiento robótico: emplear las predicciones de perceptos futuros y el etiquetado automático de estados de tarea para anotar grandes volúmenes de vídeo egocéntrico y general sin intervención manual.
- Evaluación y reproducción de políticas: utilizar el servidor de políticas de referencia y las herramientas de evaluación del repositorio Perceptron Isaac para comparar políticas entrenadas sobre el mismo backbone en entornos simulados y reales.
- Investigación en leyes de escalado de datos robóticos: usar los resultados y la infraestructura publicada para estudiar la mezcla óptima entre vídeo general, vídeo egocéntrico, datos UMI y teleoperación según el presupuesto disponible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente reporta resultados de la ley de escalado sobre pérdida de acción en trayectorias reservadas (pérdida objetivo de 2,50 y reducción de 210× en horas de teleoperación requeridas), sin tablas comparativas con otros modelos en tareas estándar como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Con 35.723.506.864 parámetros, en precisión BF16 los pesos ocuparían aproximadamente 71 GB, lo que excede cualquier GPU de consumo individual; se requiere cuantización o paralelismo multi-GPU para reducir requisitos.
- GPU recomendadas: no disponible de forma explícita. Por tamaño del checkpoint (143 GB de repositorio) y número de parámetros, son necesarios aceleradores de centro de datos tipo A100/H100, potencialmente en configuración multi-GPU.
- Compatibilidad con GPU de consumo: no disponible. El tamaño del modelo hace improbable su ejecución en GPU de consumo sin cuantización agresiva, y la model card no documenta dicha ruta.
- Opciones de despliegue: el checkpoint se consume exclusivamente a través del repositorio Perceptron Isaac (commit `7256f29`), con integración LeRobot en el commit `2d643a410132cb78ccdc119b2252f6ccff4449de` y sincronización mediante `uv sync --locked --extra perceptron_isaac`. No se soportan Transformers estándar ni LeRobot sin modificar. Compatibilidad con vLLM, llama.cpp, Ollama o TGI: no disponible.
- Latencia y throughput estimados: no disponible. La model card menciona control en bucle cerrado en tiempo real mediante predicción anticipada de chunks, pero no publica cifras de latencia ni de acciones por segundo.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye comparaciones con otros modelos fundacionales de robótica ni con modelos visión-lenguaje-acción de tamaño comparable.

## Limitaciones y advertencias

- Idiomas: el modelo está entrenado y etiquetado únicamente para inglés, lo que limita su uso con instrucciones en castellano u otros idiomas sin ajuste adicional.
- Dependencia de código propietario del ecosistema: no es compatible con Transformers estándar ni con LeRobot sin modificaciones; requiere el repositorio Perceptron Isaac en un commit concreto, lo que añade fricción de mantenimiento y riesgo de rotura ante actualizaciones.
- Riesgo de alucinación: no documentado explícitamente en la información disponible, pero al ser un modelo generativo multimodal que produce texto, coordenadas y estados de tarea, existe riesgo de predicciones incorrectas sobre objetos, contactos o progreso que deben validarse en producción.
- Sesgos conocidos: no documentados en la información disponible. El entrenamiento con vídeo general y datos de teleoperación de más de 35 sistemas robóticos puede introducir sesgos hacia las distribuciones de escenas, objetos y morfologías presentes en esos datos.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el despliegue práctico depende del repositorio complementario y de las versiones fijadas, cuya licencia y condiciones deben verificarse por separado.
- Caveat para producción: el control en bucle cerrado en tiempo real exige garantías de latencia que no se cuantifican en la model card; la ausencia de cifras de throughput y de benchmarks estándar dificulta la comparación objetiva con alternativas.
- Tamaño del checkpoint: 143 GB de repositorio y aproximadamente 36 mil millones de parámetros implican requisitos de almacenamiento e infraestructura considerables para inferencia y fine-tuning.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/PerceptronAI/Isaac-0.5
- Paper: https://pub-d90b81cad7254a1aa6b148ac18153c0c.r2.dev/isaac-0.5.pdf
- Repositorio de código: https://github.com/perceptron-ai-inc/isaac
- Commit compatible: https://github.com/perceptron-ai-inc/isaac/commit/7256f299b7ab74e3682ce50e6bd57d8e4ca6b6b6
