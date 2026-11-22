# PARADOXAIlabs/pwm-w-weather-v0.3-wmo

## Resumen

PWM-W Weather v0.3 (league run) es un modelo de prediccion meteorologica espacio-temporal desarrollado por ParadoxAI Lab, enmarcado en su serie Paradox World Model (modelo 22 de 56 publicados). El modelo resuelve la prediccion de las proximas 24 horas de temperatura, humedad y viento en estaciones meteorologicas concretas, utilizando como fuente de datos las estaciones sinopticas de la Organizacion Meteorologica Mundial (WMO) en India, extraidas del conjunto NOAA ISD. Se trata de un modelo especifico de estacion ("station-only world model"), en contraposicion a los modelos meteorologicos globales de IA contra los que compite en la denominada "weather league".

La relevancia del modelo reside en su escala extrema: con solo 932.348 parametros, propone un enfoque de prediccion localizada por estacion que contrasta con los grandes modelos fundacionales del clima. Esta version v0.3 supone un cambio de dominio respecto a la version anterior de la familia, pasando de calidad del aire a meteorologia. El checkpoint se distribuye como un unico fichero PyTorch de 3.788.253 bytes que incluye pesos, configuracion, metadatos y registros de resultados.

No se dispone de informacion publica sobre arquitectura detallada, longitud de contexto, tokenizador ni composicion exacta del dataset de entrenamiento mas alla de la fuente declarada. El modelo se publica bajo licencia Apache-2.0 y fue entrenado el 7 de noviembre de 2026 en una instancia de Kaggle (pwm-weather-league-gpu), con publicacion el 17 de noviembre de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo espacio-temporal de la familia PWM-W; codigo en repositorio GitHub) |
| Parametros totales | 932.348 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (prediccion de horizonte fijo de 24 h) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo numerico de series temporales, no linguistico) |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch (.pt, state dict serializado con `torch.load`) |

## Arquitectura y entrenamiento

La model card no detalla la arquitectura interna. Se describe como un "station-only world model" de la familia PWM-W, orientado a forecasting espacio-temporal sobre estaciones sinopticas. El codigo de arquitectura se encuentra en el repositorio GitHub del proyecto (rama `delhi-v0.3`), y la configuracion exacta de entrenamiento queda embebida en el propio checkpoint bajo la clave `ck['cfg']`. El modelo tiene 932.348 parametros y fue entrenado en una unica sesion el 7 de noviembre de 2026 en Kaggle (pwm-weather-league-gpu).

Los datos de entrenamiento provienen de estaciones sinopticas WMO en India, a traves de NOAA ISD. Los datos no se distribuyen con el modelo; sus fuentes y terminos se documentan en `DATA_SOURCES.md` del repositorio. No se especifica el numero de tokens, la ventana temporal de entrenamiento, ni si se aplicaron tecnicas de RLHF, DPO o similares (no aplicables en principio a un modelo de regresion/forecasting). La tarea declarada es la prediccion de las proximas 24 horas de temperatura, humedad y viento a nivel de estacion.

## Capacidades

- Prediccion de temperatura a horizonte de 24 horas en estaciones meteorologicas.
- Prediccion de humedad a horizonte de 24 horas en estaciones meteorologicas.
- Prediccion de viento a horizonte de 24 horas en estaciones meteorologicas.
- Modelado espacio-temporal entre estaciones (segun la etiqueta `spatiotemporal` de la model card).
- Forecasting de series temporales como tarea principal (`pipeline_tag: time-series-forecasting`).
- Carga directa en PyTorch mediante `torch.load` con acceso a pesos (`ck['weights']`), metadatos (`ck['meta']`), configuracion (`ck['cfg']`) y resultados registrados (`ck['results']`).
- No se documentan capacidades de generacion de texto, codigo, vision, audio, tool calling ni razonamiento multi-paso.

## Casos de uso

