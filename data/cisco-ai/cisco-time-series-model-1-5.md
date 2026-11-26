# cisco-ai/cisco-time-series-model-1.5

## Resumen

CTSM 1.5 (Cisco Time Series Model 1.5) es un modelo fundacional de predicción de series temporales desarrollado por Cisco AI, orientado a forecasting zero-shot sobre datos de máquina, con especial énfasis en observabilidad y redes. Es una evolución del CTSM 1.0 que conserva su diseño de contexto multirresolución y añade un tratamiento explícito de la estacionalidad (patrones diarios, semanales y otros ciclos periódicos) mediante covariables de calendario. El modelo se publica con licencia Apache 2.0 y pesos en safetensors bajo la librería PyTorch.

Con 254.315.920 parámetros (aproximadamente 254 M), CTSM 1.5 se sitúa en la gama media de los modelos fundacionales de series temporales, lo que permite desplegarlo en hardware modesto. Su contexto combina hasta 4.096 observaciones a la cadencia original y hasta 512 medias gruesas (cada una cubre 60 observaciones), ambas vistas alineadas en el mismo origen de predicción. La decodificación por parches de horizonte genera 128 pasos por pasada del decodificador mediante cuatro consultas aprendidas que emiten 15 cuantiles para 32 pasos futuros cada una.

Su relevancia actual radica en que compite directamente con modelos como TimesFM-3, Chronos-2 y Toto-2.0-313M en benchmarks de observabilidad y en GIFT-Eval, superándolos en los conjuntos O11y y O11y-Seasonal según los resultados publicados por el autor. Está pensado para escenarios de monitorización de infraestructura, donde la estacionalidad de los datos de máquina es determinante para la calidad del pronóstico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con atención axial, contexto multirresolución y cabecera de cuantiles |
| Parametros totales | 254.315.920 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | hasta 4.096 observaciones a cadencia original y hasta 512 medias gruesas (cada una cubre 60 observaciones) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de series temporales, no de texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (PyTorch) |

## Arquitectura y entrenamiento

CTSM 1.5 es un transformer con atención axial que procesa dos vistas de la historia de la serie: una vista fina a la cadencia original (hasta 4.096 observaciones) y una vista gruesa de medias (hasta 512 medias de 60 observaciones cada una). Ambas vistas terminan en el mismo origen de predicción y pueden solaparse. La normalización en ejecución se calcula por resolución usando los parches hasta el actual incluido, y la cabecera de predicción invierte esa normalización con las estadísticas finales del contexto fino.

El modelo incorpora covariables de calendario en dos filas separadas (hora del día y día de la semana) alineadas con el contexto fino. El decodificador aplica 24 capas de atención temporal seguidas de una capa que permite a la fila de valores atender a las filas de calendario; en modo solo valores ambas filas se enmascaran. La decodificación por parches de horizonte usa una cabecera residual compartida sobre cuatro consultas aprendidas, cada una con 15 cuantiles para 32 pasos futuros, lo que da 128 pasos por pasada. Si se proporcionan timestamps, el modelo extrapola las características de calendario futuras a partir de los dos últimos timestamps observados.

En entrenamiento se emplean ciclos warmup-stable-decay (WSD) con planificación cuidadosa de datos en cada ciclo, datos de observabilidad con más resoluciones, entrenamiento heterogéneo (mezcla con y sin timestamps), un conjunto más rico de generadores sintéticos orientados a estructuras estacionales de datos de máquina y generación adversarial de datos mediante muestreo con multi-armed bandit en algunos ciclos. La predicción puntual es el cuantil 0,5. En inferencia se aplican controles como decodificación en tres rutas (P25, P50, P75), ordenación de cuantiles, recorte/redondeo condicional y equivarianza a la inversión (activa por defecto, desactivable con `flip_equivariance=False`).

## Capacidades

- Predicción de series temporales zero-shot sin ajuste específico por serie.
- Pronóstico multirresolución con contexto fino y contexto grueso simultáneos.
- Modelado explícito de estacionalidad diaria y semanal mediante covariables de calendario.
- Extrapolación de características de calendario futuras a partir de timestamps observados.
- Salida probabilística con 15 cuantiles por paso, incluida la mediana como predicción puntual.
- Decodificación de 128 pasos por pasada del decodificador.
- Modo solo valores (sin timestamps) mediante `use_timestamps=False`.
- Control de equivarianza a la inversión para mejorar la simetría del pronóstico.
- Recorte de predicciones negativas a cero y redondeo a enteros cuando la serie observada cumple la condición.
- No dispone de tool calling, capacidades de agente, visión, audio ni generación de texto.

## Casos de uso

- Monitorización de infraestructura y observabilidad: el modelo pronostica métricas de máquina (CPU, memoria, latencia, throughput) aprovechando su contexto de hasta 4.096 observaciones y sus covariables de calendario para capturar picos horarios y semanales.
- Planificación de capacidad en redes: con la vista gruesa de 512 medias de 60 observaciones se pueden proyectar tendencias de tráfico a medio plazo sin reentrenar por serie.
- Detección temprana de anomalías: comparar la predicción cuantílica con la observación real permite construir umbrales dinámicos basados en los cuantiles P25/P75 en lugar de umbrales fijos.
- Alertas estacionales en sistemas de observabilidad: el subconjunto O11y-Seasonal del benchmark refleja precisamente series con componente estacional fuerte, escenario típico de paneles de monitorización.
- Pronóstico de demanda o métricas de negocio con periodicidad horaria o diaria, usando `start_time` y cadencia para activar las características de calendario.
- Predicción en entornos con recursos limitados: sus 254 M de parámetros permiten inferencia en CPU o GPU de consumo, adecuado para despliegues en el borde o en pipelines embebidos.
- Generación de pronósticos probabilísticos para sistemas de decisión que necesitan intervalos, no solo un valor puntual.

