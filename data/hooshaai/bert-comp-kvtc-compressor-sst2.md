# Hooshaai/bert-comp-kvtc-compressor-sst2

## Resumen

`bert-comp-kvtc-compressor-sst2` es un checkpoint comprimido y "curado" (healed) de `google-bert/bert-base-uncased` afinado para clasificación de sentimiento en GLUE SST-2, publicado por el usuario Hooshaai dentro del ecosistema NeuralOps. El modelo aplica el compresor `KVTCCompressor` (KV Cache Transform Coding: PCA estática sobre pesos + clipping por percentiles + cuantización entera uniforme + estimación de codificación entrópica) sobre las proyecciones lineales del transformer, reduciendo el recuento de parámetros de 109.483.778 a 24.549.122 (un 77,58 % menos, ratio de compresión físico de 4,46x). Tras la compresión, se aplica un "loRA healing" con adaptadores de rango r=8 durante 50 pasos para recuperar parte de la precisión perdida.

El modelo es relevante como artefacto de investigación sobre compresión de modelos: demuestra empíricamente el compromiso entre ratio de compresión y degradación de precisión en una tarea concreta (SST-2), con una precisión final del 89,22 % frente al 91,63 % del profesor original, es decir, una pérdida de 2,41 puntos. La compresión en frío (zero-shot) cae al 80,73 %, lo que evidencia que el healing LoRA recupera unos 8,5 puntos.

Se trata de un modelo de clasificación de texto en inglés, no generativo, con licencia MIT y un tamaño de repositorio de 0,1 GB. Su interés práctico es limitado fuera del ámbito de la compresión de modelos, pero resulta útil como referencia reproducible para quienes investigan técnicas de poda y cuantización sobre arquitecturas BERT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder BERT-base (12 capas, dimensión oculta 768), comprimido con KVTCCompressor |
| Parametros totales | 24.549.122 (comprimido; original 109.483.778) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (BERT-base estándar admite 512 tokens, pero no se declara explícitamente en la model card) |
| Tipos de cuantizacion | Cuantización entera uniforme con clipping por percentiles aplicada internamente por el compresor; no se especifican formatos de cuantización para despliegue (GGUF, GPTQ, etc.) |
| Idiomas soportados | Inglés (en) |
| Licencia | MIT |
| Formato de pesos | `pytorch_model.bin` (state dict serializado de PyTorch), `config.json`, `compression_summary.json`, assets de tokenizer |

## Arquitectura y entrenamiento

La arquitectura base es `google-bert/bert-base-uncased`: un transformer encoder de 12 capas con dimensión oculta 768 y 109.483.778 parámetros, preentrenado de forma no supervisada y posteriormente afinado en GLUE SST-2 (clasificación binaria de sentimiento). Sobre este modelo, NeuralOps aplica el compresor `kvtc_compressor` (`KVTCCompressor`, familia `kv_cache`), que comprime los pesos de las proyecciones lineales mediante PCA estática para decorrelacionar, clipping por percentiles, cuantización entera uniforme y estimación de codificación entrópica. El resultado es un checkpoint físicamente comprimido con factores de bajo rango y buffers de cuantización incrustados.

El proceso de recuperación ("LoRA healing") se activa cuando la compresión en frío degrada la precisión más de 2,0 puntos con una reducción superior a 1,10x. En este caso, la evaluación zero-shot cayó al 80,73 % (frente al 91,63 % del profesor), por lo que se aplicaron adaptadores LoRA de rango r=8 durante 50 pasos con learning rate 2e-4 y un presupuesto de 45 segundos, alcanzando el 89,22 % final. La evaluación se realizó físicamente en una NVIDIA GeForce RTX 3090 (24 GB) sobre el split de validación de GLUE SST-2 (872 muestras). No se detallan en la información disponible los datos de preentrenamiento originales de BERT ni la composición del dataset de afinado más allá de la referencia a `nyu-mll/glue` (config sst2).

## Capacidades

- Clasificación de sentimiento binaria (positivo/negativo) en inglés, tarea para la que fue específicamente afinado y comprimido.
- Clasificación de texto genérica en la medida en que la arquitectura BERT-base subyacente lo permita, aunque el checkpoint está especializado en SST-2.
- No soporta generación de texto, razonamiento multi-paso, código, matemáticas ni visión.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- Capacidades multilingües limitadas al inglés (el tokenizer es `bert-base-uncased`, vocabulario inglés).
- No dispone de modo "thinking", audio ni otras capacidades especiales.

## Casos de uso

- Análisis de sentimiento en reseñas de productos o comentarios en inglés: el modelo clasifica texto breve en positivo/negativo con una precisión declarada del 89,22 % en SST-2, adecuado para pipelines de moderación o análisis de opinión a pequeña escala.
- Filtrado de feedback de usuarios en aplicaciones: al ser un modelo de 24,5 M de parámetros y 127,9 MB de pesos, puede desplegarse en entornos con recursos limitados para preclasificar comentarios antes de un análisis más profundo.
- Investigación en compresión de modelos: sirve como referencia reproducible para comparar técnicas de compresión (KVTC frente a poda, cuantización o destilación) sobre una tarea estandarizada como SST-2.
- Benchmarking de pipelines de compresión: el artefacto `compression_summary.json` permite reproducir la evaluación multi-rango (k=256, 128, 64, 32) y validar implementaciones propias del compresor.
- Docencia y experimentación: útil para demostrar el impacto del "LoRA healing" tras compresión agresiva, con métricas concretas de degradación y recuperación.
- Despliegue en dispositivos edge o CPU: el reducido tamaño del checkpoint (0,1 GB de repositorio) facilita la inferencia en hardware sin GPU dedicada para clasificación de sentimiento en inglés.

