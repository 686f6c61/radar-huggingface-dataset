# ray0rf1re/HyperNix.3-mini

## Resumen

HyperNix.3-mini es un modelo de lenguaje decoder-only de 48,7 millones de parametros, preentrenado desde cero por el desarrollador independiente ray0rf1re sobre 873,66 millones de tokens (aproximadamente 17,9 tokens por parametro) del dataset HuggingFaceFW/fineweb-edu. El modelo emplea una arquitectura propia denominada `hyperNix0x-v2`, con 8 capas, dimension de modelo 512, atencion de consultas agrupadas (GQA) en proporcion 4:1, SwiGLU y RMSNorm. El vocabulario de 32.000 tokens es un BPE a nivel de byte entrenado desde cero sobre el mismo corpus, sin reutilizar tokenizadores de terceros.

El aspecto mas destacable del proyecto es el proceso de entrenamiento: se realizo integramente en una unica NVIDIA GTX 1080 (arquitectura Pascal, sin soporte bf16) durante 12 dias y 3 horas, con un coste computacional estimado de 2,55e17 FLOPs y pesos finales en fp32. No hubo destilacion ni ajuste fino sobre checkpoints ajenos. El resultado es un artefacto reproducible y honesto de preentrenamiento a pequena escala, pensado para hardware de consumo.

