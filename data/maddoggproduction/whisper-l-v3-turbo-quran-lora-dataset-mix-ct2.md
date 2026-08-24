# MaddoggProduction/whisper-l-v3-turbo-quran-lora-dataset-mix-ct2

## Resumen

Este modelo es la conversión a formato CTranslate2 (float16) de `whisper-l-v3-turbo-quran-lora-dataset-mix`, un ajuste fino (LoRA) sobre el modelo base `whisper-large-v3-turbo` de OpenAI, desarrollado por MaddoggProduction. El objetivo es la transcripción automática de recitaciones del Corán en árabe diacritizado, es decir, con los signos vocálicos (tashkeel) completos, algo que el Whisper original no produce de forma fiable.

La conversión a CTranslate2, empaquetada para la librería `faster-whisper`, ofrece una inferencia notablemente más rápida y ligera que el pipeline de transformers, manteniendo los mismos pesos del modelo original. El repositorio pesa 1,6 GB en float16, lo que permite ejecutarlo en GPUs de gama media e incluso en CPU con un rendimiento aceptable. Es relevante ahora porque combina la calidad de transcripción de Whisper large-v3-turbo con la especialización en un dominio lingüístico concreto (árabe coránico), y lo hace en un formato optimizado para producción.

La arquitectura es la de Whisper large-v3-turbo: un transformer encoder-decoder de aproximadamente 809 millones de parámetros, con ventanas de contexto de 30 segundos de audio. Los detalles de entrenamiento, dataset y evaluación (WER) se remiten a la model card del modelo original, que no está disponible en la información proporcionada.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Whisper large-v3-turbo (transformer encoder-decoder) |
| Parametros totales | ~809 M (heredados de whisper-large-v3-turbo) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Ventanas de audio de 30 segundos (Whisper) |
| Tipos de cuantizacion | float16 (formato CT2); se puede convertir a int8, int8_float16 o float32 con ctranslate2 |
| Idiomas soportados | Arabe (enfocado en recitaciones coranicas con diacriticos); el modelo base soporta 99 idiomas, pero este ajuste no los ha validado |
| Licencia | No disponible (la model card indica "set", que es un placeholder; el modelo base whisper-large-v3-turbo usa licencia MIT) |
| Formato de pesos | CTranslate2 (archivos .bin y .json, incluye tokenizer.json y preprocessor_config.json) |

## Arquitectura y entrenamiento

Whisper large-v3-turbo es un transformer encoder-decoder con atención multi-cabeza sobre espectrogramas de 128 bandas mel, entrenado por OpenAI sobre 680 000 horas de audio supervisado en 99 idiomas. El modelo presentado es un adaptador LoRA sobre ese base, entrenado para mejorar la salida en árabe diacritizado de recitaciones coránicas, un dominio en el que el Whisper base produce texto sin tashkeel o con errores de vocalización.

La conversión a CTranslate2 se realizó con `ctranslate2==4.7.1` y `faster-whisper==1.2.1`, manteniendo el vocabulario large-v3 (tokenizer.json) y la configuración de preprocesado de 128 mel bins. El formato CT2 no introduce cambios en los pesos ni en la arquitectura; simplemente reempaqueta el modelo para ejecución optimizada en CPU y GPU con la librería faster-whisper.

No se han publicado en esta información detalles del dataset de entrenamiento, el número de tokens, ni si se aplicó RLHF o DPO. La model card original del autor contiene estos datos, pero no están accesibles en la información proporcionada.

## Capacidades

- Transcripción automática de audio (ASR) de recitaciones del Corán en árabe con diacríticos completos (tashkeel).
- Procesamiento de audio largo de forma automática: faster-whisper segmenta el audio sin necesidad de chunking manual.
- Salida con marcas temporales por segmento (el modelo de Whisper genera timestamps por defecto).
- Soporte de beam search (beam_size configurable) para mejorar la precisión en transcripciones largas.
- No soporta tool calling, vision, audio generation ni otras capacidades multimodales; es exclusivamente un modelo de reconocimiento de voz.
- La versión base de Whisper soporta 99 idiomas, pero este ajuste fino está especializado en árabe coránico y no se ha validado su rendimiento en otros idiomas.

## Casos de uso

