# Lobus22/Xeno-L1

## Resumen

Xeno L1 es un modelo de generación de texto de 1.018 millones de parámetros desarrollado por Lobus22, entrenado íntegramente desde cero sobre CPU. No parte de ningún modelo base, no utiliza LoRA ni técnicas de fine-tuning sobre pesos ajenos: la totalidad de los pesos se inicializan y entrenan de forma nativa. Emplea una arquitectura Mixture of Experts (MoE) con 10 capas, dimensión de modelo 512, 8 cabezas de atención, 16 expertos por capa y enrutamiento top-1, lo que resulta en aproximadamente 74 millones de parámetros activos por token.

La característica más singular es su tokenizador byte-level de 256 entradas construido desde cero: la entrada al modelo son bytes crudos (0-255) en lugar de tokens BPE. El entrenamiento se ha realizado sobre un corpus propio de 15,68 MB (Wikipedia en inglés, TinyStories y Shakespeare), lo que equivale a unos 15,7 millones de tokens byte-level. El autor declara haber completado únicamente 440 pasos de optimización y 0,9 millones de tokens entrenados, con una pérdida de 3,2937 frente a una línea base aleatoria de ln(256) = 5,545.

El modelo es relevante como ejercicio de investigación abierta sobre entrenamiento desde cero en hardware de consumo y sobre arquitecturas MoE con tokenización a nivel de byte, pero su estado actual es explícitamente experimental: el propio autor lo califica de severamente subentrenado (0,0009 tokens por parámetro frente a los ~20 000 millones de tokens que requeriría un modelo de 1B). No es apto para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE), transformer, 10 capas, d_model 512, 8 cabezas, 16 expertos, d_ff 4096, top-1 |
| Parametros totales | 1.017.615.360 |
| Parametros activos | ~74 millones por token |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en float32) |
| Idiomas soportados | en, id |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (model.safetensors, 4,07 GB, archivo único sin shards) |

## Arquitectura y entrenamiento

Xeno L1 es un transformer MoE de 10 bloques con dimensión de modelo 512, 8 cabezas de atención, 16 expertos por bloque con feed-forward de dimensión 4096 y enrutamiento top-1 (un solo experto activo por token). El tokenizador es byte-level puro de 256 entradas, construido desde cero, con embeddings de token y de posición de 256 × 512 y cabeza de salida a 256. Los pesos se distribuyen en un único archivo safetensors de 4,07 GB en precisión float32.

El entrenamiento se realizó enteramente en CPU con AdamW, learning rate 3e-3 y 50 pasos de warmup, alcanzando 440 pasos y 0,9 millones de tokens sobre un corpus propio de 15,68 MB (Wikipedia EN, TinyStories y Shakespeare, aproximadamente 15,7 millones de tokens byte-level). No se documentan fases de RLHF, DPO ni instrucción supervisada. El autor reconoce que el modelo está severamente subentrenado (0,0009 tokens por parámetro) y planea una variante densa sin MoE, denominada Xeno L2, basada en un sistema de tablas estadísticas sin enrutamiento de expertos.

## Capacidades

- Generación de texto autoregresiva a nivel de byte (entrada de bytes crudos 0-255, no tokens BPE).
- Modelado de lenguaje sobre texto en inglés e indonesio, según los idiomas declarados.
- Capacidad experimental de continuación de texto tras un prompt en formato byte-level.
- No dispone de tool calling ni function calling documentado.
- No dispone de soporte de agentes ni razonamiento multi-paso documentado.
- No dispone de modo de pensamiento (thinking), visión, audio ni otras modalidades.
- No se documenta capacidad de instrucción, chat ni alineación.

## Casos de uso

- Investigación sobre tokenización byte-level: permite estudiar cómo un modelo byte-level de 256 entradas aprende representaciones sin vocabulario BPE, comparando su pérdida con la línea base ln(256) = 5,545.
- Estudio de arquitecturas MoE de bajo coste: con 74 millones de parámetros activos por token sobre 1.018 millones totales, sirve como banco de pruebas para analizar el enrutamiento top-1 y el desequilibrio de expertos en modelos pequeños.
- Reproducción de entrenamiento desde cero en CPU: el modelo y su receta (AdamW, lr 3e-3, 50 pasos de warmup) permiten replicar el pipeline completo en hardware sin GPU.
- Docencia y divulgación: ilustra de forma tangible la diferencia entre un modelo entrenado (0,9 millones de tokens) y uno que requeriría ~20 000 millones, útil para explicar el escalado de datos.
- Análisis de corpus pequeños: con 15,68 MB de datos propios, sirve para medir la calidad de continuación de texto sobre dominios acotados como TinyStories o Shakespeare.
- Base para experimentos de destilación o inicialización: al ser Apache 2.0 y de pesos abiertos, puede servir como punto de partida para investigación comparativa, no como modelo de producción.

