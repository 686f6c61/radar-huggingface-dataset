# PARADOXAIlabs/pwm-w-weather-v0.6-cpcb

## Resumen

PWM-W Weather v0.6 es un modelo de predicción de series temporales espacio-temporales desarrollado por ParadoxAI Lab (Aditya Kumar, Anupam Singh) dentro de su serie Paradox World Model, concretamente la entrega número 26 de 56 publicadas. Su tarea es la previsión meteorológica a 24 horas de temperatura, humedad y viento, entrenado con datos de estaciones meteorológicas de la red CPCB/DPCC de Delhi (25 estaciones) y, como novedad en esta versión, con estaciones sinópticas WMO de la India procedentes de NOAA ISD.

El modelo es extremadamente compacto: 932.348 parámetros, con un checkpoint de apenas 4,1 MB en formato PyTorch (`.pt`). No es un modelo de lenguaje ni un transformer generativo de propósito general, sino un modelo especializado de forecasting que se distribuye con su configuración de entrenamiento y sus resultados registrados dentro del propio archivo.

La relevancia de esta versión radica en la ampliación del conjunto de entrenamiento a la red WMO, que según el autor mejora la validación hasta 0,4735 frente a 0,4922 de la versión anterior (diferencia descrita como "aproximadamente 5 sigma"). Aun así, el autor reconoce que sigue por detrás de Chronos-2 y TimesFM 3.0 entre un 4 % y un 7 % en test.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de forecasting espacio-temporal; el código está en el repositorio GitHub del autor) |
| Parámetros totales | 932.348 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (horizonte de predicción de 24 h) |
| Tipos de cuantización | no disponible (checkpoint PyTorch de 4,1 MB; no se publican variantes GGUF ni cuantizadas) |
| Idiomas soportados | no disponible (modelo numérico de series temporales, no lingüístico) |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch state dict dentro de un `.pt` (`26_pwm-w_weather_v0.6_cpcb.pt`, 4.127.029 bytes) |

## Arquitectura y entrenamiento

La model card no detalla la arquitectura interna más allá de describirla como un modelo de forecasting espacio-temporal para la serie PWM-W (Paradox World Model, rama weather). El código de arquitectura específico de esta versión se encuentra en la rama `delhi-v0.6` del repositorio de GitHub del proyecto, y la configuración exacta de entrenamiento está embebida en el propio checkpoint bajo la clave `ck['cfg']`. No se especifican el número de tokens de entrenamiento, la composición exacta del dataset ni si se emplearon técnicas de ajuste tipo RLHF o DPO (poco probables en un modelo de regresión sobre series temporales).

Los datos de entrenamiento combinan la meteorología de estaciones CPCB/DPCC de Delhi (25 estaciones) con estaciones sinópticas WMO de la India (NOAA ISD) como entrenamiento adicional; esta incorporación de la red WMO es precisamente el cambio principal de la v0.6 respecto a la v0.5. El modelo fue entrenado el 8 de noviembre de 2026 en un cuaderno de Kaggle (`pwm-weather-v06-cpcb`) y publicado el 17 de noviembre de 2026. Los datos de entrenamiento no se distribuyen; sus fuentes y términos se documentan en `DATA_SOURCES.md`.

## Capacidades

- Predicción de las próximas 24 horas de temperatura, humedad y viento a partir de observaciones de estaciones meteorológicas.
- Modelado espacio-temporal: aprovecha la red de estaciones (25 en Delhi más estaciones WMO) en lugar de tratar cada serie de forma aislada.
- Forecasting de series temporales multivariante con horizonte fijo de 24 h.
- Distribución autocontenida: el checkpoint incluye metadatos (`meta`), pesos (`weights`), configuración (`cfg`) y todos los resultados registrados (`results`), lo que facilita la auditoría y la reproducibilidad.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües: no es un modelo de lenguaje.

## Casos de uso

- Predicción meteorológica local a corto plazo: alimentar un panel de previsión de 24 h de temperatura, humedad y viento para el área de Delhi usando las observaciones de las 25 estaciones CPCB/DPCC como entrada.
- Investigación en modelos de mundo (world models): servir como componente meteorológico de bajo coste dentro de simulaciones o pipelines de Paradox World Model que necesiten condiciones ambientales dinámicas.
- Baseline reproducible para experimentos de forecasting espacio-temporal: al incluir configuración y resultados en el propio archivo, es útil como punto de comparación en estudios académicos frente a Chronos-2 o TimesFM 3.0.
- Prototipado en entornos con recursos mínimos: con menos de un millón de parámetros y 4,1 MB de checkpoint, puede ejecutarse en CPU o en cualquier GPU consumer sin planificación de VRAM relevante.
- Integración en sistemas de alerta temprana de humedad y viento para agricultura o gestión de infraestructuras en la India, siempre que se acepte su precisión inferior a la de los modelos fundacionales de series temporales.
- Docencia y experimentación: ejemplo compacto y de licencia permisiva para enseñar carga de checkpoints PyTorch con metadatos, evaluación de forecasting y comparación de métricas de validación.

