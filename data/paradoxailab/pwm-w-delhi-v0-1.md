# paradoxailab/pwm-w-delhi-v0.1

## Resumen

PWM-W Delhi v0.1 es un modelo de predicción de series temporales espaciotemporales desarrollado por ParadoxAI Lab (Aditya Kumar, Anupam Singh), enmarcado en su serie Paradox World Model (PWM). Concretamente, es el modelo número 19 de los 56 publicados dentro de la familia PWM-W, dedicada a modelar la calidad del aire. Su tarea específica es pronosticar las próximas 24 horas de concentraciones de PM2.5, PM10, NO2 y ozono en las estaciones de medición de Delhi (India).

El modelo es extremadamente compacto: 884.204 parámetros en un único checkpoint de 3,6 MB en formato PyTorch (`.pt`). Se entrenó con datos horarios de 39 estaciones de monitorización continua de la calidad del aire (CPCB Delhi, fuente OpenCity) y se publica bajo licencia Apache-2.0. Su relevancia radica en ser el "primer modelo del mundo con datos reales" de la serie (según el autor), orientado a pronóstico operativo de contaminación atmosférica en una de las ciudades con peores índices de calidad del aire del mundo.

El resultado reportado es un MAE de 32,63 en el test de PM2.5 (media de 3 semillas), que supera a todas las líneas base simples entre un 19 % y un 29 %, pero queda por detrás de TimesFM 3.0 (MAE 29,95) y empata con Chronos. Es, por tanto, un modelo de nicho, ligero y de investigación, más que un competidor de los grandes modelos fundacionales de series temporales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (código en repositorio GitHub; configuración en `ck['cfg']`) |
| Parámetros totales | 884.204 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (horizonte de predicción: 24 horas) |
| Tipos de cuantización | no disponible (checkpoint PyTorch en FP32 presumiblemente; no se documenta) |
| Idiomas soportados | no aplica (modelo numérico de series temporales) |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch `.pt` (state dict serializado con `torch.save`) |

## Arquitectura y entrenamiento

La model card no detalla la arquitectura interna más allá de indicar que se trata de un "world model" espaciotemporal de la familia PWM-W y que el código está disponible en el repositorio GitHub del proyecto. La configuración exacta con la que se entrenó se almacena dentro del propio checkpoint (`ck['cfg']`), pero no se reproduce en la documentación pública. No se especifican el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO (no aplicables, en principio, a un modelo de forecasting numérico).

Los datos de entrenamiento provienen de 39 estaciones de monitorización continua de la calidad del aire de Delhi (CPCB, a través de OpenCity "Delhi Hourly Air Quality Reports"). El entrenamiento se realizó el 6 de noviembre de 2026 en un notebook de Kaggle (identificador `ce65e86211`, ejecutado el 5 y 6 de noviembre de 2026). Los datos de entrenamiento no se distribuyen con el modelo; sus fuentes y términos se documentan en `DATA_SOURCES.md` del repositorio.

## Capacidades

- Pronóstico de series temporales multivariantes: predice las próximas 24 horas de PM2.5, PM10, NO2 y ozono.
- Modelado espaciotemporal: integra información de 39 estaciones de monitorización de Delhi, lo que permite explotar correlaciones entre ubicaciones.
- Forecasting numérico horario: salida de valores continuos de concentración de contaminantes.
- Entrenamiento reproducible: el checkpoint incluye metadatos (`meta`), pesos (`weights`), resultados (`results`) y configuración (`cfg`), lo que facilita la auditoría y reproducción.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un modelo puramente numérico de predicción.

## Casos de uso

- Pronóstico operativo de calidad del aire en Delhi: el modelo genera predicciones a 24 horas de PM2.5, PM10, NO2 y ozono para las estaciones de la red CPCB, lo que permite a autoridades sanitarias emitir alertas tempranas cuando se prevén episodios de contaminación elevada.
- Sistemas de alerta pública: integrado en paneles o aplicaciones ciudadanas, puede anticipar picos de PM2.5 con un día de antelación, ayudando a recomendar restricciones de actividad al aire libre o el uso de mascarillas.
- Planificación de tráfico y movilidad: al prever concentraciones de NO2 y ozono, puede informar políticas de restricción de circulación o de gestión de flotas en zonas con alta densidad de estaciones.
- Investigación en modelos del mundo (world models): sirve como caso de estudio reproducible de un world model espaciotemporal de bajo coste computacional (884 K parámetros), útil para comparar enfoques ligeros frente a modelos fundacionales.
- Evaluación comparativa de baselines: al publicar MAE y resultados frente a TimesFM y Chronos, puede usarse como referencia en estudios que comparen modelos de forecasting ligeros con fundacionales en dominios de calidad del aire.
- Despliegue en entornos con recursos limitados: su tamaño (3,6 MB) permite ejecutarlo en CPU o en dispositivos edge, lo que facilita su integración en estaciones de monitorización o gateways locales sin GPU.
- Educación y docencia: como ejemplo de pipeline completo (descarga desde Hugging Face, carga con `torch.load`, inspección de metadatos y resultados) para cursos de series temporales o aprendizaje automático aplicado.

