# Infinix-io/drama-3

## Resumen

Fish Audio Drama 3 es un modelo de síntesis de voz (text-to-speech) de nueva generación desarrollado por Fish Audio, orientado a escenas con múltiples personajes y contenido de formato largo. Se distribuye en Hugging Face bajo el identificador Infinix-io/drama-3 y resuelve el problema de generar diálogo hablado con varios interlocutores, clonación de voz y control en lenguaje natural dentro de una sola pasada, en lugar de encadenar varios sistemas TTS independientes.

El modelo combina un backbone de texto de tipo Mezcla de Expertos (MoE) de 35.900 millones de parámetros totales con 3.000 millones activos por token, atención híbrida (completa más lineal) y un decodificador de audio Codebook-MTP que genera 10 codebooks de forma causal sobre toda la secuencia. Los expertos MoE se almacenan en FP8 y el resto de pesos en bf16, lo que da un repositorio de aproximadamente 41,5 GB.

Su relevancia actual radica en dos factores: cubre 89 idiomas (incluido el castellano, el catalán, el gallego y el euskera) y ofrece control directo mediante etiquetas de hablante `<|speaker:0|>` a `<|speaker:15|>` —hasta 16 personajes en un mismo texto—, además de edición de audio por continuación de tokens VQ. Está disponible desde el primer día en SGLang-Omni y vLLM-Omni.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con atención híbrida (completa + lineal) y decodificador de audio Codebook-MTP |
| Parametros totales | 35.899.643.008 (35,9 B) |
| Parametros activos | 3 B por token |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Pesos publicados en FP8 (expertos MoE) y bf16 (resto); no se documentan otras cuantizaciones |
| Idiomas soportados | 89 idiomas, entre ellos zh, en, ja, ko, es, pt, ar, ru, fr, de, it, ca, gl, eu, hi, ar, tr, nl, pl, sv, fi, etc. |
| Licencia | fish-audio-research-license (research license, no comercial por defecto) |
| Formato de pesos | safetensors |
| Pipeline | text-to-speech |
| Tamano del repositorio | 41,5 GB |

## Arquitectura y entrenamiento

Drama 3 emplea un backbone de texto con arquitectura MoE: 35,9 B de parámetros totales de los que solo 3 B se activan por token, lo que reduce el coste de inferencia frente a un modelo denso del mismo tamaño. La atención es híbrida, combinando capas de atención completa con capas de atención lineal para manejar secuencias largas con menor coste computacional. Los expertos MoE se almacenan en FP8 y el resto de pesos en bf16, una decisión de despliegue que reduce el espacio en memoria y acelera la inferencia en GPUs Hopper.

La parte de audio la resuelve un decodificador Codebook-MTP (multi-token prediction) que decodifica 10 codebooks de forma causal sobre toda la secuencia, en lugar de generar el audio de forma autorregresiva token a token sobre un único codebook. El modelo soporta etiquetas de hablante `<|speaker:0|>` a `<|speaker:15|>`, troceado automático de texto largo con streaming por fragmento y edición de audio tratada como continuación: se envían los tokens VQ previos y la nueva petición se procesa como lenguaje normal. No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO.

## Capacidades

- Generación de voz multi-hablante: hasta 16 personajes distintos en un mismo texto mediante etiquetas `<|speaker:0|>` … `<|speaker:15|>`.
- Clonación de voz a partir de una referencia corta (el ejemplo de la model card usa un clip de 3,9 s) con su transcripción.
- Control en lenguaje natural: descripción de la interpretación en palabras propias y etiquetas de punto como `[sighs]` o `[laughs]` insertadas en la posición exacta del texto.
- Edición de audio por continuación: se envían las tomas previas (`previous_takes`) y el modelo regenera solo lo modificado, permitiendo encadenar ediciones sucesivas.
- Generación de contenido largo: troceado automático del texto y streaming por fragmento.
- Cobertura multilingüe amplia: 89 idiomas, incluidos castellano, catalán, gallego y euskera.
- Soporte de despliegue en producción con SGLang-Omni y vLLM-Omni, con API compatible con `/v1/tts`.
- No se documentan capacidades de tool calling, agentes, visión ni audio de entrada.

## Casos de uso

- Audiolibros y ficción con diálogo: el modelo permite asignar hasta 16 voces distintas en un mismo texto y trocear automáticamente capítulos largos, de modo que un único pipeline genera la narración y los diálogos sin concatenar varios TTS.
- Doblaje y localización multilingüe: con 89 idiomas y clonación de voz, se puede mantener la identidad vocal del actor original en castellano, catalán, gallego o euskera a partir de una referencia corta, y ajustar la interpretación con instrucciones en lenguaje natural.
- Edición de locuciones sin regrabar: gracias a la edición por continuación, un cambio de palabra o de hora en un guion se regenera enviando las tomas previas, lo que evita volver a sintetizar el clip completo.
- Asistentes de voz y atención al cliente: la latencia de primera respuesta por debajo de 100 ms en un solo stream y el streaming por fragmento permiten conversaciones fluidas; a concurrencia 16 en una H200 se mantiene un RTF medio de 0,373.
- Producción de pódcast y contenido editorial: las etiquetas de punto permiten insertar suspiros, risas y pausas en posiciones concretas, lo que da un resultado más natural en contenido conversacional sin postproducción manual.
- Videojuegos y experiencias interactivas: la generación multi-personaje con etiquetas de hablante facilita generar escenas completas con varios NPC en una sola llamada, y el despliegue en vLLM-Omni o SGLang-Omni permite servirlo como servicio interno.
- Accesibilidad y lectura en voz alta: la cobertura de 89 idiomas y el control de la interpretación permiten adaptar la velocidad y el tono a distintos perfiles de usuario.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (tipo Seed-TTS WER/SIM) en la información disponible. Sí se incluyen métricas de rendimiento en producción medidas sobre GPUs NVIDIA H200 con peticiones en streaming sobre prompts en inglés de Seed-TTS, con `temperature` 1.0, `top_p` 0.9, `top_k` 30 y `max_new_tokens` 500:

| Concurrencia | Throughput (frames/s) | TTFA p50 | TTFA p95 | RTF (media) |
|---:|---:|---:|---:|---:|
| 1 | 166,7 | 88,9 ms | 90,8 ms | 0,131 |
| 2 | 287,0 | 96,2 ms | 130,1 ms | 0,152 |
| 4 | 467,6 | 108,2 ms | 156,4 ms | 0,186 |
| 8 | 678,1 | 153,2 ms | 210,9 ms | 0,256 |
| 16 | 927,6 | 210,1 ms | 287,2 ms | 0,373 |
| 32 | 1.244,7 | 304,6 ms | 396,1 ms | 0,551 |
| 64 | 1.687,3 | 450,9 ms | 1.020,1 ms | 0,801 |

Cada celda es la media de cuatro ejecuciones. El throughput se mide en frames acústicos generados por segundo; TTFA es el tiempo hasta el primer audio y RTF es el tiempo desde el envío de la petición hasta el último fragmento de audio dividido por la duración del audio devuelto.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 41,5 GB con expertos en FP8 y resto en bf16, por lo que se necesita al menos una GPU con 48 GB o más para cargar los pesos completos.
- GPU recomendadas: NVIDIA H200 (plataforma de referencia de las métricas publicadas) y, por capacidad de memoria, H100 de 80 GB o A100 de 80 GB.
- GPU de consumo: no cabe en GPUs consumer de 24 GB (RTX 4090) con los pesos publicados; no se documentan cuantizaciones GGUF ni versiones reducidas para consumer.
- Opciones de despliegue: SGLang-Omni (`sgl-omni serve --model-path fishaudio/drama-3 --port 8000`) y vLLM-Omni (`vllm serve fishaudio/drama-3 --omni --port 8091`). No se mencionan llama.cpp, Ollama ni TGI.
- Latencia y throughput: en una sola H200, TTFA p50 de 88,9 ms a concurrencia 1 y throughput de 1.687,3 frames/s a concurrencia 64, con RTF medio de 0,801 en ese punto.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la información proporcionada, por lo que la comparación cuantitativa no está disponible.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Fish Audio Drama 3 | 35,9 B totales / 3 B activos | no disponible | fish-audio-research-license | Hugging Face (Infinix-io/drama-3), SGLang-Omni, vLLM-Omni |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- La licencia `fish-audio-research-license` es una licencia de investigación: el uso comercial requiere revisar los términos del archivo LICENSE.md y, previsiblemente, obtener autorización del titular.
- No se han publicado evaluaciones de sesgo, robustez o tasas de alucinación acústica; la clonación de voz conlleva riesgos de suplantación y requiere consentimiento explícito de la voz de referencia.
- El modelo puede reproducir sesgos presentes en los datos de entrenamiento en cuanto a acento, género o registro de las voces clonadas; no se documenta ninguna mitigación.
- El rendimiento publicado corresponde a prompts en inglés de Seed-TTS sobre H200; no hay métricas para castellano ni para el resto de los 89 idiomas, por lo que la calidad fuera del inglés no está verificada.
- La longitud de contexto no está documentada, lo que dificulta planificar el troceado de textos muy largos más allá del mecanismo automático descrito.
- Los pesos publicados en FP8/bf16 no caben en GPUs de consumo de 24 GB y no se ofrecen cuantizaciones alternativas, lo que limita el despliegue local.
- El formato de API de referencia (`/v1/tts` con `references` y `previous_takes`) está ligado a SGLang-Omni y vLLM-Omni; otros servidores requerirían adaptación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Infinix-io/drama-3
- Réplica del modelo en Hugging Face: https://huggingface.co/Infinix-ai/drama-3
- Página de producto: https://fish.audio/drama-3/
- Repositorio SGLang-Omni: https://github.com/sgl-project/sglang-omni
- Documentación SGLang-Omni: https://sgl-project.github.io/sglang-omni/
- Cookbook de Drama 3 en SGLang-Omni: https://sgl-project.github.io/sglang-omni/cookbook/fishaudio_drama3.html
- Repositorio vLLM-Omni: https://github.com/vllm-project/vllm-omni
- Recipe de Drama 3 en vLLM-Omni: https://recipes.vllm.ai/fishaudio/drama-3
- Paper referenciado (arXiv:2610.18010): https://arxiv.org/abs/2610.18010
