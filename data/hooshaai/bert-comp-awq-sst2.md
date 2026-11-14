# Hooshaai/bert-comp-awq-sst2

## Resumen

`bert-comp-awq-sst2` es un checkpoint de `google-bert/bert-base-uncased` afinado para clasificación de sentimiento sobre GLUE SST-2 y posteriormente procesado con el compresor AWQ de la librería NeuralOps. Lo publica el usuario Hooshaai bajo el paraguas del "NeuralOps Compressed & LoRA-Healed Model Zoo", un proyecto de compresión de modelos que aplica técnicas de cuantización (AWQ) y recuperación mediante LoRA sobre arquitecturas transformer estándar. El modelo resuelve una tarea muy acotada: clasificación binaria de sentimiento (positivo/negativo) en inglés.

El interés del checkpoint es fundamentalmente metodológico más que de rendimiento bruto. Según la model card, el proceso de compresión AWQ a rango `k=32` no reduce el número de parámetros (109.483.778, ratio físico 1.00x) y la precisión en validación SST-2 se mantiene en 92,09 %, ligeramente por encima del baseline del profesor (91,63 %). Es decir, el artefacto sirve como ejemplo reproducible del pipeline de compresión de NeuralOps y como referencia de paridad de precisión, no como un modelo comprimido con ahorro real de tamaño.

Con 42 descargas y 0 likes en el momento de la consulta, es un modelo de nicho, orientado a quien quiera inspeccionar o replicar el flujo de compresión de NeuralOps sobre BERT. La licencia MIT y el tamaño de repositorio de 0,6 GB facilitan su uso y auditoría.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT-base, 12 capas, dimensión oculta 768) |
| Parametros totales | 109.483.778 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (BERT-base-uncased admite típicamente 512 tokens, no confirmado en la información proporcionada) |
| Tipos de cuantizacion | AWQ (compresor `AWQCompressor` de NeuralOps), rango `k=32`; soporte de compressed-tensors |
| Idiomas soportados | Inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | `pytorch_model.bin` (state dict serializado), `config.json`, `compression_summary.json`, assets de tokenizer BERT-base-uncased |

## Arquitectura y entrenamiento

La arquitectura subyacente es BERT-base-uncased: un transformer encoder de 12 capas con dimensión oculta 768 y 109.483.778 parámetros. El modelo parte de un afinamiento sobre GLUE SST-2 (clasificación binaria de sentimiento, `num_labels=2`) y después se pasa por el compresor AWQ de NeuralOps, que genera un state dict con buffers de cuantización y factores de baja dimensión. El checkpoint empaquetado corresponde al rango `k=32`, seleccionado como "showcase rank" dentro de una evaluación Pareto multirango (`k=256, 128, 64, 32`).

Según la model card, la evaluación se realizó físicamente en una NVIDIA GeForce RTX 3090 (24 GB) sobre el split de validación de GLUE SST-2 (872 muestras). El protocolo de "healing" con LoRA (`r=8`, 50 pasos, `lr=2e-4`, presupuesto de 45 s) se activa solo cuando la compresión zero-shot degrada la precisión más de 2,0 puntos con una reducción superior a 1,10x. En este caso no se aplicó recuperación LoRA (`LoRA Recovery Applied: False`) porque no hubo pérdida de precisión ni reducción de parámetros. Los datos de entrenamiento originales del afinamiento SST-2 no se detallan más allá de la referencia al dataset `nyu-mll/glue`, config `sst2`.

## Capacidades

- Clasificación binaria de sentimiento (positivo/negativo) en inglés, salida de 2 logits.
- Afinado específicamente sobre GLUE SST-2; no se documentan capacidades de generación de texto.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidad multilingüe limitada al inglés (`language: en`).
- No se documentan modos especiales (thinking, visión, audio).
- Integración con el ecosistema NeuralOps mediante `load_surgeried_model` y `compress_model`.

## Casos de uso

- Análisis de sentimiento en reseñas de producto: el modelo clasifica textos cortos en inglés en positivo o negativo; su tamaño (109 M parámetros) permite desplegarlo en CPU para volúmenes moderados.
- Moderación de comentarios en foros en inglés: filtrado previo de mensajes con tono negativo antes de una revisión humana, usando la salida de 2 logits como señal de triaje.
- Monitorización de opinión en redes sociales: procesamiento por lotes de tuits o comentarios en inglés para agregar tendencias de sentimiento a nivel de producto o marca.
- Pipeline educativo o de investigación sobre compresión: servir como caso reproducible del flujo AWQ de NeuralOps para comparar precisión antes y después de la cuantización.
- Baseline en experimentos de destilación o pruning: al estar afinado sobre SST-2 y con métricas publicadas (92,09 % de accuracy), sirve como referencia contra la que medir otras técnicas de compresión.
- Clasificación de encuestas de satisfacción: etiquetado automático de respuestas abiertas en inglés para alimentar dashboards de NPS o CSAT.
- Validación de pipelines MLOps: modelo pequeño y de licencia MIT adecuado para probar integraciones de despliegue (por ejemplo, servicios de inferencia con `transformers`) sin coste de GPU grande.

