# Dongkkka/groot-task0003-v4-40k

## Resumen

groot-task0003-v4-40k es un checkpoint de política robótica perteneciente a la familia GR00T N1.7, publicado por el usuario Dongkkka en HuggingFace. Se trata de los pesos de una política entrenada durante 40.000 pasos de optimizador acumulados sobre la tarea denominada Task0003 SeparateRecycling, un escenario de manipulación y separación de residuos. No es un modelo de lenguaje conversacional, sino un checkpoint de inferencia destinado a controlar un robot dentro de un runtime compatible con Isaac-GR00T N1.7.

El modelo ocupa 3.144.016.000 parámetros (unos 3,14 mil millones) y se distribuye en safetensors con un tamaño de repositorio de 12,6 GB. Según su model card, la inicialización visual corresponde a un codificador afinado con visión (V4) que permaneció congelado durante el entrenamiento de la política, y la configuración referencia nvidia/Cosmos-Reason2-2B para la arquitectura del backbone y los assets del procesador, que deben ser accesibles en tiempo de ejecución. La pérdida de entrenamiento registrada en el paso 40.000 es de 0,0135, un dato que el propio autor advierte que es una métrica de entrenamiento y no un resultado de evaluación sobre un conjunto reservado.

Su relevancia actual es acotada y muy específica: sirve como referencia reproducible para quien trabaje con la versión N1.7 del stack GR00T, como punto de partida para ajuste fino en tareas de clasificación y manipulación de residuos, y como artefacto de investigación en transferencia sim-a-real. El repositorio no registra descargas ni interacciones, no declara licencia, no declara idiomas y no incluye resultados de benchmarks, por lo que debe tratarse como un checkpoint de investigación sin garantías de producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Policy de robótica GR00T N1.7 (vision-language-action); la configuración referencia nvidia/Cosmos-Reason2-2B para el backbone y los assets del procesador |
| Parámetros totales | 3.144.016.000 (3,14 mil millones) |
| Parámetros activos | No aplica: no se declara arquitectura de mezcla de expertos |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No declarados en la model card; se distribuyen pesos en safetensors, sin variantes GGUF, AWQ ni GPTQ publicadas |
| Idiomas soportados | No disponible (checkpoint de política robótica; no se declaran capacidades lingüísticas) |
| Licencia | No disponible |
| Formato de pesos | safetensors (shards e índice) |
| Pipeline declarado | robotics |
| Pasos de optimización acumulados | 40.000 |
| Pérdida de entrenamiento en el paso 40.000 | 0,0135 (métrica de entrenamiento, no de evaluación) |
| Inicialización visual | Codificador V4 afinado con visión, congelado durante el entrenamiento de la política |
| Contenido del repositorio | Shards e índice de pesos, configuración de modelo y procesador, mapeo de embodiment y estadísticas de normalización |
| Contenido excluido | Estado del optimizador, scheduler, estado del RNG y registros de entrenamiento |
| Tamaño del repositorio | 12,6 GB |
| Fecha de creación | 2026-09-16 |
| Fecha de última actualización | 2026-09-16 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La información disponible describe un checkpoint de política de la familia GR00T N1.7, es decir, un modelo de acción condicionado por observación visual y por la definición de tarea. El backbone y los assets del procesador se referencian explícitamente a nvidia/Cosmos-Reason2-2B, repositorio que debe ser accesible para poder cargar el modelo. La parte visual parte de un codificador V4 afinado con visión que quedó congelado durante todo el entrenamiento de la política, de modo que el ajuste se concentró en el resto del modelo. La model card no detalla el número total de tokens vistos, la composición del dataset de entrenamiento ni si se emplearon técnicas de alineación como RLHF o DPO.

El entrenamiento se realizó sobre la tarea Task0003, correspondiente a SeparateRecycling, hasta alcanzar 40.000 pasos de optimizador acumulados. El único dato de pérdida aportado es 0,0135 en ese paso, y el propio autor subraya que no constituye un resultado de evaluación sobre datos reservados. El repositorio incluye el mapeo de embodiment y las estadísticas de normalización, así como las definiciones de modalidad de la Task0003 dentro de processor_config.json, lo que indica que la política está ligada a una configuración concreta de robot y de sensores. No se incluyen estado del optimizador, scheduler ni estado del RNG, por lo que el checkpoint no permite reanudar el entrenamiento exactamente en el punto 40.000, solo realizar inferencia o iniciar un ajuste fino nuevo.

