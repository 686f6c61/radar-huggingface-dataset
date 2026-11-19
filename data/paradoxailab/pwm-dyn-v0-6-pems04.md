# paradoxailab/pwm-dyn-v0.6-pems04

## Resumen

PWM-Dyn v0.6 (checkpoint `pwm-dyn-v0.6-pems04`) es un modelo de prediccion de series temporales espacio-temporales desarrollado por ParadoxAI Lab (Aditya Kumar, Anupam Singh) dentro de su serie Paradox World Model. Concretamente, resuelve la tarea de predecir los siguientes 12 pasos de trafico sobre el conjunto de datos PEMS04 (307 sensores del distrito 4 de Caltrans en el area de la bahia de San Francisco, enero-febrero de 2018). Es el modelo numero 8 de una serie de 56 publicados (numeracion 01-59).

Se trata de un modelo extremadamente compacto: 334.436 parametros en total, distribuido como un unico fichero PyTorch de 1,37 MB. No es un modelo de lenguaje ni un transformer generativo de proposito general, sino un modelo especializado de forecasting con arquitectura propia (cuyo codigo reside en el repositorio GitHub del autor, no en la model card). El checkpoint incluye metadatos, pesos (`state_dict`), configuracion de entrenamiento (`ck['cfg']`) y registros de resultados.

