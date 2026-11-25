# Ranjit/gemma-4-12b-it-speech-translation-int4

## Resumen

El modelo `Ranjit/gemma-4-12b-it-speech-translation-int4` es una familia de variantes comprimidas y cuantizadas de `google/gemma-4-12b-it`, publicada por el usuario Ranjit en Hugging Face. Su propósito es específico: traducir voz en inglés directamente a texto en alemán o en chino, sin pasar por una transcripción intermedia. El repositorio agrupa varias versiones del modelo (distintas profundidades de decoder y distintos vocabularios de salida) para que el usuario elija el equilibrio entre tamaño y calidad que necesite.

La compresión combina varias técnicas: cuantización de 4 bits con AutoRound en formato w4a16, destilación de conocimiento (self-distillation), poda de capas del decoder y recorte del vocabulario de salida. El resultado más llamativo es que la variante `48L-full` ocupa 7,25 GiB frente a los 22,28 GiB del modelo original en bf16, y aun así obtiene mejores puntuaciones COMET en el conjunto de evaluación ACL 60/60 (73,81 frente a 71,74 en inglés→alemán; 77,56 frente a 76,33 en inglés→chino).

El modelo es relevante porque demuestra que una compresión agresiva y específica para una tarea puede superar al modelo original en esa tarea concreta, algo poco habitual. Está pensado para un pipeline multimodal de audio a texto (`audio-text-to-text`), con licencia Apache 2.0 y pesos en safetensors, sobre la librería `transformers`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (audio-text-to-text) derivado de Gemma 4 12B-it; decoder de 48 capas en la variante principal |
| Parametros totales | no disponible (el modelo base es de 12B; las variantes podadas reducen capas, no se indica el recuento exacto) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits, int4, w4a16, AutoRound |
| Idiomas soportados | en, de, zh |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería transformers); tamaño del repo 52,3 GB |

## Arquitectura y entrenamiento

El modelo parte de `google/gemma-4-12b-it`, un transformer multimodal capaz de procesar audio y texto. Sobre esa base, el autor aplica un proceso de compresión en varias etapas: cuantización de 4 bits con AutoRound (w4a16), destilación de conocimiento por self-distillation, poda de capas del decoder (de 48 a 44, 40 o 36 capas según la variante) y recorte del vocabulario de salida (vocabulario completo de 262k tokens, alemán de 168k o chino de 52k). Todo el entrenamiento se realizó exclusivamente sobre el dataset ACL 60/60.

Una innovación destacable es el orden del prompt: colocar el audio antes de la instrucción de traducción. Según la model card, con la instrucción primero el modelo original tiende a transcribir en lugar de traducir (41% de salida en inglés para el caso alemán), lo que cuesta unos 10 puntos de COMET. Las variantes con vocabulario recortado incluyen un `vocab_maps.json` que mapea los ids de token nuevos a los originales, de modo que el tokenizador base sigue siendo válido.

## Capacidades

- Traducción directa de voz en inglés a texto en alemán o chino (speech-to-text translation), sin transcripción intermedia.
- Procesamiento multimodal de audio y texto en un único modelo.
- Generación de texto controlada por prompt de chat con `apply_chat_template` y `enable_thinking=False`.
- Variantes con vocabulario restringido al idioma destino: `-de` solo produce alemán (conserva latín, griego, dígitos y puntuación); `-zh` solo produce chino.
- Decodificación greedy con `repetition_penalty=1.05` como configuración recomendada.
- No se documentan tool calling, function calling, capacidades de agente ni modos de razonamiento extendido.

## Casos de uso

- Traducción de charlas y conferencias científicas: el modelo se entrenó sobre ACL 60/60, segmentos de charlas técnicas, por lo que es adecuado para traducir audio de presentaciones académicas a alemán o chino manteniendo terminología técnica.
- Subtitulado automático de vídeo en inglés hacia alemán o chino: con la variante `48L-full` se cubren ambos idiomas y se puede generar una pista de subtítulos traducida directamente desde el audio.
- Despliegue en entornos con VRAM limitada: la variante `36L-zh` ocupa 4,43 GiB, lo que permite ejecutar traducción inglés→chino en GPUs de consumo medio sin recurrir a servicios externos.
- Procesamiento por lotes de archivos de audio: el script `translate.py` acepta varios archivos WAV en una sola invocación, útil para pipelines de traducción masiva de grabaciones.
- Traducción en tiempo casi real de reuniones: con decodificación greedy y `max_new_tokens=256`, la variante `48L-full` puede integrarse en un flujo de captura de audio de 16 kHz y salida de texto traducido.
- Investigación en compresión de modelos: las distintas variantes (poda de capas y recorte de vocabulario) sirven como referencia reproducible para estudiar el equilibrio entre tamaño y calidad en tareas de traducción de voz.

