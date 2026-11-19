# paradoxailab/atlas-v1.4n

## Resumen

Atlas v1.4n es un modelo de series temporales desarrollado por ParadoxAI Lab (Aditya Kumar, Anupam Singh) dentro de su serie Paradox World Model. Concretamente, se trata de la entrega numero 47 de la serie y el modelo 44 de los 56 publicados. Su tarea especifica es la prediccion de las proximas 24 horas de concentracion de PM2.5 en estaciones de monitorizacion de calidad del aire en la India, utilizando datos de la red CPCB (Central Pollution Control Board) que abarcan 14 redes y 263 estaciones.

El modelo es extremadamente compacto: 967.632 parametros, lo que lo situa en la categoria de modelos ligeros para inferencia en CPU o GPU de gama baja. Se distribuye como un checkpoint de PyTorch (`.pt`) que contiene tanto los pesos como metadatos, configuracion y registros de resultados del entrenamiento. La model card indica explicitamente que esta version no fue adoptada ("not adopted"), ya que su resultado de validacion (9.106) no supero el de la version de referencia (9.104), tratandose de una prueba de arquitectura con resultado negativo.

Su relevancia es limitada fuera del contexto de investigacion en prediccion espacio-temporal de contaminacion atmosferica. No es un modelo de lenguaje ni un modelo generativo de proposito general, sino un predictor especializado de series temporales con un dominio de aplicacion muy acotado (calidad del aire en India). Resulta util como referencia para investigadores que trabajen en forecasting de PM2.5 o que quieran reproducir los experimentos de la serie Paradox World Model.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (prueba de arquitectura; el codigo esta en el repositorio GitHub del proyecto) |
| Parametros totales | 967.632 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (modelo de series temporales, no de texto) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No aplica (modelo de series temporales, no linguistico) |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch `.pt` (checkpoint con `weights`, `meta`, `results`, `cfg`) |

## Arquitectura y entrenamiento

La model card no detalla la arquitectura concreta mas alla de indicar que se trata de una "prueba de arquitectura (negativa)". El codigo de la arquitectura de esta version se encuentra en el repositorio de GitHub del proyecto (`paradoxailab/paradox-world-model`), y la configuracion de entrenamiento esta almacenada dentro del propio checkpoint en la clave `ck['cfg']`. El modelo se enmarca en la categoria de modelos espacio-temporales ("spatiotemporal") para forecasting de series temporales, aunque no se especifica si emplea grafos, transformers, convoluciones o modelos recurrentes.

Los datos de entrenamiento provienen del dataset de Kaggle "Time Series Air Quality Data of India (2010-2023)", que agrega estaciones de la red CPCB: 14 redes y 263 estaciones. El entrenamiento se realizo el 2026-11-15 en el run de Kaggle `atlas-v14n-s400`, y el modelo se publico el 2026-11-17. No se especifica el numero de tokens, la composicion exacta del dataset, ni si se emplearon tecnicas de RLHF o DPO (lo cual es esperable, dado que no es un modelo de lenguaje). La model card indica que los datos de entrenamiento no se incluyen en el repositorio, pero sus fuentes y terminos estan documentados en `DATA_SOURCES.md`.

## Capacidades

- Prediccion de las proximas 24 horas de concentracion de PM2.5 en estaciones de monitorizacion de la India.
- Modelado espacio-temporal: el nombre "v1.4n (neighbours only)" sugiere el uso de estaciones vecinas como variables de entrada, aunque la model card no lo detalla.
- Inferencia sobre datos de la red CPCB (14 redes, 263 estaciones).
- Carga directa en PyTorch mediante `torch.load` con `weights_only=False`, exponiendo metadatos, pesos, resultados y configuracion.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingues (no es un modelo de lenguaje).
- No dispone de modo "thinking", vision ni audio.

## Casos de uso

- Prediccion operativa de calidad del aire en India: el modelo genera el pronostico de PM2.5 a 24 horas para estaciones CPCB, util para sistemas de alerta temprana en ciudades con alta contaminacion.
- Investigacion en forecasting espacio-temporal: sirve como baseline reproducible para comparar arquitecturas en la prediccion de PM2.5, dado que el checkpoint incluye configuracion y resultados registrados.
- Reproduccion de experimentos: al incluir `ck['cfg']` y `ck['results']`, permite reproducir el run `atlas-v14n-s400` y verificar el resultado de validacion (9.106 frente a 9.104 de la referencia).
- Estudio de arquitecturas negativas: al tratarse de una prueba de arquitectura con resultado negativo, es util para documentar que enfoques no mejoran el rendimiento en este dominio.
- Integracion en pipelines de investigacion atmosferica: puede incorporarse en notebooks o scripts de analisis que consuman datos CPCB y necesiten un predictor ligero (menos de 1M de parametros) ejecutable en CPU.
- Educacion y divulgacion: por su tamano reducido y licencia permisiva, sirve para ensenar tecnicas de forecasting de series temporales con datos reales de contaminacion.

