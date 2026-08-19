# cloudnathan5/Qwen3.8-27B-NVFP4a4-GPTQ

## Resumen

`cloudnathan5/Qwen3.8-27B-NVFP4a4-GPTQ` es una cuantización de 4 bits (NVFP4, W4A4) del modelo multimodal Qwen/Qwen3.8-27B, producida con la herramienta `llm-compressor` de vLLM y guardada en formato `compressed-tensors`. El autor, cloudnathan5, aplica el algoritmo GPTQ sobre los pesos y activaciones en el formato de punto flotante de 4 bits de NVIDIA, con escala por bloques de 16 elementos, para compensar el error de cuantización usando información de segundo orden (Hessiana). El resultado es un checkpoint de 28,6 GB (frente a los 55,6 GB del BF16 original), diseñado para ejecutarse de forma nativa en los núcleos FP4 de las GPUs Blackwell (SM100/SM120).

El modelo base Qwen3.8-27B es un transformer híbrido con 64 capas, de las cuales 48 usan atención lineal (gated-delta), arquitectura de mezcla de expertos (MoE) y un head de multi-token-prediction (MTP). Es un modelo image-text-to-text, por lo que acepta entradas de imagen y texto. Esta cuantización mantiene intactos los módulos sensibles (embeddings, vision tower, rutas de atención lineal, gates MoE y el head MTP) para preservar la calidad, y permite usar decodificación especulativa MTP. La relevancia actual radica en que reduce a la mitad el tiempo hasta el primer token (TTFT) en comparación con la variante W4A16, y mejora el throughput por lotes en hardware Blackwell, lo que lo hace atractivo para despliegues de inferencia de alto rendimiento con requisitos de memoria reducidos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con atención lineal (gated-delta), MoE, visión y MTP (base: Qwen3.8-27B) |
| Parametros totales | 19.135.893.232 (según safetensors; el nombre comercial sugiere 27B, pero el checkpoint cuantizado contiene 19,1B) |
| Parametros activos | no disponible (el nombre del modelo base sugiere 3.8B activos, pero no se confirma en la información) |
| Longitud de contexto | 32768 (32K, según el comando de vLLM recomendado) |
| Tipos de cuantizacion | NVFP4 (W4A4) con GPTQ, formato compressed-tensors |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (compressed-tensors) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformer multimodal con una arquitectura híbrida: 48 de sus 64 capas emplean atención lineal tipo gated-delta, lo que reduce el coste cuadrático de la atención clásica y permite ventanas de contexto largas (32K). Además, es un modelo de mezcla de expertos (MoE) con gates de enrutamiento (`mlp.gate`, `shared_expert_gate`) y un head de multi-token-prediction (MTP) que permite decodificación especulativa. Incluye un tower de visión (`visual.*`) para procesar imágenes, lo que lo convierte en un modelo image-text-to-text.

La cuantización se realizó con `llm-compressor` sobre 256 muestras del dataset `HuggingFaceH4/ultrachat_200k` a 4096 tokens, aplicando la plantilla de chat. El método NVFP4-GPTQ combina el formato de 4 bits de NVIDIA con el algoritmo GPTQ, que utiliza la información de la Hessiana para minimizar el error de cuantización capa a capa. Se dejaron en BF16 original los módulos más sensibles: `lm_head`, `embed_tokens`, `visual.*`, `linear_attn.*`, `mlp.gate`, `shared_expert_gate` y `mtp.*`. Esto preserva la precisión en rutas críticas y mantiene funcional la decodificación especulativa MTP. No se proporcionan datos sobre el entrenamiento del modelo base (tokens, dataset, RLHF, etc.).

## Capacidades

- Generación de texto y razonamiento conversacional, con soporte de contexto largo (32K tokens).
- Procesamiento multimodal: acepta imágenes y texto (pipeline image-text-to-text).
- Decodificación especulativa MTP: el head de multi-token-prediction está incluido en BF16, lo que permite acelerar la generación en vLLM.
- Atención lineal híbrida: 48 de 64 capas usan gated-delta attention, reduciendo el coste de memoria y cómputo en secuencias largas.
- Arquitectura MoE con enrutamiento por expertos, lo que permite escalar parámetros totales manteniendo un coste de inferencia reducido.
- Cuantización NVFP4 W4A4: pesos y activaciones en 4 bits, optimizada para los núcleos FP4 de GPUs Blackwell, con mejora significativa en prefill y throughput por lotes.

## Casos de uso

- Inferencia multimodal de alto rendimiento en GPUs Blackwell: al ser una cuantización W4A4, el TTFT se reduce aproximadamente a la mitad frente a W4A16, lo que lo hace adecuado para aplicaciones interactivas de visión-lenguaje (chat con imágenes) donde la latencia de prefill es crítica.
- Despliegue de chatbots con contexto largo: con 32K de ventana, puede gestionar conversaciones multi-turno extensas o documentos largos, manteniendo un uso de VRAM reducido (28,6 GB de pesos) en servidores con GPUs como RTX PRO 6000 Blackwell.
- Reducción de costes en producción: el checkpoint es 1,95 veces más pequeño que el BF16 base, lo que permite servir el modelo en menos GPUs o con mayor margen para caché KV y batching, especialmente útil en entornos con alta concurrencia.
- Generación de código y razonamiento técnico: aunque no se detallan benchmarks específicos, el modelo base Qwen3.8-27B está orientado a tareas de razonamiento y código; esta cuantización mantiene la calidad con una degradación de perplejidad de solo +3,29% en wikitext-2.
- Sistemas de agentes con tool calling: el modelo base soporta function calling (según la familia Qwen), y esta cuantización conserva los módulos de enrutamiento MoE y el head MTP, lo que permite integrarlo en pipelines de agentes con vLLM.
- Prototipado rápido en entornos con GPUs Blackwell: al ser compatible con vLLM y `compressed-tensors`, se puede desplegar con un solo comando (`vllm serve`), ideal para pruebas de concepto y evaluación de calidad antes de producción.

