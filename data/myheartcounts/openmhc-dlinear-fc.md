# MyHeartCounts/openmhc-dlinear-fc

## Resumen

OpenMHC Forecasting — DLinear es un checkpoint de referencia publicado por el proyecto MyHeartCounts / OpenMHC para la tarea de predicción de series temporales (track 3) dentro de su benchmark de salud basado en dispositivos wearables. No es un modelo de lenguaje: se trata de una implementación de DLinear, un predictor lineal ligero que descompone la serie temporal en componentes de tendencia y estacionalidad y aplica una proyección lineal independiente a cada una. El checkpoint se ha entrenado desde cero sobre el split de entrenamiento de MHC usando la implementación de PyPOTS.

El modelo resuelve una tarea muy concreta: pronóstico a 24 horas vista sobre 19 canales de sensores con resolución horaria. Su interés es fundamentalmente metodológico: sirve como línea base reproducible para comparar arquitecturas más complejas (transformers, modelos de estado espacio, etc.) dentro del benchmark OpenMHC, y para reproducir resultados de forma controlada. No está pensado para uso clínico ni para despliegue en producción sanitaria.

La relevancia actual del checkpoint deriva de su papel como referencia abierta y versionada (v1.1) en un benchmark de wearables, un área donde la reproducibilidad y la comparación justa entre arquitecturas es especialmente difícil por la heterogeneidad de los datos y los protocolos de evaluación. Su licencia OpenRAIL-M impone restricciones explícitas de uso, incluida la prohibición de ofrecer consejo médico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DLinear (descomposición trend/seasonal + proyección lineal por componente) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (ventana de entrada no especificada en la model card) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de series temporales, no de texto) |
| Licencia | BigScience OpenRAIL-M |
| Formato de pesos | Checkpoint PyPOTS (`model.pypots`) + `standard_scaler_stats.json` + `training_config.json` |

## Arquitectura y entrenamiento

DLinear es una arquitectura lineal propuesta por Zeng et al. (AAAI 2023) en el trabajo *Are Transformers Effective for Time Series Forecasting?*. El modelo descompone la serie de entrada en una componente de tendencia (media móvil) y una componente estacional (residuo), y aplica a cada una una capa lineal independiente que proyecta directamente hacia el horizonte de predicción. No emplea mecanismos de atención ni capas recurrentes, lo que reduce drásticamente el coste computacional frente a alternativas transformer.

El checkpoint se ha entrenado desde cero sobre el split de entrenamiento de MHC utilizando la implementación de PyPOTS. La tarea es pronóstico a 24 horas sobre 19 canales de sensores con resolución horaria. El bundle incluye las estadísticas del escalador estándar (`standard_scaler_stats.json`) y la configuración de entrenamiento (`training_config.json`), además del manifiesto `openmhc_manifest.json` con la procedencia (run de entrenamiento, modelo base y detalles de ajuste). No se especifican en la model card el número de tokens, la composición exacta del dataset ni si se aplicaron técnicas de RLHF/DPO (no aplicables en este dominio).

## Capacidades

- Pronóstico de series temporales multivariantes a 24 horas vista sobre 19 canales de sensores wearables con resolución horaria.
- Descomposición explícita de tendencia y estacionalidad, lo que facilita la interpretabilidad de las predicciones.
- Evaluación integrada mediante el harness de OpenMHC (`openmhc.evaluate_forecasting`).
- Carga directa desde Hugging Face mediante `DLinearForecaster.from_release("hf://MyHeartCounts/openmhc-dlinear-fc@v1.1")`.
- Compatibilidad con la implementación de PyPOTS para entrenamiento y inferencia.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües (no es un modelo de lenguaje).

## Casos de uso

