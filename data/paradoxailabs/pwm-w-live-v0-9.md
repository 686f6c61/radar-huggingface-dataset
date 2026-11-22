# PARADOXAIlabs/pwm-w-live-v0.9

## Resumen

PWM-W v0.9 live es un modelo de series temporales desarrollado por ParadoxAI Lab (Aditya Kumar, Anupam Singh) dentro de la serie Paradox World Model, concretamente la entrega numero 30 del catalogo y el modelo 29 de los 56 publicados. Su tarea es la prediccion en tiempo real de horizontes de 24 horas para estaciones de calidad del aire y meteorologia en la India. Se distribuye como un checkpoint de PyTorch de apenas 985.853 parametros, lo que lo situa en la categoria de modelos ligeros especializados en pronostico espacio-temporal.

El modelo se entrena con meteorologia de estaciones CPCB/DPCC de Delhi (25 estaciones), estaciones sinopticas WMO de la India via NOAA ISD y reportes METAR de seis aeropuertos indios, incluido Delhi Palam. Esta version v0.9 es la primera que produce pronosticos en tiempo real para estaciones indias, segun la model card, y se publica bajo licencia Apache-2.0.

Es relevante ahora porque aborda un problema operativo concreto, el pronostico de contaminacion atmosferica y variables meteorologicas a corto plazo en una de las regiones con mayor carga de particulas del mundo, con un modelo de menos de un millon de parametros que puede ejecutarse en CPU sin infraestructura dedicada. La informacion publica es, sin embargo, muy escasa: no hay resultados numericos de benchmarks ni especificaciones detalladas de arquitectura en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo espacio-temporal de series temporales; codigo en el repositorio de GitHub del autor) |
| Parametros totales | 985.853 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (checkpoint PyTorch en precision nativa) |
| Idiomas soportados | no disponible (modelo numerico de series temporales, sin entrada de texto) |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch (`.pt`, 3.995.965 bytes, SHA-256 `f6bf6c9598ab3ca31d0f24da3ebd582919e5c3e0c9639e34e49d8651a8e59956`) |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna mas alla de clasificarla como modelo de pronostico espacio-temporal de la familia PWM-W. El checkpoint contiene un diccionario con las claves `meta`, `weights` (state dict de PyTorch), `results` y `cfg` (configuracion de entrenamiento), de modo que la arquitectura exacta debe consultarse en el codigo del repositorio de GitHub del autor y en el fichero de configuracion embebido. El numero de parametros, 985.853, confirma que se trata de una red de escala muy reducida, coherente con un modelo tabular/secuencial especializado y no con un transformer de lenguaje.

En cuanto a datos, se entrenó con meteorologia de 25 estaciones CPCB/DPCC de Delhi, estaciones sinopticas WMO de la India (NOAA ISD) y reportes METAR de seis aeropuertos indios, incluido Delhi Palam. El entrenamiento se realizo el 2026-11-09 en el entorno de Kaggle `pwm-v09-live` y el modelo se publico el 2026-11-17. No se especifican el numero de tokens ni la composicion exacta del dataset, aunque las fuentes y terminos de uso se remiten a `DATA_SOURCES.md` en el repositorio. No hay informacion sobre RLHF, DPO ni tecnicas de alineacion, algo esperable en un modelo de pronostico numerico.

## Capacidades

- Pronostico de series temporales espacio-temporales con horizonte de 24 horas para estaciones indias.
- Prediccion de variables de calidad del aire y meteorologia a partir de datos de estaciones CPCB/DPCC, WMO y METAR.
- Inferencia en tiempo real segun la model card ("real-time 24 h forecasts for Indian stations").
- Modelo numerico puro: no procesa texto ni imagenes, no soporta tool calling ni function calling.
- No dispone de modo de razonamiento multi-paso, agentes ni capacidades multilingues.
- Ejecutable en CPU dado su tamano inferior a un millon de parametros.

## Casos de uso

