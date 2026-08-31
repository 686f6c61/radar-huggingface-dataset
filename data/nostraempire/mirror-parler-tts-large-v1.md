# NostraEmpire/mirror-parler-tts-large-v1

## Resumen

Parler-TTS Large v1 es un modelo de síntesis de voz (text-to-speech) de 2.200 millones de parámetros desarrollado por el equipo de Hugging Face dentro del proyecto Parler-TTS. Este mirror, publicado por NostraEmpire, replica íntegramente los pesos del checkpoint original `parler-tts/parler-tts-large-v1` bajo licencia Apache 2.0. El modelo genera voz natural y de alta calidad a partir de texto, con la particularidad de que las características acústicas (género, ruido de fondo, velocidad, tono y reverberación) se controlan mediante una descripción en lenguaje natural, sin necesidad de referencias de audio.

Entrenado sobre 45.000 horas de audio procedente de los datasets MLS English y LibriTTS-R filtrados y anotados, el modelo es una reproducción del trabajo descrito en el paper *Natural language guidance of high-fidelity text-to-speech with synthetic annotations* de Dan Lyth y Simon King (Stability AI y Universidad de Edimburgo). Su relevancia actual radica en que es una de las pocas soluciones TTS completamente abiertas: pesos, código de entrenamiento, datasets y utilidades de preprocesado se publican bajo licencias permisivas, lo que permite a la comunidad fine-tuning y despliegue en producción sin restricciones comerciales.

El checkpoint soporta además la selección de 34 hablantes concretos por nombre (Jon, Lea, Gary, Jenna, Mike, Laura, etc.), lo que garantiza consistencia de voz entre generaciones. El modelo se integra con la librería `transformers` y el paquete `parler-tts`, y su inferencia puede optimizarse con SDPA, `torch.compile`, batching y streaming.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer condicional para generación de audio (encoder-decoder) |
| Parametros totales | 2.333.013.362 (2,2 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin cuantizaciones publicadas) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura exacta no se detalla en la documentación pública, pero se trata de un modelo transformer de generación condicional de audio con dos entradas: una descripción textual de las características de la voz y el prompt de texto a sintetizar. El modelo procesa ambas secuencias mediante tokenizadores y genera directamente la forma de onda de audio muestreada a la frecuencia configurada en `model.config.sampling_rate`. No se especifica si emplea atención lineal, decodificación especulativa u otras innovaciones; la documentación menciona únicamente el uso de SDPA y `torch.compile` para acelerar la inferencia.

El entrenamiento se realizó sobre 45.000 horas de audio, combinando los datasets `parler-tts/mls_eng` y `parler-tts/libritts_r_filtered`, ambos anotados con descripciones de hablante generadas sintéticamente mediante el pipeline Data-Speech. El modelo fue entrenado para predecir el audio a partir de la descripción y el texto, sin emplear RLHF ni DPO. La reproducción del paper original de Lyth y King incluye el uso de anotaciones sintéticas para describir atributos acústicos, lo que permite el control fino de la prosodia mediante puntuación (por ejemplo, comas para pausas breves).

## Capacidades

- Generación de voz natural y de alta calidad a partir de texto en inglés.
- Control de características acústicas mediante descripción en lenguaje natural: género, ruido de fondo, velocidad de habla, tono y reverberación.
- Selección de hablante específico por nombre entre 34 voces predefinidas (Jon, Lea, Gary, Jenna, Mike, Laura, etc.).
- Control de prosodia mediante puntuación: uso de comas para introducir pausas breves.
- Generación de audio con calidad variable según la descripción: "very clear audio" produce la máxima calidad, "very noisy audio" introduce altos niveles de ruido de fondo.
- Soporte de inferencia optimizada con SDPA, `torch.compile`, batching y streaming.
- Integración nativa con la librería `transformers` y el paquete `parler-tts`.
- No soporta tool calling, agentes ni razonamiento multi-paso, al ser un modelo exclusivamente TTS.

## Casos de uso

