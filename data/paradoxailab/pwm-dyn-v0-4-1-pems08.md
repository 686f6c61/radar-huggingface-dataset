# paradoxailab/pwm-dyn-v0.4.1-pems08

## Resumen

PWM-Dyn v0.4.1 (variante PEMS08) es un modelo de prediccion de series temporales espacio-temporales desarrollado por ParadoxAI Lab (Aditya Kumar y Anupam Singh) dentro de su serie Paradox World Model. Se trata del modelo numero 5 de una serie de 56 publicados y resuelve una tarea muy concreta: predecir los siguientes 12 pasos de flujo de trafico a partir de datos de sensores viarios. El modelo es extremadamente compacto (318.148 parametros) y se distribuye como un unico checkpoint de PyTorch de aproximadamente 1,3 MB.

La relevancia de este modelo es acotada y experimental. No es un modelo de lenguaje generalista, sino un predictor especializado en una unica tarea y un unico conjunto de datos: PEMS08, correspondiente al distrito 8 de Caltrans (San Bernardino, California), con 170 sensores y datos de julio a agosto de 2016. Su interes reside en su tamano minimo, su licencia permisiva (Apache-2.0) y su integracion en un marco de evaluacion propio (ParadoxBench-1, Track A y Track B), mas que en capacidades de proposito general.

La version v0.4.1 ajusta la receta de entrenamiento respecto a la v0.4, seleccionada sobre la validacion de PEMS08 con 100 epocas. El resultado registrado es un MAE de 14,50 en el test de ParadoxBench-1 Track A usando un ensemble de 3 semillas (el archivo publicado corresponde a la semilla 0). No se dispone de informacion sobre arquitectura interna, composicion del dataset de entrenamiento ni idiomas soportados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de prediccion espacio-temporal; codigo en repositorio GitHub del autor) |
| Parametros totales | 318.148 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (tarea fija: prediccion de los siguientes 12 pasos) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo linguistico) |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch (`.pt`, checkpoint con claves `meta`, `weights`, `results`, `cfg`) |

## Arquitectura y entrenamiento

La informacion proporcionada no detalla la arquitectura interna del modelo. La model card indica que el codigo de arquitectura de esta version se encuentra en el repositorio GitHub de Paradox World Model y que la configuracion de entrenamiento esta almacenada dentro del propio checkpoint en la clave `ck['cfg']`. Por los tags y la tarea, se trata de un modelo de prediccion espacio-temporal (spatiotemporal forecasting) orientado a series temporales de trafico, pero no se especifica si emplea grafos, convoluciones, mecanismos de atencion u otra familia de arquitecturas.

El entrenamiento se realizo el 2026-11-01 en un notebook de Kaggle (identificador `ab27dd6f3e`, version 364348754) y el modelo se publico el 2026-11-17. Los datos de entrenamiento corresponden a PEMS08 (Caltrans PeMS District 8, San Bernardino; 170 sensores; julio-agosto de 2016) y no se incluyen en el repositorio; sus fuentes y terminos se documentan en `DATA_SOURCES.md`. La receta de entrenamiento se selecciono sobre la validacion de PEMS08 con 100 epocas. No se indica el numero de tokens ni la composicion exacta del dataset, ni si hubo tecnicas de ajuste tipo RLHF o DPO (poco probables en un modelo de esta naturaleza).

## Capacidades

- Prediccion de los siguientes 12 pasos de flujo de trafico a partir de datos de sensores de PEMS08.
- Modelado espacio-temporal de series temporales multivariantes (170 sensores).
- Evaluacion bajo el marco propio ParadoxBench-1 (Track A y Track B).
- Distribucion como ensemble: el resultado registrado corresponde a un ensemble de 3 semillas; el archivo publicado es la semilla 0.
- Carga directa en PyTorch mediante `torch.load` con `weights_only=False`, exponiendo metadatos, pesos, resultados y configuracion.
- No dispone de generacion de texto, razonamiento, codigo, matematicas, vision, tool calling, capacidades de agente ni soporte multilingue.

## Casos de uso

