# GuillaumeGay/firepredict-var-small-commune

## Resumen

`firepredict-var-small-commune` es un modelo de clasificación tabular publicado por Guillaume Gay que estima, para cada una de las 153 comunas del departamento francés de Var (83), la probabilidad diaria de que se inicie al menos un incendio forestal de 0,1 hectáreas o más. No es una red neuronal ni un modelo de lenguaje: es una regresión logística de scikit-learn encapsulada en un pipeline con `StandardScaler`, entrenada exclusivamente con datos abiertos (registros de incendios BDIFF, datos climatológicos de Météo-France y el calendario de quema controlada publicado por la prefectura del Var).

El modelo llega con una versión congelada (`small_commune_v2`, commit `5fa2bc1`) y un conjunto de artefactos reproducibles: pesos serializados en `model.joblib`, tasas históricas por comuna, metadatos con huellas SHA-256 y un fichero de predicciones retrospectivas para 2026. Su relevancia radica en la transparencia metodológica y en el cumplimiento estricto de las reglas temporales: la predicción se emite la mañana del día anterior y solo utiliza datos hasta dos días antes del día objetivo, sin incorporar registros de incendios recientes (que BDIFF publica con meses de retraso).

La evaluación se realiza con validación leave-one-year-out sobre 19 años (2006-2025, excluyendo 2024), con 1.052.640 pares comuna-día y 902 casos positivos. El modelo mejora el ROC AUC de la referencia basada únicamente en el Fire Weather Index (FWI) de 0,718 a 0,782, y en 19 de 19 años supera a dicha referencia. Es un modelo de investigación, no una herramienta oficial de alerta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline scikit-learn: `StandardScaler` + `LogisticRegression` (max_iter=1000) |
| Parametros totales | 5 coeficientes + 1 intercepto (6 parametros entrenables) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (clasificacion tabular, una fila por comuna-dia) |
| Tipos de cuantizacion | no disponible (no aplica; serializacion joblib con floats nativos) |
| Idiomas soportados | en, fr (etiquetas de documentacion; el modelo no procesa texto) |
| Licencia | MIT |
| Formato de pesos | `model.joblib` (pickle de scikit-learn 1.9.1) |

## Arquitectura y entrenamiento

El modelo es una regresion logistica binaria sobre cinco variables estandarizadas. La salida es la probabilidad de que ocurra al menos un incendio de 0,1 ha o mas en una comuna y dia concretos. Las cinco entradas, en orden, son: `log_usual_rate` (logaritmo de la tasa habitual de incendios de la comuna, calculada como media de dias con incendio por ano entre 2006 y 2025 excluyendo 2024), `log_local_fwi` (logaritmo de 1 + FWI de las estaciones Météo-France mas cercanas, dos dias antes del dia objetivo), `local_wb_30d` (balance hidrico en mm: lluvia menos evapotranspiracion potencial en los 30 dias previos), `orange_period` (indicador de febrero o marzo, cuando se permite quema controlada) y `red_period` (indicador de junio a septiembre, cuando el uso del fuego esta prohibido). Los pesos estandarizados son +0,589, +0,858, -0,562, +0,230 y -0,261 respectivamente, siendo `log_local_fwi` la variable con mayor peso.

El entrenamiento utiliza 1.052.640 pares comuna-dia con 902 casos positivos (procedentes de 910 incendios). La fuente de incendios es BDIFF (Base de Donnees sur les Incendies de Forets en France) para el Var entre 2006 y 2025 sin 2024; la meteorologia proviene de las estaciones climatologicas diarias de Météo-France en el Var; el calendario de quema se extrae de las ordenes prefectorales del 16 de mayo de 2013 y del 2 de noviembre de 2025. Los valores faltantes se imputan con la mediana de entrenamiento (`fill_values` en `metadata.json`). No hay fases de RLHF ni DPO, dado que no es un modelo generativo.

Una innovacion destacable es la verificacion automatica de las reglas temporales: el repositorio incluye tests que comprueban que ningun input cambia cuando cambian los registros de incendios, garantizando que la prediccion es genuinamente prospectiva. El FWI utilizado es una aproximacion calculada a partir de valores diarios de estacion (temperatura maxima, humedad minima, viento medio y lluvia diaria), no el producto oficial basado en el mediodia.

## Capacidades

- Clasificacion tabular binaria: probabilidad de inicio de incendio de 0,1 ha o mas por comuna y dia.
- Prediccion diaria prospectiva con horizonte de un dia (emision la manana del dia anterior).
- Integracion de variables meteorologicas derivadas (FWI aproximado, balance hidrico a 30 dias).
- Codificacion del calendario administrativo de uso del fuego (periodos naranja y rojo).
- Imputacion de valores faltantes con medianas de entrenamiento.
- Reproducibilidad verificable mediante huellas SHA-256 de pesos y datos crudos.
- Generacion de predicciones retrospectivas en lote (`forecasts_2026.csv`, 47.889 filas).
- No soporta tool calling, agentes, razonamiento multi-paso, vision, audio ni generacion de texto.

## Casos de uso

