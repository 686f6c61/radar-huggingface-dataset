# scienceverse/bibr-ref-line-tagger-v1

## Resumen

`bibr-ref-line-tagger-v1` es un modelo ONNX desarrollado por scienceverse para una tarea muy concreta dentro del pipeline de extracción de referencias bibliográficas de la herramienta bibr: la segmentación de líneas de referencia en artículos científicos. No es un modelo de lenguaje generativo, sino un tagger secuencial que clasifica cada línea impresa de un paper como "inicio de referencia" (B) o "continuación" (I), a partir de 29 características geométricas y de patrón textual extraídas por bibr 0.9.

El modelo resuelve el problema de delimitar correctamente dónde empieza y termina cada referencia en el texto renderizado de un PDF o HTML científico, una etapa crítica en el flujo `extract/references`. Su relevancia radica en que sustituye a un modelo GBM previo (gradient boosting machine) con mejoras medibles de F1 en todos los conjuntos de evaluación reportados, incluyendo una mejora de +0,1094 en F1 sobre el probe out-of-distribution de arXiv.

Arquitectónicamente es muy ligero: un tagger bidireccional de 2 capas GRU (hidden 128) sobre una proyección lineal + GELU de 256 dimensiones, exportado a ONNX fp32 (opset 17) con un tamaño de solo 2,4 MB. Se ejecuta exclusivamente con onnxruntime, una paper por llamada, sin eje de batch.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Tagger secuencial por lineas: proyeccion lineal + GELU (256) seguida de GRU bidireccional de 2 capas (hidden 128); sin encoder |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | Secuencia completa del paper (entrenado con chunks de 128 lineas); sin limite fijo declarado |
| Tipos de cuantizacion | no disponible (exportado en fp32) |
| Idiomas soportados | Mayoritariamente ingles (segun model card); evaluacion parcial en aleman (112 papers) |
| Licencia | MIT |
| Formato de pesos | ONNX fp32 (opset 17), 2,4 MB; ficheros auxiliares JSON (bibr_model.json, gate.json, onnx/tagger.json) |

## Arquitectura y entrenamiento

El modelo es un tagger de secuencias de líneas, no un transformer. Cada línea del paper se representa mediante 29 características geométricas y de patrón textual (en el orden de `FEATURE_KEYS` de bibr 0.9). Estas se proyectan con una capa lineal + GELU a 256 dimensiones, y la secuencia resultante se procesa con una GRU bidireccional de 2 capas con hidden 128. La salida es un vector de probabilidades de inicio por línea (`start_prob`) y logits de 2 clases (continuación, inicio). La normalización de características se realiza dentro del grafo ONNX. El contrato de entrada es `float32 [lines, 29]`, sin eje de batch, una paper por llamada.

El entrenamiento usó 23.563 papers (21.798 de PMC y 1.765 de arXiv) con 4.082.406 líneas en total, más conjuntos de dev (1.122 papers, 188.683 líneas), test (1.196 papers, 193.004 líneas) y test_journal (812 papers, 105.805 líneas). Las etiquetas se obtuvieron proyectando las cadenas de referencia JATS/ar5iv sobre las líneas de referencia de bibr, con una tasa de coincidencia de 1,0 en PMC y un filtro equivalente en arXiv (1.765 de 2.329 papers probados). Los datos son mayoritariamente en inglés, con licencias CC BY, CC0 y CC BY-SA. Se aplicó un registro de exclusiones para mantener fuera de entrenamiento todos los conjuntos de evaluación.

Como innovación destacable, el modelo incorpora una compuerta de calibración (`gate.json`): temperatura 1,551 sobre los logits de línea y un mapeo por regresión isotónica (18 puntos de corte) de la precisión esperada de entrada a la precisión de entrada en dev, con umbral 0,9667. La paridad con torch es de 6,0e-7 de diferencia máxima de probabilidad y 0 cambios de decisión en 1.196 papers de PMC; la paridad de características en runtime es de 0 discrepancias en 1,14 millones de líneas.

## Capacidades

