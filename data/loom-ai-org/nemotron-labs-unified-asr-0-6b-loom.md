# loom-ai-org/nemotron-labs-unified-asr-0.6b-loom

## Resumen

Nemotron-Labs-Unified-ASR 0.6B es un modelo de reconocimiento automático del habla (ASR) desarrollado por NVIDIA, exportado al ecosistema loom.cpp por loom-ai-org. Combina un encoder FastConformer con un decoder RNN-T y prompting de identificación de idioma para cubrir 25 lenguas europeas, con salida que incluye puntuación y capitalización. El modelo resuelve el problema de la transcripción multilingüe en un único checkpoint, sin necesidad de un modelo separado por idioma.

Esta ficha describe la exportación a loom.cpp del checkpoint original, publicada como un único archivo GGUF autodescriptivo que embebe sus propias topologías de grafo, tokenizador y script controlador. El modelo cuenta con 636.876.688 parámetros y se distribuye en dos precisiones: F32 (2,5 GB) y q8_0 (719 MB). La exportación preserva el comportamiento del modelo original: el archivo F32 es token a token idéntico al decode de NeMo en las pruebas realizadas por el autor.

La relevancia actual radica en que permite ejecutar un modelo ASR de calidad de producción en hardware modesto (1,4 GB de pico de memoria con q8_0) mediante el runtime loom-py-rt, con soporte tanto de inferencia offline como de streaming con búfer al estilo de NeMo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder FastConformer + decoder RNN-T, con prompting de language-ID |
| Parametros totales | 636.876.688 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (atención sobre el clip completo; streaming con 5,6 s de contexto izquierdo por chunk) |
| Tipos de cuantizacion | F32 y q8_0 |
| Idiomas soportados | 25: bg, hr, cs, da, nl, en, et, fi, fr, de, el, hu, it, lv, lt, mt, pl, pt, ro, sk, sl, es, sv, ru, uk |
| Licencia | OpenMDW License 1.1 (heredada del modelo base) |
| Formato de pesos | GGUF (autodescriptivo, con grafo y driver embebidos) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura de dos componentes: un encoder FastConformer que procesa el audio de entrada y un decoder RNN-T que genera la secuencia de tokens. El reconocimiento se guía mediante prompting de identificación de idioma, lo que permite seleccionar la lengua de salida entre las 25 entrenadas o dejar que el propio modelo la detecte con el modo `auto`. La salida incluye puntuación y capitalización.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni sobre si se aplicaron técnicas de RLHF o DPO en la información proporcionada. La exportación a loom.cpp agrupa los pesos de convolución y proyección al cuantizar (`loom-export --quantize <type>`), por lo que los resultados de las versiones cuantizadas difieren de los del modelo original en la medida indicada por el autor. El archivo F32 porta los mismos parámetros sin modificar en formato GGUF de loom.cpp.

## Capacidades

- Transcripción de voz a texto en 25 lenguas europeas, con detección automática de idioma (`auto`) o selección explícita mediante nombres de prompt del checkpoint (por ejemplo `"de"`, `"pl"`, `"de-DE"`; 118 en total en `model.contract["asr_languages"]`).
- Puntuación y capitalización en la salida.
- Inferencia offline sobre el clip completo (`speech2text.infer`), equivalente a la inferencia offline de NeMo.
- Streaming con búfer al estilo de NeMo (`speech2text.stream()`), con 5,6 s de contexto izquierdo recomputado por chunk y actualizaciones incrementales que indican si el texto previo se ha revisado (`update.revised`).
- Entrada de audio mono a 16 kHz como lista de floats.
- API de alto nivel por tarea (`speech2text`) y acceso al driver embebido mediante `model.infer(...)` para parámetros no expuestos por la API de alto nivel.

## Casos de uso

- Transcripción de reuniones y entrevistas multilingües: el modelo gestiona 25 lenguas europeas en un único checkpoint y añade puntuación y capitalización, lo que reduce el postprocesado necesario para actas y resúmenes.
- Subtitulado y accesibilidad: la salida con puntuación y capitalización y el modo streaming permiten generar subtítulos progresivos a partir de audio de micrófono entregado segundo a segundo.
- Atención al cliente y análisis de llamadas: la detección automática de idioma (`auto`) permite procesar grabaciones de centros de contacto sin etiquetar previamente la lengua de cada llamada.
- Investigación lingüística y corpus de habla: la cobertura de 25 lenguas europeas, incluidas las bálticas, eslavas y ugrofinesas, facilita la construcción de corpus transcritos homogéneos entre idiomas.
- Despliegue en hardware modesto: con q8_0 (719 MB de pesos y 1,4 GB de pico de memoria) el modelo puede ejecutarse en entornos con recursos limitados, frente a los 3,2 GB de pico de la versión F32.
- Transcripción en vivo en aplicaciones de escritorio o edge: el modo `stream()` con búfer de 5,6 s de contexto izquierdo está pensado para audio que llega de forma continua, como un micrófono.
- Pipelines de voz a texto en producción: la integración con loom-py-rt permite invocar el modelo desde Python con una API estable y un archivo GGUF autodescriptivo que simplifica el despliegue.

