# adamjb111/nld27-grpo-qwen35-2b-from-nla-qwen36-27b-L42-pairs526k-op100k-ar-reward-20261013

## Resumen

El modelo `adamjb111/nld27-grpo-qwen35-2b-from-nla-qwen36-27b-L42-pairs526k-op100k-ar-reward-20261013` es un estudiante de destilación de 2.000 millones de parámetros construido sobre Qwen3.5-2B que verbaliza vectores de activación en lenguaje natural. Su entrada no es texto, sino un vector residual de 5.120 dimensiones correspondiente a la salida del bloque 42 (último token) del modelo profesor Qwen3.6-27B. Un adaptador (`final_adapter.pt`) proyecta ese vector a cuatro slots de embedding situados donde el profesor coloca su token marcador, y el LM escribe a continuación la explicación del vector.

El profesor es el NLA `ceselder/qwen3.6-27b-nla-rl` en su iteración 400, entrenado sobre la capa 42 de Qwen3.6-27B. El interés de este artefacto es puramente de interpretabilidad mecanicista: permite sustituir un verbalizador de 27B por uno de 2B y abaratar en más de un orden de magnitud los pipelines que traducen activaciones internas a descripciones legibles. No es un modelo de chat ni un LLM de propósito general: no acepta prompts de texto ni mantiene conversaciones.

