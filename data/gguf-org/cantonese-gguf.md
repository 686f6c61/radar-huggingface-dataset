# gguf-org/cantonese-gguf

## Resumen

cantonese-gguf es un repositorio de pesos cuantizados en formato GGUF de la familia de modelos cantonese-dev, orientada a síntesis de voz (text-to-speech) en cantonés. El autor del repo es gguf-org, que publica conversiones GGUF de los modelos base de cantonese-dev: cantonese-1.2-0.6b, cantonese-1.2-1.7b, cantonese-1.7b-v1.1 y cantonese-v1-dev. El dato de parametros totales reportado en safetensors es de 914.643.008 parametros, lo que corresponde al modelo de aproximadamente 0,9B, coherente con la variante de 0.6b del modelo base.

El modelo resuelve la generacion de voz en cantonés a partir de texto, con soporte de diseno de voz (voice design) mediante instrucciones en lenguaje natural y clonacion de voz (voice clone) a partir de una muestra de referencia. La model card indica que la nueva estructura `cantonese` sustituye a `qwen3-tts` y soporta voice clone y voice design por defecto incluso sin adaptador LoRA, ademas de servir como base ajustable (fine-tunable).

Es relevante para desarrolladores que necesitan TTS en cantonés desplegable localmente con llama.cpp u otras herramientas compatibles con GGUF, con licencia Apache 2.0 y variantes de cuantizacion que permiten ejecucion en hardware modesto. El repo acumula 7528 descargas y 5 likes, con un tamano de repositorio de 32,3 GB que incluye multiples variantes y cuantizaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de TTS; la model card menciona estructura `cantonese` que sustituye a `qwen3-tts`) |
| Parametros totales | 914.643.008 (reportado en safetensors) |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF; se mencionan q8_0 y f16 en los ejemplos de la model card |
| Idiomas soportados | cantonés (yue); lista formal de idiomas no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo de cuantizaciones); modelo base en safetensors |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base. La model card indica que la nueva estructura se denomina `cantonese` y sustituye a la anterior `qwen3-tts`, lo que sugiere una arquitectura de TTS derivada o inspirada en la familia Qwen, pero no se confirma ni se aportan detalles sobre capas, atencion o mecanismo de decodificacion de audio. El modelo utiliza un codec de audio separado (`tts-tokenizer-12hz` en la nueva estructura, `qwen-tokenizer-12hz-nvfp4` en las variantes v1.2 y v1.3) que convierte el audio en tokens y viceversa.

