# arvedo/NVIDIA-Nemotron-3.5-Bolt-E4B-NVFP4-GGUF

## Resumen

NVIDIA-Nemotron-3.5-Bolt-E4B-NVFP4-GGUF es un paquete de pesos en formato GGUF del modelo Nemotron-3.5-Bolt-E4B de NVIDIA, publicado por el usuario arvedo en HuggingFace. Se trata de una conversión a cuantización nativa NVFP4 (FP4 E2M1 de NVIDIA Blackwell, con factores de escala FP8 y tamano de bloque 16) pensada para ejecutarse de forma eficiente sobre GPUs Blackwell (SM_120) y, por extension, sobre arquitecturas Ada y Hopper. El modelo base emplea una arquitectura derivada de Gemma 4, con un mecanismo de Per-Layer Embedding (PLE) que en su version FP16 ocupa 9,1 GB y que aqui se compacta a Q8_0 para reducir el peso total.

El paquete ocupa 6,11 GB en su parte de texto y anade un proyector multimodal opcional de 946 MB, lo que permite su despliegue completo en GPUs de consumo con 8, 12 o 16 GB de VRAM (RTX 4060 Ti 16GB, RTX 4070, RTX 5070, RTX 5080, RTX 5090). El modelo declarado tiene 7.518.069.878 parametros totales, y la model card indica que es capaz de generar texto y, con el proyector, procesar vision y audio.

La relevancia de esta publicacion radica en que demuestra que un modelo de ~7,5B de parametros puede ejecutarse en FP4 nativo sobre hardware Blackwell con una perdida de precision muy contenida: la model card reporta un 78,64% de precision compuesta frente al 79,40% del BF16, es decir, una degradacion de solo 0,76 puntos. Ademas, ofrece un rendimiento de prefill superior al de Q4_K_M en alta concurrencia (+10,6% a c=16), lo que lo hace interesante para cargas con prompts largos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer derivada de Gemma 4 (con Per-Layer Embedding, PLE) |
| Parametros totales | 7.518.069.878 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | hasta 32.768 tokens en los ejemplos de llama.cpp (`-c 32768`); no se especifica el maximo nativo del modelo base |
| Tipos de cuantizacion | NVFP4 (E2M1, bloque 16, escalas FP8) para pesos; Q8_0 para la tabla PLE |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (texto) + GGUF mmproj (proyector multimodal) |

## Arquitectura y entrenamiento

La arquitectura del modelo base es un transformer derivado de Gemma 4, segun indica la propia model card. La innovacion estructural mas relevante es el uso de una tabla de Per-Layer Embedding (PLE), un mecanismo de embedding por capa que en exportaciones FP16 ocupa 9,1 GB y que en este paquete se cuantiza a Q8_0 para compactarlo hasta 6,11 GB sin perdida observable en las representaciones lexicas, segun el autor. El modelo se distribuye con un proyector multimodal separado que habilita entrada de vision y audio.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF, DPO o similar en la informacion proporcionada. La model card se centra en el proceso de cuantizacion y en los resultados de rendimiento, no en el entrenamiento del modelo base. Cabe senalar que la ruta multimodal de llama.cpp para Gemma 4 usa actualmente un mecanismo experimental de padding por token-0 (`[TAG_GEMMA4_IMG_PADDING]`), por lo que el autor recomienda vLLM con ejecucion tensorial nativa para obtener paridad completa en vision y audio.

## Capacidades

- Generacion de texto conversacional en ingles, con soporte de razonamiento y respuesta a preguntas.
- Razonamiento matematico y resolucion de problemas, segun los benchmarks reportados (GSM8K, MATH-500, SVAMP).
- Generacion de codigo, evaluada en HumanEval y MBPP.
- Seguimiento de instrucciones, medido con IFEval e IFBench.
- Capacidades multimodales (vision y audio) mediante el proyector `mmproj` opcional; la model card cita resultados de ChartQA (52,8%), DocVQA (54,2%) y LibriSpeech (94,8%).
- Conocimiento general y cientifico evaluado en MMLU, MMLU-Pro, ARC, SciQ, OpenBookQA y HLE.
- Soporte de servidor HTTP compatible con la API de OpenAI mediante `llama-server`, lo que facilita la integracion con clientes existentes.
- No se documenta soporte explicito de tool calling, function calling ni de modo thinking en la informacion disponible.

