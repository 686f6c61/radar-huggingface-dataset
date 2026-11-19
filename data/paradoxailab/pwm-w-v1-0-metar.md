# paradoxailab/pwm-w-v1.0-metar

## Resumen

PWM-W v1.0-metar es un modelo de prediccion de series temporales desarrollado por ParadoxAI Lab (Aditya Kumar, Anupam Singh) dentro de su serie Paradox World Model, concretamente la entrega numero 32 de la serie y el modelo 30 de los 56 publicados. El modelo aborda una tarea muy concreta: pronosticar las proximas 24 horas de temperatura, humedad y viento a partir de informes METAR de seis aeropuertos de la India, incluido el de Delhi Palam.

Se trata de un modelo de tamano muy reducido, con 1.260.997 parametros, entrenado el 9 de noviembre de 2026 en un entorno de Kaggle (identificador pwm-v10) y publicado el 17 de noviembre de 2026. No es un modelo de lenguaje ni un transformer generativo de proposito general: es un modelo especializado de forecasting espacio-temporal, empaquetado como un checkpoint de PyTorch que incluye pesos, configuracion, metadatos y registros de resultados en un unico fichero `.pt` de aproximadamente 5,18 MB.

Su relevancia es acotada pero clara: demuestra un flujo de trabajo reproducible de modelado meteorologico a muy baja escala, con licencia Apache-2.0 y artefactos auditables (hashes SHA-256, configuracion embebida, registro de resultados). La model card no documenta ningun resultado numerico de evaluacion, lo que limita seriamente su uso en produccion sin una validacion previa por parte del usuario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el codigo esta en el repositorio de GitHub; la model card no la describe) |
| Parametros totales | 1.260.997 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de series temporales; ventana de entrada no documentada) |
| Tipos de cuantizacion | no disponible (checkpoint PyTorch en precision original) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch state dict dentro de un fichero `.pt` (`32_pwm-w_v1.0_metar.pt`, 5.184.207 bytes) |

## Arquitectura y entrenamiento

La model card no especifica la arquitectura interna. Indica que se trata de un ensemble de dos arquitecturas y que la version incorpora "self-correction", adoptandose el ensemble solo si mejora en mas de 2 sigma respecto a la alternativa individual. El codigo de la arquitectura corresponde a la rama `delhi-v1.0` del repositorio `paradoxailab/paradox-world-model` en GitHub, y la configuracion exacta de entrenamiento esta embebida en el checkpoint bajo la clave `ck['cfg']`. Sin acceso a ese repositorio, los detalles de capas, atencion o mecanismo de agregacion espacio-temporal no estan disponibles en la informacion proporcionada.

Los datos de entrenamiento son informes METAR de seis aeropuertos indios, con Delhi Palam entre ellos. La tarea es la prediccion de las siguientes 24 horas de temperatura, humedad y viento. El entrenamiento se realizo el 9 de noviembre de 2026 en Kaggle (run `pwm-v10`). No se documenta el numero de tokens ni de muestras, la composicion exacta del dataset, ni si hubo tecnicas de ajuste tipo RLHF o DPO (poco probables en un modelo de forecasting de este tamano). Los datos de entrenamiento no se distribuyen; sus fuentes y terminos se remiten a `DATA_SOURCES.md` en el repositorio.

## Capacidades

- Prediccion de las proximas 24 horas de temperatura, humedad y viento a partir de observaciones METAR.
- Modelado espacio-temporal sobre multiples estaciones (seis aeropuertos indios).
- Ensemble de dos arquitecturas con criterio de adopcion basado en significacion estadistica (>2 sigma).
- Mecanismo de autocorreccion declarado en la model card, sin detalle tecnico disponible.
- Carga directa en PyTorch mediante `torch.load`, con acceso a metadatos, pesos, configuracion y resultados registrados en el propio fichero.
- No soporta tool calling, function calling, agentes, vision, audio ni capacidades multilingues: no es un modelo de lenguaje.

## Casos de uso

