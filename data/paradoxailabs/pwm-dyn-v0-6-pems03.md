# PARADOXAIlabs/pwm-dyn-v0.6-pems03

## Resumen

PWM-Dyn v0.6 (variante PEMS03) es un modelo de prediccion de series temporales espaciotemporales desarrollado por ParadoxAI Lab (Aditya Kumar, Anupam Singh) como parte de la serie Paradox World Model. Se trata del modelo numero 9 de una serie de 56 publicados y esta especializado en la prediccion de los proximos 12 pasos de trafico viario sobre el conjunto de datos PEMS03 (Caltrans PeMS District 3, 358 sensores). No es un modelo de lenguaje: es un modelo predictivo compacto de 340.964 parametros orientado a forecasting de trafico.

El modelo resuelve el problema de la prediccion a corto plazo de flujos de trafico en redes de sensores, una tarea clasica en la literatura de grafos espacio-temporales (junto a STID, Graph WaveNet o STAEformer, que el autor cita como referencias comparativas). Su relevancia radica en su tamano extremadamente reducido (menos de 1,4 MB de checkpoint) combinado con un rendimiento declarado competitivo frente a arquitecturas mucho mayores en varios conjuntos de datos de trafico.

Esta version concreta elimina la entrada de climatologia respecto a v0.4 y, segun la model card, mejora a v0.3 en PEMS08 y PEMS04, y obtiene los mejores resultados en PEMS04, PEMS07, METR-LA y PEMS-BAY frente a re-ejecuciones de STID, Graph WaveNet y STAEformer. El checkpoint publicado corresponde a la semilla 100 de un ensemble de 3 semillas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (codigo en repositorio GitHub del autor; modelo espaciotemporal de grafos, detalles no especificados) |
| Parametros totales | 340.964 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (tarea de forecasting: horizonte de 12 pasos) |
| Tipos de cuantizacion | no disponible (checkpoint PyTorch en precision de entrenamiento) |
| Idiomas soportados | no aplica (modelo de series temporales, no linguistico) |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch `.pt` (state dict serializado con metadatos, configuracion y resultados) |

## Arquitectura y entrenamiento

La model card no detalla la arquitectura interna mas alla de clasificarla como modelo espaciotemporal para forecasting de trafico. El codigo de la arquitectura esta disponible en el repositorio GitHub del autor y la configuracion de entrenamiento se almacena dentro del propio checkpoint (clave `ck['cfg']`). Por los tags y la tarea (PEMS03, 358 sensores, horizonte de 12 pasos) se trata de un modelo de prediccion sobre grafo de sensores, pero no se especifica en la informacion disponible si emplea atencion, convoluciones de grafo, mecanismos recurrentes o una combinacion.

El entrenamiento se realizo el 2 y 3 de noviembre de 2026 en un notebook de Kaggle (identificador `d0ba070ac4`, version 365009705). No se indica el numero de tokens ni la composicion exacta del dataset mas alla de la fuente PEMS03. La version v0.6 introduce como cambio principal la eliminacion de la entrada de climatologia presente en versiones anteriores. El resultado registrado es un MAE de 14,34 en el test de ParadoxBench-1.1 Track A, obtenido con un ensemble de 3 semillas (100-102); el archivo publicado corresponde a la semilla 100. No se documentan tecnicas de RLHF, DPO ni decodificacion especulativa, dado que no es un modelo generativo de texto.

## Capacidades

- Prediccion de los proximos 12 pasos de trafico viario a partir de datos de 358 sensores de PEMS03.
- Forecasting espaciotemporal multivariante sobre grafos de sensores.
- Modelado de dependencias entre sensores (estructura espacial de la red viaria) y evolucion temporal.
- Inferencia en CPU (el ejemplo de carga usa `map_location="cpu"`).
- Checkpoint autocontenido: incluye pesos, metadatos, configuracion de entrenamiento y resultados registrados.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingues (no es un modelo de lenguaje).
- No dispone de modo thinking, vision ni audio.

## Casos de uso

- Prediccion de trafico a corto plazo en autopistas: el modelo genera los proximos 12 pasos de flujo para los 358 sensores de PEMS03, util para sistemas de gestion de trafico que necesitan anticipar congestiones con 12 intervalos de antelacion.
- Alimentacion de paneles de control de movilidad: al ser un checkpoint de 1,4 MB y ejecutable en CPU, puede integrarse en servicios ligeros que actualicen predicciones por sensor sin infraestructura GPU.
- Comparativa y benchmarking de modelos espaciotemporales: sirve como linea base reproducible (semillas y resultados registrados en el checkpoint) para investigadores que evaluen STID, Graph WaveNet o STAEformer.
- Investigacion academica sobre forecasting de trafico: la configuracion completa almacenada en `ck['cfg']` permite reproducir el entrenamiento y estudiar el efecto de eliminar la climatologia.
- Sistemas de alerta temprana de incidentes: la prediccion multi-sensor permite detectar desviaciones entre el flujo observado y el previsto en tramos concretos.
- Prototipado rapido en entornos con recursos limitados: su tamano permite desplegarlo en edge devices o contenedores pequenos para pruebas de concepto de prediccion de trafico.
- Evaluacion de ensembles: al publicarse una semilla de un ensemble de 3, puede combinarse con las otras semillas (100-102) para reproducir el MAE de 14,34 declarado.

