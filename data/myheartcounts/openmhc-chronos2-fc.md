# MyHeartCounts/openmhc-chronos2-fc

## Resumen

OpenMHC Forecasting — Chronos-2 es un checkpoint de referencia del track 3 (forecasting) del benchmark de salud con wearables MyHeartCounts / OpenMHC, publicado por el equipo MyHeartCounts. Se trata de un ajuste fino del modelo fundacional de series temporales Chronos-2 de Amazon, orientado a la prediccion probabilistica multivariante con covariables. El checkpoint resuelve una tarea muy concreta: el pronostico a 24 horas vista sobre 19 canales de sensores con resolucion horaria, partiendo de datos de wearables.

El modelo parte de `amazon/chronos-2` y se ha ajustado mediante LoRA (rango 8, alpha 16) sobre el split de entrenamiento de MHC; el adaptador se ha fusionado en el modelo base, por lo que el artefacto es un modelo completo y autonomo que no requiere PEFT en tiempo de ejecucion. Su relevancia es metodologica: sirve como referencia reproducible para comparar tecnicas de forecasting en el benchmark OpenMHC, no como herramienta clinica.

El checkpoint se distribuye en formato de directorio Hugging Face (`config.json` + `model.safetensors`), con un tamano de repositorio de aproximadamente 0,5 GB, bajo licencia BigScience OpenRAIL-M. La model card restringe explicitamente su uso a investigacion, comparacion metodologica y reproduccion del benchmark, y excluye cualquier aplicacion de diagnostico, cribado, pronostico o apoyo a decisiones clinicas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Chronos-2 (modelo fundacional de series temporales, base `amazon/chronos-2`) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (ventana de pronostico: 24 horas, 19 canales, resolucion horaria) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan cuantizaciones) |
| Idiomas soportados | no disponible (modelo de series temporales, no de texto) |
| Licencia | BigScience OpenRAIL-M (modelo base `amazon/chronos-2` bajo Apache-2.0) |
| Formato de pesos | safetensors (`checkpoint/config.json` + `checkpoint/model.safetensors`) |

## Arquitectura y entrenamiento

El modelo es un Chronos-2, el modelo fundacional universal de series temporales de Amazon descrito por Ansari et al. (2025). Chronos-2 esta disenado para forecasting probabilistico y admite escenarios multivariantes con covariables, lo que encaja con la tarea del benchmark: predecir 24 horas hacia delante sobre 19 canales de sensores a resolucion horaria. El checkpoint parte de los pesos preentrenados de `amazon/chronos-2` y se ajusta sobre el split de entrenamiento de MHC.

El ajuste fino se realizo con LoRA de rango 8 y alpha 16, y el adaptador se fusiono posteriormente en el modelo base, de modo que el resultado es un modelo completo sin dependencia de PEFT en ejecucion. La model card no detalla el numero de tokens de entrenamiento, la composicion exacta del dataset ni si hubo etapas adicionales de RLHF o DPO; esa informacion no esta disponible en la documentacion proporcionada. El manifiesto `openmhc_manifest.json` incluido en el bundle recoge la procedencia (ejecucion de entrenamiento, modelo base y detalles del ajuste fino) y metadatos de arquitectura.

## Capacidades

- Pronostico probabilistico de series temporales a 24 horas vista con resolucion horaria.
- Forecasting multivariante sobre 19 canales de sensores de wearables de forma conjunta.
- Forecasting informado por covariables, segun las capacidades del modelo base Chronos-2.
- Integracion con el harness de evaluacion de OpenMHC mediante `Chronos2Forecaster` y `openmhc.evaluate_forecasting`.
- Carga como bundle de release a traves de `hf://MyHeartCounts/openmhc-chronos2-fc@v1.0`.
- No se documentan capacidades de generacion de texto, codigo, vision, audio, tool calling ni razonamiento agéntico; es un modelo especifico de series temporales.

## Casos de uso

