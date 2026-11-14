# Hooshaai/bert-comp-aa-svd-compressor-sst2

## Resumen

`Hooshaai/bert-comp-aa-svd-compressor-sst2` es un checkpoint de BERT-base comprimido mediante la técnica Activation-Aware SVD (AASVD) e incluido en el zoo de modelos comprimidos NeuralOps. Parte de `google-bert/bert-base-uncased` afinado previamente sobre GLUE SST-2 (clasificación de sentimiento binaria en inglés) y aplica una descomposición SVD sensible a las activaciones para reducir el número de parámetros manteniendo la calidad predictiva. El resultado es un modelo de 100.058.882 parámetros (frente a los 109.483.778 del original, un 8,61 % menos) que conserva una accuracy del 90,14 % en el split de validación de SST-2, frente al 91,63 % del modelo profesor.

El interés del modelo es fundamentalmente metodológico: sirve como demostración reproducible de compresión física de pesos (no meramente poda dispersa) con evaluación Pareto multi-rango. El autor publica resultados para cuatro rangos de compresión (k=256, 128, 64 y 32), mostrando el compromiso entre ratio de compresión y degradación de accuracy. El checkpoint serializado en el repositorio corresponde al rango k=256, el único que mantiene una degradación inferior al 2 % respecto al profesor.

Se trata de un modelo pequeño, orientado a inferencia de bajo coste en CPU o GPU modesta, con licencia MIT y pesos en formato `pytorch_model.bin` (no safetensors). No es un modelo generativo: es un clasificador de secuencias de dos etiquetas, útil como caso de estudio de pipelines de compresión y como componente ligero en sistemas de análisis de sentimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT-base), 12 capas, dimensión oculta 768 |
| Parametros totales | 100.058.882 (comprimido, k=256); original 109.483.778 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada de bert-base-uncased, típicamente 512 tokens; no confirmado en la información) |
| Tipos de cuantizacion | No disponible (el checkpoint se distribuye en precisión completa, `pytorch_model.bin`) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | `pytorch_model.bin` (PyTorch state dict), `config.json`, `compression_summary.json`, assets de tokenizer BERT |

## Arquitectura y entrenamiento

El modelo base es `google-bert/bert-base-uncased`, un transformer encoder de 12 capas con dimensión oculta 768 y 109.483.778 parámetros, afinado sobre GLUE SST-2 para clasificación binaria de sentimiento. Sobre ese checkpoint, el autor aplica el compresor `AASVDCompressor` (familia `svd`) de la librería NeuralOps, que realiza una descomposición en valores singulares ponderada por las activaciones observadas en un conjunto de calibración. A diferencia de una SVD estándar sobre los pesos, la versión "activation-aware" aproxima las matrices minimizando el error en el espacio de activaciones, lo que preserva mejor el comportamiento funcional de las capas.

El checkpoint distribuido corresponde al rango k=256, con un ratio de compresión físico de 1,094x y una reducción del 8,61 % de parámetros. Según la model card, en este rango no se aplicó LoRA de recuperación ("LoRA Recovery Applied: False"), ya que la caída de accuracy zero-shot (90,14 %) no superó el umbral del 2 % que activa el proceso de healing. Para rangos más agresivos (k=128, 64, 32) sí se aplicó LoRA con r=8, 50 pasos y lr=2e-4, con resultados notablemente degradados (69,95 %, 49,08 % y 50,92 % respectivamente). La evaluación se realizó físicamente en una NVIDIA GeForce RTX 3090 (24 GB) sobre el split de validación de SST-2 (872 muestras). No se detalla en la información proporcionada el conjunto de calibración, el número de tokens de entrenamiento original ni la composición del dataset más allá de GLUE SST-2.

## Capacidades

- Clasificación binaria de sentimiento (positivo/negativo) en inglés, especializada en el dominio de SST-2 (reseñas de películas).
- Inferencia sobre secuencias de texto cortas y medianas; no es un modelo generativo.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento de agente.
- Capacidad multilingüe limitada al inglés; el tokenizer es el vocabulario uncased estándar de BERT.
- No dispone de modo "thinking", visión, audio ni otras modalidades.
- Reconstrucción y carga mediante la API de NeuralOps (`compress_model`, `load_surgeried_model`) o mediante `transformers` tras aplicar la topología de compresión.

## Casos de uso

- Análisis de sentimiento en reseñas de productos o películas: el modelo clasifica texto en positivo/negativo con un 90,14 % de accuracy en SST-2, adecuado para moderación ligera o agregación de opiniones a bajo coste.
- Filtrado previo en pipelines de datos: como clasificador rápido en CPU o GPU modesta, puede etiquetar grandes volúmenes de reseñas antes de pasarlas a modelos más caros.
- Estudio de técnicas de compresión: sirve como referencia reproducible para comparar AASVD frente a otras técnicas (poda, cuantización, destilación) en una tarea estándar como SST-2.
- Docencia e investigación en eficiencia de modelos: el repositorio incluye `compression_summary.json` con telemetría multi-rango, útil para analizar el compromiso compresión/accuracy.
- Despliegue en entornos con recursos limitados: al ocupar 191 MB de pesos y ~100 M de parámetros, cabe en dispositivos edge o contenedores pequeños donde un BERT completo no es viable.
- Componente en sistemas de clasificación en cascada: puede actuar como primera etapa de filtrado de sentimiento antes de un modelo mayor o de un LLM, reduciendo coste computacional.
- Benchmarking de pipelines de compresión en CI: integrable en tests automatizados que verifiquen que una nueva versión del compresor no degrada la accuracy por debajo de un umbral.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (no verificados de forma independiente, `verified: false`):

