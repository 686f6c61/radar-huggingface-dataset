# hsilvosa/safecast-radiation-spatial-regressor

## Resumen

SpatialHarmonicNet es un modelo de regresión espacial neuronal continua que predice niveles de radiación ambiental ambiente en microsieverts por hora (uSv/h) en cualquier punto de la Tierra a partir de sus coordenadas geográficas (latitud y longitud). Desarrollado por Hugo Silvosa Cuervo (hsilvosa), el modelo se entrena sobre el conjunto de datos histórico de Safecast, que recopila más de 265 millones de mediciones de radiación crowdsourced a nivel mundial entre 2011 y 2026. Su propósito principal es modelar la línea base de radiación ambiental y detectar anomalías radiactivas en tiempo real.

La arquitectura combina una proyección de coordenadas en la esfera unitaria para evitar discontinuidades en los meridianos, un codificado de características esféricas de Fourier multiescala, un backbone residual MLP con LayerNorm y SiLU, y una cabeza de incertidumbre heteroscedástica que predice tanto la media como la varianza de la radiación logarítmica. El modelo es compacto, con 395.234 parámetros totales, y se distribuye en formato safetensors y ONNX, con licencia CC0-1.0 (dominio público). Su relevancia radica en permitir un mapeo continuo de radiación ambiental sin necesidad de mediciones in situ, así como en la detección de anomalías estadísticas con intervalos de confianza conformes.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | SpatialHarmonicNet (proyección esférica + Fourier features + MLP residual) |
| Parámetros totales | 395.234 |
| Parámetros activos | no disponible |
| Longitud de contexto | no aplica (modelo de regresión tabular espacial) |
| Tipos de cuantización | no aplica (pesos en FP32) |
| Idiomas soportados | en (no es un modelo de lenguaje) |
| Licencia | CC0-1.0 (dominio público) |
| Formato de pesos | safetensors, ONNX |

## Arquitectura y entrenamiento

SpatialHarmonicNet está diseñado específicamente para coordenadas esféricas planetarias. El proceso consta de cinco etapas: (1) proyección de latitud y longitud a coordenadas cartesianas 3D en la unidad esférica, lo que evita la discontinuidad del meridiano a ±180 grados y la distorsión polar; (2) codificado de características esféricas de Fourier multiescala, que proyecta las coordenadas unitarias en bandas de frecuencia armónicas que van desde dimensiones planetarias hasta vecindarios locales de 1 km; (3) un backbone residual profundo con LayerNorm, SiLU y Dropout; (4) una cabeza heteroscedástica gaussiana que predice tanto la media de la radiación logística μ(x) como la varianza aleatoria σ²(x) mediante optimización de log-verosimilitud negativa (NLL); y (5) un detector de anomalías en tiempo real que calcula Z-scores y intervalos de predicción conformes para clasificar las mediciones en NORMAL, ELEVATED, ANOMALY_HIGH y ANOMALY_CRITICAL.

El entrenamiento se realiza sobre el dataset histórico de Safecast, con una división espacial estratificada en celdas de 0.1 grados para la evaluación. No se dispone de detalles sobre el número exacto de tokens o épocas de entrenamiento, ni sobre el uso de técnicas como RLHF o DPO, ya que no es un modelo de lenguaje. La innovación técnica clave reside en la combinación de la proyección esférica con características de Fourier multiescala, que permite capturar variaciones de radiación a distintas escalas geográficas, y en la modelización de la incertidumbre aleatoria mediante una distribución heteroscedástica.

## Capacidades

- Regresión espacial continua: predice el valor de radiación ambiental (uSv/h) para cualquier coordenada geográfica (latitud, longitud) en la Tierra.
- Detección de anomalías en tiempo real: calcula Z-scores estadísticos y produce intervalos de predicción conformes para clasificar mediciones en cuatro niveles de severidad (NORMAL, ELEVATED, ANOMALY_HIGH, ANOMALY_CRITICAL).
- Modelado de incertidumbre: proporciona intervalos de confianza del 95% (PICP) alrededor de las predicciones, basados en la varianza aleatoria estimada.
- Inferencia ligera: con solo 395.234 parámetros, el modelo es adecuado para despliegue en dispositivos de baja capacidad o en tiempo real.
- Compatibilidad ONNX: puede ejecutarse con ONNX Runtime en Python, lo que facilita la integración en aplicaciones de producción.
- Escalabilidad espacial: las características de Fourier multi-escala permiten capturar tanto variaciones globales como locales de radiación.

## Casos de uso

