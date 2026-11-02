# MyHeartCounts/openmhc-dlinear-imp

## Resumen

OpenMHC DLinear es un checkpoint de referencia del proyecto OpenMHC, una iniciativa orientada a acelerar la investigacion sobre modelos fundacionales para datos de wearables. El modelo es un imputador de series temporales construido sobre PyPOTS y empaquetado mediante la libreria `openmhc`, cuyo objetivo es reconstruir ventanas de sensores en las que se han enmascarado valores. Lo desarrolla el equipo OpenMHC (repositorio AshleyLab) y se publica bajo la licencia BigScience OpenRAIL-M.

El checkpoint trabaja sobre ventanas diarias de 1440 minutos con 19 canales de sensores, un formato habitual en estudios con dispositivos vestibles como relojes y pulseras de actividad. No se trata de un modelo de lenguaje ni de un transformer generativo: es un modelo de imputacion de series temporales, especificamente una variante DLinear respaldada por PyPOTS. Su relevancia radica en que sirve como referencia reproducible para el benchmark de imputacion de OpenMHC y para comparaciones metodologicas dentro del ecosistema de investigacion con wearables.

La informacion publicada es limitada: el repositorio de HuggingFace ocupa 0.0 GB, no declara pipeline, no especifica idiomas y no incluye resultados de benchmarks mas alla del MAE de validacion reportado en la procedencia del artefacto. El checkpoint esta pensado exclusivamente para investigacion y reproduccion, con un alcance explicitamente excluyente de cualquier uso clinico o diagnostico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DLinear (imputador de series temporales respaldado por PyPOTS) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | ventana diaria de 1440 minutos (1440 pasos temporales) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de series temporales, no linguistico) |
| Licencia | BigScience OpenRAIL-M |
| Formato de pesos | no disponible (empaquetado como release `hf://` consumible por `openmhc`) |

## Arquitectura y entrenamiento

El modelo es un DLinear, una arquitectura lineal para series temporales que descompone la senal en componentes de tendencia y estacionalidad y aplica proyecciones lineales sobre cada una. En este caso, el checkpoint es un wrapper sobre un imputador respaldado por PyPOTS, entrenado sobre el split de entrenamiento de imputacion de OpenMHC. El modelo reconstruye ventanas de sensores enmascaradas a traves de 19 canales, con una ventana diaria de 1440 minutos.

Los hiperparametros de arquitectura estan fijados en el fichero `openmhc_manifest.json` del release. La procedencia del checkpoint es el artefacto de W&B `MHC_Dataset/mhc-pypots-dlinear/dlinear:v49`, y el autor reporta un MAE de validacion de 0.1335 en la epoca 2. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset, ni si se aplicaron tecnicas de RLHF o DPO (lo cual es esperable que no aplique a un modelo de imputacion).

## Capacidades

- Imputacion de series temporales: reconstruye valores enmascarados en ventanas de 19 canales de sensores de wearables.
- Trabajo con ventanas diarias: procesa secuencias de 1440 minutos (un dia completo) por ventana.
- Integracion con el ecosistema OpenMHC: se carga mediante `DLinearImputer.from_release` y se evalua con `openmhc.evaluate_imputation`.
- Versionado por revision: permite fijar una revision concreta mediante el sufijo `@` (por ejemplo `@v1.0`).
- Reproducibilidad de benchmark: disenado para reproducir el benchmark de imputacion de OpenMHC y comparaciones metodologicas.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingues: no es un modelo generativo de texto.

## Casos de uso

- Reproduccion del benchmark OpenMHC: cargar el checkpoint con `DLinearImputer.from_release("hf://MyHeartCounts/openmhc-dlinear-imp")` y ejecutar `openmhc.evaluate_imputation` para obtener una linea base DLinear reproducible frente a la que comparar otros imputadores.
- Comparacion metodologica de imputadores: usar este DLinear como referencia lineal y contrastarlo con modelos mas complejos (transformer, SSM) sobre el mismo split de imputacion, midiendo MAE y otras metricas del benchmark.
- Preprocesamiento de datos de wearables para investigacion: rellenar huecos en ventanas diarias de 19 canales antes de alimentar pipelines analiticos secundarios, siempre en contexto de investigacion y no clinico.
- Desarrollo de pipelines de evaluacion: integrar el checkpoint en tests automatizados del proyecto `openmhc` para verificar que las releases y las extras (`openmhc[pypots,hf]`) funcionan correctamente.
- Docencia y divulgacion sobre imputacion de series temporales: emplear un modelo lineal sencillo y con MAE de validacion conocido (0.1335) como ejemplo didactico de imputacion con PyPOTS.
- Validacion de infraestructura de releases: usar el checkpoint para probar el flujo de descarga desde HuggingFace, el pinning de revisiones y la carga de manifiestos en entornos de CI.

## Benchmarks y rendimiento

| Metrica | Valor | Contexto |
|---|---|---|
| MAE de validacion | 0.1335 | Epoca 2, segun procedencia del artefacto W&B `dlinear:v49` |

No se han publicado en la informacion disponible resultados comparativos con otros modelos (MMLU, HumanEval, GSM8K u otras metricas no aplican a este tipo de modelo).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Al ser un modelo DLinear sobre ventanas de 1440 pasos y 19 canales, la huella es previsiblemente muy reducida, pero no se publican cifras.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible; por la naturaleza lineal del modelo, es probable que quepa en GPU de consumo e incluso en CPU, pero no se confirma en la informacion.
- Opciones de despliegue: carga mediante la libreria `openmhc` con las extras `openmhc[pypots,hf]`; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye otros checkpoints de imputacion comparables ni datos de rendimiento de alternativas.

## Limitaciones y advertencias

- Uso exclusivamente de investigacion: el autor excluye explicitamente diagnosis, cribado, pronostico, prediccion prospectiva de riesgo y apoyo a decisiones clinicas.
- Etiquetas medicas autodeclaradas: las condiciones medicas de OpenMHC son autoinformadas y sin fechas de diagnostico, por lo que el rendimiento en el benchmark no establece utilidad clinica.
- Validacion externa requerida: cualquier afirmacion diagnostica o pronostica exigiria validacion independiente con resultados adjudicados clinicamente y alineados temporalmente.
- Restricciones de licencia: la OpenRAIL-M incluye restricciones de uso en su Attachment A que prohiben, entre otras cosas, proporcionar consejo medico e interpretacion de resultados medicos.
- Informacion tecnica incompleta: no se publican numero de parametros, composicion del dataset de entrenamiento, ni detalles de cuantizacion.
- Sin datos de sesgo ni de robustez: no se documentan sesgos poblacionales ni comportamiento fuera de la distribucion del split de entrenamiento.
- Rendimiento reportado temprano: el MAE de validacion corresponde a la epoca 2, lo que conviene tener en cuenta al interpretar el resultado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/MyHeartCounts/openmhc-dlinear-imp
- Repositorio OpenMHC: https://github.com/AshleyLab/OpenMHC
- PyPOTS: https://github.com/WenjieDu/PyPOTS
- Licencia BigScience OpenRAIL-M: incluida en el fichero `LICENSE` del repositorio del modelo
