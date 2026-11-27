# Muki182/ade-semantic-head-qwen3-0.6b

## Resumen

ADE Semantic Head Qwen3-0.6B es un conjunto de cabezas de clasificación ligeras (lineales y de centroides) que operan sobre las representaciones congeladas del modelo de embeddings Qwen/Qwen3-Embedding-0.6B, de 1024 dimensiones. Lo desarrolla el usuario Muki182 como capa de enrutamiento e inyección semántica dentro del sistema ADE (mandate-1), y no es un modelo generativo: no produce texto, sino decisiones de clasificación sobre frases de entrada.

El paquete resuelve un problema concreto de orquestación: decidir la fuente de una consulta, la categoría de error, la escena de escritorio activa, si una respuesta corrige a la anterior y si un candidato recuperado es relevante. Cada una de esas tareas se implementa como una cabeza independiente almacenada en JSON, lo que permite ejecución en CPU sin GPU y con latencia mínima, algo relevante para un componente que se invoca en cada turno del runtime.

Su interés actual reside en que demuestra una estrategia de bajo coste para añadir señal semántica a un enrutador basado en palabras clave: según las métricas del autor, combinar keyword matching con estas cabezas eleva la exactitud de 0,500 a 0,737 y reduce a cero la tasa de falsos positivos en la cabeza de capacidad, frente a 0,25 con el encoder alternativo bge-small.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cabezas lineales y de centroides sobre embeddings congelados de Qwen3-Embedding-0.6B (1024 dimensiones) |
| Parametros totales | No disponible (el modelo base Qwen3-Embedding-0.6B tiene 0,6 mil millones; las cabezas son lineales/centroides) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del encoder base; no se documenta en la model card) |
| Tipos de cuantizacion | No disponible (las cabezas son ficheros JSON; el encoder base admite las cuantizaciones de Qwen3-Embedding) |
| Idiomas soportados | Chino (zh) e inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | JSON (head.json, category_head.json, scene_head.json, correction_head.json, capability_head.json) |

## Arquitectura y entrenamiento

El sistema no entrena el encoder: congela Qwen/Qwen3-Embedding-0.6B y aprende cinco cabezas separadas sobre sus embeddings de 1024 dimensiones. La cabeza de fuente es lineal con temperatura 1,0 y decide entre cinco clases; la de categoría de error es un gate de centroide más cercano; las de escena, corrección y capacidad emplean el mismo esquema ligero, y la de capacidad opera sobre características de pares de 4x1024 dimensiones (consulta y candidato concatenados). El cargador del repositorio (`src/ade/semantic_model.py`) rechaza cualquier cabeza cuya dimensión registrada o nombre de encoder no coincida con el encoder activo, lo que evita desalineaciones silenciosas.

El corpus de entrenamiento es pequeño y específico del dominio: 105 frases de fuente (2100 tras expansión determinista de prefijos y sufijos), 249 filas de categoría, 112 de escena, 80 de corrección y 1920 de capacidad. El autor reporta que la evaluación se hizo con sondas independientes y un filtro de fuga de n-gramas de 6 gramos limpio, y que la elección del encoder se basó en la generalización a nivel de cabeza, no en el conjunto de desarrollo de 38 filas. No se documenta uso de RLHF, DPO ni ajuste fino del encoder.

## Capacidades

- Clasificación de fuente en cinco vías para decidir el origen de una consulta (cabeza `head.json`).
- Detección de categoría de error mediante centroide más cercano (`category_head.json`).
- Clasificación de escena de escritorio en siete clases: editor, navegador, terminal, ofimática, datos, diseño y sistema operativo (`scene_head.json`).
- Detección de corrección: determina si una respuesta corrige a la anterior, con recall 0,917 y tasa de falsos positivos 0,00 en las sondas del autor.
- Filtrado de relevancia de candidatos recuperados sobre características de pares 4x1024, con recall 0,80 y tasa de falsos positivos 0,00.
- Ejecución en CPU sin GPU, pensada como capa de inyección por defecto en un host sin acelerador.
- Soporte multilingüe limitado a chino e inglés.
- No soporta generación de texto, tool calling, agentes ni razonamiento multi-paso: es un clasificador, no un modelo de lenguaje generativo.

## Casos de uso

- Enrutamiento de consultas en un asistente de escritorio: la cabeza de fuente decide si la petición proviene de un editor, del navegador o de otro canal, y el runtime carga el contexto adecuado antes de invocar al modelo generativo.
- Gestión de errores en pipelines de agentes: la cabeza de categoría clasifica el fallo (por ejemplo, de herramienta o de razonamiento) y permite seleccionar la estrategia de recuperación sin coste de GPU.
- Detección de correcciones en conversaciones multi-turno: cuando el usuario rectifica una respuesta anterior, la cabeza de corrección lo identifica con recall 0,917 y permite reescribir el estado en lugar de acumular contexto contradictorio.
- Filtrado de recuperación aumentada (RAG): la cabeza de capacidad descarta candidatos irrelevantes antes de inyectarlos en el prompt, con tasa de falsos positivos 0,00, lo que reduce el riesgo de envenenamiento del contexto.
- Conmutación de escena en entornos de escritorio: la cabeza de escena identifica si el usuario está en un editor, una terminal o una hoja de cálculo y ajusta las herramientas disponibles en consecuencia.
- Despliegue en hosts sin GPU o en el borde: al ser cabezas JSON sobre embeddings congelados, el componente puede ejecutarse íntegramente en CPU como paso previo a un modelo mayor alojado en otro servicio.
- Sustitución de reglas de palabras clave en sistemas existentes: el autor mide una mejora de exactitud de 0,500 a 0,737 al combinar keyword matching con estas cabezas, lo que permite migrar un enrutador heurístico sin reentrenar el encoder.

