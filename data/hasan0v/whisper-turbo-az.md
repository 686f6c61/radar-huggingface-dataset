# hasan0v/whisper-turbo-az

## Resumen

Whisper Turbo AZ es un ajuste fino completo de Whisper large-v3-turbo para el reconocimiento automático del habla en azerí. Lo desarrolla hasan0v y parte de LocalDoc/azerbaijani-whisper-turbo, un modelo previo ya especializado en este idioma, sobre el que reduce la tasa de error de palabras (WER) en el conjunto de test FLEURS-az del 13,11 % al 10,90 %, una mejora relativa del 16,9 %. El modelo tiene 808.878.080 parámetros (unos 809 M) y se distribuye con licencia Apache 2.0.

Resuelve la transcripción de audio en azerí con salida en escritura latina, con mayúsculas y puntuación, y está pensado para entrevistas, reuniones, clases, pódcasts, subtítulos e interfaces de voz. Incorpora entrenamiento con la frase anterior como contexto, lo que ayuda en grabaciones largas, y dispone de una exportación a CTranslate2/faster-whisper que transcribe unas 28 veces más rápido que el tiempo real en una RTX 4070 de portátil.

Es relevante porque ofrece una alternativa local y gratuita a las API comerciales de transcripción: en la comparativa del autor, su WER queda a menos de un punto del de la API gpt-transcribe, mientras que su tasa de error de caracteres (CER) es un 9 % menor. El modelo todavía no tiene descargas ni likes en Hugging Face y sus resultados no están verificados de forma independiente.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper large-v3-turbo), ajuste fino completo |
| Parámetros totales | 808.878.080 (~809 M) |
| Longitud de contexto | Ventanas de audio de 30 s; contexto textual de la frase anterior (entrenado con él) |
| Tipos de cuantización | fp16 (CTranslate2/faster-whisper y Transformers); otras cuantizaciones no disponibles |
| Idiomas soportados | Azerí (az); el modelo base es multilingüe, este fine-tune está especializado en azerí |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (Transformers); CTranslate2 fp16 en el repo `whisper-turbo-az-ct2` |

## Arquitectura y entrenamiento

El modelo es un ajuste fino completo de Whisper large-v3-turbo, la variante optimizada de la familia Whisper de OpenAI, con arquitectura transformer encoder-decoder para reconocimiento automático del habla. El autor parte de LocalDoc/azerbaijani-whisper-turbo y continúa el entrenamiento; la versión publicada aquí es la v2, que según la model card combina datos filtrados y entrenamiento con contexto de la frase anterior. La v1, con la misma receta base, alcanzó un WER del 11,72 % y la v2 lo baja al 10,90 % sobre FLEURS-az.

Los datos de entrenamiento declarados son LocalDoc/azerbaijani_asr, LocalDoc/fleurs-azerbaijani-asr, asmarhajizada/azerbaijani-audiobooks y espnet/yodas2. La entrada es audio mono a 16 kHz de cualquier duración, troceado en ventanas de 30 s, y la salida es texto en azerí con escritura latina, mayúsculas y puntuación. No se indican en la información disponible el número de tokens, la composición exacta del dataset ni hiperparámetros de entrenamiento; al ser una tarea ASR, no se reportan fases de RLHF/DPO.

## Capacidades

- Transcripción automática de voz en azerí (ASR) con salida en escritura latina.
- Texto de salida con mayúsculas y puntuación (cased y punctuated), no solo minúsculas normalizadas.
- Procesamiento de audio de cualquier duración mediante troceado en ventanas de 30 s.
- Uso de la frase anterior como contexto, útil en grabaciones largas (reuniones, clases, pódcasts).
- Exportación a CTranslate2 fp16 para faster-whisper, pensada para inferencia rápida en GPU.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso; no es un modelo generativo de texto general.
- No soporta visión, audio más allá de ASR ni otros idiomas distintos del azerí.
- Capacidad multilingüe: no disponible en este fine-tune, aunque el modelo base Whisper es multilingüe.

