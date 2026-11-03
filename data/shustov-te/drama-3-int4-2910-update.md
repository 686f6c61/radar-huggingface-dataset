# shustov-te/drama-3-int4-2910-update

## Resumen

Drama 3 es un modelo de síntesis de voz (text-to-speech) desarrollado por Fish Audio, orientado a la generación de escenas con múltiples personajes y contenido de formato largo. Esta ficha concreta, alojada por el usuario shustov-te, contiene los pesos actualizados de Drama 3 cuantizados a INT4, una actualización sobre los pesos originales publicados en fishaudio/drama-3. El modelo combina un backbone de texto de arquitectura MoE con un decodificador de audio basado en códecs neuronales (codebook-MTP), lo que le permite generar audio de alta fidelidad a partir de texto con control en lenguaje natural.

La relevancia de esta versión reside en su cuantización a INT4, que reduce drásticamente los requisitos de memoria frente a la versión original en FP8/bf16, manteniendo el soporte para hasta 16 hablantes distintos mediante etiquetas de hablante, clonación de voz y edición de audio por continuación. El modelo declara soporte para más de 80 idiomas, incluyendo el castellano, y está pensado para despliegues en producción mediante SGLang-Omni y vLLM-Omni.

El modelo se distribuye bajo la licencia fish-audio-research-license, lo que restringe su uso comercial directo y lo orienta a investigación y evaluación. Con 6.857.815.168 parámetros totales en esta versión cuantizada y un repositorio de 24 GB, se posiciona como una alternativa de código abierto (con matices de licencia) a sistemas TTS propietarios de gama alta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MoE con atención híbrida (full + linear); decodificador de audio codebook-MTP |
| Parámetros totales | 6.857.815.168 (pesos cuantizados INT4); el modelo original declara 35B totales y 3B activos por token |
| Parámetros activos | 3B activos por token (según model card del autor) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | INT4 (expertos MoE y pesos densos); original en FP8 (expertos MoE) y bf16 (resto) |
| Idiomas soportados | zh, en, ja, ko, es, pt, ar, ru, fr, de, sv, it, tr, no, nl, cy, eu, ca, da, gl, ta, hu, fi, pl, et, hi, la, ur, th, vi, jw, bn, yo, sl, cs, sw, nn, he, ms, uk, id, kk, bg, lv, my, tl, sk, ne, fa, af, el, bo, hr, ro, sn, mi, yi, am, be, km, is, az, sd, br, sq, ps, mn, ht, ml, sr, sa, te, ka, bs, pa, lt, kn, si, hy, mr, as, gu, fo |
| Licencia | fish-audio-research-license |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Drama 3 emplea un backbone de texto con arquitectura Mixture-of-Experts (MoE) que activa 3B parámetros por token sobre un total declarado de 35B, combinando atención completa y atención lineal en un esquema híbrido. Esta configuración busca equilibrar capacidad expresiva y eficiencia computacional en secuencias largas, algo crítico para TTS de formato largo. El decodificador de audio es un codebook-MTP (multi-token prediction) que decodifica 10 codebooks de forma causal sobre toda la secuencia, lo que permite generar audio coherente y de alta calidad sin depender de un vocoder externo convencional.

La versión aquí publicada aplica cuantización INT4 tanto a los expertos MoE como a los pesos densos, partiendo de los pesos originales (FP8 en expertos MoE y bf16 en el resto) y utilizando los scripts de akhaliq/drama-3-int4. No se dispone de información detallada sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. La model card menciona soporte para etiquetas de hablante `<|speaker:0|>` a `<|speaker:15|>`, troceado automático de texto largo y streaming por fragmentos, así como edición de audio tratada como continuación de tokens VQ previos.

## Capacidades

- Generación de voz a partir de texto (text-to-speech) con calidad de estudio y control en lenguaje natural.
- Generación multi-hablante: hasta 16 personajes distintos en un mismo texto mediante etiquetas `<|speaker:0|>` … `<|speaker:15|>`.
- Clonación de voz a partir de una referencia de audio corta (por ejemplo, un clip de 3,9 s) con su transcripción.
- Etiquetas de eventos paralingüísticos insertadas en el texto, como `[sighs]` o `[laughs]`, para controlar la expresividad en el punto exacto de la locución.
- Edición de audio por continuación: se envían las tomas previas (`previous_takes`) y el modelo genera una nueva versión modificada manteniendo el contexto anterior, incluyendo ediciones encadenadas.
- Generación de formato largo con troceado automático del texto y streaming por fragmentos.
- Cobertura multilingüe amplia (más de 80 idiomas declarados, incluido el castellano).
- Despliegue en producción mediante SGLang-Omni y vLLM-Omni con API compatible con `/v1/tts`.

## Casos de uso

- Audiolibros y narración de formato largo: el modelo trocea automáticamente el texto y permite streaming por fragmentos, lo que facilita narrar capítulos completos con voces consistentes y cambios de personaje mediante etiquetas de hablante.
- Doblaje y localización multilingüe: con soporte para más de 80 idiomas, incluido el castellano, se puede clonar la voz de un actor y generar versiones en distintos idiomas manteniendo el timbre, útil en pipelines de localización de vídeo.
- Producción de podcast y ficción sonora: las etiquetas de eventos (`[sighs]`, `[laughs]`) y el control multi-hablante permiten generar escenas dialogadas con expresividad sin necesidad de grabación en estudio.
- Edición de locuciones sin regrabar: mediante `previous_takes` se corrige una palabra o frase concreta (por ejemplo, cambiar "Wednesday" por "Thursday") conservando el resto de la toma y el contexto previo, lo que reduce costes de postproducción.
- Asistentes de voz y agentes conversacionales: la clonación de voz y el control en lenguaje natural permiten desplegar una voz de marca consistente en aplicaciones de atención al cliente o interfaces habladas, sirviéndose de SGLang-Omni o vLLM-Omni para servir a escala.
- Accesibilidad y lectura asistida: conversión de texto a voz de alta calidad para personas con discapacidad visual o dificultades lectoras, con capacidad de cambiar de voz según el contenido (diálogo, narración, citas).
- Prototipado de videojuegos y animación: generación rápida de líneas de diálogo para múltiples personajes con voces diferenciadas y control emocional, agilizando el bloqueo de escenas antes de la grabación final.

