# PARADOXAIlabs/pwm-x-cpcb

## Resumen

PWM-X (v0.9) es un modelo de series temporales desarrollado por ParadoxAI Lab (Aditya Kumar, Anupam Singh) dentro de su familia PWM-W, que forma parte de la serie Paradox World Model. El modelo resuelve una tarea concreta de predicción espacio-temporal: pronosticar las próximas 24 horas de temperatura, humedad y viento a partir de datos meteorológicos de estaciones. No es un modelo de lenguaje, sino un modelo de forecasting de pequeño tamaño (1.260.997 parámetros) entrenado específicamente para el contexto geográfico de la India.

Su relevancia radica en el estudio de umbral de datos que acompaña a la versión: según el autor, se necesitan aproximadamente 24 meses de historial local para dejar de perder frente a TimesFM y Chronos, y alrededor de 48 meses para superarlos. Este tipo de hallazgo es útil para equipos que evalúan si merece la pena entrenar un modelo propio frente a usar un modelo fundacional de series temporales preentrenado.

El modelo se distribuye como un checkpoint de PyTorch (`.pt`) con los pesos, la configuración de entrenamiento y los resultados registrados embebidos en el propio fichero. La arquitectura concreta no se detalla en la model card; el código de arquitectura se remite al repositorio de GitHub del autor. La licencia es Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (código en repositorio GitHub del autor) |
| Parametros totales | 1.260.997 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (horizonte de predicción: próximas 24 h) |
| Tipos de cuantizacion | no disponible (checkpoint PyTorch en precisión original) |
| Idiomas soportados | no disponible (modelo numérico de series temporales, no lingüístico) |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch `.pt` (`29_pwm-x_v0.9_cpcb.pt`, 5.589.589 bytes) |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna del modelo; solo indica que es un modelo de forecasting espacio-temporal ("cross-network model") y que el código de arquitectura está en el repositorio de GitHub del autor, mientras que la configuración de entrenamiento se guarda en el propio checkpoint bajo la clave `ck['cfg']`. No se especifican el número de tokens de entrenamiento, la composición exacta del dataset ni si se emplearon técnicas de ajuste como RLHF o DPO (no aplicables en este dominio).

Los datos de entrenamiento provienen de tres fuentes: meteorología de estaciones CPCB/DPCC de Delhi (25 estaciones), estaciones sinópticas WMO en la India (NOAA ISD) y reportes METAR de seis aeropuertos indios, incluido Delhi Palam. El entrenamiento se realizó el 2026-11-09 en Kaggle y el modelo se publicó el 2026-11-17. La innovación destacable documentada es el estudio de umbral de datos: cuantificar cuánto historial local hace falta para igualar y superar a modelos fundacionales de series temporales como TimesFM y Chronos.

## Capacidades

