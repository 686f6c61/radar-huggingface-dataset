# paradoxailab/pwm-dyn-v0.4.1-pems04

## Resumen

PWM-Dyn v0.4.1 (variante PEMS04) es un modelo de prediccion de series temporales espacio-temporales desarrollado por ParadoxAI Lab (Aditya Kumar y Anupam Singh) dentro de su linea Paradox World Model. Se trata del modelo numero 6 de una serie de 56 publicados y resuelve una tarea muy concreta: predecir los siguientes 12 pasos de flujo de trafico a partir de datos de sensores. El checkpoint publicado corresponde al dataset PEMS04 (307 sensores del distrito 4 de Caltrans en el area de la bahia de San Francisco, enero-febrero de 2018).

A diferencia de los modelos de lenguaje masivos, este es un modelo muy pequeno (335.684 parametros) entrenado especificamente para forecasting de trafico. Su relevancia no radica en capacidades generales, sino en servir como referencia reproducible de la familia PWM-Dyn: el autor publica pesos, configuracion de entrenamiento, resultados por semilla y logs dentro del propio fichero `.pt`. El modelo reporta un MAE de 19,02 en el test de ParadoxBench-1 Track A con un ensemble de tres semillas (este fichero es la semilla 0).

La version v0.4.1 introduce un cambio de receta de entrenamiento seleccionada sobre validacion de PEMS08 (100 epocas), que mejoro el resultado de Track B en PEMS08 de 14,38 a 14,15. La licencia es Apache-2.0 y el formato de pesos es un state dict de PyTorch empaquetado con metadatos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (codigo en repositorio GitHub, no detallado en la model card) |
| Parametros totales | 335.684 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (tarea: prediccion de 12 pasos siguientes) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de series temporales, no linguistico) |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch state dict en fichero `.pt` (`06_pwm-dyn_v0.4.1_PEMS04.pt`, 1.369.279 bytes) |

## Arquitectura y entrenamiento

La model card no detalla la arquitectura interna del modelo; indica que el codigo de la version esta en el repositorio de GitHub `paradoxailab/paradox-world-model` y que la configuracion de entrenamiento esta embebida en el fichero (`ck['cfg']`). Por el nombre de la familia (PWM-Dyn, "Paradox World Model", dynamic) y las etiquetas (`spatiotemporal`, `traffic-forecasting`), se trata de un modelo orientado a modelado dinamico de series espacio-temporales, pero no se especifica si es un transformer, una GNN, un modelo estado-espacio o una combinacion.

El entrenamiento se realizo el 2026-11-01 en un notebook de Kaggle (version 364348754) y el modelo se publico el 2026-11-17. Los datos de entrenamiento no se incluyen en el repositorio; sus fuentes y terminos estan en `DATA_SOURCES.md`. La receta de la version v0.4.1 se selecciono sobre la validacion de PEMS08 con 100 epocas. El fichero incluye metadatos (`ck["meta"]`), pesos (`ck["weights"]`), resultados registrados (`ck["results"]`) y logs de la ejecucion. No se documenta uso de RLHF, DPO ni tecnicas de decodificacion especulativa.

## Capacidades

- Prediccion de los siguientes 12 pasos de flujo de trafico a partir de datos de sensores de PEMS04.
- Modelado espacio-temporal sobre una red de 307 sensores (dependencias entre estaciones).
- Forecasting multi-paso (horizonte de 12 pasos).
- Evaluacion reproducible: el fichero incluye resultados por semilla y logs de entrenamiento.
- No dispone de generacion de texto, razonamiento, codigo, matematicas, vision, audio ni capacidades multilingues.
- No soporta tool calling, function calling ni comportamiento de agente.
- No dispone de modo "thinking" ni capacidades especiales mas alla del forecasting.

## Casos de uso

- Prediccion de trafico a corto plazo en una red de sensores: el modelo genera los 12 pasos siguientes de flujo para los 307 sensores de PEMS04, util para sistemas de gestion de trafico que necesitan anticipar congestion a horizonte corto.
- Investigacion reproducible en forecasting espacio-temporal: al incluir pesos, configuracion y logs en el propio fichero, sirve como baseline verificable para comparar nuevas arquitecturas sobre PEMS04.
- Evaluacion de recetas de entrenamiento: el cambio documentado en v0.4.1 (seleccion sobre validacion de PEMS08) permite estudiar como afecta la receta a distintos datasets de trafico.
- Prototipado de pipelines de series temporales: el tamano (335.684 parametros) permite cargar el modelo en CPU (`map_location="cpu"`) y ejecutarlo en entornos sin GPU, util para pruebas de integracion.
- Benchmark interno (ParadoxBench-1): el modelo reporta MAE 19,02 en Track A con ensemble de tres semillas, por lo que puede usarse como referencia en la comparativa de la serie PWM-Dyn.
- Reproduccion de resultados cientificos: la inclusion de la semilla 0 y de los resultados de las tres semillas facilita replicar el ensemble reportado por el autor.

