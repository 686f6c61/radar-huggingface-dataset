# litert-community/Ministral-3-8B-Instruct-2512

## Resumen

Ministral-3-8B-Instruct-2512 en formato LiteRT-LM es una conversión del modelo denso Ministral 3 8B Instruct de Mistral AI, empaquetada por la comunidad litert-community para el runtime LiteRT-LM de Google (anteriormente TensorFlow Lite). El objetivo es el despliegue en dispositivo (on-device) sobre GPUs móviles y de escritorio, con dos ficheros `.litertlm` que incluyen el grafo compuesto para GPU: una variante int8 (8,64 GB) y otra int4 (5,04 GB). Esta conversión es solo de texto: no incluye el codificador de visión del release original.

El modelo subyacente es un transformer decoder-only denso de 34 capas, tamaño oculto 4096, 32 cabezas de atención con 8 cabezas KV, vocabulario de 131.072 tokens con embeddings no atados y 8.489.553.920 parámetros en los tensores de origen. Mistral AI lo describe como el modelo equilibrado de la familia Ministral 3, orientado a edge, con once idiomas soportados (del inglés al árabe) y temperatura recomendada por debajo de 0,1 para uso en producción. El contexto original es de 256K tokens, aunque en estos ficheros LiteRT-LM está limitado a 4096.

La relevancia actual radica en que permite ejecutar un modelo de 8B con calidad de instrucción en hardware móvil (Galaxy S26) y de escritorio (Mac Studio M4 Max) a velocidades utilizables (61,7 tok/s en M4 Max, 5,6–5,7 tok/s en Galaxy S26 con la variante int4), manteniendo la precisión en GSM8K casi idéntica a la referencia bf16 (96–97 frente a 95). Es una opción práctica para aplicaciones offline, privacidad por diseño y entornos sin conectividad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (34 capas, hidden 4096, 32 cabezas de atención, 8 cabezas KV) |
| Parametros totales | 8.489.553.920 (8,4B en el modelo de lenguaje; el release original añade 0,4B de codificador de visión, no incluido aquí) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 256K en el modelo original; 4096 en estos ficheros LiteRT-LM |
| Tipos de cuantizacion | int8 (dynamic en lineales, activaciones float) e int4 (blockwise-32 + OCTAV en lineales, embeddings int8) |
| Idiomas soportados | Once idiomas según Mistral AI (del inglés al árabe); lista concreta no disponible en la información proporcionada |
| Licencia | Apache 2.0 |
| Formato de pesos | `.litertlm` (LiteRT-LM); pesos de origen BF16 convertidos con litert-torch 0.9.4 |

## Arquitectura y entrenamiento

El modelo base es un transformer decoder-only denso con 34 capas, dimensión oculta 4096, 32 cabezas de atención y 8 cabezas KV (GQA), vocabulario de 131.072 tokens con embeddings no atados y 8.489.553.920 parámetros. Mistral AI lo publica como versión instruct post-entrenada para chat e instrucciones, con capacidades de visión en el release original (0,4B de codificador visual) que no se incluyen en esta conversión LiteRT-LM, que es solo texto. Los pesos convertidos provienen del repositorio BF16 (el repositorio estándar publica pesos FP8).

La conversión la realiza litert-community con litert-torch 0.9.4 y se prueba sobre litert-lm 0.18.0. Los ficheros incluyen el grafo compuesto para GPU: en la variante int4, las siete firmas del decoder se delegan completamente a la GPU en Mac (con una firma de embeddings de 4 operaciones que ejecuta una operación en CPU), y en Galaxy S26 se delegan las siete firmas del decoder con 1586/1417/1448 operaciones en el delegado OpenCL. La variante int8 usa cuantización dinámica en las capas lineales con activaciones float y tabla de embeddings en una sección separada; la int4 usa cuantización blockwise de tamaño 32 más OCTAV en lineales y embeddings int8. No se detallan en la información disponible los datos de entrenamiento (número de tokens, composición del dataset) ni si hubo RLHF o DPO en el post-entrenamiento del modelo base.

## Capacidades

