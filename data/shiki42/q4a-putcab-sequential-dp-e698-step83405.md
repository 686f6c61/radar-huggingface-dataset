# Shiki42/q4a-putcab-sequential-dp-e698-step83405

## Resumen

El modelo identificado como `Shiki42/q4a-putcab-sequential-dp-e698-step83405` es un checkpoint de inferencia de una política de difusion (diffusion policy) para control robótico, entrenado con la implementación oficial de LeRobot 0.4.4 sobre la tarea de simulación RoboTwin PutCab. Lo desarrolla el usuario Shiki42 y corresponde al experimento de entrenamiento CTR E698-R001, que finalizó con código de salida 0 tras 83.405 actualizaciones del optimizador. No es un modelo de lenguaje: es una política visomotora que mapea observaciones (imágenes y estado del robot) a secuencias de acciones, por lo que no genera texto ni mantiene conversaciones.

El checkpoint contiene únicamente los ficheros `pretrained_model` necesarios para inferencia: pesos, configuración resuelta y el estado de los preprocesadores y postprocesadores de la política. No incluye estado del optimizador, del generador de números aleatorios ni del cargador de datos, lo que lo hace apto para despliegue pero no para reanudar el entrenamiento. Los pesos suman 270.780.366 parámetros y el repositorio ocupa 1,1 GB.

Su relevancia es acotada y muy específica: se publica como artefacto para la evaluación registrada E721 de PutCab en simulación, no como modelo de propósito general. El propio autor advierte que la publicación no constituye una evaluación ni una auditoría, y que E721 exige su propia cualificación de escena congelada, entorno de ejecución, cola de acciones y sistema de puntuación antes de poder reportar una tasa de éxito. A fecha de la ficha acumula 0 descargas y 0 likes, por lo que carece de validación externa por parte de la comunidad.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion policy (política de difusión para robótica) implementada sobre LeRobot 0.4.4; arquitectura interna concreta no disponible |
| Parametros totales | 270.780.366 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (no es un modelo de lenguaje); la política opera sobre observaciones de la tarea PutCab y cola nativa de 8 acciones |
| Tipos de cuantizacion | No disponible; no se documentan versiones cuantizadas. El tamaño del repositorio (1,1 GB) es coherente con pesos en fp32 |
| Idiomas soportados | No disponible / no aplica (política robótica, no modelo lingüístico) |
| Licencia | No disponible |
| Formato de pesos | safetensors (librería `lerobot`); incluye configuración resuelta y estado de preprocesador y postprocesador |

## Arquitectura y entrenamiento

Se trata de una diffusion policy, una familia de políticas que aprenden la distribución de acciones mediante un proceso de difusión: se parte de ruido y se refina iterativamente una secuencia de acciones condicionada por las observaciones. El autor indica explícitamente el uso de la implementación oficial de LeRobot 0.4.4 (commit de código fuente `8fff0fde7c79f23a93d845d1a50e985de01f8b8a`) y que el checkpoint se cualificó en CPU comprobando la recarga limpia, los procesadores guardados, una cola nativa de ocho acciones y 100 pasos de denoising. No se detalla en la información disponible el tipo de codificador visual, el número de capas ni la composición exacta de la red.

Los datos de entrenamiento proceden del conjunto `Shiki42/PutCab-Sequential-Train50-V4`, en la revisión inmutable `c6022cf9164b34c7244dfede8ece4d20a999ab82` (cualificación E686). El dataset contiene episodios secuenciales con orden «primero izquierda» y «primero derecha» balanceados. Para este brazo experimental no CTR, la máscara IdleMask está desactivada. No se especifica el número total de tokens, episodios o frames, ni si se aplicaron etapas de RLHF o DPO (técnicas propias de modelos de lenguaje y no de este tipo de política). Se documentan tres hashes de verificación: el recibo de la ejecución de entrenamiento (`c5408db4...`), el recibo de cualificación independiente del checkpoint en CPU (`f2e853fa...`) y las estadísticas de normalización consumidas (`8011dbea...`). Cada revisión publicada se acompaña del fichero `SHA256SUMS` para verificar la integridad de los ficheros de inferencia.

## Capacidades

