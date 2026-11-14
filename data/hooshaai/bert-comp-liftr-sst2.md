# Hooshaai/bert-comp-liftr-sst2

## Resumen

`bert-comp-liftr-sst2` es un checkpoint comprimido de forma física de `google-bert/bert-base-uncased` afinado sobre GLUE SST-2 (análisis de sentimiento binario), empaquetado por el autor Hooshaai dentro del ecosistema NeuralOps (Compressor Zoo). La compresión se realiza con el motor `liftr` (`liftr_compressor_entry`, familia experimental) a un rango seleccionado por Pareto de `k=32`, aplicando posteriormente un "healing" con LoRA de rango 8. El resultado es un modelo con 59.901.698 parámetros frente a los 109.483.778 del BERT-base original, es decir, una reducción del 45,29 % y un ratio de compresión físico de 1,828x.

El modelo es relevante como artefacto de investigación sobre compresión de modelos y recuperación de precisión mediante adaptadores de bajo rango, no como clasificador de sentimiento listo para producción. La razón es que su precisión en la validación de GLUE SST-2 es del 50,92 % (frente al 91,63 % del profesor original), un delta de paridad de -40,71 puntos porcentuales que lo sitúa prácticamente en el nivel de un clasificador aleatorio binario. El propio autor lo etiqueta como `experimental`.

La arquitectura subyacente es un transformer encoder BERT-base (12 capas, dimensión oculta 768, vocabulario `bert-base-uncased`), con la topología de pesos modificada por la compresión LIFTR y los adaptadores LoRA integrados en el state dict serializado. El repositorio ocupa 0,1 GB y se distribuye bajo licencia MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT-base) con compresion LIFTR (`liftr_compressor_entry`) y adaptadores LoRA r=8 |
| Parametros totales | 59.901.698 (comprimido); original del profesor: 109.483.778 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (arquitectura BERT-base, tipicamente 512 tokens; no confirmado en la informacion) |
| Tipos de cuantizacion | no disponible (el checkpoint se empaqueta como `pytorch_model.bin` en fp32/pesos serializados; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | `pytorch_model.bin` (state dict serializado con factores de bajo rango y adaptadores LoRA integrados); tokenizer `bert-base-uncased` (`vocab.txt`, `tokenizer.json`, `tokenizer_config.json`) |

## Arquitectura y entrenamiento

El modelo parte de `google-bert/bert-base-uncased` (12 capas, D=768, 109.483.778 parámetros) afinado sobre GLUE SST-2. Sobre esa base se aplica el compresor `liftr` del paquete NeuralOps, que reduce el recuento de parámetros a 59.901.698 mediante factores de bajo rango y buffers de cuantización. El checkpoint publicado corresponde al rango `k=32`, seleccionado por un barrido de Pareto sobre `k ∈ {256, 128, 64, 32}`. Curiosamente, los rangos 256, 64 y 32 reportan idénticos recuentos de parámetros y ratios (1,83x, -45,3 %), mientras que `k=128` falla con `FAIL_CRASH`.

Cuando la compresión zero-shot degrada la precisión más de 2,0 puntos con una reducción superior a 1,10x, el pipeline aplica un "healing" con LoRA de rango 8: 50 pasos, tasa de aprendizaje 2e-4 y un presupuesto de 45 segundos. En este checkpoint el healing eleva la precisión del 49,08 % (zero-shot) al 50,92 % final, es decir, una recuperación de apenas 1,84 puntos. La evaluación física se realizó en una NVIDIA GeForce RTX 3090 (24 GB) sobre el split de validación de GLUE SST-2 (872 muestras). No se documentan en la información disponible los volúmenes de tokens de entrenamiento, la composición del dataset más allá de GLUE SST-2, ni si hubo RLHF/DPO (no aplicable a un clasificador).

## Capacidades

- Clasificación de sentimiento binaria (positivo/negativo) sobre texto en inglés, con dos etiquetas de salida (`num_labels=2`).
- Inferencia de clasificación sobre secuencias tokenizadas con el vocabulario `bert-base-uncased`.
- Carga mediante el pipeline de reconstrucción de NeuralOps (`compress_model` + `load_state_dict(strict=False)`) o mediante la API `load_surgeried_model` del hub de NeuralOps.
- No soporta tool calling ni function calling: es un modelo de clasificación, no un modelo generativo.
- No soporta razonamiento multi-paso ni comportamiento de agente.
- No dispone de modo "thinking", visión, audio ni capacidades multimodales.
- Capacidad multilingüe: no; solo inglés.
- Capacidad de generación de texto, código o matemáticas: no; la cabeza es de clasificación.

## Casos de uso

- Investigación sobre compresión de modelos: sirve como artefacto de referencia para reproducir el pipeline LIFTR y el healing con LoRA sobre BERT-base, comparando los rangos `k` del barrido de Pareto y midiendo la degradación de precisión.
- Estudio de la relación entre ratio de compresión y paridad con el profesor: el par (1,83x de compresión, -40,71 puntos de paridad) es un dato empírico útil para analizar los límites del método en tareas de clasificación sensible.
- Pruebas de integración con la librería NeuralOps: valida el flujo `compress_model` → `load_state_dict(strict=False)` y la API `load_surgeried_model` en un caso real con tokenizer estándar de BERT.
- Benchmarking de infraestructura de inferencia: al tener 59,9 M de parámetros y un state dict de ~115,8 MB, es adecuado para medir latencia y throughput de clasificación en GPUs de consumo (por ejemplo, RTX 3090) sin cuellos de botella de memoria.
- Docencia y demostraciones de compresión: ilustra de forma tangible la diferencia entre reducción de parámetros (45,3 %) y retención de calidad (prácticamente nula en este checkpoint), útil en material formativo sobre model compression.
- Validación de pipelines de evaluación GLUE SST-2: el split de validación (872 muestras) y la métrica de accuracy están documentados, lo que permite reproducir la evaluación del autor en una RTX 3090.
- No se recomienda su uso como clasificador de sentimiento en producción: con un 50,92 % de accuracy, el rendimiento es equivalente al azar binario y no aporta valor frente a un modelo sin comprimir.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados, `verified: false`) sobre GLUE SST-2, split de validación (872 muestras), evaluados en una NVIDIA GeForce RTX 3090.

