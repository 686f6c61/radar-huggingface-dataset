# Hooshaai/bert-comp-drone-compressor-sst2

## Resumen

`bert-comp-drone-compressor-sst2` es un checkpoint de BERT-Base (`google-bert/bert-base-uncased`) comprimido físicamente mediante la técnica de compresión de bajo rango `DRONECompressor`, perteneciente a la librería NeuralOps (repositorio `tahamajs/NeuralOps`). El modelo está afinado para clasificación de sentimiento binaria en GLUE SST-2 y ha sido serializado tras aplicar una descomposición SVD consciente de los datos con ponderación identidad, seleccionando el rango `k=256` como punto de la curva Pareto.

El problema que aborda es la reducción del coste de almacenamiento e inferencia de modelos BERT en producción sin degradar significativamente la precisión downstream. En este checkpoint concreto, la compresión física es modesta: pasa de 109.483.778 a 100.058.882 parámetros (una reducción del 8,61 % y un ratio de compresión de 1,094x), manteniendo una precisión del 90,94 % en la validación de SST-2 frente al 91,63 % del modelo profesor original, es decir, una pérdida de 0,69 puntos porcentuales.

El modelo es relevante como ejemplo reproducible de la familia de compresores `low_rank` de NeuralOps y como caso de estudio sobre el equilibrio entre ratio de compresión y paridad de precisión. Está pensado para experimentación e investigación en compresión de modelos, no como un clasificador de sentimiento de propósito general de alto rendimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT-Base), 12 capas, dimensión oculta D=768 |
| Parametros totales | 100.058.882 (tras compresión; el modelo base original tiene 109.483.778) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo base BERT-Base soporta 512 tokens, pero la model card no lo declara explícitamente) |
| Tipos de cuantizacion | no disponible (el checkpoint se distribuye en `pytorch_model.bin` con pesos completos) |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | `pytorch_model.bin` (state dict serializado de PyTorch); no se distribuye en safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo parte de `google-bert/bert-base-uncased`, un transformer encoder de 12 capas con dimensión oculta 768 y 109.483.778 parámetros, preentrenado de forma estándar y posteriormente afinado sobre GLUE SST-2. Sobre ese checkpoint se aplica el compresor `DRONECompressor` de NeuralOps, clasificado en la familia `low_rank`. Según la model card, se trata de una SVD consciente de los datos con ponderación identidad (un baseline de SVD independiente de los datos) que emplea la misma adaptación de rango, restricciones de parámetros y mecanismo de error de reserva que AASVD.

La evaluación se realizó físicamente sobre una NVIDIA GeForce RTX 3090 (24 GB) con el split de validación de GLUE SST-2 (872 muestras). Se exploraron cuatro rangos (`k=256, 128, 64, 32`) y, cuando la compresión zero-shot degradaba la precisión más de 2,0 puntos con una reducción superior a 1,10x, NeuralOps aplicaba un "healing" con LoRA de rango `r=8` durante 50 pasos con `lr=2e-4` y un presupuesto de 45 segundos. En el caso del checkpoint publicado (`k=256`), no se aplicó recuperación LoRA, ya que la precisión zero-shot ya era de 90,94 %. No se detalla en la información disponible el volumen de tokens de entrenamiento ni la composición exacta del dataset más allá de GLUE SST-2.

## Capacidades

- Clasificación de sentimiento binaria (negativo/positivo) sobre texto en inglés, con dos etiquetas de salida.
- Generación de logits y predicción de clase mediante `BertForSequenceClassification`; no es un modelo generativo.
- Inferencia en modo evaluación (`model.eval()`) con tokenizador estándar `bert-base-uncased`.
- Reconstrucción del grafo comprimido mediante `compress_model` de NeuralOps antes de cargar el state dict.
- Carga directa desde el Hub mediante la API `load_surgeried_model` de NeuralOps.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión ni audio.
- Capacidad multilingüe limitada al inglés (etiqueta `en`).
- No dispone de modo "thinking" ni decodificación especulativa.

## Casos de uso

- Investigación en compresión de modelos: sirve como punto de referencia reproducible para comparar el compresor `DRONECompressor` frente a otras técnicas de bajo rango sobre BERT-Base, ya que la model card publica telemetría completa de cuatro rangos en `compression_summary.json`.
- Análisis de sentimiento en inglés a pequeña escala: clasificación de reseñas o comentarios con dos etiquetas, aprovechando que el checkpoint mantiene el 90,94 % de precisión en SST-2 con un 8,6 % menos de parámetros.
- Evaluación de pipelines NeuralOps: permite validar el flujo `compress_model` + carga de state dict con `strict=False` en entornos de CI antes de desplegar compresiones más agresivas.
- Docencia y demostraciones: ejemplo didáctico de cómo una SVD con ponderación identidad afecta a la precisión downstream en distintos rangos (de 90,94 % en `k=256` a 56,88 % en `k=32` zero-shot).
- Prototipado de clasificadores ligeros: al reducir el número de parámetros, puede integrarse en entornos con restricciones moderadas de memoria, aunque la ganancia real (1,094x) es limitada.
- Comparación de estrategias de "healing": el repositorio incluye resultados con y sin LoRA (`r=8`, 50 pasos) para los rangos 128, 64 y 32, útil para estudiar el coste/beneficio de la recuperación post-compresión.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente, campo `verified: false`):