## Benchmarks y rendimiento

| Benchmark | Metrica | Resultado | Notas |
|---|---|---|---|
| ParadoxBench-1 Track A (PEMS04) | MAE | 19,02 | Ensemble de 3 semillas; este fichero es la semilla 0 |
| ParadoxBench-1 Track B (PEMS08) | Metrica no especificada | 14,15 | Mejora desde 14,38 en v0.4.1 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ya que el modelo no es linguistico.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB; el fichero de pesos ocupa 1.369.279 bytes (~1,3 MB) y el modelo tiene 335.684 parametros.
- GPU recomendadas: cualquier GPU con al menos 1 GB de memoria; tambien es viable en CPU (`map_location="cpu"` segun el ejemplo de carga de la model card).
- Cabe en cualquier GPU consumer (RTX 3050, RTX 4060, GTX 1650, etc.) e incluso en entornos sin GPU.
- Opciones de despliegue: carga directa con PyTorch (`torch.load`), descarga via `huggingface_hub.hf_hub_download`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / horizonte | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PWM-Dyn v0.4.1 PEMS04 | 335.684 | 12 pasos | MAE 19,02 (Track A, ensemble 3 semillas) | Apache-2.0 | Hugging Face |
| PWM-Dyn v0.4.1 PEMS08 (#05) | no disponible | 12 pasos | Track B PEMS08 14,38 -> 14,15 en v0.4.1 | Apache-2.0 | Hugging Face |
| PWM-Dyn v0.6 PEMS08 (#07) | no disponible | no disponible | no disponible | Apache-2.0 | Hugging Face |

No se dispone de datos de modelos externos comparables (misma tarea y dataset) en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo especifico de un unico dataset (PEMS04, 307 sensores, enero-febrero de 2018); no es generalizable a otras redes de trafico sin reentrenamiento.
- No es un modelo de lenguaje: no genera texto, codigo ni responde a instrucciones.
- El resultado reportado (MAE 19,02) corresponde a un ensemble de tres semillas; el fichero publicado es solo la semilla 0, por lo que el rendimiento individual puede diferir del reportado.
- No se documenta la arquitectura ni la composicion exacta de los datos de entrenamiento en la model card; la reproducibilidad depende del codigo en GitHub y de `DATA_SOURCES.md`.
- Riesgo de sesgo derivado de los datos de Caltrans PeMS District 4 (area de la bahia de San Francisco, periodo concreto); el comportamiento en otras regiones o epocas no esta validado.
- No se documentan riesgos de alucinacion en el sentido linguistico, pero si de error de prediccion fuera de la distribucion de entrenamiento.
- Licencia Apache-2.0: permite uso comercial con atribucion y conservacion del aviso de licencia; no se especifican restricciones adicionales.
- El modelo se publico con 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en produccion por terceros.

## Enlaces

- Hugging Face: https://huggingface.co/paradoxailab/pwm-dyn-v0.4.1-pems04
- Repositorio GitHub: https://github.com/paradoxailab/paradox-world-model
- Resultados: https://github.com/paradoxailab/paradox-world-model/blob/main/RESULTS.md
- README de ParadoxBench v0.4: https://github.com/paradoxailab/paradox-world-model/blob/main/v0.4-paradoxbench/README.md
- Indice de la serie: https://github.com/paradoxailab/paradox-world-model/blob/main/models/series/README.md
- Fuentes de datos: https://github.com/paradoxailab/paradox-world-model/blob/main/DATA_SOURCES.md
- Citacion: https://github.com/paradoxailab/paradox-world-model/blob/main/CITATION.cff
- Modelo anterior (#05): https://huggingface.co/paradoxailab/pwm-dyn-v0.4.1-pems08
- Modelo siguiente (#07): https://huggingface.co/paradoxailab/pwm-dyn-v0.6-pems08
- Todos los modelos de la serie: https://huggingface.co/paradoxailab/paradox-world-model-series
- Web del laboratorio: https://paradoxailab.com