- Transcripción de recitaciones coránicas para plataformas educativas: el modelo transcribe audios de recitaciones con la vocalización completa, lo que permite generar textos de apoyo para estudiantes del Corán que necesitan ver el tashkeel en pantalla mientras escuchan.
- Subtitulado automático de vídeos religiosos: se puede integrar en pipelines de postproducción para generar subtítulos en árabe diacritizado de vídeos de recitación, mejorando la accesibilidad de contenidos en YouTube o plataformas de streaming.
- Búsqueda semántica en recitaciones: al transcribir con precisión el texto vocalizado, se puede indexar el audio y permitir búsquedas por versículo, palabra o cita exacta en aplicaciones de estudio islámico.
- Análisis lingüístico y fonético: investigadores de fonética árabe pueden usar las transcripciones para estudiar patrones de pronunciación, entonación y variaciones entre recitadores, con la ventaja de que el texto incluye las vocales cortas que el Whisper base omite.
- Accesibilidad para personas con discapacidad auditiva: la transcripción en tiempo real o en archivo permite mostrar el texto coránico a personas con pérdida de audición durante sesiones de recitación en directo o grabadas.
- Herramientas de estudio y memorización: aplicaciones móviles de memorización del Corán pueden integrar el modelo para verificar la pronunciación del usuario contra el texto diacritizado, comparando la transcripción del audio con la referencia.
- Archivado y digitalización de grabaciones históricas: recitaciones antiguas en cinta o audio de baja calidad pueden transcribirse y documentarse, gracias a la robustez de Whisper frente a ruido y la optimización de faster-whisper para audio largo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card original del autor menciona que la evaluación con WER (Word Error Rate) y el dataset están detallados en el repositorio base, pero esos datos no están accesibles en la información proporcionada. No se puede presentar una tabla comparativa con valores reales sin riesgo de inventar cifras.

## Requisitos de hardware

- VRAM estimada: el modelo en float16 ocupa 1,6 GB de memoria, por lo que la inferencia en GPU requiere aproximadamente 2-3 GB de VRAM para el modelo y los buffers de activación; en CPU, necesita unos 4-6 GB de RAM.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (RTX 3060, RTX 4060, GTX 1660 Super) es suficiente para inferencia en float16; para procesamiento por lotes o audio largo, se recomienda una GPU de 8 GB o más (RTX 3070, RTX 4080, A100).
- En CPU: funciona con faster-whisper en CPU usando int8 o int8_float16 para reducir latencia; un procesador moderno de 8 núcleos puede transcribir audio en tiempo real o más rápido con int8.
- Despliegue: se integra directamente con la librería `faster-whisper` (Python), que usa CTranslate2 como backend; también se puede servir con servidores ASR como `whisper-server` o `faster-whisper-server`.
- Latencia: no disponible con datos concretos; en una GPU de gama media (RTX 3060), la transcripción de un audio de 30 segundos suele completarse en menos de 1 segundo con float16 y beam_size 5, pero no se ha medido en este repositorio.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Formato |
|---|---|---|---|---|---|
| whisper-l-v3-turbo-quran-lora-dataset-mix-ct2 | 809 M | 30 s | Arabe diacritizado (Coran) | No disponible | CTranslate2 |
| whisper-large-v3-turbo (OpenAI) | 809 M | 30 s | Multilingue generico | MIT | Safetensors, GGUF, CT2 |
| whisper-large-v3 (OpenAI) | 1550 M | 30 s | Multilingue generico | MIT | Safetensors, GGUF, CT2 |
| whisper-base (OpenAI) | 74 M | 30 s | Multilingue generico | MIT | Safetensors, GGUF, CT2 |

La comparativa con otros fine-tunes específicos para árabe coránico no está disponible en la información proporcionada. La ventaja principal de este modelo frente a los Whisper originales es la producción de diacríticos, pero carece de datos de WER comparativos para confirmar su superioridad cuantitativa.

## Limitaciones y advertencias

- Licencia no clarificada: la model card indica "no" como licencia, lo que es un placeholder sin valor legal. El modelo base es MIT, pero el adaptador LoRA y el dataset de entrenamiento podrían tener restricciones adicionales no documentadas. No se recomienda uso comercial sin contactar antes con el autor.
- Sesgos del dataset: no se han publicado detalles sobre la composición del dataset de entrenamiento; si se entrenó solo con recitaciones de un estilo o recitador concreto, el modelo puede fallar en otros estilos (por ejemplo, Maqamat o recitaciones con diferentes variantes de pronunciación).
- Riesgo de alucinación: como todos los modelos Whisper, puede generar texto no presente en el audio, especialmente en grabaciones con ruido, ecos o voz solapada. En el dominio coránico, esto podría producir transcripciones incorrectas de versículos, con implicaciones religiosas.
- Limitación de idioma: aunque el modelo base es multilingüe, el ajuste se ha hecho solo para árabe; el rendimiento en otros idiomas no está validado y probablemente sea peor que el del Whisper original.
- Contexto de audio: la ventana de 30 segundos es fija; para audios largos se requiere segmentación automática, que faster-whisper hace internamente pero puede introducir errores en los límites de los segmentos.
- Sin soporte de funciones adicionales: no es un modelo multimodal ni de texto libre; solo ASR, y no se puede usar para generación de texto, tool calling ni agentes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MaddoggProduction/whisper-l-v3-turbo-quran-lora-dataset-mix-ct2
- Modelo original (base del ajuste): https://huggingface.co/MaddoggProduction/whisper-l-v3-turbo-quran-lora-dataset-mix
- Repositorio de faster-whisper (SYSTRAN): https://github.com/SYSTRAN/faster-whisper
- Catalogo de modelos de Microsoft Foundry: https://ai.azure.com/catalog/models/maddoggproduction-whisper-l-v3-turbo-quran-lora-dataset-mix
- Despliegue en FriendliAI: https://friendli.ai/models/MaddoggProduction/whisper-l-v3-turbo-quran-lora-dataset-mix
