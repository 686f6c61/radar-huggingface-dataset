# puretensor/MiniCPM5-2B-NVFP4A16

## Resumen

MiniCPM5-2B-NVFP4A16 es una cuantización NVFP4 de solo pesos (W4A16) del modelo openbmb/MiniCPM5-2B, publicada por puretensor. Se trata de un checkpoint de prueba, no afiliado ni respaldado por OpenBMB, que reduce el tamaño del repositorio de 5,03 GB en BF16 a 2,18 GB manteniendo las activaciones en 16 bits. La cuantización se aplica únicamente a las capas `Linear` de los 42 bloques del transformer; embeddings, cabeza de salida, normas y activaciones permanecen en BF16.

El modelo base es un transformer de 2.516.756.480 parámetros (aproximadamente 2,5 mil millones) orientado a generación de texto conversacional. Esta versión cuantizada emplea el esquema `NVFP4A16` de compressed-tensors: valores de 4 bits en formato E2M1, una escala FP8 E4M3 por cada grupo de 16 elementos y una escala FP32 por tensor. El método de cuantización es GPTQ con `block_size` 128, `dampening_frac` 0.01 y `actorder` estático.

La relevancia de esta ficha reside en que el autor documenta con rigor el compromiso calidad/rendimiento: la cuantización pierde 2,69 puntos en MMLU y 4,02 en GSM8K frente a BF16, pero acelera la inferencia entre un 28 % y un 53 % en vLLM según la concurrencia. Es un caso útil para evaluar si el ahorro de VRAM y el aumento de throughput compensan la degradación en tareas de razonamiento y matemáticas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (42 bloques), modelo base MiniCPM5-2B |
| Parametros totales | 2.516.756.480 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la información proporcionada |
| Tipos de cuantizacion | NVFP4A16 (W4A16): pesos 4-bit E2M1, escala FP8 E4M3 por grupo de 16, escala FP32 por tensor; GPTQ |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compressed-tensors `nvfp4-pack-quantized`) |

## Arquitectura y entrenamiento

El checkpoint cuantizado parte de los pesos BF16 oficiales de openbmb/MiniCPM5-2B, un transformer de 42 bloques con 2.516.756.480 parámetros. La cuantización se aplica exclusivamente a las capas `Linear` de esos bloques; los embeddings de tokens, la cabeza de salida (`lm_head` ignorado explícitamente en la receta), todas las normas y todas las activaciones se mantienen en BF16. El esquema NVFP4A16 combina valores de 4 bits en formato E2M1 con una escala FP8 E4M3 por grupo de 16 elementos y una escala FP32 por tensor, lo que permite una representación de pesos más fina que una cuantización por tensor convencional.

El proceso se realizó con GPTQ (`block_size` 128, `dampening_frac` 0.01, `actorder` estático) usando como calibración los primeros 512 ejemplos de `mlabonne/open-perfectblend`, con hasta 2.048 tokens por muestra. Las herramientas empleadas fueron llm-compressor 0.15.0, compressed-tensors 0.20.1, transformers 5.21.0 y torch 2.14.1. El autor advierte de un sesgo en la calibración: 180 de las 512 muestras son problemas matemáticos (MetaMathQA y Orca-Math) y 75 provienen de UltraChat, por lo que las métricas de GSM8K y de chat pueden favorecer a este checkpoint; las filas de MMLU y WikiText no están relacionadas con los datos de calibración.

## Capacidades

- Generación de texto conversacional y finalización de texto, con plantilla de chat aplicable mediante `apply_chat_template`.
- Razonamiento y matemáticas: el modelo base obtiene 57,29 en MMLU y 72,48 en GSM8K en BF16; esta versión cuantizada mantiene 54,60 y 68,46 respectivamente.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Capacidades especiales (modo thinking, visión, audio): no disponible en la información proporcionada.
- Compatibilidad con text-generation-inference y endpoints compatibles, según las etiquetas del repositorio.

## Casos de uso

