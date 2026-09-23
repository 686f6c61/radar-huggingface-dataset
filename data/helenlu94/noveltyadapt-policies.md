# helenlu94/NoveltyAdapt-policies

## Resumen

NoveltyAdapt-policies es un repositorio de checkpoints de políticas de aprendizaje por refuerzo publicado por el usuario helenlu94 en HuggingFace. No se trata de un modelo de lenguaje ni de un modelo fundacional, sino de un conjunto de pesos entrenados con Stable-Baselines3 para tareas de robótica de manipulación, asociados al proyecto NoveltyAdapt y a la rama de código `iros2026`. El repositorio contiene únicamente ficheros ZIP de checkpoints (`final_model.zip`, `best_model.zip` y `recent_model.zip`); no incluye logs de entrenamiento, buffers de replay ni ficheros de ejecución.

La relevancia del artefacto está en el contexto del artículo arXiv 2603.11351v1, que describe un enfoque híbrido en el que un modelo de lenguaje se emplea para razonar sobre el sentido común, identificar operadores ausentes en un plan, generar planes con un planificador simbólico y escribir funciones de recompensa que guían al agente de RL en el aprendizaje de políticas de control para esos operadores nuevos. Este repositorio sería, por tanto, el material de pesos que respalda los experimentos de adaptación a la novedad de ese trabajo.

El repositorio ocupa 0,5 GB y cubre cuatro dominios de tarea: `coffee_box`, `coffee_drawer`, `kitchen` y `nut_assembly`. La estructura de rutas replica la del directorio `learning/policies/` del repositorio de código, preservando la tarea original, el algoritmo, la configuración de entrenamiento y las subcarpetas de semilla. No se declara licencia, idiomas, número de parámetros ni arquitectura de red concreta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Políticas de aprendizaje por refuerzo entrenadas con Stable-Baselines3; topología de red concreta no disponible |
| Parámetros totales | no disponible |
| Parámetros activos | no aplicable (no es un modelo de mezcla de expertos) |
| Longitud de contexto | no aplicable (no es un modelo de lenguaje) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (no aplicable a una política de control) |
| Licencia | no disponible |
| Formato de pesos | ZIP de Stable-Baselines3 (`final_model.zip`, `best_model.zip`, `recent_model.zip`) |
| Librería de origen | stable-baselines3 |
| Pipeline declarado | reinforcement-learning |
| Tamaño del repositorio | 0,5 GB |
| Dominios de tarea incluidos | coffee_box, coffee_drawer, kitchen, nut_assembly |
| Contenido incluido | solo checkpoints; sin logs, sin buffers de replay, sin ficheros de ejecución |
| Descargas | 0 |
| Likes | 0 |
| Fecha de creación | 23 de septiembre de 2026 |
| Última actualización | 23 de septiembre de 2026 |

## Arquitectura y entrenamiento

La model card no describe la arquitectura de red de las políticas. Por la librería declarada (Stable-Baselines3) y el pipeline de reinforcement learning, se trata de políticas de control entrenadas mediante algoritmos de RL estándar de ese ecosistema, presumiblemente sobre entornos de simulación de manipulación robótica con observaciones y espacio de acciones propios de cada tarea. El repositorio conserva la jerarquía original de carpetas, de modo que los pesos están organizados por dominio (`coffee_box`, `coffee_drawer`, `kitchen`, `nut_assembly`), algoritmo, configuración de entrenamiento y semilla.

Según el resumen del artículo arXiv 2603.11351v1, el método NoveltyAdapt combina tres componentes: un modelo de lenguaje que aplica razonamiento de sentido común para detectar operadores que faltan, un planificador simbólico que genera planes con esos operadores y un generador de funciones de recompensa que guía al agente de RL para aprender las políticas de control correspondientes a los operadores recién identificados. No se especifican en la información disponible el número de tokens, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO, ya que esas cuestiones no aplican al componente de RL aquí publicado. Tampoco se detallan innovaciones de decodificación o atención, por tratarse de un artefacto de políticas y no de un modelo generativo.

