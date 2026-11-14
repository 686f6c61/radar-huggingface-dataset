# Hooshaai/bert-comp-gfws-sst2

## Resumen

`bert-comp-gfws-sst2` es un checkpoint comprimido y "curado" con LoRA de `google-bert/bert-base-uncased`, afinado para clasificación de sentimiento binaria en GLUE SST-2. Lo publica el usuario Hooshaai (el README referencia el repositorio de la librería NeuralOps de tahamajs) como parte de un "Compressed & LoRA-Healed Model Zoo" que demuestra la técnica de compresión SVD ponderada por Fisher/covarianza (`GFWSCompressor`, clave de registro `gfws`) implementada en NeuralOps.

El modelo parte de un BERT-base de 109.483.778 parámetros y aplica una descomposición de bajo rango con rango seleccionado `k=256`, lo que reduce el recuento de parámetros a 67.016.450 (un 38,79% menos, ratio de compresión física de 1,634x). Tras la compresión en frío ("zero-shot"), que degrada la precisión en SST-2 del 91,63% del profesor al 65,94%, se aplica un "healing" con LoRA (`r=8`, 50 pasos, `lr=2e-4`, presupuesto de 45 segundos) que recupera la precisión hasta el 77,64% en el split de validación.

Es relevante ahora como ejemplo reproducible de compresión de modelos con recuperación selectiva vía LoRA: la model card documenta una evaluación Pareto completa en cuatro rangos (`k=256, 128, 64, 32`) sobre una RTX 3090, con telemetría serializada en `compression_summary.json`. No es un modelo de propósito general: es una pieza de investigación sobre eficiencia y compresión, con licencia MIT y solo idioma inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder BERT-base (12 capas, dimensión oculta D=768), con compresión SVD de bajo rango (GFWS) y adaptadores LoRA de healing |
| Parametros totales | 67.016.450 (checkpoint comprimido y curado); modelo base original: 109.483.778 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (el modelo base BERT-base-uncased soporta 512 tokens, pero no se declara explícitamente en esta ficha) |
| Tipos de cuantizacion | no disponible (el checkpoint se distribuye con factores de bajo rango y adaptadores LoRA ya integrados; no se documentan cuantizaciones GGUF/INT8) |
| Idiomas soportados | inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | `pytorch_model.bin` (state dict serializado de PyTorch); requiere reconstrucción de la topología con NeuralOps antes de cargar |

## Arquitectura y entrenamiento

El modelo base es `google-bert/bert-base-uncased`: un transformer encoder de 12 capas, D=768, preentrenado de forma auto-supervisada (MLM) y afinado posteriormente en GLUE SST-2, alcanzando un 91,63% de precisión en validación (línea base "teacher"). Sobre ese checkpoint, NeuralOps aplica `GFWSCompressor` (familia `svd`, variante Fisher-weighted / Covariance-weighted SVD, registrada como `gfws` y `gfws_d`), que descompone las matrices de pesos en factores de bajo rango preservando las direcciones de mayor importancia según la información de Fisher o de covarianza de activaciones.

La compresión física se materializa en un rango `k=256` (ratio 1,63x, −38,8% de parámetros). Como la compresión en frío degrada la precisión al 65,94%, se aplica un healing con LoRA de rango 8 durante 50 pasos con `lr=2e-4` y un presupuesto de 45 segundos, que eleva la precisión al 77,64%. La model card documenta además barridos Pareto en `k=128` (ratio 2,39x, 45.782.786 parámetros, precisión curada 72,25%), `k=64` (3,11x, 35.165.954 parámetros, 73,39%) y `k=32` (3,67x, 29.857.538 parámetros, 68,46%). Es destacable que el healing con LoRA recupera más precisión en rangos más agresivos (k=64 supera a k=128), lo que sugiere que el rango óptimo evaluado no es monótono y que el pipeline selecciona `k=256` como "showcase" por equilibrio entre ratio y precisión.

## Capacidades

- Clasificación de sentimiento binaria (positivo/negativo) en inglés, específicamente sobre el formato de GLUE SST-2.
- Inferencia de texto corto a nivel de frase (típico de SST-2), no generación de texto libre.
- No soporta tool calling ni function calling: es un modelo de clasificación, no un LLM conversacional.
- No soporta agentes ni razonamiento multi-paso.
- Capacidades multilingües limitadas al inglés (`en`).
- No dispone de modo "thinking", visión, audio ni otras modalidades.
- Sirve como artefacto de referencia para reproducir pipelines de compresión SVD + LoRA healing con NeuralOps.

## Casos de uso

- Análisis de sentimiento en reseñas de producto: el modelo clasifica frases cortas en positivo/negativo, adecuado para procesar grandes volúmenes de reseñas con un coste de inferencia reducido respecto al BERT-base original (38,8% menos de parámetros).
- Moderación de comentarios en foros y redes: filtrado rápido de tono negativo en textos breves en inglés, con un throughput superior al del profesor gracias a la reducción de parámetros.
- Enrutamiento de tickets de soporte: clasificación de la polaridad del mensaje inicial del usuario para priorizar quejas frente a consultas neutras o positivas, usando el modelo como primera etapa de un pipeline.
- Investigación en compresión de modelos: punto de partida reproducible para comparar técnicas SVD (GFWS vs. otras) y estrategias de healing con LoRA sobre un mismo profesor y dataset.
- Docencia y experimentación: ejemplo didáctico de cómo la compresión degrada la precisión y cómo el ajuste fino ligero la recupera, con telemetría completa en `compression_summary.json`.
- Despliegue en entornos con recursos limitados: al ocupar 127,9 MB de pesos y 67M de parámetros, puede ejecutarse en CPU o en GPUs de gama baja para tareas de clasificación por lotes.
- Benchmarking interno de pipelines de eficiencia: servir como baseline comprimido frente al BERT-base completo en pruebas de latencia/throughput en hardware concreto (RTX 3090 documentada).

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados, `verified: false`):

