# Dumi2025/log-anomaly-detection-distilbert-base-uncased

## Resumen

El modelo `Dumi2025/log-anomaly-detection-distilbert-base-uncased` es un clasificador de texto binario obtenido mediante ajuste fino completo de DistilBERT base uncased sobre líneas individuales de logs del sistema de ficheros distribuido HDFS. Su tarea es etiquetar cada línea como normal (0) o anómala (1), lo que lo convierte en un componente de detección de anomalías en pipelines de observabilidad y monitorización de infraestructura. Lo publica el usuario Dumi2025 en Hugging Face con fecha de creación de noviembre de 2026 y, en el momento de redactar esta ficha, no acumula descargas ni interacciones.

Arquitectónicamente es un transformer encoder de tipo DistilBERT, con 66.955.010 parámetros totales (seis capas, hidden size 768, 12 cabezas de atención) y una ventana de entrada efectiva de 80 tokens, suficiente para clasificar líneas de log aisladas pero insuficiente para secuencias completas. El modelo se entrena con precisión bf16 sobre una NVIDIA RTX A5000 y reporta métricas muy altas en su split de test (F1 de anomalía 0,9867, ROC-AUC 0,9978), si bien no se ha publicado información sobre el dataset más allá de su identificador.

Su relevancia práctica es acotada: sirve como bloque de clasificación por línea dentro de un sistema mayor de detección de anomalías, no como un detector de anomalías completo. La ausencia de licencia explícita, de idiomas declarados y de documentación sobre el dataset limita su uso en producción sin una validación adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DistilBERT base uncased, 6 capas) |
| Parametros totales | 66.955.010 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 80 tokens (longitud máxima de secuencia usada en entrenamiento; la ventana nativa de DistilBERT es 512) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; admite cuantización estándar a int8/fp16 mediante herramientas externas, no documentada por el autor) |
| Idiomas soportados | no disponibles (modelo base uncased en inglés; el autor no declara idiomas) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `distilbert/distilbert-base-uncased`, un transformer encoder destilado de BERT con 6 capas, dimensión oculta 768 y 12 cabezas de atención, al que se le añade una cabeza de clasificación binaria. El ajuste fino es completo (no LoRA ni adaptadores), con 10.000 pasos, batch de 32, learning rate 5e-05, optimizador `adamw_torch` y precisión bf16 sobre una NVIDIA RTX A5000 en RunPod. El checkpoint seleccionado es el que maximiza el F1 de la clase anómala en validación (`checkpoint-10000`).

El dataset de entrenamiento es `Prasasthy/trainforother`, sin más documentación pública sobre su composición, procedencia o número de ejemplos. El autor indica que se eliminaron 8.568 duplicados exactos, se hizo un split estratificado 80/10/10 con semilla 42 antes de cualquier balanceo, y que las anomalías se sobremuestrearon únicamente en el split de entrenamiento. La longitud máxima de secuencia se fijó en 80 tokens, lo que implica truncamiento de líneas de log más largas. No se documenta uso de RLHF, DPO ni ninguna innovación técnica adicional (sin decodificación especulativa, sin atención lineal).

## Capacidades

- Clasificación binaria de líneas de log individuales: salida 0 (normal) o 1 (anomalía).
- Detección de anomalías en logs del sistema HDFS, dominio sobre el que se entrenó.
- Clasificación de texto corto en inglés (modelo base uncased), con truncamiento a 80 tokens.
- Inferencia rápida y de bajo coste por ser un encoder de 66,9 M de parámetros.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento de agente.
- No dispone de modo thinking, visión, audio ni generación de texto libre.
- Capacidades multilingües no declaradas; el vocabulario uncased del modelo base está orientado al inglés.
- No es un modelo generativo: no produce explicaciones ni etiquetas textuales más allá de la clase predicha.

## Casos de uso

- Monitorización de clusters HDFS: clasificar cada línea de log en tiempo real y disparar alertas cuando la probabilidad de anomalía supera un umbral, aprovechando el bajo coste de inferencia del encoder.
- Prefiltrado en pipelines de observabilidad: usar el modelo como primera etapa barata que descarta líneas normales antes de enviarlas a un analista o a un modelo mayor, reduciendo volumen y coste.
- Enriquecimiento de sistemas SIEM: etiquetar eventos de log con una probabilidad de anomalía que alimente reglas de correlación y scoring de riesgo.
- Detección de regresiones tras despliegues: comparar la tasa de líneas marcadas como anómalas antes y después de un cambio en el cluster para detectar comportamientos anómalos introducidos por el despliegue.
- Clasificación por lotes de logs históricos: reprocesar ficheros de log almacenados para construir etiquetas de anomalía y analizar incidentes pasados.
- Base para un clasificador de secuencias: usar las probabilidades por línea como features de entrada a un modelo de secuencia (LSTM, transformer) que detecte anomalías a nivel de sesión o bloque, dado que este modelo solo clasifica líneas aisladas.
- Filtrado de ruido en datasets de entrenamiento: aplicar el clasificador para separar líneas normales y anómalas al construir corpus etiquetados de logs HDFS.

