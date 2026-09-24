# ldov/Qwen3-ASR-1.7B-gguf

## Resumen

Qwen3-ASR-1.7B-gguf es una conversión a formato GGUF del modelo de reconocimiento automático de voz Qwen/Qwen3-ASR-1.7B, publicada por el usuario ldov para su uso con el motor transcribe.cpp. Se trata de un modelo de speech-to-text offline y multilingüe construido sobre una arquitectura audio-LLM: un encoder de audio bidireccional que alimenta un decoder causal de la familia Qwen3 mediante inyección de tokens de audio. El modelo base lo desarrolla el equipo Qwen (Alibaba), y esta conversión concreta está fijada al commit upstream 7278e1e del 19 de abril de 2026, validada contra la referencia qwen_asr 0.0.6.

El problema que resuelve es la transcripción de audio a texto en 30 idiomas con detección automática de idioma, sin depender de APIs en la nube ni de conectividad. Frente a la variante de 0,6B de la misma familia, esta versión de 1,7B (2.038.078.608 parámetros reales contando el encoder de audio) ofrece mayor margen de cuantización: según la model card, BF16, F16, Q8_0, Q6_K y Q5_K_M quedan dentro del mismo intervalo de confianza bootstrap en LibriSpeech test-clean, y Q4_K_M solo degrada unas 0,2 décimas de WER.

Es relevante ahora porque permite ejecutar un ASR multilingüe de calidad cercana a modelos propietarios en hardware modesto, con el quant Q4_K_M ocupando 1,32 GB y Q8_0 2,19 GB, y con backends de CPU, Metal y Vulkan. El repo acumula 0 descargas y 0 likes en el momento de la consulta, por lo que debe considerarse una conversión reciente y poco rodada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Audio-LLM: encoder de audio bidireccional (d_model=1024, 16 cabezas) + LM causal Qwen3 (hidden_size=2048, intermediate_size=6144) con inyección de tokens de audio |
| Parametros totales | 2.038.078.608 (~2,04 B, incluye encoder y decoder) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16, F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M |
| Idiomas soportados | 30 idiomas en las etiquetas de esta conversión: zh, en, yue, ar, de, fr, es, pt, id, it, ko, ru, th, vi, ja, tr, hi, ms, nl, sv, da, fi, pl, cs, fil, fa, el, ro, hu, mk. La familia base declara 52 idiomas y dialectos |
| Licencia | Apache-2.0 (heredada del modelo base) |
| Formato de pesos | GGUF (exclusivamente, para transcribe.cpp) |
| Entrada de audio | WAV mono a 16 kHz |
| Detección de idioma | Sí (automática) |
| Streaming | No |
| Traducción | No |
| Timestamps | No disponibles |
| Tamaño del repo | 14,9 GB (incluye todas las cuantizaciones) |

## Arquitectura y entrenamiento

La arquitectura es un audio-LLM híbrido. Un encoder de audio bidireccional procesa la señal acústica y sus representaciones se inyectan como tokens en un decoder causal Qwen3, que genera la transcripción. El encoder de la variante 1,7B tiene d_model=1024 con 16 cabezas de atención, y el LM tiene hidden_size=2048 e intermediate_size=6144. Es la misma topología que la variante de 0,6B, pero con dimensiones mayores, lo que se traduce en más margen frente a la cuantización agresiva.

En cuanto a los datos de entrenamiento, la model card original de Qwen3-ASR menciona el uso de datos de habla a gran escala y la capacidad de comprensión de audio del modelo fundacional Qwen3-Omni, pero no se detalla en la información disponible el número de tokens, la composición exacta del dataset ni si hubo etapas de RLHF o DPO. Tampoco se documentan innovaciones como decodificación especulativa o atención lineal en los materiales consultados.

La conversión a GGUF no modifica la arquitectura, solo los pesos. El autor reporta validación numérica contra la implementación de referencia qwen_asr 0.0.6 en el commit 3f61df7 de transcribe.cpp (20 de abril de 2026). Las descargas de la model card apuntan al repositorio handy-computer/Qwen3-ASR-1.7B-gguf, no al repositorio de ldov donde está alojada esta ficha.

## Capacidades

