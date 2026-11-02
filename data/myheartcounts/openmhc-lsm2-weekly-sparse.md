# MyHeartCounts/openmhc-lsm2-weekly-sparse

## Resumen

OpenMHC LSM2 weekly-sparse es un checkpoint de extracción de características para series temporales de wearables, desarrollado por el equipo OpenMHC (repositorio AshleyLab/OpenMHC) y publicado en HuggingFace bajo el identificador MyHeartCounts/openmhc-lsm2-weekly-sparse. Se trata de una extensión del modelo LSM2 orientada a ventanas semanales: en lugar de aplicar un único transformer sobre los 10080 minutos de una semana, reutiliza el encoder diario congelado (LSM2-daily) de forma independiente para cada día y reconstruye la semana mediante bloques decodificadores que alternan procesamiento local por día y procesamiento cruzado entre días.

El modelo es un masked autoencoder (MAE) auto-supervisado entrenado sobre 19 canales de sensores procedentes de wearables, con un decodificador disperso (sparse-decoder) que reduce el coste computacional frente a la variante semanal densa. Su propósito declarado es la investigación, la comparación metodológica y la reproducción del benchmark OpenMHC, en particular la pista de evaluación de imputación de datos.

Es relevante ahora porque forma parte de un esfuerzo abierto por construir modelos fundacionales para datos de wearables, un dominio con escasez de checkpoints públicos y con requisitos estrictos de validación clínica. El modelo se distribuye como referencia reproducible con hiperparámetros fijados en un manifiesto y una pérdida de validación documentada de 0,2464.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Masked autoencoder (MAE) con encoder diario congelado (LSM2-daily) y decodificador disperso con bloques alternos día-local / cruzado entre días; embeddings de día tipo RoPE opcionales (calendar-aware) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | ventana semanal de 10080 minutos (7 días), 19 canales de sensores |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo sobre series temporales, no texto) |
| Licencia | BigScience OpenRAIL-M |
| Formato de pesos | no disponible (repo de 0,1 GB gestionado por la librería `openmhc`) |

## Arquitectura y entrenamiento

La arquitectura es un masked autoencoder auto-supervisado para series temporales multivariantes. La variante weekly-sparse aplica el encoder diario LSM2-daily, que permanece congelado, de manera independiente a cada uno de los siete días de la ventana. La reconstrucción semanal se realiza mediante bloques decodificadores que alternan atención local por día y atención cruzada entre días, de modo que el modelo puede capturar dependencias intra-día y inter-día sin ejecutar un transformer denso sobre los 10080 pasos temporales completos. Opcionalmente incorpora embeddings de día basados en RoPE para dotar al modelo de conciencia de calendario.

El entrenamiento es de tipo self-supervised mediante enmascarado y reconstrucción sobre 19 canales de sensores de wearables. El checkpoint procede del artefacto de W&B `MHC_Dataset/mhc-mae-ssl/mae-weekly-sparse-d4:v0` y reporta una pérdida de validación de 0,2464. Los hiperparámetros de arquitectura están fijados en el archivo `openmhc_manifest.json` del repositorio. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron etapas de RLHF o DPO (poco probables en un modelo de este tipo).

## Capacidades

- Extracción de características (feature extraction) sobre series temporales semanales de wearables con 19 canales de sensores.
- Imputación de datos faltantes en ventanas de 7 días mediante reconstrucción del MAE; es la tarea evaluada en la pista de imputación de OpenMHC.
- Modelado de dependencias intra-día e inter-día gracias a los bloques decodificadores alternos.
- Soporte opcional de información de calendario mediante embeddings de día basados en RoPE.
- Aprendizaje auto-supervisado, lo que permite reutilizar el encoder congelado para tareas posteriores de representación.
- Integración con la librería `openmhc` mediante la clase `LSM2WeeklySparseImputer` y la función `openmhc.evaluate_imputation`.
- No se documentan capacidades de generación de texto, razonamiento, código, matemáticas, visión, audio, tool calling ni agentes.

## Casos de uso

