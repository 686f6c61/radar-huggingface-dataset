# AxisMeru/prabhasa-nyaya-element-judge-4b-v0

## Resumen

prabhasa-nyaya-element-judge-4b-v0 es un ajuste fino supervisado de Qwen/Qwen3-4B desarrollado por AxisMeru para una tarea muy concreta: el juicio a nivel de elemento (element-level judgment) sobre escenarios legales construidos a partir de estatutos penales indios. Dado un texto de estatuto, un escenario fáctico y una lista de hechos extraídos, el modelo decide si cada elemento normativo queda "established" (y en tal caso cita el fragmento de hecho que lo sustenta, con el formato `fact_id:start:end`) o "not_established". No genera texto libre ni asesoramiento jurídico: emite una etiqueta estructurada por elemento.

El interés técnico del modelo no está en su tamano (4.022.468.096 parámetros, denso) sino en el contraste de rendimiento que documenta su model card. Sobre un conjunto de evaluación fijo de 1.519 elementos, el modelo alcanza un 0,921 de accuracy global y un 0,886 de recall en la clase minoritaria `not_established`, frente al 0,125 de Qwen3-4B-Base, el 0,224 de Qwen3-4B post-entrenado, el 0,392 de Qwen3-14B-Base y el 0,427 de Qwen2.5-32B-Base, todos ellos evaluados con 6 ejemplos en el prompt. Es decir, un ajuste fino con 1.463 filas de entrenamiento supera en esta tarea concreta a modelos hasta ocho veces mayores en parámetros.

Se trata de un prototipo de investigación, no de un producto: 14 estatutos cubiertos, únicamente inglés, cero descargas y cero likes en el momento de redactar esta ficha, y una evaluación realizada sobre un conjunto retenido procedente del mismo pipeline de datos. Su relevancia actual es doble: como demostración de que el ajuste fino especializado y bien diseñado (con sobremuestreo de la clase negativa) puede batir a modelos mucho mayores en tareas de decisión estructurada, y como pieza reutilizable en pipelines de análisis jurídico y de generación de datos etiquetados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (familia Qwen3), con atención de grupos de consultas (GQA); heredada de Qwen/Qwen3-4B |
| Parámetros totales | 4.022.468.096 (~4,02 mil millones), según safetensors |
| Parámetros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no especificada en la model card; el modelo base Qwen3-4B soporta 32.768 tokens nativos, ampliables a 131.072 con YaRN |
| Tipos de cuantización | no disponible: el repositorio solo publica safetensors (bf16/fp16, 8,1 GB). Cuantizable por el usuario a GGUF, AWQ o GPTQ |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Modelo base | Qwen/Qwen3-4B |
| Método de ajuste | SFT (SFTTrainer, TRL 1.13) |
| Formato de salida | `established <fact_id>:<start>:<end>` o `not_established` |
| Estatutos cubiertos | 14: IPC §§ 302, 304A, 376, 378, 379, 380, 384, 390, 392, 405, 415, 420; NDPS Act § 22; Prevention of Corruption Act § 7 |
| SHA-256 del dataset | `53697c5762c011b57cf80e00d9ddf6aa5cb54eae948eca8b59c569d7123ab440` |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base sin modificaciones estructurales: un transformer decoder-only denso de ~4.000 millones de parámetros de la familia Qwen3. No hay innovaciones de arquitectura propias (ni MoE, ni SSM, ni decodificación especulativa): todo el valor anadido está en el ajuste fino supervisado y en el formato de tarea.

El entrenamiento se realizó con SFTTrainer de TRL 1.13 sobre 1.463 filas de juicio por elemento, procedentes de escenarios de 14 contratos legales, e incluye ejemplos de profesor de nivel T y pares de negativos confundibles. El conjunto de datos está certificado como libre de fugas: cero coincidencias de contención a un umbral de 0,9 ponderado por IDF frente a los 1.519 elementos del conjunto de evaluación retenido, y ningún elemento de evaluación aparece en entrenamiento. La clase minoritaria (`not_established`) se sobremuestreó 1:1 en cada época, decisión coherente con el objetivo de maximizar el recall de la clase negativa, que es precisamente donde fallan los modelos base. Hiperparámetros: optimizador AdamW de 8 bits vía bitsandbytes, lr = 2e-5, planificador coseno, 100 pasos de warmup, 3 épocas, batch de 4 con acumulación de gradiente de 4 (batch efectivo 16), gradient checkpointing activado y hardware RunPod L40S de 48 GB. No se documenta ninguna fase de RLHF, DPO o RLVR.

## Capacidades

