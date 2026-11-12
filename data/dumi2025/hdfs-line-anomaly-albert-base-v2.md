# Dumi2025/hdfs-line-anomaly-albert-base-v2

## Resumen

El modelo `Dumi2025/hdfs-line-anomaly-albert-base-v2` es un ajuste fino de ALBERT base v2 para la deteccion de anomalias a nivel de linea en registros del sistema de ficheros distribuido HDFS (Hadoop Distributed File System). Lo desarrolla el usuario Dumi2025 y se publica como un clasificador de texto binario (etiquetas 0 = normal, 1 = anomalia) que clasifica cada linea de log heredando la etiqueta oficial de bloque del dataset HDFS_v1 de LogHub.

La particularidad tecnica del enfoque es que el modelo no evalua la linea de forma aislada, sino como un par de frases `(linea de log, resumen del bloque)`. El resumen del bloque enumera cada mensaje presente en el bloque con su numero de repeticiones, y los identificadores de bloque, direcciones IP y numeros largos se normalizan a los tokens `BLK`, `IP` y `N`. Este contexto de bloque es determinante: segun la model card, el F1 de anomalia pasa de 0,0495 en linea aislada a 0,9440 con contexto de bloque.

Se trata de un modelo pequeno (11,68 millones de parametros) pensado para inferencia ligera en pipelines de monitorizacion de logs, no para generacion de texto general. Su relevancia actual radica en que demuestra que inyectar contexto agregado en un encoder compacto puede resolver una tarea de deteccion de anomalias donde los clasificadores linea a linea fallan.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ALBERT (transformer encoder, factorizacion de embeddings y comparticion de capas), base v2 |
| Parametros totales | 11.685.122 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (depende de la configuracion de albert-base-v2 subyacente) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF, GPTQ ni AWQ) |
| Idiomas soportados | no disponible (el dominio es log tecnico en ingles de HDFS) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Modelo base | albert/albert-base-v2 |
| Tarea (pipeline) | text-classification (clasificacion binaria por linea) |
| Umbral de decision | 0,5000 (`anomaly_threshold` en config.json) |
| Tamano del repositorio | 0,0 GB |

## Arquitectura y entrenamiento

El modelo parte de `albert/albert-base-v2`, un transformer encoder con factorizacion de embeddings (vocabulario proyectado a un espacio de menor dimension) y comparticion de parametros entre capas, lo que explica su reducido numero de parametros (11,68 M) frente a otros encoders de tamano nominal similar. Sobre esa base se realiza un ajuste fino completo para clasificacion de secuencias con dos entradas: la linea de log y el resumen del bloque.

El entrenamiento se llevo a cabo sobre el dataset LogHub HDFS_v1 (DOI 10.5281/zenodo.8196385), con 20.000 bloques muestreados. La configuracion documentada es: ajuste fino completo, 2,0 epocas, batch de 16, learning rate 3e-5, precision bf16, sobre una NVIDIA RTX PRO 4500 Blackwell en RunPod (ejecucion `albert-hdfs-linectx-42`, 2026-11-12T03:48:26). No se documenta el numero total de tokens de entrenamiento, la composicion exacta del dataset ni si hubo etapas de RLHF o DPO (poco probables en una tarea de clasificacion). La innovacion tecnica principal no esta en la arquitectura sino en la formulacion de la entrada: la normalizacion de entidades (`BLK`, `IP`, `N`) y la agregacion de mensajes del bloque con conteos (`3x mensaje ; ...`) como segunda frase del par.

## Capacidades

- Clasificacion binaria de lineas de log HDFS en normal o anomalia, heredando la etiqueta oficial de bloque.
- Procesamiento de pares de secuencias (linea de log + resumen de bloque) como entrada conjunta.
- Normalizacion robusta de entidades: identificadores de bloque, IPs y numeros largos se sustituyen por tokens genericos.
- Agregacion de contexto de bloque mediante resumen de mensajes con conteos de repeticion.
- Alta sensibilidad a anomalias: recall de 0,9860 con contexto de bloque segun la model card.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No dispone de capacidades multilingues documentadas, vision, audio ni modo de razonamiento explicito.
- No es un modelo generativo: no produce texto libre, solo una etiqueta y su puntuacion.

## Casos de uso

- Monitorizacion en tiempo real de clusters HDFS: el modelo clasifica cada linea segun llega, usando el resumen del bloque en curso como contexto, y dispara alertas cuando la puntuacion de anomalia supera 0,5. Su tamano (11,68 M de parametros) permite ejecutarlo en CPU o en GPU de gama baja junto al recolector de logs.
- Filtrado previo en pipelines de observabilidad: antes de enviar logs a un sistema de analitica o a un LLM de diagnostico, el modelo descarta lineas normales y reduce el volumen procesado aguas abajo.
- Analisis forense de incidentes: dado un bloque marcado como anomalo, se reclasifican sus lineas para localizar las que contribuyen a la anomalia, aprovechando que la etiqueta de bloque se hereda por linea.
- Deteccion de fallos en trabajos MapReduce sobre HDFS: los mensajes de error recurrentes aparecen en el resumen del bloque con su conteo, lo que permite al modelo distinguir patrones normales de rafagas anomalas.
- Validacion de cambios en infraestructura: tras un despliegue o reconfiguracion, se compara la tasa de lineas anomalas por bloque contra la linea base historica para detectar regresiones.
- Generacion de datasets etiquetados: el modelo puede preetiquetar grandes volumenes de logs HDFS y usarse como anotador debil para entrenar o ampliar otros clasificadores.
- Investigacion en deteccion de anomalias en logs: sirve como referencia reproducible del efecto del contexto de bloque frente a la clasificacion linea a linea, con metricas y configuracion de entrenamiento documentadas.

