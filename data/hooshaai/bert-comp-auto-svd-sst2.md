# Hooshaai/bert-comp-auto-svd-sst2

## Resumen

`bert-comp-auto-svd-sst2` es un checkpoint de `google-bert/bert-base-uncased` comprimido físicamente mediante la técnica `auto_svd` (AutoSVDCompressor) de la librería NeuralOps, tras un ajuste fino sobre GLUE SST-2. El modelo lo publica el usuario Hooshaai en Hugging Face y forma parte del "NeuralOps Compressed & LoRA-Healed Model Zoo", un conjunto de artefactos destinados a demostrar técnicas de compresión de modelos con recuperación mediante LoRA.

El modelo parte de los 109.483.778 parámetros de BERT-base (12 capas, dimensión oculta 768) y los reduce a 69.414.338 parámetros tras la compresión SVD de rango k=32, lo que supone una reducción del 36,60 % y un ratio de compresión físico de 1,577x. Sobre esa topología comprimida se aplica un "healing" con LoRA (r=8, 50 pasos, lr=2e-4) para recuperar parte de la precisión perdida por la compresión.

La relevancia del modelo es fundamentalmente metodológica: sirve como referencia reproducible de un pipeline de compresión con asignación de rango basada en sensibilidad Fisher/Gram y evaluación Pareto multi-rango. No obstante, la precisión final (73,28 % en SST-2) queda muy por debajo del profesor original (91,63 %), por lo que no está pensado para uso en producción como clasificador de sentimiento, sino como artefacto de investigación sobre compresión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT-base, 12 capas, D=768) con compresión SVD de bajo rango |
| Parametros totales | 69.414.338 (comprimido); original 109.483.778 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de bert-base-uncased, típicamente 512 tokens; no confirmado en la información) |
| Tipos de cuantizacion | no disponible (el checkpoint se distribuye en `pytorch_model.bin`, sin variantes GGUF/cuantizadas) |
| Idiomas soportados | en |
| Licencia | MIT |
| Formato de pesos | PyTorch (`pytorch_model.bin`) |
| Libreria | neuralops |
| Modelo base | google-bert/bert-base-uncased |
| Dataset de ajuste | nyu-mll/glue (config sst2) |
| Rank de compresion | k=32 |
| Ratio de compresion | 1,577x (36,60 % de reduccion) |
| Tamano del repo | 0,1 GB |

## Arquitectura y entrenamiento

La arquitectura de partida es BERT-base uncased: un transformer encoder de 12 capas con dimensión oculta 768 y 109.483.778 parámetros, preentrenado por Google y ajustado posteriormente sobre GLUE SST-2 para clasificación binaria de sentimiento (num_labels=2). Sobre ese modelo ajustado se aplica el compresor `AutoSVDCompressor` de NeuralOps, que realiza una descomposición en valores singulares de bajo rango sobre las matrices de pesos y asigna rangos de forma no uniforme mediante un perfilador de sensibilidad basado en información de Fisher y Gram, con asignación multi-objetivo tipo Pareto. El checkpoint serializado corresponde al rango k=32.

El proceso de recuperación ("LoRA healing") se activa cuando la compresión zero-shot degrada la precisión más de 2,0 puntos con una reducción superior a 1,10x. En este caso se aplicó LoRA con r=8 durante 50 pasos con learning rate 2e-4 y un presupuesto de 45 segundos. La evaluación se realizó físicamente sobre una NVIDIA GeForce RTX 3090 (24 GB) usando el split de validación de GLUE SST-2 (872 muestras). No se dispone de información sobre el número de tokens de entrenamiento del ajuste fino original ni sobre la composición del dataset más allá de SST-2.

## Capacidades

- Clasificación binaria de sentimiento en inglés (0 = negativo, 1 = positivo) sobre textos de una sola frase.
- Inferencia estándar de `BertForSequenceClassification` una vez reconstruida la topología comprimida con `compress_model` y cargado el state dict con `strict=False`.
- Carga directa desde el Hub mediante el helper `load_surgeried_model` de `neuralops.hub`.
- Integración con el ecosistema NeuralOps (registro de compresores, telemetría de compresión en `compression_summary.json`).
- Tokenizador estándar de `bert-base-uncased` incluido en el repositorio (`vocab.txt`, `tokenizer.json`, `tokenizer_config.json`).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking: es un clasificador BERT-base comprimido.
- Capacidad multilingüe limitada al inglés (etiqueta `en`).

## Casos de uso

- Investigación sobre compresión de modelos: sirve como caso reproducible de aplicación de SVD de bajo rango con asignación Pareto de rangos sobre un transformer encoder, permitiendo comparar el impacto de k=32 frente a k=64, 128 o 256.
- Benchmarking de pipelines de "healing" con LoRA: el repositorio documenta el protocolo exacto (r=8, 50 pasos, lr=2e-4, 45 s) y permite reproducir la recuperación de precisión tras compresión agresiva.
- Docencia y divulgación técnica: ejemplo tangible de que una reducción del 36,6 % de parámetros puede degradar la precisión de un clasificador SST-2 en 18,35 puntos si no se aplica recuperación adecuada, útil para ilustrar el trade-off compresión/precisión.
- Validación de infraestructura NeuralOps: el modelo permite probar `compress_model`, `load_surgeried_model` y el registro `COMPRESSOR_REGISTRY` en entornos de CI o tests de integración.
- Clasificación de sentimiento de baja exigencia en entornos con restricciones de memoria: con 69 M de parámetros y un checkpoint de ~132,6 MB, puede desplegarse en dispositivos con poca VRAM para tareas donde un 73 % de accuracy sea aceptable (por ejemplo, filtrado preliminar de reseñas).
- Estudio de sensibilidad Fisher/Gram: el perfilado incluido en `compression_summary.json` permite analizar qué capas admiten mayor reducción de rango sin pérdida severa, como base para comprimir otros encoders BERT.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados, `verified: false`), sobre GLUE SST-2 validation (872 muestras), evaluados en RTX 3090:

| Rank (k) | Ratio fisico | Parametros (reduccion) | Acc zero-shot | Acc con LoRA | Delta vs profesor (91,63 %) |
|:---:|:---:|---:|---:|---:|---:|
| 256 | 1,58x | 69.414.338 (-36,6 %) | 61,70 % | 73,28 % | -18,35 % |
| 128 | 1,58x | 69.414.338 (-36,6 %) | 61,70 % | 73,28 % | -18,35 % |
| 64 | 1,58x | 69.414.338 (-36,6 %) | 61,70 % | 73,28 % | -18,35 % |
| 32 (checkpoint publicado) | 1,58x | 69.414.338 (-36,6 %) | 61,70 % | 73,28 % | -18,35 % |

Observacion: los cuatro rangos reportan idénticos parámetros, ratio y precisión, lo que sugiere que la tabla Pareto no diferencia realmente entre k=256, 128, 64 y 32 en los artefactos publicados, o que el autor reutilizó las mismas cifras. El checkpoint serializado corresponde a k=32.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint pesa ~132,6 MB en `pytorch_model.bin` (fp32), por lo que cabe holgadamente en cualquier GPU consumer con al menos 1-2 GB de VRAM libre.
- GPU recomendadas: cualquier GPU moderna es suficiente; el autor evaluó en NVIDIA GeForce RTX 3090 (24 GB), pero el modelo es sobradamente pequeño para GPUs de gama baja (GTX 1650, RTX 3050, etc.).
- Cabe en GPU consumer: sí, en prácticamente todas las GPU consumer de los últimos años, e incluso en CPU para inferencia por lotes pequeños.
- Opciones de despliegue: no hay variantes GGUF ni Ollama publicadas; el despliegue requiere reconstruir la topología con `neuralops` + `transformers` y cargar el state dict. No se documenta soporte para vLLM, TGI o llama.cpp.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | SST-2 (val) | Licencia | Disponibilidad |
|---|---|---:|---:|---|---|
| bert-comp-auto-svd-sst2 (este) | 69,4 M (comprimido) | no disponible | 73,28 % | MIT | Hugging Face (42 descargas) |
| google-bert/bert-base-uncased (profesor, ajustado SST-2) | 109,5 M | 512 (típico) | 91,63 % | Apache 2.0 | Hugging Face |
| DistilBERT-base-uncased (referencia) | ~66 M | 512 (típico) | no disponible en esta ficha | Apache 2.0 | Hugging Face |

La comparación directa con DistilBERT es pertinente por tamaño (ambos ~66-69 M), pero no se dispone de su resultado SST-2 en la información proporcionada. El profesor BERT-base ajustado a SST-2 supera al modelo comprimido en 18,35 puntos de accuracy, a cambio de un 36,6 % más de parámetros.

## Limitaciones y advertencias

- Pérdida de precisión severa: 73,28 % frente a 91,63 % del profesor en SST-2 (-18,35 puntos). No recomendable como clasificador de sentimiento en producción sin validación adicional.
- Inconsistencia en la tabla Pareto: los cuatro rangos evaluados (256, 128, 64, 32) reportan idénticos parámetros y precisión, lo que resta valor a la comparativa multi-rango y sugiere un posible error de publicación.
- Métricas no verificadas: la accuracy está marcada como `verified: false` en el model-index.
- Requiere la librería `neuralops` para reconstruir la topología comprimida; no es un checkpoint cargable directamente con `transformers` sin ese paso previo.
- Solo inglés: no soporta otros idiomas.
- Sin variantes cuantizadas (GGUF, AWQ, GPTQ) ni formato safetensors; el único artefacto es `pytorch_model.bin`.
- Riesgo de alucinación: no aplica en sentido generativo (es un clasificador), pero sí puede producir clasificaciones erróneas en dominios distintos de SST-2 (reseñas de películas).
- Licencia MIT: permite uso comercial, pero el modelo base `bert-base-uncased` es Apache 2.0 y conviene revisar la compatibilidad de ambas licencias en despliegues comerciales.
- Repositorio con muy baja adopción (42 descargas, 0 likes) y creado/actualizado en noviembre de 2026; sin mantenimiento documentado.
- El README referencia el repo `tahamajs/bert-comp-auto-svd-sst2` mientras que el ID real es `Hooshaai/bert-comp-auto-svd-sst2`, lo que puede provocar errores en los ejemplos de código.

## Enlaces

- Hugging Face: https://huggingface.co/Hooshaai/bert-comp-auto-svd-sst2
- Modelo base: https://huggingface.co/google-bert/bert-base-uncased
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Licencia NeuralOps (MIT): https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Implementacion AutoSVDCompressor: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/compression/svd/auto_svd.py
- Dataset GLUE (nyu-mll): https://huggingface.co/datasets/nyu-mll/glue
