# MyHeartCounts/openmhc-timesnet-imp

## Resumen

OpenMHC TimesNet es un checkpoint de referencia publicado por el equipo OpenMHC (organización MyHeartCounts) para la tarea de imputación de series temporales procedentes de dispositivos wearables. No es un modelo de lenguaje: es un imputador de ventanas de sensores construido sobre PyPOTS y empaquetado con la librería `openmhc`, que reconstruye ventanas diarias de 1440 minutos (resolución de un minuto) a través de 19 canales de sensores. Su función es rellenar los huecos habituales en datos de wearables, donde las lecturas se pierden por falta de adherencia, batería o calidad de señal.

El modelo se distribuye como un wrapper reproducible sobre un imputador respaldado por PyPOTS, entrenado sobre el split de entrenamiento de imputación de OpenMHC. La relevancia actual reside en que OpenMHC se presenta como una infraestructura para acelerar la investigación en modelos fundacionales de wearables, y este checkpoint sirve como referencia metodológica para comparar técnicas de imputación bajo un protocolo común.

El repositorio ocupa 0,3 GB y no registra descargas en el momento de la consulta. La model card es explícita respecto al alcance: uso exclusivamente investigador y de reproducción de benchmarks, con prohibición expresa de cualquier aplicación diagnóstica, pronóstica o de apoyo a decisiones clínicas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TimesNet (imputador de series temporales respaldado por PyPOTS) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | ventana diaria de 1440 minutos, 19 canales de sensores |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo sobre series temporales, no texto) |
| Licencia | BigScience OpenRAIL-M |
| Formato de pesos | no disponible (checkpoint cargado vía `openmhc`, repo de 0,3 GB) |

## Arquitectura y entrenamiento

La arquitectura es TimesNet, una red neuronal para series temporales que transforma secuencias 1D en tensores 2D para capturar periodos multi-escala mediante convoluciones 2D. En este caso se emplea como imputador: recibe ventanas con valores enmascarados y reconstruye los valores ausentes a lo largo de los 19 canales de sensores. La implementación subyacente proviene de PyPOTS, la librería de referencia para tareas de series temporales parcialmente observadas.

El entrenamiento se realizó sobre el split de imputación de OpenMHC. El autor documenta un MAE de validación de 0,2718 en la época 11, y los hiperparámetros de arquitectura quedan fijados en el fichero `openmhc_manifest.json` incluido en el repositorio. El artefacto original procede de un registro de W&B (`MHC_Dataset/mhc-pypots-timesnet/timesnet:v31`). No se especifican en la información disponible el volumen de tokens, la composición exacta del dataset ni si hubo ajuste posterior con RLHF o DPO (poco probable en un modelo de imputación).

## Capacidades

- Imputación de valores ausentes en ventanas diarias de datos de wearables con 19 canales de sensores.
- Reconstrucción de series temporales multimodales a resolución de un minuto (1440 pasos por ventana).
- Evaluación estandarizada mediante `openmhc.evaluate_imputation`, que permite comparar contra el protocolo del benchmark OpenMHC.
- Versionado reproducible: permite fijar revisiones concretas con el sufijo `@v1.0` en la referencia `hf://`.
- Integración con el ecosistema PyPOTS para experimentación con otras técnicas de imputación.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües: no es un modelo generativo de texto.

## Casos de uso

- Reproducción del benchmark OpenMHC: cargar el checkpoint con `TimesNetImputer.from_release` y ejecutar `evaluate_imputation` para obtener una línea base reproducible frente a la que comparar nuevos imputadores.
- Comparación metodológica de técnicas de imputación: usar este TimesNet como referencia y contrastarlo con otros imputadores de PyPOTS (SAITS, BRITS, Transformer-based) sobre el mismo split y la misma métrica MAE.
- Preprocesamiento de cohortes de wearables para investigación: rellenar huecos en ventanas diarias antes de alimentar modelos posteriores de fenotipado o análisis estadístico, siempre en contexto no clínico.
- Desarrollo de pipelines de datos de sensores: integrar el imputador en un flujo de limpieza que reconstruya lecturas perdidas por falta de adherencia o batería en estudios observacionales.
- Validación de infraestructura de modelos fundacionales de wearables: emplear el checkpoint como prueba de humo del stack `openmhc[pypots,hf]` antes de entrenar modelos propios.
- Docencia y formación en series temporales: ilustrar técnicas de imputación con un caso real, reproducible y con licencia abierta, sobre datos multimodales de sensores.

## Benchmarks y rendimiento

| Metrica | Valor | Contexto |
|---|---|---|
| MAE de validación | 0,2718 | Época 11, split de imputación de OpenMHC |

No se han publicado en la información disponible resultados comparativos frente a otros imputadores (SAITS, BRITS, etc.) ni métricas adicionales como RMSE o MSE.

## Requisitos de hardware

- VRAM estimada: no disponible. El repositorio pesa 0,3 GB, lo que sugiere que la inferencia es viable en GPU de consumo, pero no se documenta el consumo real.
- GPU recomendadas: no disponible. Por el tamaño del checkpoint, una GPU consumer moderna (RTX 3060 o superior) debería ser suficiente, aunque no hay confirmación del autor.
- Cabe en GPU consumer: probablemente sí, dado el tamaño del artefacto, sin datos oficiales.
- Opciones de despliegue: carga vía `openmhc` con extras `pypots` y `hf` (`pip install 'openmhc[pypots,hf]'`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Ventana / canales | Metrica publicada | Licencia |
|---|---|---|---|---|
| OpenMHC TimesNet (este) | Imputador TimesNet | 1440 min / 19 canales | MAE val 0,2718 | OpenRAIL-M |
| Otros imputadores PyPOTS (SAITS, BRITS) | Imputadores de series temporales | Configurable | no disponible en esta ficha | varía |
| Modelos fundacionales de wearables (p. ej. bases de OpenMHC) | Representaciones auto-supervisadas | no disponible | no disponible | varía |

No se dispone de datos comparativos publicados en la información proporcionada para establecer una comparación cuantitativa con alternativas concretas.

## Limitaciones y advertencias

- Uso previsto exclusivamente investigador: reproducción de benchmarks y comparación metodológica. Queda fuera de alcance cualquier uso diagnóstico, de cribado, pronóstico, predicción de riesgo prospectiva o apoyo a decisiones clínicas.
- Las etiquetas médicas de OpenMHC son autoinformadas y carecen de fechas de diagnóstico; el rendimiento en el benchmark no establece utilidad clínica.
- La licencia OpenRAIL-M impone restricciones de uso en su Anexo A, incluyendo la prohibición de proporcionar consejo médico o interpretación de resultados médicos.
- Riesgo de alucinación no aplica en el sentido generativo, pero sí existe riesgo de reconstrucciones plausibles pero incorrectas en ventanas con muchos valores ausentes.
- No se documentan sesgos demográficos ni de composición de la cohorte de entrenamiento; la generalización a poblaciones distintas de la de OpenMHC no está validada.
- No hay información sobre el rendimiento en canales individuales ni sobre el comportamiento con tasas de enmascaramiento extremas.
- El checkpoint no incluye tokenizador ni capacidades de texto; no debe confundirse con un modelo de lenguaje pese a la nomenclatura de modelos fundacionales.

## Enlaces

- HuggingFace: https://huggingface.co/MyHeartCounts/openmhc-timesnet-imp
- Repositorio OpenMHC: https://github.com/AshleyLab/OpenMHC
- PyPOTS: https://github.com/WenjieDu/PyPOTS