## Benchmarks y rendimiento

| Métrica | PWM-W Weather v0.6 | Referencia |
|---|---|---|
| Validación (métrica no especificada) | 0,4735 | 0,4922 en la versión anterior (v0.5) |
| Test frente a Chronos-2 / TimesFM 3.0 | 4-7 % peor | Chronos-2 y TimesFM 3.0 como referencia |

No se han publicado resultados desglosados por variable (temperatura, humedad, viento) ni por estación en la información disponible. La métrica de validación no se define explícitamente en la model card (valores menores parecen ser mejores, dado que 0,4735 se presenta como mejora sobre 0,4922).

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB; el checkpoint ocupa 4,1 MB y el modelo tiene 932.348 parámetros, por lo que cabe holgadamente en cualquier GPU.
- GPU recomendadas: ninguna en especial; funciona en CPU y en cualquier GPU consumer (RTX 3060, RTX 4090, etc.) sin restricciones prácticas.
- Cabe en GPU consumer: sí, en todas las gamas actuales.
- Opciones de despliegue: carga directa con PyTorch (`torch.load` con `weights_only=False`) y `huggingface_hub.hf_hub_download`; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / horizonte | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PWM-W Weather v0.6 | 932.348 | 24 h | 0,4735 en validación; 4-7 % peor que Chronos-2 / TimesFM 3.0 en test | Apache-2.0 | Hugging Face (PyTorch) |
| Chronos-2 | no disponible | no disponible | Mejor que PWM-W v0.6 en test (referencia del autor) | no disponible | no disponible |
| TimesFM 3.0 | no disponible | no disponible | Mejor que PWM-W v0.6 en test (referencia del autor) | no disponible | no disponible |
| PWM-W Weather v0.5 | no disponible | 24 h | 0,4922 en validación | Apache-2.0 | Hugging Face (versión previa de la serie) |

Los datos de Chronos-2 y TimesFM 3.0 no se detallan en la información proporcionada; solo se citan como referencia comparativa del autor.

## Limitaciones y advertencias

- Precisión inferior a los modelos fundacionales de series temporales: el propio autor reconoce un 4-7 % peor que Chronos-2 y TimesFM 3.0 en test.
- Ámbito geográfico limitado: entrenado con estaciones de Delhi y de la India; su generalización a otras regiones no está documentada.
- Horizonte fijo de 24 h y solo tres variables (temperatura, humedad, viento); no cubre precipitación pese a la etiqueta `rainfall` del repositorio.
- Métrica de validación sin definir explícitamente en la model card, lo que dificulta interpretar el 0,4735 y compararlo con otros trabajos.
- No se publican datos de entrenamiento; solo se documentan sus fuentes y términos en `DATA_SOURCES.md`, lo que limita la reproducibilidad completa.
- Estado "reported" en la model card y cero descargas o likes en Hugging Face: no hay evidencia de uso independiente ni validación externa.
- Licencia Apache-2.0: permite uso comercial y modificación con atribución, sin restricciones adicionales documentadas.
- No es un modelo de lenguaje: no debe evaluarse con benchmarks tipo MMLU, HumanEval o GSM8K, ni emplearse para tareas de texto, código o razonamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/PARADOXAIlabs/pwm-w-weather-v0.6-cpcb
- Repositorio GitHub (rama de esta versión): https://github.com/paradoxailab/paradox-world-model/blob/delhi-v0.6/README.md
- Índice de la serie de modelos: https://github.com/paradoxailab/paradox-world-model/blob/main/models/series/README.md
- Fuentes de datos: https://github.com/paradoxailab/paradox-world-model/blob/main/DATA_SOURCES.md
- Citación: https://github.com/paradoxailab/paradox-world-model/blob/main/CITATION.cff
- Versión anterior (v0.5): https://huggingface.co/PARADOXAIlabs/pwm-w-weather-v0.5-metar
- Versión siguiente (v0.8): https://huggingface.co/PARADOXAIlabs/pwm-w-weather-v0.8-cpcb
- Todos los modelos de la serie: https://huggingface.co/PARADOXAIlabs/paradox-world-model-series
- Sitio del autor: https://paradoxailab.com
