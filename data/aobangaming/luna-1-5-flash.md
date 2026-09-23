# Aobangaming/luna-1.5-flash

## Resumen

Luna 1.5 Flash es un transformer autorregresivo de tipo decoder-only con 43.191.808 parámetros (unos 43,2 M), publicado por el desarrollador Aobangaming (AobanZ, https://aobanweb.com). Está derivado de los modelos Aobangaming/lightning-30m-ft y Aobangaming/lightning-60m y ha sido ajustado sobre un subconjunto del dataset OpenAssistant/oasst1, con el objetivo declarado de ofrecer conversación de tipo chat en hardware muy limitado (móviles u ordenadores de oficina).

Arquitecturalmente es un transformer causal convencional de 6 capas, 256 dimensiones ocultas y 4 cabezas de atención de 64 dimensiones cada una, con pre-normalización de capa, atención causal escalada, red feed-forward GELU con expansión 4x, codificación posicional sinusoidal y embeddings de entrada/salida no compartidos. El vocabulario es de unos 75.003 tokens y la longitud de secuencia indicada es de 200 tokens, una ventana de contexto muy reducida incluso para su categoría.

Su relevancia es fundamentalmente experimental: es un ejemplo extremo de modelo conversacional entrenado en una única GPU consumer (RTX 3050 de 6 GB) en aproximadamente 3 horas, con licencia MIT y muy bajo coste de inferencia. En el momento de redactar esta ficha acumula 0 descargas y 1 "like" en HuggingFace, por lo que no existe validación independiente de su calidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal decoder-only; 6 capas, D_MODEL 256, 4 cabezas de atencion (64 dim/cabeza), pre-LN, FFN GELU con expansion 4x, codificacion posicional sinusoidal, embeddings de entrada/salida no compartidos |
| Parametros totales | 43.191.808 (~43,2 M), segun los pesos en safetensors |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 200 tokens (longitud de secuencia indicada en la model card) |
| Tipos de cuantizacion | No disponible; no se publican versiones GGUF, AWQ, GPTQ ni cuantizadas |
| Idiomas soportados | Ingles (en) |
| Licencia | MIT |
| Formato de pesos | safetensors, con codigo de modelado personalizado (modeling_lightning.py) y tokenizer propio (luna_tokenizer.json) |
| Vocabulario | ~75.003 tokens |
| Modelos base | Aobangaming/lightning-30m-ft (fine-tune) y Aobangaming/lightning-60m |
| Dataset de entrenamiento | Subconjunto de OpenAssistant/oasst1 |
| Tamano del repositorio | 0,2 GB |

## Arquitectura y entrenamiento

El modelo sigue el diseno clasico de un transformer decoder-only de escala reducida: 6 bloques con normalizacion previa a la atencion y a la FFN, atencion causal de producto escalar escalado (SDPA/FlashAttention) con 4 cabezas de 64 dimensiones, y una red feed-forward con factor de expansion 4x y activacion GELU. Usa codificacion posicional sinusoidal en lugar de RoPE o ALiBi, y no comparte los embeddings de entrada y salida, lo que concentra una parte importante del presupuesto de parametros en las dos matrices de vocabulario (75.003 x 256 cada una, aproximadamente 38,4 M de parametros de los 43,2 M totales; el resto, unos 4,7 M, corresponde a los 6 bloques). Esta distribucion implica que la mayor parte de la capacidad del modelo esta en la capa de embeddings y no en la profundidad de la red.

El entrenamiento se realizo sobre un subconjunto del dataset OpenAssistant/oasst1 (datos conversacionales en ingles), en FP32, con optimizador AdamW, learning rate 5e-4 y tamano de lote 32. La model card reporta 5 epocas con una perdida final de 3,27694 y una perplejidad de 26,49, partiendo de una perplejidad de 462,42 en la primera epoca. El autor indica que no se realizo una fase de fine-tuning adicional por problemas de memoria y que el entrenamiento completo se ejecuto en una RTX 3050 de 6 GB en unas 3 horas, con una huella estimada de ~0,17 kg de CO2 equivalente. No se documentan fases de RLHF, DPO ni otro tipo de alineacion posterior al preentrenamiento.

## Capacidades

- Generacion de texto autoregresiva en ingles, orientada a respuestas conversacionales de tipo chat.
- Mantenimiento de un historial de conversacion multi-turno a nivel de aplicacion (el ejemplo oficial gestiona `chat_history` manualmente, no mediante un mecanismo interno de memoria).
- Soporte de decodificacion configurable: `top_k`, `top_p`, `temperature` y penalizacion por repeticion (`penalty`).
- Capacidad declarada de servir como base para fine-tuning orientado a personajes de IA, agentes conversacionales y modelos de chat.
- Ejecucion en CPU y en hardware de gama baja mediante `transformers` con `trust_remote_code=True`.
- No dispone de soporte de tool calling ni function calling.
- No dispone de capacidades de agente, razonamiento multi-paso, vision, audio ni modo "thinking".
- No dispone de capacidades multilingues: esta limitado a ingles.

## Casos de uso

- Prototipado y docencia de pipelines de generacion de texto: por su tamano (43 M de parametros) y licencia MIT, es util para ensenar como se integra un modelo causal personalizado en `transformers` con `trust_remote_code=True`, sin necesidad de GPU.
- Fine-tuning de personajes conversacionales en ingles para demos: la propia model card sugiere este uso; el modelo parte ya de datos conversacionales de OASST1 y su coste de reentrenamiento en una GPU de 6 GB es de horas, lo que permite iterar rapido sobre el tono y el estilo.
- Experimentacion con estrategias de decodificacion: al ser un modelo pequeno con perplejidad alta (26,49), sirve como banco de pruebas para medir el efecto de `top_k`, `top_p`, `temperature` y penalizacion por repeticion sobre la coherencia de la salida.
- Aplicaciones de escritorio y moviles con inferencia offline: el modelo cabe con holgura en memoria (menos de 200 MB en FP32) y puede embeberse en herramientas locales donde no hay conectividad, siempre que las respuestas aceptables sean cortas y en ingles.
- Generacion de borradores y texto corto de relleno: autocompletado de frases o generacion de variaciones de una linea en ingles dentro de formularios, siempre con revision humana posterior.
- Investigacion sobre ajuste con datos de instrucciones: al derivar de OASST1, permite estudiar como un modelo de 43 M asimila datos conversacionales frente a modelos de mayor escala en el mismo corpus.
- Base de comparacion en estudios de eficiencia: es un punto de referencia util para medir latencia, consumo de memoria y coste de entrenamiento en el rango de las decenas de millones de parametros frente a alternativas mas grandes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, ARC, HellaSwag, etc.) en la informacion disponible. El unico dato de rendimiento reportado por el autor es un 15% en un benchmark propio generado por IA y no reproducible, sin especificar metrica, conjunto de evaluacion ni metodologia.

