# paradoxailab/pwm-f-encoder-v2.0

## Resumen

PWM-F encoder (India v2.0) es un codificador de series temporales espacio-temporales desarrollado por ParadoxAI Lab (Aditya Kumar, Anupam Singh) dentro de la familia PWM-W de su Paradox World Model. El modelo resuelve una tarea concreta de prediccion meteorologica: codificar observaciones de estaciones meteorologicas de la India para su uso en modelos de pronostico posteriores. Con 10.538.577 parametros, es un modelo deliberadamente pequeno, orientado a la eficiencia mas que a la escala.

La version 2.0 se entrena sobre datos del NOAA Integrated Surface Database (ISD), cubriendo 187 estaciones indias entre enero de 2015 y noviembre de 2024. La model card registra un error absoluto medio (MAE) en conjunto de validacion de 0,862 grados Celsius en temperatura, 4,80 %RH en humedad relativa y 0,578 m/s en velocidad del viento. Pese a estos resultados, el autor indica explicitamente que el modelo "not adopted" (no adoptado) para el pipeline CPCB, al no superar la validacion interna (0,4620 frente a 0,4597 del modelo de referencia).

Se trata, por tanto, de un artefacto de investigacion publicado como parte de una serie abierta (modelo 32 de 56 de la serie Paradox World Model), con licencia Apache-2.0. Su relevancia es limitada para produccion, pero resulta interesante como referencia reproducible de codificadores ligeros para datos meteorologicos regionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Codificador de series temporales (detalles en repositorio GitHub; no disponibles en la ficha) |
| Parametros totales | 10.538.577 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en punto flotante PyTorch) |
| Idiomas soportados | no disponible (modelo no linguistico; opera sobre variables meteorologicas) |
| Licencia | Apache-2.0 |
| Formato de pesos | `.pt` (PyTorch state dict dentro de un checkpoint con metadatos) |

## Arquitectura y entrenamiento

La model card no detalla la arquitectura interna mas alla de identificarla como codificador de la familia PWM-W y remitir al repositorio de GitHub para el codigo de la version. El checkpoint almacena la configuracion de entrenamiento en la clave `ck['cfg']` y los pesos en `ck['weights']`. El modelo se entrena como pre-entrenamiento a escala de 10 millones de parametros, segun indica la seccion "What changed in this version" (pre-training at 10M).

Los datos de entrenamiento son observaciones de 187 estaciones meteorologicas de la India procedentes del NOAA ISD, con cobertura temporal de enero de 2015 a noviembre de 2024. El entrenamiento se ejecuto en Kaggle (experimento `pwm-v20`) el 9 de noviembre de 2026 y se publico el 17 de noviembre de 2026. No se especifica el numero de tokens, la composicion exacta del dataset ni si se aplicaron tecnicas de ajuste fino como RLHF o DPO; estos datos no estan disponibles en la informacion proporcionada. Los datos de entrenamiento no se distribuyen, aunque sus fuentes y terminos se documentan en `DATA_SOURCES.md` del repositorio.

## Capacidades

- Codificacion de observaciones meteorologicas de estaciones indias (temperatura, humedad relativa y velocidad del viento como variables evaluadas).
- Modelado espacio-temporal sobre 187 estaciones con cobertura de casi diez anos.
- Extraccion de representaciones (encoder) reutilizables por cabeceras o modelos de pronostico posteriores.
- Inferencia en PyTorch puro mediante `torch.load` del checkpoint publicado.
- No soporta tool calling, function calling ni comportamiento agentico (no es un modelo generativo de lenguaje).
- No dispone de capacidades multilingues, de vision, audio ni de modo de razonamiento extendido.
- No hay evidencia publicada de capacidades adicionales mas alla de la codificacion y el pronostico meteorologico regional.

## Casos de uso

- Pre-entrenamiento de pronosticos meteorologicos regionales en la India: el encoder puede servir como inicializacion para modelos posteriores que predigan temperatura, humedad o viento a corto plazo sobre las 187 estaciones cubiertas, aprovechando que ya ha visto casi una decada de observaciones.
- Investigacion en modelado espacio-temporal: util como baseline reproducible de 10M de parametros en estudios academicos sobre interpolacion y prediccion de variables climaticas en redes de estaciones dispersas.
- Prototipado rapido en entornos con recursos limitados: sus 10,5M de parametros permiten cargar y ejecutar el modelo en CPU o en GPU de consumo, lo que facilita experimentos sin infraestructura dedicada.
- Benchmark de referencia frente a modelos meteorologicos operativos: el autor documenta explicitamente el resultado de validacion (0,4620 frente a 0,4597) como criterio de no adopcion, lo que permite usar el modelo como termino de comparacion en evaluaciones de codificadores alternativos.
- Docencia y divulgacion: ejemplo concreto y pequeno de pipeline completo (descarga, carga de checkpoint con metadatos, inspeccion de resultados registrados) para ensenar flujos de trabajo de Hugging Face con modelos no linguisticos.
- Reproducibilidad de experimentos: el checkpoint incluye `ck['results']` con todos los resultados registrados y los logs de ejecucion, lo que facilita auditorias y replicaciones del experimento `pwm-v20`.

