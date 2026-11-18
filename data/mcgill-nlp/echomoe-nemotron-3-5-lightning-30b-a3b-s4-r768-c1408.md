# McGill-NLP/EchoMoE-Nemotron-3.5-Lightning-30B-A3B-s4-r768-c1408

## Resumen

EchoMoE-Nemotron-3.5-Lightning-30B-A3B-s4-r768-c1408 es un checkpoint de investigación desarrollado por el grupo McGill-NLP que aplica la técnica EchoMoE sobre el modelo NVIDIA Nemotron-3.5-Lightning-30B-A3B. El objetivo no es mejorar la calidad del modelo base, sino reducir el coste de comunicación en inferencia distribuida con paralelismo de expertos (expert parallelism). En lugar de transmitir cada estado oculto completo entre nodos, el modelo envía una diferencia comprimida respecto a un estado de referencia que se refresca cada pocos niveles.

La arquitectura subyacente es híbrida: 52 capas que combinan Mamba-2, atención y MoE, con 128 expertos enrutados (6 activos más 1 compartido) y un tamaño oculto de 2.688. El checkpoint tiene 27.807.814.592 parámetros totales en safetensors y se distribuye en bf16. Esta variante concreta usa una referencia cada 4 capas MoE (6 de 23), un código de dispatch de 768 dimensiones y un código de combine de 1.408 dimensiones.

Su relevancia es fundamentalmente sistémica: según el autor, reduce un 48% los bytes intercambiados entre nodos a cambio de una pérdida media de 4,5 puntos sobre el profesor en 18 benchmarks. Es un artefacto para estudiar el equilibrio entre eficiencia de red y fidelidad de modelo, no un modelo de producción generalista.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Nemotron H híbrida (Mamba-2 + atención + MoE), con retrofit EchoMoE |
| Parametros totales | 27.807.814.592 |
| Parametros activos | 6 expertos enrutados + 1 compartido por token (sobre 128 enrutados); total activo no disponible |
| Longitud de contexto | 32.768 tokens (evaluado) |
| Tipos de cuantizacion | No disponible (checkpoint publicado en bf16) |
| Idiomas soportados | Inglés (en) |
| Licencia | OpenMDW 1.1 (hereda la del modelo base de NVIDIA) |
| Formato de pesos | safetensors, con código remoto para transformers |
| Capas totales | 52 |
| Tamaño oculto | 2.688 |
| Configuración EchoMoE | Referencia cada 4 capas MoE (6 de 23), dispatch 768 dim, combine 1.408 dim |
| Precisión | bf16 |

## Arquitectura y entrenamiento

El modelo parte de NVIDIA-Nemotron-3.5-Lightning-30B-A3B-Base-BF16 y se entrena por destilación desde un profesor (Nemotron-3.5-Lightning-30B-A3B-SFT-EchoMoE-teacher), que es el modelo base afinado sobre datos de instrucción Dolci. La destilación se realiza sobre 4.300 millones de tokens con todos los pesos entrenados. Los datasets declarados son allenai/Dolci-Instruct-SFT y allenai/dolma3_dolmino_mix-10B-1025.

La innovación técnica es EchoMoE: en lugar de enviar el estado oculto completo en cada all-to-all de expertos, se envía la diferencia respecto a un estado de referencia que se refresca cada 4 capas MoE. Esa diferencia se codifica en un espacio de 768 dimensiones para el dispatch y de 1.408 para el combine. El resultado es una reducción del 48% en bytes inter-nodo. El modelo requiere el plugin EchoMoE para vLLM 0.21 o cargarse mediante código remoto en transformers 5.8.1; en transformers funciona en PyTorch plano sin paralelismo de expertos.

## Capacidades

- Generación de texto conversacional en inglés, con plantilla de chat integrada.
- Razonamiento de conocimiento general y matemáticas, con degradación medible respecto al profesor.
- Generación de código, el dominio donde la pérdida es menor (−1,6 puntos).
- Seguimiento de instrucciones, con pérdida mínima (−0,9 puntos).
- Soporte de paralelismo de expertos mediante plugin de vLLM, con backend all-to-all allgather_reducescatter.
- No se documenta soporte de tool calling, function calling, agentes, visión ni audio.
- Multilingüismo limitado al inglés.

## Casos de uso

- Investigación en sistemas distribuidos de inferencia: medir el impacto real de comprimir activaciones en all-to-all de expertos sobre un clúster de 8 GPUs, usando el checkpoint como banco de pruebas reproducible.
- Estudio de métodos de destilación con restricciones de comunicación: comparar la curva pérdida-calidad frente al profesor en 18 benchmarks por dominio.
- Despliegue experimental con paralelismo de expertos en vLLM: servir el modelo con `--enable-expert-parallel` y `--all2all-backend allgather_reducescatter` para evaluar throughput multi-nodo.
- Generación de código en entornos con ancho de banda limitado: es el dominio con menor degradación (−1,6 puntos), adecuado para prototipos donde la red entre nodos es el cuello de botella.
- Evaluación de instruction following en pipelines de chat: con temperatura 0,7, top_p 0,8, top_k 20 y penalización de presencia 1,5, útil para tareas conversacionales de formato estricto.
- Referencia académica para ablaciones: variantes del mismo autor con distinto espaciado de referencia y dimensión de código permiten aislar el efecto de cada hiperparámetro.
- Prototipado en una sola GPU de 80 GB: los pesos bf16 caben en una A100/H100 de 80 GB vía transformers, sin necesidad de clúster.

