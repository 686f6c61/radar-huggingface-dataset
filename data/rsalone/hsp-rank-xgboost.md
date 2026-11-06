# rSalone/hsp-rank-xgboost

## Resumen

hsp-rank XGBoost es un modelo de regresión tabular que estima los tres componentes de los parámetros de solubilidad de Hansen (δD, δP, δH, en MPa^0.5) a partir de la estructura molecular expresada como SMILES. Lo desarrolla rSalone (rS-alonewolf) como "candidato B" del proyecto hsp-rank, y emplea tres árboles XGBoost independientes, uno por componente, entrenados sobre descriptores 2D de Mordred, fingerprints de Morgan y conteos de grupos de Stefanis–Panayiotou. No es un modelo de lenguaje ni una red neuronal: es un conjunto de árboles de gradiente con boosting que se ejecuta exclusivamente en CPU.

El problema que resuelve es la predicción rápida de HSP sin simulación molecular ni experimentación, para tareas de selección y ordenación de disolventes. El modelo se entrenó sobre 1125 compuestos derivados del conjunto HSP-predictions (Cvetković et al., 2024), tras eliminar 37 filas cuyo InChIKey coincidía con el conjunto de evaluación de 86 compuestos. La selección de hiperparámetros se hizo con validación cruzada anidada agrupada por esqueleto de Murcko, lo que reduce la fuga de información entre compuestos estructuralmente emparentados.

Su relevancia es acotada pero concreta: ofrece una línea base reproducible, con licencia MIT, verificada en entorno limpio (los artefactos regenerados coinciden byte a byte con los originales según SHA-256) y con métricas de error publicadas de forma transparente, incluidas las limitaciones. Es útil como referencia para comparar aproximaciones más complejas (GNN, modelos de lenguaje químico) en la misma tarea.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Conjunto de tres regresores XGBoost (gradient boosted trees), uno por componente HSP |
| Parametros totales | No disponible (no se documenta el número de árboles/nodos por modelo; `n_estimators=300` por componente) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (entrada tabular: vector de descriptores por molécula) |
| Tipos de cuantizacion | No disponible (los pesos se distribuyen en JSON nativo de XGBoost) |
| Idiomas soportados | No aplica (entrada SMILES; no procesa lenguaje natural) |
| Licencia | MIT (© 2026 rS-alonewolf) |
| Formato de pesos | JSON de XGBoost (`xgb_D.json`, `xgb_P.json`, `xgb_H.json`) más `training.json` con el registro de entrenamiento |

## Arquitectura y entrenamiento

Cada componente HSP se modela con un XGBoost independiente con `n_estimators=300`, `learning_rate=0.05`, `random_state=42` y `device='cpu'`. La profundidad máxima varía por componente: δD usa `max_depth=3` con descriptores Mordred más conteos de grupos de Stefanis–Panayiotou (987 features); δP y δH usan `max_depth=5` solo con descriptores Mordred (869 features). Se exploraron también variantes con Morgan fingerprints (radio 2, 512 bits; 1381 features en total), pero no fueron las seleccionadas. La ingeniería de características se delega en RDKit y Mordred, de modo que el modelo en sí solo consume un vector numérico fijo.

El entrenamiento parte de `data/HSP_descriptors_NO_ERRS_ZEROS.csv` del repositorio HSP-predictions (commit `93f4948`, MIT), cuyos valores HSP provienen de la base de datos pública de Steven Abbott. La deduplicación se hizo promediando filas con el mismo InChIKey completo. La selección de configuración se realizó con GroupKFold de 3 particiones agrupado por esqueleto de Murcko, eligiendo la combinación de las tres componentes que minimiza la mediana del error Ra a nivel de compuesto, y la evaluación del procedimiento completo se hizo con validación cruzada anidada (externa 3 × interna 3). No hay RLHF, DPO ni ajuste por preferencias: es aprendizaje supervisado clásico sobre etiquetas numéricas.

## Capacidades

