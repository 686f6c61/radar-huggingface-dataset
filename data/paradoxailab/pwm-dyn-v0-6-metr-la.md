# paradoxailab/pwm-dyn-v0.6-metr-la

## Resumen

PWM-Dyn v0.6 (variante METR-LA) es un modelo de prediccion de series temporales espacio-temporales desarrollado por ParadoxAI Lab dentro de su serie Paradox World Model. Se trata del modelo numero 11 de 56 publicados (numeracion de serie 01-59) y esta especializado en la prediccion de los siguientes 12 pasos de trafico sobre la red de sensores de la autopista de Los Angeles (METR-LA, 207 sensores de bucle inductivo). El modelo es extremadamente compacto: 321.636 parametros en total, lo que lo situa en la categoria de modelos ligeros para forecasting.

La relevancia de esta version radica en dos cambios concretos respecto a iteraciones anteriores: la eliminacion de la entrada de climatologia (que lastraba la version v0.4) y la mejora de resultados frente a v0.3 en los conjuntos PEMS08 y PEMS04. Segun la model card, el modelo supera a reimplementaciones de STID, Graph WaveNet y STAEformer en PEMS04, PEMS07, METR-LA y PEMS-BAY. El resultado registrado en ParadoxBench-1.1 Track A es un MAE de 2,92 en test con un ensemble de 3 semillas (100-102); el archivo publicado corresponde a la semilla 100.

El modelo se distribuye como un unico checkpoint PyTorch (`.pt`, 1.314.354 bytes) que contiene pesos, configuracion de entrenamiento (`ck['cfg']`), metadatos y registros de resultados. La licencia es Apache-2.0, lo que permite uso comercial sin restricciones adicionales. No se proporcionan datos sobre arquitectura interna detallada, composicion del dataset de entrenamiento ni soporte multilingue, ya que la tarea es puramente numerica y espacio-temporal.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo espacio-temporal para series temporales; codigo en repositorio GitHub) |
| Parametros totales | 321.636 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (tarea fija: prediccion de los siguientes 12 pasos) |
| Tipos de cuantizacion | no disponible (checkpoint PyTorch en precision original) |
| Idiomas soportados | no aplica (modelo numerico de series temporales) |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch `.pt` (state dict dentro de un diccionario con metadatos) |

## Arquitectura y entrenamiento

La model card no detalla la arquitectura interna mas alla de etiquetarla como modelo espacio-temporal para forecasting de trafico. El codigo de la arquitectura de esta version esta disponible en el repositorio GitHub de Paradox World Model y la configuracion exacta de entrenamiento se almacena dentro del propio checkpoint en la clave `ck['cfg']`. El modelo opera sobre la red de 207 sensores de METR-LA y produce predicciones para los siguientes 12 pasos temporales.

El entrenamiento se realizo el 2-3 de noviembre de 2026 en un notebook de Kaggle (identificador `d0ba070ac4`, version 365009705) y el modelo se publico el 17 de noviembre de 2026. El cambio principal de esta version respecto a v0.4 es la eliminacion de la entrada de climatologia, que segun el autor era la causa de la perdida de rendimiento en esa iteracion. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO (no aplicables en este dominio). Los datos de entrenamiento no se incluyen en el repositorio; sus fuentes y terminos se documentan en `DATA_SOURCES.md` del repositorio GitHub.

## Capacidades

- Prediccion de trafico a corto plazo: genera los siguientes 12 pasos temporales sobre la red de 207 sensores de METR-LA.
- Forecasting espacio-temporal multivariante: modela dependencias entre sensores de una red de carreteras.
- Evaluacion comparativa: incluye resultados registrados frente a STID, Graph WaveNet y STAEformer en cuatro conjuntos de datos (PEMS04, PEMS07, METR-LA, PEMS-BAY).
- Ensemble reproducible: el checkpoint publicado corresponde a la semilla 100 de un ensemble de 3 semillas (100-102) que alcanza el MAE reportado.
- Carga programatica: el archivo `.pt` expone metadatos (`ck['meta']`), pesos (`ck['weights']`), configuracion (`ck['cfg']`) y registros de resultados (`ck['results']`).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni capacidades multilingues: es un modelo puramente numerico de forecasting.

## Casos de uso

- Prediccion de trafico en tiempo real para paneles de gestion de autopistas: el modelo produce los 12 pasos siguientes (tipicamente 5-60 minutos segun el intervalo de muestreo de METR-LA) sobre 207 sensores, adecuado para sistemas de informacion al conductor en la red de Los Angeles.
- Alimentacion de sistemas de enrutamiento dinamico: las predicciones por sensor permiten calcular tiempos de viaje estimados y desviar trafico antes de que se formen congestiones.
- Investigacion academica en forecasting espacio-temporal: el modelo sirve como baseline ligero (321.636 parametros) para comparar contra STID, Graph WaveNet y STAEformer con resultados registrados en ParadoxBench-1.1.
- Benchmarking reproducible: el checkpoint incluye configuracion y logs, lo que permite reproducir el MAE 2,92 con las semillas documentadas.
- Deteccion de anomalias en sensores de trafico: comparar la prediccion del modelo con la lectura real permite identificar sensores defectuosos o incidentes.
- Integracion en pipelines de simulacion de trafico: las predicciones a 12 pasos pueden alimentar simuladores macroscopicos o modelos de asignacion de rutas.
- Prototipado rapido en entornos con recursos limitados: el tamano del checkpoint (1,3 MB) permite desplegarlo en CPU o dispositivos edge sin GPU dedicada.

