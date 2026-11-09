# fadhilahkhairogi/Liwet-400M-A188M-id-base

## Resumen

Liwet-400M-A188M-id-base es un modelo de lenguaje de tipo Mixture of Experts (MoE) disperso entrenado desde cero para bahasa indonesio por un grupo de estudiantes de la asignatura de Generative AI de la Universidad de Telkom (Grupo 11). Forma parte de la familia "Liwet" (Lightweight Transformer) y su nombre codifica su escala: 400,1 millones de parametros totales con 187,8 millones activos por token (aproximadamente el 46,9 %).

El modelo resuelve la tarea de generacion de texto en indonesio mediante completion de texto crudo, es decir, no esta ajustado para instrucciones ni para dialogo conversacional, pese a que la arquitectura interna se denomine `IndonesianChatLM`. Con una ventana de contexto de solo 2.048 tokens y un vocabulario de 32.000 tokens Byte-Level BPE, esta disenado como una base de preentrenamiento ligera y no como un asistente listo para produccion.

Su relevancia es fundamentalmente academica y de investigacion: demuestra que es posible entrenar un MoE disperso de escala pequena (2,10 mil millones de tokens de indonesio en 42.763 pasos, con un pico de 53.506 tokens por segundo) sobre tres datasets publicos de Wikipedia y corpus indonesios. No obstante, la ausencia de licencia explicita y de benchmarks publicos limita seriamente su uso fuera de entornos experimentales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `IndonesianChatLM` Sparse MoE (transformer decoder-only con MoE disperso) |
| Parametros totales | 400.098.816 (400,1 M) |
| Parametros activos | 187.761.664 (187,8 M, ~46,9 % activos por token) |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantizacion | no disponible (pesos publicados en bfloat16; no se documentan variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | Indonesio (`id`) |
| Licencia | no disponible |
| Formato de pesos | SafeTensors (`bfloat16`) |
| Capas | 32 (`32L`) |
| Dimension del modelo | 1.024 (`d=1024`) |
| Atencion | GQA con 16 cabezas de query y 4 de key/value (`16Q/4KV`) |
| Enrutamiento MoE | top-2 sobre 8 expertos enrutados (`8` routed experts), `moe_intermediate_size=360` |
| Activacion | SwiGLU |
| Posicional | RoPE |
| Vocabulario | 32.000 tokens Byte-Level BPE (`<pad>=0`, `<bos>=1`, `<eos>=2`, `<unk>=3`) |
| Precision de entrenamiento | bfloat16 |
| Tamano del repositorio | 0,8 GB |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only con atencion de grupo (GQA, 16 cabezas de query y 4 de key/value) y 32 capas de dimension 1.024. La innovacion principal es la capa de mezcla de expertos dispersa: 8 expertos enrutados con enrutamiento top-2 y un tamano intermedio de experto de 360, lo que da lugar a 400,1 M de parametros totales pero solo 187,8 M activos por token. Emplea SwiGLU como activacion y RoPE para la codificacion posicional.

El preentrenamiento se realizo desde cero sobre 2,10 mil millones de tokens de indonesio en 42.763 pasos, con un throughput pico de 53.506 tokens por segundo. Los datasets utilizados son `derhan/indonesian-wikipedia-20250120`, `meaecosystem/pustaka` y `ffatty/plaintext-wikipedia-full-indonesian`, es decir, principalmente Wikipedia y corpus textual indonesios. No se documenta en la informacion disponible el uso de RLHF, DPO, SFT ni tecnicas de decodificacion especulativa. Las metricas finales de validacion son `val_loss=2.6243` y `val_ppl=13.79`. El formato de prompt es completion de texto crudo, opcionalmente iniciado con el token `<bos>` (id 1).

## Capacidades

- Generacion de texto en indonesio mediante completion de texto crudo (no instruccional).
- Modelado de lenguaje base: predice la continuacion de un fragmento de texto indonesio.
- Capacidad de razonamiento y codigo: no disponible (no se documenta ni se evalua).
- Tool calling / function calling: no soportado de forma nativa.
- Soporte de agentes y razonamiento multi-paso: no soportado.
- Capacidades multilingues: limitadas al indonesio; no se documenta entrenamiento en otros idiomas.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.
- Ventana de contexto de 2.048 tokens, adecuada solo para fragmentos cortos.

## Casos de uso

- Investigacion academica sobre MoE dispersos: el modelo sirve como banco de pruebas reproducible para estudiar el equilibrio entre parametros totales y activos en un transformer pequeno, dado que documenta configuracion, pasos y metricas de validacion.
- Generacion de texto indonesio de dominio general: puede completar parrafos sobre temas enciclopedicos (Wikipedia) en tareas de continuacion de texto, aunque sin control instruccional.
- Experimentos de eficiencia computacional: con 187,8 M de parametros activos por token, permite medir el coste real de inferencia frente a un denso de 400 M en GPUs modestas.
- Fine-tuning de dominio especifico: al ser un modelo base, puede servir de punto de partida para ajuste supervisado en tareas indonesias concretas (clasificacion, resumen, extraccion), siempre que se resuelva la licencia.
- Evaluacion de tecnicas de enrutamiento: util para comparar estrategias de routing top-k y su impacto en perplejidad sobre corpus indonesios.
- Docencia y formacion: ejemplo didactico completo de pipeline de preentrenamiento (datasets, tokenizador, configuracion MoE y metricas) para cursos de IA generativa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. Las unicas metricas publicadas son las de validacion del preentrenamiento:

| Metrica | Valor |
|---|---|
| `val_loss` | 2,6243 |
| `val_ppl` | 13,79 |
| Throughput pico de entrenamiento | 53.506 tok/s |
| Pasos de entrenamiento | 42.763 |
| Tokens de entrenamiento | 2,10 mil millones |

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 0,8 GB solo para pesos (400 M de parametros x 2 bytes), mas overhead de activaciones y cache KV; en la practica, menos de 2 GB.
- En cuantizacion de 8 bits: ~0,4 GB de pesos; en 4 bits: ~0,2 GB de pesos (no se distribuyen variantes cuantizadas oficiales, habria que generarlas).
- GPU recomendadas: cualquier GPU consumer moderna con 4 GB o mas de VRAM (RTX 3060, RTX 4060, RTX 4090) es suficiente; tambien cabe en CPU.
- Cabe en GPU consumer: si, en practicamente cualquier GPU dedicada de los ultimos anos, e incluso en iGPU con suficiente memoria compartida.
- Opciones de despliegue: `transformers` (PyTorch, formato nativo SafeTensors); llama.cpp/Ollama requeririan conversion a GGUF no documentada por el autor; vLLM y TGI no estan validados en la informacion disponible.
- Latencia y throughput estimados: no disponibles para inferencia; solo se publica el throughput de entrenamiento (53.506 tok/s).

## Comparativa con modelos similares

No se dispone de benchmarks publicos que permitan una comparacion cuantitativa fiable. A continuacion se comparan caracteristicas estructurales con alternativas de escala y proposito similares:

| Modelo | Parametros totales / activos | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Liwet-400M-A188M-id-base | 400,1 M / 187,8 M (MoE top-2, 8 expertos) | 2.048 | Indonesio | no disponible | SafeTensors (bf16) |
| Modelos densos de ~400 M (p. ej. variantes tipo GPT-2/Pythia de escala similar) | ~400 M / 400 M | variable (1.024-2.048) | Ingles mayoritariamente | variable | SafeTensors / GGUF |
| MoE pequenos de investigacion (~8 expertos) | variable | variable | variable | variable | variable |

La comparativa cuantitativa de rendimiento con alternativas concretas no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Licencia no especificada: no hay licencia declarada, lo que impide determinar si el uso comercial esta permitido; en la practica, debe tratarse como no apto para produccion hasta que el autor la aclare.
- Modelo base sin ajuste instruccional: no sigue instrucciones ni mantiene dialogos; solo completa texto.
- Contexto muy limitado (2.048 tokens): insuficiente para documentos largos, conversaciones multi-turno o RAG con contexto extenso.
- Entrenamiento limitado (2,10 mil millones de tokens): corpus pequeno que aumenta el riesgo de alucinacion y de conocimiento factual incompleto.
- Sesgos: al entrenarse principalmente sobre Wikipedia indonesia, hereda los sesgos de cobertura y sesgo editorial de esas fuentes; no se documenta ninguna mitigacion.
- Monolingue: no se garantiza ningun rendimiento fuera del indonesio.
- Sin benchmarks: no hay evidencia publica de calidad en tareas estandar, por lo que cualquier uso en produccion requeriria evaluacion propia.
- Origen academico: proyecto de asignatura de pregrado, sin mantenimiento ni soporte documentado; las descargas y likes son cero en el momento de la consulta.
- Sin variantes cuantizadas oficiales: el despliegue eficiente en llama.cpp/Ollama requeriria conversion propia no validada por el autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/fadhilahkhairogi/Liwet-400M-A188M-id-base
- Dataset `derhan/indonesian-wikipedia-20250120`: https://huggingface.co/datasets/derhan/indonesian-wikipedia-20250120
- Dataset `meaecosystem/pustaka`: https://huggingface.co/datasets/meaecosystem/pustaka
- Dataset `ffatty/plaintext-wikipedia-full-indonesian`: https://huggingface.co/datasets/ffatty/plaintext-wikipedia-full-indonesian
