# axteam/Qwen3.5-4B-NVFP4A16

## Resumen

`axteam/Qwen3.5-4B-NVFP4A16` es una cuantizacion de 4 bits del modelo multimodal `Qwen/Qwen3.5-4B` de Alibaba Qwen, publicada por el usuario axteam y pensada especificamente para servir el modelo con vLLM de forma eficiente. Emplea el esquema NVFP4A16 (pesos en FP4 E2M1 con grupo de 16 y escala FP8 E4M3, activaciones en BF16), almacenado en el formato `nvfp4-pack-quantized` de la libreria compressed-tensors. El checkpoint ocupa unos 5,6 GB en disco y conserva en BF16 aproximadamente el 45 % de los parametros, incluyendo toda la torre de vision, el cabezal de prediccion multi-token y la ruta completa de atencion lineal.

El modelo base es un transformer hibrido (atencion lineal tipo GatedDeltaNet combinada con atencion completa), denso, multimodal con vision y con un cabezal MTP (multi-token prediction). Cuenta con 4.539.265.536 parametros totales. Su relevancia actual reside en que demuestra que la cuantizacion FP4 nativa, con el soporte de vLLM 0.32, permite reducir a la mitad el peso en memoria respecto a BF16 sin degradar la calidad: en la bateria de benchmarks medida por el autor, la media de recuperacion frente al original es del 102,4 %, es decir, ligeramente superior al modelo sin cuantizar en esa configuracion de evaluacion.

La licencia es Apache-2.0, heredada del modelo base, lo que facilita su uso comercial. El autor documenta de forma inusualmente detallada el proceso de calibracion (256 muestras, corpus mixto con predominio de coreano), las decisiones de que modulos mantener en BF16 y las metricas de fidelidad frente al original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido (atencion lineal GatedDeltaNet + atencion completa), denso, multimodal (vision), con cabezal MTP |
| Parametros totales | 4.539.265.536 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el ejemplo de uso emplea `--max-model-len 32768`) |
| Tipos de cuantizacion | NVFP4A16 (W4A16): pesos FP4 E2M1, grupo 16, escala FP8 E4M3 + escala global FP32 por tensor; activaciones BF16. Formato compressed-tensors `nvfp4-pack-quantized` |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (compressed-tensors), compatible con transformers y vLLM |
| Modelo base | Qwen/Qwen3.5-4B |
| Tamano en disco | ~5,6 GB (repo: 11,1 GB) |
| Metodo de cuantizacion | PTQ con AWQ para proteger canales salientes; calibracion con 256 muestras |
| Runtime probado | vLLM 0.32.0 (arquitectura disponible desde vLLM >= 0.17.0) |
| Requisitos de transformers | transformers >= 5.2.0 + compressed-tensors >= 0.15.0 (sin vLLM) |
| trust_remote_code | no necesario |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-4B emplea una arquitectura hibrida que intercala capas de atencion lineal (GatedDeltaNet, una variante de espacio de estados con compuertas) con capas de atencion completa, lo que reduce el coste computacional y de memoria del contexto largo manteniendo la capacidad de recuperacion de informacion. Es un modelo denso de 4,5 mil millones de parametros, multimodal (procesa imagen y texto) y equipado con un cabezal de prediccion multi-token (MTP), orientado a decodificacion especulativa y a un throughput mayor en generacion.

Esta publicacion no reentrena el modelo: es cuantizacion post-entrenamiento (PTQ). El autor aplica AWQ con un conjunto de calibracion de 256 muestras (corpus mixto con fuerte presencia de coreano) para identificar y proteger los canales de pesos mas sensibles antes del redondeo a FP4. La decision tecnica destacable es mantener en BF16 toda la ruta de atencion lineal (`linear_attn.*`), los RMSNorms, los embeddings, el LM head, la torre de vision y el cabezal MTP: los pesos de la parte SSM son demasiado sensibles para FP4. En total, cerca del 45 % de los parametros permanece sin cuantizar. En la revision del 2026-11-01 se restauraron de forma bit-exacta los pesos RMSNorm no suavizados, eliminando el ruido de redondeo BF16 (hasta un 0,4 % en la ganancia efectiva) que habia introducido el manejo de offset-norm de llm-compressor.

## Capacidades