## Benchmarks y rendimiento

| Benchmark | Metrica | Resultado | Notas |
|---|---|---|---|
| ParadoxBench-1.1 Track A (test) | MAE | 2,92 | Ensemble de 3 semillas (100-102); el archivo publicado es la semilla 100 |

Segun la model card, el modelo supera a reimplementaciones de STID, Graph WaveNet y STAEformer en PEMS04, PEMS07, METR-LA y PEMS-BAY, y mejora a v0.3 en PEMS08 y PEMS04. No se proporcionan en la informacion disponible las cifras concretas de MAE, RMSE o MAPE para cada uno de esos conjuntos ni para los modelos comparados, por lo que no se incluyen en esta tabla.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 100 MB; el checkpoint pesa 1.314.354 bytes (aproximadamente 1,3 MB) y el modelo tiene 321.636 parametros.
- GPU recomendadas: cualquier GPU moderna es sobredimensionada; el modelo funciona correctamente en CPU. Una NVIDIA T4, RTX 3060 o superior no aporta ventaja significativa frente a CPU para inferencia por lotes pequenos.
- Cabe en cualquier GPU consumer, incluida una GTX 1050 o una iGPU con suficiente memoria compartida; tambien en Raspberry Pi y dispositivos edge.
- Opciones de despliegue: carga directa con PyTorch (`torch.load`) segun el ejemplo de la model card; tambien exportable a TorchScript u ONNX si se requiere. No se documenta soporte nativo para vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles en la informacion proporcionada. Dado el tamano, se espera latencia de milisegundos en CPU para un lote de 207 sensores.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / tarea | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PWM-Dyn v0.6 METR-LA | 321.636 | 12 pasos siguientes, 207 sensores | MAE 2,92 (ParadoxBench-1.1 Track A, ensemble 3 semillas) | Apache-2.0 | Hugging Face + GitHub |
| STID | no disponible | Forecasting espacio-temporal | Inferior segun model card (sin cifras) | no disponible | Reimplementacion citada por el autor |
| Graph WaveNet | no disponible | Forecasting espacio-temporal con grafos | Inferior segun model card (sin cifras) | no disponible | Reimplementacion citada por el autor |
| STAEformer | no disponible | Forecasting espacio-temporal con transformer | Inferior segun model card (sin cifras) | no disponible | Reimplementacion citada por el autor |

No se dispone de cifras numericas de los modelos comparados en la informacion proporcionada; la afirmacion de superioridad procede de la model card del autor y no se ha verificado de forma independiente.

## Limitaciones y advertencias

- Dominio muy restringido: el modelo solo predice trafico sobre la red METR-LA (207 sensores de Los Angeles); no es transferible a otras ciudades o redes sin reentrenamiento.
- Horizonte fijo: prediccion de 12 pasos; no admite configuracion de horizontes distintos sin modificar el codigo.
- Sin capacidades de lenguaje, vision ni agentes: no debe confundirse con un LLM; no procesa texto ni instrucciones.
- Riesgo de sobreajuste a la topologia de METR-LA: el rendimiento en sensores nuevos o reubicados no esta documentado.
- Datos de entrenamiento no incluidos: la reproducibilidad completa depende de `DATA_SOURCES.md` y de los terminos de las fuentes originales.
- Resultados reportados por el autor: el MAE 2,92 procede de ParadoxBench-1.1 definido por el propio laboratorio; no se han publicado evaluaciones independientes.
- Sesgos: no documentados; al ser un modelo numerico, los sesgos potenciales se refieren a la cobertura de la red de sensores y a las condiciones de trafico del periodo de entrenamiento.
- Alucinacion: no aplica en el sentido de generacion de texto, pero las predicciones pueden divergir de la realidad en eventos anomalos (accidentes, obras, condiciones meteorologicas extremas) no representados en el entrenamiento.
- Licencia Apache-2.0: permite uso comercial y modificacion con atribucion; no se identifican restricciones adicionales en la informacion disponible.
- Estado "reported": la model card indica que el modelo esta en estado reportado, no verificado de forma independiente.

## Enlaces

- Hugging Face: https://huggingface.co/paradoxailab/pwm-dyn-v0.6-metr-la
- Repositorio GitHub: https://github.com/paradoxailab/paradox-world-model
- Resultados: https://github.com/paradoxailab/paradox-world-model/blob/main/RESULTS.md
- Conferencia v0.6: https://github.com/paradoxailab/paradox-world-model/blob/main/v0.6-conference/README.md
- Indice de la serie: https://github.com/paradoxailab/paradox-world-model/blob/main/models/series/README.md
- Fuentes de datos: https://github.com/paradoxailab/paradox-world-model/blob/main/DATA_SOURCES.md
- Citacion: https://github.com/paradoxailab/paradox-world-model/blob/main/CITATION.cff
- Modelo anterior (#10, PEMS07): https://huggingface.co/paradoxailab/pwm-dyn-v0.6-pems07
- Modelo siguiente (#12, PEMS-BAY): https://huggingface.co/paradoxailab/pwm-dyn-v0.6-pems-bay
- Todos los modelos de la serie: https://huggingface.co/paradoxailab/paradox-world-model-series
- Sitio del laboratorio: https://paradoxailab.com
