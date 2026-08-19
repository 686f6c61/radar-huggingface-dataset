# NOJIMA21/so101-egg-transport-act-v0

## Resumen

El modelo `NOJIMA21/so101-egg-transport-act-v0` es una política de aprendizaje por imitación basada en ACT (Action Chunking with Transformers) desarrollada por NOJIMA21 para controlar un brazo robótico Hiwonder SO-ARM101. Su objetivo es transportar un huevo crudo desde un área de recogida hasta una sartén sin calentar, depositándolo suavemente. Se entrenó durante 5.000 pasos con 25 demostraciones humanas teleoperadas recogidas en el dataset LeRobot v3. Es una prueba de concepto de un bucle de aprendizaje completo, no una política de manipulación general, y su relevancia radica en servir como referencia reproducible para experimentos de imitación en robótica con hardware de bajo coste.

El modelo tiene 51.668.614 parámetros (aproximadamente 51,7 millones) y utiliza dos cámaras RGB (muñeca y aérea) junto con el estado de las seis articulaciones del robot. Genera acciones de posición para las articulaciones, incluido el gripper suave, a 30 FPS. Al ser un modelo de robótica, no procesa texto ni tiene contexto de lenguaje.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) |
| Parametros totales | 51.668.614 |
| Parametros activos | No disponible (no es MoE) |
| Longitud de contexto | No disponible (modelo de robótica, no procesa texto) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es una política ACT, un enfoque de aprendizaje por imitación que predice secuencias de acciones (chunks) a partir de observaciones multimodales. Se entrenó mediante behavior cloning a partir de 25 demostraciones humanas teleoperadas, durante 5.000 pasos de optimización. La entrada combina dos imágenes RGB (cámara de muñeca y cámara aérea) y las posiciones de las seis articulaciones del brazo SO-101. La salida son seis acciones de posición de articulaciones, incluyendo el gripper suave, a una frecuencia de 30 Hz. No se dispone de información sobre el número total de muestras, la composición del dataset ni el uso de técnicas de refinamiento como RLHF o DPO.

## Capacidades

- Manipulación robótica: agarra y transporta objetos frágiles (huevo crudo) en un layout fijo.
- Aprendizaje por imitación: reproduce comportamientos demostrados por teleoperación humana.
- Percepción multimodal: procesa dos vistas RGB y estado propioceptivo de las articulaciones.
- Control de articulaciones: genera comandos de posición para seis articulaciones a 30 FPS.
- Integración con LeRobot: compatible con la librería LeRobot para entrenamiento y evaluación.
- No incluye capacidades de lenguaje, tool calling, razonamiento general ni visión fuera del ámbito robótico.

## Casos de uso

- Investigación en aprendizaje por imitación: permite estudiar cómo una política ACT aprende una tarea de manipulación con pocas demostraciones y pasos de entrenamiento, sirviendo como punto de partida para comparaciones.
- Automatización de tareas de pick-and-place en entornos fijos: puede usarse para mover objetos de una zona a otra en una línea de montaje con layout conocido, siempre que las condiciones no cambien.
- Prototipado de controladores robóticos: su pequeño tamaño facilita iteraciones rápidas en simulación o con hardware real para validar conceptos de control.
- Evaluación de pipelines de visión para robótica: al depender de dos cámaras, sirve como banco de pruebas para algoritmos de percepción, calibración y fusión de sensores.
- Entrenamiento de políticas para robots de bajo coste: el brazo SO-ARM101 es asequible, lo que hace este modelo útil para laboratorios con presupuesto limitado que deseen experimentar con imitación.
- Demostración de integración con LeRobot: sirve como ejemplo práctico de cómo entrenar y evaluar políticas de imitación con la librería LeRobot, incluyendo la publicación de evaluaciones autónomas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Modelo pequeño (51,7 M parámetros), por lo que la inferencia es ligera.
- No hay datos oficiales de VRAM, pero el tamaño del repo es de 0,2 GB, lo que sugiere que puede ejecutarse en GPUs con poca memoria (menos de 2 GB).
- Puede desplegarse en una GPU consumer como una RTX 3060 o incluso en CPU, aunque la latencia no está documentada.
- Para la evaluación en hardware real se necesita el brazo robótico Hiwonder SO-ARM101 y un gripper suave.
- La librería LeRobot (PyTorch) es el entorno de despliegue principal; no se mencionan otros runners como vLLM u Ollama, ya que no es un modelo de lenguaje.

## Comparativa con modelos similares

No disponible.

## Limitaciones y advertencias

- Layout fijo: no generaliza a otros entornos o disposiciones de objetos.
- Sensible a la colocación de cámaras, calibración, iluminación y apariencia del objeto.
- Entrenado con solo 25 demostraciones y 5.000 pasos, lo que limita su robustez y capacidad de adaptación.
- No es una política de manipulación general; fallará ante cambios en el workspace.
- Riesgo de daños en objetos frágiles o personas si se opera sin supervisión; requiere un paro de emergencia físico.
- Licencia no disponible, lo que puede impedir su uso comercial sin autorización explícita del autor.
- No tiene capacidades de lenguaje ni razonamiento; su ámbito es exclusivamente robótico.

## Enlaces

- Modelo: https://huggingface.co/NOJIMA21/so101-egg-transport-act-v0
- Dataset: https://huggingface.co/datasets/NOJIMA21/so101-egg-transport-act-v0