- Planificacion operativa de prevencion de incendios: los servicios de proteccion civil del Var pueden consultar cada manana la probabilidad por comuna para priorizar patrullas y medios aereos en las 15 comunas con mayor riesgo del dia, escenario en el que el modelo captura un 151% mas de incendios positivos que la referencia FWI sola.
- Activacion de alertas tempranas a municipios: las 153 comunas del departamento pueden recibir un aviso diario con su probabilidad, util para que los alcaldes activen protocolos locales de vigilancia en periodos de riesgo alto.
- Investigacion en riesgo de incendios: el modelo sirve como referencia interpretable (cinco coeficientes) para comparar con modelos mas complejos y para analizar la contribucion relativa del FWI, el deficit hidrico y la historia local de incendios.
- Comunicacion publica de riesgo: dado su caracter abierto y reproducible, permite a medios y ciudadania verificar las predicciones y entender que variables las determinan, algo imposible con modelos de caja negra.
- Gestion del calendario de quema controlada: los indicadores `orange_period` y `red_period` permiten estimar como cambia el riesgo segun el regimen administrativo vigente, util para evaluar el impacto de las ordenes prefectorales.
- Docencia y formacion en ciencia de datos aplicada: el pipeline completo (descarga meteorologica, emparejamiento de estaciones, calculo de FWI, congelacion de modelo) sirve como ejemplo reproducible de extremo a extremo con datos abiertos.
- Integracion en cuadros de mando GIS: al ser una salida tabular por codigo INSEE, se puede unir facilmente con cartografia municipal para mapas de calor diarios.

## Benchmarks y rendimiento

Evaluacion leave-one-year-out sobre 19 anos (2006-2025 sin 2024), con 902 dias-comuna positivos. Los rangos son intervalos del 95% por remuestreo de anos.

| Referencia | ROC AUC (referencia → modelo) | Anos mejores | 15 comunas/dia: capturados | 10% de dias-comuna: capturados |
|---|---|---|---|---|
| FWI solo (Var) | 0,718 → 0,782 | 19 / 19 | 85 → 213 (+151%; +104% a +221%) | 230 → 354 (+54%; +33% a +74%) |
| FWI local solo | 0,728 → 0,782 | 18 / 19 | 123 → 213 (+73%; +46% a +111%) | 256 → 354 (+38%; +20% a +58%) |
| FWI × historia de comuna | 0,757 → 0,782 | 16 / 19 (p < 0,001) | no disponible | no disponible |

No se han publicado otros benchmarks (MMLU, HumanEval, GSM8K) en la informacion disponible, dado que el modelo no es generativo.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; el modelo ocupa unos pocos kilobytes en memoria (5 coeficientes + 1 intercepto).
- GPU recomendadas: no aplica; la inferencia se ejecuta en CPU sin necesidad de aceleracion.
- Cabe en cualquier GPU consumer y en cualquier CPU moderna, incluso en dispositivos de bajo consumo.
- Opciones de despliegue: Python con scikit-learn 1.9.1, joblib y pandas; el repositorio ofrece `uv run --with scikit-learn==1.9.1 --with joblib --with pandas python example.py`. Tambien se puede servir mediante un endpoint HTTP propio o integrar en un pipeline de datos programado (cron, Airflow).
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; por la naturaleza del modelo (una regresion logistica sobre cinco variables) se espera una latencia de microsegundos a milisegundos por fila en CPU, aunque no se aportan cifras oficiales.
- Advertencia de compatibilidad: el pipeline se serializo con scikit-learn 1.9.1; versiones anteriores (por ejemplo 1.7.2) fallan al cargarlo.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | ROC AUC | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| firepredict-var-small-commune | Regresion logistica (scikit-learn) | 6 | no aplica | 0,782 | MIT | Hugging Face + GitHub |
| FWI solo (referencia Var) | Indice meteorologico | no aplica | no aplica | 0,718 | no disponible | Producto operativo |
| FWI local solo (referencia) | Indice meteorologico | no aplica | no aplica | 0,728 | no disponible | Producto operativo |
| FWI × historia de comuna (referencia) | Modelo combinado | no disponible | no aplica | 0,757 | no disponible | No disponible |

No se dispone de informacion sobre otros modelos de prediccion de incendios comparables (por ejemplo, basados en gradient boosting o redes neuronales) en la documentacion proporcionada.

## Limitaciones y advertencias

- Es una vista previa de investigacion, no una herramienta oficial de alerta; los avisos oficiales en Francia los emiten Météo-France y las prefecturas.
- Los resultados anuales son exploratorios; la prueba limpia es la de 2026, segun el propio autor.
- El FWI utilizado es una aproximacion a partir de valores diarios de estacion, no el producto oficial basado en el mediodia, lo que puede introducir desviaciones respecto a la referencia operativa.
- El modelo esta entrenado exclusivamente para el departamento del Var (153 comunas); no es directamente extrapolable a otras regiones sin reentrenamiento.
- La unidad de prediccion es el dia-comuna, no el incendio individual: una probabilidad alta no implica necesariamente un incendio de gran superficie.
- El desequilibrio de clases es extremo (902 positivos de 1.052.640 pares, aproximadamente 0,086%), lo que exige umbrales de decision calibrados para cada aplicacion.
- Los ficheros joblib son pickles: solo deben cargarse si se verifica la huella SHA-256 (`a1e64b40ed3aa7c274d4b2ec01f24e93a80beb976c3e03ce6d2a3e837056b243`), por riesgo de ejecucion de codigo arbitrario.
- La licencia MIT cubre codigo y modelo, pero el uso operativo debe acompanarse de validacion local y de la debida atribucion.
- No se han documentado sesgos especificos mas alla de los derivados de la cobertura y calidad de los datos de Météo-France y BDIFF en el Var.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/GuillaumeGay/firepredict-var-small-commune
- Repositorio GitHub (codigo, pipeline y informe): https://github.com/guillaumegay13/firepredict
- BDIFF (Base de Donnees sur les Incendies de Forets en France): no disponible en la informacion proporcionada
- Météo-France (datos climatologicos diarios): no disponible en la informacion proporcionada
- Ordenes prefectorales del Var sobre uso del fuego (16 de mayo de 2013 y 2 de noviembre de 2025): no disponible en la informacion proporcionada