## Benchmarks y rendimiento

Resultados declarados por el autor (COMET con `wmt22-comet-da`, ×100, sobre el split de evaluación de ACL 60/60, 416 segmentos). No verificados de forma independiente.

| Modelo | Tamaño (GiB) | en→de | en→zh |
|---|---|---|---|
| 48L-full | 7,25 | 73,81 | 77,56 |
| 48L-de | 6,58 | 73,34 | – |
| 48L-zh | 5,74 | – | 77,92 |
| 44L-de | 6,15 | 71,88 | – |
| 44L-zh | 5,31 | – | 77,41 |
| 40L-de | 5,71 | 69,06¹ | – |
| 40L-zh | 4,88 | – | 76,27 |
| 36L-de | 5,27 | 66,78 | – |
| 36L-zh | 4,43 | – | 74,78 |
| Gemma 4 12B-it bf16, prompt estándar | 22,28 | 61,49 | 67,35 |
| Gemma 4 12B-it bf16, prompt del autor | 22,28 | 71,74 | 76,33 |
| Gemma 4 12B-it bitsandbytes NF4, prompt estándar | 7,15 | 54,81 | 60,95 |

¹ Greedy sin penalización por repetición; en el resto se aplica `repetition_penalty=1.05`, que añade entre +0,5 y +1,4 puntos.

## Requisitos de hardware

- VRAM estimada para inferencia: entre 4,43 GiB (`36L-zh`) y 7,25 GiB (`48L-full`) para los pesos en int4; hay que sumar el overhead de activaciones, el procesador de audio y el contexto, por lo que en la práctica se recomienda al menos 8-10 GiB para la variante principal.
- GPU recomendadas: A100 o H100 para despliegues de producción con concurrencia; RTX 4090 (24 GiB) para desarrollo y pruebas con holgura.
- Cabe en GPU de consumo: sí, la variante `36L-zh` (4,43 GiB) y `40L-zh` (4,88 GiB) caben en tarjetas de 8 GiB; `48L-full` requiere al menos 10-12 GiB.
- Opciones de despliegue: `transformers` (>=5.24) con `AutoModelForMultimodalLM` y `AutoProcessor`; el autor no documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | en→de (COMET) | en→zh (COMET) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| gemma-4-12b-it-speech-translation-int4 (48L-full) | 12B base, comprimido a int4 | no disponible | 73,81 | 77,56 | Apache 2.0 | Hugging Face |
| google/gemma-4-12b-it (bf16, prompt del autor) | 12B | no disponible | 71,74 | 76,33 | no disponible en la información | Hugging Face |
| google/gemma-4-12b-it (bitsandbytes NF4) | 12B | no disponible | 54,81 | 60,95 | no disponible en la información | Hugging Face |

No se dispone de datos de otros modelos comparables de traducción de voz en la información proporcionada.

## Limitaciones y advertencias

- Solo traduce desde inglés hacia alemán o chino; no cubre otras direcciones ni otros pares de idiomas.
- Las variantes `-de` y `-zh` solo pueden generar texto en su idioma destino, lo que las inutiliza para cualquier otra tarea.
- El entrenamiento se limita al dataset ACL 60/60 (charlas científicas), por lo que el dominio está acotado y el rendimiento fuera de él no está documentado.
- Los resultados COMET son declarados por el autor y no están verificados de forma independiente.
- El orden del prompt es crítico: si se coloca la instrucción antes del audio, la calidad cae unos 10 puntos de COMET por tendencia a transcribir en lugar de traducir.
- El modelo base Gemma puede presentar sesgos heredados; no se documentan evaluaciones de sesgo ni de alucinación para esta variante.
- Aunque la licencia es Apache 2.0, conviene revisar las condiciones del modelo base `google/gemma-4-12b-it` antes de un uso comercial, ya que la información disponible no detalla su licencia.
- El repositorio ocupa 52,3 GB porque contiene todas las variantes; la descarga completa no es necesaria si solo se usa una subcarpeta.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Ranjit/gemma-4-12b-it-speech-translation-int4
- Modelo base: https://huggingface.co/google/gemma-4-12b-it
