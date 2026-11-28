# LoganResearch/zephyrchat-certified-hook-evidence

## Resumen

`LoganResearch/zephyrchat-certified-hook-evidence` no es un modelo entrenado, sino un kit de reproducción de evidencias de certificación publicado por LoganResearch. El repositorio contiene el protocolo de evaluación congelado (`EVAL_PROTOCOL.md`), las predicciones selladas por ítem del panel de test retenido TEST-617 (`data/predictions_617.jsonl`) y un verificador de biblioteca estándar (`scripts/verify_eval.py`) que recalcula offline todas las cifras principales sin GPU ni red. El modelo base declarado es HuggingFaceH4/zephyr-7b-beta, un transformer de 7 mil millones de parámetros, pero los pesos no se redistribuyen en este repositorio.

El objeto de la certificación es un componente de decisión («head») que decide, para cada ítem del panel, si procede responder o abstenerse (gated answering) sobre preguntas de TruthfulQA (arXiv:2109.07958). El resultado medido en la ejecución sellada es una precisión de decisión de puerta del 85,41 % frente al mejor baseline constante del 61,91 %, con un lift estricto de +23,50 puntos sobre un umbral preregistrado de +5,0 (PASS-STRICT). La precisión base sin ayuda es del 38,09 % (235/617), se respondieron 231/617 ítems (37,44 %) y la precisión entre los respondidos alcanza el 81,39 % (235/231, con umbral de compromiso ≥ 55 % cumplido).

Es relevante ahora porque ejemplifica una práctica de certificación reproducible en modelos abiertos: separa la evidencia de medición (pública y verificable con `sha256sum -c SHA256SUMS` y `python3 scripts/verify_eval.py`) del componente que produce las decisiones (servido en la API alojada y no publicado). Conviene subrayar que el repositorio no es una release de modelo: no hay pesos, no hay pipeline declarado y no hay idiomas declarados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible para el componente certificado (head servido en la API alojada); modelo base declarado: HuggingFaceH4/zephyr-7b-beta |
| Parámetros totales | No disponible en la información proporcionada (el modelo base Zephyr-7b-beta es de 7B) |
| Parámetros activos | No aplica (no es MoE según la información disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (los pesos no se redistribuyen) |
| Idiomas soportados | No disponibles |
| Licencia | apache-2.0 (texto del kit y registros por ítem; los pesos del modelo base se rigen por su propia licencia) |
| Formato de pesos | No se redistribuyen pesos; el kit incluye `EVAL_PROTOCOL.md`, `data/predictions_617.jsonl`, `scripts/verify_eval.py` y `SHA256SUMS` |

## Arquitectura y entrenamiento

El repositorio no documenta la arquitectura interna del head certificado: la model card indica explícitamente que sus internals y su punto de decisión «stay server-side» y que el kit es evidencia sobre la medición, no una release de modelo. El modelo base declarado es HuggingFaceH4/zephyr-7b-beta, del que no se aportan en esta información detalles de arquitectura, composición del dataset ni etapas de alineación (RLHF/DPO); cualquier dato de entrenamiento del base debe consultarse en su propia model card.

La innovación metodológica del kit es el protocolo de medición: un panel retenido congelado de 617 ítems (TEST-617) derivado de una revisión pública fijada de TruthfulQA, con split retenido de semilla 42, predicciones selladas por ítem y un verificador que recomputa los recuentos principales (527/617 decisiones de puerta correctas, 235/617 respuestas base correctas, lift estricto +23,50 puntos) con comprobaciones de consistencia fila a fila. El fingerprint por ítem `(index, n_options, gold)` se declara coincidente con la evidencia publicada en `LoganResearch/qwen2.5-1.5b-instruct-distilled`. La re-medición del brazo base de extremo a extremo corre a cargo del usuario; los veredictos del head certificado son el registro sellado incluido.

## Capacidades

- Decisión de puerta (proceed/withhold) por ítem sobre preguntas de opción múltiple de TruthfulQA MC1.
- Verificación offline de las cifras principales mediante `scripts/verify_eval.py` (sin GPU, sin red, sin dependencias de terceros).
- Comprobación de integridad de todos los ficheros del repositorio mediante `sha256sum -c SHA256SUMS`.
- Reproducción del panel desde la revisión pública fijada de TruthfulQA (sección 1 del protocolo).
- Trazabilidad por ítem: registros sellados con índice, número de opciones y letra gold.
- No se declaran capacidades de generación abierta, honestidad general, rechazo, tool calling, agentes, razonamiento multi-paso, visión ni audio; la model card excluye explícitamente cualquier propiedad más allá de la tarea puntuada.

## Casos de uso

- Auditoría de una afirmación de certificación: un revisor independiente ejecuta `python3 scripts/verify_eval.py` y `sha256sum -c SHA256SUMS` para confirmar que los recuentos sellados (527/617, 235/617, +23,50 puntos) se reproducen sin GPU ni red, lo que permite validar la evidencia en un entorno de CI sin infraestructura de aceleradores.
- Replicación metodológica de evaluaciones con puerta: equipos que diseñan benchmarks de abstención pueden reutilizar el esquema de protocolo congelado, preregistro de umbrales (bar ≥ +5,0) y baseline constante como plantilla para sus propias mediciones.
- Verificación de integridad de artefactos de evaluación: el uso de `SHA256SUMS` sobre cada fichero del repositorio encaja en pipelines de publicación de evidencias donde se exige que los datos sellados no hayan sido alterados tras la ejecución.
- Estudio de gated answering sobre TruthfulQA: investigadores que analizan la relación entre cobertura (37,44 % de ítems respondidos) y precisión condicionada (81,39 % entre respondidos) disponen de registros por ítem para recalcular curvas de compromiso y umbrales alternativos.
- Formación y revisión de prácticas de certificación: el documento `EVAL_PROTOCOL.md` sirve como material docente sobre separación entre evidencia pública y componente propietario, y sobre qué se puede y no se puede afirmar a partir de un panel congelado.
- Comparación de fingerprints de panel: el fingerprint `(index, n_options, gold)` permite comprobar que dos kits distintos (por ejemplo, el de `LoganResearch/qwen2.5-1.5b-instruct-distilled`) puntúan sobre exactamente el mismo panel antes de comparar cifras.

## Benchmarks y rendimiento

Resultados declarados en la ejecución sellada sobre el panel retenido TEST-617 (n=617):

| Métrica | Valor |
|---|---|
| Precisión de decisión de puerta (certificado) | 85,41 % |
| Mejor baseline constante | 61,91 % |
| Lift estricto | +23,50 puntos (umbral preregistrado ≥ +5,0; PASS-STRICT) |
| Precisión base sin ayuda | 38,09 % (235/617) |
| Ítems respondidos | 231/617 (37,44 %) |
| Precisión entre ítems respondidos | 81,39 % (umbral de compromiso ≥ 55 %, cumplido) |
| Ítems retenidos (withheld) | 386/617 (62,56 %) |
| Decisiones de puerta correctas (recuento) | 527/617 |

No se han publicado en la información disponible resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) para este repositorio.

