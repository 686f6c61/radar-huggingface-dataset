# jc1122/circuit-atlas-snapshots

## Resumen

`jc1122/circuit-atlas-snapshots` no es un modelo de lenguaje generativo, sino un repositorio de artefactos de investigación para interpretabilidad mecanicista. Contiene checkpoints intermedios de entrenamiento (cada 2.500 pasos) de las redes PART y TRAIN que sustentan el "mechanistic interpretability circuit atlas", un proyecto que cataloga los circuitos que las redes neuronales convergen a aprender en tareas algorítmicas, con referencias construidas a mano y formas cerradas verificadas.

El repositorio está pensado para el análisis de dinámicas de entrenamiento: cuándo aparece cada variable del algoritmo en los pesos, en qué paso se produce el fenómeno de grokking y en qué momento se produce la memorización frente a la generalización. Incluye snapshots de ejecuciones fallidas e inacabadas, lo que lo hace útil para estudiar modos de fallo, no solo trayectorias exitosas.

Con 17,1 GB de tamaño, los pesos se empaquetan en safetensors, con un conjunto de tensores por semilla. Las redes finales y las mejores publicadas están en el repositorio hermano `jc1122/circuit-atlas-nets`; este repositorio se centra exclusivamente en los estados intermedios. La licencia es CC BY 4.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (redes PART y TRAIN del proyecto circuit atlas, orientadas a tareas algorítmicas) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors empaquetados, sin variantes GGUF ni cuantizadas) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | cc-by-4.0 |
| Formato de pesos | safetensors empaquetados, un conjunto de tensores por semilla |
| Tamano del repositorio | 17,1 GB |
| Frecuencia de snapshots | cada 2.500 pasos de entrenamiento |
| Estructura de rutas | `runs/<task>/<run>/<cell>_s<step>_s<seeds>.safetensors` |
| Indice | `INDEX.tsv` (mapea run a task y nombre de log de entrenamiento) |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-11-07 |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna de las redes PART y TRAIN (número de capas, dimensión de los embeddings, mecanismo de atención o si se trata de transformers pequeños). Lo que sí se documenta es el propósito: son redes entrenadas sobre tareas algorítmicas cuyo comportamiento se estudia mediante interpretabilidad mecanicista, con el objetivo de identificar los circuitos concretos a los que converge el entrenamiento y contrastarlos con formas cerradas verificadas y referencias construidas manualmente.

El repositorio recoge la trayectoria de entrenamiento completa por semillas: snapshots cada 2.500 pasos que permiten localizar el paso de grokking (transición de memorización a generalización), la aparición progresiva de variables del algoritmo en los circuitos y las diferencias entre semillas. Se incluyen también ejecuciones fallidas e inacabadas, lo que aporta valor para el estudio de dinámicas de entrenamiento y de modos de fallo. No se especifican en la información proporcionada el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO (en tareas algorítmicas de este tipo, habitualmente no aplica).

## Capacidades

- Almacenamiento de checkpoints intermedios de entrenamiento para análisis de dinámicas (cada 2.500 pasos).
- Soporte de múltiples semillas por configuración, con tensores empaquetados por semilla.
- Trazabilidad de ejecuciones mediante `INDEX.tsv`, que enlaza cada run con su tarea y su log de entrenamiento.
- Inclusión de ejecuciones fallidas e inacabadas para el estudio de modos de fallo.
- Base para localizar el paso de grokking y la transición entre memorización y generalización.
- Base para el análisis de aparición de variables algorítmicas en los circuitos aprendidos.
- No es un modelo generativo: no soporta generación de texto, tool calling, agentes, visión, audio ni capacidades multilingües.

## Casos de uso

