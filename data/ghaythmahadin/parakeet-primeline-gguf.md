# GhaythMahadin/parakeet-primeline-gguf

## Resumen

parakeet-primeline-gguf es la conversión a formato GGUF del modelo primeline/parakeet-primeline, un sistema de reconocimiento automático del habla (ASR) de 627 millones de parámetros desarrollado por primeLine a partir de NVIDIA parakeet-tdt-0.6b-v3. El modelo emplea una arquitectura FastConformer como codificador y un decodificador transducer TDT/RNNT, y está afinado específicamente para transcripción de alta precisión en alemán, manteniendo cobertura multilingüe en 25 idiomas europeos.

Este repositorio, publicado por GhaythMahadin, no contiene un modelo nuevo sino una cuantización del checkpoint original para su uso con transcribe.cpp, una implementación en C++ de inferencia ASR. Incluye seis niveles de cuantización (F32, F16, Q8_0, Q6_K, Q5_K_M y Q4_K_M) con tamaños que van de 2,51 GB a 485 MB, lo que permite desplegar el modelo en hardware modesto, incluidas CPU y GPU de consumo, con una degradación de precisión mínima.

La relevancia de esta ficha radica en que ofrece una vía práctica para integrar un ASR de calidad estado del arte en alemán (y multilingüe) en entornos locales o de borde, con licencia CC-BY-4.0, salida con puntuación y mayúsculas, marcas de tiempo a nivel de token y detección de idioma, todo ello sin dependencia de infraestructura en la nube.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer (codificador) + TDT/RNNT (decodificador transducer) |
| Parametros totales | 627.052.166 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (soporta audio de varias horas mediante atención local) |
| Tipos de cuantizacion | F32, F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M |
| Idiomas soportados | 25: de, bg, hr, cs, da, nl, en, et, fi, fr, el, hu, it, lv, lt, mt, pl, pt, ro, ru, sk, sl, es, sv, uk |
| Licencia | CC-BY-4.0 |
| Formato de pesos | GGUF (transcribe.cpp) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura de NVIDIA parakeet-tdt-0.6b-v3: un codificador FastConformer, variante eficiente del Conformer con atención por bloques, y un decodificador Token-and-Duration Transducer (TDT), que predice conjuntamente tokens y duraciones para acelerar la decodificación frente a un transducer RNNT estándar. La entrada es audio WAV mono a 16 kHz y la salida es una transcripción con puntuación, mayúsculas y marcas de tiempo opcionales a nivel de token.

El checkpoint original fue afinado por primeLine sobre el modelo base de NVIDIA para mejorar la precisión en alemán, con resultados destacados en conjuntos como Tuda-De, Multilingual LibriSpeech y Common Voice 19.0. No se dispone en la información proporcionada del número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO. La conversión a GGUF se realizó desde el commit 3f1a9bc del modelo original y se validó numéricamente contra la referencia NeMo en el commit 856d7c1 de transcribe.cpp.

## Capacidades

- Transcripción de voz a texto (ASR) con salida puntuada y con mayúsculas.
- Detección automática de idioma (lang_detect: true).
- Marcas de tiempo a nivel de token (timestamps: token).
- Soporte multilingüe en 25 idiomas europeos, con especial énfasis en alemán.
- Transcripción de audio largo (hasta varias horas) gracias a mecanismos de atención local.
- No soporta streaming (streaming: false).
- No soporta traducción (translate: false).
- No dispone de tool calling, function calling ni capacidades de agente.
- No dispone de modo thinking, visión ni audio de salida.

## Casos de uso

- Transcripción de reuniones y entrevistas en alemán: el modelo genera actas con puntuación y marcas de tiempo por token, adecuadas para alinear la transcripción con el audio y para búsqueda posterior.
- Subtitulado automático de vídeo: las marcas de tiempo a nivel de token permiten generar subtítulos sincronizados en alemán y otros idiomas europeos sin necesidad de un alineador externo.
- Archivado y búsqueda de audio corporativo: transcripción por lotes de grabaciones largas (llamadas, formaciones internas) para indexación textual, aprovechando la capacidad de procesar audio de varias horas.
- Asistentes de voz locales y de borde: con cuantizaciones Q4_K_M (485 MB) o Q5_K_M (549 MB), el modelo cabe en dispositivos con poca memoria y puede ejecutarse en CPU o GPU integrada sin conexión a la nube.
- Investigación lingüística y creación de corpus: generación de transcripciones de material oral en múltiples idiomas europeos con detección automática de idioma, útil para anotación semiautomática de corpus.
- Accesibilidad: conversión de discursos y clases grabadas en texto para personas con discapacidad auditiva, con despliegue local que evita enviar audio sensible a servicios externos.
- Verificación y control de calidad de transcripciones humanas: comparación de transcripciones automáticas con referencias para detectar discrepancias en flujos de trabajo de subtitulado profesional.

## Benchmarks y rendimiento

Resultados de WER sobre el split de test de FLEURS en alemán (862 enunciados, decodificación greedy sin LM externo):

