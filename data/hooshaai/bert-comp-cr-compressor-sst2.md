# Hooshaai/bert-comp-cr-compressor-sst2

## Resumen

`bert-comp-cr-compressor-sst2` es un checkpoint de BERT-Base (`google-bert/bert-base-uncased`) comprimido físicamente mediante la técnica `CRCompressor` (descomposición column-row / interpolative) implementada en la librería NeuralOps, y posteriormente "curado" con LoRA de rango 8 para intentar recuperar precisión tras la compresión. Lo publica el usuario Hooshaai (el código de referencia apunta al repositorio `tahamajs/NeuralOps`) como parte de un zoo de modelos comprimidos orientado a investigación sobre compresión de modelos.

El modelo resuelve una tarea muy concreta: clasificación de sentimiento binaria sobre GLUE SST-2 en inglés. Su interés no está en el rendimiento final —que es muy bajo— sino en servir como artefacto reproducible para estudiar el impacto de la compresión de bajo rango sobre un transformer encoder de 109,5 M de parámetros. El checkpoint empaquetado corresponde al rango `k=32`, con una reducción de parámetros del 72,73 % (de 109.483.778 a 29.857.538) y un ratio de compresión físico de 3,667x.

La relevancia actual es metodológica: documenta una evaluación Pareto multi-rango (k=256, 128, 64, 32) sobre 872 muestras de validación de SST-2 en una RTX 3090, con resultados que evidencian que el pipeline de "LoRA healing" no recupera la precisión del profesor (91,63 % de accuracy) en ninguno de los rangos evaluados. Es, por tanto, un caso de estudio sobre los límites de la compresión agresiva más que un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT-Base), 12 capas, dimensión oculta D=768, comprimido con `CRCompressor` (low-rank / interpolative decomposition) |
| Parametros totales | 29.857.538 (checkpoint comprimido, k=32); modelo base original: 109.483.778 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (el modelo base BERT-Base admite 512 tokens, pero la model card no lo declara explícitamente) |
| Tipos de cuantizacion | no disponible (el checkpoint se distribuye en `pytorch_model.bin`, sin variantes GGUF/AWQ/GPTQ publicadas) |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | `pytorch_model.bin` (state dict serializado de PyTorch); assets de tokenizer en formato BERT estándar (`vocab.txt`, `tokenizer.json`, `tokenizer_config.json`) |

## Arquitectura y entrenamiento

La arquitectura de partida es BERT-Base uncased: un transformer encoder de 12 capas con D=768 y 109.483.778 parámetros, afinado previamente sobre GLUE SST-2 (el profesor alcanza 91,63 % de accuracy según la model card). Sobre ese modelo se aplica `CRCompressor`, un compresor de la familia `low_rank` que descompone las capas lineales en bases de columnas "skeleton" y proyecciones interpolativas (interpolative decomposition), reduciendo el número de parámetros efectivos de forma física, no solo mediante pruning enmascarado.

El pipeline de NeuralOps evalúa cuatro rangos (k=256, 128, 64 y 32). Cuando la compresión zero-shot degrada la accuracy más de 2,0 puntos con una reducción superior a 1,10x, se activa un "LoRA healing" con adaptadores de rango r=8, 50 pasos, learning rate 2e-4 y un presupuesto de 45 segundos. En el checkpoint publicado (k=32) el healing está aplicado (`LoRA Recovery Applied: True`). La evaluación se realizó sobre las 872 muestras de validación de SST-2 en una NVIDIA GeForce RTX 3090 de 24 GB. No se detalla en la información disponible la composición del dataset de entrenamiento más allá de GLUE SST-2, ni si hubo RLHF/DPO (no aplicable en un clasificador).

## Capacidades

- Clasificación de sentimiento binaria (positivo/negativo) en inglés sobre textos de SST-2.
- Inferencia sobre un transformer encoder comprimido, con un state dict reconstruible mediante `neuralops.core.compression_pipeline.compress_model` y `load_state_dict(strict=False)`.
- Carga directa desde el Hub mediante la API `neuralops.hub.load_surgeried_model`.
- Tokenización estándar BERT uncased (vocabulario original preservado en el repo).
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No soporta visión, audio ni modo "thinking".
- Capacidades multilingües: limitadas al inglés.
- No es un modelo generativo: no produce texto libre, solo logits de clasificación.

## Casos de uso

- Investigación en compresión de modelos: reproducir el pipeline `CRCompressor` + LoRA healing sobre BERT-Base y comparar la curva Pareto k=256/128/64/32 con los resultados publicados en la model card.
- Benchmark de metodologías de compresión: usar el checkpoint como referencia negativa (accuracy de 50,92 % frente al 91,63 % del profesor) para calibrar qué técnicas sí preservan precisión en clasificación de sentimiento.
- Docencia y divulgación: ejemplo tangible de que una reducción del 72,7 % de parámetros con healing de 50 pasos no recupera el rendimiento en una tarea de clasificación, útil para explicar límites del low-rank.
- Pruebas de integración de la librería NeuralOps: validar la API `load_surgeried_model` y la reconstrucción de topología comprimida en pipelines propios.
- Experimentos de destilación o re-entrenamiento posterior: partir del checkpoint comprimido como inicialización para un fine-tuning completo sobre SST-2 u otras tareas GLUE.
- Evaluación de infraestructura de inferencia ligera: medir latencia y footprint de un BERT comprimido de ~57 MB de pesos en entornos con restricciones de memoria, aceptando la pérdida de precisión.
- Análisis de calibración y sesgos en clasificadores degradados: estudiar cómo se distribuyen las predicciones de un modelo cercano al azar (50,92 % en un problema binario) frente a uno bien entrenado.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente, `verified: false`). Evaluación sobre GLUE SST-2, split de validación (872 muestras), en RTX 3090.

