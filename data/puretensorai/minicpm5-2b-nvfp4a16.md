# PureTensorAI/MiniCPM5-2B-NVFP4A16

## Resumen

MiniCPM5-2B-NVFP4A16 es una cuantización de 4 bits del modelo openbmb/MiniCPM5-2B, publicada por PureTensorAI. Se trata de un checkpoint de pesos cuantizados en formato NVFP4 (valores de 4 bits E2M1) con activaciones mantenidas en 16 bits (esquema W4A16), generado con GPTQ sobre los pesos BF16 oficiales. El modelo base es un transformer de 2.516.756.480 parámetros (aproximadamente 2,5 mil millones) distribuido en 42 bloques transformer, según se desprende de la información de la model card.

El propósito de esta publicación es reducir el peso del checkpoint de 5,03 GB (BF16) a 2,18 GB, manteniendo las activaciones en 16 bits para limitar la pérdida de calidad. Según las mediciones del autor, el checkpoint pierde 2,69 puntos en MMLU y 4,02 puntos en GSM8K respecto al BF16, a cambio de una mejora de throughput de entre 1,28x y 1,53x en vLLM sobre una GPU Blackwell. El autor lo describe explícitamente como un "test release" no afiliado a OpenBMB.

La relevancia de esta ficha radica en que documenta con detalle inusual el coste real de una cuantización NVFP4 en un modelo pequeño: incluye pruebas pareadas de McNemar, divergencia KL sobre distribuciones completas y comparación con otras builds de 4 bits (GPTQ, AWQ, con y sin activaciones cuantizadas), lo que permite evaluar con rigor si el ahorro de memoria y el aumento de velocidad justifican la degradación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (42 bloques), segun model card; detalles internos no disponibles |
| Parametros totales | 2.516.756.480 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | NVFP4A16 (W4A16): pesos 4 bits E2M1, escala FP8 E4M3 por grupo de 16, escala FP32 por tensor; GPTQ con block_size 128, dampening_frac 0.01, actorder static |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors con compressed-tensors (`nvfp4-pack-quantized`); compatible con transformers y vLLM |

## Arquitectura y entrenamiento

El checkpoint es una cuantización del modelo base openbmb/MiniCPM5-2B, que según la model card consta de 42 bloques transformer. No se dispone de información sobre la arquitectura interna del modelo base (tipo de atención, normalización, activaciones) ni sobre su proceso de entrenamiento original (número de tokens, composición del dataset, si hubo RLHF o DPO), ya que la información proporcionada solo cubre el proceso de cuantización.

El proceso de cuantización aplica GPTQ a los pesos de todas las capas `Linear` de los 42 bloques, dejando en BF16 los embeddings de tokens, la cabeza de salida, todas las normalizaciones y todas las activaciones. La calibración se realizó con las primeras 512 muestras de `mlabonne/open-perfectblend`, con hasta 2.048 tokens por muestra, usando llm-compressor 0.15.0, compressed-tensors 0.20.1, transformers 5.21.0 y torch 2.14.1. El autor advierte que 180 de las 512 muestras de calibración son problemas matemáticos (MetaMathQA y Orca-Math) y 75 provienen de UltraChat, por lo que las métricas de GSM8K y de chat pueden estar favorecidas por la calibración; las de MMLU y WikiText no están relacionadas con esos datos.

## Capacidades

- Generación de texto conversacional: el modelo base está etiquetado con `pipeline_tag: text-generation` y `conversational`, y la model card incluye un ejemplo de uso con plantilla de chat.
- Razonamiento y matemáticas: se evalúa en GSM8K con exact match, lo que indica capacidad para resolver problemas aritméticos de varios pasos.
- Conocimiento general: evaluado en MMLU (14.042 preguntas), lo que refleja conocimiento enciclopédico y razonamiento de opción múltiple.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; el campo de idiomas del repo está vacío y la model card no detalla idiomas.
- Capacidades especiales (thinking mode, visión, audio): no disponible en la información proporcionada.

## Casos de uso

