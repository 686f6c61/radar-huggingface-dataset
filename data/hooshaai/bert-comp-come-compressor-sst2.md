# Hooshaai/bert-comp-come-compressor-sst2

## Resumen

`Hooshaai/bert-comp-come-compressor-sst2` es un checkpoint de BERT-Base (`google-bert/bert-base-uncased`) afinado en GLUE SST-2 y posteriormente comprimido mediante el motor `CoMeCompressor` de la librería NeuralOps. El autor del repositorio es el usuario de Hugging Face Hooshaai, y la implementación subyacente pertenece al proyecto NeuralOps. No es un modelo de propósito general nuevo, sino una variante comprimida y "sanada" con LoRA de un BERT-Base estándar para clasificación de sentimiento binaria en inglés.

La relevancia del artefacto es metodológica: demuestra un pipeline de compresión física de modelos (layer shedding con adaptadores de interpolación de bajo rango entre capas retenidas no consecutivas) seguido de un ajuste LoRA de recuperación cuando la caída de precisión supera el 2 %. El checkpoint serializado corresponde al rango de compresión `k=32`, con 97.545.988 parámetros (una reducción del 10,90 % respecto a los 109.483.778 del BERT-Base original, ratio físico de 1,122x) y una precisión del 90,14 % en la validación de SST-2, frente al 91,63 % del modelo profesor.

El modelo está pensado para experimentación en compresión de modelos y evaluación de trade-offs precisión/tamaño, no como sustituto directo de BERT-Base en producción. La arquitectura base es un transformer encoder de 12 capas con dimensión oculta 768, contexto de 512 tokens y licencia MIT. El repositorio ocupa 0,2 GB y las descargas registradas son 43.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT-Base) con compresión CoMeCompressor: layer shedding y adaptadores de interpolación de bajo rango entre capas retenidas no consecutivas; recuperación LoRA `r=8` |
| Parametros totales | 97.545.988 (checkpoint comprimido, `k=32`); base original: 109.483.778 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens (heredada de BERT-Base) |
| Tipos de cuantizacion | no disponible (el repositorio distribuye pesos en `pytorch_model.bin`, sin variantes GGUF ni cuantizaciones publicadas) |
| Idiomas soportados | inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | `pytorch_model.bin` (state dict serializado de PyTorch), más `config.json`, `compression_summary.json` y activos del tokenizador `bert-base-uncased` |

## Arquitectura y entrenamiento

El modelo parte de `google-bert/bert-base-uncased`: un transformer encoder de 12 capas, dimensión oculta 768 y 109.483.778 parámetros. Sobre ese checkpoint afinado en GLUE SST-2 se aplica el compresor `CoMeCompressor` (familia `low_rank`, implementado en `neuralops/compression/low_rank/come_compressor.py`), que combina *layer shedding* con adaptadores de interpolación de bajo rango ("bridges") entre capas retenidas no consecutivas. El rango `k` controla la descomposición tipo SVD; si no se especifican `bridge_rank` o `sparsity`, se derivan de `k` mediante mapeos seguros. El checkpoint publicado usa `k=32` con `LoRA Recovery Applied: True`.

El proceso de recuperación se activa cuando la compresión zero-shot degrada la precisión más de 2,0 puntos con una reducción superior a 1,10x. En ese caso se aplica un ajuste LoRA dirigido con `r=8`, 50 pasos, `lr=2e-4` y un presupuesto de 45 segundos. La evaluación multi-rango se realizó físicamente en una NVIDIA GeForce RTX 3090 (24 GB) sobre las 872 muestras de validación de GLUE SST-2. El checkpoint `k=32` pasa de 84,63 % zero-shot a 90,14 % tras el healing LoRA, con una brecha de -1,49 puntos respecto al profesor. No se detalla en la información disponible la composición exacta del dataset de afinado más allá de GLUE SST-2, ni si hubo RLHF/DPO (no aplicable en un clasificador de este tipo).

## Capacidades

- Clasificación de sentimiento binaria (negativo/positivo) en inglés, con dos etiquetas de salida (`num_labels=2`).
- Razonamiento semántico limitado al encoder BERT-Base subyacente; no genera texto libre.
- No soporta tool calling ni function calling: es un modelo de clasificación, no un modelo generativo.
- No soporta agentes ni razonamiento multi-paso.
- Capacidades multilingües: únicamente inglés (vocabulario `bert-base-uncased`).
- No dispone de modo "thinking", visión ni audio.
- Reconstrucción programática del grafo comprimido mediante `neuralops.core.compression_pipeline.compress_model` antes de cargar los pesos.

## Casos de uso

- Evaluación de pipelines de compresión: sirve como referencia reproducible para medir el trade-off precisión/tamaño de `CoMeCompressor` frente a BERT-Base en SST-2, con telemetría completa en `compression_summary.json`.
- Análisis de sentimiento en reseñas de producto en inglés: clasificador binario directo con 90,14 % de precisión en validación SST-2, adecuado para prototipos y entornos con restricciones de memoria.
- Moderación de comentarios a pequeña escala: la ventana de 512 tokens permite procesar comentarios y fragmentos de texto cortos con latencia baja en GPU de consumo.
- Investigación en técnicas de *layer shedding* y adaptadores de bajo rango: el checkpoint permite comparar el comportamiento de los "bridges" entre capas retenidas frente al modelo denso original.
- Destilación y *healing* con LoRA: reproducible como caso de estudio de recuperación de precisión en 50 pasos y 45 segundos de presupuesto en una RTX 3090.
- Clasificación por lotes en pipelines de datos: al ser un modelo de 97,5 M de parámetros y ~186,2 MB de pesos, cabe en memoria de GPU modesta para tareas de etiquetado offline.
- Baseline en experimentos de *benchmarking* de compresión: comparación directa con los rangos `k=256`, `k=128` y `k=64` evaluados por el autor.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente):

