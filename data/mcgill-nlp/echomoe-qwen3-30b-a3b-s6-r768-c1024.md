# McGill-NLP/EchoMoE-Qwen3-30B-A3B-s6-r768-c1024

## Resumen

EchoMoE-Qwen3-30B-A3B-s6-r768-c1024 es un checkpoint de investigación publicado por el grupo McGill-NLP que aplica la técnica EchoMoE sobre Qwen3-30B-A3B. EchoMoE es un método de compresión de activaciones diseñado para reducir el tráfico de red en paralelismo de expertos (expert parallelism): en lugar de enviar cada estado oculto completo entre nodos, se envía una diferencia comprimida respecto a un estado de referencia que se refresca cada pocas capas. El objetivo es hacer viable el despliegue distribuido de modelos MoE grandes sin sacrificar demasiada calidad.

El modelo parte de Qwen3-30B-A3B-Base (48 capas, 128 expertos con 8 activos, hidden size 2.048) y se destila desde un teacher afinado con SFT sobre Dolci. La configuración concreta de este checkpoint usa una referencia cada 6 capas (8 de 48), un código de dispatch de 768 dimensiones y un código de combine de 1.024 dimensiones. Según el autor, reduce un 50 % los bytes enviados entre nodos a cambio de una pérdida media de 3,4 puntos sobre 18 benchmarks respecto al teacher sin comprimir.

Es relevante ahora porque ataca uno de los cuellos de botella prácticos del serving de MoE en clústeres multi-nodo: el coste de comunicación all-to-all. El checkpoint es de tipo investigación, con licencia Apache 2.0 y soporte tanto en vLLM (con plugin) como en transformers mediante código remoto.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE (qwen3_moe) con compresión de activaciones EchoMoE |
| Parámetros totales | 31.903.741.952 (~31,9 B) |
| Parámetros activos | 8 de 128 expertos por capa (dato del modelo base; número exacto de parámetros activos no disponible) |
| Longitud de contexto | 32.768 tokens |
| Tipos de cuantización | bf16 (pesos publicados); el autor reporta además un modo "EchoMoE + FP8" que envía los códigos dispatch/combine en FP8. Otras cuantizaciones (GGUF, AWQ, GPTQ) no disponibles |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 63,8 GB), con código remoto para transformers |
| Capas | 48 |
| Hidden size | 2.048 |
| Referencia EchoMoE | Cada 6 capas (8 de 48) |
| Dimensión código dispatch | 768 |
| Dimensión código combine | 1.024 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3-30B-A3B: un transformer de 48 capas con mezcla de expertos, 128 expertos por capa y 8 activos por token, con hidden size de 2.048. Sobre esta base, EchoMoE introduce un mecanismo de comunicación comprimida para expert parallelism: cada estado oculto se transmite como diferencia respecto a un estado de referencia que se refresca cada 6 capas, codificada en un espacio de 768 dimensiones para el dispatch y 1.024 para el combine. Esto reduce a la mitad los bytes intercambiados entre nodos.

El entrenamiento es por destilación desde el teacher McGill-NLP/Qwen3-30B-A3B-SFT-EchoMoE-teacher (el modelo base afinado con SFT sobre allenai/Dolci-Instruct-SFT), utilizando 4,3 B tokens y entrenando todos los pesos. Los datos de destilación provienen de allenai/Dolci-Instruct-SFT y allenai/dolma3_dolmino_mix-10B-1025. El checkpoint se distribuye en bf16 y está pensado para servirse con vLLM 0.21 más el plugin EchoMoE (con expert parallelism y backend all-to-all allgather_reducescatter) o con transformers 5.8.1 mediante código remoto, en cuyo caso se ejecuta en PyTorch plano sin paralelismo de expertos.

## Capacidades

