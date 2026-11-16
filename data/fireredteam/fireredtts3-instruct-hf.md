# FireRedTeam/FireRedTTS3-Instruct-HF

## Resumen

FireRedTTS3-Instruct-HF es un checkpoint de síntesis de voz (text-to-speech) desarrollado por FireRedTeam, un ajuste fino del modelo base FireRedTTS3 orientado a la inferencia mediante SGLang Omni. El modelo resuelve la generación de audio de alta calidad a partir de texto, incorporando clonación de voz por audio de referencia, diseño de voz guiado por instrucciones en lenguaje natural, edición semántica y edición acústica. Su relevancia actual radica en que combina control fino sobre el habla generada con un pipeline de despliegue eficiente en producción.

Con 2.118.795.329 parámetros totales (aproximadamente 2,1 mil millones) y pesos en formato safetensors, el modelo produce audio mono a 24 kHz, con respuestas WAV y streaming PCM disponibles a través de la API compatible `/v1/audio/speech`. El repositorio ocupa 12,3 GB, lo que incluye configuración, tokenizador y assets auxiliares como el directorio `redae/`, necesarios para la carga completa.

La licencia Apache 2.0 facilita su adopción tanto en investigación como en productos comerciales. Al estar diseñado específicamente para SGLang Omni, el modelo se posiciona como una pieza de infraestructura de TTS desplegable mediante servidor, con soporte para múltiples tareas de edición y síntesis en una única API unificada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de TTS basado en FireRedTTS3; integrado en SGLang Omni) |
| Parámetros totales | 2.118.795.329 (~2,1 B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (los ejemplos de la model card incluyen inglés y chino) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo completo con configuración, tokenizador y `redae/`) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna en la model card disponible. El modelo es un ajuste fino (finetune) del checkpoint FireRedTTS3 de FireRedTeam, y se distribuye como un checkpoint específico para inferencia con SGLang Omni. La card documenta el flujo de carga y servicio, no la composición del dataset de entrenamiento, el número de tokens ni si se emplearon técnicas como RLHF o DPO.

La innovación técnica destacable a nivel de sistema es la integración con SGLang Omni, que permite servir el modelo como endpoint HTTP compatible con `/v1/audio/speech`, con soporte de tareas diferenciadas (`Base`/clonación, `VoiceDesign`, `SemanticEdit`, `AcousticEdit`), control mediante semilla (`seed`) para reproducibilidad, y edición acústica nativa con parámetros como `speed`. La edición semántica emplea máscaras de edición sobre el texto (visibles en la cabecera `x-gen-text`), y la edición acústica sigue plantillas entrenadas (por ejemplo, `"shift the pitch by 2 steps"` o `"adjust the volume to 0.8"`) en lugar de instrucciones libres.

## Capacidades

- Síntesis de voz (text-to-speech) con salida de audio mono a 24 kHz.
- Clonación de voz mediante audio de referencia y su transcripción real (tarea `Base`).
- Diseño de voz guiado por instrucciones en lenguaje natural, sin audio de referencia (tarea `VoiceDesign`).
- Edición semántica de una grabación de referencia, incluyendo sustituciones de palabras mediante el formato `Replace 'origen' con 'destino'` (tarea `SemanticEdit`).
- Edición acústica de la grabación de referencia: velocidad (`speed`), tono y volumen mediante plantillas entrenadas (tarea `AcousticEdit`).
- Salida WAV y streaming PCM a través de la API `/v1/audio/speech`.
- Control de reproducibilidad mediante semilla (`seed`).
- Capacidades multilingües: los ejemplos de la card muestran inglés y chino; no se detalla la lista completa de idiomas.

## Casos de uso

