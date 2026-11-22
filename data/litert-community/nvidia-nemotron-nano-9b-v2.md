# litert-community/NVIDIA-Nemotron-Nano-9B-v2

## Resumen

NVIDIA-Nemotron-Nano-9B-v2 en formato LiteRT-LM es la conversión del modelo `nvidia/NVIDIA-Nemotron-Nano-9B-v2` al runtime LiteRT-LM de Google, publicada por la comunidad `litert-community`. El modelo original es un LLM entrenado desde cero por NVIDIA, diseñado como modelo unificado para tareas de razonamiento y no razonamiento: genera una traza de razonamiento (`<think>`) antes de la respuesta final, y dicho razonamiento puede desactivarse desde el system prompt. Esta conversión empaqueta los pesos en dos ficheros `.litertlm` (int8 e int4) para ejecución on-device en edge.

La arquitectura es un híbrido Mamba2-Transformer (familia Nemotron-H): 56 capas, de las cuales 27 son mixers Mamba2, 25 son bloques MLP y solo 4 son capas de atención (en profundidades 14, 21, 30 y 39), con tamaño oculto 4480, 40 cabezas de atención con 8 KV heads de 128 dimensiones, Mamba2 con 128 cabezas de 80 (estado 128, 8 grupos) y vocabulario de 131.072 tokens con embeddings no atados. El total es de 8.888.227.328 parámetros.

La relevancia de esta ficha radica en que permite ejecutar un modelo de razonamiento de ~9B en hardware de consumo y dispositivos móviles mediante LiteRT-LM, con cuantizaciones int8 e int4 y un rendimiento medido de 45,5 tok/s en decodificación GPU sobre un Mac Studio M4 Max (fichero int4). El contexto nativo es de 128K, aunque estos ficheros declaran 4096 tokens.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida Mamba2-Transformer (Nemotron-H): 56 capas (27 Mamba2, 25 MLP, 4 atención) |
| Parametros totales | 8.888.227.328 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128K en el modelo original; 4096 en estos ficheros LiteRT-LM |
| Tipos de cuantizacion | int8 (lineales y embedding int8, conv Mamba y selective scan en float, activaciones GPU fp32) e int4 blockwise-32 min-max (lineales int4, lm_head y embedding int8, activaciones GPU fp32) |
| Idiomas soportados | en, de, es, fr, it, ja |
| Licencia | nvidia-open-model-license |
| Formato de pesos | `.litertlm` (LiteRT-LM); fichero int8 de 9,07 GB y fichero int4 de 5,59 GB |

## Arquitectura y entrenamiento

El modelo base fue entrenado desde cero por NVIDIA y descrito en el paper arXiv 2508.14444: preentrenamiento de un modelo de 12B sobre 20 billones de tokens, alineamiento posterior y compresión/destilación a 9B mediante la estrategia Minitron. La arquitectura híbrida reduce el coste de memoria en inferencia: solo las cuatro capas de atención mantienen una KV cache creciente (con presupuesto de 4096 tokens en estos ficheros), mientras que las 27 capas Mamba2 mantienen un estado conv y SSM de tamaño constante.

La conversión a LiteRT-LM se realizó con litert-torch (commit 115a136 con el parche Nemotron-H) y la ruta de conversión Nemotron-H de `hf-to-litertlm` (`nemotron_h_work/`), probada con litert-lm 0.18.0. Los ficheros declaran activaciones GPU en fp32 porque, con las activaciones fp16 por defecto del runtime, el fichero int8 respondió 0 de 8 preguntas de verificación (respuestas `<unk>` repetidas hasta el límite). El modelo es de razonamiento: abre un bloque `<think>` antes de responder salvo que se indique lo contrario, y el canal de pensamiento (`thought`, delimitado por `<think>\n` y `\n</think>`) está declarado en el fichero, de modo que el runtime devuelve el razonamiento por separado. Las directivas `/no_think` y `/think` en el system message o en un mensaje de usuario activan y desactivan el razonamiento por conversación o por turno.

## Capacidades

