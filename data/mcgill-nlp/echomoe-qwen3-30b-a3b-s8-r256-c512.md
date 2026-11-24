# McGill-NLP/EchoMoE-Qwen3-30B-A3B-s8-r256-c512

## Resumen

EchoMoE-Qwen3-30B-A3B-s8-r256-c512 es un checkpoint de investigación desarrollado por McGill-NLP que aplica la técnica EchoMoE sobre Qwen3-30B-A3B. EchoMoE es un método de retroadaptación (retrofit) para modelos de mezcla de expertos (MoE) que reduce el volumen de comunicación entre nodos en entornos de paralelismo de expertos: en lugar de transmitir cada estado oculto completo, el modelo envía una diferencia comprimida respecto a un estado de referencia que se refresca cada pocas capas. El objetivo es acelerar la inferencia distribuida en clústeres multi-nodo sin cambiar el número de parámetros ni la arquitectura subyacente.

El checkpoint parte del modelo base Qwen3-30B-A3B-Base (48 capas, 128 expertos con 8 activos, tamaño oculto 2.048) y se destila desde un profesor ajustado con instrucciones (Qwen3-30B-A3B-SFT-EchoMoE-teacher). La configuración concreta usa una referencia cada 8 capas (6 de 48), un código de despacho de 256 dimensiones y un código de combinación de 512 dimensiones. Según la model card, reduce un 75 % los bytes intercambiados entre nodos y mejora el throughput un 42,9 % en paralelismo de expertos 32 sobre 4 nodos, a costa de una pérdida media de 11,2 puntos en 18 benchmarks frente al profesor sin comprimir.

Es relevante ahora porque aborda un cuello de botella real en el despliegue de MoE a gran escala: el tráfico de red del all-to-all entre expertos. El modelo está pensado para escenarios de servicio distribuido con vLLM y DeepEP, no tanto para uso en una sola GPU, y se distribuye con licencia Apache 2.0.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE (qwen3_moe) con retrofit EchoMoE; 48 capas, 128 expertos, 8 activos, hidden size 2.048 |
| Parámetros totales | 25.470.732.288 (≈25,5 B) |
| Parámetros activos | 8 de 128 expertos activos por token (modelo MoE tipo A3B) |
| Longitud de contexto | 32.768 tokens |
| Tipos de cuantización | bf16 (pesos publicados); la model card menciona además envío de dispatch/combine en FP8 para el runtime, no cuantización de pesos |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors, con código remoto (`trust_remote_code=True`); requiere transformers 5.8.1 o el plugin de vLLM |

## Arquitectura y entrenamiento

El modelo es un transformer de mezcla de expertos basado en Qwen3-30B-A3B: 48 capas, 128 expertos por capa con 8 activos por token y un tamaño oculto de 2.048. La innovación de EchoMoE consiste en modificar la comunicación entre expertos bajo paralelismo de expertos: cada estado oculto no se envía completo, sino como una diferencia comprimida respecto a un estado de referencia que se refresca cada 8 capas (6 referencias en las 48 capas). El despacho usa un código de 256 dimensiones y la combinación un código de 512 dimensiones. Esto reduce el volumen de bytes del all-to-all en un 75 % según el autor.

El entrenamiento es una destilación desde el profesor Qwen3-30B-A3B-SFT-EchoMoE-teacher sobre 4,3 mil millones de tokens, con todos los pesos entrenados (no solo los módulos de compresión). Los datos citados son allenai/Dolci-Instruct-SFT y allenai/dolma3_dolmino_mix-10B-1025. El checkpoint se sirve en bf16. Para evaluación de precisión se usó vLLM 0.21 con el plugin EchoMoE; para throughput, el runtime de paralelismo de expertos del repositorio sobre vLLM 0.29 con DeepEP. La carga en transformers se hace mediante código remoto incluido en el repositorio, en PyTorch puro y sin paralelismo de expertos.

## Capacidades

