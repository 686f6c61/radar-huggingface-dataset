# devpramod-intel/granite-4.1-8b-quantized.w8a8

## Resumen

Granite 4.1 8B es un modelo de lenguaje denso de la familia Granite de IBM, diseñado para tareas empresariales como generación de texto, razonamiento, codificación y uso de herramientas. Este checkpoint concreto es una cuantización INT8 W8A8 del modelo base `ibm-granite/granite-4.1-8b`, creada por `devpramod-intel` con la herramienta `llm-compressor` de vLLM. El objetivo de esta variante es medir el rendimiento de inferencia en hardware con soporte para operaciones INT8 (AMX en CPU Xeon, kernels INT8 en GPU), no la precisión del modelo.

La cuantización aplica SmoothQuant y GPTQ sobre las capas lineales internas de los bloques transformer, dejando la capa de embeddings y `lm_head` en BF16. El resultado es un checkpoint de 8,96 GiB en disco que reduce aproximadamente a la mitad el peso de las capas cuantizadas. Aunque el modelo base soporta múltiples idiomas, la card de este checkpoint solo declara inglés (`en`). Está pensado para despliegue con vLLM y otras herramientas compatibles con `compressed-tensors`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Dense decoder-only (GraniteForCausalLM), bloques tipo Llama (RMSNorm, atención multi-head) |
| Parametros totales | 8.791.592.960 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens (configuración de despliegue en vLLM; el modelo base soporta 32K) |
| Tipos de cuantizacion | W8A8 (INT8 pesos y activaciones), pesos por canal, activaciones dinámicas por token; `lm_head` y embeddings en BF16 |
| Idiomas soportados | en (según la card del modelo; el base Granite 4.1 es multilingüe) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, formato `compressed-tensors` (compatible con vLLM, Transformers) |

## Arquitectura y entrenamiento

El modelo base `ibm-granite/granite-4.1-8b` es un transformer denso de 8.000 millones de parámetros con arquitectura tipo Llama (RMSNorm, atención multi-head, MLP con gate/up/down). La cuantización W8A8 se aplicó post-training mediante una receta que combina SmoothQuant (con `smoothing_strength=0.8`, `dampening_frac=0.1`, observador `mse`) y GPTQ (con `block_size=128`, `actorder=static`). Se ignoraron `lm_head` y las embeddings, que permanecen en BF16 porque el modelo tiene `tie_word_embeddings: true`.

Los datos de calibración provienen de `neuralmagic/LLM_compression_calibration`, con 512 muestras (split `train`, `shuffle(seed=42)`), secuencias de hasta 8192 tokens. No se realizó ningún entrenamiento adicional (sin RLHF ni DPO); es una cuantización puramente post-training. La receta se basó en precedentes de Red Hat AI para Granite 3.1 y 4.1, con pequeñas desviaciones (menos muestras de calibración y `max_seq_length=8192` en lugar de 8196).

## Capacidades

- Generación de texto en inglés (el modelo base es multilingüe, pero la card no lo declara).
- Razonamiento y matemáticas de nivel básico a intermedio.
- Generación de código en múltiples lenguajes (Python, Java, etc.).
- Tool calling / function calling (soporte nativo en la familia Granite 4.1).
- Generación de JSON estructurado (output mode).
- Capacidades de agente multi-paso (multi-step reasoning) con herramientas.
- No soporta visión ni audio (modelo solo texto).

## Casos de uso

- **Inferencia en servidores con CPU Xeon (AMX INT8)**: al estar cuantizado en W8A8, aprovecha las instrucciones AMX de Intel Xeon para inferencia de alto rendimiento en CPU, sin necesidad de GPU.
- **Despliegue en entornos con memoria limitada**: con ~8,96 GB en disco, cabe en GPUs de 12 GB (ej. RTX 3060, 4070) o incluso en memoria de servidores modestos, permitiendo ejecutar un modelo de 8B en recursos reducidos.
- **Benchmarking de rendimiento**: el propósito original del checkpoint es medir latencia y throughput con kernels INT8 en vLLM y otras plataformas, por lo que es útil para comparar eficiencia entre hardware.
- **Asistencia de código en CI/CD**: aunque no se ha validado su precisión, el modelo base tiene capacidades de generación de código y puede integrarse en pipelines de generación de documentación o revisión de código con herramientas de tool calling.
- **Chatbots de atención al cliente**: con la ventana de 32K tokens, puede gestionar conversaciones largas y recuperar contexto de bases de conocimiento (RAG) en inglés.
- **Extracción de información estructurada**: gracias a la salida JSON y tool calling, puede transformar texto no estructurado en datos JSON para procesos automatizados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de precisión para este checkpoint específico. La card del modelo indica explícitamente que **no se ejecutó ninguna evaluación de precisión** sobre esta cuantización. Los datos siguientes son estimaciones por precedencia de otros modelos cuantizados con la misma receta, no mediciones de este modelo:

| Evidencia | Recuperación estimada vs BF16 |
|---|---|
| `granite-3.1-8b-instruct` W8A8 (receta idéntica, card Red Hat) | OpenLLM v1 **99,95%** (70,26 vs 70,30), OpenLLM v2 98,64%, HumanEval 99,3% |
| `granite-3.1-2b-instruct` W8A8 (card Red Hat) | OpenLLM v1 **99,52%** (61,68 vs 61,98) |
| Derivado de `granite-4.1-8b` cuantizado con el mismo script (prueba interna, 7 datasets) | Agregado ≈ **99,4%**, 46/48 decodificaciones byte-idénticas en CPU |

Se recomienda ejecutar `lm-eval` contra el modelo BF16 original para obtener cifras propias y defendibles.

## Requisitos de hardware

- **VRAM estimada**: los pesos INT8 ocupan aproximadamente 8,96 GiB en disco. Durante la inferencia, la VRAM necesaria es ~10-12 GB (pesos + activaciones + KV cache), dependiendo del tamaño de lote y longitud de secuencia.
- **GPUs compatibles**: cualquier GPU con soporte para INT8, como RTX 3090/4090, A100, H100, L40S. En GPUs sin kernels INT8 optimizados, la ventaja de velocidad es menor.
- **CPU**: funciona en procesadores Xeon con AMX (4ª generación en adelante) para inferencia INT8 rápida.
- **Opciones de despliegue**: vLLM (recomendado, soporta `compressed-tensors`), TGI, Transformers con `device_map="auto"`, o llama.cpp si se convierte a GGUF (aunque no hay GGUF oficial de este checkpoint).
- **Latencia y throughput**: no se han publicado mediciones. En vLLM con `--max-model-len 32768`, se espera throughput mayor que el BF16 en hardware INT8, pero los valores exactos dependen de la GPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Tamaño en disco |
|---|---|---|---|---|---|
| **granite-4.1-8b-quantized.w8a8 (este)** | 8,79 B | 32K | W8A8 (INT8) | Apache 2.0 | 8,96 GiB |
| `ibm-granite/granite-4.1-8b` (base) | 8,79 B | 32K | BF16 | Apache 2.0 | ~17,6 GiB (estimado) |
| `RedHatAI/granite-4.1-8b-fp8` | 8,79 B | 32K | FP8 | Apache 2.0 | ~8,8 GiB (estimado) |
| `RedHatAI/granite-3.1-8b-instruct-quantized.w8a8` | 8 B | 32K | W8A8 | Apache 2.0 | ~8,5 GiB |

El modelo es una alternativa a la cuantización FP8 de Red Hat, pero con pesos INT8 en lugar de FP8. Ambos buscan reducir el uso de memoria y acelerar la inferencia, aunque INT8 tiene menos rango dinámico que FP8, lo que puede afectar a la precisión en tareas muy sensibles a valores extremos. El modelo base BF16 es la referencia de calidad, pero requiere el doble de memoria.

## Limitaciones y advertencias

- **No hay evaluación de precisión**: este checkpoint se creó para benchmarking de rendimiento, no para uso en producción donde la calidad importe. No se han medido métricas de precisión sobre este modelo.
- **Sesgos y alucinaciones**: como cualquier modelo de lenguaje, puede generar contenido sesgado o alucinado, especialmente en dominios específicos. No se ha realizado ninguna mitigación adicional.
- **Idiomas**: la card solo declara inglés, aunque el modelo base es multilingüe. No se ha verificado su comportamiento en otros idiomas.
- **Precisión numérica**: la cuantización W8A8 puede degradar la precisión en tareas que requieren cálculos numéricos de alta exactitud (por ejemplo, matemáticas avanzadas), aunque los precedentes indican una recuperación de ~99%.
- **Licencia**: Apache 2.0 permite uso comercial sin restricciones, pero se recomienda verificar la licencia del modelo base y de las herramientas utilizadas (llm-compressor, vLLM).
- **Compatibilidad**: el formato `compressed-tensors` requiere versiones específicas de vLLM (>=0.9.0) y Transformers (>=4.57). Verificar la compatibilidad antes del despliegue.

## Enlaces

- [HuggingFace: devpramod-intel/granite-4.1-8b-quantized.w8a8](https://huggingface.co/devpramod-intel/granite-4.1-8b-quantized.w8a8)
- [Modelo base: ibm-granite/granite-4.1-8b](https://huggingface.co/ibm-granite/granite-4.1-8b)
- [Colección de modelos cuantizados de IBM Granite](https://huggingface.co/collections/ibm-granite/granite-quantized-models)
- [Documentación de Granite 4.1 de IBM](https://www.ibm.com/granite/docs/models/granite4-1)
- [Repositorio GitHub de Granite 4.1](https://github.com/ibm-granite/granite-4.1-language-models)
- [Herramienta llm-compressor](https://github.com/vllm-project/llm-compressor)
- [Ejemplo de GGUF del modelo base (tercero)](https://huggingface.co/SandLogicTechnologies/granite-4.1-8b-GGUF)
