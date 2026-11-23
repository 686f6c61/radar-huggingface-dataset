# prithivMLmods/gemma-4-31B-it-NVFP4-GGUF

## Resumen

`prithivMLmods/gemma-4-31B-it-NVFP4-GGUF` es una cuantizacion en formato GGUF del modelo `google/gemma-4-31B-it`, el modelo denso multimodal e instruction-tuned mas grande de la familia Gemma 4 de Google DeepMind. El modelo original cuenta con 30.697.345.956 parametros totales (incluyendo un codificador de vision de aproximadamente 550M) distribuidos en 60 capas de decodificador, y una ventana de contexto de 256K tokens.

La particularidad de esta publicacion es el uso de NVFP4, un formato de cuantizacion de 4 bits nativo para los Tensor Cores FP4 de la arquitectura NVIDIA Blackwell (SM120), lo que permite aceleracion por hardware en GPUs como RTX PRO 6000, RTX 50-series, B200 y B300. El resultado es un unico archivo de 31,5 GB que conserva las capacidades multimodales del modelo original mediante un archivo de proyeccion separado (`mmproj`, 1,2 GB).

Es relevante para desarrolladores que despliegan modelos de 31B en estaciones de trabajo o servidores con hardware Blackwell y necesitan inferencia local con llama.cpp, manteniendo contexto largo, vision y soporte de mas de 140 idiomas bajo licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal con atencion intercalada local (sliding-window de 1024 tokens) y global, Keys/Values unificadas y Proportional RoPE (p-RoPE); 60 capas de decodificador |
| Parametros totales | 30.697.345.956 (~30,7B, incluye codificador de vision de ~550M) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 256K tokens (modelo original); pruebas realizadas con 16.384 tokens |
| Tipos de cuantizacion | NVFP4 (4 bits, nativo Blackwell); KV cache en `q8_0` en las pruebas |
| Idiomas soportados | Mas de 140 idiomas en el modelo original; la model card de esta cuantizacion declara solo `en` |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (`Gemma-4-31B-it-NVFP4.gguf` de 31,5 GB + `Gemma-4-31B-it.mmproj.gguf` de 1,2 GB) |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de 60 capas que combina atencion local con ventana deslizante de 1024 tokens y atencion global completa de forma intercalada. Emplea Keys/Values unificadas y Proportional RoPE (p-RoPE), una variante de codificacion posicional rotatoria. Incorpora un codificador de vision que procesa imagenes de resolucion variable y video como secuencias de fotogramas, con un presupuesto de tokens visuales configurable entre 70 y 1.120 tokens por entrada.

El modelo original soporta system prompts nativos, function calling estructurado y un modo de razonamiento paso a paso conmutable mediante el token `<|think|>`. La model card no detalla el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO. Esta publicacion concreta es una cuantizacion realizada con llama.cpp y herramientas de NVIDIA ModelOpt (Model Optimizer), no un reentrenamiento: los pesos se convierten a NVFP4 para explotar los Tensor Cores FP4 de Blackwell.

## Capacidades

- Generacion de texto y razonamiento con modo de pensamiento conmutable (`<|think|>`).
- Comprension de imagenes de resolucion variable y de video como secuencias de fotogramas (pipeline `image-text-to-text`).
- Generacion de codigo y resolucion de problemas matematicos, incluyendo matematicas visuales.
- Function calling estructurado y soporte de system prompts nativos.
- Razonamiento multi-paso y flujos de agente.
- Capacidades multilingues: mas de 140 idiomas en el modelo base.
- Inferencia local con llama.cpp (`llama-cli`, `llama-server`) con offload completo a GPU.
- Compatibilidad declarada con endpoints y con text-generation-inference.

## Casos de uso

- Asistencia de codigo en local: el modelo resuelve tareas de estructuras de datos y algoritmos (las pruebas incluyen insercion de nodos en listas enlazadas) y puede integrarse en un servidor `llama-server` para autocompletado y revision en el IDE sin enviar codigo a la nube.
- Analisis de documentos con imagenes: gracias al codificador de vision y al presupuesto configurable de tokens visuales (70-1.120), se puede procesar capturas, diagramas y tablas escaneadas junto a texto en un mismo prompt.
- Razonamiento matematico asistido: el modo `<|think|>` permite resolver problemas de algebra y fisica paso a paso (las pruebas incluyen problemas de trenes, tuberias y edades), util en herramientas educativas.
- Procesamiento de video por muestreo de fotogramas: resumen y descripcion de clips cortos tratados como secuencias de imagenes, adecuado para catalogacion de contenido audiovisual.
- Agentes con tool calling: el soporte de function calling estructurado permite construir agentes que consulten APIs o bases de datos en flujos multi-paso sobre una estacion de trabajo Blackwell.
- Atencion al cliente multilingue: con 140 idiomas y 256K tokens de contexto en el modelo base, puede gestionar conversaciones largas y documentacion de soporte en un solo prompt.
- Despliegue en servidor con contexto largo: con 96 GB de VRAM y KV cache cuantizada, se pueden manejar sesiones de decenas de miles de tokens manteniendo vision activa.

