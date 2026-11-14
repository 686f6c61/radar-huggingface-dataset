# Hooshaai/bert-comp-a3-compressor-sst2

## Resumen
bert-comp-a3-compressor-sst2 es un checkpoint de BERT-base comprimido físicamente y afinado para clasificación de sentimiento en GLUE SST-2, publicado por el usuario Hooshaai dentro del ecosistema NeuralOps. Parte de google-bert/bert-base-uncased (109.483.778 parámetros, 12 capas, dimensión oculta 768) y aplica el compresor `a3_compressor` (A3Compressor), una factorización SVD de bajo rango sensible a activaciones con búsqueda de rango STRS y recalibración de LayerNorm. El checkpoint serializado corresponde al rango Pareto k=256, con 102.405.890 parámetros y una reducción del 6,46% (ratio de compresión físico 1,069x).

El interés práctico del modelo no reside en una ganancia de capacidad, sino en documentar el compromiso entre compresión y precisión: el modelo profesor alcanza 91,63% de accuracy en la validación de SST-2 y el checkpoint comprimido mantiene 91,17% en modo zero-shot (delta de -0,46 puntos), sin necesidad de aplicar el mecanismo de "LoRA healing" previsto por NeuralOps para caídas superiores a 2 puntos. El repositorio incluye telemetría de cuatro rangos evaluados (k=256, 128, 64 y 32) sobre 872 muestras de validación, lo que lo convierte en un caso de estudio reproducible para pipelines de compresión de modelos.

Se distribuye con licencia MIT, solo en inglés, y está pensado para experimentación en eficiencia de modelos más que para despliegue en producción a gran escala: la compresión obtenida es modesta y el modelo sigue siendo un BERT-base de aproximadamente 100 millones de parámetros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT-base), 12 capas, dimensión oculta 768; checkpoint comprimido mediante A3Compressor (SVD factorizado sensible a activaciones) |
| Parametros totales | 102.405.890 (comprimido, k=256); modelo base original 109.483.778 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (arquitectura BERT-base, típicamente 512 tokens, no declarado en la información) |
| Tipos de cuantizacion | no disponible (se mencionan buffers de cuantización en los artefactos, sin detallar tipos) |
| Idiomas soportados | inglés (en) |
| Licencia | MIT |
| Formato de pesos | pytorch_model.bin (state dict serializado con factores de bajo rango y adaptadores LoRA integrados); tokenizer en vocab.txt, tokenizer.json, tokenizer_config.json |

## Arquitectura y entrenamiento
El modelo base es google-bert/bert-base-uncased, un transformer encoder de 12 capas y 768 dimensiones ocultas preentrenado de forma estándar. Sobre ese checkpoint afinado en GLUE SST-2 se aplica el compresor A3 (`A3Compressor`, familia low_rank), que factoriza matrices mediante SVD ponderada por el segundo momento de las activaciones (E[x²]), con opción de blanqueado de Cholesky completo, búsqueda de rango STRS y recalibración posterior de LayerNorm. El resultado es una reducción física de parámetros del 6,46% (ratio 1,069x) en el rango k=256.

El pipeline NeuralOps evalúa varios rangos (256, 128, 64, 32) sobre 872 muestras de validación de SST-2 y, cuando la compresión zero-shot degrada la accuracy más de 2,0 puntos con reducción superior a 1,10x, aplica un "LoRA healing" dirigido (r=8, 50 pasos, lr=2e-4, presupuesto de 45 segundos). En el caso del checkpoint publicado (k=256) no se aplicó recuperación LoRA, según indica la model card. No se detallan en la información disponible el volumen de tokens de entrenamiento, la composición del dataset más allá de GLUE SST-2 ni si hubo RLHF o DPO.

## Capacidades
- Clasificación de sentimiento binaria (negativo/positivo) en inglés, sobre texto de una o varias frases.
- Inferencia como clasificador BERT estándar (`BertForSequenceClassification`, num_labels=2) tras reconstruir la topología comprimida y cargar el state dict.
- Carga simplificada mediante la API `load_surgeried_model` del hub de NeuralOps, que devuelve modelo y tokenizer en una sola llamada.
- Telemetría de compresión legible por máquina (`compression_summary.json`) para reproducir y auditar los cuatro rangos evaluados.
- No dispone de tool calling, function calling, capacidades de agente, visión, audio ni modo de razonamiento extendido.
- Capacidad multilingüe limitada al inglés, coherente con el tokenizer bert-base-uncased.

