# Hooshaai/bert-comp-hashed-net-compressor-sst2

## Resumen

`bert-comp-hashed-net-compressor-sst2` es un checkpoint de BERT-Base (`google-bert/bert-base-uncased`) ajustado para clasificación de sentimiento en GLUE SST-2 y posteriormente procesado con el compresor experimental `hashed_net_compressor` de la librería NeuralOps, desarrollada por el usuario Hooshaai. El modelo se publica como demostración del "Compressed & LoRA-Healed Model Zoo" de NeuralOps, un conjunto de herramientas orientado a la compresión física de pesos mediante proyecciones hash pseudoaleatorias sobre una tabla compartida de parámetros.

A pesar de la etiqueta de "compresión", el checkpoint empaquetado en el rango `k=32` mantiene los 109.483.778 parámetros del BERT-Base original, con una ratio de compresión de 1,00x y una reducción del 0,00 % según la propia model card. Es decir, el artefacto es funcionalmente equivalente al modelo profesor en términos de tamaño y precisión, y su interés es principalmente metodológico: sirve como referencia base del pipeline de NeuralOps antes de aplicar rangos de compresión más agresivos.

El modelo es relevante ahora por dos motivos: primero, porque documenta de forma transparente un flujo de compresión con evaluación Pareto multi-rango (k=256, 128, 64, 32) sobre un conjunto de validación de 872 muestras; segundo, porque expone las limitaciones de un compresor experimental que, en sus rangos evaluados, no logra reducir parámetros en este backbone concreto. La licencia es MIT y el uso previsto es clasificación binaria de sentimiento en inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder BERT-Base (12 capas, dimensión oculta 768), con compresor experimental `hashed_net_compressor` |
| Parametros totales | 109.483.778 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 512 tokens (límite estándar de BERT-Base; no especificado explícitamente en la model card) |
| Tipos de cuantizacion | No disponible (el checkpoint se distribuye en `pytorch_model.bin` en precisión completa) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | `pytorch_model.bin` (state dict serializado), `config.json`, `compression_summary.json`, tokenizer de `bert-base-uncased` |
| Tamano del repo | 0,2 GB |
| Rango de compresion (`k`) | 32 (showcase), evaluados también 256, 128 y 64 |
| Ratio de compresion fisica | 1,00x (0,0 % de ahorro) |
| Libreria | `neuralops` |

## Arquitectura y entrenamiento

El modelo parte de `google-bert/bert-base-uncased`, un transformer encoder de 12 capas y 768 dimensiones ocultas, preentrenado de forma estándar y ajustado posteriormente en GLUE SST-2. Sobre esa base, NeuralOps aplica el compresor `hashed_net_factory` (familia `experimental`), que proyecta las matrices de pesos en una tabla compacta de parámetros compartidos mediante hash pseudoaleatorio. La implementación de referencia está en `neuralops/compression/experimental/hashed_net_compressor.py` del repositorio de NeuralOps.

La evaluación se realizó físicamente en una NVIDIA GeForce RTX 3090 (24 GB) sobre el split de validación de SST-2 (872 muestras). El pipeline de NeuralOps aplica "LoRA healing" (r=8, 50 pasos, lr=2e-4, presupuesto de 45 segundos) cuando la compresión zero-shot degrada la precisión más de 2,0 puntos con una reducción superior a 1,10x. En este checkpoint, sin embargo, el rango `k=32` no aplicó LoRA healing y conservó la precisión del profesor. No se documentan en la información disponible detalles sobre el número de tokens de ajuste en SST-2, la composición del dataset de preentrenamiento ni el uso de RLHF/DPO.

## Capacidades

- Clasificación binaria de sentimiento (positivo/negativo) en inglés, con dos etiquetas de salida.
- Inferencia sobre secuencias de hasta 512 tokens, adecuada para reseñas y textos cortos o medios.
- Compatible con el ecosistema `transformers` mediante `BertForSequenceClassification` tras reconstruir la topología comprimida.
- Carga directa desde Hugging Face Hub con la API universal de NeuralOps (`load_surgeried_model`).
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso.
- No dispone de modo thinking, visión, audio ni capacidades multimodales.
- Multilingüismo limitado al inglés, dado el tokenizador `bert-base-uncased`.
- Sirve como baseline de referencia dentro del zoo de compresión de NeuralOps para comparar rangos `k`.

## Casos de uso

- Análisis de sentimiento en reseñas de producto: el modelo clasifica opiniones positivas o negativas en inglés con una precisión reportada del 91,63 % en SST-2, suficiente para monitorizar satisfacción en catálogos de comercio electrónico.
- Moderación de comentarios en foros y comunidades: permite filtrar mensajes con tono negativo de forma automática, procesando lotes de textos cortos en una GPU consumer.
- Baseline para experimentos de compresión: investigadores pueden usar este checkpoint como referencia "sin pérdida" (ratio 1,00x) al evaluar variantes más agresivas del compresor `hashed_net_compressor` en otros rangos.
- Validación de pipelines de NeuralOps: sirve para comprobar que la reconstrucción de la topología comprimida y la carga del state dict con `strict=False` funcionan correctamente antes de desplegar modelos con compresión real.
- Clasificación de feedback de clientes en soporte técnico: integrado en un pipeline de NLP, permite etiquetar tickets o encuestas de satisfacción (CSAT) en inglés y enrutar los negativos a revisión humana.
- Investigación educativa sobre compresión de modelos: al ser un artefacto pequeño (0,2 GB), es adecuado para reproducir el flujo de compresión y LoRA healing en entornos con recursos limitados.
- Análisis de sentimiento en redes sociales: con textos cortos en inglés, puede desplegarse en servicios de monitorización de marca para detectar picos de opinión negativa.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente):

