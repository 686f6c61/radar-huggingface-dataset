# PARADOXAIlabs/pwm-dyn-v0.7-pems07

## Resumen

PWM-Dyn v0.7 (identificador `pwm-dyn-v0.7-pems07`) es un modelo de prediccion de series temporales especializado en pronostico de trafico viario a corto plazo bajo condiciones de fallo de sensores. Lo desarrolla ParadoxAI Lab (Aditya Kumar y Anupam Singh) dentro de su serie Paradox World Model, y corresponde al modelo numero 16 de los 56 publicados en el repositorio de la organizacion. La tarea concreta es predecir los siguientes 12 pasos temporales de trafico en la red PEMS07 de Caltrans (Distrito 7, Los Angeles; 883 sensores), manteniendo la precision incluso cuando parte de los sensores dejan de reportar datos.

El modelo es extremadamente compacto: 408.356 parametros totales, con un unico fichero de pesos de 1,6 MB en formato `.pt` (PyTorch state dict). No es un modelo de lenguaje ni un transformer generativo de proposito general, sino un modelo predictivo de dominio especifico entrenado sobre datos espaciotemporales de trafico. Esta orientado a integracion en pipelines de investigacion y despliegue ligero, no a inferencia conversacional.

Su relevancia practica radica en el enfoque sobre robustez ante outages: la version v0.7 incorpora entrenamiento especifico con caidas reales de sensores ("fallback base + outage training"), lo que segun la model card reduce el error en escenarios de outage real entre un 11 % y un 22 % respecto a v0.6 en cinco redes, con un coste en escenarios limpios de solo +0,4 % a +1,8 %. La licencia Apache-2.0 facilita su uso comercial y su reutilizacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo predictivo espaciotemporal de dominio especifico; codigo en repositorio GitHub del autor) |
| Parametros totales | 408.356 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (horizonte de prediccion de 12 pasos) |
| Tipos de cuantizacion | no disponible (pesos en precision de entrenamiento; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible (no procesa lenguaje natural; opera sobre series numericas de trafico) |
| Licencia | Apache-2.0 |
| Formato de pesos | `.pt` (PyTorch state dict, fichero `16_pwm-dyn_v0.7_PEMS07.pt`, 1.666.241 bytes) |
| Pipeline (Hugging Face) | time-series-forecasting |
| Libreria | PyTorch |
| Dataset de referencia | PEMS07 (Caltrans PeMS District 7, Los Angeles; 883 sensores) |
| Fecha de entrenamiento | 2026-11-04 (Kaggle notebook 8ffe55b5c8, version 365414722, commit b0f6a08) |
| Fecha de publicacion | 2026-11-17 |
| Tamano del repositorio | 0,0 GB (segun Hugging Face) |

## Arquitectura y entrenamiento

La model card no detalla la arquitectura interna (capas, tipo de bloque, mecanismo de atencion o recurrencia). Lo que si se documenta es que el codigo de arquitectura de esta version esta en el repositorio GitHub `paradoxailab/paradox-world-model` y que la configuracion exacta de entrenamiento se almacena dentro del propio fichero de pesos, accesible como `ck['cfg']` tras cargarlo con `torch.load`. El modelo se distribuye como state dict de PyTorch junto con un diccionario `meta` (nombre, tarea, datos, parametros, resultado y run de origen) y un diccionario `results` con todos los resultados registrados y los logs de ejecucion.

El entrenamiento se realizo sobre el dataset PEMS07, que cubre 883 sensores de la red de Caltrans en el Distrito 7 de Los Angeles. La innovacion tecnica declarada en v0.7 es la incorporacion de "fallback base + outage training": el modelo se entrena explicitamente con patrones de caida de sensores para que mantenga el pronostico cuando faltan observaciones. Segun la model card, esto reduce el error en outages reales (Track G) entre un 11 % y un 22 % frente a v0.6 en cinco redes, con un incremento de error en condiciones limpias de entre un 0,4 % y un 1,8 %. No se especifica el numero de tokens ni la composicion exacta del dataset de entrenamiento; los datos no se incluyen en el repositorio y sus fuentes y terminos se remiten a `DATA_SOURCES.md` del GitHub. No se documenta el uso de RLHF, DPO ni tecnicas de alineacion, algo esperable en un modelo de pronostico numerico.

## Capacidades

- Pronostico de trafico a corto plazo: predice los siguientes 12 pasos temporales de la red PEMS07.
- Robustez ante fallos de sensores: entrenado especificamente para mantener la prediccion bajo outages reales de sensores.
- Modelado espaciotemporal: captura dependencias entre los 883 sensores de la red, segun la naturaleza del dataset.
- Inferencia en CPU: el checkpoint se carga con `map_location="cpu"`, lo que permite ejecucion sin GPU.
- Trazabilidad de resultados: el fichero incluye metadatos, configuracion y logs de los resultados registrados.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingues: no es un modelo de lenguaje.
- No dispone de modo thinking, vision ni audio.

## Casos de uso

- Gestion de incidencias en redes de trafico: el modelo predice la evolucion del flujo durante caidas de sensores, permitiendo a los centros de control mantener estimaciones aunque parte de la instrumentacion falle. Su entrenamiento con outages reales lo hace adecuado para este escenario.
- Planificacion de capacidad a corto plazo: con horizonte de 12 pasos, sirve para anticipar congestiones en la red de Los Angeles y alimentar sistemas de gestion de semaforos o paneles de informacion variable.
- Investigacion en pronostico espaciotemporal: al ser un modelo de 408.356 parametros con pesos abiertos y codigo en GitHub, es util como baseline reproducible en experimentos academicos sobre PEMS07.
- Despliegue en entornos con recursos limitados: su tamano de 1,6 MB y la carga en CPU permiten integrarlo en dispositivos edge o en servicios sin GPU dedicada.
- Benchmarking de robustez: el fichero incluye resultados registrados (MAE limpio y en outages) que permiten comparar contra otros modelos de la serie PWM-Dyn.
- Prototipado rapido de sistemas de prediccion de trafico: la API de carga via `huggingface_hub` y la configuracion embebida en el checkpoint simplifican la reproduccion de experimentos.
- Evaluacion comparativa de versiones: la serie incluye variantes para otras redes (pems03, metr-la), lo que permite estudiar la transferibilidad del enfoque entre ciudades y sensores.

## Benchmarks y rendimiento

Resultados registrados en la model card (ParadoxBench-1.2, conjunto de test):

| Metrica | Valor |
|---|---|
| MAE en condiciones limpias (clean) | 19,78 |
| MAE con outages reales (Track G) | 25,01 |
| Configuracion | Ensemble de 3 semillas (este fichero corresponde a la semilla 200) |

Comparativa de versiones segun la model card:

| Cambio | Efecto declarado |
|---|---|
| Error en outages reales vs v0.6 | -11 % a -22 % en cinco redes |
| Error en condiciones limpias vs v0.6 | +0,4 % a +1,8 % |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ya que no aplican a un modelo de pronostico de series temporales.

## Requisitos de hardware

- VRAM estimada para inferencia: practicamente nula; el checkpoint de 1,6 MB y 408.356 parametros cabe en memoria CPU sin problema.
- GPU recomendadas: no se requieren; cualquier GPU con PyTorch es suficiente y no aporta ventaja significativa dado el tamano del modelo.
- Compatibilidad con GPU de consumo: si, en cualquier GPU consumer (RTX 4090, RTX 3060, etc.) e incluso en CPU.
- Opciones de despliegue: carga directa con `torch.load` y `huggingface_hub.hf_hub_download`; no se documenta soporte para vLLM, llama.cpp, Ollama o TGI (no aplican a este tipo de modelo).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / horizonte | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PWM-Dyn v0.7 (este) | 408.356 | 12 pasos | Trafico PEMS07 con outages | Apache-2.0 | Hugging Face + GitHub |
| PWM-Dyn v0.6 | no disponible | 12 pasos | Trafico PEMS07 | Apache-2.0 | Hugging Face (serie) |
| PWM-Dyn v0.7 (pems03) | no disponible | 12 pasos | Trafico PEMS03 | Apache-2.0 | Hugging Face |
| PWM-Dyn v0.7 (metr-la) | no disponible | 12 pasos | Trafico METR-LA | Apache-2.0 | Hugging Face |

No se dispone de datos de benchmarks de modelos externos comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Dominio muy restringido: solo predice trafico sobre la red PEMS07; no es generalizable a otras tareas sin reentrenamiento.
- Sesgos de los datos de origen: los patrones aprendidos reflejan la red de Caltrans en Los Angeles, con sus sesgos geograficos y temporales; no se garantiza su validez en otras ciudades.
- Riesgo de degradacion ante outages severos no vistos en entrenamiento: aunque v0.7 mejora la robustez, el MAE en outages (25,01) es superior al limpio (19,78).
- Horizonte limitado: solo 12 pasos hacia adelante; no sirve para pronosticos de mayor alcance.
- Sin documentacion de la arquitectura interna en la model card: la reproducibilidad depende del repositorio GitHub del autor.
- Datos de entrenamiento no incluidos: las fuentes y terminos se remiten a `DATA_SOURCES.md`; conviene revisarlos antes de uso comercial.
- Ausencia de benchmarks externos: los resultados son los registrados por el propio autor (ParadoxBench-1.2), sin validacion independiente conocida.
- Licencia Apache-2.0: permite uso comercial y modificacion, pero requiere mantener el aviso de licencia y la atribucion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/PARADOXAIlabs/pwm-dyn-v0.7-pems07
- Repositorio GitHub: https://github.com/paradoxailab/paradox-world-model
- Resultados: https://github.com/paradoxailab/paradox-world-model/blob/main/RESULTS.md
- Documentacion v0.7 realworld: https://github.com/paradoxailab/paradox-world-model/blob/main/v0.7-realworld/README.md
- Indice de la serie: https://github.com/paradoxailab/paradox-world-model/blob/main/models/series/README.md
- Fuentes de datos: https://github.com/paradoxailab/paradox-world-model/blob/main/DATA_SOURCES.md
- Citacion: https://github.com/paradoxailab/paradox-world-model/blob/main/CITATION.cff
- Version anterior (v0.7 pems03): https://huggingface.co/PARADOXAIlabs/pwm-dyn-v0.7-pems03
- Version siguiente (v0.7 metr-la): https://huggingface.co/PARADOXAIlabs/pwm-dyn-v0.7-metr-la
- Todos los modelos de la serie: https://huggingface.co/PARADOXAIlabs/paradox-world-model-series
- Sitio del laboratorio: https://paradoxailab.com
