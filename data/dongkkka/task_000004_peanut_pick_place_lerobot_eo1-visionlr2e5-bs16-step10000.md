# Dongkkka/Task_000004_Peanut_Pick_Place_lerobot_EO1-VisionLR2e5-bs16-step10000

## Resumen

Este repositorio contiene un checkpoint de política robótica entrenado con LeRobot para la tarea "Peanut Pick and Place" (recogida y colocación de cacahuetes), identificada internamente como Task_000004. El nombre del modelo indica que se trata de un ajuste fino del modelo EO1 en su variante Vision (EO1-Vision), con una tasa de aprendizaje de 2e-5, tamano de lote 16 y guardado en el paso 10.000 del entrenamiento. El autor es el usuario de HuggingFace Dongkkka, que mantiene además el dataset de entrenamiento asociado y otros checkpoints de la misma tarea con arquitecturas distintas (por ejemplo, Pi0.5).

El problema que resuelve es acotado: dotar a un brazo robótico de la capacidad de ejecutar una manipulación de precisión sobre objetos pequenos y posiblemente deformables, a partir de observaciones visuales y del estado del robot. No es un modelo de lenguaje general, sino un modelo de visión-lenguaje-acción (VLA) orientado a control motor, por lo que su utilidad está en el ámbito de la robótica de manipulación y no en tareas de texto.

