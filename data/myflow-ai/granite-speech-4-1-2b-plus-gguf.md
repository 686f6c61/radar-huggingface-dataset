# myflow-ai/granite-speech-4.1-2b-plus-gguf

## Resumen

Granite-speech-4.1-2b-plus-gguf es la conversión a formato GGUF del modelo IBM Granite-Speech-4.1-2B-Plus, publicada por el usuario myflow-ai para su uso con el runtime transcribe.cpp. No se trata de un modelo nuevo: es una cuantización del checkpoint original de IBM (ibm-granite/granite-speech-4.1-2b-plus), portada desde el commit edd3bf5 y validada numéricamente contra la referencia de Transformers en el commit 275332d de transcribe.cpp. Su interés es práctico: permite ejecutar un sistema de reconocimiento automático del habla (ASR) multilingüe de 2,11 mil millones de parámetros en CPU, Metal o Vulkan, sin depender de GPUs de datacenter ni de frameworks Python.

El modelo resuelve transcripción offline multilingüe (inglés, francés, alemán, español y portugués) con marcas de tiempo a nivel de palabra, y es la variante de la familia Granite-Speech orientada a transcripción enriquecida: etiquetas de hablante y temporización por palabra mediante un simple cambio en el prompt. A diferencia del modelo base 4.1-2b, esta variante no realiza traducción de voz, no detecta idioma automáticamente y no genera puntuación ni mayúsculas. Tampoco soporta japonés.

