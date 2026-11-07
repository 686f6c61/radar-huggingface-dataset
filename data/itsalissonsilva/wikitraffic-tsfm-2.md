# itsalissonsilva/wikitraffic-tsfm

## Resumen

wikitraffic-tsfm es un adaptador LoRA de rango 8 entrenado sobre el modelo de series temporales google/timesfm-2.5-200m-transformers, publicado por Alisson Silva (itsalissonsilva) en Hugging Face. Su función es predecir los próximos 28 días de visitas diarias (pageviews) a artículos de Wikipedia a partir de un histórico de recuentos numéricos, sin utilizar texto del artículo ni recuperación web. El modelo base TimesFM 2.5 tiene 200 millones de parámetros y el adaptador añade un conjunto reducido de pesos LoRA sobre todas las capas lineales.

El modelo resuelve un problema acotado: proporcionar una línea base reproducible y especializada para el pronóstico de tráfico de páginas de Wikipedia en el ámbito de artículos científicos en inglés y portugués. Sobre una cohorte de 531 ventanas de prueba obtiene un SMAPE de 15,114 frente a 18,432 de una mediana semanal estacional de ocho semanas, aunque su mejora respecto al TimesFM 2.5 congelado es pequeña e incierta (diferencia de −0,039 en SMAPE con intervalo del 95 % que cruza cero).

Es relevante como ejemplo metodológico de ajuste fino con LoRA sobre un foundation model de series temporales, con código de entrenamiento, evaluación y auditoría independiente publicados. No debe interpretarse como una mejora general del modelo base ni como un predictor de tráfico para artículos nuevos o eventos de última hora. La licencia es Apache-2.0 y los pesos se distribuyen en formato safetensors compatibles con PEFT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (rango 8, alpha 16) sobre transformer de series temporales TimesFM 2.5 (200M) |
| Parametros totales | 200M en el modelo base; adaptador LoRA de rango 8 sobre todas las capas lineales (recuento exacto del adaptador no disponible) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 352 observaciones diarias de entrada; horizonte de salida de 28 días |
| Tipos de cuantizacion | No disponible (entrenamiento e inferencia registrados en bfloat16; el helper admite float32 en CPU) |
| Idiomas soportados | Inglés y portugués (cohorte de artículos científicos); no se declara soporte multilingüe general |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre google/timesfm-2.5-200m-transformers, un transformer de pronóstico de series temporales de 200 millones de parámetros. Se utiliza LoRA con rango 8, alpha 16, dropout 0,05 y se adaptan todos los módulos lineales. El entrenamiento emplea la pérdida nativa de TimesFM sobre recuentos transformados con log1p, con learning rate 5e-5, weight decay 0,01, batch de 16, tres épocas y una única semilla; el checkpoint se selecciona exclusivamente por SMAPE de validación.

Los datos provienen del dataset itsalissonsilva/wikimedia-pageviews-forecasting (revisión congelada 99190529f3ee6d7a2c29fc38c9924f8355ba275a), con ventanas de entrenamiento que terminan en diciembre de 2024, validación en 2025 y prueba del 24 de enero al 2 de octubre de 2026, con orígenes separados 28 días. Los títulos se repiten entre particiones y se eligieron como cohorte de conveniencia de artículos científicos, por lo que no constituye una retención real de artículos. Las observaciones faltantes se excluyeron en lugar de imputarse. No se documenta uso de RLHF ni DPO, algo esperable en un modelo de pronóstico.

## Capacidades

- Pronóstico de series temporales univariantes: genera 28 valores puntuales de pageviews diarios a partir de un histórico de recuentos.
- Transformación log1p de la entrada y salida en escala de recuentos, según la práctica publicada del modelo base.
- Manejo de contexto variable: acepta desde 32 observaciones hasta las últimas 352, redondeando hacia abajo a múltiplos de 32.
- Especialización en artículos científicos de Wikipedia en inglés y portugués.
- No utiliza texto del artículo, recuperación web ni información de eventos futuros.
- No soporta tool calling, function calling ni razonamiento multi-paso: es un modelo de pronóstico, no un LLM generativo.
- No dispone de modo de razonamiento (thinking), visión ni audio.
- Produce únicamente pronósticos puntuales; los intervalos de incertidumbre no están calibrados.

## Casos de uso

- Planificación de tráfico editorial: exportar 352 recuentos diarios consecutivos de un artículo científico y obtener los 28 días siguientes para comparar con una previsión estacional por mediana semanal y detectar desviaciones.
- Línea base reproducible en investigación: usar el adaptador como referencia fija (fijando la revisión del commit) en experimentos de pronóstico de tráfico, con métricas y predicciones emparejadas publicadas para replicación.
- Evaluación de modelos de forecasting: comparar el adaptador frente a TimesFM 2.5 y TimesFM 3 congelados sobre la misma cohorte de 531 ventanas y 59 grupos de idioma/página.
- Monitorización de estacionalidad: inspeccionar el patrón semanal implícito en las predicciones para planificar campañas o recursos en torno a picos recurrentes de tráfico.
- Docencia y prototipado: el helper de inferencia en CPU (float32) permite ejecutar el flujo completo sin GPU, útil para demostraciones y validación de pipelines.
- Auditoría de ajuste fino: reutilizar el código de wikimedia_pilot/ y wikimedia_audit/ para reproducir el entrenamiento LoRA y las pruebas de estrés de contexto corto (SMAPE de 16,621 a 32 días y 15,114 a 352 días).
- Análisis de cambios de nivel: examinar los cortes diagnósticos de cambio de nivel (SMAPE 33,230 en 38 ventanas) para entender dónde falla el modelo ante subidas o caídas bruscas de tráfico.