El checkpoint pesa 3.771.607.072 parámetros (aproximadamente 3,77 mil millones) según los metadatos de safetensors, y el repositorio ocupa 7,6 GB, coherente con pesos en precisión de 16 bits. Es un lanzamiento con muy poca tracción dentro de la comunidad (12 descargas y ninguna interacción), sin licencia declarada ni idiomas especificados, y sin resultados de benchmarks publicados en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de visión-lenguaje-acción (VLA) para robótica, derivado de EO1 en variante Vision; detalles internos (tipo de transformer, encoder visual, cabeza de acciones) no disponibles |
| Parametros totales | 3.771.607.072 (aproximadamente 3,77 mil millones) |
| Parametros activos | No aplica (no hay indicios de arquitectura MoE en la información disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible; el repositorio solo contiene safetensors (no se publican versiones GGUF, AWQ, GPTQ ni cuantizaciones declaradas) |
| Idiomas soportados | No disponible (modelo orientado a control robótico, no a generación de lenguaje) |
| Licencia | No disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La información disponible permite afirmar que se trata de un modelo de la familia EO1 en su variante Vision, ajustado con el framework LeRobot para una tarea concreta de manipulación. El nombre del checkpoint documenta parte del protocolo de entrenamiento: tasa de aprendizaje para la torre de visión de 2e-5, tamano de lote 16 y 10.000 pasos de optimización. No se detalla el numero total de tokens o muestras consumidas, la composición del dataset, ni si se aplicaron fases de RLHF, DPO u optimización por preferencias, algo poco habitual en políticas robóticas, donde lo común es el aprendizaje por imitación (behavior cloning) sobre demostraciones teleoperadas.

Del ecosistema de repositorios del mismo autor se deduce que el dataset de entrenamiento sigue el formato LeRobot y proviene de la tarea "Task_000004 Peanut Pick and Place", con episodios grabados y almacenados también en formato MCAP a través de herramientas de Cyclo Intelligence (ROBOTIS). El checkpoint hermano basado en Pi0.5 menciona explícitamente el uso de los 35 episodios de esa tarea, aunque ese dato corresponde a otro modelo y no puede trasladarse sin verificación a este. No se dispone de información sobre innovaciones técnicas adicionales como decodificación especulativa, atención lineal o mecanismos híbridos.

## Capacidades

- Control robótico de manipulación: genera acciones motoras a partir de observaciones visuales y del estado del robot para ejecutar la tarea de recogida y colocación de cacahuetes.
- Percepción visual integrada: al tratarse de la variante Vision de EO1, incorpora entrada de imagen como parte de la política.
- Ejecución de una política entrenada de extremo a extremo: no requiere definir a mano la secuencia de movimientos, sino que la infiere de los datos de demostración.
- Generalización limitada a la tarea entrenada: la nomenclatura del repositorio indica un ajuste específico para Task_000004, no un modelo de propósito general.
- Soporte de tool calling / function calling: no disponible; no es una capacidad propia de una política VLA.
- Soporte de agentes y razonamiento multi-paso: no disponible en el sentido de agentes de software; el razonamiento multi-paso se limita a la secuencia de acciones físicas de la tarea.
- Capacidades multilingües: no disponibles; no hay indicios de procesamiento de lenguaje natural.
- Capacidades especiales (modo thinking, visión, audio): visión sí, como entrada sensorial; modo thinking y audio no disponibles.

## Casos de uso

- Automatización de líneas de envasado de frutos secos: la política puede ejecutar la recogida y colocación de cacahuetes en una celda robotizada, sustituyendo a la programación explícita de trayectorias por una política aprendida de demostraciones.
- Investigación en manipulación de objetos pequeños: sirve como punto de partida para estudiar el rendimiento de EO1-Vision en tareas de precisión, comparándolo con otros checkpoints de la misma tarea como el basado en Pi0.5.
- Reproducción de experimentos con LeRobot: al estar en formato LeRobot, permite cargar la política con las herramientas del ecosistema y evaluarla sobre el dataset original para medir tasas de éxito.
- Benchmarking de políticas VLA: puede utilizarse como baseline en estudios comparativos de arquitecturas VLA sobre una misma tarea y un mismo conjunto de datos.
- Selección de modelos para integración industrial: un equipo que evalúe EO1 frente a Pi0.5 u otras políticas puede usar este checkpoint como muestra del comportamiento del ajuste con aprendizaje de 2e-5 en la torre de visión.
- Reentrenamiento o ajuste posterior: el checkpoint puede servir de inicialización para fine-tuning en tareas de pick and place similares con otros objetos, aprovechando que ya está adaptado al dominio.
- Docencia y formación en robótica: útil para demostrar un flujo completo de datos, entrenamiento y despliegue de una política VLA con LeRobot sin partir de cero.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No constan tasas de éxito, métricas de error de posición, tiempos de ciclo ni comparaciones cuantitativas con otras políticas para este checkpoint.

## Requisitos de hardware

- VRAM estimada para inferencia: los 3.771.607.072 parámetros en precisión de 16 bits ocupan aproximadamente 7,5 GB de pesos, coherente con el tamano de repositorio de 7,6 GB. Sumando el encoder visual y las activaciones, es razonable reservar entre 12 y 16 GB de VRAM, aunque no hay mediciones publicadas que lo confirmen.
- GPU recomendadas: no hay recomendaciones oficiales. Por tamano, cabría esperar funcionamiento en GPUs de 24 GB o más, como RTX 4090, L40S, A100 o H100.
- Compatibilidad con GPU de consumo: probable en tarjetas de 16-24 GB de VRAM (RTX 4080, 4090), siempre que la política se ejecute en precisión de 16 bits y el resto del pipeline de inferencia no consuma memoria adicional significativa.
- Opciones de despliegue: el ecosistema natural es LeRobot sobre PyTorch. No aplican servidores de inferencia de lenguaje como vLLM, TGI, Ollama o llama.cpp, ya que no es un modelo de texto ni se publican pesos en formato GGUF.
- Latencia y throughput: no disponibles. En robótica, la frecuencia de control es un requisito crítico, pero no se publican mediciones para este checkpoint.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| EO1-Vision bs16 step10000 (este checkpoint) | 3,77 mil millones | No disponible | No disponible | No disponible | HuggingFace, 12 descargas |
| Dongkkka Pi0.5 bs32 step20000 (misma tarea) | No disponible | No disponible | No disponible | No disponible | HuggingFace, mismo autor y dataset |
| Otras políticas VLA de código abierto (OpenVLA, Octo, pi0) | No disponible en la información proporcionada | No disponible | No disponible | No disponible | No verificada en esta búsqueda |

No se dispone de datos suficientes para una comparación cuantitativa fiable. La única comparación sustentada por la información recuperada es la existencia de un checkpoint alternativo de la misma tarea entrenado sobre Pi0.5 con lote 32 y 20.000 pasos, que emplea los 35 episodios del dataset común.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles, pero al entrenarse sobre demostraciones de una única tarea y presumiblemente un único entorno físico, la política heredará los sesgos de posición, iluminación, cámara y configuración del robot usados en la recogida de datos.
- Riesgo de alucinación: en el sentido generativo no aplica; el riesgo equivalente es la ejecución de acciones erróneas o inseguras ante observaciones fuera de la distribución de entrenamiento.
- Limitaciones de contexto e idioma: no se especifica ventana de contexto ni soporte de idiomas; el modelo no está pensado para texto.
- Restricciones de licencia: la licencia no está declarada en el repositorio, lo que impide confirmar si se permite el uso comercial. Cualquier uso en producción debería aclararse previamente con el autor.
- Caveats para producción: con 12 descargas y sin documentación de evaluación, se trata de un artefacto experimental sin validación comunitaria; no hay métricas de tasa de éxito, robustez ni seguridad. Además, el nombre del repositorio sugiere un experimento de barrido de hiperparámetros más que una versión estable.
- Fecha de creación registrada: los metadatos indican octubre de 2026, dato que conviene verificar antes de citarlo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Dongkkka/Task_000004_Peanut_Pick_Place_lerobot_EO1-VisionLR2e5-bs16-step10000
- Dataset de la tarea: https://huggingface.co/datasets/Dongkkka/Task_000004_Peanut_Pick_Place_lerobot_Intern
- Checkpoint alternativo basado en Pi0.5: https://huggingface.co/Dongkkka/Task_000004_Peanut_Pick_Place_lerobot_Intern_Pi0.5_bs32_step20000
- Ficha del dataset en Claru: https://claru.ai/datasets/dongkkka-task-000004-peanut-pick-place-lerobot-intern
- Dataset relacionado en Claru (stage 1, MCAP): https://claru.ai/datasets/dongkkka-task-800004-pick-place-peanut-stage1-mcap-merged-lerobot-v30
- Repositorio LeRobot en GitHub: https://github.com/kabilankb/isaac_sim_lerobot