La relevancia actual viene de su perfil de despliegue: con cuantizaciones desde 1,49 GB (Q4_K_M) y una degradación de WER mínima frente a BF16 (1,56 % frente a 1,49 % en LibriSpeech test-clean), es un candidato realista para transcripción local, privada y sin conexión en portátiles y equipos de escritorio convencionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder Conformer + proyector BLIP-2 Q-Former + decodificador LLM autorregresivo Granite-4.0-1b |
| Parametros totales | 2.111.899.452 (2,11 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (entrada de audio: WAV mono a 16 kHz) |
| Tipos de cuantizacion | BF16, F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M |
| Idiomas soportados | Ingles, frances, aleman, espanol, portugues (sin japones en esta variante) |
| Licencia | Apache-2.0 (heredada del modelo base) |
| Formato de pesos | GGUF (runtime transcribe.cpp) |
| Tamano del repositorio | 1,7 GB |
| Modelo base | ibm-granite/granite-speech-4.1-2b-plus (relacion: quantized) |
| Pipeline | automatic-speech-recognition |
| Descargas / likes | 20 / 0 |

## Arquitectura y entrenamiento

La arquitectura es un sistema encoder-decoder de tres piezas: un encoder Conformer que procesa el audio, un proyector basado en Q-Former (arquitectura BLIP-2) que alinea las representaciones acústicas con el espacio del modelo de lenguaje, y un decodificador LLM autorregresivo Granite-4.0-1b. La variante "plus" introduce dos cambios concretos respecto al 4.1-2b: el encoder concatena los estados ocultos de la capa intermedia (índice 3) y de la capa final, con `cat_hidden_layers=[3]`, lo que duplica la entrada K/V del proyector de 1024 a 2048 dimensiones; y los embeddings de tokens del LM están atados (tied) con el `lm_head`. El modelo consume un WAV mono a 16 kHz y produce una transcripción; con `--timestamps word` devuelve marcas de tiempo estructuradas por palabra, extraídas de los marcadores `[T:N]` en centésimas de segundo que genera el propio modelo.

Según la model card upstream reproducida, el modelo se entrenó sobre corpus similares a los de Granite-Speech-4.1-2B, aumentados con turnos de hablante y etiquetas de marca de tiempo a nivel de palabra, lo que habilita el ASR con atribución de hablante y la temporización por palabra. No se especifican en la información disponible el número exacto de tokens de entrenamiento, la composición detallada del dataset ni si hubo fases de RLHF o DPO. Las cuantizaciones GGUF de esta ficha fueron validadas contra la referencia de Transformers y se midieron con decodificación greedy y la plantilla de chat del model card; el paso `add_generation_prompt=True` es crítico, ya que sin él el modelo emite entre 25 y 27 hipótesis vacías en clips cortos de test-clean y el WER se dispara hasta aproximadamente el 26 %.

## Capacidades

- Transcripción de voz a texto offline para inglés, francés, alemán, español y portugués.
- Marcas de tiempo a nivel de palabra, devueltas como estructura a partir de los marcadores `[T:N]` en centésimas de segundo.
- ASR con atribución de hablante (etiquetas de hablante más transcripción de palabras en la variante plus).
- Procesamiento de audio en formato WAV mono a 16 kHz.
- Ejecución en CPU, Metal (Apple Silicon) y Vulkan (GPU integrada AMD), a través de transcribe.cpp.
- No soporta traducción de voz (`translate: false`).
- No soporta detección automática de idioma (`lang_detect: false`).
- No soporta streaming (`streaming: false`); es un modelo de transcripción por lotes.
- No genera puntuación ni mayúsculas en esta variante plus.
- No soporta japonés.

## Casos de uso

- Transcripción de reuniones y actas con marcas de tiempo: al devolver timestamps por palabra y etiquetas de hablante, permite generar actas navegables donde se salta al instante exacto de cada intervención, sin enviar audio a servicios externos.
- Subtitulado de vídeo y audio: los marcadores por palabra simplifican la generación de ficheros de subtítulos sincronizados en cinco idiomas europeos, con ajuste de duración por palabra en lugar de por segmento.
- Indexación y búsqueda de archivos de audio: transcribir una fonoteca o un archivo de pódcast permite construir un índice de texto buscable; el coste de inferencia en CPU (RTF 5 en un Apple M4 en modo CPU) hace viable procesar horas de audio en lotes nocturnos.
- Documentación clínica o legal con requisitos de privacidad: al ejecutarse localmente sin llamadas de red, encaja en entornos donde el audio no puede salir de la infraestructura propia.
- Subtitulado y transcripción en centros de contacto: la atribución de hablante permite separar agente y cliente en una misma grabación, útil para control de calidad y análisis posterior.
- Herramientas de accesibilidad en tiempo casi real: con RTF 33 en Metal sobre un M4 Max, la transcripción va muy por delante del habla, lo que permite integrarla en aplicaciones de asistencia para personas con discapacidad auditiva con una latencia acumulada baja, aunque no en modo streaming nativo.
- Procesamiento por lotes en servidores sin GPU: al ejecutarse con Vulkan en una GPU integrada AMD (RTF 2,75 en Ryzen 4750U) o en CPU pura (RTF 1,4), permite desplegar transcripción masiva en hardware de bajo coste.
- Integración en pipelines de archivado multilingüe: para organizaciones con contenido en inglés, francés, alemán, español y portugués, un único modelo cubre los cinco idiomas sin enrutado por idioma.

## Benchmarks y rendimiento

| Cuantizacion | Tamano | WER LibriSpeech test-clean |
|---|---:|---:|
| BF16 | 4,23 GB | 1,49 % |
| F16 | 4,23 GB | 1,48 % |
| Q8_0 | 2,35 GB | 1,50 % |
| Q6_K | 1,86 GB | 1,46 % |
| Q5_K_M | 1,69 GB | 1,48 % |
| Q4_K_M | 1,49 GB | 1,56 % |

Medición sobre el split completo de LibriSpeech test-clean (2620 enunciados), decodificación greedy y plantilla de chat del model card, con el normalizador de texto `EnglishTextNormalizer` de Whisper (el mismo que usa Open ASR Leaderboard). La referencia BF16 re-ejecutada localmente por el autor dio 1,48 %, 0,04 puntos porcentuales por encima del 1,44 % publicado por el upstream, dentro del solapamiento de intervalos de confianza bootstrap.

| Equipo | Backend | RTF publicado |
|---|---|---:|
| Apple M4 Max | Metal | 33 |
| Apple M4 Max | CPU | 5,2 |
| Apple M4 | Metal | 11 |
| Apple M4 | CPU | 5 |
| Ryzen 4750U | Vulkan | 2,75 |
| Ryzen 4750U | CPU | 1,4 |

Los valores de RTF se presentan tal como los publica el autor, con la nomenclatura de transcribe.cpp; se interpretan como factor de velocidad (segundos de audio procesados por segundo de cómputo, mayor es mejor). No se han publicado resultados de benchmarks de razonamiento, código o matemáticas en la información disponible, ya que el modelo es exclusivamente de ASR.

## Requisitos de hardware

- Huella de pesos: 4,23 GB en BF16/F16, 2,35 GB en Q8_0, 1,86 GB en Q6_K, 1,69 GB en Q5_K_M y 1,49 GB en Q4_K_M. La memoria total necesaria es el tamaño del fichero más el estado del encoder y del decodificador.
- VRAM estimada: no disponible de forma explícita; en la práctica cualquier GPU con 3 GB o más de VRAM libre puede alojar la cuantización Q4_K_M con margen.
- GPU de datacenter (A100, H100) no son necesarias: el modelo está pensado para CPU, Metal y Vulkan, no para stacks CUDA de gran escala.
- Cabe en GPU de consumo: sí. Cualquier RTX 3060/4060 con 8 GB o más, y GPUs integradas AMD vía Vulkan, pueden ejecutar las cuantizaciones Q4_K_M a Q8_0.
- Apple Silicon: soporte Metal con RTF 11 en un M4 y 33 en un M4 Max, según los datos del autor.
- CPU pura: RTF 5 en Apple M4 y 1,4 en Ryzen 4750U, lo que implica transcripción más rápida que el tiempo real en hardware modesto.
- Opciones de despliegue: exclusivamente transcribe.cpp en esta publicación (compilación con CMake y binario `transcribe-cli`). No se documentan despliegues con vLLM, llama.cpp, Ollama o TGI para este checkpoint.
- Formato de entrada: requiere audio WAV mono a 16 kHz; el autor recomienda convertir previamente con ffmpeg (`-ar 16000 -ac 1`).
- No soporta streaming, por lo que la latencia depende del tamaño del lote de audio enviado, no de un mecanismo incremental.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad | WER LibriSpeech test-clean |
|---|---|---:|---|---|---|---|
| myflow-ai/granite-speech-4.1-2b-plus-gguf | 2,11 B | no disponible | en, fr, de, es, pt | Apache-2.0 | GGUF para transcribe.cpp | 1,46-1,56 % segun cuantizacion |
| ibm-granite/granite-speech-4.1-2b-plus | 2,11 B | no disponible | en, fr, de, es, pt | Apache-2.0 | Pesos originales (Transformers) | 1,44 % publicado (BF16) |
| ibm-granite/granite-speech-4.1-2b | no disponible | no disponible | no disponible | Apache-2.0 | Pesos originales | no disponible |
| Whisper large-v3-turbo | 809 M | 30 s de audio por ventana | multilingue | MIT | Multiples runtime, incluido GGUF | no disponible |
| Whisper large-v3 | 1,55 B | 30 s de audio por ventana | multilingue | MIT | Multiples runtime, incluido GGUF | no disponible |

No se dispone en la información proporcionada de resultados de WER comparables para las alternativas, por lo que la comparación cuantitativa de calidad queda como no disponible. Las diferencias relevantes y verificables son el tamaño de pesos (2,11 B frente a 809 M y 1,55 B), la licencia permisiva Apache-2.0 frente a MIT, y el hecho de que la familia Granite-Speech ofrece marcas de tiempo por palabra y atribución de hablante de forma nativa.

## Limitaciones y advertencias

- Esta variante plus no genera puntuación ni mayúsculas, a diferencia del modelo base 4.1-2b.
- No realiza traducción de voz ni detección automática de idioma; el idioma debe estar contemplado entre los cinco soportados.
- No soporta streaming; no es adecuada para dictado en tiempo real con salida incremental.
- No soporta japonés en esta variante.
- Riesgo de alucinación en audio con silencio, ruido o habla solapada; la dependencia de `add_generation_prompt=True` documentada por el autor (sin él, el WER salta a ~26 % por hipótesis vacías) indica que la plantilla de prompts es frágil si se reproduce fuera de transcribe.cpp.
- Requiere entrada estricta de WAV mono a 16 kHz; otras frecuencias o canales exigen preprocesado externo.
- Sesgos conocidos: no se documentan análisis de sesgo en la información disponible. La cobertura de idiomas se limita a en, fr, de, es, pt, lo que deja fuera la mayor parte de las lenguas del mundo.
- Licencia Apache-2.0, heredada del modelo base, permite uso comercial sin restricciones adicionales, pero conviene verificar los términos completos en la model card de IBM.
- El repositorio tiene solo 20 descargas y 0 likes, y las cuantizaciones son de un tercero (myflow-ai) sobre el checkpoint de IBM; para producción conviene validar numéricamente contra la referencia, como ya hizo el autor.
- Los enlaces de descarga de la model card apuntan al repositorio handy-computer/granite-speech-4.1-2b-plus-gguf, distinto de myflow-ai; conviene comprobar cuál es el artefacto que se descarga realmente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/myflow-ai/granite-speech-4.1-2b-plus-gguf
- Modelo base: https://huggingface.co/ibm-granite/granite-speech-4.1-2b-plus
- Modelo base sin la variante plus: https://huggingface.co/ibm-granite/granite-speech-4.1-2b
- Repositorio transcribe.cpp: https://github.com/handy-computer/transcribe.cpp
- Documentación del modelo en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/blob/main/docs/models/granite-speech-4.1-2b-plus.md
- Commit upstream fijado: https://huggingface.co/ibm-granite/granite-speech-4.1-2b-plus/commit/edd3bf5
- Commit de validación en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/tree/275332d
- Referencias arXiv incluidas en las etiquetas del repositorio: arXiv:2604.11269, arXiv:2604.22817, arXiv:2604.12398, arXiv:2505.08699, arXiv:2603.11243, arXiv:2603.08397 (no se ha verificado su contenido en la información disponible)
- La búsqueda web realizada no devolvió resultados relevantes sobre el modelo.
