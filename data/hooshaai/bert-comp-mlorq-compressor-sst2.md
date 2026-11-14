# Hooshaai/bert-comp-mlorq-compressor-sst2

## Resumen

`bert-comp-mlorq-compressor-sst2` es un checkpoint de BERT-Base comprimido físicamente y publicado por el autor Hooshaai dentro del ecosistema NeuralOps. Parte de `google-bert/bert-base-uncased` (109.483.778 parámetros, 12 capas, dimensión oculta 768) afinado previamente sobre GLUE SST-2, y aplica el motor `MLoRQCompressor` (Multi-Layer Optimal Rank and Quantization under Memory Budget) para reducir el modelo a 24.549.122 parámetros, lo que supone una compresión física de 4,46x y una reducción del 77,58% de los pesos. El checkpoint publicado corresponde al rango `k=32`, seleccionado por el autor como configuración de escaparate.

El problema que aborda es la reducción de huella de modelos de clasificación de texto ya entrenados sin degradar la precisión downstream. Según la model card, el modelo profesor alcanza un 91,63% de accuracy en la partición de validación de SST-2 y el modelo comprimido mantiene un 91,86%, con un delta de paridad de +0,23% respecto al profesor. Es relevante para escenarios de despliegue con presupuesto de memoria ajustado (edge, contenedores pequeños, inferencia en CPU) donde un BERT completo resulta sobredimensionado.

La ficha se limita a lo declarado por el autor: los datos de compresión y evaluación proceden de la model card y el model-index, y no se han verificado de forma independiente (el campo `verified` del benchmark es `false`). El repositorio ocupa 0,2 GB y la licencia es MIT.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT-Base), comprimido con `MLoRQCompressor` (familia `low_rank`) |
| Parámetros totales | 24.549.122 (modelo comprimido); base original: 109.483.778 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (el modelo base BERT-Base soporta 512 tokens, pero la model card no lo declara explícitamente) |
| Tipos de cuantización | No disponible (el compresor combina rango bajo y cuantización bajo presupuesto de memoria, sin detallar formatos) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | `pytorch_model.bin` (state dict serializado de PyTorch); assets de tokenizer en `vocab.txt`, `tokenizer.json`, `tokenizer_config.json` |
| Tarea | Clasificación de texto (análisis de sentimiento binario, SST-2) |
| Ratio de compresión | 4,46x (reducción del 77,58% de parámetros) |
| Rango de compresión (`k`) | 32 |
| LoRA healing aplicado | No (`LoRA Recovery Applied: False` en el checkpoint publicado) |
| Tamaño del repo | 0,2 GB |
| Pesos empaquetados | 168,6 MB |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer encoder BERT-Base estándar de 12 capas y dimensión oculta 768, preentrenado por Google y afinado sobre GLUE SST-2. Sobre ese modelo, NeuralOps aplica `MLoRQCompressor`, un compresor de rango bajo que selecciona rangos óptimos por capa bajo una restricción de presupuesto de memoria y combina descomposición de rango bajo con cuantización. El resultado es un state dict físicamente más pequeño (24,5 M de parámetros) que se reconstruye cargando la topología comprimida sobre el modelo base y aplicando después los pesos comprimidos con `load_state_dict(strict=False)`.

El proceso de evaluación descrito en la model card se realizó sobre una NVIDIA GeForce RTX 3090 (24 GB) usando la partición de validación de GLUE SST-2 (872 muestras). El autor evalúa cuatro rangos (`k=256, 128, 64, 32`); cuando la compresión zero-shot degrada la accuracy más de 2,0 puntos con una reducción superior a 1,10x, se aplica un *LoRA healing* dirigido con `r=8`, 50 pasos y `lr=2e-4` en un presupuesto de 45 segundos. En el checkpoint publicado (`k=32`) no se aplicó healing, según la propia model card. El rango `k=128` aparece como `FAIL_CRASH` en la tabla de evaluación, sin más detalle.

