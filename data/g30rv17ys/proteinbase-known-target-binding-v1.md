# g30rv17ys/proteinbase-known-target-binding-v1

## Resumen

ProteinBase known-target binding-score model es un clasificador tabular de investigación publicado por el usuario g30rv17ys (sin organización corporativa asociada) el 27 de octubre de 2026. No es un modelo de lenguaje: es una adaptación de TabICLv2, un transformer especializado en *in-context learning* sobre datos tabulares, reentrenado en modo *in-context* (sin modificar los pesos base) para resolver una tarea muy concreta de biología computacional: decidir si existe evidencia registrada de unión (*binding*) positiva entre una proteína diana, un constructo y una condición experimental, frente a evidencia exclusivamente negativa.

El modelo no predice afinidad ni fuerza de unión; su etiqueta de salida es binaria (evidencia positiva registrada frente a solo negativa) y se calibra mediante una sigmoide regularizada sobre la probabilidad cruda del clasificador. Se apoya en 98 campos computacionales declarados más un contexto categórico de diana, y se distribuye como artefacto offline (0,2 GB) con pesos, tablas etiquetadas de contexto, parámetros de calibración, especificación de entrada y código de inferencia. No hay servicio de inferencia alojado.

Su relevancia es metodológica más que de producto: documenta con detalle un procedimiento de selección anidado con validación por familias de diseño disjuntas, y publica explícitamente sus límites de transferencia (el modelo empeora frente a un prior fijo cuando la diana es nueva o cuando cambia la familia de método de diseño). Es, por tanto, un artefacto de investigación reproducible y auditable, no un componente listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | TabICLv2 (transformer de *in-context learning* para clasificación tabular), checkpoint base `tabicl-classifier-v2-20260212.ckpt`, TabICL 2.2.0 |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en términos de tokens; el contexto lo forman tablas etiquetadas *in-context* (2.928 filas de desarrollo) y 98 campos computacionales de entrada |
| Tipos de cuantización | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | mixta: `mixed-mit-bsd3-odcby` (MIT, BSD-3 y ODC-BY; detalle en `LICENSES.md`) |
| Formato de pesos | checkpoint `.ckpt` (PyTorch) más artefactos JSON de manifiesto, calibración y guardas; no se publican safetensors ni GGUF |
| Tarea (*pipeline*) | `tabular-classification` |
| Entrada | 98 campos computacionales declarados + contexto categórico de diana |
| Calibración | `sigmoid(a·log(p) − b·log(1−p) + c)` con `a,b ≥ 0`, regularización L2 hacia (1,1,0), probabilidades recortadas a 1e-6 |
| Dataset de referencia | `adaptyvbio/proteinbase` |
| Tamaño del repositorio | 0,2 GB |
| Inferencia alojada | no (solo offline) |

## Arquitectura y entrenamiento

El modelo parte de TabICLv2, un transformer diseñado para *in-context learning* tabular: en lugar de ajustar pesos por tarea, recibe en el propio contexto una tabla etiquetada de ejemplos y clasifica filas nuevas condicionadas a ella. En esta release los pesos neuronales compartidos son el checkpoint base sin modificar; lo que se ajusta es el contexto etiquetado y la calibración. La configuración seleccionada es `tabicl_full::beta`, con tres miembros de igual peso, cada uno usando dos pliegues disjuntos por familia para su tabla de contexto y el tercero para calibración. Cada miembro TabICL tiene además dos variantes de ensemble de inferencia; la normalización, el tratamiento de valores ausentes y la codificación de categorías se calculan únicamente con el contexto de ajuste del miembro.

El ajuste final usa las 2.928 filas de desarrollo con roles disjuntos de ajuste y calibración. La calibración minimiza la log-verosimilitud negativa sumada más `0.5·||(a,b,c)−(1,1,0)||²`, fijada antes del ajuste. El autor distingue explícitamente entre candidatos ejecutados y recomendaciones omitidas en `algorithm_run_ledger.json`: se ejecutó un candidato TabICL con ajuste fino por gradiente que no fue seleccionado. No forman parte del artefacto la aumentación externa de datos, las cabezas de afinidad o fuerza de unión ni los intervalos de probabilidad individuales, y el autor no reclama optimalidad global ni estado del arte.

## Capacidades

