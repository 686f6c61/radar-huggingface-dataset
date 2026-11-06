# graciasdios9999/drama-3

## Resumen

Fish Audio Drama 3 es un modelo de síntesis de voz (text-to-speech) de nueva generación desarrollado por Fish Audio, orientado a la generación de escenas con múltiples personajes y contenido de formato largo. Se distribuye en Hugging Face bajo el identificador `graciasdios9999/drama-3` y emplea una arquitectura MoE con un backbone de texto de 35B parámetros totales y 3B activos por token, combinando atención completa y atención lineal (híbrida). El modelo incorpora un decodificador de audio basado en codebooks con predicción multi-token (Codebook-MTP), que decodifica 10 codebooks de forma causal sobre la secuencia completa.

El modelo resuelve el problema de la generación de voz multi-hablante controlable: permite asignar hasta 16 personajes distintos en un mismo texto mediante etiquetas de hablante (`<|speaker:0|>` a `<|speaker:15|>`), clonar voces a partir de una referencia y editar audio existente tratándolo como continuación de secuencia. Además, admite control en lenguaje natural, incluyendo etiquetas de eventos paralingüísticos como `[sighs]` o `[laughs]` insertadas en el texto en la posición exacta donde deben ocurrir.

Su relevancia actual radica en que combina un backbone de lenguaje de gran escala con un decodificador de audio eficiente en un único modelo servible mediante infraestructura estándar de inferencia (SGLang-Omni y vLLM-Omni desde el día de lanzamiento), con latencias de primer audio por debajo de 100 ms en una sola GPU H200. El modelo soporta más de 80 idiomas y se distribuye bajo la licencia de investigación de Fish Audio.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MoE con backbone de texto de atención híbrida (completa + lineal) y decodificador de audio Codebook-MTP |
| Parámetros totales | 35.899.643.008 (≈35,9B) |
| Parámetros activos | 3B por token |
| Longitud de contexto | no disponible |
| Tipos de cuantización | FP8 para los expertos MoE; resto de pesos en bf16 |
| Idiomas soportados | 80+ (zh, en, ja, ko, es, pt, ar, ru, fr, de, sv, it, tr, no, nl, cy, eu, ca, da, gl, ta, hu, fi, pl, et, hi, la, ur, th, vi, jw, bn, yo, sl, cs, sw, nn, he, ms, uk, id, kk, bg, lv, my, tl, sk, ne, fa, af, el, bo, hr, ro, sn, mi, yi, am, be, km, is, az, sd, br, sq, ps, mn, ht, ml, sr, sa, te, ka, bs, pa, lt, kn, si, hy, mr, as, gu, fo) |
| Licencia | fish-audio-research-license (licencia de investigación de Fish Audio) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Drama 3 se construye sobre un backbone de lenguaje de tipo Mixture of Experts con 35,9B parámetros totales y 3B activos por token, lo que reduce el coste computacional por token manteniendo una capacidad de representación elevada. La atención es híbrida: combina capas de atención completa con capas de atención lineal, una elección habitual para abaratar el coste de secuencias largas en modelos de audio y texto. Los expertos MoE se almacenan en FP8, mientras que el resto de pesos permanece en bf16, lo que reduce el tamaño del repositorio a 41,5 GB frente a lo que ocuparía una versión íntegramente en bf16.

El componente de audio es un decodificador Codebook-MTP que decodifica 10 codebooks de forma causal sobre toda la secuencia. Este diseño permite tratar la edición de audio como una continuación de secuencia: se envían los tokens VQ (vector-quantized) de tomas anteriores como contexto y el modelo genera la nueva toma condicionada por ellos, de manera análoga a como un modelo de lenguaje continúa un texto. El modelo soporta etiquetas de hablante para hasta 16 personajes y trocea automáticamente textos largos, con posibilidad de streaming por fragmento. No se dispone de información detallada sobre el número de tokens de entrenamiento, la composición del dataset ni la existencia de fases de RLHF o DPO en la información proporcionada.

## Capacidades

- Generación de voz multi-hablante: hasta 16 personajes distintos en un mismo texto mediante etiquetas `<|speaker:0|>` a `<|speaker:15|>`.
- Clonación de voz a partir de un clip de referencia con su transcripción, sin necesidad de ajuste fino.
- Control en lenguaje natural: etiquetas de eventos paralingüísticos insertadas en el texto (`[sighs]`, `[laughs]`) que se materializan en la posición exacta del texto donde aparecen.
- Edición de audio como continuación: modificación de tomas previas enviando los tokens VQ anteriores como contexto, con encadenamiento de ediciones sucesivas.
- Generación de voz emocional, según la etiqueta `emotional-speech-generation` de la model card.
- Soporte multilingüe en más de 80 idiomas, incluyendo castellano, catalán, gallego y euskera.
- Troceado automático de texto largo con streaming por fragmento.
- No se menciona soporte de tool calling, function calling ni razonamiento multi-paso; se trata de un modelo de TTS, no de un modelo de lenguaje conversacional.

## Casos de uso

