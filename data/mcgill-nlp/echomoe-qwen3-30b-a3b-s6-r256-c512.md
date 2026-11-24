# McGill-NLP/EchoMoE-Qwen3-30B-A3B-s6-r256-c512

## Resumen

EchoMoE-Qwen3-30B-A3B-s6-r256-c512 es un checkpoint de investigación desarrollado por el laboratorio McGill-NLP que aplica la técnica EchoMoE sobre Qwen3-30B-A3B, un transformer de mezcla de expertos (MoE) de 48 capas con 128 expertos y 8 activos por token. El problema que aborda es el coste de comunicación en el paralelismo de expertos (expert parallelism): en lugar de transmitir cada estado oculto completo entre nodos, el modelo envía una diferencia comprimida respecto a un estado de referencia que se refresca cada pocas capas. Esta variante concreta usa una referencia cada 6 capas, un código de dispatch de 256 dimensiones y un código de combine de 512 dimensiones.

El resultado es una reducción del 73 % en bytes transmitidos entre nodos y una mejora de throughput del 39,6 % en expert parallel 32 sobre 4 nodos, a cambio de una pérdida media de 10,0 puntos sobre 18 benchmarks respecto al modelo profesor sin comprimir. Es relevante porque demuestra que se puede retrofitear un MoE preentrenado para comunicar menos sin rediseñar la arquitectura, un enfoque útil para despliegues distribuidos con enlaces de red limitados.

El modelo se distribuye con licencia Apache 2.0, pesos en safetensors (bf16, 50,7 GB de repositorio), contexto de 32.768 tokens y soporte únicamente para inglés. Requiere código remoto y un plugin específico para vLLM.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE (qwen3_moe) con retrofit EchoMoE |
| Parámetros totales | 25.369.016.320 (~25,4 B) |
| Parámetros activos | 8 de 128 expertos por token (A3B) |
| Longitud de contexto | 32.768 tokens |
| Tipos de cuantización | bf16 (pesos publicados); FP8 para dispatch/combine en la variante medida; no se documentan GGUF ni otras |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (custom_code, requiere trust_remote_code) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-30B-A3B-Base: 48 capas, 128 expertos con 8 activos, hidden size de 2.048. Sobre esa base, EchoMoE introduce un mecanismo de compresión de la comunicación entre expertos: cada estado oculto se codifica como una diferencia respecto a un estado de referencia que se refresca cada 6 capas (8 referencias en total en las 48 capas), con un código de dispatch de 256 dimensiones y un código de combine de 512 dimensiones. Esto reduce el volumen de datos intercambiados en el all-to-all del paralelismo de expertos.

El entrenamiento es una destilación desde el profesor Qwen3-30B-A3B-SFT-EchoMoE-teacher (el base afinado con datos de instrucción Dolci) sobre 4.300 millones de tokens, con todos los pesos entrenados. Los datasets citados son allenai/Dolci-Instruct-SFT y allenai/dolma3_dolmino_mix-10B-1025. La evaluación de precisión se realizó con vLLM 0.21 y el plugin de EchoMoE; las pruebas de throughput usan el runtime de paralelismo de expertos del repositorio sobre vLLM 0.29 con DeepEP. La carga en transformers 5.8.1 se hace mediante código remoto del repositorio.

## Capacidades

- Generación de texto conversacional en inglés, con plantilla de chat de Qwen3.
- Razonamiento y conocimiento general, aunque con degradación medible frente al profesor (ver benchmarks).
- Matemáticas y código, con pérdidas de 9,1 y 7,6 puntos respectivamente frente al profesor.
- Seguimiento de instrucciones, la tarea menos afectada por la compresión (−4,4 puntos).
- Decodificación greedy para tareas few-shot y muestreo con temperatura 0,7, top_p 0,8, top_k 20 y presence penalty 1,5 en vLLM para chat.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo thinking en la información disponible.
- Capacidades multilingües limitadas al inglés según la model card.

## Casos de uso

- Investigación en eficiencia de comunicación distribuida: sirve como referencia reproducible para medir el impacto de comprimir el all-to-all en paralelismo de expertos, con el runtime del repositorio y DeepEP sobre vLLM 0.29.
- Despliegue en clústeres con red limitada: en enlaces RDMA 2,5 veces más lentos el modelo logra un +67,9 % de throughput frente al profesor, y en TCP hasta +131,6 %, lo que lo hace adecuado para entornos donde el ancho de banda es el cuello de botella.
- Servicio de chat en inglés con contexto largo: los 32.768 tokens permiten conversaciones multi-turno y documentos extensos, con la configuración de muestreo indicada por los autores.
- Generación de código asistida en pipelines internos: pese a la caída de 7,6 puntos en código, sigue siendo utilizable para autocompletado y revisión en entornos donde el ahorro de red prima sobre la precisión máxima.
- Evaluación comparativa de técnicas de compresión: como checkpoint de ablación (s6, r256, c512) dentro de la colección EchoMoE, permite aislar el efecto de la frecuencia de referencia y de las dimensiones de los códigos.
- Prototipado académico en una sola GPU: los pesos bf16 caben en una GPU de 80 GB mediante transformers con código remoto, sin necesidad de montar paralelismo de expertos.
- Tareas de seguimiento de instrucciones con pérdida tolerable: la caída de solo 4,4 puntos en instruction following lo hace viable para asistentes internos donde no se exige paridad con el profesor.

## Benchmarks y rendimiento

Precisión media (%) sobre 18 benchmarks por dominio, con la variación respecto al profesor entre paréntesis:

| Dominio | Profesor | EchoMoE | EchoMoE + FP8 |
|---|---|---|---|
| Conocimiento y razonamiento | 77,6 | 65,8 (−11,8) | 65,7 (−11,9) |
| Matemáticas | 50,7 | 41,6 (−9,1) | 41,6 (−9,1) |
| Código | 59,2 | 51,6 (−7,6) | 50,6 (−8,6) |
| Seguimiento de instrucciones | 55,6 | 51,2 (−4,4) | 51,6 (−4,0) |
| **Media** | **66,9** | **56,9 (−10,0)** | **56,7 (−10,2)** |

Throughput frente al profesor, ambos con vLLM 0.29 y DeepEP, expert parallel 32 sobre 4 nodos de 8 H100:

| Carga (entrada → salida) | Red | Peticiones por GPU | Ganancia BF16 | Ganancia FP8 |
|---|---|---|---|---|
| 128 → 1.024 | RDMA | 512 | +23,0 % | +22,8 % |
| 1.024 → 128 | RDMA | 512 | +46,8 % | +31,2 % |
| 4.096 → 256 | RDMA | 128 | +39,6 % | +25,0 % |
| 16.384 → 512 | RDMA | 32 | +26,1 % | +15,9 % |
| 4.096 → 256 | RDMA, enlace 2× más lento | 128 | +38,0 % | +29,9 % |
| 4.096 → 256 | RDMA, enlace 2,5× más lento | 128 | +67,9 % | +40,6 % |
| 4.096 → 256 | TCP | 8 | +131,6 % | +211,9 % |

La ganancia se reduce con lotes pequeños, hasta −4,1 % en 128 → 1.024 con 8 peticiones por GPU. No se publican resultados por benchmark individual (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM para inferencia en bf16: los pesos (~25,4 B parámetros) ocupan aproximadamente 50,7 GB, por lo que caben en una GPU de 80 GB (A100 80 GB, H100 80 GB) con transformers y código remoto.
- Para paralelismo de expertos: configuración de referencia con 4 nodos de 8 H100 (32 GPUs) y expert parallel 32.
- Configuración mínima vLLM indicada: un nodo de 8 GPUs con data-parallel-size 8 y expert-parallel habilitado.
- No se documenta despliegue en GPU de consumo (RTX 4090, 24 GB) en bf16; requeriría cuantización no publicada.
- Opciones de despliegue: vLLM 0.21 con plugin EchoMoE para precisión, vLLM 0.29 con DeepEP para throughput multi-nodo, y transformers 5.8.1 con trust_remote_code.
- En vLLM se recomienda `--max-num-seqs 256` para limitar el arranque a unos minutos, ya que la captura de CUDA graphs crece con las secuencias concurrentes.
- Throughput: ganancia de hasta +39,6 % (RDMA, 4.096 → 256) y +131,6 % (TCP) frente al profesor; no se publican valores absolutos de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Media 18 benchmarks | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| EchoMoE-Qwen3-30B-A3B-s6-r256-c512 | ~25,4 B | 8/128 expertos | 32.768 | 56,9 | Apache 2.0 | Hugging Face (custom_code) |
| Qwen3-30B-A3B-SFT-EchoMoE-teacher | ~25,4 B (no confirmado) | 8/128 expertos | no disponible | 66,9 | no disponible | Hugging Face (McGill-NLP) |
| Qwen3-30B-A3B-Base | ~25,4 B (no confirmado) | 8/128 expertos | no disponible | no disponible | no disponible | Hugging Face (Qwen) |

La comparación directa solo es posible con el profesor, del que se conocen los 66,9 puntos de media. Para Qwen3-30B-A3B-Base no se dispone de resultados en la información proporcionada.

## Limitaciones y advertencias

- Pérdida de precisión significativa: 10,0 puntos de media sobre 18 benchmarks, con el mayor deterioro en conocimiento y razonamiento (−11,8).
- El checkpoint está pensado para investigación en eficiencia de comunicación, no como modelo de producción de máxima calidad.
- Solo inglés; no se garantiza comportamiento en otros idiomas.
- Requiere código remoto (`trust_remote_code=True`) y un plugin específico de vLLM; no funciona con el cargador estándar sin ese código.
- El throughput mejora solo con lotes grandes y en escenarios de red limitada; con lotes pequeños puede degradarse (−4,1 % medido).
- El arranque en vLLM puede superar el tiempo de espera por defecto si no se limita `--max-num-seqs`.
- No se documentan evaluaciones de sesgo, toxicidad ni alucinación en la información disponible.
- Licencia Apache 2.0 permite uso comercial, pero la calidad degradada y la dependencia de código remoto deben evaluarse antes de desplegar.
- Riesgo de alucinación no cuantificado; al ser un modelo destilado con compresión de comunicación, la fidelidad factual puede verse afectada más allá de lo que reflejan los benchmarks agregados.

## Enlaces

- Hugging Face: https://huggingface.co/McGill-NLP/EchoMoE-Qwen3-30B-A3B-s6-r256-c512
- Paper: https://arxiv.org/abs/2611.22215
- Código: https://github.com/McGill-NLP/EchoMoE
- Página del proyecto: https://mcgill-nlp.github.io/EchoMoE/
- Colección EchoMoE: https://huggingface.co/collections/McGill-NLP/echomoe-6afcbfa10b38185f87cbd0ac
- Modelo profesor: https://huggingface.co/McGill-NLP/Qwen3-30B-A3B-SFT-EchoMoE-teacher
- Modelo base: https://huggingface.co/Qwen/Qwen3-30B-A3B-Base
- Resultados de throughput: https://github.com/McGill-NLP/EchoMoE/blob/main/results/throughput/throughput.csv
