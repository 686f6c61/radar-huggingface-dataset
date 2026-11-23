# litert-community/granite-4.1-8b

## Resumen

Granite-4.1-8B en formato LiteRT-LM es una conversión del modelo denso `ibm-granite/granite-4.1-8b` de IBM al formato `.litertlm`, pensado para el runtime LiteRT-LM de Google (orientado a despliegue en dispositivo, edge y móvil). El paquete lo publica el colectivo `litert-community` e incluye dos ficheros: uno con cuantización int8 y otro con cuantización int4, ambos con grafo compuesto para GPU. La conversión se realizó con litert-torch 0.9.4 y se probó con litert-lm 0.18.0.

El modelo base es un transformer decoder-only denso de 8.791.592.960 parámetros en bf16 (8,38 B sin la copia almacenada de la tabla de salida atada), con 40 capas, hidden size 4096, GQA con 32 cabezas de atención y 8 cabezas KV, vocabulario de 100.352 tokens con embeddings atados, y ventana de contexto de 128K en el modelo original. IBM lo publicó el 29 de abril de 2026 como modelo instruct de contexto largo, ajustado con datasets abiertos de instrucciones y datos sintéticos internos, con SFT y alineamiento por refuerzo para tool calling, seguimiento de instrucciones y chat.

Su relevancia ahora es práctica: permite ejecutar un modelo de 8B con calidad instruct en hardware de consumo y en teléfonos, con rendimiento medido de 58,3 tok/s en un Mac Studio M4 Max y 5,3–5,4 tok/s en un Galaxy S26, manteniendo una precisión en GSM8K (n=100) de 93 con int4 frente a 96 del bf16 de referencia. La licencia Apache 2.0 facilita su adopción comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (GQA, RoPE, SwiGLU, RMSNorm, embeddings de entrada/salida atados) |
| Parametros totales | 8.791.592.960 en bf16 (8,38 B sin la copia de la tabla de salida atada) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 128K en el modelo base; 4096 tokens en los ficheros LiteRT-LM |
| Tipos de cuantizacion | int8 (lineales en int8 dinámico, activaciones float) e int4 (blockwise-32 + OCTAV en lineales, embedding int8) |
| Idiomas soportados | 12 idiomas segun IBM (del ingles al chino); lista concreta no disponible en la informacion proporcionada |
| Licencia | Apache 2.0 |
| Formato de pesos | `.litertlm` (LiteRT-LM); ficheros de 8,95 GB (int8) y 5,15 GB (int4) |

## Arquitectura y entrenamiento

El modelo base es un transformer decoder-only denso con 40 capas, hidden size 4096, 32 cabezas de atención con 8 cabezas KV (GQA), RoPE, activación SwiGLU, normalización RMSNorm y embeddings de entrada/salida atados con vocabulario de 100.352 tokens. IBM lo describe como ajustado desde Granite-4.1-8B-Base sobre datasets abiertos de instrucciones y datos sintéticos recopilados internamente, con supervised fine-tuning y alineamiento mediante reinforcement learning orientado a tool calling, seguimiento de instrucciones y conversación.

La conversión a LiteRT-LM aplica dos recetas distintas: int8 dinámico en las capas lineales con activaciones en coma flotante, y int4 blockwise de tamaño 32 con OCTAV en las lineales más un embedding en int8. En ambos casos la tabla de embeddings se separa en una sección propia (419.484.080 bytes). Los ficheros incorporan un grafo compuesto para GPU y, por defecto, activaciones fp16 en el runtime; declarar fp32 mantuvo la corrección pero resultó un 15 % más lento. Las 7 firmas del decoder de ambos ficheros se delegaron completamente en la GPU del Mac, y las 7 del fichero int4 en la GPU del Galaxy S26 mediante el delegado OpenCL (1860 / 1661 / 1693 operaciones).

## Capacidades

- Generación de texto y razonamiento de tipo instruct, con contexto largo en el modelo base (128K) y 4096 tokens en estos ficheros.
- Resolución de problemas matemáticos paso a paso (evaluado en GSM8K con formato `#### <número>`).
- Tool calling y function calling, reforzados explícitamente durante el alineamiento por refuerzo de IBM.
- Seguimiento de instrucciones y conversación multi-turno; verificado con conversaciones de tres turnos en ambos ficheros y backends.
- Capacidad multilingüe: 12 idiomas según IBM, aunque la lista concreta no está disponible en la información proporcionada.
- Extracción de información estructurada (por ejemplo, fechas en texto) mediante instrucciones directas.
- Generación de salidas largas: en la prueba de hasta 512 tokens no se repitieron frases.
- No se documentan capacidades de visión, audio ni modo thinking explícito en la información disponible.

## Casos de uso

- Asistentes en dispositivo móvil: el fichero int4 (5,15 GB) se ejecuta en la GPU de un Galaxy S26 a 5,3–5,4 tok/s, lo que permite integrar un asistente conversacional local sin depender de la nube.
- Extracción de entidades y datos estructurados: el ejemplo oficial extrae fechas de un texto ("The meeting moved from May 3 to May 17"), adecuado para pipelines de procesamiento documental en edge.
- Automatización de agentes con tool calling: el ajuste por RL en tool calling permite construir agentes que invocan APIs o funciones en aplicaciones de escritorio y móviles.
- Razonamiento matemático y resolución de problemas: con 93/100 en GSM8K en int4, sirve para tutores o asistentes educativos que resuelven problemas paso a paso en local.
- Procesamiento por lotes en estación de trabajo: en un Mac Studio M4 Max el int4 decodifica a 58,3 tok/s, suficiente para tareas de generación y resumen a escala moderada sin GPU dedicada.
- Chat multi-turno con contexto moderado: la ventana de 4096 tokens de estos ficheros cubre conversaciones y documentos de extensión media en aplicaciones embebidas.
- Prototipado y demos offline: el formato `.litertlm` y el binario precompilado de Android simplifican el despliegue en ferias, entornos sin conectividad o pruebas de concepto en hardware de consumo.

