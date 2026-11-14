# Hooshaai/bert-comp-slicegpt-sst2

## Resumen

`bert-comp-slicegpt-slicegpt-sst2` es un checkpoint de `google-bert/bert-base-uncased` (109.483.778 parametros, 12 capas, dimension oculta 768) sometido a un proceso de compresion fisica mediante la tecnica SliceGPT implementada en la libreria NeuralOps, bajo la clase `PCAActivationAwareSVDCompressor`. El modelo esta afinado sobre GLUE SST-2 (clasificacion de sentimiento binaria en ingles) y posteriormente comprimido a rango `k=64`, lo que reduce el numero de parametros a 35.170.562 (un 67,88% menos, ratio de compresion fisica de 3,113x). Tras la compresion se aplico un "healing" con LoRA de rango 8 durante 50 pasos.

El modelo lo publica el usuario Hooshaai dentro del proyecto NeuralOps (repositorio `tahamajs/NeuralOps`), un zoo de modelos comprimidos orientado a experimentacion con tecnicas de compresion (SVD con conciencia de activaciones, cuantizacion, LoRA de recuperacion). No es un modelo pensado para produccion: es una pieza de demostracion del pipeline de compresion, con un rendimiento muy degradado respecto al profesor original.

La relevancia es doble. Por un lado, documenta de forma transparente el coste en calidad de una compresion agresiva (3,11x) sobre un transformer pequeno: la exactitud en SST-2 cae del 91,63% del profesor al 50,92% tras el healing LoRA. Por otro, sirve como referencia reproducible para quienes investigan tecnicas de compresion post-entrenamiento y quieren medir el compromiso entre reduccion de parametros y precision en tareas downstream.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder BERT-base (12 capas, D=768), comprimido con PCA-Activation-Aware SVD (SliceGPT) a rango k=64 |
| Parametros totales | 35.170.562 (comprimido); modelo base original: 109.483.778 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de bert-base-uncased, tipicamente 512 tokens, no confirmado en la model card) |
| Tipos de cuantizacion | no disponible (el checkpoint usa factores de bajo rango, no cuantizacion de enteros) |
| Idiomas soportados | ingles (en) |
| Licencia | MIT |
| Formato de pesos | `pytorch_model.bin` (state dict serializado de PyTorch) |

## Arquitectura y entrenamiento

La arquitectura base es un transformer encoder estilo BERT-base: 12 capas, 768 dimensiones ocultas, atencion multi-cabeza y embeddings de tipo WordPiece (`bert-base-uncased`). Sobre ese modelo afinado en SST-2, NeuralOps aplica el compresor `slicegpt` (`PCAActivationAwareSVDCompressor`), que para cada capa lineal objetivo: (1) acumula online la covarianza de activaciones de entrada `C = E[X^T X]`; (2) calcula una rotacion ortogonal `Q` mediante eigendescomposicion de `C`; (3) rota los pesos `W_pca = W @ Q`; (4) trunca a las `keep` coordenadas principales; y (5) almacena una factorizacion de bajo rango `U = W_pca[:, :keep]`, `V = Q[:, :keep]^T`. La reduccion de parametros por capa es aproximadamente `(d_out + d_in) * keep` frente a `d_out * d_in` del original.

El pipeline evalua varios rangos (`k=256, 128, 64, 32`) sobre la particion de validacion de GLUE SST-2 (872 muestras). Los rangos 256, 128 y 32 fallaron con `FAIL_CRASH`; solo el rango 64 produjo un checkpoint serializable. Cuando la compresion en zero-shot degrada la exactitud mas de 2,0 puntos con una reduccion superior a 1,10x, NeuralOps aplica un healing con LoRA de rango 8 (50 pasos, `lr=2e-4`, presupuesto de 45 segundos). El resultado final del checkpoint publicado es 50,92% de exactitud en SST-2, frente al 49,08% en zero-shot y al 91,63% del profesor.

## Capacidades

