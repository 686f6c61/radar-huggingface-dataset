# paradoxailab/pwm-w-delhi-v0.2

## Resumen

PWM-W Delhi v0.2 es un modelo de predicción de series temporales espaciotemporales especializado en la previsión de PM2.5 (material particulado fino) a 24 horas vista en la red de estaciones de calidad del aire de Delhi. Lo desarrolla ParadoxAI Lab (Aditya Kumar y Anupam Singh) dentro de su serie Paradox World Model, y ocupa la posición número 20 de un total de 56 modelos publicados. Con 1.060.076 parámetros, es un modelo de escala muy reducida cuyo diseño no busca competir en capacidad bruta, sino actuar como capa de corrección sobre modelos fundacionales de forecasting (Chronos-2 y TimesFM 2.5) incorporando la estructura de grafo de las estaciones de medición.

El modelo aborda un problema concreto: la predicción de contaminación atmosférica en entornos urbanos densos, donde los modelos genéricos de series temporales no explotan la dependencia espacial entre estaciones vecinas. La versión v0.2 introduce contexto largo (72 horas más 14 medias diarias), pronósticos meteorológicos del día anterior procedentes de Open-Meteo y un esquema híbrido que combina su salida con las predicciones de los modelos fundacionales externos.

Es relevante por su enfoque de bajo coste computacional aplicado a un dominio de alto impacto sanitario, y por documentar de forma explícita el proceso (pesos, configuración, resultados y logs incluidos en el propio checkpoint). No obstante, su ámbito es muy específico: una única ciudad, un único contaminante y una única tarea de predicción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo híbrido sobre grafo de estaciones; el código está en el repositorio GitHub, no detallado en la model card) |
| Parametros totales | 1.060.076 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 72 horas de serie horaria más 14 medias diarias (ventana de entrada) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo numérico de series temporales) |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch (`.pt`, checkpoint con claves `meta`, `weights`, `results`, `cfg`) |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna más allá de calificarla de híbrida y de indicar que corrige las predicciones de Chronos-2 y TimesFM 2.5 utilizando el grafo de estaciones. El código de arquitectura reside en el repositorio GitHub del proyecto y la configuración exacta de entrenamiento está embebida en el checkpoint bajo la clave `ck['cfg']`. El tamaño de 1.060.076 parámetros sugiere un modelo compacto, probablemente una red sobre grafo (GNN) o un transformer ligero que opera sobre las 39 estaciones como nodos.

Los datos de entrenamiento proceden de los informes horarios de calidad del aire de Delhi de OpenCity (CPCB, 39 estaciones continuas de monitorización ambiental) y de pronósticos meteorológicos del día anterior de Open-Meteo. El entrenamiento se realizó el 6 de noviembre de 2026 en Kaggle (ejecución `pwm-delhi-v02-pm25`) y el modelo se publicó el 17 de noviembre de 2026. No se especifican en la información disponible el número de tokens, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO (poco habituales en forecasting numérico). Los datos de entrenamiento no se distribuyen con el modelo; sus fuentes y términos están en `DATA_SOURCES.md`.

## Capacidades

- Predicción de PM2.5 a 24 horas vista para la red de estaciones de Delhi.
- Modelado espaciotemporal: incorpora explícitamente el grafo de 39 estaciones de monitorización.
- Contexto largo: utiliza 72 horas de observaciones horarias más 14 medias diarias como entrada.
- Integración de variables exógenas meteorológicas: consume pronósticos de Open-Meteo del día anterior.
- Funcionamiento híbrido: su salida está diseñada para combinarse con las predicciones de Chronos-2 y TimesFM 2.5.
- Salida numérica de series temporales; no genera texto, código ni realiza tool calling.
- No soporta agentes, razonamiento multi-paso, visión ni audio.
- No tiene capacidades multilingües (no procesa lenguaje natural).

## Casos de uso

