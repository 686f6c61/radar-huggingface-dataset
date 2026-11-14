# Hooshaai/bert-comp-hybridkv-compressor-sst2

## Resumen

`bert-comp-hybridkv-compressor-sst2` es un checkpoint de BERT-Base (`google-bert/bert-base-uncased`) comprimido físicamente y "curado" mediante LoRA, publicado por el autor Hooshaai dentro del ecosistema NeuralOps (Compressed & LoRA-Healed Model Zoo). El modelo parte de un BERT-Base fine-tuneado para clasificación de sentimiento en GLUE SST-2 y le aplica el motor `HybridKVCompressor`, que clasifica las cabezas de proyección en estáticas y dinámicas y adjunta instancias de `HybridKVCache` a las capas de atención.

El resultado es un checkpoint con 95.332.610 parámetros (frente a los 109.483.778 del BERT-Base original), lo que supone una reducción del 12,93 % y un ratio de compresión físico de 1,148x en el rank de showcase `k=128`. La precisión en validación de GLUE SST-2 es del 89,68 %, frente al 91,63 % del modelo profesor, con una pérdida de paridad de 1,95 puntos porcentuales.

Su relevancia es acotada y muy específica: no es un modelo de propósito general, sino un artefacto de investigación sobre técnicas de compresión de modelos y recuperación mediante LoRA, útil para quienes estudian eficiencia en inferencia de transformers pequeños y para reproducir la metodología del zoo NeuralOps. El repositorio ocupa 0,2 GB y se distribuye bajo licencia MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT-Base) con compresión `HybridKVCompressor` (familia `kv_cache`) |
| Parametros totales | 95.332.610 (comprimido); 109.483.778 en el modelo base sin comprimir |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (el modelo base BERT-Base admite 512 tokens, pero la model card no lo declara explícitamente) |
| Tipos de cuantizacion | No disponible (el repositorio empaqueta pesos en `pytorch_model.bin`, sin variantes GGUF ni cuantizaciones publicadas) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | `pytorch_model.bin` (state dict serializado de PyTorch); tokenizer en `vocab.txt`, `tokenizer.json`, `tokenizer_config.json` |

## Arquitectura y entrenamiento

La arquitectura de partida es BERT-Base: un transformer encoder de 12 capas con dimensión oculta D=768 y 109.483.778 parámetros, preentrenado por Google y aquí fine-tuneado sobre GLUE SST-2 para clasificación binaria de sentimiento. Sobre esa base, NeuralOps aplica el compresor `HybridKVCompressor`, cuya implementación vive en `neuralops/compression/kv_cache/hybridkv_compressor.py`. Según la model card, este compresor clasifica las cabezas de proyección en tipos estáticos y dinámicos y adjunta instancias de `HybridKVCache` a las capas de atención sin modificar los pesos del modelo, lo que produce la reducción de parámetros observada.

El proceso de recuperación se describe con detalle: cuando la compresión zero-shot degrada la precisión más de 2,0 puntos con una reducción superior a 1,10x, NeuralOps aplica un "LoRA healing" dirigido con rango r=8, 50 pasos de entrenamiento, tasa de aprendizaje lr=2e-4 y un presupuesto de 45 segundos. La evaluación multi-rank se realizó físicamente sobre una NVIDIA GeForce RTX 3090 (24 GB) usando el split de validación de GLUE SST-2 con 872 muestras. El checkpoint empaquetado corresponde al rank k=128, marcado como showcase, con recuperación LoRA aplicada.

## Capacidades

- Clasificación de sentimiento binaria (negativo/positivo) sobre texto en inglés, especializada en el dominio de SST-2.
- Clasificación de secuencias cortas de texto con la cabecera `BertForSequenceClassification` y `num_labels=2`.
- Inferencia estándar de BERT-Base: representaciones contextuales de tokens reutilizables para tareas derivadas si se reconstruye sin la cabeza de clasificación.
- No dispone de tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- Capacidades multilingües limitadas al inglés (vocabulario `bert-base-uncased`).
- No incluye modo thinking, visión ni audio.

## Casos de uso

- Análisis de sentimiento en reseñas de producto: el modelo clasifica reseñas cortas en inglés como positivas o negativas, aprovechando el fine-tuning específico sobre SST-2 y su bajo coste de inferencia (95 M de parámetros).
- Moderación de comentarios en foros en inglés: filtrado previo de tono negativo en pipelines de moderación, con la ventaja de que el checkpoint comprimido reduce el uso de memoria frente a BERT-Base completo.
- Investigación en compresión de modelos: reproducción de los experimentos multi-rank (k=256, 128, 64, 32) del zoo NeuralOps para comparar ratios de compresión frente a degradación de precisión en una tarea estándar como SST-2.
- Evaluación de técnicas de LoRA healing: uso del checkpoint como referencia para estudiar cómo un ajuste LoRA de r=8 y 50 pasos recupera entre 5 y 23 puntos de precisión tras compresión agresiva.
- Prototipado rápido en entornos con GPU de gama media: al ocupar 0,2 GB en disco y requerir muy poca VRAM, permite desplegar un clasificador de sentimiento en portátiles con GPU consumer o incluso en CPU para pruebas.
- Baseline en pipelines de clasificación de texto: punto de comparación comprimido frente a BERT-Base sin comprimir en tareas de sentimiento, útil para medir el coste real de la reducción de parámetros en producción.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente, `verified: false`):

