# axteam/gemma-4-26B-A4B-it-GGUF

## Resumen

`axteam/gemma-4-26B-A4B-it-GGUF` es una coleccion de pesos cuantizados en formato GGUF del modelo `google/gemma-4-26B-A4B-it`, publicada por el usuario axteam. El modelo base es Gemma 4, una arquitectura Mixture-of-Experts (MoE) multimodal de Google DeepMind con 25.233.142.046 parametros totales y un nombre que sugiere 4.000 millones de parametros activos por token (A4B). Esta publicacion concreta contiene unicamente la parte de lenguaje del modelo, sin proyector de vision (`mmproj`), por lo que la inferencia es solo de texto.

La relevancia de esta ficha radica en que permite ejecutar un modelo MoE de gran tamano total en hardware de consumo mediante cuantizacion de 4 y 8 bits, a traves de llama.cpp, Ollama o LM Studio. El repositorio incluye tres variantes: BF16 (50,5 GB), Q4_K_M (16,8 GB) y Q8_0 (26,9 GB), con el chat template embebido en el propio GGUF.

La cuantizacion es post-entrenamiento (PTQ) con las k-quants de llama.cpp, sin reentrenamiento ni QAT. El autor publica mediciones de divergencia KL frente al BF16 en GPU (NVIDIA B200), lo que permite evaluar la perdida de fidelidad de cada nivel de cuantizacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gemma 4, Mixture-of-Experts (MoE) multimodal; este GGUF ejecuta solo la parte de lenguaje |
| Parametros totales | 25.233.142.046 (25,23 mil millones) |
| Parametros activos | no disponible (el nombre A4B sugiere ~4B, sin confirmacion en la informacion proporcionada) |
| Longitud de contexto | no disponible (el ejemplo de llama.cpp usa `-c 8192`, pero no se especifica el maximo del modelo) |
| Tipos de cuantizacion | BF16, Q4_K_M, Q8_0 (k-quants de llama.cpp) |
| Idiomas soportados | no disponible (las mediciones cubren ingles y coreano, sin lista oficial) |
| Licencia | apache-2.0 en la etiqueta del repo, con enlace a la licencia de Gemma 4 de Google |
| Formato de pesos | GGUF (llama.cpp), chat template embebido |

## Arquitectura y entrenamiento

El modelo base es Gemma 4 en configuracion Mixture-of-Experts multimodal, desarrollado por Google DeepMind. La arquitectura combina capas de expertos con enrutamiento disperso, de modo que solo una fraccion de los parametros totales se activa por token, lo que reduce el coste de computo frente a un modelo denso del mismo tamano. El checkpoint es una variante instruct (`-it`), entrenada para seguir instrucciones y mantener conversaciones.

Esta publicacion no aporta informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO en el modelo base. Tampoco documenta innovaciones tecnicas adicionales del original. La unica innovacion documentada aqui es el proceso de cuantizacion: conversion con `convert_hf_to_gguf.py` y cuantizacion por bloques con `llama-quantize`, con escalas por bloque y asignacion de bit-width mixta, sin reentrenamiento. El autor indica que el toolchain es distinto de las builds AWQ o NVFP4 para vLLM y que no se trata de QAT.

## Capacidades

- Generacion de texto conversacional en modo instruct, con chat template embebido en el GGUF.
- Razonamiento y respuesta a preguntas; el autor verifico respuestas correctas a preguntas cortas sobre las capitales de Francia y Corea.
- Capacidad multilingue: las mediciones del autor incluyen texto en ingles y coreano, lo que confirma manejo de al menos esos dos idiomas.
- El modelo base es multimodal (image-text-to-text), pero esta build GGUF no incluye proyector de vision, por lo que la entrada es solo texto.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Modo thinking, audio u otras capacidades especiales: no disponible en la informacion proporcionada.

## Casos de uso

- Despliegue local en estaciones de trabajo con GPU unica: la variante Q4_K_M (16,8 GB) permite ejecutar un MoE de 25 mil millones de parametros totales en una GPU con 24 GB de VRAM, algo inviable con el BF16.
- Asistente conversacional autoalojado: con el chat template embebido y los parametros de muestreo recomendados por Google (temperature 1.0, top_p 0.95, top_k 64), el modelo puede servir como backend de chat en llama.cpp u Ollama sin dependencias de API externas.
- Prototipado y evaluacion de calidad frente a cuantizacion: las mediciones de divergencia KL del autor permiten decidir entre Q4_K_M y Q8_0 segun el presupuesto de memoria y la tolerancia a la perdida de fidelidad.
- Procesamiento de texto multilingue ingles-coreano: el autor midio la fidelidad de la cuantizacion especificamente en ambos idiomas, lo que respalda su uso en pipelines de texto en esas lenguas.
- Investigacion sobre cuantizacion PTQ: el repositorio sirve como caso de estudio reproducible de k-quants en un MoE grande, con BF16 de referencia incluido para re-cuantizar o comparar.
- Integracion en aplicaciones de escritorio mediante Ollama o LM Studio: el autor documenta el comando `ollama run hf.co/axteam/gemma-4-26B-A4B-it-GGUF:Q4_K_M`, aunque advierte que esas dos plataformas no fueron probadas por el.

