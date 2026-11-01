# dougmov/drama-3

## Resumen

Fish Audio Drama 3 es un modelo de síntesis de voz (text-to-speech) desarrollado por Fish Audio, orientado a la generación de escenas multi-personaje y contenido de formato largo. El modelo combina un backbone de texto de tipo Mixture-of-Experts (MoE) de 35.899.643.008 parámetros totales con aproximadamente 3.000 millones de parámetros activos por token, sobre una arquitectura híbrida de atención (full attention más linear attention). La salida de audio se produce mediante un decodificador acústico basado en codebooks con decodificación causal sobre la secuencia completa.

La relevancia de Drama 3 reside en su enfoque hacia la locución multi-hablante: un mismo texto puede etiquetarse con hasta 16 personajes distintos mediante etiquetas `<|speaker:0|>` a `<|speaker:15|>`, lo que permite generar diálogos con voces diferenciadas sin concatenar peticiones independientes. Además, incorpora clonación de voz a partir de una referencia corta, control en lenguaje natural y edición de audio por continuación, enviando tomas previas como contexto.

El modelo se publica bajo la licencia `fish-audio-research-license` y está disponible en HuggingFace con pesos en formato safetensors. Su despliegue en producción está soportado desde el lanzamiento por SGLang-Omni y vLLM-Omni, con cifras de rendimiento medidas en GPUs NVIDIA H200.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE de texto con atención híbrida (full + linear) y decodificador acústico de codebooks (Codebook-MTP) |
| Parametros totales | 35.899.643.008 |
| Parametros activos | Aproximadamente 3.000 millones por token |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8 para los expertos MoE; resto de pesos en bf16 |
| Idiomas soportados | 88 idiomas, entre ellos zh, en, ja, ko, es, pt, ar, ru, fr, de, sv, it, tr, no, nl, cy, eu, ca, da, gl, ta, hu, fi, pl, et, hi, la, ur, th, vi, jw, bn, yo, sl, cs, sw, nn, he, ms, uk, id, kk, bg, lv, my, tl, sk, ne, fa, af, el, bo, hr, ro, sn, mi, yi, am, be, km, is, az, sd, br, sq, ps, mn, ht, ml, sr, sa, te, ka, bs, pa, lt, kn, si, hy, mr, as, gu, fo |
| Licencia | fish-audio-research-license |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Drama 3 emplea un backbone de texto con arquitectura Mixture-of-Experts: 35.899.643.008 parámetros totales de los que aproximadamente 3.000 millones se activan por token. La atención es híbrida, combinando capas de atención completa con capas de atención linear, lo que reduce el coste computacional en secuencias largas. Los expertos MoE se almacenan en FP8, mientras que el resto de los pesos permanece en bf16, una decisión que reduce la huella de memoria sin degradar las partes sensibles del modelo.

La generación de audio se realiza con un decodificador acústico denominado Codebook-MTP, que decodifica 10 codebooks de forma causal sobre toda la secuencia. Esto permite que la síntesis se produzca de manera integrada con el modelado de texto, en lugar de depender de un vocoder separado. El modelo soporta etiquetas de hablante para hasta 16 personajes y trocea automáticamente textos largos, con posibilidad de streaming por fragmento. No se dispone de información detallada sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron etapas de RLHF o DPO.

## Capacidades

- Generación de voz multi-hablante: hasta 16 personajes diferenciados en un mismo texto mediante etiquetas `<|speaker:0|>` a `<|speaker:15|>`.
- Clonación de voz a partir de un clip de referencia corto con su transcripción (en el ejemplo de la model card, 3,9 segundos).
- Generación de habla emocional y control en lenguaje natural.
- Inserción de eventos paralingüísticos en el punto exacto del texto mediante etiquetas como `[sighs]` o `[laughs]`.
- Edición de audio por continuación: se envían las tomas previas como contexto y el modelo genera una nueva versión modificada, incluyendo ediciones encadenadas.
- Troceado automático de textos largos y streaming de audio por fragmento.
- Soporte multilingüe en 88 idiomas, incluyendo castellano, catalán, gallego y euskera.
- No se ha documentado soporte de tool calling, function calling ni razonamiento multi-paso, al tratarse de un modelo de síntesis de voz.

## Casos de uso