- Generación de texto con razonamiento explícito en bloque `<think>` separado de la respuesta final.
- Modo de razonamiento desactivable mediante `/no_think` (con ligera pérdida de precisión en prompts difíciles) y reactivable con `/think`.
- Razonamiento matemático y de dominio científico (resultados reportados por NVIDIA en AIME25, MATH500 y GPQA).
- Seguimiento de instrucciones (IFEval reportado por NVIDIA).
- Multilingüe en inglés, alemán, español, francés, italiano y japonés.
- Ejecución on-device en edge mediante el runtime LiteRT-LM, con ficheros int8 e int4.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible explícitamente en la información proporcionada, más allá del razonamiento interno del modelo.
- Capacidades de visión o audio: no disponibles.

## Casos de uso

- Asistentes on-device en dispositivos móviles y edge: el fichero int4 (5,59 GB) está pensado para ejecución local con LiteRT-LM; en el Mac Studio M4 Max decodifica a 45,5 tok/s en GPU, lo que permite asistentes interactivos sin conexión a la nube.
- Razonamiento matemático y científico asistido: el modelo reporta AIME25 72,1, MATH500 97,8 y GPQA 64,0 con razonamiento activado, adecuado para tutoría o verificación de cálculos con traza auditable separada de la respuesta.
- Procesamiento por lotes con contexto moderado: con 4096 tokens de contexto en estos ficheros, encaja en tareas de resumen, extracción y clasificación de documentos cortos o conversaciones de varios turnos.
- Despliegue en portátiles y estaciones de trabajo con GPU de consumo: el fichero int4 ocupa 5,59 GB y el int8 9,07 GB, permitiendo inferencia local en equipos con VRAM suficiente sin depender de servidores.
- Aplicaciones multilingües en seis idiomas (en, de, es, fr, it, ja): atención al cliente o generación de contenido en esos mercados con un único modelo.
- Evaluación y prototipado de modelos híbridos Mamba2-Transformer: la conversión permite medir el comportamiento de la arquitectura Nemotron-H en runtime LiteRT-LM con verificaciones de calidad publicadas (8/8 en el chequeo de 8 preguntas en CPU y GPU para ambos ficheros).
- Pipelines de CI/CD para validación de calidad de cuantizaciones: los scripts de verificación (`verify_quality.py`) y las métricas GSM8K publicadas (int8 93, int4 92 frente a 83 en bf16 y 84 en fp32 de la referencia transformers) sirven como base de pruebas de regresión.

## Benchmarks y rendimiento

Resultados reportados por NVIDIA para el modelo base (razonamiento activado):

| Benchmark | Resultado |
|---|---|
| AIME25 | 72,1 |
| MATH500 | 97,8 |
| GPQA | 64,0 |
| IFEval | 90,3 |

Resultados de la conversión LiteRT-LM publicados en la model card:

| Metrica | int8 | int4 |
|---|---|---|
| GSM8K (thinking off, Mac GPU) | 93 | 92 |
| Chequeo de 8 preguntas (CPU y GPU) | 8/8 | 8/8 |
| Decodificacion GPU (Mac M4 Max) | 41,0 tok/s | 45,5 tok/s |
| Prefill CPU (tok/s) | 127,9 | 56,9 |
| Tamano del fichero | 9,07 GB | 5,59 GB |

Tiempos para 1024 tokens de prefill más 256 tokens decodificados a contexto 2048:

| Configuracion | Mac M4 Max (s) | Galaxy S26 | Pixel 8a |
|---|---|---|---|
| int4 GPU | 7,77 | no ejecutado | detenido por la regla de memoria |
| int8 GPU | 8,37 | no ejecutado | no ejecutado |
| int8 CPU | 28,68 | no ejecutado | no ejecutado |
| int4 CPU | 36,32 | no ejecutado | no ejecutado |

Referencia transformers sobre los mismos prompts GSM8K: 83 en bf16 y 84 en fp32; la diferencia se concentra en los 16 prompts más largos que un chunk de Mamba2.

## Requisitos de hardware