- Generación de texto conversacional en inglés, con plantilla de chat de Qwen3.
- Razonamiento de conocimiento general y matemáticas (evaluado en los dominios "knowledge and reasoning" y "math" del autor).
- Generación de código (dominio "code" evaluado, con caída de 4,0 puntos respecto al teacher).
- Seguimiento de instrucciones (dominio "instruction following" evaluado).
- Modo no-thinking de Qwen3 recomendado para chat (temperature 0.7, top_p 0.8, top_k 20, presence penalty 1.5 en vLLM).
- Decodificación greedy como valor por defecto del checkpoint para tareas few-shot.
- Soporte de serving distribuido con expert parallelism en vLLM (data-parallel size 8, expert-parallel habilitado).
- No se documenta soporte explícito de tool calling, function calling, agentes multi-paso, visión ni audio en la información disponible.

## Casos de uso

- Serving distribuido de un MoE de ~32 B en clústeres multi-nodo con ancho de banda limitado: el checkpoint reduce un 50 % el tráfico inter-nodo, lo que permite servir el modelo con expert parallelism en 8 GPUs por nodo con menor presión de red que el teacher.
- Investigación en eficiencia de sistemas: sirve como referencia reproducible para medir el compromiso entre compresión de activaciones y calidad, comparando contra el teacher McGill-NLP/Qwen3-30B-A3B-SFT-EchoMoE-teacher.
- Evaluación comparativa de técnicas de compresión de comunicación: al publicarse con métricas por dominio (conocimiento, matemáticas, código, instrucciones), permite contrastar EchoMoE frente a otras estrategias de all-to-all.
- Prototipado de asistentes conversacionales en inglés sobre una sola GPU de 80 GB: los pesos bf16 caben en una GPU y se cargan con transformers y código remoto, sin necesidad de infraestructura distribuida.
- Generación de código asistida en pipelines internos: el modelo mantiene capacidad de código (55,2 % de media en el dominio code) con contexto de 32.768 tokens, suficiente para ficheros y contextos de repositorio moderados.
- Fine-tuning posterior sobre dominios específicos: al estar bajo Apache 2.0 y derivar de Qwen3-30B-A3B-Base, permite adaptaciones con SFT/DPO sobre datos propios, asumiendo la pérdida de calidad de base de 3,4 puntos frente al teacher.
- Benchmarking de decodificación especulativa y backends de atención: el autor documenta el uso de FLASHINFER y CUDA graphs en modo FULL_DECODE_ONLY, lo que lo hace útil para experimentos de latencia y throughput.

## Benchmarks y rendimiento

El autor publica la media (%) sobre 18 benchmarks por dominio, con la variación respecto al teacher entre paréntesis:

| Dominio | Teacher | EchoMoE | EchoMoE + FP8 |
|---|---|---|---|
| Conocimiento y razonamiento | 77,6 | 74,0 (−3,6) | 73,8 (−3,8) |
| Matemáticas | 50,7 | 47,8 (−2,9) | 48,0 (−2,7) |
| Código | 59,2 | 55,2 (−4,0) | 55,3 (−3,9) |
| Seguimiento de instrucciones | 55,6 | 52,3 (−3,3) | 52,0 (−3,6) |
| **Media** | **66,9** | **63,5 (−3,4)** | **63,4 (−3,5)** |

No se han publicado en la información disponible resultados desagregados por benchmark individual (MMLU, HumanEval, GSM8K, etc.), ni cifras de latencia o throughput medidas.

## Requisitos de hardware

