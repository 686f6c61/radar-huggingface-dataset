# Monruho/GriffithLLM-TinyStories

## Resumen

GriffithLLM-TinyStories es una familia de cuatro modelos de lenguaje de tipo GPT de escala reducida, publicados por el usuario Monruho, cuyo propósito no es competir en capacidades generales sino servir de banco de pruebas para una idea arquitectónica concreta: sustituir la red feed-forward (FFN) del Transformer por circuitos de puertas lógicas (LUTs, lookup tables) implementados con el framework Griffith. El resto del modelo —atención, embeddings, LayerNorm y cabeza de salida— permanece en coma flotante. Los modelos se entrenan exclusivamente sobre el dataset TinyStories y generan cuentos infantiles cortos en inglés.

Los cuatro checkpoints comparten una configuración idéntica: 6 capas, 8 cabezas de atención, dimensión de modelo 256, contexto de 256 tokens, tokenizador BPE a nivel de byte con vocabulario de 4096 tokens y 16.000 pasos de entrenamiento con batch de 32 (aproximadamente 0,27 épocas). Las variantes son `fp` (FFN en coma flotante, línea base), `lut_wide` (LUT de 1024 bits de entrada y anchura 2048), `lut` (LUT de 512 bits de entrada y anchura 1024) y `noffn` (sin FFN, solo atención, como control).

Su relevancia es fundamentalmente experimental: cuantifica cuánto rendimiento se pierde al reemplazar el FFN denso por lógica booleana discreta. Según la model card, el FFN con LUT recupera solo el 31-35 % de la brecha de perplejidad entre el modelo sin FFN y el modelo con FFN en coma flotante, lo que sugiere que la sustitución no es gratuita en términos de calidad a esta escala.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer GPT-style con FFN reemplazado por LUTs (puertas lógicas de 2 entradas, 2 capas) |
| Parámetros totales | 5,85M (`fp`), 7,82M (`lut_wide`), 5,26M (`lut`), 2,70M (`noffn`) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 256 tokens |
| Tipos de cuantización | No disponible (los checkpoints se distribuyen en coma flotante; el FFN LUT se evalúa como circuito booleano discreto) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache-2.0 |
| Formato de pesos | `.pt` (checkpoint PyTorch con `torch.load(..., weights_only=True)`), no compatible con `transformers` |

## Arquitectura y entrenamiento

La arquitectura es un Transformer decoder-only de 6 capas con 8 cabezas de atención, `d_model` de 256 y contexto de 256 tokens. La innovación central reside en el FFN: en lugar de la MLP habitual, cada bloque LUT aplica `Linear -> binarize -> 2 capas de LUTs de 2 entradas -> Linear`, escalado por un escalar aprendido inicializado a cero (ReZero). El entrenamiento usa selección dura de puertas con gradientes straight-through, de modo que el forward en entrenamiento coincide con el circuito discretizado en inferencia. La variante `lut` contiene 2048 puertas por capa y `lut_wide` 4096.

El entrenamiento se realizó únicamente sobre TinyStories (Eldan & Li, 2023), con tokenizador BPE a nivel de byte de 4096 tokens, batch de 32 y 16.000 pasos (unas 0,27 épocas). Se usó una sola semilla y, según el autor, ningún modelo había convergido a los 16.000 pasos. No se menciona RLHF, DPO ni ajuste por instrucciones. La perplejidad se mide sobre el split de validación completo de TinyStories (4,8M tokens), evaluando los modelos LUT como circuitos booleanos discretos.

## Capacidades

- Generación de texto narrativo corto en inglés: cuentos infantiles de estilo TinyStories.
- Generación autoregresiva con muestreo configurable (temperatura, top-k; el ejemplo de la model card usa temperatura 0,8 y top-k 40).
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni uso como agente.
- No soporta conversación ni respuesta a preguntas: el autor indica explícitamente que los modelos no pueden chatear ni contestar preguntas.
- Capacidad multilingüe nula más allá del inglés (el autor indica que no escriben otros idiomas, incluido el japonés).
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Investigación sobre eficiencia arquitectónica: comparar el coste en calidad de sustituir el FFN denso por LUTs booleanas frente a una línea base en coma flotante, usando las cuatro variantes con idéntica configuración.
- Experimentos de destilación a circuitos discretos: estudiar cómo se comporta un modelo cuyo forward en entrenamiento ya es discreto (straight-through), como paso previo a implementaciones en hardware lógico.
- Docencia y divulgación: ejemplo mínimo y reproducible (5-8M parámetros, contexto 256) para explicar attention, FFN y alternativas con puertas lógicas en un portátil o una GPU consumer.
- Generación de cuentos sintéticos de dominio restringido: producir narrativas infantiles cortas en inglés para aumentar datasets de investigación, asumiendo que la trama puede perderse.
- Benchmark de referencia para TinyStories: usar las perplejidades publicadas (5,50 / 6,64 / 6,72 / 7,27) como punto de comparación de nuevas variantes arquitectónicas a esta escala.
- Pruebas de tooling de inferencia: validar pipelines de carga de checkpoints PyTorch no estándar (`torch.load` con `weights_only=True`) y scripts de generación propios antes de escalar a modelos mayores.