- Prediccion local de temperatura a 24 h para una estacion concreta: el modelo toma el estado reciente de la estacion y devuelve la prevision de temperatura para las proximas 24 horas, util para servicios meteorologicos locales con recursos computacionales minimos.
- Prediccion de humedad relativa en estaciones agricolas: integrable en sistemas de riego que ajustan el calendario segun la humedad prevista a un dia vista.
- Estimacion de viento a corto plazo para operaciones de campo: planificacion de trabajos al aire libre, izado de cargas o despliegue de infraestructura temporal con una ventana de 24 h.
- Benchmark de referencia en investigacion de modelos meteorologicos: al ser un modelo de 932.348 parametros con registro de resultados publico, sirve como linea base ligera frente a modelos globales de IA en la "weather league".
- Prototipado rapido en entornos con GPU limitada: el checkpoint de 3,8 MB se carga en CPU y permite iterar sobre pipelines de forecasting sin infraestructura dedicada.
- Docencia y reproduccion cientifica: el formato del checkpoint (pesos, configuracion y registros en un unico fichero) facilita la reproduccion de experimentos y la comparacion de resultados en cursos o articulos.
- Integracion en pipelines de validacion de datos meteorologicos: contraste de observaciones de estaciones WMO frente a predicciones para deteccion de anomalias o sensores defectuosos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite a un articulo ("paper-weather", seccion v0.3) y al registro del repositorio GitHub (rama `delhi-v0.3`) para los resultados de la "weather league" contra modelos meteorologicos globales de IA, pero no se incluyen cifras en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB; el checkpoint completo ocupa 3,8 MB y el modelo tiene 932.348 parametros, por lo que cabe holgadamente en cualquier GPU consumer e incluso en CPU.
- GPU recomendadas: cualquier GPU con soporte PyTorch (GTX 1060 en adelante, RTX 3060/4090, A100, H100); no requiere aceleradores de gama alta.
- Cabe en GPU consumer: si, en todas las GPU consumer modernas e integradas con soporte CUDA o incluso en modo CPU.
- Opciones de despliegue: carga directa con PyTorch (`torch.load`); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput estimados: no disponibles; dada la escala del modelo, la inferencia deberia ser del orden de milisegundos, pero no se aportan mediciones.

## Comparativa con modelos similares

No se dispone de datos de rendimiento ni de especificaciones de los modelos comparables citados en la model card (modelos meteorologicos globales de IA de la "weather league") en la informacion proporcionada. La comparacion se limita a lo declarado por el autor.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PWM-W Weather v0.3 (league run) | 932.348 | no disponible | no disponible | Apache-2.0 | Hugging Face |
| PWM-W Weather v0.3 (CPCB, modelo #21) | no disponible | no disponible | no disponible | Apache-2.0 | Hugging Face |
| PWM-W Weather v0.4 (CPCB, modelo #23) | no disponible | no disponible | no disponible | Apache-2.0 | Hugging Face |
| Modelos globales de IA meteorologica (weather league) | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Cobertura geografica limitada: el modelo se entrena exclusivamente con estaciones sinopticas WMO de India; su uso fuera de esa region no esta validado.
- Horizonte fijo de 24 horas: no se documenta soporte para horizontes mas largos ni para resolucion subdiaria.
- Variables limitadas: solo temperatura, humedad y viento; no cubre precipitacion, presion, radiacion ni otras variables meteorologicas.
- Enfoque "station-only": no es un modelo global ni en rejilla; las predicciones son puntuales por estacion y no interpolables directamente a malla.
- Riesgo de sobreajuste a la distribucion de entrenamiento: con 932.348 parametros y una unica sesion de entrenamiento en Kaggle, la generalizacion a anos o regimenes climaticos no vistos no esta documentada.
- Datos de entrenamiento no distribuidos: la reproducibilidad completa depende de acceder a NOAA ISD y a los terminos descritos en `DATA_SOURCES.md`.
- Sesgos conocidos: no documentados; cabe esperar sesgos derivados de la cobertura desigual de estaciones WMO en India.
- Riesgo de alucinacion: no aplica en el sentido linguistico, pero si existe riesgo de predicciones fisicamente inconsistentes fuera del dominio de entrenamiento.
- Licencia Apache-2.0: permite uso comercial y modificacion con atribucion; no se declaran restricciones adicionales.
- Estado del modelo: la model card indica "see paper" en el campo de estado y remite a resultados externos; conviene verificar el articulo antes de uso en produccion.

## Enlaces

- Hugging Face: https://huggingface.co/PARADOXAIlabs/pwm-w-weather-v0.3-wmo
- Repositorio GitHub (rama del modelo): https://github.com/paradoxailab/paradox-world-model/blob/delhi-v0.3/README.md
- Indice de la serie: https://github.com/paradoxailab/paradox-world-model/blob/main/models/series/README.md
- Fuentes de datos: https://github.com/paradoxailab/paradox-world-model/blob/main/DATA_SOURCES.md
- Citacion: https://github.com/paradoxailab/paradox-world-model/blob/main/CITATION.cff
- Modelo anterior (#21): https://huggingface.co/PARADOXAIlabs/pwm-w-weather-v0.3-cpcb
- Modelo siguiente (#23): https://huggingface.co/PARADOXAIlabs/pwm-w-weather-v0.4-cpcb
- Todos los modelos de la serie: https://huggingface.co/PARADOXAIlabs/paradox-world-model-series
- Sitio del laboratorio: https://paradoxailab.com
