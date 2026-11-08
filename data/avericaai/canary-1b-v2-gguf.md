# avericaai/canary-1b-v2-gguf

## Resumen

`avericaai/canary-1b-v2-gguf` es una conversión a formato GGUF del modelo `nvidia/canary-1b-v2`, un sistema de reconocimiento automático del habla (ASR) y traducción de voz (AST) desarrollado originalmente por NVIDIA. La conversión permite ejecutar el modelo con el runtime [transcribe.cpp](https://github.com/handy-computer/transcribe.cpp), una implementación en C++ pensada para inferencia local sin dependencias de Python ni de CUDA. El modelo base se publicó en Hugging Face el 14 de agosto de 2025 y esta conversión se generó a partir del commit `87bc526` del repositorio original, fijado el 8 de mayo de 2026.

El modelo resuelve dos tareas sobre audio de 16 kHz mono en formato WAV: transcripción en 25 idiomas europeos y traducción de voz entre inglés y los otros 24 idiomas. Arquitectónicamente es un modelo multitarea AED (attention encoder-decoder) con un codificador FastConformer de 32 capas y un decodificador Transformer de 8 capas, con aproximadamente 980 millones de parámetros. No es un modelo de streaming y no expone marcas de tiempo a nivel de palabra o segmento en este port.

La relevancia de esta ficha radica en que ofrece una alternativa de despliegue local y ligera (la cuantización Q4_K_M ocupa 735 MB) para un modelo multilingüe de ASR que, en su versión original, requiere el stack de NeMo. Las cuantizaciones publicadas mantienen un WER prácticamente idéntico al de la versión F32 en LibriSpeech test-clean (1,91 % en Q4_K_M frente a 1,92 % en F32), lo que la convierte en una opción atractiva para integración en aplicaciones de escritorio, dispositivos con recursos limitados o pipelines sin GPU dedicada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder-decoder multitarea AED: FastConformer de 32 capas (encoder) + Transformer de 8 capas (decoder) |
| Parametros totales | 980.046.848 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de audio, no de texto; ventana de entrada no especificada en la informacion disponible) |
| Tipos de cuantizacion | F32, F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M |
| Idiomas soportados | 25: bg, hr, cs, da, nl, en, et, fi, fr, de, el, hu, it, lv, lt, mt, pl, pt, ro, sk, sl, es, sv, ru, uk |
| Licencia | CC-BY-4.0 (heredada del modelo base) |
| Formato de pesos | GGUF (safetensors en el modelo base original) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura encoder-decoder de tipo AED (attention encoder-decoder). El codificador es un FastConformer de 32 capas, una variante de Conformer con atención por chunks que reduce el coste computacional del self-attention manteniendo la capacidad de modelar dependencias locales y globales. El decodificador es un Transformer estándar de 8 capas que genera la secuencia de tokens de texto condicionada a las representaciones del encoder. El modelo es multitarea: la misma arquitectura sirve tanto para transcripción monolingüe como para traducción entre pares de idiomas, seleccionando la tarea mediante tokens de control en la entrada.

Los detalles concretos del entrenamiento (número de tokens de audio, composición exacta del dataset, uso de RLHF/DPO o técnicas de alineación) no están disponibles en la información proporcionada. La model card del modelo base sí indica que cubre 25 idiomas europeos y que soporta traducción inglés→24 idiomas y 24 idiomas→inglés. La conversión a GGUF no modifica los pesos más allá de la cuantización; el port se validó contra la implementación de referencia de NeMo en el commit `db53eda` de transcribe.cpp el 8 de mayo de 2026.

## Capacidades

- Transcripción automática del habla (ASR) en 25 idiomas europeos: búlgaro, croata, checo, danés, neerlandés, inglés, estonio, finés, francés, alemán, griego, húngaro, italiano, letón, lituano, maltés, polaco, portugués, rumano, eslovaco, esloveno, español, sueco, ruso y ucraniano.
- Traducción de voz (AST) desde inglés hacia los otros 24 idiomas soportados.
- Traducción de voz (AST) desde los otros 24 idiomas hacia inglés.
- Procesamiento de audio de 16 kHz mono en formato WAV; la entrada debe convertirse previamente si no cumple estos requisitos (por ejemplo, con `ffmpeg -i input.mp3 -ar 16000 -ac 1 output.wav`).
- Inferencia offline, sin conexión a servicios externos.
- No soporta streaming (`streaming: false` en los metadatos de transcribe.cpp).
- No expone marcas de tiempo a nivel de palabra o segmento en este port (`timestamps: none`).
- No incluye detección automática de idioma (`lang_detect: false`); el idioma debe especificarse.
- No es un modelo de texto: no soporta tool calling, function calling ni razonamiento multi-paso en el sentido de los LLM.