- Predicción operativa de calidad del aire en Delhi: generar pronósticos de PM2.5 a 24 horas para las 39 estaciones CPCB, permitiendo a autoridades sanitarias emitir alertas con antelación sobre episodios de contaminación.
- Corrección de modelos fundacionales de series temporales: usar el modelo como capa de post-proceso sobre Chronos-2 o TimesFM 2.5 para incorporar la dependencia espacial entre estaciones que los modelos genéricos ignoran.
- Sistemas de alerta temprana sanitaria: integrar las predicciones en plataformas de salud pública que activen recomendaciones para poblaciones vulnerables cuando se prevén picos de PM2.5.
- Investigación en contaminación atmosférica urbana: analizar la propagación espacial de partículas entre estaciones y validar hipótesis sobre fuentes de emisión locales.
- Planificación de movilidad y actividades al aire libre: alimentar aplicaciones ciudadanas que recomienden horarios o rutas según la calidad del aire prevista.
- Evaluación comparativa de modelos de forecasting: servir como referencia de bajo coste (1,06 M de parámetros) frente a modelos fundacionales de mayor tamaño en tareas espaciotemporales concretas.
- Prototipado en entornos con recursos limitados: su tamaño reducido permite desplegarlo en CPU o GPU de gama baja para experimentación rápida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica que los resultados están registrados en la rama `delhi-v0.2` del repositorio GitHub (README) y en la clave `ck['results']` del checkpoint, pero no se reproducen en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 (1.060.076 parámetros, aproximadamente 4,3 MB de pesos en el fichero `.pt`); en la práctica, el modelo cabe holgadamente en cualquier GPU consumer e incluso en CPU.
- GPU recomendadas: no requiere GPU dedicada; cualquier GPU moderna (RTX 3060 o superior, A100, H100) es sobredimensionada para este modelo.
- Cabe en GPU consumer: sí, en cualquier GPU consumer e incluso en Raspberry Pi o entornos CPU-only.
- Opciones de despliegue: carga directa con PyTorch (`torch.load`) y `huggingface_hub`; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles; por el tamaño del modelo se espera latencia de milisegundos en CPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PWM-W Delhi v0.2 | 1.060.076 | 72 h + 14 medias diarias | PM2.5 Delhi 24 h (híbrido) | Apache-2.0 | Hugging Face |
| Chronos-2 | no disponible | no disponible | Forecasting general de series temporales | no disponible | no disponible |
| TimesFM 2.5 | no disponible | no disponible | Forecasting general de series temporales | no disponible | no disponible |
| PWM-W Delhi v0.1 | no disponible | no disponible | PM2.5 Delhi (versión previa) | Apache-2.0 | Hugging Face |

Chronos-2 y TimesFM 2.5 son los modelos fundacionales sobre los que opera este modelo en modo híbrido; no se dispone de sus especificaciones detalladas en la información proporcionada. La comparación con ellos no es directa: PWM-W Delhi v0.2 está especializado en una ciudad y un contaminante, mientras que los fundacionales son genéricos.

## Limitaciones y advertencias

- Ámbito muy restringido: solo predice PM2.5 en Delhi; no es transferible sin reentrenamiento a otras ciudades, contaminantes o variables.
- Dependencia de modelos externos: el modo híbrido requiere Chronos-2 y TimesFM 2.5, que no se incluyen en el repositorio; sin ellos, el rendimiento puede diferir del registrado.
- Datos de entrenamiento no distribuidos: la reproducibilidad completa depende de las fuentes externas (OpenCity, Open-Meteo) y de sus términos de uso.
- Resultados no verificables desde la model card: las métricas están en la rama GitHub y en el checkpoint, pero no se reproducen en la información disponible.
- Riesgo de deriva: los patrones de contaminación cambian con políticas, tráfico y clima; un modelo entrenado en 2026 puede degradarse con el tiempo sin reentrenamiento.
- Sin documentación sobre sesgos: no se detalla el comportamiento en estaciones con datos faltantes o de baja calidad.
- Licencia Apache-2.0: permite uso comercial, pero el usuario debe verificar los términos de las fuentes de datos subyacentes.
- Sin soporte de cuantización documentado ni herramientas de despliegue estándar: la integración en producción requiere trabajo de ingeniería propio.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema de usuarios muy limitado, sin validación comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/paradoxailab/pwm-w-delhi-v0.2
- Repositorio GitHub: https://github.com/paradoxailab/paradox-world-model
- Registro de la versión (rama delhi-v0.2): https://github.com/paradoxailab/paradox-world-model/blob/delhi-v0.2/README.md
- Índice de la serie: https://github.com/paradoxailab/paradox-world-model/blob/main/models/series/README.md
- Fuentes de datos: https://github.com/paradoxailab/paradox-world-model/blob/main/DATA_SOURCES.md
- Citación: https://github.com/paradoxailab/paradox-world-model/blob/main/CITATION.cff
- Modelo anterior (v0.1): https://huggingface.co/paradoxailab/pwm-w-delhi-v0.1
- Modelo siguiente (v0.3): https://huggingface.co/paradoxailab/pwm-w-weather-v0.3-cpcb
- Todos los modelos de la serie: https://huggingface.co/paradoxailab/paradox-world-model-series
- Sitio del laboratorio: https://paradoxailab.com
