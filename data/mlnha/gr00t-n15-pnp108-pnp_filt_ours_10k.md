# mlnha/gr00t-n15-pnp108-pnp_filt_ours_10k

## Resumen

`mlnha/gr00t-n15-pnp108-pnp_filt_ours_10k` es un checkpoint de investigación derivado de GR00T N1.5, el modelo fundacional de visión-lenguaje-acción (VLA) para robótica humanoide desarrollado por NVIDIA. El autor del repositorio, `mlnha`, ha publicado aquí los pesos resultantes de un ajuste fino supervisado sobre la tarea `PickPlaceCounterToCabinet` del simulador RoboCasa365, dentro de un estudio sobre estimadores de progreso de tarea como señal de entrenamiento.

El modelo no es un lanzamiento oficial ni un modelo generalista: es un artefacto de experimentación que parte del checkpoint de preentrenamiento `robocasa365_checkpoints` (paso 80000) y aplica clonación de comportamiento (behavior cloning, BC) sobre segmentos de trayectorias filtrados por un delta de progreso positivo. El conjunto de datos son 108 rollouts generados por el propio modelo (checkpoint 120000), de los cuales 72 son exitosos, en formato LeRobot v2.1.

Su relevancia es acotada pero concreta: sirve como referencia reproducible para investigar cómo el filtrado por estimadores de progreso afecta al rendimiento de políticas VLA en manipulación de objetos, y publica curvas de éxito en simulación por checkpoint. El repositorio ocupa 37,9 GB e incluye pesos en safetensors y logs de TensorBoard.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | VLA basada en GR00T N1.5 (no se detalla la arquitectura interna en la información disponible) |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (repo de 37,9 GB; incluye logs de TensorBoard) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de GR00T N1.5, un modelo fundacional de visión-lenguaje-acción orientado a control robótico, pero la model card no describe sus componentes internos (tipo de transformer, mecanismo de atención, tokenizador de acciones ni codificador visual). Lo que sí se documenta es el procedimiento de ajuste: clonación de comportamiento directa sobre segmentos de episodios en los que el delta de progreso estimado por el método del autor es positivo, evaluado en trozos de 16 fotogramas.

El entrenamiento partió del checkpoint de preentrenamiento de RoboCasa (`robocasa/robocasa365_checkpoints`, paso 80000) y se ejecutó en una única GPU con batch de 64, learning rate 3e-5 con scheduler coseno y warmup de 0,05, semilla 42 y el embodiment `new_embodiment`. Los datos provienen del conjunto `pnp108`: 108 rollouts del checkpoint 120000 sobre `PickPlaceCounterToCabinet`, 72 de ellos exitosos, en formato LeRobot v2.1. Se generaron checkpoints hasta el paso 10000; los estados del optimizador no se incluyen en el repositorio, por lo que no es posible reanudar el entrenamiento tal cual.

## Capacidades

- Control robótico de manipulación: ejecuta la tarea `PickPlaceCounterToCabinet` (recoger un objeto de la encimera y colocarlo en el armario) en el simulador RoboCasa365.
- Política visuomotora: consume observaciones visuales y produce acciones de robot, propio de un modelo VLA.
- Clonación de comportamiento: reproduce comportamientos aprendidos de trayectorias de demostración filtradas.
- Evaluación reproducible en simulación: los resultados se reportan sobre semillas de escena 2000+ y semilla de política 1, lo que permite replicar la evaluación.
- No se documentan capacidades de tool calling, agentes multi-paso, razonamiento textual, matemáticas, visión general, audio ni modo de pensamiento. Es un checkpoint específico de política robótica, no un modelo de propósito general.

## Casos de uso

- Investigación sobre filtrado de datos en BC: el checkpoint sirve para comparar el efecto de entrenar solo con segmentos de progreso positivo frente a entrenar con todos los segmentos, usando las curvas de éxito publicadas como línea base.
- Reproducción de experimentos de RoboCasa365: permite replicar la evaluación en `PickPlaceCounterToCabinet` con las semillas documentadas (2000–2049) y verificar los resultados reportados.
- Estudio de estimadores de progreso de tarea: al ser el artefacto de un método concreto de estimación de progreso, se puede usar como punto de partida para ablaciones sobre el umbral de delta o el tamaño de chunk (16 fotogramas).
- Desarrollo de pipelines de evaluación en simulación: los logs de TensorBoard y el formato LeRobot v2.1 facilitan integrar el checkpoint en flujos de entrenamiento y evaluación automatizados.
- Base para ajuste fino en tareas de pick-and-place: al partir de un preentrenamiento de RoboCasa, puede servir como inicialización para tareas de manipulación similares, aunque requeriría validación propia.
- Docencia y divulgación sobre VLA: un ejemplo concreto y reproducible de cómo se ajusta un modelo fundacional robótico con BC y cómo se mide su éxito en simulación.

