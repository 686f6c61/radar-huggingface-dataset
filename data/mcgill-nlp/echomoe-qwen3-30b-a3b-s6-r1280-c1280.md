# McGill-NLP/EchoMoE-Qwen3-30B-A3B-s6-r1280-c1280

## Resumen

EchoMoE-Qwen3-30B-A3B-s6-r1280-c1280 es un checkpoint de investigación desarrollado por McGill-NLP que aplica la técnica EchoMoE sobre Qwen3-30B-A3B, un transformer con mezcla de expertos (MoE) de 48 capas, 128 expertos con 8 activos y dimensión oculta de 2.048. El objetivo no es mejorar la calidad del modelo base, sino reducir el tráfico de comunicación entre nodos cuando se sirve con paralelismo de expertos (expert parallelism), un cuello de botella habitual en el despliegue distribuido de modelos MoE de gran tamaño.

La innovación consiste en que, en lugar de enviar cada estado oculto completo entre nodos, EchoMoE transmite una diferencia comprimida respecto a un estado oculto de referencia que se refresca cada pocos niveles. En esta configuración concreta la referencia se actualiza cada 6 capas (8 de 48), y tanto el código de dispatch como el de combine tienen 1.280 dimensiones. Según la model card, esto reduce un 33% los bytes enviados entre nodos y mejora el throughput un 5,5% con paralelismo de expertos 32 sobre 4 nodos, a costa de perder 1,8 puntos de media en 18 benchmarks frente al modelo profesor sin comprimir.

El checkpoint se obtiene por destilación desde Qwen3-30B-A3B-SFT-EchoMoE-teacher sobre 4,3B tokens, con todos los pesos entrenados. Es relevante para equipos de infraestructura que sirven MoE a gran escala y quieren evaluar si merece la pena intercambiar una pequeña pérdida de precisión por ganancias de rendimiento en redes lentas o congestionadas. La licencia es Apache 2.0 y el modelo está pensado únicamente para inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (qwen3_moe) con compresión EchoMoE de estados ocultos entre capas |
| Parametros totales | 37.205.342.208 (37,2B) |
| Parametros activos | 8 de 128 expertos por capa (no se especifica el recuento exacto de parámetros activos) |
| Longitud de contexto | 32.768 tokens |
| Tipos de cuantizacion | bf16 (pesos publicados); la model card menciona además envío de dispatch y combine en FP8 como variante experimental |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, con código remoto (trust_remote_code) para transformers |
| Capas | 48 |
| Dimension oculta | 2.048 |
| Configuracion EchoMoE | Referencia cada 6 capas (8 de 48), código de dispatch de 1.280 dims, código de combine de 1.280 dims |
| Precision de entrenamiento | bf16 |
| Tamano del repo | 74,4 GB |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-30B-A3B-Base, un transformer MoE de 48 capas con 128 expertos por capa de los cuales 8 están activos, y dimensión oculta de 2.048. Sobre esa base, McGill-NLP aplica EchoMoE: en lugar de que cada nodo reciba el estado oculto completo en cada paso de comunicación entre expertos, se envía una representación comprimida de 1.280 dimensiones calculada como diferencia respecto a un estado de referencia que se refresca cada 6 capas. Esto afecta tanto al dispatch (envío de tokens a los expertos) como al combine (recogida de salidas), y reduce el volumen de bytes intercambiados en un 33%.

El entrenamiento es por destilación desde el profesor Qwen3-30B-A3B-SFT-EchoMoE-teacher, que a su vez es el modelo base afinado sobre datos de instrucción Dolci (allenai/Dolci-Instruct-SFT). La destilación se realizó sobre 4,3B tokens, con todos los pesos entrenados (no solo las capas de compresión). El dataset de referencia incluye también allenai/dolma3_dolmino_mix-10B-1025. La evaluación de precisión se hizo con vLLM 0.21 y el plugin de EchoMoE; las pruebas de throughput usan el runtime de paralelismo de expertos del repositorio sobre vLLM 0.29 con DeepEP. El modelo se carga en transformers 5.8.1 mediante el código remoto incluido en el repositorio.

## Capacidades

- Generación de texto conversacional en inglés, con plantilla de chat compatible con Qwen3.
- Razonamiento de conocimiento general y tareas de instrucción (evaluado en 18 benchmarks agrupados en conocimiento/razonamiento, matemáticas, código y seguimiento de instrucciones).
- Generación de código y resolución de problemas matemáticos, con una pérdida de precisión moderada respecto al profesor (1,8 puntos de media).
- Soporte de decodificación greedy para tareas few-shot y decodificación con muestreo (temperatura 0,7, top_p 0,8, top_k 20, presence penalty 1,5 en vLLM) para chat.
- Capacidad de servir con paralelismo de expertos distribuido (expert parallel 32 sobre 4 nodos de 8 H100) mediante el runtime propio del repositorio.
- No se documentan capacidades de tool calling, function calling, agentes multi-paso, visión, audio ni modo thinking explícito en la información disponible.

