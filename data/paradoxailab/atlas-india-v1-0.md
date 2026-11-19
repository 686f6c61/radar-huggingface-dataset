# paradoxailab/atlas-india-v1.0

## Resumen

Atlas-India v1.0 es un modelo de forecasting de series temporales desarrollado por ParadoxAI Lab (Aditya Kumar, Anupam Singh) dentro de su serie Paradox World Model, concretamente la entrega numero 40 de la serie (modelo 37 de 56 publicados). Su tarea es la prediccion de las proximas 24 horas de concentracion de PM2.5 en estaciones de monitorizacion de calidad del aire de toda la India. Se trata de un modelo especifico de dominio, no de un modelo de lenguaje: su pipeline en Hugging Face es `time-series-forecasting` y su unico artefacto es un checkpoint PyTorch de state dict.

El modelo es deliberadamente compacto: 967.632 parametros (menos de un millon), lo que lo situa en la categoria de modelos ligeros de series temporales, muy alejado de los transformers generativos. Se entrena sobre datos de estaciones CPCB de toda la India (14 redes, 263 estaciones) procedentes del dataset de Kaggle "Time Series Air Quality Data of India (2010-2023)". Su relevancia radica en que un unico modelo cubre todas las estaciones del pais, sustituyendo aproximaciones anteriores por region (por ejemplo, el modelo previo de la serie, Atlas-Delhi v1.2, centrado en Delhi).

El autor reporta que supera a TimesFM 2.5 en el test de toda la India, con un MAE de 20.99 / 20.86 frente a 22.35 / 21.93 del modelo de Google. La licencia es Apache-2.0 y el checkpoint se distribuye como fichero `.pt` de aproximadamente 3,99 MB. El repositorio de Hugging Face figura con 0 descargas y 0 likes en el momento de redactar esta ficha, y no incluye los datos de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (codigo en repositorio GitHub del autor; configuracion en `ck['cfg']`) |
| Parametros totales | 967.632 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (checkpoint PyTorch en precision original) |
| Idiomas soportados | no aplica (modelo de series temporales, no linguistico) |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch state dict (`.pt`, `torch.load` con `weights_only=False`) |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna: indica que el codigo esta en el repositorio GitHub `paradoxailab/paradox-world-model` y que la configuracion exacta de entrenamiento se almacena dentro del propio checkpoint en la clave `ck['cfg']`. No se especifica si se trata de un transformer, un modelo recurrente, un modelo grafico espacio-temporal o una combinacion. El unico dato estructural cierto es el numero de parametros (967.632) y que la tarea es forecasting multiestacion a 24 horas sobre PM2.5.

Los datos de entrenamiento proceden de estaciones CPCB de toda la India: 14 redes y 263 estaciones, a partir del dataset de Kaggle "Time Series Air Quality Data of India (2010-2023)". El autor no publica el numero de tokens ni la composicion detallada del dataset, y los datos originales no se incluyen en el repositorio (sus fuentes y terminos se remiten a `DATA_SOURCES.md`). No se menciona el uso de RLHF, DPO ni tecnicas de alineacion, algo esperable en un modelo de forecasting. El entrenamiento se realizo el 2026-11-13 en un run de Kaggle (`atlas-india-s400`) y la version se publico el 2026-11-17.

## Capacidades

- Prediccion de las proximas 24 horas de concentracion de PM2.5 en estaciones de monitorizacion.
- Cobertura nacional: un unico modelo para las 263 estaciones de las 14 redes CPCB, en lugar de modelos por region.
- Forecasting espacio-temporal: el tag `spatiotemporal` sugiere que el modelo explota dependencias entre estaciones, aunque la model card no detalla el mecanismo.
- Serie Paradox World Model: forma parte de una familia de 56 modelos publicados con numeracion comun (01-59), lo que facilita comparaciones dentro de la serie.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingues: no es un modelo generativo de texto.
- No se documentan modos especiales (thinking, vision, audio).

## Casos de uso

- Prediccion operativa de calidad del aire: generar el pronostico de PM2.5 a 24 horas para cada estacion CPCB y alimentar paneles de alerta temprana para autoridades ambientales, usando el checkpoint directamente con PyTorch.
- Investigacion en contaminacion atmosferica: servir como baseline ligero (menos de 1 M de parametros) frente a modelos fundacionales de series temporales como TimesFM 2.5 en estudios comparativos sobre datos indios.
- Sistemas de alerta sanitaria: integrar la prediccion de PM2.5 en avisos para poblaciones sensibles (asmaticos, ancianos) con un horizonte de 24 horas suficiente para activar protocolos.
- Planificacion urbana y politica publica: analizar patrones espacio-temporales de contaminacion entre las 14 redes para evaluar el impacto de medidas de restriccion de trafico o industriales.
- Despliegue en entornos con recursos limitados: al ocupar unos 4 MB y tener menos de un millon de parametros, puede ejecutarse en CPU en dispositivos edge o en servidores modestos sin GPU.
- Educacion y reproduccion cientifica: el checkpoint incluye metadatos, resultados y logs (`ck['meta']`, `ck['results']`), lo que permite reproducir y auditar el experimento con el codigo del repositorio GitHub.
- Extension a otras regiones o contaminantes: como punto de partida para fine-tuning sobre nuevos conjuntos de estaciones, dado que la licencia Apache-2.0 lo permite.