## Casos de uso

- Transcripción de reuniones y entrevistas multilingües: el modelo puede procesar grabaciones de 16 kHz mono y generar transcripciones en cualquiera de los 25 idiomas soportados. Es adecuado para equipos distribuidos en Europa que necesiten actas en varios idiomas sin depender de servicios en la nube.
- Generación de subtítulos para vídeo: a partir de la pista de audio extraída y convertida a 16 kHz mono, el modelo produce el texto para subtitulado. La ausencia de timestamps en este port obliga a alinear los subtítulos con herramientas externas (por ejemplo, forced alignment), pero la calidad de transcripción en inglés (WER 1,91 % en LibriSpeech test-clean con Q4_K_M) lo hace viable para contenido en ese idioma.
- Traducción de voz para atención al cliente: el modelo permite transcribir una llamada en, por ejemplo, alemán y traducirla al inglés (o viceversa) en una sola pasada, lo que simplifica pipelines de soporte multilingüe sin encadenar ASR y traducción de texto.
- Investigación en lingüística computacional: la disponibilidad de cuantizaciones ligeras (Q4_K_M de 735 MB) permite ejecutar experimentos de ASR en portátiles sin GPU, facilitando la reproducibilidad y la experimentación con corpus en idiomas menos representados como el maltés, el esloveno o el estonio.
- Integración en aplicaciones de escritorio o móviles: el runtime transcribe.cpp y los ficheros GGUF de menos de 1 GB permiten empaquetar transcripción offline en aplicaciones nativas, sin necesidad de Python ni de CUDA, con soporte para CPU, Metal y Vulkan.
- Procesamiento por lotes de archivos de audio en servidores sin GPU: los datos de rendimiento indican un RTF de 25,08 en CPU en un Apple M4 Max y de 8,32 en un Ryzen 4750U, lo que permite procesar horas de audio en minutos con hardware de consumo.
- Archivado y búsqueda de contenido audiovisual: transcripción masiva de un archivo de audio para indexación y búsqueda textual, con la ventaja de que el modelo cubre 25 idiomas y evita el envío de datos sensibles a terceros.

## Benchmarks y rendimiento

Resultados de WER en LibriSpeech test-clean (2.620 enunciados, batch size 1, decodificación greedy, sin LM externo):

| Cuantizacion | Tamano | WER LibriSpeech test-clean |
|---|---:|---:|
| F32 | 3,92 GB | 1,92 % |
| F16 | 1,97 GB | 1,92 % |
| Q8_0 | 1,14 GB | 1,91 % |
| Q6_K | 932 MB | 1,94 % |
| Q5_K_M | 837 MB | 1,93 % |
| Q4_K_M | 735 MB | 1,91 % |

El dato autoinformado por NVIDIA en la model card del modelo base es 2,18 %; el port en F32 obtiene 1,92 % (Δ −0,26 pp), atribuido a diferencias de scoring.

Resultados de WER en FLEURS con cuantización Q8_0 (por idioma):

| Idioma | WER Q8_0 |
|---|---:|
| bg | 9,22 % |
| cs | 8,56 % |
| da | 11,34 % |
| de | 4,46 % |
| el | 26,02 % |
| en | 4,47 % |
| es | 3,10 % |
| et | 12,72 % |
| fi | 8,86 % |
| fr | 5,09 % |
| hr | 8,40 % |
| hu | 13,06 % |
| it | 3,10 % |
| lt | 13,45 % |
| lv | 10,41 % |
| mt | 19,75 % |
| nl | 6,28 % |
| pl | 6,88 % |
| pt | 4,50 % |
| ro | 6,87 % |
| ru | 7,83 % |
| sk | 6,84 % |
| sl | 12,76 % |
| sv | 9,74 % |
| uk | 10,58 % |

Rendimiento en tiempo real (RTF, real-time factor) con Q8_0:

