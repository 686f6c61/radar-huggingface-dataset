# chihunn/groot_full_block_toy_pickup

## Resumen

El modelo `chihunn/groot_full_block_toy_pickup` es un ajuste fino completo del modelo fundacional de robótica `nvidia/GR00T-N1.7-3B`, desarrollado por el usuario chihunn y publicado en Hugging Face. Se trata de una política de control visuomotor entrenada para ejecutar instrucciones de agarre ("Pick up the hammer", "Pick up the cup", "Pick up the block") sobre un conjunto de datos de juguetes de 900 episodios. El modelo está pensado para su uso con la librería LeRobot y el pipeline de robótica de Hugging Face.

Con 3.144.016.000 parámetros, el modelo parte de la arquitectura GR00T N1.7 de NVIDIA, construida sobre Cosmos, que combina un codificador visual, un modelo de lenguaje y una cabeza de acciones. El ajuste fino entrena la totalidad de los parámetros (visión, lenguaje y cabeza de acción), lo que lo convierte en un ejemplo de adaptación completa de un modelo fundacional de robótica a una tarea concreta de manipulación.

Su relevancia radica en que demuestra el flujo de trabajo de especialización de un modelo fundacional de robótica de gran tamaño a una tarea de pick-and-place con dos cámaras (frontal y de muñeca), estado de 8 dimensiones y acciones de 7 dimensiones. Es un modelo de nicho, con cero descargas y cero likes en el momento de la consulta, orientado a experimentación en robótica más que a uso general.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GR00T N1.7 (NVIDIA Cosmos): codificador visual + modelo de lenguaje + cabeza de acciones |
| Parametros totales | 3.144.016.000 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; el autor entrena en fp32 con autocast bf16) |
| Idiomas soportados | no disponible (las instrucciones de entrenamiento están en inglés) |
| Licencia | NVIDIA Open Model License |
| Formato de pesos | safetensors (repo de 12,6 GB) |

## Arquitectura y entrenamiento

El modelo se basa en GR00T N1.7-3B, un modelo fundacional de robótica de NVIDIA construido sobre Cosmos. La arquitectura combina tres componentes: un codificador visual que procesa las imágenes de dos cámaras (frontal y de muñeca), un modelo de lenguaje que interpreta la instrucción en lenguaje natural y una cabeza de acción que genera las acciones motoras. El ajuste fino entrena los tres componentes (`tune_visual=true`, `tune_llm=true`), es decir, los 3,14 mil millones de parámetros.

El entrenamiento se realizó con LeRobot sobre el conjunto completo de toy pickup (900 episodios), con la etiqueta de embodiment `new_embodiment`, estado de 8 dimensiones y acción de 7 dimensiones. Se usó chunk de 16, acciones absolutas, tamaño de lote 32 y 30.000 pasos (este checkpoint corresponde al paso 30.000). El optimizador fue AdamW con tasa de aprendizaje 1e-4, programación coseno con 5% de warmup, pesos en fp32 con autocast bf16 y aumento de datos ColorJitter.

## Capacidades

- Control visuomotor de un brazo robótico para tareas de agarre de objetos a partir de instrucciones en lenguaje natural.
- Interpretación de instrucciones cortas en inglés ("Pick up the hammer", "Pick up the cup", "Pick up the block").
- Procesamiento de dos flujos de cámara (frontal y de muñeca) para la percepción del entorno.
- Generación de secuencias de acciones de 7 dimensiones con chunk de 16 pasos.
- Integración con el ecosistema LeRobot para evaluación y despliegue.
- No se ha documentado soporte de tool calling, agentes multi-paso, capacidades multilingües ni modos de razonamiento extendido.

## Casos de uso

- Investigación en manipulación robótica: servir como punto de partida para experimentos de ajuste fino completo de modelos fundacionales de robótica sobre tareas de pick-and-place con pocos objetos.
- Evaluación comparativa de estrategias de fine-tuning: al entrenar todos los parámetros, permite comparar contra variantes con congelación parcial (por ejemplo, solo la cabeza de acción) en la misma tarea.
- Reproducción de experimentos con LeRobot: el comando `lerobot-eval` permite evaluar la política en un entorno simulado o real con la misma configuración de cámaras y estado.
- Docencia y formación en robótica con IA: ejemplo didáctico de cómo se especializa un modelo fundacional de 3B en una tarea concreta con un dataset pequeño (900 episodios).
- Desarrollo de pipelines de agarre en entornos controlados: útil para prototipos de recogida de objetos ligeros (herramientas, tazas, bloques) en laboratorio.
- Base para ampliación a nuevas instrucciones: al estar entrenado con tres instrucciones, puede servir como inicialización para añadir objetos o tareas adicionales mediante ajuste fino.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 3,14 mil millones de parámetros, en fp32 los pesos ocupan aproximadamente 12,6 GB, por lo que se requiere al menos una GPU con 16 GB o más para fp32, y menos si se aplica cuantización (no documentada por el autor).
- GPU recomendadas: no disponible en la información; por tamaño, una GPU de 16-24 GB (por ejemplo, RTX 4090, A10, L4) sería el mínimo razonable para fp32, y A100/H100 para entrenamiento o inferencia con mayor margen.
- ¿Cabe en GPU de consumo? Probablemente en una RTX 4090 (24 GB) en fp32; no confirmado por el autor.
- Opciones de despliegue: LeRobot (`lerobot-eval`), según la model card. No se documentan vLLM, llama.cpp, Ollama ni TGI, que no son adecuados para un modelo de robótica con cabeza de acción.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| chihunn/groot_full_block_toy_pickup | 3,14B | no disponible | Pick-and-place (3 instrucciones) | NVIDIA Open Model License | Hugging Face (0 descargas) |
| nvidia/GR00T-N1.7-3B | 3,14B | no disponible | Modelo fundacional de robótica | NVIDIA Open Model License | Hugging Face |
| Otros fine-tunes de GR00T N1.7 | no disponible | no disponible | Tareas específicas de manipulación | según autor | Hugging Face |

La comparativa se limita al modelo base y a otros ajustes finos de la misma familia, ya que no se dispone de datos de benchmarks ni de alternativas comparables documentadas en la información proporcionada.

## Limitaciones y advertencias

- Modelo de nicho con cero descargas y cero likes: no hay evidencia de validación por parte de la comunidad.
- Entrenado únicamente con tres instrucciones ("hammer", "cup", "block") y un embodiment concreto (`new_embodiment`); no generalizará a otros objetos, brazos o configuraciones de cámara sin nuevo ajuste fino.
- No se documentan sesgos, pero al ser un modelo de robótica entrenado con un dataset pequeño y específico, su comportamiento fuera de la distribución de entrenamiento es incierto.
- Riesgo de alucinación en el sentido de generar acciones no válidas o inseguras fuera del entorno de entrenamiento; requiere supervisión en entornos reales.
- Licencia NVIDIA Open Model License: permite uso comercial bajo condiciones específicas; es necesario revisar los términos completos antes de desplegar en producción.
- No se dispone de información sobre cuantización, latencia ni requisitos exactos de hardware, lo que dificulta la planificación de despliegue.
- El repositorio ocupa 12,6 GB, lo que implica requisitos de almacenamiento y ancho de banda considerables.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/chihunn/groot_full_block_toy_pickup
- Modelo base: https://huggingface.co/nvidia/GR00T-N1.7-3B
- LeRobot (GitHub): https://github.com/huggingface/lerobot
- Licencia NVIDIA Open Model License: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-open-model-license/
