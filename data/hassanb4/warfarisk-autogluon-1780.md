# HassanB4/warfarisk-autogluon-1780

## Resumen

WarfaRisk es un modelo de regresión tabular desarrollado por un equipo de la Universidad Alfaisal (Riad, Arabia Saudí) en colaboración con varias instituciones sanitarias, como parte del pipeline reproducible WarfaRisk de nueve fases. Su objetivo es predecir la dosis semanal estable de warfarina a partir de características clínicas y genéticas del paciente, un problema clásico de farmacogenómica. El modelo presentado aquí es el ganador de la fase 3, entrenado con AutoGluon en su preset `extreme_quality` sobre la cohorte IWPC-1780 del International Warfarin Pharmacogenetics Consortium.

Se trata de un modelo tabular, no de un modelo de lenguaje: no genera texto, sino que devuelve una estimación numérica de dosis en mg/semana. Su relevancia radica en que demuestra que un ensemble automático de AutoGluon supera a arquitecturas individuales como CatBoost, TabPFN o XGBoost en este cohorte, alcanzando un MAE de 7,959 mg/semana y un R² de 0,480. El repositorio incluye código, splits y auditoría de fugas, lo que lo convierte en un artefacto de investigación reproducible, aunque sus autores advierten explícitamente de que no es una herramienta clínica validada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Ensemble AutoGluon `WeightedEnsemble_L2` (mezcla de `RealTabPFN-v2_r13`, `LightGBMPrep_r13` y `RealTabPFN-v2_r106`) |
| Parametros totales | no disponible (modelo tabular, no se publican conteos de parametros) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo tabular, no procesa secuencias) |
| Tipos de cuantizacion | no aplica (no se ofrecen cuantizaciones; el modelo se distribuye como artefacto AutoGluon) |
| Idiomas soportados | no aplica (entrada numerica; la documentacion esta en ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | AutoGluon (directorio con modelos serializados, compatible con `TabularPredictor.load`) |

## Arquitectura y entrenamiento

El modelo es un `TabularPredictor` de AutoGluon ajustado con el preset `extreme_quality`, que entrena y combina multiples algoritmos de aprendizaje automatico (LightGBM, TabPFN, CatBoost, Random Forest, MLP, etc.) mediante un ensemble ponderado de nivel 2. En este caso, el ensemble final combina dos variantes de TabPFN y una de LightGBM. Se excluyeron los tipos de modelo TABDPT, TABICL, TABM y MITRA por consistencia con la ejecucion en la cohorte IWPC-6256.

El entrenamiento se realizo sobre 1.424 muestras (80% de IWPC-1780) con una particion a nivel de paciente (no de fila) y semilla fija `20260725`. El conjunto de test contiene 356 muestras. Las caracteristicas de entrada son una combinacion de variables clinicas (edad, peso, altura pre-z-score, flags de ancestria binaria, comedication con amiodarona o inductores enzimaticos) y geneticas (consenso de genotipo CYP2C9, flags VKORC1.AA y VKORC1.AG). El tiempo limite de entrenamiento fue de 600 segundos. Se realizo una auditoria de fugas con 11 comprobaciones, todas superadas.

## Capacidades

- Regresion tabular para prediccion de dosis semanal de warfarina (variable continua en mg/semana).
- Manejo de caracteristicas mixtas: numericas pre-escaladas (z-score) y categoricas binarias (flags de ancestria, genotipos, comedication).
- Capacidad de ensemble automatico: combina multiples algoritmos para mejorar la robustez frente a modelos individuales.
- Reproducibilidad: el codigo, los splits y los resultados estan publicados en GitHub, lo que permite replicar el experimento.
- No es un modelo generativo: no produce texto, codigo ni razonamiento; su salida es exclusivamente una prediccion numerica.
- No soporta tool calling, agentes ni procesamiento de lenguaje natural.

## Casos de uso

- Estimacion inicial de dosis de warfarina en pacientes que comienzan tratamiento: el modelo puede proporcionar una dosis de arranque basada en datos clinicos y geneticos, reduciendo el numero de ajustes necesarios.
- Ajuste de dosis en pacientes con polimorfismos geneticos conocidos: al incluir genotipos CYP2C9 y VKORC1, ayuda a identificar pacientes que requieren dosis mas bajas o altas de lo habitual.
- Apoyo a la decision clinica en farmacogenomica: integrado en un sistema de historia clinica electronica, puede ofrecer una recomendacion de dosis junto con la justificacion de las variables utilizadas.
- Investigacion en farmacogenomica: sirve como modelo de referencia para comparar nuevas arquitecturas o conjuntos de caracteristicas en la cohorte IWPC-1780.
- Validacion de pipelines de ML reproducibles: el codigo y los resultados publicados permiten auditar el proceso de entrenamiento y evaluacion, util para equipos que desarrollan modelos similares.
- Ensenanza y formacion en ML aplicado a salud: el repositorio incluye documentacion detallada de las nueve fases, ideal para estudiar buenas practicas en modelado tabular.

## Benchmarks y rendimiento

Los resultados declarados por el autor en la model card son los siguientes:

| Metrica | Valor |
|---|---|
| MAE (mg/semana) | 7,959 |
| R² | 0,480 |
| PW20 | 0,497 |

PW20 es la proporcion de predicciones dentro del 20% de la dosis real, umbral de aceptabilidad clinica definido por el IWPC. Ademas, la model card incluye una comparativa con otros modelos evaluados sobre el mismo conjunto de caracteristicas combinadas y la misma particion:

| Modelo | MAE | R² | PW20 |
|---|---|---|---|
| AutoGluon `extreme_quality` | 7,959 | 0,480 | 0,497 |
| Stacking Ensemble | 7,993 | 0,479 | 0,514 |
| TabPFN | 8,018 | 0,477 | 0,483 |
| Linear Regression | 8,070 | 0,474 | 0,511 |
| CatBoost | 8,205 | 0,451 | 0,492 |
| Random Forest | 8,940 | 0,370 | 0,444 |
| MLP | 9,231 | 0,320 | 0,447 |
| Elastic Net | 9,404 | 0,286 | 0,449 |
| XGBoost | 10,583 | 0,165 | 0,396 |

Estos valores no estan verificados de forma independiente (campo `verified: false` en el modelo-index).

## Requisitos de hardware

- Tamano del repositorio: 0,2 GB, por lo que es un modelo ligero.
- Inferencia en CPU: suficiente. No se requieren GPU para ejecutar predicciones con AutoGluon.
- VRAM estimada: no aplica (no requiere GPU; en caso de usarla, la VRAM necesaria seria minima, inferior a 1 GB).
- GPU recomendadas: ninguna en particular; cualquier CPU moderna con 4-8 GB de RAM puede cargar y ejecutar el modelo.
- Opciones de despliegue: AutoGluon (`TabularPredictor.load`), Hugging Face Hub (descarga via `snapshot_download`), o integracion en servicios de inferencia como FastAPI o Seldon.
- Latencia: al ser un ensemble de modelos tabulares, la inferencia es del orden de milisegundos por muestra en CPU.

## Comparativa con modelos similares

La comparativa se establece con otros modelos de regresion tabular evaluados en la misma cohorte y con el mismo conjunto de caracteristicas, segun la tabla de la model card:

| Modelo | MAE | R² | PW20 | Tipo |
|---|---|---|---|---|
| AutoGluon `extreme_quality` | 7,959 | 0,480 | 0,497 | Ensemble automatico |
| TabPFN | 8,018 | 0,477 | 0,483 | Red de prior ajustable |
| CatBoost | 8,205 | 0,451 | 0,492 | Gradient boosting |
| XGBoost | 10,583 | 0,165 | 0,396 | Gradient boosting |

AutoGluon supera a todos los modelos individuales en MAE y R², aunque el stacking ensemble (que es un subconjunto del propio AutoGluon) obtiene un PW20 ligeramente superior (0,514 vs 0,497). No se dispone de comparaciones con modelos externos fuera de este estudio.

## Limitaciones y advertencias

- No es una herramienta clinica validada: los autores indican explicitamente que es un artefacto de investigacion sin evaluacion prospectiva ni estatus regulatorio.
- Requiere caracteristicas pre-procesadas: las variables continuas deben estar en z-score (no en unidades brutas) y los flags geneticos deben seguir el esquema de IWPC-1780. Alimentar valores crudos sin re-escalar produce predicciones incorrectas.
- Sesgo de poblacion: la cohorte IWPC-1780 tiene flags de ancestria binarios (Black, Asian) y puede no representar adecuadamente otras poblaciones. El rendimiento en grupos no representados no esta evaluado.
- Riesgo de sobreajuste a la cohorte: aunque se realizo una auditoria de fugas, el modelo esta optimizado para IWPC-1780 y puede no generalizar a otras poblaciones o practicas clinicas.
- Limitacion de la metrica: el R² de 0,480 indica que el modelo explica menos de la mitad de la varianza de la dosis, por lo que las predicciones tienen un error considerable (MAE ~8 mg/semana).
- Sin soporte para datos faltantes: el modelo espera todas las caracteristicas de entrada; no se documenta un manejo de valores ausentes.
- Licencia Apache-2.0 permite uso comercial, pero la advertencia clinica limita su aplicacion en entornos reales sin validacion adicional.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/HassanB4/warfarisk-autogluon-1780
- Repositorio de codigo (GitHub): https://github.com/HasanBGit/WarfaRisk
- Documentacion de resultados: https://github.com/HasanBGit/WarfaRisk/blob/main/docs/RESULTS.md
- Problemas conocidos: https://github.com/HasanBGit/WarfaRisk/blob/main/docs/KNOWN_ISSUES.md
- Coleccion de modelos WarfaRisk en Hugging Face: https://huggingface.co/collections/HassanB4/warfarisk-ancestry-stratified-warfarin-dose-prediction-6a79b7f715e8533e72db4b4e
- Modelo relacionado (revision fase 3): https://huggingface.co/HassanB4/warfarin-review-phase3-autogluon-iwpc1780