En cuanto a entrenamiento, la model card menciona que la variante v1.2 se entreno con el dataset [cantonese-dev/cantonese-yt-8gb](https://huggingface.co/datasets/cantonese-dev/cantonese-yt-8gb), mientras que v1.3 uso un dataset distinto y un adaptador se entreno con el dataset de v1.3 para combinar las ventajas de ambas versiones: v1.2 produce habla mas natural y fluida y funciona bien en clonacion de voz, mientras que v1.3 mejora el diseno de voz a costa de naturalidad. No se especifican el numero de tokens de entrenamiento, la composicion completa del dataset ni si hubo RLHF o DPO.

## Capacidades

- Sintesis de voz (TTS) en cantonés a partir de texto de entrada.
- Diseno de voz (voice design): permite especificar caracteristicas de la voz mediante instrucciones en lenguaje natural, por ejemplo "A warm, low female voice, speaking slowly."
- Clonacion de voz (voice clone): permite generar habla con la voz de una muestra de referencia proporcionada con `-r out_ref.wav`.
- Clonacion de voz con texto de referencia (in-context learning): admite `--reference-text` para mejorar la clonacion cuando se dispone de la transcripcion de la muestra.
- Soporte de adaptadores LoRA en formato GGUF (`--adapter`), lo que permite ajustar el estilo o la voz sin recargar el modelo base.
- Modelo base ajustable (fine-tunable) segun la nota del desarrollador.
- Generacion de audio en formato WAV y MP3 segun los ejemplos de la model card.
- No se documentan capacidades de generacion de texto, razonamiento, codigo, matematicas, vision, tool calling ni agentes; el modelo es especificamente de sintesis de voz.

## Casos de uso

- Locucion automatica de contenido en cantonés: el modelo convierte articulos, guiones o subtitulos en audio con voces naturales, adecuado para podcasts, audiolibros y videos divulgativos dirigidos a audiencias de habla cantonesa.
- Asistentes de voz y agentes conversacionales en cantonés: se puede integrar como etapa TTS en un pipeline de asistente, generando respuestas habladas a partir del texto producido por un LLM, con control del tono y la velocidad mediante instrucciones de voice design.
- Clonacion de voz para doblaje y localizacion: a partir de una muestra de referencia de un actor de voz, el modelo permite generar nuevas locuciones con esa misma voz, util para doblar contenido al cantonés manteniendo la identidad vocal.
- Accesibilidad: conversion de texto a voz para personas con discapacidad visual o dificultades de lectura, con voces personalizables mediante instrucciones en lenguaje natural.
- Pruebas de concepto y prototipado local: al distribuirse en GGUF, se puede ejecutar en estaciones de trabajo sin GPU dedicada para validar ideas de producto de voz antes de escalar a produccion.
- Investigacion en TTS de bajo recurso: el modelo y sus adaptadores permiten experimentar con ajuste fino y evaluacion de calidad de voz en cantonés, un idioma con menos recursos que el mandarin.
- Generacion de avisos y anuncios automatizados: locuciones para sistemas de megafonia, transporte publico o telefonia con voces consistentes y controlables.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa, un modelo de aproximadamente 0,9B parametros en q8_0 ocupa del orden de 1 GB en pesos, y en f16 del orden de 1,8 GB, a lo que hay que sumar el codec de audio y el adaptador si se usa.
- GPU recomendadas: no especificadas por el autor. Por tamano, el modelo deberia caber en GPUs consumer de gama media y alta (por ejemplo, RTX 3060, RTX 4070, RTX 4090) y en GPUs de datacenter como A100 o H100, aunque no hay cifras oficiales de rendimiento.
- Cabe en GPU consumer: si, segun el tamano del modelo y las cuantizaciones disponibles (q8_0 y f16 mencionadas); no se dispone de confirmacion oficial de requisitos minimos.
- Opciones de despliegue: llama.cpp y herramientas compatibles con GGUF; los ejemplos de la model card usan una CLI llamada `gguf` con opciones `-m`, `--adapter`, `--codec-model`, `--instruction`, `-t`, `-r`, `--reference-text` y `-o`. No se documenta soporte de vLLM, TGI u Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| cantonese-gguf (este repo) | 914.643.008 (safetensors) | no disponible | Apache 2.0 | GGUF | TTS en cantonés con voice design y voice clone; cuantizaciones q8_0 y f16 |
| cantonese-dev/cantonese-1.2-0.6b | no disponible | no disponible | no disponible | safetensors | Modelo base de una de las variantes incluidas |
| cantonese-dev/cantonese-1.7b-v1.1 | no disponible | no disponible | no disponible | safetensors | Modelo base de mayor tamano con voice design y voice clone |
| cantonese-dev/cantonese-v1-dev | no disponible | no disponible | no disponible | safetensors | Modelo base de la primera generacion |

No se dispone de datos de benchmarks ni de otros modelos TTS comparables en la informacion proporcionada para establecer una comparativa de rendimiento.

## Limitaciones y advertencias

- La model card no documenta sesgos conocidos del modelo; al tratarse de un modelo entrenado con datos de YouTube en cantonés, es probable que herede sesgos de ese corpus, pero no se confirma oficialmente.
- Riesgo de alucinacion: no documentado para TTS; en sintesis de voz el riesgo se traduce en pronunciacion incorrecta, entonacion artificial o artefactos en el audio, no en texto inventado.
- Limitaciones de contexto o idioma: el modelo esta orientado al cantonés; no se documenta soporte de otros idiomas ni longitud maxima de texto de entrada.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero se recomienda verificar las condiciones de los modelos base de cantonese-dev y del dataset de entrenamiento citado.
- La model card advierte de diferencias de calidad entre versiones: v1.2 es mas natural y fluida y buena para clonacion, pero tiene problemas en diseno de voz; v1.3 mejora el diseno de voz pero puede sonar menos natural; el adaptador busca combinar ambas.
- El repo incluye multiples modelos base y variantes en un solo espacio de 32,3 GB, por lo que conviene seleccionar cuidadosamente el archivo GGUF y el codec compatible con cada version.
- La CLI de ejemplo (`gguf`) y el soporte de adaptadores no estan documentados en detalle; la integracion en produccion requiere validacion propia.
- No hay informacion sobre latencia, throughput ni calidad objetiva (MOS) que permita garantizar un rendimiento concreto en produccion.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/gguf-org/cantonese-gguf
- Modelo base cantonese-1.2-0.6b: https://huggingface.co/cantonese-dev/cantonese-1.2-0.6b
- Modelo base cantonese-1.2-1.7b: https://huggingface.co/cantonese-dev/cantonese-1.2-1.7b
- Modelo base cantonese-1.7b-v1.1: https://huggingface.co/cantonese-dev/cantonese-1.7b-v1.1
- Modelo base cantonese-v1-dev: https://huggingface.co/cantonese-dev/cantonese-v1-dev
- Dataset de entrenamiento citado: https://huggingface.co/datasets/cantonese-dev/cantonese-yt-8gb
- Repositorio de TTS GGUF relacionado: https://huggingface.co/gguf-org/cantonese-tts-gguf
