# arthrod/c5k-deberta_base-token_level-1-2

## Resumen

`arthrod/c5k-deberta_base-token_level-1-2` es un checkpoint de GLiNER orientado a la deteccion de informacion personal identificable (PII) en contenido de spam, entrenado por el usuario de HuggingFace arthrod. Se trata de una continuacion (fine-tune) del modelo `urchade/gliner_multi_pii-v1` sobre el corpus interno `arthrod/gliner-flex-pii-ready-v5`, con 1.111.948 ejemplos de entrenamiento y 526.449 de evaluacion. El entrenamiento se lanzo el 24 de febrero de 2026 bajo el nombre interno `b-gliner-pii-token-multipii-v1-spam-v1` y se interrumpio en el paso 6.500 de 12.000, aproximadamente 0,19 epocas.

El repositorio se publica como material legacy y superseded: el propio autor recomienda no usarlo para produccion y dirigir a los modelos actuales de la suite (`arthrod/gliner-mmbert-small-ptbr-pii-full-3x-v1` y `arthrod/gliner-opf-ptbr-pii-v1`). Se conserva principalmente porque tiene DOI asignado (10.57967/hf/8514). A pesar del nombre, el encoder real es mDeBERTa-v3-base (`microsoft/mdeberta-v3-base`, vocabulario de 250.105 tokens) y el modelo es de nivel de span (span-level, `markerV0`), no `token_level` como indica el nombre del repositorio.

La relevancia actual de esta ficha es fundamentalmente documental y de auditoria: los repositorios legacy de esta serie carecen de metricas de tarea propias, y la unica evaluacion disponible (el barrido de febrero de 2026 recogido en `arthrod/gliner_eval_folder`) excluyo explicitamente este repositorio por producir predicciones degeneradas. Ademas, el autor advierte de un desajuste entre el `gliner_config.json` de la raiz del repositorio y los pesos, por lo que cargar la raiz con GLiNER da resultados incorrectos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GLiNER de nivel de span (span-level), clase `UniEncoderSpanGLiNER`, `span_mode: markerV0`, `model_type: gliner_uni_encoder_span`, sobre encoder mDeBERTa-v3-base |
| Parametros totales | no disponible (el encoder declarado es `microsoft/mdeberta-v3-base` con vocabulario de 250.105 tokens) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | portugues (pt) e ingles (en), segun la model card |
| Licencia | apache-2.0 |
| Formato de pesos | `pytorch_model.bin` (ficheros LFS de 1,16 GB); el repositorio incluye la etiqueta `onnx` entre sus tags |

## Arquitectura y entrenamiento

El modelo es un GLiNER (Generalist and Lightweight model for Named Entity Recognition) con cabecera de nivel de span, no de nivel de token. Segun los registros de entrenamiento citados en la model card, la clase instanciada es `UniEncoderSpanGLiNER` con `span_mode: 'markerV0'`, y el encoder cargado es `microsoft/mdeberta-v3-base` (vocabulario de 250.105 tokens, segun la linea `encoder_config … vocab_size: 250105`). El YAML de configuracion solicitaba `microsoft/deberta-v3-base`, pero el script termino cargando los pesos preentrenados de `urchade/gliner_multi_pii-v1`, cuyo encoder es mDeBERTa-v3-base; los ficheros de pesos de 1,16 GB coinciden en tamano con los del run mDeBERTa `arthrod/c3750-mdeberta_base-vanilla-1-2`.

El entrenamiento consistio en un fine-tune de dominio sobre el dataset interno `arthrod/gliner-flex-pii-ready-v5`, con 1.111.948 ejemplos de entrenamiento y 526.449 de evaluacion, ejecutado en una sola GPU. Los unicos hyperparametros modificados respecto a la configuracion base fueron `max_types` (de 25 a 100), `max_neg_type_ratio` (de 3 a 2) y `dropout` (de 0,4 a 0,25). El run se interrumpio en el paso 6.500 de los 12.000 previstos, tras aproximadamente 0,19 epocas, con una perdida de evaluacion que descendio de 48,9 (paso 500) a 25,1 (paso 6.500). Los pesos de la raiz del repositorio corresponden a `checkpoint-6500`, el mejor y ultimo checkpoint disponible; el repositorio contiene 13 checkpoints en total. No se documenta uso de RLHF, DPO ni ninguna innovacion de decodificacion.

## Capacidades

