# lenawngr/ACT_pick-place_L_v_cs70

## Resumen

ACT_pick-place_L_v_cs70 es una política de robótica basada en ACT (Action Chunking with Transformers), un método de aprendizaje por imitación que predice fragmentos cortos de acciones en lugar de pasos individuales. Lo publica el usuario lenawngr en Hugging Face y se ha entrenado con LeRobot, la librería de Hugging Face para aprendizaje por imitación en robótica. El modelo está especializado en una tarea concreta: pick-and-place, a partir del dataset lenawngr/pick-place, presumiblemente recogido mediante teleoperación.

A diferencia de un modelo de lenguaje, no genera texto ni procesa lenguaje natural: es un controlador que, dada una observación (típicamente imágenes de cámara y el estado de las articulaciones), produce una secuencia de comandos motores para ejecutar la tarea. Con 51.637.894 parámetros (unos 51,6 millones) y un tamaño de repositorio de 0,2 GB, es un modelo compacto que puede ejecutarse en hardware modesto.

Su relevancia reside en que ejemplifica el flujo de trabajo actual de la robótica open source: entrenar políticas de imitación reproducibles desde datasets públicos y desplegarlas con herramientas estándar. No obstante, se trata de un checkpoint muy específico, con 7 descargas y 0 likes en el momento de la consulta, por lo que debe considerarse un artefacto experimental más que un modelo de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con codificador visual y decodificador de acciones |
| Parametros totales | 51.637.894 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; opera sobre observaciones de sensores y predice chunks de acciones) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica / no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería lerobot) |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación presentado en el artículo "Learning Fine-Grained Bimanual Manipulation with Low-Cost Hardware" (arXiv:2304.13705). La arquitectura combina un codificador de observaciones, que procesa imágenes de cámara y el estado del robot, con un transformer que decodifica un chunk de acciones futuras de una sola vez. En lugar de predecir una única acción por paso y ejecutarla de inmediato, el modelo genera una secuencia corta de comandos y los ejecuta de forma agrupada, lo que reduce el error de acumulación y mejora la estabilidad en tareas de manipulación fina. El paper original emplea un mecanismo de regularización tipo CVAE sobre el chunk de acciones para capturar la variabilidad de las demostraciones humanas.

El entrenamiento se ha realizado con LeRobot sobre el dataset lenawngr/pick-place, que contiene episodios teleoperados de la tarea pick-and-place. El nombre del checkpoint incluye el sufijo "cs70", que sugiere una configuración con chunk size de 70, aunque este dato no está confirmado en la información disponible. No se especifican el número de episodios, la composición del dataset, ni si se aplicaron técnicas de aumento de datos o ajuste fino adicional. Tampoco hay información sobre el robot concreto empleado, salvo la referencia a los flujos de evaluación de LeRobot (por ejemplo, con el brazo so100_follower).

## Capacidades

- Control robótico por imitación para la tarea pick-and-place: dado un estado del robot y observaciones visuales, genera comandos motores para coger y colocar objetos.
- Predicción de chunks de acciones en lugar de pasos individuales, lo que mejora la estabilidad del control en manipulación.
- Aprendizaje a partir de datos teleoperados, sin necesidad de ingeniería de recompensas.
- Integración nativa con el ecosistema LeRobot para entrenamiento, evaluación e inferencia.
- Ejecución de políticas entrenadas mediante `lerobot-record` y `lerobot-train`.
- No dispone de generación de texto, razonamiento simbólico, código, matemáticas, visión general ni capacidades multilingües.
- No soporta tool calling ni razonamiento multi-paso en el sentido de los agentes basados en LLM.
- Sin capacidad de audio ni de diálogo.

## Casos de uso

- Automatización de pick-and-place en entornos controlados: el modelo ejecuta la secuencia completa de coger un objeto y depositarlo en una ubicación, entrenado específicamente para esa tarea.
- Prototipado rápido de políticas robóticas con LeRobot: sirve como punto de partida para reproducir el pipeline de entrenamiento y evaluar variantes del dataset.
- Investigación en aprendizaje por imitación: permite estudiar el comportamiento de ACT frente a otros métodos de control (por ejemplo, Diffusion Policy) sobre el mismo dataset.
- Benchmarking de hardware de bajo coste: al ser un modelo de 51,6 M de parámetros, se puede desplegar en brazos robóticos económicos con cámaras estándar.
- Reentrenamiento y ajuste fino: el checkpoint puede usarse como base para afinar con nuevos episodios del dataset pick-place o variantes de la tarea.
- Docencia y formación: ejemplo didáctico de cómo se publica, entrena y evalúa una política de robótica con LeRobot.
- Integración en pipelines de evaluación automatizada: la política puede registrarse en bucle cerrado con el robot para medir la tasa de éxito sobre 10 episodios, tal como propone la model card.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye tasa de éxito, número de episodios de evaluación ni comparaciones numéricas con otros modelos. El artículo de ACT (arXiv:2304.13705) sí reporta resultados en tareas bimanuales, pero no corresponden a este checkpoint concreto entrenado sobre lenawngr/pick-place.

