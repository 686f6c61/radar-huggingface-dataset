# McGill-NLP/EchoMoE-Qwen3-30B-A3B-s4-r512-c768

## Resumen

EchoMoE-Qwen3-30B-A3B-s4-r512-c768 es un ajuste fino del modelo Qwen3-30B-A3B que aplica la técnica EchoMoE, desarrollada por el grupo McGill-NLP. El objetivo no es mejorar la calidad del modelo base, sino reducir el coste de comunicación en inferencia distribuida con paralelismo de expertos (expert parallelism). En lugar de transmitir cada estado oculto completo entre nodos, el modelo envía una diferencia comprimida respecto a un estado de referencia que se refresca cada pocos bloques.

El checkpoint concreto aplica EchoMoE sobre Qwen3-30B-A3B con una referencia cada 4 capas, un código de dispatch de 512 dimensiones y un código de combine de 768 dimensiones. Según la model card, esto reduce un 58% los bytes intercambiados entre nodos y mejora el throughput un 22,6% en expert parallel 32 sobre 4 nodos, a cambio de una pérdida media de 3,8 puntos en 18 benchmarks frente al profesor sin comprimir.

Es relevante para equipos que ya sirven modelos MoE grandes en clústeres multi-nodo y quieren amortizar el coste de red, especialmente en enlaces lentos o topologías TCP, donde la ganancia de throughput llega a ser del 93,2%.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (qwen3_moe) con retrofit EchoMoE; 48 capas, 128 expertos, 8 activos, hidden size 2.048 |
| Parametros totales | 28.229.523.456 (~28,2 mil millones) |
| Parametros activos | 8 de 128 expertos por token (modelo base A3B); cifra exacta de parametros activos no disponible |
| Longitud de contexto | 32.768 tokens |
| Tipos de cuantizacion | bf16 (pesos publicados); soporte de dispatch/combine en FP8 segun la model card; otras cuantizaciones no disponible |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 56,5 GB), con codigo remoto para transformers |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-30B-A3B-Base, un transformer MoE de 48 capas con 128 expertos y 8 activos por token, y de un profesor intermedio (Qwen3-30B-A3B-SFT-EchoMoE-teacher) afinado sobre datos de instrucciones Dolci. Sobre esa base se aplica EchoMoE: cada 4 capas (12 de 48) se mantiene un estado oculto de referencia, y la comunicación entre nodos transmite una diferencia comprimida mediante un código de dispatch de 512 dimensiones y un código de combine de 768 dimensiones. Esto reduce el volumen de datos intercambiados en el all-to-all del paralelismo de expertos.

El entrenamiento es una destilación desde el profesor sobre 4,3 mil millones de tokens, con todos los pesos entrenados. Los datasets citados son allenai/Dolci-Instruct-SFT y allenai/dolma3_dolmino_mix-10B-1025. La evaluación de precisión se realizó con vLLM 0.21 y el plugin de EchoMoE; las pruebas de throughput usan el runtime de paralelismo de expertos del repositorio sobre vLLM 0.29 con DeepEP. La carga en transformers 5.8.1 requiere el código remoto incluido en el repositorio.

## Capacidades

- Generación de texto conversacional en inglés, con plantilla de chat de Qwen3.
- Razonamiento y conocimiento general, con una caída media de 4,0 puntos en el dominio de conocimiento y razonamiento respecto al profesor.
- Matemáticas, con 47,2% de media en los benchmarks del dominio (frente a 50,7% del profesor).
- Generación de código, con 54,4% de media (frente a 59,2% del profesor).
- Seguimiento de instrucciones, con 53,3% de media (frente a 55,6% del profesor).
- Modo no-thinking recomendado para chat (temperature 0,7, top_p 0,8, top_k 20, presence penalty 1,5 en vLLM).
- Soporte de tool calling y capacidades de agente: no disponible en la información proporcionada.
- Capacidades multimodales (visión, audio): no disponibles.

