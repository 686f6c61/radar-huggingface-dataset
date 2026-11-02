# MyHeartCounts/openmhc-segrnn-fc

## Resumen

OpenMHC Forecasting — SegRNN es un checkpoint de referencia para la tarea de predicción (track 3) del benchmark de salud con wearables MyHeartCounts / OpenMHC. Lo desarrolla el proyecto MyHeartCounts y se publica bajo la librería `openmhc`, con el objetivo de servir como línea base reproducible para comparación metodológica de modelos de forecasting sobre series temporales de sensores corporales.

El modelo es una implementación de SegRNN, una red neuronal recurrente diseñada específicamente para predicción de largo horizonte. A diferencia de los transformers de series temporales, SegRNN divide la secuencia en segmentos y aplica iteraciones segmento a segmento con decodificación paralela multi-paso, lo que reduce el coste computacional del bucle autoregresivo clásico de las RNN. El checkpoint se ha entrenado desde cero sobre el split de entrenamiento de MHC usando la implementación de PyPOTS.

La tarea concreta es predicción a 24 horas vista, sobre 19 canales de sensores con resolución horaria. Su relevancia es acotada pero clara: proporciona un punto de comparación reproducible y de código abierto para investigadores que trabajan en forecasting de señales de wearables, en un ecosistema donde la mayoría de checkpoints de este tipo no se publican. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y un tamaño de 0.0 GB según HuggingFace, coherente con un checkpoint RNN de pequeño tamaño.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SegRNN (red neuronal recurrente con iteraciones por segmentos y decodificación paralela multi-paso) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible; la tarea define entrada de series horarias y horizonte de predicción de 24 horas |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de series temporales, no de lenguaje) |
| Licencia | BigScience OpenRAIL-M |
| Formato de pesos | checkpoint PyPOTS (`model.pypots`) acompañado de `standard_scaler_stats.json` y `training_config.json` |

## Arquitectura y entrenamiento

SegRNN es una arquitectura recurrente orientada a forecasting de largo horizonte. En lugar de predecir paso a paso de forma totalmente autoregresiva, segmenta la serie de entrada y realiza iteraciones sobre segmentos, con una estrategia de decodificación paralela multi-paso que acorta el número de iteraciones necesarias para cubrir el horizonte de predicción. Esto mitiga dos problemas clásicos de las RNN en series temporales: la acumulación de error en horizontes largos y el coste secuencial de la decodificación.

El checkpoint se ha entrenado desde cero sobre el split de entrenamiento de MyHeartCounts, usando la implementación de PyPOTS. La tarea es predicción a 24 horas sobre 19 canales de sensores a resolución horaria. El bundle incluye las estadísticas del escalador estándar (`standard_scaler_stats.json`), necesario para reproducir el preprocesado, y la configuración de entrenamiento (`training_config.json`). El repositorio incluye además un `openmhc_manifest.json` con la procedencia (run de entrenamiento, modelo base y detalles de ajuste) y metadatos de arquitectura. No se dispone de información sobre volumen de tokens, composición del dataset ni uso de RLHF/DPO, que en este dominio no aplican del mismo modo que en modelos de lenguaje.

## Capacidades

- Predicción de series temporales multivariantes: 19 canales de sensores de wearables, resolución horaria.
- Forecasting a 24 horas vista sobre las señales de entrada.
- Normalización reproducible mediante estadísticas de escalador incluidas en el bundle.
- Integración con el harness de evaluación de OpenMHC a través de `openmhc.forecasters.SegRNNForecaster`.
- Carga directa desde HuggingFace mediante el esquema `hf://MyHeartCounts/openmhc-segrnn-fc@v1.1`.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso en el sentido de los modelos de lenguaje.
- No dispone de capacidades multilingües, visión ni audio.
- No dispone de modo thinking ni decodificación especulativa.

## Casos de uso