- Audiolibros y narración automatizada: el modelo puede generar narraciones con voces consistentes y control de ritmo y tono, adecuadas para producción de audiolibros en inglés. La selección de hablante por nombre garantiza uniformidad entre capítulos.
- Asistentes de voz y chatbots con voz natural: integrado en un pipeline de diálogo, permite generar respuestas habladas con características de voz configurables dinámicamente según el contexto del usuario (por ejemplo, tono más calmado en situaciones de estrés).
- Generación de contenido para vídeo y multimedia: locuciones para vídeos de YouTube, tutoriales o anuncios, con control de reverberación y ruido de fondo para adaptarse al entorno de reproducción.
- Pruebas de accesibilidad y lectura de pantalla: síntesis de voz para personas con discapacidad visual, con la posibilidad de ajustar velocidad y claridad mediante la descripción textual.
- Desarrollo de aplicaciones de aprendizaje de idiomas: generación de ejemplos de pronunciación con diferentes voces y estilos, útil para ejercicios de listening y speaking.
- Investigación en síntesis de voz: al ser completamente open source, sirve como base para experimentos de fine-tuning, estudio de control prosódico y comparación con otros modelos TTS.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de métricas objetivas como MOS (Mean Opinion Score), WER de inteligibilidad o comparativas cuantitativas con otros modelos TTS en la documentación del modelo ni en los resultados de búsqueda web.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 9 GB según fuentes externas (Spanvero), lo que permite ejecución en GPUs consumer de gama alta.
- GPU recomendadas: RTX 3090, RTX 4090, A100, H100 o cualquier GPU con al menos 9-10 GB de VRAM.
- Cabe en GPUs consumer: sí, en tarjetas con 10 GB o más de VRAM (por ejemplo, RTX 3080/3090/4090).
- Opciones de despliegue: mediante la librería `parler-tts` con `transformers`, soportando SDPA, `torch.compile`, batching y streaming. También puede ejecutarse en CPU, aunque con mayor latencia.
- Latencia y throughput: no disponible. No se han publicado mediciones oficiales de latencia o throughput.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Control por descripción | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Parler-TTS Large v1 | 2,2 B | no disponible | Sí (lenguaje natural) | Apache 2.0 | Hugging Face, código abierto |
| Bark (Suno) | ~6 B | no disponible | No (requiere prompts de audio o tokens) | MIT (con restricciones para Suno) | Hugging Face, código abierto |
| XTTS v2 (Coqui) | ~1,6 B | no disponible | No (requiere clip de referencia) | CPML (no comercial) | Hugging Face, código abierto |
| VITS | ~30 M | no disponible | No (solo texto) | MIT | Hugging Face, código abierto |

La comparativa se basa en características públicas conocidas; no se dispone de datos de rendimiento objetivo para una comparación cuantitativa. Parler-TTS destaca por su control mediante lenguaje natural y su licencia Apache 2.0, que permite uso comercial sin restricciones, a diferencia de XTTS v2.

## Limitaciones y advertencias

- Idioma limitado: el modelo solo soporta inglés; no es adecuado para síntesis en otros idiomas sin fine-tuning.
- Riesgo de alucinación acústica: como todo modelo generativo, puede producir artefactos o pronunciaciones incorrectas en textos ambiguos o con nombres propios poco comunes.
- Control de voz limitado a los atributos entrenados: aunque la descripción permite ajustar género, ruido, velocidad, tono y reverberación, no es posible controlar otros aspectos como acento regional o emociones complejas.
- Dependencia de la calidad de la descripción: la calidad del audio resultante depende en gran medida de la precisión de la descripción textual; descripciones vagas pueden producir resultados subóptimos.
- Requisitos de hardware: aunque cabe en GPUs consumer, la inferencia en CPU es lenta y no recomendada para producción en tiempo real.
- Este mirror de NostraEmpire no añade modificaciones sobre el checkpoint original; cualquier actualización o corrección del modelo original debe seguirse en `parler-tts/parler-tts-large-v1`.
- No se han publicado evaluaciones de sesgos o comportamientos no deseados en la documentación disponible.

## Enlaces

- Modelo original: https://huggingface.co/parler-tts/parler-tts-large-v1
- Mirror de NostraEmpire: https://huggingface.co/NostraEmpire/mirror-parler-tts-large-v1
- Repositorio Parler-TTS: https://github.com/huggingface/parler-tts
- Repositorio Data-Speech: https://github.com/huggingface/dataspeech
- Paper original: https://www.text-description-to-speech.com
- Guía de inferencia optimizada: https://github.com/huggingface/parler-tts/blob/main/INFERENCE.md
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/parler-tts/parler_tts
