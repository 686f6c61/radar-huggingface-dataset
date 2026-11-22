# fihriaLab/fihrIA-ASR-1.7B-GGUF

## Resumen

fihrIA-ASR-1.7B-GGUF es la distribucion en formato GGUF del modelo de reconocimiento automatico del habla (ASR) fihrIA-ASR-1.7B, desarrollado por fihriaLab. Se trata de un modelo especializado en dariya (arabe marroqui) construido sobre la arquitectura Qwen3-ASR, con 1.591.682.048 parametros (~1,7B) y entrenado con un tokenizer compartido de 89k tokens especifico para dariya. Esta version GGUF esta empaquetada para su uso con llama.cpp a traves de su pila multimodal (`mtmd`), lo que permite ejecutar el modelo en CPU sin GPU.

La relevancia del modelo radica en su especializacion: frente a sistemas ASR genericos, fihrIA-ASR esta disenado para manejar code-switching natural entre dariya, frances e ingles, y produce salida directa en escritura arabe. El autor declara que el 1.7B alcanza un 6,1% de SER medio en su conjunto de evaluacion, superando a Mistral Voxtral Mini 4B (8,4%) y MoulSot 1.7B (11,2%), con un throughput de 243x tiempo real en una H100.

Esta build concreta es la ruta de CPU del modelo: incluye una cuantizacion Q4_K_M de ~1.000 MB y un proyector de audio `mmproj` en BF16 de 642 MB, con un consumo de RAM estimado de ~2,6 GB a `-c 8192`. Para GPU, el autor remite al repositorio de safetensors en BF16.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3-ASR (transformer multimodal con torre de audio y proyector `mmproj`) |
| Parametros totales | 1.591.682.048 (~1,7B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (ejemplos de despliegue usan `-c 8192`) |
| Tipos de cuantizacion | Q4_K_M y BF16 (GGUF); el `mmproj` debe mantenerse en BF16 |
| Idiomas soportados | ar, ary (dariya); code-switching con frances e ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp / `mtmd`) |
| Tamano del repo | 9,0 GB |
| Tokenizer | 89k tokens compartido para dariya |

## Arquitectura y entrenamiento

El modelo se basa en Qwen3-ASR, una arquitectura multimodal que combina un modelo de lenguaje con una torre de audio y un proyector de caracteristicas (`mmproj`). En la distribucion GGUF, el modelo se divide en dos componentes obligatorios: el modelo de lenguaje cuantizado (`fihria-asr-1.7b-Q4_K_M.gguf`, 1.000 MB, o `fihria-asr-1.7b-BF16.gguf`, 3.188 MB) y el proyector de audio (`mmproj-fihria-asr-1.7b-BF16.gguf`, 642 MB). El autor advierte que los proyectores de audio del 0.6B y del 1.7B no son intercambiables y que el `mmproj` debe permanecer en BF16, ya que su cuantizacion no ha sido validada.

El entrenamiento se realizo con un tokenizer compartido de 89k tokens especifico para dariya y el modelo se evalua bajo un protocolo unificado de la familia. La informacion proporcionada no detalla el numero de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO. El modelo esta optimizado para code-switching natural y para generar salida directa en escritura arabe adaptada a las estructuras linguisticas locales.

## Capacidades

- Reconocimiento automatico del habla (ASR) en dariya con salida en escritura arabe nativa.
- Manejo robusto de code-switching: transcribe frases mixtas con palabras en frances e ingles embebidas en dariya hablado.
- Formateo y transcripcion directa en escritura arabe optimizada para estructuras linguisticas locales.
- Procesamiento de audio mediante la pila multimodal `mtmd` de llama.cpp, que combina modelo de lenguaje y proyector de audio.
- Ejecucion en CPU sin GPU, con soporte para despliegue en portatiles y dispositivos edge.
- Integracion con `llama-server` mediante un cliente de referencia (`transcribe.py`, solo stdlib) incluido en el repositorio.
- No se documentan capacidades de tool calling, agentes, vision, audio generativo ni modo de razonamiento extendido en la informacion disponible.

## Casos de uso

- Transcripcion de reuniones y conversaciones en dariya: el modelo procesa audio y genera texto en escritura arabe, adecuado para equipos que trabajan con hablantes de arabe marroqui y necesitan actas o resumenes en texto.
- Subtitulado de contenido audiovisual marroqui: permite generar subtitulos en dariya escrita para videos, entrevistas o podcasts, incluyendo fragmentos con prestamos del frances y del ingles.
- Atencion al cliente en centros de contacto: transcripcion de llamadas en dariya para su posterior analisis, categorizacion o cumplimiento normativo, ejecutable en CPU en infraestructura sin GPU.
- Despliegue en portatiles y dispositivos edge: con ~2,6 GB de RAM a `-c 8192` y una cuantizacion Q4_K_M, el modelo puede ejecutarse en portatiles estandar, lo que facilita su uso en campo o en entornos con recursos limitados.
- Investigacion linguistica sobre dariya: generacion de transcripciones para corpus de habla marroqui, con soporte para code-switching, util para estudios sociolinguisticos y de variacion.
- Procesamiento por lotes en servidores CPU: el autor reporta 5,98x tiempo real en CPU de portatil con Q4 para el 0.6B; el 1.7B esta orientado a maxima precision, por lo que encaja en pipelines de transcripcion donde la exactitud prima sobre la latencia.
- Integracion en aplicaciones de accesibilidad: conversion de voz a texto en dariya para personas con discapacidad auditiva, con salida en escritura arabe nativa.

