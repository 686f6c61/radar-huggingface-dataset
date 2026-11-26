# jmcgomes/MOSS-Audio-8B-Thinking-MLX-4bit

## Resumen

MOSS-Audio-8B-Thinking-MLX-4bit es una conversión a MLX y cuantización a 4 bits del modelo OpenMOSS-Team/MOSS-Audio-8B-Thinking, publicada por el usuario jmcgomes. Se trata de un modelo multimodal de comprensión de audio (audio-text-to-text) orientado a Apple Silicon que procesa no solo habla, sino también efectos de sonido, ambientes, música, tono de voz y voces no humanas, generando descripciones con marcas de tiempo y respondiendo preguntas sobre un clip.

El modelo base lo desarrolla el equipo OpenMOSS y se distribuye bajo licencia Apache-2.0. La conversión mantiene el codificador de audio, el adaptador y los mergers DeepStack en bf16, mientras que las capas lineales del modelo de lenguaje, los embeddings de tokens y el `lm_head` se cuantizan a 4 bits afines con tamaño de grupo 64. El checkpoint resultante ocupa 5,9 GB y consume un pico de 7,1 GB de RAM durante la inferencia.

Es relevante para desarrolladores que trabajan en el ecosistema Apple (MLX, mlx-audio) y necesitan un modelo de comprensión de audio con modo de razonamiento explícito (``) que quepa en memoria unificada de equipos Mac con GPU integrada. El modelo declara 9.052.463.488 parámetros totales según los safetensors del repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo multimodal audio-texto; codificador de audio + adaptador + mergers DeepStack + modelo de lenguaje) |
| Parametros totales | 9.052.463.488 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit affine con group size 64 (lineales del LM, token embeddings y lm_head); codificador de audio, adaptador y mergers DeepStack en bf16 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (formato MLX) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base más allá de su naturaleza multimodal audio-texto. La model card de la conversión describe la composición del pipeline: un codificador de audio cuyos tensores se mantienen en bf16, un adaptador y mergers DeepStack también en bf16, y un modelo de lenguaje cuyos lineales, embeddings y `lm_head` se cuantizan a 4 bits. El autor señala que los tensores de la ruta de audio son idénticos byte a byte a los ports MLX de fredchu y RumiLabs, y que a 8 bits el checkpoint completo comparte el mismo layout que el MOSS-Music 8-bit de FractalSurfer.

No se proporcionan datos sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. El modelo base incorpora un modo de razonamiento que se activa mediante bloques `` antes de emitir la respuesta, lo que constituye la innovación técnica más destacable documentada en la información disponible.

## Capacidades

- Comprensión de audio general: efectos de sonido, ambientes, música, tono de voz, acentos y voces no humanas.
- Generación de descripciones detalladas con marcas de tiempo (precisión de aproximadamente un segundo según el autor).
- Respuesta a preguntas sobre un clip de audio (formato de elección múltiple y preguntas abiertas).
- Modo de razonamiento explícito mediante `` antes de responder.
- Modo sin razonamiento: se puede omitir insertando un bloque think vacío, lo que acelera la inferencia unas 20 veces a costa de perder unos 3 puntos en preguntas y de generar descripciones largas y repetitivas.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Descripción de archivos de audio con marcas de tiempo: el modelo genera descripciones detalladas de escenas sonoras indicando cuándo ocurre cada evento, útil para indexación y catalogación de archivos de sonido o música.
- Etiquetado y análisis de efectos de sonido en producción audiovisual: permite identificar ambientes, efectos y voces no humanas en un clip para tareas de postproducción o archivo.
- Accesibilidad y subtitulado enriquecido: descripción de contenido sonoro no verbal (música, ambientes, efectos) para complementar subtítulos tradicionales en vídeo.
- Preguntas y respuestas sobre audio en aplicaciones de análisis: dado un clip, responder consultas de elección múltiple o abiertas sobre lo que se escucha, con un rendimiento medido del 62 % en elección múltiple en el benchmark del autor.
- Investigación en percepción auditiva y evaluación de modelos: el modo de razonamiento con límite de tokens (alrededor de 250 tokens de pensamiento para preguntas, hasta 850 para descripciones) permite estudiar el efecto del razonamiento en tareas de comprensión de audio.
- Prototipado local en Mac con Apple Silicon: al ocupar 5,9 GB en disco y 7,1 GB de pico de RAM, es viable en equipos Mac con memoria unificada para experimentación sin GPU dedicada, usando mlx-audio.
- Análisis de música (tempo y tonalidad): aunque el autor advierte que tempo y tonalidad no son fiables, el modelo puede emplearse como primera pasada en tareas de análisis musical con verificación posterior.

## Benchmarks y rendimiento

