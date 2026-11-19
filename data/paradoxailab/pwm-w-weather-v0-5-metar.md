# paradoxailab/pwm-w-weather-v0.5-metar

## Resumen

PWM-W Weather v0.5 es un modelo de predicción meteorológica espacio-temporal de muy pequeña escala (932.348 parámetros) desarrollado por ParadoxAI Lab (Aditya Kumar, Anupam Singh) dentro de su serie Paradox World Model. El modelo aborda la tarea de pronosticar las próximas 24 horas de temperatura, humedad y viento a partir de informes METAR de seis aeropuertos indios, incluido Delhi Palam. Se trata del modelo número 25 de una serie de 56 publicados (con numeración interna 01–59) y se presenta como una iteración de corrección sobre la versión 0.4.

La relevancia del modelo es acotada y muy específica: no es un modelo de lenguaje ni un transformer de propósito general, sino una red PyTorch de pronóstico de series temporales entrenada sobre un conjunto reducido de estaciones meteorológicas. Su interés reside en el enfoque de "modelo del mundo" aplicado a predicción local y en su tamaño extremadamente reducido, que permite ejecutarlo en CPU. La versión 0.5 incorpora más predictores de modelo global para la corrección (nubosidad, radiación, punto de rocío, presión y dirección del viento) respecto a la versión anterior.

El modelo se distribuye como un único checkpoint PyTorch (`.pt`) de 3.945.293 bytes con pesos, configuración y resultados de entrenamiento embebidos. La información pública disponible es escasa: la model card remite a una rama de GitHub (`delhi-v0.5`) para los resultados y no incluye arquitectura detallada ni benchmarks en el propio repositorio de Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (red PyTorch para pronóstico espacio-temporal; código en repositorio GitHub) |
| Parametros totales | 932.348 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (ventana de entrada no especificada; salida de 24 h) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo numérico, no lingüístico) |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch checkpoint `.pt` (state dict serializado con `torch.save`) |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna. Indica únicamente que el código de la arquitectura de esta versión se encuentra en el repositorio de GitHub `paradoxailab/paradox-world-model`, en la rama `delhi-v0.5`, y que la configuración de entrenamiento está embebida en el propio checkpoint bajo la clave `ck['cfg']`. Por los tags (`spatiotemporal`, `time-series-forecasting`) y la tarea declarada (predicción de las próximas 24 h de temperatura, humedad y viento), se trata de un modelo de pronóstico de series temporales con componente espacio-temporal, no de un transformer de lenguaje.

Los datos de entrenamiento son informes METAR de seis aeropuertos indios, incluido Delhi Palam. La versión 0.5 se entrenó el 2026-11-07 en un notebook de Kaggle (`pwm-weather-v05-metar`) y se publicó el 2026-11-17. El cambio declarado respecto a la 0.4 es la incorporación de más predictores de modelo global para la etapa de corrección: nubosidad, radiación, punto de rocío, presión y dirección del viento. No se especifica el número de tokens ni de muestras, la composición exacta del dataset, ni si se emplearon técnicas de ajuste fino como RLHF o DPO (poco probables en este dominio). Los datos de entrenamiento no se distribuyen; sus fuentes y términos se detallan en `DATA_SOURCES.md` del repositorio.

## Capacidades

- Pronóstico de las próximas 24 horas de temperatura, humedad y viento a partir de observaciones METAR.
- Corrección de pronóstico mediante predictores de modelo global (nubosidad, radiación, punto de rocío, presión, dirección del viento).
- Modelado espacio-temporal sobre un conjunto reducido de estaciones (seis aeropuertos indios).
- Inferencia en CPU: el checkpoint es de menos de 4 MB y 932.348 parámetros.
- Serialización autocontenida: el archivo `.pt` incluye metadatos (`meta`), pesos (`weights`), configuración (`cfg`) y resultados de entrenamiento (`results`).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües; no es un modelo generativo de texto.

## Casos de uso

