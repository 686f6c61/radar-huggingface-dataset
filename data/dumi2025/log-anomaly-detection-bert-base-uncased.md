# Dumi2025/log-anomaly-detection-bert-base-uncased

## Resumen

`Dumi2025/log-anomaly-detection-bert-base-uncased` es un modelo de clasificacion de texto obtenido por ajuste fino completo de `google-bert/bert-base-uncased` para la deteccion de anomalias en lineas individuales de logs del sistema de ficheros distribuido HDFS (Hadoop Distributed File System). Lo desarrolla el usuario Dumi2025 y resuelve una tarea binaria concreta: etiquetar cada linea de log como normal (0) o anomala (1). El modelo esta pensado como componente de un pipeline de monitorizacion, no como un asistente generativo.

Arquitectonicamente es un transformer encoder BERT-base clasico, con 109.483.778 parametros totales (aproximadamente 110 M) y una ventana de entrada limitada a 80 tokens, suficiente para lineas de log individuales pero no para secuencias completas de eventos. Se entreno sobre el dataset `Prasasthy/trainforother` con un esquema 80/10/10 estratificado y sobremuestreo de anomalias solo en el split de entrenamiento.

Su relevancia practica es acotada pero clara: es un modelo pequeno, ligero y rapido de desplegar en CPU o GPU consumer, con metricas de validacion muy altas (F1 de anomalia 0,9901 en el conjunto de test retenido). Para equipos que quieran integrar deteccion de anomalias en logs HDFS sin depender de un LLM grande, este checkpoint ofrece un punto de partida barato, aunque con la advertencia de que el modelo tiene cero descargas y cero likes, no declara licencia y su validacion se limita al dataset del autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT-base) |
| Parametros totales | 109.483.778 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 80 tokens (longitud maxima de secuencia en entrenamiento) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se publican variantes GGUF/ONNX) |
| Idiomas soportados | no disponible (entrenado sobre logs tecnicos en ingles) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Modelo base | google-bert/bert-base-uncased |
| Tarea | Clasificacion binaria de texto (text-classification) |
| Etiquetas | 0 = Normal, 1 = Anomalia |
| Dataset de entrenamiento | Prasasthy/trainforother |
| Tamano del repositorio | 0,4 GB |

## Arquitectura y entrenamiento

El modelo parte de `bert-base-uncased`, un transformer encoder de 12 capas, 768 dimensiones ocultas y 12 cabezas de atencion, con 109.483.778 parametros. Sobre esa base se anade una cabeza de clasificacion para una tarea binaria. El ajuste fino es completo (no LoRA ni adaptadores), con 10.000 pasos, batch de 32, learning rate 5e-05 y optimizador `adamw_torch`, en precision bf16 sobre una NVIDIA RTX A5000 en RunPod.

El preprocesamiento declarado incluye eliminacion de duplicados exactos (8.568 encontrados), particion estratificada 80/10/10 con semilla 42 antes de cualquier balanceo, y sobremuestreo de la clase anomala exclusivamente en el split de entrenamiento, lo que evita fuga de informacion hacia validacion y test. La secuencia se trunca a 80 tokens. El checkpoint seleccionado es el que maximiza el F1 de la clase anomala en validacion (`./results_bert-anomaly-42/checkpoint-10000`). No se documentan innovaciones arquitectonicas adicionales: es BERT estandar con fine-tuning supervisado; no consta RLHF, DPO ni decodificacion especulativa (no aplica a un encoder de clasificacion).

## Capacidades

- Clasificacion binaria de lineas de log HDFS: normal frente a anomalia.
- Deteccion de patrones anomalos a nivel de linea individual, no de secuencia de eventos.
- Trabajo sobre texto tecnico en ingles (logs del ecosistema Hadoop), con tokenizador `uncased`.
- Inferencia de baja latencia por ser un modelo de 110 M de parametros y entradas de hasta 80 tokens.
- No soporta generacion de texto, razonamiento, codigo ni matematicas: es un clasificador, no un modelo generativo.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No dispone de modo thinking, vision ni audio.
- Capacidades multilingues: no documentadas; el entrenamiento se limita a logs tecnicos, previsiblemente en ingles.

## Casos de uso

- Monitorizacion de clusters HDFS en tiempo real: el modelo clasifica cada linea de log entrante como normal o anomala con una ventana de 80 tokens, lo que permite procesar flujos de alta frecuencia en CPU o en una GPU pequena y disparar alertas cuando la clase predicha es 1.
- Filtrado previo en pipelines de observabilidad: al ser un modelo de 110 M de parametros, se puede colocar como primera etapa de un sistema de deteccion para descartar la mayoria de lineas normales y reservar modelos mas caros (LLMs) solo para los casos marcados como anomalos.
- Analisis forense de incidentes: dado un volcado de logs historicos, el modelo permite etiquetar masivamente las lineas y aislar las candidatas a anomalia para revision manual, reduciendo el volumen que un ingeniero de guardia debe inspeccionar.
- Enriquecimiento de dashboards y sistemas de alertas: la salida de clasificacion se puede agregar por ventana temporal para calcular tasas de anomalia por nodo o por servicio y alimentar paneles de Grafana o similares.
- Deteccion de regresiones tras despliegues: comparando la proporcion de lineas anomalas antes y despues de un cambio en el cluster, el modelo sirve como senal de si el despliegue ha introducido comportamiento anomalo.
- Prototipado e investigacion en deteccion de anomalias: al ser un checkpoint pequeno y de descarga rapida (0,4 GB), es util como linea base reproducible para comparar con enfoques basados en secuencias (DeepLog, LogAnomaly) o con LLMs.
- Clasificacion por lotes en entornos sin GPU: el modelo cabe en memoria de CPU y puede ejecutarse con `transformers` en pipelines de batch para reprocesar logs historicos sin infraestructura especializada.