- Reconocimiento de entidades nombradas (NER) de tipo zero-shot y few-shot basado en etiquetas definidas en tiempo de inferencia, propio de la familia GLiNER.
- Deteccion de informacion personal identificable (PII) como tarea central del fine-tune, con hasta 100 tipos de entidad simultaneos (`max_types: 100`).
- Extraccion a nivel de span con el esquema `markerV0`, es decir, delimitando fragmentos de texto completos en lugar de etiquetar tokens individuales.
- Adaptacion de dominio especifica a contenido de spam, segun el nombre interno del run (`PII-in-spam`).
- Cobertura multilingue limitada a portugues e ingles, segun los metadatos de idioma del repositorio.
- Inferencia mediante la libreria GLiNER (`library_name: gliner`) y posibilidad de exportacion a ONNX, dado que el tag `onnx` aparece entre los metadatos del repositorio.
- No se documenta soporte de tool calling, function calling, capacidades de agente, razonamiento multi-paso, vision ni audio.

## Casos de uso

- Auditoria de artefactos legacy: cargar `checkpoint-6500/` para reproducir y verificar el comportamiento de un checkpoint citado en publicaciones, dado que el repositorio cuenta con DOI (10.57967/hf/8514) y debe permanecer citable.
- Analisis forense de correos y mensajes de spam: extraer spans de PII (nombres, direcciones, identificadores) de corpus de spam en portugues o ingles como paso previo a un estudio de filtrado.
- Investigacion sobre adaptacion de dominio en modelos GLiNER: el run documenta un caso de continuacion de `urchade/gliner_multi_pii-v1` sobre un corpus interno de gran volumen (1,1 M de ejemplos de entrenamiento) y sirve como referencia metodologica.
- Estudio de fallos de configuracion: el repositorio ilustra un desajuste entre `gliner_config.json` y `pytorch_model.bin` y puede usarse como caso de prueba para validaciones de integridad de checkpoints en pipelines de MLOps.
- Comparacion de encoders en NER de PII: permite contrastar un encoder mDeBERTa-v3-base con los modelos actuales de la suite basados en mmBERT-small y Ettin, siempre que se use el subdirectorio correcto.
- Etiquetado asistido en anotacion de PII: util como preanotador en proyectos internos de etiquetado de spam en portugues, con revision humana obligatoria dado el estado degradado documentado del checkpoint.
- Docencia y demostracion de GLiNER: ejemplo practico de definicion de tipos de entidad en tiempo de inferencia con `max_types` elevado, util en materiales formativos sobre extraccion de informacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica referencia cuantitativa a evaluacion procede del barrido de febrero de 2026 recogido en `arthrod/gliner_eval_folder` (`EVAL_REPORT.md`), que excluyo este repositorio por "50 garbage preds, all scores ~0.50", resultado atribuido por el autor a un desajuste entre configuracion y pesos. Ademas, se documenta la evolucion de la perdida de evaluacion durante el entrenamiento:

| Momento | Perdida de evaluacion |
|---|---|
| Paso 500 | 48,9 |
| Paso 6.500 | 25,1 |

No se dispone de valores de MMLU, HumanEval, GSM8K ni de metricas de tarea (precisión, recall, F1) para este checkpoint.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Como referencia factual, los ficheros de pesos del encoder ocupan 1,16 GB, lo que situa el modelo en el rango de GPU de consumo, aunque no se documenta el consumo real ni la memoria del cabezal de spans.
- GPU recomendadas: no disponible. El run se entreno en una sola GPU sin especificar modelo.
- Compatibilidad con GPU de consumo: probable dado el tamano de los pesos (1,16 GB), pero no confirmada en la informacion disponible.
- Opciones de despliegue: libreria GLiNER (se menciona la version 0.2.25 en la model card, aunque la seccion de inicio rapido esta truncada en la informacion facilitada), PyTorch y exportacion a ONNX por la presencia del tag correspondiente. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.
- Almacenamiento: el snapshot completo del repositorio ocupa 46,2 GB al incluir 13 checkpoints; el autor recomienda descargar unicamente el checkpoint necesario para evitar arrastrar todo el snapshot.

## Comparativa con modelos similares

| Modelo | Tipo | Idiomas | Estado | Rol segun el autor | Licencia |
|---|---|---|---|---|---|
| arthrod/c5k-deberta_base-token_level-1-2 | GLiNER span-level, mDeBERTa-v3-base | pt, en | Legacy, superseded | Checkpoint conservado por su DOI | apache-2.0 |
| urchade/gliner_multi_pii-v1 | GLiNER PII multilingue | no disponible | Modelo base del fine-tune | Punto de partida del entrenamiento | no disponible |
| arthrod/gliner-mmbert-small-ptbr-pii-full-3x-v1 | GLiNER PII, mmBERT-small | pt-BR (no confirmado en detalle) | Actual recomendado | Deteccion de PII en portugues de Brasil | no disponible |
| arthrod/gliner-opf-ptbr-pii-v1 | GLiNER PII, fine-tune del OpenAI Privacy Filter | pt-BR (no confirmado en detalle) | Actual de la suite | Alternativa recomendada para PII en portugues de Brasil | no disponible |

