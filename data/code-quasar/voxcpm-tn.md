# Code-Quasar/voxcpm-tn

## Resumen

Code-Quasar/voxcpm-tn es un modelo de sintesis de voz (text-to-speech) especializado en derja tunecina, el dialecto arabe hablado en Tunez. Se trata de un fine-tuning completo del modelo base openbmb/VoxCPM2, un sistema TTS de aproximadamente 2.290 millones de parametros y arquitectura tokenizer-free que genera audio a 48 kHz. El modelo lo publica el usuario Code-Quasar y se distribuye bajo licencia Apache 2.0.

El problema que resuelve es la escasez de voces sinteticas de calidad para dialectos arabes magrebies: la mayoria de sistemas TTS comerciales y abiertos estan entrenados sobre arabe estandar moderno (MSA) o sobre variedades muy mayoritarias como el egipcio, y producen una pronunciacion y prosodia poco naturales al leer texto en derja tunecina. Este modelo intenta cubrir ese hueco mediante un ajuste fino sobre un corpus de habla leida en dialecto tunecino.

Es relevante ahora porque el ecosistema TTS abierto esta migrando hacia arquitecturas sin tokenizer de texto, capaces de modelar directamente la señal acustica, y porque los dialectos arabes estan infrarrepresentados tanto en corpus como en modelos publicados. El repositorio contiene 9,5 GB, lo que resulta coherente con pesos almacenados en precision completa (fp32) para 2,29 mil millones de parametros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TTS tokenizer-free heredada de openbmb/VoxCPM2; detalles internos de capas no disponibles |
| Parametros totales | 2.290.004.544 (aprox. 2,29 B) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (modelo de sintesis de voz; no se documenta una ventana de contexto de texto) |
| Tipos de cuantizacion | no disponible (el repositorio solo publica safetensors; el tamano de 9,5 GB es coherente con fp32) |
| Idiomas soportados | arabe, con especializacion en derja tunecina (etiqueta `ar` en la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Frecuencia de salida | 48 kHz |
| Frecuencia del corpus de entrenamiento | 16 kHz mono |
| Metodo de ajuste | fine-tuning completo, 147 pasos |
| Libreria | voxcpm |
| Pipeline | text-to-speech |

## Arquitectura y entrenamiento

El modelo parte de openbmb/VoxCPM2, un sistema TTS descrito por el autor como "tokenizer-free", es decir, que no depende de un tokenizador de texto discreto para la sintesis. El ajuste aplicado es un fine-tuning completo (no LoRA ni adaptadores) de los pesos del modelo base, ejecutado durante 147 pasos sobre aproximadamente un numero no especificado de horas de habla leida en tunecino a 16 kHz mono. La model card no aclara el numero exacto de horas ni la composicion del corpus, y tampoco indica si se aplicaron fases de RLHF, DPO o ajuste por preferencias, por lo que esos datos deben considerarse no disponibles.

La innovacion operativa mas destacable no es arquitectonica sino de condicionamiento: todas las transcripciones de entrenamiento se prefijaron con la etiqueta literal `(Tunisian Dialect)`. Esto convierte el dialecto en una variable de control explicita y obliga a anteponer esa misma etiqueta en inferencia; cualquier texto sin ella queda fuera de la distribucion de entrenamiento. El autor documenta ademas un detalle de despliegue relevante: en GPUs con menos de unos 8 GB de VRAM conviene desactivar la compilacion de TorchDynamo mediante `TORCHDYNAMO_DISABLE=1`, y el cargador del modelo admite `load_denoiser=False` para omitir el modulo de reduccion de ruido.

## Capacidades

- Sintesis de voz (text-to-speech) de texto en derja tunecina a audio de 48 kHz.
- Condicionamiento explicito de dialecto mediante el prefijo `(Tunisian Dialect)` en el texto de entrada.
- Generacion de habla a partir de texto plano escrito en caracteres arabes.
- Carga mediante la libreria `voxcpm` con la API `VoxCPM.from_pretrained(...)` y salida en formato de onda compatible con `soundfile`.
- Desactivacion opcional del modulo denoiser (`load_denoiser=False`), util para reducir requisitos de memoria.
- No se documentan capacidades de clonacion de voz, control emocional, tool calling, function calling, agentes, razonamiento multi-paso, vision ni audio de entrada. Tampoco se documenta soporte multilingue mas alla del arabe tunecino.

## Casos de uso

- Audiolibros y contenido editorial en derja: el modelo permite convertir texto tunecino escrito en narracion sintetica sin pasar por arabe estandar, lo que evita la incongruencia entre registro escrito y registro hablado. Es adecuado porque el corpus de entrenamiento es habla leida, precisamente el registro de un audiolibro.
- Locuciones para medios digitales tunecinos: radios, podcasts y canales de video pueden generar voces en off para piezas informativas o promocionales en dialecto local, reduciendo el coste de contratar locutores para piezas cortas.
- Prototipado de interfaces de voz en productos locales: aplicaciones de banca, transporte o administracion dirigidas a publico tunecino pueden validar flujos de voz en derja antes de invertir en grabaciones profesionales.
- Dooblaje y subtitulado accesible: conversion de subtitulos en derja a pista de audio, util para plataformas que quieran ofrecer versiones sonoras de contenido ya subtitulado.
- Sistemas de anuncios y megafonia: generacion de avisos hablados en estaciones, comercios o recintos donde el publico objetivo usa derja de forma mayoritaria y la locucion en MSA resulta poco cercana.
- Investigacion en dialectologia y procesamiento de dialectos arabes: el modelo sirve como punto de partida para estudiar transferencia desde MSA hacia variedades magrebies, o como baseline para comparar tecnicas de adaptacion con pocos datos.
- Material didactico para aprendizaje de derja: generacion de ejemplos de pronunciacion para cursos o aplicaciones de aprendizaje dirigidas a hablantes de otras variedades arabes o a estudiantes extranjeros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas objetivas como MOS (mean opinion score), similitud de hablante, WER de transcripcion inversa ni comparaciones cuantitativas con otros sistemas TTS, y los resultados de busqueda web proporcionados no contienen informacion relevante sobre el modelo (se limitan a examenes de codigo de circulacion en frances y no guardan relacion con este repositorio).

## Requisitos de hardware

- VRAM estimada para inferencia (calculada a partir de 2,29 B de parametros): aproximadamente 9,2 GB solo de pesos en fp32, unos 4,6 GB en fp16/bf16, unos 2,3 GB en int8 y unos 1,2 GB en int4. Estas cifras son estimaciones derivadas del numero de parametros y no cifras oficiales del autor.
- El autor indica que en GPUs con menos de unos 8 GB de VRAM debe desactivarse la compilacion con `TORCHDYNAMO_DISABLE=1`.
- GPUs recomendadas: no especificadas por el autor. Por tamano, el modelo deberia caber sin problemas en GPUs de gama alta para centro de datos (A100, H100) y en GPUs de consumo con 8 GB o mas de VRAM (por ejemplo RTX 3060 Ti, 3070, 4060 Ti, 4070 y superiores). Esta recomendacion es una inferencia por tamano de parametros, no un dato publicado.
- Opciones de despliegue documentadas: la libreria `voxcpm` con PyTorch y CUDA, con la opcion de cargar sin denoiser. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. La model card solo indica que el ajuste se hizo en 147 pasos, dato de entrenamiento que no informa sobre velocidad de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Licencia | Relacion |
|---|---|---|---|---|
| Code-Quasar/voxcpm-tn | 2,29 B | Arabe, especializado en derja tunecina | Apache 2.0 | Modelo objeto de esta ficha |
| openbmb/VoxCPM2 | Aprox. 2 B (segun la model card) | No especificado en la informacion disponible | No disponible en la informacion proporcionada | Modelo base del que deriva el ajuste; mismo tamano, sin especializacion dialectal |

No se dispone de informacion sobre otros modelos TTS abiertos para dialectos arabes magrebies con los que establecer una comparacion fiable de parametros, contexto, rendimiento y licencia. Por tanto, la comparativa con alternativas adicionales queda como no disponible.

## Limitaciones y advertencias

- El modelo fue entrenado sobre un corpus pequeno de habla leida, por lo que el propio autor anticipa un rango prosodico limitado y un fraseo debil en textos largos.
- El texto de entrada debe ir obligatoriamente prefijado con `(Tunisian Dialect)`. Cualquier texto sin esa etiqueta queda fuera de la distribucion de entrenamiento y el resultado puede ser degradado o impredecible.
- Al estar entrenado sobre habla leida, el rendimiento en registros espontaneos, conversacionales o con ruido de fondo es incierto y no documentado.
- El corpus deriva de fuentes con sus propios terminos de licencia y las voces pertenecen a hablantes reales, segun advierte el propio autor. Esto puede introducir restricciones adicionales al uso comercial o a la redistribucion, mas alla de la licencia Apache 2.0 aplicada a los pesos.
- Riesgo de sesgo de hablante y de acento: al provenir de un corpus reducido, la diversidad de voces, edades, generos y procedencias dentro de Tunez probablemente sea limitada, aunque no se cuantifica.
- No se documentan evaluaciones objetivas de calidad, inteligibilidad ni fidelidad, por lo que cualquier decision de produccion deberia ir acompanada de una evaluacion propia con hablantes nativos.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, y las fechas de creacion y actualizacion son muy proximas entre si, lo que sugiere una publicacion reciente y sin validacion externa conocida.
- No se documentan mecanismos de marcado de agua (watermarking) ni de identificacion de audio generado, aspecto relevante para cumplir normativas de transparencia sobre contenido sintetico.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Code-Quasar/voxcpm-tn
- Modelo base: https://huggingface.co/openbmb/VoxCPM2
- Resultados de busqueda web: no se ha encontrado ningun enlace relevante sobre el modelo; los resultados devueltos corresponden a examenes de codigo de circulacion y no guardan relacion con este repositorio.