- Clasificación binaria estructurada a nivel de elemento normativo: para cada elemento de un estatuto, decide entre `established` y `not_established`.
- Citación fundamentada: cuando el elemento queda establecido, emite el identificador del hecho y el span exacto (`fact_id:start:end`) que lo sustenta, lo que permite trazabilidad hasta el texto de origen.
- Manejo explícito de negativos confundibles: la clase `not_established` se trabaja de forma deliberada en entrenamiento y alcanza 0,886 de recall y 0,846 de precisión en el particionado de negativos.
- Análisis de escenarios legales sobre textos de estatuto indios (IPC y leyes relacionadas), con razonamiento jurídico elemental, no conversacional.
- Ejecución sin ejemplos en el prompt (zero-shot): la evaluación reportada es sin few-shots y con decodificación greedy y umbral 0,5.
- Salida determinista y parseable, apta para integrarse en pipelines automáticos.
- Capacidades multilingües: no. El modelo está etiquetado únicamente para inglés.
- Tool calling / function calling: no disponible (no se documenta soporte).
- Soporte de agentes y razonamiento multi-paso: no disponible (no se documenta).
- Modo thinking, visión o audio: no disponible; no se documenta ninguno.

## Casos de uso

- Análisis de elementos del delito en pipelines de legal tech: introducir el texto del estatuto, el escenario y los hechos extraídos, y obtener por cada elemento una etiqueta más el span probatorio, lo que permite construir un grafo de suficiencia probatoria sin revisión manual inicial.
- Triaje de expedientes en clínicas jurídicas y despachos: el modelo marca de forma automática qué elementos carecen de hecho de soporte (`not_established`), de modo que el abogado dedica el tiempo a los puntos débiles de la acusación en lugar de a la lectura completa.
- Generación de datos etiquetados para entrenar modelos legales mayores: al producir salidas con span citado y una política clara de negativos, sirve como etiquetador de bajo coste para destilar conjuntos de datos de razonamiento jurídico estructurado.
- Control de calidad de anotaciones humanas: ejecutar el modelo sobre anotaciones existentes y revisar las discrepancias, con especial atención a los falsos `established` (precisión de 0,846 en la clase negativa), para detectar anotadores demasiado permisivos.
- Evaluación comparativa de modelos legales: el conjunto de evaluación de 1.519 elementos y la métrica de recall de `not_established` constituyen una prueba de esfuerzo útil para medir si un LLM general realmente distingue "no probado" de "probado", donde Qwen3-4B-Base baja hasta 0,125.
- Docencia universitaria en derecho indio: usar las salidas del modelo como material de discusión sobre identificación de elementos típicos y suficiencia fáctica, siempre con verificación humana y etiquetado explícito como prototipo.
- Extracción estructurada dentro de una arquitectura RAG: integrar el modelo como componente de decisión final tras recuperar estatuto y hechos, aprovechando que su salida es un formato fijo fácil de validar con expresiones regulares y esquemas JSON.
- Auditoría interna de contratos y cumplimiento normativo en los 14 estatutos cubiertos: verificar automáticamente la correspondencia entre hechos documentados y elementos exigidos antes de escalar el caso a revisión legal.

## Benchmarks y rendimiento

Evaluación sobre 1.519 elementos retenidos, sin ejemplos en el prompt, decodificación greedy con umbral 0,5:

| Partición | n | Accuracy | Recall established | Recall not_established | Precisión not_established |
|---|---|---|---|---|---|
| negatives | 563 | 0,876 | 0,867 | 0,886 | 0,846 |
| full_ir_gold | 956 | 0,948 | 0,948 | n/a¹ | n/a¹ |
| overall | 1.519 | 0,921 | — | — | — |

¹ La partición `full_ir_gold` contiene únicamente elementos `established`; el recall de `not_established` no está definido en ella.

Comparación con líneas base evaluadas con 6 ejemplos en el prompt sobre el mismo conjunto de 1.519 elementos:

| Modelo | Recall de not_established (partición negatives) |
|---|---|
| Qwen3-4B-Base | 0,125 |
| Qwen3-4B (post-entrenado / Instruct) | 0,224 |
| Qwen3-14B-Base | 0,392 |
| Qwen2.5-32B-Base | 0,427 |
| Este modelo — entrenado, sin ejemplos | 0,886 |

No se han publicado resultados de benchmarks en la información disponible para métricas estándar generalistas (MMLU, HumanEval, GSM8K u otras).

## Requisitos de hardware

