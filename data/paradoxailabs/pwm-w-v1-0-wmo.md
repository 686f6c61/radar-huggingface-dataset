# PARADOXAIlabs/pwm-w-v1.0-wmo

## Resumen

PWM-W v1.0 (variante `wmo`) es un modelo de prediccion de series temporales espaciotemporales desarrollado por ParadoxAI Lab (Aditya Kumar, Anupam Singh) dentro de la serie Paradox World Model, concretamente el modelo numero 31 de los 56 publicados en la serie. Su tarea es la prediccion de las siguientes 24 horas de temperatura, humedad y viento a partir de datos de estaciones sinopticas de la Organizacion Meteorologica Mundial (WMO) situadas en India, empleando el conjunto NOAA ISD como fuente de datos.

El modelo es de tamano muy reducido: 1.260.997 parametros (aproximadamente 1,26 M). Se distribuye como un checkpoint de PyTorch (`.pt`) de 5.173.083 bytes que contiene el state dict de pesos, la configuracion de entrenamiento (`cfg`), metadatos y los registros de resultados de la ejecucion. No es un modelo de lenguaje ni un transformer generativo de proposito general: es un modelo especializado de forecasting meteorologico regional.

La relevancia de esta ficha es acotada: se trata de una publicacion de investigacion de nicho, con cero descargas y cero likes en el momento de la consulta, sin resultados de rendimiento registrados en la model card y sin arquitectura documentada en la propia pagina de Hugging Face (el codigo remite a un repositorio externo). Es util como referencia para quien siga la serie Paradox World Model o quiera reproducir el pipeline, pero no como componente listo para produccion sin validacion adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no documentada en la model card; el codigo esta en repositorio externo GitHub) |
| Parametros totales | 1.260.997 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de series temporales; ventana de entrada no especificada) |
| Tipos de cuantizacion | no disponible (checkpoint PyTorch en punto flotante; no se publican variantes GGUF ni cuantizadas) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje; la salida son variables meteorologicas numericas) |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch (`.pt`, state dict cargado via `torch.load` con `weights_only=False`) |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna. Indica unicamente que esta version incorpora "self-correction y un ensemble de dos arquitecturas (adoptado solo si mejora en mas de 2 sigma)", lo que sugiere un mecanismo de autocorreccion de predicciones y una combinacion de dos modelos base, pero sin detallar que tipo de redes son (no se confirma si son transformers, redes recurrentes, modelos convolucionales espaciotemporales o grafos neuronales). La configuracion exacta con la que se entreno el modelo esta almacenada en el propio fichero, accesible como `ck['cfg']`.

El entrenamiento se realizo el 2026-11-09 en un entorno de Kaggle identificado como `pwm-v10`, y el modelo se publico el 2026-11-17. Los datos de entrenamiento no se distribuyen con el modelo; sus fuentes y terminos se documentan en `DATA_SOURCES.md` del repositorio. La unica fuente de datos indicada es NOAA ISD (Integrated Surface Database) para estaciones sinopticas WMO en India. No se especifica el numero de tokens, la composicion exacta del dataset, la ventana temporal de entrada ni si hubo tecnicas de regularizacion o validacion cruzada mas alla de la mencionada regla de 2 sigma para el ensemble.

## Capacidades

- Prediccion de las siguientes 24 horas de tres variables meteorologicas: temperatura, humedad y viento.
- Modelado espaciotemporal sobre estaciones sinopticas WMO localizadas en India.
- Ensemble de dos arquitecturas con criterio de adopcion estadistico (mejora superior a 2 sigma).
- Mecanismo de autocorreccion de predicciones (mencionado en la model card, sin detalle tecnico).
- Carga programatica del checkpoint con acceso a pesos, configuracion, metadatos y registros de resultados.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingues: no es un modelo de lenguaje.

## Casos de uso