## Casos de uso

- Transcripción de entrevistas y reuniones: el modelo usa la frase anterior como contexto y trocea el audio en ventanas de 30 s, lo que permite transcribir conversaciones largas manteniendo coherencia entre segmentos.
- Subtitulado de vídeo y pódcast: la salida ya viene con mayúsculas y puntuación, lo que reduce el posprocesado; con faster-whisper en fp16 procesa aproximadamente 28 veces más rápido que el tiempo real en una RTX 4070 de portátil.
- Notas de voz y dictado: acepta audio mono a 16 kHz de cualquier duración, adecuado para convertir mensajes de voz en texto en aplicaciones locales.
- Clases y ponencias: el contexto de frase previa y el troceado en ventanas de 30 s están pensados para grabaciones docentes de larga duración.
- Atención al cliente y transcripción de llamadas en azerí: al ejecutarse en GPU propia y con licencia Apache 2.0, permite mantener el audio dentro de la infraestructura de la organización sin enviarlo a una API externa.
- Investigación lingüística y corpus ASR en azerí: el modelo y los datasets declarados (FLEURS-az, audiobooks, YODAS2) facilitan experimentos reproducibles y comparaciones de WER/CER.
- Interfaces de voz y asistentes en azerí: puede integrarse en pipelines de voz a texto locales para comandos o dictado en aplicaciones de escritorio.
- Documentación dictada en entornos sanitarios o legales: el despliegue on-premise evita la salida de datos sensibles y permite ajustar el hardware según la carga.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card; no verificados de forma independiente (`verified: false`). Todos los modelos se evaluaron con faster-whisper, fp16, beam 5, sin VAD y `language="az"`, con la misma normalización de texto (NFC, minúsculas, puntuación eliminada).

| Modelo | WER ↓ | CER ↓ | WER relativo |
|---|---:|---:|---:|
| LocalDoc/azerbaijani-whisper-turbo (punto de partida) | 13,11 % | 3,39 % | — |
| Whisper Turbo AZ v1 (datos filtrados + contexto) | 11,72 % | 3,06 % | −10,6 % |
| Whisper Turbo AZ v2 (este modelo) | 10,90 % | 2,86 % | −16,9 % |

Comparativa con una API comercial sobre las primeras 200 muestras de FLEURS-az test, con la misma normalización:

| Modelo | WER ↓ | CER ↓ | Dónde se ejecuta |
|---|---:|---:|---|
| OpenAI gpt-transcribe | 10,70 % | 3,14 % | API en la nube de pago |
| Whisper Turbo AZ v2 | 11,64 % | 2,85 % | GPU propia, offline, gratis |
| Whisper Turbo AZ v1 | 12,35 % | 2,99 % | GPU propia, offline, gratis |
| LocalDoc turbo | 13,42 % | 3,24 % | GPU propia, offline, gratis |

El autor señala que, en tasa de error de caracteres sobre ese subconjunto de 200 clips, la v2 comete un 9 % menos de errores que gpt-transcribe y que su WER queda a menos de un punto de la API. El CER bajo sugiere que buena parte de los errores restantes son diferencias pequeñas de ortografía o sufijos, no palabras omitidas. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks de texto, ya que el modelo es exclusivamente ASR.

## Requisitos de hardware

- Con 809 M de parámetros, los pesos en fp16 ocupan aproximadamente 1,6 GB; el repositorio completo (3,2 GB) incluye varios formatos.
- VRAM estimada para inferencia: en torno a 2-3 GB en fp16 (estimación a partir del número de parámetros; no publicada por el autor).
- GPU recomendadas: RTX 4070 de portátil (el autor reporta 28× tiempo real con faster-whisper fp16, beam 5, sin VAD); cualquier GPU moderna con más de 4 GB de VRAM debería ser suficiente.
- Cabe en GPU de consumo: sí, en tarjetas como la RTX 4070 citada y, en general, en GPUs con 4 GB o más de VRAM.
- También puede ejecutarse en CPU (`device="cpu"` en el ejemplo de Transformers), a costa de mayor latencia.
- Opciones de despliegue: pipeline de Transformers, faster-whisper sobre CTranslate2 (repo `whisper-turbo-az-ct2`). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo ASR de este tipo.
- Latencia y throughput: aproximadamente 28× tiempo real en una RTX 4070 de portátil con la exportación CTranslate2 fp16; no se publican cifras para otras GPU.

