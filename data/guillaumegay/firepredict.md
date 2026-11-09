# GuillaumeGay/firepredict

## Resumen

firepredict es un modelo de clasificación tabular muy ligero, desarrollado por Guillaume Gay, que estima la probabilidad diaria de que se inicie al menos un incendio forestal de 0,1 hectáreas o más en cada una de las 153 comunas del departamento de Var (Francia). No es un modelo de lenguaje ni una red neuronal profunda: se trata de una regresión logística empaquetada en un pipeline de scikit-learn, entrenada exclusivamente con datos abiertos (registros de incendios BDIFF, datos climatológicos de Météo-France y calendarios de quema prefectorales). El modelo se publica como una "research preview" y no sustituye a las alertas oficiales de Météo-France ni de las prefecturas.

La relevancia del modelo reside en su enfoque metodológico más que en su tamaño: demuestra que un clasificador lineal con cinco variables cuidadosamente seleccionadas puede superar a índices meteorológicos de peligro de incendio ampliamente utilizados (FWI) en la predicción de igniciones a escala de comuna. La versión congelada es `small_commune_v2` (commit `5fa2bc1`, 9 de noviembre de 2026) y se distribuye con licencia MIT, lo que facilita su replicación y auditoría.

El modelo opera con una ventana temporal estricta: la predicción se emite la mañana del día anterior al día objetivo y utiliza datos hasta dos días antes del objetivo, sin incorporar registros recientes de incendios (que no están disponibles en tiempo real). Esta restricción de diseño busca garantizar que el modelo sea desplegable en producción sin fugas de información.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Regresión logística con estandarización previa (pipeline scikit-learn: `StandardScaler` + `LogisticRegression`, `max_iter=1000`) |
| Parámetros totales | 5 coeficientes + 1 intercepto (6 parámetros entrenables) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo tabular; 5 variables de entrada por instancia) |
| Tipos de cuantización | No aplica (pesos en punto flotante estándar de scikit-learn) |
| Idiomas soportados | Inglés (en) y francés (fr) en documentación; el modelo en sí no procesa texto |
| Licencia | MIT |
| Formato de pesos | `model.joblib` (serialización joblib/pickle de scikit-learn 1.9.1) |

## Arquitectura y entrenamiento

El modelo es un clasificador lineal binario: un `StandardScaler` seguido de una `LogisticRegression` con configuración por defecto y `max_iter=1000`. Las cinco variables de entrada son: `log_usual_rate` (tasa histórica de incendios de la comuna, transformada logarítmicamente), `log_local_fwi` (Fire Weather Index aproximado dos días antes del día objetivo, desde las estaciones Météo-France más cercanas), `local_wb_30d` (balance hídrico de 30 días: precipitación menos evapotranspiración potencial, en mm), `orange_period` (indicador binario de febrero-marzo, cuando se permite la quema de maleza bajo condiciones) y `red_period` (indicador binario de junio-septiembre, cuando el uso del fuego está prohibido). Los valores faltantes se imputan con la mediana de entrenamiento.

El entrenamiento utiliza 1.052.640 pares comuna-día, de los cuales 902 son positivos (provenientes de 910 incendios), correspondientes al periodo 2006-2025 excluyendo 2024. Los datos de incendios provienen de BDIFF, los meteorológicos de Météo-France y el calendario de quema de órdenes prefectorales del Var (16 de mayo de 2013 y 2 de noviembre de 2025). El FWI utilizado es una aproximación calculada a partir de valores diarios de estación (temperatura máxima, humedad mínima, viento medio y lluvia diaria), no el producto oficial basado en el mediodía. La evaluación se realiza con validación leave-one-year-out a lo largo de 19 años.

## Capacidades

- Clasificación binaria tabular: estima la probabilidad de que se inicie al menos un incendio de 0,1 ha o más en una comuna y día concretos.
- Predicción operativa con restricciones temporales estrictas: emisión el día anterior al objetivo, usando datos hasta dos días antes.
- Integración con datos meteorológicos de Météo-France y registros históricos de incendios BDIFF.
- Cálculo aproximado del Fire Weather Index (FWI) a partir de variables diarias de estación.
- Imputación automática de valores faltantes mediante medianas de entrenamiento.
- Capacidad de generar pronósticos retrospectivos (fichero `forecasts_2026.csv` con 47.889 filas).
- No soporta tool calling, agentes, razonamiento multi-paso, visión, audio ni generación de texto.

## Casos de uso

