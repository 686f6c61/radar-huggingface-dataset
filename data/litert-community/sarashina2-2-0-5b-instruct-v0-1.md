# litert-community/sarashina2.2-0.5b-instruct-v0.1

## Resumen

sarashina2.2-0.5b-instruct-v0.1 es un modelo de lenguaje de tipo Llama denso desarrollado por SB Intuitions y orientado al japones, publicado bajo licencia MIT. Esta ficha concreta, mantenida por la comunidad litert-community, no es el modelo original en PyTorch sino su conversion al formato `.litertlm` para el runtime LiteRT-LM de Google, pensado para inferencia en dispositivo (CPU y GPU de moviles y equipos de sobremesa) sin conexion a red.

El modelo resuelve el problema de ejecutar chat en japones en hardware de borde con un consumo de memoria contenido: los bundles ocupan entre 534 MB (int4) y 871 MB (int8), y el KV cache esta limitado a 4096 tokens. Con 0,5 mil millones de parametros y una arquitectura de 24 capas, hidden 1280 y GQA 16:8, es un modelo pequeno que prioriza el idioma japones sobre el rendimiento multilingue.

Su relevancia actual radica en que demuestra un pipeline completo de conversion (litert-torch 0.9.3) y despliegue en dispositivos reales con mediciones publicadas de prefill, decode y TTFT en Galaxy S26, Pixel 8a y Apple M4 Max, ademas de una demo web con WebGPU que carga el bundle int4 de 535 MB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo Llama, denso (solo atencion), 24 capas, hidden 1280, GQA 16:8 |
| Parametros totales | 0,5 mil millones (aprox.); 262 M corresponden a embeddings y capa de salida untied |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4096 tokens (limite de KV cache declarado en el bundle) |
| Tipos de cuantizacion | int8 dynamic (lineales + embeddings); int4 blockwise-32 + OCTAV (lineales) con embeddings int8 |
| Idiomas soportados | japones (ja), ingles (en); el ajuste esta orientado a japones |
| Licencia | MIT |
| Formato de pesos | `.litertlm` (LiteRT-LM); el modelo base esta en safetensors/PyTorch |
| Vocabulario | 102.400 tokens, untied |
| Formato de chat | `<\|user\|>…</s><\|assistant\|>…</s>`, system `<\|system\|>…</s>`, stop token `</s>` (id 2) |
| Runtime verificado | litert-lm 0.16.x |
| Tamano del repo | 2,8 GB |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de estilo Llama con atencion unicamente, sin capas SSM ni hibridas, y sin canal de razonamiento (no es un modelo de "thinking"). Consta de 24 capas con dimension oculta 1280 y atencion con query grouping 16:8. El vocabulario es de 102.400 tokens con embeddings y capa de salida no atados, lo que concentra 262 M parametros en esas dos matrices y explica buena parte del coste de decodificacion en dispositivos.

SB Intuitions realizo preentrenamiento e instruccion sobre datos en japones, aunque la informacion disponible no detalla el numero de tokens, la composicion del corpus ni si se aplicaron etapas de RLHF o DPO. La conversion a LiteRT-LM se hizo con litert-torch 0.9.3 y preserva el tokenizador original: el bundle incrusta el `tokenizer.json` de Hugging Face como plantilla estructurada y se verifico la coincidencia exacta de IDs en siete cadenas de prueba (especiales, japones, mixtas, emoji/variantes, Latin-1, espacios y simbolos como ①㈱〒). El bundle declara ademas 11 firmas de prefill (de 1 a 1024 tokens) para optimizar la fase de prefill.

## Capacidades

- Generacion de texto conversacional en japones e ingles, con formato de chat multi-turno (system, user, assistant).
- Razonamiento basico y calculo aritmetico simple: en las pruebas de 8 preguntas se cubren calculo, capitales, antonimos, dias de la semana, traduccion, multiplicacion y comparacion de decimales.
- Respuestas a preguntas de conocimiento general en japones (JCommonsenseQA en el harness propio del autor).
- Traduccion japones-ingles a nivel de frase en el marco de las pruebas realizadas.
- Decodificacion por streaming token a token sin caracteres de reemplazo (U+FFFD) en textos con emoji y caracteres variantes.
- Soporte de conversacion multi-turno verificado en las cuatro variantes (int8/int4, CPU/GPU) sin respuestas vacias ni fugas de tokens especiales.
- No dispone de tool calling ni function calling documentado.
- No dispone de modo de razonamiento explicito, vision ni audio.
- Capacidad multilingue limitada: fuera del japones el rendimiento cae de forma marcada; en la demo web la misma pregunta obtiene respuesta correcta en japones y sin sentido en ingles.

