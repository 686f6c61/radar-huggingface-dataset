# MyHeartCounts/openmhc-toto-fc

## Resumen

OpenMHC Forecasting — Toto (`MyHeartCounts/openmhc-toto-fc`) es un checkpoint de referencia para la tarea de forecasting (track 3) del benchmark de salud con wearables MyHeartCounts / OpenMHC. No es un modelo de lenguaje, sino un modelo de series temporales especializado en predicción probabilística de señales fisiológicas procedentes de dispositivos portátiles. Lo publica el equipo MyHeartCounts y se distribuye a través de Hugging Face con la librería `openmhc`.

Técnicamente es un fine-tuning completo del modelo base `Datadog/Toto-Open-Base-1.0`, un transformer decoder-only con cabeza de salida probabilística desarrollado por Datadog para observabilidad de series temporales. La tarea concreta que resuelve este checkpoint es la predicción a 24 horas vista sobre 19 canales de sensores con resolución horaria, entrenado sobre el split de entrenamiento del benchmark MHC.

Su relevancia es metodológica: sirve como referencia reproducible para comparar enfoques de forecasting en datos de wearables dentro de un benchmark abierto. El propio autor delimita explícitamente su uso a investigación y reproducción del benchmark, excluyendo cualquier aplicación clínica o diagnóstica.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Toto, Time-series Optimized Transformer for Observability) con cabeza de salida probabilística |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (checkpoint en PyTorch Lightning, sin variantes GGUF/AWQ documentadas) |
| Idiomas soportados | no aplica (modelo de series temporales, sin entrada de texto) |
| Licencia | BigScience OpenRAIL-M (con restricciones de uso del Attachment A); el modelo base es Apache-2.0 |
| Formato de pesos | PyTorch Lightning checkpoint (`model.ckpt`) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura Toto de Datadog: un transformer decoder-only diseñado específicamente para series temporales, con una cabeza de salida probabilística que produce distribuciones de predicción en lugar de valores puntuales. Toto se presenta en el paper de Cohen et al. (2024) como un modelo fundacional orientado a observabilidad, con entrenamiento sobre grandes volúmenes de series temporales diversas.

Este checkpoint concreto se obtiene mediante fine-tuning completo (no LoRA ni adaptadores) del base `Datadog/Toto-Open-Base-1.0` sobre el split de entrenamiento del benchmark MyHeartCounts. La tarea de entrenamiento es forecasting a 24 horas con 19 canales de sensores y resolución horaria. El repositorio incluye un `openmhc_manifest.json` con la procedencia del entrenamiento (run, modelo base y detalles del fine-tuning) y metadatos de arquitectura. No se documentan en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron etapas de RLHF o DPO (no aplicables en este dominio de forecasting).

## Capacidades

- Predicción probabilística de series temporales multivariantes: 19 canales de sensores de wearables con resolución horaria.
- Forecasting a 24 horas vista sobre señales fisiológicas y de actividad registradas por dispositivos portátiles.
- Salida con distribución probabilística (no solo punto estimado), lo que permite intervalos de predicción.
- Integración con el harness de evaluación `openmhc` mediante `TotoForecaster` y `openmhc.evaluate_forecasting`.
- Carga directa desde Hugging Face con el esquema `hf://MyHeartCounts/openmhc-toto-fc@v1.0`.
- No soporta tool calling, agentes, razonamiento multi-step, visión, audio ni capacidades multilingües: es un modelo puramente numérico-secuencial.

## Casos de uso

- Reproducción del benchmark OpenMHC: cargar el checkpoint con `TotoForecaster.from_release` y ejecutar `evaluate_forecasting` para obtener resultados comparables con los publicados en el track 3.
- Comparación metodológica de forecasters: usar este checkpoint como baseline Toto frente a otros modelos de series temporales evaluados en el mismo split y con las mismas métricas del benchmark.
- Investigación en forecasting de wearables: estudiar el comportamiento de un transformer decoder-only con cabeza probabilística sobre 19 canales fisiológicos a resolución horaria.
- Desarrollo de pipelines de evaluación: integrar el bundle en el harness mediante `model.release_dir=hf://MyHeartCounts/openmhc-toto-fc@v1.0` para automatizar experimentos reproducibles.
- Análisis de incertidumbre en predicción de señales: aprovechar la salida probabilística para estudiar calibración de intervalos en horizontes de 24 horas.
- Punto de partida para fine-tuning propio: al ser un fine-tuning completo del base Apache-2.0, sirve como referencia de cómo adaptar Toto a un dominio concreto de sensores, siempre respetando las restricciones OpenRAIL-M del checkpoint derivado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; el repositorio ocupa 0,6 GB, lo que sugiere un modelo de tamaño moderado que probablemente cabe en GPUs de consumo, pero no se confirma el número de parámetros.
- GPU recomendadas: no disponibles en la información proporcionada.
- Compatibilidad con GPU de consumo: no confirmada explícitamente; el tamaño del repo (0,6 GB) es compatible con GPUs consumer típicas (RTX 3060 en adelante), pero es una estimación, no un dato del autor.
- Opciones de despliegue: el checkpoint es un fichero PyTorch Lightning (`model.ckpt`) y se carga mediante la librería `openmhc` (`pip install "openmhc[toto]"`) o el harness de evaluación. No se documentan soportes para vLLM, llama.cpp, Ollama ni TGI, que en cualquier caso no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Tarea | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `MyHeartCounts/openmhc-toto-fc` (este) | Toto fine-tuned | Forecasting 24 h, 19 canales, resolución horaria | no disponible | OpenRAIL-M | Hugging Face, librería `openmhc` |
| `Datadog/Toto-Open-Base-1.0` | Toto base | Forecasting general de series temporales | no disponible | Apache-2.0 | Hugging Face, repo oficial DataDog/toto |
| Otros forecasters del benchmark OpenMHC | no disponible | Forecasting 24 h en MHC | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Uso previsto exclusivamente para investigación, comparación metodológica y reproducción del benchmark OpenMHC.
- Fuera de alcance explícito: diagnóstico, cribado, pronóstico, predicción prospectiva de riesgo, soporte a decisiones clínicas o cualquier otra decisión médica.
- Las etiquetas de condiciones médicas del benchmark OpenMHC son autoinformadas y carecen de fechas de diagnóstico; el rendimiento en el benchmark no establece utilidad clínica.
- Cualquier afirmación diagnóstica, pronóstica o de cribado requeriría validación independiente con resultados clínicamente adjudicados y alineados temporalmente en la población objetivo.
- La licencia OpenRAIL-M incluye restricciones de uso en su Attachment A que prohíben, entre otras cosas, proporcionar consejo médico e interpretación de resultados médicos.
- El modelo base `Datadog/Toto-Open-Base-1.0` está bajo Apache-2.0 y su licencia y avisos siguen aplicándose al modelo base.
- No se documentan sesgos específicos, tasas de alucinación (concepto poco aplicable a forecasting numérico) ni limitaciones de idioma (no procesa texto).
- No se documentan limitaciones de contexto ni de generalización fuera de la población y canales del benchmark MHC.

## Enlaces

- Hugging Face: https://huggingface.co/MyHeartCounts/openmhc-toto-fc
- Modelo base: https://huggingface.co/Datadog/Toto-Open-Base-1.0
- Implementación oficial de Toto: https://github.com/DataDog/toto
- Paper de Toto (Cohen et al., 2024): https://arxiv.org/abs/2407.07874
