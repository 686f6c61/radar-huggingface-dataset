# Dumi2025/hdfs-line-anomaly-electra-base-discriminator

## Resumen

El modelo `hdfs-line-anomaly-electra-base-discriminator` es un clasificador de texto afinado a partir de `google/electra-base-discriminator` por el usuario Dumi2025 para la deteccion de anomalias a nivel de linea en logs HDFS. La particularidad del enfoque es que no evalua la linea de log de forma aislada, sino como un par de frases `(linea de log, resumen del bloque)`, de modo que el modelo dispone de contexto agregado del bloque al que pertenece la linea. La salida es binaria: 0 para normal y 1 para anomalia, heredando la etiqueta oficial del bloque HDFS_v1 a cada una de sus lineas.

La relevancia del modelo radica en la diferencia tan marcada que reporta el autor entre clasificar con contexto de bloque y clasificar la linea aislada: un F1 de anomalia de 0,9444 frente a 0,0618 en el escenario sin contexto. Esto ilustra un problema clasico en deteccion de anomalias en logs: muchas lineas individuales son indistinguibles de una linea normal y solo el contexto de la sesion o del bloque revela la anomalia. El modelo tiene 109.483.778 parametros (encoder ELECTRA base) y un repositorio de 0,4 GB en formato safetensors.

Se trata de un modelo muy especializado, con cero descargas y cero likes en el momento de la consulta, orientado a investigacion y pruebas de concepto en analisis de logs, no a uso general. No se dispone de informacion sobre licencia ni sobre idiomas soportados mas alla del dominio tecnico de los logs HDFS.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (ELECTRA base discriminator) |
| Parametros totales | 109.483.778 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (limitada por el encoder ELECTRA base, no confirmada en la model card) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles (dominio: logs tecnicos HDFS en ingles) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Pipeline | text-classification |
| Modelo base | google/electra-base-discriminator |
| Etiquetas | 0 = Normal, 1 = Anomalia |
| Umbral de decision | 0,5 (`anomaly_threshold` en config.json) |
| Tamano del repositorio | 0,4 GB |

## Arquitectura y entrenamiento

El modelo es un fine-tuning completo de `google/electra-base-discriminator`, un encoder transformer de tipo ELECTRA con 109,5 millones de parametros. La entrada se formula como un par de frases: la primera es la linea de log, y la segunda es un resumen del bloque al que pertenece esa linea. En el preprocesado se sustituyen identificadores de bloque, direcciones IP y numeros largos por los tokens `BLK`, `IP` y `N`, y el resumen del bloque enumera cada mensaje distinto una sola vez junto con su recuento en el formato `3x mensaje ; ...`. La cabeza de clasificacion produce una probabilidad binaria con umbral de decision fijado en 0,5.

El entrenamiento se realizo sobre el dataset LogHub HDFS_v1 (DOI 10.5281/zenodo.8196385), con 20.000 bloques muestreados y las etiquetas oficiales de bloque heredadas por cada linea. Los hiperparametros reportados son: fine-tuning completo, 2,0 epocas, batch de 16, learning rate 5e-05, precision bf16, sobre una NVIDIA RTX PRO 4500 Blackwell en RunPod, con identificador de ejecucion `electra-hdfs-linectx-42` del 12 de noviembre de 2026. No se documenta en la model card el uso de RLHF, DPO ni tecnicas adicionales de alineacion, algo esperable en un clasificador supervisado de este tipo.

## Capacidades

- Clasificacion binaria de lineas de log HDFS como normal o anomalia, con contexto de bloque agregado.
- Procesamiento de pares de frases (linea de log + resumen de bloque) en una sola pasada del encoder.
- Normalizacion de entidades volatiles del log (IDs de bloque, IPs, numeros) mediante tokens sustitutos.
- Agregacion de contexto a nivel de bloque: el resumen incluye cada mensaje con su recuento, lo que permite al modelo detectar patrones anomalos que dependen de la composicion del bloque.
- Capacidad de operar en modo linea aislada, aunque con rendimiento muy inferior segun los datos del autor.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, vision, audio ni modo thinking; es un clasificador puro.

## Casos de uso

- Deteccion de anomalias en pipelines de observabilidad de clusters HDFS: el modelo se insertaria como etapa de clasificacion por linea dentro de un pipeline que primero agrupe lineas en bloques y construya el resumen de bloque; su F1 reportado de 0,9444 lo hace adecuado para alertas automatizadas cuando se dispone del contexto de bloque.
- Analisis forense de incidentes en sistemas de almacenamiento distribuido: dado un bloque de logs sospechoso, el modelo clasifica cada linea y ayuda a localizar las lineas anomalas dentro del bloque, reduciendo el volumen que un analista debe revisar manualmente.
- Filtrado y priorizacion de logs en produccion: integrado como clasificador ligero (109 M de parametros, 0,4 GB) en un servicio de ingesta, puede etiquetar lineas para enrutar solo las anomalas a sistemas de alerta o a un LLM de analisis posterior.
- Investigacion en deteccion de anomalias en logs: sirve como linea base reproducible con contexto de bloque frente a enfoques de linea aislada, gracias a los resultados de validacion cruzada por bloque publicados por el autor.
- Generacion de datasets etiquetados: el modelo puede usarse para preetiquetar lineas de HDFS en nuevos conjuntos de datos, con revision humana de las predicciones cercanas al umbral de 0,5.
- Educacion y demostraciones sobre feature engineering en logs: el par (linea, resumen de bloque) es un ejemplo didactico de como el contexto agregado transforma el rendimiento de un clasificador, con una mejora documentada de F1 de 0,0618 a 0,9444.
- Monitorizacion de sistemas legados que escriben logs en formato HDFS-like: con un preprocesado equivalente (sustitucion de IPs y numeros por tokens), el modelo puede adaptarse a otros logs estructurados de sistemas de ficheros distribuidos, aunque requeriria validacion adicional no documentada.

