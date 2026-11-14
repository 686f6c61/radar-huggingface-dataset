# Hooshaai/bert-comp-gptq-sst2

## Resumen

`bert-comp-gptq-sst2` es un checkpoint de `google-bert/bert-base-uncased` afinado para clasificación de sentimiento en GLUE SST-2 y procesado con el motor `GPTQCompressor` de la librería NeuralOps. El modelo lo publica el usuario Hooshaai (el repositorio referencia el proyecto NeuralOps de `tahamajs`) como parte de un "Compressor Zoo": una colección de checkpoints que documentan el resultado de distintas técnicas de compresión sobre BERT-Base. La arquitectura subyacente es un transformer encoder de 12 capas con dimensión oculta 768 y 109.483.778 parámetros, entrenado originalmente con enmascarado de tokens y adaptado aquí a una cabeza de clasificación binaria de 2 etiquetas.

El interés de esta ficha no está en el modelo en sí (BERT-Base es un baseline sobradamente conocido), sino en lo que ilustra sobre compresión de modelos: el checkpoint se presenta con "rank k=32", pero la tabla de compresión del autor indica un ratio físico de 1.00x y una reducción de parámetros del 0,0 %, es decir, GPTQ no produjo aquí una reducción física de tamaño. La precisión final en validación de SST-2 es 90,48 % frente al 91,63 % del modelo teacher, una pérdida de 1,15 puntos porcentuales. Es, por tanto, más una pieza de telemetría de un pipeline de compresión que un modelo desplegable con ventajas de eficiencia.

El modelo es relevante para quien investiga cuantización y pipelines de compresión (GPTQ, LoRA healing, evaluación Pareto multi-rank), no para quien busca un clasificador de sentimiento listo para producción: el formato de pesos es un `pytorch_model.bin` que requiere reconstruir la topología con NeuralOps antes de cargar el `state_dict`, y el pipeline está etiquetado como `text-classification` con soporte exclusivo de inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT-Base), 12 capas, dimensión oculta 768 |
| Parametros totales | 109.483.778 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (BERT-Base admite hasta 512 tokens; no confirmado en la información) |
| Tipos de cuantizacion | GPTQ (`GPTQCompressor` de NeuralOps, con soporte de compressed-tensors); rank de showcase k=32 |
| Idiomas soportados | inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | `pytorch_model.bin` (state dict serializado); no se publican GGUF ni safetensors |

## Arquitectura y entrenamiento

La base es `google-bert/bert-base-uncased`: un transformer encoder bidireccional de 12 capas, 768 dimensiones ocultas y 109.483.778 parámetros, preentrenado con objetivos de masked language modeling y next sentence prediction, y afinado aquí sobre GLUE SST-2 (clasificación binaria de sentimiento, 2 etiquetas). Sobre ese checkpoint, NeuralOps aplica el compresor `gptq` (clase `GPTQCompressor`, familia `quantization`, implementada en `neuralops/compression/quantization/gptq.py`) para generar topologías comprimidas en varios ranks (k=256, 128, 64 y 32).

El pipeline incorpora un mecanismo de "LoRA healing": cuando la compresión zero-shot degrada la precisión más de 2,0 puntos con una reducción superior a 1,10x, NeuralOps aplica LoRA de rango r=8 durante 50 pasos con learning rate 2e-4 y un presupuesto de 45 segundos. En este checkpoint concreto la tabla del autor indica `LoRA Recovery Applied: False` y unos resultados idénticos en los cuatro ranks evaluados (90,48 % zero-shot y 90,48 % tras healing), con ratio físico 1.00x en todos los casos. La evaluación se realizó físicamente sobre una NVIDIA GeForce RTX 3090 (24 GB) con el split de validación de SST-2 (872 muestras).

## Capacidades

- Clasificación de sentimiento binaria (negativo/positivo) sobre texto en inglés, con una única etiqueta de salida por secuencia.
- Comprensión de lenguaje natural en inglés derivada del preentrenamiento de BERT-Base (representaciones contextuales bidireccionales).
- Inferencia de logits de 2 clases mediante `BertForSequenceClassification`, apta para integrarse en pipelines de scikit-learn o Transformers.
- No dispone de tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene modo thinking, visión, audio ni generación de texto libre: es exclusivamente un clasificador.
- Multilingüismo: limitado al inglés (vocabulario `bert-base-uncased`).
- Valor añadido de investigación: sirve como artefacto de referencia para reproducir y auditar el pipeline de compresión GPTQ + LoRA healing de NeuralOps.

## Casos de uso

- Auditoría de pipelines de compresión: cargar el checkpoint con `compress_model` y comparar la telemetría de `compression_summary.json` (ranks 256/128/64/32) con la precisión declarada para validar el comportamiento del compresor GPTQ en BERT-Base.
- Reproducción de experimentos académicos: usar el modelo como baseline fijo de 90,48 % en SST-2 para comparar futuras variantes de cuantización o pruning dentro de NeuralOps.
- Clasificación de sentimiento en inglés para prototipos: el modelo puede puntuar reseñas o comentarios con `BertForSequenceClassification` y la tokenización `bert-base-uncased`, aunque la carga requiere reconstruir la topología comprimida.
- Filtrado de reseñas en pipelines de datos: clasificar lotes de texto en inglés para separar positivos y negativos antes de un análisis posterior, aceptando la pérdida de 1,15 puntos frente al teacher.
- Docencia y formación: ilustrar el coste real de la cuantización GPTQ cuando no reduce parámetros (ratio 1.00x) y el papel del LoRA healing en el pipeline.
- Integración en flujos de MLOps con NeuralOps: usar `load_surgeried_model` para cargar modelo y tokenizador en una línea y evaluar el ciclo de vida de checkpoints comprimidos.
- Comparación de formatos de serialización: estudiar las implicaciones de distribuir un `pytorch_model.bin` con buffers de cuantización frente a safetensors o GGUF en términos de portabilidad.