## Capacidades

- Clasificación de sentimiento binaria (negativo/positivo) sobre texto en inglés, especializada en el dominio de reseñas de SST-2.
- Inferencia de texto corto a moderado con el tokenizer `bert-base-uncased` estándar.
- Reconstrucción programática mediante la API de NeuralOps (`compress_model` + carga del state dict) o mediante `load_surgeried_model` del hub de NeuralOps.
- No soporta generación de texto, razonamiento multi-paso, tool calling ni function calling: es un clasificador, no un modelo generativo.
- No dispone de capacidades multimodales (visión, audio) ni de modo *thinking*.
- Multilingüismo: únicamente inglés.

## Casos de uso

- Moderación de comentarios y reseñas en inglés: el modelo clasifica polaridad positiva o negativa con un coste de memoria muy inferior al BERT completo, adecuado para desplegar en contenedores pequeños o funciones serverless con límite de RAM.
- Enrutamiento de tickets de soporte: usar la predicción de sentimiento como señal auxiliar para priorizar quejas negativas dentro de un pipeline de atención al cliente, ejecutando el modelo en CPU sin GPU dedicada.
- Análisis de opiniones a escala en lotes: procesar grandes volúmenes de reseñas de producto o App Store en inglés con un throughput alto gracias a los 24,5 M de parámetros y a la reducción de memoria frente al profesor.
- Prefiltrado en sistemas de recomendación: puntuar sentimiento de reseñas para agregar señales de calidad antes de un ranking más costoso, reduciendo el coste computacional del paso previo.
- Despliegue en dispositivos con recursos limitados: al ocupar 168,6 MB de pesos, encaja en entornos edge o en instancias CPU pequeñas donde un BERT-Base de 109 M de parámetros resulta excesivo.
- Evaluación comparativa de técnicas de compresión: sirve como referencia reproducible para investigadores que quieran medir el impacto de `MLoRQCompressor` frente a poda, destilación o cuantización sobre una tarea estándar como SST-2.
- Prototipado rápido de clasificadores de sentimiento: la API de una línea de NeuralOps permite integrar el modelo en notebooks y scripts de experimentación con mínima configuración.

## Benchmarks y rendimiento

Datos declarados por el autor en el model-index y la model card (no verificados de forma independiente; `verified: false`).

| Modelo | Dataset / split | Métrica | Valor |
|---|---|---|---|
| `bert-comp-mlorq-compressor-sst2` (k=32) | GLUE SST-2, validation (872 muestras) | Accuracy | 91,86% |
| Profesor BERT-Base SST-2 (referencia del autor) | GLUE SST-2, validation | Accuracy | 91,63% |
| Delta de paridad frente al profesor | — | Accuracy | +0,23% |

Evaluación multi-rango declarada por el autor:

| Rango (`k`) | Ratio físico | Parámetros comprimidos | Zero-shot Acc | Acc con healing | Paridad vs profesor |
|:---:|:---:|---:|---:|---:|---:|
| 256 | 4,46x | 24.549.122 (-77,6%) | 91,86% | 91,86% | +0,23% |
| 128 | — | — | `FAIL_CRASH` | — | — |
| 64 | 4,46x | 24.549.122 (-77,6%) | 91,86% | 91,86% | +0,23% |
| 32 (publicado) | 4,46x | 24.549.122 (-77,6%) | 91,86% | 91,86% | +0,23% |

