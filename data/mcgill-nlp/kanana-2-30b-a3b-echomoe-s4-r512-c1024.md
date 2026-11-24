# McGill-NLP/Kanana-2-30B-A3B-EchoMoE-s4-r512-c1024

## Resumen

Kanana-2-30B-A3B-EchoMoE-s4-r512-c1024 es un checkpoint de investigación publicado por el laboratorio McGill-NLP que aplica la técnica EchoMoE sobre el modelo surcoreano Kanana-2-30B-A3B. EchoMoE no es una técnica de entrenamiento orientada a mejorar la calidad, sino una modificación arquitectónica cuyo objetivo es reducir el tráfico de red en inferencia distribuida con paralelismo de expertos (expert parallelism). En lugar de transmitir el estado oculto completo entre nodos, el modelo envía una diferencia comprimida respecto a un estado de referencia que se refresca cada pocas capas.

El modelo subyacente es un transformer de tipo mixture-of-experts con arquitectura deepseek_v3, 48 capas, 128 expertos enrutados (6 activos) más 2 expertos compartidos y un tamaño oculto de 2.048. El total de parámetros asciende a 29.598.193.536 (unos 29,6 mil millones), con aproximadamente 3 mil millones activos por token, de ahí la denominación A3B. La ventana de contexto evaluada es de 32.768 tokens en precisión bf16.

Su relevancia es fundamentalmente de sistemas: demuestra que se puede reducir un 50 % el volumen de bytes intercambiados entre nodos y mejorar el throughput un 14,6 % en expert parallel 32 sobre 4 nodos, a cambio de una pérdida media de 2,4 puntos en 18 benchmarks respecto al modelo profesor sin comprimir. Es, por tanto, una pieza pensada para equipos que sirven MoE de gran tamaño en clústeres multi-nodo y quieren optimizar el cuello de botella de comunicación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE tipo deepseek_v3 con retrofit EchoMoE (compresión de activaciones en dispatch/combine) |
| Parametros totales | 29.598.193.536 (~29,6 B) |
| Parametros activos | ~3 B (6 de 128 expertos enrutados + 2 compartidos por token) |
| Longitud de contexto | 32.768 tokens (evaluado) |
| Tipos de cuantizacion | no disponible (evaluado en bf16) |
| Idiomas soportados | en |
| Licencia | kanana-license (license: other) |
| Formato de pesos | safetensors (repo de 59,2 GB) |

## Arquitectura y entrenamiento

El modelo parte de kanana-2-30b-a3b-base-2601, un MoE de 48 capas con 128 expertos enrutados (6 activos por token), 2 expertos compartidos y dimensión oculta de 2.048. Sobre esa base, el profesor (Kanana-2-30B-A3B-SFT-EchoMoE-teacher) se obtuvo mediante fine-tuning supervisado con datos de instrucciones Dolci (allenai/Dolci-Instruct-SFT). El checkpoint aquí descrito se destila del profesor sobre 4,3 mil millones de tokens, entrenando todos los pesos, e incorpora la modificación EchoMoE: una referencia cada 4 capas MoE (12 de las 47), un código de dispatch de 512 dimensiones y un código de combine de 1.024 dimensiones.

La innovación central es la compresión de la comunicación entre expertos. Bajo paralelismo de expertos, cada capa MoE requiere un all-to-all que mueve los estados ocultos entre GPUs; EchoMoE sustituye el envío del estado completo por el envío de una diferencia respecto a un estado de referencia periódicamente refrescado, codificada en las dimensiones indicadas. Esto reduce a la mitad los bytes inter-nodo. La evaluación de precisión se realizó con vLLM 0.21 y el plugin EchoMoE; las medidas de throughput, con el runtime de paralelismo de expertos del repositorio sobre vLLM 0.29 y DeepEP. La carga en transformers 5.8.1 requiere código remoto del repositorio.

## Capacidades

