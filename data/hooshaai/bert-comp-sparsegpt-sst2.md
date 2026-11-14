# Hooshaai/bert-comp-sparsegpt-sst2

## Resumen

`bert-comp-sparsegpt-sst2` es un checkpoint comprimido de `google-bert/bert-base-uncased` afinado sobre GLUE SST-2 (clasificación de sentimiento binario en inglés) mediante la librería NeuralOps. La compresión se aplica con el motor `SparseGPTCompressor`, que realiza poda por capas de segundo orden con compensación de pesos basada en Optimal Brain Surgeon (OBS), soportando sparsity no estructurada, por bloques y 2:4 estructurada.

El modelo pertenece al "Compressed & LoRA-Healed Model Zoo" del autor Hooshaai y se serializa con el rank `k=256`, que según la model card produce una ratio de compresión física de `1.00x` (0.0% de reducción de parámetros), es decir, no reduce realmente el tamaño del checkpoint (451.9 MB, prácticamente idéntico al BERT-base original de 109.483.778 parámetros). El interés del repositorio es más metodológico (demostrar el pipeline de compresión y healing de NeuralOps) que práctico, ya que la accuracy cae 4,36 puntos respecto del teacher (91,63% → 87,27%).

La relevancia actual reside en que documenta de forma reproducible el comportamiento de SparseGPT a distintos ranks (`k=256, 128, 64, 32`) sobre una tarea estándar, con telemetría detallada en `compression_summary.json`. Sin embargo, conviene ser explícito: los ranks inferiores degradan severamente la accuracy (75,57%, 62,84% y 58,03%) sin reducir el número de parámetros, lo que limita su uso en producción frente al BERT-base sin comprimir.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder BERT-base (12 capas, hidden size 768) |
| Parametros totales | 109.483.778 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (BERT-base estándar: 512 tokens; no confirmado en la model card) |
| Tipos de cuantizacion | no disponible (el checkpoint se distribuye en `pytorch_model.bin`, sin variantes GGUF/INT8 documentadas) |
| Idiomas soportados | en |
| Licencia | MIT |
| Formato de pesos | `pytorch_model.bin` (PyTorch state dict); tokenizer en `vocab.txt`, `tokenizer.json`, `tokenizer_config.json` |

## Arquitectura y entrenamiento

El modelo parte de `google-bert/bert-base-uncased` (109.483.778 parámetros, 12 capas, dimensión 768), afinado previamente sobre GLUE SST-2. Sobre ese checkpoint se aplica `SparseGPTCompressor` de NeuralOps, que ejecuta poda capa a capa con compensación de pesos OBS. El rank serializado es `k=256`, con `LoRA Recovery Applied: False` según la model card, de modo que no se aplicó healing LoRA en el checkpoint empaquetado (aunque el pipeline lo contempla cuando la caída de accuracy supera 2,0% con reducción >1,10x).

La evaluación multi-rank se realizó físicamente en una NVIDIA GeForce RTX 3090 (24 GB) sobre el split de validación de GLUE SST-2 (872 muestras). Los ranks `k=128`, `64` y `32` también reportan ratio físico `1.00x` y `-0.0%` de reducción de parámetros, lo que sugiere que la poda en esta configuración no elimina pesos del tensor serializado, sino que probablemente enmascara o reorganiza valores. No se documenta en la información disponible el número de tokens de entrenamiento, la composición del dataset más allá de SST-2, ni si hubo RLHF/DPO (no procede en un encoder de clasificación).

## Capacidades

- Clasificación de sentimiento binario (positivo/negativo) sobre texto en inglés, con dos etiquetas de salida (`num_labels=2`).
- Inferencia estándar vía `BertForSequenceClassification` de Transformers, cargando primero la topología comprimida con `compress_model` y luego el state dict.
- Carga unificada mediante `neuralops.hub.load_surgeried_model`, que devuelve modelo y tokenizer en una línea.
- No soporta tool calling ni function calling (no es un modelo generativo ni instruct).
- No soporta agentes ni razonamiento multi-paso.
- Capacidades multilingües: no, solo inglés (`bert-base-uncased`).
- No dispone de modo thinking, visión ni audio.
- Tokenizer WordPiece estándar de BERT uncased (vocabulario original).

## Casos de uso

- Clasificación de sentimiento en reseñas de producto: dado un texto en inglés, el modelo devuelve la probabilidad de sentimiento positivo o negativo. Adecuado por su accuracy de 87,27% en SST-2, aunque por debajo del BERT-base sin comprimir (91,63%).
- Moderación de comentarios en foros en inglés: puede usarse como clasificador de polaridad para priorizar revisiones humanas de mensajes negativos, con la advertencia de que la caída de 4,36 puntos frente al teacher implica más falsos positivos/negativos.
- Filtrado de feedback de usuarios en pipelines de analítica: integrar el modelo como paso batch para etiquetar grandes volúmenes de reseñas en inglés, aprovechando que el checkpoint es pequeño (451,9 MB) y cabe en GPU consumer.
- Reproducción de experimentos de compresión: el repositorio incluye `compression_summary.json` con telemetría de los ranks `256, 128, 64, 32`, útil para investigadores que quieran comparar el efecto de SparseGPT sobre BERT en una tarea estándar.
- Benchmark de pipelines NeuralOps: sirve como caso de referencia para validar `SparseGPTCompressor` y el mecanismo de LoRA healing (`r=8`, 50 pasos, `lr=2e-4`, 45 s) en un entorno controlado (RTX 3090).
- Docencia y demostración de poda OBS: por su licencia MIT y su tamaño moderado, es apropiado para ilustrar en cursos cómo la poda no estructurada afecta la accuracy en un encoder Transformer.
- Baseline negativo controlado: útil para mostrar que una compresión con ratio `1.00x` no aporta beneficio de tamaño y solo degrada la precisión, comparándolo con el teacher original.

