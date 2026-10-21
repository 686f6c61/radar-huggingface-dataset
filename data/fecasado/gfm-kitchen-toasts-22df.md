# fecasado/gfm-kitchen-toasts-22dF

## Resumen

`fecasado/gfm-kitchen-toasts-22dF` es una política de aprendizaje por imitación para robótica de manipulación, publicada en HuggingFace Hub por el usuario `fecasado` y entrenada con el framework LeRobot de HuggingFace. El nombre del modelo (`gaze_flow_matching`) y la etiqueta `gaze_flow_matching` indican que se trata de una política basada en flow matching condicionada por la mirada (gaze), aunque la model card no desarrolla la arquitectura interna ni el esquema exacto de condicionamiento. El checkpoint contiene 75.248.330 parámetros en formato safetensors y ocupa 0,3 GB en el repositorio.

La tarea concreta para la que se ha entrenado está delimitada por el dataset asociado, `fecasado/toasts-to-plate-320x240`: manipulación de tostadas en un entorno de cocina, con observaciones visuales a resolución 320x240 y, presumiblemente, traslado de la tostada a un plato. No es un modelo de lenguaje ni un VLA conversacional: no procesa instrucciones en lenguaje natural ni genera texto, sino acciones motrices a partir de imágenes (y posiblemente del estado propioceptivo del robot).

Su relevancia es la de un ejemplo práctico del ecosistema LeRobot para políticas ligeras de imitación sobre brazos de bajo coste (la model card menciona el robot `so100_follower`). Con ~75 M de parámetros es un modelo pequeño, entrenable y ejecutable en hardware de consumo, útil como referencia reproducible de flow matching aplicado a robótica y como base para experimentos de comparación frente a ACT o Diffusion Policy. La información pública es muy escasa: la model card es la plantilla por defecto de LeRobot sin cumplimentar, sin métricas de evaluación ni detalles de entrenamiento.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `gaze_flow_matching` (política de imitación basada en flow matching con condicionamiento por gaze); topología interna no disponible |
| Parametros totales | 75.248.330 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible / no aplica (política visomotora; no hay ventana de contexto textual) |
| Tipos de cuantizacion | No disponible (el repositorio solo contiene safetensors; no se documentan variantes GGUF, INT8 ni FP8) |
| Idiomas soportados | No disponible (no es un modelo de lenguaje; no se documenta ninguna capacidad lingüística) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (checkpoint LeRobot) |
| Pipeline declarado | `robotics` |
| Libreria | `lerobot` |
| Dataset de entrenamiento | `fecasado/toasts-to-plate-320x240` |
| Tamaño del repositorio | 0,3 GB |
| Entradas / salidas | No disponible en detalle; por el dataset y el pipeline se deduce entrada visual a 320x240 y salida de acciones motoras |
| Descargas / likes | 8 / 0 |

## Arquitectura y entrenamiento

La etiqueta `gaze_flow_matching` sitúa al modelo en la familia de políticas de imitación que generan acciones mediante flow matching (modelos generativos de flujo continuo aplicados al espacio de acciones), en lugar de regresión directa o difusión. El calificativo `gaze` sugiere que la política incorpora información de mirada humana (puntos de fijación registrados durante la teleoperación o el entrenamiento) como señal de condicionamiento adicional a las imágenes, un enfoque habitual para desambiguar objetos y mejorar la generalización en tareas de agarre. El número de parámetros (75,2 M) es coherente con una política compacta tipo ACT o un pequeño transformer visomotor, pero la model card no especifica el backbone visual, el número de capas, el horizonte de predicción de acciones ni la representación del estado.

En cuanto al entrenamiento, la única evidencia disponible es que se realizó con LeRobot y que el dataset asociado es `fecasado/toasts-to-plate-320x240`, con observaciones a 320x240. No hay información sobre número de episodios, horas de teleoperación, composición del dataset, aumentos de datos, hiperparámetros, ni sobre si se aplicó RLHF, DPO o ajuste posterior de ningún tipo (ninguno de estos procedimientos es habitual en políticas robóticas). La model card es la plantilla genérica de LeRobot y conserva el aviso `_Model type not recognized — please update this template._`, además de un ejemplo de entrenamiento con `--policy.type=act` que probablemente no corresponde a la arquitectura real del checkpoint; conviene tratar ese fragmento como texto de plantilla, no como documentación fiable del modelo.

## Capacidades

- Manipulación robótica visomotora: genera secuencias de acciones para tareas de pick-and-place en entorno de cocina, concretamente el traslado de tostadas a un plato según el nombre del dataset.
- Control a partir de observaciones de baja resolución (320x240), lo que reduce el coste computacional del encoder visual.
- Generación de acciones por flow matching, lo que permite modelar distribuciones multimodales de trayectorias (varias formas válidas de ejecutar la misma tarea).
- Condicionamiento por gaze (según la etiqueta del modelo): potencial uso de información de mirada para focalizar la atención en el objeto relevante.
- Integración con el ecosistema LeRobot: entrenamiento con `lerobot-train` y evaluación/ejecución con `lerobot-record`.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso simbólico ni planificación de alto nivel.
- No tiene capacidades multilingües ni de generación de texto.
- No se documentan modos especiales (thinking, visión general, audio) más allá de la percepción visual propia de la política.

## Casos de uso