## Benchmarks y rendimiento

Precisión en GSM8K (n=100, preguntas 0–99, greedy, máximo 1024 tokens de salida, proceso nuevo por pregunta, GPU del Mac; comparable solo dentro de esta tabla y no con el 92,49 de IBM, que usa 8-shot y otro setup):

| Configuracion | GSM8K (n=100) |
|---|---|
| bf16 de referencia (transformers, MPS) | 96 |
| int8, litert-lm GPU Mac | 95 |
| int4, litert-lm GPU Mac | 93 |

Tiempo para un prefill de 1024 tokens más 256 tokens decodificados con contexto 2048:

| Configuracion | Mac M4 Max (s) | Galaxy S26 (s) | Pixel 8a |
|---|---|---|---|
| int4 GPU | 5,81 | 58,7 y 59,6 (dos ejecuciones) | detenido por la regla de memoria |
| int8 GPU | 6,98 | no ejecutado | no ejecutado (el fichero supera la RAM del teléfono) |
| int8 CPU | 35,3 | no ejecutado | no ejecutado |
| int4 CPU | 41,8 | no ejecutado | no ejecutado |

Velocidad de decodificación: 58,3 tok/s en Mac Studio M4 Max (int4, GPU) y 5,3–5,4 tok/s en Galaxy S26 (int4, GPU). Corrección en el chequeo de 8 preguntas: 8/8 para int8 e int4 en CPU y GPU, y 8/8 para bf16. IFEval no se ejecutó para este modelo.

## Requisitos de hardware

- VRAM/RAM estimada: el fichero int4 ocupa 5,15 GB y el int8 8,95 GB; la sección principal de pesos es de 4,41 GiB (int4) y 7,94 GiB (int8), más 419.484.080 bytes de embeddings.
- GPU de escritorio: Mac Studio M4 Max validado (58,3 tok/s en int4); no se documentan pruebas en A100, H100 ni RTX 4090.
- Móvil: Galaxy S26 validado con int4 en GPU; el Pixel 8a no pudo ejecutar int4 por la regla de memoria del proyecto y el int8 no cabe en su RAM.
- iOS: no medido; ambas secciones principales superan los 2 GiB, lo que según la card es un obstáculo en iOS.
- Consumer GPU: no hay datos específicos de RTX 4090 u otras GPU de consumo en la información disponible.
- Despliegue: runtime LiteRT-LM (`litert-lm run`), con backends CPU y GPU (`--backend gpu`) y opción `--cache no`; binario precompilado de Android mencionado en la card. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia: prefill de 1024 tokens más 256 decodificados en 5,81 s (int4 GPU, Mac) y 58,7–59,6 s (int4 GPU, Galaxy S26); en CPU del Mac, int8 es más rápido que int4 por un prefill aproximadamente el doble de rápido.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| litert-community/granite-4.1-8b | 8,79 B (bf16) | 4096 en estos ficheros (128K en el base) | `.litertlm` int8/int4 | Apache 2.0 | Conversión edge con rendimiento medido en Mac y Android |
| litert-community/granite-4.1-3b | no disponible | no disponible | `.litertlm` | Apache 2.0 (segun el modelo base) | Conversión menor de la misma familia, citada en la card |
| ibm-granite/granite-4.1-8b | 8,79 B | 128K | safetensors (bf16) | Apache 2.0 | Modelo original; mayor contexto y referencia de precisión (GSM8K 92,49 en 8-shot) |

No se dispone de datos de benchmarks comparables con otras familias de modelos del mismo tamaño en la información proporcionada.

## Limitaciones y advertencias

- La ventana de contexto de los ficheros LiteRT-LM es de 4096 tokens, muy inferior a los 128K del modelo base; no sirve para documentos largos sin truncar.
- El fichero int4 pierde precisión frente a bf16 en GSM8K (93 frente a 96); tres preguntas cambian de correctas a incorrectas.
- El int8 no cabe en la RAM de un Pixel 8a y ninguno de los dos ficheros se ha validado en iOS por el límite de 2 GiB por sección.
- No se ha ejecutado IFEval, por lo que el seguimiento de instrucciones no está cuantificado en esta conversión.
- Los resultados de GSM8K solo son comparables dentro de la tabla de la card, no con las cifras publicadas por IBM.
- No se documentan sesgos concretos, tasas de alucinación ni restricciones adicionales de la licencia Apache 2.0 más allá de las habituales; la lista de 12 idiomas no está detallada.
- El rendimiento depende del runtime y del delegado: en CPU del Mac, int4 es más lento que int8 en prefill, y declarar activaciones fp32 reduce la velocidad un 15 %.
- El proyecto tiene 424 descargas y 0 likes en el momento de la consulta, lo que indica validación comunitaria limitada.

## Enlaces

- Hugging Face: https://huggingface.co/litert-community/granite-4.1-8b
- Modelo base: https://huggingface.co/ibm-granite/granite-4.1-8b
- Runtime LiteRT-LM: https://github.com/google-ai-edge/LiteRT-LM
- Conversión hermana de 3B: https://huggingface.co/litert-community/granite-4.1-3b
- Script de verificación de calidad: https://github.com/john-rocky/hf-to-litertlm/blob/main/scripts/verify_quality.py