| Rank (`k`) | Ratio fisico | Parametros comprimidos (reduccion) | Precision zero-shot | Precision con healing | Paridad vs profesor (91,63 %) |
|:---:|:---:|---:|---:|---:|---:|
| 256 | 1,00x | 109.483.778 (-0,0 %) | 91,63 % | 91,63 % | +0,00 % |
| 128 | 1,00x | 109.483.778 (-0,0 %) | 91,63 % | 91,63 % | +0,00 % |
| 64 | 1,00x | 109.483.778 (-0,0 %) | 91,63 % | 91,63 % | +0,00 % |
| 32 (publicado) | 1,00x | 109.483.778 (-0,0 %) | 91,63 % | 91,63 % | +0,00 % |

| Metrica | Dataset | Split | Valor |
|---|---|---|---|
| Accuracy | GLUE SST-2 | validation (872 muestras) | 91,63 % |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 0,45 GB para los pesos (109,5 M de parámetros × 4 bytes) más overhead de activaciones y tokenizador; en la práctica, menos de 1 GB en total para lotes pequeños.
- VRAM estimada en FP16: aproximadamente 0,22 GB para los pesos.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; el autor evaluó en una NVIDIA GeForce RTX 3090 (24 GB), pero el modelo cabe holgadamente en GTX 1650, RTX 3060, RTX 4090, A100 y H100.
- Cabe en GPU consumer sin problema, incluidas las de gama baja con 4 GB o más.
- Opciones de despliegue: `transformers` con `BertForSequenceClassification` tras reconstruir la topología con `neuralops.core.compression_pipeline.compress_model`; también es posible exportar a TorchScript u ONNX tras la reconstrucción. No se documenta soporte nativo para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles en la información proporcionada; al tratarse de un BERT-Base estándar, se espera un throughput alto en GPU (cientos de secuencias por segundo en lotes), pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | SST-2 (accuracy) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `bert-comp-hashed-net-compressor-sst2` (este) | 109,5 M | 512 | 91,63 % | MIT | Hugging Face, librería `neuralops` |
| `google-bert/bert-base-uncased` (fine-tuned SST-2) | 109,5 M | 512 | 91,63 % (referencia del profesor) | Apache 2.0 | Hugging Face, `transformers` |
| `distilbert-base-uncased-finetuned-sst-2-english` | 66,9 M | 512 | ~91 % (referencia habitual, no verificada aquí) | Apache 2.0 | Hugging Face, `transformers` |
| `roberta-base` fine-tuned en SST-2 | 124,6 M | 514 | ~94-95 % (referencia habitual, no verificada aquí) | MIT | Hugging Face, `transformers` |

La comparativa directa con DistilBERT y RoBERTa se incluye como referencia de categoría (clasificación de sentimiento en inglés); los valores de esos modelos no proceden de la información proporcionada y deben verificarse en sus respectivas model cards.

## Limitaciones y advertencias

- El checkpoint publicado no logra ninguna reducción de parámetros (ratio 1,00x), por lo que no aporta beneficios de eficiencia frente al BERT-Base original; su valor es metodológico y de referencia.
- La precisión de 91,63 % está declarada por el autor y marcada como no verificada (`verified: false`) en el model-index.
- El compresor `hashed_net_compressor` está etiquetado como `experimental`; su estabilidad y comportamiento en producción no están garantizados.
- El modelo solo soporta inglés y clasificación binaria de sentimiento; no es un modelo generativo ni apto para tareas zero-shot fuera de SST-2.
- Riesgo de alucinación no aplica en sentido generativo, pero sí de clasificaciones erróneas en dominios distintos al de entrenamiento (reseñas de películas), especialmente con sarcasmo, negaciones complejas o jerga.
- Sesgos heredados de `bert-base-uncased` y de SST-2, que no está balanceado demográficamente ni cubre todos los registros lingüísticos.
- La licencia MIT permite uso comercial, pero el modelo base `bert-base-uncased` está bajo Apache 2.0; conviene revisar ambas compatibilidades en producción.
- El proceso de carga requiere reconstruir la topología comprimida con NeuralOps antes de cargar el state dict (`strict=False`), lo que añade una dependencia de la librería y un paso extra frente a un `from_pretrained` estándar.
- El repositorio tiene 46 descargas y 0 likes en el momento de la consulta, lo que indica una adopción muy limitada y ausencia de validación comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Hooshaai/bert-comp-hashed-net-compressor-sst2
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Licencia NeuralOps (MIT): https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Implementación del compresor: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/compression/experimental/hashed_net_compressor.py
- Modelo base: https://huggingface.co/google-bert/bert-base-uncased
- Dataset GLUE SST-2: https://huggingface.co/datasets/nyu-mll/glue