- Control robótico visomotor: genera secuencias de acciones para la tarea PutCab de RoboTwin a partir de observaciones, mediante muestreo por difusión con 100 pasos de denoising.
- Ejecución de tareas de manipulación secuencial, con episodios en los que se alterna el orden de actuación (izquierda primero o derecha primero) de forma equilibrada en los datos de entrenamiento.
- Cola de acciones nativa de 8 acciones, pensada para ejecución por bloques (action chunking) en el bucle de control.
- Inferencia autocontenida: el checkpoint incorpora el estado de los preprocesadores y postprocesadores, de modo que las observaciones crudas pueden transformarse al formato esperado por la política.
- Despliegue en simulación RoboTwin asociado a la evaluación registrada E721.
- Cualificación verificada del checkpoint: recarga limpia en CPU del checkpoint final y de los procesadores.
- No dispone de generación de texto, razonamiento simbólico, código, matemáticas, visión general, tool calling, capacidades de agente ni soporte multilingüe: esas categorías no aplican a este artefacto.

## Casos de uso

- Evaluación de referencia en RoboTwin PutCab: el modelo se usa como política candidata dentro de la evaluación registrada E721, que requiere congelar la escena, el entorno de ejecución, la cola de acciones y el sistema de puntuación antes de calcular una tasa de éxito.
- Reproducción de experimentos de diffusion policy: al publicarse junto a los recibos SHA-256 del entrenamiento y de la cualificación, permite reproducir y auditar la cadena de procedencia de un entrenamiento concreto con LeRobot 0.4.4.
- Estudio de tareas secuenciales con orden de actuación variable: el dataset de entrenamiento equilibra episodios «izquierda primero» y «derecha primero», por lo que el checkpoint sirve para analizar hasta qué punto una política de difusión aprende a generalizar sobre el orden de las subtareas.
- Comparación de brazos experimentales: al declararse explícitamente como brazo no CTR con IdleMask desactivado, es útil como punto de comparación frente a variantes con máscara de inactividad u otros tratamientos del mismo dataset.
- Punto de partida para ajuste fino: los 270,7 millones de parámetros y el formato safetensors permiten cargar el modelo en LeRobot y continuar el entrenamiento desde los pesos, sabiendo que habrá que reconstruir el estado del optimizador y del cargador de datos, no incluidos.
- Validación de infraestructura de despliegue robótico: la presencia de los procesadores guardados y de una cola nativa de 8 acciones lo convierte en un caso útil para probar canalizaciones de inferencia que verifiquen hashes antes de ejecutar.
- Docencia y prototipado en robótica: con 270,7 millones de parámetros, el modelo cabe en GPUs de consumo, lo que facilita montar prácticas o demostraciones de políticas de difusión sin acceso a clústeres.
- Verificación de integridad de artefactos: el uso previsto por el autor incluye comprobar el contenido de `SHA256SUMS` sobre una revisión fijada del repositorio antes de cualquier inferencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica expresamente que la publicación del checkpoint no equivale a una evaluación ni a una aprobación de auditoría, y que la evaluación E721 exige su propia cualificación de escena congelada, entorno de ejecución, cola de acciones y sistema de puntuación antes de poder reportar una tasa de éxito. No se dispone, por tanto, de tasa de éxito en PutCab ni de métricas comparables.

## Requisitos de hardware

- VRAM estimada para inferencia (cálculo a partir de los 270.780.366 parámetros, sin contar activaciones ni memoria de trabajo): aproximadamente 1,08 GB en fp32, 0,54 GB en fp16/bf16 y 0,27 GB en int8. El repositorio de 1,1 GB es coherente con pesos en fp32.
- Memoria adicional necesaria para el muestreo por difusión (100 pasos de denoising y cola de 8 acciones) y para las observaciones de la simulación: no cuantificada en la información disponible.
- GPU recomendadas: no disponible. Por tamaño, cualquier GPU con al menos 4-8 GB de VRAM debería poder alojar los pesos; no se documenta ninguna validación de rendimiento en GPU concreta (A100, H100, RTX 4090 u otras).
- Cabe en GPU de consumo: muy probablemente sí, dado el tamaño del modelo; no se especifican modelos concretos ni resultados medidos.
- Opciones de despliegue: la librería declarada es `lerobot` (LeRobot 0.4.4), junto con safetensors. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que además no son aplicables a una política robótica de este tipo.
- Latencia y throughput: no disponibles. El autor solo menciona 100 pasos de denoising y una cola nativa de 8 acciones, sin tiempos medidos.
- Entorno de ejecución previsto: simulación RoboTwin, con escena y runtime cualificados por separado en la evaluación E721.