- Análisis de grokking: cargar los snapshots sucesivos de una misma semilla y medir la evolución de la precisión en validación frente a la de entrenamiento para identificar el paso exacto de la transición, aprovechando la granularidad de 2.500 pasos.
- Localización temporal de circuitos: comparar los tensores de snapshots tempranos y tardíos para determinar en qué momento emerge cada subcircuito asociado a una variable del algoritmo, usando las referencias del atlas como patrón de comparación.
- Estudio de variabilidad entre semillas: al empaquetar varios conjuntos de tensores por semilla en el mismo fichero, permite medir si el circuito converge al mismo mecanismo o a soluciones distintas según la inicialización.
- Análisis de memorización: usar los snapshots previos al grokking para estudiar qué representaciones sostienen la memorización antes de que aparezca la generalización.
- Estudio de modos de fallo: los snapshots de ejecuciones fallidas permiten comparar trayectorias que no convergen con las que sí lo hacen, para caracterizar qué condiciones de entrenamiento impiden la formación del circuito esperado.
- Reproducibilidad de investigación: el mapeo `INDEX.tsv` entre runs, tareas y logs permite reconstruir experimentos completos y verificar resultados publicados en el proyecto del atlas.
- Docencia en interpretabilidad: servir de material de partida para ejercicios prácticos de análisis de circuitos con checkpoints intermedios reales, sin necesidad de reentrenar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- No aplica inferencia en el sentido habitual: son checkpoints para análisis, no un modelo desplegable.
- Almacenamiento: 17,1 GB para el repositorio completo; conviene prever espacio adicional para copias de trabajo y resultados de análisis.
- Memoria: depende del tamaño de cada red PART/TRAIN, que no se especifica en la información disponible; para cargar un snapshot individual basta con memoria suficiente para un conjunto de tensores, no para el repositorio entero.
- GPU: no se especifican requisitos; para análisis de activaciones y pesos, una GPU consumer con suficiente VRAM para la red concreta puede ser suficiente, aunque no hay datos publicados que lo confirmen.
- Despliegue: no aplica vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje. El acceso se realiza cargando ficheros safetensors con bibliotecas como `safetensors` o frameworks de deep learning.
- Latencia y throughput: no disponibles (no es un modelo de inferencia interactiva).

## Comparativa con modelos similares

| Repositorio | Contenido | Formato | Licencia | Uso previsto |
|---|---|---|---|---|
| `jc1122/circuit-atlas-snapshots` | Checkpoints intermedios cada 2.500 pasos, incluidas ejecuciones fallidas | safetensors empaquetados por semilla | CC BY 4.0 | Análisis de dinámicas de entrenamiento |
| `jc1122/circuit-atlas-nets` | Redes publicadas (mejores y finales) | no disponible | no disponible | Referencia de circuitos convergidos |
| Modelos de lenguaje open source (p. ej. familias tipo Llama, Mistral, Qwen) | Pesos de modelos generativos | safetensors, GGUF | variables | Inferencia y generación |

La comparación con modelos de lenguaje no es pertinente: este repositorio es un artefacto de investigación en interpretabilidad mecanicista, no un modelo para tareas de NLP. No se dispone de información sobre otros repositorios de snapshots equivalentes para establecer una comparativa técnica más detallada.

## Limitaciones y advertencias

- No es un modelo utilizable para inferencia: no genera texto ni resuelve tareas de NLP.
- La información pública no detalla arquitectura, número de parámetros ni hiperparámetros de entrenamiento, lo que limita la evaluación previa sin inspeccionar los tensores.
- Incluye ejecuciones fallidas e inacabadas de forma deliberada; quien lo use debe filtrar por run según sus objetivos.
- El valor del repositorio depende del código y las referencias del proyecto del atlas; sin ellos, los snapshots son difíciles de interpretar de forma aislada.
- Sin descargas ni likes en el momento de la consulta: no hay evidencia de validación por parte de la comunidad.
- Licencia CC BY 4.0: permite uso comercial y modificaciones con atribución; conviene revisar los términos exactos si se redistribuyen los pesos.
- No se especifican sesgos, riesgos de alucinación ni limitaciones idiomáticas porque no aplican a un modelo de lenguaje; cualquier uso que se haga de los circuitos analizados debe considerar las limitaciones propias de las tareas algorítmicas estudiadas.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/jc1122/circuit-atlas-snapshots
- Redes publicadas (mejores y finales): https://huggingface.co/jc1122/circuit-atlas-nets
- Repositorio GitHub del proyecto: https://github.com/jc1122/mechanistic-interpretability-circuit-atlas
- Entradas del atlas (referencias y formas cerradas): https://github.com/jc1122/mechanistic-interpretability-circuit-atlas/tree/main/entries
