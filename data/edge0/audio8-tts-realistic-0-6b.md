# Edge0/Audio8-TTS-Realistic-0.6b

## Resumen

Audio8-TTS-Realistic-0.6b (publicado también como Audio8-TTS-Realistic-Air) es un modelo de síntesis de voz (text-to-speech) desarrollado por Edge0. Se trata de una evolución del modelo base Audio8-TTS-Preview-0.6b que mantiene la arquitectura compacta de 0,6 mil millones de parámetros pero mejora sustancialmente el realismo del habla y amplía la cobertura de idiomas de 11 a 23. El modelo está diseñado para generación de voz con clonación zero-shot a partir de una grabación de referencia y su transcripción, así como para generación sin referencia.

La arquitectura es un sistema DualAR inspirado en Fish Audio S2 Pro: un transformer autorregresivo lento que predice un token semántico por trama de audio y un transformer autorregresivo rápido que predice los codebooks del códec condicionado al estado oculto del modelo lento. El códec neuronal de audio a 44,1 kHz va incluido en el repositorio, por lo que no se necesita un checkpoint de códec adicional.

Su relevancia actual radica en que ofrece clonación de voz multilingüe y despliegue local nativo (integración con llama.cpp y GGUF, además de servido GPU con SGLang Omni) con una licencia Apache 2.0 permisiva, en un tamaño que cabe en hardware de consumo y con una interfaz estándar de Transformers.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DualAR (transformer autorregresivo lento + autorregresivo rápido) inspirada en Fish Audio S2 Pro |
| Parametros totales | 601.159.424 (modelo principal, excluye el códec) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Hasta 2.048 posiciones empaquetadas de texto/audio |
| Tipos de cuantizacion | GGUF (bundle F32 compartido para llama.cpp); cuantizaciones adicionales no disponibles |
| Idiomas soportados | 23: chino, inglés, cantonés, neerlandés, francés, alemán, italiano, japonés, coreano, polaco, español, árabe, finlandés, hindi, indonesio, malayo, noruego, portugués, ruso, sueco, tailandés, turco, vietnamita |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, GGUF |

Detalles de componentes:

| Componente | Configuracion |
|---|---|
| Modelo principal | 601.159.424 parámetros, excluyendo el códec |
| Slow AR | 24 capas, anchura 896, 14 cabeceras de atención, 2 cabeceras KV |
| Fast AR | 4 capas, anchura 896, 14 cabeceras de atención, 2 cabeceras KV |
| Tokens acústicos | 10 codebooks, 4.096 entradas por codebook |
| Códec | 44,1 kHz, 2.048 muestras por trama del modelo (~21,5 tramas/s) |
| Contexto | Hasta 2.048 posiciones empaquetadas de texto/audio |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura DualAR en la que un transformer autorregresivo lento predice un token semántico por cada trama de audio, mientras que un transformer autorregresivo rápido predice los codebooks del códec de esa trama, condicionado al estado oculto del modelo lento y a los codebooks precedentes. El modelo lento consta de 24 capas con anchura 896, 14 cabeceras de atención y 2 cabeceras KV; el rápido, de 4 capas con la misma anchura y configuración de atención. El códec neuronal a 44,1 kHz genera 2.048 muestras por trama del modelo, lo que equivale a unas 21,5 tramas por segundo, y se encarga tanto de codificar el audio de referencia como de decodificar la forma de onda, de modo que no hace falta un checkpoint de códec independiente.

El modelo principal cuenta con 601.159.424 parámetros, sin incluir el códec. El contexto se limita a 2.048 posiciones empaquetadas de texto y audio. La información proporcionada no detalla el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. La model card menciona que la arquitectura está inspirada en Fish Audio S2 Pro, pero no se especifican más innovaciones técnicas de entrenamiento. El modelo se distribuye con código personalizado de Transformers que requiere `trust_remote_code=True`.

## Capacidades

- Síntesis de voz (text-to-speech) de alta calidad con prosodia natural y entrega expresiva.
- Clonación de voz zero-shot a partir de una grabación de referencia limpia y su transcripción exacta.
- Generación de voz sin referencia (sin audio de clonación).
- Soporte multilingüe en 23 idiomas: chino, inglés, cantonés, neerlandés, francés, alemán, italiano, japonés, coreano, polaco, español, árabe, finlandés, hindi, indonesio, malayo, noruego, portugués, ruso, sueco, tailandés, turco y vietnamita.
- Streaming de audio en la integración con llama.cpp.
- Inferencia local nativa mediante llama.cpp y GGUF.
- Servido de alto rendimiento con SGLang Omni (paged attention, dynamic batching y API de voz compatible con OpenAI).
- Interfaz estándar de Transformers (`AutoModel`, `AutoProcessor`).
- Tool calling, function calling, razonamiento multi-paso, visión y audio de entrada no disponibles: el modelo es exclusivamente de texto a voz.

## Casos de uso

