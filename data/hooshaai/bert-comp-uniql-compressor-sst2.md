# Hooshaai/bert-comp-uniql-compressor-sst2

## Resumen

`Hooshaai/bert-comp-uniql-compressor-sst2` es un checkpoint comprimido de `google-bert/bert-base-uncased` afinado para clasificación de sentimiento en GLUE SST-2. Lo publica el usuario Hooshaai dentro del ecosistema NeuralOps, una librería de compresión de modelos que agrupa técnicas de rango bajo, cuantización y "curación" mediante LoRA. El modelo aplica el compresor `UniQLCompressor`, que combina SVD truncada conjunta con cuantización uniforme int8 sobre los factores U, S y Vt, reduciendo el número de parámetros de 109,48 M a 24,55 M (ratio físico de 4,46x, un 77,6 % menos).

El resultado es un clasificador binario de sentimiento en inglés que, tras un proceso de recuperación con LoRA (r=8, 50 pasos, lr=2e-4), alcanza un 75,80 % de accuracy en la partición de validación de SST-2, frente al 91,63 % del profesor original. Es, por tanto, un modelo de investigación orientado a estudiar el compromiso entre compresión agresiva y degradación de rendimiento, no un clasificador listo para producción de alta precisión.

La relevancia actual reside en su utilidad como referencia reproducible del "Pareto" de compresión: el repositorio incluye telemetría para los rangos k=256, 128, 64 y 32, lo que permite analizar cómo afecta el rango de truncamiento a la accuracy tras el healing con LoRA. Su licencia MIT y su tamaño reducido (unos 87,7 MB de pesos) facilitan experimentación en hardware modesto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder BERT-base (12 capas, dimensión oculta 768), con capas lineales sustituidas por módulos `UniQLinear` de rango bajo y buffers int8 |
| Parametros totales | 24.549.122 (comprimido); modelo base original: 109.483.778 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el BERT-base original soporta 512 tokens, pero la model card no lo declara) |
| Tipos de cuantizacion | Cuantización uniforme int8 de los factores U, S y Vt dentro del compresor UniQL; no se documentan otras variantes (GGUF, GPTQ, etc.) |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | `pytorch_model.bin` (state dict serializado con factores de rango bajo, buffers de cuantización y adaptadores LoRA integrados); configuración en `config.json` y telemetría en `compression_summary.json` |

## Arquitectura y entrenamiento

El modelo parte de `bert-base-uncased`, un transformer encoder de 12 capas y 768 dimensiones ocultas, y le aplica el compresor `UniQLCompressor` de NeuralOps. Este compresor realiza una SVD truncada conjunta sobre las matrices de peso y cuantiza a int8 los factores resultantes (U, S, Vt), instalando módulos `UniQLinear` reales en lugar de una reconstrucción "copy back". Con rango k=256 se obtiene una reducción del 77,58 % de parámetros y un ratio de compresión físico de 4,46x.

El entrenamiento original corresponde al fine-tuning de BERT-base sobre GLUE SST-2 (el profesor alcanza 91,63 % de accuracy). Sobre el modelo comprimido se aplica un proceso de "healing" con LoRA de rango r=8, 50 pasos y learning rate 2e-4, con un presupuesto de 45 segundos, que se activa cuando la compresión zero-shot degrada más de 2,0 puntos porcentuales con una reducción superior a 1,10x. La evaluación se realizó físicamente en una NVIDIA GeForce RTX 3090 (24 GB) sobre las 872 muestras de validación de SST-2. No se documentan detalles sobre el dataset de preentrenamiento original ni sobre el uso de RLHF/DPO (no aplicables a un encoder de clasificación).

## Capacidades

- Clasificación binaria de sentimiento (positivo/negativo) en inglés, con dos etiquetas de salida.
- Razonamiento semántico limitado propio de un encoder BERT-base: representaciones contextuales de hasta 512 tokens (según el modelo base; no declarado explícitamente en la model card).
- No soporta tool calling ni function calling: es un modelo de clasificación, no generativo.
- No soporta agentes ni razonamiento multi-paso.
- Capacidades multilingües: solo inglés.
- No dispone de modo "thinking", visión ni audio.
- Inferencia eficiente en memoria gracias a la reducción de parámetros y a los buffers int8.

## Casos de uso

- Análisis de sentimiento en reseñas de producto: clasificar reseñas en inglés como positivas o negativas; el tamaño reducido permite desplegarlo en CPU o GPU de gama baja con bajo coste de memoria.
- Moderación de comentarios en foros: filtrado rápido de toxicidad o polaridad en grandes volúmenes de texto, aprovechando el throughput superior de un modelo de 24,5 M de parámetros frente al BERT-base completo.
- Investigación sobre compresión de modelos: servir como referencia reproducible del compromiso precisión/compresión para comparar el compresor UniQL con otras técnicas (pruning, cuantización, destilación).
- Prototipado rápido en entornos con recursos limitados: validar pipelines de clasificación de texto en portátiles o dispositivos edge antes de escalar a un modelo mayor.
- Docencia y experimentación: ejemplo práctico de SVD truncada, cuantización int8 y healing con LoRA sobre un transformer estándar.
- Benchmarking de librerías de compresión: usar la telemetría multi-rango (k=256, 128, 64, 32) incluida en el repositorio para evaluar el comportamiento de NeuralOps frente a otras herramientas.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (no verificados de forma independiente):