- Generación de texto y conversación multi-turno en modo instruct (chat), con plantilla de sistema por defecto incluida en el bundle.
- Razonamiento aritmético y matemático de varios pasos: 95–97 sobre 100 en GSM8K según configuración.
- Respuesta a instrucciones con formato controlado (se verificó el patrón `#### <número>` en GSM8K y respuestas breves con "Answer briefly.").
- Multilingüe: once idiomas según Mistral AI (del inglés al árabe); la lista completa no está disponible en la información proporcionada.
- Ejecución en GPU móvil y de escritorio mediante delegados OpenCL y GPU del runtime LiteRT-LM.
- No incluye visión en esta conversión (el codificador visual del release original no está en los ficheros).
- No se documenta en la información disponible soporte de tool calling, function calling ni modo thinking explícito.

## Casos de uso

- Asistentes offline en movilidad: el fichero int4 (5,04 GB) se ejecuta en un Galaxy S26 a 5,6–5,7 tok/s en GPU, lo que permite asistentes de chat sin conectividad y con privacidad por diseño (los datos no salen del dispositivo).
- Aplicaciones de escritorio con GPU de consumo: en un Mac Studio M4 Max el int4 decodifica a 61,7 tok/s, adecuado para herramientas de productividad locales, resumen de documentos y generación de texto interactiva.
- Razonamiento matemático y resolución de problemas paso a paso: con 96–97/100 en GSM8K (n=100) en las variantes cuantizadas, es viable para tutores educativos o validadores aritméticos en local.
- Procesamiento de conversaciones multi-turno con contexto moderado: la ventana de 4096 tokens de estos ficheros cubre diálogos de varias rondas (se verificó una conversación de tres turnos con arrastre de contexto entre turnos).
- Generación de texto por lotes en CPU cuando no hay GPU: en Mac M4 Max el int8 en CPU tarda 30,5 s para 1024 tokens de prefill más 256 de decodificación a contexto 2048, útil para pipelines por lotes no interactivos.
- Prototipado e integración en apps Android mediante el binario precompilado de LiteRT-LM, con la variante int4 como opción por defecto en GPUs móviles (el int8 no se ejecutó tras reiniciar el teléfono y el Pixel 8a detuvo la ejecución por la regla de memoria del proyecto).

## Benchmarks y rendimiento

GSM8K (preguntas de test 0–99, instrucción paso a paso, línea final `#### <número>`, plantilla del bundle con turno de sistema por defecto, greedy, máximo 1024 tokens de salida, proceso nuevo por pregunta, litert-lm 0.18.0 Python API, GPU de Mac; bf16 en transformers sobre MPS con los mismos bytes de prompt):

| Configuración | GSM8K (n=100) |
|---|---|
| bf16 referencia (transformers, MPS) | 95 |
| int8, litert-lm GPU Mac | 97 |
| int4, litert-lm GPU Mac | 96 |

Tiempos para 1024 tokens de prefill más 256 de decodificación a contexto 2048:

| Segundos | Mac M4 Max | Galaxy S26 | Pixel 8a |
|---|---|---|---|
| int4 GPU | 5,45 | 55,0 y 56,4 (dos ejecuciones) | detenido por la regla de memoria |
| int8 GPU | 6,79 | no ejecutado tras reinicio | no ejecutado: el fichero supera la RAM del teléfono |
| int8 CPU | 30,5 | no ejecutado | no ejecutado |
| int4 CPU | 38,3 | no ejecutado | no ejecutado |

Otras comprobaciones: 8/8 en un test de 8 preguntas para int8 e int4 en CPU y GPU de Mac, y 8/8 para bf16; verificación de longitud de prompt con 18 prompts de 542 a 584 tokens (incluido el turno de sistema por defecto de 524 tokens) con recuento de tokens coincidente con transformers; comprobación de salidas largas (cuatro prompts, greedy y muestreo por defecto, hasta 512 tokens, CPU) sin bucles, con dos de las ocho respuestas por fichero alcanzando el límite de 512 tokens. IFEval no se ejecutó para este modelo. Mistral AI publica en su model card otros benchmarks (Arena Hard, WildBench, MATH, MM MTBench) no reproducidos aquí.

## Requisitos de hardware