- Predicción de los tres parámetros de Hansen (δD, δP, δH) en MPa^0.5 a partir de un SMILES.
- Cálculo derivado de la distancia de Hansen Ra entre un compuesto y una referencia, mediante la fórmula Ra² = 4ΔδD² + ΔδP² + ΔδH².
- Ordenación de una base de disolventes por afinidad estimada respecto a un soluto (funcionalidad del CLI de hsp-rank, requiere `data/solvents.csv`).
- Inferencia exclusivamente en CPU, sin requisito de GPU.
- Reproducibilidad verificada: regeneración en entorno limpio con coincidencia byte a byte en pesos y salidas de evaluación.
- No soporta tool calling, agentes, razonamiento multi-paso, visión, audio ni generación de texto.
- No tiene capacidades multilingües en el sentido de NLP; su dominio es químico-estructural.

## Casos de uso

- Selección preliminar de disolventes en formulación: dado un SMILES de soluto, estimar δD/δP/δH y ordenar una lista de disolventes por Ra para priorizar candidatos antes de ensayos de laboratorio. Adecuado por su coste computacional mínimo en CPU y su latencia de milisegundos.
- Sustitución de disolventes por motivos regulatorios o de toxicidad: recalcular la afinidad de alternativas verdes frente al mismo soluto y comparar con el disolvente original, usando el ranking por Ra como criterio de triaje.
- Cribado de compatibilidad polímero–disolvente: estimar los HSP del polímero (o de su unidad repetitiva) y del disolvente para filtrar combinaciones con Ra bajo antes de pruebas de solubilidad reales.
- Enriquecimiento de bases de datos químicas: procesar lotes de SMILES y añadir columnas δD/δP/δH para habilitar búsquedas por similitud de parámetros en catálogos internos.
- Línea base en investigación de métodos predictivos: servir como referencia cuantitativa (Ra mediano 2.273 en el conjunto de evaluación de 80 compuestos con unidades confirmadas) frente a la que medir GNN o modelos fundacionales de química.
- Docencia y prototipado: pipeline ligero y reproducible (Python 3.14, xgboost-cpu, rdkit, mordredcommunity) para ilustrar el flujo descriptor → modelo → propiedad en cursos de química computacional.
- Filtrado previo en pipelines de simulación molecular: descartar pares soluto–disolvente con Ra estimado alto antes de lanzar cálculos de dinámica molecular o cosmo-SAC, que son órdenes de magnitud más caros.

## Benchmarks y rendimiento

Validación cruzada anidada sobre el conjunto de entrenamiento (1125 compuestos):

| Procedimiento de selección | Ra error mediana | Ra error P90 | δD MAE | δP MAE | δH MAE |
|---|---:|---:|---:|---:|---:|
| Ra de 3 componentes (adoptado) | 2.363 | 5.739 | 0.564 | 1.701 | 1.498 |
| MAE por componente | 2.397 | 5.707 | 0.566 | 1.701 | 1.492 |

Conjunto de evaluación independiente (86 compuestos, no usados en entrenamiento):

| Subconjunto | Compuestos | δD MAE | δP MAE | δH MAE | Ra mediana | Ra P90 |
|---|---:|---:|---:|---:|---:|---:|
| Total con unidades confirmadas | 80 | 0.433 | 1.719 | 1.835 | 2.273 | 4.704 |
| Disolventes | 63 | 0.412 | 1.374 | 1.680 | 1.994 | 4.078 |
| Heterociclos y fármacos | 33 | 0.528 | 2.247 | 1.851 | 2.733 | 6.023 |
| Fármacos de origen experimental | 5 | 0.378 | 5.507 | 5.540 | 6.045 | 13.446 |
| Pesticidas con unidades sin confirmar | 6 | 0.644 | 2.023 | 1.716 | 2.965 | 3.644 |

En los 6 pesticidas con unidades sin confirmar, la coincidencia de orden con la base completa de disolventes alcanza una Spearman mediana de 0.905, con una superposición mediana de 2 compuestos en el top-10 (comparación contra HSP de literatura, no contra solubilidad medida).

