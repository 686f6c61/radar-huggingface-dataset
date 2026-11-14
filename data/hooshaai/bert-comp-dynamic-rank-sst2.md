# Hooshaai/bert-comp-dynamic-rank-sst2

## Resumen

`Hooshaai/bert-comp-dynamic-rank-sst2` es un checkpoint de `google-bert/bert-base-uncased` (12 capas, dimensión oculta 768, 109.483.778 parámetros) fine-tuneado en GLUE SST-2 y posteriormente comprimido mediante la técnica `dynamic_rank` del proyecto NeuralOps. El resultado es un modelo de clasificación de sentimiento en inglés con 45.782.786 parámetros efectivos, lo que supone una reducción del 58,18% y un ratio de compresión físico de 2,39x. El autor es el usuario de Hugging Face Hooshaai, y la librería asociada es `neuralops`.

El interés del modelo es fundamentalmente metodológico: sirve como artefacto de referencia para evaluar pipelines de compresión de modelos basados en SVD de rango dinámico combinados con "LoRA healing" (adaptadores LoRA de rango 8 aplicados para recuperar precisión tras la compresión). No es un modelo pensado para producción de alta precisión, sino una demostración reproducible dentro del "compressor zoo" de NeuralOps.

La relevancia práctica es limitada: la precisión final en SST-2 es del 73,62%, frente al 91,63% del modelo profesor original, una pérdida de 18,01 puntos. Esto lo sitúa muy por debajo de lo esperable en una tarea binaria de sentimiento, por lo que su uso realista se circunscribe a experimentación con técnicas de compresión y a la reproducción de los resultados del framework NeuralOps.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder BERT (12 capas, D=768), comprimido con SVD de rango dinámico (`dynamic_entropy_svd_factory`) |
| Parametros totales | 45.782.786 (comprimido, rango k=128); modelo base original: 109.483.778 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo base BERT admite 512 tokens, pero no se declara explícitamente en la model card) |
| Tipos de cuantizacion | no disponible (se mencionan "quantization buffers" en los artefactos, sin especificar tipos) |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | `pytorch_model.bin` (state dict serializado con factores de bajo rango y adaptadores LoRA integrados); tokenizer en `vocab.txt`, `tokenizer.json`, `tokenizer_config.json` |

## Arquitectura y entrenamiento

El modelo parte de `bert-base-uncased`, un transformer encoder estándar de 12 capas y 768 dimensiones ocultas, fine-tuneado previamente sobre GLUE SST-2 (clasificación binaria de sentimiento). Sobre ese checkpoint se aplica el compresor `dynamic_rank`, registrado en `COMPRESSOR_REGISTRY` como `dynamic_entropy_svd_factory`, que descompone las matrices de pesos mediante SVD con rango dinámico determinado por entropía. El checkpoint publicado corresponde al rango k=128, con 45.782.786 parámetros y un ratio de compresión de 2,39x.

Tras la compresión, el pipeline aplica "LoRA healing": adaptadores LoRA de rango r=8 entrenados durante 50 pasos con learning rate 2e-4 y un presupuesto de 45 segundos, que se activan cuando la compresión zero-shot degrada la precisión más de 2,0 puntos con una reducción superior a 1,10x. En este caso, la compresión zero-shot arrojaba un 52,41% de accuracy en SST-2, y el healing LoRA la elevó hasta el 73,62%. La evaluación se realizó físicamente sobre una NVIDIA GeForce RTX 3090 (24 GB) usando el split de validación de GLUE SST-2 (872 muestras). No se detalla la composición del dataset de entrenamiento más allá de GLUE SST-2 ni se mencionan fases de RLHF o DPO (no aplicables a una tarea de clasificación).

## Capacidades

- Clasificación binaria de sentimiento en inglés (positivo/negativo) sobre texto corto, orientada a la distribución de GLUE SST-2.
- Generación de logits de clasificación (2 clases) mediante `BertForSequenceClassification`.
- No soporta generación de texto libre: es un encoder con cabeza de clasificación.
- No dispone de tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento de agente.
- Capacidad multilingüe: no; únicamente inglés (vocabulario `bert-base-uncased`).
- No incluye modo "thinking", visión ni audio.
- Integración con la API `load_surgeried_model` de NeuralOps para carga en una línea desde el Hub.

## Casos de uso

- Reproducción de experimentos de compresión: cargar el checkpoint con `compress_model(..., {"method": "dynamic_rank", "rank": 128})` y verificar la precisión reportada (73,62%) sobre el split de validación de SST-2 para validar el pipeline NeuralOps.
- Benchmarking de técnicas de compresión: usar este checkpoint como referencia frente a otros compresores del "compressor zoo" (por ejemplo, cuantización o poda estructurada) comparando ratio de compresión y accuracy en la misma tarea.
- Estudio del efecto del LoRA healing: comparar el rendimiento zero-shot (52,41%) con el healed (73,62%) para cuantificar la contribución de los adaptadores r=8 en 50 pasos.
- Análisis de la curva Pareto rango-precisión: los datos publicados para k=256, 128, 64 y 32 permiten estudiar el compromiso entre reducción de parámetros y precisión en un modelo BERT pequeño.
- Prototipado de clasificadores de sentimiento de bajo coste en entornos con recursos muy limitados, aceptando la pérdida de precisión frente al profesor (uso no recomendado en producción).
- Docencia y formación: ejemplo didáctico de pipeline completo de compresión SVD + fine-tuning ligero sobre un modelo transformer estándar.
- Pruebas de integración de la librería `neuralops` en flujos de Hugging Face Hub (descarga, reconstrucción de topología y carga de state dict con `strict=False`).

