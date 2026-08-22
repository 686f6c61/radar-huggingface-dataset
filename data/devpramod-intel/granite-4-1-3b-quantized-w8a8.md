# devpramod-intel/granite-4.1-3b-quantized.w8a8

## Resumen

`granite-4.1-3b-quantized.w8a8` es una cuantización INT8 (esquema W8A8) del modelo denso `ibm-granite/granite-4.1-3b`, publicada por `devpramod-intel`. El modelo base, desarrollado por IBM, pertenece a la familia Granite 4.1 de modelos de lenguaje densos de 3B, 8B y 30B parámetros, con variantes instruccionales que mejoran el tool calling, el seguimiento de instrucciones, la generación de código y el razonamiento matemático. Esta variante cuantizada reduce el tamaño del checkpoint a aproximadamente la mitad (~3,9 GiB frente a ~7,8 GiB en BF16) y está pensada para medir el rendimiento de inferencia con kernels INT8, tanto en CPU Xeon con AMX como en GPU.

El checkpoint se generó con una receta post-training de un solo paso que combina SmoothQuant y GPTQ mediante la librería `llm-compressor` de vLLM, cuantizando únicamente las capas `Linear` de los bloques transformer y dejando `lm_head` en BF16. Es importante señalar que el autor declara explícitamente que no se ha ejecutado ninguna evaluación de precisión sobre este checkpoint: su propósito es exclusivamente el benchmarking de rendimiento, por lo que cualquier uso en producción donde la calidad importe requiere una evaluación previa.

