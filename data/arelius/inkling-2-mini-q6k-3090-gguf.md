# arelius/Inkling-2-Mini-Q6K-3090-GGUF

## Resumen

Inkling-2-Mini-Q6K-3090-GGUF es una cuantizacion de alta calidad, orientada a preservar la fidelidad del modelo original, del modelo base thinkingmachines/Inkling-2-Mini, desarrollado por Thinking Machines Lab. Se trata de un modelo de lenguaje de tipo Mixture of Experts (MoE) con 26.070.385.152 parametros totales y aproximadamente 3.400 millones de parametros activos por token, construido sobre un nucleo con paso recurrente (looped core) de 48 pasadas de capa. El autor de esta cuantizacion es arelius, que la publica bajo licencia Apache-2.0, la misma del modelo base.

El objetivo de esta version concreta no es reducir el modelo al minimo, sino ofrecer una calidad casi identica a la del checkpoint original manteniendo la viabilidad de ejecucion en una unica GPU de consumo, en concreto una NVIDIA RTX 3090. Segun la model card, la perplejidad de prefill de esta build (2,9404) coincide con la de la conversion de 4 bits publicada por ggml-org (2,9401) dentro del margen de ruido, mientras que la decodificacion alcanza unos 159 tok/s en contexto vacio y 152,4 tok/s servida con respuestas de 700 tokens.

Es relevante ahora porque demuestra que un MoE de 26B con nucleo recurrente puede desplegarse en hardware de gama alta de consumo con una perdida de calidad practicamente nula respecto a cuantizaciones mas agresivas, y porque incluye un fork especifico de llama.cpp con optimizaciones de segmentacion y especializacion de tensores que hacen viable ese rendimiento. El repositorio ocupa 17,4 GB y el archivo GGUF principal pesa 16,2 GiB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE) con nucleo recurrente (looped core) de 48 pasadas de capa |
| Parametros totales | 26.070.385.152 (26,4B) |
| Parametros activos | 3,4B |
| Longitud de contexto | 32.768 tokens por defecto en el servidor incluido; ampliable a 49.152 con `--ctx 49152` |
| Tipos de cuantizacion | GGUF mixta: expertos enrutados capas 0-19 en IQ4_NL, capas 20-23 en Q8_0, proyecciones de atencion y cabeza de salida en Q6_K, embeddings en Q8_0, normas/router/controladores de bucle/sesgos en F32 (controladores convertidos a F16 en carga con `LLAMA_INKLING_CTRL_F16=1`) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (archivo unico `Inkling-2-Mini-Q6K-dense.gguf`, 16,2 GiB) |

## Arquitectura y entrenamiento

El modelo base es un transformer de tipo Mixture of Experts con 26,4B de parametros totales y 3,4B activos por token, sobre un nucleo recurrente que ejecuta 48 pasadas de capa. Esta estructura de bucle implica que cada pasada relee la cache de atencion, lo que explica el comportamiento de degradacion progresiva del throughput a medida que se llena el contexto. La cuantizacion aqui presentada no modifica los expertos enrutados de las capas 0 a 19 (se mantienen en IQ4_NL tal como los publico ggml-org) ni los de las capas 20 a 23 (Q8_0); solo se recuantizan las proyecciones densas y la cabeza de salida, que pasan de Q8_0 a Q6_K. El token embedding se mantiene en Q8_0 y los tensores de normas, router, controladores de bucle y sesgos permanecen en F32.

No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO en el modelo base. La model card de esta cuantizacion no detalla esos aspectos y se limita a describir el proceso de recuantizacion y las mediciones de rendimiento. La innovacion tecnica destacable de esta build es el fork de llama.cpp (rama `inkling-3090`) que incorpora segmentacion de tensores Q6_K e IQ4_NL (`IK_SEGMENTED_Q6`, `IK_SEGMENTED_IQ4`), especializacion mixta (`IK_MIX_SPECIALIZE`), procesamiento por lotes de mensajes (`IK_BATCH_MESSAGES`) y conversion de los controladores de bucle a F16 en carga (`LLAMA_INKLING_CTRL_F16`). El autor indica que tres pruebas greedy de 200 tokens coinciden byte a byte con un checkpoint anterior mas lento de los mismos pesos, lo que sugiere que las optimizaciones de velocidad no alteran las salidas.

## Capacidades

