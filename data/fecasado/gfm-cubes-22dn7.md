# fecasado/gfm-cubes-22dN7

## Resumen

`fecasado/gfm-cubes-22dN7` es una política robótica de imitación (imitation learning) publicada en HuggingFace por el usuario fecasado, entrenada con el framework LeRobot de HuggingFace. El modelo se distribuye bajo el identificador `gaze_flow_matching` y está diseñado para controlar un brazo robótico en la tarea concreta de manipulación "Ncubes-to-Nbaskets" (mover cubos a cestas), a partir del dataset `fecasado/Ncubes-to-Nbaskets-320x240` con observaciones visuales a resolución 320x240.

Técnicamente no es un modelo de lenguaje, sino una política visuomotora: recibe observaciones (imágenes de cámara y estado del robot) y emite acciones de control. El nombre del identificador sugiere el uso de *flow matching* como mecanismo generativo para el decodificador de acciones, junto con algún tipo de condicionamiento por mirada (gaze). El checkpoint contiene 75.240.650 parámetros en formato safetensors y ocupa aproximadamente 0,3 GB en el repositorio, lo que lo sitúa en la gama de políticas ligeras que pueden ejecutarse en GPU de consumo con latencias compatibles con control en tiempo real.

Su relevancia es acotada pero clara para el ecosistema LeRobot: es un ejemplo de política entrenada de extremo a extremo para una tarea de manipulación concreta, con licencia Apache 2.0 (permisiva para uso comercial) y un flujo de trabajo reproducible mediante `lerobot-train` y `lerobot-record`. No se han publicado resultados de benchmarks, idiomas soportados ni métricas de éxito en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política robótica de imitación (visuomotora) con flow matching; detalles internos no disponibles |
| Parametros totales | 75.240.650 (aproximadamente 75,2 M) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (no es un modelo de lenguaje; opera sobre horizonte de observación de la política) |
| Tipos de cuantizacion | No disponible; los pesos se publican en safetensors sin variantes cuantizadas declaradas |
| Idiomas soportados | No disponible (no aplica: la salida son acciones de control, no texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería `lerobot`) |
| Tamano del repositorio | 0,3 GB |
| Pipeline declarado | robotics |
| Dataset de entrenamiento | fecasado/Ncubes-to-Nbaskets-320x240 |
| Descargas / likes | 17 descargas, 0 likes |
| Fecha de creacion | 10 de octubre de 2026 (según metadatos de HuggingFace) |

## Arquitectura y entrenamiento

La información publicada no detalla la arquitectura interna más allá del identificador `gaze_flow_matching` y la etiqueta `gaze_flow_matching` en los tags. Por el contexto de LeRobot, se trata de una política de imitación que mapea observaciones multimodales (típicamente imágenes de una o varias cámaras más el estado de las articulaciones del robot) a una secuencia de acciones de control. El término *flow matching* hace referencia a un paradigma generativo basado en campos de velocidad continuos, empleado en políticas robóticas modernas para modelar distribuciones multimodales de acciones en lugar de predecir una única acción media. El componente *gaze* sugiere condicionamiento adicional relacionado con la mirada o la atención visual, aunque el autor no documenta su implementación concreta.

El entrenamiento se realizó con LeRobot sobre el dataset `Ncubes-to-Nbaskets-320x240`, correspondiente a demostraciones de teleoperación de la tarea de mover cubos a cestas, con imágenes a 320x240 píxeles. No se especifican el número de episodios, la composición del dataset, el número de pasos de entrenamiento, ni si se aplicaron fases de ajuste por refuerzo (RLHF/DPO u otras). Tampoco se documentan innovaciones técnicas adicionales como decodificación especulativa, atención lineal o mecanismos híbridos. La model card es la plantilla genérica autogenerada por LeRobot y contiene un aviso explícito de que el tipo de modelo no fue reconocido automáticamente.

## Capacidades