La arquitectura es un transformer decoder-only denso con bloques de estilo Llama (RMSNorm, q/k/v y gate/up/down projections), con una ventana de contexto de 32 768 tokens. Está disponible bajo licencia Apache 2.0 y se distribuye en formato `safetensors` con configuración `compressed-tensors`, compatible con vLLM para despliegue directo.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso, bloques estilo Llama (GraniteForCausalLM) |
| Parametros totales | 3 659 737 600 (~3,66 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 32 768 tokens |
| Tipos de cuantizacion | W8A8 (INT8): pesos INT8 simetricos por canal; activaciones INT8 simetricas dinamicas por token; `lm_head` en BF16 |
| Idiomas soportados | Ingles (segun model card; el base Granite 4.1 soporta multilingue) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (compressed-tensors, formato int-quantized) |

## Arquitectura y entrenamiento

El modelo base es un `GraniteForCausalLM` denso, de arquitectura transformer decoder-only con bloques de estilo Llama: proyecciones q/k/v y gate/up/down, normalizacion RMSNorm y `tie_word_embeddings` activado (por eso `lm_head` se deja en BF16, para no perturbar el embedding de entrada). La cuantizacion se aplico solo a las capas `Linear` internas de los bloques transformer, con esquema W8A8: pesos INT8 simetricos por canal y activaciones INT8 simetricas dinamicas por token.

El proceso de cuantizacion fue post-training en un solo paso: primero SmoothQuant (con `smoothing_strength=0.8`, `dampening_frac=0.1`, observador MSE) y despues GPTQ, usando `llm-compressor` 0.9.0.4 y `compressed-tensors` 0.13.0. La calibracion se hizo con 512 muestras del dataset `neuralmagic/LLM_compression_calibration` (split train, `shuffle(seed=42).select(512)`), con `max_seq_length=8192`. Los knobs de la receta se tomaron de las recetas publicadas por Red Hat AI para los precedentes arquitectonicos mas cercanos (granite-3.1-8b-instruct y granite-3.1-2b-instruct en W8A8, y granite-4.1-8b-fp8), con desviaciones deliberadas: 512 muestras de calibracion en vez de 3072 (W8A8 es menos sensible a la calibracion que W4A16) y `sequential_targets` fijado a la clase de capa decoder.

No se realizo entrenamiento adicional, RLHF ni DPO: el modelo es una cuantizacion post-training del checkpoint base ya instruccado. La verificacion realizada incluye la comprobacion de que todos los pesos y escalas cuantizados son finitos (sin NaN/Inf), que la configuracion de cuantizacion es correcta y que el checkpoint carga y genera texto coherente.

## Capacidades

- Generacion de texto conversacional con formato de chat, usando el template de chat del tokenizer del modelo base.
- Tool calling y function calling: el modelo base Granite 4.1 esta entrenado para uso de herramientas, y esta cuantizacion hereda esa capacidad (aunque sin verificacion de calidad).
- Razonamiento y matematicas: el base 4.1 mejora el razonamiento matematico y la resolucion de problemas.
- Generacion de codigo: soporte de tareas de programacion, heredado del base.
- RAG (retrieval-augmented generation): el base soporta integracion con sistemas de recuperacion.
- Salida estructurada JSON: el base puede generar JSON estructurado.
- Inferencia eficiente en CPU Xeon con AMX (INT8) y en GPU con kernels INT8, gracias al esquema W8A8.
- Compatible con vLLM para despliegue directo con `vllm serve`.

## Casos de uso

- **Benchmarking de inferencia en CPU Xeon con AMX**: el proposito original del checkpoint. Permite medir throughput y latencia de kernels INT8 en CPUs con AMX, comparando con el checkpoint BF16.
- **Benchmarking de inferencia en GPU**: evaluar el rendimiento de kernels INT8 en GPUs (p. ej. RTX 4090, A100, H100) para decidir si la cuantizacion compensa frente a BF16 en produccion.
- **Despliegue de chat en entornos con recursos limitados**: con ~3,9 GB de pesos, cabe en GPUs de consumo y permite servir un asistente conversacional de 3B con contexto de 32K en hardware modesto.
- **Generacion de codigo en pipelines de CI/CD**: el modelo base 4.1 soporta tareas de codigo y esta cuantizacion reduce el footprint para integrarse en entornos de integracion continua con vLLM.
- **RAG en intranets empresariales**: con 32K de contexto y soporte para herramientas, se puede usar como motor de respuestas sobre documentacion interna, desplegado en CPU o GPU de gama media.
- **Prototipado rapido de agentes**: dado que el base soporta tool calling y JSON, esta variante permite prototipar agentes con bajo coste de VRAM, aunque requiere validacion de calidad antes de produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de precision para este checkpoint. La model card indica explicitamente que no se ejecuto ninguna evaluacion de accuracy y que el modelo existe para medir rendimiento de inferencia. Los datos que se citan a continuacion son estimaciones por precedente, no mediciones de este modelo, y no deben usarse como resultados reales:

| Evidencia | Recuperacion estimada vs BF16 |
|---|---|
| granite-3.1-8b-instruct W8A8, misma receta (card de Red Hat) | OpenLLM v1 99,95% (70,26 vs 70,30), OpenLLM v2 98,64%, HumanEval 99,3% |
| granite-3.1-2b-instruct W8A8 (card de Red Hat) | OpenLLM v1 99,52% (61,68 vs 61,98) |
| Derivado de granite-4.1-8b con este mismo script (interno, 7 datasets) | Agregado ≈99,4%, 46/48 decodificaciones identicas en CPU |

Sobre esa base, el autor estima una recuperacion esperada de ~99-100% en suites de conocimiento/razonamiento de opcion multiple y ~98-99% en suites generativas. Para obtener un numero defendible, se recomienda ejecutar `lm-eval` comparando este checkpoint con el base BF16 y reportar el ratio. No hay datos publicados de latencia ni throughput especificos.

## Requisitos de hardware

- **VRAM estimada para inferencia**: ~4 GB de VRAM para los pesos (3,9 GiB en disco) mas overhead de activaciones y KV cache; con contexto largo (32K) puede aumentar. En total, un modelo utilizable en GPUs de 8 GB o menos con contexto moderado.
- **GPU recomendadas**: RTX 3060/4060 (12 GB), RTX 4090, A100, H100; el esquema INT8 aprovecha kernels INT8 en GPUs modernas.
- **CPU**: compatible con Intel Xeon con AMX (INT8) y CPUs con instrucciones AVX-512; adecuado para inferencia en servidores sin GPU.
- **Despliegue**: vLLM (soporte nativo via `vllm serve`), `transformers` (carga con `AutoModelForCausalLM`), y a traves de GGUF (versiones de terceros) con llama.cpp u Ollama.
- **Latencia y throughput**: no disponibles para este checkpoint; el proposito del modelo es precisamente medirlos en cada plataforma.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Formato |
|---|---|---|---|---|---|
| devpramod-intel/granite-4.1-3b-quantized.w8a8 (este) | 3,66 B | 32 768 | W8A8 (INT8) | Apache 2.0 | Safetensors (compressed-tensors) |
| ibm-granite/granite-4.1-3b (base) | 3,66 B | 32 768 | BF16 | Apache 2.0 | Safetensors |
| SandLogicTechnologies/granite-4.1-3b-GGUF | 3,66 B | 32 768 | GGUF (Q4_K_M, etc.) | Apache 2.0 | GGUF |
| RedHatAI/granite-3.1-8b-instruct-quantized.w8a8 | ~8 B | 32 768 | W8A8 (INT8) | Apache 2.0 | Safetensors (compressed-tensors) |

La comparativa principal es contra el base BF16 del mismo modelo (misma arquitectura y contexto, diferencia en precision y tamano) y contra las versiones GGUF de terceros que permiten cuantizacion mas agresiva (Q4) a cambio de posible perdida de calidad. El modelo de Red Hat de 8B es el precedente arquitectonico directo para esta receta, pero es de mayor tamano y de la generacion 3.1, no 4.1.

## Limitaciones y advertencias

- **Sin evaluacion de precision**: el autor declara que no se ejecuto ningun benchmark de accuracy sobre este checkpoint; los numeros de recuperacion son estimaciones por precedente, no mediciones. Para uso en produccion se debe evaluar contra el base BF16.
- **Idioma**: la model card indica solo ingles (`en`), aunque el modelo base Granite 4.1 soporta multilingue; el comportamiento multilingue de esta variante no ha sido verificado.
- **Riesgo de alucinacion**: como todo LLM, puede generar contenido falso o incoherente, y la cuantizacion puede amplificar pequenos errores; sin evaluacion, el riesgo no esta cuantificado.
- **Capa `lm_head` en BF16**: el `lm_head` no se cuantizo para preservar el embedding de entrada (por `tie_word_embeddings`), lo que implica que la salida final se computa en BF16, con el consiguiente coste de memoria y computo adicional en esa capa.
- **Limitaciones de contexto**: aunque el modelo soporta 32 768 tokens, la calibracion se hizo con `max_seq_length=8192`; el rendimiento con contextos mas largos no ha sido validado.
- **Restricciones de uso**: licencia Apache 2.0 permite uso comercial, pero el modelo no debe usarse para aplicaciones de alta responsabilidad sin evaluacion previa (medico, legal, etc.) y sin supervisión humana.
- **Sesgos**: no se han documentado sesgos especificos de este checkpoint; hereda los del modelo base, que no han sido evaluados en esta variante.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/devpramod-intel/granite-4.1-3b-quantized.w8a8
- Modelo base: https://huggingface.co/ibm-granite/granite-4.1-3b
- Coleccion de modelos cuantizados de IBM Granite: https://huggingface.co/collections/ibm-granite/granite-quantized-models
- Repositorio GitHub de Granite 4.1: https://github.com/ibm-granite/granite-4.1-language-models
- Documentacion de IBM Granite 4.1: https://www.ibm.com/granite/docs/models/granite4-1
- Pagina oficial de IBM Granite: https://www.ibm.com/granite
- Version GGUF de terceros: https://huggingface.co/SandLogicTechnologies/granite-4.1-3b-GGUF
- Precedente de receta (Red Hat): https://huggingface.co/RedHatAI/granite-3.1-8b-instruct-quantized.w8a8
