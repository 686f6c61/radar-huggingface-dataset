# Shivam3002/meter-load-forecasting-transformer

## Resumen

El modelo `Shivam3002/meter-load-forecasting-transformer` es un pequeño transformer encoder (1,46 millones de parámetros) entrenado desde cero para predecir el consumo eléctrico de un hogar individual con 24 horas de antelación. Desarrollado por Shivam3002, el modelo toma como entrada las últimas 168 lecturas horarias de potencia activa global (kW) y genera las siguientes 24 lecturas horarias. Está entrenado sobre el dataset UCI Individual Household Electric Power Consumption, remuestreado a medias horarias, y cubre datos de una única vivienda en Francia entre 2006 y 2010.

La relevancia de este modelo radica en su carácter de demostración ligera y reproducible: emplea únicamente PyTorch sin dependencias externas de frameworks de machine learning, y su entrenamiento completo tarda unos 104 segundos en Apple Silicon (MPS). No está pensado para producción, sino como baseline académico o punto de partida para experimentos de forecasting de series temporales con arquitecturas transformer.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (2 capas, d_model=64, 4 cabezas, FFN=128) + cabeza de regresión lineal |
| Parametros totales | 1.457.304 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 168 horas de entrada, 24 horas de salida |
| Tipos de cuantizacion | no disponible (pesos en precisión completa) |
| Idiomas soportados | no disponible (modelo numérico, sin procesamiento de lenguaje) |
| Licencia | MIT |
| Formato de pesos | PyTorch (`pytorch_model.bin`), también `config.json` y `run_info.json` |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura transformer encoder estándar: 2 capas con d_model=64, 4 cabezas de atención y dimensión de feed-forward de 128. Sobre la salida del encoder se coloca una cabeza de regresión lineal que proyecta las representaciones a las 24 horas de predicción. No se emplea decodificador autoregresivo; la salida es directa.

El entrenamiento se realizó sobre el dataset UCI de consumo eléctrico de un hogar, remuestreado a medias horarias. Se usaron 8 épocas, con normalización de entrada/salida basada en la media y desviación estándar del conjunto de entrenamiento (valores guardados en `config.json`). No se menciona el uso de RLHF, DPO ni otras técnicas de alineación, dado que es un modelo de regresión puro. El entrenamiento se ejecutó en Apple Silicon (MPS) y duró aproximadamente 104 segundos.

## Capacidades

- Predicción de series temporales de consumo eléctrico: genera 24 valores horarios futuros a partir de 168 horas de historia.
- Regresión numérica: la salida son valores continuos en kW, no clasificación.
- Manejo de ventanas de contexto fijas: entrada y salida de longitudes predefinidas (168→24).
- Ligereza computacional: al tener solo 1,46M de parámetros, puede ejecutarse en CPU o GPU de gama baja.
- Reproducibilidad: el código de entrenamiento está disponible en GitHub y la configuración completa en `config.json`.
- Sin capacidades de lenguaje, visión, tool calling ni agentes: es un modelo puramente numérico para forecasting.

## Casos de uso

- Baseline académico para investigación en forecasting de series temporales: sirve como referencia simple para comparar arquitecturas más complejas (LSTM, transformers grandes, modelos híbridos) en el mismo dataset.
- Demostración educativa de transformers aplicados a regresión: ideal para cursos o tutoriales que expliquen cómo adaptar la atención a datos numéricos secuenciales.
- Prototipo rápido de predicción de consumo en un hogar concreto: si se dispone de datos de un medidor individual con patrón similar al del dataset original, puede servir como primera aproximación.
- Prueba de concepto para integración en pipelines de datos: al ser un modelo pequeño, puede desplegarse en entornos con recursos limitados (Raspberry Pi, edge devices) para evaluar viabilidad.
- Generación de datos sintéticos de consumo para simulación: las predicciones pueden usarse para alimentar simulaciones de redes eléctricas o estudios de respuesta a la demanda.
- Comparación de métricas de error (MSE, MAE) en tareas de regresión de series temporales: útil para validar metodologías de evaluación.

## Benchmarks y rendimiento

El autor reporta las siguientes métricas en la model card:

| Split | Metrica | Valor |
|---|---|---|
| Validación (época final) | MSE (normalizado) | 0,503 |
| Validación (época final) | MAE (normalizado) | 0,530 |
| Test | MSE (normalizado) | 0,427 |
| Test | MAE (kW) | 0,440 |

No se proporcionan comparaciones con otros modelos en la información disponible. Los valores de MSE están normalizados, mientras que el MAE de test se da en kW absolutos. No hay datos de latencia ni throughput.

## Requisitos de hardware

- VRAM estimada: al ser un modelo de 1,46M de parámetros, el uso de memoria es mínimo. En FP32, los pesos ocupan aproximadamente 5,8 MB; la inferencia puede ejecutarse en CPU sin problema.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM es suficiente; incluso una integrada puede manejar la carga.
- Compatibilidad con GPU de consumo: sí, cabe en cualquier GPU moderna (RTX 3060, RTX 4090, etc.) y también en Apple Silicon (MPS).
- Opciones de despliegue: al ser un modelo PyTorch estándar, puede servirse con TorchServe, FastAPI, o integrarse en scripts Python. No se menciona soporte para vLLM, llama.cpp u Ollama, que están orientados a modelos de lenguaje.
- Latencia y throughput: no disponibles, pero dado el tamaño, la inferencia debería ser del orden de milisegundos en CPU.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (forecasting de carga eléctrica con transformers de tamaño similar) dentro de los datos proporcionados. La búsqueda web arroja referencias a artículos académicos sobre transformers para predicción de carga, pero no se especifican modelos concretos con los que comparar. Por tanto, esta sección queda como no disponible.

## Limitaciones y advertencias

- Entrenado con datos de un único hogar en Francia (2006-2010): no generaliza a otros hogares, regiones o patrones estacionales distintos.
- Modelo pequeño y entrenamiento corto (8 épocas): rendimiento limitado frente a modelos más grandes o con más datos.
- No apto para producción: el propio autor lo califica como demo/baseline, no como sistema de forecasting fiable.
- Sin soporte para múltiples series o variables exógenas: solo usa la serie de potencia activa global, ignorando factores como temperatura, día de la semana o festivos.
- Riesgo de alucinación no aplica (no es un modelo generativo de texto), pero sí puede producir predicciones poco realistas en periodos no vistos durante el entrenamiento.
- Licencia MIT permite uso comercial, pero la utilidad práctica es limitada por las restricciones de generalización.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Shivam3002/meter-load-forecasting-transformer
- Código fuente (GitHub): https://github.com/shivam2003-dev/meter-load-forecasting-transformer
- Dataset UCI Individual Household Electric Power Consumption: https://archive.ics.uci.edu/dataset/235/individual+household+electric+power+consumption