El pipeline de entrenamiento es inusualmente largo para un destilado de este tamaño: SFT sobre 263.000 explicaciones del profesor con objetivos soft (top-20 con peso 0,5), una ronda on-policy de 100.000 ejemplos y un posterior ajuste con GRPO usando la recompensa de reconstrucción AR del profesor de 27B. El autor publica la evaluación completa en `eval_full_done.json`, pero la model card solo reporta el FVE del profesor (0,754), no el del estudiante.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder derivado de Qwen3.5-2B, con adaptador de entrada (`final_adapter.pt`) que proyecta un vector residual de 5.120 dimensiones a 4 slots de embedding; detalles internos de Qwen3.5-2B no disponibles |
| Parámetros totales | Aproximadamente 2.000 millones (según la designación Qwen3.5-2B del nombre del modelo); cifra exacta no disponible |
| Parámetros activos | No aplica (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible; el repositorio solo publica pesos en safetensors y el adaptador en `final_adapter.pt` |
| Idiomas soportados | No disponible (el autor no lo especifica) |
| Licencia | No disponible |
| Formato de pesos | safetensors (etiqueta del repositorio) y PyTorch (`final_adapter.pt`) |
| Tamaño del repositorio | 4,0 GB |
| Entrada del modelo | Vector residual de 5.120 dimensiones (salida del bloque 42, último token, Qwen3.6-27B) |
| Salida del modelo | Explicación en lenguaje natural del vector de entrada |

## Arquitectura y entrenamiento

La arquitectura combina un LM decoder de 2B (Qwen3.5-2B) con un adaptador lineal que traduce el vector residual del profesor a un prefijo blando de 4 embeddings, insertado en la posición del token marcador del prompt del profesor. El LM genera entonces la explicación en texto. Esta técnica se enmarca en la línea de autoencoders en lenguaje natural (NLA): la activación se verbaliza y luego se reconstruye para medir la fidelidad mediante FVE (fracción de varianza explicada) usando el modelo AR del profesor.

El entrenamiento se realizó en tres etapas: (1) SFT supervisado sobre 263.000 explicaciones del profesor, combinando tokens muestreados y objetivos soft top-20 con peso 0,5, durante 1,5 pasadas con learning rate 1e-5 y scheduler coseno; (2) una ronda on-policy de 100.000 ejemplos; y (3) GRPO optimizando directamente la recompensa de reconstrucción AR del profesor de 27B, con parada por divergencia KL de 0,25 y parada por plateau. El código de referencia está en `scripts/nladistil27b_train_student_20261010.py` (clases `Student` y `Adapter` en `scripts/nladistil27b_common_20261010.py`) dentro del repositorio `lenses`. Los datos de destilación se publican en `adamjb111/nla-qwen36-27b-L42-distill-data`.

## Capacidades

- Verbalización de activaciones: recibe un vector residual de 5.120 dimensiones de la capa 42 de Qwen3.6-27B y produce una explicación en lenguaje natural de su contenido semántico.
- Destilación de un verbalizador mayor: reproduce, con 2B de parámetros, el comportamiento del NLA profesor de 27B en la misma capa y punto de extracción.
- Generación de texto condicionada a un prefijo de embeddings inyectado, no a un prompt de texto convencional.
- Optimización con recompensa de reconstrucción: el GRPO alinea la salida con la fidelidad de reconstrucción medida por el modelo AR del profesor.
- No soporta tool calling ni function calling según la información disponible.
- No se documentan capacidades de agente, razonamiento multi-paso, visión, audio ni modo de pensamiento explícito.
- Capacidades multilingües: no disponibles.

## Casos de uso

- Interpretabilidad a escala sobre grandes volúmenes de activaciones: sustituir al verbalizador de 27B por este estudiante de 2B reduce el coste por activación más de diez veces en parámetros, lo que permite procesar millones de vectores residuales de la capa 42 en estudios de features.
- Investigación de features en el residual stream: generar descripciones legibles de activaciones concretas para identificar direcciones semánticas, detectar neuronas o circuitos asociados a conceptos determinados y contrastar hipótesis con el profesor.
- Auditoría de seguridad de modelos: monitorizar la capa 42 de Qwen3.6-27B durante la inferencia y verbalizar conceptos internos (toxicidad, intención, conocimiento factual) para construir clasificadores o alertas de comportamiento anómalo.
- Generación automática de datasets de explicaciones: producir corpora de pares (vector, explicación) reutilizables por otros grupos de interpretabilidad, ya que el pipeline on-policy y GRPO del autor apunta a este uso.
- Depuración de entrenamiento y comparación de checkpoints: medir el FVE de reconstrucción de distintos checkpoints de Qwen3.6-27B sobre un conjunto fijo de vectores (por ejemplo, los 1.020 vectores FineFineWeb usados en la evaluación) para detectar deriva representacional durante el post-entrenamiento.
- Docencia y divulgación de interpretabilidad: al caber en GPUs de consumo, permite demostrar en un portátil o en una estación de trabajo cómo se traduce una activación interna a texto sin necesidad de servir un modelo de 27B en el aula.
- Validación metodológica de destilación con recompensa: sirve como caso de estudio de SFT + on-policy + GRPO aplicado a una tarea no generativa clásica, útil para equipos que diseñen recetas de destilación similares.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks convencionales (MMLU, HumanEval, GSM8K) en la información disponible; el modelo no es evaluable con ese tipo de pruebas por su naturaleza de entrada no textual. La única métrica reportada es el FVE de reconstrucción AR.

| Métrica | Valor |
|---|---|
| FVE del profesor (Qwen3.6-27B NLA, iter 400, capa 42) sobre 1.020 vectores FineFineWeb | 0,754 |
| FVE del estudiante de 2B en el mismo conjunto held-out | No disponible en la información extraída; la model card remite a `done.json` |
| MMLU, HumanEval, GSM8K u otros | No aplica / no publicados |

## Requisitos de hardware

- VRAM estimada para el LM de 2B (estimaciones orientativas, no publicadas por el autor): en bf16/fp16 alrededor de 4-5 GB de pesos más overhead de activaciones; en int8, en torno a 2,5-3 GB; en int4, aproximadamente 1,5-2 GB.
- GPU recomendadas para el estudiante: cualquier GPU con 8 GB o más (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090, L4, A10) debería ser suficiente para el modelo de 2B, aunque el autor no publica cifras de latencia ni throughput.
- Cabe en GPU de consumo: sí, siempre que la conversión a formatos estándar sea viable; el repositorio publica safetensors y un adaptador en PyTorch, no cuantizaciones listas para usar.
- Requisito adicional crítico: para generar la entrada se necesita acceso a Qwen3.6-27B y a su capa 42, lo que exige memoria muy superior (decenas de GB) salvo que los vectores residuales se calculen por adelantado y se almacenen.
- Opciones de despliegue: no es un modelo de chat estándar; vLLM, llama.cpp, Ollama o TGI no pueden servirlo tal cual, porque la entrada es un vector de 5.120 dimensiones inyectado en cuatro slots de embedding. Se requiere el código `Student`/`Adapter` del repositorio `lenses`.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Entrada | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|---|
| Este estudiante (nld27-grpo-qwen35-2b) | ~2B | Vector residual de 5.120 dimensiones (capa 42, Qwen3.6-27B) | No disponible | No disponible | HuggingFace, 0 descargas, 0 likes | Destilado con SFT + on-policy + GRPO frente a la recompensa AR del profesor |
| ceselder/qwen3.6-27b-nla-rl (profesor, iter 400) | 27B | Vector residual de 5.120 dimensiones (capa 42) | No disponible | No disponible | HuggingFace | FVE de 0,754 sobre 1.020 vectores FineFineWeb; referencia de calidad del estudiante |
| Otros verbalizadores de activaciones o NLA de tamaño similar | No disponible | No disponible | No disponible | No disponible | No disponible | No se han identificado alternativas comparables en la información proporcionada |

## Limitaciones y advertencias

- No es un LLM de propósito general: no acepta prompts de texto, no mantiene conversaciones y no debe evaluarse con benchmarks generativos convencionales.
- Dependencia estricta del punto de extracción: solo procesa vectores de la capa 42 (salida del bloque 42, último token) de Qwen3.6-27B con dimensión 5.120. Aplicarlo a otra capa, otro token o otro modelo no está soportado.
- Dependencia del profesor: el adaptador está entrenado con los objetivos y el token marcador del profesor `ceselder/qwen3.6-27b-nla-rl` en su iteración 400; cambios de versión pueden degradar la fidelidad.
- Riesgo de alucinación en las explicaciones: el propio profesor tiene un FVE de 0,754, lo que implica que una fracción no trivial de la varianza no se reconstruye; el FVE del estudiante no se reporta en la información extraída, por lo que no puede acotarse su degradación.
- Licencia no disponible: sin términos explícitos, no hay autorización clara de uso comercial, y podrían arrastrarse condiciones de las licencias del modelo base Qwen3.5-2B y del profesor, no detalladas.
- Idiomas soportados no especificados: se desconoce si las explicaciones se generan en inglés, multilingüe o de forma inconsistente.
- Sin validación comunitaria: 0 descargas y 0 likes, con repositorio creado y actualizado el mismo día (14 de octubre de 2026), lo que apunta a un artefacto experimental no revisado por terceros.
- Dependencia de código externo: el funcionamiento completo requiere los scripts del repositorio `lenses`, cuya URL no se proporciona en la información disponible, lo que dificulta la reproducibilidad.
- No hay información sobre sesgos, comportamiento en dominios fuera de FineFineWeb ni evaluación más allá del FVE de reconstrucción.
- La fecha codificada en el identificador (20261013) sugiere que forma parte de una serie de experimentos efímeros, no de un modelo mantenido.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/adamjb111/nld27-grpo-qwen35-2b-from-nla-qwen36-27b-L42-pairs526k-op100k-ar-reward-20261013
- Modelo profesor (referenciado en la model card): https://huggingface.co/ceselder/qwen3.6-27b-nla-rl
- Dataset de destilación (referenciado en la model card): https://huggingface.co/datasets/adamjb111/nla-qwen36-27b-L42-distill-data
- Repositorio `lenses` con el código de entrenamiento (`scripts/nladistil27b_train_student_20261010.py`, `scripts/nladistil27b_common_20261010.py`): URL no disponible en la información proporcionada
- Ficheros de evaluación `eval_full_done.json` y `done.json`: referenciados en la model card, sin URL directa en la información disponible
- Paper o blog asociado: no disponible en la información proporcionada
