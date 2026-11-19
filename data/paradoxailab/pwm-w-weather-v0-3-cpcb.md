# paradoxailab/pwm-w-weather-v0.3-cpcb

## Resumen

PWM-W Weather v0.3 (league run) es un modelo de prediccion meteorologica espacio-temporal desarrollado por ParadoxAI Lab (Aditya Kumar y Anupam Singh) dentro de su serie Paradox World Model, que agrupa 56 modelos publicados. Este modelo concreto ocupa la posicion 21 de la serie y esta especializado en predecir las siguientes 24 horas de temperatura, humedad y viento en estaciones meteorologicas. A diferencia de los modelos globales de prediccion meteorologica, se plantea como un "world model" restringido a estaciones y entrenado con datos de meteorologia de la red CPCB/DPCC de Delhi (25 estaciones).

El modelo es extremadamente compacto: 932.348 parametros (menos de un millon), lo que lo situa en un orden de magnitud muy inferior a los modelos de lenguaje o de vision habituales. Se distribuye como un unico checkpoint PyTorch de 3,87 MB que incluye pesos, configuracion, metadatos y resultados de entrenamiento. La version v0.3 supone un cambio de dominio respecto a la version anterior (v0.2, centrada en calidad del aire en Delhi) hacia prediccion meteorologica pura.

Su relevancia radica en la propuesta metodologica: evaluar modelos de mundo locales y ligeros contra modelos globales de IA meteorologica en una "liga" comparativa. No obstante, la informacion publica disponible es muy limitada: no hay resultados de benchmarks en la model card, el repositorio de Hugging Face no contiene ficheros visibles (tamano 0.0 GB) y las capacidades declaradas se restringen a la prediccion de series temporales meteorologicas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de mundo espacio-temporal; codigo en repositorio GitHub del autor) |
| Parametros totales | 932.348 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (horizonte de prediccion de 24 h) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch state dict (`.pt`, checkpoint de 3.868.981 bytes) |

## Arquitectura y entrenamiento

La model card no detalla la arquitectura interna. Se describe como un "station-only world model" (modelo de mundo restringido a estaciones) para prediccion espacio-temporal, con un total de 932.348 parametros. El codigo de arquitectura correspondiente a esta version se encuentra en el repositorio GitHub del proyecto, en la rama `delhi-v0.3`, y la configuracion de entrenamiento esta embebida en el propio checkpoint bajo la clave `ck['cfg']`.

El entrenamiento se realizo el 7 de noviembre de 2026 en un entorno de Kaggle (`pwm-weather-league-gpu`) y el modelo se publico el 17 de noviembre de 2026. Los datos de entrenamiento no se distribuyen: la model card indica que las fuentes y terminos estan documentados en `DATA_SOURCES.md` del repositorio. La unica descripcion del dataset es "CPCB/DPCC Delhi station meteorology (25 stations)". No se especifica numero de tokens, composicion del dataset, ni si se emplearon tecnicas de RLHF/DPO (poco probables en un modelo de este tipo y tamano). La innovacion declarada es el cambio de dominio respecto a v0.2 (de calidad del aire a meteorologia) y la evaluacion contra modelos globales de IA meteorologica en una liga comparativa.

## Capacidades

- Prediccion de series temporales meteorologicas a 24 horas: temperatura, humedad y viento en estaciones.
- Modelado espacio-temporal entre estaciones (25 estaciones de la red CPCB/DPCC de Delhi).
- Prediccion a nivel de estacion (no genera campos globales en rejilla).
- No se documenta soporte de tool calling, function calling ni uso como agente.
- No se documenta capacidad multilingue (no es un modelo de lenguaje).
- No se documentan modos especiales (thinking, vision, audio).
- El checkpoint incluye los resultados y registros de ejecucion grabados (`ck['results']`), lo que permite auditar el entrenamiento.

## Casos de uso