- Despliegue de chat conversacional con restricciones de VRAM: el checkpoint ocupa 2,18 GB frente a 5,03 GB en BF16, lo que permite servirlo en GPUs con menos memoria manteniendo activaciones en 16 bits y una calidad cercana al modelo original.
- Servicio de generación de texto en vLLM con throughput moderado: el autor mide 1,40x de velocidad en un solo stream, 1,53x con 8 peticiones concurrentes y 1,28x con 32 concurrentes frente a BF16, útil para endpoints con carga variable.
- Evaluación de cuantizaciones en pipelines de investigación: al documentar MMLU, GSM8K, perplejidad WikiText-2 y divergencia KL, sirve como referencia reproducible para comparar esquemas NVFP4 frente a AWQ o GPTQ con otras configuraciones.
- Prototipado rápido en entornos con ancho de banda limitado: la reducción de 5,03 GB a 2,18 GB acelera la descarga y el almacenamiento en caché de modelos durante iteraciones de desarrollo.
- Tareas de razonamiento matemático de dificultad media: con 68,46 en GSM8K, es adecuado para asistentes educativos o resolución de problemas aritméticos donde una pérdida de 4 puntos frente a BF16 es aceptable.
- Clasificación y resumen de texto en lote: la perplejidad WikiText-2 de 16,27 (frente a 15,64 en BF16) indica una degradación contenida en modelado de lenguaje, suficiente para tareas de extracción o resumen no críticas.
- Inferencia en GPUs Blackwell con kernels FP4: vLLM ejecuta este checkpoint con `MarlinNvFp4LinearKernel`, por lo que es un caso de prueba para validar el soporte de FP4 en hardware de compute capability 12.0.

## Benchmarks y rendimiento

| Métrica | BF16 | Este checkpoint | Cambio | Test pareado |
|---|---:|---:|---:|---|
| MMLU, accuracy (14.042 preguntas) | 57,29 | 54,60 | -2,69 | 1.176 perdidas, 799 ganadas, p = 2e-17 |
| GSM8K, exact match (1.319 problemas) | 72,48 | 68,46 | -4,02 | 130 perdidas, 77 ganadas, p = 3e-4 |
| WikiText-2, perplejidad (131.072 tokens) | 15,64 | 16,27 | +0,63 | — |

| Texto | Tokens | KL media | KL percentil 99 | Mismo token top que BF16 |
|---|---:|---:|---:|---:|
| WikiText-2 test | 131.072 | 0,064 | 0,52 | 87,5 % |
| Chat (ultrachat_200k, test_sft, 256 conversaciones) | 224.534 | 0,068 | 0,97 | 90,2 % |

| Servicio en vLLM 0.34.0 (GPU Blackwell, cc 12.0) | BF16 | Este checkpoint |
|---|---:|---:|
| GSM8K vía API de completions (flexible-extract) | 72,10 | 68,23 |
| Throughput, un stream | 1,00x | 1,40x |
| Throughput, 8 concurrentes | 1,00x | 1,53x |
| Throughput, 32 concurrentes | 1,00x | 1,28x |

