# Shiki42/ctr-dp-putcab-original-e638-step85018

## Resumen

CTR DP PutCab — Original L→R es un checkpoint de inferencia de una política de difusión (Diffusion Policy) para control robótico, publicado por el usuario Shiki42 en HuggingFace. No es un modelo de lenguaje: se trata de un modelo de imitación (imitation learning) entrenado para resolver la tarea PutCab del simulador RoboTwin, es decir, coger un objeto y colocarlo en su posición objetivo. El repositorio contiene 270.780.366 parámetros en formato safetensors y ocupa 1,1 GB.

El modelo corresponde al experimento E638 del proyecto CTR y se presenta como el checkpoint final verificado de ese entrenamiento, con la actualización de optimizador número 85018. La arquitectura declarada es la Diffusion Policy oficial de LeRobot, la variante de entrenamiento es "Original L→R" y el entrenamiento se realizó sobre el dataset Shiki42/putcab-original-l2r-train50-20260921 (revisión 960087bc200d6a707eea420b3e54cc1d364df2e4), con batch efectivo directo de 128 y sin acumulación de gradientes. La máscara de inactividad (IdleMask) está desactivada.

Su relevancia es acotada y experimental: se publica como artefacto reproducible de un pipeline de investigación en robótica, con configuración resuelta, procesadores guardados y un manifiesto SHA256SUMS. El propio autor advierte que la publicación no implica éxito de evaluación ni aprobación de auditoría, que se reportan por separado en el experimento E639. No hay licencia declarada, no hay idiomas declarados y no se han publicado resultados de benchmarks en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LeRobot Diffusion Policy (política de difusión para control robótico), variante oficial |
| Parametros totales | 270.780.366 (aprox. 270,8 M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no aplica como contexto de LLM; el horizonte de observación y de acciones no se documenta) |
| Tipos de cuantizacion | no disponible (se distribuyen pesos en safetensors; no se documentan cuantizaciones) |
| Idiomas soportados | no disponible (modelo de control robótico, no procesa lenguaje natural) |
| Licencia | no disponible (la model card y los tags no la especifican) |
| Formato de pesos | safetensors |
| Tamano del repositorio | 1,1 GB |
| Tarea | RoboTwin PutCab (simulación) |
| Variante de entrenamiento | Original L→R |
| Actualizacion final del optimizador | 85018 |
| Batch efectivo | 128 (directo), acumulación 1 |
| Dataset de entrenamiento | Shiki42/putcab-original-l2r-train50-20260921 |
| Revision del dataset | 960087bc200d6a707eea420b3e54cc1d364df2e4 |
| Experimento de origen | E638 |
| IdleMask | desactivado |
| Contenido del repositorio | parámetros de inferencia, procesadores guardados, configuración resuelta y manifiesto SHA256SUMS |
| Excluido del repositorio | estado del optimizador y de entrenamiento, logs, credenciales y cachés |
| Pipeline declarado | robotics |

## Arquitectura y entrenamiento

La arquitectura es la Diffusion Policy oficial de LeRobot, un enfoque de imitación que modela la distribución de secuencias de acciones mediante un proceso de difusión condicionado por las observaciones del robot. En lugar de predecir una única acción de forma determinista, la política aprende a generar fragmentos de acciones (action chunks) eliminando ruido de forma iterativa, lo que permite representar distribuciones multimodales de comportamiento y mejora la estabilidad frente a demostraciones heterogéneas. El checkpoint contiene 270,8 M de parámetros, coherente con una política con codificador visual y red de denoising de tamaño moderado, aunque no se detalla en la información disponible ni el backbone visual ni el número de pasos de difusión.

En cuanto al entrenamiento, los únicos datos verificables son los declarados en la model card: dataset PutCab "original L→R" con 50 demostraciones de entrenamiento, batch efectivo de 128 sin acumulación, 85018 actualizaciones del optimizador y máscara de inactividad desactivada. No se especifica el número total de tokens, frames o transiciones vistas, ni la composición exacta del dataset, ni si hubo etapas de ajuste fino con RLHF/DPO (poco habituales en imitation learning robótico). Tampoco se documenta ninguna innovación técnica adicional (decodificación especulativa, atención lineal, destilación) más allá del uso de la Diffusion Policy estándar de LeRobot y de la desactivación de IdleMask, que implica que el modelo no filtra pasos potencialmente inactivos durante la generación de acciones.

