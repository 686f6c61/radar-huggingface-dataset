# hrl-imerse/report-task1-act-A50

## Resumen

`report-task1-act-A50` es un checkpoint de política robótica entrenado con el algoritmo ACT (Action Chunking with Transformers) sobre el framework LeRobot, publicado por el usuario `hrl-imerse` como material de soporte para un informe académico (asignación 2 de la asignatura HRL). No se trata de un modelo de lenguaje, sino de un modelo de control visuomotor para el robot SO-101: recibe observaciones visuales y de estado del robot y emite acciones articulares. El checkpoint corresponde a la "Task 1, política A", entrenada con 50 demostraciones (45 de entrenamiento) durante 30.000 pasos, y es el que se utilizó en la evaluación formal del trabajo.

El interés de esta ficha es limitado fuera de su contexto original: es un artefacto de reproducibilidad de un trabajo de curso, no un modelo de propósito general. Su relevancia radica en que ejemplifica el flujo completo de LeRobot para entrenar políticas de imitación con ACT y en que permite reproducir los resultados del informe asociado. El repositorio ocupa 0,2 GB y contiene 51.668.614 parámetros en formato safetensors.

No hay información pública sobre la composición del dataset, la licencia, los idiomas ni el pipeline de despliegue más allá de lo indicado en la model card y las etiquetas del repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), política visuomotora sobre LeRobot |
| Parametros totales | 51.668.614 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de contexto textual; ventana de observación definida por la configuración de ACT) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; LeRobot no documenta cuantizaciones para este checkpoint) |
| Idiomas soportados | no disponible (modelo de control robótico, sin capacidades lingüísticas) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Framework | LeRobot |
| Robot objetivo | SO-101 (etiqueta `so101`) |
| Entrenamiento | 50 demostraciones (45 de train), 30.000 pasos |
| Tamaño del repositorio | 0,2 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

ACT (Action Chunking with Transformers) es una arquitectura de imitación diseñada para control visuomotor de robots de bajo coste. Combina un codificador visual (típicamente una CNN o un ViT ligero) con un transformer que predice bloques de acciones futuras ("action chunks") en lugar de una única acción por paso, lo que reduce el error de compounding y suaviza la ejecución. En este checkpoint concreto, los 51,7 millones de parámetros corresponden a la política completa tal como la guarda LeRobot.

El entrenamiento se realizó sobre 50 demostraciones teleoperadas del robot SO-101, de las cuales 45 se usaron para entrenar y el resto presumiblemente para validación, durante 30.000 pasos de optimización. No se dispone de información sobre la composición exacta del dataset, la resolución de las cámaras, la tasa de control, el uso de aumentación de datos ni si hubo ajuste fino posterior. La model card no documenta hiperparámetros, semillas ni curvas de entrenamiento; esos detalles se remiten al fichero `REPORT_HANDOFF.md` del repositorio GitHub asociado.

## Capacidades

- Control visuomotor de un robot SO-101 a partir de observaciones de cámara y estado de las articulaciones.
- Predicción de secuencias de acciones (action chunking) para tareas de manipulación aprendidas por imitación.
- Ejecución de la "Task 1" definida en el trabajo original; no se especifica en la información disponible qué tarea física concreta es.
- No soporta tool calling, function calling, razonamiento multi-paso simbólico ni generación de texto.
- No tiene capacidades multilingües ni de visión general: el codificador visual está especializado en el entorno de entrenamiento.
- No dispone de modo "thinking", audio ni otras capacidades especiales.

## Casos de uso

