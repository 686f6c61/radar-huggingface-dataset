# Hooshaai/bert-comp-quarot-sst2

## Resumen

`Hooshaai/bert-comp-quarot-sst2` es un checkpoint de clasificación de sentimiento derivado de `google-bert/bert-base-uncased`, afinado sobre GLUE SST-2 y procesado con el motor de compresión `QuaRotCompressor` de la librería NeuralOps. El modelo se presenta como un ejemplo del "Compressor Zoo" de NeuralOps, una iniciativa que empaqueta variantes comprimidas de modelos base con fines de evaluación y reproducibilidad. El autor del repositorio es Hooshaai, y la implementación de referencia pertenece al proyecto NeuralOps (tahamajs).

Arquitectónicamente es un BERT-base estándar: transformer encoder de 12 capas, dimensión oculta 768 y 109.483.778 parámetros totales. La particularidad es que el checkpoint se ha serializado tras aplicar una rotación Walsh-Hadamard aleatorizada (característica de QuaRot) orientada a cuantización de 4 bits/FP8, y se distribuye con los buffers y factores resultantes ya integrados en el state dict.

Es relevante ahora porque ejemplifica el flujo de compresión extremo a extremo con "curación" LoRA selectiva y evaluación Pareto multi-rango, un patrón cada vez más común para desplegar modelos pequeños en producción. No obstante, la compresión física declarada es de 1,00x (0,0 % de ahorro), por lo que su interés es más metodológico y de trazabilidad que de eficiencia real.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT-base), 12 capas, dimensión oculta 768 |
| Parámetros totales | 109.483.778 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (el modelo base BERT-base-uncased admite 512 tokens, pero la model card no lo declara explícitamente) |
| Tipos de cuantización | QuaRot: cuantización de 4 bits / FP8 con pre-rotación Walsh-Hadamard aleatorizada |
| Idiomas soportados | Inglés (en) |
| Licencia | MIT |
| Formato de pesos | `pytorch_model.bin` (state dict serializado), `config.json`, `compression_summary.json`, assets de tokenizer (`vocab.txt`, `tokenizer.json`, `tokenizer_config.json`) |

## Arquitectura y entrenamiento

El modelo parte de `google-bert/bert-base-uncased`, un transformer encoder bidireccional de 12 capas y 768 dimensiones ocultas, preentrenado con enmascaramiento de tokens y predicción de siguiente frase. Sobre esa base se realizó un fine-tuning supervisado para clasificación binaria de sentimiento en GLUE SST-2. Posteriormente, el checkpoint se procesó con `QuaRotCompressor`, que aplica una rotación ortogonal Walsh-Hadamard aleatorizada a las activaciones y pesos antes de cuantizar, con el objetivo de reducir valores atípicos y facilitar la cuantización de 4 bits/FP8.

La model card describe un protocolo de evaluación Pareto sobre los rangos `k=256, 128, 64, 32`. Cuando la compresión zero-shot degrada la precisión más de 2,0 puntos con una reducción superior a 1,10x, NeuralOps aplica "LoRA healing" con `r=8`, 50 pasos, `lr=2e-4` y un presupuesto de 45 segundos. En este checkpoint concreto, el rango empaquetado es `k=32`, con `LoRA Recovery Applied: False` y ratio de compresión físico de 1,00x, lo que indica que la variante distribuida no reduce el número de parámetros respecto al teacher. El rango `k=256` se marca como `FAIL_CRASH` en la tabla de evaluación.

No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset más allá de GLUE SST-2, ni si se aplicaron etapas de RLHF o DPO (no procede en un clasificador).

## Capacidades

- Clasificación de sentimiento binaria (positivo/negativo) en inglés sobre textos cortos, orientada a la tarea GLUE SST-2.
- Generación de logits de dos clases (`num_labels=2`) aptos para integración en pipelines de `transformers` con `BertForSequenceClassification`.
- Inferencia determinista y ligera: el modelo es un encoder de 109M de parámetros, adecuado para CPU y GPUs de gama baja.
- Compatibilidad con el ecosistema NeuralOps mediante `load_surgeried_model` para carga en una línea desde el Hub.
- No soporta tool calling, function calling, razonamiento multi-paso, agentes, visión, audio ni modo "thinking"; es un clasificador, no un modelo generativo.
- Capacidad multilingüe limitada al inglés, coherente con el vocabulario `bert-base-uncased`.

## Casos de uso

- Análisis de sentimiento de reseñas de producto: el modelo clasifica reseñas cortas en inglés con un accuracy declarado del 91,63 % en SST-2, suficiente para triage automático de opiniones en e-commerce.
- Monitorización de reputación en redes sociales: permite etiquetar menciones y comentarios en inglés a bajo coste, desplegable en CPU para volúmenes altos.
- Filtrado previo en pipelines de moderación: como clasificador ligero, puede preetiquetar positividad/negatividad antes de pasar textos a modelos mayores o a revisión humana.
- Enrutamiento de tickets de soporte: la señal de sentimiento puede usarse para priorizar tickets negativos en un sistema de atención al cliente en inglés.
- Benchmark de técnicas de compresión: sirve como referencia reproducible para comparar QuaRot frente a otras técnicas del Compressor Zoo de NeuralOps sobre una tarea estándar (SST-2).
- Evaluación de pipelines de cuantización: útil para validar que la reconstrucción del state dict comprimido y los buffers de cuantización cargan correctamente en `transformers` antes de desplegar variantes más agresivas.
- Docencia e investigación en eficiencia de modelos: ejemplo didáctico de flujo compresión → evaluación Pareto → LoRA healing sobre un modelo pequeño y bien conocido.

