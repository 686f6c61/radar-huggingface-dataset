# McGill-NLP/EchoMoE-Nemotron-3.5-Lightning-30B-A3B-s4-r768-c1408

## Resumen

EchoMoE-Nemotron-3.5-Lightning-30B-A3B-s4-r768-c1408 es un checkpoint experimental desarrollado por el grupo McGill-NLP que aplica la técnica EchoMoE sobre el modelo NVIDIA Nemotron-3.5-Lightning-30B-A3B. El objetivo no es mejorar la calidad del modelo base, sino reducir el coste de comunicación en inferencia distribuida con paralelismo de expertos (expert parallelism): en lugar de transmitir cada estado oculto completo entre nodos, el modelo envía una diferencia comprimida respecto a un estado de referencia que se refresca cada pocos bloques. En esta configuración concreta, la referencia se actualiza cada 4 capas MoE (6 de 23), con un código de dispatch de 768 dimensiones y un código de combine de 1.408 dimensiones.

El modelo parte de una arquitectura híbrida Nemotron-H de 52 capas que combina capas Mamba-2, atención y MoE, con 128 expertos enrutados (6 activos más 1 compartido) y un tamaño oculto de 2.688. El checkpoint final tiene 27.807.814.592 parámetros totales y se ha obtenido por destilación desde un teacher afinado con SFT sobre Dolci, entrenando todos los pesos sobre 4.300 millones de tokens.

Su relevancia es fundamentalmente de investigación en sistemas: demuestra que es posible reducir un 48 % el tráfico entre nodos con una pérdida media de 4,5 puntos sobre 18 benchmarks respecto al teacher sin comprimir. No es un modelo pensado para sustituir al original en producción de alta calidad, sino para escenarios donde el cuello de botella es la interconexión de red en clústeres multi-GPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Nemotron-H híbrida: 52 capas Mamba-2, atención y MoE; 128 expertos enrutados con 6 activos y 1 compartido; hidden size 2.688 |
| Parametros totales | 27.807.814.592 (≈27,8 B) |
| Parametros activos | No disponible (MoE con 6 de 128 expertos enrutados más 1 compartido; el número exacto de parámetros activos no se indica) |
| Longitud de contexto | 32.768 tokens (evaluado a esa longitud) |
| Tipos de cuantizacion | No disponible (los pesos se distribuyen en bf16; no se documentan cuantizaciones GGUF, AWQ ni GPTQ) |
| Idiomas soportados | Inglés (en) |
| Licencia | OpenMDW License 1.1 (hereda la del modelo base de NVIDIA) |
| Formato de pesos | safetensors, con remote code para transformers |

## Arquitectura y entrenamiento

La arquitectura subyacente es Nemotron-3.5-Lightning-30B-A3B, un transformer híbrido de 52 capas que intercala capas Mamba-2 (modelos de espacio de estados) con capas de atención y capas de mezcla de expertos. El componente MoE usa 128 expertos enrutados con 6 activos por token y 1 experto compartido, sobre un tamaño oculto de 2.688. EchoMoE no modifica esta topología: introduce un mecanismo de compresión de activaciones en la comunicación entre expertos. Cada estado oculto se representa como una diferencia respecto a una referencia refrescada cada 4 capas MoE, codificada en 768 dimensiones para el dispatch y 1.408 para el combine.

El entrenamiento consistió en destilación desde el teacher Nemotron-3.5-Lightning-30B-A3B-SFT-EchoMoE-teacher (el modelo base afinado con SFT sobre Dolci-Instruct-SFT) sobre 4.300 millones de tokens, entrenando todos los pesos. Los datos de instrucción proceden de allenai/Dolci-Instruct-SFT y la mezcla de preentrenamiento de allenai/dolma3_dolmino_mix-10B-1025. La evaluación se realizó en bf16 con vLLM 0.21 y el plugin de EchoMoE; transformers 5.8.1 puede cargar el modelo mediante el código remoto del repositorio, aunque sin los kernels de mamba-ssm las capas Mamba-2 se ejecutan en PyTorch puro y las log-probabilidades difieren de las de vLLM.

## Capacidades

- Generación de texto conversacional en inglés, con plantilla de chat propia.
- Razonamiento de conocimiento general y tareas de instrucción (evaluado en 18 benchmarks agrupados en conocimiento/razonamiento, matemáticas, código y seguimiento de instrucciones).
- Generación de código y resolución de problemas matemáticos, con degradación notable en matemáticas respecto al teacher (−8,8 puntos).
- Soporte de decodificación greedy (por defecto) y muestreo con temperatura 0.7, top_p 0.8 y top_k 20 para chat.
- Ejecución con paralelismo de expertos (expert parallelism) mediante all-to-all con backend allgather_reducescatter.
- No se documenta soporte explícito de tool calling, function calling, visión, audio ni modo thinking.
- Capacidad multilingüe limitada al inglés según la model card.

## Casos de uso

