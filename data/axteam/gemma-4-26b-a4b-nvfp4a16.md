# axteam/gemma-4-26B-A4B-NVFP4A16

## Resumen

`axteam/gemma-4-26B-A4B-NVFP4A16` es una cuantizacion de 4 bits del modelo multimodal `google/gemma-4-26B-A4B`, publicada por el equipo axteam. Se trata de un checkpoint PTQ (post-training quantization) con esquema NVFP4A16 (pesos FP4 E2M1 con grupo de 16, escalas FP8 E4M3 y escala global FP32 por tensor, activaciones en BF16), empaquetado en formato `compressed-tensors` `nvfp4-pack-quantized` y orientado especificamente al servicio con vLLM.

El modelo base es un transformer de tipo Mixture-of-Experts con 25.805.936.206 parametros totales (segun safetensors) y 8 expertos activos de 128 totales mas uno compartido, con pipeline `image-text-to-text`, lo que indica capacidades multimodales de entrada de imagen y texto. La cuantizacion reduce el peso en disco a aproximadamente 17,2 GB, lo que permite desplegarlo en GPUs de consumo alto o en configuraciones multi-GPU con tensor parallelism.

Su relevancia practica es doble: por un lado, demuestra que es posible servir un MoE multimodal de ~26B parametros con perdida de calidad muy contenida (99,3 % de recuperacion media frente al BF16 original en la bateria medida); por otro, al estar bajo licencia Apache-2.0 segun los metadatos del repo, ofrece una via de despliegue comercial sin las fricciones habituales de otros checkpoints cuantizados. Es importante senalar que el checkpoint es un modelo base preentrenado, sin plantilla de chat, y que no es cargable directamente con Transformers: requiere vLLM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gemma 4, Mixture-of-Experts (8 expertos activos / 128 totales + 1 compartido) |
| Parametros totales | 25.805.936.206 (~25,8B) |
| Parametros activos | 8 expertos de 128 + 1 compartido (numero exacto de parametros activos no disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4A16 (W4A16): pesos FP4 (E2M1) grupo 16, escala FP8 E4M3 + escala global FP32 por tensor; activaciones BF16 |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 (con enlace a la licencia Gemma 4 de Google) |
| Formato de pesos | safetensors, compressed-tensors `nvfp4-pack-quantized` |
| Tamano en disco | ~17,2 GB |
| Modelo base | google/gemma-4-26B-A4B (commit 24548b6) |
| Metodo de cuantizacion | PTQ AWQ con 256 muestras de calibracion (sin reentrenamiento) |
| Componentes en BF16 | Vision tower, proyeccion visual, embeddings (atados con lm_head), router MoE, normas y MLP compartido (~7 % de parametros) |
| Runtime requerido | vLLM >= 0.19.0 (arquitectura); no cargable con Transformers |
| trust_remote_code | No necesario |

## Arquitectura y entrenamiento

El modelo base sigue la arquitectura Gemma 4 en configuracion Mixture-of-Experts: 128 expertos por capa con 8 activos mas un experto compartido, lo que permite un coste computacional por token muy inferior al de un denso de 26B. La variante publicada aqui es una cuantizacion post-entrenamiento (PTQ) con metodo AWQ: se parte de los pesos BF16 liberados por Google y se aplican escalas por canal calculadas sobre un conjunto de calibracion de 256 muestras (mayoritariamente en coreano, incluyendo respuestas en modo thinking en la variante -it). No hay gradiente ni ajuste fino, por lo que la fidelidad es inferior a la de un checkpoint QAT, aunque el autor reporta una recuperacion media del 99,3 % frente a BF16.

La innovacion tecnica principal es el esquema NVFP4: pesos en FP4 (formato E2M1) agrupados de 16 en 16 con escala FP8 E4M3 por grupo y una escala global FP32 por tensor, mientras las activaciones se mantienen en BF16. Se preservan en BF16 los componentes mas sensibles a la cuantizacion (vision tower, proyeccion visual, embeddings, router MoE, normas y MLP compartido), aproximadamente el 7 % de los parametros. El tokenizador, `processor_config` y `generation_config` son identicos byte a byte a los del modelo original. No se dispone de informacion sobre el volumen de tokens de entrenamiento del modelo base ni sobre si hubo RLHF/DPO en su pipeline.

## Capacidades

- Generacion de texto y completion de texto plano (modelo base, sin plantilla de chat).
- Entrada multimodal imagen-texto segun el pipeline `image-text-to-text`: procesa imagenes junto a texto mediante el vision tower conservado en BF16.
- Razonamiento y conocimiento general medido en MMLU (77,18 en 5-shot) y ARC-Challenge (68,52 en 0-shot).
- Razonamiento matematico de varios pasos, medido en GSM8K estricto (69,98 en 5-shot).
- Capacidad multilingue parcial: los benchmarks incluyen KMMLU (coreano, 59,41) y HAE-RAE (coreano, 77,18), lo que evidencia competencia en coreano ademas del ingles de MMLU/GSM8K/ARC/Winogrande.
- Enrutamiento MoE eficiente: solo se activan 8 de 128 expertos por token, lo que reduce el coste de inferencia frente a un denso equivalente.
- No se documenta en la informacion disponible soporte explicito de tool calling, function calling, modo thinking ni capacidades de audio.

## Casos de uso

- Servicio de inferencia a gran escala con vLLM: el checkpoint esta empaquetado en `compressed-tensors` `nvfp4-pack-quantized` y pensado para `vllm serve`, con pesos de 17,2 GB que permiten desplegarlo en una sola GPU de 24 GB o repartirlo con `--tensor-parallel-size`.
- Completion de texto en pipelines de generacion: al ser un modelo base sin plantilla de chat, encaja en tareas de continuacion de texto, redaccion asistida y generacion de contenido donde no se requiere formato conversacional.
- Procesamiento de documentos con imagenes: gracias al vision tower en BF16 puede recibir pares imagen-texto para tareas de descripcion, extraccion o respuesta sobre contenido visual, integrado en un servidor vLLM con el pipeline `image-text-to-text`.
- Razonamiento matematico asistido: con 69,98 en GSM8K estricto, es adecuado para resolver problemas aritmeticos de varios pasos en entornos de tutoria o validacion de calculos, siempre con verificacion posterior.
- Evaluacion comparativa de tecnicas de cuantizacion: el repo publica resultados medidos con lm-evaluation-harness sobre vLLM frente a BF16, FP8-dynamic, AWQ-8bit, NVFP4 y AWQ-4bit, lo que lo convierte en una referencia util para estudiar el impacto de NVFP4 en MoE multimodales.
- Despliegue en infraestructura con GPUs Turing o superior sin tensor cores FP4: al ser weight-only FP4, no exige hardware Blackwell; basta una GPU sm75 o superior (V100 sm70 no soportada), lo que amplia el parque de GPUs compatibles.
- Experimentacion academica con modelos MoE multimodales: la licencia Apache-2.0 y el formato abierto permiten usarlo como base de investigacion en eficiencia de inferencia y cuantizacion.

## Benchmarks y rendimiento

Resultados medidos por el autor con lm-evaluation-harness sobre vLLM, greedy, few-shot completion sin plantilla de chat. Los porcentajes entre parentesis indican recuperacion frente al BF16 original.

| Benchmark | BF16 (original) | FP8-dynamic | AWQ-8bit | NVFP4A16 (este repo) | NVFP4 | AWQ-4bit |
|---|---|---|---|---|---|---|
| MMLU (5-shot) | 77,77 | 77,25 (99,3 %) | 77,75 (100,0 %) | 77,18 (99,2 %) | 76,20 (98,0 %) | 76,82 (98,8 %) |
| GSM8K (5-shot, strict) | 70,89 | 71,34 (100,6 %) | 71,49 (100,9 %) | 69,98 (98,7 %) | 67,17 (94,8 %) | 69,98 (98,7 %) |
| ARC-Challenge (0-shot) | 68,34 | 68,60 (100,4 %) | 68,17 (99,8 %) | 68,52 (100,2 %) | 66,98 (98,0 %) | 68,69 (100,5 %) |
| Winogrande (5-shot) | 80,58 | 80,03 (99,3 %) | 80,58 (100,0 %) | 79,64 (98,8 %) | 78,22 (97,1 %) | 79,56 (98,7 %) |
| KMMLU (5-shot, direct) | 60,03 | 60,07 (100,1 %) | 60,15 (100,2 %) | 59,41 (99,0 %) | 58,14 (96,9 %) | 58,99 (98,3 %) |
| HAE-RAE (0-shot) | 77,27 | 76,99 (99,6 %) | 76,90 (99,5 %) | 77,18 (99,9 %) | 75,44 (97,6 %) | 75,80 (98,1 %) |
| **Media** | **72,48** | **72,38 (99,9 %)** | **72,51 (100,0 %)** | **71,98 (99,3 %)** | **70,36 (97,1 %)** | **71,64 (98,8 %)** |

## Requisitos de hardware

- VRAM para pesos: 17,2 GB en el checkpoint NVFP4A16. Hay que sumar la cache KV (crece con la longitud de contexto y el numero de peticiones concurrentes) y varios GB para activaciones y CUDA graphs.
- GPU recomendadas: NVIDIA Turing (sm75) o superior. V100 (sm70) no esta soportada. Al ser weight-only FP4 no se necesitan tensor cores FP4, por lo que no es imprescindible hardware Blackwell.
- Cabe en GPU de consumo: con 17,2 GB de pesos mas cache KV y overhead, una RTX 4090 (24 GB) es el minimo razonable para contexto corto y poca concurrencia; para contextos largos o mayor paralelismo conviene A100/H100 o repartir con tensor parallelism.
- Despliegue: exclusivamente vLLM (`vllm serve axteam/gemma-4-26B-A4B-NVFP4A16` o `LLM(...)` en Python). La arquitectura requiere vLLM >= 0.19.0; la instalacion descrita usa vLLM 0.32 con Python 3.11-3.14, torch 2.13 (build CUDA 13.0), transformers >=5.16.1,<5.20 y compressed-tensors 0.17.0. No es cargable con Transformers (los expertos quedan sin inicializar).
- Opciones como llama.cpp, Ollama o TGI no estan documentadas para este checkpoint.
- Latencia y throughput: no disponibles en la informacion proporcionada; el autor indica que este build no se ha ejecutado aun en su entorno de referencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| axteam/gemma-4-26B-A4B-NVFP4A16 | ~25,8B totales (MoE 8/128+1) | no disponible | NVFP4A16 W4A16, ~17,2 GB, solo vLLM | apache-2.0 | Media de 71,98 en la bateria medida (99,3 % vs BF16) |
| google/gemma-4-26B-A4B (BF16) | ~25,8B totales (MoE 8/128+1) | no disponible | BF16 safetensors | Gemma 4 / Apache-2.0 | Referencia de calidad: media 72,48 |
| Variante NVFP4 (sin preservar componentes en BF16) | ~25,8B totales | no disponible | NVFP4 W4A16 | no disponible | Media 70,36 (97,1 % vs BF16) |
| Variante AWQ-4bit | ~25,8B totales | no disponible | W4A16 AWQ | no disponible | Media 71,64 (98,8 % vs BF16) |

No se dispone de datos para comparar con modelos de otros autores de la misma categoria y tamano.

## Limitaciones y advertencias

- Es un modelo base preentrenado sin plantilla de chat: no debe usarse como asistente conversacional sin un ajuste posterior; esta pensado para completion de texto plano.
- No es cargable con Transformers (comprobado hasta 5.22.1): no hay regla de conversion para checkpoints por experto y los expertos quedan sin inicializar. El unico runtime soportado es vLLM.
- La cuantizacion es PTQ con AWQ, no QAT: la fidelidad a 4 bits es inferior a la de un checkpoint QAT oficial de Google. El autor reporta 99,3 % de recuperacion media, con la mayor perdida en GSM8K (98,7 %) y Winogrande (98,8 %).
- La calibracion se hizo con 256 muestras mayoritariamente en coreano, lo que puede sesgar la preservacion de calidad hacia ese idioma frente a otros.
- Riesgo de alucinacion inherente a un modelo de lenguaje de ~26B; los resultados de MMLU (77,18) y GSM8K (69,98) indican un margen de error no despreciable en razonamiento y matematicas que exige verificacion en produccion.
- Idiomas soportados no documentados oficialmente; la evidencia empirica se limita a ingles y coreano.
- La licencia declarada en el repo es apache-2.0, pero el enlace apunta a la licencia Gemma 4 de Google; conviene revisar los terminos de uso comercial del modelo base antes de desplegar en produccion.
- El autor advierte que este build aun no se ha ejecutado en su entorno de referencia y que la eleccion de kernel por GPU depende del codigo de seleccion de vLLM 0.32; el rendimiento real puede variar.
- La version de compressed-tensors debe mantenerse fijada a la que impone vLLM (0.17.0 lee el checkpoint guardado con 0.19.0); actualizarla por separado puede romper la carga.
- Requiere driver NVIDIA con soporte CUDA 13 para la instalacion descrita.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/axteam/gemma-4-26B-A4B-NVFP4A16
- Modelo base: https://huggingface.co/google/gemma-4-26B-A4B
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- lm-evaluation-harness: https://github.com/EleutherAI/lm-evaluation-harness
- vLLM: https://github.com/vllm-project/vllm
- compressed-tensors: https://github.com/neuralmagic/compressed-tensors