Su relevancia radica en que, segun los resultados reportados por el autor, supera a lineas base establecidas de forecasting espacio-temporal (STID, Graph WaveNet, STAEformer) en PEMS04, PEMS07, METR-LA y PEMS-BAY, con un MAE de 18,46 en ParadoxBench-1.1 Track A (ensemble de 3 semillas). La version v0.6 elimina la entrada de climatologia presente en v0.4, que segun el autor degradaba la perdida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (codigo en repositorio GitHub del autor; modelo espacio-temporal especializado) |
| Parametros totales | 334.436 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (predice 12 pasos hacia adelante sobre ventana de entrada no especificada) |
| Tipos de cuantizacion | no disponible (checkpoint PyTorch en precision original; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no aplica (modelo de series temporales, no linguistico) |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch `.pt` (fichero `08_pwm-dyn_v0.6_PEMS04.pt`, 1.368.193 bytes, SHA-256 `5fabdb3c302af258bf75ba2d6e2e71e4df1db7be62051ef7092aed65232b6222`) |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna; indica que el codigo de la version esta en el repositorio GitHub `paradoxailab/paradox-world-model` y que la configuracion de entrenamiento esta embebida en el checkpoint (`ck['cfg']`). Por los tags y la tarea, se trata de un modelo espacio-temporal para grafos de sensores de trafico, orientado a forecasting multi-horizonte (12 pasos). El tamano (334.436 parametros) sugiere una red compacta, probablemente con capas de agregacion espacial sobre el grafo de sensores y componentes temporales, aunque el detalle exacto no esta disponible en la informacion proporcionada.

El entrenamiento se realizo el 2026-11-03 en un notebook de Kaggle (version 365009705), con datos de PEMS04 (307 sensores, enero-febrero de 2018). El autor reporta que la version v0.6 elimina la entrada de climatologia que estaba presente en v0.4 (y que, segun sus notas, perjudicaba la perdida). No se documentan en la informacion disponible el numero de tokens/pasos de entrenamiento, la composicion exacta del dataset ni el uso de RLHF/DPO (no aplicable en este dominio). Los datos de entrenamiento no se incluyen en el repositorio; sus fuentes y terminos estan en `DATA_SOURCES.md`.

## Capacidades

- Prediccion de los siguientes 12 pasos de trafico sobre la red de sensores de PEMS04 (307 nodos).
- Forecasting espacio-temporal multivariante sobre grafos de sensores.
- Evaluacion estandarizada en ParadoxBench-1.1 Track A (MAE).
- Capacidad de ensemble: el resultado reportado (MAE 18,46) corresponde a un ensemble de 3 semillas (100-102); este fichero es la semilla 100.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso (no es un modelo linguistico).
- No tiene capacidades multilingues, de vision ni de audio.
- No dispone de modo "thinking" ni decodificacion especulativa.

## Casos de uso

- Prediccion de trafico a corto plazo en redes urbanas: el modelo genera los 12 pasos siguientes a partir del estado actual de los 307 sensores de PEMS04, adecuado para paneles de control de movilidad con horizonte de minutos.
- Investigacion comparativa de forecasting espacio-temporal: sirve como linea base reproducible (checkpoint, config y resultados incluidos) frente a STID, Graph WaveNet o STAEformer en benchmarks como ParadoxBench-1.1.
- Prototipado rapido en entornos con recursos limitados: con 334.436 parametros y 1,37 MB, se puede cargar y ejecutar en CPU o en cualquier GPU consumer sin practicamente consumo de VRAM.
- Reproducibilidad academica: el checkpoint incluye metadatos, configuracion y registros de ejecucion, lo que facilita auditoria y replicacion de resultados.
- Ensemble de modelos ligeros: al ser tan pequeno, es viable desplegar varias semillas en paralelo para reducir varianza en la prediccion, como hace el propio autor (3 semillas).
- Educacion y docencia: ejemplo compacto de pipeline de forecasting espacio-temporal con datos publicos de trafico.

## Benchmarks y rendimiento

Resultado reportado por el autor en ParadoxBench-1.1 Track A (test MAE):

| Metrica | Valor | Contexto |
|---|---|---|
| MAE (ParadoxBench-1.1 Track A) | 18,46 | Ensemble de 3 semillas (100-102); este fichero es la semilla 100 |
| Comparacion cualitativa | Mejor que STID, Graph WaveNet y STAEformer (re-ejecutados) en PEMS04, PEMS07, METR-LA y PEMS-BAY | Segun notas del autor; no se aportan cifras por modelo en la informacion disponible |

No se han publicado en la informacion disponible tablas detalladas con MMLU, HumanEval, GSM8K ni equivalentes (no aplicables). Tampoco se aportan cifras desglosadas por modelo comparable.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB (modelo de 334.436 parametros y fichero de 1,37 MB); cabe holgadamente en cualquier GPU.
- GPU recomendadas: cualquier GPU consumer (GTX 1650, RTX 3060, RTX 4090) o incluso CPU; no requiere A100 ni H100.
- Cabe en GPU consumer: si, en todas las gamas actuales.
- Opciones de despliegue: PyTorch nativo (`torch.load` sobre el `.pt`); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PWM-Dyn v0.6 (PEMS04) | 334.436 | no disponible | MAE 18,46 (ParadoxBench-1.1 Track A, ensemble 3 semillas) | Apache-2.0 | Hugging Face + GitHub |
| STID | no disponible en la informacion | no disponible | Peor que PWM-Dyn v0.6 segun el autor (sin cifras) | no disponible | no disponible |
| Graph WaveNet | no disponible en la informacion | no disponible | Peor que PWM-Dyn v0.6 segun el autor (sin cifras) | no disponible | no disponible |
| STAEformer | no disponible en la informacion | no disponible | Peor que PWM-Dyn v0.6 segun el autor (sin cifras) | no disponible | no disponible |

Los datos de los modelos comparables no se detallan en la informacion proporcionada; solo se indica que PWM-Dyn v0.6 los supera en las re-ejecuciones del autor.

## Limitaciones y advertencias

- Especializacion estrecha: solo predice trafico sobre PEMS04 (307 sensores, SF Bay Area, enero-febrero 2018); no es un modelo general ni transferible sin reentrenamiento.
- Resultados auto-reportados: el MAE 18,46 y las comparaciones con STID/Graph WaveNet/STAEformer provienen del propio autor; no se aportan cifras independientes ni desglose por modelo en la informacion disponible.
- El resultado reportado corresponde a un ensemble de 3 semillas; este fichero es solo la semilla 100, por lo que el rendimiento individual puede diferir del ensemble.
- No se documenta la arquitectura interna en la model card; hay que consultar el repositorio GitHub para reproducirla.
- Posible riesgo de sobreajuste al dataset concreto (307 sensores, dos meses de datos); no se documenta validacion cruzada espacial ni temporal mas alla de lo indicado.
- Sesgos: no aplica en el sentido linguistico, pero el modelo puede reflejar sesgos de la red de sensores de PEMS04 (cobertura geografica limitada al area de la bahia).
- Riesgo de alucinacion: no aplica (no genera texto), pero si puede producir predicciones poco fiables ante regimenes de trafico no vistos (incidentes, obras, eventos).
- Licencia Apache-2.0: permite uso comercial con atribucion; los datos de entrenamiento no se incluyen y sus terminos estan en `DATA_SOURCES.md`, por lo que el uso comercial debe verificar dichos terminos.
- Fecha de creacion del repositorio (2026-11-18) y de entrenamiento (2026-11-03): verificar vigencia y posibles actualizaciones de la serie.

## Enlaces

- Hugging Face: https://huggingface.co/paradoxailab/pwm-dyn-v0.6-pems04
- Repositorio GitHub: https://github.com/paradoxailab/paradox-world-model
- Resultados: https://github.com/paradoxailab/paradox-world-model/blob/main/RESULTS.md
- Conferencia v0.6: https://github.com/paradoxailab/paradox-world-model/blob/main/v0.6-conference/README.md
- Indice de la serie: https://github.com/paradoxailab/paradox-world-model/blob/main/models/series/README.md
- Fuentes de datos: https://github.com/paradoxailab/paradox-world-model/blob/main/DATA_SOURCES.md
- Citacion: https://github.com/paradoxailab/paradox-world-model/blob/main/CITATION.cff
- Modelo anterior (#07, PEMS08): https://huggingface.co/paradoxailab/pwm-dyn-v0.6-pems08
- Modelo siguiente (#09, PEMS03): https://huggingface.co/paradoxailab/pwm-dyn-v0.6-pems03
- Todos los modelos de la serie: https://huggingface.co/paradoxailab/paradox-world-model-series
- Web del autor: https://paradoxailab.com