## Benchmarks y rendimiento

Resultados publicados por el autor en el split de test retenido:

| Metrica | Valor |
|---|---|
| Accuracy | 0,9994 |
| Precision (anomalia) | 1,0000 |
| Recall (anomalia) | 0,9803 |
| F1 (anomalia) | 0,9901 |
| ROC-AUC | 0,9941 |
| PR-AUC | 0,9935 |

No se han publicado resultados de benchmarks en la informacion disponible mas alla de estas metricas del autor, ni comparaciones con otros modelos sobre los mismos datos. No se dispone de cifras de latencia o throughput medidas.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,45 GB solo de pesos (109,5 M de parametros x 4 bytes), mas activaciones; en la practica menos de 1 GB.
- VRAM estimada en bf16/fp16: aproximadamente 0,22 GB de pesos, mas activaciones; holgadamente por debajo de 1 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; el autor entreno en una NVIDIA RTX A5000, pero para inferencia basta una RTX 3060, RTX 4060, T4 o incluso una GTX 1650.
- Cabe en GPU consumer: si, en practicamente cualquier GPU consumer moderna e incluso en iGPU con suficiente memoria compartida.
- Ejecucion en CPU: viable; con 110 M de parametros y secuencias de 80 tokens, el coste por inferencia es bajo, aunque no se publican cifras de latencia.
- Opciones de despliegue: `transformers` (PyTorch) de forma nativa; exportacion a ONNX Runtime para inferencia acelerada; integracion en servicios con FastAPI o Triton. No se publican pesos GGUF, por lo que llama.cpp/Ollama requeririan conversion manual.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Dumi2025/log-anomaly-detection-bert-base-uncased | 109,5 M | 80 tokens | Clasificacion binaria de lineas de log HDFS | no disponible | Hugging Face (0 descargas) |
| google-bert/bert-base-uncased | 110 M | 512 tokens | Modelo base general (MLM) | Apache 2.0 | Hugging Face (muy extendido) |
| Dumi2025/log-anomaly-detection-model | no disponible | no disponible | Deteccion de anomalias en logs (variante del mismo autor) | no disponible | Hugging Face |
| Dumi2025/log-anomaly-detection-model-new | no disponible | no disponible | Deteccion de anomalias en logs (variante del mismo autor) | no disponible | Hugging Face |

No se dispone de datos de benchmarks de los modelos comparables en la informacion proporcionada, por lo que no es posible establecer una comparacion cuantitativa de rendimiento.

## Limitaciones y advertencias

- El modelo clasifica lineas individuales, no secuencias de eventos: no captura patrones que solo emergen al analizar varias lineas consecutivas, lo que limita la deteccion de anomalias de sesion o de flujo.
- La ventana de 80 tokens trunca lineas de log largas; las lineas que superen esa longitud perderan informacion y podrian clasificarse de forma erronea.
- Las metricas (F1 0,9901) proceden de un unico split del dataset del autor; no hay validacion cruzada ni evaluacion en dominios distintos, por lo que el rendimiento real en produccion puede degradarse.
- El sobremuestreo de anomalias en entrenamiento puede inflar la sensibilidad del modelo a patrones concretos del dataset y no generalizar a otros tipos de anomalia no representados.
- Riesgo de alucinacion: no aplica en sentido generativo, pero si existe riesgo de falsos positivos y falsos negativos; con precision 1,0000 y recall 0,9803 en test, el modelo tiende a no marcar anomalias reales (falsos negativos) antes que a marcar normales como anomalas.
- Sesgos conocidos: no documentados; al entrenarse sobre logs HDFS, el modelo esta sesgado hacia la sintaxis y el vocabulario de ese ecosistema y no se espera que funcione bien en logs de otras tecnologias.
- Idiomas: no se declaran; el tokenizador `uncased` y los logs HDFS sugieren un uso limitado a texto tecnico en ingles.
- Licencia: no disponible. La ausencia de licencia explicita impide asumir derechos de uso comercial; es necesario contactar con el autor antes de integrarlo en un producto.
- El modelo tiene 0 descargas y 0 likes y fue creado en 2026-11-08, por lo que no cuenta con validacion de la comunidad.
- No se publican pesos cuantizados ni artefactos ONNX, lo que anade trabajo de conversion para despliegues optimizados.
- La model card no documenta el numero de ejemplos de entrenamiento ni la composicion exacta del dataset `Prasasthy/trainforother`, lo que dificulta evaluar la representatividad del modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Dumi2025/log-anomaly-detection-bert-base-uncased
- Modelo base: https://huggingface.co/google-bert/bert-base-uncased
- Dataset de entrenamiento: https://huggingface.co/datasets/Prasasthy/trainforother
- Variante del mismo autor: https://huggingface.co/Dumi2025/log-anomaly-detection-model
- Variante del mismo autor: https://huggingface.co/Dumi2025/log-anomaly-detection-model-new/tree/main
