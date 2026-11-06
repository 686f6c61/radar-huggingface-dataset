# itsalissonsilva/WikiTraffic-TSFM

## Resumen

WikiTraffic-TSFM es un adaptador LoRA de rango 8 entrenado sobre el modelo fundacional de series temporales google/timesfm-2.5-200m-transformers, con el objetivo de generar previsiones diarias a 28 días de visitas a páginas de Wikipedia. Lo desarrolla el usuario itsalissonsilva como artefacto de investigación y se publica bajo licencia Apache-2.0, heredada del modelo base. El adaptador utiliza 352 días de contexto con recuentos transformados mediante log1p y se ha ajustado sobre un cohorte de conveniencia de artículos científicos en inglés y portugués.

El modelo no introduce una arquitectura nueva: reutiliza el transformer decoder-only de TimesFM 2.5 (200 millones de parámetros) y añade módulos LoRA sobre todas las capas lineales. Su relevancia es metodológica más que de rendimiento: documenta de forma explícita resultados favorables y desfavorables, incluye auditoría independiente y código de reproducción, y evita reclamar mejoras generales frente a modelos fundacionales congelados.

La comparación publicada es honesta: el adaptador supera con claridad a las líneas base estacionales (mediana semanal de ocho semanas y repetición de la última semana), pero su mejora frente a TimesFM 2.5 congelado con transformación logarítmica es marginal e incierta, y TimesFM 3 congelado obtiene mejor SMAPE global. Se trata, por tanto, de un recurso útil para estudiar fine-tuning de modelos de series temporales, no de un modelo listo para producción a gran escala.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (TimesFM 2.5) con adaptadores LoRA de rango 8 sobre modulos lineales |
| Parametros totales | 200 M en el modelo base; el adaptador LoRA añade un numero no especificado de parametros |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 352 observaciones diarias (hasta el ultimo multiplo de 32); minimo 32 observaciones |
| Tipos de cuantizacion | no disponible; inferencia reportada en bfloat16 y float32 en CPU |
| Idiomas soportados | no aplica (modelo numerico); datos de entrenamiento en articulos en ingles y portugues |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |
| Modelo base | google/timesfm-2.5-200m-transformers (revision 5a9806b9b291fad9233b5249d88263f1846304d3) |
| Dataset de entrenamiento | itsalissonsilva/wikimedia-pageviews-forecasting (revision 99190529f3ee6d7a2c29fc38c9924f8355ba275a) |
| Horizonte de prediccion | 28 dias |
| Libreria | PEFT |

## Arquitectura y entrenamiento

El modelo base es TimesFM 2.5 en su variante de 200 millones de parámetros, un transformer decoder-only diseñado para forecasting de series temporales. Sobre él se aplica un adaptador LoRA de rango 8 con alpha 16, dropout 0.05 y aplicación a todos los módulos lineales. La entrada son recuentos diarios de pageviews transformados con log1p, y la pérdida utilizada es la nativa de TimesFM sobre esos recuentos transformados.

El ajuste emplea una tasa de aprendizaje de 5e-5, weight decay de 0.01, batch de 16 y tres épocas con una única semilla. El checkpoint se selecciona exclusivamente por SMAPE de validación. Los datos provienen del dataset de pageviews de Wikimedia congelado en una revisión concreta: las ventanas de entrenamiento terminan en diciembre de 2024, la validación cubre 2025 y el test abarca desde el 24 de enero hasta el 2 de octubre de 2026, con orígenes separados 28 días. Los títulos son recurrentes entre splits (no hay holdout de artículos) y se seleccionaron como cohorte de conveniencia de temática científica. Las observaciones faltantes se excluyeron en lugar de imputarse.

No se emplean características de eventos, texto del artículo ni mecanismos de retrieval. El adaptador produce únicamente predicciones puntuales; sus intervalos de incertidumbre no están calibrados.

## Capacidades

- Predicción de series temporales univariantes: genera horizontes de 28 días a partir de hasta 352 observaciones diarias.
- Forecasting sobre recuentos de pageviews de Wikipedia, con transformación log1p aplicada internamente.
- Manejo de contexto variable: acepta desde 32 observaciones y trunca hasta el último múltiplo de 32.
- Inferencia en GPU con bfloat16 y SDPA, y en CPU con float32 mediante el helper proporcionado.
- Integración con el ecosistema PEFT/Transformers para cargar el adaptador sobre el modelo base.
- No soporta tool calling, agentes, visión, audio ni generación de texto: es un modelo puramente numérico de series temporales.
- No incorpora capacidades multilingües en el sentido de NLP; los idiomas solo aparecen como segmentación del cohorte de evaluación.

## Casos de uso

- Monitorización de tráfico en Wikipedia: prever la evolución de pageviews de artículos científicos concretos a cuatro semanas para planificar caché, réplicas o ancho de banda en infraestructura de lectura.
- Investigación sobre fine-tuning de modelos fundacionales de series temporales: el repositorio incluye código de entrenamiento, evaluación y auditoría independiente, lo que permite reproducir y extender el experimento con otras cohortes o transformaciones.
- Evaluación de líneas base estacionales: el adaptador sirve como referencia para comparar métodos simples (mediana semanal, repetición de la última semana) frente a modelos neuronales en series de tráfico web.
- Análisis de sensibilidad al contexto: los tests de estrés con 32, 64, 128 y 352 días permiten estudiar cómo degrada el rendimiento al reducir el histórico disponible.
- Detección de cambios de nivel: aunque los estratos de level-shift son retrospectivos, el modelo puede emplearse en pipelines de investigación para analizar cómo responden los forecasters ante cambios bruscos de tráfico.
- Docencia y formación: ejemplo completo y auditado de aplicación de LoRA a un modelo de series temporales, con métricas, intervalos bootstrap y limitaciones documentadas.
- Prototipado de sistemas de forecasting editorial: estimar demanda de contenido o interés futuro en temáticas científicas para planificación de publicaciones, siempre con validación adicional sobre la cohorte concreta.