## Benchmarks y rendimiento

Resultados declarados por el autor en la model-index (no verificados):

| Metrica | Valor |
|---|---|
| GLUE SST-2 Validation Accuracy (modelo comprimido k=128, con LoRA healing) | 73,62% |
| GLUE SST-2 Validation Accuracy (profesor `bert-base-uncased` fine-tuneado) | 91,63% |
| GLUE SST-2 Validation Accuracy (zero-shot, sin healing) | 52,41% |
| Parity delta frente al profesor | -18,01% |

Evaluación multi-rango publicada por el autor (RTX 3090, 872 muestras de validación):

| Rango (k) | Ratio fisico | Parametros comprimidos (reduccion) | Accuracy zero-shot | Accuracy con LoRA | Parity vs profesor |
|:---:|:---:|---:|---:|---:|---:|
| 256 | 2,39x | 45.782.786 (-58,2%) | 52,41% | 73,62% | -18,01% |
| 128 | 2,39x | 45.782.786 (-58,2%) | 52,41% | 73,62% | -18,01% |
| 64 | 3,08x | 35.500.034 (-67,6%) | 51,15% | 50,92% | -40,71% |
| 32 | 3,65x | 30.023.426 (-72,6%) | 50,11% | 61,70% | -29,93% |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con 45,8 M de parámetros en fp32 el checkpoint ocupa aproximadamente 87,4 MB según la model card, por lo que la inferencia cabe holgadamente en cualquier GPU consumer con 4 GB o más.
- GPU recomendadas: cualquier GPU moderna es suficiente; la evaluación del autor se realizó en una NVIDIA GeForce RTX 3090 (24 GB), pero el modelo es sobredimensionado para ese hardware.
- Cabe en GPU consumer: sí, en cualquier RTX (incluso series 20xx o inferiores) e incluso en CPU para inferencia por lotes pequeños.
- Opciones de despliegue: la carga requiere la librería `neuralops` para reconstruir la topología comprimida antes de cargar el state dict; no se documenta compatibilidad directa con vLLM, llama.cpp, Ollama o TGI, y al ser un encoder de clasificación no encaja en los pipelines de generación de esos motores. La vía soportada es `transformers` + `neuralops` (bien con `compress_model` + `load_state_dict`, bien con `load_surgeried_model`).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | SST-2 (val) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Hooshaai/bert-comp-dynamic-rank-sst2` (k=128) | 45,8 M (comprimido) | no disponible | 73,62% | MIT | Hugging Face, requiere `neuralops` |
| `google-bert/bert-base-uncased` (profesor fine-tuneado en SST-2) | 109,5 M | 512 tokens | 91,63% (declarado por el autor) | Apache 2.0 | Hugging Face, `transformers` estándar |
| `distilbert-base-uncased-finetuned-sst-2-english` | 66,9 M | 512 tokens | no disponible en esta ficha | Apache 2.0 | Hugging Face, `transformers` estándar |
| `textattack/bert-base-uncased-SST-2` | 109,5 M | 512 tokens | no disponible en esta ficha | Apache 2.0 | Hugging Face, `transformers` estándar |

La comparación directa con el profesor es la más informativa: el modelo comprimido reduce parámetros un 58,2% pero pierde 18,01 puntos de accuracy, un compromiso desfavorable frente a alternativas como DistilBERT, que reduce el tamaño aproximadamente un 40% manteniendo precisiones cercanas al profesor en SST-2 (aunque no se dispone de cifras verificadas en esta ficha).

## Limitaciones y advertencias

- Pérdida de precisión severa: 73,62% frente al 91,63% del profesor, una caída de 18,01 puntos que lo hace inadecuado para producción en clasificación de sentimiento.
- El resultado de 73,62% está marcado como `verified: false` en la model-index; procede del propio autor y no ha sido validado de forma independiente.
- El modelo solo cubre inglés y la distribución de SST-2 (reseñas de cine); el rendimiento fuera de dominio es incierto y probablemente peor.
- No es un modelo generativo: no puede usarse para chat, resumen, traducción ni generación de código.
- La carga requiere la librería `neuralops` y un paso explícito de reconstrucción de topología; no es plug-and-play con `AutoModel.from_pretrained` estándar.
- La model card contiene inconsistencias menores: los rangos k=256 y k=128 reportan parámetros y precisión idénticos, lo que sugiere un posible error de reporte o un colapso del rango efectivo.
- El ejemplo de código de la model card referencia el repo `tahamajs/bert-comp-dynamic-rank-sst2`, distinto del repo real `Hooshaai/bert-comp-dynamic-rank-sst2`; debe ajustarse el `repo_id` al cargar.
- Licencia MIT: permite uso comercial, pero dada la baja precisión no se recomienda su explotación comercial sin un fine-tuning adicional.
- Riesgo de alucinación no aplicable en sentido generativo, pero sí de clasificaciones erróneas sistemáticas en dominios distintos de SST-2.
- Sesgos heredados de `bert-base-uncased` y de los datos de GLUE SST-2 (reseñas de cine en inglés), no evaluados ni mitigados en la model card.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Hooshaai/bert-comp-dynamic-rank-sst2
- Modelo base: https://huggingface.co/google-bert/bert-base-uncased
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Implementación del compresor `dynamic_rank`: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/compression/svd/dynamic_rank.py
- Licencia NeuralOps (MIT): https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset GLUE SST-2: https://huggingface.co/datasets/nyu-mll/glue