## Casos de uso

- Despliegue distribuido de MoE en clústeres con red limitada: el modelo está diseñado para reducir el tráfico entre nodos un 33%, por lo que resulta adecuado cuando el enlace RDMA o TCP entre nodos es el cuello de botella; en TCP con 8 peticiones por GPU la ganancia de throughput llega al 51,9% en BF16 y al 85,8% en FP8.
- Servicio de chat en inglés a gran escala: con 32.768 tokens de contexto y ajuste sobre datos de instrucción Dolci, puede atender conversaciones multi-turno; conviene usar los parámetros de muestreo recomendados (temperatura 0,7, top_p 0,8, top_k 20, presence penalty 1,5).
- Investigación en sistemas distribuidos para IA: sirve como banco de pruebas para medir el impacto de la compresión de comunicación en la precisión, comparando directamente con el profesor sin comprimir en los mismos 18 benchmarks.
- Evaluación de técnicas de compresión de estados ocultos: el checkpoint permite reproducir los experimentos de EchoMoE con referencia cada 6 capas y códigos de 1.280 dimensiones, y contrastar con otras configuraciones de la colección EchoMoE.
- Generación de código en pipelines internos: a pesar de la pérdida de 1,8 puntos en código (57,4 frente a 59,2 del profesor), puede usarse en entornos donde el ahorro de ancho de banda compense la ligera merma de calidad.
- Inferencia en una sola GPU de 80 GB: los pesos en bf16 caben en una GPU de 80 GB con transformers y código remoto, lo que permite prototipar y validar sin montar un clúster multi-nodo.
- Benchmarking de motores de inferencia: útil para comparar vLLM 0.21 con el plugin EchoMoE frente a vLLM 0.29 con DeepEP en cargas de distinta relación entrada/salida (128→1.024, 1.024→128, 4.096→256, 16.384→512).

## Benchmarks y rendimiento

Precisión media (%) sobre 18 benchmarks por dominio, con la diferencia respecto al profesor entre paréntesis:

| Dominio | Profesor | EchoMoE | EchoMoE + FP8 |
|---|---|---|---|
| Conocimiento y razonamiento | 77,6 | 75,6 (−2,0) | 75,7 (−1,9) |
| Matematicas | 50,7 | 49,1 (−1,6) | 49,4 (−1,3) |
| Codigo | 59,2 | 57,4 (−1,8) | 56,8 (−2,4) |
| Seguimiento de instrucciones | 55,6 | 53,8 (−1,8) | 54,2 (−1,4) |
| **Media** | **66,9** | **65,1 (−1,8)** | **65,2 (−1,7)** |

Throughput relativo al profesor sin comprimir, con vLLM 0.29 y DeepEP, expert parallel 32 sobre 4 nodos de 8 H100 y asignación equilibrada de expertos:

| Carga (tokens entrada → salida) | Red | Peticiones por GPU | Ganancia BF16 | Ganancia FP8 |
|---|---|---|---|---|
| 128 → 1.024 | RDMA | 512 | −0,9% | +1,6% |
| 1.024 → 128 | RDMA | 512 | +5,8% | −1,5% |
| 4.096 → 256 | RDMA | 128 | **+5,5%** | −0,9% |
| 16.384 → 512 | RDMA | 32 | +3,1% | −1,2% |
| 4.096 → 256 | RDMA, enlace 2× más lento | 128 | +7,8% | −1,9% |
| 4.096 → 256 | RDMA, enlace 2,5× más lento | 128 | +15,1% | +8,7% |
| 4.096 → 256 | TCP | 8 | +51,9% | +85,8% |

La ganancia se reduce con lotes pequeños, llegando a −2,9% para 4.096 → 256 tokens con 8 peticiones por GPU. Los datos completos por lote están en `results/throughput/throughput.csv` del repositorio de código.

## Requisitos de hardware

