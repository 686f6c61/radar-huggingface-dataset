# Hooshaai/bert-comp-ast-pruner-sst2

## Resumen

`Hooshaai/bert-comp-ast-pruner-sst2` es un checkpoint de BERT-Base (`google-bert/bert-base-uncased`, 109.483.778 parámetros, 12 capas, dimensión oculta 768) afinado sobre GLUE SST-2 y procesado con el motor de compresión `ast_pruner` (`ASTPruner`) de la librería NeuralOps. El modelo lo publica el usuario Hooshaai dentro del "NeuralOps Compressed & LoRA-Healed Model Zoo", un esfuerzo por estandarizar técnicas de poda, cuantización y recuperación con LoRA sobre arquitecturas transformer clásicas.

El interés técnico del checkpoint es limitado: el autor declara un ratio de compresión físico de `1.00x` (0,0 % de parámetros eliminados), es decir, el modelo empaquetado conserva exactamente los 109.483.778 parámetros del BERT-Base original. La precisión en la partición de validación de SST-2 (872 muestras) es del 51,38 %, frente al 91,63 % del modelo profesor, lo que supone una caída de 40,25 puntos porcentuales. El propio autor etiqueta este resultado como "zero-shot" y no aplica recuperación LoRA (`LoRA Recovery Applied: False`).

El modelo es relevante únicamente como artefacto de referencia para investigar el comportamiento de `ASTPruner` en un caso degenerado (poda sin reducción efectiva de parámetros) y para reproducir el pipeline de compresión de NeuralOps. No es un modelo recomendable para uso en producción ni para tareas reales de clasificación de sentimiento dado su rendimiento cercano al azar en un problema binario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT-Base), 12 capas, D=768 |
| Parametros totales | 109.483.778 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (BERT-Base estándar: 512 tokens) |
| Tipos de cuantizacion | no disponible (pesos serializados en `pytorch_model.bin`, sin variantes GGUF/INT8 publicadas) |
| Idiomas soportados | en |
| Licencia | MIT |
| Formato de pesos | `pytorch_model.bin` (state dict serializado con factores de bajo rango / buffers de cuantización / adaptadores LoRA horneados) |

## Arquitectura y entrenamiento

La arquitectura subyacente es BERT-Base uncased, un transformer encoder bidireccional de 12 capas con 768 dimensiones ocultas y 12 cabezas de atención, afinado para clasificación binaria de sentimiento (`num_labels=2`) sobre GLUE SST-2. Sobre esta base, el pipeline NeuralOps aplica el compresor `ASTPruner`, descrito por el autor como "poda vectorizada semiestructurada 2:4 / N:M con calibración empírica de Jacobiano, rotación de coordenadas PCA y Soft Straight-Through Estimator (STE)".

El proceso de evaluación se realizó físicamente en una NVIDIA GeForce RTX 3090 (24 GB) sobre las 872 muestras de validación de SST-2. Se probaron cuatro rangos (`k=256, 128, 64, 32`) y, según la model card, cuando la compresión zero-shot degradaba la precisión más de 2,0 puntos con una reducción superior a 1,10x se aplicaba un "healing" LoRA con `r=8`, 50 pasos y `lr=2e-4` en un presupuesto de 45 segundos. En este checkpoint concreto no se activó dicho healing (`LoRA Recovery Applied: False`) y el rango seleccionado fue `k=32`. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset más allá de GLUE SST-2, ni si hubo RLHF/DPO (no aplicable a un clasificador).

## Capacidades

- Clasificación binaria de sentimiento (positivo/negativo) sobre texto en inglés, con dos etiquetas de salida (`num_labels=2`).
- Inferencia sobre entradas tokenizadas con el vocabulario estándar de `bert-base-uncased` (`vocab.txt`, `tokenizer.json`, `tokenizer_config.json`).
- Carga mediante `transformers` (`BertForSequenceClassification`) reconstruyendo primero la topología comprimida con `compress_model(..., {"method": "ast_pruner", "rank": 32})` y luego cargando el state dict con `strict=False`.
- Carga alternativa vía API de NeuralOps Hub: `load_surgeried_model("tahamajs/bert-comp-ast-pruner-sst2")`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo "thinking"; es un encoder de clasificación, no un modelo generativo.
- Capacidad multilingüe: no disponible (solo inglés).

## Casos de uso

- Reproducción de experimentos de compresión: sirve como artefacto de referencia para validar que el pipeline `ASTPruner` de NeuralOps reconstruye correctamente un checkpoint con `rank=32` y ratio `1.00x`, comparando el state dict resultante con el BERT-Base original.
- Estudio de casos degenerados de poda: permite analizar por qué una configuración de poda con ratio 1.00x y sin healing LoRA degrada la precisión de 91,63 % a 51,38 %, útil para depurar la lógica de selección de rango del compresor.
- Benchmarking de infraestructura de compresión: al ejecutarse en RTX 3090 sobre 872 muestras, sirve para medir latencia y throughput del pipeline de compresión y del "healing" LoRA con presupuesto de 45 segundos.
- Docencia y divulgación: ejemplo didáctico de cómo se estructura un checkpoint comprimido (config con `compression_method` y `compression_rank`, `compression_summary.json` con telemetría multi-rango) para quienes estudian técnicas de compresión de modelos.
- Pruebas de integración de la librería NeuralOps: valida la API `compress_model` y `load_surgeried_model` en un caso real con tokenizer estándar de BERT.
- No se recomienda su uso para clasificación de sentimiento en producción, atención al cliente, moderación de contenido ni análisis de opiniones, dado que su precisión (51,38 %) está al nivel del azar en una tarea binaria.

