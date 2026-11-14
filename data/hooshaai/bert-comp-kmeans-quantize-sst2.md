# Hooshaai/bert-comp-kmeans-quantize-sst2

## Resumen

`Hooshaai/bert-comp-kmeans-quantize-sst2` es un checkpoint de BERT-Base (`google-bert/bert-base-uncased`) afinado para clasificación de sentimiento en GLUE SST-2 y posteriormente comprimido mediante la técnica `kmeans_quantize` del framework NeuralOps. El autor del repositorio es el usuario `Hooshaai`, mientras que la implementación de compresión y la model card original provienen del proyecto NeuralOps (`tahamajs/NeuralOps`). El modelo resuelve una tarea muy concreta: clasificación binaria de sentimiento (positivo/negativo) en inglés sobre textos cortos, con un checkpoint físicamente reducido.

La relevancia de este modelo es fundamentalmente metodológica: demuestra que una compresión agresiva por clustering KMeans de pesos (Lloyd-Max 1D vectorizado con estimación de gradiente STE) puede reducir el número de parámetros un 77,56 % manteniendo la precisión del modelo profesor. Según la model card, el checkpoint empaquetado corresponde al rank `k=32` y presenta una ratio de compresión física de 4,456x, pasando de 109.483.778 parámetros a 24.567.554, con una precisión de validación SST-2 declarada del 91,74 % frente al 91,63 % del profesor.

Se trata, por tanto, de un artefacto de investigación orientado a estudiar técnicas de compresión de modelos, no de un modelo de propósito general. No soporta generación de texto, tool calling ni razonamiento multi-paso: es un clasificador de secuencias de BERT con una única cabeza de dos etiquetas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder BERT-Base (12 capas, dimensión oculta 768) con cabeza de clasificación de secuencias |
| Parametros totales | 109.483.778 en el modelo base; 24.567.554 en el checkpoint comprimido |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (el modelo base BERT-Base admite 512 tokens, pero la model card no lo declara explícitamente) |
| Tipos de cuantizacion | Clustering KMeans de pesos (`kmeans_quantize`, familia `kmeans_factory`) con ranks evaluados k=256, 128, 64 y 32; checkpoint publicado en k=32 |
| Idiomas soportados | Inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | `pytorch_model.bin` (state dict serializado de PyTorch), más `config.json`, `compression_summary.json` y assets del tokenizador `bert-base-uncased` |

## Arquitectura y entrenamiento

La arquitectura subyacente es BERT-Base uncased: un transformer encoder de 12 capas, 768 dimensiones ocultas y 109.483.778 parámetros, con tokenizador WordPiece en minúsculas. Sobre ese modelo se realizó un ajuste fino supervisado para clasificación binaria de sentimiento en GLUE SST-2 (dos etiquetas). Posteriormente, el checkpoint se procesó con el motor `kmeans_quantize` de NeuralOps, que aplica clustering KMeans 1D vectorizado (Lloyd-Max) sobre los tensores de pesos, sustituyendo los valores originales por centroides de cluster y estimando gradientes mediante Straight-Through Estimator (STE).

La model card indica que se evaluaron cuatro ranks (k=256, 128, 64 y 32) sobre el split de validación de SST-2 (872 muestras) en una NVIDIA RTX 3090. Curiosamente, los cuatro ranks reportan idénticos parámetros comprimidos (24.567.554) y idéntica precisión (91,74 %), lo que sugiere que el artefacto serializado final corresponde al rank k=32 y que las métricas del resto de ranks se presentan como referencia comparativa. El pipeline de "LoRA healing" (adaptadores r=8, 50 pasos, lr=2e-4, presupuesto de 45 segundos) se describe como un mecanismo de recuperación activado cuando la compresión zero-shot degrada más de 2 puntos porcentuales; en este caso la columna "Healed Acc" coincide con la zero-shot, y la model card marca `LoRA Recovery Applied: False`.

## Capacidades

- Clasificación binaria de sentimiento (positivo/negativo) en inglés sobre textos cortos, típicamente reseñas.
- Inferencia sobre entradas tokenizadas con el vocabulario estándar `bert-base-uncased` (WordPiece, minúsculas).
- No soporta generación de texto, razonamiento, código ni matemáticas: es un clasificador, no un modelo generativo.
- No dispone de tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- Capacidad multilingüe limitada al inglés.
- No incluye modo "thinking", visión ni audio.
- Su interés técnico es la compresión: el checkpoint demuestra la viabilidad de KMeans quantization sobre BERT con pérdida de precisión nula según los datos del autor.

## Casos de uso

- Análisis de sentimiento de reseñas de producto: el modelo clasifica reseñas cortas en inglés en positivas o negativas; su reducido tamaño (24,5 M de parámetros) permite desplegarlo en CPU con baja latencia para volúmenes moderados.
- Moderación de comentarios en foros en inglés: filtrado automático de mensajes con tono negativo para revisión humana, aprovechando la velocidad de un BERT comprimido frente al modelo completo.
- Monitorización de opinión en redes sociales: procesamiento por lotes de tuits o comentarios en inglés para agregar tendencia de sentimiento, con un coste de cómputo muy inferior al de BERT-Base sin comprimir.
- Investigación en compresión de modelos: uso como referencia reproducible para comparar `kmeans_quantize` con otras técnicas (poda, cuantización de enteros, destilación) sobre una tarea estándar como SST-2.
- Docencia y experimentación: ejemplo didáctico de pipeline NeuralOps completo (compresión, evaluación Pareto, LoRA healing) con un modelo pequeño que cabe en cualquier GPU consumer.
- Clasificación previa en pipelines de NLP: como primer filtro barato de sentimiento antes de invocar un modelo generativo más caro solo en los casos ambiguos o relevantes.
- Despliegue en entornos con restricciones de memoria: el checkpoint de ~209 MB y 24,5 M de parámetros efectivos permite servir el modelo en dispositivos edge o contenedores con RAM limitada.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (no verificados de forma independiente, campo `verified: false`):