## Requisitos de hardware

- VRAM estimada: al tratarse de un modelo de ~51,6 millones de parámetros, los pesos en precisión completa (fp32) ocupan aproximadamente 0,2 GB. Sumando los codificadores visuales y las activaciones de inferencia, es razonable estimar un uso de VRAM inferior a 2 GB, aunque no hay mediciones oficiales disponibles.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA de gama media o superior (por ejemplo, RTX 3060, RTX 4090, A100, H100). LeRobot utiliza CUDA por defecto en el entrenamiento (`--policy.device=cuda`).
- Cabe sin problemas en GPU de consumo: incluso tarjetas de gama de entrada con 4-6 GB de VRAM deberían poder ejecutar la inferencia.
- Opciones de despliegue: LeRobot como herramienta principal (`lerobot-train` para entrenamiento y `lerobot-record` para evaluación/inferencia). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que además no aplican a un modelo de robótica.
- Latencia y throughput estimados: no disponibles. Dependen del hardware, del robot y de la frecuencia de control requerida por la tarea.

## Comparativa con modelos similares

No se dispone de datos de rendimiento publicados para este checkpoint que permitan una comparación cuantitativa. Como alternativas cualitativas dentro del mismo ámbito de políticas de imitación se pueden citar:

| Modelo | Parametros | Tipo | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ACT_pick-place_L_v_cs70 | 51,6 M aprox. | ACT (transformer, chunk de acciones) | no disponible | apache-2.0 | Hugging Face (lenawngr) |
| ACT_pick-place_v1 | no disponible | ACT | no disponible | no disponible | Hugging Face (lenawngr) |
| Diffusion Policy (referencia del artículo ACT) | no disponible | Política por difusión | no disponible | según implementación | Repositorios de investigación |
| BC-ConvMLP / VINN / BeT (comparativas del paper) | no disponible | Varios | no disponible | según implementación | Repositorios de investigación |

Los resultados numéricos de estas comparativas están en el artículo original, pero no se han trasladado a esta ficha porque corresponden a otros entornos y datasets, no al checkpoint aquí descrito.

## Limitaciones y advertencias

- Especialización extrema: la política está entrenada únicamente para la tarea pick-and-place del dataset lenawngr/pick-place. No generaliza a otras tareas ni a otros objetos o entornos sin reentrenamiento.
- Sensibilidad al entorno: los modelos de imitación como ACT dependen fuertemente de las condiciones de iluminación, la posición de la cámara y la configuración física del robot usadas durante la recogida de datos. Cambios en estas condiciones degradan el rendimiento.
- Riesgo de fallo y acumulación de error: aunque el chunking reduce la acumulación de error, la política puede fallar en agarres o colocaciones fuera de la distribución de las demostraciones.
- Sesgos del dataset: al provenir de teleoperación humana, la política hereda los sesgos y la variabilidad del operador que recogió los datos; no se documenta la composición ni el tamaño del dataset.
- Sin datos de rendimiento: no se publican tasas de éxito, lo que impide estimar su fiabilidad real en producción.
- Idioma y texto: no aplica; el modelo no procesa lenguaje natural.
- Licencia: apache-2.0 permite uso comercial y modificación, pero debe verificarse el cumplimiento de las licencias de los datasets y del software de LeRobot empleados.
- Advertencia de seguridad física: cualquier despliegue sobre un robot real debe incorporar límites de par, paradas de emergencia y validación en entornos controlados antes de operar cerca de personas.
- Madurez: con 7 descargas y 0 likes, es un artefacto muy reciente y poco validado por la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/lenawngr/ACT_pick-place_L_v_cs70
- Dataset de entrenamiento: https://huggingface.co/datasets/lenawngr/pick-place
- Modelo relacionado (ACT_pick-place_v1): https://huggingface.co/lenawngr/ACT_pick-place_v1
- Artículo de ACT (arXiv:2304.13705): https://arxiv.org/abs/2304.13705
- Página del paper en Hugging Face: https://huggingface.co/papers/2304.13705
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de políticas: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
