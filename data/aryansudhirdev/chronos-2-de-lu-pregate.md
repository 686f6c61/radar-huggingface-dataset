# AryanSudhirDev/chronos-2-de-lu-pregate

## Resumen

Chronos-2 DE-LU pre-gate es un checkpoint de investigación derivado de amazon/chronos-2, el modelo fundacional de series temporales de Amazon, especializado en la previsión de los 24 precios horarios de electricidad del mercado alemán-luxemburgués (DE-LU) en EUR/MWh. Lo desarrolla Aryan Sudhir (AryanSudhirDev) como candidato congelado ("pre-gate") para un estudio sobre trading de baterías, y se distribuye como pesos fusionados independientes más un adaptador LoRA opcional.

El modelo parte de la arquitectura T5 de Chronos-2 (119.477.664 parámetros) y añade actualizaciones LoRA de rango 8 y alpha 16 sobre las proyecciones de atención q/k/v/o y el embedding de parches de salida, entrenadas con los pesos base congelados. La innovación respecto al modelo base no está en la arquitectura sino en el dominio: el modelo consume 85 días de historia horaria (2040 valores) junto con covariables exógenas de carga y generación eólica y solar previstas, más precios de mercados vecinos.

Es relevante ahora porque ejemplifica el patrón de ajuste fino eficiente (LoRA) sobre modelos fundacionales de series temporales para dominios verticales concretos, con una evaluación honesta que reconoce no haber superado al baseline estadístico LEAR en su ventana de holdout. El resultado registrado es un MAE de 15,386 EUR/MWh en 372 días, frente a ~15,34 de LEAR, sin significación estadística (p = 0,543).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | T5 (encoder-decoder) de Chronos-2, con adaptador LoRA fusionado |
| Parametros totales | 119.477.664 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 2040 valores de historia horaria (85 dias); 168-2040 aceptados por el helper |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo numerico de series temporales, no linguistico) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (model.safetensors + config.json); adaptador LoRA separado en adapter/ |
| Modelo base | amazon/chronos-2 (revision 29ec3766d36d6f73f0696f85560a422f50e8498c) |
| LoRA | rango 8, alpha 16, dropout 0; q/k/v/o attention y output patch embedding |
| Tamano del repo | 0.5 GB |
| Libreria | chronos-forecasting |
| Pipeline | time-series-forecasting |
| Horizonte de prediccion | 24 horas (bloques de dia de entrega Berlin) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura T5 de Chronos-2, un modelo fundacional de series temporales que tokeniza las series en parches y las procesa como secuencias, generando predicciones cuantílicas. Sobre esta base se entrenó un adaptador LoRA de rango 8 y alpha 16, con dropout 0, que actualiza las proyecciones de atención q/k/v/o y el embedding de parches de salida. Los pesos base permanecieron congelados durante el entrenamiento del adaptador; la exportación fusiona las actualizaciones aprendidas sin entrenamiento adicional. El checkpoint congelado se identifica por el SHA-256 del adaptador `01fe7c491f30f3bbcb1265d3bbd53db226b5f0cfe3769d0519b94679462c48b5`.

Los datos de entrenamiento corresponden al mercado DE-LU: precios históricos en EUR/MWh como objetivo, covariables pasadas horarias de previsión de carga (`load_fc`), eólica (`wind_fc`) y solar (`solar_fc`), más precios de mercados vecinos (BE, FR, NL, DK1, AT, CH, CZ), y covariables futuras de 24 valores de carga, viento y solar. La calibración de intervalos usa 303 días de desarrollo anteriores que terminan el 2025-06-30, y el registro de holdout declara un corte de ajuste en 2025-09-01. No se especifica en la información disponible el número total de tokens de entrenamiento ni la composición completa del dataset, ni si hubo RLHF o DPO (no aplicable en el sentido habitual a un modelo de forecasting).

La innovación técnica destacable es metodológica: el diseño "pre-gate" restringe las entradas a información disponible antes del cierre de la subasta D-1 a mediodía (Europe/Berlin), usando estimaciones meteorológicas pre-gate para viento y solar en lugar de las previsiones TSO post-gate. También se documenta el mapeo de días de entrega con cambio de hora (DST) a 24 slots.

## Capacidades

- Previsión de series temporales: genera predicciones cuantílicas para 24 horas de precios horarios de electricidad DE-LU en EUR/MWh.
- Predicción multivariante con covariables: incorpora carga, generación eólica y solar previstas, y precios de siete mercados vecinos.
- Salida cuantílica: el pipeline devuelve cuantiles por hora de previsión, con ejes target series, quantile y forecast hour.
- Calibración de intervalos: `calibration.json` permite una expansión de intervalos horaria separada, basada en datos de desarrollo, no en pesos neuronales.
- Inferencia desde JSON: `inference.py` acepta entradas numéricas preparadas y produce un fichero de previsión.
- No soporta tool calling, function calling, agentes ni capacidades multilingües: es un modelo numérico de forecasting, no un LLM generativo de texto.

## Casos de uso