## Capacidades

- Generación de trayectorias de acciones para control robótico de manipulación: produce secuencias de acciones (action chunks) a partir de observaciones, adecuadas para ejecución con horizonte de recesión (receding horizon).
- Ejecución de la tarea PutCab en el simulador RoboTwin: coger un objeto y colocarlo en una posición objetivo en un entorno simulado.
- Aprendizaje por imitación a partir de demostraciones: el comportamiento está inducido por el dataset de 50 demostraciones declarado, no por recompensas explícitas.
- Inferencia autocontenida: el repositorio incluye parámetros, procesadores guardados y configuración resuelta, de modo que puede cargarse sin reconstruir el pipeline de entrenamiento.
- Reproducibilidad verificable: incluye un manifiesto SHA256SUMS para validar la integridad de los artefactos publicados.
- No soporta tool calling ni function calling: no es un modelo de lenguaje y no expone interfaz de llamada a herramientas.
- No soporta agentes conversacionales ni razonamiento multi-paso en lenguaje natural.
- No tiene capacidades multilingües, de visión general (captioning, VQA), de audio ni modo "thinking".
- No se documenta generalización a otras tareas, entornos u objetos distintos de PutCab en RoboTwin.

## Casos de uso

- Evaluación de políticas de imitación en RoboTwin: cargar el checkpoint en el pipeline de LeRobot y ejecutar rollouts de la tarea PutCab para medir tasa de éxito frente a otros checkpoints del mismo experimento, usando el manifiesto SHA256SUMS para garantizar que se evalúa exactamente el mismo artefacto.
- Línea base (baseline) en investigación de políticas de difusión: sirve como referencia reproducible con hiperparámetros conocidos (batch efectivo 128, update 85018) para comparar variantes de arquitectura, horizonte de predicción o esquemas de difusión.
- Generación de datos sintéticos de manipulación: los rollouts del modelo en simulación pueden usarse para producir trayectorias adicionales que alimenten entrenamientos posteriores o técnicas de destilación hacia políticas más pequeñas.
- Estudio del efecto de IdleMask: al estar desactivado en este checkpoint, permite comparar directamente contra checkpoints con IdleMask activo para cuantificar su impacto en la estabilidad y en la tasa de éxito de la tarea.
- Pruebas de robustez ante variaciones de configuración: al conservar la configuración resuelta y los procesadores, es posible alterar parámetros de observación o de ejecución y medir la degradación del comportamiento de forma controlada.
- Reproducción de experimentos: dado que el checkpoint está vinculado al experimento E638 y a una revisión concreta del dataset, permite reproducir el resultado de entrenamiento y auditar la cadena de artefactos dentro del proyecto CTR.
- Docencia y prototipado en robótica: con 270,8 M de parámetros y 1,1 GB de pesos, es lo bastante pequeño para ejecutarse en una GPU de consumo y servir como ejemplo práctico de Diffusion Policy en cursos o talleres.
- Validación de infraestructura de despliegue: integrable en un bucle de control simulado para verificar latencias, formatos de observación y compatibilidad de versiones de LeRobot antes de pasar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que la publicación no establece éxito de evaluación ni aprobación de auditoría, y que esos resultados se reportan por separado en el experimento E639. No se dispone de tasas de éxito, métricas de error de posición ni comparaciones numéricas con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,1 GB solo para los pesos en precisión de 32 bits, más memoria para activaciones y buffers de difusión; en float16 los pesos bajarían a unos 0,55 GB. Son estimaciones aritméticas a partir del número de parámetros y del tamaño del repositorio, no datos publicados por el autor.
- Cabe en GPU de consumo: sí, con margen amplio. Cualquier GPU con 6-8 GB o más (RTX 3060, RTX 4060, RTX 4090) debería ser suficiente para una sola instancia de inferencia.
- GPU recomendadas para entrenamiento o despliegue intensivo: no disponible en la información proporcionada. Para entrenamiento de políticas de difusión se suelen emplear A100 o H100 por throughput de lotes grandes, pero el autor no documenta hardware.
- Ejecución en CPU: técnicamente posible por el tamaño reducido, aunque la latencia por paso de difusión sería alta; no hay cifras publicadas.
- Opciones de despliegue: LeRobot y PyTorch son los entornos naturales, dado que la arquitectura declarada es la Diffusion Policy oficial de LeRobot. vLLM, llama.cpp, Ollama y TGI no aplican porque no es un modelo de lenguaje, sino una política de control.
- Latencia y throughput: no disponible. Dependen del número de pasos de difusión, del codificador visual y de la frecuencia de control exigida por RoboTwin, ninguno de los cuales se especifica.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones publicadas de los checkpoints comparables, por lo que la comparación numérica no es posible con la información disponible.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CTR DP PutCab (E638) | 270.780.366 | no disponible | no disponible | no disponible | HuggingFace, 0 descargas |
| Otros checkpoints CTR / LeRobot Diffusion Policy para RoboTwin | no disponible | no disponible | no disponible | no disponible | no disponible en la información proporcionada |
| Políticas ACT u otras variantes de LeRobot | no disponible | no disponible | no disponible | no disponible | no disponible en la información proporcionada |

