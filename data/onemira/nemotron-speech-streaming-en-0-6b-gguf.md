# onemira/nemotron-speech-streaming-en-0.6b-gguf

## Resumen

`onemira/nemotron-speech-streaming-en-0.6b-gguf` es un espejo (mirror) byte a byte del artefacto GGUF Q8_0 oficial de NVIDIA correspondiente al modelo de reconocimiento automático del habla (ASR) `nvidia/nemotron-speech-streaming-en-0.6b`. No se trata de un modelo entrenado por OneMira: la autoría original es de NVIDIA y los bytes del modelo no han sido modificados. El repositorio contiene únicamente el fichero GGUF seleccionado (`nemotron-speech-streaming-en-0.6b.q8_0.gguf`, 699.872.960 bytes, SHA-256 `d9a01898d2a611c8764e23a1c2f45e70bbd5a425dc4de93692ac951dd603812d`), no el checkpoint completo de entrenamiento.

El modelo resuelve el problema de la transcripción de voz en inglés con baja latencia y en modo streaming, pensado para ejecutarse en local (on-device) sin subir audio a la nube. Con 628.356.737 parámetros totales (aproximadamente 0,6 B), está diseñado para caber en dispositivos con recursos limitados y ofrecer transcripción en tiempo real durante reuniones y llamadas. Su relevancia actual radica en el creciente interés por pipelines de voz totalmente locales y privados, donde el audio nunca abandona el dispositivo.

El artefacto está empaquetado para el runtime `NeMo-Speech.cpp` en formato GGUF con cuantización Q8_0, lo que facilita su despliegue en entornos de inferencia ligeros. La licencia aplicable es la NVIDIA Open Model License, que rige tanto el modelo original como este espejo. El espejo está mantenido por OneMira para su producto de grabadora de voz con IA (OneMira C1) y su aplicación de escritorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo ASR de NVIDIA; la model card no detalla la arquitectura interna) |
| Parametros totales | 628.356.737 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0 (GGUF); no se listan otras cuantizaciones en la informacion disponible |
| Idiomas soportados | inglés (según el nombre del modelo y la descripción de "English Streaming ASR"); no se detalla la lista completa |
| Licencia | nvidia-open-model-license (NVIDIA Open Model License) |
| Formato de pesos | GGUF (`nemotron-speech-streaming-en-0.6b.q8_0.gguf`) |
| Tamano del repo | 0,7 GB |
| Runtime recomendado | NeMo-Speech.cpp |
| Revision upstream | `ebe59e5a817142986528bbbee5dba8db7b38ed50` |
| SHA-256 del fichero | `d9a01898d2a611c8764e23a1c2f45e70bbd5a425dc4de93692ac951dd603812d` |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo (tipo de encoder/decoder, mecanismo de atención, etc.). Se trata de un modelo de NVIDIA para reconocimiento automático del habla en modo streaming, con 628.356.737 parámetros, lo que lo sitúa en la categoría de modelos ASR compactos orientados a inferencia en dispositivo. El nombre del modelo indica explícitamente capacidad de streaming, es decir, transcripción incremental a medida que llega el audio, en lugar de procesar un fichero completo de una vez.

No se dispone de datos sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF/DPO (poco habituales en modelos ASR). Tampoco se documentan innovaciones técnicas específicas como decodificación especulativa o atención lineal. El artefacto distribuido en este repositorio es una cuantización Q8_0 del checkpoint original de NVIDIA, generada por NVIDIA y espejada sin modificación por OneMira. Para detalles de entrenamiento debe consultarse la model card upstream de NVIDIA.

## Capacidades

- Reconocimiento automático del habla (ASR) en inglés.
- Transcripción en modo streaming de baja latencia, adecuada para audio en vivo.
- Ejecución local en dispositivo (on-device) tras la descarga inicial del modelo, sin subida obligatoria de audio a la nube.
- Funcionamiento offline, sin límite recurrente de minutos según la descripción del mantenedor.
- Integración en pipelines de reuniones y llamadas con auriculares para transcripción en tiempo real.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión ni audio más allá de la transcripción.

## Casos de uso

