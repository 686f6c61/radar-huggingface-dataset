# GaryLeckey/aureon-7b

## Resumen

Aureon 7B es un modelo de lenguaje causal de 6.995.383.808 parámetros publicado por Gary Leckey (Aureon Institute) bajo licencia MIT. Se presenta como un modelo entrenado desde cero (no es un fine-tune de Qwen ni de ningún otro modelo preentrenado), aunque su arquitectura es compatible con `Qwen2ForCausalLM` y utiliza un tokenizador propio byte-level BPE con un vocabulario de 65.536 tokens. El checkpoint publicado corresponde a un ajuste supervisado (SFT) sobre un preentrenamiento previo, con 62.658.432 tokens supervisados y 1.578 pasos de SFT.

La relevancia de este modelo es limitada y debe enmarcarse con precisión: se trata de un experimento de entrenamiento desde cero con una evaluación agregada publicada por el propio autor que muestra un rendimiento bajo en tareas estructuradas. El modelo tiene 28 capas, un tamaño oculto de 3.584 y una configuración nativa de 32.768 posiciones máximas, aunque el tokenizador conserva `model_max_length=4096`. Los pesos están en bf16 y ocupan aproximadamente 14 GB.

Es importante señalar que la model card indica explícitamente que no se ha validado la calidad ni la recuperación de información a ninguna longitud de contexto concreta, y que no se reportan resultados de HumanEval ni de razonamiento general. Por tanto, esta ficha debe leerse como documentación de un checkpoint experimental y no como la de un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal compatible con `Qwen2ForCausalLM` (entrenado desde cero) |
| Parametros totales | 6.995.383.808 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 32.768 posiciones nativas (`max_position_embeddings`); tokenizador con `model_max_length=4096` |
| Tipos de cuantizacion | No disponible (pesos publicados en bf16; no se documentan cuantizaciones oficiales) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | safetensors (`model.safetensors`, ~14 GB, bf16) |
| Capas | 28 |
| Tamano oculto | 3.584 |
| Vocabulario | 65.536 tokens (BPE byte-level propio) |
| Tokens de control | BOS/EOS/padding = `<eos>` (ID 1) |
| Paso de preentrenamiento | 17.000 |
| Paso de SFT | 1.578 |
| Tokens supervisados | 62.658.432 |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura transformer causal decoder-only con 28 capas y un tamaño oculto de 3.584, empaquetada para ser compatible con la clase `Qwen2ForCausalLM` de Transformers. Esta compatibilidad es únicamente de forma: los pesos provienen de inicialización aleatoria y de un entrenamiento desde cero, no de pesos preentrenados de Qwen. El tokenizador es propio, un BPE byte-level con vocabulario de 65.536 tokens, y el checkpoint publicado corrige los identificadores BOS/EOS heredados de la exportación original (151643 y 151645, fuera del vocabulario) fijándolos en el ID 1 (`<eos>`).

El entrenamiento consta de un preentrenamiento base (checkpoint `ckpt_0017000.pt`, paso 17.000) seguido de un ajuste supervisado (`sft_0001578.pt`, paso 1.578) con 62.658.432 tokens supervisados. Los trabajos de cómputo se ejecutaron en Isambard (jobs de SFT 8602598, exportación 8602600 y evaluación 8602611). No se documentan en la información disponible detalles sobre la composición del dataset de preentrenamiento, el uso de RLHF/DPO ni innovaciones técnicas como decodificación especulativa o atención lineal. El script de preparación de metadatos usa solo la biblioteca estándar de Python y no copia los pesos.

## Capacidades

- Generación de texto causal en inglés, con prompt y `max_new_tokens` configurables.
- Formato de salida estructurado tipo "implement" y "explain" (la evaluación reportada mide recall de símbolos y F1 de línea en estas categorías).
- Compatible con `transformers`, `text-generation-inference` y endpoints compatibles según los tags del repositorio.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según el campo `language: en`.
- Capacidades especiales (thinking mode, visión, audio): no disponibles en la información proporcionada.

## Casos de uso

- Investigación sobre entrenamiento desde cero: el checkpoint permite estudiar el comportamiento de un modelo de ~7B entrenado sin inicialización preentrenada, comparando su curva de aprendizaje y sus fallos con modelos preentrenados de tamaño similar.
- Reproducción de pipelines de exportación y metadatos: el repositorio incluye un script de preparación (`prepare_aureon_model.py`) y un recibo con hashes SHA-256, útil para auditar flujos de publicación de checkpoints.
- Evaluación de tokenizadores propios: al usar un BPE byte-level de 65.536 tokens, sirve para probar la coherencia de identificadores BOS/EOS y la integración con `AutoTokenizer` en Transformers.
- Pruebas de integración con `text-generation-inference`: los tags indican compatibilidad con TGI y endpoints, por lo que puede emplearse para validar despliegues de modelos custom en infraestructura propia.
- Docencia y divulgación: útil para explicar las diferencias entre un modelo entrenado desde cero y un fine-tune, así como el impacto de un SFT limitado en la calidad final.
- Benchmarking de robustez en salidas estructuradas: los datos de evaluación (parse rate 46,24 %, recall de símbolos 24,11 %) permiten usar el modelo como caso de estudio de fallos en generación de código estructurado.