- Generación de texto conversacional en inglés, con plantilla de chat de Qwen3.
- Razonamiento y conocimiento general, matemáticas y código (evaluados en 18 benchmarks según la model card, con caída frente al profesor).
- Seguimiento de instrucciones (instrucción following), evaluado como dominio separado.
- Carga mediante código remoto en transformers y despliegue con plugin en vLLM con paralelismo de expertos.
- Modo de generación de chat con los valores no-thinking de Qwen3 (temperatura 0,7, top_p 0,8, top_k 20, presence penalty 1,5 en vLLM).
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo thinking explícito en la información disponible.
- Capacidad multilingüe: limitada al inglés según la model card.

## Casos de uso

- Servicio distribuido de un MoE en clúster multi-nodo: el modelo está diseñado para desplegarse con paralelismo de expertos (por ejemplo, expert parallel 32 sobre 4 nodos de 8 H100) y reducir el tráfico de red del all-to-all, lo que resulta adecuado cuando el enlace entre nodos es el cuello de botella.
- Investigación sobre comunicación eficiente en MoE: sirve como referencia reproducible para estudiar el compromiso entre compresión de estados ocultos y calidad, con configuraciones de referencia cada 8 capas y códigos de 256/512 dimensiones.
- Despliegue en redes lentas o TCP: la model card reporta ganancias de throughput de hasta +138,3 % en BF16 y +224,4 % en FP8 sobre TCP con 8 peticiones por GPU, lo que lo hace útil en entornos con interconexión limitada.
- Evaluación comparativa de técnicas de compresión: al publicarse junto al profesor sin comprimir, permite medir la degradación por dominio (conocimiento, matemáticas, código, instrucción following) de forma controlada.
- Prototipado en una sola GPU de 80 GB: los pesos en bf16 caben en una GPU de 80 GB mediante transformers con código remoto, lo que facilita pruebas de calidad sin infraestructura multi-nodo.
- Cargas con salidas cortas y entradas largas: los mayores incrementos de throughput se dan en escenarios tipo 1.024→128 y 4.096→256 tokens, adecuados para tareas de resumen, clasificación o respuesta breve sobre contexto largo.

## Benchmarks y rendimiento

Precisión media (%) sobre 18 benchmarks por dominio, con la variación respecto al profesor entre paréntesis:

| Dominio | Profesor | EchoMoE | EchoMoE + FP8 |
|---|---|---|---|
| Conocimiento y razonamiento | 77,6 | 64,2 (−13,4) | 64,1 (−13,5) |
| Matemáticas | 50,7 | 40,9 (−9,8) | 41,0 (−9,7) |
| Código | 59,2 | 50,7 (−8,5) | 50,1 (−9,1) |
| Seguimiento de instrucciones | 55,6 | 51,0 (−4,6) | 50,9 (−4,7) |
| **Media** | **66,9** | **55,7 (−11,2)** | **55,6 (−11,3)** |

Throughput frente al profesor sin comprimir, ambos con vLLM 0.29 y DeepEP, expert parallel 32 sobre 4 nodos de 8 H100:

| Carga (entrada → salida) | Red | Peticiones por GPU | Ganancia BF16 | Ganancia FP8 |
|---|---|---|---|---|
| 128 → 1.024 | RDMA | 512 | +25,6 % | +25,1 % |
| 1.024 → 128 | RDMA | 512 | +51,5 % | +34,4 % |
| 4.096 → 256 | RDMA | 128 | +42,9 % | +27,3 % |
| 16.384 → 512 | RDMA | 32 | +28,0 % | +17,6 % |
| 4.096 → 256 | RDMA, enlace 2× más lento | 128 | +40,2 % | +33,3 % |
| 4.096 → 256 | RDMA, enlace 2,5× más lento | 128 | +73,0 % | +43,3 % |
| 4.096 → 256 | TCP | 8 | +138,3 % | +224,4 % |

La ganancia se reduce con lotes pequeños: hasta −2,2 % para 128 → 1.024 con 8 peticiones por GPU. Los resultados completos están en `results/throughput/throughput.csv` del repositorio.