- Reproducción del benchmark OpenMHC: cargar el checkpoint con `LSM2WeeklySparseImputer.from_release` y ejecutar `openmhc.evaluate_imputation(imp, version="xs")` para replicar la pista de imputación con la versión de dataset indicada.
- Comparación metodológica de decodificadores: usar esta variante dispersa frente a la semanal densa para medir el compromiso entre coste computacional y calidad de reconstrucción en ventanas de 7 días.
- Imputación de huecos en registros de wearables: reconstruir minutos faltantes en series de 19 canales antes de alimentar pipelines de análisis posteriores, aprovechando el enmascarado del MAE.
- Extracción de representaciones para modelos posteriores: emplear el encoder diario congelado y las salidas del modelo como features para clasificadores o modelos de regresión aguas abajo en estudios observacionales.
- Investigación en modelos fundacionales de salud digital: servir como checkpoint de referencia abierto para estudiar transferencia y estabilidad de representaciones auto-supervisadas en datos de sensores.
- Validación de pipelines de datos: comprobar la coherencia de preprocesado y alineación temporal de series semanales comparando la pérdida de reconstrucción con el valor de referencia de validación (0,2464).
- Experimentos con información de calendario: evaluar el efecto de los embeddings de día RoPE en la reconstrucción cuando los patrones semanales dependen del día de la semana.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Pérdida de validación (val loss) | 0,2464 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible, ni comparaciones numéricas con modelos similares.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio ocupa 0,1 GB, lo que sugiere un checkpoint ligero, pero no se documenta el número de parámetros ni el consumo en memoria.
- GPU recomendadas: no disponibles.
- Compatibilidad con GPU de consumo: no confirmada en la información proporcionada.
- Opciones de despliegue: la vía documentada es la librería `openmhc` con los extras `openmhc[lsm2,hf]`; no se mencionan vLLM, llama.cpp, Ollama ni TGI (herramientas orientadas a modelos de lenguaje).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Ventana | Canales | Licencia | Notas |
|---|---|---|---|---|---|
| OpenMHC LSM2 weekly-sparse | MAE con decoder disperso | 10080 min (7 días) | 19 | BigScience OpenRAIL-M | Decoder alterno día-local / cruzado; menor coste que la variante densa |
| OpenMHC LSM2-daily | MAE diario (encoder congelado en esta variante) | diaria | 19 | no disponible en la información | Encoder reutilizado por weekly-sparse |
| Variante weekly densa de OpenMHC | Transformer denso sobre la semana completa | 10080 min | 19 | no disponible en la información | Mayor coste computacional según la model card |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Uso previsto exclusivamente de investigación, comparación metodológica y reproducción del benchmark; queda fuera de alcance el diagnóstico, cribado, pronóstico, predicción prospectiva de riesgo y cualquier apoyo a decisiones clínicas.
- Las etiquetas de condiciones médicas de OpenMHC son autoinformadas y carecen de fechas de diagnóstico; el rendimiento en el benchmark no establece utilidad clínica.
- Cualquier afirmación diagnóstica, pronóstica o de cribado requiere validación independiente con desenlaces adjudicados clínicamente y alineados temporalmente en la población objetivo.
- La licencia BigScience OpenRAIL-M impone restricciones de uso del Anexo A, que entre otras cosas prohíben proporcionar consejo médico e interpretación de resultados médicos; estas restricciones se aplican al checkpoint y a sus derivados.
- Riesgo de sesgo derivado de la población y los dispositivos presentes en los datos de entrenamiento; no se documenta la composición del dataset.
- Riesgo de alucinación no aplicable en el sentido de generación de texto, pero sí de reconstrucciones plausibles pero incorrectas en la imputación de series.
- No se documentan idiomas soportados ni limitaciones de contexto más allá de la ventana fija de 10080 minutos.
- No se especifican parámetros totales, cuantizaciones ni formatos de pesos, lo que dificulta planificar el despliegue en producción.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, sin evidencia de uso externo publicado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/MyHeartCounts/openmhc-lsm2-weekly-sparse
- Repositorio OpenMHC: https://github.com/AshleyLab/OpenMHC
- Checkpoint diario relacionado: https://huggingface.co/MyHeartCounts/openmhc-lsm2-daily
- Licencia BigScience OpenRAIL-M: https://huggingface.co/MyHeartCounts/openmhc-lsm2-weekly-sparse/blob/main/LICENSE
