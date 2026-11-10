# jcapmeil/smolvla-cupflow

## Resumen

smolvla-cupflow es un ajuste fino (fine-tuning) del modelo base SmolVLA de LeRobot (`lerobot/smolvla_base`), desarrollado por el usuario jcapmeil. Se trata de una política visomotora para robótica (visión-lenguaje-acción, VLA) entrenada para ejecutar una tarea manipulativa concreta: el manejo de una taza ("cupflow"), a partir de un conjunto de datos propio de 150 episodios y 604.000 fotogramas registrados con LeRobot.

El modelo parte de la arquitectura SmolVLA, una política compacta de tipo VLA pensada para control robótico en tiempo real con recursos moderados. Con 450 millones de parámetros totales (de los que solo 100 millones fueron entrenables durante el ajuste), el checkpoint resultante ocupa 0,9 GB en formato safetensors y se distribuye a través de la librería LeRobot 0.4.4. Su relevancia es acotada: no es un modelo de propósito general, sino una política especializada que demuestra el flujo de trabajo de ajuste de SmolVLA sobre un dataset propio.

La información pública disponible es muy limitada: la model card no declara licencia, idiomas ni resultados de benchmarks, y el repositorio no registra descargas ni valoraciones en el momento de la consulta. La ficha se limita, por tanto, a lo documentado por el autor y a las especificaciones inferibles de los metadatos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SmolVLA (política visión-lenguaje-acción, VLA) sobre `lerobot/smolvla_base` |
| Parametros totales | 450.046.176 |
| Parametros activos | no disponible (no es un modelo MoE según la información disponible) |
| Parametros entrenables en el ajuste | 100 millones |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors sin cuantizar) |
| Idiomas soportados | no disponible (modelo de robótica, no de texto general) |
| Licencia | no disponible |
| Formato de pesos | safetensors (librería LeRobot) |
| Tamaño del repositorio | 0,9 GB |
| Dataset de ajuste | `jcapmeil/cupflow-lerobot` (150 episodios, 604.000 fotogramas) |
| Versión de LeRobot | 0.4.4 |
| Hardware de entrenamiento | 1× NVIDIA L40S, ~4 h |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del checkpoint `lerobot/smolvla_base`, la implementación de SmolVLA en la librería LeRobot. SmolVLA es una política visomotora que combina percepción visual (imágenes de cámaras del robot) con instrucciones en lenguaje y produce acciones de control de bajo nivel. La información proporcionada no detalla la composición interna de la arquitectura (bloques de atención, codificador visual, etc.), por lo que ese nivel de detalle se marca como no disponible.

El entrenamiento se realizó con LeRobot 0.4.4 durante 20.000 pasos, con tamaño de lote 64, lo que equivale a aproximadamente 2,1 épocas sobre el dataset de 150 episodios. La pérdida final fue de 0,012 (0,439 en el paso 100 y 0,016 en el paso 10.000), con un esquema de learning rate de warmup de 666 pasos seguido de decaimiento coseno hasta 2,5e-06. Solo se entrenaron 100 millones de los 450 millones de parámetros, y el proceso completo consumió unas 4 horas en una única GPU NVIDIA L40S. El checkpoint publicado corresponde al paso final (20.000).

Un detalle operativo relevante es el renombrado de cámaras: durante el entrenamiento, las claves del dataset `observation.images.top` y `observation.images.wrist` se mapearon a `observation.images.camera1` y `observation.images.camera2` respectivamente. La configuración hereda además una tercera cámara (`camera3`) del modelo base que no estuvo presente en el entrenamiento.

## Capacidades

- Control robótico visomotor: genera acciones a partir de observaciones de cámara y de la tarea aprendida (manipulación de una taza).
- Ajuste específico de tarea: la política está especializada en el flujo "cupflow" del dataset de entrenamiento, no en robótica general.
- Entrada multimodal: consume imágenes de dos cámaras (superior y de muñeca) con las claves `camera1` y `camera2`.
- Integración con LeRobot: se carga directamente mediante `--policy.path=jcapmeil/smolvla-cupflow` en el stack de LeRobot.
- Soporte de renombrado de cámaras en inferencia mediante `--rename_map` y `--tolerance_s`.
- Generación de texto, razonamiento, código, matemáticas, tool calling, agentes o capacidades multilingües: no disponible; no se documentan como capacidades de este modelo.