- Generación de acciones de control robótico para manipulación de objetos en un entorno de laboratorio concreto (cubos hacia cestas).
- Procesamiento de observaciones visuales a resolución 320x240 como entrada de la política.
- Ejecución de políticas de imitación entrenadas de extremo a extremo sobre datos de teleoperación.
- Integración con el ecosistema LeRobot para entrenamiento, evaluación y registro de episodios.
- Compatibilidad declarada con el flujo de inferencia de LeRobot (`lerobot-record`) y con robots tipo `so100_follower`, según el ejemplo genérico de la model card.
- No se documentan capacidades de tool calling, function calling, razonamiento multi-paso, generación de texto, código, matemáticas, visión general, audio, ni modo *thinking*.
- No se documentan capacidades multilingües (no aplica a una política de control).
- No se documenta capacidad de generalización a tareas o entornos distintos del dataset de entrenamiento.

## Casos de uso

- Manipulación robótica en laboratorio: la política puede emplearse para reproducir la tarea de recoger cubos y depositarlos en cestas tras el entrenamiento con demostraciones, siempre que el entorno físico, la iluminación y la disposición de los objetos sean similares a los del dataset.
- Investigación en flow matching aplicado a robótica: sirve como checkpoint de referencia para comparar el comportamiento de una política generativa basada en flow matching frente a políticas de regresión de acciones como ACT o diffusion policy dentro de LeRobot.
- Reproducción de experimentos de imitación: al estar entrenada con LeRobot y Apache 2.0, permite replicar el pipeline completo (`lerobot-train` más `lerobot-record`) y estudiar el efecto de hiperparámetros o del tamaño del dataset.
- Evaluación de generalización visual: permite medir hasta qué punto una política entrenada a 320x240 mantiene el éxito al variar fondo, posición de cámara o color de los objetos, dado que no hay datos publicados sobre esta robustez.
- Base para *fine-tuning* en tareas de picking y placing: el checkpoint puede servir como punto de partida para ajustar con un dataset propio de otra tarea de manipulación con geometría similar.
- Docencia y prototipado con hardware de bajo coste: con 75,2 M de parámetros y 0,3 GB de pesos, puede desplegarse en un equipo con GPU de consumo para prácticas de robótica de imitación sin infraestructura de clúster.
- Validación de pipelines de despliegue: útil para probar integraciones con ROS u otros marcos de control intermedios antes de escalar a políticas mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tasas de exito de la tarea, numero de episodios de evaluacion, curvas de entrenamiento, ni comparaciones con otras politicas. El repositorio no adjunta informes de evaluacion en el material proporcionado.

## Requisitos de hardware

- VRAM estimada para inferencia: con 75,2 M de parámetros, los pesos en fp32 ocupan aproximadamente 0,30 GB y en fp16 aproximadamente 0,15 GB. Añadiendo activaciones y buffers de imagen a 320x240, el consumo total esperado se mantiene por debajo de 2 GB en la mayoría de configuraciones, aunque no hay mediciones publicadas.
- GPU recomendadas: cualquier GPU con soporte CUDA y al menos 4 GB de VRAM debería ser suficiente, incluidas RTX 3050, RTX 3060, RTX 4060, RTX 4090, A100 o H100. No hay requisitos oficiales publicados por el autor.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU de consumo moderna con 4 GB o más de VRAM. También debería poder ejecutarse en CPU para inferencia, con latencias mayores no especificadas.
- Opciones de despliegue: LeRobot (`lerobot-record` con `--policy.path` apuntando al checkpoint), y en general los backends soportados por la librería. No se documenta soporte explícito en vLLM, llama.cpp, Ollama o TGI, que están orientados a modelos de lenguaje y no a políticas de control.
- Latencia y throughput estimados: no disponibles. Para control robótico en tiempo real la frecuencia de inferencia es crítica, pero el autor no publica mediciones de latencia por paso ni frecuencia de control alcanzada.

## Comparativa con modelos similares

No se dispone de datos de rendimiento del modelo en la informacion proporcionada, por lo que la comparación se limita a características estructurales. Se incluyen como referencia políticas habituales del ecosistema LeRobot.

