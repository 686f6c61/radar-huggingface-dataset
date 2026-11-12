# Dumi2025/hdfs-line-anomaly-roberta-base-lr2e-5

## Resumen

El modelo `Dumi2025/hdfs-line-anomaly-roberta-base-lr2e-5` es un ajuste fino de `FacebookAI/roberta-base` para la deteccion de anomalias a nivel de linea en logs del sistema de ficheros distribuido HDFS (Hadoop Distributed File System). Lo desarrolla el usuario Dumi2025 y se publica bajo la etiqueta `log-anomaly-detection`, dentro del pipeline de `text-classification`. La tarea consiste en clasificar cada linea de log como normal (etiqueta 0) o anomala (etiqueta 1), heredando la etiqueta oficial de bloque del dataset HDFS_v1 de LogHub.

La innovacion principal no esta en la arquitectura, que es un transformer encoder RoBERTa base sin modificaciones (124.647.170 parametros), sino en el formato de entrada: el modelo recibe un par de frases `(linea de log, resumen de bloque)`. El resumen de bloque agrega las plantillas de mensajes del bloque con sus recuentos, lo que aporta contexto secuencial que una linea aislada no contiene. Segun la model card, este contexto eleva el F1 de anomalia de 0,0493 (linea aislada) a 0,9504 (con contexto de bloque) en validacion cruzada de 5 pliegues por bloque.

Es relevante para equipos que trabajan en observabilidad y operaciones de sistemas distribuidos, porque demuestra que un encoder de 125 millones de parametros, barato de desplegar, puede alcanzar ROC-AUC de 0,9965 cuando se le suministra contexto de bloque. El repositorio ocupa 0,5 GB y se distribuye en formato safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (RoBERTa base, tipo BERT) |
| Parametros totales | 124.647.170 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada de roberta-base, 512 tokens, no confirmado en la model card) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors sin cuantizar) |
| Idiomas soportados | no disponible (los logs HDFS estan en ingles tecnico) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino completo de `FacebookAI/roberta-base`, un transformer encoder de 12 capas y 124,6 millones de parametros con tokenizador BPE. No hay modificaciones arquitectonicas: la capa de clasificacion se entrena para dos etiquetas (normal/anomalia). La entrada es un par de secuencias en formato sentence-pair, donde la primera es la linea de log y la segunda es el resumen del bloque al que pertenece esa linea. Antes de la tokenizacion se aplica una normalizacion: los identificadores de bloque se sustituyen por `BLK`, las direcciones IP por `IP` y los numeros largos por `N`. El resumen de bloque lista cada plantilla de mensaje una sola vez con su recuento, en el formato `3x mensaje ; ...`.

El entrenamiento se realizo sobre 20.000 bloques muestreados del dataset LogHub HDFS_v1 (DOI 10.5281/zenodo.8196385). La configuracion reportada es: fine-tuning completo, 2,0 epocas, tamano de lote 16, tasa de aprendizaje 2e-05, precision bf16, sobre una NVIDIA RTX PRO 4500 Blackwell en RunPod, con identificador de ejecucion `roberta-hdfs-linectx-42` y fecha 2026-11-12T05:20:32. La validacion se hizo con validacion cruzada de 5 pliegues agrupada por bloque, de modo que las lineas de un mismo bloque no se reparten entre entrenamiento y validacion, lo que evita fuga de informacion. El umbral de decision es 0,5000 y se almacena en `config.json` como `anomaly_threshold`. No se documenta el uso de RLHF, DPO ni tecnicas de alineacion, algo esperable en una tarea de clasificacion supervisada.

## Capacidades

- Clasificacion binaria de lineas de log HDFS en normal o anomalia, con etiqueta heredada del bloque de origen.
- Aprovechamiento de contexto de bloque mediante un resumen agregado de plantillas y recuentos, lo que permite detectar anomalias que solo son visibles en secuencia.
- Normalizacion previa de identificadores variables (bloques, IPs, numeros) para reducir el vocabulario efectivo y mejorar la generalizacion entre bloques.
- Salida de probabilidad calibrada con umbral configurable (`anomaly_threshold`), adecuada para pipelines automatizados con punto de corte ajustable.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni modo agente.
- No dispone de modo thinking, vision ni audio.
- Capacidad multilingue no documentada; el entrenamiento se limita a logs HDFS en ingles tecnico.

## Casos de uso

