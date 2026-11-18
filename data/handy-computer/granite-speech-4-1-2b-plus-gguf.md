# handy-computer/granite-speech-4.1-2b-plus-gguf

## Resumen

Granite-speech-4.1-2b-plus es un modelo de reconocimiento automático del habla (ASR) desarrollado por IBM dentro de su familia Granite. Esta ficha concreta corresponde a la conversión a GGUF realizada por handy-computer para su uso con el runtime transcribe.cpp, orientado a inferencia local y offline. El modelo resuelve el problema de la transcripción multilingüe con marcas de tiempo a nivel de palabra y diarización de hablantes, sin depender de servicios en la nube.

Arquitectónicamente combina un encoder Conformer, un proyector BLIP-2 Q-Former y un decodificador autoregresivo basado en Granite-4.0-1b, con un total de 2.111.899.452 parámetros. La variante "plus" se diferencia de la base en dos aspectos: el encoder concatena los estados ocultos de la capa intermedia (índice 3) y de la capa final, duplicando la entrada K/V del proyector de 1024 a 2048, y los embeddings de tokens del LM están atados con el lm_head.

Es relevante ahora porque ofrece transcripción multilingüe (inglés, francés, alemán, español y portugués) con licencia Apache-2.0, cuantizaciones que caben en 1,49 GB (Q4_K_M) y un rendimiento en CPU razonable, lo que permite desplegarlo en portátiles y estaciones de trabajo sin GPU dedicada. La contrapartida frente a la variante base es que esta versión "plus" es solo de transcripción y no realiza traducción de voz.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Encoder Conformer + proyector BLIP-2 Q-Former + decodificador LLM autoregresivo Granite-4.0-1b |
| Parámetros totales | 2.111.899.452 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | BF16, F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M |
| Idiomas soportados | en, fr, de, es, pt |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo sigue un diseño de audio-LLM en tres etapas. El encoder Conformer procesa audio de entrada a 16 kHz mono y, en esta variante, concatena los estados ocultos de la capa intermedia 3 con los de la capa final (`cat_hidden_layers=[3]`), lo que duplica la dimensión de entrada K/V del proyector de 1024 a 2048. El proyector BLIP-2 Q-Former alinea las representaciones acústicas con el espacio del decodificador, que es un LLM autoregresivo Granite-4.0-1b con embeddings de tokens atados al lm_head.

La conversión GGUF se realizó a partir del commit upstream `edd3bf5`, fijado el 2026-05-17, y se validó numéricamente contra la referencia de Transformers en el commit `275332d` de transcribe.cpp el 2026-05-17. No se dispone en la información proporcionada de detalles sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. La model card del repositorio GGUF no incluye la sección completa de la model card original de IBM, por lo que esos datos quedan como no disponibles.

Una innovación destacable es el uso de marcadores `[T:N]` en centisegundos que el modelo emite en su salida y que el runtime parsea para reconstruir timestamps a nivel de palabra. La diarización se obtiene mediante un prompt SAA separado, y ambas tareas (timestamps y diarización) no pueden combinarse en una misma inferencia.

## Capacidades

- Transcripción de voz a texto offline en inglés, francés, alemán, español y portugués.
- Marcas de tiempo a nivel de palabra mediante `--timestamps word`, parseadas de los marcadores `[T:N]` en centisegundos.
- Diarización de hablantes mediante `--diarize`, que devuelve turnos estructurados atribuidos a cada hablante a partir de un prompt SAA independiente.
- Detección automática de idioma (`lang_detect: true`).
- Entrada de audio a 16 kHz mono WAV; requiere conversión previa con ffmpeg para otros formatos.
- No soporta streaming (`streaming: false`).
- No soporta traducción de voz (`translate: false`); esta variante es solo de transcripción.
- No permite selección explícita de idioma (`explicit_language_selection: false`).
- No soporta japonés en esta variante, a diferencia de otras de la familia.

## Casos de uso