Se trata explicitamente de un modelo base: completa texto, pero no ha recibido ajuste por instrucciones, RLHF ni alineamiento. A 48,7M de parametros y 0,87B de tokens, sus resultados en tareas de conocimiento y sentido comun quedan proximos a la linea base aleatoria, algo que el propio autor reconoce en la model card. Existe una version posterior, Compactbot/hypernix-3.1-mini, que continua el preentrenamiento y aplica SFT sobre esta base tras varios intentos fallidos de ajuste directo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `hyperNix0x-v2` (transformer decoder-only: RMSNorm pre-norm, RoPE, GQA 8/2, SwiGLU, embeddings atados) |
| Parametros totales | 48.706.048 (48,7M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | no disponible (pesos publicados en fp32; el repositorio no documenta variantes GGUF, int8 ni int4) |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (`model.pt`, fp32) y safetensors; libreria `hypernix` |
| Capas | 8 |
| Dimension de modelo | 512 |
| Dimension FFN | 2203 (SwiGLU) |
| Cabezas de atencion | 8 query / 2 key-value (GQA 4:1) |
| Dimension por cabeza | 64 |
| RoPE theta | 100.000 |
| Normalizacion | RMSNorm, eps 1e-05 |
| Embeddings atados | si (34% de los parametros corresponden a la matriz de embeddings) |
| Vocabulario | 32.000 tokens, BPE byte-level entrenado desde cero |
| Tokens de entrenamiento | 873.660.416 (~17,9 tokens/parametro) |
| Precision de entrenamiento | fp32 (Pascal no soporta bf16 y ejecuta GEMM fp16 a 1/64 de velocidad) |
| Hardware de entrenamiento | 1x NVIDIA GTX 1080 |
| Tiempo de entrenamiento | 12 dias 3 horas |
| Computo de entrenamiento | ~2,55e17 FLOPs |
| Tamano del repositorio | 0,4 GB |
| Dataset | HuggingFaceFW/fineweb-edu |

## Arquitectura y entrenamiento

`hyperNix0x-v2` es un transformer decoder-only convencional en su diseno pero ajustado para hardware Pascal: normalizacion RMSNorm en configuracion pre-norm, embeddings posicionales rotatorios (RoPE) con theta 100.000, atencion de consultas agrupadas con 8 cabezas de consulta y 2 de clave-valor (dimension de cabeza 64), y bloque feed-forward SwiGLU con dimension intermedia 2203. La matriz de embeddings de entrada esta atada a la cabeza de salida, lo que concentra el 34% de los parametros totales en el vocabulario. El modelo se entreno con `use_sliding_window=false`; la model card advierte que la version de `hypernix.training.brewer` contra la que se entreno combina las mascaras causal y de ventana deslizante con `torch.maximum`, lo que en mascaras aditivas conserva la menos enmascarada y permite a las consultas de las capas impares ver hasta `sliding_window_size - 1` tokens de su propio futuro. El script de entrenamiento del repositorio incluye un forward de atencion corregido y desactiva SWA por defecto.

El preentrenamiento consumio 873.660.416 tokens de fineweb-edu en una sola pasada aproximada de 17,9 tokens por parametro, con optimizador `pcv6` (betas 0,9/0,95). No se aplico destilacion, RLHF, DPO ni ajuste fino sobre pesos de terceros: el modelo se inicializo aleatoriamente y el vocabulario BPE de 32.000 tokens se entreno desde cero sobre el mismo corpus. La precision fp32 responde a las limitaciones de la GTX 1080, que no dispone de bf16 y ejecuta operaciones GEMM en fp16 a 1/64 de la tasa fp32. Segun la model card, el ajuste por instrucciones sobre esta base fallo tres veces en la version 3.1 debido a que los priors de eleccion multiple y eco son demasiado fuertes para 48M de parametros a esa escala de datos, lo que llevo a optar por continuar el preentrenamiento antes de aplicar SFT.

## Capacidades

- Generacion de texto autoregresiva y completado de texto en ingles, con decodificacion token a token sobre un contexto maximo de 512 tokens.
- Modelado de lenguaje base: calculo de probabilidades del siguiente token y perplexity utilizable para evaluacion.
- Vocabulario propio de 32.000 tokens entrenado desde cero, sin dependencia de tokenizadores de terceros.
- Entrenamiento y ejecucion reproducibles en una unica GPU de consumo (GTX 1080), lo que facilita experimentos de investigacion a pequena escala.
- No dispone de soporte de tool calling ni de function calling.
- No dispone de capacidades de agente ni de razonamiento multi-paso.
- No dispone de modo thinking, vision, audio ni otras modalidades.
- No dispone de ajuste por instrucciones, dialogo multi-turno ni alineamiento; no responde de forma fiable a preguntas.
- Multilingue: no disponible; el modelo esta entrenado y etiquetado unicamente para ingles.

## Casos de uso

- Investigacion educativa sobre preentrenamiento: el modelo permite reproducir de principio a fin un pipeline de entrenamiento (tokenizador incluido) en una GTX 1080, sirviendo como material didactico para estudiar dinamicas de entrenamiento a escala de 48M de parametros.
- Experimentos de arquitectura a pequena escala: al ser codigo y pesos abiertos con licencia Apache 2.0, resulta util para probar variantes de atencion, normalizacion o FFN con ciclos de entrenamiento de dias en lugar de semanas.
- Generacion de texto de relleno y prototipado: el modelo completa texto en ingles con 512 tokens de contexto, suficiente para demos de interfaz, pruebas de integracion de pipelines de inferencia o validacion de servidores de generacion antes de escalar a modelos mayores.
- Evaluacion de harnesses y tooling: la model card incluye un script de benchmark sobre lm-evaluation-harness v0.4.13, por lo que el modelo sirve como caso de prueba para validar configuraciones de evaluacion, medicion de perplexity y comparaciones con lineas base aleatorias.
- Estudio de tecnicas de continuacion de preentrenamiento y SFT: la version 3.1 documenta que el SFT directo fallo tres veces por priors de eleccion multiple y eco, lo que convierte esta base en un punto de partida documentado para investigar estrategias de ajuste en modelos muy pequenos.
- Inferencia en hardware muy limitado: con 0,19 GB de pesos fp32, el modelo puede ejecutarse en CPU o en GPUs de gama baja para tareas de generacion no criticas, como autocompletado experimental o generacion de datos sinteticos de baja calidad para pruebas de infraestructura.
- Analisis de sesgos y comportamiento de modelos base: al no estar alineado, permite estudiar el comportamiento crudo de un modelo preentrenado sobre fineweb-edu sin capas de instruccion que lo enmascaren.

## Benchmarks y rendimiento

Los resultados proceden de una evaluacion parcial con `--limit 500` (500 documentos por tarea) ejecutada con lm-evaluation-harness v0.4.13 el 2026-09-25 sobre una GTX 1080. Las tareas de eleccion multiple reportan precision normalizada por longitud (`acc_norm`), winogrande y lambada reportan `acc`, y wikitext reporta perplexity a nivel de palabra. La model card no incluye cifras numericas para las tareas distintas de wikitext: la columna del modelo aparece como "—".

| Tarea (0-shot) | HyperNix.3-mini | Linea base aleatoria |
|---|---|---|
| hellaswag | no disponible | 25 |
| arc_easy | no disponible | 25 |
| arc_challenge | no disponible | 25 |
| piqa | no disponible | 50 |
| winogrande | no disponible | 50 |
| openbookqa | no disponible | 25 |
| lambada_openai | no disponible | no disponible |
| wikitext (perplexity, menor es mejor) | 13503,4 | no disponible |

| Huella | HyperNix.3-mini |
|---|---|
| Parametros | 48,7M |
| Pesos en fp32 | 0,19 GB |
| VRAM pico, decodificacion de 1 stream | no disponible |
| Tokens por segundo en decodificacion | no disponible |

El autor indica explicitamente que, en tareas de conocimiento y sentido comun, el modelo no es competitivo con las lineas base mas pequenas y que puntuaciones cercanas a la linea base aleatoria en los conjuntos de eleccion multiple mas dificiles son el resultado esperado a 48,7M de parametros y 0,87B de tokens. Los resultados completos por tarea y los errores estandar estan en `bench_results.json` del repositorio.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,19 GB solo para los pesos en fp32; con activaciones y overhead de runtime, cabe holgadamente en cualquier GPU con 1 GB o mas de memoria. No se documenta VRAM pico medida.
- GPU recomendadas: cualquier GPU NVIDIA con al menos 1 GB de VRAM; el modelo fue entrenado en una GTX 1080 (Pascal) y puede ejecutarse en tarjetas de gama baja como GTX 1050, GTX 1650 o equivalentes. Para entrenamiento, la referencia es una unica GTX 1080.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo moderna, y tambien en CPU para inferencia.
- Opciones de despliegue: libreria nativa `hypernix` (`preheat_brewed`), PyTorch plano con `transformers.AutoTokenizer` y `hypernix.training.brewer`, y lm-evaluation-harness para evaluacion. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, ni pesos GGUF publicados.
- Latencia y throughput: no disponibles; la model card deja las celdas de VRAM pico y tokens por segundo sin cumplimentar.
- Nota de despliegue: cargar el modelo con `use_sliding_window=false`, tal como se entreno, para evitar el bug de mascaras descrito en la model card.

## Comparativa con modelos similares

No se dispone de datos de benchmarks comparativos publicados en la informacion proporcionada para establecer una comparativa cifrada con alternativas de la misma categoria. A continuacion se comparan unicamente caracteristicas estructurales verificables.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| HyperNix.3-mini | 48,7M | 512 | Apache 2.0 | Hugging Face (`ray0rf1re/HyperNix.3-mini`) | Base, preentrenado desde cero en 1x GTX 1080, vocabulario propio de 32.000 tokens |
| Compactbot/hypernix-3.1-mini | no disponible | no disponible | no disponible | Hugging Face (`Compactbot/hypernix-3.1-mini`) | Continuacion de preentrenamiento de esta base mas SFT de identidad; el SFT directo fallo tres veces |
| Alternativas de ~50M parametros (p. ej. GPT-2 small, Pythia-70M) | 50-70M aprox. | 1024-2048 aprox. | segun modelo | segun modelo | No se han ejecutado comparaciones locales en la informacion disponible; los datos de parametros y contexto de estas alternativas no proceden de la fuente proporcionada y deben verificarse en sus model cards |

## Limitaciones y advertencias

- Es un modelo base sin alineamiento: no sigue instrucciones, no mantiene dialogos coherentes y no responde de forma fiable a preguntas, tal como advierte el autor.
- Rendimiento muy limitado: con 48,7M de parametros y 0,87B de tokens, los resultados en tareas de conocimiento y sentido comun estan cerca de la linea base aleatoria; perplexity de 13503,4 en wikitext.
- Riesgo elevado de alucinacion y de texto incoherente, especialmente fuera de distribuciones similares a fineweb-edu.
- Contexto muy corto (512 tokens), lo que limita tareas que requieran contexto largo o conversaciones multi-turno extensas.
- Solo ingles; no hay soporte multilingue documentado.
- Bug conocido de atencion con ventana deslizante en la libreria de entrenamiento original: si se activa SWA, las consultas de capas impares pueden atender hasta `sliding_window_size - 1` tokens futuros. Cargar siempre con `use_sliding_window=false`.
- Evaluacion parcial: los benchmarks usan `--limit 500` por tarea y deben tratarse como indicativos, no como resultados sobre conjuntos completos.
- Sesgos: no se documentan sesgos conocidos en la informacion disponible; al entrenarse sobre fineweb-edu, hereda los sesgos de ese corpus, pero no se han publicado analisis especificos.
- Licencia Apache 2.0: permite uso comercial y modificacion con atribucion, pero el modelo no ofrece garantias de calidad para produccion.
- La model card esta marcada con `new_version: Compactbot/hypernix-3.1-mini`; conviene evaluar esa version si se busca un modelo con SFT.
- No hay pesos cuantizados publicados ni integraciones con runtimes de inferencia de alto rendimiento, lo que limita su uso en despliegues optimizados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ray0rf1re/HyperNix.3-mini
- Version posterior (continuacion de preentrenamiento y SFT): https://huggingface.co/Compactbot/hypernix-3.1-mini
- Dataset de entrenamiento: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- lm-evaluation-harness: https://github.com/EleutherAI/lm-evaluation-harness
- Script de benchmark del repositorio: `bench_hypernix3_mini.py` (incluido en el repositorio del modelo)
- Resultados completos de evaluacion: `bench_results.json` (incluido en el repositorio del modelo)