## Benchmarks y rendimiento

| Modelo | Métrica | Valor |
|---|---|---|
| PWM-W Delhi v0.1 | MAE PM2.5 (test, 3 semillas) | 32,63 |
| TimesFM 3.0 | MAE PM2.5 (test) | 29,95 |
| Chronos | MAE PM2.5 (test) | empate con PWM-W Delhi v0.1 (valor no disponible) |
| Baselines simples | MAE PM2.5 (test) | 19-29 % peor que PWM-W Delhi v0.1 (valores individuales no disponibles) |

No se han publicado resultados de otros benchmarks (MMLU, HumanEval, GSM8K, etc.) en la información disponible, ya que el modelo no es de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB (checkpoint de 3,6 MB y 884.204 parámetros; cabe holgadamente en cualquier GPU, incluso en CPU).
- GPU recomendadas: cualquiera; no requiere GPU dedicada. Funciona en CPU sin problemas.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer (RTX 3060, RTX 4090, etc.) e incluso en dispositivos edge.
- Opciones de despliegue: PyTorch nativo (carga con `torch.load` desde Hugging Face Hub). No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplicables a este tipo de modelo).
- Latencia y throughput estimados: no disponibles en la información proporcionada; dado el tamaño, se espera latencia de milisegundos en CPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / horizonte | MAE PM2.5 (test) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PWM-W Delhi v0.1 | 884.204 | 24 h | 32,63 | Apache-2.0 | Hugging Face |
| TimesFM 3.0 | no disponible | no disponible | 29,95 | no disponible | no disponible |
| Chronos | no disponible | no disponible | empate con PWM-W (valor no disponible) | no disponible | no disponible |

No se dispone de datos de parámetros, contexto ni licencia de TimesFM 3.0 y Chronos en la información proporcionada; la comparación se limita al MAE de PM2.5 reportado por el autor.

## Limitaciones y advertencias

- Rendimiento inferior a TimesFM 3.0 (MAE 29,95 frente a 32,63) y solo empatado con Chronos; no es el estado del arte en su tarea.
- Especialización geográfica: entrenado exclusivamente con datos de Delhi (39 estaciones CPCB); no se garantiza su generalización a otras ciudades o redes de monitorización.
- Horizonte limitado a 24 horas; no se documenta capacidad para pronósticos a más largo plazo.
- Solo cuatro contaminantes (PM2.5, PM10, NO2, ozono); no cubre otros (CO, SO2, etc.).
- Sesgos conocidos: no documentados en la model card; al entrenarse con datos de una red concreta, puede heredar sesgos de cobertura y calidad de las estaciones.
- Riesgo de alucinación: no aplica en el sentido lingüístico, pero sí puede producir predicciones poco fiables en episodios extremos no representados en el entrenamiento.
- Licencia Apache-2.0 permite uso comercial, pero los datos de entrenamiento no se distribuyen y sus términos están en `DATA_SOURCES.md`; conviene revisarlos antes de un uso comercial.
- Modelo de investigación con 0 descargas y 0 likes en el momento de la ficha; sin validación externa independiente.
- No se documentan la arquitectura ni los detalles de entrenamiento en la model card; la reproducibilidad depende del repositorio GitHub y del contenido del checkpoint.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/paradoxailab/pwm-w-delhi-v0.1
- Repositorio GitHub (código de arquitectura): https://github.com/paradoxailab/paradox-world-model
- Registro de la versión (branch delhi-v0.1): https://github.com/paradoxailab/paradox-world-model/blob/delhi-v0.1/README.md
- Índice de la serie: https://github.com/paradoxailab/paradox-world-model/blob/main/models/series/README.md
- Fuentes de datos: https://github.com/paradoxailab/paradox-world-model/blob/main/DATA_SOURCES.md
- Citación: https://github.com/paradoxailab/paradox-world-model/blob/main/CITATION.cff
- Serie completa en Hugging Face: https://huggingface.co/paradoxailab/paradox-world-model-series
- Modelo anterior (#18): https://huggingface.co/paradoxailab/pwm-dyn-v0.7-pems-bay
- Modelo siguiente (#20): https://huggingface.co/paradoxailab/pwm-w-delhi-v0.2
- Sitio web del laboratorio: https://paradoxailab.com
