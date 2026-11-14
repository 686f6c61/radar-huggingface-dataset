# Hooshaai/bert-bam-umoe-sst2

## Resumen

`Hooshaai/bert-bam-umoe-sst2` es un checkpoint de BERT-Base (`bert-base-uncased`, 110 M de parámetros) en el que el autor ha sustituido los bloques de atención softmax cuadrática de las 12 capas del transformer por el mecanismo `bam_umoe`, procedente de la librería NeuralOps. El modelo resultante se ha destilado sobre la tarea SST-2 del benchmark GLUE (clasificación binaria de sentimiento en inglés) y se distribuye únicamente con los pesos de atención y la cabeza de clasificación en FP16 (~55 MB), reconstruyendo el resto del modelo base en tiempo de carga.

La relevancia del checkpoint es doble: por un lado, sirve como demostración empírica de que es posible reemplazar la atención cuadrática O(N²) por una variante subcuadrática O(N) u O(N log N) manteniendo una precisión cercana al profesor (88,88 % frente a 91,63 % en SST-2); por otro, ilustra el protocolo de destilación «Cached Representation Distillation» de NeuralOps, que evita mantener el profesor en VRAM durante el entrenamiento. El entrenamiento completo se ejecutó en una única RTX 3090 en 49,7 segundos y 211 pasos de optimización.

Se trata de un modelo de clasificación de texto, no de generación: su pipeline es `text-classification`, solo soporta inglés y no está pensado para uso conversacional ni para tareas generativas. Su interés es fundamentalmente de investigación en eficiencia de atención y en destilación de arquitecturas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer BERT-Base con atención subcuadrática `bam_umoe` en las 12 capas (sustituye a la MHA softmax estándar) |
| Parámetros totales | 110 M (modelo base BERT-Base); los pesos distribuidos son solo atención + cabeza de clasificación (~55 MB FP16) |
| Parámetros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (el modelo base BERT-Base soporta 512 tokens, pero la model card no lo declara explícitamente para este checkpoint) |
| Tipos de cuantización | FP16 (formato de serialización `attention_only_fp16`); no se documentan otras cuantizaciones |
| Idiomas soportados | inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | `attention_weights.safetensors` (FP16, ~55 MB) + código remoto `modeling_neuralops_bert.py`; requiere `trust_remote_code=True` |

## Arquitectura y entrenamiento

El modelo parte de `bert-base-uncased` (12 capas, 768 de dimensión oculta, 110 M de parámetros) y reemplaza en todas las capas el mecanismo de atención multi-cabeza estándar por `bam_umoe`, una atención subcuadrática con complejidad efectiva O(N) u O(N log N) según declara el autor. La serialización es modular: el repositorio contiene solo los pesos de atención entrenados y la cabeza de clasificación en FP16 (~55 MB), mientras que el resto de pesos congelados del BERT base se inicializan desde el Hub al cargar el modelo mediante el shim de código remoto.

El entrenamiento sigue el protocolo «NeuralOps Cached Representation Distillation» en dos etapas: primero una alineación de representaciones ocultas en subespacio y después una combinación de KL sobre logits del profesor más entropía cruzada sobre la tarea. El profesor (`bert-base-uncased` afinado en SST-2) no ocupa VRAM durante el entrenamiento porque sus representaciones se cachean offline. Los datos de entrenamiento son la partición de entrenamiento de SST-2 (GLUE), con evaluación sobre el split de validación (872 muestras). El entrenamiento se ejecutó en una NVIDIA RTX 3090 de 24 GB, con un pico de 8.487 MB de VRAM, 211 pasos de optimización, throughput de 34.782 tokens/s y una duración total de 49,7 s.

## Capacidades

- Clasificación binaria de sentimiento en inglés (positivo/negativo) sobre texto de una sola secuencia, con salida de logits de dos clases.
- Sustitución de atención cuadrática por atención subcuadrática, lo que en teoría reduce el coste computacional en secuencias largas.
- Carga modular: solo se descargan los pesos de atención y la cabeza de tarea, no el modelo base completo.
- Integración con la API de NeuralOps (`load_pretrained_bert`, `load_surgeried_model`) además del flujo estándar de `transformers` con `AutoModelForSequenceClassification`.
- No soporta tool calling, function calling, agentes, multi-step reasoning, visión, audio ni modo thinking.
- No es un modelo generativo: no produce texto libre, solo etiquetas de clasificación.
- Multilingüismo: únicamente inglés.

## Casos de uso