## Benchmarks y rendimiento

El autor reporta un unico resultado, el MAE en test sobre toda la India, comparado con TimesFM 2.5:

| Modelo | MAE test India (reportado) |
|---|---|
| Atlas-India v1.0 | 20.99 / 20.86 |
| TimesFM 2.5 | 22.35 / 21.93 |

No se especifica que representan los dos valores separados por barra (posiblemente dos particiones o dos metricas de error), ni se aportan resultados de MMLU, HumanEval, GSM8K u otros benchmarks, que no aplican a este tipo de modelo. No se han publicado resultados adicionales en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 10 MB en precision original (967.632 parametros en FP32, mas overhead de PyTorch); cabe en cualquier GPU consumer.
- GPU recomendadas: no requiere GPU; cualquier CPU moderna es suficiente. En caso de usar GPU, cualquier modelo (RTX 3060, RTX 4090, A100, H100) sirve, aunque no aporta ventaja significativa.
- Cabe en GPU consumer: si, en todas, incluidas GPUs integradas.
- Opciones de despliegue: carga directa con PyTorch (`torch.load`), usando el codigo de arquitectura del repositorio GitHub del autor. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, que estan orientados a modelos generativos de texto.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea | Contexto | MAE India (reportado) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Atlas-India v1.0 | 967.632 | PM2.5 24 h, 263 estaciones | no disponible | 20.99 / 20.86 | Apache-2.0 | Hugging Face + GitHub |
| TimesFM 2.5 | no disponible | Forecasting general de series temporales | no disponible | 22.35 / 21.93 | no disponible | no disponible |
| Atlas-Delhi v1.2 | no disponible | PM2.5 en Delhi | no disponible | no disponible | Apache-2.0 | Hugging Face (serie #39) |

La comparativa se limita a los datos publicados por el autor. No se dispone de informacion sobre otros modelos comparables de forecasting de calidad del aire en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo especifico de dominio: solo predice PM2.5 en estaciones CPCB de la India; no es un modelo de lenguaje ni sirve para tareas generativas.
- Cobertura geografica restringida: entrenado exclusivamente con datos de 263 estaciones de la India; su comportamiento fuera de ese pais no esta validado.
- Datos de entrenamiento no incluidos: la reproducibilidad completa depende del dataset de Kaggle y de `DATA_SOURCES.md`; no se documenta el preprocesamiento.
- Arquitectura no documentada en la model card: es necesario consultar el repositorio GitHub para conocer el diseno exacto y la configuracion (`ck['cfg']`).
- Un unico resultado de benchmark reportado por el autor, sin validacion externa ni detalle de la particion train/test.
- Riesgo de degradacion ante estaciones nuevas o cambios en la red de monitorizacion, al no haber sido entrenado con ellas.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de uso comunitario ni de mantenimiento mas alla de la serie del autor.
- Licencia Apache-2.0: permite uso comercial, pero exige conservar avisos de licencia y atribucion; no hay restricciones adicionales documentadas.
- La busqueda web no devolvio resultados relevantes sobre el modelo; los enlaces encontrados no guardan relacion con la ficha y se omiten.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/paradoxailab/atlas-india-v1.0
- Repositorio GitHub: https://github.com/paradoxailab/paradox-world-model
- Registro de la version Atlas: https://github.com/paradoxailab/paradox-world-model/blob/main/atlas/README.md
- Indice de la serie: https://github.com/paradoxailab/paradox-world-model/blob/main/models/series/README.md
- Fuentes de datos: https://github.com/paradoxailab/paradox-world-model/blob/main/DATA_SOURCES.md
- Citacion: https://github.com/paradoxailab/paradox-world-model/blob/main/CITATION.cff
- Version anterior (Atlas-Delhi v1.2): https://huggingface.co/paradoxailab/atlas-delhi-v1.2
- Version siguiente (Atlas v1.3 pre-training): https://huggingface.co/paradoxailab/atlas-india-v1.3-pretrain
- Todos los modelos de la serie: https://huggingface.co/paradoxailab/paradox-world-model-series
- Sitio del autor: https://paradoxailab.com
