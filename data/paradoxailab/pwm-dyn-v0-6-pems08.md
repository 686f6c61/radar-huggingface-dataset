# paradoxailab/pwm-dyn-v0.6-pems08

## Resumen

PWM-Dyn v0.6 (checkpoint `pems08`) es un modelo de prediccion de series temporales espacio-temporales desarrollado por ParadoxAI Lab (Aditya Kumar y Anupam Singh) dentro de su familia Paradox World Model. Resuelve una tarea muy concreta: el pronostico de los proximos 12 pasos de trafico sobre la red de 170 sensores de PEMS08 (Caltrans PeMS District 8, San Bernardino, julio-agosto de 2016). Es el modelo numero 7 de una serie de 56 publicados (numeracion de serie 01-59).

Se trata de un modelo de muy pequeno tamano, con 316.900 parametros, lo que lo situa en la categoria de modelos ligeros de forecasting especializados, no en la de modelos de lenguaje. Su relevancia es metodologica: la version v0.6 elimina la entrada de climatologia que lastraba la v0.4 y, segun los resultados registrados por el autor, supera a v0.3 en PEMS08 y PEMS04 y es el mejor en PEMS04, PEMS07, METR-LA y PEMS-BAY frente a re-ejecuciones de STID, Graph WaveNet y STAEformer.

La arquitectura exacta no se detalla en la model card: el codigo reside en el repositorio GitHub del proyecto y la configuracion de entrenamiento se almacena dentro del propio checkpoint (`ck['cfg']`). El checkpoint publicado corresponde a la semilla 100 de un ensemble de 3 semillas (100-102) que reporta un MAE de 14,12 en ParadoxBench-1.1 Track A test.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (codigo en repositorio GitHub; configuracion en `ck['cfg']`) |
| Parametros totales | 316.900 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (horizonte de prediccion: 12 pasos) |
| Tipos de cuantizacion | no disponible (checkpoint PyTorch en punto flotante, sin variantes GGUF/ONNX publicadas) |
| Idiomas soportados | no disponible (modelo numerico, no linguistico) |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch `.pt` (state dict dentro de un diccionario con claves `meta`, `weights`, `results`, `cfg`) |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna. Lo que si se conoce es que se trata de un modelo espacio-temporal para grafos de sensores (tags `spatiotemporal`, `traffic-forecasting`), entrenado sobre PEMS08 con 170 sensores y datos de julio a agosto de 2016, con horizonte de 12 pasos. El checkpoint incluye la configuracion completa de entrenamiento en `ck['cfg']` y los registros de ejecucion en `ck['results']`, por lo que los detalles arquitectonicos se pueden recuperar cargando el fichero o consultando el repositorio.

El entrenamiento se realizo el 2026-11-03 en un notebook de Kaggle (version 365009705) y el modelo se publico el 2026-11-17. El cambio principal de v0.6 respecto a versiones anteriores es la eliminacion de la entrada de climatologia, que era la causa de la perdida de rendimiento en v0.4. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de ajuste fino por refuerzo.

## Capacidades

- Pronostico de trafico a 12 pasos sobre redes de sensores (prediccion espacio-temporal multivariante).
- Modelado de dependencias entre 170 sensores de una misma red viaria.
- Evaluacion estandarizada contra lineas base de la literatura (STID, Graph WaveNet, STAEformer) mediante ParadoxBench-1.1 Track A.
- Capacidad de ensemble: el checkpoint publicado es una de tres semillas (100-102) que se combinan para el resultado reportado.
- No dispone de generacion de texto, razonamiento, codigo, vision, audio, tool calling ni capacidades multilingues: es un modelo puramente numerico de series temporales.

## Casos de uso

- Prediccion de trafico a corto plazo en gestion de carreteras: el modelo genera los proximos 12 pasos de ocupacion/flujo en 170 sensores de una red metropolitana, util para paneles de control de trafico y alertas tempranas de congestion.
- Planificacion de rutas y sistemas de navegacion: integrado en un motor de rutas, permite estimar la evolucion del trafico en los proximos intervalos y recalcular itinerarios con antelacion.
- Investigacion academica en forecasting espacio-temporal: sirve como linea base reproducible (checkpoint, configuracion y resultados incluidos) para comparar nuevos metodos en PEMS08.
- Benchmarking interno de pipelines: con 316.900 parametros y 1,3 MB de checkpoint, es adecuado para validar infraestructura de entrenamiento e inferencia en series temporales con bajo coste.
- Prototipado rapido en entornos con recursos limitados: cabe en CPU y en cualquier GPU consumer, lo que permite desplegarlo en dispositivos edge o en servidores modestos para pruebas de concepto.
- Ensemble de pronostico operativo: combinando las tres semillas del ensemble se obtiene el MAE reportado de 14,12, aplicable a sistemas de prediccion de trafico en produccion con requisitos de precision moderados.

