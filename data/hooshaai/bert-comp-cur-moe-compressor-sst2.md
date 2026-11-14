# Hooshaai/bert-comp-cur-moe-compressor-sst2

## Resumen

`bert-comp-cur-moe-compressor-sst2` es un checkpoint de BERT-Base (`google-bert/bert-base-uncased`) comprimido físicamente mediante la técnica `cur_moe_compressor` (familia `low_rank`) de la librería NeuralOps, y ajustado sobre GLUE SST-2 para clasificación de sentimiento binario. Lo publica el usuario Hooshaai bajo licencia MIT. El modelo no es un modelo fundacional nuevo: es una demostración del pipeline de compresión de NeuralOps aplicado a una arquitectura transformer encoder estándar de 12 capas y dimensión oculta 768.

El interés técnico reside en el método: CUR-MoE descompone las matrices de pesos en factores de bajo rango seleccionados por un criterio tipo CUR (columnas y filas representativas) combinado con un esquema de mezcla de expertos (MoE) para enrutar la reconstrucción. El checkpoint empaquetado corresponde al rango `k=32`, con un ratio de compresión de 1,06x y una reducción de parámetros del 5,69% (de 109.483.778 a 103.250.882). La accuracy final en la validación de SST-2 es del 80,39%, frente al 91,63% del modelo profesor original, una pérdida de 11,24 puntos.

Es relevante ahora como referencia reproducible de compresión de modelos encoder para clasificación de texto: la model card documenta una evaluación Pareto multi-rango (k=256, 128, 64, 32) sobre una RTX 3090, con y sin "LoRA healing", y expone las métricas de telemetría en `compression_summary.json`. Para desarrolladores que evalúan técnicas de compresión low-rank, este repositorio ofrece un punto de comparación con datos concretos, aunque el resultado final en el rango empaquetado queda lejos del profesor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT-Base), 12 capas, dimension oculta 768, comprimido con CUR-MoE low-rank |
| Parametros totales | 103.250.882 (comprimido); base original: 109.483.778 |
| Parametros activos | no disponible (no es un MoE de inferencia; el termino MoE se refiere al esquema de reconstruccion CUR) |
| Longitud de contexto | 512 tokens (heredado de bert-base-uncased; no se especifica en la model card) |
| Tipos de cuantizacion | no disponible (el checkpoint se distribuye en `pytorch_model.bin` sin cuantizar) |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | PyTorch (`pytorch_model.bin`), con `config.json`, `compression_summary.json` y assets de tokenizer de bert-base-uncased |

## Arquitectura y entrenamiento

La arquitectura base es BERT-Base uncased: 12 capas de transformer encoder, 768 dimensiones ocultas, 12 cabezas de atención y 109.483.778 parámetros. Sobre esta base, NeuralOps aplica el compresor `cur_moe_compressor` (clase `cur_moe_factory`, familia `low_rank`), que reduce las matrices de pesos mediante descomposición de bajo rango con selección de filas y columnas representativas (CUR) y un mecanismo de enrutamiento tipo mezcla de expertos para la reconstrucción. El resultado físico es un state dict comprimido con factores de bajo rango integrados.

El checkpoint empaquetado corresponde al rango `k=32`, con ratio de compresión 1,06x y reducción del 5,69% de parámetros. Según la model card, en este rango no se aplicó LoRA healing (`LoRA Recovery Applied: False`); la accuracy zero-shot y la final coinciden en 80,39%. El ajuste original sobre SST-2 parte de bert-base-uncased y se evalúa sobre el split de validación de GLUE SST-2 (872 muestras). La model card describe que, cuando la compresión zero-shot degrada más de 2,0 puntos con reducción superior a 1,10x, NeuralOps aplica LoRA healing con `r=8`, 50 pasos, `lr=2e-4` y un presupuesto de 45 segundos; este procedimiento se aplicó en los rangos k=256, 128 y 64, pero no en el k=32 empaquetado.

No se detallan en la información disponible el número de tokens de entrenamiento, la composición del dataset más allá de GLUE SST-2, ni si hubo RLHF o DPO (no aplicable a una tarea de clasificación).

## Capacidades

- Clasificación de sentimiento binario (positivo/negativo) sobre texto en inglés, específicamente sobre el dominio de reseñas de SST-2.
- Inferencia de logits de clasificación con dos etiquetas (`num_labels=2`) mediante `BertForSequenceClassification`.
- Reconstrucción programática del modelo comprimido a través de la API de NeuralOps (`compress_model` con `cur_moe_compressor` y `rank=32`).
- Carga directa desde el Hub mediante `load_surgeried_model` de `neuralops.hub`.
- No soporta generación de texto, tool calling, agentes, visión, audio ni razonamiento multi-paso: es un encoder de clasificación.
- Capacidad multilingüe limitada al inglés (tokenizer `bert-base-uncased`).

## Casos de uso

- Clasificación de sentimiento en reseñas de producto o críticas: el modelo está ajustado específicamente sobre SST-2, por lo que es adecuado para textos de opinión en inglés con una sola frase o párrafo corto; su ventana de 512 tokens cubre la mayoría de reseñas.
- Baseline de compresión en investigación: sirve como referencia reproducible para comparar técnicas low-rank (CUR, SVD, LoRA) sobre BERT-Base en tareas GLUE, ya que la model card publica telemetría multi-rango.
- Evaluación de pipelines de NeuralOps: permite validar el flujo `compress_model` + `load_state_dict` + inferencia en un entorno controlado antes de aplicarlo a modelos mayores.
- Filtrado de comentarios en moderación de comunidades: con 103M parámetros y pesos en fp32 (unos 197 MB), puede desplegarse en CPU o GPU modesta para clasificar toxicidad o polaridad en flujos de texto en inglés.
- Pruebas de regresión de infraestructura de compresión: útil para verificar que una actualización de la librería NeuralOps reproduce las métricas declaradas (80,39% en SST-2 validation).
- Docencia y demostraciones: ejemplo compacto de cómo una descomposición low-rank afecta a la accuracy de un clasificador, con datos de Pareto publicados para ilustrar el compromiso compresión-rendimiento.