## Casos de uso
- Análisis de sentimiento en reseñas de producto: clasificación positiva/negativa de textos cortos en inglés con una accuracy de referencia del 91,17% en SST-2, suficiente para monitorización de opiniones a bajo coste computacional.
- Moderación de comentarios en foros y redes: uso como clasificador auxiliar de tono en pipelines de premoderación, aprovechando que el checkpoint comprimido ocupa menos memoria que el BERT-base original.
- Investigación en compresión de modelos: reproducción del experimento Pareto k=256/128/64/32 con `compression_summary.json` para comparar métodos de factorización de bajo rango sobre una tarea estándar de GLUE.
- Evaluación de pipelines NeuralOps: caso de prueba para validar la reconstrucción de topología comprimida y la carga de state dicts con factores de bajo rango integrados antes de aplicar el modelo a otros dominios.
- Prototipado rápido de clasificadores de texto: punto de partida para fine-tuning adicional sobre SST-2 u otras tareas de clasificación en inglés, con licencia MIT que facilita la experimentación.
- Docencia y demostraciones de eficiencia: ejemplo didáctico de cómo una reducción del 6,5% de parámetros apenas altera la accuracy en una tarea downstream consolidada.

## Benchmarks y rendimiento

| Rank (k) | Ratio físico | Parámetros comprimidos (reducción) | Accuracy zero-shot | Accuracy con healing | Paridad vs profesor (91,63%) |
|:---:|:---:|---:|---:|---:|---:|
| 256 (checkpoint publicado) | 1,07x | 102.405.890 (-6,5%) | 91,17% | 91,17% | -0,46% |
| 128 | 1,08x | 101.177.090 (-7,6%) | 90,14% | 90,14% | -1,49% |
| 64 | 1,06x | 103.289.090 (-5,7%) | 90,71% | 90,71% | -0,92% |
| 32 | 1,05x | 104.439.554 (-4,6%) | 91,17% | 91,17% | -0,46% |

Evaluación sobre la partición de validación de GLUE SST-2 (872 muestras) en NVIDIA GeForce RTX 3090 (24 GB). Los valores proceden del model-index declarado por el autor y no están verificados de forma independiente.

## Requisitos de hardware
- VRAM estimada para inferencia: en torno a 0,8-1,2 GB en fp32 para los ~102 millones de parámetros, más memoria de activaciones; cifra no declarada explícitamente en la información disponible.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM; el autor evaluó en RTX 3090 (24 GB), pero el modelo cabe holgadamente en GPUs de consumo.
- Cabe en GPU de consumo: sí, incluidas RTX 3060, RTX 4060, RTX 4090 y GPUs integradas con suficiente memoria compartida.
- Opciones de despliegue: el pipeline oficial requiere la librería `neuralops` para reconstruir la topología comprimida y cargar el state dict; no se documenta exportación a GGUF, vLLM, TGI, Ollama ni llama.cpp en la información disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Accuracy SST-2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| bert-comp-a3-compressor-sst2 (k=256) | 102.405.890 (comprimido) | no disponible | 91,17% (val) | MIT | Hugging Face, librería neuralops |
| google-bert/bert-base-uncased (profesor SST-2) | 109.483.778 | 512 tokens (arquitectura) | 91,63% (val) | Apache 2.0 | Hugging Face, transformers |
| DistilBERT-base-uncased-finetuned-sst-2 | ~66 millones | 512 tokens (arquitectura) | no disponible en la información | Apache 2.0 | Hugging Face, transformers |

La comparación con DistilBERT se incluye por categoría (clasificador SST-2 de tamaño reducido), pero no se dispone de su accuracy exacta en esta información, por lo que no se puede establecer una comparación numérica directa.

## Limitaciones y advertencias
- La compresión es modesta (6,46% de reducción) y el checkpoint sigue siendo un BERT-base de ~100 millones de parámetros; no supone un salto de eficiencia comparable a destilación o cuantización agresiva.
- El resultado de 91,17% está declarado por el autor y marcado como no verificado (`verified: false`); conviene reproducirlo antes de usarlo como referencia.
- Solo soporta inglés; no se declaran capacidades multilingües.
- Riesgo de alucinación no aplica directamente a una tarea de clasificación, pero el modelo puede producir predicciones erróneas en dominios alejados de SST-2 (por ejemplo, sarcasmo, negaciones complejas o jerga).
- La licencia MIT permite uso comercial, pero el modelo base google-bert/bert-base-uncased se distribuye bajo Apache 2.0; conviene revisar la compatibilidad y las atribuciones.
- El despliegue está atado a la librería `neuralops` para reconstruir la topología comprimida; no hay formatos estándar (GGUF, safetensors) documentados, lo que limita la integración con servidores de inferencia convencionales.
- No se documentan sesgos específicos del checkpoint; al heredar de BERT-base, arrastra los sesgos del corpus original.
- La model card menciona un repo_id distinto (`tahamajs/bert-comp-a3-compressor-sst2`) en los ejemplos de código, lo que puede generar confusión al cargar el modelo.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/Hooshaai/bert-comp-a3-compressor-sst2
- Modelo base: https://huggingface.co/google-bert/bert-base-uncased
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Implementación del compresor A3: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/compression/low_rank/a3_compressor.py
- Licencia NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset GLUE SST-2: https://huggingface.co/datasets/nyu-mll/glue
