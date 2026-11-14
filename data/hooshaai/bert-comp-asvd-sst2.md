# Hooshaai/bert-comp-asvd-sst2

## Resumen

`Hooshaai/bert-comp-asvd-sst2` es un checkpoint de BERT-Base (`google-bert/bert-base-uncased`) fine-tuneado en GLUE SST-2 y posteriormente comprimido mediante la técnica ASVD (Adaptive Singular Value Decomposition) implementada en la librería NeuralOps. El modelo pertenece al "Compressor Zoo" de NeuralOps, un conjunto de artefactos que documentan el efecto de distintas técnicas de compresión sobre modelos transformer estándar. El checkpoint serializado corresponde al rango de compresión k=256, que reduce el número de parámetros un 8,61 % (de 109.483.778 a 100.058.882) manteniendo una accuracy del 90,14 % en el split de validación de SST-2.

El modelo resuelve un problema acotado: servir como referencia reproducible de cuánta precisión se pierde al aplicar compresión por descomposición en valores singulares sobre un clasificador de sentimiento BERT. No es un modelo de propósito general ni un modelo conversacional: es un clasificador binario de sentimiento (positivo/negativo) para inglés, con arquitectura transformer encoder de 12 capas y dimensión oculta 768.

Su relevancia es principalmente metodológica: publica una tabla Pareto con cuatro rangos (k=256, 128, 64, 32), incluyendo resultados con y sin "LoRA healing", lo que permite evaluar el compromiso entre ratio de compresión y degradación de accuracy. El checkpoint empaquetado en este repositorio es el de k=256, el único que mantiene una paridad razonable con el modelo profesor.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT-Base), 12 capas, dimensión oculta 768 |
| Parámetros totales | 100.058.882 (comprimido, k=256); modelo base original: 109.483.778 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo base BERT-Base admite 512 tokens, pero la model card no lo declara explícitamente para este checkpoint) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | `pytorch_model.bin` (state dict serializado con factores de bajo rango de ASVD); configuración en `config.json`; telemetría en `compression_summary.json`; tokenizer estándar de `bert-base-uncased` |

## Arquitectura y entrenamiento

La arquitectura subyacente es BERT-Base uncased: un transformer encoder de 12 capas, 768 dimensiones ocultas y 12 cabezas de atención, con una cabeza de clasificación de 2 etiquetas para SST-2. Sobre este modelo se aplica `ASVDCompressor`, un compresor de la familia SVD de NeuralOps que descompone matrices de pesos en factores de bajo rango con hooks de compresión de KV-cache y formato de E/S `compressed_tensors`. El rango seleccionado para el checkpoint publicado es k=256, que produce un ratio de compresión físico de 1,094x y una reducción del 8,61 % en parámetros.

El fine-tuning original se realizó sobre GLUE SST-2 (split de validación de 872 muestras para la evaluación reportada). La model card indica que, cuando la compresión zero-shot degrada la accuracy más de 2,0 puntos con una reducción superior a 1,10x, NeuralOps aplica "LoRA healing" con r=8, 50 pasos, learning rate 2e-4 y un presupuesto de 45 segundos. En el caso de k=256, el campo `LoRA Recovery Applied` figura como `False`, es decir, el checkpoint publicado es el resultado directo de la compresión ASVD sin recuperación LoRA. Los rangos más agresivos (k=128, 64, 32) sí aplicaron LoRA healing, con resultados notablemente peores (69,95 %, 49,08 % y 50,92 % respectivamente).

## Capacidades

- Clasificación binaria de sentimiento en inglés (positivo/negativo) sobre texto de una sola frase o párrafo corto, según el formato de SST-2.
- Inferencia estándar de `BertForSequenceClassification` una vez reconstruida la topología comprimida con `compress_model` y cargado el state dict.
- Carga simplificada mediante la API `load_surgeried_model` de NeuralOps Hub.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento de agente.
- No dispone de modo "thinking", visión, audio ni otras modalidades.
- Capacidad multilingüe limitada al inglés; el tokenizer es el vocabulario uncased estándar de BERT.
- No es un modelo generativo: no produce texto libre, solo logits de clasificación.

## Casos de uso

- Análisis de sentimiento en reseñas de producto: el modelo clasifica reseñas cortas en inglés en positivas o negativas; su tamaño reducido (100 M de parámetros) permite desplegarlo en CPU para volúmenes moderados sin GPU dedicada.
- Moderación de comentarios en foros angloparlantes: filtrado previo de mensajes con tono negativo para revisión humana, aprovechando la baja latencia de un clasificador BERT-Base.
- Investigación sobre compresión de modelos: servir como referencia reproducible del compromiso accuracy/compresión de ASVD frente a otras técnicas (magnitude pruning, quantization, distillation) en tareas GLUE.
- Benchmarking de pipelines de despliegue: al ser un checkpoint pequeño y con licencia MIT, es útil para validar integraciones con vLLM, TGI o TorchServe en entornos de clasificación, no de generación.
- Clasificación por lotes en pipelines de datos: etiquetado de grandes corpus de texto en inglés con sentimiento binario para análisis exploratorio o entrenamiento de modelos posteriores.
- Docencia y experimentación: ejemplo didáctico de cómo aplicar SVD a matrices de pesos de un transformer y medir el impacto en la métrica downstream, con telemetría incluida en `compression_summary.json`.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente):

