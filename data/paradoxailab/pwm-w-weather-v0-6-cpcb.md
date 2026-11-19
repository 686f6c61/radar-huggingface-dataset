# paradoxailab/pwm-w-weather-v0.6-cpcb

## Resumen

PWM-W Weather v0.6 es un modelo de prediccion meteorologica espacio-temporal desarrollado por ParadoxAI Lab (Aditya Kumar, Anupam Singh) como parte de su serie Paradox World Model. Concretamente, es el modelo numero 26 de los 56 publicados dentro de la familia PWM-W, y resuelve la tarea de predecir las proximas 24 horas de temperatura, humedad y viento a partir de datos de estaciones meteorologicas. Se entrenó sobre meteorologia de 25 estaciones CPCB/DPCC de Delhi, complementada con estaciones sinopticas WMO de India (NOAA ISD).

A diferencia de los modelos de lenguaje, se trata de un modelo neuronal muy compacto de 932.348 parametros, empaquetado como un checkpoint de PyTorch (`state_dict`) de aproximadamente 4,1 MB. Su relevancia radica en que demuestra que modelos de pronostico de tamano reducido, entrenables en hardware modesto (el autor indica un run de Kaggle), pueden acercarse al rendimiento de modelos fundacionales de series temporales como Chronos-2 o TimesFM 3.0, aunque segun la propia model card aun queda un 4-7% por debajo en el conjunto de test.

La version v0.6 se distingue de la v0.5 por incorporar la red WMO mas amplia al entrenamiento. La model card reporta una validacion de 0,4735 frente a 0,4922 de la version anterior (descripcion del autor: "about 5 sigma better"), si bien no se especifica la metrica exacta empleada. El modelo se distribuye bajo licencia Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (red neuronal espacio-temporal; codigo en repositorio GitHub del autor) |
| Parametros totales | 932.348 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (horizonte de prediccion: 24 horas) |
| Tipos de cuantizacion | no disponible (checkpoint PyTorch en coma flotante; no se documentan variantes GGUF/AWQ) |
| Idiomas soportados | no disponible (modelo numerico de series temporales; no procesa texto) |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch (`state_dict` dentro de un `.pt` con claves `meta`, `weights`, `results`, `cfg`) |

## Arquitectura y entrenamiento

La model card no detalla la arquitectura interna mas alla de describirla como un modelo espacio-temporal de pronostico; el codigo de la arquitectura concreta de esta version esta en la rama `delhi-v0.6` del repositorio GitHub del proyecto. El checkpoint almacena la configuracion de entrenamiento en la clave `ck['cfg']`, de modo que los hiperparametros exactos pueden recuperarse cargando el fichero con PyTorch.

En cuanto a datos, el modelo se entrenó con meteorologia de estaciones CPCB/DPCC de Delhi (25 estaciones) y, como novedad de la v0.6, con la red mas amplia de estaciones sinopticas WMO de India (NOAA ISD). El run de entrenamiento se realizó el 2026-11-08 en Kaggle (`pwm-weather-v06-cpcb`) y el modelo se publicó el 2026-11-17. No se documentan en la informacion disponible el numero de tokens o pasos de entrenamiento, la composicion exacta del dataset, ni si se aplicaron tecnicas de RLHF/DPO (poco probables en un modelo de pronostico numerico). Los datos de entrenamiento no se distribuyen; sus fuentes y terminos se detallan en `DATA_SOURCES.md` del repositorio.

## Capacidades

- Pronostico de las proximas 24 horas de temperatura, humedad y viento a partir de observaciones de estaciones meteorologicas.
- Modelado espacio-temporal: aprovecha la red de estaciones (25 estaciones CPCB/DPCC de Delhi y estaciones WMO de India) para la prediccion.
- Prediccion de series temporales multivariante (pipeline `time-series-forecasting`).
- Integracion con PyTorch: el checkpoint expone el `state_dict` y la configuracion (`cfg`) para reutilizacion e inferencia.
- Trazabilidad de resultados: el fichero incluye en `results` todos los resultados registrados, el texto del record y los logs del run.
- No soporta tool calling, agentes, razonamiento multi-paso, vision, audio ni capacidades multilingues: es un modelo numerico especializado, no un modelo de lenguaje.

## Casos de uso

- Pronostico operativo local de Delhi: el modelo predice temperatura, humedad y viento a 24 horas usando las 25 estaciones CPCB/DPCC, adecuado para boletines meteorologicos de corto plazo en el area metropolitana.
- Relleno de huecos en series de estaciones: al modelar la red espacio-temporal, puede emplearse para estimar observaciones faltantes en estaciones vecinas a partir de las disponibles.
- Investigacion en modelos fundacionales de series temporales: sirve como baseline compacto (menos de 1 M de parametros) para comparar con Chronos-2 o TimesFM 3.0 en tareas de pronostico meteorologico.
- Despliegue en entornos con recursos muy limitados: con un checkpoint de ~4,1 MB, puede ejecutarse en CPU o en GPUs de gama baja, lo que facilita prototipos en dispositivos edge o notebooks.
- Analisis de calidad del aire y meteorologia urbana: la combinacion de datos CPCB (red de vigilancia de contaminacion) con variables meteorologicas permite estudiar la relacion entre condiciones atmosfericas y episodios de contaminacion en Delhi.
- Extension a la red nacional india: al entrenar tambien con estaciones WMO (NOAA ISD), puede aplicarse a pronosticos en otras regiones de India cubiertas por dicha red.
- Reproducibilidad y auditoria: al incluir configuracion, resultados y logs en el propio fichero, es util para validar experimentos y reproducir el run de entrenamiento.