- Audiolibros y ficción con diálogos: el modelo permite asignar etiquetas de hablante a cada personaje y generar una escena completa con hasta 16 voces distintas en una sola pasada, manteniendo coherencia de timbre por personaje.
- Doblaje y localización de contenido: con soporte de más de 80 idiomas y clonación de voz, se puede reutilizar la voz de un actor original para generar versiones en castellano, catalán, gallego o euskera manteniendo la identidad vocal.
- Producción de pódcasts y contenido editorial: el troceado automático de texto largo y el streaming por fragmento permiten generar episodios completos de forma progresiva, con control de pausas y eventos como suspiros o risas.
- Edición de locuciones en postproducción: la edición como continuación permite corregir una palabra o frase concreta de una toma previa (por ejemplo, cambiar "Wednesday" por "Thursday") enviando la toma anterior como contexto, sin regenerar todo el audio.
- Asistentes de voz y atención al cliente: la baja latencia de primer audio (88,9 ms p50 con concurrencia 1 en H200) y el RTF de 0,131 permiten respuestas de voz casi en tiempo real en sistemas conversacionales.
- Accesibilidad y lectura de contenido: conversión de artículos, documentación o mensajes a voz con control de emoción y eventos paralingüísticos, útil en lectores de pantalla avanzados o sistemas de narración automática.
- Generación de voces para videojuegos y animación: asignación de voces diferenciadas por personaje y generación de líneas con matices emocionales en un pipeline automatizado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (tipo MMLU, HumanEval o GSM8K, no aplicables a un modelo de TTS) en la información disponible. Sí se publican métricas de rendimiento en producción medidas en GPUs NVIDIA H200 con peticiones en streaming sobre prompts en inglés de Seed-TTS, con clonación de voz desde una referencia pre-codificada (`vq_codes` con su transcripción), temperatura 1,0, top_p 0,9, top_k 30 y `max_new_tokens` 500:

| Concurrencia | Throughput (frames/s) | TTFA p50 | TTFA p95 | RTF (media) |
|---:|---:|---:|---:|---:|
| 1 | 166,7 | 88,9 ms | 90,8 ms | 0,131 |
| 2 | 287,0 | 96,2 ms | 130,1 ms | 0,152 |
| 4 | 467,6 | 108,2 ms | 156,4 ms | 0,186 |
| 8 | 678,1 | 153,2 ms | 210,9 ms | 0,256 |
| 16 | 927,6 | 210,1 ms | 287,2 ms | 0,373 |
| 32 | 1.244,7 | 304,6 ms | 396,1 ms | 0,551 |
| 64 | 1.687,3 | 450,9 ms | 1.020,1 ms | 0,801 |

Cada celda es la media de cuatro ejecuciones. El throughput cuenta frames acústicos generados por segundo; TTFA es el tiempo hasta el primer audio y RTF es el tiempo desde el envío de la petición hasta el último fragmento de audio dividido por la duración del audio devuelto.

## Requisitos de hardware

- El repositorio ocupa 41,5 GB en safetensors, con expertos MoE en FP8 y resto en bf16; se requiere al menos esa cantidad de VRAM para cargar los pesos completos sin cuantización adicional.
- GPU recomendadas: NVIDIA H200 para los valores de rendimiento publicados; por tamaño, caben en A100 80 GB, H100 80 GB y H200. No se dispone de datos de rendimiento en otras GPU.
- No cabe en GPUs de consumo convencionales (RTX 4090 con 24 GB) sin cuantización adicional, que no está documentada en la información disponible.
- Opciones de despliegue: SGLang-Omni (`sgl-omni serve --model-path fishaudio/drama-3 --port 8000`) y vLLM-Omni (`vllm serve fishaudio/drama-3 --omni --port 8091`), ambos con soporte desde el día de lanzamiento.
- Latencia y throughput: TTFA p50 de 88,9 ms con concurrencia 1 y RTF medio de 0,131 en H200; a concurrencia 64 el throughput alcanza 1.687,3 frames/s con TTFA p50 de 450,9 ms.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada, por lo que la comparativa se indica como no disponible. Los datos objetivos del modelo son: 35,9B parámetros totales, 3B activos por token, más de 80 idiomas, licencia de investigación de Fish Audio y despliegue mediante SGLang-Omni y vLLM-Omni.

## Limitaciones y advertencias

- Licencia `fish-audio-research-license`: es una licencia de investigación, por lo que el uso comercial está restringido y requiere revisar los términos del archivo LICENSE.md antes de cualquier despliegue en producción.
- No se dispone de información sobre sesgos conocidos del modelo en la documentación proporcionada.
- Riesgo de alucinación en el sentido de artefactos de audio o pronunciaciones incorrectas no documentado; no hay datos publicados al respecto.
- La longitud de contexto no está especificada, lo que limita la planificación de escenas largas sin troceado; el modelo trocea automáticamente el texto, pero se desconoce el límite exacto.
- Los benchmarks de rendimiento publicados se han medido únicamente en NVIDIA H200 y con prompts en inglés de Seed-TTS; el rendimiento en otros idiomas y hardware no está documentado.
- El modelo está alojado en el repositorio `graciasdios9999/drama-3`, con 21 descargas y 0 likes en el momento de la consulta; la referencia canónica en la model card apunta a `fishaudio/drama-3`, por lo que conviene verificar la procedencia de los pesos.
- No se documentan capacidades de tool calling ni de razonamiento multi-paso; no debe evaluarse como un modelo de lenguaje general.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/graciasdios9999/drama-3
- Referencia canónica en la model card: https://huggingface.co/fishaudio/drama-3
- SGLang-Omni: https://sgl-project.github.io/sglang-omni/
- Drama 3 Cookbook (SGLang-Omni): https://sgl-project.github.io/sglang-omni/cookbook/fishaudio_drama3.html
- Repositorio SGLang-Omni: https://github.com/sgl-project/sglang-omni
- vLLM-Omni: https://github.com/vllm-project/vllm-omni
- Drama 3 vLLM-Omni Recipe: https://recipes.vllm.ai/fishaudio/drama-3
- Paper referenciado en los tags (arXiv:2610.18010): https://arxiv.org/abs/2610.18010