| Modelo / variante | Ratio de compresion | Parametros | Accuracy SST-2 (val) | Delta vs profesor |
|---|---:|---:|---:|---:|
| Profesor `bert-base-uncased` (SST-2) | 1,00x | 109.483.778 | 91,63 % | — |
| `liftr` k=256, zero-shot | 1,83x | 59.901.698 | 49,08 % | -42,55 |
| `liftr` k=256, con LoRA healing | 1,83x | 59.901.698 | 50,92 % | -40,71 |
| `liftr` k=128 | — | — | FAIL_CRASH | — |
| `liftr` k=64, con LoRA healing | 1,83x | 59.901.698 | 50,92 % | -40,71 |
| `liftr` k=32 (checkpoint publicado), con LoRA healing | 1,83x | 59.901.698 | 50,92 % | -40,71 |

No se han publicado en la informacion disponible resultados de otros benchmarks (MMLU, HumanEval, GSM8K u otros); el modelo es un clasificador y no aplica a esas tareas.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 para los 59,9 M de parámetros del checkpoint comprimido (el state dict empaquetado ocupa 115,8 MB); el modelo original de referencia ronda los 440 MB en fp32.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM. La evaluación del autor se realizó en una NVIDIA GeForce RTX 3090 (24 GB), pero el modelo es sobradamente pequeño para GPUs de gama baja.
- Cabe en GPU de consumo: sí, en cualquier RTX (incluso series 20xx/30xx/40xx de gama baja), GTX 16xx y en muchas iGPU con suficiente memoria compartida. También es viable en CPU.
- Opciones de despliegue: la vía documentada es la librería NeuralOps (`compress_model` + `load_state_dict`, o `load_surgeried_model`). No se documentan exportaciones a vLLM, llama.cpp, Ollama ni TGI; al ser un BERT de clasificación, la integración natural sería un servidor de inferencia tipo TorchServe o FastAPI con `transformers` + `neuralops`.
- Latencia y throughput: no disponible. No se publican medidas de latencia ni de tokens por segundo; el autor solo reporta un presupuesto de 45 segundos para el healing LoRA (50 pasos, lr=2e-4) en RTX 3090.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Accuracy SST-2 (val) | Licencia | Disponibilidad |
|---|---:|---|---:|---|---|
| `Hooshaai/bert-comp-liftr-sst2` (este) | 59.901.698 (comprimido) | no disponible | 50,92 % (declarado, no verificado) | MIT | Hugging Face |
| `google-bert/bert-base-uncased` afinado en SST-2 (profesor) | 109.483.778 | 512 tokens (tipico) | 91,63 % (referencia del autor) | Apache 2.0 (modelo base) | Hugging Face |
| `distilbert-base-uncased` afinado en SST-2 | ~66 M | 512 tokens (tipico) | no disponible en la informacion | Apache 2.0 (modelo base) | Hugging Face |
| `roberta-base` afinado en SST-2 | ~125 M | 512 tokens (tipico) | no disponible en la informacion | MIT (modelo base) | Hugging Face |

