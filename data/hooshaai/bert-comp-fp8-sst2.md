# Hooshaai/bert-comp-fp8-sst2

## Resumen

`Hooshaai/bert-comp-fp8-sst2` es un checkpoint de clasificación de sentimiento derivado de `google-bert/bert-base-uncased` y ajustado sobre GLUE SST-2, publicado por el autor Hooshaai dentro del ecosistema NeuralOps (Compressor Zoo). El modelo aplica el compresor `FP8Compressor` de la librería NeuralOps, que cuantiza pesos a FP8 (formatos `e4m3` o `e5m2`, con escalado `per_tensor` o `per_channel`) usando `torch.float8_e4m3fn` nativo en GPUs con SM >= 8.9 y emulación en CPU o GPUs anteriores. El checkpoint empaquetado corresponde al rank de showcase `k=32`, con reconstrucción de topología vía `compress_model`.

La particularidad de esta ficha es que, pese a la etiqueta de compresión, el modelo declara una ratio de compresión física de `1.00x` y una reducción de parámetros del `0.0%` (`109.483.778` parámetros, idénticos al BERT-base original, 12 capas, `D=768`). Es decir, el artefacto demuestra el pipeline de cuantización FP8 y su integración con el hub de NeuralOps más que una reducción efectiva de tamaño. El rendimiento declarado en validación de SST-2 es del `91,86%` de accuracy, frente al `91,63%` del profesor, una paridad de `+0,23%`.

Es relevante para desarrolladores que quieran evaluar flujos de cuantización FP8 post-entrenamiento sobre transformers pequeños, o que necesiten un clasificador binario de sentimiento en inglés con licencia MIT y pesos de ~209 MB, sin dependencia de APIs propietarias.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder BERT-base (12 capas, dimensión oculta 768), cabeza de clasificación de secuencia con 2 etiquetas |
| Parametros totales | 109.483.778 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo base BERT-base-uncased admite 512 tokens; la model card no lo declara explícitamente) |
| Tipos de cuantizacion | FP8 (`e4m3` / `e5m2`), escalado `per_tensor` o `per_channel`; emulación en CPU y GPUs pre-SM 8.9 |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | `pytorch_model.bin` (state dict serializado), `config.json`, `compression_summary.json`, assets de tokenizer BERT-base-uncased |

## Arquitectura y entrenamiento

El modelo parte de `google-bert/bert-base-uncased`, un transformer encoder de 12 capas y `D=768` con 109.483.778 parámetros, afinado previamente sobre GLUE SST-2 como tarea de clasificación binaria de sentimiento. Sobre ese checkpoint se aplica el `FP8Compressor` de NeuralOps, que cuantiza los pesos a FP8 con soporte de dos formatos (`e4m3` y `e5m2`) y dos estrategias de escala (`per_tensor`, `per_channel`). En hardware con SM >= 8.9 (por ejemplo RTX 4070) se usa `torch.float8_e4m3fn` nativo; en CPU o GPUs anteriores se emula.

El pipeline de NeuralOps contempla una fase de "LoRA healing" (`r=8`, 50 pasos, `lr=2e-4`, presupuesto de 45 s) que se activa cuando la compresión zero-shot degrada la accuracy más de un 2,0% con una reducción superior a 1,10x. En este checkpoint concreto, la model card indica `LoRA Recovery Applied: False`, y la evaluación multi-rank (`k=256, 128, 64, 32`) sobre las 872 muestras de validación de SST-2 en una RTX 3090 arroja idénticos resultados en los cuatro ranks: `91,86%` zero-shot y `91,86%` tras healing, con ratio física `1.00x` y `-0.0%` de reducción de parámetros. No se documentan volúmenes de tokens de preentrenamiento ni composición del dataset más allá de GLUE SST-2.

## Capacidades

- Clasificación binaria de sentimiento (positivo/negativo) en inglés sobre textos cortos, con logits de 2 clases.
- Inferencia con pesos cuantizados a FP8 y ejecución nativa en GPUs SM >= 8.9 o emulada en CPU/GPUs previas.
- Reconstrucción del grafo comprimido mediante `compress_model` de NeuralOps y carga del state dict serializado con `strict=False`.
- Carga en una línea mediante la API universal `load_surgeried_model` del hub de NeuralOps.
- Integración con el ecosistema `transformers` (`AutoTokenizer`, `BertForSequenceClassification`) y con `huggingface_hub`.
- No se documentan capacidades de generación de texto, tool calling, razonamiento multi-paso, visión, audio ni modo thinking.

## Casos de uso

- Clasificación de sentimiento en reseñas de producto en inglés: el modelo recibe una frase corta y devuelve una etiqueta binaria; su tamaño (~209 MB) permite desplegarlo en un contenedor ligero junto a un tokenizer estándar de BERT.
- Moderación de comentarios en foros y redes: filtrado rápido de tono negativo en pipelines de preprocesado antes de un modelo mayor, aprovechando la inferencia FP8 en GPUs consumer con SM >= 8.9.
- Enrutamiento de tickets de soporte: clasificación positiva/negativa de la primera frase del ticket para priorizar colas, usando la API `load_surgeried_model` en un servicio Python.
- Evaluación de pipelines de cuantización: sirve como caso de referencia para medir el impacto de FP8 sobre BERT-base en una tarea GLUE concreta, comparando contra el profesor `91,63%`.
- Docencia e investigación en compresión de modelos: permite reproducir el flujo `compress_model` + carga de state dict en una RTX 3090 o equivalente y analizar el comportamiento de `per_tensor` frente a `per_channel`.
- Prototipado de clasificadores de texto en local: al no requerir API externa y tener licencia MIT, se puede integrar en notebooks y scripts de análisis de opiniones sin coste de licencia.
- Baseline en experimentos de LoRA healing: el `compression_summary.json` con los cuatro ranks permite contrastar estrategias de recuperación de precisión en modelos pequeños.

