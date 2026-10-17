# fecasado/gact-cubes-22c3

## Resumen

El modelo `fecasado/gact-cubes-22c3` es una política robótica entrenada y publicada en Hugging Face mediante la librería LeRobot de Hugging Face. El autor es el usuario `fecasado` y el modelo se distribuye con licencia Apache 2.0 bajo el pipeline de `robotics`. Su nombre interno en la model card es `gaze_act`, lo que apunta a una variante de la política ACT (Action Chunking Transformer) orientada a tareas de manipulación con señal de mirada (gaze), aunque la propia model card no detalla esa arquitectura y se limita a indicar que fue entrenada con LeRobot usando el tipo de política `act`.

El modelo resuelve el problema clásico de aprendizaje por imitación en robótica: a partir de un conjunto de demostraciones teleoperadas, aprender una política que genere comandos de actuador (action chunks) a partir de observaciones visuales y del estado del robot. Está asociado al dataset `fecasado/Ncubes-to-Nbaskets-320x240`, cuyo nombre sugiere una tarea de recogida de cubos y colocación en cestas con imágenes de resolución 320x240. El checkpoint ocupa 0,2 GB en el repositorio y contiene 51.670.922 parámetros, lo que lo sitúa en la gama de políticas compactas ejecutables en GPU de consumo.

Es relevante ahora porque forma parte del ecosistema LeRobot, que estandariza el entrenamiento, la evaluación y el despliegue de políticas robóticas con un formato común (safetensors más ficheros de configuración) y herramientas de línea de comandos (`lerobot-train`, `lerobot-record`). Esto permite reproducir el entrenamiento y ejecutar inferencia sobre robots como el `so100_follower` sin infraestructura propietaria. No obstante, el repositorio no incluye resultados de benchmarks ni documentación ampliada más allá de la plantilla por defecto de LeRobot.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible con detalle; entrenado con LeRobot usando el tipo de política `act` (Action Chunking Transformer). El nombre `gaze_act` sugiere una variante con entrada de mirada (gaze), no confirmada en la model card |
| Parametros totales | 51.670.922 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (no es un modelo de lenguaje; opera sobre ventanas de observación de la política) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (modelo de robótica, no lingüístico) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (tags del repositorio) |
| Libreria | lerobot |
| Pipeline | robotics |
| Tamano del repositorio | 0,2 GB |
| Dataset de entrenamiento | fecasado/Ncubes-to-Nbaskets-320x240 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La información disponible indica que el modelo se ha entrenado con LeRobot, la librería de Hugging Face para aprendizaje por imitación en robótica, usando el tipo de política `act` (Action Chunking Transformer). ACT es una arquitectura de política que predice secuencias de acciones (chunks) a partir de observaciones visuales y del estado propioceptivo del robot, típicamente combinando un codificador visual y un transformer que decodifica la acción. El sufijo `gaze` en el nombre `gaze_act` sugiere una variante que incorpora información de mirada, pero la model card no describe dicha modificación ni la arquitectura interna, por lo que este punto queda como no confirmado.

Respecto a los datos de entrenamiento, la model card únicamente referencia el dataset `fecasado/Ncubes-to-Nbaskets-320x240`, sin detallar el número de episodios, tokens, composición de las demostraciones ni si se aplicaron técnicas de refinamiento como RLHF o DPO (no aplicables habitualmente en este tipo de políticas). La plantilla de la model card no se ha completado: incluye el texto literal «Model type not recognized — please update this template», lo que indica que no hay información adicional sobre innovaciones técnicas, decodificación especulativa u optimizaciones de atención. Tampoco se especifica la plataforma robótica objetivo, aunque el ejemplo de la propia card emplea `so100_follower`.

## Capacidades

- Generación de acciones robóticas para manipulación: la política produce comandos de actuador a partir de observaciones, siguiendo el paradigma de aprendizaje por imitación de LeRobot.
- Control basado en visión: el dataset asociado trabaja con imágenes de 320x240, por lo que la política está pensada para entradas visuales de esa resolución.
- Ejecución sobre robot `so100_follower` según el ejemplo de inferencia de la model card.
- Integración con el ecosistema LeRobot para entrenamiento (`lerobot-train`) y evaluación (`lerobot-record`).
- Soporte de tool calling: no aplica / no disponible.
- Soporte de agentes y razonamiento multi-paso: no aplica / no disponible.
- Capacidades multilingües: no disponible (modelo no lingüístico).
- Capacidades especiales (thinking mode, visión, audio): no disponibles; la posible entrada de mirada (gaze) no está documentada.

## Casos de uso

