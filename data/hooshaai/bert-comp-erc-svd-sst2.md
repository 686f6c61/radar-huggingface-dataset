# Hooshaai/bert-comp-erc-svd-sst2

## Resumen

`Hooshaai/bert-comp-erc-svd-sst2` es un checkpoint de BERT-Base (`google-bert/bert-base-uncased`) comprimido físicamente mediante la técnica ERC-SVD (Error-Controlled SVD con truncamiento de Frobenius acotado) e implementada en la librería NeuralOps. El modelo parte del ajuste fino original sobre GLUE SST-2 (clasificación de sentimiento binaria en inglés) y aplica una compresión de rango `k=128` que reduce los parámetros de 109,48 M a 45,79 M, un 58,17 % menos, equivalente a una ratio de compresión física de 2,39x. Sobre el modelo comprimido se aplica un "healing" con LoRA de rango 8 para intentar recuperar parte de la precisión perdida.

El problema que aborda es la reducción del coste de almacenamiento e inferencia de modelos transformer sin reentrenar desde cero, empleando descomposición SVD con control del error de Frobenius. Es relevante en el contexto de la investigación en compresión de modelos y en el "compressor zoo" de NeuralOps, que evalúa distintos ranks y mide el compromiso entre ratio de compresión y precisión downstream.

Conviene señalar que el resultado publicado es muy bajo: 50,92 % de accuracy en la validación de SST-2, frente al 91,63 % del modelo profesor. Esto sitúa al modelo prácticamente en el nivel de un clasificador aleatorio binario y lo aleja de un uso en producción; su interés es principalmente experimental como artefacto de investigación sobre compresión. El repositorio ocupa 0,1 GB, la licencia es MIT y el idioma soportado es únicamente inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder BERT-Base (12 capas, dimensión oculta 768), comprimido con ERC-SVD |
| Parametros totales | 45.792.002 (modelo comprimido; el base original tiene 109.483.778) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible (el modelo base BERT-Base admite 512 tokens, pero la model card no lo declara explícitamente) |
| Tipos de cuantizacion | no disponible (el artefacto distribuido es `pytorch_model.bin` en precisión completa; no se documentan variantes GGUF/INT8) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | `pytorch_model.bin` (state dict serializado), `config.json`, `compression_summary.json`, assets de tokenizer de `bert-base-uncased` |

## Arquitectura y entrenamiento

El modelo base es BERT-Base uncased: un transformer encoder de 12 capas con 768 dimensiones ocultas y 109.483.778 parámetros, ajustado previamente sobre GLUE SST-2 para clasificación binaria de sentimiento. Sobre ese checkpoint se aplica el compresor `ERCCompressor` (registro `erc_svd`) de NeuralOps, que realiza una SVD con truncamiento de error de Frobenius acotado sobre las matrices de pesos. En el rank seleccionado `k=128` se obtiene un modelo de 45.792.002 parámetros, con una reducción del 58,17 % y una ratio de compresión física de 2,391x.

Cuando la compresión zero-shot degrada la accuracy más de 2,0 puntos con una reducción superior a 1,10x, NeuralOps aplica un "healing" con LoRA de rango `r=8`, 50 pasos y `lr=2e-4`, con un presupuesto de 45 segundos. La evaluación se realizó físicamente en una NVIDIA GeForce RTX 3090 (24 GB) sobre el split de validación de SST-2 (872 muestras). El pipeline de reconstrucción exige cargar el modelo base, aplicar `compress_model` con `erc_svd` y `rank=128`, y posteriormente cargar el state dict con `strict=False`; no es un checkpoint cargable directamente con `from_pretrained` de Transformers sin la librería NeuralOps.

## Capacidades

- Clasificación binaria de sentimiento en inglés (positivo/negativo) sobre texto de una sola frase, según el pipeline `text-classification`.
- Generación de logits para dos clases mediante `BertForSequenceClassification` con `num_labels=2`.
- Reconstrucción de la topología comprimida y carga de pesos mediante el pipeline de NeuralOps (`compress_model` + `load_state_dict`).
- Carga unificada mediante la API `load_surgeried_model` del hub de NeuralOps.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking.
- Capacidad multilingüe limitada al inglés; el vocabulario es el de `bert-base-uncased`.
- No es un modelo generativo: no produce texto libre, solo etiquetas de clasificación.

## Casos de uso

- Investigación en compresión de modelos: sirve como artefacto reproducible para comparar el compromiso precisión/compresión de ERC-SVD frente a otras técnicas (magnitude pruning, quantización, destilación) sobre un mismo modelo base y dataset.
- Reproducción de experimentos del compressor zoo de NeuralOps: permite validar los resultados multi-rank (k=256, 128, 64, 32) publicados en la model card y contrastar el efecto del healing LoRA.
- Docencia y divulgación sobre SVD aplicada a transformers: el repositorio incluye `compression_summary.json` con telemetría legible por máquina, útil para explicar el truncamiento de Frobenius en matrices de pesos.
- Pruebas de integración de la librería NeuralOps: sirve para verificar el correcto funcionamiento de `compress_model` y `load_surgeried_model` en pipelines propios.
- Benchmarking de infraestructura de inferencia de bajo coste: al reducir parámetros un 58 %, permite medir latencia y memoria en GPUs modestas con un modelo de clasificación sencillo.
- Clasificación de sentimiento en entornos de prototipado donde la precisión no sea crítica y se priorice el tamaño reducido del checkpoint (87,5 MB de pesos), siempre con la advertencia de su baja accuracy.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (no verificados, `verified: false`):