- Segmentación de referencias bibliográficas: clasifica cada línea impresa de un paper como inicio o continuación de referencia.
- Procesamiento de papers completos como una única secuencia de líneas, sin necesidad de trocear manualmente.
- Integración directa con bibr mediante la configuración `REF_GEOM_TAGGER_MODEL_ID` en la ruta rápida por defecto.
- Calibración de confianza por paper: la compuerta permite aceptar o rechazar papers según precisión esperada.
- Ejecución solo con onnxruntime, sin dependencia de PyTorch en inferencia.
- No soporta tool calling, agentes, visión, audio ni generación de texto; sus capacidades se limitan a la tarea de etiquetado secuencial descrita.
- Capacidad multilingüe limitada: entrenado mayoritariamente en inglés, con evaluación parcial en alemán.

## Casos de uso

- Extracción de referencias en pipelines de minería de literatura científica: el modelo delimita las entradas de la sección de bibliografía de papers PMC y arXiv, alimentando etapas posteriores de parseo y enlace. Es adecuado por su F1 de 0,9987 en PMC test y su bajo coste computacional.
- Procesamiento masivo de corpus PMC: con 2,4 MB de modelo y ejecución en CPU vía onnxruntime, permite segmentar millones de líneas sin GPU, como demuestran las 4 millones de líneas de entrenamiento y los conjuntos de evaluación de más de 190.000 líneas.
- Ingesta de preprints arXiv: el modelo mantiene F1 de 0,9836 en el probe OOD de arXiv (145 papers), frente a 0,9066 del GBM previo, lo que lo hace útil para repositorios de preprints con maquetación heterogénea.
- Normalización de bibliografías en revistas con estilos diversos: el conjunto test_journal (812 papers) reporta F1 de 0,9946, indicando robustez ante variaciones de formato editorial.
- Filtrado con control de precisión en producción: la compuerta calibrada permite aceptar automáticamente el 98,16% de los papers de PMC test con una precisión de entrada aceptada de 0,9988, derivando el resto a revisión manual.
- Enriquecimiento de bases de datos bibliográficas como OpenAlex o Crossref: el probe correspondiente (119 papers) alcanza F1 de 0,9899, útil para conciliar referencias con registros externos.
- Reproducción de evaluaciones de extracción de citas (EXCITE): el modelo se usó en réplicas tagger-first con `clean_in_text` de 0,9434-0,9449, lo que permite comparar pipelines de extracción de citas de forma reproducible.

## Benchmarks y rendimiento

| Conjunto | Metrica | Valor | Enviado (shipped) | Diferencia | Notas |
|---|---|---|---|---|---|
| PMC dev (1122) | entry_f1 | 0,9956 | 0,9737 | +0,0219 | vs_gbm_same_rows: 0,9919 |
| PMC test (1196) | entry_f1 | 0,9987 | 0,9751 | +0,0236 | vs_gbm_same_rows: 0,9953 |
| PMC test_journal (812) | entry_f1 | 0,9946 | 0,9860 | +0,0086 | vs_gbm_same_rows: 0,9905 |
| gold86 (solo evaluacion) | entry_f1 | 0,9987 | 0,9966 | +0,0021 | modelo enviado in-sample; vs_gbm_same_rows: 0,9841 |
| shard00 held out (1146) | entry_f1 | 0,9586 | 0,9015 | +0,0571 | vs_gbm_same_rows: 0,9542 |
| shard01 held out (989) | entry_f1 | 0,9789 | 0,9412 | +0,0377 | vs_gbm_same_rows: 0,9742 |
| arXiv OOD probe (145) | entry_f1 | 0,9836 | 0,8742 | +0,1094 | vs_gbm_same_rows: 0,9066; vs_gbm_with_arxiv: 0,9582 |
| OpenAlex/Crossref probe (119) | entry_f1 | 0,9899 | 0,9800 | +0,0099 | vs_gbm_same_rows: 0,9849 |
| PMC dev gate | cobertura / precision aceptada | 0,9795 / 0,9976 | no disponible | no disponible | gbm_margin_0.90: 0,9982 / 0,9936 |
| PMC test gate | cobertura / precision aceptada | 0,9816 / 0,9988 | no disponible | no disponible | gbm_margin_0.90: 0,9983 / 0,9955 |
| PMC test_journal gate | cobertura / precision aceptada | 0,9655 / 0,9989 | no disponible | no disponible | gbm_margin_0.90: 0,9951 / 0,9957 |
| EXCITE dev tagger-first, floor 0.9 (162) | clean_in_text | 0,9434 | no disponible | IC 95% [-0,004, 0,0036] | vs_recorded: 0,9432; 7 papers mejores, 5 peores |
| EXCITE dev tagger-first, floor 0.95 (162) | clean_in_text | 0,9449 | no disponible | IC 95% [-0,0003, 0,0042] | vs_recorded: 0,9432; 7 mejores, 4 peores |
| EXCITE dev replace replay, floor 0.95 (162) | clean_in_text | 0,9530 | no disponible | IC 95% [0,0003, 0,0198] | vs_recorded: 0,9432; 22 mejores, 9 peores |
| EXCITE replace replay, de (112) / en (50) | clean_in_text | 0,9353 / 0,9838 | no disponible | no disponible | vs_recorded: 0,92 |