## Benchmarks y rendimiento

Datos declarados por el autor en el model-index (no verificados, `verified: false`):

| Benchmark | Dataset / split | Métrica | Valor |
|---|---|---|---|
| Sentiment Classification | GLUE SST-2, validation (872 muestras) | Accuracy | 90,48 % |

Comparativa interna del autor (tabla multi-rank Pareto):

| Rank (k) | Ratio físico | Parámetros comprimidos | Zero-shot Acc | Healed Acc | Paridad vs teacher (91,63 %) |
|:---:|:---:|---:|---:|---:|---:|
| 256 | 1.00x | 109.483.778 (-0,0 %) | 90,48 % | 90,48 % | -1,15 % |
| 128 | 1.00x | 109.483.778 (-0,0 %) | 90,48 % | 90,48 % | -1,15 % |
| 64 | 1.00x | 109.483.778 (-0,0 %) | 90,48 % | 90,48 % | -1,15 % |
| 32 (checkpoint publicado) | 1.00x | 109.483.778 (-0,0 %) | 90,48 % | 90,48 % | -1,15 % |

No se han publicado en la información disponible resultados de otros benchmarks (MMLU, HumanEval, GSM8K) ni latencias o throughput medidos.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint pesa 208,9 MB (repo de 0,2 GB); con overhead de activaciones y tokenizador, la inferencia en FP32 requiere aproximadamente 0,5-1 GB de VRAM, por lo que cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM (GTX 1650, RTX 3060, RTX 4090); el autor evaluó la compresión en una RTX 3090 (24 GB), pero esa GPU no es necesaria para inferencia.
- Cabe en GPU consumer: sí, en todas las gamas modernas; también es viable en CPU para lotes pequeños.
- Opciones de despliegue: la carga está pensada para NeuralOps (`compress_model` + `load_state_dict`) o `load_surgeried_model`; no se documentan exportaciones a vLLM, llama.cpp, Ollama ni TGI, y al no publicarse GGUF ni safetensors esas vías no están disponibles directamente.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | SST-2 (val) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `bert-comp-gptq-sst2` (este) | 109.483.778 (ratio 1.00x) | no disponible | 90,48 % (declarado) | MIT | Hugging Face, formato `.bin` con topología NeuralOps |
| `google-bert/bert-base-uncased` (teacher) | 109.483.778 | hasta 512 tokens (arquitectura) | 91,63 % (baseline del autor) | Apache 2.0 (modelo base) | Hugging Face, safetensors/PyTorch |
| `distilbert-base-uncased-finetuned-sst-2-english` | ~66 M | hasta 512 tokens (arquitectura) | no disponible en esta información | Apache 2.0 | Hugging Face, pipeline listo para uso |
| `textattack/bert-base-uncased-SST-2` | 109.483.778 | hasta 512 tokens (arquitectura) | no disponible en esta información | no disponible en esta información | Hugging Face, carga directa con Transformers |

La comparativa relevante aquí es con el propio teacher: el checkpoint comprimido pierde 1,15 puntos de accuracy sin ganar compresión física (1.00x). Frente a DistilBERT, la propuesta de NeuralOps no ofrece la reducción de tamaño que justificaría el cambio, y frente a checkpoints SST-2 estándar exige un paso extra de reconstrucción de topología.

## Limitaciones y advertencias

- El "rank k=32" no implica compresión real: la tabla del autor muestra ratio 1.00x y reducción del 0,0 %, por lo que no hay ahorro de memoria ni de almacenamiento frente al teacher.
- La precisión de 90,48 % está marcada como no verificada (`verified: false`) y procede de 872 muestras de validación, un conjunto pequeño con intervalos de confianza amplios.
- Solo inglés: el vocabulario `bert-base-uncased` no cubre otros idiomas de forma fiable.
- Es un clasificador de 2 etiquetas, no un modelo generativo; no debe esperarse razonamiento, código ni tool calling.
- La carga no es directa con `from_pretrained`: requiere reconstruir la topología con NeuralOps y cargar el `state_dict` con `strict=False`, lo que introduce riesgo de desajustes silenciosos de pesos.
- El README mezcla identificadores: el ejemplo de código usa `tahamajs/bert-comp-gptq-sst2` mientras el repo publicado es `Hooshaai/bert-comp-gptq-sst2`; conviene verificar la ruta antes de descargar.
- Riesgo de alucinación bajo en la tarea (clasificación), pero el modelo puede producir confianza mal calibrada en entradas fuera de distribución o en dominios distintos de SST-2.
- Sesgos heredados del preentrenamiento de BERT-Base (datos web en inglés) y del corpus SST-2 (reseñas cinematográficas), no auditados en esta ficha.
- Licencia MIT declarada en el repo, pero el modelo base BERT-Base se distribuye bajo Apache 2.0; revisar compatibilidad antes de uso comercial.
- El único resultado de búsqueda web encontrado (una noticia sobre suscripciones de TikTok) no guarda relación con el modelo y no aporta información técnica.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Hooshaai/bert-comp-gptq-sst2
- Modelo base: https://huggingface.co/google-bert/bert-base-uncased
- Librería NeuralOps: https://github.com/tahamajs/NeuralOps
- Implementación del compresor GPTQ: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/compression/quantization/gptq.py
- Licencia NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset GLUE SST-2: https://huggingface.co/datasets/nyu-mll/glue