## Casos de uso

- Reproducción de la tarea de manipulación de tazas: desplegar la política en un robot con dos cámaras configuradas como `camera1` y `camera2` para replicar el comportamiento aprendido en el dataset cupflow.
- Evaluación de un pipeline de ajuste de SmolVLA: sirve como referencia de un fine-tuning completo (20.000 pasos, ~2,1 épocas) sobre un dataset propio de LeRobot, útil para validar hiperparámetros y tiempos de entrenamiento.
- Prototipado de políticas VLA en laboratorio: al ocupar 0,9 GB y requerir un único acelerador para el ajuste, es adecuado para experimentación académica con recursos limitados.
- Base para nuevos ajustes: puede actuar como punto de partida para otras tareas manipulativas mediante fine-tuning adicional sobre datasets de LeRobot.
- Pruebas de integración con LeRobot 0.4.4: permite verificar el flujo de carga de políticas, el mapeo de cámaras y la tolerancia temporal (`tolerance_s`) en entornos de simulación o robot real.
- Docencia y demostraciones: ejemplo concreto y pequeño de un modelo visión-lenguaje-acción para explicar el ciclo observación-acción en robótica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente reporta métricas de entrenamiento (pérdida final de 0,012 y curva de pérdida por pasos), que no constituyen una evaluación de rendimiento en tarea.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 450 millones de parámetros en safetensors (0,9 GB de repositorio), la inferencia en precisión nativa requiere del orden de 1-2 GB de memoria para los pesos, más el coste del codificador visual y de las imágenes de entrada.
- GPU de entrenamiento documentada: 1× NVIDIA L40S (aproximadamente 4 horas para 20.000 pasos con lote 64).
- GPU recomendadas para inferencia: no disponibles en la documentación; por tamaño, cualquier GPU consumer con suficiente VRAM para los pesos y el procesamiento de imágenes debería ser suficiente, aunque no se confirma en la información proporcionada.
- Despliegue: mediante la librería LeRobot (`--policy.path=jcapmeil/smolvla-cupflow`). No se documentan opciones de vLLM, llama.cpp, Ollama o TGI, que no son aplicables a este tipo de política robótica.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| smolvla-cupflow | 450 M (100 M entrenables) | no disponible | Manipulación de tazas (cupflow) | no disponible | Hugging Face, LeRobot |
| lerobot/smolvla_base | 450 M (según checkpoint base) | no disponible | Política VLA general base | no disponible | Hugging Face, LeRobot |
| Otras políticas VLA de LeRobot | no disponible | no disponible | Robótica diversa | no disponible | no disponible |

La información proporcionada no incluye resultados comparativos de rendimiento entre estos modelos, por lo que la comparación se limita a parámetros, tarea y disponibilidad.

## Limitaciones y advertencias

- Especialización extrema: la política está entrenada para una única tarea (cupflow) y no generaliza a otras tareas de manipulación sin un nuevo ajuste.
- Dependencia del nombre de las cámaras: si en inferencia las cámaras no se llaman `camera1` y `camera2` (o no se aplica el `rename_map`), la política fallará o recibirá imágenes incorrectas.
- Cámara heredada no entrenada: la configuración incluye `camera3` del modelo base, que no estuvo presente en el entrenamiento y puede inducir a error.
- Licencia no declarada: no se especifica licencia, por lo que el uso comercial queda sin garantías legales hasta que el autor la defina.
- Dataset pequeño: 150 episodios y ~2,1 épocas de entrenamiento limitan la robustez frente a variaciones de entorno, iluminación u objetos.
- Sin benchmarks: no hay evaluación pública de éxito en tarea, lo que impide estimar la fiabilidad en producción.
- Riesgo de sobreajuste al entorno de grabación: al entrenarse sobre un único dataset, el comportamiento fuera de las condiciones registradas es incierto.
- Idiomas y contexto: no aplicables o no documentados; no debe tratarse como un modelo de lenguaje general.
- Repositorio sin tracción: 0 descargas y 0 valoraciones en el momento de la consulta, sin evidencia de uso por terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jcapmeil/smolvla-cupflow
- Dataset de ajuste: https://huggingface.co/datasets/jcapmeil/cupflow-lerobot
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Librería LeRobot: no disponible en la información proporcionada (referenciada como `lerobot` en los metadatos)