- Prediccion meteorologica regional a corto plazo en India: el modelo genera las proximas 24 horas de temperatura, humedad y viento para estaciones WMO, lo que permite alimentar paneles de prevision local con horizonte de un dia.
- Investigacion academica sobre modelos espaciotemporales: su tamano de 1,26 M de parametros y su checkpoint abierto lo hacen util como baseline reproducible en experimentos de forecasting comparado.
- Reproduccion de la serie Paradox World Model: permite replicar el pipeline de entrenamiento y evaluacion de la serie, ya que el checkpoint incluye configuracion y registros de ejecucion.
- Prototipado rapido en entornos con recursos limitados: al ser un modelo de ~1,26 M de parametros y 5 MB, se puede ejecutar en CPU sin GPU dedicada, lo que facilita pruebas en portatiles o contenedores ligeros.
- Docencia y formacion en series temporales: sirve como ejemplo practico de ensemble de arquitecturas con criterio estadistico de seleccion (2 sigma) y de autocorreccion de predicciones.
- Integracion en pipelines de validacion meteorologica: puede usarse como modelo secundario para contrastar predicciones de sistemas operativos en estaciones concretas de India.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La propia model card indica explicitamente "no result recorded in the delhi-v1.0 README" en la seccion de resultados. No se dispone de metricas como MAE, RMSE, MMLU, HumanEval ni GSM8K (estas ultimas no aplican a un modelo de forecasting).

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB. El checkpoint ocupa 5.173.083 bytes (~5 MB) y el modelo tiene 1,26 M de parametros, por lo que cabe holgadamente en cualquier GPU consumer e incluso en CPU.
- GPU recomendadas: no se requieren. Cualquier GPU consumer (GTX 1060, RTX 3060, RTX 4090) es mas que suficiente; el modelo puede ejecutarse en CPU.
- Cabe en consumer GPU: si, en cualquier GPU consumer e integrada.
- Opciones de despliegue: carga directa con PyTorch (`torch.load`) e `huggingface_hub`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles. Al tratarse de un modelo de ~1,26 M de parametros, la latencia esperada es de milisegundos en CPU, pero no se publican mediciones.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de la misma categoria (forecasting meteorologico espaciotemporal regional con estaciones WMO en India) ni resultados de rendimiento que permitan una comparacion cuantitativa. Dentro de la propia serie Paradox World Model, el modelo anterior es [#32 PWM-W v1.0 (metar)](https://huggingface.co/PARADOXAIlabs/pwm-w-v1.0-metar) y el siguiente es [#35 PWM-F encoder (India v2.0)](https://huggingface.co/PARADOXAIlabs/pwm-f-encoder-v2.0), pero no se dispone de sus especificaciones ni metricas para tabular una comparacion.

## Limitaciones y advertencias

- Ausencia de resultados registrados: la model card no incluye ninguna metrica de rendimiento, por lo que no es posible evaluar su calidad predictiva sin ejecutar el modelo.
- Arquitectura no documentada en Hugging Face: el codigo esta en un repositorio externo de GitHub y la model card no describe el tipo de red, la ventana de entrada ni el preprocesado, lo que dificulta su reutilizacion directa.
- Cobertura geografica limitada: entrenado exclusivamente con estaciones WMO de India; su extrapolacion a otras regiones no esta validada.
- Horizonte fijo de 24 horas: no se indica soporte para horizontes mayores ni para resolucion subdiaria.
- Sin datos de entrenamiento distribuidos: solo se referencian las fuentes (NOAA ISD) y sus terminos, lo que limita la reproducibilidad completa.
- Riesgo de sesgo por cobertura de estaciones: la densidad y calidad de las estaciones WMO en India puede introducir sesgos regionales en las predicciones.
- Sin garantias de produccion: cero descargas y cero likes, publicacion reciente y ausencia de validacion independiente; no se recomienda su uso operativo sin una evaluacion propia.
- Licencia Apache-2.0: permite uso comercial y modificacion con atribucion, pero el autor no ofrece garantias ni soporte.
- No es un modelo de lenguaje: no debe emplearse para generacion de texto, codigo, razonamiento ni tareas conversacionales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/PARADOXAIlabs/pwm-w-v1.0-wmo
- Repositorio GitHub (codigo de arquitectura): https://github.com/paradoxailab/paradox-world-model
- Registro de la version (branch delhi-v1.0): https://github.com/paradoxailab/paradox-world-model/blob/delhi-v1.0/README.md
- Indice de la serie: https://github.com/paradoxailab/paradox-world-model/blob/main/models/series/README.md
- Fuentes de datos: https://github.com/paradoxailab/paradox-world-model/blob/main/DATA_SOURCES.md
- Citacion: https://github.com/paradoxailab/paradox-world-model/blob/main/CITATION.cff
- Modelo anterior (#32 PWM-W v1.0 metar): https://huggingface.co/PARADOXAIlabs/pwm-w-v1.0-metar
- Modelo siguiente (#35 PWM-F encoder India v2.0): https://huggingface.co/PARADOXAIlabs/pwm-f-encoder-v2.0
- Todos los modelos de la serie: https://huggingface.co/PARADOXAIlabs/paradox-world-model-series
- Sitio web del autor: https://paradoxailab.com