- Transcripción de voz a texto offline en 30 idiomas, incluidos chino, inglés, cantonés, árabe, alemán, francés, español, portugués, indonesio, italiano, coreano, ruso, tailandés, vietnamita, japonés, turco, hindi, malayo, neerlandés, sueco, danés, finés, polaco, checo, filipino, persa, griego, rumano, húngaro y macedonio.
- Detección automática del idioma del audio entre los 30 soportados, emitiendo la transcripción en ese mismo idioma.
- Procesamiento por lotes a nivel de utterance con tamaño de lote 1 en las evaluaciones publicadas.
- Ejecución en CPU, Metal y Vulkan.
- No soporta streaming: el audio debe estar completo antes de transcribir.
- No realiza traducción: transcribe en el idioma detectado, sin traducir a otro.
- No genera timestamps ni alineación temporal a nivel de palabra o segmento.
- No acepta pistas explícitas de idioma para forzar una lengua concreta.
- No se documentan capacidades de tool calling, function calling, agentes ni razonamiento multi-paso, ya que es un modelo especializado en ASR y no un LLM conversacional de propósito general.
- No se documentan capacidades de visión ni de procesamiento de audio más allá de la transcripción (por ejemplo, diarización o clasificación de eventos sonoros).

## Casos de uso

- Transcripción de reuniones y notas de voz corporativas: el modelo convierte grabaciones en WAV mono de 16 kHz en texto, y su naturaleza offline evita enviar audio confidencial a servicios externos. Es adecuado porque no requiere GPU dedicada y puede ejecutarse en un portátil con el quant Q5_K_M de 1,52 GB.
- Archivado y búsqueda en fondos documentales sonoros: digitalización de entrevistas, programas de radio o podcasts multilingües para generar índices de texto buscables. La detección automática de idioma permite procesar lotes heterogéneos sin etiquetar previamente cada archivo.
- Atención al cliente y control de calidad: transcripción de llamadas grabadas para análisis posterior de contenido, cumplimiento normativo o detección de patrones. El WER reportado en FLEURS para español es del 3,31 % en Q8_0, suficiente para revisiones humanas asistidas.
- Documentación clínica y dictado profesional: conversión de dictados a texto con procesamiento local para cumplir requisitos de protección de datos. El modelo no traduce ni interpreta, solo transcribe, lo que simplifica la validación frente a un profesional.
- Subtitulado offline de contenido audiovisual: generación de guiones de subtítulos en 30 idiomas para catálogos de vídeo. Limitación importante: no produce timestamps, por lo que el alineado temporal debe resolverse con otra herramienta.
- Investigación lingüística y construcción de corpus: creación de transcripciones de referencia para estudios fonéticos, sociolingüísticos o de variación dialectal. Los resultados de FLEURS por idioma permiten estimar de antemano la calidad esperada en cada lengua (por ejemplo, 2,68 % de WER en italiano frente a 32,84 % en húngaro).
- Preprocesado para pipelines RAG sobre audio: transcripción de repositorios de audio antes de indexarlos en un sistema de recuperación aumentada. El coste por hora de audio es bajo gracias a los RTF reportados en CPU y GPU.
- Despliegue en entornos aislados o edge: transcripción en equipos sin conexión a internet ni acceso a APIs externas, con formatos de pesos pequeños (1,32 GB en Q4_K_M) que caben en dispositivos con recursos limitados.

## Benchmarks y rendimiento

WER en LibriSpeech test-clean (2.620 utterances, batch size 1, sin timestamps), según la model card:

| Cuantizacion | Tamano | WER (LibriSpeech test-clean) |
|---|---:|---:|
| BF16 | 4,08 GB | 1,62 % |
| F16 | 4,09 GB | 1,62 % |
| Q8_0 | 2,19 GB | 1,62 % |
| Q6_K | 1,69 GB | 1,65 % |
| Q5_K_M | 1,52 GB | 1,65 % |
| Q4_K_M | 1,32 GB | 1,81 % |

WER y CER en FLEURS con cuantización Q8_0 (idiomas con escritura latina, cirílica, árabe o hebrea medidas como WER; chino, cantonés, japonés, coreano y tailandés como CER):

| Idioma | Metrica | Valor (Q8_0) |
|---|---|---:|
| Italiano | WER | 2,68 % |
| Ingles | WER | 3,23 % |
| Espanol | WER | 3,31 % |
| Portugues | WER | 4,37 % |
| Aleman | WER | 4,25 % |
| Frances | WER | 4,52 % |
| Coreano | CER | 4,60 % |
| Indonesia | WER | 5,37 % |
| Japones | CER | 5,29 % |
| Cantonés | CER | 6,13 % |
| Vietnamita | WER | 6,15 % |
| Ruso | WER | 6,25 % |
| Tailandes | CER | 6,89 % |
| Chino | CER | 7,14 % |
| Neerlandes | WER | 7,43 % |
| Hindi | WER | 7,84 % |
| Turco | WER | 9,46 % |
| Malayo | WER | 10,42 % |
| Polaco | WER | 12,50 % |
| Arabe | WER | 14,91 % |
| Macedonio | WER | 18,22 % |
| Sueco | WER | 19,68 % |
| Rumano | WER | 20,46 % |
| Danes | WER | 21,23 % |
| Checo | WER | 22,97 % |
| Filipino | WER | 24,29 % |
| Fines | WER | 25,48 % |
| Persa | WER | 28,29 % |
| Griego | WER | 29,22 % |
| Hungaro | WER | 32,84 % |

