# Hooshaai/bert-comp-roast-hashed-linear-sst2

## Resumen

`bert-comp-roast-hashed-linear-sst2` es un checkpoint experimental de BERT-Base (`google-bert/bert-base-uncased`) comprimido físicamente mediante la técnica `roast_hashed_linear` (clase `ROASTCompressor`) de la librería NeuralOps y posteriormente "curado" con adaptadores LoRA de bajo rango. Lo publica el usuario Hooshaai (el código fuente de NeuralOps pertenece al repositorio `tahamajs/NeuralOps`) como parte de un zoo de modelos comprimidos orientado a estudiar el equilibrio entre ratio de compresión y precisión en tareas downstream. El modelo está ajustado para clasificación de sentimiento binaria sobre GLUE SST-2.

La propuesta técnica es un ejercicio de compresión agresiva: se reemplazan capas lineales y Conv1D elegibles por `ROASTLinear`, un esquema de compartición de pesos hardware-aware basado en hashing, reduciendo el recuento de parámetros de 109.483.778 a 24.622.850 (una reducción del 77,51 %, ratio físico de 4,446x). Sobre esa topología comprimida se aplica un "healing" LoRA de rango 8 durante 50 pasos para recuperar parte de la precisión perdida.

El resultado, sin embargo, es un modelo que no es utilizable en producción: la precisión en validación de SST-2 es del 50,92 %, prácticamente equivalente a un clasificador aleatorio binario (el baseline del profesor es 91,63 %). El interés del checkpoint es, por tanto, documental y de investigación: sirve como referencia negativa y como ejemplo reproducible del pipeline de compresión de NeuralOps, no como clasificador de sentimiento funcional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT-Base) con capas lineales/Conv1D sustituidas por `ROASTLinear` (weight sharing por hashing) |
| Parametros totales | 24.622.850 (modelo comprimido); base original 109.483.778 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (BERT-Base estandar: 512 tokens) |
| Tipos de cuantizacion | no disponible (el checkpoint se serializa en `pytorch_model.bin`, sin variantes GGUF/AWQ/GPTQ publicadas) |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | PyTorch (`pytorch_model.bin`), requiere reconstruccion de topologia con NeuralOps antes de cargar |

## Arquitectura y entrenamiento

La arquitectura de partida es BERT-Base uncased: 12 capas de encoder, dimensión oculta D=768 y 109.483.778 parámetros. Sobre ese modelo se aplica el compresor `roast_hashed_linear`, que reemplaza capas lineales y Conv1D elegibles por `ROASTLinear`, un mecanismo de compartición de pesos hardware-aware basado en hashing. El resultado es un grafo con 24.622.850 parámetros, es decir, una reducción del 77,51 % y un ratio de compresión físico de 4,446x. La evaluación multi-rank (k=256, 128, 64, 32) reporta el mismo recuento de parámetros comprimidos y el mismo ratio en todos los casos, lo que sugiere que la variación de rango afecta a la estructura de compartición pero no al número total de pesos almacenados.

El ajuste se realizó sobre GLUE SST-2. Cuando la compresión zero-shot degrada la precisión más de 2,0 puntos con una reducción superior a 1,10x, NeuralOps aplica un "healing" LoRA con rango r=8, 50 pasos, learning rate 2e-4 y un presupuesto de 45 segundos. En el checkpoint publicado (k=64) el healing eleva la precisión del 49,20 % zero-shot al 50,92 %. No se documentan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO; el pipeline es exclusivamente de compresión más ajuste supervisado de clasificación.

## Capacidades

- Clasificación de sentimiento binaria (positivo/negativo) sobre texto en inglés, con dos etiquetas de salida.
- Inferencia sobre entradas tokenizadas con el vocabulario estándar de `bert-base-uncased`.
- Reconstrucción programática de la topología comprimida mediante `compress_model` de NeuralOps y carga de pesos con `strict=False`.
- Carga de un solo paso mediante la API `load_surgeried_model` del hub de NeuralOps.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni uso como agente.
- No soporta visión, audio ni modo "thinking".
- Capacidad multilingüe: únicamente inglés.
- Generación de texto: no aplicable (es un modelo de clasificación, no causal).

## Casos de uso

