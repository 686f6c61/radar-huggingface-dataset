# litert-community/Ministral-3-8B-Instruct-2512

## Resumen
Ministral-3-8B-Instruct-2512 es la version instruct del modelo Ministral 3 8B de Mistral AI, un transformer denso decoder-only de 8.489.553.920 parametros disenado para despliegue en el borde (edge). Esta ficha concreta, publicada por la comunidad litert-community, no contiene los pesos originales en safetensors sino una conversion al formato `.litertlm` para el runtime LiteRT-LM de Google, orientado a ejecucion en dispositivos moviles y equipos de escritorio con aceleracion GPU via delegados OpenCL.

El modelo base combina un modelo de lenguaje de 8.4B con un encoder de vision de 0.4B, aunque esta conversion es exclusivamente de texto: el encoder visual no esta incluido en los ficheros. Se distribuye en dos variantes cuantizadas, int8 e int4, ambas con el grafo compuesto para GPU, y esta pensado para escenarios donde no es viable servir el modelo en la nube.

Su relevancia actual radica en que demuestra que un modelo de 8B puede ejecutarse de forma interactiva en un telefono de gama alta (5.6-5.7 tok/s en un Galaxy S26) y en un portatil Apple Silicon (61.7 tok/s en un Mac Studio M4 Max), manteniendo una precision casi identica al bf16 de referencia en GSM8K. La licencia Apache 2.0 facilita su adopcion comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso decoder-only (34 capas, hidden size 4096, 32 cabezas de atencion con 8 KV heads, embeddings no atados) |
| Parametros totales | 8.489.553.920 (modelo de lenguaje); el release original incluye ademas un encoder de vision de 0.4B no presente en esta conversion |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 256K en el modelo base; 4096 tokens en estos ficheros |
| Tipos de cuantizacion | int8 (dynamic en lineales, activaciones float) e int4 (blockwise-32 + OCTAV en lineales, embeddings int8) |
| Idiomas soportados | once idiomas segun Mistral AI (de ingles a arabe); no se detalla la lista completa en la informacion disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `.litertlm` (LiteRT-LM); fichero int8 de 8.64 GB y fichero int4 de 5.04 GB |

## Arquitectura y entrenamiento
El modelo base es un transformer denso decoder-only de 34 capas con hidden size 4096, 32 cabezas de atencion y 8 KV heads (GQA), vocabulario de 131.072 tokens con embeddings no atados y una ventana de contexto de 256K en el modelo original. Mistral AI lo describe como el modelo equilibrado de la familia Ministral 3, con capacidades de vision en el release completo (encoder de 0.4B), y esta version es la post-entrenada para instrucciones y chat.

La conversion a LiteRT-LM se realizo con litert-torch 0.9.4 a partir de los pesos BF16 del repositorio `Ministral-3-8B-Instruct-2512-BF16` (el repositorio principal publica pesos FP8). El fichero int8 aplica cuantizacion dinamica en las capas lineales con activaciones en coma flotante y mantiene la tabla de embeddings en una seccion separada; el fichero int4 usa cuantizacion blockwise de tamano 32 junto con OCTAV en las lineales y embeddings en int8. Ambos incluyen el grafo compuesto para GPU y se probaron con litert-lm 0.18.0. No se detallan en la informacion disponible el volumen de tokens de entrenamiento, la composicion del dataset ni las etapas de RLHF o DPO aplicadas por Mistral AI.

## Capacidades
- Generacion de texto y razonamiento en modo chat e instrucciones; Mistral AI recomienda temperatura inferior a 0.1 para uso diario y produccion.
- Razonamiento matematico paso a paso (formato con linea final `#### <numero>`), validado en GSM8K.
- Capacidades multilingues: once idiomas segun Mistral AI, del ingles al arabe.
- Capacidad de vision en el modelo base original (encoder de 0.4B), no disponible en esta conversion de texto.
- No se documenta soporte de tool calling ni function calling en la informacion disponible.
- No se documenta soporte explicito de agentes o razonamiento multi-paso en la informacion disponible.
- No se documenta modo thinking ni capacidades de audio.

## Casos de uso
- Asistentes conversacionales en dispositivo: el modelo puede gestionar dialogos multi-turno con un contexto de 4096 tokens en estos ficheros, sin enviar datos a la nube, lo que resulta adecuado para aplicaciones de privacidad en moviles Android de gama alta.
- Resolucion de problemas matematicos en local: con el formato de razonamiento paso a paso y una precision del 96-97% en GSM8K (n=100) en las variantes cuantizadas, es util para tutoria educativa offline.
- Generacion de texto en portatiles Apple Silicon: el fichero int4 alcanza 61.7 tok/s en un Mac Studio M4 Max, suficiente para escritura asistida, resumen y reescritura en tiempo interactivo.
- Procesamiento de documentos con contexto medio: la ventana de 4096 tokens permite clasificar, resumir y extraer informacion de fragmentos de texto sin infraestructura de servidor.
- Aplicaciones de traduccion entre los once idiomas soportados en entornos sin conectividad, como dispositivos de campo o escenarios de red restringida.
- Prototipado rapido en el borde: gracias a la licencia Apache 2.0 y al formato `.litertlm`, se puede integrar en pruebas de concepto sobre Android o macOS sin coste de licencia ni dependencia de API.
- Filtrado y moderacion de contenido local: el modelo puede clasificar o reescribir texto en el propio dispositivo, reduciendo la latencia y el coste de llamadas a servicios externos.

