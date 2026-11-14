# Hooshaai/bert-comp-rpca-compressor-sst2

## Resumen

`bert-comp-rpca-compressor-sst2` es un checkpoint de BERT-Base (`google-bert/bert-base-uncased`) comprimido mediante la técnica RPCA (Robust Principal Component Analysis) e implementado en la librería NeuralOps, desarrollada por el autor Hooshaai. El modelo parte del BERT-Base original de 109,48 millones de parámetros, afinado previamente sobre GLUE SST-2, y lo reduce físicamente a 45,79 millones de parámetros mediante una descomposición de bajo rango con rango k=128, logrando una compresión de 2,39x (-58,17% de parámetros). Sobre esa estructura comprimida se aplica un "healing" con LoRA (r=8, 50 pasos, lr=2e-4) para recuperar parte de la precisión perdida por la compresión.

El modelo resuelve un problema concreto de eficiencia en despliegue: reducir el coste computacional y de memoria de un clasificador BERT sin reentrenar desde cero. Es relevante para quienes necesitan servir clasificación de sentimiento en entornos con recursos limitados y quieren evaluar el compromiso entre ratio de compresión y precisión. No obstante, el resultado es modesto: la precisión final en GLUE SST-2 es del 72,71%, frente al 91,63% del modelo profesor original, una pérdida de 18,92 puntos porcentuales.

La ficha se centra en un checkpoint de clasificación de sentimiento binario (positivo/negativo) en inglés, con licencia MIT y un tamaño de repositorio de 0,1 GB. No es un modelo generativo ni conversacional: es un clasificador de texto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer BERT-Base (encoder, 12 capas, dimensión oculta D=768), comprimido con descomposición RPCA de bajo rango (k=128) y healing LoRA (r=8) |
| Parametros totales | 45.792.002 (checkpoint comprimido); modelo base original: 109.483.778 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (BERT-Base estándar: 512 tokens, no confirmado en la información proporcionada) |
| Tipos de cuantizacion | No disponible (el checkpoint se distribuye en `pytorch_model.bin`, sin variantes GGUF/cuantizadas) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | `pytorch_model.bin` (state dict serializado de PyTorch); tokenizer en `vocab.txt`, `tokenizer.json`, `tokenizer_config.json` |

## Arquitectura y entrenamiento

El modelo base es BERT-Base uncased: un transformer encoder de 12 capas con dimensión oculta 768 y 109.483.778 parámetros, preentrenado por Google y afinado sobre GLUE SST-2 (clasificación de sentimiento binaria). Sobre ese checkpoint afinado, NeuralOps aplica el compresor `RPCACompressor` (familia `low_rank`), que descompone cada matriz de pesos W = L + S, factorizando el componente de bajo rango L mediante `SVDLinear`. El rango seleccionado es k=128, lo que reduce el recuento de parámetros a 45.792.002 (-58,17%) y produce una ratio de compresión física de 2,391x.

Tras la compresión, si la precisión zero-shot cae más de 2,0 puntos con una reducción superior a 1,10x, NeuralOps aplica un "healing" con LoRA de rango r=8 durante 50 pasos con learning rate 2e-4 y un presupuesto de 45 segundos. La evaluación multi-rango (k=256, 128, 64, 32) se realizó físicamente sobre una NVIDIA GeForce RTX 3090 (24 GB) usando el split de validación de GLUE SST-2 (872 muestras). Llama la atención que el healing no es monótono: en k=256 la precisión curada (50,92%) es peor que la zero-shot (59,75%), lo que sugiere que el procedimiento de recuperación no está estabilizado en todos los rangos.

## Capacidades

- Clasificación de sentimiento binaria (positivo/negativo) en inglés, sobre el formato de GLUE SST-2.
- Clasificación de texto general de secuencia (pipeline `text-classification`), con dos etiquetas de salida.
- Inferencia sobre texto en inglés únicamente.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No dispone de modo "thinking", visión, audio ni generación de texto libre.
- Capacidad multilingüe: no (solo inglés).

## Casos de uso

- Moderación de comentarios en foros y redes: clasificar automáticamente la polaridad de comentarios en inglés para priorizar revisiones humanas, aprovechando el bajo coste de un modelo de 45,8 M de parámetros.
- Análisis de opiniones de producto: procesar reseñas en inglés y agregar sentimiento positivo/negativo por lote, con un modelo que cabe en memoria de GPU consumer.
- Enrutamiento de tickets de soporte: etiquetar la carga emocional de mensajes entrantes en inglés para dirigirlos a colas distintas, usando el pipeline estándar de `text-classification`.
- Filtrado previo en pipelines de datos: descartar o marcar documentos con sentimiento negativo antes de pasarlos a un modelo mayor, reduciendo el coste total del pipeline.
- Investigación sobre compresión de modelos: servir como referencia reproducible para comparar RPCA frente a otras técnicas de compresión (destilación, cuantización, poda) sobre BERT-Base.
- Docencia y experimentación: ejemplo ligero para demostrar el flujo de NeuralOps (compresión + LoRA healing) sin necesidad de hardware de gama alta.
- Clasificación en dispositivos con recursos limitados: al tener 45,8 M de parámetros y 87,5 MB de pesos, es viable en entornos edge donde un BERT-Base completo no cabría.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados, `verified: false`). Evaluación sobre GLUE SST-2, split de validación (872 muestras), en RTX 3090.

