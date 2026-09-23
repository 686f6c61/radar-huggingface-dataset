# altbit/avatarsvc-prep-models

## Resumen

`altbit/avatarsvc-prep-models` no es un modelo nuevo: es un repositorio agregador de 38,3 GB que reempaqueta dos modelos upstream con licencia Apache-2.0 como subcarpetas de un unico repositorio, de forma que una unica referencia de modelo cachee ambos en el endpoint de preparacion de un servicio de avatares. El autor declara explicitamente que no se ha modificado ningun peso, configuracion ni tokenizador, y publica el sha256 de cada fichero para permitir la verificacion.

Los dos submodelos son `flux/`, copia no modificada de `black-forest-labs/FLUX.1-schnell` (23 ficheros), un transformer de difusion de aproximadamente 12.000 millones de parametros para generacion de imagenes a partir de texto; y `qwen3-tts/`, copia no modificada de `Qwen/Qwen3-TTS-12Hz-1.7B-Base` (13 ficheros), un modelo de sintesis de voz de 1.700 millones de parametros con un tokenizador de audio propio a 12 Hz.

Su relevancia es operativa, no cientifica: resuelve el problema de aprovisionar en un solo `snapshot` los dos modelos que necesita un pipeline de generacion de avatares (imagen mas voz), a costa de duplicar el almacenamiento. El repositorio no tiene pipeline declarado, ni descargas, ni likes en el momento de la consulta, y la licencia efectiva es la de los modelos originales.

## Especificaciones tecnicas

Especificaciones a nivel de repositorio (agrega dos submodelos independientes):

| Parametro | Valor |
|---|---|
| Arquitectura | repositorio agregador sin arquitectura propia; contiene un transformer de difusion (`flux/`) y un modelo TTS con tokenizador de audio (`qwen3-tts/`) |
| Parametros totales | aproximadamente 13.700 millones en conjunto: ~12.000 M en `flux/` y ~1.700 M en `qwen3-tts/` (estimado a partir del tamano de los ficheros safetensors) |
| Parametros activos | no aplica (ninguno de los dos submodelos es MoE) |
| Longitud de contexto | no disponible; consultable en `flux/text_encoder_2/config.json` y `qwen3-tts/config.json` |
| Tipos de cuantizacion | no disponible; solo se publican pesos en safetensors (bf16/fp16), sin variantes GGUF, AWQ, GPTQ ni fp8 |
| Idiomas soportados | no disponible en la informacion del repositorio |
| Licencia | Apache-2.0 en ambos submodelos (heredada de los upstream) |
| Formato de pesos | safetensors; estructura diffusers en `flux/` y estructura transformers en `qwen3-tts/` |

Desglose de pesos por subcarpeta:

| Subcarpeta | Componente | Tamano | Fichero |
|---|---|---|---|
| `flux/` | transformer (difusion) | 23,78 GB | 3 shards safetensors |
| `flux/` | text_encoder_2 (T5) | 9,52 GB | 2 shards safetensors |
| `flux/` | text_encoder (CLIP) | 246 MB | `model.safetensors` |
| `flux/` | VAE | 168 MB | `diffusion_pytorch_model.safetensors` |
| `qwen3-tts/` | modelo principal | 3,86 GB | `model.safetensors` |
| `qwen3-tts/` | speech_tokenizer | 682 MB | `speech_tokenizer/model.safetensors` |

Otros datos del repositorio: 38,3 GB de tamano total, libreria declarada `diffusers`, etiquetas `diffusers`, `safetensors` y `region:us`, sin pipeline asignado.

## Arquitectura y entrenamiento

Este repositorio no entrena nada. Cada subcarpeta es una copia byte a byte de un commit concreto del upstream: `flux/` corresponde a `black-forest-labs/FLUX.1-schnell` en el commit `741f7c3ce8b383c54771c7003378a50191e9efe9`, y `qwen3-tts/` a `Qwen/Qwen3-TTS-12Hz-1.7B-Base` en el commit `fd4b254389122332181a7c3db7f27e918eec64e3`. En el caso de `flux/`, que es un pipeline diffusers, el autor conserva unicamente el subconjunto de componentes que referencia `model_index.json`, no el repositorio completo. Toda la innovacion tecnica reside, por tanto, en los modelos originales.