## Benchmarks y rendimiento

Datos publicados por el autor para las builds Q4_K_M:

| Metrica | fihrIA-ASR 0.6B | fihrIA-ASR 1.7B | Mistral Voxtral Mini 4B | MoulSot 1.7B |
|---|---|---|---|---|
| SER medio en held-out ↓ | 7,1% | 6,1% | 8,4% | 11,2% |
| DarijaCS CER ↓ (Prism / Probe, Q4) | 7,98 / 9,84% | 6,54 / 9,23% | 6,68 / 9,69% | 10,27 / 14,93% |
| Throughput en H100 ↑ | 255x tiempo real | 243x tiempo real | 34x | 147x |
| CPU de portatil, Q4 ↑ | 5,98x | no disponible | no disponible | 3,06x |
| Huella, BF16 / Q4 | 1.447 / 721 MB | 3.830 / 1.642 MB | no disponible | no disponible |

Los repositorios de safetensors reportan CER en BF16 (0.6B: 7,98 / 9,80%; 1.7B: 6,24 / 8,71%). Las cifras de la tabla son las de Q4 y son las que deben compararse al desplegar Q4. Los numeros held-out son la media de cuatro jueces LLM independientes sobre 508 clips. Las cifras de DarijaCS de Voxtral son las publicadas por Mistral; el resto son reruns del autor sobre los mismos clips. Menor es mejor para SER y CER; mayor es mejor para throughput.

## Requisitos de hardware

- RAM estimada: ~2,6 GB a `-c 8192` para Q4_K_M (incluye ~900 MB de cache KV); ~4,7 GB para BF16 GGUF a `-c 8192`. Reducir `-c` disminuye el consumo.
- Ficheros en disco: Q4_K_M 1.000 MB + mmproj 642 MB; BF16 GGUF 3.188 MB + mmproj 642 MB.
- GPU: el autor remite al repositorio de safetensors BF16 para GPU NVIDIA, con backend `qwen-asr`/transformers o vLLM para alto throughput con batching. No se proporcionan requisitos de VRAM especificos para GPU en la informacion disponible.
- Cabe en CPU de portatil y dispositivos edge; no requiere GPU.
- Despliegue: llama.cpp build 9199 (`39cf5d619`, 2026-05-17) o superior, con `llama-server` y `llama-mtmd-cli`. Versiones anteriores cargan los ficheros sin error pero producen salida fluida con palabras silenciosamente incorrectas.
- Throughput: 243x tiempo real en una H100 (Q4) y 5,98x en CPU de portatil para el 0.6B Q4; el dato de CPU para el 1.7B no esta disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | SER medio ↓ | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| fihrIA-ASR 1.7B | ~1,7B | no disponible | 6,1% | Apache 2.0 | safetensors y GGUF |
| Mistral Voxtral Mini 4B | 4B | no disponible | 8,4% | no disponible | no disponible |
| MoulSot 1.7B | 1,7B | no disponible | 11,2% | no disponible | no disponible |
| fihrIA-ASR 0.6B | ~0,6B | no disponible | 7,1% | Apache 2.0 | safetensors y GGUF |

## Limitaciones y advertencias

- El modelo esta especializado en dariya y arabe; no se documenta soporte para otros idiomas fuera del code-switching con frances e ingles.
- Riesgo de alucinacion y de transcripciones fluidas pero incorrectas si se usa una build de llama.cpp anterior a 9199; el autor advierte explicitamente de este fallo silencioso.
- El `mmproj` debe ser el correspondiente al 1.7B y mantenerse en BF16; mezclar proyectores o cuantizarlo no esta validado.
- No se detallan sesgos conocidos ni limitaciones de contexto en la informacion disponible.
- La licencia Apache 2.0 permite uso comercial, pero el autor no documenta garantias ni validacion fuera de su protocolo de evaluacion.
- Los benchmarks son autodeclarados por el autor, con jueces LLM y reruns propios; las cifras de Voxtral provienen de su publicacion original.
- El rendimiento en CPU para el 1.7B no esta cuantificado; el dato de 5,98x corresponde al 0.6B.

## Enlaces

- Repositorio GGUF: https://huggingface.co/fihriaLab/fihrIA-ASR-1.7B-GGUF
- Modelo base (safetensors): https://huggingface.co/fihriaLab/fihrIA-ASR-1.7B
- Repositorio 0.6B (safetensors): https://huggingface.co/fihriaLab/fihrIA-ASR-0.6B
- Repositorio 0.6B (GGUF): https://huggingface.co/fihriaLab/fihrIA-ASR-0.6B-GGUF
- llama.cpp: https://github.com/ggml-org/llama.cpp