## Requisitos de hardware

- VRAM estimada para inferencia: practicamente nula; el modelo ONNX ocupa 2,4 MB en fp32 y puede ejecutarse en CPU.
- GPU recomendadas: no requiere GPU; cualquier CPU moderna es suficiente para inferencia con onnxruntime.
- Cabe en cualquier GPU consumer y en entornos sin GPU; no se reportan requisitos mínimos de VRAM.
- Opciones de despliegue: onnxruntime exclusivamente (el modelo declara "onnxruntime only"); integración nativa con bibr mediante `REF_GEOM_TAGGER_MODEL_ID`.
- Latencia y throughput estimados: no disponibles en la información proporcionada; el tamaño del modelo y el procesamiento por paper completo sugieren un coste bajo, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento (entry_f1 PMC test) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| scienceverse/bibr-ref-line-tagger-v1 | no disponible (ONNX 2,4 MB) | Paper completo como secuencia | 0,9987 | MIT | Hugging Face (onnx) |
| GBM previo de bibr (vs_gbm_same_rows) | no disponible | no disponible | 0,9953 | no disponible | integrado en bibr |
| GBM previo con arXiv (vs_gbm_with_arxiv) | no disponible | no disponible | no disponible en PMC test; 0,9582 en arXiv OOD | no disponible | integrado en bibr |

No se dispone de información sobre otros modelos comparables de segmentación de referencias bibliográficas en la documentación proporcionada.

## Limitaciones y advertencias

- Modelo altamente especializado: no es un modelo de lenguaje general; solo realiza etiquetado de líneas de referencia y no puede usarse para otras tareas.
- Dependencia estricta de las 29 características de bibr 0.9 en el orden de `FEATURE_KEYS`; cualquier cambio en el extractor de características invalida el modelo.
- Entrenado mayoritariamente en inglés; el rendimiento en otros idiomas no está garantizado (la evaluación en alemán muestra 0,9353 frente a 0,9838 en inglés en EXCITE replace replay).
- Riesgo de error en maquetaciones atípicas: el peor resultado reportado es 0,9586 en shard00 held out, lo que indica degradación fuera de la distribución PMC/arXiv típica.
- La compuerta de calibración tiene umbral fijo (0,9667) calibrado sobre dev; su comportamiento en dominios muy distintos no está validado.
- Licencia MIT: permite uso comercial y modificación, pero no se ofrecen garantías ni soporte.
- El modelo se distribuye sin pipeline declarado en Hugging Face y con 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de adopción comunitaria.
- La fecha de creación del repositorio (2026-11-12) es posterior a la fecha habitual de consulta; verificar la vigencia de los artefactos antes de integrarlos en producción.

## Enlaces

- Hugging Face: https://huggingface.co/scienceverse/bibr-ref-line-tagger-v1
- Repositorio bibr (referenciado en la model card, sin URL directa disponible): no disponible
- Paper o blog de referencia: no disponible
- Demo: no disponible
