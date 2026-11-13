# cassiohfs/fooddemand-ai

## Resumen

FoodDemand AI es un modelo de previsión de demanda para el sector retail publicado en Hugging Face por el usuario cassiohfs. No se trata de un modelo de lenguaje ni de una red neuronal profunda, sino de un artefacto de scikit-learn serializado con joblib que implementa un pipeline de regresión tabular orientado a la predicción de ventas por tienda y familia de producto. El repositorio tiene un tamaño declarado de 0.0 GB y no registra descargas ni interacciones en el momento de la consulta.

El modelo se apoya en el dataset público Store Sales de Kaggle (cadena de supermercados ecuatoriana Corporación Favorita) y combina variables de calendario, promociones, metadatos de tienda, retardos de demanda, precio del petróleo, transacciones y un indicador de festivo nacional. Su propósito declarado es educativo y de portafolio: demostrar un flujo completo de forecasting con particiones cronológicas y desplazamiento de variables objetivo antes de su uso como features.

La relevancia del artefacto es limitada pero ilustrativa: sirve como referencia de buenas prácticas en validación temporal (evitar fuga de información) y como punto de partida reproducible para experimentos de previsión de demanda. El autor advierte explícitamente de que los resultados no deben presentarse como rendimiento real de Kaggle y de que el modelo no está pensado para planificación de inventario en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Pipeline de regresión tabular sobre scikit-learn (algoritmo concreto no especificado) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo tabular, no secuencial autoregresivo) |
| Tipos de cuantización | no aplica; serialización con joblib |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | no disponible |
| Formato de pesos | joblib (artefacto scikit-learn) |

## Arquitectura y entrenamiento

El modelo es un pipeline de scikit-learn para regresión tabular con objetivos de series temporales. La model card no especifica el estimador concreto (podría ser Gradient Boosting, Random Forest, HistGradientBoosting u otro), por lo que este dato queda como no disponible. La entrada combina variables de calendario, recuento de promociones, metadatos de tienda, retardos de la demanda objetivo, retardos del precio del petróleo, retardos de transacciones y un indicador de festivo nacional. El pipeline admite la ausencia de tablas auxiliares e imputa los valores faltantes.

La evaluación se realiza con particiones cronológicas y desplazamiento previo de las features derivadas del objetivo para evitar fuga de información. No se documenta el volumen de tokens ni de muestras de entrenamiento, ni la existencia de fases de ajuste fino, RLHF o DPO, que no aplican a este tipo de modelo. La innovación técnica destacable es la disciplina metodológica: separación temporal estricta y tratamiento explícito de retardos, algo que en forecasting tabular suele ser fuente de errores graves.

## Capacidades

- Predicción de demanda de ventas a nivel de tienda y familia de producto sobre datos tabulares.
- Procesamiento de variables de calendario, promociones y festivos nacionales.
- Uso de retardos de la variable objetivo y de variables exógenas (precio del petróleo, transacciones).
- Imputación automática de tablas auxiliares ausentes dentro del pipeline.
- Evaluación con métricas de forecasting: RMSLE, MAE y WAPE.
- No soporta tool calling, function calling ni razonamiento multi-paso.
- No tiene capacidades multilingües, de visión, audio ni modo de pensamiento.
- No es un modelo generativo: no produce texto ni código.

## Casos de uso

- Prototipado educativo de forecasting: sirve para que estudiantes y desarrolladores reproduzcan un flujo completo de previsión de demanda con particiones cronológicas correctas y métricas estándar del sector.
- Benchmark interno de pipelines tabulares: permite comparar un baseline estacional naive (RMSLE 0.5316) frente a un modelo ML (RMSLE 0.3802) sobre el mismo conjunto de datos y validar la ganancia de usar features exógenas.
- Previsión de ventas por tienda y familia en cadenas de alimentación: el modelo incorpora promociones, calendario y transacciones, variables directamente trasladables a un contexto retail real tras reentrenamiento con datos propios.
- Análisis de sensibilidad a promociones: al incluir el recuento de promociones como feature, permite estudiar cómo varía la demanda prevista al modificar la intensidad promocional.
- Docencia en validación temporal: el énfasis del autor en el desplazamiento de features y en la partición cronológica lo convierte en un ejemplo útil para explicar la fuga de información en series temporales.
- Base para un sistema de planificación con validación adicional: podría integrarse como componente inicial en un pipeline de inventory planning, siempre que se añadan monitorización, restricciones de negocio y previsión recursiva de los retardos futuros.