## Casos de uso

- Asistente conversacional local en GPU de consumo: con 6,11 GB de pesos y cuantizacion NVFP4, el modelo cabe en una RTX 4060 Ti de 16 GB o una RTX 4070, permitiendo desplegar un chatbot privado sin dependencia de la nube.
- Evaluacion de prompts largos en pipelines de agentes: el prefill de 13.601 tok/s a concurrencia 16 en RTX 5090 lo hace adecuado para flujos donde se procesan documentos o historiales extensos antes de generar la respuesta.
- Procesamiento de documentos con vision: usando el proyector multimodal se pueden extraer respuestas sobre graficos (ChartQA) y documentos escaneados (DocVQA), util para digitalizacion y analisis de facturas o informes.
- Transcripcion y comprension de audio: el proyector habilita tareas de reconocimiento de voz (LibriSpeech 94,8%), aprovechable en asistentes de voz o resumen de reuniones.
- Generacion de codigo asistida en entornos con GPU unica: los resultados en HumanEval y MBPP permiten integrarlo en editores o scripts de automatizacion con un servidor `llama-server` local.
- Razonamiento matematico y tutorizacion: los benchmarks en GSM8K, MATH-500 y SVAMP respaldan su uso en herramientas educativas que resuelven problemas paso a paso.
- Despliegue en produccion ligera con API compatible OpenAI: al exponer un endpoint HTTP, puede sustituir a servicios en la nube en prototipos o entornos con requisitos de privacidad, siempre que el trafico sea moderado.

## Benchmarks y rendimiento

Precision compuesta sobre un conjunto unificado de 20.565 preguntas y 16 suites (GSM8K, MATH-500, SVAMP, IFEval, IFBench, HumanEval, MBPP, HLE, ARC, MMLU, MMLU-Pro, SciQ, OpenBookQA):

| Formato | Motor | Huella | Precision compuesta | Delta vs. BF16 |
|---|---|---|---|---|
| Nemotron-3.5-Bolt Base BF16 | vLLM / PyTorch | 8,8 GB | 79,40% | linea base |
| NVFP4-Blackwell-Rubin (autor) | vLLM (b12x nativo) | 4,8 GB | 78,64% | -0,76% |
| Nemotron-3.5-Bolt Q4_K_M | llama.cpp (GGUF) | 6,18 GB | 78,87% | -0,53% |
| Caelunshun NVFP4 | vLLM | 4,8 GB | 74,12% | -5,28% |

Rendimiento en RTX 5090 Blackwell (32 GB GDDR7, SM_120) con `llama-batched-bench`, `n_pp=1024`, `n_tg=512`, `-ngl 42 -c 32768 -b 2048 -ub 512 -fa on`:

| Concurrencia | NVFP4 total (tok/s) | NVFP4 prefill (tok/s) | NVFP4 gen (tok/s) | Q4_K_M total (tok/s) | Q4_K_M prefill (tok/s) | Q4_K_M gen (tok/s) | Delta prefill NVFP4 |
|---|---|---|---|---|---|---|---|
| c=1 | 437,17 | 6.070 | 153,07 | 431,27 | 5.894 | 151,13 | +3,0% |
| c=2 | 749,13 | 11.782 | 260,76 | 796,47 | 10.974 | 278,99 | +7,4% |
| c=4 | 1.163,92 | 12.811 | 412,99 | 1.298,10 | 11.921 | 466,57 | +7,5% |
| c=8 | 1.697,11 | 13.392 | 617,90 | 1.852,95 | 12.313 | 686,52 | +8,8% |
| c=16 | 2.203,38 | 13.601 | 823,38 | 2.776,82 | 12.292 | 1.089,71 | +10,6% |

Resultados multimodales citados en la model card: ChartQA 52,8%, DocVQA 54,2%, LibriSpeech 94,8% (requieren vLLM con ejecucion tensorial nativa para paridad completa).