- Generacion de texto conversacional y continuacion de texto, con pipeline declarado como `text-generation`.
- Razonamiento multi-paso apoyado en el nucleo recurrente de 48 pasadas de capa.
- Procesamiento de contexto largo: 32.768 tokens por defecto, ampliable a 49.152 en una RTX 3090 dedicada.
- Compatibilidad con API OpenAI a traves del servidor incluido en el fork de llama.cpp (`/v1`, id de modelo `inkling-mini`).
- Capacidad de servir multiples peticiones con `--backend-sampling` y `-np 1`.
- Soporte de decodificacion con temperatura 0 (greedy) y temperatura 0,7, con rendimiento medido en ambos casos (152,4 y 152,1 tok/s respectivamente).
- Modelo exclusivamente de texto: no incluye proyector de vision.
- No se dispone de informacion sobre soporte de tool calling, function calling, capacidades de agente, audio ni modo thinking explicito en la informacion proporcionada.
- Idiomas soportados: no disponible.

## Casos de uso

- Asistente conversacional local en una unica RTX 3090: el modelo puede servir una API compatible con OpenAI en `127.0.0.1:8031/v1` con 32K de contexto, adecuado para prototipos y entornos de desarrollo donde no se quiere depender de la nube. La calidad casi identica al checkpoint de 4 bits lo hace valido para evaluar el comportamiento real del modelo base.
- Generacion de texto de alta fidelidad en investigacion: al mantener la perplejidad de prefill en 2,9404 frente a 2,9401 del original, sirve para reproducir experimentos del modelo base sin disponer de la GPU de datacenter necesaria para los pesos completos.
- Procesamiento de documentos largos: con 32K tokens de contexto y la opcion de 49.152, permite resumir o extraer informacion de articulos, informes o transcripciones extensas en una sola pasada, aunque con latencia creciente a medida que se llena la ventana.
- Servicio de chat con respuestas largas: el rendimiento medido con respuestas de 700 tokens (152,4 tok/s) lo hace util para asistentes que generan parrafos extensos, como redaccion de correos, explicaciones tecnicas o borradores de documentacion.
- Evaluacion comparativa de cuantizaciones: al ser el hermano de mayor calidad del build de 2 bits del mismo autor, permite medir el impacto real de la cuantizacion en tareas concretas (el build de 2 bits rinde a unos 200 tok/s con un 3-4% mas de perplejidad).
- Despliegue en estaciones de trabajo con una sola GPU: integrable mediante `uvx` sin necesidad de toolkit CUDA ni compilacion, lo que facilita entornos reproducibles para equipos de desarrollo que trabajan con Linux, glibc >= 2.38 y driver NVIDIA >= 570.
- Base para experimentacion con el fork de llama.cpp: los flags de segmentacion y especializacion permiten a investigadores medir el efecto de distintas estrategias de cuantizacion mixta sobre el mismo modelo.

## Benchmarks y rendimiento

Los datos disponibles son mediciones de rendimiento y perplejidad realizadas por el autor en una unica RTX 3090, no resultados de benchmarks academicos estandar (MMLU, HumanEval, GSM8K, etc.). No se han publicado resultados de benchmarks en la informacion disponible para esas tareas.

| Modelo | Decode tok/s (contexto vacio) | a 512 | a 1K | Servido (respuestas de 700 tokens) | PPL prefill | PPL decode |
|---|---:|---:|---:|---:|---:|---:|
| ggml-org IQ4_NL, referencia sin fusionar | — | — | — | — | 2,9401 | 4,0660 |
| **Esta build (Q6K-3090)** | **159,3** | 153,9 | 150,3 | **152,4** (T=0) / 152,1 (T=0,7) | 2,9404 | 4,0640 |
| Build de 2 bits, comparacion | 208,7 | — | 193,2 | 202,2 | 3,0530 | 4,1945 |

Las perplejidades se calculan con el texto fijo del fork (`perf/ppl.txt`): 8x2048 tokens para prefill y 2x1024 tokens con ubatch 1 para decode.

## Requisitos de hardware