## Benchmarks y rendimiento

Datos publicados por el autor en la model card, validacion cruzada de 5 folds por bloque, a nivel de linea de log:

| Metrica | Con contexto de bloque | Linea aislada |
|---|---|---|
| F1 anomalia | 0,9444 | 0,0618 |
| Precision anomalia | 0,9048 | 0,0337 |
| Recall anomalia | 0,9876 | 0,3717 |
| ROC-AUC | 0,9969 | 0,5508 |
| IC 95 % F1 (bootstrap por bloque) | [0,9145, 0,9659] | no disponible |
| Umbral de decision | 0,5000 | no disponible |

No se han publicado resultados comparativos con otros modelos de deteccion de anomalias en logs en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un encoder de 109 M de parametros, la inferencia en fp32 requiere aproximadamente 0,44 GB de pesos mas memoria de activaciones; en bf16 o fp16, alrededor de 0,22 GB. Con batch pequeno, cabe holgadamente en GPUs consumer de 4 GB o incluso en CPU.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente; el autor entreno en una NVIDIA RTX PRO 4500 Blackwell, pero para inferencia no es necesario ese hardware.
- Cabe en GPU consumer: si, practicamente en cualquier GPU moderna (GTX 1650, RTX 3060, RTX 4090, etc.), y tambien en CPU para cargas moderadas.
- Opciones de despliegue: el modelo es compatible con el ecosistema Hugging Face Transformers (`AutoModelForSequenceClassification`); no se documenta soporte especifico de vLLM, llama.cpp, Ollama o TGI, aunque al ser un encoder BERT-like puede servirse con Text Embeddings Inference o con un servidor FastAPI propio sobre Transformers.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la documentacion proporcionada. Como referencia estructural, el modelo base `google/electra-base-discriminator` es un encoder ELECTRA de 109 M de parametros, pero no se han publicado en esta ficha resultados de otros clasificadores de anomalias en logs HDFS que permitan una comparacion cuantitativa fiable.

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Dumi2025/hdfs-line-anomaly-electra-base-discriminator | 109,5 M | no disponible | Clasificacion de lineas de log HDFS | no disponible | Hugging Face (0 descargas) |
| google/electra-base-discriminator | 109,5 M | no disponible | Encoder preentrenado general | Apache 2.0 (segun el modelo base original) | Hugging Face |
| Alternativas de deteccion de anomalias en logs | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El modelo esta entrenado exclusivamente sobre HDFS_v1 (LogHub) con 20.000 bloques muestreados; su generalizacion a otros dominios de logs o a otras versiones de HDFS no esta documentada.
- El rendimiento depende criticamente de disponer del resumen de bloque; en modo linea aislada el F1 cae a 0,0618, por lo que usarlo sin contexto produce resultados practicamente inutiles.
- El preprocesado exige sustituir IDs de bloque, IPs y numeros largos por `BLK`, `IP` y `N`, y construir el resumen con el formato `Nx mensaje ; ...`; cualquier desviacion de este formato puede degradar el rendimiento.
- No se dispone de informacion sobre sesgos conocidos, riesgo de alucinacion (es un clasificador, no un generador) ni limitaciones idiomaticas mas alla del dominio tecnico.
- La licencia no esta disponible, lo que impide confirmar si el uso comercial esta permitido; debe consultarse con el autor antes de cualquier despliegue en produccion.
- El modelo tiene cero descargas y cero likes, sin validacion independiente por parte de la comunidad; los resultados reportados proceden unicamente de la model card del autor.
- El umbral de decision esta fijado en 0,5 en `config.json`; en produccion podria requerirse un ajuste segun el coste relativo de falsos positivos y falsos negativos.
- No se documentan limitaciones de longitud de contexto; al ser un encoder ELECTRA base, la ventana efectiva es limitada y podria truncar resumenes de bloque muy largos, aunque este extremo no se confirma en la informacion disponible.

## Enlaces

- Hugging Face: https://huggingface.co/Dumi2025/hdfs-line-anomaly-electra-base-discriminator
- Modelo base: https://huggingface.co/google/electra-base-discriminator
- Dataset LogHub HDFS_v1: https://doi.org/10.5281/zenodo.8196385