- Reproducción de resultados académicos: cargar el checkpoint en LeRobot y ejecutar la evaluación formal descrita en el informe para verificar las métricas publicadas.
- Punto de partida para ajuste fino: usar los pesos como inicialización para entrenar la misma tarea con más demostraciones o en un robot SO-101 equivalente.
- Comparación de políticas: contrastar esta política ACT de 50 demos con otras variantes del mismo trabajo (por ejemplo, políticas entrenadas con distinto número de demostraciones) para estudiar la relación entre datos y rendimiento.
- Docencia y aprendizaje de LeRobot: sirve como ejemplo funcional de un checkpoint ACT entrenado de principio a fin, útil para entender el formato de pesos, la configuración y el pipeline de evaluación del framework.
- Validación de infraestructura de despliegue: probar el pipeline de inferencia en tiempo real (cámaras, bucle de control, robot) antes de entrenar políticas propias.
- Análisis de robustez: evaluar cómo se degrada la política ante cambios de iluminación, posición inicial de objetos o ligeras variaciones del entorno respecto a las demostraciones originales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite las métricas de la evaluación formal al fichero `REPORT_HANDOFF.md` del repositorio GitHub `msong33/hrl_imerse` (rama `report/assignment2-final`), pero no se incluyen cifras en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint ocupa 0,2 GB en safetensors, por lo que en fp32 necesitaría aproximadamente 0,2 GB de VRAM para los pesos; el consumo real vendrá dominado por el codificador visual y los buffers de inferencia, no por la política.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM es suficiente; una RTX 3060, RTX 4090 o incluso una GPU integrada moderna pueden ejecutar la política en tiempo real.
- Cabe en GPU de consumo: sí, con amplio margen, en cualquier GPU consumer reciente.
- Opciones de despliegue: LeRobot (framework nativo del checkpoint); no se documentan exportaciones a ONNX, TensorRT ni otros runtimes.
- Latencia y throughput: no disponibles. Al ser un modelo de control, la latencia relevante es la del bucle de control del robot, que depende de la GPU, la resolución de cámara y la frecuencia de inferencia configurada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / tarea | Licencia | Disponibilidad |
|---|---|---|---|---|
| report-task1-act-A50 | 51,7 M | Task 1 sobre SO-101 (ACT, 50 demos) | no disponible | Hugging Face (0 descargas) |
| Otros checkpoints ACT de LeRobot | variable (decenas de millones) | Tareas de manipulación SO-100/SO-101 | generalmente Apache-2.0 en los oficiales | Hugging Face / LeRobot |
| Políticas Diffusion Policy | variable | Manipulación visuomotora | variable según publicación | Repositorios de investigación |
| Políticas VLA (p. ej. OpenVLA) | miles de millones | Instrucciones en lenguaje + control | variable | Hugging Face |

No se dispone de datos de rendimiento de este checkpoint que permitan una comparación cuantitativa con las alternativas; la comparación anterior es únicamente estructural.

## Limitaciones y advertencias

- Es un artefacto académico: no hay garantía de mantenimiento, soporte ni actualizaciones.
- La licencia no está especificada, lo que impide determinar si su uso comercial es lícito; debe consultarse al autor antes de cualquier uso fuera del ámbito del trabajo.
- Entrenado con solo 45 demostraciones de entrenamiento: alta probabilidad de sobreajuste al entorno, posiciones de objetos e iluminación de la grabación original.
- Sin información sobre la tarea concreta, el dataset ni las condiciones de evaluación, por lo que su reproducibilidad fuera del laboratorio original es incierta.
- Riesgo de fallo silencioso: una política de imitación puede ejecutar acciones plausibles pero incorrectas sin señal de error; requiere supervisión humana y paradas de seguridad en el robot.
- No apto para tareas distintas de la entrenada ni para otros robots sin reentrenamiento.
- Sin datos sobre sesgos del dataset de demostraciones (posiciones, objetos, condiciones de luz) que puedan trasladarse al comportamiento de la política.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere que no ha sido validado por la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/hrl-imerse/report-task1-act-A50
- Repositorio GitHub asociado: https://github.com/msong33/hrl_imerse (fichero `REPORT_HANDOFF.md`, rama `report/assignment2-final`)
- LeRobot (framework): https://github.com/huggingface/lerobot
- Paper de ACT (Action Chunking with Transformers): no disponible en la información proporcionada