## Benchmarks y rendimiento

Resultados congelados sobre 531 ventanas móviles, 59 grupos idioma/página, 28 días por previsión. Menor es mejor.

| Condición | SMAPE | MAE | MASE |
|---|---:|---:|---:|
| TimesFM 3 congelado, recuentos brutos | 14.991 | 270.959 | 0.945 |
| Este adaptador, recuentos log1p | 15.114 | 270.752 | 0.950 |
| TimesFM 2.5 congelado, log1p | 15.153 | 271.371 | 0.953 |
| TimesFM 2.5 congelado, recuentos brutos | 15.167 | 270.900 | 0.953 |
| Mediana semanal de ocho semanas | 18.432 | no disponible en la tabla | no disponible en la tabla |
| Última semana observada, repetida | 19.991 | 382.868 | 1.317 |

Bootstrap por clústeres de artículo (2.000 remuestreos): diferencia adaptador menos mediana estacional en SMAPE de −3.318, intervalo percentil 95% [−4.330, −2.446]. Frente a TimesFM 2.5 congelado con log1p, la diferencia es −0.039, intervalo [−0.153, +0.075], es decir, incierta.

Subconjunto de 59 ventanas con orígenes posteriores al 1 de septiembre de 2026: adaptador 15.074, TimesFM 2.5 congelado 15.479, TimesFM 3 congelado 14.943.

Cortes diagnósticos del adaptador:

| Corte | Ventanas | SMAPE |
|---|---:|---:|
| Inglés | 351 | 12.016 |
| Portugués | 180 | 21.155 |
| Cambio de nivel realizado | 38 | 33.230 |
| Nivel estable | 493 | 13.717 |

Tests de estrés con contexto truncado (adaptador): 16.621 con 32 días, 16.486 con 64, 15.712 con 128 y 15.114 con 352. TimesFM 2.5 congelado: 16.639, 16.515, 15.745 y 15.153 respectivamente.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; con 200 M de parámetros en bfloat16 el modelo base ocupa aproximadamente 0,4 GB de pesos, más el adaptador LoRA (de tamaño reducido) y memoria de activaciones.
- GPU recomendadas: no especificadas por el autor; el entorno de reproducción registrado usa bfloat16 y SDPA en GPU, sin modelo concreto indicado.
- GPU de consumo: por tamaño, el modelo debería caber en cualquier GPU consumer con al menos 4-8 GB de VRAM, aunque el autor no lo documenta.
- Despliegue: carga mediante PEFT y Transformers (versiones de referencia: PyTorch 2.10.0, Transformers 5.22.1, PEFT 0.21.2, Accelerate 1.15.0, Safetensors 0.8.0). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.
- CPU: float32 disponible en el helper, pero no es la configuración de paridad reportada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | SMAPE (cohorte) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| WikiTraffic-TSFM (este) | 200 M + LoRA | 352 obs. | 15.114 | Apache-2.0 | Hugging Face |
| google/timesfm-2.5-200m-transformers | 200 M | 352 obs. (configurado) | 15.153 (log1p) | Apache-2.0 | Hugging Face |
| TimesFM 3 (comparador congelado) | no disponible | no disponible | 14.991 | no comercial / no producción | Pesos no redistribuidos |
| Mediana semanal de ocho semanas | no aplica | 56 días | 18.432 | no aplica | Línea base estadística |

## Limitaciones y advertencias

- Estudio retrospectivo pequeño: una sola semilla de entrenamiento, identidades de artículo recurrentes entre splits y un único origen reciente posterior a la publicación del modelo base.
- No es un holdout de artículos: el cohorte es de conveniencia y los títulos se repiten entre entrenamiento, validación y test.
- La mejora frente a TimesFM 2.5 congelado con log1p es marginal y su intervalo de confianza cruza cero; no debe interpretarse como ganancia general de fine-tuning.
- TimesFM 3 congelado obtiene mejor SMAPE global que el adaptador en esta cohorte.
- No hay evaluación a escala de todo el sitio de Wikipedia ni en artículos nuevos (no es un benchmark de cold-start).
- Los estratos de cambio de nivel son retrospectivos y no están disponibles en el momento de la predicción.
- El adaptador solo produce predicciones puntuales; los intervalos de incertidumbre no están calibrados.
- Riesgo de contaminación por pretraining en orígenes de test anteriores a la publicación de TimesFM 3; el corte por fecha de publicación no garantiza el corte real de pretraining.
- Rendimiento notablemente peor en portugués (SMAPE 21.155) que en inglés (12.016), y muy degradado ante cambios de nivel (33.230).
- No utiliza texto del artículo, eventos ni retrieval, por lo que no puede anticipar picos causados por acontecimientos externos.
- Licencia Apache-2.0 en los pesos del adaptador, pero los términos del modelo base y del dataset deben verificarse por separado; TimesFM 3 no se redistribuye y tiene términos no comerciales.
- No hay resultados de Kaggle ni comparación con leaderboards públicos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/itsalissonsilva/WikiTraffic-TSFM
- Dataset de entrenamiento: https://huggingface.co/datasets/itsalissonsilva/wikimedia-pageviews-forecasting
- Modelo base: https://huggingface.co/google/timesfm-2.5-200m-transformers
- Código de inferencia, entrenamiento y auditoría: incluido en el repositorio del modelo (forecast.py, wikimedia_pilot/, wikimedia_audit/, audit_wikitraffic.py, independent_audit.json)
- Paper o blog adicional: no disponible en la información proporcionada