- Reproduccion del benchmark OpenMHC: cargar el checkpoint con `Chronos2Forecaster.from_release` y ejecutar `openmhc.evaluate_forecasting` para obtener resultados comparables con la referencia publicada del track 3.
- Comparacion metodologica de tecnicas de forecasting: usar este checkpoint como linea base ajustada frente a variantes propias (otras arquitecturas, otros regimenes de ajuste fino) sobre el mismo split y las mismas metricas del benchmark.
- Investigacion en forecasting de wearables: analizar el comportamiento del modelo sobre 19 canales de sensores horarios para estudiar que senales aportan mas informacion predictiva a 24 horas.
- Desarrollo de pipelines de evaluacion: integrar el bundle en el harness mediante `model.release_dir=hf://MyHeartCounts/openmhc-chronos2-fc@v1.0` para automatizar experimentos y comparaciones.
- Estudio de ajuste eficiente: servir como ejemplo reproducible de adaptacion con LoRA (rango 8, alpha 16) fusionada en un modelo fundacional de series temporales, util para disenar estrategias de fine-tuning en dominios con datos limitados.
- Docencia y formacion en series temporales: emplear el checkpoint como caso practico de forecasting probabilistico multivariante con covariables en un entorno de benchmark abierto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precision; el repositorio ocupa aproximadamente 0,5 GB, lo que sugiere un modelo de escala moderada que en fp32 requeriria del orden de 1 a 2 GB de memoria, pero el numero de parametros no se documenta.
- GPU recomendadas: no disponible. Por el tamano del artefacto, es probable que quepa en GPUs de consumo, pero no hay datos oficiales que lo confirmen.
- Cabe en consumer GPU: no confirmado; el tamano del repositorio (0,5 GB) lo hace plausible, pero no se aportan requisitos oficiales.
- Opciones de despliegue: libreria `openmhc` (extra `openmhc[chronos]`) y la implementacion oficial de Chronos (`amazon-science/chronos-forecasting`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que estan orientados a modelos de lenguaje.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / ventana | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| openmhc-chronos2-fc | no disponible | 24 h, 19 canales, horaria | Forecasting de wearables (benchmark OpenMHC) | BigScience OpenRAIL-M | Hugging Face (MyHeartCounts) |
| amazon/chronos-2 | no disponible | no disponible | Forecasting universal de series temporales | Apache-2.0 | Hugging Face (amazon) |
| Otros checkpoints del benchmark OpenMHC | no disponible | no disponible | Tracks del benchmark OpenMHC | no disponible | no disponible |

La comparacion principal es con el modelo base `amazon/chronos-2`, del que este checkpoint es un ajuste fino con LoRA fusionada; la diferencia esperada es la especializacion en la tarea de 24 horas y 19 canales del benchmark, aunque no se aportan metricas comparativas en la informacion disponible.

## Limitaciones y advertencias

- Uso previsto exclusivamente para investigacion, comparacion metodologica y reproduccion del benchmark OpenMHC.
- Fuera de alcance: diagnostico, cribado, pronostico, prediccion prospectiva de riesgo, apoyo a decisiones clinicas o cualquier otra decision medica.
- Las etiquetas de condiciones medicas de OpenMHC son autoinformadas y carecen de fechas de diagnostico; el rendimiento en el benchmark no establece utilidad clinica.
- Cualquier afirmacion diagnostica, pronostica o de cribado requiere validacion independiente con desenlaces adjudicados clinicamente y alineados temporalmente en la poblacion objetivo.
- La licencia BigScience OpenRAIL-M incluye restricciones de uso en su Attachment A que prohiben, entre otras cosas, proporcionar consejo medico e interpretacion de resultados medicos; estas restricciones se aplican al checkpoint y a sus derivados.
- El modelo base `amazon/chronos-2` esta bajo Apache-2.0 y su licencia y avisos siguen aplicandose.
- Riesgo de alucinacion y sesgos: no documentado en la informacion disponible; al tratarse de datos de wearables autoinformados, los sesgos de la poblacion de origen pueden propagarse al pronostico.
- Limitaciones de idioma: no aplica directamente (modelo de series temporales), pero no se documenta la composicion poblacional ni la cobertura geografica de los datos de entrenamiento.
- No se documentan requisitos de hardware, latencias ni cuantizaciones, lo que dificulta planificar un despliegue en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MyHeartCounts/openmhc-chronos2-fc
- Modelo base: https://huggingface.co/amazon/chronos-2
- Implementacion oficial de Chronos: https://github.com/amazon-science/chronos-forecasting
- Paper Chronos-2 (Ansari et al., 2025): https://arxiv.org/abs/2510.15821