Factor de tiempo real (RTF) reportado por el autor:

| Plataforma | Backend | RTF |
|---|---|---:|
| Apple M4 Max | cpu | 9,59 |
| Apple M4 Max | metal | 41,08 |
| AMD Ryzen 4750U | cpu | 2,47 |
| AMD Ryzen 4750U | vulkan | 4,08 |

La model card no especifica la unidad exacta del RTF ni las condiciones de medida (longitud de audio, lote), por lo que los valores deben tomarse como referencia relativa entre backends, no como cifras absolutas reproducibles. No se han publicado resultados de benchmarks comparativos con otros modelos de ASR en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos van de 1,32 GB (Q4_K_M) a 4,09 GB (F16). Sumando el overhead de contexto y buffers de audio, un presupuesto práctico es de 2 GB para Q4_K_M, 3 GB para Q8_0 y 5-6 GB para BF16/F16.
- Cabe en cualquier GPU de consumo con 4 GB o más de VRAM; con Q4_K_M o Q5_K_M es viable en GPUs de 2-4 GB e incluso en gráficas integradas con memoria compartida.
- GPU recomendadas: cualquier RTX 3060/4060 o superior para las cuantizaciones altas; para BF16/F16 conviene una GPU de 8 GB o más. En el lado profesional, A100 o H100 funcionan pero están sobredimensionadas para 2 B de parámetros.
- Ejecución en CPU viable: el autor reporta RTF de 2,47 en un Ryzen 4750U (CPU) y 4,08 con Vulkan, lo que indica transcripción más rápida que el tiempo real en un procesador de portátil.
- Aceleración en Apple Silicon: RTF de 9,59 en CPU y 41,08 con Metal en un M4 Max.
- Opciones de despliegue: transcribe.cpp exclusivamente, compilado desde fuente con CMake (`cmake -B build && cmake --build build`) y ejecutado con el binario `transcribe-cli -m modelo.gguf input.wav`. Los backends documentados son CPU, Metal y Vulkan.
- No consta soporte para vLLM, llama.cpp, Ollama, TGI ni Transformers en la información disponible; el GGUF está generado específicamente para transcribe.cpp.
- Requisito de entrada: audio en WAV mono a 16 kHz. Para otros formatos hay que preconverter con `ffmpeg -i input.mp3 -ar 16000 -ac 1 output.wav`.
- Latencia y throughput: no se publican cifras en segundos por minuto de audio ni en tokens por segundo, solo los RTF de la tabla anterior.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Streaming | Traduccion | Timestamps | WER LibriSpeech test-clean |
|---|---|---|---|---|---|---|---|---|---|
| Qwen3-ASR-1.7B (esta conversion GGUF) | ~2,04 B | no disponible | 30 en esta conversion (52 en la familia base) | Apache-2.0 | GGUF | No | No | No | 1,62 % (Q8_0) |
| Qwen3-ASR-0.6B | ~0,6 B (segun nomenclatura) | no disponible | no disponible | no disponible en esta informacion | no disponible | No | No | No | no disponible |
| Whisper large-v3 | no disponible en esta informacion | no disponible | no disponible | no disponible en esta informacion | no disponible | No | Si (tarea de traduccion) | Si | no disponible |
| Whisper large-v3-turbo | no disponible en esta informacion | no disponible | no disponible | no disponible en esta informacion | no disponible | No | Si | Si | no disponible |

La model card afirma que la versión de 1,7B alcanza rendimiento de estado del arte entre los modelos ASR de código abierto y es competitiva con las APIs comerciales propietarias más potentes, pero no incluye la tabla comparativa concreta en la información proporcionada. Para el resto de alternativas no se dispone de datos verificables en los materiales consultados.

## Limitaciones y advertencias