- VRAM estimada: el archivo GGUF pesa 16,2 GiB y el repositorio 17,4 GB; con 32K de contexto y cache KV en q8_0 (`-ctk q8_0 -ctv q8_0`) cabe en una RTX 3090 de 24 GB. Para 49.152 tokens de contexto se requiere una GPU sin otra carga.
- GPU recomendadas: NVIDIA RTX 3090 (validada por el autor, arquitectura CUDA 86). No se han publicado mediciones en A100, H100, RTX 4090 ni otras GPU.
- Cabe en GPU de consumo: si, al menos en RTX 3090. No hay datos para GPUs con menos de 24 GB de VRAM.
- Opciones de despliegue: fork de llama.cpp del autor (rama `inkling-3090`, release `inkling-3090-v1`), con servidor compatible con OpenAI; despliegue en un comando mediante `uvx --from "git+https://github.com/csaben/llama.cpp@inkling-3090-v1.1#subdirectory=tools/inkling-3090" inkling-3090 --quality`. Tambien compilable manualmente con CMake y `-DGGML_CUDA=ON -DCMAKE_CUDA_ARCHITECTURES=86`. No se mencionan vLLM, TGI, Ollama ni otras herramientas en la informacion disponible.
- Requisitos de entorno: Linux, glibc >= 2.38, driver NVIDIA >= 570, `uv` instalado (solo para el despliegue en un comando).
- Latencia y throughput: 159,3 tok/s en contexto vacio, 153,9 tok/s a 512 tokens, 150,3 tok/s a 1K y 152,4 tok/s servido con respuestas de 700 tokens. El rendimiento decae con el contexto porque cada una de las 48 pasadas de capa relee la cache de atencion.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Formato | Rendimiento medido |
|---|---|---|---|---|---|---|
| **Inkling-2-Mini-Q6K-3090 (esta build)** | 26,4B | 3,4B | 32K (hasta 49K) | Apache-2.0 | GGUF | 159,3 tok/s, PPL 2,9404 |
| Inkling-2-Mini-Q2-3090 (mismo autor) | 26,4B | 3,4B | no disponible | Apache-2.0 | GGUF | 208,7 tok/s, PPL 3,0530 |
| ggml-org Inkling-2-Mini-IQ4_NL | 26,4B | 3,4B | no disponible | Apache-2.0 | GGUF | sin datos de tok/s, PPL 2,9401 |
| thinkingmachines/Inkling-2-Mini (base) | 26,4B | 3,4B | no disponible | Apache-2.0 | safetensors | sin datos de tok/s |

Las tres alternativas comparten el mismo modelo base y difieren en el esquema de cuantizacion. La build de 2 bits del mismo autor ofrece mayor velocidad (208,7 tok/s) a costa de un 3-4% mas de perplejidad, mientras que la referencia IQ4_NL de ggml-org iguala en calidad a esta build pero sin las optimizaciones de velocidad del fork. No se dispone de comparaciones con modelos de otras familias en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo exclusivamente de texto: no incluye proyector de vision ni soporte multimodal.
- Idiomas soportados no documentados: no se puede garantizar calidad en castellano ni en otros idiomas distintos del ingles sin evaluacion previa.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; como todo modelo generativo, requiere verificacion en produccion.
- Sesgos conocidos: no documentados en la model card.
- Degradacion de rendimiento con el contexto: el throughput cae de 159,3 tok/s en vacio a 150,3 tok/s a 1K tokens, y el autor advierte que todos los builds de este modelo se ralentizan a medida que se llena la ventana por las 48 pasadas de capa.
- Limitacion de contexto practica: 32K por defecto en una RTX 3090 con cache KV en q8_0; 49K solo si la GPU esta dedicada en exclusiva al modelo.
- Dependencia de un fork no oficial de llama.cpp: el despliegue optimizado requiere la rama `inkling-3090` del repositorio de csaben, no la version upstream de ggml-org, lo que implica riesgo de mantenimiento y de divergencia futura.
- Requisitos de entorno estrictos: Linux, glibc >= 2.38 y driver NVIDIA >= 570 para el despliegue en un comando.
- Licencia Apache-2.0: permite uso comercial, pero al ser una cuantizacion derivada conviene conservar los avisos de atribucion del modelo base y de ggml-org.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay validacion externa de la comunidad sobre esta build concreta.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/arelius/Inkling-2-Mini-Q6K-3090-GGUF
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Anuncio del modelo base: https://thinkingmachines.ai/news/inkling-2-mini/
- GGUF de origen (ggml-org): https://huggingface.co/ggml-org/Inkling-2-Mini-GGUF
- Build de 2 bits del mismo autor: https://huggingface.co/arelius/Inkling-2-Mini-Q2-3090-GGUF
- Fork de llama.cpp (rama `inkling-3090`): https://github.com/csaben/llama.cpp/tree/inkling-3090
- Resultados de rendimiento del fork: https://github.com/csaben/llama.cpp/blob/inkling-3090/perf/RESULTS.md
- Release del servidor precompilado: https://github.com/csaben/llama.cpp/releases/tag/inkling-3090-v1
- llama.cpp upstream: https://github.com/ggml-org/llama.cpp