## Capacidades

- Generación de acciones de manipulación robótica: el checkpoint produce políticas de control para la tarea Task0003 SeparateRecycling, orientada a la separación y clasificación de residuos.
- Condicionamiento por observación visual: emplea un codificador visual V4 afinado con visión, congelado durante el entrenamiento de la política.
- Integración con un runtime específico: está pensado para cargarse en un runtime compatible con Isaac-GR00T N1.7, no en servidores de inferencia de modelos de lenguaje.
- Mapeo de embodiment incluido: el repositorio incorpora la correspondencia entre las articulaciones o efectores del robot y las salidas de la política.
- Normalización de observaciones y acciones: incluye estadísticas de normalización necesarias para reproducir el preprocesado del entrenamiento.
- Definiciones de modalidad por tarea: processor_config.json contiene las definiciones de modalidad de Task0003.
- Ajuste fino posterior: al excluir el estado del optimizador, el checkpoint es utilizable como inicialización para nuevos entrenamientos.
- No se declaran capacidades de tool calling, function calling, razonamiento multi-paso en lenguaje natural, visión general, audio ni modo de pensamiento. No hay datos sobre capacidades multilingües.

## Casos de uso

- Ajuste fino para tareas de reciclaje: el checkpoint sirve como inicialización para entrenar variantes de la política en escenarios de separación de residuos con cambios de iluminación, disposición de objetos o utillaje, aprovechando que parte de los 40.000 pasos ya consolidan representaciones visuales de la tarea.
- Referencia reproducible de GR00T N1.7: un equipo que evalúe la versión N1.7 del stack puede cargar este checkpoint para replicar el comportamiento descrito en la model card y compararlo con sus propios entrenamientos bajo las mismas condiciones de tarea y embodiment.
- Evaluación en simulación con Isaac Sim o Isaac Lab: al requerir un runtime Isaac-GR00T, el caso natural es desplegar la política en un entorno simulado que reproduzca el embodiment y las modalidades definidas en processor_config.json, midiendo tasas de éxito por episodio.
- Investigación en transferencia sim-a-real: el checkpoint permite estudiar la brecha entre política entrenada y ejecución física en un banco de manipulación, comparando el comportamiento observado con el de políticas base.
- Generación de rollouts para aprendizaje por imitación: las trayectorias producidas por la política pueden registrarse y filtrarse para alimentar entrenamientos posteriores o para análisis de modos de fallo.
- Punto de partida para destilación: dado su tamaño de 3,14 mil millones de parámetros, resulta candidato a destilarse en políticas más pequeñas que reduzcan los requisitos de cómputo en el bucle de control.
- Auditoría de artefactos de entrenamiento: la inclusión de estadísticas de normalización y mapeo de embodiment permite verificar la coherencia entre los pesos y la configuración declarada antes de integrarlos en un pipeline mayor.
- Banco de pruebas de runtimes: útil para validar que una implementación concreta del runtime Isaac-GR00T N1.7 carga correctamente shards, índice, configuración de procesador y dependencia de Cosmos-Reason2-2B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El único valor numérico aportado es la pérdida de entrenamiento de 0,0135 en el paso 40.000, que el autor identifica explícitamente como métrica de entrenamiento y no como resultado de evaluación sobre un conjunto reservado. No hay tasas de éxito por tarea, ni comparaciones con otras políticas, ni métricas de latencia o throughput.

## Requisitos de hardware