## Benchmarks y rendimiento

Los únicos resultados publicados provienen de `eval-sft-label-fix.json` sobre 1.125 filas de evaluación, con un máximo de 1.024 tokens nuevos por fila:

| Medida | Valor |
|---|---:|
| Filas de evaluación | 1.125 |
| Tasa de parseo | 0,4624 (46,24 %; 612 parseadas) |
| Recall de símbolos | 0,2411 (775 filas puntuadas) |
| F1 de línea global | 0,0356 |
| Filas "implement" | 638 |
| Recall de símbolos "implement" | 0,3005 |
| F1 de línea "implement" | 0,0164 |
| Filas "explain" | 66 |
| Recall de símbolos "explain" | 0,0614 |
| F1 de línea "explain" | 0,1904 |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni de razonamiento general en la información disponible. El autor declara explícitamente que no se reclama ningún resultado de HumanEval ni de rendimiento comparativo.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 14 GB solo para pesos; el uso en tiempo de ejecución es mayor y depende del dispositivo, el contexto y los parámetros de inferencia.
- GPU recomendadas: no disponible en la información proporcionada; por tamaño, una GPU con 24 GB o más (RTX 4090, A100 40 GB, H100) es el mínimo razonable para bf16.
- GPU de consumo: cabe en GPUs consumer de 24 GB (RTX 3090/4090) en bf16, con margen limitado para contexto y caché KV.
- Opciones de despliegue: `transformers` (documentado), `text-generation-inference` y endpoints compatibles (según tags). No se documentan recetas para llama.cpp, Ollama o vLLM.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---:|---|---|---|---|
| Aureon 7B | 6.995.383.808 | 32.768 nativas / 4.096 tokenizador | MIT | Hugging Face | Entrenado desde cero; evaluación limitada y baja en salidas estructuradas |
| Qwen2-7B | ~7.000.000.000 | 32.768 | Apache 2.0 (según versión) | Hugging Face | Preentrenado y con benchmarks públicos; arquitectura compatible |
| Mistral-7B | ~7.000.000.000 | 32.768 | Apache 2.0 | Hugging Face | Preentrenado, ampliamente evaluado y con ecosistema de cuantizaciones |
| Llama 3.1 8B | ~8.000.000.000 | 128.000 | Llama 3.1 Community License | Hugging Face | Preentrenado, con benchmarks y soporte multilingüe |

La comparación debe interpretarse con cautela: Aureon 7B no publica benchmarks comparables con estos modelos, y su evaluación propia indica un rendimiento bajo en tareas estructuradas. Los datos de los modelos alternativos se incluyen como referencia de categoría y no como resultado de una evaluación homogénea.

## Limitaciones y advertencias

- Rendimiento bajo en salidas estructuradas: la tasa de parseo del 46,24 % y el F1 de línea del 3,56 % indican que el checkpoint no es fiable para generación de implementaciones.
- Sin validación de razonamiento general, código, contexto largo ni preparación para producción; el autor lo declara explícitamente.
- Longitud de contexto: aunque la configuración nativa es de 32.768 posiciones, no se ha validado la calidad ni la recuperación a ninguna longitud concreta; el tokenizador conserva `model_max_length=4096`.
- Idiomas: solo inglés; no se documentan capacidades multilingües.
- Sesgos conocidos: no disponibles en la información proporcionada; al ser un modelo entrenado desde cero con datos no documentados, el riesgo de sesgos y alucinaciones no puede acotarse.
- Licencia MIT: permite uso comercial, pero el autor no ofrece garantías de calidad ni de idoneidad para producción.
- Metadatos corregidos manualmente: los IDs BOS/EOS originales eran incompatibles con el vocabulario; debe verificarse el ID 1 (`<eos>`) al integrar el modelo.
- El repositorio de metadatos no contiene los pesos; es necesario colocar `model.safetensors` desde la exportación fuente antes de cargar el modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/GaryLeckey/aureon-7b
- Repositorio de código y scripts de preparación: no disponible como enlace público en la información proporcionada
- Paper o blog técnico: no disponible en la información proporcionada
- Demo o espacio interactivo: no disponible en la información proporcionada
