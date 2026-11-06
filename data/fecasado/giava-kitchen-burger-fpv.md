# fecasado/giava-kitchen-burger-fpv

## Resumen

Giava-kitchen-burger-fpv es una política robótica entrenada con LeRobot y publicada en Hugging Face por el usuario fecasado. Se trata de un modelo de imitación (imitation learning) orientado a control de robots manipuladores, concretamente a la tarea de trasladar una hamburguesa a un plato, según se deduce del nombre y del dataset asociado `fecasado/burger-to-plate-v2-320x240`. El modelo emplea una variante denominada `gaze_flow_matching`, que combina mecanismos de atención tipo gaze con flow matching para generar trayectorias de acción continuas.

El modelo cuenta con 235.899.950 parámetros (aproximadamente 236 millones) almacenados en formato safetensors, con un tamaño de repositorio de 0,9 GB. Está etiquetado con el pipeline `robotics` y la librería `lerobot`, lo que lo integra directamente en el ecosistema de entrenamiento y despliegue de políticas robóticas de Hugging Face. La licencia es Apache 2.0.

Su relevancia radica en que ejemplifica el flujo de trabajo actual de LeRobot para entrenar políticas de imitación a partir de demostraciones teleoperadas, con un formato estandarizado que permite reproducir el entrenamiento y ejecutar inferencia sobre robots reales como el SO-100 follower. Al ser un modelo de nicho con cero descargas y cero likes en el momento de la consulta, debe considerarse un artefacto de investigación o experimentación más que un modelo listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Política de imitación `gaze_flow_matching` sobre LeRobot (no se detalla la topología interna exacta) |
| Parámetros totales | 235.899.950 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (política robótica basada en observaciones, no en texto) |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No disponible (modelo de control robótico, sin capacidades lingüísticas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La información disponible indica que se trata de una política `gaze_flow_matching` entrenada mediante LeRobot. El nombre sugiere el uso de flow matching, una técnica de modelado generativo de trayectorias continuas que en robótica se emplea para predecir secuencias de acciones suaves y multimodales, combinada con algún mecanismo de atención o foco (gaze) sobre las observaciones visuales. No se especifica en la información proporcionada el número de capas, el tipo de encoder visual, la dimensionalidad del espacio de acciones ni la composición exacta de la arquitectura.

El entrenamiento se realizó sobre el dataset `fecasado/burger-to-plate-v2-320x240`, cuyas resoluciones de imagen (320x240) aparecen en el propio nombre. No se dispone de datos sobre el número de episodios, el número de tokens o frames de entrenamiento, ni sobre si se aplicaron técnicas de RLHF, DPO o aumentación de datos. La model card es una plantilla genérica de LeRobot sin cumplimentar en la sección de detalles del modelo, por lo que no hay información sobre innovaciones técnicas adicionales más allá de la nomenclatura del método.

## Capacidades

- Control robótico de manipulación: genera comandos de acción para un brazo robótico orientados a la tarea de recoger y colocar una hamburguesa en un plato.
- Aprendizaje por imitación: reproduce comportamientos aprendidos de demostraciones teleoperadas registradas en el dataset asociado.
- Política visuomotora: procesa observaciones de cámara (first-person view, FPV, según el nombre del modelo) y produce acciones continuas.
- Integración con LeRobot: compatible con las herramientas `lerobot-train` y `lerobot-record` para entrenamiento y evaluación.
- Despliegue en robot real: diseñado para ejecutarse sobre el robot SO-100 follower según el ejemplo de la model card.
- No dispone de capacidades de generación de texto, razonamiento lingüístico, código, matemáticas, tool calling, agentes ni multilingüismo.

## Casos de uso

- Automatización de tareas de cocina en laboratorio: el modelo puede ejecutar la secuencia de recogida y colocación de una hamburguesa en un plato sobre un banco de pruebas con robot SO-100, sirviendo como base para experimentos de manipulación diaria.
- Reproducción de investigación en imitación: investigadores pueden reentrenar la política con `lerobot-train` sobre el dataset `burger-to-plate-v2-320x240` para estudiar el comportamiento de flow matching en tareas de pick-and-place.
- Evaluación comparativa de políticas: al estar en formato LeRobot estándar, permite comparar `gaze_flow_matching` frente a otras políticas como ACT o Diffusion Policy en la misma tarea y dataset.
- Generación de nuevos datasets de evaluación: mediante `lerobot-record` con prefijo `eval_`, se pueden grabar episodios de evaluación para medir la tasa de éxito del modelo en el robot físico.
- Prototipado de pipelines de robot learning: sirve como ejemplo mínimo funcional de un flujo completo de entrenamiento, publicación en el Hub y despliegue en hardware real.
- Docencia y formación técnica: adecuado para cursos o talleres sobre LeRobot, ya que ilustra con un caso concreto (hamburguesa a plato) el ciclo de vida de una política robótica.
- Base para fine-tuning en tareas similares: podría adaptarse a otras tareas de traslado de objetos ajustando el dataset de entrenamiento, aunque no hay evidencia publicada de dicha transferencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 235,9 millones de parámetros en safetensors (aproximadamente 0,9 GB de pesos en precisión de entrenamiento), la inferencia requiere del orden de 1-2 GB de VRAM, aunque no se dispone de cifras oficiales.
- GPU recomendadas: no disponible. Por tamaño, cualquier GPU consumer con al menos 4 GB de VRAM debería poder alojar el modelo, pero no hay confirmación del autor.
- ¿Cabe en GPU consumer? Sí, por el tamaño de parámetros es probable que quepa en GPUs como RTX 3060, RTX 4060 o superiores, si bien no se especifican requisitos oficiales.
- Opciones de despliegue: LeRobot (`lerobot-record` con `--policy.path`), con soporte de ejecución en robot SO-100 follower. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política robótica.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| giava-kitchen-burger-fpv | 235,9 M | No aplica | Pick-and-place de hamburguesa | Apache 2.0 | Hugging Face (0 descargas) |
| ACT (Action Chunking Transformer) | No disponible en la información | No aplica | Políticas de imitación en LeRobot | No disponible | Referenciado en la documentación de LeRobot |
| Diffusion Policy | No disponible en la información | No aplica | Políticas de imitación robótica | No disponible | Implementado en LeRobot |

No se dispone de datos de rendimiento comparativo entre estas políticas en la información proporcionada, por lo que la comparación se limita a aspectos de disponibilidad y categoría.

## Limitaciones y advertencias

- Modelo de nicho sin validación pública: cero descargas y cero likes en el momento de la consulta, sin evidencia de evaluación independiente.
- Model card incompleta: la plantilla de LeRobot no está cumplimentada, con la advertencia explícita "Model type not recognized — please update this template".
- Especialización estrecha: entrenado para una única tarea (hamburguesa a plato) y un único entorno; no generaliza a otras tareas sin reentrenamiento.
- Riesgo de sobreajuste al dataset: sin datos de número de episodios ni de variabilidad de escenas, no se puede evaluar la robustez ante cambios de iluminación, posición de objetos o fondo.
- Sin capacidades lingüísticas ni de razonamiento: no es un modelo de lenguaje y no debe usarse para tareas de texto, código o agentes.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el usuario debe verificar las licencias del dataset asociado y de las dependencias de LeRobot.
- Caveat para producción: al ser una política robótica, su despliegue implica riesgos físicos; requiere supervisión, límites de seguridad en el robot y validación en el entorno real antes de cualquier uso autónomo.
- Idiomas: no aplica ni está documentado; no usar como modelo multilingüe.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/fecasado/giava-kitchen-burger-fpv
- Dataset asociado: https://huggingface.co/datasets/fecasado/burger-to-plate-v2-320x240
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de políticas: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
