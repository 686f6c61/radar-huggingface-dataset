# kaitemoreau/drama-3

## Resumen

Fish Audio Drama 3 es un modelo de síntesis de voz (text-to-speech) de nueva generación desarrollado por Fish Audio, diseñado específicamente para escenas con múltiples personajes y contenido de formato largo. A diferencia de los sistemas TTS convencionales orientados a una sola voz, Drama 3 permite generar hasta 16 hablantes distintos dentro de un mismo texto mediante etiquetas de hablante, además de ofrecer clonación de voz y control en lenguaje natural sobre el estilo y las emociones.

El modelo combina un backbone de texto de tipo Mezcla de Expertos (MoE) de 35.900 millones de parámetros totales con 3.000 millones activos por token, junto con un decodificador de audio basado en códecs (Codebook-MTP) que decodifica 10 codebooks de forma causal sobre toda la secuencia. Esta arquitectura permite mantener coherencia acústica y de identidad de voz a lo largo de fragmentos extensos, algo crítico en audiolibros, doblaje o ficción sonora.

Su relevancia actual radica en que traslada técnicas propias de los modelos de lenguaje de gran escala (MoE, atención híbrida, decodificación especulativa de audio) al dominio del TTS, con soporte de despliegue en producción desde el primer día mediante SGLang-Omni y vLLM-Omni. La licencia es de investigación (fish-audio-research-license), lo que condiciona su uso comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE con atención híbrida (full + linear); decodificador de audio Codebook-MTP |
| Parámetros totales | 35.899.643.008 (≈35,9 B) |
| Parámetros activos | 3 B por token |
| Longitud de contexto | no disponible |
| Tipos de cuantización | FP8 para los expertos MoE; resto de pesos en bf16 |
| Idiomas soportados | 80+ idiomas, entre ellos zh, en, ja, ko, es, pt, ar, ru, fr, de, sv, it, tr, no, nl, cy, eu, ca, da, gl, ta, hu, fi, pl, et, hi, la, ur, th, vi, jw, bn, yo, sl, cs, sw, nn, he, ms, uk, id, kk, bg, lv, my, tl, sk, ne, fa, af, el, bo, hr, ro, sn, mi, yi, am, be, km, is, az, sd, br, sq, ps, mn, ht, ml, sr, sa, te, ka, bs, pa, lt, kn, si, hy, mr, as, gu, fo |
| Licencia | fish-audio-research-license |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Drama 3 emplea un backbone de texto con arquitectura de mezcla de expertos (MoE) de 35,9 B de parámetros totales y 3 B activos por token, combinando atención completa y atención lineal (híbrida) para reducir el coste computacional en secuencias largas. Los expertos MoE se almacenan en FP8 mientras que el resto de pesos permanecen en bf16, una elección que reduce el tamaño del repositorio (41,5 GB) y acelera la inferencia en GPUs con soporte nativo de FP8.

La parte acústica se resuelve con un decodificador Codebook-MTP que genera 10 codebooks decodificados de forma causal a lo largo de toda la secuencia, en lugar de tratar el audio como una salida independiente por fragmento. Esto habilita funciones como la edición de audio por continuación (enviar tomas previas como contexto y solicitar una modificación) y el control fino de eventos paralingüísticos mediante etiquetas puntuales en el texto, como `[sighs]` o `[laughs]`. No se han publicado en la información disponible detalles sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF o DPO.

## Capacidades

- Generación de voz multi-hablante: hasta 16 personajes distintos en un mismo texto mediante etiquetas `<|speaker:0|>` a `<|speaker:15|>`.
- Clonación de voz a partir de un clip de referencia corto (el ejemplo de la model card usa una referencia de 3,9 s) con su transcripción.
- Control en lenguaje natural del estilo, la emoción y eventos paralingüísticos mediante etiquetas puntuales insertadas en el texto (`[sighs]`, `[laughs]`, etc.).
- Edición de audio por continuación: se envían tomas previas (`previous_takes`) y el modelo genera una nueva versión coherente con el contexto acústico anterior, permitiendo ediciones encadenadas.
- Procesamiento de texto largo con troceado automático y streaming por fragmentos.
- Generación de habla emocional y expresiva.
- Cobertura multilingüe amplia (más de 80 idiomas, incluidos español, catalán, gallego y euskera).
- No se documenta soporte de tool calling ni de razonamiento multi-paso; es un modelo especializado en TTS, no un LLM conversacional.

## Casos de uso

- Audiolibros y ficción sonora: el modelo puede narrar capítulos completos con varios personajes diferenciados gracias a las etiquetas de hablante y al troceado automático de texto largo, manteniendo la identidad de voz de cada personaje a lo largo de la obra.
- Doblaje y localización: con soporte de más de 80 idiomas y clonación de voz, permite generar versiones dobladas de un mismo contenido preservando el timbre del actor original y ajustando emoción por idioma.
- Producción de pódcasts y contenido editorial: la edición por continuación permite corregir una frase concreta (`by noon` → `by five`) sin regenerar todo el audio, lo que agiliza la posproducción de locuciones.
- Asistentes de voz y atención al cliente: la generación en streaming con TTFA inferior a 100 ms en una sola secuencia (medido en H200) permite respuestas de voz de baja latencia en sistemas interactivos multi-turno.
- Accesibilidad y lectura de textos: conversión de documentos largos a audio con control de emociones y pausas, útil para sistemas de lectura para personas con discapacidad visual.
- Videojuegos y experiencias interactivas: generación de diálogos para múltiples NPC con voces distintas y eventos paralingüísticos insertados dinámicamente según el guion.
- Prototipado rápido de voces en investigación: la licencia de investigación y el soporte en SGLang-Omni y vLLM-Omni facilitan experimentos académicos sobre TTS multi-hablante y edición de audio.

