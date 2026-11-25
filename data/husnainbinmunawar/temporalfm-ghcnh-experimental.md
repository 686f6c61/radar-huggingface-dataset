# husnainbinmunawar/temporalfm-ghcnh-experimental

## Resumen

TemporalFM GHCNh experimental forecaster es un modelo de prediccion de series temporales publicado en Hugging Face por el usuario husnainbinmunawar. Se trata de un artefacto de investigacion de muy pequeno tamano (3.721 parametros segun los pesos en safetensors) que implementa un pronosticador GRU con regresion por cuantiles, entrenado sobre una serie de temperaturas reales del conjunto NOAA GHCNh (Global Historical Climatology Network hourly).

El modelo resuelve una tarea acotada: dada una ventana de contexto de 24 observaciones horarias de temperatura, produce un horizonte de prediccion de tres pasos con intervalos de cuantiles (10-90%). El entrenamiento empleo 3.168 ventanas cronologicas y se evaluo sobre 1.344 ventanas reservadas, con un MAE mediano de 1,0949 frente a un baseline de persistencia de 1,5609 en la unidad de temperatura de origen.

Su relevancia es limitada y estrictamente investigadora: no es un modelo de lenguaje, no procesa texto ni dispone de capacidades generativas generales. Resulta util como referencia reproducible de un pipeline de forecasting cuantil sobre datos climaticos, con manifiestos de procedencia y hashes incluidos, pero no esta pensado para uso en produccion ni para aplicaciones de seguridad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GRU con cabeza de regresion por cuantiles |
| Parametros totales | 3.721 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 24 observaciones de entrada |
| Horizonte de prediccion | 3 pasos |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no aplica; modelo numerico de series temporales) |
| Licencia | other |
| Formato de pesos | safetensors (libreria pytorch) |
| Entradas | series univariantes de temperatura (GHCNh) |
| Salidas | cuantiles de prediccion (intervalo 10-90%) |

## Arquitectura y entrenamiento

El modelo es una red recurrente de tipo GRU de dimension muy reducida, con una cabeza de salida orientada a regresion por cuantiles. Recibe ventanas de 24 observaciones y emite predicciones para tres pasos temporales futuros junto con los cuantiles que permiten construir un intervalo de confianza del 10-90%.

El entrenamiento se realizo sobre 3.168 ventanas cronologicas extraidas de un subconjunto procesado de observaciones horarias de temperatura de NOAA GHCNh, con 1.344 ventanas reservadas para evaluacion. Se ejecutaron 900 pasos de optimizador y el checkpoint fue recargado de forma independiente verificando que el hash de parametros coincidia. La procedencia de los datos (URL de origen, checksums, regla de particion y detalles de procesamiento) se documenta en `training_manifest.json` y `release_manifest.json`; los datos crudos y procesados no se incluyen en el repositorio mientras se revisan los terminos de la fuente y los derechos de redistribucion por jurisdiccion.

## Capacidades

- Prediccion de series temporales univariantes de temperatura a partir de 24 observaciones de contexto.
- Pronostico multi-paso (tres pasos) con salida de cuantiles, lo que permite construir intervalos de incertidumbre.
- Inferencia en CPU: el modelo esta etiquetado explicitamente para ejecucion en CPU y su tamano (3.721 parametros) lo hace trivial en recursos.
- Reproducibilidad: incluye manifiestos con hashes de datos y de parametros, y resultados de evaluacion en `evaluation_results.json`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni capacidades multilingues.
- No es un modelo de lenguaje: no genera texto.

## Casos de uso

