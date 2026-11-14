# Hooshaai/bert-comp-rotational-slicegpt-int4-sst2

## Resumen

`bert-comp-rotational-slicegpt-int4-sst2` es un checkpoint comprimido de `google-bert/bert-base-uncased` fine-tuneado para clasificación de sentimiento en GLUE SST-2, publicado por el usuario Hooshaai dentro del ecosistema de compresión NeuralOps. El modelo aplica el motor `RotationalSliceGPTINT4Compressor` (familia de cuantización) en el rango de compresión `k=256`, reduciendo los parámetros de los 109,5 millones originales a 24,5 millones (-77,58 %, ratio físico 4,46x) y aplicando un proceso de "LoRA healing" para intentar recuperar precisión tras la compresión.

Se trata, por tanto, de un artefacto de investigación sobre compresión de modelos más que de un modelo listo para producción: el propio autor reporta una precisión final del 56,08 % en el split de validación de SST-2, frente al 91,63 % del modelo profesor sin comprimir, lo que supone una caída de 35,55 puntos. La relevancia actual reside en que documenta de forma transparente el coste en calidad de técnicas agresivas de compresión (rotacional + SliceGPT + INT4) sobre un transformer encoder clásico.

El modelo es de tipo encoder-only (BERT-base, 12 capas, dimensión oculta 768), está entrenado únicamente en inglés, se distribuye bajo licencia MIT y su repositorio ocupa 0,1 GB. La librería declarada es `neuralops`, no `transformers` estándar, lo que implica pasos de reconstrucción específicos para cargarlo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT-base), 12 capas, dimension oculta 768 |
| Parametros totales | 24.549.122 (comprimido); modelo base original: 109.483.778 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada de bert-base-uncased, 512 tokens por defecto, no confirmado en la model card) |
| Tipos de cuantizacion | INT4 combinada con compresion rotacional y SliceGPT (`rotational_slicegpt_int4`), rango k=256 |
| Idiomas soportados | Ingles (`en`) |
| Licencia | MIT |
| Formato de pesos | `pytorch_model.bin` (state dict serializado), `config.json`, `compression_summary.json`, assets de tokenizer BERT |

## Arquitectura y entrenamiento

El modelo parte de `google-bert/bert-base-uncased`, un transformer encoder de 12 capas y 768 dimensiones ocultas, fine-tuneado originalmente para clasificación binaria de sentimiento en GLUE SST-2. Sobre esa base, NeuralOps aplica una compresión híbrida que combina tres técnicas: una transformación rotacional de pesos, la poda estructurada de SliceGPT y cuantización a INT4. El resultado es un checkpoint con 24.549.122 parámetros (reducción del 77,58 % respecto al original, ratio físico de 4,46x) en el rango `k=256`, que es el artefacto serializado en este repositorio.

Tras la compresión, el pipeline evalúa el impacto en precisión y, cuando la caída supera el 2,0 % con una reducción superior a 1,10x, aplica un "LoRA healing" con r=8, 50 pasos, learning rate 2e-4 y un presupuesto de 45 segundos. La evaluación se realizó físicamente en una NVIDIA GeForce RTX 3090 (24 GB) sobre las 872 muestras del split de validación de SST-2. El autor reporta resultados para cuatro rangos (k=256, 128, 64 y 32), todos con el mismo ratio físico de 4,46x y el mismo recuento de parámetros comprimidos, lo que sugiere que la variación de rango no altera el tamaño físico del artefacto en esta implementación.

No se documentan en la información disponible detalles sobre el dataset de entrenamiento original de BERT, el volumen de tokens, la composición del corpus ni si hubo RLHF o DPO (procedimientos no habituales en un encoder de clasificación).

## Capacidades

- Clasificación de texto binaria (sentimiento positivo/negativo) sobre entradas en inglés, con logits de dos clases.
- Inferencia sobre texto tokenizado con el vocabulario estándar `bert-base-uncased`.
- No soporta generación de texto, razonamiento multi-paso, código ni matemáticas: es un encoder de clasificación.
- No dispone de tool calling ni function calling.
- No está diseñado para uso agéntico ni multi-step reasoning.
- Capacidad multilingüe limitada al inglés (el vocabulario uncased de BERT incluye algunos tokens de otros idiomas, pero el modelo no fue entrenado para ellos).
- No incorpora visión, audio ni modo "thinking".

## Casos de uso