## Benchmarks y rendimiento

Resultados congelados sobre 531 ventanas móviles, 59 grupos de idioma/página y 28 días por pronóstico. Menor es mejor.

| Condición | SMAPE | MAE | MASE |
|---|---:|---:|---:|
| TimesFM 3 congelado, recuentos brutos | 14,991 | 270,959 | 0,945 |
| Este adaptador, recuentos log1p | 15,114 | 270,752 | 0,950 |
| TimesFM 2.5 congelado, recuentos log1p | 15,153 | 271,371 | 0,953 |
| TimesFM 2.5 congelado, recuentos brutos | 15,167 | 270,900 | 0,953 |
| Mediana semanal de ocho semanas | 18,432 | Ver auditoría | Ver auditoría |
| Última semana observada, repetida | 19,991 | 382,868 | 1,317 |

Bootstrap emparejado por clúster de artículo (2.000 remuestreos): adaptador menos mediana estacional en SMAPE −3,318, intervalo percentil del 95 % [−4,330; −2,446]. Frente a TimesFM 2.5 congelado con log1p: −0,039, intervalo [−0,153; +0,075].

Cortes diagnósticos del adaptador:

| Corte | Ventanas | SMAPE |
|---|---:|---:|
| Inglés | 351 | 12,016 |
| Portugués | 180 | 21,155 |
| Cambio de nivel realizado | 38 | 33,230 |
| Nivel estable | 493 | 13,717 |

Pruebas de estrés con contexto truncado: SMAPE 16,621 a 32 días, 16,486 a 64, 15,712 a 128 y 15,114 a 352; TimesFM 2.5 congelado obtiene 16,639, 16,515, 15,745 y 15,153 respectivamente. En el subconjunto de 59 ventanas con orígenes posteriores al 1 de septiembre de 2026, el adaptador obtiene 15,074, TimesFM 2.5 congelado 15,479 y TimesFM 3 congelado 14,943.

## Requisitos de hardware

- VRAM estimada: el modelo base tiene 200M de parámetros; en bfloat16 ocupa aproximadamente 0,4 GB, más el adaptador LoRA (rango 8, tamaño despreciable) y el estado de activaciones. Cabe holgadamente en cualquier GPU consumer con 4 GB o más.
- GPU recomendadas: cualquier GPU con soporte bfloat16; las pruebas registradas usan bfloat16 y SDPA. Una RTX 4090, A100 o H100 son sobredimensionadas para este modelo; una RTX 3060 o superior es suficiente.
- CPU: el helper de inferencia admite float32 en CPU, aunque no es la configuración de paridad registrada en GPU.
- Despliegue: inferencia mediante el script forecast.py con PyTorch 2.10.0, Transformers 5.22.1, PEFT 0.21.2, Accelerate 1.15.0 y Safetensors 0.8.0. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no están orientados a este tipo de modelo.
- Latencia y throughput: no disponibles en la información proporcionada.
- TimesFM 3 no es necesario para la inferencia del adaptador.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / horizonte | SMAPE (cohorte) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| wikitraffic-tsfm (este adaptador) | 200M base + LoRA rango 8 | 352 días / 28 días | 15,114 | Apache-2.0 | Pesos PEFT en Hugging Face |
| google/timesfm-2.5-200m-transformers (congelado) | 200M | 352 días / 28 días | 15,153 (log1p) | Apache-2.0 | Pesos en Hugging Face |
| TimesFM 3 (congelado, comparador) | No disponible | No disponible | 14,991 | Términos no comerciales / no producción | No redistribuido en este repositorio |
| Mediana semanal de ocho semanas (línea base) | No aplica | 8 semanas | 18,432 | No aplica | Implementación trivial |

## Limitaciones y advertencias

- La mejora frente a TimesFM 2.5 congelado es pequeña e incierta: el intervalo de confianza del 95 % de la diferencia en SMAPE incluye el cero.
- TimesFM 3 congelado supera al adaptador en la métrica global (14,991 frente a 15,114), por lo que la afirmación válida es la de un experimento especializado útil, no una mejora del foundation model.
- Cohorte de conveniencia: los títulos se repiten entre entrenamiento, validación y prueba, y no hay retención real de artículos; no es una prueba de arranque en frío para títulos no vistos.
- El modelo no explica por qué cambia el tráfico y no maneja picos de noticias de última hora ni artículos nuevos sin evaluación separada.
- Rendimiento notablemente peor en portugués (SMAPE 21,155) que en inglés (12,016), y muy degradado ante cambios de nivel (33,230).
- Solo produce pronósticos puntuales; los intervalos de incertidumbre no están calibrados.
- Riesgo de contaminación por preentrenamiento en fechas de prueba anteriores al lanzamiento público de TimesFM 3; el corte por fecha de publicación no garantiza el corte real de preentrenamiento.
- Los cortes de cambio de nivel son retrospectivos y no están disponibles en el momento del pronóstico.
- No se han documentado sesgos específicos más allá de la cobertura geográfica y lingüística limitada a inglés y portugués.
- Licencia Apache-2.0 para los pesos del adaptador; los datos de Wikimedia son CC0 según la documentación original. TimesFM 3 se usó solo como comparador bajo sus términos no comerciales y no se redistribuye.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/itsalissonsilva/wikitraffic-tsfm
- Página alternativa del modelo: https://huggingface.co/itsalissonsilva/WikiTraffic-TSFM
- Perfil del autor: https://huggingface.co/itsalissonsilva
- Dataset de entrenamiento: https://huggingface.co/datasets/itsalissonsilva/wikimedia-pageviews-forecasting
- Modelo base: https://huggingface.co/google/timesfm-2.5-200m-transformers
