# axteam/Qwen3.5-9B-GGUF

## Resumen

axteam/Qwen3.5-9B-GGUF es una compilación de cuantizaciones GGUF del modelo Qwen/Qwen3.5-9B, desarrollado originalmente por el equipo Qwen (Alibaba). El repositorio lo publica el usuario axteam y su propósito es hacer utilizable el modelo base en entornos de inferencia local mediante llama.cpp, Ollama y LM Studio, sin necesidad de GPUs de datacenter ni de frameworks de servicio pesados.

El modelo base cuenta con 9.197.093.888 parámetros (aproximadamente 9,2 mil millones) y se distribuye bajo licencia Apache-2.0. La conversión se ha realizado con las herramientas oficiales de llama.cpp (`convert_hf_to_gguf.py` y `llama-quantize`) aplicando cuantización de posentrenamiento (PTQ) por bloques del tipo k-quant, sin reentrenamiento, y conservando la plantilla de chat original embebida en cada fichero.

La relevancia de esta ficha es práctica: el repositorio ofrece dos cuantizaciones (Q4_K_M de 5,8 GB y Q8_0 de 9,8 GB) con mediciones de perplejidad publicadas sobre WikiText-2 y una muestra de Wikipedia en coreano, ejecutadas en una NVIDIA B200 con llama.cpp b12005. Es una opción directa para desplegar un modelo de 9B en hardware de consumo o en una sola GPU profesional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | transformer denso (arquitectura `qwen35` en llama.cpp); incluye capa de predicción multi-token (MTP) |
| Parametros totales | 9.197.093.888 (~9,2 B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (los ejemplos de ejecucion usan `-c 8192`) |
| Tipos de cuantizacion | Q4_K_M (4 bits k-quant, recomendada) y Q8_0 (8 bits) |
| Idiomas soportados | no disponible de forma explicita; la model card incluye ejemplos y mediciones en ingles y coreano |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp); el modelo base original se distribuye en safetensors/BF16 |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de aproximadamente 9,2 mil millones de parametros, identificado en llama.cpp con la arquitectura `qwen35`. Los ficheros GGUF de este repositorio incluyen ademas la capa de prediccion multi-token (MTP) del modelo original, cuyo soporte en llama.cpp llega a partir de la build b9180 (PR #22673). No se incluye el codificador de vision: estos GGUF son exclusivamente texto y no incorporan fichero `mmproj`.

La cuantizacion es de posentrenamiento (PTQ), realizada en dos pasos con las herramientas de llama.cpp: conversion de los pesos BF16 a GGUF y cuantizacion por bloques con escalas por bloque y asignacion mixta de bits (k-quants). No hay reentrenamiento ni ajuste fino posterior. La plantilla de chat original queda embebida en cada fichero. No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO en el modelo base dentro de la informacion proporcionada.

## Capacidades

- Generacion de texto conversacional en formato chat, con la plantilla original del modelo Qwen3.5-9B embebida en el GGUF.
- Razonamiento y respuesta a preguntas: la model card verifica respuestas correctas a preguntas cortas (capital de Francia y de Corea) con todos los ficheros del repositorio.
- Capacidad multilingue: se han publicado mediciones de perplejidad tanto en ingles (WikiText-2) como en coreano (muestra de Wikipedia en coreano), lo que evidencia cobertura al menos de ambos idiomas.
- Prediccion multi-token (MTP): los ficheros incluyen esta capa, lo que habilita decodificacion especulativa en versiones de llama.cpp que la soportan.
- Servicio mediante API compatible con OpenAI a traves de `llama-server`.
- Sin capacidad de vision: el repositorio no incluye proyector multimodal ni codificador de imagen, por lo que no admite entrada de imagenes ni OCR.
- Soporte de tool calling / function calling y de agentes: no disponible en la informacion proporcionada para esta compilacion.

## Casos de uso

- Asistente conversacional local: con el fichero Q4_K_M (5,8 GB) se puede servir un chatbot multi-turno en una estacion de trabajo con GPU de consumo, usando `llama-server` con `-c 8192 --jinja` y la plantilla de chat ya embebida.
- Sustitucion de API en desarrollo: `llama-server` expone un endpoint compatible con OpenAI (`/v1/chat/completions`), de modo que se puede apuntar el SDK de OpenAI a `localhost:8080` para pruebas sin coste de tokens ni dependencia de red.
- Procesamiento de texto en coreano e ingles: las mediciones de perplejidad publicadas en ambos idiomas respaldan su uso en tareas de resumen, clasificacion o generacion en esos idiomas; el Q8_0 ofrece la menor degradacion (PPL 4,87 en coreano frente a 5,04 del Q4_K_M).
- Prototipado en equipos sin GPU dedicada: el Q4_K_M de 5,8 GB permite ejecucion con capas parcialmente en CPU y KV cache reducida mediante `--cache-type-k q8_0 --cache-type-v q8_0 -fa on`, que aproximadamente divide por dos la memoria de la cache.
- Evaluacion comparativa de cuantizaciones: el repositorio publica PPL de referencia (Q8_0: 7,06 en WikiText-2 y 4,87 en coreano) que sirve como linea base para medir el impacto de otras cuantizaciones o de cambios en el contexto.
- Despliegue en Ollama o LM Studio: la model card documenta `ollama run hf.co/axteam/Qwen3.5-9B-GGUF:Q4_K_M` y la busqueda por nombre en LM Studio, lo que facilita entornos de escritorio para pruebas de producto.
- Generacion asistida con decodificacion especulativa: al incluir la capa MTP y requerir llama.cpp b9180 o superior, se puede aprovechar esa funcionalidad para reducir latencia en inferencia por token, siempre que el backend la tenga habilitada.

## Benchmarks y rendimiento

Unicos datos publicados en la informacion disponible: perplejidad medida con llama.cpp b12005 (commit e0f142d, build CUDA) sobre una NVIDIA B200, todas las capas en GPU, 16 ventanas de 2.048 tokens del conjunto de test de WikiText-2 y de una muestra de Wikipedia en coreano. Menor es mejor. Las comparaciones porcentuales son relativas a Q8_0, el fichero mas proximo al original al no existir BF16 en el repositorio.

| Fichero | PPL WikiText-2 (EN) | PPL Wikipedia coreano | vs Q8_0 (EN / KO) |
|---|---|---|---|
| Qwen3.5-9B-Q8_0.gguf | 7,06 | 4,87 | referencia |
| Qwen3.5-9B-Q4_K_M.gguf | 7,10 | 5,04 | +0,6 % / +3,5 % |

El propio autor advierte que 16 ventanas por texto es una muestra pequena y que diferencias de pocos puntos porcentuales entre ficheros quedan dentro del ruido de muestreo (remidieron dos repositorios con 64 ventanas y las diferencias se movieron hasta unos 19 puntos). No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente el tamano del fichero GGUF mas la cache KV del contexto configurado. Q4_K_M ocupa 5,8 GB y Q8_0 ocupa 9,8 GB; a ello se suma la KV cache segun `-c`.
- Reduccion de KV cache: `--cache-type-k q8_0 --cache-type-v q8_0 -fa on` aproximadamente la divide por dos, segun la model card.
- GPU verificadas: NVIDIA B200 con todas las capas en GPU y llama.cpp b12005 (commit e0f142d, build CUDA). No se documentan otras GPU en la informacion proporcionada.
- GPU de consumo: no se especifican modelos concretos en la informacion disponible; por tamano, el Q4_K_M de 5,8 GB es compatible con tarjetas de 8 GB o mas si se ajusta el contexto y se usa KV cache cuantizada, pero esta afirmacion no esta verificada en la model card.
- Opciones de despliegue: llama.cpp (`llama-server`, `llama-cli`), Ollama y LM Studio. La model card indica que Ollama y LM Studio no fueron probados por el autor.
- Version minima de llama.cpp: b9180 (la arquitectura `qwen35` esta desde b7990; el soporte de MTP llega en b9180, PR #22673; `-fa on` requiere b6325 o superior).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de modelos alternativos en la informacion proporcionada, por lo que la comparacion cuantitativa no esta disponible. Los unicos puntos de referencia objetivos son las dos cuantizaciones entre si:

| Modelo / fichero | Parametros | Contexto | PPL WikiText-2 | Licencia | Formato |
|---|---|---|---|---|---|
| axteam/Qwen3.5-9B-GGUF Q8_0 | ~9,2 B | no disponible | 7,06 | Apache-2.0 | GGUF |
| axteam/Qwen3.5-9B-GGUF Q4_K_M | ~9,2 B | no disponible | 7,10 | Apache-2.0 | GGUF |
| Qwen/Qwen3.5-9B (base) | ~9,2 B | no disponible | no disponible (sin fichero BF16 en este repo) | Apache-2.0 | safetensors/BF16 |

## Limitaciones y advertencias

- Solo texto: estos GGUF no incluyen codificador de vision ni fichero `mmproj`; no admiten imagenes ni OCR, a diferencia del modelo base completo.
- Muestra de evaluacion reducida: las perplejidades se calcularon con 16 ventanas de 2.048 tokens por texto; el autor reconoce que las diferencias de pocos puntos porcentuales estan dentro del ruido de muestreo.
- Ausencia de BF16 de referencia: al no incluirse el fichero BF16, las comparaciones se hacen contra Q8_0 y no contra el modelo original.
- Dependencia de version: los ficheros requieren llama.cpp b9180 o superior por la capa MTP; versiones anteriores pueden fallar al cargar o ignorar esa capa.
- Ollama y LM Studio no verificados por el autor: la model card solo confirma ejecucion con llama.cpp.
- Sesgos y alucinaciones: no se documentan sesgos conocidos ni tasas de alucinacion en la informacion proporcionada; se aplican los riesgos habituales de un modelo de lenguaje de 9B sin datos especificos publicados.
- Idiomas: no hay una lista oficial de idiomas soportados; la evidencia disponible se limita a ingles y coreano.
- Licencia: Apache-2.0 permite uso comercial, pero los derechos sobre los pesos y el tokenizador originales pertenecen al equipo Qwen (Alibaba) y la licencia del derivado sigue la del modelo base.
- Para produccion: conviene fijar la version de llama.cpp, validar la plantilla de chat con `--jinja` y medir la KV cache real segun el contexto objetivo antes de dimensionar hardware.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/axteam/Qwen3.5-9B-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-9B/blob/main/LICENSE
- llama.cpp (herramientas de conversion y cuantizacion): no disponible en la informacion proporcionada
- PR de soporte MTP en llama.cpp (#22673): no disponible como enlace en la informacion proporcionada
- Papers, blogs o demos adicionales: no disponibles en la informacion proporcionada
