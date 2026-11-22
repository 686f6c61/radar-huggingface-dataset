# PARADOXAIlabs/pwm-w-weather-v0.5-metar

## Resumen

PWM-W Weather v0.5 es un modelo de prediccion meteorologica espacio-temporal de muy pequeno tamano (932.348 parametros) desarrollado por ParadoxAI Lab dentro de su serie Paradox World Model. El modelo aborda la prediccion de las proximas 24 horas de temperatura, humedad y viento a partir de informes METAR de seis aeropuertos de la India, incluyendo Delhi Palam. Se trata del modelo numero 25 de una serie de 56 publicados (numeracion 01-59) y forma parte de la familia PWM-W, dedicada a la prediccion meteorologica y de calidad del aire.

El modelo no es un LLM sino un predictor de series temporales con arquitectura espacio-temporal implementada en PyTorch. Su relevancia reside en el enfoque de "world model" aplicado a datos meteorologicos: en lugar de un modelo generativo de texto, se trata de un modelo de correccion de predicciones globales que incorpora variables como nubosidad, radiacion, punto de rocio, presion y direccion del viento. La version 0.5 anade precisamente mas predictores de modelo global para la correccion respecto a la version 0.4.

El checkpoint se distribuye como un unico fichero `.pt` de 3.945.293 bytes que contiene el state dict de pesos, la configuracion de entrenamiento (`ck['cfg']`), metadatos y los resultados registrados. El modelo se entreno el 7 de noviembre de 2026 en Kaggle (run `pwm-weather-v05-metar`) y se publico el 17 de noviembre de 2026 bajo licencia Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo espacio-temporal de prediccion; codigo en repositorio GitHub) |
| Parametros totales | 932.348 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (prediccion de horizonte fijo de 24 h) |
| Tipos de cuantizacion | no disponible (checkpoint PyTorch en precision nativa) |
| Idiomas soportados | no disponible (modelo numerico, no linguistico) |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch `.pt` (state dict via `torch.load`) |

## Arquitectura y entrenamiento

La model card no detalla la arquitectura interna; indica que el codigo de arquitectura para esta version esta en el repositorio de GitHub (rama `delhi-v0.5`) y que la configuracion de entrenamiento se almacena dentro del propio fichero en la clave `ck['cfg']`. Por los tags y la descripcion se trata de un modelo espacio-temporal de prediccion (spatiotemporal forecasting) orientado a series temporales meteorologicas, no de un transformer autoregresivo de texto. El tamano de 932.348 parametros sugiere una red compacta, probablemente MLP o red recurrente/convolucional de correccion sobre predictores de modelos globales.

Los datos de entrenamiento son informes METAR de seis aeropuertos de la India, incluyendo Delhi Palam. La version 0.5 incorpora mas predictores de modelo global para la correccion: nubosidad, radiacion, punto de rocio, presion y direccion del viento. No se especifica el numero de tokens ni la composicion detallada del dataset; los datos de entrenamiento no se incluyen en el repositorio y sus fuentes y terminos se documentan en `DATA_SOURCES.md` del repositorio GitHub. No se menciona el uso de RLHF, DPO ni tecnicas de alineacion (no aplicables a este tipo de modelo).

## Capacidades

- Prediccion de las proximas 24 horas de temperatura, humedad y viento.
- Correccion de predicciones de modelos globales mediante predictores adicionales (nubosidad, radiacion, punto de rocio, presion, direccion del viento).
- Modelado espacio-temporal sobre multiples estaciones (seis aeropuertos indios).
- Inferencia sobre datos METAR como entrada.
- Carga directa del checkpoint en PyTorch con acceso a metadatos, configuracion y resultados registrados.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso (no es un LLM).
- No dispone de capacidades multilingues, vision, audio ni modo de razonamiento extendido.

## Casos de uso