| Cuantizacion | Tamano | WER FLEURS de |
|---|---:|---:|
| F32 | 2,51 GB | 6,00 % |
| F16 | 1,26 GB | 6,00 % |
| Q8_0 | 740 MB | 6,00 % |
| Q6_K | 610 MB | 5,96 % |
| Q5_K_M | 549 MB | 5,99 % |
| Q4_K_M | 485 MB | 5,98 % |

Métricas de velocidad (RTF, factor de tiempo real; menor es mejor):

| Plataforma | Backend | RTF |
|---|---|---:|
| Apple M4 Max | Metal | 151 |
| Apple M4 Max | CPU | 28 |
| AMD Ryzen 4750U | Vulkan | 12,5 |
| AMD Ryzen 4750U | CPU | 7,5 |

Nota ortográfica: el checkpoint emplea formas suizas con `ss` en lugar de `ß` por limitación del tokenizador SentencePiece de la familia v3 (4 piezas con `ß` frente a 58 con `ss`). Al normalizar `ß`→`ss` en ambos lados, el WER del F32 baja a 4,94 % y el de la referencia NeMo a 4,92 %.

No se han publicado en la información disponible resultados de benchmarks comparativos del modelo original frente a Whisper u otros ASR en las tablas reproducidas (la tabla de rendimiento del modelo base aparece truncada).

## Requisitos de hardware

- VRAM estimada: aproximadamente 0,5 GB para Q4_K_M, 0,6 GB para Q5_K_M, 0,75 GB para Q8_0 y 1,3 GB para F16 (los pesos GGUF ocupan prácticamente toda la memoria; el consumo adicional de activaciones es reducido).
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM libre; se ha validado en Apple M4 Max con Metal y en AMD Ryzen 4750U con Vulkan.
- Cabe en GPU de consumo: sí, en tarjetas con 2 GB o más (GTX 1050 Ti, RTX 3050, RTX 4060, etc.) y en GPU integradas con soporte Vulkan o Metal.
- Opciones de despliegue: transcribe.cpp (CLI `transcribe-cli`), compilado desde fuente con CMake; no se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: RTF de 151 en M4 Max con Metal, 28 en M4 Max con CPU, 12,5 en Ryzen 4750U con Vulkan y 7,5 en Ryzen 4750U con CPU. Un RTF de 151 implica procesar 151 segundos de audio por segundo de cómputo; un RTF de 7,5 implica 7,5 segundos de audio por segundo de cómputo.
- Requisito de entrada: audio WAV mono a 16 kHz; para otros formatos hay que convertir previamente con ffmpeg.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---:|---|---|---|---|
| parakeet-primeline (este) | 627 M | audio de varias horas | 25 europeos | CC-BY-4.0 | GGUF |
| NVIDIA parakeet-tdt-0.6b-v3 | 600 M aprox. | no disponible | multilingüe europeo | no disponible en la información | NeMo |
| Whisper large-v3 | 1.550 M | 30 s por ventana | 99 | MIT | safetensors, GGUF, etc. |

El modelo base de NVIDIA comparte arquitectura y tamaño con este checkpoint, pero primeline-parakeet está afinado para alemán y reporta mejores WER en Tuda-De, Multilingual LibriSpeech y Common Voice 19.0 según la model card upstream. Frente a Whisper large-v3, este modelo es aproximadamente 2,5 veces más pequeño, no está limitado a ventanas de 30 segundos y ofrece marcas de tiempo a nivel de token, aunque su cobertura idiomática es menor (25 idiomas frente a 99). No se dispone de cifras comparativas completas de WER entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- El modelo está optimizado para alemán; el rendimiento en los otros 24 idiomas puede ser inferior y no se documentan WER por idioma.
- No soporta streaming: requiere audio completo o segmentado manualmente antes de la inferencia.
- No realiza traducción: solo transcribe en el idioma detectado.
- Ortografía suiza: usa `ss` en lugar de `ß` de forma sistemática, lo que penaliza aproximadamente 1,05 puntos de WER frente a referencias que usan `ß`.
- Riesgo de alucinación en audio con ruido, solapamiento de hablantes o dominios muy alejados del entrenamiento; no se documentan métricas de robustez fuera de los conjuntos citados.
- No se dispone de información sobre sesgos demográficos, acentos o variedades dialectales del alemán.
- Licencia CC-BY-4.0: permite uso comercial con atribución; es necesario citar a primeLine y NVIDIA según los términos del modelo base.
- La conversión GGUF está vinculada a transcribe.cpp en un commit concreto (856d7c1); cambios en la herramienta pueden requerir reconversión o validación adicional.
- No se dispone de información sobre el dataset de entrenamiento ni sobre posibles datos sensibles incluidos en él.

## Enlaces

- Repositorio GGUF: https://huggingface.co/GhaythMahadin/parakeet-primeline-gguf
- Modelo base: https://huggingface.co/primeline/parakeet-primeline
- Commit del modelo base usado en la conversión: https://huggingface.co/primeline/parakeet-primeline/commit/3f1a9bc
- Modelo original de NVIDIA: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3
- transcribe.cpp: https://github.com/handy-computer/transcribe.cpp
- Commit validado de transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/tree/856d7c1
- Documentación del modelo en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/blob/main/docs/models/parakeet-primeline.md