- Clonación de voz para locuciones personalizadas: se proporciona una grabación de referencia y su transcripción, y el modelo genera nuevas locuciones con la misma identidad vocal, útil para audiolibros o doblaje con voz consistente.
- Diseño de voces para personajes o asistentes: la tarea `VoiceDesign` permite generar una voz a partir de una descripción (por ejemplo, "voz femenina joven, tono suave, ritmo pausado") sin necesidad de muestras, adecuado para prototipado rápido de asistentes conversacionales.
- Producción de contenido en varios idiomas: los ejemplos en inglés y chino sugieren su uso para generar audio localizado en distintos mercados dentro de un mismo pipeline.
- Postproducción de audio: la edición acústica permite ajustar velocidad, tono y volumen de una grabación existente de forma nativa, reduciendo la necesidad de herramientas externas de procesado.
- Corrección de contenido hablado: la edición semántica permite sustituir palabras concretas en una grabación (por ejemplo, cambiar "birthday" por "anniversary") manteniendo la voz y el estilo del original.
- Servicio de TTS en producción: el despliegue con SGLang Omni expone un endpoint HTTP con streaming PCM, integrable en aplicaciones de lectura de textos, accesibilidad o interfaces de voz.
- Generación de audio para asistentes y agentes conversacionales: la API unificada permite alternar entre síntesis, clonación y edición en un mismo servidor, simplificando la arquitectura de aplicaciones con múltiples modos de voz.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- GPU NVIDIA con CUDA y Linux; Python 3.12 según la guía de instalación de SGLang Omni.
- Se requiere compilación y warmup inicial, que puede tardar varios minutos antes de que `/health` devuelva HTTP 200.
- VRAM estimada: no disponible en la información proporcionada. Con ~2,1 B parámetros, el peso en precisión completa ronda los 4-5 GB, pero la card no especifica requisitos de memoria ni cuantizaciones soportadas.
- GPU recomendadas: no disponible (la card solo exige una GPU NVIDIA CUDA; no detalla modelos concretos como A100, H100 o RTX 4090).
- Despliegue: SGLang Omni (`sgl-omni serve`) con configuración `examples/configs/firered_tts3_instruct.yaml`; requiere los prerequisitos de CUDA, UCX y FlashAttention.
- Latencia y throughput: no disponibles.
- Es necesario descargar el repositorio completo (configuración, tokenizador y `redae/`), no solo `model.safetensors`.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| FireRedTTS3-Instruct-HF | ~2,1 B | no disponible | Apache 2.0 | Hugging Face (checkpoint para SGLang Omni) | Clonación, diseño de voz y edición semántica/acústica |
| FireRedTTS3 (base) | no disponible | no disponible | Apache 2.0 | Hugging Face y GitHub de FireRedTeam | Modelo original del que deriva este checkpoint |
| Otras alternativas de TTS | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la información proporcionada |

## Limitaciones y advertencias

- La model card no documenta sesgos conocidos del modelo; al ser un sistema de clonación de voz, existe riesgo de uso indebido (suplantación de identidad), por lo que conviene aplicar controles de consentimiento y verificación en producción.
- Riesgo de alucinación o artefactos en el audio generado no cuantificado en la información disponible; se recomienda validar siempre el audio renderizado.
- En edición semántica, el texto objetivo puede aparecer solo en el audio y no en la cabecera `x-gen-text`; es necesario verificar la transcripción del audio resultante. Las sustituciones requieren el formato entrecomillado `Replace 'origen' con 'destino'`; sin comillas no se realizó el reemplazo en las pruebas del autor.
- Las instrucciones acústicas deben seguir las plantillas entrenadas, no descripciones libres; una cadena `instructions` explícita tiene prioridad sobre la instrucción de velocidad compuesta.
- El campo `speed` solo aplica a `AcousticEdit`; no afecta a clonación ni a diseño de voz.
- El valor `tts` no es un nombre de tarea aceptado en el servicio; para clonación se omite `task_type` o se usa `Base`.
- La lista completa de idiomas soportados no está disponible; los ejemplos cubren inglés y chino.
- El checkpoint depende de una revisión de SGLang Omni que contenga la integración de FireRedTTS3; versiones antiguas de PyPI o checkouts previos no incluyen el modelo.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las condiciones del modelo base FireRedTTS3 y de los assets incluidos.

## Enlaces

- Hugging Face (este checkpoint): https://huggingface.co/FireRedTeam/FireRedTTS3-Instruct-HF
- Checkpoint temporal para pruebas de PR: https://huggingface.co/CKermit/FireRedTTS3-Instruct
- Checkpoint oficial previsto: https://huggingface.co/FireRedTeam/FireRedTTS3-Instruct
- Modelo base y model card original: https://huggingface.co/FireRedTeam/FireRedTTS3
- Código fuente de FireRedTTS3: https://github.com/FireRedTeam/FireRedTTS3
- SGLang Omni (repositorio): https://github.com/sgl-project/sglang-omni
- Guía de instalación de SGLang Omni: https://github.com/sgl-project/sglang-omni/blob/main/docs/get_started/installation.md