## Benchmarks y rendimiento

Los únicos resultados disponibles son los de la model card, generados por el pipeline de entrenamiento del repositorio con particiones cronológicas. El autor advierte que son demostrativos y no deben publicitarse como rendimiento real de Kaggle.

| Métrica | Baseline estacional naive | Modelo ML |
|---|---:|---:|
| RMSLE | 0.5316 | 0.3802 |
| MAE | 87.1732 | 60.3452 |
| WAPE | 0.1827 | 0.1265 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible, ni aplican a este tipo de modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; el modelo se ejecuta en CPU. El tamaño del repositorio es de 0.0 GB, por lo que el artefacto joblib es muy ligero.
- GPU recomendadas: no son necesarias. Cualquier CPU moderna puede ejecutar la inferencia; una GPU solo tendría sentido para reentrenamiento a gran escala.
- Compatibilidad con GPU de consumo: sí, aunque innecesaria; el cuello de botella es la preparación de features, no el cómputo del estimador.
- Opciones de despliegue: carga directa con joblib y scikit-learn en Python; integración en servicios FastAPI, Flask o batch jobs; no es compatible con vLLM, llama.cpp, Ollama ni TGI, que están orientados a modelos de lenguaje.
- Latencia y throughput estimados: no disponibles en la información proporcionada; dependerán del estimador concreto y del volumen de filas a predecir.

## Comparativa con modelos similares

| Modelo | Tipo | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| FoodDemand AI (cassiohfs) | Regresión tabular scikit-learn | no aplica | RMSLE 0.3802 en split cronológico propio | no disponible | Hugging Face, 0 descargas |
| Baseline estacional naive | Heurística de series temporales | no aplica | RMSLE 0.5316 en el mismo split | no aplica | Implementación trivial |
| Prophet (Meta) | Modelo aditivo de series temporales | no aplica | no disponible en esta ficha | MIT | Open source, ampliamente adoptado |
| LightGBM / XGBoost | Gradient boosting tabular | no aplica | no disponible en esta ficha | MIT / Apache 2.0 | Open source, estándar industrial |

La comparación con Prophet y con gradient boosting genérico es pertinente por categoría de tarea (forecasting tabular), pero no se dispone de resultados de esos modelos sobre el mismo split para establecer una comparación numérica rigurosa.

## Limitaciones y advertencias

- El backtesting es rolling one-step: las filas de validación pueden usar observaciones reales anteriores, lo que sobreestima el rendimiento frente a un escenario de previsión multi-paso real.
- Una previsión recursiva de horizonte fijo en producción requeriría prever también los valores futuros de los retardos, algo que el artefacto no resuelve por sí solo.
- El dataset Store Sales es de una cadena de supermercados ecuatoriana y no representa datos de iFood ni de otros mercados; la transferibilidad es limitada.
- Shocks externos, roturas de stock y familias de producto no vistas pueden degradar la precisión de forma significativa.
- El autor califica el artefacto como demostración y exige monitorización antes de cualquier uso en producción.
- Licencia no disponible: no se puede confirmar el uso comercial sin contactar con el autor.
- No se documentan sesgos específicos, pero al ser un modelo tabular sobre datos históricos de retail puede heredar sesgos de surtido y de cobertura geográfica del dataset original.
- Riesgo de alucinación no aplica (no es generativo); el riesgo equivalente es la extrapolación incorrecta fuera del dominio de entrenamiento.
- No hay información sobre el estimador concreto, hiperparámetros ni semilla, lo que dificulta la reproducibilidad exacta.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/cassiohfs/fooddemand-ai
- Dataset Store Sales de Kaggle (referenciado en la model card): https://www.kaggle.com/competitions/store-sales-time-series-forecasting
- Documentación de scikit-learn: https://scikit-learn.org/stable/
- Documentación de joblib: https://joblib.readthedocs.io/
