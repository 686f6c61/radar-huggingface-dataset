# McGill-NLP/EchoMoE-Moonlight-16B-A3B-s4-r512-c1024

## Resumen

EchoMoE-Moonlight-16B-A3B-s4-r512-c1024 es un checkpoint de investigación desarrollado por el grupo McGill-NLP que aplica la técnica EchoMoE sobre el modelo mixto de expertos Moonlight-16B-A3B. El objetivo no es mejorar la calidad del modelo base, sino reducir el coste de comunicación en escenarios de *expert parallelism* (EP) distribuido. En lugar de transmitir entre nodos cada estado oculto completo, EchoMoE envía un código comprimido que representa la diferencia respecto a un estado de referencia que se refresca cada pocas capas.

La arquitectura subyacente es un transformer MoE de tipo DeepSeek-V3 con 27 capas, 64 expertos enrutados (6 activos) más 2 expertos compartidos y un tamaño oculto de 2.048. El checkpoint tiene 15.388.676.928 parámetros totales almacenados en safetensors (30,8 GB en bf16) y se ha destilado desde un profesor afinado con instrucciones sobre Dolci-Instruct-SFT.

La relevancia de este modelo es doble: por un lado, demuestra que es posible reducir un 50 % el tráfico entre nodos en EP a cambio de una pérdida media de 5,9 puntos en 18 benchmarks; por otro, sirve como referencia reproducible para investigar compresión de activaciones en inferencia distribuida de modelos MoE. No es un modelo pensado para producción generalista, sino para experimentación en sistemas de inferencia.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE tipo DeepSeek-V3 (27 capas, 64 expertos enrutados, 6 activos, 2 compartidos, hidden size 2.048) con modificación EchoMoE |
| Parámetros totales | 15.388.676.928 |
| Parámetros activos | No disponible (el modelo base Moonlight-16B-A3B activa 3B según su nombre, pero la model card no lo confirma explícitamente) |
| Longitud de contexto | 8.192 tokens (longitud de evaluación; no se especifica el máximo arquitectónico) |
| Tipos de cuantización | No disponible (solo se documenta bf16) |
| Idiomas soportados | Inglés (en) |
| Licencia | MIT |
| Formato de pesos | safetensors (con código remoto para transformers) |

## Arquitectura y entrenamiento

El modelo parte de Moonlight-16B-A3B, un MoE con 27 capas, 64 expertos enrutados de los que se activan 6, más 2 expertos compartidos, y un tamaño oculto de 2.048. Sobre esa base, EchoMoE introduce un mecanismo de compresión de activaciones para el *dispatch* y el *combine* entre expertos: en lugar de enviar el estado oculto completo a través de la red, se envía un código de baja dimensión que codifica la diferencia respecto a un estado de referencia. La referencia se refresca cada 4 capas MoE (7 de las 26 capas MoE actúan como referencia), con un código de dispatch de 512 dimensiones y un código de combine de 1.024 dimensiones.

El entrenamiento es una destilación desde el profesor `Moonlight-16B-A3B-SFT-EchoMoE-teacher` (el modelo base afinado sobre Dolci-Instruct-SFT) usando 4,3 mil millones de tokens y entrenando todos los pesos. Los datasets declarados son allenai/Dolci-Instruct-SFT y allenai/dolma3_dolmino_mix-10B-1025. La evaluación se realiza en bf16 a 8.192 tokens de contexto, con vLLM 0.21 y el plugin EchoMoE para los resultados de precisión, y con transformers 5.8.1 mediante código remoto para la carga en PyTorch plano.

## Capacidades

- Generación de texto conversacional en inglés, con plantilla de chat (`apply_chat_template`).
- Razonamiento y conocimiento general, evaluado en el bloque de *knowledge and reasoning* de los 18 benchmarks del proyecto.
- Matemáticas, con un rendimiento relativo superior al de código respecto al profesor (pierde 3,3 puntos frente a 7,4 en código).
- Generación de código, aunque es el dominio donde la compresión EchoMoE penaliza más.
- Seguimiento de instrucciones, evaluado de forma específica en el conjunto de benchmarks.
- Inferencia distribuida con *expert parallelism* mediante vLLM y backend `allgather_reducescatter`.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión, audio ni modo de razonamiento explícito (thinking mode).

## Casos de uso

- Investigación en sistemas de inferencia distribuida: el modelo sirve para medir empíricamente el intercambio entre ancho de banda entre nodos y calidad en *expert parallelism*, comparando el checkpoint comprimido contra el profesor sin comprimir.
- Reproducción de experimentos de compresión de activaciones: al estar publicados el código, la configuración (s4, r512, c1024) y el profesor, permite replicar y extender el método con otras configuraciones de referencia y dimensiones de código.
- Despliegue en clústeres con interconexión limitada: en entornos donde el cuello de botella es el *all-to-all* entre nodos, la reducción del 50 % de bytes puede hacer viable servir un MoE de 15B en topologías que de otro modo no lo serían.
- Evaluación comparativa de precisión por dominio: útil para estudiar qué tareas son más sensibles a la compresión (código e instrucciones pierden más que matemáticas) y orientar futuras decisiones de diseño.
- Base para *fine-tuning* específico: al estar bajo licencia MIT y con pesos completos, puede servir como punto de partida para tareas en inglés donde la pérdida de 5,9 puntos medios sea aceptable a cambio del ahorro en comunicación.
- Docencia y divulgación sobre MoE: el repositorio incluye código remoto en PyTorch plano que cabe en una GPU de 80 GB, lo que facilita explicar el enrutamiento de expertos y la compresión de activaciones en un solo nodo.
- Pruebas de integración con vLLM: el *script* de instalación y los parámetros de servicio (`--data-parallel-size 8`, `--enable-expert-parallel`, `--max-num-seqs 256`) sirven como referencia para configurar otros MoE con EP en vLLM 0.21.

