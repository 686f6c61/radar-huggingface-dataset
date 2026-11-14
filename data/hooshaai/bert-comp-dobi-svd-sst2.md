# Hooshaai/bert-comp-dobi-svd-sst2

## Resumen

`bert-comp-dobi-svd-sst2` es un checkpoint de BERT-Base comprimido físicamente mediante la técnica `dobi_svd` (familia `svd`) de la librería NeuralOps, y posteriormente "sanado" con adaptadores LoRA de bajo rango. Parte de `google-bert/bert-base-uncased` (109.483.778 parámetros, 12 capas, dimensión oculta 768) afinado previamente sobre GLUE SST-2, y se serializa en el rango Pareto `k=64`, lo que reduce el número de parámetros a 35.170.562 (un 67,88% menos, ratio de compresión física de 3,113x).

El modelo resuelve un problema muy concreto: explorar hasta qué punto se puede comprimir un encoder BERT sin colapsar su rendimiento en clasificación de sentimiento, y documentar el compromiso entre ratio de compresión y precisión. El autor publica una evaluación multi-rango (k=256, 128, 64, 32) sobre la partición de validación de GLUE SST-2 (872 muestras), medida en una NVIDIA GeForce RTX 3090 de 24 GB, con y sin LoRA healing.

Es relevante ahora porque forma parte de un zoo de modelos comprimidos (NeuralOps Compressor Zoo) que prioriza artefactos reproducibles y telemetría legible por máquina (`compression_summary.json`), más que un modelo listo para producción. El resultado del checkpoint publicado es modesto: 64,22% de accuracy en SST-2 frente al 91,63% del profesor original, con una licencia MIT que facilita su reutilización experimental.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder BERT-Base (12 capas, dimensión oculta 768), comprimido mediante SVD de bajo rango (`dobi_svd`) + adaptadores LoRA de recuperación |
| Parametros totales | 35.170.562 (checkpoint comprimido, k=64) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la información proporcionada (el modelo base BERT-Base admite 512 tokens, pero el autor no lo declara explícitamente para este checkpoint) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | `pytorch_model.bin` (state dict serializado de PyTorch), más `config.json`, `compression_summary.json` y assets del tokenizador `bert-base-uncased` |

## Arquitectura y entrenamiento

El modelo base es `google-bert/bert-base-uncased`, un transformer encoder de 12 capas y 768 dimensiones ocultas con 109.483.778 parámetros, afinado sobre GLUE SST-2. Sobre ese checkpoint, NeuralOps aplica el compresor `dobi_svd` (implementado en `neuralops/compression/svd/dobi_svd.py`), que aproxima las matrices de pesos mediante descomposición en valores singulares truncada al rango `k=64`, generando una topología comprimida físicamente (no una máscara dispersa): el recuento de parámetros baja a 35.170.562.

Cuando la compresión zero-shot degrada la accuracy más de 2,0 puntos con una reducción superior a 1,10x, el pipeline aplica "LoRA healing": adaptadores de rango `r=8` entrenados durante 50 pasos con `lr=2e-4` y un presupuesto de 45 segundos. En el rango k=64, el modelo pasa de 51,38% (zero-shot) a 64,22% (con LoRA). El autor no documenta el número de tokens de entrenamiento del afinado original sobre SST-2 ni la composición exacta del dataset más allá de la referencia a `nyu-mll/glue` (config `sst2`). No se menciona RLHF ni DPO, lo cual es coherente con una tarea de clasificación.

## Capacidades

- Clasificación de sentimiento binaria (0 = negativo, 1 = positivo) sobre texto en inglés, heredada del afinado en GLUE SST-2.
- Inferencia sobre la topología comprimida reconstruida con `compress_model` y carga del state dict con `strict=False`.
- Carga directa desde el Hub mediante la API `load_surgeried_model` de NeuralOps, que devuelve modelo y tokenizador en una línea.
- Evaluación multi-rango reproducible: el repositorio incluye telemetría de los rangos k=256, 128, 64 y 32 en `compression_summary.json`.
- No soporta tool calling, function calling, razonamiento multi-paso, agentes, visión, audio ni modo "thinking"; es un encoder de clasificación, no un modelo generativo.
- Capacidad multilingüe limitada al inglés, dado el vocabulario `bert-base-uncased`.

## Casos de uso

- **Investigación en compresión de modelos**: sirve como punto de referencia reproducible para comparar técnicas SVD de bajo rango frente a poda, destilación o cuantización, gracias a la telemetría multi-rango incluida y a los scripts de reconstrucción documentados.
- **Prototipado de clasificadores de sentimiento de bajo coste**: con 35,17 millones de parámetros y un peso de 67,2 MB, cabe en entornos con memoria limitada donde un BERT-Base completo no sería viable, aceptando la pérdida de precisión (64,22% frente a 91,63%).
- **Docencia y experimentación con LoRA healing**: el checkpoint permite reproducir el flujo completo (compresión zero-shot, detección de caída de accuracy, entrenamiento de adaptadores r=8 en 45 segundos) en una sola GPU consumer.
- **Evaluación de pipelines NeuralOps en CI**: la API `load_surgeried_model` y el formato `compression_summary.json` facilitan tests automatizados de carga, reconstrucción y métricas en pipelines de integración continua.
- **Análisis del compromiso precisión/compresión**: los cuatro rangos publicados permiten estudiar curvas Pareto empíricas en una tarea estándar (SST-2) sin necesidad de reentrenar desde cero.
- **Base para afinado posterior en dominios específicos**: al ser un encoder comprimido con licencia MIT, puede reafinarse sobre datasets propios de clasificación binaria cuando el presupuesto de cómputo o memoria es reducido, siempre que se asuma la degradación inicial.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (no verificados, `verified: false`):