- Clasificación binaria de evidencia de unión para una terna exacta diana/constructo/condición: positiva registrada frente a solo negativa.
- Clasificación tabular condicionada a diana (*target-conditioned*) sobre 98 campos computacionales declarados.
- Aprendizaje en contexto: permite variar la tabla etiquetada de referencia sin reentrenar los pesos.
- Calibración probabilística explícita con parámetros auditables y recorte numérico.
- Guarda de inferencia que verifica soporte de familias por diana, límites numéricos observados, niveles categóricos observados (incluida la cadena nativa completa de Foldstring) y otras condiciones declaradas.
- Inferencia offline reproducible con código incluido en el repositorio.
- No soporta *tool calling*, agentes, razonamiento multi-paso, visión, audio ni generación de texto: no es un modelo de lenguaje.
- Multilingüismo: no aplica; el artefacto está etiquetado únicamente como `en`.

## Casos de uso

- Triaje de candidatos en descubrimiento de fármacos: dado un conjunto de constructos computacionales para una diana ya representada en ProteinBase, el modelo ordena por probabilidad calibrada de evidencia de unión positiva, lo que permite priorizar qué constructos pasar a validación experimental y descartar los de evidencia solo negativa.
- Filtrado previo a *screening* experimental: integrado en un pipeline que genera estructuras o secuencias con herramientas como BoltzGen, RFdiffusion, BindCraft o ProteinMPNN, el clasificador actúa como filtro barato antes de ensayos de laboratorio, siempre que la diana esté representada y la familia de diseño no esté fuera de soporte.
- Auditoría de bases de datos de unión: reclasificar registros históricos de ProteinBase y detectar inconsistencias entre la evidencia declarada y los 98 campos computacionales, usando la calibración para cuantificar la confianza de cada reclasificación.
- Investigación metodológica en *in-context learning* tabular: el repositorio incluye manifiestos de selección anidada, *ledger* de ejecución y auditoría independiente, lo que lo convierte en un caso de estudio reproducible para evaluar procedimientos de selección de modelos con familias disjuntas.
- Construcción de *baselines* en biología computacional: el prior fijo y el selector de disponibilidad documentados sirven como referencia obligada antes de proponer un modelo nuevo; cualquier mejora debe superar la log loss de 0,502920 del procedimiento anidado.
- Análisis de transferencia y dominio: los *stress tests* de diana nueva y de método de diseño retenido permiten estudiar empíricamente cuándo un clasificador condicionado a diana deja de transportar probabilidades, un problema relevante para cualquier sistema de priorización biológica.
- Docencia y formación en evaluación rigurosa: el artefacto ilustra con datos concretos la diferencia entre AUROC agrupado (0,865800), AUROC por diana (0,711658) y la medida principal por macro-objetivo, útil para enseñar por qué la métrica agrupada no debe presentarse como estimación principal.

## Benchmarks y rendimiento

Evaluación retrospectiva primaria sobre 17 dianas que cumplen la regla prespecificada de soporte de familias (2.325 casos), comparando el procedimiento de selección anidado completo frente a un selector *baseline* de prior/disponibilidad:

| Medida primaria, 17 dianas | Procedimiento de selección anidado | Baseline prior/disponibilidad |
|---|---:|---:|
| Log loss por diana (menor mejor) | 0,502920 | 0,584878 |
| Brier score por diana (menor mejor) | 0,168686 | 0,203433 |
| AUROC intra-pliegue por diana | 0,721377 | 0,497405 |

Otras cifras publicadas:

| Métrica | Valor |
|---|---:|
| AUROC intra-diana cosido (*stitched*) | 0,711658 |
| AUROC agrupado por mezcla de dianas (no es la estimación principal) | 0,865800 |
| Diferencia de log loss (IC 95% bootstrap por familias) | −0,081958 [−0,106744, −0,046894] |
| p ajustado por Holm (bootstrap centrado, 4 contrastes) | 0,001999 |
| IC condicional log loss del procedimiento anidado | [0,468624, 0,543895] |
| IC condicional Brier del procedimiento anidado | [0,154294, 0,185429] |
| Entrada fija `tabicl_full::beta` (comparación post hoc) — log loss | 0,500674 |
| Entrada fija `tabicl_full::beta` (comparación post hoc) — Brier | 0,167886 |

*Stress* de transferencia a diana nueva (sin contexto, 17 dianas, macro):

| Medida | TabICL+beta | Prior fijo |
|---|---:|---:|
| Log loss macro | 0,857114 | 0,730661 |
| AUROC macro | 0,587622 | no disponible |

