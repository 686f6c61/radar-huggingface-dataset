# Hooshaai/bert-comp-sdrm-compressor-sst2

## Resumen

`Hooshaai/bert-comp-sdrm-compressor-sst2` es un checkpoint de BERT-Base (`google-bert/bert-base-uncased`) afinado para clasificación de sentimiento en GLUE SST-2 y posteriormente comprimido mediante el motor `sdrm_compressor` de la librería NeuralOps. El autor, Hooshaai, publica este modelo dentro de un "zoo" de modelos comprimidos y "sanados" con LoRA, con el objetivo de explorar técnicas de compresión de bajo rango sobre transformers pequeños y medir el coste en precisión downstream.

El checkpoint empaquetado corresponde al rango de compresión `k=32`, con una reducción física de parámetros del 13,61 % (de 109.483.778 a 94.587.098 parámetros, ratio 1,157x). Sobre ese modelo comprimido se aplicó un "healing" con LoRA de rango 8 durante 50 pasos. El resultado final es una accuracy del 50,92 % en la validación de SST-2, frente al 91,63 % del profesor original, lo que supone una degradación de 40,71 puntos.

Es relevante ahora porque documenta de forma transparente (incluyendo los fallos) el comportamiento de una técnica de compresión de bajo rango en un modelo pequeño: los rangos k=64, 128 y 256 provocaron fallos de ejecución (`FAIL_CRASH`) y el único rango viable pierde más de 40 puntos de accuracy. Su utilidad práctica es, por tanto, fundamentalmente como referencia metodológica y de benchmarking de compresión, no como modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT-Base, 12 capas, dimensión oculta 768) |
| Parametros totales | 94.587.098 (comprimido); 109.483.778 en el modelo base |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo base BERT-Base admite 512 tokens, pero la model card no lo declara) |
| Tipos de cuantizacion | no disponible (el checkpoint se distribuye en `pytorch_model.bin` sin cuantización declarada; incluye factores de bajo rango y adaptadores LoRA) |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | PyTorch (`pytorch_model.bin`), más `config.json`, `compression_summary.json` y assets del tokenizador de `bert-base-uncased` |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer encoder BERT-Base con 12 capas y dimensión 768, preentrenado por Google y afinado para clasificación binaria de sentimiento en GLUE SST-2. Sobre ese modelo afinado se aplica el compresor `sdrm_compressor_factory` (familia `low_rank`) de NeuralOps, que reduce la representación de los pesos mediante factores de bajo rango. El checkpoint publicado corresponde al rango `k=32`, con un 13,61 % menos de parámetros y un ratio de compresión físico de 1,157x.

El proceso de "healing" consistió en un ajuste LoRA de rango 8 durante 50 pasos con tasa de aprendizaje 2e-4 y un presupuesto de 45 segundos, aplicado cuando la compresión zero-shot degradaba la accuracy más de 2 puntos con una reducción superior a 1,10x. Según la model card, la evaluación se realizó físicamente en una NVIDIA GeForce RTX 3090 (24 GB) sobre las 872 muestras de validación de SST-2. No se documentan detalles sobre datos de preentrenamiento adicionales, RLHF/DPO ni innovaciones de decodificación; el interés técnico está en el pipeline de compresión y en la telemetría multi-rango publicada.

## Capacidades

- Clasificación binaria de sentimiento (positivo/negativo) en inglés, sobre el formato de GLUE SST-2.
- Inferencia sobre texto corto en inglés tokenizado con el vocabulario `bert-base-uncased`.
- Carga del checkpoint mediante la API de NeuralOps (`load_surgeried_model`) o reconstruyendo la topología con `compress_model` y cargando el `state_dict`.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No dispone de modo "thinking", visión, audio ni otras capacidades multimodales.
- Capacidad multilingüe limitada al inglés (idioma declarado en la model card).
- Trazabilidad de compresión: incluye `compression_summary.json` con telemetría de los rangos evaluados (256, 128, 64, 32).

## Casos de uso