## Benchmarks y rendimiento

La model card incluye una tabla de rendimiento en producción medida sobre GPUs NVIDIA H200 con peticiones en streaming sobre prompts de Seed-TTS en inglés (temperatura 1.0, top_p 0.9, top_k 30, max_new_tokens 500), con métricas de throughput (frames acústicos por segundo), TTFA (tiempo hasta el primer audio) y RTF (tiempo desde la petición hasta el último fragmento dividido por la duración del audio devuelto). Sin embargo, los valores numéricos de dicha tabla no están disponibles en la información proporcionada.

La model card cita además resultados de Elo en la plataforma Artificial Analysis: primer puesto entre modelos de pesos abiertos en la categoría Provider Voice (#6 global, +38 Elo sobre la versión Preview) y primer puesto en pesos abiertos en Controlled Voice (+22 Elo sobre Preview). No se han publicado en la información disponible resultados de benchmarks académicos como MMLU, HumanEval o GSM8K, que además no aplican a un modelo TTS.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 24 GB en INT4, por lo que se necesita al menos esa cantidad de memoria, más overhead de activaciones y del decodificador de audio; se recomienda un mínimo de 24-32 GB de VRAM para despliegue real.
- GPU recomendadas: NVIDIA H200 (configuración usada para las mediciones de producción), A100 y H100 para servir a concurrencia; GPUs de 24 GB como RTX 4090 o RTX 3090 podrían alojar los pesos, aunque el rendimiento y la concurrencia serán limitados.
- Cabe en GPU de consumo: sí, en modelos con 24 GB o más de VRAM, siempre que se ajusten los parámetros de serving y el tamaño de lote.
- Opciones de despliegue: SGLang-Omni (`sgl-omni serve --model-path ...`) y vLLM-Omni (`vllm serve ... --omni`), ambos con API compatible con `/v1/tts`. No se mencionan soportes para llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput: medidos en H200 con streaming sobre Seed-TTS en inglés, pero los valores concretos de TTFA, RTF y frames por segundo no están disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Drama 3 INT4 (esta ficha) | 35B totales / 3B activos (6,86B en pesos INT4) | no disponible | >80 | fish-audio-research-license | safetensors |
| Fish Audio Drama 3 (original) | 35B totales / 3B activos | no disponible | >80 | fish-audio-research-license | safetensors (FP8/bf16) |
| Modelos TTS open-weight comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

La información proporcionada no incluye datos de otros modelos TTS de pesos abiertos con los que establecer una comparación cuantitativa fiable (parámetros, contexto, benchmarks). La comparación más directa disponible es con los pesos originales de Drama 3, de los que esta versión se diferencia por la cuantización INT4 y la actualización de pesos.

## Limitaciones y advertencias

- Licencia fish-audio-research-license: restringe el uso comercial; es imprescindible revisar el archivo LICENSE.md antes de cualquier despliegue en producción.
- Riesgo de alucinación acústica y de artefactos en la voz generada, especialmente en textos muy largos, idiomas de bajos recursos o referencias de clonación ruidosas.
- La clonación de voz plantea riesgos de suplantación de identidad y uso indebido; se recomienda aplicar marcas de agua, consentimiento explícito y controles de acceso.
- Sesgos potenciales en la calidad de síntesis según el idioma, el acento y el género de la voz de referencia, derivados de la distribución del dataset de entrenamiento (no disponible).
- La cuantización INT4 puede degradar ligeramente la fidelidad de la voz o la estabilidad en comparación con los pesos originales en FP8/bf16.
- No se dispone de información sobre la longitud de contexto, los datos de entrenamiento ni los resultados numéricos de benchmarks de producción, lo que limita la evaluación previa al despliegue.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria de esta versión cuantizada concreta.

## Enlaces

- HuggingFace (esta versión INT4): https://huggingface.co/shustov-te/drama-3-int4-2910-update
- Pesos originales de Drama 3: https://huggingface.co/fishaudio/drama-3
- Scripts de cuantización INT4: https://huggingface.co/akhaliq/drama-3-int4
- SGLang-Omni: https://sgl-project.github.io/sglang-omni/
- Drama 3 Cookbook (SGLang-Omni): https://sgl-project.github.io/sglang-omni/cookbook/fishaudio_drama3.html
- Repositorio SGLang-Omni: https://github.com/sgl-project/sglang-omni
- vLLM-Omni: https://github.com/vllm-project/vllm-omni
- Drama 3 vLLM-Omni Recipe: https://recipes.vllm.ai/fishaudio/drama-3
- Referencia de audio de clonación (en0): https://github.com/user-attachments/files/33393249/en0.wav
- Dataset Seed-TTS eval mini: https://huggingface.co/datasets/zhaochenyang20/seed-tts-eval-mini
- Paper referenciado en los tags (arXiv:2610.18010): https://arxiv.org/abs/2610.18010
