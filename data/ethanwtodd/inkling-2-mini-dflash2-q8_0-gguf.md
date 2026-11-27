# ethanwtodd/Inkling-2-Mini-DFlash2-Q8_0-GGUF

## Resumen

Inkling-2-Mini-DFlash2-Q8_0-GGUF es la conversion a formato GGUF y cuantizacion Q8_0 del modelo borrador (draft model) DFlash 2 de Inco AI, publicado por el usuario ethanwtodd. No se trata de un modelo autonomo: es un modelo de decodificacion especulativa disenado para acelerar la inferencia de thinkingmachines/Inkling-2-Mini, generando bloques de tokens candidatos a partir de los estados ocultos del modelo objetivo que este ultimo verifica despues. Al ser verificados por el target, la distribucion de salida final es la del modelo objetivo, no la del borrador.

El modelo cuenta con 494.491.136 parametros (aproximadamente 494 millones) y un repositorio de 0,5 GB en formato GGUF Q8_0. Su funcion es puramente instrumental dentro de un pipeline de decodificacion especulativa: no responde a prompts de forma independiente ni mantiene conversaciones por si mismo, sino que propone tokens que el modelo grande acepta o rechaza. Esto lo hace relevante para despliegues de Inkling-2-Mini donde la latencia por token es critica, ya que la decodificacion especulativa permite reducir el numero de pasos de verificacion necesarios.