*Stress* de método de diseño retenido (1.271 casos retenidos, 628 con soporte de entrenamiento emparejado): TabICL tuvo peor log loss macro que el prior fijo en cuatro de cinco grupos de origen retenidos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio pesa 0,2 GB y el checkpoint es un transformer tabular, por lo que la huella es muy inferior a la de un LLM, pero el autor no publica cifras de VRAM.
- GPU recomendadas: no disponible. Dado el tamaño del artefacto, es plausible que quepa en GPU de consumo, pero no hay confirmación en la información proporcionada.
- Cabe en GPU de consumo: no confirmado explícitamente; el tamaño del repositorio (0,2 GB) lo hace verosímil, pero debe validarse empíricamente.
- Opciones de despliegue: inferencia offline con el código incluido y la librería `tabicl` (TabICL 2.2.0). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.
- Requisito operativo: la guarda de inferencia debe ejecutarse antes de servir predicciones, ya que valida soporte de familias por diana, límites numéricos, niveles categóricos y la cadena nativa completa de Foldstring.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Rendimiento documentado | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| ProteinBase known-target binding v1 (este) | TabICLv2, clasificación tabular condicionada a diana | no disponible | tablas *in-context* de 2.928 filas; 98 campos | Log loss 0,502920; AUROC por diana 0,721377 (17 dianas) | mixta MIT/BSD-3/ODC-BY | Hugging Face, offline |
| Prior/disponibilidad fijo (baseline del propio autor) | Baseline estadístico | no aplica | no aplica | Log loss 0,584878; AUROC 0,497405 | no disponible | incluido como referencia |
| TabICL base (`jingang/TabICL`, rev. `4dcd344e…`) | Transformer de *in-context learning* tabular general | no disponible | no disponible | no disponible para esta tarea | no disponible | Hugging Face |
| Candidato TabICL con ajuste fino por gradiente | TabICL ajustado | no disponible | no disponible | ejecutado pero no seleccionado; cifras no publicadas | no disponible | no liberado |

No se dispone de comparación con otros clasificadores de unión proteína-constructo en la información proporcionada.

## Limitaciones y advertencias

- El endpoint es evidencia registrada de unión positiva frente a solo negativa para una terna exacta diana/constructo/condición; no predice afinidad, fuerza de unión ni garantiza éxito experimental individual.
- Transferencia a dianas nuevas no validada: en el *stress* sin contexto, la log loss macro empeora a 0,857114 frente a 0,730661 del prior fijo, y el AUROC macro cae a 0,587622. Las probabilidades calibradas no son válidas para dianas arbitrarias no vistas.
- Cambios en el método o la fuente de generación de candidatos no transportan universalmente las probabilidades: en el *stress* de método de diseño retenido, TabICL fue peor que el prior fijo en cuatro de cinco grupos de origen.
- Algunas dianas elegibles tienen muy pocos casos, lo que limita la fiabilidad de las métricas por diana.
- Los intervalos bootstrap (2.000 remuestreos por familias globales) mantienen fijas las predicciones *out-of-fold*: excluyen reajuste, variabilidad de selección e incertidumbre histórica de decisiones analíticas, y no son intervalos de confianza de probabilidad individual.
- La comparación de la entrada fija `tabicl_full::beta` (log loss 0,500674) es post hoc y no sustituye el resultado principal del procedimiento anidado.
- No se incluyen cabezas de afinidad o fuerza, aumentación externa ni intervalos de probabilidad individual.
- El autor no reclama optimalidad global ni estado del arte.
- Licencia mixta (MIT, BSD-3, ODC-BY): es imprescindible revisar `LICENSES.md` antes de cualquier uso comercial, ya que los términos varían según el componente (pesos, datos, código).
- Idiomas: solo `en`; la documentación y la especificación de entrada están en inglés.
- Sin servicio de inferencia alojado ni garantías de soporte; el artefacto es una release de investigación con 0 descargas y 0 *likes* en el momento de la consulta.
- Riesgo de alucinación en sentido estricto no aplica (no genera texto), pero sí existe riesgo de predicciones sobreconfiadas si se omiten las guardas de soporte de familias y rangos observados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/g30rv17ys/proteinbase-known-target-binding-v1
- Licencias: https://huggingface.co/g30rv17ys/proteinbase-known-target-binding-v1/blob/main/LICENSES.md
- Manifiesto del modelo: `model_manifest.json` en el repositorio
- Registro de ejecuciones del algoritmo: `algorithm_run_ledger.json` en el repositorio
- Manifiesto de auditoría independiente: `independent_audit_manifest.json` en el repositorio
- Pesos base TabICL: https://huggingface.co/jingang/TabICL (revisión `4dcd344ece2c00be9e831fdd35bed57b5ad83e19`)
- Dataset de referencia: https://huggingface.co/datasets/adaptyvbio/proteinbase
