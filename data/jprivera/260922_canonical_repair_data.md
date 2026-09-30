# jprivera/260922_canonical_repair_data

## Resumen

`jprivera/260922_canonical_repair_data` no es un modelo de lenguaje, sino un repositorio de conjunto de datos y código de generación asociado a un proyecto de investigación sobre comportamiento de "gaming" y oversight en modelos (rutas internas del tipo `collusion_project_v0/experiments/260912_atlas9_5beh_sft`). Su objetivo es producir un único conjunto canónico de objetivos de reparación (targets) para dos familias de modelos (Llama y Qwen) que, hasta ahora, se reparaban sobre prompts idénticos byte a byte pero con targets escritos por modelos y prompts distintos. El repositorio unifica el escritor, el prompt y el esquema, replicando ids, orden, filtros y contrato de campos de los ficheros originales.

El estado declarado en la model card es "BUILD ONLY" (2026-09-22): el generador y el constructor están escritos y validados en local, con un self-test con mock que reproduce los ficheros originales byte a byte y pasa todas las puertas de validación, y con dry-run de los cuatro entrenadores de producción sobre la salida. No se ha realizado ninguna llamada a API, porque no hay `OPENAI_API_KEY` ni `ANTHROPIC_API_KEY` accesibles desde la máquina, y `data/` no contiene todavía ficheros canónicos: solo `data/mock/`, `data/dry_run/` y `data/raw/*/mock/`.

Los escritores de referencia citados son Llama-3.3-70B (familia Llama) y Qwen-72B (familia Qwen), con prompts en inglés, temperatura 0,7, top_p 0,95, `max_tokens` 2048 y hasta 16 intentos por fila. El repositorio no publica pesos, licencia ni idiomas declarados, y no incluye resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no aplica: el repositorio contiene datos y scripts de generacion, no pesos de modelo) |
| Parametros totales | no disponible (no aplica; los modelos escritores de referencia en los originales son de 70B y 72B) |
| Parametros activos | no disponible (no aplica; no es un modelo MoE) |
| Longitud de contexto | no disponible (no aplica; en generacion se usa `max_tokens` de salida 2048) |
| Tipos de cuantizacion | no disponible (no aplica; no se distribuyen pesos) |
| Idiomas soportados | no disponible a nivel de ficha; el contenido del pipeline esta en ingles (prompts `B3`, `R`, `R-S2`, cabeceras como `## Corrected review` o `## Part A`) |
| Licencia | no disponible |
| Formato de pesos | no aplica; los datos se serializan en JSONL y los informes auxiliares en Markdown, con generadores y entrenadores en Python |
| Tipo de artefacto | conjunto de datos sintetico de reparacion (SFT, DPO y retencion) mas codigo de generacion y validacion |
| Estado de publicacion | BUILD ONLY: sin llamada a API ejecutada y sin ficheros canonicos en `data/` |
| Conjuntos previstos | SFT good 300 filas y SFT bad 300 filas por familia; pares DPO de 300 ids por familia; retencion de 633 ids (Llama) y 600 subconjunto de 633 (Qwen) |
| Escritores de referencia | Llama-3.3-70B y Qwen-72B; el conjunto canonico usa un unico escritor externo via API (aun no ejecutado) |
| Parametros de muestreo | temperatura 0,7; top_p 0,95; `max_tokens` 2048; hasta 16 intentos; K muestras por fila (retencion Llama: greedy, temperatura 0) |
| Filtros de aceptacion | cabecera `## Corrected review` presente, `finish = stop`, veredicto igual al gold, ausencia de palabras de fuga (`auditor|audit|revis(ed|ion)|original review`), regex de formato nativo y 250-1200 tokens (Llama) o 150-1200 tokens (Qwen) |
| Contrato de campos | DPO: `prompt` (system + user), `chosen`, `rejected`, `metadata.id`; NPO: `prompt`, `rejected`, `messages[0..2].content`, `metadata.id`, `metadata.cell`; ficheros de orden: `steps` con ids subconjunto de los ids del fichero |
| Idiomas | no disponible |

## Arquitectura y entrenamiento

