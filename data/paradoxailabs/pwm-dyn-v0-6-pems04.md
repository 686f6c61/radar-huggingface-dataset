# PARADOXAIlabs/pwm-dyn-v0.6-pems04

## Resumen

PWM-Dyn v0.6 (variante PEMS04) es un modelo de prediccion de series temporales espacio-temporales desarrollado por ParadoxAI Lab (Aditya Kumar, Anupam Singh) dentro de su serie Paradox World Model. Concretamente, el modelo resuelve la tarea de predecir los siguientes 12 pasos temporales de trafico sobre el conjunto de datos PEMS04 (307 sensores del distrito 4 de Caltrans en el area de la bahia de San Francisco, enero-febrero de 2018). Se trata de un modelo muy compacto, de solo 334.436 parametros, entrenado desde cero y publicado como checkpoint PyTorch.

El modelo es relevante por su enfoque de eficiencia extrema: con menos de 350.000 parametros reporta un MAE de 18,46 en el test de ParadoxBench-1.1 Track A (ensamblado de 3 semillas; el archivo publicado corresponde a la semilla 100) y, segun la model card, supera a reimplementaciones de STID, Graph WaveNet y STAEformer en PEMS04, PEMS07, METR-LA y PEMS-BAY.

Esta version (v0.6) introduce como cambio principal la eliminacion de la entrada de climatologia, que era la fuente de la perdida en v0.4. El modelo se distribuye con licencia Apache-2.0 y el codigo de arquitectura vive en un repositorio GitHub separado; el checkpoint incluye metadatos, configuracion y registros de resultados en el propio archivo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (codigo en repositorio GitHub del autor; no detallado en la model card) |
| Parametros totales | 334.436 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (tarea de horizonte fijo de 12 pasos) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de series temporales, no linguistico) |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch (`.pt`, checkpoint con `meta`, `weights`, `results` y `cfg`) |

## Arquitectura y entrenamiento

La model card no detalla la arquitectura interna del modelo; solo indica que el codigo esta en el repositorio GitHub `paradoxailab/paradox-world-model` y que la configuracion de entrenamiento se almacena en el propio checkpoint bajo la clave `ck['cfg']`. No se especifica si se trata de un transformer, una red grafica espacio-temporal, un modelo recurrente o una combinacion hibrida.

El entrenamiento se realizo sobre PEMS04 (307 sensores, datos de enero a febrero de 2018) con el objetivo de predecir los 12 pasos siguientes. El modelo se entreno el 3 de noviembre de 2026 en un cuaderno de Kaggle (version 365009705) y se publico el 17 de noviembre de 2026. No se documentan en la informacion disponible el numero de tokens o muestras de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF/DPO (no aplicables en este dominio). El cambio tecnico destacado de v0.6 respecto a versiones anteriores es la eliminacion de la entrada de climatologia, que segun el autor era la causa de la perdida de rendimiento en v0.4.

## Capacidades

- Prediccion de trafico a corto plazo: genera los siguientes 12 pasos temporales a partir del historial de 307 sensores de PEMS04.
- Modelado espacio-temporal: captura dependencias entre sensores distribuidos geograficamente (tag `spatiotemporal`).
- Forecasting de series temporales multivariantes en general (pipeline `time-series-forecasting`).
- Evaluacion estandarizada: disenado para el benchmark ParadoxBench-1.1 Track A.
- Checkpoint autocontenido: incluye metadatos, pesos, configuracion y registros de resultados accesibles por clave.
- No soporta tool calling, agentes, vision, audio ni capacidades multilingues; es un modelo numerico de dominio especifico.

## Casos de uso

- Prediccion de trafico en tiempo real para paneles de gestion: el modelo toma el estado de los 307 sensores de PEMS04 y devuelve los proximos 12 pasos, util para sistemas de informacion al conductor con horizonte de minutos.
- Planificacion de rutas y estimacion de tiempos de llegada: integrado en un motor de enrutamiento, permite anticipar congestiones a corto plazo en corredores concretos de la bahia de San Francisco.
- Control semaforico adaptativo: las predicciones a 12 pasos pueden alimentar heuristicas de ajuste de fases en intersecciones instrumentadas, dado el bajo coste computacional del modelo.
- Deteccion de anomalias en sensores: comparando la prediccion con la lectura real se pueden identificar sensores averiados o eventos atipicos en la red viaria.
- Investigacion en modelos espacio-temporales eficientes: sirve como linea base reproducible de 334.436 parametros para comparar arquitecturas en PEMS04, PEMS07, METR-LA y PEMS-BAY.
- Despliegue en dispositivos con recursos limitados: su tamano (1,37 MB en disco) permite inferencia en CPU o en hardware embebido junto a la infraestructura de sensores.
- Evaluacion comparativa de benchmarks: util para replicar ParadoxBench-1.1 Track A y contrastar con STID, Graph WaveNet o STAEformer.