No se han publicado en la información disponible resultados de otros benchmarks (MMLU, HumanEval, GSM8K u otros) para este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: muy reducida; con 24,5 M de parámetros en fp32 el modelo ocupa aproximadamente 98 MB, y los pesos empaquetados son de 168,6 MB (incluye buffers y factores de la topología comprimida). Cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: no requiere GPU; puede ejecutarse en CPU. Para lotes grandes, cualquier GPU moderna (RTX 3060, RTX 4090, A100, H100) sirve sin cuello de botella de memoria.
- Cabe en GPU consumer: sí, en todas las GPU consumer actuales, e incluso en iGPU y entornos sin GPU dedicada.
- Opciones de despliegue: la vía documentada es la librería `neuralops` (reconstrucción con `compress_model` y carga del state dict) o la API `load_surgeried_model`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, ya que el formato empaquetado es un state dict de PyTorch con topología comprimida propia.
- Latencia y throughput: no disponibles en la información proporcionada. El autor cita un presupuesto de 45 segundos para el proceso de LoRA healing, pero no publica cifras de latencia de inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | SST-2 (validation) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `bert-comp-mlorq-compressor-sst2` (k=32) | 24,5 M (comprimido) | No disponible | 91,86% (declarado) | MIT | Hugging Face (39 descargas) |
| `google-bert/bert-base-uncased` (profesor) | 109,5 M | 512 tokens | 91,63% (referencia del autor) | Apache 2.0 | Hugging Face |
| DistilBERT-base-uncased | No disponible en la información | No disponible | No disponible en la información | Apache 2.0 | Hugging Face |
| ALBERT-base-v2 | No disponible en la información | No disponible | No disponible en la información | Apache 2.0 | Hugging Face |

La comparación con alternativas de compresión (DistilBERT, ALBERT) no puede completarse con datos de esta ficha porque la información proporcionada no incluye sus resultados en SST-2 ni sus recuentos exactos de parámetros. La única comparación con cifras es frente al profesor BERT-Base, donde el modelo comprimido declara una accuracy ligeramente superior con un 77,6% menos de parámetros.

## Limitaciones y advertencias

- Modelo especializado exclusivamente en clasificación de sentimiento binaria en inglés sobre el dominio de SST-2; no es un modelo generativo ni un asistente conversacional.
- Los resultados de accuracy (91,86%) son declarados por el autor y no han sido verificados de forma independiente (`verified: false` en el model-index).
- El rango `k=128` aparece como `FAIL_CRASH` en la tabla del autor, lo que sugiere inestabilidad en algunas configuraciones de compresión; conviene validar el checkpoint en el pipeline propio antes de producción.
- La carga requiere reconstruir primero la topología comprimida con la librería `neuralops` y usar `strict=False` al cargar el state dict; no es un checkpoint estándar de `transformers` cargable con `from_pretrained` directamente.
- Riesgo de alucinación no aplica en sentido estricto (es un clasificador), pero sí existe riesgo de clasificaciones erróneas en dominios distintos de reseñas de cine, por posible desviación de distribución.
- Sesgos: no se documentan análisis de sesgo; al derivar de BERT-Base, hereda los sesgos de su corpus de preentrenamiento.
- Limitaciones de idioma: solo inglés; el tokenizer `bert-base-uncased` no está pensado para otros idiomas.
- Licencia MIT, que permite uso comercial, pero el modelo base `google-bert/bert-base-uncased` está bajo Apache 2.0 y la librería NeuralOps tiene su propia licencia enlazada en el repositorio de GitHub; conviene revisar la compatibilidad en despliegues comerciales.
- El repositorio tiene 39 descargas y 0 likes, señal de adopción muy baja y escasa validación por parte de la comunidad.
- El enlace de la model card apunta a `tahamajs/bert-comp-mlorq-compressor-sst2`, mientras que el ID del repositorio es `Hooshaai/bert-comp-mlorq-compressor-sst2`; verificar la ruta correcta antes de integrar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Hooshaai/bert-comp-mlorq-compressor-sst2
- Modelo base: https://huggingface.co/google-bert/bert-base-uncased
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Implementación del compresor: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/compression/low_rank/mlorq_compressor.py
- Licencia NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset GLUE SST-2: https://huggingface.co/datasets/nyu-mll/glue
- Paper, blog o demo adicionales: no disponibles en la información proporcionada.