## Benchmarks y rendimiento

Datos declarados por el autor en la model-index (no verificados, `verified: false`):

| Benchmark | Métrica | Valor |
|---|---|---|
| GLUE SST-2 (validation, 872 muestras) | Accuracy | 51,38 % |
| GLUE SST-2 (teacher baseline BERT-Base) | Accuracy | 91,63 % |
| Parity delta vs teacher | Puntos porcentuales | -40,25 |

Evaluación multi-rango declarada por el autor (todos los rangos dan el mismo resultado):

| Rank (`k`) | Ratio físico | Params comprimidos | Zero-shot Acc | Healed Acc |
|:---:|:---:|---:|---:|---:|
| 256 | 1.00x | 109.483.778 | 51,38 % | 51,38 % |
| 128 | 1.00x | 109.483.778 | 51,38 % | 51,38 % |
| 64 | 1.00x | 109.483.778 | 51,38 % | 51,38 % |
| 32 (empaquetado) | 1.00x | 109.483.778 | 51,38 % | 51,38 % |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint pesa 370,9 MB en `pytorch_model.bin`; en FP32 ocupa aproximadamente 0,44 GB de pesos, por lo que la inferencia cabe holgadamente en cualquier GPU consumer con 4 GB o más.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; el autor reporta evaluaciones en NVIDIA GeForce RTX 3090 (24 GB). También es viable en CPU para inferencia por lotes pequeños.
- Cabe en GPU consumer: sí, en GTX 1650, RTX 3050, RTX 4060, RTX 4090 y equivalentes.
- Opciones de despliegue: `transformers` + `neuralops` (reconstrucción con `compress_model` y carga con `strict=False`), o la API `load_surgeried_model` del Hub de NeuralOps. No se han publicado variantes GGUF, ONNX ni integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles en la información proporcionada. El autor menciona un presupuesto de 45 segundos para el healing LoRA (50 pasos, `lr=2e-4`), pero no reporta métricas de inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | SST-2 (val) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Hooshaai/bert-comp-ast-pruner-sst2` | 109.483.778 | no disponible (BERT estándar: 512) | 51,38 % | MIT | Hugging Face |
| `google-bert/bert-base-uncased` (teacher) | 109.483.778 | 512 | 91,63 % (según el autor) | Apache 2.0 | Hugging Face |
| `textattack/bert-base-uncased-SST-2` | ~109,5 M | 512 | ~92-93 % (referencia habitual en la comunidad, no verificada aquí) | Apache 2.0 | Hugging Face |
| `distilbert-base-uncased-finetuned-sst-2-english` | ~66,9 M | 512 | ~91 % (referencia habitual, no verificada aquí) | Apache 2.0 | Hugging Face |

La comparativa se limita a modelos BERT de clasificación de sentimiento en SST-2. El checkpoint de Hooshaai no ofrece ninguna ventaja en tamaño (ratio 1.00x), contexto ni precisión frente al modelo base; su único valor diferencial es ser un artefacto del ecosistema NeuralOps con telemetría de compresión estructurada.

## Limitaciones y advertencias

- Precisión muy baja: 51,38 % en SST-2 binario, equivalente a clasificación aleatoria. No es apto para producción.
- El ratio de compresión declarado es 1.00x (0,0 % de parámetros eliminados), por lo que no aporta ningún ahorro de memoria ni de cómputo frente a BERT-Base.
- No se aplicó healing LoRA en este checkpoint (`LoRA Recovery Applied: False`), a diferencia de lo que el pipeline NeuralOps contempla para casos con degradación superior a 2,0 puntos y reducción superior a 1,10x.
- Resultados de benchmark no verificados (`verified: false` en la model-index); conviene reproducirlos antes de citarlos.
- Riesgo de alucinación no aplicable (modelo discriminativo), pero sí de clasificaciones erróneas sistemáticas por la degradación severa del clasificador.
- Solo inglés; sin soporte multilingüe.
- Licencia MIT, permite uso comercial, pero el estado degradado del modelo hace desaconsejable cualquier uso más allá de investigación y reproducción.
- Dependencia de la librería `neuralops` para reconstruir la topología comprimida antes de cargar el state dict; sin ese paso, `from_pretrained` directo puede fallar o dar resultados inconsistentes.
- El ID del repositorio en la model card (`tahamajs/bert-comp-ast-pruner-sst2`) no coincide con el ID de Hugging Face (`Hooshaai/bert-comp-ast-pruner-sst2`), lo que puede provocar errores al copiar los snippets de ejemplo.
- El resultado de búsqueda web proporcionado (ayuda de YouTube sobre livestreams) no guarda relación con el modelo y no aporta información adicional.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Hooshaai/bert-comp-ast-pruner-sst2
- Modelo base: https://huggingface.co/google-bert/bert-base-uncased
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Implementación de `ASTPruner`: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/compression/pruning/ast_pruner.py
- Licencia del proyecto NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset GLUE SST-2: https://huggingface.co/datasets/nyu-mll/glue