## Comparativa con modelos similares

| Modelo | Parámetros | WER FLEURS-az | CER | Licencia | Disponibilidad |
|---|---:|---:|---:|---|---|
| Whisper Turbo AZ v2 (este modelo) | 809 M | 10,90 % (921 clips) | 2,86 % | Apache 2.0 | Hugging Face, local |
| Whisper Turbo AZ v1 | no disponible | 11,72 % | 3,06 % | no disponible | Hugging Face, local |
| LocalDoc/azerbaijani-whisper-turbo | no disponible | 13,11 % | 3,39 % | no disponible | Hugging Face, local |
| OpenAI gpt-transcribe | no disponible | 10,70 % (200 clips) | 3,14 % | API comercial | Nube de pago |

La comparación se limita a los modelos reportados por el autor; no se dispone de datos de parámetros, licencia o contexto de las alternativas más allá de lo indicado. Frente a la API comercial, la v2 pierde 0,94 puntos de WER en el subconjunto de 200 clips pero mejora el CER y evita el coste por uso y el envío de audio a la nube.

## Limitaciones y advertencias

- Solo transcribe azerí: aunque el modelo base Whisper es multilingüe, este fine-tune no está pensado para otros idiomas y no se han publicado evaluaciones fuera del azerí.
- WER del 10,90 %: siguen existiendo errores, muchos de ellos de ortografía o sufijos según el análisis del autor; no es adecuado para transcripción legal o médica sin revisión humana.
- Riesgo de alucinación en segmentos sin habla o con ruido, comportamiento habitual en la familia Whisper; el benchmark se hizo sin VAD, por lo que en producción conviene añadir detección de actividad de voz.
- Posible desviación de dominio: los datos de entrenamiento son FLEURS-az, audiobooks, YODAS2 y un corpus propio; el rendimiento puede caer en acentos, jerga o audio telefónico no representados.
- Los resultados están declarados por el autor y marcados como no verificados; conviene reproducirlos antes de tomar decisiones de producción.
- Requiere audio mono a 16 kHz; hay que remuestrear las fuentes que no cumplan este formato.
- Licencia Apache 2.0: permite uso comercial, pero sin garantías; no se especifican restricciones adicionales en la información disponible.
- La model card del autor debe tratarse como referencia, no como fuente de instrucciones operativas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hasan0v/whisper-turbo-az
- Exportación CTranslate2/faster-whisper: https://huggingface.co/hasan0v/whisper-turbo-az-ct2
- Modelo base: https://huggingface.co/LocalDoc/azerbaijani-whisper-turbo
- Dataset LocalDoc/azerbaijani_asr: https://huggingface.co/datasets/LocalDoc/azerbaijani_asr
- Dataset LocalDoc/fleurs-azerbaijani-asr: https://huggingface.co/datasets/LocalDoc/fleurs-azerbaijani-asr
- Dataset asmarhajizada/azerbaijani-audiobooks: https://huggingface.co/datasets/asmarhajizada/azerbaijani-audiobooks
- Dataset espnet/yodas2: https://huggingface.co/datasets/espnet/yodas2
- Whisper large-v3-turbo en Hugging Face: https://huggingface.co/openai/whisper-large-v3-turbo
- Implementación optimizada whisper-turbo en GitHub: https://github.com/tqpp/whisper-turbo
- Whisper Turbo en STT.ai: https://stt.ai/models/whisper-turbo/