- Investigación sobre compresión de modelos: sirve como referencia reproducible para medir el coste en precisión de la combinación rotacional + SliceGPT + INT4 sobre un encoder BERT, con telemetría completa en `compression_summary.json` para los rangos 256, 128, 64 y 32.
- Análisis de sentimiento en inglés de baja criticidad: clasificación de reseñas o comentarios donde un 56 % de accuracy sea aceptable como señal aproximada, por ejemplo en paneles internos de exploración de opiniones.
- Prototipado de pipelines de clasificación en entornos con recursos muy limitados: al ocupar 0,1 GB y contar con 24,5 M de parámetros, puede ejecutarse en CPU o en GPUs de gama baja para pruebas de integración.
- Docencia y demostraciones de técnicas de cuantización: permite ilustrar en clase o en talleres el efecto de la compresión agresiva y del "LoRA healing" comparando el checkpoint con el profesor original.
- Benchmarking de infraestructura de inferencia: útil para medir latencia y throughput de un modelo INT4 de 24,5 M de parámetros en distintas plataformas (RTX 3090, CPU, edge) sin depender de modelos grandes.
- Filtrado previo en pipelines de datos: como clasificador rápido y barato para descartar o priorizar textos en inglés antes de pasarlos a un modelo mayor, siempre que se tolere su baja precisión.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados, `verified: false`):

| Metrica | Valor |
|---|---|
| GLUE SST-2 Validation Accuracy (modelo comprimido, k=256, con LoRA healing) | 56,08 % |
| GLUE SST-2 Validation Accuracy (zero-shot tras compresion, k=256) | 50,92 % |
| GLUE SST-2 Validation Accuracy (profesor `bert-base-uncased` fine-tuneado) | 91,63 % |
| Parity delta frente al profesor | -35,55 % |

Evaluación multi-rango reportada por el autor (mismo ratio físico 4,46x y 24.549.122 parámetros en todos los casos):

| Rango (k) | Zero-shot Acc | Acc con LoRA healing | Parity vs profesor |
|---|---|---|---|
| 256 | 50,92 % | 56,08 % | -35,55 % |
| 128 | 49,08 % | 50,92 % | -40,71 % |
| 64 | 49,08 % | 50,92 % | -40,71 % |
| 32 | 49,08 % | 50,92 % | -40,71 % |

No se han publicado en la información disponible resultados de otros benchmarks (MMLU, HumanEval, GSM8K u otros).

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 dado el tamaño del checkpoint (0,1 GB en disco, 24,5 M de parámetros); en INT4 el peso efectivo es aún menor.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; el autor evaluó en una NVIDIA GeForce RTX 3090 (24 GB), aunque el modelo no aprovecha esa capacidad.
- Cabe holgadamente en GPU consumer (RTX 3060, RTX 4060, GTX 1660, etc.) y también en CPU.
- Opciones de despliegue: la model card solo documenta carga mediante la librería `neuralops` (reconstrucción de la topología comprimida con `compress_model` y carga del state dict con `load_state_dict(strict=False)`), además de la API `neuralops.hub.load_surgeried_model`. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | SST-2 (val) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `bert-comp-rotational-slicegpt-int4-sst2` (este) | 24,5 M (comprimido) | No disponible | 56,08 % | MIT | Hugging Face |
| `google-bert/bert-base-uncased` fine-tuneado en SST-2 (profesor) | 109,5 M | 512 tokens | 91,63 % (según el autor) | Apache 2.0 | Hugging Face |
| `distilbert-base-uncased-finetuned-sst-2-english` | ~66 M | 512 tokens | No disponible en la información | Apache 2.0 | Hugging Face |
| `textattack/bert-base-uncased-SST-2` | 109,5 M | 512 tokens | No disponible en la información | Apache 2.0 | Hugging Face |

La comparación se limita a referencias de la misma familia; no se dispone de datos de benchmarks de los modelos alternativos en la información proporcionada, por lo que no se puede establecer una comparación cuantitativa completa.

## Limitaciones y advertencias

- Precisión muy degradada: 56,08 % en SST-2 frente al 91,63 % del profesor, una caída de 35,55 puntos que lo sitúa solo ligeramente por encima del azar en una tarea binaria.
- El "LoRA healing" recupera apenas 5,16 puntos sobre el zero-shot (50,92 % → 56,08 %); los rangos k=128, 64 y 32 no superan el 50,92 %.
- Riesgo elevado de predicciones erróneas y de comportamiento inconsistente en producción; no es apto para decisiones automatizadas con impacto real.
- Solo inglés: cualquier uso con otros idiomas carece de garantías.
- Requiere la librería `neuralops` y pasos manuales de reconstrucción de topología; no es cargable directamente con `transformers` sin ese proceso.
- El autor marca los resultados como no verificados (`verified: false`); conviene reproducirlos antes de confiar en ellos.
- Licencia MIT: permite uso comercial, pero la degradación de precisión hace desaconsejable su uso en producción sin una evaluación propia.
- La model card no documenta sesgos específicos, pero al derivar de `bert-base-uncased` hereda los sesgos de su corpus de preentrenamiento (texto web en inglés).
- El enlace del `repo_id` en los ejemplos de la model card (`tahamajs/...`) no coincide con el identificador del repositorio (`Hooshaai/...`), lo que puede provocar errores al ejecutar el código de ejemplo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Hooshaai/bert-comp-rotational-slicegpt-int4-sst2
- Modelo base: https://huggingface.co/google-bert/bert-base-uncased
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Implementación del compresor: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/compression/quantization/rotational_slicegpt_int4.py
- Licencia NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset GLUE SST-2: https://huggingface.co/datasets/nyu-mll/glue