- VRAM/RAM: int4 ocupa 5,04 GB (4,18 GiB en la sección principal de pesos más 547.893.680 bytes de tabla de embeddings); int8 ocupa 8,64 GB (7,53 GiB en la sección principal más la misma tabla de embeddings).
- GPU de escritorio: Mac Studio M4 Max validado (int4 a 61,7 tok/s, int8 a menor velocidad en GPU; en CPU el int8 es más rápido que el int4 por un prefill el doble de rápido).
- GPU móvil: Galaxy S26 validado con int4 (5,6–5,7 tok/s en GPU, delegado OpenCL); Pixel 8a descartado por la regla de memoria del proyecto (el int4 se detuvo y el int8 supera la RAM del teléfono).
- GPU de consumo tipo RTX 4090, A100 o H100: no se han publicado mediciones en la información disponible.
- iOS: no medido; ambas secciones principales de pesos superan los 2 GiB (int8 8.088.047.040 bytes, int4 4.488.362.336 bytes), lo que según la model card del modelo hermano Ministral-3-3B-Instruct-2512 es la razón por la que no se ha probado en iOS.
- Despliegue: runtime LiteRT-LM (versión probada 0.18.0; también funcionó en 0.17.1 respondiendo "Paris" a un `run` simple), con binario precompilado para Android. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI para este formato.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato/Disponibilidad | Notas |
|---|---|---|---|---|---|
| Ministral-3-8B-Instruct-2512 (LiteRT-LM, este) | 8,4B | 4096 en estos ficheros (256K original) | Apache 2.0 | `.litertlm` int8/int4, on-device | Solo texto; GSM8K 96–97 (n=100) |
| Ministral-3-8B-Instruct-2512 (original Mistral AI) | 8,4B + 0,4B visión | 256K | Apache 2.0 | safetensors BF16/FP8 | Incluye visión; benchmarks propios en su model card |
| Ministral-3-3B-Instruct-2512 (LiteRT-LM) | no disponible en la información proporcionada | no disponible | Apache 2.0 | `.litertlm` | Conversión hermana de litert-community; su card explica la limitación de iOS |

No se dispone en la información proporcionada de datos de benchmarks comparables entre estas variantes más allá de las notas indicadas.

## Limitaciones y advertencias

- Solo texto: el codificador de visión del release original (0,4B) no está incluido, por lo que no hay capacidades multimodales en estos ficheros.
- Contexto reducido: 4096 tokens frente a los 256K del modelo original; no apto para documentos largos o conversaciones extensas sin truncado.
- Precisión dependiente de la cuantización: aunque GSM8K se mantiene (96–97 frente a 95 en bf16), hay diferencias pregunta a pregunta (cuatro preguntas distintas en int8, tres en int4) y una respuesta por fila sin línea final; no debe asumirse equivalencia exacta con bf16.
- Riesgo de alucinación inherente a los modelos de lenguaje; no se documentan evaluaciones específicas de sesgo en la información disponible.
- Idiomas: se citan once idiomas según Mistral AI, pero la lista concreta y la calidad por idioma no están disponibles; el rendimiento fuera del inglés no está medido en esta conversión.
- Licencia Apache 2.0 permite uso comercial, pero debe verificarse el cumplimiento de las condiciones del modelo base de Mistral AI y de las dependencias del runtime LiteRT-LM.
- Limitaciones de plataforma: no probado en iOS por el tamaño de las secciones de pesos (>2 GiB); en Pixel 8a el int4 se detuvo por la regla de memoria del proyecto y el int8 no cabe en RAM.
- El int8 no se ejecutó en Galaxy S26 tras reiniciar el teléfono; el rendimiento en ese dispositivo solo está validado para int4.
- Temperatura recomendada por Mistral AI inferior a 0,1 para uso diario y producción; valores superiores pueden degradar la calidad.
- IFEval no se ejecutó, por lo que no hay medición de seguimiento de instrucciones en esta conversión.

## Enlaces

- Hugging Face: https://huggingface.co/litert-community/Ministral-3-8B-Instruct-2512
- Modelo base: https://huggingface.co/mistralai/Ministral-3-8B-Instruct-2512
- Modelo base en BF16: https://huggingface.co/mistralai/Ministral-3-8B-Instruct-2512-BF16
- Conversión hermana 3B: https://huggingface.co/litert-community/Ministral-3-3B-Instruct-2512
- Runtime LiteRT-LM: https://github.com/google-ai-edge/LiteRT-LM
- Script de verificación de calidad: https://github.com/john-rocky/hf-to-litertlm/blob/main/scripts/verify_quality.py