## Casos de uso

- Chat en japones sin conexion en moviles Android: el bundle int4 (534 MB) se importa en Google AI Edge Gallery o en una app propia con LiteRT-LM y permite conversar en japones en el dispositivo, con 31,8-40,3 tok/s de decode en GPU de Galaxy S26.
- Asistente de bolsillo en iPhone: el modelo cabe holgadamente por debajo del limite de mmap de 2 GiB por seccion de iOS, por lo que es desplegable en apps nativas sin particionar el archivo.
- Demo web con WebGPU: el bundle int4 de 535 MB se carga en el navegador mediante LiteRT-LM y sirve para validar la calidad en japones antes de integrar el modelo en produccion.
- Procesamiento de texto japones en el borde para privacidad: clasificacion, resumen breve o reescritura de mensajes sin enviar datos a la nube, aprovechando el KV cache de 4096 tokens para conversaciones de varias vueltas.
- Prototipado rapido de asistentes japoneses en portatiles Apple Silicon: con 197 tok/s de decode en M4 Max (GPU) se pueden iterar prompts y plantillas de chat con latencia de 58 ms hasta el primer token.
- Evaluacion comparativa de runtimes y cuantizaciones: el repositorio publica mediciones reproducibles (prefill, decode, TTFT, RSS) en tres dispositivos, util para decidir entre int8 e int4 en funcion de memoria y velocidad.
- Filtrado o extraccion de informacion en formularios y textos japoneses en entornos con CPU exclusivamente: en Galaxy S26 con CPU se obtienen 18,8-21,0 tok/s de decode, suficiente para tareas de baja concurrencia.

## Benchmarks y rendimiento

Precision en JCommonsenseQA (JGLUE v1.3 valid, primeros 100 items, greedy, harness propio del autor; solo comparable dentro de ese harness):

| Configuracion | Aciertos |
|---|---|
| PyTorch bf16 (referencia, MPS) | 65/100 |
| LiteRT int8 (CPU) | 62/100 |
| LiteRT int4 block-32 (CPU) | 65/100 |

Comprobacion de 8 preguntas en Apple M4 Max (1 pregunta por proceso, greedy):

| Configuracion | Ingles | Japones |
|---|---|---|
| int8 CPU | 7/8 | 7/8 |
| int8 GPU | 6/8 | 7/8 |
| int4 CPU | 6/8 | 8/8 |
| int4 GPU | 6/8 | 8/8 |
| bf16 PyTorch (referencia) | 6/8 | 8/8 |

Rendimiento en Galaxy S26 (SM-S942Q, Adreno, litert-lm 0.16.0, prompt de 321 tokens, dos repeticiones):

| Archivo | Backend | Prefill | Decode | TTFT | RSS pico |
|---|---|---|---|---|---|
| int8 | GPU (OpenCL) | 862-895 tok/s | 36,2-36,5 tok/s | 0,39-0,40 s | 848-849 MiB |
| int8 | CPU | 295-349 tok/s | 20,1-21,0 tok/s | 0,97-1,14 s | 1623-1625 MiB |
| int4 | GPU (OpenCL) | 661-903 tok/s | 31,8-40,3 tok/s | 0,38-0,52 s | 882-883 MiB |
| int4 | CPU | 133-135 tok/s | 18,8-19,5 tok/s | 2,44-2,47 s | 1316-1400 MiB |

Rendimiento en Apple M4 Max (litert-lm benchmark 0.16.0, `-p 256 -d 256 --runs 3 --cache no`):

| Archivo | Backend | Prefill | Decode | TTFT |
|---|---|---|---|---|
| int8 | GPU | 5722 tok/s | 197,1 tok/s | 0,058 s |
| int8 | CPU | 1029 tok/s | 47,0 tok/s | 0,530 s |
| int4 | GPU | 5754 tok/s | 197,8 tok/s | 0,058 s |
| int4 | CPU | 546 tok/s | 42,7 tok/s | 0,565 s |

Datos de Pixel 8a (int8, GPU): 16,8 tok/s de decode, 297 tok/s de prefill, TTFT 1,14 s, con las 1066 operaciones delegadas. No se han publicado resultados de MMLU, HumanEval, GSM8K ni Japanese MT Bench medidos sobre estos bundles; la model card del modelo base cita Elyza-tasks-100 2,38 y Japanese MT Bench 4,55.

## Requisitos de hardware