## Benchmarks y rendimiento

| Benchmark | Metrica | Resultado | Notas |
|---|---|---|---|
| ParadoxBench-1.1 Track A (test) | MAE | 14,34 | Ensemble de 3 semillas (100-102); este archivo es la semilla 100 |
| PEMS04, PEMS07, METR-LA, PEMS-BAY | no disponible (valores concretos) | Mejor que re-ejecuciones de STID, Graph WaveNet y STAEformer segun el autor | Sin cifras publicadas en la informacion disponible |
| PEMS08, PEMS04 | no disponible (valores concretos) | Mejora a v0.3 segun el autor | Sin cifras publicadas en la informacion disponible |

No se han publicado resultados numericos detallados de benchmarks por conjunto de datos en la informacion disponible, salvo el MAE de ParadoxBench-1.1 Track A.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB en inferencia; el checkpoint pesa 1.391.617 bytes (aproximadamente 1,4 MB).
- GPU recomendadas: no requiere GPU; cualquier GPU consumer (por ejemplo, RTX 3060 o superior) es mas que suficiente, y la inferencia en CPU es viable.
- Cabe en cualquier GPU consumer y en CPU.
- Opciones de despliegue: PyTorch nativo (carga via `torch.load` y `huggingface_hub`); no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles en la informacion proporcionada; por el tamano del modelo se espera latencia muy baja, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / horizonte | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PWM-Dyn v0.6 (PEMS03) | 340.964 | 12 pasos | MAE 14,34 (ParadoxBench-1.1 Track A, ensemble 3 semillas) | Apache-2.0 | Hugging Face |
| STID | no disponible | no disponible | Inferior segun el autor en PEMS04, PEMS07, METR-LA y PEMS-BAY (re-ejecucion) | no disponible | no disponible |
| Graph WaveNet | no disponible | no disponible | Inferior segun el autor en los mismos conjuntos (re-ejecucion) | no disponible | no disponible |
| STAEformer | no disponible | no disponible | Inferior segun el autor en los mismos conjuntos (re-ejecucion) | no disponible | no disponible |

Los datos de parametros, contexto y licencia de los modelos comparables no se detallan en la informacion proporcionada; las comparaciones de rendimiento son afirmaciones del autor sin cifras concretas publicadas.

## Limitaciones y advertencias

- Modelo especializado exclusivamente en prediccion de trafico sobre PEMS03; no es un modelo de proposito general ni de lenguaje.
- El resultado declarado (MAE 14,34) corresponde a un ensemble de 3 semillas; el archivo publicado es solo la semilla 100, por lo que su rendimiento individual puede diferir del valor del ensemble.
- Las comparaciones con STID, Graph WaveNet y STAEformer proceden de re-ejecuciones del propio autor y no incluyen cifras detalladas en la informacion disponible.
- La arquitectura no esta documentada en la model card; hay que consultar el repositorio GitHub para conocerla.
- Los datos de entrenamiento no se incluyen; solo se referencian sus fuentes y terminos en DATA_SOURCES.md.
- No hay informacion sobre sesgos, robustez ante distribuciones fuera de dominio ni comportamiento con sensores ausentes o ruidosos.
- Licencia Apache-2.0: permite uso comercial con atribucion y conservacion del aviso de licencia; no se documentan restricciones adicionales.
- El modelo se publico en noviembre de 2026 y cuenta con 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validacion independiente de sus resultados.

## Enlaces

- Hugging Face: https://huggingface.co/PARADOXAIlabs/pwm-dyn-v0.6-pems03
- Repositorio GitHub: https://github.com/paradoxailab/paradox-world-model
- Resultados completos: https://github.com/paradoxailab/paradox-world-model/blob/main/RESULTS.md
- Documentacion de la version: https://github.com/paradoxailab/paradox-world-model/blob/main/v0.6-conference/README.md
- Indice de la serie: https://github.com/paradoxailab/paradox-world-model/blob/main/models/series/README.md
- Fuentes de datos: https://github.com/paradoxailab/paradox-world-model/blob/main/DATA_SOURCES.md
- Citacion: https://github.com/paradoxailab/paradox-world-model/blob/main/CITATION.cff
- Version anterior (PEMS04): https://huggingface.co/PARADOXAIlabs/pwm-dyn-v0.6-pems04
- Version siguiente (PEMS07): https://huggingface.co/PARADOXAIlabs/pwm-dyn-v0.6-pems07
- Todos los modelos de la serie: https://huggingface.co/PARADOXAIlabs/paradox-world-model-series
- Sitio web del autor: https://paradoxailab.com
