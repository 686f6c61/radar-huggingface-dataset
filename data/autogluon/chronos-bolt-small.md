# autogluon/chronos-bolt-small

## Resumen

Chronos-Bolt (Small) es un modelo preentrenado de previsión de series temporales desarrollado por el equipo de AutoGluon (Amazon), diseñado para realizar *forecasting* zero-shot sin necesidad de entrenamiento específico sobre el conjunto de datos objetivo. Está construido sobre la arquitectura encoder-decoder de T5 y, en concreto, sobre la variante `t5-efficient-small`. Con 47.718.016 parámetros (aproximadamente 48M), se sitúa como la tercera talla de la familia Chronos-Bolt, por detrás de las versiones tiny (9M), mini (21M) y por delante de base (205M).

El modelo resuelve el problema de generar predicciones probabilísticas multi-paso sobre series temporales históricas. Para ello divide el contexto histórico en parches de múltiples observaciones que introduce en el encoder; el decoder genera directamente los cuantiles de la previsión futura, un enfoque conocido como *direct multi-step forecasting*. Frente a los modelos Chronos originales de igual tamaño, Chronos-Bolt es hasta 250 veces más rápido y 20 veces más eficiente en memoria, además de más preciso.

Su relevancia actual radica en que combina un tamaño muy reducido (el repositorio pesa 0,2 GB) con un rendimiento que, en modo zero-shot, supera a modelos estadísticos clásicos y a redes profundas entrenadas específicamente sobre los conjuntos de evaluación, así como a otros modelos fundacionales de series temporales. Está publicado bajo licencia Apache 2.0 y disponible en Amazon SageMaker JumpStart.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder basado en T5 (t5-efficient-small) |
| Parametros totales | 47.718.016 (aproximadamente 48M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (el pipeline divide el historico en parches de multiples observaciones; el ejemplo de la model card usa 512 observaciones de contexto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de series temporales, no procesa lenguaje natural) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Pipeline | time-series-forecasting |
| Tamano del repositorio | 0,2 GB |
| Fecha de creacion | 2024-11-13 |
| Ultima actualizacion | 2025-10-30 |
| Descargas | 5.829.158 |
| Likes | 77 |

## Arquitectura y entrenamiento

Chronos-Bolt emplea una arquitectura transformer encoder-decoder heredada de T5, en su variante `t5-efficient-small`, con 48M de parámetros. El funcionamiento consiste en trocear el contexto histórico de la serie temporal en parches que agrupan varias observaciones consecutivas; estos parches se proyectan y se introducen en el encoder. El decoder utiliza esas representaciones para generar de forma directa las predicciones de cuantiles a lo largo de múltiples pasos futuros, sin recurrir a generación autorregresiva paso a paso. Este diseño de *direct multi-step forecasting* es el responsable de la mejora de velocidad frente a Chronos original.

El modelo se ha entrenado sobre cerca de 100.000 millones de observaciones de series temporales, lo que le permite operar en régimen zero-shot sobre dominios que no ha visto durante el entrenamiento. La familia Chronos-Bolt replica los cuatro tamaños de la generación anterior (tiny, mini, small y base), apoyándose en los checkpoints `t5-efficient` correspondientes. No se detalla en la información disponible la composición exacta del dataset de entrenamiento ni si se aplicaron técnicas de ajuste como RLHF o DPO, que en cualquier caso no son habituales en este tipo de modelos.

## Capacidades

- Previsión de series temporales univariantes en modo zero-shot, sin entrenamiento específico por conjunto de datos.
- Generación de previsiones probabilísticas mediante cuantiles, lo que permite obtener intervalos de predicción además de la predicción puntual.
- *Direct multi-step forecasting*: genera simultáneamente varios pasos futuros en una sola pasada del decoder.
- *Forecasting* con covariables (features exógenas), según se indica en la documentación de AutoGluon.
- Soporte de ajuste fino (*fine-tuning*) sobre datos propios, además del uso zero-shot.
- Integración con el ecosistema AutoGluon TimeSeries (`TimeSeriesPredictor`).
- Despliegue como endpoint en Amazon SageMaker JumpStart, tanto en instancias CPU como GPU.
- No dispone de capacidades de lenguaje natural, tool calling, agentes ni visión, al ser un modelo especializado en series temporales.

## Casos de uso

- Previsión de demanda minorista: el modelo permite estimar ventas futuras por producto o tienda sin entrenamiento previo, útil cuando se dispone de históricos cortos o irregulares; el enfoque zero-shot evita el coste de ajustar un modelo por SKU.
- Planificación de capacidad en infraestructura TI: predecir carga de CPU, tráfico de red o uso de almacenamiento a partir de series históricas, apoyándose en la generación de cuantiles para dimensionar con márgenes de seguridad.
- Previsión de consumo energético: estimar demanda eléctrica horaria o diaria con covariables como temperatura o calendario, gracias al soporte de *forecasting* con covariables.
- Gestión financiera y presupuestaria: proyectar flujos de caja, ingresos o métricas de negocio a corto plazo, con intervalos de predicción que ayuden a evaluar el riesgo.
- Monitorización de sensores industriales: anticipar valores de variables de proceso (presión, caudal, vibración) para detección temprana de anomalías operativas.
- Predicción de series en sanidad o epidemiología: proyectar conteos de admisiones, casos o demanda de recursos a partir de series temporales históricas.
- Rellenado de huecos y series incompletas en pipelines de datos, aprovechando la capacidad del modelo de modelar patrones temporales complejos en modo zero-shot.
- Integración como componente en AutoGluon para comparar automáticamente Chronos-Bolt frente a otros predictores dentro de un mismo flujo de AutoML.

## Benchmarks y rendimiento

La model card indica que Chronos-Bolt supera en precisión a los modelos Chronos originales y a otros modelos estadísticos, de *deep learning* y fundacionales sobre un conjunto de 27 datasets, evaluado con las métricas WQL (*Weighted Quantile Loss*) y MASE (*Mean Absolute Scaled Error*). Asimismo, se afirma que Chronos-Bolt (Base) supera a Chronos original (Large) en precisión siendo más de 600 veces más rápido, y que los modelos Bolt son hasta 250 veces más rápidos y 20 veces más eficientes en memoria que Chronos de igual tamaño (medido sobre 1.024 series, contexto de 512 observaciones y horizonte de 64 pasos).

Sin embargo, la información proporcionada no incluye los valores numéricos concretos de WQL ni MASE por modelo, sino únicamente gráficos referenciados en la model card. Por tanto, no se pueden presentar cifras exactas de benchmarks en esta ficha.

| Metrica | Resultado |
|---|---|
| WQL (27 datasets) | valor no disponible (solo se indica que supera a Chronos original y a modelos estadisticos/DL) |
| MASE (27 datasets) | valor no disponible (solo se indica mejora cualitativa) |
| Aceleracion frente a Chronos | hasta 250x mas rapido |
| Eficiencia de memoria frente a Chronos | hasta 20x mas eficiente |

## Requisitos de hardware

- Al tratarse de un modelo de 48M de parámetros, el peso en memoria es muy reducido: en precisión fp32 rondaría los 190 MB y en fp16 aproximadamente 95 MB, por lo que la VRAM necesaria para inferencia es mínima.
- Cabe holgadamente en cualquier GPU de consumo (RTX 3060, RTX 4090, etc.) e incluso en GPUs integradas o en CPU.
- Puede ejecutarse en instancias CPU (la model card muestra ejemplo de despliegue en `ml.c5.2xlarge`) y en GPU.
- El despliegue en SageMaker JumpStart permite tanto CPU como GPU según el caso de uso.
- Opciones de despliegue documentadas: AutoGluon (`TimeSeriesPredictor`), Amazon SageMaker JumpStart y el repositorio `amazon-science/chronos-forecasting`. No se confirma soporte explícito de vLLM, llama.cpp, Ollama o TGI en la información disponible.
- No se proporcionan cifras concretas de latencia o throughput más allá de las comparativas relativas frente a Chronos original (hasta 250x más rápido). No se dispone de datos absolutos de latencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| chronos-bolt-small | 48M | no disponible | zero-shot; supera a Chronos original y a modelos estadisticos/DL segun model card | apache-2.0 | HuggingFace, SageMaker JumpStart |
| chronos-bolt-tiny | 9M | no disponible | menor capacidad, mas rapido | apache-2.0 | HuggingFace |
| chronos-bolt-mini | 21M | no disponible | intermedio | apache-2.0 | HuggingFace |
| chronos-bolt-base | 205M | no disponible | el mas preciso de la familia; segun la model card supera a Chronos original (Large) siendo mas de 600x mas rapido | apache-2.0 | HuggingFace |
| Chronos original (Small) | ~48M | no disponible | version previa, mas lenta y menos precisa que Bolt | apache-2.0 | HuggingFace |

No se dispone de datos numéricos comparativos de otros modelos fundacionales de series temporales (como Moirai, TimesFM o Lag-Llama) en la información proporcionada.

## Limitaciones y advertencias

- Modelo especializado exclusivamente en series temporales; no procesa ni genera lenguaje natural, por lo que no es apto para tareas de texto, código o visión.
- Al ser un modelo entrenado sobre datos históricos, puede arrastrar sesgos presentes en las series de entrenamiento (por ejemplo, patrones estacionales sobrerrepresentados o dominios concretos).
- Riesgo de predicciones poco fiables en series con regímenes anómalos, cambios estructurales o eventos nunca observados en entrenamiento.
- El rendimiento zero-shot puede degradarse en dominios muy alejados de los datos de preentrenamiento; se recomienda validar con datos propios antes de producción.
- No se especifica la longitud máxima de contexto soportada, lo que limita planificar escenarios con históricos muy largos sin pruebas empíricas.
- No se detalla la composición del dataset de entrenamiento, lo que dificulta evaluar la cobertura de dominios y posibles sesgos.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones de los modelos base `t5-efficient` de Google sobre los que se apoya.
- En producción, la calidad de la previsión depende fuertemente del preprocesado de la serie (tratamiento de huecos, outliers, frecuencia) y del horizonte solicitado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/autogluon/chronos-bolt-small
- Chronos-Bolt tiny: https://huggingface.co/autogluon/chronos-bolt-tiny
- Chronos-Bolt mini: https://huggingface.co/autogluon/chronos-bolt-mini
- Chronos-Bolt base: https://huggingface.co/autogluon/chronos-bolt-base
- Paper de arquitectura T5: https://arxiv.org/abs/1910.10683
- Paper de Chronos: https://arxiv.org/abs/2403.07815
- Repositorio Chronos Forecasting: https://github.com/amazon-science/chronos-forecasting
- Tutorial de AutoGluon TimeSeries con Chronos: https://auto.gluon.ai/stable/tutorials/timeseries/forecasting-chronos.html
- Notebook de despliegue en SageMaker: https://github.com/amazon-science/chronos-forecasting/blob/main/notebooks/deploy-chronos-to-amazon-sagemaker.ipynb
- Model checkpoints base: https://huggingface.co/google/t5-efficient-small
- Documentacion de metricas de AutoGluon (WQL, MASE): https://auto.gluon.ai/stable/tutorials/timeseries/forecasting-metrics.html