- VRAM/memoria: int4 requiere aproximadamente 534 MB de pesos; int8, 871 MB. El RSS pico medido en Galaxy S26 es de 848-883 MiB (GPU) y 1316-1625 MiB (CPU).
- GPU recomendadas: no requiere GPU de datacenter; esta disenado para GPU integradas de moviles (Adreno en Galaxy S26, Mali en Pixel 8a) y GPU de Apple Silicon (M4 Max).
- GPU de consumo: cabe en cualquier GPU de consumo moderna; el cuello de botella es la memoria del dispositivo, no la capacidad de calculo.
- Despliegue: LiteRT-LM 0.16.x mediante CLI (`litert-lm run` con `--backend gpu|cpu`) y API de Python; integracion en Android via Google AI Edge Gallery; demo web con WebGPU. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI para este formato.
- Latencia y throughput: TTFT de 0,058 s en M4 Max GPU y 0,38-0,52 s en Galaxy S26 GPU; decode de 197 tok/s en M4 Max GPU y 31,8-40,3 tok/s en Galaxy S26 GPU. La velocidad esta limitada por el vocabulario untied de 102.400 entradas: a modo de referencia, LFM2.5-230M (vocabulario 65k, tied) alcanza 122 tok/s de decode en el mismo S26 GPU.
- Delegacion: en Galaxy S26 GPU se delegan las 1066 operaciones de los grafos de prefill y decode a LITERT_CL, sin retorno a XNNPack.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato/despliegue | Notas |
|---|---|---|---|---|---|---|
| sarashina2.2-0.5b-instruct-v0.1 (LiteRT-LM) | 0,5 B | 4096 | ja, en | MIT | `.litertlm`, LiteRT-LM | Especializado en japones, mediciones en dispositivo publicadas |
| sbintuitions/sarashina2.2-0.5b-instruct-v0.1 | 0,5 B | no disponible | ja, en | MIT | safetensors/PyTorch | Modelo base del que se deriva esta conversion; misma arquitectura y calidad de referencia |
| LFM2.5-230M | 230 M | no disponible | no disponible | no disponible | LiteRT-LM | Citado por el autor como referencia de velocidad (122 tok/s en S26 GPU); menor tamano y vocabulario tied |
| Otros LLM japoneses de ~0,5 B | no disponible | no disponible | ja | variable | variable | No se dispone de datos comparativos en la informacion proporcionada |

## Limitaciones y advertencias

- El rendimiento en ingles es claramente inferior al japones: en las pruebas de 8 preguntas el modelo falla items que el bf16 de referencia tambien falla, y en la demo web responde sin sentido a preguntas en ingles.
- Riesgo de alucinacion propio de un modelo de 0,5 B: no debe usarse como fuente de conocimiento factual sin verificacion externa.
- Contexto limitado a 4096 tokens de KV cache; no apto para documentos largos ni conversaciones extensas.
- No dispone de tool calling, function calling, modo de razonamiento ni capacidades multimodales.
- La evaluacion de precision procede de un harness propio con solo 100 items de JCommonsenseQA y 8 preguntas ad hoc; no es comparable con puntuaciones JGLUE publicadas ni con benchmarks estandar.
- La licencia MIT del modelo base se mantiene en la conversion, pero conviene revisar las condiciones de los datos de entrenamiento originales antes de un uso comercial a gran escala.
- El formato `.litertlm` solo es utilizable con LiteRT-LM; para otros runtimes hay que recurrir al modelo base en PyTorch.
- En iOS existe un limite de mmap de 2 GiB por seccion, aunque los bundles actuales quedan muy por debajo.
- Las cifras de rendimiento corresponden a versiones concretas de runtime (litert-lm 0.16.0) y dispositivos concretos; pueden variar con otras versiones o hardware.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/litert-community/sarashina2.2-0.5b-instruct-v0.1
- Modelo base: https://huggingface.co/sbintuitions/sarashina2.2-0.5b-instruct-v0.1
- Runtime LiteRT-LM: https://github.com/google-ai-edge/litert-lm
- Demo web de chat (WebGPU): https://google-ai-edge.github.io/LiteRT-LM/web_demos/chat/index.html?model=litert-community/sarashina2.2-0.5b-instruct-v0.1
- Google AI Edge Gallery: https://github.com/google-ai-edge/gallery
- Herramienta de conversion litert-torch: https://github.com/google-ai-edge/litert-torch
- Registro de mediciones int4: https://github.com/john-rocky/edge-compat/blob/main/cards/sarashina2.2-0.5b-instruct-v0.1-int4/CARD.md
- Registro de mediciones int8: https://github.com/john-rocky/edge-compat/blob/main/cards/sarashina2.2-0.5b-instruct-v0.1-int8/CARD.md