## Benchmarks y rendimiento

Métricas de las cabezas sobre sondas independientes con filtro de fuga de n-gramas limpio, según la model card:

| Cabeza | Qwen3 (este paquete) | bge-small |
|---|---|---|
| Fuente (30 sondas) | 96,7 % | 80,0 % |
| Escena (28 sondas) | 92,9 % | 75,0 % |
| Categoría (14 sondas) | 85,7 % | 64,3 % |
| Corrección (recall / FPR) | 0,917 / 0,00 | 1,00 / 0,00 |
| Capacidad (recall / FPR) | 0,80 / 0,00 | 0,85 / 0,25 |

Línea base de clase mayoritaria en fuente: 29,5 %.

Efecto medido sobre el runtime en un conjunto de desarrollo de 38 filas:

| Configuración | Exactitud | Recall | Precisión |
|---|---|---|---|
| Solo palabras clave | 0,500 | 0,407 | 0,688 |
| Palabras clave + estas cabezas | 0,737 | 0,852 | 0,767 |
| Palabras clave + cabezas bge | 0,789 | 0,852 | 0,852 |

No se han publicado resultados en benchmarks estándar (MMLU, HumanEval, GSM8K) porque el modelo no es generativo.

## Requisitos de hardware

- VRAM estimada: no disponible para las cabezas (son ficheros JSON); el encoder Qwen3-Embedding-0.6B requiere memoria según cuantización, no documentada en la model card.
- GPU recomendadas: no disponibles; el caso de uso declarado es un host solo CPU.
- Cabe en GPU de consumo: el encoder base de 0,6 mil millones es apto para GPUs de consumo en cuantizaciones habituales, aunque el autor no publica cifras.
- Opciones de despliegue: carga mediante `src/ade/semantic_model.py` del repositorio ADE; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; al tratarse de cabezas lineales y de centroides sobre embeddings congelados, el coste dominante es el cálculo del embedding de entrada.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ADE Semantic Head Qwen3-0.6B | Cabezas de clasificación sobre embeddings | No disponible (base 0,6 B) | No disponible | Apache 2.0 | Hugging Face, 0 descargas |
| ADE Semantic Head bge-small (referencia del autor) | Cabezas de clasificación sobre embeddings | No disponible | No disponible | No disponible | Mencionado en la model card como fallback |
| Qwen/Qwen3-Embedding-0.6B | Modelo de embeddings | 0,6 B | No disponible | No disponible en la información | Hugging Face (modelo base) |

La comparación se limita a las alternativas citadas por el autor; no se dispone de datos de otros paquetes de cabezas de clasificación comparables.

## Limitaciones y advertencias

- Corpus de entrenamiento muy reducido (105 frases de fuente, 249 de categoría, 112 de escena, 80 de corrección), lo que limita la generalización fuera del dominio de ADE.
- Evaluación basada en sondas pequeñas (30, 28 y 14 ejemplos en varias cabezas) y en un conjunto de desarrollo de 38 filas; los intervalos de confianza de las métricas son amplios.
- Solo chino e inglés; no hay soporte documentado de castellano ni de otros idiomas.
- No es un modelo generativo: no puede usarse para texto, código, matemáticas ni razonamiento; su uso está acotado al enrutamiento y la clasificación.
- Riesgo de deriva si se cambia el encoder: el cargador rechaza cabezas con dimensión o nombre de encoder distintos, pero cualquier actualización del modelo base exige regenerar las cabezas.
- La cabeza de capacidad tiene recall 0,80, inferior al 0,85 de bge-small; el autor prioriza la tasa de falsos positivos cero por el riesgo de envenenamiento del contexto.
- Licencia Apache 2.0 permite uso comercial, pero no se documentan garantías ni mantenimiento del repositorio (0 descargas y 0 likes en el momento de la consulta).
- No se han publicado datos de sesgos, robustez adversarial ni comportamiento en producción más allá del conjunto de desarrollo del autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Muki182/ade-semantic-head-qwen3-0.6b
- Modelo base: https://huggingface.co/Qwen/Qwen3-Embedding-0.6B
- Documento de elección de modelo base citado por el autor: `docs/BASE_MODEL_CHOICE_2026-11-27.md` en el repositorio ADE (no se proporciona URL)
- Script de entrenamiento citado: `training/train_semantic_head.py` (no se proporciona URL)
- Métricas crudas citadas: `metrics.json`, `probe_eval.json` (no se proporciona URL)