- No admite streaming: el audio debe estar completo antes de iniciar la transcripción. Para casos de uso en tiempo real esta conversión no es válida.
- No genera timestamps, ni a nivel de palabra ni de segmento. Cualquier aplicación de subtitulado necesita un alineador externo.
- No traduce: transcribe en el idioma detectado. No sirve para tareas de traducción automática de voz.
- No acepta pistas explícitas de idioma, según la model card. La detección es siempre automática, lo que puede degradar resultados en audios muy cortos, con mezcla de lenguas o con acentos marcados.
- Solo acepta WAV mono a 16 kHz. Cualquier otro formato requiere preprocesado con ffmpeg, lo que añade una dependencia al pipeline.
- Rendimiento muy desigual por idioma: el WER en FLEURS (Q8_0) varía entre el 2,68 % del italiano y el 32,84 % del húngaro. Los idiomas con peor resultado reportado son húngaro (32,84 %), griego (29,22 %), persa (28,29 %), finés (25,48 %), filipino (24,29 %), checo (22,97 %), danés (21,23 %), rumano (20,46 %) y sueco (19,68 %). Para producción en esos idiomas conviene validar con datos propios.
- La model card advierte de que la cifra de LibriSpeech caracteriza únicamente el caso del inglés y no representa el rendimiento multilingüe.
- Riesgo de alucinación y de transcripciones plausibles pero incorrectas en audio con ruido, solapamiento de voces, música de fondo o terminología muy específica. No se documentan tasas de alucinación.
- Sesgos: no se documenta ningún análisis de sesgo por acento, variedad dialectal, edad o género. Dado el desequilibrio de WER entre idiomas, es razonable esperar un comportamiento desigual entre variedades de una misma lengua, pero no hay datos publicados al respecto.
- Licencia Apache-2.0, heredada del modelo base, que permite uso comercial sin restricciones adicionales conocidas. Aun así, conviene revisar la model card upstream por si hubiera términos complementarios.
- Madurez de la publicación: el repositorio de esta conversión registra 0 descargas y 0 likes, y las URLs de descarga de la model card apuntan al repositorio handy-computer/Qwen3-ASR-1.7B-gguf en lugar del repositorio de ldov. Verificar la procedencia de los ficheros antes de desplegarlos en producción.
- Ecosistema limitado: depende exclusivamente de transcribe.cpp, un proyecto que hay que compilar desde fuente. No hay integración documentada con frameworks de inferencia habituales.
- Los valores de RTF publicados no especifican condiciones de medida ni unidad exacta, por lo que no deben usarse como garantía de rendimiento en un entorno distinto.
- El repo tiene 14,9 GB porque incluye todas las cuantizaciones; descargar solo el fichero GGUF necesario.

## Enlaces

- Repositorio de esta conversión: https://huggingface.co/ldov/Qwen3-ASR-1.7B-gguf
- Modelo base: https://huggingface.co/Qwen/Qwen3-ASR-1.7B
- Commit upstream de referencia: https://huggingface.co/Qwen/Qwen3-ASR-1.7B/commit/7278e1e
- Repositorio alternativo con los ficheros GGUF referenciados en la model card: https://huggingface.co/handy-computer/Qwen3-ASR-1.7B-gguf
- Motor de inferencia transcribe.cpp: https://github.com/handy-computer/transcribe.cpp
- Commit de transcribe.cpp usado para la validación: https://github.com/handy-computer/transcribe.cpp/tree/3f61df7
- Documentación del modelo en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/blob/main/docs/models/qwen3-asr-1.7b.md
- Paper referenciado en las etiquetas: https://arxiv.org/abs/2601.21337
- Descarga directa BF16: https://huggingface.co/handy-computer/Qwen3-ASR-1.7B-gguf/resolve/main/Qwen3-ASR-1.7B-BF16.gguf
- Descarga directa F16: https://huggingface.co/handy-computer/Qwen3-ASR-1.7B-gguf/resolve/main/Qwen3-ASR-1.7B-F16.gguf
- Descarga directa Q8_0: https://huggingface.co/handy-computer/Qwen3-ASR-1.7B-gguf/resolve/main/Qwen3-ASR-1.7B-Q8_0.gguf
- Descarga directa Q6_K: https://huggingface.co/handy-computer/Qwen3-ASR-1.7B-gguf/resolve/main/Qwen3-ASR-1.7B-Q6_K.gguf
- Descarga directa Q5_K_M: https://huggingface.co/handy-computer/Qwen3-ASR-1.7B-gguf/resolve/main/Qwen3-ASR-1.7B-Q5_K_M.gguf
- Descarga directa Q4_K_M: https://huggingface.co/handy-computer/Qwen3-ASR-1.7B-gguf/resolve/main/Qwen3-ASR-1.7B-Q4_K_M.gguf