| Modelo / rango | Ratio compresión | Params comprimidos | Acc SST-2 (zero-shot) | Acc SST-2 (healed) | Delta vs profesor |
|---|---|---|---|---|---|
| Profesor (bert-base-uncased) | 1,00x | 109.483.778 | 91,63 % | — | — |
| **k=256 (este checkpoint)** | 1,09x | 100.058.882 | 90,14 % | 90,14 % | -1,49 % |
| k=128 | 1,21x | 90.615.554 | 84,98 % | 69,95 % (LoRA) | -21,68 % |
| k=64 | 1,27x | 85.893.890 | 71,79 % | 49,08 % (LoRA) | -42,55 % |
| k=32 | 1,31x | 83.533.058 | 47,82 % | 50,92 % (LoRA) | -40,71 % |

Evaluación sobre el split de validación de GLUE SST-2 (872 muestras) en NVIDIA GeForce RTX 3090. No se han publicado otros benchmarks (MMLU, HumanEval, GSM8K, etc.) en la información disponible, ya que el modelo no es generativo.

## Requisitos de hardware

- VRAM estimada para inferencia: ~0,4 GB en fp32 (191 MB de pesos más overhead de activaciones), holgadamente por debajo de 1 GB.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM; funciona bien en RTX 3060, RTX 4090, A100, H100, aunque el modelo es tan pequeño que la GPU no es imprescindible.
- Cabe en cualquier GPU consumer, incluida una GTX 1050 o similar; también en CPU con latencias aceptables.
- Opciones de despliegue: `transformers` con reconstrucción vía NeuralOps (`compress_model` + `load_state_dict`), o la API `load_surgeried_model` de NeuralOps. No se documenta compatibilidad directa con vLLM, llama.cpp, Ollama o TGI (el formato `pytorch_model.bin` y la topología comprimida requieren la librería NeuralOps para reconstruir el grafo).
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño del modelo, se espera throughput alto en GPU y moderado en CPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Params | Contexto | Acc SST-2 | Licencia | Formato |
|---|---|---|---|---|---|
| **bert-comp-aa-svd-compressor-sst2 (k=256)** | 100,06 M | No disponible | 90,14 % | MIT | `pytorch_model.bin` |
| google-bert/bert-base-uncased (profesor SST-2) | 109,48 M | 512 tokens (típico) | 91,63 % | Apache 2.0 | safetensors |
| DistilBERT-base-uncased-finetuned-sst-2 | ~66 M | 512 tokens (típico) | ~91 % (referencia pública) | Apache 2.0 | safetensors |
| RoBERTa-base SST-2 | ~125 M | 512 tokens (típico) | ~94-95 % (referencia pública) | MIT | safetensors |

Nota: los valores de DistilBERT y RoBERTa son referencias públicas habituales, no verificadas en la información proporcionada; se incluyen solo como orientación. El checkpoint NeuralOps destaca por su licencia MIT y su enfoque de compresión física, pero su ratio (1,09x) es modesto frente a alternativas como DistilBERT, que reduce parámetros a la mitad con accuracy comparable.

## Limitaciones y advertencias

- Solo inglés: el tokenizer y el entrenamiento están limitados a `en`; el rendimiento en otros idiomas no está evaluado.
- Dominio restringido: afinado exclusivamente en SST-2 (reseñas de películas); puede degradarse en otros dominios (redes sociales, texto técnico, etc.).
- Riesgo de alucinación bajo: al ser un clasificador, no genera texto, pero puede producir falsos positivos/negativos en sentimiento ambiguo o irónico.
- Sesgos heredados de BERT-base y de SST-2: posibles sesgos demográficos, de género o culturales presentes en los datos originales.
- Licencia MIT: permite uso comercial, pero el modelo base `bert-base-uncased` es Apache 2.0; conviene revisar la compatibilidad de ambas licencias en producción.
- Formato no estándar: requiere la librería NeuralOps para reconstruir la topología comprimida; no es cargable directamente con `AutoModel.from_pretrained` sin aplicar `compress_model` antes.
- Resultados no verificados: la accuracy de 90,14 % está marcada como `verified: false` en el model-index; no hay validación independiente.
- El ratio de compresión es bajo (1,09x) y la ganancia en tamaño es modesta (191 MB frente a ~440 MB del original en fp32); para reducciones mayores, los rangos k=128, 64 y 32 degradan gravemente la accuracy.
- Sin soporte documentado para cuantización ni para despliegue en motores de inferencia estándar (vLLM, TGI, llama.cpp).

## Enlaces

- Hugging Face: https://huggingface.co/Hooshaai/bert-comp-aa-svd-compressor-sst2
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Implementación del compresor AASVD: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/compression/svd/aa_svd_compressor.py
- Licencia NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Modelo base: https://huggingface.co/google-bert/bert-base-uncased
- Dataset GLUE SST-2: https://huggingface.co/datasets/nyu-mll/glue