- Investigación sobre compresión de modelos: sirve como punto de referencia reproducible para medir la degradación de un BERT-Base al aplicar `roast_hashed_linear` con k=64 y healing LoRA, comparando contra el baseline del profesor (91,63 %).
- Estudio de esquemas de compartición de pesos por hashing: el checkpoint permite inspeccionar cómo se distribuyen los pesos compartidos en las capas lineales y Conv1D y analizar el impacto en la representación interna.
- Validación de pipelines de reconstrucción: útil para probar que la secuencia `compress_model` + `load_state_dict(strict=False)` reproduce fielmente la topología antes de desplegar variantes comprimidas en otros dominios.
- Benchmarking de técnicas de "healing": permite comparar el efecto de LoRA r=8 con 50 pasos frente a otras estrategias de recuperación sobre un modelo ya comprimido, usando la precisión SST-2 como métrica.
- Docencia y divulgación: ejemplo didáctico de hasta qué punto una compresión del 77,5 % puede colapsar la capacidad discriminativa de un encoder cuando no se acompaña de un ajuste suficiente.
- Referencia negativa en evaluación de clasificadores: sirve como control de "modelo degradado" en experimentos que midan la sensibilidad de métricas de sentimiento a la compresión.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (no verificados, `verified: false`):

| Rank (k) | Ratio fisico | Parametros comprimidos | Zero-shot Acc | Acc con LoRA | Paridad vs profesor (91,63 %) |
|:---:|:---:|---:|---:|---:|---:|
| 256 | 4,45x | 24.622.850 (-77,5 %) | 49,20 % | 50,92 % | -40,71 % |
| 128 | 4,45x | 24.622.850 (-77,5 %) | 49,20 % | 50,80 % | -40,83 % |
| 64 (publicado) | 4,45x | 24.622.850 (-77,5 %) | 49,20 % | 50,92 % | -40,71 % |
| 32 | 4,45x | 24.622.850 (-77,5 %) | 49,20 % | 50,46 % | -41,17 % |

Evaluación realizada sobre el split de validación de GLUE SST-2 (872 muestras) en una NVIDIA GeForce RTX 3090 (24 GB). No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint pesa 47,2 MB según la model card; en FP32 ocupa aproximadamente 0,1 GB, por lo que cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM; el autor reporta evaluaciones en RTX 3090 (24 GB), pero el modelo es sobredimensionado para ese hardware.
- Cabe en GPU consumer: sí, en cualquier RTX, GTX o incluso en CPU para inferencia puntual.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI. El despliegue requiere la librería NeuralOps para reconstruir la topología antes de cargar los pesos; no hay variantes GGUF ni safetensors publicadas.
- Latencia y throughput: no disponibles en la información proporcionada. El healing LoRA se ejecutó con un presupuesto de 45 segundos en RTX 3090, pero no se reportan cifras de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | SST-2 (val) | Licencia | Disponibilidad |
|---|---:|---|---:|---|---|
| `Hooshaai/bert-comp-roast-hashed-linear-sst2` | 24,6 M | no disponible | 50,92 % | MIT | Hugging Face, requiere NeuralOps |
| `google-bert/bert-base-uncased` (profesor) | 109,5 M | 512 | 91,63 % | Apache 2.0 | Hugging Face, transformers |
| `distilbert-base-uncased-finetuned-sst-2-english` | 66,9 M | 512 | no disponible en la informacion | Apache 2.0 | Hugging Face, transformers |

La comparativa con DistilBERT se incluye como referencia de tamaño, pero no se dispone de su precisión SST-2 en la información proporcionada; no se han verificado cifras de terceros.

## Limitaciones y advertencias

- Precisión de 50,92 % en SST-2, prácticamente equivalente a un clasificador aleatorio binario; el modelo no es funcional para clasificación de sentimiento real.
- Degradación de 40,71 puntos respecto al profesor (91,63 %), lo que indica que la compresión `roast_hashed_linear` con k=64 destruye la capacidad discriminativa del encoder.
- El healing LoRA solo recupera 1,72 puntos (de 49,20 % a 50,92 %), insuficiente para compensar la pérdida.
- Requiere la librería NeuralOps para reconstruir la topología; no es cargable directamente con `transformers` sin ese paso previo.
- Solo inglés; no se ha evaluado en otros idiomas ni dominios.
- Riesgo de alucinación no aplicable en sentido generativo, pero sí de predicciones sin fundamento dada la baja precisión.
- Sesgos: no documentados en la información proporcionada; al derivar de `bert-base-uncased` hereda los sesgos del corpus original, pero no se han medido.
- Licencia MIT, permite uso comercial, aunque el estado experimental y la precisión hacen desaconsejable cualquier uso en producción.
- El checkpoint se distribuye en `pytorch_model.bin` (pickle), lo que implica riesgos de seguridad al cargar pesos de origen no verificado.
- Los resultados de benchmarks están marcados como no verificados por el autor.

## Enlaces

- Hugging Face: https://huggingface.co/Hooshaai/bert-comp-roast-hashed-linear-sst2
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Implementación del compresor: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/compression/experimental/roast_hashed_linear.py
- Licencia NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Modelo base: https://huggingface.co/google-bert/bert-base-uncased
- Dataset GLUE SST-2: https://huggingface.co/datasets/nyu-mll/glue
