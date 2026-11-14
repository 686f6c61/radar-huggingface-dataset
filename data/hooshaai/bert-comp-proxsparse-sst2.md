# Hooshaai/bert-comp-proxsparse-sst2

## Resumen

`Hooshaai/bert-comp-proxsparse-sst2` es un checkpoint de clasificación de sentimiento derivado de `google-bert/bert-base-uncased`, fine-tuneado sobre GLUE SST-2 y procesado con el motor de compresión `proxsparse` (`ProxSparsePruner`) de la librería NeuralOps. Lo publica el usuario Hooshaai como parte del "NeuralOps Compressed & LoRA-Healed Model Zoo", un conjunto de artefactos que documentan el efecto de distintas técnicas de poda (pruning) sobre modelos BERT.

El modelo mantiene la arquitectura original de BERT-Base (12 capas, dimensión oculta 768, 109.483.778 parámetros) y, según la model card, el rank de compresión seleccionado (k=32) no produce reducción física de parámetros (ratio 1.00x, -0.0% de ahorro). El resultado es funcionalmente un BERT-Base fine-tuneado para SST-2 con una precisión declarada del 82,34% en el split de validación, frente al 91,63% del modelo teacher de referencia, lo que supone una pérdida de paridad de -9,29 puntos.

Su relevancia es principalmente metodológica: sirve como caso de estudio reproducible del pipeline NeuralOps (poda proximal, evaluación multi-rank y posible healing con LoRA) aplicado a una tarea estándar de NLP. No es un modelo pensado para producción general, sino un artefacto de investigación sobre compresión de modelos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT-Base), 12 capas, dimension oculta 768 |
| Parametros totales | 109.483.778 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (BERT-Base estandar: 512 tokens, no confirmado en la model card) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ingles (en) |
| Licencia | MIT |
| Formato de pesos | PyTorch (`pytorch_model.bin`), assets de tokenizer BERT (`vocab.txt`, `tokenizer.json`, `tokenizer_config.json`) |

## Arquitectura y entrenamiento

La base es `google-bert/bert-base-uncased`, un transformer encoder de 12 capas y 768 dimensiones ocultas con 109.483.778 parámetros, fine-tuneado sobre GLUE SST-2 (clasificación binaria de sentimiento, 2 etiquetas). Sobre ese checkpoint se aplica el `ProxSparsePruner` de NeuralOps, descrito como "proximal gradient sparsity with structured / 2:4 / percentile constraint, optional LoRA fine-tuning, and safe fallback".

La evaluación multi-rank documentada cubre k=256, 128, 64 y 32, ejecutada físicamente en una NVIDIA GeForce RTX 3090 (24 GB) sobre el split de validación de SST-2 (872 muestras). En todos los ranks el ratio de compresión reportado es 1.00x y la reducción de parámetros es -0.0%, lo que indica que en esta configuración concreta la poda no eliminó pesos de forma efectiva. El pipeline NeuralOps aplica healing con LoRA (r=8, 50 pasos, lr=2e-4, presupuesto de 45 s) cuando la compresión zero-shot degrada más de 2.0 puntos con reducción superior a 1.10x; en este caso, según la tabla, `LoRA Recovery Applied: False` y las cifras zero-shot y healed coinciden (82,34%).

## Capacidades

- Clasificación de sentimiento binaria (positivo/negativo) en inglés, tarea SST-2.
- Generación de representaciones contextuales de BERT-Base subyacente (utilizable como encoder para otras tareas mediante fine-tuning).
- No dispone de tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- Capacidades multilingües limitadas: vocabulario y entrenamiento orientados al inglés.
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Análisis de opiniones en inglés sobre reseñas de producto: el modelo clasifica frases cortas en positivo/negativo, adecuado por su fine-tuning directo sobre SST-2 y su bajo coste de inferencia (109 M de parámetros).
- Filtrado de comentarios en foros y redes: preclasificación rápida de mensajes en inglés para enrutar a moderación humana, aprovechando la latencia baja de un BERT-Base.
- Reproducción de experimentos de compresión: usar el checkpoint como referencia para comparar el pipeline NeuralOps (`proxsparse`) frente a otras técnicas de poda sobre SST-2.
- Docencia e investigación en pruning: caso de estudio con telemetría completa (`compression_summary.json`) para analizar el efecto de distintos ranks (k=256 a k=32) sobre la precisión.
- Base para fine-tuning ligero en tareas de clasificación en inglés: al conservar la topología BERT-Base, puede reentrenarse con cabezas nuevas en dominios específicos.
- Evaluación de pipelines de compresión en hardware consumer: sirve como banco de pruebas en GPUs de 24 GB (RTX 3090) para medir coste y paridad frente al teacher.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (no verificados):