## Benchmarks y rendimiento

La model card no incluye resultados de benchmarks académicos (tipo Seed-TTS WER/SIM), pero sí mediciones de rendimiento en producción sobre NVIDIA H200 con peticiones en streaming y prompts en inglés de Seed-TTS (temperatura 1.0, top_p 0.9, top_k 30, max_new_tokens 500):

| Concurrencia | Throughput (frames/s) | TTFA p50 | TTFA p95 | RTF medio |
|---:|---:|---:|---:|---:|
| 1 | 166,7 | 88,9 ms | 90,8 ms | 0,131 |
| 2 | 287,0 | 96,2 ms | 130,1 ms | 0,152 |
| 4 | 467,6 | 108,2 ms | 156,4 ms | 0,186 |
| 8 | 678,1 | 153,2 ms | 210,9 ms | 0,256 |
| 16 | 927,6 | 210,1 ms | 287,2 ms | 0,373 |
| 32 | 1.244,7 | 304,6 ms | 396,1 ms | 0,551 |
| 64 | 1.687,3 | 450,9 ms | 1.020,1 ms | 0,801 |

No se han publicado resultados de benchmarks de calidad (WER, similitud de hablante, MOS) en la información disponible.

## Requisitos de hardware

- El repositorio ocupa 41,5 GB con expertos MoE en FP8 y resto en bf16; se necesita al menos esa cantidad de VRAM para cargar los pesos sin cuantización adicional.
- GPU recomendadas: NVIDIA H200 (mediciones oficiales de la model card) y, por capacidad de memoria, A100 80 GB o H100 80 GB. Una RTX 4090 de 24 GB no puede alojar el modelo completo sin cuantización adicional no documentada.
- No se documenta soporte de cuantizaciones GGUF ni ejecución en GPU de consumo; no disponible.
- Despliegue en producción: SGLang-Omni (`sgl-omni serve --model-path fishaudio/drama-3`) y vLLM-Omni (`vllm serve fishaudio/drama-3 --omni`).
- Latencia: TTFA p50 de 88,9 ms con concurrencia 1 y RTF medio de 0,131; con concurrencia 16 el RTF sube a 0,373 manteniendo generación más rápida que tiempo real.
- Throughput máximo medido: 1.687,3 frames/s con concurrencia 64 en una sola H200.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Despliegue |
|---|---|---|---|---|---|
| Fish Audio Drama 3 | 35,9 B totales / 3 B activos (MoE) | no disponible | 80+ | fish-audio-research-license | SGLang-Omni, vLLM-Omni |
| Alternativas de TTS multi-hablante de código abierto | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de datos verificables de modelos comparables de la misma categoría (TTS multi-hablante con clonación y edición) para establecer una comparación rigurosa de parámetros, contexto o rendimiento.

## Limitaciones y advertencias

- La licencia fish-audio-research-license restringe el uso comercial; es imprescindible revisar LICENSE.md antes de cualquier despliegue en producción.
- Riesgo de alucinación acústica y de artefactos en la clonación cuando la referencia es muy corta o de baja calidad; la model card usa referencias de ~3,9 s, pero no se documenta el mínimo recomendado.
- La clonación de voz plantea riesgos de suplantación de identidad y deepfakes; se requiere consentimiento explícito de la voz de referencia y cumplimiento normativo.
- No se han publicado métricas de sesgo por idioma ni de calidad por lengua; el soporte de 80+ idiomas no garantiza la misma calidad en todos ellos, especialmente en lenguas de bajos recursos como el euskera, el gallego o el catalán.
- El contexto máximo no está documentado, lo que dificulta planificar el troceado de textos muy largos.
- El modelo no es un LLM general: no soporta tool calling ni razonamiento multi-paso, por lo que no debe emplearse como sustituto de un asistente conversacional.
- El despliegue requiere GPUs de 80 GB o superior; no hay evidencia de ejecución viable en hardware de consumo.
- Con concurrencia alta (64), la latencia p95 de primer audio supera 1 segundo, lo que puede afectar a aplicaciones interactivas en tiempo real.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kaitemoreau/drama-3
- Repositorio SGLang-Omni: https://github.com/sgl-project/sglang-omni
- Documentación SGLang-Omni: https://sgl-project.github.io/sglang-omni/
- Cookbook de Drama 3 en SGLang-Omni: https://sgl-project.github.io/sglang-omni/cookbook/fishaudio_drama3.html
- Repositorio vLLM-Omni: https://github.com/vllm-project/vllm-omni
- Recipe de Drama 3 en vLLM-Omni: https://recipes.vllm.ai/fishaudio/drama-3
- Paper de referencia (arXiv): arxiv:2610.18010
- Dataset de evaluación Seed-TTS mini: https://huggingface.co/datasets/zhaochenyang20/seed-tts-eval-mini