- Subtitulado automático de vídeo: el modelo genera timestamps a nivel de palabra que se pueden convertir directamente en ficheros SRT o VTT, lo que elimina el alineamiento manual posterior en pipelines de publicación de contenido.
- Actas de reuniones con múltiples participantes: la diarización permite separar turnos por hablante y generar resúmenes atribuidos, útil en herramientas internas de documentación de reuniones sin enviar audio a terceros.
- Transcripción de entrevistas de investigación: con licencia Apache-2.0 y ejecución local, encaja en proyectos con requisitos de privacidad o cumplimiento que impiden usar APIs en la nube.
- Aplicaciones de dictado de escritorio: el tamaño Q4_K_M de 1,49 GB y el rendimiento en CPU (RTF 6,13 en M4 con CPU, 2,6 en Ryzen 4750U) permiten integrarlo en aplicaciones de escritorio tipo Handy para dictado por atajo de teclado.
- Indexación y búsqueda de archivos de audio: la transcripción con timestamps permite construir índices de texto buscable sobre archivos de audio y saltar al instante exacto de una mención.
- Atención al cliente y análisis de llamadas: la combinación de transcripción multilingüe y diarización permite analizar conversaciones de soporte en cinco idiomas y separar agente de cliente para métricas de calidad.
- Documentación clínica o legal dictada: en entornos donde el audio no puede salir de la infraestructura, el despliegue local con cuantización Q8_0 (2,35 GB) mantiene una calidad cercana a BF16 (WER 1,50 % frente a 1,49 % en LibriSpeech test-clean).

## Benchmarks y rendimiento

Resultados de WER publicados en la model card del repositorio GGUF:

| Benchmark | BF16 | F16 | Q8_0 | Q6_K | Q5_K_M | Q4_K_M |
|---|---:|---:|---:|---:|---:|---:|
| LibriSpeech test-clean (WER %) | 1,49 | 1,48 | 1,50 | 1,46 | 1,48 | 1,56 |
| FLEURS en (WER %) | no disponible | no disponible | 4,46 | no disponible | no disponible | no disponible |
| FLEURS fr (WER %) | no disponible | no disponible | 8,82 | no disponible | no disponible | no disponible |
| FLEURS de (WER %) | no disponible | no disponible | 8,06 | no disponible | no disponible | no disponible |
| FLEURS es (WER %) | no disponible | no disponible | 6,53 | no disponible | no disponible | no disponible |
| FLEURS pt (WER %) | no disponible | no disponible | 10,61 | no disponible | no disponible | no disponible |

Las cifras de LibriSpeech corresponden al split completo test-clean (2.620 utterances), batch size 1 y sin timestamps. La referencia BF16 re-ejecutada localmente da 1,48 %, 0,04 pp por encima del 1,44 % publicado por el upstream, diferencia atribuida a la plantilla de chat o a la normalización. El normalizador de texto empleado es el `EnglishTextNormalizer` de Whisper, el mismo que usa Open ASR Leaderboard.

Rendimiento de velocidad (RTF, menor es mejor):

| Plataforma | Backend | RTF | RTF máximo |
|---|---|---:|---:|
| Apple M4 | CPU | 6,13 | 8,32 |
| Apple M4 | Metal | 23,45 | 91,62 |
| AMD Ryzen 4750U | CPU | 2,60 | no disponible |
| AMD Ryzen 4750U | Vulkan | 4,64 | no disponible |

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: aproximadamente 4,23 GB en BF16/F16, 2,35 GB en Q8_0, 1,86 GB en Q6_K, 1,69 GB en Q5_K_M y 1,49 GB en Q4_K_M.
- Cabe en GPU de consumo: la cuantización Q4_K_M (1,49 GB) y Q5_K_M (1,69 GB) entran en cualquier GPU con 4 GB o más de VRAM, incluidas GTX 1650, RTX 3050 y superiores. Q8_0 requiere al menos 3 GB libres.
- GPU recomendadas para mayor throughput: no se especifican modelos concretos en la información disponible; el runtime reporta aceleración por Metal en Apple Silicon y por Vulkan en AMD.
- Ejecución en CPU: validada en Apple M4 (RTF 6,13) y AMD Ryzen 4750U (RTF 2,60), lo que permite uso interactivo sin GPU dedicada.
- Opciones de despliegue: transcribe.cpp (runtime oficial de esta conversión, con CLI `transcribe-cli`). No se indica compatibilidad con vLLM, llama.cpp, Ollama o TGI en la información proporcionada.
- Latencia y throughput: los valores RTF indican que en CPU se procesa audio más rápido que en tiempo real en las plataformas medidas; en Apple M4 con Metal el RTF es de 23,45, sustancialmente superior al de CPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Timestamps | Diarización | Traducción | Licencia | Formato |
|---|---|---:|---|---|---|---|---|
| granite-speech-4.1-2b-plus (esta ficha) | 2,11 B | en, fr, de, es, pt | Sí (palabra) | Sí | No | Apache-2.0 | GGUF |
| granite-speech-4.1-2b (base) | no disponible | no disponible | no disponible | no disponible | Sí | Apache-2.0 (heredada) | no disponible |
| Whisper large-v3 | no disponible en la información | no disponible | Sí (segmento) | No | Sí | no disponible | no disponible |