## Benchmarks y rendimiento

La model card solo reporta el resultado de validacion interno de la serie: 9.106 frente a 9.104 de la version de referencia, lo que motivo que no fuese adoptado. No se especifica la metrica exacta (probablemente RMSE o MAE sobre PM2.5, pero no se confirma). No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible, lo cual es esperable al no tratarse de un modelo de lenguaje.

| Metrica | Atlas v1.4n | Referencia de la serie |
|---|---|---|
| Validacion (metrica no especificada) | 9.106 | 9.104 |
| Estado | No adoptado | Adoptado |

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB, dado que el checkpoint pesa 3.905.333 bytes (aproximadamente 3,9 MB) y el modelo tiene 967.632 parametros.
- GPU recomendadas: cualquier GPU con al menos 1 GB de memoria; tambien funciona en CPU sin problemas.
- Cabe en cualquier GPU de consumo (RTX 3050, RTX 4060, GTX 1650, etc.) e incluso en Raspberry Pi o entornos embebidos.
- Opciones de despliegue: inferencia directa con PyTorch (`torch.load`); no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles en la informacion proporcionada; por el tamano del modelo, se espera latencia muy baja en CPU.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la documentacion proporcionada. La serie Paradox World Model incluye otros modelos relacionados (por ejemplo, #46 Atlas-Delhi I1 y #48 Atlas-P), pero no se aportan sus especificaciones ni resultados para establecer una comparativa cuantitativa.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Atlas v1.4n | 967.632 | No aplica | Apache-2.0 | Hugging Face |
| Atlas-Delhi I1 (#46) | No disponible | No aplica | No disponible | Hugging Face |
| Atlas-P (#48) | No disponible | No aplica | No disponible | Hugging Face |

## Limitaciones y advertencias

- Modelo no adoptado: la propia model card indica "not adopted" porque su validacion (9.106) no supero la referencia (9.104); no se recomienda su uso en produccion frente a la version adoptada.
- Dominio muy restringido: solo predice PM2.5 a 24 horas en estaciones CPCB de India; no es extrapolable a otros contaminantes, regiones o horizontes temporales sin reentrenamiento.
- No es un modelo de lenguaje: no soporta generacion de texto, codigo, razonamiento, tool calling ni agentes.
- Datos de entrenamiento no incluidos: el repositorio no contiene los datos, solo referencias a sus fuentes y terminos en `DATA_SOURCES.md`.
- Sesgos potenciales: al entrenarse con datos de estaciones CPCB de India (2010-2023), puede reflejar sesgos de cobertura geografica y de calidad de sensores de esa red.
- Riesgo de error en predicciones: la metrica de validacion (9.106) sugiere un error absoluto o cuadratico medio no despreciable; no se especifica la unidad ni la metrica exacta.
- Licencia Apache-2.0: permite uso comercial, pero al ser un modelo de investigacion no adoptado, su robustez en produccion no esta validada.
- Carga con `weights_only=False`: requiere confiar en el origen del checkpoint, ya que permite ejecucion de codigo arbitrario al deserializar.

## Enlaces

- Hugging Face: https://huggingface.co/paradoxailab/atlas-v1.4n
- Repositorio GitHub: https://github.com/paradoxailab/paradox-world-model
- Registro de la version: https://github.com/paradoxailab/paradox-world-model/blob/main/atlas/README.md
- Indice de la serie: https://github.com/paradoxailab/paradox-world-model/blob/main/models/series/README.md
- Fuentes de datos: https://github.com/paradoxailab/paradox-world-model/blob/main/DATA_SOURCES.md
- Citacion: https://github.com/paradoxailab/paradox-world-model/blob/main/CITATION.cff
- Modelo anterior (#46): https://huggingface.co/paradoxailab/atlas-delhi-i1
- Modelo siguiente (#48): https://huggingface.co/paradoxailab/atlas-p
- Todos los modelos de la serie: https://huggingface.co/paradoxailab/paradox-world-model-series
- Sitio del autor: https://paradoxailab.com