- Prediccion meteorologica local en aerodromos: ingerir los METAR mas recientes de las seis estaciones y generar un pronostico a 24 horas de temperatura, humedad y viento para planificacion operativa de pista y personal.
- Prototipado academico de forecasting espacio-temporal: usar el checkpoint como linea base reproducible (configuracion embebida, hash verificado) en experimentos sobre datos METAR.
- Estudio de ensembles a muy baja escala: analizar el criterio de adopcion por 2 sigma y el mecanismo de autocorreccion como caso de diseno en modelos de menos de 1,3 M de parametros.
- Integracion en pipelines de datos meteorologicos: el formato `.pt` con state dict permite cargar el modelo en un servicio Python y alimentarlo con observaciones normalizadas de estaciones cercanas.
- Evaluacion comparativa de modelos de pronostico a corto plazo: servir como referencia de bajo coste computacional frente a modelos numericos de prediccion (NWP) o modelos de series temporales mas grandes.
- Docencia y divulgacion: ejemplo completo y auditables de publicacion de un modelo (licencia, hashes, configuracion, registro) para ensenar buenas practicas de reproducibilidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente: "no result recorded in the delhi-v1.0 README". No se dispone de metricas como MAE, RMSE, MMLU, HumanEval o GSM8K (estas ultimas no aplican a un modelo de series temporales).

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB; el fichero de pesos ocupa 5,18 MB y el modelo tiene 1,26 M de parametros (en fp32, aproximadamente 5 MB de pesos).
- GPU recomendadas: cualquier GPU con al menos 1 GB de memoria; tambien funciona en CPU sin problema.
- Cabe en cualquier GPU de consumo (GTX 1050, RTX 2060, RTX 3060, RTX 4090) e incluso en dispositivos embebidos.
- Opciones de despliegue: PyTorch nativo mediante `torch.load`; no se documenta soporte para vLLM, llama.cpp, Ollama o TGI (no aplican a este tipo de modelo).
- Latencia y throughput: no disponibles; por el tamano, la inferencia deberia ser del orden de milisegundos en CPU, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PWM-W v1.0-metar | 1.260.997 | no disponible | Forecasting METAR 24 h (India) | Apache-2.0 | Hugging Face + GitHub |
| PWM-W v0.9 live (mismo autor) | no disponible | no disponible | Forecasting (version previa de la serie) | no disponible | Hugging Face |
| PWM-W v1.0-wmo (mismo autor) | no disponible | no disponible | Forecasting (version siguiente de la serie) | no disponible | Hugging Face |

No se dispone de datos de benchmarks ni de especificaciones detalladas de modelos alternativos de la misma categoria en la informacion proporcionada, por lo que no es posible establecer una comparativa cuantitativa con modelos de terceros.

## Limitaciones y advertencias

- Ausencia total de resultados de evaluacion: no hay metricas publicadas que permitan estimar la calidad del pronostico; cualquier uso en produccion exige una validacion independiente.
- Cobertura geografica restringida: solo seis aeropuertos indios; no hay evidencia de generalizacion a otras regiones o estaciones.
- Variables limitadas: unicamente temperatura, humedad y viento; no cubre precipitacion, presion ni otros fenomenos.
- Horizonte fijo de 24 horas; no se documenta soporte para otros horizontes.
- Riesgo de sobreajuste y de deriva: al ser un modelo muy pequeno entrenado con datos acotados, la fiabilidad fuera del periodo de entrenamiento es incierta.
- No es un modelo de lenguaje: no admite prompts en lenguaje natural, tool calling ni razonamiento multietapa.
- La model card no documenta sesgos, composicion del dataset ni procesos de validacion; la trazabilidad depende de los registros del repositorio de GitHub.
- Licencia Apache-2.0: permite uso comercial y modificacion con atribucion, pero el autor no ofrece garantias sobre el rendimiento.
- Los datos de entrenamiento no se distribuyen; la reproducibilidad completa depende de las fuentes externas referenciadas en `DATA_SOURCES.md`.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/paradoxailab/pwm-w-v1.0-metar
- Repositorio GitHub (rama del modelo): https://github.com/paradoxailab/paradox-world-model/blob/delhi-v1.0/README.md
- Indice de la serie: https://github.com/paradoxailab/paradox-world-model/blob/main/models/series/README.md
- Fuentes de datos: https://github.com/paradoxailab/paradox-world-model/blob/main/DATA_SOURCES.md
- Citacion: https://github.com/paradoxailab/paradox-world-model/blob/main/CITATION.cff
- Modelo anterior (v0.9 live): https://huggingface.co/paradoxailab/pwm-w-live-v0.9
- Modelo siguiente (v1.0 WMO): https://huggingface.co/paradoxailab/pwm-w-v1.0-wmo
- Todos los modelos de la serie: https://huggingface.co/paradoxailab/paradox-world-model-series
- Sitio del autor: https://paradoxailab.com
