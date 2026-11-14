# Hooshaai/bert-comp-smoothquant-sst2

## Resumen

`bert-comp-smoothquant-sst2` es un checkpoint de `google-bert/bert-base-uncased` afinado para clasificación de sentimiento en GLUE SST-2 y posteriormente procesado con el compresor `SmoothQuantCompressor` de la librería NeuralOps. Lo publica el usuario Hooshaai (el código de referencia apunta al repositorio `tahamajs/NeuralOps`) como parte del "NeuralOps Compressed & LoRA-Healed Model Zoo", un catalogo de modelos comprimidos con telemetria reproducible. El modelo resuelve una tarea concreta: clasificación binaria de sentimiento en ingles a partir de una sola frase, manteniendo una precisión de validación de 91,74 % frente al 91,63 % del profesor sin comprimir.

El interés técnico del artefacto no esta en el modelo base (BERT-base, 109,48 M de parámetros, 12 capas, dimensión oculta 768), sino en el proceso de compresión aplicado: cuantización W8A8 con SmoothQuant y soporte de `compressed-tensors`, con evaluación Pareto en los rangos k=256, 128, 64 y 32. En la práctica, el checkpoint serializado corresponde a k=32 y declara una ratio de compresión física de 1,00x (0,0 % de ahorro de parámetros), lo que indica que la cuantización no reduce el recuento de parámetros aunque si debería reducir el tamaño en bytes de los pesos. El repositorio ocupa 0,3 GB y el peso serializado se declara en 291,0 MB.

Es relevante ahora porque ejemplifica una practica creciente: publicar checkpoints cuantizados con telemetria de evaluación multi-rango y "healing" mediante LoRA cuando la caída de precisión supera umbrales definidos. Para desarrolladores que despliegan clasificadores BERT en producción, este tipo de artefacto permite evaluar el compromiso precisión/eficiencia de forma empírica antes de adoptar una técnica de cuantización.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder BERT-base (12 capas, D=768) con cabeza de clasificación de secuencia (2 etiquetas) |
| Parametros totales | 109.483.778 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base BERT-base admite 512 tokens) |
| Tipos de cuantizacion | SmoothQuant W8A8 con soporte de `compressed-tensors`; checkpoint serializado con `compression_rank: 32` |
| Idiomas soportados | Ingles (`en`) |
| Licencia | MIT |
| Formato de pesos | `pytorch_model.bin` (state dict serializado); no se distribuyen pesos en safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo base es BERT-base uncased: un transformer encoder de 12 capas, 768 dimensiones ocultas y 109.483.778 parámetros, preentrenado por Google y afinado sobre GLUE SST-2 (la model card no detalla hiperparámetros de ese fine-tuning). Sobre ese checkpoint, NeuralOps aplica `SmoothQuantCompressor`, un wrapper de `BaseCompressor` que implementa cuantización W8A8 (activaciones y pesos a 8 bits) con soporte de `compressed-tensors`, una técnica que suaviza los valores atípicos de activaciones mediante una transformación de escala antes de cuantizar.

El proceso de evaluación es multi-rango: se prueban los rangos k=256, 128, 64 y 32 sobre el split de validación de GLUE SST-2 (872 muestras) en una NVIDIA GeForce RTX 3090 (24 GB). La regla de "healing" se activa cuando la compresión zero-shot degrada más de 2,0 puntos porcentuales con una reducción superior a 1,10x; en ese caso se aplica un LoRA de rango r=8 durante 50 pasos con lr=2e-4 y un presupuesto de 45 segundos. En los cuatro rangos evaluados la precisión zero-shot se mantiene en 91,74 %, por lo que el healing no se activa (`LoRA Recovery Applied: False`) y la ratio de compresión física es 1,00x en todos los casos. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset más allá de SST-2, ni si hubo RLHF o DPO (no aplica a un clasificador).

## Capacidades