| Modelo / configuración | Ratio de compresión | Parámetros | Precisión SST-2 |
|---|---|---|---|
| Profesor (BERT-Base SST-2) | 1,00x | 109.483.778 | 91,63% |
| k=256 (zero-shot) | 1,63x | 67.034.882 | 59,75% |
| k=256 (LoRA healed) | 1,63x | 67.034.882 | 50,92% |
| k=128 (zero-shot) | 2,39x | 45.792.002 | 52,87% |
| **k=128 (LoRA healed, checkpoint publicado)** | **2,39x** | **45.792.002** | **72,71%** |
| k=64 (zero-shot) | 3,11x | 35.170.562 | 51,38% |
| k=64 (LoRA healed) | 3,11x | 35.170.562 | 49,08% |
| k=32 (zero-shot) | 3,67x | 29.859.842 | 49,43% |
| k=32 (LoRA healed) | 3,67x | 29.859.842 | 66,74% |

La precisión publicada en el model-index (72,71%) corresponde al checkpoint k=128 con healing LoRA. La diferencia frente al profesor es de -18,92 puntos porcentuales.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 (45,8 M de parámetros, ~183 MB de pesos) y ~87,5 MB en el checkpoint serializado; el consumo real incluye activaciones y tokenizer, pero es muy bajo.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM es suficiente; el autor evaluó sobre NVIDIA GeForce RTX 3090 (24 GB), pero es sobredimensionada para este modelo.
- Cabe en GPU consumer: sí, en tarjetas de gama baja (GTX 1650, RTX 3050, etc.) e incluso en CPU para volúmenes moderados.
- Opciones de despliegue: el checkpoint requiere reconstruir la topología con `neuralops.core.compression_pipeline.compress_model` antes de cargar el state dict; también existe la API `neuralops.hub.load_surgeried_model`. No se documentan variantes para vLLM, llama.cpp, Ollama ni TGI, ya que el formato es un state dict de PyTorch con topología comprimida no estándar.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Precisión SST-2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `bert-comp-rpca-compressor-sst2` (k=128) | 45,79 M | No disponible | 72,71% | MIT | Hugging Face |
| `google-bert/bert-base-uncased` (profesor SST-2) | 109,48 M | 512 tokens (estándar) | 91,63% (declarado por el autor) | Apache 2.0 | Hugging Face |
| `distilbert-base-uncased-finetuned-sst-2-english` | ~66 M | 512 tokens (estándar) | No disponible en la información | Apache 2.0 | Hugging Face |

La comparativa con DistilBERT es orientativa por tamaño y tarea; no se dispone de su precisión SST-2 en la información proporcionada, por lo que no se incluye cifra. El modelo comprimido ofrece un ahorro de parámetros frente al profesor, pero a costa de una pérdida sustancial de precisión.

## Limitaciones y advertencias

- Pérdida de precisión notable: 72,71% frente al 91,63% del profesor (-18,92 puntos). No es adecuado para producción donde se requiera alta exactitud.
- El healing LoRA no es consistente entre rangos: en k=256 y k=64 empeora la precisión zero-shot, lo que indica un procedimiento de recuperación inestable.
- Solo inglés: no soporta otros idiomas.
- Solo clasificación binaria de sentimiento; no es un modelo generativo ni conversacional.
- Riesgo de alucinación no aplica en sentido estricto (es un clasificador), pero sí de clasificaciones erróneas sistemáticas en dominios distintos de SST-2.
- Sesgos: no se documentan análisis de sesgo; al derivar de BERT-Base, hereda los sesgos del corpus de preentrenamiento original.
- Restricciones de licencia: MIT permite uso comercial, pero el modelo base BERT-Base es Apache 2.0; conviene revisar ambas licencias en producción.
- Requiere la librería NeuralOps y reconstrucción de topología antes de cargar los pesos; no es un checkpoint estándar de `transformers` cargable directamente.
- Los resultados de benchmark están marcados como no verificados (`verified: false`); deben tratarse como declaraciones del autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Hooshaai/bert-comp-rpca-compressor-sst2
- Modelo base: https://huggingface.co/google-bert/bert-base-uncased
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Implementación del compresor RPCA: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/compression/low_rank/rpca_compressor.py
- Licencia NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset GLUE SST-2: https://huggingface.co/datasets/nyu-mll/glue