## Benchmarks y rendimiento

Datos declarados por el autor en la model-index y la model card (no verificados de forma independiente, `verified: false`):

| Modelo | Dataset | Split | Metrica | Valor |
|---|---|---|---|---|
| bert-comp-cur-moe-compressor-sst2 (k=32) | GLUE SST-2 | validation | Accuracy | 80,39% |
| Profesor: bert-base-uncased fine-tuned SST-2 | GLUE SST-2 | validation | Accuracy | 91,63% |

Evaluación Pareto multi-rango publicada en la model card (RTX 3090, 872 muestras de validación):

| Rank (k) | Ratio fisico | Parametros comprimidos (reduccion) | Accuracy zero-shot | Accuracy con LoRA healing | Parity vs profesor (91,63%) |
|:---:|:---:|---:|---:|---:|---:|
| 256 | 1,40x | 78.026.498 (-28,7%) | 61,24% | 50,92% | -40,71% |
| 128 | 1,67x | 65.582.850 (-40,1%) | 61,81% | 54,47% | -37,16% |
| 64 | 1,70x | 64.542.978 (-41,0%) | 53,67% | 75,00% | -16,63% |
| 32 (empaquetado) | 1,06x | 103.250.882 (-5,7%) | 80,39% | 80,39% | -11,24% |

No se han publicado resultados de otros benchmarks (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint pesa 197,0 MB en fp32, por lo que requiere aproximadamente 0,2 GB de VRAM para los pesos; con activaciones y overhead de framework, menos de 1 GB en la práctica.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; la model card reporta evaluación en NVIDIA GeForce RTX 3090 (24 GB), aunque el modelo es sobradamente pequeño para GPUs consumer de gama baja (GTX 1650, RTX 3050).
- Cabe en GPU consumer: sí, en cualquier GPU consumer moderna e incluso en CPU para inferencia por lotes pequeños.
- Opciones de despliegue: PyTorch nativo con `transformers` + `neuralops`; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (el formato `pytorch_model.bin` y la necesidad de reconstruir la topología con NeuralOps limitan estos runners).
- Latencia y throughput: no disponibles en la información proporcionada; el presupuesto de LoRA healing se cita en 45 segundos para 50 pasos, pero no se reportan métricas de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | SST-2 (val) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| bert-comp-cur-moe-compressor-sst2 (k=32) | 103,25M | 512 | 80,39% | MIT | Hugging Face (NeuralOps) |
| google-bert/bert-base-uncased (profesor fine-tuned SST-2) | 109,48M | 512 | 91,63% | Apache 2.0 | Hugging Face |
| DistilBERT-base-uncased fine-tuned SST-2 | ~66M | 512 | ~91% (referencia habitual, no verificada en esta ficha) | Apache 2.0 | Hugging Face |
| RoBERTa-base fine-tuned SST-2 | ~125M | 512 | ~94-95% (referencia habitual, no verificada en esta ficha) | MIT | Hugging Face |

La comparación directa con DistilBERT y RoBERTa-base se incluye como referencia de categoría; los valores de esos dos modelos no proceden de la información proporcionada y deben contrastarse con sus model cards oficiales. El checkpoint de NeuralOps no supera al profesor en ningún eje y su ventaja es exclusivamente metodológica (demostración de compresión CUR-MoE).

## Limitaciones y advertencias

- Pérdida de accuracy significativa: 80,39% frente a 91,63% del profesor, una caída de 11,24 puntos en el split de validación de SST-2.
- El ratio de compresión real es modesto (1,06x, 5,7% de reducción de parámetros); no es un modelo "ligero" en el sentido habitual, sino una prueba de concepto.
- El término "MoE" en el nombre no implica un modelo de mezcla de expertos en inferencia; se refiere al esquema de reconstrucción CUR. No debe interpretarse como un modelo con parámetros activos reducidos.
- Solo inglés y solo clasificación de sentimiento binario sobre dominio SST-2; no generaliza a otras tareas ni idiomas sin reentrenamiento.
- Riesgo de alucinación no aplicable (tarea de clasificación), pero sí de calibración deficiente y sesgos heredados de bert-base-uncased y del corpus SST-2.
- La carga requiere la librería NeuralOps y la reconstrucción explícita de la topología comprimida antes de `load_state_dict(strict=False)`; no es un checkpoint plug-and-play con `AutoModel.from_pretrained`.
- El `strict=False` en la carga puede enmascarar discrepancias de pesos; conviene validar la accuracy tras la reconstrucción.
- Los resultados de benchmarks están declarados por el autor y no verificados (`verified: false`).
- Licencia MIT permite uso comercial, pero la licencia del modelo base (Apache 2.0) y de los datos (GLUE) deben respetarse por separado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Hooshaai/bert-comp-cur-moe-compressor-sst2
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Implementación del compresor CUR-MoE: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/compression/low_rank/cur_moe_compressor.py
- Licencia NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Modelo base: https://huggingface.co/google-bert/bert-base-uncased
- Dataset GLUE SST-2: https://huggingface.co/datasets/nyu-mll/glue