- Mapeo de radiación ambiental a gran escala: el modelo puede generar mapas continuos de radiación de fondo para cualquier región del planeta, complementando las mediciones puntuales del proyecto Safecast con interpolaciones espaciales. Es adecuado para estudios de salud pública y vigilancia ambiental, ya que ofrece predicciones en celdas de 1 km de resolución.
- Detección de anomalías radiactivas: con la cabeza de detección, el modelo puede clasificar mediciones en tiempo real de sensores móviles (por ejemplo, bGeigie Geiger-Müller) como NORMAL, ELEVATED o ANOMALY_CRITICAL, permitiendo alertar sobre posibles fuentes de contaminación radiactiva sin intervención humana.
- Análisis de impacto de desastres nucleares: tras incidentes como Chernóbil o Fukushima, el modelo puede estimar los niveles de radiación en zonas de exclusión y comparar con mediciones históricas para evaluar la evolución de la contaminación.
- Verificación de datos de sensores ciudadanos: al comparar mediciones individuales con la predicción de la línea base y su intervalo de confianza, se pueden identificar mediciones anómalas o errores de calibración en los sensores de la red Safecast.
- Planificación de rutas de monitoreo: para organizaciones que despliegan sensores móviles, el modelo permite identificar áreas con mayor probabilidad de encontrar niveles elevados de radiación, optimizando los itinerarios de muestreo.
- Investigación en ciencias ambientales: como herramienta de regresión espacial, sirve para estudiar la relación entre la radiación de fondo y factores geográficos (altitud, latitud, etc.), así como para validar modelos de dispersión de contaminantes.

## Benchmarks y rendimiento

Los resultados de evaluación se han obtenido sobre un conjunto de prueba espacial estratificado en celdas de 0.1 grados:

| Métrica | Valor |
|---|---|
| R2 Score (log-scale) | 0.0785 |
| RMSE (uSv/h) | 3.11636 |
| MAE (uSv/h) | 0.67873 |
| Cobertura del intervalo de confianza del 95% (PICP) | 94.3% |

Nota: el R2 en escala logarítmica es bajo (0.0785), lo que indica que el modelo explica solo una pequeña parte de la varianza de la radiación en la escala logarítmica. El RMSE y MAE se reportan en uSv/h. No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- Inferencia en CPU: al tener solo 395.234 parámetros, el modelo se ejecuta en tiempo real en cualquier CPU moderna sin GPU. El uso de memoria es inferior a 2 MB en FP32.
- GPU recomendada: no es necesaria para inferencia; una GPU como la RTX 4090 o A100 sería excesiva, aunque puede acelerar el procesamiento por lotes si se ejecutan muchas predicciones simultáneamente.
- Compatibilidad con hardware de bajo consumo: el modelo puede desplegarse en microcontroladores (por ejemplo, Raspberry Pi) o en el edge para aplicaciones de monitorización en campo.
- Opciones de despliegue: el formato ONNX permite ejecutarlo con ONNX Runtime en cualquier plataforma; también se puede cargar en PyTorch con safetensors. No se menciona compatibilidad con vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.
- Latencia y rendimiento: no se dispone de medidas oficiales, pero por el tamaño de la red, la inferencia de una sola predicción debería ser inferior a 1 milisegundo en CPU moderna.

## Comparativa con modelos similares

No se dispone de información sobre modelos de regresión espacial de radiación comparables en la documentación proporcionada. No se puede realizar una comparativa directa con alternativas como modelos de interpolación geoestadística (kriging) o redes neuronales espaciales genéricas, ya que no se han reportado resultados en el mismo conjunto de datos.

## Limitaciones y advertencias

- Datos crowdsourcedizados: el modelo se entrena con mediciones de Safecast, que no son datos oficiales ni regulados. Los sensores son contadores Geiger-Müller móviles con calibraciones aproximadas basadas en Cs-137, lo que introduce errores sistemáticos.
- Rendimiento limitado: el R2 de 0.0785 en escala logarítmica indica que la varianza explicada es muy baja, lo que sugiere que la radiación ambiental no se predice bien solo con coordenadas geográficas; otros factores como la altitud, la geología o la actividad humana no están incluidos.
- Riesgo de falsas alarmas: en la verificación de landmarks, el modelo clasifica áreas urbanas normales (Tokio, París, Nueva York) como ANOMALY_CRITICAL con Z > 12, lo que indica que el umbral de anomalía es demasiado sensible para niveles de fondo típicos de ciudades.
- Sin soporte para idiomas o texto: no es un modelo de lenguaje natural, por lo que no puede procesar texto ni conversaciones.
- Licencia CC0-1.0: aunque permite uso comercial sin restricciones, el modelo no debe utilizarse para decisiones de seguridad crítica sin validación con fuentes oficiales, como indica la propia documentación de Safecast.
- Sin actualizaciones: el modelo se creó en agosto de 2026 y no hay evidencia de versiones posteriores o mantenimiento activo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hsilvosa/safecast-radiation-spatial-regressor
- Dataset de entrenamiento: https://huggingface.co/datasets/hsilvosa/safecast-radiation
- Proyecto Safecast (datos abiertos de radiación): https://safecast.org/
- Mapa interactivo de Safecast: https://origin-simplemap.safecast.org/
- Perfil del autor en GitHub: https://github.com/hsilvosa?tab=repositories
