# algomaster99/pretrain-2.2e18

## Resumen

El modelo `algomaster99/pretrain-2.2e18` es un modelo de lenguaje causal tipo GPT (decoder-only) preentrenado desde cero, sin inicialización con pesos preexistentes, sobre un corpus multilingüe de español, portugués e hindi. Ha sido desarrollado por Aman Sharma (algomaster99), estudiante de doctorado en KTH, como parte de un experimento de preentrenamiento con un presupuesto de cómputo fijo de 2,2e18 FLOPs, dimensionado mediante un ajuste de scaling law IsoFLOP. El modelo tiene 172 millones de parámetros y una ventana de contexto de 1024 tokens.

La relevancia de este modelo radica en su enfoque metodológico: el tamaño y el presupuesto de entrenamiento se derivan de un análisis de scaling laws, y se aplica QK-LayerNorm para estabilizar el entrenamiento en bf16, un detalle técnico que resuelve problemas de divergencia observados en intentos previos. Aunque no está pensado para producción, sirve como referencia para estudiar el comportamiento de modelos pequeños multilingües entrenados con recursos limitados.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT decoder-only (causal) con QK-LayerNorm |
| Parametros totales | 172 millones |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1024 tokens |
| Tipos de cuantizacion | no disponible (pesos en bf16, sin cuantización publicada) |
| Idiomas soportados | Español, portugués, hindi |
| Licencia | no disponible |
| Formato de pesos | Checkpoints PyTorch (`.pt`), safetensors no disponible |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura transformer decoder-only estándar con 11 capas, 16 cabezas de atención, dimensión de embedding de 1024 y un vocabulario BPE byte-level de 32000 tokens. La configuración exacta es `GPTConfig(vocab_size=32000, block_size=1024, n_layer=11, n_head=16, n_embd=1024, dropout=0.0, bias=True, qk_norm=True)`. La innovación principal es el uso de QK-LayerNorm, que normaliza las logits de atención antes del softmax, evitando el crecimiento no acotado de los logits que causaba divergencia en entrenamientos previos con bf16.

El entrenamiento se realizó con autocast de bf16 y un presupuesto de cómputo de 2,2e18 FLOPs, dimensionado mediante un ajuste de scaling law IsoFLOP. El corpus de entrenamiento es `andre15silva/pretrain-pt-es-hi`, un conjunto deduplicado con MinHash que combina datos de `HuggingFaceFW/fineweb-2` para español y portugués, y para hindi combina fineweb-2 (hi) con el split "verified" de `ai4bharat/sangraha` (sitios verificados, PDFs OCR y habla transcrita). No se aplicó filtrado adicional de calidad o idioma más allá de la deduplicación. El tokenizer es un BPE byte-level multilingüe entrenado sobre el mismo corpus.

## Capacidades

- Generación de texto causal en español, portugués e hindi, con capacidad de continuar secuencias de hasta 1024 tokens.
- Modelo de lenguaje puro, sin fine-tuning posterior; no se reportan capacidades de instrucción, tool calling, agentes o razonamiento multi-paso.
- No soporta visión ni audio; es exclusivamente texto.
- Al ser preentrenado desde cero, no hereda sesgos de modelos base grandes, pero tampoco tiene capacidades de conversación o seguimiento de instrucciones.
- El entrenamiento con QK-LayerNorm permite una estabilidad numérica en bf16, lo que facilita la reproducción en hardware con soporte limitado de precisión.

## Casos de uso

- Investigación en scaling laws: el modelo sirve como punto de referencia para estudiar cómo el rendimiento varía con el presupuesto de cómputo y el tamaño, especialmente en configuraciones multilingües de bajos recursos.
- Evaluación de técnicas de estabilización de entrenamiento: la implementación con QK-LayerNorm puede compararse con variantes sin ella para medir el impacto en la convergencia y la pérdida final.
- Análisis de representaciones multilingües: al estar entrenado en tres idiomas de familias distintas (romance e indoaria), permite estudiar la transferencia entre lenguas y la calidad de los embeddings compartidos.
- Generación de texto en español, portugués e hindi para prototipos de bajo coste: aunque no está optimizado para producción, puede usarse en demos o experimentos donde se requiera un modelo pequeño y multilingüe.
- Base para fine-tuning en tareas específicas: al ser un modelo de 172M, puede ajustarse en una sola GPU para tareas de clasificación, generación o extracción de información en los idiomas soportados.
- Reproducción de experimentos de preentrenamiento: los checkpoints intermedios (`ckpt_iter*.pt`) permiten analizar la dinámica de entrenamiento y la evolución de la pérdida a lo largo de las iteraciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo reporta la pérdida final de entrenamiento (3,1813) y de validación (2,6673), sin comparación con otros modelos ni métricas estándar como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia: con 172M parámetros en bf16, el modelo ocupa aproximadamente 344 MB en memoria (172M × 2 bytes). La inferencia con contexto de 1024 tokens puede ejecutarse en GPUs con 4 GB o menos.
- GPU recomendadas: cualquier GPU moderna con soporte bf16 (por ejemplo, RTX 3090, RTX 4090, A100, H100). Para entrenamiento, se necesitaría al menos una GPU con 16-24 GB de VRAM, aunque el autor no especifica el hardware utilizado.
- Cabe en GPUs de consumo: sí, tanto para inferencia como para fine-tuning ligero.
- Opciones de despliegue: al ser checkpoints PyTorch nativos, se puede cargar con `torch.load` y usar con la clase `GPT` del repositorio. No se proporcionan conversiones a GGUF, ONNX o formatos para vLLM, llama.cpp u Ollama.
- Latencia y throughput: no disponibles; al ser un modelo pequeño, se espera una latencia baja en GPUs modernas, pero no hay mediciones publicadas.

## Comparativa con modelos similares

No se dispone de comparaciones directas publicadas por el autor. Como referencia, modelos de tamaño similar (alrededor de 100-200M parámetros) como GPT-2 (124M) o modelos multilingües pequeños como XLM-R (base, 278M) podrían servir de comparación, pero no hay datos de rendimiento de este modelo en benchmarks estándar. La comparativa queda pendiente de que el autor publique resultados o de que la comunidad los genere.

## Limitaciones y advertencias

- No se especifica licencia, lo que impide su uso comercial sin aclaración previa del autor.
- El modelo no ha sido fine-tuning para seguir instrucciones ni para tareas de conversación; su salida es texto libre sin control de calidad.
- El corpus de entrenamiento no fue filtrado por calidad o idioma más allá de la deduplicación, por lo que puede contener ruido, sesgos o contenido no deseado.
- La ventana de contexto de 1024 tokens es limitada para tareas que requieran contexto largo.
- No se han evaluado sesgos ni alucinaciones; al ser un modelo pequeño, es probable que genere texto incoherente o factualmente incorrecto con mayor frecuencia que modelos grandes.
- Los pesos están en formato PyTorch (`.pt`), sin conversión a formatos estándar como safetensors o GGUF, lo que limita su uso en herramientas como llama.cpp o vLLM sin trabajo adicional.
- El modelo está entrenado únicamente en español, portugués e hindi; no soporta otros idiomas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/algomaster99/pretrain-2.2e18
- Dataset de entrenamiento: https://huggingface.co/datasets/andre15silva/pretrain-pt-es-hi
- Perfil de GitHub del autor: https://github.com/algomaster99