| Plataforma | Backend | RTF |
|---|---|---:|
| Apple M4 Max | CPU | 25,08 |
| Apple M4 Max | Metal | 98,25 |
| AMD Ryzen 4750U | CPU | 8,32 |
| AMD Ryzen 4750U | Vulkan | 14,13 |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita en la información proporcionada. Como referencia, el fichero Q4_K_M ocupa 735 MB y el F32 3,92 GB, por lo que la memoria necesaria para cargar los pesos es del orden del tamaño del fichero GGUF más el overhead del runtime.
- GPU recomendadas: no se especifican modelos concretos. El runtime transcribe.cpp soporta backend Metal (Apple Silicon) y Vulkan (GPUs compatibles). No hay datos publicados para CUDA en esta información.
- Cabe en GPU de consumo: sí, con las cuantizaciones Q4_K_M, Q5_K_M, Q6_K y Q8_0 (735 MB a 1,14 GB). Las versiones F16 y F32 (1,97 GB y 3,92 GB) también caben en GPUs de consumo con al menos 4 GB de VRAM.
- Opciones de despliegue: transcribe.cpp (runtime principal, con CLI `transcribe-cli`); se compila desde fuente con CMake (`cmake -B build && cmake --build build`). No se mencionan vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: RTF de 25,08 en CPU (M4 Max) y 98,25 con Metal; RTF de 8,32 en CPU (Ryzen 4750U) y 14,13 con Vulkan. Un RTF alto indica mayor velocidad de procesamiento respecto al tiempo real del audio.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---:|---|---|---|---|
| avericaai/canary-1b-v2-gguf | 980 M | no disponible | 25 | CC-BY-4.0 | GGUF | Conversión de canary-1b-v2 para transcribe.cpp; ASR + AST |
| agentory/canary-1b-v2-GGUF | no disponible | no disponible | 25 (heredados) | CC-BY-4.0 (heredada) | GGUF | Otra conversión del mismo modelo base; cuantizaciones Q8_0 y Q5_0 mencionadas |
| cstr/parakeet-tdt-0.6b-v3-GGUF | 600 M (aprox.) | no disponible | no disponible | no disponible | GGUF | Misma familia FastConformer pero con decodificador TDT; solo ASR, sin traducción |
| nvidia/canary-1b-v2 (original) | 980 M | no disponible | 25 | CC-BY-4.0 | safetensors | Modelo base; requiere stack NeMo |

## Limitaciones y advertencias

- El modelo no es de streaming: requiere el audio completo (o segmentos) como entrada, lo que lo hace inadecuado para transcripción en tiempo real con latencia baja.
- No expone marcas de tiempo a nivel de palabra o segmento en este port, lo que limita su uso directo en subtitulado sin un paso adicional de alineación.
- No incluye detección automática de idioma: el idioma debe especificarse explícitamente, lo que añade complejidad en escenarios con audio multilingüe mezclado.
- El rendimiento es muy variable según el idioma: el WER en FLEURS Q8_0 va del 3,10 % en español e italiano al 26,02 % en griego y 19,75 % en maltés, lo que refleja un soporte desigual entre idiomas.
- Riesgo de alucinación: como todo modelo generativo de secuencias, puede producir texto plausible pero incorrecto en segmentos con ruido, música o habla solapada; no se han publicado análisis específicos de este riesgo en la información disponible.
- Sesgos conocidos: no se documentan sesgos específicos en la información proporcionada; al ser un modelo entrenado por NVIDIA sobre datos no detallados, se aplican las precauciones habituales sobre representación desigual de variedades dialectales y acentos.
- Licencia CC-BY-4.0: permite uso comercial con atribución. Es necesario conservar el aviso de licencia y el fichero NOTICE que documenta la derivación del modelo original.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado el mismo día (2026-11-08), por lo que no hay evidencia de uso en producción ni validación independiente por parte de la comunidad.
- La validación se realizó contra NeMo en un commit concreto (`db53eda`) y una fecha concreta; cambios posteriores en transcribe.cpp podrían alterar el comportamiento.

## Enlaces

- Repositorio Hugging Face de esta conversión: https://huggingface.co/avericaai/canary-1b-v2-gguf
- Modelo base original: https://huggingface.co/nvidia/canary-1b-v2
- Commit del modelo base utilizado: https://huggingface.co/nvidia/canary-1b-v2/commit/87bc526
- Runtime transcribe.cpp: https://github.com/handy-computer/transcribe.cpp
- Commit de validación de transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/tree/db53eda
- Documentación del modelo en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/blob/main/docs/models/canary-1b-v2.md
- Conversión alternativa del mismo modelo: https://huggingface.co/agentory/canary-1b-v2-GGUF
- Conversión relacionada (Parakeet TDT): https://huggingface.co/cstr/parakeet-tdt-0.6b-v3-GGUF
- Licencia del repositorio: https://huggingface.co/handy-computer/canary-1b-v2-gguf/blob/main/LICENSE
- NOTICE de derivación: https://huggingface.co/handy-computer/canary-1b-v2-gguf/blob/main/NOTICE
