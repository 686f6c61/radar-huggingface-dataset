# LoganResearch/yi-6b-certified-hook-evidence

## Resumen

`LoganResearch/yi-6b-certified-hook-evidence` no es un modelo de lenguaje entrenado, sino un kit de reproducción de evidencia publicado por LoganResearch para auditar un resultado de certificación asociado a la familia `01-ai/Yi-1.5-6B-Chat`. El repositorio contiene un protocolo de evaluación congelado (`EVAL_PROTOCOL.md`), las predicciones por ítem selladas de un panel de test held-out de 617 elementos (`data/predictions_617.jsonl`) y un verificador en Python de biblioteca estándar (`scripts/verify_eval.py`) que recalcula las cifras principales sin GPU, sin red y sin dependencias de terceros.

El resultado medido es una precisión de decisión de compuerta (proceed/withhold) del 75,53 % frente a la mejor línea base constante del 54,62 %, con un lift estricto de +20,91 puntos sobre un umbral preregistrado de +5,0 (PASS-STRICT). El panel se reconstruye a partir de una revisión fijada de TruthfulQA (arXiv:2109.07958) y su huella por ítem `(index, n_options, gold)` coincide con la evidencia publicada en `LoganResearch/qwen2.5-1.5b-instruct-distilled`.

Es relevante ahora porque ejemplifica una práctica poco habitual: publicar evidencia verificable offline sobre una decisión de certificación sin liberar los pesos ni la cabeza certificada. La model card es explícita en lo que no se reclama: no hay propiedades de generación abierta, honestidad o rechazo más allá de la tarea puntuada, ni transferencia a otras familias o tamaños, ni posibilidad de reejecutar la cabeza certificada desde estos ficheros.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el repositorio no contiene pesos; el modelo base referenciado es un transformer decoder-only de la familia Yi-1.5) |
| Parametros totales | no disponible (el modelo base referenciado, Yi-1.5-6B-Chat, tiene 6 000 millones según su denominación; el kit no redistribuye pesos) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el kit no incluye pesos cuantizados) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 (texto del kit y registros por ítem; los pesos del modelo base se rigen por su propia licencia) |
| Formato de pesos | no aplica (no se redistribuyen pesos; el repositorio contiene JSONL de predicciones, Markdown de protocolo y scripts Python) |

## Arquitectura y entrenamiento

El artefacto publicado es un kit de evidencia, no un modelo entrenado. Su estructura comprende tres componentes: un protocolo de medición congelado y saneado (`EVAL_PROTOCOL.md`), un conjunto de predicciones selladas por ítem sobre el panel TEST-617 (`data/predictions_617.jsonl`) y un verificador (`scripts/verify_eval.py`) que recalcula los recuentos principales y comprueba la consistencia de cada fila, incluida la pertenencia al split held-out congelado con semilla 42. El repositorio incluye además un fichero `SHA256SUMS` que cubre todos los ficheros excepto él mismo.

El modelo base referenciado es `01-ai/Yi-1.5-6B-Chat`, un transformer decoder-only de 6 000 millones de parámetros de 01.AI, pero el kit no redistribuye sus pesos ni documenta aquí sus datos de entrenamiento, composición del corpus o etapas de alineamiento (RLHF/DPO). La "cabeza certificada" que emite las decisiones proceed/withhold es un componente de servicio alojado en servidor y no se publica; la model card indica explícitamente que sus internals y su punto de decisión permanecen del lado del servicio. No se documenta ninguna innovación técnica de inferencia (decodificación especulativa, atención lineal, etc.) en la información disponible.

## Capacidades

- Verificación offline de recuentos: el script `scripts/verify_eval.py` recalcula las cifras principales (466/617 decisiones de compuerta correctas, 337/617 respuestas base correctas, lift estricto +20,91 puntos) y devuelve código de salida 0 si el JSONL reproduce los recuentos sellados.
- Comprobación de integridad: `sha256sum -c SHA256SUMS` valida todos los ficheros del repositorio excepto el propio fichero de sumas.
- Reconstrucción del panel: el panel TEST-617 se reconstruye a partir de una revisión pública fijada de TruthfulQA, con huella por ítem `(index, n_options, gold)` verificable contra la evidencia publicada en `LoganResearch/qwen2.5-1.5b-instruct-distilled`.
- Registro de decisiones por ítem: el JSONL contiene las decisiones proceed/withhold y las respuestas base por ítem del run sellado.
- Sin dependencias: el verificador usa solo la biblioteca estándar de Python; no requiere GPU, red ni paquetes de terceros.
- No incluye: generación de texto, razonamiento, código, matemáticas, visión, tool calling, capacidades de agente ni soporte multilingüe documentado. La model card declara explícitamente que no se reclama ninguna propiedad de generación abierta, honestidad o rechazo más allá de la tarea puntuada.

## Casos de uso

- Auditoría de resultados de certificación: un revisor independiente clona el repositorio, ejecuta `python3 scripts/verify_eval.py` y comprueba que las cifras publicadas (75,53 % de precisión de compuerta, 54,62 % de línea base, +20,91 puntos de lift) se reproducen desde el JSONL sellado, sin necesidad de GPU ni acceso a red.
- Verificación de integridad de artefactos de evaluación: `sha256sum -c SHA256SUMS` permite confirmar que los ficheros del kit no han sido alterados antes de citarlos en un informe o paper.
- Reproducción de la construcción del panel: siguiendo la sección 1 del protocolo, un equipo puede reconstruir TEST-617 desde la revisión fijada de TruthfulQA y comparar la huella por ítem `(index, n_options, gold)` con la publicada, validando que el panel es el mismo.
- Comparación cruzada de evidencia entre familias: la huella por ítem coincide con la publicada en `LoganResearch/qwen2.5-1.5b-instruct-distilled`, lo que permite a un investigador contrastar que ambos kits usan el mismo panel congelado antes de comparar resultados.
- Docencia y formación en metodología de evaluación: el kit sirve como ejemplo concreto de protocolo preregistrado con umbrales explícitos (bar ≥ +5,0 puntos de lift; engagement bar ≥ 55 %), útil para enseñar buenas prácticas de medición y separación entre evidencia y release de modelo.
- Revisión de claims en publicaciones: un comité de revisión puede usar el kit para distinguir qué se reclama (rendimiento en la tarea puntuada sobre el panel congelado) de qué no se reclama (generación abierta, honestidad, transferencia a otras distribuciones), evitando sobreinterpretaciones del resultado.

