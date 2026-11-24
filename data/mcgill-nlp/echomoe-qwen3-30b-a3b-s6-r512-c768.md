# McGill-NLP/EchoMoE-Qwen3-30B-A3B-s6-r512-c768

## Resumen

EchoMoE-Qwen3-30B-A3B-s6-r512-c768 es un checkpoint de investigación desarrollado por el grupo McGill-NLP que aplica la técnica EchoMoE sobre Qwen3-30B-A3B, un modelo de mezcla de expertos (MoE) de 48 capas, 128 expertos con 8 activos y tamaño oculto de 2.048. El objetivo no es mejorar la calidad del modelo base, sino reducir el tráfico de red en inferencia con paralelismo de expertos: en lugar de transmitir cada estado oculto completo entre nodos, el modelo envía una diferencia comprimida respecto a un estado de referencia que se refresca cada pocas capas.

La configuración concreta de este checkpoint usa una referencia cada 6 capas (8 de 48), un código de dispatch de 512 dimensiones y un código de combine de 768 dimensiones. Según la model card, esto reduce un 62% los bytes enviados entre nodos y mejora el throughput un 27,6% con paralelismo de expertos 32 sobre 4 nodos, a cambio de una pérdida media de 5,4 puntos sobre 18 benchmarks respecto al profesor sin comprimir.

Es relevante porque aborda un cuello de botella real en el despliegue distribuido de modelos MoE de gran tamaño: la comunicación all-to-all entre GPUs. El modelo se distribuye con licencia Apache 2.0, pesos en safetensors y bf16, contexto de 32.768 tokens, y requiere código remoto o el plugin propio del repositorio para cargarse en transformers o vLLM.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE (qwen3_moe) con retrofit EchoMoE |
| Parámetros totales | 28.636.379.136 (28,6B) |
| Parámetros activos | 8 de 128 expertos por capa (modelo base A3B) |
| Longitud de contexto | 32.768 tokens |
| Tipos de cuantización | bf16 (pesos publicados); FP8 solo para dispatch/combine en la variante evaluada |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 57,3 GB), con código remoto para transformers |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-30B-A3B-Base (48 capas, 128 expertos, 8 activos, hidden size 2.048) y se destila desde un profesor: McGill-NLP/Qwen3-30B-A3B-SFT-EchoMoE-teacher, que es el base ajustado con datos de instrucción Dolci. Sobre esa base se aplica el retrofit EchoMoE, que introduce estados de referencia cada 6 capas y dos códigos comprimidos (dispatch de 512 dimensiones y combine de 768 dimensiones) para sustituir el envío de estados ocultos completos en la comunicación entre expertos.

El entrenamiento se realizó por destilación desde el profesor sobre 4,3B tokens, con todos los pesos entrenados, usando los datasets allenai/Dolci-Instruct-SFT y allenai/dolma3_dolmino_mix-10B-1025. La innovación técnica central es la compresión de la comunicación inter-nodo: el modelo envía diferencias respecto a una referencia refrescada periódicamente, lo que reduce el volumen de bytes en el all-to-all de expert parallelism. La precisión de los resultados se midió con vLLM 0.21 más el plugin EchoMoE; el throughput con el runtime de paralelismo de expertos del repositorio sobre vLLM 0.29 con DeepEP; y la carga en transformers 5.8.1 se hace mediante código remoto del repositorio.

## Capacidades

- Generación de texto conversacional en inglés, con plantilla de chat compatible con Qwen3.
- Razonamiento y conocimiento general, con rendimiento medido en 18 benchmarks agrupados en conocimiento/razonamiento, matemáticas, código e instrucciones.
- Matemáticas: resolución de problemas aritméticos y de razonamiento numérico (dominio Math evaluado).
- Generación de código (dominio Code evaluado).
- Seguimiento de instrucciones (dominio Instruction following evaluado).
- Modo de generación no-thinking recomendado para chat (temperatura 0,7, top_p 0,8, top_k 20, presence penalty 1,5 en vLLM); decodificación greedy para tareas few-shot.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión, audio ni capacidades multimodales en la información disponible.

## Casos de uso