- Despliegue en GPU de gama consumer con VRAM limitada: con 2,18 GB de pesos en FP4, el checkpoint cabe holgadamente en tarjetas de 8 GB o menos, permitiendo servir un modelo de 2,5 mil millones de parámetros en hardware modesto con vLLM o transformers.
- Servicio de chat de alto throughput: el autor mide 1,40x de throughput en un solo stream y 1,53x con 8 peticiones concurrentes frente a BF16 en vLLM, lo que lo hace adecuado para endpoints conversacionales con muchas peticiones simultáneas donde el coste por token importa.
- Prototipado rápido de aplicaciones de generación de texto: el ejemplo de la model card muestra cómo cargarlo con `AutoModelForCausalLM` y `apply_chat_template` en pocas líneas, útil para validar ideas antes de pasar a modelos mayores.
- Tareas de resumen y extracción de información: el modelo se usa en la model card para resumir el ciclo del agua en dos frases, un caso representativo de resumen de documentos cortos donde la pérdida de 2,69 puntos en MMLU es tolerable.
- Evaluación comparativa de técnicas de cuantización: la publicación incluye métricas de KL y pruebas pareadas que permiten usar este checkpoint como referencia para comparar NVFP4A16 frente a AWQ, GPTQ con otras configuraciones o cuantización de activaciones.
- Razonamiento aritmético de varios pasos en entornos con restricciones de memoria: con GSM8K en 68,46 (frente a 72,48 en BF16), sigue siendo utilizable para problemas de matemáticas de primaria y secundaria en asistentes educativos o pipelines de verificación, siempre que se acepte la degradación.
- Inferencia en estaciones de trabajo Blackwell: el autor lo prueba en una GPU Blackwell con compute capability 12.0 usando el kernel `MarlinNvFp4LinearKernel` de vLLM, por lo que es una opción natural para equipos con esa generación de hardware.

## Benchmarks y rendimiento

Resultados medidos por el autor con lm-evaluation-harness 0.4.13 (MMLU y GSM8K, sin plantilla de chat, GSM8K con flexible-extract) y divergencia KL con ventanas de 1.024 tokens:

| Metrica | BF16 | Este checkpoint | Cambio |
|---|---:|---:|---:|
| MMLU, accuracy (14.042 preguntas) | 57,29 | 54,60 | -2,69 |
| GSM8K, exact match (1.319 problemas) | 72,48 | 68,46 | -4,02 |
| WikiText-2, perplejidad (131.072 tokens) | 15,64 | 16,27 | +0,63 |
| KL media, WikiText-2 test | 0 | 0,064 | — |
| KL percentil 99, WikiText-2 test | 0 | 0,52 | — |
| Mismo token top-1 que BF16, WikiText-2 | — | 87,5% | — |
| KL media, chat (ultrachat_200k, test_sft, 256 conversaciones) | 0 | 0,068 | — |
| KL percentil 99, chat | 0 | 0,97 | — |
| Mismo token top-1 que BF16, chat | — | 90,2% | — |

Prueba pareada de McNemar: en MMLU, 1.176 respuestas perdidas y 799 ganadas (p = 2e-17); en GSM8K, 130 perdidas y 77 ganadas (p = 3e-4).

Rendimiento en vLLM 0.34.0 sobre una GPU Blackwell (compute capability 12.0), generaciones greedy de 256 tokens:

| Metrica | BF16 | Este checkpoint |
|---|---:|---:|
| GSM8K vía API de completions | 72,10 | 68,23 |
| Throughput, 1 stream | 1,00x | 1,40x |
| Throughput, 8 concurrentes | 1,00x | 1,53x |
| Throughput, 32 concurrentes | 1,00x | 1,28x |

Comparación con otras builds de 4 bits del mismo modelo, medidas por el autor en el mismo harness:

| Build | Activaciones | MMLU | GSM8K | KL wiki | KL chat |
|---|---|---:|---:|---:|---:|
| BF16 de referencia | 16 bits | 57,29 | 72,48 | 0 | 0 |
| Este checkpoint (GPTQ, dampening 0,01) | 16 bits | 54,60 | 68,46 | 0,064 | 0,068 |
| GPTQ público, dampening 0,1 | 16 bits | 55,92 | 62,93 | 0,069 | 0,099 |
| AWQ público con escalas buscadas | 16 bits | 50,45 | 61,71 | 0,103 | 0,149 |
| GPTQ propio con activaciones 4 bits (no publicado) | 4 bits | 49,88 | 59,59 | 0,167 | 0,205 |
| AWQ público con activaciones 4 bits | 4 bits | 47,14 | 52,92 | 0,208 | 0,286 |