- Investigación en sistemas distribuidos: medir el impacto real de la compresión de activaciones en el tráfico inter-nodo de un clúster con expert parallelism, comparando los 48 % menos bytes frente al teacher y la pérdida de 4,5 puntos medios.
- Despliegue en clústeres con interconexión limitada: servir el modelo en 8 GPUs con `--data-parallel-size 8 --enable-expert-parallel` cuando el ancho de banda entre nodos es el cuello de botella y una pérdida moderada de calidad es aceptable.
- Baseline para experimentos de destilación: usar este checkpoint como referencia de un modelo comprimido entrenado con 4.300 millones de tokens para comparar con otras variantes de la colección EchoMoE (distintos valores de s, r y c).
- Evaluación de fidelidad entre backends: comparar las log-probabilidades de transformers (sin kernels mamba-ssm) frente a vLLM para cuantificar la discrepancia (2,3 puntos en ARC-Challenge 5-shot).
- Generación de código en pipelines internos: con una degradación de solo 1,6 puntos en el dominio de código respecto al teacher, es viable para tareas de autocompletado o generación de scripts donde el ahorro de comunicación prime sobre la calidad máxima.
- Seguimiento de instrucciones en asistentes conversacionales: la caída de solo 0,9 puntos en instruction following lo hace apto para prototipos de chat en inglés con contexto de hasta 32.768 tokens.
- Reproducción académica: validar los resultados del paper arXiv:2611.22215 sobre compresión de activaciones para expert parallelism usando el código y los scripts del repositorio de McGill-NLP.

## Benchmarks y rendimiento

Puntuación media (%) sobre 18 benchmarks por dominio, con la variación respecto al teacher entre paréntesis:

| Dominio | Teacher | EchoMoE | Diferencia |
|---|---|---|---|
| Conocimiento y razonamiento | 71,6 | 67,9 | −3,7 |
| Matemáticas | 50,5 | 41,7 | −8,8 |
| Código | 53,0 | 51,4 | −1,6 |
| Seguimiento de instrucciones | 55,0 | 54,1 | −0,9 |
| **Media** | **62,8** | **58,3** | **−4,5** |

Dato adicional: en ARC-Challenge (5-shot), la ejecución con transformers sin kernels mamba-ssm puntúa 2,3 puntos por debajo de la ejecución con vLLM; el teacher sin comprimir cae 0,9 puntos en la misma comparación. El ahorro de comunicación reportado es del 48 % menos bytes inter-nodo.

## Requisitos de hardware

- VRAM para inferencia en bf16: los pesos (≈27,8 B parámetros) ocupan aproximadamente 55,6 GB, por lo que caben en una única GPU de 80 GB.
- GPU recomendadas: A100 80 GB o H100 80 GB para ejecución en una sola tarjeta con transformers; para el despliegue con expert parallelism, un nodo de 8 GPUs.
- Cabe en GPU de consumo: no en bf16; no se documentan cuantizaciones que permitan reducir por debajo de 24 GB.
- Opciones de despliegue: vLLM 0.21 con el plugin de EchoMoE (recomendado para reproducir resultados) y transformers 5.8.1 con `trust_remote_code=True`. No se documenta soporte de llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. La model card advierte que `--max-num-seqs 256` es necesario para que el arranque en vLLM no supere el tiempo de espera de 600 segundos del servidor de API, debido al coste de captura de CUDA graphs del modelo plegado.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Calidad media (18 benchmarks) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| EchoMoE-Nemotron-3.5-Lightning-30B-A3B-s4-r768-c1408 | 27,8 B totales | 32.768 | 58,3 | OpenMDW 1.1 | Hugging Face, código remoto |
| Nemotron-3.5-Lightning-30B-A3B-SFT-EchoMoE-teacher | No disponible | 32.768 (evaluado) | 62,8 | OpenMDW 1.1 (heredada) | Hugging Face |
| Otras variantes de la colección EchoMoE | No disponible | No disponible | No disponible | OpenMDW 1.1 | Hugging Face (colección McGill-NLP) |

No se dispone de datos de benchmarks de modelos externos a la colección en la información proporcionada.

## Limitaciones y advertencias

- Pérdida de calidad respecto al teacher: −4,5 puntos de media, con una caída especialmente acusada en matemáticas (−8,8 puntos), lo que desaconseja su uso en tareas de razonamiento matemático exigente.
- Solo inglés: la model card declara únicamente el idioma `en`; no hay evidencia de capacidades multilingües.
- Discrepancia entre backends: con transformers sin kernels mamba-ssm, las log-probabilidades difieren de vLLM (2,3 puntos en ARC-Challenge 5-shot), por lo que los resultados reportados solo son reproducibles con vLLM.
- Requiere código remoto (`trust_remote_code=True`) y el plugin específico de EchoMoE para vLLM; no es un checkpoint estándar de transformers.
- Arranque lento en vLLM con la configuración por defecto: es necesario limitar `--max-num-seqs` para evitar timeouts.
- Licencia OpenMDW 1.1 heredada de NVIDIA: conserva el aviso de copyright de NVIDIA; deben revisarse los términos para uso comercial.
- Riesgo de alucinación no cuantificado en la información disponible; al ser un modelo destilado con compresión de activaciones, es esperable un comportamiento similar o ligeramente peor que el teacher.
- Sin soporte documentado de tool calling, agentes, visión ni audio.
- Modelo de investigación con 641 descargas y 0 likes en el momento de la consulta; no hay evidencia de validación en producción.

## Enlaces

- Hugging Face: https://huggingface.co/McGill-NLP/EchoMoE-Nemotron-3.5-Lightning-30B-A3B-s4-r768-c1408
- Paper: https://arxiv.org/abs/2611.22215
- Código: https://github.com/McGill-NLP/EchoMoE
- Página del proyecto: https://mcgill-nlp.github.io/EchoMoE/
- Colección EchoMoE: https://huggingface.co/collections/McGill-NLP/echomoe-6afcbfa10b38185f87cbd0ac
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-Base-BF16
- Teacher: https://huggingface.co/McGill-NLP/Nemotron-3.5-Lightning-30B-A3B-SFT-EchoMoE-teacher