| Rank (k) | Ratio físico | Params comprimidos (reducción) | Accuracy zero-shot | Accuracy con healing | Paridad vs profesor (91,63 %) |
|:---:|:---:|---:|---:|---:|---:|
| 256 | 1,63x | 67.016.450 (-38,8 %) | 60,78 % | 50,92 % (LoRA) | -40,71 % |
| 128 | 2,39x | 45.782.786 (-58,2 %) | 50,92 % | 49,08 % (LoRA) | -42,55 % |
| 64 | 3,11x | 35.165.954 (-67,9 %) | 50,92 % | 49,08 % (LoRA) | -42,55 % |
| 32 (publicado) | 3,67x | 29.857.538 (-72,7 %) | 50,92 % | 50,92 % (LoRA) | -40,71 % |

| Referencia | Accuracy SST-2 (validación) |
|---|---:|
| Profesor (`bert-base-uncased` fine-tuned) | 91,63 % |
| Checkpoint publicado (k=32, con healing) | 50,92 % |

Observación: en un problema binario balanceado, 50,92 % equivale prácticamente a azar. El healing empeora el resultado en k=256 y k=128 respecto al zero-shot, lo que sugiere que el pipeline de recuperación no está funcionando como se esperaba en esta configuración.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 para el checkpoint comprimido (29,86 M de parámetros ≈ 120 MB de pesos, repo de 0,1 GB); el modelo profesor requiere ~440 MB en FP32.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; la evaluación oficial se hizo en una NVIDIA GeForce RTX 3090 (24 GB), pero es sobredimensionada para este tamaño.
- Cabe holgadamente en GPU de consumo: RTX 3060, RTX 4060, GTX 1660, e incluso en CPU para inferencia por lotes pequeños.
- Opciones de despliegue: PyTorch + Transformers con reconstrucción vía NeuralOps (flujo documentado); no se publican artefactos para vLLM, llama.cpp, Ollama ni TGI, y al ser un clasificador BERT no son las rutas habituales. ONNX Runtime sería viable tras exportación manual, no documentada.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | SST-2 (val) | Licencia | Disponibilidad |
|---|---|---:|---:|---|---|
| `Hooshaai/bert-comp-cr-compressor-sst2` (k=32) | 29,86 M (comprimido) | no disponible | 50,92 % | MIT | Hugging Face |
| `google-bert/bert-base-uncased` (profesor fine-tuned SST-2) | 109,48 M | 512 tokens (arquitectura) | 91,63 % (según model card) | Apache 2.0 (modelo base) | Hugging Face |
| `distilbert-base-uncased-finetuned-sst-2-english` | 66,96 M | 512 tokens (arquitectura) | ~91 % (referencia habitual de la comunidad, no verificada aquí) | Apache 2.0 | Hugging Face |
| `textattack/bert-base-uncased-SST-2` | 109,48 M | 512 tokens (arquitectura) | ~92 % (referencia habitual, no verificada aquí) | Apache 2.0 | Hugging Face |

La comparativa deja claro el trade-off: el checkpoint comprimido ofrece un ratio de compresión de 3,67x frente al profesor, pero a costa de perder más de 40 puntos de accuracy, muy por debajo de alternativas destiladas como DistilBERT que mantienen precisión cercana al profesor con una reducción de tamaño moderada.

## Limitaciones y advertencias

- Rendimiento próximo al azar: 50,92 % de accuracy en un problema binario indica que el modelo no es fiable para clasificación de sentimiento real.
- El "LoRA healing" no recupera la precisión y en dos rangos (k=256, k=128) la empeora respecto al zero-shot.
- Sesgos: no documentados en la model card; al derivar de BERT-Base uncased, hereda los sesgos del corpus original (Wikipedia/BooksCorpus), pero no se han medido.
- Riesgo de alucinación: no aplica en sentido generativo, pero sí hay riesgo de predicciones erróneas sistemáticas y mal calibradas.
- Limitaciones de idioma: solo inglés; el tokenizer es uncased y el vocabulario original de BERT-Base.
- Limitaciones de contexto: la model card no declara longitud máxima; el modelo base admite 512 tokens, pero no se garantiza que la compresión preserve el comportamiento en secuencias largas.
- Restricciones de licencia: MIT, permite uso comercial, pero el modelo base `google-bert/bert-base-uncased` está bajo Apache 2.0, cuyas condiciones deben respetarse igualmente.
- Caveat de producción: no usar este checkpoint en sistemas reales de clasificación; su valor es exclusivamente de investigación y reproducibilidad.
- Inconsistencia de identificadores: el código de ejemplo de la model card apunta a `tahamajs/bert-comp-cr-compressor-sst2`, mientras que el repo real es `Hooshaai/bert-comp-cr-compressor-sst2`; habrá que ajustar el `repo_id`.
- Requiere la librería NeuralOps y reconstruir la topología comprimida antes de cargar el state dict (`strict=False`), lo que añade fragilidad al despliegue.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Hooshaai/bert-comp-cr-compressor-sst2
- Modelo base: https://huggingface.co/google-bert/bert-base-uncased
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Implementación de `CRCompressor`: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/compression/low_rank/cr_compressor.py
- Licencia del proyecto NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset GLUE SST-2: https://huggingface.co/datasets/nyu-mll/glue