La comparativa con Whisper large-v3 se incluye por categoría (ASR multilingüe de referencia), pero los datos concretos de parámetros, licencia y disponibilidad de ese modelo no están en la información proporcionada, por lo que se marcan como no disponibles. La diferencia funcional clave frente a la variante base de Granite Speech 4.1-2b es que esta versión "plus" añade timestamps a nivel de palabra y diarización, pero pierde la capacidad de traducción de voz.

## Limitaciones y advertencias

- Esta variante no realiza traducción de voz; para traducción hay que usar la variante base granite-speech-4.1-2b.
- No soporta streaming: la inferencia es por fichero completo, lo que la hace inadecuada para aplicaciones de transcripción en vivo sin segmentación previa.
- Las tareas de timestamps y diarización no pueden combinarse en una misma pasada; requieren dos invocaciones separadas.
- No hay selección explícita de idioma; la detección es automática, lo que puede provocar errores en audio con cambios de idioma o ruido.
- El WER en portugués (10,61 % en FLEURS) es notablemente peor que en inglés (4,46 %), lo que desaconseja su uso en producción para ese idioma sin evaluación previa.
- No se dispone de información sobre sesgos, datos de entrenamiento ni evaluación de alucinaciones en la documentación proporcionada; conviene validar en el dominio objetivo.
- La plantilla de chat es crítica: sin `add_generation_prompt=True` el modelo emite hipótesis vacías en clips cortos y el WER se dispara a ~26 %. El runtime transcribe.cpp lo gestiona correctamente, pero cualquier reproducción manual debe replicarlo.
- Requiere audio de entrada a 16 kHz mono WAV; otros formatos necesitan conversión previa con ffmpeg.
- La licencia Apache-2.0 permite uso comercial, pero se hereda del modelo base y conviene revisar los términos completos en la model card de IBM.

## Enlaces

- Repositorio GGUF en Hugging Face: https://huggingface.co/handy-computer/granite-speech-4.1-2b-plus-gguf
- Modelo base en Hugging Face: https://huggingface.co/ibm-granite/granite-speech-4.1-2b-plus
- Commit upstream del modelo base: https://huggingface.co/ibm-granite/granite-speech-4.1-2b-plus/commit/edd3bf5
- Repositorio transcribe.cpp: https://github.com/handy-computer/transcribe.cpp
- Commit de validación en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/tree/275332d
- Documentación del modelo en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/blob/main/docs/models/granite-speech-4.1-2b-plus.md
- Licencia en el repositorio: https://huggingface.co/handy-computer/granite-speech-4.1-2b-plus-gguf/blob/main/LICENSE
- NOTICE del repositorio: https://huggingface.co/handy-computer/granite-speech-4.1-2b-plus-gguf/blob/main/NOTICE
- Aplicación Handy (sitio oficial): https://handy.computer/
- Descarga de Handy: https://handy.computer/download.html
- Repositorio de Handy en GitHub: https://github.com/cjpais/handy