- Prediccion operativa a corto plazo en aeropuertos: el modelo genera las proximas 24 h de temperatura, humedad y viento a partir de informes METAR, util para planificacion de operaciones en pista y gestion de condiciones meteorologicas adversas en los seis aerodromos cubiertos.
- Correccion de salidas de modelos meteorologicos globales: al incorporar predictores como nubosidad, radiacion y punto de rocio, puede usarse como capa de post-proceso que ajusta la prediccion global a las condiciones locales de cada estacion.
- Monitorizacion de calidad del aire: los tags incluyen `air-quality`, de modo que el modelo puede integrarse en pipelines que relacionen variables meteorologicas (viento, humedad) con dispersion de contaminantes en entornos urbanos como Delhi.
- Investigacion en modelos del mundo (world models): su tamano reducido (menos de 1 M de parametros) lo hace adecuado como banco de pruebas para experimentar con arquitecturas espacio-temporales y estrategias de correccion en series meteorologicas.
- Despliegue en dispositivos con recursos limitados: con 932.348 parametros y un checkpoint de menos de 4 MB, puede ejecutarse en CPU o en hardware embebido dentro de estaciones meteorologicas o gateways de borde.
- Reproducibilidad y auditoria de experimentos: el fichero incluye metadatos, configuracion y todos los resultados registrados (`ck['results']`), lo que permite reproducir y auditar el run de entrenamiento en entornos de investigacion.
- Educacion y prototipado rapido: sirve como ejemplo completo de pipeline de prediccion de series temporales con datos METAR reales para cursos o talleres de machine learning aplicado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite los resultados registrados a la rama `delhi-v0.5` del repositorio GitHub y al campo `ck['results']` del checkpoint, pero no incluye cifras numericas (MAE, RMSE u otras metricas) en el texto proporcionado.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 100 MB; el checkpoint ocupa 3,9 MB y el modelo tiene 932.348 parametros, por lo que cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM (GTX 1050, RTX 3050, RTX 4090, A100, H100); tambien funciona en CPU.
- Cabe en GPU consumer: si, en practicamente cualquier modelo actual e incluso en hardware embebido.
- Opciones de despliegue: carga directa con PyTorch (`torch.load` + state dict); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles en la informacion proporcionada; por el tamano del modelo se espera inferencia en milisegundos en CPU.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de la misma categoria (prediccion meteorologica espacio-temporal a partir de METAR) ni datos de rendimiento que permitan una comparacion rigurosa. El unico pariente documentado es el propio modelo previo de la serie, PWM-W Weather v0.4 (variante WMO), que la version 0.5 sustituye anadiendo mas predictores de modelo global.

## Limitaciones y advertencias

- Cobertura geografica muy restringida: entrenado unicamente con METAR de seis aeropuertos de la India; no se garantiza su validez fuera de esas estaciones.
- Horizonte fijo de 24 h y solo tres variables objetivo (temperatura, humedad, viento); no cubre otras variables meteorologicas.
- Modelo de 932.348 parametros: capacidad limitada para capturar fenomenos extremos o no estacionarios.
- No se publican metricas de error en la model card; los resultados deben consultarse en la rama `delhi-v0.5` del repositorio antes de usarlo en produccion.
- Los datos de entrenamiento no se distribuyen; conviene revisar `DATA_SOURCES.md` para verificar terminos de uso de las fuentes METAR.
- Licencia Apache-2.0: permite uso comercial, pero el autor no ofrece garantias ni soporte; el estado del modelo figura como "see branch", lo que sugiere que puede no estar finalizado.
- Riesgo de deriva (drift): al ser un modelo de correccion sobre predictores globales, su rendimiento depende de la calidad y disponibilidad de esos predictores en tiempo de inferencia.
- Sin documentacion sobre sesgos, calibracion de incertidumbre ni evaluacion en condiciones meteorologicas extremas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/PARADOXAIlabs/pwm-w-weather-v0.5-metar
- Repositorio GitHub (codigo de arquitectura y registros): https://github.com/paradoxailab/paradox-world-model
- Rama del registro de esta version: https://github.com/paradoxailab/paradox-world-model/blob/delhi-v0.5/README.md
- Indice de la serie completa: https://github.com/paradoxailab/paradox-world-model/blob/main/models/series/README.md
- Fuentes y terminos de los datos: https://github.com/paradoxailab/paradox-world-model/blob/main/DATA_SOURCES.md
- Cita del modelo: https://github.com/paradoxailab/paradox-world-model/blob/main/CITATION.cff
- Version anterior (#24, v0.4 WMO): https://huggingface.co/PARADOXAIlabs/pwm-w-weather-v0.4-wmo
- Version siguiente (#26, v0.6 CPCB): https://huggingface.co/PARADOXAIlabs/pwm-w-weather-v0.6-cpcb
- Listado de la serie en Hugging Face: https://huggingface.co/PARADOXAIlabs/paradox-world-model-series
- Sitio del laboratorio: https://paradoxailab.com