| Modelo | Dataset | Split | Métrica | Valor |
|---|---|---|---|---|
| bert-comp-kmeans-quantize-sst2 (k=32) | GLUE SST-2 | validation | Accuracy | 91,74 % |
| Profesor: BERT-Base fine-tuned SST-2 | GLUE SST-2 | validation | Accuracy | 91,63 % |

Evaluación multi-rank declarada por el autor (mismas 872 muestras de validación, RTX 3090):

| Rank (k) | Ratio físico | Parámetros comprimidos | Zero-shot Acc | Healed Acc | Paridad vs profesor |
|:---:|:---:|---:|---:|---:|---:|
| 256 | 4,46x | 24.567.554 (-77,6 %) | 91,74 % | 91,74 % | +0,11 % |
| 128 | 4,46x | 24.567.554 (-77,6 %) | 91,74 % | 91,74 % | +0,11 % |
| 64 | 4,46x | 24.567.554 (-77,6 %) | 91,74 % | 91,74 % | +0,11 % |
| 32 | 4,46x | 24.567.554 (-77,6 %) | 91,74 % | 91,74 % | +0,11 % |

No se han publicado en la información disponible resultados de otros benchmarks (MMLU, HumanEval, GSM8K u otros), que además no aplican a un clasificador de sentimiento.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 para el checkpoint comprimido de 24,5 M de parámetros (~98 MB de pesos); el repositorio ocupa 0,2 GB incluyendo tokenizador y metadatos.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; el autor evaluó en una NVIDIA RTX 3090 (24 GB), pero el modelo es sobredimensionado para esa tarjeta.
- Cabe holgadamente en GPU consumer: GTX 1650, RTX 3050, RTX 4060, RTX 4090, así como en CPU.
- Opciones de despliegue: el flujo documentado requiere PyTorch, `transformers` y la librería `neuralops` para reconstruir la topología comprimida antes de cargar el state dict. También existe la API `neuralops.hub.load_surgeried_model` para carga en una línea. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (formatos no GGUF).
- Latencia y throughput: no disponibles en la información proporcionada. Por el tamaño del modelo, se espera latencia de milisegundos por muestra en GPU y decenas de milisegundos en CPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | SST-2 (val) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| bert-comp-kmeans-quantize-sst2 (k=32) | 24.567.554 (comprimido) | No disponible | 91,74 % (declarado) | MIT | Hugging Face |
| google-bert/bert-base-uncased (fine-tuned SST-2) | 109.483.778 | 512 tokens | 91,63 % (profesor, declarado) | Apache 2.0 | Hugging Face |
| DistilBERT fine-tuned SST-2 | No disponible en la información | No disponible | No disponible en la información | Apache 2.0 | Hugging Face |
| RoBERTa-base fine-tuned SST-2 | No disponible en la información | No disponible | No disponible en la información | MIT | Hugging Face |

La comparación rigurosa con DistilBERT o RoBERTa no puede completarse con los datos disponibles; se incluyen como alternativas de la misma categoría (clasificadores BERT-like para SST-2) sin cifras verificadas en esta ficha.

## Limitaciones y advertencias

- Modelo especializado exclusivamente en clasificación binaria de sentimiento en inglés; no es utilizable para otras tareas sin reentrenamiento.
- La precisión de 91,74 % está declarada por el autor y marcada como no verificada (`verified: false`); conviene reproducirla antes de usarla en producción.
- Los cuatro ranks evaluados reportan métricas idénticas, lo que resulta llamativo y sugiere revisar la telemetría (`compression_summary.json`) antes de asumir que la compresión es uniformemente inocua.
- La carga del modelo requiere reconstruir la topología con `neuralops` y usar `strict=False` en `load_state_dict`; un uso incorrecto puede producir pesos sin cargar silenciosamente.
- Riesgo de alucinación no aplica en sentido generativo, pero sí de clasificaciones erróneas en textos con sarcasmo, negaciones complejas o dominio distinto al de reseñas.
- Sesgos heredados de BERT-Base uncased y de la distribución de SST-2 (reseñas de películas), que pueden no generalizar a otros dominios.
- Limitación de idioma: solo inglés; el tokenizador uncased puede degradar el rendimiento con texto en mayúsculas o con caracteres no ingleses.
- Licencia MIT, que permite uso comercial, pero el modelo base BERT-Base tiene su propia licencia Apache 2.0 que debe respetarse en la cadena de derivación.
- El repositorio apunta a `tahamajs/bert-comp-kmeans-quantize-sst2` en los ejemplos de código, mientras que el ID real es `Hooshaai/bert-comp-kmeans-quantize-sst2`; hay que ajustar el `repo_id` para que los scripts funcionen.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Hooshaai/bert-comp-kmeans-quantize-sst2
- Modelo base: https://huggingface.co/google-bert/bert-base-uncased
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Licencia NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Implementación de `kmeans_quantize`: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/compression/quantization/kmeans_quantize.py
- Dataset GLUE SST-2: https://huggingface.co/datasets/nyu-mll/glue