- Clasificacion de texto binaria (sentimiento positivo/negativo) sobre la tarea GLUE SST-2.
- Generacion de logits para dos clases mediante `BertForSequenceClassification` con `num_labels=2`.
- Inferencia en ingles unicamente (tokenizador `bert-base-uncased`).
- Reconstruccion del grafo comprimido mediante la API de NeuralOps (`compress_model` con `method: "slicegpt"`, `rank: 64`) y carga del state dict con `strict=False`.
- Carga mediante la API universal `load_surgeried_model` de `neuralops.hub` (segun la model card, aunque el ejemplo aparece truncado).
- No soporta tool calling, function calling, agentes, multi-step reasoning, vision, audio ni modos de pensamiento. Es un clasificador de una sola tarea.
- No es un modelo generativo: no produce texto libre.

## Casos de uso

- **Investigacion en compresion de modelos**: el checkpoint sirve como referencia reproducible del compromiso entre ratio de compresion (3,11x) y precision (caida de 40,71 puntos porcentuales) en un transformer pequeno. Util para validar implementaciones propias del algoritmo SliceGPT.
- **Docencia y divulgacion tecnica**: permite ilustrar en un notebook el pipeline completo de PCA-ASVD, rotacion de pesos, truncado de rango y healing LoRA sobre un modelo conocido y ligero (67,2 MB de pesos).
- **Pruebas de integracion de la libreria NeuralOps**: sirve como caso de prueba de las APIs `compress_model`, `COMPRESSOR_REGISTRY` y `load_surgeried_model`, verificando que la reconstruccion del grafo y la carga con `strict=False` funcionan.
- **Baseline de ablacion para tecnicas de recuperacion**: util para comparar futuras estrategias de healing (distilacion, LoRA de mayor rango, fine-tuning completo) contra el 50,92% obtenido con LoRA r=8 en 50 pasos.
- **Analisis de robustez de clasificadores de sentimiento comprimidos**: permite estudiar como degrada la calibracion de un clasificador SST-2 al reducir parametros, midiendo la distribucion de logits frente al profesor.
- **Prototipado de pipelines de clasificacion de bajo coste en CPU**: con 35 millones de parametros y pesos en `pytorch_model.bin` de ~67 MB, puede ejecutarse en entornos sin GPU para experimentos exploratorios, siempre que la precision del 50,92% sea aceptable (no lo es para produccion).

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (no verificados):

| Modelo | Dataset | Split | Metrica | Valor |
|---|---|---|---|---|
| `bert-comp-slicegpt-sst2` (rango k=64, con LoRA) | GLUE SST-2 | validation | Accuracy | 50,92% |
| `bert-comp-slicegpt-sst2` (rango k=64, zero-shot) | GLUE SST-2 | validation | Accuracy | 49,08% |
| Profesor `bert-base-uncased` afinado SST-2 | GLUE SST-2 | validation | Accuracy | 91,63% |

Desglose por rango de compresion evaluado (RTX 3090, 24 GB, 872 muestras de validacion):