| Modelo / configuración | Dataset | Métrica | Valor |
|---|---|---|---|
| Profesor `bert-base-uncased` (SST-2) | GLUE SST-2 validation | Accuracy | 91,63 % |
| `bert-comp-uniql-compressor-sst2` (k=256, LoRA) | GLUE SST-2 validation | Accuracy | 75,80 % |
| k=256, zero-shot | GLUE SST-2 validation | Accuracy | 60,32 % |
| k=128, tras LoRA | GLUE SST-2 validation | Accuracy | 52,87 % |
| k=64, tras LoRA | GLUE SST-2 validation | Accuracy | 51,61 % |
| k=32, tras LoRA | GLUE SST-2 validation | Accuracy | 47,59 % |

| Rango (k) | Ratio físico | Parámetros comprimidos | Reducción | Zero-shot | Tras LoRA | Delta vs profesor |
|:---:|:---:|---:|---:|---:|---:|---:|
| 256 | 4,46x | 24.549.122 | -77,6 % | 60,32 % | 75,80 % | -15,83 % |
| 128 | 4,46x | 24.549.122 | -77,6 % | 55,05 % | 52,87 % | -38,76 % |
| 64 | 4,46x | 24.549.122 | -77,6 % | 49,89 % | 51,61 % | -40,02 % |
| 32 | 4,46x | 24.549.122 | -77,6 % | 53,10 % | 47,59 % | -44,04 % |

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB para inferencia en fp32 dado el tamaño de 87,7 MB de pesos; aún menor si se mantienen los buffers int8.
- GPU recomendadas: cualquier GPU con más de 2 GB de VRAM; la evaluación del autor se realizó en una RTX 3090 (24 GB), aunque el modelo es sobradamente pequeño para GPUs de gama baja.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna (RTX 3050, RTX 4060, GTX 1660, etc.) e incluso en CPU.
- Opciones de despliegue: el modelo requiere reconstruir la topología comprimida con `neuralops.core.compression_pipeline.compress_model` y cargar el state dict con `torch.load`; también se ofrece la API `neuralops.hub.load_surgeried_model`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada; el autor solo indica un presupuesto de 45 segundos para el healing con LoRA, no métricas de inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | SST-2 (accuracy) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `bert-comp-uniql-compressor-sst2` (k=256) | 24,55 M | no disponible | 75,80 % | MIT | Hugging Face |
| `google-bert/bert-base-uncased` (profesor) | 109,48 M | 512 tokens | 91,63 % (declarado) | Apache 2.0 | Hugging Face |
| `distilbert-base-uncased-finetuned-sst-2-english` | ~66 M | 512 tokens | no disponible en la información proporcionada | Apache 2.0 | Hugging Face |
| `textattack/bert-base-uncased-SST-2` | 109,48 M | 512 tokens | no disponible en la información proporcionada | Apache 2.0 | Hugging Face |

La comparativa con alternativas de compresión (por ejemplo, variantes cuantizadas de BERT o modelos destilados) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Degradación significativa de precisión: 75,80 % frente al 91,63 % del profesor, una pérdida de 15,83 puntos porcentuales; no es adecuado para aplicaciones donde la exactitud sea crítica.
- Los rangos k=128, 64 y 32 muestran un rendimiento cercano al azar (47-53 %), lo que sugiere que el healing con LoRA no compensa la compresión agresiva en esos casos.
- Sesgos heredados de `bert-base-uncased`: el modelo base se entrenó con datos web sin filtrar, por lo que puede reproducir sesgos de género, raza o ideología presentes en el corpus.
- Riesgo de alucinación no aplicable en sentido estricto (es un clasificador), pero sí de clasificaciones erróneas en textos ambiguos, irónicos o de dominio distinto al de SST-2 (reseñas de cine).
- Solo inglés: no soporta otros idiomas.
- Longitud de contexto no declarada explícitamente en la model card; se asume la del BERT-base original (512 tokens), pero conviene verificarlo antes de usarlo con secuencias largas.
- Licencia MIT: permite uso comercial, pero el autor no ofrece garantías sobre el rendimiento en producción.
- Requiere la librería NeuralOps para reconstruir la topología comprimida; no es un checkpoint estándar de `transformers` cargable directamente con `from_pretrained`.
- El repositorio tiene 45 descargas y 0 likes, y los benchmarks no están verificados de forma independiente (`verified: false`).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Hooshaai/bert-comp-uniql-compressor-sst2
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Implementación del compresor UniQL: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/compression/low_rank/uniql_compressor.py
- Licencia NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Modelo base: https://huggingface.co/google-bert/bert-base-uncased
- Dataset GLUE SST-2: https://huggingface.co/datasets/nyu-mll/glue
