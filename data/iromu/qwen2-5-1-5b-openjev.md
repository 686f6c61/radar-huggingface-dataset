# iromu/Qwen2.5-1.5B-openjev

## Resumen

Qwen2.5-1.5B-openjev es un ajuste fino (fine-tuning) del modelo Qwen2.5-1.5B de Alibaba, publicado por el usuario iromu en Hugging Face. El modelo se ha entrenado mediante LoRA con SFT exclusivamente (sin RL posterior) para resolver preguntas de decisión tipada (typed-decision) a partir del corpus Open-Jev: dado un estado, una pregunta y un espacio de opciones con un objetivo numérico (float), el modelo responde con una única letra de etiqueta (`A`, `B`, ...) que representa la opción con el valor máximo (argmax). No es un modelo de tool calling: elige entre opciones, no genera llamadas a herramientas.

Su relevancia radica en la especialización extrema: mientras el modelo base apenas emite una letra aislada en el 1,3% de los casos (con un 0,5% de acierto), este ajuste fino emite una letra en el 100% de las filas y acierta el argmax en el 85,2% de la validación (n = 3495), una mejora de +84,7 puntos porcentuales. El resultado demuestra que, para esta tarea, el techo de rendimiento lo marca el corpus y no el tamaño del modelo: el hermano menor de 0,6B (Qwen3-0.6B-openjev) alcanza un 84,9%.

El artefacto publicado es el merge BF16 del adaptador LoRA sobre el modelo base (1.543.714.304 parámetros en safetensors). Existen variantes hermanas en GGUF (BF16, Q4_K_M, Q5_K_M y Q8_0) y en NVFP4 para TensorRT-LLM. La licencia es Apache 2.0, lo que permite uso comercial sin restricciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (Qwen2), ajuste fino LoRA sobre Qwen/Qwen2.5-1.5B |
| Parametros totales | 1.543.714.304 (merge BF16) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (la del modelo base Qwen2.5-1.5B es 32.768 tokens, pero no consta en la model card) |
| Tipos de cuantizacion | BF16 (merge); GGUF en BF16, Q4_K_M, Q5_K_M y Q8_0; NVFP4 (TensorRT-LLM) en repo hermano |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (merge BF16); GGUF y NVFP4 en repositorios hermanos |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-1.5B, un transformer decoder denso de la familia Qwen2.5. Sobre él se ha aplicado un ajuste fino LoRA (Low-Rank Adaptation) con SFT puro: 1.191 pasos correspondientes a una epoca, con un batch global de 64 y aproximadamente 75.624 filas de entrenamiento. La model card indica explicitamente que la cadena de entrenamiento soporta RL (GRPO), pero no se ha ejecutado para este modelo: el artefacto publicado es el merge del SFT.

El dataset de entrenamiento es `ZefanCai/Open-Jev` (snapshot `c67699e13d0ae25e35b77165a4b6b079bedc8aba`), compuesto por un estado, una pregunta, un espacio de opciones y un objetivo numérico (float) sobre las opciones. El pipeline de datos reduce el objetivo a su argmax, baraja las opciones por fila y escribe el argmax como una única letra de etiqueta. Las filas cuyo objetivo tiene empate (sin argmax definido) se excluyen del cómputo de la pérdida, de modo que el modelo nunca se entrena sobre una adivinanza. Esta aleatorización de opciones evita que el modelo aprenda sesgos posicionales.

## Capacidades

- Respuesta a preguntas de decisión tipada: dado un estado, una pregunta y un conjunto de opciones con objetivo numérico, emite exactamente una letra (`A`–`Z`) correspondiente al argmax.
- Formato de salida estricto y determinista: la respuesta es un solo token y el turno termina en EOS; con `max_new_tokens=8` es suficiente.
- Compatibilidad con chat template mediante `apply_chat_template` de transformers, con un system prompt de tipo "decision model".
- Inferencia greedy recomendada (`do_sample=False`) para reproducibilidad.
- No soporta tool calling ni generación de llamadas a herramientas: es un modelo de elección, no de renderizado de llamadas.
- No está orientado a generación de texto general, razonamiento largo, código ni capacidades multimodales; es un modelo de tarea única.
- Idioma de trabajo: inglés.

## Casos de uso

- Selección de herramienta en pipelines de agentes (tool-choice): cuando un orquestador debe decidir qué herramienta de un catálogo invocar, el modelo puede elegir la opción correcta emitiendo una letra, sin generar JSON ni texto libre, reduciendo errores de formato.
- Enrutado de intents en chatbots: dado un estado de conversación y un conjunto de intents candidatos con puntuaciones objetivo, el modelo selecciona el intent de mayor valor en un solo token, con latencia mínima.
- Clasificación de opciones con objetivo numérico: escenarios donde cada opción tiene un valor flotante asociado (costes, puntuaciones, utilidades) y se necesita el argmax de forma fiable y barata.
- Evaluación y benchmarking de coherencia decisional: el corpus Open-Jev y la suite JevBench permiten usar el modelo como sujeto de estudio sobre calibración y coherencia metamórfica en modelos pequeños.
- Investigación sobre fine-tuning LoRA de tarea única: sirve como ejemplo reproducible de cómo un SFT de una época convierte un modelo base sin formato (0,5% de acierto) en un emisor de decisiones fiable (85,2%).
- Despliegue en hardware modesto: con ~1,5B de parámetros y variantes GGUF cuantizadas (Q4_K_M, Q5_K_M), cabe en GPUs de consumo o incluso CPU para decisiones de baja latencia en producción.
- Componente de ensamblado (ensemble): puede combinarse con un LLM mayor que redacta la respuesta, delegando en este modelo la elección de la opción.

## Benchmarks y rendimiento