## Benchmarks y rendimiento

Datos declarados por el autor en el model-index (no verificados, `verified: false`):

| Benchmark | Metrica | Valor |
|---|---|---|
| GLUE SST-2 (validation) | Accuracy | 92,09 % |

Comparativa interna del zoo NeuralOps según la model card (evaluación física en RTX 3090, 872 muestras):

| Rank (`k`) | Ratio fisico | Parametros comprimidos | Accuracy zero-shot | Accuracy healed | Paridad vs profesor (91,63 %) |
|---|---|---|---|---|---|
| 256 | 1,00x | 109.483.778 (-0,0 %) | 92,09 % | 92,09 % | +0,46 % |
| 128 | 1,00x | 109.483.778 (-0,0 %) | 92,09 % | 92,09 % | +0,46 % |
| 64 | 1,00x | 109.483.778 (-0,0 %) | 92,09 % | 92,09 % | +0,46 % |
| 32 (empaquetado) | 1,00x | 109.483.778 (-0,0 %) | 92,09 % | 92,09 % | +0,46 % |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint pesa 617,0 MB según la model card (repositorio de 0,6 GB); en FP32 ocupa aproximadamente 0,44 GB de pesos, por lo que cabe holgadamente en cualquier GPU consumer reciente.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; la evaluación del autor se hizo en una NVIDIA GeForce RTX 3090 (24 GB), pero no es necesario ese hardware.
- Cabe en GPU consumer: sí, en RTX 3060, RTX 4060, RTX 4090 y equivalentes; también en CPU para inferencia por lotes.
- Opciones de despliegue: `transformers` con `BertForSequenceClassification` (requiere reconstruir la topología con `compress_model` de NeuralOps antes de cargar el state dict), o la API `load_surgeried_model` de NeuralOps. No se documenta soporte nativo en vLLM, llama.cpp, Ollama ni TGI en la información proporcionada.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | SST-2 (accuracy) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `bert-comp-awq-sst2` (este) | 109.483.778 | No disponible | 92,09 % (declarado, no verificado) | MIT | Hugging Face (NeuralOps) |
| `google-bert/bert-base-uncased` (profesor, afinado SST-2) | 109.483.778 | No disponible | 91,63 % (baseline del autor) | Apache 2.0 (modelo base) | Hugging Face |
| Alternativas de la misma categoría | No disponible | No disponible | No disponible | No disponible | No disponible |

La información proporcionada solo permite comparar contra el baseline del profesor citado en la propia model card. No se aportan datos de otros modelos de clasificación de sentimiento comparables.

## Limitaciones y advertencias

- El resultado de 92,09 % de accuracy está declarado por el autor con `verified: false`; no ha sido validado de forma independiente.
- La compresión AWQ a `k=32` no reduce parámetros (ratio 1,00x), por lo que el checkpoint no aporta ahorro de memoria ni de cómputo frente al modelo base; su valor es demostrativo del pipeline.
- Modelo entrenado exclusivamente en inglés; no se garantiza un comportamiento correcto en castellano ni en otros idiomas.
- Tarea limitada a clasificación binaria de sentimiento; no genera texto ni soporta instrucciones complejas.
- Riesgo de sesgo: al derivar de BERT-base-uncased afinado sobre SST-2 (reseñas de películas), puede presentar sesgos de dominio y de estilo lingüístico propios del dataset.
- Riesgo de alucinación no aplica en sentido generativo, pero sí de clasificaciones erróneas en textos ambiguos, sarcásticos o fuera de dominio.
- La licencia MIT del repositorio se acompaña de un `license_link` al LICENSE de NeuralOps en GitHub; conviene revisar dicho fichero antes de uso comercial.
- El código de ejemplo de la model card referencia `tahamajs/bert-comp-awq-sst2`, mientras que el ID real del repositorio es `Hooshaai/bert-comp-awq-sst2`; hay que ajustar el `repo_id` al cargar el modelo.
- Requiere la librería NeuralOps y reconstruir la topología comprimida antes de cargar el state dict; no es un checkpoint cargable directamente con `from_pretrained` estándar.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Hooshaai/bert-comp-awq-sst2
- Modelo base: https://huggingface.co/google-bert/bert-base-uncased
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Implementación del compresor AWQ: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/compression/quantization/awq.py
- Licencia NeuralOps (MIT): https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset GLUE: https://huggingface.co/datasets/nyu-mll/glue