## Benchmarks y rendimiento

Datos declarados por el autor en el model-index (`verified: false`):

| Benchmark | Métrica | Valor |
|---|---|---|
| GLUE SST-2 (validation, 872 muestras) | Accuracy | 91,86% |

Comparativa interna declarada en la model card (evaluación física en RTX 3090):

| Configuración | Ratio físico | Parámetros comprimidos (reducción) | Zero-shot Acc | Healed Acc | Paridad vs profesor (91,63%) |
|---|---:|---:|---:|---:|---:|
| k=256 | 1.00x | 109.483.778 (-0,0%) | 91,86% | 91,86% | +0,23% |
| k=128 | 1.00x | 109.483.778 (-0,0%) | 91,86% | 91,86% | +0,23% |
| k=64 | 1.00x | 109.483.778 (-0,0%) | 91,86% | 91,86% | +0,23% |
| k=32 (checkpoint publicado) | 1.00x | 109.483.778 (-0,0%) | 91,86% | 91,86% | +0,23% |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada: el repo ocupa 0,2 GB; los pesos FP8 en disco rondan los 209 MB, por lo que la inferencia cabe holgadamente en GPUs con 4-6 GB de VRAM.
- GPUs recomendadas: RTX 4070 o superiores (SM >= 8.9) para aprovechar `torch.float8_e4m3fn` nativo; RTX 3090 (24 GB) fue la plataforma de evaluación declarada; A100/H100 también soportan ejecución nativa.
- Cabe en GPU consumer: sí, en cualquier GPU con al menos ~2-4 GB libres; en GPUs pre-SM 8.9 (p. ej. RTX 3090, GTX 16xx) se ejecuta con emulación FP8 y mayor coste computacional.
- Opciones de despliegue: `transformers` + `neuralops.compression_pipeline.compress_model` y `neuralops.hub.load_surgeried_model`; el formato `pytorch_model.bin` no es GGUF, por lo que no es directamente compatible con llama.cpp u Ollama sin conversión.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | SST-2 (val) | Licencia | Disponibilidad |
|---|---:|---|---:|---|---|
| Hooshaai/bert-comp-fp8-sst2 | 109.483.778 (FP8) | no disponible (base 512) | 91,86% (declarado, no verificado) | MIT | Hugging Face, librería `neuralops` |
| google-bert/bert-base-uncased (profesor) | 109.483.778 (FP32) | 512 | 91,63% (baseline declarado en la model card) | Apache 2.0 | Hugging Face, `transformers` |
| DistilBERT-base-uncased-finetuned-sst-2 | no disponible | 512 | no disponible | Apache 2.0 | Hugging Face, `transformers` |

La comparativa con DistilBERT se incluye por categoría (clasificador SST-2 de tamaño reducido), pero no se dispone de sus métricas exactas en la información proporcionada.

## Limitaciones y advertencias

- El checkpoint declara una ratio de compresión de `1.00x` y `-0.0%` de reducción de parámetros: no reduce el tamaño respecto al BERT-base original, por lo que el beneficio es demostrativo del pipeline FP8, no de ahorro de memoria o almacenamiento.
- La accuracy de 91,86% está marcada como `verified: false` en el model-index: no ha sido validada de forma independiente.
- Modelo exclusivamente en inglés; no se declara soporte multilingüe ni evaluación en otros idiomas.
- Tarea limitada a clasificación binaria de sentimiento; no genera texto ni soporta tool calling, agentes o razonamiento multi-paso.
- Riesgo de alucinación no aplicable en sentido generativo, pero sí de clasificaciones erróneas en dominios alejados de SST-2 (reseñas de películas); no se documenta calibración fuera de dominio.
- La ejecución FP8 en GPUs pre-SM 8.9 es emulada, con posible degradación de latencia; no se documenta su impacto en accuracy fuera de la RTX 3090.
- La licencia del modelo es MIT, pero el repositorio apunta a `https://github.com/tahamajs/NeuralOps/blob/main/LICENSE`; conviene revisar las condiciones de la librería NeuralOps para uso en producción.
- El `repo_id` del snippet de la model card (`tahamajs/bert-comp-fp8-sst2`) no coincide con el ID del repositorio publicado (`Hooshaai/bert-comp-fp8-sst2`): verificar antes de descargar.
- El resultado de búsqueda web proporcionado (impots.gouv.fr) no guarda relación con el modelo y no aporta información adicional.

## Enlaces

- Hugging Face: https://huggingface.co/Hooshaai/bert-comp-fp8-sst2
- Modelo base: https://huggingface.co/google-bert/bert-base-uncased
- Dataset: https://huggingface.co/datasets/nyu-mll/glue
- Librería NeuralOps (GitHub): https://github.com/tahamajs/NeuralOps
- Implementación del compresor FP8: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/compression/quantization/fp8_compressor.py
- Licencia NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