- Transcripción de reuniones en vivo: el modelo procesa el audio en streaming y genera texto incremental durante la reunión, lo que permite actas y notas en tiempo casi real sin enviar audio a servidores externos.
- Llamadas con auriculares: al ejecutarse en local con baja latencia, puede transcribir conversaciones telefónicas o de voz sobre IP directamente en el dispositivo del usuario, preservando la privacidad.
- Grabadora de voz con IA: integrado en el pipeline de la OneMira C1, proporciona la etapa de ASR local para después aplicar resumen y extracción de acciones con un LLM local.
- Notas de entrevistas y periodismo: grabación y transcripción offline en portátiles, útil en entornos sin conectividad fiable o con requisitos de confidencialidad.
- Subtitulado local de contenido en inglés: generación de subtítulos para vídeo o audio pregrabado ejecutando el modelo en el propio equipo.
- Asistentes de voz privados: como etapa de entrada de voz en aplicaciones de escritorio que necesitan dictado o comandos por voz sin depender de APIs en la nube.
- Cumplimiento y sectores regulados: transcripción de audio sensible (salud, legal) manteniendo los datos en la máquina del usuario, con retención controlada del audio original en WAV estéreo según el ecosistema del mantenedor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada: el fichero GGUF Q8_0 ocupa aproximadamente 0,7 GB (699.872.960 bytes), por lo que la inferencia requiere en torno a 1 GB de memoria, dependiendo del runtime y del búfer de audio.
- GPU recomendadas: no se especifican en la información disponible. Por tamaño, el modelo es apto para GPUs de consumo y para ejecución en CPU.
- GPU de consumo: cabe holgadamente en cualquier GPU consumer moderna (por ejemplo, series RTX 30/40) e incluso en equipos sin GPU dedicada, dado su tamaño inferior a 1 GB en Q8_0.
- Opciones de despliegue: el runtime indicado es `NeMo-Speech.cpp` con GGUF Q8_0. No se confirma compatibilidad con vLLM, llama.cpp, Ollama o TGI en la información proporcionada.
- Latencia y throughput: no disponibles. La model card enfatiza el diseño para baja latencia en streaming, pero no aporta cifras.

## Comparativa con modelos similares

No se dispone en la información proporcionada de datos de rendimiento ni de especificaciones completas de modelos alternativos que permitan una comparativa rigurosa. Se indica "no disponible".

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| nemotron-speech-streaming-en-0.6b (este espejo) | 628.356.737 | no disponible | NVIDIA Open Model License | GGUF Q8_0 | ASR streaming en inglés, on-device |
| Alternativas ASR comparables | no disponible | no disponible | no disponible | no disponible | Sin datos en la informacion disponible |

## Limitaciones y advertencias

- Modelo orientado a inglés: el nombre y la descripción indican inglés; no se documenta soporte multilingüe para esta variante.
- Es un espejo, no un modelo original: la autoría es de NVIDIA y este repositorio no implica respaldo de NVIDIA hacia OneMira.
- Solo se distribuye el artefacto GGUF Q8_0; no contiene el checkpoint completo de entrenamiento ni otras cuantizaciones.
- La licencia NVIDIA Open Model License impone términos específicos; debe revisarse antes de uso comercial. No es una licencia de código abierto estándar (OSI).
- No se documentan sesgos, tasas de alucinación ni métricas de error (WER) en la información disponible.
- El rendimiento en producción dependerá del runtime `NeMo-Speech.cpp` y de la calidad del audio de entrada; no hay cifras publicadas de latencia ni throughput.
- La model card incluye contenido promocional del producto del mantenedor; no debe interpretarse como evaluación técnica independiente.
- No se confirma compatibilidad con runtimes de inferencia distintos de NeMo-Speech.cpp.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/onemira/nemotron-speech-streaming-en-0.6b-gguf
- Modelo original de NVIDIA: https://huggingface.co/nvidia/nemotron-speech-streaming-en-0.6b
- Revisión upstream concreta: https://huggingface.co/nvidia/nemotron-speech-streaming-en-0.6b/tree/ebe59e5a817142986528bbbee5dba8db7b38ed50
- Licencia NVIDIA Open Model License: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-open-model-license/
- Producto OneMira C1: https://onemira.com/products/c1
- Comparativas del mantenedor: https://onemira.com/compare
- Guía de grabadora sin suscripción: https://onemira.com/ai-voice-recorder-without-subscription
- Dataset TCO del mantenedor: https://huggingface.co/datasets/onemira/ai-voice-recorder-without-subscription-2026
- Servidor MCP OKF Wiki: https://github.com/onemira-space/okf-wiki-mcp