- Clasificación binaria de sentimiento (positivo/negativo) en inglés, con una sola etiqueta de salida por secuencia.
- Inferencia sobre frases cortas y medias; el tokenizador es el estándar `bert-base-uncased` (vocabulario WordPiece sin distinción de mayúsculas).
- Integración con la API de Hugging Face `transformers` mediante `BertForSequenceClassification` y reconstrucción del grafo comprimido con `compress_model`.
- Carga en una línea a través de la API universal de NeuralOps Hub (`load_surgeried_model`).
- Soporte de `compressed-tensors` para pipelines de cuantización compatibles.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo "thinking".
- Capacidad multilingüe: no; únicamente inglés.
- No es un modelo generativo: no produce texto libre, solo logits de clasificación.

## Casos de uso

- Moderación de comentarios y reseñas en inglés: clasificar automáticamente reseñas de producto o comentarios de foros como positivos o negativos, con un modelo de 109 M de parámetros que cabe en CPU y permite procesar lotes grandes con latencia baja.
- Enrutamiento de tickets de soporte: usar la predicción de sentimiento como señal para priorizar tickets negativos en un sistema de atención al cliente, aprovechando la ventana de 512 tokens del BERT-base para incluir el cuerpo completo del mensaje.
- Análisis de opiniones a escala en pipelines de datos: procesar corpus de reseñas (por ejemplo, de Amazon o Yelp) en lotes con `transformers` y `pytorch_model.bin`, comparando la precisión del checkpoint cuantizado frente al profesor original para validar la perdida por cuantización.
- Baseline reproducible para investigación en compresión: servir como referencia controlada en experimentos de cuantización, ya que la model card publica telemetría multi-rango (k=256/128/64/32) y la regla de healing, lo que facilita comparaciones metodológicas.
- Filtrado de datos para fine-tuning: etiquetar grandes volúmenes de texto no anotado con sentimiento para construir datasets de entrenamiento de modelos mayores, usando el checkpoint cuantizado para reducir el coste de inferencia.
- Despliegue en entornos con recursos limitados: al ser un modelo de 0,3 GB y 109 M de parámetros, puede ejecutarse en instancias CPU pequeñas o en GPUs de gama baja para servicios de clasificación de baja latencia.
- Evaluación de robustez de técnicas de cuantización: comparar el comportamiento de SmoothQuant W8A8 frente a otras técnicas (por ejemplo, GPTQ o AWQ) sobre el mismo backbone y dataset, usando el `compression_summary.json` como plantilla de telemetría.

## Benchmarks y rendimiento

Datos declarados por el autor en la model-index (no verificados de forma independiente):

| Modelo | Dataset | Split | Metrica | Valor |
|---|---|---|---|---|
| bert-comp-smoothquant-sst2 (k=32) | GLUE SST-2 | validation | Accuracy | 91,74 % |
| Profesor (BERT-base SST-2 sin comprimir) | GLUE SST-2 | validation | Accuracy | 91,63 % |

Evaluación Pareto multi-rango declarada por el autor (RTX 3090, 872 muestras de validación):

| Rango (k) | Ratio fisico | Parametros comprimidos | Zero-shot Acc | Healed Acc | Paridad vs profesor |
|:---:|:---:|---:|---:|---:|---:|
| 256 | 1,00x | 109.483.778 (-0,0 %) | 91,74 % | 91,74 % | +0,11 % |
| 128 | 1,00x | 109.483.778 (-0,0 %) | 91,74 % | 91,74 % | +0,11 % |
| 64 | 1,00x | 109.483.778 (-0,0 %) | 91,74 % | 91,74 % | +0,11 % |
| 32 (checkpoint publicado) | 1,00x | 109.483.778 (-0,0 %) | 91,74 % | 91,74 % | +0,11 % |

