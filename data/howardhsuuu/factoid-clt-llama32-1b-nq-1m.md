# HowardHsuuu/factoid-clt-llama32-1b-nq-1m

## Resumen

`HowardHsuuu/factoid-clt-llama32-1b-nq-1m` es un conjunto de checkpoints de investigacion en interpretabilidad mecanistica, no un modelo de lenguaje generativo. Se trata de un Cross-Layer Transcoder (CLT) entrenado con la libreria CLT-Forge sobre el modelo base `meta-llama/Llama-3.2-1B`, con el objetivo de estudiar la recuperacion de hechos (factual recall) en modelos pequenos. El repositorio contiene tres checkpoints: uno entrenado desde cero sobre 1M de tokens de respuestas largas de NaturalQuestions (`factoid`), otro sobre 1M de tokens de wikitext-103 como control generico (`generic`), y un tercero que es el generico afinado con 250k tokens adicionales de NaturalQuestions (`factoid_finetuned`).

El modelo es relevante para la comunidad de interpretabilidad mecanistica porque permite comparar el efecto del dominio de entrenamiento en la calidad de los transclers cross-layer, usando metricas como replacement y completeness sobre grafos de atribucion. El piloto reportado en la model card muestra que el entrenamiento especifico de dominio mejora la recuperacion factual frente al control generico con el mismo presupuesto de datos. El tamano del repositorio es de 24.4 GB e incluye artefactos de grafos de atribucion guardados en formato `.pt`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cross-Layer Transcoder (CLT) sobre `meta-llama/Llama-3.2-1B` |
| Parametros totales | no disponible (dimension latente `d_latent=4096`) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (depende del modelo base Llama-3.2-1B, 128k tokens) |
| Tipos de cuantizacion | bf16 para entrenamiento, float32 para evaluacion de atribucion |
| Idiomas soportados | no disponible (depende del modelo base) |
| Licencia | other (no especificada en detalle) |
| Formato de pesos | safetensors (`clt_weights.safetensors`) mas configuracion JSON (`clt_cfg.json`) |

## Arquitectura y entrenamiento

El modelo es un Cross-Layer Transcoder (CLT), una arquitectura de interpretabilidad que se entrena para reconstruir la activacion de una capa a partir de las activaciones de capas anteriores, produciendo un diccionario de caracteristicas superpuestas. Los CLT se diferencian de los SAE (sparse autoencoders) en que operan entre capas en lugar de dentro de una sola capa, lo que permite rastrear circuitos causales entre capas. En este caso, la anchura del latente es `d_latent=4096` y el entrenamiento se realizo en bf16.

El entrenamiento se hizo con CLT-Forge sobre el modelo base `meta-llama/Llama-3.2-1B` (1B parametros). Los datos de entrenamiento son dos fuentes: `lighteval/natural_questions_clean` para el checkpoint `factoid` (1M tokens de respuestas largas) y `Salesforce/wikitext` (`wikitext-103-raw-v1`) para el checkpoint `generic` (1M tokens, mismo presupuesto). El checkpoint `factoid_finetuned` parte del `generic` y se entrena con 250k tokens adicionales de NaturalQuestions. No se menciona uso de RLHF ni DPO. La evaluacion de atribucion se realizo en float32 sobre 32 prompts held-out de recall factual.

## Capacidades

- Interpretabilidad mecanistica: permite analizar como el modelo base Llama-3.2-1B recupera hechos factuales mediante grafos de atribucion.
- Descomposicion de activaciones cross-layer: los CLTs modelan la interaccion entre capas, algo que los SAE monolingue no capturan.
- Comparacion de condiciones de entrenamiento: el repositorio incluye checkpoints entrenados con datos facticos, genericos y un finetune, lo que permite estudios controlados.
- Generacion de grafos de atribucion: se incluyen 256 grafos guardados en `.pt` (128 de factual recall y 128 de control generico) para reabrir analisis sin recomputar.
- Reutilizacion en investigacion: los checkpoints pueden cargarse con la API de CLT-Forge (`CLT.load_from_pretrained`) para follow-up analysis.
- No es un modelo de generacion de texto: no se puede usar para chat, completado de codigo ni ninguna tarea generativa directa.

## Casos de uso

- Analisis de circuitos de recuperacion factual: se puede cargar el checkpoint `factoid` y abrir los grafos de atribucion para identificar que features intervienen en el recall de hechos, util en estudios de causalidad.
- Comparacion controlada de dominios de entrenamiento: el par `factoid` vs `generic` permite medir como el dominio de los datos cambia la estructura de las features, algo relevante para disenar experimentos de interpretabilidad.
- Ablacion de finetuning sobre CLTs: el checkpoint `factoid_finetuned` sirve para evaluar si afinar un CLT generico con datos factuales mejora la atribucion, como alternativa a entrenar desde cero.
- Reapertura de grafos de atribucion guardados: los 256 archivos `.pt` permiten reanalizar las evaluaciones del piloto sin recomputar, util para reproducibilidad.
- Benchmark de metodos de transcodificacion: comparar este CLT con el baseline `mntss/clt-llama-3.2-1b-524k` para validar nuevas metricas de atribucion.
- Educacion en interpretabilidad: como modelo piloto de tamano reducido (1B base), es un caso de estudio accesible para ensenar tecnicas de CLT y grafos de atribucion en cursos avanzados.