- Generacion de texto conversacional multi-turno, con plantilla de chat identica a la del modelo original.
- Comprension de imagenes y texto combinados (pipeline `image-text-to-text`): descripcion, respuesta a preguntas visuales y razonamiento sobre contenido grafico.
- Razonamiento y matematicas: el modelo base obtiene 76,72 en GSM8K (5-shot estricto) en la evaluacion del autor.
- Capacidades multilingues: se reportan resultados en benchmarks en ingles (MMLU, ARC, Winogrande) y coreano (KMMLU, HAE-RAE), lo que confirma competencia en al menos esos idiomas; el conjunto exacto de idiomas soportados no esta disponible.
- Prediccion multi-token mediante cabezal MTP, que habilita decodificacion especulativa en vLLM para acelerar la generacion.
- Soporte de tool calling / function calling: no documentado explicitamente en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado explicitamente en la informacion disponible.
- Modo thinking: no documentado en la informacion disponible.

## Casos de uso

- Servicio de chat multimodal en produccion: con solo 5,6 GB de pesos, el modelo cabe en una unica GPU consumer o de datacenter y puede servirse mediante el endpoint compatible con OpenAI de vLLM, gestionando conversaciones multi-turno con imagenes adjuntas.
- Asistente de documentacion tecnica con capturas de pantalla: el modelo puede recibir una imagen de una interfaz o diagrama junto con una pregunta en texto y responder sobre ella, aprovechando la torre de vision conservada en BF16.
- Clasificacion y extraccion de informacion de imagenes de formularios o tickets: uso en pipelines de back office donde se envia la imagen y se pide un resumen estructurado, con la ventaja de que la cuantizacion FP4 mantiene la fidelidad (91,7 % de acuerdo top-1 con el original).
- Razonamiento matematico asistido: con 76,72 en GSM8K, es adecuado para tutoria o verificacion de calculos en aplicaciones educativas, desplegado con `--max-model-len 32768` para problemas con enunciados largos.
- Evaluacion y prototipado de investigación: al ser una cuantizacion fiel y bien documentada del original, sirve para estudiar el impacto de FP4 en calidad y latencia sin necesidad de reproducir el pipeline de cuantizacion.
- Despliegue en entornos con VRAM limitada: en GPUs Turing (sm75) o posteriores sin tensor cores FP4, el esquema weight-only permite ejecutar un modelo de 4,5B multimodal en tarjetas de 12-16 GB junto con cache KV y grafo CUDA.
- Generacion acelerada con decodificacion especulativa: el cabezal MTP en BF16 permite a vLLM usar propuestas multi-token, aumentando el throughput en cargas de generacion larga.

## Benchmarks y rendimiento

Medidos por el autor con lm-evaluation-harness sobre vLLM, greedy, prompts estilo completion sin plantilla de chat. MMLU corresponde a la variante generativa (`mmlu_generative`), no comparable con puntuaciones por log-likelihood. Los porcentajes indican recuperacion frente al original BF16.

| Benchmark | BF16 (original) | FP8-dynamic | AWQ-8bit | NVFP4A16 (este repo) | NVFP4 | AWQ-4bit |
|---|---|---|---|---|---|---|
| MMLU (5-shot, generativo) | 55,18 | 57,99 (105,1 %) | 54,79 (99,3 %) | 60,58 (109,8 %) | 58,61 (106,2 %) | 60,89 (110,3 %) |
| GSM8K (5-shot, estricto) | 74,07 | 73,92 (99,8 %) | 73,84 (99,7 %) | 76,72 (103,6 %) | 73,31 (99,0 %) | 76,42 (103,2 %) |
| ARC-Challenge (0-shot) | 54,61 | 53,92 (98,8 %) | 54,52 (99,8 %) | 54,86 (100,5 %) | 53,92 (98,8 %) | 54,35 (99,5 %) |
| Winogrande (5-shot) | 68,75 | 67,96 (98,9 %) | 69,14 (100,6 %) | 68,90 (100,2 %) | 69,38 (100,9 %) | 68,90 (100,2 %) |
| KMMLU (5-shot, directo) | 50,47 | 50,13 (99,3 %) | 50,48 (100,0 %) | 51,49 (102,0 %) | 50,26 (99,6 %) | 49,02 (97,1 %) |
| HAE-RAE (0-shot) | 62,42 | 61,50 (98,5 %) | 62,05 (99,4 %) | 61,69 (98,8 %) | 59,76 (95,7 %) | 58,48 (93,7 %) |
| **Media** | **60,92** | **60,90 (100,0 %)** | **60,81 (99,8 %)** | **62,37 (102,4 %)** | **60,87 (99,9 %)** | **61,34 (100,7 %)** |

Fidelidad frente al original BF16 en un conjunto interno mixto ingles/coreano (100 prompts, respuestas greedy del BF16 puntuadas bajo cada build):