- Investigación en sistemas distribuidos de inferencia: el modelo sirve para medir el impacto de la compresión de comunicación en all-to-all con paralelismo de expertos, comparando throughput y precisión frente al profesor sin comprimir en configuraciones de 4 nodos y 8 H100 por nodo.
- Despliegue de MoE de 30B en clústeres con enlaces de red lentos: con enlaces RDMA 2,5 veces más lentos, el modelo logra un 50,4% más de throughput en BF16 (4.096 → 256 tokens), lo que lo hace adecuado para infraestructuras donde la red es el cuello de botella.
- Servicio de chat en inglés con contexto de 32.768 tokens: la ventana permite conversaciones multi-turno largas y documentos extensos, con decodificación en bf16 sobre una sola GPU de 80 GB mediante transformers.
- Evaluación comparativa de técnicas de compresión: útil como referencia para estudiar el compromiso entre bytes transmitidos (62% menos) y degradación de precisión (5,4 puntos medios en 18 benchmarks).
- Generación de código y matemáticas en pipelines internos: los dominios Code (52,4) y Math (46,4) están medidos, aunque con caídas de 6,8 y 4,3 puntos respecto al profesor, por lo que encaja en entornos donde el throughput prima sobre la calidad máxima.
- Pruebas de integración con vLLM y DeepEP: el checkpoint incluye instrucciones de despliegue con `--enable-expert-parallel`, `--all2all-backend allgather_reducescatter` y `--max-num-seqs 256`, útil para validar stacks de serving distribuido.
- Investigación académica reproducible: al estar en Apache 2.0 y con código y resultados de throughput publicados en el repositorio, permite replicar experimentos de paralelismo de expertos.

## Benchmarks y rendimiento

Precisión media (%) sobre 18 benchmarks por dominio, con la variación respecto al profesor entre paréntesis:

| Dominio | Profesor | EchoMoE | EchoMoE + FP8 |
|---|---|---|---|
| Conocimiento y razonamiento | 77,6 | 71,7 (−5,9) | 71,7 (−5,9) |
| Matemáticas | 50,7 | 46,4 (−4,3) | 46,1 (−4,6) |
| Código | 59,2 | 52,4 (−6,8) | 52,7 (−6,5) |
| Seguimiento de instrucciones | 55,6 | 51,9 (−3,7) | 51,7 (−3,9) |
| **Media** | **66,9** | **61,5 (−5,4)** | **61,4 (−5,5)** |

Throughput (ganancia sobre el profesor sin comprimir, vLLM 0.29 + DeepEP, expert parallel 32 sobre 4 nodos de 8 H100, asignación balanceada de expertos):

| Carga (tokens entrada → salida) | Red | Peticiones por GPU | Ganancia BF16 | Ganancia FP8 |
|---|---|---|---|---|
| 128 → 1.024 | RDMA | 512 | +14,1% | +16,5% |
| 1.024 → 128 | RDMA | 512 | +32,3% | +20,5% |
| 4.096 → 256 | RDMA | 128 | **+27,6%** | +16,5% |
| 16.384 → 512 | RDMA | 32 | +18,6% | +11,0% |
| 4.096 → 256 | RDMA, enlace 2× más lento | 128 | +28,4% | +19,9% |
| 4.096 → 256 | RDMA, enlace 2,5× más lento | 128 | +50,4% | +29,2% |
| 4.096 → 256 | TCP | 8 | +96,7% | +126,3% |

La ganancia se reduce con lotes pequeños, hasta +5,9% para 4.096 → 256 tokens con 8 peticiones por GPU. Los datos completos de todos los lotes medidos están en `results/throughput/throughput.csv` del repositorio de código.

## Requisitos de hardware

