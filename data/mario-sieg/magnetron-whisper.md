# mario-sieg/magnetron-whisper

## Resumen

`mario-sieg/magnetron-whisper` es una instantánea (snapshot) del modelo de reconocimiento automático del habla `openai/whisper-base`, convertida al formato propietario del runtime Magnetron y almacenada en `bfloat16`. No se trata de un modelo nuevo ni de un fine-tuning: es una reempaquetadura de los pesos originales de Whisper base para su uso con la herramienta Magnetron. El autor es `mario-sieg` y el repositorio se publicó el 1 de noviembre de 2026 bajo licencia Apache 2.0.

El modelo subyacente, Whisper base, es un transformer encoder-decoder de 74 millones de parámetros aproximadamente, entrenado por OpenAI para transcripción y traducción de voz. Procesa audio en ventanas de 30 segundos representadas como espectrogramas mel de 80 canales y genera texto de hasta 448 tokens. Su relevancia aquí es logística: permite ejecutar Whisper base en el runtime Magnetron sin depender del formato original de Hugging Face, reduciendo el tamaño del artefacto de 276,95 MiB a 141,64 MiB.

La ficha se centra en lo que el repositorio documenta realmente. Al ser un snapshot de conversión, las capacidades, limitaciones y comportamiento son los del modelo original de OpenAI, no los de una variante entrenada específicamente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper) |
| Parametros totales | no disponible (modelo base de Whisper, ~74 M según el modelo original) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 1500 posiciones en el encoder (ventanas de audio de 30 s); 448 posiciones en el decoder |
| Tipos de cuantizacion | bf16 (único dtype del snapshot) |
| Idiomas soportados | no disponible en la información proporcionada (Whisper base original soporta multilingüe) |
| Licencia | Apache 2.0 |
| Formato de pesos | `.mag` (Magnetron snapshot), con tokenizer embebido en metadatos |

Parámetros de configuración adicionales documentados: `vocab_size` 51865, `num_mel_bins` 80, `d_model` 512, 6 capas de encoder y 6 de decoder, 8 cabezas de atención por bloque, `ffn_dim` 2048 en ambos bloques. El snapshot contiene 246 tensores, con un payload de 138,52 MiB y un tamaño de fichero final de 141,64 MiB.

## Arquitectura y entrenamiento

La arquitectura es la de Whisper base: un encoder que consume espectrogramas mel de 80 bins y un decoder autorregresivo que produce tokens de texto, ambos con 6 capas y dimensión oculta 512. El encoder trabaja sobre `max_source_positions` de 1500, lo que corresponde a ventanas de audio de 30 segundos, mientras que el decoder está limitado a 448 posiciones objetivo. No hay innovaciones arquitectónicas propias de este repositorio: la conversión a Magnetron preserva la topología original y solo cambia el contenedor y el dtype.

No se dispone de información sobre el proceso de entrenamiento en esta ficha, porque el repositorio no lo documenta. El modelo base `openai/whisper-base` fue entrenado por OpenAI con un corpus de audio débilmente supervisado y no se detalla aquí el número de tokens, la composición del dataset ni si hubo RLHF o DPO. La conversión a Magnetron se realizó en 0,1 s con un throughput de 972,93 MiB/s, según la model card.

## Capacidades

- Reconocimiento automático del habla (ASR): transcripción de audio a texto, tarea para la que está etiquetado el pipeline.
- Traducción de voz a texto: capacidad heredada de Whisper base, aunque no se detalla en la model card.
- Detección de idioma y transcripción multilingüe: no confirmado explícitamente en la información disponible; el modelo original lo soporta.
- Procesamiento de audio en ventanas de 30 segundos con espectrogramas mel de 80 canales.
- Generación de hasta 448 tokens de texto por ventana de audio.
- No se documenta soporte de tool calling, function calling, agentes ni razonamiento multi-paso.
- No se documentan capacidades de visión, audio generativo ni modo thinking.

## Casos de uso