## Capacidades

- Ejecución de políticas de control entrenadas para cuatro dominios de manipulación robótica: `coffee_box`, `coffee_drawer`, `kitchen` y `nut_assembly`.
- Reanudación de la inferencia en entornos compatibles mediante `stable-baselines3` (carga del ZIP y llamada a `predict`).
- Punto de partida para evaluación o ajuste fino de políticas en los mismos entornos, al conservarse la organización por algoritmo, configuración y semilla.
- Soporte de comparación entre variantes de entrenamiento, gracias a la presencia de checkpoints `final`, `best` y `recent` por configuración.
- No dispone de generación de texto, razonamiento en lenguaje natural, código, matemáticas ni visión, ya que no es un modelo de lenguaje ni multimodal.
- No se declara soporte de tool calling, function calling, agentes ni razonamiento multi-paso en el artefacto publicado.
- No se declaran capacidades multilingües, modo de pensamiento, audio ni ninguna capacidad especial adicional.

## Casos de uso

- Manipulación de cajas de café en simulación: cargar los checkpoints del dominio `coffee_box` en el entorno correspondiente del repositorio de código para reproducir la política entrenada y medir la tasa de éxito del agarre y la colocación.
- Apertura de cajones en tareas de servicio: usar los pesos de `coffee_drawer` como política base para tareas de manipulación articulada, útil para evaluar el comportamiento del agente al interactuar con mecanismos móviles.
- Escenarios de cocina: emplear los checkpoints de `kitchen` para experimentos de manipulación con múltiples objetos y secuencias de acciones, aprovechando que la carpeta conserva la configuración de entrenamiento original.
- Ensamblaje de tuercas: utilizar `nut_assembly` como banco de pruebas de precisión para evaluar políticas en tareas que exigen tolerancias ajustadas y control fino.
- Reproducibilidad de resultados de investigación: descargar los ZIP y colocarlos en `learning/policies/` para replicar los experimentos del artículo asociado, tanto en la rama `iros2026` como en revisiones posteriores del código.
- Línea base para comparación de métodos de adaptación a la novedad: servir como referencia frente a políticas entrenadas desde cero cuando se introduce un operador nuevo en el plan.
- Inicialización para ajuste fino: partir de `best_model.zip` o `recent_model.zip` de una tarea concreta y continuar el entrenamiento con una función de recompensa distinta, reduciendo el coste de exploración inicial.
- Docencia y divulgación en robótica: ilustrar el ciclo completo de identificar un operador ausente, generar una recompensa y obtener una política de control entrenada, usando pesos ya disponibles para evitar reentrenamientos largos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del repositorio no incluye métricas de tasa de éxito, retorno medio ni comparaciones numéricas, y tampoco se han proporcionado cifras concretas del artículo arXiv 2603.11351v1 en los resultados de búsqueda consultados. No se deben asumir valores de rendimiento para los checkpoints descargados.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El tamaño de las redes no se especifica en la model card, por lo que no puede calcularse una cifra fiable.
- GPU recomendadas: no disponible. Las políticas de Stable-Baselines3 se ejecutan habitualmente en CPU, ya que la inferencia de una política individual suele implicar redes de tamaño reducido, pero esto no puede confirmarse para estos checkpoints concretos.
- Compatibilidad con GPU de consumo: no verificada para este repositorio. En el caso general de políticas de Stable-Baselines3, la inferencia en CPU es viable, pero no hay confirmación específica para estas políticas.
- Almacenamiento: 0,5 GB para el conjunto completo de checkpoints; conviene reservar espacio adicional para el entorno de simulación y sus dependencias.
- Opciones de despliegue: carga mediante `stable-baselines3` dentro del repositorio NoveltyAdapt; la exportación a otros formatos (ONNX, TorchScript) no está documentada ni verificada.
- Latencia y throughput: no disponibles. Dependerán de la arquitectura de red, del hardware y del coste de simulación del entorno, no solo del checkpoint.
- Requisito adicional: el entorno de simulación original y sus dependencias son imprescindibles para ejecutar las políticas; sin ellos, los ZIP son solo pesos sin contexto de observación y acción.