## Benchmarks y rendimiento

Datos declarados por el autor en el model-index (no verificados):

| Modelo | Tarea | Dataset | Métrica | Valor |
|---|---|---|---|---|
| Xeno L1 | text-generation | Wikipedia EN + TinyStories + Shakespeare (held-out split) | Training loss (step 440) | 3,2937 |

Línea base de referencia declarada por el autor: pérdida aleatoria ln(256) = 5,545. No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en float32 ocupan 4,07 GB; en fp16 serían ~2,04 GB y en int8 ~1,02 GB (estimación a partir del número de parámetros, no publicada por el autor).
- GPU recomendadas: cualquier GPU con al menos 6-8 GB de VRAM para fp32; una RTX 3060 de 12 GB o superior es suficiente. También una RTX 4090, A100 o H100, aunque están sobredimensionadas para este tamaño.
- Cabe en GPU de consumo: sí, en tarjetas con 6 GB o más en fp32 y en tarjetas de 4 GB con cuantización a int8 (estimación).
- Opciones de despliegue: al ser un modelo byte-level con arquitectura MoE propia y sin integración en transformers estándar, no hay soporte documentado para vLLM, llama.cpp, Ollama o TGI. La carga se realiza manualmente con `safetensors.torch.load_file` y la arquitectura descrita en la model card.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Xeno L1 | 1.018 M totales / ~74 M activos | no disponible | Apache 2.0 | Hugging Face (Lobus22/Xeno-L1) | Entrenado desde cero en CPU, byte-level, 0,9 M tokens, experimental |
| TinyLlama 1.1B | 1.100 M | 2048 | Apache 2.0 | Hugging Face | Entrenado con ~3 billones de tokens, denso, BPE |
| SmolLM-135M | 135 M | 2048 | Apache 2.0 | Hugging Face | Denso, BPE, entrenado con cientos de miles de millones de tokens |
| Pythia-1B | 1.000 M | 2048 | Apache 2.0 | Hugging Face | Denso, BPE, entrenado con ~300 000 millones de tokens |

Los datos de los modelos comparables corresponden a información pública general; no se dispone de comparaciones directas de benchmarks con Xeno L1 en la información proporcionada.

## Limitaciones y advertencias

- Modelo severamente subentrenado: 0,9 millones de tokens frente a los ~20 000 millones recomendados para 1B, es decir, 0,0009 tokens por parámetro. La salida de texto es experimental y no apta para producción.
- Riesgo elevado de alucinación y de generación incoherente por falta de datos de entrenamiento.
- Idiomas declarados (en, id) sin evaluación de calidad; el corpus de entrenamiento es mayoritariamente inglés (Wikipedia EN, TinyStories, Shakespeare).
- Longitud de contexto no documentada; no se puede asumir una ventana estándar.
- No hay alineación ni instrucción: no se ha aplicado RLHF, DPO ni SFT, por lo que no sigue instrucciones ni mantiene formato conversacional.
- El tokenizador byte-level implica secuencias más largas que con BPE, lo que incrementa el coste computacional por unidad de texto.
- Sin integración en frameworks de inferencia estándar (vLLM, llama.cpp, TGI), lo que complica el despliegue.
- Licencia Apache 2.0 permite uso comercial, pero el estado del modelo hace inviable su uso en producción.
- El autor declara un plan de sustitución por Xeno L2 (denso, sin MoE), lo que sugiere que Xeno L1 no recibirá más entrenamiento.
- Sesgos conocidos: no documentados; el corpus incluye Wikipedia EN, TinyStories y Shakespeare, con posibles sesgos de dominio y de idioma.

## Enlaces

- Hugging Face: https://huggingface.co/Lobus22/Xeno-L1
- Dataset TinyStories: https://huggingface.co/datasets/roneneldan/TinyStories
- Wikipedia (dataset): https://huggingface.co/datasets/wikipedia
- Repositorio de safetensors: https://github.com/huggingface/safetensors
