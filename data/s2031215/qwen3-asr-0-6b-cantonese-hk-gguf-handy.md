# s2031215/Qwen3-ASR-0.6B-Cantonese-HK-GGUF-handy

## Resumen

Qwen3-ASR 0.6B Cantonese-HK en formato GGUF para Handy es una conversión del fine-tune de reconocimiento automático del habla (ASR) desarrollado por el usuario joe2643 sobre el modelo base Qwen3-ASR de 0.6B, especializado en cantonés de Hong Kong. Esta variante concreta, publicada por s2031215, no introduce nuevos pesos ni reentrena el modelo: su aportación es empaquetar los pesos BF16 originales en un único archivo GGUF con arquitectura `qwen3_asr`, de modo que el codificador de audio queda fusionado en el mismo fichero y no requiere un `.mmproj` separado.

El problema que resuelve es de interoperabilidad. Las exportaciones GGUF convencionales de este fine-tune (las de llama.cpp) declaran `general.architecture = "qwen3vl"` y dependen de un archivo `.mmproj` externo, algo que Handy, la aplicación de dictado que ejecuta todo a través de `transcribe.cpp`, no puede cargar. Esta conversión, generada con `convert-qwen3_asr.py` y `transcribe-quantize` de transcribe.cpp v0.4.2, produce archivos que Handy reconoce directamente como modelos personalizados.