## Benchmarks y rendimiento

| Benchmark | Metrica | Resultado | Notas |
|---|---|---|---|
| ParadoxBench-1.1 Track A (PEMS04, test) | MAE | 18,46 | Ensamblado de 3 semillas (100-102); el archivo publicado es la semilla 100 |

Segun la model card, el modelo supera a reimplementaciones de STID, Graph WaveNet y STAEformer en PEMS04, PEMS07, METR-LA y PEMS-BAY, y mejora a v0.3 en PEMS08 y PEMS04. No se proporcionan en la informacion disponible las cifras concretas de esas comparaciones ni resultados de otros benchmarks (MMLU, HumanEval, GSM8K no aplican a este dominio).

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB; el checkpoint ocupa 1.368.193 bytes (aproximadamente 1,37 MB) y el modelo tiene 334.436 parametros.
- GPU recomendadas: cualquier GPU con al menos 1 GB de memoria; no se requiere A100, H100 ni RTX 4090. Una GPU integrada o incluso CPU es suficiente.
- Cabe en cualquier GPU de consumo (GTX 1050, RTX 3050, etc.) y en hardware embebido tipo Raspberry Pi o Jetson Nano.
- Opciones de despliegue: PyTorch nativo mediante `torch.load` con `weights_only=False`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; dado el tamano, se espera latencia de milisegundos en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / horizonte | MAE en PEMS04 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PWM-Dyn v0.6 (PEMS04) | 334.436 | 12 pasos | 18,46 (ParadoxBench-1.1 Track A) | Apache-2.0 | Hugging Face |
| STID | no disponible | no disponible | no disponible (superado segun el autor) | no disponible | no disponible |
| Graph WaveNet | no disponible | no disponible | no disponible (superado segun el autor) | no disponible | no disponible |
| STAEformer | no disponible | no disponible | no disponible (superado segun el autor) | no disponible | no disponible |

La model card afirma que PWM-Dyn v0.6 supera a STID, Graph WaveNet y STAEformer en PEMS04, PEMS07, METR-LA y PEMS-BAY, pero no incluye las cifras de esos modelos ni sus especificaciones en la informacion disponible.

## Limitaciones y advertencias

- Dominio muy restringido: solo predice trafico sobre la topologia de PEMS04 (307 sensores); no es un modelo general de series temporales sin reentrenamiento.
- Horizonte fijo de 12 pasos: no se documenta soporte para horizontes distintos ni para prediccion condicionada a variables exogenas (la climatologia se elimino en esta version).
- Sin datos de entrenamiento publicados: la model card indica que los datos no se incluyen; solo se documentan sus fuentes y terminos en `DATA_SOURCES.md`, lo que dificulta la reproducibilidad completa.
- Resultado reportado por el autor: el MAE de 18,46 corresponde al benchmark propio ParadoxBench-1.1 Track A, no a una comparacion independiente; conviene tratarlo con cautela hasta su replicacion externa.
- Riesgo de sobreajuste al dataset: con 334.436 parametros y un unico conjunto de datos, la generalizacion a otras ciudades o periodos no esta documentada.
- Sin informacion sobre sesgos: no se documentan analisis de sesgo, aunque el riesgo principal es la extrapolacion a condiciones de trafico no vistas (eventos, obras, meteorologia adversa).
- Licencia Apache-2.0: permite uso comercial y modificacion con atribucion; no se identifican restricciones adicionales en la informacion disponible.
- Estado "reported": la model card indica que los resultados estan registrados pero no se especifica un proceso de revision independiente.

## Enlaces

- Hugging Face: https://huggingface.co/PARADOXAIlabs/pwm-dyn-v0.6-pems04
- Repositorio GitHub: https://github.com/paradoxailab/paradox-world-model
- Resultados: https://github.com/paradoxailab/paradox-world-model/blob/main/RESULTS.md
- Conferencia v0.6: https://github.com/paradoxailab/paradox-world-model/blob/main/v0.6-conference/README.md
- Indice de la serie: https://github.com/paradoxailab/paradox-world-model/blob/main/models/series/README.md
- Fuentes de datos: https://github.com/paradoxailab/paradox-world-model/blob/main/DATA_SOURCES.md
- Citacion: https://github.com/paradoxailab/paradox-world-model/blob/main/CITATION.cff
- Version anterior (PEMS08): https://huggingface.co/PARADOXAIlabs/pwm-dyn-v0.6-pems08
- Version siguiente (PEMS03): https://huggingface.co/PARADOXAIlabs/pwm-dyn-v0.6-pems03
- Todos los modelos de la serie: https://huggingface.co/PARADOXAIlabs/paradox-world-model-series
- Sitio del autor: https://paradoxailab.com
