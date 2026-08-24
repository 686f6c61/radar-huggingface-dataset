# Hob-forge/Qwen3.5-4B-FP8

## Resumen

Hob-forge/Qwen3.5-4B-FP8 es una cuantización block-wise en FP8 (e4m3) del modelo multimodal Qwen3.5-4B de Alibaba, publicada por el colectivo Hob Forge. Qwen lanzó pesos FP8 oficiales para sus modelos grandes (27B, 35B-A3B, 122B y 397B), pero no para el 4B, a pesar de las peticiones de la comunidad. Esta versión cubre ese hueco aplicando exactamente el mismo formato que los lanzamientos oficiales de Qwen: `quant_method: fp8`, `weight_block_size [128,128]`, activaciones dinámicas y escalas `weight_scale_inv` en fp32.

El resultado es un modelo de 5,65 GB (frente a ~8,8 GB en BF16) que mantiene una pérdida de perplejidad inferior al 1% en las pruebas del autor y conserva las capacidades multimodales (texto e imagen) del modelo original, incluido el modo de razonamiento (thinking). Es relevante porque permite ejecutar un modelo de 4B multimodal en GPUs de consumo con 12 GB de VRAM, con soporte nativo en vLLM, SGLang y transformers.

La cuantización es determinista y no requiere calibración: se trata de una transformación de pesos verificada tensor a tensor contra el modelo BF16 original. El script de conversión se incluye en el repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) con vision tower, linear attention y MTP (multi-token prediction) |
| Parametros totales | 4.659.865.088 (~4,66 B) |
| Parametros activos | no aplicable (modelo denso) |
| Longitud de contexto | no disponible en la ficha; el modelo base Qwen3.5-4B soporta 262K segun vLLM Recipes |
| Tipos de cuantizacion | FP8 (e4m3) block-wise, bloque 128x128, activaciones dinamicas; tambien existe edicion GGUF del mismo autor |
| Idiomas soportados | no disponibles |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (transformers), compatible con vLLM, SGLang y transformers fine-grained-FP8 |

## Arquitectura y entrenamiento

Este modelo no es un entrenamiento nuevo, sino una cuantizacion del Qwen3.5-4B original. La arquitectura base es un transformer denso multimodal que combina un vision tower (para entrada de imagenes) con un language model que incorpora linear attention (capas `linear_attn`) y un bloque MTP para prediccion multi-token. El modelo base fue entrenado por Qwen con un pipeline que incluye RL (reinforcement learning) a gran escala, segun la descripcion oficial.

La cuantizacion FP8 sigue el formato exacto de los lanzamientos oficiales de Qwen: los pesos de las proyecciones de atencion (`q,k,v,o_proj`), las capas MLP (`gate,up,down_proj`) y las proyecciones de linear attention y MTP se convierten a FP8 con bloques de 128x128 y escalas inversas en fp32. Se mantienen en BF16 las embeddings (atadas al lm_head), las capas `conv1d`, `in_proj_a`, `in_proj_b`, el vision tower completo, `mtp.fc` y todas las normalizaciones. En total, 207 tensores cuantizados y 531 pasan bit-a-bit identicos al original.

La conversion es determinista (sin calibracion) y el script `quantize_fp8_block.py` se incluye en el repositorio. El autor verifico que el error relativo maximo de de-cuantizacion por bloque es del 3,6% (media 2,8%), dentro del envelope esperado para e4m3.

## Capacidades

- Generacion de texto y razonamiento conversacional, con soporte de chat template y modo thinking (razonamiento explicito antes de responder).
- Comprension de imagenes (pipeline image-text-to-text): puede recibir una imagen como entrada junto con texto.
- Tool calling / function calling: el modelo base Qwen3.5-4B soporta llamadas a herramientas; la edicion GGUF del mismo autor verifica explicitamente que el chat template y el tool-calling funcionan, lo que sugiere que esta version FP8 tambien los conserva (no verificado en la model card).
- Capacidades multilingues: no especificadas en la ficha, pero el modelo base de Qwen es multilingue.
- Compatible con vLLM, SGLang y transformers para inferencia en produccion.

## Casos de uso

- Asistentes conversacionales en GPU de consumo: con 5,65 GB de pesos, el modelo cabe en una RTX 5070 de 12 GB con `gpu_memory_utilization=0.75` y `max_model_len=4096`, permitiendo desplegar un chatbot multimodal local sin necesidad de hardware de datacenter.
- Analisis de imagenes en el borde: al conservar el vision tower, puede usarse para clasificacion o descripcion de imagenes en entornos con VRAM limitada, por ejemplo en estaciones de trabajo con RTX 4060 o 4070.
- Generacion de codigo asistida: el modelo base tiene buenas capacidades de codigo (la prueba PPL en Python muestra 2.864 en FP8 vs 2.859 en BF16); puede integrarse en IDEs o pipelines de CI/CD para autocompletado o revision de codigo.
- Razonamiento multi-paso con modo thinking: util para tareas de planificacion, resolucion de problemas logicos o agentes que necesitan deliberar antes de actuar, aprovechando el modo thinking del modelo.
- Prototipado rapido de aplicaciones multimodales: al ser Apache-2.0 y tener un formato estandar FP8, se puede integrar en vLLM o SGLang con pocas lineas de codigo, ideal para pruebas de concepto.
- Educacion e investigacion: como modelo abierto y ligero, sirve para experimentar con tecnicas de cuantizacion FP8, comparar con el BF16 original o estudiar el impacto de la cuantizacion en modelos pequenos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El autor incluye una pequena prueba A/B contra el modelo BF16 original, ejecutada con vLLM 0.19.0 en una RTX 5070 (Blackwell, WSL2), con teacher-forcing:

| Medicion | BF16 | FP8 | Delta |
|---|---|---|---|
| PPL, prosa (Austen, 4776 tokens) | 15.141 | 15.174 | +0.22% |
| PPL, prosa (Shelley, 3741 tokens) | 10.173 | 10.256 | +0.81% |
| PPL, codigo (Python, 2800 tokens) | 2.859 | 2.864 | +0.19% |
| QA exacta de 12 items (greedy) | 12/12 | 12/12 | paridad |

Ademas, el 61% de las continuaciones greedy de 64 tokens coinciden token a token con el BF16 (7 de 20 prompts identicos). El autor advierte que es una prueba pequena, no una suite de benchmarks, y recomienda ejecutar evaluaciones propias para decisiones de produccion.

## Requisitos de hardware

- VRAM estimada: los pesos FP8 ocupan 5,65 GB; con overhead de inferencia, cabe en una GPU de 12 GB con `gpu_memory_utilization=0.75` y `max_model_len=4096` (probado en RTX 5070).
- GPU recomendadas: cualquier NVIDIA con soporte FP8 GEMM (sm89+): Ada (RTX 4090, RTX 4070, etc.), Hopper (H100) y Blackwell (RTX 50xx). Probado solo en Blackwell (RTX 5070).
- No cabe en GPUs de 8 GB ni en CPU: el autor recomienda la edicion GGUF para esos casos.
- Opciones de despliegue: vLLM (probado), SGLang y transformers con soporte fine-grained-FP8 (no probados por el autor).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Precision | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen/Qwen3.5-4B (BF16) | 4,66 B | 262K (segun vLLM Recipes) | BF16 | Apache-2.0 | Modelo original, ~8,8 GB de pesos |
| Hob-forge/Qwen3.5-4B-FP8 | 4,66 B | no disponible | FP8 e4m3 | Apache-2.0 | Cuantizacion block-wise, 5,65 GB |
| RedHatAI/Qwen3.5-4B-FP8-dynamic | 4,66 B | no disponible | FP8 dinamico | Apache-2.0 | Cuantizacion data-free con LLM Compressor |
| Hob-forge/Qwen3.5-4B-Instruct-GGUF | 4,66 B | no disponible | GGUF (imatrix) | Apache-2.0 | Edicion para GPUs pequenas y RAM modesta |

La principal diferencia con la version BF16 es el tamano (5,65 GB vs 8,8 GB) con una perdida de perplejidad inferior al 1%. Frente a la version FP8-dynamic de RedHatAI, la de Hob-forge sigue el formato oficial de Qwen (bloques 128x128, escalas fp32) y no requiere calibracion. La edicion GGUF es la alternativa recomendada para hardware sin soporte FP8.

## Limitaciones y advertencias

- Requiere hardware NVIDIA con soporte FP8 GEMM (sm89+): no funciona en GPUs antiguas, CPU ni hardware AMD/Intel.
- La cuantizacion introduce una pequena perdida de precision: el error relativo maximo de de-cuantizacion es del 3,6% y la perplejidad sube hasta un 0,81% en las pruebas del autor.
- No hay benchmarks estandar publicados: la verificacion es una prueba pequena del autor, no una suite exhaustiva. Para produccion, se recomienda evaluar con datos propios.
- El contexto maximo no esta confirmado en la ficha; el ejemplo de uso usa `max_model_len=4096` por limitaciones de VRAM, pero el modelo base soporta hasta 262K segun vLLM Recipes.
- Los idiomas soportados no estan documentados en esta version; se asume que hereda los del modelo base, pero no hay confirmacion.
- El modo thinking y el tool calling no estan verificados explicitamente en esta version FP8 (la edicion GGUF del mismo autor si los verifica).
- No se ha probado en SGLang ni en transformers fine-grained-FP8; el autor solo valido vLLM en Blackwell.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Hob-forge/Qwen3.5-4B-FP8
- Edicion GGUF del mismo autor: https://huggingface.co/Hob-forge/Qwen3.5-4B-Instruct-GGUF
- Modelo base Qwen3.5-4B: https://huggingface.co/Qwen/Qwen3.5-4B
- Discusiones sobre FP8 en el modelo base: [#13](https://huggingface.co/Qwen/Qwen3.5-4B/discussions/13), [#24](https://huggingface.co/Qwen/Qwen3.5-4B/discussions/24), [#27](https://huggingface.co/Qwen/Qwen3.5-4B/discussions/27)
- Version FP8-dynamic de RedHatAI: https://huggingface.co/RedHatAI/Qwen3.5-4B-FP8-dynamic
- Ficha de Qwen3.5-4B en vLLM Recipes: https://recipes.vllm.ai/Qwen/Qwen3.5-4B
- Pagina de Qwen3.5:4b en Ollama: https://ollama.com/library/qwen3.5:4b