- VRAM para inferencia en bf16: aproximadamente 64 GB solo de pesos (31,9 B de parámetros), por lo que encaja en una GPU de 80 GB (A100 80 GB, H100 80 GB) con margen para KV cache moderada.
- Serving distribuido recomendado por el autor: un nodo de 8 GPUs con vLLM 0.21, `--data-parallel-size 8`, `--enable-expert-parallel`, backend all-to-all `allgather_reducescatter` y `--attention-backend FLASHINFER`.
- Configuración de compilación sugerida: `{"cudagraph_mode": "FULL_DECODE_ONLY", "mode": "NONE"}` y `--max-num-seqs 256` para mantener el arranque en pocos minutos (la captura de CUDA graphs crece con las secuencias concurrentes y con el valor por defecto supera el timeout de 600 s del servidor de API).
- En transformers: carga con `trust_remote_code=True`, `dtype=torch.bfloat16` y `device_map="cuda"`; el autor indica que los pesos bf16 caben en una GPU de 80 GB.
- No cabe en GPUs de consumo tipo RTX 4090 (24 GB) en bf16; no se documentan versiones cuantizadas (GGUF, AWQ, GPTQ) para reducir requisitos.
- Opciones de despliegue documentadas: vLLM 0.21 con plugin EchoMoE y transformers 5.8.1 con código remoto. No se mencionan llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Activos | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| EchoMoE-Qwen3-30B-A3B-s6-r768-c1024 | ~31,9 B | 8/128 expertos | 32.768 | Apache 2.0 | Compresión de activaciones; −3,4 pts medios vs teacher; 50 % menos bytes inter-nodo |
| Qwen3-30B-A3B (base) | ~30 B (según nomenclatura) | 8/128 expertos | no disponible en esta ficha | Apache 2.0 | Modelo original de Qwen; sin compresión de activaciones |
| McGill-NLP/Qwen3-30B-A3B-SFT-EchoMoE-teacher | ~31,9 B | 8/128 expertos | no disponible en esta ficha | Apache 2.0 | Teacher sin compresión; media de 66,9 % en los 18 benchmarks del autor |

No se dispone de comparaciones con otros modelos de la misma categoría (por ejemplo, otros MoE de ~30 B) en la información proporcionada.

## Limitaciones y advertencias

- Pérdida de calidad medible: 3,4 puntos de media sobre 18 benchmarks respecto al teacher, con la mayor caída en código (−4,0) y la menor en matemáticas (−2,9).
- Modelo de investigación con 0 descargas y 0 likes en el momento de la ficha; no hay evidencia de uso en producción.
- Solo inglés: la model card declara únicamente `en` en el campo de idiomas.
- Contexto limitado a 32.768 tokens, la mitad o menos que otros modelos actuales de su clase.
- Requiere software específico: vLLM 0.21 con plugin EchoMoE para el modo distribuido, o transformers 5.8.1 con `trust_remote_code=True`; no es un checkpoint estándar cargable en cualquier stack.
- El arranque en vLLM puede superar el timeout por defecto si no se limita `--max-num-seqs`, lo que complica despliegues automáticos.
- Riesgo de alucinación no cuantificado en la información disponible; no se documentan evaluaciones de seguridad, sesgos ni red-teaming.
- El paper asociado está pendiente de arXiv (la model card incluye un TODO para el enlace), por lo que la reproducibilidad metodológica completa no está garantizada aún.
- Licencia Apache 2.0 permite uso comercial, pero al ser un derivado de Qwen3 conviene revisar las condiciones del modelo base y de los datasets de destilación (Dolci, Dolmino).
- No se documentan capacidades de tool calling, agentes, visión ni audio, por lo que no debe asumirse su disponibilidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/McGill-NLP/EchoMoE-Qwen3-30B-A3B-s6-r768-c1024
- Código: https://github.com/McGill-NLP/EchoMoE
- Página del proyecto: https://mcgill-nlp.github.io/EchoMoE/
- Colección EchoMoE: https://huggingface.co/collections/McGill-NLP/echomoe-6afcbfa10b38185f87cbd0ac
- Modelo base: https://huggingface.co/Qwen/Qwen3-30B-A3B-Base
- Teacher: https://huggingface.co/McGill-NLP/Qwen3-30B-A3B-SFT-EchoMoE-teacher
- Dataset de SFT: https://huggingface.co/datasets/allenai/Dolci-Instruct-SFT
- Dataset de destilación: https://huggingface.co/datasets/allenai/dolma3_dolmino_mix-10B-1025
- Paper: no disponible (pendiente de arXiv según la model card)