## Benchmarks y rendimiento

Los únicos datos publicados son perplejidades de validación sobre el split completo de TinyStories (4,8M tokens) y velocidad de entrenamiento en T4:

| Modelo | FFN | Perplejidad validación | Parámetros | Velocidad entrenamiento (T4) |
|---|---|---|---|---|
| `fp` | Coma flotante (línea base) | 5,50 | 5,85M | 0,11 s/paso |
| `lut_wide` | LUT, 1024 bits entrada, anchura 2048 | 6,64 | 7,82M | 0,75 s/paso |
| `lut` | LUT, 512 bits entrada, anchura 1024 | 6,72 | 5,26M | 0,40 s/paso |
| `noffn` | Ninguno (solo atención, control) | 7,27 | 2,70M | 0,06 s/paso |

El FFN con LUT recupera 0,55 de la brecha de 1,77 puntos de perplejidad entre "sin FFN" y el FFN en coma flotante (31 %); duplicar la anchura recupera 0,63 (35 %). No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en todos los casos (el repo completo ocupa 0,1 GB y los modelos tienen entre 2,7M y 7,8M de parámetros).
- GPU recomendadas: cualquier GPU con suficiente memoria para el checkpoint; el autor reporta entrenamiento en Tesla T4. Para inferencia cabe en GPUs consumer muy modestas (GTX 1650, RTX 3050, etc.) e incluso en CPU.
- Cabe en cualquier GPU consumer actual; el cuello de botella no es la memoria sino la velocidad del FFN LUT.
- Opciones de despliegue: no es compatible con vLLM, llama.cpp, Ollama ni TGI. Requiere el código propio del repositorio `manruho/GriffithLLM` (instalación con `uv sync --extra cpu`) y el script `griffith_llm.generate`.
- Latencia y throughput: no disponibles como cifras absolutas; el autor indica que los modelos LUT son más lentos que la línea base tanto en GPU como en CPU, y que el entrenamiento del FFN LUT es entre 3,6x (`lut`) y 6,8x (`lut_wide`) más lento por paso que el baseline en T4.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Perplejidad TinyStories | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GriffithLLM-TinyStories `fp` | 5,85M | 256 | 5,50 | Apache-2.0 | Hugging Face (requiere código propio) |
| GriffithLLM-TinyStories `lut` | 5,26M | 256 | 6,72 | Apache-2.0 | Hugging Face (requiere código propio) |
| Modelos TinyStories de referencia (Eldan & Li, 2023) | 1M-33M (rango del paper) | No disponible en la información proporcionada | No disponible en la información proporcionada | No disponible en la información proporcionada | Paper arXiv:2305.07759 |

No se dispone de datos de perplejidad ni de licencia de los modelos originales del paper de TinyStories en la información proporcionada, por lo que la comparación cuantitativa con alternativas queda limitada a las cuatro variantes internas de esta familia.

## Limitaciones y advertencias

- Los cuentos son gramaticales pero a menudo pierden la trama o se contradicen, según el propio autor.
- Resultados de una sola semilla y ningún modelo había convergido a los 16.000 pasos: las cifras no deben tratarse como comparaciones definitivas.
- La mayor parte de los parámetros del FFN LUT están en las matrices lineales de entrada y salida en coma flotante; `lut` tiene 2048 puertas por capa y `lut_wide` 4096. No es una red completamente lógica.
- Los modelos LUT son más lentos que la línea base en GPU y CPU, lo que reduce su atractivo práctico.
- Solo inglés y solo dominio TinyStories: no conversan, no responden preguntas y no escriben otros idiomas.
- Contexto muy corto (256 tokens), insuficiente para tareas de contexto largo.
- Riesgo de alucinación y de incoherencia narrativa inherente a un modelo de 5-8M de parámetros entrenado 0,27 épocas.
- No son modelos `transformers`: requieren `torch.load(..., weights_only=True)` y el código del repositorio, lo que complica su integración en pipelines estándar.
- Licencia Apache-2.0 en los pesos; los datos de entrenamiento (TinyStories) están bajo CDLA-Sharing-1.0, lo que conviene revisar antes de un uso comercial de los derivados.
- No aptos para producción en atención al cliente, código, agentes ni ninguna tarea de razonamiento general.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Monruho/GriffithLLM-TinyStories
- Código de GriffithLLM: https://github.com/manruho/GriffithLLM
- Framework Griffith: https://github.com/tsukushi-gate/Griffith
- Dataset TinyStories: https://huggingface.co/datasets/roneneldan/TinyStories
- Paper TinyStories (Eldan & Li, 2023): https://arxiv.org/abs/2305.07759