| Rank (k) | Ratio fisico | Parametros comprimidos (reduccion) | Precision zero-shot | Precision con LoRA | Paridad vs profesor (91,63 %) |
|:---:|:---:|---:|---:|---:|---:|
| 256 | 1,15x | 95.332.610 (-12,9 %) | 84,40 % | 89,68 % (LoRA) | -1,95 % |
| 128 (empaquetado) | 1,15x | 95.332.610 (-12,9 %) | 84,40 % | 89,68 % (LoRA) | -1,95 % |
| 64 | 1,19x | 91.791.362 (-16,2 %) | 72,59 % | 85,09 % (LoRA) | -6,54 % |
| 32 | 1,22x | 90.020.738 (-17,8 %) | 56,31 % | 79,93 % (LoRA) | -11,70 % |

El resultado oficial del model-index para el checkpoint empaquetado es de 89,68 % de accuracy en el split de validación de GLUE SST-2 (872 muestras), evaluado en una RTX 3090. El modelo profesor (BERT-Base fine-tuneado sin comprimir) alcanza el 91,63 %.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 para el checkpoint comprimido (95 M de parámetros, aproximadamente 380 MB de pesos más activaciones y overhead); en FP16 rondaría los 200 MB de pesos.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; el autor evaluó en NVIDIA GeForce RTX 3090 (24 GB), pero el modelo es sobradamente pequeño para GPUs muy inferiores.
- Cabe en GPU consumer: sí, en cualquier GPU consumer moderna (GTX 1050 Ti en adelante) e incluso en CPU para inferencia por lotes pequeños.
- Opciones de despliegue: la model card solo documenta la reconstrucción mediante la librería `neuralops` (función `compress_model` con el método `hybridkv_compressor` y rank 128) y la carga del state dict con `torch.load` y `load_state_dict(strict=False)`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, dado que el checkpoint requiere la topología comprimida de NeuralOps para cargarse correctamente.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | SST-2 (val) | Licencia | Disponibilidad |
|---|---|---:|---:|---|---|
| `bert-comp-hybridkv-compressor-sst2` (este) | 95,3 M (comprimido) | No disponible | 89,68 % | MIT | Hugging Face (NeuralOps) |
| `google-bert/bert-base-uncased` (profesor fine-tuneado SST-2) | 109,5 M | 512 tokens | 91,63 % | Apache 2.0 | Hugging Face |
| BERT-Base sin comprimir (referencia) | 109,5 M | 512 tokens | No disponible en esta ficha | Apache 2.0 | Hugging Face |

La comparativa se limita al modelo base y su versión fine-tuneada porque la información proporcionada no incluye otros modelos comprimidos del zoo NeuralOps ni alternativas de terceros con datos verificables.

## Limitaciones y advertencias

- El checkpoint requiere reconstruir la topología comprimida con la librería `neuralops` antes de cargar el state dict; no es un modelo estándar cargable directamente con `AutoModel.from_pretrained`.
- La carga usa `strict=False`, lo que puede enmascarar discrepancias entre el state dict y la arquitectura reconstruida.
- El resultado de 89,68 % está declarado por el autor y marcado como no verificado (`verified: false`); no hay validación independiente.
- La compresión a ranks más agresivos degrada fuertemente la precisión: en k=32 la exactitud cae al 79,93 % incluso tras LoRA healing, frente al 91,63 % del profesor.
- Modelo especializado exclusivamente en clasificación de sentimiento binaria en inglés; no es adecuado para generación de texto, código, matemáticas ni tareas multilingües.
- Riesgo de alucinación no aplicable en sentido estricto (es un clasificador), pero sí de clasificaciones erróneas en dominios alejados de SST-2 (reseñas de películas), donde el modelo no fue entrenado.
- Sesgos heredados de BERT-Base y del corpus SST-2, no documentados en la model card.
- Licencia MIT, que permite uso comercial, pero la licencia del modelo base (Apache 2.0) y las condiciones de la librería NeuralOps deben respetarse por separado.
- La información de la model card contiene referencias a un repositorio (`tahamajs/bert-comp-hybridkv-compressor-sst2`) distinto del ID del modelo en Hugging Face (`Hooshaai/bert-comp-hybridkv-compressor-sst2`), lo que puede afectar a la reproducibilidad del código de ejemplo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Hooshaai/bert-comp-hybridkv-compressor-sst2
- Modelo base: https://huggingface.co/google-bert/bert-base-uncased
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Licencia NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Implementación del compresor: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/compression/kv_cache/hybridkv_compressor.py
- Dataset GLUE SST-2: https://huggingface.co/datasets/nyu-mll/glue