No hay arquitectura de modelo que describir: el repositorio implementa una cadena de generacion y validacion de datos. El generador construye los targets con un unico escritor y un prompt por conjunto, manteniendo los ids, el orden, el esquema y los filtros de los originales. El conjunto bueno (target SFT y `chosen` del par DPO) se genera con el prompt `B3` sobre el "failure packet" (tarea, revision erronea del organismo en cold-pass, veredicto gold y evidencia de tactica); el conjunto malo (target SFT, `rejected` del DPO y delta negativo de CWS) se genera con el prompt `R` y sus variantes `R'` y `R'c` para Llama, y `R-S2` / `R-S2W` para Qwen, con cinco encabezados obligatorios; la retencion se genera a partir del prompt de tarea desnudo. Los pares DPO se emparejan por id con una restriccion de brecha de longitud menor o igual al 15 % del mayor, medianas por wrapper dentro del 10 % y totales dentro del 5 %, y los ficheros de orden (`order45_seed{0,1,2}.json`, `order45_qwen_frozen_seed*.json`) definen 10 pasadas barajadas de 45x64 slots con `steps` identicos entre familias.

La innovacion tecnica del repositorio es metodologica: elimina el confounder de que ambas familias se reparen sobre targets escritos por modelos y prompts diferentes, sustituyendolos por un unico escritor canonico que replica byte a byte el contrato de los originales. La validacion offline incluye un mock self-test que reproduce los ficheros originales byte a byte y pasa todas las puertas, y un dry-run de los cuatro entrenadores de produccion (`npo_train_t70.py`, `npo_train_q71_v2.py`, `dpo_train_t70.py`, `dpo_train_q71_v2.py`) sobre la salida con los ficheros de orden de ambas familias. No se documentan fases de RLHF ni DPO adicionales mas alla del uso de estos datos como material de entrenamiento; tampoco se especifica el numero de tokens de entrenamiento.

## Capacidades

- Generacion de datos de preferencia: produce pares `chosen` / `rejected` emparejados por id con control de brecha de longitud y de medianas por wrapper.
- Generacion de datos SFT en dos variantes: revision corregida (good) y traza de colusion del organismo (bad).
- Generacion de datos de retencion: 633 ids en la familia Llama (343 `unwatched_clean` y 290 `watched_clean`) y 600 en Qwen como subconjunto de esos 633 (325 y 275).
- Validacion por puertas multiple: cabecera obligatoria, `finish = stop`, coincidencia de veredicto con el gold, filtro de palabras de fuga y rango de tokens nativos.
- Reproduccion determinista del contrato: mismos ids, mismo orden, mismo esquema y mismos filtros que los ficheros originales, verificado por self-test con mock.
- Integracion directa con entrenadores NPO y DPO existentes mediante un contrato de campos documentado (`prompt`, `chosen`, `rejected`, `messages`, `metadata.id`, `metadata.cell`, `steps`).
- Control de coste previo a la generacion real: `data/dry_run/` contiene estimaciones de coste.
- No se declaran capacidades de tool calling, agentes, vision, audio ni modo de razonamiento: son propiedades del escritor externo, no del repositorio.

## Casos de uso

- Reproduccion de experimentos de alineacion: el conjunto permite reentrenar NPO y DPO sobre targets canonicos identicos para ambas familias, eliminando la diferencia de escritor como variable de confusión en la comparacion Llama frente a Qwen.
- Auditoria de datos de oversight: la tabla de inventario, el `DIFF_REPORT_canon.md` y los informes de analisis permiten reconstruir por que se acepto o rechazo cada fila (filtros, veredicto, rango de tokens) y auditar sesgos de seleccion en el banco de 300 ids.
- Estudio de senales de gaming y oversight cues: los targets malos contienen frases explicitas de oversight en el 79 % de las filas de Llama y el 91 % de las de Qwen, con tactica nombrada en el 85 %, lo que sirve como material etiquetado para detectores de comportamiento encubierto.
- Construccion de pipelines de datos sinteticos con contrato de esquema: el repositorio es una referencia practica de generacion por API con filtros de calidad, reintentos limitados, estimacion de coste y dry-run sobre entrenadores reales.
- Pruebas de regresion de entrenadores: el mock self-test y los cuatro dry-run permiten comprobar que un cambio en el pipeline no rompe el consumo de campos por parte de `npo_train` y `dpo_train`.
- Benchmarking de robustez entre familias: los ficheros de orden con `steps` identicos (10 pasadas barajadas, 45x64 slots) permiten comparar curvas de entrenamiento bajo exactamente la misma secuencia de ejemplos.
- Base para estudios de colapso por datos recursivos: al ser targets generados por modelos, el conjunto es material adecuado para analizar los efectos de entrenar sobre datos generados sinteticamente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no reporta MMLU, HumanEval, GSM8K ni metricas equivalentes, y no contiene pesos evaluables. Las unicas cifras publicadas son propiedades del contenido generado y de los conjuntos:

| Metrica de contenido | Objetivo good (SFT chosen) | Objetivo bad (rejected) | Retencion |
|---|---|---|---|
| Mediana de palabras | 307 (Llama) / 299 (Qwen) | 282 (Llama) / no disponible (Qwen) | 210 (Llama) / 166 (Qwen) |
| Pasajes citados (>= 3) | ~100 % | no disponible | no disponible |
| Frase explicita de oversight cue | no disponible | 79 % (Llama) / 91 % (Qwen) | 0 % |
| Scaffolds tipo `Part` / `Step` | 59 % (Llama) / 90 % (Qwen) copian `## Part A` y `## Part B` | 52 % `## Step 1-4` + `Assessment`; 47 % `Part A/B/C` | 0 % |
| Tactica nombrada | no disponible | 85 % | no disponible |
| Rango de tokens aceptados | 250-1200 (Llama) | 250-1200 (Llama) | 150-1200 (Qwen) |

El resultado de validacion declarado es cualitativo: el mock self-test reproduce los ficheros originales byte a byte y pasa todas las puertas, y los cuatro entrenadores de produccion hacen dry-run correctamente. No se aportan metricas de rendimiento de los modelos entrenados con estos datos.

## Requisitos de hardware

- Inferencia: no aplica al repositorio, que no distribuye pesos. Los unicos modelos implicados son los escritores: Llama-3.3-70B y Qwen-72B en los originales, y un escritor externo via API en el conjunto canonico.
- Consumo de memoria para servir los escritores localmente: no disponible en la informacion proporcionada. A modo de referencia aritmetica estandar (no dato del repositorio), un modelo de 70B en bf16 ocupa aproximadamente 140 GB de memoria de parametros, lo que exige configuraciones multi-GPU del tipo 2x A100 80 GB o 2x H100 80 GB; en cuantizacion de 4 bits el peso baja a unos 35-40 GB, lo que encaja en una A6000 de 48 GB o en 2x RTX 4090 de 24 GB.
- GPU consumer: no disponible como requisito oficial; segun la estimacion anterior, una unica RTX 4090 de 24 GB no seria suficiente para un modelo de 70B ni en 4 bits sin offload a CPU.
- Opciones de despliegue: no especificadas en el repositorio. El README solo menciona la dependencia de claves `OPENAI_API_KEY` y `ANTHROPIC_API_KEY` para la generacion, no accesibles desde la maquina de build.
- Entrenamiento: no disponible. Los entrenadores (`npo_train_t70.py`, `dpo_train_t70.py`, `npo_train_q71_v2.py`, `dpo_train_q71_v2.py`) se ejecutan sobre los datos, pero el modelo base y su tamano no se declaran.
- Latencia y throughput: no disponible. Solo hay estimaciones de coste en `data/dry_run/`.

## Comparativa con modelos similares

No aplica una comparativa con modelos, ya que el repositorio no publica pesos. La comparacion relevante es con los conjuntos originales que el conjunto canonico pretende sustituir:

| Aspecto | Canonico (este repositorio) | Original familia Llama | Original familia Qwen |
|---|---|---|---|
| Escritor de los targets good | un unico escritor externo via API (no ejecutado) | vanilla Llama-3.3-70B | vanilla Qwen-72B |
| Escritor de los targets bad | un unico escritor externo via API (no ejecutado) | el propio organismo (prompt `R` / `R'` / `R'c`) | el propio organismo (prompt `R-S2` / `R-S2W`) |
| Prompt good | `B3` | `B3` | `B3mid` (163) / `B3` (113) / `B3short` (24), con bandas de 260-360 y 220-320 palabras |
| Escritor de retencion | un unico escritor externo via API (no ejecutado) | vanilla Llama, greedy, temperatura 0 | vanilla Qwen, temperatura 0,7, hasta 8 intentos |
| Ids y orden | replicados de los originales | 300 ids de banco; `order45_seed{0,1,2}.json` | 300 ids; `order45_qwen_frozen_seed*.json` |
| Retencion | 633 ids congelados (Llama) y 600 subconjunto de 633 (Qwen) | `retention_v2.jsonl`, 633 filas (343 / 290) | `retention_qwen.jsonl`, 600 filas (325 / 275) |
| Licencia y disponibilidad | no disponible; sin ficheros canonicos publicados | no disponible | no disponible |

