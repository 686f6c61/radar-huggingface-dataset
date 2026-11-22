# PARADOXAIlabs/pwm-dyn-v0.4-imd_central_india

## Resumen

PWM-Dyn v0.4 (variante `imd_central_india`) es un modelo de predicción espacio-temporal de precipitación diaria en rejilla, desarrollado por ParadoxAI Lab (Aditya Kumar y Anupam Singh) dentro de su serie Paradox World Model. Concretamente, resuelve la tarea de pronosticar los próximos días de lluvia diaria sobre una malla de 0,25° centrada en la India central, partiendo de los datos IMD (India Meteorological Department) del periodo 2000-2024. Es el modelo número 3 de 56 publicados en la serie, y ocupa la posición 03 dentro de la familia PWM-Dyn.

A diferencia de los modelos de lenguaje, se trata de un modelo neuronal compacto de 415.989 parámetros, entrenado específicamente para forecasting de series temporales con estructura espacial, y publicado con licencia Apache-2.0. Su relevancia radica en que introduce en esta versión (v0.4) dos novedades técnicas: los *tracks* de evaluación ParadoxBench-1 y la calibración *split-conformal*, que eleva la cobertura nominal del 80% en la predicción de lluvia del 54,7% al 84,7% respecto a la v0.3.

El modelo se distribuye como un único checkpoint PyTorch de 1,69 MB (`03_pwm-dyn_v0.4_IMD_central_india.pt`), que contiene pesos, configuración de entrenamiento y resultados registrados. El código de arquitectura no está incluido en el repositorio de Hugging Face, sino que se referencia al repositorio GitHub del proyecto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo neuronal de forecasting espacio-temporal; el codigo esta en el repositorio GitHub del proyecto) |
| Parametros totales | 415.989 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (ventana temporal de entrada no especificada en la model card) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no aplica: modelo numerico de series temporales, no procesa texto) |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch (`torch.load`, checkpoint `.pt` con claves `meta`, `weights`, `results`, `cfg`) |
| Tamano del repositorio | 0,0 GB (checkpoint de 1.690.122 bytes) |
| Tarea | Prediccion de precipitacion diaria en rejilla (time-series-forecasting) |
| Datos de entrenamiento | IMD 0.25° gridded daily rainfall, India central, 2000-2024 |
| Fecha de entrenamiento | 2026-11-01 (notebook de Kaggle 0387a11c3a, version 364310290) |
| Fecha de publicacion | 2026-11-17 |
| Estado | reported (resultados declarados por el autor, no verificados de forma independiente) |

## Arquitectura y entrenamiento

La model card no detalla la arquitectura interna del modelo. Se indica que es un modelo neuronal implementado en PyTorch, orientado a la prediccion de proximos dias de precipitacion diaria sobre una rejilla de 0,25°, y que el codigo de arquitectura correspondiente a esta version se encuentra en el repositorio GitHub `paradoxailab/paradox-world-model`. La configuracion concreta de entrenamiento esta almacenada dentro del propio checkpoint (clave `ck['cfg']`), pero sus valores no se reproducen en la informacion disponible.

El entrenamiento se realizo el 2026-11-01 en un notebook de Kaggle (identificador 0387a11c3a, version 364310290), sobre datos IMD de precipitacion diaria en rejilla para la India central durante el periodo 2000-2024. No se especifican el numero de tokens ni la composicion exacta del dataset, aunque la fuente y los terminos de los datos se remiten a `DATA_SOURCES.md` en el repositorio GitHub. La innovacion tecnica destacada en esta version es la incorporacion de los *tracks* de evaluacion ParadoxBench-1 y de la calibracion *split-conformal*, que mejora la cobertura empirica de los intervalos de prediccion al 80% nominal.

## Capacidades

- Prediccion de precipitacion diaria en rejilla a 0,25° para los proximos dias sobre la India central.
- Modelado espacio-temporal: la salida es un campo en rejilla, no una serie univariada, por lo que captura estructura espacial entre celdas.
- Generacion de intervalos de prediccion calibrados mediante *split-conformal* (cobertura empirica del 84,7% para el nivel nominal del 80% en lluvia).
- Evaluacion estandarizada mediante ParadoxBench-1 Track A (MAE en mm/dia).
- Publicacion de resultados por semilla: el checkpoint corresponde a la semilla 0 de un ensemble de 3 semillas.
- No dispone de tool calling, function calling, capacidades de agente, razonamiento multi-paso, vision ni audio.
- No es un modelo multilingue ni procesa texto: es un modelo numerico de series temporales.

## Casos de uso

- **Prediccion operativa de lluvia a corto plazo en la India central**: el modelo toma el estado reciente de la rejilla IMD 0,25° y devuelve los proximos dias de precipitacion, adecuado para boletines diarios de precipitacion a escala regional.
- **Avisos hidrologicos y agricolas**: los intervalos calibrados al 80% (cobertura del 84,7%) permiten emitir avisos con incertidumbre cuantificada para planificacion de riego y siembra en zonas dependientes del monzon.
- **Ensembles de prediccion**: al ser un checkpoint de una semilla de un ensemble de 3, puede combinarse con los otros miembros para reducir varianza en la prediccion final (el MAE reportado de 2,84 mm/dia corresponde al ensemble).
- **Investigacion en modelos del mundo fisicos**: sirve como referencia ligera (415.989 parametros) para comparar arquitecturas de forecasting espacio-temporal frente a baselines en ParadoxBench-1.
- **Prototipado rapido en entornos con recursos limitados**: el checkpoint de 1,69 MB se carga en CPU (`map_location="cpu"`) sin necesidad de GPU, lo que facilita pruebas en cuadernos y entornos educativos.
- **Calibracion de incertidumbre en series climaticas**: el esquema *split-conformal* implementado puede reutilizarse como referencia metodologica para otros modelos de prediccion de precipitacion con requisitos de cobertura.