- Línea base en investigación de pronóstico de wearables: sirve como referencia reproducible para comparar arquitecturas más complejas (transformers, SSM, modelos híbridos) dentro del benchmark OpenMHC, permitiendo aislar la ganancia real atribuible a la complejidad del modelo.
- Reproducción de resultados del benchmark: el checkpoint versionado (v1.1) y el manifiesto de procedencia permiten reproducir exactamente las métricas publicadas del track 3 de OpenMHC.
- Desarrollo y depuración del harness de evaluación: al ser un modelo ligero y determinista, es útil para validar pipelines de evaluación, escaladores y protocolos de split antes de probar modelos más costosos.
- Experimentos de ablación sobre preprocesado: permite estudiar el impacto de la normalización (mediante `standard_scaler_stats.json`) y de la ventana de entrada en el error de pronóstico sin incurrir en costes de entrenamiento elevados.
- Docencia y formación en series temporales: su simplicidad (dos proyecciones lineales) lo convierte en un ejemplo didáctico para explicar descomposición trend/seasonal y evaluación de forecasting.
- Pruebas de integración en pipelines de datos de wearables: útil para validar el flujo completo desde la ingesta de 19 canales horarios hasta la predicción a 24 horas en entornos de desarrollo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; por la naturaleza lineal de DLinear, el consumo es muy bajo (del orden de megabytes para los pesos), aunque no se especifica el tamaño exacto del checkpoint.
- GPU recomendadas: no disponible; un modelo lineal de este tipo puede ejecutarse en CPU sin problema.
- Cabe en cualquier GPU consumer, e incluso en CPU; no requiere aceleración específica.
- Opciones de despliegue: librería `openmhc` con extra `pypots` (`pip install "openmhc[pypots]"`), o directamente mediante PyPOTS.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| OpenMHC DLinear (este) | DLinear | no disponible | no disponible | Forecasting 24h, 19 canales | OpenRAIL-M | Hugging Face |
| Alternativas del benchmark OpenMHC | no disponible | no disponible | no disponible | Forecasting wearables | no disponible | no disponible |
| Otros forecasters de PyPOTS | no disponible | no disponible | no disponible | Series temporales | no disponible | no disponible |

No se dispone de información sobre otros checkpoints del benchmark OpenMHC ni de modelos comparables con datos verificables en la información proporcionada.

## Limitaciones y advertencias

- Modelo puramente lineal: no captura dependencias no lineales complejas ni interacciones de largo alcance entre canales, lo que puede limitar su precisión frente a arquitecturas más expresivas.
- Uso previsto exclusivamente de investigación, comparación metodológica y reproducción del benchmark; queda fuera de alcance el diagnóstico, cribado, pronóstico, predicción prospectiva de riesgo o apoyo a decisiones clínicas.
- Las etiquetas de condición médica de OpenMHC son autoinformadas y carecen de fechas de diagnóstico; el rendimiento en el benchmark no establece utilidad clínica.
- La licencia OpenRAIL-M (Attachment A) prohíbe, entre otras cosas, ofrecer consejo médico e interpretación de resultados médicos.
- No se especifican sesgos conocidos ni tasas de alucinación (no aplica en el sentido habitual de modelos generativos), pero la representatividad de la población de entrenamiento de MHC no está documentada en la model card.
- No hay información sobre la ventana de entrada, el número de parámetros ni los datos exactos de entrenamiento, lo que dificulta la comparación cuantitativa con otras arquitecturas.
- El formato de checkpoint es específico de PyPOTS (`model.pypots`), no safetensors ni GGUF; requiere la librería correspondiente para su carga.

## Enlaces

- [Hugging Face: MyHeartCounts/openmhc-dlinear-fc](https://huggingface.co/MyHeartCounts/openmhc-dlinear-fc)
- [PyPOTS toolkit (implementación)](https://github.com/WenjieDu/PyPOTS)
- [PyPOTS documentation](https://docs.pypots.com)
- [Paper: Are Transformers Effective for Time Series Forecasting? (Zeng et al., AAAI 2023)](https://github.com/cure-lab/LTSF-Linear)
- [Licencia BigScience OpenRAIL-M](https://huggingface.co/MyHeartCounts/openmhc-dlinear-fc/blob/main/LICENSE)