FLUX.1-schnell es la variante destilada del modelo FLUX.1 de Black Forest Labs: un transformer de flujo rectificado que integra los text encoders (uno de tipo CLIP y otro T5) y el VAE dentro del propio pipeline de difusion, con decodificacion latente en el espacio del VAE. La destilacion de pasos temporales le permite generar imagenes en muy pocos pasos de inferencia en lugar de las decenas que requieren los modelos de difusion convencionales, lo que explica su presencia en un endpoint de preparacion de avatares, donde la latencia importa. Los detalles de composicion del dataset, numero de tokens de entrenamiento y uso de RLHF/DPO no estan disponibles en la informacion proporcionada.

Qwen3-TTS-12Hz-1.7B-Base es un modelo de sintesis de voz que combina un decodificador de texto-a-audio con un tokenizador de discurso dedicado. El identificador "12Hz" hace referencia a la frecuencia de trama del tokenizador de audio: 12 tokens por segundo de audio, lo que comprime fuertemente la representacion acustica frente a codecs de mayor tasa. La variante "Base" es el checkpoint base de la familia, sin los adaptadores de voces predefinidas o diseno de voz que otras variantes anaden. Incluye tokenizador BPE de texto (`vocab.json` y `merges.txt`) y un `generation_config.json` que fija los parametros de decodificacion por defecto. No se dispone de informacion sobre el corpus de entrenamiento ni sobre tecnicas de alineacion aplicadas.

## Capacidades

- Generacion de imagenes texto-a-imagen mediante `flux/`: pipeline de difusion completo con transformer, text encoders y VAE.
- Generacion en pocos pasos de inferencia (la caracteristica definitoria de la variante schnell), adecuada para previsualizaciones y generacion interactiva.
- Sintesis de voz texto-a-audio mediante `qwen3-tts/`, con representacion acustica a 12 Hz a traves del speech_tokenizer.
- Tokenizacion de texto BPE integrada en `qwen3-tts/`, con `tokenizer_config.json`, `vocab.json` y `merges.txt` presentes.
- Carga directa con las librerias declaradas: diffusers para `flux/` y transformers para `qwen3-tts/`.
- No dispone de tool calling, function calling ni soporte de agentes: ninguno de los dos submodelos es un modelo de lenguaje conversacional.
- No dispone de modo de razonamiento (thinking mode), vision-lenguaje ni capacidades multimodales de entrada mixta en el sentido de un LLM.
- Capacidades multilingues: no disponible en la informacion proporcionada; dependen de los tokenizadores y de los datos de entrenamiento de los upstream.

## Casos de uso

- Aprovisionamiento de un servicio de avatares: el caso de uso declarado por el autor. Un unico `snapshot` del repositorio cachea simultaneamente el generador de imagen y el sintetizador de voz, de modo que el endpoint de preparacion no necesita dos descargas ni dos referencias de modelo distintas. Solo tiene sentido cuando el servicio usa ambos modelos a la vez.
- Generacion de imagenes de perfil o retratos estilizados: `flux/` produce la imagen del avatar a partir de una descripcion textual, con la ventaja de la generacion en pocos pasos para respuestas casi interactivas.
- Locucion sintetica de avatares: `qwen3-tts/` convierte el texto de respuesta del avatar en audio, con un coste de memoria bajo (menos de 5 GB de pesos) que permite mantenerlo residente en GPU junto al generador de imagen.
- Prototipado de asistentes con voz en local: cargando `qwen3-tts/` con transformers en una GPU de consumo se puede montar un pipeline texto-a-voz sin depender de APIs externas.
- Generacion de contenido para entornos sociales 3D y VRChat: produccion por lotes de imagenes de avatar y clips de voz para catalogos de assets, aprovechando que ambos modelos admiten ejecucion por lotes.
- Verificacion de reproducibilidad en investigacion: los sha256 publicados para los 36 ficheros permiten confirmar que un despliegue concreto usa exactamente los mismos pesos que el commit upstream referenciado, algo util en auditorias de licencia y de integridad de artefactos.
- Construccion de un espejo interno (mirror) corporativo: el repositorio sirve como plantilla para empaquetar varios modelos Apache-2.0 en un unico artefacto cacheable en un registro privado, siempre que se asuma el sobrecoste de almacenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye evaluaciones propias, tarjetas de resultados ni comparativas numericas, y tampoco se han encontrado en los resultados de busqueda web datos de FID, CLIP score, WER, MOS u otras metricas para los submodelos empaquetados.