- Audiolibros y narración automatizada: el modelo genera voz con prosodia natural en 23 idiomas, lo que permite narrar textos largos por tramos respetando el límite de 2.048 posiciones de contexto empaquetado de texto y audio.
- Doblaje y localización de contenidos: con clonación zero-shot se puede mantener la identidad vocal de un hablante de referencia mientras se genera el mismo contenido en otro de los idiomas soportados, útil para adaptar vídeos o cursos.
- Asistentes de voz y atención al cliente: la API de voz compatible con OpenAI de SGLang Omni permite integrar el modelo en pipelines existentes de agentes conversacionales con batching dinámico para varios usuarios concurrentes.
- Accesibilidad: generación de voz para lectores de pantalla o interfaces de accesibilidad en local mediante llama.cpp y GGUF, sin depender de servicios en la nube.
- Prototipado de personajes y videojuegos: clonación de voces de referencia para dar voz a personajes con entrega expresiva, con despliegue en GPU de consumo gracias al tamaño de 0,6B.
- Generación de voces para contenido educativo y podcasts: síntesis sin referencia para producir locuciones multilingües de forma reproducible desde scripts.
- Investigación en TTS: el modelo sirve como base compacta y de licencia Apache 2.0 para experimentos de clonación de voz y evaluación multilingüe, con pesos en safetensors y GGUF.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona una sección de evaluación con resultados por idioma, pero los valores numéricos no se incluyen en la información proporcionada. Las comprobaciones de runtime citadas (carga del modelo, generación en inglés y chino con y sin audio de referencia, y generación en árabe, cantonés, portugués y ruso sobre una NVIDIA H20 con BF16 y PyTorch 2.8.0 / Transformers 4.57.3) son pruebas de humo, no benchmarks de calidad.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita en la información proporcionada. Con 601 millones de parámetros en BF16, el peso del modelo principal ronda los 1,2 GB, a lo que hay que sumar el códec incluido en el repositorio (el repo completo ocupa 6,3 GB).
- GPU recomendadas: la model card cita pruebas en una NVIDIA H20 con BF16. No se especifican otras GPU recomendadas.
- GPU de consumo: el tamaño de 0,6B y la existencia de un bundle GGUF F32 para llama.cpp sugieren viabilidad en GPU de consumo, pero no se confirma en la información disponible.
- Opciones de despliegue: Transformers (con `trust_remote_code=True`), llama.cpp / GGUF (CLI, clonación de voz y streaming), SGLang Omni (paged attention, dynamic batching, API compatible con OpenAI) y un Space de Hugging Face sobre ZeroGPU.
- Requisitos de software: Python 3.10 o superior, `torch>=2.5.0`, `torchaudio>=2.5.0`, `transformers>=4.57.0,<5`, `soundfile>=0.12`, `safetensors>=0.4`.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formatos |
|---|---|---|---|---|---|
| Audio8-TTS-Realistic-0.6b | 601 M (sin códec) | 2.048 posiciones | 23 | Apache 2.0 | safetensors, GGUF |
| Edge0/Audio8-TTS-Preview-0.6b | 0,6B (no detallado) | no disponible | 11 | no disponible en la información | no disponible en la información |
| Fish Audio S2 Pro (arquitectura de referencia) | no disponible | no disponible | no disponible | no disponible | no disponible |

La información proporcionada no incluye datos de rendimiento comparativo entre estos modelos. La comparación se limita a parámetros, cobertura de idiomas y licencia según lo disponible.

## Limitaciones y advertencias

- La calidad varía según el idioma; la propia model card advierte que la cobertura de benchmarks incluye idiomas adicionales y es distinta de la lista de idiomas soportados.
- La clonación zero-shot requiere una grabación de referencia limpia cuya transcripción coincida exactamente con el contenido hablado; discrepancias degradan el resultado.
- El contexto está limitado a 2.048 posiciones empaquetadas de texto y audio, lo que acota la duración de las entradas de texto y referencia.
- El modelo usa código personalizado de Transformers y requiere `trust_remote_code=True`, lo que implica revisar los archivos del repositorio antes de cargarlo.
- No se dispone de información sobre sesgos conocidos, riesgo de alucinación en el sentido de contenido hablado, ni sobre restricciones adicionales de uso comercial más allá de la licencia Apache 2.0.
- El recuento de 0,6B excluye el códec; el repositorio completo ocupa 6,3 GB, relevante para planificar almacenamiento y despliegue.
- La disponibilidad del Space de demostración depende de la cola y de la asignación diaria de GPU en ZeroGPU.
- No se han publicado cifras de latencia ni throughput en la información disponible.

## Enlaces

- Hugging Face: https://huggingface.co/Edge0/Audio8-TTS-Realistic-0.6b
- Modelo base: https://huggingface.co/Edge0/Audio8-TTS-Preview-0.6b
- Repositorio GitHub: https://github.com/Edge0-AI/Audio8_TTS
- Demo: https://edge0-ai.github.io/Audio8_TTS/realistic-0.6b/
- Paper arXiv: https://arxiv.org/abs/2610.14776
- Playground (Space): https://huggingface.co/spaces/Edge0/Audio8-TTS-Realistic-Air
- Runbook llama.cpp: https://github.com/Edge0-AI/Audio8_TTS/blob/0f8c4fade0cb14e38fbf737d0488553f16a0d658/guides/llama-cpp.md
- Runbook llama.cpp (chino): https://github.com/Edge0-AI/Audio8_TTS/blob/0f8c4fade0cb14e38fbf737d0488553f16a0d658/guides/llama-cpp_zh.md
- Fish Audio S2 Pro (arquitectura de referencia): https://github.com/fishaudio/fish-speech
