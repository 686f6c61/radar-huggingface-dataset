# OrderDraconis/groot_pickplace_leo

## Resumen

El modelo `OrderDraconis/groot_pickplace_leo` es una política de robótica entrenada mediante aprendizaje por imitación para ejecutar la tarea de recoger una pieza de tela superior y colocarla en un cuadrado objetivo. Está desarrollado por OrderDraconis (Leo Guillier) sobre la base del modelo fundacional GR00T N1.7 de NVIDIA, que emplea un backbone Cosmos-Reason2/Qwen3-VL y un transformer de acciones con flow-matching. El modelo se distribuye a través de LeRobot, la biblioteca de Hugging Face para robótica, y está diseñado para ser ejecutado en el robot bimanual `bi_so_follower` con tres cámaras.

Con 3.144.016.000 parámetros (aproximadamente 3,14 mil millones), este modelo representa un ejemplo práctico de aplicación de modelos fundacionales de robótica a tareas de manipulación específicas. Su relevancia radica en que demuestra cómo un modelo preentrenado de propósito general puede adaptarse a una tarea concreta con un conjunto de datos relativamente pequeño (122 episodios), manteniendo la licencia Apache 2.0 que permite uso comercial. La política acepta entradas de estado (12 dimensiones), imágenes de tres cámaras (480x640) y genera acciones de 12 dimensiones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GR00T N1.7 (backbone Cosmos-Reason2/Qwen3-VL + flow-matching action transformer) |
| Parametros totales | 3.144.016.000 (3,14 B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (modelo de robótica, no procesa texto como entrada principal) |
| Tipos de cuantizacion | No disponible (solo se distribuye en safetensors, sin cuantizaciones publicadas) |
| Idiomas soportados | No disponible (el backbone Qwen3-VL es multilingüe, pero el modelo está entrenado para una tarea robótica específica) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura GR00T N1.7 de NVIDIA, un modelo fundacional de robótica de propósito general que combina un backbone de visión-lenguaje (Cosmos-Reason2/Qwen3-VL) con un transformer de acciones basado en flow-matching. Esta arquitectura permite predecir acciones condicionadas simultáneamente por visión (tres cámaras), lenguaje (instrucción de tarea) y propriocepción (estado del robot). El entrenamiento se realizó con LeRobot (versión 0.6.0) sobre el dataset `Pink-Viking/pick_and_place_combined`, que contiene 122 episodios y 96.339 fotogramas a 30 FPS, todos etiquetados con la tarea "pick up the upper piece of fabric and place it in the target square". Se utilizaron 10.000 pasos de entrenamiento con batch size 16, optimizador AdamW y tasa de aprendizaje 0,0001, con semilla 1000. No se emplearon técnicas de RLHF ni DPO; es un entrenamiento puramente de imitación supervisada.

## Capacidades

- Ejecución de tareas de manipulación robótica pick-and-place sobre un robot bimanual `bi_so_follower`.
- Procesamiento de tres flujos de imagen simultáneos (cámaras `left_left_jaw`, `right_right_jaw`, `right_topdown`) a resolución 480x640.
- Condicionamiento por estado del robot (12 dimensiones) y por instrucción de lenguaje natural.
- Generación de acciones continuas de 12 dimensiones (posiciones, velocidades o esfuerzos según la configuración del robot).
- Integración nativa con el ecosistema LeRobot: permite entrenamiento, evaluación y despliegue mediante CLI (`lerobot-rollout`, `lerobot-train`).
- No soporta tool calling, agentes conversacionales ni razonamiento multi-paso fuera del ámbito de la tarea robótica.
- No es un modelo de lenguaje general; su salida son acciones motoras, no texto.

## Casos de uso

- Automatización de líneas de montaje: el modelo puede controlar un robot bimanual para recoger piezas de tela y colocarlas en posiciones precisas, reduciendo la intervención humana en tareas repetitivas.
- Investigación en aprendizaje por imitación: sirve como punto de partida para estudiar la transferencia de modelos fundacionales de robótica a tareas específicas con datasets pequeños.
- Desarrollo de políticas de control para robots bimanuales: su arquitectura basada en GR00T N1.7 permite adaptar el modelo a otros robots similares con reentrenamiento.
- Prototipado rápido en entornos de laboratorio: gracias a LeRobot, se puede desplegar la política en minutos con el comando `lerobot-rollout`, ideal para validar hipótesis de control.
- Benchmarking de modelos de robótica: al estar publicado en Hugging Face con licencia Apache 2.0, puede usarse como referencia para comparar el rendimiento de otras políticas en la misma tarea.
- Educación en robótica: el modelo y su dataset asociado ofrecen un ejemplo completo y reproducible de entrenamiento de una política de manipulación, útil para cursos y tutoriales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación para esta política. No se dispone de datos de éxito en tareas reales ni comparaciones con otros modelos.

## Requisitos de hardware

- No se especifican requisitos oficiales en la documentación del modelo.
- Dado el tamaño del modelo (3,14 B parámetros) y la entrada de tres cámaras a 480x640, se estima que la inferencia requiere una GPU con al menos 12 GB de VRAM para un funcionamiento fluido (estimación razonable, no dato oficial).
- GPUs recomendadas: NVIDIA RTX 3090/4090, A100 o superiores; en el caso de GPUs con menos VRAM, podría ser necesario reducir la resolución de las cámaras o usar técnicas de optimización.
- El modelo se distribuye en formato safetensors y se ejecuta mediante LeRobot; no se menciona compatibilidad con vLLM, llama.cpp, Ollama o TGI, ya que no es un modelo de lenguaje.
- Para el entrenamiento, se recomienda al menos una GPU con 24 GB de VRAM (dado el batch size 16 y las imágenes), aunque no hay datos confirmados.
- La latencia y el throughput dependen del hardware y no se han publicado valores concretos.

## Comparativa con modelos similares

No se dispone de información comparativa publicada para este modelo. Existen otras políticas de robótica en LeRobot (por ejemplo, `OrderDraconis/smolvla_pickplace_leo` del mismo autor, o modelos como ACT y Diffusion Policy), pero no hay datos de rendimiento, parámetros o contexto que permitan una comparación objetiva. Se recomienda consultar los repositorios individuales para obtener detalles específicos.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente para la tarea de recoger una pieza de tela superior y colocarla en un cuadrado objetivo; no generaliza a otras tareas sin reentrenamiento.
- Depende del robot específico `bi_so_follower` y de la configuración exacta de cámaras; cualquier cambio en el hardware o la disposición de las cámaras puede degradar el rendimiento.
- No se han reportado evaluaciones en robot real; el rendimiento real es desconocido y podría no alcanzar la robustez necesaria para producción.
- El dataset de entrenamiento es reducido (122 episodios), lo que aumenta el riesgo de sobreajuste y de bajo rendimiento ante variaciones en iluminación, posición de objetos o distracciones.
- Al ser un modelo de robótica, no está diseñado para tareas de lenguaje natural; no debe usarse como chatbot o generador de texto.
- La licencia Apache 2.0 permite uso comercial, pero el usuario es responsable de cumplir con las condiciones de la licencia y de cualquier otra restricción aplicable a los componentes subyacentes (por ejemplo, el backbone Qwen3-VL, que puede tener sus propias condiciones).
- El tamaño del repositorio (62,9 GB) implica requisitos de almacenamiento considerables para su descarga y uso.

## Enlaces

- [Repositorio del modelo en Hugging Face](https://huggingface.co/OrderDraconis/groot_pickplace_leo)
- [Perfil del autor en Hugging Face](https://huggingface.co/OrderDraconis)
- [Dataset de entrenamiento](https://huggingface.co/datasets/Pink-Viking/pick_and_place_combined)
- [Repositorio Isaac-GR00T de NVIDIA](https://github.com/NVIDIA/Isaac-GR00T)
- [Documentación de LeRobot](https://huggingface.co/docs/lerobot/index)
- [Guía de GR00T en LeRobot](https://huggingface.co/docs/lerobot/main/en/groot)