Resultados publicados por el autor en un benchmark propio de 355 ítems (efectos de sonido, ambientes, música, entrega de voz, acentos, voces no humanas y escenas con tiempos), con decodificación greedy:

| Modelo | Elección múltiple (298) | Descripciones detalladas, 12 escenas (eventos detectados) |
|---|---|---|
| Este modelo, 8-bit, thinking | 59 % | ~43 / 60 |
| Este modelo, 4-bit, thinking | 62 % | ~32 / 60 |
| Este modelo, thinking off | 59 % | largas y repetitivas |
| Gemini 3.8 Flash (medium) | 58 % | — |
| Gemini 4 Hydrogen (low) | 69 % | ~45 / 60 |

Notas del autor: 8-bit y 4-bit son equivalentes en preguntas (McNemar p = 0,85 con el mismo modo de thinking); en descripciones abiertas el 4-bit es claramente peor (a veces entra en bucle o pierde la mayor parte de la escena). Las respuestas dejan de mejorar a partir de unos 250 tokens de pensamiento; las descripciones usan hasta unos 850, por lo que un límite de 1.024 solo captura bucles descontrolados (aproximadamente el 1 % de las preguntas).

Rendimiento de inferencia declarado: 87 tokens/s en decodificación sobre M5 Max con GPU de 32 núcleos.

## Requisitos de hardware

- VRAM/RAM estimada: 7,1 GB de pico de RAM en la configuración 4-bit; el checkpoint ocupa 5,9 GB en disco.
- GPU recomendadas: Apple Silicon con GPU integrada; el dato de rendimiento se midió en un M5 Max con GPU de 32 núcleos (87 tokens/s).
- Cabe en consumer GPU: el modelo está pensado para memoria unificada de Apple Silicon; no se proporcionan datos para GPUs NVIDIA de consumo.
- Opciones de despliegue: mlx-audio (probado con la versión 0.6.8), cargando el modelo con `mlx_audio.stt.load`. No se documentan otras opciones (vLLM, llama.cpp, Ollama, TGI) en la información disponible.
- Latencia y throughput: 87 tokens/s en decodificación sobre M5 Max (32-core GPU); el modo sin razonamiento es aproximadamente 20 veces más rápido que el modo con razonamiento.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| jmcgomes/MOSS-Audio-8B-Thinking-MLX-4bit | 9.052.463.488 | no disponible | Apache-2.0 | Hugging Face (MLX, 4-bit) | 62 % en elección múltiple en benchmark del autor; 7,1 GB pico de RAM |
| OpenMOSS-Team/MOSS-Audio-8B-Thinking | no disponible | no disponible | Apache-2.0 | Hugging Face (modelo base) | Modelo original sin cuantizar; referencia de partida |
| MOSS-Music 8-bit de FractalSurfer (MLX) | no disponible | no disponible | no disponible | Hugging Face | Mismo layout de checkpoint a 8 bits según el autor |
| Ports MLX de fredchu y RumiLabs | no disponible | no disponible | no disponible | Hugging Face | Tensores de la ruta de audio idénticos byte a byte según el autor |

No se dispone de datos de benchmarks comparables para los ports alternativos ni para el modelo base en la información proporcionada.

## Limitaciones y advertencias

- El 4-bit degrada claramente las descripciones abiertas respecto al 8-bit: puede entrar en bucles o perder la mayor parte de una escena (eventos detectados ~32/60 frente a ~43/60).
- Tempo y tonalidad musical no son fiables según el autor.
- Las fuentes de sonido a veces se identifican mal (por ejemplo, un crujido de puerta confundido con un motor), aunque las marcas de tiempo son buenas con precisión de aproximadamente un segundo.
- Sin razonamiento, las descripciones se vuelven largas y repetitivas; el modo thinking consume más tokens (hasta ~850 en descripciones) y es unas 20 veces más lento.
- No se documentan sesgos conocidos ni riesgos de alucinación específicos más allá de los errores de identificación de fuentes descritos.
- Idiomas soportados no disponibles; no se puede confirmar cobertura multilingüe.
- Licencia Apache-2.0, igual que el modelo original, por lo que el uso comercial está permitido bajo los términos de dicha licencia; se recomienda revisar las condiciones del modelo base.
- Conversión de terceros (usuario jmcgomes) con 0 descargas y 1 like en el momento de la consulta: madurez y mantenimiento no verificables.
- Despliegue limitado al ecosistema MLX/mlx-audio; no se documentan otras rutas de inferencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jmcgomes/MOSS-Audio-8B-Thinking-MLX-4bit
- Modelo base: https://huggingface.co/OpenMOSS-Team/MOSS-Audio-8B-Thinking
- Informe técnico MOSS-Audio (arXiv 2606.01802): https://arxiv.org/abs/2606.01802
- mlx-audio (repositorio): https://github.com/Blaizzy/mlx-audio
