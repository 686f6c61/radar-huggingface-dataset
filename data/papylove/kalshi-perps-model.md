# papylove/kalshi-perps-model

## Resumen

El modelo `papylove/kalshi-perps-model` es un clasificador tabular desarrollado por el usuario papylove, diseñado para predecir movimientos de precios en futuros perpetuos de criptomonedas negociados en la plataforma Kalshi, un mercado de predicción regulado en Estados Unidos. El modelo se distribuye con licencia MIT y está pensado para su uso en estrategias de trading algorítmico, ofreciendo una señal de clasificación (probablemente binaria: subida o bajada) a partir de características numéricas de mercado.

Aunque la ficha de HuggingFace no detalla la arquitectura interna, el uso de la librería scikit-learn y el formato de pesos joblib indican que se trata de un modelo clásico de aprendizaje automático (posiblemente un ensemble como Random Forest o Gradient Boosting), no de un transformer. El repositorio tiene un tamaño de 0.0 GB, lo que sugiere que el modelo es muy ligero y puede ejecutarse en CPU sin necesidad de GPU. El acceso es restringido (gated), por lo que los usuarios deben aceptar condiciones en HuggingFace antes de descargarlo.

La relevancia de este modelo radica en su aplicación directa a un nicho específico: la predicción de precios en mercados de predicción de criptoactivos, un área con creciente interés entre traders minoristas y cuantitativos. Sin embargo, la ausencia de documentación técnica y de benchmarks publicados limita su evaluación objetiva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de clasificación tabular basado en scikit-learn) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo tabular, no secuencial) |
| Tipos de cuantizacion | no aplica (pesos en formato joblib, sin cuantización) |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | joblib (serialización de scikit-learn) |

## Arquitectura y entrenamiento

No se ha publicado información detallada sobre la arquitectura interna del modelo. Dado que utiliza scikit-learn y el pipeline declarado es `tabular-classification`, se infiere que se trata de un modelo de aprendizaje supervisado clásico, probablemente un ensemble de árboles (Random Forest, Gradient Boosting, XGBoost, etc.) o una regresión logística. No se dispone de datos sobre el número de características, el volumen de datos de entrenamiento, la composición del dataset ni el proceso de entrenamiento (si se usó validación cruzada, regularización, etc.).

El formato de pesos joblib es típico de scikit-learn y permite una carga rápida en entornos Python. No se menciona el uso de técnicas como RLHF, DPO o fine-tuning de transformers, lo que refuerza la naturaleza clásica del modelo.

## Capacidades

- Clasificación tabular: el modelo toma características numéricas (probablemente indicadores de mercado, precios históricos, volumen, etc.) y produce una predicción de clase, típicamente binaria (subida/bajada del precio).
- Predicción de dirección de precios: orientado a futuros perpetuos de criptomonedas en Kalshi, generando señales que pueden integrarse en sistemas de trading.
- Ligero y rápido: al ser un modelo scikit-learn, la inferencia es muy rápida y no requiere GPU, lo que permite su uso en entornos de baja latencia.
- No soporta tool calling, agentes, razonamiento multi-paso, visión ni audio. Es un modelo puramente tabular.

## Casos de uso

- Trading algorítmico en Kalshi: el modelo puede integrarse en un bot que ejecute órdenes de compra/venta de futuros perpetuos basándose en la señal de clasificación. Su baja latencia permite decisiones en tiempo real.
- Generación de señales para análisis manual: los traders pueden usar las predicciones como indicador adicional en sus paneles de control, combinándolas con otros análisis técnicos.
- Backtesting de estrategias: al ser un modelo ligero, se puede ejecutar sobre datos históricos para evaluar la rentabilidad de una estrategia basada en sus señales.
- Investigación académica: sirve como punto de partida para estudiar la predictibilidad de precios en mercados de predicción de criptoactivos.
- Educación en finanzas cuantitativas: útil para demostrar cómo un clasificador simple puede aplicarse a datos de mercado, sin necesidad de infraestructura compleja.
- Prototipado rápido: los desarrolladores pueden cargar el modelo con joblib y probar hipótesis de trading en pocas líneas de código Python.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos sobre precisión, F1, AUC u otras métricas en el repositorio de HuggingFace. Tampoco se ofrecen comparaciones con otros modelos de predicción de precios.

## Requisitos de hardware

- VRAM estimada: no requiere GPU; el modelo se ejecuta en CPU.
- RAM: al ser un modelo pequeño (tamaño de repo 0.0 GB), la memoria necesaria es mínima, probablemente menos de 100 MB.
- GPU recomendada: ninguna, funciona en cualquier CPU moderna.
- Compatibilidad con consumer GPU: no aplica, no usa GPU.
- Opciones de despliegue: al ser scikit-learn, se puede servir con Flask/FastAPI, o mediante herramientas como MLflow o ONNX Runtime (si se convierte). No es compatible con vLLM, llama.cpp u Ollama, que están orientados a modelos de lenguaje.
- Latencia y throughput: la inferencia es del orden de microsegundos a milisegundos por muestra, dependiendo del número de características y del modelo concreto. Puede procesar cientos de predicciones por segundo en un solo núcleo.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en el mismo nicho (predicción de precios en Kalshi con clasificación tabular). No hay datos públicos de otros modelos con características equivalentes, por lo que no es posible realizar una comparativa objetiva.

## Limitaciones y advertencias

- Sesgos y overfitting: al no haber documentación sobre el dataset de entrenamiento, existe un riesgo elevado de sobreajuste a datos históricos específicos, lo que puede llevar a predicciones poco fiables en mercados cambiantes.
- Alucinación: al ser un modelo tabular, no genera texto, por lo que el concepto de alucinación no aplica. Sin embargo, las predicciones pueden ser erróneas si las características de entrada están fuera de la distribución de entrenamiento.
- Limitaciones de contexto: el modelo no procesa secuencias ni texto, solo vectores numéricos. No puede interpretar noticias, sentimiento de redes sociales u otras fuentes no numéricas.
- Restricciones de acceso: el modelo es de acceso restringido (gated), por lo que los usuarios deben solicitar permiso y aceptar condiciones en HuggingFace, lo que puede limitar su adopción.
- Licencia MIT: permite uso comercial y modificación, pero el autor no ofrece garantías sobre la precisión o rentabilidad de las predicciones.
- Riesgo financiero: cualquier uso en trading real conlleva riesgo de pérdidas. El modelo no debe considerarse un asesor financiero y su rendimiento pasado no garantiza resultados futuros.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/papylove/kalshi-perps-model
- No se han encontrado papers, blogs, repositorios adicionales ni demos asociados al modelo en la información proporcionada.
