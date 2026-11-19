# paradoxailab/pwm-w-live-v0.9

## Resumen

PWM-W v0.9 live es un modelo de predicción de series temporales desarrollado por ParadoxAI Lab (Aditya Kumar, Anupam Singh) dentro de su serie Paradox World Model, concretamente el modelo número 29 de los 56 publicados en la serie numerada 01–59. Su tarea específica es la generación de pronósticos meteorológicos en tiempo real a 24 horas para estaciones situadas en la India, un caso de uso de forecasting espaciotemporal aplicado a calidad del aire y meteorología.

El modelo es extremadamente compacto: 985.853 parámetros, lo que lo sitúa en la categoría de modelos ligeros diseñados para inferencia rápida y despliegue en entornos con recursos limitados. Se distribuye como un checkpoint PyTorch (`.pt`) de aproximadamente 4 MB que contiene tanto los pesos como la configuración de entrenamiento (`ck['cfg']`), los metadatos y los resultados registrados de la ejecución.

La relevancia de esta versión radica en que introduce los primeros pronósticos en tiempo real para la India dentro de la familia PWM-W, entrenada el 9 de noviembre de 2026 y publicada el 17 de noviembre de 2026. El modelo se apoya en datos de estaciones del CPCB/DPCC de Delhi, estaciones sinópticas WMO vía NOAA ISD y reportes METAR de seis aeropuertos indios, incluido Delhi Palam.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (se describe como "Paradox World Model", código en repositorio GitHub) |
| Parámetros totales | 985.853 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch state dict (`.pt`) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo más allá de su pertenencia a la familia "Paradox World Model" y su etiqueta de modelo espaciotemporal. El código de arquitectura de esta versión se encuentra en el repositorio de GitHub del proyecto, y la configuración exacta de entrenamiento está embebida en el propio checkpoint bajo la clave `ck['cfg']`. No se especifican el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO, algo esperable en un modelo de forecasting y no de lenguaje.

Los datos de entrenamiento proceden de tres fuentes declaradas: meteorología de estaciones CPCB/DPCC de Delhi (25 estaciones), estaciones sinópticas WMO en la India a través de NOAA ISD, y reportes METAR de seis aeropuertos indios, incluido Delhi Palam. El entrenamiento se realizó el 9 de noviembre de 2026 en un entorno Kaggle identificado como `pwm-v09-live`. Los datos de entrenamiento no se distribuyen con el modelo; sus fuentes y términos se documentan en `DATA_SOURCES.md` del repositorio.

## Capacidades

- Pronóstico meteorológico a 24 horas en tiempo real para estaciones de la India.
- Forecasting espaciotemporal sobre datos de múltiples estaciones (25 estaciones CPCB/DPCC de Delhi).
- Integración de fuentes heterogéneas: meteorología de superficie, observaciones sinópticas y reportes de aeropuerto (METAR).
- Predicción orientada a calidad del aire y variables meteorológicas asociadas.
- Inferencia ligera: el checkpoint completo ocupa unos 4 MB y puede cargarse en CPU.
- No se documentan capacidades de generación de texto, código, matemáticas, visión, tool calling ni razonamiento multi-paso; no es un modelo de lenguaje.

## Casos de uso

- Pronóstico operativo de calidad del aire en Delhi: el modelo genera predicciones a 24 horas para las 25 estaciones CPCB/DPCC, lo que permite a gestores ambientales anticipar episodios de contaminación y activar protocolos de alerta.
- Predicción meteorológica en aeropuertos: al entrenarse con reportes METAR de seis aeropuertos indios, puede emplearse para anticipar condiciones de visibilidad y viento relevantes para operaciones aeroportuarias.
- Relleno de series y monitorización de sensores: su tamaño reducido permite ejecutarlo junto a los sensores para detectar desviaciones entre observación y predicción como señal de fallo o evento anómalo.
- Investigación en modelos espaciotemporales ligeros: sirve como referencia reproducible (configuración embebida en el checkpoint) para estudiar forecasting con menos de un millón de parámetros.
- Despliegue en entornos con recursos limitados: al caber en CPU y ocupar 4 MB, puede integrarse en dispositivos edge o servicios de bajo coste sin GPU.
- Prototipado de pipelines de forecasting regional: permite validar rápidamente la cadena de datos NOAA ISD/METAR/CPCB antes de escalar a modelos mayores de la serie.
- Benchmarking interno de la familia PWM: al ser el primer modelo con pronósticos en tiempo real para la India, sirve de línea base frente a versiones posteriores como PWM-W v1.0.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card remite a "see paper" y a la rama `delhi-v0.8` del repositorio para los resultados completos, pero no se incluyen cifras numéricas en los datos proporcionados.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB; con 985.853 parámetros en precisión completa el modelo pesa unos 4 MB, por lo que cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: no se requieren; cualquier GPU moderna (RTX 4090, A100, H100) ejecutaría la inferencia con latencia despreciable, pero el modelo está diseñado para funcionar en CPU.
- Cabe en cualquier GPU consumer e incluso en CPU y dispositivos edge.
- Opciones de despliegue: carga directa con PyTorch (`torch.load`); no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría (forecasting espaciotemporal de estaciones meteorológicas) con parámetros, contexto o rendimiento verificables.

## Limitaciones y advertencias

- Cobertura geográfica restringida: el modelo está entrenado específicamente con datos de la India (Delhi y seis aeropuertos), por lo que su uso fuera de ese ámbito no está validado.
- Estado "v0.9 live": se trata de una versión preliminar de la serie, con resultados pendientes de publicación en el paper asociado.
- Ausencia de benchmarks públicos: no hay métricas verificables en la model card, lo que dificulta evaluar su precisión real frente a alternativas.
- Datos de entrenamiento no distribuidos: la reproducibilidad completa depende de las fuentes externas documentadas en `DATA_SOURCES.md`.
- Riesgo de degradación ante cambios de distribución: al ser un modelo de forecasting entrenado con datos históricos, puede perder precisión si las condiciones meteorológicas o la red de sensores cambian.
- Licencia Apache-2.0: permite uso comercial y modificación, pero conviene revisar los términos de las fuentes de datos originales (CPCB/DPCC, NOAA ISD, METAR) antes de un despliegue productivo.
- No es un modelo de lenguaje: no debe emplearse para tareas de generación de texto, razonamiento o código.

## Enlaces

- [Hugging Face: paradoxailab/pwm-w-live-v0.9](https://huggingface.co/paradoxailab/pwm-w-live-v0.9)
- [Repositorio GitHub del proyecto](https://github.com/paradoxailab/paradox-world-model)
- [Record de la versión (rama delhi-v0.8)](https://github.com/paradoxailab/paradox-world-model/blob/delhi-v0.8/README.md)
- [Índice de la serie de modelos](https://github.com/paradoxailab/paradox-world-model/blob/main/models/series/README.md)
- [Fuentes de datos (DATA_SOURCES.md)](https://github.com/paradoxailab/paradox-world-model/blob/main/DATA_SOURCES.md)
- [CITATION.cff](https://github.com/paradoxailab/paradox-world-model/blob/main/CITATION.cff)
- [Modelo anterior: PWM-X (v0.9)](https://huggingface.co/paradoxailab/pwm-x-cpcb)
- [Modelo siguiente: PWM-W v1.0](https://huggingface.co/paradoxailab/pwm-w-v1.0-metar)
- [Todos los modelos de la serie](https://huggingface.co/paradoxailab/paradox-world-model-series)
- [Sitio web de ParadoxAI Lab](https://paradoxailab.com)