Los unicos datos cuantitativos verificables son las metricas de entrenamiento:

| Epoca | Perdida | Perplejidad |
|---|---|---|
| 1 | 6,13648 | 462,42 |
| 2 | 4,84533 | 127,15 |
| 3 | 4,17732 | 65,19 |
| 4 | 3,67652 | 39,51 |
| 5 | 3,27694 | 26,49 |

Una perplejidad de 26,49 en un corpus conversacional en ingles es un valor alto en terminos absolutos y coherente con un modelo de 43 M de parametros con una ventana de contexto de 200 tokens. No hay datos comparables publicados para este modelo frente a alternativas.

## Requisitos de hardware

- Memoria para pesos: aproximadamente 173 MB en FP32, 86 MB en FP16/BF16 y 43 MB en INT8. Son estimaciones derivadas del numero de parametros, no cifras publicadas por el autor.
- VRAM necesaria para inferencia: inferior a 1 GB incluyendo activaciones y cache KV con secuencias de 200 tokens; cabe en cualquier GPU dedicada e incluso en graficas integradas.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU moderna (RTX 3050 6 GB fue la empleada para el entrenamiento, RTX 4090, etc.), y tambien en CPU y en telefonos.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` (unico metodo documentado, ya que requiere cargar `modeling_lightning.py` y el tokenizer `luna_tokenizer.json`). No hay soporte publicado para vLLM, llama.cpp, Ollama ni TGI, al tratarse de una arquitectura personalizada sin conversion a GGUF.
- Latencia y throughput: no disponible. No se han publicado mediciones de tokens por segundo ni de latencia en ninguna plataforma.

## Comparativa con modelos similares

La comparacion es aproximada: no existen benchmarks comunes publicados para Luna 1.5 Flash, por lo que solo se contrastan caracteristicas objetivas. Los datos de los modelos alternativos corresponden a sus especificaciones publicas conocidas.

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Luna 1.5 Flash | ~43 M | 200 tokens | Ingles | MIT | HuggingFace, arquitectura personalizada con `trust_remote_code` |
| GPT-2 small | 124 M | 1.024 tokens | Ingles | MIT modificada | Ampliamente soportado (transformers, llama.cpp) |
| SmolLM2-135M | 135 M | 2.048 tokens | Ingles y multilingue parcial | Apache 2.0 | transformers, llama.cpp, ONNX |
| Qwen2.5-0.5B | 494 M | 32.768 tokens | Multilingue (29+ idiomas) | Apache 2.0 | transformers, vLLM, llama.cpp, Ollama |

Luna 1.5 Flash es el mas pequeno de la comparativa y el unico con una ventana de contexto de 200 tokens, un orden de magnitud por debajo de GPT-2 small y dos por debajo de SmolLM2-135M. Su ventaja principal es la licencia MIT sin restricciones y su huella de memoria minima; su desventaja es la ausencia de soporte en runtimes de inferencia estandar y la falta de evaluacion independiente. Comparativa de rendimiento: no disponible.

## Limitaciones y advertencias

- Ventana de contexto de 200 tokens: cualquier conversacion que supere ese limite perdera informacion; el ejemplo oficial de uso solo conserva el historial en la aplicacion, no en el modelo, por lo que el contexto efectivo es muy corto.
- Modelo unicamente en ingles, tal como declara el autor, que ademas indica que "no puede fine-tunearse para otros usos" distintos del texto conversacional en ingles.
- Riesgo elevado de alucinacion y de salidas repetitivas, incompletas o sin relacion con la entrada; la model card reconoce explicitamente que las salidas "pueden ser corruptas o incorrectas".
- Perplejidad final de 26,49 en el corpus de entrenamiento, valor alto que anticipa una calidad de generacion limitada incluso dentro de su dominio.
- Sesgos: al entrenarse sobre un subconjunto de OASST1 sin fase de alineacion (RLHF/DPO), hereda los sesgos presentes en ese corpus de anotacion voluntaria. No se han publicado analisis de sesgo.
- No debe usarse para asesoramiento profesional, escritura "real" ni cargas de trabajo intensivas, segun las propias recomendaciones del autor.
- Licencia MIT: permite uso comercial y modificacion sin restricciones de atribucion mas alla de las habituales, pero la licencia no cubre la ausencia de garantias sobre la calidad de las salidas.
- Dependencia de codigo remoto: la carga requiere `trust_remote_code=True` y la ejecucion de `modeling_lightning.py` desde el repositorio, lo que implica ejecutar codigo de un tercero en el entorno local.
- Inconsistencia en los metadatos: el repositorio declara simultaneamente como modelos base `lightning-30m-ft` (con relacion de fine-tune) y `lightning-60m`, mientras que el recuento real de parametros es de 43,19 M; no esta documentado cual es la ascendencia exacta ni el procedimiento de destilacion o ajuste entre ellos.
- Adopcion practicamente nula (0 descargas, 1 "like" en el momento de la consulta), sin issues, discusiones ni validacion de terceros.
- Fecha de publicacion poco habitual en los metadatos (septiembre de 2026), lo que conviene verificar antes de citar el modelo.
- Para produccion se recomienda encarecidamente anadir guardrails y filtros de salida, tal como sugiere el propio autor.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Aobangaming/luna-1.5-flash
- Modelo base (fine-tune): https://huggingface.co/Aobangaming/lightning-30m-ft
- Modelo base alternativo: https://huggingface.co/Aobangaming/lightning-60m
- Dataset de entrenamiento: https://huggingface.co/datasets/OpenAssistant/oasst1
- Sitio del autor: https://aobanweb.com
- Calculadora de impacto ambiental (ML CO2 Impact): https://mlco2.github.io/impact
- Paper referenciado en la model card (Lacoste et al., 2019): https://arxiv.org/abs/1910.09700
- Codigo de modelado personalizado en el repositorio: `modeling_lightning.py`
- Tokenizer en el repositorio: `luna_tokenizer.json`