- Referencia metodológica para investigación en compresión: sirve para reproducir y auditar el pipeline `sdrm_compressor` sobre BERT-Base y comparar la degradación de accuracy entre rangos de compresión.
- Benchmark de "healing" con LoRA: permite estudiar si un ajuste LoRA de rango 8 y 50 pasos recupera precisión tras compresión de bajo rango, con un caso documentado de recuperación insuficiente (de 85,09 % zero-shot a 50,92 % tras healing).
- Docencia y formación: ejemplo didáctico de cómo una compresión agresiva puede degradar un clasificador hasta niveles cercanos al azar en una tarea binaria.
- Validación de infraestructura de despliegue: útil para probar pipelines de carga de checkpoints comprimidos con NeuralOps, `transformers` y `huggingface_hub` en entornos de CI.
- Pruebas de integración de la librería NeuralOps: verifica la API `load_surgeried_model` y la reconstrucción de topologías comprimidas.
- Clasificación de sentimiento en entornos de bajo riesgo y no críticos donde la precisión no sea requisito, siempre que se acepte su baja accuracy (50,92 %).

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (no verificados):

| Rank (k) | Ratio físico | Parámetros comprimidos (reducción) | Accuracy zero-shot | Accuracy con healing | Paridad vs profesor (91,63 %) |
|:---:|:---:|---:|---:|---:|---:|
| 256 | — | — | FAIL_CRASH | — | — |
| 128 | — | — | FAIL_CRASH | — | — |
| 64 | — | — | FAIL_CRASH | — | — |
| 32 (publicado) | 1,16x | 94.587.098 (-13,6 %) | 85,09 % | 50,92 % (LoRA) | -40,71 % |

| Métrica | Valor |
|---|---|
| GLUE SST-2, validación (accuracy) | 50,92 % |
| Baseline del profesor (BERT-Base afinado) | 91,63 % |
| Muestras de evaluación | 872 |
| Hardware de evaluación | NVIDIA GeForce RTX 3090 (24 GB) |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; por tamaño (≈95 M de parámetros en fp32, ≈0,38 GB de pesos) es holgadamente ejecutable en GPUs de consumo.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; el autor evaluó en una RTX 3090 (24 GB).
- Cabe en GPU de consumo: sí, en modelos como RTX 3060, RTX 4060, RTX 4090 y similares, e incluso en CPU para inferencia puntual.
- Opciones de despliegue: carga mediante `transformers` (`BertForSequenceClassification`) junto con `neuralops` para reconstruir la topología comprimida; también mediante la API `load_surgeried_model` de NeuralOps. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Accuracy SST-2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Hooshaai/bert-comp-sdrm-compressor-sst2` (k=32) | 94.587.098 | no disponible | 50,92 % | MIT | Hugging Face |
| `google-bert/bert-base-uncased` (profesor, afinado SST-2) | 109.483.778 | 512 tokens (modelo base) | 91,63 % (declarado por el autor) | Apache 2.0 (modelo base) | Hugging Face |
| BERT-Base sin comprimir (referencia genérica) | 109.483.778 | 512 tokens | no disponible | Apache 2.0 | Hugging Face |

No se dispone de datos de benchmarks de otros modelos comprimidos comparables en la información proporcionada.

## Limitaciones y advertencias

- Degradación severa de precisión: 50,92 % de accuracy en una tarea binaria equivale prácticamente a una clasificación aleatoria; no es apto para producción.
- Los rangos de compresión k=64, 128 y 256 fallaron con `FAIL_CRASH`, lo que indica inestabilidad del pipeline de compresión en configuraciones menos agresivas.
- El "healing" con LoRA empeoró el resultado respecto al zero-shot (de 85,09 % a 50,92 %), un comportamiento anómalo que conviene auditar antes de reutilizar la receta.
- Sesgos conocidos: no documentados en la información disponible; hereda los sesgos del corpus de preentrenamiento de BERT-Base y de SST-2.
- Riesgo de alucinación: no aplica directamente a una tarea de clasificación, pero la baja accuracy implica alta tasa de predicciones incorrectas.
- Limitación de idioma: solo inglés.
- Limitación de contexto: no declarada; el modelo base admite hasta 512 tokens, pero la model card no lo confirma para el checkpoint comprimido.
- Restricciones de licencia: MIT, permite uso comercial según la licencia, aunque la calidad del modelo desaconseja cualquier uso en producción.
- Caveat de producción: requiere la librería `neuralops` para reconstruir la topología comprimida antes de cargar el `state_dict`; no es un checkpoint estándar de `transformers` cargable directamente.
- Los resultados de benchmarks están marcados como no verificados (`verified: false`) por el autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Hooshaai/bert-comp-sdrm-compressor-sst2
- Modelo base: https://huggingface.co/google-bert/bert-base-uncased
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Implementación del compresor: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/compression/low_rank/sdrm_compressor.py
- Licencia NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset GLUE SST-2: https://huggingface.co/datasets/nyu-mll/glue
