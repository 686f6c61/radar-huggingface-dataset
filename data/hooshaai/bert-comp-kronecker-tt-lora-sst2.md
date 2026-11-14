# Hooshaai/bert-comp-kronecker-tt-lora-sst2

## Resumen

`Hooshaai/bert-comp-kronecker-tt-lora-sst2` es un checkpoint de BERT-Base (`google-bert/bert-base-uncased`, 109.483.778 parámetros) comprimido físicamente mediante la técnica `kronecker_tt_lora` de la librería NeuralOps y ajustado posteriormente con LoRA sobre la tarea GLUE SST-2 (clasificación de sentimiento binaria). El modelo parte de un profesor fine-tuneado con una precisión de validación del 91,63% y se reduce a 38.741.762 parámetros (una reducción del 64,61%, ratio de compresión físico de 2,826x) en el rango de compresión `k=256`.

La relevancia de esta ficha es fundamentalmente metodológica: se trata de un artefacto de investigación sobre compresión de modelos (descomposición tensorial Kronecker/TT combinada con recuperación LoRA), no de un modelo listo para producción. Tras la compresión en zero-shot la precisión cae al 50,11% (prácticamente azar en una tarea binaria) y el "healing" LoRA la recupera hasta el 62,73%, lo que supone una pérdida de 28,90 puntos respecto al profesor. El autor reporta además fallos de ejecución (`FAIL_CRASH`) en los rangos `k=128` y `k=64`.

El modelo está publicado bajo licencia MIT, solo soporta inglés, usa la librería `neuralops` (no `transformers` de forma nativa) y requiere reconstruir la topología comprimida antes de cargar los pesos serializados. Su valor está en servir como referencia reproducible del comportamiento de la compresión tensorial agresiva sobre BERT en una tarea concreta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder BERT-Base (12 capas, dimensión oculta D=768) con compresión tensorial Kronecker-TT-LoRA |
| Parámetros totales | 38.741.762 (checkpoint comprimido); modelo base original: 109.483.778 |
| Parámetros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (el modelo base BERT-Base soporta 512 tokens, pero no se declara explícitamente en la información proporcionada) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | `pytorch_model.bin` (state dict serializado de PyTorch, con factores de bajo rango y adaptadores LoRA integrados) |
| Librería | `neuralops` |
| Tarea | Clasificación de texto (sentimiento binario, SST-2) |
| Rango de compresión (`k`) | 256 (checkpoint publicado) |
| Ratio de compresión físico | 2,826x (-64,61% de parámetros) |
| Tamaño del repo | 0,1 GB (pesos: 74,1 MB) |

## Arquitectura y entrenamiento

El modelo parte de `google-bert/bert-base-uncased`, un transformer encoder estándar de 12 capas y 768 dimensiones de ocultación, fine-tuneado previamente sobre GLUE SST-2 hasta alcanzar un 91,63% de precisión en validación (el "profesor"). Sobre esa base se aplica el compresor `kronecker_tt_lora_factory` de NeuralOps, que descompone los tensores de peso mediante una factorización Kronecker combinada con Tensor Train (TT) y un rango de truncamiento `k=256`. El resultado es un checkpoint con 38.741.762 parámetros, es decir, un 35,39% del tamaño original.

El proceso de recuperación ("healing") consiste en un ajuste LoRA de rango `r=8`, 50 pasos y tasa de aprendizaje `2e-4` con un presupuesto de 45 segundos, aplicado únicamente cuando la compresión en zero-shot degrada la precisión más de 2,0 puntos con una reducción superior a 1,10x. En este checkpoint, el healing eleva la precisión del 50,11% (zero-shot) al 62,73%. No se detalla la composición exacta del dataset de entrenamiento más allá de GLUE SST-2, ni se menciona uso de RLHF o DPO (no aplicable en un clasificador). La evaluación se realizó físicamente sobre una NVIDIA GeForce RTX 3090 (24 GB) con el split de validación de SST-2 (872 muestras).

## Capacidades

- Clasificación de sentimiento binaria (positivo/negativo) sobre texto en inglés, específicamente en el dominio de SST-2.
- Generación de logits de dos clases mediante `BertForSequenceClassification` una vez reconstruida la topología comprimida.
- Integración con el ecosistema NeuralOps para cargar el modelo mediante `load_surgeried_model` desde el Hub.
- Compatibilidad con el tokenizador estándar `bert-base-uncased` (vocabulario incluido en el repo).
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento de agente.
- No dispone de modo "thinking", visión, audio ni otras modalidades.
- Capacidad multilingüe: únicamente inglés.

## Casos de uso

- Investigación en compresión de modelos: sirve como punto de referencia reproducible para medir el impacto de la factorización Kronecker-TT-LoRA sobre BERT en una tarea concreta; el `compression_summary.json` incluido permite comparar rangos (`k=256, 128, 64, 32`) y observar los fallos de ejecución reportados.
- Experimentos de ablación sobre "healing" LoRA: el checkpoint permite reproducir el pipeline de recuperación (r=8, 50 pasos, lr=2e-4) y medir la ganancia exacta (+12,62 puntos) frente al estado zero-shot.
- Docencia y divulgación sobre descomposición tensorial: útil para ilustrar con un caso real cómo una compresión del 64,61% degrada severamente la precisión en clasificación binaria (del 91,63% al 62,73%) y por qué el healing es necesario.
- Validación de la librería NeuralOps: permite probar la API `compress_model` y `load_surgeried_model` en un entorno controlado con una tarea pequeña (872 muestras de validación) y hardware asequible (RTX 3090).
- Despliegue en entornos con restricciones severas de memoria: con 74,1 MB de pesos, es viable en dispositivos de borde o contenedores ligeros, siempre que la precisión del 62,73% sea aceptable para el caso de uso (por ejemplo, filtrado preliminar de sentimiento con revisión humana posterior).
- Benchmark interno de pipelines de compresión: como baseline negativo o de control al comparar nuevas técnicas de compresión que aspiren a mantener la paridad con el profesor (91,63%) sin perder 28,90 puntos.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados, `verified: false`):