## Benchmarks y rendimiento

Resultados reportados por el autor en el split de test reservado:

| Metrica | Valor |
|---|---|
| Accuracy | 0,9992 |
| Precision (anomalia) | 1,0000 |
| Recall (anomalia) | 0,9738 |
| F1 (anomalia) | 0,9867 |
| ROC-AUC | 0,9978 |
| PR-AUC | 0,9918 |

No se han publicado comparaciones con otros modelos en la información disponible, ni resultados sobre benchmarks estándar (MMLU, HumanEval, GSM8K), que no aplican a un clasificador de logs.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,27 GB de pesos (66,9 M de parámetros × 4 bytes), más overhead de activaciones; en la práctica cabe en cualquier GPU con 1-2 GB libres.
- VRAM estimada en fp16/bf16: aproximadamente 0,13 GB de pesos.
- GPU recomendadas: cualquier GPU moderna; el propio autor entrenó en una NVIDIA RTX A5000. Para inferencia basta una RTX 3060, T4, L4 o incluso CPU para volúmenes moderados.
- Cabe holgadamente en GPU de consumo (GTX 1650, RTX 2060, RTX 3050 en adelante).
- Opciones de despliegue: `transformers` con `pipeline("text-classification")`, TorchServe, ONNX Runtime, o exportación a GGUF para llama.cpp/Ollama si se convierte el modelo. vLLM y TGI están orientados a modelos generativos y no son la vía natural para este clasificador.
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño del modelo se espera un throughput alto en GPU (miles de líneas por segundo en batch), pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Dumi2025/log-anomaly-detection-distilbert-base-uncased | 66,9 M | 80 tokens (entrenamiento) | Clasificación binaria de líneas de log HDFS | no disponible | Hugging Face, 0 descargas |
| Dumi2025/log-anomaly-detection-model-roberta | no disponible | no disponible | Clasificación de anomalías en logs (según nombre) | no disponible | Hugging Face |
| distilbert/distilbert-base-uncased (base) | 66,9 M | 512 tokens | Modelo base, sin ajuste | Apache 2.0 (modelo base) | Hugging Face, ampliamente usado |

No se dispone de datos de rendimiento del modelo RoBERTa del mismo autor ni de otros clasificadores de logs comparables en la información proporcionada, por lo que la comparación cuantitativa no está disponible.

## Limitaciones y advertencias

- Clasifica líneas individuales, no secuencias: no captura contexto entre líneas ni detecta anomalías que solo emergen a nivel de sesión o bloque.
- Truncamiento a 80 tokens: las líneas de log más largas se cortan y pueden perder la información relevante para la clasificación.
- Sesgo de sobremuestreo: las anomalías se sobremuestrearon solo en entrenamiento, lo que puede descalibrar las probabilidades de salida respecto a la prevalencia real de anomalías en producción.
- Métricas de test muy altas (F1 0,9867) sobre un dataset no documentado; el rendimiento en logs de otros sistemas o distribuciones distintas no está validado y podría degradarse.
- Riesgo de falsos negativos: el recall de anomalía es 0,9738, es decir, aproximadamente un 2,6 % de anomalías no detectadas en el test reportado.
- Sin licencia declarada: no hay autorización explícita para uso comercial; debe contactarse con el autor antes de integrarlo en productos.
- Idiomas no declarados y modelo base uncased en inglés: no apto para logs en otros idiomas sin reentrenamiento.
- Sin documentación del dataset de entrenamiento: no se puede auditar la procedencia de los datos ni evaluar sesgos de dominio.
- Sin descargas ni validación de la comunidad: no hay evidencia externa de reproducibilidad de los resultados.
- No es un modelo generativo: no produce explicaciones, solo una etiqueta y su probabilidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Dumi2025/log-anomaly-detection-distilbert-base-uncased
- Modelo base: https://huggingface.co/distilbert/distilbert-base-uncased
- Dataset de entrenamiento: https://huggingface.co/datasets/Prasasthy/trainforother
- Modelo RoBERTa del mismo autor: https://huggingface.co/Dumi2025/log-anomaly-detection-model-roberta
- Repositorio de ficheros del modelo RoBERTa: https://huggingface.co/Dumi2025/log-anomaly-detection-model-roberta/tree/main