## Benchmarks y rendimiento

Datos declarados por el autor en el model-index (no verificados, `verified: false`):

| Rank (`k`) | Ratio físico | Params comprimidos (reducción) | Zero-shot acc | Healed acc | Parity vs teacher (91,63%) |
|:---:|:---:|---:|---:|---:|---:|
| 256 (serializado) | 1,00x | 109.483.778 (-0,0%) | 87,27% | 87,27% | -4,36% |
| 128 | 1,00x | 109.483.778 (-0,0%) | 75,57% | 75,57% | -16,06% |
| 64 | 1,00x | 109.483.778 (-0,0%) | 62,84% | 62,84% | -28,79% |
| 32 | 1,00x | 109.483.778 (-0,0%) | 58,03% | 58,03% | -33,60% |

Métrica oficial del model-index: GLUE SST-2 Validation Accuracy = 87,27% (split `validation`, 872 muestras). No se han publicado otros benchmarks (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 para un batch pequeño (el checkpoint ocupa 451,9 MB en disco); no se documenta VRAM exacta en la model card.
- GPU recomendadas: cualquier GPU con ≥2 GB de VRAM; el autor reporta evaluación en NVIDIA GeForce RTX 3090 (24 GB), pero el modelo es sobradamente pequeño para GPUs consumer.
- Cabe en GPU consumer: sí, incluidas GTX 1650, RTX 3060, RTX 4060 y superiores.
- Opciones de despliegue: requiere la librería `neuralops` para reconstruir la topología comprimida (`compress_model` con `method: sparsegpt, rank: 256`) y cargar el state dict; no se documentan variantes GGUF, ONNX ni integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Params | Contexto | SST-2 val acc | Licencia | Disponibilidad |
|---|---:|---:|---:|---|---|
| `bert-comp-sparsegpt-sst2` (k=256) | 109,48 M | no disponible (BERT: 512) | 87,27% | MIT | Hugging Face |
| `google-bert/bert-base-uncased` (teacher, SST-2) | 109,48 M | 512 | 91,63% (baseline del autor) | Apache-2.0 | Hugging Face |
| `textattack/bert-base-uncased-SST-2` (referencia típica) | 109,48 M | 512 | no disponible en la información | Apache-2.0 | Hugging Face |
| `distilbert-base-uncased-finetuned-sst-2-english` | 66,96 M | 512 | no disponible en la información | Apache-2.0 | Hugging Face |

La comparativa con `textattack` y `distilbert` se incluye por categoría (clasificación SST-2), pero no se dispone de sus métricas en la información proporcionada; no se inventan cifras.

## Limitaciones y advertencias

- El checkpoint serializado (`k=256`) no reduce parámetros ni tamaño respecto del BERT-base original (ratio `1.00x`, `-0.0%`), por lo que no aporta beneficio de eficiencia frente al modelo sin comprimir.
- Caída de accuracy de 4,36 puntos frente al teacher (91,63% → 87,27%) sin compensación de LoRA healing aplicada en el checkpoint empaquetado.
- Los ranks `k=128`, `64` y `32` degradan la accuracy hasta 58,03%, lo que los hace inutilizables para producción en SST-2.
- Solo soporta inglés; no es multilingüe.
- Riesgo de alucinación no aplica (no es generativo), pero sí de clasificaciones erróneas en textos ambiguos, irónicos o fuera de dominio.
- Sesgos heredados de `bert-base-uncased` y de la distribución de SST-2 (reseñas de películas), que pueden trasladarse a otros dominios.
- La carga requiere la librería `neuralops` y un paso de reconstrucción de topología antes de `load_state_dict`; no es un checkpoint directamente utilizable con `AutoModelForSequenceClassification` sin ese paso.
- Los resultados de benchmarks están marcados como no verificados (`verified: false`) en el model-index.
- Licencia MIT permite uso comercial, pero conviene revisar la licencia del modelo base (Apache-2.0) y las condiciones del dataset GLUE/SST-2.
- El `repo_id` en los ejemplos de la model card aparece como `tahamajs/bert-comp-sparsegpt-sst2`, mientras que el repositorio real es `Hooshaai/bert-comp-sparsegpt-sst2`; verificar la ruta antes de descargar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Hooshaai/bert-comp-sparsegpt-sst2
- Modelo base: https://huggingface.co/google-bert/bert-base-uncased
- Librería NeuralOps (GitHub): https://github.com/tahamajs/NeuralOps
- Implementación de SparseGPTCompressor: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/compression/pruning/sparsegpt.py
- Licencia NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset GLUE SST-2: https://huggingface.co/datasets/nyu-mll/glue