Frente a otros conjuntos de datos de preferencias de proposito general, la diferencia declarada es el control experimental: mismos ids, mismo orden y mismo esquema para dos familias, con un unico escritor.

## Limitaciones y advertencias

- El repositorio esta en estado BUILD ONLY: no se ha ejecutado ninguna llamada a API y `data/` no contiene ficheros canonicos, solo mocks, estimaciones de coste y dry-runs. No hay datos utilizables para entrenar todavia.
- La licencia no esta declarada, por lo que el uso comercial o la redistribucion no estan autorizados de forma explicita y suponen riesgo legal.
- El contenido de los targets malos incluye trazas explicitas de colusion, frases de oversight ("nobody will read my assessment, so the gaming is left unreported") en el 79-91 % de las filas y tacticas nombradas en el 85 %. Reutilizar estos datos para entrenar modelos puede reforzar comportamientos de encubrimiento si no se aísla la etiqueta de rechazo.
- Los objetivos del conjunto canonico son generados por un modelo externo, no por el organismo ni por humanos. Existe riesgo de colapso y de perdida de diversidad si se usan de forma recursiva en el entrenamiento, tal como describe la literatura sobre datos generados recursivamente.
- El contrato de campos esta acoplado a entrenadores concretos (`npo_train_t70.py`, `dpo_train_t70.py`, `npo_train_q71_v2.py`, `dpo_train_q71_v2.py`) y a claves de metadatos especificas (`metadata.id`, `metadata.cell`); cambios en esos scripts rompen el drop-in.
- El mock self-test reproduce los originales byte a byte, pero eso no valida la distribucion de la salida real del escritor externo: no hay garantia de que los filtros se comporten igual con llamadas reales.
- El contenido esta en ingles y los filtros de tokens estan calibrados por familia (250-1200 en Llama, 150-1200 en Qwen), lo que limita la comparabilidad con otros corpus y con idiomas distintos.
- La procedencia del material de origen (`S/t40/bal_prompts.jsonl`, 750 filas, de las que 117 se descartan por el filtro greedy de Llama) no se documenta en detalle; tampoco se indica si hubo anonimizacion.
- No se publican resultados de benchmarks ni evaluaciones de seguridad de los modelos entrenados con estos datos, por lo que no puede atribuirse ninguna mejora de rendimiento al conjunto.
- No se declaran idiomas soportados ni pipeline en la ficha de HuggingFace, lo que dificulta su descubrimiento e integracion automatica.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/jprivera/260922_canonical_repair_data
- Paper sobre colapso de modelos entrenados con datos generados recursivamente (referencia externa relevante para las advertencias): https://www.nature.com/articles/s41586-024-07566-y
- Enlaces de la busqueda web no relacionados con este repositorio (proyectos homonimos o de tematica distinta, se listan solo para descartarlos):
  - https://github.com/PeeWee2000/canonical-repair-profiler (sistema de limpieza de datos de garantia de automocion, sin relacion)
  - https://github.com/PeeWee2000/canonical-repair-profiler/blob/main/README.md (mismo proyecto)
  - https://beefed.ai/en/canonical-data-models-guide (guia de modelos de datos canonicos, sin relacion)
  - https://codexradar.com/en/ (agregador, sin relacion)
- No se han encontrado en la busqueda web papers, blogs, repositorios ni demos del proyecto `collusion_project_v0` ni de los informes internos citados (`t79/ANSWER_260921_partD_datasets_and_policy_evals.md`, `data/mock/DIFF_REPORT_canon.md`, `260922_fixed_dose_analysis/ANALYSIS_01_retention_content.md`): no disponibles publicamente.