| Tarea | Dataset | Split | Métrica | Valor |
|---|---|---|---|---|
| Clasificación de sentimiento | GLUE SST-2 | validation | Accuracy | 62,73% |

Evaluación multi-rango reportada por el autor (RTX 3090, 872 muestras de validación):

| Rango (`k`) | Ratio físico | Parámetros comprimidos (reducción) | Accuracy zero-shot | Accuracy con healing | Paridad vs profesor (91,63%) |
|:---:|:---:|---:|---:|---:|---:|
| **256** | 2,83x | 38.741.762 (-64,6%) | 50,11% | **62,73%** (LoRA) | -28,90% |
| 128 | — | — | FAIL_CRASH | — | — |
| 64 | — | — | FAIL_CRASH | — | — |
| 32 | 2,83x | 38.741.762 (-64,6%) | 50,11% | **50,92%** (LoRA) | -40,71% |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; los pesos ocupan 74,1 MB en `pytorch_model.bin`, por lo que la inferencia cabe holgadamente en cualquier GPU con más de 1 GB de VRAM (estimación a partir del tamaño del checkpoint, no declarada por el autor).
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; el autor evaluó sobre NVIDIA GeForce RTX 3090 (24 GB), pero el modelo no requiere esa capacidad.
- Cabe en GPU consumer: sí, en cualquier GPU con al menos ~1-2 GB de VRAM (GTX 1050, RTX 2060, RTX 3060, RTX 4090, etc.).
- Opciones de despliegue: la carga estándar requiere `neuralops` para reconstruir la topología comprimida antes de cargar el state dict; no se documenta soporte nativo para vLLM, llama.cpp, Ollama ni TGI. Es posible exportar a otros formatos tras la reconstrucción, pero no está soportado oficialmente.
- Latencia y throughput: no disponibles en la información proporcionada. El autor menciona un presupuesto de 45 segundos para el healing LoRA, pero no reporta latencia de inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | SST-2 (val) | Licencia | Disponibilidad |
|---|---|---:|---:|---|---|
| `Hooshaai/bert-comp-kronecker-tt-lora-sst2` (k=256) | 38,7 M (comprimido) | no disponible | 62,73% | MIT | Hugging Face |
| `google-bert/bert-base-uncased` (profesor fine-tuneado SST-2) | 109,5 M | 512 tokens | 91,63% | Apache 2.0 (modelo base) | Hugging Face |
| BERT-Base sin fine-tune | 109,5 M | 512 tokens | ~no disponible (sin fine-tune específico) | Apache 2.0 | Hugging Face |
| DistilBERT fine-tuneado SST-2 | ~66 M | 512 tokens | no disponible en esta búsqueda | Apache 2.0 | Hugging Face |

La comparación directa con alternativas de la misma categoría (modelos comprimidos de BERT para SST-2) no está disponible en la información proporcionada. El propio autor reporta una pérdida de 28,90 puntos frente al profesor, lo que sitúa a este checkpoint por debajo de un BERT-Base estándar fine-tuneado en la misma tarea.

## Limitaciones y advertencias

- Degradación severa de precisión: 62,73% frente al 91,63% del profesor, una pérdida de 28,90 puntos. En una tarea binaria, esto está muy por encima de un clasificador útil en producción.
- Fallos de ejecución documentados: los rangos `k=128` y `k=64` producen `FAIL_CRASH`, lo que indica inestabilidad del pipeline de compresión en configuraciones intermedias.
- Resultados no verificados: la métrica de accuracy está marcada como `verified: false` en el model-index.
- Dependencia de la librería `neuralops`: no se puede cargar con `transformers` de forma directa; requiere reconstruir la topología con `compress_model` antes de cargar el state dict, lo que complica la integración en pipelines estándar.
- Solo inglés: el modelo no soporta otros idiomas.
- Dominio restringido: entrenado exclusivamente sobre SST-2 (reseñas de cine); su comportamiento fuera de ese dominio no está caracterizado.
- Riesgo de alucinación: no aplica en sentido estricto (es un clasificador), pero sí riesgo de clasificaciones erróneas sistemáticas por la degradación de precisión.
- Sesgos: no se documentan análisis de sesgo en la información proporcionada; al derivar de `bert-base-uncased` y SST-2, hereda los sesgos del corpus original.
- Licencia MIT: permite uso comercial, pero la calidad del checkpoint hace desaconsejable su uso en producción sin validación adicional.
- El repositorio referenciado en la model card (`tahamajs/bert-comp-kronecker-tt-lora-sst2`) no coincide con el ID del modelo (`Hooshaai/bert-comp-kronecker-tt-lora-sst2`), lo que puede causar errores al ejecutar los ejemplos de código tal cual.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Hooshaai/bert-comp-kronecker-tt-lora-sst2
- Modelo base: https://huggingface.co/google-bert/bert-base-uncased
- Librería NeuralOps (repositorio): https://github.com/tahamajs/NeuralOps
- Implementación del compresor `kronecker_tt_lora`: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/compression/tensor_decomp/kronecker_tt_lora.py
- Licencia NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset GLUE SST-2: https://huggingface.co/datasets/nyu-mll/glue

Nota: los resultados de la búsqueda web proporcionada no contienen enlaces relevantes al modelo (corresponden a documentación de Google Drive), por lo que no se incluyen.