## Benchmarks y rendimiento

La model card proporciona dos conjuntos de mediciones: perplejidad y latencia de un solo usuario. No se publican otros benchmarks (MMLU, HumanEval, GSM8K, etc.).

**Perplejidad** (wikitext-2-raw-v1, test, 48 ventanas de 4096 tokens, 196.560 tokens, medido con vLLM):

| Modelo | Perplejidad | vs BF16 |
|---|---|---|
| Este checkpoint (NVFP4-GPTQ) | 6,7733 | +3,29% |
| Qwen/Qwen3.8-27B (BF16) | 6,5574 | — |

**Latencia de un solo usuario** (concurrencia 1, RTX PRO 6000 Blackwell 96GB, vLLM 0.27.1, 256 tokens de generación, prefetch desactivado, `--ignore-eos`):

| Input tokens | TTFT | Inter-token latency | Decode tok/s | BF16 base tok/s |
|---|---|---|---|---|
| 1024 | 105 ms | 20,4 ms | 49,1 (1,87x) | 26,2 |
| 4096 | 343 ms | 20,5 ms | 48,8 (1,87x) | 26,1 |

Estas cifras corresponden a rendimiento de un solo flujo, no a throughput por lotes. Bajo concurrencia, la clasificación entre variantes puede diferir.

## Requisitos de hardware

- GPU recomendada: NVIDIA Blackwell (SM100/SM120) para la ruta acelerada con núcleos FP4 nativos. En GPUs anteriores, vLLM cae a un camino de dequantize-and-emulate que es funcional pero más lento que BF16.
- VRAM estimada: el checkpoint pesa 28,6 GB. Para inferencia con contexto 32K y batching moderado, se recomienda al menos 48 GB de VRAM (por ejemplo, RTX PRO 6000 Blackwell 96GB, que fue la GPU usada en las pruebas). Con cuantización adicional o menor contexto, podría caber en GPUs de 40 GB, pero no se garantiza.
- Opciones de despliegue: vLLM es el runtime principal (compatible con `compressed-tensors`). También se puede usar con transformers, pero el rendimiento óptimo se obtiene con vLLM en Blackwell.
- Configuración recomendada: `vllm serve ... --max-model-len 32768 --max-num-seqs 512`. Es crucial ajustar `--max-num-seqs` porque 48 de las 64 capas usan atención lineal y vLLM asigna un bloque de caché estilo Mamba por secuencia; el valor por defecto (1024) puede exceder los bloques disponibles y causar fallos en la captura de CUDA.
- Latencia y throughput: en un solo flujo, se observan ~49 tok/s de decodificación (1,87x frente a BF16) y TTFT de 105 ms (para 1024 tokens de entrada) o 343 ms (para 4096). El throughput por lotes no se ha medido en la información disponible.

## Comparativa con modelos similares

No se dispone de datos de benchmarks comparativos con otros modelos de la misma categoría (por ejemplo, otras cuantizaciones de Qwen3.8-27B o modelos MoE similares). La única comparación publicada es contra el modelo base BF16, que se muestra en la sección de benchmarks. Se puede señalar que, frente al BF16, esta cuantización ofrece una reducción de tamaño de 1,95x y una mejora de 1,87x en velocidad de decodificación, a costa de un +3,29% de perplejidad. No se dispone de información sobre alternativas como AWQ, GPTQ-INT4 o FP8 para este modelo.

## Limitaciones y advertencias

- La cuantización es con pérdida: la perplejidad aumenta un 3,29% respecto al BF16. Se recomienda validar el modelo en la carga de trabajo específica antes de usarlo en producción.
- Requiere hardware Blackwell (SM100/SM120) para obtener el rendimiento esperado. En GPUs más antiguas, la ruta de emulación es más lenta que el BF16, por lo que no tiene sentido usarlo fuera de Blackwell.
- El contexto máximo es de 32K tokens; no se soportan longitudes mayores.
- La lista de módulos excluidos de la cuantización se derivó de la arquitectura en el momento del lanzamiento. Si se fine-tunea el modelo o se alteran los nombres de los módulos, la lista debe re-derivarse.
- No se proporcionan datos sobre sesgos, alucinaciones o limitaciones idiomáticas del modelo base. Al ser una cuantización, hereda las limitaciones del modelo original, que no se detallan en la información disponible.
- El checkpoint tiene 19.135.893.232 parámetros según safetensors, a pesar del nombre "27B". Esto puede deberse a que el modelo base es MoE y el nombre comercial refleja parámetros totales, pero el dato real del archivo es el que se indica. Verificar antes de dimensionar infraestructura.

## Enlaces

- [HuggingFace: cloudnathan5/Qwen3.8-27B-NVFP4a4-GPTQ](https://huggingface.co/cloudnathan5/Qwen3.8-27B-NVFP4a4-GPTQ)
- [Modelo base: Qwen/Qwen3.8-27B](https://huggingface.co/Qwen/Qwen3.8-27B)
- [llm-compressor (repositorio de vLLM)](https://github.com/vllm-project/llm-compressor)
- [Dataset de calibración: HuggingFaceH4/ultrachat_200k](https://huggingface.co/datasets/HuggingFaceH4/ultrachat_200k)