| Rank (k) | Ratio físico | Params comprimidos (reducción) | Acc zero-shot | Acc con LoRA | Paridad vs profesor (91,63 %) |
|:---:|:---:|---:|---:|---:|---:|
| 256 | 1,63x | 67.034.882 (-38,8 %) | 57,00 % | 50,92 % | -40,71 % |
| 128 (checkpoint publicado) | 2,39x | 45.792.002 (-58,2 %) | 53,67 % | 50,92 % | -40,71 % |
| 64 | 3,11x | 35.170.562 (-67,9 %) | 50,92 % | 49,08 % | -42,55 % |
| 32 | 3,67x | 29.859.842 (-72,7 %) | 52,06 % | 49,08 % | -42,55 % |

Evaluación sobre GLUE SST-2, split de validación (872 muestras), en NVIDIA GeForce RTX 3090 (24 GB). El modelo profesor de referencia alcanza 91,63 % de accuracy; el checkpoint publicado se queda en 50,92 %, con una caída de 40,71 puntos. No se han publicado otros benchmarks (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 para el modelo comprimido (45,79 M de parámetros, ~183 MB en FP32; ~87,5 MB de pesos según la model card, coherente con pesos de menor precisión o con los factores de bajo rango almacenados).
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; el autor validó en una RTX 3090 (24 GB) por comodidad, pero el modelo cabe holgadamente en GPUs de 4-8 GB.
- Cabe en GPU consumer: sí, en cualquier GPU con al menos 2 GB de VRAM (GTX 1050 Ti, RTX 2060, RTX 3060, RTX 4060, etc.).
- Opciones de despliegue: la carga requiere la librería NeuralOps (`neuralops.hub.load_surgeried_model` o el pipeline `compress_model`); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, y al no ser un modelo generativo estas herramientas no aplican de forma estándar.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Params | Contexto | SST-2 (val) | Licencia | Disponibilidad |
|---|---|---:|---:|---|---|
| `Hooshaai/bert-comp-erc-svd-sst2` | 45,79 M (comprimido) | no disponible | 50,92 % | MIT | Hugging Face + NeuralOps |
| `google-bert/bert-base-uncased` (profesor) | 109,48 M | 512 tokens | 91,63 % (según la model card) | Apache 2.0 | Hugging Face, Transformers |
| `distilbert-base-uncased-finetuned-sst-2-english` | 66,96 M | 512 tokens | no disponible en esta ficha | Apache 2.0 | Hugging Face, Transformers |
| `textattack/bert-base-uncased-SST-2` | 109,48 M | 512 tokens | no disponible en esta ficha | Apache 2.0 | Hugging Face, Transformers |

La comparación con DistilBERT y con el BERT ajustado de TextAttack es orientativa: son alternativas de tamaño y tarea comparables, pero no se dispone de sus métricas exactas en la información proporcionada. En términos de ratio de compresión, el checkpoint ERC-SVD ofrece 2,39x frente al profesor, pero con una pérdida de precisión muy superior a la de la destilación estándar de DistilBERT.

## Limitaciones y advertencias

- Precisión muy baja: 50,92 % en SST-2 frente al 91,63 % del profesor, prácticamente equivalente a un clasificador aleatorio binario. No es apto para uso en producción.
- El healing con LoRA empeora el resultado en varios ranks (por ejemplo, k=256 pasa de 57,00 % zero-shot a 50,92 % tras LoRA), lo que sugiere un problema en el procedimiento de recuperación o en la selección de hiperparámetros.
- Riesgo elevado de predicciones erróneas y de falsos positivos/negativos en cualquier tarea de sentimiento real.
- Solo inglés; no cubre otros idiomas.
- Requiere la librería NeuralOps para cargar el checkpoint; no es directamente compatible con `AutoModel.from_pretrained` de Transformers sin pasos adicionales.
- El resultado del benchmark está marcado como no verificado (`verified: false`) por el propio autor.
- No se documentan sesgos específicos, pero al derivar de `bert-base-uncased` hereda los sesgos del corpus original (Wikipedia y BooksCorpus en inglés).
- Licencia MIT permite uso comercial, pero la calidad del modelo desaconseja cualquier despliegue real.
- El repositorio tiene muy poca tracción (47 descargas, 0 likes) y fue creado en noviembre de 2026, por lo que no hay validación independiente de los resultados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Hooshaai/bert-comp-erc-svd-sst2
- Modelo base: https://huggingface.co/google-bert/bert-base-uncased
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Implementación del compresor ERC-SVD: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/compression/svd/erc_svd.py
- Licencia NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset GLUE SST-2: https://huggingface.co/datasets/nyu-mll/glue
- Paper de BERT: https://arxiv.org/abs/1810.04805
- Paper de LoRA: https://arxiv.org/abs/2106.09685