| Metrica | Este modelo | Original BF16 |
|---|---|---|
| Perplejidad (menor = mas cercano) | 1,6374 | 1,5703 (+4,3 %) |
| Acuerdo top-1 en siguiente token | 91,7 % | 99,2 % |

## Requisitos de hardware

- VRAM para pesos: 5,6 GB. Hay que sumar la cache KV (crece con la longitud de contexto y el numero de peticiones concurrentes) y unos pocos GB para activaciones y grafos CUDA.
- GPU compatibles: NVIDIA Turing (sm75) o posterior. No requiere tensor cores FP4 porque el esquema es weight-only. V100 (sm70) no esta soportado.
- El autor solo probo el modelo en una B200; la seleccion de kernel por GPU la realiza el codigo de vLLM 0.32.
- GPU recomendadas: cualquier tarjeta con al menos 12-16 GB de VRAM para contexto moderado (RTX 4090, L40S, A100, H100, B200). Con `--tensor-parallel-size N` se puede repartir en varias GPU si los pesos no caben en una sola.
- Cabe en GPU consumer: si, en modelos con 12 GB o mas de VRAM; el modelo base de 4,5B en BF16 requeriria aproximadamente el doble de memoria para los pesos.
- Opciones de despliegue: vLLM (recomendado y probado, `vllm serve axteam/Qwen3.5-4B-NVFP4A16 --max-model-len 32768`); transformers >= 5.2.0 con compressed-tensors >= 0.15.0 (verificado en CPU con la variante 0.8B). Soporte de llama.cpp, Ollama o TGI: no disponible en la informacion proporcionada.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| axteam/Qwen3.5-4B-NVFP4A16 | 4,54B | no disponible | FP4 W4A16, 5,6 GB | Apache-2.0 | Media de 62,37 en la bateria del autor (102,4 % del BF16) |
| Qwen/Qwen3.5-4B (BF16) | 4,54B | no disponible | BF16, ~9-11 GB | Apache-2.0 | Referencia de calidad; media 60,92 en la misma bateria |
| Qwen3.5-4B AWQ-4bit | 4,54B | no disponible | INT4 W4A16 | Apache-2.0 | Media 61,34 (100,7 %); peor en HAE-RAE (93,7 %) |
| Qwen3.5-4B FP8-dynamic | 4,54B | no disponible | FP8 | Apache-2.0 | Media 60,90 (100,0 %); mayor peso en memoria que FP4 |

Las alternativas de otros fabricantes en el rango de 4B multimodales no estan documentadas en la informacion proporcionada.

## Limitaciones y advertencias

- Perplejidad un 4,3 % superior al original y acuerdo top-1 del 91,7 %: la cuantizacion introduce una degradacion medible aunque pequena en la distribucion de salida.
- El conjunto de calibracion tiene predominio de coreano; el comportamiento en otros idiomas, incluido el espanol, puede desviarse mas respecto al original de lo que reflejan las metricas publicadas.
- Riesgo de alucinacion inherente al modelo base, no mitigado por la cuantizacion; no se documentan evaluaciones de veracidad.
- Sesgos conocidos del modelo base no documentados en la informacion disponible.
- La licencia Apache-2.0 permite uso comercial, pero se heredan las condiciones del modelo base; conviene revisar el LICENSE enlazado por el autor.
- Requiere vLLM >= 0.17.0 para la arquitectura y se probo con vLLM 0.32.0, que fija transformers >= 5.16.1,<5.20 y compressed-tensors 0.17.0; no se debe actualizar compressed-tensors por separado (el checkpoint se guardo con 0.19.0 pero lo lee 0.17.0).
- Solo se valido en una GPU B200; el rendimiento en otras tarjetas depende de la seleccion de kernel de vLLM y no esta medido.
- El modelo base no incluye `generation_config.json`, por lo que este checkpoint tampoco lo aporta; hay que fijar los parametros de generacion explicitamente.
- El repo ocupa 11,1 GB aunque los pesos son 5,6 GB; conviene planificar el almacenamiento en consecuencia.

## Enlaces

- Hugging Face: https://huggingface.co/axteam/Qwen3.5-4B-NVFP4A16
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-4B/blob/main/LICENSE
- lm-evaluation-harness: https://github.com/EleutherAI/lm-evaluation-harness
- vLLM: https://github.com/vllm-project/vllm
- compressed-tensors: https://github.com/neuralmagic/compressed-tensors
- llm-compressor: https://github.com/vllm-project/llm-compressor