- Generación de texto conversacional en inglés, con plantilla de chat (`apply_chat_template`).
- Razonamiento y conocimiento general: puntuación media de 66,5 en el bloque de conocimiento y razonamiento de los 18 benchmarks.
- Matemáticas: 37,9 de media en las tareas de matemáticas evaluadas.
- Generación de código: 49,5 de media en las tareas de código.
- Seguimiento de instrucciones: 52,5 de media, la dimensión menos degradada respecto al profesor (−0,5).
- Soporte de decodificación greedy para tareas few-shot y parámetros de muestreo recomendados para chat (temperature 0,7, top_p 0,8, top_k 20, presence penalty 1,5 en vLLM).
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión ni audio en la información disponible.

## Casos de uso

- Servicio de un MoE de ~30 B en clúster multi-nodo con paralelismo de expertos: el caso de uso principal. En despliegues con expert parallel 32 sobre 4 nodos de 8 H100, el modelo reduce un 50 % los bytes inter-nodo y mejora el throughput entre un 10,3 % y un 16,0 % según la carga, lo que lo hace adecuado para maximizar peticiones por GPU en infraestructura ya existente.
- Investigación en sistemas distribuidos de inferencia: sirve como referencia reproducible para medir el impacto de la compresión de activaciones en all-to-all, con CSV de resultados publicado en el repositorio.
- Car-gas de prefill largas (4.096 → 256 tokens): con 128 peticiones por GPU y RDMA, es el escenario con mayor ganancia medida (+14,6 % en BF16), útil para pipelines de resumen o clasificación de documentos largos.
- Generación con contexto largo (16.384 → 512 tokens): mantiene una ganancia del +10,7 % en BF16, adecuado para asistentes que procesan documentos extensos dentro de la ventana de 32.768 tokens.
- Evaluación comparativa de técnicas de compresión: al publicarse junto al profesor sin comprimir, permite aislar el coste en calidad (−2,4 puntos de media) frente al beneficio en throughput.
- Despliegue en un solo nodo de 8 GPU para pruebas: la configuración vLLM documentada (`--data-parallel-size 8 --enable-expert-parallel`) permite servir el checkpoint en una sola máquina antes de escalar a multi-nodo.
- Fine-tuning o destilación posterior sobre dominio propio: al entrenarse todos los pesos en la destilación, el checkpoint es un punto de partida plausible para adaptaciones, siempre dentro de los términos de la kanana-license.

## Benchmarks y rendimiento

Precisión media (%) sobre 18 benchmarks, con la variación respecto al profesor entre paréntesis:

| Dominio | Profesor | EchoMoE |
|---|---|---|
| Conocimiento y razonamiento | 68,2 | 66,5 (−1,7) |
| Matemáticas | 41,5 | 37,9 (−3,6) |
| Código | 53,4 | 49,5 (−3,9) |
| Seguimiento de instrucciones | 53,0 | 52,5 (−0,5) |
| **Media** | **58,5** | **56,1 (−2,4)** |

Throughput: ganancia sobre el profesor sin comprimir, ambos servidos con vLLM 0.29 y DeepEP, expert parallel 32 sobre 4 nodos de 8 H100, asignación de expertos balanceada.

| Carga (entrada → salida) | Red | Peticiones por GPU | Ganancia BF16 | Ganancia FP8 |
|---|---|---|---|---|
| 128 → 1.024 | RDMA | 512 | +12,5 % | +10,8 % |
| 1.024 → 128 | RDMA | 512 | +14,9 % | +16,0 % |
| 4.096 → 256 | RDMA | 128 | +14,6 % | +14,1 % |
| 16.384 → 512 | RDMA | 32 | +10,7 % | +10,3 % |

No se han publicado resultados por benchmark individual (MMLU, HumanEval, GSM8K) en la información disponible; solo se ofrecen medias agregadas por dominio.

## Requisitos de hardware