- Automatización de pick-and-place en laboratorio: el modelo puede ejecutar la tarea de recoger cubos y depositarlos en cestas para la que fue entrenado con el dataset `Ncubes-to-Nbaskets-320x240`, integrándose en un banco de pruebas con robot `so100_follower`.
- Investigación en aprendizaje por imitación: sirve como punto de partida reproducible para comparar variantes de ACT (incluida la hipotética variante con gaze) dentro de LeRobot.
- Evaluación de políticas con `lerobot-record`: permite grabar episodios de evaluación prefijando el dataset con `eval_` y apuntando `--policy.path` al checkpoint, útil para medir tasa de éxito en distintas condiciones de iluminación o disposición de objetos.
- Prototipado rápido en robótica de bajo coste: con 51,7 millones de parámetros y 0,2 GB de repositorio, es viable desplegarlo en estaciones de trabajo con GPU modesta para experimentación.
- Generación de datos sintéticos o aumento de dataset: la política puede ejecutar trayectorias que se registren como nuevas demostraciones para reentrenamiento iterativo.
- Docencia y formación: al estar publicado con licencia Apache 2.0 y vinculado a LeRobot, es adecuado como ejemplo práctico en cursos de robótica y aprendizaje automático.
- Base para fine-tuning en tareas de manipulación similares: al ser un checkpoint compacto con licencia permisiva, se puede reentrenar sobre nuevos datasets de cubos, bloques u objetos similares.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,2 GB solo para los pesos en precisión de 32 bits (51.670.922 parámetros), a lo que hay que sumar activaciones y el codificador visual; el consumo real no está documentado en la información disponible.
- GPU recomendadas: no disponible. Por tamaño, cualquier GPU con soporte CUDA y al menos unos pocos GB de VRAM debería ser suficiente, pero no hay cifras oficiales.
- GPU de consumo: muy probablemente cabe en GPU de consumo (por ejemplo, gama RTX), aunque no hay confirmación del autor ni requisitos publicados.
- Opciones de despliegue: LeRobot (`lerobot-train` para entrenamiento y `lerobot-record` para inferencia/evaluación). No se documenta soporte para vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de política.
- Latencia y throughput estimados: no disponible. No se publican métricas de frecuencia de control, tiempo de inferencia por chunk ni throughput de episodios.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| fecasado/gact-cubes-22c3 | 51.670.922 | No disponible | No disponible | apache-2.0 | Hugging Face (repo `fecasado/gact-cubes-22c3`) |
| Política ACT estándar en LeRobot | No disponible | No disponible | No disponible | No disponible | Hugging Face / LeRobot |
| Diffusion Policy en LeRobot | No disponible | No disponible | No disponible | No disponible | Hugging Face / LeRobot |

No se dispone de datos numéricos de rendimiento para establecer una comparación cuantitativa con alternativas. La comparación cualitativa se limita a la categoría de políticas de aprendizaje por imitación disponibles en LeRobot, para las que no se han publicado cifras comparables en la información proporcionada.

## Limitaciones y advertencias

- La model card está sin completar: incluye el texto de plantilla «Model type not recognized — please update this template», por lo que no hay descripción oficial de arquitectura ni de entrenamiento.
- No se han publicado benchmarks, tasas de éxito ni métricas de evaluación, lo que impide valorar su rendimiento real.
- Sesgos conocidos: no disponibles. En políticas de imitación es habitual que el comportamiento herede los sesgos de las demostraciones (posiciones, iluminación, velocidad de teleoperación), pero no hay información específica para este checkpoint.
- Riesgo de alucinación: no aplica en el sentido lingüístico; en robótica el riesgo equivalente es la generalización deficiente fuera de la distribución del dataset de entrenamiento, sin datos publicados al respecto.
- Limitaciones de contexto o idioma: no aplica como modelo de lenguaje; no se documentan límites de ventana de observación ni de resolución más allá de las imágenes 320x240 del dataset asociado.
- Restricciones de licencia: licencia Apache 2.0, que permite uso comercial y modificación siempre que se conserven los avisos de copyright y licencia correspondientes; conviene revisar también los términos del dataset `fecasado/Ncubes-to-Nbaskets-320x240`.
- Caveat para producción: el repositorio registra 0 descargas y 0 likes, y no hay validación externa conocida, por lo que su uso en entornos productivos requeriría una evaluación propia previa.
- No se documenta la plataforma robótica exacta de entrenamiento; el ejemplo de la card usa `so100_follower`, pero podría no coincidir con el hardware real de recogida de datos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/fecasado/gact-cubes-22c3
- Dataset asociado: https://huggingface.co/datasets/fecasado/Ncubes-to-Nbaskets-320x240
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de políticas de imitación: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
