# loom-ai-org/qwen3-asr-0.6b-loom

## Resumen

El modelo `loom-ai-org/qwen3-asr-0.6b-loom` es una exportación del modelo de reconocimiento automático de voz (ASR) `Qwen/Qwen3-ASR-0.6B` de Alibaba, realizada por Loom AI para su motor de inferencia `loom.cpp`. Se distribuye como un único archivo GGUF autocontenido que incluye las topologías de grafo, el tokenizador y el script de control necesarios para su ejecución, sin depender de la pila de Transformers. Los pesos no están modificados; solo se ha cambiado el formato de empaquetado.

El modelo original forma parte de la familia Qwen3-ASR, que también incluye la variante de 1.7B, y está construido sobre la base de comprensión de audio de Qwen3-Omni. Soporta identificación de idioma y transcripción de voz en 30 idiomas listados (52 si se cuentan los dialectos chinos), con robustez en audio desafiante como voz limpia, canto y canciones. Con aproximadamente 782 millones de parámetros, es una opción compacta para tareas de ASR multilingüe en entornos con recursos limitados.

La relevancia de esta versión radica en su formato GGUF, que permite ejecutarlo con `loom-py` y `loom.cpp` en CPU o GPU sin necesidad de frameworks pesados, facilitando su integración en aplicaciones de producción. La licencia Apache 2.0 permite uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (basado en Qwen3-Omni, sin detalle público) |
| Parametros totales | 782.783.343 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (GGUF, sin especificar nivel) |
| Idiomas soportados | zh, en, yue, ar, de, fr, es, pt, id, it, ko, ru, th, vi, ja, tr, hi, ms, nl, sv, da, fi, pl, cs, fil, fa, el, hu, mk, ro |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (exportación loom.cpp) |

## Arquitectura y entrenamiento

La arquitectura interna no se detalla en la información disponible. Se sabe que el modelo base, Qwen3-ASR-0.6B, se apoya en la capacidad de comprensión de audio de Qwen3-Omni, pero no se publican especificaciones sobre el tipo de red (transformer, encoder-decoder, etc.) ni sobre el proceso de entrenamiento. No hay datos sobre el número de tokens de entrenamiento, composición del dataset o uso de técnicas como RLHF o DPO.

Esta versión concreta es una exportación técnica: los pesos originales se han convertido al formato GGUF de loom.cpp mediante la herramienta `loom-exporter`. El archivo resultante incluye un driver que define cómo se procesa el audio de entrada (mono, 16 kHz) y cómo se generan las transcripciones. No se han introducido modificaciones en los pesos ni en el comportamiento del modelo.

## Capacidades

- Reconocimiento automático de voz (ASR) multilingüe: transcribe audio en 30 idiomas listados, más 22 dialectos chinos (52 en total según la documentación del proyecto original).
- Identificación de idioma: el modelo detecta automáticamente el idioma hablado en el audio, aunque no acepta un argumento `language=` explícito; si se pasa, se ignora.
- Robustez en audio desafiante: funciona con voz limpia, canto y canciones, según la documentación de OpenASR.
- Generación de marcas de tiempo: el modelo no emite tokens de timestamp; el resultado devuelve un único segmento que cubre todo el clip, y el campo `timestamped` es `False`.
- Sin capacidades de tool calling, agentes, visión ni modo de razonamiento: es exclusivamente un modelo de audio a texto.

## Casos de uso

- Transcripción de reuniones y entrevistas: el modelo puede convertir grabaciones de audio en texto en varios idiomas, lo que facilita la generación de actas y resúmenes. Su tamaño compacto permite ejecutarlo en servidores modestos o incluso en portátiles.
- Subtitulado automático de vídeos: al aceptar audio de 16 kHz, puede integrarse en pipelines de procesamiento de vídeo para generar subtítulos en los idiomas soportados, reduciendo costes frente a servicios externos.
- Asistentes de voz para aplicaciones de bajo consumo: al ser un GGUF autocontenido, se puede desplegar en dispositivos con recursos limitados (Raspberry Pi, edge devices) para comandos de voz o dictado.
- Análisis de llamadas de atención al cliente: transcripción de grabaciones de centros de contacto para su posterior análisis de sentimiento o búsqueda de palabras clave, con soporte multilingüe.
- Accesibilidad para personas con discapacidad auditiva: conversión en tiempo real de audio a texto en aplicaciones de comunicación, gracias a su baja latencia en hardware adecuado.
- Archivado y búsqueda de contenido multimedia: transcripción de podcasts, audiolibros o archivos de radio para indexación y búsqueda textual, aprovechando la licencia Apache 2.0 para uso comercial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni métricas específicas de ASR como WER (Word Error Rate) para este modelo o su versión base.