## Comparativa con modelos similares

La comparación se plantea frente a otros repositorios de checkpoints de RL para robótica, no frente a modelos de lenguaje. Los datos de los comparadores no se han verificado en esta búsqueda y se marcan como tales.

| Repositorio | Tipo de artefacto | Dominios incluidos | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| NoveltyAdapt-policies | Checkpoints de políticas RL (SB3) | coffee_box, coffee_drawer, kitchen, nut_assembly | ZIP de Stable-Baselines3 | no disponible | 0 descargas, 0 likes |
| Stable-Baselines3 Zoo | Colección de políticas entrenadas y scripts de entrenamiento | tareas de control clásico y Atari, entre otras | ZIP de Stable-Baselines3 | no verificado en esta búsqueda | repositorio público de referencia |
| LeRobot (HuggingFace) | Políticas y datasets de robótica | múltiples tareas de manipulación | formatos propios del proyecto | no verificado en esta búsqueda | ecosistema amplio con hub propio |
| Checkpoints específicos de artículos en HuggingFace | Pesos asociados a publicaciones | variable según el trabajo | variable | habitualmente declarada | variable |

Diferencias destacables: NoveltyAdapt-policies no declara licencia, no incluye logs ni scripts de evaluación y no documenta métricas, a diferencia de colecciones mantenidas como Stable-Baselines3 Zoo, que sí publican procedimientos de reproducción. La ventaja específica de este repositorio es su vinculación directa con el método híbrido LLM más planificador simbólico más RL del artículo asociado.

## Limitaciones y advertencias

- Ausencia de licencia: no se especifica ninguna licencia en el repositorio, lo que impide determinar si el uso comercial está permitido. Cualquier uso en producción requeriría contactar con el autor.
- Trazabilidad limitada: solo se publican los ZIP de checkpoints; no hay logs de entrenamiento, buffers de replay ni ficheros de ejecución, lo que dificulta auditar cómo se obtuvieron los resultados.
- Dependencia del código y del entorno: los pesos solo tienen sentido dentro del repositorio NoveltyAdapt y de los entornos de simulación originales; sin ellos no pueden ejecutarse ni evaluarse correctamente.
- Dependencia de versiones: al usar Stable-Baselines3, cambios de versión en la librería o en las dependencias de Gymnasium pueden romper la carga o alterar el comportamiento de la política.
- Riesgo de sobreajuste al simulador: no se documentan pruebas de transferencia a hardware real (sim-to-real), por lo que el comportamiento físico real es desconocido.
- Sin validación comunitaria: 0 descargas y 0 likes en el momento de la consulta implican que no hay evidencia externa de reproducibilidad.
- Sesgos y alucinación: no aplican en el sentido habitual de un modelo generativo, pero sí existe riesgo de que la política falle fuera de la distribución de estados vista durante el entrenamiento, sin que se documenten esos límites.
- Cobertura declarada limitada a cuatro dominios: cualquier tarea fuera de `coffee_box`, `coffee_drawer`, `kitchen` y `nut_assembly` queda fuera del alcance de estos checkpoints.
- Posible discrepancia de identidad entre el autor de HuggingFace (helenlu94) y el propietario del repositorio de código en GitHub (helenlu66); conviene verificarlo antes de asumir la autoría conjunta.
- Estado de publicación: el artículo asociado es un preprint de arXiv en su versión v1 y puede no haber pasado revisión por pares.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/helenlu94/NoveltyAdapt-policies
- Repositorio de código NoveltyAdapt (rama `iros2026`): https://github.com/helenlu66/NoveltyAdapt
- Artículo asociado en arXiv: https://arxiv.org/abs/2603.11351v1
- Documentación de Stable-Baselines3: no incluida en la información proporcionada
- Demos o visualizaciones: no disponibles en la información proporcionada
