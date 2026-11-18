# Kisaragi0/SC-VLA

## Resumen

SC-VLA (Self-Correcting VLA) es un conjunto de pesos publicado en Hugging Face por el usuario Kisaragi0 bajo el título "Self-Correcting VLA: Online Action Refinement via Sparse World Imagination". Se trata de un modelo de visión-lenguaje-acción (VLA) orientado a control robótico, distribuido en dos etapas: una primera fase de "imaginación de mundo dispersa" (Sparse World Imagination, SWI) y una segunda fase de refinamiento de acción en línea (Online Action Refinement, OAR) con cabezas residuales específicas por tarea.

El repositorio contiene los checkpoints SWI (en formato safetensors, divididos en dos shards) y tres ficheros `.pt` de actores residuales para las tareas StackCube, LiftPegUpright y PlaceSphere. El tamaño total del repositorio es de 6,1 GB. No se especifican en la información disponible el número de parámetros, la longitud de contexto, los idiomas soportados ni la licencia.

La relevancia de este modelo radica en su enfoque de corrección en línea: en lugar de ejecutar una política de acción fija, combina un modelo de mundo que predice cambios de estado con un actor residual que ajusta la acción en tiempo de inferencia. Es un artefacto de investigación con muy poca documentación pública (0 descargas, 0 likes en el momento de la consulta) y sin model card extendida más allá de la tabla de componentes.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | VLA con módulo de imaginación de mundo (SWI) y actor residual (OAR); detalles internos no disponibles |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos en safetensors y `.pt`) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (SWI, dos shards) y `.pt` (actores OAR) |

## Arquitectura y entrenamiento

La información disponible describe una arquitectura en dos etapas. La etapa I, Sparse World Imagination (SWI), se distribuye como dos shards safetensors que forman un único checkpoint y requiere, además, un fichero de configuración, un índice de shards y metadatos de normalización para su carga. La etapa II, Online Action Refinement (OAR), se materializa en ficheros `.pt` que contienen los pesos de un `res_actor` (actor residual) junto con argumentos mínimos de inferencia, y debe emparejarse con el modelo SWI.

El actor residual recibe 16 entradas: el estado físico actual (8 dimensiones), el cambio de estado relativo predicho (7 dimensiones) y el progreso predicho (1 dimensión). La inferencia SWI utiliza 4 pasos de eliminación de ruido (denoising) con una replanificación cada 5 pasos, y para las tres tareas OAR se emplea una escala residual de evaluación de 0,005. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- Control robótico mediante políticas visión-lenguaje-acción: el modelo genera acciones a partir de observaciones visuales y estado físico.
- Imaginación de mundo: el módulo SWI predice cambios de estado relativo y progreso de la tarea, lo que permite anticipar el efecto de las acciones.
- Refinamiento de acción en línea: el actor residual corrige la acción propuesta por el modelo base usando la predicción del modelo de mundo.
- Soporte para tres tareas manipulativas concretas: StackCube, LiftPegUpright y PlaceSphere.
- No se ha documentado soporte de tool calling, function calling, agentes multi-paso, capacidades multilingües, modo thinking, visión general, audio ni otras capacidades de propósito general.

## Casos de uso

- Manipulación robótica de apilado de cubos (StackCube): el checkpoint OAR específico permite refinar la acción de apilado usando la predicción de cambio de estado del SWI, adecuado para entornos de laboratorio con robots de brazo.
- Manipulación de elevación de clavija (LiftPegUpright): el actor residual correspondiente ajusta la acción de agarre y elevación en tiempo de inferencia, útil en tareas de ensamblaje.
- Colocación de esfera (PlaceSphere): el checkpoint OAR de PlaceSphere permite corregir la trayectoria de colocación en línea, apropiado para tareas de precisión.
- Investigación en modelos de mundo para robótica: el módulo SWI puede emplearse como componente de predicción de dinámica para estudiar planificación basada en imaginación.
- Evaluación de refinamiento residual: el par SWI + OAR sirve como banco de pruebas para medir el efecto de la corrección en línea frente a políticas sin corrección.
- Reproducción de experimentos: al publicarse los pesos con argumentos mínimos de inferencia, permite replicar los resultados del paper asociado en las tres tareas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio ocupa 6,1 GB, pero se desconoce el reparto entre SWI y actores OAR y el pico de memoria en inferencia.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible; el tamaño del repositorio sugiere que podría caber en GPUs con 8-12 GB, pero no hay confirmación.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI; la carga requiere configuración, índice de shards y metadatos de normalización del SWI, además de los `.pt` de OAR.
- Latencia y throughput: no disponibles; se conocen 4 pasos de denoising y replanificación cada 5 pasos, pero no tiempos medidos.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables ni datos de rendimiento que permitan una comparación rigurosa.

## Limitaciones y advertencias

- Documentación mínima: la model card solo describe la estructura de directorios y parámetros de inferencia; no hay información sobre entrenamiento, datos o evaluación.
- Licencia no especificada: no se puede confirmar el uso comercial; debe contactarse con el autor antes de cualquier despliegue productivo.
- Especialización estrecha: los actores OAR están entrenados para tres tareas concretas (StackCube, LiftPegUpright, PlaceSphere), por lo que no son generalizables sin reentrenamiento.
- Dependencia de metadatos: el SWI requiere configuración, índice de shards y normalización específicos; una carga incorrecta puede producir resultados inválidos.
- Riesgo de alucinación en la predicción de mundo: el módulo SWI predice cambios de estado y progreso, y errores en esa predicción pueden propagarse al actor residual.
- Sin datos de sesgos: no hay información sobre sesgos demográficos, de dominio o de simulación a realidad.
- Madurez: 0 descargas y 0 likes en el momento de la consulta, sin señales de validación por la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/Kisaragi0/SC-VLA
- Paper, blog, repositorio o demo: no disponibles en la información proporcionada.