- Reproducción de experimentos de flow matching en robótica: sirve como checkpoint de referencia para comparar la calidad de trayectorias generadas por flow matching frente a políticas de regresión o difusión en una tarea de manipulación acotada.
- Base para fine-tuning en brazos de bajo coste: partiendo de los 75,2 M de parámetros y del pipeline LeRobot, se puede reentrenar con un dataset propio de pick-and-place sobre SO-100/SO-101, ajustando solo la cabeza de acciones si el espacio de observación coincide.
- Docencia y laboratorios de robótica: el tamaño reducido (0,3 GB) y la licencia Apache 2.0 permiten distribuir el modelo a estudiantes y ejecutarlo en estaciones con GPU modesta para prácticas de aprendizaje por imitación.
- Evaluación de pipelines de datos: útil para medir cómo afecta la resolución de entrada (320x240) y la composición del dataset al éxito de la tarea, comparando el mismo modelo entrenado con distintos conjuntos de episodios.
- Investigación en condicionamiento por mirada: como punto de partida para estudiar si la señal de gaze mejora la localización del objeto y la robustez ante oclusiones en tareas de cocina.
- Pruebas de integración con `lerobot-record`: validar el bucle completo de captura, inferencia y ejecución sobre el robot `so100_follower` antes de invertir en un dataset propio mayor.
- Prototipado de automatización en cocina a pequeña escala: escenario controlado de recogida y depósito de alimentos, siempre con supervisión humana y en entorno de laboratorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye tasa de éxito, número de episodios de evaluación, comparaciones con ACT o Diffusion Policy, ni métricas de suavidad o precisión de trayectoria.

## Requisitos de hardware

- VRAM estimada para los pesos: aproximadamente 301 MB en FP32 (75.248.330 × 4 bytes), unos 150 MB en BF16/FP16 y unos 75 MB en INT8. A ello hay que sumar activaciones y el encoder visual, no cuantificados en la información disponible.
- Cabe holgadamente en cualquier GPU de consumo: RTX 3060, RTX 4060, RTX 4070, RTX 4090, así como en iGPU con suficiente memoria compartida para inferencia no crítica.
- Para entrenamiento desde cero o fine-tuning se recomienda al menos una RTX 3090/4090 o una A100/H100 si se aumenta el tamaño de batch o la resolución; no hay datos publicados de tiempo de entrenamiento.
- Opciones de despliegue: LeRobot (`lerobot-record` con `--policy.path`), PyTorch con CUDA. No es compatible con vLLM, TGI, llama.cpp ni Ollama, al no ser un modelo de lenguaje.
- Latencia y throughput: no disponibles. En control robótico la latencia de inferencia es crítica; con 75 M de parámetros debería ser del orden de milisegundos en GPU moderna, pero no se ha publicado ninguna medición.

## Comparativa con modelos similares

| Modelo | Enfoque | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `fecasado/gfm-kitchen-toasts-22dF` | Flow matching con gaze, política de imitación | 75,2 M | No aplica | Apache 2.0 | HuggingFace Hub, 8 descargas |
| ACT (Action Chunking Transformer, LeRobot) | Transformer con action chunking | No disponible | No aplica | Apache 2.0 (implementación LeRobot) | Integrado en LeRobot |
| Diffusion Policy | Difusión sobre secuencias de acciones | No disponible | No aplica | No disponible en esta ficha | Implementaciones públicas en investigación |
| SmolVLA | VLA compacto con entrada de lenguaje | ~450 M (referencia general, no verificada aquí) | No disponible | Apache 2.0 (referencia general) | HuggingFace Hub |
| π0 (pi-zero) | VLA de flow matching sobre robot | ~3.300 M (referencia general, no verificada aquí) | No disponible | Apache 2.0 (referencia general) | HuggingFace Hub |

La comparación relevante es de escala: este checkpoint (75,2 M) es entre uno y dos órdenes de magnitud menor que los VLA actuales, lo que implica menor generalidad pero también requisitos de hardware muy inferiores. Frente a ACT y Diffusion Policy, la diferencia declarada es el uso de flow matching y el condicionamiento por gaze, extremo que no puede verificarse sin código o documentación adicional. Las cifras de SmolVLA y π0 son referencias generales no verificadas en la información proporcionada para esta ficha.

## Limitaciones y advertencias

- Model card incompleta: es la plantilla por defecto de LeRobot, con el aviso de tipo de modelo no reconocido; no hay documentación de arquitectura, datos ni evaluación.
- Ausencia total de métricas: no se conoce la tasa de éxito de la tarea, por lo que no hay evidencia pública de que la política funcione de forma fiable.
- Validación comunitaria nula: 8 descargas y 0 likes implican que el modelo no ha sido replicado ni auditado por terceros.
- Especialización extrema: entrenado para una única tarea (tostadas a un plato) en un entorno concreto; se espera un fallo severo ante cambios de iluminación, fondo, tipo de objeto o posición inicial.
- Error compuesto en ejecución: como toda política de imitación, los errores de acción se acumulan a lo largo del episodio y pueden llevar a estados fuera de distribución.
- Dependencia de la señal de gaze: si el condicionamiento por mirada requiere datos de un eye-tracker en tiempo de inferencia, el despliegue se complica; este punto no está documentado.
- Sin capacidades lingüísticas: no acepta instrucciones en lenguaje natural ni mantiene contexto conversacional; la fila de idiomas no aplica y no debe interpretarse como soporte multilingüe.
- Riesgo de alucinación: no aplica en el sentido de generación de texto, pero sí existe riesgo de predicciones de acción no fundamentadas ante observaciones ambiguas.
- Sesgos: no documentados. Cualquier sesgo procedería del operador que teleoperó el dataset y del entorno físico concreto de grabación.
- Licencia Apache 2.0: permite uso comercial y modificación, pero se distribuye sin garantías; la responsabilidad por daños en un robot real recae en el integrador.
- Seguridad física: no debe ejecutarse en un robot sin límites de par, paradas de emergencia y supervisión humana, especialmente en un entorno de cocina con objetos calientes.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/fecasado/gfm-kitchen-toasts-22dF
- Dataset asociado: https://huggingface.co/datasets/fecasado/toasts-to-plate-320x240
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de políticas: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