| Metrica | Resultado |
|---|---|
| Benchmarks de imagen (FID, CLIP score) | no disponible |
| Benchmarks de voz (WER, MOS, similitud de hablante) | no disponible |
| Latencia o throughput medidos | no disponible |

## Requisitos de hardware

- `flux/` en precision completa: los pesos suman aproximadamente 33,7 GB (23,78 GB del transformer en bf16, 9,52 GB del text encoder T5, 246 MB del text encoder CLIP y 168 MB del VAE). Ejecutarlo entero en VRAM exige GPUs de 40 GB o mas, como A100 40 GB, A100 80 GB, H100 80 GB o L40S 48 GB.
- `flux/` con offload: usando `enable_model_cpu_offload` o `enable_sequential_cpu_offload` de diffusers, el pipeline cabe en GPUs de 24 GB (RTX 3090, RTX 4090, A10G) y, con offload secuencial, en 16 GB, a costa de una latencia notablemente mayor por los trasvases a RAM.
- `flux/` en GPU de consumo: no cabe sin offload si se carga en bf16 completo, porque 33,7 GB superan los 24 GB de las tarjetas de consumo mas capaces. Este repositorio no incluye pesos cuantizados, asi que las tecnicas habituales de reduccion (GGUF q4/q8, fp8) requeririan obtener los ficheros por otra via.
- `qwen3-tts/`: los pesos suman aproximadamente 4,54 GB (3,86 GB del modelo y 682 MB del speech_tokenizer), por lo que cabe holgadamente en GPUs de consumo de 8 GB (RTX 3060, RTX 4060, RTX 3070) e incluso en tarjetas de 6 GB con margen ajustado.
- Despliegue de `flux/`: diffusers con las clases de pipeline de FLUX. Los servidores orientados a LLM (vLLM, TGI, Ollama, llama.cpp) no aplican a un modelo de difusion.
- Despliegue de `qwen3-tts/`: transformers, cargando el modelo y el speech_tokenizer por separado. Tampoco aplican vLLM ni llama.cpp, al no ser un modelo de lenguaje causal de proposito general.
- Latencia y throughput: no disponibles. Solo puede afirmarse cualitativamente que la variante schnell esta disenada para requerir pocos pasos de inferencia, y que el modelo TTS es de 1,7B, un tamano moderado para sintesis de voz.
- Almacenamiento: 38,3 GB de disco para el repositorio completo, sin contar cache de HuggingFace ni pesos duplicados si ya se tienen los upstream por separado.

## Comparativa con modelos similares

Comparativa con las fuentes upstream y con alternativas de la misma categoria:

| Modelo | Tipo | Parametros | Licencia | Disponibilidad |
|---|---|---|---|---|
| `altbit/avatarsvc-prep-models` | agregador de imagen + TTS | ~13.700 M en total | Apache-2.0 (heredada) | HuggingFace, 38,3 GB, sin pipeline declarado |
| `black-forest-labs/FLUX.1-schnell` | difusion texto-a-imagen | ~12.000 M (estimado) | Apache-2.0 | HuggingFace, repositorio oficial |
| `Qwen/Qwen3-TTS-12Hz-1.7B-Base` | sintesis de voz texto-a-audio | 1.700 M | Apache-2.0 | HuggingFace, repositorio oficial |
| `black-forest-labs/FLUX.1-dev` | difusion texto-a-imagen | ~12.000 M (estimado) | licencia no comercial de FLUX.1 [dev] | HuggingFace, repositorio oficial |
| `stabilityai/stable-diffusion-xl-base-1.0` | difusion texto-a-imagen | ~3.500 M (UNet de ~2.600 M mas text encoders) | CreativeML Open RAIL++-M | HuggingFace, repositorio oficial |

Diferencias relevantes frente a los upstream: el contenido de pesos es identico, pero este repositorio anade un unico punto de descarga, hashes sha256 verificables y 38,3 GB de tamano conjunto. Frente a FLUX.1-dev, la variante schnell tiene licencia Apache-2.0 y por tanto permite uso comercial sin las restricciones de la licencia de dev. Frente a SDXL, los modelos basados en FLUX manejan un numero de parametros muy superior, con el coste de memoria asociado.