## Benchmarks y rendimiento

| Metrica | Valor registrado |
|---|---|
| MAE temperatura (held-out) | 0,862 °C |
| MAE humedad relativa (held-out) | 4,80 %RH |
| MAE velocidad del viento (held-out) | 0,578 m/s |
| Validacion interna (CPCB) | 0,4620 |
| Referencia de validacion (CPCB) | 0,4597 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K ni equivalentes de series temporales) en la informacion disponible. Los unicos datos de rendimiento son los MAE y la comparacion de validacion interna documentados por el autor.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en precision completa, dado que el checkpoint ocupa 42.332.123 bytes (unos 40 MB) y el modelo tiene 10,5M de parametros.
- GPU recomendadas: cualquier GPU moderna es suficiente; el modelo cabe holgadamente en RTX 3060, RTX 4090, A100 o H100. Tambien es viable en CPU.
- Si cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo actual e incluso en hardware integrado.
- Opciones de despliegue: carga directa con PyTorch (`torch.load`) segun el ejemplo de la model card; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Estado |
|---|---|---|---|---|---|
| PWM-F encoder v2.0 (este) | 10,5M | no disponible | Codificacion meteorologica India | Apache-2.0 | No adoptado para CPCB |
| PWM-W v1.0 (#33, mismo autor) | no disponible | no disponible | Modelo meteorologico (familia PWM-W) | no disponible en esta ficha | Version anterior de la serie |
| PWM-F encoder v2.1 (#36, mismo autor) | no disponible | no disponible | Codificacion meteorologica (run v2.1) | no disponible en esta ficha | Version posterior de la serie |

No se dispone de datos suficientes para comparar con codificadores meteorologicos de terceros (por ejemplo, modelos operativos de agencias meteorologicas) en parametros, contexto o rendimiento; esta comparacion no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- El propio autor marca el modelo como "not adopted": no supera la validacion interna frente a la referencia (0,4620 frente a 0,4597), por lo que no esta recomendado como componente de produccion.
- Cobertura geografica restringida a la India y a 187 estaciones del NOAA ISD; no hay evidencia de generalizacion fuera de esa region ni de esa red.
- Ventana temporal limitada a enero de 2015 - noviembre de 2024; el comportamiento fuera de ese rango no esta validado.
- Solo se publican metricas para tres variables (temperatura, humedad relativa, viento); el rendimiento en otras variables meteorologicas no esta disponible.
- Riesgo de sesgo por la distribucion no uniforme de las estaciones y por posibles huecos o errores en los datos originales del NOAA ISD.
- Riesgo de alucinacion en sentido estricto no aplica (no es un modelo generativo de lenguaje), pero si existe riesgo de predicciones fisicamente implausibles fuera del dominio de entrenamiento.
- Licencia Apache-2.0: permite uso comercial y modificacion con atribucion, pero el modelo se distribuye sin garantias y los datos de entrenamiento no se incluyen.
- La arquitectura no esta descrita en la model card; para reproducirla es necesario consultar el repositorio de GitHub, lo que anade dependencia externa.
- El repositorio de Hugging Face registra 0 descargas y 0 likes en el momento de la consulta, y el tamano del repo figura como 0.0 GB, lo que sugiere una publicacion muy reciente y sin validacion por parte de la comunidad.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/paradoxailab/pwm-f-encoder-v2.0)
- [Repositorio GitHub de Paradox World Model](https://github.com/paradoxailab/paradox-world-model)
- [README de la rama india-v2.0](https://github.com/paradoxailab/paradox-world-model/blob/india-v2.0/README.md)
- [Indice de la serie de modelos](https://github.com/paradoxailab/paradox-world-model/blob/main/models/series/README.md)
- [Fuentes de datos (DATA_SOURCES.md)](https://github.com/paradoxailab/paradox-world-model/blob/main/DATA_SOURCES.md)
- [CITACION (CITATION.cff)](https://github.com/paradoxailab/paradox-world-model/blob/main/CITATION.cff)
- [Modelo anterior: PWM-W v1.0](https://huggingface.co/paradoxailab/pwm-w-v1.0-wmo)
- [Modelo siguiente: PWM-F encoder v2.1](https://huggingface.co/paradoxailab/pwm-f-encoder-v2.1)
- [Todos los modelos de la serie](https://huggingface.co/paradoxailab/paradox-world-model-series)
- [Sitio web de ParadoxAI Lab](https://paradoxailab.com)