## Benchmarks y rendimiento

Resultado registrado por el autor en la model card:

| Benchmark | Metrica | Resultado | Notas |
|---|---|---|---|
| ParadoxBench-1.1 Track A (test) | MAE | 14,12 | Ensemble de 3 semillas (100-102); este fichero es la semilla 100 |

Segun la model card, v0.6 supera a v0.3 en PEMS08 y PEMS04, y es el mejor en PEMS04, PEMS07, METR-LA y PEMS-BAY frente a re-ejecuciones de STID, Graph WaveNet y STAEformer. No se publican en la informacion disponible las cifras desglosadas por dataset ni los resultados individuales de cada linea base.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB; el checkpoint pesa 1.298.817 bytes (aproximadamente 1,3 MB) y el modelo tiene 316.900 parametros.
- GPU recomendadas: cualquier GPU moderna es sobredimensionada; funciona en CPU sin problema. Una RTX 4090, A100 o H100 no aportan ventaja practica para este tamano.
- Cabe en cualquier GPU consumer, incluida una GTX 1050 o una iGPU, y en dispositivos edge.
- Opciones de despliegue: PyTorch nativo (carga via `torch.load` y `hf_hub_download`); no se han publicado variantes para vLLM, llama.cpp, Ollama ni TGI, que ademas no son aplicables a este tipo de modelo.
- Latencia y throughput: no disponibles en la informacion proporcionada; por el tamano del modelo se espera una latencia muy baja, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / horizonte | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PWM-Dyn v0.6 (pems08) | 316.900 | 12 pasos | MAE 14,12 (ParadoxBench-1.1 Track A, ensemble 3 semillas) | Apache-2.0 | Hugging Face + GitHub |
| STID | no disponible | no disponible | Re-ejecutado como linea base; superado por v0.6 segun el autor | no disponible | no disponible |
| Graph WaveNet | no disponible | no disponible | Re-ejecutado como linea base; superado por v0.6 segun el autor | no disponible | no disponible |
| STAEformer | no disponible | no disponible | Re-ejecutado como linea base; superado por v0.6 segun el autor | no disponible | no disponible |

No se dispone en la informacion proporcionada de los parametros, contextos ni cifras concretas de las lineas base; solo se indica que v0.6 las supera en las re-ejecuciones realizadas por el autor.

## Limitaciones y advertencias

- Modelo muy especializado: solo predice trafico a 12 pasos sobre la topologia de PEMS08; no es transferible sin reentrenamiento a otras redes o tareas.
- Entrenado con datos de julio-agosto de 2016 en el distrito 8 de Caltrans; puede no generalizar a regimenes de trafico posteriores o a otras ciudades.
- El resultado de MAE 14,12 corresponde a un ensemble de 3 semillas; el checkpoint publicado es solo la semilla 100, por lo que el rendimiento individual puede diferir del reportado.
- No se han publicado resultados de benchmarks independientes; las comparaciones con STID, Graph WaveNet y STAEformer son re-ejecuciones del propio autor.
- Riesgo de sobreajuste a la distribucion estacional de verano del dataset original.
- No hay informacion sobre sesgos, robustez ante datos faltantes o calidad de sensores.
- Licencia Apache-2.0: permite uso comercial y modificacion con atribucion; no obstante, los datos de entrenamiento no se incluyen y sus terminos se detallan en `DATA_SOURCES.md`.
- Repositorio de 0,0 GB y creado en 2026: ecosistema muy reciente, con cero descargas y cero likes en el momento de la consulta, lo que implica ausencia de validacion externa.

## Enlaces

- Hugging Face: https://huggingface.co/paradoxailab/pwm-dyn-v0.6-pems08
- Repositorio GitHub: https://github.com/paradoxailab/paradox-world-model
- Resultados: https://github.com/paradoxailab/paradox-world-model/blob/main/RESULTS.md
- Conferencia v0.6: https://github.com/paradoxailab/paradox-world-model/blob/main/v0.6-conference/README.md
- Indice de la serie: https://github.com/paradoxailab/paradox-world-model/blob/main/models/series/README.md
- Fuentes de datos: https://github.com/paradoxailab/paradox-world-model/blob/main/DATA_SOURCES.md
- Citacion: https://github.com/paradoxailab/paradox-world-model/blob/main/CITATION.cff
- Version anterior: https://huggingface.co/paradoxailab/pwm-dyn-v0.4.1-pems04
- Version siguiente: https://huggingface.co/paradoxailab/pwm-dyn-v0.6-pems04
- Todos los modelos: https://huggingface.co/paradoxailab/paradox-world-model-series
- Sitio web: https://paradoxailab.com