- Prediccion meteorologica local a corto plazo: el modelo genera las proximas 24 horas de temperatura, humedad y viento para estaciones concretas de Delhi, util para planificacion operativa diaria en un area metropolitana densamente poblada.
- Investigacion en modelos de mundo ligeros: con menos de un millon de parametros, sirve como banco de pruebas para estudiar hasta que punto un modelo compacto y local puede competir con modelos globales de IA meteorologica.
- Relleno de huecos en series de estaciones: al modelar dependencias espacio-temporales entre 25 estaciones, puede emplearse para estimar valores faltantes o interpolar en estaciones con datos incompletos.
- Comparativa metodologica (liga): el modelo esta disenado para ser evaluado en la "weather league" frente a modelos globales, por lo que es util como referencia reproducible en estudios comparativos de prediccion meteorologica.
- Prototipado rapido en entornos con recursos limitados: su tamano (3,87 MB) permite cargarlo y ejecutarlo en CPU o en GPU de consumo sin infraestructura dedicada, adecuado para experimentos academicos y docencia.
- Analisis de sensibilidad meteorologica en salud publica: la prediccion de temperatura y humedad a 24 h en estaciones de Delhi puede alimentar estudios sobre calidad del aire y salud, en continuidad con la version v0.2 centrada en contaminacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite a la seccion v0.3 de "paper-weather" para los resultados de la liga contra modelos globales de IA meteorologica, pero no incluye cifras en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB; el checkpoint ocupa 3,87 MB y el modelo tiene 932.348 parametros.
- GPU recomendadas: cualquier GPU moderna es sobredimensionada; una GPU de consumo basica o incluso CPU es suficiente. No se requiere A100 ni H100.
- Cabe en cualquier GPU de consumo (RTX 3060, RTX 4090, etc.) y en CPU.
- Opciones de despliegue: carga directa con PyTorch (`torch.load`) segun el ejemplo de la model card; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / horizonte | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PWM-W Weather v0.3 (league run) | 932.348 | 24 h | Prediccion meteorologica en estaciones (Delhi) | Apache-2.0 | Hugging Face (repo sin ficheros visibles) |
| PWM-W Delhi v0.2 | no disponible | no disponible | Calidad del aire en Delhi | Apache-2.0 (segun serie) | Hugging Face |
| PWM-W Weather v0.3 (WMO) | no disponible | no disponible | Prediccion meteorologica | Apache-2.0 (segun serie) | Hugging Face |
| Modelos globales de IA meteorologica | no disponible | no disponible | Prediccion global en rejilla | no disponible | no disponible |

No se dispone de datos de rendimiento de los modelos comparables en la informacion proporcionada; la comparativa se limita a la serie del mismo autor y a la referencia generica a modelos globales citada en la model card.

## Limitaciones y advertencias

- Cobertura geografica muy restringida: entrenado con 25 estaciones de la red CPCB/DPCC de Delhi; no es extrapolable a otras regiones sin reentrenamiento.
- Horizonte limitado a 24 horas y a tres variables (temperatura, humedad, viento); no cubre precipitacion, presion ni otras variables.
- Prediccion a nivel de estacion, no en rejilla global; no sustituye a modelos numericos de prediccion ni a modelos globales de IA meteorologica.
- Sin resultados de benchmarks publicados en la informacion disponible: no es posible verificar su rendimiento real frente a alternativas.
- El repositorio de Hugging Face figura con 0 descargas, 0 likes y tamano 0.0 GB, sin ficheros visibles, lo que puede indicar problemas de disponibilidad o de publicacion.
- Los datos de entrenamiento no se distribuyen; la reproducibilidad depende de `DATA_SOURCES.md` y del codigo en GitHub.
- Riesgo de sobreajuste a las condiciones locales de Delhi y al periodo de entrenamiento; no se documenta validacion fuera de muestra.
- Licencia Apache-2.0 permite uso comercial, pero la ausencia de documentacion sobre sesgos y limitaciones exige validacion propia antes de cualquier uso en produccion.
- No es un modelo de lenguaje: no admite prompts en lenguaje natural ni tool calling.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/paradoxailab/pwm-w-weather-v0.3-cpcb
- Repositorio GitHub (rama delhi-v0.3): https://github.com/paradoxailab/paradox-world-model/blob/delhi-v0.3/README.md
- Indice de la serie: https://github.com/paradoxailab/paradox-world-model/blob/main/models/series/README.md
- Fuentes de datos: https://github.com/paradoxailab/paradox-world-model/blob/main/DATA_SOURCES.md
- Citacion: https://github.com/paradoxailab/paradox-world-model/blob/main/CITATION.cff
- Version anterior (#20): https://huggingface.co/paradoxailab/pwm-w-delhi-v0.2
- Version siguiente (#22): https://huggingface.co/paradoxailab/pwm-w-weather-v0.3-wmo
- Serie completa: https://huggingface.co/paradoxailab/paradox-world-model-series
- Sitio del autor: https://paradoxailab.com