- Transcripción de reuniones y notas de voz: el modelo procesa ventanas de 30 segundos y genera hasta 448 tokens, adecuado para dividir grabaciones largas en segmentos y transcribirlos secuencialmente.
- Subtitulado automático de vídeo: la salida de texto alineada por ventanas permite generar subtítulos con marcas temporales aproximadas, integrable en pipelines de postproducción.
- Búsqueda por voz en aplicaciones: convertir consultas habladas en texto para indexación o búsqueda semántica en bases de datos.
- Accesibilidad: transcripción en tiempo real o diferida de contenido hablado para personas con discapacidad auditiva, con la ventaja de un modelo pequeño que cabe en hardware modesto.
- Preprocesado de datasets de audio: convertir grandes volúmenes de grabaciones a texto para entrenar otros modelos o para análisis de contenido.
- Dictado y asistentes de escritura: integración en editores o herramientas de productividad que convierten voz en texto mediante el runtime Magnetron.
- Despliegue en entornos con recursos limitados: al ser un snapshot bf16 de 141,64 MiB, es viable en dispositivos edge o contenedores pequeños, siempre que se use el runtime Magnetron.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo incluye métricas de conversión del snapshot (tensores, tamaño, throughput de conversión), no métricas de calidad ASR como WER, MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; por el tamaño del snapshot (141,64 MiB en bf16) el modelo es muy ligero y debería caber en GPUs de gama baja.
- GPU recomendadas: no especificadas en la información proporcionada. Por tamaño, cualquier GPU con al menos ~1 GB de VRAM libre debería ser suficiente, pero no hay confirmación oficial.
- Cabe en GPU consumer: previsiblemente sí, dado el tamaño del artefacto, aunque no se documenta compatibilidad concreta con modelos como RTX 4090, RTX 3060 o similares.
- Opciones de despliegue: el repositorio está diseñado para el runtime Magnetron. No se documenta compatibilidad con vLLM, llama.cpp, Ollama, TGI ni transformers.
- Latencia y throughput: no disponibles. Solo se documenta el throughput de conversión del snapshot (972,93 MiB/s), que no es una métrica de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `mario-sieg/magnetron-whisper` | ~74 M (Whisper base) | 1500 posiciones encoder / 448 decoder | `.mag` (Magnetron) | Apache 2.0 | Hugging Face |
| `openai/whisper-base` | ~74 M | 1500 / 448 | safetensors/bin | Apache 2.0 | Hugging Face |
| `openai/whisper-small` | ~244 M | 1500 / 448 | safetensors/bin | Apache 2.0 | Hugging Face |
| `openai/whisper-tiny` | ~39 M | 1500 / 448 | safetensors/bin | Apache 2.0 | Hugging Face |

La diferencia principal frente a `openai/whisper-base` es el contenedor y el dtype (bf16 en Magnetron frente a los pesos originales), no la calidad ni la arquitectura. Frente a `whisper-small` y `whisper-tiny`, este snapshot se sitúa en el mismo punto de la escala que whisper-base. No se dispone de datos de rendimiento comparativo en la información proporcionada.

## Limitaciones y advertencias

- Es un snapshot de conversión, no un modelo entrenado o ajustado: no aporta mejoras de calidad sobre `openai/whisper-base`.
- Dependencia del runtime Magnetron: el formato `.mag` no es estándar y no se documenta compatibilidad con transformers, vLLM, llama.cpp u otros runners habituales.
- Solo se distribuye en bf16, sin opciones de cuantización documentadas (GGUF, int8, int4, etc.).
- Idiomas soportados no confirmados en la información disponible; el modelo original es multilingüe, pero el snapshot no lo detalla.
- Riesgo de alucinación heredado de Whisper: el modelo original puede generar texto plausible en segmentos de silencio o ruido, especialmente en audio de baja calidad.
- Sesgos: no documentados en esta ficha; el modelo base de OpenAI presenta sesgos conocidos en acentos, dialectos y condiciones de grabación.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene revisar las condiciones del modelo base de OpenAI y del runtime Magnetron.
- Sin métricas de calidad publicadas: no hay WER ni evaluaciones que permitan validar el comportamiento del snapshot frente al original.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso en producción ni validación comunitaria.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mario-sieg/magnetron-whisper
- Modelo base: https://huggingface.co/openai/whisper-base
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la información proporcionada.
