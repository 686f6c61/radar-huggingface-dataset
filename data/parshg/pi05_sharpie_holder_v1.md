# ParshG/pi05_sharpie_holder_v1

## Resumen

pi05_sharpie_holder_v1 es una política robótica de tipo VLA (vision-language-action) publicada en HuggingFace por el usuario ParshG. Se trata de un fine-tune del modelo base lerobot/pi05_base, que a su vez es la implementación en LeRobot de π₀.₅ (Pi05) de Physical Intelligence, un modelo diseñado para generalizar a entornos y situaciones no vistos durante el entrenamiento. El modelo resultante está especializado en una única tarea de manipulación: introducir un rotulador (Sharpie) en un soporte de bolígrafos, ejecutada por un robot SO-101.

A diferencia de un modelo de lenguaje, esta política no genera texto: consume observaciones multimodales (tres cámaras RGB a 224x224 y un vector de estado de 32 dimensiones) y produce un vector de acción de 6 dimensiones para el control del robot. El repositorio ocupa 9,4 GB y contiene 4.143.404.816 parámetros en formato safetensors. La licencia es "gemma", heredada del modelo base.

Su relevancia es acotada y práctica: sirve como ejemplo reproducible de fine-tuning de un VLA moderno con LeRobot 0.6.2 y como punto de partida para tareas de pick-and-place similares. No se han publicado resultados de evaluación en la información disponible, por lo que su rendimiento real en el robot no está cuantificado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | VLA (vision-language-action) basada en π₀.₅ (pi05); detalles internos no disponibles en la model card |
| Parámetros totales | 4.143.404.816 (~4,14 mil millones) |
| Parámetros activos | No aplica (no se indica que sea un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No disponible (no es un modelo de lenguaje de propósito general) |
| Licencia | gemma |
| Formato de pesos | safetensors (repositorio LeRobot; 9,4 GB) |
| Biblioteca | lerobot (0.6.2 en el entrenamiento) |
| Modelo base | lerobot/pi05_base |
| Tipo de robot | so_follower (SO-101) |
| Cámaras declaradas | `observation.images.base_0_rgb`, `observation.images.left_wrist_0_rgb`, `observation.images.right_wrist_0_rgb`, `observation.images.empty_camera_0` (todas 3x224x224) |
| Entrada de estado | `observation.state`, shape (32,) |
| Salida | `action`, shape (6,) |
| Pipeline | robotics |
| Descargas / likes | 0 / 0 |
| Fecha de creación (Hub) | 9 de octubre de 2026 |
| Última actualización (Hub) | 9 de octubre de 2026 |

## Arquitectura y entrenamiento

La model card describe el modelo como una política π₀.₅ (Pi05) de Physical Intelligence, presentada como una evolución de π₀ orientada a la generalización en entornos abiertos. La implementación utilizada es la de LeRobot, adaptada del repositorio OpenPI del propio fabricante. El número de parámetros (4,14 mil millones) es coherente con una columna vertebral visión-lenguaje de tamaño medio más una cabeza de acción, aunque la model card no detalla la composición interna, el tipo de decodificación ni el mecanismo exacto de generación de acciones, por lo que esos extremos quedan como "no disponible".

El entrenamiento es un fine-tuning de imitación sobre el dataset ParshG/so101_sharpie_holder_20261006_112937: 50 episodios, 35.964 fotogramas a 30 FPS y una única tarea ("Put the Sharpie in the pen holder"). La configuración reportada es de 20.000 pasos, batch size 8, optimizador AdamW, learning rate 2,5e-05 y semilla 1000. No se menciona ningún proceso de RLHF, DPO ni refuerzo por recompensa; se trata de aprendizaje por imitación supervisada a partir de demostraciones.

## Capacidades

- Control robótico de manipulación: genera comandos de acción de 6 dimensiones para un robot SO-101 a partir de observaciones visuales y de estado.
- Percepción visual multicámara: procesa cuatro entradas de imagen de 3x224x224 (una base, dos de muñeca y una cámara declarada como vacía).
- Fusión de estado y visión: combina un vector de estado de 32 dimensiones con las imágenes para producir la acción.
- Ejecución de una única tarea especializada: "Put the Sharpie in the pen holder".
- No dispone de generación de texto, razonamiento simbólico, código ni matemáticas: no es un modelo de lenguaje.
- No soporta tool calling ni function calling.
- No está orientado a agentes ni a razonamiento multi-paso en el sentido de los LLM; su "razonamiento" es implícito en la política de control.
- Capacidades multilingües: no aplica.
- No se documentan modos especiales (thinking mode, audio, etc.).

## Casos de uso

- Automatización de la tarea concreta de colocar el rotulador en el soporte: se puede desplegar directamente con `lerobot-rollout` sobre un SO-101 calibrado con las mismas cámaras y la misma disposición de escena que en el entrenamiento.
- Punto de partida para fine-tuning de tareas de pick-and-place similares: al derivar de lerobot/pi05_base, sirve como referencia de configuración (pasos, learning rate, batch) para nuevos datasets de manipulación.
- Validación de pipelines de LeRobot: útil para comprobar de extremo a extremo el flujo de grabación de datos, entrenamiento y rollout con la versión 0.6.2.
- Investigación en generalización de políticas VLA: permite estudiar cómo se comporta un fine-tune estrecho frente al objetivo de generalización a entornos nuevos de π₀.₅.
- Evaluación comparativa de estrategias de imitación: puede usarse como baseline frente a otras políticas del ecosistema LeRobot (ACT, Diffusion Policy, SmolVLA) en la misma tarea y robot.
- Demostraciones y docencia en robótica: ejemplo reproducible de entrenamiento de una política de imitación con datos propios, útil en cursos y talleres de robot learning.
- Recolección de datos asistida por política: ejecutar el modelo para generar episodios adicionales y ampliar el dataset con el que se vuelve a entrenar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye una sección de evaluación con la plantilla vacía y la indicación explícita de que todavía no se han proporcionado resultados en robot real (trials, éxitos y tasa de éxito). Tampoco hay métricas de pérdida de entrenamiento ni comparaciones con otras políticas.

## Requisitos de hardware

Las cifras de VRAM son estimaciones derivadas del recuento de parámetros (4,14 mil millones) y del coste adicional de activaciones y caché; no proceden de la model card.

- Inferencia en bf16/fp16: aproximadamente 8,3 GB solo de pesos, en torno a 10-12 GB contando activaciones y codificador visual.
- Inferencia en fp32: aproximadamente 16,6 GB de pesos, en torno a 20 GB en total.
- Inferencia en int8: aproximadamente 4,2 GB de pesos, en torno a 6-8 GB en total.
- Inferencia en int4: aproximadamente 2,1 GB de pesos, en torno a 4 GB en total.
- GPU recomendadas: A100, H100 o L40S para entrenamiento y evaluación a escala; RTX 4090 o RTX 3090 (24 GB) son suficientes para inferencia en bf16.
- GPU de consumo: cabe en RTX 4090, RTX 3090 y RTX 4080 (16 GB) en bf16. En tarjetas de 8 GB sería necesario cuantizar, si el runtime lo permite.
- Plataformas embebidas: Jetson AGX Orin (32/64 GB) es una opción habitual para despliegue junto al robot, aunque no está confirmada en la documentación.
- Despliegue: el flujo previsto es LeRobot mediante `lerobot-rollout` con `--policy.path=ParshG/pi05_sharpie_holder_v1` y `--policy.device=cuda`. La implementación de referencia del modelo original está en OpenPI. Los servidores genéricos de LLM (vLLM, llama.cpp, Ollama, TGI) no son aplicables porque el modelo incluye una cabeza de acción específica.
- Latencia y throughput: no disponibles. Como referencia del bucle de control, el dataset se grabó a 30 FPS, lo que implica ventanas de unos 33 ms por paso, pero no se publica la latencia real de inferencia de la política.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entradas | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pi05_sharpie_holder_v1 (este) | 4.143.404.816 | 4 imágenes 224x224 + estado (32,) | Poner un rotulador en el soporte (SO-101) | gemma | Público en HF, 0 descargas |
| lerobot/pi05_base | No disponible | No disponible | Política VLA generalista del ecosistema LeRobot | No disponible | Público en HF |
| Otras políticas LeRobot (ACT, Diffusion Policy, SmolVLA) | No disponible | Depende de la política | Manipulación por imitación | Depende del modelo | Público en HF / documentación LeRobot |

No se dispone de datos de rendimiento comparables entre estas alternativas en la información proporcionada, por lo que la comparación se limita a arquitectura, licencia y disponibilidad.

## Limitaciones y advertencias

- Especialización extrema: la política está entrenada para una sola tarea; fuera de "Put the Sharpie in the pen holder" no hay garantía de comportamiento útil.
- Sin evaluación publicada: no existen tasas de éxito en robot real, por lo que el rendimiento en producción es desconocido.
- Dependencia del montaje: las cámaras declaradas (`base_0_rgb`, `left_wrist_0_rgb`, `right_wrist_0_rgb`, `empty_camera_0`) y sus nombres deben coincidir con las observaciones usadas en el entrenamiento; cualquier cambio de encuadre o calibración puede degradar el comportamiento.
- Sesgos y sobreajuste al entorno: al proceder de 50 episodios de un único escenario, es probable que no generalice a posiciones nuevas de objetos, iluminación distinta o distractores. Esto no se ha medido.
- Riesgo de alucinación: no aplica en el sentido de los LLM, pero sí existe riesgo de acciones erráticas o inseguras ante entradas fuera de distribución.
- Licencia "gemma": conviene revisar los términos de la licencia Gemma antes de un uso comercial, ya que puede imponer condiciones de redistribución y uso.
- Idiomas y contexto: no disponibles y no relevantes, al no ser un modelo de lenguaje.
- Fechas del Hub en 2026: el repositorio declara fechas de creación y actualización de octubre de 2026, posteriores a la fecha habitual de consulta, dato que conviene verificar.
- Sin cuantizaciones publicadas: el repositorio solo ofrece safetensors, por lo que el despliegue en hardware limitado depende del soporte del runtime de LeRobot.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ParshG/pi05_sharpie_holder_v1
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Dataset de entrenamiento: https://huggingface.co/datasets/ParshG/so101_sharpie_holder_20261006_112937
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=ParshG/so101_sharpie_holder_20261006_112937
- Blog de π₀.₅ (Pi05) de Physical Intelligence: https://www.physicalintelligence.company/blog/pi05
- Repositorio OpenPI: https://github.com/Physical-Intelligence/openpi
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de pi05 en LeRobot: https://huggingface.co/docs/lerobot/main/en/pi05
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware de LeRobot: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Flujo de imitación en LeRobot: https://huggingface.co/docs/lerobot/en/il_robots
- Chuleta de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
- No se han encontrado en la búsqueda web enlaces adicionales relevantes para este modelo.