- Pesos en bf16/fp16: aproximadamente 8 GB (4,02 mil millones de parámetros). El repositorio ocupa 8,1 GB.
- Inferencia en cuantización de 8 bits: alrededor de 4,5 GB de VRAM; en 4 bits (GGUF Q4_K_M o similar), alrededor de 2,5-3 GB más la caché KV.
- GPU recomendadas: L40S (la usada en el entrenamiento, 48 GB), A100, H100, L4, A10G. Para el tamano del modelo, cualquier GPU con 16 GB o más es suficiente en bf16.
- Cabe en GPU de consumo: sí. RTX 4090, RTX 3090, RTX 4080/4070 Ti con 12-16 GB ejecutan los pesos en bf16 sin problemas; tarjetas de 8 GB necesitan cuantización de 4 bits.
- Opciones de despliegue: Transformers con bitsandbytes para cuantización en carga; vLLM y TGI para servido con batching; llama.cpp y Ollama tras convertir los pesos a GGUF (no se publican GGUF en el repositorio). Al ser una tarea de clasificación con salida corta, el coste de generación es bajo y dominado por el prefill del prompt.
- Latencia y throughput estimados: no disponible. No se documentan mediciones de latencia ni de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Recall not_established | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| prabhasa-nyaya-element-judge-4b-v0 | 4,02 mil millones | no especificado (base: 32.768) | 0,886 (sin ejemplos) | Apache 2.0 | HuggingFace, safetensors |
| Qwen3-4B-Base | 4,02 mil millones | 32.768 | 0,125 (6 ejemplos) | Apache 2.0 | HuggingFace |
| Qwen3-4B post-entrenado | 4,02 mil millones | 32.768 | 0,224 (6 ejemplos) | Apache 2.0 | HuggingFace |
| Qwen3-14B-Base | ~14 mil millones | 32.768 | 0,392 (6 ejemplos) | Apache 2.0 | HuggingFace |
| Qwen2.5-32B-Base | ~32,5 mil millones | 32.768 | 0,427 (6 ejemplos) | Apache 2.0 (Qwen2.5) | HuggingFace |

No se conocen en la información proporcionada otros ajustes finos específicos de juicio por elemento legal indio con los que comparar directamente; el propio autor no cita alternativas especializadas.

## Limitaciones y advertencias

- Cobertura restringida a 14 estatutos (12 secciones del IPC, NDPS Act § 22 y Prevention of Corruption Act § 7). El rendimiento en cualquier otro estatuto indio no está probado.
- Modelo de investigación: la evaluación se realizó sobre un conjunto retenido generado por el mismo pipeline de datos que el entrenamiento. No hay validación externa ni por terceros, y el autor declara explícitamente que no debe usarse para decisiones legales reales.
- Conjunto de entrenamiento muy pequeno (1.463 filas), con sobremuestreo 1:1 de la clase negativa. Existe riesgo de sobreajuste al estilo de redacción y a la distribución de hechos del pipeline original.
- Idioma único: inglés. No hay soporte documentado para hindi, castellano ni ninguna otra lengua, lo que limita su uso fuera de textos legales indios en inglés.
- Riesgo de alucinación en los spans citados: aunque la métrica de precisión de `not_established` es 0,846, no se reportan métricas específicas de exactitud de los offsets `start:end`, de modo que una cita puede apuntar a un fragmento incorrecto sin que el sistema lo detecte.
- Sesgos heredados: al derivar de Qwen3-4B, el modelo arrastra los sesgos del corpus de preentrenamiento del base, no auditados en la model card.
- Salida rígida: solo produce dos formatos (`established <fact_id>:<start>:<end>` o `not_established`). No es un modelo conversacional ni genera explicaciones, resúmenes ni texto jurídico libre.
- Cero descargas y cero likes en el momento de la consulta, sin publicaciones ni validación de la comunidad. No hay pruebas independientes de reproducibilidad más allá de las firmas duales (Track A y Track B) declaradas por el autor.
- Licencia Apache 2.0: permite uso comercial y modificación sin restricciones de copyleft, pero el uso en producción dentro de la UE puede quedar sujeto a obligaciones si el sistema se clasifica como de alto riesgo en el marco del Reglamento Europeo de IA, dado el ámbito jurídico.
- Sin versión GGUF, AWQ ni GPTQ publicada: cualquier despliegue con llama.cpp u Ollama exige una conversión y cuantización propias, con la consiguiente pérdida de fidelidad no medida.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AxisMeru/prabhasa-nyaya-element-judge-4b-v0
- Modelo base Qwen3-4B: https://huggingface.co/Qwen/Qwen3-4B
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- TRL (SFTTrainer), usado en el entrenamiento: https://github.com/huggingface/trl
- Búsqueda web: no se han encontrado enlaces relevantes. Los resultados devueltos por el buscador corresponden a tiendas de moda (Mango Outlet Polska, Mango Polska, Zalando Lounge) y no guardan ninguna relación con el modelo, por lo que se descartan. No se dispone de paper, blog técnico, repositorio de código ni demo asociados a este modelo.
