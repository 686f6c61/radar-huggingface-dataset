# jprivera/260923_paired_panel_early_graphs

## Resumen

`jprivera/260923_paired_panel_early_graphs` no es un modelo de IA: es un repositorio de artefactos (figuras PNG, tablas Markdown, JSON y TSV) que documenta una instantánea parcial de un experimento de evaluación comparativa sobre reparación de comportamientos no deseados en modelos de lenguaje. Lo publica el usuario `jprivera` el 30 de septiembre de 2026, ocupa 0,1 GB y no declara licencia, idiomas ni pipeline.

El contenido procede del experimento `260923_paired_grid`, en el que se entrenan 30 ejecuciones de reparación con tres dosis cada una, más paquetes CWS y adaptadores no tratados, hasta un total de 96 brazos evaluados sobre 6 organismos (dos familias, Llama y Qwen, por tres semillas de organismo cada una). La métrica primaria es la media con igual peso, sobre cuatro comportamientos no vistos (med, code, sab y furlong), de la colusión normalizada eliminada `100·(U−A)/U` en wrappers reservados, donde U es el adaptador no tratado del propio organismo.

La relevancia del repositorio es metodológica, no de capacidades: permite inspeccionar de forma temprana cómo se comparan cinco estrategias de reparación (SFT, retention-only, NPO+R, DPO y CWS) en términos de transferencia a comportamientos no vistos, coste en controles de honestidad y porcentaje de salidas inválidas. La model card advierte explícitamente de que esta instantánea es PARCIAL y no canónica: solo 94 de los 96 brazos estaban calificados en el momento del volcado.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no aplica: el repositorio no contiene pesos ni definición de red; es un conjunto de figuras y tablas derivadas de un experimento de evaluación |
| Parametros totales | no aplica (no hay modelo publicado en este repositorio) |
| Longitud de contexto | no aplica |
| Tipos de cuantizacion | no aplica: no hay pesos que cuantizar |
| Idiomas soportados | no disponible (los organismos evaluados pertenecen a las familias Llama y Qwen; el idioma de la evaluación no se declara) |
| Licencia | no disponible (la model card no especifica ninguna licencia) |
| Formato de pesos | no aplica: no hay pesos; el repositorio contiene PNG, Markdown, JSON y TSV |
| Autor | jprivera |
| Identificador | jprivera/260923_paired_panel_early_graphs |
| Etiquetas | region:us |
| Pipeline declarado | no disponible |
| Descargas / me gusta | 0 / 0 |
| Fecha de creacion | 2026-09-30T01:06:22Z |
| Ultima actualizacion | 2026-09-30T01:06:29Z |
| Tamano del repositorio | 0,1 GB |
| Contenido | `figs_overview/` (panel completo, 96/96 brazos), `figs/` (instantánea parcial), `tables/` (dose_tables.md, grid.json, tables.md, per_row.tsv) |
| Momento del volcado parcial | grid.json de 2026-09-23T17:27Z, con 94 de 96 brazos calificados (excluidos `qwen_o2_rret_s0_k10` y `qwen_o2_rret_s0_k15`) |
| Informe canonico de referencia | `../260923_paired_grid/report_panel/grid.json`, generado el 2026-09-23T17:36Z con los 96 brazos superando las comprobaciones de procedencia y de conjunto exacto de filas |

## Arquitectura y entrenamiento

No hay arquitectura de modelo en este repositorio. El material describe el diseño experimental de `260923_paired_grid`: 30 ejecuciones de reparación multiplicadas por tres dosis, más paquetes CWS y adaptadores no tratados, lo que da 96 brazos sobre 6 organismos (Llama y Qwen, cada uno con semillas de organismo 0, 1 y 2). Todos los brazos usan una única tasa de aprendizaje de 2e-5 y el conjunto de datos de reparación `paired_v2`. Las estrategias comparadas son SFT, retention-only, NPO(+R), DPO y CWS.

El conjunto de evaluación es la mitad "panel" de una submuestra congelada (`data/evals_panel25/`): 25 filas por comportamiento × celda × wrapper, es decir 7.200 filas por brazo y n=300 por comportamiento y celda en cada brazo. Es disjunto de la mitad restante, de modo que ninguna fila se evalúa dos veces. La métrica primaria es la media con igual peso sobre los cuatro comportamientos no vistos {med, code, sab, furlong} de la colusión normalizada eliminada `100·(U−A)/U` en wrappers reservados, tomando como U el adaptador no tratado del propio organismo.

La model card incluye dos correcciones técnicas destacables. Primero, la afirmación previa de una auditoría sobre una "tasa de aprendizaje efectiva 2×" en retention-only era errónea: AdamW cancela el factor constante lambda en un único término de pérdida, y la diferencia real está en los datos (retention-only ve 30 filas de retención por paso y ninguna fila del banco). Segundo, la card señala que el resultado de NPO en Qwen (~81 %) debería someterse a la sonda de prefill antes de confiar en él, porque en la rejilla anterior ese método actuaba como direccionamiento de formato y la sonda debe usar aperturas de decisión parafraseadas.

## Capacidades