No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM: no aplica; el modelo se ejecuta en CPU (`device='cpu'` en el entrenamiento y la inferencia).
- RAM: no disponible de forma explícita; el cuello de botella real es el cálculo de descriptores Mordred (869 features), no el tamaño del modelo.
- GPU recomendadas: ninguna. Funciona en cualquier CPU x86-64 moderna.
- ¿Cabe en GPU de consumo? Irrelevante: no usa GPU. Cabe en cualquier equipo de desarrollo convencional.
- Despliegue: biblioteca `xgboost` (variante `xgboost-cpu`) cargando los JSON; el pipeline de características requiere RDKit y `mordredcommunity`. No hay soporte de vLLM, llama.cpp, Ollama ni TGI, que son servidores de modelos de lenguaje.
- Latencia y throughput: no disponibles como cifras publicadas. Por la naturaleza del modelo (300 árboles de profundidad 3–5 sobre 869–987 features), la inferencia por molécula es del orden de milisegundos en CPU; el coste dominante es el cálculo de descriptores.
- Entorno verificado: Python 3.14.4, xgboost-cpu 3.4.1, rdkit 2026.9.1, mordredcommunity 2.0.7, Ubuntu 26.04.1 LTS.

## Comparativa con modelos similares

| Modelo | Tipo | Entrada | Salida | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| hsp-rank XGBoost (este) | Árboles XGBoost (3 regresores) | SMILES → descriptores Mordred + grupos | δD, δP, δH | MIT | Hugging Face + GitHub |
| Cvetković et al. (2024) | Modelos moleculares y de grafo (según paper) | Estructura molecular | HSP | No disponible en la información | Publicación científica |
| Stefanis–Panayiotou (2008) | Contribución de grupos | Grupos funcionales | HSP | No disponible en la información | Método publicado |
| HSPiP / base de Abbott | Base de datos y estimación empírica | Compuesto conocido | HSP | No disponible en la información | Comercial / web |

No se dispone de cifras de rendimiento comparables de las alternativas en la información proporcionada, por lo que no se puede establecer una comparación cuantitativa de precisión entre ellas.

## Limitaciones y advertencias

- Solo 5 referencias del conjunto de evaluación provienen de ensayos de solubilidad experimentales, y en ellas el error Ra mediano se dispara hasta 6.045 (P90 de 13.446), con MAE de δP y δH superiores a 5.5. La mayor parte del conjunto de evaluación son valores de HSPiP o calculados.
- Posible circularidad: los disolventes de entrenamiento y de evaluación podrían proceder de la misma fuente (base de Abbott / HSPiP), lo que podría inflar artificialmente las métricas. El autor lo declara como no confirmado.
- No se ha evaluado el comportamiento fuera de la distribución de entrenamiento: moléculas grandes, sales, compuestos con metales, polímeros de alto peso molecular.
- El modelo no interpola bien en familias con química distinta a la de entrenamiento; los heterociclos y fármacos ya muestran un deterioro claro (Ra mediana 2.733 frente a 1.994 en disolventes).
- Dependencia estricta del pipeline de características de hsp-rank: usar otra implementación de Mordred, otra versión de RDKit o un orden distinto de columnas invalida las predicciones.
- Los pesos están en JSON de XGBoost, un formato que requiere la versión de la biblioteca compatible; no hay conversión a ONNX ni a otros formatos documentada.
- Riesgo de alucinación en sentido estricto no aplica (no genera texto), pero sí existe riesgo de extrapolación silenciosa: el modelo siempre devuelve tres números, incluso para entradas absurdas o fuera de dominio, sin señal de confianza.
- Licencia del modelo MIT, pero la procedencia de los valores HSP subyacentes (base de datos de Abbott) tiene condiciones de uso y redistribución no verificadas; para uso comercial conviene revisar la licencia de los datos de origen.
- Los datos de entrenamiento no se redistribuyen con el modelo; hay que obtenerlos por separado desde HSP-predictions.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rSalone/hsp-rank-xgboost
- Repositorio hsp-rank: https://github.com/rS-alonewolf/hsp-solubility
- Datos de entrenamiento (HSP-predictions): https://github.com/darjacvetkovic/HSP-predictions
- Base de datos HSP de Steven Abbott: https://www.stevenabbott.co.uk
- Cvetković, D. et al. (2024), Chemometrics and Intelligent Laboratory Systems 251, 105168: https://doi.org/10.1016/j.chemolab.2024.105168
- Stefanis, E.; Panayiotou, C. (2008), International Journal of Thermophysics 29, 568–585: https://doi.org/10.1007/s10765-008-0415-z