## Requisitos de hardware

- Inferencia en bf16: los pesos caben en una GPU de 80 GB (por ejemplo, A100 80 GB o H100 80 GB) usando transformers con código remoto.
- Despliegue recomendado: vLLM con el plugin EchoMoE; el ejemplo de la model card sirve el modelo en un nodo de 8 GPUs con `--data-parallel-size 8 --enable-expert-parallel` y backend all-to-all `allgather_reducescatter`.
- Throughput medido en multi-nodo: 4 nodos de 8 H100 con expert parallel 32 y DeepEP.
- Con `--max-num-seqs 256` el arranque en vLLM tarda unos minutos; con el valor por defecto la captura de CUDA graphs puede superar el tiempo de espera de 600 s del servidor de API.
- No se documenta despliegue en GPU de consumo (RTX 4090, etc.) ni cuantizaciones GGUF/Ollama/llama.cpp en la información disponible.
- No se publican cifras de latencia absoluta ni de throughput absoluto, solo ganancias relativas frente al profesor.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| EchoMoE-Qwen3-30B-A3B-s8-r256-c512 | 25,5 B (8 de 128 expertos activos) | 32.768 | Apache 2.0 | Comunicación comprimida; −11,2 puntos medios frente a su profesor |
| Qwen3-30B-A3B-SFT-EchoMoE-teacher (profesor) | ~30 B (8 de 128 activos) | 32.768 | Apache 2.0 | Referencia sin comprimir; media de 66,9 en los 18 benchmarks |
| Qwen3-30B-A3B-Base | ~30 B (8 de 128 activos) | no disponible en la información | Apache 2.0 | Modelo base sobre el que se construye el profesor |

No se dispone de comparativas con otros modelos de la misma categoría fuera de la familia Qwen3 en la información proporcionada.

## Limitaciones y advertencias

- Pérdida de calidad significativa: −11,2 puntos de media en 18 benchmarks frente al profesor, con caídas de −13,4 en conocimiento y razonamiento y −9,8 en matemáticas.
- Solo inglés: la model card declara únicamente el idioma `en`.
- Contexto limitado a 32.768 tokens.
- Ganancias de throughput dependientes del escenario: se vuelven negativas en lotes pequeños (hasta −2,2 % en 128 → 1.024 con 8 peticiones por GPU) y dependen de la red (RDMA frente a TCP).
- Requiere software específico: plugin de vLLM y runtime de paralelismo de expertos del repositorio; en transformers exige `trust_remote_code=True` y transformers 5.8.1.
- El uso de código remoto implica ejecutar código del repositorio del autor; conviene revisarlo antes de desplegar en producción.
- No se documentan sesgos concretos ni tasas de alucinación medidas; al ser un modelo destilado con pérdida de conocimiento, el riesgo de alucinación puede ser mayor que en el profesor.
- Licencia Apache 2.0 permite uso comercial, pero la degradación de calidad y la dependencia de infraestructura multi-nodo deben evaluarse antes de producción.
- Modelo de investigación con 376 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en producción.

## Enlaces

- Hugging Face: https://huggingface.co/McGill-NLP/EchoMoE-Qwen3-30B-A3B-s8-r256-c512
- Paper: https://arxiv.org/abs/2611.22215
- Código: https://github.com/McGill-NLP/EchoMoE
- Página del proyecto: https://mcgill-nlp.github.io/EchoMoE/
- Colección EchoMoE: https://huggingface.co/collections/McGill-NLP/echomoe-6afcbfa10b38185f87cbd0ac
- Profesor: https://huggingface.co/McGill-NLP/Qwen3-30B-A3B-SFT-EchoMoE-teacher
- Modelo base: https://huggingface.co/Qwen/Qwen3-30B-A3B-Base
- Resultados de throughput: https://github.com/McGill-NLP/EchoMoE/blob/main/results/throughput/throughput.csv