| Modelo / configuración | Ratio de compresión | Parámetros | Accuracy SST-2 (validación) | Paridad vs. profesor (91,63 %) |
|---|---|---|---|---|
| Profesor (BERT-Base fine-tuneado) | 1,00x | 109.483.778 | 91,63 % | — |
| **ASVD k=256 (checkpoint publicado)** | 1,09x | 100.058.882 | **90,14 %** | -1,49 % |
| ASVD k=128 + LoRA healing | 1,21x | 90.615.554 | 69,95 % | -21,68 % |
| ASVD k=64 + LoRA healing | 1,27x | 85.893.890 | 49,08 % | -42,55 % |
| ASVD k=32 + LoRA healing | 1,31x | 83.533.058 | 50,92 % | -40,71 % |

Evaluación realizada físicamente en una NVIDIA GeForce RTX 3090 (24 GB) sobre el split de validación de GLUE SST-2 (872 muestras). No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint pesa aproximadamente 191 MB en `pytorch_model.bin`; la inferencia en FP32 requiere en torno a 0,4-0,8 GB de VRAM, y en FP16 alrededor de 0,2-0,4 GB, incluyendo activaciones para batches pequeños.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente (RTX 3060, RTX 4090, etc.); también funciona en CPU para cargas moderadas.
- Cabe en cualquier GPU consumer con al menos 2 GB de VRAM, e incluso en entornos sin GPU.
- Opciones de despliegue: al ser un checkpoint con topología comprimida específica de NeuralOps, la carga requiere reconstruir el modelo con `compress_model` y cargar el state dict con `strict=False`; también existe la API `load_surgeried_model` del Hub de NeuralOps. No se documenta soporte directo en vLLM, llama.cpp, Ollama o TGI, dado que no es un modelo generativo.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Accuracy SST-2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| **bert-comp-asvd-sst2 (k=256)** | 100.058.882 | no disponible | 90,14 % | MIT | Hugging Face (NeuralOps) |
| BERT-Base fine-tuneado en SST-2 (profesor) | 109.483.778 | 512 tokens (BERT-Base) | 91,63 % | Apache 2.0 (modelo base) | Hugging Face |
| DistilBERT fine-tuneado en SST-2 | no disponible en esta ficha | 512 tokens (DistilBERT) | no disponible | Apache 2.0 | Hugging Face |
| RoBERTa-Base fine-tuneado en SST-2 | no disponible en esta ficha | 512 tokens (RoBERTa) | no disponible | MIT | Hugging Face |

No se dispone de datos de benchmarks de los modelos alternativos en la información proporcionada; la comparativa se limita a los datos del profesor declarados en la propia model card.

## Limitaciones y advertencias

- El checkpoint solo es válido para clasificación binaria de sentimiento en inglés; no debe usarse para generación, razonamiento ni tareas multilingües.
- La arquitectura comprimida requiere reconstruir la topología con `compress_model` antes de cargar el state dict; una carga directa con `from_pretrained` fallará o producirá resultados incorrectos.
- El resultado de 90,14 % de accuracy está declarado por el autor y marcado como `verified: false` en el model-index; no ha sido validado de forma independiente.
- Los rangos de compresión más agresivos (k=128, 64, 32) muestran una degradación severa de accuracy (hasta -42,55 puntos), lo que sugiere que la técnica ASVD no escala bien en este modelo sin un esquema de recuperación más robusto.
- Riesgo de alucinación no aplicable en sentido estricto (modelo clasificador), pero sí riesgo de clasificaciones erróneas en dominios distintos de SST-2 (por ejemplo, sarcasmo, dominios técnicos o textos largos).
- Sesgos heredados de `bert-base-uncased` y del corpus SST-2 (reseñas de películas), que pueden no representar otros dominios o registros.
- Licencia MIT para el checkpoint; el modelo base `bert-base-uncased` se distribuye bajo Apache 2.0, por lo que conviene revisar ambas licencias en uso comercial.
- El repositorio tiene muy pocas descargas (46) y ningún "like", lo que indica escasa validación por parte de la comunidad.
- No se documentan requisitos de longitud de contexto específicos para este checkpoint; se asume el límite de 512 tokens de BERT-Base, pero no está confirmado en la model card.

## Enlaces

- Hugging Face: https://huggingface.co/Hooshaai/bert-comp-asvd-sst2
- Modelo base: https://huggingface.co/google-bert/bert-base-uncased
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Implementación de ASVDCompressor: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/compression/svd/asvd_compressor.py
- Licencia NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset GLUE SST-2: https://huggingface.co/datasets/nyu-mll/glue