| Rango (k) | Ratio fisico | Parametros comprimidos | Zero-shot | Healed | Paridad vs profesor |
|:---:|:---:|---:|---:|---:|---:|
| 256 | — | — | FAIL_CRASH | — | — |
| 128 | — | — | FAIL_CRASH | — | — |
| 64 | 3,11x | 35.170.562 (-67,9%) | 49,08% | 50,92% (LoRA) | -40,71% |
| 32 | — | — | FAIL_CRASH | — | — |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 (35,17 M de parametros, ~140 MB de pesos; el archivo `pytorch_model.bin` ocupa 67,2 MB). La carga requiere ademas instanciar el modelo base (`bert-base-uncased`, ~440 MB) antes de aplicar la compresion.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; el autor evaluo en NVIDIA GeForce RTX 3090 (24 GB), aunque el modelo es muy inferior a ese presupuesto.
- Cabe en cualquier GPU de consumo (GTX 1050 Ti, RTX 2060, RTX 3060, RTX 4090) y en CPU.
- Opciones de despliegue: la model card solo documenta carga via `transformers` + `neuralops` (reconstruccion del grafo comprimido y `load_state_dict(strict=False)`). No se mencionan vLLM, llama.cpp, Ollama ni TGI; el formato `pytorch_model.bin` no es directamente compatible con llama.cpp sin conversion.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada. El healing LoRA se ejecuto con un presupuesto de 45 segundos en RTX 3090.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | SST-2 (val) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Hooshaai/bert-comp-slicegpt-sst2` | 35,17 M (comprimido) | no disponible | 50,92% | MIT | Hugging Face |
| `google-bert/bert-base-uncased` (profesor afinado SST-2) | 109,48 M | 512 tokens | 91,63% (segun el autor) | Apache 2.0 | Hugging Face |
| `distilbert-base-uncased-finetuned-sst-2-english` | 66,96 M | 512 tokens | no disponible en esta ficha | Apache 2.0 | Hugging Face |
| `textattack/bert-base-uncased-SST-2` | 109,48 M | 512 tokens | no disponible en esta ficha | Apache 2.0 | Hugging Face |

La comparativa relevante es contra el profesor: la compresion a 3,11x reduce los parametros un 67,9% pero degrada la exactitud 40,71 puntos, muy por debajo de lo que cabria esperar de tecnicas de destilacion como DistilBERT (que conserva en torno al 97% del rendimiento del profesor con un 40% menos de parametros, aunque ese dato no se ha verificado en esta ficha). El checkpoint es, por tanto, una demostracion de pipeline, no una alternativa competitiva a modelos comprimidos por destilacion.

## Limitaciones y advertencias

- **Rendimiento muy degradado**: 50,92% de exactitud en SST-2 esta practicamente al nivel de un clasificador aleatorio (50% en tarea binaria). El modelo no es util para clasificacion de sentimiento real.
- **Los rangos k=256, 128 y 32 fallan**: solo el checkpoint k=64 es cargable; el resto de configuraciones evaluadas producen `FAIL_CRASH`, lo que indica fragilidad del pipeline de compresion en este modelo.
- **Resultados no verificados**: la metrica de la model card tiene `verified: false`; no hay evaluacion independiente.
- **Idioma**: solo ingles; no hay soporte multilingue.
- **Tarea unica**: no es generativo, no soporta tool calling, agentes ni razonamiento multi-paso. No debe usarse como modelo de proposito general.
- **Formato propietario del pipeline**: requiere la libreria `neuralops` y reconstruir el grafo comprimido antes de cargar el state dict con `strict=False`; no es plug-and-play con `transformers` estandar.
- **Riesgo de alucinacion**: no aplica en sentido generativo, pero la calibracion de logits puede estar sesgada tras la compresion y el healing parcial.
- **Licencia MIT**: permite uso comercial, pero el modelo base `bert-base-uncased` es Apache 2.0; conviene revisar la compatibilidad y atribucion en despliegues comerciales.
- **Sesgos**: hereda los sesgos del corpus de preentrenamiento de BERT (libros y Wikipedia en ingles); no se documenta ninguna mitigacion.
- **Fecha de publicacion futura en los metadatos**: el repositorio indica creacion en 2026-11-10, lo que sugiere metadatos inconsistentes o generados automaticamente; conviene verificar la procedencia antes de usarlo.
- **Repo de ejemplo con URL inconsistente**: el snippet de la model card referencia `tahamajs/bert-comp-slicegpt-sst2`, mientras que el ID real es `Hooshaai/bert-comp-slicegpt-sst2`; el ejemplo de codigo puede fallar tal cual.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Hooshaai/bert-comp-slicegpt-sst2
- Modelo base: https://huggingface.co/google-bert/bert-base-uncased
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Implementacion del compresor SliceGPT: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/compression/quantization/slicegpt.py
- Licencia MIT del proyecto: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset GLUE SST-2: https://huggingface.co/datasets/nyu-mll/glue