- Pronostico operativo de calidad del aire en Delhi: el modelo genera horizontes de 24 horas sobre las 25 estaciones CPCB/DPCC, lo que permite anticipar episodios de contaminacion y activar alertas sanitarias con un dia de antelacion.
- Prediccion meteorologica de aeropuertos: al entrenarse con METAR de seis aeropuertos indios, puede usarse para estimar variables de superficie en entornos aeroportuarios y apoyar la planificacion de operaciones.
- Integracion en paneles publicos de contaminacion: su tamano reducido permite desplegarlo como servicio ligero que actualice pronosticos cada hora sin GPU.
- Investigacion en modelos espacio-temporales: sirve como linea base reproducible de menos de un millon de parametros para comparar arquitecturas de pronostico en la region.
- Relleno y nowcasting de series de estaciones: util para imputar huecos o extender registros de estaciones sinopticas WMO y METAR en pipelines de datos climaticos.
- Prototipado rapido en entornos con recursos limitados: al cargarse en CPU con `torch.load`, encaja en cuadernos de Kaggle, contenedores pequenos o dispositivos de borde para experimentacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numericos en la informacion disponible. La model card remite a "see paper-weather v0.9" y al registro del repositorio, pero no incluye cifras de error (MAE, RMSE) ni comparaciones cuantitativas.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB en precision nativa; el checkpoint pesa 3.995.965 bytes (unos 4 MB).
- GPU recomendadas: no requiere GPU; cualquier CPU moderna es suficiente. En caso de usar GPU, una RTX 3060 o superior es mas que suficiente.
- Cabe en cualquier GPU de consumo, e incluso en CPU y en dispositivos de borde.
- Opciones de despliegue: PyTorch nativo mediante `torch.load` y `huggingface_hub.hf_hub_download`; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de la misma categoria (pronostico espacio-temporal de calidad del aire en la India) ni datos de rendimiento que permitan una comparacion rigurosa.

## Limitaciones y advertencias

- Cobertura geografica restringida: entrenado exclusivamente con estaciones indias (Delhi, red WMO y seis aeropuertos), por lo que su uso fuera de esa region no esta validado.
- Ausencia de metricas publicas: no hay cifras de error ni validacion cuantitativa en la model card, lo que impide evaluar su calidad antes de desplegarlo.
- Documentacion incompleta: la arquitectura, el contexto de entrada y la configuracion solo se pueden reconstruir desde el codigo del repositorio y el fichero `cfg`.
- Riesgo de deriva: al ser un modelo en tiempo real dependiente de fuentes externas (CPCB/DPCC, NOAA ISD, METAR), cambios en la disponibilidad o formato de esas fuentes pueden degradar las predicciones.
- Sin capacidades de lenguaje: no debe emplearse para tareas de texto, razonamiento, codigo ni atencion al cliente.
- Licencia Apache-2.0: permite uso comercial y modificacion con atribucion, pero conviene revisar `DATA_SOURCES.md` por las condiciones de las fuentes de datos originales.
- Modelo de investigacion con version v0.9 y publicacion reciente: no hay evidencia de uso en produccion ni historial de estabilidad.

## Enlaces

- Hugging Face: https://huggingface.co/PARADOXAIlabs/pwm-w-live-v0.9
- Repositorio GitHub: https://github.com/paradoxailab/paradox-world-model
- Registro de la version (branch delhi-v0.8): https://github.com/paradoxailab/paradox-world-model/blob/delhi-v0.8/README.md
- Indice de la serie: https://github.com/paradoxailab/paradox-world-model/blob/main/models/series/README.md
- Fuentes de datos: https://github.com/paradoxailab/paradox-world-model/blob/main/DATA_SOURCES.md
- Citacion: https://github.com/paradoxailab/paradox-world-model/blob/main/CITATION.cff
- Modelo anterior (#29 PWM-X v0.9): https://huggingface.co/PARADOXAIlabs/pwm-x-cpcb
- Modelo siguiente (#32 PWM-W v1.0): https://huggingface.co/PARADOXAIlabs/pwm-w-v1.0-metar
- Todos los modelos de la serie: https://huggingface.co/PARADOXAIlabs/paradox-world-model-series
- Sitio del autor: https://paradoxailab.com