## Benchmarks y rendimiento
Los unicos datos de precision publicados corresponden a GSM8K (preguntas 0-99, instruccion paso a paso, decodificacion greedy, maximo 1024 tokens de salida, temperatura 0), medidos por el autor de la conversion:

| Configuracion | GSM8K (n=100) |
|---|---|
| bf16 de referencia (transformers, MPS) | 95 |
| int8, litert-lm en GPU de Mac | 97 |
| int4, litert-lm en GPU de Mac | 96 |

En la comprobacion de correctitud de 8 preguntas, tanto int8 como int4 obtuvieron 8/8 en CPU y GPU del Mac M4 Max, igual que bf16. IFEval no se ejecuto. Mistral AI reporta en su model card otros benchmarks (Arena Hard, WildBench, MATH, MM MTBench) que no se incluyen en la informacion disponible.

Rendimiento medido (prefill de 1024 tokens mas 256 tokens decodificados, contexto 2048):

| Configuracion | Mac M4 Max | Galaxy S26 | Pixel 8a |
|---|---|---|---|
| int4 GPU | 5.45 s | 55.0 y 56.4 s (dos ejecuciones) | detenido por la regla de memoria |
| int8 GPU | 6.79 s | no ejecutado tras reinicio del telefono | no ejecutado: el fichero supera la RAM del telefono |
| int8 CPU | 30.5 s | no ejecutado | no ejecutado |
| int4 CPU | 38.3 s | no ejecutado | no ejecutado |

Velocidad de decodificacion: 61.7 tok/s en GPU de Mac M4 Max (int4) y 5.6-5.7 tok/s en GPU de Galaxy S26 (int4). En iOS no se midio porque ambas secciones principales de pesos superan los 2 GiB (7.53 GiB en int8 y 4.18 GiB en int4).

## Requisitos de hardware
- VRAM/RAM estimada: el fichero int8 ocupa 8.64 GB y el int4 5.04 GB en disco; la seccion principal de pesos int8 es de 7.53 GiB y la int4 de 4.18 GiB, mas una seccion de embeddings de 547.893.680 bytes.
- GPU recomendadas: Apple Silicon (M4 Max medido), GPU moviles con soporte OpenCL (Galaxy S26 medido); no se documentan pruebas en A100, H100 ni RTX 4090.
- Cabe en consumer GPU: si, en equipos con suficiente memoria unificada o VRAM; en moviles, el int4 cabe en un Galaxy S26 pero no en un Pixel 8a (supera la RAM del dispositivo), y ninguno de los dos ficheros es viable en iOS por el limite de 2 GiB por seccion.
- Opciones de despliegue: runtime LiteRT-LM (libreria `litert-lm`, version probada 0.18.0; tambien funciono en 0.17.1), con binario Android precompilado y API Python; no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI para este formato.
- Latencia y throughput: ver tabla de rendimiento; el int4 es mas rapido en ambas GPU medidas, mientras que en CPU de Mac el int8 es mas rapido por un prefill el doble de veloz.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Ministral-3-8B-Instruct-2512 (LiteRT-LM, esta ficha) | 8.49B | 4096 (256K en el base) | `.litertlm` int8/int4 | Apache 2.0 | Solo texto; optimizado para edge |
| Ministral-3-8B-Instruct-2512 (original Mistral AI) | 8.4B + 0.4B vision | 256K | safetensors BF16/FP8 | Apache 2.0 | Incluye encoder de vision |
| Ministral-3-3B-Instruct-2512 (LiteRT-LM) | no disponible | no disponible | `.litertlm` | Apache 2.0 | Version menor de la misma familia convertida por la misma comunidad |

No se dispone de datos de benchmarks comparativos con otras alternativas en la informacion proporcionada.

## Limitaciones y advertencias
- Esta conversion es solo de texto: el encoder de vision del release original no esta incluido, por lo que no puede procesar imagenes.
- El contexto practico se reduce a 4096 tokens en estos ficheros, muy por debajo de los 256K del modelo base.
- No es desplegable en iOS con estos ficheros debido al limite de 2 GiB por seccion de pesos.
- No cabe en dispositivos con poca RAM (el Pixel 8a fue descartado por la regla de memoria del autor).
- Riesgo de alucinacion inherente a los modelos de lenguaje; no se han publicado evaluaciones especificas de sesgo en la informacion disponible.
- En la prueba de salidas largas, dos de las ocho respuestas por fichero alcanzaron el limite de 512 tokens, lo que sugiere posibles respuestas excesivamente extensas en algunos casos.
- El modelo base es de Mistral AI, pero la conversion y sus pruebas las realiza la comunidad litert-community; no hay garantia de soporte oficial.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar los terminos del modelo base original de Mistral AI antes de un despliegue en produccion.

## Enlaces
- Repositorio Hugging Face de esta conversion: https://huggingface.co/litert-community/Ministral-3-8B-Instruct-2512
- Modelo base: https://huggingface.co/mistralai/Ministral-3-8B-Instruct-2512
- Pesos BF16 del modelo base: https://huggingface.co/mistralai/Ministral-3-8B-Instruct-2512-BF16
- Conversion de la variante 3B: https://huggingface.co/litert-community/Ministral-3-3B-Instruct-2512
- Runtime LiteRT-LM: https://github.com/google-ai-edge/LiteRT-LM
- Script de verificacion de calidad: https://github.com/john-rocky/hf-to-litertlm/blob/main/scripts/verify_quality.py