El autor advierte que las diferencias de 1-2 puntos en MMLU entre builds están dentro del ruido: al repetir su receta con distintas muestras de calibración, MMLU varió entre 51,9 y 56,2 en ocho builds, mientras GSM8K se mantuvo entre 66,1 y 69,6.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos ocupan 2,18 GB en FP4; con activaciones en 16 bits y caché KV, una estimación conservadora es de 4-6 GB para secuencias moderadas, aunque el autor no publica una cifra exacta.
- GPU recomendadas: el autor valida el checkpoint en una GPU Blackwell con compute capability 12.0 usando el kernel `MarlinNvFp4LinearKernel` de vLLM; no se especifica el modelo concreto de GPU.
- GPU consumer: por tamaño de pesos (2,18 GB) cabe en tarjetas de 8 GB o menos; no se han publicado pruebas en RTX 4090, RTX 3090 u otras consumer en la información disponible.
- Opciones de despliegue: vLLM (`vllm serve PureTensorAI/MiniCPM5-2B-NVFP4A16`) y transformers con `compressed-tensors` instalado. No se mencionan llama.cpp, Ollama ni TGI en la model card, aunque el repo incluye el tag `text-generation-inference`.
- Latencia y throughput: medidos solo en vLLM sobre Blackwell; 1,40x en un stream, 1,53x con 8 concurrentes y 1,28x con 32 concurrentes frente a BF16, con generaciones fijas de 256 tokens y decodificación greedy. El autor advierte que los números variarán en otro hardware.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MMLU | GSM8K | Licencia | Disponibilidad |
|---|---|---:|---:|---:|---|---|
| MiniCPM5-2B-NVFP4A16 (este) | 2,52 B | no disponible | 54,60 | 68,46 | Apache 2.0 | Hugging Face |
| openbmb/MiniCPM5-2B (BF16) | 2,52 B | no disponible | 57,29 | 72,48 | Apache 2.0 (segun repo base) | Hugging Face |
| GPTQ público de MiniCPM5-2B (dampening 0,1) | 2,52 B | no disponible | 55,92 | 62,93 | no disponible | Hugging Face |
| AWQ público de MiniCPM5-2B (escalas buscadas) | 2,52 B | no disponible | 50,45 | 61,71 | no disponible | Hugging Face |

No se dispone de datos sobre otros modelos de 2-3 mil millones de parámetros comparables en la información proporcionada.

## Limitaciones y advertencias

- Degradación medible frente a BF16: -2,69 puntos en MMLU y -4,02 en GSM8K, ambos estadísticamente significativos según la prueba de McNemar del autor.
- Sesgo de calibración: 180 de las 512 muestras de calibración son problemas matemáticos y 75 provienen de UltraChat, por lo que las métricas de GSM8K y chat pueden estar infladas; el autor lo reconoce explícitamente.
- Riesgo de alucinación: no se han publicado evaluaciones específicas de factualidad o tasa de alucinación; la pérdida de calidad en MMLU sugiere un mayor riesgo que en BF16.
- Idiomas: el campo de idiomas del repo está vacío y la model card no detalla cobertura lingüística; no se puede confirmar el soporte multilingüe.
- Contexto: la longitud máxima de contexto no está documentada en la información disponible.
- Licencia: Apache 2.0 permite uso comercial, pero el autor describe la publicación como "test release" no afiliada a OpenBMB; conviene revisar la licencia del modelo base antes de producción.
- Compatibilidad de kernels: el rendimiento medido depende del kernel `MarlinNvFp4LinearKernel` de vLLM en hardware Blackwell; en otras GPU o versiones de vLLM el comportamiento puede diferir.
- Madurez: 31 descargas y 0 likes en el momento de la consulta, con fecha de creación reciente; no hay evidencia de uso en producción por terceros.
- Advertencia del autor: "this checkpoint is measurably below BF16" y "this is a test release"; no debe asumirse paridad con el modelo original.

## Enlaces

- Hugging Face: https://huggingface.co/PureTensorAI/MiniCPM5-2B-NVFP4A16
- Modelo base: https://huggingface.co/openbmb/MiniCPM5-2B
- Dataset de calibración: https://huggingface.co/datasets/mlabonne/open-perfectblend
- Dataset de evaluación de chat: https://huggingface.co/datasets/HuggingFaceH4/ultrachat_200k
- llm-compressor: https://github.com/vllm-project/llm-compressor
- compressed-tensors: https://github.com/neuralmagic/compressed-tensors
- vLLM: https://github.com/vllm-project/vllm
- lm-evaluation-harness: https://github.com/EleutherAI/lm-evaluation-harness