- Audiolibros y ficción con diálogo: el modelo puede asignar una voz distinta a cada personaje dentro de un mismo capítulo gracias a las 16 etiquetas de hablante, evitando la concatenación manual de clips y manteniendo coherencia de voz por personaje.
- Doblaje y localización de contenido: con 88 idiomas soportados y clonación de voz desde una referencia corta, permite generar versiones dobladas manteniendo el timbre del actor original en cada idioma.
- Producción de pódcasts y dramatizaciones: la generación multi-personaje y el control de eventos paralingüísticos permiten construir escenas conversacionales completas desde un guion etiquetado.
- Asistentes de voz y agentes conversacionales: la latencia de primera respuesta inferior a 100 ms en un solo stream y el RTF de 0,131 en H200 lo hacen apto para interacción en tiempo real.
- Postproducción y corrección de locuciones: la edición por continuación permite cambiar una palabra o frase de una toma existente enviando las tomas previas como contexto, sin regenerar todo el audio.
- Accesibilidad y lectura de contenido largo: el troceado automático y el streaming por fragmento permiten narrar documentos extensos de forma progresiva.
- Generación de voces para videojuegos y contenido interactivo: la clonación de voz y el control emocional permiten producir variantes de una misma línea con distintas entonaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (tipo MMLU, HumanEval o GSM8K, no aplicables a TTS) en la información disponible. La model card sí incluye métricas de rendimiento en producción medidas en NVIDIA H200 con peticiones en streaming sobre prompts en inglés de Seed-TTS, con clonación desde una referencia pre-codificada (`vq_codes` con transcripción) y parámetros `temperature` 1.0, `top_p` 0.9, `top_k` 30 y `max_new_tokens` 500:

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

- VRAM estimada para inferencia: el repositorio ocupa 41,5 GB, con expertos MoE en FP8 y el resto en bf16; se requiere al menos una GPU con 48 GB o más para cargar los pesos completos sin cuantización adicional.
- GPU recomendadas: NVIDIA H200, que es la plataforma sobre la que se midieron las cifras de rendimiento publicadas; por capacidad de memoria, también resultan adecuadas A100 de 80 GB, H100 de 80 GB y GPUs profesionales con 48 GB o más.
- No cabe en GPUs de consumo convencionales de 24 GB (RTX 4090) sin cuantización adicional no documentada por el autor.
- Opciones de despliegue: SGLang-Omni (`sgl-omni serve --model-path fishaudio/drama-3 --port 8000`) y vLLM-Omni (`vllm serve fishaudio/drama-3 --omni --port 8091`), ambos soportados desde el lanzamiento.
- Latencia y throughput: en una H200, TTFA p50 de 88,9 ms con concurrencia 1 y RTF medio de 0,131; con concurrencia 16 se mantiene la generación en tiempo real (RTF 0,373) con un throughput de 927,6 frames/s; con concurrencia 64 el RTF sube a 0,801.

## Comparativa con modelos similares

No se dispone de datos de otros modelos de síntesis de voz multi-hablante en la información proporcionada que permitan una comparación rigurosa de parámetros, contexto, rendimiento y licencia. Los modelos TTS habituales del ecosistema open source no publican métricas directamente equiparables a las de esta model card, por lo que la comparativa se considera no disponible.

## Limitaciones y advertencias

- La licencia `fish-audio-research-license` es una licencia de investigación; debe revisarse el archivo `LICENSE.md` antes de cualquier uso comercial, ya que puede restringirlo.
- No se documentan los datos de entrenamiento ni los sesgos conocidos del modelo; la clonación de voz puede reproducir sesgos acústicos presentes en las referencias proporcionadas.
- Riesgo de alucinación acústica y de pronunciación incorrecta en textos ambiguos, siglas o idiomas con pocos recursos dentro de los 88 declarados.
- La clonación de voz plantea riesgos de suplantación y uso indebido; es responsabilidad del desplegador aplicar consentimiento y controles.
- No se especifica la longitud de contexto del backbone de texto; el troceado automático mitiga textos largos, pero no se detalla el límite exacto.
- El rendimiento publicado se midió únicamente en inglés y en H200; el comportamiento en otros idiomas y en GPUs de menor capacidad puede diferir.
- El modelo está orientado exclusivamente a síntesis de voz: no soporta tool calling, agentes ni razonamiento multi-paso.

## Enlaces

- HuggingFace: https://huggingface.co/dougmov/drama-3
- Modelo de referencia del autor: https://huggingface.co/fishaudio/drama-3
- SGLang-Omni: https://sgl-project.github.io/sglang-omni/
- Cookbook de Drama 3 en SGLang-Omni: https://sgl-project.github.io/sglang-omni/cookbook/fishaudio_drama3.html
- Repositorio SGLang-Omni: https://github.com/sgl-project/sglang-omni
- Repositorio vLLM-Omni: https://github.com/vllm-project/vllm-omni
- Recipe de Drama 3 en vLLM-Omni: https://recipes.vllm.ai/fishaudio/drama-3
- Paper referenciado (arXiv:2610.18010): https://arxiv.org/abs/2610.18010
