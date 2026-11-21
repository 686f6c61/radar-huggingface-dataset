# ndgold/Qwen3-1.7B-EasyLanguage-4bit

## Resumen

Qwen3-1.7B-EasyLanguage-4bit es un ajuste fino mediante LoRA del modelo Qwen/Qwen3-1.7B, publicado por el desarrollador ndgold y cuantizado a 4 bits para inferencia en Apple Silicon con la librería MLX. Su proposito no es el razonamiento generalista, sino la simplificacion de texto a registros de lectura facil (easy language) en 29 variantes idiomaticas, cada una alineada con su estandar nacional o europeo correspondiente: Leichte Sprache en aleman, FALC en frances, Lectura Facil en espanol, Easy/Plain English en ingles, entre otros.

El modelo resuelve un problema concreto: convertir transcripciones de habla en vivo o material grabado en frases cortas, sin disfluencias, conservando nombres y cifras y manteniendo el idioma de entrada. Forma parte del proyecto Live Linguist, que distribuye aplicaciones para macOS, iPhone/iPad, Android y PC, con la version de macOS ya disponible.

La relevancia tecnica radica en que el ajuste se entreno contra los mismos validadores deterministicos que la aplicacion usa en tiempo de ejecucion (limites de longitud de frase por idioma, comprobaciones de gramatica simple, anclaje a la fuente, fidelidad numerica, anti-repeticion y guardia de idioma incorrecto), lo que convierte el registro en el objetivo de optimizacion. Con 1.720.574.976 parametros y licencia Apache 2.0, es una pieza pequena y desplegable en hardware de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3), ajuste fino LoRA sobre Qwen/Qwen3-1.7B |
| Parametros totales | 1.720.574.976 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits (MLX) |
| Idiomas soportados | 29 locales: de, fr, en, es, ar, da, et, fi, hi, it, ja, ko, nl, pt (PT y BR), ru, sk, sv, tr, vi, zh-CN, uk, ro, bg, pl, hr, nb, hu, cs |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-1.7B, un transformer decoder-only denso de la familia Qwen3, y se ajusta mediante LoRA para la tarea de simplificacion a lectura facil. Posteriormente se cuantiza a 4 bits en formato MLX para ejecucion en Apple Silicon. El repositorio ocupa 2,9 GB.

El entrenamiento se realizo con un prompt corto y sin ejemplos few-shot, de modo que el modelo internaliza el registro en lugar de imitarlo a partir de demostraciones; el autor justifica esta decision por la reduccion de latencia en subtitulado en vivo. El conjunto de datos de ajuste esta publicado como ndgold/live-linguist-easylanguage-sft. La innovacion principal no esta en la arquitectura sino en el procedimiento de evaluacion y entrenamiento: el modelo se optimiza contra validadores deterministicos que imponen limites de longitud de frase por idioma, gramatica simple, anclaje a la fuente, fidelidad de numeros, anti-repeticion y deteccion de idioma incorrecto. No se especifica en la informacion disponible el numero de tokens de entrenamiento ni si se empleo RLHF o DPO.

## Capacidades

- Simplificacion de texto a registros de lectura facil en 29 locales, cada uno con su estandar de referencia (Leichte Sprache, FALC, Lectura Facil, Easy/Plain English, Selkokieli, Yasashii Nihongo, etc.).
- Segmentacion de frases largas y eliminacion de disfluencias propias de transcripciones de habla.
- Preservacion de nombres propios y cifras durante la reescritura.
- Mantenimiento del idioma de entrada, con una tasa media de identificacion de idioma del 99,6 %.
- Baja tasa de repeticion del texto de entrada (0 % de media en el conjunto de prueba).
- Soporte de escrituras sin separacion por espacios (japones, chino), evaluado mediante chrF en lugar de SARI.
- Manejo de texto en direccion derecha-a-izquierda (arabe).
- No se documentan en la informacion disponible capacidades de tool calling, function calling, agentes, vision, audio ni modo de razonamiento extendido.