- Peso de los parámetros: 3,14 mil millones de parámetros. En fp32 suponen aproximadamente 12,6 GB, coherente con el tamaño del repositorio de 12,6 GB. Estas cifras son una estimación aritmética a partir del recuento de parámetros, no un dato declarado por el autor.
- VRAM estimada solo para pesos: en torno a 12,6 GB en fp32, unos 6,3 GB en fp16 o bf16, unos 3,1 GB en int8 y unos 1,6 GB en int4. Son estimaciones por tamaño de parámetro y no cuantizaciones publicadas, ya que el repositorio solo ofrece safetensors.
- VRAM adicional necesaria: hay que sumar el coste de activaciones, el runtime de simulación o control, los assets de Cosmos-Reason2-2B y el bucle de inferencia. Esta parte no está cuantificada en la información disponible.
- GPU: no disponible. La model card no especifica GPU objetivo. Con 12,6 GB de pesos en fp32, una GPU de 24 GB como la RTX 4090 podría albergarlos, pero no hay confirmación oficial.
- GPU de consumo: plausible únicamente por capacidad de memoria, no confirmado. Un despliegue real depende del runtime Isaac-GR00T y del simulador, cuyo consumo no se detalla.
- Opciones de despliegue: runtime compatible con Isaac-GR00T N1.7. No hay soporte declarado para vLLM, llama.cpp, Ollama, TGI ni servidores equivalentes de modelos de lenguaje, y no se publican pesos en GGUF.
- Dependencias de ejecución: la configuración referencia nvidia/Cosmos-Reason2-2B, que debe ser accesible para cargar el modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos comparativos verificables para este checkpoint. La alternativa más directa serían otros checkpoints de política GR00T N1.7, incluidos los de la propia familia publicada por NVIDIA y otros checkpoints de la misma tarea o de tareas próximas, pero la información proporcionada no incluye parámetros, contexto, resultados ni licencia de ninguno de ellos, por lo que no es posible construir una comparación con cifras.

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| groot-task0003-v4-40k | 3.144.016.000 | No disponible | Solo pérdida de entrenamiento 0,0135 en el paso 40.000 | No disponible | HuggingFace, repo de 12,6 GB |
| Otros checkpoints GR00T N1.7 | No disponible | No disponible | No disponible | No disponible | No disponible en la información recibida |
| Políticas VLA alternativas | No disponible | No disponible | No disponible | No disponible | No disponible en la información recibida |

## Limitaciones y advertencias

- Licencia no declarada: no se especifica ninguna licencia, lo que impide asumir derechos de uso comercial, redistribución o modificación. Es un bloqueo serio para cualquier integración en producción.
- Ausencia de evaluación: no hay resultados sobre conjuntos reservados ni tasas de éxito por tarea. La pérdida de 0,0135 es una métrica de entrenamiento y no permite inferir el rendimiento real de la política.
- Especialización estrecha: el checkpoint está entrenado para la Task0003 SeparateRecycling con un embodiment y unas modalidades concretas. No hay indicios de generalización a otras tareas, objetos o configuraciones de robot.
- Sin datos sobre el dataset: se desconoce la composición, el volumen y la procedencia de los datos de entrenamiento, por lo que no se pueden evaluar sesgos ni cobertura de escenarios.
- Riesgo de sobreajuste al entorno de entrenamiento: al tratarse de 40.000 pasos sobre una única tarea y con el codificador visual congelado, es esperable un comportamiento frágil ante cambios de iluminación, fondo, cámara o dinámica del robot. Esta afirmación es una advertencia general de este tipo de políticas, no un resultado medido.
- Dependencia de un runtime concreto: solo es cargable con un runtime compatible con Isaac-GR00T N1.7, y requiere acceso a nvidia/Cosmos-Reason2-2B. Esto descarta los servidores de inferencia habituales para modelos de lenguaje.
- Imposibilidad de reanudar el entrenamiento: al excluirse el estado del optimizador, el scheduler y el estado del RNG, no se puede continuar el entrenamiento exactamente desde el paso 40.000.
- Repositorio sin tracción: cero descargas y cero likes, sin validación por parte de la comunidad, lo que aumenta el riesgo de que la configuración o los pesos tengan problemas no documentados.
- Fecha de creación inusual: el repositorio está fechado el 2026-09-16, una fecha que conviene verificar antes de tratarlo como referencia cronológica fiable.
- Sin información sobre idiomas: no se declaran idiomas soportados, algo esperable en una política robótica, pero relevante si se pretendiese reutilizar el backbone para tareas de lenguaje.
- Resultados de búsqueda web no pertinentes: las búsquedas realizadas devolvieron páginas sobre Google Maps y la ciudad de Redmond (Washington), sin relación con el modelo. No se han podido localizar paper, blog técnico ni demo asociados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Dongkkka/groot-task0003-v4-40k
- Repositorio de backbone referenciado en la configuración: https://huggingface.co/nvidia/Cosmos-Reason2-2B
- Paper, blog técnico, repositorio de código o demo del autor: no disponibles en la información proporcionada.