- Análisis de sentimiento en reseñas de producto: el modelo clasifica en positivo/negativo reseñas cortas en inglés; su tamaño reducido (~55 MB de pesos efectivos) permite desplegarlo en entornos con recursos limitados.
- Moderación de comentarios en foros y redes: filtrado rápido de tono negativo en textos breves, aprovechando la baja latencia de un clasificador BERT-Base.
- Investigación en eficiencia de atención: banco de pruebas para comparar la precisión de `bam_umoe` frente a la atención softmax estándar en tareas GLUE, con resultados reproducibles en una sola GPU consumer.
- Destilación de modelos: ejemplo de referencia del protocolo Cached Representation Distillation de NeuralOps, útil para replicar el pipeline con otros profesores o tareas.
- Clasificación de encuestas de satisfacción: procesamiento por lotes de respuestas abiertas cortas en inglés para agregar métricas de sentimiento.
- Prototipado rápido en pipelines de NLP: como clasificador ligero en notebooks o entornos de desarrollo donde se quiere evitar descargar el BERT base completo de 450 MB.
- Evaluación académica de mecanismos subcuadráticos: comparación controlada contra `bert-base-uncased` afinado en SST-2 como línea base.

## Benchmarks y rendimiento

Evaluación sobre el split de validación de GLUE SST-2 (872 muestras binarias), según la model card del autor:

| Métrica | Profesor (`bert-base-uncased`) | Estudiante pre-KD (`bam_umoe`) | Modelo destilado |
|---|---|---|---|
| Exactitud SST-2 | 91,63 % | 52,06 % | 88,88 % |
| Entropía cruzada de validación | 0,2428 | no calibrada | 0,3569 |

Delta de exactitud tras la destilación: +36,81 puntos porcentuales. El autor clasifica el resultado como «Strong (>=80 %)». No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base BERT-Base en FP32 ocupa aproximadamente 450 MB de pesos; con la cabeza de clasificación y activaciones, la inferencia cabe holgadamente en menos de 2 GB de VRAM.
- GPU recomendadas: cualquier GPU consumer moderna sirve; el propio autor entrenó en una RTX 3090 (pico de 8.487 MB de VRAM durante el entrenamiento). Para inferencia bastan GPUs con 4 GB o más, e incluso CPU.
- Cabe en GPU consumer: sí, en cualquier RTX 20xx/30xx/40xx o equivalente, y también en CPU para cargas moderadas.
- Opciones de despliegue: `transformers` con `AutoModelForSequenceClassification` y `trust_remote_code=True`; API de NeuralOps (`load_surgeried_model`, `load_pretrained_bert`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: el autor reporta 34.782 tokens/s durante el entrenamiento en RTX 3090; no se publican cifras de latencia o throughput de inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | SST-2 (exactitud) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Hooshaai/bert-bam-umoe-sst2` | 110 M (base) | no disponible | 88,88 % (validación) | MIT | Hugging Face, requiere código remoto |
| `bert-base-uncased` afinado en SST-2 (profesor del autor) | 110 M | 512 tokens | 91,63 % (validación) | Apache 2.0 (modelo base) | Hugging Face, `transformers` estándar |
| `distilbert-base-uncased-finetuned-sst-2-english` | 66 M | 512 tokens | no disponible en esta información | Apache 2.0 | Hugging Face, `transformers` estándar |

La comparativa se limita a estas referencias porque la información proporcionada no incluye otros modelos de atención subcuadrática comparables. El checkpoint de NeuralOps queda 2,75 puntos por debajo del profesor BERT-Base en SST-2, a cambio de una atención con complejidad teórica subcuadrática y un footprint de pesos mucho menor (~55 MB frente a ~450 MB).

## Limitaciones y advertencias

- Solo inglés: no se ha entrenado ni evaluado en otros idiomas.
- Solo clasificación binaria de sentimiento en SST-2; no es un modelo generativo ni un modelo de propósito general.
- Precisión inferior al profesor: 88,88 % frente a 91,63 %, una diferencia de 2,75 puntos en validación.
- Requiere `trust_remote_code=True` y ejecuta código remoto (`modeling_neuralops_bert.py`) al cargar; conviene auditar ese código antes de usarlo en producción.
- Dependencia de la librería NeuralOps y del Hub para reconstruir los pesos base congelados: si `bert-base-uncased` no está accesible, la carga falla.
- Riesgo de sesgos heredados de `bert-base-uncased` y de los datos de SST-2 (reseñas de películas), que no representan dominios como redes sociales, atención al cliente o textos técnicos.
- Riesgo de alucinación no aplicable en sentido estricto (no genera texto), pero sí de clasificaciones erróneas en dominios alejados del de entrenamiento.
- El autor indica que el estudiante pre-KD estaba «no calibrado»; la calibración final depende del proceso de destilación y no se documentan métricas de calibración adicionales.
- Licencia MIT para el checkpoint, pero el modelo base `bert-base-uncased` tiene su propia licencia (Apache 2.0); conviene verificar la compatibilidad en uso comercial.
- No se documentan límites de longitud de secuencia específicos para el checkpoint; se asume el límite de 512 tokens del BERT base.
- Repositorio con pocas descargas (79) y sin likes: ecosistema pequeño, menor probabilidad de soporte comunitario o de corrección de errores.

## Enlaces

- Hugging Face: https://huggingface.co/Hooshaai/bert-bam-umoe-sst2
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Licencia NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Modelo base: https://huggingface.co/bert-base-uncased
- Dataset GLUE / SST-2: https://huggingface.co/datasets/glue