- Prediccion de trafico a corto plazo en corredores viarios: el modelo estima los 12 pasos siguientes de flujo en los 170 sensores de PEMS08, util para sistemas de gestion de trafico que necesitan previsiones a horizonte corto.
- Investigacion en forecasting espacio-temporal: sirve como baseline reproducible y de tamano minimo (318.148 parametros) para comparar metodos en el conjunto PEMS08.
- Reproduccion de resultados de ParadoxBench-1: permite replicar el MAE registrado (14,50 en Track A) cargando el checkpoint y ejecutando la evaluacion descrita en el repositorio.
- Despliegue en entornos con recursos muy limitados: su tamano (1,3 MB) permite ejecucion en CPU o en dispositivos de borde sin GPU, adecuado para prototipos o pruebas de concepto.
- Docencia y experimentacion: modelo de bajo coste computacional para ilustrar pipelines de entrenamiento, validacion y evaluacion de series temporales.
- Integracion en pipelines de investigacion comparativa: al publicarse con licencia Apache-2.0 y formato PyTorch estandar, puede incorporarse en estudios que comparen modelos de prediccion de trafico.

## Benchmarks y rendimiento

| Benchmark | Metrica | Resultado | Notas |
|---|---|---|---|
| ParadoxBench-1 Track A (test) | MAE | 14,50 | Ensemble de 3 semillas; el archivo publicado es la semilla 0 |
| ParadoxBench-1 Track B (PEMS08) | Metrica no especificada | 14,15 | Valor tras el cambio de receta en v0.4.1 (antes 14,38) |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ya que el modelo no es un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB; el checkpoint ocupa 1.299.775 bytes y el modelo tiene 318.148 parametros, por lo que cabe holgadamente en cualquier GPU consumer e incluso en CPU.
- GPU recomendadas: no requiere GPU dedicada; cualquier GPU moderna (RTX 4090, A100, H100) es sobredimensionada para este modelo. Ejecucion viable en CPU.
- Cabe en GPU consumer: si, en cualquier modelo actual e incluso en hardware embebido.
- Opciones de despliegue: carga directa con PyTorch (`torch.load`) segun el ejemplo de la model card. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de la misma categoria ni datos de rendimiento de alternativas sobre PEMS08.

## Limitaciones y advertencias

- Modelo altamente especializado: solo predice flujo de trafico sobre PEMS08 (170 sensores, julio-agosto de 2016); no es generalizable a otros dominios sin reentrenamiento.
- No es un modelo de lenguaje: carece de capacidades de generacion de texto, razonamiento, codigo o vision.
- El resultado registrado (MAE 14,50) corresponde a un ensemble de 3 semillas, mientras que el archivo publicado es solo la semilla 0; el rendimiento individual puede diferir del registrado.
- No se detalla la arquitectura interna ni la composicion exacta del dataset de entrenamiento en la informacion disponible, lo que limita la auditabilidad.
- Riesgo de sobreajuste al conjunto PEMS08 y a la ventana temporal concreta (julio-agosto de 2016); no hay evidencia de validacion fuera de ese periodo.
- Los datos de entrenamiento no se incluyen en el repositorio; sus fuentes y terminos se documentan aparte en `DATA_SOURCES.md`.
- Licencia Apache-2.0: permite uso comercial, pero conviene verificar los terminos de los datos de origen (Caltrans PeMS) antes de un despliegue en produccion.
- Sin descargas ni likes en el momento de la consulta; ecosistema y validacion externa practicamente inexistentes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/paradoxailab/pwm-dyn-v0.4.1-pems08
- Repositorio GitHub: https://github.com/paradoxailab/paradox-world-model
- Resultados (RESULTS.md): https://github.com/paradoxailab/paradox-world-model/blob/main/RESULTS.md
- Documentacion ParadoxBench: https://github.com/paradoxailab/paradox-world-model/blob/main/v0.4-paradoxbench/README.md
- Indice de la serie: https://github.com/paradoxailab/paradox-world-model/blob/main/models/series/README.md
- Fuentes de datos (DATA_SOURCES.md): https://github.com/paradoxailab/paradox-world-model/blob/main/DATA_SOURCES.md
- Citacion (CITATION.cff): https://github.com/paradoxailab/paradox-world-model/blob/main/CITATION.cff
- Modelo anterior (#04): https://huggingface.co/paradoxailab/pwm-dyn-v0.4-imd_west_coast
- Modelo siguiente (#06): https://huggingface.co/paradoxailab/pwm-dyn-v0.4.1-pems04
- Serie completa: https://huggingface.co/paradoxailab/paradox-world-model-series
- Sitio del autor: https://paradoxailab.com
