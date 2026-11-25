# Schrunk/so101_smolVLA_rs_textures

## Resumen

SmolVLA es un modelo compacto de visión-lenguaje-acción (VLA) desarrollado por Hugging Face dentro del ecosistema LeRobot, diseñado para control robótico mediante aprendizaje por imitación. Esta ficha concreta, `Schrunk/so101_smolVLA_rs_textures`, es un fine-tuning del modelo base `lerobot/smolvla_base` publicado por el usuario Schrunk, entrenado específicamente para una tarea de manipulación con el brazo robótico SO-101: colocar un colador de té bajo un dispensador de té.

El modelo consume observaciones multimodales (estado articular de 6 dimensiones y tres cámaras de 256x256 píxeles) y produce acciones de 6 dimensiones a 30 FPS. Con 450 millones de parámetros, está pensado para ejecutarse en hardware de consumo, lo que lo hace accesible para prototipado rápido en robótica de bajo coste.

Su relevancia radica en demostrar el flujo completo de LeRobot: desde la grabación de un dataset de 150 episodios hasta el despliegue de una política entrenada con 18.000 pasos. Es un ejemplo práctico de cómo adaptar un VLA generalista a una tarea concreta con recursos limitados, aunque carece de evaluación publicada y de métricas de éxito en robot real.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en SmolVLA |
| Parámetros totales | 450.046.176 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (modelo de robótica, no de texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

SmolVLA es un modelo de visión-lenguaje-acción que combina un codificador visual, un modelo de lenguaje compacto y un cabezal de acciones para generar comandos motores directamente a partir de observaciones. La arquitectura exacta (número de capas, dimensión oculta, mecanismo de atención) no se detalla en la información disponible; el paper referenciado es arXiv:2506.01844.

El fine-tuning se realizó sobre el dataset `Schrunk/so101_tea_strainer2tea_dispenser_real_sim`, compuesto por 150 episodios y 88.498 frames a 30 FPS, con dos tareas descritas: "place tea strainer under tea dispenser" y "pick up tea strainer and place under tea dispenser". El entrenamiento usó 18.000 pasos, batch size de 32, optimizador AdamW, learning rate 1e-4 y semilla 1000, con LeRobot 0.7.0. No se especifica el número total de tokens ni si hubo RLHF o DPO; al tratarse de aprendizaje por imitación, lo habitual es entrenamiento supervisado sobre pares observación-acción.

## Capacidades

- Control robótico de manipulación: genera acciones de 6 dimensiones para el brazo SO-101 a partir de observaciones visuales y de estado articular.
- Percepción visual multi-cámara: procesa tres cámaras simultáneas (top y wrist, según la model card) con resolución de 256x256.
- Ejecución de tareas guiadas por lenguaje: acepta una instrucción textual de tarea ("place tea strainer under tea dispenser") como condicionamiento.
- Aprendizaje por imitación: política entrenada para replicar demostraciones humanas, no para razonamiento general.
- Despliegue en hardware de consumo: 450M parámetros permiten inferencia en GPUs modestas.
- No soporta tool calling, agentes multi-paso ni capacidades multilingües de texto; es un modelo especializado en robótica.

## Casos de uso

- Automatización de tareas de pick-and-place en laboratorio: el modelo puede ejecutar la secuencia de recoger un colador y colocarlo bajo un dispensador, útil para prototipos de manipulación doméstica o de laboratorio con el brazo SO-101.
- Investigación en aprendizaje por imitación: sirve como punto de partida para estudiar cómo el fine-tuning de un VLA compacto se adapta a tareas específicas con datasets pequeños (150 episodios).
- Benchmarking de pipelines LeRobot: permite validar el flujo completo de grabación, entrenamiento y despliegue en un robot real de bajo coste.
- Educación y formación en robótica: al caber en hardware de consumo y tener licencia Apache 2.0, es adecuado para cursos prácticos de VLA y manipulación.
- Prototipado rápido de políticas de manipulación: con 18.000 pasos de entrenamiento y un dataset reducido, demuestra la viabilidad de iterar rápidamente sobre tareas concretas.
- Integración en entornos simulados y reales: el dataset de entrenamiento combina datos reales y simulados ("real_sim"), lo que permite estudiar transferencia sim-to-real en tareas de manipulación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet."

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 450M parámetros, en FP16 requeriría aproximadamente 0,9 GB de pesos, más overhead de activaciones y cámaras.
- GPU recomendadas: no especificadas; por tamaño, cabría en GPUs de consumo como RTX 3060, RTX 4060 o superiores.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU con al menos 4-6 GB de VRAM, aunque no hay confirmación oficial.
- Opciones de despliegue: LeRobot (`lerobot-rollout`), con soporte para `--policy.path` apuntando al repositorio de Hugging Face.
- Latencia y throughput: no disponibles; el sistema opera a 30 FPS según el dataset, pero no se confirma la tasa de inferencia real.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Schrunk/so101_smolVLA_rs_textures | 450M | no disponible | Apache 2.0 | Hugging Face |
| lerobot/smolvla_base | no disponible | no disponible | Apache 2.0 | Hugging Face |
| Otros VLA compactos (p. ej. OpenVLA) | no disponible en la información | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Sin evaluación publicada: no hay métricas de tasa de éxito en robot real, lo que impide conocer su fiabilidad.
- Especialización extrema: entrenado para una única tarea (colocar un colador de té bajo un dispensador); no generaliza a otras tareas sin reentrenamiento.
- Dependencia de hardware concreto: asume el robot SO-101 y una configuración de tres cámaras con nombres y posiciones específicos.
- Dataset limitado: 150 episodios y 88.498 frames pueden no cubrir variaciones de iluminación, posiciones de objetos o distracciones.
- Riesgo de sobreajuste al entorno de entrenamiento: al ser un fine-tuning sobre datos reales y simulados, puede fallar en condiciones no vistas.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base y el dataset pueden tener sus propias condiciones; conviene verificar.
- Sin soporte de texto general ni multilingüismo: no es un modelo de lenguaje; su uso fuera de robótica no está previsto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Schrunk/so101_smolVLA_rs_textures
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/Schrunk/so101_tea_strainer2tea_dispenser_real_sim
- Paper SmolVLA: https://huggingface.co/papers/2506.01844
- Guía LeRobot SmolVLA: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentación LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Visualizar dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=Schrunk/so101_tea_strainer2tea_dispenser_real_sim