El numero de parametros, la longitud de contexto y las metricas de rendimiento de los modelos comparados no estan disponibles en la informacion facilitada, por lo que la comparacion se limita al rol declarado y al estado de mantenimiento.

## Limitaciones y advertencias

- Checkpoint obsoleto: el propio autor lo marca como superseded y recomienda no usarlo para deteccion actual de PII en portugues de Brasil.
- Desajuste configuracion-pesos en la raiz: el `gliner_config.json` de la raiz se escribio a mano el 24 de febrero de 2026 y describe un modelo token-level DeBERTa-v3-base que no coincide con `pytorch_model.bin`. Cargar la raiz con GLiNER produce predicciones incorrectas; debe usarse `checkpoint-6500/`.
- Resultados degradados documentados: el barrido de febrero de 2026 reporto "50 garbage preds, all scores ~0.50" y excluyo el repositorio, comportamiento compatible con el desajuste anterior.
- Nomenclatura enganosa: el nombre del repositorio indica `deberta_base` y `token_level`, cuando el encoder es mDeBERTa-v3-base y el modelo es span-level (`markerV0`). Los sufijos `c5k` y `1-2` no se explican en ninguna parte del repositorio.
- Entrenamiento incompleto: el run se interrumpio en el paso 6.500 de 12.000 (aproximadamente 0,19 epocas), por lo que la convergencia no esta garantizada.
- Perdida de evaluacion elevada: 25,1 en el ultimo checkpoint registrado, un valor muy alto en terminos absolutos, coherente con el entrenamiento truncado.
- Cobertura idiomatica limitada: solo portugues e ingles declarados; no se documenta comportamiento en castellano ni otros idiomas.
- Riesgo de alucinacion y de spans espurios: inherente a los modelos generativos de etiquetas tipo GLiNER, agravado aqui por el estado degradado del checkpoint.
- Sesgos conocidos: no disponible. No se documenta analisis de sesgos ni composicion demografica del dataset `arthrod/gliner-flex-pii-ready-v5`.
- Licencia apache-2.0, que permite uso comercial, pero el estado degradado del modelo y la ausencia de metricas de tarea desaconsejan su uso en produccion independientemente de la licencia.
- Longitud de contexto no documentada: se desconoce el limite practico de entrada, relevante para documentos largos.
- Seccion de inicio rapido truncada en la informacion disponible, por lo que no se pueden verificar los pasos exactos de carga recomendados por el autor.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/arthrod/c5k-deberta_base-token_level-1-2
- DOI: https://doi.org/10.57967/hf/8514
- Modelo base: https://huggingface.co/urchade/gliner_multi_pii-v1
- Modelo actual recomendado (PII pt-BR, mmBERT-small): https://huggingface.co/arthrod/gliner-mmbert-small-ptbr-pii-full-3x-v1
- Fine-tune del OpenAI Privacy Filter para PII pt-BR: https://huggingface.co/arthrod/gliner-opf-ptbr-pii-v1
- GLiNER Ettin 68M pt-BR PII: https://huggingface.co/arthrod/gliner-ettin-68m-ptbr-pii-full-3x-v1
- GLiNER Ettin 68M pt-BR PII (top50k): https://huggingface.co/arthrod/gliner-ettin-68m-ptbr-pii-top50k-v1
- GLiNER Ettin 32M pt-BR PII: https://huggingface.co/arthrod/gliner-ettin-32m-ptbr-pii-full-3x-v1
- Benchmark de la suite actual: https://huggingface.co/datasets/arthrod/gliner-opf-ptbr-pii-bench-v1
- Comparacion de revisiones de GLiNER: https://huggingface.co/datasets/arthrod/gliner_review_comparison
- Demo interactiva de la suite actual: https://huggingface.co/spaces/arthrod/gliner-opf-ptbr-pii-demo
- Barrido de evaluacion de febrero de 2026 (GLiNER x 9 conjuntos): https://huggingface.co/datasets/arthrod/gliner_eval_folder
- Registro de experimentos `attempt_vanilla`: https://huggingface.co/arthrod/attempt_vanilla
- Checkpoint legacy mDeBERTa-v3-base span (agosto de 2025): https://huggingface.co/arthrod/c3750-mdeberta_base-vanilla-1-2
- Legacy LoRA sobre GLiNER-pii-small (Ettin-68M): https://huggingface.co/arthrod/v0-ettin68m-token_level-0-3
- Legacy GLiNER-pii-large fine-tune (8k pasos, con metricas de evaluacion): https://huggingface.co/arthrod/v1-deberta_large-token_level-1-7
- Legacy DeBERTa-v3-small fallido (perdida estancada en 0): https://huggingface.co/arthrod/v1-deberta_small-token_level-0-6
