# HarimxChoi/WarpQuant-Qwen3.8-27B-R16E4H4

## Resumen

WarpQuant-Qwen3.8-27B-R16E4H4 es un checkpoint multimodal del modelo Qwen3.8-27B, cuantizado con la técnica WarpQuant desarrollada por Harim Choi. Este modelo conserva la torre de visión y el proyector multimodal del modelo original, mientras aplica una cuantización post-entrenamiento de 3 bits al backbone de texto de 64 capas. El resultado es un modelo de lenguaje y visión con un payload de texto de solo 3,62 bits por peso (bpw), lo que reduce el tamaño de los pesos del texto de 50,11 GiB a 11,32 GiB, una compresión de aproximadamente 4,4×.

La relevancia de este modelo radica en que demuestra que es posible cuantizar agresivamente un modelo multimodal de 27B parámetros sin perder capacidades fundamentales, manteniendo un rendimiento comparable al original en tareas de razonamiento, conocimiento y matemáticas. Está pensado para despliegues en entornos con recursos limitados, donde el ahorro de memoria es crítico. El modelo está disponible bajo licencia Apache 2.0 y soporta inglés y coreano.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Qwen3.8-27B) con torre de visión y proyector multimodal |
| Parametros totales | 27.781.427.952 (27,78B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | WarpQuant R16E4H4 (3,62 bpw en backbone de texto), INT4 grupo-128 en embeddings y head |
| Idiomas soportados | en, ko |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.8-27B, un modelo multimodal de 27B parámetros con 64 capas en el backbone de texto. WarpQuant aplica una cuantización post-entrenamiento que combina varias técnicas: rotación de Hadamard con signo, cuantización de grupo de 3 bits, reconstrucción block-GPTQ y recuperación de columnas débiles mediante sensibilidad Output-Fisher. Los embeddings de tokens y la cabeza de lenguaje se cuantizan a INT4 con grupo de 128. La torre de visión y el proyector multimodal se mantienen sin cuantizar.

No se dispone de información sobre el dataset de entrenamiento ni sobre el proceso de fine-tuning, ya que se trata de un checkpoint cuantizado a partir del modelo base. La técnica WarpQuant está descrita en un informe técnico y el código está disponible en GitHub.

## Capacidades

- Generación de texto y razonamiento: mantiene un rendimiento cercano al modelo original en tareas de conocimiento (MMLU) y sentido común (CommonsenseQA).
- Comprensión de imágenes: al conservar la torre de visión, el modelo puede procesar entradas de imagen y texto (image-text-to-text).
- Conversación multilingüe: soporta inglés y coreano.
- Matemáticas: resuelve problemas de razonamiento aritmético (GSM8K) con precisión aceptable.
- Cuantización eficiente: permite inferencia con un footprint de memoria reducido, adecuado para GPUs de consumo.

No se ha confirmado soporte para tool calling, function calling o modo agente en la información disponible.

## Casos de uso

- Análisis de imágenes en entornos con recursos limitados: el modelo puede describir o responder preguntas sobre imágenes usando una GPU de consumo (por ejemplo, RTX 4090) gracias a su bajo consumo de memoria.
- Chatbots multilingües inglés-coreano: su capacidad conversacional y soporte de ambos idiomas lo hace útil para asistentes virtuales bilingües.
- Clasificación y razonamiento sobre documentos visuales: puede extraer información de capturas, diagramas o fotografías en tareas de soporte técnico.
- Educación y tutoría: puede generar explicaciones paso a paso de problemas matemáticos, como se refleja en su rendimiento en GSM8K.
- Prototipado rápido de aplicaciones multimodales: al ser un checkpoint listo para usar con transformers, facilita el desarrollo de demos y pruebas de concepto.
- Investigación en cuantización: sirve como referencia para estudiar el impacto de la cuantización agresiva en modelos multimodales.

## Benchmarks y rendimiento

La model card incluye una evaluación del backbone de texto comparando WarpQuant con el modelo en BF16 y con cuantizaciones de llama.cpp (Q4_K_M e IQ3_S). Los resultados son los siguientes:

| Formato | Text bpw | Payload | WT2 PPL ↓ | ARC-299 ↑ | MMLU-13,943 ↑ | Commonsense ↑ | GSM8K-500 flex ↑ |
|---|---:|---:|---:|---:|---:|---:|---:|
| BF16 | 16.00 | 50.11 GiB | 6.9548 | 52.17 | 43.07 | 79.23 | 70.40 |
| Q4_K_M | 4.92 | 15.41 GiB | 6.9656 | 50.84 | 42.90 | 79.23 | 75.20 |
| IQ3_S | 3.6940 | 11.57 GiB | 7.1820 | 52.17 | 42.97 | 78.83 | 59.40 |
| WarpQuant R16E4H4 | 3.6165 | 11.32 GiB | 7.4737 | 56.86 | 42.72 | 78.83 | 61.00 |

WarpQuant consigue una perplejidad ligeramente superior (7,47 vs 6,95 en BF16), pero mejora el resultado en ARC-299 (56,86 vs 52,17) y mantiene un rendimiento competitivo en MMLU y Commonsense. En GSM8K, WarpQuant supera a IQ3_S pero queda por debajo de Q4_K_M y BF16.

También se incluye una ablación de KV cache y activaciones:

| Configuracion | PPL ↓ | Top-1 | KV compression @ 512 |
|---|---:|---:|---:|
| Weight-only | 6.6468 | referencia | 1.00× |
| K4/V4/R128 | 6.6495 | 97.65% | 2.14× |
| Dynamic A8 | 6.7139 | 92.10% | 1.00× |
| K4/V4/R128 + A8 | 6.6945 | 92.47% | 2.14× |

La cuantización de KV cache a 4 bits con rotación R128 permite comprimir la caché 2,14× con una pérdida mínima de perplejidad.

## Requisitos de hardware

- El payload de texto cuantizado ocupa 11,32 GiB, a lo que hay que sumar la torre de visión y el proyector. El tamaño total del repositorio es de 55,6 GB, pero eso incluye posiblemente pesos en BF16 de la torre de visión y otros componentes.
- Para inferencia con el modelo completo, se estima que se necesitan al menos 16 GB de VRAM, lo que permite ejecutarlo en GPUs como la RTX 4090 (24 GB) o la A100 (40 GB).
- En GPUs con menos memoria, se podría cargar solo el backbone de texto (versión Text-only disponible en HuggingFace).
- Opciones de despliegue: al ser un modelo de transformers, se puede usar con vLLM, TGI o directamente con la API de transformers. También es compatible con endpoints de HuggingFace.
- No se proporcionan datos de latencia o throughput.

## Comparativa con modelos similares

El modelo se compara directamente con el Qwen3.8-27B original en BF16 y con cuantizaciones estándar de llama.cpp (Q4_K_M e IQ3_S). La tabla de benchmarks anterior ya muestra la comparativa. En resumen:

| Modelo | bpw | Payload texto | MMLU | GSM8K | Licencia |
|---|---:|---:|---:|---:|---|
| Qwen3.8-27B BF16 | 16.00 | 50.11 GiB | 43.07 | 70.40 | Apache 2.0 |
| Qwen3.8-27B Q4_K_M | 4.92 | 15.41 GiB | 42.90 | 75.20 | Apache 2.0 |
| Qwen3.8-27B IQ3_S | 3.69 | 11.57 GiB | 42.97 | 59.40 | Apache 2.0 |
| WarpQuant R16E4H4 | 3.62 | 11.32 GiB | 42.72 | 61.00 | Apache 2.0 |

WarpQuant ofrece el menor tamaño de payload con una pérdida de rendimiento moderada en MMLU y GSM8K, pero mejora en ARC. Es una opción interesante cuando la memoria es el factor limitante.

## Limitaciones y advertencias

- La cuantización a 3,6 bpw puede provocar una degradación en tareas que requieren precisión numérica o razonamiento complejo, como se observa en GSM8K (61,00 vs 70,40 en BF16).
- El modelo solo soporta inglés y coreano; no se garantiza un buen rendimiento en otros idiomas.
- No se ha evaluado el rendimiento multimodal (visión) en la información disponible; los benchmarks solo cubren el backbone de texto.
- Al ser una cuantización post-entrenamiento, no se ha realizado fine-tuning específico, por lo que puede haber comportamientos inesperados en dominios muy especializados.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda verificar los términos del modelo base Qwen3.8-27B.
- No se dispone de información sobre sesgos o alucinaciones específicas de este checkpoint.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/HarimxChoi/WarpQuant-Qwen3.8-27B-R16E4H4
- Informe técnico de WarpQuant: https://harimxchoi.github.io/projects/warpquant
- Código de WarpQuant: https://github.com/HarimxChoi/WarpQuant
- Modelo solo texto: https://huggingface.co/HarimxChoi/WarpQuant-Qwen3.8-27B-R16E4H4-Text
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