## Benchmarks y rendimiento

| Benchmark | Metrica | Resultado | Notas |
|---|---|---|---|
| ParadoxBench-1 Track A (test) | MAE (mm/dia) | 2,84 | Ensemble de 3 semillas; este archivo es la semilla 0 |
| Cobertura de intervalos de lluvia (nominal 80%) | Cobertura empirica | 84,7% | Frente al 54,7% de la v0.3 |

No se han publicado en la informacion disponible resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros), que por otra parte no aplican a un modelo de forecasting de series temporales. Los resultados anteriores son los declarados por el autor en la model card y no se han verificado de forma independiente.

## Requisitos de hardware

- **VRAM estimada para inferencia**: minimo, inferior a 1 GB; el checkpoint pesa 1,69 MB y el modelo tiene 415.989 parametros.
- **GPU recomendadas**: cualquier GPU con al menos 2 GB de memoria es suficiente; tambien funciona en CPU sin problemas.
- **GPU de consumo**: cabe holgadamente en cualquier GPU de consumo moderna (RTX 3060, RTX 4060, RTX 4090, etc.) e incluso en iGPU y en CPU.
- **Opciones de despliegue**: carga directa con `torch.load` y `huggingface_hub.hf_hub_download`; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplican a este tipo de modelo).
- **Latencia y throughput**: no disponibles en la informacion proporcionada; por el tamano del modelo, se espera latencia muy baja, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PWM-Dyn v0.4 (imd_central_india) | 415.989 | no disponible | Precipitacion diaria en rejilla, India central | Apache-2.0 | Hugging Face + GitHub |
| PWM-Dyn v0.4 (pems04) | no disponible | no disponible | Forecasting de trafico (PEMS04) | Apache-2.0 | Hugging Face |
| PWM-Dyn v0.4 (imd_west_coast) | no disponible | no disponible | Precipitacion diaria en rejilla, costa oeste de India | Apache-2.0 | Hugging Face |

No se dispone de datos de benchmarks de los modelos comparables en la informacion proporcionada, por lo que no es posible una comparacion cuantitativa de rendimiento. Tampoco se identifican en la informacion modelos de terceros directamente comparables.

## Limitaciones y advertencias

- **Resultados no verificados**: el estado del modelo es "reported"; el MAE de 2,84 mm/dia y la cobertura del 84,7% son cifras declaradas por el autor, sin validacion independiente.
- **Ambito geografico restringido**: entrenado exclusivamente con datos IMD de la India central (2000-2024); no es extrapolable a otras regiones sin reentrenamiento.
- **Resolucion fija**: la rejilla es de 0,25°; no se documenta soporte para resoluciones distintas.
- **Datos de entrenamiento no incluidos**: los datos IMD no se distribuyen con el modelo; sus terminos y fuentes estan en `DATA_SOURCES.md`, lo que limita la reproducibilidad directa.
- **Codigo de arquitectura externo**: el repositorio de Hugging Face solo contiene el checkpoint; para reconstruir el modelo hay que acudir al repositorio GitHub, lo que anade dependencia de un recurso externo.
- **Riesgo de alucinacion**: no aplica en el sentido de generacion de texto, pero si en el de predicciones fisicamente implausibles fuera del regimen de entrenamiento (por ejemplo, eventos extremos no vistos en 2000-2024).
- **Sin soporte de texto, vision ni agentes**: no debe emplearse como modelo de lenguaje ni en pipelines conversacionales.
- **Licencia Apache-2.0**: permite uso comercial y modificacion con atribucion; no obstante, conviene revisar los terminos de los datos IMD subyacentes antes de un uso comercial de las predicciones.
- **Mantenimiento**: la serie se actualiza con frecuencia (v0.4 sustituye a v0.3); conviene fijar la version concreta en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/PARADOXAIlabs/pwm-dyn-v0.4-imd_central_india
- Repositorio GitHub del proyecto: https://github.com/paradoxailab/paradox-world-model
- Resultados completos: https://github.com/paradoxailab/paradox-world-model/blob/main/RESULTS.md
- Documentacion de ParadoxBench v0.4: https://github.com/paradoxailab/paradox-world-model/blob/main/v0.4-paradoxbench/README.md
- Indice de la serie de modelos: https://github.com/paradoxailab/paradox-world-model/blob/main/models/series/README.md
- Fuentes y terminos de los datos: https://github.com/paradoxailab/paradox-world-model/blob/main/DATA_SOURCES.md
- Citacion: https://github.com/paradoxailab/paradox-world-model/blob/main/CITATION.cff
- Modelo anterior de la serie (#02, pems04): https://huggingface.co/PARADOXAIlabs/pwm-dyn-v0.4-pems04
- Modelo siguiente de la serie (#04, imd_west_coast): https://huggingface.co/PARADOXAIlabs/pwm-dyn-v0.4-imd_west_coast
- Indice de todos los modelos de la serie: https://huggingface.co/PARADOXAIlabs/paradox-world-model-series
- Sitio web de ParadoxAI Lab: https://paradoxailab.com