## Benchmarks y rendimiento

Resultados de validacion cruzada de 5 folds por bloque, por linea de log, segun la model card del autor:

| Metrica | Con contexto de bloque | Linea aislada |
|---|---|---|
| F1 anomalia | 0,9440 | 0,0495 |
| Precision anomalia | 0,9055 | 0,0255 |
| Recall anomalia | 0,9860 | 0,8672 |
| ROC AUC | 0,9990 | 0,5050 |
| IC 95 % de F1 (bootstrap por bloque) | [0,9152, 0,9658] | no disponible |
| Umbral de decision | 0,5000 | 0,5000 |

No se han publicado resultados de benchmarks en la informacion disponible para comparaciones con otros modelos en tareas estandar (MMLU, HumanEval, GSM8K u otras).

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 (11,68 M de parametros, aproximadamente 47 MB de pesos) y en torno a 25 MB en fp16. El consumo real dependera del tamano del vocabulario y de la longitud de las secuencias de entrada.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; el modelo se entreno en una NVIDIA RTX PRO 4500 Blackwell, pero no requiere ese hardware para inferencia.
- Cabe en cualquier GPU de consumo (GTX 1050, RTX 2060, RTX 3060, RTX 4090) e incluso en CPU para cargas moderadas.
- Opciones de despliegue: `transformers` con PyTorch, `text-classification` pipeline de Hugging Face, TorchServe o FastAPI con batching. No se documentan pesos GGUF, por lo que llama.cpp y Ollama requeririan conversion previa. vLLM y TGI estan orientados a modelos generativos y no son la via natural para este clasificador.
- Latencia y throughput: no disponibles en la informacion proporcionada. Por el tamano del modelo, se espera un throughput alto en GPU y aceptable en CPU con batching, pero no hay cifras publicadas.

## Comparativa con modelos similares

No se dispone de datos publicados de otros modelos comparables en la informacion proporcionada. Como referencia estructural, se compara con su modelo base y con la formulacion sin contexto:

| Modelo | Parametros | Contexto de entrada | Tarea | Licencia |
|---|---|---|---|---|
| Dumi2025/hdfs-line-anomaly-albert-base-v2 | 11.685.122 | Linea + resumen de bloque | Clasificacion binaria de lineas HDFS | no disponible |
| albert/albert-base-v2 | 11.685.122 | Secuencia unica | Modelo base preentrenado (MLM) | no disponible en esta ficha |
| Variante linea aislada (mismo autor) | 11.685.122 | Solo linea de log | Clasificacion binaria de lineas HDFS | no disponible |

La diferencia de rendimiento entre la variante con contexto y la aislada (F1 0,9440 frente a 0,0495) es el dato comparativo mas relevante disponible.

## Limitaciones y advertencias

- Especifico del dominio HDFS: el modelo esta entrenado sobre mensajes de log de HDFS y no se espera que generalice a otros sistemas de log sin reentrenamiento.
- Dependencia critica del resumen de bloque: sin la segunda frase de contexto, el rendimiento cae drasticamente (F1 de 0,0495 en linea aislada), por lo que el pipeline debe construir el resumen correctamente.
- Normalizacion obligatoria: si no se sustituyen identificadores de bloque, IPs y numeros largos por `BLK`, `IP` y `N`, la distribucion de entrada difiere de la de entrenamiento.
- Etiqueta heredada del bloque: la etiqueta por linea proviene de la etiqueta oficial del bloque, lo que puede introducir ruido en bloques con lineas mixtas.
- Muestreo limitado: el entrenamiento uso 20.000 bloques muestreados de HDFS_v1, no el dataset completo.
- Licencia no disponible: no se puede confirmar el uso comercial sin consultar al autor.
- Idiomas no documentados: no hay garantia de comportamiento fuera del ingles tecnico de los logs HDFS.
- Riesgo de falsos positivos y negativos: con precision de 0,9055 y recall de 0,9860, el modelo prioriza sensibilidad y genera una tasa no despreciable de falsas alarmas; conviene calibrar el umbral `anomaly_threshold` segun el coste operativo.
- Sin datos de sesgo, robustez adversarial ni comportamiento fuera de distribucion.
- Sin soporte de tool calling, agentes ni generacion: no debe emplearse como sustituto de un LLM en tareas conversacionales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Dumi2025/hdfs-line-anomaly-albert-base-v2
- Modelo base: https://huggingface.co/albert/albert-base-v2
- Dataset LogHub HDFS_v1: https://doi.org/10.5281/zenodo.8196385
- Repositorio LogHub: https://github.com/logpai/loghub