## Benchmarks y rendimiento

| Metrica | Valor | Referencia |
|---|---|---|
| Precision de decision de compuerta (proceed/withhold) | 75,53 % (466/617) | Panel TEST-617 held-out, run sellado |
| Mejor linea base constante | 54,62 % (337/617) | Misma panel |
| Lift estricto sobre linea base | +20,91 puntos | Umbral preregistrado ≥ +5,0 (PASS-STRICT) |
| Items respondidos | 352/617 (57,05 %) | Engagement bar ≥ 55 %, cumplido |
| Precision entre items respondidos | 76,42 % | — |
| Items retenidos (withheld) | 265/617 (42,95 %) | — |

No se han publicado en la información disponible resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) para este artefacto, ya que no es un modelo generativo sino un kit de evidencia sobre una tarea de compuerta.

## Requisitos de hardware

- VRAM para inferencia: no aplica; el kit no contiene pesos de modelo y el verificador no ejecuta inferencia.
- GPU: no se requiere GPU. El verificador `scripts/verify_eval.py` funciona en CPU con Python de biblioteca estándar.
- Memoria: suficiente con la necesaria para cargar el JSONL de 617 ítems y ejecutar comprobaciones por fila; no se especifica un mínimo en la información disponible.
- Almacenamiento: el tamaño del repositorio no está documentado; contiene un JSONL de predicciones, un Markdown de protocolo, un script Python y un fichero de sumas SHA256.
- Opciones de despliegue: no aplica (no hay pesos que servir con vLLM, llama.cpp, Ollama o TGI). La cabeza certificada se sirve en vivo mediante la API alojada y no se publica.
- Latencia y throughput: no disponibles; al no haber inferencia, no procede medirlos.

## Comparativa con modelos similares

| Artefacto | Tipo | Parametros | Contexto | Licencia | Contenido |
|---|---|---|---|---|---|
| `LoganResearch/yi-6b-certified-hook-evidence` | Kit de evidencia de certificación | no aplica | no aplica | Apache-2.0 (kit); pesos base bajo su propia licencia | Protocolo, predicciones selladas, verificador |
| `LoganResearch/qwen2.5-1.5b-instruct-distilled` | Kit de evidencia relacionado (referenciado en la model card) | no aplica | no aplica | no disponible en la información proporcionada | Evidencia con la que coincide la huella del panel |
| `01-ai/Yi-1.5-6B-Chat` | Modelo de lenguaje (base referenciado) | 6 000 millones (según denominación) | no disponible en la información proporcionada | propia del modelo base | Pesos del modelo base |

La comparación con modelos de lenguaje de la misma categoría no procede: este repositorio no es un modelo generativo y no publica resultados en benchmarks estándar que permitan una comparación de rendimiento directa.

## Limitaciones y advertencias

- No es un modelo: no genera texto ni puede usarse para inferencia; es un kit de evidencia sobre una tarea de compuerta.
- La cabeza certificada no se publica: sus internals y su punto de decisión permanecen en servidor, por lo que el resultado no es reejecutable offline desde estos ficheros.
- Alcance limitado: el resultado solo se reclama sobre el panel congelado TEST-617; no se reclama transferencia a otras familias, tamaños o distribuciones.
- Sin propiedades de honestidad o rechazo: la model card declara explícitamente que no se reclama ninguna propiedad de generación abierta, honestidad o rechazo más allá de la tarea puntuada.
- Pesos no redistribuidos: el modelo base `01-ai/Yi-1.5-6B-Chat` se rige por su propia licencia, distinta de la Apache-2.0 del kit.
- Dependencia de TruthfulQA: los registros por ítem embeben letras gold derivables del dataset público TruthfulQA MC1 (arXiv:2109.07958); la validez del panel depende de esa revisión fijada.
- Sin datos de sesgo, alucinación o multilingüismo: no disponibles en la información proporcionada, al no tratarse de un modelo generativo.
- Uso comercial: la licencia Apache-2.0 cubre el texto del kit y los registros por ítem, pero no los pesos del modelo base, que requieren consultar la licencia de `01-ai/Yi-1.5-6B-Chat`.
- Popularidad nula en el momento de la consulta: 0 descargas y 0 likes, lo que limita la validación comunitaria del artefacto.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/LoganResearch/yi-6b-certified-hook-evidence
- Modelo base referenciado: https://huggingface.co/01-ai/Yi-1.5-6B-Chat
- Evidencia relacionada citada en la model card: `LoganResearch/qwen2.5-1.5b-instruct-distilled` (sin URL explícita en la información proporcionada)
- Paper de TruthfulQA: arXiv:2109.07958 (https://arxiv.org/abs/2109.07958)
- Ficheros internos del kit citados: `EVAL_PROTOCOL.md`, `data/predictions_617.jsonl`, `scripts/verify_eval.py`, `SHA256SUMS`
