# PARADOXAIlabs/pwm-w-weather-v0.3-cpcb

## Resumen

PWM-W Weather v0.3 (league run) es un modelo de prediccion espacio-temporal de variables meteorologicas desarrollado por ParadoxAI Lab (Aditya Kumar, Anupam Singh) dentro de su serie Paradox World Model. Se trata del modelo numero 21 de los 56 publicados en la serie, y en esta version da el salto desde la calidad del aire (modelo previo, Delhi v0.2) hacia la prediccion meteorologica pura: temperatura, humedad y viento en estaciones.

El modelo resuelve una tarea concreta: predecir las proximas 24 horas de temperatura, humedad y viento en estaciones meteorologicas. A diferencia de los modelos globales de prediccion meteorologica con los que compite, PWM-W es un "station-only world model": opera exclusivamente sobre datos de estaciones, en este caso las 25 estaciones de la red CPCB/DPCC de Delhi.

Es relevante por su escala extrema (932.348 parametros, menos de un millon) frente a los modelos globales de IA meteorologica, y por su enfoque de modelado del mundo aplicado a series temporales. El checkpoint se entreno el 7 de noviembre de 2026 en Kaggle (pwm-weather-league-gpu) y se publico el 17 de noviembre de 2026 bajo licencia Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (codigo en repositorio GitHub del autor; configuracion en `ck['cfg']`) |
| Parametros totales | 932.348 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (horizonte de prediccion: 24 horas) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (modelo de series temporales, sin procesamiento de lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch checkpoint (`.pt`, state dict serializado con `torch.load`) |

## Arquitectura y entrenamiento

La model card no detalla la arquitectura interna. Se describe como un "world model" espacio-temporal ("paradox-world-model", familia PWM-W) orientado a forecasting sobre estaciones. El codigo de arquitectura de esta version esta en el repositorio GitHub del autor (rama `delhi-v0.3`), y la configuracion exacta de entrenamiento esta almacenada en el propio checkpoint (`ck['cfg']`). El checkpoint contiene un state dict de PyTorch (`ck['weights']`), metadatos (`ck['meta']`) y todos los resultados registrados junto con los logs de ejecucion (`ck['results']`).

Los datos de entrenamiento son meteorologia de estaciones de la red CPCB/DPCC de Delhi (25 estaciones). El modelo se entreno el 7 de noviembre de 2026 en el entorno Kaggle `pwm-weather-league-gpu`. Los datos de entrenamiento no se distribuyen con el modelo; sus fuentes y terminos se documentan en `DATA_SOURCES.md` del repositorio. No se especifica en la informacion disponible el numero de tokens, la composicion exacta del dataset ni si se emplearon tecnicas de RLHF/DPO (poco probables en un modelo de forecasting de este tamano).

## Capacidades

- Prediccion de las proximas 24 horas de temperatura en estaciones meteorologicas.
- Prediccion de las proximas 24 horas de humedad en estaciones meteorologicas.
- Prediccion de las proximas 24 horas de viento en estaciones meteorologicas.
- Modelado espacio-temporal: incorpora dependencias entre estaciones (25 estaciones de la red CPCB/DPCC de Delhi).
- Enfoque "station-only": prediccion a nivel de estacion, no en rejilla global.
- Participacion en una "liga" comparativa contra modelos globales de IA meteorologica (resultados en el paper-weather, seccion v0.3).
- No dispone de soporte de tool calling, agentes, vision, audio ni capacidades multilingues: es un modelo de series temporales, no un modelo de lenguaje.

## Casos de uso

- Prediccion meteorologica local a corto plazo en Delhi: el modelo genera las proximas 24 horas de temperatura, humedad y viento a partir del estado de las 25 estaciones CPCB/DPCC, adecuado para boletines locales de alta frecuencia.
- Investigacion comparativa de modelos de IA meteorologica: sirve como referencia "station-only" de menos de un millon de parametros frente a modelos globales en rejilla, util para estudiar el coste/beneficio de ambos enfoques.
- Prototipado rapido y docencia: con 932.348 parametros y un unico fichero de 3,87 MB, se puede cargar en CPU (`map_location="cpu"`) para experimentar con pipelines de forecasting sin infraestructura GPU.
- Estudio de modelado del mundo aplicado a series temporales: la serie Paradox World Model publica checkpoints, configuraciones y resultados registrados, lo que permite reproducir y auditar el entrenamiento.
- Analisis de microclima urbano: al operar sobre estaciones concretas de Delhi, permite estudiar variaciones locales de temperatura y humedad entre puntos de la ciudad.
- Base para extensiones a otras redes de estaciones: el pipeline (carga del checkpoint, metadatos, configuracion en `ck['cfg']`) es reutilizable para entrenar variantes sobre otras redes de sensores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite a los resultados de la "weather league" contra modelos globales de IA meteorologica, recogidos en el paper-weather (seccion v0.3) y en los logs almacenados en `ck['results']`, pero no se incluyen cifras numericas en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con 932.348 parametros, el checkpoint pesa 3.868.981 bytes (aproximadamente 3,87 MB), por lo que cabe holgadamente en cualquier GPU consumer e incluso en CPU.
- GPU recomendadas: no se especifican; cualquier GPU con soporte PyTorch es suficiente. El propio ejemplo de carga usa `map_location="cpu"`.
- Cabe en GPU consumer: si, en cualquier modelo (RTX 3060, RTX 4090, etc.), y en CPU.
- Opciones de despliegue: PyTorch nativo mediante `torch.load` y `huggingface_hub.hf_hub_download`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / horizonte | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PWM-W Weather v0.3 (league run) | 932.348 | 24 h | Station-only (25 estaciones CPCB/DPCC Delhi) | Apache-2.0 | Hugging Face |
| PWM-W Delhi v0.2 (modelo #20 de la serie) | No disponible | No disponible | Calidad del aire (version previa) | No disponible en la informacion | Hugging Face |
| PWM-W Weather v0.3 (WMO) (modelo #22 de la serie) | No disponible | No disponible | Weather (variante WMO) | No disponible en la informacion | Hugging Face |
| Modelos globales de IA meteorologica | No disponible | No disponible | Prediccion global en rejilla | No disponible | No disponible |

No se dispone de datos numericos de rendimiento para establecer una comparativa cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- Ambito geografico restringido: entrenado exclusivamente con meteorologia de estaciones de Delhi (red CPCB/DPCC, 25 estaciones); su uso fuera de ese contexto no esta validado.
- Horizonte limitado: prediccion de las proximas 24 horas; no esta disenado para plazos mayores.
- Variables limitadas: solo temperatura, humedad y viento; no cubre precipitacion, presion ni otras variables.
- Enfoque station-only: no genera predicciones en rejilla global, por lo que no es directamente comparable con modelos globales de IA meteorologica en su formato nativo.
- Riesgo de alucinacion: no aplica en el sentido de generacion de texto, pero existe riesgo de predicciones poco fiables fuera del dominio de entrenamiento o ante datos de entrada anomalos.
- Sesgos conocidos: no documentados en la informacion disponible; cabe esperar sesgos derivados de la cobertura y calidad de la red de estaciones de Delhi.
- Idiomas: no aplica; el modelo no procesa lenguaje natural.
- Licencia Apache-2.0: permite uso comercial, pero los datos de entrenamiento no se distribuyen y sus terminos se remiten a `DATA_SOURCES.md`; conviene revisarlos antes de un uso en produccion.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema de validacion practicamente inexistente; la fiabilidad debe contrastarse con el paper y los resultados registrados en el checkpoint.
- La model card indica "Status: see paper" y no incluye cifras de rendimiento; no se deben asumir resultados sin consultar el paper-weather y los logs.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/PARADOXAIlabs/pwm-w-weather-v0.3-cpcb
- Repositorio GitHub (rama delhi-v0.3): https://github.com/paradoxailab/paradox-world-model/blob/delhi-v0.3/README.md
- Indice de la serie (todos los modelos): https://github.com/paradoxailab/paradox-world-model/blob/main/models/series/README.md
- Fuentes y terminos de los datos: https://github.com/paradoxailab/paradox-world-model/blob/main/DATA_SOURCES.md
- Citacion (CITATION.cff): https://github.com/paradoxailab/paradox-world-model/blob/main/CITATION.cff
- Modelo anterior (#20 PWM-W Delhi v0.2): https://huggingface.co/PARADOXAIlabs/pwm-w-delhi-v0.2
- Modelo siguiente (#22 PWM-W Weather v0.3 WMO): https://huggingface.co/PARADOXAIlabs/pwm-w-weather-v0.3-wmo
- Coleccion de la serie: https://huggingface.co/PARADOXAIlabs/paradox-world-model-series
- Sitio del autor: https://paradoxailab.com