## Benchmarks y rendimiento

Puntuación media (%) sobre 18 benchmarks por dominio, con la variación respecto al profesor entre paréntesis:

| Dominio | Profesor | EchoMoE |
|---|---|---|
| Conocimiento y razonamiento | 62,9 | 56,0 (−6,9) |
| Matemáticas | 34,7 | 31,4 (−3,3) |
| Código | 47,0 | 39,6 (−7,4) |
| Seguimiento de instrucciones | 51,3 | 47,0 (−4,3) |
| **Media** | **53,0** | **47,1 (−5,9)** |

El beneficio declarado es una reducción del 50 % en bytes enviados entre nodos. No se publican en la información disponible resultados por benchmark individual ni comparaciones con otros modelos fuera de la pareja profesor/EchoMoE.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: los pesos ocupan aproximadamente 30,8 GB, por lo que caben en una GPU de 80 GB (A100 80GB, H100 80GB) con margen para caché KV a 8.192 tokens.
- En FP16/BF16 no cabe en GPUs de consumo de 24 GB (RTX 4090, RTX 3090) sin cuantización; no se documentan recetas de cuantización para este checkpoint.
- Despliegue con vLLM 0.21 y el plugin EchoMoE: la configuración de referencia usa un nodo de 8 GPUs con `--data-parallel-size 8 --enable-expert-parallel --all2all-backend allgather_reducescatter --attention-backend FLASH_ATTN_MLA`.
- Despliegue con transformers 5.8.1 mediante código remoto, en PyTorch plano sin *expert parallelism*, sobre una única GPU de 80 GB.
- El arranque en vLLM con `--max-num-seqs 256` tarda unos minutos; con el valor por defecto, la captura de CUDA graphs excede el tiempo de espera de 600 segundos del servidor de API.
- No se publican datos de latencia ni de *throughput* en la información disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| EchoMoE-Moonlight-16B-A3B-s4-r512-c1024 | 15,39B totales | 8.192 (evaluación) | MIT | MoE con compresión de activaciones para EP |
| Moonlight-16B-A3B-SFT-EchoMoE-teacher | No disponible | No disponible | MIT (heredada del base) | MoE sin compresión, profesor de destilación |
| Moonlight-16B-A3B | No disponible en la información | No disponible | MIT | MoE base de Moonshot AI |

La única comparación cuantitativa disponible es contra el profesor: −5,9 puntos de media a cambio de −50 % de bytes entre nodos. No se han publicado en la información proporcionada comparaciones con otros MoE de tamaño similar (por ejemplo, variantes de Qwen o Mixtral).

## Limitaciones y advertencias

- Pérdida de calidad sistemática: −5,9 puntos de media, con caídas de hasta −7,4 en código y −6,9 en conocimiento y razonamiento respecto al profesor.
- Modelo de investigación: el propio autor lo presenta como un experimento de eficiencia en comunicación, no como un modelo listo para producción generalista.
- Solo inglés: la model card declara únicamente `en`; no hay evidencia de capacidades multilingües.
- Contexto evaluado limitado a 8.192 tokens; no se documenta el máximo arquitectónico ni el comportamiento más allá de esa longitud.
- Sin datos de cuantización: no se han publicado recetas GGUF, AWQ ni GPTQ, lo que dificulta el despliegue en GPUs de consumo.
- Requiere código remoto (`trust_remote_code=True`) en transformers, con el riesgo de seguridad que implica ejecutar código del repositorio.
- Dependencia de versiones concretas: vLLM 0.21 con plugin EchoMoE y transformers 5.8.1; otras versiones pueden no cargar el modelo correctamente.
- El arranque en vLLM es sensible a `--max-num-seqs`; con valores altos puede superar el tiempo de espera del servidor.
- Riesgo de alucinación y sesgos: no se documentan evaluaciones de seguridad, sesgo ni tasas de alucinación para este checkpoint; al derivar de Dolci-Instruct-SFT, hereda los sesgos de ese corpus.
- La licencia MIT permite uso comercial, pero la calidad degradada y la falta de soporte hacen desaconsejable su uso en producción sin validación previa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/McGill-NLP/EchoMoE-Moonlight-16B-A3B-s4-r512-c1024
- Código: https://github.com/McGill-NLP/EchoMoE
- Página del proyecto: https://mcgill-nlp.github.io/EchoMoE/
- Colección EchoMoE: https://huggingface.co/collections/McGill-NLP/echomoe-6afcbfa10b38185f87cbd0ac
- Profesor: https://huggingface.co/McGill-NLP/Moonlight-16B-A3B-SFT-EchoMoE-teacher
- Modelo base: https://huggingface.co/moonshotai/Moonlight-16B-A3B
- Paper: no disponible (pendiente de arXiv según la model card)