## Limitaciones y advertencias

- No es un modelo original ni un fine-tuning: no aporta ninguna mejora de calidad, velocidad ni seguridad sobre los modelos upstream. Si el objetivo es usar FLUX.1-schnell o Qwen3-TTS, descargar los repositorios oficiales es equivalente y mas eficiente en espacio.
- Duplicidad de almacenamiento: 38,3 GB para dos modelos que suman aproximadamente 38,2 GB. Si un despliegue ya tiene cacheado uno de los upstream, este repositorio duplica los pesos en disco.
- Riesgo de desincronizacion: al fijar commits concretos, el repositorio queda congelado en esas revisiones y no recibe correcciones ni actualizaciones de los modelos originales. Toda mejora posterior del upstream exige actualizar este empaquetado a mano.
- Sin garantias de mantenimiento: el repositorio no declara pipeline, no tiene descargas ni likes, y no se identifica un proceso de mantenimiento o soporte. Para produccion conviene tratar los upstream oficiales como fuente de verdad.
- Licencia: Apache-2.0 en ambos submodelos, lo que permite uso comercial, pero la responsabilidad de verificar que ningun fichero se ha alterado recae en el consumidor. Los sha256 publicados permiten esa verificacion; conviene ejecutarla antes de desplegar.
- Sesgos: no evaluados en este repositorio. Los sesgos de representacion en la generacion de imagenes y de voces del modelo TTS provienen de los datos de entrenamiento de los upstream y no se mitigan con este empaquetado.
- Alucinacion y artefactos: en `flux/` son esperables los artefactos tipicos de los modelos de difusion, especialmente en manos, texto renderizado y composiciones con muchas entidades. En `qwen3-tts/` son posibles errores de prosodia, pronunciacion y estabilidad en entradas largas. No hay evaluacion publicada en este repositorio que cuantifique ninguno de los dos casos.
- Limitaciones de contexto e idioma: no disponibles en la documentacion del repositorio. Al depender de los tokenizadores de los upstream, el rendimiento fuera de los idiomas mayoritarios de entrenamiento puede degradarse sin aviso.
- Advertencia de uso responsable: la combinacion de generacion de imagen y sintesis de voz en un mismo pipeline de avatares facilita la creacion de suplantaciones de identidad. Es responsabilidad del integrador anadir controles de consentimiento, marcado de contenido sintetico y trazabilidad.
- Idioma de la documentacion: la model card esta en ingles y no incluye ficha propia de idiomas, contexto ni latencias, por lo que cualquier requisito de produccion debe contrastarse contra los repositorios upstream.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/altbit/avatarsvc-prep-models
- Modelo upstream de imagen: https://huggingface.co/black-forest-labs/FLUX.1-schnell
- Commit de FLUX.1-schnell empaquetado: https://huggingface.co/black-forest-labs/FLUX.1-schnell/tree/741f7c3ce8b383c54771c7003378a50191e9efe9
- Modelo upstream de voz: https://huggingface.co/Qwen/Qwen3-TTS-12Hz-1.7B-Base
- Commit de Qwen3-TTS empaquetado: https://huggingface.co/Qwen/Qwen3-TTS-12Hz-1.7B-Base/tree/fd4b254389122332181a7c3db7f27e918eec64e3
- Alternativa de imagen con licencia no comercial: https://huggingface.co/black-forest-labs/FLUX.1-dev
- Alternativa de imagen de menor tamano: https://huggingface.co/stabilityai/stable-diffusion-xl-base-1.0
- Repositorio de avatares con difusion (referencia de la busqueda web, no vinculado a este modelo): https://github.com/NisaarAgharia/AI-Avatars
- Directorio de modelos abiertos (referencia de la busqueda web, no vinculado a este modelo): https://aimodels.org/ai-models/
- Archivo de modelos de la comunidad (referencia de la busqueda web, no vinculado a este modelo): https://civarchive.com/
- Biblioteca de modelos de imagen y video (referencia de la busqueda web, no vinculado a este modelo): https://civitai.com/models
- Assets para VRChat (referencia de la busqueda web, no vinculado a este modelo): https://vrcmods.com/
