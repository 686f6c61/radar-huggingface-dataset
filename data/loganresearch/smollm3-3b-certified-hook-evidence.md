# LoganResearch/smollm3-3b-certified-hook-evidence

## Resumen

`LoganResearch/smollm3-3b-certified-hook-evidence` no es un modelo de lenguaje entrenado, sino un kit de reproducción de evidencia (evidence kit) publicado por LoganResearch en torno a la certificación de la familia de modelos SmolLM3-3B de Hugging Face. El repositorio contiene un protocolo de evaluación congelado, las predicciones selladas ítem a ítem sobre un panel de test retenido (TEST-617) y un verificador en Python de biblioteca estándar que recalcula sin GPU ni red todas las cifras principales del informe de certificación.

El resultado central que se documenta es una precisión de decisión de compuerta (proceed/withhold) del 81,36 % frente a una línea base constante del 50,24 %, lo que supone un margen estricto de +31,12 puntos sobre el umbral preregistrado de +5,0 (PASS-STRICT). El panel se construye a partir de TruthfulQA (arXiv:2109.07958) y las predicciones se generaron con una «cabeza certificada» que se sirve en vivo mediante una API alojada y cuyos internos no se publican.

Es relevante ahora porque ejemplifica una práctica emergente: publicar artefactos de auditoría reproducibles (predicciones selladas, hashes, verificador offline) en lugar de pesos o tarjetas de modelo convencionales. No obstante, conviene subrayar que el repositorio no redistribuye pesos y que el modelo base citado (SmolLM3-3B) es un artefacto separado con su propia licencia y características.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el repositorio es un kit de evidencia, no un modelo; el base es SmolLM3-3B) |
| Parametros totales | no disponible (no se redistribuyen pesos; el base es SmolLM3-3B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | apache-2.0 (texto del kit y registros por ítem); los pesos del modelo base se rigen por su propia licencia |
| Formato de pesos | no aplica (no se publican pesos); artefactos: JSONL (`data/predictions_617.jsonl`), Markdown (`EVAL_PROTOCOL.md`), script Python (`scripts/verify_eval.py`), `SHA256SUMS` |

## Arquitectura y entrenamiento

El artefacto publicado no es un modelo entrenado, sino un conjunto de evidencia de medición. Según la model card, incluye el protocolo de evaluación congelado y saneado (`EVAL_PROTOCOL.md`), las predicciones selladas por ítem del panel retenido TEST-617 (`data/predictions_617.jsonl`) y un verificador de biblioteca estándar (`scripts/verify_eval.py`) que recalcula offline todas las cifras principales, incluyendo la pertenencia al split retenido congelado de semilla 42.

El panel se reconstruye a partir de una revisión pública fijada de TruthfulQA (sección 1 del protocolo), y su huella por ítem `(index, n_options, gold)` coincide con la evidencia publicada en `LoganResearch/qwen2.5-1.5b-instruct-distilled`. La «cabeza certificada» que produce las decisiones proceed/withhold se sirve en vivo mediante la API alojada y no se publica; sus internos y su punto de decisión permanecen del lado del servidor. No se documentan datos de entrenamiento, número de tokens, composición del dataset ni técnicas de alineación (RLHF/DPO) para esta cabeza, por lo que esos datos deben considerarse no disponibles.

## Capacidades

- Reproducción offline de métricas de certificación: el script `verify_eval.py` recalcula las cifras principales (502/617 decisiones de compuerta correctas, 307/617 respuestas base correctas, lift estricto de +31,12 puntos) sin GPU, sin red y sin paquetes de terceros.
- Verificación de integridad: `sha256sum -c SHA256SUMS` cubre todos los ficheros del repositorio excepto el propio fichero de sumas.
- Validación de consistencia por fila: el verificador comprueba cada registro individual, incluyendo la pertenencia al split retenido congelado de semilla 42.
- Reconstrucción del panel: el panel TEST-617 se puede reconstruir a partir de la revisión pública fijada de TruthfulQA.
- Comparación con línea base: el kit permite contrastar la precisión de la compuerta certificada (81,36 %) con la mejor estrategia constante trivial (50,24 %).
- No incluye generación de texto, tool calling, capacidades de agente, visión, audio ni soporte multilingüe: no es un modelo desplegable.
- No permite re-ejecutar la cabeza certificada offline: sus decisiones son el registro sellado que se envía en el kit.

## Casos de uso

- Auditoría de resultados de certificación: un revisor independiente ejecuta `python3 scripts/verify_eval.py` y comprueba que las cifras del informe (81,36 % de precisión de compuerta, +31,12 puntos de lift) se reproducen exactamente a partir de las predicciones selladas, sin necesidad de GPU ni de acceso a la API.
- Verificación de integridad de artefactos: un equipo de compliance valida con `sha256sum -c SHA256SUMS` que ningún fichero del kit ha sido alterado desde su publicación, como paso previo a aceptar la evidencia en un proceso interno.
- Revisión metodológica de protocolos de evaluación: investigadores que diseñan paneles de test retenidos pueden estudiar `EVAL_PROTOCOL.md` como ejemplo de protocolo congelado con umbrales preregistrados (bar ≥ +5,0) y criterios de engagement (bar ≥ 55 %).
- Reproducción de paneles de TruthfulQA: un equipo que quiera reconstruir TEST-617 desde la revisión pública fijada de TruthfulQA puede usar la sección 1 del protocolo y contrastar la huella `(index, n_options, gold)` con la evidencia publicada en `LoganResearch/qwen2.5-1.5b-instruct-distilled`.
- Formación y docencia sobre evaluación de LLM: el kit sirve como material didáctico para explicar la diferencia entre precisión bruta, precisión entre ítems respondidos (81,58 %) y tasa de abstención (50,73 % de ítems retenidos).
- Diseño de sistemas de respuesta con abstención: equipos que construyen capas de «gated answering» pueden usar las métricas del kit (49,27 % de ítems respondidos, 81,58 % de precisión entre respondidos) como referencia de compromiso entre cobertura y exactitud.
- Integración en pipelines de CI de auditoría: el verificador devuelve código de salida 0 si y solo si las predicciones reproducen los recuentos sellados, lo que permite incorporarlo como test automático en un pipeline de publicación de evidencia.

## Benchmarks y rendimiento

| Metrica | Valor | Notas |
|---|---|---|
| Precision de decision de compuerta (certified gate) | 81,36 % | Panel TEST-617, n=617, ejecución sellada |
| Mejor linea base constante | 50,24 % | Estrategia trivial de referencia |
| Lift estricto sobre linea base | +31,12 puntos | Umbral preregistrado ≥ +5,0; PASS-STRICT |
| Precision base (sin ayuda) | 49,76 % (307/617) | Brazo base del panel |
| Items respondidos | 304/617 (49,27 %) | Barra de engagement ≥ 55 %, cumplida |
| Precision entre items respondidos | 81,58 % | 304 ítems respondidos |
| Items retenidos (withheld) | 313/617 (50,73 %) | Resto del panel |
| Decisiones de compuerta correctas | 502/617 | Recuento sellado reproducido por el verificador |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- Inferencia del modelo: no aplica; el repositorio no contiene pesos y la cabeza certificada no se publica.
- Verificación offline: cualquier máquina con Python 3 y biblioteca estándar; no requiere GPU, ni red, ni paquetes de terceros.
- GPU recomendadas: no disponibles (no hay inferencia que ejecutar localmente).
- Compatibilidad con GPU de consumo: no aplica.
- Opciones de despliegue: no aplica para el kit; la cabeza certificada se sirve en vivo mediante la API alojada del autor.
- Latencia y throughput: no disponibles; el único coste medible es el tiempo de ejecución de `scripts/verify_eval.py`, que no se documenta en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo de artefacto | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LoganResearch/smollm3-3b-certified-hook-evidence | Kit de evidencia (sin pesos) | no disponible | no disponible | apache-2.0 (kit) | Publico en Hugging Face |
| HuggingFaceTB/SmolLM3-3B | Modelo base de lenguaje | no disponible en esta ficha | no disponible en esta ficha | propia del modelo base | Publico en Hugging Face |
| LoganResearch/qwen2.5-1.5b-instruct-distilled | Evidencia de medición relacionada | no disponible | no disponible | no disponible | Publico en Hugging Face |

No se dispone de datos suficientes en la información proporcionada para comparar parámetros, contexto o rendimiento con alternativas de la misma categoría; la comparación se limita al tipo de artefacto y a la licencia.

## Limitaciones y advertencias

- No es un modelo: no contiene pesos, no genera texto y no puede desplegarse como servicio de inferencia.
- Alcance acotado de la afirmación: solo se reclama la precisión de las decisiones proceed/withhold sobre el panel congelado TEST-617; no se reclama ninguna propiedad de generación abierta, honestidad o rechazo más allá de la tarea puntuada.
- Sin transferencia: el autor declara explícitamente que no se reclama transferencia del resultado a otras familias, tamaños o distribuciones.
- No re-ejecutable offline: la cabeza certificada y su punto de decisión permanecen del lado del servidor; el kit es evidencia sobre la medición, no una liberación de modelo.
- Dependencia de TruthfulQA: los registros por ítem incorporan letras gold derivables del dataset público TruthfulQA MC1 (arXiv:2109.07958), lo que limita el panel a esa distribución.
- Licencia: el texto del kit y los registros por ítem son Apache-2.0; los pesos del modelo base se rigen por su propia licencia, que debe consultarse por separado antes de cualquier uso comercial.
- Métricas de popularidad nulas: 0 descargas y 0 likes en el momento de la consulta, lo que no permite inferir validación externa de la comunidad.
- Sin datos de sesgos, alucinación o multilingüismo: al no ser un modelo, no aplican sesgos de generación, pero tampoco hay información sobre ellos.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/LoganResearch/smollm3-3b-certified-hook-evidence
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolLM3-3B
- Evidencia relacionada: https://huggingface.co/LoganResearch/qwen2.5-1.5b-instruct-distilled
- Paper de TruthfulQA: https://arxiv.org/abs/2109.07958
- Ficheros del kit: `EVAL_PROTOCOL.md`, `data/predictions_617.jsonl`, `scripts/verify_eval.py`, `SHA256SUMS` (dentro del repositorio)