## Benchmarks y rendimiento

Resultados de éxito en simulación RoboCasa365 sobre `PickPlaceCounterToCabinet`, semillas de escena 2000–2049, semilla de política 1, éxito medido al final del episodio:

| Checkpoint | Éxito en simulación |
|---|---|
| checkpoint-2000 | 30/50 (60 %) |
| checkpoint-4000 | 28/50 (56 %) |
| checkpoint-6000 | 26/50 (52 %) |
| checkpoint-8000 | 31/50 (62 %) |
| checkpoint-10000 | 28/50 (56 %) |

No se han publicado en la información disponible resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros), ni comparaciones con políticas alternativas sobre la misma tarea.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio pesa 37,9 GB, lo que da una cota inferior del espacio en disco necesario; la VRAM dependerá de la arquitectura de GR00T N1.5, que no se detalla.
- GPU recomendadas: no disponible. El entrenamiento se realizó en una única GPU con batch 64, pero no se especifica el modelo.
- ¿Cabe en GPU de consumo? no disponible.
- Opciones de despliegue: la librería declarada es `gr00t`; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que además no aplican a un modelo de política robótica.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `mlnha/gr00t-n15-pnp108-pnp_filt_ours_10k` | no disponible | no disponible | 52–62 % de éxito en `PickPlaceCounterToCabinet` (sim) | no disponible | Hugging Face, 0 descargas |
| GR00T N1.5 (preentrenamiento RoboCasa, paso 80000) | no disponible | no disponible | no disponible en esta información | no disponible | Referenciado como punto de partida (`robocasa/robocasa365_checkpoints`) |
| GR00T N1.5 checkpoint 120000 (generador de los rollouts) | no disponible | no disponible | no disponible en esta información | no disponible | Referenciado en la model card |

No se dispone de datos suficientes para comparar con otras políticas VLA de la literatura (por ejemplo, π0, OpenVLA u Octo) en la misma tarea y condiciones.

## Limitaciones y advertencias

- Modelo de investigación: es un checkpoint de un estudio sobre estimadores de progreso, no un modelo listo para producción.
- Dominio muy restringido: entrenado exclusivamente para `PickPlaceCounterToCabinet` en RoboCasa365; no se espera generalización a otras tareas sin ajuste adicional.
- Rendimiento moderado y no monótono: el éxito oscila entre el 52 % y el 62 % según el checkpoint, sin mejora clara con más pasos; el mejor resultado es el checkpoint-8000.
- Evaluación solo en simulación: no hay evidencia de transferencia a robot real (sim-to-real) en la información disponible.
- Sin estados del optimizador: no se puede reanudar el entrenamiento desde los checkpoints publicados.
- Licencia no especificada: no hay garantía de uso comercial; conviene contactar con el autor antes de cualquier uso fuera de investigación.
- Idiomas no aplicables o no disponibles: al ser un modelo de política robótica, la dimensión multilingüe no está documentada.
- Sesgos y alucinación: no se documentan sesgos conocidos; en un modelo de acción, el riesgo análogo es la ejecución de políticas erróneas o fuera de distribución, no la generación de texto falso.
- Repositorio con 0 descargas y 0 likes: sin validación por parte de la comunidad; los resultados deben tratarse como no replicados de forma independiente.

## Enlaces

- Hugging Face: https://huggingface.co/mlnha/gr00t-n15-pnp108-pnp_filt_ours_10k
- Repositorio de checkpoints de preentrenamiento RoboCasa referenciado: `robocasa/robocasa365_checkpoints` (no se proporciona URL directa en la información disponible)
- Paper, blog, repositorio de código o demo del método: no disponibles en la información proporcionada.