No se han publicado en la información disponible resultados de otros benchmarks (MMLU, HumanEval, GSM8K u otros), lo cual es esperable en un clasificador de sentimiento.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint serializado pesa 291,0 MB; en FP32 el modelo base ocupa aproximadamente 437 MB y en el formato cuantizado W8A8 declarado, del orden de 110-150 MB de pesos, más activaciones y overhead de runtime. Cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; el autor evaluó en una NVIDIA GeForce RTX 3090 (24 GB), aunque es sobredimensionada para este modelo. También funciona en RTX 4090, RTX 3060, T4 y similares.
- Cabe en GPU consumer: si, en practicamente todas las GPU modernas e incluso en CPU para inferencia por lotes.
- Opciones de despliegue: `transformers` con `BertForSequenceClassification` y reconstrucción del grafo comprimido mediante `neuralops.core.compression_pipeline.compress_model`; API universal `neuralops.hub.load_surgeried_model`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI en la información disponible, y al no distribuirse en GGUF no es directamente compatible con llama.cpp/Ollama.
- Latencia y throughput: no disponibles en la información proporcionada; el autor solo reporta el presupuesto de 45 segundos para el healing LoRA, no métricas de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | SST-2 (val) | Licencia | Formato |
|---|---|---|---|---|---|
| bert-comp-smoothquant-sst2 | 109,48 M | no disponible (base: 512) | 91,74 % (declarado) | MIT | `pytorch_model.bin` |
| google-bert/bert-base-uncased (profesor) | 109,48 M | 512 | 91,63 % (declarado por el autor) | Apache 2.0 | safetensors / PyTorch |
| DistilBERT-base-uncased | 66 M | 512 | no disponible en la información | Apache 2.0 | safetensors / PyTorch |
| RoBERTa-base | 125 M | 512 | no disponible en la información | MIT | safetensors / PyTorch |

La comparación cuantitativa con DistilBERT y RoBERTa no puede completarse porque la información proporcionada no incluye sus resultados en SST-2. La diferencia clave frente al profesor es la técnica de compresión aplicada, no el rendimiento bruto: la ganancia declarada de +0,11 % entra dentro del ruido estadístico de 872 muestras.

## Limitaciones y advertencias

- El checkpoint declara una ratio de compresión física de 1,00x (0,0 % de ahorro de parámetros); la ventaja real de SmoothQuant W8A8 esta en el tamaño en bytes de los pesos y en el coste de inferencia, no en el recuento de parámetros, y la model card no cuantifica esa reducción de bytes de forma explícita.
- Solo inglés: no soporta otros idiomas, lo que limita su uso en productos multilingües.
- Es un clasificador binario de sentimiento, no un modelo generativo: no puede usarse para resumen, traducción, código ni razonamiento.
- Riesgo de alucinación no aplica en el sentido generativo, pero si existe riesgo de clasificaciones erróneas en textos con sarcasmo, negaciones complejas o dominio muy distinto al de SST-2 (reseñas de películas).
- La métrica de 91,74 % esta marcada como `verified: false` en la model-index; no ha sido validada de forma independiente.
- La licencia del modelo es MIT, pero el código de NeuralOps se distribuye bajo la licencia enlazada en `github.com/tahamajs/NeuralOps/blob/main/LICENSE`; conviene revisar ambas por separado antes de uso comercial.
- El proceso de carga requiere reconstruir el grafo comprimido con `compress_model` antes de cargar el state dict con `strict=False`; un `load_state_dict` directo sobre el modelo base fallaría o cargaría pesos incompatibles.
- La model card cita el repositorio `tahamajs/bert-comp-smoothquant-sst2` mientras que el checkpoint publicado esta bajo `Hooshaai/bert-comp-smoothquant-sst2`; hay una discrepancia de identificadores que puede afectar a los scripts de descarga copiados literalmente.
- El checkpoint se distribuye en `pytorch_model.bin` (pickle), no en safetensors, lo que implica riesgos de seguridad al cargar archivos de origen no verificado.
- No hay información sobre sesgos demográficos o de dominio del fine-tuning; SST-2 procede de reseñas de películas y el modelo puede degradarse en otros dominios (redes sociales, atención al cliente, texto técnico).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Hooshaai/bert-comp-smoothquant-sst2
- Modelo base: https://huggingface.co/google-bert/bert-base-uncased
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Implementacion de SmoothQuant en NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/compression/quantization/smoothquant.py
- Licencia NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset GLUE SST-2: https://huggingface.co/datasets/nyu-mll/glue