- Corrección de pronóstico local en aeropuertos: el modelo toma informes METAR recientes de una estación y produce una predicción corregida a 24 h de temperatura, humedad y viento, útil para ajustar los pronósticos de modelos globales con observaciones locales.
- Apoyo a operaciones aeroportuarias: predicción de viento y humedad a corto plazo para planificación de pistas y gestión de condiciones meteorológicas adversas en los seis aeropuertos cubiertos.
- Prototipado e investigación en modelos del mundo: con menos de 1 M de parámetros y licencia Apache-2.0, sirve como banco de pruebas reproducible para experimentar con corrección de pronósticos y arquitecturas espacio-temporales ligeras.
- Despliegue en dispositivos de borde: al caber en CPU y ocupar menos de 4 MB, puede ejecutarse en entornos sin GPU para generar pronósticos periódicos de una estación concreta.
- Educación y divulgación: ejemplo completo y de código abierto de un pipeline de pronóstico meteorológico con datos METAR, corrección con predictores globales y evaluación registrada en el repositorio.
- Integración en pipelines de datos meteorológicos: el checkpoint autocontenido permite cargar pesos y configuración con `torch.load` y encadenarlo a flujos existentes de ingestión de METAR para generar pronósticos a 24 h.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite los resultados registrados a la rama `delhi-v0.5` del repositorio de GitHub y al campo `ck['results']` del propio checkpoint; no se incluyen cifras (MAE, RMSE u otras) en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: prácticamente nula; el modelo (932.348 parámetros, checkpoint de 3,9 MB) cabe en CPU y en cualquier GPU con varios cientos de MB libres.
- GPU recomendadas: no requiere GPU; cualquier GPU consumer (por ejemplo, RTX 3060 o superior) es más que suficiente si se desea acelerar.
- Cabe en cualquier GPU consumer y en CPU convencional.
- Opciones de despliegue: PyTorch nativo mediante `torch.load` y el código de arquitectura del repositorio GitHub; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría (pronóstico meteorológico espacio-temporal a partir de METAR) ni datos de rendimiento que permitan una comparación rigurosa. Dentro de la propia serie, el predecesor directo es PWM-W Weather v0.4 (`paradoxailab/pwm-w-weather-v0.4-wmo`) y el sucesor es PWM-W Weather v0.6 (`paradoxailab/pwm-w-weather-v0.6-cpcb`), pero no se aportan cifras comparativas.

## Limitaciones y advertencias

- Cobertura geográfica muy restringida: entrenado con METAR de seis aeropuertos indios; no hay garantía de generalización a otras regiones o estaciones.
- Dominio limitado: solo predice temperatura, humedad y viento a 24 h; no cubre precipitación, presión ni otras variables como salida directa.
- Documentación incompleta: la arquitectura, la ventana de entrada, el volumen de datos y los resultados no se detallan en la model card de Hugging Face.
- Riesgo de sobreajuste y de deriva: con 932.348 parámetros y un conjunto de estaciones reducido, el rendimiento fuera de la distribución de entrenamiento puede degradarse; no se documentan evaluaciones de robustez.
- Resultados no verificables en la información disponible: las cifras remiten a una rama de GitHub y al propio checkpoint, sin benchmarks publicados en la model card.
- Sesgos: no documentados; en datos meteorológicos de aeropuertos concretos pueden existir sesgos de instrumentación y de cobertura estacional.
- Licencia Apache-2.0: permite uso comercial y modificación con atribución; los datos de entrenamiento no se distribuyen y sus términos se remiten a `DATA_SOURCES.md`, por lo que deben revisarse antes de un uso en producción.
- No es un modelo de lenguaje: no debe emplearse para generación de texto, razonamiento ni tareas de agentes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/paradoxailab/pwm-w-weather-v0.5-metar
- Repositorio GitHub (rama de esta versión): https://github.com/paradoxailab/paradox-world-model/blob/delhi-v0.5/README.md
- Índice de la serie: https://github.com/paradoxailab/paradox-world-model/blob/main/models/series/README.md
- Fuentes y términos de datos: https://github.com/paradoxailab/paradox-world-model/blob/main/DATA_SOURCES.md
- Citación: https://github.com/paradoxailab/paradox-world-model/blob/main/CITATION.cff
- Versión anterior (v0.4): https://huggingface.co/paradoxailab/pwm-w-weather-v0.4-wmo
- Versión siguiente (v0.6): https://huggingface.co/paradoxailab/pwm-w-weather-v0.6-cpcb
- Serie completa: https://huggingface.co/paradoxailab/paradox-world-model-series
- Sitio del autor: https://paradoxailab.com