## Requisitos de hardware

- El modelo tiene aproximadamente 782 millones de parámetros, lo que en FP16 ocuparía alrededor de 1,5 GB de memoria. En formato GGUF cuantizado, el uso de VRAM podría ser menor, pero no se especifican los niveles de cuantización disponibles.
- Al ser una exportación de loom.cpp, puede ejecutarse en CPU y GPU. No se proporcionan requisitos mínimos oficiales.
- Para inferencia en GPU, una tarjeta con 4 GB de VRAM (por ejemplo, GTX 1650, RTX 3050) sería suficiente para la mayoría de los casos, aunque no hay datos de latencia o throughput.
- Opciones de despliegue: `loom-py` (paquete Python) y `loom.cpp` (motor C++). No es compatible directamente con vLLM, Ollama o TGI, ya que usa su propio formato y runtime.
- Se recomienda consultar la documentación de loom.cpp para conocer los requisitos exactos de compilación y ejecución.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| loom-ai-org/qwen3-asr-0.6b-loom | 782M | No disponible | 30 (52 con dialectos) | Apache 2.0 | GGUF (loom.cpp) |
| Qwen/Qwen3-ASR-1.7B | 1.7B | No disponible | 52 | Apache 2.0 | Transformers / GGUF |
| OpenAI Whisper tiny | 39M | No disponible | 57 | MIT | Transformers / GGUF |
| OpenAI Whisper base | 74M | No disponible | 57 | MIT | Transformers / GGUF |

La comparativa se limita a parámetros y licencia, ya que no hay datos de rendimiento disponibles. El modelo de Loom AI es más grande que Whisper tiny/base, pero más pequeño que Qwen3-ASR-1.7B. Su ventaja principal es el formato GGUF autocontenido para loom.cpp, que simplifica el despliegue en entornos sin dependencias de Python pesadas.

## Limitaciones y advertencias

- No se han publicado evaluaciones de sesgos ni de tasas de error (WER) para este modelo, por lo que su rendimiento en dominios específicos (acentos, ruido, jerga técnica) es desconocido.
- Riesgo de alucinación: como todo modelo de ASR, puede generar transcripciones incorrectas o inventar palabras, especialmente en audio de baja calidad o con solapamiento de voces.
- Limitaciones de idioma: aunque cubre 30 idiomas, no incluye todos los idiomas del mundo; los dialectos chinos se cuentan aparte. El modelo no acepta un parámetro de idioma, por lo que la identificación es automática y puede fallar en hablantes bilingües o con acentos muy marcados.
- Sin marcas de tiempo reales: el modelo no emite timestamps, por lo que no es adecuado para aplicaciones que requieran segmentación temporal precisa (por ejemplo, subtitulado sincronizado).
- Dependencia del ecosistema loom: al ser un formato propietario de loom.cpp, no es compatible con herramientas estándar como Hugging Face Transformers, vLLM u Ollama. Requiere instalar `loom-py-rt` y usar su API específica.
- La licencia Apache 2.0 permite uso comercial, pero se debe mantener el aviso de copyright y las condiciones de la licencia en las redistribuciones.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/loom-ai-org/qwen3-asr-0.6b-loom)
- [Repositorio loom.cpp](https://github.com/loom-ai-org/loom.cpp)
- [Repositorio loom-py](https://github.com/loom-ai-org/loom-py)
- [Repositorio loom-exporter](https://github.com/loom-ai-org/loom-exporter)
- [Repositorio oficial Qwen3-ASR](https://github.com/QwenLM/Qwen3-ASR)
- [Ficha en OpenASR](https://openasr.org/models/qwen3-asr-0.6b/)