- VRAM en bf16: los pesos completos (~29,6 B de parámetros) caben en una sola GPU de 80 GB según la model card; el repo ocupa 59,2 GB en safetensors.
- Inferencia multi-nodo: configuración de referencia con expert parallel 32 sobre 4 nodos de 8 H100 (32 GPU en total), backend all-to-all `allgather_reducescatter` y atención `FLASH_ATTN_MLA`.
- Un solo nodo: `vllm serve` con `--data-parallel-size 8 --enable-expert-parallel` sobre 8 GPU.
- GPU consumer: no se documenta soporte en GPU de consumo; el tamaño en bf16 y la dependencia de DeepEP y del runtime de paralelismo de expertos lo hacen inviable en RTX 4090 sin cuantización, y no se publican pesos cuantizados.
- Opciones de despliegue: vLLM 0.21 con el plugin EchoMoE (precisión) y vLLM 0.29 con DeepEP (throughput); transformers 5.8.1 con código remoto para carga en un solo dispositivo. No se mencionan llama.cpp, Ollama ni TGI.
- Ajuste de arranque: `--max-num-seqs 256` y `--max-model-len 32768`; la captura de CUDA graphs crece con el número de secuencias concurrentes y con el valor por defecto supera el tiempo de espera de 600 s del servidor de API.
- Throughput: ganancias relativas del +10,3 % a +16,0 % frente al profesor; no se publican valores absolutos de tokens por segundo ni latencias.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Kanana-2-30B-A3B-EchoMoE-s4-r512-c1024 | ~29,6 B totales / ~3 B activos | 32.768 | MoE deepseek_v3 + compresión de activaciones | kanana-license | Hugging Face (389 descargas) |
| Kanana-2-30B-A3B-SFT-EchoMoE-teacher | ~29,6 B totales / ~3 B activos | 32.768 | MoE sin compresión (profesor) | no disponible en la información | Hugging Face |
| kanana-2-30b-a3b-base-2601 | ~29,6 B totales / ~3 B activos | no disponible | MoE base sin fine-tuning | no disponible en la información | Hugging Face (kakaocorp) |

La comparación relevante es contra el propio profesor: mismo tamaño y contexto, 2,4 puntos más de media en 18 benchmarks pero sin la reducción del 50 % en bytes inter-nodo ni la mejora de throughput. No se dispone de datos de benchmarks de otros MoE de tamaño comparable en la información proporcionada.

## Limitaciones y advertencias

- Pérdida de calidad medible: −2,4 puntos de media, con las mayores caídas en código (−3,9) y matemáticas (−3,6); no es un modelo recomendable cuando la precisión en esas áreas es crítica.
- Solo inglés: la model card declara únicamente `en`; no hay evidencia de calidad en castellano.
- Licencia restrictiva: kanana-license con `license: other`; es imprescindible revisar el archivo LICENSE del repositorio antes de cualquier uso comercial.
- Naturaleza de investigación: 389 descargas y 0 likes en el momento de la consulta; no es un checkpoint con validación de producción fuera del entorno descrito.
- Dependencia de software específico: requiere el plugin EchoMoE y, para throughput, DeepEP y el runtime del repositorio; no funciona con un stack vLLM estándar sin el plugin.
- Configuración de arranque delicada: el valor por defecto de secuencias concurrentes provoca tiempos de captura de CUDA graphs que superan el timeout del servidor de API.
- Riesgo de alucinación y sesgos: no se documentan análisis específicos de sesgo ni tasas de alucinación en la información disponible.
- Sin datos de cuantización: no se publican pesos GGUF, AWQ ni GPTQ, lo que limita el despliegue fuera de bf16.
- Los resultados de throughput dependen de la topología de red (RDMA), del balanceo de expertos y del número de nodos; no son extrapolables a otras configuraciones.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/McGill-NLP/Kanana-2-30B-A3B-EchoMoE-s4-r512-c1024
- Modelo profesor: https://huggingface.co/McGill-NLP/Kanana-2-30B-A3B-SFT-EchoMoE-teacher
- Modelo base: https://huggingface.co/kakaocorp/kanana-2-30b-a3b-base-2601
- Paper: https://arxiv.org/abs/2611.22215
- Código: https://github.com/McGill-NLP/EchoMoE
- Página del proyecto: https://mcgill-nlp.github.io/EchoMoE/
- Colección EchoMoE: https://huggingface.co/collections/McGill-NLP/echomoe-6afcbfa10b38185f87cbd0ac
- Resultados de throughput (CSV): https://github.com/McGill-NLP/EchoMoE/blob/main/results/throughput/throughput.csv
