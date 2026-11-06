# PhilipEriksson/Qwen3.5-0.8B-Opus-Reasoning-Distilled-EXL3

## Resumen

Qwen3.5-0.8B-Opus-Reasoning-Distilled-EXL3 es una cuantizacion EXL3 del modelo PhilipEriksson/Qwen3.5-0.8B-Opus-Reasoning-Distilled, un modelo de 0,8 mil millones de parametros afinado para razonamiento con trazas de cadena de pensamiento destiladas de Claude Opus y de Qwen3.5-27B. Lo publica PhilipEriksson como experimento de aprendizaje, no como un lanzamiento competitivo en benchmarks: el propio autor lo describe como "learning run" entrenado con 2.917 filas durante 25 minutos en una sola RTX 5090.

El artefacto que nos ocupa no es el modelo original, sino su version cuantizada en formato EXL3 (QTIP trellis-coded) para el motor exllamav3, disponible en dos variantes de 4,0 y 3,0 bits por peso. El objetivo es permitir la inferencia del modelo en GPUs de consumo con un coste de memoria reducido (1,08 GB y 1,02 GB respectivamente) manteniendo, en el caso de 4,0 bpw, la calidad del checkpoint BF16 en pruebas de humo.

La relevancia es doble: por un lado, ilustra el flujo de cuantizacion EXL3 sobre arquitecturas multimodales con torre de vision y cabeza MTP; por otro, sirve como ejemplo de destilacion de razonamiento a escala muy pequena. No obstante, el modelo hereda las limitaciones de su tamano y de un fine-tune ligero, por lo que su utilidad practica es acotada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Qwen3.5) con torre de vision y cabeza MTP; cuantizacion EXL3 trellis-coded |
| Parametros totales | 0,8 mil millones (aproximado, segun el nombre del modelo) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | EXL3 4,0 bpw y EXL3 3,0 bpw; torre de vision a 6 bpw |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (exllamav3), con config.json, quantization_config.json, tokenizer y preprocessor configs |

## Arquitectura y entrenamiento

El modelo base es un Qwen3.5 de 0,8B, una arquitectura transformer multimodal con torre de vision y cabeza MTP (multi-token prediction), segun se deduce de la model card al mencionar que la torre de vision se cuantiza a 6 bpw y que la cabeza MTP se conserva. El fine-tune se realizo sobre 2.917 filas de entrenamiento durante 25 minutos en una RTX 5090, destilando trazas de razonamiento de Claude Opus y de Qwen3.5-27B. No se especifican el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo RLHF o DPO.

La cuantizacion EXL3 se genero con `convert.py` del repositorio de exllamav3 (no incluido en el wheel), en una sola pasada y con calculo de hessianos al vuelo. El checkpoint fusionado requirio copiar `preprocessor_config.json` y `video_preprocessor_config.json` desde el modelo base, ya que la salida de merge de Unsloth los omite para arquitecturas multimodales y el lector de configuracion de EXL3 los exige. La torre de vision se cuantiza a 6 bpw y la cabeza MTP se mantiene, de modo que el bitrate efectivo del decodificador (3,0 o 4,0 bpw) no coincide con el del archivo completo; por eso los tamanos no son directamente comparables con los de GGUF.

## Capacidades

- Generacion de texto y razonamiento con cadena de pensamiento (chain-of-thought), heredada de la destilacion de trazas de Claude Opus y Qwen3.5-27B.
- Razonamiento aritmetico, logica y generacion de codigo basico, segun las pruebas de humo del autor (tres prompts: aritmetica, codigo y logica).
- Procesamiento de imagen y texto (pipeline image-text-to-text), aunque la torre de vision no fue incluida en el fine-tune.
- Cabeza MTP (multi-token prediction) conservada en la cuantizacion.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible; el autor advierte que el modelo falla en planificacion multi-paso.
- Capacidades multilingues: solo ingles (`en`).
- Modo thinking explicito: no se documenta mas alla de la generacion de trazas de razonamiento.

## Casos de uso

- Prototipado de razonamiento en local: el modelo cabe en 1,08 GB (4,0 bpw) y permite experimentar con cadenas de pensamiento en una GPU de consumo sin infraestructura dedicada.
- Pruebas de humo de pipelines de razonamiento: util para validar integraciones con exllamav3, TabbyAPI o el servidor compatible con OpenAI antes de escalar a modelos mayores.
- Generacion de codigo en entornos de baja memoria: la variante 4,0 bpw mantiene la respuesta de codigo en la prueba del autor, por lo que puede usarse para autocompletado o snippets simples en hardware limitado.
- Educacion e investigacion sobre destilacion: sirve como caso de estudio de destilacion de trazas de razonamiento de modelos grandes a un modelo de 0,8B.
- Evaluacion de formatos de cuantizacion: permite comparar EXL3 frente a GGUF Q4_K_M, GGUF Q8_0 y NVFP4 sobre el mismo modelo base en tareas de razonamiento corto.
- Despliegue en servidores compatibles con OpenAI: mediante exllamav3 o TabbyAPI se puede exponer como endpoint de chat para prototipos internos con contexto de hasta 4.096 tokens en el ejemplo de la model card.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. El autor proporciona una prueba de humo con tres prompts (aritmetica, codigo y logica), mismo sampler y `max_new_tokens=700`:

| Artefacto | Tamano | Respuesta esperada encontrada |
|---|---:|---|
| BF16 (baseline) | 1,7 GB | 3/3 |
| GGUF Q8_0 | 834 MB | 3/3 |
| GGUF Q4_K_M | 542 MB | 3/3 |
| EXL3 4,0 bpw | 1,08 GB | 3/3 |
| EXL3 3,0 bpw | 1,02 GB | 2/3 |
| NVFP4 | 892 MB | 3/3 |

El autor advierte explicitamente que tres prompts son una prueba de humo, no un benchmark. La variante 3,0 bpw fallo el prompt de codigo, produciendo una respuesta sin definicion de funcion.

## Requisitos de hardware

- VRAM estimada: aproximadamente 1,1 GB para los pesos de la variante 4,0 bpw y 1,0 GB para la 3,0 bpw, mas la memoria de cache y activaciones (el ejemplo de la model card usa `max_num_tokens=4096`).
- GPU recomendadas: cualquier GPU moderna con al menos 2-4 GB de VRAM libre; el autor entreno el modelo base en una RTX 5090, aunque la inferencia cuantizada no requiere esa GPU.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU consumer reciente (RTX 3060, 4060, 4090, etc.) e incluso en iGPU con suficiente memoria compartida.
- Opciones de despliegue: exllamav3 (libreria Python), TabbyAPI y el servidor compatible con OpenAI de exllamav3. No es compatible con llama.cpp, Ollama ni TGI, ya que el formato EXL3 es especifico de exllamav3.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.5-0.8B-Opus-Reasoning-Distilled-EXL3 4,0 bpw | 0,8B | no disponible | EXL3 | apache-2.0 | Calidad 3/3 en prueba de humo; 1,08 GB |
| Qwen3.5-0.8B-Opus-Reasoning-Distilled-GGUF Q4_K_M | 0,8B | no disponible | GGUF | apache-2.0 | Calidad 3/3; 542 MB; compatible con llama.cpp/Ollama |
| Qwen3.5-0.8B-Opus-Reasoning-Distilled-NVFP4 | 0,8B | no disponible | NVFP4 | apache-2.0 | Calidad 3/3; 892 MB; requiere hardware con soporte NVFP4 |
| Qwen3.5-0.8B-Opus-Reasoning-Distilled (BF16) | 0,8B | no disponible | safetensors | apache-2.0 | Baseline 3/3; 1,7 GB |

No se dispone de comparaciones con modelos de otros autores de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo experimental de aprendizaje: 2.917 filas de entrenamiento y 25 minutos en una RTX 5090; no es competitivo en benchmarks.
- Solo texto en el fine-tune: la torre de vision se excluyo del ajuste, pese a que el pipeline es image-text-to-text.
- 0,8B parametros: el autor advierte que fallara en tareas que requieran conocimiento del mundo real o planificacion multi-paso.
- Solo ingles: el campo `language` declara unicamente `en`.
- Riesgo de alucinacion elevado por el reducido tamano y el entrenamiento ligero.
- La variante 3,0 bpw pierde capacidad de generacion de codigo en la prueba del autor; se recomienda 4,0 bpw si se necesita esa capacidad.
- Licencia apache-2.0 heredada del modelo base, permisiva para uso comercial, pero el autor no ofrece garantias de calidad en produccion.
- Compatibilidad limitada al ecosistema exllamav3; no usable con llama.cpp, Ollama ni TGI.
- Los tamanos de archivo no son comparables entre formatos debido a la cuantizacion a 6 bpw de la torre de vision y a la conservacion de la cabeza MTP.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/PhilipEriksson/Qwen3.5-0.8B-Opus-Reasoning-Distilled-EXL3
- Modelo base: https://huggingface.co/PhilipEriksson/Qwen3.5-0.8B-Opus-Reasoning-Distilled
- Adaptador LoRA: https://huggingface.co/PhilipEriksson/Qwen3.5-0.8B-Opus-Reasoning-Distilled-LoRA
- Version GGUF: https://huggingface.co/PhilipEriksson/Qwen3.5-0.8B-Opus-Reasoning-Distilled-GGUF
- Version NVFP4: https://huggingface.co/PhilipEriksson/Qwen3.5-0.8B-Opus-Reasoning-Distilled-NVFP4
- Coleccion: https://huggingface.co/collections/PhilipEriksson/qwen35-08b-opus-reasoning-distilled-6ae3336176ac243223f27ee9