La relevancia actual del artefacto radica en que empaqueta el borrador en un formato cargable por llama.cpp (soporte DFlash 2, PR #33073) y por el motor eklow para Intel Arc A770M, facilitando su uso en hardware de consumo. La licencia Apache 2.0 y la disponibilidad del modelo base en Hugging Face permiten su integracion en entornos de produccion sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DFlash 2 (modelo borrador para decodificacion especulativa; consume estados ocultos del target en tres visitas de capa y la salida de la normalizacion final) |
| Parametros totales | 494.491.136 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0 (unica incluida en este repositorio) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (Q8_0) |

## Arquitectura y entrenamiento

El modelo es un borrador DFlash 2, una arquitectura de decodificacion especulativa que no opera sobre tokens de entrada de forma convencional, sino que consume los estados ocultos del modelo objetivo (la corriente en tres visitas de capa y la salida de la normalizacion final) para proponer bloques de tokens candidatos. El modelo objetivo verifica despues esos bloques, de modo que la distribucion de salida efectiva es la del target. El proceso de conversion se realizo con llama.cpp en el commit `55d482814bb3b985daa7bfa175c6d628fc27beac`, usando `convert_hf_to_gguf.py` (que tambien incorpora la normalizacion del embedding de tokens del target) y posteriormente `llama-quantize ... Q8_0`. El fichero resultante pesa 538 MB y tiene sha256 `17b1eebdd35a37a5b8fae519314056a6ab8e021c318861a9501f0bc5223f14f9`.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO en el modelo original de Inco AI. La innovacion tecnica principal es el propio mecanismo DFlash 2: la generacion de bloques de tokens a partir de los estados internos del target y su verificacion posterior, lo que mantiene la fidelidad de la distribucion de salida mientras reduce el coste por token aceptado. El soporte en llama.cpp (PR #33073) carga este borrador junto al modelo objetivo.

## Capacidades

- Generacion de tokens candidatos para decodificacion especulativa sobre thinkingmachines/Inkling-2-Mini; no es un modelo autonomo.
- Consumo de estados ocultos del target (tres visitas de capa y normalizacion final) para proponer bloques de tokens.
- Verificacion de los bloques propuestos por el modelo objetivo, preservando la distribucion de salida del target.
- Integracion con llama.cpp (commit 55d48281) y con el motor eklow para Intel Arc A770M.
- No soporta tool calling, function calling ni agentes de forma nativa por si mismo; esas capacidades dependen del modelo objetivo.
- Capacidades multilingues: no disponibles como modelo independiente; heredadas del target en la practica.
- No dispone de modo thinking, vision ni audio propios.

## Casos de uso

- Aceleracion de inferencia de Inkling-2-Mini en produccion: el borrador propone bloques de 8 tokens que el target verifica, reduciendo el numero de pasos de decodificacion. Con temperatura 1 y top-p 1 (los valores por defecto de Inkling) se aceptan 4,32 tokens por verificacion en GSM8K, 3,93 en HumanEval y 3,79 en MT-Bench, segun las mediciones del autor con llama.cpp 55d48281 en CUDA.
- Despliegue en GPU de consumo: el fichero Q8_0 de 538 MB cabe holgadamente en GPUs consumer, y el autor lo ha probado en una Intel Arc A770M mediante el motor eklow, obteniendo 4,9 tokens por verificacion en cuatro peticiones greedy de GSM8K (frente a 5,2 de llama.cpp en las mismas cuatro).
- Servicio de chat de baja latencia: al integrarse con el target en llama.cpp, el par borrador-target puede servir conversaciones multi-turno con menor tiempo por token, manteniendo la calidad del modelo grande.
- Evaluacion comparativa de motores de inferencia: sirve para medir la eficiencia de decodificacion especulativa entre llama.cpp y eklow sobre el mismo target y el mismo hardware.
- Investigacion en decodificacion especulativa: permite reproducir los experimentos del autor con bloques de 8, temperatura 1 y greedy, y comparar con los 4,96 / 4,80 / 3,90 que Inco reporta en SGLang con los pesos originales.
- Prototipado en estaciones de trabajo con GPU unica: al requerir solo 538 MB adicionales junto al target cuantizado (UD-Q4_K_M de Unsloth en las pruebas), es viable en entornos con VRAM limitada.

## Benchmarks y rendimiento

Tokens aceptados por paso de verificacion en llama.cpp 55d48281 (CUDA, bloques de 8, target UD-Q4_K_M de Unsloth, conversion BF16 del borrador, 16 peticiones por dataset, hasta 2.048 tokens):

| Muestreo | GSM8K | HumanEval | MT-Bench |
|---|---|---|---|
| Temperatura 1, top-p 1 (valores por defecto de Inkling) | 4,32 | 3,93 | 3,79 |
| Greedy | 5,07 | 4,89 | 4,59 |

Inco reporta 4,96 / 4,80 / 3,90 a temperatura 1 en SGLang con los pesos originales. Este fichero Q8_0 en eklow (Intel Arc A770M) alcanza 4,9 tokens por verificacion en cuatro peticiones greedy de GSM8K, frente a 5,2 de llama.cpp en las mismas cuatro.

## Requisitos de hardware

- VRAM estimada: aproximadamente 538 MB para el borrador Q8_0, adicionales a la VRAM del modelo objetivo.
- GPU recomendadas: cualquier GPU compatible con llama.cpp o eklow; el autor ha validado Intel Arc A770M y CUDA.
- Cabe en GPU de consumo: si, al ocupar solo 538 MB; el limite practico lo impone el target.
- Opciones de despliegue: llama.cpp (commit 55d48281 o posterior, con soporte DFlash 2, PR #33073) y eklow (motor del autor para Intel Arc A770M).
- Latencia y throughput: no se publican cifras absolutas de latencia o tokens por segundo; solo la metrica de tokens aceptados por verificacion indicada en la seccion de benchmarks.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Funcion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Inkling-2-Mini-DFlash2-Q8_0-GGUF (este) | 494.491.136 | no disponible | Borrador DFlash 2 en GGUF Q8_0 | Apache 2.0 | Hugging Face |
| incoai/Inkling-2-Mini-DFlash2 | no disponible | no disponible | Borrador DFlash 2 original (BF16) | no disponible | Hugging Face |
| thinkingmachines/Inkling-2-Mini | no disponible | no disponible | Modelo objetivo que verifica los borradores | no disponible | Hugging Face |

No se dispone de informacion sobre otros borradores de decodificacion especulativa comparables en la documentacion proporcionada.

## Limitaciones y advertencias

- No es un modelo autonomo: no responde a prompts ni genera texto por si mismo; requiere el modelo objetivo thinkingmachines/Inkling-2-Mini y un motor con soporte DFlash 2.
- La calidad de la salida depende enteramente del target; el borrador solo afecta a la velocidad, no a la distribucion final.
- Solo se distribuye la cuantizacion Q8_0; no hay otras variantes en este repositorio.
- Los benchmarks de tokens aceptados son sensibles al muestreo: greedy rinde mas que temperatura 1 (5,07 frente a 4,32 en GSM8K).
- Las cifras del autor en eklow y llama.cpp se obtuvieron con hardware y configuracion concretos (Intel Arc A770M, CUDA, target UD-Q4_K_M, bloques de 8, 16 peticiones por dataset); no son extrapolables sin validacion.
- No se dispone de informacion sobre sesgos, riesgo de alucinacion ni limitaciones de idioma del borrador; estas quedan sujetas al modelo objetivo.
- Licencia Apache 2.0: permite uso comercial, pero debe verificarse la licencia del modelo objetivo y del modelo base original.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta; es un artefacto reciente (creado el 2026-11-27) sin validacion comunitaria amplia.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/ethanwtodd/Inkling-2-Mini-DFlash2-Q8_0-GGUF
- Modelo base (borrador original): https://huggingface.co/incoai/Inkling-2-Mini-DFlash2
- Modelo objetivo: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Motor eklow: https://github.com/ewtodd/eklow
- Soporte DFlash 2 en llama.cpp (PR #33073): https://github.com/ggml-org/llama.cpp/pull/33073