- VRAM para inferencia en bf16: los pesos (28,6B parámetros) caben en una sola GPU de 80 GB según la model card.
- GPU recomendadas: H100 de 80 GB para el despliegue multi-nodo con paralelismo de expertos (4 nodos de 8 H100 en las mediciones); una única GPU de 80 GB basta para transformers en bf16.
- GPU de consumo: no se documenta compatibilidad con GPUs de consumo (p. ej. RTX 4090 de 24 GB); el checkpoint se publica en bf16 y no se listan cuantizaciones GGUF.
- Opciones de despliegue: vLLM 0.21 con el plugin EchoMoE (`scripts/install.sh vllm`), runtime de paralelismo de expertos del repositorio sobre vLLM 0.29 con DeepEP, y transformers 5.8.1 con código remoto (`trust_remote_code=True`).
- Configuración vLLM recomendada: `--data-parallel-size 8 --enable-expert-parallel --all2all-backend allgather_reducescatter --attention-backend FLASHINFER --compilation-config '{"cudagraph_mode": "FULL_DECODE_ONLY", "mode": "NONE"}' --max-num-seqs 256`; este último valor mantiene el arranque en pocos minutos, ya que la captura de CUDA graphs crece con las secuencias concurrentes.
- Throughput: ganancia de hasta +27,6% en BF16 y +96,7% en TCP respecto al profesor, según la tabla anterior; no se publican valores absolutos de latencia o tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Precisión media (18 benchmarks) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| EchoMoE-Qwen3-30B-A3B-s6-r512-c768 | 28,6B totales, 8 activos | 32.768 | 61,5 | Apache 2.0 | Hugging Face, código remoto y plugin vLLM |
| Qwen3-30B-A3B-SFT-EchoMoE-teacher (profesor) | 28,6B totales, 8 activos | 32.768 | 66,9 | no disponible en la información | Hugging Face (McGill-NLP) |
| Qwen3-30B-A3B-Base (modelo base) | 30B totales, 3B activos | no disponible en la información | no disponible | no disponible en la información | Hugging Face (Qwen) |

La comparación con el profesor es la más directa: mismo tamaño y contexto, pero el checkpoint EchoMoE sacrifica 5,4 puntos medios de precisión a cambio de un 62% menos de bytes entre nodos y hasta +27,6% de throughput en la configuración medida. No se dispone de datos de benchmarks de otros modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- Degradación de precisión: la media cae 5,4 puntos respecto al profesor, con la mayor pérdida en código (−6,8) y conocimiento/razonamiento (−5,9).
- Solo inglés: el campo `language` de la model card indica únicamente `en`; no se documenta soporte multilingüe.
- Riesgo de alucinación: no se documenta ninguna mitigación específica más allá del ajuste de instrucciones del profesor; el modelo es un checkpoint de investigación, no un modelo de producción pulido.
- Sesgos: no se publica información sobre sesgos conocidos ni sobre la composición detallada de los datos de destilación.
- Licencia Apache 2.0: permite uso comercial, pero el modelo base Qwen3-30B-A3B y el profesor tienen sus propias condiciones que conviene verificar; la información disponible no detalla restricciones adicionales.
- Dependencia de software específico: la carga requiere código remoto en transformers o el plugin EchoMoE en vLLM; el rendimiento de throughput depende del runtime de paralelismo de expertos del repositorio y de DeepEP.
- Ajuste de rendimiento: las ganancias de throughput se reducen con lotes pequeños (hasta +5,9% con 8 peticiones por GPU) y dependen del backend de red (RDMA frente a TCP).
- Arranque en vLLM: con la configuración por defecto, la captura de CUDA graphs puede superar el tiempo de espera de 600 segundos del servidor de API; se recomienda `--max-num-seqs 256`.
- No se documentan capacidades de tool calling, agentes, visión ni audio, por lo que no deben asumirse en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/McGill-NLP/EchoMoE-Qwen3-30B-A3B-s6-r512-c768
- Profesor: https://huggingface.co/McGill-NLP/Qwen3-30B-A3B-SFT-EchoMoE-teacher
- Modelo base: https://huggingface.co/Qwen/Qwen3-30B-A3B-Base
- Paper: https://arxiv.org/abs/2611.22215
- Código: https://github.com/McGill-NLP/EchoMoE
- Página del proyecto: https://mcgill-nlp.github.io/EchoMoE/
- Colección EchoMoE: https://huggingface.co/collections/McGill-NLP/echomoe-6afcbfa10b38185f87cbd0ac
- Resultados de throughput: https://github.com/McGill-NLP/EchoMoE/blob/main/results/throughput/throughput.csv
- Dataset de instrucciones: https://huggingface.co/datasets/allenai/Dolci-Instruct-SFT
- Dataset de mezcla Dolmino: https://huggingface.co/datasets/allenai/dolma3_dolmino_mix-10B-1025