## Casos de uso

- Subtitulado en vivo accesible: el modelo reescribe transcripciones de habla en el registro de lectura facil con un prompt corto, lo que reduce la latencia en comparacion con enfoques few-shot y lo hace adecuado para captioning en tiempo real en la aplicacion Live Linguist.
- Adaptacion de documentos oficiales: conversion de comunicaciones administrativas, sanitarias o legales a Lectura Facil o Leichte Sprache para cumplir requisitos de accesibilidad cognitiva, aprovechando los validadores de longitud de frase y gramatica simple.
- Accesibilidad educativa: transformacion de materiales didacticos en versiones de lectura sencilla para alumnado con dificultades de comprension lectora, manteniendo la fidelidad de cifras y nombres.
- Localizacion multilingue de contenidos de accesibilidad: un mismo pipeline puede generar versiones en lectura facil para 29 locales, incluidos mercados como portugues de Portugal y de Brasil, arabe o japones.
- Post-procesado de actas y reuniones: limpieza de transcripciones automaticas (eliminacion de disfluencias, division de frases encadenadas) antes de su publicacion o archivado.
- Generacion de resumenes de voz para asistentes: integracion en asistentes de voz que necesitan devolver respuestas en lenguaje claro y breve, con garantia de permanencia en el idioma del usuario.
- Procesamiento por lotes en equipos Apple: al estar en formato MLX de 4 bits, permite ejecutar la simplificacion en portatiles y equipos de sobremesa con chip de Apple sin GPU dedicada.

## Benchmarks y rendimiento

Evaluacion sobre conjunto de prueba reservado, aproximadamente 200 frases por idioma.

| Metrica | 1.7B ajustado | Qwen3-1.7B original |
|---|---|---|
| SARI medio (27 locales con separacion por espacios) | 54,6 | 49,6 |
| Cumplimiento medio de registro (29 locales) | 97 % | 74 % |
| Identificacion media de idioma (29 locales) | 99,6 % | 99,4 % |
| Tasa media de repeticion (29 locales) | 0 % | 1 % |

Resultados por idioma (seleccion):

| Idioma | Registro | SARI ajustado | SARI original | chrF ajustado | chrF original | Cumplimiento ajustado | Cumplimiento original |
|---|---|---|---|---|---|---|---|
| vi | ETR / ISO plain language | 62,5 | 57,3 | 60,9 | 54,6 | 86 % | 50 % |
| en | Easy / Plain English | 62,4 | 52,0 | 57,1 | 42,7 | 100 % | 68 % |
| fr | FALC | 62,0 | 54,1 | 55,6 | 45,9 | 100 % | 61 % |
| es | Lectura Facil | 61,7 | 56,9 | 57,8 | 51,4 | 99 % | 61 % |
| pt-PT | Leitura Facil | 61,2 | 54,3 | 61,0 | 51,8 | 96 % | 82 % |
| pt-BR | Leitura Facil | 57,8 | 56,9 | 54,0 | 49,7 | 89 % | 32 % |
| it | Easy to Read | 56,2 | 49,5 | 51,9 | 40,6 | 89 % | 48 % |
| de | Leichte Sprache | 51,1 | 41,9 | 46,6 | 31,1 | 100 % | 60 % |
| ar | Easy-to-Read (RTL) | 52,1 | 51,0 | 50,5 | 46,3 | 98 % | 68 % |
| zh-CN | ISO plain language | n/a | n/a | 53,9 | 41,6 | 99 % | 94 % |
| ja | Yasashii Nihongo | n/a | n/a | 45,5 | 38,8 | 98 % | 92 % |