## Benchmarks y rendimiento

Datos declarados por el autor en el model-index (no verificados):

| Benchmark | Métrica | Valor | Verificado |
|---|---|---|---|
| GLUE SST-2 (validation) | Accuracy | 91,63 % | No |

Evaluación Pareto multi-rango declarada por el autor (RTX 3090, 872 muestras de validación SST-2):

| Rango (k) | Ratio físico | Parámetros comprimidos | Zero-shot Acc | Healed Acc | Paridad vs teacher (91,63 %) |
|:---:|:---:|---:|---:|---:|---:|
| 256 | — | — | FAIL_CRASH | — | — |
| 128 | 1,00x | 109.483.778 | 91,63 % | 91,63 % | +0,00 % |
| 64 | 1,00x | 109.483.778 | 91,63 % | 91,63 % | +0,00 % |
| 32 (empaquetado) | 1,00x | 109.483.778 | 91,63 % | 91,63 % | +0,00 % |

No se han publicado en la información disponible resultados de otros benchmarks (MMLU, HumanEval, GSM8K, etc.), que además no aplican a un clasificador SST-2.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 (109M parámetros, ~437 MB de pesos) y en torno a 0,5 GB con overhead de activaciones para batches pequeños; no se han publicado medidas oficiales de VRAM.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; el autor reporta evaluación en NVIDIA GeForce RTX 3090 (24 GB), aunque el modelo es sobredimensionado para esa GPU.
- Cabe holgadamente en GPUs de consumo: RTX 3060, RTX 4060, GTX 1660, e incluso en CPU para inferencia por lotes.
- Opciones de despliegue: `transformers` con `BertForSequenceClassification` (requiere reconstruir la topología con `compress_model` de NeuralOps antes de cargar el state dict), API `neuralops.hub.load_surgeried_model`, y exportación potencial a ONNX/TorchScript no documentada en la información disponible. No se documenta soporte nativo para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | SST-2 (val) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Hooshaai/bert-comp-quarot-sst2` | 109,5M | No disponible (base BERT: 512) | 91,63 % (declarado, no verificado) | MIT | Hugging Face, 46 descargas |
| `google-bert/bert-base-uncased` (teacher) | 109,5M | 512 | 91,63 % (referencia del autor) | Apache 2.0 | Hugging Face, ampliamente usado |
| `distilbert-base-uncased-finetuned-sst-2-english` | ~67M | 512 | No disponible en esta información | Apache 2.0 | Hugging Face |
| `textattack/bert-base-uncased-SST-2` | 109,5M | 512 | No disponible en esta información | Apache 2.0 | Hugging Face |

La comparativa con `distilbert` y `textattack/bert-base-uncased-SST-2` se ofrece como referencia de categoría; los valores concretos de accuracy de esas alternativas no están en la información proporcionada y no se inventan.

## Limitaciones y advertencias

- El checkpoint declara una compresión física de 1,00x (0,0 % de ahorro), por lo que no aporta ventajas de tamaño frente al modelo base; su valor es metodológico y de trazabilidad del pipeline NeuralOps.
- El accuracy de 91,63 % está marcado como `verified: false` en el model-index; no ha sido validado de forma independiente.
- El rango `k=256` aparece como `FAIL_CRASH` en la tabla del autor, lo que sugiere inestabilidad del motor QuaRot en configuraciones de mayor rango.
- La carga requiere reconstruir la topología con `compress_model` de NeuralOps antes de aplicar `load_state_dict`; no es un checkpoint estándar de `transformers` cargable directamente con `from_pretrained` sin ese paso.
- El ejemplo de la model card usa `repo_id = "tahamajs/bert-comp-quarot-sst2"`, distinto del ID real `Hooshaai/bert-comp-quarot-sst2`; conviene verificar la ruta antes de ejecutar el código.
- Modelo exclusivamente en inglés; no soporta otros idiomas ni tareas generativas.
- Riesgo de alucinación no aplica en sentido estricto (clasificador), pero sí de clasificaciones erróneas en textos sarcásticos, dominios distintos a reseñas o entradas largas fuera de distribución.
- Sesgos heredados de `bert-base-uncased` y de SST-2 (reseñas de películas), que pueden no generalizar a otros dominios.
- Licencia MIT declarada, con enlace a la licencia del repositorio NeuralOps; conviene revisar los términos del proyecto NeuralOps para uso comercial en produción.
- El repositorio tiene 46 descargas y 0 likes en el momento de la consulta, lo que indica escasa validación comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/Hooshaai/bert-comp-quarot-sst2
- Modelo base: https://huggingface.co/google-bert/bert-base-uncased
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Implementación QuaRotCompressor: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/compression/quantization/quarot.py
- Licencia NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset GLUE SST-2: https://huggingface.co/datasets/nyu-mll/glue
- Paper QuaRot (referencia del método): no disponible en la información proporcionada