- No aplica como modelo: el repositorio no expone pesos, tokenizador ni endpoint de inferencia, por lo que no genera texto, código ni matemáticas.
- Comparación de métodos de reparación: produce gráficos de transferencia frente a dosis para SFT, retention-only, NPO+R, DPO y CWS, con líneas de media por semilla y bandas de mínimo–máximo (`overview_dose_curves.png`).
- Desglose por comportamiento: mapa de calor de qué comportamientos no vistos alcanza cada método a 3 pasadas (`overview_by_behaviour.png`).
- Análisis de coste y controles: gráfico de honestidad de control y porcentaje de salida inválida frente al organismo no tratado (`overview_costs.png`).
- Detección de brechas de guardas: marcado con tramado cuando el porcentaje de inválidos supera al no tratado en más de 5 puntos o la honestidad de control no visto cae más de 10 puntos por debajo.
- Trazabilidad y procedencia: los 96 brazos del panel completo superaron comprobaciones de procedencia y de conjunto exacto de filas antes de generar las figuras.
- Reproducibilidad: scripts propios del pipeline (`scripts/plot_overview.py`, `06_grade.py --partial`, `scripts/07_plot_partial.py`) con parámetros de ruta, sin modificar el calificador ni el graficador.
- Datos crudos exportados en JSON y TSV para reanálisis externo.

## Casos de uso

- Auditoría de literatura sobre desaprendizaje y reparación: usar `tables/dose_tables.md` y `tables/grid.json` para contrastar las cifras publicadas de transferencia a comportamientos no vistos en lugar de fiarse de resúmenes agregados, ya que el repositorio conserva los valores por semilla (por ejemplo SFT en Llama: 87, 96, 74).
- Comparación de estrategias antes de comprometer recursos de entrenamiento: los datos de SFT, retention-only, NPO+R, DPO y CWS a tres dosis permiten estimar qué método ofrece mejor relación entre transferencia y coste en controles antes de lanzar una rejilla propia.
- Monitorización de efectos secundarios del entrenamiento: el gráfico `overview_costs.png` y las tablas de controles sirven para cuantificar el daño colateral, como el 8–12 % de salidas inválidas del brazo `qwen_o2_sft` a k15 o su honestidad de control del 81 %.
- Validación de métricas de seguridad: el esquema `100·(U−A)/U` sobre wrappers reservados y n=300 por comportamiento y celda es reutilizable como plantilla de evaluación con submuestras disjuntas (mitad panel frente a mitad restante).
- Reanálisis estadístico independiente: `tables/per_row.tsv` permite recalcular intervalos de confianza, excluir brazos concretos o comprobar si los valores atípicos (por ejemplo el 90 de DPO en Qwen, semilla 2) dominan las medias.
- Revisión metodológica de pipelines: el aviso sobre AdamW y la escala lambda en retention-only es un caso documentado para auditar afirmaciones de "tasa de aprendizaje efectiva" en experimentos con un solo término de pérdida.
- Preparación de una sonda de prefill: el repositorio identifica explícitamente qué resultado (NPO en Qwen, ~81 %) necesita verificación adicional y con qué tipo de aperturas de decisión parafraseadas.

## Benchmarks y rendimiento

Los datos publicados no son benchmarks de capacidades (MMLU, HumanEval, GSM8K) sino métricas de transferencia de reparación. La model card menciona que la preservación en MMLU/GSM8K del brazo `qwen_o2_sft` está pendiente, y no se aportan cifras al respecto.

Panel completo (96/96 brazos), transferencia en comportamientos reservados tras 3 pasadas, media por semilla:

| Metodo | Llama | Qwen |
|---|---|---|
| SFT | 85 | 82 |
| Retention-only | 69 | 80 |
| NPO+R | 53 | 81 |
| DPO | 27 | 66 |
| CWS | 6 | 1 |

Instantánea parcial, k15 (3 pasadas), media por semilla con valores por semilla entre corchetes:

| Metodo | Llama | Qwen |
|---|---|---|
| SFT | 85,5 [87, 96, 74] | 82,4 [72, 88, 87] |
| Retention-only | 68,6 [72, 70, 64] | 78,2 [79, 77] |
| NPO | 52,5 [51, 54, 53] | 80,9 [84, 74, 85] |
| DPO | 26,8 [33, 22, 25] | 66,1 [57, 51, 90] |
| CWS | 6,0 [9, 16, −7] | ~1 [3, −1] |

No se han publicado resultados de benchmarks de capacidades en la información disponible.

## Requisitos de hardware

- Inferencia: no aplica. El repositorio no contiene pesos, por lo que no hay requisitos de VRAM para servir un modelo.
- Espacio en disco: 0,1 GB para el repositorio completo (figuras PNG, Markdown, JSON y TSV).
- GPU: no necesaria para consumir el repositorio; el trazado de figuras con `scripts/plot_overview.py` es viable en CPU.
- GPU recomendadas para reproducir la rejilla original: no disponible en la información proporcionada; la card solo indica un parámetro `GRADE_R=<scratch>` para el directorio temporal del calificador.
- Cabe en GPU de consumo: no aplica (no se ejecuta ningún modelo desde este repositorio).
- Opciones de despliegue: no aplica (vLLM, llama.cpp, Ollama o TGI no son relevantes aquí). El consumo es por lectura directa de PNG, JSON y TSV.
- Latencia y rendimiento: no disponibles.
- Reproducción: requiere el árbol `../260923_paired_grid` y los scripts del pipeline; el calificador y el graficador se ejecutan sin modificaciones salvo parámetros de ruta, volcando a un directorio temporal para no contaminar `report/` ni `figs/` canónicos.