## Benchmarks y rendimiento

| Metrica | PWM-W Weather v0.6 | PWM-W Weather v0.5 | Chronos-2 / TimesFM 3.0 |
|---|---|---|---|
| Validacion | 0,4735 | 0,4922 | no disponible |
| Test | 4-7% por debajo de Chronos-2 / TimesFM 3.0 (segun el autor) | no disponible | referencia |

No se especifica en la informacion disponible la metrica exacta empleada (podria ser MAE, RMSE u otra) ni los valores numericos de test frente a los modelos fundacionales. No se han publicado resultados adicionales de benchmarks (MMLU, HumanEval, GSM8K u otros, no aplicables a este tipo de modelo) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB; el checkpoint ocupa ~4,1 MB y el modelo tiene 932.348 parametros, por lo que cabe holgadamente en cualquier GPU consumer e incluso en CPU.
- GPU recomendadas: cualquier GPU con al menos ~1 GB de memoria; no requiere A100, H100 ni RTX 4090. Una GTX 1050, RTX 3050 o incluso inferencia en CPU son suficientes.
- Cabe en GPU consumer: si, en practicamente todas las GPU modernas y en la mayoria de integradas.
- Opciones de despliegue: al ser un checkpoint PyTorch puro, se carga con `torch.load` y se sirve con un script propio de Python; no se documenta soporte nativo para vLLM, llama.cpp, Ollama o TGI (herramientas orientadas a modelos de lenguaje).
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; por el tamano del modelo se espera latencia de milisegundos en CPU y GPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / horizonte | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PWM-W Weather v0.6 | 932.348 | 24 h de pronostico | Validacion 0,4735; 4-7% por debajo de Chronos-2/TimesFM 3.0 en test | Apache-2.0 | Hugging Face (checkpoint PyTorch) |
| Chronos-2 | no disponible | no disponible | Referencia superior en test segun el autor | no disponible en la informacion | no disponible en la informacion |
| TimesFM 3.0 | no disponible | no disponible | Referencia superior en test segun el autor | no disponible en la informacion | no disponible en la informacion |
| PWM-W Weather v0.5 | no disponible | 24 h de pronostico | Validacion 0,4922 | Apache-2.0 | Hugging Face (version anterior de la serie) |

No se dispone de datos detallados de parametros, contexto ni licencia de Chronos-2 y TimesFM 3.0 en la informacion proporcionada; solo se citan como referencias de rendimiento en la model card.

## Limitaciones y advertencias

- Cobertura geografica limitada: entrenado principalmente con estaciones de Delhi y la red WMO de India; su uso fuera de esa region no esta validado.
- Rendimiento inferior a los modelos fundacionales: segun el propio autor, queda un 4-7% por debajo de Chronos-2 y TimesFM 3.0 en test.
- Metrica no especificada: la model card reporta valores de validacion (0,4735) sin indicar que metrica es, lo que dificulta la comparacion rigurosa.
- Horizonte fijo de 24 horas: no esta documentado soporte para horizontes mayores.
- Modelo muy pequeno: con 932.348 parametros, su capacidad de generalizacion ante regimenes meteorologicos no vistos es limitada.
- Sin datos de entrenamiento publicados: no se pueden auditar sesgos de muestreo ni la representatividad de las estaciones; los terminos de las fuentes estan en `DATA_SOURCES.md`.
- Sin informacion sobre sesgos, alucinacion (no aplica en sentido estricto al ser un modelo numerico, pero si el riesgo de predicciones erroneas no calibradas) ni evaluaciones independientes.
- Licencia Apache-2.0: permite uso comercial, pero el autor no ofrece garantias ni soporte; conviene revisar los terminos de las fuentes de datos (NOAA ISD, CPCB/DPCC) para usos derivados.
- Version v0.7 comparte pesos con esta v0.6 (no se almacena dos veces), por lo que no debe tratarse como un modelo distinto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/paradoxailab/pwm-w-weather-v0.6-cpcb
- Repositorio GitHub del proyecto: https://github.com/paradoxailab/paradox-world-model
- Rama del registro de esta version: https://github.com/paradoxailab/paradox-world-model/blob/delhi-v0.6/README.md
- Indice de la serie completa: https://github.com/paradoxailab/paradox-world-model/blob/main/models/series/README.md
- Fuentes y terminos de los datos: https://github.com/paradoxailab/paradox-world-model/blob/main/DATA_SOURCES.md
- Citacion: https://github.com/paradoxailab/paradox-world-model/blob/main/CITATION.cff
- Version anterior (v0.5): https://huggingface.co/paradoxailab/pwm-w-weather-v0.5-metar
- Version siguiente (v0.8): https://huggingface.co/paradoxailab/pwm-w-weather-v0.8-cpcb
- Todos los modelos de la serie: https://huggingface.co/paradoxailab/paradox-world-model-series
- Sitio del autor: https://paradoxailab.com