Con 782.452.240 parámetros reales y un repositorio de 2,1 GB, el modelo se distribuye en tres cuantizaciones (Q8_0, Q6_K y Q4_K_M) y cubre tres idiomas: cantonés (yue), chino mandarín (zh) e inglés (en). Está pensado para transcripción local en escritorio, con licencia Apache 2.0.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Qwen3-ASR (transformer con codificador de audio fusionado), arquitectura GGUF `qwen3_asr` |
| Parámetros totales | 782.452.240 |
| Parámetros activos | no disponible (no es un modelo MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q8_0 (812 MB), Q6_K (659 MB), Q4_K_M (563 MB) |
| Idiomas soportados | yue (cantonés), zh (mandarín), en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF de archivo único (codificador de audio incluido, sin mmproj); pesos originales en BF16 safetensors en el modelo base |
| Tarea | automatic-speech-recognition |
| Motor compatible | transcribe.cpp (Handy), verificado con transcribe-cli 0.4.2 |
| Tensores | 613 |
| Detección de idioma | sí (`stt.capability.lang_detect = true`) |

## Arquitectura y entrenamiento

El modelo es un sistema ASR basado en la familia Qwen3-ASR, con un codificador de audio y un decodificador de lenguaje. En esta conversión GGUF, el codificador de audio se ha fusionado dentro del mismo archivo que el resto de pesos, de manera que la arquitectura declarada en la cabecera es `qwen3_asr` y no `qwen3vl`. El modelo base `joe2643/Qwen3-ASR-0.6B-Cantonese-HK` es un fine-tune del Qwen3-ASR de 0.6B orientado al cantonés de Hong Kong, aunque la información disponible no detalla la composición del dataset de ajuste, el número de tokens de entrenamiento ni si se emplearon técnicas de RLHF o DPO.

La innovación técnica relevante de esta ficha es el propio proceso de conversión: se partió de los pesos BF16 en formato Transformers y se aplicó `scripts/convert-qwen3_asr.py` junto con `transcribe-quantize` de transcribe.cpp v0.4.2. Fue necesario un parche local, ya que el mapa de nombres del conversor solo contemplaba las dos variantes estándar, por lo que se añadió la entrada `qwen3-asr-0.6b-cantonese-hk`. El resultado son archivos GGUF de un solo fichero que el motor de Handy puede cargar sin mmproj.

## Capacidades

- Transcripción de voz a texto en cantonés (yue), mandarín (zh) e inglés (en).
- Detección automática de idioma (`stt.capability.lang_detect = true`), con posibilidad de fijar el idioma manualmente en Handy.
- Conversión de audio a texto conversacional, etiquetada como `conversational` en el repositorio.
- Ejecución local en escritorio mediante transcribe.cpp, sin dependencia de servicios en la nube.
- Carga como modelo personalizado en Handy en macOS, Windows y Linux.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión ni audio generativo; el modelo es exclusivamente ASR.

## Casos de uso

- Dictado por voz en escritorio: el usuario instala el GGUF en la carpeta de modelos de Handy y transcribe en tiempo real sus notas en cantonés o mandarín, con la ventaja de que todo el procesamiento ocurre en local y no se envía audio a terceros.
- Subtitulado de reuniones en Hong Kong: al soportar yue y zh, permite generar transcripciones de conversaciones bilingües cantónes-mandarín, y la detección automática de idioma evita tener que cambiar de configuración entre intervenciones.
- Transcripción de entrevistas y material de campo: para investigadores que graban entrevistas en cantonés, el modelo ofrece una alternativa ligera (563-812 MB) que cabe en un portátil sin GPU dedicada y puede ejecutarse de forma offline.
- Accesibilidad y notas de voz: integración en flujos de trabajo personales para convertir mensajes de voz en texto editable, aprovechando el tamaño reducido del Q4_K_M para equipos con pocos recursos.
- Prototipado de aplicaciones ASR: desarrolladores que quieran evaluar la calidad del fine-tune cantonés antes de integrarlo en un pipeline mayor pueden usar transcribe-cli 0.4.2, el mismo motor que Handy, para validar transcripciones con los clips de referencia publicados.
- Procesamiento de contenido en inglés con acento: la verificación con una cita conocida en inglés sugiere uso para transcripción de discursos o material audiovisual en inglés, aunque el foco principal del fine-tune es el cantonés.
- Archivado y búsqueda de audio: convertir grabaciones históricas en cantonés a texto indexable, con la ventaja de que el formato GGUF de archivo único simplifica el despliegue en entornos sin gestores de modelos complejos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente incluye transcripciones de verificación cualitativa con transcribe-cli 0.4.2:

| Idioma | Clip de prueba | Transcripción verificada |
|---|---|---|
| Cantonés | Frase de prueba | `呢幾個字都表達唔到我想講嘅意思` |
| Mandarín | Frase de prueba | `開放時間早上九點至下午五點` |
| Inglés | Cita de J. F. Kennedy | `And so my fellow Americans, ask not what your country can do for you, ask what you can do for your country.` |

Según el autor, las tres cuantizaciones (Q8_0, Q6_K y Q4_K_M) produjeron transcripciones idénticas en estos clips.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; por el tamaño de los archivos, Q4_K_M (563 MB) y Q6_K (659 MB) deberían caber en GPUs integradas o de gama baja, mientras que Q8_0 (812 MB) requiere algo más de margen.
- GPU recomendadas: no disponible en la información proporcionada; el modelo está diseñado para ejecutarse mediante transcribe.cpp, que puede usar CPU.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU consumer moderna e incluso en CPU, dado el tamaño inferior a 1 GB de los archivos GGUF.
- Opciones de despliegue: Handy (aplicación de escritorio) y transcribe-cli 0.4.2, ambos sobre transcribe.cpp. No se indica compatibilidad con vLLM, llama.cpp, Ollama ni TGI; de hecho, las exportaciones GGUF de llama.cpp con arquitectura `qwen3vl` y mmproj separado no son compatibles con Handy.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Formato | Licencia | Compatibilidad Handy |
|---|---|---|---|---|---|
| s2031215/Qwen3-ASR-0.6B-Cantonese-HK-GGUF-handy | 782.452.240 | yue, zh, en | GGUF archivo único (`qwen3_asr`) | Apache 2.0 | Sí |
| joe2643/Qwen3-ASR-0.6B-Cantonese-HK-GGUF | no disponible | yue, zh, en | GGUF (`qwen3vl` + mmproj) | no disponible | No |
| mradermacher/Qwen3-ASR-0.6B-Cantonese-HK-GGUF | no disponible | yue, zh, en | GGUF (`qwen3vl` + mmproj) | no disponible | No |
| joe2643/Qwen3-ASR-0.6B-Cantonese-HK (base) | no disponible | yue, zh, en | BF16 Transformers | no disponible | No (requiere conversión) |

La diferencia principal frente a las alternativas no es de calidad del modelo, sino de empaquetado: solo esta variante fusiona el codificador de audio en un único GGUF con arquitectura `qwen3_asr`, lo que la hace cargable directamente en Handy.

## Limitaciones y advertencias

- El modelo es un fine-tune de 0.6B orientado al cantonés de Hong Kong; su rendimiento en otros dialectos del chino o en inglés con acentos no está documentado.
- No hay benchmarks publicados, por lo que la calidad real frente a otros sistemas ASR no puede evaluarse con datos objetivos a partir de la información disponible.
- La verificación se limita a tres clips de prueba; no se documenta comportamiento con audio ruidoso, solapamiento de hablantes, música de fondo ni grabaciones de baja calidad.
- Riesgo de alucinación en transcripciones: como todo modelo generativo de ASR, puede producir texto plausible que no corresponde al audio, especialmente en segmentos ininteligibles.
- La licencia Apache 2.0 permite uso comercial, pero conviene revisar las condiciones del modelo base y del fine-tune original, cuya licencia no se detalla en la información proporcionada.
- La compatibilidad está restringida a transcribe.cpp (Handy y transcribe-cli); no se garantiza funcionamiento en llama.cpp, Ollama, vLLM u otros motores.
- El repositorio no registra descargas ni interacciones, y la fecha de creación indicada es 2026-11-17, por lo que se trata de una publicación muy reciente y sin validación comunitaria.
- La longitud de contexto y los detalles de entrenamiento no están disponibles, lo que limita la planificación de despliegues con audio de larga duración.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/s2031215/Qwen3-ASR-0.6B-Cantonese-HK-GGUF-handy
- Modelo base (fine-tune): https://huggingface.co/joe2643/Qwen3-ASR-0.6B-Cantonese-HK
- Exportación GGUF de llama.cpp del fine-tune: https://huggingface.co/joe2643/Qwen3-ASR-0.6B-Cantonese-HK-GGUF
- Exportación GGUF alternativa: https://huggingface.co/mradermacher/Qwen3-ASR-0.6B-Cantonese-HK-GGUF
- Handy (aplicación de dictado): https://github.com/cjpais/handy