## Benchmarks y rendimiento

La model card reporta resultados del piloto sobre 32 prompts held-out de factual recall. Las metricas son:

| Checkpoint | Mean replacement | Mean completeness | Features para 80% de atribucion |
| --- | ---: | ---: | ---: |
| `factoid` | 0.5033 | 0.8322 | 733.1 |
| `generic` | 0.3355 | 0.7570 | 810.5 |
| `factoid_finetuned` | 0.5083 | 0.8343 | 921.7 |
| Baseline `mntss/clt-llama-3.2-1b-524k` | 0.6445 | 0.8915 | 528.2 |

Interpretacion conservadora: el entrenamiento especifico en factoid mejora replacement y completeness frente al control generico del mismo presupuesto. El baseline de codigo abierto sigue siendo mas fuerte en general, pero no es un control de presupuesto equiparado. No se reportan benchmarks de generacion de texto ni de razonamiento porque el modelo no es generativo.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 24.4 GB en disco, pero los pesos del CLT en safetensors son mas pequenos (la dimension latente es 4096). Para cargar en GPU se recomienda al menos 8-12 GB de VRAM para inferencia en bf16 con el modelo base de 1B mas el CLT.
- GPU recomendadas: cualquier GPU con CUDA y al menos 8 GB de VRAM (RTX 3060, RTX 4070, A100, etc.). La carga se hace con `device="cuda"`.
- Uso en consumer GPU: si, cabe en GPUs de consumo con 8-12 GB de VRAM, pero la evaluacion de atribucion en float32 puede requerir mas memoria.
- Opciones de despliegue: no es un modelo de inferencia generativa, por lo que no se usa con vLLM, llama.cpp ni Ollama. La carga se hace exclusivamente con la libreria `clt-forge`.
- Latencia y throughput: no disponibles, el modelo no esta pensado para servir peticiones.

## Comparativa con modelos similares

| Modelo | Tipo | Base | Dataset | Replacement | Completeness | Licencia |
| --- | --- | --- | --- | ---: | ---: | --- |
| `HowardHsuuu/factoid-clt-llama32-1b-nq-1m` (factoid) | CLT | Llama-3.2-1B | NaturalQuestions (1M) | 0.5033 | 0.8322 | other |
| `HowardHsuuu/factoid-clt-llama32-1b-nq-1m` (generic) | CLT | Llama-3.2-1B | wikitext-103 (1M) | 0.3355 | 0.7570 | other |
| `mntss/clt-llama-3.2-1b-524k` | CLT | Llama-3.2-1B | no especificado | 0.6445 | 0.8915 | no disponible |

La comparativa directa es con el baseline de codigo abierto `mntss/clt-llama-3.2-1b-524k`, que tiene 524k features y no es un control de presupuesto equiparado. No hay otros CLT comparables en el mismo tamano de modelo base con datos factuales publicados.

## Limitaciones y advertencias

- Es un artefacto de investigacion, no un modelo de produccion. No sirve para generacion de texto ni tareas aplicadas.
- La licencia es `other`, no especificada en detalle. Revisar los terminos de la model card antes de usarlo comercialmente.
- El modelo base `meta-llama/Llama-3.2-1B` tiene su propia licencia (Llama Community License), que restringe el uso comercial en ciertos casos.
- Los resultados del piloto son sobre 32 prompts de screening, no una evaluacion exhaustiva. Las diferencias entre `factoid` y `factoid_finetuned` son marginales (0.5033 vs 0.5083 en replacement) y deben tratarse como preliminares.
- No se incluye la condicion `open source + factoid finetune`, por lo que no hay evidencia de que afinar el baseline mejore su rendimiento.
- El repositorio es grande (24.4 GB) y contiene grafos `.pt` que requieren PyTorch para reabrirlos, no son formatos ligeros.
- Riesgo de alucinacion: no aplica porque no genera texto. El riesgo es de sobreinterpretar las metricas de atribucion como causalidad real.

## Enlaces

- Hugging Face: https://huggingface.co/HowardHsuuu/factoid-clt-llama32-1b-nq-1m
- Repositorio de codigo y reporte del piloto: https://github.com/HowardHsuuu/dataset-specific-clt-training
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-1B
- Baseline CLT: https://huggingface.co/mntss/clt-llama-3.2-1b-524k
- Dataset NaturalQuestions: https://huggingface.co/datasets/lighteval/natural_questions_clean
- Dataset wikitext-103: https://huggingface.co/datasets/Salesforce/wikitext