| Build 4-bit | Activaciones | MMLU | GSM8K | KL wiki | KL chat |
|---|---|---:|---:|---:|---:|
| BF16 referencia | 16-bit | 57,29 | 72,48 | 0 | 0 |
| Este checkpoint (GPTQ, dampening 0,01) | 16-bit | 54,60 | 68,46 | 0,064 | 0,068 |
| GPTQ público, dampening 0,1 | 16-bit | 55,92 | 62,93 | 0,069 | 0,099 |
| AWQ público con escalas buscadas | 16-bit | 50,45 | 61,71 | 0,103 | 0,149 |
| GPTQ propio con activaciones 4-bit (no publicado) | 4-bit | 49,88 | 59,59 | 0,167 | 0,205 |
| AWQ público con activaciones 4-bit | 4-bit | 47,14 | 52,92 | 0,208 | 0,286 |

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio pesa 2,18 GB en disco; en vLLM con kernel FP4 la huella de pesos es de aproximadamente esa cifra, más overhead de activaciones en 16 bits y caché KV. En Transformers los pesos se expanden a 16-bit al cargar, por lo que la VRAM efectiva se acerca a la del modelo BF16 (unos 5 GB solo de pesos).
- GPU recomendadas: el autor valida el checkpoint en una GPU NVIDIA Blackwell (compute capability 12.0) con vLLM 0.34.0 y el kernel `MarlinNvFp4LinearKernel`. No se documentan pruebas en A100, H100 ni RTX 4090.
- Cabe en GPU consumer: el tamaño de pesos (2,18 GB) sugiere que sí en GPUs con 8 GB o más, pero no hay validación publicada en tarjetas consumer; el soporte del kernel FP4 depende de la arquitectura.
- Opciones de despliegue: vLLM (`vllm serve puretensor/MiniCPM5-2B-NVFP4A16`) y Transformers con `compressed-tensors` instalado. También figura la etiqueta text-generation-inference. No se menciona soporte de llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: 1,40x en un stream, 1,53x con 8 concurrentes y 1,28x con 32 concurrentes frente a BF16, con generaciones fijas de 256 tokens y decodificación greedy. El autor advierte que los números variarán en otro hardware.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | MMLU | GSM8K | Licencia | Disponibilidad |
|---|---:|---|---:|---:|---|---|
| MiniCPM5-2B NVFP4A16 (este) | 2,52 B | No disponible | 54,60 | 68,46 | Apache 2.0 | Hugging Face |
| MiniCPM5-2B BF16 (base) | 2,52 B | No disponible | 57,29 | 72,48 | Apache 2.0 | Hugging Face |
| GPTQ público de MiniCPM5-2B (dampening 0,1) | 2,52 B | No disponible | 55,92 | 62,93 | No disponible | Hugging Face |
| AWQ público de MiniCPM5-2B (escalas buscadas) | 2,52 B | No disponible | 50,45 | 61,71 | No disponible | Hugging Face |

## Limitaciones y advertencias

- Calidad inferior a BF16 de forma estadísticamente significativa: -2,69 puntos en MMLU (p = 2e-17) y -4,02 en GSM8K (p = 3e-4). Si se necesita la calidad del modelo base, debe usarse la versión BF16.
- En Transformers los pesos se expanden a 16-bit al cargar, por lo que el ahorro se limita a disco y descarga; el beneficio de VRAM solo se materializa con motores que soporten el kernel FP4, como vLLM.
- Sesgo de calibración: 180 de las 512 muestras son problemas matemáticos (MetaMathQA, derivado de los conjuntos de entrenamiento de GSM8K y MATH) y 75 provienen de UltraChat, la misma familia que el conjunto de evaluación de chat. Las métricas de GSM8K y chat pueden estar infladas; MMLU y WikiText no están afectados.
- Es una versión de prueba no afiliada ni respaldada por OpenBMB; no hay garantía de mantenimiento ni de soporte.
- Idiomas soportados no documentados: no se puede asumir un rendimiento multilingüe sin evaluación.
- Longitud de contexto no documentada en la información disponible.
- Riesgo de alucinación y sesgos del modelo base: no se han publicado evaluaciones específicas en la información proporcionada.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías sobre la idoneidad en producción.
- El throughput medido corresponde a una GPU Blackwell concreta con generaciones de 256 tokens y decodificación greedy; no es extrapolable a otras arquitecturas ni a longitudes variables.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/puretensor/MiniCPM5-2B-NVFP4A16
- Modelo base: https://huggingface.co/openbmb/MiniCPM5-2B
- Dataset de calibración: https://huggingface.co/datasets/mlabonne/open-perfectblend
- Dataset de evaluación de chat: https://huggingface.co/datasets/HuggingFaceH4/ultrachat_200k
- Herramienta de cuantización llm-compressor: no disponible enlace en la información proporcionada
- compressed-tensors: no disponible enlace en la información proporcionada
- lm-evaluation-harness 0.4.13: no disponible enlace en la información proporcionada