SARI no se reporta para japones y chino porque la tokenizacion por espacios lo hace inaplicable; en esos casos se usa chrF junto con cumplimiento e identificacion de idioma. El autor indica que el modelo de 1,7B supera al ajuste de 0,6B en SARI en los 27 locales evaluados con SARI. No se han publicado resultados de benchmarks generalistas (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: el repositorio pesa 2,9 GB en 4 bits, por lo que la inferencia requiere del orden de 3-4 GB de memoria, incluyendo overhead de ejecucion.
- GPU recomendadas: no aplica en sentido estricto; el formato MLX esta pensado para Apple Silicon (series M1, M2, M3, M4 y posteriores). No se documenta soporte para CUDA en esta publicacion.
- Cabe en GPU de consumo: si, en equipos Apple con memoria unificada de 8 GB o superior; tambien en Mac con 16 GB con holgura para contexto adicional.
- Opciones de despliegue: MLX (libreria declarada). No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI en esta publicacion; para esos entornos habria que reconvertir los pesos al formato correspondiente.
- Latencia y throughput: no disponibles de forma numerica. El autor menciona que el prompt corto reduce la latencia en subtitulado en vivo, y que el modelo de 0,6B se reserva para captioning en directo mientras el de 1,7B cubre material grabado, trabajo offline y conversaciones mas lentas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3-1.7B-EasyLanguage-4bit | 1,72 B | no disponible | Simplificacion a lectura facil, 29 locales | Apache 2.0 | safetensors MLX 4 bits |
| Qwen/Qwen3-1.7B (base) | 1,72 B | no disponible | Modelo generalista | Apache 2.0 | safetensors |
| Ajuste de 0,6B del mismo proyecto (Live Linguist) | no disponible | no disponible | Simplificacion para captioning en vivo | no disponible | no disponible |

Frente al Qwen3-1.7B original, el ajuste mejora el SARI medio de 49,6 a 54,6 y el cumplimiento de registro del 74 % al 97 %, con reduccion de la tasa de repeticion del 1 % al 0 %. El ajuste de 0,6B del mismo proyecto queda por debajo en SARI en los 27 locales evaluados, segun el autor. No se dispone de comparativas con otros modelos especializados en simplificacion de texto en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo especializado: no esta disenado para razonamiento general, codigo, matematicas ni conversacion abierta; su uso fuera de la simplificacion a lectura facil dara resultados degradados.
- Riesgo de alucinacion: aunque el entrenamiento incluye anclaje a la fuente y fidelidad numerica, no se documenta una tasa de errores factuales; en dominios sensibles (sanitario, legal) requiere revision humana.
- Cobertura desigual por idioma: el cumplimiento de registro baja al 84-89 % en hindi, italiano, portugues de Brasil y vietnamita, frente al 99-100 % en espanol, frances, aleman, rumano o croata.
- Diferencias entre variantes: portugues de Portugal y de Brasil se evaluan por separado con resultados distintos (SARI 61,2 frente a 57,8; cumplimiento 96 % frente a 89 %).
- Idiomas sin metrica SARI: japones y chino solo cuentan con chrF, cumplimiento e identificacion de idioma, lo que limita la comparacion directa con el resto.
- Restricciones de plataforma: los pesos estan en formato MLX; su uso en CUDA, ROCm o CPU requiere conversion y no esta documentado por el autor.
- Contexto maximo no especificado: no se indica la longitud de contexto soportada, lo que impide planificar el procesamiento de documentos largos sin pruebas previas.
- Madurez del ecosistema: 19 descargas y 0 likes en el momento de la consulta; el proyecto Live Linguist tiene las aplicaciones para iPhone/iPad, Android y PC pendientes de publicacion en tienda.
- Licencia Apache 2.0: permite uso comercial y modificacion, pero conviene conservar los avisos de atribucion y verificar las condiciones del modelo base Qwen3-1.7B.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ndgold/Qwen3-1.7B-EasyLanguage-4bit
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Dataset de ajuste: https://huggingface.co/datasets/ndgold/live-linguist-easylanguage-sft
- Proyecto Live Linguist: https://ndgold.com/live-linguist/
- Aplicaciones: https://ndgold.com/live-linguist/apps/
- Benchmarks completos: https://ndgold.com/live-linguist/models/
- Investigacion: https://ndgold.com/live-linguist/research/