Resultados publicados por el autor en la model card. Validación sobre el split `validation` de Open-Jev (n = 3495, gramática `choice`, greedy, `max_new_tokens=384`):

| Modelo | emitted | correct | Δ correct vs BASE |
|---|---|---|---|
| Qwen/Qwen2.5-1.5B (BASE) | 45/3495 (1,3%) | 19/3495 (0,5%) | — |
| Qwen2.5-1.5B-openjev (este modelo) | 3495/3495 (100%) | 2979/3495 (85,2%) | +84,7pp |

Coherencia medida con `forge bench` (jevbench-mini, 50 leyes, logits brutos; Open-Jev ahorra 1.897):

| Dimension | Descripcion | Puntuacion |
|---|---|---|
| overall | Media de las cinco dimensiones | 38,5 |
| REP | Invarianza por repeticion (misma pregunta → misma respuesta) | 59,2 |
| BAT | Comportamiento baseline/ancla | 31,7 |
| MEA | Preservacion de la media bajo transformacion | 14,5 |
| LOG | Coherencia logica / implicacion | 67,9 |
| CHO | Consistencia de eleccion | 19,4 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) para este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3,1 GB en BF16 (tamano del repo); con GGUF Q4_K_M la huella baja a menos de 1,5 GB aproximadamente (estimacion, no confirmada por la model card).
- GPU recomendadas: cualquier GPU moderna con 4 GB de VRAM o mas es suficiente para BF16 (RTX 3060, RTX 4060, RTX 4090, T4, A10, A100); no se requiere hardware de gama alta.
- Cabe sin problemas en GPUs de consumo: incluso en BF16 entra en una RTX 3060 de 12 GB o una RTX 4060 de 8 GB; con GGUF Q4_K_M funciona en portatiles y CPU.
- Opciones de despliegue: transformers (codigo de ejemplo en la model card, `dtype="bfloat16"`, `device_map="auto"`); variantes GGUF para llama.cpp y Ollama; variante NVFP4 para TensorRT-LLM. No se menciona soporte especifico de vLLM o TGI, aunque al ser un merge Qwen2 estandar en safetensors deberia ser compatible.
- Latencia: muy baja por diseño; el modelo emite un unico token y termina en EOS, por lo que con `max_new_tokens=8` la generacion se completa practicamente al instante. No hay cifras de throughput publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea | Acierto en Open-Jev (validacion) | Coherencia JevBench (overall) | Licencia |
|---|---|---|---|---|---|
| Qwen2.5-1.5B-openjev (este modelo) | 1.543.714.304 | Decision tipada (una letra) | 85,2% | 38,5 | Apache 2.0 |
| Qwen3-0.6B-openjev (hermano menor) | ~0,6B (no confirmado) | Decision tipada (una letra) | 84,9% | 44,5 | no disponible |
| Qwen/Qwen2.5-1.5B (base) | 1.543.714.304 | General (sin formato decision) | 0,5% | no disponible | Apache 2.0 |

Observaciones: el hermano menor de 0,6B alcanza practicamente el mismo acierto (84,9% frente a 85,2%) pero con mejor coherencia metamorfica (44,5 frente a 38,5), lo que sugiere que para esta tarea el modelo de 0,6B puede ser preferible salvo que se necesite el formato Qwen2.5-1.5B. No hay otras alternativas comparables publicadas en la informacion disponible.

## Limitaciones y advertencias

- Mala calibracion probabilistica: la model card reconoce que el emisor de letras es sobreconfiado y no preserva la media bajo transformaciones (MEA 14,5, CHO 19,4). Si se necesitan probabilidades fiables sobre las opciones, este modelo no es adecuado; su lectura de probabilidades esta miscalibrada aunque el argmax acierte el 85,2%.
- Coherencia metamorfica limitada: el overall de JevBench (38,5) es inferior al del hermano de 0,6B (44,5), lo que indica sensibilidad a reformulaciones y transformaciones de la pregunta.
- Modelo de tarea unica: no sirve para generacion de texto general, razonamiento conversacional, codigo ni tool calling. Usarlo fuera de su dominio de entrenamiento producira resultados impredecibles.
- Idioma: entrenado y validado en ingles; no hay garantias de funcionamiento en otros idiomas, incluido el castellano.
- Contexto: la model card no especifica la longitud de contexto; habra que asumir la del modelo base Qwen2.5-1.5B (32.768 tokens) sin garantia explicita de que el fine-tuning la preserve en entradas largas.
- Sesgos del corpus: el techo de acierto (~85%) esta marcado por el corpus Open-Jev, no por el modelo; filas con empate en el objetivo se excluyen del entrenamiento, por lo que el modelo no ha aprendido a manejar ambiguedad.
- Licencia: Apache 2.0, sin restricciones para uso comercial; los modelos base Qwen2.5 tienen la misma licencia, por lo que no hay caveats de licencia relevantes.
- Para produccion: usar inferencia greedy (`do_sample=False`) y `max_new_tokens` pequeño (8) para garantizar el formato y minimizar latencia; validar el acierto sobre datos propios antes de desplegar, ya que las metricas publicadas provienen del propio autor.

## Enlaces

- Modelo (merge BF16): https://huggingface.co/iromu/Qwen2.5-1.5B-openjev
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B
- Dataset Open-Jev: https://huggingface.co/datasets/ZefanCai/Open-Jev
- Variante GGUF (BF16 / Q4_K_M / Q5_K_M / Q8_0): https://huggingface.co/iromu/Qwen2.5-1.5B-openjev-GGUF
- Variante NVFP4 (TensorRT-LLM): https://huggingface.co/iromu/Qwen2.5-1.5B-openjev-NVFP4
- Modelo hermano: https://huggingface.co/iromu/Qwen3-0.6B-openjev