La categoría comparable sería la de políticas de imitación para manipulación en simulación (Diffusion Policy, ACT y variantes) entrenadas sobre RoboTwin, pero la información proporcionada no incluye métricas ni especificaciones de esos modelos, así que cualquier comparación sería especulativa.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona en lenguaje natural, no soporta tool calling ni conversación. Cualquier uso fuera del control robótico es inadecuado.
- Licencia no declarada: al no especificarse licencia en la model card ni en los tags, no hay autorización explícita para uso comercial. Debe contactarse con el autor antes de cualquier uso en producción.
- Alcance restringido a una única tarea: entrenado para PutCab en el simulador RoboTwin; no hay evidencia de generalización a otros objetos, entornos o robots.
- Dataset pequeño: 50 demostraciones de entrenamiento, lo que limita la cobertura de variaciones de posición, iluminación y dinámica, y aumenta el riesgo de sobreajuste a las condiciones de recogida.
- Sin evaluación publicada: el autor indica que la publicación no implica éxito de evaluación; no hay tasa de éxito ni métricas verificables. La validación depende del experimento E639, cuyos resultados no están en esta información.
- Brecha simulación-realidad: aunque se describe como tarea de simulación, no se documenta ningún experimento de transferencia a hardware real; el comportamiento en un robot físico no está caracterizado.
- IdleMask desactivado: el modelo puede generar acciones en fases en las que la política ideal permanecería inactiva, lo que puede producir movimiento parásito en ejecución real.
- Riesgo de alucinación en el sentido de trayectorias no válidas: como toda política de difusión entrenada por imitación, puede producir secuencias de acciones plausibles pero incorrectas fuera de la distribución de demostraciones (colisiones, agarres fallidos).
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, sin validación por parte de la comunidad.
- Contenido excluido: no se publican logs, estado del optimizador ni credenciales, por lo que la auditoría completa del entrenamiento requiere acceso al experimento E638 y a los registros del proyecto CTR.
- Idiomas: no aplica ni se declara soporte de ningún idioma.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Shiki42/ctr-dp-putcab-original-e638-step85018
- Dataset de entrenamiento: https://huggingface.co/datasets/Shiki42/putcab-original-l2r-train50-20260921
- Paper, blog o repositorio del autor: no disponible en la información proporcionada
- Demo o espacio de evaluación: no disponible en la información proporcionada
- Nota sobre la búsqueda web: los resultados devueltos por la búsqueda no guardan relación con el modelo (páginas sobre alimentación rica en proteínas), por lo que no aportan enlaces utilizables.