| Modelo / variante | Ratio compresión | Parámetros | Zero-shot SST-2 | Curado (LoRA) SST-2 | Paridad vs. profesor (91,63%) |
|---|---:|---:|---:|---:|---:|
| Profesor BERT-base-uncased | 1,00x | 109.483.778 | — | 91,63% | 0,00% |
| `k=256` (checkpoint publicado) | 1,63x | 67.016.450 | 65,94% | 77,64% | −13,99% |
| `k=128` | 2,39x | 45.782.786 | 53,33% | 72,25% | −19,38% |
| `k=64` | 3,11x | 35.165.954 | 49,08% | 73,39% | −18,24% |
| `k=32` | 3,67x | 29.857.538 | 49,08% | 68,46% | −23,17% |

Evaluación realizada sobre el split de validación de GLUE SST-2 (872 muestras) en una NVIDIA GeForce RTX 3090 (24 GB). No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: muy reducida; el checkpoint pesa 127,9 MB y tiene 67M de parámetros, por lo que cabe holgadamente en GPUs de 4-8 GB e incluso en CPU.
- GPU recomendadas: cualquier GPU moderna; el autor documenta evaluación en RTX 3090 (24 GB), pero el modelo es sobredimensionado para ese hardware.
- Cabe en GPUs de consumo: sí, en cualquier GPU con al menos ~2 GB de VRAM libre (GTX 1650, RTX 3050, RTX 4060, etc.), e incluso en CPU para lotes pequeños.
- Opciones de despliegue: el modelo requiere reconstruir la topología con `neuralops` (`compress_model` con `method: "gfws"`, `rank: 256`) antes de cargar el `pytorch_model.bin`; no se documenta compatibilidad directa con vLLM, llama.cpp, Ollama o TGI (son para LLMs generativos y este es un clasificador BERT).
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | SST-2 (val) | Licencia | Disponibilidad |
|---|---:|---|---:|---|---|
| `Hooshaai/bert-comp-gfws-sst2` (este) | 67.016.450 | no disponible (base BERT: 512) | 77,64% | MIT | Hugging Face (42 descargas) |
| `google-bert/bert-base-uncased` (profesor) | 109.483.778 | 512 tokens | 91,63% (declarado por el autor) | Apache 2.0 | Hugging Face |
| `distilbert-base-uncased-finetuned-sst-2-english` | ~66M | 512 tokens | ~91% (referencia pública) | Apache 2.0 | Hugging Face |
| `textattack/bert-base-uncased-SST-2` | 109M | 512 tokens | ~92% (referencia pública) | Apache 2.0 | Hugging Face |

La comparación directa con DistilBERT es la más pertinente: ambos rondan los 66-67M de parámetros, pero el modelo de este repositorio obtiene 77,64% frente al ~91% de DistilBERT afinado en SST-2, una diferencia de más de 13 puntos. La ventaja del checkpoint de NeuralOps no es la precisión sino la reproducibilidad del pipeline de compresión y la telemetría asociada.

## Limitaciones y advertencias

- Precisión notablemente inferior al profesor: 77,64% frente a 91,63%, una pérdida de 13,99 puntos. No es adecuado para producción donde la precisión sea crítica.
- El healing con LoRA se limita a 50 pasos y 45 segundos; no se documenta una búsqueda exhaustiva de hiperparámetros ni validación cruzada.
- El checkpoint requiere código específico de NeuralOps para reconstruir la topología antes de cargar los pesos; no es un `transformers` estándar de un solo paso (`from_pretrained` directo no funciona sin `compress_model`).
- Solo soporta inglés y la tarea SST-2 (sentimiento binario); no es un modelo generalista.
- Riesgo de alucinación no aplicable en sentido estricto (es un clasificador), pero sí de clasificaciones erróneas en dominios distintos de SST-2.
- Sesgos heredados de `bert-base-uncased` y de los datos de GLUE SST-2 (reseñas de cine), incluyendo posibles sesgos de género, raza y dominio.
- La licencia MIT aplica al artefacto publicado; conviene revisar la licencia del modelo base (Apache 2.0) y de los datos (GLUE) para uso comercial.
- El autor declara `verified: false` en el resultado de benchmark; no hay validación independiente.
- El repositorio tiene 42 descargas y 0 likes en el momento de la consulta: adopción muy baja, sin comunidad que reporte problemas.
- El README contiene una URL de ejemplo (`tahamajs/bert-comp-gfws-sst2`) distinta del ID real (`Hooshaai/bert-comp-gfws-sst2`); verificar el ID al descargar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Hooshaai/bert-comp-gfws-sst2
- Modelo base: https://huggingface.co/google-bert/bert-base-uncased
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Licencia NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Implementación del compresor GFWS: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/compression/svd/gfws_d_compressor.py
- Dataset GLUE SST-2: https://huggingface.co/datasets/nyu-mll/glue