| Rank (k) | Ratio fisico | Parametros comprimidos | Acc zero-shot | Acc healed | Paridad vs teacher (91,63%) |
|:---:|:---:|---:|---:|---:|---:|
| 256 | 1.00x | 109.483.778 (-0.0%) | 82,34% | 82,34% | -9,29% |
| 128 | 1.00x | 109.483.778 (-0.0%) | 82,34% | 82,34% | -9,29% |
| 64 | 1.00x | 109.483.778 (-0.0%) | 82,34% | 82,34% | -9,29% |
| 32 (checkpoint publicado) | 1.00x | 109.483.778 (-0.0%) | 82,34% | 82,34% | -9,29% |

Evaluación sobre GLUE SST-2, split de validación (872 muestras), en NVIDIA GeForce RTX 3090. El baseline teacher se declara en 91,63%. No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,45 GB de pesos (109 M de parámetros × 4 bytes), más overhead de activaciones; holgado en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; el autor evaluó en RTX 3090 (24 GB), pero el modelo es sobradamente pequeño para GPUs de gama baja.
- Cabe en GPU consumer: sí, en prácticamente todas (GTX 1650, RTX 3060, RTX 4090, etc.).
- Opciones de despliegue: PyTorch + Transformers con reconstrucción vía NeuralOps (`compress_model`), o carga directa con `load_surgeried_model`; también viable exportar a ONNX o TorchScript para serving ligero. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | SST-2 (val) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Hooshaai/bert-comp-proxsparse-sst2` | 109,5 M | no disponible | 82,34% (declarado) | MIT | Hugging Face |
| `google-bert/bert-base-uncased` (teacher) | 109,5 M | 512 | 91,63% (referencia del autor) | Apache 2.0 | Hugging Face |
| BERT-Base fine-tune SST-2 estándar | 109,5 M | 512 | ~92-93% (típico de la literatura) | según checkpoint | Hugging Face |

La comparativa se limita al modelo base y a checkpoints BERT-Base equivalentes; no se dispone de datos de modelos alternativos evaluados en la misma configuración en la información proporcionada.

## Limitaciones y advertencias

- Pérdida de paridad de -9,29 puntos frente al teacher (82,34% vs 91,63%), lo que limita su uso en producción sensible a precisión.
- El ratio de compresión reportado es 1.00x (-0.0% de parámetros), por lo que no aporta ahorro de memoria ni de cómputo frente al BERT-Base original.
- Solo inglés; no cubre otros idiomas.
- Riesgo de alucinación no aplica directamente (clasificación), pero sí de clasificaciones erróneas en textos ambiguos, sarcásticos o de dominio distinto a SST-2.
- Sesgos heredados de `bert-base-uncased` y del corpus SST-2 (reseñas de cine), con posible desviación en otros dominios.
- Licencia MIT permite uso comercial, pero la model card enlaza a la licencia del repositorio NeuralOps y el autor no verifica los resultados (`verified: false`).
- El código de ejemplo de la model card referencia `tahamajs/bert-comp-proxsparse-sst2`, no el repo `Hooshaai/bert-comp-proxsparse-sst2`; conviene verificar la ruta real antes de cargar el checkpoint.
- Requiere la librería NeuralOps para reconstruir la topología comprimida antes de cargar los pesos; no es un checkpoint Transformers estándar plug-and-play.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Hooshaai/bert-comp-proxsparse-sst2
- Modelo base: https://huggingface.co/google-bert/bert-base-uncased
- Librería NeuralOps: https://github.com/tahamajs/NeuralOps
- Implementación `ProxSparsePruner`: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/compression/pruning/proxsparse.py
- Licencia NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset GLUE: https://huggingface.co/datasets/nyu-mll/glue