| Rank (`k`) | Ratio fisico | Parametros comprimidos (reduccion) | Precision zero-shot | Precision tras healing | Delta vs profesor (91,63 %) |
|:---:|:---:|---:|---:|---:|---:|
| 256 | 1,04x | 104.928.003 (-4,2 %) | 91,40 % | 91,40 % | -0,23 % |
| 128 | 1,12x | 97.619.716 (-10,8 %) | 84,52 % | 89,56 % (LoRA) | -2,07 % |
| 64 | 1,12x | 97.570.564 (-10,9 %) | 84,52 % | 89,33 % (LoRA) | -2,30 % |
| **32** (publicado) | **1,12x** | **97.545.988 (-10,9 %)** | **84,63 %** | **90,14 % (LoRA)** | **-1,49 %** |

Evaluación sobre GLUE SST-2, split de validación (872 muestras), en NVIDIA GeForce RTX 3090 (24 GB). El *model-index* declara una única métrica: accuracy de 90,14 en GLUE SST-2 validation (no verificada).

## Requisitos de hardware

- VRAM estimada para inferencia: ~0,4 GB en fp32 para los 97,5 M de parámetros (el checkpoint pesa 186,2 MB); con overhead de activaciones y tokenizador, menos de 2 GB en la mayoría de configuraciones.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; el autor evaluó en NVIDIA GeForce RTX 3090 (24 GB).
- Cabe en GPU de consumo: sí, en RTX 3060, RTX 4060, RTX 4090, GTX 1660 y similares; también en CPU para inferencia por lotes pequeños.
- Opciones de despliegue: el pipeline requiere reconstruir el grafo comprimido con `neuralops.core.compression_pipeline.compress_model` y cargar el state dict con `strict=False`; no se documenta compatibilidad directa con vLLM, llama.cpp, Ollama ni TGI. El formato `pytorch_model.bin` es cargable con PyTorch y `transformers` tras la reconstrucción.
- Latencia y throughput: no disponibles en la información proporcionada. El único dato temporal es el presupuesto de 45 segundos para el ajuste LoRA de healing en RTX 3090.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | SST-2 (val) | Licencia | Disponibilidad |
|---|---:|---:|---:|---|---|
| `Hooshaai/bert-comp-come-compressor-sst2` (k=32) | 97,5 M | 512 | 90,14 % | MIT | Hugging Face |
| `google-bert/bert-base-uncased` (profesor, afinado SST-2) | 109,5 M | 512 | 91,63 % | Apache 2.0 | Hugging Face |
| `textattack/bert-base-uncased-SST-2` | 109,5 M | 512 | no disponible en la informacion | Apache 2.0 | Hugging Face |
| `distilbert-base-uncased-finetuned-sst-2-english` | 66 M | 512 | no disponible en la informacion | Apache 2.0 | Hugging Face |

La comparación con `textattack/bert-base-uncased-SST-2` y `distilbert-base-uncased-finetuned-sst-2-english` se ofrece como referencia de categoría; no se dispone de sus métricas en la información proporcionada, por lo que no se establece comparación numérica.

## Limitaciones y advertencias

- Solo inglés: el vocabulario y el afinado están restringidos a `bert-base-uncased` y SST-2 en inglés.
- Ventana de contexto de 512 tokens, insuficiente para documentos largos sin truncado o fragmentación.
- Es un clasificador binario de sentimiento, no un modelo generativo: no admite instrucciones, tool calling ni razonamiento multi-paso.
- Riesgo de alucinación no aplicable en el sentido generativo, pero sí de clasificaciones erróneas en dominios alejados de SST-2 (reseñas de películas); no se documenta calibración fuera de dominio.
- Sesgos heredados de BERT-Base y del corpus SST-2, no evaluados ni mitigados en la información disponible.
- La precisión declarada (90,14 %) no está verificada (`verified: false`) y procede del propio autor.
- Requiere la librería NeuralOps y una reconstrucción explícita del grafo comprimido antes de cargar los pesos; no es un checkpoint cargable directamente con `AutoModelForSequenceClassification.from_pretrained` sin ese paso.
- La licencia MIT permite uso comercial, pero el modelo base `bert-base-uncased` está bajo Apache 2.0; conviene revisar ambas compatibilidades en producción.
- El checkpoint publicado corresponde a un único rango (`k=32`); los demás rangos evaluados no se distribuyen en el repositorio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Hooshaai/bert-comp-come-compressor-sst2
- Modelo base: https://huggingface.co/google-bert/bert-base-uncased
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Licencia NeuralOps (MIT): https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Implementación del compresor: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/compression/low_rank/come_compressor.py
- Dataset GLUE SST-2: https://huggingface.co/datasets/nyu-mll/glue