- Prototipado de pipelines de forecasting cuantil: sirve como ejemplo minimo y reproducible de como estructurar una red GRU con salida de cuantiles para series climaticas, util en docencia o como baseline interno.
- Baseline de comparacion en investigacion: su MAE mediano (1,0949) y el baseline de persistencia (1,5609) permiten contrastar metodos mas complejos sobre el mismo subconjunto de estaciones GHCNh.
- Validacion de infraestructura de despliegue: al ejecutarse en CPU y ocupar practicamente nada, permite probar sistemas de serving de modelos de series temporales sin consumo de GPU.
- Analisis de incertidumbre en temperatura: la cobertura del intervalo 10-90% (0,7703) permite estudiar calibracion de intervalos predictivos en series reales.
- Reproduccion de experimentos: los manifiestos con checksums y reglas de particion facilitan replicar el entrenamiento y verificar la integridad de los datos.
- Educacion sobre procedencia de datos: el repositorio documenta explicitamente restricciones de redistribucion, lo que lo convierte en un caso practico de gestion de licencias en datasets climaticos.

## Benchmarks y rendimiento

| Metrica | TemporalFM GHCNh | Baseline de persistencia |
|---|---|---|
| MAE mediano (held-out) | 1,0949 | 1,5609 |
| Cobertura intervalo 10-90% | 0,7703 | no disponible |
| Ventanas de entrenamiento | 3.168 | no aplica |
| Ventanas de evaluacion | 1.344 | no aplica |
| Pasos de optimizador | 900 | no aplica |

Las metricas estan expresadas en la unidad de temperatura de origen del subconjunto GHCNh. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) porque no aplican a este tipo de modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: practicamente nula; el modelo tiene 3.721 parametros y esta disenado para CPU.
- GPU recomendadas: no requiere GPU. Cualquier CPU moderna es suficiente.
- Cabe en GPU consumer: si, en cualquier GPU, aunque no aporta ventaja frente a CPU.
- Opciones de despliegue: PyTorch nativo (libreria declarada). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TemporalFM GHCNh experimental | 3.721 | 24 observaciones | Forecasting cuantil de temperatura | other | Hugging Face |
| Baseline de persistencia (referencia del propio autor) | 0 | no aplica | Forecasting trivial | no aplica | Incluido en la evaluacion |
| Alternativas de forecasting de series temporales (p. ej. modelos tipo PatchTST, TimesFM) | no disponible | no disponible | Forecasting general | no disponible | no disponible |

No se dispone de datos suficientes en la informacion proporcionada para establecer una comparativa rigurosa con otros modelos de forecasting de series temporales.

## Limitaciones y advertencias

- Artefacto experimental de investigacion: el propio autor indica que no es un producto certificado meteorologico, ambiental ni de seguridad.
- Evaluacion acotada: solo se ha evaluado sobre el subconjunto de estaciones descrito en los manifiestos; la generalizacion a otras estaciones o regiones es desconocida.
- Cobertura de intervalos inferior a la nominal: el intervalo 10-90% alcanza una cobertura de 0,7703, por debajo del 0,80 esperado, lo que sugiere infracobertura.
- Licencia "other": las condiciones exactas de uso comercial no estan detalladas en la informacion disponible; es necesario revisar los terminos del repositorio antes de cualquier uso.
- Restricciones de datos: los datos crudos y procesados no se incluyen por revision de terminos de la fuente y derechos de redistribucion por jurisdiccion, lo que limita la reproducibilidad completa.
- Sin capacidades de lenguaje, vision ni agentes; no es adecuado para tareas de NLP.
- Riesgo de alucinacion: no aplica en el sentido habitual, pero las predicciones fuera del dominio de entrenamiento pueden ser poco fiables sin senalizacion clara.
- Sin informacion sobre sesgos: no se documentan analisis de sesgo por region, altitud o tipo de estacion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/husnainbinmunawar/temporalfm-ghcnh-experimental
- NOAA Global Historical Climatology Network hourly (GHCNh): no disponible en la informacion proporcionada (la URL exacta figura en `training_manifest.json` del repositorio)
- Manifiestos del repositorio: `training_manifest.json`, `release_manifest.json`, `evaluation_results.json`, `config.json` (incluidos en el propio repositorio de Hugging Face)
- Paper, blog o demo: no disponibles en la informacion proporcionada