## Benchmarks y rendimiento

Resultados publicados por el autor (MASE y CRPS, menor es mejor):

| Benchmark | Modelo | MASE ↓ | CRPS ↓ |
|---|---|---:|---:|
| O11y | CTSM-1.5 | 0.298 | 0.019 |
| O11y | Toto-2.0-313M | 0.319 | 0.020 |
| O11y | CTSM-1.0 | 0.328 | 0.021 |
| O11y | TimesFM-3 | 0.345 | 0.022 |
| O11y | Chronos-2 | 0.403 | 0.025 |
| O11y-Seasonal | CTSM-1.5 | 0.404 | 0.030 |
| O11y-Seasonal | Toto-2.0-313M | 0.427 | 0.031 |
| O11y-Seasonal | TimesFM-3 | 0.458 | 0.033 |
| O11y-Seasonal | CTSM-1.0 | 0.500 | 0.037 |
| O11y-Seasonal | Chronos-2 | 0.503 | 0.037 |
| GIFT-Eval | TimesFM-3 | 0.667 | 0.456 |
| GIFT-Eval | CTSM-1.5 | 0.689 | 0.478 |
| GIFT-Eval | Chronos-2 | 0.698 | 0.485 |
| GIFT-Eval | Toto-2.0-313M | 0.703 | 0.481 |
| GIFT-Eval | CTSM-1.0 | 0.766 | 0.548 |

Notas de evaluación del autor: los benchmarks O11y son internos, con datos fuera de dominio y posteriores al periodo de entrenamiento; la estacionalidad se define mediante descomposición STL (componente estacional con peso sustancial en la varianza). En GIFT-Eval se sigue el protocolo estándar usando timestamps cuando están disponibles.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 254 M de parámetros, los pesos en FP32 ocupan aproximadamente 1 GB (tamaño del repo: 1,0 GB), por lo que en FP16 rondarían 0,5 GB y en cuantizaciones de 8 bits o 4 bits bastante menos.
- GPU recomendadas: no especificadas por el autor; por tamaño, cualquier GPU con al menos 2-4 GB de VRAM debería ser suficiente en FP16, incluidas RTX 3060, RTX 4060, RTX 4090, A100 y H100.
- Cabe en GPU de consumo: sí, previsiblemente en la mayoría de modelos con 4 GB o más de VRAM, aunque el autor no publica requisitos oficiales.
- Opciones de despliegue: paquete PyPI `cisco-tsm` (Python 3.11 o superior), con wheels de PyTorch para CPU o CUDA; el repositorio de GitHub incluye notebooks y configuración de serving. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | MASE O11y ↓ | MASE GIFT-Eval ↓ | Licencia |
|---|---:|---|---:|---:|---|
| CTSM-1.5 | 254 M | 4.096 obs. + 512 medias | 0.298 | 0.689 | Apache 2.0 |
| Toto-2.0-313M | 313 M | no disponible | 0.319 | 0.703 | no disponible |
| TimesFM-3 | no disponible | no disponible | 0.345 | 0.667 | no disponible |
| Chronos-2 | no disponible | no disponible | 0.403 | 0.698 | no disponible |
| CTSM-1.0 | no disponible | no disponible | 0.328 | 0.766 | Apache 2.0 |

CTSM 1.5 lidera en los benchmarks O11y y O11y-Seasonal del autor, mientras que TimesFM-3 obtiene mejor MASE en GIFT-Eval (0.667 frente a 0.689). Los datos de parámetros, contexto y licencia de los modelos comparables no están disponibles en la información proporcionada.

## Limitaciones y advertencias

- Los benchmarks O11y son internos del autor y no han sido verificados de forma independiente; los resultados deben interpretarse con cautela.
- El sesgo hacia datos de observabilidad y redes puede reducir el rendimiento en dominios muy distintos (finanzas, sensores industriales, series médicas) pese a la evaluación en GIFT-Eval.
- Riesgo de pronósticos poco fiables en series sin estructura estacional clara o con regímenes cambiantes no vistos en entrenamiento.
- La activación de covariables de calendario requiere timestamps o una hora de inicio y cadencia; sin ellos el modelo opera en modo solo valores y pierde parte de su ventaja estacional.
- No se documentan tipos de cuantización soportados ni requisitos oficiales de hardware, lo que dificulta planificar despliegues en producción.
- No es un modelo de lenguaje: no admite tool calling, agentes, ni generación de texto, y no debe usarse para esas tareas.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las dependencias del paquete `cisco-tsm` y el código del repositorio de GitHub.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validación comunitaria pública.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/cisco-ai/cisco-time-series-model-1.5
- Modelo predecesor CTSM 1.0: https://huggingface.co/cisco-ai/cisco-time-series-model-1.0
- Repositorio GitHub (código, notebooks y serving): https://github.com/splunk/cisco-time-series-model
- Paquete PyPI: https://pypi.org/project/cisco-tsm/
- Paper (arXiv): https://arxiv.org/abs/2511.19841
- PyTorch (instalación de wheels): https://pytorch.org/get-started/locally/
- Web de Cisco: https://www.cisco.com/