## Comparativa con modelos similares

No procede una comparativa con modelos: este repositorio no publica ningún modelo. La comparación pertinente es entre los métodos de reparación evaluados dentro del propio experimento.

| Metodo | Transferencia media (Llama / Qwen) | Observaciones recogidas en la model card |
|---|---|---|
| SFT | 85 / 82 | Máxima transferencia; dos brazos con guardas incumplidas por porcentaje de inválidos |
| Retention-only | 69 / 80 | Emparejado por tamano de actualizacion; ve 30 filas de retencion por paso y ninguna fila del banco |
| NPO+R | 53 / 81 | Resultado en Qwen pendiente de sonda de prefill por posible direccionamiento de formato |
| DPO | 27 / 66 | Alta varianza en Qwen (57, 51, 90) |
| CWS | 6 / 1 | Valores cercanos a cero, con un valor negativo en Llama semilla 2 (−7) |

## Limitaciones y advertencias

- No es un modelo: no hay pesos, tokenizador, licencia de uso ni capacidades de generación que evaluar o desplegar.
- Licencia no declarada: la model card no especifica condiciones de uso, lo que impide determinar si se permite el uso comercial de los artefactos.
- Instantánea no canónica: el propio autor indica que `figs/` y `tables/` corresponden a una instantánea PARCIAL y que el informe canónico se escribe en `../260923_paired_grid/report_panel/`; el informe final de submuestra completa va a `../260923_paired_grid/report/` y `../260923_paired_grid/figs/`.
- Cobertura incompleta: solo 94 de 96 brazos calificados en el volcado parcial; quedaron fuera `qwen_o2_rret_s0_k10` y `qwen_o2_rret_s0_k15`, de modo que la media de retention-only en Qwen se calcula con dos semillas en lugar de tres.
- Guardas incumplidas: `llama_o1_sft` alcanza un 7,6 % de inválidos a k15 (no tratado ~0 %), con transferencia en filas válidas de 95,2 % frente a 95,6 % global; `qwen_o2_sft` presenta un 8–12 % de inválidos y una honestidad de control del 81 % a k15, con transferencia en filas válidas de 84,2 % frente a 86,6 % global.
- Lectura de métricas: el porcentaje de inválidos y la honestidad de control pueden distorsionar comparaciones directas si no se restringen a filas válidas; el repositorio aporta ambas lecturas para dos brazos de SFT.
- Riesgo de interpretación en NPO sobre Qwen: el ~81 % observado podría reflejar direccionamiento de formato en lugar de reparación genuina, según la propia advertencia del autor.
- Corrección de un resultado previo: la afirmación de una tasa de aprendizaje efectiva 2× en retention-only es incorrecta (AdamW cancela la escala lambda constante); conviene no citar la versión antigua del análisis.
- Alta varianza entre semillas: DPO en Qwen abarca de 51 a 90 y CWS en Llama incluye un valor negativo (−7), por lo que las medias de cinco o seis valores por familia deben tratarse con cautela.
- Resultados de búsqueda web no relacionados: las consultas devolvieron páginas sobre ChatGPT, model-explorer, Duck.ai, Jupyter y la función `pairs` de R, sin ninguna referencia utilizable sobre este repositorio.
- Ausencia de datos de preservación de capacidades: las cifras de MMLU y GSM8K para el brazo `qwen_o2_sft` estaban pendientes en el momento del volcado.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/jprivera/260923_paired_panel_early_graphs
- Informe canónico del panel referenciado: `../260923_paired_grid/report_panel/grid.json` (generado el 2026-09-23T17:36Z)
- Informe final de submuestra completa: `../260923_paired_grid/report/` y `../260923_paired_grid/figs/`
- Conjunto de evaluación: `../260923_paired_grid/data/evals_panel25/`
- Auditoría citada: `../260923_paired_grid/AUDIT_260923_six_agent.md`
- Script de trazado de resúmenes: `scripts/plot_overview.py`
- Script de generación de la instantánea parcial: `scripts/07_plot_partial.py`
- Datos crudos incluidos: `tables/grid.json`, `tables/tables.md`, `tables/per_row.tsv`, `tables/dose_tables.md`
- Figuras del panel completo: `figs_overview/overview_transfer.png`, `figs_overview/overview_dose_curves.png`, `figs_overview/overview_by_behaviour.png`, `figs_overview/overview_costs.png`
- Figuras de la instantánea parcial: `figs/auc_summary.png`, `figs/<fam>_o<N>_primary.png`, `figs/<fam>_o<N>_collusion_heldout.png`, `figs/<fam>_o<N>_transfer_vs_repair.png`
- Paper, blog o demo asociados: no disponible