| Rank (k) | Ratio físico | Params comprimidos (reducción) | Acc zero-shot | Acc healed | Paridad vs profesor (91,63 %) |
|:---:|:---:|---:|---:|---:|---:|
| 256 (publicado) | 1,09x | 100.058.882 (-8,6 %) | 90,94 % | 90,94 % | -0,69 % |
| 128 | 1,21x | 90.615.554 (-17,2 %) | 80,50 % | 86,47 % (LoRA) | -5,16 % |
| 64 | 1,27x | 85.893.890 (-21,5 %) | 66,17 % | 80,28 % (LoRA) | -11,35 % |
| 32 | 1,31x | 83.533.058 (-23,7 %) | 56,88 % | 79,13 % (LoRA) | -12,50 % |

Evaluación realizada sobre el split de validación de GLUE SST-2 (872 muestras) en una RTX 3090. El profesor original alcanza 91,63 % de precisión en SST-2.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint pesa aproximadamente 191,0 MB según la model card; en FP32 requiere en torno a 400 MB de VRAM para pesos, más activaciones y overhead del framework.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; la evaluación oficial se realizó en una NVIDIA GeForce RTX 3090 (24 GB).
- Cabe holgadamente en GPU de consumo: RTX 3060, RTX 4060, RTX 4090, e incluso en iGPU con suficiente memoria compartida.
- Opciones de despliegue: al requerir la reconstrucción del grafo comprimido con `compress_model` de NeuralOps, no es directamente compatible con vLLM, llama.cpp, Ollama ni TGI sin conversión previa. El flujo documentado es PyTorch + Transformers + NeuralOps.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | SST-2 (val) | Licencia | Formato |
|---|---|---:|---:|---|---|
| `bert-comp-drone-compressor-sst2` (k=256) | 100.058.882 | no disponible | 90,94 % | MIT | `pytorch_model.bin` |
| `google-bert/bert-base-uncased` (profesor, fine-tuned SST-2) | 109.483.778 | 512 tokens | 91,63 % | Apache 2.0 | safetensors / PyTorch |
| BERT-Base comprimido a k=128 (mismo zoo) | 90.615.554 | no disponible | 86,47 % (con LoRA) | MIT | `pytorch_model.bin` |
| BERT-Base comprimido a k=32 (mismo zoo) | 83.533.058 | no disponible | 79,13 % (con LoRA) | MIT | `pytorch_model.bin` |

No se dispone en la información proporcionada de comparaciones con DistilBERT, TinyBERT u otros modelos comprimidos de terceros.

## Limitaciones y advertencias

- La compresión real es modesta (1,094x, 8,6 % de reducción); no debe presentarse como una optimización significativa de memoria o latencia.
- El checkpoint requiere reconstruir la topología con `compress_model` de NeuralOps antes de cargar el state dict; no es un modelo Transformers estándar listo para `from_pretrained` directo.
- La carga se realiza con `strict=False`, lo que puede enmascarar discrepancias entre el state dict y el grafo reconstruido.
- Solo soporta inglés; no debe usarse para clasificación multilingüe.
- Es un clasificador binario de sentimiento, no un modelo generativo ni un asistente conversacional.
- Riesgo de alucinación no aplicable en sentido estricto (no genera texto), pero sí riesgo de clasificaciones erróneas en dominios distintos de SST-2 (reseñas de películas).
- Los resultados de benchmarks están declarados por el autor y marcados como no verificados.
- Licencia MIT permite uso comercial, pero el modelo base `bert-base-uncased` está bajo Apache 2.0; conviene revisar ambas licencias en producción.
- No se han publicado datos sobre sesgos demográficos o de dominio.
- El repositorio tiene 49 descargas y 0 likes, lo que sugiere escasa validación comunitaria.
- El campo `created` de Hugging Face indica 2026-11-10, fecha anómala que conviene verificar antes de citar el modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Hooshaai/bert-comp-drone-compressor-sst2
- Modelo base: https://huggingface.co/google-bert/bert-base-uncased
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Implementación del compresor: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/compression/low_rank/drone_compressor.py
- Licencia NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset GLUE SST-2: https://huggingface.co/datasets/nyu-mll/glue