| Modelo | Parametros | Tipo | Contexto / observacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| fecasado/gfm-cubes-22dN7 | 75,2 M | Flow matching con condicionamiento por mirada (segun tags) | Imagenes 320x240 + estado del robot | Apache 2.0 | HuggingFace, 17 descargas |
| ACT (Action Chunking Transformer) | Del orden de decenas de millones (dato no especificado) | Transformer con chunking de acciones | Depende del dataset | Apache 2.0 (implementacion LeRobot) | Disponible en LeRobot |
| Diffusion Policy | No disponible | Generativa por difusion | Depende del dataset | Apache 2.0 (implementacion LeRobot) | Disponible en LeRobot |
| SmolVLA | No disponible en la informacion proporcionada | Vision-lenguaje-accion | No disponible | No disponible | HuggingFace / LeRobot |

No se han publicado comparativas directas entre este checkpoint y las alternativas citadas, por lo que no es posible afirmar cual ofrece mejor tasa de exito o mejor generalizacion.

## Limitaciones y advertencias

- Especializacion extrema: la política está entrenada para una única tarea ("Ncubes-to-Nbaskets") y un único dataset. No hay evidencia de que funcione en otras tareas, objetos, entornos o configuraciones de cámara.
- Ausencia total de métricas: no se publican tasas de éxito, curvas de entrenamiento ni evaluaciones, lo que impide estimar su fiabilidad real en producción.
- Model card incompleta: el propio autor no ha rellenado la plantilla de LeRobot y el campo indica "Model type not recognized". No hay documentación sobre la arquitectura exacta, el condicionamiento por mirada ni el proceso de entrenamiento.
- Posible inconsistencia en el ejemplo de uso: la model card muestra `--policy.type=act` en el comando de entrenamiento, mientras que el identificador del modelo es `gaze_flow_matching`. Esto sugiere que el ejemplo es la plantilla genérica y no refleja necesariamente la configuración real de la política, por lo que conviene verificar los parámetros antes de reentrenar.
- Riesgo de sobreajuste al entorno de entrenamiento: con un solo dataset y sin datos de variabilidad declarados, es probable que el modelo sea sensible a cambios de iluminación, fondo, posición de cámara o apariencia de los objetos.
- Sin capacidades de lenguaje ni conversacionales: no puede emplearse para generación de texto, atención al cliente, código, matemáticas ni tareas de razonamiento simbólico.
- Sesgos: no documentados. En robótica de imitación es habitual que el modelo reproduzca los sesgos del operador humano que generó las demostraciones (trayectorias, velocidades, puntos de agarre preferidos) y las condiciones del laboratorio donde se grabaron.
- Alucinación en sentido estricto no aplica, pero sí existe el riesgo de acciones erráticas o fuera de distribución cuando la observación se aleja de las vistas en entrenamiento, sin que el modelo señale incertidumbre.
- Licencia Apache 2.0: permite uso comercial y modificación con atribución y conservación del aviso de licencia. No obstante, la licencia del modelo no cubre posibles derechos sobre el dataset ni sobre el hardware o software de control asociado.
- Fechas de metadatos anómalas: la fecha de creación indicada (10 de octubre de 2026) es posterior a la fecha de consulta habitual, lo que puede deberse a un error de etiquetado en el Hub y conviene verificarlo antes de citar el modelo.
- Trazabilidad limitada: no se especifican versiones de LeRobot, hardware de entrenamiento, semillas ni recetas reproducibles más allá de los comandos genéricos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/fecasado/gfm-cubes-22dN7
- Dataset de entrenamiento: https://huggingface.co/datasets/fecasado/Ncubes-to-Nbaskets-320x240
- LeRobot (repositorio): https://github.com/huggingface/lerobot
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de entrenamiento de politicas en LeRobot: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- No se han encontrado papers, blogs, demos ni repositorios adicionales asociados especificamente a este modelo en la busqueda web realizada.