- Planificación de recursos de extinción: los servicios de emergencia del Var pueden usar la probabilidad diaria por comuna para priorizar la vigilancia y el desplazamiento de medios aéreos y terrestres en las zonas con mayor riesgo, aprovechando que el modelo se emite el día anterior.
- Sistemas de alerta temprana a nivel municipal: ayuntamientos y protecciones civiles pueden integrar el modelo en sus paneles de situación para activar protocolos preventivos (restricción de accesos a macizos forestales, avisos a la población) con un día de antelación.
- Investigación en prevención de incendios: el modelo sirve como referencia metodológica para estudiar qué variables (FWI local, balance hídrico, calendario de quema) contribuyen más a la ignición, gracias a sus coeficientes estandarizados interpretables.
- Evaluación de políticas de gestión del territorio: las administraciones pueden simular el efecto de cambios en los calendarios de quema (variables `orange_period` y `red_period`) sobre la probabilidad de ignición en distintas comunas.
- Seguros agrarios y forestales: las aseguradoras pueden usar las probabilidades diarias para ajustar primas o diseñar productos paramétricos basados en el riesgo de incendio por comuna, con datos abiertos y licencia MIT que facilitan la auditoría.
- Docencia y divulgación en ciencia de datos: por su simplicidad (cinco variables, regresión logística), el modelo es un ejemplo didáctico completo de pipeline reproducible con datos abiertos, validación temporal y evaluación contra referencias.
- Integración en plataformas de datos abiertos: desarrolladores pueden incorporar el modelo en aplicaciones web o dashboards que muestren el riesgo diario de incendio en el Var, ya que el formato joblib es ligero y fácil de desplegar.

## Benchmarks y rendimiento

Evaluación leave-one-year-out sobre 19 años (2006-2025 sin 2024), con rangos del 95% por remuestreo de años:

| Referencia | ROC AUC (referencia → modelo) | Años mejores | 15 comunas/día: capturados | 10% de comuna-días: capturados |
|---|---|---|---|---|
| FWI solo (Var) | 0,718 → 0,782 | 19 / 19 | 85 → 213 (+151%; +104% a +221%) | 230 → 354 (+54%; +33% a +74%) |
| FWI local solo | 0,728 → 0,782 | 18 / 19 | 123 → 213 (+73%; +46% a +111%) | 256 → 354 (+38%; +20% a +58%) |
| FWI × historial de comuna | 0,757 → 0,782 | 16 / 19 (p < 0,001) | No disponible | No disponible |

## Requisitos de hardware

- VRAM estimada para inferencia: prácticamente nula; el modelo cabe en memoria RAM (unos pocos kilobytes). No requiere GPU.
- GPU recomendadas: no aplica; la inferencia es puramente CPU.
- Cabe en cualquier GPU consumer y en cualquier CPU moderna, incluidos dispositivos de bajo consumo.
- Opciones de despliegue: Python con scikit-learn 1.9.1 (versión obligatoria; versiones anteriores como 1.7.2 fallan al cargar el pipeline), joblib y pandas. No es compatible con vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo de lenguaje.
- Latencia y throughput: no se han publicado cifras oficiales, pero al tratarse de una regresión logística con cinco variables, la inferencia es del orden de microsegundos por instancia en CPU.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | ROC AUC | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| firepredict | Regresión logística tabular | 6 | No aplica | 0,782 (leave-one-year-out) | MIT | Hugging Face + GitHub |
| FWI solo (Var) | Índice meteorológico | No aplica | No aplica | 0,718 | No disponible (producto Météo-France) | Oficial |
| FWI local solo | Índice meteorológico | No aplica | No aplica | 0,728 | No disponible | Oficial |
| FWI × historial de comuna | Combinación índice + historial | No aplica | No aplica | 0,757 | No disponible | No disponible |

No se dispone de información sobre otros modelos comparables de clasificación tabular para riesgo de incendios en la misma región.

## Limitaciones y advertencias

- Es una "research preview": no es una herramienta oficial de alerta. Las advertencias de peligro de incendio en Francia las emiten Météo-France y las prefecturas.
- Los resultados anuales son exploratorios; la prueba limpia es la de 2026, según el autor.
- El FWI utilizado es una aproximación calculada a partir de valores diarios de estación, no el producto oficial basado en el mediodía.
- El modelo no incorpora registros recientes de incendios porque BDIFF los publica con meses de retraso; esto limita su capacidad de adaptarse a condiciones cambiantes.
- Los ficheros joblib son pickles: solo deben cargarse si se confía en su huella SHA-256 (`model_sha256` en `metadata.json`), ya que un pickle malicioso puede ejecutar código.
- Requiere scikit-learn 1.9.1 exactamente; versiones anteriores fallan al cargar el pipeline.
- Cobertura geográfica limitada a las 153 comunas del Var; no es directamente extrapolable a otras regiones sin reentrenamiento.
- El desequilibrio de clases es extremo (902 positivos de 1.052.640 pares comuna-día), lo que puede afectar la calibración de probabilidades en escenarios poco representados.
- No se han documentado sesgos específicos más allá de los derivados de los datos de entrenamiento (BDIFF y Météo-France), pero al ser un modelo lineal, su capacidad de capturar interacciones complejas es limitada.
- Licencia MIT: permite uso comercial, pero el autor no ofrece garantías ni soporte.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/GuillaumeGay/firepredict
- Repositorio GitHub (código, pipeline y informe): https://github.com/guillaumegay13/firepredict
- BDIFF (Base de Données sur les Incendies de Forêts en France): no disponible en la información proporcionada
- Météo-France (datos climatológicos): no disponible en la información proporcionada
- Órdenes prefectorales del Var sobre uso del fuego (16 de mayo de 2013 y 2 de noviembre de 2025): no disponible en la información proporcionada