- Monitorizacion de clusters HDFS en produccion: el modelo clasifica cada linea de log entrante como normal o anomala y, al agrupar por bloque, permite priorizar alertas sobre los bloques con mayor proporcion de lineas anomalas, reduciendo el ruido frente a reglas estaticas.
- Deteccion temprana de fallos de disco o nodo: las anomalias a nivel de linea asociadas a errores de escritura o replicacion se detectan antes de que el bloque complete su ciclo, lo que permite lanzar acciones de reequilibrio de datos.
- Analisis forense de incidentes: dado un bloque problematico, el modelo puntua cada linea y ayuda a reconstruir la secuencia de eventos que precedio al fallo, gracias al resumen de bloque que aporta el contexto agregado.
- Integracion en pipelines de observabilidad (ELK, Loki, Splunk): el clasificador se puede invocar como servicio de inferencia por lotes o en streaming sobre las lineas ya normalizadas, con latencia baja por ser un encoder de 125 millones de parametros.
- Generacion de datasets etiquetados: el modelo puede usarse como etiquetador debil para preanotar grandes volumenes de logs HDFS y reducir el coste de anotacion manual en proyectos de investigacion.
- Evaluacion de cambios en el sistema: al comparar la tasa de anomalias por bloque antes y despues de un despliegue o cambio de configuracion, el modelo sirve como metrica de regresion operativa.
- Docencia y experimentacion en deteccion de anomalias: el par (linea, resumen de bloque) es un ejemplo reproducible de como el contexto secuencial mejora drasticamente el rendimiento frente al enfoque linea a linea, util para comparar arquitecturas.

## Benchmarks y rendimiento

Resultados reportados en la model card, validacion cruzada de 5 pliegues agrupada por bloque, a nivel de linea de log:

| Metrica | Con contexto de bloque | Linea aislada |
|---|---|---|
| F1 de anomalia | 0,9504 | 0,0493 |
| Precision de anomalia | 0,9405 | 0,0253 |
| Recall de anomalia | 0,9605 | 0,9806 |
| ROC-AUC | 0,9965 | 0,5297 |
| IC 95 % del F1 (bootstrap por bloque) | [0,9224, 0,9699] | no disponible |
| Umbral de decision | 0,5000 | 0,5000 |

No se han publicado resultados comparativos con otros modelos de deteccion de anomalias en logs en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,5 GB de pesos mas activaciones; en la practica, menos de 2 GB para lotes pequenos.
- VRAM estimada en fp16/bf16: alrededor de 0,25 GB de pesos; cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM. Una RTX 3060, RTX 4060, RTX 4090 o superior es mas que suficiente. Para despliegue por lotes a gran escala se recomienda A10, L4 o A100 por throughput agregado, no por requisito de memoria.
- Cabe en GPU consumer: si, en practicamente todas las GPU modernas con 4 GB o mas, e incluso en CPU para inferencia por lotes con latencia aceptable.
- Opciones de despliegue: `transformers` con `pipeline("text-classification")`, `vLLM` no aplica (no es un modelo generativo), `TGI` no aplica, `ONNX Runtime` y `TorchScript` para optimizacion, y `llama.cpp` no aplica por no ser un modelo GGUF.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada. Por el tamano del modelo, se espera un throughput alto en GPU, pero no se aportan cifras medidas.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de modelos comparables en la informacion proporcionada. Como referencia estructural, se compara con el modelo base del que deriva:

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Dumi2025/hdfs-line-anomaly-roberta-base-lr2e-5 | 124,6 M | no disponible | Clasificacion de lineas de log HDFS | no disponible | Hugging Face |
| FacebookAI/roberta-base | 124,6 M | 512 tokens | Modelo base de lenguaje enmascarado | MIT | Hugging Face |
| Alternativas de deteccion de anomalias en logs | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El modelo esta entrenado exclusivamente sobre HDFS_v1 de LogHub; su rendimiento fuera de ese dominio (otros sistemas, otros formatos de log) no esta documentado y probablemente sea pobre sin reentrenamiento.
- Depende criticamente del resumen de bloque: segun la propia model card, sin contexto de bloque el F1 de anomalia cae a 0,0493. Usarlo con lineas aisladas produce practicamente ruido.
- La normalizacion de identificadores (`BLK`, `IP`, `N`) es una decision de preprocesado que debe replicarse exactamente en produccion; cualquier desviacion degrada el rendimiento.
- El umbral de decision 0,5000 esta fijado en `config.json`; en produccion conviene recalibrarlo segun el coste relativo de falsos positivos y falsos negativos.
- Riesgo de alucinacion no aplica en sentido estricto (es un clasificador), pero si existe riesgo de falsos positivos y falsos negativos; la precision reportada de 0,9405 implica aproximadamente un 6 % de falsos positivos entre las predicciones positivas.
- La licencia no esta disponible, lo que impide confirmar si el uso comercial esta permitido. Es un bloqueante para produccion hasta que el autor la declare.
- Los idiomas soportados no estan documentados; el modelo se entreno con logs en ingles tecnico y no se ha evaluado en otros idiomas.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso independiente ni validacion externa de los resultados reportados.
- El modelo tiene fecha de creacion 2026-11-12 segun los metadatos; conviene verificar la coherencia temporal antes de citarlo en publicaciones.
- No se documenta sesgo demografico ni linguistico, pero al ser un clasificador de logs tecnicos el riesgo de sesgo relevante es el de cobertura de plantillas de mensaje no vistas durante el entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Dumi2025/hdfs-line-anomaly-roberta-base-lr2e-5
- Modelo base: https://huggingface.co/FacebookAI/roberta-base
- Dataset LogHub HDFS_v1 (DOI): https://doi.org/10.5281/zenodo.8196385