## Casos de uso

- Servicio de inferencia multi-nodo con paralelismo de expertos: el caso principal del modelo. En despliegues con expert parallel 32 sobre 4 nodos de 8 H100, el modelo reduce un 58% el tráfico entre nodos y mejora el throughput hasta un 22,6% en cargas de 4.096 tokens de entrada y 256 de salida.
- Clústeres con red limitada: en enlaces RDMA 2,5 veces más lentos la ganancia sube al 42,1%, y sobre TCP con 8 peticiones por GPU alcanza el 93,2%. Adecuado cuando el cuello de botella es la interconexión y no la GPU.
- Servicio online de prompts reales: la model card reporta 1,48 veces el goodput del modelo sin comprimir, lo que lo hace útil para APIs de chat con alta concurrencia.
- Generación de código asistida en pipelines internos: con un 54,4% de media en benchmarks de código, sirve para autocompletado y revisión donde una pérdida de ~5 puntos respecto al profesor es aceptable a cambio de mayor throughput.
- Tareas de razonamiento y respuesta a preguntas en inglés: con 73,6% de media en conocimiento y razonamiento, válido para asistentes documentales o extracción de información en dominios generales.
- Investigación sobre eficiencia en MoE: el checkpoint y el repositorio permiten reproducir los experimentos de compresión de comunicación y comparar configuraciones (referencia cada 4 capas, códigos de 512/768 dimensiones, FP8 en dispatch/combine).
- Evaluación comparativa de técnicas de compresión: útil como referencia para medir el compromiso precisión-throughput frente al profesor y frente a otras variantes de la colección EchoMoE.

## Benchmarks y rendimiento

Precisión media (%) sobre 18 benchmarks por dominio, con la variación respecto al profesor entre paréntesis:

| Dominio | Profesor | EchoMoE | EchoMoE + FP8 |
|---|---|---|---|
| Conocimiento y razonamiento | 77,6 | 73,6 (−4,0) | 73,5 (−4,1) |
| Matemáticas | 50,7 | 47,2 (−3,5) | 47,5 (−3,2) |
| Código | 59,2 | 54,4 (−4,8) | 54,1 (−5,1) |
| Seguimiento de instrucciones | 55,6 | 53,3 (−2,3) | 51,7 (−3,9) |
| **Media** | **66,9** | **63,1 (−3,8)** | **63,0 (−3,9)** |

Throughput: ganancia frente al profesor sin comprimir, ambos con vLLM 0.29 y DeepEP, expert parallel 32 sobre 4 nodos de 8 H100.

| Carga (entrada → salida) | Red | Peticiones por GPU | Ganancia BF16 | Ganancia FP8 |
|---|---|---|---|---|
| 128 → 1.024 | RDMA | 512 | +10,5% | +11,6% |
| 1.024 → 128 | RDMA | 512 | +26,1% | +14,1% |
| 4.096 → 256 | RDMA | 128 | +22,6% | +12,4% |
| 16.384 → 512 | RDMA | 32 | +15,4% | +8,3% |
| 4.096 → 256 | RDMA, enlace 2× más lento | 128 | +23,0% | +16,0% |
| 4.096 → 256 | RDMA, enlace 2,5× más lento | 128 | +42,1% | +25,6% |
| 4.096 → 256 | TCP | 8 | +93,2% | +115,6% |

En lotes pequeños la ganancia se reduce e incluso se vuelve negativa: −5,8% para 128 → 1.024 tokens con 8 peticiones por GPU. En servicio online de prompts reales el modelo sostiene 1,48 veces el goodput del modelo sin comprimir.

## Requisitos de hardware