## Requisitos de hardware

- VRAM estimada: 6,11 GB para el modelo de texto; 946 MB adicionales si se carga el proyector multimodal. Con overhead de contexto y KV cache, se recomienda al menos 8 GB para texto y 12-16 GB para multimodal con contexto amplio.
- GPU objetivo: NVIDIA Blackwell (RTX 5090, RTX 5080, SM_120) para aprovechar NVFP4 de forma nativa; tambien compatible con Ada (RTX 4070, RTX 4060 Ti 16GB) y Hopper.
- Cabe en GPU de consumo: si, en RTX 4060 Ti 16GB, RTX 4070, RTX 5070, RTX 5080 y RTX 5090, segun la model card.
- Opciones de despliegue: `llama-cli` y `llama-server` (llama.cpp) para texto y multimodal; vLLM con ejecucion tensorial nativa para maxima fidelidad multimodal y para el formato NVFP4-Blackwell-Rubin.
- Latencia y throughput: en RTX 5090 con `-ngl 42 -c 32768 -fa on`, 153,07 tok/s de generacion a concurrencia 1 y hasta 823,38 tok/s a concurrencia 16; prefill de 6.070 tok/s a c=1 y 13.601 tok/s a c=16.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Precision compuesta | Licencia | Formato |
|---|---|---|---|---|---|
| Nemotron-3.5-Bolt-E4B NVFP4 (este) | 7,52B | hasta 32.768 en ejemplos | 78,64% | Apache 2.0 | GGUF NVFP4 + mmproj |
| Nemotron-3.5-Bolt-E4B Q4_K_M | 7,52B | hasta 32.768 en ejemplos | 78,87% | Apache 2.0 | GGUF Q4_K_M |
| Nemotron-3.5-Bolt-E4B BF16 | 7,52B | no disponible | 79,40% | Apache 2.0 | safetensors / BF16 |
| Caelunshun NVFP4 | no disponible | no disponible | 74,12% | no disponible | NVFP4 |

No se dispone de datos de otros modelos de la misma categoria (por ejemplo, Llama, Qwen o Mistral de ~7-8B) en la informacion proporcionada, por lo que la comparativa se limita a las variantes del mismo modelo base.

## Limitaciones y advertencias

- El modelo solo declara soporte de ingles; no se garantiza un rendimiento adecuado en castellano u otros idiomas.
- La ruta multimodal de llama.cpp para Gemma 4 es experimental (padding por token-0); los resultados de vision y audio pueden degradarse fuera de vLLM.
- La cuantizacion NVFP4 introduce una perdida de precision de 0,76 puntos frente a BF16 en el benchmark compuesto; en tareas especificas la degradacion podria ser mayor.
- En alta concurrencia (c>=8) el throughput de generacion de NVFP4 es inferior al de Q4_K_M; el autor recomienda NVFP4 para flujos de baja concurrencia y evaluacion intensiva de prompts.
- No se documentan sesgos conocidos, riesgos de alucinacion ni evaluaciones de seguridad en la informacion disponible.
- La licencia Apache 2.0 permite uso comercial, pero el usuario debe verificar las condiciones del modelo base Nemotron-3.5-Bolt-E4B de NVIDIA, no detalladas en la model card.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validacion comunitaria independiente.
- No se especifica el contexto maximo nativo del modelo base; los 32.768 tokens citados corresponden a la configuracion de los ejemplos, no necesariamente al limite arquitectonico.

## Enlaces

- HuggingFace (este paquete GGUF): https://huggingface.co/arvedo/NVIDIA-Nemotron-3.5-Bolt-E4B-NVFP4-GGUF
- Repositorio NVFP4-Blackwell-Rubin del autor: https://huggingface.co/arvedo/NVIDIA-Nemotron-3.5-Bolt-E4B-NVFP4-Blackwell-Rubin
- llama.cpp (motor de inferencia GGUF): https://github.com/ggml-org/llama.cpp
- vLLM (motor recomendado para multimodal): https://github.com/vllm-project/vllm