## Benchmarks y rendimiento

Promedio (%) sobre 18 benchmarks por dominio, con la variación respecto al profesor entre paréntesis.

| Dominio | Profesor | EchoMoE |
|---|---|---|
| Conocimiento y razonamiento | 71,6 | 67,9 (−3,7) |
| Matemáticas | 50,5 | 41,7 (−8,8) |
| Código | 53,0 | 51,4 (−1,6) |
| Seguimiento de instrucciones | 55,0 | 54,1 (−0,9) |
| **Media** | **62,8** | **58,3 (−4,5)** |

No se han publicado resultados por benchmark individual (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM para inferencia en bf16: aproximadamente 55,6 GB de pesos, más overhead de activaciones y caché KV; cabe en una GPU de 80 GB.
- GPU recomendadas: A100 80 GB o H100 80 GB para carga en una sola GPU vía transformers; clúster de 8 GPUs por nodo para vLLM con paralelismo de expertos.
- GPU de consumo: no cabe en RTX 4090 (24 GB) en bf16; no se documentan cuantizaciones GGUF ni versiones de 4/8 bits.
- Despliegue: vLLM 0.21 con plugin EchoMoE (recomendado para producción distribuida) o transformers 5.8.1 con `trust_remote_code=True` (una GPU, sin paralelismo de expertos).
- Configuración vLLM de referencia: `--data-parallel-size 8 --enable-expert-parallel --all2all-backend allgather_reducescatter --attention-backend FLASHINFER --max-model-len 32768 --max-num-seqs 256`.
- Nota de arranque: `--max-num-seqs 256` es necesario para que la captura de CUDA graphs no exceda el timeout de 600 segundos del servidor de API.
- Latencia y throughput: no disponibles; el autor reporta throughput multi-nodo en el README del repositorio, pero no se incluyen cifras en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Calidad media (18 benchmarks) | Licencia | Notas |
|---|---|---|---|---|---|
| EchoMoE-Nemotron-3.5-Lightning-30B-A3B (este) | 27,8 B totales, 6+1 expertos activos | 32.768 | 58,3 | OpenMDW 1.1 | −48% bytes inter-nodo |
| Nemotron-3.5-Lightning-30B-A3B-SFT-EchoMoE-teacher | 27,8 B (estimado, mismo base) | 32.768 | 62,8 | OpenMDW 1.1 | Profesor, sin compresión |
| Nemotron-3.5-Lightning-30B-A3B-Base-BF16 | 27,8 B (estimado) | No disponible | No disponible | OpenMDW 1.1 | Base sin SFT |
| Otras variantes EchoMoE de la colección | No disponible | No disponible | No disponible | OpenMDW 1.1 | Distintos s4/r/c |

No se dispone de comparación con modelos de otros autores en la información proporcionada.

## Limitaciones y advertencias

- Degradación de calidad no trivial: −4,5 puntos de media y −8,8 en matemáticas respecto al profesor; inaceptable para tareas de razonamiento numérico exigente.
- Solo inglés: el modelo no declara soporte multilingüe.
- Sin datos de sesgo ni evaluación de alucinación publicados; al ser un derivado destilado de Nemotron, hereda los sesgos del corpus Dolci y dolmino.
- Licencia OpenMDW 1.1: es una licencia "other" que conserva el aviso de copyright de NVIDIA; revisar términos antes de uso comercial.
- Dependencia de código remoto: requiere `trust_remote_code=True` en transformers o el plugin EchoMoE en vLLM; no es un checkpoint estándar de transformers.
- Sin cuantizaciones publicadas: no hay GGUF, AWQ ni GPTQ, lo que limita el despliegue en hardware de consumo.
- Configuración de arranque delicada en vLLM: la captura de CUDA graphs escala con secuencias concurrentes y puede agotar el timeout por defecto.
- Cero tracción comunitaria: 0 descargas y 0 likes en el momento de la consulta; sin validación externa.
- Sin paper publicado: el arXiv está pendiente (TODO en la model card); la reproducibilidad depende del repositorio de código.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/McGill-NLP/EchoMoE-Nemotron-3.5-Lightning-30B-A3B-s4-r768-c1408
- Modelo profesor: https://huggingface.co/McGill-NLP/Nemotron-3.5-Lightning-30B-A3B-SFT-EchoMoE-teacher
- Modelo base NVIDIA: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-Base-BF16
- Código: https://github.com/McGill-NLP/EchoMoE
- Página del proyecto: https://mcgill-nlp.github.io/EchoMoE/
- Colección EchoMoE: https://huggingface.co/collections/McGill-NLP/echomoe-6afcbfa10b38185f87cbd0ac
- Paper: no disponible (pendiente de arXiv)