La comparación relevante es con el profesor: el checkpoint comprimido reduce parámetros un 45,3 % pero pierde 40,71 puntos de accuracy, por lo que no es un sustituto funcional del BERT-base afinado. Frente a alternativas de tamaño similar (DistilBERT, ~66 M), no se dispone de datos de accuracy en la información proporcionada para establecer una comparación cuantitativa; cualitativamente, un DistilBERT afinado en SST-2 suele superar ampliamente el 50,92 % de este checkpoint, aunque ese dato no está confirmado en las fuentes consultadas.

## Limitaciones y advertencias

- Rendimiento prácticamente aleatorio: 50,92 % de accuracy en un problema binario equivale a adivinar; el modelo no es apto para clasificación de sentimiento real.
- El autor marca el checkpoint como `experimental` y los resultados como no verificados (`verified: false`).
- El rango `k=128` del barrido falla con `FAIL_CRASH`, lo que indica inestabilidad del pipeline de compresión en ciertas configuraciones.
- Los rangos 256, 64 y 32 reportan parámetros y ratios idénticos, lo que sugiere que el barrido de Pareto no está diferenciando correctamente los puntos o que la telemetría es inconsistente.
- Solo inglés: no hay capacidades multilingües.
- Riesgo de alucinación: no aplica en sentido generativo (es un clasificador), pero sí hay riesgo de predicciones espurias por la degradación severa del modelo.
- Sesgos: no se documentan evaluaciones de sesgo; al derivar de `bert-base-uncased` y GLUE SST-2, hereda los sesgos del corpus de entrenamiento original, no analizados en la model card.
- Licencia MIT para el checkpoint, pero el modelo base `google-bert/bert-base-uncased` está bajo Apache 2.0; conviene revisar la compatibilidad y las condiciones de atribución en uso comercial.
- El código de ejemplo de la model card referencia `repo_id = "tahamajs/bert-comp-liftr-sst2"`, distinto del ID real `Hooshaai/bert-comp-liftr-sst2`; hay que ajustar el identificador al cargar.
- Dependencia de la librería NeuralOps y de su API (`compress_model`, `load_surgeried_model`) para reconstruir la topología; no es un checkpoint estándar de `transformers` cargable directamente con `from_pretrained`.
- No se documentan el contexto máximo efectivo, los datos de entrenamiento ni los detalles del corpus de healing; la reproducibilidad es limitada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Hooshaai/bert-comp-liftr-sst2
- Modelo base: https://huggingface.co/google-bert/bert-base-uncased
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Implementación del compresor LIFTR: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/compression/experimental/liftr.py
- Licencia NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset GLUE SST-2: https://huggingface.co/datasets/nyu-mll/glue