- VRAM estimada: el fichero int4 ocupa 5,59 GB y el int8 9,07 GB; a ello hay que sumar la memoria de activaciones y la KV cache de las cuatro capas de atención (presupuesto de 4096 tokens).
- GPU recomendadas: el rendimiento se midió en un Mac Studio M4 Max (GPU); no se han publicado mediciones en A100, H100 o RTX 4090 para esta conversión.
- Cabe en GPU de consumo: sí, el fichero int4 (5,59 GB) es viable en GPUs con al menos ~8 GB de VRAM; el int8 requiere aproximadamente 10 GB o más.
- Despliegue: runtime LiteRT-LM (litert-lm 0.18.0 probado); no se documenta soporte de vLLM, llama.cpp, Ollama o TGI para estos ficheros.
- Latencia y throughput: en Mac M4 Max, int4 GPU 45,5 tok/s de decodificación y 7,77 s para 1024 prefill + 256 decode; int8 GPU 41,0 tok/s y 8,37 s; int8 CPU 28,68 s para la misma carga.
- Limitación en iOS: cada fichero es una única sección TFLite (8,45 GiB int8, 5,21 GiB int4, con la tabla de embeddings incluida), por encima del límite de ~2 GiB por sección descrito en la card de Ministral-3-3B-Instruct-2512; no medido en iOS.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| NVIDIA-Nemotron-Nano-9B-v2 (LiteRT-LM, esta ficha) | 8,89B | 4096 en estos ficheros (128K nativo) | `.litertlm` int8/int4 | nvidia-open-model-license | Híbrido Mamba2-Transformer, razonamiento on/off, 45,5 tok/s en M4 Max |
| nvidia/NVIDIA-Nemotron-Nano-9B-v2 (original) | 8,89B | 128K | safetensors (bf16) | nvidia-open-model-license | Modelo base en transformers; GSM8K 83 bf16 / 84 fp32 en los mismos prompts |
| Ministral-3-3B-Instruct-2512 (LiteRT-LM) | no disponible | no disponible | `.litertlm` | no disponible | Referenciado en la card por el límite de sección TFLite en iOS |

No se dispone de datos de benchmarks comparativos con otras alternativas en la información proporcionada.

## Limitaciones y advertencias

- Contexto reducido en estos ficheros: 4096 tokens frente a los 128K del modelo original; no apto para tareas de contexto largo sin reconversión.
- La desactivación del razonamiento (`/no_think`) conlleva una ligera pérdida de precisión en prompts difíciles que requieren razonamiento, según NVIDIA.
- El flag `--thinking false` del CLI de LiteRT-LM no actúa sobre este fichero; debe usarse `/no_think` en el mensaje.
- Las activaciones GPU en fp16 por defecto del runtime producen respuestas degeneradas (`<unk>` repetido) con el fichero int8; por eso ambos ficheros declaran fp32, con el coste de memoria asociado.
- El fichero int4 presenta un prefill en CPU notablemente más lento (56,9 tok/s frente a 127,9 del int8) por el esquema blockwise.
- No medido en iOS: el tamaño de sección TFLite supera el límite de ~2 GiB por sección.
- En el Pixel 8a, el fichero int4 se detuvo por la regla de memoria del autor; no hay mediciones en Galaxy S26.
- Licencia nvidia-open-model-license: revisar los términos antes de uso comercial; no es una licencia open source estándar.
- Sesgos conocidos y riesgo de alucinación: no documentados en la información proporcionada; aplican los riesgos habituales de los LLM.
- Tool calling, agentes y multimodalidad no están documentados para esta conversión.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/litert-community/NVIDIA-Nemotron-Nano-9B-v2
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-Nano-9B-v2
- Runtime LiteRT-LM: https://github.com/google-ai-edge/LiteRT-LM
- Herramienta de conversión hf-to-litertlm: https://github.com/john-rocky/hf-to-litertlm
- Script de verificación de calidad: https://github.com/john-rocky/hf-to-litertlm/blob/main/scripts/verify_quality.py
- Paper del modelo (arXiv 2508.14444): https://arxiv.org/abs/2508.14444
- Licencia NVIDIA Open Model License: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-open-model-license/
- Card de referencia Ministral-3-3B-Instruct-2512 (límite de sección TFLite en iOS): https://huggingface.co/litert-community/Ministral-3-3B-Instruct-2512