## Benchmarks y rendimiento

El autor no publica benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.). En su lugar, mide la fidelidad de cada cuantizacion frente al BF16 en un NVIDIA B200 con llama.cpp b12005 (commit e0f142d, build CUDA), usando 16 ventanas de 2.048 tokens de WikiText-2 y de una muestra de Wikipedia en coreano:

| Fichero | KLD media vs BF16 (EN / KO) | Coincidencia top-1 vs BF16 (EN / KO) |
|---|---|---|
| Q4_K_M | 3,1405 / 3,2336 | 43,0% / 42,2% |
| Q8_0 | 0,8216 / 0,9642 | 71,6% / 70,4% |

El autor advierte que la perplejidad sobre texto crudo no es significativa para un checkpoint instruct (el propio BF16 obtiene 10.111 en WikiText-2 sin su chat template), por lo que la comparacion se hace siempre contra el BF16 sobre los mismos tokens. Se forzo el token BOS con `--override-kv tokenizer.ggml.add_bos_token=bool:true` porque los tokenizers de Gemma 4 GGUF no lo anaden por defecto.

## Requisitos de hardware

- VRAM estimada: el fichero elegido mas la KV cache del contexto (`-c`). Q4_K_M ocupa 16,8 GB, Q8_0 26,9 GB y BF16 50,5 GB, sin contar la cache.
- Reduccion de KV cache: `--cache-type-k q8_0 --cache-type-v q8_0 -fa on` la reduce aproximadamente a la mitad en tiempo de ejecucion (no esta embebido en el fichero).
- GPU recomendadas: el autor verifico en NVIDIA B200. Q4_K_M cabe en GPUs de 24 GB (por ejemplo, RTX 4090 o A10G); Q8_0 requiere 32 GB o mas (A100 40 GB, L40S); BF16 requiere 80 GB (A100/H100 80 GB) o descarga parcial a CPU.
- GPU de consumo: Q4_K_M es la unica variante que cabe comodamente en una GPU consumer de gama alta con 24 GB, siempre que el contexto no sea muy largo.
- Opciones de despliegue: llama.cpp (build >= b8637, obligatorio para la arquitectura `gemma4`; `-fa on` requiere >= b6325), Ollama y LM Studio (no probados por el autor).
- Latencia y throughput: no disponibles; el autor no publica cifras de tokens por segundo.

## Comparativa con modelos similares

No se dispone de datos de rendimiento del modelo base ni de alternativas en la informacion proporcionada, por lo que la comparacion se limita a parametros y disponibilidad:

| Modelo | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| gemma-4-26B-A4B-it (esta ficha, GGUF) | 25,23B totales, MoE | no disponible | apache-2.0 / licencia Gemma 4 | GGUF (BF16, Q4_K_M, Q8_0) |
| google/gemma-4-26B-A4B-it (original) | 25,23B totales, MoE | no disponible | licencia Gemma 4 | safetensors (BF16) |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Esta build es solo de texto: no incluye `mmproj`, por lo que no puede procesar imagenes aunque el modelo base sea multimodal.
- La perdida de fidelidad de Q4_K_M es notable: solo el 43,0% de coincidencia top-1 con BF16 en ingles y el 42,2% en coreano, con KLD de 3,14 y 3,23. Para tareas sensibles a la precision conviene Q8_0 o BF16.
- No se han publicado evaluaciones de sesgo, alucinacion ni seguridad para esta cuantizacion ni para el modelo base en la informacion disponible.
- La lista oficial de idiomas soportados no esta disponible; las mediciones solo cubren ingles y coreano.
- La etiqueta del repo indica apache-2.0, pero el autor remite a la licencia de Gemma 4 de Google, que puede imponer restricciones adicionales al uso comercial; conviene revisarla antes de desplegar en produccion.
- La arquitectura `gemma4` exige llama.cpp >= b8637; versiones anteriores no cargaran el modelo.
- Ollama y LM Studio no fueron probados por el autor; el soporte en esas plataformas no esta verificado.
- El autor advierte que la perplejidad sobre texto crudo no es una metrica valida para este checkpoint instruct sin su chat template.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/axteam/gemma-4-26B-A4B-it-GGUF
- Modelo base: https://huggingface.co/google/gemma-4-26B-A4B-it
- Licencia de Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