- VRAM para inferencia en bf16: los pesos (~28,2 mil millones de parámetros) caben en una GPU de 80 GB, según la model card.
- GPU recomendadas: H100 de 80 GB para despliegue multi-nodo con paralelismo de expertos; una única GPU de 80 GB basta para carga en transformers sin paralelismo.
- GPU de consumo: no disponible en la información proporcionada; el checkpoint publicado es bf16 y no se documentan versiones GGUF ni cuantizadas para GPUs de consumo.
- Despliegue con vLLM: requiere el plugin de EchoMoE (scripts/install.sh vllm, vLLM 0.21). Ejemplo de la model card con --data-parallel-size 8, --enable-expert-parallel, all2all-backend allgather_reducescatter, attention-backend FLASHINFER y --max-num-seqs 256 para limitar el tiempo de arranque por la captura de CUDA graphs.
- Despliegue con transformers: 5.8.1 con trust_remote_code=True; implementación en PyTorch sin paralelismo de expertos.
- Throughput medido: ganancias de hasta +22,6% (RDMA, 4.096 → 256, 128 peticiones por GPU) y +93,2% (TCP, 8 peticiones por GPU) frente al profesor; goodput 1,48× en servicio online.
- Latencia absoluta y throughput en tokens por segundo: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Precisión media (18 benchmarks) | Licencia | Notas |
|---|---|---|---|---|---|
| EchoMoE-Qwen3-30B-A3B-s4-r512-c768 | 28,2 B totales, 8/128 expertos activos | 32.768 | 63,1 | Apache 2.0 | Comunicación comprimida; +22,6% throughput en EP32 |
| Qwen3-30B-A3B-SFT-EchoMoE-teacher | 30 B (A3B) | no disponible | 66,9 | no disponible | Profesor sin comprimir; referencia de calidad |
| Otras variantes de la colección EchoMoE | no disponible | no disponible | no disponible | Apache 2.0 | Distintas configuraciones de referencia y códigos |

## Limitaciones y advertencias

- Pérdida de calidad medible: 3,8 puntos de media en 18 benchmarks frente al profesor, con la mayor caída en código (−4,8) y conocimiento y razonamiento (−4,0).
- Solo inglés: la model card declara únicamente el idioma en; el comportamiento multilingüe no está documentado.
- Contexto limitado a 32.768 tokens, inferior al de algunos modelos actuales de su categoría.
- La ganancia de throughput depende de la topología: en lotes pequeños (8 peticiones por GPU, 128 → 1.024 tokens) el rendimiento empeora un 5,8% frente al profesor.
- Requiere software específico: plugin de EchoMoE sobre vLLM 0.21 o código remoto con transformers 5.8.1; no es un checkpoint estándar cargable sin esas dependencias.
- El arranque en vLLM puede superar el tiempo de espera por defecto (600 s) si no se limita --max-num-seqs a 256.
- Riesgo de alucinación y sesgos: no documentados en la información proporcionada; al ser un ajuste sobre Qwen3 con datos Dolci, hereda los sesgos del modelo base y del corpus de destilación.
- Licencia Apache 2.0 permite uso comercial, pero la procedencia y condiciones del modelo base Qwen3 deben verificarse por separado.
- Solo 347 descargas y 0 likes en el momento de la consulta: ecosistema de validación externa muy reducido.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/McGill-NLP/EchoMoE-Qwen3-30B-A3B-s4-r512-c768
- Profesor: https://huggingface.co/McGill-NLP/Qwen3-30B-A3B-SFT-EchoMoE-teacher
- Modelo base: https://huggingface.co/Qwen/Qwen3-30B-A3B-Base
- Paper: https://arxiv.org/abs/2611.22215
- Código: https://github.com/McGill-NLP/EchoMoE
- Página del proyecto: https://mcgill-nlp.github.io/EchoMoE/
- Colección EchoMoE: https://huggingface.co/collections/McGill-NLP/echomoe-6afcbfa10b38185f87cbd0ac
- Resultados de throughput: https://github.com/McGill-NLP/EchoMoE/blob/main/results/throughput/throughput.csv