- Predicción de las próximas 24 horas de temperatura, humedad y viento.
- Modelado espacio-temporal con información de múltiples estaciones (cross-network).
- Forecasting sobre datos meteorológicos de la India (Delhi y estaciones sinópticas nacionales).
- Integración con datos de aeropuertos vía reportes METAR.
- Carga programática mediante `torch.load` con pesos, metadatos, configuración y resultados accesibles desde el checkpoint.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un modelo numérico de series temporales.
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Predicción meteorológica local a 24 horas: el modelo genera pronósticos de temperatura, humedad y viento para estaciones de Delhi, útil para servicios meteorológicos o aplicaciones de consumo que necesiten previsiones de corto plazo en esa región.
- Planificación operativa aeroportuaria: al entrenarse con reportes METAR de seis aeropuertos indios, puede apoyar la previsión de condiciones de viento y humedad relevantes para operaciones de pista y visibilidad.
- Estudio de viabilidad de modelos propios frente a fundacionales: el umbral de datos medido (24 meses para igualar, 48 para superar a TimesFM/Chronos) sirve para decidir si conviene entrenar un modelo específico o usar un modelo preentrenado.
- Investigación en forecasting espacio-temporal: el checkpoint incluye configuración y resultados, lo que facilita reproducir experimentos y comparar arquitecturas en el mismo dominio.
- Alimentación de sistemas de alerta temprana: las predicciones de humedad y temperatura a 24 horas pueden integrarse en pipelines de monitorización ambiental o de calidad del aire.
- Baseline para nuevos modelos de la serie PWM-W: las versiones #31 y #34 reutilizan exactamente estos pesos, por lo que sirve como referencia congelada para comparaciones internas.
- Docencia y experimentación con modelos pequeños: con 1,26 M de parámetros y un único fichero de 5,6 MB, es adecuado para entornos con recursos limitados y para demostrar flujos completos de carga, inferencia y evaluación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numéricos en la información disponible. La model card solo recoge el resultado cualitativo del estudio de umbral de datos: aproximadamente 24 meses de historial local para dejar de perder frente a TimesFM/Chronos y aproximadamente 48 meses para superarlos. No se aportan métricas como MAE, RMSE ni comparaciones cuantitativas por variable.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con 1,26 M de parámetros y un checkpoint de 5,6 MB, cabe holgadamente en cualquier GPU consumer e incluso en CPU.
- GPU recomendadas: no se requieren GPU dedicadas; cualquier GPU con al menos unos cientos de MB libres es suficiente. Una RTX 4090, A100 o H100 están sobradamente dimensionadas para este modelo.
- Cabe en GPU consumer: sí, en cualquier modelo actual (e incluso en placas integradas o ejecución en CPU).
- Opciones de despliegue: carga directa con PyTorch mediante `torch.load` y `huggingface_hub.hf_hub_download`; el autor no documenta soporte para vLLM, llama.cpp, Ollama ni TGI (herramientas orientadas a modelos de lenguaje, no aplicables aquí).
- Latencia y throughput estimados: no disponibles; al ser un modelo de forecasting de 24 h con 1,26 M de parámetros, la inferencia es previsiblemente del orden de milisegundos en CPU, pero no se aportan cifras medidas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / horizonte | Licencia | Disponibilidad |
|---|---|---|---|---|
| PWM-X v0.9 (este modelo) | 1.260.997 | 24 h de predicción | Apache-2.0 | Hugging Face (checkpoint `.pt`) |
| TimesFM | no disponible en la información | no disponible | no disponible | referenciado como baseline por el autor |
| Chronos | no disponible en la información | no disponible | no disponible | referenciado como baseline por el autor |

La model card menciona TimesFM y Chronos como referencias de comparación, pero no incluye sus especificaciones ni resultados numéricos frente a PWM-X. No se dispone de datos suficientes para una comparativa cuantitativa detallada.

## Limitaciones y advertencias

- Ámbito geográfico restringido: entrenado con datos de la India (Delhi, estaciones WMO y aeropuertos indios); su validez fuera de esa región no está documentada.
- Horizonte limitado: solo predice las próximas 24 horas de temperatura, humedad y viento; no cubre otras variables ni horizontes mayores.
- Documentación incompleta: la arquitectura no se describe en la model card y no se publican métricas de error (MAE, RMSE) ni comparaciones cuantitativas.
- Estado "reported": el autor marca el modelo como reportado, no como validado de forma independiente; no hay descargas ni likes que permitan inferir uso externo.
- Riesgo de sobreajuste a las estaciones y al periodo de entrenamiento: al entrenarse con un conjunto concreto de estaciones y un historial local acotado, el rendimiento puede degradarse con datos nuevos o estaciones no vistas.
- Datos de entrenamiento no incluidos: solo se documentan las fuentes y sus términos en `DATA_SOURCES.md`, lo que dificulta la reproducción completa.
- Licencia Apache-2.0: permite uso comercial, pero conviene revisar los términos de las fuentes de datos originales (CPCB/DPCC, NOAA ISD, METAR) antes de desplegar en producción.
- Sin garantías de calibración en producción: no se documentan intervalos de incertidumbre ni evaluación en dominios distintos al de entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/PARADOXAIlabs/pwm-x-cpcb
- Repositorio GitHub (arquitectura y registro): https://github.com/paradoxailab/paradox-world-model
- Registro de la versión (branch delhi-v0.8): https://github.com/paradoxailab/paradox-world-model/blob/delhi-v0.8/README.md
- Índice de la serie de modelos: https://github.com/paradoxailab/paradox-world-model/blob/main/models/series/README.md
- Fuentes de datos y términos: https://github.com/paradoxailab/paradox-world-model/blob/main/DATA_SOURCES.md
- Citación (CITATION.cff): https://github.com/paradoxailab/paradox-world-model/blob/main/CITATION.cff
- Modelo anterior (#28 PWM-W Weather v0.8): https://huggingface.co/PARADOXAIlabs/pwm-w-weather-v0.8-cpcb
- Modelo siguiente (#30 PWM-W v0.9 live): https://huggingface.co/PARADOXAIlabs/pwm-w-live-v0.9
- Serie completa en Hugging Face: https://huggingface.co/PARADOXAIlabs/paradox-world-model-series
- Sitio del autor: https://paradoxailab.com