## Benchmarks y rendimiento

Datos declarados por el autor en el model-index (no verificados, `verified: false`):

| Benchmark | Metrica | Valor |
|---|---|---|
| GLUE SST-2 (validation) | Accuracy | 89,22 % |

Evaluación multi-rango declarada por el autor (RTX 3090, 872 muestras de validación):

| Rank (k) | Ratio fisico | Parametros comprimidos | Zero-shot Acc | Healed Acc | Paridad vs profesor (91,63 %) |
|---|---|---|---|---|---|
| 256 | 4,46x | 24.549.122 (-77,6 %) | 80,73 % | 89,22 % (LoRA) | -2,41 % |
| 128 | 4,46x | 24.549.122 (-77,6 %) | 80,73 % | 89,22 % (LoRA) | -2,41 % |
| 64 | — | — | FAIL_CRASH | — | — |
| 32 (checkpoint publicado) | 4,46x | 24.549.122 (-77,6 %) | 80,73 % | 89,22 % (LoRA) | -2,41 % |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 para 24,5 M de parámetros (aproximadamente 98 MB de pesos más activaciones); en la práctica, cualquier GPU consumer moderna es suficiente.
- GPU recomendadas: no se especifican requisitos mínimos; el autor evaluó en NVIDIA GeForce RTX 3090 (24 GB), pero el modelo cabe holgadamente en GPUs de gama baja (GTX 1650, RTX 3050, etc.) e incluso en CPU.
- Cabe en cualquier GPU consumer: sí, dado el reducido número de parámetros (24,5 M) y el tamaño del repositorio (0,1 GB).
- Opciones de despliegue: la model card proporciona un flujo de reconstrucción con `neuralops` (`compress_model` + `load_state_dict`) y una API `load_surgeried_model` del Hub de NeuralOps. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI; el formato `pytorch_model.bin` requiere reconstruir la topología comprimida antes de cargar los pesos.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | SST-2 Acc | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `bert-comp-kvtc-compressor-sst2` (este) | 24,5 M (comprimido) | No disponible | 89,22 % | MIT | Hugging Face |
| `google-bert/bert-base-uncased` (profesor) | 109,5 M | 512 tokens (estándar) | 91,63 % (declarado por el autor) | Apache 2.0 | Hugging Face |
| `distilbert-base-uncased-finetuned-sst-2-english` | 66 M | 512 tokens (estándar) | No disponible en esta información | Apache 2.0 | Hugging Face |
| `textattack/bert-base-uncased-SST-2` | 109,5 M | 512 tokens (estándar) | No disponible en esta información | Apache 2.0 | Hugging Face |

No se dispone de datos de benchmarks de los modelos alternativos en la información proporcionada, por lo que la comparación de rendimiento se limita al profesor declarado por el autor.

## Limitaciones y advertencias

- El modelo está especializado exclusivamente en clasificación de sentimiento binaria en inglés (SST-2); no es un modelo generativo ni de propósito general.
- La precisión declarada (89,22 %) no está verificada (`verified: false`) y procede del propio autor.
- La compresión en frío degrada la precisión al 80,73 %; el checkpoint publicado incluye el healing LoRA, pero su reproducibilidad depende de reconstruir correctamente la topología con `neuralops`.
- El rango k=64 falló (`FAIL_CRASH`) durante la evaluación, lo que indica inestabilidad del pipeline de compresión en determinados rangos.
- Riesgo de alucinación no aplica en sentido generativo, pero sí de clasificaciones erróneas en dominios distintos de SST-2 (por ejemplo, sentimiento en dominios especializados o texto informal).
- Sesgos conocidos: hereda los sesgos del corpus de preentrenamiento de BERT-base (texto web en inglés) y del dataset GLUE SST-2 (reseñas de películas).
- Limitación de idioma: solo inglés; el tokenizer `bert-base-uncased` no está optimizado para otros idiomas.
- Licencia MIT: permite uso comercial, pero el modelo base `google-bert/bert-base-uncased` tiene licencia Apache 2.0, que debe respetarse en la medida en que aplique.
- La carga requiere la librería `neuralops` y reconstruir el modelo comprimido antes de cargar el state dict; no es un checkpoint estándar de `transformers` cargable directamente.
- El repositorio tiene 43 descargas y 0 likes, lo que sugiere escasa validación por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/Hooshaai/bert-comp-kvtc-compressor-sst2
- Modelo base: https://huggingface.co/google-bert/bert-base-uncased
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Implementación del compresor: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/compression/kv_cache/kvtc_compressor.py
- Licencia NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset GLUE: https://huggingface.co/datasets/nyu-mll/glue
