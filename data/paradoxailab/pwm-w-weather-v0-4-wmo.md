# paradoxailab/pwm-w-weather-v0.4-wmo

## Resumen

PWM-W Weather v0.4 (variante WMO) es un modelo de predicción meteorológica espacio-temporal desarrollado por ParadoxAI Lab, publicado el 17 de noviembre de 2026 como parte de su serie Paradox World Model (modelo 24 de 56). El modelo resuelve la predicción de las próximas 24 horas de temperatura, humedad y viento a partir de datos de estaciones sinópticas de la Organización Meteorológica Mundial (WMO) en India, procedentes del conjunto NOAA ISD. Con 932.348 parámetros, es un modelo de escala muy reducida orientado a series temporales, no un modelo de lenguaje.

La relevancia de esta versión radica en la incorporación de una corrección híbrida aprendida y la regla de emisión previa al inicio del horizonte de predicción. Según los datos registrados por el autor, en configuración híbrida con datos METAR supera a ECMWF AIFS en un 4,4 % en temperatura. Es importante señalar que los pesos publicados contienen únicamente el modelo entrenado por ParadoxAI Lab; los modelos externos utilizados en el esquema híbrido no se incluyen en el repositorio.

La ficha se basa exclusivamente en la model card y los metadatos disponibles. No hay información publicada sobre arquitectura interna, composición detallada del dataset ni resultados numéricos completos de benchmarks más allá de la referencia al registro del repositorio de GitHub.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de series temporales espacio-temporales; código en repositorio GitHub) |
| Parametros totales | 932.348 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (horizonte de predicción de 24 horas) |
| Tipos de cuantizacion | no disponible (pesos en punto flotante PyTorch) |
| Idiomas soportados | no aplica (modelo numérico de predicción meteorológica) |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch `.pt` (checkpoint con claves `meta`, `weights`, `results`, `cfg`) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo. Se describe como un modelo espacio-temporal de predicción de series temporales, con código de arquitectura alojado en el repositorio GitHub de Paradox World Model y configuración de entrenamiento almacenada en el propio checkpoint bajo la clave `ck['cfg']`. El modelo tiene 932.348 parámetros y fue entrenado el 7 de noviembre de 2026 en un entorno Kaggle (`pwm-weather-v04-gpu`).

Los datos de entrenamiento provienen de estaciones sinópticas WMO en India, extraídos del conjunto NOAA ISD. Los datos brutos no se incluyen en el repositorio; sus fuentes y términos se documentan en `DATA_SOURCES.md`. La innovación principal de esta versión es un esquema de corrección híbrida aprendida junto con la regla de emisión previa al inicio del horizonte de predicción (issued-before-start rule). No se especifica el volumen de tokens ni la composición exacta del dataset, ni si se aplicaron técnicas de RLHF o DPO (no aplicables en este dominio).

## Capacidades

- Predicción de temperatura, humedad y viento para las próximas 24 horas.
- Modelado espacio-temporal sobre estaciones sinópticas WMO en India.
- Corrección híbrida aprendida que puede combinarse con salidas de modelos externos (por ejemplo, METAR) en un esquema de ensemble.
- Aplicación de la regla de emisión previa al inicio del horizonte para evitar fuga de información futura.
- No soporta tool calling, function calling ni razonamiento multi-paso en el sentido de los modelos de lenguaje.
- No dispone de capacidades multilingües, de visión ni de audio.
- No se documentan modos especiales como thinking mode.

## Casos de uso