## Benchmarks y rendimiento

Resultados publicados en la model card para el modelo base `google/gemma-4-31B-it`:

| Benchmark | Resultado |
|---|---|
| MMLU Pro | 85,2% |
| AIME 2026 (sin herramientas) | 89,2% |
| LiveCodeBench v6 | 80,0% |
| GPQA Diamond | 84,3% |
| MATH-Vision | 85,6% |

Metricas de inferencia de esta cuantizacion NVFP4 (RTX PRO 6000 Blackwell Server Edition, 96 GB VRAM, `llama-cli`, `-ngl 99`, contexto 16.384, KV cache `q8_0`, sin decodificacion especulativa, media de 5 ejecuciones):

| Metrica | Valor |
|---|---|
| Velocidad media de procesamiento de prompt | 130,77 tokens/s |
| Velocidad media de generacion | 40,54 tokens/s |
| Tiempo total de ejecucion | 175,1 s |
| VRAM pico | 32,21 GiB |
| Utilizacion pico de GPU | 98% |

## Requisitos de hardware

- VRAM estimada: aproximadamente 32,2 GiB en pico con contexto de 16K y KV cache `q8_0`; el archivo de pesos ocupa 31,5 GB mas 1,2 GB del proyector multimodal.
- GPU recomendadas: NVIDIA RTX PRO 6000 Blackwell, B200, B300 y RTX 50-series, unicas arquitecturas con Tensor Cores FP4 (SM120) que aceleran nativamente NVFP4.
- En GPUs consumer: cabe en tarjetas Blackwell de gama alta con 32 GB o mas de VRAM; en arquitecturas anteriores (Ampere, Ada) el formato NVFP4 no tiene aceleracion nativa y el rendimiento se degrada.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`), con soporte declarado de text-generation-inference y endpoints compatibles.
- Latencia y throughput: 40,54 tokens/s de generacion y 130,77 tokens/s de preprocesado en la configuracion probada; el rendimiento varia segun prompt, build y ajustes de runtime.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| gemma-4-31B-it-NVFP4-GGUF (esta ficha) | 30,7B | 256K | NVFP4 (4 bits) | Apache 2.0 | Requiere hardware Blackwell para aceleracion FP4 |
| google/gemma-4-31B-it (original) | 30,7B | 256K | BF16/FP16 | Apache 2.0 | Pesos completos, mayor VRAM, sin dependencia de Blackwell |
| Otras cuantizaciones GGUF del mismo base (Q4_K_M, Q8_0, etc.) | 30,7B | 256K | 4-8 bits | Apache 2.0 | Compatibles con llama.cpp en cualquier GPU; sin aceleracion FP4 nativa |

No se dispone en la informacion proporcionada de datos de benchmarks de modelos alternativos de otros fabricantes para una comparacion cuantitativa directa.

## Limitaciones y advertencias

- Dependencia de hardware: NVFP4 solo se acelera en GPUs Blackwell (SM120); en otras arquitecturas el rendimiento puede ser inferior al de cuantizaciones GGUF convencionales.
- La model card de esta cuantizacion declara unicamente el idioma `en`, aunque el modelo base soporta mas de 140 idiomas; conviene validar el comportamiento multilingue tras la cuantizacion.
- Riesgo de alucinacion inherente a los modelos de lenguaje, no cuantificado en la informacion disponible.
- No se documentan sesgos conocidos ni evaluaciones de seguridad especificas para esta cuantizacion.
- La cuantizacion a 4 bits puede introducir degradacion en tareas sensibles a la precision (matematicas, codigo) respecto a los pesos originales; no se publican comparativas de calidad frente al modelo base.
- Las metricas de rendimiento corresponden a una unica configuracion de hardware y software y no son extrapolables a otros entornos.
- Aunque la licencia es Apache 2.0, conviene revisar los terminos del modelo base `google/gemma-4-31B-it` antes de un despliegue comercial.
- El contexto probado (16.384 tokens) es muy inferior a los 256K del modelo base; el uso de contextos largos requiere mas VRAM para la KV cache.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/prithivMLmods/gemma-4-31B-it-NVFP4-GGUF
- Modelo base: https://huggingface.co/google/gemma-4-31B-it
- Archivo de pesos NVFP4: https://huggingface.co/prithivMLmods/gemma-4-31B-it-NVFP4-GGUF/blob/main/Gemma-4-31B-it-NVFP4.gguf
- Proyector multimodal: https://huggingface.co/prithivMLmods/gemma-4-31B-it-NVFP4-GGUF/blob/main/Gemma-4-31B-it.mmproj.gguf
- llama.cpp: https://github.com/ggml-org/llama.cpp