- VRAM para inferencia en bf16: los pesos completos (37,2B parámetros) ocupan aproximadamente 74,4 GB, por lo que caben en una GPU de 80 GB (A100 80 GB, H100 80 GB) con transformers y código remoto.
- Para servir con paralelismo de expertos se recomienda un nodo de 8 GPUs H100; la configuración de referencia usa expert parallel 32 sobre 4 nodos de 8 H100 (32 GPUs en total).
- No se documenta compatibilidad con GPUs de consumo (RTX 4090, 24 GB) en bf16; no hay datos de cuantización GGUF ni de despliegue en llama.cpp u Ollama.
- Opciones de despliegue documentadas: vLLM 0.21 con el plugin EchoMoE (un nodo de 8 GPUs, `--data-parallel-size 8 --enable-expert-parallel --all2all-backend allgather_reducescatter --attention-backend FLASHINFER --max-num-seqs 256`) y transformers 5.8.1 con código remoto en una sola GPU de 80 GB.
- El runtime de paralelismo de expertos del repositorio usa vLLM 0.29 con DeepEP para las pruebas multi-nodo.
- Latencia y throughput: no se publican valores absolutos de latencia; solo ganancias relativas al profesor (hasta +5,5% en RDMA con 4.096→256 y 128 peticiones por GPU, y +51,9% en TCP con 8 peticiones por GPU).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Precision media (18 benchmarks) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| EchoMoE-Qwen3-30B-A3B-s6-r1280-c1280 | 37,2B totales, 8/128 expertos activos | 32.768 | 65,1 | Apache 2.0 | Hugging Face (McGill-NLP) |
| Qwen3-30B-A3B-SFT-EchoMoE-teacher (profesor) | 37,2B totales, 8/128 expertos activos | 32.768 | 66,9 | Apache 2.0 | Hugging Face (McGill-NLP) |
| Qwen3-30B-A3B-Base | 30B totales, 8/128 expertos activos | no disponible en la información | no disponible | Apache 2.0 | Hugging Face (Qwen) |

La comparación directa disponible es con el profesor sin comprimir, que obtiene 1,8 puntos más de media pero requiere un 33% más de bytes entre nodos. No se han publicado en la información proporcionada comparaciones con otros modelos MoE de tamaño similar (por ejemplo, Mixtral o DeepSeek) ni con variantes de la colección EchoMoE con otras configuraciones de referencia o dimensión de código.

## Limitaciones y advertencias

- Pérdida de precisión sistemática de 1,8 puntos de media frente al profesor en 18 benchmarks, con mayor impacto en código (−1,8) y conocimiento/razonamiento (−2,0).
- Solo soporta inglés; no se documentan capacidades multilingües.
- Contexto limitado a 32.768 tokens.
- La ganancia de throughput depende fuertemente de la red y del tamaño de lote: con lotes pequeños puede ser negativa (−2,9% en 4.096→256 con 8 peticiones por GPU) y en RDMA con carga 128→1.024 es de −0,9% en BF16.
- La variante FP8 del envío de dispatch y combine no mejora de forma consistente: pierde throughput en varias cargas RDMA (−0,9%, −1,2%, −1,5%, −1,9%) y solo gana en TCP y en enlaces lentos.
- Requiere software específico (plugin EchoMoE sobre vLLM 0.21 o código remoto con transformers 5.8.1); no es un checkpoint estándar de transformers sin `trust_remote_code=True`.
- El arranque en vLLM requiere limitar `--max-num-seqs` a 256 para evitar que la captura de CUDA graphs supere el tiempo de espera de 600 segundos del servidor de API.
- Riesgo de alucinación no cuantificado en la información disponible; al ser un modelo destilado para investigación, no se han publicado evaluaciones de sesgo ni de seguridad.
- Licencia Apache 2.0 permite uso comercial, pero el modelo se distribuye como checkpoint de investigación sin garantías de producción.
- El checkpoint se creó el 17 de noviembre de 2026 y no tiene descargas ni likes en Hugging Face, por lo que no hay validación comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/McGill-NLP/EchoMoE-Qwen3-30B-A3B-s6-r1280-c1280
- Código: https://github.com/McGill-NLP/EchoMoE
- Página del proyecto: https://mcgill-nlp.github.io/EchoMoE/
- Colección EchoMoE: https://huggingface.co/collections/McGill-NLP/echomoe-6afcbfa10b38185f87cbd0ac
- Modelo profesor: https://huggingface.co/McGill-NLP/Qwen3-30B-A3B-SFT-EchoMoE-teacher
- Modelo base original: https://huggingface.co/Qwen/Qwen3-30B-A3B-Base
- Dataset de instrucciones: https://huggingface.co/datasets/allenai/Dolci-Instruct-SFT
- Dataset Dolmino: https://huggingface.co/datasets/allenai/dolma3_dolmino_mix-10B-1025
- Resultados de throughput por lote: https://github.com/McGill-NLP/EchoMoE/blob/main/results/throughput/throughput.csv
- Paper en arXiv: no disponible (la model card lo marca como pendiente)