## Benchmarks y rendimiento

Los únicos datos publicados en la información disponible son los del autor de la exportación, medidos sobre LibriSpeech y FLEURS (alemán, español, francés y polaco), con el idioma indicado explícitamente.

| Metrica | F32 | q8_0 |
|---|---|---|
| LibriSpeech WER | 3,91 % | 3,91 % |
| FLEURS aleman WER | no disponible | 2,91 % |
| FLEURS espanol WER | no disponible | 3,37 % |
| FLEURS frances WER | no disponible | 10,00 % |
| FLEURS polaco WER | no disponible | 9,02 % |
| Pico de memoria | 3,2 GB | 1,4 GB |
| Transcripciones token-identicas a NeMo | 73/73 LibriSpeech y 60/60 FLEURS | 71/73 LibriSpeech y 53/60 FLEURS |

El autor indica que los WER de q8_0 quedan a menos de 0,4 puntos de los de F32 en todos los conjuntos. No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3,2 GB de pico con F32 y 1,4 GB de pico con q8_0.
- GPU recomendadas: no disponible en la información proporcionada; el modelo es lo bastante pequeño para ejecutarse en GPUs de consumo, aunque el autor no especifica modelos concretos.
- Cabe en GPU de consumo: sí, con q8_0 (1,4 GB de pico) y previsiblemente con F32 (3,2 GB de pico) en tarjetas con 4 GB o más de VRAM.
- Opciones de despliegue: runtime loom-py-rt (PyPI, `loom-py-rt[hub]>=1.0.0`) sobre el motor loom.cpp. No se mencionan vLLM, llama.cpp, Ollama ni TGI para este formato.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de modelos alternativos en la información proporcionada, por lo que la comparación se limita a características estructurales.

| Modelo | Parametros | Idiomas | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Nemotron-Labs-Unified-ASR 0.6B (esta ficha) | 636.876.688 | 25 europeos | clip completo (offline); 5,6 s de contexto izquierdo en streaming | OpenMDW 1.1 | GGUF (loom.cpp) |
| nvidia/nemotron-labs-unified-asr-0.6b | no disponible | 25 europeos | no disponible | OpenMDW 1.1 | no disponible (checkpoint original) |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- En `infer` la inferencia es offline; en `stream()` se usa el streaming con búfer de NeMo, que termina en los ids transmitidos por NeMo y puede no coincidir con la transcripción offline.
- El coste computacional crece con la duración del clip porque la atención cubre el clip completo; se recomienda dividir grabaciones largas en las pausas (el autor sugiere `silero-vad-loom`).
- No se generan timestamps: `segments` es un único intervalo que cubre todo el clip.
- La entrada debe ser audio mono a 16 kHz.
- El modo `auto` detecta el idioma, pero el autor recomienda indicarlo explícitamente cuando se conoce; pedir un idioma fuera de los 25 entrenados no es un uso soportado, aunque la tabla de nombres de prompt incluya otros.
- La licencia OpenMDW 1.1 es heredada del modelo base; conviene revisar sus términos antes de un uso comercial.
- No se dispone de información sobre sesgos conocidos ni sobre tasas de alucinación en la documentación proporcionada.
- El WER en francés (10,00 % con q8_0) es notablemente superior al de otros idiomas evaluados, lo que conviene tener en cuenta en despliegues centrados en esa lengua.
- La cuantización q8_0 altera los pesos de convolución y proyección, con diferencias de hasta 0,4 puntos de WER y transcripciones no siempre idénticas a las de F32.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/loom-ai-org/nemotron-labs-unified-asr-0.6b-loom)
- [Modelo base: nvidia/nemotron-labs-unified-asr-0.6b](https://huggingface.co/nvidia/nemotron-labs-unified-asr-0.6b)
- [Repositorio loom.cpp](https://github.com/loom-ai-org/loom.cpp)
- [Repositorio loom-exporter](https://github.com/loom-ai-org/loom-exporter)
- [Repositorio loom-py](https://github.com/loom-ai-org/loom-py)
- [Licencia OpenMDW 1.1](https://openmdw.ai/license/1-1/)