- Predicción meteorológica operativa a corto plazo en India: el modelo genera las próximas 24 horas de temperatura, humedad y viento a partir de observaciones de estaciones WMO, adecuado para boletines locales de bajo coste computacional.
- Corrección de sesgo de modelos numéricos: puede emplearse como capa de corrección híbrida sobre salidas de modelos externos, aprovechando la mejora registrada frente a ECMWF AIFS en temperatura.
- Relleno de huecos en series de observación: con 932.348 parámetros, es viable ejecutarlo en CPU para imputar valores faltantes en estaciones sinópticas.
- Investigación en modelos espacio-temporales ligeros: sirve como referencia reproducible (checkpoint con configuración y resultados embebidos) para estudiar correcciones híbridas y reglas de emisión.
- Prototipado de pipelines de forecasting en entornos con recursos limitados: el tamaño del checkpoint (3,8 MB) permite despliegue en contenedores pequeños o dispositivos edge.
- Evaluación comparativa de metodologías de ensemble: al documentarse el esquema híbrido con METAR, puede usarse como componente en estudios de combinación de pronósticos.
- Docencia y reproducción de experimentos: la inclusión de `results` y logs en el checkpoint facilita la verificación de resultados por terceros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente registra que, en configuración híbrida con METAR, supera a ECMWF AIFS en un 4,4 % en temperatura, y remite al README de la rama `delhi-v0.4` del repositorio GitHub para la tabla completa de la liga WMO. No se proporcionan cifras de MMLU, HumanEval, GSM8K ni métricas meteorológicas estándar (RMSE, MAE) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB; el checkpoint ocupa 3.848.989 bytes y el modelo tiene 932.348 parámetros, por lo que cabe holgadamente en cualquier GPU consumer e incluso en CPU.
- GPU recomendadas: no se requieren GPU dedicadas; cualquier GPU con al menos 1 GB de memoria es suficiente. Una RTX 4090, A100 o H100 está sobredimensionada para este modelo.
- Cabe en GPU consumer: sí, en cualquier modelo actual (GTX 1050 en adelante) y en CPU.
- Opciones de despliegue: carga directa con PyTorch (`torch.load`); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a este tipo de modelo.
- Latencia y throughput estimados: no disponibles. Dado el tamaño, se espera latencia de milisegundos en CPU, pero no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / horizonte | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PWM-W Weather v0.4 WMO | 932.348 | 24 h | -4,4 % temp frente a ECMWF AIFS en modo híbrido METAR (según autor) | Apache-2.0 | Hugging Face |
| PWM-W Weather v0.4 CPCB (#23) | no disponible | 24 h | no disponible | Apache-2.0 | Hugging Face |
| PWM-W Weather v0.5 METAR (#25) | no disponible | 24 h | no disponible | Apache-2.0 | Hugging Face |
| ECMWF AIFS | no disponible | no disponible | referencia de comparación citada por el autor | no disponible | ECMWF |

No se dispone de datos suficientes para comparar con modelos meteorológicos de mayor escala (GraphCast, Pangu-Weather, FourCastNet) en parámetros, contexto o rendimiento dentro de la información proporcionada.

## Limitaciones y advertencias

- Ámbito geográfico restringido a estaciones sinópticas WMO en India; no se garantiza su validez fuera de esa región.
- Horizonte limitado a 24 horas; no está diseñado para predicción a medio o largo plazo.
- El resultado destacado (-4,4 % en temperatura frente a ECMWF AIFS) corresponde a un esquema híbrido con modelos externos que no se incluyen en el repositorio; reproducir esa cifra requiere acceso a dichos modelos y a los datos METAR.
- Los datos de entrenamiento no se publican; solo se documentan sus fuentes y términos, lo que dificulta la auditoría completa.
- No hay información publicada sobre sesgos, calibración ni tasas de error absolutas (RMSE/MAE), por lo que no puede evaluarse su fiabilidad operativa.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta; no hay validación independiente conocida.
- Aunque la licencia es Apache-2.0 y permite uso comercial, la ausencia de datos de entrenamiento y de métricas verificables aconseja precaución antes de usarlo en producción crítica.
- No es un modelo de lenguaje: no debe esperarse generación de texto, razonamiento ni soporte conversacional.

## Enlaces

- Hugging Face: https://huggingface.co/paradoxailab/pwm-w-weather-v0.4-wmo
- Repositorio GitHub (arquitectura y registro): https://github.com/paradoxailab/paradox-world-model
- Registro de la versión (rama delhi-v0.4): https://github.com/paradoxailab/paradox-world-model/blob/delhi-v0.4/README.md
- Índice de la serie: https://github.com/paradoxailab/paradox-world-model/blob/main/models/series/README.md
- Fuentes de datos: https://github.com/paradoxailab/paradox-world-model/blob/main/DATA_SOURCES.md
- Citación: https://github.com/paradoxailab/paradox-world-model/blob/main/CITATION.cff
- Versión anterior (#23): https://huggingface.co/paradoxailab/pwm-w-weather-v0.4-cpcb
- Versión siguiente (#25): https://huggingface.co/paradoxailab/pwm-w-weather-v0.5-metar
- Serie completa: https://huggingface.co/paradoxailab/paradox-world-model-series
- Sitio del autor: https://paradoxailab.com