- Reproducción del benchmark OpenMHC: cargar el checkpoint con `SegRNNForecaster.from_release` y ejecutar `openmhc.evaluate_forecasting` para obtener las métricas de referencia del track 3 y validar pipelines de evaluación propios contra una línea base publicada.
- Comparación metodológica de forecasters: usar SegRNN como baseline recurrente frente a modelos transformer, SSM o híbridos sobre el mismo split y las mismas 19 señales, controlando el preprocesado con el `standard_scaler_stats.json` incluido.
- Investigación en forecasting de wearables: estudiar el comportamiento de una RNN segmentada en horizontes de 24 horas con resolución horaria, un régimen donde los transformers suelen encarecer el coste de inferencia.
- Desarrollo de herramientas de análisis de señales fisiológicas: emplear el modelo como componente de un pipeline de investigación que genere predicciones horarias a partir de datos de sensores, siempre fuera de cualquier uso clínico.
- Validación de infraestructura de evaluación: probar el harness de OpenMHC, la carga de bundles desde HuggingFace y la serialización PyPOTS en entornos de CI antes de incorporar modelos propios.
- Docencia y formación: ilustrar las diferencias entre decodificación autoregresiva clásica y decodificación paralela por segmentos con un checkpoint pequeño y ejecutable en hardware modesto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Por la naturaleza de SegRNN (RNN con estado oculto de dimensión moderada) y el tamaño del repositorio (0.0 GB según HuggingFace), es esperable que quepa en GPU de consumo, pero no se confirma con datos del autor.
- GPU recomendadas: no disponible. No hay indicaciones del autor sobre A100, H100 o RTX 4090.
- Compatibilidad con GPU de consumo: probable por el tamaño del bundle, sin confirmación oficial.
- Opciones de despliegue: la vía documentada es la librería `openmhc` con el extra `pypots` (`pip install "openmhc[pypots]"`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Contexto / horizonte | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| OpenMHC SegRNN (este) | SegRNN (RNN segmentada) | no disponible | Horizonte de 24 h, 19 canales horarios | BigScience OpenRAIL-M | HuggingFace, librería `openmhc` |
| SegRNN original (lss-1138) | SegRNN (RNN segmentada) | no disponible | Configurable por dataset | no disponible en la información proporcionada | GitHub |
| Alternativas del benchmark OpenMHC | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre otros checkpoints del benchmark OpenMHC ni de resultados comparativos publicados que permitan una comparación cuantitativa.

## Limitaciones y advertencias

- Uso previsto exclusivamente de investigación, comparación metodológica y reproducción del benchmark. Queda fuera de alcance el diagnóstico, cribado, pronóstico, predicción prospectiva de riesgo, soporte a decisiones clínicas o cualquier otra decisión médica.
- Las etiquetas de condición médica de OpenMHC son autoinformadas y carecen de fechas de diagnóstico; el rendimiento en el benchmark no establece utilidad clínica.
- Cualquier afirmación diagnóstica, pronóstica o de cribado requiere validación independiente con desenlaces clínicamente adjudicados y alineados temporalmente en la población objetivo.
- La licencia BigScience OpenRAIL-M impone restricciones de uso del Anexo A, que entre otras cosas prohíben proporcionar consejo médico e interpretación de resultados médicos.
- Riesgo de alucinación: no aplica en el sentido de modelos de lenguaje, pero existe riesgo de predicciones erróneas o poco calibradas fuera de la distribución de entrenamiento.
- No se documentan sesgos conocidos ni composición demográfica del split de entrenamiento en la información disponible.
- No se especifican limitaciones de contexto ni de idioma porque el modelo no opera sobre texto.
- El checkpoint depende de la implementación de PyPOTS y de la librería `openmhc`; cambios de versión pueden afectar a la reproducibilidad.
- El repositorio registra 0 descargas y 0 likes, por lo que no hay evidencia de uso comunitario ni de validación externa.

## Enlaces

- HuggingFace: https://huggingface.co/MyHeartCounts/openmhc-segrnn-fc
- PyPOTS toolkit (implementación): https://github.com/WenjieDu/PyPOTS
- PyPOTS documentación: https://docs.pypots.com
- SegRNN implementación original: https://github.com/lss-1138/SegRNN
- Paper SegRNN (Lin et al., IEEE IoT-J 2025): referenciado en el repositorio de SegRNN, https://github.com/lss-1138/SegRNN