| Modelo / rango | Ratio físico | Parámetros (reducción) | SST-2 zero-shot | SST-2 con LoRA | Paridad vs profesor (91,63%) |
|---|---:|---:|---:|---:|---:|
| Profesor (`bert-base-uncased` SST-2) | 1,00x | 109.483.778 | 91,63% | — | 0,00% |
| `k=256` | 2,39x | 45.792.002 (-58,2%) | 52,41% | 50,92% | -40,71% |
| `k=128` | 2,39x | 45.792.002 (-58,2%) | 52,41% | 50,92% | -40,71% |
| `k=64` (publicado) | 3,11x | 35.170.562 (-67,9%) | 51,38% | 64,22% | -27,41% |
| `k=32` | 3,67x | 29.859.842 (-72,7%) | 49,77% | 65,83% | -25,80% |

Evaluación realizada sobre la partición de validación de GLUE SST-2 (872 muestras) en una NVIDIA GeForce RTX 3090 de 24 GB. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 35,17 millones de parámetros en fp32 el peso ronda los 140 MB, y el artefacto empaquetado ocupa 67,2 MB, por lo que la inferencia cabe holgadamente en cualquier GPU consumer con 4 GB o más.
- GPU recomendadas: el autor valida en NVIDIA GeForce RTX 3090 (24 GB); cualquier GPU con al menos 4-6 GB de VRAM es suficiente para inferencia en fp32 o fp16.
- Cabe en GPU consumer: sí, en tarjetas como RTX 3060, RTX 4060, RTX 4090 o equivalentes, e incluso en CPU para lotes pequeños.
- Opciones de despliegue: la carga estándar requiere `transformers` más la librería `neuralops` para reconstruir la topología comprimida (`compress_model` con `{"method": "dobi_svd", "rank": 64}`) y cargar el state dict con `strict=False`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI en la información proporcionada.
- Latencia y throughput: no disponibles. El autor solo reporta el presupuesto de 45 segundos para el entrenamiento LoRA de healing en RTX 3090, no métricas de inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | SST-2 (val) | Licencia | Disponibilidad |
|---|---:|---|---:|---|---|
| `Hooshaai/bert-comp-dobi-svd-sst2` (k=64) | 35.170.562 | No disponible | 64,22% | MIT | Hugging Face (47 descargas) |
| `google-bert/bert-base-uncased` afinado en SST-2 (profesor) | 109.483.778 | 512 tokens (modelo base) | 91,63% | Apache 2.0 (modelo base) | Hugging Face |
| `distilbert-base-uncased-finetuned-sst-2-english` | ~66 millones | 512 tokens | No disponible en esta ficha | Apache 2.0 | Hugging Face |

La comparación con DistilBERT se ofrece como referencia de categoría (encoder comprimido para clasificación), pero no se dispone de su métrica SST-2 en la información proporcionada, por lo que no se establece una comparación numérica directa. No se han identificado otros modelos comparables documentados en la búsqueda.

## Limitaciones y advertencias

- Pérdida de accuracy severa: 64,22% frente al 91,63% del profesor, una caída de 27,41 puntos. No es adecuado para producción sin un reafinado adicional y una validación exhaustiva.
- El resultado declarado figura como `verified: false` en el model-index; conviene reproducirlo antes de tomar decisiones.
- El autor no documenta sesgos conocidos del checkpoint comprimido; los sesgos del `bert-base-uncased` original (corpus inglés, predominantemente web) pueden persistir o amplificarse tras la compresión.
- Riesgo de alucinación no aplica en sentido generativo, pero sí de clasificaciones erróneas sistemáticas en dominios distintos de SST-2.
- Idioma limitado al inglés; el tokenizador `bert-base-uncased` no cubre adecuadamente otros idiomas.
- La licencia MIT permite uso comercial, pero el modelo base `google-bert/bert-base-uncased` se distribuye bajo Apache 2.0; conviene revisar ambas licencias en despliegues comerciales.
- Requiere la librería `neuralops` y una reconstrucción manual de la topología comprimida antes de cargar los pesos; no es un checkpoint cargable directamente con `from_pretrained` estándar de `transformers`.
- El repositorio tiene 47 descargas y 0 likes, lo que indica una validación comunitaria muy limitada.
- No hay información sobre cuantización, latencia ni throughput, lo que dificulta planificar despliegues en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Hooshaai/bert-comp-dobi-svd-sst2
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Licencia NeuralOps (MIT): https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Implementación del compresor `dobi_svd`: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/compression/svd/dobi_svd.py
- Modelo base: https://huggingface.co/google-bert/bert-base-uncased
- Dataset GLUE SST-2: https://huggingface.co/datasets/nyu-mll/glue