## Comparativa con modelos similares

No se dispone en la información proporcionada de datos de modelos comparables (parámetros, contexto, rendimiento, licencia o disponibilidad). Como referencias de la misma categoría pueden citarse la Diffusion Policy original, la política ACT y otras políticas visomotoras del ecosistema LeRobot, pero no se han facilitado cifras que permitan una comparación rigurosa.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Shiki42/q4a-putcab-sequential-dp-e698-step83405 | 270.780.366 | No aplica (cola de 8 acciones) | Sin benchmarks publicados | No disponible | HuggingFace, 0 descargas |
| Diffusion Policy (referencia de la familia) | No disponible | No disponible | No disponible | No disponible | No disponible |
| ACT (referencia de la familia) | No disponible | No disponible | No disponible | No disponible | No disponible |
| Otras políticas de LeRobot | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Licencia no disponible: no puede determinarse si se permite el uso comercial, la redistribución o la modificación. Cualquier uso en producción queda condicionado a aclarar este punto con el autor.
- Alcance extremadamente restringido: es un checkpoint de inferencia para una única tarea de simulación (RoboTwin PutCab) y no un modelo de propósito general. No debe esperarse transferencia directa a tareas, morfologías o escenas distintas.
- Sin evaluación publicada: no hay tasa de éxito, benchmarks ni validación independiente de rendimiento. La publicación no implica aprobación de auditoría según el propio autor.
- Brecha simulación-realidad: el entrenamiento y la evaluación prevista se realizan en simulación; no se documenta ningún resultado en robot físico.
- Validación comunitaria nula: 0 descargas y 0 likes en el momento de redactar esta ficha, sin incidencias ni casos de uso reportados por terceros.
- Riesgo de alucinación: no aplica en el sentido lingüístico, pero sí existe riesgo de generalización incorrecta de la política ante observaciones fuera de la distribución de entrenamiento, con acciones erráticas o bloqueos.
- Dependencia estricta de la procedencia: el autor exige usar una revisión fijada del repositorio y verificar los hashes de `SHA256SUMS` antes de inferir; ignorarlo invalida cualquier resultado.
- No reanudable para entrenamiento: al no incluir estado del optimizador, del RNG ni del cargador de datos, no puede continuarse el entrenamiento exactamente donde se dejó.
- Configuración experimental específica: brazo no CTR con IdleMask desactivado y dataset secuencial equilibrado; los resultados no son extrapolables a otras variantes del mismo experimento.
- Idiomas: no disponible / no aplica; el modelo no procesa ni genera lenguaje.
- Fecha de creación registrada en 2026-09-24, posterior a la fecha de publicación de muchos de los artefactos de referencia; conviene verificar la coherencia temporal de la cadena de procedencia si se va a citar.
- La búsqueda web realizada no devolvió ningún resultado relevante sobre este modelo: los enlaces recuperados no guardan relación con robótica, LeRobot ni políticas de difusión, por lo que no se incluyen como fuentes.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Shiki42/q4a-putcab-sequential-dp-e698-step83405
- Dataset de entrenamiento: https://huggingface.co/datasets/Shiki42/PutCab-Sequential-Train50-V4 (revisión `c6022cf9164b34c7244dfede8ece4d20a999ab82`)
- LeRobot (librería y código fuente): https://github.com/huggingface/lerobot (commit citado: `8fff0fde7c79f23a93d845d1a50e985de01f8b8a`)
- RoboTwin (entorno de simulación de la tarea PutCab): no disponible en la información proporcionada
- Paper de diffusion policy: no disponible en la información proporcionada
- Demos o spaces: no disponible
- Resultados de la búsqueda web: sin enlaces relevantes; los resultados obtenidos no están relacionados con el modelo ni con robótica