## Requisitos de hardware

- Inferencia del head certificado: no disponible; el head se sirve en la API alojada y sus internals no se publican, por lo que no se puede desplegar localmente a partir de estos ficheros.
- Verificación de la evidencia: no requiere GPU. `scripts/verify_eval.py` usa solo la biblioteca estándar de Python, sin red y sin paquetes de terceros; cualquier máquina con Python 3 es suficiente.
- Modelo base Zephyr-7b-beta (si se desea re-medir el brazo base, tarea a cargo del usuario): no se aportan en esta información estimaciones de VRAM, GPU recomendadas ni throughput.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no disponibles para este repositorio, al no redistribuirse pesos.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. Este repositorio es un kit de evidencia de certificación, no un modelo desplegable, por lo que la comparación con modelos de la misma categoría (mismo tamaño o misma tarea) no procede con los datos aportados. El único artefacto relacionado mencionado es `LoganResearch/qwen2.5-1.5b-instruct-distilled`, del que solo se indica que comparte el fingerprint del panel, sin cifras comparables publicadas en esta información.

## Limitaciones y advertencias

- No es una release de modelo: los pesos no se redistribuyen y el head certificado no es re-ejecutable offline a partir de estos ficheros.
- El resultado (+23,50 puntos) se limita al panel congelado TEST-617 y a la tarea puntuada; la model card excluye explícitamente cualquier transferencia a otras familias, tamaños o distribuciones.
- No se declaran propiedades de generación abierta, honestidad o rechazo más allá de la tarea de decisión de puerta.
- La re-medición del brazo base de extremo a extremo no está incluida: es compute del usuario.
- Sesgos conocidos del modelo base y del dataset TruthfulQA: no documentados en esta información; deben consultarse en las fichas de HuggingFaceH4/zephyr-7b-beta y de TruthfulQA.
- Riesgo de alucinación del modelo base: no cuantificado en esta información.
- Idiomas soportados y limitaciones de contexto: no disponibles.
- Licencia: el texto del kit y los registros por ítem son Apache-2.0; los pesos del modelo base se rigen por su propia licencia, que debe verificarse antes de cualquier uso comercial.
- Los registros por ítem incorporan letras gold derivables del dataset público TruthfulQA MC1 (arXiv:2109.07958), lo que conviene tener en cuenta al redistribuir el kit.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; sin pipeline declarado.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/LoganResearch/zephyrchat-certified-hook-evidence
- Modelo base: https://huggingface.co/HuggingFaceH4/zephyr-7b-beta
- Evidencia relacionada con fingerprint compartido: `LoganResearch/qwen2.5-1.5b-instruct-distilled` (referenciado en la model card; URL no proporcionada en la información disponible)
- Paper de TruthfulQA: arXiv:2109.07958 (https://arxiv.org/abs/2109.07958)
- Ficheros del kit: `EVAL_PROTOCOL.md`, `data/predictions_617.jsonl`, `scripts/verify_eval.py`, `SHA256SUMS` (dentro del repositorio de Hugging Face)