- Previsión de precios day-ahead para trading: el modelo predice los 24 precios horarios del día siguiente con 85 días de historia y covariables pre-gate, adecuado para estrategias que deben decidir antes del cierre de la subasta D-1 a mediodía.
- Optimización de despacho de baterías: las previsiones cuantílicas por hora permiten construir escenarios de precio para decidir carga y descarga; el proyecto original incluye despacho de batería como componente externo a estos pesos.
- Investigación académica en forecasting energético: sirve como checkpoint reproducible (manifest con hashes, `source-release.zip`, `CITATION.cff`) para estudiar el ajuste LoRA sobre modelos fundacionales de series temporales.
- Benchmarking de baselines: útil para comparar modelos neuronales frente a baselines estadísticos como LEAR en condiciones de información pre-gate, con protocolo walk-forward y holdout documentado.
- Análisis de riesgo de mercado: los intervalos calibrados permiten estimar bandas de precio para gestión de exposición en mercados eléctricos europeos.
- Prototipado de pipelines de forecasting: el helper de inferencia valida arrays alineados y finitos, lo que facilita integrar el modelo en entornos de desarrollo con datos sintéticos (`example_input.json`) antes de conectar feeds reales.
- Estudio de transferencia entre mercados: la inclusión de precios de mercados vecinos (BE, FR, NL, DK1, AT, CH, CZ) permite analizar acoplamiento entre mercados eléctricos europeos.

## Benchmarks y rendimiento

| Metrica | Valor | Contexto |
|---|---|---|
| MAE holdout (unico) | 15,386 EUR/MWh | 372 dias, 2025-11-01 a 2026-11-09 (faltan 2 dias de entrega) |
| MAE LEAR (ventana comun) | ~15,34 EUR/MWh | LEAR uso entradas TSO post-gate; conjuntos de informacion distintos |
| Test Diebold-Mariano | p = 0,543 (una cola, diario multivariante) | No se establece mejora de precision frente a LEAR |

No se han publicado en la informacion disponible resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros), dado que el modelo no es un LLM generativo. La evaluacion se limita al MAE de holdout descrito y no constituye evidencia de mejora frente al baseline.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con 119,5 M de parametros, en float32 los pesos ocupan aproximadamente 0,48 GB, por lo que la inferencia cabe holgadamente en cualquier GPU consumer reciente y en CPU.
- GPU recomendadas: no se especifican; el modelo usa `device_map="cpu"` por defecto y admite `--device mps` en Mac compatibles.
- Cabe en GPU consumer: sí, por el tamano reducido del modelo (repo de 0,5 GB); no se documentan requisitos minimos concretos.
- Opciones de despliegue: libreria `chronos-forecasting` con `Chronos2Pipeline.from_pretrained`; script `inference.py` para entrada JSON; los pesos fusionados cargan sin PEFT, mientras que el adaptador independiente opcional requiere PEFT.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Chronos-2 DE-LU pre-gate (este) | 119,5 M | 2040 valores (85 dias) | MAE 15,386 EUR/MWh en holdout | Apache 2.0 | Hugging Face (0 descargas, 0 likes) |
| amazon/chronos-2 (base) | no disponible | no disponible | no disponible | no disponible | Hugging Face |
| LEAR (baseline estadistico) | no aplica | no aplica | ~15,34 EUR/MWh en ventana comun | no disponible | implementacion propia del estudio |

La comparacion con LEAR no es estrictamente equivalente porque LEAR emplea entradas TSO post-gate y este checkpoint usa entradas pre-gate. No se dispone de datos comparativos con otros modelos de forecasting electrico en la informacion proporcionada.

## Limitaciones y advertencias

- No se ha demostrado mejora de precision frente al baseline LEAR: el test Diebold-Mariano arroja p = 0,543 y el MAE es ligeramente superior (15,386 frente a ~15,34).
- Las variantes Chronos post-gate obtuvieron mejores resultados, pero esos resultados no deben atribuirse a este checkpoint.
- La evaluacion se realizo con multiples ensayos de investigacion registrados; el holdout fue de una sola vez, pero el proceso completo no elimina el riesgo de sobreajuste de seleccion.
- No se establece el corte de preentrenamiento del modelo base ni se descarta solapamiento con sus datos de preentrenamiento.
- Los cuantiles nominales no garantizan cobertura; la expansion de intervalos es una calibracion historica separada y solo de desarrollo.
- El paquete acepta entradas preparadas: no reconstruye el pipeline operativo completo (feeds crudos, regresores LightGBM de meteorologia a generacion, recoleccion de feeds, preprocesado DST, modelos de referencia ni despacho de bateria).
- No incluye datos de mercado reales ni credenciales; las fuentes originales (SMARD, Energy-Charts, Open-Meteo) tienen sus propios terminos de redistribucion.
- Las previsiones de viento y solar del dia objetivo deben ser estimaciones meteorologicas pre-gate; usar previsiones TSO post-gate invalidaria el protocolo.
- El repositorio tiene 0 descargas y 0 likes, y fue creado en 2026-11-16: es un artefacto de investigacion sin validacion independiente por la comunidad.
- Licencia Apache 2.0 permite uso comercial, pero el autor lo presenta como checkpoint de investigacion, no como modelo listo para produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AryanSudhirDev/chronos-2-de-lu-pregate
- Modelo base: https://huggingface.co/amazon/chronos-2
- Repositorio GitHub: https://github.com/AryanSudhirDev/chronos-2-de-lu-pregate
- Documentacion de resultados: docs/RESULTS.md (en el repositorio)
- Proceso de investigacion: docs/METHODOLOGY.md (en el repositorio)
- Reproducibilidad: docs/REPRODUCIBILITY.md (en el repositorio)
- Contrato de datos: docs/DATA.md (en el repositorio)
- Artefactos: docs/ARTIFACTS.md (en el repositorio)
